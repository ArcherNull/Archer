/*
 * @Author: Null
 * @Date: 2022-10-25 08:39:49
 * @Description:
 */

// const admin = require('../package.json')
import * as admin from '../package.json'

// 系统版本
const version = admin.version
// 特殊变量前缀名
const prefixName = `${admin.name}-${version}`

export default {
  // 项目名
  name: admin.name,
  // 项目名简称
  abbreviateName: 'dk',
  // 项目版本
  version,
  // 前缀名
  prefixName
}
