import kaplay from "https://unpkg.com/kaplay@3001.0.0-alpha.20/dist/kaplay.mjs";
// start kaplay

import { player1Controls, player2Controls, loadPlayerControls } from "./controlKeys.js";

// This function loads controls from localStorage and updates the global control variables.
loadPlayerControls();

// Start a kaboom game
kaplay({
  // Scale the whole game up
  scale: 4,
  // Set the default font
  font: "monospace",
});

// Loading a multi-frame sprite
loadSprite("dino", "../static/sprites/dino.png", {
  // The image contains 9 frames layed out horizontally, slice it into individual frames
  sliceX: 9,
  // Define animations
  anims: {
    idle: {
      // Starts from frame 0, ends at frame 3
      from: 0,
      to: 3,
      // Frame per second
      speed: 5,
      loop: true,
    },
    run: {
      from: 4,
      to: 7,
      speed: 10,
      loop: true,
    },
    // This animation only has 1 frame
    jump: 8,
  },
});

const SPEED = 120;
const JUMP_FORCE = 240;

setGravity(640);

// Add our player1 character
const player1 = add([sprite("dino"), pos(120, 80), anchor("center"), area(), body()]);

// Add our player2 character
const player2 = add([sprite("dino"), pos(180, 80), anchor("center"), area(), body()]);

// .play is provided by sprite() component, it starts playing the specified animation (the animation information of "idle" is defined above in loadSprite)
player1.play("idle");
player2.play("idle");

// Add a platform
add([rect(width(), 24), area(), outline(1), pos(0, height() - 24), body({ isStatic: true })]);

// Switch to "idle" or "run" animation when player1 hits ground
player1.onGround(() => {
  if (!isKeyDown(player1Controls.left) && !isKeyDown(player1Controls.right)) {
    player1.play("idle");
  } else {
    player1.play("run");
  }
});

player1.onAnimEnd((anim) => {
  if (anim === "idle") {
    // You can also register an event that runs when certain anim ends
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
  // .play() will reset to the first frame of the anim, so we want to make sure it only runs when the current animation is not "run"
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
    // Only reset to "idle" if player1 is not holding any of these keys
    if (player1.isGrounded() && !isKeyDown(player1Controls.left) && !isKeyDown(player1Controls.right)) {
      player1.play("idle");
    }
  });
});

const getInfo1 = () => `Anim: ${player1.curAnim()}Frame: ${player1.frame}`.trim();

// Switch to "idle" or "run" animation when player2 hits ground
player2.onGround(() => {
  if (!isKeyDown(player2Controls.left) && !isKeyDown(player2Controls.right)) {
    player2.play("idle");
  } else {
    player2.play("run");
  }
});

player2.onAnimEnd((anim) => {
  if (anim === "idle") {
    // You can also register an event that runs when certain anim ends
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
  // .play() will reset to the first frame of the anim, so we want to make sure it only runs when the current animation is not "run"
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
    // Only reset to "idle" if player2 is not holding any of these keys
    if (player2.isGrounded() && !isKeyDown(player2Controls.left) && !isKeyDown(player2Controls.right)) {
      player2.play("idle");
    }
  });
});

// Add some text to show the current animation
const label = add([text(getInfo1(), { size: 12 }), color(0, 0, 0), pos(4)]);

label.onUpdate(() => {
  label.text = getInfo1();
});

// Check out https://kaboomjs.com#SpriteComp for everything sprite() provides
