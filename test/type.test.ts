import * as pb from "../src";

type Exact<A, B> = (<T>() => T extends A ? 1 : 0) extends <T>() => T extends B
  ? 1
  : 0
  ? A extends B
    ? B extends A
      ? unknown
      : never
    : never
  : never;

/** Fails when `actual` and `expected` have different types. */
function exactType<Actual, Expected>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  actual: Actual & Exact<Actual, Expected>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expected: Expected & Exact<Actual, Expected>
): Expected {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return null as any;
}

test("basic", () => {
  const t: any = null;
  const n = pb.number().parse(null);
  const s = pb.string().parse(null);
  const b = pb.boolean().parse(null);
  exactType(n, t as number);
  exactType(s, t as string);
  exactType(b, t as boolean);
});

test("structure", () => {
  const t: any = null;
  const as = pb.array(pb.string()).parse(null);
  const ab = pb.array(pb.boolean()).parse(null);
  const an = pb.array(pb.number()).parse(null);
  exactType(as, t as string[]);
  exactType(ab, t as boolean[]);
  exactType(an, t as number[]);

  const so = pb
    .object({
      n: pb.number(),
      s: pb.string(),
      b: pb.boolean(),
    })
    .parse(null);
  exactType(
    so,
    t as {
      n: number;
      s: string;
      b: boolean;
    } | null
  );

  const no = pb
    .object({
      n: pb.number(),
      o: pb.object({
        s: pb.string(),
      }),
    })
    .parse(null);
  exactType(
    no,
    t as {
      n: number;
      o: {
        s: string;
      } | null;
    } | null
  );
});
