var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
$(document).ready(function(){
    $.ajaxSetup({
        cache:false
    });
    
    $("#project").select2({
        dropdownAutoWidth: true,
        width: 500,
        placeholder:'Select Folders',
        selectedIndex:-1
    });
    $("#item").select2({
        dropdownAutoWidth: true,
        width: 500,
        maxPlaceholderWidth:150,
        maxWidth:300,
        placeholder:'Select Projects',
        selectAll : true
    });
    $("#version").select2({
        dropdownAutoWidth: true,
        width: 500,
        maxPlaceholderWidth:150,
        maxWidth:300,
        placeholder:'Select Versions',
        selectAll : true
    });
    
    $("#level").select2({
        dropdownAutoWidth: true,
        width: 150,
        maxPlaceholderWidth:150,
        maxWidth:150,
        placeholder:'Select Level',
        selectAll : true
    });

    $("#category").select2({
        dropdownAutoWidth: true,
        width: 150,
        maxPlaceholderWidth:150,
        maxWidth:150,
        placeholder:'Select Category',
        selectAll : true
    });
    
    $("#workset").select2({
        dropdownAutoWidth: true,
        width: 150,
        maxPlaceholderWidth:150,
        maxWidth:150,
        placeholder:'Select workset',
        selectAll : true
    });

    $("#material").select2({
        dropdownAutoWidth: true,
        width: 150,
        maxPlaceholderWidth:150,
        maxWidth:300,
        placeholder:'Select material',
        selectAll : true
    });

    $("#familyName").select2({
        dropdownAutoWidth: true,
        width: 150,
        maxPlaceholderWidth:150,
        maxWidth:300,
        placeholder:'Select Family',
        selectAll : true
    });

    $("#typeName").select2({
        dropdownAutoWidth: true,
        width: 150,
        maxPlaceholderWidth:300,
        maxWidth:300,
        maxHeight:800,
        placeholder:'Select Type',
        language: "ja"
    });

    LoadComboData();

    $("#project").change(function() {
        ProjectChange();
    });

    $("#item").change(function() {
        //ItemChange();
    });

    if (location.hash !== '') $('a[href="' + location.hash + '"]').tab('show');
        return $('a[data-toggle="tab"]').on('shown', function(e) {
        return location.hash = $(e.target).attr('href').substr(1);
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
    console.log("ProjectChange start");
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
                // console.log(data);
                if(data != null){
                    BindComboData(data["items"],"item");
                    BindComboData(data["versions"],"version");
                    BindComboData(data["levels"],"level");
                    BindComboData(data["worksets"],"workset");
                    BindComboData(data["materials"],"material");
                    BindComboData(data["familyNames"],"familyName");
                    BindComboData(data["typeNames"],"typeName");
                }
            },
            error:function(err){
                console.log(err);
            }
        });

    }else if (folderSelectedCount > 1){
        //[TODO]複数バージョン選択時の挙動
        LoadComboData();
    }else{
        LoadComboData();
    }       
}

function ItemChange(){
    //NOP
}

function ReportForgeData(){

    var versionSelectedCount = $('#version option:selected').length;
    var level_list = [];
    var selected_categories=[];
    var workset_list=[];
    var material_list = [];
    var familyName_list = [];
    var typeName_list = [];
    
    var overviewData = {"Elements":0,"Volume":0,"Materials":0,"Type Name":0,"Family Name":0};
    var chartData = {};
    var totalData = {};
    var inputType = document.getElementById("inputTypeName").value;
    var typeName_filter = inputType.replace(/_/g, '\\_');

    // if (versionSelectedCount >= 2) {
    //     alert("Please select just one project");
    //     return;
    // }

    $("#level option:selected").each(function(){
        level_list.push($(this).text());
    });
    $("#category option:selected").each(function(){
        selected_categories.push($(this).val());
    });
    $("#workset option:selected").each(function(){
        workset_list.push($(this).text());
    });
    $("#material option:selected").each(function(){
        material_list.push($(this).text());
    });
    $("#familyName option:selected").each(function(){
        familyName_list.push($(this).text());
    });
    $("#typeName option:selected").each(function(){
        typeName_list.push($(this).text());
    });
    $('#version option:selected').each(function(){
        var valArr =JSON.parse($(this).val());
        var db_version_id = valArr.id;
        var version_number = valArr.version_number;
        var item_id = valArr.item_id;
        
        return $.ajax({
            url: "../forge/getData",
            async:false,
            type: 'post',
            data:{_token: CSRF_TOKEN,message:"getDataByVersion",version_number:version_number,id:db_version_id,
                    item_id:item_id,category_list:selected_categories,material_list:material_list,workset_list:workset_list,
                    level_list:level_list,familyName_list:familyName_list,typeName_list:typeName_list,typeName_filter:typeName_filter},
            success :function(data) {
                console.log(data);
                console.log(versionSelectedCount);
                
                if ((data["kozo_data"] == "") || (data["kozo_data"] == null)) {
                    alert("not exist in the database.");
                    return;
                }

                if (versionSelectedCount == 1) {
                    // DisplayTable(data["kozo_data"]);
                    OrganizeDataForEachVersion(data["kozo_data"], overviewData, chartData);
                    DisplayCurrentVersionData(overviewData, chartData);
                }
                else {
                    console.log("versionSelectedCount["+versionSelectedCount+"]");
                    totalData[version_number] = data["kozo_data"];
                }
            },
            error:function(err){
                console.log("error");
                console.log(err);
            }
        });
    });
    
    //
}

function DownloadForgeData(){

    var versionSelectedCount = $('#version option:selected').length;
    var level_list = [];
    var selected_categories=[];
    var workset_list=[];
    var material_list = [];
    var familyName_list = [];
    var typeName_list = [];
    
    var overviewData = {"Elements":0,"Volume":0,"Materials":0,"Type Name":0,"Family Name":0};
    var chartData = {};
    var totalData = {};
    var inputType = document.getElementById("inputTypeName").value;
    var typeName_filter = inputType.replace(/_/g, '\\_');

    $("#level option:selected").each(function(){
        level_list.push($(this).text());
    });
    $("#category option:selected").each(function(){
        selected_categories.push($(this).val());
    });
    $("#workset option:selected").each(function(){
        workset_list.push($(this).text());
    });
    $("#material option:selected").each(function(){
        material_list.push($(this).text());
    });
    $("#familyName option:selected").each(function(){
        familyName_list.push($(this).text());
    });
    $("#typeName option:selected").each(function(){
        typeName_list.push($(this).text());
    });
    $('#version option:selected').each(function(){
        var valArr =JSON.parse($(this).val());
        var db_version_id = valArr.id;
        var version_number = valArr.version_number;
        var item_id = valArr.item_id;
        
        return $.ajax({
            url: "../forge/getData",
            async:false,
            type: 'post',
            data:{_token: CSRF_TOKEN,message:"getDataByVersion",version_number:version_number,id:db_version_id,
                    item_id:item_id,category_list:selected_categories,material_list:material_list,workset_list:workset_list,
                    level_list:level_list,familyName_list:familyName_list,typeName_list:typeName_list,typeName_filter:typeName_filter},
            success :function(data) {
                console.log(data);
                console.log(versionSelectedCount);
                
                if ((data["kozo_data"] == "") || (data["kozo_data"] == null)) {
                    alert("not exist in the database.");
                    return;
                }

                if (versionSelectedCount == 1) {
                    // DisplayTable(data["kozo_data"]);
                    OrganizeDataForEachVersion(data["kozo_data"], overviewData, chartData);
                    // console.log("overviewData"+JSON.stringify(overviewData));
                    // console.log("chartData"+JSON.stringify(chartData));
                    
                    DownloadProcForgeData(overviewData, 'downloadForgeData');
                }
                else {
                    console.log("versionSelectedCount["+versionSelectedCount+"]");
                    totalData[version_number] = data["kozo_data"];
                }
            },
            error:function(err){
                console.log("error");
                console.log(err);
            }
        });
    });
}

function DownloadProcForgeData(downloadData, fileName){
    // 書き込み時のオプションは以下を参照
    // https://github.com/SheetJS/js-xlsx/blob/master/README.md#writing-options
    var wopts = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    };
    
    var array1 =
      [
        ["apple", "banana", "cherry"],
        [1, 2, 3]
      ];

    // ArrayをWorkbookに変換する
    var wb = aoa_to_workbook(array1);
    var wb_out = XLSX.write(wb, wopts);

    // WorkbookからBlobオブジェクトを生成
    var blob = new Blob([s2ab(wb_out)], { type: 'application/octet-stream' });

    // FileSaverのsaveAs関数で、xlsxファイルとしてダウンロード
    saveAs(blob, 'sample.xlsx');
    
    console.log("saveAs complete!!");
}

function sheet_to_workbook(sheet/*:Worksheet*/, opts)/*:Workbook*/ {
    var n = opts && opts.sheet ? opts.sheet : "Sheet1";
    var sheets = {}; sheets[n] = sheet;
    return { SheetNames: [n], Sheets: sheets };
}

function aoa_to_workbook(data/*:Array<Array<any> >*/, opts)/*:Workbook*/ {
    return sheet_to_workbook(XLSX.utils.aoa_to_sheet(data, opts), opts);
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function OrganizeDataForEachVersion(data, overviewData, pieChartData){

    SetOverviewData(data, overviewData);
    SetPieChartData(data, pieChartData);
}

function SetOverviewData(data, overviewData){
    var metrial_num = 0;
    var type_num = 0;
    var family_num = 0;
    var tmpVolume = 0;
    var tmpMeterial_list = [];
    var tmpTypeName_list = [];
    var tmpFamilyName_list = [];
    
    overviewData["Elements"] = data.length;
    Object.keys(data).forEach(function(key) {

        tmpVolume += data[key]["volume"];
        if (tmpMeterial_list.indexOf(data[key]["material_name"]) == -1) {
            tmpMeterial_list.push(data[key]["material_name"]);
            ++metrial_num;
        }
        if (tmpTypeName_list.indexOf(data[key]["type_name"]) == -1) {
            tmpTypeName_list.push(data[key]["type_name"]);
            ++type_num;
        }
        if (tmpFamilyName_list.indexOf(data[key]["family_name"]) == -1) {
            tmpFamilyName_list.push(data[key]["family_name"]);
            ++family_num;
        }
    });

    overviewData["Volume"] = tmpVolume.toFixed(2);
    overviewData["Materials"] = metrial_num;
    overviewData["Type Name"] = type_num;
    overviewData["Family Name"] = family_num;

    // console.log("tmpMeterial_list"+JSON.stringify(tmpMeterial_list));
    // console.log("tmpTypeName_list"+JSON.stringify(tmpTypeName_list));
    // console.log("tmpFamilyName_list"+JSON.stringify(tmpFamilyName_list));

    // console.log("overviewData[Elements]"+overviewData["Elements"]);
    // console.log("overviewData[Volume]"+overviewData["Volume"]);
    // console.log("overviewData[Materials]"+overviewData["Materials"]);
    // console.log("overviewData[Type Name]"+overviewData["Type Name"]);
    // console.log("overviewData[Family Name]"+overviewData["Family Name"]);
}

function SetPieChartData(data, pieChartData){
    var volumeChartDataForEachLevel = {};   // { level_name_a:容積, level_name_b:容積, }
    var materialChartData = {};             // { material_name_a:個数, material_name_b:個数, }
    var typeNameChartData = {};             // { type_name_a:個数, type_name_b:個数, }
    var familyNameChartData = {};           // { family_name_a:個数, family_name_b:個数, }
    
    Object.keys(data).forEach(function(key) {
        var tmpLevel            = data[key]["level"];
        var tmpMaterial_name    = data[key]["material_name"];
        var tmpType_name        = data[key]["type_name"];
        var tmpFamily_name      = data[key]["family_name"];
        
        //Volumeチャート用データ作成
        if (volumeChartDataForEachLevel[tmpLevel]) {
            volumeChartDataForEachLevel[tmpLevel] += data[key]["volume"];
        }
        else {
            volumeChartDataForEachLevel[tmpLevel] = data[key]["volume"];
        }

        //個数チャート用データ作成 (マテリアル/タイプ/ファミリ)
        if (materialChartData[tmpMaterial_name]) {
            ++materialChartData[tmpMaterial_name];
        }
        else{
            materialChartData[tmpMaterial_name] = 1;
        }
        
        if (typeNameChartData[tmpType_name]) {
            ++typeNameChartData[tmpType_name];
        }
        else{
            typeNameChartData[tmpType_name] = 1;
        }
        
        if (familyNameChartData[tmpFamily_name]) {
            ++familyNameChartData[tmpFamily_name];
        }
        else{
            familyNameChartData[tmpFamily_name] = 1;
        }
    });
    
    pieChartData["Volume"] = volumeChartDataForEachLevel;
    pieChartData["Materials"] = materialChartData;
    pieChartData["Type Name"] = typeNameChartData;
    pieChartData["Family Name"] = familyNameChartData;

    // console.log('pieChartData'+JSON.stringify(pieChartData));
    // console.log('volumeChartDataForEachLevel'+JSON.stringify(volumeChartDataForEachLevel));
    // console.log('materialChartData'+JSON.stringify(materialChartData));
    // console.log('typeNameChartData'+JSON.stringify(typeNameChartData));
    // console.log('familyNameChartData'+JSON.stringify(familyNameChartData));
}

function DisplayCurrentVersionData(overviewData, chartData){
    var appendText = "";

    if ( (isEmpty(overviewData)) || (isEmpty(chartData)) ) { return; }

    /* Small Stats Block */
    appendText += "<div class='row'>";
    
    Object.keys(overviewData).forEach(function(key) {
        appendText += "<div class='stats-small-area'>";
        appendText += "<div class='stats-small stats-small--1 card card-small'>";
        appendText += "<div class='card-body 0-1 d-flex'>";
        appendText += "<div class='d-flex flex-column m-auto'>";
        appendText += "<div class='stats-small__data text-center'>";
        appendText += "<span class='stats-small__label text-uppercase'>"+key+"</span>";
        appendText += "<h2 class='stats-small__value count my-3'>"+overviewData[key]+"</h2>";
        appendText += "</div></div></div></div></div>";
    });
    
    appendText += "</div>";
    /* End Small Stats Block */

    /* Chart Stats Block */
    appendText += "<div class='tab-wrap'>";
    
    appendText += "<input id='tab01' type='radio' name='tab' class='tab-switch' checked='checked'><label class='tab-label' for='tab01'>円グラフ</label>";
    appendText += "<div class='tab-content'>";

        /* Pie Chart */
        appendText += "<div style='height:65vh;display:flex;flex-wrap:wrap;'>";
            appendText += "<div class='tab-content-chart-area'>";
                appendText += "<div id=VolumePieChartContainer style='width:100%;height:100%;'></div>";
                DrawPieChart(chartData["Volume"], "Volume");
            appendText += "</div>";
            appendText += "<div class='tab-content-chart-area'>";
                appendText += "<div id=MaterialsPieChartContainer style='width:100%;height:100%;'></div>";
                DrawPieChart(chartData["Materials"], "Materials");
            appendText += "</div>";
            appendText += "<div class='tab-content-chart-area'>";
                appendText += "<div id=TypeNamePieChartContainer style='width:100%;height:100%;'></div>";
                DrawPieChart(chartData["Type Name"], "TypeName");
            appendText += "</div>";
            appendText += "<div class='tab-content-chart-area'>";
                appendText += "<div id=FamilyNamePieChartContainer style='width:100%;height:100%;'></div>";
                DrawPieChart(chartData["Family Name"], "FamilyName");
            appendText += "</div>";
        appendText += "</div>";
        /* End Pie Chart */
        
    appendText += "</div>";
    
    appendText += "<input id='tab02' type='radio' name='tab' class='tab-switch'><label class='tab-label' for='tab02'>棒グラフ</label>";
    appendText += "<div class='tab-content'>";
    
        /* Column Chart */
        appendText += "<div style='height:80vh;'>";
            appendText += "<div class='tab-content-chart-area' style='background-color:lightblue;'>";
                appendText += "<div id=VolumeColumnChartContainer style='width:100%;height:100%;'></div>";
                DrawColumnChart(chartData["Volume"], "Volume", "(m^3)");
            appendText += "</div>";
            appendText += "<div class='tab-content-chart-area'>";
                appendText += "<div id=MaterialsColumnChartContainer style='width:100%;height:100%;'></div>";
                DrawColumnChart(chartData["Materials"], "Materials", "(個数)");
            appendText += "</div>";
            appendText += "<div class='tab-content-chart-area'style='background-color:lightblue;'>";
                appendText += "<div id=TypeNameColumnChartContainer style='width:100%;height:100%;'></div>";
                DrawColumnChart(chartData["Type Name"], "TypeName", "(個数)");
            appendText += "</div>";
            appendText += "<div class='tab-content-chart-area'>";
                appendText += "<div id=FamilyNameColumnChartContainer style='width:100%;height:100%;'></div>";
                DrawColumnChart(chartData["Family Name"], "FamilyName", "(個数)");
            appendText += "</div>";
        appendText += "</div>";
        /* End Column Chart */
    
    appendText += "</div>";
    
    appendText += "</div>";
    /* End Chart Stats Block */
    
    $("#tblVersionData div").remove();
    $("#tblVersionData").append(appendText);
}

function DrawPieChart(chartData,title){
    var points =  [];
    var total= 0;
    
    Object.keys(chartData).forEach(function(key) {
        var intArea = parseFloat(chartData[key]);
        points.push([key,intArea]);
    });
    
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(function(){pieChart(points, title)});
}

function pieChart(chartData,title){
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'item');
    data.addColumn('number', 'area');
    data.addRows(chartData);

    var options = {
        title:title,
        titleTextStyle:{fontSize:18},
        pieSliceText: 'value',
        animation:{
            duration: 1000,
            easing: 'out',
            startup: true
        },
        legend:{
            textStyle:{fontSize:10},
            position: 'labeled'
        }
      };

    var chart = new google.visualization.PieChart(document.getElementById(title+"PieChartContainer"));
    chart.draw(data, options);
}

function DrawColumnChart(chartData, title, scale){
    console.log("DrawColumnChart start");
    
    var points =  [];
    var total= 0;
    
    Object.keys(chartData).forEach(function(key) {
        var intArea = parseFloat(chartData[key]);
        points.push([key,intArea]);
    });
    
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(function(){columnChart(points, title, scale)});
}

function columnChart(chartData, title, scale) {
    console.log("columnChart start");
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'title');
    data.addColumn('number', '');
    data.addRows(chartData);
    // console.log("chartData"+JSON.stringify(chartData));
    // data.addRows([["aa",10],["bb",150]]);
    var options = {
        title: title,
        titleTextStyle: {fontSize:20},
        animation:{ duration: 1000,easing: 'out',startup: true },
        // hAxis: {title: title, titleTextStyle:{italic:true}, textStyle:{fontSize:10}},
        vAxis: { minValue: 0, title: scale, titleTextStyle:{italic:true} },
        series: [{ visibleInLegend: false }],
        bar: { groupWidth: 20 }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById(title+"ColumnChartContainer"));
    chart.draw(data, options);
}

function isEmpty(obj) {
    return !Object.keys(obj).length;
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
