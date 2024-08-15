// player.js
export function handlePlayerMovement(player, settings) {
  player.onUpdate(() => {
    camPos(player.pos.x, player.pos.y - height() / 3);

    if (player.pos.y < settings.lastY - height()) {
      spawnPlatform(settings.lastY - height() - settings.PLATFORM_GAP);
      spawnSideWalls(
        settings.lastY - height() - settings.PLATFORM_GAP,
        settings.PLATFORM_GAP
      );
      settings.lastY -= settings.PLATFORM_GAP;
    }

    if (player.pos.y < settings.maxHeight) {
      settings.maxHeight = player.pos.y;
    }

    if (player.pos.y > height() + settings.FALL_DEATH) {
      go("lose", { maxHeight: -settings.maxHeight });
    }
  });
}

export function handlePlayerInput(player, settings) {
  function jump() {
    if (player.isGrounded()) {
      player.jump(settings.JUMP_FORCE);
    }
  }

  onKeyPress("space", jump);
  onKeyDown("left", () => {
    player.move(-settings.MOVE_SPEED, 0);
  });
  onKeyDown("right", () => {
    player.move(settings.MOVE_SPEED, 0);
  });

  onGamepadButtonPress("south", jump);
  onClick(jump);
}
