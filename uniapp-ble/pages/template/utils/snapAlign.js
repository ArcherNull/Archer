/**
 * 拖拽智能参考线 + 吸附对齐
 * 对齐纸张边/中心、页边距、其他元素的边与中心
 */

/** 吸附阈值（px），按当前缩放换算成 mm，缩放时手感一致 */
export var SNAP_THRESHOLD_PX = 6

/**
 * @param {number} pxPerMm
 * @returns {number}
 */
export function snapThresholdMm(pxPerMm) {
	var s = Number(pxPerMm) || 4
	return Math.max(0.4, SNAP_THRESHOLD_PX / s)
}

/**
 * @param {object} opts
 * @param {number} opts.paperW
 * @param {number} opts.paperH
 * @param {number} [opts.marginLeft]
 * @param {number} [opts.marginRight]
 * @param {number} [opts.marginTop]
 * @param {number} [opts.marginBottom]
 * @param {Array} opts.elements
 * @param {string} opts.excludeId
 * @param {function} opts.sizeOf  (el) => { w, h }
 */
export function buildSnapTargets(opts) {
	var paperW = Math.max(1, Number(opts.paperW) || 80)
	var paperH = Math.max(1, Number(opts.paperH) || 100)
	var ml = Math.max(0, Number(opts.marginLeft) || 0)
	var mr = Math.max(0, Number(opts.marginRight) || 0)
	var mt = Math.max(0, Number(opts.marginTop) || 0)
	var mb = Math.max(0, Number(opts.marginBottom) || 0)
	var xs = [0, paperW / 2, paperW]
	var ys = [0, paperH / 2, paperH]
	if (ml > 0) xs.push(ml)
	if (mr > 0) xs.push(paperW - mr)
	if (mt > 0) ys.push(mt)
	if (mb > 0) ys.push(paperH - mb)

	var excludeId = opts.excludeId || ''
	var sizeOf = opts.sizeOf
	var list = opts.elements || []
	for (var i = 0; i < list.length; i++) {
		var el = list[i]
		if (!el || el.id === excludeId) continue
		var size = sizeOf ? sizeOf(el) : { w: Number(el.widthMm) || 0, h: Number(el.heightMm) || 0 }
		var left = Number(el.x) || 0
		var top = Number(el.y) || 0
		var w = Number(size.w) || 0
		var h = Number(size.h) || 0
		var right = left + w
		var bottom = top + h
		xs.push(left, left + w / 2, right)
		ys.push(top, top + h / 2, bottom)
	}

	return {
		xs: uniqSorted(xs),
		ys: uniqSorted(ys),
	}
}

/**
 * 移动时吸附：比较左/中/右、上/中/下
 * @returns {{ x: number, y: number, guides: Array<{ axis: 'v'|'h', pos: number }> }}
 */
export function snapMoveRect(x, y, w, h, targets, thresholdMm) {
	var thr = Number(thresholdMm) || 0.8
	var left = Number(x) || 0
	var top = Number(y) || 0
	var width = Math.max(0, Number(w) || 0)
	var height = Math.max(0, Number(h) || 0)
	var midX = left + width / 2
	var midY = top + height / 2
	var right = left + width
	var bottom = top + height

	var xHit = bestSnap(
		[
			{ value: left, anchor: 'left' },
			{ value: midX, anchor: 'center' },
			{ value: right, anchor: 'right' },
		],
		(targets && targets.xs) || [],
		thr
	)
	var yHit = bestSnap(
		[
			{ value: top, anchor: 'top' },
			{ value: midY, anchor: 'middle' },
			{ value: bottom, anchor: 'bottom' },
		],
		(targets && targets.ys) || [],
		thr
	)

	var nx = left
	var ny = top
	var guides = []

	if (xHit) {
		if (xHit.anchor === 'left') nx = xHit.target
		else if (xHit.anchor === 'center') nx = xHit.target - width / 2
		else nx = xHit.target - width
		guides.push({ axis: 'v', pos: xHit.target })
	}
	if (yHit) {
		if (yHit.anchor === 'top') ny = yHit.target
		else if (yHit.anchor === 'middle') ny = yHit.target - height / 2
		else ny = yHit.target - height
		guides.push({ axis: 'h', pos: yHit.target })
	}

	return {
		x: round1(nx),
		y: round1(ny),
		guides: guides,
	}
}

/**
 * 右下角缩放时吸附：宽/高贴齐其他边
 * @returns {{ w: number, h: number, guides: Array<{ axis: 'v'|'h', pos: number }> }}
 */
export function snapResizeRect(x, y, w, h, targets, thresholdMm) {
	var thr = Number(thresholdMm) || 0.8
	var left = Number(x) || 0
	var top = Number(y) || 0
	var width = Math.max(0, Number(w) || 0)
	var height = Math.max(0, Number(h) || 0)
	var right = left + width
	var bottom = top + height

	var xHit = bestSnap([{ value: right, anchor: 'right' }], (targets && targets.xs) || [], thr)
	var yHit = bestSnap([{ value: bottom, anchor: 'bottom' }], (targets && targets.ys) || [], thr)

	var nw = width
	var nh = height
	var guides = []
	if (xHit) {
		nw = Math.max(2, round1(xHit.target - left))
		guides.push({ axis: 'v', pos: xHit.target })
	}
	if (yHit) {
		nh = Math.max(1, round1(yHit.target - top))
		guides.push({ axis: 'h', pos: yHit.target })
	}
	return { w: nw, h: nh, guides: guides }
}

function bestSnap(candidates, targets, thr) {
	var best = null
	for (var i = 0; i < candidates.length; i++) {
		var c = candidates[i]
		for (var j = 0; j < targets.length; j++) {
			var t = targets[j]
			var d = Math.abs(c.value - t)
			if (d <= thr && (!best || d < best.dist)) {
				best = { dist: d, target: t, anchor: c.anchor }
			}
		}
	}
	return best
}

function uniqSorted(arr) {
	var map = {}
	var out = []
	for (var i = 0; i < arr.length; i++) {
		var v = round1(arr[i])
		var key = String(v)
		if (map[key]) continue
		map[key] = true
		out.push(v)
	}
	out.sort(function (a, b) {
		return a - b
	})
	return out
}

function round1(n) {
	return Math.round(Number(n) * 10) / 10
}
