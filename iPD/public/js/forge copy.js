
$(document).ready(function(){
    $.ajaxSetup({
        cache:false
    });

    $("#txtBeamHeadMul").change(function() {
        if(TekkinPopupVolume["始端"]){
            $("#txtBeamBottomMul").val($("#txtBeamHeadMul").val());
            var beamHead = (parseFloat(TekkinPopupVolume["始端"])* parseFloat($("#txtBeamHeadMul").val())).toFixed(2);
            var beamCenter = (parseFloat(TekkinPopupVolume["中央"])).toFixed(2);
            var beamBottom = (parseFloat(TekkinPopupVolume["終端"])* parseFloat($("#txtBeamHeadMul").val())).toFixed(2);

            $("#txtBeamHeadTotal").val(beamHead);
            $("#txtBeamBottomTotal").val(beamBottom);
            var totalBeam = (parseFloat(beamHead) + parseFloat(beamCenter) + parseFloat(beamBottom)).toFixed(2);
            $("#txtBeamTotalDisplay").val(totalBeam);
            var total = (parseFloat(totalBeam) + parseFloat($("#txtColumnTotalDisplay").val()) + parseFloat($("#txtFoundationTotalDisplay").val())).toFixed(2);
            $("#totalVolume").text(total);
            DisplayTekkinVolumeChart(volumeArray);
        }                                   
    });

    $("#txtColumnHeadMul,#txtColumnBottomMul").change(function() {  
        if(TekkinPopupVolume["始端"]){
            var columnHead = (parseFloat(TekkinPopupVolume["柱頭"]) * parseFloat($("#txtColumnHeadMul").val())).toFixed(2);
            var columnBottom = (parseFloat(TekkinPopupVolume["柱脚"]) * parseFloat($("#txtColumnBottomMul").val())).toFixed(2);

            $("#txtColumnHeadTotal").val(columnHead);
            $("#txtColumnBottomTotal").val(columnBottom);
            var totalColumn = (parseFloat(columnHead) + parseFloat(columnBottom)).toFixed(2);
            $("#txtColumnTotalDisplay").val(totalColumn);
            var total = (parseFloat(totalColumn) + parseFloat($("#txtBeamTotalDisplay").val()) + parseFloat($("#txtFoundationTotalDisplay").val())).toFixed(2);
            $("#totalVolume").text(total);
            DisplayTekkinVolumeChart(volumeArray);
        }       
    });

    $("#txtFoundationHeadMul,#txtFoundationBottomMul").change(function() { 
        if(TekkinPopupVolume["始端"]){
            var foundationHead = (parseFloat(TekkinPopupVolume["上端筋"])* parseFloat($("#txtFoundationHeadMul").val())).toFixed(2);
            var foundationBottom = (parseFloat(TekkinPopupVolume["下端筋"])* parseFloat($("#txtFoundationBottomMul").val())).toFixed(2);

            $("#txtFoundationHeadTotal").val(foundationHead);
            $("#txtFoundationBottomTotal").val(foundationBottom);
            var totalFoundation = (parseFloat(foundationHead) + parseFloat(foundationBottom)).toFixed(2);
            $("#txtFoundationTotalDisplay").val(totalFoundation);
            var total = (parseFloat(totalFoundation) + parseFloat($("#txtColumnTotalDisplay").val()) + parseFloat($("#txtBeamTotalDisplay").val())).toFixed(2);
            $("#totalVolume").text(total);
            DisplayTekkinVolumeChart(volumeArray);
        }             
    });
    
    GetRelatedProjects();
    $("#chkRelatedPrj").change(function() {
        BindComboData();                  
    });

    $("#loader").addClass("bgNone");
    $("#projectFolder").change(function() {
        FloderChange();
    });

    $("#project").change(function() {
        ProjectChange();
    });
    $("#projectFolder").multiselect({
        maxPlaceholderWidth:174,
        maxWidth:300,
        placeholder:'Select Folders'
    });
    $("#project").multiselect({
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

    //if(useableProjects != null)
        BindComboData();
});

var useableProjects = [];
var userEmail = "";
var token = "";
function SetSessionData( projects,email){
    if(projects != null){
        var projects = JSON.parse(JSON.stringify(projects));
        useableProjects = projects[0];
        userEmail = email;
    }
}
var relatedProjects = [];
function GetRelatedProjects(){
    $.ajax({
        type: 'POST',
            url: './ForgePage/SaveProject.php',
            data:{message:"getProject",userEmail:userEmail},
            success :function(data) {  
                var result = JSON.parse(data);  
                if(result.length > 0){
                    relatedProjects = result;
                }/*else{
                    if($("#chkRelatedPrj").is(":checked"))
                        alert("関係プロジェクトとして保存する必要があります。");
                } */                    
        }
    })
}

function DisplayChart(){
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
            chartData.push([name,parseInt(size)*0.000001]);  
        });
   }else{  
        var version = 0;
        $('#version option:selected').each(function(){             
            var valArr =JSON.parse($(this).val());           
            var str = valArr.updatedTime;
            var size = valArr.projectSize;
            var date = new Date(str);
            var day =  (date.getDate().toString()).padStart(2,'0');
            var month = ((date.getMonth()+1).toString()).padStart(2,'0');
            var year = date.getFullYear();
            var data= (year+"/"+month+"/"+day);

            var name = $(this).text();
            chartData.push([data+"\n"+name ,size*0.000001]);  
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
    
    var chart = new google.visualization.ColumnChart(document.getElementById('chartContainer'));
    chart.draw(data, options);
}


var ThreeLeggedAuthFlat = false;
function GetThreeLeggedAuth(){
     $.ajax( {
        type: 'GET',
        url: './ForgePage/ThreeLeggedToken.php',
         success :function(data) {
             ThreeLeggedAuthFlat = true;
            location.href = data;            
        }
    });
}

function GetAllProjectDatas(){

    var folderSelectedcount = $('#projectFolder option:selected').length;
    var option = "";
    var paramArray =[];
    if(folderSelectedcount > 0){
        $('#projectFolder option:selected').each(function(){ 
            var valArray =JSON.parse($(this).val());
            paramArray.push({'hubId':valArray.hubId,'projectId':valArray.projectId});
        });
    }
    $("#loader").removeClass("bgNone");
        $.ajax( {      
            type: 'POST',
            url: './ForgePage/GetForgeData.php',
            data:{message:"getAllProjects",params:JSON.stringify(paramArray)},
                success :function(data) {   
                    //alert(JSON.stringify(data));
                    $("#loader").addClass("bgNone");                            
                   if(data.includes("success")){
                    $("#loader").addClass("bgNone");
                    //console.log(data);return; 
                     location.href = "http://localhost/RevitWebSystem/Forge.php";   
                       //BindComboData();
                   }
               
                //DisplayBarChart();
            }     
        });

}

function BindComboData(){
    //var mydata = JSON.parse("./ForgePage/myfile.json");
    var host = window.location.hostname;
    var url = "http://"+host+"/RevitWebSystem/ForgePage/myfile.json";
    $.getJSON(url, function(data) {
     var result =  Object.values(data); // this will show the info it in firebug console
    var folderOption = "";
    var projectOption = "";
    var versionOption = "";
    $.each(result[0],function(key,value){
        
       //if(!useableProjects.includes(key))return; 
       if($("#chkRelatedPrj").is(":checked")){
           if(!relatedProjects.includes(key))return;
       }
       var tempValue = {"hubId":value.hubId,"projectId":value.projectId};             
        folderOption +="<option value="+JSON.stringify(tempValue)+">"+key+"</option>";
        
        $.each(value.Projects,function(pKey,pValue){
            var ptempValue = {"folderId":pValue.folderId,"projectId":pValue.projectId,"projectSize":pValue.projectSize};       
            projectOption +="<option value="+JSON.stringify(ptempValue)+">"+pKey+"</option>";

            $.each(pValue.Versions,function(vKey,vValue){
                if(vValue.projectId == pValue.projectId){
                    versionOption +="<option value="+JSON.stringify(vValue)+">"+vKey+"</option>";
                }
                
            });
        });       
    });

    $('select#projectFolder option').remove();
    $("#projectFolder").append(folderOption).multiselect("reload");
    $('select#project option').remove();
    $("#project").append(projectOption).multiselect("reload");
    $('select#version option').remove();
    $("#version").append(versionOption).multiselect("reload");


     /*var folders = result[0];
     var projects = result[1];
     var versions = result[2];
        var option = "";
        $.each(folders, function (key, value) {
                option +="<option value="+JSON.stringify(value)+">"+key+"</option>";
        });
        $('select#projectFolder option').remove();
        $("#projectFolder").append(option).multiselect("reload");

        option = "";
        $.each(projects, function (key, value) {
                option +="<option value="+JSON.stringify(value)+">"+key+"</option>";
        });
        $('select#project option').remove();
        $("#project").append(option).multiselect("reload");
          
        option = "";
        $.each(versions, function (key, value) {
            option +="<option value="+JSON.stringify(value)+">"+key+"</option>";
       });
       $('select#version option').remove();
       $("#version").append(option).multiselect("reload");*/
    });


   
}

function FloderChange(){

    var host = window.location.hostname;
    var url = "http://"+host+"/RevitWebSystem/ForgePage/myfile.json";
    
    $.getJSON(url, function(data) {
     var result =  Object.values(data); // this will show the info it in firebug console
     
     var folderSelectedCount = $('#projectFolder option:selected').length;
     var option = "";
     var versionOption = "";
     var jsonData = result[0];
     //alert(JSON.stringify(jsonData));
     if(folderSelectedCount > 0){
        $('#projectFolder option:selected').each(function(){ 
            var valArray =JSON.parse($(this).val());
             $.each(result[0], function (key, value) { 
               // if(!useableProjects.includes(key))return;   
                 if(valArray.projectId == value.projectId){//check folder is the same with jsondata
                    if(value.Projects != null){
                        $.each(value.Projects,function(pKey,pValue){                            
                        var tempValue = {"folderId":pValue.folderId,"projectId":pValue.projectId,"projectSize":pValue.projectSize}; 
                        option +="<option value="+JSON.stringify(tempValue)+">"+pKey+"</option>";
                            $.each(pValue.Versions,function(vKey,vValue){
                                if(vValue.projectId == pValue.projectId){
                                    versionOption +="<option value="+JSON.stringify(vValue)+">"+vKey+"</option>";
                                }
                            });
                        });
                     }
                 }                                               
            });
        });
        $('select#project option').remove();
        $('select#version option').remove();
        $("#project").append(option).multiselect("reload");
        $("#version").append(versionOption).multiselect("reload");
     }else{
         BindComboData();
     }   
        
    });
}

function ProjectChange(){
    var host = window.location.hostname;
    var url = "http://"+host+"/RevitWebSystem/ForgePage/myfile.json";
    $.getJSON(url, function(data) {
     var result =  Object.values(data); // this will show the info it in firebug console
     
     var projectSelectedCount = $('#project option:selected').length;
     var option = "";
     if(projectSelectedCount > 0){
        $('#project option:selected').each(function(){ 
            var valArray =JSON.parse($(this).val());

            $.each(result[0], function (key, value) { 
               // if(!useableProjects.includes(key))return; 
                if(value.Projects != null){
                    $.each(value.Projects,function(pkey,pvalue){  
                        if(pvalue.projectId == valArray.projectId){
                            $.each(pvalue.Versions,function(vKey,vValue){
                                if(vValue.projectId == pvalue.projectId){
                                    option +="<option value="+JSON.stringify(vValue)+">"+vKey+"</option>";
                                }
                            });
                        }
                    });
                }                                                       
            });
        });

        $('select#version option').remove();
        $("#version").append(option).multiselect("reload");
     }else{
         //BindComboData();
     }   
        
    });
}

var tableData = [];
function GetRoomProperties(){
    tableData.length = 0;//array clear
    var projectSelectedCount = $('#version option:selected').length;
    if(projectSelectedCount == 1){
        var valArray =JSON.parse($('#version option:selected').val());
        var urn = valArray.versionId;
        $("#loader").removeClass("bgNone");
        $.ajax({
            type: 'POST',
            url: './ForgePage/GetProperties.php',
            data:{message:"getProperties",urn:urn},
            success :function(data) {

                $("#loader").addClass("bgNone");
                console.log(JSON.parse(data));
                var result = JSON.parse(data);
                $.each(result,function(k,d){
                   var dataObj = JSON.parse(d);
                   var id = dataObj['objectid'];
                   var sunpo = dataObj["寸法"];
                   var shiage = dataObj["識別情報"];
                   var kosoku = dataObj ["拘束"];
                   var roomname = shiage["名前"];
                   var level = kosoku["レベル"];
                   var length =  sunpo["周長"];
                   var writeArea = sunpo["室面積（書き込み）_ob"];
                   var height = sunpo["算定高さ"];
                   var levelHeight = sunpo["部屋高さ(レベル指定)"];                 
                   var area = sunpo["面積"];
                   var ceilingFinish = shiage["仕上 天井"];
                   var ceilingBase = shiage["天井下地"];
                   var circle = shiage["廻縁"];
                   var wallFinish = shiage["仕上 壁"];
                   var wallBase = shiage["壁下地"];
                   var baseBoard = shiage["幅木"];
                   var floorFinish = shiage["仕上 床"];
                   var floorBase = shiage["床下地"];
                   
                   tableData.push({"名前":roomname,"レベル":level,"id":id,
                   "寸法情報":{"周長":length,"室面積（書き込み）_ob":writeArea,"算定高さ":height,"部屋高さ(レベル指定)":levelHeight,"面積":area},
                   "仕上情報":{"仕上 天井":ceilingFinish,"天井下地":ceilingBase,"廻縁":circle,"仕上 壁":wallFinish,"壁下地":wallBase,"幅木":baseBoard,"仕上 床":floorFinish,"床下地":floorBase}})                 
                });
                CreateTable();
            },
            error :function(err){
                alert(JSON.stringify(err));
            }
            

        })
    }else{
        alert("Please select just one project");
    }
    
}
function groupBy(xs, f) {
    return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}

function CreateTable(){
    var appendTbl = "";

    var result = groupBy(tableData, (c) => c.レベル); 
    var ordered = {}; 
    Object.keys(result).sort().forEach(function(key) {
        ordered[key] = result[key];
      }); 
    var displayData =  Object.values(ordered);

    appendTbl +="<div style='max-height:570px;width:60%; overflow-y:auto;'>";
    appendTbl += "<table id='roomTable' style='border:1px solid green;width:100%;'>";
    appendTbl += "<tr>";  
        appendTbl += "<th width='8%'>番号</th>";  
        appendTbl += "<th>名前</th>";
        appendTbl += "<th width='15%'>レベル</th>";
        appendTbl += "<th width='15%'>寸法情報</th>";
        appendTbl += "<th width='15%'>仕上情報</th>";
    appendTbl += "</tr>";
    var count = 0;
   
    $.each(displayData,function(level,value){
        $.each(value,function(i,data){
            count++;
            var btnSunpo = "btnSunpo"+count;
            var btnShiage = "btnShiage"+count;
            appendTbl += "<tr>";
                appendTbl += "<td>"+count+".</td>";
                appendTbl += "<td>"+data["名前"]+"</td>";
                appendTbl += "<td>"+data["レベル"]+"</td>";
                appendTbl += "<td><input type='button' id="+btnSunpo+" value='寸法詳細表示' name="+data['id']+" onClick='SunpoDetail(this)'/></td>";
                appendTbl += "<td><input type='button' id="+btnShiage+" value='仕上詳細表示' name="+data['id']+" onClick='ShiageDetail(this)'/></td>";
            appendTbl += "</tr>";
        });       
    });
    appendTbl += "</table>"
    appendTbl += "</div>";
    $("#chartContainer").empty();
    $("#chartContainer table").remove();
    $("#chartContainer").append(appendTbl);
}

function SunpoDetail(btn){  

    var roomId = btn.name;
    Object.values(tableData).forEach(function(v){
        if(v["id"] == roomId){
            var data = v["寸法情報"];
            var roomName = v["名前"];
            ShowPopup(data,roomName,"SunpoPopup","tbSunpo");
            return;
        }
    });  
}

function ShiageDetail(btn){
    var roomId = btn.name;
    Object.values(tableData).forEach(function(v){
        if(v["id"] == roomId){
            var data = v["仕上情報"];
            var roomName = v["名前"];
            ShowPopup(data,roomName,"ShiagePopup","tbShiage");
            return;
        }
    });  
}

function ShowPopup(data,roomName,popupName,tbName){
    $(".ms-options-wrap.ms-has-selections > button").css("z-index", "-1");
    $("#"+popupName).css({ visibility: "visible",opacity: "1"});
    $("#"+popupName).draggable();
    var appendStr = "";
    appendStr += "<table align='center' width='90%'>";
    $.each(data,function(key,value){
        appendStr += "<tr>";
        appendStr += "<td>"+key+"</td>";
        appendStr += "<td>"+value+"</td>";
        appendStr += "</tr>";
    });
    appendStr += "</table>";
    $("#"+tbName+" table").remove();
    $("#roomName").html("【"+roomName+"】");
    $("#roomName1").html("【"+roomName+"】");
    $("#"+tbName).append(appendStr);
}

function ClosePopup(){
    $(".ms-options-wrap.ms-has-selections > button").css("z-index", "0");
    $(".ms-options-wrap > button").css("z-index", "0");
    $("#SunpoPopup").css({ visibility: "hidden",opacity: "0"});
    $("#ShiagePopup").css({ visibility: "hidden",opacity: "0"});
    $("#formulaPopup").css({ visibility: "hidden",opacity: "0"});
}

/**Old Function */
/*function GetVolume(){

    var projectSelectedCount = $('#version option:selected').length;
    var urnArray = [];
    if(projectSelectedCount > 1){
        alert("Please select just one version!");return;
    } 
    var name ;
    if(projectSelectedCount == 1){
        $('#version option:selected').each(function(){ 
            var valArray =JSON.parse($(this).val());
             name = $(this).text();         
           urnArray.push([name,valArray.versionId]);
        });       

        //check volume json file data that is already exist version or not
        var host = window.location.hostname;
        var url = "http://"+host+"/RevitWebSystem/ForgePage/volume.json";
        $.getJSON(url, function(data) {
        var result =  Object.values(data);

            if(Object.keys(data).includes(name) && data[name] != ""){
                ReadJsonData(name);               
            }else{
                $("#loader").removeClass("bgNone");
                $.ajax({
                    type: 'POST',
                    url: './ForgePage/GetVolume.php',
                    data:{message:"getVolume",urn:JSON.stringify(urnArray)},
                    success :function(data) {
                        $("#loader").addClass("bgNone");
                        
                        //console.log(data);return;
                        if(data.includes("success")){
                            ReadJsonData(name);      
                        }else{
                            alert("30Con_コンクリートがいません");
                        }
                    }
                })
            }
        });
   
    }else{
        alert("Please select project version");
    }
}*/
//multiple select projectevent 
function GetVolume(status){

    TekkinPopupVolume = {};
    var materialName = $("#txtMaterial").val();
    if(status != "Tekkin"){//dont need checking for tekkin
        if(materialName == "" || materialName == "undefined" ){
            alert("マテリアル名を入力してください！");
            return;
        } 
    }    
    var projectSelectedCount = $('#version option:selected').length;
     var urnArray = [];
     /*if(projectSelectedCount > 1){
         alert("Please select just one version!");return;
     }*/
     var name ;
     var urn;
     if(projectSelectedCount == 1){
         $('#version option:selected').each(function(){ 
             var valArray =JSON.parse($(this).val());
              name = $(this).text(); 
              urn = valArray.versionId;        
         }); 
         
         $("#loader").removeClass("bgNone");
         $.ajax({
             type: 'POST',
             url: './ForgePage/getVolumeData.php',
             data:{message:"getHierarchy",urn:urn,name:name},
             success :function(result) {
                 var data = JSON.parse(result);
                 var hieraryData = data[0];
                 var allProperties;
                 if(data[1] != undefined){
                     var guid = data[1];
                     console.log(guid);
                     $.ajax({
                         type: 'POST',
                         url: './ForgePage/getVolumeData.php',
                         data:{message:"getProperties",urn:urn,guid:guid},
                         success:function(properties){
                             allProperties = JSON.parse(properties);

                             if(status != "Tekkin"){
                                 
                                PrepareChartData(allProperties,hieraryData,materialName);
                             }else{//tekkin
                                PrepareTekkinChartData(allProperties,hieraryData);    
                             }
                            
                             $("#loader").addClass("bgNone");
                         },
                         error:function(err){
                             $("#loader").addClass("bgNone");
                             console.log(err);
                         }
                     })
                 }
              
                 return;                       
             },
             error:function(err){
                 $("#loader").addClass("bgNone");
                 alert("error");
                 console.log(JSON.stringify(err));
             }
         });
    
     }else{
         //alert("Please select project version");
         if(projectSelectedCount == 0)return;
         var projectTekkinData = {};
         var params = [];
         $('#version option:selected').each(function(){ 
            var valArray =JSON.parse($(this).val());
             name = $(this).text(); 
             urn = valArray.versionId;  
             params.push({urn:urn,name:name});        
        }) 
        $("#loader").removeClass("bgNone"); 

            $.ajax({
                type: 'POST',
                url: './ForgePage/getVolumeData.php',
                data:{message:"getHierarchyForAllGivenProjects",params:JSON.stringify(params)},
                success : function(result) {

                    var data = JSON.parse(result);  
                    var hieraryDataArray = {};
                    var guidArray = [];
                    $.each(data,function(key,value){
                        hieraryDataArray[value[3]] = value[0];
                        guidArray.push({guid:value[1],urn:value[2],name:value[3]});
                    });

                    $.ajax({
                            type: 'POST',
                            url: './ForgePage/getVolumeData.php',
                            async: false,
                            data:{message:"getPropertiesForGivenProjects",params:JSON.stringify(guidArray)},                          
                            success :function(properties){                              
                                allProperties = JSON.parse(properties);
                                var tekkinArray =  GetTekkinChartData(allProperties,hieraryDataArray); 
                            
                                $("#loader").addClass("bgNone");
                                DisplayEachProjectTekkinChart(tekkinArray);      
                            }                           
                        });                 
              },
              error:function(err){
                  console.log(JSON.stringify(err));
              }
                                
            });                                   
     }//else
 }

var volumeArray = {};
function PrepareChartData(properties,hieraryData,materialName){

    $.each(hieraryData,function(kozouName,value){//get all kozou of each level data
        var levelVolumeArray = {};

       $.each(value,function(k,id){
        var filtered = properties.find(x => x["objectid"] === id);             
        var typeMaterial = filtered['マテリアル / 仕上'];
        var kouzouMaterial = (typeMaterial["構造マテリアル"]) ? typeMaterial["構造マテリアル"] : typeMaterial["フーチング_マテリアル"];
        if(kouzouMaterial.includes(materialName)){

            var kosoku = filtered['拘束'];
            var sunPo = filtered['寸法'];
            var level = (kosoku["参照レベル"])? kosoku["参照レベル"] : kosoku["基準レベル"] ;      

            var tempVolume = 0;
            if(!kozouName.includes("構造基礎")){              
                
                var volumeString =  sunPo["容積"]; 
                //var temp = volumeString.split(" ");//remove m3 sign
                var temp = parseFloat(volumeString.replace( /^\D+/g, ''));
                 tempVolume = temp;
                 
            }else{
                var width = (sunPo["W"]) ? sunPo["W"] :sunPo["幅"];
                var length = (sunPo["H"]) ? sunPo["H"] :sunPo["長さ"];
                var depth = (sunPo["D"]) ? sunPo["D"] :sunPo["厚さ"];

                var w = width.split(" ");
                var h = length.split(" ");
                var d = depth.split(" ");
                tempVolume = (w[0]/1000) * (h[0]/1000) * (d[0]/1000);
            }
           
            
            var levelVolume = (levelVolumeArray[level]) ? levelVolumeArray[level] : 0 ;        
            levelVolumeArray[level] = parseFloat(levelVolume) + parseFloat(tempVolume);
        }
       });
       volumeArray[kozouName] = levelVolumeArray;
    });

    DisplayVolumeChart(volumeArray);
}


function PrepareTekkinChartData(properties,hieraryData){
    console.log((hieraryData));
    //var volumeArray = {};
    $.each(hieraryData,function(kozouName,value){//get all kozou of each level data

        if(!kozouName.includes("構造フレーム") && !kozouName.includes("構造柱") && !kozouName.includes("構造基礎"))return;
        var levelVolumeArray = [];

       $.each(value,function(k,id){
            var filtered = properties.find(x => x["objectid"] === id);
            var typeName = filtered["name"];
            if(!typeName.includes("_ob_RC") && !typeName.includes("_ob_Foundation"))return;
            if(kozouName.includes("構造フレーム"))
                levelVolumeArray =  BeamCalculation(filtered,levelVolumeArray);  
            else if( kozouName.includes("構造柱"))
                levelVolumeArray =  ColumnCalculation(filtered,levelVolumeArray);
            else if( kozouName.includes("構造基礎"))
                levelVolumeArray =  FoundationCalculation(filtered,levelVolumeArray);
       });
       volumeArray[kozouName] = levelVolumeArray;
    });
   console.log(volumeArray);
    DisplayTekkinVolumeChart(volumeArray);
}

function GetTekkinChartData(propertiesArray,hieraryDataArray){
 
    var returnArray = {};
    $.each(hieraryDataArray,function(prjName,hieraryData){
        var tempArray = {};
        var properties = propertiesArray[prjName];
        if(properties == undefined){
            returnArray[prjName] = {};
            return;
        }
        $.each(hieraryData,function(kozouName,value){//get all kozou of each level data

            if(!kozouName.includes("構造フレーム") && !kozouName.includes("構造柱") && !kozouName.includes("構造基礎"))return;
            var levelVolumeArray = [];
            
           $.each(value,function(k,id){
                var filtered = properties.find(x => x["objectid"] === id);
                var typeName = filtered["name"];
                if(!typeName.includes("_ob_RC") && !typeName.includes("_ob_Foundation"))return;
                if(kozouName.includes("構造フレーム"))
                    levelVolumeArray =  BeamCalculation(filtered,levelVolumeArray);  
                else if( kozouName.includes("構造柱"))
                    levelVolumeArray =  ColumnCalculation(filtered,levelVolumeArray);
                else if( kozouName.includes("構造基礎"))
                    levelVolumeArray =  FoundationCalculation(filtered,levelVolumeArray);
           });
           tempArray[kozouName] = levelVolumeArray;
        });
       
        returnArray[prjName] = tempArray;
    });
      
   return returnArray;
}

var TekkinPopupVolume = {};
function BeamCalculation(filtered,levelVolumeArray){

    var other = filtered['その他']; 
    var kozou = filtered['構造'];    
    var kosoku = filtered['拘束'];
    var sunPo = filtered['寸法'];
    var B = parseFloat(sunPo['B'])/1000;//change mm to m
    var H = parseFloat(sunPo['H'])/1000;
    var length = parseFloat(kozou["カット長"].replace( /^\D+/g, ''))/1000;
    var level = (kosoku["参照レベル"])? kosoku["参照レベル"] : kosoku["基準レベル"]; 
    var divValue = 162.28;
    //始端
    var headUpD = (other["始端 上主筋 太径"]) ? parseFloat(other["始端 上主筋 太径"].replace( /^\D+/g, '')) : 0;//replace empty of not digit char     
    var headUpfirstRowCount = parseFloat(other["始端 上主筋 1段筋太筋本数"].replace(/^\D+/g, '')); 
    var headUpsecondRowCount = parseFloat(other["始端 上主筋 2段筋太筋本数"].replace(/^\D+/g, '')); 
    var headDownD = (other["始端 下主筋 太径"]) ? parseFloat(other["始端 下主筋 太径"].replace( /^\D+/g, '')) : 0;
    var headDownfirstRowCount = parseFloat(other["始端 下主筋 1段筋太筋本数"].replace(/^\D+/g, '')); 
    var headDownsecondRowCount = parseFloat(other["始端 下主筋 2段筋太筋本数"].replace(/^\D+/g, ''));        
    var headHelperD = (other["始端 肋筋径"]) ? parseFloat(other["始端 肋筋径"].replace( /^\D+/g, '')): 0;  
    var headHelperCount = parseFloat(other["始端 肋筋本数"].replace(/^\D+/g, '')); 
    var headHelperPitch = (other["始端 肋筋ピッチ"]) ? parseFloat(other["始端 肋筋ピッチ"].replace(/^\D+/g, ''))/1000 : 0; 
    var headUpWeight= (Math.pow(headUpD,2)/divValue) * length/3;//area * length
    var headDownWeight = (Math.pow(headDownD,2)/divValue) * length/3;
    var helperArea = (Math.pow(headHelperD,2)/divValue);
    var helperWeight = (headHelperPitch == 0)? 0 : (helperArea*((B*2)+(H*2))) * (length/headHelperPitch/3);//need length divided by 3 bcos it owns head,center,tail
    var headWeight = ((headUpfirstRowCount+headUpsecondRowCount)*headUpWeight)
                    +((headDownfirstRowCount+headDownsecondRowCount)*headDownWeight)
                    +helperWeight;

       headWeight = headWeight/1000;//change to tons             
    
     var previoutShitan =     (TekkinPopupVolume["始端"] !== undefined) ? TekkinPopupVolume["始端"] : 0;    
     TekkinPopupVolume["始端"] = headWeight + previoutShitan;
    //中央
    var centerUpD = parseFloat(other["中央 上主筋 太径"].replace(/^\D+/g, ''));
    var centerUpfirstRowCount = parseFloat(other["中央 上主筋 1段筋太筋本数"].replace(/^\D+/g, '')); 
    var centerUpsecondRowCount = parseFloat(other["中央 上主筋 2段筋太筋本数"].replace(/^\D+/g, ''));  
    var centerDownD = parseFloat(other["中央 下主筋 太径"].replace(/^\D+/g, ''));
    var centerDownfirstRowCount = parseFloat(other["中央 下主筋 1段筋太筋本数"].replace(/^\D+/g, '')); 
    var centerDownsecondRowCount = parseFloat(other["中央 下主筋 2段筋太筋本数"].replace(/^\D+/g, ''));  
    var centerHelperD = parseFloat(other["中央 肋筋径"].replace( /^\D+/g, ''));     
    var centerHelperCount = parseFloat(other["中央 肋筋本数"].replace(/^\D+/g, '')); 
    var centerHelperPitch = parseFloat(other["中央 肋筋ピッチ"].replace(/^\D+/g, ''))/1000;
    var centerUpWeight = (Math.pow(centerUpD,2)/divValue) * length/3;//area * length
    var centerDownWeight =(Math.pow(centerDownD,2)/divValue) * length/3;
    var centerHelperArea = (Math.pow(centerHelperD,2)/divValue);
    var centerHelperWeight = (centerHelperPitch == 0) ? 0 : (centerHelperArea*((B*2)+(H*2))) * (length/centerHelperPitch/3); 
    var centerWeight = ((centerUpfirstRowCount+centerUpsecondRowCount)*centerUpWeight)
                    +((centerDownfirstRowCount+centerDownsecondRowCount)*centerDownWeight)
                    +centerHelperWeight;

        centerWeight = centerWeight/1000;//change to tons

    var previoutChuo =  (TekkinPopupVolume["中央"] !== undefined) ? TekkinPopupVolume["中央"] : 0;    
     TekkinPopupVolume["中央"] = centerWeight + previoutChuo;
    //終端
    var tailUpD = parseFloat(other["終端 上主筋 太径"].replace(/^\D+/g, ''));
    var tailUpfirstRowCount = parseFloat(other["終端 上主筋 1段筋太筋本数"].replace(/^\D+/g, '')); 
    var tailUpsecondRowCount = parseFloat(other["終端 上主筋 2段筋太筋本数"].replace(/^\D+/g, '')); 
    var tailDownD = parseFloat(other["終端 下主筋 太径"].replace(/^\D+/g, ''));
    var tailDownfirstRowCount = parseFloat(other["終端 下主筋 1段筋太筋本数"].replace(/^\D+/g, '')); 
    var tailDownsecondRowCount = parseFloat(other["終端 下主筋 2段筋太筋本数"].replace(/^\D+/g, ''));  
    var tailHelperD = parseFloat(other["終端 肋筋径"].replace( /^\D+/g, ''));//replace empty of not digit char     
    var tailHelperCount = parseFloat(other["終端 肋筋本数"].replace(/^\D+/g, '')); 
    var tailHelperPitch = parseFloat(other["終端 肋筋ピッチ"].replace(/^\D+/g, ''))/1000; 
    var tailUpWeight= (Math.pow(tailUpD,2)/divValue) * length/3;//area * length
    var tailDownWeight = (Math.pow(tailDownD,2)/divValue) * length/3;
    var tailHelperArea = (Math.pow(tailHelperD,2)/divValue);
    var tailHelperWeight = (tailHelperPitch == 0) ? 0 : (tailHelperArea*((B*2)+(H*2))) * (length/tailHelperPitch/3);
    var tailWeight = ((tailUpfirstRowCount+tailUpsecondRowCount)*tailUpWeight)
                    +((tailDownfirstRowCount+tailDownsecondRowCount)*tailDownWeight)
                    +tailHelperWeight;

        tailWeight = tailWeight/1000;//change to tons

    var previoutShuutan =     (TekkinPopupVolume["終端"] !== undefined) ? TekkinPopupVolume["終端"] : 0;    
    TekkinPopupVolume["終端"] = tailWeight + previoutShuutan;

    levelVolumeArray.push({level:level,beamStart:headWeight,beamCenter:centerWeight,beamEnd:tailWeight});

    /*var totalWeight = (headWeight + centerWeight+ tailWeight);//*0.3531466672;//convert m cube to tonnes
    var previousWeight = (levelVolumeArray[level]) ? levelVolumeArray[level] : 0 ;    
    levelVolumeArray[level] = totalWeight + previousWeight;*/
    return levelVolumeArray;
}

function ColumnCalculation(filtered,levelVolumeArray){

    var other = filtered['その他']; 
    var kozou = filtered['構造'];    
    var kosoku = filtered['拘束'];
    var sunPo = filtered['寸法'];
    var W = parseFloat(sunPo['W'])/1000;//change mm to m
    var D = parseFloat(sunPo['D'])/1000;
    var volume =  parseFloat(sunPo["容積"].replace( /^\D+/g, ''));
    var level = (kosoku["参照レベル"])? kosoku["参照レベル"] : kosoku["基準レベル"];
    //var baselevelOffset =  parseFloat(kosoku["基準レベル オフセット"].replace( /^\D+/g, ''))/1000;
    //var upperlevelOffset =  parseFloat(kosoku["上部レベル オフセット"].replace( /^\D+/g, ''))/1000;
    var length = (volume/(W*D));
    var divValue = 162.28;
    //柱頭
    var headD = (other["柱頭 主筋太径"]) ? parseFloat(other["柱頭 主筋太径"].replace( /^\D+/g, '')) : 0;//replace empty of not digit char     
    var headXfirstRowCount = parseFloat(other["柱頭 主筋X方向1段太筋本数"].replace(/^\D+/g, '')); 
    var headXsecondRowcount = parseFloat(other["柱頭 主筋X方向2段太筋本数"].replace(/^\D+/g, '')); 
    var headYfirstRowCount = parseFloat(other["柱頭 主筋Y方向1段太筋本数"].replace( /^\D+/g, ''));
    var headYsecondRowcount = parseFloat(other["柱頭 主筋Y方向2段太筋本数"].replace(/^\D+/g, '')); 
    var headGirdle = (other["柱頭 帯筋径"]) ? parseFloat(other["柱頭 帯筋径"].replace( /^\D+/g, '')) : 0;  
    //var headXGirdleCount = parseFloat(other["柱頭 帯筋X方向本数"].replace(/^\D+/g, '')); 
    //var headYGirdleCount = parseFloat(other["柱頭 帯筋Y方向本数"].replace(/^\D+/g, '')); 
    var headGirdlePitch = (other["柱頭 帯筋ピッチ"]) ? parseFloat(other["柱頭 帯筋ピッチ"].replace(/^\D+/g, ''))/1000 : 0;  

    var headVol= (Math.pow(headD,2)/divValue) * length/2;//area * length
    var girdleArea = (Math.pow(headGirdle,2)/divValue);
    var girdleVolume = (headGirdlePitch == 0) ? 0 : (girdleArea*((W+D)*2)) * (length/headGirdlePitch/2);//need length divided by 2 bcos it owns head,tail
    var headVolume = ((headXfirstRowCount+headXsecondRowcount+headYfirstRowCount+headYsecondRowcount)*headVol)                   
                    +girdleVolume;
        headVolume = headVolume/1000;
                    
    var previousHeadVolume = (TekkinPopupVolume["柱頭"] !== undefined) ? TekkinPopupVolume["柱頭"] : 0;      
    TekkinPopupVolume["柱頭"] =  headVolume + previousHeadVolume;
    //alert(girdleArea+"\n"+headGirdlePitch+"\n"+girdleVolume);
    //柱脚 
    var tailD = (other["柱脚 主筋太径"]) ? parseFloat(other["柱脚 主筋太径"].replace( /^\D+/g, '')) : 0;//replace empty of not digit char     
    var tailXfirstRowCount = parseFloat(other["柱脚 主筋X方向1段太筋本数"].replace(/^\D+/g, '')); 
    var tailXsecondRowcount = parseFloat(other["柱脚 主筋X方向2段太筋本数"].replace(/^\D+/g, '')); 
    var tailYfirstRowCount = parseFloat(other["柱脚 主筋Y方向1段太筋本数"].replace( /^\D+/g, ''));
    var tailYsecondRowcount = parseFloat(other["柱脚 主筋Y方向2段太筋本数"].replace(/^\D+/g, '')); 
    var tailGirdle = (other["柱脚 帯筋径"]) ? parseFloat(other["柱脚 帯筋径"].replace( /^\D+/g, '')) : 0;  
    var tailXGirdleCount = parseFloat(other["柱脚 帯筋X方向本数"].replace(/^\D+/g, '')); 
    var tailYGirdleCount = parseFloat(other["柱脚 帯筋Y方向本数"].replace(/^\D+/g, '')); 
    var tailGirdlePitch = (other["柱脚 帯筋ピッチ"]) ? parseFloat(other["柱脚 帯筋ピッチ"].replace(/^\D+/g, ''))/1000 : 0; 
    
    var tailVol= (Math.pow(tailD,2)/divValue) * length/2;//area * length
    var tailgirdleArea = (Math.pow(tailGirdle,2)/divValue);
    var tailgirdleVolume = (tailGirdlePitch == 0) ? 0 : (tailgirdleArea*((W*2)+(D*2))) * (length/tailGirdlePitch/2);//need length divided by 2 bcos it owns head,tail
    var tailVolume = ((tailXfirstRowCount+tailXsecondRowcount+tailYfirstRowCount+tailYsecondRowcount)*tailVol)                   
                    +tailgirdleVolume;

        tailVolume = tailVolume/1000;

    var previousTailVolume =  (TekkinPopupVolume["柱脚"] !== undefined) ? TekkinPopupVolume["柱脚"] : 0;    
    TekkinPopupVolume["柱脚"] = tailVolume + previousTailVolume;

    levelVolumeArray.push({level:level,start:headVolume,end:tailVolume});

    /*var totalWeight = (headVolume + tailVolume);//convert m cube to tonnes
    var previousWeight = (levelVolumeArray[level]) ? levelVolumeArray[level] : 0 ;    
    levelVolumeArray[level] = totalWeight + previousWeight;*/
    return levelVolumeArray;
}

function FoundationCalculation(filtered,levelVolumeArray){

    var other = filtered['その他']; 
    var kozou = filtered['構造'];    
    var kosoku = filtered['拘束'];
    var sunPo = filtered['寸法'];
    var D = parseFloat(sunPo['D'])/1000;//change mm to m
    var H = parseFloat(sunPo['H'])/1000;
    var W = parseFloat(sunPo['W'])/1000;
    var level = (kosoku["参照レベル"])? kosoku["参照レベル"] : kosoku["基準レベル"]; 
    var divValue = 162;
    //上端筋
    var upperXD = (other["上端筋_X方向_鉄筋径"]) ? parseFloat(other["上端筋_X方向_鉄筋径"].replace( /^\D+/g, '')).toFixed(2) : 0;//replace empty of not digit char     
    var upperXCount = parseFloat(other["上端筋_X方向_鉄筋本数"].replace(/^\D+/g, '')); 
    var upperYD = (other["上端筋_Y方向_鉄筋径"]) ? parseFloat(other["上端筋_Y方向_鉄筋径"].replace(/^\D+/g, '')).toFixed(2) : 0; 
    var upperYCount = parseFloat(other["上端筋_Y方向_鉄筋本数"].replace( /^\D+/g, ''));
    
    var upperXVolume= (Math.pow(upperXD,2)/divValue) * (W+H+H);//area * length
    var upperYVolume = (Math.pow(upperYD,2)/divValue) * (D+H+H);
    var upperVolume = (upperXCount * upperXVolume) + (upperYCount * upperYVolume);
        upperVolume = upperVolume/1000;

    var previousUpper = (TekkinPopupVolume["上端筋"]) ? TekkinPopupVolume["上端筋"] : 0;    
    TekkinPopupVolume["上端筋"] = upperVolume + previousUpper;
   //alert(upperXVolume+"\n"+upperYVolume);
    //alert(W+"\n"+H+"\n"+D+"\n"+upperXD+"\n"+upperXCount+"\n"+upperYD+"\n"+upperYCount);
    
    //下端筋
    var bottomXD = (other["下端筋_X方向_鉄筋径"]) ? parseFloat(other["下端筋_X方向_鉄筋径"].replace( /^\D+/g, '')) : 0;//replace empty of not digit char     
    var bottomXCount = parseFloat(other["下端筋_X方向_鉄筋本数"].replace(/^\D+/g, '')); 
    var bottomYD = (other["下端筋_Y方向_鉄筋径"]) ? parseFloat(other["下端筋_Y方向_鉄筋径"].replace(/^\D+/g, '')) : 0; 
    var bottomYCount = parseFloat(other["下端筋_Y方向_鉄筋本数"].replace( /^\D+/g, ''));

    var bottomXVolume= (Math.pow(bottomXD,2)/divValue) * (W+H+H);//area * length
    var bottomYVolume = (Math.pow(bottomYD,2)/divValue) * (D+H+H);
    var bottomVolume = (bottomXCount * bottomXVolume) + (bottomYCount * bottomYVolume);
        bottomVolume = bottomVolume/1000;
    var previousBottom = (TekkinPopupVolume["下端筋"]) ? TekkinPopupVolume["下端筋"] : 0;    
    TekkinPopupVolume["下端筋"] = bottomVolume + previousBottom;

    levelVolumeArray.push({level:level,start:upperVolume,end:bottomVolume});

    /*var totalWeight = (parseFloat(upperVolume) + parseFloat(bottomVolume));//convert m cube to tonnes
    //totalWeight = (totalWeight).toFixed(2);
    var previousWeight = (levelVolumeArray[level]) ? levelVolumeArray[level] : 0 ;    
    levelVolumeArray[level] = totalWeight + previousWeight;*/
    return levelVolumeArray;
}

function DisplayFormula(){
    var versionSelectedCount = $('#version option:selected').length;
    if(versionSelectedCount > 1){

       TekkinPopupVolume = {};
       ClearTextBox();
        //alert("一つのバージョン選択のみ表示させます。");
        //return;
    }

    if(TekkinPopupVolume["始端"]){

        $("#txtBeamHead").val((parseFloat(TekkinPopupVolume["始端"])).toFixed(2));
        $("#txtBeamCenter").val((parseFloat(TekkinPopupVolume["中央"])).toFixed(2));
        $("#txtBeamBottom").val((parseFloat(TekkinPopupVolume["終端"])).toFixed(2));
        $("#txtColumnHead").val((parseFloat(TekkinPopupVolume["柱頭"])).toFixed(2));
        $("#txtColumnBottom").val((parseFloat(TekkinPopupVolume["柱脚"])).toFixed(2));
        $("#txtFoundationHead").val((parseFloat(TekkinPopupVolume["上端筋"])).toFixed(2));
        $("#txtFoundationBottom").val((parseFloat(TekkinPopupVolume["下端筋"])).toFixed(2));

        var beamStart = (parseFloat(TekkinPopupVolume["始端"])* parseFloat($("#txtBeamHeadMul").val())).toFixed(2);
        var beamCenter = (parseFloat($("#txtBeamCenter").val())).toFixed(2);
        var beamEnd = (parseFloat(TekkinPopupVolume["終端"])* parseFloat($("#txtBeamBottomMul").val())).toFixed(2);
        var colStart = (parseFloat(TekkinPopupVolume["柱頭"]) * parseFloat($("#txtColumnHeadMul").val())).toFixed(2);
        var colEnd = (parseFloat(TekkinPopupVolume["柱脚"]) * parseFloat($("#txtColumnBottomMul").val())).toFixed(2);
        var foundationStart = (parseFloat(TekkinPopupVolume["上端筋"])* parseFloat($("#txtFoundationHeadMul").val())).toFixed(2);
        var foundationEnd = (parseFloat(TekkinPopupVolume["下端筋"])* parseFloat($("#txtFoundationBottomMul").val())).toFixed(2);

        $("#txtBeamHeadTotal").val(beamStart);
        $("#txtBeamBottomTotal").val(beamEnd);
        $("#txtColumnHeadTotal").val(colStart);
        $("#txtColumnBottomTotal").val(colEnd);
        $("#txtFoundationHeadTotal").val(foundationStart);
        $("#txtFoundationBottomTotal").val(foundationEnd);
        var beamTotal = (parseFloat(beamStart) + parseFloat(beamCenter) + parseFloat(beamEnd)).toFixed(2);
        var columnTotal = (parseFloat(colStart) + parseFloat(colEnd)).toFixed(2);
        var foundationTotal = (parseFloat(foundationStart) + parseFloat(foundationEnd)).toFixed(2);
    
        var total = (parseFloat(beamTotal) + parseFloat(columnTotal) + parseFloat(foundationTotal)).toFixed(2);

        $("#txtBeamTotalDisplay").val(beamTotal);
        $("#txtColumnTotalDisplay").val(columnTotal);
        $("#txtFoundationTotalDisplay").val(foundationTotal);
        $("#totalVolume").text(total);             
    }    

    $(".ms-options-wrap.ms-has-selections > button").css("z-index", "-1");
    $(".ms-options-wrap > button").css("z-index", "-1");
    $("#formulaPopup").css("z-index", "5000");
    $("#formulaPopup").css({ visibility: "visible",opacity: "1"});
    $("#formulaPopup").draggable();

}

function ClearTextBox(){
    $("#txtBeamHead").val("");
    $("#txtBeamCenter").val("");
    $("#txtBeamBottom").val("");
    $("#txtColumnHead").val("");
    $("#txtColumnBottom").val("");
    $("#txtFoundationHead").val("");
    $("#txtFoundationBottom").val("");

    $("#txtBeamHeadTotal").val("");
    $("#txtBeamBottomTotal").val("");
    $("#txtColumnHeadTotal").val("");
    $("#txtColumnBottomTotal").val("");
    $("#txtFoundationHeadTotal").val("");
    $("#txtFoundationBottomTotal").val("");

    $("#txtBeamTotalDisplay").val("");
    $("#txtColumnTotalDisplay").val("");
    $("#txtFoundationTotalDisplay").val("");
    $("#totalVolume").text("");           
}

function ReadJsonData(versionName){
    var host = window.location.hostname;
    var url = "http://"+host+"/RevitWebSystem/ForgePage/volume.json";
    $.getJSON(url, function(data) {
     var result =  Object.values(data); // this will show the info it in firebug console
     DisplayVolumeChart(data[versionName])
     //alert(JSON.stringify(data[versionName]));
    });
}

function DisplayVolumeChart(data){
    google.charts.load('visualization',"1", {packages: ['corechart']});  
    google.charts.setOnLoadCallback(function(){ drawVolumeChart(data) });   
}

function drawVolumeChart(data){
    var allLevels = [];
    var tempLevels = [];
    var chartData = [];
    $.each(data,function(key,value){//get all kozou of each level data
        tempLevels =  tempLevels.concat(Object.keys(value));
        allLevels = tempLevels.filter(function (x, i, self) {
        return self.indexOf(x) === i;
        });
    });
    $.each(allLevels,function(index,level){
        var foundation = getDataByLevel("構造基礎",level,data);
        var beam = getDataByLevel("構造フレーム",level,data);
        var column = getDataByLevel("構造柱",level,data);
        var floor = getDataByLevel("床",level,data);
        var wall = getDataByLevel("壁",level,data);
        chartData.push([level,foundation,beam,column,floor,wall]);
    });
    
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'level name');
    dataTable.addColumn('number', '構造基礎');
    dataTable.addColumn('number', '構造フレーム');
    dataTable.addColumn('number', '構造柱');
    dataTable.addColumn('number', '床');
    dataTable.addColumn('number', '壁');
    
    dataTable.addRows(chartData);
    
    var view = new google.visualization.DataView(dataTable);
    //stacked total value display
    view.setColumns([0,
        1, {
        calc: function (dt, row) {
        return dt.getValue(row, 1);
        },
        type: "number",
        role: "annotationText"
        },
        2, {
        calc: function (dt, row) {
        return dt.getValue(row, 2);
        },
        type: "number",
        role: "annotationText"
        },
        3, {
        calc: function (dt, row) {
        return dt.getValue(row, 3);
        },
        type: "number",
        role: "annotationText"
        },
        4, {
        calc: function (dt, row) {
        return dt.getValue(row, 4);
        },
        type: "number",
        role: "annotationText"
        },
        5, {
        calc: function (dt, row) {
        return dt.getValue(row, 5);
        },
        type: "number",
        role: "annotationText"
        },
        // series 1
        {
        calc: function (dt, row) {
        return dt.getValue(row, 1) + dt.getValue(row, 2) + dt.getValue(row, 3) + dt.getValue(row, 4) + dt.getValue(row, 5);
        },
        type: "number",
        role: "annotation"
        }
    ]);

    var options = {

      title: 'コンクリート容積表示チャート',
      animation:{
        duration: 1000,
        easing: 'out',
        startup: true
      },
      vAxis: {
        title: 'Volume (m3) '
      },
      hAxis: {
        title: 'Level',      
      },
      isStacked:true,
      bar: {groupWidth: 30},      
      
    };
    
    var chart = new google.visualization.ColumnChart(document.getElementById('chartContainer'));
    chart.draw(view, options);   
    
}

function getDataByLevel(category,paramLevel,data){
    //alert(Array.isArray(data));return;
    var result = 0;
    $.each(data,function(key,value){
        if(key === category){
            $.each(value,function(levelName,volume){
                if(levelName !== paramLevel)return; 
                    result = (volume == undefined) ? 0:volume; 
            })
        }
       
    });
    return result; 
}

//canvas js library old
/*function DisplayVolumeChart(data){
    
    var versionSelectedCount = $('#version option:selected').length;
    var foundationData = [];
    var beamData = [];
    var columnData = [];
    var floorData = [];
    var wallData = [];
    var tempLevels = [];
    var allLevels = [];
    var valueCount = Object.values(data);
    var labelIndex = valueCount.length - 1;

    $.each(data,function(key,value){//get all kozou of each level data
        tempLevels =  tempLevels.concat(Object.keys(value));
         allLevels = tempLevels.filter(function (x, i, self) {
        return self.indexOf(x) === i;
        });
    });

        $.each(data,function(key,value){
        var orderedVal = {};
        Object.keys(value).sort().forEach(function(key) {
            orderedVal[key] = value[key];
        });
        if(key == "構造基礎"){                
            $.each(allLevels,function(k,level){
                if(Object.keys(orderedVal).includes(level)){
                    foundationData.push({label:level,y:orderedVal[level]});                                     
                }else{
                    foundationData.push({label:level,y:0});
                }
                 
            });
        }else if( key == "構造フレーム"){
            $.each(allLevels,function(k,level){
                if(Object.keys(orderedVal).includes(level)){
                    beamData.push({label:level,y:orderedVal[level]});
                    
                }else{
                    beamData.push({label:level,y:0});
                }
                 
            });
        }else if(key == "構造柱"){
            $.each(allLevels,function(k,level){
                if(Object.keys(orderedVal).includes(level)){
                    columnData.push({label:level,y:orderedVal[level]});                   
                }else{
                    columnData.push({label:level,y:0});
                }
                 
            });
        }else if(key == "床"){
            $.each(allLevels,function(k,level){
                if(Object.keys(orderedVal).includes(level)){
                    floorData.push({label:level,y:orderedVal[level]});
                }else{
                    floorData.push({label:level,y:0});
                }
                 
            });
        }else if(key == "壁"){
            $.each(allLevels,function(k,level){
                if(Object.keys(orderedVal).includes(level)){
                    wallData.push({label:level,y:orderedVal[level]});
                }else{
                    wallData.push({label:level,y:0});
                }
                 
            });
        }
        
    });

    var chart = new CanvasJS.Chart("chartContainer", {
        theme: "light1", // "light2", "dark1", "dark2"
        animationEnabled: true, // change to true	
            
        title:{
            text: "コンクリート容積表示チャート",
            fontSize: 20
        },       
        axisX:{
            interval:1,
            title:"Level",
            labelFontSize:12
        },
        dataPointWidth:30,
        axisY:{
            title: "Volume (m3)",
            gridColor: "gray",
            labelFontSize:12,
            ticks: {
                beginAtZero: true,
              }    
        },
        data: [{
                // Change type to "bar", "area", "spline", "pie",etc.
                type: "stackedColumn",
                showInLegend: true,
                name: "構造基礎",
                color: "#4F81BC",
                dataPoints:foundationData,                
            },{
                type:"stackedColumn",
                showInLegend: true,
                name: "構造柱",
		        color: "#C0504E",
                dataPoints:columnData,
            },{
                type:"stackedColumn",
                showInLegend: true,
                name: "構造フレーム",
		        color: "#9BBB58",
                dataPoints:beamData,
            },{
                type:"stackedColumn",
                showInLegend: true,
                name: "床",
		        color: "#23BFAA",
                dataPoints:floorData,
            },{
                type:"stackedColumn",
                showInLegend: true,
                name: "標準壁",
		        color: "#8064A1",
                dataPoints:wallData,
            }]
        });
        //increasing order
        //sortDataSeries(chart);
        //chart.options.data[0].dataPoints.sort(sortDps());
        chart.render();        
        addIndexLabels(chart,labelIndex);
}*/
 
function DisplayTekkinVolumeChart(data){
    var versionSelectedCount = $('#version option:selected').length;
    var foundationData = [];
    var beamData = [];
    var columnData = [];
    var valueCount = Object.values(data);
    var labelIndex = valueCount.length - 1;
    
    var beamArray = [];
    var colArray = [];
    var foundArray = [];
    var levels = []; 
    $.each(data,function(key,value){
    
        if(key == "構造基礎"){  
            foundArray = GroupByValueSumTwoItem(value);
            $.each(foundArray,function(k,data){
                if(levels.indexOf(data.level) == -1 ){//does not exist in array
                    levels.push(data.level);
                }                                  
            });
            
        }else if( key == "構造フレーム"){
            beamArray = GroupByValueSum(value); 
            $.each(beamArray,function(k,data){
                if(levels.indexOf(data.level) == -1 ){//does not exist in array
                    levels.push(data.level);
                }                                  
            });
           
        }else if(key == "構造柱"){
            colArray = GroupByValueSumTwoItem(value); 
            $.each(colArray,function(k,data){
                if(levels.indexOf(data.level) == -1 ){//does not exist in array
                    levels.push(data.level);
                }                                  
            });           
        }
        
    });
    
    //levels.sort();
    //alert(levels);
    //foundation
    var foundHeadMul = (parseFloat($("#txtFoundationHeadMul").val())).toFixed(2); 
    var foundBottomdMul = (parseFloat($("#txtFoundationBottomMul").val())).toFixed(2);
    $.each(levels,function(k,level){
        var currentLevelValue = foundArray.filter(x=>x.level == level);
        if(currentLevelValue == "undefined" || currentLevelValue == ""){
            foundationData.push({label:level,y:0});
        }else{
            var start = ((parseFloat(currentLevelValue[0].start)).toFixed(2))*foundHeadMul;
            var end = ((parseFloat(currentLevelValue[0].end)).toFixed(2))*foundBottomdMul;
            var total = (parseFloat(start) + parseFloat(end)).toFixed(2); 
            foundationData.push({label:level,y:total*1});
        }            
    });                  
    
    //beam
    var beamMul = (parseFloat($("#txtBeamHeadMul").val())).toFixed(2); 
    $.each(levels,function(k,level){
        var currentLevelValue = beamArray.filter(x=>x.level == level);
        if(currentLevelValue == "undefined" || currentLevelValue == ""){
            beamData.push({label:level,y:0});//change to integer by multiply by 1
        }else{
            var beamStart = ((parseFloat(currentLevelValue[0].beamStart)).toFixed(2))*beamMul;
            var beamCenter = (parseFloat(currentLevelValue[0].beamCenter)).toFixed(2);
            var beamEnd = ((parseFloat(currentLevelValue[0].beamEnd)).toFixed(2))*beamMul;
            var total = (parseFloat(beamStart) + parseFloat(beamCenter) + parseFloat(beamEnd)).toFixed(2); 
            beamData.push({label:level,y:total*1});//change to integer by multiply by 1
        }            
    });               
  
    //column
    var colHeadMul = (parseFloat($("#txtColumnHeadMul").val())).toFixed(2); 
    var colBottomdMul = (parseFloat($("#txtColumnBottomMul").val())).toFixed(2);
    $.each(levels,function(k,level){
        var currentLevelValue = colArray.filter(x=>x.level == level);
        if(currentLevelValue == "undefined" || currentLevelValue == ""){
            columnData.push({label:level,y:0});
        }else{
            var start = ((parseFloat(currentLevelValue[0].start)).toFixed(2))*colHeadMul;
            var end = ((parseFloat(currentLevelValue[0].end)).toFixed(2))*colBottomdMul;
            var total = (parseFloat(start) + parseFloat(end)).toFixed(2); 
            columnData.push({label:level,y:total*1});
        }            
    }); 
    
    //for google charts library data preparation
    var chartData = [];
    $.each(levels,function(k,level){
        var foundationObj = foundationData.find(x=>x["label"] == level);
        var beamObj = beamData.find(x=>x["label"] == level);
        var columnObj = columnData.find(x=>x["label"] == level);
        var foundation = foundationObj["y"];
        var beam = beamObj["y"];
        var column = columnObj["y"];
        chartData.push([level,foundation,beam,column]);
    });
    google.charts.load('visualization',"1", {packages: ['corechart']});  
    google.charts.setOnLoadCallback(function(){ drawTekkinChart(chartData) });   

    
/*alert(JSON.stringify(foundationData)+"\n"+JSON.stringify(beamData)+"\n"+JSON.stringify(columnData));return;
    var chart = new CanvasJS.Chart("chartContainer", {
        theme: "light1", // "light2", "dark1", "dark2"
        animationEnabled: true, // change to true	
            
        title:{
            text: "鉄筋容積表示チャート",
            fontSize: 20
        },       
        axisX:{
            interval:1,
            title:"Level",
            labelFontSize:12
        },
        dataPointWidth:30,
        axisY:{
            title: "Weight (t) ",
            gridColor: "gray",
            labelFontSize:12,
            ticks: {
                beginAtZero: true,
              }    
        },
        data: [{
                // Change type to "bar", "area", "spline", "pie",etc.
                type: "stackedColumn",
                showInLegend: true,
                name: "構造基礎",
                color: "#4F81BC",
                dataPoints:foundationData,                
            },{
                type:"stackedColumn",
                showInLegend: true,
                name: "構造柱",
		        color: "#C0504E",
                dataPoints:columnData,
            },{
                type:"stackedColumn",
                showInLegend: true,
                name: "構造フレーム",
		        color: "#9BBB58",
                dataPoints:beamData,
            }]
        });
        sortDataSeries(chart);
        //chart.options.data[0].dataPoints.sort(sortDps());
        chart.render();        
        addIndexLabels(chart,labelIndex);*/
}

function drawTekkinChart(chartData){
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'level name');
    dataTable.addColumn('number', '構造基礎');
    dataTable.addColumn('number', '構造フレーム');
    dataTable.addColumn('number', '構造柱');

    dataTable.addRows(chartData);
    var view = new google.visualization.DataView(dataTable);
    //stacked total value display
    view.setColumns([0,
        1, {
        calc: function (dt, row) {
        return dt.getValue(row, 1);
        },
        type: "number",
        role: "annotationText"
        },
        2, {
        calc: function (dt, row) {
        return dt.getValue(row, 2);
        },
        type: "number",
        role: "annotationText"
        },
        3, {
        calc: function (dt, row) {
        return dt.getValue(row, 3);
        },
        type: "number",
        role: "annotationText"
        },
       
        // series 1
        {
        calc: function (dt, row) {
        return dt.getValue(row, 1) + dt.getValue(row, 2) + dt.getValue(row, 3);
        },
        type: "number",
        role: "annotation"
        }
    ]);
    var options = {
      title: '鉄筋容積表示チャート',
      isStacked:true,
      hAxis: {
        title: 'Level',      
      },
      animation:{
        duration: 1000,
        easing: 'out',
        startup: true
      },
      vAxis: {
        title: 'Weight (t) '
      },
      bar: {groupWidth: 30}
    };
    
    var chart = new google.visualization.ColumnChart(document.getElementById('chartContainer'));
    chart.draw(view, options);   
}

function DisplayEachProjectTekkinChart(tekkinData){

    var chartData = [];
    $.each(tekkinData, function(prjName, value){
       var totalWeight = 0;
       $.each(value, function(k,v){//kouzou loop
        if(k == "構造基礎"){           
            var allLevels = GroupByValueSumTwoItem(v); 
            var foundHeadMul = (parseFloat($("#txtFoundationHeadMul").val())).toFixed(2); 
            var foundBottomdMul = (parseFloat($("#txtFoundationBottomMul").val())).toFixed(2);               
            $.each(allLevels,function(k,currentLevelValue){
                var start = ((parseFloat(currentLevelValue.start)).toFixed(2))*foundHeadMul;
                var end = ((parseFloat(currentLevelValue.end)).toFixed(2))*foundBottomdMul;
                var total = (parseFloat(start) + parseFloat(end)).toFixed(2);               
                totalWeight = parseFloat(totalWeight)+  parseFloat(total);           
            });

        }else if( k == "構造フレーム"){
            var allLevels = GroupByValueSum(v); 
            var beamMul = (parseFloat($("#txtBeamHeadMul").val())).toFixed(2); 
            var total = 0;
            $.each(allLevels,function(k,currentLevelBeam){
                var beamStart = ((parseFloat(currentLevelBeam.beamStart)).toFixed(2))*beamMul;
                var beamCenter = (parseFloat(currentLevelBeam.beamCenter)).toFixed(2);
                var beamEnd = ((parseFloat(currentLevelBeam.beamEnd)).toFixed(2))*beamMul;
                var total = (parseFloat(beamStart) + parseFloat(beamCenter) + parseFloat(beamEnd)).toFixed(2); 
                totalWeight = parseFloat(totalWeight)+  parseFloat(total);
                               
            });
        }else if(k == "構造柱"){
            var allLevels = GroupByValueSumTwoItem(v); 
            var colHeadMul = (parseFloat($("#txtColumnHeadMul").val())).toFixed(2); 
            var colBottomdMul = (parseFloat($("#txtColumnBottomMul").val())).toFixed(2);
            $.each(allLevels,function(k,currentLevelValue){
                var start = ((parseFloat(currentLevelValue.start)).toFixed(2))*colHeadMul;
                var end = ((parseFloat(currentLevelValue.end)).toFixed(2))*colBottomdMul;
                var total = (parseFloat(start) + parseFloat(end)).toFixed(2); 
                totalWeight = parseFloat(totalWeight)+  parseFloat(total);
                               
            });
        }  
         totalWeight = (parseFloat(totalWeight)).toFixed(2);     
       });
       //chartData.push({label:prjName,y:totalWeight*1});
       chartData.push([prjName,totalWeight*1]);
    }); 

    google.charts.load('visualization',"1", {packages: ['corechart']});  
    google.charts.setOnLoadCallback(function(){ drawTekkinChartForMultiProject(chartData) });  

    /*var chart = new CanvasJS.Chart("chartContainer", {
     theme: "light1", // "light2", "dark1", "dark2"
     animationEnabled: true, // change to true	
         
     title:{
         text: ""
     },
    
     axisX:{
         interval:1,
         title:"Projects",
         labelFontSize:12
     },
     dataPointWidth:30,
     axisY:{
         title:"Weight (t)",
         gridColor: "gray",
         labelFontSize:12,
          
     },
     data: [{
             // Change type to "bar", "area", "spline", "pie",etc.
             type: "column",
             dataPoints:chartData,          
         }]
     });
    chart.render();   */  
 }

 function drawTekkinChartForMultiProject(chartData){
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'level name');
    dataTable.addColumn('number', 'weight');

    dataTable.addRows(chartData);

    var options = {
      title: '',
      hAxis: {
        title: 'Level',      
      },
      animation:{
        duration: 1000,
        easing: 'out',
        startup: true
      },
      series: [{visibleInLegend: false}],
      vAxis: {
        title: 'Weight (t) '
      },
      bar: {groupWidth: 30}
    };
    
    var chart = new google.visualization.ColumnChart(
      document.getElementById('chartContainer'));

    chart.draw(dataTable, options);   
 }

function GroupByValueSum(array){
    var result = [];
    array.reduce(function(res, value) {
    if (!res[value.level]) {
        res[value.level] = { level: value.level, beamStart: 0 ,beamCenter:0,beamEnd:0};
        result.push(res[value.level])
    }
    res[value.level].beamStart += value.beamStart;
    res[value.level].beamCenter += value.beamCenter;
    res[value.level].beamEnd += value.beamEnd;
    return res;
    }, {});

    return result;
}

function GroupByValueSumTwoItem(array){
    var result = [];
    array.reduce(function(res, value) {
    if (!res[value.level]) {
        res[value.level] = { level: value.level, start: 0 ,end:0};
        result.push(res[value.level])
    }
    res[value.level].start += value.start;
    res[value.level].end += value.end;
    return res;
    }, {});

    return result;
}

function sortDataSeries(chart){
    var total = [];
    var tempTotal, temp;
    var dpsTotal = 0;
    for(var j = 0; j < chart.options.data[0].dataPoints.length; j++) {
      dpsTotal = 0;

      for(var i = 0; i < chart.options.data.length; i++) {
          if(chart.options.data[i].dataPoints[j] === undefined ) continue;            
            dpsTotal += (chart.options.data[i].dataPoints[j]["y"]);        
      }
      total.push(dpsTotal);
    }

    for(var i = 0; i < total.length; i++) {        
      for( var j = 0; j < total.length - i - 1; j++){      
        if(total[j] < total[j+1]) {
        	tempTotal = total[j];
          total[j] = total[j+1];
          total[j+1] = tempTotal;
          for(var k = 0; k < chart.options.data.length; k++){
            temp = chart.options.data[k].dataPoints[j];
            if(temp === undefined ) continue;         
            chart.options.data[k].dataPoints[j] = chart.options.data[k].dataPoints[j+1];
            chart.options.data[k].dataPoints[j+1] = temp;
          }
        }
      }
    }    
}

function sortDps(){
    return function(a, b){
      if(a.label < b.label){
        return -1;
      }else if(a.label > b.label){
        return 1;
      }else{
        return 0;   
      }
    }
}

function addIndexLabels(chart,labelIndex){

    for(var j = 0; j < chart.data.length; j++)
                    chart.options.data[j].indexLabel = "";

        //labelIndex = labelIndex -1;
        chart.options.data[labelIndex].indexLabel = "#total";
        chart.options.data[labelIndex].indexLabelPlacement =  "outside";
        chart.options.data[labelIndex].indexLabelFontSize =  15;
        //chart.animationEnabled = true;
        chart.render();   
}
//manhitka ma youtlarng yin danhitot youtlarpaypar

function SaveProject(){
    if(userEmail == ""){
        alert("FORGEログインが必要です。");return;
    }
    //var selectedFolderCount = $('#projectFolder option:selected').length;
    //if(selectedFolderCount == 0) return;
    var projectName = [];
    $('#projectFolder option').each(function(){ 
        var name = $(this).text();      
        if($(this).is(":selected")){
            projectName.push([name,1]);   
        }else if(relatedProjects.includes(name)){
            projectName.push([name,0]);
        }
        
            
    });
   
    $.ajax({
        type: 'POST',
            url: './ForgePage/SaveProject.php',
            data:{message:"saveProject",projects:JSON.stringify(projectName),userEmail:userEmail},
            success :function(data) {               
            if(data.includes("success")){
                alert("保存しました。");
                location.reload();
            }else{
                alert(data);
            }
        }
    })

}

/*function ProjectDownload(){
    var versionSelectedCount = $('#version option:selected').length;
    if(versionSelectedCount <= 0){
        alert("Please select just one version!");
        return;
    }
    var folderObj = JSON.parse($("#projectFolder option:selected").val());
    var versionObj = JSON.parse($("#version option:selected").val());
    var fileName = $("#version option:selected").text();
    var split = fileName.split(".rvt");
    var versionId = versionObj.versionId;
    var projectId = folderObj.projectId;
    //alert(versionId+"----------"+ projectId);return;
    $("#loader").removeClass("bgNone");
    
    $.ajax({
            type: 'POST',
            url: './ForgePage/Download.php',
            data:{message:"Download",versionId:versionId,projectId:projectId,fileName:split[0]},
            success :function(data) {
                $("#loader").addClass("bgNone");
               alert(data);
                console.log(data);
                if(data.includes("success")){
                    var url = './ForgePage/Download.php?fileName='+split[0];
                    var formName = "DownloadRVT";
                    document.forms[formName].action = url;//multiple form submit action
                    document.forms[formName].submit();  
                }else{
                    $("#loader").addClass("bgNone");
                    alert(JSON.stringify(data));
                }                            
            },
            error:function(err){
                $("#loader").addClass("bgNone");
                alert(err);
            }
    });
}*/

function SaveBackupProject(){

    if(userEmail == ""){
        alert("FORGEログインが必要です。");return;
    }
    //var selectedFolderCount = $('#projectFolder option:selected').length;
    //if(selectedFolderCount == 0) return;
    var projectName = [];
    $('#projectFolder option').each(function(){ 
        var name = $(this).text();      
        if($(this).is(":selected")){
            projectName.push(name);   
        }                  
    });

    $.ajax({
        type: 'POST',
            url: './ForgePage/SaveBackupProject.php',
            data:{message:"saveProject",projects:JSON.stringify(projectName)},
            success :function(data) { 
              
                if(data.includes("success")){
                    alert("保存しました。");
                    //location.reload();
                }else{
                    alert(data);
                }
            },
            error:function(err){
                alert(JSON.stringify(err));
            }
    });

}