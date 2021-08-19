@extends('layouts.baselayout')

@section('head')
<script type="text/javascript" src="../public/js/jquery-ui.min.js"></script>
<script type="text/javascript" src="../public/js/jquery.multiselect.js"></script>
<script type="text/javascript" src="../public/js/roomProp.js"></script>
<link rel="stylesheet" href="../public/css/jquery.multiselect.css">
<link rel="stylesheet" href="../public/css/roomProp.css">
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<style>
#roomPieChartDiv{
    margin-bottom:9vh;
}
</style>
@endsection

@section('content')
<div class="roomProp-panel">

    <h3>Forge Room Properties Chart</h3>
    <div style="display:flex;">  
        <select id="project"  multiple>
        </select>&nbsp;&nbsp;&nbsp;

        <select id="item" multiple > 
        </select>&nbsp;&nbsp;&nbsp;

        <select id="version" multiple >
        </select>&nbsp;&nbsp;&nbsp;
        <input type="button" name="btnChartDisplay" id="btnChartDisplay" value="チャート"onClick="GetRoomProperties()"/>
    </div>
    <div id="roomPieChartDiv">
    </div>
    
</div>
@endsection