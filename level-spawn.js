kaplay({
  background: [141, 183, 255],
});

// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("spike", "/sprites/spike.png");
loadSprite("coin", "/sprites/coin.png");
loadSound("coin", "/examples/sounds/score.mp3");
loadSound("powerup", "/examples/sounds/powerup.mp3");
loadSound("blip", "/examples/sounds/blip.mp3");
loadSound("hit", "/examples/sounds/hit.mp3");
loadSound("portal", "/examples/sounds/portal.mp3");

setGravity(3200);

const JUMP_FORCE = 1320;
const MOVE_SPEED = 480;
const FALL_DEATH = 2400;
const PLATFORM_GAP = 200; // Vertical gap between platforms

let score = 0;

// Function to generate a platform
function spawnPlatform(y, length = rand(2, 5) * 64) {
  const platform = add([
    rect(length, 32),
    pos(rand(64, width() - length - 64), y), // Leave space on the sides for walls
    outline(4),
    color(34, 139, 34),
    area(),
    body({ isStatic: true }),
    anchor("bot"),
    "platform",
  ]);

  // Randomly decide to add a coin or an enemy on the platform
  if (rand() > 0.7) {
    add([
      sprite("coin"),
      pos(platform.pos.x + length / 2, y - 32),
      area(),
      "coin",
    ]);
  } else if (rand() > 0.9) {
    add([
      sprite("spike"),
      pos(platform.pos.x + length / 2, y - 32),
      area(),
      "danger",
    ]);
  }
}

// Function to create side walls
function spawnSideWalls(y) {
  add([
    rect(64, PLATFORM_GAP),
    pos(-1, y), // Shift left wall slightly left
    outline(4),
    color(34, 139, 34),
    area(),
    body({ isStatic: true }),
    anchor("bot"),
    "wall",
  ]);

  add([
    rect(64, PLATFORM_GAP),
    pos(width() - 63, y), // Shift right wall slightly right
    outline(4),
    color(34, 139, 34),
    area(),
    body({ isStatic: true }),
    anchor("bot"),
    "wall",
  ]);
}

// Function to create the initial floor with no gaps and add initial walls
function createInitialPlatformsAndWalls() {
  const platformHeight = height() - 32; // Height of the initial platform row
  const numPlatforms = 5; // Number of platforms in the initial row
  const platformWidth = width() / numPlatforms; // Width of each platform

  for (let i = 0; i < numPlatforms; i++) {
    add([
      rect(platformWidth, 32),
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

scene("game", ({ coins } = { coins: 0 }) => {
  // Create the initial row of platforms with no gaps and the initial walls
  createInitialPlatformsAndWalls();

  const player = add([
    sprite("bean"),
    pos(width() / 2, height() - 64), // Start player on the initial platforms
    area(),
    body(),
    anchor("bot"),
  ]);

  // Start with some platforms and side walls above the initial platforms
  let lastY = height() - 32;
  for (let i = 1; i <= 5; i++) {
    spawnPlatform(lastY - i * PLATFORM_GAP);
    spawnSideWalls(lastY - i * PLATFORM_GAP);
  }

  player.onUpdate(() => {
    camPos(player.pos.x, player.pos.y - height() / 3);

    // Check if we need to spawn new platforms and walls off-screen
    if (player.pos.y < lastY - height()) {
      spawnPlatform(lastY - height());
      spawnSideWalls(lastY - height());
      lastY -= PLATFORM_GAP;
      score += 1;
    }

    // Check fall death
    if (player.pos.y > height() + FALL_DEATH) {
      go("lose", { score });
    }
  });

  player.onCollide("danger", () => {
    go("lose", { score });
    play("hit");
  });

  player.onCollide("coin", (c) => {
    destroy(c);
    play("coin");
    coins += 1;
    coinsLabel.text = `Coins: ${coins}`;
  });

  // Display score and coins
  const scoreLabel = add([text(`Score: ${score}`), pos(24, 24), fixed()]);

  const coinsLabel = add([text(`Coins: ${coins}`), pos(24, 48), fixed()]);

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

  // Gamepad and mobile controls
  onGamepadButtonPress("south", jump);
  onClick(jump);
});

scene("lose", ({ score }) => {
  add([
    text(`You Lose! Score: ${score}`),
    pos(width() / 2, height() / 2),
    anchor("center"),
  ]);

  onKeyPress(() => go("game"));
});

go("game");
