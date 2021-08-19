<?php

namespace App\Http\Controllers;
use App\Models\ForgeModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class ForgeController extends Controller 
{
    function index()
    {
        return view('forge');
    }
    
    function ShowVolumePage(){
        return view('forge_volume');
    }

    function ShowTekkin(){
        return view('tekkin');
    }
    
    function GetThreeLeggedToken(Request $request){
        
        $forgeBtnText = $request->get('btnText');
       //return $forgeBtnText;
        if(strstr($forgeBtnText,"LOGOUT") == true){
            session()->forget('authCode');
            return "FORGE LOGIN AGAIN";
        }
        
        $conf = new \Autodesk\Auth\Configuration();//escape from current name space by using '\'
        $conf->getDefaultConfiguration()
        ->setClientId('LHrkbXlgUiwuHZD9SGkAOMg8lrLvxfY0')
        ->setClientSecret('m3qAIjtSQOS9xRbJ')
        ->setRedirectUrl('http://54.92.96.44/iPD/forge/callback');
       
        $threeLeggedAuth = new \Autodesk\Auth\OAuth2\ThreeLeggedAuth();     
        $scopes = array("code:all","data:read","data:write","bucket:read","bucket:update");
        $threeLeggedAuth->addScopes($scopes);

        try{
            $authUrl = $threeLeggedAuth->createAuthUrl();
            return $authUrl;
        }catch(Exception $e){
            return $e->getMessage();
        }      
      
    }

    function ForgeCallBack(){
        $url = parse_url($_SERVER['REQUEST_URI']);
        $codeString = explode('=',$url['query']);
        $authCode = $codeString[1];
        session(['authCode' =>$authCode]);
        return redirect('login/successlogin');
    }

    function GetData(Request $request){
        $message = $request->get('message');
        $forge = new ForgeModel();
        if($message == "getComboData"){        
            $projects = $forge->GetProjects();
            $items = $forge->GetItems();
            $versions = $forge->GetVersions();
            return array("projects"=>$projects,"items"=>$items,"versions"=>$versions);
        }else if($message == "getDataByVersion"){
            $version_number = $request->get('version_number');
            $version_id = $request->get('id');
            $item_id = $request->get('item_id');
            $category_list = $request->get('category_list');
            $material_list = $request->get('material_list');
            $workset_list = $request->get('workset_list');
            $level_list = $request->get('level_list');
            $familyName_list = $request->get('familyName_list');
            $typeName_list = $request->get('typeName_list');
            $typeName_filter = $request->get('typeName_filter');
            // print_r($category_list);exit;
            $data = $forge->GetDataByVersion($version_number,$version_id,$item_id,$category_list,$material_list,$workset_list,$level_list,$familyName_list,$typeName_list,$typeName_filter);
            return $data;
        }else if($message == "getComboDataByProject"){
            $projectName = $request->get('projectName');
            $items = $forge->GetItemsByProject($projectName);
            $versions = $forge->GetVersionsByProject($projectName);
            $materails = $forge->GetMaterailsByProject($projectName);
            $worksets = $forge->GetWorksetsByProject($projectName);
            $levels = $forge->GetLevelsByProject($projectName);
            $FamilyNames = $forge->GetFamilyNamesByProject($projectName);
            $TypeNames = $forge->GetTypeNamesByProject($projectName);
            return array("items"=>$items,"versions"=>$versions,"levels"=>$levels,"worksets"=>$worksets,"materials"=>$materails,"familyNames"=>$FamilyNames,"typeNames"=>$TypeNames);
        }else if($message == "getTekkinData"){

            $item_id = $request->get('item_id');
            $category_list = $request->get('category_list');
            //print_r($category_list);exit;
            $data = $forge->GetTekkinData($item_id,$category_list);
            return $data;
        }
    }

    function SaveData(Request $request){
        $message = $request->get('message');
        if($message == "update_project_auto_save"){
            $updateProjects = $request->get('projects');
            $backupProjects = $request->get('backupProjects');
            $forge = new ForgeModel();
            $result = $forge->UpdateProjectAutoSaveFlag($updateProjects,$backupProjects);
            return $result;
        }
    }
    
    
}
