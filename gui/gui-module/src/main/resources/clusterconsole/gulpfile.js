var gulp = require('gulp'),
    del = require('del'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence'),
    install = require("gulp-install"),
    connect = require('gulp-connect'),
    open = require('gulp-open'),
    argv = require('yargs').argv,
    less = require('gulp-less'),
    replace = require('gulp-replace-task');

var config = require( './build.config.js'),
    livePrevConfig = require( './build_live-prev.config.js');


/**
 * Task for cleaning build directory
 */
gulp.task('clean', function() {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del([argv.live ? livePrevConfig.live_build_dir : config.build_dir]);
});

/**
 * Copy assets
 */
gulp.task('copyAssetsCss', function () {
    return gulp.src(config.assets_files.css)
        .pipe(
            gulp.dest(
                (argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir) + '/assets/css'
            )
        );
});

gulp.task('copyAssetsData', function () {
    return gulp.src(config.assets_files.data)
        .pipe(gulp.dest((argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir) + '/assets/data'));
});

/**
 * Copy app files
 */
gulp.task('copyTemplates', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying APP Template files'));
    // Copy html
    return gulp.src(config.app_files.templates)
        .pipe(gulp.dest(argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir));
});

gulp.task('copyAppJs', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying APP Controller JS files'));
    return gulp.src(config.app_files.js)
        .pipe(gulp.dest(argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir));
});

gulp.task('copyRootJs', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying APP Root JS files'));
    return gulp.src(config.app_files.root_js)
        .pipe(gulp.dest(argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir));
});

/**
 * Compile css from less files
 */
gulp.task('less', function () {
    gutil.log(gutil.colors.cyan('INFO :: compiling LESS file'));
    return gulp.src(config.app_files.less)
        .pipe(less())
        .pipe(gulp.dest('src/assets/css'));
});

/**
 * Copy app assets images
 */
gulp.task('copyAppImgs', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying image files'));
    return gulp.src(config.app_files.img)
        .pipe(gulp.dest((argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir) + '/assets/img'));

});

/**
  * Copy vendor files
 */
gulp.task('copyVendorCss', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying VENDOR css'));
    return gulp.src(config.vendor_files.css, { cwd : 'src/vendor/**' })
        .pipe(gulp.dest((argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir) + '/vendor'));
});

gulp.task('copyVendorFonts', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying VENDOR fonts'));
    return gulp.src(config.vendor_files.fonts, { cwd : 'src/vendor/**' })
        .pipe(gulp.dest((argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir) + '/vendor'));
});

gulp.task('copyVendorRobotoFonts', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying ROBOTO fonts to assets'));
    return gulp.src(['src/vendor/roboto-fontface/fonts/*.*'], { base: 'src/vendor/roboto-fontface'})
        .pipe(gulp.dest(livePrevConfig.live_build_dir + '/assets'));
});

gulp.task('copyVendorJs', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying VENDOR js files'));
    return gulp.src(config.vendor_files.js, { cwd : 'src/vendor/**' })
        .pipe(gulp.dest((argv.live ? livePrevConfig.live_build_dir + '/src/app/clusterconsole' : config.build_dir) + '/vendor'));
});

/**
 * Copy task aggregated
 */
gulp.task('copy', function() {
    runSequence('less', [
        'copyAssetsCss',
        'copyAssetsData',
        'copyTemplates',
        'copyAppJs',
        'copyRootJs',
        'copyVendorCss',
        'copyVendorFonts',
        'copyAppImgs',
    ], 'copyVendorJs');
});

/**
 * Build task
 */
gulp.task('build', function(){
    runSequence('clean', 'copy');
});


/**
 * Copy neccessary dlux app files
 */
gulp.task('copyDLUX', function () {
    gutil.log(gutil.colors.cyan('INFO :: copying DLUX files'));

    return gulp.src(livePrevConfig.dluxSrcFiles, {base: livePrevConfig.dluxSrcDir})
        .pipe(gulp.dest(livePrevConfig.live_build_dir));

});

/**
 * Some DLUX files, such as app.module and index.html need to be replaced with custom files
 * to have clusterconsole live in DLUX
 */
gulp.task('customizeLivePreview', function () {
    gutil.log(gutil.colors.cyan('INFO :: customizing DLUX files'));

    return gulp.src(['live/src/src/app/app.module.js', 'live/src/index.html'], {base: 'live/src'})
        .pipe(gulp.dest(livePrevConfig.live_build_dir));

});

/**
 * Configure enviroment settings
 */
gulp.task('configureLivePreview', function () {
    gutil.log(gutil.colors.cyan('INFO :: configuring live preview'));

    return gulp.src(['live/src/env.module.js'], {base: 'live/src'})
        .pipe(replace({
            patterns: [
                {
                    json: livePrevConfig.envConfig
                }
            ]
        }))
        .pipe(gulp.dest(livePrevConfig.live_build_dir + '/src/common/config'));
});

/**
 * Create live web server
 */
gulp.task('connect', function() {
    connect.server({
        root: livePrevConfig.live_build_dir,
        livereload: true,
        port: 9000
    });
});

/**
 * Open new browser tab
 */
gulp.task('browser', function(){
    gutil.log(gutil.colors.cyan('INFO :: opening new browser tab'));
    return gulp.src(__filename)
        .pipe(open({uri: 'http://localhost:9000', app: 'chrome'}));
});

/**
 * Reload opened browser tab
 */
gulp.task('reload', function() {
    return gulp.src('*/*.*')
        .pipe(connect.reload());
});

/**
 * Run neccessary task again if some change was made
 */
gulp.task('watch', function() {

    gulp.watch(config.app_files.js, function(){
        gutil.log(gutil.colors.cyan('INFO :: ******************* watch JS files *******************'));
        runSequence('copyAppJs', 'reload');
    });

    gulp.watch(config.app_files.root_js, function(){
        gutil.log(gutil.colors.cyan('INFO :: ******************* watch ROOT JS files *******************'));
        runSequence('copyRootJs', 'reload');
    });

    gulp.watch(config.app_files.templates, function(){
        gutil.log(gutil.colors.cyan('INFO :: ******************* watch TEMPLATES files *******************'));
        runSequence('copyTemplates', 'reload');
    });

    gulp.watch(config.app_files.less, function(){
        gutil.log(gutil.colors.cyan('INFO :: ******************* watch LESS files *******************'));
        runSequence('less', 'copyAssetsCss', 'reload');
    });



});

/**
 * Live preview main task for development
 * argument --live should be used to force build task to build only live preview
 */
gulp.task('default', function (){

    if (!argv.live) {
        gutil.log(gutil.colors.red('ERROR :: --live argument must be used for live preview!'));
    }

    gutil.log(gutil.colors.cyan('INFO :: opening new browser tab live:' + argv.live));

    runSequence(
        'build',
        'copyDLUX',
        'copyVendorRobotoFonts',
        'customizeLivePreview',
        'configureLivePreview',
        'connect',
        'browser',
        'watch'
    );
});
