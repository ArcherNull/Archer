/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-15 20:21:38
 * @LastEditTime: 2024-07-23 11:44:43
 * @Description:
 *
 * 参考文档：https://juejin.cn/post/7271518821817958455?searchId=2024051520125275487B7BECAA7B9F6C83
 *
 */
const Redis = require("ioredis");
const { ENV_VERSION } = require("@config");

class RedisClient {
  // 默认过期时间, 默认7天
  DEFAULT_EXPIRE_TIME = 7 * 24 * 60 * 60;

  constructor() {
    this.redis = new Redis({
      host: "127.0.0.1", // Redis服务器主机地址
      port: 6379, // Redis 服务器端口
      password: "", // 密码
      db: 1,
    });
  }

  // 设置键的同时指定过期时间（秒）
  async set(key, value, expireTime) {
    if (expireTime > 0) {
      return await this.redis.set(key, value, "EX", expireTime);
    } else {
      return await this.redis.set(key, value);
    }
  }

  async get(key) {
    return await this.redis.get(key);
  }

  async clear() {
    return await this.redis.flushall();
  }

  // 设置过期时间
  async expire(key, expireTime = this.DEFAULT_EXPIRE_TIME) {
    return await this.redis.expire(key, expireTime);
  }

  async getAllKeys() {
    return await this.redis.keys("*");
  }

  async del(key) {
    return await this.redis.del(key);
  }

  async ttl(key) {
    return this.redis.ttl(key);
  }

  async close() {
    await this.redis.quit();
  }
}

// 当个redis值
class RoomListClient extends RedisClient {
  _key = "";
  map = new Map();
  constructor(key) {
    super();
    this._key = key;
    this.get2Map().then((res) => {
      this.map = res;
    });
  }
  get size() {
    return this.map.size;
  }

  async get2Map() {
    const value = await this.redis.get(this._key);
    if (value) {
      const mapData = JSON.parse(value);
      const mapFromRedis = new Map(mapData);
      console.log("Map from Redis:", mapFromRedis);
      return mapFromRedis;
    } else {
      console.log("Map not found in Redis. key:", this._key);
      return new Map();
    }
  }
  async get2MapByKey(key) {
    return (await this.get2Map()).get(+key);
  }

  async set2Map(value = new Map(), day = 30) {
    this.map = value;
    console.log("set ", value);
    await this.redis.set(
      this._key,
      JSON.stringify([...value]),
      "Ex",
      day * 60 * 60 * 24
    );
  }
}

class UserTokenRedisClient extends RedisClient {
  REDIS_KEY = "token";

  constructor() {
    super();
  }

  // 生成对应用户的token key
  generateUserTokenKey(userId) {
    return `${ENV_VERSION}-${this.REDIS_KEY}-${userId}`;
  }

  // 设置token
  async setToken(userId, value, expireTime) {
    if (userId) {
      const key = this.generateUserTokenKey(userId);
      if (expireTime > 0) {
        return await this.redis.set(key, value, "EX", expireTime);
      } else {
        return await this.redis.set(key, value);
      }
    } else {
      return Promise.reject("userId缺失，设置redis失败");
    }
  }

  // 获取token
  async getToken(userId) {
    if (userId) {
      const key = this.generateUserTokenKey(userId);
      return await this.redis.get(key);
    } else {
      return Promise.reject("userId缺失，获取redis失败");
    }
  }

  // 清除token
  async clearToken(userId) {
    if (userId) {
      const key = this.generateUserTokenKey(userId);
      return await this.redis.del(key);
    } else {
      return Promise.reject("userId缺失，获取redis失败");
    }
  }

  // 获取所有token key
  async getAllTokenKeys() {
    const allKeysArr = await this.redis.keys("*");
    if (allKeysArr?.length) {
      return allKeysArr.filter((ele) => ele.indexOf(this.REDIS_KEY) !== -1);
    } else {
      return [];
    }
  }

  // 清除所有token
  async clearAllToken() {
    const allTokenKeysArr = await this.getAllTokenKeys();
    const promItem = allTokenKeysArr.map(key => {
      return this.redis.del(key)
    })
    return await Promise.all(promItem)
  }
}


class CaptchaRedisClient extends RedisClient {
  REDIS_KEY = "captcha";
  CAPTCH_EXPIRE_TIME = 2 * 60;

  constructor() {
    super();
  }

  // 生成对应用户的captcha key
  generateCaptchaKey(key) {
    return `${ENV_VERSION}-${this.REDIS_KEY}-${key}`;
  }

  // 设置captcha，这里的key应该是 uuid + 图形验证码
  async setCaptcha(cKey, value, expireTime = this.CAPTCH_EXPIRE_TIME) {
    if (cKey) {
      const key = this.generateCaptchaKey(cKey);
      if (expireTime > 0) {
        return await this.redis.set(key, value, "EX", expireTime);
      } else {
        return await this.redis.set(key, value);
      }
    } else {
      return Promise.reject("key缺失，设置redis失败");
    }
  }

  // 获取captcha
  async getCaptcha(cKey) {
    if (cKey) {
      const key = this.generateCaptchaKey(cKey);
      return await this.redis.get(key);
    } else {
      return Promise.reject("key缺失，获取redis失败");
    }
  }

  // 清除captcha
  async clearCaptcha(cKey) {
    if (cKey) {
      const key = this.generateCaptchaKey(cKey);
      return await this.redis.del(key);
    } else {
      return Promise.reject("key缺失，获取redis失败");
    }
  }

  // 获取所有captcha key
  async getAllCaptchaKeys() {
    const allKeysArr = await this.redis.keys("*");
    if (allKeysArr?.length) {
      return allKeysArr.filter((ele) => ele.indexOf(this.REDIS_KEY) !== -1);
    } else {
      return [];
    }
  }

  // 清除所有captcha
  async clearAllCaptcha() {
    const allcaptchaKeysArr = await this.getAllCaptchaKeys();
    const promItem = allcaptchaKeysArr.map(key => {
      return this.redis.del(key)
    })
    return await Promise.all(promItem)
  }
}

// 用户token的redis服务
const userTokenListRedisServer = new UserTokenRedisClient();
exports.userTokenListRedisServer = userTokenListRedisServer;

// 图形验证码的redis服务
const captchaRedisClientServer = new CaptchaRedisClient();
exports.captchaRedisClientServer = captchaRedisClientServer;

// 房间列表
const roomListRedisServer = new RoomListClient();
exports.roomListRedisServer = roomListRedisServer;
