'''
Author: junsong Chen 779217162@qq.com
Date: 2025-02-26 19:10:31
LastEditTime: 2025-07-12 15:55:03
Description: 用户管理1
'''
from datetime import datetime, date
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse

from sqlalchemy import and_, or_
from sqlalchemy.orm import defer
from db.db import Database
from models.model import User
from models.response import response_builder, ResponseModel
from typing import Optional, List, Union, Literal
from utils.jwt_util import verify_auth
from utils.comm_util import get_current_user, bytes2file_response
from utils.pwd_util import PwdUtil
from utils.excel_util import ExcelUtil


router = APIRouter(prefix="/user",
                   tags=["User"],
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


# 数据模型
class UserModel(BaseModel):
    name: Optional[str] = Field(default=None, description='用户名')
    nick_name: str = Field(description='用户昵称')
    role: str = Field(description='用户角色')
    email: str = Field(description='邮箱')
    sex: Literal['0', '1', '2'] = Field(description='用户性别，0-男，1-女，2-未知')
    birthday: Optional[date] = Field(description='用户生日')
    id: int
    state: Literal[0, 1] = Field(description='用户状态，0-禁用，1-启用')
    created_at: datetime
    updated_at: datetime = None


class UserFullModel(UserModel):
    password: str


class ListResponseModel(BaseModel):
    data: List[UserModel] = []
    code: int
    message: Optional[str] = None


class DetailResponseModel(BaseModel):
    data: Union[UserModel, None]
    code: int
    message: Optional[str] = None


class InfoResponseModel(BaseModel):
    data: Union[UserModel, None]
    code: int
    message: Optional[str] = None


class ResetPwdModel(BaseModel):
    newPwd: str
    oldPwd: str


@router.get("/list", response_model=ListResponseModel)
async def read_all_users(name: Optional[str] = None,
                         nick_name: Optional[str] = None,
                         role: Optional[str] = None,
                         email: Optional[str] = None,
                         state: Optional[Literal['0', '1']] = None):
    '''
    description: 获取用户列表
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(User).filter(
            User.name.like(f'%{name}%') if name else True,
            User.nick_name.like(f'%{nick_name}%') if nick_name else True,
            User.role == role if role else True,
            User.email.like(f'%{email}%') if email else True,
            User.state == int(state) if state in ['0', '1'] else True,
        ).options(defer(User.password)).order_by(User.updated_at.desc(),
                                                 User.created_at.desc()).all()
        return response_builder(data, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/add", response_model=ResponseModel)
async def add_user(add_user: UserModel):
    '''
    description: 新增用户
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        user = User(name=add_user.name,
                    role=add_user.role,
                    state=add_user.state,
                    email=add_user.email)
        data = session.add(user)
        session.commit()
        return response_builder(data, 200)
    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/edit", response_model=ResponseModel)
async def edit_user(updated_user: UserModel):
    '''
    description: 编辑用户
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        user = session.query(User).filter_by(id=updated_user.id).first()
        user.name = updated_user.name
        user.role = updated_user.role
        user.email = updated_user.email
        user.sex = updated_user.sex
        user.birthday = updated_user.birthday
        user.state = updated_user.state
        session.commit()
        return response_builder(None, 200)
    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post('/getUserInfo', response_model=InfoResponseModel)
async def get_user_info_by_token(current_user=Depends(get_current_user)):
    '''
    description: 通过token获取用户信息
    return {*}
    '''
    user = User(
        id=current_user.id,
        name=current_user.name,
        nick_name=current_user.nick_name,
        role=current_user.role,
        email=current_user.email,
        sex=current_user.sex,
        birthday=current_user.birthday,
        state=current_user.state,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )
    return response_builder(user, 200)


@router.post('/resetPwd', response_model=ResponseModel)
async def reset_user_password(reset_pwd_data: ResetPwdModel,
                              current_user=Depends(get_current_user)):
    '''
    description: 重置密码
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if reset_pwd_data.newPwd != reset_pwd_data.oldPwd:
            isPass = PwdUtil.verify_password(reset_pwd_data.oldPwd,
                                             current_user.password)
            if isPass:
                hash_new_pwd = PwdUtil.get_password_hash(reset_pwd_data.newPwd)
                user = session.query(User).filter_by(
                    id=current_user.id).first()
                user.password = hash_new_pwd
                session.commit()
                return response_builder(None, 200)
            else:
                return response_builder(None, 500, '原密码错误')
        else:
            return response_builder(None, 500, '新密码和原密码不能一样')

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
        
        
@router.post('/importTemplate')
async def get_user_import_template():
    '''
    description: 获取导入模板
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        header_list = ['部门编号', '登录名称', '用户名称', '用户邮箱', '手机号码', '用户性别', '帐号状态']
        selector_header_list = ['用户性别', '帐号状态']
        option_list = [{'用户性别': ['男', '女', '未知']}, {'帐号状态': ['正常', '停用']}]
        binary_data = ExcelUtil.get_excel_template(
            header_list=header_list, selector_header_list=selector_header_list, option_list=option_list
        )
        
        return StreamingResponse(
            status_code=status.HTTP_200_OK, content=bytes2file_response(binary_data)
        )
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
        

@router.post('/importData', response_model=ResponseModel)
async def get_user_import_data():
    '''
    description: 获取导入excel并解析数据
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        header_list = ['用户名', '用户昵称', '角色', '邮箱', '用户性别', '用户性别', '状态']
        selector_header_list = ['用户性别', '帐号状态']
        option_list = [{'用户性别': ['男', '女', '未知']}, {'状态': ['正常', '停用']}]
        binary_data = ExcelUtil.get_excel_template(
            header_list=header_list, selector_header_list=selector_header_list, option_list=option_list
        )
        
        return StreamingResponse(
            status_code=status.HTTP_200_OK, content=binary_data
        )

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get('/{id}', response_model=DetailResponseModel)
async def get_user_detail(id: int):
    '''
    description: 获取用户详情
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(User).filter(and_(User.id == id)).one()
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


@router.delete('/{user_id}')
async def del_user(user_id: int):
    '''
    description: 删除用户
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        del_data = session.query(User).filter_by(id=user_id).delete()
        print('已删除数据的数据量为:', del_data)
        session.commit()
        session.close()

        code = 200
        if del_data is None:
            code = 500
        else:
            code = 200

        return response_builder(None, code)

    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
