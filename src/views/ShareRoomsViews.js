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
    destructionPolicy: "never",
    initialize: function() {
      spiderOakApp.shareRoomsCollection =
          new spiderOakApp.ShareRoomsCollection();
      spiderOakApp.publicShareRoomsCollection =
          new spiderOakApp.PublicShareRoomsCollection();
      // spiderOakApp.addShareRoomView =
      //     new spiderOakApp.AddShareRoomView().render();
      _.bindAll(this);
      this.name = "Share Rooms";
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(_.template(
        window.tpl.get("shareRoomsRootViewTemplate"),{})
      );
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      // Load the visited and account share rooms simultaneously (quasi-async)
      window.setTimeout(function(){
        this.loadMyShareRooms();
      }.bind(this), 10);
      this.loadVisitedShareRooms();

      return this;
    },
    loadVisitedShareRooms: function() {
      this.visitedShareRoomsListView =
        new spiderOakApp.VisitedShareRoomsListView({
          collection: spiderOakApp.publicShareRoomsCollection,
          el: this.$(".visitedShareRoomsSection"),
          scroller: this.scroller
        });
      // When we've finished fetching the folders, help hide the spinner:
      this.visitedShareRoomsListView.$el.one("complete", function(event) {
        this.visitedShareRoomsListView.settle();
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
      this.myShareRooms = new spiderOakApp.MyShareRoomsCollection();
      this.myShareRooms.url =
          spiderOakApp.accountModel.get("mySharesListURL");
      this.myShareRooms.urlBase =
          spiderOakApp.accountModel.get("mySharesRootURL");
      // Avoid trying to fetch account's share rooms when not logged in:
      if (this.myShareRooms.url) {
        this.myShareRoomsListView = new spiderOakApp.MyShareRoomsListView({
          collection: this.myShareRooms,
          el: this.$(".myShareRoomsSection")
        });

        // When we have finished fetching the folders, help hide the spinner
        this.myShareRoomsListView.$el.one("complete", function(event) {
          this.myShareRoomsListView.settle();
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
      this.addPublicShareRoomButtonView =
        new spiderOakApp.PublicShareRoomsAddButton();
      $("#main .nav").append(this.addPublicShareRoomButtonView.render().el);
    },
    viewDeactivate: function(event) {
      this.addPublicShareRoomButtonView.remove();
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

  spiderOakApp.MyShareRoomsListView = Backbone.View.extend({
    initialize: function() {
      this.subViews = [];

      /** A handle on our section's content list. */
      this.$elList = this.$el.find(".myShareRoomsList");
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.collection.fetch();
    },
    render: function() {
      // @TODO: Add a "loading spinner" row at the top
      this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    settle: function() {
      this.$el.find(".mySharesViewLoading")
          .removeClass("loadingMyShares");
    },
    addOne: function(model) {
      var view = new spiderOakApp.ShareRoomItemView({
        model: model
      });
      this.$elList.append(view.render().el);
      this.subViews.push(view);
    },
    addAll: function() {
      this.$elList.empty(); // needed still?
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

  spiderOakApp.VisitedShareRoomsListView = Backbone.View.extend({
    initialize: function() {
      this.subViews = [];
      if (this.options.scroller) {
        this.scroller = this.options.scroller;
      }

      /** A handle on our section's content list. */
      this.$elList = this.$el.find(".visitedShareRoomsList");

      _.bindAll(this);
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      $(document).on("addPublicShareRoom", this.addPublicShare, this);

      this.collection.fetch();
    },
    render: function() {
      // @TODO: Add a "loading spinner" row at the top
      this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    settle: function() {
      this.$el.find(".visitedSharesViewLoading")
          .removeClass("loadingVisitedShares");
    },
    addOne: function(model) {
      var view = new spiderOakApp.PublicShareRoomItemView({
        model: model
      });
      this.$elList.append(view.render().el);
      this.subViews.push(view);
    },
    addAll: function() {
      this.$elList.empty(); // needed still?
      this.collection.each(this.addOne, this);
      this.$el.trigger("complete");
      this.scroller.refresh();
    },
    addPublicShare: function(event) {
      // spiderOakApp.addShareRoomView.show();
      spiderOakApp.navigator.pushView(
        spiderOakApp.PublicShareRoomItemView,
        {model:this.model},
        spiderOakApp.defaultEffect
      );
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

  spiderOakApp.AddShareRoomView = Backbone.View.extend({
    name: "Add Public Share Room",
    className: "addShareRoom",
    events: {
      "submit form": "form_submitHandler",
      "tap .addShareRoomsButton": "addShareRoomsButton_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(_.template(
        window.tpl.get("addShareRoomTemplate"),{})
      );
      return this;
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.showBackButton(true);
      }
    },
    viewActivate: function(event) {
      spiderOakApp.backDisabled = false;
    },
    viewDeactivate: function(event) {
      this.$("input").val("");
      this.$("input").blur();
    },
    form_submitHandler: function(event) {
      event.preventDefault();
      this.$("input").blur();
      var doAdds = function(remember) {
        spiderOakApp.publicShareRoomsCollection.add({
          remember: (remember === 1) ? 1 : 0,
          share_id: this.$("[name=shareid]").val(),
          room_key: this.$("[name=roomkey]").val()
        });
        spiderOakApp.navigator.popView();
        // this.addAll();
      }.bind(this);
      navigator.notification.confirm(
        "Remember this Share Room?",
        doAdds,
        "Remember?",
        "Remember,Don't Remember"
      );
    },
    addShareRoomsButton_tapHandler: function(event) {
      event.preventDefault();
      this.form_submitHandler(event);
    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });

  spiderOakApp.PublicShareRoomsAddButton = Backbone.View.extend({
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(
        "<a class='add-sharerooms-btn'><i class='icon-plus'></i></a>"
      );
      return this;
    },
    a_tapHandler: function(event) {
      event.preventDefault();
      // fire the event, let a view catch it and do something
      spiderOakApp.navigator.pushView(
        spiderOakApp.AddShareRoomView,
        {},
        spiderOakApp.defaultEffect
      );
    }
  });

  spiderOakApp.ShareRoomItemView = Backbone.View.extend({
    tagName: "li",
    className: "",
    events: {
      "tap a": "descend_tapHandler"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {
      this.$el.html(
        _.template(
          "<a href='#share'>" +
          "<i class='icon-folder'></i> <%= name %>" +
          "</a>",
          this.model.toJSON()
        )
      );
      return this;
    },
    descend_tapHandler: function(event) {
      event.stopPropagation();
      event.preventDefault();
      console.log($(event.target));
      if ($(event.target).hasClass("rightButton") ||
          $(event.target).hasClass("icon-close")) {
        return;
      }
      var options = {
        id: this.model.cid,
        title: this.model.get("name"),
        model: this.model
      };
      var folderView = new spiderOakApp.FolderView(options);
      spiderOakApp.navigator.pushView(
        folderView,
        {},
        spiderOakApp.defaultEffect
      );
    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });


  spiderOakApp.PublicShareRoomItemView = spiderOakApp.ShareRoomItemView.extend({
    events: {
      "tap a": "descend_tapHandler",
      "tap .removePublicShare": "removePublicShare_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(_.template(
        window.tpl.get("publicShareRoomItemViewTemplate"),
        this.model.toJSON()
      ));
      return this;
    },
    removePublicShare_tapHandler: function(event) {
      event.stopPropagation();
      event.preventDefault();
      var removeShare = function(button) {
        if (button === 1) {
          this.model.collection.remove(this.model);
        }
      }.bind(this);
      navigator.notification.confirm(
        "Remove this Share Room?",
        removeShare,
        "Remove?",
        "OK,Cancel"
      );
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
