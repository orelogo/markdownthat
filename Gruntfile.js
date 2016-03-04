module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      // options: {
      //   separator: ';',
      // },
      js: {
        src: ['src/js/htmlToMarkdown.js', 'src/js/background.js'],
        dest: 'build/js/background.js',
      },
      contentscript: {
        src: ['src/js/csContextMenu.js', 'src/js/csReddit.js', 'src/js/csQuora.js'],
        dest: 'build/js/contentscript.js',
      }
    },

    copy: {
      build: {
        files: [
          // need to use cwd so that src folder isn't copied into dest
          {expand: true, cwd: 'src/', src: ['*'], dest: 'build/', filter: 'isFile'},
          {expand: true, cwd: 'src/', src: ['css/**'], dest: 'build/'},
          {expand: true, cwd: 'src/', src: ['lib/**'], dest: 'build/'},
          {expand: true, cwd: 'src/', src: ['js/options.js'], dest: 'build/'}
        ]
      },
      dist: {
        files: [
          // need to use cwd so that src folder isn't copied into dest
          {expand: true, cwd: 'src/', src: ['*'], dest: 'dist/', filter: 'isFile'},
          {expand: true, cwd: 'src/', src: ['lib/**'], dest: 'dist/'}
        ]
      }
    },

    cssmin: {
      target: {
        files: [
          {expand: true, cwd: 'src/', src: ['css/*.css'], dest: 'dist/'}
        ]
      }
    },

    uglify: {
      my_target: {
        files: {
          'dist/js/background.js': ['src/js/htmlToMarkdown.js', 'src/js/background.js'],
          'dist/js/contentscript.js': ['src/js/csContextMenu.js', 'src/js/csReddit.js', 'src/js/csQuora.js'],
          'dist/js/options.js': ['src/js/options.js']
        }
      }
    },

    watch: {
      files: ['src/**'],
      tasks: ['concat', 'copy', 'uglify', 'cssmin'],
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'copy', 'uglify', 'cssmin', 'watch']);
};
