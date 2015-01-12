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
      /** Prime localization with carefully formed local language codes.
       *
       * 1. Standardize to all lower case. (Utilities vary in their casing.)
       * 2. Follow entries qualified w/country codes with unqualified version.
       * 3. Omit duplicates.
       * 4. Omit empty entries.
       * 5. Include en-us fallback entry as last item, for no empty slots.
       */
      prepareHtml10n: function () {
        // Adapted from https://github.com/mclear/NFC_Ring_Control/blob/df8db31dd1683b04422c106a1484637629b4c88f/www/js/nfcRing/ui.js#L125-L135

        var candidates = [navigator.language, navigator.userLanguage, "en-US"],
            prepped = [];
        // Include in prepped lower case versions of non-empty candidates and,
        // for country-qualified ones, follow it with the unqualified one.
        candidates.forEach(function (candidate) {
          // Empty?
          if (! candidate) { return; }
          candidate = candidate.toLowerCase();
          // Already included?
          if (prepped.indexOf(candidate) !== -1) { return; }
          prepped.push(candidate);
          var splat = candidate.split("-");
          if ((splat.length > 1) &&
              (candidates.indexOf(splat[0]) === -1)) {
            prepped.push(splat[0]);
          }
        });

        html10n.bind('indexed', function() {
          html10n.localize(prepped);
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
