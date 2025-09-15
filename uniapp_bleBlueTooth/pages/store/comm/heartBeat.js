export class HeartBeatClass {
	// 是否停止
	_isStop = false
	// 乐观锁
	_version = 1
	// 睡眠函数时长
	_sleepTimeStep = 10
	// 信号列表
	_serialList = []
	// 当前信号
	_serial = ''

	constructor(options) {
		this.init(options)
	}

	// 初始化
	init(options) {
		const {
			startSerial,
			sleepTimeStep,
			serialList
		} = options

		this._sleepTimeStep = sleepTimeStep
		if (this.isNotEmptyArr(serialList)) {
			const nList = []
			this._serialList = serialList
			let serial = serialList[0]
			serialList.forEach(item => {
				this.validateSerialItem(item)
				if (item.name === startSerial) {
					serial = item
				}
				nList.push(item)
			})
			this.setTime()
			this._serial = serial
			this._serialList = nList
		}

		this.initEvents()
		this._version = 1
	}

	// 是非空数组
	isNotEmptyArr(arr) {
		return Array.isArray(arr) && arr.length
	}

	// 初始化发布订阅事件
	initEvents() {
		this.eventMap = new Map()
		this.eventMap.set('change', new Set([]))

		this.on = (event, handler) => {
			this.eventMap.get(event).add(handler)
		}

		this.off = (event, handler) => {
			this.eventMap.get(event).delete(handler)
		}

		this.emit = (event) => {
			this.eventMap.get(event).forEach(h => {
				h.call(this, this)
			});
		}
	}

	sleep(time) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(true)
			}, time * 1000);
		})
	}

	// 时间计数， 时间线
	setTime() {
		this.start = Date.now()
		const findItem = this._serialList.find(item => item.name === this._serial)
		const time = findItem?.times || 0
		this.end = this.start + time * 1000
	}

	// 下一个信号
	get next() {
		const findIndex = this._serialList.findIndex(item => item.name === this._serial)
		const nInd = (findIndex + 1) % this._serialList.length
		return this._serialList[nInd]
	}

	// 剩余时间
	get remain() {
		let diff = this.end - Date.now()
		if (diff <= 0) {
			diff = 0
		}
		return diff / 1000
	}

	// 校验信号项
	validateSerialItem(obj) {
		const {
			name,
			times
		} = obj || {}
		const findItem = this._serialList.find(item => item.name === name)
		if (findItem) {
			throw new Error('信号名称重复')
		}

		if (times <= this._sleepTimeStep) {
			throw new Error(`信号间隔时长需要大于${this._sleepTimeStep}s`)
		}
	}

	// 新增信号
	addSerial(item) {
		this.validateSerialItem(item)
		this._serialList.push(item)
	}

	// 移除信号
	removeSerial(name) {
		const findIndex = this._serialList.findIndex(ele => ele.name === name)
		this._serialList.splice(findIndex, 1)
	}

	// 切换信号
	// 这里为什么需要加乐观锁，乐观锁的目的是保持最新的请求，始终是最后一个，当停止/重启的时候，不加乐观锁内会残存额外的递归循环
	async exchange(cVersion) {
		console.log('切换信号', this._version, cVersion)
		if (!this._isStop) {
			let currentVersion = cVersion ? cVersion : ++this._version
			if (this._version === currentVersion) {
				if (this.remain > 0) {
					// 存在剩余时间不切换
					console.log(`当前信号【${this._serial.name}】,剩余时间【${Math.round(this.remain)}】`)
					// this.emit('tick')
					// 我们希望每一秒钟提示一次
					await this.sleep(this._sleepTimeStep)
				} else {
					this._serial = this.next.name
					this.setTime()
					// console.log(`切换信号【${this._serial}】`)
					this.emit('change')
				}
				this.exchange(currentVersion)
			}
		}
	}

	// 停止
	stop() {
		console.log('心跳停止循环=====>')
		this._isStop = true
	}

	// 重启
	reStart() {
		console.log('心跳重启=====>')
		this._isStop = false
		this.exchange()
	}
}

// 单例
export const heartBeatInstance = new HeartBeatClass({
	sleepTimeStep: 10,
	serialList: [{
		name: 'heartBeat',
		times: 60,
		extraData: {}
	}]
})