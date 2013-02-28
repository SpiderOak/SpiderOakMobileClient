(function (spiderOakApp, fileHelper, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  var FILETYPE_WORDDOC = {
      type: "application/word",
      description: "MS Word",
      openInternally: false,
      icon: "file-word"
    },
    FILETYPE_EXCEL = {
      type: "application/excel",
      description: "MS Excel",
      openInternally: false,
      icon: "file-excel"
    },
    FILETYPE_POWERPOINT = {
      type: "application/powerpoint",
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
      type: "application/archive",
      description: "Archive",
      openInternally: false,
      icon: "file-zip"
    },
    FILETYPE_JPEG = {
      type: "image/jpeg",
      description: "JPEG Image",
      openInternally: true,
      icon: "image"
    },
    FILETYPE_GIF = {
      type: "image/gif",
      description: "GIF Image",
      openInternally: false,
      icon: "iamge"
    },
    FILETYPE_PNG = {
      type: "image/png",
      description: "PNG Image",
      openInternally: true,
      icon: "image"
    },
    FILETYPE_TEXT = {
      type: "text/plain",
      description: "Plain Text",
      openInternally: true,
      icon: "file"
    },
    FILETYPE_HTML = {
      type: "text/html",
      description: "HTML",
      openInternally: true,
      icon: "file-xml"
    },
    FILETYPE_XML = {
      type: "text/xml",
      description: "XML",
      openInternally: true,
      icon: "file-xml"
    },
    FILETYPE_CSS = {
      type: "text/css",
      description: "CSS",
      openInternally: true,
      icon: "file-css"
    },
    FILETYPE_JS = {
      type: "text/javascript",
      description: "JavaScript",
      openInternally: true,
      icon: "file-css"
    },
    FILETYPE_PAGES = {
      type: "application/pages",
      description: "Apple Pages",
      openInternally: false,
      icon: "file-powerpoint"
    },
    FILETYPE_NUMBERS = {
      type: "application/numbers",
      description: "Apple Numbers",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_KEYNOTE = {
      type: "application/keynote",
      description: "Apple Keynote",
      openInternally: false,
      icon: "file-powerpoint"
    },
    FILETYPE_RTF = {
      type: "application/rtf",
      description: "Rich Text",
      openInternally: false,
      icon: "file-powerpoint"
    },
    FILETYPE_CSV = {
      type: "text/csv",
      description: "CSV",
      openInternally: true,
      icon: "file"
    },
    FILETYPE_VCARD = {
      type: "application_vcard",
      description: "Vcard",
      openInternally: false,
      icon: "file"
    },
    FILETYPE_UNKNOWN = {
      type: "unknown",
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
    else if (fileExtension === "vcf") {
        return FILETYPE_VCARD;
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
    else if (fileExtension === "zip" || fileExtension === "tar" ||
          fileExtension === "gz" ||  fileExtension === "rar") {
       return FILETYPE_ARCHIVE;
    }
    return FILETYPE_UNKNOWN;
  };

})(window.spiderOakApp = window.spiderOakApp || {},
      window.fileHelper = window.fileHelper || {}, window);
