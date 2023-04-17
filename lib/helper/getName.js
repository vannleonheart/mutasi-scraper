/**
 * @fileoverview Extract name from transaction name
 * @date 2023-04-17
 * @param {any} name
 * @returns {any}
 */
class NameExtractor {
  static extractBCAMutationName(name) {
    const regex = /\b[A-Z\s]+(?=\s(?:\d))/;
    const match = name.match(regex);
    return match ? match[0] : null;
  }

  static extractMandiriMutationName(name) {
    const regex = /(?:KE|DARI)\s(.+)/;
    const match = name.match(regex);
    return match ? match[1] : null;
  }
}

module.exports = NameExtractor;
