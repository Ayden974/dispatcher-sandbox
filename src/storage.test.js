const storage = require("./storage");

describe("storage wrappers", () => {
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
          remove: jest.fn((keys, cb) => {
            const list = Array.isArray(keys) ? keys : [keys];
            for (const k of list) delete store[k];
            cb();
          }),
        },
      },
    };
  });

  afterEach(() => {
    delete global.chrome;
  });

  test("set stores items", async () => {
    await storage.set({ a: 1, b: "two" });
    expect(store).toEqual({ a: 1, b: "two" });
    expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
  });

  test("get retrieves a single key", async () => {
    store.foo = "bar";
    const result = await storage.get("foo");
    expect(result).toEqual({ foo: "bar" });
  });

  test("get retrieves multiple keys", async () => {
    store.a = 1;
    store.b = 2;
    store.c = 3;
    const result = await storage.get(["a", "c"]);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  test("get returns defaults for object input", async () => {
    store.known = "yes";
    const result = await storage.get({ known: "fallback", missing: "default" });
    expect(result).toEqual({ known: "yes", missing: "default" });
  });

  test("remove deletes a single key", async () => {
    store.x = 1;
    store.y = 2;
    await storage.remove("x");
    expect(store).toEqual({ y: 2 });
  });

  test("remove deletes multiple keys", async () => {
    store.x = 1;
    store.y = 2;
    store.z = 3;
    await storage.remove(["x", "z"]);
    expect(store).toEqual({ y: 2 });
  });

  test("rejects when chrome.storage.local is unavailable", async () => {
    delete global.chrome;
    await expect(storage.get("foo")).rejects.toThrow(/not available/);
    await expect(storage.set({ a: 1 })).rejects.toThrow(/not available/);
    await expect(storage.remove("a")).rejects.toThrow(/not available/);
  });

  test("rejects when chrome.runtime.lastError is set on get", async () => {
    chrome.runtime.lastError = { message: "boom" };
    await expect(storage.get("foo")).rejects.toThrow("boom");
  });

  test("rejects when chrome.runtime.lastError is set on set", async () => {
    chrome.runtime.lastError = { message: "fail-set" };
    await expect(storage.set({ a: 1 })).rejects.toThrow("fail-set");
  });

  test("rejects when chrome.runtime.lastError is set on remove", async () => {
    chrome.runtime.lastError = { message: "fail-rm" };
    await expect(storage.remove("a")).rejects.toThrow("fail-rm");
  });
});
