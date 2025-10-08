import os
from pydantic import BaseModel, Field
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import and_, update, func
from db.db import Database
from models.model import SendEmailRecord
from utils.jwt_util import verify_auth
from utils.comm_util import get_current_user, parse_ids
from typing import Optional, List, Union, Literal
from models.response import response_builder, ResponseModel
from utils.email_util import send_email_by_qq, email_configs

router = APIRouter(prefix="/email",
                   tags=["send_email_record"],
                   responses={404: {
                       "description": "404 Not Found"
                   }},
                   dependencies=[Depends(verify_auth)])

database = Database()
engine = database.get_db_connection()


class filterListModel(BaseModel):
    name: Optional[str] = Field(default=None, description='用户名')
    nick_name: Optional[str] = Field(default=None, description='用户昵称')
    role: Optional[str] = Field(default=None, description='用户角色')
    email: Optional[str] = Field(default=None, description='邮箱')
    state: Optional[Literal[0, 1]] = Field(default=None,
                                           description='用户状态，0-禁用，1-启用')


class SendEmailRecordModal(BaseModel):
    sender: str
    sender_email: str
    receiver: str
    receiver_email: str
    type: str
    title: str
    content: str
    files: Optional[str] = None
    remark: Optional[str] = None
    state: int
    send_time: Optional[datetime] = None
    updated_by: Optional[str] = None
    updated_by_id: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_by: str
    created_by_id: int
    created_at: datetime


class AddSendEmailRecordModal(BaseModel):
    sender: str
    sender_email: str
    receiver: str
    receiver_email: str
    type: str
    title: str
    content: str
    files: Optional[str] = None
    remark: Optional[str] = None


class EditSendEmailRecordModal(SendEmailRecordModal):
    id: int


class SendEmailRecordFullModal(SendEmailRecordModal):
    id: int


class SoftDelModel(BaseModel):
    ids: str


class ListResponseModel(BaseModel):
    data: List[SendEmailRecordFullModal] = []
    code: int
    message: Optional[str] = None


class DetailResponseModel(BaseModel):
    data: Union[SendEmailRecordFullModal, None]
    code: int
    message: Optional[str] = None

class SendEmailModel(BaseModel):
    sender_email: str
    sender_name: str
    email_type: str

class EmailTypeModel(BaseModel):
    label: str
    value: str

class SendEmailResModel(BaseModel):
    send_email_list: List[SendEmailModel] = []
    email_type_list: List[EmailTypeModel] = []

class SendEmailResponseModel(BaseModel):
    data: SendEmailResModel
    code: int
    message: Optional[str] = None


@router.get("/list", response_model=ListResponseModel)
async def read_all_send_email_records(
        name: Optional[str] = None,
        sender_email: Optional[str] = None,
        receiver: Optional[str] = None,
        receiver_email: Optional[str] = None,
        type: Optional[Literal['process_approval_reminder', 'custom',
                               'publicity']] = None,
        state: Optional[Literal['0', '1', '2', '3']] = None):
    '''
    description: 获取邮箱发送记录列表
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(SendEmailRecord).filter(
            SendEmailRecord.sender_email.like(f'%{sender_email}%')
            if sender_email else True,
            SendEmailRecord.receiver.like(f'%{receiver}%')
            if receiver else True,
            SendEmailRecord.receiver_email.like(f'%{receiver_email}%')
            if receiver_email else True,
            SendEmailRecord.receiver_email == receiver_email
            if receiver_email else True,
            SendEmailRecord.type == type if type else True,
            SendEmailRecord.state == int(state)
            if state in ['0', '1', '2', '3'] else True,
        ).all()
        return response_builder(data, 200)

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/add", response_model=ResponseModel)
async def add_send_email_record(add_send_email_record: AddSendEmailRecordModal,
                                current_user=Depends(get_current_user)):
    '''
    description: 新增邮箱发送记录
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        if current_user.role == '管理员':
            ser = SendEmailRecord(
                sender=add_send_email_record.sender,
                sender_email=add_send_email_record.sender_email,
                receiver=add_send_email_record.receiver,
                receiver_email=add_send_email_record.receiver_email,
                type=add_send_email_record.type,
                title=add_send_email_record.title,
                content=add_send_email_record.content,
                files=add_send_email_record.files,
                remark=add_send_email_record.remark,
                created_by=current_user.name,
                created_by_id=current_user.id)
            data = session.add(ser)
            session.commit()
            return response_builder(data, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/edit", response_model=ResponseModel)
async def edit_send_email_record(
    updated_send_email_record: EditSendEmailRecordModal,
    current_user=Depends(get_current_user)):
    '''
    description: 编辑邮箱发送记录
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            ser = session.query(SendEmailRecord).filter_by(
                id=updated_send_email_record.id).first()

            ser.sender = updated_send_email_record.sender
            ser.sender_email = updated_send_email_record.sender_email,
            ser.receiver = updated_send_email_record.receiver
            ser.receiver_email = updated_send_email_record.receiver_email
            ser.type = updated_send_email_record.type
            ser.title = updated_send_email_record.title
            ser.content = updated_send_email_record.content
            ser.files = updated_send_email_record.files
            ser.remark = updated_send_email_record.remark

            ser.updated_by = current_user.name
            ser.updated_by_id = current_user.id
            session.commit()
            return response_builder(None, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/send", response_model=ResponseModel)
async def send_email(send_ob: SoftDelModel,
                     current_user=Depends(get_current_user)):
    '''
    description: 批量发送邮件
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            idsArr = parse_ids(send_ob.ids)

            sers = session.query(SendEmailRecord).filter(
                SendEmailRecord.id.in_(idsArr), SendEmailRecord.state
                != 0).all()

            if len(sers) > 0:
                updateData = []
                for obj in sers:
                    # 发送测试邮件
                    success = send_email_by_qq.send_email(
                        subject=obj.title,
                        body=obj.content,
                        body_type='html',
                        to_addrs=[obj.receiver_email],
                        cc_addrs=[obj.receiver_email],
                        attachments=[]  # 添加附件
                    )
                    updateData.append({
                        'id': obj.id,
                        'state': 2 if success else 3,
                        'send_time': datetime.now(),
                        'updated_by': current_user.name,
                        'updated_by_id': current_user.id
                    })
                if len(updateData):
                    session.bulk_update_mappings(SendEmailRecord, updateData)
                    session.commit()
                    return response_builder(None, 200)
                else:
                    return response_builder(None, 500, '更新邮箱发送状态失败')
            else:
                return response_builder(None, 500, '未获取到需要发送的邮箱信息')
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/soft_del", response_model=ResponseModel)
async def soft_del_send_email_record(del_ob: SoftDelModel,
                                     current_user=Depends(get_current_user)):
    '''
    description: 批量软删除
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            idsArr = parse_ids(del_ob.ids)
            stmt = update(SendEmailRecord).where(
                SendEmailRecord.id.in_(idsArr)).values(
                    state=0,
                    updated_by=current_user.name,
                    updated_by_id=current_user.id)
            session.execute(stmt)
            session.commit()
            return response_builder(None, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.get('/send_email_list', response_model=SendEmailResponseModel)
async def get_send_email_list():
    '''
    description: 获取发送邮箱列表
    return {*}
    '''
    send_email_list = []
    for key in email_configs:
        if email_configs[key]['sender_password']:
            send_email_list.append({
                'sender_email':
                email_configs[key]['sender_email'],
                'sender_name':
                email_configs[key]['sender_name'],
                'email_type':
                key,
            })
    email_type_list = [{
        'value': 'process_approval_reminder',
        'label': '流程审批提醒'
    }, {
        'value': 'custom',
        'label': '自定义'
    }, {
        'value': 'publicity',
        'label': '宣传'
    }]

    data={
        'send_email_list': send_email_list,
        'email_type_list' : email_type_list
    }
    return response_builder(data, 200)


@router.get('/{ser_Id}', response_model=DetailResponseModel)
async def get_send_email_record_detail(ser_Id: int):
    '''
    description: 获取邮箱发送记录详情
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(SendEmailRecord).filter(
            SendEmailRecord.id == ser_Id).one()

        return response_builder(data, 200 if data else 500)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.delete('/{ser_Id}')
async def del_send_email_record(ser_Id: int,
                                current_user=Depends(get_current_user)):
    '''
    description: 删除邮箱发送记录
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            session.query(SendEmailRecord).filter_by(id=ser_Id).delete()
            session.commit()
            return response_builder(None, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
