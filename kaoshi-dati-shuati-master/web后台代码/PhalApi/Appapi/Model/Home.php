<?php
session_start();
class Model_Home extends PhalApi_Model_NotORM {

    /* 轮播 */
    public function getSlide($id){

        $rs=DI()->notorm->slide_item
            ->select("image,url")
            ->where("status='1' and slide_id=? ",$id)
            ->order("list_order asc")
            ->fetchAll();
        foreach($rs as $k=>$v){
            $rs[$k]['image']=get_upload_path($v['image']);
        }

        return $rs;
    }
    /* 推荐 */
    public function getnewstui($listid,$p){

        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        if($listid){
            $rs=DI()->notorm->news_page
                //->where("is_tui='1'")
                ->where('listid =?',$listid)
                ->order("list_order asc,id desc")
                ->limit($pstart,$pnum)
                ->fetchAll();
        }else{
            $rs=DI()->notorm->news_page
                //->where("is_tui='1'")
                ->order("list_order asc,id desc")
                ->limit($pstart,$pnum)
                ->fetchAll();
        }
        return $rs;
    }

    public function getproducttui($listid,$p){

        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        if($listid){
            $rs=DI()->notorm->product_page
                //->where("is_tui='1'")
                ->where('listid =?',$listid)
                ->order("list_order asc,id desc")
                ->limit($pstart,$pnum)
                ->fetchAll();
        }else{
            $rs=DI()->notorm->product_page
                //->where("is_tui='1'")
                ->order("list_order asc,id desc")
                ->limit($pstart,$pnum)
                ->fetchAll();
        }
        return $rs;
    }

    public function getproductmenu(){

        $rs=DI()->notorm->product_list
            ->select('id,name')
            ->order("list_order asc,id desc")
            ->fetchAll();
        return $rs;
    }

    /* 推荐 */
    public function getmenu(){

        $rs=DI()->notorm->news_list
            ->select('id,name')
            ->order("list_order asc,id desc")
            ->fetchAll();
        return $rs;
    }
    /* 推荐 */
    public function getnewslist($listid,$p){

        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        $rs=DI()->notorm->news_page
            ->where("listid=?",$listid)
            ->order("list_order asc,id asc")
            ->limit($pstart,$pnum)
            ->fetchAll();

        return $rs;
    }

    /* 推荐 */
    public function getparter($branchid,$p){

        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        if($branchid==0){
            $rs=DI()->notorm->parter
                ->order("list_order asc,id asc")
                ->limit($pstart,$pnum)
                ->fetchAll();
        }else{
            $rs=DI()->notorm->parter
                ->where("partybranch=?",$branchid)
                ->order("list_order asc,id asc")
                ->limit($pstart,$pnum)
                ->fetchAll();
        }

        return $rs;
    }
    /* 推荐 */
    public function getpartershow($id){

        $rs=DI()->notorm->parter
            ->where('id = ?',$id)
            ->fetchOne();

        return $rs;
    }

    /* 手册 */
    public function getshouce($where,$p){

        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;

        $rs=DI()->notorm->shouce
            ->where($where)
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();

        return $rs;
    }
    /* 活动 */
    public function getActive($p){

        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;

        $rs=DI()->notorm->active
            //->where('endtime>?',time())
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();


        return $rs;
    }

    /* 三会一课 */
    public function sanhuiyike($p){
        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        $rs=DI()->notorm->sanhuiyike
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();

        return $rs;
    }
    /* 学习 */
    public function getwindow($p,$pnum=10){
        $p = (is_numeric( $p ) && $p >1)? $p:1;
        //$pnum=10;
        $pstart = ($p-1)*$pnum;
        $rs=DI()->notorm->window
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();

        return $rs;
    }
    /* 学习 */
    public function getlession($p,$pnum=10){
        $p = (is_numeric( $p ) && $p >1)? $p:1;
        //$pnum=10;
        $pstart = ($p-1)*$pnum;

        //隐藏党章相关数据
        $rs=DI()->notorm->lession
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();

        return $rs;
    }
    /* 思想交流 */
    public function thinklist($p){
        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        $rs=DI()->notorm->think
            ->order("list_order asc,id desc")
            ->where('status =?',1)
            ->limit($pstart,$pnum)
            ->fetchAll();

        return $rs;
    }
    /* 思想交流 */
    public function updatethink($data){

        return DI()->notorm->think->insert($data);


    }
    /* 通知公告 */
    public function notice($p){
        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        $rs=DI()->notorm->notice
            ->where('id>?',1)
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();

        return $rs;
    }
    /* 问卷调查 */
    public function paperlist($p){
        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=10;
        $pstart = ($p-1)*$pnum;
        $rs=DI()->notorm->ask_list
            ->where('status = 1')
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();
        return $rs;
    }
    public function papershow($id){

        $rs=DI()->notorm->ask_list
            ->where('status = 1 and id=?',$id)
            ->fetchOne();
        return $rs;
    }
    public function count_num_paper($id){
        return DI()->notorm->user_ask->where('listid = ?',$id)->count();
    }
    public function isjoin($id,$uid){
        $check = DI()->notorm->user_ask->where('listid = ? and uid=?',$id,$uid)->fetchOne();
        if($check){
            return true;
        }else{
            return false;
        }
    }
    public function optionlist($listid){
        return DI()->notorm->ask->where('listid = ?',$listid)->fetchAll();
    }
    public function myanswer($id,$uid){
        return DI()->notorm->user_ask->where('listid = ? and uid=?',$id,$uid)->fetchOne();
    }
    public function listanswer($id){
        return DI()->notorm->user_ask->where('listid = ? ',$id)->fetchAll();
    }
    public function updatepaper($data){

        //添加答题的人数记录
        $arr = json_decode($data['answer_json'],true);
        foreach($arr as $k=>$v){
            $list = DI()->notorm->user_ask_list->where('askid = ?',$k)->fetchOne();
            if($list){
                $arr1 = json_decode($list['nums'],true);
                foreach($v as $k1=>$v1){
                    if($v1==1){
                        $arr1[$k1] = $arr1[$k1]+1;
                    }
                }
                DI()->notorm->user_ask_list->where('id = ?',$list['id'])->update(array('nums'=>json_encode($arr1)));
            }else{
                $arr1 = array();
                foreach($v as $k1=>$v1){
                    if($v1==1){
                        $arr1[$k1] = 1;
                    }else{
                        $arr1[$k1] = 0;
                    }
                }
                $insert = array(
                    'askid'=>$k,
                    'nums'=>json_encode($arr1)
                );
                DI()->notorm->user_ask_list->insert($insert);
            }
        }

        return DI()->notorm->user_ask->insert($data);
    }

    /* 要闻速览 */
    public function getScanning($p){

        $p = (is_numeric( $p ) && $p >1)? $p:1;
        $pnum=6;
        $pstart = ($p-1)*$pnum;
        $rs=DI()->notorm->scanning
            ->order("list_order asc,id desc")
            ->limit($pstart,$pnum)
            ->fetchAll();
        return $rs;
    }


    public function getReadingList($id){

        $array=array();

        $rs=DI()->notorm->lession
            ->where('id =?',$id)
            ->fetchOne();
        $array['info'] = $rs;

        $list=DI()->notorm->reading
            ->where('readid =?',$id)
            ->fetchAll();
        $array['list'] = $list;

        return $array;
    }


    //获取党史列表
    public function getDanghistoryList()
    {
        $list=DI()->notorm->danghistory
            ->limit(0,4)
            ->fetchAll();

        return $list;
    }


    public function getKnowledgeById($id)
    {
        $list=DI()->notorm->knowledge
            ->where('hid =?', $id)
            ->fetchAll();

        return $list;
    }


    public function danghistoryList()
    {
        $list=DI()->notorm->danghistory
            ->fetchAll();

        return $list;
    }


    //    获取做题人数据
    public function getTestsUser() {
        return DI()->notorm->tests_user->where('answer!=?', '')->fetchAll();
    }


    //获取试题
    public function getQuestion() {
        return DI()->notorm->question->count();
    }

    //获取用户数据
    public function getUserInfo($where) {
        return DI()->notorm->users->where($where)->fetchOne();
    }

    //获取排行榜
    public function getRankingScore($where=[]) {
        return DI()->notorm->users
            ->select('id,avatar,user_nickname,score,partybranch')
            ->where($where)
            ->where('user_type',2)
            ->order('score DESC')
            ->fetchAll();
    }


    //获取单位id数组
    public function getPartyIds($where = []){
        return DI()->notorm->partybranch
            ->where($where)
            ->select('id,name')
            ->fetchAll();
    }


    //获取所有用户信息
    public function getUsersAll($where = []) {
        return DI()->notorm->users
            ->select("*")
            ->where($where)
            ->fetchAll();
    }



}
