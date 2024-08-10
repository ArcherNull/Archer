/*
 * @Author: Null 779217162@qq.com
 * @Date: 2024-02-03 20:54:48
 * @LastEditors: Null 779217162@qq.com
 * @LastEditTime: 2024-02-03 21:17:56
 * @FilePath: \dashboard\convert\downloadImg.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const stream = require('stream')
// const { imgList } = require('./common/imgList')

const imgList = {
  简单柱状图:
    'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*fNFMRb3DlokAAAAAAAAAAAAADmJ7AQ/original',
  简单条形图:
    'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*sxEATqf3uoEAAAAAAAAAAAAADmJ7AQ/original',
}

// const reverseObj = (obj) => {
//   Object.fromEntries(Object.entries(obj).map((ele) => ele.reverse()))
// }

// const reImgList = reverseObj(imgList)

const promiseArr = []
Object.values(imgList).forEach((ele) => {
  promiseArr.push(axios.get(ele))
})

const fileNameArr = Object.keys(imgList)

const dealSingleFile = (res, ind) => {
  const writeStream = res.data
  const readStream = fs.createReadStream(writeStream)
  const fileName = fileNameArr[ind]
  const getPathUrl = (url) => path.join(__dirname, url)
  console.log('fileName=====>', fileName)
  const pathUrl = getPathUrl('./assets/' + fileName + '.jpg')
  // 创建一个新的可读流
  const writableStream = fs.createWriteStream(pathUrl)
  //   fs.writeFileSync(pathUrl, writeStream)
  readStream.pipe(writableStream)
}

Promise.all(promiseArr).then((result) => {
  //   console.log('res=====>', result)
  if (result?.length) {
    result.forEach((res, ind) => {
      dealSingleFile(res, ind)
    })
  }
})
