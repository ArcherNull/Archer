/*
 * @Author: Null 779217162@qq.com
 * @Date: 2025-10-09 09:46:33
 * @LastEditors: Null 779217162@qq.com
 * @LastEditTime: 2025-10-09 20:10:54
 * @FilePath: \Archer\mcp-server\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";

const server = new McpServer({
    name: "my mcp server",
    title: "my mcp server",
    version: "0.1.0",
});

server.registerTool(
    "sum",
    {
        title: "求和",
        description: "计算两个数字的和",
        inputSchema: {
            a: z.number().describe("第一个数字"),
            b: z.number().describe("第二个数字"),
        }
    },
    ({ a, b }) => {
        return {
            content: [{
                type: "text",
                text: `两数求和结果是：${a + b}`,
            }]
        }
    }
);

server.registerTool(
    'createFile',
    {
        title: "创建一个文件",
        description: "在指定目录下创建一个文件",
        inputSchema: {
            filename: z.string().describe("文件名"),
            content: z.string().describe("文件内容"),
        }
    },
    ({ filename, content }) => {
        try {
            fs.writeFileSync(filename, content)
            return {
                content: [{
                    type: "text",
                    text: `文件创建成功`,
                }]
            }
        } catch (err) {
            return {
                content: [{
                    type: "text",
                    text: `文件创建失败，原因：${err.message}`,
                }]
            }
        }
    }
)

const transport = new StdioServerTransport();
server.connect(transport)
console.log('server is running');