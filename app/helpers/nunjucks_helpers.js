const nunjucks = require('nunjucks');
const moment = require('moment')

function setUpNunjucks(app) {
  const env = nunjucks.configure('views', {
    autoescape: true,
    express: app
  });

  // register custom helper
  env.addFilter('shorten', function(str, count) {
    return str.slice(0, count || 5);
  });
  // ... your other filters here
  env.addFilter('timeFormate',  (time, formate) => moment(time, false).format( formate || 'YYYY-MM-DD HH:mm:ss'))

}

module.exports = setUpNunjucks