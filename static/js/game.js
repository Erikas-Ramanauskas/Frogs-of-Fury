import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";
// start kaplay

import { player1Controls, player2Controls, loadPlayerControls } from "./controlKeys.js";
import { sprites } from "./assets.js";
import { WEAPONS } from "./weapons.js";

// This function loads controls from localStorage and updates the global control variables.
loadPlayerControls();

kaplay({
  background: [141, 183, 255],
  scale: 1,
  font: "monospace",
  debug: true,
  width: 1100,
  height: 500,
  letterbox: true,
});

const SPEED = 240;
const JUMP_FORCE = 600;
setGravity(640);
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;
const WALL_HEIGHT_TILES = 3; // Height of wall sections in tiles
const PLATFORM_HEIGHT_TILES = 1; // Platform height in tiles
const PLATFORM_GAP_TILES = 3; // Vertical gap between platforms in tiles
const PLATFORMS_PER_ROW = 14; // Number of platforms per row
const WALLS_WIDTH = 2; // Width of walls in tiles
const TOTAL_TILES = PLATFORMS_PER_ROW + WALLS_WIDTH * 2; // Total tiles width (platforms + walls)
const UNIT_TO_METERS = 0.08; // Conversion factor: 1 game unit = 0.08 meters
const CAMERA_THRESHOLD = height() / 3; // Height threshold to start moving camera
const DELETE_THRESHOLD = 900; // Distance below the camera to delete objects
const CAMERA_MOVE_SPEED = 0; // Speed for slow upward camera movement
const LAVA_MOVE_SPEED = 500; // Speed at which the lava moves up

let lastY = 0; // Track the last Y position where platforms were generated in tile units
let isFirstRow = true; // Flag to manage initial platform row
let sections = []; // Array to keep track of current sections

// Initialize startY with the initial Y position of player1 after it's added
let startY = 30;

let playersCount;
function playersCountFinction(number) {
  playersCount = number;
}

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

// Loading gun sprites
loadSprite("bullet", "../static/sprites/bullet.png");
loadSprite("bullet_split", "../static/sprites/bullet_split.png");
loadSprite("bullet_laser", "../static/sprites/bullet_laser.png");
loadSprite("bullet_rocket", "../static/sprites/bullet_rocket.png");

loadSprite("pickup_laser", "../static/sprites/pickup_laser.png");
loadSprite("pickup_split", "../static/sprites/pickup_split.png");
loadSprite("pickup_rocket", "../static/sprites/pickup_rocket.png");

// Load level sprites
loadSprite("lava", sprites.lava); // moved all sprites assets to assets.js
loadSprite("wall", sprites.wall);
loadSprite("platform", sprites.platform);
loadSprite("dirt", sprites.dirt);

// Load sounds
loadSound("blip", "/examples/sounds/blip.mp3");
loadSound("hit", "/examples/sounds/hit.mp3");
loadSound("portal", "/examples/sounds/portal.mp3");

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

let player1;

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

function addPlayer1() {
  // Add our player1 character
  player1 = add([
    sprite("frog1"),
    pos(180, 80),
    anchor("center"),
    area({ shape: new Polygon([vec2(-15, -10), vec2(20, -10), vec2(20, 33), vec2(-15, 33)]) }),
    body(),
    scale(1),
    "player1",
  ]);
  player1.play("idle");

  // Switch to "idle" or "run" animation when player1 hits ground
  player1.onGround(() => {
    console.log(player1);
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
}

let player2;
// If 2 players, add the second player
function addPlayer2() {
  player2 = add([sprite("frog2"), pos(180, 80), anchor("center"), area(), body(), scale(1), "player2"]);
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
    playersCountFinction(1);
    addPlayer1();
  });

  document.getElementById("twoPlayersBtn").addEventListener("click", () => {
    playerSelectModal.hide();
    startTrackingDir(2);
    playersCountFinction(2);
    addPlayer1();
    addPlayer2();
  });
});

// Code for generating levels
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Function to generate multiple platforms in a row
function spawnPlatformRowWithGaps(y) {
  const startX = WALLS_WIDTH;
  const endX = TOTAL_TILES - WALLS_WIDTH;

  if (isFirstRow) {
    isFirstRow = false;
    for (let i = startX; i < endX; i++) {
      const platform = add([
        sprite("dirt"),
        pos(i * TILE_WIDTH, y),
        area({ width: TILE_WIDTH, height: TILE_HEIGHT }),
        body({ isStatic: true }),
        anchor("bot"),
        "platform",
      ]);
      sections.push(platform); // Add to sections array
    }
  } else {
    const numGaps = Math.floor((endX - startX) / 3);
    const gapPositions = [];

    while (gapPositions.length < numGaps) {
      const pos = Math.floor(rand(startX, endX - 1) / 2) * 2;
      if (!gapPositions.includes(pos) && !gapPositions.includes(pos + 1)) {
        gapPositions.push(pos);
      }
    }

    for (let i = startX; i < endX; i++) {
      if (!gapPositions.includes(i) && !gapPositions.includes(i + 1)) {
        const platform = add([
          sprite("platform"),
          pos(i * TILE_WIDTH, y),
          area({ width: TILE_WIDTH, height: TILE_HEIGHT }),
          body({ isStatic: true }),
          anchor("bot"),
          "platform",
        ]);
        sections.push(platform); // Add to sections array
      }
    }
  }
}

// Function to create continuous side walls without gaps
function spawnSideWalls(y) {
  const wallWidth = TILE_WIDTH * WALLS_WIDTH;
  const wallHeight = TILE_HEIGHT * WALL_HEIGHT_TILES;

  for (let i = 0; i < WALL_HEIGHT_TILES; i++) {
    const leftWall = add([
      sprite("wall"),
      pos(TILE_WIDTH, y - i * TILE_HEIGHT),
      area({ width: wallWidth, height: TILE_HEIGHT }),
      body({ isStatic: true }),
      anchor("bot"),
      "wall",
    ]);
    sections.push(leftWall); // Add to sections array

    const rightWall = add([
      sprite("wall"),
      pos((TOTAL_TILES - WALLS_WIDTH) * TILE_WIDTH, y - i * TILE_HEIGHT),
      area({ width: wallWidth, height: TILE_HEIGHT }),
      body({ isStatic: true }),
      anchor("bot"),
      "wall",
    ]);
    sections.push(rightWall); // Add to sections array
  }
}

// Function to create the initial floor with platforms and walls
function createInitialPlatformsAndWalls() {
  const platformHeight = Math.floor(height() / TILE_HEIGHT) * TILE_HEIGHT;

  spawnPlatformRowWithGaps(platformHeight);

  for (let i = 0; i < WALL_HEIGHT_TILES; i++) {
    spawnSideWalls(platformHeight - i * TILE_HEIGHT);
  }
}

scene("game", () => {
  // Reset sections array and lastY position on restart
  sections = [];
  lastY = Math.floor(height() / TILE_HEIGHT) * TILE_HEIGHT;
  isFirstRow = true; // Reset flag for platform generation

  // Create the initial row of platforms and walls
  createInitialPlatformsAndWalls();

  // Display height achieved at the top of the screen
  const heightLabel = add([text("Height: 0.0 meters"), pos(24, 24), fixed(), layer("ui")]);

  // Function to create a block of scaled lava tiles (3x3) that covers the same area
  function createLava(y) {
    const lavaTileWidth = 64 * 3; // Width of each lava block (3 tiles wide)
    const lavaTileHeight = TILE_HEIGHT * 3; // Height of each lava block (3 tiles tall)
    const numBlocks = Math.ceil(width() / lavaTileWidth); // Number of blocks needed to cover the width
    const LAVA_HEIGHT_BLOCKS = Math.ceil(21 / 3); // Number of 3x3 blocks to cover the height

    for (let j = 0; j < LAVA_HEIGHT_BLOCKS; j++) {
      // Loop to create a block of 7 blocks in height
      for (let i = 0; i < numBlocks; i++) {
        add([
          sprite("lava"),
          pos(i * lavaTileWidth, y - j * lavaTileHeight), // Position each block
          area({ width: lavaTileWidth, height: lavaTileHeight }), // Set each block's size
          scale(3), // Scale the lava sprite to 3x3 tiles
          "lava",
        ]);
      }
    }
  }

  // Create the initial lava using larger blocks
  createLava(lastY + TILE_HEIGHT * 20); // Push the lava much lower below the starting point

  onUpdate(() => {
    // Ensure player1 is defined before trying to access it
    if (!player1) return;

    // Move lava up gradually
    const lavaTiles = get("lava");
    lavaTiles.forEach((lava) => {
      lava.move(0, -LAVA_MOVE_SPEED * dt());
    });

    // Destroy the player if they touch the lava
    lavaTiles.forEach((lava) => {
      const players = [];
      if (playersCount === 1) {
        players.push(player1);
      }
      if (playersCount === 2) {
        players.push(player2);
      }

      players.forEach((player) => {
        if (player.isColliding(lava)) {
          destroy(player);
          const index = players.indexOf(player);
          if (index > -1) {
            players.splice(index, 1);
          }
          checkGameOver();
          return;
        }
      });
    });

    // Gradually move the camera upwards
    const currentCamPos = camPos();
    camPos(currentCamPos.x, currentCamPos.y + CAMERA_MOVE_SPEED * dt());

    // Camera only moves up when the player is near the top of the screen
    if (player1 && player1.pos.y < currentCamPos.y - CAMERA_THRESHOLD) {
      camPos(width() / 2, player1.pos.y + CAMERA_THRESHOLD);
    }

    // Remove old sections below the camera
    sections.forEach((section, index) => {
      if (section.pos.y > camPos().y + DELETE_THRESHOLD) {
        section.destroy();
        sections.splice(index, 1);
      }
    });

    // Generate new sections as the camera moves up
    while (lastY > camPos().y - height()) {
      spawnPlatformRowWithGaps(lastY - PLATFORM_GAP_TILES * TILE_HEIGHT);
      spawnSideWalls(lastY - PLATFORM_GAP_TILES * TILE_HEIGHT);
      lastY -= PLATFORM_GAP_TILES * TILE_HEIGHT;
    }

    // Calculate the height climbed in meters
    const heightClimbed = (startY - player1.pos.y) * UNIT_TO_METERS;
    heightLabel.text = `Height: ${heightClimbed.toFixed(1)} meters`;

    // Check if player falls below the screen
    if (player1.pos.y > camPos().y + height() / 2) {
      destroy(player1);
      // checkGameOver(); // Check if game is over
    }
  });
});

// Start the game
go("game");
