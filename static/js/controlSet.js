import { player1Controls, player2Controls } from "./controlKeys.js";

// This file controls a setting of keys in controls.html

document.addEventListener("DOMContentLoaded", () => {
  const controls = ["up", "down", "left", "right", "jump", "shoot"];
  const modal = document.getElementById("modal");
  const currentActionSpan = document.getElementById("current-action");
  const currentPlayerSpan = document.getElementById("current-player");
  let currentAction = "";
  let currentPlayer = "";

  // Load controls from localStorage or use the current defaults
  controls.forEach((control) => {
    ["1", "2"].forEach((player) => {
      const storedKey =
        localStorage.getItem(`control-player${player}-${control}`) || getDefaultControl(control, player);
      document.getElementById(`player${player}-${control}-key`).textContent = storedKey;
      if (player === "1") {
        player1Controls[control] = storedKey;
      } else {
        player2Controls[control] = storedKey;
      }
    });
  });

  // Handle control item click
  document.querySelectorAll(".control-item").forEach((item) => {
    item.addEventListener("click", () => {
      currentAction = item.getAttribute("data-action");
      currentPlayer = item.getAttribute("data-player");
      currentActionSpan.textContent = currentAction.charAt(0).toUpperCase() + currentAction.slice(1);
      currentPlayerSpan.textContent = currentPlayer;
      modal.classList.add("show");
    });
  });

  // Handle modal close
  document.addEventListener("keydown", (event) => {
    if (modal.classList.contains("show")) {
      const key = convertKeyToKaboomFormat(event.key);
      localStorage.setItem(`control-player${currentPlayer}-${currentAction}`, key);
      document.getElementById(`player${currentPlayer}-${currentAction}-key`).textContent = key;
      if (currentPlayer === "1") {
        player1Controls[currentAction] = key;
      } else {
        player2Controls[currentAction] = key;
      }
      modal.classList.remove("show");
      currentAction = "";
      currentPlayer = "";
    }
  });

  // Get default control based on player
  function getDefaultControl(action, player) {
    if (player === "1") {
      return player1Controls[action];
    } else if (player === "2") {
      return player2Controls[action];
    }
  }

  function convertKeyToKaboomFormat(key) {
    const keyMap = {
      " ": "space",
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      Control: "control",
      Alt: "alt",
      Meta: "meta",
      Shift: "shift",
      Enter: "enter",
      Backspace: "backspace",
      Escape: "escape",
      Tab: "tab",
      "`": "`",
      "-": "-",
      "=": "=",
      "[": "[",
      "]": "]",
      "\\": "\\",
      ";": ";",
      "'": "'",
      ",": ",",
      ".": ".",
      "/": "/",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      0: "0",
      F1: "f1",
      F2: "f2",
      F3: "f3",
      F4: "f4",
      F5: "f5",
      F6: "f6",
      F7: "f7",
      F8: "f8",
      F9: "f9",
      F10: "f10",
      F11: "f11",
      F12: "f12",
      Q: "q",
      W: "w",
      E: "e",
      R: "r",
      T: "t",
      Y: "y",
      U: "u",
      I: "i",
      O: "o",
      P: "p",
      A: "a",
      S: "s",
      D: "d",
      F: "f",
      G: "g",
      H: "h",
      J: "j",
      K: "k",
      L: "l",
      Z: "z",
      X: "x",
      C: "c",
      V: "v",
      B: "b",
      N: "n",
      M: "m",
    };
    return keyMap[key] || key.toLowerCase();
  }
});
