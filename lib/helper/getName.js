/**
 * @fileoverview Extract name from transaction name
 * @date 2023-04-17
 * @param {string} name
 * @returns {string}
 */
class NameExtractor {
  static extractBCAMutationName(name) {
    const regex = /[A-Z\s]+$/; // match one or more capital letters and spaces at the end of the string
    const matches = name.match(regex);
    return matches ? matches[0].trim() : null
  }

  static extractMandiriMutationName(name) {
    const regex = /(?:KE|DARI)\s(.+)/;
    const match = name.match(regex);
    return match ? match[1] : null;
  }
}

module.exports = NameExtractor;
