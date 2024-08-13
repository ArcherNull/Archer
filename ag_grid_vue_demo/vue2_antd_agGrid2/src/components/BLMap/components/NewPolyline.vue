<script>
/*eslint-disable*/
/** vue-baidu-map/components/base/mixins/common
 * 注意此处三个引入路径vue-baidu-map/components/base/bindEvent
 * 在源文件中使用的是相对路径vue-baidu-map/components/base/factory
 * 但是因为现在是自定义组件,所以要重新调整路径
 */
import commonMixin from 'vue-baidu-map/components/base/mixins/common.js'
import bindEvents from 'vue-baidu-map/components/base/bindEvent.js'
import { createPoint } from 'vue-baidu-map/components/base/factory.js'

export default {
  // 起一个新名字
  name: 'NewPolyline',
  render() {},
  mixins: [commonMixin('overlay')],
  props: {
    path: {
      type: Array,
    },
    // 新声明一个icons
    icons: {
      type: Array,
    },
    strokeColor: {
      type: String,
    },
    strokeWeight: {
      type: Number,
    },
    strokeOpacity: {
      type: Number,
    },
    strokeStyle: {
      type: String,
    },
    massClear: {
      type: Boolean,
      default: true,
    },
    clicking: {
      type: Boolean,
      default: true,
    },
    editing: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    path: {
      handler(val, oldVal) {
        this.reload()
      },
      deep: true,
    },
    strokeColor(val) {
      this.originInstance.setStrokeColor(val)
    },
    strokeOpacity(val) {
      this.originInstance.setStrokeOpacity(val)
    },
    strokeWeight(val) {
      this.originInstance.setStrokeWeight(val)
    },
    strokeStyle(val) {
      this.originInstance.setStrokeStyle(val)
    },
    editing(val) {
      val ? this.originInstance.enableEditing() : this.originInstance.disableEditing()
    },
    massClear(val) {
      val ? this.originInstance.enableMassClear() : this.originInstance.disableMassClear()
    },
    clicking(val) {
      this.reload()
    },
  },
  methods: {
    load() {
      const {
        BMap,
        map,
        path,
        // 参数解构 加入icons
        icons,
        strokeColor,
        strokeWeight,
        strokeOpacity,
        strokeStyle,
        editing,
        massClear,
        clicking,
      } = this
      const overlay = new BMap.Polyline(
        path.map((item) =>
          createPoint(BMap, {
            lng: parseFloat(item.lng),
            lat: parseFloat(item.lat),
          })
        ),
        {
          strokeColor,
          strokeWeight,
          strokeOpacity,
          strokeStyle,
          // 配置icons
          icons,
          enableEditing: editing,
          enableMassClear: massClear,
          enableClicking: clicking,
        }
      )
      this.originInstance = overlay
      map.addOverlay(overlay)
      bindEvents.call(this, overlay)
    },
  },
}
</script>
