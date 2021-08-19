$(document).ready(function(){

  $('#txtSearch').keyup(function(){
      var textboxValue = $('#txtSearch').val();
      $("#tblSetting tr").each(function(index) {
        if (index !== 0) {
            $row = $(this);
            var projectName = $row.find("td:first").text();
            if(!projectName.includes(textboxValue)){
                $row.hide();
            }else{
                $row.show();
            }
        }
    });
  });

});

function SaveAdminSetting(){

  var autoSaveProject = [];
  var autoBackupProject = [];
  $('#tblSetting tr').each(function() {
    var projectName =	$(this).find("td:eq(0)").text();
    var chkAutoSave = $(this).find("input[name=chkAutoSave]");
    var chkBackup = $(this).find("input[name=chkBackup]");
    if(chkAutoSave.prop('checked')==true){   
      autoSaveProject.push(projectName);
    }
    if(chkBackup.prop('checked') == true){
      autoBackupProject.push(projectName);
    }
  });

  if(autoSaveProject.length < 0) return;
  $.ajax({
      url: "../forge/saveData",
      type: 'post',
      data:{_token: CSRF_TOKEN,message:"update_project_auto_save",projects:autoSaveProject,backupProjects:autoBackupProject},
      success :function(message) {
         if(message.includes("success")){
             alert("successfully saved!");
             //location.reload();
         }
                     
      },
      error:function(err){
          console.log(err);
      }
  }); 
}