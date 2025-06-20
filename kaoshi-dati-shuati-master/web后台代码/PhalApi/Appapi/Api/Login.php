<?php
/**
 * 登录、注册
 */


session_start();
class Api_Login extends PhalApi_Api {
    public function getRules() {
        return array(
            'userLogin' => array(
                'user_login' => array('name' => 'user_login', 'type' => 'string', 'min' => 1, 'require' => true,  'min' => '6',  'max'=>'30', 'desc' => '账号'),
                'user_pass' => array('name' => 'user_pass', 'type' => 'string', 'min' => 1, 'require' => true,  'min' => '1',  'max'=>'30', 'desc' => '验证码'),
                'pushid' => array('name' => 'pushid', 'type' => 'string', 'desc' => '极光ID'),
                'mac' => array('name' => 'mac', 'type' => 'string', 'require' => true,   'desc' => '机器号'),
                //'code' => array('name' => 'code', 'type' => 'string', 'min' => 1, 'require' => true,   'desc' => '验证码'),
            ),
            'userReg' => array(
                'user_login' => array('name' => 'user_login', 'type' => 'string', 'min' => 1, 'require' => true,  'min' => '6',  'max'=>'30', 'desc' => '账号'),
                'user_pass' => array('name' => 'user_pass', 'type' => 'string', 'min' => 1, 'require' => true,  'min' => '1',  'max'=>'30', 'desc' => '密码'),
                'user_pass2' => array('name' => 'user_pass2', 'type' => 'string', 'min' => 1, 'require' => true,  'min' => '1',  'max'=>'30', 'desc' => '确认密码'),
                'user_nickname' => array('name' => 'user_nickname', 'type' => 'string', 'require' => true,   'desc' => '姓名'),
                'partybranch' => array('name' => 'partybranch', 'type' => 'int', 'min'=>1, 'require' => true,   'desc' => '党支部id'),
                'partypost' => array('name' => 'partypost', 'type' => 'int', 'min'=>1, 'require' => true,   'desc' => '党内职务id'),
                //'source' => array('name' => 'source', 'type' => 'string',  'default'=>'pc', 'desc' => '来源设备'),
            ),
            'userFindPass' => array(
                'user_pass' => array('name' => 'user_pass', 'type' => 'string', 'min' => 1, 'require' => true,  'min' => '1',  'max'=>'30', 'desc' => '密码'),
                'user_pass2' => array('name' => 'user_pass2', 'type' => 'string', 'min' => 1, 'require' => true,  'min' => '1',  'max'=>'30', 'desc' => '确认密码'),
                'mac' => array('name' => 'mac', 'type' => 'string', 'require' => true,   'desc' => '机器号'),
            ),

            'getCode' => array(
                'mobile' => array('name' => 'mobile', 'type' => 'string', 'min' => 1, 'require' => true,  'desc' => '手机号'),
                'sign' => array('name' => 'sign', 'type' => 'string',  'default'=>'', 'desc' => '签名'),
            ),

            'getForgetCode' => array(
                'mobile' => array('name' => 'mobile', 'type' => 'string', 'min' => 1, 'require' => true,  'desc' => '手机号'),
                'sign' => array('name' => 'sign', 'type' => 'string',  'default'=>'', 'desc' => '签名'),
            ),
            'getUnionid' => array(
                'code' => array('name' => 'code', 'type' => 'string','desc' => '微信code'),
            ),

        );
    }

    /**
     * 会员登陆 需要密码
     * @desc 用于用户登陆信息
     * @return int code 操作码，0表示成功
     * @return array info 用户信息
     * @return string info[0].id 用户ID
     * @return string info[0].user_nicename 昵称
     * @return string info[0].avatar 头像
     * @return string info[0].avatar_thumb 头像缩略图
     * @return string info[0].sex 性别
     * @return string info[0].signature 签名
     * @return string info[0].coin 用户余额
     * @return string info[0].login_type 注册类型
     * @return string info[0].level 等级
     * @return string info[0].province 省份
     * @return string info[0].city 城市
     * @return string info[0].birthday 生日
     * @return string info[0].token 用户Token
     * @return string msg 提示信息
     */
    public function userLogin() {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());
        $user_login=checkNull($this->user_login);
        $user_pass=checkNull($this->user_pass);
        $mac=checkNull($this->mac);
        // $pushid=checkNull($this->pushid);
        // $sign = checkNull($this->sign);
        $checkcode = checkcoderight($mac,$user_login,$user_pass);

//        if($checkcode==0){
//            $rs['code'] = 1001;
//            $rs['msg'] = '请先获取验证码';
//            return $rs;
//        }


        if($checkcode==1){
            $rs['code'] = 1001;
            $rs['msg'] = '手机号码不一致';
            return $rs;
        }

        if($checkcode==2){
            $rs['code'] = 1002;
            $rs['msg'] = '验证码错误';
            return $rs;
        }

        $domain = new Domain_Login();
        $info = $domain->userLogin($user_login);

        if($info==1002){
            $rs['code'] = 1002;
            $rs['msg'] = '该账号已被禁用';
            return $rs;
        }

        if($info==1006){
            $rs['code'] = 1006;
            $rs['msg'] = '该手机号已被注册！';
            return $rs;
        }
        if($info==1007){
            $rs['code'] = 1007;
            $rs['msg'] = '注册失败，请重试';
            return $rs;
        }


        //处理每日登录积分 1代表登录
        $uid = $info['id'] ?? 0;
        handleUserScoreDay($uid, 1);

        $rs['info'][0] = $info;
        delcode($mac);

        return $rs;
    }


    /**
     * 会员找回密码
     * @desc 用于会员找回密码
     * @return int code 操作码，0表示成功，1表示验证码错误，2表示用户密码不一致,3短信手机和登录手机不一致 4、用户不存在 801 密码6-12位数字与字母
     * @return array info
     * @return string msg 提示信息
     */
    public function userFindPass() {

        $rs = array('code' => 0, 'msg' => '', 'info' => array());

        $user_pass=checkNull($this->user_pass);
        $user_pass2=checkNull($this->user_pass2);
        $mac=checkNull($this->mac);
        $uid = checkNull($this->uid);
        $token = checkNull($this->token);

        $checkToken=checkToken($uid,$token);
        if($checkToken==700){
            $rs['code'] = $checkToken;
            $rs['msg'] = '您的登陆状态失效，请重新登陆！';
            return $rs;
        }

        if($user_pass!=$user_pass2){
            $rs['code'] = 1003;
            $rs['msg'] = '两次输入的密码不一致';
            return $rs;
        }

        $check = passcheck($user_pass);
        if($check== 0 ){
            $rs['code'] = 1004;
            $rs['msg'] = '密码6-12位数字与字母';
            return $rs;
        }
        if($check== 2){
            $rs['code'] = 1005;
            $rs['msg'] = '密码不能纯数字或纯字母';
            return $rs;
        }

        $domain = new Domain_Login();
        $info = $domain->userFindPass($uid,$user_pass);

        if($info==1006){
            $rs['code'] = 1006;
            $rs['msg'] = '该帐号不存在';

            return $rs;
        }

        if($info===false){
            $rs['code'] = 1007;
            $rs['msg'] = '重置失败，请重试';
            return $rs;
        }

        delforgetcode($mac);

        return $rs;
    }



    /**
     * 获取注册短信验证码
     * @desc 用于注册获取短信验证码
     * @return int code 操作码，0表示成功,2发送失败
     * @return array info
     * @return array info[0].mac 唯一码
     * @return string msg 提示信息
     */

    public function getCode() {
        $rs = array('code' => 0, 'msg' => '发送成功', 'info' => array());

        $mobile = checkNull($this->mobile);
        $sign = checkNull($this->sign);
        $mac = md5($mobile.'_'.rand(0,9999));

        $ismobile=checkMobile($mobile);
        if(!$ismobile){
            $rs['code']=1001;
            $rs['msg']='请输入正确的手机号';
            return $rs;
        }
        $checkdata=array(
            'mobile'=>$mobile
        );
        //暂时注释 等小程序改好

//        $issign=checkSign($checkdata,$sign);
//        if(!$issign){
//            $rs['code']=1001;
//            $rs['msg']='签名错误';
//            return $rs;
//        }
//
//        $where=[
//            'user_login = ?'=>$mobile
//        ];
//
//        $checkuser = checkUser($where);
//
//        if($checkuser){
//            $rs['code']=1004;
//            $rs['msg']='该手机号已注册，请登录';
//            return $rs;
//        }
        $checkcode = checkcode($mobile,$mac);

        if($checkcode==false){
            $rs['code']=1002;
            $rs['msg']='验证码5分钟有效，请勿多次发送';
            return $rs;
        }


        $mobile_code = random(6,1);

        /* 发送验证码 */
        $result=sendCode($mobile,$mobile_code);
        if($result['code']==0){
            $data['mobile'] = $mobile;
            $data['code'] = $mobile_code;
            $rs['info'][0]['mac']=$mac;
            setcode($data,$mac);
        }else if($result['code']==667){
            $data['mobile'] = $mobile;
            $data['code'] = $result['msg'];

            setcode($data,$mac);

            $rs['code']=0;
            $rs['info'][0]['mac']=$mac;
            $rs['msg']='验证码为：'.$result['msg'];
        }else{
            $rs['code']=1002;
            $rs['msg']=$result['msg'];
        }


        return $rs;
    }


    /**
     * 获取找回密码短信验证码
     * @desc 用于找回密码获取短信验证码
     * @return int code 操作码，0表示成功,2发送失败
     * @return array info
     * @return array info[0].mac 唯一码
     * @return string msg 提示信息
     */

    public function getForgetCode() {
        $rs = array('code' => 0, 'msg' => '发送成功', 'info' => array());

        $mobile = checkNull($this->mobile);
        $issign = checkNull($this->issign);
        $mac = md5($mobile.'_'.rand(0,9999));

        $ismobile=checkMobile($mobile);
        if(!$ismobile){
            $rs['code']=1001;
            $rs['msg']='请输入正确的手机号';
            return $rs;
        }
        //暂时注释 等小程序改好
        /*   $checkdata=array(
              'mobile'=>$mobile
          );
          $issign=checkSign($checkdata,$sign);
          if(!$issign){
              $rs['code']=1001;
              $rs['msg']='签名错误';
              return $rs;
          } 	 */
        $where=[
            'user_login = ?'=>$mobile
        ];



        $checkuser = checkUser($where);

        if(!$checkuser){
            $rs['code']=1004;
            $rs['msg']='该手机号未注册，请注册';
            return $rs;
        }
        $checkcode = checkforgetcode($mobile,$mac);



        if($checkcode==false){
            $rs['code']=1002;
            $rs['msg']='验证码5分钟有效，请勿多次发送';
            return $rs;
        }


        $mobile_code = random(6,1);

        /* 发送验证码 */
        $result=sendCode($mobile,$mobile_code);
        if($result['code']==0){
            $data['mobile'] = $mobile;
            $rs['info'][0]['mac']=$mac;
            $data['code'] = $mobile_code;
            setforgetcode($data,$mac);
        }else if($result['code']==667){
            $data['mobile'] = $mobile;
            $data['code'] = $result['msg'];
            setforgetcode($data,$mac);

            $rs['code']=0;
            $rs['info'][0]['mac']=$mac;
            $rs['msg']='验证码为：'.$result['msg'];
        }else{
            $rs['code']=1002;
            $rs['msg']=$result['msg'];
        }


        return $rs;
    }



    /**
     * 用户注册
     * @desc 用户注册
     * @return int code 操作码，0表示成功
     * @return array info
     * @return string msg 提示信息
     */
    public function userReg()
    {
        $rs = array('code' => 0, 'msg' => '', 'info' => array());

        $user_login    = checkNull($this->user_login);
        $user_pass     = checkNull($this->user_pass);
        $user_pass2    = checkNull($this->user_pass2);
        $user_nickname = checkNull($this->user_nickname);
        $partybranch   = checkNull($this->partybranch);

        if($user_login==''){
            $rs['code'] = 995;
            $rs['msg'] = T('请输入手机号');
            return $rs;
        }

        if($user_pass==''){
            $rs['code'] = 997;
            $rs['msg'] = T('请输入密码');
            return $rs;
        }

        if ((string)$user_pass != (string)$user_pass2) {
            $rs['code'] = 999;
            $rs['msg'] = T('两次密码输入不一致');
            return $rs;
        }

        if(!checkPass($user_pass)){
            $rs['code'] = 997;
            $rs['msg'] = T('密码为6-20位字母数字组合');
            return $rs;
        }

        $where=['user_login=?'=>$user_login];
        $isexist=checkUser($where);
        if($isexist){
            $rs['code']=1004;
            $rs['msg']= T('该手机号已注册，请直接登录');
            return $rs;
        }

        $domain = new Domain_Login();
        $info = $domain->userReg($user_login,$user_pass, $user_nickname, $partybranch);

        return $info;


    }




}
