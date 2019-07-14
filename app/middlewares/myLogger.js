const myLogger = function (req, res, next) {
  console.log('login ip', req.ip)
  next()
}

module.exports = myLogger