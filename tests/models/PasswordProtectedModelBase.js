/*jshint expr:true */
describe('PasswordProtectedModelBase', function() {
  describe('composedUrl', function() {
    beforeEach(function() {
      this.model = new spiderOakApp.PasswordProtectedModelBase({
        url: "filename.pdf",
        urlBase: "base/"
      });
    });
    it('should have a URL', function() {
      this.model.get("url").should.be.a("string");
      this.model.get("url").should.equal("filename.pdf");
    });
    it('should have a urlBase', function() {
      this.model.get("urlBase").should.be.a("string");
      this.model.get("urlBase").should.equal("base/");
    });
    it('composedUrl should combine url and urlBase' +
       ', with auth_required_format...', function() {
         this.model.composedUrl().should.be.a("string");
         this.model.composedUrl().should.equal(
           "base/filename.pdf?auth_required_format=json"
         );
       });
    it('composedUrl auth_required_format should be inhibited properly',
       function() {
         this.model.composedUrl().should.be.a("string");
         this.model.composedUrl(true).should.equal("base/filename.pdf");
       });
    it('composedUrl auth_required_format should have just one "?", one "&"',
       function() {
         this.model.set("url", "filename.pdf?arbitrary=stuff");
         this.model.composedUrl().should.be.a("string");
         // Order-insensitive tests, since query string order is not defined.
         this.model.composedUrl().should.match(/arbitrary=stuff/);
         this.model.composedUrl().should.match(/auth_required_format=json/);
         this.model.composedUrl().should.match(/\?/);
         this.model.composedUrl().should.match(/&/);
         this.model.composedUrl().should.not.match(/\?.*\?/);
         this.model.composedUrl().should.not.match(/&.*&/);
       });
  });
});
