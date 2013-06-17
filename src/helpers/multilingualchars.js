/** Encode as URI, except for spaces. */
window.encodeURIExceptSpaces = function (text) {
  var got = window.encodeURI(text).replace(/%20/g, " ");
  return got;
},


/** Return string, providing for non-Basic-Multilingual-Planeharacters.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
 */
window.multilingual = function (str) {
  var got = [],
      current, i;
  for (i=0; i<str.length; i++) {
    current = fixedCharCodeAt(str, i);
    if (current) {
      got.push(current);
    }
  }
  return String.fromCharCode.apply(null, got);
};

/** Fixing charCodeAt to handle non-Basic-Multilingual-Plane characters
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt#Example_2.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
 * Example 2: Fixing charCodeAt to handle non-Basic-Multilingual-Plane
 * characters if their presence earlier in the string is unknown
 */
function fixedCharCodeAt (str, idx) {
    // ex. fixedCharCodeAt ('\uD800\uDC00', 0); // 65536
    // ex. fixedCharCodeAt ('\uD800\uDC00', 1); // 65536
    idx = idx || 0;
    var code = str.charCodeAt(idx);
    var hi, low;
    if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
        hi = code;
        low = str.charCodeAt(idx+1);
        if (isNaN(low)) {
            throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
        }
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
        // We return false to allow loops to skip this iteration since should have already handled high surrogate above in the previous iteration
        return false;
        /*hi = str.charCodeAt(idx-1);
        low = code;
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
    }
    return code;
}
