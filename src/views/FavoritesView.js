 /**
 * DevicesView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      qq          = window.qq,
      s           = window.s;

  spiderOakApp.FavoritesView = spiderOakApp.ViewBase.extend({
    destructionPolicy: "never",
    initialize: function() {
      window.bindMine(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(window.tmpl["favoritesViewTemplate"]());
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      this.loadFavorites();

      return this;
    },
    loadFavorites: function() {
      if (spiderOakApp.favoritesCollection.models.length === 0) {
        this.$(".folderViewLoading").removeClass("loadingFiles");
        return;
      }
      // When we have finished fetching the files, help hide the spinner
      this.$(".filesList").one("complete", function(event) {
        // @TODO: Refresh subviews scroller
        this.$(".folderViewLoading").removeClass("loadingFiles");
        window.setTimeout(function(){
          this.scroller.refresh();
        }.bind(this),0);
      }.bind(this));

      this.favoritesListView = new spiderOakApp.FavoritesListView({
        collection: spiderOakApp.favoritesCollection,
        el: this.$(".filesList")
      }).render();
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle(qq("Favorites"));
        spiderOakApp.mainView.showBackButton(false);
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
      this.refreshAllFavoritesButtonView =
        new spiderOakApp.RefreshAllFavoritesButtonView();
      $("#main .nav").append(this.refreshAllFavoritesButtonView.render().el);
    },
    viewDeactivate: function(event) {
      this.refreshAllFavoritesButtonView.remove();
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
      this.refreshAllFavoritesButtonView.close();
      if (this.favoritesListView) {
        this.favoritesListView.close();
      }
    }
  });

  spiderOakApp.RefreshAllFavoritesButtonView = spiderOakApp.ViewBase.extend({
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
    },
    render: function() {
      this.$el.html(
        "<a class='refresh-favorites-btn'><i class='icon-loop'></i></a>"
      );
      return this;
    },
    a_tapHandler: function(event) {
      event.preventDefault();
      // fire the event, let a view catch it and do something
      $(document).trigger("refreshAllFavorites");
    },
    close: function() {
      this.remove();
      this.unbind();
    }
  });

  spiderOakApp.FavoritesListView = spiderOakApp.ViewBase.extend({
    initialize: function() {
      window.bindMine(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "complete", this.triggerComplete, this );
      this.collection.on( "all", this.render, this );
      $(document).on("refreshAllFavorites", this.refreshAllFavorites);

      this.subViews = [];
    },
    render: function() {
      _.each(this.subViews, function(subViews){
        if (subViews.close){
          subViews.close();
        }
      });
      this.subViews = [];
      this.addAll();
      return this;
    },
    addOne: function(model) {
      model.url = model.get("url");
      var view = new spiderOakApp.FilesListItemView({
        model: model
      });

      this.$el.append(view.render().el);
      this.subViews.push(view);
    },
    addAll: function() {
      this.$el.empty();
      this.collection.each(this.addOne, this);
      this.$el.trigger("complete");
    },
    triggerComplete: function() {
      this.$el.trigger("complete");
    },
    refreshAllFavorites: function(event) {
      event.stopImmediatePropagation();
      navigator.notification.confirm(
        qq("Do you want to refresh all of your favorites? This will re-download the latest versions."),
        function(button) {
          if (button !== 1) {
            return;
          }
          var remaining = this.subViews.slice(0);
          this.refresh(remaining, function() {
            spiderOakApp.dialogView.hide();
          });
        }.bind(this),
        qq("Favorites"),
        [qq("OK"), qq("Cancel")]
      );
    },
    refresh: function(remaining, callback) {
      var current = remaining.shift();
      current.refreshFavorite(function(){
        if (remaining.length) {
          spiderOakApp.dialogView.hide();
          this.refresh(remaining, callback);
          return;
        }
        callback();
      }.bind(this));
    },
    close: function(){
      this.remove();
      this.unbind();
      $(document).off("refreshAllFavorites", this.refreshAllFavorites);
      // handle other unbinding needs, here
      _.each(this.subViews, function(subViews){
        if (subViews.close){
          subViews.close();
        }
      });
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
