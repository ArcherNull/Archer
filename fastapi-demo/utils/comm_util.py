'''
Author: junsong Chen 779217162@qq.com
Date: 2025-02-22 09:49:43
LastEditTime: 2025-04-23 14:28:01
Description: 
'''
from fastapi.responses import JSONResponse
from models.response import response_builder
from fastapi import status, Request
from utils.jwt_util import verify_jwt
from db.db import Database
from sqlalchemy.future import select
from sqlalchemy import delete, func, text, or_
from models.model import User, CaptchaCodeInfo


class AuthException(Exception):
    """
    自定义令牌异常AuthException
    """

    def __init__(self, data: str = None, message: str = None):
        self.data = data
        self.message = message


class ServiceException(Exception):
    """
    自定义服务异常ServiceException
    """

    def __init__(self, data: str = None, message: str = None):
        self.data = data
        self.message = message


class LoginException(Exception):
    """
    自定义登录异常LoginException
    """

    def __init__(self, data: str = None, message: str = None):
        self.data = data
        self.message = message


def get_json_response(code=status.HTTP_200_OK, msg="操作成功"):
    """
    description: 鉴权不通过响应
    return {*}
    """
    return JSONResponse(status_code=code,
                        content=response_builder(status_code=code,
                                                 message=msg))


async def get_current_user(request: Request = Request):
    """
    description: 获取当前用户信息
    param {Request} request 请求实例
    return {*}
    """
    if isinstance(request, Request):
        token = request.headers.get("authorization")
        if token:
            print('获取得到token=====>', token)
            if token.startswith('Bearer'):
                p_token = token.split(' ')[1]
                verify_result = verify_jwt(p_token)
                if verify_result in ['JWT has expired', 'Invalid JWT']:
                    raise AuthException(data='', message='token已失效，请重新登录')
                else:
                    user_id = verify_result.get('id')
                    if user_id:
                        database = Database()
                        async_engine = database.get_db_async_connection()
                        AsySession = database.get_db_async_session(
                            async_engine)
                        async with AsySession() as session:
                            result = await session.execute(
                                select(User).where(User.id == user_id,
                                                   User.state == 1))
                            user = result.scalars().first()
                            print('当前用户=====>', user)
                            if user:
                                return user
                            else:
                                raise AuthException(data='',
                                                    message='当前用户不存在或被禁用')
                    else:
                        raise AuthException(data='', message='用户token不合法')
        else:
            raise AuthException(data='', message='未授权访问')
    else:
        raise AuthException(data='', message='未授权访问')


async def validate_captcha(code):
    """
    description: 校验验证码
    param {str} code 验证码
    return {*}
    """
    if code:
        database = Database()
        async_engine = database.get_db_async_connection()
        AsySession = database.get_db_async_session(async_engine)

        async with AsySession() as session:
            result = await session.execute(
                select(CaptchaCodeInfo).where(
                    CaptchaCodeInfo.code == code,
                    func.date_add(CaptchaCodeInfo.created_at,
                                  text("INTERVAL expire_diff SECOND"))
                    >= func.now()))
            c_info = result.scalars().first()
            # 清空过时的验证码
            if c_info:
                await session.execute(
                    delete(CaptchaCodeInfo).where(
                        or_(
                            CaptchaCodeInfo.code == code,
                            CaptchaCodeInfo.created_at
                            < func.date_sub(func.now(),
                                            text('INTERVAL 1 DAY')))))
                await session.commit()  # 提交事务
                return True
            else:
                return '无效验证码'
    else:
        return '请输入验证码'


def has_key_with_value(d: dict, key: str, value: any = None):
    """
    description: 检验字典中是否有属性，并且该属性是否存在某个值
    param {dict} d
    param {str} key
    param {any} value
    return {*}
    """
    return key in d and d[key] != value


def parse_ids(id_str: str):
    """
    description: 解析ids字符串成数组
    param {str} id_str
    return {*}
    """
    return [int(x) for x in id_str.split(',') if x]


def parse_safe_ids(id_str: str):
    """
    description: 解析ids字符串成数组,如果ids中存在非数字的字符串
    param {str} id_str
    return {*}
    """
    ids = []
    for x in id_str.split(','):
        if x:
            try:
                ids.append(int(x))  # 或 float(x) 支持浮点数
            except ValueError:
                pass  # 跳过非数字的字符串
    return ids
