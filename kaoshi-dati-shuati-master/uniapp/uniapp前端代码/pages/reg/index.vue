<template>
	<view>
		<form @submit="doReg">
			<view class="reg-li">
				<view class="reg-li-left">姓名</view>
				<input class="reg-li-input" value="" name="name" placeholder="请输入您的用户名(必填)" placeholder-class="reg-li-input-pl" />
			</view>
			<view class="reg-li">
				<view class="reg-li-left">手机号</view>
				<input @input="changePhone" class="reg-li-input" type="number" value="" name="phone" placeholder="请输入您的手机号(必填)" placeholder-class="reg-li-input-pl" />
			</view>
			<view class="reg-li">
				<view class="reg-li-left">所属支部</view>
				<picker style="width: 70%;float: left;" :range="list" @change="partyChange">
					<view style="width: 100%;">
						<input style="width: 100%;" class="reg-li-input" disabled v-model="list[index]" name="party_z" placeholder="请选择所属支部(必填)" placeholder-class="reg-li-input-pl" />
					</view>
				</picker>
				
			</view>
			<view class="reg-li">
				<view class="reg-li-left">党内职务</view>
				<picker style="width: 70%;float: left;" :range="list1" @change="partyChange1">
					<view style="width: 100%;">
						<input class="reg-li-input" disabled v-model="list1[index1]" name="party_w" placeholder="请选择您的党内职务(必填)" placeholder-class="reg-li-input-pl" />
					</view>
				</picker>
			</view>
			<view class="reg-li">
				<view class="reg-li-left">登录密码</view>
				<input class="reg-li-input" type="password" value="" name="login_pass" placeholder="请输入您的密码(必填)" placeholder-class="reg-li-input-pl" />
			</view>
			<view class="reg-li">
				<view class="reg-li-left">确认密码</view>
				<input class="reg-li-input" type="password" value="" name="login_pass1" placeholder="请确认您的密码(必填)" placeholder-class="reg-li-input-pl" />
			</view>
			
			<button class="reg-button" form-type="submit">立即注册</button>
		</form>

	</view>
</template>

<script>
	import request from '@/util/request.js';
	const app = getApp();
	export default {
		data() {
			return {
				list:['党支部1','党支部2'],//党支部
				index:-1,//党支部的键值
				list1:['党职务1','党职务2'],//党内职务
				index1:-1,//党内职务的键值
				codeText:'获取验证码',
				configInfo:[],//配置信息
				phone:'',//手机号
				mac:'',//唯一识别码
			}
		},
		onLoad(){
			var configInfo = app.globalData.configInfo;
			this.configInfo = configInfo;
			this.list = configInfo.partylist.partybranch.value;
			this.list1 = configInfo.partylist.partypost.value;
		},
		methods: {
			changePhone(e){ //输入手机号
				this.phone = e.detail.value;
			},
			getCode(){ //获取验证码
				if(this.phone.length!=11){
					uni.showToast({
						title:'请输入正确手机号',
						icon:'none'
					})
					
					return ;
				}
				this.codeText = '重新获取';
				
				var url = app.globalData.site_url+'/appapi/?s=Login.GetCode';
				var data = {mobile:this.phone};
				request.requestApi(url,data).then(res=>{
					if(res.data.code==0){
						this.mac = res.data.info[0].mac
					}
					uni.showToast({
						title:res.data.msg,
						icon:'none'
					})

				})
			},
			partyChange(e){ //党支部改变
				console.log(e.detail);
				this.index = e.detail.value;
			},
			partyChange1(e){//党内职务改变
				this.index1 = e.detail.value;
			},
			doReg(e){ //点击注册
				var user_login = e.detail.value.phone;
				var user_pass = e.detail.value.login_pass;
				var user_pass2 = e.detail.value.login_pass1;
				var code = e.detail.value.code;
				var mac = this.mac;
				var user_nickname = e.detail.value.name;
				var partybranch = this.configInfo.partylist.partybranch.key[this.index];
				var partypost = this.configInfo.partylist.partypost.key[this.index1];

				if(user_nickname==''){
					uni.showToast({
						title:'请填写姓名',
						icon:'none'
					})
					return ;
				}
				
				if(user_login==''){
					uni.showToast({
						title:'请填写手机号',
						icon:'none'
					})
					return ;
				}
				if(!partybranch){
					uni.showToast({
						title:'请选择党支部',
						icon:'none'
					})
					return ;
				}
				if(!partypost){
					uni.showToast({
						title:'请选择党内职务',
						icon:'none'
					})
					return ;
				}
				if(user_pass==''){
					uni.showToast({
						title:'请填写密码',
						icon:'none'
					})
					return ;
				}
				if(user_pass2==''){
					uni.showToast({
						title:'请填写确认密码',
						icon:'none'
					})
					return ;
				}
				
				var url = app.globalData.site_url+'/appapi/?s=Login.UserReg';
				var data = {
					user_login:user_login,
					user_pass:user_pass,
					user_pass2:user_pass2,
					code:code,
					mac:mac,
					user_nickname:user_nickname,
					partybranch:partybranch,
					partypost:partypost
				};
				request.requestApi(url,data).then(res=>{
					console.log(res);
					if(res.data.code==0){
						setTimeout(function(){
							uni.navigateBack({
								delta:1
							})
						},1500)

					}
					uni.showToast({
						title:res.data.msg,
						icon:'none'
					})
				
				})

			}
		}
	}
</script>

<style>
	.reg-button{
		padding: 0;
		margin: 0;
		width: 81%;
		margin: 0 auto;
		border-radius: 64rpx;
		line-height: 82rpx;
		color: #fff;
		background: linear-gradient(to bottom, #FF9000, #F64330);
		font-size: 30rpx;
		letter-spacing: 2rpx;
		margin-top: 100rpx;
	}
	.reg-li-getcode{
		color: #C9C9C9;
		font-size: 30rpx;
	}
	.reg-li-input-pl{
		color: #C9C9C9;
		font-size: 30rpx;
	}
	.reg-li-input{
		width: 70%;
		float: left;
	}
	.reg-li{
		width: 90%;
		margin: 0 auto;
		clear: both;
		overflow: hidden;
		padding: 40rpx 0 40rpx 0;
		border-bottom: 1px solid #E8E8E8;
	}
	.reg-li-left{
		float: left;
		width: 30%;
	}
	
	/* 让picker在h5显示 */
	uni-picker-view {
	  display: inline-block;
	}
	 
	uni-picker-view .uni-picker-view-wrapper {
	  display: flex;
	  position: relative;
	  overflow: hidden;
	  height: 100%;
	  background-color: white;
	}
	 
	uni-picker-view[hidden] {
	  display: none;
	}
	 
	picker-view {
	    width: 100%;
	    margin-top:20upx;
	}
		
	
</style>
