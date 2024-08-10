/*
 * @Author: junsong Chen
 * @Date: 2024-08-10 22:56:59
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-08-10 23:43:42
 * @Description: 入口文件
 */

const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const PORT = 3625
const fs = require('fs')

// 解析java文件转变为json文件
const {
  enumerableFile,
  reExtname,
  appendToHeadData,
  removeData,
} = require('./common/fs')

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*') //  只允许'http://127.0.0.1:8888'进行跨域请求 ， * 表示所有都可以
  res.header('Access-control-Allow-Headers', 'xCors')
  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,DELETE,PUT,OPTIONS,HEAD,FETCH'
  ) //允许的方法类型
  res.header('Access-Control-Max-Age', '10000') //一万秒内让浏览器不再发起OPTION预请求，直接发起正式请求
  next()
})

// cors
app.use(cors())

// 静态资源文件
app.use('/public', express.static('public'))

// 解析application/json格式数据的内置模块
app.use(express.json())
// 解析application/x-www-form-urlencoded 格式的内置中间件
app.use(express.urlencoded({ extended: false }))

const dirList = ['./base']

function convertFun(pathUrl) {
  // java文件转json文件
  const directory = path.join(__dirname, pathUrl)
  const list = []

  // 表示 .ts => .js  ; .tsx => .jsx
  const newConvertRules = {
    '.ts': '.js',
    '.tsx': '.jsx',
  }

  // 表示 .js => .ts  ; .jsx => .tsx
  const convertRules = {
    '.js': '.ts',
    '.jsx': '.tsx',
  }

  const rules = newConvertRules

  enumerableFile(directory, true, Object.keys(rules))
    .then((res) => {
      if (res) {
        res.forEach((ele) => {
          // 查看有多少满足条件的文件
          list.push(ele)
        })
        return Promise.resolve(list)
      } else {
        return Promise.reject('获取转换文件路径失败')
      }
    })
    .then((list) => {
      console.log('满足条件的文件=====>', list.length)
      const newPromiseList = []
      if (list?.length) {
        const { base } = path.parse(pathUrl)
        // 记录转换文件的路径
        fs.writeFileSync(`./${base}FileInfo.json`, JSON.stringify(list))

        list.forEach((ele) => {
          if (ele.path) {
            // 最后一个参数可以保留源文件
            const promiseItem = reExtname(ele.path, rules, false)
            newPromiseList.push(promiseItem)
          }
        })
      }

      return Promise.all(newPromiseList)
    })
    .then((newPathList) => {
      console.log('转换后所有文件新路径====>', newPathList)
      const newPromiseList = []
      // 给每个文件头部插入注释 ， // @ts-nocheck
      const appendData = '// @ts-nocheck'
      newPathList.forEach((pathUrl) => {
        const promiseItem = appendToHeadData(pathUrl, appendData)
        newPromiseList.push(promiseItem)
      })

      return Promise.all(newPromiseList)
    })
    .then((appendFilePathList) => {
      console.log('转换后所有文件新路径====>', appendFilePathList)
    })
    .catch((err) => {
      console.log('转换文件失败：' + err)
    })
}

dirList.forEach((ele) => {
  convertFun(ele)
})

// 错误级别中间件
app.use(function (err, req, res, next) {
  console.log('错误级别中间件', err.message)
  if (err.name === 'UnauthorizedError') {
    return res.send('无效的token!')
  }
  res.send('服务器发生错误，' + err.message)
})

app.listen(PORT, () => {
  console.log(`express server running at http://www.localhost:${PORT}`)
})
