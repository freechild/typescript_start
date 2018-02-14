'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Design = new Schema({
  first: { type: Number, default: 0 },
  fixed: { type: Number, default: 0 },
  last: { type: Number, default: 0 }
});

var Storyboard = new Schema({
  first: { type: Number, default: 0 },
  fixed: { type: Number, default: 0 },
  last: { type: Number, default: 0 }
});

var Media = new Schema({
  first: { type: Number, default: 0 },
  fixed: { type: Number, default: 0 },
  last: { type: Number, default: 0 }
});

var Development = new Schema({
  first: { type: Number, default: 0 },
  fixed: { type: Number, default: 0 },
  last: { type: Number, default: 0 }
});

var chapterSchema = new Schema({
  _id: { type: String, unique: true, required: true },
  index: { type: Number, unique: true, required: true },
  chapter: { type: String, default: 'fill in the title' },
  storyboard: [Storyboard],
  designs: [Design],
  media: [Media],
  development: [Development]
});

chapterSchema.statics.bulkWrite = function (body, cb) {
  try {
    var bulk = this.collection.initializeOrderedBulkOp();
    var CountSubject = body.count;
    if (CountSubject >= 1) {
      var tens = Math.floor(CountSubject * 0.1);
      var units = CountSubject % 10;

      if (tens == 0) {
        var pattern = body.project + '(_)([^1-' + units + ']|[1-9][0-9])(_)';
      } else {
        if (units == 9) {
          units = 0;
          tens += 1;
        } else units += 1;
        var pattern = body.project + '(_)([^1-9]|[^1-' + tens + '][0-9]|[' + tens + '-' + tens + '][' + units + '-9])(_)';
      }

      bulk.find({
        '_id': { $regex: pattern }
      }).remove();
    }

    for (var i = 0; i < CountSubject; ++i) {
      var data = JSON.parse(body["data_" + (i + 1)]);
      var chapterCount = data.count;
      for (var j = 0; j < chapterCount; ++j) {
        var id = data._id + "_" + (j + 1);
        bulk.find({ _id: id }).upsert().update({
          $set: { '_id': id, 'index': j + 1 }
        });
      }
      var tens = Math.floor(chapterCount * 0.1);
      var units = chapterCount % 10;
      if (chapterCount >= 10) {
        if (units == 9) {
          units = 0;
          tens += 1;
        } else units += 1;
        var pattern = data._id + '(_)([^1-9]$|[^1-' + tens + '][0-9]$|[' + tens + '-' + tens + '][' + units + '-9]$)';
      } else var pattern = data._id + '(_)([^1-' + chapterCount + ']$|[0-9][0-9]$)';

      bulk.find({
        '_id': { $regex: pattern }
      }).remove();
    }
  } catch (e) {
    cb(e);
  } finally {
    bulk.execute();
    cb(true);
  }
};

chapterSchema.statics.bulkUpdate = function (doc, cb) {
  try {
    var bulk = this.collection.initializeOrderedBulkOp();

    console.log('2');
    var chapterCount = doc.count;
    for (var i = 1; i <= chapterCount; ++i) {
      var data = JSON.parse(doc["data_" + i]);
      bulk.find({ _id: data._id }).upsert().updateOne({
        $set: { 'chapter': data.chapter }

      });
    }
  } catch (e) {
    cb(e);
  } finally {
    bulk.execute();
    cb(true);
  }
};

chapterSchema.statics.findChapterList = function (body, cb) {

  var pattern = '^' + body.project + '(_)' + body.curTaget + '(_)';
  console.log(pattern);
  this.aggregate([{ $match: { '_id': { $regex: pattern } } }, { $sort: { 'index': 1 } }]).exec(function (err, doc) {
    if (err) throw cb(err);
    if (doc) {
      console.log(doc);
      cb(doc);
    } else {
      cb(false);
    }
  });
};

chapterSchema.statics.findChapterLByID = function (_id, cb) {
  var pattern = "^" + _id;
  this.find({
    _id: { $regex: pattern }
  }).sort({ "count": 1 }).exec(function (err, doc) {
    if (err) cb(err);
    cb(doc);
  });
};

module.exports = mongoose.model('Chapters', chapterSchema);