// responsive_lazy_loader
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);
  // Lazyload grunt tasks.
  require('grunt-lazyload')(grunt);

  // Configurable paths
  var config = {
    app: './',
    dist: 'dist',
    bower: 'bower_components',
    pkg: grunt.file.readJSON('package.json')
  };

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
          spawn: false // Important, don't remove this!
      },
      js: {
        files: [
          '<%= config.app %>/scripts/{,*/}*.js'
        ],
        tasks: ['jshint', 'bsReload']
      }
    },

    // BrowserSync
    browserSync: {
      dev: {
        bsFiles: {
          src : [
            '<%= config.app %>/scripts/{,*/}*.js'
          ]
        },
        options: {
          watchTask: true,
          server: './<%= config.app %>',
        }
      }
    },
    bsReload: {
        all: {
            reload: true
        }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      js: ["<%= config.dist %>/scripts/*.js", "!<%= config.dist %>/scripts/*.min.js"],
      server: '.tmp'
    },

    // JS uglify.
    uglify: {
      dist: {
        options: {
          banner: '/* <%= config.pkg.name %> - v<%= config.pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */',
          preserveComments: false,
          mangle: true,
          compress: {
            drop_console: true
          }
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>/',
          src: 'scripts/*.js',
          dest: '<%= config.dist %>/'
        }]
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        '<%= config.app %>/js/*.js',
        '!<%= config.app %>/js/*.min.js'
      ]
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          // Copy global files.
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt,md,json}',              // Global files.
            'assets/*/*.*',                         // Assets.
            'img/{,*/}*.{webp,jpg,png,gif,svg}',    // Images.
            'fonts/{,*/}*.*',                       // Fonts.
            'translate/{,*/}*.json',                // translations.
            'scripts/jquery/{,*/}*.js',             // JS librairies.
          ]
        }]
      },
      bower: {
        // Copy bower elements.
        files: [{
          expand: true,
          dot: true,
          cwd: 'bower_components/jquery/dist/',
          dest: '<%= config.app %>/scripts/jquery',
          src: ['jquery.min.js']
        }]
      },

      // The "readme" task
      readme: {
        options: {
          metadata: {
            name: '<%= pkg.name %>',
            description: '<%= pkg.description %>'
          }
        }
      }
    }
  });

  // Explicit lazyLoad tasks.
  grunt.lazyLoadNpmTasks('grunt-contrib-jshint', 'jshint');
  grunt.lazyLoadNpmTasks('grunt-browser-sync', 'browserSync');
  grunt.lazyLoadNpmTasks('grunt-contrib-clean', 'clean');
  grunt.lazyLoadNpmTasks('grunt-contrib-uglify', 'uglify');
  grunt.lazyLoadNpmTasks('grunt-contrib-watch', 'watch');
  grunt.lazyLoadNpmTasks('grunt-readme', 'readme');

  // Register tasks.
  grunt.registerTask('build', [
    'browserSync', 'watch'
  ]);
  grunt.registerTask('dist', [
    'clean:dist',
    'clean:server',
    'uglify:dist',
    'clean:js',
    'copy:dist',
    // 'readme'
  ]);
  grunt.registerTask('default', [
    'build'
  ]);
};
