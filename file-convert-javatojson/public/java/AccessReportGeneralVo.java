package com.h3pl.modules.report.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.persistence.Access;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * @author zaj
 * @date 2024-07-27 10:45
 * @description 流量报表总量数据
 */
@Data
public class AccessReportGeneralVo {
    //1 访客数及环比
    @ApiModelProperty("访客数")
    private int customerCount;
    @ApiModelProperty("访客数环比")
    private String customerCountRatio;
    //2 浏览量及环比
    @ApiModelProperty("浏览量")
    private int scanCount;
    @ApiModelProperty("浏览量环比")
    private String scanCountRatio;
    //3新访客数及环比
    @ApiModelProperty("新访客数")
    private int newCustomerCount;
    @ApiModelProperty("新访客数环比")
    private String newCustomerCountRatio;
    //4流失率及环比
    //流失率
    @ApiModelProperty("流失率")
    private String churnRate;
    //流失率环比
    @ApiModelProperty("流失率环比")
    private String churnRateRatio;

    //5平均停留时长及环比
    @ApiModelProperty("平均停留时长")
    private BigDecimal durationAvg;
    //平均停留时长环比
    @ApiModelProperty("平均停留时长环比")
    private String durationAvgRatio;

    //6支付人数及环比
    @ApiModelProperty("支付人数")
    private BigDecimal payCustomerCount ;

    @ApiModelProperty("支付人数环比")
    private String payCustomerCountRatio;

    //7支付订单数及环比
    @ApiModelProperty("支付订单数")
    private BigDecimal payOrderCount;

    @ApiModelProperty("支付订单数环比")
    private String payOrderCountRatio;

    //8支付金额及环比
    @ApiModelProperty("支付金额")
    private BigDecimal payMoney;

    @ApiModelProperty("支付金额环比")
    private String payMoneyRatio;

    //8客单价及环比

    @ApiModelProperty("客单价")
    private BigDecimal pricePerCus ;

    @ApiModelProperty("客单价环比")
    private String pricePerCusRatio;

    //9笔单价及环比
    @ApiModelProperty("笔单价")
    private BigDecimal pricePerOrder;

    @ApiModelProperty("笔单价环比")
    private String pricePerOrderRatio;

    private List<AccessReportRes> details;


}
