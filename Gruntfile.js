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
        command: 'cordova build ios && ./platforms/ios/cordova/run',
        options: {
          failOnError: true,
          stdout: true
        }
      },
      debug_android: {
        command: 'cordova build android && ./platforms/android/cordova/run',
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
          'src/helpers/Templates.js',
          'src/helpers/FileDownloadHelper.js',
          'src/helpers/Migrator.js',
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
          'www/components/zepto/src/zepto.js',
          'www/components/zepto/src/ajax.js',
          'www/components/zepto/src/assets.js',
          'www/components/zepto/src/data.js',
          'www/components/zepto/src/detect.js',
          'www/components/zepto/src/event.js',
          'www/components/zepto/src/form.js',
          'www/components/zepto/src/fx.js',
          'www/components/zepto/src/fx_methods.js',
          'www/components/zepto/src/gesture.js',
          'www/components/zepto/src/polyfill.js',
          'www/components/zepto/src/selector.js',
          'www/components/zepto/src/stack.js',
          'www/components/zepto/src/touch.js'
        ],
        dest: 'www/components/zepto/zepto.js'
      },
      defaultcss: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          'www/css/themes/ios.css'
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
        'www/css/**/*.scss'
      ],
      tasks: ['jshint', 'concat', 'shell:mochadot']
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'shell:mochadot']);
  // Custom tasks
  grunt.registerTask('test', ['jshint', 'concat', 'shell:mochaspec']);
  grunt.registerTask('min', ['uglify']); // polyfil
  grunt.registerTask('debug_ios', ['jshint', 'concat', 'shell:mochadot', 'shell:debug_ios']);
  grunt.registerTask('debug_android', ['jshint', 'concat', 'shell:mochadot', 'shell:debug_android']);

};
