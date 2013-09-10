/*jshint expr:true */
describe('SettingsCollection', function() {
  beforeEach(function() {
    helper.suspendLocalStorage();
    this.settings = new spiderOakApp.SettingsCollection();
    this.settingToSet = "aSetting";
    this.valueToGet = "aSettingValue";
    this.valueToDefault = "aSettingDefaultValue";
    this.settingTo_Not_Set = "notASetting";
  });
  afterEach(function() {
    helper.resumeLocalStorage();
    delete this.settings;
    delete this.settingToSet;
    delete this.valueToGet;
    delete this.valueToDefault;
    delete this.settingTo_Not_Set;
  });
  describe('Basic settings and getting', function() {
    it('should get undefined for .get() of an unassigned setting',
       function() {
         this.getValueSpy = sinon.spy(this.settings, 'get');
         this.settings.get(this.settingTo_Not_Set);
         delete this.getValueSpy;
    });
    it('should fail with an exception to getValue() of an unassigned setting',
       function() {
         this.getValueSpy = sinon.spy(this.settings, 'getValue');
         try {
           this.settings.getValue(this.settingTo_Not_Set);
         }
         catch (e) {
         };
         this.getValueSpy.threw("ReferenceError");
         delete this.getValueSpy;
    });
    it('should get a setting\'s assigned value from getValue()',
       function() {
         this.getValueSpy = sinon.spy(this.settings, 'getValue');
         this.settings.setOrCreate(this.settingToSet, this.valueToGet, 0);
         try {
           this.gotValue = this.settings.getValue(this.settingToSet);
         }
         catch (e) {
         };
         this.getValueSpy.should.not.have.thrown("ReferenceError");
         this.gotValue.should.equal(this.valueToGet);
         delete this.getValueSpy;
    });
    it('should get default value for getOrDefault() of an unassigned setting',
       function() {
         this.getValueSpy = sinon.spy(this.settings, 'getOrDefault');
         try {
           this.gotValue = this.settings.getOrDefault(this.settingToSet,
                                                      this.valueToDefault);
         }
         catch (e) {
         };
         this.getValueSpy.should.not.have.thrown();
         this.gotValue.should.equal(this.valueToDefault);
         delete this.getValueSpy;
    });
    it('should get udefined value for getOrDefault() of an unassigned setting'+
       ' and no default value in query',
       function() {
         this.getValueSpy = sinon.spy(this.settings, 'getOrDefault');
         try {
           this.gotValue = this.settings.getOrDefault(this.settingToSet);
         }
         catch (e) {
         };
         this.getValueSpy.should.not.have.thrown();
         chai.expect(this.gotValue).to.equal(undefined);
         delete this.getValueSpy;
    });
    it('should get a setting\'s assigned value from getOrDefault()',
       function() {
         this.settingToSet = "aSetting";
         this.valueToGet = "aSettingValue";
         this.getValueSpy = sinon.spy(this.settings, 'getOrDefault');
         this.settings.setOrCreate(this.settingToSet, this.valueToGet, 0);
         try {
           this.gotValue = this.settings.getOrDefault(this.settingToSet,
                                                      this.valueToDefault);
         }
         catch (e) {
         };
         this.getValueSpy.should.not.have.thrown("ReferenceError");
         this.gotValue.should.equal(this.valueToGet);
    });
  });
});
