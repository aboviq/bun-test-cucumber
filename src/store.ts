import { ExpressionFactory, ParameterTypeRegistry, type Argument } from '@cucumber/cucumber-expressions';
import { PickleStepType, type PickleStep, type PickleTag } from '@cucumber/messages';
import parseTags from '@cucumber/tag-expressions';

import type { Hook, HookFunction, HookType, Step } from './types';

const expressionFactory = new ExpressionFactory(new ParameterTypeRegistry());

const steps: Step[] = [];

const hooks = new Map<HookType, Hook<unknown>[]>();

export const addStep = (expression: string, fn: Function): void => {
  const cucumberExpression = expressionFactory.createExpression(expression);

  if (!fn.name) {
    Object.defineProperty(fn, 'name', { value: expression });
  }

  steps.push({ expression, cucumberExpression, fn });
};

export const addHook = (type: HookType, ...args: unknown[]): void => {
  if (!hooks.has(type)) {
    hooks.set(type, []);
  }
  let name = '';
  let options: Hook<unknown>['options'];
  let fn: HookFunction<unknown> | undefined;

  for (const element of args) {
    if (typeof element === 'string') {
      name = element;
    } else if (typeof element === 'function') {
      fn = element as HookFunction<unknown>;
    } else if (typeof element === 'object' && element !== null) {
      options = element;
      options.tagsExpression = options.tags ? parseTags(options.tags) : undefined;
    }
  }

  if (!fn) {
    throw new Error('Hook function is required');
  }

  if (name && !fn.name) {
    Object.defineProperty(fn, 'name', { value: name });
  }

  hooks.get(type)!.push({ name, fn, options });
};

export async function applyHooks(type: HookType, state: unknown, tags?: PickleTag[]): Promise<unknown> {
  const hooksForType = hooks.get(type) ?? [];
  for (const hook of hooksForType) {
    if (hook.options?.tagsExpression && tags) {
      const tagNames = tags.map((tag) => tag.name);
      if (!hook.options.tagsExpression.evaluate(tagNames)) {
        continue;
      }
    }
    state = await hook.fn(state);
  }
  return state;
}

function getStepType(pickleStep: PickleStep): string {
  switch (pickleStep.type) {
    case PickleStepType.CONTEXT:
      return 'Given';
    case PickleStepType.ACTION:
      return 'When';
    case PickleStepType.OUTCOME:
      return 'Then';
    default:
      return 'Given';
  }
}

export async function runStep<State>(pickleStep: PickleStep, state: State): Promise<State> {
  const { step, parameters } = findStepDefinition(pickleStep);

  return step.fn(state, parameters, pickleStep.argument);
}

function findStepDefinition(pickleStep: PickleStep): {
  step: Step;
  parameters: Array<Argument | null>;
} {
  const matches: Array<{ step: Step; parameters: Array<Argument | null> }> = [];

  for (const step of steps) {
    const match = step.cucumberExpression.match(pickleStep.text);

    if (match) {
      matches.push({
        step,
        parameters: match.map((argument) => argument.getValue(null)),
      });
    }
  }

  const [match, ...rest] = matches;

  if (!match) {
    throw new Error(`No step definition found for step: "${pickleStep.text}"
    Implement with the following snippet:

    ${getStepType(pickleStep)}('${escape(pickleStep.text)}', async (state) => {
      return state;
    });
  `);
  }

  if (rest.length > 0) {
    throw new Error(`Multiple step definitions found for step: "${getStepType(pickleStep)}" "${pickleStep.text}"`);
  }

  return match;
}
