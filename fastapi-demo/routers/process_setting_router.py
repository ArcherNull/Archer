'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-16 09:24:27
LastEditTime: 2025-04-19 21:36:55
Description: 流程设置
'''
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy import and_, update, exists
from db.db import Database
from models.model import ProcessSetting, ProcessNode
from models.response import response_builder, ResponseModel
from typing import Optional, List, Union, Literal
from utils.jwt_util import verify_auth
from utils.comm_util import get_current_user, has_key_with_value, parse_ids

router = APIRouter(prefix="/process_setting",
                   tags=["process_setting"],
                   responses={404: {
                       "description": "404 Not Found"
                   }},
                   dependencies=[Depends(verify_auth)])

database = Database()
engine = database.get_db_connection()


# 数据模型
class ProcessSettingModel(BaseModel):
    title: str
    content: str
    remark: Optional[str] = None
    process_state: int
    updated_by: Optional[str] = None
    updated_by_id: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_by: str
    created_by_id: int
    created_at: datetime


class ProcessNodeModel(BaseModel):
    title: str
    description: Optional[str] = None
    remark: Optional[str] = None
    order: int
    approve_user_ids: str
    is_original_node: int
    ps_id: Optional[int] = None
    updated_by: Optional[str] = None
    updated_by_id: Optional[int] = None
    created_by: Optional[str] = None
    created_by_id: Optional[int] = None


class AddProcessSettingModel(BaseModel):
    title: str
    content: str
    process_state: Optional[int] = None
    remark: Optional[str] = None


class AddOrEditProcessSettingModel(BaseModel):
    id: Optional[int] = None
    title: str
    content: str
    remark: Optional[str] = None
    process_state: Optional[Literal[0, 1]] = None
    processNodeList: List[dict] = []


class EditProcessSettingModel(AddProcessSettingModel):
    id: int

class EditProcessSettingStateModel(BaseModel):
    id: int
    process_state: Literal[0, 1]

class SoftDelModel(BaseModel):
    ids: str


class ProcessSettingFullModel(ProcessSettingModel):
    id: int


class ListResponseModel(BaseModel):
    data: List[ProcessSettingFullModel] = []
    code: int
    message: Optional[str] = None


class DetailResponseModel(BaseModel):
    data: Union[ProcessSettingFullModel, None]
    code: int
    message: Optional[str] = None


@router.get("/list", response_model=ListResponseModel)
async def read_all_process_settings(
        title: Optional[str] = None,
        process_state: Optional[Literal['0', '1']] = None):
    '''
    description: 获取流程设置列表
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(ProcessSetting).filter(
            ProcessSetting.title.like(f'%{title}%') if title else True,
            ProcessSetting.process_state == int(process_state)
            if process_state in ['0', '1'] else True,
        ).order_by(ProcessSetting.updated_at.desc(),
                   ProcessSetting.created_at.desc()).all()
        return response_builder(data, 200)

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/add", response_model=ResponseModel)
async def add_process_setting(add_process_setting: AddProcessSettingModel,
                              current_user=Depends(get_current_user)):
    '''
    description: 新增流程设置
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        if current_user.role == '管理员':
            processSetting = ProcessSetting(
                title=add_process_setting.title,
                content=add_process_setting.content,
                remark=add_process_setting.remark,
                process_state=add_process_setting.process_state,
                created_by=current_user.name,
                created_by_id=current_user.id)
            data = session.add(processSetting)
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
async def edit_process_setting(
    updated_process_setting: EditProcessSettingModel,
    current_user=Depends(get_current_user)):
    '''
    description: 编辑流程设置
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            processSetting = session.query(ProcessSetting).filter_by(
                id=updated_process_setting.id).first()
            processSetting.title = updated_process_setting.title
            processSetting.content = updated_process_setting.content
            processSetting.process_state = updated_process_setting.process_state,
            processSetting.remark = updated_process_setting.remark
            processSetting.updated_by = current_user.name
            processSetting.updated_by_id = current_user.id
            session.commit()
            return response_builder(None, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/edit_process_state", response_model=ResponseModel)
async def edit_process_state(
    updated_process_setting: EditProcessSettingStateModel,
    current_user=Depends(get_current_user)):
    '''
    description: 编辑流程设置状态
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            processSetting = session.query(ProcessSetting).filter_by(
                id=updated_process_setting.id).first()
            processSetting.process_state = updated_process_setting.process_state,
            processSetting.updated_by = current_user.name
            processSetting.updated_by_id = current_user.id
            session.commit()
            return response_builder(None, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/createOrEdit", response_model=ResponseModel)
async def create_process(ps_data: AddOrEditProcessSettingModel,
                         current_user=Depends(get_current_user)):
    '''
    description: 创建或编辑流程，包含流程节点的创建
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        if current_user.role == '管理员':
            if not ps_data.processNodeList:
                return response_builder(None, 500, '流程节点不能为空')
            else:
                if not ps_data.id:
                    print('新增流程')
                    processSetting = ProcessSetting(
                        title=ps_data.title,
                        content=ps_data.content,
                        process_state=ps_data.process_state,
                        remark=ps_data.remark,
                        created_by=current_user.name,
                        created_by_id=current_user.id)
                    # add方法知识待添加标识，不存在返回值
                    session.add(processSetting)
                    # 先插入，但并不结束事务
                    session.flush()
                    # 检索新插入的数据
                    inserted_ps = session.query(ProcessSetting).filter(
                        ProcessSetting.title == ps_data.title).first()

                    # 给列表中的对象添加属性
                    for obj in ps_data.processNodeList:
                        obj['ps_id'] = inserted_ps.id
                        obj['created_by'] = current_user.name
                        obj['created_by_id'] = current_user.id

                    # Bulk insert mappings
                    session.bulk_insert_mappings(ProcessNode,
                                                 ps_data.processNodeList)
                    session.commit()
                    return response_builder(None, 200)
                else:
                    print('编辑流程')
                    psData = session.query(ProcessSetting).filter_by(
                        id=ps_data.id).first()
                    if psData:
                        psData.title = ps_data.title
                        psData.content = ps_data.content
                        psData.remark = ps_data.remark
                        psData.process_state = ps_data.process_state
                        psData.updated_by = current_user.name
                        psData.updated_by_id = current_user.id

                        insertedNodeList = []
                        updatedNodeList = []
                        # 给列表中的对象添加属性
                        for obj in ps_data.processNodeList:
                            obj['ps_id'] = psData.id
                            if has_key_with_value(obj, 'id'):
                                obj['updated_by'] = current_user.name
                                obj['updated_by_id'] = current_user.id
                                updatedNodeList.append(obj)
                            else:
                                obj['created_by'] = current_user.name
                                obj['created_by_id'] = current_user.id
                                insertedNodeList.append(obj)

                        # 批量更新节点数据
                        if len(updatedNodeList):
                            session.bulk_update_mappings(
                                ProcessNode, updatedNodeList)

                        # 批量插入新增节点数据
                        if len(insertedNodeList):
                            session.bulk_insert_mappings(
                                ProcessNode, insertedNodeList)

                        session.commit()
                        return response_builder(None, 200)
                    else:
                        return response_builder(None, 500, '未获取到该流程信息')
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post('/soft_del')
async def soft_del_process_setting(del_ob: SoftDelModel,
                                   current_user=Depends(get_current_user)):
    '''
    description: 批量软删除流程设置
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            idsArr = parse_ids(del_ob.ids)
            stmt = update(ProcessSetting).where(
                ProcessSetting.id.in_(idsArr)).values(
                    process_state=0,
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
        session.close()


@router.get('/available')
async def get_available_process():
    '''
    description: 获取可使用的的流程, 存在原始流程节点，并且是
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        data = session.query(ProcessSetting).filter(
            ProcessSetting.process_state == 1,
            exists().where(ProcessSetting.id == ProcessNode.ps_id,
                           ProcessNode.pn_state == 1,
                           ProcessNode.is_original_node == 1)).all()
        session.commit()
        return response_builder(data, 200)

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get('/process_node/{ps_id}')
async def get_process_node_by_id(ps_id: int):
    '''
    description: 通过流程设置id获取流程节点数据
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        data = session.query(ProcessNode).filter(
            ProcessNode.ps_id == ps_id, ProcessNode.is_original_node == 1,
            ProcessNode.pn_state != 0).order_by(ProcessNode.order.asc()).all()
        session.commit()
        return response_builder(data, 200)

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get('/{ps_id}', response_model=DetailResponseModel)
async def get_process_setting_detail(ps_id: int):
    '''
    description: 获取流程设置详情
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(ProcessSetting).filter(
            and_(ProcessSetting.id == ps_id)).one()
        code = 200
        if data is None:
            code = 500
        else:
            code = 200
        return response_builder(data, code)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.delete('/{ps_id}')
async def del_process_setting(ps_id: int,
                              current_user=Depends(get_current_user)):
    '''
    description: 删除流程设置
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            del_data = session.query(ProcessSetting).filter_by(
                id=ps_id).delete()
            print('已删除数据的数据量为:', del_data)
            session.commit()
            return response_builder(None, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
