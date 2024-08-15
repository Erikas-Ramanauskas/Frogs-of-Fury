// scenes.js
import { createInitialPlatformsAndWalls, spawnPlatform, spawnSideWalls } from './platforms.js';
import { handlePlayerMovement, handlePlayerInput } from './player.js';

export function gameScene(gameSettings) {
    createInitialPlatformsAndWalls(gameSettings.PLATFORM_GAP);

    const player = add([
        sprite("bean"),
        pos(width() / 2, height() - 64),
        area(),
        body(),
        anchor("bot"),
    ]);

    for (let i = 1; i <= 5; i++) {
        spawnPlatform(gameSettings.lastY - i * gameSettings.PLATFORM_GAP);
        spawnSideWalls(gameSettings.lastY - i * gameSettings.PLATFORM_GAP, gameSettings.PLATFORM_GAP);
    }

    handlePlayerMovement(player, gameSettings);

    const heightLabel = add([
        text(() => `Height: ${-gameSettings.maxHeight.toFixed(0)} units`),
        pos(24, 24),
        fixed(),
    ]);

    handlePlayerInput(player, gameSettings);
}

export function loseScene(maxHeight) {
    add([
        text(`You Lose! Height Achieved: ${maxHeight.toFixed(0)} units`),
        pos(width() / 2, height() / 2),
        anchor("center"),
    ]);

    onKeyPress(() => go("game"));
}
