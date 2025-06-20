<template>
	<view>
		
		<view class="result-tt-top" :style="'padding-top:' + tophight+'px;'">
			<view class="page-title-wrap">
				<text @click="fanhui" class="iconfont icon-fanhui1 fanhui-icon"></text>
				<text>在线答题</text>
				<!-- 计时区域 -->
				<view class="timenums-wrap">
					<text>答题倒计时:</text>
					<text class="timenums">{{timeNums[current]}}</text>
				</view>
			</view>
		</view>	
		
		<!-- 考试答题区 -->
		<view class="zhe">	
			<view class="dangbiao">
				<image class="dangbiao-img" src="https://d15file.680.com/2021-12/25/s/22021122514031715234_11117758.png" mode="aspectFill"></image>
			</view>
		 <block v-if="tiList[current] != undefined">	
			<!-- 题目类型数量 -->
			<view class="zhe-type">
				<view class="zhe-type-left">
					<text class="zhe-title font_30" v-if="tiList[current].type == '0'">判断题</text>
					<text class="zhe-title font_30" v-if="tiList[current].type == '1'">单选题</text>
					<text class="zhe-title font_30" v-if="tiList[current].type == '2'">多项选择题</text>
					<text class="zhe-title font_30" v-if="tiList[current].type == '4'">填空题</text>
				</view>
				<view>
					<text class="current-ti-num">{{currentQid}}</text>
					<text class="current-ti-all-num">/{{tiList.length}}</text>
				</view>
			</view>
			
			
			<!-- 题目区 -->
			<scroll-view class="scroll-view" scroll-y="true" :style="'height:' + scrollH+'rpx;'">
				
					<view class="que-content color_32 font_30">
						{{tiList[current].title}}
					</view>
					<!-- 选项 -->
					<view class="option-list">
							
						<!-- 判断题 rs为0错误 1正确 -->
						<block v-if="tiList[current].type == '0'">
							<!-- 未做题 -->
							<block v-if="user_answer.ti_data[current] != 'is_end'">
								<view @click="checkPanduan('1')" class="option-item">
									A.对
								</view>
								<view @click="checkPanduan('0')" class="option-item">
									B.错
								</view>
							</block>
		
							<!-- 已做完 -->
							<block v-else>
								<!-- 答案是1即此题应选正确 背景变色 -->
								<block v-if="tiList[current].answer.rs == '1'">	
									<view class="option-item optionright">
										<image class="duicuo-img" src="../../static/images/tongji_duihao.png"
											mode="aspectFill"></image>
										<text>A.对</text>	
									</view>
									
									<view class="option-item" :class="{optionwrong:(right_cuo[current] != '1')}">
										<!-- 用户做错了 错选项前加一个叉号图标 -->
										<image v-if="right_cuo[current] != '1'" class="duicuo-img" src="../../static/images/tongji_cuohao.png"
											mode="aspectFill"></image>
										<text>B.错</text>	
									</view>
								</block>
								
								<!-- 答案是0 即此题应选错误 背景变色 -->
								<block v-if="tiList[current].answer.rs == '0'">
									<view class="option-item" :class="{optionwrong:(right_cuo[current] != '1')}">
										<image v-if="right_cuo[current] != '1'" class="duicuo-img" src="../../static/images/tongji_cuohao.png"
											mode="aspectFill"></image>
										<text>A.对</text>	
									</view>
									<view class="option-item optionright">
										<image class="duicuo-img" src="../../static/images/tongji_duihao.png"
											mode="aspectFill"></image>
										<text>B.错</text>	
									</view>
								</block>
							</block>
					</block>
					
					<!-- 单选题 -->
					<block v-if="tiList[current].type == '1'">
							
						  <block v-for="(item, index) in tiList[current].answer.ans" :key="index">
									
								<block v-if="user_answer.ti_data[current] != 'is_end'">
									<view class="option-item" @click="checkDanxuan(index)">
										{{ti_info_abc[index]}}.{{item}}
									</view>
								</block>
								<!-- 做完此题了 -->
								<block v-else>
									<!-- 做对了 只有作对的题变粉色 其他不变  -->
									<block v-if="right_cuo[current] == '1'">
										<block v-if="tiList[current].answer.rs == index">
											<view class="option-item optionright">
												<image class="duicuo-img" src="../../static/images/tongji_duihao.png"
													mode="aspectFill"></image>
												{{ti_info_abc[index]}}.{{item}}
											</view>
										</block>
										<block v-else>
											<view class="option-item">
												{{ti_info_abc[index]}}.{{item}}
											</view>
										</block>
									</block>
									<!-- 做错了 做错选项加叉号 正确答案变色 -->
									<block v-else>
										<!-- 是正确答案,但是用户没选 -->
										<block v-if="user_ans[tiList[current].id] == index">
											<view class="option-item optionwrong">
												<image class="duicuo-img" src="../../static/images/tongji_cuohao.png"
													mode="aspectFill"></image>
													{{ti_info_abc[index]}}.{{item}}
											</view>
										</block>
										<block v-else-if="tiList[current].answer.rs == index">
											<view class="option-item optionright">
												<image class="duicuo-img" src="../../static/images/tongji_duihao.png"
													mode="aspectFill"></image>
												{{ti_info_abc[index]}}.{{item}}
											</view>
										</block>
										<block v-else>
											<view class="option-item">
												{{ti_info_abc[index]}}.{{item}}
											</view>
										</block>
										
									</block>
									
								</block>
								
							</block>
						</block>
			
						<!-- 多选题（定项） -->
						<block v-if="tiList[current].type == '2'">
							<block v-for="(item, index) in tiList[current].answer.ans" :key="dingxiang.key[index]">
							
							<!-- 用户没选择此选项 -->
							<block v-if="dingxiang.abc[current][index] != 'is_checked'">
								<view @click="checkDingxiang(index)" class="option-item">
									{{ti_info_abc[index]}}.{{item}}
								</view>
								<text style="display: none;">{{dingxiang.key[index]}}</text>
							</block>
							
							<!-- 如果用户已选择 此选项-->
							<block v-else>
								<!-- 在正确答案中 打对号 背景变色 -->
								<block v-if="tiList[current].answer.rs.indexOf(index) != '-1'">
									<view class="option-item optionright">
										<image class="duicuo-img" src="../../static/images/tongji_duihao.png"
											mode="aspectFill"></image>
										{{ti_info_abc[index]}}.{{item}}
									</view>
								</block>
								<!-- 不在正确答案中 且用户选择 加叉号 -->
								<block v-else-if="tiList[current].answer.rs.indexOf(index) == '-1' && dingxiang.ans[current].indexOf(index) != '-1'">
									<view class="option-item optionwrong">
										<image class="duicuo-img" src="../../static/images/tongji_cuohao.png"
											mode="aspectFill"></image>
										{{ti_info_abc[index]}}.{{item}}
									</view>
								</block>
								
								<!-- 不在正确答案中 但用户没选 背景变白 -->
								<block v-else>
									<text>{{tiList[current].answer.rs}}</text>
									<text>{{dingxiang.ans[current]}}</text>
									<view class="option-item optionwhite">
										{{ti_info_abc[index]}}.{{item}}
									</view>
								</block>
								
							</block>
						</block>
						
					</block>
					
					
					<!-- 填空题 -->
					<block v-else-if="tiList[current].type == 4">
						<!-- 根据答案 控制input数量 -->
						<view v-for="(item,index) in tiList[current].answer.ans" :key="index" class="ti-info-item ti-info-item-tiankong">
							<text v-if="user_answer.ti_data[current] != 'is_end'" class="ti-info-item-xuhao ti-info-item-xuhao-num">{{parseInt(index)+1}}</text>
							<view v-else>
								<!-- 已做完题 -->
								<image v-if="item[0] == tiankong.ans[current][index]" class="duicuo-img" :src="duihao" mode="aspectFill"></image>
								<image v-else class="duicuo-img" :src="cuohao" mode="aspectFill"></image>
							</view>
							<input :adjust-position="false" @input="onInput" v-if="user_answer.ti_data[current] != 'is_end'"
							 placeholder="点此输入答案" placeholder-style="color:#C9C9C9; font-size:26rpx;" class="tiankong-input" v-model="tiankong.ans[current][index]"
							 style="border: 2rpx solid #DDDDDD; color: #808080;" type="text" value="" />
							<input :adjust-position="false" @input="onInput" v-else-if="item[0] == tiankong.ans[current][index]"
							 placeholder="点此输入答案" placeholder-style="color:#C9C9C9; font-size:26rpx;" class="tiankong-input" v-model="tiankong.ans[current][index]"
							 style="border: 2rpx solid #DDDDDD;color: #FE5A13;" type="text" value="" />
							<input :adjust-position="false" disabled="true" @input="onInput" v-else-if="item[0] != tiankong.ans[current][index]" placeholder="点此输入答案"
							 placeholder-style="color:#C9C9C9; font-size:26rpx;" class="tiankong-input" v-model="tiankong.ans[current][index]"
							 style="border: 2rpx solid #DDDDDD;color: #808080;" type="text" value="" />
							
						</view>
					
						<!-- 没提交时显示 -->
						<view v-if="tiankong.sub[tiList[current].id] != '1'" class="ans-btn-wrap">
							<text @click="subTiankong" :class="{is_start_check : (tiankong.start_check[current]== '1')}" class="ans-btn">确认答案</text>
						</view>
					</block>
						
					</view>
					<!-- 答案 -->
					<view v-if="(tiList[current].type == '4') && (user_answer.ti_data[current] == 'is_end')" class="ans-jiexi">
						<view class="ans">
							<text style="font-weight: bold; margin-right: 10rpx; width: 90rpx;">答案</text>
							<text class="add-tiankong">{{tiankong.right_ans[current]}}</text>
						</view>
						
					</view>
					
			</scroll-view>
		
		 </block>
		 
		</view>
		<!-- zhe结束 -->
		
		<!-- 上一题下一题按钮 -->
		<view class="ti-btn-wrap">
			<text @click="checkTi('1')" class="pre-ti-btn ti-btn" :class="{check_ti :(check_ti == '1')}">上一题</text>
			<text @click="checkTi('2')" class="next-ti-btn ti-btn" :class="{check_ti :(check_ti == '2')}">下一题</text>
		</view>
		
	</view>
</template>

<script>
	import request from '@/util/request.js';
	
	const app = getApp();
	
	export default {
		components:{
		},
		data() {
			return {
				start_time:0, //开始答题时间
				is_zhe_show: '0', //是否显示遮罩层
				is_zhe_top: '0', //是否显示遮罩层上半边
				is_show_result: '0',
				scrollH: 0,
				check_ti: '', //选择上一题/下一题
				tiList: [],
				current: '0', //当前页面索引
				tilist_c: {}, //当前索引试题
				currentQid: 1,
				ti_info_abc: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], //选择题选项
				// 存放用户每题答对答错情况
				right_cuo: [], //索引 对 1 错 0
				//用户答题数据, 对题数  错题数 题目信息
				user_answer: {
					'dui_num': 0,
					'cuo_num': 0,
					'ti_data': []
				},
				//判断题相关数据
				panduan: {
					'is_end': '0', //是否已做完此题(记入缓存使用)
				},
				user_ans: {}, //存放用户每题答案 索引 => res
				dingxiang: {
					'ans': [], //存放每次点击答案时的选项id
					'key': {
						'0': '0',
						'1': '1',
						'2': '2',
						'3': '3',
						'4': '4',
						'5': '5',
						'6': '6',
						'7': '7'
					},
					'start_check': [], //是否开始输入 控制按钮变色, 索引: '1
					//存放定项题 每个选项是否选择 索引: {a: 'is_checked', b: 'is_checked', ...}
					'abc': [], 
				},
				// 填空题相关数据
				tiankong: {
					'ans': [], //存放用户input输入的答案
					'sub': [], //是否提交 id: 是否提交 {'1' : '1', '2': '1', ...}
					'right_ans': [], //正确答案字符串 1.XX 2.XX
					'start_check': [], //是否开始输入 控制按钮变色, 索引: '1'
				},
				result: {}, //存放答题结果
				duihao: '../../static/images/tongji_duihao.png',
				cuohao: '../../static/images/tongji_cuohao.png',
				timeNums: [],//计时器 索引1:40,索引2:40,...
				tophight: 0
			}
		},
		onReady() {
			
			if(app.globalData.userInfo == '') {
				uni.navigateTo({
					url: '../login/index',
				});
				return;
			}
			
			var that = this;
			uni.getSystemInfo({
				success: function(res) {
					that.windowHeight = res.windowHeight;
					that.scrollH = res.windowHeight * 750 / res.windowWidth - 700;
					// #ifdef MP-WEIXIN
					that.scrollH = res.windowHeight * 750 / res.windowWidth - parseInt(res.safeArea.top) - 740;
					// #endif
				}
			});
			
			this.getTestsList();
			if(this.start_time == 0) {
				this.start_time = Date.now();
			}
			// #ifdef MP-WEIXIN
			this.tophight = uni.getMenuButtonBoundingClientRect().top + 8;
			// #endif
		},
		methods: {
			
			fanhui(){
				uni.reLaunch({
					url: '../index/index',
				})
			},
			// 计时器
			setTimeJs(index){
				let that = this;
				let allNums = 40;
				let intervalFunc = setInterval(() => {
					//这里不能用that.current当索引 否则会计时错乱!!
					that.$set(that.timeNums, index, --allNums);
				    if (allNums < 1) {
				        clearInterval(intervalFunc);
				    }
				}, 1000);
				
			},	
			// 监听填空输入
			onInput(e) {
				if (e.detail.value != '') {
					this.tiankong.start_check[this.current] == '1'
					this.$set(this.tiankong.start_check, this.current, '1');
				}
			},
			subTiankong() {
				
				let isAnswer = this.checkAnswerTime();
				if(isAnswer === false) {
					uni.showToast({
						icon: 'none',
						title: '您已超时, 无法作答'
					});
					return;
				}
				
				let tiankong_ans = this.tiankong.ans;
				let kong_num = 0;
				for (let idx in tiankong_ans[this.current]) {
					if (tiankong_ans[this.current][idx] == '') {
						kong_num++;
					}
				}
				if (kong_num == tiankong_ans[this.current].length) {
					uni.showToast({
						icon: 'none',
						title: '答案不能为空'
					});
					return;
				}
				let currentId = this.tiList[this.current].id;
				this.tiankong.sub[currentId] = '1';
				//存入用户答案
				this.user_ans[this.tiList[this.current].id] = this.tiankong.ans[this.current];
				this.setAnsCache(this.tiList[this.current].answer.ans, this.tiankong.ans[this.current], '4');
			},
			datiAgain() {
				this.resetDati();
			},
			backIndex() {
				uni.reLaunch({
					url: '../index/index'
				})
			},
			// 关闭答题框
			closeDati(type) {
				let that = this;
				if(type == '0') {
					//未做完题关闭弹框
					uni.showModal({
						title: '是否退出本次答题?',
						content: '退出后，本次答题不计入成绩',
						showCancel: false,
						cancelText: '取消',
						cancelColor: '#969696',
						showCancel:true,
						confirmText: '确认退出',
						confirmColor: '#FE5A13',
						success: res => {
							if (res.confirm) {
								that.is_zhe_show = '0';
								that.is_zhe_top = '0';
								
								// 清空答题数据
								this.resetDati();
							}
						},
						fail: () => {},
						complete: () => {}
					});
				}
				
				if(type == '1') {
					// 做完题关闭答题框
					that.is_zhe_show = '0';
					that.is_zhe_top = '0';
				}
				
			},
			checkAnswerTime(){
				if(this.timeNums[this.current] < 1 ) {
					return false;
				}
				return true;
			},
			/* 处理定项选择题(必须全部答案都选中才算做对)
			 * @param {Object} rs 答案字符串
			 * @param {Object} us 用户所选索引
			 */
			checkDingxiang(us) {
				
				let isAnswer = this.checkAnswerTime();
				if(isAnswer === false) {
					uni.showToast({
						icon: 'none',
						title: '您已超时, 无法作答'
					});
					return;
				}
				
				// 每个选项选择之后就不可更改
				let cur = this.current;
				if(this.dingxiang.abc[cur][us] == 'is_checked') {
					return;
				}
				this.dingxiang.abc[cur][us] = 'is_checked';
				this.$set(this.dingxiang.abc[cur], us, 'is_checked');
				
				let rs = this.tiList[cur].answer.rs;
				let rsArr = rs.split(',');
				
				// 强制重新渲染页面数据
				for (let idx in this.dingxiang.key) {
					this.dingxiang.key[idx]++;
				}
				
				let curQid = this.tiList[this.current].id;	
				if(this.user_ans[curQid] == undefined) {
					this.user_ans[curQid] = [];
				}
			
				let usr_ans = this.dingxiang.ans[cur];
				if (usr_ans.indexOf(us) != '-1') {
					//存放到定项答案中
					this.dingxiang.ans[cur].splice(usr_ans.indexOf(us), 1);
					this.dingxiang.abc[cur][us] = 'is_checked';
					this.$set(this.dingxiang.abc[cur], us, 'is_checked');
					// 总答案中删除
					this.user_ans[curQid].splice(usr_ans.indexOf(us), 1);
			
				} else {
					this.dingxiang.ans[cur].push(us);
					this.dingxiang.abc[cur][us] = 'is_checked';
					this.$set(this.dingxiang.abc[cur], us, 'is_checked');
					
					// 存放到总答案中
					this.user_ans[curQid].push(us);
				}
				
				this.user_answer.ti_data[this.current] = 'is_end';
			
			},
			//单选题 us用户选择答案
			checkDanxuan(us){
				
				let isAnswer = this.checkAnswerTime();
				if(isAnswer === false) {
					uni.showToast({
						icon: 'none',
						title: '您已超时, 无法作答'
					});
					return;
				}
				
				let rs = this.tiList[this.current].answer.rs;
				if (this.user_answer.ti_data[this.current] == 'is_end') {
					return;
				}
				this.setAnsCache(rs, us);
			},
			/* 处理判断题
			 * @param {Object} us 用户点击的答案 1正确 0错误
			 */
			checkPanduan(us) {
				
				let isAnswer = this.checkAnswerTime();
				if(isAnswer === false) {
					uni.showToast({
						icon: 'none',
						title: '您已超时, 无法作答'
					});
					return;
				}
				
				if (this.user_answer.ti_data[this.current] == 'is_end') {
					return;
				}
				let qid = this.tiList[this.current].id.toString();
				// 调用提交答案接口
				let usrAns = {
					'qid': qid,
					'rs': us
				};
				let rs = this.tiList[this.current].answer.rs;
				this.setAnsCache(rs, us);
			},
			//处理用户答题数据及选项显示状态
			setAnsCache(rs, us, type = '') {
				let that = this;
				let gData = app.globalData;
				
				// 改变此题状态为已做完 	
				that.user_answer.ti_data[that.current] = 'is_end';
				that.$set(that.user_answer.ti_data, that.current, 'is_end');
				
				// 判断和单选共用一个逻辑 	
				if (type == '') {
					if (rs == us) {
						that.right_cuo[that.current] = '1';
						that.$set(that.right_cuo, that.current, '1');
			
					} else {
						that.right_cuo[that.current] = '0';
						that.$set(that.right_cuo, that.current, '0');
					}
					// 存放用户答案 题目id => 答案
					that.user_ans[that.tiList[that.current].id] = us;
				}
				
				// 填空
				if(type == '4') {
					that.tiankong.right_ans[that.current] = '';
					for (var i = 0; i < rs.length; i++) {
						// 拼接正确答案字符串
						if (rs.length >1){
							that.tiankong.right_ans[that.current] +=  (i + 1) + '.' + rs[i][0] + ' ' + '\n';
						}else{
							that.tiankong.right_ans[that.current] += (i + 1) + '.' + rs[i][0] + ' ';
						}
						
					}
					
				}
					
			},		
			// 获取试题列表
			getTestsList() {
				uni.request({
					url: app.globalData.site_url + '/appapi/?s=Tests.getTestsListIndex',
					method: 'GET',
					data: {
						'uid': app.globalData.userInfo.id,
						'token': app.globalData.userInfo.token
					},
					success: res => {
						
						if(res.data.data == undefined) {
							return;
						}
						let rs_code = res.data.data.code;
						if(rs_code != 0) {
							uni.showToast({
								icon: 'none',
								title: res.data.data.msg
							});
							if(rs_code == 700) {
								uni.navigateTo({
									url: '../login/index',
								});
								return;
							}
							
						}
						let tiList = res.data.data.info[0];
						if(tiList.length < 1) {
							return;
						}
						for (let idx in tiList) {
							tiList[idx].answer = JSON.parse(tiList[idx].answer);
							this.dingxiang.ans[idx] = [];
							this.dingxiang.abc[idx] = [];
							// 填充填空题答案数组
							this.tiankong.ans[idx] = [];
							//填充倒计时数组
							this.timeNums[idx] = 40;
						}
						this.tiList = tiList;
						this.setTimeJs(this.current);
					},
					fail: () => {
						uni.showToast({
							title: '网络错误,请重试'
						});
					},
				});
			},
			// 选择上一题 /下一题
			checkTi(ti_num) {
				this.check_ti = ti_num;
				//上一题
				if (ti_num == '1') {
					if(this.current == '0') {
						return;
					}
					this.current--;
					this.currentQid--;
				}
				// 下一题
				if (ti_num == '2') {
					
					// 在40秒内做完当前题才可做下一题
					if(this.timeNums[this.current] > 0 && this.user_answer.ti_data[this.current] != 'is_end') {
						uni.showToast({
							icon:'none',
							title: '请先答当前题目',
						});
						return;
					} 
						
					// 做到最后一题直接交卷
					if(this.current == (this.tiList.length -1)) {
						// 参数 用户id 试题id
						this.subTests();
					}
					this.current++;
					this.currentQid++;
					
					//超时了或答完此题 到下一题重新倒计时
					this.setTimeJs(this.current);
					
				}
			
			},
			// 提交答案
			subTests(){
				let that = this;
				let url = app.globalData.site_url + '/appapi/?s=Tests.subTestsIndex';
				uni.request({
					url: url,
					method: 'GET',
					data: {
						'uid': app.globalData.userInfo.id,
						'token': app.globalData.userInfo.token,
						'testsid': 0,
						'answer': JSON.stringify(that.user_ans),
						'start_time': that.start_time
					},
					success: res => {
						
						if(res.data.data.code == 0) {
							that.result = res.data.data.info;
							uni.navigateTo({
								url: './result?info=' + encodeURIComponent(JSON.stringify(that.result)),
							});
							
						} else {
							uni.showToast({
								icon: 'none',
								title: res.data.data.msg,
							});
							
						}
					},
					fail: () => {
						uni.showToast({
							icon: 'none',
							title: '网络错误'
						});
					},
				});
			},
			
		}
	}
</script>

<style>
	
	page {
		background-color: #F2F2F2;
		overflow: hidden;
	}
	
	.result-tt-top {
		background: url(../../static/images/datibeijing.png) no-repeat left top;
		background-size: 100%;
	}
	
	.page-title-wrap {
		height: 510rpx;
		text-align: center;
		color: #FFFFFF;
		font-size: 32rpx;
		position: relative;
		
	}
	
	.fanhui-icon {
		position: absolute;
		display: inline-block;
		width: 40rpx;
		height: 40rpx;
		left: 6rpx;
		top: 6rpx;
	}
	
	.timenums-wrap {
		margin-top: 20rpx;
	}
	
	.timenums {
		margin-left: 20rpx;
	}
	
	/* 答题区域 */
	.zhe {
		width: 82%;
		height: calc(50vh);
		position: absolute;
		top: 0;
		bottom: 20rpx;
		left: 0;
		right: 0;
		margin: auto;
		border-radius: 12rpx;
		padding: 30rpx;
		padding-bottom: 200rpx;
		background-color: #FFFFFF;
	}
	
	.scroll-view {
		overflow: hidden;
	}
	
	.dangbiao {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		width: 110rpx;
		height: 110rpx;
		position: absolute;
		top: -55rpx;
		left: 50%;
		transform: translate(-50%);
		z-index: 999;
		background-color: #FFF;
		border: 2rpx solid #F0F0F0;
	}
	
	.dangbiao-img {
		display: inline-block;
		width: 60%;
		height: 60%;
	}
	
	.zhe-type {
		display: flex;
		align-items: center;
		background-color: #FFFFFF;
		border-bottom: 2rpx solid #F0F0F0;
		margin-bottom: 40rpx;
	}
	
	.zhetop {
		background-color: #000;
		background: rgba(0, 0, 0, 0.2);
		z-index: 4999;
		position: fixed;
		top: 0rpx;
		min-height: 2000rpx;
		width: 100%;
	}
	
	
	.shu {
		display: inline-block;
		background-color: #FE5A13;
		height: 40rpx;
		width: 10rpx;
		margin-right: 14rpx;
	}
	
	.zhe-type-left {
		width: 90%;
	}
	
	.zhe-title {
		display: inline-block;
		/* width: 30%; */
		text-align: center;
		color: #FFFFFF;
		font-size: 30rpx;
		padding: 10rpx 20rpx;
		letter-spacing: 1rpx;
		background-color: #ED292A;
	}
	
	.current-ti-num {
		font-size: 50rpx;
		font-weight: bold;
		color: #ED292A;
	}
	
	.current-ti-all-num {
		color: #ED292A;
	}
	
	.que-content {
		line-height: 45rpx;
		margin-bottom: 40rpx;
	}
	
	.option-item {
		min-height: 90rpx;
		margin-bottom: 20rpx;
		border-radius: 11rpx;
		border: 2rpx solid #F0F0F0;;
		display: flex;
		align-items: center;
		padding-left: 20rpx;
	}
	
	.ti-btn-wrap {
		height: 100rpx;
		width: 600rpx;
		position: absolute;
		left: 50%;
		transform: translate(-50%);
		bottom: 25rpx;
	}
	
	.ti-btn {
		display: inline-block;
		width: 40%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		position: absolute;
		border-radius: 53rpx;
		border: 2rpx solid #F2F2F4;
		font-size: 30rpx;
		background-color: #ED292A;
		color: #FFFFFF;
	}
	
	.pre-ti-btn {
		left: 20rpx;
	}
	
	.next-ti-btn {
		right: 20rpx;
	}
	
	.check_ti {
		background-color: #FE5A13 !important;
		color: #FFFFFF;
	}
	
	.option-item {
		color: #707376;
	}
	
	.duicuo-img {
		margin-right: 20rpx;
		display: inline-block;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	/* 正确答案颜色 */
	.optionright {
		background-color: rgba(0,201,0,0.1) !important;
		color: #00c900 !important;
	}
	/* 错误答案变色 */
	.optionwrong {
		background-color: rgba(237,41,42,0.1) !important;
		color: #ed292a;
	}
	
	.optionwhite {
		background-color: #FFFFFF !important;
	}
	
	
	/* 结果页 样式 */
	.top_tips{
	  background: url('http://wycs2.sdwanyue.com/wxsmall/tip.png') no-repeat;
	  background-size: 100% 100%;
	  width: 144px;
	  height: 40px;
	  position: fixed;
	  right: 0;
	  top: 2px;
	  font-size: 13px;
	  text-align: center;
	  line-height: 46px;
	  color: #fff;
	}
	.top{
	  background: url('https://dj.sdwanyue.com/uniapp/dati_bg.png') no-repeat center;
	  background-size: 100% 100%;
	  width: 100%;
	  height: 380rpx;  
	  position: absolute;
	  left: 0;
	  top: 0;
	  border-radius: 12rpx 12rpx 0 0;
	}
	
	.top_text1{
	  text-align: center;
	  color: #fff;
	  letter-spacing: 1px;
	  font-size: 20px;
	  position: relative;
	  top: 44px;
	}
	
	.top_text2{
	  color: #FF4D00;
	  text-align: center;
	  letter-spacing: 1px;
	  font-size: 35rpx;
	  margin-top: 90rpx;
	}
	
	.top_text3{
	  color: #FF4D00;
	  font-size: 52px;
	  text-align: center;
	  margin-top: 10px;  
	}
	
	
	.result-bottom {
		margin-top: 380rpx;
	}
	
	.li{
	  width: 100%;
	  height: 105rpx;
	  border-bottom: 1px solid #FBFBFB;
	  line-height: 105rpx;
	}
	
	.li_img{
	  width: 20px;
	  height: 20px;
	  margin-top: 17px;
	  margin-left: 20px;
	}
	
	.li_text{
	  margin-left: 12px;
	  color: #8D9EB7;
	  font-size: 30rpx;
	  position: relative;
	  top: -4px;
	}
	.tips{
	  color: #fff;
	  font-size: 10px;
	  margin-top: 30px;
	  text-align: center;
	  font-weight: 100;
	  letter-spacing: 1px;  
	}
	
	#back{
	  color: #707376;
	  background: #fff;
	  padding: 0;
	  height: 55px;
	  width: 90%;
	  line-height: 55px;
	  font-size: 15px;
	  letter-spacing: 1px;
	  margin-top: 30px;
	  border: 1px solid #F2F2F4;
	  font-weight: 300;
	  margin-bottom: 30px;
	}  
	
	.button_view{
	  width: 90%;
	  margin: 0 auto;
	  clear: both;
	  overflow: hidden;  
	  position: absolute;
	  bottom: 10rpx;
	}
	
	#button_view_prev{
	  float: left;
	  width:36%;
	  height: 50px;
	  line-height: 50px;
	  padding: 0;
	  color: #fff;
	  background: #487AFF;
	  border: 1px solid #F2F2F4;
	  font-weight: 300;
	  letter-spacing: 1px;
	  border: 1px solid #F2F2F4;
	}
	
	#button_view_next{
	  float: left;
	  width:47%;
	  height: 45px;
	  line-height: 45px;
	  padding: 0;
	  color: #707376;
	  background: #fff;
	  font-weight: 300;
	  letter-spacing: 1px;
	  margin-left: 2%;
	  border: 1px solid #F2F2F4;
	  text-align: center;
	}
	#button_view_getgift{
	  float: left;
	  width:47%;
	  height: 45px;
	  line-height: 45px;
	  padding: 0;
	  color: #fff;
	  background: linear-gradient(#FF6224,#FF3615);
	  border: 1px solid #F2F2F4;
	  font-weight: 300;
	  letter-spacing: 1px;
	  border: 1px solid #F2F2F4;
	  margin-left: 2%;
	  text-align: center;
	}
	
	#button_view_prev1{
	  float: left;
	  width:47.5%;
	  height: 50px;
	  line-height: 50px;
	  padding: 0;
	  color: #fff;
	  background: #487AFF;
	  border: 1px solid #F2F2F4;
	  font-weight: 300;
	  letter-spacing: 1px;
	  border: 1px solid #F2F2F4;
	}
	
	#button_view_next1{
	  float: left;
	  width:47.5%;
	  height: 50px;
	  line-height: 50px;
	  padding: 0;
	  color: #707376;
	  background: #fff;
	  font-weight: 300;
	  letter-spacing: 1px;
	  margin-left: 5%;
	  border: 1px solid #F2F2F4;
	}	
	
	/* 填空题样式 */
	.ti-info-item {
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		flex-direction: row;
	}
	
	.ti-info-item-tiankong {
		height: 70rpx;
	}
	
	.ti-info-item-xuhao-num {
		float: left;
	}
	
	.tiankong-input {
		float: left;
		height: 100%;
		width: 85%;
		border-radius: 11rpx;
		padding: 0 10rpx;
		margin-left: 10rpx;
	}
	
	/* 确认答案按钮 */
	.ans-btn-wrap {
		margin-top: 120rpx;
		height: 60rpx;
		text-align: center;
	}
	
	.ans-btn {
		height: 100%;
		line-height: 60rpx;
		width: 170rpx;
		border-radius: 6rpx;
		display: inline-block;
		font-size: 24rpx;
		color: #969696;
		background-color: #E6E6E6;
	}
	
	.is_start_check {
		background-color: #ED292A !important;
		color: #FFFFFF;
	}
	
	/* 答案 */
	.ans {
		min-height: 80rpx;
		display: flex;
		align-items: center;
		padding-left: 20rpx;
		background-color: #F9FBFA;
	}
	.ans-jiexi {
		margin-top: 40rpx;
	}
	
	.jiexi-content {
		min-height: 300rpx;
	}
	

</style>
