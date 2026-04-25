import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

// Cache news for 5 minutes via Next.js fetch cache
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const category = req.nextUrl.searchParams.get("category") ?? "general";
  const apiKey   = process.env.NEWS_API_KEY;

  if (!apiKey) return apiError("News service not configured", 503);

  try {
    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.set("country",  "us");
    url.searchParams.set("category", category);
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("apiKey",   apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },  // Next.js cache — 5 min
    });

    if (!res.ok) return apiError("Failed to fetch news", 502);

    const data = await res.json() as { articles?: unknown[] };
    return apiOk({ articles: data.articles ?? [] });
  } catch {
    return apiError("News service unavailable", 503);
  }
}
