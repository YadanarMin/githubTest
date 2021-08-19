var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
function GetThreeLeggedAuth(){
    var btnText = $("#btnForgeLogin").text();
    $.ajax({
        url: "../forge/login",
        type: 'post',
        data:{_token: CSRF_TOKEN,btnText:btnText},
        success :function(data) {
            if(data.includes("LOGIN")){
                window.location.href="/iPD/login/successlogin";
            }else{
                location.href = data; 
            }
                       
        },
        error:function(err){
            console.log(err);
        }
    });    
}