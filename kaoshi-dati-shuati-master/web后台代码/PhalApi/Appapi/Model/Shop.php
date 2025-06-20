<?php

class Model_Shop extends PhalApi_Model_NotORM {


    // 获取商品列表
    public function getGoodsList($where) {
        $info=DI()->notorm->goods
            ->where($where)
            ->fetchAll();
        return $info;
    }

    //获取单个商品信息
    public function getGood($where){
        $info=DI()->notorm->goods
            ->where($where)
            ->fetchOne();
        return $info;
    }


    //扣除用户积分(商城兑换)
    public function reduceScore($where, $reduceScore){
        $res = DI()->notorm->users
                ->where($where)
                ->update(['score' => new \NotORM_Literal("score - {$reduceScore}" )]);

        return $res;
    }


    //添加积分记录表
    public function addScoreHistory($score_his) {
        $res = DI()->notorm->scores_record->insert($score_his);

        return $res;
    }


    //检查积分是否够
    public function checkUserScore($uid, $reduceScore) {
        $userData = DI()->notorm->users
            ->select('score')
            ->where('id=?',$uid)
            ->fetchOne();

        if ($userData['score'] >= $reduceScore) {
            return true;
        }

        return false;
    }


    //添加兑换订单
    public function addShopOrder($order) {

        $res = DI()->notorm->goods_record->insert($order);

        return $res;
    }


    //获取用户实时积分
    public function getUserScore($uid) {

        $info = DI()->notorm->users
            ->select('score')
            ->where('id=?',$uid)
            ->fetchOne();

        return $info;
    }



}
