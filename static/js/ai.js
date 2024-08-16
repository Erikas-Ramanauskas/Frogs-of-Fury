// ai.js

// Variables to control AI movement direction and timing
let moveRight = true;
let lastSwitchTime = 0;
const switchInterval = 1000; // Time in milliseconds to switch direction

// Example AI implementation for player2
export function aiControlPlayer2(player2) {
  console.log('aiControlPlayer2 function is called'); // Log message to confirm function call

  const currentTime = Date.now();

  // Check if it's time to switch direction
  if (currentTime - lastSwitchTime > switchInterval) {
    moveRight = !moveRight; // Toggle direction
    lastSwitchTime = currentTime; // Update the last switch time
  }

  // Move player2 based on the current direction
  if (moveRight) {
    player2.move(120, 0); // Move right
    player2.flipX = false;
  } else {
    player2.move(-120, 0); // Move left
    player2.flipX = true;
  }

  // Ensure the player is grounded and update animation
  if (player2.isGrounded()) {
    player2.play("run");
  }
}
