// Global control variables for Player 1 and Player 2
let player1Controls = {
  left: "a",
  right: "d",
  up: "w",
  down: "s",
  jump: "c",
  shoot: "v",
};

let player2Controls = {
  left: "k",
  right: ";",
  up: "o",
  down: "l",
  jump: "down",
  shoot: "left",
};

/**
 * Loads player controls from localStorage and updates the global control variables.
 * If no control is stored, the function will use the default controls.
 *
 * @returns {void} This function does not return a value.
 */
function loadPlayerControls() {
  const controls = ["up", "down", "left", "right", "jump", "shoot"];

  controls.forEach((control) => {
    // Load Player 1 controls from localStorage or use the current defaults
    const player1Key = localStorage.getItem(`control-player1-${control}`);
    if (player1Key) {
      player1Controls[control] = player1Key;
    }

    // Load Player 2 controls from localStorage or use the current defaults
    const player2Key = localStorage.getItem(`control-player2-${control}`);
    if (player2Key) {
      player2Controls[control] = player2Key;
    }
  });
}

export { player1Controls, player2Controls, loadPlayerControls };
