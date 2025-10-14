'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-16 09:24:27
LastEditTime: 2025-04-24 20:16:56
Description: 流程节点
'''
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy import and_, update, func
from db.db import Database
from models.model import ProcessNode, WorkOrder
from models.response import response_builder, ResponseModel
from typing import Optional, List, Union, Literal
from utils.jwt_util import verify_auth
from utils.comm_util import get_current_user, parse_ids

router = APIRouter(prefix="/process_node",
                   tags=["process_node"],
                   responses={404: {
                       "description": "404 Not Found"
                   }},
                   dependencies=[Depends(verify_auth)])

database = Database()
engine = database.get_db_connection()


# 数据模型
class ProcessNodeModel(BaseModel):
    ps_id: int
    approve_user_ids: str
    approve_user_names: str
    pn_state: int
    is_original_node: int
    order: int
    title: str
    description: Optional[str] = None
    remark: Optional[str] = None
    ap_by: Optional[str] = None
    bind_wo_id: Optional[int] = None
    ap_by_id: Optional[int] = None
    ap_time: Optional[datetime] = None
    ap_remark: Optional[str] = None
    anp_by: Optional[str] = None
    anp_by_id: Optional[int] = None
    anp_time: Optional[datetime] = None
    anp_remark: Optional[str] = None
    updated_by: Optional[str] = None
    updated_by_id: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_by: str
    created_by_id: int
    created_at: datetime


class AddProcessNodeModel(BaseModel):
    ps_id: int
    title: str
    approve_user_ids: str
    pn_state: int
    is_original_node: int
    order: int


class EditProcessNodeModel(AddProcessNodeModel):
    id: int


class ApprovalProcessNodeModel(BaseModel):
    id: int
    user_id: int
    type: Literal['pass', 'noPass']
    remark: Optional[str] = None


class SoftDelModel(BaseModel):
    ids: str


class ProcessNodeFullModel(ProcessNodeModel):
    id: int


class ListResponseModel(BaseModel):
    data: List[ProcessNodeFullModel] = []
    code: int
    message: Optional[str] = None


class DetailResponseModel(BaseModel):
    data: Union[ProcessNodeFullModel, None]
    code: int
    message: Optional[str] = None


@router.get("/list", response_model=ListResponseModel)
async def read_all_process_nodes():
    '''
    description: 获取流程节点列表
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(ProcessNode).filter().all()
        return response_builder(data, 200)

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/add", response_model=ResponseModel)
async def add_process_node(add_process_node: AddProcessNodeModel,
                           current_user=Depends(get_current_user)):
    '''
    description: 新增流程节点
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        if current_user.role == '管理员':
            processNode = ProcessNode(
                ps_id=add_process_node.ps_id,
                title=add_process_node.title,
                approve_user_ids=add_process_node.approve_user_ids,
                is_original_node=add_process_node.is_original_node,
                order=add_process_node.order,
                created_by=current_user.name,
                created_by_id=current_user.id)
            data = session.add(processNode)
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
async def edit_process_node(updated_process_node: EditProcessNodeModel,
                            current_user=Depends(get_current_user)):
    '''
    description: 编辑流程节点
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            processNode = session.query(ProcessNode).filter_by(
                id=updated_process_node.id).first()
            processNode.ps_id = updated_process_node.ps_id
            processNode.title = updated_process_node.title,
            processNode.approve_user_ids = updated_process_node.approve_user_ids
            processNode.is_original_node = updated_process_node.is_original_node
            processNode.order = updated_process_node.order
            processNode.updated_by = current_user.name
            processNode.updated_by_id = current_user.id
            session.commit()
            return response_builder(None, 200)
        else:
            return response_builder(None, 500, '只有管理员角色才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/approval", response_model=ResponseModel)
async def approval_process_node(approval_data: ApprovalProcessNodeModel,
                                current_user=Depends(get_current_user)):
    '''
    description: 审核流程节点
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员' or current_user.id == approval_data.user_id:
            if approval_data.type == 'noPass' and not approval_data.remark:
                return response_builder(None, 500, '审批拒绝需要填写理由')
            else:
                processNode = session.query(ProcessNode).filter(
                    ProcessNode.id == approval_data.id,
                    ProcessNode.pn_state == 1,
                    func.find_in_set(ProcessNode.approve_user_ids, str(current_user.id)) if current_user.role != '管理员' else True,
                    ).first()
                
                if processNode:
                    woData = session.query(WorkOrder).filter(WorkOrder.id == processNode.bind_wo_id).one()
                    if approval_data.type == 'pass':
                        processNode.pn_state = 2
                        processNode.ap_by = current_user.name
                        processNode.ap_by_id = current_user.id
                        processNode.ap_time = datetime.now()
                        processNode.ap_remark = approval_data.remark
                        session.flush()
                        
                        pList = session.query(ProcessNode).filter(ProcessNode.bind_wo_id == processNode.bind_wo_id, ProcessNode.pn_state == 1).order_by(ProcessNode.order.asc()).all()
                        print('pList123123123', pList)
                        if not pList:
                            woData.wo_state = 2
                        else:
                            fpInfo = pList[0]
                            woData.wo_state = 1
                            woData.wait_approve_ids = fpInfo.approve_user_ids
                            woData.wait_approve_names = fpInfo.approve_user_names
                            
                            

                    else:
                        processNode.pn_state = 3
                        processNode.anp_by = current_user.name
                        processNode.anp_by_id = current_user.id
                        processNode.anp_time = datetime.now()
                        processNode.anp_remark = approval_data.remark
                        woData.wo_state = 3
                        
                        woData.wait_approve_ids = None
                        woData.wait_approve_names = None
                        
                        session.flush()

                    session.commit()
                    return response_builder(None, 200)
                else:
                    return response_builder(None, 500, '未获取到该节点或该节点不是待审批状态或不是流程对应审批人')
        else:
            return response_builder(None, 500, '只有管理员角色或者审批者才有权限操作')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/soft_del", response_model=ResponseModel)
async def soft_del_process_node(del_ob: SoftDelModel,
                                current_user=Depends(get_current_user)):
    '''
    description: 批量软删除节点
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            idsArr = parse_ids(del_ob.ids)
            stmt = update(ProcessNode).where(
                ProcessNode.id.in_(idsArr)).values(
                    pn_state=0,
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


@router.get('/{ps_id}', response_model=DetailResponseModel)
async def get_process_node_detail(ps_id: int):
    '''
    description: 获取流程节点详情
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(ProcessNode).filter(
            and_(ProcessNode.id == ps_id)).one()
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
async def del_process_node(ps_id: int, current_user=Depends(get_current_user)):
    '''
    description: 删除流程节点
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            del_data = session.query(ProcessNode).filter_by(id=ps_id).delete()
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
