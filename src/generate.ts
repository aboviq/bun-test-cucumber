import { resolveSync } from 'bun';

import type { GherkinDocument, Pickle } from '@cucumber/messages';
import parseTags from '@cucumber/tag-expressions';

import { escape } from './util';

type TagExpression = ReturnType<typeof parseTags>;

const getPickleName = (pickle: Pickle, index: number, pickles: readonly Pickle[]): string => {
  const name = escape(pickle.name);

  const indexesWithSameName: number[] = [];

  pickles.forEach((p, i) => {
    if (p.name === pickle.name) {
      indexesWithSameName.push(i);
    }
  });

  if (indexesWithSameName.length > 1) {
    return `${index + 1 - (indexesWithSameName[0] ?? 0)}. ${escape(name)}`;
  }

  return escape(name);
};

const getSkip = (pickle: Pickle, tagExpression?: TagExpression): string => {
  if (!tagExpression) {
    return '';
  }

  const tags = pickle.tags.map((tag) => tag.name);

  if (!tagExpression.evaluate(tags)) {
    return '.skip';
  }

  return '';
};

interface GenerateOptions {
  imports?: string;
  tagExpression?: TagExpression;
}

export const generate = (
  gherkinDocument: GherkinDocument,
  pickles: readonly Pickle[],
  { imports, tagExpression }: GenerateOptions = {},
): string => {
  const featureName = gherkinDocument.feature?.name ?? gherkinDocument.uri;

  if (!featureName) {
    throw new Error('Feature name is missing');
  }

  return `import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from 'bun:test';
  import { applyHooks, runStep } from '${resolveSync('./index.ts', import.meta.dir)}';
  ${imports ?? ''}
  let state = {};
  
  beforeAll(async () => {
    state = await applyHooks('beforeAll', state);
  });
  
  afterAll(async () => {
    state = await applyHooks('afterAll', state);
  });

  describe('${escape(featureName)}', () => {
    ${pickles
      .map(
        (
          pickle,
          index,
        ) => `describe${getSkip(pickle, tagExpression)}('${getPickleName(pickle, index, pickles)}', () => {
      beforeAll(async () => {
        state = await applyHooks('before', state, ${JSON.stringify(pickle.tags)});
      });
      afterAll(async () => {
        state = await applyHooks('after', state, ${JSON.stringify(pickle.tags)});
      });
      beforeEach(async () => {
        state = await applyHooks('beforeStep', state, ${JSON.stringify(pickle.tags)});
      });
      afterEach(async () => {
        state = await applyHooks('afterStep', state, ${JSON.stringify(pickle.tags)});
      });
      ${pickle.steps
        .map(
          (step) => `it('${escape(step.text)}', async () => {
        state = await runStep(${JSON.stringify(step)}, state);
      });`,
        )
        .join('\n    ')}
    });`,
      )
      .join('\n  ')}
  });
`;
};
