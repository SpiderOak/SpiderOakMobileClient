(function (spiderOakApp, fileHelper, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  var FILETYPE_WORDDOC = {
      description: "MS Word",
      openInternally: false,
      icon: "doc"
    },
    FILETYPE_EXCEL = {
      description: "MS Excel",
      openInternally: false,
      icon: "xls"
    },
    FILETYPE_POWERPOINT = {
      description: "MS PowerPoint",
      openInternally: false,
      icon: "ppt"
    },
    FILETYPE_PDF = {
      type: "application/pdf",
      description: "Adobe PDF",
      openInternally: false,
      icon: "pdf"
    },
    FILETYPE_ZIP = {
      description: "Zip Archive",
      openInternally: false,
      icon: "zip"
    },
    FILETYPE_ARCHIVE = {
      description: "Archive",
      openInternally: false,
      icon: "generic"
    },
    FILETYPE_RAR = {
      description: "RAR Archive",
      openInternally: false,
      icon: "rar"
    },
    FILETYPE_JPEG = {
      type: "image/jpeg",
      description: "JPEG Image",
      openInternally: false,
      icon: "jpg"
    },
    FILETYPE_GIF = {
      type: "image/gif",
      description: "GIF Image",
      openInternally: false,
      icon: "gif"
    },
    FILETYPE_PNG = {
      type: "image/png",
      description: "PNG Image",
      openInternally: false,
      icon: "png"
    },
    FILETYPE_INDD = {
      description: "In Design",
      openInternally: false,
      icon: "indd"
    },
    FILETYPE_EPS = {
      description: "EPS",
      openInternally: false,
      icon: "eps"
    },
    FILETYPE_PSD = {
      description: "PSD Image",
      openInternally: false,
      icon: "psd"
    },
    FILETYPE_MARKDOWN = {
      type: "text/plain",
      description: "Markdown",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_TEXT = {
      type: "text/plain",
      description: "Plain Text",
      openInternally: false,
      icon: "txt"
    },
    FILETYPE_HTML = {
      type: "text/html",
      description: "HTML",
      openInternally: false,
      icon: "htm"
    },
    FILETYPE_XML = {
      type: "text/xml",
      description: "XML",
      openInternally: false,
      icon: "xml"
    },
    FILETYPE_CSS = {
      description: "CSS",
      openInternally: false,
      icon: "css"
    },
    FILETYPE_JS = {
      description: "JavaScript",
      openInternally: false,
      icon: "js"
    },
    FILETYPE_PHP = {
      type: "text/plain",
      description: "PHP",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_PAGES = {
      description: "Apple Pages",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_NUMBERS = {
      description: "Apple Numbers",
      openInternally: false,
      icon: "spreadsheet"
    },
    FILETYPE_KEYNOTE = {
      description: "Apple Keynote",
      openInternally: false,
      icon: "presentation"
    },
    FILETYPE_RTF = {
      description: "Rich Text",
      openInternally: false,
      icon: "rtf"
    },
    FILETYPE_CSV = {
      description: "CSV",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_VCARD = {
      description: "Vcard",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_APK = {
      description: "Android APK",
      openInternally: false,
      icon: "generic"
    },
    FILETYPE_HEADER = {
      type: "text/plain",
      description: "Header",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_SOURCE = {
      type: "text/plain",
      description: "Source",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_JAVA = {
      type: "text/plain",
      description: "Java",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_ODS = {
      type: "application/vnd.oasis.opendocument.spreadsheet",
      description: "OpenOffice file",
      openInternally: false,
      icon: "spreadsheet"
    },
    FILETYPE_ODT = {
      type: "application/vnd.oasis.opendocument.text",
      description: "OpenOffice file",
      openInternally: false,
      icon: "document"
    },
    FILETYPE_MP3 = {
      description: "MP3 File",
      openInternally: false,
      icon: "mp3"
    },
    FILETYPE_SOUND = {
      description: "Sound",
      openInternally: false,
      icon: "audio"
    },
    FILETYPE_MOV = {
      description: "Video",
      openInternally: false,
      icon: "mov"
    },
    FILETYPE_AVI = {
      description: "AVI File",
      openInternally: false,
      icon: "avi"
    },
    FILETYPE_VIDEO = {
      description: "Video",
      openInternally: false,
      icon: "video"
    },
    FILETYPE_UNKNOWN = {
      description: "Unknown",
      openInternally: false,
      icon: "generic"
    };


  fileHelper.readableFileSize = function (size) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = 0;
    while(size >= 1024) {
        size /= 1024;
        ++i;
    }
    return size.toFixed(1) + ' ' + units[i];
  };

  fileHelper.fileTypeFromExtension = function (fileName) {
    var got = fileHelper.fileTypeFromExtensionDrone(fileName);
    if (! got.translated) {
      got.description = window.qq(got.description) || got.description;
      got.translated = true;
    }
    return got;
  };
  fileHelper.fileTypeFromExtensionDrone = function (fileName) {
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
    else if (fileExtension === "indd") {
        return FILETYPE_INDD;
    }
    else if (fileExtension === "eps") {
        return FILETYPE_EPS;
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
    else if (fileExtension === "html" || fileExtension === "htm") {
       return FILETYPE_HTML;
    }
    else if (fileExtension === "xml") {
       return FILETYPE_XML;
    }
    else if (fileExtension === "css") {
       return FILETYPE_CSS;
    }
    else if (fileExtension === "js") {
       return FILETYPE_JS;
    }
    else if (fileExtension === "mp3") {
      return FILETYPE_MP3;
    }
    else if (fileExtension === "m4a" ||
              fileExtension === "wav" ||
              fileExtension === "aif" ||
              fileExtension === "ogm" ||
              fileExtension === "au") {
       return FILETYPE_SOUND;
    }
    else if (fileExtension === "mov") {
      return FILETYPE_MOV;
    }
    else if (fileExtension === "avi") {
      return FILETYPE_AVI;
    }
    else if (fileExtension === "mp4" ||
              fileExtension === "mpg" ||
              fileExtension === "qt" ||
              fileExtension === "mkv") {
       return FILETYPE_VIDEO;
    }
    else if (fileExtension === "zip") {
      return FILETYPE_ZIP;
    }
    else if (fileExtension === "rar") {
      return FILETYPE_RAR;
    }
    else if(fileExtension === "tar" ||
          fileExtension === "gz") {
       return FILETYPE_ARCHIVE;
    }
    return FILETYPE_UNKNOWN;
  };

})(window.spiderOakApp = window.spiderOakApp || {},
      window.fileHelper = window.fileHelper || {}, window);
