<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-14 16:47:51
 * @LastEditTime: 2025-06-02 16:57:06
 * @Description: 
-->
<script setup lang="ts" name="PersonalCenter">
import type { UploadFile, UploadProps } from 'element-plus';

import { defineExpose, reactive, ref, toRaw } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { uploadFile } from '#/api/public/index';
import { isPhoneNumber } from '#/comm/formValidator/index';
import { generateAUrl } from '#/comm/hooks/useDownload';
import {
  downLoadFile,
  fileToBase64,
  getValByTreeData,
  isHttp,
  isNotEmptyObj,
} from '#/comm/utils/index';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';

const [Modal, modalApi] = useVbenModal({
  onConfirm: () => {
    handleSubmit();
  },
});
const userStore = useUserStore();
const authStore = useAuthStore();

const modalLoading = ref(false);
const modalConfirmLoading = ref(false);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const defaptOptions = ref([]);
const ruleFormRef = ref<any>();
const ruleForm = reactive<any>({
  allotmentArea: '',
  avatar: '',
  avatarList: [],
  email: '',
  phonenumber: '',
  orgGroupIdArr: [],
  nickName: '',
  userId: '',
});

const rules = reactive<any>({
  userName: [
    {
      message: '请输入账号',
      required: true,
      trigger: 'blur',
    },
  ],
});

const sexOptions = [
  {
    label: $t('male'),
    value: 0
  },
  {
    label: $t('female'),
    value: 1
  },
  {
    label: $t('unKnown'),
    value: 2
  }
]

function echoForm() {
  const { userId, email, sex, phonenumber, nickName, userName, avatar } = userStore.userInfo || {}

  const avatarUrl = avatar || preferences.app.defaultAvatar;
  const avatarList = [
    {
      name: $t('header.personalCenterDialog.avatar'),
      url: avatarUrl,
    },
  ];


  ruleForm.email = email;
  ruleForm.sex = Number(sex);
  ruleForm.userId = userId;
  ruleForm.avatarList = avatarList;
  ruleForm.avatar = avatar;
  ruleForm.phonenumber = phonenumber;
  ruleForm.nickName = nickName;
  ruleForm.userName = userName;

  return userId;
}

async function getDepartmentTreeFun() {
  const res = await Promise.resolve({
    data: []
  });
  const treeData = res?.data || [];
  defaptOptions.value = treeData;
  setTimeout(() => {
    const orgGroupId = userStore.userInfo?.orgGroupId;
    orgGroupId && getDepaList(orgGroupId);
  });
}

// 获取部门列表
async function getDepaList(orgGroupId?: any) {
  if (orgGroupId) {
    const { matchArr } = getValByTreeData(defaptOptions.value, {
      key: 'groupId',
      type: 'endsWith',
      value: orgGroupId,
    });
    
    if (matchArr?.length === 1) {
      const firstArr = matchArr[0];
      ruleForm.orgGroupIdArr = firstArr?.split('-');
    }
  }
}

async function handleOpen() {
  const userId = echoForm();
  if (userId) {
    modalApi.open();
    modalLoading.value = true;
    await getDepartmentTreeFun();
    modalLoading.value = false;
  } else {
    ElMessage.warning('用户id缺失，请先登录');
  }
}

const handleAvatarChange: UploadProps['onChange'] = async (uploadFile) => {
  const avatarUrl = await fileToBase64(uploadFile.raw!);
  ruleForm.avatarList = [
    {
      ...uploadFile,
      url: avatarUrl,
    },
  ];
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('头像图片大小不能超过5M!');
    return false;
  }
  return true;
};

// 文件上传
const uploadImgFun = async () => {
  const { avatarList } = ruleForm;
  const imgData = new FormData();
  imgData.append('folder', 'bi');
  const imgUrlArr: string[] = [];
  avatarList.forEach((ele: UploadFile) => {
    if (ele?.raw instanceof File) {
      imgData.append('files', ele.raw);
    } else {
      ele.url && imgUrlArr.push(ele.url);
    }
  });
  const arr = imgData.getAll('files');
  if (arr?.length > 0) {
    const res = await uploadFile(imgData);
    const resData = res?.data || {};
    if (isNotEmptyObj(resData)) {
      Object.values(resData).forEach((item) => {
        item && imgUrlArr.push(generateAUrl(item));
      });
    }
  }

  return imgUrlArr;
};

function previewImg(file: UploadFile) {
  dialogImageUrl.value = file.url!;
  dialogVisible.value = true;
}

function downloadImg(item: UploadFile) {
  const url = item?.url;
  url && downLoadFile(url);
}

function deleteImg(item: UploadFile, index: number) {
  ruleForm.avatarList.splice(index, 1);
}

function editMine(data: any): Promise<{ code: number, data: unknown }> {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data,
      msg: '操作成功'
    })
  })
}

async function handleSubmit() {
  if (ruleForm.avatarList.length > 0) {
    const imgArr = await uploadImgFun();
    ruleForm.avatar = imgArr[0];
    ruleFormRef.value.validate(async (isValid: boolean) => {
      if (isValid) {
        try {
          modalConfirmLoading.value = true;
          const submitData = {
            ...toRaw(ruleForm),
          };

          const res = await editMine(submitData);
          if (res?.code === 200) {
            ElMessage.success('编辑成功');
            await authStore.fetchUserInfo();
            modalApi.close();
          } else {
            ElMessage.error(res?.msg || '编辑失败');
          }
        } finally {
          modalConfirmLoading.value = false;
        }
      }
    });
  } else {
    ElMessage.warning('请先上传头像');
  }
}

defineExpose({
  handleOpen,
});
</script>

<template>
  <Modal :confirm-loading="modalConfirmLoading" :loading="modalLoading" :title="$t('header.personalCenter')"
    class="w-[500px]">
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" accept=".jpg,.jpeg,.png,.gif" label-width="120px"
      status-icon>
      <el-form-item :rules="[
        {
          message: '请上传头像',
          required: true,
          trigger: 'change',
          type: 'array',
        },
      ]" :label="$t('header.personalCenterDialog.avatar')" prop="avatarList">
        <el-upload v-model:file-list="ruleForm.avatarList" :auto-upload="false" :before-upload="beforeAvatarUpload"
          :limit="1" :on-change="handleAvatarChange" :show-file-list="false" action="#" class="avatar-uploader">
          <div v-if="ruleForm.avatarList.length > 0">
            <div v-for="(item, index) in ruleForm.avatarList" :key="index">
              <div class="uploadImgItem">
                <img :alt="item.name" :src="item.url" />

                <!-- 操作按钮 -->
                <span class="uploadImgItem-btn" @click.stop="">
                  <span @click="previewImg(item)">
                    <el-icon>
                      <zoom-in />
                    </el-icon>
                  </span>
                  <span v-if="isHttp(item.url)" @click="downloadImg(item, index)">
                    <el-icon>
                      <Download />
                    </el-icon>
                  </span>

                  <span @click="deleteImg(item, index)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item :label="$t('header.personalCenterDialog.userName')" prop="userName">
        <el-input clearable disabled
          :placeholder="$t('header.pleaseInput', { slot: $t('header.personalCenterDialog.userName') })"
          v-model.trim="ruleForm.userName" />
      </el-form-item>

      <el-form-item :label="$t('header.personalCenterDialog.nickName')" prop="nickName">
        <el-input clearable
          :placeholder="$t('header.pleaseInput', { slot: $t('header.personalCenterDialog.nickName') })"
          v-model.trim="ruleForm.nickName" />
      </el-form-item>

      <el-form-item :label="$t('header.personalCenterDialog.email')" prop="email">
        <el-input clearable :placeholder="$t('header.pleaseInput', { slot: $t('header.personalCenterDialog.email') })"
          v-model.trim="ruleForm.email" />
      </el-form-item>

      <el-form-item :label="$t('header.personalCenterDialog.sex')" prop="sex">
        <el-select v-model.trim="ruleForm.sex"
          :placeholder="$t('header.pleaseSelect', { slot: $t('header.personalCenterDialog.sex') })">
          <el-option v-for="item in sexOptions" :key="item.value" :label="item.label" :value="item.value" filterable
            clearable />
        </el-select>
      </el-form-item>

      <el-form-item :rules="[
        {
          max: 11,
          trigger: 'blur',
          validator: isPhoneNumber,
        },
      ]" :label="$t('header.personalCenterDialog.phonenumber')" prop="phonenumber" required>
        <el-input :maxlength="11" clearable
          :placeholder="$t('header.pleaseInput', { slot: $t('header.personalCenterDialog.phonenumber') })"
          v-model.trim="ruleForm.phonenumber" />
      </el-form-item>

      <el-form-item :label="$t('header.personalCenterDialog.department')" prop="orgGroupIdArr">
        <el-cascader v-model="ruleForm.orgGroupIdArr" :options="defaptOptions" :props="{
          label: 'fullName',
          value: 'groupId',
          checkStrictly: true,
        }" clearable filterable
          :placeholder="$t('header.pleaseInput', { slot: $t('header.personalCenterDialog.department') })"
          style="width: 100%" />
      </el-form-item>
    </el-form>

    <el-dialog v-model="dialogVisible" append-to-body title="预览" width="60%">
      <img :src="dialogImageUrl" alt="Preview Image" class="m-auto h-[60vh] max-w-[100%]" />
    </el-dialog>
  </Modal>
</template>
