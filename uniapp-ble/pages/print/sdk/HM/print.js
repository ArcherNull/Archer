import PrinterCpcl from './PrinterHelperCpcl.js'
import PrinterTspl from './PrinterHelperTspl.js'
import PrinterZpl from './PrinterHelperZpl.js'
import PrinterEsc from './PrinterHelperEsc.js'



export function cpcl() {  
    PrinterCpcl.data = ""
    PrinterCpcl.PrintAreaSize("0","200","200","1000","1");
    PrinterCpcl.PageWidth("576")
    PrinterCpcl.Line("0","100","576","100","1")
    PrinterCpcl.Line("0","176","576","176","1")
    PrinterCpcl.Line("0","260","576","260","1")
    PrinterCpcl.Line("0","396","576","396","1")
    PrinterCpcl.Line("0","525","576","525","1")
    PrinterCpcl.WordWrap();

    PrinterCpcl.Line("0","679","576","679","1")
    PrinterCpcl.Line("0","845","576","845","1")
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();

    PrinterCpcl.SetMag("1","2")
    PrinterCpcl.SetBold("1")
    PrinterCpcl.Text(PrinterCpcl.text,"8","10","170","30","121")
    PrinterCpcl.Box("16","194","66","254","5")
    PrinterCpcl.SetMag("2","2")
    PrinterCpcl.SetBold("2")
    PrinterCpcl.Text(PrinterCpcl.text,"8","0","370","15","快递到付")
    PrinterCpcl.WordWrap();

    PrinterCpcl.Align(PrinterCpcl.left)
    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.SetBold("1")
    PrinterCpcl.Text(PrinterCpcl.text,"4","0","28","208","集")
    PrinterCpcl.SetBold("2")
    PrinterCpcl.Box("16","194","66","254","5")
    PrinterCpcl.SetBold("1")
    PrinterCpcl.Text(PrinterCpcl.text,"4","84","5","295","收")
    PrinterCpcl.SetBold("1")
    PrinterCpcl.Text(PrinterCpcl.text,"4","76","5","425","寄")
    PrinterCpcl.WordWrap();

    PrinterCpcl.SetMag("2","2")
    PrinterCpcl.SetBold("1")
    PrinterCpcl.Text(PrinterCpcl.text,"8","0","160","111","深圳宝安区内包")
    PrinterCpcl.SetBold("2")
    PrinterCpcl.Align(PrinterCpcl.left)
    PrinterCpcl.Text(PrinterCpcl.text,"8","0","72","196","666")
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();

    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.WordWrap();

    PrinterCpcl.SetBold("1")
    PrinterCpcl.Text(PrinterCpcl.text,"4","0","72","279","收件人姓名 18888888888")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.SetMag("0","0")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.WordWrap();

    PrinterCpcl.Text(PrinterCpcl.text,"8","0","72","351","666")
    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.SetBold("1")
    PrinterCpcl.Text(PrinterCpcl.text,"4","0","72","410","寄件人姓名 12345678912")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.SetMag("0","0")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.Text(PrinterCpcl.text,"8","0","72","452","福建省厦门市厦門漢印什么区$￥！~$!~")
    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.SetMag("0","0")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.WordWrap();

    PrinterCpcl.Text(PrinterCpcl.text,"8","0","72","482","鳗雲洺泃鮰鱼")
    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();

    PrinterCpcl.Align(PrinterCpcl.center)
    PrinterCpcl.Barcode(PrinterCpcl.barcode,"128","3","3","80","0","531","776250157441445")
    PrinterCpcl.SetMag("2","2")
    PrinterCpcl.Text(PrinterCpcl.text,"8","0","0","620","776250157441445")
    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();

    PrinterCpcl.Align(PrinterCpcl.left)
    PrinterCpcl.SetMag("1","1")

    PrinterCpcl.Line("340","680","340","845","1")
    PrinterCpcl.SetMag("0","0")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.Text(PrinterCpcl.text,"55","0","15","700","物品：日用品")
    PrinterCpcl.Text(PrinterCpcl.text,"55","0","15","725","重量：1.00kg")
    PrinterCpcl.Text(PrinterCpcl.text,"55","0","15","750","月结编号：1234567")
    PrinterCpcl.Text(PrinterCpcl.text,"55","0","15","775","业务员：菠萝")
    PrinterCpcl.Text(PrinterCpcl.text,"55","0","15","800","打印时间：2020-12-25 13:35")
    PrinterCpcl.WordWrap();

    PrinterCpcl.Text(PrinterCpcl.text,"55","0","400","700","申通公众号 一键下单")
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();

    PrinterCpcl.PrintQR(PrinterCpcl.barcode,"430","730","2","3","https://weixin.sto.cn/Order/OrderN")
    PrinterCpcl.WordWrap();

    PrinterCpcl.SetBold("1")

    PrinterCpcl.Text(PrinterCpcl.text,"8","0","15","855","签收人/时间：")
    PrinterCpcl.Text(PrinterCpcl.text,"55","0","15","895","您的签字代表您已验收此包裹，请仔细确认商品包装完好。")
    PrinterCpcl.Text(PrinterCpcl.text,"55","0","15","925","全国统一客服热线：95543")
    PrinterCpcl.WordWrap();

    PrinterCpcl.SetMag("1","1")
    PrinterCpcl.Box("438","900","542","948","1")
    PrinterCpcl.SetMag("0","0")
    PrinterCpcl.SetBold("0")
    PrinterCpcl.Text(PrinterCpcl.text,"8","0","455","914","已验视")
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.WordWrap();
    PrinterCpcl.Print()
    PrinterCpcl.WordWrap();

    return PrinterCpcl.data
}
export function cpclImg(byte,height,length,data) {  
    PrinterCpcl.data = ""
    PrinterCpcl.PrintAreaSize("0","200","200","292","1");
    PrinterCpcl.PageWidth("576")
    PrinterCpcl.PrintImg('72','292','0','0','8607',data1)

    // PrinterCpcl.PrintAreaSize("0","200","200",height,"1");
    // PrinterCpcl.PageWidth("576")
    // PrinterCpcl.PrintImg(byte,height,'0','0',length,data)
    PrinterCpcl.Print();
    return PrinterCpcl.data
}


export function tsplModel() {  
    PrinterTspl.data = ""
    PrinterTspl.SetSize('200mm','200mm')
    PrinterTspl.Clear();
    PrinterTspl.SetDirection('0','0')
    PrinterTspl.SetReference('0','0')
    PrinterTspl.PrintText('440','350','4','0','2','2','废物名称')
    PrinterTspl.PrintText('440','480','4','0','2','2','废物类别')
    PrinterTspl.PrintText('1820','620','4','0','3','3','√')
    PrinterTspl.PrintText('440','610','4','0','2','2','废物代码')
    PrinterTspl.PrintText('1350','610','4','0','2','2','废物形态')
    PrinterTspl.PrintText('440','740','4','0','2','2','主要成分')
    PrinterTspl.PrintText('440','1080','4','0','2','2','有害成分')
    // PrinterTspl.PrintText('440','1460','4','0','2','2','注意事项')
    // PrinterTspl.PrintText('500','1820','4','0','2','2','数字识别码')
    // PrinterTspl.PrintText('540','1990','4','0','2','2','产生/收集单位')
    // PrinterTspl.PrintText('790','2280','4','0','2','2','联系人和联系方式')
    // PrinterTspl.PrintText('440','2510','4','0','2','2','产生日期')
    // PrinterTspl.PrintText('1200','2700','4','0','2','2','废物重量')
    // PrinterTspl.PrintText('400','2900','4','0','2','2','备注')
    PrinterTspl.PrintTs('1','1')
    return PrinterTspl.data

}


export function tspl() {  
    PrinterTspl.data = ""
    PrinterTspl.Clear();
    PrinterTspl.SetSize('56mm200mm','250mm')
    PrinterTspl.SetDirection('0','0')
    PrinterTspl.SetReference('0','0')
    PrinterTspl.PrintText('10','20','4','0','2','2','厦门汉印电子科技有限公司')
    PrinterTspl.PrintText('10','60','1','0','1','1','Xiamen Hanin Electronic Technology Co.,Ltd.')
    PrinterTspl.PrintText('10','80','1','0','1','1','UPCA')
    PrinterTspl.SetBarCode('10','100','UPCA','80','1','0','2','2','075678164125')
    PrinterTspl.PrintText('10','200','1','0','1','1','UPCE')
    PrinterTspl.SetBarCode('10','220','UPCE','80','1','0','3','6','425261')
    PrinterTspl.PrintText('10','340','1','0','1','1','EAN8')
    PrinterTspl.SetBarCode('10','360','EAN8','80','1','0','2','2','04210009')
    PrinterTspl.PrintText('10','380','2','0','1','1','店铺地址: 云尚·武汉国际时尚中心C馆二楼')
    PrinterTspl.PrintText('10','410','2','0','1','1','店铺地址: 云尚·武厦門漢印鳗雲洺泃鮰鱼$￥！~')
    PrinterTspl.PrintText('10','440','2','0','1','1','店铺地址: 云尚·武汉国际时尚中心')
    PrinterTspl.PrintText('10','470','2','0','1','1','店铺地址: 云尚·武汉国际时尚')
    PrinterTspl.PrintText('10','500','2','0','1','1','店铺地址: 云尚·武汉国际')
    PrinterTspl.PrintText('10','530','2','0','1','1','店铺地址: 云尚·武汉')
    PrinterTspl.PrintText('10','560','2','0','1','1','店铺地址: 云尚')
    PrinterTspl.PrintText('10','590','2','0','1','1','店铺地址','3')
    
    PrinterTspl.PrintTs('1','1')
    return PrinterTspl.data

}

export function zpl() {  
    PrinterZpl.data = ""
    PrinterZpl.SetStart('T','14')
    PrinterZpl.LabelLength('700')

    PrinterZpl.BarCode('240','110','3','N','100','N','N','N','755123456789')
    PrinterZpl.FontName('240','140','N','30','30','SIMSUN','TTF','单号：755123456789')
    PrinterZpl.Box('T','10','155','770','0','3')
    PrinterZpl.font('50','260','0','120','755-')
    PrinterZpl.font('350','260','0','80','755WA')
    PrinterZpl.WordWrap()
    PrinterZpl.Box('T','10','275','770','0','1')
    PrinterZpl.font('50','380','0','120','755AM')
    PrinterZpl.WordWrap()
    PrinterZpl.Box('T','10','390','550','0','1')
    PrinterZpl.font('440','360','0','80','001')
    PrinterZpl.WordWrap()
    PrinterZpl.Box('T','430','290','130','80','3')
    PrinterZpl.font('50','500','0','120','E')
    PrinterZpl.WordWrap()
    PrinterZpl.Box('O','30','400','110','110','3')
    PrinterZpl.FontName('170','480','N','50','50','SIMSUN','TTF','物流')
    PrinterZpl.Matrix('360','400','N','6','200','32','32','','','1','755123456789,755AM')
    PrinterZpl.PrintNum('1','0','1','Y')
    PrinterZpl.SetEnd()
    PrinterZpl.LabelLength('700')
    PrinterZpl.BarCode('240','110','3','N','90','N','N','N','755123456789')
    PrinterZpl.FontName('240','140','N','30','30','SIMSUN','TTF','单号：755123456789')
    PrinterZpl.Box('T','20','155','556','0','3')
    PrinterZpl.Box('O','20','155','556','170','2')
    PrinterZpl.Box('O','20','200','556','0','1')
    PrinterZpl.Box('O','100','245','476','0','1')
    PrinterZpl.Box('O','100','155','0','170','1')
    PrinterZpl.FontName('25','190','N','30','30','SIMSUN','TTF','寄件人','0','25')
    PrinterZpl.FontName('110','190','N','30','30','SIMSUN','TTF','顺丰有限公司','0','30')
    PrinterZpl.FontName('20','270','N','30','30','SIMSUN','TTF','收件人','0','25')
    PrinterZpl.FontName('110','240','N','30','30','SIMSUN','TTF','李139888888','0','30')
    PrinterZpl.FontName('110','280','N','30','30','SIMSUN','TTF','FD湖南省长沙市芙蓉区万丽路腾飞大厦5楼202','0','30')
    PrinterZpl.Box('O','20','325','556','180','2')
    PrinterZpl.Box('O','20','410','556','0','2')
    PrinterZpl.Box('O','192','410','0','95','2')
    PrinterZpl.Box('O','384','325','0','180','2')
    PrinterZpl.Box('O','410','335','30','30','2')
    PrinterZpl.Box('O','410','370','30','30','2')

    PrinterZpl.FontName('25','350','N','30','30','SIMSUN','TTF','计费重量：1公斤','0','20')
    PrinterZpl.FontName('25','375','N','30','30','SIMSUN','TTF','运费：22元','0','20')
    PrinterZpl.FontName('25','400','N','30','30','SIMSUN','TTF','保价：23元','0','20')
    PrinterZpl.FontName('220','350','N','30','30','SIMSUN','TTF','服务费4：24元','0','20')
    PrinterZpl.FontName('220','375','N','30','30','SIMSUN','TTF','服务费10：2元','0','20')
    PrinterZpl.FontName('220','400','N','30','30','SIMSUN','TTF','服务费5：25元','0','20')

    PrinterZpl.FontName('450','360','N','30','30','SIMSUN','TTF','自寄','0','30')
    PrinterZpl.FontName('450','395','N','30','30','SIMSUN','TTF','自取','0','30')
    PrinterZpl.FontName('90','450','N','10','10','SIMSUN','TTF','收货款','0','30')
    PrinterZpl.FontName('90','485','N','10','10','SIMSUN','TTF','￥3000.5','0','30')
    PrinterZpl.FontName('220','450','N','30','30','SIMSUN','TTF','费用合计','0','30')
    PrinterZpl.FontName('250','485','N','30','30','SIMSUN','TTF','￥4211','0','30')

    PrinterZpl.FontName('430','460','N','30','30','SIMSUN','TTF','签收：李','0','30','1','0','1','Y')

    PrinterZpl.FontName('220','400','N','30','30','SIMSUN','TTF','服务费5：25元')
    PrinterZpl.FontName('430','460','N','30','30','SIMSUN','TTF','签收：李','0','20')
    PrinterZpl.FontName('430','460','N','30','30','SIMSUN','TTF','签收：李','0','30','1','0','1','Y')
    PrinterZpl.FontName('430','460','N','30','30','SIMSUN','TTF','签收：李')
    PrinterZpl.FontName('430','460','N','30','30','SIMSUN','TTF','签收：李','','','1','0','1','Y')



    return PrinterZpl.data
}


export function esc(){
    PrinterEsc.data = ""
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('Xiamen Hanin Electronic Technology Co.,Ltd.厦門漢印鳗雲洺泃鮰鱼$￥！~');
    PrinterEsc.PrintReturn();//0d
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('UPC-A');
    PrinterEsc.PrintWrap();//0a
    PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('0','012345678912');
    PrinterEsc.PrintInit();//1b 40
    PrinterEsc.PrintStandardMode();// 1b 53
    PrinterEsc.PrintText('JAN13');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('2','012345678912');
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('JAN8');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('3','012345678912');
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('CODE39');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintBarCodeWidth('1');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('4','012');
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('ITF');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('70','1234567893');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('CODABAR');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintBarCodeWidth('2');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('6','A40156B');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('CODE128');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintBarCodeWidth('1');
    PrinterEsc.PrintBarCodeHeight('80');
    PrinterEsc.PrintBarCodePosition('2');
    PrinterEsc.PrintBarCodeFont('0');
    PrinterEsc.PrintBarCode('73','NO.123456EFG59','16');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('QRCODE');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintQRSize('3')
    PrinterEsc.PrintQRLevel('48')
    PrinterEsc.PrintQRStore('25','www.baidu.com123456789');
    PrinterEsc.PrintQR()
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintInit();
    PrinterEsc.PrintStandardMode();
    PrinterEsc.PrintText('PDF417');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintPDFCol('0')
    PrinterEsc.PrintPDFRow('0')
    PrinterEsc.PrintPDFWidth('3')
    PrinterEsc.PrintPDFHeight('3')
    PrinterEsc.PrintPDFLevel('48','50')
    PrinterEsc.PrintPDFStore('25','www.baidu.com123456789')
    PrinterEsc.PrintPDF()
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintStandardMode()
    PrinterEsc.PrintText('厦门汉印电子技术有限公司');
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintWrap();
    PrinterEsc.PrintWrap();

    return PrinterEsc.data
}

export function escImg(n,w,h,data){
    PrinterEsc.data = ""
    PrinterEsc.PrintInit();
    PrinterEsc.PageUnit();
    PrinterEsc.PageMode();
    PrinterEsc.PageArea(w,h+100)
    PrinterEsc.PageAbsolutePrint(0)
    PrinterEsc.PageAbsoluteVerticalPrint(h)
    PrinterEsc.PrintImg(n,h,data)
    PrinterEsc.PrintPageMode()
    return PrinterEsc.data
}


