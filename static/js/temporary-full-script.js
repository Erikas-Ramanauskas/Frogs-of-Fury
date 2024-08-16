kaplay({
    background: [141, 183, 255],
});

// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");

loadSound("blip", "/examples/sounds/blip.mp3");
loadSound("hit", "/examples/sounds/hit.mp3");
loadSound("portal", "/examples/sounds/portal.mp3");

setGravity(3200);

const JUMP_FORCE = 2320;
const MOVE_SPEED = 480;
const FALL_DEATH = 2500;
const PLATFORM_HEIGHT = 32;
const PLATFORM_GAP = 200; // Vertical gap between platforms
const WALL_WIDTH = 64; // Width of the side walls
const UNIT_TO_METERS = 0.1; // Conversion factor: 1 game unit = 0.1 meters
const MAX_SECTIONS = 10; // Number of sections to maintain

let lastY = height(); // Track the last Y position where platforms were generated
let sections = []; // Array to keep track of current sections

// Function to generate a platform
function spawnPlatform(y) {
    const length = rand(2, 5) * 64; // Random length between 128 and 320
    add([
        rect(length, PLATFORM_HEIGHT),
        pos(rand(WALL_WIDTH, width() - length - WALL_WIDTH), y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "platform",
    ]);
}

// Function to create side walls
function spawnSideWalls(y) {
    // Left wall
    add([
        rect(WALL_WIDTH, PLATFORM_GAP + PLATFORM_HEIGHT),
        pos(-1, y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "wall",
    ]);
    
    // Right wall
    add([
        rect(WALL_WIDTH, PLATFORM_GAP + PLATFORM_HEIGHT),
        pos(width() - WALL_WIDTH + 1, y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "wall",
    ]);
}

// Function to create the initial floor with platforms and walls
function createInitialPlatformsAndWalls() {
    const platformHeight = height() - PLATFORM_HEIGHT;  // Height of the initial platform row
    const numPlatforms = Math.floor(width() / (64 * 2)); // Number of platforms to fit the screen width
    const platformWidth = width() / numPlatforms;  // Width of each platform

    for (let i = 0; i < numPlatforms; i++) {
        add([
            rect(platformWidth, PLATFORM_HEIGHT),
            pos(i * platformWidth, platformHeight),
            outline(4),
            color(34, 139, 34),
            area(),
            body({ isStatic: true }),
            anchor("bot"),
            "platform",
        ]);
    }

    // Add initial walls on both sides
    spawnSideWalls(platformHeight);
}

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
        camPos(player.pos.x, player.pos.y - height() / 3);

        // Remove old sections
        sections = sections.filter(section => {
            if (section.pos.y < player.pos.y - PLATFORM_GAP * MAX_SECTIONS) {
                section.destroy();
                return false; // Remove from sections array
            }
            return true; // Keep in sections array
        });

        // Generate new sections if needed
        while (player.pos.y < lastY - PLATFORM_GAP) {
            for (let i = 0; i < 5; i++) { // Generate 5 sections at a time
                spawnPlatform(lastY - PLATFORM_GAP);
                spawnSideWalls(lastY - PLATFORM_GAP);
                lastY -= PLATFORM_GAP;
            }
        }

        // Calculate the height climbed in meters
        const heightClimbed = (startY - player.pos.y) * UNIT_TO_METERS;
        heightLabel.text = `Height: ${heightClimbed.toFixed(1)} meters`;

        // Check fall death
        if (player.pos.y > height() + FALL_DEATH) {
            go("lose", { maxHeight: heightClimbed.toFixed(1) });
        }
    });

    // Display height achieved
    const heightLabel = add([
        text(`Height: 0.0 meters`),
        pos(24, 24),
        fixed(),
    ]);

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

scene("lose", ({ maxHeight }) => {
    add([
        text(`You Lose! Height Achieved: ${maxHeight} meters`),
        pos(width() / 2, height() / 2),
        anchor("center"),
    ]);

    onKeyPress(() => go("game"));
});

go("game");