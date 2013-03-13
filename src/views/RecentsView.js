 /**
 * RecentsView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.RecentsView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
      $(document).on("clearRecents", this.clearRecentsBtn_handler);
    },
    render: function() {
      this.$el.html(_.template(window.tpl.get("recentsViewTemplate"),{}));
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      spiderOakApp.mainView.showClearRecentsButton();

      this.loadRecents();

      return this;
    },
    loadRecents: function() {
      if (spiderOakApp.recentsCollection.models.length === 0) {
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

      this.recentsListView = new spiderOakApp.RecentsListView({
        collection: spiderOakApp.recentsCollection,
        el: this.$(".filesList")
      }).render();
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle("Recents");
        spiderOakApp.mainView.showBackButton(false);
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
    },
    viewDeactivate: function(event) {
      spiderOakApp.mainView.hideClearRecentsButton();
    },
    clearRecentsBtn_handler: function(event) {
      if (spiderOakApp.recentsCollection.models &&
              spiderOakApp.recentsCollection.length > 0) {
        // Get confirmation
        window.setTimeout(function(){
          navigator.notification.confirm(
            'Are you sure you want to clear your recent history?',
            this.clearRecentsConfirmed,
            'Clear Recents'
          );
        }.bind(this), 50);
      }
    },
    clearRecentsConfirmed: function(button) {
      if (button === 2 || button === 0) return false;
      // Otherwise...
      spiderOakApp.recentsCollection.reset([]);
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
      if (this.recentsListView) {
        this.recentsListView.close();
      }
    }
  });

 spiderOakApp.RecentsListView = Backbone.View.extend({
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
