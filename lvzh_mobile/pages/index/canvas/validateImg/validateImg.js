const app = getApp()
const filter = app.commModule.filter //路由守卫
Page(filter({
  data: {
    validateCode: '', // 输入的验证码
  },
  checkValidate() {
    const {
      validateCode
    } = this.data
    if (validateCode.toUpperCase() === app.globalData.validateCode.toUpperCase()) {
      app.commModule.common.showMsg('校验成功', 'success')
    } else {
      app.commModule.common.showMsg('校验失败', 'error')
    }
  },

  // 输入框的值
  inputValFun(ele) {
    const index = ele.currentTarget.dataset.index
    const val = ele.detail

    console.log('输入框的值', val)

    switch (index) {
      case '0':
        console.log('验证码')
        this.setData({
          validateCode: val
        })
        break;
    }

  }


}))