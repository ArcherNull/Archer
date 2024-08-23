package com.h3pl.modules.notification.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

/**
 * @program: dekun-boot-parent
 * @description: 通知设置
 * @author: zaj
 * @create: 2024-06-20 16:31
 **/
@Data
public class NotificationSettingVo {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "主键id")
    private String id;

    @ApiModelProperty(value = "业务类型1零担2整车")
    private Integer businessType;

    @ApiModelProperty(value = "业务范围1.新订单通知2.订单在途延误通知3订单应收催收通知")
    private Integer businessRangeType;

    @ApiModelProperty(value = "通知内容")
    private String content;

    @ApiModelProperty(value = "通知对象类型1.下单用户2.发货人3.收货人4所属业务员5指定人员6站内用户")
    private Integer objectType;

    @ApiModelProperty(value = "通知方式多个用逗号分隔1.站内消息通知2订单群消息通知3短信")
    private String notificationType;

    @ApiModelProperty(value = "接收人账号")
    private String receiveAccount;

    @ApiModelProperty(value = "接收人工号")
    private String receiveWorkNo;

    @ApiModelProperty(value = "接收手机")
    private String receivePhone;

    @ApiModelProperty(value = "组织id")
    private String orgId;

    @ApiModelProperty(value = "创建人")
    private String createBy;
    /**创建时间*/
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @ApiModelProperty(value = "创建时间")
    private Date createTime;
    /**更新人*/
    @ApiModelProperty(value = "更新人")
    private String updateBy;
    /**更新时间*/
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @ApiModelProperty(value = "更新时间")
    private Date updateTime;
    /**删除状态 0正常 1已删除*/
    @Excel(name = "删除状态 0正常 1已删除", width = 15)
    @ApiModelProperty(value = "删除状态 0正常 1已删除")
    private Integer delFlag;
    /**状态(0.禁用,1.启用)*/
    @Excel(name = "状态(0.禁用,1.启用)", width = 15)
    @ApiModelProperty(value = "状态(0.禁用,1.启用)")
    private Integer status;
}

