'''
Author: junsong Chen 779217162@qq.com
Date: 2025-02-26 19:09:37
LastEditTime: 2025-07-12 15:56:47
Description: 
'''
from sqlalchemy import Column, INT, BIGINT, DATETIME, DATE, String, INTEGER, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = 'user'
    id = Column(BIGINT, autoincrement=True, primary_key=True, nullable=False)
    name = Column(String(20), nullable=False, comment='用户名')
    nick_name = Column(String(20), nullable=False, unique=True, comment='用户昵称')
    role = Column(String(20), nullable=False, comment='用户角色，用于验证用户是都拥有权限去操作')
    email = Column(String(50),
                   nullable=False,
                   unique=True,
                   comment='用户邮箱，用于发送邮箱通知审批节点')
    phonenumber = Column(String(11), default='', comment='手机号码')
    sex = Column(String(1), default='0', comment='用户性别（0男 1女 2未知）')
    birthday = Column(DATE, comment='用户生日')
    password = Column(String(255), nullable=False, comment='用户密码')
    state = Column(INTEGER, nullable=False, default=1, comment='状态，0-禁用，1-启用')
    updated_at = Column(DATETIME, nullable=True, onupdate=func.now())
    created_at = Column(DATETIME, nullable=False, default=func.now())


class CaptchaCodeInfo(Base):
    __tablename__ = 'captcha_code_info'
    id = Column(BIGINT, autoincrement=True, primary_key=True, nullable=False)
    code = Column(String(20), nullable=False, comment='验证码')
    type = Column(String(20),
                  nullable=False,
                  default='login',
                  comment='验证码类型, 登录 login')
    expire_diff = Column(BIGINT,
                         nullable=True,
                         default=300,
                         comment='验证码失效差值时间, 单位为s，默认 5 * 60 s')
    updated_at = Column(DATETIME, nullable=True, onupdate=func.now())
    created_at = Column(DATETIME, nullable=False, default=func.now())


# 工单
class WorkOrder(Base):
    __tablename__ = 'work_order'
    id = Column(BIGINT, autoincrement=True, primary_key=True, nullable=False)
    title = Column(String(50), nullable=False, comment='工单标题')
    content = Column(String(225), nullable=False, comment='工单内容')
    remark = Column(String(225), nullable=True, comment='工单备注')
    bind_ps_id = Column(INTEGER,
                        nullable=True,
                        comment='绑定流程ps_id，当用户创建了工单，需要管理员审核绑定审批流程')

    bind_time = Column(DATETIME, nullable=True, comment='绑定时间')
    bind_by = Column(String(20), nullable=True, comment='绑定人')
    bind_by_id = Column(INTEGER, nullable=True, comment='绑定人id')

    wo_state = Column(INTEGER,
                      nullable=False,
                      default=1,
                      comment='工单状态，0 已删除，1，审批中，2，审批成功，3，审批拒绝')
    
    wait_approve_ids = Column(String(100),
                              nullable=True,
                              comment='待审批人id， 可多个英文逗号分隔')
    wait_approve_names = Column(String(255),
                                nullable=True,
                                comment='待审批人名称集合， 可多个英文逗号分隔')

    updated_by = Column(String(20), nullable=True)
    updated_by_id = Column(INTEGER, nullable=True)
    updated_at = Column(DATETIME, nullable=True, onupdate=func.now())
    created_by = Column(String(20), nullable=True)
    created_by_id = Column(INTEGER, nullable=True)
    created_at = Column(DATETIME, nullable=False, default=func.now())


# 审批设置
class ProcessSetting(Base):
    __tablename__ = 'process_setting'
    id = Column(BIGINT, autoincrement=True, primary_key=True, nullable=False)
    title = Column(String(50), nullable=False, comment='流程标题')
    content = Column(String(225), nullable=False, comment='流程内容')
    remark = Column(String(225), nullable=True, comment='流程备注')
    process_state = Column(INTEGER,
                           nullable=False,
                           default=1,
                           comment='流程状态，0、禁用， 1、启用')
    updated_by = Column(String(20), nullable=True)
    updated_by_id = Column(INTEGER, nullable=True)
    updated_at = Column(DATETIME, nullable=True, onupdate=func.now())
    created_by = Column(String(20), nullable=True)
    created_by_id = Column(INTEGER, nullable=True)
    created_at = Column(DATETIME, nullable=False, default=func.now())


# 审批节点
class ProcessNode(Base):
    __tablename__ = 'process_node'
    id = Column(BIGINT, autoincrement=True, primary_key=True, nullable=False)
    ps_id = Column(INTEGER, nullable=False, comment='审批设置id')
    title = Column(String(50),
                   nullable=False,
                   comment='流程节点标题，用于简介描述改审批节点的作用及功能')
    description = Column(String(225), nullable=True, comment='流程节功能描述')
    remark = Column(String(225), nullable=True, comment='流程节点备注')
    approve_user_ids = Column(String(100),
                              nullable=True,
                              comment='可执行审批人id， 可多个英文逗号分隔')
    approve_user_names = Column(String(255),
                                nullable=True,
                                comment='可执行审批人名称集合， 可多个英文逗号分隔')
    pn_state = Column(INTEGER,
                      nullable=False,
                      default=1,
                      comment='审批节点状态，0 已删除，1，待审批，2，审批成功，3，审批拒绝')

    bind_wo_id = Column(INTEGER, nullable=True, comment='绑定工单id')
    is_original_node = Column(
        INTEGER,
        nullable=False,
        default=0,
        comment='是否是原始节点数据, 当为true时，用于审批设置流程的复刻流程模板；当为false，则为真实的流程，需要绑定工单id')

    order = Column(INTEGER, nullable=False, comment='节点顺序')

    ap_time = Column(DATETIME, nullable=True, comment='执行审批通过时间')
    ap_by = Column(String(225), nullable=True, comment='执行审批通过人')
    ap_by_id = Column(INTEGER, nullable=True, comment='执行审批通过人id')
    ap_remark = Column(String(500), nullable=True, comment='执行审批通过备注')

    anp_time = Column(DATETIME, nullable=True, comment='执行审批不通过时间')
    anp_by = Column(String(225), nullable=True, comment='执行审批不通过人')
    anp_by_id = Column(INTEGER, nullable=True, comment='执行审批不通过人id')
    anp_remark = Column(String(500), nullable=True, comment='执行审批不通过备注')

    updated_by = Column(String(225), nullable=True)
    updated_by_id = Column(INTEGER, nullable=True)
    updated_at = Column(DATETIME, nullable=True, onupdate=func.now())
    created_by = Column(String(225), nullable=True)
    created_by_id = Column(INTEGER, nullable=True)
    created_at = Column(DATETIME, nullable=False, default=func.now())
    
# 邮箱发送记录
class SendEmailRecord(Base):
    __tablename__ = 'send_email_record'
    id = Column(BIGINT, autoincrement=True, primary_key=True, nullable=False)
    sender = Column(String(50), nullable=False, comment='发送者名称')
    sender_email = Column(String(100), nullable=False, comment='发送者邮箱')
    receiver = Column(String(50), nullable=False, comment='接收者名称')
    receiver_email = Column(String(100), nullable=False, comment='接收者邮箱')
    type = Column(String(100), nullable=False, default='process_approval_reminder', comment='邮箱类型12，process_approval_reminder 流程审批提醒；custom 自定义；publicity 宣传 ')
    title = Column(String(100), nullable=False, comment='主题')
    content = Column(String(1000), nullable=False, comment='主要内容')
    files = Column(String(500), nullable=True, comment='附件，可以多个，多个逗号分隔')
    remark = Column(String(225), nullable=True, comment='备注')
    state = Column(INTEGER,
                    nullable=False,
                    default=1,
                    comment='状态，0 已删除，1，待发送，2，发送成功，3，发送失败')
    send_time = Column(DATETIME, nullable=True, comment='发送时间')
    updated_by = Column(String(20), nullable=True)
    updated_by_id = Column(INTEGER, nullable=True)
    updated_at = Column(DATETIME, nullable=True, onupdate=func.now())
    created_by = Column(String(20), nullable=True)
    created_by_id = Column(INTEGER, nullable=True)
    created_at = Column(DATETIME, nullable=False, default=func.now())
    

    
    
