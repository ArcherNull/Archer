/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2022-05-24 20:53:57
 * @LastEditTime: 2023-07-11 11:49:15
 * @Description:
 */
export default {
  bind (el, binding, vnode) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')

    dialogHeaderEl.style.cursor = 'move'
    dragDom.style.top = '0px'

    // dialogHeaderEl.style.cssText += ';cursor:move;'
    // dragDom.style.cssText += ';top:0px;'

    // 头部插入全屏按钮
    dialogHeaderEl.insertAdjacentHTML(
      'beforeEnd',
      '<div class="zoomInOutBox"><div title="放大" class="zoomInOut-css changeBig"></div><div title="缩小" class="zoomInOut-css changeSmall"></div></div>'
    )
    const bigBtn = el.querySelector('.zoomInOutBox')
    const changeBig = el.querySelector('.changeBig')
    const changeSmall = el.querySelector('.changeSmall')

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const getStyle = (function () {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr]
      } else {
        return (dom, attr) => getComputedStyle(dom, false)[attr]
      }
    })()

    const screenWidth = document.body.clientWidth
    const screenHeight = document.body.clientHeight

    let moveCssText = ''

    const mousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop

      const dragDomWidth = dragDom.offsetWidth
      const dragDomHeight = dragDom.offsetHeight

      const minDragDomLeft = dragDom.offsetLeft
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth

      const minDragDomTop = dragDom.offsetTop
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight

      // 获取到的值带px 正则匹配替换
      let styL = getStyle(dragDom, 'left')
      let styT = getStyle(dragDom, 'top')

      if (styL.includes('%')) {
        styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100)
        styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100)
      } else {
        styL = +styL.replace(/\px/g, '')
        styT = +styT.replace(/\px/g, '')
      }

      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY

        // 边界处理
        if (-(left) > minDragDomLeft) {
          left = -minDragDomLeft
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }

        if (-(top) > minDragDomTop) {
          top = -minDragDomTop
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }

        // 移动当前元素
        // dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`

        dragDom.style.left = `${left + styL}px`
        dragDom.style.top = `${top + styT}px`

        moveCssText = dragDom.style.cssText
        document.body.style.userSelect = 'none'

        // emit onDrag event
        vnode.child.$emit('dragDialog')
      }

      document.onmouseup = function (e) {
        document.onmousemove = null
        document.onmouseup = null
        document.body.style.userSelect = 'text'
      }
    }

    dialogHeaderEl.onmousedown = mousedown

    // 初始非全屏
    let isFullScreen = false
    // 按钮出现时，弹窗主体也出现了
    bigBtn.onclick = (e) => {
      const dialogContentDom = el.querySelector('.el-dialog__body')
      if (isFullScreen === false) {
        // 弹窗主体自适应
        dialogContentDom.style.height = 'calc(100vh - 120px)'
        isFullScreen = true
        moveCssText = moveCssText || dragDom.style.cssText
        changeBig.style.display = 'none'
        changeSmall.style.display = 'block'
        dragDom.style.left = 0
        dragDom.style.top = 0
        dragDom.style.transform = 'none'
        dragDom.style.position = 'fixed'
        dragDom.style.height = '100VH'
        dragDom.style.width = '100%'
        dragDom.style.marginTop = 0
        dialogHeaderEl.style.cursor = 'default'
        dialogHeaderEl.onmousedown = null
      } else {
        // 弹窗主体自适应
        dialogContentDom.style.height = 'calc(100vh - 300px)'
        isFullScreen = false
        changeBig.style.display = 'block'
        changeSmall.style.display = 'none'
        dialogHeaderEl.style.cursor = 'move'
        dragDom.style.cssText = moveCssText
        dialogHeaderEl.onmousedown = mousedown
      }
    }
  },
  // 指令与元素解绑时调用
  unbind: function (el, binding) {
    el.instance && el.instance.$destroy()
  }
}
