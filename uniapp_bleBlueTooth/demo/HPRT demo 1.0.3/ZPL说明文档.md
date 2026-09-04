### 1 ** 加载及使用 **

1.1 将 PrinterHelper2.js 和 print.js 拷贝到utils中。
1.2 在pages/index/index.js中
<!-- 头部加入
```js
const Print = require('../../utils/print.js');
``` -->
在pickerData这个函数中 switch case 3 中 将之前代码
```js
data = zplExp.val;
```
替换成
```js
data = Print.zpl();
```


我们所用的接口都在PrinterZpl这个类中所有的接口都是静态方法，可以直接调用。

### 2 ** 打印接口 **

#### 	2.1 ** 开始指令 **

- 描述
  ``` js
  Start()
  ```

- 参数
  无          

------

#### 	2.2 ** 打印模式 **

- 描述

  ```js
  PrintMode(a,b)
  ```

- 参数
  | 参数          | 描述                                            
  * @param {*} a    所需的模式
  接受的值：
    T = 撕扯 a  P = 剥离 （在 S-300 上不可用）  R = 回卷 （具体取决于打印机型号）
    A = 贴标机 （具体取决于打印机型号）   C = 切纸器 （取决于打印机型号）
    D = 延迟切纸器   F = RFID   L = 保留 a, b  U = 保留 a, b
    K = 自助终端模式 
  默认值：参数 a 是否可用取决于所使用的打印机，以及该打印机是否支持此选项。
    对于 RFID 打印机：
    A = R110PAX4 打印引擎
    F = 其他 RFID打印机

  * @param {*} b    预剥离选择   
  接受的值：
    N = 否
    Y = 是
  默认值：N
    如果缺少参数或参数无效，则系统将忽略此命令。命令的当前值保持不变。

------

#### 	2.3 ** 更改国际字体 / 编码 **

- 描述
  ``` js
  ChangeEncode(a,code)
  ```

- 参数
  | 参数            |   描述                                            
  * @param {*} a        所需的字符集 0-36
  * @param {*} code    （字符输出图像）十进制 0 至 255    
    s1,d1,s2,d2,...
    
- 例子

``` js
    PrinterZpl.ChangeEncode('0','21,36')
```
------

#### 	2.4 ** 开始指令 打印模式  改国际字体 **

- 描述
  ``` js
  SetStart(a,b)
  ```

- 参数
  | 参数            |   描述                                            
  * @param {*} a    所需的模式
  接受的值：
    T = 撕扯 a  P = 剥离 （在 S-300 上不可用）  R = 回卷 （具体取决于打印机型号）
    A = 贴标机 （具体取决于打印机型号）   C = 切纸器 （取决于打印机型号）
    D = 延迟切纸器   F = RFID   L = 保留 a, b  U = 保留 a, b
    K = 自助终端模式 
  默认值：参数 a 是否可用取决于所使用的打印机，以及该打印机是否支持此选项。
    对于 RFID 打印机：
    A = R110PAX4 打印引擎
    F = 其他 RFID打印机

  * @param {*} b   所需的字符集 0-36   
  * 0 = 单字节编码 - 美国 1 字符集  1 = 单字节编码 - 美国 2 字符集
    2 = 单字节编码 - 英国字符集  3 = 单字节编码 - 荷兰字符集
    4 = 单字节编码 - 丹麦 / 挪威字符集  5 = 单字节编码 - 瑞典 / 芬兰字符集
    6 = 单字节编码 - 德国字符集  7 = 单字节编码 - 法国 1 字符集
    8 = 单字节编码 - 法国 2 字符集  9 = 单字节编码 - 意大利字符集
    10 = 单字节编码 - 西班牙字符集       11 = 单字节编码 - 其他字符集
    12 = 单字节编码 - 日本 （包含日元符号的 ASCII）字符集  13 = Zebra 代码页 850
    14 = 双字节亚洲编码   15 = Shift-JIS 
    16 = EUC-JP 和 EUC-CN   17 = Deprecated - UCS-2 Big Endian 
    18 至 23 = 已保留  24 = 单字节亚洲编码 
    25 = 已保留  26 = 包含 ASCII Transparency a 和 c 的多字节亚洲编码
    27 = Zebra 代码页 1252  28 = Unicode （UTF-8 编码） - Unicode 字符集
    29 = Unicode （UTF-16 Big-Endian 编码） - Unicode 字符集
    30 = Unicode （UTF-16 Little-Endian 编码） - Unicode 字符集
    31 = 可缩放字体 （如字体 0）或下载的 TrueType 字体支持 Zebra 代
    码页 1250。位图字体（包括字体 A-H）不
    完全支持 Zebra 代码页 1250。 This value is supported only on 
    Zebra G-Series™ printers.
    33 = 代码页 1251  34 = 代码页 1253  35 = 代码页 1254  36 = 代码页 1255

- 例子

``` js
    PrinterZpl.SetStart('T','14')
```
------

#### 	2.5 **换行**

- 描述

  ```js
  WordWrap()
  ```

- 参数
  无

- 例子

  ```js
    PrinterZpl.WordWrap();
  ```
------

#### 	2.6 **标签长度**

- 描述
  ``` js
  LabelLength(y)
  ```

- 参数
  | 参数            |   描述                                            
  * @param {*} y      y 轴位置 （以点为单位）  1 至 32000                

- 例子

``` js
    PrinterZpl.LabelLength('700')
```
------

#### 	2.7 **结束指令**

- 描述
  ``` js
  SetEnd()
  ```

- 参数
  无          

------

#### 	2.8 **打印宽度**

- 描述
  ``` js
  PageWidth(a)
  ```

- 参数
  | 参数            |   描述                                            
  * @param {*} a     标签宽度 （以点为单位）   接受的值：2 至标签宽度           

- 例子

``` js
    PrinterZpl.PageWidth('500')
```
------


#### 	2.8 **打印数量**

- 描述
  ``` js
  PrintNum(q,p,r,o)
  ```

- 参数
  | 参数       | 描述                                            
  * @param {*} q 要打印的标签总量 接受的值：1 至 99,999,999 默认值：1
  * @param {*} p 暂停和切纸值（暂停之间的标签）接受的值：1 至 99,999,999默认值：0 （无暂停）        
  * @param {*} r 每个序列号的副本数   接受的值：0 至 99,999,999 个副本 默认值：0 （无副本）      
  * @param {*} o 覆盖暂停计数 接受的值：N = 否 Y = 是 默认值：N                 

- 例子

``` js
    PrinterZpl.PrintNum('1','0','1','Y')
```
------

#### 	2.9 **可缩放/位图字体**

- 描述
  ``` js
  ScalableFonts(f,h,w,o)
  ```

- 参数
  | 参数       |  描述                                            
  * @param {*} f  字体名称 A 至 Z，以及 0 至 9
  * @param {*} h  字符高度 （以点为单位）  10 至 32000
  * @param {*} w  宽度 （以点为单位） 10 至 32000
  * @param {*} o  字段方向  N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取             

- 例子

``` js
    PrinterZpl.PrintNum('0','32','25')
    PrinterZpl.PrintNum('D','36','20','N')

```
------

#### 	2.10 **使用字体名称调用字体**

- 描述
  ``` js
  SetFontName(o,h,w,f,x,d)
  ```

- 参数
  | 参数       |  描述                                            
  * @param {*} o  字段方向  N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取  
  * @param {*} h  字符高度 （以点为单位） 
  * @param {*} w  宽度 （以点为单位） 
  * @param {*} f  字体名称 
  * @param {*} x  扩展名 .FNT = 字体 .TTF = TrueType 字体 .TTE = TrueType 扩展名
  * @param {*} d  存储字体的驱动器位置 R、 E、 B 和 A

- 例子

``` js
    PrinterZpl.SetFontName('N','50','50','CYRI_UB','FNT','B')
    PrinterZpl.SetFontName('N','50','50')
    PrinterZpl.SetFontName('N','50','50','CYRI_UB','FNT')
```
------

#### 	2.11 **PDF417 条码**

- 描述
  ``` js
  SetCodePdf417(o,h,s,c,r,t)
  ```

- 参数
  | 参数       |    描述                                            
   * @param {*} o   方向  N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取  
   * @param {*} h    各层的条码高度 （以点为单位）
   * @param {*} s    安全级别 1-8 默认值：0
   * @param {*} c    要编码的数据列数 1-30  默认值：1:2 （行 - 列长宽比）
   * @param {*} r    要编码的行数 3-90 默认值：1:2 （行 - 列长宽比）
   * @param {*} t    截断层右行指示符和终止图案 N = 无截断 Y = 执行截断 默认值：N

- 例子

``` js
    PrinterZpl.SetCodePdf417('N','5','5','','83','N')
    PrinterZpl.SetCodePdf417('N','8','5','7','21','N')

```
------

#### 	2.12 **code 128 条码**

- 描述
  ``` js
  SetBarCode(o,h,f,g,e,m)
  ```

- 参数
  | 参数       |    描述                                            
   * @param {*} o   方向  N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取  
   * @param {*} h   条码高度 （以点为单位） 1 到 32000
   * @param {*} f   打印注释行 Y = 是 N = 否 默认值： Y
   * @param {*} g   在条码上方打印注释行 Y = 是 N = 否 默认值： N
   * @param {*} e   UCC 校验位 Y （启用）或 N （禁用）默认值：N
   * @param {*} m   模式 N = 未选择模式;U = UCC Case 模式;A = 自动模式;D = UCC/EAN 模式   默认值：N

- 例子

``` js
    PrinterZpl.SetBarCode('N','100','Y','N','N')

```
------

#### 	2.13 **UPS MaxiCode 条码**

- 描述
  ``` js
  SetMaxiCode(m,n,t)
  ```

- 参数
  | 参数       |    描述                                            
   * @param {*} m  模式 默认值：2  
   2 = 结构化承运人消息：数值型邮政编码 （美国）
   3 = 结构化承运人消息：字母数字邮政编码 （美国以外）
   4 = 标准符号，秘书   5 = 完整 EEC  6 = 读取程序，秘书
   * @param {*} n  符号编号1 至 8 默认值：1
   * @param {*} t  符号总数1 至 8 默认值：1

- 例子

``` js
    PrinterZpl.SetMaxiCode()
    PrinterZpl.SetMaxiCode('2','1','1')

```
------

#### 	2.14 **Aztec 条码/ANSI Codabar 条码**

- 描述
  ``` js
  SetCodeVI(command,o,e,h,f,g,k,l)
  ```

- 参数 7个参数
  | 参数                |        描述      
   * @param {*} command          0: Aztec 条码;K:ANSI Codabar 条码

   * @param {*} o                o为方向 方向 ( N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取 )

   * @param {*} e   
   <br/> command 为0 时  e为放大系数 1 至 10
   <br/> command 为K 时  e为校验位 Fixed Value: N

   * @param {*} h   
   <br/> command 为0 时  h为扩展通道注释代码指示符 Y = 如果数据包含 ECIC;  N = 如果数据不包含 ECIC  默认值：N
   <br/> command 为K 时  h为 条码高度 （以点为单位） 1 至 32000

   * @param {*} f   
   <br/> command 为0 时  f为 错误控制和符号大小 /类型指示符 0 = 默认纠错级别; 1 至 99 = 纠错百分比 （最低）; 101 至 104 = 1 至 4 层精简符号 ;201 至 232 = 1 至 32 层全范围符号; 300 = 一种简单的 Aztec“ 记号 ” 默认值：0
   <br/> command 为K 时  f为 打印注释行 N = 否 Y = 是  默认值：Y

   * @param {*} g 
   <br/> command 为0 时  g为菜单符号指示符 Y = 如果此符号要作为菜单 （条码读取器初始化）符号; N = 如果此符号不是菜单符号 默认值：N
   <br/> command 为K 时  g为在条码上方打印注释行 N = 否 Y = 是  默认值：N

   * @param {*} k 
   <br/> command 为0 时  k为用于结构化附加的符号数量 接受的值：1 至 26  默认值：1
   <br/> command 为K 时  k为指定起始字符 接受的值：A、 B、 C、 D 默认值：A

   * @param {*} l  
   <br/> command 为0 时  l为用于结构化附加的可 选 ID 字段 ID 字段是一个文本串，最多可包含 24 个字符 默认值：无 ID
   <br/> command 为K 时  l为指定终止字符 接受的值：A、 B、 C、 D 默认值：A


- 例子

``` js
    PrinterZpl.SetCodeVI('0','R','7','N','0','N','1','0')//Aztec 条码
    PrinterZpl.SetCodeVI('K','N','N','150','Y','N','A','A')//ANSI Codabar 条码
```
------


#### 	2.15 **Code 11 条码/交叉二五码/Code 39 条码/Code 49 条码/Planet Code 条码/EAN-8 条码/UPC-E 条码/Code 93 条码/EAN-13 条码/Industrial 2 of 5 条码/Standard 2 of 5 条码**

- 描述
  ``` js
  SetCodeII(num,o,e,h,f,g)
  ```

- 参数 5个参数
  | 参数             |        描述      
   * @param {*} num    1: Code 11 条码; 2:交叉二五码;3:Code 39 条码; 4:Code 49 条码; 5:Planet Code 条码;
   8:EAN-8 条码; 9:UPC-E 条码; A:Code 93 条码; E:EAN-13 条码; I:Industrial 2 of 5 条码; J:Standard 2 of 5 条码;

   * @param {*} o   o为方向 ( N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取 )

   * @param {*} e   
   <br/> num 为1 时  e为校验位 Y = 1 位 N = 2 位 默认值： N
   <br/> num 为3 时  e为Mod-43 校验位 Y = 是 N = 否 默认值： N
   <br/> num 为4 时  e为各层高度乘积 1 至标签高度
   <br/> num 为5 时  e为条码高度 （以点为单位） 1 到 9999

   <br/> num 为 2 或者 8 或者 9 或者 A 或者 E 或者 I 或者 J 时  e为条码高度 （以点为单位） 1 到 32000


   * @param {*} h   
   <br/> num 为1 或者 3 时  h为条码高度 （以点为单位） 1 到 32000
   <br/> num 为4 时  h为打印注释行 N = 不打印任何行;A = 在条码上方打印注释行;B = 在条码下方打印注释行 默认值：N
   <br/> num 为5 时  h为打印注释行 Y = 是 N = 否 默认值： N
   <br/> num 为2 或者 8 或者 9 或者 A 或者 E 或者 I 或者 J 时  h为打印注释行 Y = 是 N = 否 默认值： Y

   * @param {*} f   
   <br/> num 为1 或者 3 时  f为打印注释行 Y = 是 N = 否 默认值： Y
   <br/> num 为4 时  f为开始模式 0 = 常规字母数字模式;1 = 复读取字母数字;2 = 常规数字模式;3 = 组字母数字模式;4 = 常规字母数字 Shift 1;5 = 常规字母数字 Shift 2;A = 自动模式。打印机会通过分析字段数据来确定开始模式。默认值：A
   <br/> num 为5 时  f为确定是否将注释行打印在条码之上 N = 否 Y = 是  默认值：N
   <br/> num 为2 或者 8 或者 9 或者 A 或者 E 或者 I 或者 J 时  f为在条码上方打印注释行 Y = 是 N = 否 默认值： N


   * @param {*} g 
   <br/> num 为1 或者3 时  g为在条码上方打印注释行 Y = 是 N = 否 默认值： N
   <br/> num 为2 时  g为计算并打印 Mod 10 校验位 Y = 是 N = 否 默认值： N
   <br/> num 为4 或者5 或者8 或者 E 或者 I 或者 J  时 无此项
   <br/> num 9 或者 A 时 g为打印校验位 N = 否 Y = 是 默认值：Y

- 例子

``` js
    PrinterZpl.SetCodeII('1','N','N','150','Y','N')//Code 11 条码
    PrinterZpl.SetCodeII('2','N','150','Y','N','N')//交叉二五码
    PrinterZpl.SetCodeII('3','N','N','100','Y','N')// Code 39 条码
    PrinterZpl.SetCodeII('4','N','20','A','A')// Code 49 条码
    PrinterZpl.SetCodeII('5','N','100','Y','N')// Planet Code 条码
    PrinterZpl.SetCodeII('8','N','100','Y','N')// EAN-8 条码
    PrinterZpl.SetCodeII('9','N','100','Y','N','Y')//  UPC-E 条码
    PrinterZpl.SetCodeII('A','N','100','Y','N','N')//  Code 93 条码
    PrinterZpl.SetCodeII('E','N','100','Y','N')// EAN-13 条码
    PrinterZpl.SetCodeII('I','N','150','Y','N')// Industrial 2 of 5 条码
    PrinterZpl.SetCodeII('J','N','150','Y','N')// Standard 2 of 5 条码


```
------



#### 	2.16 **MicroPDF417 条码/LOGMARS 条码**

- 描述
  ``` js
  SetCodeIII(command,o,h,m)
  ```

- 参数 3个参数
  | 参数       |    描述 
  * @param {*} command    F: MicroPDF417 条码;L:LOGMARS 条码
  * @param {*} o   o为方向 ( N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取 )

  * @param {*} h 
  <br/> command 为F 时  h为 条码高度 （以点为单位） 1 至 9999
  <br/> command 为L 时  h为 条码高度 （以点为单位） 1 至 32000

  * @param {*} m   
  <br/> command 为F 时  m为 模式 0 至 33 默认值：0
  <br/> command 为L 时  m为 在条码上方打印注释行 N = 否 Y = 是 默认值：N
  
- 例子

``` js
    PrinterZpl.SetCodeIII('F','N','8','3')//MicroPDF417 条码
    PrinterZpl.SetCodeIII('L','N','100','N')LOGMARS 条码
```
------


#### 	2.17 **MSI 条码**

- 描述
  ``` js
  SrtCodeIV(command,o,e,h,f,g,e2)
  ```

- 参数 3个参数
  | 参数       |    描述 
  * @param {*} command    M: MSI 条码
  * 
  * @param {*} o   o为方向 ( N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取 )

  * @param {*} e 
  <br/> command 为M 时  e为选择校验位 A = 无校验位;B = 1 Mod 10;C = 2 Mod 10;D = 1 Mod 11 和 1 Mod 10;默认值：B

  * @param {*} h   
  <br/> command 为M 时  h为 条码高度 （以点为单位）1 至 32000

  * @param {*} f   
  <br/> command 为M 时  f为 打印注释行 N = 否;Y = 是;默认值：Y

  * @param {*} g   
  <br/> command 为M 时  g为在条码上方打印注释行 N = 否;Y = 是;默认值：N

  * @param {*} e2   
  <br/> command 为M 时  e2为在注释行中插入校验位 N = 否;Y = 是;默认值：N
  
- 例子

``` js
    PrinterZpl.SrtCodeIV('M','N','B','100','Y','N','N')//MSI 条码
```
------





#### 	2.18 **二维码**

- 描述
  ``` js
  SetQR(a,b,c,d,e)
  ```

- 参数
  | 参数       |    描述                                            
   * @param {*} a   字段方向
   * @param {*} b   模式 1 （原始）和 2 （增强 – 推荐） 默认值：2
   * @param {*} c   放大系数 ：1 至 10
   * @param {*} d   H = 极高可靠性级别;Q = 高可靠性级别;M = 标准级别;L = 高密度级别
   * @param {*} e   N、 A、 B.K ：1 - 7

- 例子

``` js
    PrinterZpl.SetQR('N','2','10','Q','7')

```
------

#### 	2.19 **更改模块宽度**

- 描述
  ``` js
  SetWidth(w,r,h)
  ```

- 参数
  | 参数       |    描述                                            
   * @param {*} w   模块宽度 （以点为单位）：1 至 10
   * @param {*} r   宽条与窄条的宽度比 2.0 至 3.0，增量为 0.1 默认值：3.0
   * @param {*} h   条码高度 （以点为单位）开机时的初始值：10

- 例子

``` js
    PrinterZpl.SetWidth('3')

```
------

#### 	2.20 **更改字母数字默认字体**

- 描述
  ``` js
  SetFont(f,h,w)
  ```

- 参数
  | 参数       |    描述                                            
   * @param {*} f   指定的默认字体 A 至 Z 和 0 至 9 开机时的初始值：A
   * @param {*} h   单个字符高度 （以点为单位）：0 至 32000 开机时的初始值：9
   * @param {*} w   单个字符宽度 （以点为单位）：0 至 32000  开机时的初始值：5 或上一次永久保存的值

- 例子

``` js
    PrinterZpl.SetFont('0','89')

```
------

#### 	2.22 **立即切纸 CN/移除标签CP/条码验证CV**

- 描述
  ``` js
  SetCI(command,a)
  ```

- 参数
  | 参数       |     描述                                            
   * @param {*} command    N:立即切纸;P:移除标签;V:条码验证
   * @param {*} a     
   command = N  a 为 切纸模式覆盖  0 = 使用通过 ^KV 设置的 “ 自助终端模式切纸量 ”;1 = 忽略通过 ^KV 设置的 “ 自助终端模式切纸量 ”，并执行完整切纸

   command = P  a为自助终端出纸模式 
   0 = 吐出已呈递的纸张;1 = 回收已呈递的纸张;2 = 执行 ^KV 命令 c 参数定义的操作。

   command = V  a为条码验证 N = 否;Y = 是;默认值：N

- 例子

``` js
    PrinterZpl.SetCI('N','0')//立即切纸
    PrinterZpl.SetCI('P','0')//移除标签
    PrinterZpl.SetCI('V','Y')//条码验证CV

```
------

#### 	2.23 **字体标识符**

- 描述
  ``` js
  SetCW(a,d,o,x)
  ```

- 参数
  | 参数       |     描述  
  * @param {*} a     要替换的现有字体，或要添加的新字体的字母：A 至 Z 和 0 至 9
  * @param {*} d     用于存储字体的设备 （可选） R E B A 默认R
  * @param {*} o     要替换内置字体或用作附加字体的已下载字体的名称
  * @param {*} x      扩展名.FNT = 字体;.TTF = TrueType 字体;.TTE = TrueType 扩展名

- 例子

``` js
  PrinterZpl.SetCW('A','R','NEWFONT','FNT')
```
------

#### 	2.24 **字段块**

- 描述
  ``` js
  SetFB(a,b,c,d,e)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a    文本块行的宽度 默认值：0
  * @param {*} b    文本块的最大行数：1 至 9999
  * @param {*} c    添加或删除行间空格：-9999 至 9999 默认值：0
  * @param {*} d    文本对齐 L = 左对齐;C = 居中;R = 右对齐;J = 两端对齐;默认值：L
  * @param {*} e    第二行与其余行的悬挂缩进量 ：0 至 9999  默认值：0

- 例子

``` js
  PrinterZpl.SetFB('250','4','','L','')
```
------

#### 	2.25 **字段时钟**

- 描述
  ``` js
  SetFC(a,b,c)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a    主时钟指示符 任意 ASCII 字符默认值：%
  * @param {*} b    第二个时钟指示符 任意 ASCII 字符 默认值：无 — 该值不能与 a 或 c 相同
  * @param {*} c    第三个时钟指示符 任意 ASCII 字符 默认值：无 — 该值不能与 a 或 b 相同

- 例子

``` js
  PrinterZpl.SetFC('%','{','#')
```
------

#### 	2.26 **打印文本**

- 描述
  ``` js
  PrintText(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a    要打印的数据

- 例子

``` js
  PrinterZpl.PrintText('755AM')
```
------

#### 	2.27 **字段十六进制指示符**

- 描述
  ``` js
  SetFH(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a     十六进制指示符 除当前格式和控制前缀 （默认为 ^ 和 ~）之外的任意字符  默认值：_ （下划线）

- 例子

``` js
  PrinterZpl.SetFH('^')
```
------

#### 	2.28 **多个字段起始位置**

- 描述
  ``` js
  SetFM(data)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} data  连续的 X、 Y 对 最大对数：60
- 例子

``` js
  PrinterZpl.SetFM('100,100,100,600,100,1200')
```
------

#### 	2.29 **字段起始位置**

- 描述
  ``` js
  SetFO(x,y,z)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000
  * @param {*} z   对齐方式
  0 = 左对齐;1 = 右对齐;2 = 自动对齐

- 例子

``` js
  PrinterZpl.SetFO('20','50','2')
```
------

#### 	2.30 **垂直和反色设置字体字段格式**

- 描述
  ``` js
  SetFP(d,g)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} d   方向  H = 水平打印 （从左到右）;V = 垂直打印 （从上到下）;R = 反色打印 （从右到左）;默认值：H
  * @param {*} g   附加的字符间距 值：0 至 9999

- 例子

``` js
  PrinterZpl.SetFP('V','10')
  PrinterZpl.SetFP('R','10')

```
------

#### 	2.31 **字段反色打印**

- 描述
  ``` js
  SetFR()
  ```

- 参数
  无

------

#### 	2.32 **表示字段定义已结束**

- 描述
  ``` js
  SetFS()
  ```

- 参数
  无

------

#### 	2.33 **设置字段位置**

- 描述
  ``` js
  SetFT(x,y,z)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000
  * @param {*} z   对齐方式
  0 = 左对齐;1 = 右对齐;2 = 自动对齐

- 例子

``` js
  PrinterZpl.SetFT('10','200')
  PrinterZpl.SetFT('0','0')

```
------

#### 	2.34 **字段变量**

- 描述
  ``` js
  SetFV(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a  要打印的变量字段数据：0 至 3072 个字节串

- 例子

``` js
  PrinterZpl.SetFV('VARIABLE DATA #1')
  PrinterZpl.SetFS()//表示字段定义已结束

```
------

#### 	2.35 **字段方向**

- 描述
  ``` js
  SetFW(r)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} r  旋转字段 N = 正常;R = 顺时针旋转 90 度;I = 反转 180 度;B = 逆时针旋转 270 度，逆时针读取;开机时的初始值：N

- 例子

``` js
  PrinterZpl.SetFW('R')

```
------

#### 	2.36 **注释**

- 描述
  ``` js
  SetFX(c)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} c  非打印注释

- 例子

``` js
  PrinterZpl.SetFX('SHIPPING LABEL')

```
------

#### 	2.37 **方框**

- 描述
  ``` js
  SetGB(w,h,t,c,r)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} w  方框宽度：t 值至 32000 默认值：厚度 (t) 值或 1
  * @param {*} h  方框高度：t 值至 32000 默认值：厚度 (t) 值或 1
  * @param {*} t  边框厚度：1 至 32000 默认值：1
  * @param {*} c  线条颜色 B = 黑色;W = 白色;默认值：B
  * @param {*} r  圆角程度：0 （不圆）至 8 （最圆） 默认值：0

- 例子

``` js
  PrinterZpl.SetGB('300','200','10','B','5')
  PrinterZpl.SetGB('300','200','10','','10')

```
------

#### 	2.38 **圆**

- 描述
  ``` js
  SetGC(d,t,c)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} d  圆的直径 值：3 至 4095 默认值：3
  * @param {*} t  边框厚度 值：2 至 4095 默认值：1
  * @param {*} c  线条颜色 B = 黑色;W = 白色;默认值：B

- 例子

``` js
  PrinterZpl.SetGC('250','10','B')

```
------

#### 	2.39 **对角线**

- 描述
  ``` js
  SetGD(w,h,t,c,o)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} w   方框宽度：3 至 32000 默认值：t （厚度）值或 3
  * @param {*} h  方框高度：3 至 32000 默认值：t （厚度）值或 3
  * @param {*} t  边框厚度 ：1 至 32000 默认值：1
  * @param {*} c  线条颜色 B = 黑色;W = 白色;默认值：B
  * @param {*} o   方向 （对角线方向） R ( 或 /) = 对角线右倾;L ( 或 \) = 对角线左倾;默认值：R

- 例子

``` js
  PrinterZpl.SetGD('330','183','10','B','R')

```
------

#### 	2.40 **椭圆**

- 描述
  ``` js
  SetGE(w,h,t,c)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} w    椭圆宽度：3 至 4095 默认值：t （厚度）值或 1
  * @param {*} h  椭圆高度：3 至 4095 默认值：t （厚度）值或 1
  * @param {*} t  边框厚度 ：2 至 4095 默认值：1
  * @param {*} c  线条颜色 B = 黑色;W = 白色;默认值：B

- 例子

``` js
  PrinterZpl.SetGE('300','100','10','B')

```
------

#### 	2.41 **设置每毫米点数**

- 描述
  ``` js
  SetJM(n)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} n    设置每毫米点数
  A = 每毫米 24 点、每毫米 12 点、每毫米 8 点或每毫米 6 点;B = 每毫米 12 点、每毫米 6 点、每毫米 4 点或每毫米 3 点;默认值：A

- 例子

``` js
  PrinterZpl.SetJM('A')

```
------

#### 	2.42 **重新打印出错后**

- 描述
  ``` js
  SetJZ(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a    出错后重新打印 N = 否;Y = 是;开机时的初始值：Y

- 例子

``` js
  PrinterZpl.SetJZ('Y')

```
------

#### 	2.44 **设置标签的起始位置**

- 描述
  ``` js
  SetLH(x,y)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x  x 轴位置0 至 32000
  * @param {*} y   y 轴位置0 至 32000

- 例子

``` js
  PrinterZpl.SetLH('0','0')

```
------

#### 	2.45 **标签反色打印**

- 描述
  ``` js
  SetLR(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a  反色打印所有字段 N = 否;Y = 是;开机时的初始值：N 

- 例子

``` js
  PrinterZpl.SetLR('N')

```
------

#### 	2.46 **标签移位**

- 描述
  ``` js
  SetLS(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a   向左移动值 -9999 至 9999 
  开机时的初始值：0

- 例子

``` js
  PrinterZpl.SetLS('10')

```
------

#### 	2.47 **将整个标签格式从其当前位置向上或向下移动最多 120 点行 （相对于标签顶部边缘）**

- 描述
  ``` js
  SetLT(x)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x    标签顶部 HC100：0 至 120
XiIIIPlus 600dpi：-240 至 240
所有其他 Zebra 打印机：-120 至 120

- 例子

``` js
  PrinterZpl.SetLT('10')

```
------

#### 	2.48 **调整相对于当前暗度设置的暗度**

- 描述
  ``` js
  SetMD(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a   介质暗度水平 -30 至 30

- 例子

``` js
  PrinterZpl.SetMD('10')

```
------

#### 	2.49 **打印标签镜像**

- 描述
  ``` js
  SetPM(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a   打印整个标签的镜像 N = 否;Y = 是;默认值：N

- 例子

``` js
  PrinterZpl.SetPM('Y')

```
------

#### 	2.50 **打印方向**

- 描述
  ``` js
  SetPO(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a   反转标签180 度 N = 正常;I = 反转;默认值：N

- 例子

``` js
  PrinterZpl.SetPO('I')

```
------

#### 	2.51 **打印数量**

- 描述
  ``` js
  SetPQ(q,p,r,o)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} q   要打印的标签总量 1 至 99,999,999 默认值：1
  * @param {*} p  暂停和切纸值：1 至 99,999,999 默认值：0 （无暂停）
  * @param {*} r 每个序列号的副本数 ：0 至 99,999,999 个副本 默认值：0 （无副本）
  * @param {*} o 覆盖暂停计数 N = 否;Y = 是;默认值：N

- 例子

``` js
  PrinterZpl.SetPQ('50','10','1','Y')

```
------

#### 	2.52 **打印速率**

- 描述
  ``` js
  SetPR(p,s,b)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} p   打印速度 默认值：A
  <br/>
    1 = 25.4 毫米 / 秒 （1 英寸 / 秒） 
    A 或 2 = 50.8 毫米 / 秒 （2 英寸 / 秒）
    B 或 3 = 76.2 毫米 / 秒 （3 英寸 / 秒）
    C 或 4 = 101.6 毫米 / 秒 （4 英寸 / 秒）
    5 = 127 毫米 / 秒 （5 英寸 / 秒）
    D 或 6 = 152.4 毫米 / 秒 （6 英寸 / 秒）
    E 或 8 = 203.2 毫米 / 秒 （8 英寸 / 秒）
    9 = 220.5 毫米 / 秒 （9 英寸 / 秒）
    10 = 245 毫米 / 秒 （10 英寸 / 秒）
    11 = 269.5 毫米 / 秒 （11 英寸 / 秒）
    12 = 304.8 毫米 / 秒 （12 英寸 / 秒）
    13 = 13 英寸 / 秒 
    14 = 14 英寸 / 秒
  <br/>
  * @param {*} s   空甩速度 默认值：D
  <br/>
    A 或 2 = 50.8 毫米 / 秒 （2 英寸 / 秒）
    B 或 3 = 76.2 毫米 / 秒 （3 英寸 / 秒）
    C 或 4 = 101.6 毫米 / 秒 （4 英寸 / 秒）
    5 = 127 毫米 / 秒 （5 英寸 / 秒）
    D 或 6 = 152.4 毫米 / 秒 （6 英寸 / 秒）
    E 或 8 = 203.2 毫米 / 秒 （8 英寸 / 秒）
    9 = 220.5 毫米 / 秒 （9 英寸 / 秒）
    10 = 245 毫米 / 秒 （10 英寸 / 秒）
    11 = 269.5 毫米 / 秒 （11 英寸 / 秒）
    12 = 304.8 毫米 / 秒 （12 英寸 / 秒）
    13 = 13 英寸 / 秒 
    14 = 14 英寸 / 秒 
  <br/>
  * @param {*} b   回撤速度 默认值：A
  <br/>
    A 或 2 = 50.8 毫米 / 秒 （2 英寸 / 秒）
    B 或 3 = 76.2 毫米 / 秒 （3 英寸 / 秒）
    C 或 4 = 101.6 毫米 / 秒 （4 英寸 / 秒）
    5 = 127 毫米 / 秒 （5 英寸 / 秒）
    D 或 6 = 152.4 毫米 / 秒 （6 英寸 / 秒）
    E 或 8 = 203.2 毫米 / 秒 （8 英寸 / 秒）
    9 = 220.5 毫米 / 秒 （9 英寸 / 秒）
    10 = 245 毫米 / 秒 （10 英寸 / 秒）
    11 = 269.5 毫米 / 秒 （11 英寸 / 秒）
    12 = 304.8 毫米 / 秒 （12 英寸 / 秒）
    13 = 13 英寸 / 秒
    14 = 14 英寸 / 秒
  <br/>


- 例子

``` js
  PrinterZpl.SetPR('A')

```
------

#### 	2.53 **打印宽度**

- 描述
  ``` js
  SetPW(a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} a   标签宽度 2 至标签宽度

- 例子

``` js
  PrinterZpl.SetPW('500')

```
------

#### 	2.55 **序列化数据**

- 描述
  ``` js
  SetSN(v,n,z)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} v   起始值 默认值：1
  * @param {*} n   增量值或减量值 最多 12 位数字 默认值：1
  * @param {*} z  添加前导零 N = 否 Y = 是
默认值：N

- 例子

``` js
  PrinterZpl.SetSN('001','1','Y')

```
------


#### 	2.55 **条形码**

- 描述
  包含设置字段位置、条码字段默认值、 条形码以及字段数据、字段分隔符

  ``` js
  BarCode(x,y,w,o,h,f,g,e,a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000
  * @param {*} w   模块宽度 （以点为单位）：1 至 10
  * @param {*} o   方向  N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取  
  * @param {*} h   条码高度 （以点为单位） 1 到 32000
  * @param {*} f   打印注释行 Y = 是 N = 否 默认值： Y
  * @param {*} g   在条码上方打印注释行 Y = 是 N = 否 默认值： N
  * @param {*} e   UCC 校验位 Y （启用）或 N （禁用）默认值：N
  * @param {*} a     要打印的数据

- 例子

``` js
  PrinterZpl.BarCode('240','110','3','N','90','N','N','N','755123456789')

```
------

#### 	2.56 **二维码**

- 描述
  包含设置字段起始位置、QR Code 条码、 字段数据、字段分隔符

  ``` js
  PrintQR(x,y,g,e,a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000
  * @param {*} g   模式 1 （原始）和 2 （增强 – 推荐） 默认值：2
  * @param {*} e   放大系数 ：1 至 10
  * @param {*} a   要打印的数据
 

- 例子

``` js
  PrinterZpl.PrintQR('100','100','2','10','MM,AAC-42')

```
------

#### 	2.57 **字体名称调用字体**

- 描述
  包含设置字段位置、字体名称调用字体、字体、打印数量、字段数据、字段分隔符
  
  ``` js
  FontName(x,y,o,h,w,f,d,a,x1,y1,q1,w1,e1,r1)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000 
  * @param {*} o  字段方向  N = 正常 R = 旋转 90 度 （顺时针） I = 反转 180 度 B = 逆时针 90 度读取  
  * @param {*} h  字符高度 （以点为单位） 
  * @param {*} w  宽度 （以点为单位） 
  * @param {*} f  字体名称 
  * @param {*} d  扩展名 .FNT = 字体 .TTF = TrueType 字体 .TTE = TrueType 扩展名 
  * @param {*} a   要打印的数据
  * @param {*} x1  指定的默认字体 A 至 Z 和 0 至 9 开机时的初始值：A
  * @param {*} y1  单个字符高度 （以点为单位）：0 至 32000 开机时的初始值：9
  * @param {*} q1  要打印的标签总量 接受的值：1 至 99,999,999 默认值：1
  * @param {*} w1  暂停和切纸值（暂停之间的标签）接受的值：1 至 99,999,999默认值：0 （无暂停）
  * @param {*} e1  每个序列号的副本数   接受的值：0 至 99,999,999 个副本 默认值：0 （无副本）
  * @param {*} r1  覆盖暂停计数 接受的值：N = 否 Y = 是 默认值：N   

- 例子

``` js
  PrinterZpl.FontName('220','400','N','30','30','SIMSUN','TTF','服务费5：25元')
  PrinterZpl.FontName('430','460','N','30','30','SIMSUN','TTF','签收：李','0','20')
  PrinterZpl.FontName('430','460','N','30','30','SIMSUN','TTF','签收：李','0','30','1','0','1','Y')

```
------

#### 	2.58 **框**

- 描述
  包含设置字段位置、正方框、字段分隔符
  
  ``` js
  Box(command,x,y,w,h,t)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} command   T 、O
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000 
  * @param {*} w  方框宽度：t 值至 32000 默认值：厚度 (t) 值或 1
  * @param {*} h  方框高度：t 值至 32000 默认值：厚度 (t) 值或 1
  * @param {*} t  边框厚度：1 至 32000 默认值：1

- 例子

``` js
  PrinterZpl.Box('T','10','155','770','0','3')
  PrinterZpl.Box('O','30','400','110','110','3')

```
------

#### 	2.59 **字体**

- 描述
  包含设置字段位置、字体、 字段数据、字段分隔符
  
  ``` js
  font(x,y,f,h,a)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000
  * @param {*} f   指定的默认字体 A 至 Z 和 0 至 9 开机时的初始值：A
  * @param {*} h   单个字符高度 （以点为单位）：0 至 32000 开机时的初始值：9
  * @param {*} a  要打印的数据

- 例子

``` js
    PrinterZpl.font('50','260','0','120','755-')
```
------

#### 	2.60 **Data Matrix 条码**

- 描述
  包含设置字段起始位置、Data Matrix 条码、 字段数据、字段分隔符

  ``` js
  Matrix(x,y,o,h,s,c,r,f,g,a,da)
  ```

- 参数
  | 参数       |    描述  
  * @param {*} x   x 轴位置 值：0 至 32000
  * @param {*} y   y 轴位置 值：0 至 32000
  * @param {*} o   方向 N:正常 R = 旋转 90 度 （顺时针）I = 反转 180 度 B = 逆时针 90 度读取
  * @param {*} h 各个符号元素的空间高度
  * @param {*} s 规格级别 0、 50、 80、 100、 140、 200 默认值：0
  * @param {*} c  要编码的列 9 至 49
  * @param {*} r 要编码的行9 至 49
  * @param {*} f 格式 ID （0 至 6） — 不用于设置为 200 的规格 
  * @param {*} g 换码序列控制符 任意字符 默认值：~ （波浪符）
  * @param {*} a 长宽比 1 = 正方形 2 = 矩形 默认值：1
  * @param {*} da  要打印的数据
 

- 例子

``` js
  PrinterZpl.Matrix('360','400','N','6','200','32','32','','','1','755123456789,755AM')

```
------