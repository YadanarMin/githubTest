<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;

class AutoSaveRoomProperties extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forge:room_properties';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->GetRoomProperties();
    }

    function GetRoomProperties(){
        $conf = new \Autodesk\Auth\Configuration();//escape from current name space by using '/'
        $conf->getDefaultConfiguration()
         ->setClientId('J0jduCzdsYAbKXqsidxCBt3aWpW5DNv0')
         ->setClientSecret('Hp8X9pxKgYjqJYGE');//bim360local App

        $authObj = new \Autodesk\Auth\OAuth2\TwoLeggedAuth();
        $scopes = array("code:all","data:read","data:write","bucket:read");
        $authObj->setScopes($scopes);
        $authObj->fetchToken();
        $access_token = $authObj->getAccessToken();
        $authObj->setAccessToken($access_token);

        $version_db_info = $this->GetAutoSaveProjectUrns();


        foreach($version_db_info as $version){
            $room_list = array();
            $urn = $version["forge_version_id"];//forge_id
            $version_id = $version["id"];//database_id
            $item_id = $version["item_id"];//db_project id
            $version_number = $version["version_number"];               
            if($version_number == 1)continue; 
            $check_exist = $this->GetRoomAlreadySavedFlag($item_id,$version_number);

            if($check_exist[0]["room_already_saved"] == 1) continue;
            $derivInst = new \Autodesk\Forge\Client\Api\DerivativesApi($authObj);
            try {
                $metaDataObj = $derivInst->getMetadata(base64_encode($urn),null);
                $metaData = $metaDataObj["data"]["metadata"];
                foreach($metaData as $mData){
                    if($mData["name"] != "新しい建設")continue;
                    $guid = $mData["guid"];
                    $viewTree = $derivInst->getModelviewMetadata(base64_encode($urn),$guid,null);
                    $hirechyData = $viewTree['data']['objects'];
    
                    $roomIds = array();
                    foreach($hirechyData as $vData){
                        $vd = $vData['objects'];
                        foreach($vd as $v){
                            if($v['name'] == "部屋"){
                                $vRooms = $v["objects"];
                                foreach($vRooms as $vr){
                                    $roomid = $vr['objectid'];
                                    array_push($roomIds,$roomid);
                                }
                               break; 
                            }
                        }                           
                    }
    
                    $properties = $derivInst->getModelviewProperties(base64_encode($urn),$guid,null);
                    $allProperties = $properties['data']['collection'];                   
                    foreach($roomIds as $rId){
                        foreach($allProperties as $p){
                            
                            if($p['objectid'] == $rId){
                                $element_name = $p['name'];                             
                                $room = $this->FilterRoomProperties($p['properties'], $element_name);
                                array_push($room_list,$room);
                                break;
                            }
                        }
                    }
                    break;
                }
            } catch (Exception $e) {
                echo 'Exception when calling DerivativesApi->getModelviewMetadata: ', $e->getMessage(), PHP_EOL;
            }
        
            if(sizeof($room_list) > 0 ){    

                $this->SaveRoomProperties($version_number,$version_id,$item_id,$room_list);
                 //update tb_forge_ver already_saved flag to 1 
                $this->UpdateRoomAlreadySavedFlag($item_id,$version_number);
            //break;
            }

        }
       
    }

    function FilterRoomProperties($properties, $element_name){

        $sunpo = json_decode(json_encode($properties["寸法"]), true);//change stdclass to array
        $shiage = json_decode(json_encode($properties["識別情報"]), true);
        $kosoku = json_decode(json_encode($properties ["拘束"]), true);

        $tempArr= explode("[", $element_name);
        //$family_name = $tempArr[0];
        $element_id = preg_replace("/[^0-9.]/", "", $tempArr[1]);
 
        $roomname = $shiage["名前"];
        $level = $kosoku["レベル"];

        $shiage_tenjo = isset($shiage["仕上 天井"]) ? $shiage["仕上 天井"] : "";
        $tenjo_shitaji = isset($shiage["天井下地"]) ? $shiage["天井下地"] : "";
        $mawaribuchi = isset($shiage["廻縁"]) ? $shiage["廻縁"] : "";
        $shiage_kabe = isset($shiage["仕上 壁"]) ? $shiage["仕上 壁"] : "";
        $kabe_shitaji = isset($shiage["壁下地"]) ? $shiage["壁下地"] : "";
        $habaki = isset($shiage["幅木"]) ? $shiage["幅木"] : "";
        $shiage_yuka = isset($shiage["仕上 床"]) ? $shiage["仕上 床"] : "";
        $yuka_shitaji = isset($shiage["床下地"]) ? $shiage["床下地"] : "";

        $shucho =  (isset($sunpo["周長"]) && $sunpo["周長"] != "") ?  preg_replace("/[^0-9.]/", "",$sunpo["周長"]) : 0;
        $menseki_kakikomi = (isset($sunpo["室面積（書き込み）_ob"]) && $sunpo["室面積（書き込み）_ob"] != "") ? preg_replace("/[^0-9.]/", "",$sunpo["室面積（書き込み）_ob"]) : 0;
        $santei_takasa = (isset($sunpo["算定高さ"]) && $sunpo["算定高さ"] != "")? preg_replace("/[^0-9.]/", "",$sunpo["算定高さ"] ): 0;
        $heya_takasa = (isset($sunpo["部屋高さ(レベル指定)"]) && $sunpo["部屋高さ(レベル指定)"] != "") ? preg_replace("/[^0-9.]/", "",$sunpo["部屋高さ(レベル指定)"]) : 0;                 
        $menseki = (isset($sunpo["面積"]) && $sunpo["面積"] != "") ? preg_replace("/[^0-9.]/", "",$sunpo["面積"]) : 0;
        $workset = (isset($shiage["ワークセット"])) ? $shiage["ワークセット"] : "";
        
        return array("forge_room_id"=>$element_id,"room_name"=>$roomname,"level"=>$level,"shiage_tenjo"=>$shiage_tenjo,"tenjo_shitaji"=>$tenjo_shitaji,
                    "mawaribuchi"=>$mawaribuchi,"shiage_kabe"=>$shiage_kabe,"kabe_shitaji"=>$kabe_shitaji,"habaki"=>$habaki,"shiage_yuka"=>$shiage_yuka,"yuka_shitaji"=>$yuka_shitaji,
                    "shucho"=>$shucho,"menseki_kakikomi"=>$menseki_kakikomi,"santei_takasa"=>$santei_takasa,"heya_takasa"=>$heya_takasa,"menseki"=>$menseki,"workset"=>$workset);      

    }
    
    function SaveRoomProperties($version_number,$version_id,$item_id,$room_list){

        $save_element_id = array_column($room_list,"forge_room_id");
         
        $current_ver_ids = ($save_element_id == "") ? "'"."ALL_UNCHECK"."'" : "'" . implode ( "', '", $save_element_id ) . "'";//convert array to string with single code
        $select_deleted_query = "SELECT element_id FROM tb_forge_room WHERE item_id = $item_id AND version_number < $version_number
                                 AND element_id NOT IN($current_ver_ids)";

        $deleted_elements = DB::select($select_deleted_query);

         if(sizeof($deleted_elements) > 0){               
             foreach($deleted_elements as $deleted_id){
                
                 $ele_id = $deleted_id->element_id;
                 $insert_ids_query = "INSERT IGNORE INTO tb_forge_room_deleted (id,element_id,item_id,version_id,version_number)
                                     SELECT MAX(id) +1,$ele_id,$item_id,$version_id,$version_number FROM tb_forge_room_deleted";
                 DB::insert($insert_ids_query);
             }               
         }

        foreach($room_list as $room){
            $element_id =$room["forge_room_id"];
            $room_name = $this->escape_string($room["room_name"]);
            $level = $this->escape_string($room["level"]);
            $shiage_tenjo = $this->escape_string($room["shiage_tenjo"]);
            $tenjo_shitaji = $this->escape_string($room["tenjo_shitaji"]);
            $mawaribuchi = $this->escape_string($room["mawaribuchi"]);
            $shiage_kabe = $this->escape_string($room["shiage_kabe"]);
            $kabe_shitaji = $this->escape_string($room["kabe_shitaji"]);
            $habaki = $this->escape_string($room["habaki"]);
            $shiage_yuka = $this->escape_string($room["shiage_yuka"]);
            $yuka_shitaji = $this->escape_string($room["yuka_shitaji"]);
            $shucho = $room["shucho"];
            $menseki_kakikomi = $room["menseki_kakikomi"];
            $santei_takasa = $room["santei_takasa"];
            $heya_takasa = $room["heya_takasa"];
            $menseki =$room["menseki"];
            $workset = $room["workset"];

            DB::insert("CALL room_insert_procedure($item_id,$element_id,'$room_name','$level','$shiage_tenjo','$tenjo_shitaji','$mawaribuchi','$shiage_kabe','$kabe_shitaji','$habaki',
                                                    '$shiage_yuka','$yuka_shitaji',$shucho,$menseki_kakikomi,$santei_takasa,$heya_takasa,$menseki,'$workset',
                                                     $version_id,$version_number)");
            
        }
    }

    function GetAutoSaveProjectUrns(){
        $query = "SELECT fv.id,fv.forge_version_id,fv.version_number,fi.id as item_id from tb_forge_version fv
                    LEFT JOIN  tb_forge_item  fi on fv.item_id = fi.id
                    LEFT JOIN tb_project fp on fi.project_id = fp.id
                    WHERE fp.auto_save_properties = 1 ORDER BY fv.version_number ";       
        $result = DB::select($query);
        return json_decode(json_encode($result),true);//change array object to array
    }

    function GetAlreadySavedFlag($item_id,$version_number){
        $query = "SELECT already_saved FROM tb_forge_version WHERE item_id = $item_id AND version_number = $version_number LIMIT 1";
        $result = DB::select($query);
        return json_decode(json_encode($result),true);//change array object to array
    }

    function escape_string($string){
        $escape_string = str_replace("'", "\'",$string);
        return $escape_string;
    }

    function UpdateRoomAlreadySavedFlag($item_id,$version_number){
        $query = "UPDATE  tb_forge_version SET room_already_saved = 1 WHERE item_id = $item_id AND version_number = $version_number";
        DB::update($query);
    }

    function GetRoomAlreadySavedFlag($item_id,$version_number){
        $query = "SELECT room_already_saved FROM tb_forge_version WHERE item_id = $item_id AND version_number = $version_number LIMIT 1";
        $result = DB::select($query);
        return json_decode(json_encode($result),true);//change array object to array
    }

}
