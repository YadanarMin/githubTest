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
</style>
@endsection

@section('content')
<div class="main-content">

    <h3>Forge Volume Chart</h3>
    <div style="display:flex;">  
        <select id="project"  multiple>
        </select>&nbsp;&nbsp;&nbsp;

        <select id="item" multiple > 
        </select>&nbsp;&nbsp;&nbsp;

        <select id="version" multiple >
        </select>&nbsp;&nbsp;&nbsp;
        <input type="button" name="btnChartDisplay" id="btnChartDisplay" value="チャート"onClick="DisplayVolumeChart()"/>
    </div>
    <div id="chartDiv">
    </div>
 
</div>
@endsection