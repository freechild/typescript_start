var member = require('../../models/cdms/member');
var project = require('../../models/cdms/projects');
var SHA256 = require("crypto-js/sha256");
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

// searchUser

//modify
  //modify load page
module.exports.modify = function(req,res){
  let mMap = {};
  mMap.pw = makeCrypto(req.body.pw);
  mMap.email = req.body.email;
  mMap.phone = req.body.phone;
  mMap.company = req.body.company;
  member.modify(req.session._id,mMap,function (result) {
    res.send(result);
  })
}
module.exports.modifyProfile = function(req,res){
  var sess = req.session;
  member.findOneCollection("id",sess.userid,function(result){
    let page = "modify";
    res.render('cdms/main/modify',{id:sess.userid,result:result,page:page,loadScript : 'mainContent'})
  })
}

//add member Form
module.exports.addMembers = function(req,res,next) {

    var id = req.body.id;
    var email = req.body.email;
    member.valueCheck('id',id,function (result) {
      if(result == 0){
        member.valueCheck('email',email,function (result) {
          if(result == 0){
            member.increment(function(result){
              chkJoinForm(id,req.body.pw,email,req.body.name,req.body.phone)
              var mem = new member();
              mem._id = result +1;
              mem.id = id;
              mem.pw = makeCrypto(req.body.pw);
              mem.email = email;
              mem.name = req.body.name;
              mem.phone = req.body.phone;
              mem.company = req.body.company;

              mem.save(function(err){
                if(err) throw err;
                return res.json({flag:true,result:'가입 성공'});;
              })
            });
          }
          else
            return res.json({flag:false,result:'이미 가입된 email입니다.'});
        });
      }
      else
        return res.json({result:'이미 가입된 id입니다.'});
    });
  };


module.exports.searchUser = function(req,res,next) {
  member.findOneByID(req.body,function(result){
    if(result){
      console.log(result);
      res.json({flag:true,doc:result})
    }else
      res.send(false)
  })
};

module.exports.editUser = function(req,res,next){
  var body = req.body
  var obj = {}
  // console.log(body);
  if(body.projectNum){
    var returnVal = "";
    var arr = body.projectNum.split(',')
    callbackFnc(arr,returnVal)

    //recursive function
    function callbackFnc(arr,returnVal){
      var shifted  = arr.shift();
      project.findOneByNameCount(shifted ,function(result){
        if(result == 0){
          if(returnVal =="")
            returnVal += shifted
          else
            returnVal += ","+shifted
        }
        if(arr.length){
          callbackFnc(arr,returnVal)
        }else{

          if(returnVal == ""){
            var originalItem = body.projectNum.split(',');
            console.log(originalItem);
            obj.status = body.status;
            obj.projectNum = originalItem;
            //
            member.modify(body._id,obj,function (result) {
              console.log(result);
            })
            return res.send(true)
          }
          else{
            var removeItem = returnVal.split(',');
            var originalItem = body.projectNum.split(',');
            for (var value of removeItem) {
              var pos = originalItem.indexOf(value);
              originalItem.splice(pos, 1);
            }
            return res.json({removeItem: removeItem,originalItem : originalItem })
          }
        }
      })
    }
  }else{
    obj.status = body.status
    member.modify(body._id,obj,function (result) {
      console.log(result);
    })
    return res.send(true)
  }
}
