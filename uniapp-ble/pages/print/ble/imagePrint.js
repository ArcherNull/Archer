/**
 * @file ble/imagePrint.js
 * @desc 图片 → 汉印 / 芝柯 CPCL 位图解析
 *
 * 汉印（HM）：对齐 HPRT demo CPCL(图片) / cpclpicIndex=6
 *   canvas 取像素 → convertToMonoImage → LZO → CGLZO 十六进制包下发
 * 芝柯（CC3）：CPCL EG 明文位图
 *
 * 约束：仅 png/jpg，体积 ≤ 100KB；不做压缩降质
 * 打印尺寸由毫米设定（默认 40×40mm）
 */

import { convertToMonoImage } from '../sdk/HM/util.js'
import { lzo1x } from '../sdk/HM/lzo1x.js'

/** 默认纸宽（点） */
export const DEFAULT_PAGE_WIDTH_DOTS = 576

/** 二值化阈值 */
export const DEFAULT_THRESHOLD = 160

/** 203dpi ≈ 8 dot/mm */
export const DOTS_PER_MM = 8

export const DEFAULT_PRINT_WIDTH_MM = 40
export const DEFAULT_PRINT_HEIGHT_MM = 40

export const MAX_IMAGE_BYTES = 100 * 1024
export const ALLOWED_IMAGE_EXTS = ['png', 'jpg', 'jpeg']

export const STATIC_PRINT_IMAGES = [
	{ key: 'logo', label: 'Logo', path: '/static/logo/logo.png' },
	{ key: 'weChat', label: '微信', path: '/static/logo/weChat.png' },
	{ key: 'ali-pay', label: '支付宝', path: '/static/logo/ali-pay.png' },
	{ key: 'ali-cloud', label: '阿里云', path: '/static/logo/ali-cloud.png' },
	{ key: 'ali-movie', label: '淘票票', path: '/static/logo/ali-movie.png' },
	{ key: 'apple', label: 'Apple', path: '/static/logo/apple.png' },
	{ key: 'huawei', label: '华为', path: '/static/logo/huawei.png' },
	{ key: 'huawei-logo', label: '华为Logo', path: '/static/logo/huawei-logo.png' },
	{ key: 'xiaomi', label: '小米', path: '/static/logo/xiaomi.png' },
	{ key: 'sf-logo', label: '顺丰Logo', path: '/static/logo/sf-logo.png' },
	{ key: 'sf-express', label: '顺丰', path: '/static/logo/sf-express.png' },
	{ key: 'jianshe', label: '建设银行', path: '/static/logo/jianshe.png' },
	{ key: 'longye', label: '农业银行', path: '/static/logo/longye.png' },
]

export function mmToDots(mm, options = {}) {
	const align8 = options.align8 !== false
	const min = options.min != null ? Number(options.min) : 8
	const max = options.max != null ? Number(options.max) : 1200
	let dots = Math.round(Number(mm) * DOTS_PER_MM)
	if (isNaN(dots) || dots < min) dots = min
	if (dots > max) dots = max
	if (align8) {
		dots = Math.floor(dots / 8) * 8
		if (dots < 8) dots = 8
	}
	return dots
}

export function calcPrintSizeByMm(widthMm, heightMm) {
	const wMm = Number(widthMm)
	const hMm = Number(heightMm)
	const width = mmToDots(isNaN(wMm) || wMm <= 0 ? DEFAULT_PRINT_WIDTH_MM : wMm, {
		max: DEFAULT_PAGE_WIDTH_DOTS,
	})
	const height = mmToDots(isNaN(hMm) || hMm <= 0 ? DEFAULT_PRINT_HEIGHT_MM : hMm, {
		align8: false,
		min: 8,
		max: 1600,
	})
	return {
		width: width,
		height: height,
		widthMm: width / DOTS_PER_MM,
		heightMm: height / DOTS_PER_MM,
	}
}

export function getImageExt(path) {
	const s = String(path || '').split('?')[0].split('#')[0]
	const name = s.substring(s.lastIndexOf('/') + 1)
	const dot = name.lastIndexOf('.')
	if (dot < 0) return ''
	return name.substring(dot + 1).toLowerCase()
}

export function isAllowedImageType(path) {
	return ALLOWED_IMAGE_EXTS.indexOf(getImageExt(path)) !== -1
}

export function getFileSizeAsync(path) {
	return new Promise(function (resolve) {
		if (!path || typeof uni.getFileInfo !== 'function') {
			resolve(0)
			return
		}
		uni.getFileInfo({
			filePath: path,
			success: function (res) {
				resolve(Number(res && res.size) || 0)
			},
			fail: function () {
				resolve(0)
			},
		})
	})
}

export async function validatePrintImage(path) {
	if (!path) throw new Error('请选择图片')
	if (!isAllowedImageType(path)) throw new Error('仅支持 png / jpg 格式')
	const size = await getFileSizeAsync(path)
	if (size > MAX_IMAGE_BYTES) {
		throw new Error('图片不能超过 100KB（当前约 ' + Math.ceil(size / 1024) + 'KB）')
	}
	return { path: path, size: size, ext: getImageExt(path) }
}

export function rgbaToEgBitmap(imageData, options = {}) {
	const width = Math.max(0, Number(imageData && imageData.width) || 0)
	const height = Math.max(0, Number(imageData && imageData.height) || 0)
	const data = (imageData && imageData.data) || []
	const threshold = Number(options.threshold)
	const th = isNaN(threshold) ? DEFAULT_THRESHOLD : Math.max(0, Math.min(255, threshold))

	if (!width || !height || !data.length) {
		return {
			hex: '',
			byteWidth: 0,
			width: 0,
			height: 0,
			bytes: new Uint8Array(0),
			blackCount: 0,
			pixelCount: 0,
		}
	}

	const alignedW = Math.ceil(width / 8) * 8
	const byteWidth = alignedW / 8
	const bytes = new Uint8Array(byteWidth * height)
	let blackCount = 0
	const pixelCount = width * height

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < alignedW; x++) {
			let black = false
			if (x < width) {
				const i = (y * width + x) * 4
				const r = data[i] || 0
				const g = data[i + 1] || 0
				const b = data[i + 2] || 0
				const aRaw = data[i + 3]
				const alpha = aRaw == null ? 255 : aRaw
				if (alpha >= 8) {
					const gray = r * 0.299 + g * 0.587 + b * 0.114
					black = gray < th
				}
			}
			if (black) {
				bytes[y * byteWidth + (x >> 3)] |= 0x80 >> (x & 7)
				blackCount += 1
			}
		}
	}

	let hex = ''
	for (let i = 0; i < bytes.length; i++) {
		const h = bytes[i].toString(16).toUpperCase()
		hex += h.length < 2 ? '0' + h : h
	}

	return {
		hex: hex,
		byteWidth: byteWidth,
		width: alignedW,
		height: height,
		bytes: bytes,
		blackCount: blackCount,
		pixelCount: pixelCount,
	}
}

/** 字符 → 空格分隔 ASCII 十六进制（对齐 HPRT stringToHex） */
function stringToHex(str) {
	let val = ''
	const s = String(str == null ? '' : str)
	for (let i = 0; i < s.length; i++) {
		const h = s.charCodeAt(i).toString(16)
		val = val === '' ? h : val + ' ' + h
	}
	return val
}

function arrayBuffer2Hex(buffer) {
	return Array.prototype.map
		.call(new Uint8Array(buffer), function (bit) {
			return ('00' + bit.toString(16)).slice(-2)
		})
		.join(' ')
}

/**
 * LZO 压缩单色位图 → 空格分隔 hex（对齐 HPRT doCompression）
 */
export function compressMonoToHex(byteArray) {
	const input = byteArray instanceof Uint8Array ? byteArray : new Uint8Array(byteArray || [])
	const state = {
		inputBuffer: input,
		outputBuffer: new Uint8Array(4),
	}
	lzo1x.compress(state)
	return arrayBuffer2Hex(state.outputBuffer)
}

/**
 * 汉印 CPCL(图片)：CGLZO + LZO 数据，整包为「空格分隔十六进制」
 * 对齐 HPRT demo cutCpclImage（cIndex=6）
 */
export function buildHmCpclImageHex(canvasWidth, canvasHeight, dataHex) {
	const w = Math.max(1, Number(canvasWidth) || 0)
	const h = Math.max(1, Number(canvasHeight) || 0)
	const hex = String(dataHex || '')
		.replace(/\s+/g, ' ')
		.trim()
	if (!hex) return ''

	const byte = stringToHex(String(parseInt(Number(w + 7) / 8, 10)))
	const height = stringToHex(String(h))
	const length = stringToHex(String(hex.split(/\s/g).filter(Boolean).length))

	// 与 HPRT demo cutCpclImage 中 start / end 混淆串一致，解码为：
	// ! 0 200 200 {h} 1\r\nCGLZO {byteW} {h} 0 0 {len}\r\n + data + \r\nFORM\r\nPRINT
	const start =
		'\x2002\x2003\x2003\x2023\x2002\x2003\x2003\x2023\x2002\x2003\x2002\x2012'
			.split('')
			.reverse()
			.join('') +
		height +
		'\x2002\x20F4\x20A5\x20C4\x2074\x2034\x20A0\x20D0\x2013\x2002\x20'
			.split('')
			.reverse()
			.join('') +
		byte +
		' 02 '.split('').reverse().join('') +
		height +
		'\x2002\x2003\x2002\x2003\x2002\x20'.split('').reverse().join('') +
		length +
		'\x20A0\x20D0\x20'.split('').reverse().join('')
	const end = '\x200D\x200A\x2046\x204F\x2052\x204D\x200D\x200A\x2050\x2052\x2049\x204E\x2054'
	return (start + hex + end).replace(/\s+/g, ' ').trim()
}

/**
 * 判断是否为汉印图片下发用的空格分隔 hex 包（非明文 CPCL）
 */
export function isHmImageHexPayload(str) {
	const s = String(str || '').trim()
	if (!s || s.charAt(0) === '!') return false
	return /^[0-9a-fA-F]{2}(\s+[0-9a-fA-F]{2}){8,}$/.test(s)
}

/**
 * 芝柯等：CPCL EG 明文
 * EG {byteWidth} {height} {x} {y} {hexData}
 */
export function buildImageCpcl(options = {}) {
	const hex = String(options.hex || '').replace(/\s+/g, '')
	const byteWidth = Math.max(0, Number(options.byteWidth) || 0)
	const height = Math.max(0, Number(options.height) || 0)
	const pageWidth = Math.max(8, Number(options.pageWidth) || DEFAULT_PAGE_WIDTH_DOTS)
	const x = Math.max(0, Number(options.x) || 0)
	const y = Math.max(0, Number(options.y) || 0)
	const brand = String(options.brand || '').toUpperCase()
	const isCc3 = brand === 'CC3' || brand === 'K319'
	const useGapSense =
		options.useGapSense != null ? !!options.useGapSense : false

	if (!hex || !byteWidth || !height) return ''

	const labelHeight = Math.max(height + y + 16, 48)
	const lines = []
	lines.push('! 0 200 200 ' + labelHeight + ' 1')
	lines.push('PAGE-WIDTH ' + pageWidth)
	lines.push('EG ' + byteWidth + ' ' + height + ' ' + x + ' ' + y + ' ' + hex)
	if (!isCc3 && useGapSense) {
		lines.push('GAP-SENSE')
		lines.push('FORM')
	} else {
		lines.push('FORM')
	}
	lines.push('PRINT')
	return lines.join('\r\n') + '\r\n'
}

export function getImageInfoAsync(src) {
	return new Promise(function (resolve, reject) {
		uni.getImageInfo({
			src: src,
			success: function (res) {
				resolve({
					width: Number(res.width) || 0,
					height: Number(res.height) || 0,
					path: res.path || src,
				})
			},
			fail: function (err) {
				const msg = (err && (err.errMsg || err.message)) || '获取图片信息失败'
				reject(new Error(msg + '（' + src + '）'))
			},
		})
	})
}

export async function resolveDrawableImagePath(src) {
	const raw = String(src || '')
	if (!raw) throw new Error('缺少图片路径')
	const candidates = [raw]
	if (raw.indexOf('/static/') === 0) candidates.push(raw.replace(/^\//, ''))
	if (raw.indexOf('static/') === 0) candidates.push('/' + raw)

	let lastErr = null
	for (let i = 0; i < candidates.length; i++) {
		try {
			const info = await getImageInfoAsync(candidates[i])
			return {
				drawPath: info.path || candidates[i],
				width: info.width,
				height: info.height,
				src: raw,
			}
		} catch (e) {
			lastErr = e
		}
	}
	throw lastErr || new Error('无法解析图片路径')
}

/**
 * 包内 /static 资源复制到可读写临时路径，避免离屏 createImage 加载失败
 */
export async function materializeLocalImagePath(src) {
	const raw = String(src || '')
	if (!raw) return raw
	const isStatic = /\/?static\//.test(raw) || raw.indexOf('_www') !== -1
	if (!isStatic) return raw

	const ext = getImageExt(raw) || 'png'
	const stamp = Date.now()

	// App-Plus：_www → _doc
	try {
		if (typeof plus !== 'undefined' && plus.io) {
			const rel = raw.replace(/^\//, '')
			const wwwPath = rel.indexOf('_www') === 0 ? rel : '_www/' + rel
			const destName = 'print_img_' + stamp + '.' + ext
			const destRel = '_doc/' + destName
			await new Promise(function (resolve, reject) {
				plus.io.resolveLocalFileSystemURL(
					wwwPath,
					function (entry) {
						plus.io.resolveLocalFileSystemURL(
							'_doc/',
							function (dir) {
								entry.copyTo(
									dir,
									destName,
									function () {
										resolve()
									},
									function (err) {
										reject(err || new Error('copyTo 失败'))
									}
								)
							},
							reject
						)
					},
					reject
				)
			})
			if (typeof plus.io.convertLocalFileSystemURL === 'function') {
				return plus.io.convertLocalFileSystemURL(destRel)
			}
			return destRel
		}
	} catch (e) {
		console.warn('[materializeLocalImagePath] plus', e)
	}

	// 小程序：复制到 USER_DATA_PATH
	try {
		const fs =
			typeof uni.getFileSystemManager === 'function' ? uni.getFileSystemManager() : null
		const userPath =
			(typeof wx !== 'undefined' && wx.env && wx.env.USER_DATA_PATH) ||
			(typeof uni !== 'undefined' && uni.env && uni.env.USER_DATA_PATH) ||
			''
		if (fs && userPath) {
			const dest = userPath + '/print_img_' + stamp + '.' + ext
			const tryPaths = [raw, raw.replace(/^\//, ''), '/' + raw.replace(/^\//, '')]
			for (let i = 0; i < tryPaths.length; i++) {
				const from = tryPaths[i]
				try {
					await new Promise(function (resolve, reject) {
						fs.copyFile({
							srcPath: from,
							destPath: dest,
							success: resolve,
							fail: reject,
						})
					})
					return dest
				} catch (e1) {
					try {
						const data = await new Promise(function (resolve, reject) {
							fs.readFile({
								filePath: from,
								success: function (res) {
									resolve(res.data)
								},
								fail: reject,
							})
						})
						await new Promise(function (resolve, reject) {
							fs.writeFile({
								filePath: dest,
								data: data,
								success: resolve,
								fail: reject,
							})
						})
						return dest
					} catch (e2) {
						/* try next */
					}
				}
			}
		}
	} catch (e) {
		console.warn('[materializeLocalImagePath] fs', e)
	}

	return raw
}

function sleep(ms) {
	return new Promise(function (resolve) {
		setTimeout(resolve, Math.max(0, ms || 0))
	})
}

function invertRgbaImageData(imageData) {
	const width = Number(imageData.width) || 0
	const height = Number(imageData.height) || 0
	const src = imageData.data || []
	const data = new Uint8ClampedArray(src.length)
	for (let i = 0; i < src.length; i += 4) {
		data[i] = 255 - (src[i] || 0)
		data[i + 1] = 255 - (src[i + 1] || 0)
		data[i + 2] = 255 - (src[i + 2] || 0)
		data[i + 3] = src[i + 3] == null ? 255 : src[i + 3]
	}
	return { width: width, height: height, data: data }
}

function getCreateOffscreenCanvas() {
	if (typeof uni !== 'undefined' && typeof uni.createOffscreenCanvas === 'function') {
		return uni.createOffscreenCanvas.bind(uni)
	}
	// #ifdef MP-WEIXIN
	if (typeof wx !== 'undefined' && typeof wx.createOffscreenCanvas === 'function') {
		return wx.createOffscreenCanvas.bind(wx)
	}
	// #endif
	if (typeof wx !== 'undefined' && typeof wx.createOffscreenCanvas === 'function') {
		return wx.createOffscreenCanvas.bind(wx)
	}
	return null
}

/**
 * 优先：离屏 Canvas 2d 取像素（不占页面、不受旧 canvas-id 白板影响）
 */
function loadPixelsViaOffscreen(drawPath, drawW, drawH) {
	const createOffscreen = getCreateOffscreenCanvas()
	if (!createOffscreen) {
		return Promise.reject(new Error('当前环境不支持离屏 Canvas'))
	}

	return new Promise(function (resolve, reject) {
		try {
			const canvas = createOffscreen({
				type: '2d',
				width: drawW,
				height: drawH,
			})
			if (!canvas) {
				reject(new Error('创建离屏 Canvas 失败'))
				return
			}
			canvas.width = drawW
			canvas.height = drawH
			const ctx = canvas.getContext('2d')
			if (!ctx || typeof canvas.createImage !== 'function') {
				reject(new Error('离屏 Canvas 上下文不可用'))
				return
			}
			const img = canvas.createImage()
			img.onload = function () {
				try {
					ctx.fillStyle = '#FFFFFF'
					ctx.fillRect(0, 0, drawW, drawH)
					ctx.drawImage(img, 0, 0, drawW, drawH)
					const imageData = ctx.getImageData(0, 0, drawW, drawH)
					if (!imageData || !imageData.data || !imageData.data.length) {
						reject(new Error('离屏取像素为空'))
						return
					}
					resolve(imageData)
				} catch (e) {
					reject(e instanceof Error ? e : new Error('离屏取像素失败'))
				}
			}
			img.onerror = function () {
				reject(new Error('离屏加载图片失败'))
			}
			img.src = drawPath
		} catch (e) {
			reject(e instanceof Error ? e : new Error('离屏 Canvas 异常'))
		}
	})
}

/**
 * H5：用 DOM canvas 取像素
 */
function loadPixelsViaDomCanvas(drawPath, drawW, drawH) {
	return new Promise(function (resolve, reject) {
		if (typeof document === 'undefined') {
			reject(new Error('非 H5 环境'))
			return
		}
		const img = new Image()
		img.crossOrigin = 'anonymous'
		img.onload = function () {
			try {
				const canvas = document.createElement('canvas')
				canvas.width = drawW
				canvas.height = drawH
				const ctx = canvas.getContext('2d')
				ctx.fillStyle = '#FFFFFF'
				ctx.fillRect(0, 0, drawW, drawH)
				ctx.drawImage(img, 0, 0, drawW, drawH)
				resolve(ctx.getImageData(0, 0, drawW, drawH))
			} catch (e) {
				reject(e instanceof Error ? e : new Error('H5 取像素失败'))
			}
		}
		img.onerror = function () {
			reject(new Error('H5 加载图片失败'))
		}
		img.src = drawPath
	})
}

/**
 * 回退：页面旧版 canvas-id（需传入 canvasId + component）
 * 对齐 bluetooth-print-master：draw 后延时再 getImageData
 */
function loadPixelsViaPageCanvas(drawPath, drawW, drawH, canvasId, component) {
	return new Promise(function (resolve, reject) {
		if (!canvasId) {
			reject(new Error('缺少页面 canvasId'))
			return
		}
		try {
			const ctx = uni.createCanvasContext(canvasId, component)
			ctx.setFillStyle('#FFFFFF')
			ctx.clearRect(0, 0, drawW, drawH)
			ctx.fillRect(0, 0, drawW, drawH)
			ctx.drawImage(drawPath, 0, 0, drawW, drawH)
			ctx.draw(false, function () {
				setTimeout(function () {
					const opts = {
						canvasId: canvasId,
						x: 0,
						y: 0,
						width: drawW,
						height: drawH,
						success: function (res) {
							if (!res || !res.data || !res.data.length) {
								reject(new Error('页面 canvas 取像素为空'))
								return
							}
							resolve(res)
						},
						fail: function (err) {
							reject(
								new Error(
									(err && (err.errMsg || err.message)) || '页面 canvas 取像素失败'
								)
							)
						},
					}
					if (component) {
						uni.canvasGetImageData(opts, component)
					} else {
						uni.canvasGetImageData(opts)
					}
				}, 800)
			})
		} catch (e) {
			reject(e instanceof Error ? e : new Error('页面 canvas 绘制失败'))
		}
	})
}

/**
 * 统一取像素：materialize → 离屏 → H5 → 页面 canvas
 */
export async function loadImagePixels(src, drawW, drawH, options = {}) {
	const materialized = await materializeLocalImagePath(src)
	const resolved = await resolveDrawableImagePath(materialized)
	const path = resolved.drawPath
	const errors = []

	try {
		return {
			imageData: await loadPixelsViaOffscreen(path, drawW, drawH),
			drawPath: path,
			method: 'offscreen',
		}
	} catch (e1) {
		errors.push('offscreen: ' + ((e1 && e1.message) || e1))
	}

	try {
		return {
			imageData: await loadPixelsViaDomCanvas(path, drawW, drawH),
			drawPath: path,
			method: 'h5',
		}
	} catch (e2) {
		errors.push('h5: ' + ((e2 && e2.message) || e2))
	}

	if (options.canvasId) {
		try {
			return {
				imageData: await loadPixelsViaPageCanvas(
					path,
					drawW,
					drawH,
					options.canvasId,
					options.component
				),
				drawPath: path,
				method: 'page-canvas',
			}
		} catch (e3) {
			errors.push('page: ' + ((e3 && e3.message) || e3))
		}
		if (path !== src) {
			try {
				return {
					imageData: await loadPixelsViaPageCanvas(
						src,
						drawW,
						drawH,
						options.canvasId,
						options.component
					),
					drawPath: src,
					method: 'page-canvas-src',
				}
			} catch (e4) {
				errors.push('page-src: ' + ((e4 && e4.message) || e4))
			}
		}
	}

	throw new Error('图片取像素失败：' + errors.join(' | '))
}

/**
 * 图片 → EG 位图数据（可嵌入模板 CPCL，不包整页）
 * 与 imagePathToCpcl 芝柯分支同源：canvas 取像素 → 二值化 → EG hex
 */
export async function imagePathToEgBitmap(src, options = {}) {
	if (!src) throw new Error('缺少图片路径')
	if (!options.skipValidate && !/\/?static\//.test(String(src))) {
		await validatePrintImage(src)
	}

	let threshold =
		options.threshold != null ? Number(options.threshold) : DEFAULT_THRESHOLD

	const size = calcPrintSizeByMm(
		options.widthMm != null ? options.widthMm : DEFAULT_PRINT_WIDTH_MM,
		options.heightMm != null ? options.heightMm : DEFAULT_PRINT_HEIGHT_MM
	)
	const drawW = size.width
	const drawH = size.height

	const loaded = await loadImagePixels(src, drawW, drawH, {
		canvasId: options.canvasId,
		component: options.component,
	})
	let imgData = loaded.imageData

	let bmp = rgbaToEgBitmap(imgData, { threshold: threshold })
	let ratio = bmp.pixelCount ? bmp.blackCount / bmp.pixelCount : 0
	if (bmp.hex && ratio < 0.02 && threshold < 220) {
		threshold = Math.min(220, threshold + 40)
		bmp = rgbaToEgBitmap(imgData, { threshold: threshold })
		ratio = bmp.pixelCount ? bmp.blackCount / bmp.pixelCount : 0
	}
	if (bmp.hex && ratio > 0.92) {
		imgData = invertRgbaImageData(imgData)
		bmp = rgbaToEgBitmap(imgData, { threshold: DEFAULT_THRESHOLD })
		ratio = bmp.pixelCount ? bmp.blackCount / bmp.pixelCount : 0
	}
	if (!bmp.hex) throw new Error('图片解析结果为空')
	const blackRatio = bmp.pixelCount ? bmp.blackCount / bmp.pixelCount : 0
	if (blackRatio < 0.001) {
		throw new Error('图片解析为空白，请换对比度更高的图')
	}

	return {
		hex: bmp.hex,
		byteWidth: bmp.byteWidth,
		width: bmp.width,
		height: bmp.height,
		printWidth: drawW,
		printHeight: drawH,
		printWidthMm: size.widthMm,
		printHeightMm: size.heightMm,
		blackRatio: blackRatio,
		method: loaded.method,
		previewPath: loaded.drawPath,
	}
}

/**
 * 图片 → 打印指令
 * - HM：HPRT CGLZO + LZO（dataFormat=hex）
 * - 其它：CPCL EG 明文
 */
export async function imagePathToCpcl(src, options = {}) {
	if (!src) throw new Error('缺少图片路径')
	if (!options.skipValidate && !/\/?static\//.test(String(src))) {
		await validatePrintImage(src)
	}

	const pageWidth = Number(options.pageWidth) || DEFAULT_PAGE_WIDTH_DOTS
	const brand = String(options.brand || '').toUpperCase()
	const x = Number(options.x) || 0
	const y = Number(options.y) || 0

	const size = calcPrintSizeByMm(
		options.widthMm != null ? options.widthMm : DEFAULT_PRINT_WIDTH_MM,
		options.heightMm != null ? options.heightMm : DEFAULT_PRINT_HEIGHT_MM
	)
	const drawW = size.width
	const drawH = size.height

	// —— 汉印：对齐 HPRT demo drawCanvas → convertToMonoImage → LZO → cutCpclImage ——
	if (brand === 'HM') {
		const loaded = await loadImagePixels(src, drawW, drawH, {
			canvasId: options.canvasId,
			component: options.component,
		})
		const mono = convertToMonoImage(loaded.imageData)
		if (!mono || !mono.length) throw new Error('汉印单色位图转换失败')
		const dataHex = compressMonoToHex(new Uint8Array(mono))
		if (!dataHex) throw new Error('汉印 LZO 压缩失败')
		const cpcl = buildHmCpclImageHex(drawW, drawH, dataHex)
		if (!cpcl) throw new Error('汉印 CGLZO 指令生成失败')
		const byteWidth = parseInt(Number(drawW + 7) / 8, 10)
		return {
			cpcl: cpcl,
			dataFormat: 'hex',
			previewPath: loaded.drawPath,
			printWidth: drawW,
			printHeight: drawH,
			printWidthMm: size.widthMm,
			printHeightMm: size.heightMm,
			byteWidth: byteWidth,
			hexLength: dataHex.split(/\s/g).filter(Boolean).length,
			blackRatio: 0,
			method: loaded.method + '+cglzo',
		}
	}

	// —— 芝柯等：EG 明文整页 ——
	const bmp = await imagePathToEgBitmap(src, options)
	const cpcl = buildImageCpcl({
		hex: bmp.hex,
		byteWidth: bmp.byteWidth,
		height: bmp.height,
		pageWidth: pageWidth,
		x: x,
		y: y,
		brand: brand,
		useGapSense: options.useGapSense,
	})
	if (!cpcl) throw new Error('CPCL 指令生成失败')

	return {
		cpcl: cpcl,
		dataFormat: 'text',
		previewPath: bmp.previewPath,
		printWidth: bmp.printWidth,
		printHeight: bmp.printHeight,
		printWidthMm: bmp.printWidthMm,
		printHeightMm: bmp.printHeightMm,
		byteWidth: bmp.byteWidth,
		hexLength: bmp.hex.length,
		blackRatio: bmp.blackRatio,
		method: bmp.method,
	}
}

export function choosePrintImage() {
	return new Promise(function (resolve, reject) {
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: function (res) {
				const path =
					(res.tempFilePaths && res.tempFilePaths[0]) ||
					(res.tempFiles && res.tempFiles[0] && res.tempFiles[0].path) ||
					''
				if (!path) {
					reject(new Error('未选择到图片'))
					return
				}
				validatePrintImage(path).then(function () {
					resolve(path)
				}, reject)
			},
			fail: function (err) {
				reject(err || new Error('选择图片失败'))
			},
		})
	})
}

// 兼容旧导出名
export function canvasGetImageDataAsync() {
	return Promise.reject(new Error('请改用 loadImagePixels / imagePathToCpcl'))
}
