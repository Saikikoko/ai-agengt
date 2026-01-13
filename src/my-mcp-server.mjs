import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {email, z} from 'zod';

const database = {
  users: {
    '001': { id: '001', name: '章三', email: 'zhangsan@example.com', role: 'admin'},
    '002': { id: '002', name: '张三', email: 'zhangsan@example.com', role: 'user'},
    '003': { id: '003', name: '李四', email: 'lisi@example.com', role: 'user'},
  }
}

const server = new McpServer({
  name: 'my-mcp-server',
  version: '1.0.0',
})


server.registerTool('query_user', {
  description: '查询数据库中的用户信息，输入用户ID，返回该用户的详细信息（姓名、邮箱、角色）',
  inputSchema: {
    userId: z.string().describe('用户ID，例如：001，002，003'),
  }
}, async ({userId}) => {
  const user = database.users[userId];

  if (!user) {
    return {
      content: [
        {
          type: 'text',
          text: `用户 ID ${userId} 不存在。可用的 ID：001，002，003`,
        },
      ],
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `用户信息：\n ID： ${userId} 的信息如下：\n姓名：${user.name}\n邮箱：${user.email}\n角色：${user.role}`,
      }
    ]
  }
})

server.registerResource('使用指南', 'docs://guide', {
  description: 'MCP Server 使用文档',
  mimeType: 'text/plain',
}, async () => {
  return {
    contents: [
      {
        uri: 'docs://guide',
        mimeType: 'text/plain',
        text: `MCP Server 使用指南
功能：提供用户查询工具。
使用：在Cursor等MCP Client 中通过 自然语言对话，Cursor 会自动调用相应工具。
        `,
      }
    ]
  }
})

const transport = new StdioServerTransport()

await server.connect(transport)
