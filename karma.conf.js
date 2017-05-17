// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',
    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],
    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'client/bower_components/lodash/lodash.js',
      'client/bower_components/angular-socket-io/socket.js',
      'client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client/bower_components/angular-translate/angular-translate.js',
      'client/bower_components/angular-dialog-service/dist/dialogs.min.js',
      'client/bower_components/angular-dialog-service/dist/dialogs-default-translations.min.js',
      'client/bower_components/chosen/chosen.jquery.js',
      'client/bower_components/angular-chosen-localytics/dist/angular-chosen.js',
      'client/bower_components/angular-truncate/src/truncate.js',
      'client/bower_components/angular-ui-tree/dist/angular-ui-tree.js',
      'client/bower_components/ejs/ejs.js',
      'client/bower_components/d3/d3.js',
      'client/bower_components/ng-file-upload/ng-file-upload-all.min.js',
      'client/bower_components/handlebars/handlebars.js',
      'client/bower_components/angular-notify/dist/angular-notify.js',
      'client/bower_components/summernote/dist/summernote.js',
      'client/bower_components/angularjs-placeholder/src/angularjs-placeholder.js',
      'client/bower_components/angular-cache-buster/angular-cache-buster.js',
      'client/bower_components/async/lib/async.js',
      'client/bower_components/jquery-file-download/src/Scripts/jquery.fileDownload.js',
      'client/bower_components/checklist-model/checklist-model.js',
      'client/bower_components/c3/c3.js',
      'client/bower_components/c3-angular/c3-angular.min.js',
      'client/bower_components/metisMenu/dist/metisMenu.js',
      'client/bower_components/nvd3/build/nv.d3.js',
      'client/bower_components/angular-nvd3/dist/angular-nvd3.js',
      'client/bower_components/javascript-detect-element-resize/detect-element-resize.js',
      'client/bower_components/angular-gridster/src/angular-gridster.js',
      'client/bower_components/datatables.net/js/jquery.dataTables.js',
      'client/bower_components/angular-datatables/dist/angular-datatables.js',
      'client/bower_components/angular-datatables/dist/plugins/colreorder/angular-datatables.colreorder.js',
      'client/bower_components/angular-datatables/dist/plugins/columnfilter/angular-datatables.columnfilter.js',
      'client/bower_components/angular-datatables/dist/plugins/light-columnfilter/angular-datatables.light-columnfilter.js',
      'client/bower_components/angular-datatables/dist/plugins/colvis/angular-datatables.colvis.js',
      'client/bower_components/angular-datatables/dist/plugins/fixedcolumns/angular-datatables.fixedcolumns.js',
      'client/bower_components/angular-datatables/dist/plugins/fixedheader/angular-datatables.fixedheader.js',
      'client/bower_components/angular-datatables/dist/plugins/scroller/angular-datatables.scroller.js',
      'client/bower_components/angular-datatables/dist/plugins/tabletools/angular-datatables.tabletools.js',
      'client/bower_components/angular-datatables/dist/plugins/buttons/angular-datatables.buttons.js',
      'client/bower_components/angular-datatables/dist/plugins/select/angular-datatables.select.js',
      'client/bower_components/datatables.net-buttons/js/dataTables.buttons.js',
      'client/bower_components/datatables.net-buttons/js/buttons.colVis.js',
      'client/bower_components/datatables.net-buttons/js/buttons.flash.js',
      'client/bower_components/datatables.net-buttons/js/buttons.html5.js',
      'client/bower_components/datatables.net-buttons/js/buttons.print.js',
      'client/bower_components/pdfmake/build/pdfmake.js',
      'client/bower_components/pdfmake/build/vfs_fonts.js',
      'client/bower_components/chartist/dist/chartist.js',
      'client/bower_components/angular-chartist.js/dist/angular-chartist.js',
      'client/bower_components/angular-scenario/angular-scenario.js',
      // endbower
      'client/bower_components/bootstrap/dist/js/bootstrap.min.js',
      'client/bower_components/summernote/dist/summernote.min.js',
      'client/assets/plugins/summernote/angular-summernote.min.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/assets/**/*.js',
      'client/app/app.js',
      'client/app/**/*.js',
      'client/components/**/*.js',
      'client/app/**/*.html',
      'client/components/**/*.html'
    ],
    preprocessors: {
//      '**/*.jade': 'ng-jade2js',
      '**/*.html': 'html2js'
//      '**/*.coffee': 'coffee'
    },
    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/'
    },
    ngJade2JsPreprocessor: {
      stripPrefix: 'client/'
    },
    // list of files / patterns to exclude
    exclude: [],
    // web server port
    port: 8080,
    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],
    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
