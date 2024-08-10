### file-convert
用于文件的后缀名快速转换的工具

应用场景是，有这样一个js项目，需求需要更改为ts项目运行，js文件种类繁多，高达300+，如果一个一个更改是不现实的，所以有这个工具诞生。ts存在类型标注，仅仅只在头部加入// @ts-nocheck 进行忽略

### 安装
```
npm install

node index.js
```

### 运行注意
需要更改index.js文件中的代码
```

const dirList = ['./base']

```