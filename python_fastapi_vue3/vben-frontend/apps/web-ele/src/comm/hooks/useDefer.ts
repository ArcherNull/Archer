/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-24 09:45:29
 * @LastEditTime: 2024-09-24 09:51:33
 * @Description:
 */

import { onUnmounted, ref } from 'vue';

type DeferFunType = (n: number) => boolean;

/**
 * @description: defer延迟方式加载组件, 用于加载渲染较多的节点数据
 * @param {number} maxCount 最大节点加载数量
 * @return {DeferFunType} 函数
 */
export function useDefer(maxCount: number = 100): DeferFunType {
  const frameCount = ref(0);
  let rafId: number;
  function updateFrameCount() {
    rafId = requestAnimationFrame(() => {
      frameCount.value++;
      if (frameCount.value > maxCount) {
        return;
      }

      updateFrameCount();
    });
  }

  updateFrameCount();

  // 页面加载完毕，卸载
  onUnmounted(() => {
    cancelAnimationFrame(rafId);
  });

  return function defer(n: number): boolean {
    return frameCount.value >= n;
  };
}
