const app = getApp()
const filter = app.commModule.filter  //路由守卫
//引入公共common.js文件
const common = app.commModule.common  //公共方法

Page(filter({
  data: {
    //删除按钮
    delDom: false,
    //规格分类的弹窗
    openPop: true,
    //是否显示pop中的搜索框
    search: false,
    //全选按钮
    chooseAll: false,
    //选中规格的文本
    ruleText:'',
    //单个商品规格
    rlueList: [{
      name: '规格',//规格名称
      choose:'',//选中文本
      rlues: [{
        id: 0,
        text: '15mm*16mm',
        active: false,
      }, {
        id: 1,
        text: '13mm*12mm',
        active: false,
      }, {
        id: 1,
        text: '13mm*12mm',
        active: false,
      }, {
        id: 1,
        text: '13mm*12mm',
        active: false,
      }]
    }, {
      name: '定制编号',
      choose:'',//选中文本
      rlues: [{
        id: 0,
        text: 'ddj_001',
        active: false,
      }, {
        id: 1,
        text: 'ddj_002',
        active: false,
      }, {
        id: 1,
        text: 'ddj_002',
        active: false,
      }, {
        id: 1,
        text: 'ddj_002',
        active: false,
      }, {
        id: 1,
        text: 'ddj_002',
        active: false,
      }]
    }, ],
    //购物车列表
    shopCarList: [{
      id: 0,
      img: '../../../../static/checkbox1.png', //商品图片
      title: '医医用外科口罩，超级便宜用外科口罩，超级便宜的医用外科口罩，划算便宜', //商品名称
      active: false, //是否选中
      choose: true, //是否选择商品规格
      price: '', //商品价格
      number: 1, //商品数量
    }, {
      id: 0,
      img: '../../../../static/checkbox1.png', //商品图片
      title: '医医用外科口罩，超级便宜用外科口罩，超级便宜的医用外科口罩，划算便宜', //商品名称
      active: false, //是否选中
      choose: false, //是否选择商品规格
      price: '', //商品价格
      number: 1, //商品数量
    }, {
      id: 0,
      img: '../../../../static/checkbox1.png', //商品图片
      title: '医医用外科口罩，超级便宜用外科口罩，超级便宜的医用外科口罩，划算便宜', //商品名称
      active: false, //是否选中
      choose: false, //是否选择商品规格
      price: '', //商品价格
      number: 1, //商品数量
    }, {
      id: 0,
      img: '../../../../static/checkbox1.png', //商品图片
      title: '医医用外科口罩，超级便宜用外科口罩，超级便宜的医用外科口罩，划算便宜', //商品名称
      active: false, //是否选中
      choose: true, //是否选择商品规格
      price: '', //商品价格
      number: 1, //商品数量
    }]
  },
  //删除与管理之间转换
  changeDel: function () {
    this.setData({
      delDom: !this.data.delDom
    })
  },
  //打开弹窗，选择规格
  openPop: function () {
    this.setData({
      openPop: !this.data.openPop
    })
  },
  //选中的规格标签
  chooseRlue: function (ele) {
    var item = ele.currentTarget.dataset.item
    var index = ele.currentTarget.dataset.index
    var pindex = ele.currentTarget.dataset.pindex
    var rlueListArr = this.data.rlueList

   // var str = 'rlueList[' + pindex + '].rlues[' + index + '].active'
    //只能实现一个规格里面有一个按钮被选中,所以先将所以状态都标为false
    rlueListArr.forEach((ele,inde)=>{
      //如果选中的是当前规格
      if(pindex == inde){
      ele.rlues.forEach((el,ind)=>{
        //如果点击的是刚好以前选中的状态的按钮
        if(index == ind){
          el.active = !item.active
          //如果当前标签选中的状态为true，则写入文本
          if(el.active){
            //将选中规格存入数组中
            rlueListArr[pindex].choose = this.data.rlueList[pindex].name + '：' + el.text + '；'
          }else{
            rlueListArr[pindex].choose = ''
          }
        }else{
          el.active = false
        }
      })
    }
    })
    console.log(rlueListArr)
    this.setData({
      rlueList: rlueListArr
    })
  },
  //全选按钮
  clickCheck: function (ele) {
    var e = ele.detail.a
    var arr = this.data.shopCarList
    arr.forEach(ele => {
      ele.active = e
    })
    this.setData({
      shopCarList: arr,
      chooseAll: e
    })

  },
  //单选按钮
  clickCheck1: function (ele) {
    var e = ele.detail.a
    var index = ele.currentTarget.dataset.index
    console.log(index)
    console.log(e)
    var str = 'shopCarList[' + index + '].active'
    this.setData({
      [str]: e
    })
    var arr = this.data.shopCarList
    var fliterBool = arr.some(ele => {
      return ele.active == false
    })
    this.setData({
      chooseAll : !fliterBool
    })
  },
  //去结算/删除
  submit: function () {
    if (!this.data.delDom) {
      console.log('去结算！')
      wx.navigateTo({
        url: './addOrder/addOrder',
      })
    } else {
      console.log('删除')
    }
  },
  //提交规格
  submitPop:function(){
    console.log('提交规格')
  }
}))