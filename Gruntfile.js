module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      // options: {
      //   separator: ';',
      // },
      js: {
        src: ['src/js/getMetadata.js', 'src/js/htmlToMarkdown.js', 'src/js/popup.js'],
        dest: 'build/js/rMarkdown.js',
      },
    },

    copy: {
      main: {
        files: [
          // need to use cwd so that src folder isn't copied into dest
          {expand: true, cwd: 'src/', src: ['*'], dest: 'build/', filter: 'isFile'},
          {expand: true, cwd: 'src/', src: ['css/**'], dest: 'build/'},
          {expand: true, cwd: 'src/', src: ['lib/**'], dest: 'build/'},
          {expand: true, cwd: 'src/', src: ['js/contentscript.js'], dest: 'build/'},
        ],
      },
    },

    watch: {
      files: ['src/**'],
      tasks: ['concat:js', 'copy:main'],
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'copy', 'watch']);
};
