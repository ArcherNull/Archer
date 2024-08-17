/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-19 08:45:19
 * @LastEditTime: 2023-07-10 14:07:43
 * @Description: 用户表配置
 */

/**
 * @description: 表唯一性id  path + pathAnchor + company + id
 * @return {*}
 */
export const userTableConfig = {
  name: '用户表', // 表名
  // 表唯一性id  path + pathAnchor + company + id + permission
  id: '/order/order-manage|right|KA|user-table|permission',
  // 是否展示序号列
  showFirstColumn: true,
  // 表数据
  database: {
    name: '姓名',
    sex: '性别',
    age: '年龄',
    age1: '年龄1',
    jg: '籍贯',
    sf: '省份',
    dz: '地址',
    date: '时间'
  },
  // 自定义表格columnDefs,优先级大于 【database和specColumns】
  columnDefs: [],
  // specColumns 和 database 结合一起
  specColumns: [
    {
      headerName: '姓名123',
      field: 'name',
      editable: function (params) {
        return params.data.name === '张三'
      },
      pinned: 'left', // 固定在左侧
      headerComponentParams: { menuIcon: 'fa-cog' }
      // cellRenderer: function (params) {
      //   const getDom = (color = '#E6A23C') => {
      //     return (
      //       `<span style="background-color:${color};display:inline-block;width:5px;height:5px;border-radius:5px;margin-right:5px;margin-bottom:2px"></span>` +
      //       params.value
      //     )
      //   }
      //   if (params.value === '李四') {
      //     return getDom('#E6A23C')
      //   } else if (params.value === '王五') {
      //     return getDom('#ffffff')
      //   } else {
      //     return params.value
      //   }
      // },
      // 单元格样式颜色
      // cellStyle: function (params) {
      //   let color = '#25262e'
      //   if (params.value === '张三') {
      //     color = '#b4b61a'
      //   } else if (params.value === '李四') {
      //     color = '#3a65ff'
      //   } else if (params.value === '王五') {
      //     color = '#1AB66C'
      //   } else if (params.value === '王五3') {
      //     color = '#DC143C'
      //   } else if (params.value === '') {
      //     color = '#DC143C'
      //   }
      //   return { color: '#fff', background: color }
      // }
    },
    {
      headerName: '姓名',
      field: 'name',
      pinned: 'left', // 固定在左侧
      headerComponentParams: { menuIcon: 'fa-cog' },
      cellRenderer: function (params) {
        const getDom = (color = '#E6A23C') => {
          return (
            `<span style="background-color:${color};display:inline-block;width:5px;height:5px;border-radius:5px;margin-right:5px;margin-bottom:2px"></span>` +
            params.value
          )
        }
        if (params.value === '李四') {
          return getDom('#E6A23C')
        } else if (params.value === '王五') {
          return getDom('#ffffff')
        } else {
          return params.value
        }
      }
    },
    {
      headerName: '年龄之和',
      field: 'age2',
      afterField: '年龄-age', // 改新增的前端字段，放置于那个字段后
      sort: 'desc',
      cellRenderer: (params) => {
        return Number(params.data.age) + Number(params.data.age1)
      }
    },
    {
      headerName: '年龄之和2',
      field: 'age2',
      afterField: '年龄-age', // 改新增的前端字段，放置于那个字段后
      sort: 'desc',
      cellRenderer: (params) => {
        return Number(params.data.age) + Number(params.data.age1)
      }
    },
    {
      headerName: '年龄之和123',
      field: 'age2',
      afterField: '年龄-age', // 改新增的前端字段，放置于那个字段后
      sort: 'desc',
      cellRenderer: (params) => {
        return Number(params.data.age) + Number(params.data.age1)
      }
    }
  ]
}

/* ************ 生成行列假数据方法 ， 执行 getRowData()方法即可 ************** */
export const userTableMockData = {
  // 获取0-9的随机数
  getRandom9 () {
    const randNum = Math.random()
    const random_1 = randNum + ''
    const age = (randNum * 100).toFixed(2)
    const age1 = (randNum * 500).toFixed(2)
    const sex = random_1 > 0.5 ? '男' : '女'
    const ran = random_1.charAt(3)
    // console.log("随机数ran", ran);
    return { ran, sex, age, age1 }
  },
  // 生成随机时间
  getRandomDate () {
    var maxdaterandom = new Date().getTime()
    // 由于当前环境为北京GMT+8时区，所以与GMT有8个小时的差值
    var mindaterandom = new Date(1970, 0, 1, 8).getTime()
    var randomdate = this.getRandom(mindaterandom, maxdaterandom)
    const ranDate = new Date(randomdate)
    const year = ranDate.getFullYear()
    const mon = ranDate.getMonth() + 1
    const month = mon < 10 ? '0' + mon : mon
    const day =
      ranDate.getDate() < 10 ? '0' + ranDate.getDate() : ranDate.getDate()
    var dateStr = `${year}-${month}-${day}`
    // console.log(dateStr);
    return dateStr
  },
  // 生成随机时间的随机数
  getRandom (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
  // 获取行单元格数据
  getRowData () {
    const item = {
      name: '王五',
      sex: '男',
      age: '35',
      jg: '中国',
      sf: '浙江',
      dz: '杭州市古墩路12号',
      date: '2021-10-06'
    }
    const nameArr = [
      '张三',
      '李四',
      '王五',
      '王五1',
      '王五2',
      '王五3',
      '王五4',
      '王五5',
      '王五6',
      '王五7'
    ]
    const newData = []
    for (let i = 0; i < 999; i++) {
      const cell = JSON.parse(JSON.stringify(item))
      const random = this.getRandom9()
      cell.age = random.age
      cell.age1 = random.age1
      cell.name = nameArr[random.ran]
      cell.sex = random.sex
      cell.date = this.getRandomDate()
      newData.push(cell)
    }
    // console.log('模拟数据', newData)
    return newData
  }
}

