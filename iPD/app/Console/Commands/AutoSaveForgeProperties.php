<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;

class AutoSaveForgeProperties extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forge:save_properties';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'auto save forge properties';

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
        $this->GetForgeProperties();
         //DB::table('tb_project')->delete();
    }

     function GetForgeProperties(){
        $conf = new \Autodesk\Auth\Configuration();//escape from current name space by using '/'
        $conf->getDefaultConfiguration()
        ->setClientId('Mt1Tul68redoV5OEMKwRh1aYQnsdmtJW')
        ->setClientSecret('8FOuOTPK6nOp4bOl');

        $authObj = new \Autodesk\Auth\OAuth2\TwoLeggedAuth();
        $scopes = array("code:all","data:read","data:write","bucket:read");
        $authObj->setScopes($scopes);

        $authObj->fetchToken();
        $access_token = $authObj->getAccessToken();
        $authObj->setAccessToken($access_token);
       
        try {
            $derivInst = new \Autodesk\Forge\Client\Api\DerivativesApi($authObj);
            //ngar tagak
            //get version urns from database
            $version_db_info = $this->GetAutoSaveProjectUrns();

            foreach($version_db_info as $version){
                $urn = $version["forge_version_id"];//forge_id
                $version_id = $version["id"];//database_id
                $item_id = $version["item_id"];//db_project id
                $version_number = $version["version_number"];               
                if($version_number == 1)continue; 
                $check_exist = $this->GetAlreadySavedFlag($item_id,$version_number);

                if($check_exist[0]["already_saved"] == 1) continue;
                $metaDataObj = $derivInst->getMetadata(base64_encode($urn),null);
                if(empty($metaDataObj["data"]["metadata"]))continue;
                    
                $metaData = $metaDataObj["data"]["metadata"];

                $category_list = array();
                foreach($metaData as $mData){

                    if($mData["name"] != "新しい建設")continue;
                    $guid = $mData["guid"];
                    $viewTree = $derivInst->getModelviewMetadata(base64_encode($urn),$guid,null);
                    if(empty($viewTree['data']['objects']))continue;
                    $hirechyData = $viewTree['data']['objects'];
                    
                    foreach($hirechyData as $vData){                    
                        $categoris = $vData['objects'];
                        foreach($categoris as $category){
                            $type_ids = array();
                            $category_name = $category['name'];
                             
                            if($category_name == "構造柱" || $category_name == "構造フレーム" || $category_name == "床" || $category_name == "壁" || $category_name == "構造基礎"){   //  
                                //print_r($category_name);          
                                $materials = $category["objects"];                              
                                foreach($materials as $material){
                                    $types = $material['objects'];                                  
                                    foreach($types as $type){ 
                                        $type_pro = $type['objects'];
                                        foreach($type_pro as $property) {
                                            $typeID = $property['objectid'];
                                            array_push($type_ids,$typeID);   
                                        }                                                                                                                                                                                         
                                   }
                                }
                               //break; 
                            }
                         
                            if(sizeof($type_ids) > 0){
                                $category_list[$category_name] = $type_ids;
                            }
                        }                            
                    }
                    //break;
                }

                
                if(sizeof($category_list) > 0){
                    $properties = $derivInst->getModelviewProperties(base64_encode($urn),$guid,null);
                    $allProperties = $properties['data']['collection'];
                    $column_properties = array();
                    foreach($category_list as $name=>$type_id_list){
                        $category_name = $name;
                        $save_list = array();
                        $tekkin_list = array();
                        foreach($type_id_list as $type_id){
                            foreach($allProperties as $property){
                                if($property['objectid'] != $type_id) continue;
                                $element_name = $property['name'];
                                $saveData = $this->FilterProperty($property["properties"],$element_name,$category_name);
                                array_push($save_list,$saveData);   
                                if($category_name == "構造柱" || $category_name == "構造フレーム" || $category_name == "構造基礎"){
                                    if(isset($property["properties"]["その他"])){
                                        $tekkinData = $this->FilterTekkinProperty($property["properties"]["その他"],$element_name,$category_name,$property["properties"]["寸法"],$property["properties"]["拘束"]);
                                        array_push($tekkin_list,$tekkinData);
                                    }
                                       
                                }
                                //return;                         
                            }
                        }

                        if(sizeof($save_list) > 0){
                            switch($category_name){
                                case "構造柱" : $this->SaveColumn($save_list,$version_id,$item_id,$version_number);break;
                                case "構造フレーム" : $this->SaveBeam($save_list,$version_id,$item_id,$version_number);break;
                                case "床" : $this->SaveFloor($save_list,$version_id,$item_id,$version_number);break;
                                case "壁" : $this->SaveWall($save_list,$version_id,$item_id,$version_number);break;
                                case "構造基礎" : $this->SaveFoundation($save_list,$version_id,$item_id,$version_number);break;
                            }
                            
                        }

                        if(sizeof($tekkin_list) > 0){
                            switch($category_name){
                                case "構造柱" : $this->SaveColumnTekkin($tekkin_list,$version_id,$item_id,$version_number);break;
                                case "構造フレーム" : $this->SaveBeamTekkin($tekkin_list,$version_id,$item_id,$version_number);break;                               
                                case "構造基礎" : $this->SaveFoundationTekkin($tekkin_list,$version_id,$item_id,$version_number);break;
                            }
                        }
                    }                    
                }
             
           //update tb_forge_ver already_saved flag to 1 
           $this->UpdateAlreadySavedFlag($item_id,$version_number);
            }           
            

        } catch (Exception $e) {
            echo 'Exception when calling forge library function : ', $e->getMessage(), PHP_EOL;
        }
    }

    /**
     * special character escaping single code fun() 
     * given parameter[string]
     * return escape string
     * to save special char to database
     */
    function escape_string($string){
        $escape_string = str_replace("'", "\'",$string);
        return $escape_string;
    }

    /**l
     * Update already_saved to 1 
     * for skip next time save
     */
    public function UpdateAlreadySavedFlag($item_id,$version_number)
    {
        $query = "UPDATE  tb_forge_version SET already_saved = 1 WHERE item_id = $item_id AND version_number = $version_number";
        DB::update($query);
    }

    function GetAlreadySavedFlag($item_id,$version_number){
        $query = "SELECT already_saved FROM tb_forge_version WHERE item_id = $item_id AND version_number = $version_number LIMIT 1";
        $result = DB::select($query);
        return json_decode(json_encode($result),true);//change array object to array
    }

    public function FilterProperty($property,$element_name,$category_name)
    {
        $material = $property['マテリアル / 仕上'];
        $identification_info = $property["識別情報"];
        $kosoku = $property['拘束'];
        $sunPo = $property['寸法'];
       
        $typeName = $identification_info->タイプ名;
        $workset = $identification_info->ワークセット;
        $kouzouMaterial = isset($material->構造マテリアル) ? $material->構造マテリアル: $material->フーチング_マテリアル;       
        $level = isset($kosoku->参照レベル) ? $kosoku->参照レベル: $kosoku->基準レベル; 
        $volume = 0;
        if($category_name != "構造基礎"){
            if(isset($sunPo->容積))
             $volume =  preg_replace("/[^0-9.]/", "",$sunPo->容積);//get float from string 
        }else{
            $width=0;$length=0;$depth=0;
            if(isset($sunPo->幅)|| isset($sunPo->W))
                $width = isset($sunPo->幅) ? preg_replace("/[^0-9.]/", "",$sunPo->幅) : preg_replace("/[^0-9.]/", "",$sunPo->W);
            if(isset($sunPo->長さ)|| isset($sunPo->H))
                $length = isset($sunPo->長さ) ? preg_replace("/[^0-9.]/", "",$sunPo->長さ) : preg_replace("/[^0-9.]/", "",$sunPo->H);
            if(isset($sunPo->厚さ)|| isset($sunPo->D))
                $depth = isset($sunPo->厚さ) ? preg_replace("/[^0-9.]/", "",$sunPo->厚さ) :  preg_replace("/[^0-9.]/", "",$sunPo->D);
            $volume = ($width/1000) * ($length/1000) * ($depth/1000);
        }
        $tempArr= explode(" ", $element_name);
        $family_name = $tempArr[0];
        $element_id = preg_replace("/[^0-9.]/", "", $tempArr[1]);
        return array("type_name"=>$typeName,"material"=>$kouzouMaterial,"level"=>$level,"volume"=>$volume,"workset"=>$workset,"family_name" =>$family_name,"element_id"=>$element_id);
        
    }

    function FilterTekkinProperty($tekkinProperty,$element_name,$category_name,$sunpoProperty,$kosokuProperty){
        $tekkin = json_decode(json_encode($tekkinProperty),true);
        $sunpo = json_decode(json_encode($sunpoProperty),true);
        $kosoku = json_decode(json_encode($kosokuProperty),true);
        $tempArr= explode(" ", $element_name);
        $family_name = $tempArr[0];
        $element_id = preg_replace("/[^0-9.]/", "", $tempArr[1]);
        if($category_name == "構造フレーム"){
            $B = isset($sunpo["B"]) ? $sunpo["B"] : "";
            $H = isset($sunpo["H"]) ? $sunpo["H"] : "";
            $kattocho = isset($sunpo["カット長"]) ? $sunpo["カット長"] : "";
            $level = isset($kosoku["参照レベル"])? $kosoku["参照レベル"] : $kosoku["基準レベル"]; 

            //始端
            $start_upper_diameter = isset($tekkin["始端 上主筋 太径"]) ? $tekkin["始端 上主筋 太径"] : "";
            $start_upper_firstRowCount = isset($tekkin["始端 上主筋 1段筋太筋本数"]) ? $tekkin["始端 上主筋 1段筋太筋本数"] : "";
            $start_upper_secondRowCount = isset($tekkin["始端 上主筋 2段筋太筋本数"]) ? $tekkin["始端 上主筋 2段筋太筋本数"] : ""; 
            $start_lower_diameter = isset($tekkin["始端 下主筋 太径"]) ? $tekkin["始端 下主筋 太径"] : "";
            $start_lower_firstRowCount = isset($tekkin["始端 下主筋 1段筋太筋本数"]) ? $tekkin["始端 下主筋 1段筋太筋本数"] : ""; 
            $start_lower_secondRowCount = isset($tekkin["始端 下主筋 2段筋太筋本数"]) ? $tekkin["始端 下主筋 2段筋太筋本数"] : "";        
            $start_rib_diameter = isset($tekkin["始端 肋筋径"]) ? $tekkin["始端 肋筋径"]: "";  
            $start_rib_count = isset($tekkin["始端 肋筋本数"]) ? $tekkin["始端 肋筋本数"] :""; 
            $start_rib_pitch = isset($tekkin["始端 肋筋ピッチ"]) ? $tekkin["始端 肋筋ピッチ"] : ""; 

            //中央
            $center_upper_diameter = isset($tekkin["中央 上主筋 太径"]) ? $tekkin["中央 上主筋 太径"] : "";
            $center_upper_firstRowCount = isset($tekkin["中央 上主筋 1段筋太筋本数"]) ? $tekkin["中央 上主筋 1段筋太筋本数"] : "";
            $center_upper_secondRowCount = isset($tekkin["中央 上主筋 2段筋太筋本数"]) ? $tekkin["中央 上主筋 2段筋太筋本数"] : ""; 
            $center_lower_diameter = isset($tekkin["中央 下主筋 太径"]) ? $tekkin["中央 下主筋 太径"] : "";
            $center_lower_firstRowCount = isset($tekkin["中央 下主筋 1段筋太筋本数"]) ? $tekkin["中央 下主筋 1段筋太筋本数"] : ""; 
            $center_lower_secondRowCount = isset($tekkin["中央 下主筋 2段筋太筋本数"]) ? $tekkin["中央 下主筋 2段筋太筋本数"] : "";        
            $center_rib_diameter = isset($tekkin["中央 肋筋径"]) ? $tekkin["中央 肋筋径"]: "";  
            $center_rib_count = isset($tekkin["中央 肋筋本数"]) ? $tekkin["中央 肋筋本数"] :""; 
            $center_rib_pitch = isset($tekkin["中央 肋筋ピッチ"]) ? $tekkin["中央 肋筋ピッチ"] : ""; 

            //終端
            $end_upper_diameter = isset($tekkin["終端 上主筋 太径"]) ? $tekkin["終端 上主筋 太径"] : "";
            $end_upper_firstRowCount = isset($tekkin["終端 上主筋 1段筋太筋本数"]) ? $tekkin["終端 上主筋 1段筋太筋本数"] : "";
            $end_upper_secondRowCount = isset($tekkin["終端 上主筋 2段筋太筋本数"]) ? $tekkin["終端 上主筋 2段筋太筋本数"] : ""; 
            $end_lower_diameter = isset($tekkin["終端 下主筋 太径"]) ? $tekkin["終端 下主筋 太径"] : "";
            $end_lower_firstRowCount = isset($tekkin["終端 下主筋 1段筋太筋本数"]) ? $tekkin["終端 下主筋 1段筋太筋本数"] : ""; 
            $end_lower_secondRowCount = isset($tekkin["終端 下主筋 2段筋太筋本数"]) ? $tekkin["終端 下主筋 2段筋太筋本数"] : "";        
            $end_rib_diameter = isset($tekkin["終端 肋筋径"]) ? $tekkin["終端 肋筋径"]: "";  
            $end_rib_count = isset($tekkin["終端 肋筋本数"]) ? $tekkin["終端 肋筋本数"] :""; 
            $end_rib_pitch = isset($tekkin["終端 肋筋ピッチ"]) ? $tekkin["終端 肋筋ピッチ"] : ""; 

            return array("B"=>$B,"H"=>$H,"kattocho"=>$kattocho,"level"=>$level,
                        "start_upper_diameter"=>$start_upper_diameter,"start_upper_firstRowCount"=>$start_upper_firstRowCount,"start_upper_secondRowCount"=>$start_upper_secondRowCount,
                        "start_lower_diameter"=>$start_lower_diameter,"start_lower_firstRowCount"=>$start_lower_firstRowCount,"start_lower_secondRowCount"=>$start_lower_secondRowCount,
                        "start_rib_diameter"=>$start_rib_diameter,"start_rib_count"=>$start_rib_count,"start_rib_pitch"=>$start_rib_pitch,
                        
                        "center_upper_diameter"=>$center_upper_diameter,"center_upper_firstRowCount"=>$center_upper_firstRowCount,"center_upper_secondRowCount"=>$center_upper_secondRowCount,
                        "center_lower_diameter"=>$center_lower_diameter,"center_lower_firstRowCount"=>$center_lower_firstRowCount,"center_lower_secondRowCount"=>$center_lower_secondRowCount,
                        "center_rib_diameter"=>$center_rib_diameter,"center_rib_count"=>$center_rib_count,"center_rib_pitch"=>$center_rib_pitch,
                    
                        "end_upper_diameter"=>$end_upper_diameter,"end_upper_firstRowCount"=>$end_upper_firstRowCount,"end_upper_secondRowCount"=>$end_upper_secondRowCount,
                        "end_lower_diameter"=>$end_lower_diameter,"end_lower_firstRowCount"=>$end_lower_firstRowCount,"end_lower_secondRowCount"=>$end_lower_secondRowCount,
                        "end_rib_diameter"=>$end_rib_diameter,"end_rib_count"=>$end_rib_count,"end_rib_pitch"=>$end_rib_pitch,"element_id"=>$element_id);

        }else if($category_name == "構造柱"){

            $W = isset($sunpo["W"]) ? $sunpo["W"] : "";
            $D = isset($sunpo["D"]) ? $sunpo["D"] : "";
            $volume = isset($sunpo["容積"]) ? $sunpo["容積"] : "";
            $level = isset($kosoku["参照レベル"])? $kosoku["参照レベル"] : $kosoku["基準レベル"]; 
           
             //柱頭
            $start_diameter = isset($tekkin["柱頭 主筋太径"]) ? $tekkin["柱頭 主筋太径"] : "";    
            $start_X_firstRowCount  = isset($tekkin["柱頭 主筋X方向1段太筋本数"]) ? $tekkin["柱頭 主筋X方向1段太筋本数"] : "" ; 
            $start_X_secondRowCount = isset($tekkin["柱頭 主筋X方向2段太筋本数"]) ? $tekkin["柱頭 主筋X方向2段太筋本数"] : ""; 
            $start_Y_firstRowCount = isset($tekkin["柱頭 主筋Y方向1段太筋本数"]) ? $tekkin["柱頭 主筋Y方向1段太筋本数"] : "";
            $start_Y_secondRowCount = isset($tekkin["柱頭 主筋Y方向2段太筋本数"]) ? $tekkin["柱頭 主筋Y方向2段太筋本数"] : ""; 
            $start_rib_diameter = isset($tekkin["柱頭 帯筋径"]) ? $tekkin["柱頭 帯筋径"] : "";  
            $start_rib_pitch = isset($tekkin["柱頭 帯筋ピッチ"]) ? $tekkin["柱頭 帯筋ピッチ"] : "";  

             //柱脚 
            $end_diameter = isset($tekkin["柱脚 主筋太径"]) ? $tekkin["柱脚 主筋太径"] : "";   
            $end_X_firstRowCount  = isset($tekkin["柱脚 主筋X方向1段太筋本数"]) ? $tekkin["柱脚 主筋X方向1段太筋本数"] : "" ; 
            $end_X_secondRowCount = isset($tekkin["柱脚 主筋X方向2段太筋本数"]) ? $tekkin["柱脚 主筋X方向2段太筋本数"] : ""; 
            $end_Y_firstRowCount = isset($tekkin["柱脚 主筋Y方向1段太筋本数"]) ? $tekkin["柱脚 主筋Y方向1段太筋本数"] : "";
            $end_Y_secondRowCount = isset($tekkin["柱脚 主筋Y方向2段太筋本数"]) ? $tekkin["柱脚 主筋Y方向2段太筋本数"] : ""; 
            $end_rib_diameter = isset($tekkin["柱脚 帯筋径"]) ? $tekkin["柱脚 帯筋径"] : "";  
            $end_rib_pitch = isset($tekkin["柱脚 帯筋ピッチ"]) ? $tekkin["柱脚 帯筋ピッチ"] : "";  

            return array("W"=>$W,"D"=>$D,"volume"=>$volume,"level"=>$level,
                    "start_diameter"=>$start_diameter,"start_X_firstRowCount"=>$start_X_firstRowCount,"start_X_secondRowCount"=>$start_X_secondRowCount,
                    "start_Y_firstRowCount"=>$start_Y_firstRowCount,"start_Y_secondRowCount"=>$start_Y_secondRowCount,"start_rib_diameter"=>$start_rib_diameter,"start_rib_pitch"=>$start_rib_pitch,
                    "end_diameter"=>$end_diameter,"end_X_firstRowCount"=>$end_X_firstRowCount,"end_X_secondRowCount"=>$end_X_secondRowCount,
                    "end_Y_firstRowCount"=>$end_Y_firstRowCount,"end_Y_secondRowCount"=>$end_Y_secondRowCount,"end_rib_diameter"=>$end_rib_diameter,"end_rib_pitch"=>$end_rib_pitch,"element_id"=>$element_id);

        }else if($category_name == "構造基礎"){
            $D = isset($sunpo["D"]) ? $sunpo["D"] : "";
            $H = isset($sunpo["H"]) ? $sunpo["H"] : "";
            $W = isset($sunpo["W"]) ? $sunpo["W"] : "";
            $level = isset($kosoku["参照レベル"])? $kosoku["参照レベル"] : $kosoku["基準レベル"]; 

             //上端筋
            $upper_X_diameter = isset($tekkin["上端筋_X方向_鉄筋径"]) ? $tekkin["上端筋_X方向_鉄筋径"] : "";   
            $upper_X_count = isset($tekkin["上端筋_X方向_鉄筋本数"]) ? $tekkin["上端筋_X方向_鉄筋本数"] : ""; 
            $upper_Y_diameter = isset($tekkin["上端筋_Y方向_鉄筋径"]) ? $tekkin["上端筋_Y方向_鉄筋径"] : ""; 
            $upper_Y_count = isset($tekkin["上端筋_Y方向_鉄筋本数"]) ? $tekkin["上端筋_Y方向_鉄筋本数"] : "";

            //下端筋
            $lower_X_diameter = isset($tekkin["下端筋_X方向_鉄筋径"]) ? $tekkin["下端筋_X方向_鉄筋径"] : "";   
            $lower_X_count = isset($tekkin["下端筋_X方向_鉄筋本数"]) ? $tekkin["下端筋_X方向_鉄筋本数"] : ""; 
            $lower_Y_diameter = isset($tekkin["下端筋_Y方向_鉄筋径"]) ? $tekkin["下端筋_Y方向_鉄筋径"] : ""; 
            $lower_Y_count = isset($tekkin["下端筋_Y方向_鉄筋本数"]) ? $tekkin["下端筋_Y方向_鉄筋本数"] : "";

            return array("D"=>$D,"H"=>$H,"W"=>$W,"level"=>$level,
                        "upper_X_diameter"=>$upper_X_diameter,"upper_X_count"=>$upper_X_count,"upper_Y_diameter"=>$upper_Y_diameter,"upper_Y_count"=>$upper_Y_count,
                        "lower_X_diameter"=>$lower_X_diameter,"lower_X_count"=>$lower_X_count,"lower_Y_diameter"=>$lower_Y_diameter,"lower_Y_count"=>$lower_Y_count,"element_id"=>$element_id);
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

    public function SaveColumn($save_list,$version_id,$item_id,$version_number){
        
       try{
           $save_element_id = array_column($save_list,"element_id");
         
           $current_ver_ids = ($save_element_id == "") ? "'"."ALL_UNCHECK"."'" : "'" . implode ( "', '", $save_element_id ) . "'";//convert array to string with single code
           $select_deleted_query = "SELECT element_id FROM tb_forge_column WHERE item_id = $item_id AND version_number < $version_number
                                    AND element_id NOT IN($current_ver_ids)";

           $deleted_elements = DB::select($select_deleted_query);

            if(sizeof($deleted_elements) > 0){               
                foreach($deleted_elements as $deleted_id){
                   
                    $ele_id = $deleted_id->element_id;
                    $insert_ids_query = "INSERT IGNORE INTO tb_forge_column_deleted (id,element_id,item_id,version_id,version_number)
                                        SELECT MAX(id) +1,$ele_id,$item_id,$version_id,$version_number FROM tb_forge_column_deleted";
                    DB::insert($insert_ids_query);
                }               
            }

            foreach($save_list as $data){
                $type_name =$data["type_name"]; //$this->escape_string($data["type_name"]);
                $material =$data["material"];// $this->escape_string($data["material"]);
                $level = $this->escape_string($data["level"]);
                $volume = $data["volume"];
                $workset = $data["workset"];
                $family_name = $this->escape_string($data["family_name"]);
                $element_id = $data["element_id"];

                DB::insert("CALL column_insert_procedure($item_id,$element_id,'$type_name','$material','$level',$volume,'$family_name','$workset',$version_id,$version_number)");
                
            }

       }catch(Exception $e){
           print_r($e->getMessage());
       }
        
    }

    public function SaveBeam($save_list,$version_id,$item_id,$version_number){
        
       try{
           $save_element_id = array_column($save_list,"element_id");
         
           $current_ver_ids = ($save_element_id == "") ? "'"."ALL_UNCHECK"."'" : "'" . implode ( "', '", $save_element_id ) . "'";//convert array to string with single code
           $select_deleted_query = "SELECT element_id FROM tb_forge_beam WHERE item_id = $item_id AND version_number < $version_number
                                    AND element_id NOT IN($current_ver_ids)";

           $deleted_elements = DB::select($select_deleted_query);

            if(sizeof($deleted_elements) > 0){               
                foreach($deleted_elements as $deleted_id){
                   
                    $ele_id = $deleted_id->element_id;
                    $insert_ids_query = "INSERT IGNORE INTO tb_forge_beam_deleted (id,element_id,item_id,version_id,version_number)
                                        SELECT MAX(id) +1,$ele_id,$item_id,$version_id,$version_number FROM tb_forge_beam_deleted";
                    DB::insert($insert_ids_query);
                }               
            }

            foreach($save_list as $data){
                $type_name = $this->escape_string($data["type_name"]);
                $material = $this->escape_string($data["material"]);
                $level = $this->escape_string($data["level"]);
                $volume = $data["volume"];
                $workset = $data["workset"];
                $family_name = $this->escape_string($data["family_name"]);
                $element_id = $data["element_id"];

                DB::insert("CALL beam_insert_procedure($item_id,$element_id,'$type_name','$material','$level',$volume,'$family_name','$workset',$version_id,$version_number)");

            }

       }catch(Exception $e){
           print_r($e->getMessage());
       }

    }

    public function SaveFloor($save_list,$version_id,$item_id,$version_number){
        
       try{
           $save_element_id = array_column($save_list,"element_id");
         
           $current_ver_ids = ($save_element_id == "") ? "'"."ALL_UNCHECK"."'" : "'" . implode ( "', '", $save_element_id ) . "'";//convert array to string with single code
           $select_deleted_query = "SELECT element_id FROM tb_forge_floor WHERE item_id = $item_id AND version_number < $version_number
                                    AND element_id NOT IN($current_ver_ids)";

           $deleted_elements = DB::select($select_deleted_query);

            if(sizeof($deleted_elements) > 0){               
                foreach($deleted_elements as $deleted_id){
                   
                    $ele_id = $deleted_id->element_id;
                    $insert_ids_query = "INSERT IGNORE INTO tb_forge_floor_deleted (id,element_id,item_id,version_id,version_number)
                                        SELECT MAX(id) +1,$ele_id,$item_id,$version_id,$version_number FROM tb_forge_floor_deleted";
                    DB::insert($insert_ids_query);
                }               
            }

            foreach($save_list as $data){
                $type_name = $this->escape_string($data["type_name"]);
                $material = $this->escape_string($data["material"]);
                $level = $this->escape_string($data["level"]);
                $volume = $data["volume"];
                $workset = $data["workset"];
                $family_name = $this->escape_string($data["family_name"]);
                $element_id = $data["element_id"];

                DB::insert("CALL floor_insert_procedure($item_id,$element_id,'$type_name','$material','$level',$volume,'$family_name','$workset',$version_id,$version_number)");

            }

       }catch(Exception $e){
           print_r($e->getMessage());
       }
        
    }
    
    public function SaveWall($save_list,$version_id,$item_id,$version_number){
        
        try{
            $save_element_id = array_column($save_list,"element_id");
          
            $current_ver_ids = ($save_element_id == "") ? "'"."ALL_UNCHECK"."'" : "'" . implode ( "', '", $save_element_id ) . "'";//convert array to string with single code
            $select_deleted_query = "SELECT element_id FROM tb_forge_wall WHERE item_id = $item_id AND version_number < $version_number
                                     AND element_id NOT IN($current_ver_ids)";
 
            $deleted_elements = DB::select($select_deleted_query);
 
             if(sizeof($deleted_elements) > 0){               
                 foreach($deleted_elements as $deleted_id){
                    
                     $ele_id = $deleted_id->element_id;
                     $insert_ids_query = "INSERT IGNORE INTO tb_forge_wall_deleted (id,element_id,item_id,version_id,version_number)
                                         SELECT MAX(id) +1,$ele_id,$item_id,$version_id,$version_number FROM tb_forge_wall_deleted";
                     DB::insert($insert_ids_query);
                 }               
             }
                    
             foreach($save_list as $data){
                 $type_name = $this->escape_string($data["type_name"]);
                $material = $this->escape_string($data["material"]);
                $level = $this->escape_string($data["level"]);
                $volume = $data["volume"];
                $workset = $data["workset"];
                $family_name = $this->escape_string($data["family_name"]);
                $element_id = $data["element_id"];
 
                 DB::insert("CALL wall_insert_procedure($item_id,$element_id,'$type_name','$material','$level',$volume,'$family_name','$workset',$version_id,$version_number)");
 
             }

        }catch(Exception $e){
            print_r($e->getMessage());
        }
    }

    public function SaveFoundation($save_list,$version_id,$item_id,$version_number){
        
        try{
            $save_element_id = array_column($save_list,"element_id");
          
            $current_ver_ids = ($save_element_id == "") ? "'"."ALL_UNCHECK"."'" : "'" . implode ( "', '", $save_element_id ) . "'";//convert array to string with single code
            $select_deleted_query = "SELECT element_id FROM tb_forge_foundation WHERE item_id = $item_id AND version_number < $version_number
                                     AND element_id NOT IN($current_ver_ids)";
 
            $deleted_elements = DB::select($select_deleted_query);
 
             if(sizeof($deleted_elements) > 0){               
                 foreach($deleted_elements as $deleted_id){
                    
                     $ele_id = $deleted_id->element_id;
                     $insert_ids_query = "INSERT IGNORE INTO tb_forge_foundation_deleted (id,element_id,item_id,version_id,version_number)
                                         SELECT MAX(id) +1,$ele_id,$item_id,$version_id,$version_number FROM tb_forge_foundation_deleted";
                     DB::insert($insert_ids_query);
                 }               
             }

             foreach($save_list as $data){
                $type_name = $this->escape_string($data["type_name"]);
                $material = $this->escape_string($data["material"]);
                $level = $this->escape_string($data["level"]);
                $volume = $data["volume"];
                $workset = $data["workset"];
                $family_name = $this->escape_string($data["family_name"]);
                $element_id = $data["element_id"];
 
                 DB::insert("CALL foundation_insert_procedure($item_id,$element_id,'$type_name','$material','$level',$volume,'$family_name','$workset',$version_id,$version_number)");
 
             }
        }catch(Exception $e){
            print_r($e->getMessage());
        }
         
    }

    
    public function SaveColumnTekkin($save_list,$version_id,$item_id,$version_number){
        
        try{
           
             foreach($save_list as $data){
                 $W = $data["W"];
                 $D = $data["D"];
                 $volume = $data["volume"];
                 $level = $data["level"];
                 $start_diameter =$data["start_diameter"]; 
                 $start_X_firstRowCount =$data["start_X_firstRowCount"];
                 $start_X_secondRowCount = $this->escape_string($data["start_X_secondRowCount"]);
                 $start_Y_firstRowCount = $data["start_Y_firstRowCount"];
                 $start_Y_secondRowCount = $data["start_Y_secondRowCount"];
                 $start_rib_diameter = $this->escape_string($data["start_rib_diameter"]);
                 $start_rib_pitch = $data["start_rib_pitch"];

                 $end_diameter =$data["end_diameter"]; 
                 $end_X_firstRowCount =$data["end_X_firstRowCount"];
                 $end_X_secondRowCount = $this->escape_string($data["end_X_secondRowCount"]);
                 $end_Y_firstRowCount = $data["end_Y_firstRowCount"];
                 $end_Y_secondRowCount = $data["end_Y_secondRowCount"];
                 $end_rib_diameter = $this->escape_string($data["end_rib_diameter"]);
                 $end_rib_pitch = $data["end_rib_pitch"];
                 $element_id = $data["element_id"];
 
                 $query = "INSERT IGNORE INTO tb_forge_column_tekkin
                 (id,item_id,element_id,W,D,volume,level,start_diameter,start_X_firstRowCount,start_X_secondRowCount,
                 start_Y_firstRowCount,start_Y_secondRowCount,start_rib_diameter,start_rib_pitch,
                 end_diameter,end_X_firstRowCount,end_X_secondRowCount,
                 end_Y_firstRowCount,end_Y_secondRowCount,end_rib_diameter,end_rib_pitch,version_id,version_number)
                 SELECT COALESCE(MAX(id), 0) + 1,$item_id,$element_id,'$W','$D','$volume','$level','$start_diameter','$start_X_firstRowCount','$start_X_secondRowCount',
                 '$start_Y_firstRowCount','$start_Y_secondRowCount','$start_rib_diameter','$start_rib_pitch',
                 '$end_diameter','$end_X_firstRowCount','$end_X_secondRowCount',
                 '$end_Y_firstRowCount','$end_Y_secondRowCount','$end_rib_diameter','$end_rib_pitch',$version_id,$version_number FROM tb_forge_column_tekkin
                 ON DUPLICATE KEY UPDATE
                 W = '$W',
                 D = '$D',
                 volume = '$volume',
                 level = '$level',
                 start_diameter = '$start_diameter',
                 start_X_firstRowCount = '$start_X_firstRowCount',
                 start_X_secondRowCount = '$start_X_secondRowCount',
                 start_Y_firstRowCount = '$start_Y_firstRowCount',
                 start_Y_secondRowCount = '$start_Y_secondRowCount',
                 start_rib_diameter = '$start_rib_diameter',
                 start_rib_pitch = '$start_rib_pitch',
                 end_diameter = '$end_diameter',
                 end_X_firstRowCount = '$end_X_firstRowCount',
                 end_X_secondRowCount = '$end_X_secondRowCount',
                 end_Y_firstRowCount = '$end_Y_firstRowCount',
                 end_Y_secondRowCount = '$end_Y_secondRowCount',
                 end_rib_diameter = '$end_rib_diameter',
                 end_rib_pitch = '$end_rib_pitch',
                 version_id = $version_id,
                 version_number = $version_number";
                
                DB::insert($query);

                //DB::insert("CALL column_insert_procedure($item_id,$element_id,'$type_name','$material','$level',$volume,'$family_name','$workset',$version_id,$version_number)");
                 
             }
 
        }catch(Exception $e){
            print_r($e->getMessage());
        }
         
    }
 
    public function SaveBeamTekkin($save_list,$version_id,$item_id,$version_number){
         
        try{
           
             foreach($save_list as $data){
                 $B = $data["B"];
                 $H = $data["H"];
                 $kattocho = $data["kattocho"];
                 $level = $data["level"];
                 $start_upper_diameter = $data["start_upper_diameter"];
                 $start_upper_firstRowCount = $data["start_upper_firstRowCount"];
                 $start_upper_secondRowCount = $data["start_upper_secondRowCount"];
                 $start_lower_diameter = $data["start_lower_diameter"];
                 $start_lower_firstRowCount = $data["start_lower_firstRowCount"];
                 $start_lower_secondRowCount = $data["start_lower_secondRowCount"];
                 $start_rib_diameter = $data["start_rib_diameter"];
                 $start_rib_count = $data["start_rib_count"];
                 $start_rib_pitch = $data["start_rib_pitch"];

                 $center_upper_diameter = $data["center_upper_diameter"];
                 $center_upper_firstRowCount = $data["center_upper_firstRowCount"];
                 $center_upper_secondRowCount = $data["center_upper_secondRowCount"];
                 $center_lower_diameter = $data["center_lower_diameter"];
                 $center_lower_firstRowCount = $data["center_lower_firstRowCount"];
                 $center_lower_secondRowCount = $data["center_lower_secondRowCount"];
                 $center_rib_diameter = $data["center_rib_diameter"];
                 $center_rib_count = $data["center_rib_count"];
                 $center_rib_pitch = $data["center_rib_pitch"];

                 $end_upper_diameter = $data["end_upper_diameter"];
                 $end_upper_firstRowCount = $data["end_upper_firstRowCount"];
                 $end_upper_secondRowCount = $data["end_upper_secondRowCount"];
                 $end_lower_diameter = $data["end_lower_diameter"];
                 $end_lower_firstRowCount = $data["end_lower_firstRowCount"];
                 $end_lower_secondRowCount = $data["end_lower_secondRowCount"];
                 $end_rib_diameter = $data["end_rib_diameter"];
                 $end_rib_count = $data["end_rib_count"];
                 $end_rib_pitch = $data["end_rib_pitch"];
                 $element_id = $data["element_id"];
                
                 $query = "INSERT  INTO tb_forge_beam_tekkin
                            (id,item_id,element_id,B,H,kattocho,level,start_upper_diameter,start_upper_firstRowCount,start_upper_secondRowCount,
                            start_lower_diameter,start_lower_firstRowCount,start_lower_secondRowCount,
                            start_rib_diameter,start_rib_count,start_rib_pitch,

                            center_upper_diameter,center_upper_firstRowCount,center_upper_secondRowCount,
                            center_lower_diameter,center_lower_firstRowCount,center_lower_secondRowCount,
                            center_rib_diameter,center_rib_count,center_rib_pitch,

                            end_upper_diameter,end_upper_firstRowCount,end_upper_secondRowCount,
                            end_lower_diameter,end_lower_firstRowCount,end_lower_secondRowCount,
                            end_rib_diameter,end_rib_count,end_rib_pitch,version_id,version_number)
                            SELECT COALESCE(MAX(id), 0) + 1,$item_id,$element_id,'$B','$H','$kattocho','$level','$start_upper_diameter','$start_upper_firstRowCount','$start_upper_secondRowCount',
                            '$start_lower_diameter','$start_lower_firstRowCount','$start_lower_secondRowCount',
                            '$start_rib_diameter','$start_rib_count','$start_rib_pitch',

                            '$center_upper_diameter','$center_upper_firstRowCount','$center_upper_secondRowCount',
                            '$center_lower_diameter','$center_lower_firstRowCount','$center_lower_secondRowCount',
                            '$center_rib_diameter','$center_rib_count','$center_rib_pitch',

                            '$end_upper_diameter','$end_upper_firstRowCount','$end_upper_secondRowCount',
                            '$end_lower_diameter','$end_lower_firstRowCount','$end_lower_secondRowCount',
                            '$end_rib_diameter','$end_rib_count','$end_rib_pitch',$version_id,$version_number FROM tb_forge_beam_tekkin
                            ON DUPLICATE KEY UPDATE
                            B = '$B',
                            H = '$H',
                            kattocho = '$kattocho',
                            level = '$level',
                            start_upper_diameter = '$start_upper_diameter',
                            start_upper_firstRowCount = '$start_upper_firstRowCount',
                            start_upper_secondRowCount = '$start_upper_secondRowCount',
                            start_lower_diameter = '$start_lower_diameter',
                            start_lower_firstRowCount = '$start_lower_firstRowCount',
                            start_lower_secondRowCount = '$start_lower_secondRowCount',
                            start_rib_diameter = '$start_rib_diameter',
                            start_rib_count = '$start_rib_count',
                            start_rib_pitch = '$start_rib_pitch',

                            center_upper_diameter = '$center_upper_diameter',
                            center_upper_firstRowCount = '$center_upper_firstRowCount',
                            center_upper_secondRowCount = '$center_upper_secondRowCount',
                            center_lower_diameter = '$center_lower_diameter',
                            center_lower_firstRowCount = '$center_lower_firstRowCount',
                            center_lower_secondRowCount = '$center_lower_secondRowCount',
                            center_rib_diameter = '$center_rib_diameter',
                            center_rib_count = '$center_rib_count',
                            center_rib_pitch = '$center_rib_pitch',

                            end_upper_diameter = '$end_upper_diameter',
                            end_upper_firstRowCount = '$end_upper_firstRowCount',
                            end_upper_secondRowCount = '$end_upper_secondRowCount',
                            end_lower_diameter = '$end_lower_diameter',
                            end_lower_firstRowCount = '$end_lower_firstRowCount',
                            end_lower_secondRowCount = '$end_lower_secondRowCount',
                            end_rib_diameter = '$end_rib_diameter',
                            end_rib_count = '$end_rib_count',
                            end_rib_pitch = '$end_rib_pitch',
                            version_id = $version_id,
                            version_number = $version_number";

                 DB::insert($query);
 
                 //DB::insert("CALL beam_insert_procedure($item_id,$element_id,'$type_name','$material','$level',$volume,'$family_name','$workset',$version_id,$version_number)");
 
             }
 
        }catch(Exception $e){
            print_r($e->getMessage());
        }
 
    }

    public function SaveFoundationTekkin($save_list,$version_id,$item_id,$version_number){
        
        try{
           
             foreach($save_list as $data){
                $D = $data["D"];
                $H = $data["H"];
                $W = $data["W"];
                $level = $data["level"];
                $upper_X_diameter = $data["upper_X_diameter"];
                $upper_X_count = $data["upper_X_count"];
                $upper_Y_diameter = $data["upper_Y_diameter"];
                $upper_Y_count = $data["upper_Y_count"];
                $lower_X_diameter = $data["lower_X_diameter"];
                $lower_X_count = $data["lower_X_count"];
                $lower_Y_diameter = $data["lower_Y_diameter"];
                $lower_Y_count = $data["lower_Y_count"];
                $element_id = $data["element_id"];

                $query = "INSERT  INTO tb_forge_foundation_tekkin
                (id,item_id,element_id,D,H,W,level,upper_X_diameter,upper_X_count,upper_Y_diameter,upper_Y_count
                ,lower_X_diameter,lower_X_count,lower_Y_diameter,lower_Y_count,version_id,version_number)
                SELECT COALESCE(MAX(id), 0) + 1,$item_id,$element_id,'$D','$H','$W','$level','$upper_X_diameter','$upper_X_count','$upper_Y_diameter','$upper_Y_count'
                ,'$lower_X_diameter','$lower_X_count','$lower_Y_diameter','$lower_Y_count',$version_id,$version_number FROM tb_forge_foundation_tekkin
                ON DUPLICATE KEY UPDATE 
                D = '$D',
                H = '$H',
                W = '$W',
                level = '$level',
                upper_X_diameter ='$upper_X_diameter',
                upper_X_count = '$upper_X_count',
                upper_Y_diameter = '$upper_Y_diameter',
                upper_Y_count = '$upper_Y_count',
                lower_X_diameter = '$lower_X_diameter',
                lower_X_count = '$lower_X_count',
                lower_Y_diameter = '$lower_Y_diameter',
                lower_Y_count = '$lower_Y_count',
                version_id = $version_id,
                version_number = $version_number";
 
                 DB::insert($query);
                 
             }
 
        }catch(Exception $e){
            print_r($e->getMessage());
        }
         
    }
}
