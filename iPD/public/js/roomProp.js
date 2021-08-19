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
    //if(useableProjects != null)
    LoadComboData();

    $("#project").change(function() {
        ProjectChange();
    });

    $("#item").change(function() {
        ItemChange();
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
    //$("select#"+comboId+" option").remove();
    $("#"+comboId).append(appendText).multiselect("reload");
}

function ProjectChange(){
     
     var folderSelectedCount = $('#project option:selected').length;
     var itemOption = "";
     var versionOption = "";

     if(folderSelectedCount > 0){

        $('#project option:selected').each(function(){           
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
        $("#version").append(versionOption).multiselect("reload");
     }else{
        LoadComboData();
     }       
}

function ItemChange(){

}

var tableData = [];
function GetRoomProperties(){
    console.log("GetRoomProperties start");
    
    //レベルごとの床仕上げ材分布
    var floorDataForEachLevel = {};     //{ [レベルA]   :{[床仕上材A]:[面積], [床仕上材B]:[面積]…},
                                        //  [レベルB]   :{[床仕上材D]:[面積], [床仕上材C]:[面積]…} }
    //床仕上げ材ごとの部屋分布(レベルごとに分けられていない)
	var roomDataForEachFlooring = {};	//{ [床仕上材A] :{[部屋名A]  :[面積], [部屋名B]  :[面積]…},
										//  [床仕上材B] :{[部屋名A]  :[面積], [部屋名B]  :[面積]…} }
    //床仕上げ材ごとの部屋分布(レベルごとに分けた)
	var roomDataForEachLevel = {};      //{ [レベルA]   :{ [床仕上材A] :{[部屋名A]  :[面積], [部屋名B]  :[面積]…},
										//                 [床仕上材B] :{[部屋名A]  :[面積], [部屋名B]  :[面積]…} }
										//{ [レベルB]   :{ [床仕上材A] :{[部屋名A]  :[面積], [部屋名B]  :[面積]…},
										//                 [床仕上材B] :{[部屋名A]  :[面積], [部屋名B]  :[面積]…} }

	var perimeterForEachLevel = {};     //{ [レベルA]   :{ [部屋名A]  :[周長], [部屋名B]  :[周長]…}}
										//{ [レベルB]   :{ [部屋名A]  :[周長], [部屋名B]  :[周長]…}}
	var calcHeightForEachLevel = {};    //{ [レベルA]   :{ [部屋名A]  :[算定高さ], [部屋名B]  :[算定高さ]…}}
										//{ [レベルB]   :{ [部屋名A]  :[算定高さ], [部屋名B]  :[算定高さ]…}}
	var roomHeightForEachLevel = {};    //{ [レベルA]   :{ [部屋名A]  :[部屋高さ], [部屋名B]  :[部屋高さ]…}}
										//{ [レベルB]   :{ [部屋名A]  :[部屋高さ], [部屋名B]  :[部屋高さ]…}}
    
    var strOther = "NoName";
    tableData.length = 0;//array clear
    var projectSelectedCount = $('#version option:selected').length;
    if(projectSelectedCount == 1){
        var valArray =JSON.parse($('#version option:selected').val());
        var urn = valArray.forge_version_id;
        // console.log(urn);return;
        $("#loader").removeClass("bgNone");
        $.ajax({
            url: "../roomProp/getRoomProp",
            type: 'post',
            data:{_token: CSRF_TOKEN,message:"getProperties",urn:urn},
            success :function(data) {
        
                // console.log("RoomPropController@GetRoomProp success");
                $("#loader").addClass("bgNone");
                //console.log(data);//return;
                
                if (data == ""){
                    CreateChartsTable({},{});
                    return;
                }
                var result = JSON.parse(data);
                
                // console.log("**********************************************");
                // console.log("create chartData start");

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
                    
                    //#################################################
                    /* レベル毎の床仕上情報(床仕上げ材)作成 */
                    if ((area != "") && (area != undefined) && (area != null)) {
                        var tmpFloorData = {};
                        var tmpArea = area.split(" ");          //remove m^2 sign
                        var fArea = parseFloat(tmpArea[0]);     //convert:string->Float
                        // console.log("Level::レベル毎の床仕上情報(床仕上げ材)作成 面積["+fArea+"]");
                        
                        if ((level != "") && (level != undefined) && (level != null)){
                            
                            if (floorDataForEachLevel[level]){
                                //level登録済
                                
                                tmpFloorData = floorDataForEachLevel[level];
                                
                                if (tmpFloorData[floorFinish]) {
                                    //床仕上げ材登録済
                                    // console.log("Level::[level登録済][床仕上げ材登録済]floorFinish["+floorFinish+"]");
                                    // console.log("Level::面積加算前"+JSON.stringify(tmpFloorData));
                                    tmpFloorData[floorFinish] += fArea;
                                    // console.log("Level::面積加算後"+JSON.stringify(tmpFloorData));
                                }
                                else{
                                    //床仕上げ材未登録
                                    if ((floorFinish != "") && (floorFinish != undefined) && (floorFinish != null)){
                                        tmpFloorData[floorFinish] = fArea;
                                        // console.log("Level::面積新規追加"+JSON.stringify(tmpFloorData));
                                    }
                                    else{
                                        if (tmpFloorData[strOther]){
                                            // console.log("Level::[level登録済][床仕上げ材未登録]floorFinish["+floorFinish+"]");
                                            // console.log("Level::面積加算前"+JSON.stringify(tmpFloorData));
                                            tmpFloorData[strOther] += fArea;
                                            // console.log("Level::面積加算後"+JSON.stringify(tmpFloorData));
                                        }
                                        else{
                                            tmpFloorData[strOther] = fArea;
                                        }
                                    }
                                }
                            }
                            else{
                                //level未登録
                                if ((floorFinish != "") && (floorFinish != undefined) && (floorFinish != null)){
                                    tmpFloorData[floorFinish] = fArea;
                                    // console.log("Level::面積新規追加"+JSON.stringify(tmpFloorData));
                                }
                                else{
                                    tmpFloorData[strOther] = fArea;
                                }
                            }
                            
                            floorDataForEachLevel[level] = tmpFloorData;
                        }
                        else{
                            console.log("Level::Debug point:Level is empty");
                        }
                    }
                    else{
                        console.log("Level::Debug point:area is empty");
                    }
                    
                    //#################################################
                    /* レベル毎の床仕上材/部屋前/面積情報作成 */
                    var tmpLevelRoomData = {};
                    var tmpRoomData = {};
                    var tmpArea = area.split(" ");          //remove m^2 sign
                    var fArea = parseFloat(tmpArea[0]);     //convert:string->Float

                    // console.log("Room::床仕上げ毎の部屋情報(部屋名:レベルごと)作成 面積["+fArea+"]");

                    if ((level != "") && (level != undefined) && (level != null)){
                        if ((area != "") && (area != undefined) && (area != null)) {
                            if ((floorFinish != "") && (floorFinish != undefined) && (floorFinish != null)){
                                
                                if (roomDataForEachLevel[level]){
                                    //level登録済
                                    tmpLevelRoomData = roomDataForEachLevel[level];

                                }
                                
                                if (tmpLevelRoomData[floorFinish]){
                                    //floorFinish登録済
                                    
                                    tmpRoomData = tmpLevelRoomData[floorFinish];

                                    if (tmpRoomData[roomname]) {
                                        //部屋名登録済
    
                                        // console.log("Room::[floorFInish登録済][部屋名登録済]tmpRoomData["+tmpRoomData+"]");
                                        // console.log("Room::面積加算前"+JSON.stringify(tmpRoomData));
                                        tmpRoomData[roomname] += fArea;
                                        // console.log("Room::面積加算後"+JSON.stringify(tmpRoomData));
                                    }
                                    else{
                                        //部屋名未登録
                                        if ((roomname != "") && (roomname != undefined) && (roomname != null)){
                                            tmpRoomData[roomname] = fArea;
                                            // console.log("Room::面積新規追加"+JSON.stringify(tmpRoomData[roomname]));
                                        }
                                        else{
                                            if (tmpRoomData[strOther]){
                                            // console.log("Room::[floorFInish登録済][部屋名未登録]tmpRoomData["+tmpRoomData+"]");
                                            // console.log("Room::面積加算前"+JSON.stringify(tmpRoomData));
                                            tmpRoomData[strOther] += fArea;
                                            // console.log("Room::面積加算後"+JSON.stringify(tmpRoomData));
                                            }
                                            else{
                                                tmpRoomData[strOther] = fArea;
                                            }
                                        }
                                    }
                                }
                                else{
                                    //floorFinish未登録
                                    if ((roomname != "") && (roomname != undefined) && (roomname != null)){
                                        tmpRoomData[roomname] = fArea;
                                        // console.log("Room::面積新規追加"+JSON.stringify(tmpRoomData[roomname]));
                                    }
                                    else{
                                        tmpRoomData[strOther] = fArea;
                                    }
                                }
                            
                                tmpLevelRoomData[floorFinish] = tmpRoomData;

                                roomDataForEachLevel[level] = tmpLevelRoomData;

                            }
                            else{
                                console.log("Room::Debug point:floorFinish is empty");
                            }
                        }
                        else{
                            console.log("Room::Debug point:area is empty");
                        }
                    }
                    else{
                        //level名不正
                        console.log("Room::Debug point:Level is empty");
                    }
                    
                    //################################################# 
                    /* 棒グラフ表示用データ作成 */
                    if ( (length != "") && (length != undefined) && (length != null) &&
                         (height != "") && (height != undefined) && (height != null) &&
                         (levelHeight != "") && (levelHeight != undefined) && (levelHeight != null)
                       ) {
                        var tmpPerimeter = {};
                        var tmpCalcHeight = {};
                        var tmpRoomHeight = {};
                        var tmpLen = length.split(" ");
                        var fLen = parseFloat(tmpLen[0]);
                        var tmpCalcH = height.split(" ");
                        var fCalcH = parseFloat(tmpCalcH[0]);
                        var tmpRoomH = levelHeight.split(" ");
                        var fRoomH = parseFloat(tmpRoomH[0]);
                        // console.log("Level2::レベル毎の床仕上情報(床仕上げ材)作成 面積["+fArea+"]");
                        
                        if ((level != "") && (level != undefined) && (level != null)){
                            
                            if (perimeterForEachLevel[level]){
                                //level登録済
                                
                                tmpPerimeter = perimeterForEachLevel[level];
                                tmpCalcHeight = calcHeightForEachLevel[level];
                                tmpRoomHeight = roomHeightForEachLevel[level];
                                
                                if (tmpPerimeter[roomname]) {
                                    //部屋名登録済
                                    // console.log("Level2::[level登録済][部屋名登録済]floorFinish["+floorFinish+"]");
                                    // console.log("Level2::面積加算前"+JSON.stringify(tmpPerimeter));
                                    tmpPerimeter[roomname] += fLen;
                                    tmpCalcHeight[roomname] += fCalcH;
                                    tmpRoomHeight[roomname] += fRoomH;
                                    // console.log("Level2::面積加算後"+JSON.stringify(tmpPerimeter));
                                }
                                else{
                                    //部屋名未登録
                                    if ((roomname != "") && (roomname != undefined) && (roomname != null)){
                                        tmpPerimeter[roomname] = fLen;
                                        tmpCalcHeight[roomname] = fCalcH;
                                        tmpRoomHeight[roomname] = fRoomH;
                                        // console.log("Level2::面積新規追加"+JSON.stringify(tmpPerimeter));
                                    }
                                    else{
                                        if (tmpPerimeter[strOther]){
                                            // console.log("Level2::[level登録済][部屋名未登録]floorFinish["+floorFinish+"]");
                                            // console.log("Level2::面積加算前"+JSON.stringify(tmpPerimeter));
                                            tmpPerimeter[strOther] += fLen;
                                            tmpCalcHeight[strOther] += fCalcH;
                                            tmpRoomHeight[strOther] += fRoomH;
                                            // console.log("Level2::面積加算後"+JSON.stringify(tmpPerimeter));
                                        }
                                        else{
                                            tmpPerimeter[strOther] = fLen;
                                            tmpCalcHeight[strOther] = fCalcH;
                                            tmpRoomHeight[strOther] = fRoomH;
                                        }
                                    }
                                }
                            }
                            else{
                                //level未登録
                                if ((roomname != "") && (roomname != undefined) && (roomname != null)){
                                    tmpPerimeter[roomname] = fLen;
                                    tmpCalcHeight[roomname] = fCalcH;
                                    tmpRoomHeight[roomname] = fRoomH;
                                    // console.log("Level2::面積新規追加"+JSON.stringify(tmpPerimeter));
                                }
                                else{
                                    tmpPerimeter[strOther] = fLen;
                                    tmpCalcHeight[strOther] = fCalcH;
                                    tmpRoomHeight[strOther] = fRoomH;
                                }
                            }
                            
                            perimeterForEachLevel[level] = tmpPerimeter;
                            calcHeightForEachLevel[level] = tmpCalcHeight;
                            roomHeightForEachLevel[level] = tmpRoomHeight;
                        }
                        else{
                            console.log("Level2::Debug point:Level is empty");
                        }
                    }
                    else{
                        console.log("Level2::Debug point:length or height or LevelHeight is empty");
                    }
                });
                
                // console.log("create chartData end");
                // console.log("**********************************************");
                // console.log("RESULT[floorDataForEachLevel]"+JSON.stringify(floorDataForEachLevel));
                // console.log("RESULT[roomDataForEachFlooring]"+JSON.stringify(roomDataForEachFlooring));
                // console.log("RESULT[roomDataForEachLevel]"+JSON.stringify(roomDataForEachLevel));
                // console.log("RESULT[perimeterForEachLevel]"+JSON.stringify(perimeterForEachLevel));
                // console.log("RESULT[calcHeightForEachLevel]"+JSON.stringify(calcHeightForEachLevel));
                // console.log("RESULT[roomHeightForEachLevel]"+JSON.stringify(roomHeightForEachLevel));
                // console.log("**********************************************");
                CreateChartsTable(floorDataForEachLevel, roomDataForEachLevel, perimeterForEachLevel, calcHeightForEachLevel, roomHeightForEachLevel);
            },
            error :function(err){
                console.log(err);
                alert("Unexpected service interruption.Please try again later.");
                $("#loader").addClass("bgNone");
            }
        });
    }else{
        alert("Please select just one project");
    }

}

function CreateChartsTable(floorDataForEachLevel, roomDataForEachLevel, perimeterForEachLevel, calcHeightForEachLevel, roomHeightForEachLevel){

    $("#roomPieChartDiv").empty();
    $("#roomPieChartDiv table").remove();

    if (JSON.stringify(floorDataForEachLevel) !== "{}") {
        DisplayPieChart(floorDataForEachLevel, roomDataForEachLevel, perimeterForEachLevel, calcHeightForEachLevel, roomHeightForEachLevel);
        //$('div[id^="myDIV"]').css('display',"none");
    }
    else{
        alert("No Floor information");
    }
}

function DisplayPieChart(levelChartData,  roomlevelChartData, perimeterForEachLevel, calcHeightForEachLevel, roomHeightForEachLevel){
    console.log("DisplayPieChart start");
    
    var appendTbl = "";   //class='main-content'
    var levelCnt = 0;
    
    Object.keys(levelChartData).forEach(function(level) {
        var floorCnt = 1;
        levelCnt++;
        var divBoxShadow =  "box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),"+
                                    "0 1px 5px 0 rgba(0,0,0,0.12),"+
                                    "0 3px 1px -2px rgba(0,0,0,0.2);";
        var divLevelMargin = "margin: 20px 10px 10px 0px;";
        var divFloorMargin = "margin: 20px 10px 10px 10px;";
        var tmpChartData = levelChartData[level];
        var flooringChartData = roomlevelChartData[level];
        var perimeterChartData = perimeterForEachLevel[level];
        var calcHChartData = calcHeightForEachLevel[level];
        var roomHChartData = roomHeightForEachLevel[level];
        var periBarCartData = [];
        var calcBarCartData = [];
        var roomBarCartData = [];

        appendTbl += "<div id=roomPieChartDiv"+levelCnt+" style='width:100%;display:flex;flex-direciton:row;'>";    //aaa
        appendTbl += "<div id=levelChartBox"+levelCnt+" style='height:400px;width:450px;"+divBoxShadow+divLevelMargin+"'>";    //bbb
        appendTbl += "<div id=levelChartBox-header style='border-bottom: 1px solid #f4f4f4;'>";   //id=levelChartBox-header
        appendTbl += "<h4 class='levelCC-title'>【"+level+"】床仕上げ("+"m&sup2"+")</h4>";
        appendTbl += "</div>";  //id=levelChartBox-header
        appendTbl += "<div id=levelChartBox-body style='height:90%;width:100%;'>";   //id=levelChartBox-body
        appendTbl += "<div id=floorChartContainer"+levelCnt+floorCnt+" style='height:100%;width:450px;'></div>";
        DrawPieChart(levelChartData[level], level, levelCnt, floorCnt);
        appendTbl += "</div>";  //id=levelChartBox-body
        appendTbl += "</div>";  //bbb
        appendTbl += "<div id=floorChartContainer"+levelCnt+" style='height:400px;display:flex;flex-direction:row;'>";  //eee
        Object.keys(tmpChartData).forEach(function(floor) {
            floorCnt++;

            if ((floor != 'NoName') && flooringChartData[floor]){

                appendTbl += "<div id=floorChartBox style='height:400px;width:450px;"+divBoxShadow+divFloorMargin+"'>";    //id=floorChartBox
                appendTbl += "<div id=floorChartBox-header style='border-bottom: 1px solid #f4f4f4;'>";   //id=floorChartBox-header
                appendTbl += "<h5 class='floorChartBox-title'>【"+floor+"】部屋("+"m&sup2"+")</h5>";
                appendTbl += "</div>";  //id=floorChartBox-header
                appendTbl += "<div id=floorChartBox-body style='height:90%;width:100%;'>";   //id=floorChartBox-body
                appendTbl += "<div id=floorChartContainer"+levelCnt+floorCnt+" style='height:100%;width:450px;'></div>";
                DrawPieChart(flooringChartData[floor], floor, levelCnt, floorCnt);
                appendTbl += "</div>";  //id=floorChartBox-body
                appendTbl += "</div>";  //id=floorChartBox
            }
            // console.log("flooringChartData[floor]"+JSON.stringify(flooringChartData[floor]));
        });
        appendTbl += "</div>";  //eee
        appendTbl += "</div>";  //aaa
        appendTbl += "<button class='btn-border' onclick='toggleSunpoInfo("+levelCnt+")'>寸法情報</button>";
        appendTbl += "<div id=myDIV"+levelCnt;  //kkk
        appendTbl += " style='display:block;width:100%;'>";    //ここでdisplay:noneにするとGoogleChartが正しく描画されないためblockにする

        Object.keys(perimeterChartData).forEach(function(roomName) {
            periBarCartData.push([roomName, perimeterChartData[roomName]]);
        });
        appendTbl += "<div id=perimeterChartContainer"+levelCnt+" style='width:1600px;height:450px;margin-top: 20px;margin-buttom: 20px;'></div>";
        DrawBarChart(periBarCartData, "perimeterChartContainer"+levelCnt, '周長');
        console.log("periBarCartData"+JSON.stringify(periBarCartData));
        
        Object.keys(calcHChartData).forEach(function(roomName) {
            calcBarCartData.push([roomName, calcHChartData[roomName]]);
        });
        appendTbl += "<div id=calcHeightChartContainer"+levelCnt+" style='width:1600px;height:450px;margin-top: 20px;margin-buttom: 20px;'></div>";
        DrawBarChart(calcBarCartData, "calcHeightChartContainer"+levelCnt, '算定高さ');
        // console.log("calcBarCartData"+JSON.stringify(calcBarCartData));

        Object.keys(roomHChartData).forEach(function(roomName) {
            roomBarCartData.push([roomName, roomHChartData[roomName]]);
        });
        appendTbl += "<div id=roomHeightChartContainer"+levelCnt+" style='width:1600px;height:450px;margin-top: 20px;margin-buttom: 20px;'></div>";
        DrawBarChart(roomBarCartData, "roomHeightChartContainer"+levelCnt, '部屋高さ(レベル指定)');
        // console.log("roomBarCartData"+JSON.stringify(roomBarCartData));
        
        appendTbl += "</div>";  //kkk
    });
    
    $("#roomPieChartDiv").append(appendTbl);
}

function DrawBarChart(chartData, divId, title){
    console.log("DrawBarCart start");
    
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(function(){barChart(chartData,divId,title)});
}

function barChart(chartData, divId, title) {
    console.log("barChart start");
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'title');
    data.addColumn('number', '');
    data.addRows(chartData);
    //data.addRows([["aa",10],["bb",150]]);
    var options = {
        title: title,
        titleTextStyle: {fontSize:20},
        animation:{ duration: 1000,easing: 'out',startup: true },
        hAxis: {title: '<部屋名>', titleTextStyle:{italic:true}, textStyle:{fontSize:10}},
        vAxis: { minValue: 0, title: "length (mm)", titleTextStyle:{italic:true} },
        series: [{ visibleInLegend: false }],
        bar: { groupWidth: 20 }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(divId));
    chart.draw(data, options);
}

function DrawPieChart(chartData,title,levelCnt,floorCnt){
    console.log("DrawPieChart start");

    var points =  [];
    var total= 0;
    
    //console.log("chartData["+JSON.stringify(chartData)+"]");
    
    Object.keys(chartData).forEach(function(flooring) {
        var intArea = parseFloat(chartData[flooring]);
        //console.log("intArea["+intArea+"]");
        points.push([flooring,intArea]);
    });
    
    //console.log("points["+JSON.stringify(points)+"]");
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(function(){pieChart(points,title,levelCnt,floorCnt)});
}

function pieChart(chartData,chartTitle,levelCnt,floorCnt){
    var chartTitle = (floorCnt == 1) ? "【"+chartTitle+"】床仕上げ材[m^2]" : "【"+chartTitle+"】" ;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'flooring');
    data.addColumn('number', 'area');
    data.addRows(chartData);

    var options = {
        // title: chartTitle,
        pieSliceText: 'value',
        animation:{
            duration: 1000,
            easing: 'out',
            startup: true
        },
        //legend: {position: 'labeled'}
      };

    var chart = new google.visualization.PieChart(document.getElementById('floorChartContainer'+levelCnt+floorCnt));
    chart.draw(data, options);
}

function toggleSunpoInfo(levelCnt) {
    var x = document.getElementById("myDIV"+levelCnt);
    if (x.style.display === "none") {
       x.style.display = "block";
    } else {
       x.style.display = "none";  
    }
}
