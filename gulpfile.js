const gulp = require('gulp');

const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const autoprefixer  = require('gulp-autoprefixer');
const beautify = require('gulp-jsbeautifier');

// 소스 루트 경로
const dev ='./dev';
const build = './build';

const beautifyOpt = {
    indent_char: '\t',
    indent_size: 1
}

// 소스 세부 경로
const devPath = {
    html: [dev + '/**/*.html', '!' + dev + '/_*/*.html'],
    css: dev + '/css/**/*.css',
    js: dev + '/js/**/*.js',
    images: dev + '/images/**/*.{gif,png,jpeg,jpg,svg}',
    fonts: dev + '/fonts/**/*'
}, buildPath = {
    html: build+ '/',
    css: build + '/css',
    js: build + '/js',
    images: build + '/images/',
    fonts: build + '/fonts/'
};

// build 폴더를 기준으로 웹서버 실행
gulp.task('server', function (done) {
    browserSync.init({
        server: {
            baseDir: './build/html', // 웹서버 root폴더 경로 지정
            directory: true
        },
        browser: ["chrome", /*"firefox"*/] // 원하는 브라우저로 실행한다
    });
    done();
});

// HTML 파일을 minify
gulp.task('htmlComplie', function (done) {
    gulp.src(devPath.html, {since:gulp.lastRun('htmlComplie')}) //src 폴더 아래의 모든 html 파일을
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(buildPath.html)) //위에 설정된 build 폴더에 저장
        .pipe(browserSync.reload({stream:true})); //browserSync 로 브라우저에 반영
        //reload 메서드의 옵션으로 stream:true를 주었기 때문에 변경된 파일만 stream 으로 브라우저에 전송되어 리프레시 없이도 반영이 가능한 경우 리프레시 없이 반영
    done();
});

// CSS 파일을 minify
gulp.task('cssCompile', function (done) {
    gulp.src(devPath.css, {since:gulp.lastRun('cssCompile')}) //css 폴더의 *.css 파일을
        .pipe(autoprefixer({
            overrideBrowserslist: [
                "> 5%", // browsers versions selected by global usage statistics. >=, < and <= work too.
                "Firefox > 1", // versions of Firefox newer than 20. >=, < and <= work too. It also works with Node.js.
                "last 2 versions" // he last 2 versions for each browser.
            ]
        }))
        .pipe(beautify(beautifyOpt))
        .pipe(gulp.dest(buildPath.css)) //위에 설정된 build 폴더에 저장
        .pipe(browserSync.reload({stream:true})); //browserSync 로 브라우저에 반영
    done();
});

// JavaScript minify
gulp.task('jsCompile', function (done) {
    gulp.src(devPath.js, {since:gulp.lastRun('jsCompile')})
        .pipe(beautify(beautifyOpt))
        .pipe(gulp.dest(buildPath.js)) //위에 설정된 build 폴더에 저장
        .pipe(browserSync.reload({stream:true}));
    done();
});

// 이미지 압축
gulp.task('imgMinCompile', function (done) {
    gulp.src(devPath.images)
        .pipe(imagemin({ 
            optimizationLevel: 5, progressive: true, interlaced: true 
        })) //이미지 최적화
        .pipe(gulp.dest(buildPath.images)); //동시에 build에도 출력
    done();
});

// 폰트
gulp.task('fontCompile', function (done) {
    gulp.src(devPath.fonts)
        .pipe(gulp.dest(buildPath.fonts));
    done();
})

// 파일 변경 감지
gulp.task('watch', function (done) {
    //src 디렉토리 안에 html 확장자를 가진 파일이 변경되면 htmlComplie task 실행
    gulp.watch(devPath.html, gulp.series('htmlComplie'));
    //src 디렉토리 안에 css 확장자를 가진 파일이 변경되면 cssCompile task 실행
    gulp.watch(devPath.css, gulp.series('cssCompile'));
    //src 디렉토리 안에 js 확장자를 가진 파일이 변경되면 jsCompile task 실행
    gulp.watch(devPath.js, gulp.series('jsCompile'));
    //src 디렉토리 안에 js 확장자를 가진 파일이 변경되면 imgMinCompile task 실행
    gulp.watch(devPath.images, gulp.series('imgMinCompile'));
    done();
});

// gulp를 실행하면 default 로 server task와 watch task, imgMinCompile task를 실행
// series = 순차
// parallel = 동시 or 병렬(실행은 동시에 시작되지만 처리속도에 따라 종료시점이 달라진다)
gulp.task('default', gulp.series('jsCompile', 'cssCompile', 'htmlComplie', 'imgMinCompile', 'fontCompile', gulp.parallel('watch', 'server')));