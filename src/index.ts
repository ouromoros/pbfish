export function number(): PNumber {
  return new PNumber();
}

export function string(): PString {
  return new PString();
}

export function boolean(): PBoolean {
  return new PBoolean();
}

export function array<T extends Schema>(schema: T): PArray<T> {
  return new PArray(schema);
}

export function object<T extends Record<string, Schema>>(
  schema: T
): PObject<T> {
  return new PObject(schema);
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

  parse(input: unknown): Parse<U>[] {
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

type Parse<T> = T extends PNumber
  ? number
  : T extends PString
  ? string
  : T extends PBoolean
  ? boolean
  : T extends PArray<infer U>
  ? Parse<U>[]
  : T extends PObject<infer U>
  ? ParseMapped<U>
  : never;

type ParseMapped<T> =
  | {
      [P in keyof T]: Parse<T[P]>;
    }
  | null;

class PObject<U extends Record<string, Schema>> {
  schema: U;

  constructor(object: U) {
    this.schema = object;
  }

  parse(input: unknown): ParseMapped<U> {
    if (typeof input !== "object" || input === null) {
      return null;
    }

    const result: ParseMapped<U> = {} as any;
    for (const [key, value] of Object.entries(this.schema)) {
      // @ts-ignore
      result[key] = value.parse(input[key]);
    }
    return result;
  }
}
