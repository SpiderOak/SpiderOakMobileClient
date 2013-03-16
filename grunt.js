/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' + "\n" +
        ' * License: <%= _.pluck(pkg.licenses, "type").join(", ") %> (<%= _.pluck(pkg.licenses, "url").join(", ") %>)' + "\n" +
        ' */'
    },
    shell: {
      _options: {
        failOnError: true,
        stdout: true
      },
      debug_ios: {
        command: 'cordova build ios && cordova emulate ios'
      },
      debug_android: {
        command: 'cordova build android && cordova emulate android'
      },
      // Some different reporters...
      mochaspec: {
        command:
          './node_modules/.bin/mocha-phantomjs www/tests/index.html'
      },
      mochamin: {
        command:
          './node_modules/.bin/mocha-phantomjs -R min www/tests/index.html'
      },
      mochadot: {
        command:
          './node_modules/.bin/mocha-phantomjs -R dot www/tests/index.html'
      },
      mochatap: {
        command:
          './node_modules/.bin/mocha-phantomjs -R tap www/tests/index.html'
      }
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js']
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          'src/helpers/FileHelper.js',
          'src/helpers/Templates.js',
          'src/helpers/FileDownloadHelper.js',
          'src/effects/FastSlideEffect.js',
          'src/models/AccountModel.js',
          'src/models/FileModel.js',
          'src/models/FolderModel.js',
          'src/models/DeviceModel.js',
          'src/models/FavoriteModel.js',
          'src/models/ShareRoomModels.js',
          'src/models/SpiderOakFolderModel.js',
          'src/collections/FoldersCollection.js',
          'src/collections/FilesCollection.js',
          'src/collections/DevicesCollection.js',
          'src/collections/FavoritesCollection.js',
          'src/collections/ShareRoomsCollections.js',
          'src/views/DevicesView.js',
          'src/views/ShareRoomsViews.js',
          'src/views/FoldersView.js',
          'src/views/FilesView.js',
          'src/views/FavoritesView.js',
          'src/views/LoginView.js',
          'src/views/MainView.js',
          'src/views/StorageView.js',
          'src/views/MenuSheetView.js',
          'src/views/DialogView.js',
          'src/app.js'
        ],
        dest: 'www/js/<%= pkg.name %>.js'
      },
      tests: {
        src: [
          '<banner:meta.banner>',
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
      }
    },
    min: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<config:concat.dist.dest>'
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
    // compass: {
    //   dev: {
    //     src: 'www/css/scss',
    //     dest: 'www/css/themes',
    //     outputstyle: 'expanded',
    //     linecomments: true,
    //     require: [
    //       'www/components/compass-recipes/lib/compass-recipes'
    //     ]
    //   },
    //   prod: {
    //     src: 'www/css/scss',
    //     dest: 'www/css/themes/min',
    //     outputstyle: 'compressed',
    //     linecomments: false,
    //     forcecompile: true,
    //     require: [
    //       'www/components/compass-recipes/lib/compass-recipes'
    //     ]
    //   }
    // },
    watch: {
      files: [
        '<config:lint.files>',
        'www/spec/**/*.js',
        'tests/**/*',
        'www/css/**/*.scss'
      ],
      tasks: 'lint concat shell:mochadot'
    },
    jshint: {
      options: {
      eqeqeq: false,
      laxbreak: true,
      undef: true,
      newcap: true,
      noarg: true,
      strict: false,
      trailing: true,
      onecase: true,
      boss: true,
      eqnull: true,
      onevar: false,
      evil: true,
      regexdash: true,
      browser: true,
      wsh: true,
      sub: true
    },
      globals: {}
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  grunt.registerTask('default', 'lint concat shell:mochadot');
  // Custom tasks
  grunt.registerTask('test', 'lint concat shell:mochaspec');
  grunt.registerTask('debug_ios', 'lint concat shell:mochadot shell:debug_ios');
  grunt.registerTask('debug_android', 'lint concat shell:mochadot shell:debug_android');

};
