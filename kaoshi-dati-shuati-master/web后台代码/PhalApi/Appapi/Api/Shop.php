<?php

/**
 * 试题
 */
class Api_Shop extends PhalApi_Api {

    public function getRules() {
        return array(

            'getGoodsList' => array(

            ),
            'subTests' => array(
                'testsid' => array('name' => 'testsid', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '考试ID即语音ID'),
                'answer'  => array('name' => 'answer', 'type' => 'string', 'require' => true, 'desc' => '答案字符串, JSON格式 题号1: 答案1, ...'),
                'start_time'  => array('name' => 'start_time', 'type' => 'int', 'require' => true, 'desc' => '开始做题时间')
            ),
            'exchange' => array(
                'good_id'  => array('name' => 'good_id', 'type' => 'int', 'require' => true, 'desc' => '商品id')
            ),


        );
    }

    /**
     * 获取
     * @desc 获取商品列表
     * @return int code 操作码，0表示成功
     * @return array info 商品列表
     * @return string msg 提示信息
     */
    public function getGoodsList() {
        $rs = array('code' => 0 , 'msg' => '获取成功', 'info' => array());

        $domain = new Domain_Shop();

        $info = $domain->getGoodsList();

        $rs['info'][0] = $info;

        return $rs;

    }


    /**
     * 交卷
     * @desc 答题最后 交卷
     * @return int code 操作码 0表示成功
     * @return string msg 提示信息
     */
    public function subTests(){
        $uid = checkNull($this->uid);
        $token = checkNull($this->token);
        $testsid = checkNull($this->testsid);
        $start_time = checkNull($this->start_time);
        $answer = $this->answer;
        $checkToken=checkToken($uid,$token);
        if($checkToken==700){
            $rs['code'] = $checkToken;
            $rs['msg'] = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Tests();

        $res = $domain->subTests($uid, $testsid, $start_time, $answer);

        return $res;

    }

    /**
     * 兑换商品
     * @desc 积分商城 兑换商品
     * @return int code 操作码 0表示成功
     * @return string msg 提示信息
     */
    public function exchange(){

        $uid = checkNull($this->uid);
        $token = checkNull($this->token);
        $good_id = checkNull($this->good_id);
        $checkToken=checkToken($uid,$token);
        if($checkToken==700){
            $rs['code'] = $checkToken;
            $rs['msg'] = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Shop();

        $rs = $domain->exchange($uid, $good_id);

        return $rs;
    }


    /**
     * @desc获取用户实时积分
     * @return int code 操作码 0表示成功
     * @return string msg 提示信息
     */
    public function getUserScore() {
        $rs = array('code' => 0 , 'msg' => '获取成功', 'info' => array());

        $uid = checkNull($this->uid);
        $token = checkNull($this->token);
        $checkToken=checkToken($uid,$token);
        if($checkToken==700){
            $rs['code'] = $checkToken;
            $rs['msg'] = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Shop();
        $info = $domain->getUserScore($uid);
        $rs['info'][0] = $info;

        return $rs;

    }





}
