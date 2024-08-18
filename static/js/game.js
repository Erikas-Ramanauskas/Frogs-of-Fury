import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";
// start kaplay

import { player1Controls, player2Controls, loadPlayerControls } from "./controlKeys.js";

// This function loads controls from localStorage and updates the global control variables.
loadPlayerControls();

kaplay({
  scale: 4,
  font: "monospace",
  debug: true,
  width: 500,
  height: 250,
  letterbox: true,
});

const SPEED = 120;
const JUMP_FORCE = 240;
setGravity(640);

// Loading a multi-frame sprite
loadSprite("frog1", "../static/sprites/player_1_sprite.png", {
  sliceX: 7,
  sliceY: 4,

  anims: {
    idle: 5,
    run: { from: 19, to: 22, speed: 10, loop: true },
    jump: { from: 7, to: 10, speed: 20, loop: true },
    shoot: { from: 5, to: 4, speed: 10, loop: false }, // Example shoot animation
    shoot45upRun: { from: 15, to: 18, speed: 10, loop: true },
    shoot45upIdle: { from: 15, to: 18, speed: 10, loop: true },
    shootUp: { from: 0, to: 1, speed: 10, loop: true },
    shoot45downRun: { from: 11, to: 14, speed: 10, loop: true },
    shoot45downIdle: { from: 2, to: 3, speed: 10, loop: true },
  },
});

loadSprite("frog2", "../static/sprites/player_2_sprite.png", {
  sliceX: 7,
  sliceY: 4,

  anims: {
    idle: 5,
    run: { from: 19, to: 22, speed: 10, loop: true },
    jump: { from: 7, to: 10, speed: 20, loop: true },
    shoot: { from: 5, to: 4, speed: 10, loop: false }, // Example shoot animation
    shoot45upRun: { from: 15, to: 18, speed: 10, loop: true },
    shoot45upIdle: { from: 15, to: 18, speed: 10, loop: true },
    shootUp: { from: 0, to: 1, speed: 10, loop: true },
    shoot45downRun: { from: 11, to: 14, speed: 10, loop: true },
    shoot45downIdle: { from: 2, to: 3, speed: 10, loop: true },
  },
});

loadSprite("bullet", "../static/sprites/bullet.png");
loadSprite("bullet_split", "../static/sprites/bullet_split.png");
loadSprite("bullet_laser", "../static/sprites/bullet_laser.png");
loadSprite("bullet_rocket", "../static/sprites/bullet_rocket.png");

loadSprite("pickup_laser", "../static/sprites/pickup_laser.png");
loadSprite("pickup_split", "../static/sprites/pickup_split.png");
loadSprite("pickup_rocket", "../static/sprites/pickup_rocket.png");

// Define weapon types
const WEAPONS = {
  standard: { speed: 300, bulletSprite: "bullet", damage: 1, fireRate: 600, collisionArea: [4, 4] }, // 300 shots per minute (1 per second)
  split: {
    speed: 300,
    pickupSprite: "pickup_split",
    bulletSprite: "bullet_split",
    damage: 2,
    fireRate: 300,
    collisionArea: [10, 10],
  },
  laser: {
    speed: 600,
    pickupSprite: "pickup_laser",
    bulletSprite: "bullet_laser",
    damage: 2,
    fireRate: 400,
    collisionArea: [15, 3],
  },
  rocket: {
    speed: 200,
    pickupSprite: "pickup_rocket",
    bulletSprite: "bullet_rocket",
    damage: 4,
    fireRate: 100,
    collisionArea: [23, 9],
    explosionArea: 50,
  },
};

// Track the current weapon for each player
let player1Weapon = WEAPONS.standard;
let player2Weapon = WEAPONS.standard;
let lastFireTimePlayer1 = 0;
let lastFireTimePlayer2 = 0;
let isPlayer1Shooting = false;
let isPlayer2Shooting = false;

// Function to switch the player's active weapon
function switchWeapon(player, newWeapon) {
  if (player === 1) {
    player1Weapon = WEAPONS[newWeapon];
  } else if (player === 2) {
    player2Weapon = WEAPONS[newWeapon];
  }
}

function canFire(lastFireTime, fireRate) {
  const cooldown = 60 / fireRate; // Convert fire rate to cooldown in seconds
  return time() - lastFireTime >= cooldown;
}

// Define the direction vectors for 8-way shooting
const DIR_VECTORS = {
  left: { vect: vec2(-1, 0), direction: "left" },
  right: { vect: vec2(1, 0), direction: "right" },
  up: { vect: vec2(0, -1), direction: "up" },
  down: { vect: vec2(0, 1), direction: "down" },
  left_up: { vect: vec2(-1, -1).unit(), direction: "left_up" },
  left_down: { vect: vec2(-1, 1).unit(), direction: "left_down" },
  right_up: { vect: vec2(1, -1).unit(), direction: "right_up" },
  right_down: { vect: vec2(1, 1).unit(), direction: "right_down" },
};

let player1LastDir = DIR_VECTORS.right;
let player2LastDir = DIR_VECTORS.left;

// Add our player1 character
const player1 = add([sprite("frog1"), pos(120, 80), anchor("center"), area(), body(), scale(0.5), "player1"]);
player1.play("idle");

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

onKeyPress(player1Controls.jump, () => {
  if (player1.isGrounded()) {
    player1.jump(JUMP_FORCE);
    player1.play("jump");
  }
});

onKeyDown(player1Controls.right, () => {
  player1.move(SPEED, 0);
  player1.flipX = false;
  if (player1.isGrounded() && !isPlayer1Shooting && player1.curAnim() !== "run") {
    player1.play("run");
  }
});

onKeyDown(player1Controls.left, () => {
  player1.move(-SPEED, 0);
  player1.flipX = true;
  if (player1.isGrounded() && !isPlayer1Shooting && player1.curAnim() !== "run") {
    player1.play("run");
  }
});

[player1Controls.left, player1Controls.right].forEach((key) => {
  onKeyRelease(key, () => {
    if (
      player1.isGrounded() &&
      !isKeyDown(player1Controls.left) &&
      !isKeyDown(player1Controls.right) &&
      !isKeyDown(player1Controls.shoots)
    ) {
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
  }
}

onKeyPress(player1Controls.shoot, () => {
  if (canFire(lastFireTimePlayer1, player1Weapon.fireRate)) {
    spawnBullet(player1, player1LastDir.vect);
    isPlayer1Shooting = true;

    // Play the appropriate shooting animation based on the direction
    if (isKeyDown(player1Controls.left) || isKeyDown(player1Controls.right)) {
      switch (player1LastDir.direction) {
        case "left_up":
        case "right_up":
          player1.play("shoot45upRun");
          break;
        case "left_down":
        case "right_down":
          player1.play("shoot45downRun");
          break;
        default:
          player1.play("run"); // Continue running animation if not in a 45-degree angle
      }
    } else {
      switch (player1LastDir.direction) {
        case "up":
          player1.play("shootUp");
          break;
        case "left_up":
        case "right_up":
          player1.play("shoot45upIdle");
          break;
        case "left_down":
        case "right_down":
          player1.play("shoot45downIdle");
          break;
        default:
          player1.play("shoot");
      }
    }

    lastFireTimePlayer1 = time();

    // Reset the shooting flag after a short delay (based on animation length or a fixed time)
    wait(1, () => {
      isPlayer1Shooting = false;
    });
  }
});

let player2;
// If 2 players, add the second player
function addPlayer2() {
  player2 = add([sprite("frog2"), pos(180, 80), anchor("center"), area(), body(), scale(0.5), "player2"]);
  player2.play("idle");

  player2.onGround(() => {
    if (!isKeyDown(player2Controls.left) && !isKeyDown(player2Controls.right) && !isKeyDown(player2Controls.shoot)) {
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

  onKeyDown(player2Controls.right, () => {
    player2.move(SPEED, 0);
    player2.flipX = false;
    if (player2.isGrounded() && !isPlayer2Shooting && player2.curAnim() !== "run") {
      player2.play("run");
    }
  });

  onKeyDown(player2Controls.left, () => {
    player2.move(-SPEED, 0);
    player2.flipX = true;
    if (player2.isGrounded() && !isPlayer2Shooting && player2.curAnim() !== "run") {
      player2.play("run");
    }
  });

  [player2Controls.left, player2Controls.right].forEach((key) => {
    onKeyRelease(key, () => {
      if (
        player2.isGrounded() &&
        !isKeyDown(player2Controls.left) &&
        !isKeyDown(player2Controls.right) &&
        !isKeyDown(player2Controls.shoot)
      ) {
        player2.play("idle");
      }
    });
  });

  // Track the last direction Player 2 was facing
  onKeyPress(player2Controls.shoot, () => {
    if (canFire(lastFireTimePlayer2, player2Weapon.fireRate)) {
      spawnBullet(player2, player2LastDir.vect);
      isPlayer2Shooting = true;

      // Play the appropriate shooting animation based on the direction
      if (isKeyDown(player2Controls.left) || isKeyDown(player2Controls.right)) {
        switch (player2LastDir.direction) {
          case "left_up":
          case "right_up":
            player2.play("shoot45upRun");
            break;
          case "left_down":
          case "right_down":
            player2.play("shoot45downRun");
            break;
          default:
            player2.play("run"); // Continue running animation if not in a 45-degree angle
        }
      } else {
        switch (player2LastDir.direction) {
          case "up":
            player2.play("shootUp");
            break;
          case "left_up":
          case "right_up":
            player2.play("shoot45upIdle");
            break;
          case "left_down":
          case "right_down":
            player2.play("shoot45downIdle");
            break;
          default:
            player2.play("shoot");
        }
      }

      lastFireTimePlayer2 = time();

      // Reset the shooting flag after a short delay (based on animation length or a fixed time)
      wait(1, () => {
        isPlayer2Shooting = false;
      });
    }
  });
}

/**
 * Starts tracking the direction of one or two players based on the number of players specified.
 *
 * @param {number} players - The number of players to track (1 or 2)
 * @return {void}
 */
function startTrackingDir(players) {
  onUpdate(() => {
    // Track direction and check idle state for Player 1
    updatePlayer1LastDir();
    const isAnyKeyPressedPlayer1 =
      isKeyDown(player1Controls.left) ||
      isKeyDown(player1Controls.right) ||
      isKeyDown(player1Controls.up) ||
      isKeyDown(player1Controls.down) ||
      isKeyDown(player1Controls.jump) ||
      isKeyDown(player1Controls.shoot);

    if (!isAnyKeyPressedPlayer1 && player1.isGrounded() && player1.curAnim() !== "idle") {
      player1.play("idle");
    }

    // If two players, track direction and check idle state for Player 2
    if (players === 2) {
      updatePlayer2LastDir();
      const isAnyKeyPressedPlayer2 =
        isKeyDown(player2Controls.left) ||
        isKeyDown(player2Controls.right) ||
        isKeyDown(player2Controls.up) ||
        isKeyDown(player2Controls.down) ||
        isKeyDown(player2Controls.jump) ||
        isKeyDown(player2Controls.shoot);

      if (!isAnyKeyPressedPlayer2 && player2.isGrounded() && player2.curAnim() !== "idle") {
        player2.play("idle");
      }
    }
  });
}

// Add a wall or obstacle object
function addObstacle(position, size) {
  add([
    rect(size.x, size.y), // Rectangle shape for the obstacle
    pos(position), // Position of the obstacle
    area(), // Add collision area
    body({ isStatic: true }), // Make the object solid (prevents players from moving through it)
    color(100, 100, 100), // Give it a color (gray, in this case)
    "obstacle", // Tag it as an "obstacle"
  ]);
}

// Add a platform
add([rect(width(), 24), area(), outline(1), pos(0, height() - 10), body({ isStatic: true })]);

// Handle weapon pickups
function spawnWeaponPickup(weaponType, position) {
  add([sprite("pickup_" + weaponType), pos(position), area(), "weaponPickup", { weaponType: weaponType }]);
}

// Handle weapon pickups for player 1
onCollide("weaponPickup", "player1", (pickup) => {
  switchWeapon(1, pickup.weaponType); // Switch to the new weapon for player 1
  destroy(pickup); // Remove the pickup after it's taken
});

// Handle weapon pickups for player 2
onCollide("weaponPickup", "player2", (pickup) => {
  switchWeapon(2, pickup.weaponType); // Switch to the new weapon for player 2
  destroy(pickup); // Remove the pickup after it's taken
});

function createExplosion(position, radius, damage) {
  // Visual explosion effect
  add([
    pos(position),
    circle(radius), // Use a circle with a given radius
    color(203, 53, 61), // Explosion color
    opacity(0.8),
    lifespan(0.3, { fade: 0.1 }), // Make the explosion fade out quickly
  ]);

  // Use this for computer enemies

  get("player").forEach((player) => {
    if (player.pos.dist(position) < radius) {
      // Apply damage to the player
      player.hurt(damage); // Assuming players have a `hurt` method
    }
  });
}

function spawnBullet(player, dir) {
  const weapon = player === player1 ? player1Weapon : player2Weapon;

  // Function to create and spawn a bullet
  const createBullet = (dir) => {
    // Determine the angle of rotation based on the direction vector
    const angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);

    const bullet = add([
      sprite(weapon.bulletSprite), // Use the bullet sprite of the current weapon
      pos(player.pos), // Spawn the bullet at the player's position
      rotate(angle), // Rotate the bullet to match the direction
      area(weapon.collisionArea), // Add collision area
      {
        damage: weapon.damage,
        bounces: 0, // Track number of bounces
        speed: weapon.speed, // Keep track of bullet speed
        dir: dir.clone(), // Clone the direction vector to maintain its state
      },
      "bullet",
    ]);

    // Set the initial movement
    bullet.move(bullet.dir);
  };

  // For the "split" weapon, fire three bullets at different angles
  if (weapon.bulletSprite === "bullet_split") {
    // Original direction
    createBullet(dir);

    // Calculate the directions for the side bullets
    const angleOffset = 22.5 * (Math.PI / 180); // 22.5 degrees in radians

    // Calculate left and right split angles
    const dirLeft = vec2(
      dir.x * Math.cos(angleOffset) - dir.y * Math.sin(angleOffset),
      dir.x * Math.sin(angleOffset) + dir.y * Math.cos(angleOffset)
    );

    const dirRight = vec2(
      dir.x * Math.cos(-angleOffset) - dir.y * Math.sin(-angleOffset),
      dir.x * Math.sin(-angleOffset) + dir.y * Math.cos(-angleOffset)
    );

    // Fire the side bullets
    createBullet(dirLeft);
    createBullet(dirRight);
  } else {
    // For other weapons, just fire a single bullet
    createBullet(dir);
  }
}

// Handle bullet-obstacle collisions, specifically for lasers and rockets
onCollide("bullet", "obstacle", (bullet, obstacle) => {
  const obstacleBR = obstacle.pos.add([obstacle.width, obstacle.height]);
  const obstacleTL = obstacle.pos;
  let shootingDirection;

  if (obstacleTL.x > bullet.pos.x && obstacleTL.y < bullet.pos.y && obstacleBR.y > bullet.pos.y) {
    shootingDirection = "left";
  } else if (obstacleTL.x < bullet.pos.x && obstacleTL.y > bullet.pos.y && obstacleBR.x > bullet.pos.x) {
    shootingDirection = "top";
  } else if (obstacleBR.x < bullet.pos.x && obstacleTL.y < bullet.pos.y && obstacleBR.y > bullet.pos.y) {
    shootingDirection = "right";
  } else if (obstacleTL.x < bullet.pos.x && obstacleBR.y < bullet.pos.y && obstacleBR.x > bullet.pos.x) {
    shootingDirection = "bottom";
  } else {
    shootingDirection = null;
  }

  switch (shootingDirection) {
    case "left":
      bullet.dir.x = -bullet.dir.x;
      break;
    case "top":
      bullet.dir.y = -bullet.dir.y;
      break;
    case "right":
      bullet.dir.x = -bullet.dir.x;
      break;
    case "bottom":
      bullet.dir.y = -bullet.dir.y;
      break;
    default:
      bullet.dir = bullet.dir;
  }

  // Move the bullet in the new direction after bouncing
  bullet.move(bullet.dir.scale(bullet.speed));

  // If it's a laser, increment the bounce counter and check if it should be destroyed
  if (bullet.sprite === "bullet_laser") {
    bullet.bounces += 1;
    if (bullet.bounces >= 3) {
      destroy(bullet);
    }
  } else if (bullet.sprite === "bullet_rocket") {
    createExplosion(bullet.pos, 50, bullet.damage);
    destroy(bullet);
  } else {
    destroy(bullet);
  }
});

// ensure that all bullet moves
onUpdate("bullet", (bullet) => {
  bullet.pos.x += bullet.dir.x * bullet.speed * dt();
  bullet.pos.y += bullet.dir.y * bullet.speed * dt();

  // Rotate the bullet sprite to face the direction it's moving
  const angle = Math.atan2(bullet.dir.y, bullet.dir.x) * (180 / Math.PI);
  bullet.angle = angle;
});

// Reset player weapons when game restarts
function resetWeapons() {
  player1Weapon = WEAPONS.standard;
  player2Weapon = WEAPONS.standard;
}

spawnWeaponPickup("laser", vec2(50, 150));
spawnWeaponPickup("split", vec2(200, 150));
spawnWeaponPickup("rocket", vec2(300, 150));

// Example of adding some obstacles
addObstacle(vec2(20, 50), vec2(30, 200));
addObstacle(vec2(350, 50), vec2(30, 200));

addObstacle(vec2(10, 20), vec2(350, 50));

// Show the modal on page load
window.addEventListener("DOMContentLoaded", () => {
  const playerSelectModal = new bootstrap.Modal(document.getElementById("playerSelectModal"));
  playerSelectModal.show();

  document.getElementById("onePlayerBtn").addEventListener("click", () => {
    playerSelectModal.hide();
    startTrackingDir(1);
  });

  document.getElementById("twoPlayersBtn").addEventListener("click", () => {
    playerSelectModal.hide();
    startTrackingDir(2);
    addPlayer2();
  });
});
