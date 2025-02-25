// Home Button
document.getElementById('home').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Back Button
document.getElementById('back').addEventListener('click', () => {
  window.history.back();
});

// Rating System
// const stars = document.querySelectorAll('.star');
// const averageRating = document.getElementById('average-rating');
// const totalRatings = document.getElementById('total-ratings');
// let ratings = [];

// stars.forEach(star => {
//   star.addEventListener('click', () => {
//     const value = parseInt(star.getAttribute('data-value'));
//     ratings.push(value);
//     updateRating();
//   });
// });

// function updateRating() {
//   const total = ratings.reduce((sum, value) => sum + value, 0);
//   const average = (total / ratings.length).toFixed(1);
//   averageRating.textContent = average;
//   totalRatings.textContent = ratings.length;

//   stars.forEach((star, index) => {
//     if (index < Math.round(average)) {
//       star.classList.add('active');
//     } else {
//       star.classList.remove('active');
//     }
//   });
// }

// Star Rating Functionality
const stars = document.querySelectorAll('.star');
const averageRating = document.getElementById('average-rating');
const totalRatings = document.getElementById('total-ratings');
const ratedMessage = document.getElementById('rated-message');

let currentRating = 0;
let totalRaters = 0;
let sumOfRatings = 0;

// Check if the user has already rated
const userRating = localStorage.getItem('userRating');

if (userRating) {
  // If the user has already rated, initialize the rating display
  currentRating = parseInt(userRating);
  sumOfRatings = currentRating;
  totalRaters = 1;
  updateRating();
  highlightStars(currentRating);
  ratedMessage.style.display = 'block'; // Show the rated message
}

// Add click event listeners to stars
stars.forEach((star) => {
  star.addEventListener('click', () => {
    const value = parseInt(star.getAttribute('data-value'));

    if (currentRating === value) {
      // If the user clicks the same star again, derate
      currentRating = 0;
      sumOfRatings -= value;
      totalRaters = 0;
      localStorage.removeItem('userRating');
      ratedMessage.style.display = 'none'; // Hide the rated message
    } else {
      // If the user clicks a different star, update the rating
      if (currentRating > 0) {
        sumOfRatings -= currentRating; // Remove the previous rating
      } else {
        totalRaters = 1; // Add a new rater
      }
      currentRating = value;
      sumOfRatings += value;
      localStorage.setItem('userRating', value);
      ratedMessage.style.display = 'block'; // Show the rated message
    }

    updateRating();
    highlightStars(currentRating);
  });
});

// Update the rating display
function updateRating() {
  const average = totalRaters > 0 ? (sumOfRatings / totalRaters).toFixed(1) : 0;
  averageRating.textContent = average;
  totalRatings.textContent = totalRaters;
}

// Highlight stars based on the selected rating
function highlightStars(value) {
  stars.forEach((star, index) => {
    if (index < value) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Message Button
document.getElementById('message-button').addEventListener('click', () => {
  alert('Message portal will open here.');
});
