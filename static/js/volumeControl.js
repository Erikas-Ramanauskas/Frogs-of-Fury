// Load the global volume from local storage on page load
function loadGlobalVolume() {
  const savedVolume = localStorage.getItem("globalVolume");
  return savedVolume !== null ? parseFloat(savedVolume) : 0.5; // Default volume is 50% if not set
}

// Initialize the slider with the current volume
const volumeSlider = document.getElementById("volumeSlider");
const volumeValueDisplay = document.getElementById("volumeValue");
let GLOBAL_VOLUME = loadGlobalVolume();
volumeSlider.value = GLOBAL_VOLUME * 100;
volumeValueDisplay.textContent = Math.round(GLOBAL_VOLUME * 100);

// Update the display and global volume when the slider is moved
volumeSlider.addEventListener("input", () => {
  GLOBAL_VOLUME = volumeSlider.value / 100;
  volumeValueDisplay.textContent = Math.round(GLOBAL_VOLUME * 100);
});

// Save the volume to local storage when the save button is clicked
document.getElementById("saveButton").addEventListener("click", () => {
  localStorage.setItem("globalVolume", GLOBAL_VOLUME);
  alert(`Volume set to ${Math.round(GLOBAL_VOLUME * 100)}% and saved!`);
});
