<?php

class Domain_Tests {


    // 获取试题列表
    public function getTestsList($where = []) {
        $model = new Model_Tests();

        $list = $model->getTestsList($where);
        return $list;
    }


    //提交试题答案
    public function subTests($uid, $testsid, $start_time, $user_answer) {

        $rs = array('code' => 0, 'msg' => '提交成功', 'info' => array());

        //增加每天第一次答题的积分
        $res_score = handleUserScoreDay($uid, 4, $testsid);

        // 算分
        $user_answer = json_decode($user_answer, true);

        $model = new Model_Tests();
        $testsData = $model->getTestsList(['reading_id' => $testsid]);

        $scoreArr = [];
        $user_all_score = 0; //用户总成绩
        $error_nums = 0; //错题数
        foreach ((array)$user_answer as $k => $v) { //用户答案 题id => 答案
            foreach ($testsData as $k2 => $v2) {
                if ($k != $v2['id']) {
                    continue;
                }

                $scoreArr[$k]['isok'] = 0; //是否正确
                $scoreArr[$k]['score'] = 0; //得分
                $scoreArr[$k]['rs'] = is_array($v) ? implode(',', $v) : $v; //用户答案

                $que_answer = json_decode($v2['answer'], true);
                //判断题 单选题
                if ($v2['type'] < 2) {
                    if ($que_answer['rs'] == $v) {
                        $scoreArr[$k]['isok'] = 1;
                        $scoreArr[$k]['score'] = $v2['score'];
                        $user_all_score+=$v2['score'];
                    } else {
                        $error_nums++;
                    }
                }

                //多选题(定项)
                if ($v2['type'] == 2) {
                    $usr_answer_rs = (array)$v;
                    $que_rs_arr = explode(',', $que_answer['rs']);

                    $right_num = 0;
                    foreach ($usr_answer_rs as $k_rs => $v_rs) {
                        if(in_array($v_rs, $que_rs_arr)) {
                            $right_num++;
                        }
                    }
                    if ($right_num == count($que_rs_arr)) {
                        $scoreArr[$k]['isok'] = 1;
                        $scoreArr[$k]['score'] = $v2['score'];
                        $user_all_score+=$v2['score'];
                    } else {
                        $error_nums++;
                    }

                }

            }
        }

        $endtime = time();
        $start_time = (int)$start_time / 1000;

        $result_data = [
            'uid'     => $uid,
            'testsid' => $testsid,
            'answer'  => json_encode($scoreArr),
            'score'   => $user_all_score,
            'actionuid'=>0,
            'actiontime'=>0,
            'starttime'=> $start_time,
            'endtime'=> $endtime,
            'error_nums'=> $error_nums,
        ];

        //存表
        $res = $model->setAns($result_data);
        if(!$res){
            $rs['code']=1006;
            $rs['msg']='提交失败，请重试';
            return $rs;
        }

        //成绩 正确率 用时 错题数 对题数
        $all_nums = count($testsData);
        $right_nums = $all_nums - $error_nums;
        $info = [
            'score' => $user_all_score,
            'acc'   => round(($right_nums / $all_nums) * 100, 2),
            'time'  => time2string((int)($endtime - $start_time)), //时分秒
            'error_nums' => $error_nums,
            'right_nums' => $right_nums,
            'res_score'  => $res_score ? getConfigPub()['user_day_score'] : '0'
        ];

        $rs['info'] = $info;

        return $rs;

    }


    //获取答题记录
    public function getAnswerHistory($uid)
    {

        $model     = new Model_Tests();
        $testsData = $model->getAnswerHistory(['uid' => $uid]);

        //开始年月日 时分秒 得分 用时 所得积分
        foreach ($testsData as $k => $v) {
            $testsData[$k]['begin_ymd'] = date('Y-m-d', $v['starttime']);
            $testsData[$k]['begin_hms'] = date('H:m:s', $v['starttime']);
            $testsData[$k]['duration']  = $v['endtime'] > $v['starttime'] ? time2string($v['endtime'] - $v['starttime']) : 0;
        }

        return $testsData;
    }


    //检查是否可以答题
    public function checkAnswer($uid)
    {
        $rs = array('code' => 0, 'msg' => '检查成功,可以答题', 'info' => array());

        $model     = new Model_Tests();
        $todayAnswer = $model->getUserTodayAnswer(['uid' => $uid]);
        $config = getConfigPub();
        $dayAnswerNum = $config['day_answer_num'] ?? 0;
        if ((int)$todayAnswer >= (int)$dayAnswerNum) {
            $rs['code'] = 1007;
            $rs['msg']  = '已超出今日答题次数';
            return $rs;
        }

        return $rs;

    }


    // 获取试题列表
    public function getTestsListIndex($where = [])
    {
        $model = new Model_Tests();
        $list  = $model->getTestsList($where);

        //随机取后台设置的数量
        $config      = getConfigPub();
        $questionNum = $config['question_num'] ?? 5; //默认5个

        if (count($list) < $questionNum) {
            return $list;
        }

        $maxK = count($list) - 1;
        $arr  = [];
        $ids  = [];
        $num  = 0;
        while ($num < $questionNum) {
            $randK = rand(0, $maxK);
            if (!in_array($list[$randK]['id'], $ids)) {
                $arr[] = $list[$randK] ?? [];
                $ids[] = $list[$randK]['id'];
                $num++;
            }
        }

        return $arr;
    }


    /*********************首页答题*****************/

    //提交试题答案
    public function subTestsIndex($uid, $start_time, $user_answer)
    {

        $rs = array('code' => 0, 'msg' => '提交成功', 'info' => array());
        $model     = new Model_Tests();
        //判断今天第几次提交
        $todayAnswer = $model->getUserTodayAnswer(['uid' => $uid]);
        $config = getConfigPub();
        $dayAnswerNum = $config['day_answer_num'] ?? 0;
        if ((int)$todayAnswer >= (int)$dayAnswerNum) {
            $rs['code'] = 1007;
            $rs['msg']  = '已超出今日答题次数';
            return $rs;
        }

        // 算分和处理积分
        $user_answer = json_decode($user_answer, true);

        $testsData = $model->getTestsList([]);

        $scoreArr       = [];
        $user_all_score = 0; //用户总成绩
        $error_nums     = 0; //错题数
        $res_integral   = 0; //用户答题所获积分
        foreach ((array)$user_answer as $k => $v) { //用户答案 题id => 答案
            foreach ($testsData as $k2 => $v2) {
                if ($k != $v2['id']) {
                    continue;
                }

                $scoreArr[$k]['isok']  = 0; //是否正确
                $scoreArr[$k]['score'] = 0; //得分
                $scoreArr[$k]['rs']    = is_array($v) ? implode(',', $v) : (string)$v; //用户答案

                $que_answer = json_decode($v2['answer'], true);
                //判断题 单选题
                if ($v2['type'] < 2) {
                    if ($que_answer['rs'] == $v) {
                        $scoreArr[$k]['isok']  = 1;
                        $scoreArr[$k]['score'] = $v2['score'];
                        $user_all_score        += $v2['score'];
                        $res_integral          += $v2['integral'];
                    } else {
                        $error_nums++;
                    }
                }

                //多选题(定项)
                if ($v2['type'] == 2) {
                    $usr_answer_rs = (array)$v;
                    $que_rs_arr    = explode(',', $que_answer['rs']); //题目正确答案数组

                    $right_num = 0;
                    foreach ($usr_answer_rs as $k_rs => $v_rs) {
                        if (in_array($v_rs, $que_rs_arr)) {
                            $right_num++;
                        }
                    }
                    if ($right_num == count($que_rs_arr) && ($right_num == count($usr_answer_rs))) {
                        $scoreArr[$k]['isok']  = 1;
                        $scoreArr[$k]['score'] = $v2['score'];
                        $user_all_score        += $v2['score'];
                        $res_integral          += $v2['integral'];
                    } else {
                        $error_nums++;
                    }

                }

                //填空
                if ($v2['type'] == 4) {
                    $usr_answer_rs = (array)$v;
                    $que_rs_arr    = (array)$que_answer['ans'];

                    foreach ($que_rs_arr as $kk => $vv) {
                        $que_rs_arr[$kk] = $vv[0] ?? '';
                    }
                    $right_num = 0;
                    foreach ($usr_answer_rs as $k_rs => $v_rs) {
                        if (in_array($v_rs, $que_rs_arr)) {
                            $right_num++;
                        }
                    }
                    if ($right_num == count($que_rs_arr)) {
                        $scoreArr[$k]['isok']  = 1;
                        $scoreArr[$k]['score'] = $v2['score'];
                        $user_all_score        += $v2['score'];
                        $res_integral          += $v2['integral'];
                    } else {
                        $error_nums++;
                    }

                }

            }
        }

        $endtime    = time();
        $start_time = (int)$start_time / 1000;

        $result_data = [
            'uid'          => $uid,
            'answer'       => json_encode($scoreArr),
            'score'        => $user_all_score,
            'actionuid'    => 0,
            'actiontime'   => 0,
            'starttime'    => $start_time,
            'endtime'      => $endtime,
            'error_nums'   => $error_nums,
            'res_integral' => $res_integral,
        ];

        //存表
        $res = $model->setAns($result_data);
        if (!$res) {
            $rs['code'] = 1006;
            $rs['msg']  = '提交失败，请重试';
            return $rs;
        }

        //增加用户积分
        $model->setIncIntegral($uid, $res_integral);

        //历史最高对题数
        $testsUserData = $model->getAnswerHistory(['uid' => $uid]);
        $rightArr      = [];
        foreach ($testsUserData as $k => $v) {
            $answerArr = json_decode($v['answer'], true);
            foreach ($answerArr as $kk => $vv) {
                if ($vv['isok'] == '1') {
                    $rightArr[$v['id']]++;
                }
            }
        }

        //成绩 正确率 用时 对题数 积分 历史最高对题数 公众号二维码
        $config     = getConfigPub();
        $all_nums   = count($user_answer);
        $right_nums = $all_nums - $error_nums;
        $info       = [
            'score'         => $user_all_score,
            'acc'           => ($all_nums > 0) ? round(($right_nums / $all_nums) * 100, 2) : 0,
            'time'          => time2string((int)($endtime - $start_time)), //时分秒
            'error_nums'    => $error_nums,
            'right_nums'    => $right_nums,
            'res_integral'  => $res_integral,
            'max_right'     => $rightArr ? max($rightArr) : 0,
            'gongzhong_url' => isset($config['gongzhong_url']) ? get_upload_path($config['gongzhong_url']) : '',
        ];

        $rs['info'] = $info;
        return $rs;

    }



}
