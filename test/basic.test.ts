import * as pb from "../src";

test("number", () => {
  const ns = pb.number();

  const numbers = [-100, 0, 100, 10000000000000000];
  for (const n of numbers) {
    expect(ns.parse(n)).toBe(n);
  }
  const testCases = [
    [null, 0],
    [undefined, 0],
    ["123abc", 0],
    ["-123", -123],
    [true, 1],
    [false, 0],
  ];
  for (const [t, e] of testCases) {
    expect(ns.parse(t)).toBe(e);
  }
});

test("string", () => {
  const ss = pb.string();

  const strings = ["", "absdc1234"];
  for (const s of strings) {
    expect(ss.parse(s)).toBe(s);
  }
  const testCases = [
    [null, ""],
    [undefined, ""],
    [true, "true"],
    [123, "123"],
  ];
  for (const [t, e] of testCases) {
    expect(ss.parse(t)).toBe(e);
  }
});

test("boolean", () => {
  const bs = pb.boolean();

  expect(bs.parse(true)).toBe(true);
  expect(bs.parse(false)).toBe(false);

  const testCases = [
    [null, false],
    [undefined, false],
    [123, true],
    ["", false],
    ["12jkj", true],
    ["False", false],
    ["false", false],
    ["FALSE", false],
  ];
  for (const [t, e] of testCases) {
    expect(bs.parse(t)).toBe(e);
  }
});

test("array", () => {
  const ans = pb.array(pb.number());
  const numbers = [-100, 0, 100, 10000000000000000];
  const parsed = ans.parse(numbers);
  expect(parsed).toEqual(numbers);

  const faultyNumbers = ["-1", undefined, 123];
  const parsed2 = ans.parse(faultyNumbers);
  expect(parsed2).toEqual([-1, 0, 123]);
});

test("object", () => {
  const no = pb.object({
    n: pb.number(),
    s: pb.string(),
    o: pb.object({
      n2: pb.number(),
      b2: pb.boolean(),
    }),
  });
  const o1 = {
    n: 23,
    s: 234,
    o: {},
  };
  const e1 = {
    n: 23,
    s: "234",
    o: {
      n2: 0,
      b2: false,
    },
  };
  expect(no.parse(o1)).toEqual(e1);
  const o2 = {
    n: 2,
  };
  const e2 = {
    n: 2,
    s: "",
    o: null,
  };
  expect(no.parse(o2)).toEqual(e2);
});
