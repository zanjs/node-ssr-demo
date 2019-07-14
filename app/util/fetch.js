let axios = require("axios")
const logger = require('../util/logger')

const baseURL = 'https://www.v2ex.com'

// 创建axios实例s
const service = axios.create({
    baseURL: baseURL, // api的base_url  process.env.BASE_API
    timeout: 20 * 1000 // 请求超时时间
})

function fetch (options) {
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      baseURL: options.baseURL || process.env.API_BASE_URL || baseURL,
      withCredentials: false, // 是否携带cookie
      timeout: 295000
    })
    // console.log('process.env', process)
    // instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
    console.log(options)
    let token = ''
    let cookie = options.cookie
    
    if (cookie) {
      token = cookie
    }
    // http request 拦截器
    instance.interceptors.request.use(
      config => {
        // config.headers.Authorization = 'Bearer ' + token
        config.data.Token = token
        logger.error('请求 url:', config.url , config.method||'get', JSON.stringify(config))
        return config
      },
      err => {
        console.warn(err)
        // 加入请求日志
	      logger.error('请求 url:', options.url , options.method||'get', JSON.stringify(err))
        return Promise.reject(err)
      })

    // http response 拦截器
    instance.interceptors.response.use(
      response => {
        return response
      },
      error => {
        if (error) {
        }
        return Promise.reject(error) // 返回接口返回的错误信息
      })

    // 请求处理
    instance(options)
      .then((res) => {
        // 请求成功时,根据业务判断状态
        /*  if (code === port_code.success) {
         resolve({code, msg, data})
         return false
         } else if (code === port_code.unlogin) {
         setUserInfo(null)
         router.replace({name: "login"})
         } */
        logger.info(res)
        resolve(res.data)
      })
      .catch((error) => {
        // 请求失败时,根据业务判断状态
        // Notice.error({
        //   title: '出错了！',
        //   desc: '错误原因 ' + JSON.stringify(error),
        //   duration: 0
        // })
        const bad = {
          error
        }
        reject(bad)
      })
  })
}

function post (options) {
  options.method = 'POST'
  if (!options.data) {
    options.data = {}
  }
  return fetch(options)
}

function get (options) {
  options.method = 'GET'
  if (!options.data) {
    options.data = {}
  }
  return fetch(options)
}

module.exports = {
  service,
  fetch,
  get,
  post,
}