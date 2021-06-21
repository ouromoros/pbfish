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
  parse(object: unknown): unknown;
}

class PNumber {
  parse<T>(object: T): number {
    if (typeof object === "number") {
      return object;
    } else if (typeof object === "string") {
      const parsed = Number(object);
      return isNaN(parsed) ? 0 : parsed;
    } else if (typeof object === "boolean") {
      return object ? 1 : 0;
    }
    return 0;
  }
}

class PString {
  parse<T>(object: T): string {
    if (typeof object === "string") {
      return object;
    } else if (typeof object === "boolean" || typeof object === "number") {
      return object.toString();
    }
    return "";
  }
}

class PBoolean {
  parse<T>(object: T): boolean {
    if (typeof object === "boolean") {
      return object;
    }
    return !!object;
  }
}

class PArray<U extends Schema> {
  schema: U;

  constructor(schema: U) {
    this.schema = schema;
  }

  parse<T>(object: T): Parse<U>[] {
    if (Array.isArray(object)) {
      const value = [];
      for (const v of object) {
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

  parse<T>(object: T): ParseMapped<U> {
    if (!object) {
      return null;
    }

    const result: ParseMapped<U> = {} as any;
    for (const [key, value] of Object.entries(this.schema)) {
      // @ts-ignore
      result[key] = value.parse(object[key]);
    }
    return result;
  }
}
