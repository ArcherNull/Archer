/*
 * @Author: Null
 * @Date: 2022-05-16 08:50:58
 * @Description:  读取文件
 */

const fs = require('fs')
const path = require('path')
const getPathInfo = (p) => path.parse(p)

/**
 * @description: fs模块读取文件
 * @param filePath 文件路径
 * @param decode 编码格式 默认 utf8
 * @return {*}
 */
function readFileFun(filePath, decode = 'utf8') {
  return new Promise((resolve, reject) => {
    if (filePath) {
      fs.readFile(filePath, decode, function (err, dataStr) {
        if (err) {
          console.log('读取文件失败！')
          resolve(false)
        } else {
          //   console.log("读取文件成功", dataStr);
          resolve(dataStr)
        }
      })
    } else {
      console.log('文件路径不存在')
      reject(false)
    }
  })
}

/**
 * @description: 写入文件内容，并生成对应的文件
 * @param filePath 文件路径
 * @param dataStr 写入文件的内容
 * @param isFileExisted 判断文件是否存在
 * @return {*}
 */
function parseFile(filePath, dataStr) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      if (dataStr) {
        fs.writeFile(filePath, dataStr, function (err) {
          if (err) {
            console.log('读取文件失败！')
            resolve(false)
          } else {
            console.log('文件写入成功', filePath)
            resolve(true)
          }
        })
      } else {
        console.log('文件内容不能为空')
        reject(false)
      }
    } else {
      console.log('新增文件的路径不能为空')
      reject(false)
    }
  })
}

/** 【废弃】
 * @description: 解析java文件中的字段名和字段中文名  【补充】 此方法存在字段名和字段值对不齐的情况，可能跟数组中自动排序有关
 * @param dataStr java文件文本
 * @return {*}
 */
function textToJson1(dataStr) {
  return new Promise((resolve, reject) => {
    if (dataStr) {
      // 匹配titles
      const regTitles = /(?<=@ApiModelProperty\(").*?(?="\))/g
      const titleList = dataStr.match(regTitles).map((ele) => ele.split(';')[0])
      console.log('提取的titleList', titleList)

      // 匹配fields
      const regFields =
        /(?<=private [String|BigDecimal|Long|LocalDateTime|Integer]).*?(?=;)/g
      // 如果是ts的话，这里可以取后端的类型声明做自己的类型声明
      const fieldList = dataStr.match(regFields).map((ele) => ele.split(' ')[1])
      console.log('提取的fieldList', fieldList)

      // 字段与字段名拼接
      const fieldContent = (fieldList, titleList) => {
        let obj = {}
        fieldList.forEach((ele, ind) => {
          obj[ele] = titleList[ind]
        })
        return obj
      }

      // 获取表名
      const regDatabaseName = /(?<=@ApiModel\(").*?(?="\))/
      const databaseName = dataStr.match(regDatabaseName)[0]
      // console.log('获取表名', databaseName)

      const getJsonContent = fieldContent(fieldList, titleList)
      console.log('填充json文件的内容', getJsonContent)

      const jsonData = {
        name: databaseName,
        data: getJsonContent,
      }

      // console.log('json文件内容', jsonData)
      resolve(jsonData)
    } else {
      console.error('解析文件内容不能为空！')
      reject(false)
    }
  })
}

/** 【废弃】
 * @description: 解析java文件中的字段名和字段中文名
 * @param dataStr java文件文本
 * @return {*}
 */
function textToJson2(dataStr) {
  return new Promise((resolve, reject) => {
    if (dataStr) {
      // 匹配titles
      const regMain = /(?<=\{)[^}]*(?=\})/ // 匹配花括号内的字符串
      const main = regMain.exec(dataStr)

      // 解析出字段名跟字段
      const regField = /(?<=@ApiModelProperty\(")[^\;]*(?=\;)/g
      const fieldArr = main[0].match(regField)

      console.log('fieldArr=======>', fieldArr)

      // 拼装数组
      const assembleArr = fieldArr.map((ele) => {
        const splitArr = ele.split('")\r\n')
        console.log('splitArr======>', splitArr)
        const getInd = splitArr[1].lastIndexOf(' ')
        const sliceStr = splitArr[1].slice(getInd + 1)
        return [sliceStr, splitArr[0]]
      })
      const getJsonContent = Object.fromEntries(assembleArr)
      console.log('获取得到的json文件内容', getJsonContent)

      // 获取表名
      const regDatabaseName = /(?<=@ApiModel\(").*?(?="\))/
      const databaseName = dataStr.match(regDatabaseName)[0]

      const jsonData = {
        name: databaseName,
        data: getJsonContent,
      }

      // console.log('json文件内容', jsonData)
      resolve(jsonData)
    } else {
      console.error('解析文件内容不能为空！')
      reject(false)
    }
  })
}

/**
 * @description: 解析java文件中的字段名和字段中文名 【重要】
 * @param dataStr java文件文本
 * @return {*}
 */
function textToJson3(dataStr) {
  return new Promise((resolve, reject) => {
    if (dataStr) {
      // 匹配titles
      const regMain = /(?<=\{)[^}]*(?=\})/ // 匹配花括号内的字符串
      const main = regMain.exec(dataStr)
      // console.log('main======>', main)

      // 解析出字段名跟字段
      const regField = /(?<=\/\*\*)[^\;]*[a-zA-Z](?=\;)/g
      const fieldArr = main[0].match(regField)

      // 拼装数组
      const regChinese = /[\u4e00-\u9fa5A-Za-z0-9\(\)]/g

      const assembleArr = fieldArr.map((ele) => {
        const split = ele.split('*/')
        const title = split[0]?.match(regChinese)?.join('')
        const getInd = split[1]?.lastIndexOf(' ')
        const field = split[1]?.slice(getInd + 1)
        return [field, title]
      })
      const getJsonContent = Object.fromEntries(assembleArr)
      // console.log('获取得到的json文件内容',getJsonContent)

      // 获取表名
      const regDatabaseName = /(?<=@ApiModel\(").*?(?="\))/
      const databaseName = dataStr.match(regDatabaseName)?.[0]

      const jsonData = {
        name: databaseName,
        data: getJsonContent,
      }

      console.log('json文件内容=====>', jsonData)
      resolve(jsonData)
    } else {
      console.error('解析文件内容不能为空！')
      reject(false)
    }
  })
}

/**
 * @description: 解析java文件中的字段名和字段中文名 【重要】
 * @param dataStr java文件文本
 * @return {*}
 */
function textToJson(dataStr) {
  return new Promise((resolve, reject) => {
    if (dataStr) {
      // 匹配titles
      const regMain = /(?<=\{)[^}]*(?=\})/ // 匹配花括号内的字符串
      const main = regMain.exec(dataStr)

      const fieldArr = main[0].split('/**')
      const assembleArr = fieldArr
        .map((ele) => {
          const title = ele.match(/(?<=\* ).*?(?=\r\n)/)?.[0] || ''
          const field = ele
            .match(/(?<=private ).*?(?=\;\r\n)/)?.[0]
            ?.split(' ')?.[1]
          return [field, title]
        })
        .filter((ele) => Boolean(ele[0]))

      console.log('assembleArr', assembleArr)

      const getJsonContent = Object.fromEntries(assembleArr)
      // console.log('获取得到的json文件内容',getJsonContent)

      // 获取表名
      const regDatabaseName = /(?<=@ApiModel\(").*?(?="\))/
      const databaseName = dataStr.match(regDatabaseName)?.[0]

      const jsonData = {
        name: databaseName,
        data: getJsonContent,
      }

      console.log('json文件内容=====>', jsonData)
      resolve(jsonData)
    } else {
      console.error('解析文件内容不能为空！')
      reject(false)
    }
  })
}

/**
 * @description: 将java文件转换为json文件
 * @param filename 文件名
 * @param isCoverFileExisted 是否覆盖存在的文件
 * @return {*}
 */
function convertJavaFileToJsonFile(filename = '', isCoverFileExisted = false) {
  return new Promise((resolve, reject) => {
    if (filename) {
      const publicPath = './public'
      const readJavaFilePath = '/java'
      const makeJsonFilePath = '/json'
      // 阅读文件
      // './public/java/OtherReportVo.java'  ./public/json/OtherReportVo.json
      const javaPath = publicPath + readJavaFilePath + '/' + filename + '.java'
      const jsonPath = publicPath + makeJsonFilePath + '/' + filename + '.json'

      isFileExisted(jsonPath)
        .then((res) => {
          if (isCoverFileExisted) {
            return readFileFun(javaPath)
          } else {
            // console.log("检测新建的文件是否存在", res);
            if (!res) {
              return readFileFun(javaPath)
            } else {
              return Promise.reject(false)
            }
          }
        })
        .then((res) => {
          if (res) {
            // console.log("提取得到的java文件内容", res);
            return textToJson(res)
          } else {
            return Promise.reject(false)
          }
        })
        .then((res) => {
          // console.log("获取到jsonData", res);
          if (res) {
            // 打开创建文件==============> 【重要】
            return parseFile(jsonPath, JSON.stringify(res))
          } else {
            return Promise.reject(false)
          }
        })
        .then((res) => {
          console.log('文件解析成功==============>', res)
        })
        .catch((res) => {
          console.error('转换出错', res)
        })
    } else {
      console.log('被解析的文件名filename不能为空')
      reject(false)
    }
  })
}

/**
 * @description: 创建文件夹名
 * @param dirname 文件夹名
 * @return {*}
 */
function makeDir(dirname) {
  console.log('__dirname', dirname)
  if (dirname) {
    fs.mkdir(dirname, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log('创建目录成功')
      }
    })
  } else {
    console.log('请输入创建文件夹的路径')
  }
}

/**
 * @description: 判断文件是否存在
 * @param {String} path 文件路径
 * @return {*}
 */
function isFileExisted(path) {
  return new Promise((resolve, reject) => {
    const { F_OK, W_OK, R_OK } = fs.constants
    fs.access(path, F_OK | W_OK | R_OK, (err) => {
      if (err) {
        console.log('当前文件不存在===>', err)
        if (err.code === 'ENOENT') {
          console.log('fs.constants.F_OK表示====>不存在', F_OK)
          console.log('fs.constants.R_OK表示====>不可读', R_OK)
          console.log('fs.constants.W_OK表示====>不可写', W_OK)
          resolve(false) //"不存在"
        } else {
          resolve(false) //"不存在"
        }
      } else {
        console.log('当前文件存在,且可读可写')
        resolve(true) //"存在"
      }
    })
  })
}

/**
 * @description:
 * @param directory 目录文件夹
 * @param useSubdirectories 是否继续向该目录下的文件夹遍历文件
 * @param extList 文件夹名
 * @return {*}
 */
function enumerableFile(
  directory,
  useSubdirectories = false,
  extList = ['.java']
) {
  return new Promise((resolve, reject) => {
    const logFun = (text, val = false) => {
      console.log(`文件夹${directory}下未存在${extList.join('/')}文件`)
      reject(val)
    }
    if (path) {
      const filesList = []
      // 递归读取文件
      function readFileList(directory, useSubdirectories, extList) {
        const files = fs.readdirSync(directory)
        if (files && Array.isArray(files) && files.length) {
          files.forEach((item) => {
            const fullPath = path.join(directory, item)
            const stat = fs.statSync(fullPath)

            if (stat.isDirectory() && useSubdirectories) {
              readFileList(
                path.join(directory, item),
                useSubdirectories,
                extList
              )
            } else {
              const info = getPathInfo(fullPath)
              extList.includes(info.ext) && filesList.push(fullPath)
            }
          })
        } else {
          logFun(`文件夹${directory}下未存在${extList.join('/')}文件`)
        }
      }

      readFileList(directory, useSubdirectories, extList)
      // 生成需要的对象
      if (filesList.length) {
        const res = filesList.map((item) => ({
          path: item,
          ...getPathInfo(item),
        }))
        //  console.log(`遍历文件夹${directory}下的${extList.join('/')}文件`, res);
        resolve(res)
      } else {
        logFun(`文件夹${directory}下未存在${extList.join('/')}文件`)
      }
    } else {
      logFun(`读取文件夹名不能为空！`)
    }
  })
}

function createMkdirAndJsonFile(fileConfig) {
  // 首先创建一个空文件夹
  const { dirFilePath } = fileConfig
  if (dirFilePath) {
    makeDir(dirFilePath)
  } else {
    console.log('新建文件件路径不存在')
    // throw new Error('新建文件件路劲不存在')
  }
}

/**
 * @description: fs.stat 检测是文件还是文件
 * @param filePath 文件夹路径
 * @return {*}
 */
function checkFileOrDirectory(filePath) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      fs.stat(filePath, (err, data) => {
        if (err) {
          console.log('读取文件夹失败', err.message)
          reject(false)
        }
        const isFile = data.isFile()
        const isDirectory = data.isDirectory()
        console.log(`是文件：${isFile}`)
        console.log(`是目录：${isDirectory}`)
        const isFileOrDirectory = {
          isFile,
          isDirectory,
        }
        resolve(isFileOrDirectory)
      })
    } else {
      console.log('请输入文件路径')
      resolve(false)
    }
  })
}

/**
 * @description: 重命名文件
 * @param {*} filename
 * @param {*} reFilenamePath
 * @return {*}
 */
function rename(filename, reFilenamePath) {
  return new Promise((resolve, reject) => {
    fs.rename(filename, reFilenamePath, (err) => {
      if (err) {
        console.log('移动/重命名文件失败，' + err.message)
        reject(false)
      } else {
        console.log('移动/重命名文件成功')
        resolve(true)
      }
    })
  })
}

/**
 * @description:  删除目录【如果目录下面存在其它文件，需要先删除目录下的内容，再删除其目录】
 * @param {*} filename
 * @return {*}
 */
function rmdir(filename) {
  return new Promise((resolve, reject) => {
    fs.rmdir(filename, (err) => {
      if (err) {
        console.log('删除目录失败', err.message)
        reject(false)
      }
      console.log('删除目录成功')
      reject(true)
    })
  })
}

/**
 * @description: 删除文件 【如果目录下面存在其它文件，需要先删除目录下的内容，再删除其目录】
 * @param {*} filename
 * @return {*}
 */
function unlink(filename) {
  return new Promise((resolve, reject) => {
    fs.unlink(filename, (err) => {
      if (err) {
        console.log('删除文件失败', err.message)
        reject(false)
      } else {
        console.log('删除文件成功')
        resolve(true)
      }
    })
  })
}

/**
 * @description: 重命名文件后缀
 * @param {string} filePath 文件路径
 * @param {Object} converRules 转换规则 , 键为旧后缀名，值为新后缀名
 * @param {boolean} isBackupOldFile 是否备份旧文件，true 则表示为备份旧的，加入特定名称, false表示为不备份，直接替换
 * @return {*}
 */
function reExtname(
  filePath,
  converRules = {
    '.js': '.ts',
    '.jsx': '.tsx',
  },
  isBackupOldFile = false
) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      const oldExtNames = Object.keys(converRules)
      if (oldExtNames?.length) {
        const newExtNames = Object.values(converRules)
        const bool = newExtNames.every((ele) => Boolean(ele))
        if (bool) {
          isFileExisted(filePath)
            .then((res) => {
              const fileInfo = getPathInfo(filePath)

              console.log('fileInfo=====>', fileInfo)

              const { ext, name, dir } = fileInfo
              if (ext) {
                const newExtName = converRules[ext]
                if (newExtName) {
                  let newPath = `${dir}\\${name}${newExtName}`
                  let oldPath = filePath

                  // 如果需要备份旧文件
                  if (isBackupOldFile) {
                    // 如果已经备份，则不再备份
                    const backupName = 'backups'
                    if (filePath.indexOf(backupName) === -1) {
                      console.log('进入备份=====>')
                      const newBackupPath = `${dir}\\${name}-${backupName}${ext}`

                      fs.rename(oldPath, newBackupPath, (error) => {
                        if (error) {
                          reject('文件备份失败：', error)
                        }
                      })

                      oldPath = newBackupPath
                    }
                  }

                  fs.rename(oldPath, newPath, (error) => {
                    if (error) {
                      reject('文件重命名失败：', error)
                    } else {
                      console.log(`重命名成功,${filePath} ===> ${newPath}`)
                      resolve(newPath)
                    }
                  })
                } else {
                  reject('文件后缀名不满足转换匹配规则')
                }
              } else {
                reject('文件后缀名不存在，无法实现转换')
              }
            })
            .catch((res) => {
              console.error('重命名出错', res)
            })
        } else {
          reject('重命名文件后缀名不能为空')
        }
      } else {
        reject('重命名文件后缀名不能为空')
      }
    } else {
      reject('未获取到重命名文件路径')
    }
  })
}

/**
 * @description: 追加文件内容,内容追加在后面
 * @param {*} path 文件路径
 * @param {*} data 追加的文件内容
 * @return {*}
 */
function appendToEndData(path, data) {
  return new Promise((resolve, reject) => {
    if (path) {
      if (data) {
        // 创建一个可写入流
        const writeStream = fs.createWriteStream(path, {
          flags: 'a', // 使用 'a' 标志以追加模式写入文件
        })

        if (writeStream) {
          // 写入数据到文件末尾
          writeStream.write(data, 'utf8', (err) => {
            if (err) {
              console.log('数据已追加到文件失败')
              resolve('数据已追加到文件失败:', err)
            } else {
              // 关闭可写入流
              writeStream.end()
              resolve(path)
            }
          })
        } else {
          reject('可写流创建失败')
        }
      } else {
        reject('追加内容文件内容不能为空')
      }
    } else {
      reject('追加内容文件路径不能为空')
    }
  })
}

/**
 * @description: 追加文件头部内容,内容追加在前面
 * @param {*} path 文件路径
 * @param {*} data 追加的文件内容
 * @param {*} isRepeatWrite 是否重复写入
 * @param {*} escapeChar 转义字符
 * @return {*}
 */
function appendToHeadData(
  path,
  data,
  isRepeatWrite = false,
  escapeChar = '\n'
) {
  return new Promise((resolve, reject) => {
    if (path) {
      if (data) {
        readFileFun(path)
          .then((fileData) => {
            return Promise.resolve(fileData)
          })
          .then((fileData) => {
            const newData = `${data}${escapeChar}${fileData}`
            if (isRepeatWrite) {
              return parseFile(path, newData)
            } else {
              if (fileData.indexOf(data) === -1) {
                return parseFile(path, newData)
              } else {
                return Promise.reject('内容已追加，不可重复追加')
              }
            }
          })
          .then((res) => {
            console.log('追加内容成功：', res)
            res && resolve(path)
          })
          .catch((err) => {
            reject('追加头部内容失败：' + err)
          })
      } else {
        reject('追加内容文件内容不能为空')
      }
    } else {
      reject('追加内容文件路径不能为空')
    }
  })
}

/**
 * @description: 移除内容
 * @param {*} path 文件路径
 * @param {*} data 移除的文件内容
 * @return {*}
 */
function removeData(path, data) {
  return new Promise((resolve, reject) => {
    if (path) {
      if (data) {
        readFileFun(path)
          .then((fileData) => {
            return Promise.resolve(fileData)
          })
          .then((fileData) => {
            if (fileData.indexOf(data) !== -1) {
              const newData = fileData.replaceAll(data, '')
              return parseFile(path, newData)
            } else {
              return Promise.reject('未找到需要移除的数据，不可重复移除')
            }
          })
          .then((res) => {
            console.log('移除内容成功：', res)
            res && resolve(path)
          })
          .catch((err) => {
            reject('移除头部内容失败：' + err)
          })
      } else {
        reject('移除内容文件内容不能为空')
      }
    } else {
      reject('移除内容文件路径不能为空')
    }
  })
}

module.exports = {
  readFileFun,
  parseFile,
  textToJson,
  makeDir,
  convertJavaFileToJsonFile,
  enumerableFile,
  createMkdirAndJsonFile,
  isFileExisted,
  checkFileOrDirectory,
  rename,
  rmdir,
  unlink,
  reExtname,
  appendToEndData,
  appendToHeadData,
  removeData
}
