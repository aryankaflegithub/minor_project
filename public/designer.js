// Handle Profile Editing
const editProfileBtn = document.getElementById('edit-profile');
const modal = document.getElementById('edit-modal');
const closeModal = document.querySelector('.close');
const saveProfileBtn = document.getElementById('save-profile');
const editName = document.getElementById('edit-name');
const editBio = document.getElementById('edit-bio');
const profileName = document.getElementById('profile-name');
const profileBio = document.getElementById('profile-bio');
const uploadPhoto = document.getElementById('upload-photo');
const profileImg = document.getElementById('profile-img');

// Open Modal
editProfileBtn.addEventListener('click', () => {
  editName.value = profileName.textContent;
  editBio.value = profileBio.textContent;
  modal.style.display = 'flex';
});

function generateImage() {
  alert('Generating image...');
  let prompt = document.getElementById('prompt').value;

  fetch('/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
  })
  .then(response => response.json())
  .then(data => {
      if (data.imageUrl) {
          document.getElementById('generated-image').innerHTML = `<img src="${data.imageUrl}" alt="Generated Image">`;
      } else {
          alert('Failed to generate image');
      }
  })
  .catch(error => console.error('Error:', error));
}

// Close Modal
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Save Profile Changes
saveProfileBtn.addEventListener('click', () => {
  profileName.textContent = editName.value;
  profileBio.textContent = editBio.value;
  localStorage.setItem('profileName', editName.value);
  localStorage.setItem('profileBio', editBio.value);
  modal.style.display = 'none';
});

// Load Saved Profile Data
window.addEventListener('load', () => {
  if (localStorage.getItem('profileName')) {
    profileName.textContent = localStorage.getItem('profileName');
  }
  if (localStorage.getItem('profileBio')) {
    profileBio.textContent = localStorage.getItem('profileBio');
  }
  if (localStorage.getItem('profileImg')) {
    profileImg.src = localStorage.getItem('profileImg');
  }
});

// Handle Profile Picture Upload
uploadPhoto.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profileImg.src = e.target.result;
      localStorage.setItem('profileImg', e.target.result);
    };
    reader.readAsDataURL(file);
  }
});


// Upload Work Functionality
const fileInput = document.getElementById('file-input');
const gallery = document.getElementById('gallery');

fileInput.addEventListener('change', (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgData = e.target.result;
      saveUpload(imgData); // Save the image to localStorage
    };
    reader.readAsDataURL(file);
  }
});

// Save Upload to localStorage
function saveUpload(imgData) {
  let uploads = JSON.parse(localStorage.getItem('uploads')) || [];
  uploads.push(imgData);
  localStorage.setItem('uploads', JSON.stringify(uploads));
  displayImage(imgData); // Display the image in the gallery
}

// Load Uploads from localStorage
// function loadUploads() {
//   const uploads = JSON.parse(localStorage.getItem('uploads')) || [];
//   uploads.forEach((upload) => {
//     displayImage(upload); // Display each image in the gallery
//   });
// }
function loadUploads() {
    const uploads = JSON.parse(localStorage.getItem('uploads')) || [];
    gallery.innerHTML = ''; // Clear the gallery before reloading
  
    uploads.forEach((upload) => {
      displayImage(upload); // Display each image in the gallery
    });
  }
  
// Display Image in Gallery
function displayImage(imgData) {
  const imgContainer = document.createElement('div');
  imgContainer.className = 'image-container';

  const img = document.createElement('img');
  img.src = imgData;
  img.alt = 'Uploaded Work';

  // Open image in lightbox when clicked
  img.addEventListener('click', () => openModal(imgData));

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'Delete';
  deleteBtn.onclick = () => deleteImage(imgData);

  imgContainer.appendChild(img);
  imgContainer.appendChild(deleteBtn);
  gallery.appendChild(imgContainer);
}

// Delete Image from Gallery and localStorage
// function deleteImage(imgData) {
//   let uploads = JSON.parse(localStorage.getItem('uploads')) || [];
//   uploads = uploads.filter((upload) => upload !== imgData);
//   localStorage.setItem('uploads', JSON.stringify(uploads));
// //   loadUploads(); // Reload the gallery
// }
function deleteImage(imgData) {
    // Remove the image from localStorage
    let uploads = JSON.parse(localStorage.getItem('uploads')) || [];
    uploads = uploads.filter((upload) => upload !== imgData); // Remove the selected image
    localStorage.setItem('uploads', JSON.stringify(uploads));
  
    // Remove the image from the gallery (DOM)
    const imgContainers = document.querySelectorAll('.image-container');
    imgContainers.forEach(container => {
      const img = container.querySelector('img');
      if (img.src === imgData) {
        container.remove(); // Remove the image container from the gallery
      }
    });
  }
  

// Lightbox Modal Functionality
const lightboxModal = document.getElementById('lightbox-modal');
const modalImg = document.getElementById('modal-image');
const lightboxClose = document.querySelector('#lightbox-modal .close');

// Open Lightbox Modal
// function openModal(imgSrc) {
//   lightboxModal.style.display = 'flex';
//   modalImg.src = imgSrc;
// }
// Open Lightbox Modal
// Open Lightbox Modal
function openModal(imgSrc) {
    lightboxModal.style.display = 'flex';
    modalImg.src = imgSrc;  // Set the image source to the one clicked on
  }
  
// Close Lightbox Modal
lightboxClose.addEventListener('click', () => {
  lightboxModal.style.display = 'none';
});

// Close Lightbox Modal when clicking outside the image
window.addEventListener('click', (event) => {
  if (event.target === lightboxModal) {
    lightboxModal.style.display = 'none';
  }
});

// Load Uploads on Page Load
window.addEventListener('load', loadUploads);