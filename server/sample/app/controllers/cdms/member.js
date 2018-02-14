'use strict';

var member = require('../../models/cdms/member');
var SHA256 = require("crypto-js/sha256");
var crypto = require('crypto');
var hash = crypto.createHash('sha256');

// searchUser

//modify
//modify load page
module.exports.modify = function (req, res) {
  // let _id = req.session._id;
  // let pw:String = req.body.pw;
  // let email:String = req.body.email;
  // let phone:Number = req.body.phone;
  // let company:String = req.body.company;
  console.log('mod');
  var mMap = {};

  mMap.pw = makeCrypto(req.body.pw);
  mMap.email = req.body.email;
  mMap.phone = req.body.phone;
  mMap.company = req.body.company;
  member.modify(req.session._id, mMap, function (result) {
    //res.send(result.ok)
    res.send(result);
  });
};
module.exports.modifyProfile = function (req, res) {
  var sess = req.session;

  if (sess.userid) {
    member.findOneCollection("id", sess.userid, function (result) {
      var page = "modify";
      res.render('cdms/main/modify', { id: sess.userid, result: result, page: page, loadScript: 'mainContent' });
    });
  } else {
    member.findAll(function (result) {
      res.render('cdms/main', { members: result });
    });
  }
};

//add member Form
module.exports.addMembers = function (req, res, next) {

  var id = req.body.id;
  var email = req.body.email;
  member.valueCheck('id', id, function (result) {
    if (result == 0) {
      member.valueCheck('email', email, function (result) {
        if (result == 0) {
          member.increment(function (result) {
            chkJoinForm(id, req.body.pw, email, req.body.name, req.body.phone);
            var mem = new member();
            mem._id = result + 1;
            mem.id = id;
            mem.pw = makeCrypto(req.body.pw);
            mem.email = email;
            mem.name = req.body.name;
            mem.phone = req.body.phone;
            mem.company = req.body.company;

            mem.save(function (err) {
              if (err) throw err;
              return res.json({ flag: true, result: '가입 성공' });;
            });
          });
        } else return res.json({ flag: false, result: '이미 가입된 email입니다.' });
      });
    } else return res.json({ result: '이미 가입된 id입니다.' });
  });
};