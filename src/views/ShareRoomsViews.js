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
      this.$el.html(window.tmpl["shareRoomsRootViewTemplate"]());
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
      else {
        this.$el.find(".myShareRoomsSection").hide();
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
    },
    which: "ShareRoomsRootView"
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
      this.collection.on( "change", this.render, this );
      this.collection.on( "remove", this.render, this );

      this.collection.fetch({
        error: function(collection, response, options) {
          spiderOakApp.dialogView.showNotifyErrorResponse(response);
          this.render().addAll();
        }.bind(this)
      });
    },
    render: function() {
      this.$el.find(".myShareRoomsSection").show();
      this.addAll();
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
    },
    which: "MyShareRoomsListView"
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
      this.collection.on( "change", this.render, this );
      this.collection.on( "remove", this.render, this );

      $(document).on("addPublicShareRoom", this.addPublicShare, this);

      this.collection.fetch();
      if (this.collection.length === 0) {
        this.settle();
      }
    },
    render: function() {
      this.addAll();
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
        {model: this.model},
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
    },
    which: "VisitedShareRoomsListView"
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
      var remembering = spiderOakApp.settings
                          .getOrDefault("shareroomsRemembering", 0);
      this.$el.html(
        window.tmpl["addShareRoomTemplate"]({"remembering": remembering})
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
      var remember = this.$("[name=remember]").is(":checked") ? 1 : 0,
          shareId = window.multilingual(this.$("[name=shareid]").val().trim()),
          roomKey = window.multilingual(this.$("[name=roomkey]").val().trim()),
          pubShares = spiderOakApp.publicShareRoomsCollection;

      event.preventDefault();
      this.$("input").blur();

      spiderOakApp.settings.setOrCreate("shareroomsRemembering", remember, 1);

      if (! shareId || ! roomKey) {
        spiderOakApp.navigator.popView(spiderOakApp.defaultEffect);
        return;
      }

      if (pubShares.hasByAttributes(shareId, roomKey)) {
        spiderOakApp.dialogView.showNotify({
          title: "<i class='icon-warning'></i> ShareRoom already present",
          subtitle: ("Public ShareRoom " + shareId + "/" + roomKey +
                     " is already being visited.")
        });
      }
      else {
        spiderOakApp.publicShareRoomsCollection.add({
          remember: remember,
          share_id: shareId,
          room_key: roomKey
        }, {
          error: function (model, response, options) {
            spiderOakApp.dialogView.showNotifyErrorResponse(
              response,
              {
                title: "<i class='icon-warning'></i> Not found",
                subtitle: ("No such ShareRoom " + shareId +
                           " / " + roomKey)
              });
          }
        });
      }
      spiderOakApp.navigator.popView(spiderOakApp.defaultEffect);
    },
    addShareRoomsButton_tapHandler: function(event) {
      event.preventDefault();
      this.form_submitHandler(event);
    },
    close: function(){
      this.remove();
      this.unbind();
    },
    which: "AddShareRoomView"
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
      spiderOakApp.navigator.pushView(
        spiderOakApp.AddShareRoomView,
        {},
        spiderOakApp.defaultEffect
      );
    },
    which: "PublicShareRoomsAddButton"
  });

  spiderOakApp.ShareRoomItemView = Backbone.View.extend({
    templateID: "shareRoomItemViewTemplate",
    detailsTemplateID: "shareItemDetailsViewTemplate",
    tagName: "li",
    className: "",
    events: {
      "tap a": "descend_tapHandler",
      "longTap a": "a_longTapHandler"
    },
    actionItems: [
      {className: "open", description: "Open"},
      {className: "details", description: "Details"},
      {className: "send-link", description: "Send link"}
    ],
    actionItemHandlers: {
      open: function (event) { this.descend_tapHandler(event); },
      details: function (event) { this.viewDetails(event); },
      "send-link": function (event) { this.sendLink(); },
      forgetPassword: function (event) { this.forgetPassword(); }
    },
    initialize: function() {
      _.bindAll(this, "render");
      this.model.on("change", this.render, this);
    },
    render: function() {
      this.$el.html(window.tmpl[this.templateID](this.model.toJSON()));
      return this;
    },
    descend_tapHandler: function(event) {
      var options;
      event.stopPropagation();
      event.preventDefault();
      var $target = $(event.target);

      if ($target.hasClass("rightButton") ||
          $target.hasClass("icon-close") ||
          $target.closest('a').hasClass("preliminary")) {
        return;
      }

      $target = $target.tagName === "A" ? $target : $target.closest("a");
      if ($target.text().trim() === "" ||
          $target.text().trim() === "Loading...") {
        return;
      }

      if (this.model.get("password_required")) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.GetShareRoomPasswordView,
          {model: this.model},
          spiderOakApp.defaultEffect
        );
      }
      else if (! this.model.get("name")) {
        // Hasn't yet resolved, do a fetch and descend again on success:
        spiderOakApp.dialogView.showWait({
          title: "Fetching"
        });
        options = {
          success: function () {
            spiderOakApp.dialogView.hide();
            this.descend_tapHandler(event);
          }.bind(this),
          error: function () {
            spiderOakApp.dialogView.hide();
            spiderOakApp.dialogView.showNotify({
              title: "Fetch unsatisfied"
            });
          }.bind(this)
        };
        this.model.fetch(options);
      }
      else {
        options = {
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
      }
    },
    forgetPassword: function(event) {
      this.model.removePassword();
      this.model.fetch();
    },
    viewDetails: function (event) {
      spiderOakApp.navigator.pushView(
        spiderOakApp.ShareItemDetailsView,
        { model: this.model,
          templateID: this.detailsTemplateID
        },
        spiderOakApp.defaultEffect
      );
    },
    sendLink: function(event) {
      var model = this.model;
      spiderOakApp.dialogView.showWait({subtitle:"Retrieving link"});
      spiderOakApp.dialogView.hide();
      var name = model.get("name");
      var alternate = model.get("share_id") + "/" + model.get("room_key");
      var text = ("I want to share this link with you:" +
                  "\n\nShareRoom: " + (name || alternate) +
                  "\nLink: " + model.getWebURL());
      if (model.get("password_required") || model.get("password")) {
        text += "\n\n(Access requires an additional password.)";
      }
      var extras = {};
      extras[spiderOakApp.fileViewer.EXTRA_TEXT] = text;
      var params = {
        action: spiderOakApp.fileViewer.ACTION_SEND,
        type: "text/plain",
        extras: extras
      };
      spiderOakApp.fileViewer.share(
        params,
        function(){
          // Add the file to the recents collection (view or fave)
          var recentModels = spiderOakApp.recentsCollection.models;
          var matchingModels = _.filter(recentModels, function(recent){
            return recent.composedUrl(true) === model.composedUrl(true);
          });
          if (matchingModels.length > 1) {
//            console.log("Multiple duplicates detected...");
          }
          spiderOakApp.recentsCollection.remove(matchingModels[0]);
          spiderOakApp.recentsCollection.add(model);
        },
        function(error) { // @FIXME: Real error handling...
          console.log(JSON.stringify(error));
          navigator.notification.alert(
            "Error sending this link. Try again later.",
            null,
            "File error",
            "OK"
          );
        }
      );
    },
    a_longTapHandler: function(event, actionItems) {
      var $target = $(event.target);
      $target = $target.tagName === "A" ? $target : $target.closest("a");
      if ($target.text().trim() === "" ||
          $target.text().trim() === "Loading...") {
        return;
      }

      if (! actionItems) {
        actionItems = this.actionItems;
      }
      if (this.model.getPassword()) {
        actionItems = actionItems.concat({className: "forgetPassword",
                                          description: "Forget password"});
      }
      event.preventDefault();
      event.stopPropagation();
      var menuView = new spiderOakApp.ContextPopup({
        items: actionItems
      });
      $(document).one("backbutton", function(event) {
        spiderOakApp.dialogView.hide();
        menuView.remove();
      });
      menuView.once("item:tapped", function menu_tapHandler(event) {
        var command = $(event.target).data("command");
        spiderOakApp.dialogView.hide();
        menuView.remove();
        this.actionItemHandlers[command].call(this, event);
      }.bind(this));
      spiderOakApp.dialogView.showDialogView(menuView);
    },
    close: function(){
      this.remove();
      this.unbind();
    },
    which: "ShareRoomItemView"
  });

  spiderOakApp.PublicShareRoomItemView = spiderOakApp.ShareRoomItemView.extend({
    templateID: "shareRoomItemViewTemplate",
    detailsTemplateID: "pubshareItemDetailsViewTemplate",
    events: _.extend(
      {},
      spiderOakApp.ShareRoomItemView.prototype.events,
      {
        "tap .removePublicShare": "removePublicShare_tapHandler"
      }
    ),
    actionItems: spiderOakApp.ShareRoomItemView.prototype.actionItems.concat(
      [{className: "remove", description: "Remove"}]
    ),
    actionItemHandlers: _.extend(
      {},
      spiderOakApp.ShareRoomItemView.prototype.actionItemHandlers,
      {
        remove: function (event) {
          this.removePublicShare_tapHandler(event); },
        remember: function (event) { this.remember(); },
        forget: function (event) { this.forget(); }
      }
    ),
    initialize: function() {
      return spiderOakApp.ShareRoomItemView.prototype.initialize.call(this);
    },
    a_longTapHandler: function(event, actionItems) {
      if (! actionItems) {
        actionItems = this.actionItems;
      }
      if (this.model.get("remember")) {
        actionItems = actionItems.concat({className: "forget",
                                          description: "Forget"});
      }
      else {
        actionItems = actionItems.concat({className: "remember",
                                          description: "Remember"});
      }
      return spiderOakApp.ShareRoomItemView.prototype
          .a_longTapHandler.call(this, event, actionItems);
    },
    remember: function(event) {
      this.model.set("remember", 1);
    },
    forget: function(event) {
      this.model.set("remember", 0);
    },
    removePublicShare_tapHandler: function(event) {
      event.stopPropagation();
      event.preventDefault();
      var removeShare = function(button) {
        if (button === 1) {
          this.model.removePassword();
          this.model.collection.remove(this.model);
        }
      }.bind(this);
      navigator.notification.confirm(
        "Remove this Share Room?",
        removeShare,
        "Remove?",
        "OK,Cancel"
      );
    },
    which: "PublicShareRoomItemView"
  });

  spiderOakApp.ShareItemDetailsView = spiderOakApp.FileView.extend({
    destructionPolicy: "never",
    events: {
      "tap .file-send-button": "sendLink"
    },
    initialize: function(options) {
      _.bindAll(this);
      this.model.on("change",this.render);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      this.templateID = options.templateID;
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      // Why is this.model.toJSON() being extended with nothing? 
      this.$el.html(
        window.tmpl[this.templateID](_.extend(this.model.toJSON()))
      );
      spiderOakApp.mainView.setTitle("Details");
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });
      return this;
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
    },
    viewActivate: function(event) {
      spiderOakApp.backDisabled = false;
      spiderOakApp.mainView.showBackButton(true);
    },
    viewDeactivate: function(event) {
      // this.close();
    },
    close: function() {
      this.scroller.destroy();
      this.remove();
      this.unbind();
    },
    which: "ShareItemDetailsView"
  });

  spiderOakApp.GetShareRoomPasswordView = Backbone.View.extend({
    name: "Get ShareRoom Password",
    templateID: "getShareRoomPasswordTemplate",
    events: {
      "submit form": "form_submitHandler",
      "tap .submitPasswordButton": "submitPasswordButton_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
      this.listenTo(this.model, "change", function () {
        $(document).trigger("settingChanged");
      });
    },
    render: function() {
      this.$el.html(window.tmpl[this.templateID](this.getTemplateValues()));
      return this;
    },
    getTemplateValues: function() {
      return this.model.toJSON();
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle("Server Address");
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
    /** Validate and apply the password.
     *
     * Given a valid password, we:
     * - Present a success toast
     * - Register the password in the share room model
     * - Proceed to the share room contents
     *
     * If invalid:
     * - We present a failure toast
     * - Ensure the model's password is zeroed
     * - Return to the share rooms views - the share will remain
     */
    form_submitHandler: function(event) {
      var password = window.multilingual(this.$("[name=pwrd]").val());
      this.model.setPassword(password);

      spiderOakApp.dialogView.showWait({
        title: "Validating"
      });
      event.preventDefault();
      this.$("input").blur();

      var handleValidPassword = function() {
        // Using '?auth_required_format=json' means always apparent
        // success; but parsing will have zeroed the password if the json
        // result indicated:
        if (! this.model.getPassword()) {
          return handleInvalidPassword();
        }
        spiderOakApp.dialogView.hide();
        var options = {
          id: this.model.cid,
          title: this.model.get("name"),
          model: this.model
        };
        if (spiderOakApp.navigator.viewsStack.length > 0) {
          spiderOakApp.navigator.popView(spiderOakApp.defaultEffect);
        }
        var folderView = new spiderOakApp.FolderView(options);
        spiderOakApp.navigator.pushView(
          folderView,
          {},
          spiderOakApp.defaultEffect
        );
      }.bind(this);

      var handleInvalidPassword = function() {
        spiderOakApp.dialogView.hide();
        spiderOakApp.dialogView.showNotify({
          title: "<i class='icon-warning'></i> Invalid password"
        });
        if (spiderOakApp.navigator.viewsStack.length > 0) {
          spiderOakApp.navigator.popView(spiderOakApp.defaultEffect);
        }
      }.bind(this);

      var options = {
        success: handleValidPassword,
        error: handleInvalidPassword
      };
      this.model.fetch(options);
    },
    submitPasswordButton_tapHandler: function(event) {
      event.preventDefault();
      this.form_submitHandler(event);
    },
    close: function() {
      this.remove();
      this.unbind();
    },
    which: "GetShareRoomPasswordView"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
