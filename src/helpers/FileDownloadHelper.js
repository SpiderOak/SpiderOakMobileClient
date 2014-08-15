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
              fileTransfer.download(
                options.from,
                // encodeURI(fileEntry.fullPath),
                //fileEntry.fullPath,
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

  /** Transform file names to uniquely escape offending ":" colon characters.
   *
   * We also change names that include the filler char, ",", to prevent any
   * possibility of collisions between transformed names.
   *
   * We translate sequences of ":"s to a particular number of ","s, each
   * resulting sequence bracketed by "_" underscores.  We also transform
   * sequences of included commas so they're guaranteed to be of a
   * different number than any translated sequences of ":" colons.
   *
   * We use odd and even numbers for distinct partitioning of the map spaces:
   *
   *   - Sequences of "," chars are converted to "_" bracketed sequences of
   *     ","s with an odd number of characters: 1=>1, 2=>3, 3=>5, 4=>7...
   *     Ie, n commas yields the ordinally nth odd number of commas, aka
   *     (2 x n) - 1.
   *   - Sequences of ":" chars are converted to an "_" bracketed sequence
   *     with *double* the number of ","s as there were ":"s.  That is, n
   *     colons yields the nth even number of commas.
   *   - The "_" bracketing is necessary to distinguish the mappings for
   *     original names that contain, eg, ":," versus ",:".
   *
   * (I believe this scheme can be easily generalized to partitioning for a
   * list of any N chars. It's likely, though, that incremental extension
   * would invalidate existing mappings, requiring favorites
   * migration. If/when we discover the need to accommodate more/another
   * char, it may be worth pondering about possibility of an easy,
   * churn-free, incrementally extensible scheme.)
   */
  var filler = ",",
      subjectCharsRegExp = new RegExp("[:" + filler + "]"),
      placeHolder = "\f",
      placeHolderRegExp = new RegExp(placeHolder, "g");
  FileDownloadHelper.prototype.nameForFS = function(name) {

    return name.replace(/:/g, "%3A");

    function replacer(subject, theChar, offset) {
      var doLengthsObj, doLengthsList,
          charsStr, charsRegExp, substitute,
          matchRegExp = new RegExp(theChar + "+", "g");
      // Use object to get unique lengths of comma subsequences:
      doLengthsObj = {};
      _.map(subject.match(matchRegExp), function (matched) {
        doLengthsObj[matched.length] = true;
      });
      // Derive list of unique lengths of char subsequences, ordered from
      // largest to smallest so we always do complete contiguous sequences:
      doLengthsList = _.map(Object.keys(doLengthsObj),
                         function (s) {
                           return parseInt(s, 10); }).sort().reverse();
      _.map(doLengthsList, function (charsLength) {
        charsStr = new Array(charsLength + 1).join(theChar);
        charsRegExp = new RegExp(charsStr, "g");
        substitute = ("_" +
                      // Use place-holder so we don't replace the replacements:
                      new Array((2 * charsLength) + offset).join(placeHolder) +
                      "_");
        subject = subject.replace(charsRegExp, substitute);
      });
      // Return with the intended substitution instead of the placeholder:
      return subject.replace(placeHolderRegExp, filler);
    }

    if (name.match(subjectCharsRegExp)) {
      name = replacer(name, filler, 0);
      return replacer(name, ":", 1);
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
