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

for key in email_configs:
    print(key)
    print(email_configs[key])
    print(email_configs[key]['sender_password'])