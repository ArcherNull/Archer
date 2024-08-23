package com.h3pl.modules.report.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * @author zaj
 * @date 2024-07-26 15:28
 * @description 流量报表返回vo
 */
@Data
public class AccessReportRes {
    @ApiModelProperty("统计日期")
    private String time;
    @ApiModelProperty("访问时长")
    private Integer duration;
    @ApiModelProperty("访客数")
    private Integer customerCount;
    @ApiModelProperty("浏览量")
    private Integer scanCount;
    @ApiModelProperty("新访客数")
    private Integer newCustomerCount;
    @ApiModelProperty("下单人数")
    private Integer orderCusCount;

    @ApiModelProperty("平均停留时长")
    private Integer durationAvg;
    @ApiModelProperty("流失率")
    private BigDecimal churnRate;
    @ApiModelProperty("支付人数")
    private Integer payCustomerCount;
    @ApiModelProperty("支付订单数")
    private Integer payOrderCount;
    @ApiModelProperty("支付金额")
    private BigDecimal payMoney;
    @ApiModelProperty("客单价")
    private Integer pricePerCus;
    @ApiModelProperty("笔单价")
    private Integer pricePerOrder;
    @ApiModelProperty("访问-下单转化率")
    private Integer orderAccConverRate;
    @ApiModelProperty("访问-支付转化率")
    private Integer payAccConverRate;
    @ApiModelProperty("下单-支付转化率")
    private Integer orderPayConverRate;
    @ApiModelProperty("下单金额")
    private BigDecimal orderAmount;

}
