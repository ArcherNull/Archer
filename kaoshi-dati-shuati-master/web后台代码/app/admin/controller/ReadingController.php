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

use app\admin\model\LessionModel;
use cmf\controller\AdminBaseController;
use think\Db;

class ReadingController extends AdminBaseController
{


	
    public function index()
    {
        $map    = [];
		$data   = $this->request->param();
        $readid = isset($data['readid']) && $data['readid'] ? $data['readid'] : '';
        if ($readid != '') {
            $map[] = ['readid', '=', $readid];
        }
		$list = DB::name('reading')->where($map)->order("id desc")->paginate(10, false, ['query' => input()]);		
		$page = $list->render();
		$this->assign("page", $page);
        $this->assign('list', $list);
        $this->assign('readid', $readid);


        return $this->fetch();
    }


    public function add()
    {

        $data   = $this->request->param();

        $this->assign('readid', $data['readid']);
        return $this->fetch();
    }


    public function addPost()
    {
        if ($this->request->isPost()) {
            $data           = $this->request->param();
            $validate         = $this->validate($data, 'Reading');
            if ($validate !== true) {
                $this->error($validate);
            }				
            $data['readid']=$data['readid'];
			$data['addtime']=time();
            $result         = DB::name('reading')->insert($data);
            if (!$result) {
                $this->error($result);
            }
            $this->success("添加成功！", url("reading/index",array('readid'=>$data['readid'])));
        }
    }

    public function edit()
    {
        $id             = $this->request->param('id');
        $result          = DB::name('reading')->where('id',$id)->find();
        $this->assign('result', $result);

        $data   = $this->request->param();

        $this->assign('readid', $data['readid']);

        return $this->fetch();
    }

    public function editPost()
    {
        if ($this->request->isPost()) {
            $data   = $this->request->param();
            $validate         = $this->validate($data, 'Reading');
            if ($validate !== true) {
                $this->error($validate);
            }			
			$data['addtime']=time();
            $slidePostModel = DB::name('reading')->where('id',$data['id'])->update($data);
			
			if($slidePostModel){
				$this->success("保存成功！", url("reading/index",array('readid'=>$data['readid'])));
			}
             $this->error('信息错误');
        }
    }


    public function delete()
    {
        if ($this->request->isPost()) {
            $id             = $this->request->param('id', 0, 'intval');
            $data = $this->request->param();
			if(DB::name('reading')->where('id',$id)->delete()){
				$this->success("删除成功！", url("reading/index",array('readid'=>$data['readid'])));
			}
			
            $this->error('信息错误');
        }
    }	
}
