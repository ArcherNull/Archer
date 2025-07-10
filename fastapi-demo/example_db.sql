/*
 Navicat Premium Data Transfer

 Source Server         : nodejs
 Source Server Type    : MySQL
 Source Server Version : 80028
 Source Host           : localhost:3306
 Source Schema         : example_db

 Target Server Type    : MySQL
 Target Server Version : 80028
 File Encoding         : 65001

 Date: 10/07/2025 10:03:36
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for captcha_code_info
-- ----------------------------
DROP TABLE IF EXISTS `captcha_code_info`;
CREATE TABLE `captcha_code_info`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '验证码',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '验证码类型, 登录 login',
  `expire_diff` bigint(0) NULL DEFAULT NULL COMMENT '验证码失效差值时间, 单位为s，默认 5 * 60 s',
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 45 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of captcha_code_info
-- ----------------------------
INSERT INTO `captcha_code_info` VALUES (43, 'BJd9', 'login', 300, NULL, '2025-07-10 09:03:12');

-- ----------------------------
-- Table structure for process_node
-- ----------------------------
DROP TABLE IF EXISTS `process_node`;
CREATE TABLE `process_node`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `ps_id` int(0) NOT NULL COMMENT '审批设置id',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '流程节点标题，用于简介描述改审批节点的作用及功能',
  `description` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流程节功能描述',
  `remark` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流程节点备注',
  `approve_user_ids` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '可执行审批人id， 可多个英文逗号分隔',
  `approve_user_names` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '可执行审批人名称集合， 可多个英文逗号分隔',
  `pn_state` int(0) NOT NULL COMMENT '审批节点状态，0 已删除，1，待审批，2，审批成功，3，审批拒绝',
  `bind_wo_id` int(0) NULL DEFAULT NULL COMMENT '绑定工单id',
  `is_original_node` int(0) NOT NULL COMMENT '是否是原始节点数据, 当为true时，用于审批设置流程的复刻流程模板；当为false，则为真实的流程，需要绑定工单id',
  `order` int(0) NOT NULL COMMENT '节点顺序',
  `ap_time` datetime(0) NULL DEFAULT NULL COMMENT '执行审批通过时间',
  `ap_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '执行审批通过人',
  `ap_by_id` int(0) NULL DEFAULT NULL COMMENT '执行审批通过人id',
  `ap_remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '执行审批通过备注',
  `anp_time` datetime(0) NULL DEFAULT NULL COMMENT '执行审批不通过时间',
  `anp_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '执行审批不通过人',
  `anp_by_id` int(0) NULL DEFAULT NULL COMMENT '执行审批不通过人id',
  `anp_remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '执行审批不通过备注',
  `updated_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updated_by_id` int(0) NULL DEFAULT NULL,
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_by_id` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 140 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of process_node
-- ----------------------------
INSERT INTO `process_node` VALUES (1, 1, '上门预约测绘', '用户确定上门时间，测绘师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, NULL, '李四', 1, '2025-04-23 08:56:40');
INSERT INTO `process_node` VALUES (2, 1, '测绘现场签到', '用于保证测绘师傅按时上门，用于收集相关测绘数据', NULL, '3', '张六', 1, NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, NULL, '李四', 1, '2025-04-23 08:56:40');
INSERT INTO `process_node` VALUES (3, 1, '测绘完毕', '生成测绘报告与用户确认测绘数据', '额外材料费用，需要向用户按规定标准收取', '2,3', '王五,张六', 1, NULL, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, NULL, '李四', 1, '2025-04-23 08:56:40');
INSERT INTO `process_node` VALUES (4, 1, '电话回访', '用于收集，用户对测绘师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 1, NULL, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, NULL, '李四', 1, '2025-04-23 08:56:40');
INSERT INTO `process_node` VALUES (5, 2, '上门预约审核', '用户确定上门时间，安装师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, NULL, 1, 1, '2025-04-23 20:03:57', '李四', 1, '同意', NULL, NULL, NULL, NULL, '李四', 1, '2025-04-23 20:03:56', '李四', 1, '2025-04-23 09:17:42');
INSERT INTO `process_node` VALUES (6, 2, '安装前现场签到审核', '用于保留安装前的场地，在安装过程中如果造成对用户原场地损坏作为定损依据；也确保安装师傅能够在约定时间到达安装场地', NULL, '3', '张六', 1, NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, NULL, '李四', 1, '2025-04-23 09:17:42');
INSERT INTO `process_node` VALUES (7, 2, '安装完毕', '用于收集，安装师傅是否是在在指定时间内安装；用户需缴纳安装额外造成的费用等', NULL, '3', '张六', 1, NULL, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, NULL, '李四', 1, '2025-04-23 09:17:42');
INSERT INTO `process_node` VALUES (8, 2, '电话回访', '用于收集，用户对安装师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 1, NULL, 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, NULL, '李四', 1, '2025-04-23 09:17:42');
INSERT INTO `process_node` VALUES (81, 2, '上门预约审核', '用户确定上门时间，安装师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, 8, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '张六', 3, '2025-04-24 19:39:09');
INSERT INTO `process_node` VALUES (82, 2, '安装前现场签到审核', '用于保留安装前的场地，在安装过程中如果造成对用户原场地损坏作为定损依据；也确保安装师傅能够在约定时间到达安装场地', NULL, '3', '张六', 2, 8, 0, 2, '2025-04-24 19:50:01', '张六', 3, '同意', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-24 19:50:01', '张六', 3, '2025-04-24 19:39:09');
INSERT INTO `process_node` VALUES (83, 2, '安装完毕', '用于收集，安装师傅是否是在在指定时间内安装；用户需缴纳安装额外造成的费用等', NULL, '3', '张六', 2, 8, 0, 3, '2025-04-24 19:49:57', '张六', 3, '同意', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-24 19:49:56', '张六', 3, '2025-04-24 19:39:09');
INSERT INTO `process_node` VALUES (84, 2, '电话回访', '用于收集，用户对安装师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 2, 8, 0, 4, '2025-04-24 19:42:46', '王五', 2, '同意', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-24 19:42:45', '张六', 3, '2025-04-24 19:39:09');
INSERT INTO `process_node` VALUES (85, 2, '上门预约审核', '用户确定上门时间，安装师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, 9, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:08:06');
INSERT INTO `process_node` VALUES (86, 2, '安装前现场签到审核', '用于保留安装前的场地，在安装过程中如果造成对用户原场地损坏作为定损依据；也确保安装师傅能够在约定时间到达安装场地', NULL, '3', '张六', 1, 9, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:08:06');
INSERT INTO `process_node` VALUES (87, 2, '安装完毕', '用于收集，安装师傅是否是在在指定时间内安装；用户需缴纳安装额外造成的费用等', NULL, '3', '张六', 2, 9, 0, 3, '2025-04-24 20:16:03', '李四', 1, '同意', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-24 20:16:03', '李四', 1, '2025-04-24 20:08:06');
INSERT INTO `process_node` VALUES (88, 2, '电话回访', '用于收集，用户对安装师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 2, 9, 0, 4, '2025-04-24 20:14:52', '李四', 1, '同意', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-24 20:14:51', '李四', 1, '2025-04-24 20:08:06');
INSERT INTO `process_node` VALUES (89, 1, '上门预约测绘', '用户确定上门时间，测绘师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, 10, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:19:34');
INSERT INTO `process_node` VALUES (90, 1, '测绘现场签到', '用于保证测绘师傅按时上门，用于收集相关测绘数据', NULL, '3', '张六', 1, 10, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:19:34');
INSERT INTO `process_node` VALUES (91, 1, '测绘完毕', '生成测绘报告与用户确认测绘数据', '额外材料费用，需要向用户按规定标准收取', '2,3', '王五,张六', 1, 10, 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:19:34');
INSERT INTO `process_node` VALUES (92, 1, '电话回访', '用于收集，用户对测绘师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 2, 10, 0, 4, '2025-04-24 20:19:47', '李四', 1, '同意', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-24 20:19:46', '李四', 1, '2025-04-24 20:19:34');
INSERT INTO `process_node` VALUES (93, 2, '上门预约审核', '用户确定上门时间，安装师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:24:32');
INSERT INTO `process_node` VALUES (94, 2, '安装前现场签到审核', '用于保留安装前的场地，在安装过程中如果造成对用户原场地损坏作为定损依据；也确保安装师傅能够在约定时间到达安装场地', NULL, '3', '张六', 1, NULL, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:24:32');
INSERT INTO `process_node` VALUES (95, 2, '安装完毕', '用于收集，安装师傅是否是在在指定时间内安装；用户需缴纳安装额外造成的费用等', NULL, '3', '张六', 1, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:24:32');
INSERT INTO `process_node` VALUES (96, 2, '电话回访', '用于收集，用户对安装师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 1, NULL, 0, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:24:32');
INSERT INTO `process_node` VALUES (97, 1, '上门预约测绘', '用户确定上门时间，测绘师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:29:26');
INSERT INTO `process_node` VALUES (98, 1, '测绘现场签到', '用于保证测绘师傅按时上门，用于收集相关测绘数据', NULL, '3', '张六', 1, NULL, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:29:26');
INSERT INTO `process_node` VALUES (99, 1, '测绘完毕', '生成测绘报告与用户确认测绘数据', '额外材料费用，需要向用户按规定标准收取', '2,3', '王五,张六', 1, NULL, 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:29:26');
INSERT INTO `process_node` VALUES (100, 1, '电话回访', '用于收集，用户对测绘师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 1, NULL, 0, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:29:26');
INSERT INTO `process_node` VALUES (101, 1, '上门预约测绘', '用户确定上门时间，测绘师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, 12, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:37');
INSERT INTO `process_node` VALUES (102, 1, '测绘现场签到', '用于保证测绘师傅按时上门，用于收集相关测绘数据', NULL, '3', '张六', 1, 12, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:37');
INSERT INTO `process_node` VALUES (103, 1, '测绘完毕', '生成测绘报告与用户确认测绘数据', '额外材料费用，需要向用户按规定标准收取', '2,3', '王五,张六', 1, 12, 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:37');
INSERT INTO `process_node` VALUES (104, 1, '电话回访', '用于收集，用户对测绘师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 1, 12, 0, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:37');
INSERT INTO `process_node` VALUES (109, 2, '上门预约审核', '用户确定上门时间，安装师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, 13, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:53');
INSERT INTO `process_node` VALUES (110, 2, '安装前现场签到审核', '用于保留安装前的场地，在安装过程中如果造成对用户原场地损坏作为定损依据；也确保安装师傅能够在约定时间到达安装场地', NULL, '3', '张六', 1, 13, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:53');
INSERT INTO `process_node` VALUES (111, 2, '安装完毕', '用于收集，安装师傅是否是在在指定时间内安装；用户需缴纳安装额外造成的费用等', NULL, '3', '张六', 1, 13, 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:53');
INSERT INTO `process_node` VALUES (112, 2, '电话回访', '用于收集，用户对安装师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 1, 13, 0, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:31:53');
INSERT INTO `process_node` VALUES (137, 2, '上门预约审核', '用户确定上门时间，安装师傅电话/微信语音沟通确定准确时间', NULL, '2', '王五', 1, 11, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-05-06 09:01:45');
INSERT INTO `process_node` VALUES (138, 2, '安装前现场签到审核', '用于保留安装前的场地，在安装过程中如果造成对用户原场地损坏作为定损依据；也确保安装师傅能够在约定时间到达安装场地', NULL, '3', '张六', 1, 11, 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-05-06 09:01:45');
INSERT INTO `process_node` VALUES (139, 2, '安装完毕', '用于收集，安装师傅是否是在在指定时间内安装；用户需缴纳安装额外造成的费用等', NULL, '3', '张六', 1, 11, 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-05-06 09:01:45');
INSERT INTO `process_node` VALUES (140, 2, '电话回访', '用于收集，用户对安装师傅的安装过程，安装结果的满意度收集', NULL, '2', '王五', 1, 11, 0, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-05-06 09:01:45');

-- ----------------------------
-- Table structure for process_setting
-- ----------------------------
DROP TABLE IF EXISTS `process_setting`;
CREATE TABLE `process_setting`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '流程标题',
  `content` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '流程内容',
  `remark` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流程备注',
  `process_state` int(0) NOT NULL COMMENT '流程状态，0、禁用， 1、启用',
  `updated_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updated_by_id` int(0) NULL DEFAULT NULL,
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_by_id` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of process_setting
-- ----------------------------
INSERT INTO `process_setting` VALUES (1, '上门测绘定制安装', '对于特殊的安装场景以及用户的个性化需求，需要通过准确的测绘报告，制定安装计划', '需要向用户收取额外出差费200元', 1, '李四', 1, '2025-04-24 20:38:38', '李四', 1, '2025-04-23 08:56:40');
INSERT INTO `process_setting` VALUES (2, '上门安装', '用于用户上门预约安装电器的服务流程', NULL, 1, '李四', 1, '2025-04-23 18:39:26', '李四', 1, '2025-04-23 09:17:42');

-- ----------------------------
-- Table structure for send_email_record
-- ----------------------------
DROP TABLE IF EXISTS `send_email_record`;
CREATE TABLE `send_email_record`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `sender` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '发送者名称',
  `sender_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '发送者邮箱',
  `receiver` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '接收者名称',
  `receiver_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '接收者邮箱',
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '邮箱类型，process_approval_reminder 流程审批提醒；custom 自定义；publicity 宣传 ',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主题',
  `content` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主要内容',
  `files` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '附件，可以多个，多个逗号分隔',
  `remark` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `state` int(0) NOT NULL COMMENT '状态，0 已删除，1，待发送，2，发送成功，3，发送失败',
  `send_time` datetime(0) NULL DEFAULT NULL COMMENT '发送时间',
  `updated_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updated_by_id` int(0) NULL DEFAULT NULL,
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_by_id` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of send_email_record
-- ----------------------------
INSERT INTO `send_email_record` VALUES (1, '墨鱼汁人', '779217162@qq.com', '测试', '991584844@qq.com', 'publicity', '测试1', '<p>测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试1</p>', NULL, NULL, 2, '2025-07-10 09:58:39', '李四', 1, '2025-07-10 09:58:38', '李四', 1, '2025-07-10 09:18:07');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `nick_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户昵称',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户角色，用于验证用户是都拥有权限去操作',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户邮箱，用于发送邮箱通知审批节点',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户密码',
  `state` int(0) NOT NULL COMMENT '状态，0-禁用，1-启用',
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nick_name`(`nick_name`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '李四', '会飞的猪', '管理员', '991584844@qq.com', '$2b$12$c5WSa3j8GjyfmNE.47h7QeXAP0SJqo541m8ZyxMgk3P1QOzvsmTDW', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (2, '王五', '会跑的树', '审核员', '991584845@qq.com', '$2b$12$HCdCF1zSSrUJojXIFEqnnuT01tvc825l7RxlIGi8HO4Yb9QUTRBue', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (3, '张六', '会跑的书', '审核员', '991584846@qq.com', '$2b$12$y7pzYBPSS3mB.DfszNdDqufY7x/C4z9Y.CiUNDyvHIzU9c8aRfxeK', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (4, '陈七', '会跑的属', '审核员', '991584847@qq.com', '$2b$12$vbS3UvCToy.jakfDECe26e9icqaixzNPHETxyp7zGbuIBuC1Fmguq', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (5, '赵八', '爆炸的汽车', '审核员', '991584818@qq.com', '$2b$12$OdIiFnEMf3OkqJMZKaxdquVAPI/1bwoW7d9gIDjOplh9OlGNfkACe', 0, '2025-04-18 11:58:21', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (8, '吴三', '爆炸的飞机', '员工', '991584828@qq.com', '$2b$12$a7JBbmKuzxM5zngcold0DemSVJwlLa9Zf3ohKIc9I7Fbf.Pcbdm0O', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (9, '关二', '奔跑的汽车', '员工', '991584858@qq.com', '$2b$12$Hf08J7AUigEdw9Hgs3RLrONC/Yo.FlL9VCumeWY/0GBhtdI4DRhgG', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (10, '冠一', '奔跑的人', '员工', '991584868@qq.com', '$2b$12$l50mSK3kiBhyMABg76DOO.S9R4Zks70G5RVhYc7gPcxDxpH9xqt26', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (11, '疯三', '奔跑的狗', '员工', '991584878@qq.com', '$2b$12$2PJpGGBamr0tA7D3IMTpJubYBJfNL9bMMXHJ/P56JqkP3b4IlQGsK', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (12, '田二', '喵喵的猫', '员工', '991584888@qq.com', '$2b$12$sEgP6.XEUu1dHyc53UL6yuLAj7lQAzBrxJ2vZ1balz94R0sM9E7Hq', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (13, '万田', '汪汪的狗', '员工', '991584898@qq.com', '$2b$12$sdIajPINr2DhybVpIQu2fewvpAppv5IWVASR2B5xY7J.MaruutHue', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (14, '李一', '阳阳的狗', '员工', '991584198@qq.com', '$2b$12$jnc00Jr4E8Bud1wckwZFi.rF0s1JNXN58kBc4H6JLsgR.djuhkCLC', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (15, '高二', '阳的狗', '员工', '991584298@qq.com', '$2b$12$egRxFn7r81CtL8B2lUZzFufluvuGhQtkLcn8ALbs1JpyV3hnBzR0S', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (16, '线二', '后来的狗', '员工', '991585298@qq.com', '$2b$12$Pgw5q6ITOdDw8vRSAvDCOuKgzSZ4eB3EBYW5nfYPzybmEyY9A9lnK', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (17, '什四', '后来的他', '员工', '991585398@qq.com', '$2b$12$iylZZY5P08dCNFsq6HVAAOPPuYFvP1lLo7BSGezjw4vo3u7jUhPhy', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (18, '天五', '变色龙', '员工', '99158598@qq.com', '$2b$12$WNXRTdU0/Ro6xVHykj0j.OqsNCbmAFyPNBocWXIq7KvfgxppHYc66', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (19, '岗五', '变色', '员工', '99168598@qq.com', '$2b$12$xQF3ciP5gZmmhSoaRNUyGe2maT/KQ2o.7j14pNdc79u7HRoHjTGoG', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (20, '空五', '变色虫', '员工', '99198598@qq.com', '$2b$12$IzjMdaHT229Bep491.R9jO2sLVfSZxubmuOnbQa2hnZ.qkePFw1Cq', 1, '2025-04-16 16:47:03', '2025-04-15 16:47:03');

-- ----------------------------
-- Table structure for work_order
-- ----------------------------
DROP TABLE IF EXISTS `work_order`;
CREATE TABLE `work_order`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '工单标题',
  `content` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '工单内容',
  `remark` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '工单备注',
  `bind_ps_id` int(0) NULL DEFAULT NULL COMMENT '绑定流程ps_id，当用户创建了工单，需要管理员审核绑定审批流程',
  `bind_time` datetime(0) NULL DEFAULT NULL COMMENT '绑定时间',
  `bind_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '绑定人',
  `bind_by_id` int(0) NULL DEFAULT NULL COMMENT '绑定人id',
  `wo_state` int(0) NOT NULL COMMENT '工单状态，0 已删除，1，审批中，2，审批成功，3，审批拒绝',
  `wait_approve_ids` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '待审批人id， 可多个英文逗号分隔',
  `wait_approve_names` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '待审批人名称集合， 可多个英文逗号分隔',
  `updated_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updated_by_id` int(0) NULL DEFAULT NULL,
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_by_id` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of work_order
-- ----------------------------
INSERT INTO `work_order` VALUES (8, '测试1', '测试1测试1测试1测试1', NULL, 2, '2025-04-24 19:39:10', '张六', 3, 1, NULL, NULL, '张六', 3, '2025-04-24 19:39:09', '张六', 3, '2025-04-24 19:26:40');
INSERT INTO `work_order` VALUES (9, '测试5', '测试5测试5测试5测试5测试5', '工单备注', 2, '2025-04-24 20:08:07', '李四', 1, 1, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-24 20:08:06');
INSERT INTO `work_order` VALUES (10, '测试54', '测试54测试54测试54测试54', '工单备注', 1, '2025-04-24 20:19:35', '李四', 1, 1, '2', '王五', NULL, NULL, '2025-04-24 20:19:46', '李四', 1, '2025-04-24 20:19:34');
INSERT INTO `work_order` VALUES (11, '测试51', '测试51', NULL, 2, '2025-05-06 09:01:45', '李四', 1, 1, '2', '王五', '李四', 1, '2025-05-06 09:01:45', '李四', 1, '2025-04-24 20:24:32');
INSERT INTO `work_order` VALUES (12, '测试43', '测试43测试43测试43', NULL, 1, '2025-04-24 20:31:37', '李四', 1, 1, '2', '王五', '李四', 1, '2025-04-24 20:31:37', '李四', 1, '2025-04-24 20:29:26');
INSERT INTO `work_order` VALUES (13, '测试565', '测试565测试565测试565', '工单备注', 2, '2025-04-24 20:31:54', '李四', 1, 1, '2', '王五', NULL, NULL, '2025-04-24 20:31:53', '李四', 1, '2025-04-24 20:31:53');

SET FOREIGN_KEY_CHECKS = 1;
