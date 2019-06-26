const path = require('path');
const {parallel, watch, task, src, dest} = require('gulp');
const sass = require('gulp-sass');
const log = require('fancy-log');
const sourcemaps = require('gulp-sourcemaps');
const compiler = require('webpack');
const webpack = require('webpack-stream');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';
const browserSync = isDev
    ? require('browser-sync').create()
    : null;

sass.compiler = require('node-sass');


task('sass', function () {
    let out = src('./src/css/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'nested',
            includePaths: [
                'node_modules/foundation-sites/scss'
            ]
        }).on('error', sass.logError))
        .pipe(autoprefixer());

    if (!isDev) {
        out = out.pipe(csso());
    }

    out = out.pipe(sourcemaps.write('.'))
        .pipe(dest('./app/static/css'));

    // Enable BS only on Dev
    if (isDev) {
        out = out.pipe(browserSync.stream());
    }

    return out;
});


task('js', function () {
    return src('src/js/main.js')
        .pipe(webpack({
            mode: isDev ? 'development' : 'production',
            entry: path.resolve(__dirname, 'src', 'js', 'main.js'),
            output: {
                path: path.resolve(__dirname, 'app', 'static', 'js'),
                filename: 'main.js',
            },
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader"
                        }
                    }
                ]
            },
            plugins: [
                // To strip all locales except “en”
                new MomentLocalesPlugin(),
            ],
            externals: {
                jquery: 'jQuery'
            }

        }, compiler, function (err, stats) {
            // Print stats
            log("[webpack]", stats.toString({
                chunkModules: false,
                colors: true,
                hash: false,
                version: false
            }));

            if (isDev) {
                browserSync.reload();
            }
        }))
        .pipe(dest(path.resolve(__dirname, 'app', 'static', 'js')));
});

task('default', parallel(['sass', 'js']));

task('dev', function () {
    browserSync.init({
        proxy: "127.0.0.1:8000"
    });

    watch('src/js/**', {ignoreInitial: false}, parallel(['js']));
    watch('src/css/**', {ignoreInitial: false}, parallel(['sass']));
});
