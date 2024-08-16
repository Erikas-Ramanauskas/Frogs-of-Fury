import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";
// start kaplay

import { player1Controls, player2Controls, loadPlayerControls } from "./controlKeys.js";
import { aiControlPlayer2 } from './ai.js';

// This function loads controls from localStorage and updates the global control variables.
loadPlayerControls();

// Function to start the game with the selected number of players
function startGame(players) {
  kaplay({
    scale: 4,
    font: "monospace",
  });

  // Loading a multi-frame sprite
  loadSprite("dino", "../static/sprites/dino.png", {
    sliceX: 9,
    anims: {
      idle: { from: 0, to: 3, speed: 5, loop: true },
      run: { from: 4, to: 7, speed: 10, loop: true },
      jump: 8,
    },
  });

  const SPEED = 120;
  const JUMP_FORCE = 240;

  setGravity(640);

  // Add our player1 character
  const player1 = add([sprite("dino"), pos(120, 80), anchor("center"), area(), body()]);

  player1.play("idle");

  // Add a platform
  add([rect(width(), 24), area(), outline(1), pos(0, height() - 24), body({ isStatic: true })]);

  // Switch to "idle" or "run" animation when player1 hits ground
  player1.onGround(() => {
    if (!isKeyDown(player1Controls.left) && !isKeyDown(player1Controls.right)) {
      player1.play("idle");
    } else {
      player1.play("run");
    }
  });

  onKeyPress(player1Controls.jump, (key) => {
    if (player1.isGrounded()) {
      player1.jump(JUMP_FORCE);
      player1.play("jump");
    }
  });

  onKeyDown(player1Controls.left, () => {
    player1.move(-SPEED, 0);
    player1.flipX = true;
    if (player1.isGrounded() && player1.curAnim() !== "run") {
      player1.play("run");
    }
  });

  onKeyDown(player1Controls.right, () => {
    player1.move(SPEED, 0);
    player1.flipX = false;
    if (player1.isGrounded() && player1.curAnim() !== "run") {
      player1.play("run");
    }
  });

  [player1Controls.left, player1Controls.right].forEach((key) => {
    onKeyRelease(key, () => {
      if (player1.isGrounded() && !isKeyDown(player1Controls.left) && !isKeyDown(player1Controls.right)) {
        player1.play("idle");
      }
    });
  });

  const getInfo1 = () => `Anim: ${player1.curAnim()} Frame: ${player1.frame}`.trim();

  // Add some text to show the current animation
  const label = add([text(getInfo1(), { size: 12 }), color(0, 0, 0), pos(4)]);

  label.onUpdate(() => {
    label.text = getInfo1();
  });

  let player2;

  // If 2 players, add the second player
  if (players === 2) {
    player2 = add([sprite("dino"), pos(180, 80), anchor("center"), area(), body()]);
    player2.play("idle");

    player2.onGround(() => {
      if (!isKeyDown(player2Controls.left) && !isKeyDown(player2Controls.right)) {
        player2.play("idle");
      } else {
        player2.play("run");
      }
    });

    onKeyPress(player2Controls.jump, () => {
      if (player2.isGrounded()) {
        player2.jump(JUMP_FORCE);
        player2.play("jump");
      }
    });

    onKeyDown(player2Controls.left, () => {
      player2.move(-SPEED, 0);
      player2.flipX = true;
      if (player2.isGrounded() && player2.curAnim() !== "run") {
        player2.play("run");
      }
    });

    onKeyDown(player2Controls.right, () => {
      player2.move(SPEED, 0);
      player2.flipX = false;
      if (player2.isGrounded() && player2.curAnim() !== "run") {
        player2.play("run");
      }
    });

    [player2Controls.left, player2Controls.right].forEach((key) => {
      onKeyRelease(key, () => {
        if (player2.isGrounded() && !isKeyDown(player2Controls.left) && !isKeyDown(player2Controls.right)) {
          player2.play("idle");
        }
      });
    });
  }

  // Custom game loop using requestAnimationFrame
  function gameLoop() {
    if (players === 2 && player2) {
      aiControlPlayer2(player2); // Call AI function for player2
    }
    requestAnimationFrame(gameLoop); // Schedule the next frame
  }

  // Start the game loop
  gameLoop();
}

// Show the modal on page load
window.addEventListener("DOMContentLoaded", () => {
  const playerSelectModal = new bootstrap.Modal(document.getElementById("playerSelectModal"));
  playerSelectModal.show();

  document.getElementById("onePlayerBtn").addEventListener("click", () => {
    playerSelectModal.hide();
    startGame(1);
  });

  document.getElementById("twoPlayersBtn").addEventListener("click", () => {
    playerSelectModal.hide();
    startGame(2);
  });
});
