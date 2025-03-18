/*
 * @Author: Null
 * @Date: 2022-05-16 08:50:58
 * @Description:  读取文件
 */

const fs = require("fs");
const path = require("path");
const getPathInfo = (p) => path.parse(p);

/**
 * @description: fs模块读取文件
 * @param filePath 文件路径
 * @param decode 编码格式 默认 utf8
 * @return {*}
 */
function readFileFun(filePath, decode = "utf8") {
  return new Promise((resolve, reject) => {
    if (filePath) {
      fs.readFile(filePath, decode, function (err, dataStr) {
        if (err) {
          console.log("读取文件失败！");
          resolve(false);
        } else {
          // console.log("读取文件成功", dataStr);
          resolve(dataStr);
        }
      });
    } else {
      console.log("文件路径不存在");
      reject(false);
    }
  });
}

/**
 * @description: 写入文件内容，并生成对应的文件
 * @param filePath 文件路径
 * @param dataStr 写入文件的内容
 * @return {*}
 */
function parseFile(filePath, dataStr) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      if (dataStr) {
        fs.writeFile(filePath, dataStr, function (err) {
          if (err) {
            console.log("写入文件内容失败！", err.message);
            reject(`写入文件内容失败: ${err.message}`);
          } else {
            console.log("写入文件内容成功", filePath);
            resolve(dataStr);
          }
        });
      } else {
        console.log("文件内容不能为空");
        reject("文件内容不能为空");
      }
    } else {
      console.log("新增文件的路径不能为空");
      reject(false);
    }
  });
}

/**
 * @description: 向文件追加内容
 * @param {*} filePath 文件路径
 * @param {*} dataStr 文件内容
 * @param {*} decode 编码方式
 * @return {*}
 */
function appendFile(filePath, dataStr, decode = "utf8") {
  return new Promise((resolve, reject) => {
    if (filePath) {
      if (dataStr) {
        fs.appendFile(filePath, dataStr, decode, function (err) {
          if (err) {
            console.log("读取文件失败！", err.message);
            resolve(false);
          } else {
            console.log("文件写入成功", filePath);
            resolve(true);
          }
        });
      } else {
        console.log("文件内容不能为空");
        reject(false);
      }
    } else {
      console.log("新增文件的路径不能为空");
      reject(false);
    }
  });
}

/**
 * @description: 创建文件夹名
 * @param dirname 文件夹名
 * @return {*}
 */
function makeDir(dirname) {
  console.log("__dirname", dirname);
  if (dirname) {
    fs.mkdir(dirname, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("创建目录成功");
      }
    });
  } else {
    console.log("请输入创建文件夹的路径");
  }
}

/**
 * @description: 判断文件是否存在
 * @param {String} path 文件路径
 * @return {*}
 */
function isFileExisted(path) {
  return new Promise((resolve, reject) => {
    const { F_OK, W_OK, R_OK } = fs.constants;
    fs.access(path, F_OK | W_OK | R_OK, (err) => {
      if (err) {
        console.log("当前文件不存在===>", err);
        if (err.code === "ENOENT") {
          console.log("fs.constants.F_OK表示====>不存在", F_OK);
          console.log("fs.constants.R_OK表示====>不可读", R_OK);
          console.log("fs.constants.W_OK表示====>不可写", W_OK);
          resolve(false); //"不存在"
        } else {
          resolve(false); //"不存在"
        }
      } else {
        console.log("当前文件存在,且可读可写");
        resolve(true); //"存在"
      }
    });
  });
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
  extList = [".java"]
) {
  return new Promise((resolve, reject) => {
    try {
      const logFun = (text, val = false) => {
        console.log(text);
        reject(text);
      };
      if (path) {
        const filesList = [];
        // 递归读取文件
        function readFileList(directory, useSubdirectories, extList) {
          const files = fs.readdirSync(directory);
          if (files && Array.isArray(files) && files.length) {
            files.forEach((item) => {
              const fullPath = path.join(directory, item);
              const stat = fs.statSync(fullPath);

              console.log("stat.isDirectory()", stat.isDirectory());

              if (stat.isDirectory() && useSubdirectories) {
                readFileList(
                  path.join(directory, item),
                  useSubdirectories,
                  extList
                );
              } else {
                const info = getPathInfo(fullPath);
                extList.includes(info.ext) && filesList.push(fullPath);
              }
            });
          } else {
            console.log(`文件夹${directory}下未存在${extList.join("/")}文件`);
          }
        }

        readFileList(directory, useSubdirectories, extList);
        // 生成需要的对象
        if (filesList?.length) {
          const res = filesList?.map((item) => ({
            path: item,
            ...getPathInfo(item),
          }));
          //  console.log(`遍历文件夹${directory}下的${extList.join('/')}文件`, res);
          resolve(res);
        } else {
          logFun(`文件夹${directory}下未存在${extList.join("/")}文件`);
        }
      } else {
        logFun(`读取文件夹名不能为空！`);
      }
    } catch (err) {
      logFun(`enumerableFile方法出错,${err}`);
    }
  });
}

/**
 * @description: 遍历文件，返回满足条件的文件路径以及不满足条件空文件路径
 * @param directory 目录文件夹
 * @param useSubdirectories 是否继续向该目录下的文件夹遍历文件
 * @param extList 文件夹名
 * @return {*}
 */
function enumerableWriteFile(
  directory,
  useSubdirectories = false,
  convertRules
) {
  return new Promise((resolve, reject) => {
    const extList = Object.keys(convertRules);
    const extFileList = Object.values(convertRules);

    const logFun = (text, val = false) => {
      console.log("错误");
      reject(val);
    };

    if (path) {
      // 已存在文件列表
      const existedFileList = [];
      // 不存在文件列表
      const nonExistedFileList = [];
      // 递归读取文件
      function readFileList(directory, useSubdirectories, extList) {
        const files = fs.readdirSync(directory);
        if (files && Array.isArray(files) && files.length) {
          files.forEach((item) => {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);
            // 目录
            if (stat.isDirectory() && useSubdirectories) {
              readFileList(fullPath, useSubdirectories, extList);
            } else {
              // 文件
              const { ext } = getPathInfo(fullPath);
              if (extList.includes(ext)) {
                existedFileList.push(fullPath);
              } else {
                extList.forEach((ele) => {
                  nonExistedFileList.push(
                    path.join(directory, convertRules[ele])
                  );
                });
              }

              const diffArr = extFileList.filter(
                (baseName) => !files.includes(baseName)
              );

              if (diffArr.length) {
                diffArr.forEach((ele) => {
                  nonExistedFileList.push(path.join(directory, ele));
                });
              }
            }
          });
        } else {
          extList.forEach((ele) => {
            nonExistedFileList.push(
              path.join(directory, convertRules[ele])
            );
          });
        }
      }

      readFileList(directory, useSubdirectories, extList);

      const pathList = {
        existedFileList,
        nonExistedFileList,
      };
      console.log("输出文件路径：", pathList);
      resolve(pathList);
    } else {
      logFun(`读取文件夹名不能为空！`);
    }
  });
}

/**
 * @description: 创建一个文件夹，并创建一个json文件
 * @param {*} fileConfig
 * @return {*}
 */
function createMkdirAndJsonFile(fileConfig) {
  // 首先创建一个空文件夹
  const { dirFilePath } = fileConfig;
  if (dirFilePath) {
    makeDir(dirFilePath);
  } else {
    console.log("新建文件件路径不存在");
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
          console.log("读取文件夹失败", err.message);
          reject(false);
        }
        const isFile = data.isFile();
        const isDirectory = data.isDirectory();
        console.log(`是文件：${isFile}`);
        console.log(`是目录：${isDirectory}`);
        const isFileOrDirectory = {
          isFile,
          isDirectory,
        };
        resolve(isFileOrDirectory);
      });
    } else {
      console.log("请输入文件路径");
      resolve(false);
    }
  });
}

/**
 * @description: 创建可读流
 * @param {*} filePath
 * @return {*}
 */
function createReadStream(filePath) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      console.log("filePath", filePath);
      // 创建可读流
      const reader = fs.createReadStream(filePath);
      if (reader) {
        resolve(reader);
      } else {
        reject("创建可读流失败");
      }
    } else {
      console.log("请输入文件路径");
      reject("请输入文件路径");
    }
  });
}

/**
 * @description: 创建可写流
 * @param {*} filePath
 * @return {*}
 */
function createWriteStream(filePath) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      console.log("filePath", filePath);
      const writer = fs.createWriteStream(filePath);
      if (writer) {
        resolve(writer);
      } else {
        reject("创建可写流失败");
      }
    } else {
      console.log("请输入文件路径");
      reject("请输入文件路径");
    }
  });
}

/**
 * @description: 创建目录
 * @param {*} fPath , 可传递单个路径或者数组路径
 * @return {*}
 */
async function createDir(fPath) {
  if (fPath) {
    const createSingleDir = async (filePath) => {
      const isFileExistedBool = await isFileExisted(filePath);
      !isFileExistedBool && (await makeDir(filePath));
      return true;
    };

    if (Array.isArray(fPath) && fPath?.length !== 0) {
      const promiseArr = fPath.map((ele) => createSingleDir(ele));
      return await Promise.race(promiseArr);
    } else {
      return await createSingleDir(fPath);
    }
  } else {
    return Promise.reject("未获取到文件路径");
  }
}

/**
 * @description: 检查文件是否存在，如果文件存在，则追加内容，不存在则创建文件
 * @param {*} filePath
 * @param {*} dataStr
 * @return {*}
 */
async function checkFileIsExistAndCreate(filePath, dataStr) {
  if (filePath) {
    try {
      const isFileExist = await isFileExisted(filePath);
      // 如果文件存在，则追加内容，不存在则创建文件
      if (isFileExist) {
        const res = await appendFile(filePath, dataStr);
        return res;
      } else {
        const res = await parseFile(filePath, dataStr);
        return res;
      }
    } catch (err) {
      console.log("checkFileIsExistAndCreate方法调用失败");
      return false;
    }
  } else {
    console.log("文件的路径不能为空");
    return false;
  }
}

/**
 * @description: 删除文件
 * @param {*} filePath 文件路径
 * @return {*}
 */
async function unlinkFile(filePath) {
  if (filePath) {
    try {
      const isFileExist = await isFileExisted(filePath);

      if (isFileExist) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log("unlink方法 , 文件删除失败");
            return false;
          } else {
            console.log("文件已删除");
            return true;
          }
        });
      } else {
        console.log("unlink方法,文件不存在，调用失败");
        return false;
      }
    } catch (error) {
      console.log("unlink方法调用失败");
      return false;
    }
  } else {
    console.log("请输入要删除的文件路径");
    return false;
  }
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
          flags: "a", // 使用 'a' 标志以追加模式写入文件
        });

        if (writeStream) {
          // 写入数据到文件末尾
          writeStream.write(data, "utf8", (err) => {
            if (err) {
              console.log("数据已追加到文件失败");
              resolve("数据已追加到文件失败:", err);
            } else {
              // 关闭可写入流
              writeStream.end();
              resolve(true);
            }
          });
        } else {
          reject("可写流创建失败");
        }
      } else {
        reject("追加内容文件内容不能为空");
      }
    } else {
      reject("追加内容文件路径不能为空");
    }
  });
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
  escapeChar = "\n"
) {
  return new Promise((resolve, reject) => {
    if (path) {
      if (data) {
        readFileFun(path)
          .then((fileData) => {
            return Promise.resolve(fileData);
          })
          .then((fileData) => {
            const newData = `${data}${escapeChar}${fileData}`;
            if (isRepeatWrite) {
              return parseFile(path, newData);
            } else {
              if (fileData.indexOf(data) === -1) {
                return parseFile(path, newData);
              } else {
                return Promise.reject("内容已追加，不可重复追加");
              }
            }
          })
          .then((res) => {
            console.log("追加内容成功：", res);
            res && resolve(true);
          })
          .catch((err) => {
            reject("追加头部内容失败：" + err);
          });
      } else {
        reject("追加内容文件内容不能为空");
      }
    } else {
      reject("追加内容文件路径不能为空");
    }
  });
}


module.exports = {
  readFileFun,
  parseFile,
  appendFile,
  makeDir,
  enumerableFile,
  enumerableWriteFile,
  createMkdirAndJsonFile,
  isFileExisted,
  checkFileOrDirectory,
  createReadStream,
  createWriteStream,
  checkFileIsExistAndCreate,
  createDir,
  unlinkFile,
  reExtname,
  appendToEndData,
  appendToHeadData,
  fs,

};
