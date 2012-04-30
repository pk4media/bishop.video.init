module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'lib/**/bishop.video.*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    min: {
      normal: {
        src: ['lib/bishop.video.init.js', 'lib/bishop.video.player.js'],
        dest: 'min/normal/<%= pkg.name %>.js'
      },
    },
    uglify: {
      mangle: { toplevel: true }
    },
    concat: {
      normalRelease: {
        src: ['min/normal/<%= pkg.name %>.js'],
        dest: 'out/release/<%= pkg.name %>.<%= pkg.version %>.js'
      },
      normalDebug: {
        src: ['lib/bishop.video.init.js'],
        dest: 'out/debug/debug.<%= pkg.name %>.<%= pkg.version %>.js'
      },
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
      globals: {
        exports: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'min concat');

};