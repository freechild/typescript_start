module.exports.homelist = function(req,res) {
  res.render('test/index',{title : 'Home'});
};

module.exports.locationInfo = function(req,res) {
  res.render('test/index',{title : 'Location Info'});
};

module.exports.addReview = function(req,res) {
  res.render('test/index',{title : 'Add Review'});
};
