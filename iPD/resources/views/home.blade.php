@extends('layouts.baselayout')

@section('head')
<style>


ul{
    list-style: square;      
}
ul li{
    margin-top:12px;       
}
ul h4{
   font-weight:bold;
   color:#002b80;
}
ul ul{
    list-style:none;    
}
ul li a{
    color:black;
}
#prjTitle{
    color:#002b80;
    font-weight:bold;
    padding: 3% 0 0 0;
}
</style>
@endsection

@section('content')
<div class="main-content">
    <div class="row">
        <div class ="col-xs-4 outerBorder">
            <h4 id="prjTitle">プロジェクト一覧</h4>
            @if (count($projects) > 0 && Session::has('authCode'))
            <ul>
            @foreach($projects as $project)
            <li>{{ $project["name"] }}</li>
            @endforeach
            </ul>       
            @endif
        </div>
        <div class ="col-xs-7 outerBorder" style="margin-left:3%;padding-top:3%;">
           <ul class="col-xs-3">
            <li><h4>分析</h4></li>
             <ul>
                <li><a href="{{ url('forge/index') }}">データ容量表示</a></li>
                <li><a href="{{ url('forge/volumeChart') }}">マテリアル容積表示</a></li>
                <li><a href="{{ url('roomProp/index') }}">部屋情報表示</a></li>
                <li><a href="{{ url('forge/tekkin') }}">鉄筋重量表示</a></li>
                <li><a href="{{ url('dataPortal/index') }}">データポータル</a></li>
             </ul>
           </ul>

           <ul class="col-xs-4">
            <li><h4>データベース</h4></li>
             <ul>
                <li><a href="#">クレーン情報検索</a></li>
                <li><a href="#">クレーン情報登録</a></li>
                <li><a href="#">プロジェクト作成</a></li>
                <li><a href="#">部屋情報登録</a></li>
                <li><a href="#">構造タイプ登録</a></li>
                <li><a href="#">ファミリブラウザ</a></li>
                <li><a href="#">データ読み込み</a></li>
             </ul>          
           </ul>

           <ul class="col-xs-4">
            <li><h4>ユーザー情報</h4></li> 
             <ul>
                <li><a href="#">モデル変更履歴</a></li>              
             </ul>          
           </ul>

           <ul class="col-xs-4">
            <li><h4>ストレージ</h4></li> 
             <ul>
                <li><a href="#">バックアップ設定</a></li>              
             </ul>          
           </ul>

           <ul class="col-xs-4">
            <li><h4>セキュリティ</h4></li> 
             <ul>
                <li><a href="{{ url('admin/index') }}">権限設定</a></li>
                <li><a href="{{ url('user/index') }}">ユーザー作成</a></li>              
             </ul>          
           </ul>

        <div>
    </div>
</div>
@endsection