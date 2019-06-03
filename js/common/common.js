//获取当天的零点数据
var getZeroTime = function () {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return getFormatDate(date);
};
//转换日期格式 含时间
var getFormatDate = function (date) {
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        return currentdate;
};
////转换日期格式
var getFormatDateNullTime= function (date) {
    if(date=="Invalid Date"){
        return "NULL";
    }else{
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
        return currentdate;
    }
};
//转换EasyUI日期时间格式
var easyUIformater = function (str) {
    var arr1 = str.split("/")
    var arr2 = arr1[2].split(" ")
    return arr2[0] + "-" + arr1[0] + "-" + arr1[1] + " " + arr2[1]
};
//转换EasyUI日期格式
var easyUIDateformater = function (str) {
    var arr1 = str.split("/")
    var arr2 = arr1[2].split(" ")
    return arr2[0] + "-" + arr1[0] + "-" + arr1[1];
};
//表单的数据是否为空，为空把时间设为当天，不为空，为表单的时间；
var validateTime = function (obj) {
    var startTime = $("#startTime").val();
    var endTime = $("#endTime").val();
    if (Date.parse(startTime) > Date.parse(endTime)) {
        $('#dlg').html("开始时间不能大于结束时间").dialog('open');
        return false;
    }else{
        if (startTime !== "") {
            try {
                startTime = easyUIformater(startTime)
                if (startTime.split(" ")[0].toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                    obj.startDate = startTime;
                    $('#dlg').dialog("close")
                };
            } catch (e) {
                obj.startDate = getZeroTime();
                $('#dlg').html("请输入正确的开始时间").dialog('open');
            }
        };
        if (endTime !== "") {
            try {
                var endTime = easyUIformater(endTime)
                if (endTime.split(" ")[0].toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                    obj.endDate = endTime;
                    $('#dlg').dialog("close")
                }
            } catch (e) {
                obj.endDate = getFormatDate(new Date());
                $('#dlg').html("请输入正确的结束时间").dialog('open');
            }
        };
        return true;
    }
};
//导出excel数据
var exportToexcel = function (data,btn,str,title) {
    for (var i = 0; i < data.length; i++) {
        str += '<tbody><tr>';
        for (var item in data[i]) {
            if (data[i][item]==undefined){
                data[i][item]="null";
                str += "<td>"+ data[i][item]+"</td>";
            }else{
                str += "<td>"+ data[i][item]+"</td>";
            }
        }
        str +='</tr></tbody>';
    }
    var ExcelStyle='tbody td{text-align:center;color:#666;border:1px solid #CED1D3;height:30px;}'
    var html = "<html><head><meta charset='utf-8' /><style>"+ExcelStyle+"</style></head><body><table id='tb'>" + str + "</table></body></html>";
    var blob = new Blob([html],{type:"application/vnd.ms-excel"});
    if('msSaveOrOpenBlob' in navigator){
        // Microsoft Edge and Microsoft Internet Explorer 10-11
        window.navigator.msSaveOrOpenBlob(blob,title);
    }else{
        var a = document.getElementById(btn);
        a.href = URL.createObjectURL(blob);
        a.download = title+".xls";
    }
};
var collapseTree=function (data) {
    for (var i=0;i<data.length;i++) {
        if (data[i].children.length !== 0) {
            if (data[i].children[0].meter==true){
                data[i].state = "closed";
            }
            data[i].text = data[i].text;
            collapseTree(data[i].children);
        }else{
            data[i].text=data[i].text;
        }
    }
};
var loadTree=function (data,obj) {
    for (var i=0;i<data.length;i++) {
        if (data[i].children.length !== 0) {
            data[i].text = data[i].text;
            loadTree(data[i].children,obj);
        }else{
            data[i].text=data[i].fullText;
        }
        for (var r=0;r<obj.devs.length;r++){
            if (data[i].meterId ==obj.devs[r].id){
                data[i].checked=true;
            }
        }
        for (var t=0;t<obj.orgs.length;t++){
            if (data[i].id==obj.orgs[t].id){
                data[i].checked=true;
            }
        }
    }
};
var yesterday = function () {
    var date = new Date(Date.parse(new Date()) -86400000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + "-" + month + "-" + day;
};
var lastWeek=function () {
    var date = new Date(Date.parse(new Date()) -691200000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + "-" + month + "-" + day;
};
//前一个月
var lastMonth = function () {
    var date = new Date(Date.parse(new Date())-2678400000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var hour = date.getDate();
    return year + "-" + month + "-" + hour;
};
//过去一年
var lastMonthEasyUi = function () {
    var date = new Date(Date.parse(new Date())-2678400000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var hour = date.getDate();
    return month+"/"+hour+"/"+year;
};
var lastYear = function () {
    var date = new Date(Date.parse(new Date())-33791400000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var hour = date.getDate();
    return year + "-" + month + "-" + hour;
};
//过去10年
var last10Year = function () {
    var date = new Date(Date.parse(new Date())-311040000000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var hour = date.getDate();
    return year + "-" + month + "-" + hour;
};
//去除数组中重复的元素
var removeArrrepeat=function(data){
    var n=[];
    for(var i=0;i<data.length;i++){
        if(n.indexOf(data[i])==-1){
            n.push(data[i]);
        }
    }
    return n;
};

var getElecData=function (data) {
    var elec={};
    elec.acurrent=[];
    elec.bcurrent=[];
    elec.ccurrent=[];
    elec.avoltage=[];
    elec.bvoltage=[];
    elec.cvoltage=[];
    elec.apower=[];
    elec.bpower=[];
    elec.cpower=[];
    elec.atotalusepower=[];
    elec.btotalusepower=[];
    elec.ctotalusepower=[];
    elec.atotaluselesspower=[];
    elec.btotaluselesspower=[];
    elec.ctotaluselesspower=[];
    elec.forwarddegree=[];
    elec.power=[];
    elec.powerfactor=[];
    elec.totaluselesspower=[];
    elec.totalusepower=[];
    elec.readTime=[];
    for(var i=data.length-1;i>=0;i--){
        elec.acurrent.push(data[i].acurrent);
        elec.bcurrent.push(data[i].bcurrent);
        elec.ccurrent.push(data[i].ccurrent);
        elec.avoltage.push(data[i].avoltage);
        elec.bvoltage.push(data[i].bvoltage);
        elec.cvoltage.push(data[i].cvoltage);
        elec.apower.push(data[i].apower);
        elec.bpower.push(data[i].bpower);
        elec.cpower.push(data[i].cpower);
        elec.atotalusepower.push(data[i].atotalusepower);
        elec.btotalusepower.push(data[i].btotalusepower);
        elec.ctotalusepower.push(data[i].ctotalusepower);
        elec.atotaluselesspower.push(data[i].atotaluselesspower);
        elec.btotaluselesspower.push(data[i].btotaluselesspower);
        elec.ctotaluselesspower.push(data[i].ctotaluselesspower);
        elec.forwarddegree.push(data[i].forwarddegree);
        elec.power.push(data[i].power);
        elec.powerfactor.push(data[i].powerfactor);
        elec.totaluselesspower.push(data[i].totaluselesspower);
        elec.totalusepower.push(data[i].totalusepower);
        elec.readTime.push(getFormatDate(new Date(data[i].readTime)));
    }
    return elec;
}
var logout=function(){
    if (event.clientX>document.body.clientWidth&&event.clientY<0||event.altKey){
        var logoutURL = "/login/ajaxLogout";
        var userAgent = navigator.userAgent.toLowerCase();
        if(userAgent.indexOf("msie")>-1) {
            $.ajax({ url: logoutURL, crossDomain: true, async: false, dataType: "jsonp" });
        }else {
            $.ajax({ url: logoutURL, async: false });
        }
    }
}
//获取form表单转换成对象；
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [ o[this.name] ];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
//初始化分页功能
var pagerFilter=function (data) {
    var temp=data.rows;
    for (var i=0;i<temp.length;i++){
        if(temp[i].status==1){
            data.rows[i].status = "启用"
        }else if(temp[i].status==0){
            data.rows[i].status = "禁用"
        }else if(temp[i].status=="启用"){
            data.rows[i].status = "启用"
        }else if(temp[i].status=="禁用"){
            data.rows[i].status = "禁用"
        };
        if (temp[i].createDate){
            data.rows[i].createDate = getFormatDate(new Date(temp[i].createDate))
        };
        if (temp[i].modifyDate){
            data.rows[i].modifyDate = getFormatDate(new Date(temp[i].modifyDate))
        }
        if (temp[i].createTime){
            data.rows[i].createTime = getFormatDate(new Date(temp[i].createTime))
        };
        if (temp[i].modifyTime){
            data.rows[i].modifyTime = getFormatDate(new Date(temp[i].modifyTime))
        };
        if(temp[i].startTime){
            data.rows[i].startTime = getFormatDate(new Date(temp[i].startTime))
        };
        if(temp[i].endTime){
            data.rows[i].endTime = getFormatDate(new Date(temp[i].endTime))
        };
        if(temp[i].beginDate){
            data.rows[i].beginDate = getFormatDate(new Date(temp[i].beginDate))
        };
        if(temp[i].beginTime){
            data.rows[i].beginTime = getFormatDate(new Date(temp[i].beginTime))
        };
        if(temp[i].endDate){
            data.rows[i].endDate = getFormatDate(new Date(temp[i].endDate))
        };
        if(temp[i].datatime){
            data.rows[i].datatime= getFormatDateNullTime(new Date(temp[i].datatime))
        }
        if(temp[i].useTimeMin){
            data.rows[i].useTimeMin=Number(temp[i].useTimeMin);
        }
        if(!temp[i].metersName){
            temp[i].metersName=temp[i].orgName+"所有设备"
        };
        if(temp[i].endHour){
            temp[i].endHour=temp[i].endHour+":59"
        };
    }
    if (typeof data.length == 'number' && typeof data.splice == 'function') {
        data = {
            total: data.length,
            rows: data
        }
    }
    var dg = $(this);
    var opts = dg.datagrid('options');
    var pager = dg.datagrid('getPager');
    pager.pagination({
        onSelectPage: function (pageNum, pageSize) {
            opts.pageNumber = pageNum;
            opts.pageSize = pageSize;
            pager.pagination('refresh', {
                pageNumber: pageNum,
                pageSize: pageSize
            });
            dg.datagrid('loadData', data);
        }
    });
    if (!data.originalRows) {
        if (data.rows)
            data.originalRows = (data.rows);
        else if (data.data && data.data.rows)
            data.originalRows = (data.data.rows);
        else
            data.originalRows = [];
    }
    var start = (opts.pageNumber - 1) * parseInt(opts.pageSize);
    var end = start + parseInt(opts.pageSize);
    data.rows = (data.originalRows.slice(start, end));
    return data;
};
var pagerFilter1=function (data) {
    var temp=data;
    var n={}
    n.rows=[];
    n.rows[0]=temp;
    n.originalRows=[];
    for (var key in temp){
       if(key=="status"){
           if (temp[key]==true){
               n.rows[0].status = "启用"
           }else{
               n.rows[0].status = "禁用"
           }
       }else if(key=="modifyTime"){
           n.rows[0].modifyTime = getFormatDate(new Date(temp[key]))
       }else if(key=="modifyTime"){
           n.rows[0].createTime = getFormatDate(new Date(temp[key]))
       }
    }
    n.originalRows[0]=n.rows[0];
    return n;
};