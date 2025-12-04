import dotenv from "dotenv";
import { weatherTool } from "./agent-4.js";

// 加载环境变量
dotenv.config();

/**
 * 测试天气查询功能
 */
async function testWeatherAPI() {
  try {
    // 测试查询北京天气
    const beijingWeather = await weatherTool._call("Beijing");
    console.log("北京天气：");
    console.log(beijingWeather);
    console.log("\n");

    // 测试查询上海天气
    const shanghaiWeather = await weatherTool._call("Shanghai");
    console.log("上海天气：");
    console.log(shanghaiWeather);
    console.log("\n");

    // 测试错误情况 - 无效城市名
    const invalidCityWeather = await weatherTool._call("InvalidCity");
    console.log("无效城市测试：");
    console.log(invalidCityWeather);
  } catch (error) {
    console.error("测试过程中出现错误：", error.message);
  }
}

// 运行测试
testWeatherAPI();