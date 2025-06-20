<?php

/**
 * 试题
 */
class Api_Tests extends PhalApi_Api {

    public function getRules() {
        return array(

            'getTestsList' => array(
                'reading_id' => array('name' => 'reading_id', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '语音ID'),
            ),
            'subTests' => array(
                'testsid' => array('name' => 'testsid', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '考试ID即语音ID'),
                'answer'  => array('name' => 'answer', 'type' => 'string', 'require' => true, 'desc' => '答案字符串, JSON格式 题号1: 答案1, ...'),
                'start_time'  => array('name' => 'start_time', 'type' => 'int', 'require' => true, 'desc' => '开始做题时间')
            ),
            'subTestsIndex' => array(
                'answer'     => array('name' => 'answer', 'type' => 'string', 'require' => true, 'desc' => '答案字符串, JSON格式 题号1: 答案1, ...'),
                'start_time' => array('name' => 'start_time', 'type' => 'int', 'require' => true, 'desc' => '开始做题时间')
            ),

        );
    }

    /**
     * 获取
     * @desc 根据音频id获取试题列表(有声读物中答题)
     * @return int code 操作码，0表示成功
     * @return array info 试题列表
     * @return string msg 提示信息
     */
    public function getTestsList() {
        $rs = array('code' => 0 , 'msg' => '获取成功', 'info' => array());

        $uid = checkNull($this->uid);
        $token = checkNull($this->token);
        $checkToken=checkToken($uid,$token);
        if($checkToken==700){
            $rs['code'] = $checkToken;
            $rs['msg'] = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Tests();

        $reading_id = checkNull($this->reading_id);

        $info = $domain->getTestsList(['reading_id' => $reading_id]);

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
     * 获取答题记录
     * @desc 答题记录
     * @return int code 操作码 0表示成功
     * @return array 答题记录
     */
    public function getAnswerHistory()
    {
        $rs = array('code' => 0, 'msg' => '获取成功', 'info' => array());

        $uid        = checkNull($this->uid);
        $token      = checkNull($this->token);
        $checkToken = checkToken($uid, $token);
        if ($checkToken == 700) {
            $rs['code'] = $checkToken;
            $rs['msg']  = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Tests();
        $info   = $domain->getAnswerHistory($uid);

        $rs['info'][0] = $info;

        return $rs;

    }


    /**
     * 检查是否可以答题
     * @desc 检查是否可以答题
     * @return int code 操作码 0表示成功
     * @return array 答题记录
     */
    public function checkAnswer()
    {
        $uid        = checkNull($this->uid);
        $token      = checkNull($this->token);
        $checkToken = checkToken($uid, $token);
        if ($checkToken == 700) {
            $rs['code'] = $checkToken;
            $rs['msg']  = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Tests();
        $res   = $domain->checkAnswer($uid);

        return $res;

    }


    /**
     * 获取
     * @desc 获取试题列表(首页答题)
     * @return int code 操作码，0表示成功
     * @return array info 试题列表
     * @return string msg 提示信息
     */
    public function getTestsListIndex()
    {
        $rs = array('code' => 0, 'msg' => '获取成功', 'info' => array());

        $uid        = checkNull($this->uid);
        $token      = checkNull($this->token);
        $checkToken = checkToken($uid, $token);
        if ($checkToken == 700) {
            $rs['code'] = $checkToken;
            $rs['msg']  = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Tests();

        $info = $domain->getTestsListIndex();

        $rs['info'][0] = $info;

        return $rs;

    }


    /**************************首页答题相关方法************************/

    /**
     * 交卷
     * @desc 答题最后 交卷 (首页答题)
     * @return int code 操作码 0表示成功
     * @return string msg 提示信息
     */
    public function subTestsIndex()
    {
        $uid        = checkNull($this->uid);
        $token      = checkNull($this->token);
        $start_time = checkNull($this->start_time);
        $answer     = $this->answer;
        $checkToken = checkToken($uid, $token);
        if ($checkToken == 700) {
            $rs['code'] = $checkToken;
            $rs['msg']  = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Tests();

        $res = $domain->subTestsIndex($uid, $start_time, $answer);

        return $res;

    }




}
