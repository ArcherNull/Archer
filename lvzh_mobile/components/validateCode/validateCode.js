const app = getApp()
Component({
    data: {

    },
    lifetimes: {
        ready() {
            this.click()
        }
    },
    methods: {
        createNewImg: function () {
            var that = this;
            // 画画布
            wx.createSelectorQuery().in(that)
                .select('#canvas')
                .fields({
                    node: true,
                    size: true,
                })
                .exec(function (res) {
                    const canvas = res[0].node
                    const context = canvas.getContext('2d')
                    const width = res[0].width
                    const height = res[0].height

                    // 取倍率， 1px = 2rpx
                    const dpr = 2
                    // 设置画布宽度/高度
                    canvas.width = width * dpr
                    canvas.height = height * dpr

                    context.scale(dpr, dpr)

                    that.identicalCode().then(res => {
                      console.log('生成的验证码====>', res)
                        app.globalData.validateCode = res
                        that.canvasCode(context, res, width, height)
                    })
                });
        },
        click: function () {
            this.createNewImg()
        },
        /**
         *  生成验证码
         *  length : 验证码长度
         */
        identicalCode: function (length = 4) {
            return new Promise(function (resolve) {
                let code = ''
                const codeLength = length // 验证码的长度
                // 随机数
                const random = [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                    'R',
                    'S',
                    'T',
                    'U',
                    'V',
                    'W',
                    'X',
                    'Y',
                    'Z',
                    'a',
                    'b',
                    'c',
                    'd',
                    'e',
                    'f',
                    'g',
                    'h',
                    'i',
                    'j',
                    'k',
                    'l',
                    'm',
                    'n',
                    'o',
                    'p',
                    'q',
                    'r',
                    's',
                    't',
                    'u',
                    'v',
                    'w',
                    'x',
                    'y',
                    'z'
                ]
                for (let i = 0; i < codeLength; i++) {
                    // 循环操作
                    const index = Math.floor(Math.random() * 62) // 取得随机数的索引（0~52）
                    code += random[index] // 根据索引取得随机数加到code上
                }
                resolve(code)
            })
        },
        /**
         * 绘制验证码图片
         * canvasId 为验证码canvas图片id
         * code验证码上面的文字
         */
        canvasCode: function (cv, code, contentWidth, contentHeight) {
            const fontSizeMin = 25 // 最小字体
            const fontSizeMax = 34 // 最大字体
            // 获取挂载到的DOM的id

            // 创建画布
            cv.textBaseline = 'bottom'
            // 绘制背景
            cv.fillStyle = randomColor(200, 220)
            cv.fillRect(0, 0, contentWidth, contentHeight)
            // 8cv.font = 'italic 700 50px/100px 宋体'
            for (let i = 0; i < code.length; i++) {
                drawText(cv, code[i], i)
            }
            drawLine(cv)
            drawDot(cv)

            // 生成一个随机数
            function randomNum(min, max) {
                return Math.floor(Math.random() * (max - min) + min)
            }
            // 生成一个随机的颜色
            function randomColor(min, max) {
                const r = randomNum(min, max)
                const g = randomNum(min, max)
                const b = randomNum(min, max)
                return 'rgb(' + r + ',' + g + ',' + b + ')'
            }

            function drawText(cv, txt, i) {
                cv.fillStyle = randomColor(50, 160) // 随机生成字体颜色
                cv.font = randomNum(fontSizeMin, fontSizeMax) + 'px SimHei' // 随机生成字体大小
                const x = (i + 1) * (contentWidth / (code.length + 1))
                const y = randomNum(fontSizeMax, contentHeight - 5)
                var deg = randomNum(-30, 30)
                // 修改坐标原点和旋转角度
                cv.translate(x, y)
                cv.rotate((deg * Math.PI) / 180)
                cv.fillText(txt, 0, 0)
                // 恢复坐标原点和旋转角度
                cv.rotate((-deg * Math.PI) / 180)
                cv.translate(-x, -y)
            }

            function drawLine(cv) {
                // 绘制干扰线
                for (let i = 0; i < 4; i++) {
                    cv.strokeStyle = randomColor(100, 200)
                    cv.beginPath()
                    cv.moveTo(randomNum(0, contentWidth), randomNum(0, contentHeight))
                    cv.lineTo(randomNum(0, contentWidth), randomNum(0, contentHeight))
                    cv.stroke()
                }
            }

            function drawDot(cv) {
                // 绘制干扰点
                for (let i = 0; i < 30; i++) {
                    cv.fillStyle = randomColor(0, 255)
                    cv.beginPath()
                    cv.arc(
                        randomNum(0, contentWidth),
                        randomNum(0, contentHeight),
                        1,
                        0,
                        2 * Math.PI
                    )
                    cv.fill()
                }
            }
        },
        // 打包海报
        toSave(canvas) {
            console.log(canvas)
            let that = this
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                canvasId: 'share',
                canvas: canvas,
                width: that.data.widths,
                height: that.data.heights,
                destWidth: that.data.widths * wx.getSystemInfoSync().pixelRatio,
                destHeight: that.data.heights * wx.getSystemInfoSync().pixelRatio,
                success: function (res) {
                    let canvasToTempFilePath = res.tempFilePath // 返回的图片地址保存到一个全局变量里
                    // console.log(res)
                    that.saveShareImg(canvasToTempFilePath)
                },
                fail: function (error) {
                    console.log(error)
                }
            })
        },
    }
})