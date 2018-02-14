'use strict';

var express = require('express');
var router = express.Router();

var moment = require('moment');
var multer = require('multer');
// let upload = multer();
var _storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    // 조건문 ->파일형식에 따라 저장소 위치 바꿀수있음

    var t = req.body.select;
    // var type = file.mimetype.split('/')[0];
    // if(type == "image")
    cb(null, './upload/cdms');
  },
  filename: function filename(req, file, cb) {
    var days = moment().add(10, 'days').calendar();
    days = days.replace(/\//gi, '_');
    cb(null, days + '-' + Date.now() + file.originalname);
  }
});
var upload = multer({ storage: _storage });

//cdms
var ctrlCdmsMain = require('../../controllers/cdms/cdms');
var ctrlCdmsProject = require('../../controllers/cdms/project');
var ctrlCdmsUser = require('../../controllers/cdms/users');
//db connect
//http://192.168.0.43:27017/
process.env.MONGODB_URI = 'mongodb://jjy:get123@192.168.0.43:28000/jjy';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('err', console.error);
db.once('open', function () {
  console.log('connect DB');
});
// db location
mongoose.connect(process.env.MONGODB_URI);
// router.get('/', ctrlLocations.homelist);
// router.get('/locations', ctrlLocations.locationInfo);
// router.get('/about', ctrlOthers.about);

// CDMS Define


// main routes
router.get('/cdms', ctrlCdmsMain.home);
router.delete('/cdms', ctrlCdmsMain.home);
router.post('/cdms/loginForm', ctrlCdmsMain.loginForm);
router.post('/cdms/logout', ctrlCdmsMain.logoutForm);
router.get('/cdms/logout', ctrlCdmsMain.logoutForm);
router.post('/cdms/valCheck', ctrlCdmsMain.valCheck);

// users routes
router.post('/cdms/membersForm', ctrlCdmsUser.addMembers);
router.get('/cdms/modify', seqCheck, ctrlCdmsUser.modifyProfile);
router.post('/cdms/modify', seqCheck, ctrlCdmsUser.modify);
router.post('/cdms/searchUser', ctrlCdmsUser.searchUser);
router.post('/cdms/editUser', ctrlCdmsUser.editUser);

//project routes
router.get('/cdms/AdminMode', seqCheck, ctrlCdmsProject.AdminMode);
router.post('/cdms/addProject', ctrlCdmsProject.addProject);
router.post('/cdms/editProject', ctrlCdmsProject.editProject);
router.post('/cdms/addSubjects', ctrlCdmsProject.addSubjects);
router.post('/cdms/searchProject', ctrlCdmsProject.searchProject);
router.post('/cdms/searchProjectID', ctrlCdmsProject.searchProjectID);
router.post('/cdms/addChapters', ctrlCdmsProject.addChapters);
router.get(['/cdms/eachSubject', '/cdms/eachSubject/:page'], seqCheck, ctrlCdmsProject.eachSubject);
router.get(['/cdms/eachSubjectInsidePage/', '/cdms/eachSubjectInsidePage/:page'], seqCheck, ctrlCdmsProject.eachSubjectInsidePage);
// router.post('/cdms/readEachBoard/', ctrlCdmsProject.readEachBoard);
router.post('/cdms/writeBoard/', seqCheck, upload.any(), ctrlCdmsProject.writeBoard);
router.post('/cdms/BoardDownload/', ctrlCdmsProject.BoardDownload);
router.post('/cdms/readOneDocument/', ctrlCdmsProject.readOneDocument);
// router.post('/cdms/readOneDocument' ,ctrlCdmsProject.readOneDocument);


module.exports = router;

//프로미스
function Promise(param) {
  return new Promise(function (resolve, reject) {
    resolve(param);
  });
}

// 세션확인
function seqCheck(req, res, next) {
  var sess = req.session;
  if (sess.userid) {
    next();
  } else {
    res.render('cdms/main');
  }
}