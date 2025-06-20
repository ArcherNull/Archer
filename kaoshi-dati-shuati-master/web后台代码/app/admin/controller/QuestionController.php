<?php

/* 题目管理 */
namespace app\admin\controller;

use cmf\controller\AdminBaseController;
use think\Db;

class QuestionController extends AdminBaseController
{
    protected function handelClass($data,$pid=0){
        $list=[];
        foreach ($data as $k=>$v){
            if($v['pid']==$pid){
                unset($data[$k]);
                $rs=$this->handelClass($data,$v['id']);
                $v['list']=$rs;
                $list[]=$v;
            }
        }
        return $list;
    }
    protected function getClass(){
        $list = Db::name('question_class')
            ->order("pid asc,list_order asc")
            ->select()->toArray();

        $list=$this->handelClass($list,0);
        $list2=[];
        foreach($list as $k=>$v){
            foreach ($v['list'] as $k2=>$v2){
                $name=$v['name'].' - '.$v2['name'];
                $v2['name']=$name;
                $list2[$v2['id']]=$v2;
            }
        }
        return $list2;
    }

    /* 类型 */
    protected function getTypes($k=''){
        $type=[
            '0' => '判断题',
            '1' => '选择题',
            '2' => '多选题',
            '4' => '填空题',
        ];
        if($k===''){
            return $type;
        }
        return isset($type[$k])? $type[$k] : '' ;
    }
    public function index()
    {
        $data = $this->request->param();
        $map=[];

        $reading_id= $data['reading_id'] ?? '';

        if($reading_id!=''){
            $map[]=['reading_id','=',$reading_id];
        }

        $typeid= $data['typeid'] ?? '';
        if($typeid!=''){
            $map[]=['type','=',$typeid];
        }

        $keyword= $data['keyword'] ?? '';
        if($keyword!=''){
            $map[]=['title','like','%'.$keyword.'%'];
        }

        $list = Db::name('question')
            ->where($map)
            ->order("id desc")
            ->paginate(20);

        $list->each(function ($v,$k){
            return $v;
        });
        $list->appends($data);

        $page = $list->render();
        $this->assign("page", $page);
        $this->assign('list', $list);

        $type=$this->getTypes();
        $this->assign('type', $type);

        $this->assign('reading_id', $reading_id);

        return $this->fetch();
    }


    public function add()
    {

        $type=$this->getTypes();
        $this->assign('type', $type);

        return $this->fetch();
    }

    public function addPost()
    {
        if ($this->request->isPost()) {
            $data      = $this->request->param();

            $type=$data['type'] ?? '';
            $title= $data['title'] ?? '';

            $score=$data['score'];
            $answer=[
                'nums'=>'2',
                'rs'=>'',
                'ans'=>[],
            ];

            if($title==''){
                $this->error('请填写题目文字');
            }

            if($type==0){
                if(!isset($data['ans_0'])){
                    $this->error('请选择正确答案');
                }
                $answer['rs']=$data['ans_0'];

                if($score<=0){
                    $this->error('请填写正确分数');
                }

            }
            if($type==1 || $type==2){
                if(!isset($data['item_select'])){
                    $this->error('请填写所有选项');
                }
                $item_select=$data['item_select'];
                foreach ($item_select as $k=>&$v){
                    $v= $v ?? '';
                    if($v==''){
                        $this->error('请填写所有选项');
                    }
                }
                $answer['nums']=(string)count($item_select);
                $answer['ans']=$item_select;

            }

            if ($type == 1) {
                if(!isset($data['ans_1'])){
                    $this->error('请选择正确答案');
                }
                $answer['rs']=$data['ans_1'];

                if($score<=0){
                    $this->error('请填写正确分数');
                }

            }

            if($type==2){

                if(!isset($data['ans_2'])){
                    $this->error('请选择正确答案');
                }
                $answer['rs']=implode(',',$data['ans_2']);

                if($score<=0){
                    $this->error('请填写正确分数');
                }
            }

            $insert=[
                'type'=>$type,
                'title'=>$title,
                'answer'=>json_encode($answer),
                'score'=>$score,
                'addtime'=>time(),
                'reading_id' => $data['reading_id'] ?? 0
            ];

            $id = DB::name('question')->insertGetId($insert);
            if(!$id){
                $this->error("添加失败！");
            }
            $this->success("添加成功！");
        }
    }


    public function edit()
    {
//        $id   = $this->request->param('id', 0, 'intval');
//
//        $data=Db::name('question')
//            ->where("id={$id}")
//            ->find();
//        if(!$data){
//            $this->error("信息错误");
//        }
//
//        $answer=json_decode($data['answer'],true);
//        $type=$data['type'];
//        if($type==4){
//            $rs=$answer['ans'];
//            foreach ($rs as $k=>&$v){
//                $v=implode("\r\n",$v);
//            }
//            $answer['ans']=$rs;
//        }
//
//        if($type==3){
//            $rs=$answer['ans'];
//            $img='';
//            foreach ($rs as $k=>&$v){
//                $img=$v;
//            }
//            $answer['ans']=$img;
//        }
//
//        $this->assign('data', $data);
//        $this->assign('answer', $answer);
//
//        $select_list=['A','B','C','D','E','F','G','H','I','J','K','L','M','N'];
//        $this->assign('select_list', $select_list);
//
//        $class=$this->getClass();
//
//        $this->assign('class', $class);
//
//        $type=$this->getTypes();
//        $this->assign('type', $type);
//
//        return $this->fetch();

        $id = $this->request->param('id', 0, 'intval');

        $data = Db::name('question')
            ->where("id={$id}")
            ->find();
        if (!$data) {
            $this->error("信息错误");
        }

        $answer = json_decode($data['answer'], true);
        $type   = $data['type'];
        if ($type == 4) {
            $rs = $answer['ans'];
            foreach ($rs as $k => &$v) {
                $v = implode("\r\n", $v);
            }
            $answer['ans'] = $rs;
        }

        if ($type == 3) {
            $rs  = $answer['ans'];
            $img = '';
            foreach ($rs as $k => &$v) {
                $img = $v;
            }
            $answer['ans'] = $img;
        }

        $this->assign('data', $data);
        $this->assign('answer', $answer);

        $select_list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
        $this->assign('select_list', $select_list);

        $type = $this->getTypes();
        $this->assign('type', $type);

        return $this->fetch();



    }

    public function editPost()
    {
//        if ($this->request->isPost()) {
//            $data      = $this->request->param();
//
//            $classid=$data['classid'];
//            $type=$data['type'];
//            $title=checkNull($data['title']);
//
//            $score=$data['score'];
//            $answer=[
//                'nums'=>'2',
//                'rs'=>'',
//                'ans'=>[],
//                'img'=>'',
//                't_img'=>'',
//                't_audio'=>'',
//                't_video'=>'',
//            ];
//
//            if($title==''){
//                $this->error('请填写题目');
//            }
//
//            $t_img= $data['t_img'] ?? '';
//            $t_audio= $data['t_audio'] ?? '';
//            $t_video= $data['t_video'] ?? '';
//
//            $t_video_img= $data['t_video_img'] ?? '';
//            if($t_video!=''){
//                if($t_video_img==''){
//                    $this->error('请上传视频封面');
//                }
//            }else{
//                $t_video_img='';
//            }
//
//            $answer['t_img']=$t_img;
//            $answer['t_audio']=$t_audio;
//            $answer['t_video']=$t_video;
//            $answer['t_video_img']=$t_video_img;
//
//            if($type==0){
//                if(!isset($data['ans_0'])){
//                    $this->error('请选择正确答案');
//                }
//                $answer['rs']=$data['ans_0'];
//
//                if($score<=0){
//                    $this->error('请填写正确分数');
//                }
//                $score2=0;
//            }
//            if($type==1 || $type==2 || $type==5){
//                if(!isset($data['item_select'])){
//                    $this->error('请填写所有选项');
//                }
//                $item_select=$data['item_select'];
//                foreach ($item_select as $k=>&$v){
//                    $v=checkNull($v);
//                    if($v==''){
//                        $this->error('请填写所有选项');
//                    }
//                }
//                $answer['nums']=(string)count($item_select);
//                $answer['ans']=$item_select;
//            }
//
//            if($type==1){
//                if(!isset($data['ans_1'])){
//                    $this->error('请选择正确答案');
//                }
//                $answer['rs']=$data['ans_1'];
//
//                if($score<=0){
//                    $this->error('请填写正确分数');
//                }
//                $score2=0;
//            }
//
//            if($type==2){
//                if(!isset($data['ans_2'])){
//                    $this->error('请选择正确答案');
//                }
//                $answer['rs']=implode(',',$data['ans_2']);
//
//                if($score<=0){
//                    $this->error('请填写正确分数');
//                }
//                $score2=0;
//            }
//
//            if($type==3){
//                if(!isset($data['ans_3']) && !isset($data['img_a'])){
//                    $this->error('请填写正确答案');
//                }
//                $rs=checkNull($data['ans_3']);
//                $img_a=checkNull($data['img_a']);
//                if($rs=='' && $img_a==''){
//                    $this->error('请填写正确答案');
//                }
//                $answer['rs']=$rs;
//                $answer['img']=$img_a;
//                if($score<=0){
//                    $this->error('请填写正确分数');
//                }
//                $score2=0;
//
//            }
//
//            if($type==4){
//                if(!isset($data['ans_4'])){
//                    $this->error('请填写正确答案');
//                }
//                $ans_4=$data['ans_4'];
//                $ans=[];
//                foreach ($ans_4 as $k=>$v){
//
//                    $v=checkNull($v);
//                    if($v==''){
//                        $this->error('请填写正确答案');
//                    }
//
//                    $v_a=explode("\r\n",$v);
//                    foreach ($v_a as $k2=>$v2){
//                        if($v2==''){
//                            unset($v_a[$k2]);
//                        }
//                    }
//                    $ans[]=array_values($v_a);
//                }
//                $nums=(string)count($ans);
//                $answer['nums']=$nums;
//                $answer['ans']=$ans;
//
//                $score2=$data['score2'];
//                if($score2<=0){
//                    $this->error('请填写正确的每空分数');
//                }
//                $score=$score2 * $nums;
//            }
//            if($type==5){
//                if(!isset($data['ans_5'])){
//                    $this->error('请选择正确答案');
//                }
//                $answer['rs']=implode(',',$data['ans_5']);
//
//                $score=$data['score'];
//                if($score<=0){
//                    $this->error('请填写正确分数');
//                }
//
//                $score3=$data['score3'];
//                if($score3<=0){
//                    $this->error('请填写正确漏选分数');
//                }
//                $score2=$score3;
//            }
//
//            $parsing=$data['parsing'] ?? '';
//
//            $insert=[
//                'id'=>$data['id'],
//                'classid'=>$classid,
//                'type'=>$type,
//                'title'=>$title,
//                'answer'=>json_encode($answer),
//                'score'=>$score,
//                'score2'=>$score2,
//                'parsing'=>$parsing,
//                'uptime'=>time(),
//            ];
//
//            $rs = DB::name('question')->update($insert);
//
//            if($rs === false){
//                $this->error("保存失败！");
//            }
//            $this->success("保存成功！");
//        }

        if ($this->request->isPost()) {
            $data = $this->request->param();

            $type    = $data['type'] ?? '';
            $title   = $data['title'] ?? '';

            $score  = $data['score'] ?? 0;

            $answer = [
                'nums'    => '2',
                'rs'      => '',
                'ans'     => [],
                'img'     => '',
                't_img'   => '',
                't_audio' => '',
                't_video' => '',
            ];

            if ($title == '') {
                $this->error('请填写题目');
            }

            $t_img   = $data['t_img'] ?? '';
            $t_audio = $data['t_audio'] ?? '';
            $t_video = $data['t_video'] ?? '';

            $t_video_img = $data['t_video_img'] ?? '';

            $answer['t_img']       = $t_img;
            $answer['t_audio']     = $t_audio;
            $answer['t_video']     = $t_video;
            $answer['t_video_img'] = $t_video_img;

            if ($type == 0) {
                if (!isset($data['ans_0'])) {
                    $this->error('请选择正确答案');
                }
                $answer['rs'] = (string)$data['ans_0'];

                if ($score <= 0) {
                    $this->error('请填写正确分数');
                }
                $score2 = 0;
            }
            if ($type == 1 || $type == 2 || $type == 5) {
                if (!isset($data['item_select'])) {
                    $this->error('请填写所有选项');
                }
                $item_select = $data['item_select'];
                foreach ($item_select as $k => &$v) {
                    if ($v == '') {
                        $this->error('请填写所有选项');
                    }
                }
                $answer['nums'] = (string)count($item_select);
                $answer['ans']  = $item_select;
            }

            if ($type == 1) {
                if (!isset($data['ans_1'])) {
                    $this->error('请选择正确答案');
                }
                $answer['rs'] = trim($data['ans_1']);

                if ($score <= 0) {
                    $this->error('请填写正确分数');
                }
                $score2 = 0;
            }

            if ($type == 2) {
                if (!isset($data['ans_2'])) {
                    $this->error('请选择正确答案');
                }
                $answer['rs'] = implode(',', $data['ans_2']);

                if ($score <= 0) {
                    $this->error('请填写正确分数');
                }
                $score2 = 0;
            }

            if ($type == 3) {
                if (!isset($data['ans_3']) && !isset($data['img_a'])) {
                    $this->error('请填写正确答案');
                }
                $rs    = $data['ans_3'] ?? '';
                $img_a = $data['img_a'] ?? '';
                if ($rs == '' && $img_a == '') {
                    $this->error('请填写正确答案');
                }
                $answer['rs']  = $rs;
                $answer['img'] = $img_a;
                if ($score <= 0) {
                    $this->error('请填写正确分数');
                }
                $score2 = 0;

            }

            if ($type == 4) {
                if (!isset($data['ans_4'])) {
                    $this->error('请填写正确答案');
                }
                $ans_4 = $data['ans_4'];
                $ans   = [];
                foreach ($ans_4 as $k => $v) {

                    if ($v == '') {
                        $this->error('请填写正确答案');
                    }

                    $v_a = explode("\r\n", $v);
                    foreach ($v_a as $k2 => $v2) {
                        if ($v2 == '') {
                            unset($v_a[$k2]);
                        }
                    }
                    $ans[] = array_values($v_a);
                }
                $nums           = (string)count($ans);
                $answer['nums'] = $nums;
                $answer['ans']  = $ans;

                $score2 = $data['score2'];
                if ($score2 <= 0) {
                    $this->error('请填写正确的每空分数');
                }
                $score = $score2 * $nums;
            }
            if ($type == 5) {
                if (!isset($data['ans_5'])) {
                    $this->error('请选择正确答案');
                }
                $answer['rs'] = implode(',', $data['ans_5']);

                $score = $data['score'];
                if ($score <= 0) {
                    $this->error('请填写正确分数');
                }

                $score3 = $data['score3'];
                if ($score3 <= 0) {
                    $this->error('请填写正确漏选分数');
                }
                $score2 = $score3;
            }

            $parsing = $data['parsing'] ?? '';

            $insert = [
                'id'      => $data['id'],
                'type'    => $type,
                'title'   => $title,
                'answer'  => json_encode($answer),
                'score'   => $score,
                'uptime'  => time(),
                'integral' => $data['integral'] ?? 0,
            ];

            $rs = DB::name('question')->update($insert);

            if ($rs === false) {
                $this->error("保存失败！");
            }
            $this->success("保存成功！");
        }


    }




    public function listOrder()
    {
        $model = DB::name('question');
        parent::listOrders($model);
        $this->success("排序更新成功！");
    }

    public function del()
    {
        $id = $this->request->param('id', 0, 'intval');

        $rs = DB::name('question')->where('id',$id)->delete();
        if(!$rs){
            $this->error("删除失败！");
        }
        $this->success("删除成功！");
    }

    public function getQuestion(){
        $data      = $this->request->param();
        $classid=isset($data['classid']) ? checkNull($data['classid']): '0';
        $type=isset($data['type']) ? checkNull($data['type']): '';
        $keyword=isset($data['keyword']) ? checkNull($data['keyword']): '';
        $page=isset($data['page']) ? checkNull($data['page']): '';

        $map=[];
        if($classid!=0){
            $map[]=['classid','=',$classid];
        }

        if($type!=''){
            $map[]=['type','=',$type];
        }

        if($keyword!=''){
            $map[]=['title','like','%'.$keyword.'%'];
        }

        if($page<1){
            $page=1;
        }
        $nums=7;
        $start=($page-1) * $nums;

        $type_list=['判断题','单选题','定项多选题','简答题','填空题','不定项多选题'];

        $list=Db::name('question')
            ->field('id,type,title,answer,score,score2,parsing')
            ->where($map)
            ->order('id desc')
            ->limit($start,$nums)
            ->select()
            ->toArray();

        foreach ($list as $k=>$v){
            $answer=json_decode($v['answer'],true);
            if(isset($answer['img'])){
                $answer['img']=get_upload_path($answer['img']);
            }
            if($v['type']==3){
                foreach ($answer['ans'] as $k2=>$v2){
                    $answer['ans'][$k2]=get_upload_path($v2);
                }
            }

            $v['answer']=$answer;
            $v['type_name']=$type_list[$v['type']];

            $list[$k]=$v;
        }
        $total=Db::name('question')
            ->where($map)
            ->count();
        $info=[
            'list'=>$list,
            'total'=>$total,
            'nums'=>$nums,
        ];

        $this->success('','',$info);
    }


    /**
     * 答题情况列表
     * @return 昵称、支部、职位、电话、答题时间、答题分数
     */
    public function answerlist() {

        $data = $this->request->param();
        $map=[];

        $reading_id= $data['reading_id'] ?? '';

        if($reading_id!=''){
            $map[]=['testsid','=',$reading_id];
        }

        $list = Db::name('tests_user')
            ->where($map)
            ->order("id desc")
            ->paginate(20);

        $usersData = db('users')->select();
        $zhibu = db('partybranch')->select();
        $zhiwei = db('partypost')->select();

        $list->each(function ($v,$k) use ($usersData, $zhibu, $zhiwei){
            $v['user_nickname'] = '';
            $v['mobile'] = '';
            $v['zhibu_name'] = '暂无';
            $v['zhiwei_name'] = '暂无';

            foreach ($usersData as $k_u => $v_u) {
                if ($v_u['id'] == $v['uid']) {
                    $v['user_nickname'] = $v_u['user_nickname'];
                    $v['mobile'] = $v_u['mobile'];

                   foreach ($zhibu as $k_z => $v_z) {
                       if ($v_z['id'] == $v_u['partybranch']) {
                           $v['zhibu_name'] = $v_z['name'];
                       }
                   }

                   foreach ($zhiwei as $k_w => $v_w) {
                       if ($v_w['id'] == $v_u['partypost']) {
                           $v['zhiwei_name'] = $v_w['name'];
                       }
                   }

                }
            }

            $v['starttime'] = date('Y-m-d H:i:s', $v['starttime']);
            return $v;
        });

        $list->appends($data);

        $page = $list->render();
        $this->assign("page", $page);
        $this->assign('list', $list);

        return $this->fetch('answerlist');

    }


    //导入试题页面
    public function importquestion() {

        $type = $this->getTypes();
        $this->assign('type', $type);
        return $this->fetch('import_question');
    }


    /**
     * 判断题: 题目 答案 得分 积分
     * 选择题: 题目 答案 得分 积分 选项
     * 多选题: 题目 答案 得分 积分 选项
     * 填空题: 题目 答案 得分 积分 选项
     */
    public function import()
    {

        $data      = $this->request->param();
        $file_path = $data['question_excel'] ?? '';
        if (!$file_path) {
            $this->error('上传失败');
        }

        $question_type = $data['type'] ?? '';

        require_once CMF_ROOT . 'sdk/PHPExcel/PHPExcel.php';
        $Phpexcel = new \PHPExcel();
        //默认上传目录
        //WEB_ROOT . 'upload' . DIRECTORY_SEPARATOR . 'user' . DIRECTORY_SEPARATOR;
        // user/20210326/fb269b0edd0804a13a353f021bf833ca.xlsx
//        $file_name = WEB_ROOT . 'upload' . DIRECTORY_SEPARATOR . $file_path;
        $file_name = get_upload_path($file_path);
        $extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION)); //表格后缀格式
//        http://qiniudz.sdwanyue.com/admin/20210601/e826c13c426aa873f785d37ca1158f2d.xlsx
        $config = getConfigPub();
        $localXls = $file_name;
        if (strpos($config['site'], $file_name) === false) {
            //七牛云存储 远程读取
            $localXls = 'dati.xls'; //远程写入本地文件
            file_put_contents($localXls, file_get_contents($file_name));
        }

        $objReader = \PHPExcel_IOFactory::createReaderForFile($localXls); //准备打开文件
        $objPHPExcel = $objReader->load($localXls);

        $sheet         = $objPHPExcel->getSheet(0); // 读取第一個工作表
        $highestRow    = $sheet->getHighestRow(); // 取得总行数
        $highestColumm = $sheet->getHighestColumn(); // 取得总列数

        $questionInsert = [];

        //判断
        if($question_type == 0) {
            $questionInsert = $this->setPanduan($sheet, $highestRow, $highestColumm);
        }

        if($question_type == 1) {
            $questionInsert = $this->setXuanze($sheet, $highestRow, $highestColumm, $question_type);
        }

        if($question_type == 2) {
            $questionInsert = $this->setXuanze($sheet, $highestRow, $highestColumm, $question_type);
        }

        if($question_type == 4) {
            $questionInsert = $this->setTiankong($sheet, $highestRow, $highestColumm);
        }


        $res = db('question')->insertAll($questionInsert);
        if ($res) {
            //移除本地文件
            @unlink($localXls);
            $this->success('导入成功', "question/index");
        }

        $this->error('导入失败');

    }


    // 处理判断题 excel对象 总行数 总列数
    private function setPanduan($sheet, $highestRow, $highestColumm)
    {

        $question_insert = [];
        //手机号、用户昵称、用户党支部和党内职务和党费
        for ($row = 2; $row <= $highestRow; $row++)    //行号从2开始 第一行标题
        {
            $question_insert[$row - 1] = [
                'type'     => 0,
                'addtime'  => time(),
            ];

            for ($column = 'A'; $column <= $highestColumm; $column++)  //列数是以A列开始
            {
                $dataset[] = $sheet->getCell($column . $row)->getValue();
                $value     = $sheet->getCell($column . $row)->getValue();

                if ($column == 'A') {
                    //题目
                    $question_insert[$row - 1]['title']     = $value;
                }

                if ($column == 'B') {
                    //答案
                    if($value == '对') {
                        $ans = ['nums' => '2', 'rs' => '1', 'ans' =>[]];
                    } else {
                        $ans = ['nums' => '2', 'rs' => '0', 'ans' =>[]];
                    }
                    $question_insert[$row - 1]['answer'] = json_encode($ans);
                }

                if ($column == 'C') {
                    //分数
                    $question_insert[$row - 1]['score'] = $value ?? 0;
                }

                if ($column == 'D') {
                    //积分
                    $question_insert[$row - 1]['integral'] = $value ?? 0;
                }

            }

        }

        return $question_insert;

    }


    // 处理选择题/多选题 excel对象 总行数 总列数
    private function setXuanze($sheet, $highestRow, $highestColumm, $type = '')
    {
        if($type === '') {
            $this->error('请选择题目类型');
        }
        $type = (int)$type;

        $question_insert = [];
        //手机号、用户昵称、用户党支部和党内职务和党费
        for ($row = 2; $row <= $highestRow; $row++)    //行号从2开始
        {
            $question_insert[$row - 1] = [
                'type'     => $type, //单选/多选
                'addtime'  => time(),
            ];

            $ans = []; //存放选项

            for ($column = 'A'; $column <= $highestColumm; $column++)  //列数是以A列开始
            {
                $dataset[] = $sheet->getCell($column . $row)->getValue();
                $value     = $sheet->getCell($column . $row)->getValue();

                if ($column == 'A') {
                    //题目
                    $question_insert[$row - 1]['title']     = $value;
                }

                if ($column == 'C') {
                    //分数
                    $question_insert[$row - 1]['score'] = $value ?? 0;
                }

                if ($column == 'D') {
                    //积分
                    $question_insert[$row - 1]['integral'] = $value ?? 0;
                }

                if ($column == 'B') {
                    //答案
                    if($type === 1) {
                        $valueArr = explode(',',$value);
                        if (count($valueArr) > 1) {
                            $this->error('单选题的答案只能有1个, 请重新录入');
                        }
                        //单选
                        $resultAbc = $this->getAbcValue($value);
                        if($resultAbc === '') {
                            $this->error('导入数据错误' . $row . '行' . $column . '列');
                        }
                        $resultIndex = $resultAbc - 1;
                        $ans = ['nums' => 4, 'rs' => ltrim(rtrim($resultIndex, ","), ","), 'ans' =>[]];
                    } else {
                        //多选 A,B,D
                        $arrValue = explode(',', $value);
                        $duoxuanStrAns = '';
                        foreach($arrValue as $k => $v) {
                            $duoxuanAbc = $this->getAbcValue($v);
                            if($duoxuanAbc === '') {
                                $this->error('导入数据错误' . $row . '行' . $column . '列');
                            }
                            $duoxuanStrAns .= (string)($duoxuanAbc- 1) . ',';
                        }

                        $ans = ['nums' => 0, 'rs' => ltrim(rtrim($duoxuanStrAns, ","), ","), 'ans' => []];
                    }
                }

                //选项
                if($column == 'E') {
                    $ans['ans'] = explode(',',trim($value));
                    $ans['nums'] = (string)count($ans['ans']);
                    $question_insert[$row - 1]['answer'] = json_encode($ans);
                }


            }

        }

        return $question_insert;

    }

    //处理填空
    public function setTiankong($sheet, $highestRow, $highestColumm) {

        $question_insert = [];
        //手机号、用户昵称、用户党支部和党内职务和党费
        for ($row = 2; $row <= $highestRow; $row++)    //行号从2开始
        {
            $question_insert[$row - 1] = [
                'type'     => 4, //单选/多选
                'addtime'  => time(),
            ];

            $ans = []; //存放选项

            for ($column = 'A'; $column <= $highestColumm; $column++)  //列数是以A列开始
            {
                $dataset[] = $sheet->getCell($column . $row)->getValue();
                $value     = $sheet->getCell($column . $row)->getValue();

                if ($column == 'A') {
                    //题目
                    $question_insert[$row - 1]['title']     = $value;
                }

                if ($column == 'C') {
                    //分数
                    $question_insert[$row - 1]['score'] = $value ?? 0;
                }

                if ($column == 'D') {
                    //积分
                    $question_insert[$row - 1]['integral'] = $value ?? 0;
                }
                $ans = ['nums' => 0, 'rs' => '', 'ans' => []];
                //选项
                if($column == 'B') {
                    $arrValue = explode(',',trim($value));
                    foreach($arrValue as $k => $v) {
                        $arrValue[$k] = [$v];
                    }
                    $ans['ans'] = $arrValue;

                    $ans['nums'] = (string)count($ans['ans']);
                    $question_insert[$row - 1]['answer'] = json_encode($ans);
                }

            }

        }

        return $question_insert;

    }

    //选择题选项对应值
    private function getAbcValue($key){
        $key = (string)$key;
        $keyArr = explode(',',$key);
        if (count($keyArr) > 1) {
            $this->error('您录入的答案超过限制, 请重新录入');
        }
        $arr = ['A' => 1, 'B' => 2, 'C' => 3, 'D' => 4, 'E' =>5, 'F' => 6, 'G' => 7, 'H' => 8];
        return $arr[$key] ?? '';
    }



}