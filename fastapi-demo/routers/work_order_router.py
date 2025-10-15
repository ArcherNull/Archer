'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-15 09:08:13
LastEditTime: 2025-05-06 11:42:33
Description: 工单管理
'''
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy import and_, or_, func
from db.db import Database
from models.model import WorkOrder, ProcessNode
from models.response import response_builder, ResponseModel
from typing import Optional, List, Union, Literal
from utils.jwt_util import verify_auth
from utils.comm_util import get_current_user
from routers.process_node_router import ListResponseModel as PNodeListResponseModel

router = APIRouter(prefix="/work_order",
                   tags=["Work_order"],
                   responses={404: {
                       "description": "404 Not Found"
                   }},
                   dependencies=[Depends(verify_auth)])

database = Database()
engine = database.get_db_connection()


# 数据模型
class WorkOrderModel(BaseModel):
    title: str
    content: str
    remark: Optional[str] = None
    bind_ps_id: Optional[int] = None
    bind_time: Optional[datetime] = None
    bind_by: Optional[str] = None
    bind_by_id: Optional[int] = None
    wo_state: int
    wait_approve_ids: Optional[str] = None
    wait_approve_names: Optional[str] = None
    updated_by: Optional[str] = None
    updated_by_id: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_by: str
    created_by_id: int
    created_at: datetime


class AddWorkOrderModel(BaseModel):
    title: str
    content: str
    bind_ps_id: Optional[int] = None
    remark: Optional[str] = None


class EditWorkOrderModel(AddWorkOrderModel):
    id: int


class BindWorkOrderModel(BaseModel):
    id: int
    bind_ps_id: int = None


class WorkOrderFullModel(WorkOrderModel):
    id: int


class ListResponseModel(BaseModel):
    data: List[WorkOrderFullModel] = []
    code: int
    message: Optional[str] = None


class DetailResponseModel(BaseModel):
    data: Union[WorkOrderFullModel, None]
    code: int
    message: Optional[str] = None


@router.get("/list", response_model=ListResponseModel)
async def read_all_work_orders(title: Optional[str] = None,
                               bind_by: Optional[str] = None,
                               bind_ps_id: Optional[int] = None,
                               wo_state: Optional[Literal['0', '1', '2',
                                                          '3']] = None):
    '''
    description: 获取工单列表
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(WorkOrder).filter(
            WorkOrder.title.like(f'%{title}%') if title else True,
            WorkOrder.bind_by.like(f'%{bind_by}%') if bind_by else True,
            WorkOrder.bind_ps_id == bind_ps_id if bind_ps_id else True,
            WorkOrder.wo_state == int(wo_state)
            if wo_state in ['0', '1', '2', '3'] else True,
        ).order_by(WorkOrder.created_at.desc()).all()

        return response_builder(data, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/add", response_model=ResponseModel)
async def add_work_order(add_work_order: AddWorkOrderModel,
                         current_user=Depends(get_current_user)):
    '''
    description: 新增工单
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        workOrder = WorkOrder(
            title=add_work_order.title,
            content=add_work_order.content,
            remark=add_work_order.remark,
            bind_ps_id=add_work_order.bind_ps_id
            if add_work_order.bind_ps_id else None,
            bind_time=datetime.now() if add_work_order.bind_ps_id else None,
            bind_by=current_user.name if add_work_order.bind_ps_id else None,
            bind_by_id=current_user.id if add_work_order.bind_ps_id else None,
            created_by=current_user.name,
            created_by_id=current_user.id)
        session.add(workOrder)
        session.flush()

        # 如果用户主动绑定了流程
        if add_work_order.bind_ps_id:
            pNodes = session.query(ProcessNode).filter(
                ProcessNode.ps_id == add_work_order.bind_ps_id,
                ProcessNode.is_original_node == 1, ProcessNode.pn_state
                != 0).all()
            if len(pNodes) > 0:
                # 新复制流程节点
                print('新复制流程节点')
                insertData = []
                for obj in pNodes:
                    cData = {
                        'ps_id': obj.ps_id,
                        'title': obj.title,
                        'remark': obj.remark,
                        'description': obj.description,
                        'approve_user_ids': obj.approve_user_ids,
                        'approve_user_names': obj.approve_user_names,
                        'bind_wo_id': workOrder.id,
                        'is_original_node': 0,
                        'order': obj.order,
                        'created_by': current_user.name,
                        'created_by_id': current_user.id,
                    }
                    insertData.append(cData)
                if insertData[0]:
                    workOrder.wait_approve_ids = insertData[0]['approve_user_ids']
                    workOrder.wait_approve_names = insertData[0]['approve_user_names']

                session.bulk_insert_mappings(ProcessNode, insertData)
                session.commit()
                return response_builder(None, 200)
            else:
                return response_builder(None, 500, '当前绑定的流程无流程节点，绑定不成功')
        else:
            session.commit()
            return response_builder(None, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/edit", response_model=ResponseModel)
async def edit_work_order(updated_work_order: EditWorkOrderModel,
                          current_user=Depends(get_current_user)):
    '''
    description: 编辑工单
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        workOrder = session.query(WorkOrder).filter_by(
            id=updated_work_order.id).first()

        if updated_work_order.bind_ps_id:
            # 以前存在流程，需要删除以前流程再绑定新流程
            if workOrder.bind_ps_id:
                session.query(ProcessNode).filter(
                    ProcessNode.bind_wo_id == workOrder.id,
                    ProcessNode.is_original_node == 0).delete(
                        synchronize_session='fetch')
                session.flush()

            pNodes = session.query(ProcessNode).filter(
                ProcessNode.ps_id == updated_work_order.bind_ps_id,
                ProcessNode.is_original_node == 1, ProcessNode.pn_state
                != 0).order_by(ProcessNode.order.asc()).all()

            if pNodes:
                insertData = []
                for obj in pNodes:
                    cData = {
                        'ps_id': obj.ps_id,
                        'title': obj.title,
                        'remark': obj.remark,
                        'description': obj.description,
                        'approve_user_ids': obj.approve_user_ids,
                        'approve_user_names': obj.approve_user_names,
                        'bind_wo_id': workOrder.id,
                        'is_original_node': 0,
                        'order': obj.order,
                        'created_by': current_user.name,
                        'created_by_id': current_user.id,
                    }
                    insertData.append(cData)
                if insertData:
                    session.bulk_insert_mappings(ProcessNode, insertData)

                workOrder.title = updated_work_order.title
                workOrder.content = updated_work_order.content
                workOrder.bind_ps_id = updated_work_order.bind_ps_id
                workOrder.remark = updated_work_order.remark
                workOrder.wo_state = 1
                workOrder.bind_time = datetime.now()
                workOrder.bind_by = current_user.name
                workOrder.bind_by_id = current_user.id
                workOrder.updated_by = current_user.name
                workOrder.updated_by_id = current_user.id
                if insertData[0]:
                    workOrder.wait_approve_ids = insertData[0]['approve_user_ids']
                    workOrder.wait_approve_names = insertData[0]['approve_user_names']

                session.commit()
                return response_builder(None, 200)
            else:
                return response_builder(None, 500, '绑定流程不能为空')
        else:
            return response_builder(None, 500, '绑定流程id不能为空')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/bind", response_model=ResponseModel)
async def bind_process(bind_work_order: BindWorkOrderModel,
                       current_user=Depends(get_current_user)):
    '''
    description: 管理员，给工单绑定流程; 用于当用户选错了服务流程，管理员可以更改流程
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if current_user.role == '管理员':
            workOrder = session.query(WorkOrder).filter(
                WorkOrder.id == bind_work_order.id).first()
            if bind_work_order.bind_ps_id:
                # 以前存在流程，需要删除以前流程再绑定新流程
                if workOrder.bind_ps_id:
                    session.query(ProcessNode).filter(
                        ProcessNode.ps_id == workOrder.bind_ps_id,
                        ProcessNode.pn_state != 0,
                        ProcessNode.is_original_node == 0).filter(
                            or_(ProcessNode.created_by_id == current_user.id,
                                ProcessNode.updated_by_id ==
                                current_user.id)).delete(
                        synchronize_session='fetch')
                    session.flush()

                pNodes = session.query(ProcessNode).filter(
                    ProcessNode.ps_id == bind_work_order.bind_ps_id,
                    ProcessNode.is_original_node == 1, ProcessNode.pn_state
                    != 0).order_by(ProcessNode.order.asc()).all()

                insertData = []
                for obj in pNodes:
                    cData = {
                        'ps_id': obj.ps_id,
                        'title': obj.title,
                        'remark': obj.remark,
                        'description': obj.description,
                        'approve_user_ids': obj.approve_user_ids,
                        'approve_user_names': obj.approve_user_names,
                        'bind_wo_id': workOrder.id,
                        'is_original_node': 0,
                        'order': obj.order,
                        'created_by': current_user.name,
                        'created_by_id': current_user.created_by_id,
                    }
                    insertData.append(cData)
                session.bulk_insert_mappings(ProcessNode, insertData)

                workOrder.bind_ps_id = bind_work_order.bind_ps_id
                workOrder.wo_state = 1
                workOrder.bind_time = datetime.now
                workOrder.bind_by = current_user.name
                workOrder.bind_by_id = current_user.id
                
                if insertData[0]:
                    workOrder.wait_approve_ids = insertData[0]['approve_user_ids']
                    workOrder.wait_approve_names = insertData[0]['approve_user_names']
                    
                session.commit()
                return response_builder(None, 200)
            else:
                return response_builder(None, 500, '绑定流程不能为空')
        else:
            return response_builder(None, 500, '只有管理员才能绑定流程')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get('/process', response_model=PNodeListResponseModel)
async def get_work_order_process(woId: int):
    '''
    description: 通过工单id获取流程节点数据
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        wOrder = session.query(WorkOrder).filter(WorkOrder.id == woId).first()
        print(wOrder.bind_ps_id)
        if wOrder.bind_ps_id:
            pData = session.query(ProcessNode).filter(
                ProcessNode.ps_id == wOrder.bind_ps_id,
                ProcessNode.bind_wo_id == woId, 
                ProcessNode.pn_state != 0,
                ProcessNode.is_original_node == 0).order_by(
                    ProcessNode.order.desc()).all()
            session.commit()

            return response_builder(pData, 200)
        else:
            return response_builder(None, 500, '未获取到流程节点数据')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get('/approval_process', response_model=ListResponseModel)
async def get_work_order_approval_process(
        current_user=Depends(get_current_user)):
    '''
    description: 获取工单待审批流程
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        userId = current_user.id
        
        woList = session.query(WorkOrder).filter(
            WorkOrder.wo_state == 1,
            func.find_in_set(WorkOrder.wait_approve_ids, str(userId)) if current_user.role !='管理员' else True ).all()
        session.commit()
        return response_builder(woList, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get('/{woId}', response_model=DetailResponseModel)
async def get_work_order_detail(woId: int):
    '''
    description: 获取工单详情
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(WorkOrder).filter(
            and_(WorkOrder.id == woId)).one()
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


@router.delete('/{woId}')
async def del_work_order(woId: int, current_user=Depends(get_current_user)):
    '''
    description: 删除工单
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        del_data = session.query(WorkOrder).filter(
            WorkOrder.id == woId).first()
        if del_data.created_by_id == current_user.id or current_user.role == '管理员':
            print('已删除数据的数据量为:', del_data)
            if del_data:
                # 如果存在流程节点则删除
                if del_data.bind_ps_id:
                    # 这种方式是批量删除
                    session.query(ProcessNode).filter(
                        ProcessNode.is_original_node == 0,
                        ProcessNode.bind_wo_id == del_data.id,
                        ProcessNode.ps_id == WorkOrder.bind_ps_id).delete(
                            synchronize_session=False)
                    session.flush()

                # 这种方式是单个删除
                session.delete(del_data)
                session.commit()

                return response_builder(None, 200)
            else:
                return response_builder(None, 500, '需要删除的数据不存在')
        else:
            return response_builder(None, 500, '流程只能本人或者管理员去删除')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
