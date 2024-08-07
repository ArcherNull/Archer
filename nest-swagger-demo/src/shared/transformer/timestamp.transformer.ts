/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-11-20 08:50:27
 * @LastEditTime: 2023-12-18 13:49:30
 * @Description:
 */
import * as dayjs from 'dayjs';
import { ValueTransformer } from 'typeorm';

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// 时间格式化，防止出现2022-0101T09:12:23.102Z
export class TimestampTransformer implements ValueTransformer {
  constructor(private readonly formatstr: string = DEFAULT_DATE_FORMAT) {}

  to(value: any) {
    return value;
  }

  from(value: any) {
    return dayjs(value).format(this.formatstr);
  }
}
