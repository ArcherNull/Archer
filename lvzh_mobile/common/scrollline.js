var wxCharts = require('../sdk/wxcharts.js'); //引入wxChart文件
var lineChart = null;

/**
 * 更多的wx-chart图表信息
 * 官方文档：https://developers.weixin.qq.com/community/develop/doc/00068651f0c3d0ffef06a7d1051806
 * 示例项目： https://github.com/xiaolin3303/wx-charts-demo
 */ 

export default {
    data: {
        //请求得chart数据
        chartData: {},
        //将canvas图片化
        radarImg: false,
    },
    options: {
        touchHandler: function (e) {
            //console.log(e)
            lineChart.scrollStart(e);
        },
        moveHandler: function (e) {
            // console.log(e)
            lineChart.scroll(e);
        },
        touchEndHandler: function (e) {
            lineChart.scrollEnd(e);
            lineChart.showToolTip(e, {
                format: function (item, category) {
                    return category + '，' + item.name + ':' + item.data
                }
            });
        },
        //数据对象
        createSimulationData: function () {
            let categories = [];
            let data1 = [] , data2 = [];
            for (let i = 0; i < 10; i++) {
                categories.push('2016-' + (i + 1));
                data1.push(parseInt(Math.random()*(20-10)+10));
                data2.push(parseInt(Math.random()*(20-10)+10));
            }
            return {
                categories: categories,
                data1: data1,
                data2:data2
            }
        },
        //请求数据
        getRes: function () {
            let that = this

            //统计图渲染
            that.getData()
        },
        //统计图渲染
        getData: function (e) {
            var that = this
            var windowWidth = 320;
            try {
                var res = wx.getSystemInfoSync();
                windowWidth = res.windowWidth;
            } catch (e) {
                console.error('getSystemInfoSync failed!');
            }

            var simulationData = this.createSimulationData();
            console.log('simulationData' , simulationData)
            lineChart = new wxCharts({
                canvasId: 'lineCanvas',
                type: 'line',
                categories: simulationData.categories,
                animation: false, //是否开启统计图动画
                series: [{
                    name: '1次数',
                    data: simulationData.data1,
                    format: function (val, name) {
                        return val;
                    }
                }, {
                    name: '2次数',
                    data: simulationData.data2,
                    format: function (val, name) {
                        return val;
                    }
                }],
                xAxis: {
                    disableGrid: true //不绘制X轴网格
                },
                yAxis: {
                    title: '次数',
                    disabled: false,
                    format: function (val) {
                        return val;
                    },
                    min: 0,
                    gridColor: '#F5F5F5',
                },
                width: windowWidth,
                height: 250,
                dataLabel: true, //是否在图表中显示数据内容值
                //dataPointShape: true, //是否在图表中显示数据点图形标识
                enableScroll: true, //是否开启图表可拖拽滚动，支持line, area图表类型(需配合绑定scrollStart, scroll, scrollEnd方法)
                extra: {
                    lineStyle: 'curve', //(仅对line, area图表有效) 可选值：curve曲线，straight直线 (default)
                }
            });
            that.renderComplete(simulationData.data1, simulationData.data2)
        },
        // 渲染完成，进行的操作
        renderComplete: function (e1, e2) {
            let that = this
            let total1, total2
            lineChart.addEventListener('renderComplete', () => {
                total1 = that.sum(e1)
                total2 = that.sum(e2)
                console.log('统计图渲染完成总的计数', total1, total2)
                console.log('这个地方可以检测图表在最右边后，实现后续的请求')
            });
        },
        //求和函数
        sum: function (arr) {
            let s = 0;
            arr.forEach(function (val, idx, arr) {
                s += val;
            }, 0);
            return s;
        },
        //生成图片
        canvasToTempImage: function () {
            wx.canvasToTempFilePath({
                canvasId: "lineCanvas",
                success: (res) => {
                    //console.log(res)
                    let tempFilePath = res.tempFilePath;
                    this.setData({
                        radarImg: tempFilePath,
                    });
                }
            }, this);
        }
    }
}