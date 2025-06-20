<?php

class Domain_Shop
{


    // 获取试题列表
    public function getGoodsList($where = [])
    {
        $model = new Model_Shop();

        $list = $model->getGoodsList($where);

        foreach ($list as $k => $v) {
            $list[$k]['thumb'] = get_upload_path($v['thumb']);
            $multi_thumb       = [];
            if ($v['multi_thumb']) {
                $multi_thumb = explode(',', $v['multi_thumb']);
                foreach ($multi_thumb as $k2 => $v2) {
                    $multi_thumb[$k2] = get_upload_path($v2);
                }
            }
            $list[$k]['multi_thumb'] = $multi_thumb;
        }
        return $list;
    }

    //兑换商品
    public function exchange($uid, $good_id)
    {
        $rs = array('code' => 0, 'msg' => '兑换成功', 'info' => array());

        $where    = ['id' => $good_id];
        $model    = new Model_Shop();
        $goodData = $model->getGood($where);
        //扣除积分
        $reduceScore    = $goodData['score'] ?? 0;
        $now = time();

        //检测积分是否够
        $checkScore = $model->checkUserScore($uid, $reduceScore);
        if (!$checkScore) {
            $rs['msg'] = '积分余额不足';
            $rs['code'] = 1004;
            return $rs;
        }

        //开启事务
        DI()->notorm->beginTransaction('db_demo');
        $res_score_user = $model->reduceScore(['id' => $uid], $reduceScore);

        //存入积分记录表
        $score_his = [
            'uid'          => $uid,
            'change_score' => $reduceScore,
            'reason'       => 5,
            'addtime'      => $now,
            'type'         => 2, //2减少
        ];

        $res_score_his = $model->addScoreHistory($score_his);

        //存入商品兑换记录表(订单表)
        $out_trade_no = substr((string)$now, 4) . $uid . rand(1,99);
        $order_data   = [
            'uid'          => $uid,
            'goods_id'     => $good_id,
            'out_trade_no' => $out_trade_no,
            'addtime'      => $now,
        ];

        $res_order = $model->addShopOrder($order_data);

        if ($res_score_user && $res_score_his && $res_order) {
                DI()->notorm->commit('db_demo');
                $rs['info'][] = ['trade_no' => $out_trade_no];
                return $rs;
        } else {
                DI()->notorm->rollback('db_demo');
        }

    }



    //获取用户实时积分信息
    public function getUserScore($userId) {

        $model    = new Model_Shop();
        $info = $model->getUserScore($userId);

        return $info;

    }




}
