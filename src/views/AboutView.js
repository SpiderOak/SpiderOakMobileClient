 /**
 * AboutView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.AboutView = spiderOakApp.ViewBase.extend({
    destructionPolicy: "never",
    events: {
      "tap .site-link": "siteLink_tapHandler",
      "tap .email-link": "emailLink_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
      this.settings = {
        actionBar: false,
        offScreen: false,
        platform: (($.os.android) ? "Android" : "iOS")
      };
    },
    render: function() {
      this.$el.html(window.tmpl['aboutSpiderOakViewTemplate'](this.settings));
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      return this;
    },
    siteLink_tapHandler: function(event) {
      event.preventDefault();
      if ($("#main").hasClass("open")) {
        return;
      }
      event.stopPropagation();
      window.open($(event.target).data("url"), "_system");

    },
    emailLink_tapHandler: function(event) {
      // @FIXME: This is a bit Android-centric
      if ($("#main").hasClass("open")) {
        event.preventDefault();
        return;
      }
      var subject = "Feedback on " + s("SpiderOak") + " " +
            this.settings.platform + " app version " + spiderOakApp.version;
      var extras = {};
      extras[spiderOakApp.fileViewer.EXTRA_SUBJECT] = subject;
      extras[spiderOakApp.fileViewer.EXTRA_EMAIL] =
        window.spiderOakApp.settings.getOrDefault("contactEmail",
          this.settings.platform + "@spideroak.com");
      var params = {
        action: spiderOakApp.fileViewer.ACTION_SEND,
        type: "text/plain",
        extras: extras
      };
      if ($.os.ios) {
        window.location.href = "mailto:"+
            extras[spiderOakApp.fileViewer.EXTRA_EMAIL]+
            "?subject="+
            extras[spiderOakApp.fileViewer.EXTRA_SUBJECT];
        return;
      }
      spiderOakApp.fileViewer.share(
        params,
        function(){
          // ...
        },
        function(error) { // @FIXME: Real error handling...
          console.log(JSON.stringify(error));
        }
      );
    },
    remove: function() {
      this.close();
      this.$el.remove();
      this.stopListening();
      return this;
    },
    close: function() {
      // Clean up our subviews
      this.scroller.destroy();
    }
  });

  spiderOakApp.LearnAboutView = spiderOakApp.AboutView.extend({
    className: "learn-about-spideroak",
    events: {
      "touchend .back-btn": "dismiss",
      "tap .site-link": "siteLink_tapHandler",
      "tap .email-link": "emailLink_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
      this.settings = {
        actionBar: true,
        offScreen: true,
        platform: (($.os.android)?"Android":"iOS")
      };
      $(document).one("backbutton", this.dismiss);
    },
    render: function() {
      this.$el.html(
        window.tmpl['aboutSpiderOakViewTemplate'](this.settings)
      );
      this.$el.css("-webkit-transform","translate3d(0,100%,0)");
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      return this;
    },
    show: function() {
      this.$el.animate({"-webkit-transform":"translate3d(0,0,0)"}, {
        duration: 100,
        complete: function() {
          if (window.StatusBar && $.os.ios) {
            window.StatusBar.styleDefault();
            $("body").css("background-color",s("#e4e4e4"));
          }
        }
      });
    },
    dismiss: function(event) {
      if (window.StatusBar && $.os.ios) {
        window.StatusBar.styleLightContent();
        $("body").css("background-color",s("#f59f35"));
      }
      this.$el.animate({"-webkit-transform":"translate3d(0,100%,0)"}, {
        duration: 100,
        complete: function() {
          this.remove();
        }.bind(this)
      });
    }
  });

  spiderOakApp.SettingsAboutView = spiderOakApp.AboutView.extend({
    initialize: function() {
      window.bindMine(this);
      this.settings = {
        actionBar: false,
        offScreen: true,
        platform: (($.os.android)?"Android":"iOS")
      };
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle("About " + s("SpiderOak"));
        if (!!spiderOakApp.navigator.viewsStack[0] &&
              spiderOakApp.navigator.viewsStack[0].instance === this) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else if (!spiderOakApp.navigator.viewsStack[0] ||
            spiderOakApp.navigator.viewsStack.length === 0) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else {
          spiderOakApp.mainView.showBackButton(true);
        }
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
    },
    viewDeactivate: function(event) {
      this.remove();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
