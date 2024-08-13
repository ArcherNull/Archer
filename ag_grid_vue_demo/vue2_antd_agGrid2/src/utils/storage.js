/*
 * @Author: junsong Chen
 * @Date: 2024-04-04 16:07:33
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-04-04 16:22:29
 * @Description: localStorage
 */
import { SYSTEM_S_EN_NAME, VERSION } from '@/setting'

// 设置缓存键值
const setFiaStorageKey = (name, prefixName) =>
	prefixName ? `${prefixName}-${name}` : `${SYSTEM_S_EN_NAME}-${VERSION}-${name}`;

// 缓存默认配置
const storageDefConfig = {
	expireTime: 24 * 60 * 60 * 1000, // ms
};

// 缓存键值管理
const storageKeyObj = {
	// token 键值
	token: {
		key: "token",
		...storageDefConfig
	},
	// 用户信息
	userInfo: {
		key: "userInfo",
		...storageDefConfig
	}
};

// 获取存储的键值
export const getStorageKey = key => {
	const keyArr = Object.keys(storageKeyObj);
	if (key && keyArr.includes(key)) {
		const keyStr = storageKeyObj[key].key;
		return setFiaStorageKey(keyStr);
	} else {
		return setFiaStorageKey("comm");
	}
};

// 设置缓存
export const setStorage = (key, value) => {
	if (key) {
		const sKey = getStorageKey(key)
		window.localStorage.setItem(sKey, value);
	} else {
		console.error("键值不能为空");
	}
};

// 获取缓存值
export const getStorage = (key) => {
	if (key) {
		const sKey = getStorageKey(key)
		return window.localStorage.getItem(sKey);
	} else {
		console.error("键值不能为空");
	}
};

// 移除缓存值
export const removeStorage = (key) => {
	if (key) {
		const sKey = getStorageKey(key)
		window.localStorage.removeItem(sKey);
	} else {
		console.error("键值不能为空");
	}
};

// 清空缓存值
export const clearStorage = () => {
	window.localStorage.clear();
};