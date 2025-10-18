/*
 *日期
 */
//获取当前的年月日时分秒，格式为2020/01/01 10：00：00
const Nowdate = new Date();
const time = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  let getNewDateArry = [year, month, day, hour, minute, second]
  let formatDay = [year, month, day].map(withData).join('/')
  let formatTime = [year, month, day].map(withData).join('/') + ' ' + [hour, minute, second].map(withData).join(':')
  return {
    getNewDateArry: getNewDateArry, //获取当前的年月日时分秒数组
    formatDay: formatDay, //获取当前的年月日，格式为2020/01/01 
    formatTime: formatTime, //获取当前的年月日时分秒，格式为2020/01/01 10：00：00
    getWeekString : getWeekString(), //获取本周的第一天
    getMonthStart : getMonthStart(), //获取本月的第一天
    getMonthEnd : getMonthEnd(), //获取本月的最后一天
  }
}
/**
 * @description:当前日期向前偏移offset天
 * @param {向前偏移的天数} offset
 * @return {如果今日为2021-02-03 ，offset输入2，输出2021-02-01}
 */
const getDateString = (offset)=> {
  Nowdate.setMinutes(Nowdate.getMinutes() - Nowdate.getTimezoneOffset())
  Nowdate.setDate(Nowdate.getDate() + (offset || 0))
  return Nowdate.toJSON().slice(0, 10)
}

/**
 * @description:获取本周的第一天
 * @return {如果今日为2021-02-03 ，输出星期一为2021-02-01}
 */
const getWeekString = ()=> {
  const WeekFirstDay = new Date(Nowdate - (Nowdate.getDay() - 1) * 86400000);
  const M = withData(Number(WeekFirstDay.getMonth())+1) 
  return Nowdate.getFullYear() + "-" + M + "-" + withData(WeekFirstDay.getDate());
}

/**
 * @description:获取本月的第一天
 * @return {如果今日为2021-02-03 ，输出本月第一天为2021-02-01}
 */
const getMonthStart = ()=> {
  const MonthFirstDay=new Date(Nowdate.getYear(),Nowdate.getMonth(),1);   
  const M = withData(Number(MonthFirstDay.getMonth())+1)    
  return Nowdate.getFullYear()+"-"+M+"-"+ withData(MonthFirstDay.getDate()); 
}

/**
 * @description:获取本月的最后一天
 * @return {如果今日为2021-02-03 ，输出本月最后一天为2021-02-28}
 */
const getMonthEnd = ()=> {
  const MonthNextFirstDay=new Date(Nowdate.getYear(),Nowdate.getMonth()+1,1);   
  const MonthLastDay=new Date(MonthNextFirstDay-86400000);   
  const M = withData(Number(MonthLastDay.getMonth())+1)   
  return Nowdate.getFullYear()+"-"+M+"-"+ withData(MonthLastDay.getDate()); 
}


/**
 * @description:日期格式化，判断为单数时，前面加个0 
 * @param {更改的数字} param
 * @return {输入1，输出01}
 */
function withData(param) {
  return param < 10 ? '0' + param : '' + param;
}

/**
 * @description: 自定义Picker时间选择器，需用到
 * @param {月份开始日期1号} start
 * @param {月份结束日期30号或31号} end
 * @return {返回对应大小月，对应长度的数组}
 */
function getLoopArray(start, end) {
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withData(i));
  }
  return array;
}

/**
 * @description: 获取当前月份的天数，自定义Picker时间选择器，需用到
 * @param {年} year
 * @param {月} month
 * @return {输入2020年8月，输出对应月份的天数数组}
 */
function getMonthDay(year, month) {
  var flag = year % 400 == 0 || (year % 4 == 0 && year % 100 != 0), //闰年判断
    array = null;

  switch (month) {
    case '01':
    case '03':
    case '05':
    case '07':
    case '08':
    case '10':
    case '12':
      array = getLoopArray(1, 31)
      break;
    case '04':
    case '06':
    case '09':
    case '11':
      array = getLoopArray(1, 30)
      break;
    case '02':
      array = flag ? getLoopArray(1, 29) : getLoopArray(1, 28)
      break;
    default:
      array = '月份格式不正确，请重新输入！'
  }
  return array;
}

/**
 * @description: 
 * @param {开始年限} startYear
 * @param {结束年限} endYear
 * @param {*} date
 * @return {*}
 */
function dateTimePicker(startYear, endYear, date) {
  // 返回默认显示的数组和联动数组的声明
  var dateTime = [],
    dateTimeArray = [ //六个可选择的滚动数组
      [],
      [],
      [],
      [],
      [],
      []
    ];
  var start = startYear || 1978;
  var end = endYear || 2100;
  // 默认开始显示数据
  var defaultDate = date ? [...date.split(' ')[0].split('-'), ...date.split(' ')[1].split(':')] : time(Nowdate).getNewDateArry;
  // 处理联动列表数据
  /*年月日 时分秒*/
  dateTimeArray[0] = getLoopArray(start, end); //年
  dateTimeArray[1] = getLoopArray(1, 12); //月
  dateTimeArray[2] = getMonthDay(defaultDate[0], defaultDate[1]); //日
  dateTimeArray[3] = getLoopArray(0, 23); //时
  dateTimeArray[4] = getLoopArray(0, 59); //分
  dateTimeArray[5] = getLoopArray(0, 59); //秒

  dateTimeArray.forEach((current, index) => {
    dateTime.push(current.indexOf(defaultDate[index]));
  });

  return {
    dateTimeArray: dateTimeArray,
    dateTime: dateTime
  }
}



let dateTime = {
  time: time,
  getMonthDay: getMonthDay, //获取月份的天数
  dateTimePicker: dateTimePicker, //微信小程序封装的时间选择器数组
}
export default dateTime