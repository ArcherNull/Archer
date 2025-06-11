import { LicenseManager } from 'ag-grid-enterprise';

// 以下代码是破解的api必须要加
LicenseManager.prototype.validateLicense = () => true;
LicenseManager.prototype.isDisplayWatermark = () => false;
LicenseManager.prototype.getWatermarkMessage = () => 'Faker出品';
