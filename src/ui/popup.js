(function () {
  const COUNTER_KEY = "counter";

  const countEl = document.getElementById("count");
  const incBtn = document.getElementById("inc");
  const decBtn = document.getElementById("dec");
  const resetBtn = document.getElementById("reset");

  let count = 0;

  function render() {
    countEl.textContent = String(count);
  }

  async function persist() {
    try {
      await window.storage.set({ [COUNTER_KEY]: count });
    } catch (e) {
      console.error("Failed to persist counter:", e);
    }
  }

  async function load() {
    try {
      const result = await window.storage.get({ [COUNTER_KEY]: 0 });
      const value = Number(result[COUNTER_KEY]);
      count = Number.isFinite(value) ? value : 0;
    } catch (e) {
      console.error("Failed to load counter:", e);
      count = 0;
    }
    render();
  }

  async function update(delta) {
    count += delta;
    render();
    await persist();
  }

  async function reset() {
    count = 0;
    render();
    await persist();
  }

  incBtn.addEventListener("click", () => update(1));
  decBtn.addEventListener("click", () => update(-1));
  resetBtn.addEventListener("click", reset);

  load();
})();
