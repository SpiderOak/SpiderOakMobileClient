/** Encode as URI, except for spaces.
 *
 * Examples of this are scattered around the web.  The jsperf site includes
 * it (and shows that it performs adequately, besides):
 * http://jsperf.com/utf-8-encoding
 */
window.encodeUTF8 = function (text) {
  var got = window.unescape(window.encodeURIComponent(text));
  return got;
},
