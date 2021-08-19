<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class RoomPropController extends Controller
{
    function index()
    {
        return view('roomProp');
    }

    function GetRoomProp(Request $request)
    {
        // print_r($request);return;
        
        $msg = $request->get('message');    // $msg = $_POST["message"];
        
        if(isset($msg)){
            if($msg == "getProperties"){
                $urn = $request->get('urn');    // $urn = $_POST["urn"];
                
                $conf = new \Autodesk\Auth\Configuration();//escape from current name space by using '/'
                $conf->getDefaultConfiguration()
                ->setClientId('Mt1Tul68redoV5OEMKwRh1aYQnsdmtJW')
                ->setClientSecret('8FOuOTPK6nOp4bOl');

                $authObj = new \Autodesk\Auth\OAuth2\TwoLeggedAuth();
                $scopes = array("code:all","data:read","data:write","bucket:read");
                $authObj->setScopes($scopes);
                
                $authObj->fetchToken();
                $token = $authObj->getAccessToken();
                $authObj->setAccessToken($token);

                $derivInst = new \Autodesk\Forge\Client\Api\DerivativesApi($authObj);
                try {
                    $metaDataObj = $derivInst->getMetadata(base64_encode($urn),null);
                    
                    // print_r($metaDataObj);exit;
                    
                    $metaData = $metaDataObj["data"]["metadata"];
                    
                    // print_r($metaData);exit;
                    
                    foreach($metaData as $mData){
                        if($mData["name"] != "新しい建設")continue;
                        $guid = $mData["guid"];
                        $viewTree = $derivInst->getModelviewMetadata(base64_encode($urn),$guid,null);
                        
                        // print_r($viewTree);exit;
                        
                        $hirechyData = $viewTree['data']['objects'];
                        
                        // print_r($hirechyData);exit;
        
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
                        
                        // print_r($roomIds);exit;

                        $properties = $derivInst->getModelviewProperties(base64_encode($urn),$guid,null);
                        
                        // print_r($properties);exit;
                        
                        $allProperties = $properties['data']['collection'];
                        
                        // echo json_encode($allProperties);exit;
                        // print_r($allProperties);exit;
                        
                        $allRooms = array();
                        foreach($roomIds as $rId){
                            foreach($allProperties as $p){
                                if($p['objectid'] == $rId){
                                    $p['properties'] = $p['properties']+ array('objectid' => $rId);
                                    //array_unshift($p['properties'],['objectid' => $rId]);
                                    array_push($allRooms,json_encode($p['properties']));
                                    break;
                                }
                            }
                        }
                        // print_r($allRooms);exit;
                        echo json_encode($allRooms);
                    }
                    //print_r($metaData);
                } catch (Exception $e) {
                    echo 'Exception when calling DerivativesApi->getModelviewMetadata: ', $e->getMessage(), PHP_EOL;
                }
            }
        }
    }
}


?>