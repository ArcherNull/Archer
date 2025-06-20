'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-14 15:02:57
LastEditTime: 2025-04-21 11:14:47
Description: 
'''
from pydantic import BaseModel
from typing import Optional, List


class ResponseModel(BaseModel):
    data: List | None | dict | str = None
    code: int
    message: Optional[str] = None


def response_builder(data=None, status_code=200, message: str | None = None):

    msg = None
    if status_code == 200:
        if bool(message):
            msg = message
        else:
            msg = '操作成功'
    else:
        if bool(message):
            msg = message
        else:
            msg = '操作失败'

    return {
        "data": data,
        "code": status_code,
        "message": msg,
    }
