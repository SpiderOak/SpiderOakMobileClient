/* Custom per-build configuration settings.
 *
 * Include here those settings that you wish to override the settings in
 * www/config.js. The build process will replace www/custom_config.js with
 * a copy of this, and the app initialize with _.extend() the settings from
 * www/config.js.
 */

window.spiderOakMobile_custom_config = {
  app_label: {value: "SpiderOak Blue", retain: 1},
  showPreliminary: {value: false, retain: 0},
  server: {value: "spideroak.com", retain: 1},
  inhibitAdvancedLogin: {value: false, retain: 0},
  contactEmail: {value: "support@spideroakblue.com", retain: 0}
};

