@extends('layouts.baselayout')

@section('head')
<script type="text/javascript" src="../public/js/jquery-ui.min.js"></script>
<script type="text/javascript" src="../public/js/jquery.multiselect.js"></script>
<script type="text/javascript" src="../public/js/script.js"></script>
<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>
<style>
#borderAdjust{
    min-height:80vh;
    border:none;
}
#tblSetting{
    width:60%;
    margin:1% 0 0 5%;
}
#tblSetting th{
    padding:10px 0 10px 0;/*TRBL*/
    background-color:#002b80;
    color:white;
    border:1px solid;
    text-align:center;
}
#tblSetting td{
    padding-bottom:5px;
    text-align:center;
}
#tblSetting td:first-child{
    text-align:left;
    padding-left:10px;
}

#searchDiv input[type="button"]{
    background-color:#002b80;
    border:1px solid #002b80;
    color:white;
    width:100px;
    height:30px;
    border-radius:3px;
    float:right; 
     
}
#searchDiv{
    width:80%;
    margin:0 0 0 5%;
}
.form-control{
    width:50%;
    background-color:none;
}

/* Bootstrap 3 text input with search icon */
.has-search .form-control-feedback {
    color: #ccc;
    margin-bottom:-34px;
}
.has-search .form-control {
    padding-right: 12px;
    padding-left: 34px;
}
.glyphicon{
    position:static;  
}

</style>
@endsection

@section('content')
<div class="main-content">

    <div id="searchDiv">
        <h4>Admin Setting Page</h4>             
        <div class="form-group has-search">
            <span class="glyphicon glyphicon-search form-control-feedback"></span>
            <input type="text" class="form-control" id="txtSearch" placeholder="プロジェクト検索">
        </div>
        <input type="button" name="btnSetting" value="保存" onClick="SaveAdminSetting();"/>
    </div>       
        
    <!--ngar ballo tg eight ngite naytarlal -->

    <div class="outerBorder" id="borderAdjust"> 
        <table id="tblSetting">
            <tr>
                <th width="45%;">プロジェクト名</th>
                <th>自動保存にする</th>
                <th>自動バックアップ</th>
            </tr>
            @if (count($projects) > 0 && Session::has('authCode'))
            @foreach($projects as $project)
            <tr>
                <td>{{ $project["name"] }}</td>
                <td><input type="checkbox" name="chkAutoSave" value="{{$project['id']}}" @if ($project['auto_save_properties'] == 1) checked @endif /></td>
                <td><input type="checkbox" name="chkBackup" value="{{$project['id']}}" @if ($project['auto_backup'] == 1) checked @endif/></td>
            </tr>  
            @endforeach  
            @endif  
        </table>           
       
    </div>
</div>
@endsection