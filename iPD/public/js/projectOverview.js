var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
$(document).ready(function(){
    $.ajaxSetup({
        cache:false
    });

    $("#project").multiselect({
        maxPlaceholderWidth:174,
        maxWidth:300,
        placeholder:'Select Folders'
    });
    $("#item").multiselect({
        maxPlaceholderWidth:174,
        maxWidth:300,
        placeholder:'Select Projects',
        selectAll : true
    });
    $("#version").multiselect({
        maxPlaceholderWidth:174,
        maxWidth:300,
        placeholder:'Select Versions',
        selectAll : true

    });
    
    $("#category").multiselect({
        maxPlaceholderWidth:174,
        maxWidth:150,
        placeholder:'Select Category',
        selectAll : true
    });
    
    $("#material").multiselect({
        maxPlaceholderWidth:174,
        maxWidth:150,
        placeholder:'Select material',
        selectAll : true
    });
    $("#workset").multiselect({
        maxPlaceholderWidth:174,
        maxWidth:150,
        placeholder:'Select workset',
        selectAll : true
    });
    
    //if(useableProjects != null)
    LoadComboData();
    
    $("#project").change(function() {
        ProjectChange();
    });

    $("#item").change(function() {
        //ItemChange();
    });

});

function LoadComboData()
{
    $.ajax({
        url: "../forge/getData",
        type: 'post',
        data:{_token: CSRF_TOKEN,message:"getComboData"},
        success :function(data) {
            if(data != null){
               BindComboData(data["projects"],"project");
               BindComboData(data["items"],"item");
               BindComboData(data["versions"],"version");
            }                                 
        },
        error:function(err){
            console.log(err);
        }
    });  
}

function BindComboData(data,comboId){
    var appendText = "";
    $.each(data,function(key,value){      
        value["name"] = value["name"].trim();
        if(comboId == "version"){
            var fileName = value["name"]+"("+value["version_number"]+")";
            appendText +="<option value='"+JSON.stringify(value)+"'>"+fileName+"</option>";
        }else{
            appendText +="<option value='"+JSON.stringify(value)+"'>"+value["name"]+"</option>";
        }
        
    });
    $("select#"+comboId+" option").remove();
    $("#"+comboId).append(appendText).multiselect("reload");
}

function ProjectChange(){
     
     var folderSelectedCount = $('#project option:selected').length;
     var itemOption = "";
     var versionOption = "";

     if(folderSelectedCount == 1){
         var projectName = $('#project option:selected').text();
         $.ajax({
            url: "../forge/getData",
            type: 'post',
            data:{_token: CSRF_TOKEN,message:"getComboDataByProject",projectName:projectName},
            success :function(data) {
                console.log(data);
                if(data != null){
                   BindComboData(data["items"],"item");
                   BindComboData(data["versions"],"version");
                   BindComboData(data["materials"],"material");
                   BindComboData(data["worksets"],"workset");
                }                                 
        },
        error:function(err){
            console.log(err);
        }
    });  

        /*$('#project option:selected').each(function(){           
            var projectVal =JSON.parse($(this).val());
            var projectId = projectVal["id"];

            $('#item option').each(function(){ 
                var itemVal =JSON.parse($(this).val());
                var itemId = itemVal["id"];
                if(projectId == itemVal["project_id"]){
                    itemOption +="<option value="+JSON.stringify(projectVal)+">"+projectVal["name"]+"</option>";
                    $('#version option').each(function(){                        
                        var versionVal =JSON.parse($(this).val());
                        if(itemId == versionVal["item_id"]){
                            versionOption +="<option value="+JSON.stringify(versionVal)+">"+$(this).text()+"</option>";
                        }
                    });
                }
            });            
        });
        $('select#item option').remove();
        $('select#version option').remove();
        $("#item").append(itemOption).multiselect("reload");
        $("#version").append(versionOption).multiselect("reload");*/
     }else{
        LoadComboData();
     }       
}

function ItemChange(){

}

function DisplayVolumeChart(){
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawChart); 
}

function drawChart() {
    
    var chartData = [];
    var ylabels = [];
    var versionSelectedCount = $('#version option:selected').length;
 
    if(versionSelectedCount <= 0){
         $('#project option:selected').each(function(){ 
             var valArr =JSON.parse($(this).val());
             var size = valArr.projectSize;
             var name = $(this).text();
             chartData.push([name,parseInt(size)*0.0000001]);  
         });
    }else{  
         var version = 0;
         $('#version option:selected').each(function(){             
             var valArr =JSON.parse($(this).val());                     
             var str = valArr.updatedTime;
             var size = valArr["storage_size"]/1048411.0794862894;
             /*var date = new Date(str);
             var day =  (date.getDate().toString()).padStart(2,'0');
             var month = ((date.getMonth()+1).toString()).padStart(2,'0');
             var year = date.getFullYear();
             var data= (year+"/"+month+"/"+day);*/
 
             var name = $(this).text();
             chartData.push([name ,size]);  
         });
         chartData.reverse();       
    }
     var data = new google.visualization.DataTable();
     data.addColumn('string', 'project name');
     data.addColumn('number', '');
     data.addRows(chartData);
     var options = {
       title: '',
       hAxis: {title: 'Projects'},
       animation:{ duration: 1000,easing: 'out',startup: true},
       vAxis: {title: 'Storage Size(MB) '},
       series: [{visibleInLegend: false}],
       bar: {groupWidth: 30}
     };
     
     var chart = new google.visualization.ColumnChart(document.getElementById('chartDiv'));
     chart.draw(data, options);
 }

function DisplayVolumeData(){

    var versionSelectedCount = $('#version option:selected').length;
    var selected_categories=[];
    var material_list = [];
    var workset_list=[];
    $("#category option:selected").each(function(){
        selected_categories.push($(this).val());
    });
    
    $("#material option:selected").each(function(){
        material_list.push($(this).text());
    });
    $("#workset option:selected").each(function(){
        workset_list.push($(this).text());
    });

    $('#version option:selected').each(function(){             
        var valArr =JSON.parse($(this).val());                     
        var db_version_id = valArr.id;
        var version_number = valArr.version_number;
        var item_id = valArr.item_id;
        $.ajax({
            url: "../forge/getData",
            type: 'post',
            data:{_token: CSRF_TOKEN,message:"getDataByVersion",version_number:version_number,id:db_version_id
                    ,item_id:item_id,category_list:selected_categories,material_list:material_list,workset_list:workset_list},
            success :function(data) {
                //alert(data);
               console.log(data);
                if(data != null){               
                 DisplayTable(data);
                }                                 
            },
            error:function(err){
                console.log("error");
                console.log(err);
            }
        });  
    });
 }

function DisplayTable(data){
     var appendText = "";
     appendText += "<tr>";
     appendText += "<th>No.</th>";
     appendText += "<th>type_name</th>";
     appendText += "<th>element_id</th>";
     appendText += "<th>material_name</th>";
     appendText += "<th>level</th>";
     appendText += "<th>volume</th>";
     appendText += "<th>family_name</th>";
     appendText += "<th>workset</th>";
     appendText += "<th>version_number</th>";
     appendText += "</tr>";
     
     var count = 0;
    $.each(data,function(key,row){
        count++;
        appendText += "<tr>";
        appendText += "<td>"+count+".</td>";
        appendText += "<td>"+row["type_name"]+"</td>";
        appendText += "<td>"+row["element_id"]+"</td>";
        appendText += "<td>"+row["material_name"]+"</td>";
        appendText += "<td>"+row["level"]+"</td>";
        appendText += "<td>"+row["volume"]+"</td>";
        appendText += "<td>"+row["family_name"]+"</td>";
        appendText += "<td>"+row["workset"]+"</td>";
        appendText += "<td>"+row["version_number"]+"</td>";
        appendText += "</tr>";
    })
    $("#tblVersionData tr").remove();
    $("#tblVersionData").append(appendText);
 }