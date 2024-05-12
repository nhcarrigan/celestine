/**
 * Gets the previous index in the array, looping as needed.
 *
 * @param {unknown[]} array The array to query.
 * @param {number} index The current index.
 * @returns {number} The previous index.
 */
export const getPreviousIndex = (array: unknown[], index: number) =>
  index === 0 ? array.length - 1 : index - 1;

/**
 * Gets the next index in the array, looping as needed.
 *
 * @param {unknown[]} array The array to query.
 * @param {number} index The current index.
 * @returns {number} The next index.
 */
export const getNextIndex = (array: unknown[], index: number) =>
  index === array.length - 1 ? 0 : index + 1;
