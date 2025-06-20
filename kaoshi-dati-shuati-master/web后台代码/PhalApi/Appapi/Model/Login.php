<?php

class Model_Login extends PhalApi_Model_NotORM {

    protected $fields='id,user_nickname,avatar,sex,signature,birthday,user_status,last_login_time,mobile,party_money,score,is_admin_import,user_pass';


    public function getinfo($user_login) {
        $info=DI()->notorm->users
            ->select($this->fields)
            ->where('user_login=? and user_type="2"',$user_login)
            ->fetchOne();

        return $info;
    }

    public function getUserInfo($where) {
        $info=DI()->notorm->users
            ->select($this->fields)
            ->where($where)
            ->fetchOne();

        return $info;
    }

    public function checkinfo($user_login) {
        $info=DI()->notorm->users
            ->select($this->fields)
            ->where('user_login=? ',$user_login)
            ->fetchOne();

        return $info;
    }
    public function insertuser($data) {
        $rs=DI()->notorm->users->insert($data);

        return $rs;
    }


    /* 找回密码 */
    public function userFindPass($user_login,$user_pass){
        $isexist=DI()->notorm->users
            ->select('id')
            ->where('user_login=? and user_type="2"',$user_login)
            ->fetchOne();
        if(!$isexist){
            return 1006;
        }
        $user_pass=setPass($user_pass);

        return DI()->notorm->users
            ->where('id=?',$isexist['id'])
            ->update(array('user_pass'=>$user_pass));

    }

    public function changetoken($where,$data){
        return DI()->notorm->users_token
//            ->where('user_id=?',$uid)
            ->insert_update($where,$data,$data);
    }
    public function changelogintime($uid,$data){
        return DI()->notorm->users
            ->where('id=?',$uid)
            ->update($data);
    }
    public function updatepass($uid,$user_pass){
        return DI()->notorm->users
            ->where('id=?',$uid)
            ->update(array('user_pass'=>$user_pass));
    }

    //注册
    public function userReg($data) {
        return DI()->notorm->users
            ->insert($data);
    }

}
