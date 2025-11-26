import { expect } from 'bun:test';

import type { PickleStepArgument } from '@cucumber/messages';

import { withState } from '../src';

interface State {
  args: unknown[];
}

const { Given, When, Then } = withState<State>();

Given(/(the step is defined with a) (string|regexp)/, (_, args) => {
  return { args };
});


When('/the string is clamped with (\\/) and (\\/)/', (state, args, data) => {
  expectArgsToMatchData(args, data);
  return state;
});

When('^the string is clamped with (\\^) and (\\$)$', (state, args, data) => {
  expectArgsToMatchData(args, data);
  return state;
});

function expectArgsToMatchData(args: (string | undefined)[], data?: PickleStepArgument) {
  expect(args).toBeArrayOfSize(data?.dataTable?.rows.length!);

  data?.dataTable?.rows.forEach((row, i) =>
    expect(args[i]).toBe(row.cells[0]?.value)
  );
}


Then(/the step extracts groups as arguments/, (state, _, data) => {
  expect(data?.dataTable).not.toBeUndefined();

  expect(state.args)
    .toEqual(data!.dataTable!.rows.map(r => r.cells[0]?.value));

  return state;
});

const _arguments = 'arguments';
const types = 'types';
const groups = 'groups';
Then(`/the (${_arguments}) have (${types}) from capture (${groups})/`, (state, args) => {
  expect(args[0]).toBe(_arguments);
  expect(args[1]).toBe(types);
  expect(args[2]).toBe(groups);

  // @ts-expect-error there are only three capture groups
  expect(args[3]).toBeUndefined();

  return state;
});

Then(`^the (${types}) notify about optional (capture )?(${groups})$`, (state, args) => {
  expect(args[0]).toBe(types);
  expect(args[1]).toBe(null);

  //@ts-expect-error TypeScript should expect args[1] to be string | undefined
  const _: string = args[1];

  expect(args[2]).toBe(groups);

  // @ts-expect-error there are only three capture groups
  expect(args[3]).toBeUndefined();

  return state;
});
