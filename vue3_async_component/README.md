# vue-vite-app
## 简介
vue-vite-app是一款后台前端解决方案,作为个人的vue3练手项目

后台项目，源码地址在： https://github.com/ArcherNull/Archer/tree/main/ag_grid_vue_demo/koa_server

## 功能

```
- 登录 / 注销

- 权限验证
  - 动态路由权限
  - 页面按钮权限

- 全局功能
  - 国际化多语言
  - 多种动态换肤
  - 动态侧边栏（支持多级路由嵌套，路由懒加载）
  - 动态面包屑
  - 快捷导航(标签页)
  - Screenfull全屏
  - 自适应收缩侧边栏

- 编辑器
  - 富文本
```
## 开发

node >= 18.15.0

```bash
# 克隆项目
git clone git地址

# 进入项目目录
cd vue-vite-app

# 安装依赖
pnpm install

# 启动服务
pnpm serve
```

浏览器访问 http://localhost:8000

## 发布

```bash
# 构建生产环境
pnpm build
```
## 技术支持
[👤 Author] [@Null](https://juejin.cn/user/3633260177130872)

## Show your support
Give a ⭐️ if this project helped you!
如果觉得项目还不错, 就点个star吧~

## 🤝 Contributing
欢迎提供问题和功能需求, 如果大家有好的点子和优化建议, 也欢迎提出参与我们的共建.


  "lint-staged": {
    "src/**/*.{js,vue}": [
      "eslint --fix",
      "git add"
    ]
  }