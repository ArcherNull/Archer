/*
 * @Author: Null
 * @Date: 2022-11-08 11:12:54
 * @Description: 
 */
// .prettierrc.js
module.exports = {
    // 让prettier使用eslint的代码格式进行校验
    eslintIntegration: true,
    // 缩进
    // tabWidth: 2,
    // 使用tab还是空格
    useTabs: false,
    // 最大长度80个字符
    printWidth: 200,
    // 行末分号
    semi: false,
    // 单引号
    singleQuote: true,
    // JSX双引号
    jsxSingleQuote: false,
    // 尽可能使用尾随逗号（包括函数参数）
    trailingComma: "none",
    // 在对象文字中打印括号之间的空格。
    bracketSpacing: true,
    // > 标签放在最后一行的末尾，而不是单独放在下一行
    jsxBracketSameLine: false,
    // 箭头圆括号
    arrowParens: "avoid",
    // 在文件顶部插入一个特殊的 @format 标记，指定文件格式需要被格式化。
    insertPragma: false,
    // 行尾换行格式
    endOfLine: "auto",
    HTMLWhitespaceSensitivity: "ignore",
  };