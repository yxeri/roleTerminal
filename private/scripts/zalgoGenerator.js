/** @module */

/**
 * @private
 * @type {string[]}
 */
const upperZalgo = [
  '\u030d', // Ì
  '\u030e', // ÌŽ
  '\u0304', // Ì„
  '\u0305', // Ì…
  '\u033f', // Ì¿
  '\u0311', // Ì‘
  '\u0306', // Ì†
  '\u0310', // Ì
  '\u0352', // Í’
  '\u0357', // Í—
  '\u0351', // Í‘
  '\u0307', // Ì‡
  '\u0308', // Ìˆ
  '\u030a', // ÌŠ
  '\u0342', // Í‚
  '\u0343', // Ì“
  '\u0344', // ÌˆÌ
  '\u034a', // ÍŠ
  '\u034b', // Í‹
  '\u034c', // ÍŒ
  '\u0303', // Ìƒ
  '\u0302', // Ì‚
  '\u030c', // ÌŒ
  '\u0350', // Í
  '\u0300', // Ì€
  '\u0301', // Ì
  '\u030b', // Ì‹
  '\u030f', // Ì
  '\u0312', // Ì’
  '\u0313', // Ì“
  '\u0314', // Ì”
  '\u033d', // Ì½
  '\u0309', // Ì‰
  '\u0363', // Í£
  '\u0364', // Í¤
  '\u0365', // Í¥
  '\u0366', // Í¦
  '\u0367', // Í§
  '\u0368', // Í¨
  '\u0369', // Í©
  '\u036a', // Íª
  '\u036b', // Í«
  '\u036c', // Í¬
  '\u036d', // Í­
  '\u036e', // Í®
  '\u036f', // Í¯
  '\u033e', // Ì¾
  '\u035b', // Í›
  '\u0346', // Í†
  '\u031a', // Ìš
];
/**
 * @private
 * @type {string[]}
 */
const middleZalgo = [
  '\u0315', // Ì•
  '\u031b', // Ì›
  '\u0340', // Ì€
  '\u0341', // Ì
  '\u0358', // Í˜
  '\u0321', // Ì¡
  '\u0322', // Ì¢
  '\u0327', // Ì§
  '\u0328', // Ì¨
  '\u0334', // Ì´
  '\u0335', // Ìµ
  '\u0336', // Ì¶
  '\u034f', // Í
  '\u035c', // Íœ
  '\u035d', // Í
  '\u035e', // Íž
  '\u035f', // ÍŸ
  '\u0360', // Í
  '\u0362', // Í¢
  '\u0338', // Ì¸
  '\u0337', // Ì·
  '\u0361', // Í¡
  '\u0489', // Ò‰_
];
/**
 * @private
 * @type {string[]}
 */
const lowerZalgo = [
  '\u0316', // Ì–
  '\u0317', // Ì—
  '\u0318', // Ì˜
  '\u0319', // Ì™
  '\u031c', // Ìœ
  '\u031d', // Ì
  '\u031e', // Ìž
  '\u031f', // ÌŸ
  '\u0320', // Ì
  '\u0324', // Ì¤
  '\u0325', // Ì¥
  '\u0326', // Ì¦
  '\u0329', // Ì©
  '\u032a', // Ìª
  '\u032b', // Ì«
  '\u032c', // Ì¬
  '\u032d', // Ì­
  '\u032e', // Ì®
  '\u032f', // Ì¯
  '\u0330', // Ì°
  '\u0331', // Ì±
  '\u0332', // Ì²
  '\u0333', // Ì³
  '\u0339', // Ì¹
  '\u033a', // Ìº
  '\u033b', // Ì»
  '\u033c', // Ì¼
  '\u0345', // Í…
  '\u0347', // Í‡
  '\u0348', // Íˆ
  '\u0349', // Í‰
  '\u034d', // Í
  '\u034e', // ÍŽ
  '\u0353', // Í“
  '\u0354', // Í”
  '\u0355', // Í•
  '\u0356', // Í–
  '\u0359', // Í™
  '\u035a', // Íš
  '\u0323', // Ì£
];

/**
 * Returns random number between min and max
 * @private
 * @param {Number} max - Max number value
 * @param {Number} min - Min number value
 * @returns {Number} - Random number between min and max
 */
function randomNumber(max, min) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Returns a random zalgo character
 * @private
 * @param {string[]} array - Array with zalgo characters
 * @param {Number} amount - Amount of zalgo characters to append
 * @returns {string} - Zalgo string
 */
function retrieveChars(array, amount) {
  let zalgoString = '';

  for (let i = 0; i < amount; i++) {
    zalgoString += array[randomNumber(array.length, 0)];
  }

  return zalgoString;
}

/**
 * Creates and returns a zalgofied string
 * @static
 * @param {string} phrase - Original string to be zalgofied
 * @param {Number} maxUpper - Max amount of zalgo characters to be appended on the top
 * @param {Number} maxMiddle - Max amount of zalgo characters to be appended in the middle
 * @param {Number} maxLower - Max amount of zalgo characters to be appended on the bottom
 * @returns {string} - Zalgofied string
 */
function createZalgoPhrase(phrase, maxUpper, maxMiddle, maxLower) {
  let zalgoString = '';

  for (let i = 0; i < phrase.length; i++) {
    let charString = phrase[i];

    charString += retrieveChars(upperZalgo, maxUpper || randomNumber(6, 0));
    charString += retrieveChars(middleZalgo, maxMiddle || randomNumber(3, 0));
    charString += retrieveChars(lowerZalgo, maxLower || randomNumber(6, 0));
    zalgoString += charString;
  }

  return zalgoString;
}

/**
 * Creates and returns a zalgofied string. The amount of zalgo is randomised based on the sent percentage
 * @static
 * @param {{phrase: string, maxUpper: Number, maxMiddle: Number, maxLower: Number, percentage: Number}} params -
 * <pre>
 * <p>phrase - String to be zalgofied</p>
 * maxUpper - Max amount of zalgo characters to be appended on top
 * maxMiddle - Max amount of zalgo characters to be appended in the middle
 * maxLower - Max amount of zalgo characters to be appended on the bottom
 * percentage - Chance of zalgo being added
 * </pre>
 * @returns {string} - Zalgofied string
 */
function randomMultiZalgoPhrase(params = {}) {
  const phrase = params.phrase;
  const maxUpper = params.maxUpper;
  const maxMiddle = params.maxMiddle;
  const maxLower = params.maxLower;
  const percentage = params.percentage;
  const words = phrase.split(' ');

  for (let i = 0; i < words.length; i++) {
    if (Math.random() < (percentage || 0.3)) {
      words[i] = createZalgoPhrase(words[i], maxUpper, maxMiddle, maxLower);
    }
  }

  return words.join(' ');
}

exports.createZalgoPhrase = createZalgoPhrase;
exports.randomMultiZalgoPhrase = randomMultiZalgoPhrase;
