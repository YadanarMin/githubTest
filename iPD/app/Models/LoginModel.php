<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
class LoginModel extends Model
{
    protected $table = 'tb_login';
    public function getData($params)
    {
      //using framework  
     /* $query = DB::table($this->table);   
      $query->where('name', $params['name']);
      $query->where('password', $params['password']);    
      $data = $query->distinct()->get(); */

      $query = "SELECT * FROM tb_login WHERE name = '$params[name]' AND password = '$params[password]'";
      $data = DB::select($query);
      
      return $data;
    }

    function GetAllUser(){
      $query = "SELECT * FROM tb_login";
      $data = DB::select($query);
      return json_decode(json_encode($data),true);
    }

    function GetUserById($userId){
      $query = "SELECT * FROM tb_login WHERE id = $userId";
      $data = DB::select($query);
      return json_decode(json_encode($data),true);
    }

   function SaveLoginUser($params){
     $name= $params['txtName'];
     $password = $params['txtPassword'];
     $email = $params['txtEmail'];
     $phone = $params['txtPhone'];
     $address = $params['txtAddress'];
     $authority = isset($params['chkAuthority']) ? 1 : 0; 
     try{
        $query = "INSERT INTO tb_login(id,name,password,email,phone,address,authority) 
                  SELECT MAX(id) +1,'$name','$password','$email','$phone','$address',$authority FROM tb_login
                  ON DUPLICATE KEY  UPDATE name='$name',password='$password',email='$email',phone='$phone',address='$address',authority = $authority ";
        DB::insert($query);
        return "success";
     }catch(Exception $e){
      return $e->getMessage();
     }
     
   }
}
