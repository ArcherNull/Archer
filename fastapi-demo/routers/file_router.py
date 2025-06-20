'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-29 08:51:48
LastEditTime: 2025-05-05 14:27:55
Description: 上传接口
'''
import os
import shutil
from datetime import datetime
from typing import  List
from fastapi import  File, UploadFile, Form, Request, BackgroundTasks, Query
from fastapi import APIRouter
from models.response import response_builder, ResponseModel
from utils.upload_util import DEFAULT_ALLOWED_EXTENSION, DOWNLOAD_PATH, UPLOAD_MACHINE, UPLOAD_PATH, UploadUtil

router = APIRouter(
    prefix="/common",
    tags=["Common"],
    responses={404: {
        "description": "404 Not Found"
    }},
)


@router.post("/upload/file", response_model=ResponseModel) 
# 限制文件大小为 100MB
async def common_upload_file(request: Request, file: UploadFile = File(..., max_size=100_000_000)): 
    """
    通用单个文件上传

    :param request: Request对象
    :param file: 上传文件对象
    :return: 上传结果
    """
    try:
        if not UploadUtil.check_file_extension(file):
            return response_builder(None, 500, '文件类型不合法')
        else:
            relative_path = f'{datetime.now().strftime("%Y")}/{datetime.now().strftime("%m")}/{datetime.now().strftime("%d")}'
            dir_path = os.path.join(UPLOAD_PATH, relative_path)
            try:
                os.makedirs(dir_path)
            except FileExistsError:
                pass
            filename = f'{file.filename.rsplit(".", 1)[0]}_{datetime.now().strftime("%Y%m%d%H%M%S")}{UPLOAD_MACHINE}{UploadUtil.generate_random_number()}.{file.filename.rsplit(".")[-1]}'
            filepath = os.path.join(dir_path, filename)
            with open(filepath, 'wb') as f:
                # 流式写出大型文件，这里的10代表10MB
                for chunk in iter(lambda: file.file.read(1024 * 1024 * 10), b''):
                    f.write(chunk)

            rPath = f'{UPLOAD_PATH}/{relative_path}/{filename}'
            result={
                "relative_path": rPath,
                "newFileName": filename,
                "originalFilename": file.filename,
                "url": f'{request.base_url}{rPath}'
            }
            return response_builder(result, 200)
            
    except Exception as e:
        return response_builder(None, 500, str(e))



@router.post("/upload/files", response_model=ResponseModel) 
# 限制文件大小为 100MB
async def common_upload_files(request: Request, files: List[UploadFile] = File(..., max_size=100_000_000)): 
    """
    通用多个文件上传

    :param request: Request对象
    :param file: 上传文件对象
    :return: 上传结果
    """
    try:
        if not all([UploadUtil.check_file_extension(file) for file in files]):
            return response_builder(None, 500, '文件类型不合法')
        else:
            relative_path = f'{datetime.now().strftime("%Y")}/{datetime.now().strftime("%m")}/{datetime.now().strftime("%d")}'
            dir_path = os.path.join(UPLOAD_PATH, relative_path)
            try:
                os.makedirs(dir_path)
            except FileExistsError:
                pass
            result = []
            for file in files:
                filename = f'{file.filename.rsplit(".", 1)[0]}_{datetime.now().strftime("%Y%m%d%H%M%S")}{UPLOAD_MACHINE}{UploadUtil.generate_random_number()}.{file.filename.rsplit(".")[-1]}'
                filepath = os.path.join(dir_path, filename)
                with open(filepath, 'wb') as f:
                    # 流式写出大型文件，这里的10代表10MB
                    for chunk in iter(lambda: file.file.read(1024 * 1024 * 10), b''):
                        f.write(chunk)

                rPath = f'{UPLOAD_PATH}/{relative_path}/{filename}'
                result.append({
                    "relative_path": rPath,
                    "newFileName": filename,
                    "originalFilename": file.filename,
                    "url": f'{request.base_url}{rPath}'
                })
            return response_builder(result, 200)
            
    except Exception as e:
        return response_builder(None, 500, str(e))


@router.get('/download')
async def common_download(
    request: Request,
    background_tasks: BackgroundTasks,
    file_name: str = Query(alias='fileName'),
    delete: bool = Query(),
):

    filepath = os.path.join(DOWNLOAD_PATH, file_name)
    if '..' in file_name:
        return response_builder(None, 500, '文件名称不合法')
    elif not UploadUtil.check_file_exists(filepath):
        return response_builder(None, 500, '文件不存在')
    else:
        if delete:
            background_tasks.add_task(UploadUtil.delete_file, filepath)
        result = UploadUtil.generate_file(filepath)
        return response_builder({ "result": result }, 200)

