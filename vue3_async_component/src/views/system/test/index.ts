import { type Ref, onMounted, onUnmounted, shallowRef } from 'vue'

import Sortable from 'sortablejs'

export function useSortable(container: Ref<any>, list: Ref<any[]>, options?: any) {
    const instance = shallowRef()

    onMounted(() => {
        instance.value = Sortable.create(container.value, {
            ...options,
            onUpdate(event: any) {
                options?.onUpdate?.(event)

                const { newIndex, oldIndex } = event
                const oldValue = list.value[oldIndex]
                list.value.splice(oldIndex, 1)
                list.value.splice(newIndex, 0, oldValue)
            }
        })

        onUnmounted(() => {
            instance.value.destroy()
        })
    })
    
    return instance
}
