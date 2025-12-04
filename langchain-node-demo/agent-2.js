// 主要功能是创建一个具有记忆功能的客服助手。它使用BufferMemory来存储对话历史，通过ConversationChain构建对话链，并实现了流式输出响应的功能。当用户输入问题时，助手会基于历史对话记录友好地回答用户的问题。

import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { HumanMessagePromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// 配置通义千问API
const chatModel = new ChatOpenAI({
  modelName: "qwen-max",
  temperature: 0.7,
  openAIApiKey: process.env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
});

// 步骤1：配置带记忆的链
const memory = new BufferMemory({
  returnMessages: true,  // 保留完整消息对象（适合Chat模型）
  memoryKey: "history",  // 记忆存储字段名
  inputKey: "input"      // 输入字段名（需与调用参数一致）
});

// 步骤2：构建对话链
const chain = new ConversationChain({ 
  llm: chatModel,
  memory,
  prompt: ChatPromptTemplate.fromMessages([
    HumanMessagePromptTemplate.fromTemplate(`你是一个客服助手，需友好回答用户问题。
      当前对话历史：{history}
      用户最新输入：{input}`)
  ])
});

// 步骤3：实现流式交互
const userInput = "帮我推荐一款轻薄笔记本";
console.log("用户提问:", userInput);

// 调用并监听流事件
const stream = await chain.stream({ input: userInput });
let fullResponse = "";

for await (const chunk of stream) {
  if (chunk?.response) {
    process.stdout.write(chunk.response); // 逐词输出
    fullResponse += chunk.response;
  }
}

// 记录完整响应到记忆
await memory.saveContext(
  { input: userInput },
  { output: fullResponse }
);