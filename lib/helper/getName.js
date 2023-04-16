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
