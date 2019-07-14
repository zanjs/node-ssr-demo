var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user/user.html', {
    title: '用户页'
  })
});

module.exports = router;
