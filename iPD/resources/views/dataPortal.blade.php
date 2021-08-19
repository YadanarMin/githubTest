@extends('layouts.baselayout')

@section('head')
<script type="text/javascript" src="../public/js/jquery-ui.min.js"></script>
<script type="text/javascript" src="../public/js/jquery.multiselect.js"></script>
<link rel="stylesheet" href="../public/css/jquery.multiselect.css">
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<style>
.dataPortal-content{  
    /*height:82vh;*/
    width:88%;
    margin:10vh 0% 4% 6%;
}
#dataPortal-showcase{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.dataPortal-template{
    width: 250px;
    height:150px;
    margin:0px 7px 28px 7px;
    border-radius:4px;
    min-width:200px;
    max-width:300px;
    cursor: pointer;
    /*color: #337ab7;*/
    /*border: solid 2px #337ab7;*/
    box-shadow: 0px 0px 0px 1px #dadce0;
    
    /*後で削除する*/
    text-align: center;
}
.dataPortal-template-title{
    color: #424242;
    font: 800 14px Roboto;
}
.dataPortal-template:hover {
    /*background: #337ab7;*/
    /*color: white;*/
}
</style>
@endsection

@section('content')
<div class="dataPortal-content main-content">

    <h3>Data Portal</h3>
    <div id="dataPortal-showcase">
        <!--<div class="dataPortal-template" onclick="window.location='{{ url("dataPortal/projectOverview") }}'">-->
        <div class="dataPortal-template">
            <h4>iPD Project Overview</h4>
        </div>
        <div class="dataPortal-template" onclick="window.location='{{ url("dataPortal/searchConsole") }}'">
            <div style="width:100%;height:110px;min-width:200px;max-width:300px;">
                <img src="../public/image/searchConsoleResultSample.png" alt="検索結果サンプル">
            </div>
            <div class="dataPortal-template-title" style="width:100%;text-align:left;padding:10px 14px 0px 14px;">Project Search Console</div>
        </div>
    </div>

</div>
@endsection