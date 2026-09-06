### 1  ** 加载及使用 **

1.1 将 PrinterHelper3.js 和 print.js 拷贝到utils中。
1.2 在pages/index/index.js中
<!-- 头部加入
```js
const Print = require('../../utils/print.js');
``` -->
在pickerData这个函数中 switch case 1 中 将之前代码
```js
data = escExp.val;
```

替换成
```js
data = Print.esc();
```

我们所用的接口都在PrinterEsc这个类中所有的接口都是静态方法，可以直接调用。


### 2  ** 打印接口 **

#### 	2.1 ** 初始化打印机（清除缓存）**

- 描述
  ``` js
  PrintInit()
  ```

- 参数
  无          

------

#### 	2.2 ** 选择标准模式（清除数据）**

- 描述

  ```js
  PrintStandardMode()
  ```

- 参数
  无
  
------

#### 	2.3 ** 选择页面模式 **

- 描述
  ``` js
  PageMode()
  ```

- 参数
  无
  
------

#### 	2.4 ** 设置打印区域为页面模式 **

- 描述
  ``` js
  PageArea(w,h)
  ```

- 参数
  | 参数            	|   描述         
  
  * @param {*} w      	    宽度
  
  * @param {*} h      	    高度
  
------

#### 	2.5 ** 设置绝对打印位置 **

- 描述
  ``` js
  PageAbsolutePrint(x)
  ```

- 参数
  | 参数            	|   描述    
  
  * @param {*} x      	    x坐标

  
------

#### 	2.6 ** 设置页面模式下的绝对垂直打印位置 **

- 描述
  ``` js
  PageAbsoluteVerticalPrint(y)
  ```

- 参数
  | 参数            	|   描述       
  
  * @param {*} y      	    y坐标

  
------

#### 	2.7 ** 页模式下打印 **

- 描述
  ``` js
  PrintPageMode()
  ```

- 参数
  无
  
------

#### 	2.8 ** 打印和回车 **

- 描述
  ``` js
  PrintReturn()
  ```

- 参数
  无

------

#### 	2.9 ** 打印和换行 **

- 描述

  ```js
  PrintWrap()
  ```

- 参数
  无

- 例子

  ```js
    PrinterEsc.PrintWrap();
  ```
------

#### 	2.10 ** 打印文本 **

- 描述
  ``` js
  PrintText(data)
  ```

- 参数
  | 参数            	|   描述     
  
  * @param {*} data      	输入文本内容             

- 例子

``` js
    PrinterEsc.PrintText('XIAMEN');
```
------

#### 	2.11 ** 居中居左居右 **

- 描述
  ``` js
  PrintJustification(n)
  ```

- 参数
  | 参数            	|   描述   
  
  * @param {*} n      	n = 0 居左  n = 1 居中  n = 2 居右    

- 例子

``` js
    PrinterEsc.PrintJustification('2');
```  

------

#### 	2.12 ** 下划线 **

- 描述
  ``` js
  PrintLine(n)
  ```

- 参数
  | 参数            |   描述   
  
  * @param {*} n     	n = 1 下划线         

- 例子

``` js
	PrinterEsc.PrintStandardMode();
	PrinterEsc.PrintJustification('2') 右对齐
	PrinterEsc.PrintCharSize('32') 字体放大
	PrinterEsc.PrintFont('1') 加粗
    PrinterEsc.PrintLine('1') 下划线
	PrinterEsc.PrintText('XIAMEN'); 文本
```
------


#### 	2.13 ** 加粗 **

- 描述
  ``` js
  PrintFont(n)
  ```

- 参数
  | 参数      		 | 描述       
  
  *  @param {*} n     	n = 1 加粗            

- 例子

``` js
    PrinterEsc.PrintFont('1')
```
------


#### 	2.14 ** 字符放大 **
 
- 描述
  ``` js
  PrintCharSize(n)
  ```

- 参数
  | 参数      		 | 描述       
  
  *  @param {*} n     
  
  * n = 0 正常； 			n = 1 纵向放大2倍；  	n = 2 纵向放大3倍；		n = 3 纵向放大4倍； 
  *	n = 4 纵向放大5倍； 	n = 5 纵向放大6倍；  	n = 6 纵向放大7倍 ； 	n = 7 纵向放大8倍
  * n = 16 横向放大2倍；	n = 32 横向放大 3倍；	n = 48 横向放大4倍； 	n = 64 横向放大5倍；
  * n = 80 横向放大6倍；	n = 96 横向放大7倍； 	n = 112 横向放大8倍;

- 例子

``` js
    PrinterEsc.PrintCharSize('32')
```
------


#### 	2.15 ** 设置条码宽度 **

- 描述
  ``` js
  PrintBarCodeWidth(n)
  ```

- 参数
  | 参数      		 | 描述    
  
  *  @param {*} n     	2 ≤ n ≤ 6        

- 例子

``` js
    PrinterEsc.PrintBarCodeWidth('2');
```
------


#### 	2.16 ** 设置条码高度 **

- 描述
  ``` js
  PrintBarCodeHeight(n)  
  ```

- 参数
  | 参数      		 | 描述      
  
  *  @param {*} n     1 ≤ n ≤ 255     

- 例子

``` js
    PrinterEsc.PrintBarCodeHeight('80');
```
------


#### 	2.17 ** 选择HRI字符的打印位置 **

- 描述
  ``` js
  PrintBarCodePosition(n)  
  ```

- 参数
  | 参数      		 | 描述   
  
  *  @param {*} n     n = 0 不打印
					  n = 1	条形码上方
					  n = 2 在条形码下面
					  n = 3 条形码上面和下面都有

- 例子

``` js
    PrinterEsc.PrintBarCodePosition('2');
```
------

#### 	2.18 ** 为HRI字符选择字体 **

- 描述
  ``` js
  PrintBarCodeFont(n)  
  ```

- 参数
  | 参数      		 | 		描述      
  
  *  @param {*} n     	  n = 0 Font A
						  n = 1 Font B
						  n = 2 Font C


- 例子

``` js
    PrinterEsc.PrintBarCodeFont('0');
```
------



#### 	2.19 ** 打印条码 **

- 描述
  ``` js
  PrintBarCode(m,d,n)  
  ```

- 参数
  | 参数      		 | 		描述  
  
  *  @param {*} m     	* m = 0 UPC-A;
						* m = 1 UPC-E;
						* m = 2 JAN13 (EAN13);
						* m = 3 JAN8 (EAN8);
						* m = 4 CODE39;
						* m = 70 ITF; 
						* m = 73 CODE128; 

- 例子①
``` js
    PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('0','012345678912');
	
```

- 例子②
``` js
    PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('2','012345678912');
```

- 例子③
``` js
	PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('3','012345678912');
```

- 例子④
``` js
	PrinterEsc.PrintBarCodeWidth('1');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('4','012');
```

- 例子⑤
``` js
	PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('70','1234567893');
```

-例子⑥
``` js
	PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('6','A40156B');
```

-例子⑦
``` js
	rinterEsc.PrintBarCodeWidth('1');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('73','NO.123456EFG59','16');
```

-例子⑧
``` js
	rinterEsc.PrintBarCodeWidth('1');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('73','NO.123456EFG59','16');
```
------


#### 	2.20 ** 设置模块的大小 **

- 描述
  ``` js
  PrintQRSize(n)  
  ```

- 参数
  | 参数      		 | 描述       
  
  *  @param {*} n      1 ≤ n ≤ 16

- 例子

``` js
    PrinterEsc.PrintQRSize('3');
```
------

#### 	2.21 ** 选择错误纠正级别 **

- 描述
  ``` js
  PrintQRLevel(n)  
  ```

- 参数
  | 参数      		 | 描述      
  
  *  @param {*} n       * 48：选择错误纠正等级L
						* 49：选择错误纠正等级M
						* 50：选择错误纠正等级Q
						* 51：选择错误纠正等级H

- 例子

``` js
    PrinterEsc.PrintQRLevel('48');
```
------

#### 	2.22 ** 将数据存储在符号存储区 **

- 描述
  ``` js
  PrintQRStore(n,data)
  ```

- 参数
  | 参数      		 | 描述    
  
  *  @param {*} n       

- 例子

``` js
    PrinterEsc.PrintQRStore('25','www.baidu.com123456789');
```
------

#### 	2.23 ** 打印符号存储区中的符号数据 **

- 描述
  ``` js
   PrintQR()
  ```

- 参数
  无

- 例子

``` js
    PrinterEsc.PrintQRSize('3')
    PrinterEsc.PrintQRLevel('48')
    PrinterEsc.PrintQRStore('25','www.baidu.com123456789');
    PrinterEsc.PrintQR()
```
------

#### 	2.24 ** 设置数据区域中的列数 **

- 描述
  ``` js
   PrintPDFCol(n)
  ```

- 参数
    | 参数      		 | 描述 
	
  *  @param {*} n        0 ≤ n ≤ 30

- 例子

``` js
    PrinterEsc.PrintPDFCol('0')
```
------

#### 	2.25 ** 设置行数 **

- 描述
  ``` js
   PrintPDFRow(n)
  ```

- 参数
    | 参数      		 | 描述     
	
  *  @param {*} n        n = 0, 3 ≤ n ≤ 90

- 例子

``` js
    PrinterEsc.PrintPDFRow('0')
```
------

#### 	2.26 ** 设置模块的宽度 **

- 描述
  ``` js
   PrintPDFWidth(n)
  ```

- 参数
    | 参数      		 | 描述      
	
  *  @param {*} n        2 ≤ n ≤ 8  n = 3

- 例子

``` js
    PrinterEsc.PrintPDFWidth('3')
```
------

#### 	2.27 ** 设置行高 **

- 描述
  ``` js
   PrintPDFHeight(n)
  ```

- 参数
    | 参数      		 | 描述    
	
  *  @param {*} n        2 ≤ n ≤ 8  n = 3

- 例子

``` js
    PrinterEsc.PrintPDFHeight('3')
```
------

#### 	2.28 ** 设置纠错级别 **

- 描述
  ``` js
   PrintPDFLevel(m,n)
  ```

- 参数
    | 参数      		 | 		描述  
	
	* @param {*} m  		m = 48 错误纠正级别由“level”设置。 
							m = 49 错误修正级别由“比率”设置。
	
	* @param {*} n  		n = 48 - 56 
	
							* 48: 纠错等级0    49: 纠错等级1  50: 纠错等级2   51: 纠错等级3   52: 纠错等级4   53: 纠错等级5
							* 54: 纠错等级6    55: 纠错等级7  56: 纠错等级8      

- 例子

``` js
    PrinterEsc.PrintPDFLevel('48','50')
```
------


#### 	2.29 ** 将数据存储在符号存储区 **

- 描述
  ``` js
   PrintPDFStore(n,data)
  ```

- 参数
    | 参数      		 | 描述      
	
  *  @param {*} n        

- 例子

``` js
    PrinterEsc.PrintPDFStore('25','www.baidu.com123456789')
```
------


#### 	2.30 ** 打印符号存储区中的符号数据 **

- 描述
  ``` js
   PrintPDF()
  ```

- 参数
  无    

- 例子

``` js
    PrinterEsc.PrintPDFCol('0')
    PrinterEsc.PrintPDFRow('0')
    PrinterEsc.PrintPDFWidth('3')
    PrinterEsc.PrintPDFHeight('3')
    PrinterEsc.PrintPDFLevel('48','50')
    PrinterEsc.PrintPDFStore('25','www.baidu.com123456789')
	PrinterEsc.PrintPDF()
```

------

#### 	2.31 ** 打印图片 **

- 描述

	其中 n 、h、以及data不需要输入只需要传入变量名称
	
  ``` js
   PrintImg(n,h,data)
  ```

- 参数
  无    

- 例子

``` js
    PrinterEsc.PrintInit();
    PrinterEsc.PageUnit();
    PrinterEsc.PageMode();
    PrinterEsc.PageArea(w,h+100)
    PrinterEsc.PageAbsolutePrint(0)
    PrinterEsc.PageAbsoluteVerticalPrint(h)
    PrinterEsc.PrintImg(n,h,data)   => n、h、data为变量名称
    PrinterEsc.PrintPageMode()
	
```

------


####  2.32  ** 设置水平和垂直运动单元 **

-描述

  ``` js
   PageUnit()
  ```

- 参数
  无  


------









