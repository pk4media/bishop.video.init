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
      scripting: {
        src: ['lib/bishop.video.init.js', 'lib/bishop.video.player.scripting.js'],
        dest: 'min/scripting/<%= pkg.name %>.js'
      }
    },
    uglify: {
      mangle: { toplevel: true, except: ['Bishop', 'BishopPlayer'] }
    },
    concat: {
      normalRelease: {
        src: ['lib/qwery.js', 'min/normal/<%= pkg.name %>.js'],
        dest: 'out/release/<%= pkg.name %>.<%= pkg.version %>.js'
      },
      normalDebug: {
        src: ['lib/qwery.js', 'lib/bishop.video.init.js', 'lib/bishop.video.player.js'],
        dest: 'out/debug/debug.<%= pkg.name %>.<%= pkg.version %>.js'
      },
      scriptingRelease: {
        src: ['lib/qwery.js', 'lib/postmessage.js', 'min/scripting/<%= pkg.name %>.js'],
        dest: 'out/release/<%= pkg.name %>.scripting.<%= pkg.version %>.js'
      },
      scriptingDebug: {
        src: ['lib/qwery.js', 'lib/postmessage.js', 'lib/bishop.video.init.js', 'lib.bishop.player.scripting.js'],
        dest: 'out/debug/debug.<%= pkg.name %>.scripting.<%= pkg.version %>.js'
      }
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