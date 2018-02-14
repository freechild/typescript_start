var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memSchema = new Schema ({
  _id: { type : Number , unique : true, required : true}, //aggegate
  id :{type: String, required: true, index: true}, // aggegate
  pw :{
    type: String,
    required : true,
    // match:/^(?=.*[a-zA-Z])(?=.*[0-9]).{4,16}$/
  }, //aggegate
  email : { type : String , index:true, required : true }, //aggegate
  regdate : { type: Date, default: Date.now  },
  name : { type : String , required : true },
  phone : { type : Number , required : true },
  company : { type : String , required : true },

  status : { type: Number, default: 0  },  // have to change //aggegate
  projectNum : [{ type: String, default: 0  }] // index or aggegate
})

//member index
memSchema.statics.increment = function (cb) {
    var condition = {"_id":-1}
    //return this.findOneAndUpdate(counter, { $inc: { index: 1 } }, {new: true, upsert: true, select: {index: 1}}, callback);
    return this.find({}).count(function(err,count){
        if(err) throw err;
        if(count > 0){
          this.findOne({ }).sort(condition).exec( function(err, doc) {
            if(err) throw cb(1);
            else{
              var max = doc._id;
              cb(max)
            }
          });
        }else{
          cb(0)
        }
    })
};

// findAll members
memSchema.statics.findAll = function (cb) {

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

//findOne
memSchema.statics.findOneCollection = function(type,value,cb) {
  console.log("findOneCollection = " +type,value);
  return this.where(type, value).exec(function(err, doc) {
    if (err) throw err;
    cb(doc)
  });
}
//find Count
memSchema.statics.valueCheck = function (type,value,cb) {
  console.log('valueCheck = '+value);
  return this.where(type, value).count(function (err, count) {
    if (err) throw cb(err);
    cb(count)
  });
}
//login
memSchema.statics.loginForm = function (id,pw,cb) {
  return this.findOne({'id':id,'pw':pw}).count(function(err,count){
    cb(count)
  })
}

memSchema.statics.modify = function(id,data,cb){
  this.update({'_id':id}, {$set: data}, {upsert: true}, function(err,result){
    if (err) throw cb(err);
    cb(result)
  })
}

memSchema.statics.findOneByID = function(body,cb){
  return this.findOne({id:body.id},function(err,doc){
    if(err) throw cb(err);
    cb(doc);
  })
}


module.exports = mongoose.model('Member', memSchema);
