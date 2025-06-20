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

use app\admin\model\ActiveModel;
use cmf\controller\AdminBaseController;
use think\Db;

class ActiveController extends AdminBaseController
{

    public function index()
    {
        $map    = [];
		$data   = $this->request->param();
		$list = DB::name('active')->where($map)->order("list_order asc")->paginate(10, false, ['query' => input()]);
		$page = $list->render();
		$this->assign("page", $page);
        $this->assign('list', $list);
        return $this->fetch();
    }


    public function add()
    {
		return $this->fetch();
    }


    public function addPost()
    {
        if ($this->request->isPost()) {

            $data           = $this->request->param();


            if($data['title'] == ''){
                $this->error('请填写标题');
            }

            if($data['thumb'] == ''){
                $this->error('请上传封面');
            }

            if($data['content'] == ''){
                $this->error('请填写内容');
            }

            if($data['endtime'] == ''){
                $this->error('请选择结束时间');
            }

            $data['addtime']=time();
            $data['endtime']=strtotime($data['endtime']);
            $result         = DB::name('active')->insert($data);
            if (!$result) {
                $this->error($result);
            }
            $this->success("添加成功！", url("active/index"));
        }
    }

    public function edit()
    {

        $data = $this->request->param('id');
        $id             = $this->request->param('id');
        $result          = DB::name('active')->where('id',$id)->find();
        $this->assign('result', $result);
        return $this->fetch();
    }

    public function editPost()
    {
        if ($this->request->isPost()) {
            $data   = $this->request->param();

            if($data['title'] == ''){
                $this->error('请填写标题');
            }
    
            if($data['thumb'] == ''){
                $this->error('请上传封面');
            }
    
            if($data['content'] == ''){
                $this->error('请填写内容');
            }
    
            if($data['endtime'] == ''){
                $this->error('请选择结束时间');
            }
            $data['addtime']=time();
            $data['endtime']=strtotime($data['endtime']);
            $slidePostModel = DB::name('active')->where('id',$data['id'])->update($data);
			
			if($slidePostModel){
				$this->success("保存成功！", url("active/index"));
			}
             $this->error('信息错误');
        }
    }


    public function delete()
    {
        if ($this->request->isPost()) {

            
            $id             = $this->request->param('id', 0, 'intval');
			if(DB::name('active')->where('id',$id)->delete()){
				$this->success("删除成功！", url("active/index"));
			}
			
            $this->error('信息错误');
        }
    }

    public function listOrder()
    {
        $NewspageModel = new  ActiveModel();
        parent::listOrders($NewspageModel);
        $this->success("排序更新成功！");
    }	
}
