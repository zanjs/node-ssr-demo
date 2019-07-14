const router = require('express').Router();
// const cnodeService = require('../service/exampleService')
// const cnodeService = require('../service/cnodeService')
const v2exService = require('../service/v2exService')

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    let resp = await v2exService.getTopics();
    res.render('home/home', { title: '首页', list: resp });
  } catch (error) {
    console.log(error)
    res.send({'err': error})
  }
  
});

module.exports = router;
