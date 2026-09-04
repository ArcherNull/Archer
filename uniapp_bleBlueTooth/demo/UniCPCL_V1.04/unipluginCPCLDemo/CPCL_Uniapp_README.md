#### CPCL 原生插件使用说明

1.复制nativeplugins文件夹到自己的项目中，在manifest中添加本地插件PrintModuleCPCL。

2.根据文档在代码中调用插件功能。

3.制作自定义调试基座，运行基座选择自定义基座，然后再运行调试。

#### CPCL 插件接口文档

##### 1.注册插件

```javascript
const printModule = uni.requireNativePlugin('PrintModuleCPCL');
```



##### 2.连接蓝牙

注意：该接口需要蓝牙权限，要去manifest中配置。

```js
printModule.connectionBT({address}, result => {const msg = JSON.stringify(result);
			modal.toast({message: msg,duration: 6});
})
*mac:蓝牙地址，例如："address":"00:15:83:EA:52:2E"。
*result:运行结果，0：连接成功，-1：连接失败，-2：参数错误，-3：握手失败。
```



##### 3.连接WIFI

```js
printModule.connectionWIFI({address}, result => {
  const msg = JSON.stringify(result);
	modal.toast({message: msg,duration: 6});
})
*address:打印机ip地址，例如："address":"192.168.1.1"。
*result:运行结果，0：连接成功，-1：连接失败，-2：参数错误，-3：握手失败。
```



##### 4.断开连接

```javascript
printModule.closeBT();
```



##### 5.设置SDK编码

```javascript
printModule.setLanguageEncode({'language':'GBK'},(ret) =>{})
*language:编码。
		中文：GBK
 		英文：UTF-8
```



##### 6.定位

```javascript
标签打印时起定位缝标作用（用在print接口之前）
printModule.printForm()
```



##### 7.标签开头

```javascript
printModule.printAreaSize({'height':'400','number':'1'},result =>{})
*height:标签高度（单位 点）
*bumber:打印次数
```



##### 8.打印

```javascript
printModule.print()//将标签中的内容打印
```



##### 9.打印图片

注意：该接口需要读写权限，要去manifest中配置。

```javascript
printModule.printBitmapPath({'x_pos':'0','y_pos':'0','path':'','halftoneType':1},(ret) => {});
*x_pos:横坐标。
*y_pos:纵坐标。
*path:图片本地路径。
*halftoneType:图片算法类型。
		0:二值算法。
    1:抖动算法。
*ret:运行结果。
```

另一种打印图片方式

```javascript
printModule.printBitmapBase64({'x_pos':'0','y_pos':'0','base64':'','halftoneType':1},(ret) => {});
*x_pos:横坐标。
*y_pos:纵坐标。
*base64:图片Base64字符串。
*halftoneType:图片算法类型。
		0:二值算法。
    1:抖动算法。
    2:聚集算法。 
*ret:运行结果。
```



##### 10.发送数据

```javascript
printModule.writeData({'bData':data},(ret) =>{})
*bData:数据。例如 var data = [0x0D,0x0A]
*ret:运行结果。
```



##### 11.读取数据

```javascript
printModule.readData({'time':2},(ret) =>{})
*time:超时时间（毫秒）。
*ret:运行结果。
```



##### 12.打印文本

```javascript
printModule.printText({'x_pos':'0','y_pos':'0','fontSize':'7','direction':'T','data':'测试'},result =>{});
*x_pos：横坐标。
*y_pos：纵坐标。
*fontSize：字体大小。
	55：16x16
  7 ：24x24
  4 ：32x32
*direction：方向。
   T = normal
   T90 = rotate 90 degrees clockwise
   T180 = invert 180 degrees
   T270 = read from bottom up-270 degrees
*data：文本数据。
```



##### 13.打印条码

```javascript
printModule.printBarCode({'x_pos':'0','y_pos':'0','code_type':'128','height':'80','ratio':'1','width':'1','rotation':'BARCODE','undertext':true,'number':'7','offset':'5','code_data':'123456789'});	
*x_pos：横坐标。
*y_pos：纵坐标。
*code_type：条码类型： UPCA,UPCE,EAN13,EAN8,39,128
*rotation：方向：
   BARCODE ：水平方向
   VBARCODE：垂直方向
*ratio：宽窄条码的比例（默认传1）   
*width：窄条的单位宽度（大于0）   
*height：条码高度（单位 dot）。
*undertext：条码内容是否见：
   false = 不可见
   true  = 可见
*number：可见字体大小(undertext=true才生效)。
	  55：16x16
    7 ：24x24
    4 ：32x32
*offset：条码与可见文字间的距离,单位 dot。(undertext=true才生效)
*code_data：内容。
```



##### 14.打印二维码

```javascript
printModule.printQRCode({'x_pos':'0','y_pos':'300','rotation':'BARCODE','mode':'2',
                         'width':'6','code_data':'test QR code'});
*x_pos：横坐标。
*y_pos：纵坐标。
*rotation：
   BARCODE：水平方向
   VBARCODE：垂直方向
*mode：模式： 
		1: 普通类型 
    2: 在类型1的基础上增加了个别的符号
*width ：单位宽度/模块的单元高度,范围是1到32默认为6
*code_data:二维码的内容。
```



##### 15.获取打印机状态

```javascript
printModule.getPrinterStatus((ret) => {});
*ret: 打印机状态
	if (ret == 0){
  //打印机正常
  }
  if((ret & 2) == 2){
    //缺纸
  }
  if ((ret & 4) == 4){
 		//开盖
  }
```



##### 16.打印线条

```javascript
printModule.printLine({'startX': '0','startY': '300','endX': '200','endY': '300','width': '2'});
*startX：起始点X坐标
*startY：起始点Y坐标
*endX：终点X坐标
*endY：终点X坐标
*width：线条宽度
```



##### 17.打印矩形框

```javascript
printModule.printBox({'leftX': '0','leftY': '310','rightX': '200','rightY': '480','width': '2'});
*leftX:左上角X坐标
*leftY：左上角Y坐标
*rightX：右下角X坐标
*rightY：右下角Y坐标
*width：线条宽度
```



##### 18.发送文本数据

```javascript
printModule.writeTextData({'text': '123456\r\n'},(ret) =>{});
*text: 需要发送的文本数据。
*ret: 发送结果 -1：发送失败。其他：发送成功。
```



##### 19.设置字符放大

```javascript
printModule.setMag({'widthMag':'2','heightMag':'2'})
*widthMag：字体宽度放大倍数（默认1 不放大）
*heightMag：字体高度放大倍数（默认1 不放大）
```



##### 20.设置对齐方式

```javascript
printModule.setAlign({'align':'CENTER'})
*align：CENTER：居中，LEFT：左对齐， RIGHT：右对齐
```



##### 21.打印PDF417

```javascript
printModule.printPDF417({'command':'BARCODE','start_x':'0','start_y':'0','xd':'2','yd':'6','c':'3','s':'1','data':'123456789'})
*command：方向 BARCODE:水平，VBARCODE：垂直
* start_x:起始x坐标（单位 dot）
* start_y:起始y坐标（单位 dot）
* xd:最窄元素的单位宽度。范围是1到32，默认为2
* yd:最宽元素的单位宽度。范围是1到32，默认为6
* c:使用的列数,数据列不包括启动/停止字符和左/右指标,范围为1到30;默认值是3
* s:安全级别表示要检测到的错误的最大金额和/或校正,范围为0到8;默认值是1
* data:PDF417码的数据
```



##### 22.反白框

```javascript
printModule.setInverseLine({'start_x':'0','start_y':'0','xd':'2','yd':'6','c':'3','s':'1','data':'123456789'})
*command：方向 BARCODE:水平，VBARCODE：垂直
* start_x:起始x坐标（单位 dot）
* start_y:起始y坐标（单位 dot）
* xd:最窄元素的单位宽度。范围是1到32，默认为2
* yd:最宽元素的单位宽度。范围是1到32，默认为6
* c:使用的列数,数据列不包括启动/停止字符和左/右指标,范围为1到30;默认值是3
* s:安全级别表示要检测到的错误的最大金额和/或校正,范围为0到8;默认值是1
* data:PDF417码的数据
```



##### 23.设置打印浓度

```javascript
printModule.setContrast({'contrast':'0'})
* contrast: 0 - 3 依次变深
```



##### 24.设置打印速度

```javascript
printModule.setSpeed({'speed':'0'})
* speed: 0 - 5 依次变快
```



##### 25.设置行间距

```javascript
printModule.setSp({'sp':'1'})
* sp: 间距（单位：行）
```



##### 26.走纸

```javascript
printModule.preFeed({'feed':'50'})
* feed: 走纸的距离。（单位：dot）
```



##### 27.设置字体加粗

```javascript
printModule.setBold({'bold':'1'})
* bold: 加粗系数（范围：1-5） 0:不加粗
```



##### 28.设置文本框打印

```javascript
printModule.setTextBox({'start_x':'0','start_y':'0','width':'100','fontSize':8,'isBole':true,'isDouble':true,'str':'123456789'})
* startX: 文本框起始x坐标（单位：dot）
* startY: 文本框起始y坐标（单位：dot）
* width: 文本框宽度（单位：dot）
* fontSize:字体大小
*      0: 24x24或12x24，视中英文而定。（泰语：24x48）
*      1: 7x19（英文），24x24（繁体）。
*      3: 20x20或10x20，视中英文而定。
*      4: 32x32或16x32，由ID3字体宽高各放大2倍。
*      8: 24x24或12x24，视中英文而定。
*      55: 16x16或8x16，视中英文而定。
* isBole: 是否加粗 true：加粗， false：不加粗。
* isDouble: 字体是否放大 true: 放大， false: 不放大。
* str: 文本内容。
```



##### 29.设置纸张类型

```javascript
printModule.setPageType({'pageType':'1'})
* pageType: 纸张类型
*		0：连续纸 
*		1：标签纸 
*		2：后黑标 
*		3：前黑标 
*		4：三寸黑标 
*		5：2寸黑标
```



##### 30.旋转180度打印

```javascript
printModule.poPrint()//与print()接口打印的方向相反。
```



##### 31.设置打印完成是否回调功能

```javascript
printModule.openEndStatic({'isOpen':true})
* isOpen: true: 开启，false: 关闭
```



##### 32.接收打印完成时状态

```javascript
printModule.getEndStatus({'isOpen':true},(ret) => {})
* ret: 状态。
*		0：打印成功。
*		1：打印失败（缺纸）
*		2：打印失败（开盖）
*		3：超时。
```



##### 33.水印

```javascript
printModule.printBackground({'startX':'0','startY':'0','fontSize':24,'background':100,'data':'123456'})
* startX: 起始x坐标。
* startY: 起始y坐标。
* fontSize: 字体大小
* 	55: 16X16（dot)
*		24: 24X24（dot）
*		56: 32X32（dot）
*		其他: 24X24（dot）
* background: 背景黑度（0-255)。
* data: 文本数据。
```



##### 34.获取SN

```javascript
printModule.getPrintSN((ret) => {
  const sn = JSON.stringify(result);
})
```



##### 35.设置蓝牙名字

```javascript
printModule.openEndStatic({'name':'Print Name'})
* name: 蓝牙名称（不能是中文，且长度不能超过32）
```



##### 36.设置保存

```javascript
printModule.saveParameter()//设置完蓝牙名字后需要调用该接口才起作用
```



##### 37.设置双色打印

```javascript
printModule.setLayer({'layer':0})
* layer: 需要打印的颜色， 0：红色，1：黑色。
```



##### 38.获取电量

```javascript
printModule.getElectricity((ret) => {
  const elect = JSON.stringify(result);
})
```



##### 39.获取电压

```javascript
printModule.getVoltage((ret) => {
  const voltage = JSON.stringify(result);
})
```



##### 40.获取打印机版本号

```javascript
printModule.getPrinterVersion((ret) => {
  const version = JSON.stringify(result);
})
```



##### 41.监听打印机蓝牙主动断开

```javascript
printModule.setDisConnectBTListener((ret) => {
  //蓝牙已断开
})
```



##### 42.发送文本数据

```javascript
printModule.writeTextData({'text':'123456\r\n'},(ret) =>{})
* text: 需要发送的文本数据。
* ret: 发送结果。 -1：失败。
```

