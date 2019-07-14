const Fetch = require('../util/fetch')

module.exports = {
  getTopics (options = {}) {
    const url = '/api/topics/latest.json'
    options.url = url
    return Fetch.get(options)
  }
}