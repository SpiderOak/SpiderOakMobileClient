 /**
 * DevicesView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FavoritesView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(_.template(window.tpl.get("favoritesViewTemplate"),{}));
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
        spiderOakApp.mainView.setTitle("Favorites");
        spiderOakApp.mainView.showBackButton(false);
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
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
      if (this.favoritesListView) {
        this.favoritesListView.close();
      }
    }
  });

  spiderOakApp.FavoritesListView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];
    },
    render: function() {
      this.addAll();
      return this;
    },
    addOne: function(model) {
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
    close: function(){
      this.remove();
      this.unbind();
      // handle other unbinding needs, here
      _.each(this.subViews, function(subViews){
        if (subViews.close){
          subViews.close();
        }
      });
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
