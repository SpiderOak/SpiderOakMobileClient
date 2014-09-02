/**
 * FileDownloadHelper.js
 */
(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  var FileDownloadHelper = window.FileDownloadHelper = function() {
    // ...
  };

  var createDir =
    function createDir(rootDirEntry, folders, successCallback, errorCallback) {
      // Throw out './' or '/' and move on to prevent something '/foo/.//bar'.
      if (folders[0] === '.' || !folders[0]) {
        folders = folders.slice(1);
        if (!folders[0]) {
          successCallback(rootDirEntry);
          return;
        }
      }
      rootDirEntry.getDirectory(
        folders[0],
        {create: true, exclusive: false},
        function gotDir(dirEntry) {
          // Recursively add the new subfolder (if still have more to create).
          if (folders.length) {
            createDir(dirEntry, folders.slice(1), successCallback);
          }
          else {
            successCallback(dirEntry);
          }
        },
        errorCallback
      );
    };

  FileDownloadHelper.prototype.createPath =
    function(path, successCallback, errorCallback, fsType) {
      fsType = fsType || window.LocalFileSystem.TEMPORARY;
      window.requestFileSystem(
        fsType,
        0,
        function gotFS(fileSystem) {
          var folders = path.split('/');
          createDir(fileSystem.root, folders, successCallback, errorCallback);
        },
        errorCallback
      );
    };

  FileDownloadHelper.prototype.downloadFile =
    function(options, successCallback, errorCallback) {
      var _this = this,
          path;

      options = options || {};
      if (!options.from || !options.to) {
        errorCallback("Missing arguments");
      }
      path = this.pathForFS(options.to);

      options.fsType = options.fsType || window.LocalFileSystem.TEMPORARY;

      _this.createPath(
        path,
        function pathCreateSuccess(dirEntry) {
          dirEntry.getFile(
            _this.nameForFS(options.fileName),
            {create: true, exclusive: false},
            function gotFile(fileEntry) {
              var fileTransfer = new window.FileTransfer();
              fileTransfer.onprogress = options.onprogress || function(){};
              $(document).one("backbutton", function(event) {
                fileTransfer.abort();
                errorCallback("File transfer aborted");
              });
              var cacheBuster = "cb=" + Date.now();
              if (!/\?/.test(options.from)) {
                cacheBuster = "?" + cacheBuster;
              }
              fileTransfer.download(
                options.from + cacheBuster,
                fileEntry.toURL(),
                successCallback,
                errorCallback,
                false,
                {
                  headers: options.headers
                }
              );
            },
            errorCallback
          );
        },
        errorCallback,
        options.fsType
      );
    };

  FileDownloadHelper.prototype.openInternally =
    function(path) {
      var options1 = {
        src: path,
        top: 64,
        left: 0,
        bottom: 0,
        scalesPageToFit: true,
        backgroundColor: "#FFF"
      };

      var slideInFromRight = { animation: {
        type: "slideInFromRight",
        duration: 100
      }};

      var slideOutToRight = { animation: {
        type: "slideOutToRight",
        duration: 100
      }};

      var fail = function() { console.log("fail"); };

      window.wizViewManager.create("view1", options1, function() {
        window.wizViewManager.show("view1", slideInFromRight, function(arg) {
          $(".back-btn").one("tap", function(){
            window.wizViewManager.hide("view1", slideOutToRight, function(){
              // ...
            }, function() { console.log("fail hide"); });
          });
        }, function() { console.log("fail show"); });
      }, function() { console.log("fail create"); });
    };

  FileDownloadHelper.prototype.fileExists =
    function(options, successCallback, errorCallback) {
      options.fsType = options.fsType || window.LocalFileSystem.TEMPORARY;
      return true;
    };

  FileDownloadHelper.prototype.deleteFile =
    function(options, successCallback, errorCallback) {
      options.fsType = options.fsType || window.LocalFileSystem.TEMPORARY;
      options.path = this.pathForFS(options.path);
      window.requestFileSystem(
        options.fsType,
        0,
        function gotFS(fileSystem) {
          fileSystem.root.getFile(
            options.path,
            {},
            function gotFile(fileEntry) {
              fileEntry.remove(
                successCallback,
                errorCallback
              );
            },
            errorCallback
          );
        },
        errorCallback
      );
    };

  /** Transform file names to escape the filesystem-incompible character.
   *
   * See fsSensitiveCharsRegExp for characters which trigger
   * transformation.  We have to transform filenames that include the '%'
   * percent character, as well as ones containing ':', in order to
   * preclude collisions between filenames that already contain characters
   * that result from URI encoding, and filenames transformed to include
   * URI-encoding characters.
   */
  var fsSensitiveCharsRegExp = /[:%]/;
  FileDownloadHelper.prototype.nameForFS = function(name) {
    if (name.match(fsSensitiveCharsRegExp)) {
      return encodeURIComponent(name);
    } else {
      return name;
    }
  };

  /** Filter bad fs chars from path, while preserving protocol portion. */
  FileDownloadHelper.prototype.pathForFS = function(path) {
    if (! path) {
      return path;
    } else if (path.match(/^[^/]+:/)) {
      var splat = path.split(":"),
          proto = splat[0] + ":",
          rest = this.fileNameToFSName(splat[1]);
      return proto + rest;
    } else {
      return this.nameForFS(path);
    }
  };


})(window);
