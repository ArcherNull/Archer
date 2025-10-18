const date = new Date()
const years = []
const months = []
const days = []

for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Component({
  options: {
    addGlobalClas: true,
  },
  onShareAppMessage() {
    return {
      title: 'picker-view',
      path: 'page/component/pages/picker-view/picker-view'
    }
  },

  data: {
    years,
    year: date.getFullYear(),
    months,
    month: 3,
    days,
    day: 2,
    value: [1, 1, 1],
    isDaytime: true,
  },
  methods:{

    bindChange(e) {
      const val = e.detail.value
      console.log('时间选取到' , val)
      this.setData({
        year: this.data.years[val[0]],
        month: this.data.months[val[1]],
        day: this.data.days[val[2]],
        isDaytime: !val[3]
      })
    }
  }

})