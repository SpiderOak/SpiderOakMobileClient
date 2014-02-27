/* Default configuration settings.  Do not change!
 * Use custom_config.js for custom overrides.
 */

window.spiderOakMobile_config = {
  app_label: {value: "SpiderOak", retain: 1},
  server: {value: "spideroak.com", retain: 1},
  // standardServer: to compare for change from standard; usually spideroak.com
  standardServer: {value: "spideroak.com", retain: 0},
  // inhibitAdvancedLogin: is changing the server allowed?
  inhibitAdvancedLogin: {value: true, retain: 0},
  alternateAjax: window.$.ajax
};
