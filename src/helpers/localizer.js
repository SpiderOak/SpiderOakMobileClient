(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      html10n     = window.html10n,
      $           = window.$;

  window.localizer = function () {
    return {
      prepareHtml10n: function () {
        // Adapted from https://github.com/mclear/NFC_Ring_Control/blob/df8db31dd1683b04422c106a1484637629b4c88f/www/js/nfcRing/ui.js#L125-L135
        var language = document.cookie.match(/language=((\w{2,3})(-\w+)?)/);
        if(language) language = language[1];
        html10n.bind('indexed', function() {
          html10n.localize([language,
                            navigator.language,
                            navigator.userLanguage,
                            'en']);
        });
        html10n.bind('localized', function() {
          console.log("Localized");
          document.documentElement.lang = html10n.getLanguage();
          document.documentElement.dir = html10n.getDirection();
        });
      }
    };
  }();

  window.qq = html10n.get;

  })(window);
