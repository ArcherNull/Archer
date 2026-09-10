<template>
  <PrintItemBox title="打印模板选择" :isShowBottomLine="true">
    <view slot="right">
      <view class="modeSwitch">
        <view
          :class="[
            'modeSwitch-item',
            templateMode === 'common' ? 'modeSwitch-item--on' : '',
          ]"
          @click="setMode('common')"
          >通用</view
        >
        <view
          :class="[
            'modeSwitch-item',
            templateMode === 'brand' ? 'modeSwitch-item--on' : '',
          ]"
          @click="setMode('brand')"
          >品牌</view
        >
        <view
          :class="[
            'modeSwitch-item',
            templateMode === 'image' ? 'modeSwitch-item--on' : '',
          ]"
          @click="setMode('image')"
          >图片</view
        >
      </view>
    </view>

    <!-- 图片模式 -->
    <view v-if="templateMode === 'image'" class="imgPanel">
      <view class="imgPanel-size">
        <view class="imgPanel-sizeTitle">打印尺寸（毫米）</view>
        <view class="imgPanel-sizeRow">
          <view class="imgPanel-sizeField">
            <text class="imgPanel-sizeLabel">宽</text>
            <input
              class="imgPanel-sizeInput"
              type="digit"
              :value="String(imageWidthMm)"
              @input="onWidthInput"
              @blur="onSizeBlur"
            />
            <text class="imgPanel-sizeUnit">mm</text>
          </view>
          <text class="imgPanel-sizeX">×</text>
          <view class="imgPanel-sizeField">
            <text class="imgPanel-sizeLabel">高</text>
            <input
              class="imgPanel-sizeInput"
              type="digit"
              :value="String(imageHeightMm)"
              @input="onHeightInput"
              @blur="onSizeBlur"
            />
            <text class="imgPanel-sizeUnit">mm</text>
          </view>
          <view class="tplItem-action tplItem-action--primary" @click="onApplySize"
            >应用</view
          >
        </view>
        <view class="imgPanel-sizeHint">常用 40×40mm；宽高可自行修改后点「应用」重新解析</view>
      </view>

      <view class="imgPanel-quick" v-if="staticImages && staticImages.length">
        <view class="imgPanel-quickTitle">快捷选图（static）</view>
        <scroll-view class="imgPanel-quickScroll" scroll-x="true">
          <view class="imgPanel-quickList">
            <view
              v-for="item in staticImages"
              :key="item.key"
              :class="[
                'imgPanel-quickItem',
                imagePath === item.path ? 'imgPanel-quickItem--on' : '',
              ]"
              @click="onPickStatic(item)"
            >
              <image class="imgPanel-quickThumb" :src="item.path" mode="aspectFit" />
              <text class="imgPanel-quickName">{{ item.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="imagePath" class="imgPanel-preview">
        <image class="imgPanel-img" :src="imagePath" mode="aspectFit" />
        <view class="imgPanel-meta" v-if="imageMetaText">{{ imageMetaText }}</view>
        <view class="imgPanel-actions">
          <view class="tplItem-action" @click.stop="onViewCommand(null, 0)"
            >查看指令</view
          >
          <view class="tplItem-action" @click.stop="onChooseImage">相册上传</view>
          <view
            class="tplItem-action tplItem-action--danger"
            @click.stop="onClearImage"
            >清除</view
          >
        </view>
      </view>
      <view v-else class="imgPanel-empty" @click="onChooseImage">
        <view class="imgPanel-emptyTitle">点击上传图片</view>
        <view class="imgPanel-emptyHint"
          >仅支持 png / jpg，且不超过 100KB；也可上方快捷选 static 图</view
        >
      </view>
    </view>

    <!-- 通用 / 品牌模板列表 -->
    <view v-else class="tplList">
      <view
        v-for="(item, index) in templateOptions"
        :key="item.key"
        :class="['tplItem', index === templateIndex ? 'tplItem--active' : '']"
        @click="selectIndex(index)"
      >
        <view class="tplItem-main">
          <view class="tplItem-name">{{ item.label }}</view>
          <view class="tplItem-key"
            >{{ item.desc || "" }} {{ item.key || "" }}</view
          >
        </view>
        <view class="tplItem-actions">
          <view
            class="tplItem-action"
            @click.stop="onViewCommand(item, index)"
          >
            查看指令
          </view>
          <view
            v-if="templateMode === 'common'"
            class="tplItem-action tplItem-action--primary"
            @click.stop="onPreview(item, index)"
            >预览</view
          >
        </view>
      </view>
    </view>
  </PrintItemBox>
</template>

<script>
import PrintItemBox from "./PrintItemBox.vue";

export default {
  name: "TemplateSelect",
  components: {
    PrintItemBox,
  },
  props: {
    templateOptions: {
      type: Array,
      default: function () {
        return [];
      },
    },
    templateIndex: {
      type: Number,
      default: 0,
    },
    /** common | brand | image */
    templateMode: {
      type: String,
      default: "brand",
    },
    imagePath: {
      type: String,
      default: "",
    },
    imageMetaText: {
      type: String,
      default: "",
    },
    imageWidthMm: {
      type: [Number, String],
      default: 40,
    },
    imageHeightMm: {
      type: [Number, String],
      default: 40,
    },
    staticImages: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  methods: {
    setMode(mode) {
      if (mode === this.templateMode) return;
      this.$emit("update:templateMode", mode);
      this.$emit("mode-change", mode);
    },
    selectIndex(index) {
      this.$emit("update:templateIndex", index);
      this.$emit("change", index);
    },
    onPreview(item, index) {
      this.$emit("preview", { item: item, index: index });
    },
    onViewCommand(item, index) {
      this.$emit("view-command", { item: item, index: index });
    },
    onChooseImage() {
      this.$emit("choose-image");
    },
    onClearImage() {
      this.$emit("clear-image");
    },
    onPickStatic(item) {
      this.$emit("pick-static", item);
    },
    onWidthInput(e) {
      const v = e && e.detail ? e.detail.value : "";
      this.$emit("update:imageWidthMm", v);
    },
    onHeightInput(e) {
      const v = e && e.detail ? e.detail.value : "";
      this.$emit("update:imageHeightMm", v);
    },
    onSizeBlur() {
      this.$emit("size-change");
    },
    onApplySize() {
      this.$emit("apply-size");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../comm/common.scss";

.modeSwitch {
  display: flex;
  align-items: center;
  padding: 4rpx;
  border-radius: 999rpx;
  background: $pr-theme-soft;

  &-item {
    min-width: 72rpx;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    text-align: center;
    font-size: 24rpx;
    color: $pr-text-muted;
    font-weight: 600;

    &--on {
      background: $pr-theme;
      color: #fff;
    }
  }
}

.tplList {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 12rpx 0 4rpx;
}

.tplItem {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 22rpx;
  border: 2rpx solid $pr-border-color;
  border-radius: 14rpx;
  background: $pr-surface-warm;

  &--active {
    border-color: $pr-theme;
    background: $pr-theme-soft;
    box-shadow: 0 4rpx 12rpx rgba(249, 174, 61, 0.15);
  }

  &-main {
    flex: 1;
    min-width: 0;
  }

  &-name {
    font-size: 28rpx;
    color: $pr-text-main;
    font-weight: 700;
  }

  &-key {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: $pr-text-muted;
  }

  &-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &-action {
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    background: #fff;
    border: 1rpx solid $pr-border-color;
    color: $pr-text-muted;
    font-size: 22rpx;
    font-weight: 600;
    white-space: nowrap;

    &--primary {
      border-color: $pr-theme;
      color: $pr-theme-text;
    }

    &--danger {
      border-color: rgba(221, 82, 77, 0.35);
      color: $pr-danger;
    }
  }
}

.imgPanel {
  padding: 12rpx 0 4rpx;

  &-size {
    margin-bottom: 16rpx;
    padding: 16rpx 18rpx;
    border-radius: 14rpx;
    border: 1rpx solid $pr-border-color;
    background: #fff;
  }

  &-sizeTitle {
    font-size: 24rpx;
    font-weight: 700;
    color: $pr-text-main;
    margin-bottom: 12rpx;
  }

  &-sizeRow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  &-sizeField {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 6rpx 12rpx;
    border-radius: 10rpx;
    background: $pr-surface-warm;
    border: 1rpx solid $pr-border-color;
  }

  &-sizeLabel {
    font-size: 22rpx;
    color: $pr-text-muted;
  }

  &-sizeInput {
    width: 88rpx;
    height: 48rpx;
    text-align: center;
    font-size: 26rpx;
    color: $pr-text-main;
    font-weight: 600;
  }

  &-sizeUnit {
    font-size: 20rpx;
    color: $pr-text-muted;
  }

  &-sizeX {
    color: $pr-text-muted;
    font-size: 24rpx;
  }

  &-sizeHint {
    margin-top: 10rpx;
    font-size: 20rpx;
    color: $pr-text-muted;
    line-height: 1.4;
  }

  &-quick {
    margin-bottom: 16rpx;
  }

  &-quickTitle {
    font-size: 24rpx;
    font-weight: 700;
    color: $pr-text-main;
    margin-bottom: 10rpx;
  }

  &-quickScroll {
    width: 100%;
    white-space: nowrap;
  }

  &-quickList {
    display: inline-flex;
    gap: 12rpx;
    padding-bottom: 4rpx;
  }

  &-quickItem {
    width: 120rpx;
    padding: 10rpx;
    border-radius: 12rpx;
    border: 2rpx solid $pr-border-color;
    background: $pr-surface-warm;
    text-align: center;
    box-sizing: border-box;

    &--on {
      border-color: $pr-theme;
      background: $pr-theme-soft;
    }
  }

  &-quickThumb {
    width: 72rpx;
    height: 72rpx;
    background: #fff;
    border-radius: 8rpx;
  }

  &-quickName {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: $pr-text-sub;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-empty {
    padding: 48rpx 28rpx;
    border: 2rpx dashed $pr-border-dashed;
    border-radius: 14rpx;
    background: $pr-surface-warm;
    text-align: center;
  }

  &-emptyTitle {
    font-size: 28rpx;
    font-weight: 700;
    color: $pr-text-main;
  }

  &-emptyHint {
    margin-top: 12rpx;
    font-size: 22rpx;
    color: $pr-text-muted;
    line-height: 1.5;
  }

  &-preview {
    padding: 16rpx;
    border: 2rpx solid $pr-theme;
    border-radius: 14rpx;
    background: $pr-theme-soft;
  }

  &-img {
    width: 100%;
    height: 280rpx;
    display: block;
    border-radius: 10rpx;
    background: #fff;
  }

  &-meta {
    margin-top: 12rpx;
    font-size: 22rpx;
    color: $pr-text-sub;
    line-height: 1.4;
  }

  &-actions {
    margin-top: 16rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
}
</style>
