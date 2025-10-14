export class HeartBeatClass {
	// 是否停止
	_isStop = false
	// 乐观锁
	_version = 1

	constructor(options) {
		this.init(options)
	}

	// 初始化
	init(options) {
		const {
			init,
			serial = [],
			times = [],
		} = options
		if (serial?.length) {
			this.sig = init
			this.times = times
			this.serial = serial

			// 发布订阅模式
			this.eventMap = new Map()
			this.eventMap.set('tick', new Set([]))
			this.eventMap.set('change', new Set([]))

			this.setTime()
			this._version = 1


		} else {
			throw new Error('[serial]信号不能为空数组')
		}
	}

	on(event, handler) {
		this.eventMap.get(event).add(handler)
	}

	off(event, handler) {
		this.eventMap.get(event).delete(handler)
	}

	emit(event) {
		this.eventMap.get(event).forEach(h => {
			h.call(this, this)
		});
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
		const time = this.times[this.serial.indexOf(this.sig)]
		this.end = this.start + time * 1000
	}

	// 下一个信号
	get next() {
		return this.serial[(this.serial.indexOf(this.sig) + 1) % this.serial.length]
	}

	// 剩余时间
	get remain() {
		let diff = this.end - Date.now()
		if (diff <= 0) {
			diff = 0
		}
		return diff / 1000
	}

	// 切换信号
	// 这里为什么需要加乐观锁，乐观锁的目的是保持最新的请求，始终是最后一个，当停止/重启的时候，不加乐观锁内会残存额外的递归循环
	async exchange(cVersion) {
		// console.log('切换信号', this._version, cVersion)
		if (!this._isStop) {
			let currentVersion = cVersion ? cVersion : ++this._version
			if (this._version === currentVersion) {
				if (this.remain > 0) {
					// 存在剩余时间不切换
					console.log(`当前信号【${this.sig}】,剩余时间【${Math.round(this.remain)}】`)
					this.emit('tick')
					// 我们希望每一秒钟提示一次
					await this.sleep(10)
				} else {
					this.sig = this.next
					this.setTime()
					// console.log(`切换信号【${this.sig}】`)
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
	init: 'heartBeat',
	times: [60],
	serial: ['heartBeat']
})