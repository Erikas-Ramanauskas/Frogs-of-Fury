export function initGameSettings() {
    setGravity(3200);

    return {
        JUMP_FORCE: 1320,
        MOVE_SPEED: 480,
        FALL_DEATH: 2400,
        PLATFORM_GAP: 200,
        maxHeight: 0,
        lastY: height()
    };
}