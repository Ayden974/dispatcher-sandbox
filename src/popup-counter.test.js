const { createCounter, COUNTER_KEY } = require("./popup-counter");

describe("popup counter", () => {
  let store;

  beforeEach(() => {
    store = {};
    global.chrome = {
      runtime: {},
      storage: {
        local: {
          get: jest.fn((keys, cb) => {
            let result = {};
            if (keys === null || keys === undefined) {
              result = { ...store };
            } else if (typeof keys === "string") {
              if (keys in store) result[keys] = store[keys];
            } else if (Array.isArray(keys)) {
              for (const k of keys) {
                if (k in store) result[k] = store[k];
              }
            } else if (typeof keys === "object") {
              for (const k of Object.keys(keys)) {
                result[k] = k in store ? store[k] : keys[k];
              }
            }
            cb(result);
          }),
          set: jest.fn((items, cb) => {
            Object.assign(store, items);
            cb();
          }),
        },
      },
    };
  });

  afterEach(() => {
    delete global.chrome;
  });

  test("initial state = 0", async () => {
    const counter = createCounter();
    const value = await counter.load();
    expect(value).toBe(0);
    expect(counter.value).toBe(0);
  });

  test("increment by 1", async () => {
    const counter = createCounter();
    await counter.load();
    expect(counter.value).toBe(0);
    const after = await counter.increment();
    expect(after).toBe(1);
    expect(counter.value).toBe(1);
    expect(store[COUNTER_KEY]).toBe(1);
  });

  test("persistence across reload", async () => {
    const first = createCounter();
    await first.load();
    await first.increment();
    await first.increment();
    await first.increment();
    expect(first.value).toBe(3);
    expect(store[COUNTER_KEY]).toBe(3);

    const reloaded = createCounter();
    const restored = await reloaded.load();
    expect(restored).toBe(3);
    expect(reloaded.value).toBe(3);
  });
});
