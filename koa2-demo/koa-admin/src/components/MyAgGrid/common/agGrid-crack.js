/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-17 11:41:29
 * @LastEditTime: 2023-07-10 14:08:10
 * @Description: ag-grid-enterprise 破解方法
 */
import 'ag-grid-enterprise'
import { LicenseManager } from 'ag-grid-enterprise'

// 以下代码是破解的api必须要加
LicenseManager.prototype.validateLicense = () => true
LicenseManager.prototype.isDisplayWatermark = () => false
LicenseManager.prototype.getWatermarkMessage = () => 'Faker出品'
