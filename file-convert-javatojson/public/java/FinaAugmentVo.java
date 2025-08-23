package com.dekun.scm.etms.business.common.domain.vo;

import com.dekun.common.annotation.Excel;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


/**
 * 增补费申请;存储由单个或多个运单的增值服务成本费用明细对应菜单：运单审核、运单管理视图对象 fina_augment
 *
 * @author fanfuqiang
 * @date 2021-10-19
 */

@Data
@ApiModel("增补费申请;存储由单个或多个运单的增值服务成本费用明细对应菜单：运单审核、运单管理视图对象")
public class FinaAugmentVo extends BusinessVo {
    private static final long serialVersionUID = 1L;

    /**
     * 增补id
     */
    @ApiModelProperty("增补id")
    private Long augmentId;

    /**
     * 乐观锁
     */
    @Excel(name = "乐观锁")
    @ApiModelProperty("乐观锁")
    private Integer revision;

    /**
     * 创建人id
     */
    @Excel(name = "创建人id")
    @ApiModelProperty("创建人id")
    private Long createdById;

    /**
     * 创建人
     */
    @Excel(name = "创建人")
    @ApiModelProperty("创建人")
    private String createdBy;

    /**
     * 创建时间
     */
    @Excel(name = "创建时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdTime;

    /**
     * 更新人id
     */
    @Excel(name = "更新人id")
    @ApiModelProperty("更新人id")
    private Long updatedById;

    /**
     * 更新人
     */
    @Excel(name = "更新人")
    @ApiModelProperty("更新人")
    private String updatedBy;

    /**
     * 更新时间
     */
    @Excel(name = "更新时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedTime;

    /**
     * 增补流水号
     */
    @Excel(name = "增补流水号")
    @ApiModelProperty("增补流水号")
    private String augmentNo;

    /**
     * 状态
     */
    @Excel(name = "状态")
    @ApiModelProperty("状态")
    private String augmentState;

    /**
     * 订单id
     */
    @Excel(name = "订单id")
    @ApiModelProperty("订单id")
    private Long orderId;

    /**
     * 订单号
     */
    @Excel(name = "订单号")
    @ApiModelProperty("订单号")
    private String orderNo;

    /**
     * 运单id
     */
    @Excel(name = "运单id")
    @ApiModelProperty("运单id")
    private Long waybillId;

    /**
     * 运单号
     */
    @Excel(name = "运单号")
    @ApiModelProperty("运单号")
    private String waybillNo;

    /**
     * 付款方id;对应往来账户的账户id
     */
    @Excel(name = "付款方id;对应往来账户的账户id")
    @ApiModelProperty("付款方id;对应往来账户的账户id")
    private Long paymentId;

    /**
     * 付款方名称;对应往来账户的账户名称
     */
    @Excel(name = "付款方名称;对应往来账户的账户名称")
    @ApiModelProperty("付款方名称;对应往来账户的账户名称")
    private String paymentName;

    /**
     * 付款方账户
     */
    @Excel(name = "付款方账户")
    @ApiModelProperty("付款方名账户")
    private String paymentNum;

    /**
     * 收款方id;对应往来账户的账户id
     */
    @Excel(name = "收款方id;对应往来账户的账户id")
    @ApiModelProperty("收款方id;对应往来账户的账户id")
    private Long collectionId;

    /**
     * 收款方名称;对应往来账户的账户名称
     */
    @Excel(name = "收款方名称;对应往来账户的账户名称")
    @ApiModelProperty("收款方名称;对应往来账户的账户名称")
    private String collectionName;

    /**
     * 收款方账户
     */
    @Excel(name = "收款方账户")
    @ApiModelProperty("收款方账户")
    private String collectionNum;

    /**
     * 收付款对象类型（发货方、收货方、承运方、非承运方）
     */
    @Excel(name = "收付款对象类型（发货方、收货方、承运方、非承运方）")
    @ApiModelProperty("收付款对象类型（发货方、收货方、承运方、非承运方）")
    private String collectionType;

    /**
     * 费用类型;提货费、干线费、送货费、增值服务各类费用
     */
    @Excel(name = "费用类型;提货费、干线费、送货费、增值服务各类费用")
    @ApiModelProperty("费用类型;提货费、干线费、送货费、增值服务各类费用")
    private String feeType;

    /**
     * 收支类型;应收、应付
     */
    @Excel(name = "收支类型;应收、应付")
    @ApiModelProperty("收支类型;应收、应付")
    private String inoutType;

    /**
     * 支付方式（现付、提付、月结、两笔付）
     */
    @Excel(name = "支付方式（现付、提付、月结、两笔付）")
    @ApiModelProperty("支付方式（现付、提付、月结、两笔付）")
    private String paymentMode;

    /**
     * 金额
     */
    @Excel(name = "金额")
    @ApiModelProperty("金额")
    private BigDecimal otherFee;

    /**
     * 现付
     */
    @Excel(name = "现付")
    @ApiModelProperty("现付")
    private BigDecimal nowPay;

    /**
     * 提付
     */
    @Excel(name = "提付")
    @ApiModelProperty("提付")
    private BigDecimal fetchPay;

    /**
     * 月结
     */
    @Excel(name = "月结")
    @ApiModelProperty("月结")
    private BigDecimal monthPay;

    /**
     * 预付款
     */
    @Excel(name = "预付款")
    @ApiModelProperty("预付款")
    private BigDecimal advancePay;

    /**
     * 到付款
     */
    @Excel(name = "到付款")
    @ApiModelProperty("到付款")
    private BigDecimal arrivalPay;

    /**
     * 回单款
     */
    @Excel(name = "回单款")
    @ApiModelProperty("回单款")
    private BigDecimal receiptPay;

    /**
     * 油卡金额
     */
    @Excel(name = "油卡金额")
    @ApiModelProperty("油卡金额")
    private BigDecimal oilcardPay;

    /**
     * 返款
     */
    @Excel(name = "返款")
    @ApiModelProperty("返款")
    private BigDecimal backPay;

    /**
     * 预付剩余对账金额
     */
    @Excel(name = "预付剩余对账金额")
    @ApiModelProperty("预付剩余对账金额")
    private BigDecimal surplusAdvancePay;

    /**
     * 到付剩余对账金额
     */
    @Excel(name = "到付剩余对账金额")
    @ApiModelProperty("到付剩余对账金额")
    private BigDecimal surplusArrivalPay;

    /**
     * 回单付/月结款剩余对账金额
     */
    @Excel(name = "回单付/月结款剩余对账金额")
    @ApiModelProperty("回单付/月结款剩余对账金额")
    private BigDecimal surplusReceiptPay;

    /**
     * 油卡剩余对账金额
     */
    @Excel(name = "油卡剩余对账金额")
    @ApiModelProperty("油卡剩余对账金额")
    private BigDecimal surplusOilcardPay;

    /**
     * 对账剩余金额
     */
    @Excel(name = "对账剩余金额")
    @ApiModelProperty("对账剩余金额")
    private BigDecimal surplusTotalFee;
    /**
     * 是否计入应收
     */
    @Excel(name = "是否计入应收")
    @ApiModelProperty("是否计入应收")
    private String isCalculation;

    /**
     * 操作类型（应收、应付、同步应付、同步应收）
     */
    @Excel(name = "操作类型（应收、应付、同步应付、同步应收）")
    @ApiModelProperty("操作类型（应收、应付、同步应付、同步应收）")
    private String operationType;

    /**
     * 对账状态（部分对账、已对账）
     */
    @Excel(name = "对账状态（部分对账、已对账）")
    @ApiModelProperty("对账状态（部分对账、已对账）")
    private String billState;

    /**
     * 备注
     */
    @Excel(name = "备注")
    @ApiModelProperty("备注")
    private String otherRemark;

    /**
     * 流程id
     */
    @Excel(name = "流程id")
    @ApiModelProperty("流程id")
    private Long processId;

    /**
     * 流程状态
     */
    @Excel(name = "流程状态")
    @ApiModelProperty("流程状态")
    private String processState;

    /**
     * 关联银行信息表主键银行id
     */
    @ApiModelProperty("银行id")
    private Long bankId;

    /**
     * 收款银行
     */
    @Excel(name = "收款银行")
    @ApiModelProperty("收款银行")
    private String bankName;

    /**
     * 收款支行
     */
    @Excel(name = "收款支行")
    @ApiModelProperty("收款支行")
    private String bankBranch;

    /**
     * 开户省份
     */
    @Excel(name = "开户省份")
    @ApiModelProperty("开户省份")
    private String bankProvince;

    /**
     * 开户省份id
     */
    @Excel(name = "开户省份id")
    @ApiModelProperty("开户省份id")
    private Long bankProvinceid;

    /**
     * 开户城市
     */
    @Excel(name = "开户城市")
    @ApiModelProperty("开户城市")
    private String bankCity;

    /**
     * 开户城市id
     */
    @Excel(name = "开户城市id")
    @ApiModelProperty("开户城市id")
    private Long bankCityid;

    /**
     * 收款转账类型
     */
    @Excel(name = "收款转账类型")
    @ApiModelProperty("收款转账类型")
    private String operType;

    /**
     * 成本类型（提货成本、短驳成本、干线成本、整车成本、中转成本、送货成本、始发劳务成本、终端劳务成本）
     */
    @Excel(name = "成本类型")
    @ApiModelProperty("成本类型")
    private String costType;

    /**
     * 配载、增减
     */
    @Excel(name = "配载、增减")
    @ApiModelProperty("配载、增减")
    private String operationSource;

    /**
     * 流程审批摘要
     */
    @Excel(name = "流程审批摘要")
    @ApiModelProperty("流程审批摘要")
    private String processContent;

    /**
     * 增补对象数组(新增)
     */
    @ApiModelProperty("增补对象数组(新增)")
    private List<FinaAugmentVo> finaAugmentVoSaveList;

    /**
     * 增补对象数组(修改)
     */
    @ApiModelProperty("增补对象数组(修改)")
    private List<FinaAugmentVo> finaAugmentVoUpdateList;

    /**
     * 订单或运单id集合
     */
    @ApiModelProperty("订单或运单id集合")
    private List<Long> objectIds;

    /**
     * 标志
     */
    @ApiModelProperty("标志")
    private Integer sign;

    /**
     * 审批id
     */
    @ApiModelProperty("审批id")
    private Long contentId;

    /**
     * 客户名称
     */
    @ApiModelProperty("客户名称")
    private String customerName;

    /**
     * 增减前金额(费用合计+增减费合计）
     */
    @ApiModelProperty("增减前金额")
    private BigDecimal firstFee;

    /**
     * 增减后金额（费用合计+增减费合计+增减金额）
     */
    @ApiModelProperty("增减后金额")
    private BigDecimal afterFee;

    /**
     * 流程单号
     */
    @ApiModelProperty("流程单号")
    private String processNo;

    /**
     * 指派时间
     */
    @ApiModelProperty("指派时间")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime assignDate;

    /**
     * 指派人
     */
    @ApiModelProperty("指派人")
    private String assignMan;

    /**
     * 是否订单与运单 (0 订单 1 运单)
     */
    @ApiModelProperty("是否订单与运单")
    private Integer status;

    /**
     * 合同id
     */
    @ApiModelProperty("合同id")
    private Long mainId;

    /**
     * 合同主体
     */
    @ApiModelProperty("合同主体")
    private String invoiceMain;

    /**
     * 审批人
     */
    @ApiModelProperty("审批人")
    private String currentMan;

    /**
     * 审批时间
     */
    @ApiModelProperty("审批时间")
    private String currentTime;

    /**
     * 订单总收入
     */
    @ApiModelProperty("订单总收入")
    private BigDecimal orderTotalFee;

    /**
     * 运单总成本
     */
    @ApiModelProperty("运单总成本")
    private BigDecimal waybillTotalFee;

    /**
     * 申请内容
     */
    @ApiModelProperty("申请内容")
    private String applicationContent;

    /**
     * 审核日期
     */
    @ApiModelProperty("审核日期")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime auditDate;

    /**
     * 审核人
     */
    @ApiModelProperty("审核人")
    private String auditMan;

    /**
     * 已核销金额
     */
    @Excel(name = "已核销金额")
    @ApiModelProperty("已核销金额")
    private BigDecimal verifyoffMoney;

    /**
     * 核销状态
     */
    @Excel(name = "已核销状态")
    @ApiModelProperty("已核销状态")
    private String verifyoffState;

    /**
     * 已付金额（付款确认做金额同步）
     */
    @Excel(name = "已付金额")
    @ApiModelProperty("已付金额")
    private BigDecimal paymentMoney;

    /**
     * 付款状态
     */
    @Excel(name = "付款状态")
    @ApiModelProperty("付款状态")
    private String paymentState;

    /**
     * 财务审核状态（未审核、已审核、取消审核）
     */
    @Excel(name = "财务审核状态")
    @ApiModelProperty("财务审核状态（未审核、已审核、取消审核）")
    private String financeAuditState;

    /**
     * 财务审核人
     */
    @ApiModelProperty("财务审核状态")
    @Excel(name = "财务审核状态")
    private String financeAuditUser;

    /**
     * 财务审核人id
     */
    @ApiModelProperty("财务审核人id")
    private Long financeAuditUserId;

    /**
     * 财务审核时间
     */
    @Excel(name = "财务审核时间")
    @ApiModelProperty("财务审核时间")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime financeAuditDate;


    /**
     * 订单税率
     */
    @ApiModelProperty("订单税率")
    private String taxRate;


    /**
     * 不含税金额
     */
    @ApiModelProperty("不含税金额")
    private BigDecimal notTaxMoney;

    /**
     * 平台id
     */
    @ApiModelProperty("平台id")
    private String platformId;
    /**
     * 平台名称
     */
    @ApiModelProperty("平台名称")
    private String platformName;
    /**
     * 服务费率
     */
    @ApiModelProperty("服务费率")
    private BigDecimal serviceRate;

    /**
     * 服务费
     */
    @ApiModelProperty("服务费")
    private BigDecimal serviceFee;

    /**
     * 进项税额
     */
    @ApiModelProperty("进项税额")
    private BigDecimal realTax;

    /**
     * MTMS同步ID
     */
    @ApiModelProperty("MTMS同步ID")
    private Long mtmsId;

    /**
     * 项目部id
     */
    @ApiModelProperty("项目部id")
    private Long prodivisionId;

    /**
     * 项目部
     */
    @Excel(name = "项目部")
    @ApiModelProperty("项目部")
    private String prodivisionName;

    /**
     * 财务id
     */
    @ApiModelProperty("财务id")
    private Long financialId;

    /**
     * 公司id
     */
    @ApiModelProperty("公司id")
    private Long companyId;
    /**
     * 顺丰费用代码
     */
    @ApiModelProperty("SF_FEE_CODE")
    private String sfFeeCode;

    //---- 运单表----
    @ApiModelProperty("承运商id")
    private Long supplierId;

    /**
     * 承运商
     */
    @Excel(name = "承运商")
    @ApiModelProperty("承运商")
    private String supplierName;

    /**
     * 承运商类型
     */
    @Excel(name = "承运商类型")
    @ApiModelProperty("承运商类型")
    private String supplierType;

    /**
     * 车牌号
     */
    @Excel(name = "车牌号")
    @ApiModelProperty("车牌号")
    private String carNo;

    /**
     * 车辆类型
     */
    private String carType;

    /**
     * 车长
     */
    private String carLength;

    /**
     * 主驾
     */
    @Excel(name = "主驾")
    @ApiModelProperty("主驾")
    private String driverName1;

    /**
     * 主驾电话
     */
    private String driverPhone1;

    /**
     * 银行信息Vo对象
     */
    @ApiModelProperty("银行信息Vo对象")
    private BaseBankVo baseBankVo;

    /**
     * 增减类型：调账，扣罚
     */
    @ApiModelProperty("增减类型")
    private String augmentType;


    /**
     * 是否同步运单（0:未同步 1:已同步）
     */
    @ApiModelProperty("是否同步运单")
    private Integer isSyncWaybill;

    /**
     * 关联运单ID
     */
    @ApiModelProperty("关联运单ID")
    private Long syncWaybillId;

    /**
     * 关联运单号
     */
    @ApiModelProperty("关联运单号")
    private String syncWaybillNo;

    /**
     * 同步失败原因
     */
    @ApiModelProperty("同步失败原因")
    private String syncFailReason;


    /*-------bean之外--------*/

    /**
     * 差动金额
     */
    @ApiModelProperty("差动金额")
    private BigDecimal differentialAmount;

    /**
     * 扣罚金额
     */
    @ApiModelProperty("扣罚金额")
    private BigDecimal deductAmount;
}
