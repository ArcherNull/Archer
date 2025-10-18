const app = getApp()
const filter = app.commModule.filter //路由守卫
const {
  md5
} = app.commModule.sdk

Page(filter({
  data: {
    encryptionString: '', // 输入的加密串
    encryptionKey: '', // 加密密钥
    outPutEncryption:'' , // 输出的加密数据
    // 加密规则
    rulesList: [{
      name: '前拼接',
      value: 0
    }, {
      name: '后拼接',
      value: 1
    }],
    rulesIndex: 0, // 加密规则默认选中

    decryptString: '', // 输入的解密串
    decryptKey: '', // 解密密钥
    enRulesIndex:0, // 解密规则默认选中
    outPutDecrypt:'' , // 输出的加密数据

  },
  onLoad: function () {
    console.log('md5加密', md5(''))
  },
  // 加密
  inputValFun(ele) {
    console.log('加密', ele)
    const index = ele.currentTarget.dataset.index
    const value = ele.detail
    // const encryptionVal = md5(value)
    switch (index) {
      case '0':
        this.setData({
          encryptionString: value
        })
        break;
      case '1':
        this.setData({
          encryptionKey: value
        })
        break;
      case '2':
        this.setData({
          rulesIndex: value.value
        })
        break;
    }
  },
  // 解密
  inputValEnv(ele) {
    console.log('解密', ele)

  },

  // 加密输出密文事件
  encryptionFun(){
    console.log('加密输出密文事件')
    const {
      rulesIndex,
      encryptionString,
      encryptionKey

    } = this.data
    const md5Str = rulesIndex==0?`${encryptionKey}--${encryptionKey}` :`${encryptionKey}--${encryptionKey}`
    const md5Val = md5(md5Str)
    console.log('md5Val' , md5Val)
    this.setData({
      outPutEncryption: md5Val
    })
  },
  // 复制文本
  copyText(){
    console.log('复制文本')
  }

}))