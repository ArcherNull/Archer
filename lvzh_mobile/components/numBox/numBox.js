// components/numBox/numBox.js
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    //输入框的值
    inputValue: {
      type: Number,
      value: 1
    },
    //最小值
    min: {
      type: Number,
      value: 1
    },
    //最大值
    max: {
      type: Number,
      value: 999
    }
  },
  data: {
    //默认的input值
    inputValue: 1
  },
  methods: {
    //加减按钮操作
    add: function (ele) {
      var e = ele.currentTarget.dataset.value
      var index = ele.currentTarget.dataset.index
      if (index == 0) {
        e += 1
      } else {
        e -= 1
      }
      this.setData({
        inputValue: e
      })
    },
    //输入框中的值
    inputValue:function(ele){
      var e = ele.detail.value
      this.setData({
        inputValue : e
      })
    },

  }
})