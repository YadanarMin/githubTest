<?php

namespace App\Http\Controllers;
use App\Models\LoginModel;
use App\Models\ForgeModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class LoginController extends Controller
{
    function index()
    {
     return view('login');
    }
    function loginUser(){
        $login = new loginModel();
        $users = $login->GetAllUser();   
        return view('user')->with(["users"=>$users]);
    }

    function checklogin(Request $request)
    {
        $this->validate($request, [
            'username'   => 'required',
            'password'  => 'required'
        ]);

        $user_data = array(
            'name'  => $request->get('username'),
            'password' => $request->get('password')
        );
        
        $login = new LoginModel();
        // データ取得
        $result = $login->getData($user_data);
        if($result != null)
        {
            $userName = $result[0]->name;  
            session(['userName' =>$userName]);
        return redirect('login/successlogin');
        }
        else
        {
            return back()->with('error', 'Wrong Login Details');
        }

    }
    
    function successlogin()
    {
     if(session('userName')){ //check session data           
         $forge = new ForgeModel();
         $projects = $forge->GetProjects();
        return view('home')->with(["projects"=>$projects]);
     }else{
        
        return view('login');
     }
        
    }

    function logout()
    {
     session()->flush();//delete all session data
     return redirect('login');
    }

    function SaveLoginUserInfo(Request $request){        
        $postData = $request->form;
        $user_data = array();
        foreach($postData as $data){
            $key = $data['name'];//input textbox name
            $value = $data['value'];//input value
           $user_data[$key] = $value;
        }              

        $login = new LoginModel();
        $saveResult = $login->SaveLoginUser($user_data);
        
        return $saveResult;
    }
}
