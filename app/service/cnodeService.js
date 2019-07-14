const Fetch = require('../util/fetch')

module.exports = {
  getTopics (params = {}) {
    return Fetch.post({
      url: 'https://api.hk.6s.mu.gg/app/setting',
      data: params
    })
  }
}