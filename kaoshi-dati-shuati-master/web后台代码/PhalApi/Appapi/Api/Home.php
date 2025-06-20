<?php
/**
 * 首页
 */
class Api_Home extends PhalApi_Api {  

	public function getRules() {
		return array(
			'getindex' => array(

			),
			
			'gettui' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数(注意：因为推荐第一页是首页接口返回，所以这里请求从第二页开始，如果需要单独刷新推荐这里等于1)'),
			),
			'getnewslist' => array(
				'listid' => array('name' => 'listid', 'type' => 'int', 'require' => true, 'default'=>'1' ,'desc' => '新闻分类id'),
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数(注意：因为推荐第一页是首页接口返回，所以这里请求从第二页开始，如果需要单独刷新推荐这里等于1)'),
			),	
			'getparter' => array(
				'branchid' => array('name' => 'branchid', 'type' => 'int', 'require' => true, 'default'=>'0' ,'desc' => '所属社区id，为0是全部党员'),
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
			),	
			'getpartershow' => array(
				'id' => array('name' => 'id', 'type' => 'int', 'default'=>'0' , 'require' => true,'desc' => '党员id'),
			),				
			'getshouce' => array(
				'date' => array('name' => 'date', 'type' => 'string', 'default'=>'' ,'desc' => '年月，如：2021-01，传空为所有日期'),
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
			),	
			'getsanhuiyike' => array(

			),	
			'sanhuiyikelist' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数(注意：因为第一页是getsanhuiyike接口返回，所以这里请求从第二页开始，如果需要单独刷新推荐这里等于1)'),
			),	
			'learnindex' => array(
			),	
			'windowlist' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
			),	
			'lessionlist' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
			),		
			'thinklist' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
			),		
			'updatethink' => array(
				'uid' => array('name' => 'uid', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '用户ID'),
				'token' => array('name' => 'token', 'type' => 'string', 'require' => true, 'desc' => '用户token'),
				'title' => array('name' => 'title', 'type' => 'string', 'require' => true, 'desc' => '文章标题'),
				'content' => array('name' => 'content', 'type' => 'string', 'require' => true, 'desc' => '文章内容'),
				'thumbs' => array('name' => 'thumbs', 'type' => 'string', 'require' => true, 'desc' => '图片地址json字符串'),
			),	
			'notice' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
			),	
			'paperlist' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
                'is_dev' => array('name' => 'is_dev', 'type' => 'int', 'default'=>'0' ,'desc' => '测试用参数'),
			),	
			'papershow' => array(
				'uid' => array('name' => 'uid', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '用户ID'),
				'token' => array('name' => 'token', 'type' => 'string', 'require' => true, 'desc' => '用户token'),
				'id' => array('name' => 'id', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '问卷id'),
			),	
			'updatepaper' => array(
				'uid' => array('name' => 'uid', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '用户ID'),
				'token' => array('name' => 'token', 'type' => 'string', 'require' => true, 'desc' => '用户token'),
				'id' => array('name' => 'id', 'type' => 'int', 'min' => 1, 'require' => true, 'desc' => '问卷id'),
				'answer' => array('name' => 'answer', 'type' => 'string', 'require' => true,'default'=>'', 'desc' => '答案json字符串，格式单独讲解'),
            ),	
            
            'getActive' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数(注意：因为第一页是getsanhuiyike接口返回，所以这里请求从第二页开始，如果需要单独刷新推荐这里等于1)'),
			),	

            'getScanning' => array(
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => '页数'),
			),

            'getproductlist' => array(
				'listid' => array('name' => 'listid', 'type' => 'int', 'require' => true, 'default'=>'1' ,'desc' => '产品分类id'),
				'p' => array('name' => 'p', 'type' => 'int', 'default'=>'1' ,'desc' => ''),
			),	

            'getReadingList' => array(
				'id' => array('name' => 'id', 'type' => 'int', 'require' => true, 'default'=>'1' ,'desc' => '有声读物id')
			),

            'addReadScore' => array(
                'news_id' => array('name' => 'news_id', 'type' => 'int', 'require' => true, 'default'=>'1' ,'desc' => '文章id')
            ),
            'getKnowledgeById' => array(
                'hid' => array('name' => 'hid', 'type' => 'int', 'require' => true, 'default' => '1', 'desc' => '党史id')
            ),
		);
	}
	
    /**
     * 配置信息
     * @desc 用于获取配置信息
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0] 配置信息
     * @return array info[0].partylist 当群关系列表
     * @return string msg 提示信息
     */
    public function getConfig() {
		$rs = array('code' => 0, 'msg' => '', 'info' => array());
		
		$partylist = getpartylist();
        $rs['info'][0]['partylist']=$partylist;
        $configpub = getConfigPub();
        $rs['info'][0]['small_switch']=$configpub['small_switch'];

        return $rs;
    }	

    /**
     * 首页信息
     * @desc 首页信息
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['slide'] 轮播
     * @return array info[0]['menu'] 轮播
     * @return array info[0]['list'] 新闻列表（10条，如需翻页请求getlist接口）
     * @return string msg 提示信息
     */
    public function getindex() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $domain = new Domain_Home();
		$info = $domain->getindex();
		$rs['info'][0] = $info;

        return $rs;
    }
	
    /**
     * 推荐新闻（首页分页）
     * @desc 推荐新闻（首页分页）
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 新闻列表
     * @return string msg 提示信息
     */
    public function gettui() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		$p = checkNull($this->p);
        $domain = new Domain_Home();
		$info = $domain->gettui(0,$p);
		
		$rs['info'][0] = $info;

        return $rs;
    }	

    /**
     * 新闻页
     * @desc 新闻页
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info 新闻分类
     * @return array info[].name 新闻分类名
     * @return string info[0].menu[].list 当前分类下新闻列表
     * @return string msg 提示信息
     */
    public function getnewsmenu() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $domain = new Domain_Home();
		$info = $domain->getnewsmenu();

		$rs['info'] = $info;
        
        return $rs;
    }	
	
    /**
     * 新闻分页
     * @desc 新闻分页
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 新闻列表（10条）
     * @return string msg 提示信息
     */
    public function getnewslist() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $listid = checkNull($this->listid);
        $p = checkNull($this->p);
        $domain = new Domain_Home();
        $listids = 0;
        if($listid){
            $listids = $listid;
        }
		$info = $domain->gettui($listids,$p);
		
		$rs['info'][0] = $info;

        return $rs;
    }	
	

    /**
     * 党员风采
     * @desc 党员风采
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 新闻列表（10条）
     * @return string msg 提示信息
     */
    public function getparter() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $branchid = checkNull($this->branchid);
        $p = checkNull($this->p);
        $domain = new Domain_Home();
		$info = $domain->getparter($branchid,$p);
		
		$rs['info'][0] = $info;
		$rs['info'][1] = '所有党支部'; //所有党支部

        return $rs;
    }

    /**
     * 党员风采详情
     * @desc 党员风采详情
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['data'] 详细内容
     * @return string msg 提示信息
     */
    public function getpartershow() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $id = checkNull($this->id);
        $domain = new Domain_Home();
		$info = $domain->getpartershow($id);
		
		$rs['info'][0]['data'] = $info;

        return $rs;
    }	
	
    /**
     * 党员手册
     * @desc 党员手册
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 新闻列表（10条）
     * @return string msg 提示信息
     */
	public function getshouce(){
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $date = checkNull($this->date);
        $p = checkNull($this->p);

        $domain = new Domain_Home();
		$info = $domain->getshouce($date,$p);
		
		$rs['info'][0] = $info;

        return $rs;		
    }
    
    /**
     * 活动列表
     * @desc 活动列表
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 活动列表
     * @return string msg 提示信息
     */
	public function getActive(){
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $p = checkNull($this->p);

        $domain = new Domain_Home();
		$info = $domain->getActive($p);
		
		$rs['info'][0] = $info;

        return $rs;		
    }

	
    /**
     * 三会一课首页
     * @desc 三会一课
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['slide'] 轮播
     * @return array info[0]['list'] 新闻列表（10条，如需翻页请求sanhuiyikelist接口）
     * @return string msg 提示信息
     */
    public function sanhuiyike() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $domain = new Domain_Home();
		$info = $domain->sanhuiyike();
		
		$rs['info'][0] = $info;

        return $rs;
    }	
	
    /**
     * 三会一课分页
     * @desc 三会一课
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 新闻列表
     * @return string msg 提示信息
     */
    public function sanhuiyikelist() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $p = checkNull($this->p);
        $domain = new Domain_Home();
		$info = $domain->sanhuiyikelist($p);
		
		$rs['info'][0] = $info;

        return $rs;
    }		

    /**
     * 学习首页
     * @desc 学习首页
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['window'] 党建之窗
     * @return array info[0]['lession'] 党课
     * @return string msg 提示信息
     */
    public function learnindex() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $domain = new Domain_Home();
		$info = $domain->learnindex();
		
		$rs['info'][0] = $info;

        return $rs;
    }

    /**
     *
     * @desc 党建知识更多
     * @return int code 操作码，0表示成功
     * @return array info
     * @return string msg 提示信息
     */
    public function danghistoryList() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());

        $domain = new Domain_Home();
        $info   = $domain->danghistoryList();

        $rs['info'][0] = $info;

        return $rs;
    }


    /**
     * 党建之窗
     * @desc 党建之窗
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['window'] 党建之窗
     * @return string msg 提示信息
     */
    public function windowlist() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $p = checkNull($this->p);

        $domain = new Domain_Home();
		$info = $domain->windowlist($p);
		
		$rs['info'][0] = $info;

        return $rs;
    }	
    /**
     * 党课
     * @desc 党课
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['lession'] 党课
     * @return string msg 提示信息
     */
    public function lessionlist() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $p = checkNull($this->p);
        $domain = new Domain_Home();
		$info = $domain->lessionlist($p);
		
		$rs['info'][0] = $info;

        return $rs;
    }
	/**
     * 思想交流
     * @desc 思想交流
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 思想交流列表
     * @return string msg 提示信息
     */
    public function thinklist() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());

		$p = checkNull($this->p);

        $domain = new Domain_Home();
		$info = $domain->thinklist($p);
		
		$rs['info'][0] = $info;

        return $rs;
    }
	/**
	 * 上传思想交流
	 * @desc 上传思想交流
	 * @return int code 操作码，0表示成功
	 * @return array info 
	 * @return string msg 提示信息
	 */
	public function updatethink() {
		$rs = array('code' => 0 , 'msg' => '发布成功，等待审核', 'info' => array());

        $uid = checkNull($this->uid);
        $token = checkNull($this->token);
        $content = checkNull($this->content);
        $title = checkNull($this->title);
        $thumbs = $this->thumbs;//json字符串 不做checknull

 		$checkToken=checkToken($uid,$token);
		if($checkToken==700){
			$rs['code'] = $checkToken;
			$rs['msg'] = '您的登陆状态失效，请重新登陆！';
			return $rs;
		} 
	

		if($thumbs==''){//图片传空，默认空数组处理
			$thumbs = json_encode([]);
		}else{//如果不为空，判断json格式是否正确
			$thumbarr=json_decode($thumbs,true);
			if(!is_array($thumbarr)){
				$rs['code'] = 1001;
				$rs['msg'] = '图片格式有误！';
				return $rs;							
			}
			if(count($thumbarr) > 9){
				$rs['code'] = 1001;
				$rs['msg'] = '图片不能超过9张！';
				return $rs;				
			}
			foreach($thumbarr as $v){
				if(!is_string($v) || $v==''){//只做了判空和判断字符串处理
					$rs['code'] = 1001;
					$rs['msg'] = '图片格式有误！';
					return $rs;					
				}
			}
		}
		
		if($title==''){
			$rs['code'] = 1001;
			$rs['msg'] = '提交的标题不能为空！';
			return $rs;			
		}	
		if($content==''){
			$rs['code'] = 1001;
			$rs['msg'] = '提交的内容不能为空！';
			return $rs;			
		}		
		$data=[
			'uid'=>$uid,
			'content'=>$content,
			'title'=>$title,
			'thumbs'=>$thumbs,
			'addtime'=>time()
		];
		$domain = new Domain_Home();
		$info= $domain->updatethink($data);
		if(!$info){
			$rs['code'] = 1001;
			$rs['msg'] = '上传失败，请稍后重试！';
			return $rs;
		} 		
		return $rs;

	}	
	/**
     * 通知公告
     * @desc 通知公告
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 思通知公告列表
     * @return string msg 提示信息
     */
    public function notice() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $p = checkNull($this->p);

        $domain = new Domain_Home();
		$info = $domain->notice($p);
		
		$rs['info'][0] = $info;

        return $rs;
    }	
	/**
     * 问卷调查
     * @desc 问卷调查
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info[0]['list'] 问卷调查列表
     * @return string msg 提示信息
     */
    public function paperlist() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());

		$p = checkNull($this->p);
		$is_dev = checkNull($this->is_dev);

        $domain = new Domain_Home();
		$info = $domain->paperlist($p, $is_dev);
		
		$rs['info'][0] = $info;

        return $rs;
    }
	/**
	 * 问卷调查详情页
	 * @desc 问卷调查详情页
	 * @return int code 操作码，0表示成功
	 * @return array info 
     * @return int info[0].status  0可以答题 1已经作答 2已经结束
     * @return string info[0].title  问卷标题
     * @return int info[0].count_num  问卷已参与人数
     * @return string info[0].endtime  截止时间
     * @return array info[0].list 问题列表	 
     * @return string info[0].list[].title 题干
     * @return int info[0].list[].count_option 选项个数
     * @return int info[0].list[].count_max 最多选几个
     * @return int info[0].list[].count_min 最少选几个
     * @return array info[0].list[].option 选项列表
     * @return string info[0].list[].option[] 选项     
	 * @return array info[0].list[].answer 答案列表（当未答题时为空数组）
     * @return int info[0].list[].answer[] 答案（0为未选中，1为选中）
     * @return array info[0].list[].count 累计数量数组
     * @return int info[0].list[].count[] 当前选项的累计数量
	 * @return string msg 提示信息
	 */
	public function papershow() {
		$rs = array('code' => 0 , 'msg' => '获取成功', 'info' => array());

        $uid = checkNull($this->uid);
        $token = checkNull($this->token);
        $id = checkNull($this->id);

 		$checkToken=checkToken($uid,$token);
		if($checkToken==700){
			$rs['code'] = $checkToken;
			$rs['msg'] = '您的登陆状态失效，请重新登陆！';
			return $rs;
		} 

		$domain = new Domain_Home();
		$info= $domain->papershow($id,$uid);

		if(!$info){
			$rs['code'] = 1001;
			$rs['msg'] = '问卷已关闭！';
			return $rs;
		}
		$rs['info'][0] = $info;
		return $rs;

	}
	/**
	 * 上传问卷
	 * @desc 上传问卷
	 * @return int code 操作码，0表示成功
	 * @return array info 
	 * @return string msg 提示信息
	 */
	public function updatepaper() {
		$rs = array('code' => 0 , 'msg' => '提交成功', 'info' => array());

        $uid = checkNull($this->uid);
        $token = checkNull($this->token);
        $id = checkNull($this->id);
        $answer = $this->answer; //json字符串 不做checknull

 		$checkToken=checkToken($uid,$token);
		if($checkToken==700){
			$rs['code'] = $checkToken;
			$rs['msg'] = '您的登陆状态失效，请重新登陆！';
			return $rs;
		} 
		//问卷格式判断
		if($answer==''){//

			$rs['code'] = 1001;
			$rs['msg'] = '答案格式有误！';
			return $rs;							

		}
		$answerarr=json_decode($answer,true);
		if(!is_array($answerarr) || count($answerarr)==0){
			$rs['code'] = 1001;
			$rs['msg'] = '答案格式有误！';
			return $rs;							
		}		
		$checkarr = getanswerarr($id);

		if(count($answerarr)!=count($checkarr)){
			$rs['code'] = 1001;
			$rs['msg'] = '答案格式有误！';
			return $rs;							
		}

		foreach($answerarr as $k=>$v){
			if(!isset($checkarr[$k])){
				
				$rs['code'] = 1001;
				$rs['msg'] = '答案格式有误！';
				return $rs;					
			}
			if(!is_array($v) || !isset($checkarr[$k]['count_option']) || !isset($checkarr[$k]['count_max']) || !isset($checkarr[$k]['count_min']) ||  count($v)!=$checkarr[$k]['count_option']){

				$rs['code'] = 1001;
				$rs['msg'] = '答案格式有误！5';
				return $rs;					
			}
			$countvalues = array_count_values($v);

			if($countvalues['1']>$checkarr[$k]['count_max'] || $countvalues['1']<$checkarr[$k]['count_min'] ){
				$rs['code'] = 1001;
				$rs['msg'] = '答案格式有误！6';
				return $rs;						
			}
		}
		$domain = new Domain_Home();
		$info= $domain->updatepaper($uid,$id,$answer);
		if($info==1001){
			$rs['code'] = $info;
			$rs['msg'] = '该问卷已结束！';
			return $rs;
		}
 		
		if($info==1002){
			$rs['code'] = $info;
			$rs['msg'] = '您已提交过该问卷！';
			return $rs;
		}
		
		if($info==1003){
			$rs['code'] = $info;
			$rs['msg'] = '提交失败，请稍后重试！';
			return $rs;
		} 		
		return $rs;

	}	

    /**
     * @desc 要闻速览
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return string msg 提示信息
     */
    public function getScanning() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $p = checkNull($this->p);
        $domain = new Domain_Home();
		$info = $domain->getScanning($p);
		
		$rs['info'] = $info;

        return $rs;
    }


    /**
     * 产品分类
     * @desc 产品分类
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return array info 产品分类分类
     * @return array info[].name 产品分类名
     * @return string info[0].menu[].list 当前分类下新闻列表
     * @return string msg 提示信息
     */
    public function getproductmenu() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $domain = new Domain_Home();
		$info = $domain->getproductmenu();

		$rs['info'] = $info;
        
        return $rs;
    }	
	
    /**
     * 产品分页
     * @desc 产品分页
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return string msg 提示信息
     */
    public function getproductlist() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $listid = checkNull($this->listid);
        $p = checkNull($this->p);
        $domain = new Domain_Home();
        $listids = 0;
        if($listid){
            $listids = $listid;
        }
		$info = $domain->getproducttui($listids,$p);
		
		$rs['info'][0] = $info;

        return $rs;
    }
    
    /**
     * 有声读物列表
     * @desc 产品分页
     * @return int code 操作码，0表示成功
     * @return array info 
     * @return string msg 提示信息
     */
    public function getReadingList() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
		
        $id = checkNull($this->id);
        $domain = new Domain_Home();
		$info = $domain->getReadingList($id);
		
		$rs['info'][0] = $info;

        return $rs;
    }


    /**
     * 增加每天第一次阅读的积分
     * @desc 每天第一次阅读的积分
     * @return int code 操作码，0表示成功
     * @return array info
     * @return string msg 提示信息
     */
    public function addReadScore() {

        $rs = array('code' => 0, 'msg' => '增加成功', 'info' => array());

        $uid = checkNull($this->uid);
        $token = checkNull($this->token);

        $news_id = checkNull($this->news_id);

        $checkToken=checkToken($uid,$token);
        if($checkToken==700){
            $rs['code'] = $checkToken;
            $rs['msg'] = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Home();
        $res = $domain->addReadScore($uid, $news_id);
        if (!$res) {
            $rs['code'] = 1006;
            $rs['msg'] = '增加阅读积分失败';
            return $rs;
        }
        $config = getConfigPub();
        $add_score = $config['user_day_score'] ?? 0;

        $rs['info'] = ['score' => $add_score];
        return $rs;

    }



    /**
     * 根据党史id获取文章列表
     * @desc 产品分页
     * @return int code 操作码，0表示成功
     * @return array info
     * @return string msg 提示信息
     */
    public function getKnowledgeById(){
        $rs = array('code' => 0, 'msg' => '获取成功', 'info' => array());

        $id     = checkNull($this->hid);
        $domain = new Domain_Home();
        $info   = $domain->getKnowledgeById($id);

        $rs['info'][0] = $info;

        return $rs;
    }


    /**
     * 根据党史id获取文章列表
     * @desc 产品分页
     * @return int code 操作码，0表示成功
     * @return array info
     * @return string msg 提示信息
     */
    public function getRankingScore()
    {
        $rs = array('code' => 0, 'msg' => '获取成功', 'info' => array());

        $uid   = checkNull($this->uid);
        $token = checkNull($this->token);

        $checkToken = checkToken($uid, $token);
        if ($checkToken == 700) {
            $rs['code'] = $checkToken;
            $rs['msg']  = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        $domain = new Domain_Home();
        $info   = $domain->getRankingScore($uid);

        $rs['info'][0] = $info;

        return $rs;

    }


	
} 
