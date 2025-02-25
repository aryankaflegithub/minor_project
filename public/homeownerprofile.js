

function generateImage() {
  const prompt = document.getElementById('text-prompt').value;
  if (prompt.trim() === "") {
      alert("Please enter a text prompt!");
      return;
  }

  // Placeholder for image generation (replace with actual API call)
  const generatedImage = document.getElementById('generated-image');
  generatedImage.innerHTML = `<img src="https://via.placeholder.com/300" alt="Generated Image">`;
  alert("Image generated based on prompt: " + prompt);
}

// Function to toggle filter options
function toggleFilter() {
  const filterOptions = document.getElementById('filter-options');
  if (filterOptions.style.display === 'none' || filterOptions.style.display === '') {
    filterOptions.style.display = 'block';
  } else {
    filterOptions.style.display = 'none';
  }
}