import gulp from 'gulp';
import './gulp/build';
import './gulp/linting';
import './gulp/test';
import './gulp/test-browser';

gulp.task('watch-code', function() {
  gulp.watch(['src/**/*', 'test/**/*'], ['lint-src', 'test']);
});

// Run linter, tests
gulp.task('default', ['lint-src', 'test']);
