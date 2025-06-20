'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-15 14:32:06
LastEditTime: 2025-04-15 23:34:32
Description: 
'''
import jwt
from datetime import datetime, timedelta, timezone
from typing import Union
from fastapi import HTTPException, Depends, status
from typing import Annotated
from fastapi.security.api_key import APIKeyHeader

# 密钥，用于签名和验证JWT
jwt_secret_key: str = 'b01c66dc2c58dc6a0aabfe2144256be36226de378bf87f72c0c795dda67f4d55'
jwt_expire_minutes: int = 1440
jwt_algorithm: str = 'HS256'


# 模拟用户登录，生成JWT
def generate_jwt(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode,
                             jwt_secret_key,
                             algorithm=jwt_algorithm)
    return encoded_jwt


# 模拟用户访问需要认证的资源，验证JWT
def verify_jwt(received_token):
    try:
        decoded_payload = jwt.decode(received_token,
                                     jwt_secret_key,
                                     algorithms=[jwt_algorithm])
        return decoded_payload
    except jwt.ExpiredSignatureError:
        return 'JWT has expired'
    except jwt.InvalidTokenError:
        return 'Invalid JWT'


# 定义鉴权依赖函数
async def verify_auth(
    authorization: Annotated[str, Depends(APIKeyHeader(name="authorization"))]):
    if authorization is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="无效的Token")
