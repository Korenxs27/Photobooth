const video = document.getElementById("video");
const countdownElement = document.getElementById("countdown");
const captureButton = document.getElementById("capture");
const resetButton = document.getElementById("reset");
const downloadButton = document.getElementById("download");
const frameColorInput = document.getElementById("frameColor");
const gallery = document.getElementById("gallery");

let images = [];
let countdown;

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing the camera: ", err);
  });

captureButton.addEventListener("click", () => {
  if (images.length < 3) {
    startCountdown();
  } else {
    alert("You can only take 3 photos.");
  }
});

resetButton.addEventListener("click", () => {
  images = [];
  gallery.innerHTML = "";
});

downloadButton.addEventListener("click", () => {
  if (images.length === 3) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size based on the images
    const imgWidth = images[0].width; // Width of the first image
    const imgHeight = images[0].height; // Height of the first image
    const spacing = 10; // Spacing between images
    const watermarkMargin = 80; // Jarak antara gambar dan watermark
    canvas.width = imgWidth + 40; // Add some padding
    canvas.height =
      (imgHeight + spacing) * images.length + 20 + watermarkMargin; // Total height for all images + watermark margin

    const frameColor = frameColorInput.value;
    const borderRadius = 30; // Border radius in percentage

    // Draw frame background with border radius
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, borderRadius);
    ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, borderRadius);
    ctx.arcTo(0, canvas.height, 0, 0, borderRadius);
    ctx.arcTo(0, 0, canvas.width, 0, borderRadius);
    ctx.closePath();
    ctx.fillStyle = frameColor;
    ctx.fill();

    // Draw images with border radius and centered horizontally
    images.forEach((img, index) => {
      const x = (canvas.width - img.width) / 2; // Center the image horizontally
      const y = index * (img.height + spacing) + 10; // Stack images vertically with spacing

      // Create a rounded rectangle path for the image
      ctx.beginPath();
      ctx.moveTo(x + borderRadius, y);
      ctx.arcTo(x + img.width, y, x + img.width, y + img.height, borderRadius);
      ctx.arcTo(x + img.width, y + img.height, x, y + img.height, borderRadius);
      ctx.arcTo(x, y + img.height, x, y, borderRadius);
      ctx.arcTo(x, y, x + img.width, y, borderRadius);
      ctx.closePath();

      // Clip the image to the rounded rectangle path
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, x, y, img.width, img.height);
      ctx.restore();
    });

    // Add watermark and date
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Semi-transparent white
    ctx.textAlign = "center";

    // Watermark text (bold)
    ctx.font = "bold 30px Times New Roman";
    const watermarkText = "Photobooth";
    ctx.fillText(
      watermarkText,
      canvas.width / 2,
      canvas.height - watermarkMargin
    );

    // Date text (bold)
    ctx.font = "bold 20px Times New Roman";
    const currentDate = new Date().toLocaleDateString(); // Get current date
    ctx.fillText(
      currentDate,
      canvas.width / 2,
      canvas.height - (watermarkMargin - 20)
    );

    // Download the final image
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "photobooth.png";
    link.click();
  } else {
    alert("Please take 3 photos before downloading.");
  }
});

frameColorInput.addEventListener("input", () => {
  const frameColor = frameColorInput.value;
  gallery.querySelectorAll("img").forEach((img) => {
    img.style.borderColor = frameColor;
  });
});

function startCountdown() {
  let count = 3;
  countdownElement.textContent = count;
  countdownElement.style.display = "block";

  countdown = setInterval(() => {
    count--;
    countdownElement.textContent = count;

    if (count === 0) {
      clearInterval(countdown);
      countdownElement.style.display = "none";
      captureImage();
    }
  }, 1000);
}

function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.src = canvas.toDataURL("image/png");
  img.onload = () => {
    images.push(img);
    updateGallery();
  };
}

function updateGallery() {
  gallery.innerHTML = "";
  images.forEach((img) => {
    const imgElement = document.createElement("img");
    imgElement.src = img.src;
    imgElement.style.borderColor = frameColorInput.value;
    gallery.appendChild(imgElement);
  });
}
