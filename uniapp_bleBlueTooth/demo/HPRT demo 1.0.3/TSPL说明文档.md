### 1 **加载及使用**

1.1 将 PrinterHelper1.js 和 print.js 拷贝到utils中。
1.2 在pages/index/index.js中
<!-- 头部加入
```js
const Print = require('../../utils/print.js');
``` -->
在pickerData这个函数中 switch case 2 中 将之前代码
```js
data = tspl.val;
```
替换成
```js
data = Print.tspl();
```


我们所用的接口都在PrinterTspl这个类中所有的接口都是静态方法，可以直接调用。

### 2 **打印接口**

#### 	2.1 **设置标签的宽度和长度**

- 描述
  ``` js
  SetSize(M,N)
  ```

- 参数
  | 参数          | 描述                                            
  * @param {*} M    标签宽度
  * @param {*} N    标签长度          

- 例子

``` js
    PrinterTspl.SetSize('56mm','250mm')
    PrinterTspl.SetSize('56','250')
    PrinterTspl.SetSize('56dot','250dot')
```
------

#### 	2.2 **设置两个标签之间的间隙距离**

- 描述

  ```js
  SetGap(M,N)
  ```

- 参数
  | 参数          | 描述                                            
  * @param {*} M    两个标签之间的间隙距离
    0 ≤ m ≤1 (inch), 0 ≤ m ≤ 25.4 (mm)
    0 ≤ m ≤5 (inch), 0 ≤ m ≤ 127 (mm) / since V6.21 EZ and later firmware
  * @param {*} N    间隙的偏移距离     

- 例子

  ```js
    PrinterTspl.SetGap('3mm','0mm')
    PrinterTspl.SetGap('0.12','0')
    PrinterTspl.SetGap('0','0')
  ```

------

#### 	2.3 **设置每个表单换行所采用的黑线高度和用户定义的额外标签换行长度**

- 描述

  ```js
  SetBline(M,N)
  ```

- 参数
  | 参数          | 描述     
  * @param {*} M    黑线的高度，单位为英寸或毫米
  0 ≤ m ≤ 1 (inch), 0 ≤ m ≤ 25.4 (mm)
  0 ≤ m ≤5 (inch), 0 ≤ m ≤ 127 (mm) / since V6.21 EZ and later firmware
  * @param {*} N    额外的标签馈送长度


- 例子

  ```js
    PrinterTspl.SetBline('0.2','0.50')
    PrinterTspl.SetBline('5.08 mm','12.7 mm')

  ```
------

#### 	2.4 **调整标签停止位置**

- 描述

  ```js
  OffSet(M,N)
  ```

- 参数
  | 参数          | 描述   
  * @param {*} M    偏移距离
  * @param {*} N    只有单位为dot时才有N这个参数

- 例子

  ```js
    PrinterTspl.OffSet('0.5')
    PrinterTspl.OffSet('12.7 mm')

  ```
------

#### 	2.5 **打印速度**

- 描述

  ```js
  SetSpeed(n)
  ```

- 参数
  | 参数          | 描述   
  * @param {*} n  

- 例子

  ```js
    PrinterTspl.SetSpeed('10')
  ```
------

#### 	2.6 **设置打印的黑暗**

- 描述

  ```js
  SetDensity(n)
  ```

- 参数
  | 参数          | 描述   
  * @param {*} n  0~15
  0: specifies the lightest level
  15: specifies the darkest level

- 例子

  ```js
    PrinterTspl.SetDensity('7')
  ```
------

#### 	2.7 **打印输出方向和镜像**

- 描述

  ```js
  SetDirection(N,M)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} N    0或1
  * @param {*} M    0:打印正常图像  1:打印镜像

- 例子

  ```js
    PrinterTspl.SetDirection('0')
    PrinterTspl.SetDirection('0','1)
  ```
------

#### 	2.8 **定义了标签的参考点**

- 描述

  ```js
  SetReference(X,Y)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} N    横坐标 (in dots)
  * @param {*} M    纵坐标 (in dots)

- 例子

  ```js
    PrinterTspl.SetReference('10','10')
  ```
------

#### 	2.9 **移动标签的垂直位置**

- 描述

  ```js
  SetShift(n)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} n    最大值为1英寸。对于200dpi打印机，范围为-203 ~ 203;为300dpi打印机，范围是-300到300。单位为dot。

- 例子

  ```js
  PrinterTspl.SetShift('36')
  ```
------

#### 	2.10 **通过定义特殊字符来调整键盘的方向，以便在不同的国家使用**

- 描述

  ```js
  SetCountry(n)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} n    
  * 001: USA  002: Canadian-French  003: Spanish (Latin America)
    031: Dutch  032: Belgian  033: French (France)  034: Spanish (Spain)  036: Hungarian  038: Yugoslavian  039: Italian
    041: Switzerland  042: Slovak 044: United Kingdom
    045: Danish 046: Swedish  047: Norwegian  048: Polish
    049: German 055: Brazil 061: English (International)
    351: Portuguese  358: Finnish

- 例子

  ```js
  PrinterTspl.SetCountry('001')
  ```
------

#### 	2.11 **定义了国际字符集的代码页**

- 描述

  ```js
  CodePage(n)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} n 
  * USA: USA   BRI: British   GER: German  FRE: French 
    DAN: Danish   ITA: Italian   SPA: Spanish
    SWE: Swedish  SWI Swiss  
    437: United States  737: Greek  850: Multilingual
    851: Greek 1   852: Slavic  855: Cyrillic
    857: Turkish   860: Portuguese  861: Icelandic
    862: Hebrew    863: Canadian/French   864: Arabic
    865: Nordic    866: Russian   869: Greek 2
    1250: Central Europe  1251: Cyrillic
    1252: Latin I  1253: Greek  1254: Turkish
    1255: Hebrew  1256: Arabic  1257: Baltic
    1258: Vietnam  932: Japanese Shift-JIS
    936: Simplified Chinese GBK  949: Korean
    950: Traditional Chinese Big5  UTF-8: UTF 8

    8859-1: Latin 1  8859-2: Latin 2  8859-3: Latin 3
    8859-4: Baltic  8859-5: Cyrillic  8859-6: Arabic
    8859-7: Greek  8859-8: Hebrew  8859-9: Turkish
    8859-10: Latin 6  8859-15: Latin 9

- 例子

  ```js
  PrinterTspl.CodePage('1252')
  ```
------

#### 	2.12 **清除缓冲区**

- 描述

  ```js
  Clear()
  ```

- 参数
  无

#### 	2.13 **标签输入指定的长度**

- 描述

  ```js
  SetFeed(n)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} n    unit: dot  (1 ≤ n ≤ 9999)

- 例子

  ```js
  PrinterTspl.SetFeed('40')
  ```
------

#### 	2.14 **反向输入标签**

- 描述

  ```js
  SetBack(command,n)
  ```

- 参数
  | 参数                | 描述 
  * @param {*} command    BACKUP和BACKFEED
  * @param {*} n          unit: dot  (1 ≤ n ≤ 9999)

- 例子

  ```js
  PrinterTspl.SetBack('BACKUP','40')
  PrinterTspl.SetBack('BACKFEED','40')
  ```
------

#### 	2.15 **将标签输入到下一个标签的开头**

- 描述

  ```js
  FormFeed()
  ```
- 参数
  无

------

#### 	2.16 **这个命令将馈送标签，直到内部传感器确定了原点。在使用该命令之前，应该定义标签的大小和间隙。**

- 描述

  ```js
  Home()
  ```
- 参数
  无

------

#### 	2.17 **打印**

- 描述

  ```js
  PrintTs(M,N)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} M    指定将打印多少组标签。
  * @param {*} N    指定每个特定标签集应打印多少份副本
- 例子

  ```js
  PrinterTspl.PrintTs('3','2')
  PrinterTspl.SetBack('1','1')
  ```
------

#### 	2.18 **控制寻呼机的声音频率**

- 描述

  ```js
  SetSound(L,I)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} L    声级:0 ~ 9
  * @param {*} I    声音间隔:1 ~ 4095
- 例子

  ```js
  PrinterTspl.SetSound('5','200')
  ```
------

#### 	2.19 **激活切割机立即切割标签，而不回送标签。**

- 描述

  ```js
  SetCut()
  ```

- 参数
  无
------


#### 	2.20 **设置灵敏度**

- 描述

  ```js
  LimitFeed(N,Min,Max)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} N      传感器检测的最大长度
  * @param {*} Min    纸张的最小长度
  * @param {*} Max    最大间隙长度

- 例子

  ```js
  PrinterTspl.LimitFeed('12')
  ```
------

#### 	2.21 **打印出打印机信息。**

- 描述

  ```js
  SelfTest(page)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} page   
  * omitted：打印包含整个打印机信息的自检页面。
    PATTERN: 打印图案，检查打印头热线状态
    ETHERNET: 打印带有以太网设置的自检页面。
    WLAN: 打印带有Wi-Fi设置的自检页面
    RS232: 打印自检页与RS-232设置
    SYSTEM: 打印带有打印机设置的自检页面。
    Z: 打印带有模拟语言设置的自检页面

- 例子

  ```js
  PrinterTspl.SelfTest('')
  PrinterTspl.SelfTest('PATTERN')
  ```
------

#### 	2.22 **让打印机等待直到命令处理(EOJ之前)完成，然后继续执行下一个命令。**

- 描述

  ```js
  WaitEoj()
  ```

- 参数
  无
------

#### 	2.23 **让打印机等待特定的时间，然后继续执行下一个命令。**

- 描述

  ```js
  Delay(ms)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} ms   具体的时间段

- 例子

  ```js
  PrinterTspl.Delay('3000')
  ```
------


#### 	2.24 **将位于打印机图像缓冲区中的图像显示在LCD面板上。**

- 描述

  ```js
  SetDisplay(n)
  ```

- 参数
  | 参数          | 描述 
  * @param {*} n   IMAGE/OFF

- 例子

  ```js
  PrinterTspl.SetDisplay('OFF')
  ```
------

#### 	2.25 **将打印机设置恢复为默认值。**

- 描述

  ```js
  InitPrinter()
  ```

- 参数
  无
------

#### 	2.26 **绘制标签格式的条**

- 描述

  ```js
  SetBar(x,y,width,height)
  ```

- 参数
  | 参数          | 描述 
   * @param {*} X   左上角的x坐标(in dots)
   * @param {*} Y   左上角的y坐标(in dots)
   * @param {*} W   条宽(in dots)
   * @param {*} H   条高(in dots)

- 例子

  ```js
  PrinterTspl.SetBar('80','80','300','100')
  ```
------


#### 	2.27 **条形码**

- 描述

  ```js
  SetBarCode(x,y,type,height,readable,rotation,narrow,width,content)
  ```

- 参数
  | 参数          | 描述 
   * @param {*} x   指定标签上的x坐标条形码
   * @param {*} y   指定标签上的y坐标条形码
   * @param {*} type (128,128M,EAN128,25,25C,39,39C,39S,93,EAN13,EAN13+2,EAN13+5,EAN8,EAN8+2,EAN8+5,CODA,POST,UPCA,UPCA+2,UPCA+5,UPCE,UPCE+2,UPCE+5,CPOST,MSI,MSIC,PLESSEY,ITF14,EAN14,11,TELEPEN,TELEPENN,PLANET,CODE49,DPI,DPL)
   * 
   * @param {*} height  条形码高度(in dots)
   * @param {*} readable 
   *   0: not readable  1: human readable aligns to left
       2: human readable aligns to center
       3: human readable aligns to right
   * @param {*} rotation
   *  0 : No rotation
      90 : Rotate 90 degrees clockwise
      180 : Rotate 180 degrees clockwise
      270 : Rotate 270 degrees clockwise 
   * @param {*} narrow  窄单元宽度(in dots)
   * @param {*} width   宽元素的宽度(in dots)
    narrow : width  1:1  narrow : width  1:2
    narrow : width  1:3  narrow : width  2:5
    narrow : width  3:7

   * @param {*} content  条形码的内容

- 例子

  ```js
  PrinterTspl.SetBarCode('10','100','UPCA','80','1','0','2','2','075678164125')
  ```
------

#### 	2.28 **绘制矩形**

- 描述

  ```js
  SetBox(x,y,x_end,y_end,thickness,radius)
  ```

- 参数
  | 参数          | 描述 
   * @param {*} x   指定左上角的x坐标 (in dots)
   * @param {*} y   指定左上角的y坐标 (in dots)
   * @param {*} x_end   指定右下角的x坐标 (in dots)
   * @param {*} y_end   指定右下角的y坐标 (in dots)
   * @param {*} thickness 线条粗细(in dots)
   * @param {*} radius  可选的。指定圆角。默认值为0。

- 例子

  ```js
  PrinterTspl.SetBox('80','80','590','190','4')
  PrinterTspl.SetBox('120','120','550','150','4','20')
  ```
------

#### 	2.29 **画一个圆圈**

- 描述

  ```js
  SetCircle(X_start,Y_start,diameter,thickness)
  ```

- 参数
  | 参数          | 描述 
   * @param {*} X_start   指定左上角的x坐标 (in dots)
   * @param {*} Y_start   指定左上角的y坐标 (in dots)
   * @param {*} diameter  指定圆的直径(in dots)
   * @param {*} thickness 圆的厚度(in dots)

- 例子

  ```js
  PrinterTspl.SetCircle('250','20','100','5')
  ```
------

#### 	2.30 **椭圆**

- 描述

  ```js
  SetEllipse(x,y,width,height,thickness)
  ```

- 参数
  | 参数          | 描述 
   * @param {*} x   指定左上角的x坐标 (in dots)
   * @param {*} y   指定左上角的y坐标 (in dots)
   * @param {*} width  指定椭圆的宽度(in dots)
   * @param {*} height  指定椭圆的高度(in dots)
   * @param {*} thickness 椭圆的厚度(in dots)

- 例子

  ```js
  PrinterTspl.SetEllipse('10','120','100','400','5')
  ```
------

#### 	2.31 **清除图像缓冲区中的指定区域**

- 描述

  ```js
  SetErase(x,y,x_width,y_height)
  ```

- 参数
  | 参数          | 描述 
   * @param {*} x   起始点的x坐标 (in dots)
   * @param {*} y   起始点的y坐标 (in dots)
   * @param {*} x_width  x轴方向上的区域宽度(in dots)
   * @param {*} y_height  y轴方向上的区域高度(in dots)

- 例子

  ```js
  PrinterTspl.SetErase('150','150','200','200')
  ```
------

#### 	2.32 **PDF417 2D条码**

- 描述

  ```js
  SetPdf417(x,y,width,height,rotate,content,option)
  ```

- 参数
  | 参数          | 描述 
   * @param {*} x   起始点的x坐标
   * @param {*} y   起始点的y坐标
   * @param {*} width   预期的宽度
   * @param {*} height  预期的高度
   * @param {*} rotate  反时针方向转动
      0 : No rotation  90 : Rotate 90 degrees
      180 : Rotate 180 degrees 270 : Rotate 270 degrees
   * @param {*} option 
      P 数据压缩法 0:自动编码  1:二进制模式
      E 纠错等级(范围:0~8)
      M 条形码区域的中心图案  0:该模式将打印左上方对齐的区域
        1:图案印在中间的区域
      Ux,y,c   Human readable  x:指定x坐标下的人类可读字符 
        y:指定y坐标下的人类可读字符  c:每行可读的最大字符数
      W 模块宽度在网点(范围:2~9)
      H 圆点处的条形高度(范围:4~99
      R 最大检索行数
      C 最大列数
      T 截断  0:不截断  1:截断
      Lm   表达式长度
   * @param {*} content 

- 例子

  ```js
  PrinterTspl.SetPdf417('50','50','400','200','0','E3','Without Options')
  PrinterTspl.SetPdf417('50','50','400','200','0','Without Options')

  ```
------

#### 	2.33 **打印二维码**

- 描述

  ```js
  SetQrCode(x,y,level,width,mode,rotation,content,model,mask)
  ```

- 参数
  | 参数               | 描述 
   * @param {*} x        二维码左上角的x坐标
   * @param {*} y        二维码左上角的y坐标
   * @param {*} level    纠错恢复级别 L: 7% M: 15% Q:25% H: 30%
   * @param {*} width    1~10
   * @param {*} mode     自动/手动编码 A:自动 M:手动
   * @param {*} rotation  0 : 0 degree  90 : 90 degree 180 : 180 degree 270 : 270 degree
   * @param {*} content  
   * @param {*} model  M1: original version  M2: enhanced version
   * @param {*} mask   S0~S8, default is S7

- 例子

  ```js
  PrinterTspl.SetQrCode('10','10','H','4','A','0','ABCabc123')
  ```
------

#### 	2.34 **反转图像缓冲区中的一个区域**

- 描述

  ```js
  Reverse(x_start,y_start,x_width,y_height)
  ```

- 参数
  | 参数                | 描述 
   * @param {*} x_start   起始点的x坐标
   * @param {*} y_start   起始点的y坐标
   * @param {*} x_width   x轴区域宽度
   * @param {*} y_height  y轴区域高度

- 例子

  ```js
  PrinterTspl.Reverse('90','90','128','40')
  ```
------

#### 	2.35 **打印文本**

- 描述

  ```js
  PrintText(x,y,font,rotation,x_multi,y_multi,content)
  ```

- 参数
  | 参数             | 描述 
   * @param {*} x       文本的x坐标
   * @param {*} y       文本的y坐标
   * @param {*} font    字体名称
      1, 2, 3, 4, 5, 6, 7, 8, ROMAN.TTF 
      1.EFT, 2.EFT, 3.EFT, 4.EFT, 5.EFT, A.FNT, B.FNT, D.FNT, 
      E8.FNT, F.FNT, G.FNT, H8.FNT, GS.FNT 

   * @param {*} rotation  0:不旋转  90:顺时针方向 180:顺时针方向
    270:顺时针方向
   * @param {*} x_multi  水平乘法
   * @param {*} y_multi   垂直乘法
   * @param {*} content 

- 例子

  ```js
  PrinterTspl.PrintText('10','110','0','0','12','12','FONT 0')
  PrinterTspl.PrintText('800','400','H8.FNT','0','1','1','ABCDEF','3')
  ```
------

#### 	2.36 **打印段落**

- 描述

  ```js
  PrintBlock(x,y,width,height,font,rotation,x_multi,y_multi,content,space,alignment)
  ```

- 参数
  | 参数               |   描述 
   * @param {*} x          文本的x坐标
   * @param {*} y          文本的y坐标
   * @param {*} width      以点表示的段落块的宽度
   * @param {*} height     以点表示的段落块的高度
   * @param {*} font 
      1, 2, 3, 4, 5, 6, 7, 8, ROMAN.TTF 
      1.EFT, 2.EFT, 3.EFT, 4.EFT, 5.EFT, A.FNT, B.FNT, D.FNT, 
      E8.FNT, F.FNT, G.FNT, H8.FNT, GS.FNT 

   * @param {*} rotation   0:不旋转  90:顺时针方向 180:顺时针方向
    270:顺时针方向
   * @param {*} x_multi     水平乘法
   * @param {*} y_multi     垂直乘法
   * @param {*} space      添加或删除行与行之间的空格。
   * @param {*} alignment 
   * @param {*} content 

- 例子

  ```js
  PrinterTspl.PrintBlock('15','15','790','90',"0",'0','8','8',"We stand behind ",'20','2')
  ```
------