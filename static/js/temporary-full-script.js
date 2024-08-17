// ---------------------------------------------------
// assets.js - Asset Loading and Configuration
// ---------------------------------------------------
kaplay({
  background: [141, 183, 255],
});

// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("steel", "/sprites/steel.png");

// Load sounds
loadSound("blip", "/examples/sounds/blip.mp3");
loadSound("hit", "/examples/sounds/hit.mp3");
loadSound("portal", "/examples/sounds/portal.mp3");

// ---------------------------------------------------
// config.js - Game Configuration and Constants
// ---------------------------------------------------

setGravity(3200);

const JUMP_FORCE = 1650; // Updated jump force
const MOVE_SPEED = 480;
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
const CAMERA_MOVE_SPEED = -10; // Speed for slow upward camera movement

let lastY = 0; // Track the last Y position where platforms were generated in tile units
let isFirstRow = true; // Flag to manage initial platform row
let sections = []; // Array to keep track of current sections

// ---------------------------------------------------
// platform.js - Platform and Wall Generation
// ---------------------------------------------------

// Function to generate multiple platforms in a row
function spawnPlatforms(y) {
  const platforms = [];
  for (let i = 0; i < PLATFORMS_PER_ROW; i++) {
    const length = rand(2, 5); // Random length between 2 and 5 tiles
    const x = Math.floor(rand(0, width() / TILE_WIDTH - length)) * TILE_WIDTH;
    
    // Ensure platforms don't overlap horizontally
    if (platforms.every(p => Math.abs(p.pos.x - x) > length * TILE_WIDTH)) {
      const platform = add([
        sprite("grass"), // Use grass sprite for platform
        pos(x, y), // Position aligned to the tile grid
        area({ width: length * TILE_WIDTH, height: TILE_HEIGHT }), // Correctly define the collision area based on the platform's size
        body({ isStatic: true }), // Static body to ensure proper collision
        anchor("bot"),
        "platform",
      ]);
      sections.push(platform); // Store the platform in the sections array
      platforms.push(platform);
    }
  }
}

// Function to create continuous side walls without gaps
function spawnSideWalls(y) {
  // Left wall
  for (let i = 0; i < WALL_HEIGHT_TILES; i++) {
    const leftWall = add([
      sprite("steel"), // Use steel sprite for wall
      pos(0, y - i * TILE_HEIGHT), // Position aligned to the tile grid, stacking vertically
      area({ width: TILE_WIDTH, height: TILE_HEIGHT }), // Correctly define the collision area based on the wall's size
      body({ isStatic: true }), // Static body to ensure proper collision
      anchor("bot"),
      "wall",
    ]);
    sections.push(leftWall); // Store the left wall in the sections array
  }

  // Right wall
  for (let i = 0; i < WALL_HEIGHT_TILES; i++) {
    const rightWall = add([
      sprite("steel"), // Use steel sprite for wall
      pos(width() - TILE_WIDTH, y - i * TILE_HEIGHT), // Position aligned to the tile grid, stacking vertically
      area({ width: TILE_WIDTH, height: TILE_HEIGHT }), // Correctly define the collision area based on the wall's size
      body({ isStatic: true }), // Static body to ensure proper collision
      anchor("bot"),
      "wall",
    ]);
    sections.push(rightWall); // Store the right wall in the sections array
  }
}

// Function to create the initial floor with platforms and walls
function createInitialPlatformsAndWalls() {
  const platformHeight =
    Math.floor(height() / TILE_HEIGHT) * TILE_HEIGHT - TILE_HEIGHT; // Height of the initial platform row in tile units
  const numPlatforms = Math.floor(width() / TILE_WIDTH); // Number of platforms to fit the screen width

  for (let i = 0; i < numPlatforms; i++) {
    const platform = add([
      sprite("grass"), // Use grass sprite for platform
      pos(i * TILE_WIDTH, platformHeight), // Position aligned to the tile grid
      area({ width: TILE_WIDTH, height: TILE_HEIGHT }), // Correctly define the collision area based on the platform's size
      body({ isStatic: true }), // Static body to ensure proper collision
      anchor("bot"),
      "platform",
    ]);
    sections.push(platform); // Store the platform in the sections array
  }

  // Add initial walls on both sides, filling the entire height
  for (let i = 0; i < WALL_HEIGHT_TILES; i++) {
    spawnSideWalls(platformHeight - i * TILE_HEIGHT);
  }
}

// ---------------------------------------------------
// player.js - Player Setup and Controls
// ---------------------------------------------------

scene("game", () => {
  // Reset sections array and lastY position on restart
  sections = [];
  lastY = Math.floor(height() / TILE_HEIGHT) * TILE_HEIGHT;

  // Create the initial row of platforms and walls
  createInitialPlatformsAndWalls();

  // Align the player spawn to the grid, placing them fully above the initial platform row
  const player = add([
    sprite("bean"),
    pos(width() / 2 - TILE_WIDTH / 2, lastY - TILE_HEIGHT * 2), // Centered above the initial platform row
    area({ width: TILE_WIDTH, height: TILE_HEIGHT * 2 }), // Player area defined by 1x2 tiles
    body(),
    anchor("bot"),
  ]);

  // Record the player's starting Y position
  const startY = player.pos.y;

  player.onUpdate(() => {
    // Camera only moves up when the player is near the top of the screen
    if (player.pos.y < camPos().y - CAMERA_THRESHOLD) {
      camPos(width() / 2, player.pos.y + CAMERA_THRESHOLD);
    }

    // Remove old sections below the camera
    sections.forEach((section, index) => {
      if (section.pos.y > camPos().y + DELETE_THRESHOLD) {
        section.destroy(); // Destroy the section
        sections.splice(index, 1); // Remove from sections array
      }
    });

    // Generate new sections as the camera moves up
    while (lastY > camPos().y - height()) {
      spawnPlatforms(lastY - PLATFORM_GAP_TILES * TILE_HEIGHT);
      spawnSideWalls(lastY - PLATFORM_GAP_TILES * TILE_HEIGHT);
      lastY -= PLATFORM_GAP_TILES * TILE_HEIGHT;
    }

    // Calculate the height climbed in meters
    const heightClimbed = (startY - player.pos.y) * UNIT_TO_METERS;
    heightLabel.text = `Height: ${heightClimbed.toFixed(1)} meters`;

    // Check if player falls below the screen
    if (player.pos.y > camPos().y + height() / 2) {
      go("lose", { maxHeight: heightClimbed.toFixed(1) });
    }
  });

  // Display height achieved
  const heightLabel = add([text("Height: 0.0 meters"), pos(24, 24), fixed()]);

  // Player controls
  function jump() {
    if (player.isGrounded()) {
      player.jump(JUMP_FORCE);
    }
  }

  onKeyPress("space", jump);
  onKeyDown("left", () => {
    player.move(-MOVE_SPEED, 0);
  });
  onKeyDown("right", () => {
    player.move(MOVE_SPEED, 0);
  });

  // Prevent the player from moving through walls
  player.onCollide("wall", () => {
    player.stop();
  });

  // Gamepad and mobile controls
  onGamepadButtonPress("south", jump);
  onClick(jump);
});

// ---------------------------------------------------
// scenes.js - Game Scenes
// ---------------------------------------------------

scene("lose", ({ maxHeight }) => {
  add([
    text(`You Lose! Height Achieved: ${maxHeight} meters`),
    pos(width() / 2, height() / 2),
    anchor("center"),
  ]);

  onKeyPress(() => go("game"));
});

// Start the game
go("game");
