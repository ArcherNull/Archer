import base64
import random
from io import BytesIO
from pydantic import BaseModel

from captcha.image import ImageCaptcha

seed = '123456789abcdefghijkmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ'


class CaptchaHtmlModel(BaseModel):
    html: str
    code: str


class CaptchaBase64Model(BaseModel):
    base64: str
    code: str


def generate_base64_captcha(num: int = 4):
    """
    生成base64验证码

    验证码使用 4 位
    """

    captcha_str = ''.join(random.choice(seed) for _ in range(num))
    image = ImageCaptcha(width=280, height=90).generate_image(captcha_str)
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    data = buffer.getvalue()
    c_info = {
        'base64': 'data:image/png;base64,' + base64.b64encode(data).decode(),
        'code': captcha_str
    }
    return c_info


def generate_html_captcha(num: int = 4) -> CaptchaHtmlModel:
    """
    生成bhtml验证码

    验证码使用 4 位
    """

    captcha_str = ''.join(random.choice(seed) for _ in range(num))
    image = ImageCaptcha(width=280, height=90).generate_image(captcha_str)
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    data = buffer.getvalue()
    base64Img = 'data:image/png;base64,' + base64.b64encode(data).decode()
    img = f'<img src={base64Img} alt="验证码" style="height:90px;width:280px;"></img>'
    c_info = {'html': img, 'code': captcha_str}
    return c_info


def enerate_img_captcha(num: int = 4, filename: str = 'captcha.png') -> str:
    """
    生成验证码图片

    验证码使用 4 位
    """

    captcha_str = ''.join(random.choice(seed) for _ in range(num))
    image = ImageCaptcha(width=280, height=90)
    image.write(captcha_str, filename)
    return captcha_str
