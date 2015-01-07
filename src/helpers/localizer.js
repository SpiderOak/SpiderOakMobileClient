(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      html10n     = window.html10n,
      moment      = window.moment,
      $           = window.$;

  window.localizer = function () {
    return {
      prepareHtml10n: function () {
        // Adapted from https://github.com/mclear/NFC_Ring_Control/blob/df8db31dd1683b04422c106a1484637629b4c88f/www/js/nfcRing/ui.js#L125-L135
        html10n.bind('indexed', function() {
          html10n.localize('en-US');
          html10n.localize([navigator.language,
                            navigator.userLanguage,
                            'en-US']);
        });
        html10n.bind('localized', function() {
          console.log("Localized");
          // We use html10n.language instead of navigator.language
          //   so that it doesn't translate moment if we don't have
          //   string translations for that locale
          moment.locale([html10n.language]);
          document.documentElement.lang = html10n.getLanguage();
          document.documentElement.dir = html10n.getDirection();
        });
      }
    };
  }();

  window.qq = html10n.get;

  })(window);
