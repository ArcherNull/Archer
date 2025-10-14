import request from '@/common/request/index.js'

export const testApi1 = (data) => request.get('/api/test1', data)

export const testApi2 = (data) => request.post('/user/test2', data)

export const testApi3 = (data) => request.put('/public/test3', data)

export const testApi4 = (data) => request.delete('/other/test4', data)

export const testApi5 = (data) => request.uploadFile('/other/test5', data, {
	'Content-Type': 'multipart/form-data',
	Accept: 'application/json',
})

export const testApi6 = (data) => request.get('https://www.baidu.com/', data)