'use strict';

var member = require('../../models/cdms/member');
var project = require('../../models/cdms/projects');
var SHA256 = require("crypto-js/sha256");
var crypto = require('crypto');
var hash = crypto.createHash('sha256');

module.exports.home = function (req, res, next) {
  var sess = req.session;
  if (sess.userid) {
    var body = {};
    body.id = sess.userid;
    member.findOneByID(body, function (result) {
      // console.log(result);
      sess.status = result.status;
      sess._id = result._id;
      sess.name = result.name;
      sess.projectNum = result.projectNum;
      var projects = result.projectNum.toString();
      project.findMultiByName(projects, function (result) {
        // console.log(result);
        res.render('cdms/main/front', { id: sess.userid, status: sess.status, loadScript: 'mainContent', doc: result });
      });
    });
  } else {
    res.render('cdms/main/login', { loadScript: 'login' });
  }
};

// loginForm
module.exports.loginForm = function (req, res) {
  member.loginForm(req.body.id, makeCrypto(req.body.pw), function (result) {
    console.log(result);
    if (result) {
      var sess = req.session;
      sess.userid = req.body.id;
      res.send({ flag: true });
    } else res.send({ flag: false });
  });
};
// log out Form
module.exports.logoutForm = function (req, res) {
  console.log('out');
  var sess = req.session;
  if (sess.userid) {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      } else {
        member.findAll(function (result) {
          res.render('cdms/main', { members: result });
        });
      }
    });
  } else {
    member.findAll(function (result) {
      res.render('cdms/main', { members: result });
    });
  }
};

module.exports.valCheck = function (req, res) {
  var type = req.body.type;
  var value = req.body.value;
  var mod = req.body.mod;
  console.log(type + value);
  member.valueCheck(type, value, function (result) {
    if (result == 0) {}
    //
    result == 0 ? res.send({ flag: true, type: type }) : res.send({ flag: false, type: type });
  });
};

//crypto
function makeCrypto(i) {
  var hash = crypto.createHmac('sha256', i).update('makePW').digest('hex');
  return hash;
}

//chk dataForm
function chkJoinForm(id, pw, email, name, phone) {

  // var bin = "";
  // var check_Num= /^[1-9]{6,11}$/g
  // var check_id = /[0-9a-zA-Z\S]{4,20}$/g
  // var check_pw = /{4-20}/g
  // var check_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  // if(id.search(check_id) != 0 ) bin += 'id/';
  // if(pw.search(check_pw)
  // console.log('char = '+test.search(check_pw));
  // console.log('num = '+test2.search(check_pw));

}