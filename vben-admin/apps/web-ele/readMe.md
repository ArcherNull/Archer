## 添加依赖到工作区

命令格式为： pnpm add <package-name> --filter <workspace-name>

```
// 在web-ele中加入依赖
pnpm add lodash-es --filter web-ele

// 在web-ele中加入开发依赖
pnpm add @types/lodash-es --filter web-ele -D

```

共享依赖加入-w , 不共享依赖 则不加入 -w

```
pnpm add lodash-es -w

```
