/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-10-10 11:11:23
 * @LastEditTime: 2025-06-13 10:42:13
 * @Description:
 */
import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import { getDicts } from '#/api/system/dict/data';
import { isNotEmptyArr } from '#/comm/utils/index';
import { isString, isEmpty, isArray } from 'lodash-es';

export const useDictStore = defineStore('dict', {
  actions: {
    /**
     * @description: 解析单个字典数据
     * @param {*} p
     * @return {*}
     */
    parseDictItem(p) {
      return {
        label: p.dictLabel,
        value: p.dictValue,
        elTagType: p.listClass,
        elTagClass: p.cssClass,
      };
    },

    /**
     * @description: 新获取字典列表
     * @param {string} codes 字典编码，英文逗号分割
     * @return {*}
     */
    async getDictsByCodes(codes, code) {
      const nObj = {};
      const existObj = {};
      if (!isEmpty(codes)) {
        let codesArr = [];

        if (isString(codes)) {
          codesArr = codes.split(',')?.filter(Boolean);
        }

        if (isArray(codes)) {
          codesArr = codes;
        }

        const proArr = [];
        const unCodeArr = [];
        const rdictObj = toRaw(this.dictObj);
        codesArr.forEach((ele) => {
          const oldList = rdictObj[ele];
          if (oldList && isNotEmptyArr(oldList)) {
            existObj[ele] = oldList;
          } else {
            proArr.push(getDicts(ele));
            unCodeArr.push(ele);
          }
        });

        if (isNotEmptyArr(unCodeArr)) {
          const res = await Promise.all(proArr);
          unCodeArr.forEach((ele, ind) => {
            const dList = res[ind]?.data || [];
            let nList = dList.map((p) => this.parseDictItem(p));
            nObj[ele] = nList;
            this.dictObj[ele] = nList;
          });
        }
      }

      const dNObj: ObjectType = Object.assign(existObj, nObj);
      return code ? (dNObj[code] || []) : dNObj;
    },
    // 重置store
    reset() {
      this.$reset();
    },
  },
  state: () => ({
    dictObj: {},
  }),
});
