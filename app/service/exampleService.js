const Fetch = require('../util/fetch')

module.exports = {
  getTodoList (params = {}) {
    return Fetch.post({
      url: 'https://www.easy-mock.com/mock/5c35a2a2ce7b4303bd93fbda/example/todolist',
      data: params
    })
  }
}