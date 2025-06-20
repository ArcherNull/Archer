<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-present http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 小夏 < 449134904@qq.com>
// +----------------------------------------------------------------------
namespace app\admin\controller;

use cmf\controller\AdminBaseController;
use think\Db;

class UseraskController extends AdminBaseController
{

    private function checkasklist($id){
		return DB::name('ask_list')->where('id',$id)->find();
	}
    public function index()
    {
        $map    = [];
		$data   = $this->request->param();
        $listid = $data['listid'] ? $data['listid'] : '';
		if(!$this->checkasklist($listid)){
			$this->error('信息错误！');
		}		
        if ($listid != '') {
            $map[] = ['listid', '=', $listid];
        }

        $arr = [];
		//查询问题
        $list = DB::name('ask')->where($map)->select()->toArray();
		
        $i=0;
        foreach($list as $k=>$v) {
            $option = json_decode($v['option_json'],true);
			//查询问卷
            $info = DB::name('user_ask_list')->where(['askid'=>$v['id']])->find();
            $option1 = json_decode($info['nums'],true);
            foreach($option as $k1=>$v1){
                $arr[$i]['title'] =  $v['title'].'-'.$v1;
                $arr[$i]['nums'] =  $option1[$k1] ?? 0;
                $i = $i+1;
            }
			
        };	
		//总计答题人数
		$count = DB::name('user_ask')->where(['listid'=>$listid])->count();
		
        $this->assign('list', $arr);
        $this->assign('count', $count);
        $this->assign('listid', $listid);

        return $this->fetch();
    }
}
