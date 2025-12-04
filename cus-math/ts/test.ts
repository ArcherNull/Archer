/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-12-04 09:18:20
 * @LastEditors: junsong Chen 779217162@qq.com
 * @LastEditTime: 2025-12-04 09:18:30
 * @FilePath: \Archer\cus-math\ts\test.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CusMath } from "./cusMath";
const cusMath = new CusMath();

const val = cusMath.expression("5+-7+1+1");
console.log("val", val);
