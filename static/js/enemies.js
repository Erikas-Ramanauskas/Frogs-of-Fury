const enemies = [
  {
    name: "snake",
    spriteURL: "../static/sprites/snake_sprite.png",
    health: 100,
    speed: 20,
    sliceX: 3,
    sliceY: 1,
    scale: 0.5,
    anims: {
      idle: 2,
      move: { from: 0, to: 1, speed: 8, loop: true },
    },
    fly: false,
  },
  {
    name: "mosquito",
    spriteURL: "../static/sprites/mosquito_sprite.png",
    health: 70,
    speed: 30,
    sliceX: 2,
    sliceY: 1,
    scale: 0.5,
    anims: {
      idle: 1,
      move: { from: 0, to: 1, speed: 8, loop: true },
    },
    fly: true,
  },
];

export { enemies };
