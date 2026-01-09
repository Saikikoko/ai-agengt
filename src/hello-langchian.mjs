import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
// 简单的 LangChain 示例：用 OpenAI 聊天模型回答一个问题
// 运行前请先在环境变量中设置 OPENAI_API_KEY
// 例如：在终端中执行
//   export OPENAI_API_KEY="你的API Key"
dotenv.config();
console.log(process.env)
const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME || "qwen-coder-turbo", // 也可以换成你账号可用的模型名
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_API_BASE_URL,
  },
});

const response = await model.invoke("介绍下自己");

console.log(response);
