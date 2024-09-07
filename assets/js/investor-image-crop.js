document.addEventListener("DOMContentLoaded", async () => {
  const profileImageInput = document.getElementById("profileImage");
  const imagePreviewContainer = document.getElementById(
    "image-preview-container"
  );
  const imagePreview = document.getElementById("image-preview");
  let cropper;

  profileImageInput.addEventListener("change", handleImageUpload);

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreviewContainer.style.display = "block";

      // Initialize Cropper.js after image is loaded
      cropper = new Cropper(imagePreview, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        scalable: true,
        zoomable: true,
      });
    };
    reader.readAsDataURL(file);
  }

  document.getElementById("crop-button").addEventListener("click", async () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        width: 256,
        height: 256,
      });

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("profileImage", blob, "profile.png");

        // Get the investorId from the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const investorId = urlParams.get("id");

        if (!investorId) {
          console.error("Investor ID not found in URL. Cannot upload image.");
          alert("An error occurred. Please try again.");
          return;
        }

        try {
          const response = await fetch(
            `/api/investor/${investorId}/upload-investor-image`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
            }
          );

          if (response.ok) {
            alert("Image uploaded successfully!");
            // Redirect to the investor profile page
            window.location.href = `/investor-profile?id=${investorId}`;
          } else {
            console.error("Image upload failed:", response.statusText);
            alert("Failed to upload image. Please try again.");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("An error occurred while uploading the image.");
        }
      }, "image/png");
    }
  });
});
