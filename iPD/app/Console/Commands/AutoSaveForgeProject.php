<?php

namespace App\Console\Commands;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Command;

class AutoSaveForgeProject extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forge:save';

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
        $this->GetForgeProjects();
         //DB::table('tb_project')->delete();
    }
    function GetForgeProjects(){
        $conf = new \Autodesk\Auth\Configuration();//escape from current name space by using '/'
        $conf->getDefaultConfiguration()
         ->setClientId('J0jduCzdsYAbKXqsidxCBt3aWpW5DNv0')
        ->setClientSecret('Hp8X9pxKgYjqJYGE');//bim360local App

        $authObj = new \Autodesk\Auth\OAuth2\TwoLeggedAuth();
        $scopes = array("code:all","data:read","data:write","bucket:read");
        $authObj->setScopes($scopes);
        $hierarchyArray=  array();
        $projectArray=  array();
        $versionArray =  array();

        $authObj->fetchToken();
        $token = $authObj->getAccessToken();
        $_SESSION['token'] = $token;
        //get Hubs
        $hubInstance = new \Autodesk\Forge\Client\Api\HubsApi($authObj);
        try {
            $index =0;
            $hubs = $hubInstance->getHubs(null, null);
            $hubObj = $hubs['data'];

            //$dbProjects = $this->GetRelatedProjects();
            //$relatedProjects = array_column($dbProjects,"project_name");//array value by given name   

            foreach($hubObj as $hub){
                $hubId = $hub['id'];
                $hubName = $hub['attributes']['name'];
                if($hubName == "OBAYASHI")continue;
                          
                $projectInstance = new \Autodesk\Forge\Client\Api\ProjectsApi($authObj);
                $folderIns = new \Autodesk\Forge\Client\Api\FoldersApi($authObj);
                $itemIns = new \Autodesk\Forge\Client\Api\ItemsApi($authObj);
                $apiInstance = new \Autodesk\Forge\Client\Api\VersionsApi($authObj);
                
                $projects = $projectInstance->getHubProjects($hubId, null, null);                
                $proObj = $projects['data'];

                foreach($proObj as $project){
                
                    $proId = $project['id'];
                    $projectName = $project['attributes']['name'];
                   // if(!in_array($projectName,$relatedProjects))continue;
                    //if(strstr($projectName,"大手前学園さくら夙川") == false)continue;
                    $this->SaveProject($projectName,$proId);//save project

                    //$hierarchyArray[$projectName] = array("hubId"=>$hubId,"projectId"=>$proId);

                    $topFolders = $projectInstance->getProjectTopFolders($hubId, $proId);
                    $topFolderData = $topFolders['data'];            
                     foreach($topFolderData as $topfolder){  
                         $topFolderId = $topfolder['id'];
                         $folderName = $topfolder['attributes']['display_name'];
                         
                         if($folderName == "Shared" || $folderName == "Consumed")continue;   
                         $items = $folderIns->getFolderContents($proId, $topFolderId, null, null, null, null,null);
                         $itemsData = $items['data']; 
                         
                         foreach($itemsData as $item){
                            $itemArray=array();
                           // print_r($item['attributes']['display_name']."=>".$item['type']."\n");
                            if($item['type'] == "folders"){
                                if($item['attributes']['display_name'] == "Shared" || $item['attributes']['display_name'] == "Consumed")continue;   
                               
                                $folderId = $item['id'];
                                $tempData = $folderIns->getFolderContents($proId, $folderId, null, null, null, null,null);
                                $data = $tempData['data'];                   
                                foreach($data as $d){                           
                                    if($d['type'] == "folders"){
                                        if($d['attributes']['display_name'] == "Shared" || $d['attributes']['display_name'] == "Consumed")continue;   
                                        $folderId2 = $d['id'];
                                        $tempData2 = $folderIns->getFolderContents($proId, $folderId2, null, null, null, null,null);
                                        $data2 = $tempData2['data'];
                                        foreach($data2 as $d2){
                                            if($d2['type'] == "folders"){
                                                $folderId3 = $d2['id'];
                                                $tempData3 = $folderIns->getFolderContents($proId, $folderId3, null, null, null, null,null);
                                                $data3 = $tempData3['data'];
                                                foreach($data3 as $d3){
                                                    if($d3['type'] == "items"){
                                                        $itemName = $d3['attributes']['display_name'];
                                                        if(strpos($itemName, '.rvt') == true && strstr($itemName,"cen") == true){
                                                            $itemId = $d3['id']; 
                                                            $itemArray[$itemName] = array("itemId"=>$itemId,"projectName"=>$projectName);
                                                        }                                                      
                                                   }
                                                }
                                            }else if ($d2['type'] == "items"){
                                                $itemName = $d2['attributes']['display_name'];
                                                if(strpos($itemName, '.rvt') == true && strstr($itemName,"cen")== true){
                                                    $itemId = $d2['id']; 
                                                    $itemArray[$itemName] = array("itemId"=>$itemId,"projectName"=>$projectName);
                                                }
                                                
                                            }
                                        }
                                    }else if($d['type'] == "items"){
                                        $itemName = $d['attributes']['display_name'];
                                        if(strstr($itemName, '.rvt') == true && strstr($itemName,"cen")== true){
                                            $itemId = $d['id']; 
                                            $itemArray[$itemName] = array("itemId"=>$itemId,"projectName"=>$projectName);
                                        }
                                        
                                    }
                                }
                                                            
                            }else if($item['type'] == "items"){
    
                                $itemName = $item['attributes']['display_name'];                              
                                if(strpos($itemName, '.rvt') == true && strstr($itemName,"cen") == true){
                                    $itemId = $item['id']; 
                                    $itemArray[$itemName] = array("itemId"=>$itemId,"projectName"=>$projectName);
                                }                       
                            } 

                            if(sizeof($itemArray) > 0){
                                $this->SaveItem($itemArray);//save item to Database
                                foreach($itemArray as $key=>$item){
                                    $itemName = $key;
                                    $itemId = $item["itemId"];
                                    $versions = $itemIns->getItemVersions($proId, $itemId, null, null, null, null, null, null);
                                    $allVersion = $versions['data'];
                                    $versionArray= array();
                                    foreach($allVersion as $version){ 
                                        $docVersion = $version['attributes']['version_number'];   
                                        $versionId = $version['id'];    
                                        $storageSize = empty($version['attributes']['storage_size'])? 0 : $version['attributes']['storage_size'] ;                                                    
                                        $versionArray[$versionId]= array("itemName"=>$itemName,"versionNumber"=>$docVersion,"storageSize"=>$storageSize);                           
                                    }
                                    if(sizeof($versionArray) > 0){
                                        $this->SaveVersion($versionArray);
                                    }
                                }
                            }
                            
                        }                       
                    }  
                }             
            }

        } catch (Exception $e) {
            echo 'Exception when calling forge library function : ', $e->getMessage(), PHP_EOL;
        }
    }

    function SaveProject($projectName,$projectId){
        $query = "INSERT IGNORE INTO tb_project(id,name,forge_project_id) 
                  SELECT MAX(id) +1,'$projectName','$projectId' FROM tb_project";//IGNORE when key duplicate
        DB::insert($query);
    }

    function SaveItem($itemArray){
        foreach($itemArray as $key=>$item){
            $itemName = $key;
            $itemId = $item["itemId"];
            $projectName = $item["projectName"];
            $query = "INSERT IGNORE INTO tb_forge_item(id,name,project_id,forge_item_id) 
                        SELECT MAX(id) +1,'$itemName',(SELECT id FROM tb_project WHERE name ='$projectName'),'$itemId' FROM tb_forge_item";//IGNORE when key duplicate
            DB::insert($query);
        }
            
    }

    function SaveVersion($versionArray){
        foreach($versionArray as $key=>$version){
            $versionId = $key;
            $versionNumber = $version["versionNumber"];
            $storageSize = $version["storageSize"];
            $itemName = $version["itemName"];
            $query = "INSERT IGNORE INTO tb_forge_version(id,item_id,forge_version_id,version_number,storage_size) 
                        SELECT MAX(id) +1,(SELECT id FROM tb_forge_item WHERE name ='$itemName'),'$versionId',$versionNumber,$storageSize FROM tb_forge_version";//IGNORE when key duplicate
            DB::insert($query);
        }
            
    }

    function GetRelatedProjects(){
        $query = "SELECT DISTINCT(project_name) FROM tb_forge_project";       
        $result = DB::select($query);
        return json_decode(json_encode($result),true);//change array object to array
    }
}
