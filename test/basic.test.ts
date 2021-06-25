import * as pf from "../src";

test("number", () => {
  const ns = pf.number();

  // Matched type will preserve original value
  const numbers = [-100, 0, 100, 10000000000000000];
  for (const n of numbers) {
    expect(ns.parse(n)).toBe(n);
  }

  // Unmatched types will be parsed according to specification
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
  const ss = pf.string();

  // Matched type will preserve original value
  const strings = ["", "absdc1234"];
  for (const s of strings) {
    expect(ss.parse(s)).toBe(s);
  }

  // Unmatched types will be parsed according to specification
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
  const bs = pf.boolean();

  // Matched type will preserve original value
  expect(bs.parse(true)).toBe(true);
  expect(bs.parse(false)).toBe(false);

  // Unmatched types will be parsed according to specification
  const testCases = [
    [null, false],
    [undefined, false],
    [123, true],
    ["", false],
    ["12jkj", true],
    ["False", false],
    ["false", false],
    ["FALSE", false],
    [[], false],
    [[1, 2], true],
  ];
  for (const [t, e] of testCases) {
    expect(bs.parse(t)).toBe(e);
  }
});

test("array", () => {
  const ans = pf.array(pf.number());

  // Matched type will preserve original value
  const numbers = [-100, 0, 100, 10000000000000000];
  const parsed = ans.parse(numbers);
  expect(parsed).toEqual(numbers);

  // Unmatched types will be parsed according to specification
  const faultyNumbers = ["-1", undefined, 123];
  const parsed2 = ans.parse(faultyNumbers);
  expect(parsed2).toEqual([-1, 0, 123]);
});

test("object", () => {
  const no = pf.object({
    n: pf.number(),
    s: pf.string(),
    o: pf.object({
      n2: pf.number(),
      b2: pf.boolean(),
    }),
  });

  const o1 = {
    // n: 0, `n` is missing
    s: 234,
    o: {
      n2: 1,
      // b2: "hey", `b2` is missing
    },
  };
  const e1 = {
    n: 0, // missing field will have default value
    s: "234",
    o: {
      // object fields should all be present and missing field have default value
      n2: 1,
      b2: false,
    },
  };
  expect(no.parse(o1)).toEqual(e1);

  const o2 = {
    n: 2,
  };
  const e2 = {
    n: 2,
    // missing field will have default value
    s: "",
    o: null, // default value for `object` is `null`
  };
  expect(no.parse(o2)).toEqual(e2);
});
