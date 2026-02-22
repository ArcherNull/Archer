// 这是一个基于通义千问API和WeatherAPI的天气查询助手，支持实时获取城市天气数据并进行温度对比。
// 技术实现上使用了ReAct智能体架构，集成了天气查询和计算器工具，
// 通过Tool类扩展实现天气API调用，支持中文输出，并包含完善的错误处理机制。

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Calculator } from "@langchain/community/tools/calculator";
import { Tool } from "langchain/tools";
import axios from "axios";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

/**
 * WeatherAPI工具类
 * 用于获取指定城市的实时天气数据
 */
export class WeatherAPI extends Tool {
  constructor() {
    super();
    this.name = "get_weather";
    this.description = "获取指定城市的实时天气数据";
  }

  /**
   * 调用天气API获取数据
   * @param {string} city - 城市名称
   * @returns {Promise<string>} 格式化的天气信息
   */
  async _call(city) {
    if (!process.env.WEATHER_API_KEY) {
      throw new Error("未配置WEATHER_API_KEY环境变量");
    }

    try {
      const response = await axios.get("https://api.weatherapi.com/v1/current.json", {
        params: {
          key: process.env.WEATHER_API_KEY,
          q: city,
          lang: "zh"
        }
      });

      const { temp_c, condition } = response.data.current;
      return `${city}的天气情况：\n温度：${temp_c}℃\n天气状况：${condition.text}`;
    } catch (error) {
      if (error.response) {
        // API响应错误
        const status = error.response.status;
        if (status === 401) {
          return "API密钥无效或已过期";
        } else if (status === 400) {
          return "请求参数无效，请检查城市名称";
        }
      }
      // 网络错误或其他未知错误
      return "无法获取天气信息，请稍后重试";
    }
  }
}

// 配置通义千问API
const chatModel = new ChatOpenAI({
  modelName: "qwen-max",
  temperature: 0.7,
  openAIApiKey: process.env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
});

// 注册到Agent
const tools = [new WeatherAPI(), new Calculator()];

// 创建增强型ReAct智能体
// llm: 使用配置好的通义千问模型
// checkpointSaver: 使用记忆组件保存对话检查点
// tools: 集成计算器和搜索工具，增强AI的实际问题解决能力
const agent = createReactAgent({
  llm: chatModel,
  tools: tools,
  verbose: true  // 启用详细日志输出
});

// 对话处理函数
async function chat(input, threadId = "default") {
  try {
    const response = await agent.invoke(
      { messages: [new HumanMessage(input)] },
      { 
        configurable: { 
          thread_id: threadId,
          maxIterations: 3  // 限制最大工具调用次数，防止无限循环
        } 
      }
    );
    return response.messages[response.messages.length - 1].content;
  } catch (error) {
    console.error("对话处理出错:", error);
    return "抱歉，处理您的请求时出现错误。";
  }
}

// 主函数
async function main() {
  try {
    // 因为WEATHER_API_KEY是国外的免费key,所以要写城市的英文缩写
    const response = await chat("今天BEIJING的天气怎么样？气温是多少度？比SHANGHAI的气温高嘛？");
    console.log("AI response: ", response);
  } catch (error) {
    console.error("执行出错:", error);
  }
}

// 运行测试程序
main();