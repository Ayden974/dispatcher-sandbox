const COUNTER_KEY = "counter";

function storageGet(keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(keys, (items) => {
        const err = chrome.runtime && chrome.runtime.lastError;
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

function storageSet(items) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(items, () => {
        const err = chrome.runtime && chrome.runtime.lastError;
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

function createCounter() {
  let count = 0;
  return {
    async load() {
      const result = await storageGet({ [COUNTER_KEY]: 0 });
      const value = Number(result[COUNTER_KEY]);
      count = Number.isFinite(value) ? value : 0;
      return count;
    },
    async increment() {
      count += 1;
      await storageSet({ [COUNTER_KEY]: count });
      return count;
    },
    get value() {
      return count;
    },
  };
}

async function init() {
  const spanEl = document.getElementById("counter-value");
  const btnEl = document.getElementById("inc-btn");
  const counter = createCounter();

  function render() {
    if (spanEl) spanEl.textContent = String(counter.value);
  }

  if (btnEl) {
    btnEl.addEventListener("click", async () => {
      await counter.increment();
      render();
    });
  }

  await counter.load();
  render();
  return counter;
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COUNTER_KEY, createCounter, init };
}
