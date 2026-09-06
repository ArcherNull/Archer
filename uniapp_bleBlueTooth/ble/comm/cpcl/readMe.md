<!--
 * @Author: Null 779217162@qq.com
 * @Date: 2025-10-08 15:54:52
 * @LastEditors: Null 779217162@qq.com
 * @LastEditTime: 2025-10-08 16:07:48
 * @FilePath: \Archer\uniapp_bleBlueTooth\pages\store\comm\cpcl\readme.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
## cpcl指令打印(通用)

微信小程序通用cpcl指令打印，但是app无法使用

base64gb2312.js文件是cpcl指令蓝牙打印的通用方法，可以打印的设备包含

汉印HM-A300L
芝柯CC3 / CS3

## 兼容性

只能够微信小程序使用，
```javascript
/**
 * 将CPCL指令转换成buff然后进行分包发送给打印机
 * @param {String} t cpcl指令
 * uni的app端不知道为啥在此无法使用转换，用uni.base64ToArrayBuffer还是我自己封装的都是无法转换，小程序就正常
 * 目前研究的结果就是app端将ArrayBuffer转换成了object类型，而且小程序是ArrayBuffer的string写入的
 */
function tfmbuffer(t) {
	// const base = require('@/common/base64gb2312.js');
	let a = []
	for (let n = 0; n < Math.ceil(t.length / 10); n++) {
		a[n] = base.base64ToArrayBuffer(base.encode64gb2312(t.substr(n * 10, 10)));
	}
	return a;
}

```