import { ref, onUnmounted } from 'vue'

/**
 * @description: defer延迟方式加载组件
 * @param {*} maxCount 最大节点加载数量
 * @return {*}
 */
export function useDefer (maxCount = 100) {
  const frameCount = ref(0)
  let rafId
  function updateFrameCount () {
    rafId = requestAnimationFrame(() => {
      frameCount.value++
      if (frameCount.value > maxCount) {
        return
      }

      updateFrameCount()
    })
  }

  updateFrameCount()

  // 页面加载完毕，卸载
  onUnmounted(() => {
    cancelAnimationFrame(rafId)
  })

  return function defer (n) {
    return frameCount.value >= n
  }
}
