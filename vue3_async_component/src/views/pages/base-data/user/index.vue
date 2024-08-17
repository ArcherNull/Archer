<!--
 * @Author: Null
 * @Date: 2022-08-23 18:30:22
 * @Description: 首页
-->

<template>
  <div class="User">
    <!-- 第一种方式 -->
    <FirstTitle title="第一种方式--">
      <template #content>
        <div class="User-one" flex="cross:center">
          <div class="User-one__text">
            {{ store.count }}
          </div>
          <div class="User-one__btn">
            <el-button @click="clickCount()"> 按钮 </el-button>
          </div>
        </div>
      </template>
    </FirstTitle>

    <!-- 第二种方式 -->
    <FirstTitle title="第二种方式--形如mapState">
      <template #content>
        <div class="User-one" flex="cross:center">
          <div class="User-one__text">
            {{ count }}
          </div>
          <div class="User-one__btn">
            <el-button @click="increment()"> 按钮 </el-button>
          </div>
        </div>
      </template>
    </FirstTitle>

    <!-- 第三种方式 -->
    <FirstTitle title="第二种方式--形如mapState">
      <template #content>
        <div class="container">
          <Loading :loading="true"></Loading>
        </div>
      </template>
    </FirstTitle>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from '@/store/element/elButton.js'

export default {
  name: 'User',
  components: {
    // Test: customerAsyncComponent(() =>
    //   import("./components/test.vue")
    // ),
  },
  setup () {
    const store = useCounterStore()

    const clickCount = () => {
      console.log('点击计数')
      store.count++
    }

    return {
      store,
      clickCount
    }
  },
  // 第二种方式
  computed: {
    ...mapState(useCounterStore, ['count'])
  },
  methods: {
    // gives access to this.increment()
    ...mapActions(useCounterStore, ['increment'])
  }
}
</script>

<style lang="scss" scoped>
.User {
  height: 250vh;
  &-one {
    &__text {
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }
    &__btn {
      margin-left: 16px;
    }
  }
}

.container {
  width: 100px;
  height: 100px;
}
</style>
