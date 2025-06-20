<?php


namespace app\admin\controller;

use app\admin\model\NewsModel;
use cmf\controller\AdminBaseController;
use think\Db;

class RankingController extends AdminBaseController
{

    public function user()
    {
        $map         = [];
        $data        = $this->request->param();
        $partybranch = $data['partybranch'] ?? '';
        if ((int)$partybranch > 0) {
            $map[] = ['partybranch', '=', $partybranch];
        }

        $list = DB::name('users')->where($map)->order("score DESC")->paginate(10, false, ['query' => input()]);
        $page = $list->render();
        $this->assign("page", $page);
        $this->assign('list', $list);
        $this->assign('partybranchs', db('partybranch')->column(['id', 'name']));
        return $this->fetch();


//
//        $userData = getUserInfo($uid);
//
//        $model = new Model_Home();
//        //总用户数量
//        $allUserNum = $model->getRankingUserCount();
//
//        //各单位排行
//        $partys = $model->getPartyIds(); //所有单位的id和名字
//
//        $departArr = [];
//        for ($i = 0; $i < $allUserNum; $i += 10000) {
//            $end = 10000;
//            $yu  = $allUserNum - $i;
//            if ($yu <= 10000) {
//                $end = $yu;
//            }
//
//            $where = [
//                'partybranch' => $userData['partybranch']
//            ];
//
//            $rankData = $model->getRankingScoreLimit($where, $i, $end);
//
//            foreach ($rankData as $k => $v) {
//                $userInfo = getUserInfo($v['id']);
//                if ($userInfo) {
//                    $rankData[$k]['avatar'] = get_upload_path($userInfo['avatar']);
//                    $rankData[$k]['user_nickname'] = $userInfo['user_nickname'];
//                }
//            }
//
//            $departArr = array_merge($departArr, $rankData);
//
//        }
//
//        //各单位排行
//        foreach ($partys as $k => $v) {
//            $partys[$k]['score'] = DI()->notorm->users->where('partybranch=?',$v['id'])->sum('score');
//            $partys[$k]['user_nickname'] = $v['name']; //和前台字段名统一
//            $partys[$k]['avatar'] = '';
//        }
//
//        //降序排列
//        $last_names = array_column($partys,'score');
//        array_multisort($last_names,SORT_DESC,$partys);
//
//        $info['all'] = [];
//        $info['depart'] = $departArr;
//        $info['partys'] = $partys;
//
//        return $info;


    }


    //单位排行
    public function partybranch() {

        //各单位排行
        $partys = db('partybranch') //所有单位的id和名字
        ->alias("a")
        ->join('users u', 'a.id = u.partybranch')
        ->field('a.id,a.name,u.partybranch, sum(u.score) as score')
        ->group('a.id')
        ->order('score DESC')
        ->paginate(10);

        $page = $partys->render();
        $this->assign("page", $page);
        $this->assign('list', $partys);

        return $this->fetch('partybranch');
    }


    //导出排行榜
    public function exportuser()
    {
        $map         = [];
        $data        = $this->request->param();
        $partybranch = $data['partybranch'] ?? '';
        if ((int)$partybranch > 0) {
            $map[] = ['partybranch', '=', $partybranch];
        }

        $xlsData = DB::name('users')->where($map)->order('score DESC')->select();

        $arrHeader = array('用户ID', '用户名', '积分');
        $rowOne = 'id';
        $rowTwo = 'user_nickname';
        $rowThree = 'score';

        $this->exportExcel($xlsData, $arrHeader, $rowOne, $rowTwo, $rowThree);

    }


    //导出单位排行榜
    public function exportpartybranch()
    {

        $xlsData = db('partybranch') //所有单位的id和名字
                     ->alias("a")
                    ->join('users u', 'a.id = u.partybranch')
                    ->field('a.id,a.name,u.partybranch, sum(u.score) as score')
                    ->group('a.id')
                    ->order('score DESC')
                    ->select();

        $arrHeader = ['单位id', '名字', '积分'];
        $rowOne = 'id';
        $rowTwo = 'name';
        $rowThree = 'score';

        $this->exportExcel($xlsData, $arrHeader, $rowOne, $rowTwo, $rowThree);

    }




    private function exportExcel($xlsData, $arrHeader, $rowOne, $rowTwo, $rowThree)
    {

        require_once CMF_ROOT . 'sdk/PHPExcel/PHPExcel.php';
        //实例化
        $objExcel = new \PHPExcel();

        //居中对齐
        $objExcel->getDefaultStyle()->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
        $objExcel->getDefaultStyle()->getAlignment()->setVertical(\PHPExcel_Style_Alignment::VERTICAL_CENTER);
        //设置文档属性
        $objWriter = \PHPExcel_IOFactory::createWriter($objExcel, 'Excel2007');
        //设置内容
        $objActSheet = $objExcel->getActiveSheet();
        $key = ord("A");
        $letter = explode(',', "A,B,C");
        //填充表头信息
        $lenth = count($arrHeader);
        for ($i = 0; $i < $lenth; $i++) {
            $objActSheet->setCellValue("$letter[$i]1", "$arrHeader[$i]");
        };
        //填充表格信息
        foreach ($xlsData as $k => $v) {
            $k += 2;
            //表格内容
            $objActSheet->setCellValue('A' . $k, $v[$rowOne]);
            $objActSheet->setCellValue('B' . $k, $v[$rowTwo]);
            $objActSheet->setCellValue('C' . $k, $v[$rowThree]);

            // 表格高度
            $objActSheet->getRowDimension($k)->setRowHeight(20);
        }

        $width = array(20, 20, 15, 10, 10, 30, 10, 15);
        //设置表格的宽度
        $objActSheet->getColumnDimension('A')->setWidth($width[3]);
        $objActSheet->getColumnDimension('B')->setWidth($width[1]);
        $objActSheet->getColumnDimension('C')->setWidth($width[0]);

        $outfile = md5("积分表" . time()) . ".xlsx";
        ob_end_clean();
        header("Content-Type: application/force-download");
        header("Content-Type: application/octet-stream");
        header("Content-Type: application/download");
        header('Content-Disposition:inline;filename="' . $outfile . '"');
        header("Content-Transfer-Encoding: binary");
        header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
        header("Pragma: no-cache");
        $objWriter->save('php://output');

    }




}
