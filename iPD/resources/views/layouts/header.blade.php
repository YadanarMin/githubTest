
<style>
.header{
position:fixed;
width: 100%;
top:0px !important;
left:0;
height:7vh;
text-align:center;
}
.header h3{ 
  color:#fff;
}
.body{
  font-family:Meriyo;
}
#loginUser{
  color:#fff;
}
#home-icon{
  font-size:0.7em;
  margin-top:-0.7em;
  padding:40px;
  background: url("../public/image/home.png") no-repeat;
}
</style>

<div class="header" style="background:linear-gradient(#707070 50%,#707070);border-bottom:1px solid #dadce0;">
<div style="width:3%;margin-top:20px;margin-left:10px;position:absolute;"><a href="{{ url('login/successlogin') }}"><img src="../public/image/home.png" style="width:30px;" /></a></div>
  <h3>Revit Web System</h3>
  
  <div style="float:right;margin:-35px 30px;">
    <span id="loginUser">
    @if(Session::has('userName'))
        {{Session::get('userName')}}
    @else
        {{''}}
    @endif
    </span>
    <button type="button" class="btn" onclick="window.location='{{ url("login/logout") }}'">
    @if(Session::has('userName'))
        LOGOUT
    @else
        LOGIN
    @endif
    </button>
    
    <button type="button" class="btn" id="btnForgeLogin" onclick="GetThreeLeggedAuth()">
    @if(Session::has('authCode'))
      FORGE LOGOUT
    @else
      FORGE LOGIN
    @endif
    
    </button>
   
  </div>
</div>
