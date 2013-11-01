/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>' + '\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage : "" %>' + '\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' + '\n' +
        ' * License: <%= _.pluck(pkg.licenses, "type").join(", ") %> (<%= _.pluck(pkg.licenses, "url").join(", ") %>)' + '\n' +
        ' * GENERATED FILE. DO NOT EDIT.' + '\n' +
        ' */\n\n'
    },
    shell: {
      debug_ios: {
        command: 'cordova emulate ios',
        options: {
          failOnError: true,
          stdout: true
        }
      },
      debug_android: {
        command: 'cordova -d run android',
        options: {
          failOnError: true,
          stdout: true
        }
      },
      // Some different reporters...
      mochaspec: {
        command:
          './node_modules/.bin/mocha-phantomjs www/tests/index.html',
        options: {
          failOnError: true,
          stdout: true
        }
      },
      mochamin: {
        command:
          './node_modules/.bin/mocha-phantomjs -R min www/tests/index.html',
        options: {
          failOnError: true,
          stdout: true
        }
      },
      mochadot: {
        command:
          './node_modules/.bin/mocha-phantomjs -R dot www/tests/index.html',
        options: {
          failOnError: true,
          stdout: true
        }
      },
      mochatap: {
        command:
          './node_modules/.bin/mocha-phantomjs -R tap www/tests/index.html',
        options: {
          failOnError: true,
          stdout: true
        }
      }
    },
    concat: {
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          'src/helpers/FileHelper.js',
          'src/helpers/FileDownloadHelper.js',
          'src/helpers/Migrator.js',
          'src/helpers/multilingualchars.js',
          'src/helpers/basicauth.js',
          'src/helpers/bindmine.js',
          'src/helpers/customStrings.js',
          'src/effects/FastSlideEffect.js',
          'src/models/AccountModel.js',
          'src/models/StorageBarModel.js',
          'src/models/PasswordProtectedModelBase.js',
          'src/models/FileModel.js',
          'src/models/FileVersionModel.js',
          'src/models/FolderModel.js',
          'src/models/DeviceModel.js',
          'src/models/HiveModel.js',
          'src/models/FavoriteModel.js',
          'src/models/RecentModel.js',
          'src/models/ShareRoomModels.js',
          'src/models/SettingsModels.js',
          'src/models/SpiderOakFolderModel.js',
          'src/collections/PasswordProtectedCollectionBase.js',
          'src/collections/FoldersCollection.js',
          'src/collections/FilesCollection.js',
          'src/collections/FileItemVersionsCollection.js',
          'src/collections/DevicesCollection.js',
          'src/collections/FavoritesCollection.js',
          'src/collections/RecentsCollection.js',
          'src/collections/ShareRoomsCollections.js',
          'src/views/AboutView.js',
          'src/collections/SettingsCollections.js',
          'src/views/FilesView.js',
          'src/views/FilePreviewView.js',
          'src/views/HiveView.js',
          'src/views/DevicesView.js',
          'src/views/ShareRoomsViews.js',
          'src/views/StorageBarView.js',
          'src/views/FoldersView.js',
          'src/views/RecentsView.js',
          'src/views/FavoritesView.js',
          'src/views/LoginView.js',
          'src/views/MainView.js',
          'src/views/ToolbarView.js',
          'src/views/StorageView.js',
          'src/views/MenuSheetView.js',
          'src/views/SettingsView.js',
          'src/views/DialogView.js',
          'src/app.js'
        ],
        dest: 'www/js/<%= pkg.name %>.js'
      },
      tests: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          'tests/*.js',
          'tests/**/*.js'
        ],
        dest: 'www/tests/<%= pkg.name %>-tests.js'
      },
      zepto: {
        src: [
          'components/zepto/src/zepto.js',
          'components/zepto/src/ajax.js',
          'components/zepto/src/assets.js',
          'components/zepto/src/data.js',
          'components/zepto/src/detect.js',
          'components/zepto/src/event.js',
          'components/zepto/src/form.js',
          'components/zepto/src/fx.js',
          'components/zepto/src/fx_methods.js',
          'components/zepto/src/gesture.js',
          'components/zepto/src/polyfill.js',
          'components/zepto/src/selector.js',
          'components/zepto/src/stack.js',
          'components/zepto/src/touch.js'
        ],
        dest: 'www/components/zepto/zepto.js'
      },
      underscore: {
        src: [
          'components/underscore/underscore.js'
        ],
        dest: 'www/components/underscore/underscore.js'
      },
      backbone: {
        src: [
          'components/backbone/backbone.js'
        ],
        dest: 'www/components/backbone/backbone.js'
      },
      backstack: {
        src: [
          'components/backstack/backstack.js'
        ],
        dest: 'www/components/backstack/backstack.js'
      },
      nibbler: {
        src: [
          'components/Nibbler.min/index.js'
        ],
        dest: 'www/components/Nibbler.min/index.js'
      },
      iscroll: {
        src: [
          'components/iscroll/src/iscroll-lite.js'
        ],
        dest: 'www/components/iscroll/src/iscroll-lite.js'
      },
      modernizr: {
        src: [
          'components/modernizr/modernizr.js'
        ],
        dest: 'www/components/modernizr/modernizr.js'
      },
      modernizrScrollDetect: {
        src: [
          'components/modernizr/feature-detects/css-overflow-scrolling.js'
        ],
        dest: 'www/components/modernizr/feature-detects/css-overflow-scrolling.js'
      },
      store: {
        src: [
          'components/store.js/store.min.js'
        ],
        dest: 'www/components/store.js/store.min.js'
      },
      moment: {
        src: [
          'components/moment/moment.js'
        ],
        dest: 'www/components/moment/moment.js'
      },
      defaultcss: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          'www/css/themes/android.css'
        ],
        dest: 'www/css/platform.css'
      },
      androidcss: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          'www/css/themes/android.css'
        ],
        dest: 'merges/android/css/platform.css'
      },
      ioscss: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          'www/css/themes/ios.css'
        ],
        dest: 'merges/ios/css/platform.css'
      }
    },
    watch: {
      files: [
        '<%= jshint.files %>',
        'www/spec/**/*.js',
        'tests/**/*',
        'www/css/**/*.scss',
        'tpl/**/*.html'
      ],
      tasks: ['jshint', 'dot', 'concat', 'shell:mochadot']
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        "eqeqeq": false,
        "laxbreak": true,
        "undef": true,
        "newcap": true,
        "noarg": true,
        "strict": false,
        "trailing": true,
        "onecase": true,
        "boss": true,
        "eqnull": true,
        "onevar": false,
        "evil": true,
        "regexdash": true,
        "browser": true,
        "wsh": true,
        "sub": true,
        "globals": {
          "cordova": true
        }
      }
    },
    uglify: {
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= concat.dist.dest %>'
        ],
        dest: 'www/js/<%= pkg.name %>.min.js'
      },
      zepto: {
        src: [
          'www/components/zepto/zepto.js'
        ],
        dest: 'www/components/zepto/zepto.min.js'
      }
    },
    dot: {
      dist: {
        options: {
          variable  : 'tmpl',
          requirejs : false
        },
        src  : ['tpl/**/*.html', 'custom/brand/tpl/**/*.html'],
        dest : 'www/js/SpiderOak-templates.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-dot-compiler');

  // Default task.
  grunt.registerTask('default', ['jshint', 'dot', 'concat', 'shell:mochadot']);
  // Custom tasks
  grunt.registerTask('test', ['jshint', 'dot', 'concat', 'shell:mochaspec']);
  grunt.registerTask('min', ['uglify']); // polyfil

  // Build tasks
  grunt.registerTask('debug','Create a debug build', function(platform, test) {
    test = test || 'dot';
    grunt.task.run('jshint', 'dot', 'concat', 'shell:mocha'+test);
    grunt.task.run('shell:debug_' + platform);
  });
  grunt.registerTask('beta','Create a beta build', function(platform) {
    grunt.log.writeln('Placeholder for beta build task');
  });
  grunt.registerTask('production','Create a production build', function(platform) {
    grunt.log.writeln('Placeholder for production build task');
  });

  // deprecated
  grunt.registerTask('debug_ios', ['jshint', 'dot', 'concat', 'shell:mochadot', 'shell:debug_ios']);
  grunt.registerTask('debug_android', ['jshint', 'dot', 'concat', 'shell:mochadot', 'shell:debug_android']);

};
