import { describe, it, expect } from "vitest";
import { tinybarToHbar } from "../src/lib/format.js";

describe("tinybarToHbar", () => {
  it("converts product prices", () => {
    expect(tinybarToHbar("1000000")).toBe("0.01");
    expect(tinybarToHbar("2000000")).toBe("0.02");
    expect(tinybarToHbar("5000000")).toBe("0.05");
  });
  it("converts whole HBAR", () => {
    expect(tinybarToHbar("100000000")).toBe("1");
  });
});
