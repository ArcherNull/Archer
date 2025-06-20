<?php

class Model_Tests extends PhalApi_Model_NotORM {


    // 获取试题列表
    public function getTestsList($where) {
        $info=DI()->notorm->question
            ->where($where)
            ->fetchAll();
        return $info;
    }

    public function getAns($where,$field='*'){
        $info= DI()->notorm->tests_user
            ->select($field)
            ->where($where)
            ->fetchOne();

        return $info;
    }

    public function getAnsNums($where){
        return  DI()->notorm->tests_user
            ->where($where)
            ->count();
    }

    public function setAns($data) {

        $rs= DI()->notorm->tests_user
            ->insert($data);

        return $rs;
    }

    public function upAns($where,$data) {

        $rs= DI()->notorm->tests_user
            ->where($where)
            ->update($data);

        return $rs;
    }

    public function delAns($where) {

        $rs= DI()->notorm->tests_user
            ->where($where)
            ->delete();

        return $rs;
    }

    //获取答题记录
    public function getAnswerHistory($where) {
        return DI()->notorm->tests_user
            ->where($where)
            ->order("starttime DESC")
            ->fetchAll();
    }

    //增加用户积分
    public function setIncIntegral($uid, $integral){
        DI()->notorm->users->where(["id"=>$uid])->update(['score' => new \NotORM_Literal("score + {$integral}" )]);
        //积分记录表
        $day_insert = [
            'uid' => $uid,
            'change_score' => $integral,
            'reason' => 4, //答题
            'addtime' => time(),
            'type' => 1
        ];
        DI()->notorm->scores_record->insert($day_insert);

    }


    //获取用户今天答题的次数
    public function getUserTodayAnswer($where) {

        $today_start=mktime(0,0,0,date('m'),date('d'),date('Y'));
        $today_end=mktime(0,0,0,date('m'),date('d')+1,date('Y'))-1; //23:59:59

        return DI()->notorm->tests_user
            ->where($where)
            ->where('starttime>=?', $today_start)
            ->where('starttime<=?', $today_end)
            ->count();
    }




}
