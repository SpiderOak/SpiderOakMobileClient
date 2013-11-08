// /*jshint expr:true */
// describe('DevicesView', function() {
//   beforeEach(function() {
//     spiderOakApp.initialize();
//     this.server = sinon.fakeServer.create();
//     this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
//     this.server.respondWith(
//       "POST",
//       "https://spideroak.com/browse/login",
//       [200, {"Content-Type": "text/html"},
//        "location:https://spideroak.com/storage/" +
//        this.b32username +
//        "/login"]
//     );
//     this.username = "testusername";
//     this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
//     this.password = "testpassword";
//     this.accountModel =
//         spiderOakApp.accountModel = new spiderOakApp.AccountModel();
//     this.accountModel.login(this.username, this.password,
//                                 function(){}, function(){});
//     this.server.respond();
//   });
//   afterEach(function() {
//     this.server.restore();
//   });
//   describe('Instantiation', function() {
//     beforeEach(function() {
//       this.server.respondWith(
//         "GET",
//         "https://spideroak.com/storage/" + this.b32username + "/",
//         [
//           200,
//           {"Content-Type": "test/html"},
//           '{"devices":[{"encoded":"Test%20device/","lastcommit":1366416269,' +
//           '"lastlogin":1366435030,"name":"Test device","sysplatform":"darwin"},' +
//           '{"encoded":"OtherDevice/","lastcommit":1366242391,' +
//           '"lastlogin":1366435028,"name":"OtherDevice","sysplatform":"darwin"}],' +
//           '"stats":{"backupsize":"278.56 MB",' +
//           '"backupsize_for_robots":"278560719",' +
//           '"billing_url":"https://spideroak.com/user/validate?' +
//           'hmac=hdwiuey984orpuwhef9uwefiuphwdfougsdf&avatar=573057' +
//           '&time=1366867850","devices":2,"firstname":"Test",' +
//           '"lastname":"User","size":100,"size_for_robots":100000000000}}'
//         ]
//       );
//       this.devicesCollection = new spiderOakApp.DevicesCollection();
//       this.devicesCollection.url = "https://spideroak.com/storage/" +
//                                     this.b32username + "/";
//       this.view = new spiderOakApp.DevicesListView({
//         collection: this.devicesCollection,
//         el: $("<ul id='devices' class='edgetoedge'></ul>")
//       }).render();
//       sinon.spy(this.devicesCollection,'set');
//       this.server.respond();
//     });
//     it('should create a list element', function() {
//       this.view.el.nodeName.should.equal("UL");
//     });
//     describe('Methods', function() {
//       it('should call collection set', function() {
//         this.devicesCollection.set.should.have.been.called;
//       });
//     });
//     describe('List items', function() {
//       it('should append a list item for each model', function() {
//         this.view.$("li").length
//           .should.equal(this.view.collection.models.length);
//       });
//       it('should display the correct icon for the model', function() {
//         this.view.$("li a i").first().hasClass("icon-finder").should.be.ok;
//       });
//       it('should display the name of the model', function() {
//         // well... it might have a leading space... trim it first
//         var liText = this.view.$("li").first().text().replace(/^\s/,"");
//         var modelName = this.view.collection.at(0).get("name");
//         liText.should.equal(modelName);
//       });
//     });
//   });
// });
