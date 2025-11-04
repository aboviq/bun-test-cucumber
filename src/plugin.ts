import { Glob, type BunPlugin } from 'bun';
import { readFileSync } from 'node:fs';

import { AstBuilder, compile, GherkinClassicTokenMatcher, Parser } from '@cucumber/gherkin';
import { IdGenerator, type GherkinDocument, type Pickle } from '@cucumber/messages';
import parseTags from '@cucumber/tag-expressions';

import { generate } from './generate';

interface BunTestCucumberOptions {
  /**
   * Current working directory to resolve the `stepDefinitionsPattern` from
   *
   * If not set, will use `process.cwd()`.
   *
   * This needs to be set if running `bun test` from a different directory than the project root,
   */
  cwd?: string;
  /**
   * Cucumber tag filter expression, e.g. `@smoke and not @wip`
   *
   * If not set, will use the `CUCUMBER_TAG_FILTER` environment variable if present.
   * If neither is set, all scenarios will be included.
   */
  tagFilter?: string;
  /**
   * Glob pattern to the step definitions files
   *
   * The pattern is relative to `cwd` (or process.cwd() if not set),
   * i.e. not automatically relative to the project root.
   */
  stepDefinitionsPattern: string;
  /**
   * Callback function to be called when generating the test files
   *
   * Can be used for logging or debugging purposes.
   *
   * @param gherkinDocument The parsed Gherkin document
   * @param pickles The generated pickles, i.e. scenarios
   * @param result The generated test file content
   */
  onGenerate?: (gherkinDocument: GherkinDocument, pickles: readonly Pickle[], result: string) => void;
}

export const bunTestCucumber = (options: BunTestCucumberOptions): BunPlugin => {
  return {
    name: '@aboviq/bun-test-cucumber',
    async setup(build) {
      const tagFilter = options.tagFilter ?? process.env['CUCUMBER_TAG_FILTER'];
      const tagExpression = tagFilter ? parseTags(tagFilter) : undefined;
      const stepDefinitionGlob = new Glob(options.stepDefinitionsPattern);

      let stepDefinitionsImports = '// Auto-imported step definitions:\n';

      for await (const file of stepDefinitionGlob.scan({
        cwd: options.cwd,
        absolute: true,
      })) {
        stepDefinitionsImports += `import "${file}";\n`;
      }

      build.onLoad({ filter: /\.feature$/ }, async (args) => {
        const uuidFn = IdGenerator.incrementing();
        const parser = new Parser(new AstBuilder(uuidFn), new GherkinClassicTokenMatcher());
        const content = readFileSync(args.path, 'utf-8');

        const gherkinDocument = parser.parse(content);
        const pickles = compile(gherkinDocument, args.path, uuidFn);
        try {
          const text = generate(gherkinDocument, pickles, {
            imports: stepDefinitionsImports,
            tagExpression,
          });

          options.onGenerate?.(gherkinDocument, pickles, text);

          return {
            contents: text,
            loader: 'ts',
          };
        } catch (error) {
          throw new Error(`Failed to generate test file for: ${args.path}`, { cause: error });
        }
      });
    },
  };
};
