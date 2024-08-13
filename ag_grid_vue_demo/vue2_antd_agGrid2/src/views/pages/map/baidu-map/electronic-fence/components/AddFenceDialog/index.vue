<template>
  <BLModal
    :title="`${editId ? '编辑' : '新增'}电子围栏`"
    :dialogStyle="{
      top: '50px',
      paddingBottom: '0px',
    }"
    :bodyStyle="{
      padding: '10px 16px',
      maxHeight: 'calc(100vh - 180px)',
      overflowY: 'scroll',
    }"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="AddFenceDialog-content">
      <BMapFence ref="BMapFenceRef" @postMessage="postMessage"></BMapFence>

      <a-card
        class="AddFenceDialog-content-form"
        v-if="addFenceType"
        :bodyStyle="{ padding: '6px 16px' }"
      >
        <h3>新增围栏：{{ addFenceType === "circle" ? "圆" : "多边形" }}</h3>
        <a-form :form="form" name="AddFenceForm" layout="vertical">
          <a-form-item label="围栏名称">
            <a-input
              v-decorator.trim="[
                'name',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入围栏名称',
                    },
                  ],
                },
              ]"
              placeholder="请输入围栏名称"
            />
          </a-form-item>

          <a-form-item label="类别">
            <a-select
              placeholder="请选择类别"
              allowClear
              v-decorator.trim="[
                'category',
                {
                  rules: [
                    {
                      required: true,
                      message: '请选择类别!',
                    },
                  ],
                },
              ]"
            >
              <a-select-option
                v-for="(item, index) in dicItems.fence_category"
                :value="item.dicValue"
                :key="index"
              >
                {{ item.dicLabel }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="半径" v-if="addFenceType === 'circle'">
            <div class="flex-censta">
              <a-input-number
                :min="0"
                style="width: calc(100% - 30px)"
                placeholder="请输入"
                v-decorator.trim="[
                  'radius',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入半径',
                      },
                    ],
                  },
                ]"
                @change="radiusChange"
              />
              <div style="margin-left: 6px; width: 30px">m</div>
            </div>
          </a-form-item>

          <a-form-item label="面积">
            <div class="flex-censta">
              <a-input-number
                :min="0"
                style="width: calc(100% - 30px)"
                placeholder="请输入"
                disabled
                v-decorator.trim="[
                  'size',
                  {
                    rules: [
                      {
                        required: false,
                        message: '请输入面积',
                      },
                    ],
                  },
                ]"
              />
              <div style="margin-left: 6px; width: 30px">km²</div>
            </div>
          </a-form-item>

          <a-form-item label="经度">
            <a-input-number
              :min="0"
              disabled
              placeholder="请输入经度"
              style="width: 100%"
              v-decorator.trim="[
                'longitude',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入经度',
                    },
                  ],
                },
              ]"
            />
          </a-form-item>

          <a-form-item label="纬度">
            <a-input-number
              :min="0"
              disabled
              style="width: 100%"
              placeholder="请输入纬度"
              v-decorator.trim="[
                'latitude',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入纬度',
                    },
                  ],
                },
              ]"
            />
          </a-form-item>

          <a-form-item label="详细地址">
            <a-auto-complete
              v-decorator.trim="[
                'address',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入详细地址',
                    },
                  ],
                },
              ]"
              :data-source="addressList"
              placeholder="请输入详细地址"
              @change="changeAddress"
              @select="selectAddress"
            >
              <template slot="dataSource">
                <a-select-option
                  v-for="addressItem in addressList"
                  :key="addressItem.addressStr"
                  >{{ addressItem.addressStr }}</a-select-option
                >
              </template>
            </a-auto-complete>
          </a-form-item>

          <a-form-item label="备注">
            <a-textarea
              placeholder="请输入备注"
              allowClear
              :maxLength="200"
              :auto-size="{ minRows: 3, maxRows: 5 }"
              v-decorator.trim="[
                'remark',
                {
                  rules: [
                    {
                      required: false,
                      message: '请输入备注',
                    },
                  ],
                },
              ]"
            />
          </a-form-item>

          <a-form-item>
            <div class="flex-cenend formBtn">
              <BLButton @click="resetForm()">重置</BLButton>
              <BLButton
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit()"
                >保存</BLButton
              >
            </div>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <div slot="footer">
      <BLButton @click="handleCancel">取消</BLButton>
    </div>
  </BLModal>
</template>

<script>
import BMapFence from "@/components/BLMap/BMapFence.vue";
import {
  getMultiDictItems,
  addElectronicFence,
  editElectronicFence,
} from "@/api/index.js";
import { debounce } from "lodash";

export default {
  name: "AddFenceDialog",
  components: {
    BMapFence,
  },
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false,
    },
    rowInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      addFenceType: "",

      polygonPath: [],

      submitLoading: false,
      isLoadDicItems: false,
      addAddressOptions: [],

      // 字典数据
      dicItems: {
        fence_category: [],
      },
      // 编辑id
      editId: "",

      // 1 点， 2 区域
      type: 1,
      iframeKey: null,
      iframeSrc: "http://tms-uat.dekuncn.com:5013/#/dkwlMap",

      addressList: [],
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initModal();
      } else {
        this.addFenceType = "";
        this.$refs.BMapFenceRef.changeFenceParams({
          addFenceType: undefined,
          circlePath: {
            center: {
              lng: undefined,
              lat: undefined,
            },
            radius: undefined,
            label: undefined,
          },
          polygonPath: {
            path: [],
            center: {
              lng: undefined,
              lat: undefined,
            },
            label: undefined,
          },
        });
        this.editId = "";
        this.form.resetFields();
      }
    },
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "AddFenceDialog" });
  },
  methods: {
    // 初始化modal
    initModal() {
      console.log("初始化modal");
      this.getDicItems();
      if (this.rowInfo && this.rowInfo.id) {
        this.echoForm();
      }
    },
    // 发送消息
    postMessage(data) {
      console.log("发送消息123", data);
      const { addFenceType, circlePath, polygonPath } = data;
      this.addFenceType = addFenceType;
      if (addFenceType === "circle") {
        this.form.setFieldsValue({
          longitude: circlePath.center.lng,
          latitude: circlePath.center.lat,
          radius: circlePath.radius,
          size: circlePath.area,
          address: circlePath.label,
        });
      } else if (addFenceType === "polygon") {
        const newPolygonPath = polygonPath.path.map((ele) => {
          return {
            lon: ele.lng,
            lat: ele.lat,
          };
        });
        this.form.setFieldsValue({
          longitude: polygonPath.center.lng,
          latitude: polygonPath.center.lat,
          size: polygonPath.area,
          address: polygonPath.label,
        });
        this.polygonPath = newPolygonPath;
      }
    },
    // 获取字段数据
    async getDicItems() {
      const dictObj = {
        1: [],
      };
      const ids = Object.keys(dictObj).join(",");
      const res = await getMultiDictItems(ids);
      const resData = res?.data || [];
      console.log("resData1231231", resData);
      resData.forEach((ele) => {
        if (ele.dicBindId) {
          dictObj[ele.dicBindId].push(ele);
        }
      });
      this.dicItems.fence_category = dictObj["1"];
    },

    // 回显表单
    echoForm() {
      console.log("回显表单", this.rowInfo);
      this.$nextTick(() => {
        const rowInfo = this.rowInfo;
        this.editId = rowInfo.id;
        this.type = rowInfo.type;
        this.addFenceType = rowInfo.type == 1 ? "circle" : "polygon";

        const { longitude, latitude } = rowInfo;
        const lng = Number(longitude);
        const lat = Number(latitude);

        this.$nextTick(() => {
          this.form.setFieldsValue({
            name: rowInfo.name,
            category: String(rowInfo.category),
            radius: rowInfo.radius,
            size: rowInfo.size,
            longitude: lng,
            latitude: lat,
            address: rowInfo.address,
            remark: rowInfo.remark,
            type: rowInfo.type,
          });

          this.$nextTick(() => {
            let nPath = [];
            if (rowInfo.dispatchAreaCoordinates) {
              const cPath = JSON.parse(rowInfo.dispatchAreaCoordinates);
              if (Array.isArray(cPath) && cPath.length) {
                nPath = cPath.map((ele) => {
                  return {
                    lng: ele.lon,
                    ...ele,
                  };
                });
              }
            }

            this.$refs.BMapFenceRef.changeFenceParams({
              addFenceType: this.addFenceType,
              circlePath: {
                center: {
                  lng,
                  lat,
                },
                radius: rowInfo.radius,
                label: rowInfo.address,
              },
              polygonPath: {
                path: nPath,
                center: {
                  lng,
                  lat,
                },
                label: rowInfo.address,
              },
            });
          });
        });
      });
    },

    // 取消
    handleCancel() {
      this.$emit("update:visible", false);
    },

    // 半径
    radiusChange(ele) {
      console.log("半径=====》", ele);
      this.$nextTick(() => {
        this.postMessageToParent();
      });
    },

    // 更改详细地址
    changeAddress: debounce(async function (val) {
      console.log("更改详细地址", val);
      const addressList = await this.$refs.BMapFenceRef.getAddressListByKeyword(
        val
      );
      console.log("addressList123123123123", addressList);

      const cAddressList = [];
      const uniqueAddressList = [];
      addressList.forEach((ele) => {
        const addressStr = ele.address + ele.title;
        if (!cAddressList.includes(addressStr)) {
          cAddressList.push(addressStr);
          ele.addressStr = addressStr;
          uniqueAddressList.push(ele);
        }
      });

      this.addressList = uniqueAddressList;
      setTimeout(() => {
        this.postMessageToParent();
      }, 500);
    }, 350),
    // 选中
    selectAddress(ele) {
      console.log("选中=====>", ele);
      this.form.setFieldsValue({
        address: ele,
      });
    },

    // 给地图组件传递消息
    postMessageToParent() {
      if (this.addFenceType) {
        const { radius, address, lon, lat } = this.form.getFieldsValue([
          "radius",
          "address",
        ]);
        const submitData = {
          addFenceType: this.addFenceType,
          circlePath: {
            center: {
              lng: lon,
              lat: lat,
            },
            radius: undefined,
            label: address,
          },
          polygonPath: {
            path: [],
            center: {
              lng: lon,
              lat: lat,
            },
            label: address,
          },
        };
        let findAddressitem = null;
        if (this.addressList && this.addressList.length) {
          findAddressitem = this.addressList.find(
            (ele) => ele.addressStr === address
          );
        }
        console.log("findAddressitem123123123", findAddressitem);

        // 如果是圆形
        if (this.addFenceType === "circle") {
          if (findAddressitem && findAddressitem.point) {
            submitData.circlePath.center.lng = findAddressitem.point.lng;
            submitData.circlePath.center.lat = findAddressitem.point.lat;
          }
          submitData.circlePath.radius = radius;
          submitData.circlePath.label = address;
        } else if (this.addFenceType === "polygon") {
          submitData.polygonPath.label = address;
        }
        this.$refs.BMapFenceRef.changeFenceParams(submitData);
      }
    },

    // 提交
    handleSubmit() {
      console.log("表单提交");
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("表单提交数据", values);
          const submitData = {
            type: this.addFenceType === "polygon" ? 2 : 1,
            ...values,
          };

          if (this.addFenceType === "polygon") {
            submitData.dispatchAreaCoordinates = JSON.stringify(
              this.polygonPath
            );
          }

          if (this.editId) {
            submitData.id = this.editId;
            this.editFenceFun(submitData);
          } else {
            this.addFenceFun(submitData);
          }
        }
      });
    },

    // 重置表单
    resetForm() {
      this.form.resetFields();
    },

    // 新增电子围栏
    addFenceFun(submitData) {
      this.submitLoading = true;
      addElectronicFence(submitData)
        .then((res) => {
          if (res.code === 200) {
            this.$message.success("新增电子围栏成功");
            this.handleCancel();
            this.$emit("success");
          } else {
            this.$message.error(res.message || "请求错误");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },

    // 新增电子围栏
    editFenceFun(submitData) {
      this.submitLoading = true;
      editElectronicFence(submitData)
        .then((res) => {
          if (res.code === 200) {
            this.$message.success("编辑电子围栏成功");
            this.handleCancel();
            this.$emit("success");
          } else {
            this.$message.error(res.message || "请求错误");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.AddFenceDialog-content {
  position: relative;

  &-form {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    z-index: 100;
    width: 300px;
    height: 500px;
    overflow-y: scroll;
  }
}

.formBtn {
  gap: 10px;
}
</style>
