import type { ExpressionFactory } from '@cucumber/cucumber-expressions';
import parseTags from '@cucumber/tag-expressions';
import type { regex } from 'arkregex';

export type TagExpression = ReturnType<typeof parseTags>;

export type CucumberExpression = ReturnType<ExpressionFactory['createExpression']>;

type GherkinDataType =
  | 'int'
  | 'float'
  | 'double'
  | 'word'
  | 'string'
  | 'bigdecimal'
  | 'biginteger'
  | 'byte'
  | 'short'
  | 'long'
  // anonymous
  | '';

type GherkinDataTypeToType<T extends GherkinDataType> = {
  int: number;
  float: number;
  double: number;
  word: string;
  string: string;
  bigdecimal: string;
  biginteger: bigint;
  byte: number;
  short: number;
  long: number;
  '': string;
}[T];

type GherkinDataTypesToTypes<T extends GherkinDataType[]> = {
  [K in keyof T]: T[K] extends GherkinDataType ? GherkinDataTypeToType<T[K]> : never;
};

type ExtractGherkinDataType<
  T extends string,
  S extends GherkinDataType[],
> = T extends `${string}{${infer U extends GherkinDataType}` ? [...S, U] : S;

type ExtractGherkinDataTypes<T extends string, S extends GherkinDataType[] = []> = T extends `${infer U}}${infer W}`
  ? ExtractGherkinDataTypes<W, ExtractGherkinDataType<U, S>>
  : ExtractGherkinDataType<T, S>;

export type ExtractTypes<T extends string> =
  T extends RegexString<infer Regex>
    ? ExtractRegexGroups<Regex>
    : GherkinDataTypesToTypes<ExtractGherkinDataTypes<T>>;

type RegexString<T extends string> = `/${T}/` | `^${T}$`;
type ExtractRegexGroups<T extends string> = regex.parse<`^${T}$`> extends { inferCaptures: infer C }
  // Cucumber treats optional regexp groups as null values instead of undefined,
  // probably due to its java roots?
  ? { [k in keyof C]: undefined extends C[k] ? null : C[k] }
  : (string | undefined)[];

export type HookType = 'beforeAll' | 'before' | 'beforeStep' | 'afterStep' | 'after' | 'afterAll';

export type HookFunction<State> = (state: State) => State | Promise<State>;

export type Hook<State> = {
  name: string;
  fn: HookFunction<State>;
  options?: { tags?: string; tagsExpression?: TagExpression };
};

export type Step = {
  expression: string | RegExp;
  cucumberExpression: CucumberExpression;
  fn: Function;
};
