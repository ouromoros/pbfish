# pbfish

[![npm](https://img.shields.io/npm/v/pbfish)](https://www.npmjs.com/package/pbfish)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/ouromoros/pbfish/Running%20Code%20Coverage)
![Codecov](https://img.shields.io/codecov/c/gh/ouromoros/pbfish)

`pbfish` is yet another schema validation library whose API resembles the famous `joi`, only with fewer methods. Different from `joi` which focuses on the ability to describe and *validate* schemas with powerful abstractions, `pbfish` mainly aims to parse the provided data into the desired shape with **good default behavior** for later processing. The idea is to make interacting with unknown data as comfortable as interacting with well-defined RPC request/response and be error-tolearnt.

Generally, `pbfish` aims to achieve the following goals:

- Simple API, easy to use
- Intuitive and well-defined behavior with erroneous input
- Accurate types support for TypeScript

*NOTE*: Arguably what `pbfish` does is schema *parsing* rather than schema validation. However, since the existing libraries in "schema validation" category also does some *parsing* work and don't make clear distinctions here, we decide to remain indifferent to the ambiguity.

## Why not `joi`, `yup`, or other data validation libraries?

`joi` and various other schema validation libraries have done a great job in *validating* schemas, but are hard to use otherwise when we need to work with data provided by external service that may contain errors and do not strictly follow API requirements. This is where `pbfish` would come to rescue.

`pbfish` provides compatibility for data that may contain errors and can act as the "front guard" before any actual work is done on the unknown data. Common errors like missing fields and wrong types will be resolved automatically so that the application side can focus on actual business logic.

Also, `pbfish` provides accurate types support and null safety for typescript projects. Who doesn't love safe types?

## Installation

```
$ npm i pbfish
```

## Example

The API is almost identical with `yup`, here is a minimal example:

```typescript
import * as pf from "pbfish";

const s = {
  a: 1,
  b: "hello",
  c: "true",
  d: {},
  e: [1, 2],
}

const schema = pf.object({
  a: pf.number(),
  b: pf.string(),
  c: pf.boolean(),
  d: pf.object({
    k: pb.number(),
  }),
  e: pf.string(),
  f: pf.object({
    l: pb.string(),
  })
});

const parsed: pf.Target<typeof schema> = schema.parse(o);
// The value of `parsed`:
// {
//   a: 1,        matching type will preserve original value
//   b: "hello",
//   c: true,     conflict type will be transformed to the desired type intuitively
//   d: {
//        k: 0,   missing fields of object will have default value
//      },
//   e: "",       types that can't be intuitively parsed will have default value
//   f: null,     default value of object is null
// }
```

For more examples on usage, see the [tests](./test/basic.test.ts).

## Specification

We first describe the schema object using literal types `number()`, `string()` and `boolean()`,  in combination with compositional types `object()` and `array()` like the example above. Then we call `parse(input)` on the object where `input` is the value to be parsed. The parsed value will strictly follow the specification according to the defined schema.

`parse()` does not throw errors, nor does it provide any mechanism for investigating "errors" encountered in parsing. What `parse()` does is to transform the input into the desired shape with best efforts. When in doubt about the parsed result, the recommended approach is to investigate the original input value.

### TL;DR

Generally, the specification follows these guidelines:

- Intuitive and tolerant of input. For `number` type, both `"1"` and `true` will be parsed into `1` in spite of the type difference. For `boolean` type, both `1234` and `"true"` will be parsed into `true` while `null` and `""` will be parsed into `false`. The result should be intuitive to an experienced programmer, and be tolerant in the face of erroneous input.
- Default value. When input is missing (being `null`, `undefined`) or can't be meaningfully parsed (`1` being input to `object()`), the result will be a default zero value. `object()` is a bit special here because if it's not `null`, then all of its fields will be present and have default value even if it's not present in the input, just like in `protobuf3`. Below is the zero value map.

|Type| Zero Value|
|----| ----------|
|number| 0|
|string| ""|
|boolean| false|
|array| [] |
|object| null|

We hope that the above guidelines would suffice for one to use `pbfish` productively. However, if under any condition the parsed result surprises you, it would help to look at the detailed specification.

### number

| Input Type | Input Value Type |  Parsed Value|
| ---------- | ----------- | ------- |
| `number`    | | the original value |
| `boolean`   | `true` |    `1`     |
| `boolean`   | `false` |    `0`     |
| `string`    |        |  See below table for detail |
| Other      |         |     `0`     |

For `string` type, the parsing rule is complex, and is the same as the `Number()` constructor rule:

|x   | 	Number(x) |
|----|-----------|
|"123"|	123|
|"+123"|	123|
|"-123"|	-123|
|"123.45"|	123.45|
|"-123.45"|	-123.45|
|"12e5"|	1200000 |
|"12e-5"|	0.00012|
|"0123"|	123|
|"0000123"|	123|
|"0b111"|	7|
|"0o10"|	8|
|"0xBABE"|	47806|
|"4294967295"|	4294967295|
|"123456789012345678"|123456789012345680|
|"12e999"|	Infinity|
|""| 0|
|"123foo"|	0|
|"123.45foo"|	0|
|" 123 "|	123|
|"foo"|	0|
|"12e"|	0|
|"0b567"|	0|
|"0o999"|	0|
|"0xFUZZ"|	0|
|"+0"|	0|
|"-0"|	0|
|"Infinity"|	Infinity|
|"+Infinity"|	Infinity|
|"-Infinity"|	-Infinity|

### string

| Input Type | Input Value Type |  Parsed Value|
| ---------- | ----------- | ------- |
| `number`    |         | the string representation of its plain form |
| `boolean`   | `true` |    `"true"`     |
| `boolean`   | `false` |    `"false"`     |
| `string`    |        |  the original value |
| Other      |         |     `""`     |

### boolean

| Input Type | Input Value Type |  Parsed Value|
| ---------- | ----------- | ------- |
| `number`    |     `0`    | `false` |
| `number`    |     any value except `0`    | `true` |
| `boolean`   |      |    the original value     |
| `string`    |    `""`    |      `false`       |
| `string`    |    **case-insensitive false** eg. `false`, `False`, `FALSE`   |      `false`       |
| `string`    |    any value except empty string and "false"    |      `true`       |
| `null`    |         |     `false`     |
| `undefined`    |         |     `false`     |
| `array`    |    `[]`    |      `false`       |
| `array`    |    any value except empty array    |      `true`       |
|  Other   |         |     `true`     |

### array

| Input Type | Input Value Type |  Parsed Value|
| ---------- | ----------- | ------- |
| `array`    |          | array of mapped parsed values |
|  Other   |         |     `[]`     |

### object

| Input Type | Input Value Type |  Parsed Value|
| ---------- | ----------- | ------- |
| `object`    |          | object of mapped parsed values, with all the fields present and have default zero value |
|  Other   |         |     `null`     |
