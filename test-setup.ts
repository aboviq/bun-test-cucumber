import { plugin } from 'bun';
import { bunTestCucumber } from './src';

await plugin(
  bunTestCucumber({
    stepDefinitionsPattern: 'tests/**/*.steps.ts',
  }),
);
