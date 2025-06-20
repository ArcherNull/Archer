'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-06 19:06:49
LastEditTime: 2025-05-06 11:56:00
Description: 入口文件
'''
import os
import time
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, status
from fastapi.staticfiles import StaticFiles
from routers.auth_router import router as auth_router
from routers.user_router import router as user_router
from routers.work_order_router import router as work_order_router
from routers.process_setting_router import router as process_setting_router
from routers.process_node_router import router as process_node_router
from routers.file_router import router as file_router
from routers.send_email_record_router import router as send_email_record_router
from fastapi.openapi.docs import (
    get_redoc_html,
    get_swagger_ui_html,
    get_swagger_ui_oauth2_redirect_html,
)

from db.db import create_init_table
from utils.comm_util import get_json_response, AuthException, LoginException

app = FastAPI(docs_url=None, redoc_url=None)

origins = ["http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建数据库表
create_init_table()


@app.middleware("http")
# 定义中间件功能
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Process-Time"] = f'{str(process_time)}ms'
    return response


# 定义需要鉴权的路由路径列表
# PROTECTED_ROUTES = ["/users", "/work_order"]
# @app.middleware("http")
# # 全局鉴权中间件，可以通过，最好是不要用全局鉴权中间件，小应用可以使用
# async def verify_authorization(request: Request, call_next):
#     if any(request.url.path.startswith(prefix) for prefix in PROTECTED_ROUTES):
#         c_user = await get_current_user(request)
#         if not c_user.id:
#             raise AuthException(data='', message='用户token不合法')

#     print('进入鉴权中间件')
#     response = await call_next(request)
#     print('进入鉴权中间件123123', response)

#     return response

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(work_order_router)
app.include_router(process_setting_router)
app.include_router(process_node_router)
app.include_router(file_router)
app.include_router(send_email_record_router)

# 静态文件位置
static_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/static",
          StaticFiles(directory=f"{static_dir}/static"),
          name="static")


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    print('custom_swagger_ui_html')
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/static/swagger-ui/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui/swagger-ui.css",
    )


@app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
async def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()


@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        redoc_js_url="/static/redoc/redoc.standalone.js",
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 处理鉴权异常
    if isinstance(exc, AuthException):
        return get_json_response(status.HTTP_401_UNAUTHORIZED, exc.message)

    # 处理登录异常
    if isinstance(exc, LoginException):
        return get_json_response(status.HTTP_400_BAD_REQUEST, exc.message)

    # 处理系统级异常
    return get_json_response(status.HTTP_500_INTERNAL_SERVER_ERROR, '系统内部错误')


if __name__ == '__main__':
    uvicorn.run("main:app",
                host='127.0.0.1',
                port=8006,
                log_level="info",
                reload=True)
    print("running")
