import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.header import Header
from email.utils import formataddr

# 常见邮箱配置参考
email_configs = {
    'qq': {
        'sender_email': '779217162@qq.com',
        'sender_name': '墨鱼汁人',
        'sender_password': 'kwemeppxcmdqbceb',
        'smtp_server': 'smtp.qq.com',
        'smtp_port': 465,
        'use_ssl': True
    },
    'gmail': {
        'sender_email': '779217162@qq.com',
        'sender_name': '墨鱼汁人',
        'sender_password': '',
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'use_ssl': False  # Gmail使用STARTTLS
    },
    '163': {
        'sender_email': '779217162@qq.com',
        'sender_name': '墨鱼汁人',
        'sender_password': '',
        'smtp_server': 'smtp.163.com',
        'smtp_port': 465,
        'use_ssl': True
    }
}


class EmailSender:
    """邮件发送工具类，支持SSL加密、附件、HTML内容"""
    
    def __init__(self, sender_email, sender_password, smtp_server, smtp_port, use_ssl=True, sender_name=None):
        """
        初始化邮件发送器
        :param sender_email: 发件人邮箱
        :param sender_password: 邮箱密码/授权码
        :param smtp_server: SMTP服务器地址
        :param smtp_port: SMTP端口
        :param use_ssl: 是否使用SSL加密 (默认True)
        :param sender_name: 发件人显示名称 (可选)
        """
        self.sender_email = sender_email
        self.sender_password = sender_password
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.use_ssl = use_ssl
        self.sender_name = sender_name

    def send_email(self, subject, body, to_addrs, attachments=None, body_type='plain', cc_addrs=None):
        """
        发送邮件
        :param subject: 邮件主题
        :param body: 邮件正文内容
        :param to_addrs: 收件人列表，如 ["user1@example.com", "user2@example.com"]
        :param attachments: 附件路径列表，如 ["file1.txt", "image.jpg"]
        :param body_type: 内容类型，可选 'plain' 或 'html'
        :param cc_addrs: 抄送人列表 (可选)
        :return: True发送成功，False发送失败
        """
        # 创建邮件对象
        msg = MIMEMultipart()
        
        # 设置发件人（带可选显示名称）
        if self.sender_name:
            msg['From'] = formataddr((str(Header(self.sender_name, 'utf-8')), self.sender_email))
        else:
            msg['From'] = self.sender_email
        
        # 收件人和抄送人处理
        msg['To'] = ', '.join(to_addrs)
        if cc_addrs:
            msg['Cc'] = ', '.join(cc_addrs)
            all_recipients = to_addrs + cc_addrs
        else:
            all_recipients = to_addrs
        
        # 处理主题编码
        msg['Subject'] = Header(subject, 'utf-8')

        # 添加邮件正文
        body_part = MIMEText(body, body_type, 'utf-8')
        msg.attach(body_part)

        # 添加附件
        if attachments:
            for file_path in attachments:
                if os.path.exists(file_path):
                    with open(file_path, 'rb') as f:
                        file_part = MIMEApplication(f.read())
                        file_part.add_header(
                            'Content-Disposition',
                            'attachment',
                            filename=os.path.basename(file_path)
                        )
                        msg.attach(file_part)
                else:
                    raise FileNotFoundError(f"附件 {file_path} 不存在")

        try:
            # 建立连接并发送
            if self.use_ssl:
                with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                    server.login(self.sender_email, self.sender_password)
                    server.sendmail(self.sender_email, all_recipients, msg.as_string())
                    server.quit()
            else:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()  # 启用加密模式
                    server.login(self.sender_email, self.sender_password)
                    server.sendmail(self.sender_email, all_recipients, msg.as_string())
                    server.quit()
            return True
        except Exception as e:
            print(f"邮件发送失败: {str(e)}")
            return False
        finally:
            print('终止邮箱发送服务')


# 使用QQ邮箱示例（需开启SMTP服务并使用授权码）
send_email_by_qq = EmailSender(
    sender_email=email_configs['qq']['sender_email'],
    sender_password=email_configs['qq']['sender_password'],  # QQ邮箱需使用授权码
    smtp_server=email_configs['qq']['smtp_server'],
    smtp_port=email_configs['qq']['smtp_port'],
    use_ssl=email_configs['qq']['use_ssl'],
    sender_name=email_configs['qq']['sender_name']  # 可选显示名称
)

    # 发送测试邮件
    # success = sender.send_email(
    #     subject='测试邮件主题',
    #     body='<h1>这是一封HTML测试邮件</h1><p>正文内容</p>',
    #     body_type='html',
    #     to_addrs=['991584844@qq.com',],
    #     cc_addrs=['991584844@qq.com'],
    #     attachments=[os.path.join('static', 'txt', '1.txt')]  # 添加附件
    # )

    # print("邮件发送成功" if success else "邮件发送失败")
    
# 使用谷歌邮箱示例（需开启SMTP服务并使用授权码）
send_email_by_gmail = EmailSender(
    sender_email=email_configs['gmail']['sender_email'],
    sender_password=email_configs['gmail']['sender_password'],  # QQ邮箱需使用授权码
    smtp_server=email_configs['gmail']['smtp_server'],
    smtp_port=email_configs['gmail']['smtp_port'],
    use_ssl=email_configs['gmail']['use_ssl'],
    sender_name=email_configs['gmail']['sender_name']  # 可选显示名称
)
    
# 使用163邮箱示例（需开启SMTP服务并使用授权码）
send_email_by_163 = EmailSender(
    sender_email=email_configs['163']['sender_email'],
    sender_password=email_configs['163']['sender_password'],  # QQ邮箱需使用授权码
    smtp_server=email_configs['163']['smtp_server'],
    smtp_port=email_configs['163']['smtp_port'],
    use_ssl=email_configs['163']['use_ssl'],
    sender_name=email_configs['163']['sender_name']  # 可选显示名称
)

