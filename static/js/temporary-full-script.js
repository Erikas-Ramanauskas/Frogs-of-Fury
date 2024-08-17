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
loadSprite(
  "lava",
  "data:image/png;base64,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"
);
loadSprite(
  "wall",
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAy1JREFUeF7tW01rFUEQTE4SjKiIICKI5ODB/+D//wOeRRARRFSMhJyURhrmTaanq3p63+6bbG552fTrqq7+mN7d8/dvr/6e3eOfcyHgyaOH95KCn7//nO0E7ArYU+BuDXh8eXFQE149f3qnRlzf3Jp14/LiwcHfPn/70bxW7Vq2aju1Ec+uXq/2P339fmDCrAEeARngxRMhIBu82q3By+8hAuroHwO8ONuLvhX5HvgQASX4HvCWw56TDJGlbj27rcjrZ7AC3r15eZArM4CnFFASwIKXL+oVpzUiH1ZANnhxJFL0UNl79j98/IJ1AVFAJFJeW1oTvCCHCXj94hnc4/VCL0prg08hwGpNUfC9dufZLCOEqnVIAacOfkgBM4APEzADeE2nX9c3WBfQIhgF77WjVoVdIufrmYQiYDbwQgZMQD0Ko61uq5FX/4cIQCSKtiOGUKTdofuHMAEzgB9KgeiIaw06CKGZkRdbcrSHB6GyBmwVfItcz1eaAM8gW/SyIh8BTw1CogDEWfaAgxCq0mcKKmJX7MEboXopWuZjdJOLOJkJXvO+VOkwAR54tugttW4vwacRkA2+drJXT5ict8DL52EFzAA+TACyGm+dG5AiulTOW2qiFXAM8EwrRUm1OghMAHpfYDTyS4Dv2QwRkNGPWwXv2OAlWPQkuAb4uuKjskcIpQiYBXxJKEwAc1+AiVBWr2cGqLJODROALh7YnGcGnSh46jDUUsCpgx8iYAvgR0bn8FpcJ7WSgDVyPgO82IB3gmUKKPge8CVznrXdUytNwAh4pC+rwrJU5aUqRcBs4KkUQJailjTXiDzaRmEFKAHMGos92rKyzyCWIuBUwQtRLd+p+wLIUlQjvqXIW+A1XeFR2CKgNYYuOd9n2x4iYA3wTN570adGYe9haVb2iHN1SmWDTydgyX1BNvihx+VZ6XvTWBlp1nar33vqKgMF7wQ1BVgHtwa+VhJMgPWIDCPNyKDD2O+dI6wbOcMEZOS9paos8NrzW74OEcCA701jrWofAe99RyoBLPiWc5HIW0UvIn/5H1gBVpRm+3x/c3R/dXZ/d/j/y9Oz5TaD5x+3u8o9CtQWewAAAABJRU5ErkJggg=="
);
loadSprite(
  "platform",
  "data:image/png;base64,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"
);
loadSprite(
  "dirt",
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA2dJREFUeF7lmz1uFUEQhNcIUoOQT0AAEgkXAHEBBCJCIibhACQcgCuQECORAbI4ARcghIATIAQOQTJoHhqYt56Zquru2X3Yjqyd/qn+umf2x/LeNE2/pjP8s5cAXHlzZ3p8+XiD4fnXc1s4atfZaynQ9ePz0+2DH1uxlVylmLlfK07Np6wt+z259W6CANBwoGKyfwkW+cybMNfANqC0m/ukxhzef/0PACq0RbVWYLqWE6L1GpiWT76+GICyCIvQHtReEWhqmNFnGvr53mF/AloAmOAeG7bDnhzJ9y+AFw9vTs8eXDLHe/rqW9PXEtfa4Z6OmsBHL9//mYAEIP+ogtWkKY+aA3XGoiHFrAJgBVqTlsV4QETkbwJAxEesIxgRBc917xSACKgfji5swtzY/0mFGwqAFcPa5Yrefjra/Hr36v6JItVYJwD0glNICyNWDGvHAKhp7NUUAiASmgqZsZcAMAHnNrsOoFfT0DPAAtPro26nVQD0JsY7TeEAvILUQ6mVTy2slrcWA07ACACWMV8NgEXs0j6eJsEJ8BSDhH0/uLYJf/HLR0+aCeVZ7S6AhEUB8NALeRDyCEC+oyG5AaAuowLR+uIAkCD2KRAJR+vW5/5SH9Mc6RBkAmYBqEC0PgrA/HY6DIA6SUvZuwB4RSoTxDzJsVO02m2QPS9YsPPuDQHg7RJbzEg7BYx0G1QCjywQxVZ0SocgE3hXJ6ilqwnA+va1JgDLd4ZwAGg8lXUVpmqftEhbQBGPbBmxpY11IpEOGQAjHCVN62qcRQAwohgbBsCaNuVhvjUBp6E4BmwTAOPM2uwKTHTrls+AUQBG7fHVALCgsp0HgGfaXBPgSawC6tl7dFQBsAFZu8hio2O5AESLie4y0yDXFvAAUPc8U4zl+wMNQBWM4ETHQ/la6+EAeoVZumgtrOZn+uOoKiACwChQFIB58taDxCiRlhelsknq1oKfxNYAwI6vxy770meAuhU8XYkojNUbDqC2NdSxVAF4tuMiANhuWO1YADW7M/U9YOcAsJ2zTgbjF74FmKTZ5r8CsLbYUfnpCRglgJ2YUflpAEsKjbhtsnrD7wJsp3p2XgCt2DlugpP/oQIC8IppdYIF1fK3vHRBAOoTGDtmI+xQY9C6+10AfW4eUbQSUwagBD9ttr8B7MVWLj1k/1QAAAAASUVORK5CYII="
);

// Load sounds
loadSound("blip", "/examples/sounds/blip.mp3");
loadSound("hit", "/examples/sounds/hit.mp3");
loadSound("portal", "/examples/sounds/portal.mp3");

setGravity(800);

const JUMP_FORCE = 650; // Updated jump force
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
  const heightLabel = add([
    text("Height: 0.0 meters"),
    pos(24, 24),
    fixed(),
    layer("ui"),
  ]);

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
  add([
    text(`You Lose! Height Achieved: ${maxHeight} meters`),
    pos(width() / 2, height() / 2),
    anchor("center"),
  ]);

  onKeyPress(() => go("game"));
});

// Start the game
go("game");
