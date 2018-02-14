var gulp = require('gulp');
var gutil = require('gulp-util');
var ts = require('gulp-typescript');
var tsProject = ts.createProject("tsconfig.json");


const DIR = {
    SRC: 'src',
    BIN: 'bin',
    CONFIG: 'config',
    DEST: 'dist',
}

const SRC = {
    SERVER: DIR.BIN +"/*.ts",
}

const DEST = {
    APP: DIR.CONFIG + "/",

}

//default
gulp.task('default',['server'],()=>{    
    gutil.log('gulp is running')
});


//server compile
gulp.task('server',()=>{
    return gulp.src( SRC.SERVER )
        .pipe(tsProject())
        .js.pipe(gulp.dest( DEST.APP ));
})

//server old file clean
gulp.task('clean', ()=>{
    return gulp.src(DIR.CONFIG +"/*" ,{
        read:false
    })
    .pipe(clean());
})

// gulp watch
gulp.task('watch', () => {
    let watcher = {
        server: gulp.watch(SRC.BIN,['server']),
    }
})