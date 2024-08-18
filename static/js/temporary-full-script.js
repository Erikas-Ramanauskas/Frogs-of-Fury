// ---------------------------------------------------
// assets.js - Asset Loading and Configuration
// ---------------------------------------------------

import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";

import { sprites } from "./assets.js";

kaplay({
  background: [141, 183, 255],
});

// Load assets
loadSprite("bean", "../static/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("lava", sprites.lava); // moved all sprites assets to assets.js
loadSprite("wall", sprites.wall);
loadSprite("platform", sprites.platform);
loadSprite("dirt", sprites.dirt);

// Load sounds
loadSound("blip", "/examples/sounds/blip.mp3");
loadSound("hit", "/examples/sounds/hit.mp3");
loadSound("portal", "/examples/sounds/portal.mp3");

setGravity(800);

const JUMP_FORCE = 650; // Updated jump force
const MOVE_SPEED = 480;
const TILE_WIDTH = 80;
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

// ---------------------------------------------------
// platform.js - Platform and Wall Generation
// ---------------------------------------------------

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

// ---------------------------------------------------
// player.js - Player Setup and Controls
// ---------------------------------------------------

let players = []; // Array to keep track of all players

scene("game", () => {
  // Reset sections array and lastY position on restart
  sections = [];
  lastY = Math.floor(height() / TILE_HEIGHT) * TILE_HEIGHT;
  isFirstRow = true; // Reset flag for platform generation

  // Create the initial row of platforms and walls
  createInitialPlatformsAndWalls();

  // Function to create a new player and add to the players array
  function createPlayer() {
    console.log(width() / 2 - TILE_WIDTH / 2, lastY - TILE_HEIGHT * 2);
    const player = add([
      sprite("bean"),
      pos(width() / 2 - TILE_WIDTH / 2, lastY - TILE_HEIGHT * 2), // Centered above the initial platform row
      area({ width: TILE_WIDTH, height: TILE_HEIGHT * 2 }), // Player area defined by 1x2 tiles
      body(),
      anchor("bot"),
    ]);
    players.push(player); // Add player to the array
    return player;
  }

  // Create the initial player
  const player = createPlayer();

  // Record the player's starting Y position
  const startY = player.pos.y;

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

  // Function to check if all players are dead
  function checkGameOver() {
    if (players.length === 0) {
      go("lose", { maxHeight: (startY - player.pos.y) * UNIT_TO_METERS });
    }
  }

  player.onUpdate(() => {
    // Move lava up gradually
    const lavaTiles = get("lava");
    lavaTiles.forEach((lava) => {
      lava.move(0, -LAVA_MOVE_SPEED * dt());
    });

    // Destroy the player if they touch the lava
    lavaTiles.forEach((lava) => {
      if (player.isColliding(lava)) {
        player.destroy();
        players = players.filter((p) => p !== player); // Remove player from the list
        checkGameOver(); // Check if game is over
        return; // Exit loop
      }
    });

    // Gradually move the camera upwards
    const currentCamPos = camPos();
    camPos(currentCamPos.x, currentCamPos.y + CAMERA_MOVE_SPEED * dt());

    // Camera only moves up when the player is near the top of the screen
    if (player.pos.y < currentCamPos.y - CAMERA_THRESHOLD) {
      camPos(width() / 2, player.pos.y + CAMERA_THRESHOLD);
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
    const heightClimbed = (startY - player.pos.y) * UNIT_TO_METERS;
    heightLabel.text = `Height: ${heightClimbed.toFixed(1)} meters`;

    // Check if player falls below the screen
    if (player.pos.y > camPos().y + height() / 2) {
      player.destroy();
      players = players.filter((p) => p !== player); // Remove player from the list
      checkGameOver(); // Check if game is over
    }
  });

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
  add([text(`You Lose! Height Achieved: ${maxHeight} meters`), pos(width() / 2, height() / 2), anchor("center")]);

  onKeyPress(() => go("game"));
});

// Start the game
go("game");
