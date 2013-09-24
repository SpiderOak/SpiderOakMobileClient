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
      options = options || {};
      if (!options.from || !options.to) {
        errorCallback("Missing arguments");
      }
      options.fsType = options.fsType || window.LocalFileSystem.TEMPORARY;
      this.createPath(
        options.to,
        function pathCreateSuccess(dirEntry) {
          dirEntry.getFile(
            options.fileName,
            {create: true, exclusive: false},
            function gotFile(fileEntry) {
              var fileTransfer = new window.FileTransfer();
              fileTransfer.onprogress = options.onprogress || function(){};
              $(document).one("backbutton", function(event) {
                fileTransfer.abort();
                errorCallback("File transfer aborted");
              });
              fileTransfer.download(
                options.from,
                encodeURI(fileEntry.fullPath),
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

  FileDownloadHelper.prototype.fileExists =
    function(options, successCallback, errorCallback) {
      options.fsType = options.fsType || window.LocalFileSystem.TEMPORARY;
      return true;
    };

  FileDownloadHelper.prototype.deleteFile =
    function(options, successCallback, errorCallback) {
      options.fsType = options.fsType || window.LocalFileSystem.TEMPORARY;
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

})(window);
