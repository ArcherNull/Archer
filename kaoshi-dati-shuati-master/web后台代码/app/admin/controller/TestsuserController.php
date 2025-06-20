<?php

/* 用户做题管理 */

namespace app\admin\controller;

use cmf\controller\AdminBaseController;
use think\Db;

class TestsuserController extends AdminBaseController
{


    public function index()
    {

        $data = $this->request->param();
        $map  = [];

        $adminId = cmf_get_current_admin_id();
        $departId = 0;
        if ($adminId != 1) {
            $departId = db('user')->where('id', $adminId)->value('partybranch');
            $uids = db('users')->where('partybranch', $departId)->column('id');
            $map[] = ['uid', 'in', $uids];
        }

        $list = Db::name('tests_user')
            ->where($map)
            ->order("id desc")
            ->paginate(20);

        $usersData = db('users')->select();
        $zhibu     = db('partybranch')->select();

        $list->each(function ($v, $k) use ($usersData, $zhibu) {

            $v['user_nickname'] = '';
            $v['mobile']        = '';
            $v['zhibu_name']    = '暂无';

            foreach ($usersData as $k_u => $v_u) {
                if ($v_u['id'] == $v['uid']) {
                    $v['user_nickname'] = $v_u['user_nickname'];
                    $v['mobile']        = $v_u['mobile'];

                    foreach ($zhibu as $k_z => $v_z) {
                        if ($v_z['id'] == $v_u['partybranch']) {
                            $v['zhibu_name'] = $v_z['name'];
                        }
                    }

                }
            }

            $v['time_duration'] = ($v['endtime'] > $v['starttime']) ? gmdate('H:i:s', $v['endtime'] - $v['starttime']) : 0;
            $v['starttime'] = date('Y-m-d H:i:s', $v['starttime']);

            return $v;
        });


        $list->appends($data);

        $page = $list->render();
        $this->assign("page", $page);
        $this->assign('list', $list);

        return $this->fetch();

    }

    /* 类型 */
    protected function getTypes($k = '')
    {
        $type = [
            '0' => '判断题',
            '1' => '选择题',
            '2' => '多选题',
            '4' => '填空题',
        ];
        if ($k === '') {
            return $type;
        }
        return isset($type[$k]) ? $type[$k] : '';
    }

    /*
     * 查看对应试题
     */
    public function showquestion() {

        $data = $this->request->param();
        $map  = [];

        $testsId = $data['id'] ?? 0;
        if (!$testsId) {
            $this->error('参数错误');
        }

        $answerData = db('tests_user')->where('id', $testsId)->value('answer');
        $answerData = json_decode($answerData, true);

        $arr = [];
        foreach ($answerData as $k => $v) {
            $arr[] = $k;
        }

        $list = db('question')->whereIn('id',$arr)->paginate(20);

        $list->appends($data);

        $type = $this->getTypes();
        $this->assign('type', $type);

        $page = $list->render();
        $this->assign("page", $page);
        $this->assign('list', $list);


        return $this->fetch('showquestion');
    }





}