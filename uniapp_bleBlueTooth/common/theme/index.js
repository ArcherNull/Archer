import CONFIG from '@/common/config/index.js'

const {
	APP_THEME_COLOR,
	APP_ROOT_FONT_SIZE
} = CONFIG

// 获取基于根元素计算得出的尺寸大小
const getFontSize = (fontSize, unit = 'rpx') => {
	const rootFontSize = fontSize || '14px'
	const str = rootFontSize.toString().replace(/px$/, '')
	const baseNum = Number(str) || 14
	let ratio = 2
	let nUnit = 'rpx'
	if (['rpx', 'px'].includes(unit)) {
		ratio = unit === 'rpx' ? 2 : 1
		nUnit = unit
	}

	let fm, fSm, fBase, fLg, fTitle, fSubTitle, fParagraph, imgSm, imgBase, imgLg

	fm = `${(baseNum - 4) * ratio}${nUnit}`
	fSm = `${(baseNum - 2) * ratio}${nUnit}`
	fBase = `${baseNum * ratio}${nUnit}`
	fLg = `${(baseNum + 2) * ratio}${nUnit}`

	// 文章类
	fTitle = `${(baseNum + 6) * ratio}${nUnit}`
	fSubTitle = `${(baseNum - 1) * ratio}${nUnit}`
	fParagraph = `${(baseNum + 1) * ratio}${nUnit}`

	// 图片
	imgSm = `${baseNum * 1.5 * ratio}${nUnit}`
	imgBase = `${baseNum * 2 * ratio}${nUnit}`
	imgLg = `${baseNum * 2.5 * ratio}${nUnit}`

	return {
		fm,
		fSm,
		fBase,
		fLg,
		fTitle,
		fSubTitle,
		fParagraph,
		imgSm,
		imgBase,
		imgLg
	}
}

// 获取主题
const getThemeStyle = (options = {}) => {
	const {
		fontSize: foSize,
		unit: foUnit,
		themeCode: tCode,
		themeColor: tColor = APP_THEME_COLOR,
	} = options

	let fontSize = foSize ? foSize : APP_ROOT_FONT_SIZE
	let unit = ['rpx', 'px'].includes(foUnit) ? foUnit : 'px'

	const {
		fm,
		fSm,
		fBase,
		fLg,
		fTitle,
		fSubTitle,
		fParagraph,
		imgSm,
		imgBase,
		imgLg
	} = getFontSize(fontSize, unit)

	const commonVariable = `
		--uni-font-size-m:${fm};
		--uni-font-size-sm:${fSm};
		--uni-font-size-base:${fBase};
		--uni-font-size-lg:${fLg};
		
		--uni-img-size-sm:${imgSm};
		--uni-img-size-base:${imgBase};
		--uni-img-size-lg:${imgLg};
		
		--uni-font-size-title:${fTitle};
		--uni-font-size-subtitle:${fSubTitle};
		--uni-font-size-paragraph:${fParagraph};
	`

	const tStyle = {
		"light": {
			name: '明亮',
			variable: `
				   --uni-color-primary: ${tColor};
				   --uni-color-success: #4cd964;
				   --uni-color-warning: #f0ad4e;
				   --uni-color-error: #dd524d;
				   
				   --uni-text-color:#333;
				   --uni-text-color-inverse:#fff;
				   --uni-text-color-grey:#999;
				   --uni-text-color-placeholder: #808080;
				   --uni-text-color-disable:#c0c0c0;
				   
				   --uni-button-color:#333;
				   --uni-button-bg-color:#fff;
				   
				   --uni-bg-color:#ffffff;
				   --uni-bg-color-grey:#f8f8f8;
				   --uni-bg-color-hover:#f1f1f1;
				   --uni-bg-color-mask:rgba(0, 0, 0, 0.4);
				   
				   --uni-border-color:#c8c7cc;
				   
				   
				   --uni-border-radius-sm: 2rpx;
				   --uni-border-radius-base: 3rpx;
				   --uni-border-radius-lg: 6rpx;
				   --uni-border-radius-circle: 50%;
				   
				   --uni-spacing-row-sm: 5rpx;
				   --uni-spacing-row-base: 10rpx;
				   --uni-spacing-row-lg: 15rpx;
				   
				   --uni-spacing-col-sm: 4px;
				   --uni-spacing-col-base: 8px;
				   --uni-spacing-col-lg: 12px;
				   
				   --uni-opacity-disabled: 0.3; 
				   
				   --uni-color-title: #2C405A; 
				   --uni-color-subtitle: #555555; 
				   --uni-color-paragraph: #3F536E; 
			` + commonVariable,
			// 导航栏样式
			navBar: {
				frontColor: '#000000',
				backgroundColor: '#ffffff'
			},
			// tabbar样式
			tabBar: {
				color: '#333',
				selectedColor: '#0BB640',
				backgroundColor: '#ffffff',
				borderStyle: 'white'
			},
			// 自定义tabbar
			customerTabBar: {
				color: '#333',
				selectedColor: '#0BB640',
				backgroundColor: '#ffffff',
				borderStyle: 'white'
			},
			// 与主题相对应的图片列表
			imageList: {
				navbar_backHome: '/static/theme/light/navbar_backHome.png'
			}
		},
		"dark": {
			name: '暗黑',
			variable: `
					   --uni-color-primary: ${tColor};
					   --uni-color-success: #4cd964;
					   --uni-color-warning: #f0ad4e;
					   --uni-color-error: #dd524d;
					   
					   --uni-text-color:#fff;
					   --uni-text-color-inverse:#fff;
					   --uni-text-color-grey:#f8f8f8;
					   --uni-text-color-placeholder: #808080;
					   --uni-text-color-disable:#c0c0c0;
					   
					   --uni-button-color:#333;
					   --uni-button-bg-color:#fff;
					   
					   --uni-bg-color:#333333;
					   --uni-bg-color-grey:#f8f8f8;
					   --uni-bg-color-hover:#f1f1f1;
					   --uni-bg-color-mask:rgba(0, 0, 0, 0.4);
					   
					   --uni-border-color:#f1f1f1;
				   
				       --uni-border-radius-sm: 2rpx;
				       --uni-border-radius-base: 3rpx;
				       --uni-border-radius-lg: 6rpx;
				       --uni-border-radius-circle: 50%;
					   
					   --uni-spacing-row-sm: 5px;
					   --uni-spacing-row-base: 10px;
					   --uni-spacing-row-lg: 15px;
					   
					   --uni-spacing-col-sm: 4px;
					   --uni-spacing-col-base: 8px;
					   --uni-spacing-col-lg: 12px;
					   
					   --uni-opacity-disabled: 0.3; 
					   
					   --uni-color-title: #2C405A; 
					   --uni-color-subtitle: #555555; 
					   --uni-color-paragraph: #3F536E; 
				` + commonVariable,
			navBar: {
				frontColor: '#ffffff',
				backgroundColor: '#333333'
			},
			tabBar: {
				color: '#ffffff',
				selectedColor: '#0BB640',
				backgroundColor: '#333333',
				borderStyle: 'black'
			},
			// 自定义tabbar
			customerTabBar: {
				color: '#333',
				selectedColor: '#0BB640',
				backgroundColor: '#ffffff',
				borderStyle: 'white'
			},
			// 与主题相对应的图片列表
			imageList: {
				navbar_backHome: '/static/theme/dark/navbar_backHome.png'
			}
		}
	}

	const themeList = Object.keys(tStyle)
	let nTCode = themeList.includes(tCode) ? tCode : themeList[0]
	let themeObj = tStyle[nTCode]

	const themeOptions = []
	const themeCodeList = []
	themeList.forEach(ele => {
		const tItem = tStyle[ele]
		const item = {
			label: tItem.name,
			value: ele
		}
		themeCodeList.push(ele)
		themeOptions.push(item)
	})

	return {
		themeStyle: tStyle,
		themeName: themeObj?.name,
		themeCode: nTCode,
		themeColor: tColor,
		themeVariable: themeObj?.variable,
		themeList: {
			themeOptions,
			themeCodeList
		}

	}
}

const themeObj = getThemeStyle()


export default {
	getFontSize,
	getThemeStyle,
	...themeObj
}