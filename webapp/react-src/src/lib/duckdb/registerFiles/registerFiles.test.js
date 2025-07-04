import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerFile, registerFiles } from "./registerFiles/registerFiles";
import { getDuckDB } from "./duckdbClient";

// Mock getDuckDB and db.registerFileText
vi.mock("./duckdbClient", () => {
  const registerFileText = vi.fn(() => Promise.resolve("ok"));
  return {
    getDuckDB: vi.fn(() => Promise.resolve({ registerFileText })),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerFile", () => {
  it("registers a single file", async () => {
    const file = {
      name: "test.csv",
      text: () => Promise.resolve("file content"),
    };
    const db = await getDuckDB();
    await registerFile(file);
    expect(db.registerFileText).toHaveBeenCalledWith(
      "test.csv",
      "file content"
    );
  });

  it("uses provided db instance if given", async () => {
    const file = {
      name: "test2.csv",
      text: () => Promise.resolve("abc"),
    };
    const db = await getDuckDB();
    await registerFile(file, db);
    expect(db.registerFileText).toHaveBeenCalledWith("test2.csv", "abc");
  });
});

describe("registerFiles", () => {
  let files;
  beforeEach(() => {
    files = [
      { name: "a.csv", text: () => Promise.resolve("A") },
      { name: "b.csv", text: () => Promise.resolve("B") },
    ];
  });

  it("registers multiple files", async () => {
    const db = await getDuckDB();
    await registerFiles(files);
    expect(db.registerFileText).toHaveBeenCalledWith("a.csv", "A");
    expect(db.registerFileText).toHaveBeenCalledWith("b.csv", "B");
    expect(db.registerFileText).toHaveBeenCalledTimes(2);
  });

  it("returns a promise that resolves when all files are registered", async () => {
    const result = await registerFiles(files);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });
});
