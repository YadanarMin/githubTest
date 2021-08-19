@extends('layouts.baselayout')

@section('head')
<script type="text/javascript" src="../public/js/jquery-ui.min.js"></script>
<script type="text/javascript" src="../public/js/jquery.multiselect.js"></script>
<script type="text/javascript" src="../public/js/user.js"></script>
<script src='https://kit.fontawesome.com/a076d05399.js'></script>
<style>
.marginAdjust{
    margin-left:12%;
    width:60%;
    min-height:70vh;   
    border:none;
}
#tblCreateUser td{
    padding-top:20px; 
    
    color:blue;
}
#tblCreateUser{
   width:80%;

}
#tblUser{
    width:80%;
    margin:1% 0 0 0;
}
#tblUser td:last-child{
    text-align:center;
}
input[type="checkbox"]{
    width:30%;
    height:20px;
}
.outerBorder{
    border:none;
}

</style>
@endsection

@section('content')
<div class="main-content marginAdjust" >  
    <div id="searchDiv">
        <h4 class="titleDesign pageTitle">ユーザー設定 </h4>             
       
        <input type="button" class="btn btnDesign" name="btnCreateUserPopup" id="btnCreateUserPopu" value="新規ユーザー作成" onClick="DisplayPopup();" style="float:right;margin:0;"/>
    </div>  
    <div class="outerBorder">
        <table id="tblUser">
            <tr>
                <th width="30%;">ユーザー名</th>
                <th width="25%">パスワード</th>
                <th width="22%">権限</th>
                <th width="10%">編集</th>
            </tr> 
            @if (count($users) > 0)
            @foreach($users as $user)
            <tr>
                <td>{{ $user["name"] }}</td>
                <td>{{ $user["password"] }}</td>
                <td>
                    @if($user["authority"] == 1)
                        {{"管理者"}}
                    @else
                        {{"メンバー"}}
                    @endif
                </td>
                <td><a href="javascript:void(0)" onClick="DisplayPopup({{$user['id']}});"><i class='far fa-edit' style='font-size:25px'></i></a></td>
            </tr>  
            @endforeach  
            @endif           
        </table> 
        
        

       
    </div>
    

</div>

<!-- popup -->
<div id="createUser" class="popupOverlay">
	<div class="popup popupSize">
		<div class="popupHeader">
            <a class="close" href="javascript:void(0);" onClick ="ClosePopup()" style="top:2px;">&times;</a><br>
			<h4 class="titleDesign">ユーザー作成</h4>
			
		</div>
		<div align="center">			
            <form name="createUserForm" method="post">
            <table id="tblCreateUser">
                <tr>
                    <td width="30%">ユーザー名 : </td>
                    <td ><input type="text" class="form-control" name="txtName" id="txtName"/></td>
                </tr>
                <tr>
                    <td>パスワード : </td>
                    <td><input type="password" class="form-control" name="txtPassword" id="txtPossword"/></td>
                </tr>
                <tr>
                    <td>管理者にする : </td>
                    <td><input type="checkbox"  name="chkAuthority" id="chkAuthority"/> </td>
                </tr> 
                <tr>
                    <td>メールアドレス : </td>
                    <td><input type="text" class="form-control" name="txtEmail" id="txtEmail"/></td>
                </tr>
                <tr>
                    <td>電話番号 : </td>
                    <td><input type="text" class="form-control" name="txtPhone" id="txtPhone"/></td>
                </tr>
                
                <tr>
                    <td>住所 : </td>
                    <td><textarea class="form-control md-textarea" name="txtAddress" id="txtAddress" rows="3"></textarea></td>
                </tr>                                      
            </table>
            <div id="btnGroup">
                <input type="submit" class="btn btnDesign" name="btnCreateUser" value="作成" onClick="CreateUser();"/>
                <input type="button" class="btn btnDesign" name="btnCancel" id="btnCancel" value="キャンセル" onClick="ClosePopup();"/>
            </div>
            </form>   		
        </div>       		
	</div>
</div> 
@endsection