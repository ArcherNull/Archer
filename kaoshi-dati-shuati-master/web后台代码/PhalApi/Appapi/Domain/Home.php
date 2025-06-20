<?php

class Domain_Home {
	//首页
    public function getindex() {
        $rs = array();
        $model = new Model_Home();
        $slide = $model->getSlide(1);
		foreach($slide as $k=>$v){
			$v['image'] = get_upload_path($v['image']);
			$slide[$k]=$v;
		}
		$menu = [
			['name'=>'最新资讯','id'=>'1','image'=>get_host().'/static/menu/1.png','url'=>'','api'=>'home.getnews','status'=>'1'],
			['name'=>'党员风采','id'=>'2','image'=>get_host().'/static/menu/2.png','url'=>'','api'=>'home.getparter','status'=>'1'],
			['name'=>'党员手册','id'=>'3','image'=>get_host().'/static/menu/3.png','url'=>'','api'=>'home.getshouce','status'=>'1'],
			['name'=>'三会一课','id'=>'4','image'=>get_host().'/static/menu/4.png','url'=>'','api'=>'home.sanhuiyike','status'=>'1'],
			['name'=>'线上工会','id'=>'5','image'=>get_host().'/static/menu/5.png','url'=>'','api'=>'','status'=>'0'],
			['name'=>'青荷先锋','id'=>'6','image'=>get_host().'/static/menu/6.png','url'=>'','api'=>'','status'=>'0'],
			['name'=>'线上活动','id'=>'7','image'=>get_host().'/static/menu/7.png','url'=>'','api'=>'','status'=>'0'],
			['name'=>'问卷调查','id'=>'8','image'=>get_host().'/static/menu/8.png','url'=>'','api'=>'home.paperlist','status'=>'1'],
			['name'=>'通知公告','id'=>'9','image'=>get_host().'/static/menu/9.png','url'=>'','api'=>'home.notice','status'=>'1'],
		];
		$list = $model->getScanning(0,1); //改成要闻速览
        $configpub = getConfigPub();
        foreach($list as $k=>$v){
            $v['thumb'] = get_upload_path($v['thumb']);
            $v['url'] = $configpub['site'].'/wap/home/scanning/id/'.$v['id'];
            $v['date']=date('Y-m-d',$v['addtime']);
            $list[$k] = $v;
        }
		$rs = [
			'slide'=>$slide,
			'menu'=>$menu,
			'list'=>$list,
            'duwu_name' => '有声读物',
		];

        return $rs;
    }
	//新闻	
	public function gettui($listid,$p) {
        $rs = array();

        $model = new Model_Home();
        $list = $model->getnewstui($listid,$p);
		foreach($list as $k=>$v){
			$list[$k] = $this->newsdata($v);
		}		
		$rs = [
			'list'=>$list,
		];
		
        return $rs;
    }
	public function getproducttui($listid,$p) {
        $rs = array();

        $model = new Model_Home();
        $list = $model->getproducttui($listid,$p);
		foreach($list as $k=>$v){
			$list[$k] = $this->productdata($v);
		}		
		$rs = [
			'list'=>$list,
		];
		
        return $rs;
    }
	public function getproductmenu() {
        $rs = array();
        $model = new Model_Home();
		$menu = $model->getproductmenu();
        return $menu;
    }	

    public function getnewsmenu() {
        $rs = array();
        $model = new Model_Home();
		$menu = $model->getmenu();
		/* foreach($menu as $k =>$v){
			$newslist = $model->getnewslist($v['id'],1);
			foreach($newslist as $k=>$v){
				$newslist[$k] = $this->newsdata($v);
			}
			$v['list'] = $newslist;
			$menu[$k]=$v;
		} */
		
        return $menu;
    }	
	
	public function getnewslist($listid,$p) {
        $rs = array();

        $model = new Model_Home();
        $list = $model->getnewslist($listid,$p);
		foreach($list as $k=>$v){
			$list[$k] = $this->newsdata($v);
		}		
		$rs = [
			'list'=>$list,
		];
		
        return $rs;
    }	
	
	protected function newsdata($data){
		$config = getConfigPub();
        $data['content'] = htmlspecialchars_decode($data['content']);
		$data['thumb']=get_upload_path($data['thumb']);
		$data['url'] = $config['site'] .'/wap/home/news/id/'.$data['id'];
		$data['date']=date('Y-m-d',$data['addtime']);
		return $data;
	}
	protected function productdata($data){
		$config = getConfigPub();
		$data['thumb']=get_upload_path($data['thumb']);
		$data['url'] = $config['site'].'/wap/home/product/id/'.$data['id'];
		$data['date']=date('Y-m-d',$data['addtime']);
		return $data;
	}

	//党员
	public function getparter($branchid,$p){
        $rs = array();
			
        $model = new Model_Home();
        $list = $model->getparter($branchid,$p);
		foreach($list as $k=>$v){
			$list[$k] = $this->parterdata($v);
		}
        return $list;
	}

	public function getpartershow($id){
        $rs = array();
			
        $model = new Model_Home();
        $list = $model->getpartershow($id);

		$list= $this->parterdata($list);
					
        return $list;		
	}

	protected function parterdata($data){
		$data['thumb']=get_upload_path($data['thumb']);
		$data['post']=getpost($data['partypost']);
		$data['branch']=getbranch($data['partybranch']);
		return $data;
	}	
	
	//	手册
	public function getshouce($date,$p){
        $rs = array();
		$where=[];
		if($date !=''){
			$timestart = strtotime($date);
			$timeend =strtotime("+1 month",$timestart);		
			$where=[
				'addtime >= ?'=> $timestart,
				'addtime < ?'=> $timeend,
			];
		}

        $model = new Model_Home();
        $list = $model->getshouce($where,$p);
		$config = getConfigPub();
		foreach($list as $k=>$v){
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			$v['url'] = $config['site'].'/wap/home/shouce/id/'.$v['id'];
			$list[$k] =$v;
		}			
        return $list;		
	}		

	//	手册
	public function getActive($p){
        $rs = array();
		$where=[];

        $model = new Model_Home();
        $list = $model->getActive($p);
		$config = getConfigPub();
		foreach($list as $k=>$v){
			$v['thumb'] = get_upload_path($v['thumb']);
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			if($v['endtime']<time()){
				$v['endtime'] = '活动已结束';
			}else{
				$v['endtime'] = date('Y-m-d H:i',$v['endtime']);
			}
			
			$v['url'] = $config['site'].'/wap/home/active/id/'.$v['id'];
			$list[$k] =$v;
		}			
        return $list;		
	}		

	//三会一课
    public function sanhuiyike() {
        $rs = array();
        $model = new Model_Home();
        $slide = $model->getSlide(2);
		foreach($slide as $k=>$v){
			$v['image'] = get_upload_path($v['image']);
			$slide[$k]=$v;
		}
		$list = $model->sanhuiyike(1);
		$config = getConfigPub();
		foreach($list as $k=>$v){
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			$v['url'] = $config['site'].'/wap/home/sanhuiyike/id/'.$v['id'];
			$list[$k] =$v;
		}		
		$rs = [
			'slide'=>$slide,
			'list'=>$list,
		];
        return $rs;
    }	
    public function sanhuiyikelist($p) {
        $rs = array();
        $model = new Model_Home();

		$list = $model->sanhuiyike($p);
		$config = getConfigPub();
		foreach($list as $k=>$v){
			$v['url'] = $config['site'].'/wap/home/sanhuiyike/id/'.$v['id'];
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			$list[$k] =$v;
		}		
		$rs = [
			'list'=>$list,
		];
        return $rs;
    }


    //学习
    public function learnindex()
    {
        $rs    = array();
        $model = new Model_Home();

        $window = $model->getwindow(1, 4);
        $config = getConfigPub();
        foreach ($window as $k => $v) {
            $v['thumb']   = get_upload_path($v['thumb']);
            $v['addtime'] = date('Y-m-d', $v['addtime']);
            //app要求命名
            $v['url_a'] = $config['site'] . '/wap/home/window/id/' . $v['id'];
            $window[$k] = $v;
        }
        $lession = $model->getlession(1, 4);
        foreach ($lession as $k => $v) {
            $v['thumb']   = get_upload_path($v['thumb']);
            $v['url']     = get_upload_path($v['url']);
            $v['addtime'] = date('Y-m-d', $v['addtime']);
            $lession[$k]  = $v;
        }

        //党史历史
        $danghistory = $model->getDanghistoryList();

        foreach ($danghistory as $k => $v) {
            $v['thumb']      = get_upload_path($v['thumb']);
            $v['addtime']    = date('Y-m-d', $v['addtime']);
            $danghistory[$k] = $v;
        }

        $rs = [
            'window'      => $window,
            'lession'     => $lession,
            'lession_title' => '党建参阅',
            'danghistory' => $danghistory,
            'listtype'   => '2',
            'duwu_name'  => '有声读物',
        ];
        return $rs;
    }

	//学习
    public function windowlist($p) {
        $rs = array();
        $model = new Model_Home();

		$window = $model->getwindow($p);
		$config = getConfigPub();
		foreach($window as $k=>$v){
			$v['thumb'] = get_upload_path($v['thumb']);
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			//前端要求不能用url
			$v['url_a'] = $config['site'].'/wap/home/window/id/'.$v['id'];
			$window[$k] =$v;
		}		
		$rs = [
			'window'=>$window,

		];
        return $rs;
    }	
	//学习
    public function lessionlist($p) {
        $rs = array();
        $model = new Model_Home();

	
		$lession = $model->getlession($p);
		foreach($lession as $k=>$v){
			$v['thumb'] = get_upload_path($v['thumb']);
			$v['url'] = get_upload_path($v['url']);
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			$lession[$k] =$v;
		}			
		$rs = [
			'lession'=>$lession,
            'listtype' => '2', //控制读物播放图标显示
		];
        return $rs;
    }	
	//思想交流
    public function thinklist($p) {
        $rs = array();
        $model = new Model_Home();

	
		$lession = $model->thinklist($p);
		$config = getConfigPub();
		foreach($lession as $k=>$v){
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			$userinfo = getUserInfo($v['uid']);
			$v['url'] = $config['site'].'/wap/home/think/id/'.$v['id'];
			$branch = getbranch($userinfo['partybranch']);
			$post = getpost($userinfo['partypost']);
			$v['user_nickname'] =$userinfo['user_nickname'];
			$v['avatar'] =get_upload_path($userinfo['avatar']);
			$v['branch'] =$branch;
			$v['post'] =$post;
			$arr = [];
			if($v['thumbs'] !=''){
				$thumbs = json_decode($v['thumbs'],1);
				
				foreach($thumbs as $a => $b){
					$arr[]=get_upload_path($b);
				}
			}
			$v['thumbs'] =$arr;
			$v['zan'] = count_zan($v['id'],1);
			$lession[$k] =$v;
		}
		$rs = [
			'list'=>$lession,
		];
        return $rs;
    }	

    public function updatethink($data) {

        $model = new Model_Home();

	
		return $model->updatethink($data);


    }		
	//通知公告
    public function notice($p) {
        $rs = array();
        $model = new Model_Home();

	
		$lession = $model->notice($p);
		$config = getConfigPub();
		foreach($lession as $k=>$v){
			$v['addtime'] = date('Y-m-d',$v['addtime']);
			$v['url'] = $config['site'].'/wap/home/notice/id/'.$v['id'];
			$lession[$k] =$v;
		}
		$rs = [

			'list'=>$lession,
		];
        return $rs;
    }	
	//问卷调查
    public function paperlist($p, $is_dev='') {
        $rs = array();
        $model = new Model_Home();
		$lession = $model->paperlist($p);
		$time = time();
		foreach($lession as $k=>$v){
			$v['endtime_int'] = $v['endtime'];
			$v['count_num'] = $model->count_num_paper($v['id']);
			$v['endtime'] = date('Y-m-d H:i:s',$v['endtime']);
			$v['status'] = $time > $v['endtime_int'] ? '0' :'2';
			$v['status_msg'] = $time > $v['endtime_int'] ? '已结束' :'进行中';
			$lession[$k] =$v;
		}

		$rs = [
			'list'=> $lession,
		];
        return $rs;
    }

    public function papershow($id,$uid) {
        $rs = array();
        $model = new Model_Home();
		$paperinfo = $model->papershow($id);
		$time = time();
		if($paperinfo){
			$paperinfo['endtime_int'] = $paperinfo['endtime'];
			$paperinfo['count_num'] = $model->count_num_paper($paperinfo['id']);
			$paperinfo['endtime'] = date('Y-m-d H:i:s',$paperinfo['endtime']);
			$isjoin = $model->isjoin($id,$uid);
			if($time > $paperinfo['endtime_int']){
				$paperinfo['status']=2;
				$paperinfo['status_msg']='已结束';
			}elseif($isjoin){
				$paperinfo['status']=1;
				$paperinfo['status_msg']='已参与';
			}else{
				$paperinfo['status']=0;
				$paperinfo['status_msg']='进行中';
			}

		}else{
			return false;
		}

		$optionlist = $model->optionlist($id);

		$myanswer =  $model->myanswer($id,$uid);
		$listanswer =  $model->listanswer($id);
		$count =[];
		//先循环所有问题，定义初始为0
		foreach($optionlist  as $k1=>$v1){//题目循环
			$key= $v1['id'];
			$count[$key]=[];
			$options =json_decode($v1['option_json'],1);
			foreach($options as $k2=>$v2){//题目循环
				$count[$key][]=0;
			}			
		}		

		foreach($listanswer  as $k1=>$v1){//人员循环
			$answer = json_decode($v1['answer_json'],1);
			foreach($answer as $k2=>$v2){//题目循环
				foreach($v2 as $k3=>$v3){//选项循环
					$count[$k2][$k3]+=$v3;
				}					
			}			
		}

		if($myanswer){
			$myanswerarr = json_decode($myanswer['answer_json'],1);
		}

		foreach($optionlist as $k=>$v){
			
			$v['option'] =json_decode($v['option_json'],1);
			
			if($myanswerarr){
				$v['answer'] = $myanswerarr[$v['id']] ?? [];
			}else{
				$v['answer']=[];
			}
			$v['count'] = $count[$v['id']];
            $v['thumbs_json'] = json_decode($v['thumbs_json'], true) ?? [];
            if($v['thumbs_json']) {
                foreach ($v['thumbs_json'] as $kk => $vv) {
                    $v['thumbs_json'][$kk] = get_upload_path($vv);
                }
            }

			$optionlist[$k] =$v;
		}
		$paperinfo['list'] = $optionlist;


		$rs = [
			'list'=>$paperinfo,
		];
        return $rs;
    }



    public function updatepaper($uid,$id,$answer) {
		
		$check=$this->checkanswer($uid,$id,$answer);
		if($check){
			return $check;
		}
		
		
        $model = new Model_Home();
		
		$data=[
			'uid'=>$uid,
			'listid'=>$id,
			'answer_json'=>$answer,
		];
		

		$info = $model->updatepaper($data);
	
		if($info){
			return 0;	
		} 
		return 1;
    }

	private function checkanswer($uid,$id,$answer) {
		$model = new Model_Home();
		$paperinfo = $model->papershow($id);
		$time = time();
		if( $time > $paperinfo['endtime']){//投票已结束
			return 1001;
		}
		$isjoin = $model->isjoin($id,$uid);
		if($isjoin){//已投票
			return 1002;
		}
		//判断投票格式
		if( is_null(json_decode($answer,true))){//格式错误
			return 1003;
		}
		$optionlist = $model->optionlist($id);
		$answerarr=json_decode($answer,true);
		if(!is_array($answerarr) || count($answerarr) != count($optionlist) ){//格式错误
			return 1003;
		}
		foreach($optionlist as $k => $v){
			$count_option = count($answerarr[$v['id']]);
			if($count_option != $v['count_option'] ){
				return 1003;
			}
			$count=array_count_values($answerarr[$v['id']]);
			if($count[1] > $v['count_max'] || $count[1] < $v['count_min']){
				return 1003;
			}
		}
		return 0;
	}

	//要闻速览
	public function getScanning($p) {

		$model = new Model_Home();
		$list = $model->getScanning($p);

		$configpub = getConfigPub();
		foreach($list as $k=>$v){
			$v['thumb'] = get_upload_path($v['thumb']);
			$v['url'] = $configpub['site'].'/wap/home/scanning/id/'.$v['id'];
			$v['date']=date('Y-m-d',$v['addtime']);
			$list[$k] = $v;
		}
		return $list;
	}

	public function getReadingList($id) {
        $rs = array();
        $model = new Model_Home();
		$info = $model->getReadingList($id);

		$info['info']['thumb'] = get_upload_path($info['info']['thumb']);
        $info['info']['url'] = ''; //视频先隐藏
        if (!empty($info['list'])) {
            foreach($info['list'] as $k=>$v){
                $v['url'] = get_upload_path($v['url']);
                $v['addtime'] = date('Y-m-d',$v['addtime']);
                $info['list'][$k] = $v;
            }
        }

        return $info;
    }


    //增加用户每天第一次阅读的积分
    public function addReadScore($uid, $news_id){
        return handleUserScoreDay($uid, 2, $news_id);
    }


    //根据党史id获取文章列表
    public function getKnowledgeById($id)
    {
        $model = new Model_Home();
        $info  = $model->getKnowledgeById($id);
        $config = getConfigPub();

        foreach ($info as $k => $v) {
            $v['addtime'] = date('Y-m-d', $v['addtime']);
            //app要求命名
            $v['url_a'] = $config['site'] . '/wap/home/knowledge/id/' . $v['id'];
            $info[$k] = $v;
        }
        return $info;
    }


    //党建知识更多
    public function danghistoryList()
    {
        $model = new Model_Home();
        $info  = $model->danghistoryList();
        foreach ($info as $k => $v) {
            $v['thumb'] = get_upload_path($v['thumb']);
            $v['addtime'] = date('Y-m-d', $v['addtime']);
            $info[$k] = $v;
        }

        return $info;
    }


    //获取排行榜
    public function getRankingScore($uid)
    {

        $model = new Model_Home();
        $userData = $model->getUserInfo(['id' => $uid]);

        $scoreData = $model->getRankingScore();
        $departArr = [];
        foreach ($scoreData as $k => $v) {
            $scoreData[$k]['avatar'] = get_upload_path($v['avatar']);
            if ($v['partybranch'] == $userData['partybranch']) {
                $departArr[] = $scoreData[$k];
            }

        }

        //各单位排行
        $partys = $model->getPartyIds(); //所有单位的id和名字

        $users = $model->getUsersAll(); //所有用户
        foreach ($partys as $k => $v) {
            $all_integral= 0;
            foreach ($users as $kk => $vv) {
                if((int)$v['id'] !== (int)$vv['partybranch']) {
                    continue;
                }
                $all_integral += $vv['score']; //用户表内score代表积分注意别混淆
            }
            $partys[$k]['score'] = $all_integral;
            $partys[$k]['user_nickname'] = $v['name']; //和前台字段名统一
            $partys[$k]['avatar'] = '';
        }

        //降序排列
        $last_names = array_column($partys,'score');
        array_multisort($last_names,SORT_DESC,$partys);

        $info['all'] = $scoreData;
        $info['depart'] = $departArr;
        $info['partys'] = $partys;

        return $info;
    }



}
