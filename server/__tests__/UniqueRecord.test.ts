import { UniqueRecord } from "utils";

describe("UniqueRecord", () => {
  let record: UniqueRecord<string, string>;

  beforeEach(() => {
    record = new UniqueRecord<string, string>();
  });

  test("should add a key-value pair", () => {
    record.set("key1", "value1");
    expect(record.record).toEqual({ key1: "value1" });
  });

  test("should not allow duplicate values", () => {
    record.set("key1", "value1");
    record.set("key2", "value1");
    expect(record.record).toEqual({ key1: "value1" });
  });

  test("should allow updating a value", () => {
    record.set("key1", "value1");
    record.set("key1", "value2");
    expect(record.record).toEqual({ key1: "value2" });
  });

  test("should allow deleting a key", () => {
    record.set("key1", "value1");
    expect(record.remove("key1")).toBe(true);
    expect(record.remove("key1")).toBe(false);
    expect(record.record).toEqual({});
  });
});