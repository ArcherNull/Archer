/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-07-23 10:24:43
 * @LastEditTime: 2024-07-23 10:24:52
 * @Description: 
 */
const { v4: uuidv4 } = require('uuid');

/**
 * @description: 生成v4的UUID
 * @return {*}
 */
const genereateUUID = () => {
    // 生成一个随机的UUID
    const myUUID = uuidv4();
    console.log(myUUID); // 例如: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    return myUUID
}

exports.genereateUUID = genereateUUID