/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-31 15:57:25
 * @LastEditTime: 2024-04-29 13:59:33
 * @Description: 地址库数据
 */
import { cloneDeep } from 'lodash'
import regionJsonData from './region.json'

/**
 * @description: 强数据类型校验
 * @param {string} value
 * @return {boolean}
 */
function isType(value) {
  return Object.prototype.toString.call(value).slice(8, -1)
}

const REGION = {
  pcaRegion: [], // 存储省市区地址数据
  pcRegion: [], // 存储省市地址数据

  // 获取地址数据
  getRegionData(type = 'pca') {
    let regionData = []
    if (type === 'pca') {
      regionData = this.getPcaRegionData()
    } else {
      regionData = this.getPcRegionData()
    }
    return regionData
  },

  // 获取省市区三级数据
  getPcaRegionData() {
    let region = this.pcaRegion
    if (!this.pcaRegion.legth) {
      const getPcaData = cloneDeep(regionJsonData)
      this.pcaRegion = getPcaData
      region = getPcaData
    }
    return region
  },

  // 获取省市二级数据
  getPcRegionData() {
    let region = this.pcRegion
    if (!this.pcRegion.legth) {
      const getPcaData = this.splitTreeData(regionJsonData)
      this.pcRegion = getPcaData
      region = getPcaData
    }
    return region
  },

  /**
   * @description: 获取树节点数据
   * @param {*} treeData
   * @return {*}
   */
  splitTreeData(treeData) {
    const newTreeData = cloneDeep(treeData)
    if (Array.isArray(newTreeData) && newTreeData.length) {
      for (let i = 0; i < newTreeData.length; i++) {
        let childrenArr = newTreeData[i].children
        if (childrenArr && childrenArr.length) {
          for (let j = 0; j < childrenArr.length; j++) {
            childrenArr[j].children = null
          }
        } else {
          childrenArr = []
        }
      }
    } else {
      console.error('树形结构数据需要传入非空数组')
    }
    return newTreeData
  },

  /**
   * @description: 获取地区码
   * @param { String[] } arr 地址数组，数组长度为3 ,
   * @param { String } type 返回数据类型  code 表示返回城市码；name 表示返回中文省市区；code objArr 表示返回数组对象  latlon 表示返回经纬度
   * @param { String } level 返回省市区数组深度， 2表示省市，3表示省市区
   * @return {*}
   * ```
   *  使用示例: getRegionCode(regionList,'code','pca‘)
   * ```
   */
  getRegionCode(arr, type = 'code', regionType = 'pca') {
    if (arr && Array.isArray(arr) && arr.every(ele => Boolean(ele))) {
      const [province, city, area] = arr
      console.log('arr=====>', arr)
      // 检察字符串是否都是数字
      const isNaNFun = () => {
        const reg = /^[0-9]\d*$/
        return arr.every(ele => !reg.test(Number(ele)))
      }

      const isNaNBool = isNaNFun()

      const getEmitData = []

      // 获取返回的数据
      const getData = obj => {
        if (obj && isType(obj) === 'Object') {
          const { code, name, lat, lon } = obj
          if (code) {
            if (type === 'code') {
              return Number(code)
            } else if (type === 'objArr') {
              return obj
            } else if (type === 'name') {
              return name
            } else if (type === 'latlon') {
              return {
                lat,
                lon
              }
            }
          } else {
            console.error('obj数据缺失,getData解析obj数据失败')
          }
        } else {
          console.error('getData获取数据obj失败')
        }
      }

      if (arr.length) {
        const pcaRegion = this.getRegionData(regionType)
        if (province && city) {
          const provinceItem = pcaRegion.find(pro => {
            const { name, shortName, code } = pro
            if (isNaNBool) {
              return [name, shortName].includes(province)
            } else {
              return [code].includes(province)
            }
          })
          if (provinceItem.children && provinceItem.children.length) {
            // console.log('provinceItem=====>', provinceItem)
            getEmitData.push(getData(provinceItem))
            const cityItem = provinceItem.children.find(cit => {
              const { name, shortName, code } = cit
              if (isNaNBool) {
                return [name, shortName].includes(city)
              } else {
                return [code].includes(city)
              }
            })

            if (cityItem.children && cityItem.children.length) {
              // console.log('cityItem=====>', cityItem)
              getEmitData.push(getData(cityItem))

              if (arr.length === 3 && regionType === 'pca') {
                if (area) {
                  const areaItem = cityItem.children.find(are => {
                    const { name, shortName, code } = are
                    if (isNaNBool) {
                      return [name, shortName].includes(area)
                    } else {
                      return [code].includes(area)
                    }
                  })

                  if (areaItem) {
                    // console.log('areaItem=====>', areaItem)
                    getEmitData.push(getData(areaItem))
                  } else {
                    console.error('区级参数查询失败！')
                    return []
                  }
                } else {
                  console.error('缺少必要区参数！')
                  return []
                }
              } else {
                return getEmitData
              }
              return getEmitData
            } else {
              if (arr.length === 3 && regionType === 'pca') {
                if (/市辖区|北京市|天津市|上海市|重庆市|上海|北京|天津|重庆/g.test(city)) {
                  console.error('存在市辖区三级回显', provinceItem)
                  if (provinceItem.children.length) {
                    const cityItem = provinceItem.children[0]
                    getEmitData.push(getData(cityItem))
                    const areaItem = cityItem.children.find(are => {
                      const { name, shortName, code } = are
                      if (isNaNBool) {
                        return [name, shortName].includes(area)
                      } else {
                        return [code].includes(area)
                      }
                    })

                    if (areaItem) {
                      getEmitData.push(getData(areaItem))
                      return getEmitData
                    } else {
                      console.error('区级参数查询失败！')
                      return []
                    }
                  } else {
                    console.error('地址库数据出错！')
                    return []
                  }
                } else {
                  console.error('市级参数查询失败！')
                }
                return []
              } else {
                // /市辖区|北京市|天津市|上海市|重庆市/g
                if (/市辖区/g.test(city)) {
                  console.error('存在市辖区二级回显', provinceItem)
                  if (provinceItem.children.length) {
                    getEmitData.push(getData(provinceItem.children[0]))
                    return getEmitData
                  } else {
                    console.error('地址库数据出错！')
                    return []
                  }
                } else {
                  getEmitData.push(getData(cityItem))
                  return getEmitData
                }
              }
            }
          } else {
            console.error('省级参数查询失败！')
            return []
          }
        } else {
          console.error('缺少必要省市参数！')
          return []
        }
      } else {
        console.error('回显地区码的数组长度不为3，请检查！')
        return []
      }
    } else {
      return []
    }
  },

  /**
   * @description: 深度查找数组对象内的值，用于查找二级三级对象
   * @param {string} key 键名称
   * @param {string} value 值名称
   * @param {string} children 下级键名称
   * @return {*} 返回对应的索引值
   * ```
   * 使用示例：getObject('name','东城区')， 可以获取到 北京市/北京市/东城区的对象数据
   * ```
   */
  getObject(key, value, children = 'children') {
    var obj
    const pcaRegion = this.getRegionData()
    pcaRegion.some(function iter(arr) {
      if (arr[key] === value) {
        obj = arr
        return true
      }
      return Array.isArray(arr[children]) && arr[children].some(iter)
    })
    return obj
  },

  // 回显区
  /**
   * @description: 对于省市的二级地址，区可以是不必填的情况，需要用到此回显区列表
   * @param {[number,number]} ele [省code,市code]
   * @return {any[]} 区列表
   * ```
   * 使用示例：getEchoArea([110000,110100])， 可以获取到 北京市下所有区数据
   * ```
   */
  getEchoArea(ele) {
    if (Array.isArray(ele) && ele.length === 2) {
      const areaData = this.getObject('code', Number(ele[ele.length - 1]))
      if (areaData.children && areaData.children.length) {
        return areaData.children.map(ele => {
          return {
            label: ele.name,
            ...ele
          }
        })
      } else {
        if (areaData) {
          return [areaData].map(ele => {
            return {
              label: ele.name,
              ...ele
            }
          })
        }
      }
    } else {
      return []
    }
  },

  /**
   * @description: 校验并计算坐标点距离
   * @param {*} start
   * @param {*} end
   * @return {*} 返回数字  km
   */
  validateAndCalcLocation(start, end) {
    const getStart = this.validateLocation(start)
    const getEnd = this.validateLocation(end)
    if (getEnd && getStart) {
      return this.calculateDiscount(getStart, getEnd)
    } else {
      return 0
    }
  },

  /**
   * @description: 校验坐标点
   * @param {*} location
   * @return {*}
   */
  validateLocation(location) {
    if (Array.isArray(location) && location.length === 2) {
      const getNum = num => Number(num)
      const lng = getNum(location[0])
      const lat = getNum(location[1])

      if (isNaN(lng) && lng > 90) {
        console.error('经度为数字并且大于90')
        return false
      }

      if (isNaN(lat) && lng < 90) {
        console.error('纬度为数字并且小于90')
        return false
      }

      return [lng, lat]
    } else {
      console.error('经纬度需为数组，并且长度为2')
      return false
    }
  },

  /**
   * @description: 两坐标点之间的距离计算
   * @param {*} start [number , number]
   * @param {*} end [number , number]
   * @return {*}
   */
  calculateDiscount(start, end) {
    const [lng1, lat1] = start
    const [lng2, lat2] = end
    const radLat1 = (lat1 * Math.PI) / 180.0
    const radLat2 = (lat2 * Math.PI) / 180.0
    const a = radLat1 - radLat2
    const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
    let s =
      2 *
      Math.asin(
        Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2))
      )
    s = s * 6378.137 // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000

    s = s * 1000
    if (isNaN(s)) {
      return 0
    }
    if (s > 100000) {
      // 大于100Km时
      s = Math.floor((s / 1000) * 100) / 100
      return s.toFixed()
    } else if (s > 1000 && s <= 100000) {
      // 大于1000米 且 小于100Km时
      s = Math.floor((s / 1000) * 100) / 100
      return s.toFixed(1)
    } else {
      // 小于或等于1000米
      s = Math.floor(s / 1000)
      return s.toFixed()
    }
  },

  /**
   * @description: 处理树型地理数据的方法
   * @param {*} regionList
   * @return {*}
   * ···
   *   // 例如 ：dealTreeRegionData(['820000,820004,820004|澳门特别行政区,大堂区,大堂区'])
   * ···
   */
  dealTreeRegionData(regionList) {
    if (Array.isArray(regionList) && regionList.length) {
      const isFill = arr => arr.every(ele => Boolean(ele))
      return regionList
        .map(ele => {
          const splitArr = ele.split('|')
          if (splitArr.length === 2) {
            const [codeStr, addrStr] = splitArr
            const codeArr = codeStr.split(',')
            const addrArr = addrStr.split(',')
            if (codeArr.length === addrArr.length && isFill(codeArr) && isFill(addrArr)) {
              const len = codeArr.length
              if (len === 1) {
                return {
                  province: addrArr[0],
                  provinceCode: codeArr[0]
                }
              } else if (len === 2) {
                return {
                  province: addrArr[0],
                  provinceCode: codeArr[0],
                  city: addrArr[1],
                  cityCode: codeArr[1]
                }
              } else if (len === 3) {
                return {
                  province: addrArr[0],
                  provinceCode: codeArr[0],
                  city: addrArr[1],
                  cityCode: codeArr[1],
                  area: addrArr[2],
                  areaCode: codeArr[2]
                }
              } else {
                return null
              }
            } else {
              return null
            }
          } else {
            return null
          }
        })
        .filter(ele => Boolean(ele))
    } else {
      return []
    }
  }
}

export default REGION
