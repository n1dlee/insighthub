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

        // Get the userId from the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        if (!userId) {
          console.error("User ID not found in URL. Cannot upload image.");
          alert("An error occurred. Please try again.");
          return;
        }

        try {
          const response = await fetch(
            `/api/user/${userId}/upload-profile-image`,
            {
              method: "POST",
              body: formData,
              credentials: "include", // Add this line to include cookies in the request
            }
          );

          if (response.ok) {
            alert("Image uploaded successfully!");
            window.location.reload();
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
