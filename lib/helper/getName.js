/**
 * @fileoverview Extract name from transaction name
 * @date 2023-04-17
 * @param {any} name
 * @returns {any}
 */
class NameExtractor {
  static extractBCAMutationName(name) {
    const regex = /(\d+\.\d{2})([A-Za-z ]+)/g;
    let match;

    while ((match = regex.exec(name)) !== null) {
      const name = match[2].trim();
      return name;
    }
  }

  static extractMandiriMutationName(name) {
    const regex = /(?:KE|DARI)\s(.+)/;
    const match = name.match(regex);
    return match ? match[1] : null;
  }
}

module.exports = NameExtractor;
