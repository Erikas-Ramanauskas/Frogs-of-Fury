import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";
// start kaplay

import { player1Controls, player2Controls, loadPlayerControls } from "./controlKeys.js";

// This function loads controls from localStorage and updates the global control variables.
loadPlayerControls();

// Function to start the game with the selected number of players
function startGame(players) {
  kaplay({
    scale: 4,
    font: "monospace",
  });

  const SPEED = 120;
  const JUMP_FORCE = 240;
  setGravity(640);

  // Loading a multi-frame sprite
  loadSprite("dino", "../static/sprites/dino.png", {
    sliceX: 9,
    anims: {
      idle: { from: 0, to: 3, speed: 5, loop: true },
      run: { from: 4, to: 7, speed: 10, loop: true },
      jump: 8,
    },
  });
  loadSprite("bullet", "../static/sprites/bullet2.png");

  // Function to spawn a bullet in a given direction
  function spawnBullet(player, dir) {
    const BULLET_SPEED = 300;
    add([
      sprite("bullet"), // Replace with your bullet sprite
      pos(player.pos), // Spawn the bullet at the player's position
      move(dir, BULLET_SPEED), // Move the bullet in the specified direction
      area(),
      "bullet",
    ]);
  }

  // Define the direction vectors for 8-way shooting
  const DIR_VECTORS = {
    left: vec2(-1, 0),
    right: vec2(1, 0),
    up: vec2(0, -1),
    down: vec2(0, 1),
    left_up: vec2(-1, -1).unit(),
    left_down: vec2(-1, 1).unit(),
    right_up: vec2(1, -1).unit(),
    right_down: vec2(1, 1).unit(),
  };

  // Add our player1 character
  const player1 = add([sprite("dino"), pos(120, 80), anchor("center"), area(), body()]);
  player1.play("idle");
  let player1LastDir = DIR_VECTORS.up;
  let player2LastDir = DIR_VECTORS.up;

  // Add a platform
  add([rect(width(), 24), area(), outline(1), pos(0, height() - 10), body({ isStatic: true })]);

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

  // Track the last direction Player 1 was facing
  function updatePlayer1LastDir() {
    if (isKeyDown(player1Controls.left) && isKeyDown(player1Controls.up)) {
      player1LastDir = DIR_VECTORS.left_up;
    } else if (isKeyDown(player1Controls.left) && isKeyDown(player1Controls.down)) {
      player1LastDir = DIR_VECTORS.left_down;
    } else if (isKeyDown(player1Controls.right) && isKeyDown(player1Controls.up)) {
      player1LastDir = DIR_VECTORS.right_up;
    } else if (isKeyDown(player1Controls.right) && isKeyDown(player1Controls.down)) {
      player1LastDir = DIR_VECTORS.right_down;
    } else if (isKeyDown(player1Controls.left)) {
      player1LastDir = DIR_VECTORS.left;
    } else if (isKeyDown(player1Controls.right)) {
      player1LastDir = DIR_VECTORS.right;
    } else if (isKeyDown(player1Controls.up)) {
      player1LastDir = DIR_VECTORS.up;
    } else if (isKeyDown(player1Controls.down)) {
      player1LastDir = DIR_VECTORS.down;
    }
  }

  function updatePlayer2LastDir() {
    if (isKeyDown(player2Controls.left) && isKeyDown(player2Controls.up)) {
      player2LastDir = DIR_VECTORS.left_up;
    } else if (isKeyDown(player2Controls.left) && isKeyDown(player2Controls.down)) {
      player2LastDir = DIR_VECTORS.left_down;
    } else if (isKeyDown(player2Controls.right) && isKeyDown(player2Controls.up)) {
      player2LastDir = DIR_VECTORS.right_up;
    } else if (isKeyDown(player2Controls.right) && isKeyDown(player2Controls.down)) {
      player2LastDir = DIR_VECTORS.right_down;
    } else if (isKeyDown(player2Controls.left)) {
      player2LastDir = DIR_VECTORS.left;
    } else if (isKeyDown(player2Controls.right)) {
      player2LastDir = DIR_VECTORS.right;
    } else if (isKeyDown(player2Controls.up)) {
      player2LastDir = DIR_VECTORS.up;
    } else if (isKeyDown(player2Controls.down)) {
      player2LastDir = DIR_VECTORS.down;
    }
  }

  onKeyPress(player1Controls.shoot, () => {
    spawnBullet(player1, player1LastDir); // Shoot in the last direction the player was facing
  });

  // If 2 players, add the second player
  if (players === 2) {
    const player2 = add([sprite("dino"), pos(180, 80), anchor("center"), area(), body()]);
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
    // Track the last direction Player 2 was facing

    onKeyPress(player2Controls.shoot, () => {
      spawnBullet(player2, player2LastDir); // Shoot in the last direction the player was facing
    });
  }

  onUpdate(() => {
    updatePlayer1LastDir();
    if (players === 2) {
      updatePlayer2LastDir();
    }
  });
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
