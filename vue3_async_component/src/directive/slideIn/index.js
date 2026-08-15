/*
 * @Author: junsong Chen
 * @Date: 2025-12-15 23:08:36
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2025-12-15 23:49:42
 * @Description: 
 */
const DISTANCE = 150;
const DURATION = 500;

const map = new WeakMap()
const ob = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            // 该元素与视口相交
            console.log('entry', entry)
            const animation = map.get(entry.target)
            if (animation) {
                animation.play()
                ob.unobserve(entry.target)
            }
        }
    }
})

// 是否在视图下方
function isBelowViewPort(el) {
    const rect = el.getBoundingClientRect()
    console.log('rect.top', rect.top)
    return rect.top - DISTANCE > window.innerHeight
}

export default {
    mounted (el) {
        if (!isBelowViewPort(el)) return
        // 创建两个关键帧
        const animation = el.animate([
            {
                transform: `translateY(${DISTANCE}px)`,
                opacity: 0.5
            },
            {
                transform: `translateY(0)`,
                opacity: 1
            }
        ], {
            duration: DURATION,
            easing: 'ease-in-out',
            fill: 'forwards'
        })

        animation.pause()
        ob.observe(el)
        map.set(el, animation)
    },

    unmounted(el) {
        ob.unobserve(el)
    }
}