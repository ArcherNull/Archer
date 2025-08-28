package com.h3pl.modules.report.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Date;

/**
 * @author zaj
 * @date 2024-07-24 15:02
 * @description 访问记录返回
 */
@Data
public class AccessMainRes {


   /**
     * 创建人id
     */
    @ApiModelProperty("创建人id")
    private Long createdById;

    /**
     * 创建人
     */
    @ApiModelProperty("创建人")
    private String createdBy;

    /**
     * 创建时间
     */
    @ApiModelProperty("创建时间")
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdTime;

    /**
     * 更新人id
     */
    @ApiModelProperty("更新人id")
    private Long updatedById;

    /**
     * 更新人
     */
    @ApiModelProperty("更新人")
    private String updatedBy;

    /**
     * 更新时间
     */
    @ApiModelProperty("更新时间")
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedTime;

    /**
     * 异常id
     */
    @ApiModelProperty("异常id")
    private Long abnormalId;

    /**
     * 订单号（顺丰单号）
     */
    @ApiModelProperty("订单号（顺丰单号）")
    private String orderNo;

    /**
     * 异常结算类型
     */
    @ApiModelProperty("异常结算类型")
    private String abnormalSettlementType;

    /**
     * 扣罚金额
     */
    @ApiModelProperty("扣罚金额")
    private BigDecimal penaltyMoney;

    /**
     * 减免金额
     */
    @ApiModelProperty("减免金额")
    private BigDecimal annulMoney;

    /**
     * 应扣金额
     */
    @ApiModelProperty("应扣金额")
    private BigDecimal shouldDeductMoney;

    /**
     * 申诉截止时间（用来计算剩余申诉时间（H））
     */
    @ApiModelProperty("申诉截止时间")
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime appealDeadline;

    /**
     * 剩余申诉时间（H）
     */
    @ApiModelProperty("剩余申诉时间（H）")
    private Integer surplusAppealHour;

    /**
     * 发货省份
     */
    @ApiModelProperty("发货省份")
    private String consignorProvince;

    /**
     * 发货城市
     */
    @ApiModelProperty("发货城市")
    private String consignorCity;

    /**
     * 目的省份
     */
    @ApiModelProperty("目的省份")
    private String consigneeProvince;

    /**
     * 目的城市
     */
    @ApiModelProperty("目的城市")
    private String consigneeCity;

    /**
     * 数据来源
     */
    @ApiModelProperty("数据来源")
    private String dataSource;

    /**
     * 异常结算ID（顺丰）
     */
    @ApiModelProperty("异常结算ID（顺丰）")
    private String sfAbnormalSettlementId;

    /**
     * 公司id
     */
    @ApiModelProperty("公司id")
    private Long companyId;


    //********************结算申述表字段********************//
    /**
     * 申述id
     */
    @ApiModelProperty("申述id")
    private Long appealId;

    /**
     * 申述状态
     */
    @ApiModelProperty("申述状态")
    private String appealStatus;

    /**
     * 申述时间
     */
    @ApiModelProperty("申述时间")
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime appealTime;

    /**
     * 审核意见
     */
    @ApiModelProperty("审核意见")
    private String auditOpinion;

    /**
     * 申诉照片1
     */
    @ApiModelProperty("申诉照片1")
    private String appealPhoto1;

    /**
     * 申诉备注1
     */
    @ApiModelProperty("申诉备注1")
    private String appealRemark1;

    /**
     * 申诉照片2
     */
    @ApiModelProperty("申诉照片2")
    private String appealPhoto2;

    /**
     * 申诉备注2
     */
    @ApiModelProperty("申诉备注2")
    private String appealRemark2;

    /**
     * 顺丰申述照片url
     */
    @ApiModelProperty("顺丰申述照片url")
    private String sfAppealPhoto;

    /**
     * 推送顺丰结果1
     */
    @ApiModelProperty("推送顺丰结果1")
    private String pushSfResult1;

    /**
     * 推送顺丰结果2
     */
    @ApiModelProperty("推送顺丰结果2")
    private String pushSfResult2;

    //********************订单表字段********************//
    /**
     * 订单状态
     */
    @ApiModelProperty("订单状态")
    private String orderState;

    /**
     * 开单时间
     */
    @ApiModelProperty("开单时间")
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime orderCreatedTime;

    /**
     * 提货供应商
     */
    @ApiModelProperty("提货供应商")
    private String fetchSupplierName;

    /**
     * 二级供应商
     */
    @ApiModelProperty("二级供应商")
    private String secondSupplierName;

    /**
     * 干线承运商
     */
    @ApiModelProperty("干线承运商")
    private String supplierName;

    /**
     * 干线承运商id
     */
    @ApiModelProperty("干线承运商id")
    private Long supplierId;

    /**
     * 项目部
     */
    @ApiModelProperty("项目部")
    private String prodivisionName;

    /**
     * 项目id
     */
    @ApiModelProperty("项目id")
    private Long prodivisionId;
}
