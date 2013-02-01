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
      debug_ios: {
        command: 'cordova build ios && cordova emulate ios',
        stdout: true
      },
      debug_android: {
        command: 'cordova build android && cordova emulate android',
        stdout: true
      }
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js']
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          'src/models/AccountModel.js',
          'src/models/FileModel.js',
          'src/models/FolderModel.js',
          'src/models/DeviceModel.js',
          'src/models/SpiderOakFolderModel.js',
          'src/models/MyShareRoomsModel.js',
          'src/collections/FoldersCollection.js',
          'src/collections/FilesCollection.js',
          'src/collections/DevicesCollection.js',
          'src/views/DevicesView.js',
          'src/views/FolderView.js',
          'src/views/LoginView.js',
          'src/views/MainView.js',
          'src/views/MenuSheetView.js',
          'src/app.js'
        ],
        dest: 'www/js/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<config:concat.dist.dest>'
        ],
        dest: 'www/js/<%= pkg.name %>.min.js'
      }
    },
    compass: {
      dev: {
        src: 'www/css/scss',
        dest: 'www/css/themes',
        outputstyle: 'expanded',
        linecomments: true,
        require: [
          'www/components/compass-recipes/lib/compass-recipes'
        ]
      },
      prod: {
        src: 'www/css/scss',
        dest: 'www/css/themes/min',
        outputstyle: 'compressed',
        linecomments: false,
        forcecompile: true,
        require: [
          'www/components/compass-recipes/lib/compass-recipes'
        ]
      }
    },
    jasmine : {
      specs : 'www/spec/**/*.js',
      template : 'www/spec/SpecRunner.html'
    },
    'jasmine-server' : {
      browser : true
    },
    watch: {
      files: [
        '<config:lint.files>',
        'www/spec/**/*.js',
        'www/css/**/*.scss'
      ],
      tasks: 'lint concat jasmine compass:dev'
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

  grunt.loadNpmTasks('grunt-compass');
  grunt.loadNpmTasks('grunt-jasmine-runner');
  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  grunt.registerTask('default', 'lint concat compass:dev jasmine');
  // Custom tasks
  grunt.registerTask('test', 'lint concat jasmine');
  grunt.registerTask('debug_ios', 'lint concat jasmine compass:dev shell:debug_ios');
  grunt.registerTask('debug_android', 'lint concat jasmine compass:dev shell:debug_android');

};
