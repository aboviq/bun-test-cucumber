/**
 * Replaces windows-style "\\" with normal "/" for correct module resolution,
 * because the code generator treats "\\" as an escape character (because it is)
 *
 * @param path a path to normalize
 * @returns a normalized path
 */
export const normalizePath = (path: string): string => path.replaceAll('\\', '/');