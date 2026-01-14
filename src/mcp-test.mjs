import 'dotenv/config'
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import { HumanMessage, ToolMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatOpenAI({ 
  modelName: 'qwen-plus',
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_API_BASE_URL,
  }
});

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    "amap-maps-streamableHTTP": {
      "url": `https://mcp.amap.com/mcp?key=${process.env.AMAP_API_KEY}`
    },
    "filesystem": {
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        ...(process.env.ALLOWED_PATHS.split(',') || '')
      ]
    },
     "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest"
      ]
    }
  }
});

const tools = await mcpClient.getTools();
const modelWithTools = model.bindTools(tools);

async function runAgentWithTools(query, maxIterations = 30) {

  const messages = [
    new HumanMessage(query)
  ]

  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`⏳ 正在等待AI思考...`));
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(`\n AI 最终回复：\n${response.content}`)

      return response.content;
    }

    console.log(chalk.bgBlue(`🔍 检测到 ${response.tool_calls.length} 个工具调用`))
    console.log(chalk.bgBlue(`🔍 工具调用：${response.tool_calls.map(t => t.name).join('，')}`))

    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);

      if (foundTool) {
        const toolResult = await foundTool.invoke(toolCall.args);

        let contentStr = ''
        if (typeof toolResult === 'string') {
          contentStr = toolResult;
        } else if (toolResult && toolResult.text) {
          contentStr = toolResult.text;
        }
        messages.push(new ToolMessage({
          content: contentStr,
          toolCallId: toolCall.id
        }));
      } else {
        console.log(chalk.bgRed(`❌ 未找到工具 ${toolCall.name}`));
      }
    }
  }

  return messages[messages.length - 1].content
}


// await runAgentWithTools("杭州东站附近的酒店，以及去的路线，生成文档保存到 /Users/shengbiao/Desktop 的一个 md 文件")
await runAgentWithTools("杭州东站附近的酒店，最近的三个酒店，拿到酒店图片，打开浏览器，展示每个酒店的图片，每个 tab 一个 url 展示,并且再把那个页面的标题改为酒店名")

await mcpClient.close();
