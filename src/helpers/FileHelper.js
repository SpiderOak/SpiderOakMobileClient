(function (spiderOakApp, fileHelper, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  var FILETYPE_WORDDOC = {
      description: "MS Word",
      openInternally: false,
      icon: "file-word"
    },
    FILETYPE_EXCEL = {
      description: "MS Excel",
      openInternally: false,
      icon: "file-excel"
    },
    FILETYPE_POWERPOINT = {
      description: "MS PowerPoint",
      openInternally: false,
      icon: "file-powerpoint"
    },
    FILETYPE_PDF = {
      type: "application/pdf",
      description: "Adobe PDF",
      openInternally: false,
      icon: "file-pdf"
    },
    FILETYPE_ARCHIVE = {
      description: "Archive",
      openInternally: false,
      icon: "file-zip"
    },
    FILETYPE_JPEG = {
      type: "image/jpeg",
      description: "JPEG Image",
      openInternally: false,
      icon: "image"
    },
    FILETYPE_GIF = {
      type: "image/gif",
      description: "GIF Image",
      openInternally: false,
      icon: "image"
    },
    FILETYPE_PNG = {
      type: "image/png",
      description: "PNG Image",
      openInternally: false,
      icon: "image"
    },
    FILETYPE_PSD = {
      description: "PSD Image",
      openInternally: false,
      icon: "image"
    },
    FILETYPE_MARKDOWN = {
      type: "text/plain",
      description: "Markdown",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_TEXT = {
      type: "text/plain",
      description: "Plain Text",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_HTML = {
      type: "text/html",
      description: "HTML",
      openInternally: false,
      icon: "file-xml"
    },
    FILETYPE_XML = {
      type: "text/xml",
      description: "XML",
      openInternally: false,
      icon: "file-xml"
    },
    FILETYPE_CSS = {
      description: "CSS",
      openInternally: false,
      icon: "file-css"
    },
    FILETYPE_JS = {
      description: "JavaScript",
      openInternally: false,
      icon: "file-css"
    },
    FILETYPE_PHP = {
      type: "text/plain",
      description: "PHP",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_PAGES = {
      description: "Apple Pages",
      openInternally: false,
      icon: "file-powerpoint"
    },
    FILETYPE_NUMBERS = {
      description: "Apple Numbers",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_KEYNOTE = {
      description: "Apple Keynote",
      openInternally: false,
      icon: "file-powerpoint"
    },
    FILETYPE_RTF = {
      description: "Rich Text",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_CSV = {
      description: "CSV",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_VCARD = {
      description: "Vcard",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_APK = {
      description: "Android APK",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_EBOOK = {
      description: "Ebook",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_HEADER = {
      type: "text/plain",
      description: "Header",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_SOURCE = {
      type: "text/plain",
      description: "Source",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_JAVA = {
      type: "text/plain",
      description: "Java",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_ODS = {
      type: "application/vnd.oasis.opendocument.spreadsheet",
      description: "OpenOffice file",
      openInternally: false,
      icon: "file-openoffice"
    },
    FILETYPE_ODT = {
      type: "application/vnd.oasis.opendocument.text",
      description: "OpenOffice file",
      openInternally: false,
      icon: "file-openoffice"
    },
    FILETYPE_SOUND = {
      description: "Sound",
      openInternally: false,
      icon: "music"
    },
    FILETYPE_VIDEO = {
      description: "Video",
      openInternally: false,
      icon: "film"
    },
    FILETYPE_UNKNOWN = {
      description: "Unknown",
      openInternally: false,
      icon: "file"
    };


  fileHelper.readableFileSize = function(size) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = 0;
    while(size >= 1024) {
        size /= 1024;
        ++i;
    }
    return size.toFixed(1) + ' ' + units[i];
  };

  fileHelper.fileTypeFromExtension = function(fileName) {
    var fileExtension = fileName.split('.').pop().toLowerCase();

    if (fileExtension === "doc" || fileExtension === "docx") {
      return FILETYPE_WORDDOC;
    }
    if (fileExtension === "xls" || fileExtension === "xlsx"||
       fileExtension === "xlsb" || fileExtension === "xlsm") {
        return FILETYPE_EXCEL;
    }
    if (fileExtension === "ppt" || fileExtension === "pptx") {
        return FILETYPE_POWERPOINT;
    }
    else if (fileExtension === "gif") {
        return FILETYPE_GIF;
    }
    else if (fileExtension === "jpg"|| fileExtension === "jpeg") {
        return FILETYPE_JPEG;
    }
    else if (fileExtension === "png") {
        return FILETYPE_PNG;
    }
    else if (fileExtension === "txt") {
        return FILETYPE_TEXT;
    }
    else if (fileExtension === "md" ||
            fileExtension === "mdown") {
        return FILETYPE_MARKDOWN;
    }
    else if (fileExtension === "pdf") {
        return FILETYPE_PDF;
    }
    else if (fileExtension === "pages") {
        return FILETYPE_PAGES;
    }
    else if (fileExtension === "numbers") {
        return FILETYPE_NUMBERS;
    }
    else if (fileExtension === "key") {
        return FILETYPE_KEYNOTE;
    }
    else if (fileExtension === "rtf") {
        return FILETYPE_RTF;
    }
    else if (fileExtension === "csv") {
        return FILETYPE_CSV;
    }
    else if (fileExtension === "odt") {
        return FILETYPE_ODT;
    }
    else if (fileExtension === "ods") {
        return FILETYPE_ODS;
    }
    else if (fileExtension === "vcf") {
        return FILETYPE_VCARD;
    }
    else if (fileExtension === "apk") {
        return FILETYPE_APK;
    }
    else if (fileExtension === "h") {
        return FILETYPE_HEADER;
    }
    else if (fileExtension === "c" ||
              fileExtension === "cc" ||
              fileExtension === "cpp" ||
              fileExtension === "m") {
        return FILETYPE_SOURCE;
    }
    else if (fileExtension === "php") {
        return FILETYPE_PHP;
    }
    else if (fileExtension === "java") {
        return FILETYPE_JAVA;
    }
    else if (fileExtension === "mobi" ||
            fileExtension === "epub") {
        return FILETYPE_EBOOK;
    }
    else if (fileExtension === "html" || fileExtension === "htm") {
       return FILETYPE_HTML;
    }
    else if (fileExtension === "xml" || fileExtension === "plist") {
       return FILETYPE_XML;
    }
    else if (fileExtension === "css") {
       return FILETYPE_CSS;
    }
    else if (fileExtension === "js") {
       return FILETYPE_JS;
    }
    else if (fileExtension === "m4a" ||
              fileExtension === "mp3" ||
              fileExtension === "wav" ||
              fileExtension === "ogm" ||
              fileExtension === "au") {
       return FILETYPE_SOUND;
    }
    else if (fileExtension === "mp4" ||
              fileExtension === "mpg" ||
              fileExtension === "avi" ||
              fileExtension === "qt" ||
              fileExtension === "mkv" ||
              fileExtension === "mov") {
       return FILETYPE_VIDEO;
    }
    else if (fileExtension === "zip" || fileExtension === "tar" ||
          fileExtension === "gz" ||  fileExtension === "rar") {
       return FILETYPE_ARCHIVE;
    }
    return FILETYPE_UNKNOWN;
  };

})(window.spiderOakApp = window.spiderOakApp || {},
      window.fileHelper = window.fileHelper || {}, window);
