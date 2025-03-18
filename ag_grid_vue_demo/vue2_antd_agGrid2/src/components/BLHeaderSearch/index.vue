<template>
  <div class="BLHeaderSearch">
    <div class="BLHeaderSearch-query" v-if="showSearchInput">
      <span
        :class="
          Number(headerSearchConfig.displayIndex || defaultDisplayIndex) >
            index || agQueryParams.toggleSearchStatus
            ? ''
            : 'BLHeaderSearch-noGap'
        "
        v-for="(item, index) in headerSearchConfig.main"
        :key="`main-${index}`"
      >
        <span
          v-if="
            Number(headerSearchConfig.displayIndex || defaultDisplayIndex) >
              index || agQueryParams.toggleSearchStatus
          "
        >
          <!-- fuzzySearch:模糊搜索 / dateTimeSearch:时间范围搜索  -->
          <a-input-group
            compact
            class="BLHeaderSearch-query-compact"
            v-if="
              ['fuzzySearch', 'dateTimeSearch'].includes(item.type) &&
              (item.field || item.selectField)
            "
          >
            <a-select
              v-model="agQueryParams.queryParam[item.selectField]"
              allowClear
              :placeholder="item.placeholder || '请选择'"
              class="BLHeaderSearch-group-select"
              v-if="item.options"
            >
              <a-select-option
                v-for="(option, optionInd) in item.options"
                :key="`${index}-${optionInd}`"
                :value="option.value"
                >{{ option.label }}</a-select-option
              >
            </a-select>

            <a-input
              class="BLHeaderSearch-input"
              v-if="item.type === 'fuzzySearch'"
              v-model.trim="agQueryParams.queryParam[item.field]"
              :placeholder="item.placeholder || '模糊搜索'"
              allowClear
            />

            <a-range-picker
              v-if="item.type === 'dateTimeSearch'"
              :show-time="{ format: 'HH:mm:ss' }"
              v-model="agQueryParams.queryParam[item.field]"
              style="width: 330px"
              format="YYYY-MM-DD HH:mm:ss"
              :placeholder="['开始时间', '结束时间']"
              allowClear
            />
            <div
              v-if="item.type === 'dateTimeSearch' && item.isShowQuickSelect"
              class="picker-range-quick-select"
              @click="pickerRangeQuickSelect($event, item.field)"
            >
              <span>今</span>
              <span>昨</span>
              <span>近7天</span>
              <span>近30天</span>
            </div>
          </a-input-group>

          <!-- 城市筛选 -->
          <BLRegion
            v-else-if="['region'].includes(item.type) && item.field"
            :regionType="item.regionType || 'pca'"
            class="BLHeaderSearch-input"
            v-model="agQueryParams.queryParam[item.field]"
            :placeholder="item.placeholder || '请选择'"
            allowClear
          ></BLRegion>

          <!-- 树形下拉框 -->
          <a-tree-select
            style="width: 200px"
            v-else-if="['treeSelect'].includes(item.type) && item.field"
            showSearch
            v-model="agQueryParams.queryParam[item.field]"
            :treeData="item.options"
            :replaceFields="{ value: 'id' }"
            :dropdownStyle="{ maxHeight: '300px', overflow: 'auto' }"
            :placeholder="item.placeholder || '请选择'"
            allowClear
            treeDefaultExpandAll
            :getPopupContainer="(node) => node.parentNode"
            treeNodeFilterProp="title"
          >
          </a-tree-select>

          <!-- 输入框 -->
          <a-input
            class="BLHeaderSearch-input"
            v-else-if="['input'].includes(item.type) && item.field"
            v-model.trim="agQueryParams.queryParam[item.field]"
            :placeholder="item.placeholder || '模糊搜索'"
            allowClear
          />

          <!-- 下拉框 -->
          <a-input-group
            compact
            class="BLHeaderSearch-query-compact"
            v-else-if="['select'].includes(item.type) && item.field"
          >
            <a-select
              v-model="agQueryParams.queryParam[item.field]"
              allowClear
              :placeholder="item.placeholder || '请选择'"
              style="width: 150px"
              class="BLHeaderSearch-group-select"
              v-if="item.options && item.options.length"
            >
              <a-select-option
                v-for="(option, optionInd) in item.options"
                :key="`${index}-${optionInd}`"
                :value="option.value"
                >{{ option.label }}</a-select-option
              >
            </a-select>
          </a-input-group>

          <!-- 复选框 -->
          <a-checkbox-group
            v-else-if="['checkboxGroup'].includes(item.type) && item.field"
            v-model="agQueryParams.queryParam[item.field]"
          >
            <a-checkbox
              v-for="(cItem, cIndex) in item.options"
              :key="cIndex"
              :value="cItem.value"
              :disabled="cItem.disabled"
            >
              <span :style="{ color: cItem.color }">
                {{ cItem.label }}
              </span>
            </a-checkbox>
          </a-checkbox-group>
        </span>
      </span>

      <span class="BLHeaderSearch-btn">
        <BLButton
          type="primary"
          :disabled="!agQueryParams.initTableSuccess"
          :loading="agQueryParams.getDataLoading"
          @click="searchQuery"
          icon="search"
          >查询</BLButton
        >
        <BLButton
          type="primary"
          @click="searchReset"
          icon="reload"
          style="margin-left: 8px"
          >重置</BLButton
        >
        <a
          @click="
            agQueryParams.toggleSearchStatus = !agQueryParams.toggleSearchStatus
          "
          style="margin-left: 8px"
          v-if="showMoreList"
        >
          {{ agQueryParams.toggleSearchStatus ? "收起" : "展开" }}
          <a-icon :type="agQueryParams.toggleSearchStatus ? 'up' : 'down'" />
        </a>
      </span>
    </div>
  </div>
</template>

<script>
import { isObject, isEmpty, isArray } from "lodash";
import moment from "moment";

export default {
  name: "BLHeaderSearch",
  props: {
    // 搜索配置列表
    headerSearchConfig: {
      type: Object,
      default() {
        return {
          main: [],
          more: [],
        };
      },
    },
    // 传参值
    agQueryParams: {
      type: Object,
      default() {
        return {
          toggleSearchStatus: false,
          queryParam: {},
        };
      },
    },
    // 查询参数
    getList: {
      type: Function,
      default: () => {},
    },
    // 重置函数
    searchReset: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      // 默认前三
      defaultDisplayIndex: 1,
      openAdvancedSearch: false,
    };
  },
  computed: {
    showSearchInput() {
      const { main } = this.headerSearchConfig;
      const { queryParam } = this.agQueryParams;
      return (
        main &&
        main.length &&
        queryParam &&
        isObject(queryParam) &&
        !isEmpty(queryParam)
      );
    },

    showMoreList() {
      const { main, displayIndex = this.defaultDisplayIndex } =
        this.headerSearchConfig;
      return Number(displayIndex) < main.length;
    },
  },
  methods: {
    advancedSearchToggle() {
      this.openAdvancedSearch = !this.openAdvancedSearch;
    },
    saveParams(data) {
      console.log(data);
      this.agQueryParams.queryParam = {
        ...this.agQueryParams.queryParam,
        ...data,
      };
      console.log(this.agQueryParams.queryParam);
      this.searchQuery();
    },
    pickerRangeQuickSelect(event, fieid) {
      var { innerText } = event.target;
      var time = [];
      let dayArr = { 昨: 1, 近7天: 7, 近30天: 30 };
      switch (innerText) {
        case "今":
          time = [moment().startOf("day"), moment()];
          break;
        case "昨":
        case "近7天":
        case "近30天":
          time = [
            moment().startOf("day").subtract(dayArr[innerText], "days"),
            moment(),
          ];
          break;
      }
      if (time) {
        this.agQueryParams.queryParam[fieid] = time;
      }
    },
    // 格式化时间
    formatDateStr(dateStr) {
      return moment(dateStr).format("YYYY-MM-DD HH:mm:ss");
    },

    dealParams() {
      const {
        searchVal,
        inField,
        isRealField,
        isKeyType,
        isSearchType,
        commonTime,
        dateTime,
        ...resetObj
      } = this.agQueryParams.queryParam;
      const obj = {
        ...resetObj,
      };
      console.log(`hearderSearchNew`);
      console.log(this.agQueryParams);
      console.log("commonTime=====>", commonTime);
      if (commonTime) {
        if (dateTime && isArray(dateTime) && dateTime.length) {
          const commonTimeObj = commonTime.split(",");
          console.log("commonTimeObj=====>", commonTimeObj);

          const dateTimeStr = dateTime.map((ele) => this.formatDateStr(ele));
          console.log("dateTimeStr", dateTimeStr);

          // 真实字段&分割
          if (
            isRealField &&
            commonTimeObj.length == 2 &&
            dateTimeStr.length == 2
          ) {
            obj[commonTimeObj[0]] = dateTimeStr[0];
            obj[commonTimeObj[1]] = dateTimeStr[1];
            // 用于多时间条件
          } else if (
            isRealField &&
            commonTimeObj.length == 3 &&
            dateTimeStr.length == 2
          ) {
            const [startTime, endTime, timeFieldRules] = commonTimeObj;
            obj[startTime] = dateTimeStr[0];
            obj[endTime] = dateTimeStr[1];

            const timeFieldRulesArr = timeFieldRules.split("=");
            if (timeFieldRulesArr && timeFieldRulesArr.length) {
              const [timeField, timeValue] = timeFieldRulesArr;
              obj[timeField] = timeValue;
            }
          } else {
            obj.commonTime = `${commonTime}|${dateTimeStr.join(",")}`;
          }
        }
      }
      if (searchVal) {
        if (inField) {
          if (isRealField) {
            obj[inField] = searchVal;
          } else if (isKeyType) {
            obj["keyType"] = inField;
            obj["keyWord"] = searchVal;
          } else {
            obj.inField = `${inField}|${searchVal}`;
          }
          if (isSearchType) {
            obj["serchType"] = inField;
            obj["keyWord"] = searchVal;
            delete obj["keyType"];
          }
          obj.commonTime = undefined;
        } else {
          obj.likeField = `${searchVal}`;
        }
      }

      return obj;
    },
    // 转换数字
    convertNumber(str) {
      const val = Number(str);
      return isNaN(val) ? 0 : val;
    },
    // 搜索
    searchQuery(pageNum) {
      console.log("搜索按钮", this.agQueryParams.queryParam);
      if (this.getList && typeof this.getList === "function") {
        const { isChangeQueryCondition = false, searchRequestCount } =
          this.agQueryParams;
        const params = this.dealParams();
        let cpageNum = 1;
        const pNVal = this.convertNumber(pageNum);

        if (pNVal > 1) {
          cpageNum =
            isChangeQueryCondition && searchRequestCount != 0 ? 1 : pNVal;
        }
        // 重置分页
        this.agQueryParams.pageNum = cpageNum;
        this.getList(params);
        this.agQueryParams.isChangeQueryCondition = false;
        this.agQueryParams.searchRequestCount++;
      } else {
        this.$message.warning("接口函数错误，请联系管理员");
      }
    },
  },
};
</script>

<style lang="less" scoped>
.BLHeaderSearch {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  &-query {
    gap: 10px;
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    width: unset;

    &-compact {
      display: inline-block;
      width: unset;
    }
  }

  &-noGap {
    margin: -5px;
  }

  &-group-select {
    width: 110px;
  }

  a-input-group {
    display: inline-block;
  }

  &-input {
    width: 220px;
  }

  &-select {
    width: 160px;
  }

  &-range-picker {
    width: 250px;
  }
}
</style>
