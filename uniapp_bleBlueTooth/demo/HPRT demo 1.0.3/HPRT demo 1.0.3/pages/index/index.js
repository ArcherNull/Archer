const services_uuid1 = "0000EEE0-0000-1000-8000-00805F9B34FB";
const services_uuid2 = "0000FF00-0000-1000-8000-00805F9B34FB";
const services_uuid3 = "49535343-FE7D-4AE5-8FA9-9FAFD205E455";
const ToBase64 = require('../../utils/base64gb2312.js');
const util = require('../../utils/util.js');


const Print = require('../../utils/print.js');
const lzo1x = require('../../utils/lzo1x.js');


//字符转十六进制数
function strToCode(str){
  if(str==="")
    return "";
  var charCode = [];
  for(let i=0;i<str.length;i++){
    charCode.push(str.charCodeAt(i).toString(16));
  }
  return charCode
}

function arrayBuffer2Hex(buffer){
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(' ');
}
function stringToHex(str){
  var val = ''
  for(var i = 0;i<str.length;i++){
    if(val == '')
      val = str.charCodeAt(i).toString(16)
    else
      val += ' '+ str.charCodeAt(i).toString(16)
  }
  return val;
}
var sendData64 = []
var timess = 1
Page({
  data: {
    esc: 'ESC',
    cpcl: 'CPCL',
    tspl: 'TSPL',
    tsplImg: '固废模板',
    zpl: 'ZPL',
    dpl: 'DPL',
    epl: 'EPL',
    printList: [], //打印机列表
    storageList: [],
    cIndex: '', //指令位置
    cpclIndex: '0',
    escIndex: '1',
    tsplIndex: '2',
    zplIndex: '3',
    dplIndex: '4',
    eplIndex: '5',
    cpclpicIndex: '6',
    escpicIndex: '7',
    tsplIndex1:'8',
    tsplIndexImg:'9',
    showM: false,
    deviceId: '',
    serviceId: '',
    writeId: '',
    readId: '',
    notifyId: '',
    notify1Id:'',
    storageDeviceId: '',
    storageServiceId: '',
    storageWriteId: '',
    btnTitle: '',
    platform: 'android',
    datapackage:20,
    canvasWidth:0,
    canvasHeight:0,
    showModal:false,
    paperWidth: 384,
    isLife:true,
    tempFilePaths: '../../image/check.jpg',
  },

  onLoad() {
    var _this = this;
    var list = wx.getStorageSync('printList');
    if (list.length > 0) {
      this.setData({
        storageList: list
      })

    }
    wx.getSystemInfo({
      success: function(res) {
        if (res.platform == "ios") {
          _this.setData({
            platform: 'ios',
          })
        } else if (res.platform == "android") {
          _this.setData({
            platform: 'android',
          })
        }
      }
    })
  },

  //搜索
  research() {
    var _this = this;
    wx.closeBluetoothAdapter({
      complete: function(res) {
        _this.start();
      }
    })
  },

  start() {
    if (!wx.openBluetoothAdapter) {
      this.showTip("当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。")
      return;
    }
    var _this = this;
    wx.openBluetoothAdapter({
      complete: function(res) {
        _this.getBluetoothAdapterState();
      }
    })
  },

  datapackageInput (e) {
    this.setData({
      datapackage: e.detail.value
    })
  },

  getBluetoothAdapterState() {
    var _this = this;
    wx.getBluetoothAdapterState({
      complete: function(res) {
        if (!!res && res.available) {
          _this.startSearch();
          
        } else {
          _this.showTip("请开启手机蓝牙")
        }
      }
    })
  },

  startSearch() {
    var _this = this;
    wx.showLoading({
      title: '搜索中',
      mask: true
    })
    wx.startBluetoothDevicesDiscovery({
      services: [],
      complete: function(res) {
        setTimeout(function() {
          wx.getBluetoothDevices({
            complete: function(res) {
              console.log(res)
              wx.hideLoading();
              var list = _this.filterPrint(res.devices);
              _this.setData({
                printList: list
              });
              if (list.length == 0) {
                _this.showTip('没有发现新的设备哦');
              }
            }
          });
          wx.stopBluetoothDevicesDiscovery({
            success: function(res) {},
          })
        }, 4000)
      }
    })
  },

  filterPrint(list) {
    var _this = this;
    var printList = [];
    var storageList = _this.data.storageList;
    for (let i = 0; i < list.length; i++) {
      var base64 = wx.arrayBufferToBase64(list[i].advertisData);
      var str = Array.prototype.map.call(new Uint8Array(list[i].advertisData), x => ('00' + x.toString(16)).slice(-2)).join('');
      if (str.length == 16) {
        var has = false;
        for (let j = 0; j < storageList.length; j++) {
          if (storageList[j].deviceId == list[i].deviceId) {
            has = true;
            break;
          }
        }
        if (!has) {
          list[i].address = str.toUpperCase()
          printList.push(list[i]);
        }
      }
    }
    return printList;
  },

  //连接
  connectDevice (res) {
    var _this = this;
    var index = res.currentTarget.dataset.index;
    var printList = _this.data.printList;
    var deviceId = printList[index].deviceId;
    wx.showLoading({
      title: '连接中...',
      mask: true
    })
    console.log(deviceId);
    wx.createBLEConnection({
      deviceId: deviceId,
      success(res) {
        wx.hideLoading();
        _this.showTip('连接成功');
        _this.setData({
          deviceId: deviceId,
          printList: [],
          btnTitle: '断开当前连接'
        })
        _this.getDeviceService(deviceId);
      },
      fail(res) {
        wx.hideLoading();
        _this.showTip('连接失败');
      }
    })
  },

  //获取蓝牙设备所有服务
  getDeviceService(deviceId) {
    var _this = this
    var deviceId = _this.data.deviceId
    var p = new Promise(function(resolve, reject) {
      wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: function(res) {
          var serviceId = _this.filterService(res.services);
          if (serviceId != "") {
            _this.setData({
              serviceId: serviceId
            })
          } else {
            // _this.showTip('没有找到主服务');
            _this.closeBLEConnection(deviceId);
            reject('没有找到主服务')
          }
          resolve(serviceId)
        },
        fail: function(res) {
          // _this.showTip('搜索设备服务失败');
          _this.closeBLEConnection(deviceId);
          reject("搜索设备服务失败")
        }
      })
    }).then(function(data) {
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: data,
        success: function(res) {
          _this.filterCharacter(res.characteristics);
          var writeId = _this.data.writeId;

          if (writeId == '') {
            //_this.showTip('获取特征值失败');
            _this.closeBLEConnection(deviceId);
            reject("获取特征值失败")
          }
        },
        fail: function(res) {
          //_this.showTip('获取特征值失败');
          _this.closeBLEConnection(deviceId);
          reject("获取特征值失败")
        }
      })
    }).catch(function(error) {
      _this.showTip(error);
    })
  },

  filterService(services, deviceId) {
    var serviceId = "";
    var _this = this;

    for (let i = 0; i < services.length; i++) {
      var serverid = services[i].uuid.toUpperCase();
      if (serverid.indexOf(services_uuid1) != -1 ||
        serverid.indexOf(services_uuid2) != -1 ||
        serverid.indexOf(services_uuid3) != -1
      ) {
        serviceId = services[i].uuid;
        break;
      }
    }
    return serviceId;
  },

  filterCharacter(characteristics) {
    var _this = this;
    var deviceId = _this.data.deviceId;
    var serviceId = _this.data.serviceId;
    var writeId = '';
    var readId = '';
    var notifyId = '';
    var notify1Id = '';
    for (let i = 0; i < characteristics.length; i++) {
      var charc = characteristics[i];
      const uuid1 = charc.uuid.split('-')[0]
      if (charc.properties.write) {
        writeId = charc.uuid;
      }
      if (charc.properties.read) {
        readId = charc.uuid;
      }
      if (charc.properties.notify) {
        notifyId = charc.uuid;
      }
      if (charc.properties.notify || charc.properties.indicate) {
        wx.notifyBLECharacteristicValueChange({
          deviceId,
          serviceId,
          characteristicId: charc.uuid,
          state: true,
        })
      }
    }
    _this.setData({
      writeId: writeId,
      readId: readId,
      notifyId: notifyId,
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      var data = arrayBuffer2Hex(characteristic.value).split(/\s/g)
      if(data.length == 3 && data[0] === '02'){
        const hex = data[2] + data[1]
        const mtu = Number(parseInt(hex ,16))
        _this.setData({
          datapackage: _this.data.platform == 'ios' ? mtu : 20
        })
      }
      if(data.length == 3 && data[0] === '01'){
      }
    })
  },

  //打印
  print(res) {
    var _this = this;
    var index = res.currentTarget.dataset.index;
    console.log('打印索引', index)
    if (index != 0 && index != 1 && index != 2 && index != 3 && index != 6 && index != 7 && index != 8 && index != 9) {
      _this.showTip("缺少该指令模板");
      return false;
    }
    _this.pickerData(index); //1s
  },

  //分包
  pickerData(index) {
    var _this = this;
    var data = '';
    _this.setData({
      cIndex:index
    })
    switch (index) {
      case '0':
        data = Print.cpcl();
        console.log('cpcl======>',data)
        _this.cutCommand(data);
        break;
      case '1':
        data = Print.esc()
        console.log('esc',data)
        _this.cutEscCommand(data);
        break;
      case '2':
        data = Print.tspl();
        console.log('tspl',data)
        _this.cutCommand(data);
        break;
      case '3':
        data = Print.zpl();
        console.log('zpl',data)
        _this.cutCommand(data);
        break;
      case '6':
        wx.chooseImage({
          count:1,
          sourceType:['album'],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            wx.getImageInfo({
              src: tempFilePath,
              success: (res1) => {
                // 设置canvas宽高
                _this.orignalWidth = res1.width,
                _this.orignalHeight = res1.height,
                _this.setData({
                  showModal:true,
                  tempFilePath: tempFilePath,
                  cIndex: 6,
                  type: index,
                });
              },
              fail: (res) => {
                  wx.hideLoading();
              },
            });
          }
        })
        break;
      case '7'://esc图片
        wx.chooseImage({
          count:1,
          sourceType:['album'],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            wx.getImageInfo({
              src: tempFilePath,
              success: (res1) => {
                // 设置canvas宽高
                _this.orignalWidth = res1.width,
                _this.orignalHeight = res1.height,
                _this.setData({
                  showModal:true,
                  tempFilePath: tempFilePath,
                  cIndex: 7,
                  type: index,
                });
              },
              fail: (res) => {
                  wx.hideLoading();
              },
            });
          }
        })
      break;
      case '8':
        wx.chooseImage({
          count:1,
          sourceType:['album'],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            wx.getImageInfo({
              src: tempFilePath,
              success: (res1) => {
                // 设置canvas宽高
                _this.orignalWidth = res1.width,
                _this.orignalHeight = res1.height,
                _this.setData({
                  showModal:true,
                  tempFilePath: tempFilePath,
                  cIndex: 8,
                  type: index,
                });
              },
              fail: (res) => {
                  wx.hideLoading();
              },
            });
          }
        })
        break;
    };
  },

//   tsplImg 获取图片信息
  getImgInfo(){
    wx.getImageInfo({
        src: this.data.tempFilePaths,
        success: (res) => {
            // 设置canvas宽高
            this.setData({
                canvasWidth: res.width,
                canvasHeight: res.height,
                tempFilePath: this.data.tempFilePaths,
                cIndex: 9,
            });
            this.drawCanvas();
        },
        fail: (res) => {
            wx.hideLoading();
        },
    });
  },

  cancel(){
    this.setData({
      showModal:false,
    })
  },

  confirm(e){
    const height = Math.ceil((this.orignalHeight * e.detail.width) / this.orignalWidth)
    this.setData({
      showModal:false,
      canvasWidth:Number(e.detail.width),
      canvasHeight:Number(height)
    })
    setTimeout(()=>{
      if(this.data.type == 7){
        this.drawCanvas1();
      }else{
        this.drawCanvas();
      }
    },300)
  },

//   tsplImg
  drawCanvas(){
    var _this = this;
    const cfg = {
      x: 0,
      y: 0,
    }
    const ctx = wx.createCanvasContext('canvasIn', this);
    ctx.setFillStyle('#FFFFFF');
    ctx.fillRect(0, 0, _this.data.canvasWidth, _this.data.canvasHeight)
    ctx.drawImage(_this.data.tempFilePath, 0, 0, _this.data.canvasWidth, _this.data.canvasHeight)
    ctx.draw(false,()=>{
      wx.canvasGetImageData({
        canvasId: 'canvasIn',
        width:_this.data.canvasWidth,
        height:_this.data.canvasHeight,
        ...cfg,
        success: (res) => {
          const buffer= util.convertToMonoImage(res);
          let buffernew = [];
            if(this.data.cIndex == '6'){
                var data_hex = _this.doCompression(new Uint8Array(buffer)) // 压缩 并转成16进制字符串
                 _this.cutCpclImage(data_hex)
            }
            if(this.data.cIndex == '8'){
                for(let i = 0; i < buffer.length; i ++){
                  buffernew.push(255-buffer[i])
                }
                var data_hex = _this.doCompression(new Uint8Array(buffernew)) 
                _this.cutCpclImage(data_hex)
            }
            if(this.data.cIndex == '9'){
                for(let i = 0; i < buffer.length; i ++){
                  buffernew.push(255-buffer[i])
                }
                var data_hex = _this.doCompression(new Uint8Array(buffernew)) 
                const width=strToCode(parseInt(Number(this["\u0064\u0061\u0074\u0061"]["\u0063\u0061\u006e\u0076\u0061\u0073\u0057\u0069\u0064\u0074\u0068"]+(0x630c3^0x630c4))/(0xa361a^0xa3612))["\u0074\u006f\u0053\u0074\u0072\u0069\u006e\u0067"]())["\u0074\u006f\u0053\u0074\u0072\u0069\u006e\u0067"]()["\u0072\u0065\u0070\u006c\u0061\u0063\u0065"](/,/g,'\x20');
                const height = stringToHex((this.data.canvasHeight).toString())
                const tspllength = this.computedHexLengthtspl(data_hex).toString().replace(/,/g," ")
                let data = Print.tsplImg(200,300,width,height,tspllength,data_hex);
                _this.cutCommand(data);
            }
        },
        fail: (err) => {
        }
      })
    })
  },
  
  getPrintData(imgDataInfo) {
    const buffer = util.convertToMonoImage(imgDataInfo)
    const { width, height } = imgDataInfo // 图片的总尺寸
    const BitmapWidth = (width + (width > 8 ? 0 : 1)) / 8 // 点阵8个字节压缩
    const chunkHeight = 20 // 20 行一包
    const chunkSize = BitmapWidth * chunkHeight // 每包大小
    const chunksCount = Math.ceil(buffer.length / chunkSize) // 总共分为几包

    console.log('width', width)
    console.log('height', height)
    console.log('BitmapWidth', BitmapWidth)
    console.log('chunkHeight', chunkHeight)
    console.log('chunksCount', chunksCount)

    // const arr = this.testPrintImage()

    const arr = []
    // 分包
    for (let i = 0; i < chunksCount; i++) {
      const data = buffer.slice(i * chunkSize, (i + 1) * chunkSize) // 源数据

      // 1.生成指令前缀
      const _height = i === chunksCount - 1 ? Math.ceil(data.length / BitmapWidth) : chunkHeight
      console.log('_height', _height)

      const LData = []
      LData[0] = '1D'
      LData[1] = '76'
      LData[2] = '30'
      LData[3] = '30' // 00 未压缩  30 压缩
      LData[4] = Math.ceil(BitmapWidth % 256)
        .toString(16)
        .padStart(2, '0')
      LData[5] = Math.floor(BitmapWidth / 256)
        .toString(16)
        .padStart(2, '0')
      LData[6] = Math.ceil(_height % 256)
        .toString(16)
        .padStart(2, '0')
      LData[7] = Math.floor(_height / 256)
        .toString(16)
        .padStart(2, '0')

      // 2.压缩图片数据
      const data_hex = this.doCompression(new Uint8Array(data)) // 压缩 并转成16进制字符串
      const _data = data_hex.split(' ') // 拆成数组

      // 3.计算压缩后图片数据的字节数
      const _data_hex_length_arr = this.computedHexLength(data_hex) // 计算压缩后的字节数 并转成 16进制小段写法

      const cmd = [...LData, ..._data_hex_length_arr, ..._data]
      console.log('cmd', cmd.join(' '))
      arr.push(cmd)
    }

    return arr
  },

  computedHexLength(hex){
    const length = hex.split(/\s/g).length // 字节数
    const length_hex = length.toString(16).padStart(8, '0') // 转16进制 补0至8位数

    const a = length_hex.slice(0, 2)
    const b = length_hex.slice(2, 4)
    const c = length_hex.slice(4, 6)
    const d = length_hex.slice(6, 8)

    return [d, c, b, a]
  },

  drawCanvas1(){
    var _this = this;
    const cfg = {
      x: 0,
      y: 0,
    }
    const { canvasWidth, canvasHeight,tempFilePath } = this.data;
    const ctx = wx.createCanvasContext('canvasIn', this);
    ctx.setFillStyle('#FFFFFF');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    ctx.drawImage(tempFilePath, 0, 0, canvasWidth, canvasHeight)
    ctx.draw(false,()=>{
      wx.canvasGetImageData({
        canvasId: 'canvasIn',
        width: canvasWidth,
        height: canvasHeight,
        ...cfg,
        success: (res) => {
          var a = this.getPrintData(res).flat(Infinity)
          console.log(a)
          _this.cutCommandImage(a);
        },
        fail: (err) => {
        }
      })
    })
  },

  doCompression(byteArray){
    const state = {
      inputBuffer:byteArray,
      outputBuffer: new Uint8Array(4)
    }
    lzo1x.lzo1x.compress(state)
    
    return arrayBuffer2Hex(state.outputBuffer)
  },

  splitToDigit (n){
    let num = []
    while (n > 0) {
      num.push(n % 10)
      n = parseInt(n / 10)
    }
    return num.reverse()
  },

  changeByte(num){
    const a = this.splitToDigit(num)
    const b = (strToCode(a.join(''))).join(' ')
    return b
  },

  computedHexLengthtspl(hex) {
    const length = hex.split(/\s/g).length 
    const arr = new Array(4)
    arr[0] = ((length)&255).toString(16).padStart(2,'0')
    arr[1] = ((length>>8)&255).toString(16).padStart(2,'0')
    arr[2] = ((length>>16)&255).toString(16).padStart(2,'0')
    arr[3] = ((length>>24)&255).toString(16).padStart(2,'0')
    return arr
  },

  cutCpclImage(data_hex){
    const byte = stringToHex(((parseInt(Number(this.data.canvasWidth + 7)/8)).toString()))
    const height = stringToHex((this.data.canvasHeight).toString())
    const length = stringToHex((data_hex.split(/\s/g).length).toString())
    const width = strToCode((parseInt(Number(this.data.canvasWidth + 7)/8)).toString()).toString().replace(/,/g," ");
    const height1 = strToCode((parseInt(Number(this.data.canvasHeight + 7)/8)).toString()).toString().replace(/,/g," ");
    const tspllength = this.computedHexLengthtspl(data_hex).toString().replace(/,/g," ")
    const start='\x2002\x2003\x2003\x2023\x2002\x2003\x2003\x2023\x2002\x2003\x2002\x2012'["\u0073\u0070\u006c\u0069\u0074"]("".split("").reverse().join(""))["\u0072\u0065\u0076\u0065\u0072\u0073\u0065"]()["\u006a\u006f\u0069\u006e"]("".split("").reverse().join(""))+height+'\x2002\x20F4\x20A5\x20C4\x2074\x2034\x20A0\x20D0\x2013\x2002\x20'["\u0073\u0070\u006c\u0069\u0074"]("")["\u0072\u0065\u0076\u0065\u0072\u0073\u0065"]()["\u006a\u006f\u0069\u006e"]("".split("").reverse().join(""))+byte+" 02 ".split("").reverse().join("")+height+'\x2002\x2003\x2002\x2003\x2002\x20'["\u0073\u0070\u006c\u0069\u0074"]("")["\u0072\u0065\u0076\u0065\u0072\u0073\u0065"]()['join']("".split("").reverse().join(""))+length+'\x20A0\x20D0\x20'["\u0073\u0070\u006c\u0069\u0074"]('')["\u0072\u0065\u0076\u0065\u0072\u0073\u0065"]()['join']("".split("").reverse().join(""));
    const end='\x200D\x200A\x2046\x204F\x2052\x204D\x200D\x200A\x2050\x2052\x2049\x204E\x2054';
    const tsplStart='53\x2049\x205a\x2045\x2020\x20'+width+" c2 d6 d6 ".split("").reverse().join("")+height1+'\x206d\x206d\x200D\x200A\x20';
    const tsplImgStart='\x20c2\x2003\x20c2\x2003\x2002\x2005\x2014\x20d4\x2045\x2094\x2024\x20A0\x20D0\x2035\x20C4\x2034'["\u0073\u0070\u006c\u0069\u0074"]("")["\u0072\u0065\u0076\u0065\u0072\u0073\u0065"]()["\u006a\u006f\u0069\u006e"]("".split("").reverse().join(""))+width+'\x20c2\x20'["\u0073\u0070\u006c\u0069\u0074"]("".split("").reverse().join(""))["\u0072\u0065\u0076\u0065\u0072\u0073\u0065"]()["\u006a\u006f\u0069\u006e"]("".split("").reverse().join(""))+height+'\x20c2\x2063\x2013\x20c2\x20'['split']("")['reverse']()["\u006a\u006f\u0069\u006e"]("".split("").reverse().join(""))+tspllength;
    const tspEnd='A0\x20D0\x2013\x20c2\x2013\x2002\x2045\x20e4\x2094\x2025\x2005\x20'["\u0073\u0070\u006c\u0069\u0074"]("")["\u0072\u0065\u0076\u0065\u0072\u0073\u0065"]()["\u006a\u006f\u0069\u006e"]("".split("").reverse().join(""));
    let allData = '';
    if(this.data.cIndex == '6'){
        allData = start + data_hex + end
    }
    if(this.data.cIndex == '8'){
        allData = tsplStart + tsplImgStart + " " + data_hex + tspEnd
    }
    console.log(allData);
    var _data = allData.split(' ') // 拆成数组
    var _this = this;
    var deviceId = _this.data.deviceId;
    var serviceId = _this.data.serviceId;
    var writeId = _this.data.writeId;
    var readId = _this.data.readId;
    var sendData64Copy = [];

    var packageLength = _this.data.datapackage;
    for (let i = 0; i < _data.length; i = i + packageLength) {
      const arr = _data.slice(i, i + packageLength).join(' ')
      sendData64Copy.push(arr)
    }

    sendData64 = sendData64Copy

    new Promise(function(resolve, reject) {
      _this.writeBLECharacteristicValue1(deviceId, serviceId, writeId, 1); //32s
      resolve('ok')
    }).then(function(data) {
    }).catch(function(error) {
      _this.showTip(error);
    })
  },

  cutCommandImage(data){
    var _this = this;
    var deviceId = _this.data.deviceId;
    var serviceId = _this.data.serviceId;
    var writeId = _this.data.writeId;
    var readId = _this.data.readId;
    var sendData64Copy = [];

    var packageLength = _this.data.datapackage;

    for (let i = 0; i < data.length; i = i + packageLength) {
      const arr = data.slice(i, i + packageLength).join(' ')
      sendData64Copy.push(arr)
    }
    sendData64 = sendData64Copy
    new Promise(function(resolve, reject) {
      _this.writeBLECharacteristicValue1(deviceId, serviceId, writeId, 1); //32s
      resolve('ok')
    }).then(function(data) {
    }).catch(function(error) {
      _this.showTip(error);
    })
  },

  cutCommand(data) {
    var _this = this;
    var deviceId = _this.data.deviceId;
    var serviceId = _this.data.serviceId;
    var writeId = _this.data.writeId;
    var readId = _this.data.readId;
    var sendData64Copy = [];

    var packageLength = _this.data.datapackage;

    var byData = util.hexStringToBuff(data);

    for (let i = 0; i < Math.ceil(byData.byteLength / packageLength); i++) {

      var ble_end = packageLength * (i + 1);
      var ble_begin = i * packageLength

      if (ble_end > byData.byteLength) {
        //从begin（包括），到end（不包括）。
        const newBuffer = byData.slice(ble_begin);// 从哪个开始到那个结束
        sendData64Copy[i] = newBuffer
      }
      else {
        const newBuffer = byData.slice(ble_begin, ble_end);// 从哪个开始到那个结束
        sendData64Copy[i] = newBuffer
      }
    }
    sendData64 = sendData64Copy
    var p = new Promise(function(resolve, reject) {
      _this.writeBLECharacteristicValue1(deviceId, serviceId, writeId, 1); //32s
      resolve('ok')
    }).then(function(data) {
    }).catch(function(error) {
      _this.showTip(error);
    })
  },

  cutEscCommand(data) {
    var _this = this;
    var deviceId = _this.data.deviceId;
    var serviceId = _this.data.serviceId;
    var writeId = _this.data.writeId;
    var readId = _this.data.readId;

    var sendData64Copy = [];
    var packageLength = 3;
    if (Math.ceil(data.length % 9 == 0)) packageLength = 9;
    else if (Math.ceil(data.length % 6 == 0)) packageLength = 6;

    for (let i = 0; i < Math.ceil(data.length / packageLength); i++) {
      sendData64Copy[i] = ToBase64.string2HexArrayBuffer(data.substr(i * packageLength  , packageLength  ));
    }

    sendData64 = sendData64Copy
    var p = new Promise(function(resolve, reject) {
      _this.writeBLECharacteristicValue1(deviceId, serviceId, writeId, 1); //32s
      resolve('ok')
    }).then(function(data) {
    }).catch(function(error) {
      _this.showTip(error);
    })
  },

  //数据写入
  writeBLECharacteristicValue1(deviceId, serviceId, writeId, times) {
    var _this = this;
    var sendData6412 = sendData64;
    var value;
  
    if (sendData6412.length >= times) {
      if(Number(_this.data.cIndex) == 6 || Number(_this.data.cIndex) == 7 || Number(_this.data.cIndex) == 8){
        value = ToBase64.string2HexArrayBuffer(sendData6412[times - 1])
      }else{
        value =  sendData6412[times - 1]
      }
      wx.writeBLECharacteristicValue({
        deviceId: deviceId,
        serviceId: serviceId,
        characteristicId: writeId,
        value,
        whiteType: 'write',
        success: function(res) {
          wx.showLoading({
            title: Math.floor(( times / sendData6412.length) * 100) + '%',
            mask: true
          });
          _this.writeBLECharacteristicValue1(deviceId, serviceId, writeId, ++times);
        },
        fail: function(res) {
          _this.showTip('传输失败');
          _this.setData({
            isLife : false
          })
          wx.hideLoading();
        }
      })

    } else {
      wx.hideLoading();
      _this.showTip('传输完成');
      const ctx = wx.createCanvasContext('canvasIn', this);
      ctx.clearRect(0, 0, _this.data.canvasWidth, _this.data.canvasHeight);
      ctx.draw();
      sendData64 = []
      timess = 1
      _this.setData({
        isLife : false
      })
      var readId = _this.data.readId;
      
      wx.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId: readId,
        success(res) {
        }
      })
      
    }
  },

  //向低功耗蓝牙设备特征值中写入二进制数据
  writeBLECharacteristicValue(deviceId, serviceId, writeId, times) {
    var _this = this;
    var sendData6412 = sendData64;
    if (sendData6412.length >= times) {
      wx.writeBLECharacteristicValue({
        deviceId: deviceId,
        serviceId: serviceId,
        characteristicId: writeId,
        value: sendData6412[times - 1],
        whiteType: 'write',
        success: function(res) {
          wx.showLoading({
            title: Math.floor(( times / sendData6412.length) * 100) + '%',
            mask: true
          });
        },
        fail: function(res) {
          _this.showTip('传输失败');
          _this.setData({
            isLife : false
          })
        }
      })

    } else {
      wx.hideLoading();
      _this.showTip('传输完成');
      const ctx = wx.createCanvasContext('canvasIn', this);
      ctx.clearRect(0, 0, _this.data.canvasWidth, _this.data.canvasHeight);
      ctx.draw();
      sendData64 = []
      timess = 1
      _this.setData({
        isLife : false
      })
      var readId = _this.data.readId;
     
      wx.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId: readId,
        success(res) {
        }
      })
    }
  },


  disconnect () {
    var _this = this;
    var temp = _this.data.btnTitle;
    var storageDeviceId = _this.data.deviceId;
    var storageServiceId = _this.data.serviceId;
    var storageWriteId = _this.data.writeId;
    var btnName = '';
    if (temp == '断开当前连接') {
      _this.closeBLEConnection(storageDeviceId);
      //close 
      btnName = '重新连接'
    } else {
      _this.closeBLEConnection(storageDeviceId);
      wx.showLoading({
        title: '连接中...',
        mask: true
      })
      wx.createBLEConnection({
        deviceId: storageDeviceId,
        success(res) {
          wx.hideLoading();
          _this.showTip('连接成功');
          _this.setData({
            deviceId: storageDeviceId,
            printList: [],
            btnTitle: '断开当前连接'
          })
          _this.getDeviceService(storageDeviceId);
        },
        fail(res) {
          wx.hideLoading();
          _this.showTip('连接失败,');
        }
      })
      _this.setData({
        deviceId: storageDeviceId,
        serviceId: storageServiceId,
        writeId: storageWriteId
      })
      btnName = '断开当前连接'
    }
    _this.setData({
      btnTitle: btnName
    })
  },

  //结尾
  closeBLEConnection(deviceId) {
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: function(res) {}
    })
  },

  showTip(data) {
    wx.showModal({
      content: data,
      showCancel: false
    })
  },
  
})

