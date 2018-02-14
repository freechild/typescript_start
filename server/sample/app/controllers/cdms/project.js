'use strict';

var project = require('../../models/cdms/projects');
var chapter = require('../../models/cdms/subjects');

var moment = require('moment');

// add project
module.exports.AdminMode = function (req, res, next) {
  res.render('cdms/main/AdminMode');
};

module.exports.addProject = function (req, res, next) {

  var projects = new project();
  var projectValue = req.body.project;
  project.increment(projectValue, function (result) {

    if (result == "false") {
      console.log('result');
      return res.json({ flag: false });;
    } else {
      projects._id = result + 1;
      projects.project = projectValue;

      projects.save(function (err) {
        if (err) throw err;
        return res.json({ flag: true });;
      });
    }
  });
};

module.exports.editProject = function (req, res, next) {
  var body = req.body;
  project.findOneByNameCount(body.project, function (result) {
    if (result == 0) {
      // console.log(body);
      var _id = body._id;
      var obj = { project: body.project };
      project.modify(_id, obj, function (result) {
        if (result.ok == 1) return res.send(true);
        return res.send("system Error");
      });
    } else {
      return res.send("이미 등록된 프로젝트입니다.");
    }
  });
};

module.exports.searchProject = function (req, res, next) {
  project.findOneByName(req.body.project, function (result) {
    return res.json({ flag: true, doc: result });
  });
};

module.exports.searchProjectID = function (req, res, next) {

  chapter.findChapterList(req.body, function (result) {
    return res.json({ flag: true, doc: result, curTaget: req.body.curTaget });
  });
};

module.exports.addSubjects = function (req, res, next) {
  project.addSubjects(req.body, function (projectResult) {
    if (projectResult != false) {
      chapter.bulkWrite(req.body, function (chapterResult) {
        if (chapterResult == true) res.send(true);else res.send("SUBJECT DB ERROR");
      });
    } else res.send("PROJECT DB ERROR");
  });
};

module.exports.addChapters = function (req, res, next) {
  // console.log(req.body);
  chapter.bulkUpdate(req.body, function (result) {
    result ? res.send(true) : res.send("SUBJECT DB ERROR");
  });
};

module.exports.eachSubject = function (req, res, next) {
  try {
    var pageInfo = req.params.page;
    pageInfo = pageInfo.split(',');
    var _id = pageInfo[0];
    var Subject = pageInfo[1];
    chapter.findChapterLByID(_id, function (result) {
      res.render('cdms/main/eachSubject', { doc: result, subject: Subject });
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports.eachSubjectInsidePage = function (req, res, next) {
  try {
    var pageInfo = req.params.page;
    pageInfo = pageInfo.split(',');

    project.findBoardByCategories(pageInfo, function (result) {
      res.render('cdms/main/eachSubjectInsidePage', { board: result, url: req.params.page });
    });
    // project.writeBoard(function(result){
    //
    // })
    // res.send('true')
    //res.render('cdms/main/eachSubjectInsidePage');
    //   var sess = req.session;
  } catch (e) {
    console.log(e);
  }
};

module.exports.readOneDocument = function (req, res, next) {
  var body = req.body;
  var category = body.curPage.split('id_')[1],
      project_id = category.split('_')[0];
  project.readOneDocument(project_id, body.recipient, function (result) {
    try {

      if (result.length > 2) return res.render('error', { error: err });else {
        var sendData = {};
        sendData.name = result[0].Board.name, sendData.title = result[0].Board.title, sendData.content = result[0].Board.content, sendData.recipient = body.recipient;
        return res.send(sendData);
      }
    } catch (e) {
      console.log(e);
    }
  });
};

module.exports.writeBoard = function (req, res, next) {
  var sess = req.session,
      body = req.body,
      pageInfo = body.page.split(','),
      category = pageInfo[0].split('id_')[1],
      page_Detail_Info = pageInfo[1].split('_'),
      project_id = category.split('_')[0],
      pushData = {};
  pushData.name = sess.name;
  pushData.title = body.title;
  pushData.content = body.content;
  pushData.category = category;
  pushData.categories = category + "_" + page_Detail_Info[0] + "_" + NumberToString(page_Detail_Info[3]);
  if (req.files.length) {
    var fileInfo = req.files[0];
    pushData.originalFileName = fileInfo.originalname;
    pushData.currentFileName = fileInfo.filename;
    pushData.filePath = fileInfo.destination;
  }
  project.writeBoard(project_id, pushData, function (result) {
    res.send(result);
  });
  // console.log(req.body);
};

module.exports.BoardDownload = function (req, res, next) {
  console.log(req.body);
};

function NumberToString(i) {
  switch (i) {
    case '0':
      return 'first';
      break;
    case '1':
      return 'fixed';
      break;
    default:
      return 'last';
  }
}