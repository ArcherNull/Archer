/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-06-01 09:11:49
 * @LastEditTime: 2024-06-01 09:11:56
 * @Description:
 */
self.onmessage = ({ data: { question } }) => {
  console.log("question", question);
  self.postMessage({
    answer: 42,
  });
};
