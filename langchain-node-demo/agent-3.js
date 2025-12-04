// 这是一个基于黑名单机制的敏感词过滤器，支持单个文档和批量文档处理。
// 它可以通过正则表达式匹配敏感词，将匹配到的内容替换为***，
// 同时提供了异步处理能力，适用于文本内容审核场景。

import { BaseDocumentTransformer } from "langchain-core/documents";
import { Document } from "@langchain/core/documents";

/**
 * 敏感词过滤器类
 * 继承自BaseDocumentTransformer，用于文本内容的敏感词过滤
 */
export class SensitiveFilter extends BaseDocumentTransformer {
  /**
   * 构造函数
   * @param {string[]} blacklist - 需要过滤的敏感词列表
   * @param {Object} options - 配置选项
   * @param {boolean} options.useRegex - 是否启用正则表达式匹配
   */
  constructor(blacklist, options = {}) {
    super();
    this.blacklist = blacklist;
    this.useRegex = options.useRegex || false;
  }

  /**
   * 批量处理文档
   * @param {Document[]} docs - 需要处理的文档数组
   * @returns {Promise<Document[]>} 处理后的文档数组
   */
  async processDocuments(docs) {
    return Promise.all(docs.map(doc => this.processDocument(doc)));
  }

  /**
   * 处理单个文档
   * @param {Document} doc - 需要处理的文档
   * @returns {Promise<Document>} 处理后的文档
   */
  async processDocument(doc) {
    const filteredContent = this.filterText(doc.pageContent);
    return {
      ...doc,
      pageContent: filteredContent
    };
  }

  /**
   * 文本过滤处理
   * @param {string} content - 需要过滤的文本内容
   * @returns {string} 过滤后的文本
   */
  filterText(content) {
    // 使用黑名单进行过滤
    return this.blacklist.reduce((text, word) => {
      if (this.useRegex) {
        try {
          const regex = new RegExp(word, "gi"); // 全局、忽略大小写匹配
          return text.replace(regex, "***");
        } catch (e) {
          console.warn(`无效的正则表达式模式: ${word}`);
          return text;
        }
      }
      return text.replace(new RegExp(word, "gi"), "***");
    }, content);
  }

  /**
   * 批量处理文本内容
   * @param {string[]} contents - 需要处理的文本数组
   * @returns {Promise<string[]>} 处理后的文本数组
   */
  async batchProcess(contents) {
    return Promise.all(contents.map(content => {
      const doc = new Document({ pageContent: content });
      return this.processDocument(doc).then(result => result.pageContent);
    }));
  }
}

// 创建过滤器实例
const filter = new SensitiveFilter(
  ["暴力", "色情"], // 定义敏感词黑名单
  {
    whitelist: ["暴力美学"],  // 定义白名单例外
    useRegex: true,  // 启用正则表达式匹配
    cacheSize: 1000  // 设置缓存大小
  }
);

/**
 * 测试函数
 * 演示敏感词过滤器的使用方法
 */
async function testFilter() {
  // 测试文档处理
  const docs = [
    new Document({ pageContent: "这是一段暴力美学的描写" }), // 测试白名单
    new Document({ pageContent: "这是一段含有暴力内容的文本" }) // 测试敏感词过滤
  ];

  const cleanDocs = await filter.processDocuments(docs);
  console.log(cleanDocs);

  // 测试批量文本处理
  const contents = ["文本1包含暴力", "文本2正常"];
  const cleanContents = await filter.batchProcess(contents);
  console.log(cleanContents);
}

// 运行测试
testFilter();