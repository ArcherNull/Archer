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


    @ApiModelProperty(value = "id")
    private String id;

    @ApiModelProperty(value = "客户id")
    private String customerId;

    @ApiModelProperty(value = "访问IP")
    private String clientIp;

    @ApiModelProperty(value = "访问来源")
    private String source;

    @ApiModelProperty(value = "进入时间(访问时间)")
    private Date intoTime;

    @ApiModelProperty(value = "离开时间")
    private Date leaveTime;

    @ApiModelProperty(value = "时长（秒）")
    private Integer duration;

    @ApiModelProperty(value = "是否登录")
    private Integer beLogin;

    @ApiModelProperty(value = "是否注册用户")
    private Integer beRegister;

    @ApiModelProperty(value = "登录账号")
    private String userName;

    @ApiModelProperty(value = "客户名称")
    private String customerName;
    @ApiModelProperty(value = "首页访问时长")
    private Integer homePageDuration;

    @ApiModelProperty(value = "首页访问次数")
    private Integer homePageCount;

    @ApiModelProperty(value = "工作台访问时长")
    private Integer workbenchDuration;

    @ApiModelProperty(value = "查单功能点击次数")
    private Integer queryOrderCount;

    @ApiModelProperty(value = "发整车页访问时长")
    private Integer completeDuration;

    @ApiModelProperty(value = "发零担页访问时长")
    private Integer lessDuration;

    @ApiModelProperty(value = "发铁路页访问时长")
    private Integer railwayDuration;

    @ApiModelProperty(value = "订单页访问时长")
    private Integer orderListDuration;

    @ApiModelProperty(value = "我的页面访问时长")
    private Integer mineDuration;

    @ApiModelProperty(value = "创建人")
    private String createBy;


    @ApiModelProperty(value = "创建时间")
    private Date createTime;

    @ApiModelProperty(value = "第一次访问时间")
    private Date firstTime;
}
