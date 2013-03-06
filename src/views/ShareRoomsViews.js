 /**
 * ShareRoomsView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  /** A model-less view of the visited share rooms and account share rooms.
   *
   */
  spiderOakApp.ShareRoomsRootView = Backbone.View.extend({
    templateID: "#shareRoomsRootViewTemplate",
    destructionPolicy: "never",
    initialize: function() {
      _.bindAll(this);
      this.name = "Share Rooms";
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(_.template($(this.templateID).text()));
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

//      // Load the visited and account share rooms simultaneously (quasi-async)
//      window.setTimeout(function(){
        this.loadMyShareRooms();
//      }.bind(this), 10);
      this.loadVisitedShareRooms();

      return this;
    },
    loadVisitedShareRooms: function() {
      this.visitedShareRooms = new spiderOakApp.visitedShareRoomsCollection();
      this.visitedShareRooms.url = "";

      this.$(".mySharesViewLoading").removeClass("loadingVisitedShares");
      // Populate the array with share rooms being visited...
      this.visitedShareRoomsListView =
          new spiderOakApp.visitedShareRoomsListView({
            collection: this.visitedShareRooms,
            el: this.$(".visitedShareRoomsList")
          });
      // When we've finished fetching the folders, help hide the spinner:
      this.$(".visitedSharesList").one("complete", function(event) {
        this.$(".visitedSharesViewLoading").removeClass("loadingFolders");
        window.setTimeout(function(){
          this.scroller.refresh();
        }.bind(this),0);
        // @TODO: Refresh subviews scroller
      }.bind(this));
    },
    loadMyShareRooms: function() {
      if (! spiderOakApp.accountModel) {
        return;
      }
      this.myShareRooms = new spiderOakApp.myShareRoomsCollection();
      this.myShareRooms.url = spiderOakApp.accountModel.getMyShareRoomsURL();
      // We want to track the url when it is unset, as well as when it's set:
      if (this.myShareRooms.url) {
        this.myShareRoomsListView = new spiderOakApp.myShareRoomsListView({
          collection: this.myShareRooms,
          el: this.$(".myShareRoomsList")
        });
        // When we have finished fetching the folders, help hide the spinner
        this.$(".myShareRoomsList").one("complete", function(event) {
          this.$(".mySharesViewLoading").removeClass("loadingMyShares");
          window.setTimeout(function(){
            this.scroller.refresh();
          }.bind(this),0);
          // @TODO: Refresh subviews scroller
        }.bind(this));
      }
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      var viewsStack = spiderOakApp.navigator.viewsStack;
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle(this.name);
        if (!!viewsStack[0] &&
              viewsStack[0].instance.templateID === this.templateID) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else if (!viewsStack[0] ||
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
      //this.close();
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
      this.visitedShareRoomsListView.close();
      this.myShareRoomsListView.close();
    }
  });

  spiderOakApp.myShareRoomsListView = Backbone.View.extend({
    initialize: function() {
      this.views = [];
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];

      this.collection.fetch();
    },
    render: function() {
      // @TODO: Add a "loading spinner" row at the top
      this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    addOne: function(model) {
      // @TODO: Assigning model.url seems like the collection's responsibility:
      model.url = this.collection.url + model.get("url");
      var view = new spiderOakApp.ShareRoomItemView({
        model: model
      });
      this.$el.append(view.render().el);
      this.subViews.push(view);
    },
    addAll: function() {
      this.$el.empty(); // needed still?
      // Since the visited share rooms collection is actually an array,
      // iterate directly over the models:
      // _.each(this.models, this.addOne);
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

  var myShareRoomsListView = spiderOakApp.myShareRoomsListView;
  spiderOakApp.visitedShareRoomsListView = myShareRoomsListView.extend({
    addOne: function(model) {
      // @TODO: Assigning model.url seems like the collection's responsibility:
      model.url = model.get("url");
      var view = new spiderOakApp.ShareRoomItemView({
        model: model
      });
      this.$el.append(view.render().el);
      this.subViews.push(view);
    }
  });

  spiderOakApp.ShareRoomItemView = Backbone.View.extend({
    tagName: "li",
    className: "",
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {
      this.$el.html(
        _.template(
          "<a href='#storage'>" +
          "<i class='icon-folder'></i> <%= name %>" +
          "</a>",
          this.model.toJSON()
        )
      );
      return this;
    },
    a_tapHandler: function(event) {
      var options = {
        id: this.model.cid,
        title: this.model.get("name"),
        model: this.model
      };
      spiderOakApp.navigator.pushView(
        spiderOakApp.FolderView,
        options,
        spiderOakApp.defaultEffect);

    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
