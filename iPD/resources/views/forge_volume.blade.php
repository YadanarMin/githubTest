@extends('layouts.baselayout')

@section('head')
<script type="text/javascript" src="../public/js/jquery-ui.min.js"></script>
<script type="text/javascript" src="../public/js/jquery.multiselect.js"></script>
<script type="text/javascript" src="../public/js/forge.js"></script>
<link rel="stylesheet" href="../public/css/jquery.multiselect.css">
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<style>
#chartDiv{
    height:60vh;
}

#tblVersionData {
    width: 80%;
    margin-bottom:9vh;
}
#tblVersionData  td{
    padding-left:20px;
}
</style>
@endsection

@section('content')
<div class="main-content">

    <h3>Forge Material Volume Chart</h3>
    <div style="display:flex;">  
        <select id="project"  multiple>
        </select>&nbsp;&nbsp;&nbsp;

        <select id="item" multiple > 
        </select>&nbsp;&nbsp;&nbsp;

        <select id="version" multiple >
        </select>&nbsp;&nbsp;&nbsp;

        <select id="category" multiple >
            <option value="column">構造柱</option>
            <option value="beam">梁</option>
            <option value="floor">床</option>
            <option value="wall">壁</option>
            <option value="foundation">構造基礎</option>
        </select>&nbsp;&nbsp;&nbsp;
        
        <select id="material" multiple>
        </select>&nbsp;&nbsp;&nbsp;
        
        <select id="workset" multiple>
        </select>&nbsp;&nbsp;&nbsp;
        
        <input type="button" class="btn btn-primary" name="btnMaterialChartData" id="btnMaterialChartData" value="ShowData" onClick="DisplayVolumeData()"/>
    </div>
    <br>
    <table id="tblVersionData">
    </table>
    
   
</div>
@endsection