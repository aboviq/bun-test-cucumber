import { type PickleStepArgument } from '@cucumber/messages';
import { addHook, addStep } from './store';
import type { HookFunction, ExtractTypes } from './types';

export { applyHooks, runStep } from './store';
export { loadFeatures } from './load';
export { bunTestCucumber } from './plugin';

export interface AddHookFunction<S> {
  /**
   * Simple hook definition function
   *
   * Available hook types are:
   * - `BeforeAll` - runs once per feature file, before any scenarios
   * - `Before` - runs before each scenario
   * - `BeforeStep` - runs before each step in a scenario
   * - `AfterStep` - runs after each step in a scenario
   * - `After` - runs after each scenario
   * - `AfterAll` - runs once per feature file, after all scenarios
   *
   * **NOTE:** Must return the state object (and can be async). Which TypeScript will enforce (especially if using {@link withState}).
   *
   * @example
   * ```ts
   * BeforeAll(async (state) => {
   *   // setup code here
   *   return state;
   * });
   *
   * // or
   *
   * Before((state) => {
   *   // setup code here
   *   return state;
   * });
   * ```
   *
   * @param fn Hook function (can be either sync or async)
   */
  <State = S>(fn: HookFunction<State>): void;
  /**
   * Hook with name definition function
   *
   * Available hook types are:
   * - `BeforeAll` - runs once per feature file, before any scenarios
   * - `Before` - runs before each scenario
   * - `BeforeStep` - runs before each step in a scenario
   * - `AfterStep` - runs after each step in a scenario
   * - `After` - runs after each scenario
   * - `AfterAll` - runs once per feature file, after all scenarios
   *
   * **NOTE:** Must return the state object (and can be async). Which TypeScript will enforce (especially if using {@link withState}).
   *
   * @example
   * ```ts
   * BeforeAll('Initial setup', async (state) => {
   *   // setup code here
   *   return state;
   * });
   *
   * // or
   *
   * Before('Running before each scenario', (state) => {
   *   // setup code here
   *   return state;
   * });
   * ```
   *
   * @param name Name of the hook (used in stack traces)
   * @param fn Hook function (can be either sync or async)
   */
  <State = S>(name: string, fn: HookFunction<State>): void;
  /**
   * Hook with options definition function
   *
   * Available hook types are:
   * - `BeforeAll` - runs once per feature file, before any scenarios
   * - `Before` - runs before each scenario
   * - `BeforeStep` - runs before each step in a scenario
   * - `AfterStep` - runs after each step in a scenario
   * - `After` - runs after each scenario
   * - `AfterAll` - runs once per feature file, after all scenarios
   *
   * **NOTE:** Must return the state object (and can be async). Which TypeScript will enforce (especially if using {@link withState}).
   *
   * @example
   * ```ts
   * BeforeAll({ tags: '@browser' }, async (state) => {
   *   // setup browser code here
   *   return state;
   * });
   *
   * // or
   *
   * Before({ tags: '@fakeTime' }, (state) => {
   *   // setup code here, e.g. fake system time
   *   return state;
   * });
   *
   * After({ tags: '@fakeTime' }, (state) => {
   *   // teardown code here, e.g. restore system time
   *   return state;
   * });
   * ```
   *
   * @param options Hook options (currently only `tags` is supported)
   * @param fn Hook function (can be either sync or async)
   */
  <State = S>(options: { tags: string }, fn: HookFunction<State>): void;
  /**
   * Hook with name and options definition function
   *
   * Available hook types are:
   * - `BeforeAll` - runs once per feature file, before any scenarios
   * - `Before` - runs before each scenario
   * - `BeforeStep` - runs before each step in a scenario
   * - `AfterStep` - runs after each step in a scenario
   * - `After` - runs after each scenario
   * - `AfterAll` - runs once per feature file, after all scenarios
   *
   * **NOTE:** Must return the state object (and can be async). Which TypeScript will enforce (especially if using {@link withState}).
   *
   * @example
   * ```ts
   * BeforeAll('Setup browser', { tags: '@browser' }, async (state) => {
   *   // setup browser code here
   *   return state;
   * });
   *
   * // or
   *
   * Before('Fake time', { tags: '@fakeTime' }, (state) => {
   *   // setup code here, e.g. fake system time
   *   return state;
   * });
   *
   * After('Restore time', { tags: '@fakeTime' }, (state) => {
   *   // teardown code here, e.g. restore system time
   *   return state;
   * });
   * ```
   *
   * @param name Name of the hook (used in stack traces)
   * @param options Hook options (currently only `tags` is supported)
   * @param fn Hook function (can be either sync or async)
   */
  <State = S>(name: string, options: { tags: string }, fn: HookFunction<State>): void;
}

export interface AddStepFunction<S> {
  <Pattern extends string, State = S>(
    pattern: Pattern,
    fn: (state: State, args: ExtractTypes<Pattern>, data?: PickleStepArgument) => State | Promise<State>,
  ): void;
}

export interface AddStepFunctionWithState<State> {
  <Pattern extends string>(
    pattern: Pattern,
    fn: (state: State, args: ExtractTypes<Pattern>, data?: PickleStepArgument) => State | Promise<State>,
  ): void;
}

export interface WithState<S> {
  BeforeAll: AddHookFunction<S>;
  Before: AddHookFunction<S>;
  BeforeStep: AddHookFunction<S>;
  AfterStep: AddHookFunction<S>;
  After: AddHookFunction<S>;
  AfterAll: AddHookFunction<S>;
  Given: AddStepFunctionWithState<S>;
  When: AddStepFunctionWithState<S>;
  Then: AddStepFunctionWithState<S>;
}

/**
 * Helper function for less repetition and better type inference
 *
 * @example
 *
 * ### Without `withState`:
 * ```ts
 * import { Before, Given } from '@aboviq/bun-test-cucumber';
 *
 * interface State {
 *  counter: number;
 * }
 *
 * Before<State>(async (state) => {
 *   return { ...state, counter: 0 };
 * });
 * // or
 * Before(async (state: State) => {
 *   return { ...state, counter: 0 };
 * });
 *
 * Given('the counter is {int}', async (state: State, [value]) => {
 *   return { ...state, counter: value };
 * });
 * ```
 *
 * ### With `withState`:
 *
 * ```ts
 * import { withState } from '@aboviq/bun-test-cucumber';
 *
 * interface State {
 *   counter: number;
 * }
 *
 * const { Before, Given } = withState<State>();
 *
 * Before(async (state) => {
 *   return { ...state, counter: 0 };
 * });
 *
 * Given('the counter is {int}', async (state, [value]) => {
 *   return { ...state, counter: value };
 * });
 * ```
 *
 * @returns Hook and step definitions with state type inference
 */
export const withState = <State>(): WithState<State> => {
  const addStepWithState: AddStepFunctionWithState<State> = (pattern, fn) => {
    addStep(pattern, fn);
  };

  return {
    BeforeAll: BeforeAll<State>,
    Before: Before<State>,
    BeforeStep: BeforeStep<State>,
    AfterStep: AfterStep<State>,
    After: After<State>,
    AfterAll: AfterAll<State>,
    Given: addStepWithState,
    When: addStepWithState,
    Then: addStepWithState,
  };
};

export const BeforeAll: AddHookFunction<unknown> = (...args: unknown[]) => {
  addHook('beforeAll', ...args);
};

export const Before: AddHookFunction<unknown> = (...args: unknown[]) => {
  addHook('before', ...args);
};

export const BeforeStep: AddHookFunction<unknown> = (...args: unknown[]) => {
  addHook('beforeStep', ...args);
};

export const AfterStep: AddHookFunction<unknown> = (...args: unknown[]) => {
  addHook('afterStep', ...args);
};

export const After: AddHookFunction<unknown> = (...args: unknown[]) => {
  addHook('after', ...args);
};

export const AfterAll: AddHookFunction<unknown> = (...args: unknown[]) => {
  addHook('afterAll', ...args);
};

export const Given: AddStepFunction<unknown> = (pattern, fn) => {
  addStep(pattern, fn);
};

export const When: AddStepFunction<unknown> = (pattern, fn) => {
  addStep(pattern, fn);
};
export const Then: AddStepFunction<unknown> = (pattern, fn) => {
  addStep(pattern, fn);
};

/**
 * Extracts and transforms the data table from a PickleStep argument
 *
 * @example
 * ```gherkin
 * Given I have the following data:
 *   | Name  | Age |
 *   | Alice | 30  |
 *   | Bob   | 25  |
 * ```
 *
 * The step definition can use `getDataTable` to convert the argument into a more usable format:
 *
 * ```ts
 * import { getDataTable, Given } from '@aboviq/bun-test-cucumber';
 *
 * Given('I have the following data:', async (state, _args, data) => {
 *   const table = getDataTable(data);
 *   console.log(table);
 *   // Output:
 *   // [
 *   //   { Name: 'Alice', Age: '30' },
 *   //   { Name: 'Bob', Age: '25' }
 *   // ]
 *   return state;
 * });
 * ```
 * @param argument The argument from a PickleStep (third parameter of a step function)
 * @returns An array of records representing the data table
 */
export const getDataTable = (argument: PickleStepArgument | undefined): Record<string, string>[] => {
  if (!argument || !argument.dataTable) {
    throw new Error('No data table argument provided');
  }

  const [headerRow, ...rows] = argument.dataTable.rows;

  if (!headerRow) {
    return [];
  }

  const headers = headerRow.cells.map((cell) => cell.value);

  return rows.map((row) => {
    const record: Record<string, string> = {};
    row.cells.forEach((cell, index) => {
      const header = headers[index] ?? `Column ${index + 1}`;
      record[header] = cell.value;
    });
    return record;
  });
};
