import type { ExpressionFactory } from '@cucumber/cucumber-expressions';
import parseTags from '@cucumber/tag-expressions';

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

type ExtractGherkinDataTypes<T extends string, S extends GherkinDataType[]> = T extends `${infer U}}${infer W}`
  ? ExtractGherkinDataTypes<W, ExtractGherkinDataType<U, S>>
  : ExtractGherkinDataType<T, S>;

export type ExtractTypes<T extends string | RegExp> =
  T extends `/${infer Regex}/`
  ? ExtractRegexGroups<Regex, []>
  : T extends string
    ? GherkinDataTypesToTypes<ExtractGherkinDataTypes<T, []>>
    : (string | undefined)[];

type ExtractRegexGroups<T extends string, Groups extends unknown[]> =
  T extends `${string}(${infer Group})${infer Q extends MaybeOptionalLiteral}${string}`
    ? Group extends `?:${infer SubGroup}` | `?!${infer SubGroup}`
      ? ExtractRegexGroups<SubGroup, Groups>
      : Group extends `?<${string}>${infer SubGroup}`
        ? ExtractRegexGroups<SubGroup, [...Groups, ExtractSimpleGroupTypes<SubGroup> | MaybeOptional<Q>]>
        : ExtractRegexGroups<Group, [...Groups, ExtractSimpleGroupTypes<Group> | MaybeOptional<Q>]>
    : Groups;

type ExtractSimpleGroupTypes<G extends string, Types = never> =
  G extends `${infer Left}|${infer Right}`
    ? Types | ExtractSimpleGroupTypes<Left> | ExtractSimpleGroupTypes<Right>
    : ExtractRegexToken<G>;

type ExtractRegexToken<G extends string> =
  G extends `\\${infer Type}${infer Q extends MaybeOptionalLiteral}`
    ? ExtractRegexTokenType<Q, Type>
  : G extends `[${infer Type}]${infer Q extends MaybeOptionalLiteral}`
    ? ExtractRegexTokenType<Q, Type>
    : G;

type ExtractRegexTokenType<Optional extends string, _Type extends string> =
  MaybeOptional<Optional> | string;

type MaybeOptional<Optional extends string> = (Optional extends OptionalLiteral ? undefined : never);

type MaybeOptionalLiteral = '' | '+' | OptionalLiteral;
type OptionalLiteral = '*' | '+?' | '*?' | '?';

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
