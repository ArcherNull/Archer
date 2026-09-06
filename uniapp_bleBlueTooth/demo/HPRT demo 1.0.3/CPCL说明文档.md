### 1 **加载及使用**

1.1 将 PrinterHelper.js 和 print.js 拷贝到utils中。
1.2 在pages/index/index.js中
头部加入
```js
const Print = require('../../utils/print.js');
```
在pickerData这个函数中 switch case 0 中 将之前代码
```js
data = cpclExp.val;
```
替换成
```js
data = Print.cpcl();
```


我们所用的接口都在PrinterHelper这个类中所有的接口都是静态方法，可以直接调用。

### 2 **打印接口**

#### 	2.1 **设置标签高度**

- 描述
  ``` js
  PrintAreaSize(offset,Horizontal,Vertical,height,qty)
  ```

- 参数
  | 参数       | 描述                                            
  | :--------- | :------------
  | offset     | 上下文对象                                      
  | Horizontal | 打印机水平方向dpi（根据实际打印机dpi设置）               
  | Vertical   | 打印机垂直方向dpi（根据实际打印机dpi设置）                     
  | height     | 标签高度 （单位：dot）200dpi  8 dot = 1mm，300dpi 12 dot = 1mm 
  | qty        | 打印次数                 


- 例子

``` js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Form()//打印标签起定位作用（连续纸不可用）
    PrinterHelper.Print()

```
------

#### 	2.2 **打印**

- 描述

  ```js
  Print()
  ```

- 参数
  无

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Form()//打印标签起定位作用（连续纸不可用）
    PrinterHelper.Print()
  ```

------

#### 	2.3 **换行**

- 描述

  ```js
  WordWrap()
  ```

- 参数
  无

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.WordWrap();
    PrinterHelper.Form()//打印标签起定位作用（连续纸不可用）
    PrinterHelper.Print()
  ```

------

#### 2.4 **标签定位**

- 描述
  在Print()之前调用，只在标签模式下起作用

  ```js
  Form()
  ```

- 参数
  无

- 例子
  
  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Form()//打印标签起定位作用（连续纸不可用）
    PrinterHelper.Print()
  ```

------

#### 2.5 **注释**

- 描述

  ```js
  Note(note)
  ```

- 参数
  | 参数 | 描述     |
  | :--- | :------- |
  | note | 注释内容 |

- 例子
  
    ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Note("注释：")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Print()
  ```

------


#### 2.6 **终止指令**

- 描述

  ```js
  Abort()
  ```

- 参数
  无


------


#### 2.7 **文本打印**

- 描述

  ```js
  Text(command,font,size ,x,y,data)
  ```

- 参数
  | 参数    | 描述                                                         |
  | :------ | :----------------------------------------------------------- |
  | command | 文字的方向 <br />PrinterHelper.text：水平。<br/>PrinterHelper.text90：逆时针旋转90度。<br/>PrinterHelper.text180：逆时针旋转180度。<br/>PrinterHelper.text270：逆时针旋转270度。 |
  | font    | 字体点阵大小：（单位：dot）<br />注意：英文固件只支持（0和1）。<br/>0：12x24。<br/>1：12x24（中文模式下打印繁体），英文模式下字体变成（9x17）大小<br/>2：8x16。<br/>3：20x20。<br/>4：32x32或者16x32，由ID3字体宽高各放大两倍。<br/>7：24x24或者12x24，视中英文而定。<br/>8：24x24或者12x24，视中英文而定。<br/>20：16x16或者8x16，视中英文而定。<br/>24：24x24或者12x24，视中英文而定。<br/>55：16x16或者8x16，视中英文而定。<br/>其它默认24x24或者12x24，视中英文而定。 |
  | size    | 字体大小。（该功能被屏蔽统一参数传0）                        |
  | x       | 横坐标（单位 dot）                                           |
  | y       | 纵坐标（单位 dot）                                           |
  | data    | 文本数据  

- 例子
  
  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.SetBold("1")//对下面的字体进行加粗（如不需要加粗不用添加）
    PrinterHelper.SetMag("2","2")//对下面的字体进行放大（如不需要不用添加）
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.SetMag("1","1")//关闭放大
    PrinterHelper.SetBold("0")//关闭加粗  
    PrinterHelper.Print()
  ```

------

#### 	2.8 **打印次数**

- 描述
  ```js
  Count(ml)
  ```

- 参数

  | 参数 | 描述           |
  | :--- | :------------- |
  | note | 下次加减的数值 |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
  	PrinterHelper.Count(“10”)
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Print()

  ```
  
------

#### 	2.9 **设置字符宽高放大倍数**

- 描述

  ```js
  SetMag(width,height)
  ```

- 参数

  | 参数   | 描述               |
  | :----- | :----------------- |
  | width  | 字体宽度的放大倍数 |
  | height | 字体高度的放大倍数 |


- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.SetBold("1")//对下面的字体进行加粗（如不需要加粗不用添加）
    PrinterHelper.SetMag("2","2")//对下面的字体进行放大（如不需要不用添加）
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.SetMag("1","1")//关闭放大
    PrinterHelper.SetBold("0")//关闭加粗  
    PrinterHelper.Print()
  ```
------

#### 	2.10 **对齐方式**

- 描述

  ```js
  Align(align)
  ```

- 描述

  | 参数 | 描述
  | :--- | :---
  | align | PrinterHelper.center：居中。<br/>PrinterHelper.left：左对齐。
    <br/>PrinterHelper.right：右对齐。 |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Align(PrinterHelper.left)
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Print()

  ```

------

#### 2.11 **打印条码**

- 描述

  ```js
  Barcode(command,type,width,ratio,height,x,y,data)
  ```

- 参数

  | 参数   | 描述 
  | :------| :-------------- |
  | command| PrinterHelper.barcode：水平方向<br/>PrinterHelper.vbarcode：垂直方向 |
  | type   | 条码类型：
  <br/> 128 , 128A , 128B , 128C , 128E , 39 , 39C ,93, CODABAR, CODABAR16 , EAN13 , EAN132,EAN135,EAN8,
  EAN82,EAN85,F39,F39C,FIM,I2OF5,I2OF5C,I2OF5G,INDUST2OF5,INDUST2OF5C,MSI,MSI10,MSI1010,MSI1110,
  NW7,NW7HEX,PLESSEY,PLUS2,PLUS5,POSTNET,UCCEAN128,UCCEAN128E,UPCA,UPCA2,UPCA5,UPCE,UPCE2,UPCE5
  |
  | width  | 窄条的单位宽|
  | ratio  | 宽条窄条的比例<br />0=1.5:1 ,  1=2.0:1 ,  2=2.5:1 ,  3=3.0:1 ,  4=3.5:1 ,<br/>20=2.0:1 , 21=2.1:1 , 22=2.2:1 , 23=2.3:1 , 24=2.4:1 , 25=2.5:1<br/>26=2.6:1 , 27=2.7:1 , 28=2.8:1 , 29=2.9:1 , 30=3.0:1 , |
  | height  | 条码高度 |
  | x       | 条码的起始横坐标。（单位：dot）|
  | y       | 条码的起始纵坐标。（单位：dot）|
  | data    | 条码数据                       |


- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Barcode(PrinterHelper.barcode,"128","3","3","80","0","531","776250157441445")
    PrinterHelper.Print()

  ```

------

#### 2.12 **打印二维码**

- 描述

  ```js
  PrintQR(command,x,y,M,U,data)
  ```

- 参数

  | 参数    | 描述  |
  | :------ | :---- |
  | command | PrinterHelper.barcode：水平方向<br/>PrinterHelper.vbarcode：垂直方向 |
  | x       | 二维码的起始横坐标。（单位：dot）|
  | y       | 二维码的起始纵坐标。（单位：dot）|
  | M       | QR的类型：<br />1：普通类型<br />2：在类型1的基础上增加了个别的符号 |
  | U       | 单位宽度/模块的单元高度,范围是1到32默认为6 |
  | data    | 二维码的数据  |


- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.PrintQR(PrinterHelper.barcode,"430","730","2","3","https://weixin.sto.cn/Order/OrderN")
    PrinterHelper.Print()

  ```

------

#### 2.13 **打印PFD417码**

- 描述

  ```js
    PrintPDF417(command,x,y,XD,YD,C,S,data)
  ```

- 参数

  | 参数    | 描述    |
  | :------ | :-------|
  | command | PrinterHelper.barcode：水平方向<br/>PrinterHelper.vbarcode：垂直方向 |
  | x       | PDF417的起始横坐标。（单位：dot）|
  | y       | PDF417的起始纵坐标。（单位：dot）|
  | XD      | 最窄元素的单位宽度。范围是1到32，默认为2 |
  | YD      | 最窄元素的单位高度。范围是1到32，默认值是6                   |
  | C       | 使用的列数,数据列不包括启动/停止字符和左/右指标,范围为1到30;默认值是3 |
  | S       | 安全级别表示要检测到的错误的最大金额和/或校正,范围为0到8;默认值是1 |
  | data    | PDF417码的数据 |

- 例子
  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.PrintPDF417(PrinterHelper.barcode,"0","0","2","6","3","1","13ABC")
    PrinterHelper.Print()

  ```

------

#### 2.14 **打印矩形框**

- 描述

  ```js
    Box(X0,Y0,X1,Y1,width=1)
  ```

- 参数

  | 参数  | 描述                         |
  | :---- | :--------------------------- |
  | X0    | 左上角的X坐标。（单位：dot） |
  | Y0    | 左上角的Y坐标。（单位：dot） |
  | X1    | 右下角的X坐标。（单位：dot） |
  | Y1    | 右下角的Y坐标。（单位：dot） |
  | width | 线条的单位宽度。 (默认：1)   |


- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Box("438","900","542","948","1")
    PrinterHelper.Print()

  ```

------

#### 2.15 **打印直线**

- 描述

  ```js
  Line(X0,Y0,X1,Y1,width)
  ```

- 参数

  | 参数  | 描述                       |
  | :---- | :------------------------- |
  | X0    | 起始的X坐标。（单位：dot） |
  | Y0    | 起始的Y坐标。（单位：dot） |
  | X1    | 结尾的X坐标。（单位：dot） |
  | Y1    | 结尾的Y坐标。（单位：dot） |
  | width | 线条的单位宽度。 (默认：1) |

- 例子
  
  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Line("340","680","340","845","1")
    PrinterHelper.Print()

  ```

------

#### 2.16 **反白框**

- 描述

  ```js
  InverseLine(X0,Y0,X1,Y1,width)
  ```

  - 参数

  | 参数  | 描述                       |
  | :---- | :------------------------- |
  | X0    | 起始的X坐标。（单位：dot） |
  | Y0    | 起始的Y坐标。（单位：dot） |
  | X1    | 结尾的X坐标。（单位：dot） |
  | Y1    | 结尾的Y坐标。（单位：dot） |
  | width | 反白框的宽度。 (默认：1)   |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.InverseLine("10","10","150","10","1")
    PrinterHelper.Print()

  ```

------

#### 2.18 **打印浓度**

- 描述

  ```js
  Contrast(contrast)
  ```

- 参数

  | 参数     | 描述   |
  | :------- | :----- |
  | contrast | 浓度类型，总的有四种：<br/>默认 = 0<br/>中 = 1<br/>黑暗 = 2<br/>非常深 = 3 |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Contrast("1")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Print()

  ```

------

#### 2.19 **打印速度**

- 描述

  ```js
  Speed(speed)
  ```

- 参数

  | 参数  | 描述    |
  | :---- | :------ |
  | speed | 速度类型，总的有5种：从0到5越来越快；5是理想状态的最快速度。 |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Speed("4")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Print()

  ```

------

#### 2.20 **设置行间距**

- 描述

  ```js
  SetSp(setsp)
  ```

- 参数

  | 参数  | 描述             |
  | :---- | :--------------- |
  | Setsp | 间距（单位：行） |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","0","121")
    PrinterHelper.SetSp(1)
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","50","121")
    PrinterHelper.SetSp(5)
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","90","121")
    PrinterHelper.Print()

  ```

------

#### 2.21 **走纸**

- 描述

  ```js
  Prefeed(prefeed)
  ```

- 参数

  | 参数    | 描述                      |
  | :------ | :------------------------ |
  | prefeed | 走纸的距离。（单位：dot） |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Prefeed("40")
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","0","121")
    PrinterHelper.Print()

  ```
------

#### 2.22 **打印完走纸**

- 描述

  ```js
  Postfeed(posfeed)
  ```

- 参数

  | 参数    | 描述                      |
  | :------ | :------------------------ |
  | posfeed | 走纸的距离。（单位：dot） |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","0","121")

    PrinterHelper.Postfeed("40")
    PrinterHelper.Print()

  ```
------

#### 2.23 **蜂鸣器**

- 描述

  ```js
  Beep(beep)
  ```

- 参数

  | 参数 | 描述                              |
  | :--- | :-------------------------------- |
  | beep | 蜂鸣声的持续时间，（1/8）秒为单位 |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","0","121")

    PrinterHelper.Beep("16")
    PrinterHelper.Print()

  ```
------

#### 2.25 **延时打印**

- 描述

  ```js
  Wait(wait)
  ```

- 参数

  | 参数 | 描述                |
  | :--- | :------------------ |
  | wait | 延时。单位是：1/8秒 |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Wait("80")
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","0","121")
    PrinterHelper.Print()

  ```
------

#### 2.26 **打印宽度**

- 描述

```js
PageWidth(pw)
```

- 参数

  | 参数 | 描述                        |
  | :--- | :-------------------------- |
  | pw   | 指定页面宽度。（单位：dot） |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.PageWidth("100")
    PrinterHelper.Text(PrinterHelper.text,"4","0","0","0","121")
    PrinterHelper.Print()

  ```
------

#### 2.27 **行模式下设置行间距**

- 描述

```js
Setlf(SF)
```
- 参数

  | 参数 | 描述             |
  | :--- | :--------------- |
  | SF   | 间距（单位：行） |

- 例子

  ```js
    PrinterHelper.Setlf("5")
  ```
------


#### 2.28 **设置行模式字体大小与行高**

- 描述

```js
Setlp(font,size,spacing)
```
- 参数

  | 参数    | 描述   |
  | :------ | :----- |
  | font    | 字体点阵大小：（单位：dot）<br />注意：英文固件只支持（0和1）。<br/>0：12x24。<br/>1：12x24（中文模式下打印繁体），英文模式下字体变成（9x17）大小<br/>2：8x16。<br/>3：20x20。<br/>4：32x32或者16x32，由ID3字体宽高各放大两倍。<br/>7：24x24或者12x24，视中英文而定。<br/>8：24x24或者12x24，视中英文而定。<br/>20：16x16或者8x16，视中英文而定。<br/>24：24x24或者12x24，视中英文而定。<br/>55：16x16或者8x16，视中英文而定。<br/>其它默认24x24或者12x24，视中英文而定。 |
  | size    | 字体大小。（该功能被屏蔽统一参数传0） |
  | spacing | 行高（单位：dot） |

- 例子

  ```js
    PrinterHelper.Setlp("5","2","32");
  ```
------

#### 2.31 **字体加粗**

- 描述

```js
SetBold(bold)
```
- 参数

  | 参数 | 描述                  |
  | :--- | :-------------------- |
  | bold | 加粗系数（范围：1-5） |

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.SetBold("1")//对下面的字体进行加粗（如不需要加粗不用添加）
    PrinterHelper.SetMag("2","2")//对下面的字体进行放大（如不需要不用添加）
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.SetMag("1","1")//关闭放大
    PrinterHelper.SetBold("0")//关闭加粗  
    PrinterHelper.Print()
  ```
------

#### 2.37 **旋转180度打印**

- 描述
  ```js
  PoPrint()
  ```

- 参数

  无

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Form()
    PrinterHelper.PoPrint()

  ```
------

#### 2.43 **设置打印机Codepage**

- 描述
  ```js
  Country(codepage)
  ```

- 参数

  | 参数     | 描述                                                         |
  | :------- | :----------------------------------------------------------- |
  | codepage | 代码页
  <br /> BIG5 , CHINA , CP850 ,  CP874  , FRANCE  , 
  GERMANY , ITALY ,  JAPAN  , JAPAN-S , KOREA ,
  LATIN9  , NORWAY  , SPAIN , SWEDEN  , THAI  ,
  UK  , USA , VIETNAM

- 例子

  ```js
    PrinterHelper.PrintAreaSize("0","200","200","1000","1")
    PrinterHelper.Country("CHINA")
    PrinterHelper.Text(PrinterHelper.text,"8","10","170","30","121")
    PrinterHelper.Print()

  ```
------

#### 2.48 **设置行模式的X坐标**

- 描述
  必须放在Setlp函数之前

   ```js
   RowSetX(X)
   ```
- 参数

  | 参数 | 描述                |
  | :--- | :------------------ |
  | bold | 横坐标（单位：dot） |

- 例子

  ```js
    PrinterHelper.RowSetX("200");
    PrinterHelper.Setlp("5","2","32");

  ```
------


#### 2.49 **打印图片**

- 描述
   其中 b 、h、以及data不需要输入只需要传入变量名称
   ```js
   PrintImg(b,h,x,y,data)
   ```
- 参数

  | 参数 | 描述                |
  | :--- | :------------------ |
  | b | 正在被传输的图像的字节宽度。 |
  | h | 以单位表示的数据的高度。 |
  | x | 图形的X原点。 |
  | y | 图形的Y原点。|
  | data | 构成要打印的位图的数据。 |

- 例子
  ```js
	PrinterHelper.PrintImg(byte,height,'30','30',data) =>byte、height、data为变量名称
  ```
------

#### 2.50 **打印二维码版本二**

- 描述

  ```js
  PrintQRHead(version)
  ```

- 参数

  | 参数    | 描述  |
  | :------ | :---- |
  | version | 单位宽度/模块的单元高度,范围是1到40


- 例子

  ```js
	PrinterHelper.PrintQRHead(11);
	

  ```

------