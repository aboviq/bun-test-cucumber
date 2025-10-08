import { Glob } from 'bun';

/**
 * Load all feature files matching the given glob pattern
 *
 * This will import all matching files which will trigger the Bun Test Cucumber plugin
 * to process the feature files and generate the corresponding test files.
 *
 * When <https://github.com/oven-sh/bun/issues/3440> is resolved this won't be necessary.
 *
 * @param pattern Glob pattern to the feature files (relative to `cwd` if set, otherwise relative to `process.cwd()`)
 * @param cwd Optional current working directory to resolve the pattern against (defaults to process.cwd())
 */
export const loadFeatures = async (pattern: string, cwd?: string): Promise<void> => {
  const featuresGlob = new Glob(pattern);

  for await (const file of featuresGlob.scan({
    absolute: true,
    cwd,
  })) {
    await import(file);
  }
};
