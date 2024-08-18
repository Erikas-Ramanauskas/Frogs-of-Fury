// Define weapon types
const WEAPONS = {
  standard: { speed: 300, bulletSprite: "bullet", damage: 1, fireRate: 600, collisionArea: [4, 4] }, // 300 shots per minute (1 per second)
  split: {
    speed: 300,
    pickupSprite: "pickup_split",
    bulletSprite: "bullet_split",
    damage: 2,
    fireRate: 300,
    collisionArea: [10, 10],
  },
  laser: {
    speed: 600,
    pickupSprite: "pickup_laser",
    bulletSprite: "bullet_laser",
    damage: 2,
    fireRate: 400,
    collisionArea: [15, 3],
  },
  rocket: {
    speed: 200,
    pickupSprite: "pickup_rocket",
    bulletSprite: "bullet_rocket",
    damage: 4,
    fireRate: 100,
    collisionArea: [23, 9],
    explosionArea: 50,
  },
};

export { WEAPONS };
