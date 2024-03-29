document.addEventListener("keydown", logKey);
document.addEventListener("keyup", logKeyUp);
var keysDown = [];

function logKey(e) {
  for (var i = 0; i < keysDown.length; i++) {
    if (keysDown[i].key == e.code) {
      keysDown[i] = new KeyDown(e.code, new Date().getTime(), false);
      return;
    }
  }
  keysDown[keysDown.length] = new KeyDown(e.code, new Date().getTime(), true);
}

function logKeyUp(e) {
  for (var i = 0; i < keysDown.length; i++) {
    if (keysDown[i].key == e.code) {
      keysDown.splice(i, 1);
      return;
    }
  }
  var str = "";
  for (let i = 0; i < keysDown.length; i++) {
    const element = keysDown[i];
    str += " - " + element.key;
  }
}

export function getKey(key) {
  var key2 = "Key" + key.toLowerCase();
  for (var i = 0; i < keysDown.length; i++) {
    if (
      keysDown[i].key == "Key" + key ||
      keysDown[i].key == key2 ||
      keysDown[i].key == key
    ) {
      return true;
    }
  }
  return false;
}
export function getKeyOnce(key) {
  // Only returns true once. (Doesn't return on hold)
  var key2 = "Key" + key.toLowerCase();
  var returnVal = false;
  for (var i = 0; i < keysDown.length; i++) {
    if (
      keysDown[i].key == "Key" + key ||
      keysDown[i].key == key2 ||
      keysDown[i].key == key
    ) {
      if (!keysDown[i].once) {
        keysDown[i].once = true;
        returnVal = true;
      }
    }
  }
  return returnVal;
}

export function getAllKeys() {
  return keysDown;
}

function KeyDown(key, timeondown, downFrame) {
  this.key = key;
  this.timeondown = timeondown;
  this.downFrame = downFrame;
  this.once = false;
}