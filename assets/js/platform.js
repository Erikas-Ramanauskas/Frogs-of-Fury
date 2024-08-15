// platforms.js
export function spawnPlatform(y, length = rand(2, 5) * 64) {
    add([
        rect(length, 32),
        pos(rand(64, width() - length - 64), y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "platform",
    ]);
}

export function spawnSideWalls(y, PLATFORM_GAP) {
    add([
        rect(64, PLATFORM_GAP),
        pos(-1, y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "wall",
    ]);

    add([
        rect(64, PLATFORM_GAP),
        pos(width() - 63, y),
        outline(4),
        color(34, 139, 34),
        area(),
        body({ isStatic: true }),
        anchor("bot"),
        "wall",
    ]);
}

export function createInitialPlatformsAndWalls(PLATFORM_GAP) {
    const platformHeight = height() - 32;
    const numPlatforms = 10;
    const platformWidth = width() / numPlatforms;

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

    spawnSideWalls(platformHeight, PLATFORM_GAP);
}
