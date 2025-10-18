const app = getApp()
Page({
  data: {
    // 小程序官方文档
    miniDocHref: 'https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/ocr/ocr.idcard.html',
    // 腾讯云AI开放平台
    aiDocHref: 'https://ai.qq.com/',
    // QCR支持插件官方文档:
    QCRPluginsDoc: 'https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx4418e3e031e551be&token=1273489828&lang=zh_CN',
    // 上传图片限制个数
    limitNum: 1,
    // 身份证上传
    icCardList: [],
    // 加密规则
    cardTypeList: [{
      name: '身份证正面',
      value: 'bankcard'
    }, {
      name: '身份证背面',
      value: 'bankcard'
    }, {
      name: '营业执照',
      value: 'bizlicense'
    }, {
      name: '银行卡号',
      value: 'bankcard'
    }, {
      name: '行驶证',
      value: 'driving'
    }, {
      name: '驾驶证驶证',
      value: 'drivinglicense'
    }, {
      name: '小程序通用印刷体',
      value: 'comm'
    }],
    cardTypeIndex: 0, // 加密规则默认选中
    exampleImgList: [{
        name: '身份证正面',
        img: 'http://3pl.dekuncn.com/upload/2021-12-15/2021121504002872RJBKDEFO.jpg'
      },
      {
        name: '身份证背面',
        img: 'http://3pl.dekuncn.com/upload/2021-12-22/20211222030944214AH90TN8.jpg'
      },
      {
        name: '银行卡',
        img: 'http://3pl.dekuncn.com/upload/2021-12-22/2021122203435670RVNIITYN.jpg'
      },
      {
        name: '驾驶证',
        img: 'http://3pl.dekuncn.com/upload/2021-12-22/2021122203124441CS8EOW7P.jpg'
      },
      {
        name: '行驶证',
        img: 'http://3pl.dekuncn.com/upload/2021-12-22/2021122203123967IT9U0XBO.jpg'
      },
      {
        name: '营业执照',
        img: 'https://3pl.dekuncn.com:8081/h3pl/file/2022-01-18/892ddc86-91a3-4901-ac02-8db75f7fbb53.jpg'
      },
      {
        name: '菜单',
        img: 'https://3pl.dekuncn.com:8081/h3pl/file/2022-04-27/258b8c00-198e-4a76-a3e4-d86ac85b582d.png'
      }
    ],
    QCRPluginDoc: 'https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx4418e3e031e551be&token=1273489828&lang=zh_CN'
  },

  onLoad: function (options) {

  },

  // 证件类型识别监听事件
  inputValFun(ele) {
    this.setData({
      cardTypeIndex: ele.detail.value
    })
  },

  // 复制腾讯云AI开放平台官网平台链接
  copyAiText(ele) {
    const copyData = ele.currentTarget.dataset.copydata
    app.commModule.common.copyText(copyData)
  },

  // 上传图片方法
  updateImage(ele) {
    const img = ele.detail.img
    console.log('上传图片方法', img)
    const {
      icCardList
    } = this.data

    console.log('icCardList123123123', icCardList)
    this.setData({
      icCardList: [...icCardList, img]
    })

  },

  // 删除图片方法
  deleteImg(ele) {
    console.log('删除图片方法', ele)
    const deleteInd = ele.currentTarget.dataset.index
    const {
      icCardList
    } = this.data
    icCardList.splice(deleteInd, 1)
    console.log('icCardList===>', icCardList)
    this.setData({
      icCardList
    })
  },

  // 证件识别(AppID+AppSecret)【不推荐】--示例图片的识别
  QCRCheckFun(ele) {
    const name = ele.currentTarget.dataset.name
    console.log('示例图片的识别', name)
    const testImgUrl = 'https://etms-tmscs-dev-oss-external-bucket-dn.dekuncn.com/supplier/2025-05-28/d79ac0e7bc9b44f1a00a0eda4226c3be_%E8%BA%AB%E4%BB%BD%E8%AF%81%E6%AD%A3%E9%9D%A21.jpg?Expires=1748428849&OSSAccessKeyId=LTAI5tNzHZ9FJMJgZEuq6taR&Signature=59T9Nw1HvQ4Y9jY1KbU0O%2BGZEv4%3D'
    app.commModule.common.QCRCheckImgFun(testImgUrl, 'idcard').then(res => {
      console.log('获取到新token', res)
    })
  },

  // 预览图片的方法
  previewImg(ele) {
    const index = ele.currentTarget.dataset.index
    const urls = this.data.exampleImgList.map(ele => ele.img)
    app.commModule.common.previewImgs(urls, urls[index])
  },


  /* *****************  小程序QCR插件证件识别  ******************* */
  // 身份证识别--正面调用成功
  QCRFontIdCard(ele) {
    console.log('身份证识别调用成功', ele.detail)
    const idCard = ele.detail
    const address = idCard?.address?.text
    const birth = idCard?.birth?.text
    const gender = idCard?.gender?.text
    const source = idCard?.image_source
    const idNumer = idCard?.id?.text
    const name = idCard?.name?.text
    const nationality = idCard?.nationality?.text
    const image_path = idCard?.image_path

    const info = `姓名:${name};\n性别:${gender};\n民族:${nationality};\n出生日期:${birth};\n住址:${address};\n身份证号码:${idNumer};\n识别来源:${source}`
    wx.showModal({
      title: '身份证正面识别信息',
      content: info,
      success(res) {
        if (res.confirm) {
          console.log('用户确认信息无误，调用上传图片接口')
          // app.commonModel.apis.upLoadImg(image_path).then(resData => {
          //     console.log('上传识别的图片',resData)
          // })
        }
      }
    })
  },

  // 身份证识别--背面调用成功
  QCRBackIdCard(ele) {
    console.log('身份证背面识别调用成功', ele.detail)
    const backInfo = ele.detail
    const authority = backInfo.authority.text
    const validDate = backInfo.valid_date.text
    const source = backInfo.image_source
    const backInfoStr = `签发机关:${authority};\n有效期限:${validDate};\n识别来源:${source}`
    wx.showModal({
      title: '身份证背面识别信息',
      content: backInfoStr,
      success(res) {
        if (res.confirm) {
          console.log('用户确认信息无误，调用上传图片接口')
          // app.commonModel.apis.upLoadImg(image_path).then(resData => {
          //     console.log('上传识别的图片',resData)
          // })
        }
      }
    })
  },

  // 银行卡识别
  QCRBanksuccess(ele) {
    console.log('银行卡号识别', ele.detail)
    const bankInfo = ele.detail
    const bankNumber = bankInfo.number.text
    const source = bankInfo.image_source

    const bankStr = `银行卡号:${bankNumber};\n识别来源:${source}`
    wx.showModal({
      title: '银行卡号识别信息',
      content: bankStr,
      success(res) {
        if (res.confirm) {
          console.log('用户确认信息无误，调用上传图片接口')
          // app.commonModel.apis.upLoadImg(image_path).then(resData => {
          //     console.log('上传识别的图片',resData)
          // })
        }
      }
    })
  },

  // 行驶证识别
  QCRDriverSuccess(ele) {
    console.log('行驶证识别', ele.detail)
    const driverInfo = ele.detail
    const source = driverInfo.image_source
    const image_path = driverInfo.image_path

    const addr = driverInfo?.addr?.text || ''
    const check_record = driverInfo?.check_record?.text || ''
    const engine_num = driverInfo?.engine_num?.text || ''
    const issue_date = driverInfo?.issue_date?.text || ''
    const load_quality = driverInfo?.load_quality?.text || ''
    const model = driverInfo?.model?.text || ''
    const official_seal = driverInfo?.official_seal?.text || ''
    const overall_size = driverInfo?.overall_size?.text || ''
    const owner = driverInfo?.owner?.text || ''
    const passengers_num = driverInfo?.passengers_num?.text || ''
    const plate_num = driverInfo?.plate_num?.text || ''
    const plate_num_b = driverInfo?.plate_num_b?.text || ''
    const prepare_quality = driverInfo?.prepare_quality?.text || ''
    const record = driverInfo?.record?.text || ''
    const register_date = driverInfo?.register_date?.text || ''
    const remarks = driverInfo?.remarks?.text || ''
    const total_quality = driverInfo?.total_quality?.text || ''
    const use_character = driverInfo?.use_character?.text || ''
    const vehicle_type = driverInfo?.vehicle_type?.text || ''
    const vin = driverInfo?.vin?.text || ''

    const driverInfoStr = `正面：\n号牌号码:${plate_num};车辆类型:${vehicle_type};所有人:${owner};住址:${addr};使用性质:${use_character};品牌型号:${model};车辆识别代号:${vin};发动机号码:${engine_num};注册日期:${register_date};发证日期:${issue_date};发证部门:${official_seal};`

    const backDriverInfo = `反面：\n号牌号码:${plate_num_b};档案编号:${record};核定载人数:${passengers_num};总质量:${total_quality};整备质量:${prepare_quality};核定载质量:${load_quality};外廓尺寸:${overall_size};准牵引总质量:  ;备注:${remarks};检验有效期:${check_record};`
    // const bankStr = `银行卡号:${bankNumber};\n识别来源:${source}`
    wx.showModal({
      title: '行驶证别信息',
      content: driverInfoStr + backDriverInfo
    })
  },

  // 驾驶证识别
  QCRDriverLicenseSuccess(ele) {
    console.log('驾驶证识别', ele.detail)
    const driverInfo = ele.detail
    const source = driverInfo.image_source
    const image_path = driverInfo.image_path

    const address = driverInfo?.address?.text || ''
    const birth_date = driverInfo?.birth_date?.text || ''
    const car_class = driverInfo?.car_class?.text || ''
    const file_no = driverInfo?.file_no?.text || ''
    const id_num = driverInfo?.id_num?.text || ''
    const issue_date = driverInfo?.issue_date?.text || ''
    const name = driverInfo?.name?.text || ''
    const nationality = driverInfo?.nationality?.text || ''
    const official_seal = driverInfo?.official_seal?.text || ''
    const remarks = driverInfo?.remarks?.text || ''
    const sex = driverInfo?.sex?.text || ''
    const valid_from = driverInfo?.valid_from?.text || ''
    const valid_to = driverInfo?.valid_to?.text || ''


    const driverInfoStr = `正面：\n姓名:${name};性别:${sex};国籍:${nationality};住址:${address};出生日期:${birth_date};初次领证日期:${issue_date};准假车型:${car_class};有效期限:${valid_from}至${valid_to};发证部门:${official_seal};\n反面：\n档案编号:${file_no};证号:${id_num};备注:${remarks};`
    wx.showModal({
      title: '驾驶证识别信息',
      content: driverInfoStr
    })
  },

  // 营业执照识别
  QCRBusinessSuccess(ele) {
    console.log('营业执照识别', ele)
    const busInfo = ele.detail
    const address = busInfo?.address?.text|| ''
    const enterprise_name = busInfo?.enterprise_name?.text|| ''
    const legal_representative = busInfo?.legal_representative?.text|| ''
    const registered_date = busInfo?.registered_date?.text|| ''
    const reg_num = busInfo?.reg_num?.text|| ''
    const title = busInfo?.title?.text|| ''

    const info = `检测项:${title};\n姓名:${legal_representative};\n注册时间:${registered_date};\n统一社会信用代码:${reg_num};\n公司名称:${enterprise_name};\n注册地址:${address};`
    wx.showModal({
      title: '营业执照',
      content: info,
      success(res) {
        if (res.confirm) {
          console.log('用户确认信息无误，调用上传图片接口')
          // app.commonModel.apis.upLoadImg(image_path).then(resData => {
          //     console.log('上传识别的图片',resData)
          // })
        }
      }
    })
  },

  // 车牌识别
  QCRPlatenumSuccess(ele) {
    console.log('车牌识别', ele)
    const carNoInfo = ele.detail
    const carNo = carNoInfo?.number?.text
    console.log('识别的车牌号为', carNo)
    const info = `车牌号:${carNo};`
    wx.showModal({
      title: '车牌识别',
      content: info,
      success(res) {
        if (res.confirm) {

        }
      }
    })
    

  },

  // 菜单识别
  QCRMenuSuccess(ele) {
    console.log('菜单识别', ele)
    const menuItem = ele.detail
    console.log('菜单识别内容', menuItem)
    const {
      image_path,
      image_source,
      items
    } = menuItem

    let str = ''
    if (items.length) {
      str = items.map(ele => `${ele.menu_name}:${ele.menu_price}${ele.menu_memo}`).join('\n')
      wx.showModal({
        title: '菜单识别信息',
        content: str
      })
    } else {
      wx.showToast({
        title: '无菜单信息',
        icon: 'none'
      })
    }
  },

  // 通用印刷体QCR
  QCRPrintedFontSuccess(ele) {
    console.log('通用印刷体QCR', ele)
  },


  /* *****************  小程序QCR插件证件识别  ******************* */
})