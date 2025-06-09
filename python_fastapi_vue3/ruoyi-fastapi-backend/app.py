'''
Author: junsong Chen 779217162@qq.com
Date: 2025-02-22 09:49:43
LastEditTime: 2025-04-22 13:56:55
Description: 
'''
import uvicorn
from server import app, AppConfig  # noqa: F401

if __name__ == '__main__':
    uvicorn.run(
        app='app:app',
        host=AppConfig.app_host,
        port=AppConfig.app_port,
        root_path=AppConfig.app_root_path,
        reload=AppConfig.app_reload,
    )
