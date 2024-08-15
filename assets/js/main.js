// main.js
import { loadAssets } from "./assets.js";
import { initGameSettings } from "./config.js";
import { gameScene, loseScene } from "./scenes.js";

loadAssets();

const gameSettings = initGameSettings();

scene("game", () => gameScene(gameSettings));
scene("lose", ({ maxHeight }) => loseScene(maxHeight));

go("game");
