/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-20 14:07:30
 * @LastEditTime: 2023-07-22 16:53:28
 * @Description:
 */
import { useDark, useToggle } from '@vueuse/core'

export const isDark = useDark()
export const toggleDark = useToggle(isDark)
