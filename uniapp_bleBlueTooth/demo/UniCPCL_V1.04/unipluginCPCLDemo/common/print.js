// #ifdef APP-PLUS
// const HanyinPlugin = uni.requireNativePlugin('Hanyin-Plugin'); //汉印
const modal = uni.requireNativePlugin('modal');
const HPRT = uni.requireNativePlugin('HPRTHelper'); //汉印MT800
// #endif
import Vue from 'vue';
import store from 'store';
import {
	SET_CONNECTBLEDATA
} from '@/store/actionsType.js';

/**
 * 1.确定好模板
 * 2.用户选择蓝牙后初始化打印机值
 * 3.等待客户点击打印
 */
let title;

//打印机连接指令
export default class printConnect {
	constructor(options) {
		// console.log(HanyinPlugin)
		// console.log(HPRT)
		/**
		 *1.根据蓝牙名称判断打印机类型
		 *2.连接指定打印机
		 */
		console.log(options);
		this.name = options.name; //蓝牙打印机名称
		this.mac = options.mac; //蓝牙打印机地址
		this.isConnect = false; //是否连接打印机开关
		this.printIndex = null; //打印机标识
		this.print_sign(this.name);
	}
	//判断打印机牌子,打印出面单
	print_sign(name) {
		uni.showLoading({
			title: "连接中...",
			mask: true
		})
		//判断打印机名称是以什么开头
		console.log("汉印打印机");
		this.connect_hanyin(this.mac);

	}
	//汉印打印机连接
	connect_hanyin(mac) {
		this.disconnect();
		HanyinPlugin.PortOpenBT({
			mac
		}, result => {
			console.log('链接结果:' + JSON.stringify(result));
			switch (result.state) {
				case 0:
					title = "连接成功";
					this.isConnect = true;
					// store.dispatch(SET_CONNECTBLEDATA, {name:this.name,mac:this.mac});
					break;
				case -1:
					title = "连接异常";
					this.connect_hanyin();
					break;
				case -2:
					title = "地址格式错误";
					break;
				case -3:
					title = "握手指令错误";
					break;
				default:
					title = "";
			}
			uni.hideLoading();
			uni.showToast({
				icon: "none",
				title,
				duration: 2000
			})
		})

		HanyinPlugin.Getstatus({}, res => {
			console.log(res)
		})
	}
	//启动打印命令
	startPrint(data) {
		console.log(data);
		console.log(this.printIndex);
		// obj 订单数据
		//汉印
		Print_Template.hanyin(data, this.printIndex);
	}
	//断开打印机连接
	disconnect() {
		HanyinPlugin.PortClose({}, result => {
			console.log(result);
		});
	}
}
