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

 Date: 17/04/2025 21:23:56
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for process_node
-- ----------------------------
DROP TABLE IF EXISTS `process_node`;
CREATE TABLE `process_node`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `ps_id` int(0) NOT NULL COMMENT '审批设置id',
  `description` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流程节功能描述',
  `remark` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流程节点备注',
  `approve_user_ids` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '可执行审批人id， 可多个英文逗号分隔',
  `pn_state` int(0) NOT NULL COMMENT '审批节点状态，0 已删除，1，待审批，2，审批成功，3，审批拒绝',
  `bind_wo_id` int(0) NULL DEFAULT NULL COMMENT '绑定工单id',
  `is_original_node` int(0) NOT NULL COMMENT '是否是原始节点数据, 当为true时，用于审批设置流程的复刻流程模板；当为false，则为真实的流程，需要绑定工单id',
  `order` int(0) NOT NULL COMMENT '节点顺序',
  `ap_time` datetime(0) NULL DEFAULT NULL COMMENT '执行审批通过时间',
  `ap_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '执行审批通过人',
  `ap_by_id` int(0) NULL DEFAULT NULL COMMENT '执行审批通过人id',
  `anp_time` datetime(0) NULL DEFAULT NULL COMMENT '执行审批不通过时间',
  `anp_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '执行审批不通过人',
  `anp_by_id` int(0) NULL DEFAULT NULL COMMENT '执行审批不通过人id',
  `updated_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updated_by_id` int(0) NULL DEFAULT NULL,
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_by` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_by_id` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of process_node
-- ----------------------------
INSERT INTO `process_node` VALUES (1, 13, '需要去现场考察1', '目的地深圳市罗湖区2', '1,2', 0, NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-17 18:20:47', '李四', 1, '2025-04-17 11:23:42');
INSERT INTO `process_node` VALUES (2, 13, '报销审查1', '需要提供发票23', '3,4', 0, NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-17 18:20:47', '李四', 1, '2025-04-17 11:23:42');
INSERT INTO `process_node` VALUES (3, 13, '需要去现场考察1', '目的地深圳市罗湖区2', '1,2', 1, NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-17 14:33:08');
INSERT INTO `process_node` VALUES (4, 13, '报销审查1', '需要提供发票23', '3,4', 1, NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-17 14:33:08');
INSERT INTO `process_node` VALUES (5, 13, '最终审核', '拨款以及成本核算', '5,6', 1, NULL, 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '李四', 1, '2025-04-17 14:49:51');

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
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `title`(`title`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of process_setting
-- ----------------------------
INSERT INTO `process_setting` VALUES (1, '测试流程', '测试流程测试流程测试流程测试流程测试流程测试流程1', '测试流程测试流程', 1, '李四', 1, '2025-04-16 19:46:12', '李四', 1, '2025-04-16 19:41:08');
INSERT INTO `process_setting` VALUES (2, '测试流程1', '测试流程1测试流程1测试流程1测试流程1测试流程1', '测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1', 1, NULL, NULL, NULL, '李四', 1, '2025-04-17 10:16:26');
INSERT INTO `process_setting` VALUES (7, '测试流程2', '测试流程1测试流程1测试流程1测试流程1测试流程1', '测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1', 1, NULL, NULL, NULL, '李四', 1, '2025-04-17 10:22:18');
INSERT INTO `process_setting` VALUES (8, '测试流程3', '测试流程1测试流程1测试流程1测试流程1测试流程1', '测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1', 1, NULL, NULL, NULL, '李四', 1, '2025-04-17 10:23:02');
INSERT INTO `process_setting` VALUES (13, '测试流程8', '测试流程1测试流程1测试流程1测试流程1测试流程1', '测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1', 1, '李四', 1, '2025-04-17 14:33:08', '李四', 1, '2025-04-17 11:23:42');

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
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nick_name`(`nick_name`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '李四', '会飞的猪', '管理员', '991584844@qq.com', '$2b$12$c5WSa3j8GjyfmNE.47h7QeXAP0SJqo541m8ZyxMgk3P1QOzvsmTDW', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (2, '王五', '会跑的树', '审核员', '991584845@qq.com', '$2b$12$HCdCF1zSSrUJojXIFEqnnuT01tvc825l7RxlIGi8HO4Yb9QUTRBue', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (3, '张六', '会跑的书', '审核员', '991584846@qq.com', '$2b$12$y7pzYBPSS3mB.DfszNdDqufY7x/C4z9Y.CiUNDyvHIzU9c8aRfxeK', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (4, '陈七', '会跑的属', '审核员', '991584847@qq.com', '$2b$12$vbS3UvCToy.jakfDECe26e9icqaixzNPHETxyp7zGbuIBuC1Fmguq', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (5, '赵八', '爆炸的汽车', '审核员', '991584818@qq.com', '$2b$12$OdIiFnEMf3OkqJMZKaxdquVAPI/1bwoW7d9gIDjOplh9OlGNfkACe', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (8, '吴三', '爆炸的飞机', '员工', '991584828@qq.com', '$2b$12$a7JBbmKuzxM5zngcold0DemSVJwlLa9Zf3ohKIc9I7Fbf.Pcbdm0O', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (9, '关二', '奔跑的汽车', '员工', '991584858@qq.com', '$2b$12$Hf08J7AUigEdw9Hgs3RLrONC/Yo.FlL9VCumeWY/0GBhtdI4DRhgG', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (10, '冠一', '奔跑的人', '员工', '991584868@qq.com', '$2b$12$l50mSK3kiBhyMABg76DOO.S9R4Zks70G5RVhYc7gPcxDxpH9xqt26', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (11, '疯三', '奔跑的狗', '员工', '991584878@qq.com', '$2b$12$2PJpGGBamr0tA7D3IMTpJubYBJfNL9bMMXHJ/P56JqkP3b4IlQGsK', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (12, '田二', '喵喵的猫', '员工', '991584888@qq.com', '$2b$12$sEgP6.XEUu1dHyc53UL6yuLAj7lQAzBrxJ2vZ1balz94R0sM9E7Hq', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (13, '万田', '汪汪的狗', '员工', '991584898@qq.com', '$2b$12$sdIajPINr2DhybVpIQu2fewvpAppv5IWVASR2B5xY7J.MaruutHue', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (14, '李一', '阳阳的狗', '员工', '991584198@qq.com', '$2b$12$jnc00Jr4E8Bud1wckwZFi.rF0s1JNXN58kBc4H6JLsgR.djuhkCLC', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (15, '高二', '阳的狗', '员工', '991584298@qq.com', '$2b$12$egRxFn7r81CtL8B2lUZzFufluvuGhQtkLcn8ALbs1JpyV3hnBzR0S', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (16, '线二', '后来的狗', '员工', '991585298@qq.com', '$2b$12$Pgw5q6ITOdDw8vRSAvDCOuKgzSZ4eB3EBYW5nfYPzybmEyY9A9lnK', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (17, '什四', '后来的他', '员工', '991585398@qq.com', '$2b$12$iylZZY5P08dCNFsq6HVAAOPPuYFvP1lLo7BSGezjw4vo3u7jUhPhy', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (18, '天五', '变色龙', '员工', '99158598@qq.com', '$2b$12$WNXRTdU0/Ro6xVHykj0j.OqsNCbmAFyPNBocWXIq7KvfgxppHYc66', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (19, '岗五', '变色', '员工', '99168598@qq.com', '$2b$12$xQF3ciP5gZmmhSoaRNUyGe2maT/KQ2o.7j14pNdc79u7HRoHjTGoG', '2025-04-16 16:47:03', '2025-04-15 16:47:03');
INSERT INTO `user` VALUES (20, '空五', '变色虫', '员工', '99198598@qq.com', '$2b$12$IzjMdaHT229Bep491.R9jO2sLVfSZxubmuOnbQa2hnZ.qkePFw1Cq', '2025-04-16 16:47:03', '2025-04-15 16:47:03');

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
  `updated_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updated_by_id` int(0) NULL DEFAULT NULL,
  `updated_at` datetime(0) NULL DEFAULT NULL,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_by_id` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of work_order
-- ----------------------------
INSERT INTO `work_order` VALUES (1, '测试工单', '测试工单测试工单测试工单测试工单', '测试工单测试工单测试工单测试工单测试工单测试工单测试工单测试工单测试工单测试工单1', NULL, NULL, NULL, NULL, 1, '李四', 1, '2025-04-16 19:41:28', '李四', 1, '2025-04-16 17:29:57');

SET FOREIGN_KEY_CHECKS = 1;
