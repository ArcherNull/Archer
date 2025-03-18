/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-07-23 09:44:39
 * @LastEditTime: 2024-07-25 00:06:28
 * @Description: 
 */

// API网址:https://github.com/produck/svg-captcha/blob/1.x/README_CN.md
// 加载图片验证码模块
const svgCaptcha = require("svg-captcha");
const { captchaRedisClientServer } = require('@middlewares/redis')
const { genereateUUID } = require('@middlewares/uuid')
const { ErrorModel, SuccessModel } = require("../exceptions/index");
const CAPTCHA_TYPE_LIST = ['character', 'number']

// 生成redis key
const genetateRedisKey = (uuid, key) => {
    return `${uuid}-${key}`
}

/**
 * @description: 生成图形验证码
 * @param {*} type 验证码类型，character表示随机字符，number 表示数字算数随机验证码
 * @return {*}
 */
const generateCaptcha = (type = 'character') => {
    if (type === 'character') {
        // 设置字母随机验证码相关属性
        const options = {
            size: 4, // 4个字母
            noise: 2, // 干扰线2条
            color: true, // 文字颜色
            background: "#666", // 背景颜色
            height: 40,
        };
        //字母和数字随机验证码
        const captcha = svgCaptcha.create(options);
        return captcha
    } else {
        const options = {
            size: 4, // 4个字母
            noise: 2, // 干扰线2条
            color: true, // 文字颜色
            background: "#666", // 背景颜色
            // 数字的时候，设置下面属性。最大，最小，加或者减
            mathMin: 1,
            mathMax: 30,
            mathOperator: "+",
        };
        // 数字算数随机验证码
        const captcha = svgCaptcha.createMathExpr(options)
        return captcha
    }
}


/**
 * @description: 发送图形验证码
 * @param {*} ctx
 * @param {*} next
 * @return {*}
 */
const sendSvgCaptcha = async (ctx, next) => {
    try {
        let { type = 'character' } = ctx.request.query;
        if (CAPTCHA_TYPE_LIST.includes(type)) {
            const uuid = genereateUUID()
            const captchaInfo = generateCaptcha(type)
            const { text, data } = captchaInfo
            if (text && data && uuid) {
                const redisKey = genetateRedisKey(uuid, text)
                const redisRes = await captchaRedisClientServer.setCaptcha(redisKey, text)
                if (redisRes === 'OK') {
                    ctx.body = new SuccessModel({
                        uuid,
                        img: data,
                        text
                    });
                } else {
                    ctx.body = new ErrorModel('redis缓存失败，请联系管理员');
                }
            } else {
                ctx.body = new ErrorModel('生成图形验证码失败，请联系管理员');
            }
        } else {
            ctx.body = new ErrorModel(`type参数不满足【${CAPTCHA_TYPE_LIST.join('/')}】其中之一`);
        }
    } catch (err) {
        ctx.body = new ErrorModel("发送图形验证码失败," + err);
    }
}

/**
 * @description: 校验验证码核心方法
 * @param {*} ctx
 * @return {*}
 */
const validateSvgCaptchaFun = async (ctx) => {
    try {
        let { uuid, text } = ctx.request.query;
        if (uuid) {
            if (text) {
                const redisKey = genetateRedisKey(uuid, text)
                const captchaText = await captchaRedisClientServer.getCaptcha(redisKey)
                if (captchaText) {
                    if (captchaText === text) {
                        const redisRes = await captchaRedisClientServer.clearCaptcha(redisKey)
                        if (redisRes === 1) {
                            return Promise.resolve(true)
                        } else {
                            return Promise.reject('验证失败，请重试');
                        }
                    } else {
                        return Promise.reject('验证码不正确');
                    }
                } else {
                    return Promise.reject('验证码已失效，请重试');
                }
            } else {
                return Promise.reject('请传入验证码');
            }
        } else {
            return Promise.reject('请传入参数【uuid】');
        }
    } catch (err) {
        return Promise.reject("校验图形验证码失败," + err);
    }
}

/**
 * @description: 校验图形验证码
 * @param {*} ctx
 * @param {*} next
 * @return {*}
 */
const validateSvgCaptcha = async (ctx, next) => {
    try {
        const res = await validateSvgCaptchaFun(ctx)
        if (res) {
            ctx.body = new SuccessModel('验证成功');
        }
    } catch (err) {
        ctx.body = new ErrorModel(err);
    }
}

exports.generateCaptcha = generateCaptcha
exports.sendSvgCaptcha = sendSvgCaptcha
exports.validateSvgCaptcha = validateSvgCaptcha
exports.validateSvgCaptchaFun = validateSvgCaptchaFun