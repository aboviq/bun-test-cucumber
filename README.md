# @aboviq/bun-test-cucumber

> Run Cucumber tests with Bun's test runner and full TypeScript support

In comparison with [@cucumber/cucumber](https://github.com/cucumber/cucumber-js) which uses its own test runner, this package integrates Cucumber with [Bun's built-in test runner](https://bun.sh/docs/cli/test), allowing you to run your Cucumber tests using `bun test`. It also provides full TypeScript support with type inference for step definitions and hooks.

This package is inspired by [vitest-cucumber-plugin](https://github.com/samuel-ziegler/vitest-cucumber-plugin).

For state management between steps, it uses a simple object instead of class instances that is passed from one step to the next, which can be typed using generics.

**NOTE:** this package is published as TypeScript source code and doesn't include any compiled JavaScript files.

## Setup

### Install the package as a dev dependency

```bash
bun add -D @aboviq/bun-test-cucumber
```

### Configure and preload the plugin

Create a `test-plugins.ts` file in your project root with the following content:

```ts
import { plugin } from 'bun';
import { bunTestCucumber } from '@aboviq/bun-test-cucumber';

await plugin(
  bunTestCucumber({
    stepDefinitionsPattern: 'tests/**/*.steps.ts', // Adjust the pattern to match your step definition files
  }),
);
```

Then preload this file when running your tests:

```bash
bun test --preload ./test-plugins.ts
```

Or add it to your `bunfig.toml`:

```toml
[test]
preload = ["./test-plugins.ts"]
```

### Loading feature files

**NOTE:** Due to a limitation in Bun's current implementation, feature files can't be loaded automatically as the default glob pattern for test files only matches `.ts` and `.js` files. And it's not working by passing the feature files directly to `bun test` either for the same reason. (See: <https://github.com/oven-sh/bun/issues/3440>)

To work around this, you can create a `features.test.ts` file somewhere in your project that imports all your feature files. For example:

```ts
import { loadFeatures } from '@aboviq/bun-test-cucumber';

await loadFeatures('features/**/*.feature'); // Adjust the pattern to match your feature files, relative to cwd (which can be customized using the second argument)
```

## Usage

Create your feature files (e.g. `features/example.feature`):

```gherkin
Feature: Example feature
  Scenario: Example scenario
    Given I have a step definition
    When I run the tests
    Then I should see the results
```

Create your step definitions (e.g. `tests/example.steps.ts`):

```ts
import { Given, When, Then } from '@aboviq/bun-test-cucumber';

Given('I have a step definition', (state) => {
  // Step definition implementation
  return state;
});

When('I run the tests', (state) => {
  // Step implementation
  return state;
});

Then('I should see the results', (state) => {
  // Step implementation
  return state;
});
```

Run your tests:

```bash
bun test
```

## TypeScript Support

The package is written in TypeScript and provides full type definitions for step definitions and hooks. You can define the state type for your steps and hooks to get type safety and autocompletion.

The package also automatically infers expression types for step definitions based on the step text.

### Example with state and argument types

#### Using `withState` to define state type

```ts
import { withState } from '@aboviq/bun-test-cucumber';

interface MyState {
  count: number;
}

const { Before, Given, When } = withState<MyState>();

Before((state) => ({ ...state, count: 0 }));

Given('the count is {int}', (state, [count]) => {
  typeof count; // inferred as number
  return { ...state, count };
});

When('I am {word} the count', (state, [operation]) => {
  typeof operation; // inferred as string
  switch (operation) {
    case 'increasing':
      return { ...state, count: state.count + 1 };
    case 'decreasing':
      return { ...state, count: state.count - 1 };
    case 'doubling':
      return { ...state, count: state.count * 2 };
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
});
```

#### Without `withState`

```ts
import { Before, Given, When } from '@aboviq/bun-test-cucumber';

interface MyState {
  count: number;
}

Before<MyState>((state) => ({ ...state, count: 0 }));

Given('the count is {int}', (state: MyState, [count]) => {
  typeof count; // inferred as number
  return { ...state, count };
});

When('I am {word} the count', (state: MyState, [operation]) => {
  typeof operation; // inferred as string
  switch (operation) {
    case 'increasing':
      return { ...state, count: state.count + 1 };
    case 'decreasing':
      return { ...state, count: state.count - 1 };
    case 'doubling':
      return { ...state, count: state.count * 2 };
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
});
```

## License

MIT © [Aboviq AB](https://aboviq.com)
