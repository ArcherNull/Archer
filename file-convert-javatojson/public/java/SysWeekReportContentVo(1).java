package com.dekun.tasktime.business.common.weekReport.domain.vo;

import com.baomidou.mybatisplus.annotation.TableField;
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
 * 周报内容
 *
 * @author congfulu
 * @date 2024-07-08
 */

@EqualsAndHashCode(callSuper = true)
@Data
@ApiModel("周报内容视图对象")
public class SysWeekReportContentVo extends BaseEntityVo {
    private static final long serialVersionUID = 1L;

    /**
     * ID
     */
    @ApiModelProperty("ID")
    private Long contentId;


    /**
     * 所属用户ID
     */
    @ApiModelProperty("所属用户ID")
    private Long userId;

    /**
     * 用户角色
     */
    @ApiModelProperty("用户角色")
    private String userRole;

    /**
     * 周报ID
     */
    @ApiModelProperty("周报ID")
    private Long reportId;

    /**
     * 工作项
     */
    @ApiModelProperty("工作项")
    private String title;

    /**
     * 内容
     */
    @ApiModelProperty("内容")
    private String content;

    /**
     * 系统ID
     */
    @ApiModelProperty("系统ID")
    private Long projectId;

    /**
     * 项目ID
     */
    @ApiModelProperty("项目ID")
    private Long versionId;

    /**
     * 项目版本号
     */
    @ApiModelProperty("项目版本号")
    private String versionCode;

    /**
     * 承诺完成时间
     */
    @ApiModelProperty("承诺完成时间")
    private LocalDateTime versionEndTime;

    /**
     * 执行人
     */
    @TableField("执行人")
    private Long executeUserId;

    /**
     * 是否自动创建1自动0手动默认0
     */
    @ApiModelProperty("是否自动创建1自动0手动默认0")
    private Integer isAuto;

    /**
     * 进度/备注
     */
    @ApiModelProperty("remark")
    private String remark;

    /**
     * 状态（-1 删除 0：禁用   1：正常 2：已审核）
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
}
