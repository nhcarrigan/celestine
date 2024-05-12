/**
 * Generates a Discord timestamp based on a millisecond input.
 *
 * @param {number} time The timestamp, in milliseconds.
 * @returns {string} A discord formatted timestamp string.
 */
export const generateTimestamp = (time: number) => {
  const seconds = Math.floor(time / 1000);
  return `<t:${seconds}:F>`;
};
