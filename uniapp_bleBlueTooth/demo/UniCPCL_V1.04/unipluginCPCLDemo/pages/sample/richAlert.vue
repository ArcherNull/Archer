<template>
	<view class="button-sp-area">
		<button type="primary" @click="search_bluetooth">搜索蓝牙</button>
		<button type="primary" plain="true" @click="closeBT()">断开连接</button>
		<button type="primary" plain="true" @click="handlePrint()">测试打印</button>
		<button type="primary" plain="true" @click="printImage()">打印图片</button>
		<button type="primary" plain="true" @click="getPrinterSN()">获取SN</button>
		<button type="primary" plain="true" @click="getElectricity()">获取电量</button>
		<button type="primary" plain="true" @click="getPrinterVersion()">获取打印机版本</button>
		<textarea v-model="localtion"></textarea>
		<view class="bluetoothItem" v-if="GET_INFODATA">
			<view class="bluetoothList" v-for="(item,index) in GET_INFODATA" :key="index"
				@tap="confirm_bluetooth(item)">
				<view class="bluetoothList-name">名称:{{item.name}}</view>
				<view class="bluetoothList-mac">地址:{{item.mac}}</view>
				<view class="bluetoothList-jange">--------------</view>
			</view>
		</view>
	</view>
</template>

<script>
	// import printConnect from "@/common/print.js"; //引入打印机模板文件 
	let _this = null;
	import {
		mapGetters,
		mapActions
	} from 'vuex';
	import {
		GET_INFODATA,
		GET_CONNECTBLEDATA
	} from "@/store/gettersType.js";
	import {
		SET_CONNECTBLEDATA
	} from '@/store/actionsType.js';
	// #ifdef APP-PLUS
	const modal = uni.requireNativePlugin('modal');
	// const HPRT = uni.requireNativePlugin('DCloud-RichAlert');
	const printModule = uni.requireNativePlugin('PrintModuleCPCL');
	// #endif
	let print;
	export default {
		data() {
			return {
				title: '',
				localtion: '',
				isStart: true,
				bArray: [], //用于搜索蓝牙去重用的
				no_match_list: [], //没有配对的蓝牙列表
				match_list: "", //已连接蓝牙打印机
				val: "",
				dateTimer: "",
				valArr: [],
				url: '',
				item: {
					name: "MT800",
					mac: "04:7F:0E:30:65:E8",
				},
				
			}
		},
		computed: {
			...mapGetters([GET_INFODATA, GET_CONNECTBLEDATA])
		},
		onLoad(options) {
			_this = this;
			this.$init_bluetooth();
		},
		methods: {
			...mapActions([SET_CONNECTBLEDATA]),
			// 连接打印机
			confirm_bluetooth(item) {
				// let {
				// 	name,
				// 	mac
				// } = item;
				uni.showLoading({
					title: "连接中...",
					mask: true
				})
				let mac = item.mac;
				console.log(item)
				try {
					printModule.connectionBT({
						'address': mac
					}, result => {
						const msg = JSON.stringify(result);
						modal.toast({
							message: msg,
							duration: 6
						});
						uni.hideLoading()
						printModule.setDisConnectBTListener((ret) => {
							modal.toast({
								message: '蓝牙断开',
								duration: 6
							});
						})
					})
					
				} catch (e) {
					console.log(e)
				}
			},
			//搜索没匹配的蓝牙设备
			search_bluetooth(address) {
				let _this = this;
				//检查蓝牙是否开启
				this.$check_bluetooth_open().then(ores => {
					if (ores) {
						console.log(ores);
						//搜索蓝牙
						_this.$search_bluetooth().then(bres => {
							console.log(bres);
							if (bres.code) {
								_this.$search_pipei().then(pres => {
									console.log(pres);
								})
							}
						})
					}
				})
			},
			handlePrint() {
				printModule.printAreaSize({
					'height': '500',
					'number': '1'
				}, result => {})
				printModule.printText({
					'x_pos': '0',
					'y_pos': '0',
					'fontSize': '7',
					'direction': 'T',
					'data': '测试'
				}, result => {});
				printModule.printBarCode({
					'x_pos': '0',
					'y_pos': '30',
					'code_type': '128',
					'ratio': '1',
					'height': '80',
					'width': '1',
					'rotation': 'BARCODE',
					'undertext': true,
					'number': '7',
					'offset': '5',
					'code_data': '123456789'
				});
				printModule.printQRCode({
					'x_pos': '0',
					'y_pos': '150',
					'rotation': 'BARCODE',
					'mode': '2',
					'width': '6',
					'code_data': 'test QR code'
				});
				printModule.printLine({
					'startX': '0',
					'startY': '300',
					'endX': '200',
					'endY': '300',
					'width': '2'
				});
				printModule.printBox({
					'leftX': '0',
					'leftY': '310',
					'rightX': '200',
					'rightY': '480',
					'width': '2'
				});
				printModule.print()
			},
			printImage() {
				// 选择图片
				uni.chooseImage({
					success: function(chooseRes) {
						const tempFilePath = chooseRes.tempFilePaths[0];
						console.log(tempFilePath)
						const path = plus.io.convertLocalFileSystemURL(tempFilePath)
						console.log(path)
						printModule.printAreaSize({
							'height': '400',
							'number': '1'
						}, result => {})
						printModule.printBitmapPath({
							'x_pos': '0',
							'y_pos': '0',
							'path': path,
							'halftoneType': 1
						}, (ret) => {})
						printModule.print()
					},
				});
				
			},
			closeBT() {
				printModule.closeBT();
			},
			getPrinterSN() {
				printModule.getPrintSN((ret) => {
					const sn = JSON.stringify(ret);
					modal.toast({
						message: `sn:${sn}`,
						duration: 6
					});
				})
			},
			getElectricity() {
				printModule.getElectricity((ret) => {
					const elect = JSON.stringify(ret);
					modal.toast({
						message: `电量:${elect}`,
						duration: 6
					});
				})
			},
			getPrinterVersion() {
				printModule.getPrinterVersion((ret) => {
					const version = JSON.stringify(ret);
					modal.toast({
						message: `版本号:${version}`,
						duration: 6
					});
				})
			},
		}
	}
</script>

<style>
	button {
		margin-top: 30upx;
		margin-bottom: 30upx;
	}

	.button-sp-area {
		margin: 0 auto;
		width: 60%;
	}

	.content {
		text-align: center;
		height: 400upx;
	}

	.wrapper {
		flex-direction: column;
		justify-content: center;
	}

	.button {
		width: 200px;
		margin-top: 30px;
		margin-left: 20px;
		padding-top: 20px;
		padding-bottom: 20px;
		border-width: 2px;
		border-style: solid;
		border-color: #458B00;
		background-color: #458B00;
	}

	.text {
		font-size: 30px;
		color: #666666;
		text-align: center;
	}
</style>