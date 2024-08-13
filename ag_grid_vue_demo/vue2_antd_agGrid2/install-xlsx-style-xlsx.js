/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-06 20:19:39
 * @LastEditTime: 2024-05-06 20:27:09
 * @Description: 
 */
 
const path = require('path')
const fs = require('fs')
 
const xlsxStyleModulesPath = path.join(__dirname, 'node_modules/xlsx-style/xlsx.js')
const xlsxStyleLibPath = path.join(__dirname, './src/lib/xlsx-style/xlsx.js')
 
fs.writeFileSync(xlsxStyleModulesPath, fs.readFileSync(xlsxStyleLibPath))