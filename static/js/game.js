import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";
// start kaplay

import { player1Controls, player2Controls, loadPlayerControls } from "./controlKeys.js";
import { WEAPONS } from "./weapons.js";
import { enemies } from "./enemies.js";

// This function loads controls from localStorage and updates the global control variables.
loadPlayerControls();

kaplay({
  backgroundAudio: true,
  background: [141, 183, 255],
  scale: 1,
  font: "monospace",
  debug: true,
  width: 1100,
  height: 500,
  letterbox: true,
});

let GLOBAL_VOLUME = 0.1;

// Function to set and save global volume
function setGlobalVolume(value) {
  GLOBAL_VOLUME = Math.max(0, Math.min(1, GLOBAL_VOLUME + value)); // Clamp the volume between 0 and 1
  localStorage.setItem("globalVolume", GLOBAL_VOLUME); // Save to local storage

  // Display the volume on the screen
  displayVolume();
}

// Function to display the current volume on the screen
function displayVolume() {
  const volumeText = add([
    text(`Volume: ${Math.round(GLOBAL_VOLUME * 100)}%`, { size: 24 }),
    pos(width() / 2, height() / 2),
    fixed(),
    layer("ui"),
  ]);

  // Remove the volume display after a short delay
  wait(1, () => {
    destroy(volumeText);
  });
}

// Load global volume from local storage on initialization
function loadGlobalVolume() {
  const savedVolume = localStorage.getItem("globalVolume");
  if (savedVolume !== null) {
    GLOBAL_VOLUME = parseFloat(savedVolume);
  }
}

// Load the volume when the script starts
loadGlobalVolume();

const SPEED = 240;
const JUMP_FORCE = 600;
setGravity(640);
const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const WALL_HEIGHT_TILES = 3; // Height of wall sections in tiles
const PLATFORM_HEIGHT_TILES = 3; // Platform height in tiles
const PLATFORM_GAP_TILES = 3; // Vertical gap between platforms in tiles
const PLATFORMS_PER_ROW = 30; // Number of platforms per row
const WALLS_WIDTH = 1; // Width of walls in tiles
const TOTAL_TILES = PLATFORMS_PER_ROW + WALLS_WIDTH * 2; // Total tiles width (platforms + walls)
const UNIT_TO_METERS = 0.08; // Conversion factor: 1 game unit = 0.08 meters
const CAMERA_THRESHOLD = height() / 5; // Height threshold to start moving camera
const DELETE_THRESHOLD = 900; // Distance below the camera to delete objects
const CAMERA_MOVE_SPEED = 0; // Speed for slow upward camera movement
const LAVA_MOVE_SPEED = 650; // Speed at which the lava moves up
const PICKUP_SACLE = 1.5;

const SPAWN_WIDTH_P1 = 180;
const SPAWN_WIDTH_P2 = 360;
const SPAWN_HEIGHT = 400;
const spawnInterval = 0.5; // Time interval between enemy spawns
const spawnOffsetY = 500; // Distance above the players to spawn enemies
const LOOT_TYPES = [
  { type: "split", chance: 0.33 },
  { type: "laser", chance: 0.34 },
  { type: "rocket", chance: 0.33 },
];

let maxEnemies = 32; // Maximum number of enemies to spawn
let spawnedEnemies = 0; // Number of enemies spawned
let lastSpawnedY = 0;
let lastY = 0; // Track the last Y position where platforms were generated in tile units
let isFirstRow = true; // Flag to manage initial platform row
let sections = []; // Array to keep track of current sections
let highestCamPosY = camPos().y;

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

const listOfSpriteNames = [];

for (const obj of enemies) {
  loadSprite(obj.name, `../static/sprites/${obj.name}_sprite.png`, {
    sliceX: obj.sliceX,
    sliceY: obj.sliceY,
    anims: obj.anims,
    scale: obj.scale,
  });
  for (const obj of enemies) {
    listOfSpriteNames.push(obj);
  }
}

loadSprite("background", "../static/images/game_page.png");

add([
  sprite("background"),
  pos(0, 0),
  layer("background"), // Optional: If you are using layers
  scale(width() / sprite("background").width, height() / sprite("background").height), // Scale to fit screen
]);

// Loading gun sprites
loadSprite("bullet", "../static/sprites/bullet.png");
loadSprite("bullet_split", "../static/sprites/bullet_split.png");
loadSprite("bullet_laser", "../static/sprites/bullet_laser.png");
loadSprite("bullet_rocket", "../static/sprites/bullet_rocket.png");

loadSprite("pickup_laser", "../static/sprites/pickup_laser.png");
loadSprite("pickup_split", "../static/sprites/pickup_split.png");
loadSprite("pickup_rocket", "../static/sprites/pickup_rocket.png");

// Load level sprites
loadSprite("lava", "../static/Images/tiles/lava-tile-64x64.png");
loadSprite("wall", "../static/Images/tiles/wall-tile-32x32-2.png");
loadSprite("platform", "../static/Images/tiles/platform-tile-32x16.png");
loadSprite("dirt", "../static/Images/tiles/dirt-tile-32x32-2.png");

// Load sounds
// Load sounds
loadSound("shotMachineGun", "../static/sounds/shot_mashine_gun.wav");
loadSound("shotLaser", "../static/sounds/shot_laser.wav");
loadSound("shotLaser2", "../static/sounds/shot_laser_2.wav");
loadSound("shotGunshot", "../static/sounds/shot_gunshot.wav");
loadSound("jump", "../static/sounds/jump.wav");
loadSound("ingameSlow", "../static/sounds/ingame_slow.mp3");
loadSound("ingameFaster", "../static/sounds/ingame_faster.mp3");
loadSound("hit", "../static/sounds/hitHurt.wav");
loadSound("gameOver", "../static/sounds/game_over.mp3");
loadSound("footstepNormal", "../static/sounds/footstep_normal.wav");
loadSound("footstepFrog", "../static/sounds/footstep_frog.wav");
loadSound("explosion", "../static/sounds/explosion.wav");
loadMusic("backgroundTeamPage", "../static/sounds/background_team_page.mp3");
loadMusic("backgroundHomePage", "../static/sounds/background_home_page.mp3");
loadMusic("backgroundControlsPage", "../static/sounds/background_controls_page.mp3");

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
let player2;

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

// Function to handle weapon pickups with a random chance
function maybeSpawnWeaponPickup(position) {
  if (Math.random() < 0.3) {
    // 30% chance to drop something
    const lootType = chooseLootType();
    if (lootType) {
      spawnWeaponPickup(lootType, position);
    }
  }
}

// Function to choose a loot type based on their chances
function chooseLootType() {
  const totalChance = LOOT_TYPES.reduce((sum, loot) => sum + loot.chance, 0);
  const randomChance = Math.random() * totalChance;

  let cumulativeChance = 0;
  for (const loot of LOOT_TYPES) {
    cumulativeChance += loot.chance;
    if (randomChance < cumulativeChance) {
      return loot.type; // Return the selected loot type
    }
  }

  return;
}

// Handle weapon pickups
function spawnWeaponPickup(weaponType, position) {
  add([
    sprite("pickup_" + weaponType),
    pos(position),
    area(),
    "weaponPickup",
    scale(PICKUP_SACLE),
    { weaponType: weaponType },
  ]);
}

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
      player.hurt(damage);
    }
  });
}

// Reset player weapons when game restarts
function resetWeapons() {
  player1Weapon = WEAPONS.standard;
  player2Weapon = WEAPONS.standard;
}

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
  for (let i = 0; i < WALL_HEIGHT_TILES; i++) {
    const leftWall = add([
      sprite("wall"),
      pos(TILE_WIDTH, y - i * TILE_HEIGHT),
      area({ width: WALLS_WIDTH, height: TILE_HEIGHT }),
      body({ isStatic: true }),
      anchor("bot"),
      "wall",
    ]);
    sections.push(leftWall); // Add to sections array

    const rightWall = add([
      sprite("wall"),
      pos((TOTAL_TILES - WALLS_WIDTH) * TILE_WIDTH, y - i * TILE_HEIGHT),
      area({ width: WALLS_WIDTH, height: TILE_HEIGHT }),
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
  const heightLabel = add([text("0.0 meters"), pos(width() / 2 - 200, 24), fixed(), layer("ui")]);

  // Function to create a block of scaled lava tiles (3x3) that covers the same area
  function createLava(y) {
    const originalTileSize = 64; // Original tile size (64x64)
    const scaleFactor = 10; // Factor to scale tiles

    const lavaTileWidth = originalTileSize * scaleFactor; // New width (640)
    const lavaTileHeight = originalTileSize * scaleFactor; // New height (640)

    // Calculate the number of tiles needed to cover the screen width and height
    const numTilesAcross = Math.ceil(width() / lavaTileWidth);
    const numTilesDown = Math.ceil(height() / lavaTileHeight);

    for (let j = 0; j < numTilesDown; j++) {
      // Loop to create tiles down the height
      for (let i = 0; i < numTilesAcross; i++) {
        add([
          sprite("lava"),
          pos(i * lavaTileWidth, y - j * lavaTileHeight), // Position each tile
          area({ width: lavaTileWidth, height: lavaTileHeight }), // Set each tile's size
          scale(scaleFactor), // Scale the sprite
          "lava",
        ]);
      }
    }
  }

  // Create the initial lava using larger blocks
  createLava(lastY + TILE_HEIGHT * 5); // Push the lava much lower below the starting point

  onUpdate(() => {
    // Ensure player1 is defined before trying to access it
    if (!player1) return;

    // Move lava up gradually
    const lavaTiles = get("lava");
    lavaTiles.forEach((lava) => {
      lava.move(0, -LAVA_MOVE_SPEED * dt());
    });

    // Destroy the player if they touch the lava
    const players = [];
    if (playersCount === 1) {
      players.push(player1);
    }
    if (playersCount === 2) {
      players.push(player2);
    }

    players.forEach((player) => {
      lavaTiles.forEach((lava) => {
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

    // Destroy enemies if they touch the lava
    const enemies = get("enemy");
    enemies.forEach((enemy) => {
      lavaTiles.forEach((lava) => {
        if (enemy.isColliding(lava)) {
          destroy(enemy);
        }
      });
    });

    // Gradually move the camera upwards
    const currentCamPos = camPos();
    camPos(currentCamPos.x, currentCamPos.y + CAMERA_MOVE_SPEED * dt());

    const lowestPlayerPosition = playersCount === 2 ? Math.max(player1.pos.y, player2.pos.y) : player1.pos.y;

    // Camera only moves up when the player is near the top of the screen
    if (lowestPlayerPosition < highestCamPosY) {
      camPos(width() / 2, lowestPlayerPosition + CAMERA_THRESHOLD);

      highestCamPosY = lowestPlayerPosition + CAMERA_THRESHOLD;
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
    heightLabel.text = `${heightClimbed.toFixed(1)} meters`;

    // Check if player falls below the screen
    if (player1.pos.y > camPos().y + height() / 2) {
      destroy(player1);
      checkGameOver(); // Check if game is over
    }
  });

  function checkGameOver() {
    if ((!player1 || player1.hp() <= 0) && (!player2 || player2.hp() <= 0)) {
      go("lose", { maxHeight: (startY - highestCamPosY) * UNIT_TO_METERS });
    }
  }

  function addPlayer1() {
    // Add our player1 character
    player1 = add([
      sprite("frog1"),
      pos(SPAWN_WIDTH_P1, SPAWN_HEIGHT),
      anchor("center"),
      area({
        shape: new Polygon([vec2(-13, -10), vec2(17, -10), vec2(17, 33), vec2(-13, 33)]),
      }),
      body(),
      scale(1),
      health(100),
      "player1",
    ]);
    player1.play("idle");

    addDeathListener(player1); // Add the death listener

    // Switch to "idle" or "run" animation when player1 hits ground
    player1.onGround(() => {
      if (!isKeyDown(player1Controls.left) && !isKeyDown(player1Controls.right)) {
        player1.play("idle");
      } else {
        player1.play("run");
        play("footstepFrog", {
          volume: GLOBAL_VOLUME,
        });
      }
    });

    onKeyPress(player1Controls.jump, () => {
      if (player1.isGrounded()) {
        player1.jump(JUMP_FORCE);
        player1.play("jump");
        play("jump", {
          volume: GLOBAL_VOLUME,
        });
      }
    });

    onKeyDown(player1Controls.right, () => {
      player1.move(SPEED, 0);
      player1.flipX = false;
      if (player1.isGrounded() && !isPlayer1Shooting && player1.curAnim() !== "run") {
        player1.play("run");
        play("footstepFrog", {
          volume: GLOBAL_VOLUME,
        });
      }
    });

    onKeyDown(player1Controls.left, () => {
      player1.move(-SPEED, 0);
      player1.flipX = true;
      if (player1.isGrounded() && !isPlayer1Shooting && player1.curAnim() !== "run") {
        player1.play("run");
        play("footstepFrog", {
          volume: GLOBAL_VOLUME,
        });
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
              play("footstepFrog", {
                volume: GLOBAL_VOLUME,
              });

              break;
            case "left_down":
            case "right_down":
              player1.play("shoot45downRun");
              play("footstepFrog", {
                volume: GLOBAL_VOLUME,
              });
              break;
            default:
              player1.play("run");
              play("footstepFrog", {
                volume: GLOBAL_VOLUME,
              }); // Continue running animation if not in a 45-degree angle
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
    displayPlayerHealth(player1);
  }

  // If 2 players, add the second player
  function addPlayer2() {
    player2 = add([
      sprite("frog2"),
      pos(SPAWN_WIDTH_P2, SPAWN_HEIGHT),
      anchor("center"),
      area({
        shape: new Polygon([vec2(-13, -10), vec2(17, -10), vec2(17, 33), vec2(-13, 33)]),
      }),
      body(),
      scale(1),
      health(100),
      "player2",
    ]);
    player2.play("idle");
    addDeathListener(player2);

    player2.onGround(() => {
      if (!isKeyDown(player2Controls.left) && !isKeyDown(player2Controls.right)) {
        player2.play("idle");
      } else {
        player2.play("run");
        play("footstepFrog", {
          volume: GLOBAL_VOLUME,
        });
      }
    });

    onKeyPress(player2Controls.jump, () => {
      if (player2.isGrounded()) {
        player2.jump(JUMP_FORCE);
        player2.play("jump");
        play("jump", {
          volume: GLOBAL_VOLUME,
        });
      }
    });

    onKeyDown(player2Controls.right, () => {
      player2.move(SPEED, 0);
      player2.flipX = false;
      if (player2.isGrounded() && !isPlayer2Shooting && player2.curAnim() !== "run") {
        player2.play("run");
        play("footstepFrog", {
          volume: GLOBAL_VOLUME,
        });
      }
    });

    onKeyDown(player2Controls.left, () => {
      player2.move(-SPEED, 0);
      player2.flipX = true;
      if (player2.isGrounded() && !isPlayer2Shooting && player2.curAnim() !== "run") {
        player2.play("run");
        play("footstepFrog", {
          volume: GLOBAL_VOLUME,
        });
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
              play("footstepFrog", {
                volume: GLOBAL_VOLUME,
              });
              break;
            case "left_down":
            case "right_down":
              player2.play("shoot45downRun");
              play("footstepFrog", {
                volume: GLOBAL_VOLUME,
              });
              break;
            default:
              player2.play("run");
              play("footstepFrog", {
                volume: GLOBAL_VOLUME,
              }); // Continue running animation if not in a 45-degree angle
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

    displayPlayerHealth(player2);
  }

  function hurtPlayer(player, damage) {
    if (player.exists()) {
      player.hurt(damage); // Directly reduce the player's health by the damage amount

      // Optional: Add visual feedback or sound effects on hurt
      shake(2); // Screen shake effect
      play("hit"); // Play a hit sound

      // Check if player's health is zero or less
      if (player.hp() <= 0) {
        player.trigger("death");
      }
    }
  }

  function addDeathListener(player) {
    player.on("death", () => {
      destroy(player);
      checkGameOver();
    });
  }

  const ENEMY_DIRECTIONS = [
    vec2(-1, 0), // Left
    vec2(1, 0), // Right
  ];

  // Call this function after creating the player
  function spawnEnemy(position) {
    const randomEnemy = choose(listOfSpriteNames);
    const enemy = add([
      sprite(randomEnemy.name),
      pos(position),
      anchor("center"),
      area(),
      body(),
      health(randomEnemy.health),
      scale(randomEnemy.scale),
      {
        fly: randomEnemy.fly,
        speed: randomEnemy.speed,
        direction: choose(ENEMY_DIRECTIONS), // Initialize with a random direction
      },
      randomEnemy.name,
      "enemy",
    ]);

    // Update enemy movement
    enemy.onUpdate(() => {
      // Move the enemy in the current direction
      enemy.move(enemy.direction.x * enemy.speed, enemy.direction.y * enemy.speed);

      // Change direction randomly at intervals
      if (Math.random() < 0.01) {
        // Adjust this probability to control direction change frequency
        enemy.direction = choose(ENEMY_DIRECTIONS);
      }
    });

    // Play the move animation
    enemy.play("move");

    return enemy;
  }

  function spawnBullet(player, dir) {
    const weapon = player === player1 ? player1Weapon : player2Weapon;

    // Function to create and spawn a bullet
    const createBullet = (dir) => {
      // Determine the angle of rotation based on the direction vector
      const angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);

      const bullet = add([
        sprite(weapon.bulletSprite),
        pos(player.pos),
        rotate(angle),
        area(weapon.collisionArea),
        offscreen({ destroy: true }),
        {
          damage: weapon.damage,
          bounces: 0,
          speed: weapon.speed,
          dir: dir.clone(),
        },
        "bullet", // Ensure the "bullet" tag is added here
      ]);

      // Set the initial movement
      bullet.move(bullet.dir);
    };

    if (weapon.bulletSprite === "bullet_laser") {
      play("shotLaser", {
        volume: GLOBAL_VOLUME,
      });
    } else if (weapon.bulletSprite === "bullet_split") {
      play("shotGunshot", {
        volume: GLOBAL_VOLUME,
      });
    } else if (weapon.bulletSprite === "bullet_rocket") {
      play("shotLaser2", {
        volume: GLOBAL_VOLUME,
      });
    } else {
      play("shotMachineGun", {
        volume: GLOBAL_VOLUME,
      });
    }

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

  // ensure that all bullet moves
  onUpdate("bullet", (bullet) => {
    bullet.pos.x += bullet.dir.x * bullet.speed * dt();
    bullet.pos.y += bullet.dir.y * bullet.speed * dt();

    // Rotate the bullet sprite to face the direction it's moving
    const angle = Math.atan2(bullet.dir.y, bullet.dir.x) * (180 / Math.PI);
    bullet.angle = angle;
  });

  onCollide("enemy", "player1", (enemy, player) => {
    hurtPlayer(player, 20); // Reduce player's health by 20
    knockback(player, enemy.pos); // Optional: Apply a knockback effect
  });

  function knockback(player, sourcePosition, strength = 400) {
    // Calculate the direction of the knockback
    const knockbackDirection = player.pos.sub(sourcePosition).unit();

    // Apply the knockback force to the player
    player.move(knockbackDirection.scale(strength));
  }

  onCollide("bullet", "enemy", (bullet, enemy) => {
    enemy.hurt(bullet.damage); // Reduce the enemy's health
    if (bullet.sprite !== "bullet_laser") {
      destroy(bullet); // Destroy the bullet
    }
    if (enemy.hp() <= 0) {
      destroy(enemy); // Destroy the enemy if it's dead
      maybeSpawnWeaponPickup(enemy.pos); // Handle weapon pickup with a chance
    }
  });

  function bounceOfTheWalls(bullet, obstacle) {
    if (bullet.bouncedRecently) return; // Skip if it has bounced recently

    // Mark as bounced to avoid immediate subsequent collisions
    bullet.bouncedRecently = true;
    wait(0.1, () => {
      bullet.bouncedRecently = false;
    }); // Reset the flag after a short delay

    const obstacleTL = obstacle.pos.add([-(TILE_WIDTH / 2), -TILE_HEIGHT]);
    const obstacleBR = obstacle.pos.add([TILE_WIDTH / 2, 0]);
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
  }

  // Handle bullet-obstacle collisions, specifically for lasers and rockets
  onCollide("bullet", "wall", (bullet, obstacle) => {
    bounceOfTheWalls(bullet, obstacle);
  });

  onCollide("bullet", "platform", (bullet, obstacle) => {
    bounceOfTheWalls(bullet, obstacle);
  });

  // Example: Spawn enemies at regular intervals
  loop(1, () => {
    if (!player1 && !player2) return; // Check if no players exist
    // Determine the highest Y position among the players
    const highestPlayerY = Math.max(player1 ? player1.pos.y : -Infinity, player2 ? player2.pos.y : -Infinity);

    // Calculate the spawn position based on the highest player position
    const spawnY = highestPlayerY - spawnOffsetY;
    const spawnX = rand(100, width() - 150); // Randomize X position within screen bounds

    // Ensure enemies are not spawned too close to each other vertically
    if (Math.abs(spawnY - lastSpawnedY) > 200 && spawnedEnemies < maxEnemies) {
      spawnEnemy(vec2(spawnX, spawnY));
      lastSpawnedY = spawnY; // Update last spawned position
      spawnedEnemies++; // Increment the number of spawned enemies
    }
  });

  // Monitor enemy count
  onDestroy("enemy", () => {
    spawnedEnemies--; // Decrement the number of spawned enemies
  });

  function displayPlayerHealth(player) {
    const playerData = {
      pos: player === player1 ? 50 : width() - 200, // Position for each player
      colorR: player === player1 ? 0 : 255,
      colorG: player === player1 ? 255 : 0, // Red color for player 1, // Position for each player
    };
    const healthLabel = add([
      text(`Health: ${player.hp()}`),
      pos(playerData.pos, 24), // Position for each player
      fixed(), // Fixed to camera
      layer("ui"), // Display on the UI layer
      color(playerData.colorR, playerData.colorG, 0), // Color for each player
      {
        update() {
          this.text = `${player.hp()}`;
        },
      },
    ]);
  }

  function setMusic() {
    const music = play("backgroundHomePage", {
      loop: true,
      volume: GLOBAL_VOLUME,
    });

    volume(GLOBAL_VOLUME);
    // Example usage: Increase or decrease volume
    onKeyPressRepeat("]", () => {
      setGlobalVolume(0.01);
      music.volume = GLOBAL_VOLUME; // Adjust the music volume
    });

    onKeyPressRepeat("[", () => {
      setGlobalVolume(-0.01);
      music.volume = GLOBAL_VOLUME; // Adjust the music volume
    });
  }

  // Show the modal on page load
  function openModal() {
    const playerSelectModal = new bootstrap.Modal(document.getElementById("playerSelectModal"));
    playerSelectModal.show();

    document.getElementById("onePlayerBtn").addEventListener("click", () => {
      playerSelectModal.hide();
      startTrackingDir(1);
      playersCountFinction(1);
      addPlayer1();
      setMusic();
    });

    document.getElementById("twoPlayersBtn").addEventListener("click", () => {
      playerSelectModal.hide();
      startTrackingDir(2);
      playersCountFinction(2);
      addPlayer1();
      addPlayer2();
      setMusic();
    });
  }

  onKeyPressRepeat("=", () => (music.volume += 0.1));
  onKeyPressRepeat("-", () => (music.volume -= 0.1));

  openModal();
});

// Start the game
go("game");

scene("lose", ({ maxHeight }) => {
  add([text(`You Lose! Height Achieved: ${maxHeight.toFixed(1)} meters`), pos(center()), anchor("center")]);

  onKeyPress(() => go("game"));
});
