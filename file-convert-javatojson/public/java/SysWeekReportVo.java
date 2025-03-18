package com.dekun.tasktime.business.common.weekReport.domain.vo;

import com.dekun.common.annotation.Excel;
import com.dekun.common.core.domain.BaseEntityVo;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 周报
 *
 * @author congfulu
 * @date 2024-07-08
 */

@EqualsAndHashCode(callSuper = true)
@Data
@ApiModel("周报视图对象")
public class SysWeekReportVo extends BaseEntityVo {
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @ApiModelProperty("ID")
    private Long reportId;

    /**
     * 所属用户ID
     */
    @ApiModelProperty("所属用户ID")
    private Long userId;

    /**
     * 日期
     */
    @ApiModelProperty("日期")
    private String day;

    /**
     * 月份
     */
    @ApiModelProperty("月份")
    private String month;

    /**
     * 标题
     */
    @ApiModelProperty("标题")
    private String title;

    /**
     * 时间范围开始
     */
    @ApiModelProperty("时间范围开始")
    private String startDay;

    /**
     * 时间范围结束
     */
    @ApiModelProperty("时间范围结束")
    private String endDay;

    /**
     * 汇报顺序
     */
    @ApiModelProperty("汇报顺序")
    private Integer reportOrder;

    /**
     * 备注
     */
    @ApiModelProperty("备注")
    private String remark;

    /**
     * 报告类型1总结2计划
     */
    @ApiModelProperty("报告类型1总结2计划")
    private Integer reportType;

    /**
     * 状态（-1 删除 0：自动插入   1：正常 2：已审核）
     */
    @ApiModelProperty("status")
    private Integer status;

    /**
     * 创建时间
     */
    @ApiModelProperty("created_time")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "创建时间", width = 15)
    private LocalDateTime createdTime;

    /**
     * 创建人
     */
    @ApiModelProperty("created_by")
    @Excel(name = "创建人", width = 15)
    private String createdBy;

    /**
     * 更新时间
     */
    @ApiModelProperty("updated_time")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "更新时间", width = 15)
    private LocalDateTime updatedTime;

    /**
     * 更新人
     */
    @ApiModelProperty("updated_by")
    @Excel(name = "更新人", width = 15)
    private String updatedBy;


    //--------------------------bean之外--------------------------//

    /**
     * 真实姓名
     */
    @ApiModelProperty("真实姓名")
    private String realName;

    /**
     * 组织名称，支持多个，逗号分隔
     */
    @ApiModelProperty("组织名称，支持多个，逗号分隔")
    private String orgName;
    /**
     * 组织名称，支持多个，逗号分隔
     */
    @ApiModelProperty("组织名称，支持多个，逗号分隔")
    private List<String> orgNameList;

    /**
     * 状态（-1 删除 0：禁用   1：正常 2：已审核）
     */
    @ApiModelProperty("状态")
    private String statusString;

    /**
     * ID列表，用于查询
     */
    @ApiModelProperty("ID列表，用于查询")
    private List<Long> idList;

    /**
     * 逗号分隔的用户ID，用于查询
     */
    @ApiModelProperty("逗号分隔的用户ID，用于查询")
    private String userIds;

    /**
     * 范围开始时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty("范围开始时间")
    private LocalDateTime startTime;

    /**
     * 范围截止时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty("范围截止时间")
    private LocalDateTime endTime;
}
