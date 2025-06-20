'''
Author: junsong Chen 779217162@qq.com
Date: 2025-02-26 19:09:59
LastEditTime: 2025-05-08 12:09:47
Description: 
'''
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from sqlalchemy.orm import sessionmaker
from models.model import Base

# DB_URL = 'mysql+pymysql://{USERNAME}:{PASSWORD}@{PORT}/{DBNAME}'
MYSQL_URL = 'mysql+pymysql://root:chenRoot12345@localhost:3306/example_db?charset=utf8'
MYSQL_ASYNC_URL = 'mysql+aiomysql://root:chenRoot12345@localhost:3306/example_db?charset=utf8'
POOL_SIZE = 20
POOL_RECYCLE = 3600
POOL_TIMEOUT = 15
MAX_OVERFLOW = 2
CONNECT_TIMEOUT = 60


# 初始化mysql表
def create_init_table():
    engine = create_engine(MYSQL_URL)
    Base.metadata.create_all(engine, checkfirst=True)


class Database():

    def __init__(self) -> None:
        self.connection_is_active = False
        self.engine = None
        self.async_connection_is_active = False
        self.async_engine = None

    def get_db_connection(self):
        '''
        description: 同步连接
        return {*}
        '''
        if self.connection_is_active == False:
            connect_args = {"connect_timeout": CONNECT_TIMEOUT}
            try:
                self.engine = create_engine(MYSQL_URL,
                                            pool_size=POOL_SIZE,
                                            pool_recycle=POOL_RECYCLE,
                                            pool_timeout=POOL_TIMEOUT,
                                            max_overflow=MAX_OVERFLOW,
                                            connect_args=connect_args)
                return self.engine
            except Exception as e:
                print("Error connecting to MySQL DB:", e)
        return self.engine

    def get_db_session(self, engine):
        '''
        description: 获取同步连接实例， autocommit 自动commit;autoflush自动flush;
        return {*}
        '''
        try:
            Session = sessionmaker(bind=engine,      
                                   autocommit=False,
                                   autoflush=False,
                                   expire_on_commit=False)
            session = Session()
            return session
        except Exception as e:
            print("Error getting DB session:", e)
            return None

    def get_db_async_connection(self):
        '''
        description: 异步连接
        return {*}
        '''
        if self.async_connection_is_active == False:
            connect_args = {"connect_timeout": CONNECT_TIMEOUT}
            try:
                self.async_engine = create_async_engine(
                    MYSQL_ASYNC_URL,
                    echo=True,
                    pool_size=POOL_SIZE,
                    pool_recycle=POOL_RECYCLE,
                    pool_timeout=POOL_TIMEOUT,
                    max_overflow=MAX_OVERFLOW,
                    connect_args=connect_args)
                return self.async_engine
            except Exception as e:
                print("Error connecting to MySQL DB:", e)
        return self.async_engine

    def get_db_async_session(self, async_engine):
        '''
        description: 获取异步连接实例
        return {*}
        '''
        try:
            AsySession = async_sessionmaker(bind=async_engine,
                                            class_=AsyncSession,
                                            expire_on_commit=False)
            return AsySession
        except Exception as e:
            print("Error getting DB session:", e)
            return None
