var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
function CreateUser(){
    var isValid =  Validataion();
    if(!isValid) return;
    var form = $(document.forms["createUserForm"]).serializeArray();
    $.ajax({
        url: "../user/create",
        type: 'post',
        data:{_token: CSRF_TOKEN,form},
        success :function(message) {
           if(message.includes("success")){
               alert("successfully saved!");
               location.reload();
           }
                       
        },
        error:function(err){
            console.log(err);
        }
    });    
}

function Validataion(){
    if($("#txtName").val() == "" || $("#txtPassword").val() == ""){
        alert("Please input name and password!");
        return false;
    }else{
        return true;
    }
}

function ClosePopup()
{		
    $("#createUser").css({ visibility: "hidden",opacity: "0"});
}

function DisplayPopup(id){
    if(id != undefined || id != null){
        $.ajax({
            url: "../user/getData",
            type: 'post',
            data:{_token: CSRF_TOKEN,userID:id},
            success :function(result) {
                
               if(result.length > 0){
                   var data = result[0];
                   $("#createUser").css({ visibility: "visible",opacity: "1"});
                  $("#txtName").val(data["name"]);
                  $("#txtPossword").val(data["password"]);
                  $("#txtEmail").val(data["email"]);
                  $("#txtPhone").val(data["phone"]);
                  $("#txtAddress").val(data["address"]);
                  if(data["authority"] == 1)
                    $("#chkAuthority").prop("checked","checked");
               }                          
            },
            error:function(err){
                console.log(err);
            }
        });     
    }
    $("#createUser").css({ visibility: "visible",opacity: "1"});
}