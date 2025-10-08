import { expect } from 'bun:test';
import { withState, getDataTable } from '../src';

interface State {
  counter: number | bigint;
  data: unknown;
}

const { Before, Given, When, Then } = withState<State>();

Before({ tags: '@array' }, async (state) => {
  return { ...state, data: ['array'] };
});

Before({ tags: '@before' }, async (state) => {
  return { ...state, data: [...(Array.isArray(state.data) ? state.data : []), 'before'] };
});

Given('The counter is reset', async (state) => {
  return { ...state, counter: 0 };
});

When('I push {string}', async (state, [value]) => {
  return { ...state, data: [...(Array.isArray(state.data) ? state.data : []), value] };
});

When('I increase the counter by {int}', async (state, [value]) => {
  return { ...state, counter: typeof state.counter === 'number' ? state.counter + value : state.counter };
});

When('I set counter to {int}', async (state, [value]) => {
  return { ...state, counter: value };
});

When('I set counter to big {biginteger}', async (state, [value]) => {
  return { ...state, counter: value };
});

Then('It should match snapshot', async (state) => {
  expect(state.counter).toMatchSnapshot();

  return state;
});

Then('I should see the counter is a {word}', async (state, [type]) => {
  switch (type) {
    case 'number':
    case 'bigint':
      expect(state.counter).toBeTypeOf(type);
      break;
    default:
      throw new Error(`Unknown type: ${type}`);
  }

  return state;
});

When('I have a table:', async (state, _args, data) => {
  return { ...state, data: getDataTable(data) };
});

Then('I have data', async (state) => {
  expect(state.data).toMatchSnapshot();

  return state;
});
