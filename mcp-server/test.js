/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-11-27 14:07:20
 * @LastEditors: junsong Chen 779217162@qq.com
 * @LastEditTime: 2025-11-27 14:07:24
 * @FilePath: \mcp-server\test.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const obj = {
    用例编号: '存放【用例编号】列的结果',
    用例标题: '存放【用例标题】列的结果',
    用例功能描述: '存放【用例功能描述】列的结果',
    '模块/项目功能': '存放【模块/项目功能】列的结果',
    优先级: '存放【优先级】列的结果',
    调试步骤: '存放【调试步骤】列的结果',
    调试数据: '存放【调试数据】列的结果',
    预期结果: '存放【预期结果】列的结果',
    实际结果: '存放【实际结果】列的结果'
}

for (let [key, field] of Object.entries(obj)) {
    console.log('key', key);
    console.log('field', field);
}