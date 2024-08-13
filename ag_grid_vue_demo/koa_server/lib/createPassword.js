// 随机密码,数字,字母下划线,大小写都有
const complexPsw = (min, max) => {
  // 可以生成随机密码的相关数组
  let num = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let english = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  let ENGLISH = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  let special = ["-", "_", "#"];
  let config = num.concat(english).concat(ENGLISH).concat(special);

  // 先放入一个必须存在的
  let arr = [];
  arr.push(getOne(num));
  arr.push(getOne(english));
  arr.push(getOne(ENGLISH));
  arr.push(getOne(special));

  // 获取需要生成的长度
  let len = min + Math.floor(Math.random() * (max - min + 1));

  for (let i = 4; i < len; i++) {
    // 从数组里面抽出一个
    arr.push(config[Math.floor(Math.random() * config.length)]);
  }

  // 乱序
  let newArr = [];
  for (let j = 0; j < len; j++) {
    newArr.push(arr.splice(Math.random() * arr.length, 1)[0]);
  }

  // 随机从数组中抽出一个数值
  function getOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return newArr.join("");
};

// 随机六位数字密码
const createPassword = () => {
  let Num = "";
  for (let i = 0; i < 6; i++) {
    //  想要几位就写几，我需要6位，所以我写的6
    Num += Math.floor(Math.random() * 10);
  }
  return Num;
};

const getRandom = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

// 随机六位数密码,包含字母大小写和数字
const randomWord = () => {
  let code = "";
  for (let i = 0; i < 6; i++) {
    let type = getRandom(1, 3);
    switch (type) {
      case 1:
        code += String.fromCharCode(getRandom(48, 57)); // 数字
        break;
      case 2:
        code += String.fromCharCode(getRandom(65, 90)); // 大写字母
        break;
      case 3:
        code += String.fromCharCode(getRandom(97, 122)); // 小写字母
        break;
    }
  }
  return code;
};

// 获取6位随机数
const getSixRandomCode = () =>
  String(Math.floor(Math.random() * 1000000)).padEnd(6, "0"); //生成6位随机验证码


exports.complexPsw = complexPsw;
exports.createPassword = createPassword;
exports.randomWord = randomWord;
exports.getSixRandomCode = getSixRandomCode;

