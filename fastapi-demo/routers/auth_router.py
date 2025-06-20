'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-15 09:51:30
LastEditTime: 2025-04-29 09:09:09
Description: 
'''
import uuid
import os
from datetime import timedelta
from pydantic import BaseModel
from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from db.db import Database
from sqlalchemy import func, text
from models.model import User, CaptchaCodeInfo
from models.response import response_builder, ResponseModel
from typing import Optional, Literal
from utils.pwd_util import PwdUtil
from utils.jwt_util import generate_jwt, jwt_expire_minutes
from utils.captcha_util import generate_base64_captcha
from utils.comm_util import validate_captcha
from utils.email_util import send_email_by_qq

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
    responses={404: {
        "description": "404 Not Found"
    }},
)

database = Database()
engine = database.get_db_connection()


# 数据模型
class RegisterModel(BaseModel):
    name: Optional[str] = None
    nick_name: str
    role: str
    email: str
    password: str
    confirmPassword: str


# 数据模型
class LoginModel(BaseModel):
    nick_name: Optional[str] = None
    email: Optional[str] = None
    captcha: Optional[str] = None
    password: str


@router.get("/captcha", response_model=ResponseModel)
async def get_captcha(type: Literal['login'] = 'login'):
    '''
    description: 获取验证码
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        obj = generate_base64_captcha()
        code = obj['code']
        base64Str = obj['base64']
        cData = CaptchaCodeInfo(code=code, type=type)
        session.add(cData)
        session.commit()
        return response_builder(base64Str, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get("/secret_key", response_model=ResponseModel)
async def get_secret_key(pwd: str):
    '''
    description: 获取密钥
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        cData = CaptchaCodeInfo(code=pwd, type='secretKey', expire_diff=900)
        session.add(cData)
        session.commit()
        hashedStr = PwdUtil.get_md5_hash(pwd)

        return response_builder(f'{cData.id}:{hashedStr}', 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.get("/redirect", response_model=ResponseModel)
async def redirect(email: str, secretkey: str, redirectUrl: str):
    '''
    description: 获取验证码
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        secretArr = secretkey.split(':')
        codeInd = int(secretArr[0])
        secret = secretArr[1]
        if codeInd and secret:
            cInfo = session.query(CaptchaCodeInfo).filter(
                CaptchaCodeInfo.id == codeInd,
                CaptchaCodeInfo.type == 'secretKey',
                func.date_add(CaptchaCodeInfo.created_at,
                              text('INTERVAL expire_diff SECOND'))
                >= func.now()).first()
            session.flush()
            print('cInfo', cInfo)
            if cInfo:
                isPass = PwdUtil.verify_md5_str(cInfo.code, secret)
                if isPass:
                    user = session.query(User).filter_by(email=email).one()
                    if user:
                        session_id = str(uuid.uuid4())
                        access_token_expires = timedelta(
                            minutes=jwt_expire_minutes)

                        token = generate_jwt(
                            data={
                                'session_id': session_id,
                                'id': user.id,
                                'name': user.name,
                                'nick_name': user.nick_name,
                                'role': user.role,
                                'email': user.email,
                            },
                            expires_delta=access_token_expires,
                        )
                        return RedirectResponse(
                            url=f'{redirectUrl}?token={token}',
                            status_code=302)
                    else:
                        return response_builder(None, 500, '用户未注册')
                else:
                    return response_builder(None, 500, '用户未注册')
            else:
                return response_builder(None, 500, '密钥失效')
        else:
            return response_builder(None, 500, '密钥不符合格式')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()


@router.post("/register", response_model=ResponseModel)
async def register(register_user: RegisterModel):
    '''
    description: 注册
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if register_user.password == register_user.confirmPassword:
            user = User(
                name=register_user.name,
                nick_name=register_user.nick_name,
                role=register_user.role,
                email=register_user.email,
                password=PwdUtil.get_password_hash(register_user.password),
            )
            data = session.add(user)
            session.commit()
            return response_builder(data, 200)
        else:
            return response_builder(None, 500, '输入密码和确认密码不一致')
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.post("/login", response_model=ResponseModel)
async def login(loginData: LoginModel):
    '''
    description: 用户昵称+密码；邮箱+密码登录
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        if bool(loginData.password):
            if bool(loginData.email):
                if loginData.captcha:
                    is_c_pass = await validate_captcha(loginData.captcha)
                    if is_c_pass == True:
                        user = session.query(User).filter_by(
                            email=loginData.email).one()
                        session.commit()
                        if user:
                            isPass = PwdUtil.verify_password(
                                loginData.password, user.password)
                            if isPass:
                                session_id = str(uuid.uuid4())
                                access_token_expires = timedelta(
                                    minutes=jwt_expire_minutes)

                                token = generate_jwt(
                                    data={
                                        'session_id': session_id,
                                        'id': user.id,
                                        'name': user.name,
                                        'nick_name': user.nick_name,
                                        'role': user.role,
                                        'email': user.email,
                                    },
                                    expires_delta=access_token_expires,
                                )
                                return response_builder({'token': token}, 200)
                            else:
                                return response_builder(None, 500, '密码错误')

                        else:
                            return response_builder(None, 500, '用户未注册')
                    else:
                        return response_builder(None, 500, is_c_pass)
                else:
                    return response_builder(None, 500, '请输入验证码')
            else:
                return response_builder(None, 500, '请输入邮箱')
        else:
            return response_builder(None, 500, '请输入密码')

    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()  # 确保会话被关闭


@router.get("/send_email", response_model=ResponseModel)
async def send_email(to: str):
    '''
    description: 发送邮箱
    return {*}
    '''
    # 发送测试邮件
    success = send_email_by_qq.send_email(
        subject='测试邮件主题',
        body='<h1>这是一封HTML测试邮件</h1><p>正文内容</p>',
        body_type='html',
        to_addrs=[to],
        cc_addrs=[to],
        attachments=[os.path.join('static', 'txt', '1.txt')]  # 添加附件
    )
    code = 200 if success else 500
    return response_builder(None, code)