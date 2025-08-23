'''
Author: junsong Chen 779217162@qq.com
Date: 2025-04-15 10:25:03
LastEditTime: 2025-04-22 17:27:20
Description: 
'''
from passlib.context import CryptContext
from passlib.hash import md5_crypt

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


class PwdUtil:
    """
    密码工具类
    """

    @classmethod
    def verify_password(cls, plain_password, hashed_password):
        """
        工具方法：校验当前输入的密码与数据库存储的密码是否一致

        :param plain_password: 当前输入的密码
        :param hashed_password: 数据库存储的密码
        :return: 校验结果
        """
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def get_password_hash(cls, input_password):
        """
        工具方法：对当前输入的密码进行加密

        :param input_password: 输入的密码
        :return: 加密成功的密码
        """
        return pwd_context.hash(input_password)

    @classmethod
    def get_md5_hash(cls, str):
        """
        工具方法：对当前输入的密码进行md5加密

        :param str: 输入的密码
        :return: 加密成功的密码
        """
        return md5_crypt.hash(str)

    @classmethod
    def verify_md5_str(cls, plain_str, hashed_str):
        """
        工具方法：校验当前输入的密码与数据库存储的密码是否一致

        :param str: 输入的密码
        :return: 加密成功的密码
        """
        return md5_crypt.verify(plain_str, hashed_str)
