/// Number schema
/// ```
/// const s = pf.number();
/// const v = s.parse(false); // v's value will be 0
/// ```
export function number(): PNumber {
  return new PNumber();
}

/// String schema
/// ```
/// const s = pf.string();
/// const v = s.parse(42); // v's value will be "42"
/// ```
export function string(): PString {
  return new PString();
}

/// Boolean schema
/// ```
/// const s = pf.boolean();
/// const v = s.parse("false"); // v's value will be `false`
/// ```
export function boolean(): PBoolean {
  return new PBoolean();
}

/// Array schema
/// ```
/// const s = pf.array(pf.number());
/// const v = s.parse([1, "2", 3]); // v's value will be `[1, 2, 3]`
/// ```
export function array<T extends Schema>(schema: T): PArray<T> {
  return new PArray(schema);
}

/// Object schema
/// ```
/// const s = pf.object({ a: pf.number(), b: pf.string() });
/// const v = s.parse({ a: 1, b: 2 }); // v's value will be `{ a: 1, b: "2" }`
/// const v2 = s.parse(2); // v's value will be `null`
/// ```
export function object<T extends Record<string, Schema>>(
  schema: T
): PObject<T> {
  return new PObject(schema);
}

/**
 * Enumeration type, member type can be number or string.
 * The default value for string enum is empty string. For number enum the default is 0;
 * @param values Valid values for the enumeration
 */
export function enumeration<T extends number | string>(values: T[]): PEnum<T> {
  return new PEnum<T>(values);
}

interface Schema {
  parse(input: unknown): unknown;
}

class PNumber {
  parse(input: unknown): number {
    if (typeof input === "number") {
      return input;
    } else if (typeof input === "string") {
      const parsed = Number(input);
      return isNaN(parsed) ? 0 : parsed;
    } else if (typeof input === "boolean") {
      return input ? 1 : 0;
    }
    return 0;
  }
}

class PString {
  parse(input: unknown): string {
    if (typeof input === "string") {
      return input;
    } else if (typeof input === "boolean" || typeof input === "number") {
      return input.toString();
    }
    return "";
  }
}

class PBoolean {
  parse(input: unknown): boolean {
    if (typeof input === "boolean") {
      return input;
    } else if (typeof input === "string") {
      if (input.toLowerCase() === "false") {
        return false;
      }
    } else if (Array.isArray(input)) {
      return input.length > 0;
    }
    return !!input;
  }
}

class PArray<U extends Schema> {
  schema: U;

  constructor(schema: U) {
    this.schema = schema;
  }

  parse(input: unknown): Target<U>[] {
    if (Array.isArray(input)) {
      const value = [];
      for (const v of input) {
        value.push(this.schema.parse(v));
      }
      return value as any;
    }
    return [];
  }
}

/// Type of the parsed target
/// ```
/// const s = pf.object({ a: pb.number() });
/// const a: Target<typeof s> = s.parse({});
/// ```
export type Target<T> = T extends PNumber
  ? number
  : T extends PString
  ? string
  : T extends PBoolean
  ? boolean
  : T extends PArray<infer U>
  ? Target<U>[]
  : T extends PObject<infer U>
  ? MapTarget<U>
  : never;

type MapTarget<T> =
  | {
      [P in keyof T]: Target<T[P]>;
    }
  | null;

class PObject<U extends Record<string, Schema>> {
  schema: U;

  constructor(object: U) {
    this.schema = object;
  }

  parse(input: unknown): MapTarget<U> {
    if (typeof input !== "object" || input === null) {
      return null;
    }

    const result: MapTarget<U> = {} as any;
    for (const [key, value] of Object.entries(this.schema)) {
      // @ts-ignore
      result[key] = value.parse(input[key]);
    }
    return result;
  }
}

class PEnum<T extends string | number> {
  values: T[];
  type: string;

  constructor(values: T[]) {
    this.values = values;
    this.type = typeof values[0];
  }

  parse(input: unknown): T {
    if (this.type == "number") {
      return this.parseNumber(input) as T;
    } else {
      return this.parseString(input) as T;
    }
  }

  parseNumber(input: unknown): number {
    const value = number().parse(input);
    if (this.values.includes(value as T)) {
      return value;
    } else {
      return 0;
    }
  }

  parseString(input: unknown): string {
    const value = string().parse(input);
    if (this.values.includes(value as T)) {
      return value;
    } else {
      return "";
    }
  }
}
