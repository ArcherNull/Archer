<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-27 17:36:38
 * @LastEditTime: 2023-09-13 11:12:00
 * @Description: 
-->

在项目开发过程中，自己需要查询出一定时间段内的交易。故需要在sql查询语句中加入日期时间要素，sql语句如何实现?

SELECT * FROM lmapp.lm_bill where tx_time Between '2015-12-20' And '2015-12-31';

查询每一天某个时间段的所有记录(例:9:00:00到21:00:00)

SELECT * FROM 表名 
WHERE DATE_FORMAT(create_time,'%H:%i:%S')>='09:00:00'
and DATE_FORMAT(create_time,'%H:%i:%S')<='21:00:00' 
ORDER BY 排序字段 ASC;
mysql 查询当天、最近一天、最近一周，本月，上一个月的数据

今天
select * from 表名 where to_days(时间字段名) = to_days(now());

以往的数据，不包含今天
SELECT * FROM info_codes WHERE TO_DAYS(NOW()) - 1 >= TO_DAYS(时间字段名);

昨天
SELECT * FROM 表名 WHERE TO_DAYS(NOW()) - TO_DAYS(时间字段名) <= 1

7天
SELECT * FROM 表名 where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(时间字段名)

近30天
SELECT * FROM 表名 where DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= date(时间字段名)

本月
SELECT * FROM 表名 WHERE DATE_FORMAT( 时间字段名, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' )

上一月
SELECT * FROM 表名 WHERE PERIOD_DIFF( date_format( now( ) , '%Y%m' ) , date_format( 时间字段名, '%Y%m' ) ) =1



createOrUpdate, 要么创建要么更新

findOrCreate， 查找或者创建

findAll : 查询所有

findByPk ： 通过主键查询

findOne ： 查询一条

findAndCountAll ： 查找并且对所有计数


