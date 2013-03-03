(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  window.tpl = {
   
    // Hash of preloaded templates for the app
    templates: {},
   
    // Recursively pre-load all the templates for the app.
    // @FIXME: Consider concating template files into one
    loadTemplates: function(templateLocation, names, callback) {

      var that = this;
   
      var loadTemplate = function(index) {
        var name = names[index];
        console.log('Loading template: ' + name);
        $.ajax({
          url: templateLocation + '/' + name + '.html',
          async: false,
          success: function(data) {
            that.templates[name] = data;
            index++;
            if (index < names.length) {
              loadTemplate(index);
            } else {
              callback();
            }
          },
          error: function(error) {
            console.warn(error);
          }
        });
        // $.get(templateLocation + '/' + name + '.html', function(data) {
        //   that.templates[name] = data;
        //   index++;
        //   if (index < names.length) {
        //     loadTemplate(index);
        //   } else {
        //     callback();
        //   }
        // });
      };
   
      loadTemplate(0);
    },
   
    // Get template by name from hash of preloaded templates
    get: function(name) {
      return this.templates[name];
    }
   
  };

})(window);