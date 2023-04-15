/**
 * @class CoinGecko
 * @author Mark Miscavage <markmiscavage@protonmail.com>
 * @description A Node.js wrapper for the CoinGecko API with no dependencies. For more information, visit: https://www.coingecko.com/api/docs/v3
 * @example
 *     const CoinGecko = require('coingecko-api');
 *     const CoinGeckoClient = new CoinGecko();
 * @public
 * @version 1.0.10
 * @license MIT
* @kind class
 */
class Utilities {

  /**
   * @description Internal helper to check if parameter is a string
   * @function isString
   * @param {*} str
   * @returns {boolean}
   */
  isString (str) {
    return (typeof str === 'string' || str instanceof String);
  }

  /**
   * @description Internal helper to check if string is empty
   * @function isStringEmpty
   * @param {*} str
   * @returns {boolean}
   */
  isStringEmpty(str) {
    if (!this.isString(str)) return false;
    return (str.length == 0);
  }

  /**
   * @description Internal helper to check if parameter is a date
   * @function isDate
   * @param {*} date
   * @returns {boolean}
   */
  isDate(date) {
    if (this.isString(date) || this.isArray(date) || date == undefined || date == null) return false;
    return (date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date));
  }

  /**
   * @description Internal helper to check if parameter is an object
   * @function isObject
   * @param {*} obj
   * @returns {boolean}
   */
  isObject(obj) {
    if (this.isArray(obj) || this.isDate(obj)) return false;
    return (obj !== null && typeof obj === 'object');
  }

  /**
   * @description Internal helper to check if parameter is a number
   * @function isNumber
   * @param {*} num
   * @returns {boolean}
   */
  isNumber(num) {
    return (!isNaN(num) && !isNaN(parseInt(num)));
  }

  /**
   * @description Internal helper to check if parameter is an array
   * @function isArray
   * @param {*} arr
   * @returns {boolean}
   */
  isArray(arr) {
    return Array.isArray(arr);
  }

  /**
   * @description Internal helper to emit a warning to the console
   * @function _WARN_
   * @param {string} title
   * @param {string} detail
   * @returns {boolean}
   */
   _WARN_ (title = '', detail = '') {
    process.emitWarning(title, {
      detail,
      code: 'CoinGecko',
    });

    return true;
  }

}
//

/*module.exports = {
  isString,
  isStringEmpty,
  isDate,
  isObject,
  isNumber,
  isArray,
  _WARN_,
};
*/

//const Utils = new Utilities();
export default Utilities;
