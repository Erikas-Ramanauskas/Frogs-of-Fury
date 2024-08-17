// ---------------------------------------------------
// assets.js - Asset Loading and Configuration
// ---------------------------------------------------
kaplay({
    background: [141, 183, 255],
});

// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");

loadSound("blip", "/examples/sounds/blip.mp3");
loadSound("hit", "/examples/sounds/hit.mp3");
loadSound("portal", "/examples/sounds/portal.mp3");

// ---------------------------------------------------
// config.js - Game Configuration and Constants
// ---------------------------------------------------

setGravity(3200);

const JUMP_FORCE = 2320;
const MOVE_SPEED = 480;
const FALL_DEATH = 2500;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;
const WALL_HEIGHT_TILES = 3; // Height of wall sections in tiles
const PLATFORM_HEIGHT_TILES = 1; // Platform height in tiles
const PLATFORM_GAP_TILES = 3; // Vertical gap between platforms in tiles
const PLATFORMS_PER_ROW = 3; // Number of platforms per row
const UNIT_TO_METERS = 0.1; // Conversion factor: 1 game unit = 0.1 meters
const CAMERA_SPEED = 120; // Camera upward speed
const CAMERA_THRESHOLD = height() / 3; // Height threshold to start moving camera
const DELETE_THRESHOLD = 600; // Distance below the camera to delete objects

let lastY = height(); // Track the last Y position where platforms were generated
let sections = []; // Array to keep track of current sections

// ---------------------------------------------------
// platform.js - Platform and Wall Generation
// ---------------------------------------------------

// Function to generate a platform
function spawnPlatform(y) {
    const length = rand(2, 5) * 64; // Random length between 128 and 320
    const platform = add([
        rect(length, PLATFORM_HEIGHT),
        pos(rand(WALL_WIDTH, width() - length - WALL_WIDTH), y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "platform",
    ]);
    sections.push(platform); // Store the platform in the sections array
}

// Function to create side walls
function spawnSideWalls(y) {
    // Left wall
    const leftWall = add([
        rect(WALL_WIDTH, PLATFORM_GAP + PLATFORM_HEIGHT),
        pos(-1, y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "wall",
    ]);
    sections.push(leftWall); // Store the left wall in the sections array
    
    // Right wall
    const rightWall = add([
        rect(WALL_WIDTH, PLATFORM_GAP + PLATFORM_HEIGHT),
        pos(width() - WALL_WIDTH + 1, y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "wall",
    ]);
    sections.push(rightWall); // Store the right wall in the sections array
}

// Function to create the initial floor with platforms and walls
function createInitialPlatformsAndWalls() {
    const platformHeight = height() - PLATFORM_HEIGHT;  // Height of the initial platform row
    const numPlatforms = Math.floor(width() / (64 * 2)); // Number of platforms to fit the screen width
    const platformWidth = width() / numPlatforms;  // Width of each platform

    for (let i = 0; i < numPlatforms; i++) {
        const platform = add([
            rect(platformWidth, PLATFORM_HEIGHT),
            pos(i * platformWidth, platformHeight),
            outline(4),
            color(34, 139, 34),
            area(),
            body({ isStatic: true }),
            anchor("bot"),
            "platform",
        ]);
        sections.push(platform); // Store the platform in the sections array
    }

    // Add initial walls on both sides
    spawnSideWalls(platformHeight);
}

// ---------------------------------------------------
// player.js - Player Setup and Controls
// ---------------------------------------------------

scene("game", () => {
    // Create the initial row of platforms and walls
    createInitialPlatformsAndWalls();

    // Initialize lastY and player
    lastY = height();
    const player = add([
        sprite("bean"),
        pos(width() / 2, height() - PLATFORM_HEIGHT - 1),
        area(),
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
            spawnPlatform(lastY - PLATFORM_GAP);
            spawnSideWalls(lastY - PLATFORM_GAP);
            lastY -= PLATFORM_GAP;
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
    const heightLabel = add([
        text(`Height: 0.0 meters`),
        pos(24, 24),
        fixed(),
    ]);

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

go("game");
