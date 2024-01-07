/**
 * Extract Name
 * @memberof Utils
 * @author fdciabdul
 * @utils Utils/NameExtractor
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
  static extractBNIMutationName(name){
  
    const regex = /TRANSFER DARI (Bpk|Sdr|Ibu) (.*)/;
    const match = name.match(regex);
    return match ? match[2] : null;
  }

}

module.exports = NameExtractor;
