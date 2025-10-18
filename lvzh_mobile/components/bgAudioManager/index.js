const bgMusic = wx.getBackgroundAudioManager()

Component({
    data: {
        isOpen: false, //播放开关
        starttime: '00:00', //正在播放时长
        duration: '00:00', //总时长
        src: '', // 当前音频的src地址
        isPlay: false, // 是否播放了
    },
    methods: {
        listenerButtonPlay: function () {
            var that = this
            if (!this.data.isPlay) {
                // ！！！ ios 播放时必须加title 不然会报错导致音乐不播放
                // 这块的值需要自己替换哦
                bgMusic.title = '我是音频'
                bgMusic.epname = '我是音频'
                bgMusic.src = '我是一个音频链接'
                bgMusic.coverImgUrl = '我是一个音频背景图'
            }

            bgMusic.onTimeUpdate(() => {
                //bgMusic.duration总时长  bgMusic.currentTime当前进度
                var duration = bgMusic.duration;
                var offset = bgMusic.currentTime;
                var currentTime = parseInt(bgMusic.currentTime);
                var min = parseInt(currentTime / 60);
                var max = parseInt(bgMusic.duration);
                var sec = currentTime % 60;
                if (sec < 10) {
                    sec = "0" + sec;
                };
                if (min < 10) {
                    min = "0" + min;
                };
                var starttime = min + ':' + sec; /*  00:00  */
                that.setData({
                    offset: currentTime,
                    starttime: starttime,
                    max: max,
                    changePlay: true,
                    duration,
                    offset
                })
            })
            // 监听播放结束
            bgMusic.onEnded(() => {
                that.setData({
                    starttime: '00:00',
                    isOpen: false,
                    offset: 0
                })
            })
            bgMusic.play()
            that.setData({
                isOpen: true,
                isPlay: true
            })
        },
        //暂停播放
        listenerButtonPause() {
            var that = this
            bgMusic.pause()
            that.setData({
                isOpen: false,
            })
        },
        // 如果离开当前页面就停止播放 onUnload
        listenerButtonStop() {
            var that = this
            bgMusic.stop()
        },
        // 进度条拖拽
        sliderChange(e) {
            var that = this
            var offset = parseInt(e.detail.value);
            bgMusic.play();
            bgMusic.seek(offset);
            that.setData({
                isOpen: true,
            })
        }
    }
})