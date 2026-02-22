# langchain-node-demo

## 介绍

langchain.js 学习与实践 demo，包含多种智能体（Agent）和工具集成示例。

## 目录结构

- `agent-1.js`：ReAct 智能体，支持通义千问模型、数学计算、对话记忆。
- `agent-2.js`：带记忆的客服助手，支持流式输出和上下文记忆。
- `agent-3.js`：敏感词过滤器，支持正则批量过滤文本内容。
- `agent-4.js`：天气查询助手，集成 WeatherAPI 和计算器，支持中英文天气对比。
- `test-weather.js`：天气工具独立测试脚本。
- `package.json`：依赖与项目信息。
- `.env`：环境变量配置（需自行创建）。

## 安装依赖

```bash
npm install
```

## 环境变量配置

根目录创建 `.env` 文件，内容如下：

```text
DASHSCOPE_API_KEY=你的阿里云百炼API KEY
WEATHER_API_KEY=你的WeatherAPI KEY（用于天气查询）
```

- DASHSCOPE_API_KEY：可在阿里云百炼平台免费申请。
- WEATHER_API_KEY：可在 https://www.weatherapi.com/ 免费注册获取。

## 各脚本功能说明

### agent-1.js
- 使用通义千问大模型（qwen-max）
- 集成 Calculator 工具，支持数学表达式计算
- 具备对话历史记忆能力（MemorySaver）
- 采用 ReAct Agent 架构，适合多轮对话和工具调用
- 运行：
  ```bash
  node agent-1.js
  ```

### agent-2.js
- 客服助手，具备上下文记忆（BufferMemory）
- ConversationChain 构建，支持流式输出
- 适合客服、推荐等场景
- 运行：
  ```bash
  node agent-2.js
  ```

### agent-3.js
- 敏感词过滤器，支持正则表达式和批量文本处理
- 适合内容审核、文本清洗等场景
- 运行：
  ```bash
  node agent-3.js
  ```

### agent-4.js
- 天气查询助手，集成 WeatherAPI 和 Calculator
- 支持中英文城市天气查询与对比
- 需配置 WEATHER_API_KEY
- 运行：
  ```bash
  node agent-4.js
  ```

### test-weather.js
- 独立测试 WeatherAPI 工具
- 运行：
  ```bash
  node test-weather.js
  ```

## 依赖说明

- langchain、@langchain/openai、@langchain/community、@langchain/core
- dotenv（环境变量加载）
- axios（HTTP 请求，天气查询用）

## License

本项目采用 CC0 1.0 Universal 协议。

---

如有问题欢迎提 issue 或 PR。
