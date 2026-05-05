function getStorage() {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
    throw new Error("chrome.storage.local is not available");
  }
  return chrome.storage.local;
}

function get(keys) {
  return new Promise((resolve, reject) => {
    try {
      getStorage().get(keys, (items) => {
        const err = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.lastError;
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve(items);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function set(items) {
  return new Promise((resolve, reject) => {
    try {
      getStorage().set(items, () => {
        const err = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.lastError;
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

function remove(keys) {
  return new Promise((resolve, reject) => {
    try {
      getStorage().remove(keys, () => {
        const err = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.lastError;
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { get, set, remove };
}
if (typeof window !== "undefined") {
  window.storage = { get, set, remove };
}
