var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Boards = new Schema ({
  _id : { type : Number , required : true},  // indexing
  category : { type : String , required : true},    // subject notice  // Subjects_id  // indexing
  categories : { type : String , required : true},  // each chapters notice // chapters categories  // indexing
  name : { type : String , required : true},
  title : { type : String , required : true},
  content : { type : String , required : true},
  regdate : { type: Date, default: Date.now },
  readed : {type:Number,default:0},
  originalFileName : {type:String},
  currentFileName : {type:String},
  filePath : {type:String}
})

var Subjects = new Schema ({
  _id : { type : String, required : true},    // indexing
  subject : {type:String},
  count : Number,
  index: Number
})

var projectSchema = new Schema ({
  _id: { type : Number , unique : true, required : true},
  project : { type : String , required : true,unique : true },  // indexing
  board : [Boards],
  subjects : [Subjects]

})

projectSchema.statics.increment = function (val,cb) {
    var that = this
    var condition = {"_id":-1}
    //return this.findOneAndUpdate(counter, { $inc: { index: 1 } }, {new: true, upsert: true, select: {index: 1}}, callback);
    this.findOne({project:val}).count(function(err,count){
      if(err) throw cb(err)
      if(count == 1)
        cb("false")
      else{
        that.find({}).count(function(err,count){
          if(err) throw err;
          if(count > 0){
            cb(count)
          }else{
            cb(0)
          }
        })
      }
    })
};

projectSchema.statics.findAll = function (cb) {

  var condition = {"_id":-1}
  this.aggregate([
    {$sort : {'_id':-1}},
    {$limit : 20}
  ]).exec(function(err, members) {
    if (err) throw err;
        if (members) {
            cb(members);
        } else {
            cb("empty data");
        }
    })
}
// by name
projectSchema.statics.findOneByName = function(val,cb){
  this.findOne({project:val},function(err,doc){
    if(err) throw cb(err);
    cb(doc);
  })
}
projectSchema.statics.findOneByNameCount = function(val,cb){
  return this.findOne({project:val}).count(function(err,doc){
    if(err) throw cb(err);
    cb(doc);
  })
}
projectSchema.statics.findMultiByName = function(projects,cb){
  try {
    var pattearn = projects.replace(',','|')
    this.find({
      'project': {$regex : pattearn }
    },function(err,result){
      if(err) cb(err)
      cb(result)
    })
  } catch (e) {
    console.log(e);
    cb(e)
  } finally {

  }
}
//by _id
projectSchema.statics.findOneByID = function(val,cb){
  return this.findOne({_id:val},function(err,doc){
    if(err) throw cb(err);
    cb(doc);
  })
}

projectSchema.statics.addSubjects = function(body,cb){
  let count  = body.count;
  var that = this;
  var pushData = []
  var pattern="";
  for (var i = 1; i <= count; ++i) {
    var data = JSON.parse( body["data_"+i])
    pushData.push({_id:data._id,subject:data.subject,count:data.count,index:(i-1)})
    if(pattern!="")
      pattern += "|^" + data._id
    else
      pattern = "^" + data._id
  }

  this.update(
     { _id: body.project },
     {
        $set : { subjects : []}
    },
    { "multi": true }
   ,function(err,result){
     that.update(
        { _id: body.project },
        {
          $push: {
            subjects:
            {
               $each: pushData,
               $sort: { index: 1 }

            }
          }
        },function(err,result){
          if(err) cb(false)
          cb(result)
        }
     )
   })
}

projectSchema.statics.modify = function(id,data,cb){
  this.update({'_id':id}, {$set: data}, {upsert: true}, function(err,result){
    if (err) throw cb(err);
    cb(result)
  })
}

projectSchema.statics.findBoardByCategories = function(PageInfo,cb){
  var that = this;
  var pushData = []
  var pattern="";
  var project_id = PageInfo[0].split("_")[1]
  var category = PageInfo[0].split("id_")[1]
  var categories = "";
  var pageItem = PageInfo[1].split('_')
  var limit = 5;

  switch (Number(pageItem[3])) {
    case 0:
      categories = category +"_" + pageItem[0] +"_first"
      break;
    case 1:
      categories = category +"_" + pageItem[0] +"_fixed"
      break;
    default:
      categories = category +"_" + pageItem[0] +"_last"
  }
  console.log(categories);
  //수정필요 match part
  this.aggregate([
    {
      $match:{_id: { $in:[Number(project_id)] }}
    },
    {
      $project : {
        _id:0,
        Board: {
          $filter: {
            input : "$board",
            as:"item",
            cond: { $eq: [ "$$item.categories", categories ] }
          }
        }
      }
    },
    {
      $project : {
        Board:1,
        BoardSize:{$size : "$Board"}
      }
    },
    {
      $unwind: { path: "$Board", includeArrayIndex: "arrayIndexindex" }
    },
    {
      $project : { Board:1,arrayIndexindex:1,BoardSize:1,

        "Date": {
                     "$let": {
                         "vars": {
                             "local_time": {
                                 "$subtract": [
                                     "$Board.regdate",
                                     -32400000
                                 ]
                             }
                         },
                         "in": {
                             "year": {
                                 "$year": "$$local_time"
                             },
                             "month": {
                                 "$month": "$$local_time"
                             },
                             "day": {
                                 "$dayOfMonth": "$$local_time"
                             },
                             "hour": { "$hour": "$$local_time" },
                             "minutes": { "$minute": "$$local_time" }
                         }
                     }
                 }
      }
    },
    {
      $sort : {"arrayIndexindex" :-1}
    },
    {
      $skip : 0
    },
    {
      $limit : limit
    }
  ]).exec(function(err, doc) {
    if (err) throw cb(err)
    cb(doc)

  })

}


projectSchema.statics.boardCount = function(cb){
  this.aggregate([
    {
      $match:{_id: { $in:[Number(project_id)] }}
    },
    {
      $project : {
        _id:0,
        Board: {
          $filter: {
            input : "$board",
            as:"item",
            cond: { $eq: [ "$$item.categories", pushData.categories ] }
          }
        }
      }
    },
    {
      $unwind: { path: "$Board"}
    },
    {
      $count: "Board"
    }
  ]).exec(function(err, doc) {
      if (err) throw cb(err)
      if(doc.length){
        var _id = doc[0].Board
        cb = _id + 1;
      }else{
        cb = 1;
      }
    })
}

projectSchema.statics.writeBoard = function(project_id,pushData,cb){
  var that = this;
  this.aggregate([
    {
      $match:{_id: { $in:[Number(project_id)] }}
    },
    {
      $project : {
        _id:0,
        board: 1
      }
    },
    {
      $unwind: { path: "$board"}
    },
    {
      $count: "board"
    }
  ]).exec(function(err, doc) {
      if (err) throw cb(err)
      console.log(doc);
      if(doc.length){
        var _id = doc[0].board;
        pushData._id = _id + 1;
      }else{
        pushData._id = 1;
      }
      writeAction();
    })
  function writeAction(){
    var pushArr = []
    pushArr.push(pushData)
    that.update(
          { _id: project_id },
          {
            $push: {
              board:
              {
                 $each: pushArr
                //  $sort: { index: 1 }
              }
            }
          },function(err,result){
            if(err) cb(false)
            cb(true)
          }
       )
  }

  // this.update(
  //    { _id: 1},
  //    {
  //       $set : { board : []}
  //   },
  //   { "multi": true }
  //  ,function(err,result){
  //    console.log(result);
  //  }
  // )


  // that.update(
  //       { _id: project_id },
  //       {
  //         $push: {
  //           board:
  //           {
  //              $each: pushArr
  //             //  $sort: { index: 1 }
  //           }
  //         }
  //       },function(err,result){
  //         if(err) cb(false)
  //         cb(result)
  //       }
  //    )
}

projectSchema.statics.readOneDocument = function(project_id,board_id,cb){
  var that = this;
  this.aggregate([
    {
      $match:{_id: { $in:[Number(project_id)] }}
    },
    {
      $project : {
        _id:0,
        Board: {
          $filter: {
            input : "$board",
            as:"item",
            cond: { $eq: [ "$$item._id", Number(board_id) ] }
          }
        }
      }
    },
    {
      $unwind: { path: "$Board"}
    },
  ]).exec(function(err, doc) {
    cb(doc)
  })
}


module.exports = mongoose.model('Project', projectSchema);
