package com.h3pl.modules.customer.entity;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.math.BigDecimal;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecg.common.aspect.annotation.Dict;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: mhy_customer_bank_card
 * @Author: zbq
 * @Date:   2021-04-19
 * @Version: V1.0
 */
@Data
@TableName("mhy_customer_bank_card")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="mhy_customer_bank_card对象", description="mhy_customer_bank_card")
public class CustomerBankCard implements Serializable {
    private static final long serialVersionUID = 1L;

	/**主键id*/
	@TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "主键id")
    private String id;
	/**客户id*/
	@Excel(name = "客户id", width = 15)
    @ApiModelProperty(value = "客户id")
    private String customerId;
	/**姓名*/
	@Excel(name = "姓名", width = 15)
    @ApiModelProperty(value = "姓名")
    private String userName;
	/**银行名称*/
	@Excel(name = "银行名称", width = 15)
    @ApiModelProperty(value = "银行名称")
    private String bankName;
	/**开户行*/
	@Excel(name = "开户行", width = 15)
    @ApiModelProperty(value = "开户行")
    private String bankDeposit;
    /**
     * 所在城市
     */
    @Excel(name = "所在城市", width = 15)
    @ApiModelProperty(value = "所在城市")
    private String city;
	/**手机号*/
	@Excel(name = "手机号", width = 15)
    @ApiModelProperty(value = "手机号")
    private String phone;
	/**账户*/
	@Excel(name = "账户", width = 15)
    @ApiModelProperty(value = "账户")
    private String account;
	/**备注*/
	@Excel(name = "备注", width = 15)
    @ApiModelProperty(value = "备注")
    private String remark;
	/**创建人*/
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
    private String status;
	@TableField(exist = false)
    private String iconUrl;
    @ApiModelProperty(value = " 1对私 2对公")
	private String accountType;

    @ApiModelProperty(value = "账户属性1收款账户，2付款账户")
    private Integer accountAttribute;
    @ApiModelProperty(value = "银行行号")
    private String bankUnionNo;
    @ApiModelProperty(value = "开户行地址")
    private String address;
    @ApiModelProperty(value = "银行编码（对应通联编码）")
    private String bankCode;
}
