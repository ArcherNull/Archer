import type { Recordable, UserInfo, UserInfoRes } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const loginLoading = ref(false);

async function authLogin(){
	loginLoading.value = true
	const sleep = ()=>{
		return new Promise((resolve)=>{
			setTimeout(()=>{
				resolve(true)
			}, 2500)
		})
	}
	
	await sleep()
	loginLoading.value = false
}

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    loginLoading,
  };
});
