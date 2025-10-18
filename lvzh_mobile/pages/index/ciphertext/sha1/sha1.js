const app = getApp()
const filter = app.commModule.filter //路由守卫
const {
  sha1
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
    console.log('sha1加密', sha1(''))
  },
  // 加密
  inputValFun(ele) {
    console.log('加密', ele)
    const index = ele.currentTarget.dataset.index
    const value = ele.detail
    // const encryptionVal = sha1(value)
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
    const sha1Str = rulesIndex==0?`${encryptionKey}--${encryptionKey}` :`${encryptionKey}--${encryptionKey}`
    const sha1Val = sha1(sha1Str)
    console.log('sha1Val' , sha1Val)
    this.setData({
      outPutEncryption: sha1Val
    })
  },
  // 复制文本
  copyText(){
    console.log('复制文本')
  }

}))