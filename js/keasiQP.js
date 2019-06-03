//关闭默认的对话框
$(document).ready(function () {
    $("#dlg").dialog("close");
    $("#aInfo").dialog("close");
    $("#modifyWindow").window("center").window("close");
    $("#pvWindow").window("center").window("close");
    $(".welcome").html("欢迎来到特电云电气火灾消防监测预警系统:" + localStorage.getItem("username"));
    $(".custom-title").html("特电云电气火灾消防监测预警系统");
    $.ajax({
        type: "GET",
        url: "/auth/myMenu?_dc=" + Math.random(),
        contentType: "application/json",
        success: function (data) {
            if (data.result == true) {
                var temp = data.data[0].children;
                var menu = {
                    1: "能耗概览",
                    2: "项目概况",
                    3: "地图导航",
                    4: "实时数据",
                    5: "预警信息",
                    6: "预警记录",
                    7: "区域管理",
                    8: "设备管理",
                    9: "用户管理",
                    10: "商户管理"
                };
                $('#nav').accordion('add', {
                    title: "能耗概览",
                    content: '',
                    selected: true,
                });
                $('#nav').accordion('add', {
                    title: "预警记录",
                    content: '',
                    selected: false,
                });
                for (var key in menu) {
                    for (var i = 0; i < temp.length; i++) {
                        if (menu[key] == temp[i].text) {
                            if (key == 1) {
                                $('#nav').accordion('add', {
                                    title: menu[key],
                                    content: '',
                                    selected: false,
                                });
                            } else {
                                $('#nav').accordion('add', {
                                    title: menu[key],
                                    content: '',
                                    selected: false,
                                });
                            }
                        }
                    }
                };
                };
                $('#nav').accordion('add', {
                    title: "商户管理",
                    content: '',
                    selected: false,
                });
            }
        }
    )
    //启动弹窗；
    // webSocketListen();
});
var timer = setInterval(function () {
}, 600000);
//拉出菜单
var treeNavLeft = function (getData, obj) {
    $(".treeMenu").show().animate({left: 150});
    $(".res-bg").animate({left: 200});
    $(".treeMenu").tree({
        url: "/auth/org/tree?meter=true&_dc=" + Math.random(),
        method: "GET",
        animate: true,
        line: false,
        field: "name",
        loadFilter: function (data) {
            collapseTree(data)
            return data;
        },
        onLoadSuccess: function (node, data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].children.length !== 0) {
                    if (data[i].children[0].meter == true) {
                        obj.meterId = data[i].children[0].meterId;
                        obj.name = data[i].children[0].text;
                        break;
                    }
                }
            }
            getData("/wp/query/execute/query_result", obj);
        },
        onClick: function (node) {
            obj.name = node.text;
            if (node.meter == false) {
                obj.orgId = node.id;
                obj.meterId = "";
                obj.meterType = "";
            } else if (node.meter == true) {
                obj.meterId = node.meterId;
                obj.meterType = "E-A";
                obj.orgId = "";
            }
            ;
            getData("/wp/query/execute/query_result", obj);
        }
    })
};
//收缩菜单
var treeNavRight = function () {
    $(".treeMenu").animate({left: "-50px"});
    $(".res-bg").animate({left: 0});
};
//webSocket
var webSocketListen = function () {
    var ws;

    function openWebSocket() {
        ws = new WebSocket("ws://" + window.location.host + "/ws");
        ws.onopen = function (evt) {
            console.log("Connection open ...");
        };
        ws.onmessage = function (evt) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            ;
            $(".alarmDialog").show();
            $(".alarmContent").html(evt.data);
        };
        ws.onclose = function (evt) {
            console.log("Connection closed.");
        };
    }

    function checkWebSocket() {
        try {
            ws.send(""); //心跳
        } catch (e) {
            openWebSocket(); //出现异常重新打开WebSocket
        }
    }

    openWebSocket();
    var t1 = window.setInterval(checkWebSocket, 5000);
    $("#almConfirm").click(function () {
        $(".alarmDialog").hide();
    })
    $("#almCancel").click(function () {
        $(".alarmDialog").hide();
    })
}
//首页大屏
var homePage = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    treeNavRight();
    var obj = {}, resize = {};
    $("#res").html("").css({border: "none"});
    var showLocale = function (objD) {
        var str, colorhead, colorfoot;
        var yy = objD.getYear();
        if (yy < 1900) yy = yy + 1900;
        var MM = objD.getMonth() + 1;
        if (MM < 10) MM = '0' + MM;
        var dd = objD.getDate();
        if (dd < 10) dd = '0' + dd;
        var hh = objD.getHours();
        if (hh < 10) hh = '0' + hh;
        var mm = objD.getMinutes();
        if (mm < 10) mm = '0' + mm;
        var ss = objD.getSeconds();
        if (ss < 10) ss = '0' + ss;
        var ww = objD.getDay();
        if (ww == 0) colorhead = "<font color=\"#ffffff\">";
        if (ww > 0 && ww < 6) colorhead = "<font color=\"#ffffff\">";
        if (ww == 6) colorhead = "<font color=\"#ffffff\">";
        if (ww == 0) ww = "星期日";
        if (ww == 1) ww = "星期一";
        if (ww == 2) ww = "星期二";
        if (ww == 3) ww = "星期三";
        if (ww == 4) ww = "星期四";
        if (ww == 5) ww = "星期五";
        if (ww == 6) ww = "星期六";
        colorfoot = "</font>"
        str = colorhead + yy + "-" + MM + "-" + dd + " " + hh + ":" + mm + ":" + ss + "  " + ww + colorfoot;
        return (str);
    }
    var tick = function () {
        var today;
        today = new Date();
        if (document.getElementById("localtime")) {
            document.getElementById("localtime").innerHTML = showLocale(today)
        } else {
            return;
        }
    }
    var htmlElements = function () {
        var html = "<div  style='height:100%' class='bg-home'>" +
            "<h1 class='title'>特电云电气火灾消防监测预警系统" +
            "<span id=localtime style='font-size:12px; position: absolute; right: 80px; top:-10px; '></span>" +
            "<span id='fullScreen' class='fullScreen'>全屏</span>" +
            "</h1>" +
            "<ul class='main' id='main'>" +
            "<li class='MainLeft'>" +
            "<div class='totalCount div_any_child'>" +
            "<div class='div_any_title'>设备接入数量</div>" +
            "<div class='countList' id='countChart'></div>" +
            "</div>" +
            "<ul class='energy div_any_child'>" +
            "<li class='div_any_title'>设备状态统计</li>" +
            "<li id='lostChart'>通信状态统计</li>" +
            "</ul>" +
            "<div class='div_any_child'>" +
            "<div class='div_any_title'>当前预警设备</div>" +
            "<ul  class='realMsg'>" +
            "<li>设备名称:<span class='bname'>1号配电室探测器</span></li>" +
            "<li>所属区域:<span class='borg'>科阿思办公楼</span></li>" +
            "<li>设备地址:<span class='bplace'>科阿思办公楼</span></li>" +
            "<li>预警信息:<span class='btext'>1号回路漏电预警,设定:10A,实际:20A</span></li>" +
            "<li>实时数据:</li>" +
            "<li class='realdata'>" +
            "<span class='leak1'>1路:&nbsp;20A</span>" +
            "<span class='leak2'>2路:&nbsp;20A</span>" +
            "<span class='leak3'>3路:&nbsp;20A</span>" +
            "<span class='leak4'>4路:&nbsp;20A</span>" +
            "<span class='leak6'>5路:&nbsp;20A</span>" +
            "<span class='leak6'>6路:&nbsp;20A</span>" +
            "<span class='leak7'>7路:&nbsp;20A</span>" +
            "<span class='leak8'>8路:&nbsp;20A</span>" +
            "</li>" +
            "<li class='realdata'>" +
            "<span class='temp1'>1路:&nbsp;20℃</span>" +
            "<span class='temp2'>2路:&nbsp;20℃</span>" +
            "<span class='temp3'>3路:&nbsp;20℃</span>" +
            "<span class='temp4'>4路:&nbsp;20℃</span>" +
            "</li>" +
            "</ul>" +
            "</div>" +
            "</li>" +
            "<li class='MainMiddle'>" +
            "<div class='div_any_title'>用户地理分布</div>" +
            "<div id='mapChart'></div>" +
            "</li>" +
            "<li class='MainRight'>" +
            "<div class='typeEnerge div_any_child'>" +
            "<div class='div_any_title'>今日预警统计</div>" +
            "<div id='dayChart'></div>" +
            "</div>" +
            "<div class='typeEnerge div_any_child'>" +
            "<div class='div_any_title'>历史预警类型统计</div>" +
            "<div id='typeChart'></div>" +
            "</div>" +
            "<div class='realEnerge div_any_child'>" +
            "<div class='div_any_title'>设备预警前5名统计</div>" +
            "<div id='realEnerge'></div>" +
            "</div>" +
            "</li>" +
            "</ul>" +
            "<div id='pvw' class='easyui-window' title='详细信息' data-options='iconCls:\"icon-save\"' style='width:60%;display: none'></div>" +
            "</div>"
        $("#res").append(html);
        $(".btn").linkbutton();
    };
    //加载后台数据
    var getData = function () {
        mapcharts();
        $.ajax({
            url: "/sts/devCount",
            data: {},
            type: "GET",
            dataType: "json",
            async: true,
            contentType: "application/json",
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].name = data[i].meterTypeName;
                    data[i].value = data[i].count;
                }
                obj.count = data;
                countChart(obj);
            },
            error: function () {
                $('#modifyWindow').window('close');
                $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                return;
            }
        });
        $.ajax({
            url: "/sts/devStatusCount",
            data: {},
            type: "GET",
            dataType: "json",
            async: true,
            contentType: "application/json",
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].value = data[i].count;
                }
                obj.lose = data;
                loseChart(obj);
            },
            error: function () {
                $('#modifyWindow').window('close');
                $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                return;
            }
        });
        $.ajax({
            url: "/sts/latestAlarm",
            data: {},
            type: "GET",
            dataType: "json",
            async: true,
            contentType: "application/json",
            success: function (data) {
                var dev = data.alarmRecord;
                $(".bname").html(dev.meterName);
                $(".borg").html(dev.orgName);
                $(".bplace").html(dev.place);
                $(".btext").html(dev.displayText);
                $(".leak1").html(dev.leak1 + "mA");
                $(".leak2").html(dev.leak2 + "mA");
                $(".leak3").html(dev.leak3 + "mA");
                $(".leak4").html(dev.leak4 + "mA");
                $(".leak5").html(dev.leak5 + "mA");
                $(".leak6").html(dev.leak6 + "mA");
                $(".leak7").html(dev.leak7 + "mA");
                $(".leak8").html(dev.leak8 + "mA");
                $(".temp1").html(dev.temp1 + "℃");
                $(".temp2").html(dev.temp2 + "℃");
                $(".temp3").html(dev.temp3 + "℃");
                $(".temp4").html(dev.temp4 + "℃");
            },
            error: function () {
                $('#modifyWindow').window('close');
                $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                return;
            }
        });
        $.ajax({
            url: "/sts/todayAlarms",
            data: {},
            type: "GET",
            dataType: "json",
            async: true,
            contentType: "application/json",
            success: function (data) {
                obj.todayAlarm = {item: [], hasEnd: [], notEnd: []};
                for (var i = 0; i < data.length; i++) {
                    obj.todayAlarm.item.push(data[i].item);
                    obj.todayAlarm.hasEnd.push(data[i].hasEnd);
                    obj.todayAlarm.notEnd.push(data[i].notEnd);
                }
                todayAlarm(obj);
            },
            error: function () {
                $('#modifyWindow').window('close');
                $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                return;
            }
        });
        $.ajax({
            url: "/sts/hisAlarms",
            data: {},
            type: "GET",
            dataType: "json",
            async: true,
            contentType: "application/json",
            success: function (data) {
                var item = [];
                var v = {};
                obj.hisAlarm = {};
                obj.hisAlarm.has = [];
                obj.hisAlarm.not = [];
                for (var i = 0; i < data.length; i++) {
                    if (item.indexOf(data[i].item) == -1) {
                        item.push(data[i].item);
                        var key = data[i].item;
                        v[key] = {};
                        v[key].hasEnd = data[i].hasEnd;
                        v[key].notEnd = data[i].notEnd;
                    } else {
                        var key = data[i].item;
                        if (data[i].hasEnd !== 0) {
                            v[key].hasEnd++;
                        }
                        ;
                        if (data[i].notEnd !== 0) {
                            v[key].notEnd++;
                        }
                        ;
                    }
                }
                ;
                obj.hisAlarm.item = item;
                for (var key in v) {
                    obj.hisAlarm.has.push(v[key].hasEnd)
                    obj.hisAlarm.not.push(v[key].notEnd)
                }
                ;
                hisType(obj)
            },
            error: function () {
                $('#modifyWindow').window('close');
                $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                return;
            }
        });
        $.ajax({
            url: "/sts/topAlarmDevs",
            data: {},
            type: "GET",
            dataType: "json",
            async: true,
            contentType: "application/json",
            success: function (data) {
                obj.topDev = {item: [], cnt: []};
                for (var i = 0; i < data.length; i++) {
                    obj.topDev.item.push(data[i].devName);
                    obj.topDev.cnt.push(data[i].cnt);
                }
                topDev(obj);
            },
            error: function () {
                $('#modifyWindow').window('close');
                $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                return;
            }
        });
    }
    //绘制图表
    var countChart = function (obj) {
        var countChart = echarts.init(document.getElementById("countChart"));
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {c}个({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: '8%',
                y: '15%',
                data: obj.count,
                textStyle: {
                    color: "#ffff"
                }
            },
            series: [
                {
                    type: 'pie',
                    radius: ['30%', '70%'],
                    center: ['50%', '50%'],
                    label: {
                        normal: {
                            formatter:"数量:{c}",
                            show: true,
                            position: "50%"
                        },
                    },
                    labelLine: {
                        normal: {
                            show: true
                        }
                    },
                    data: obj.count
                }
            ],
            color: ['#5858CE', '#58B258', '#4DBFC4']
        };
        countChart.setOption(option);
        resize.countChart = countChart;
    };
    var loseChart = function (obj) {
        var loseChart = echarts.init(document.getElementById("lostChart"));
        var loseOption = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {c}个({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: '8%',
                y: '15%',
                data: [{name: "报警", value: 10}, {name: "正常", value: 15}, {name: "中断", value: 15}],
                textStyle: {
                    color: "#ffff"
                }
            },
            series: [

                {
                    type: 'pie',
                    radius: ['30%', '70%'],
                    avoidLabelOverlap: false,
                    center: ['50%', '50%'],
                    label: {
                        normal: {
                            formatter:"数量:{c}",
                            show: true,
                            position: "50%"
                        },
                    },
                    labelLine: {
                        normal: {
                            show: true
                        }
                    },
                    data: obj.lose,
                }
            ],
            color: ['#aaaa', '#D33434', '#2ECB2E',]
        };
        loseChart.setOption(loseOption);
        resize.loseChart = loseChart;
    };
    var todayAlarm = function (obj) {
        var dayChart = echarts.init(document.getElementById("dayChart"));
        var dayOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data: ['已处理', '未处理'],
                y: "10%",
                textStyle: {
                    color: "white"
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    axisLine: {
                        symbol: "none",
                        lineStyle: {
                            color: "#ffff",
                            width: "1"
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: "#ffff",
                    },
                    axisTick: {
                        show: false,
                    },
                    boundaryGap: true,
                    type: 'category',
                    data: obj.todayAlarm.item,
                }
            ],
            yAxis: [
                {
                    axisLine: {
                        symbol: "none",
                        lineStyle: {
                            color: "#ffff",
                            width: "1"
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: "#ffff",
                    },
                    type: 'value',
                    axisTick: {
                        show: false,
                    },
                    y: "10%"
                }
            ],
            series: [
                {
                    name: '已处理',
                    type: 'bar',
                    stack: "isDo",
                    barWidth: '40%',
                    color: "#2ECB2E",
                    data: obj.todayAlarm.hasEnd,
                    label: {
                        normal: {
                            show: true,
                            position: 'left'
                        }
                    },
                },
                {
                    name: '未处理',
                    type: 'bar',
                    stack: "isDo",
                    barWidth: '40%',
                    color: "#D33434",
                    data: obj.todayAlarm.notEnd,
                    label: {
                        normal: {
                            show: true,
                            position: 'left'
                        }
                    },
                },

            ]
        };
        dayChart.setOption(dayOption, true);
        resize.dayChart = dayChart;
    };
    var hisType = function (obj) {
        var typeDom = document.getElementById("typeChart");
        var typeChart = echarts.init(typeDom);
        var typeOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data: ['已处理', '未处理'],
                y: "10%",
                textStyle: {
                    color: "white"
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    axisLine: {
                        symbol: "none",
                        lineStyle: {
                            color: "#ffff",
                            width: "1"
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: "#ffff",
                    },
                    axisTick: {
                        show: false,
                    },
                    boundaryGap: true,
                    type: 'category',
                    data: obj.hisAlarm.item,
                }
            ],
            yAxis: [
                {
                    axisLine: {
                        symbol: "none",
                        lineStyle: {
                            color: "#ffff",
                            width: "1"
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: "#ffff",
                    },
                    type: 'value',
                    axisTick: {
                        show: false,
                    },
                    y: "10%"
                }
            ],
            series: [
                {
                    name: '已处理',
                    type: 'bar',
                    stack: "isDo",
                    barWidth: '40%',
                    color: "#2ECB2E",
                    data: obj.hisAlarm.has,
                    label: {
                        normal: {
                            show: true,
                            position: 'left'
                        }
                    },
                },
                {
                    name: '未处理',
                    type: 'bar',
                    stack: "isDo",
                    barWidth: '40%',
                    color: "#D33434",
                    data: obj.hisAlarm.not,
                    label: {
                        normal: {
                            show: true,
                            position: 'left'
                        }
                    },
                },

            ]
        }
        typeChart.setOption(typeOption);
        resize.hisType = typeChart;
    }
    var topDev = function (obj) {
        var realChart = echarts.init(document.getElementById('realEnerge'));
        var realoption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    axisLine: {
                        symbol: "none",
                        lineStyle: {
                            color: "#ffff",
                            width: "1"
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: "#ffff",
                    },
                    axisTick: {
                        show: false,
                    },
                    boundaryGap: true,
                    type: 'category',
                    data: obj.topDev.item,
                }
            ],
            yAxis: [
                {
                    axisLine: {
                        symbol: "none",
                        lineStyle: {
                            color: "#ffff",
                            width: "1"
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: "#ffff",
                    },
                    type: 'value',
                    axisTick: {
                        show: false,
                    },
                    y: "10%"
                }
            ],
            series: [
                {
                    name: '次数',
                    type: 'bar',
                    barWidth: '40%',
                    color: "#2ECB2E",
                    data: obj.topDev.cnt,
                    label: {
                        normal: {
                            show: true,
                            position: 'left'
                        }
                    },
                },
            ]
        }
        realChart.setOption(realoption);
        resize.topDev = realChart;
    }
    var mapcharts = function (obj) {
        var mapChart = echarts.init(document.getElementById('mapChart'));
        mapChart.setOption({
            bmap: {
                center: [121.060838, 31.11664],
                zoom: 8,
                roam: true,

            },
            title: {
                subtext: '当前共有888位用户',
                x: "center",
                subtextStyle: {
                    color: '#00F6FF',
                    fontSize: 15,
                    textShadowColor: "#64FAFF",
                    textShadowBlur: 5,
                    textShadowOffsetX: 0,
                    textShadowOffsetY: 0,
                },
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params, ticket, callback) {
                    return params.value[2] + "<br>" + params.value[3] + "Kw.h"
                }
            },
            series: [{
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: "circle",
                symbolSize: "16",
                color: "#3BFF3B",
                data: [
                    [121.48054, 31.235929, '上海市', 1288],
                    [114.311586, 30.598467, '武汉市', 1350],
                    [115.864585, 28.689455, '南昌市', 1455],
                    [118.802422, 32.064652, '南京市', 7158],
                    [120.927903, 31.516889, '苏州市', 6651],
                ]
            }]
        });
        var bmap = mapChart.getModel().getComponent('bmap').getBMap();
        bmap.addControl(new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP]}));
        bmap.setMapStyle({style: 'midnight'});
        resize.mapChart = mapChart;
    };
    (function () {
        htmlElements();
        window.setInterval(tick, 1000);
        getData();
        $(window).resize(function () {
            resize.countChart.resize();
            resize.loseChart.resize();
            resize.dayChart.resize();
            resize.hisType.resize();
            resize.topDev.resize();
        })
    }());
    var requestFullScreen = function (element) {
        var de = element;
        if (de.requestFullscreen) {
            de.requestFullscreen();
        } else if (de.mozRequestFullScreen) {
            de.mozRequestFullScreen();
        } else if (de.webkitRequestFullScreen) {
            de.webkitRequestFullScreen();
        } else if (de.msRequestFullscreen) {
            de.msRequestFullscreen();
        } else {
            console.log("进入全屏失败")
        }
    }
    var exitFullscreen = function () {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
    $("#res").off("click", "#fullScreen").on("click", "#fullScreen", function () {
        var isFull = $("#res").attr("isFull");
        var $res = $("#res");
        if (isFull == "no") {
            requestFullScreen($res[0]);
            $res.attr({isFull: "yes"})
            $(this).html("退出全屏").css({fontSize: 10, padding: "0 10px"});
        } else if (isFull == "yes") {
            exitFullscreen();
            $(this).html("全屏").css({fontSize: 10, padding: "0 10px"});
            $res.attr({isFull: "no"})
        }
    });
    $("#res").off("click", ".msgList li").on("click", ".msgList li", function () {
        var addr = $(this).html();
        var msg = $(this).attr("title").split(" ").join("<br>");
        var fullText = JSON.parse($(this).attr("fullText"));
        var html = "";
        for (var key in fullText) {
            switch (key) {
                case "acurrent":
                    html += "<br>A相电流：" + fullText[key] + "A<br>";
                    break;
                case "bcurrent":
                    html += "B相电流：" + fullText[key] + "A<br>";
                    break;
                case "ccurrent":
                    html += "C相电流：" + fullText[key] + "A<br>";
                    break;
                case "avoltage":
                    html += "A相电压：" + fullText[key] + "V<br>";
                    break;
                case "bvoltage":
                    html += "B相电压：" + fullText[key] + "V<br>";
                    break;
                case "cvoltage":
                    html += "C相电压：" + fullText[key] + "V<br>";
                    break;
                case "apower":
                    html += "A相功率：" + fullText[key] + "W<br>";
                    break;
                case "bpower":
                    html += "B相功率：" + fullText[key] + "W<br>";
                    break;
                case "cpower":
                    html += "C相功率：" + fullText[key] + "W<br>";
                    break;
            }
        }
        $('#aInfo').html("区域名称：" + "<br>" + addr + "<br><hr>" + "预警信息：" + "<br>" + msg + "<br><hr>" + "实时数据：" + html).window({top: 200}).window('open');
    });
};
//项目概况按钮选择时加载项目数据；
var projectinfo = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    treeNavRight()
    // echarts 绘树形图
    var treeMap = function (elem, data) {
        var myChart = echarts.init(document.getElementById(elem), "shine");
        myChart.showLoading();
        myChart.hideLoading();
        myChart.setOption(option = {
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove'
            },
            legend: {
                top: '2%',
                left: '3%',
                orient: 'vertical',
                data: [{
                    icon: 'rectangle'
                }],
                borderColor: '#c23531'
            },
            series: [
                {
                    type: 'tree',
                    data: [data],
                    top: '5%',
                    left: '7%',
                    bottom: '2%',
                    right: '30%',
                    symbolSize: 9,
                    lineStyle: {
                        color: "#A5CB5D",
                    },
                    label: {
                        color: "#fff",
                        normal: {
                            position: 'left',
                            verticalAlign: 'middle',
                            align: 'right'
                        }
                    },
                    leaves: {
                        label: {
                            normal: {
                                position: 'right',
                                verticalAlign: 'middle',
                                align: 'left'
                            }
                        }
                    },
                    expandAndCollapse: true,
                    initialTreeDepth: 1,
                    animationDuration: 550,
                    animationDurationUpdate: 750
                },
            ]
        });
    };
    var formatData = function (data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].children.length !== 0) {
                data[i].name = data[i].text;
                formatData(data[i].children)
            } else if (data[i].children.length == 0) {
                data[i].name = data[i].text;
            }
        }
    }
    //异步加载数据
    $.ajax({
        url: "/auth/org/tree?sub=y&meter=true&_dc=" + Math.random(),
        data: {},
        type: "GET",
        cache: false,
        dataType: "json",
        success: function (data) {
            var html = "<div id='myChart' style='width:100%;height:inherit;'></div>"
            $("#res").html(html);
            formatData(data);
            treeMap("myChart", data[0]);
        },
        error: function () {
            console.log("数据请求错误，请联系系统管理员")
        }
    });
};
//地图导航按钮选择时加载数据；
var navmap = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    //绘制百度地图;
    var obj = {};
    $.ajax({
        url: "/dev/collector/query?start=0&limit=20000&_dc=" + Math.random(),
        type: "GET",
        dataType: "json",
        success: function (data) {
            var html = "<div id='myChart' style='width:100%;height:inherit'></div>"
            $("#res").html(html);
            BaiDuMap(data.rows);
        },
        error: function () {
            console.log("数据请求错误，请联系系统管理员")
        }
    });
    var BaiDuMap = function (data) {
        var map = new BMap.Map("myChart");
        map.centerAndZoom(data[0].address, 14);
        map.enableScrollWheelZoom(true);
        map.addControl(new BMap.NavigationControl());
        map.addControl(new BMap.OverviewMapControl());
        map.addControl(new BMap.OverviewMapControl({isOpen: true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT}));
        var localSearch = new BMap.LocalSearch(map);
        localSearch.enableAutoViewport();
        for (var i = 0; i < data.length; i++) {
            if ((data[i].latitude !== undefined) && (data[i].longitude !== undefined)) {
                var myIcon = new BMap.Icon("/fire/img/green.png", new BMap.Size(22, 33), {});
                var marker = new BMap.Marker(new BMap.Point(Number(data[i].longitude), Number(data[i].latitude)), {icon: myIcon});
                marker.orgId = data[i].orgId;
                marker.orgName = data[i].orgName;
                map.addOverlay(marker);
                var content = "所属区域：" + data[i].orgName + "<br/>地点：" + data[i].place + "<br>经度：" + data[i].latitude + "<br/>纬度：" + data[i].longitude + "<br/>"
                // "用电量：" + data[i].poweruse + "Kwh";
                marker.infoWindow = new BMap.InfoWindow("<p style='font-size:14px;'>" + content + "</p>");
                marker.addEventListener("mouseover", function (a) {
                    var me = a.target;
                    this.openInfoWindow(me.infoWindow);
                });
                marker.addEventListener("click", function (a) {
                    var orgId = a.target.orgId;
                    var name = a.target.orgName;
                    var obj = {
                        orgId: orgId,
                        meterId: "",
                        startDate: lastMonth(),
                        endDate: getFormatDate(new Date()),
                        name: name
                    };
                    var excelData = [];
                    (function () {
                        $("#mbody").remove();
                        var html = '<div id="mbody">' +
                            '<div style="font-size: 18px;padding:5px 35%;color:#666;text-align: center">' + obj.name + '用电记录表</div>' +
                            '<table id="dg" style="height:600px;width:100%"></table>' +
                            '<a href="javascript:void(0)" id="downLoadExcel" style="margin:5px 10px"  class="easyui-linkbutton" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>' + "&nbsp;&nbsp;" +
                            '<a href="javascript:void(0)" id="back" style="margin:5px 10px"  class="easyui-linkbutton" data-options="iconCls:\'icon-redo\',size:\'large\',iconAlign:\'left\'">返回</a>' + "&nbsp;&nbsp;" +
                            '</div>'
                        $("#res").html(html);
                        $('.easyui-linkbutton').linkbutton();
                        $('#dg').datagrid({
                            url: "/wp/query/opentime/query?limit=10000000&_dc=" + Math.random(),
                            columns: [[
                                {field: 'meterName', title: '设备名称', width: '15%', align: "center"},
                                {field: 'orgName', title: '所属区域', width: '15%', align: "center"},
                                {field: 'startTime', title: '通电时间', width: '14%', align: "center"},
                                {field: 'endTime', title: '断电时间', width: '14%', align: "center"},
                                {field: 'useTimeMin', title: '用时(分)', width: '9%', align: 'center'},
                                {field: 'startEnergy', title: '开始抄表(Kw.h)', width: '9%', align: "center"},
                                {field: 'endEnergy', title: '结束抄表(Kw.h)', width: '9%', align: "center"},
                                {field: 'useEnergy', title: '能耗用量(Kw.h)', width: '8%', align: 'center'},
                                {field: 'waterConversion', title: '转化量', width: '6%', align: 'center'},
                            ]],
                            onLoadSuccess: function (data) {
                                var tempData = data.originalRows;
                                var time = 0, elec = 0;
                                excelData.length = 0;
                                for (var i = 0; i < tempData.length; i++) {
                                    excelData[i] = {};
                                    excelData[i].meterName = tempData[i].meterName !== undefined ? tempData[i].meterName : "NULL";
                                    excelData[i].orgName = tempData[i].orgName !== undefined ? tempData[i].orgName : "NULL";
                                    excelData[i].startTime = tempData[i].startTime !== undefined ? tempData[i].startTime : "NULL";
                                    excelData[i].endTime = tempData[i].endTime !== undefined ? tempData[i].endTime : "NULL";
                                    excelData[i].useTimeMin = tempData[i].useTimeMin !== undefined ? tempData[i].useTimeMin : "NULL";
                                    excelData[i].startEnergy = tempData[i].startEnergy !== undefined ? tempData[i].startEnergy : "NULL";
                                    excelData[i].endEnergy = tempData[i].endEnergy !== undefined ? tempData[i].endEnergy : "NULL";
                                    excelData[i].useEnergy = tempData[i].useEnergy == undefined ? "NULL" : tempData[i].useEnergy;
                                    excelData[i].waterConversion = tempData[i].waterConversion == undefined ? "NULL" : tempData[i].waterConversion;
                                    if (i < tempData.length) {
                                        try {
                                            if (tempData[i].meterId == tempData[i + 1].meterId) {
                                                time += excelData[i].useTimeMin;
                                                elec += excelData[i].useEnergy;
                                                excelData[i].sum = "";
                                            } else {
                                                time += excelData[i].useTimeMin;
                                                elec += excelData[i].useEnergy;
                                                excelData[i].sum = "总时间：" + (time / 60).toFixed(3) + "h&nbsp;&nbsp;总用量：" + elec.toFixed(2) + "Kw.h";
                                                time = 0;
                                                elec = 0;
                                            }
                                        } catch (e) {
                                            time += excelData[i].useTimeMin;
                                            elec += excelData[i].useEnergy;
                                            excelData[i].sum = "总时间：" + (time / 60).toFixed(3) + "h&nbsp;&nbsp;总用量：" + elec.toFixed(2) + "Kw.h";
                                        }
                                    }
                                }
                                $("#downLoadExcel").click(function () {
                                    var title = obj.name + "设备开启时间记录表";
                                    var str = '<th>' +
                                        '<caption><h2>' + title + '</h2>' +
                                        '<span>查询时间：' + obj.startDate + "～" + obj.endDate + '</span></caption>' +
                                        '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                                        '<td>设备名称</td>' +
                                        '<td>所属区域</td>' +
                                        '<td>通电时间</td>' +
                                        '<td>断电时间</td>' +
                                        '<td>用时</td>' +
                                        '<td>开始抄表</td>' +
                                        '<td>结束抄表</td>' +
                                        '<td>能耗用量</td>' +
                                        '<td>转化量</td>' +
                                        '<td>合计</td>' +
                                        '</th>';
                                    exportToexcel(excelData, this.id, str, title)
                                });
                                $("#back").click(function () {
                                    navmap();
                                });
                            },
                            onLoadError: function () {
                                console.log("数据加载失败！")
                            },
                            queryParams: obj,
                            pagination: true,
                            pagePosition: "bottom",
                            pageNumber: 1,
                            pageSize: 20,
                            singleSelect: true,
                            pageList: [20, 40, 80, 160],
                            loadFilter: pagerFilter,
                        });
                    })();
                });
                marker.infoWindow.addEventListener("close", function (e) {
                    me.infoWindow = e;
                })
                marker.addEventListener("mouseout", function (e) {
                    var me = e.target;
                    this.closeInfoWindow(me.infoWindow);
                })
            }
        }
        ;
    }
};
//实时数据按钮选择时加载数据
var realdata = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    //默认向后台传的参数
    var obj = {meterId: 1, queryId: 24, startDate: getZeroTime(), endDate: getFormatDate(new Date())};
    var type = {title: "用电量", meterKind: "E"};
    //上方的搜索条件表
    var searchOrder = function () {
        var html =
            '<form id="ff" mothod="post" class="ff" style="padding-right:200px">' +
            '<form id="ff" method="post" class="ff" style="padding-right:200px">' +
 
            // '<input id="meterKind" value="E" name="meterKind" label="选择能耗类型:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<input id="startTime"  class="easyui-datetimebox inputbox dt" label="开始时间:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<input id="endTime" class="easyui-datetimebox inputbox  dt" label="结束时间:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            "</form>" +
            // "<div class='charts' id='myChart' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='fire' id='lossCurrent' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='fire' id='temperature' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='current' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='voltage' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='degree' style='width:100%;padding:10px;padding-right:220px'></div>" +
            // "<div class='charts' id='totaluselesspower' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div style='padding-left:10px;'>" +
            // '<a href="javascript:void(0)" id="downLoadExcel"  class="btn" data-options="iconCls:\'icon-large-smartart\',size:\'small\',iconAlign:\'top\'">电量导出</a>' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" id="downLoadElec"  class="btn" data-options="iconCls:\'icon-large-smartart\',size:\'small\',iconAlign:\'top\'">监控导出</a>' + "&nbsp;&nbsp;" +
            // "<span id='quantity' class='dage'></span>&nbsp;&nbsp;<span id='openTime' class='dage'></span>" +
            "</div>";
        $("#res").html(html);
        // $("#meterKind").combobox({
        //     data: dist["meterkind"],
        //     valueField: 'value',
        //     textField: 'text',
        //     onSelect: function (record) {
        //         type.meterKind = record.value;
        //         if (record.value == "E") {
        //             type.title = "用电量";
        //             type.unit = "KW.H";
        //         } else if (record.value == "W") {
        //             type.title = "用水量";
        //             type.unit = "M³";
        //         } else if (record.value == "G") {
        //             type.title = "用气量";
        //             type.unit = "M³";
        //         } else if (record.value == "F") {
        //             type.title = "流量";
        //             type.unit = "M³/h";
        //         } else if (record.value == "T") {
        //             type.title = "温度表";
        //             type.unit = "℃";
        //         }
        //         $(".treeMenu").tree({
        //             url: "/auth/org/tree?sub=y&meter=true&meterKind=" + record.value + "&_dc=" + Math.random(),
        //             method: "GET",
        //             animate: true,
        //             line: false,
        //             field: "name",
        //             loadFilter: function (data) {
        //                 collapseTree(data)
        //                 return data;
        //             },
        //             onLoadSuccess: function (node, data) {
        //                 obj.name = data[0].children[0].text;
        //                 if (data[0].children[0].meter == false) {
        //                     obj.orgId = data[0].children[0].id;
        //                 } else {
        //                     obj.meterId = data[0].children[0].meterId;
        //                 }
        //                 getData("/wp/query/execute/query_result?meterKind=" + record.value, obj);
        //             },
        //             onClick: function (node) {
        //                 obj.name = node.text;
        //                 if (node.meter == false) {
        //                     obj.orgId = node.id;
        //                     obj.meterId = "";
        //                 } else if (node.meter == true) {
        //                     obj.meterId = node.meterId;
        //                     obj.orgId = "";
        //                 }
        //                 ;
        //                 getData("/wp/query/execute/query_result?meterKind=" + record.value, obj);
        //             }
        //         })
        //     }
        // })
        $('.dt').datetimebox({});
        $('.btn').linkbutton({});
        $("#ff").on("click", "a", function () {
            if (this.id == "search") {
                if (validateTime(obj)) {
                    getData("/wp/query/execute/query_result", obj);
                }
                ;
            } else if (this.id == "clear") {
                $("#ff").form("clear");
                obj.startDate = getZeroTime();
                obj.endDate = getFormatDate(new Date());
            }
        });
    }
    //加载时间搜索范围选择框
    searchOrder();
    //封装ajax
    var getData = function (url, data) {
        if (data.meterId !== "") {
            if (data.meterType == "TJ_FIRE") {
                $(".fire").show().css("height", "250px");
                $(".charts").hide();
                fireCharts()
            } else if (data.meterType == "E-A") {
                $(".fire").hide();
                $(".charts").show().css("height", "250px");
                deviceCharts()
            }
            ;
            $("#downLoadElec").show();
            // $.ajax({
            //     url: "/wp/hisread/query?meterId=" + data.meterId + "&startDate=" + data.startDate + "&endDate=" + data.endDate + "&start=0&limit=1000000",
            //     type: "GET",
            //     dataType: "json",
            //     success: function (data) {
            //         if (data.result == true) {
            //             if (data.rows == "") {
            //                 $(".charts").hide().eq(0).show();
            //                 $('#dlg').html("该表这段时间内通信中断！没有监控数据记录！").dialog('open');
            //                 $("#downLoadElec").hide();
            //             } else {
            //                 if (type.meterKind == "E") {
            //                     $('#dlg').dialog('close');
            //                     $(".charts").show();
            //                     var elec = getElecData(data.rows);
            //                     currentCharts(elec);
            //                     voltageCharts(elec);
            //                     // powerCharts(elec);
            //                     // totalusepowerCharts(elec);
            //                     // totaluselesspowerCharts(elec);
            //                     $("#downLoadElec").click(function () {
            //                         var title = obj.name + "电力监控数据信息表";
            //                         var str = '<th>' +
            //                             '<caption><h2>' + title + '</h2>' +
            //                             '<span>时间范围：' + obj.startDate + "～" + obj.endDate + '' +
            //                             '</span></caption>' +
            //                             '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
            //                             '<td>A相电流</td>' +
            //                             '<td>B相电流</td>' +
            //                             '<td>C相电流</td>' +
            //                             '<td>A相电压</td>' +
            //                             '<td>B相电压</td>' +
            //                             '<td>C相电压</td>' +
            //                             '<td>A相有功功率</td>' +
            //                             '<td>B相有功功率</td>' +
            //                             '<td>C相有功功率</td>' +
            //                             '<td>总有功功率</td>' +
            //                             '<td>A相无功功率</td>' +
            //                             '<td>B相无功功率</td>' +
            //                             '<td>C相无功功率</td>' +
            //                             '<td>总无功功率</td>' +
            //                             '<td>A相功率</td>' +
            //                             '<td>B相功率</td>' +
            //                             '<td>C相功率</td>' +
            //                             '<td>总功率</td>' +
            //                             '<td>反向电量</td>' +
            //                             '<td>功率因数</td>' +
            //                             '<td>读表时间</td>' +
            //                             '</th>';
            //                         var elecData = [];
            //                         var o = data.rows;
            //                         for (var i = o.length - 1; i >= 0; i--) {
            //                             elecData[i] = {};
            //                             elecData[i].acurrent = o[i].acurrent;
            //                             elecData[i].bcurrent = o[i].bcurrent;
            //                             elecData[i].ccurrent = o[i].ccurrent;
            //                             elecData[i].avoltage = o[i].avoltage;
            //                             elecData[i].bvoltage = o[i].bvoltage;
            //                             elecData[i].cvoltage = o[i].cvoltage;
            //                             elecData[i].atotalusepower = o[i].atotalusepower;
            //                             elecData[i].btotalusepower = o[i].btotalusepower;
            //                             elecData[i].ctotalusepower = o[i].ctotalusepower;
            //                             elecData[i].totalusepower = o[i].totalusepower;
            //                             elecData[i].atotaluselesspower = o[i].atotaluselesspower;
            //                             elecData[i].btotaluselesspower = o[i].btotaluselesspower;
            //                             elecData[i].ctotaluselesspower = o[i].ctotaluselesspower;
            //                             elecData[i].totaluselesspower = o[i].totaluselesspower;
            //                             elecData[i].apower = o[i].apower;
            //                             elecData[i].bpower = o[i].bpower;
            //                             elecData[i].cpower = o[i].cpower;
            //                             elecData[i].power = o[i].power;
            //                             elecData[i].forwarddegree = o[i].forwarddegree;
            //                             elecData[i].powerfactor = o[i].powerfactor;
            //                             elecData[i].readTime = (getFormatDate(new Date(o[i].readTime)));
            //                         };
            //                         exportToexcel(elecData, this.id, str, title);
            //                     })
            //                 }
            //             }
            //         }
            //     },
            //     error: function () {
            //         console.log("数据请求错误，请联系系统管理员");
            //     }
            // })
        } else if (data.meterId == "" && data.orgId !== "") {
            $(".charts").hide();
            $(".fire").hide();
            $("#degree").show().css("height", "250px");
            qualityCharts();
            $("#downLoadElec").hide();
        } else {
            $('#dlg').html("请选择一个设备").dialog('open');
        }
        // $.ajax({
        //     url: url + "&_dc=" + Math.random() + "&limit=100000",
        //     data: data,
        //     type: "POST",
        //     dataType: "json",
        //     success: function (data) {
        //         if (data.result == true) {
        //             var ndata = data.rows;
        //             var nobj = {};
        //             var excelData = [];
        //             var startDay = new Date(obj.startDate.replace(/-/, "/"));
        //             var hour = startDay.getHours();
        //             var day = startDay.getDate();
        //             var year = startDay.getFullYear();
        //             var month = startDay.getMonth() + 1;
        //             var days = new Date(year, month, 0).getDate();
        //             nobj.hour = [];
        //             nobj.opentime = [];
        //             nobj.quantity = [];
        //             var t = parseInt((new Date(obj.endDate.replace(/-/g, "/")) - new Date(obj.startDate.replace(/-/, "/"))) / 3600000);
        //             for (var i = 0; i <= t; i++, hour++) {
        //                 excelData[i] = {};
        //                 if (hour >= 24) {
        //                     hour = 0;
        //                     day += 1;
        //                 }
        //                 ;
        //                 if (day > days) {
        //                     day = 1;
        //                     month++;
        //                     days = new Date(year, month, 0).getDate();
        //                 }
        //                 if (month == 12) {
        //                     month = 1;
        //                     year++;
        //                 }
        //                 var n = null;
        //                 for (var j = 0; j < ndata.length; j++) {
        //                     if ((hour + ":" + day + ":" + month) == (ndata[j].hour + ":" + ndata[j].day + ":" + ndata[j].month)) {
        //                         n = ndata[j].hour;
        //                         nobj.opentime.push(parseInt(ndata[j].opentime / 3600 * 100) / 100);
        //                         nobj.quantity.push(ndata[j].quantity);
        //                         nobj.hour.push(ndata[j].month + "月" + ndata[j].day + "日" + ndata[j].hour + ":00");
        //                         excelData[i].opentime = parseInt(ndata[j].opentime / 3600 * 100) / 100;
        //                         excelData[i].quantity = ndata[j].quantity;
        //                         excelData[i].hour = ndata[j].month + "月" + ndata[j].day + "日" + ndata[j].hour + ":00";
        //                     }
        //                 }
        //                 if (hour !== n) {
        //                     nobj.opentime.push(0);
        //                     nobj.quantity.push(0);
        //                     nobj.hour.push(month + "月" + day + "日" + hour + ":00");
        //                     excelData[i].opentime = 0;
        //                     excelData[i].quantity = 0;
        //                     excelData[i].hour = month + "月" + day + "日" + hour + ":00";
        //                 }
        //             }
        //             ;
        //             // qualityCharts(nobj);
        //             var timeStr = data.summary.opentime.split(":");
        //             if (timeStr.length == 3) {
        //                 timeStr = timeStr[0] + "小时" + timeStr[1] + "分" + timeStr[2] + "秒"
        //             } else {
        //                 timeStr = timeStr[0] + "分" + timeStr[1] + "秒"
        //             }
        //             // $("#quantity").html("总" + type.title + ":" + data.summary.quantity + type.unit);
        //             // $("#openTime").html("总时间:" + timeStr);
        //             $("#downLoadExcel").click(function () {
        //                 var title = obj.name + "实时能耗信息表";
        //                 var str = '<th>' +
        //                     '<caption><h2>' + title + '</h2>' +
        //                     '<span>时间范围：' + obj.startDate + "～" + obj.endDate + '' +
        //                     '<h5>总用电量：' + data.summary.quantity + type.unit + '&nbsp;&nbsp;总' + type.title + '时间：' + timeStr + '</h5>' +
        //                     '</span></caption>' +
        //                     '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
        //                     '<td>用电时间(h)</td>' +
        //                     '<td>用电量(Kw.h)</td>' +
        //                     '<td>时间点</td>' +
        //                     '</th>'
        //                 exportToexcel(excelData, this.id, str, title);
        //             })
        //
        //         }
        //     },
        //     error: function () {
        //         console.log("数据请求错误，请联系系统管理员");
        //     }
        // });
    };
    //echart 绘制图表
    var deviceCharts = function () {
        var dom = document.getElementById("degree");
        var degree = echarts.init(dom);
        var option = {
            title: {
                text: obj.name + "实时用电量&用电时间走势图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050"],
            tooltip: {
                trigger: 'axis',
            },
            toolbox: {
                show: true,
                x: "2%",
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            legend: {
                data: ["用电量", '用量时间'],
                x: "70%",
                textStyle: {
                    fontSize: 14
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '5%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0],
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:Kw.h   H",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: "用电量",
                    type: 'line',
                    data: [100, 120, 150, 170, 180, 150, 140, 130, 110, 150, 170, 180, 190, 200],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '用量时间',
                    type: 'line',
                    data: [60, 70, 50, 70, 80, 50, 40, 30, 10, 50, 70, 80, 90, 20],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },

            ]
        };
        degree.setOption(option);
        dom = document.getElementById("current");
        var current = echarts.init(dom);
        option = {
            title: {
                text: obj.name + "三相电流走势图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050", "#27D17C"],
            tooltip: {
                trigger: 'axis',
            },
            toolbox: {
                show: true,
                x: "2%",
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            legend: {
                data: ['A相电流', 'B相电流', "C相电流"],
                x: "70%",
                textStyle: {
                    fontSize: 14
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '5%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: ["1:0", "2:0", "3:0", "4:0", "5:0", "6:0", "7:0", "8:0", "9:0", "10:0", "11:0", "12:0", "13:0", "14:0"],
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:A",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: 'A相电流',
                    type: 'line',
                    data: [12, 15, 14, 12, 11, 13, 14, 15, 15, 16, 12, 14, 12],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: 'B相电流',
                    type: 'line',
                    data: [5, 7, 6, 5, 4, 7, 5, 6, 7, 4, 5, 6, 7],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: 'C相电流',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },

            ]
        };
        current.setOption(option);
        dom = document.getElementById("voltage");
        var voltage = echarts.init(dom);
        option = {
            title: {
                text: obj.name + "三相电压走势图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050", "#27D17C"],
            tooltip: {
                trigger: 'axis',
            },
            toolbox: {
                show: true,
                x: "2%",
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            legend: {
                data: ['A相电压', 'B相电压', "C相电压"],
                x: "70%",
                textStyle: {
                    fontSize: 14
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '5%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: ["1:0", "2:0", "3:0", "4:0", "5:0", "6:0", "7:0", "8:0", "9:0", "10:0", "11:0", "12:0", "13:0", "14:0"],
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:V",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: 'A相电压',
                    type: 'line',
                    data: [212, 215, 214, 212, 211, 213, 214, 215, 215, 216, 212, 214, 212],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: 'B相电压',
                    type: 'line',
                    data: [220, 225, 224, 222, 221, 223, 224, 225, 225, 226, 222, 224, 222],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: 'C相电压',
                    type: 'line',
                    data: [230, 235, 234, 232, 231, 233, 234, 235, 235, 236, 232, 234, 232],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
            ]
        };
        voltage.setOption(option);
        window.onresize = function () {
            degree.resize()
            current.resize()
            voltage.resize()
        }
    };
    var fireCharts = function () {
        var loss = document.getElementById("lossCurrent");
        var lossCurrent = echarts.init(loss);
        var option = {
            title: {
                text: obj.name + "漏电电流走势图",
                x: "center",
            },
            color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3", "#e5cf0d", "#97b552"],
            tooltip: {
                trigger: 'axis',
            },
            toolbox: {
                show: true,
                x: "2%",
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            legend: {
                data: ['回路1', '回路2', "回路3", "回路4", "回路6", "回路7", "回路8"],
                x: "70%",
                textStyle: {
                    fontSize: 14
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '5%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: ["1:0", "2:0", "3:0", "4:0", "5:0", "6:0", "7:0", "8:0", "9:0", "10:0", "11:0", "12:0", "13:0", "14:0"],
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:A",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: '回路1',
                    type: 'line',
                    data: [12, 15, 14, 12, 11, 13, 14, 15, 15, 16, 12, 14, 12],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '回路2',
                    type: 'line',
                    data: [5, 7, 6, 5, 4, 7, 5, 6, 7, 4, 5, 6, 7],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '回路3',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '回路4',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '回路5',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '回路6',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '回路7',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '回路8',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },


            ]
        };
        lossCurrent.setOption(option);
        var temp = document.getElementById("temperature");
        var temperature = echarts.init(temp);
        option = {
            title: {
                text: obj.name + "探测温度走势图",
                x: "center",
            },
            color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980"],
            tooltip: {
                trigger: 'axis',
            },
            toolbox: {
                show: true,
                x: "2%",
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            legend: {
                data: ['温度1', '温度2', "温度3", "温度4"],
                x: "70%",
                textStyle: {
                    fontSize: 14
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '5%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: ["1:0", "2:0", "3:0", "4:0", "5:0", "6:0", "7:0", "8:0", "9:0", "10:0", "11:0", "12:0", "13:0", "14:0"],
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:℃",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: '温度1',
                    type: 'line',
                    data: [12, 15, 14, 12, 11, 13, 14, 15, 15, 16, 12, 14, 12],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '温度2',
                    type: 'line',
                    data: [5, 7, 6, 5, 4, 7, 5, 6, 7, 4, 5, 6, 7],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '温度3',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '温度4',
                    type: 'line',
                    data: [25, 27, 26, 25, 24, 27, 25, 26, 27, 24, 25, 26, 27],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                }
            ]
        };
        temperature.setOption(option);
    };
    var qualityCharts = function () {
        var dom = document.getElementById("degree");
        var myChart = echarts.init(dom);
        var option = {
            title: {
                text: obj.name + "实时用电量&用量时间走势图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050"],
            tooltip: {
                trigger: 'axis',
            },
            toolbox: {
                show: true,
                x: "2%",
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            legend: {
                data: ["用电量", '用量时间'],
                x: "70%",
                textStyle: {
                    fontSize: 14
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '5%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位： H",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: "用电量",
                    type: 'line',
                    data: [10, 12, 11, 13, 14, 10],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },
                {
                    name: '用量时间',
                    type: 'line',
                    data: [30, 50, 60, 55, 42, 47, 58, 55],
                    symbol: "circle",
                    symbolSize: 4,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 2,
                            }
                        }
                    },
                },

            ]
        };
        myChart.setOption(option, true);
    };
    treeNavLeft(getData, obj);
};
//设备预警
var alarmReport = function () {
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    var obj = {};
    var initPage = function () {
        var html = "<div class='ff'>" +
            '<a href="javascript:void(0)" class="button" id="alarmSet">预警条件设置</a>' +
            '<a href="javascript:void(0)" style="float:right" class="button" id="alarmRecord">推送信息管理</a>' +
            "</div>" +
            "<ul class='colorInfo' style='margin-top:10px'>" +
            "<li id='total'>总表数：</li>" +
            "<li>" +
            "<span id='alarm'>预警：</span>" +
            "<span class='alarm'></span>" +
            "</li>" +
            "<li>" +
            "<span id='normal'>正常：</span>" +
            "<span class='normal'></span>" +
            "</li>" +
            "<li>" +
            "<span id='break'>中断：</span>" +
            "<span class='break'></span>" +
            "</li>" +
            "</ul>"
        $("#res").html(html);
        $('.button').linkbutton({});
        $.ajax({
            url: "/dev/meter/query?start=0&limit=20000",
            type: "GET",
            contentType: "application/json",
            success: function (data) {
                var temp = data.rows;
                if (data.rows !== []) {
                    var alarm = 0, normal = 0, brek = 0;
                    for (var i = 0; i < temp.length; i++) {
                        var div = document.createElement("div");
                        var img = document.createElement("img");
                        var span = document.createElement("span")
                        if (temp[i].lostFlag == true) {
                            img.src = "../fire/img/break.png";
                            div.alarmMsg = "通信中断！";
                            div.brek = "1"
                            brek++;
                        } else if (temp[i].lostFlag == false) {
                            div.brek = "0"
                            if (temp[i].alarmFlag == 0) {
                                img.src = "../fire/img/running.png";
                                normal++;
                                div.alarmMsg = "正常监控中！";
                            } else {
                                img.src = "../fire/img/alarm.png";
                                div.alarmMsg = temp[i].alarmMsg;
                                alarm++;
                            }
                        }
                        div.id = temp[i].id;
                        div.meterType = temp[i].meterType;
                        div.lastReadValue = temp[i].lastReadValues;
                        div.place = "所属区域：" + temp[i].fullPlace;
                        div.title = "设备名称：" + temp[i].meterName + "\n" + "预警信息：" + div.alarmMsg + "\n" + div.place + "\n";
                        img.className = "alarmIcon";
                        span.innerHTML = temp[i].meterName;
                        span.className = "alarmTitle";
                        div.className = "alarmBlock";
                        div.appendChild(img);
                        div.appendChild(span);
                        $("#res").append(div)
                    }
                    var downLoad = '<a id="dtn" class="btn" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>';
                    $("#res").append("<br><br>" + downLoad);
                    $(".btn").linkbutton().css({clear: "both", display: "block", marginLeft: "10px"});
                    $("#total").html("总表数：" + temp.length);
                    $("#alarm").html("预警：" + alarm);
                    $("#normal").html("正常：" + normal);
                    $("#break").html("中断：" + brek);
                    $("#res").off("click", "#dtn").on("click", "#dtn", function () {
                        var title = "设备监控信息表";
                        var str = '<th>' +
                            '<caption><h2>' + title + '</h2>' +
                            '<span>总表数:' + temp.length + '  预警:' + alarm + '  正常:' + normal + '  中断:' + brek + '</span>' +
                            '</caption>' +
                            '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                            '<td>区域地址</td>' +
                            '<td>设备名称</td>' +
                            '<td>设备通断</td>' +
                            '<td>预警监控</td>' +
                            '</th>';
                        var devData = [];
                        for (var i = 0; i < temp.length; i++) {
                            devData[i] = {};
                            devData[i].place = temp[i].place;
                            devData[i].meterName = temp[i].meterName;
                            devData[i].lostFlag = temp[i].lostFlag == true ? "断" : "通";
                            devData[i].alarmFlag = temp[i].alarmFlag == undefined ? "无预警" : temp[i].alarmFlag == 0 ? "正常" : "预警";
                        }
                        exportToexcel(devData, this.id, str, title);
                    })
                    $("#res .alarmBlock").click("#res .alarmBlock", function () {
                        var id = this.id;
                        var name = "";
                        var brek = $(this).prop("brek");
                        var meterType = $(this).prop("meterType");
                            	console.log($(this)); 
                        var LRV = JSON.parse($(this).prop("lastReadValue"));
                        name += $(this).attr("title").split("\n").join("<br>");
                        if (brek == "0") {
                            if (meterType == "TJ_FIRE") {
                                name += "设备设置漏电电流：" + LRV.devAlarmLoseEle + "<br>";
                                name += "设备设置漏电温度：" + LRV.devAlarmTemp + "<br>";
                                name += "当前漏电预警回路：" + LRV.alarmEleFlags.join(",") + "<br>";
                                name += "当前温度预警回路：" + LRV.alarmTempFlags.join(",") + "<br>";
                                name += "回路漏电采集数据：" + LRV.loseEles.join("mA,  ") + "mA<br>";
                                name += "回路温度采集数据：" + LRV.temps.join("℃,   ") + "℃<br>";
                            } else if (meterType == "E-F") {
                            	console.log(LRV)
                                name += "设备设置漏电电流：" + LRV.devAlarmLoseEle + "<br>";
                                name += "设备设置漏电温度：" + LRV.devAlarmTemp + "<br>";
//                              name += "当前漏电预警回路：" + LRV.alarmEleFlags.join(",") + "<br>";
//                              name += "当前温度预警回路：" + LRV.alarmTempFlags.join(",") + "<br>";
//                              name += "回路漏电采集数据：" + LRV.loseEles.join("mA,  ") + "mA<br>";
//                              name += "回路温度采集数据：" + LRV.temps.join("℃,   ") + "℃<br>";
                            } else if (meterType == "E-F") {
                                name += "A相电流：" + LRV.acurrent + " A<br>";
                                name += "B相电流：" + LRV.bcurrent + " A<br>";
                                name += "C相电流：" + LRV.ccurrent + " A<br>";
                                name += "A相电压：" + LRV.avoltage + " V<br>";
                                name += "B相电压：" + LRV.bvoltage + " V<br>";
                                name += "C相电压：" + LRV.cvoltage + " V<br>";
                                name += "用电量：" + LRV.forwarddegree + " KW.H";
                            }
                        } else if (brek == "1") {
                            name = "设备已经中断，没有数据！"
                        }
                        $("#dlg").html(name).dialog("open");
                    });
                }

            },
            error: function () {
                console.log("服务器响应失败，请联系系统管理员！")
            }

        })
    };
    initPage();
    timer = setInterval(initPage, 600000);
    $("#res").off("click", "#alarmSet").on("click", "#alarmSet", function () {
        alarmSet();
    });
    $("#res").off("click", "#alarmRecord").on("click", "#alarmRecord", function () {
        $("#pvWindow").html("").window({top: 200}).window("open"); 
        var html = "<form id='msg' method='post' class='ff' style='text-align: right'>" +
            '<a href="javascript:void(0)" class="btn" id="Radd" data-options="iconCls:\'icon-add\'">增加</a>' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="Redit" data-options="iconCls:\'icon-edit\'">修改</a>' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="Rdelete" data-options="iconCls:\'icon-remove\'">删除</a>' +
            "</form>" +
            "<table id='alarmHistory'></table>"
        $("#pvWindow").html(html);
        $(".btn").linkbutton();
        $('#alarmHistory').datagrid({
            url: "/notice/contact/query",
            columns: [[
                {field: 'check', title: '', width: '0', align: "center", checkbox: true},
                {field: 'id', title: '编号', width: "10%", align: "center"},
                {field: 'fullName', title: '名称', width: "20%", align: "center"},
                {field: 'mobile', title: '手机号码', width: "20%", align: "center"},
                {field: 'remark', title: '备注', width: "48%", align: "center"}
            ]],
            onLoadError: function () {
                console.log("数据加载失败！");
            },
            singleSelect: true,
            loadMsg: "加载中....，请稍后",
            sortOrder: "desc",
            pagination: true,
            pagePosition: "bottom",
            pageNumber: 1,
            pageSize: 10,
            singleSelect: true,
            pageList: [10, 20, 40, 80],
            loadFilter: pagerFilter,
        });
    });
    $("#pvWindow").off("click", "#msg a").on("click", "#msg a", function () {
        obj = {};
        var id = this.id;
        obj.type = id;
        if (id == "Radd") {
            $("#modifyWindow").window({top: 200}).window("open");
            userMsgForms();
        } else if (id == "Redit") {
            var row = $("#alarmHistory").datagrid("getSelections");
            if (row.length == 1) {
                $("#modifyWindow").window({top: 200}).window("open");
                userMsgForms();
                obj.id = row[0].id;
                $('#winform').form('load', row[0]);
            } else if (row.length == 0) {
                $('#dlg').html("请选择需要修改的条件").dialog('open');
                return;
            } else if (row.length > 1) {
                $('#dlg').html("一次只能修改一个条件").dialog('open');
                return;
            }
        } else if (id == "Rdelete") {
            var url = "/notice/contact/delete?";
            var row = $("#alarmHistory").datagrid("getSelections");
            if (row.length > 0) {
                var html = ""
                html += "<div style='margin:5px;color:red;'>" + row[0].fullName + "</div>"
                html += '<a href="javascript:void(0)"  class="btn" id="btnok" data-options="iconCls:\'icon-ok\'" >确定</a>' + "&nbsp;&nbsp;"
                html += '<a href="javascript:void(0)"  class="btn" id="btnno" data-options="iconCls:\'icon-cancel\'">取消</a>'
                $('#dlg').html("以下用户将被删除:" + "<br>" + html).dialog('open')
                $(".btn").linkbutton();
                $("#btnok").click(function () {
                    $.ajax({
                        url: url + "ids=" + row[0].id,
                        type: "POST",
                        contentType: "application/json",
                        success: function (data) {
                            if (data.result == true) {
                                $('#dlg').dialog("close");
                                $("#alarmHistory").datagrid("reload");
                                $('#modifyWindow').window('close');
                            } else if (data.result == false) {
                                $('#dlg').html(data.msg).dialog('open');
                            }
                        },
                    });
                })
                $("#btnno").click(function () {
                    $('#dlg').dialog('close');
                    return;
                })
            } else {
                $('#dlg').html("请选择需要删除的区域").dialog('open');
                return;
            }
        }
    });
    var alarmSet = function () {
        var html = '<div id="ft" style="padding:5px 5px;text-align: right">' +
            '<span style="font-size: 18px;padding:0 28%;color:#666">预警条件设置</span>' +
            '<a href="javascript:void(0)" class="btn" id="edit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            '</div>' +
            '<table id="alarmDev"></table>'
        $('#pvWindow').html(html).window({top: 200}).window("open").children("#alarmDev").datagrid({
            url: "/wp/alarm/condition/load?start=0&limit=20000",
            method: "GET",
            checkbox: true,
            toolbar: '#ft',
            columns: [[
                {field: 'check', title: '', width: '0', align: "center", checkbox: true},
                {field: 'id', title: '编号', width: '8%', align: "center"},
                {field: 'eleLeak', title: '漏电预警值', width: '16%', align: 'center'},
                {field: 'warmMax', title: '温度预警值', width: '16%', align: 'center'},
                {field: 'status', title: '状态', width: '7%', align: 'center'},
                {field: 'modifyTime', title: '修改时间', width: '17%', align: 'center'},
                {field: 'createTime', title: '创建时间', width: '17%', align: 'center'},
                {field: 'remark', title: '备注', width: '18%', align: 'center'},
            ]],
            singleSelect: true,
            pagination: false,
            loadFilter: pagerFilter1,
            onLoadSuccess: function (data) {
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            // onSelect: function (index, row) {
            //     $(".alarmList").remove();
            //     $("#bind").remove();
            //     var devList = row.devList;
            //     var orgList = row.orgList;
            //     var html = '<a href="javascript:void(0)" style="float:right;margin:5px;"  id="bind">设备或区域绑定</a>' + "&nbsp;" +
            //         '<table class="alarmList">' +
            //         '<caption>预警设备或区域明细</caption>' +
            //         '<thead>' +
            //         '<tr style="background:#F5F5F5;text-align: center;">' +
            //         '<td style="width:20%">ID编号</td>' +
            //         '<td style="width:30%">设备或区域名称</td>' +
            //         '<td style="width:25%">修改时间</td>' +
            //         '<td style="width:20%">创建时间</td>' +
            //         '</tr>' +
            //         '</thead>' +
            //         '<tbody id="allList">' +
            //         '</tbody>' +
            //         '</table>';
            //     $("#pvWindow").append(html);
            //     $("#bind").linkbutton();
            //     var list = ""
            //     if (devList !== "") {
            //         for (var i = 0; i < devList.length; i++) {
            //             list += "<tr>" +
            //                 "<td>" + devList[i].id + "</td>" +
            //                 "<td>" + devList[i].meterName + "</td>" +
            //                 "<td>" + getFormatDate(new Date(devList[i].createTime)) + "</td>" +
            //                 "<td>" + getFormatDate(new Date(devList[i].modifyTime)) + "</td>" +
            //                 "</tr>"
            //         }
            //     }
            //     ;
            //     if (orgList !== "") {
            //         for (var i = 0; i < orgList.length; i++) {
            //             list += "<tr>" +
            //                 "<td>" + orgList[i].id + "</td>" +
            //                 "<td>" + orgList[i].text + "</td>" +
            //                 "<td>" + row.modifyTime + "</td>" +
            //                 "<td>" + row.createTime + "</td>" +
            //                 "</tr>"
            //         }
            //     }
            //     ;
            //     $("#allList").html(list);
            // },
        });
        $(".btn").linkbutton();
    };
    var alarmForms = function () {
        $("#winform").html("");
        var html = '<div style="margin-bottom:20px">\n' +
            '            <input class="ft"  name="id" style="width:100%" data-options="label:\'编号:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="eleLeak" style="width:100%" data-options="label:\'漏电预警值:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input  class="ft" name="warmMax" style="width:100%" data-options="label:\'温度预警值:\',required:true">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="alarmSavebtn" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="alarmCancel" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        alarmFormInit();
    };
    var alarmFormInit = function () {
        $(".ft").textbox();
        $(".btn").linkbutton();
        $(".status").combobox({
            data: [{"text": "启用", "id": true}, {"text": "禁用", "id": false}],
            editable: false,
            valueField: "id",
            textField: 'text',
        });
        $(".window-shadow").css({height: "auto"})
    };
    var userMsgForms = function () {
        $("#winform").html("");
        var forms = '<div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="fullName" style="width:100%" data-options="label:\'人员名称:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="mobile" style="width:100%" data-options="label:\'手机号:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input  class="ft" name="remark" style="width:100%" data-options="label:\'备注:\'">\n' +
            '        </div>\'' +
            '        <div style="text-align: right;">' +
            '       <a href="javascript:void(0)" class="btn" id="mobileSave" data-options="iconCls:\'icon-ok\'" >确定</a>' + "&nbsp;&nbsp;" +
            '       <a href="javascript:void(0)" class="btn" id="mobileCancel" data-options="iconCls:\'icon-cancel\'">取消</a>' +
            '       </div>';
        $("#winform").html(forms);
        userMsgFormsInit();
    }
    var userMsgFormsInit = function () {
        $(".ft").textbox();
        $(".btn").linkbutton();
        $(".window-shadow").css({height: "auto"})
    }
    var isValid = function () {
        if ($("#winform").form('validate')) {
            return true;
        } else {
            $('#dlg').html("红色的内容框必须填写").dialog('open');
            return false;
        }
    };
    $("#pvWindow").off("click", "#ft a").on("click", "#ft a", function () {
        obj.type = this.id;
        if (obj.type == "add") {
            $("#modifyWindow").window({top: 200}).window("open");
            alarmForms();
        } else if (obj.type == "edit") {
            var row = $("#alarmDev").datagrid("getSelections");
            if (row.length == 1) {
                $("#modifyWindow").window({top: 200}).window("open");
                alarmForms();
                $('#winform').form('load', row[0]);
                obj.id = row[0].id;
            } else if (row.length == 0) {
                $('#dlg').html("请选择需要修改的条件").dialog('open');
                return;
            } else if (row.length > 1) {
                $('#dlg').html("一次只能修改一个条件").dialog('open');
                return;
            }
        } else if (obj.type == "delete") {
            var row = $("#alarmDev").datagrid("getSelections");
            if (row.length > 0) {
                var html = ""
                html += "<div style='margin:5px;color:red;'>" + row[0].itemCode + "</div>"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnok" data-options="iconCls:\'icon-ok\'" >确定</a>' + "&nbsp;&nbsp;"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnno" data-options="iconCls:\'icon-cancel\'">取消</a>'
                $('#dlg').html("以下监控条目将被删除:" + "<br>" + html).dialog('open')
                $(".btn").linkbutton();
                $("#btnok").click(function () {
                    $.ajax({
                        url: "/wp/alarm/condition/delete?id=" + row[0].id,
                        type: "GET",
                        contentType: "application/json",
                        success: function (data) {
                            if (data.result == true) {
                                $('#dlg').dialog("close");
                                $("#alarmDev").datagrid("reload");
                                $('#modifyWindow').window('close');
                            } else if (data.result == false) {
                                $('#dlg').html(data.msg).dialog('open');
                            }
                        },
                    });
                })
                $("#btnno").click(function () {
                    $('#dlg').dialog('close');
                    return;
                })
            } else {
                $('#dlg').html("请选择需要删除的区域").dialog('open');
                return;
            }
        }
    });
    $('#winform').off("click", "#alarmSavebtn").on("click", "#alarmSavebtn", function () {
        if (isValid()) {
            obj.info = $('#winform').serializeObject();
            var url = "";
            if (obj.type == "edit") {
                obj.info.id = obj.id;
                url = "/wp/alarm/condition/update";
            }
            ;
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#alarmDev").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
                error: function () {
                    console.log("响应失败，请联系系统管理员！")
                }
            });
        }
        ;
    });
    $('#winform').off("click", "#mobileSave").on("click", "#mobileSave", function () {
        if (isValid()) {
            obj.info = $('#winform').serializeObject();
            var url = "";
            if (obj.type == "Radd") {
                url = "/notice/contact/add";
            } else if (obj.type == "Redit") {
                obj.info.id = obj.id;
                url = "/notice/contact/update";
            }
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#alarmHistory").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
                error: function () {
                    console.log("响应失败，请联系系统管理员！")
                }
            });
        }
        ;
    });
    $('#winform').off("click", "#bindSave").on("click", "#bindSave", function () {
        if (isValid()) {
            obj.info = {};
            obj.info.orgIds = [];
            obj.info.meterIds = [];
            obj.info.conditionId = obj.id;
            var sData = $(".orgName").combotree('tree').tree('getChecked');
            for (var i = 0; i < sData.length; i++) {
                if (sData[i].meter) {
                    obj.info.meterIds.push(sData[i].meterId)
                } else {
                    obj.info.orgIds.push(sData[i].id)
                }
            }
            $.ajax({
                url: "/wp/alarm/condition/orgdev/save",
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#alarmDev").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
                error: function () {
                    console.log("响应失败，请联系系统管理员！")
                }
            });
        }
        ;
    });
    $("#winform").off("click", "#alarmCancel").on("click", "#alarmCancel", function () {
        $('#modifyWindow').window('close');
    });
    $("#winform").off("click", "#bindCancel").on("click", "#bindCancel", function () {
        $('#modifyWindow').window('close');
    });
    $("#winform").off("click", "#mobileCancel").on("click", "#mobileCancel", function () {
        $('#modifyWindow').window('close');
    });
};
//预警记录
var alarmRecord = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    //默认向后台传的参数；
    var obj = {startDate: lastMonth(), endDate: getFormatDateNullTime(new Date()), meterId: ""};
    var boxData = [];
    var boxInfo = function (data) {
        var html = '<form id="ff"  class="ff">' +
            '<input id="startDate" name="startDate" style="width:220px"  label="开始时间:" labelAlign="right">' +
            '<input id="endDate" name="endDate" style="width:220px"  label="结束时间:" labelAlign="right">' +
            '<input id="meterId" name="meterId" style="width:180px" class="bt" label="探测器编号:" labelAlign="right">&nbsp;&nbsp;' +
            '<a href="javascript:void(0)" class="btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            "</form>" +
            '<table id="bg" style="min-height:260px;"></table>';
        html += '<div id="devDetail"></div>';
        $("#res").html(html);
        $(".bb").datebox();
        $('#startDate').datebox({
            value: lastMonthEasyUi(),
            required: false,
            showSeconds: false
        });
        $('#endDate').datebox({
            value: getFormatDate(new Date()),
            required: false,
            showSeconds: false
        });
        $(".bt").textbox();
        $(".btn").linkbutton();
        $('#bg').datagrid({
            toolbar: '#ft',
            url: "/wp/alarm/record/query?page=1&rows=1000000&startDate=" + obj.startDate + "&endDate=" + obj.endDate,
            checkbox: true,
            columns: [[
                {field: 'check', title: '', width: "0", align: "center", checkbox: true},
                {field: 'id', title: '记录编号', width: "6%", align: "center"},
                {field: 'meterName', title: '设备名称', width: "8%", align: "center"},
                {field: 'meterId', title: '设备编号', width: "5%", align: "center"},
                {field: 'orgName', title: '所属机构', width: "8%", align: "center"},
                {field: 'place', title: '场所', width: "10%", align: "center"},
                {field: 'displayText', title: '预警信息', width: "32%", align: 'center'},
                {field: 'beginTime', title: '开始时间', width: "10%", align: 'center'},
                {field: 'endTime', title: '结束时间', width: "10%", align: 'center'},
                {field: 'alarmSource', title: '报警来源', width: "10.5%", align: 'center'}
            ]],
            onLoadSuccess: function (data) {
                var tempData = data.originalRows;
                boxData.length = 0;
                for (var i = 0; i < tempData.length; i++) {
                    boxData[i] = {};
                    boxData[i].meterName = tempData[i].meterName !== undefined ? tempData[i].meterName : "未设置";
                    boxData[i].meterId = tempData[i].meterId !== undefined ? tempData[i].meterId : "未设置";
                    boxData[i].orgName = tempData[i].orgName !== undefined ? tempData[i].orgName : "未设置";
                    boxData[i].place = tempData[i].place !== undefined ? tempData[i].place : "未设置";
                    boxData[i].devLeak = tempData[i].devLeak !== undefined ? tempData[i].devLeak : "未设置";
                    boxData[i].devTemp = tempData[i].devTemp !== undefined ? tempData[i].devTemp : "未设置";
                    boxData[i].meterLeak = tempData[i].meterLeak !== undefined ? tempData[i].meterLeak : "未设置";
                    boxData[i].meterTemp = tempData[i].meterTemp !== undefined ? tempData[i].meterTemp : "未设置";
                    boxData[i].spLeak = tempData[i].spLeak !== undefined ? tempData[i].spLeak : "未设置";
                    boxData[i].spTemp = tempData[i].spTemp !== undefined ? tempData[i].spTemp : "未设置";
                    boxData[i].alarmSource = tempData[i].alarmSource == undefined ? "未设置" : tempData[i].alarmSource;
                    boxData[i].displayText = tempData[i].displayText !== undefined ? tempData[i].displayText : "未设置";
                    boxData[i].leak1 = tempData[i].leak1 !== undefined ? tempData[i].leak1 : "无数据";
                    boxData[i].leak2 = tempData[i].leak2 !== undefined ? tempData[i].leak2 : "无数据";
                    boxData[i].leak3 = tempData[i].leak3 !== undefined ? tempData[i].leak3 : "无数据";
                    boxData[i].leak4 = tempData[i].leak4 !== undefined ? tempData[i].leak4 : "无数据";
                    boxData[i].leak5 = tempData[i].leak5 !== undefined ? tempData[i].leak5 : "无数据";
                    boxData[i].leak6 = tempData[i].leak6 !== undefined ? tempData[i].leak6 : "无数据";
                    boxData[i].leak7 = tempData[i].leak7 !== undefined ? tempData[i].leak7 : "无数据";
                    boxData[i].leak8 = tempData[i].leak8 !== undefined ? tempData[i].leak8 : "无数据";
                    boxData[i].temp1 = tempData[i].temp1 !== undefined ? tempData[i].temp1 : "无数据";
                    boxData[i].temp2 = tempData[i].temp2 !== undefined ? tempData[i].temp2 : "无数据";
                    boxData[i].temp3 = tempData[i].temp3 !== undefined ? tempData[i].temp3 : "无数据";
                    boxData[i].temp4 = tempData[i].temp4 !== undefined ? tempData[i].temp4 : "无数据";
                    boxData[i].beginTime = tempData[i].beginTime !== undefined ? tempData[i].beginTime : "无数据";
                    boxData[i].createTime = tempData[i].createTime !== undefined ? tempData[i].createTime : "无数据";
                }
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            loadMsg: "加载中....，请稍后",
            sortOrder: "desc",
            pagination: true,
            pagePosition: "bottom",
            pageNumber: 1,
            pageSize: 6,
            singleSelect: true,
            pageList: [6, 12, 24, 32, 64, 128],
            loadFilter: pagerFilter,
            onSelect: function (index, row) {
                var html = '<ul class="devFire">' +
                    '</ul>' +
                    '<ul class="devMeter">' +
                    "<li>回路1电表:</li>" +
                    "<li>回路2电表</li>" +
                    "<li>回路3电表</li>" +
                    "<li>回路4电表</li>" +
                    '</ul>' +
                    "<div style='clear:both'>" +
                    '<a href="javascript:void(0)" class="tbn" id="downLoadBox" style="margin:5px"  data-options="iconCls:\'icon-large-smartart\',size:\'small\',iconAlign:\'left\'">导出记录</a>' + "&nbsp;&nbsp;" +
                    "</div>"
                $("#devDetail").html(html);
                $(".tbn").linkbutton();
                obj.boxId = row.id;
                $.ajax({
                    type: "POST",
                    url: "/wp/alarm/record/one?id=" + row.id,
                    contentType: "application/json",
                    success: function (data) {
                        if (data.result == true) {
                            var detector = data.alarmRecord;
                            var meter = data.meters;
                            var dhtml = "<li class='biaoti'>探测器</li>"
                            dhtml += "<li>预警信息来源:<span>" + detector.alarmSource + "</span></li>";
                            dhtml += "<li>设备漏电预警值:<span>" + detector.devLeak + "mA</span></li>";
                            dhtml += "<li>设备温度预警值:<span>" + detector.devTemp + "℃</span></li>";
                            dhtml += "<li>平台漏电预警值:<span>" + (detector.meterLeak == undefined ? "无设置" : detector.meterLeak + "mA") + "</span></li>";
                            dhtml += "<li>平台温度预警值:<span>" + (detector.meterTemp == undefined ? "无设置" : detector.meterTemp + "℃") + "</span></li>";
                            dhtml += "<li>平台默认漏电预警值:<span>" + (detector.spLeak == undefined ? "无设置" : detector.spLeak + "mA") + "</span></li>";
                            dhtml += "<li>平台默认温度预警值:<span>" + (detector.spTemp == undefined ? "无设置" : detector.spTemp + "℃") + "</span></li>";
                            dhtml += "<li>预警信息:<span>" + (detector.displayText == undefined ? "无设置" : detector.displayText) + "</span></li>";
                            dhtml += "<li class='leak'>" +
                                "<span>回路1：" + detector.leak1 + "mA</span>" +
                                "<span>回路2：" + detector.leak2 + "mA</span>" +
                                "<span>回路3：" + detector.leak3 + "mA</span>" +
                                "<span>回路4：" + detector.leak4 + "mA</span><br>" +
                                "<span>回路5：" + detector.leak5 + "mA</span>" +
                                "<span>回路6：" + detector.leak6 + "mA</span>" +
                                "<span>回路7：" + detector.leak7 + "mA</span>" +
                                "<span>回路8：" + detector.leak8 + "mA</span>" +
                                "</li>";
                            dhtml += "<li class='leak'>" +
                                "<span>回路1：" + detector.temp1 + "℃</span>" +
                                "<span>回路2：" + detector.temp2 + "℃</span>" +
                                "<span>回路3：" + detector.temp3 + "℃</span>" +
                                "<span>回路4：" + detector.temp4 + "℃</span>" +
                                "</li>";
                            var mhtml = "<li class='biaoti'>电表</li>";
                            for (var i = 0; i < meter.length; i++) {
                                mhtml += "<li class='leak'>回路" + meter[i].fireRoute + ":" +
                                    "<span>A: " + meter[i].acurrent + "A</span>" +
                                    "<span>B: " + meter[i].bcurrent + "A</span>" +
                                    "<span>C: " + meter[i].ccurrent + "A</span>" +
                                    "<span>A: " + meter[i].avoltage + "V</span>" +
                                    "<span>B: " + meter[i].bvoltage + "V</span>" +
                                    "<span>C: " + meter[i].cvoltage + "V</span>" +
                                    "</li>";
                            }
                            $(".devFire").html(dhtml);
                            $(".devMeter").html(mhtml);

                        } else {
                            $("#dlg").html("没有数据").dialog("open");
                        }
                    },
                    error: function () {
                        console.log("请求数据错误，请联系系统管理员！")
                    }
                })
            }
        });
        $("#ff").off("click", "a").on("click", "a", function () {
            if (this.id == "search") {
                var startDate = $("#startDate").val();
                var endDate = $("#endDate").val();
                var meterId = $("#meterId").val();
                if (startDate !== "") {
                    obj.startDate = easyUIformater(startDate);
                } else {
                    obj.startDate = lastMonth();
                }
                if (endDate !== "") {
                    obj.endDate = easyUIformater(endDate);
                } else {
                    obj.endDate = getFormatDate(new Date());
                }
                if (meterId !== "") {
                    obj.meterId = meterId;
                }
                $('#bg').datagrid({
                    url: "/wp/alarm/record/query?page=1&rows=1000000&startDate=" + obj.startDate + "&endDate=" + obj.endDate + "&meterId=" + obj.meterId,
                }).datagrid("uncheckAll");
                $("#devDetail").html("")
            } else if (this.id == "clear") {
                $("#ff").form("clear");
                obj.startDate = lastMonth();
                obj.endDate = getFormatDate(new Date());
            }
        });
        $("#res").off("click", "#downLoadBox").on("click", "#downLoadBox", function () {
            var title = "预警记录信息表";
            var str = '<th>' +
                '<caption><h2>' + title + '</h2></caption>' +
                '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                '<td>设备名称</td>' +
                '<td>设备编号</td>' +
                '<td>所属区域</td>' +
                '<td>地址</td>' +
                '<td>设备漏电预警值</td>' +
                '<td>设备温度预警值</td>' +
                '<td>平台漏电预警值</td>' +
                '<td>平台温度预警值</td>' +
                '<td>系统漏电预警值</td>' +
                '<td>系统温度预警值</td>' +
                '<td>预警来源</td>' +
                '<td>预警信息</td>' +
                '<td>回路1漏电值(mA)</td>' +
                '<td>回路2漏电值(mA)</td>' +
                '<td>回路3漏电值(mA)</td>' +
                '<td>回路4漏电值(mA)</td>' +
                '<td>回路5漏电值(mA)</td>' +
                '<td>回路6漏电值(mA)</td>' +
                '<td>回路7漏电值(mA)</td>' +
                '<td>回路8漏电值(mA)</td>' +
                '<td>回路1温度值(℃)</td>' +
                '<td>回路2温度值(℃)</td>' +
                '<td>回路3温度值(℃)</td>' +
                '<td>回路4温度值(℃)</td>' +
                '<td>开始时间</td>' +
                '<td>结束时间</td>' +
                '</tr>' +
                '</th>';
            exportToexcel(boxData, this.id, str, title);
        });
    };
    boxInfo();
};
//区域管理
var areaManager = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    //默认向后台传的参数；
    var obj = {type: "default"};
    //导出的Excel数据
    var excelData = [];
    //加载修改按钮
    var modifyButtons = function () {
        var html = '<form id="ff" mothod="post" class="ff">' +
            // '<select id="areaId"  class="easyui-combobox" name="areaId" label="区域编号:" labelPosition="left" style="width:300px;"></select>' + '&nbsp;&nbsp;' +
            '<input  id="pid" name="pid" label="区域名称:" labelPosition="left" style="width:300px">' + '&nbsp;&nbsp;' +
            '<input  id="status" name="status" label="状    态:" labelPosition="left" style="width:200px">' + '&nbsp;&nbsp;' +
            // '<select id="areaName" class="easyui-combobox" name="areaName" label="区域名称:" labelPosition="left" style="width:300px;"></select>' + '&nbsp;&nbsp;' +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + '&nbsp;' +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            '</form>'
        html += '<div id="ft" style="padding:5px 5px">' +
            '<span style="font-size: 16px;padding:0 35%;color:#666">区域信息表</span>' +
            '<a href="javascript:void(0)" class="btn" id="add" iconCls="icon-add">增加</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="edit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            // '<a href="javascript:void(0)" class="easyui-linkbutton" id="delete" iconCls="icon-remove" >删除</a>' +
            '</div>';
        $("#res").html(html);
        $('.btn').linkbutton();
        $("#pid").combotree({
            url: "/auth/org/tree?sub=y&_dc=" + Math.random(),
            method: 'GET',
            valueField: 'id',
            textField: 'text',
            remode: true,
        });
        $("#status").combobox({
            data: dict["enable"],
            valueField: 'id', 
            textField: 'text',
        })
        $('.dt').textbox();
        $("#ff").form("clear");
    }
    modifyButtons();
    // 加载区域信息表
    var areaForms = function () {
        var html =
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="text" style="width:100%" data-options="label:\'区域名称:\',required:true">\n' +
            '        </div>\n' +
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="pid" name="pid" label="父级区域:" labelPosition="left" style="width:100%">\n' +
            '        </div>\n' +
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="ft" name="longitude" label="经度:" labelPosition="left" style="width:100%">\n' +
            '        </div>\n' +
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="ft" name="latitude" label="维度:" labelPosition="left" style="width:100%">\n' +
            '        </div>\n' +
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="status" name="status" data-options="required:true" label="状态:" labelPosition="left" style="width:100%">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="remark" style="width:100%;height:100px" data-options="label:\'区域说明:\',multiline:true">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="savebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="cancel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        areaFormInit();
    }
    var areaFormInit = function () {
        $(".pid").combotree({
            url: "/auth/org/tree?_dc=" + Math.random(),
            method: 'GET',
            valueField: 'id',
            textField: 'text',
            mode: "remote"
        });
        $(".ft").textbox();
        $(".status").combobox({
            data: dict["enable"],
            valueField: 'id', 
            textField: 'text',
        });
        $(".easyui-linkbutton").linkbutton();
        $(".window-shadow").css({height: "auto"})
    }
    //button 处理事件
    //增
    $("#add").click(function () {
        obj.type = this.id;
        $('#modifyWindow').window({top: 200}).window('open');
        areaForms();
        $('#winform').form("clear");
    });
    //改
    $("#edit").click(function () {
        obj.type = this.id;
        var row = $("#dg").datagrid("getSelections");
        console.log(row);
        if (row.length == 1) {
            $('#modifyWindow').window('open');
            areaForms();
            $('#winform').form('load', row[0]);
            obj.id = row[0].id;
            obj.seq = row[0].seq;
            obj.fullText = row[0].fullText;
            obj.status = row[0].status;
        } else if (row.length == 0) {
            $('#dlg').html("请选择需要修改的区域").dialog('open');
            return;
        } else if (row.length > 1) {
            $('#dlg').html("一次只能修改一个区域").dialog('open');
            return;
        }
    });
    //区域查询
    $("#search").click(function () {
        obj.type = this.id;
        obj.info = $("#ff").serialize();
        $('#dg').datagrid({
            url: "/auth/org/query?limit=10000&page=1&rows=100000&" + obj.info,
        }).datagrid("uncheckAll");
    })
    //清空
    $("#clear").click(function () {
        $("#ff").form("clear");
    });
    //确定保存
    $("#winform").off("click", "#savebtn").on("click", "#savebtn", function () {
        var isValid = $("#winform").form('validate');
        if (isValid) {
            obj.info = $('#winform').serializeObject();
            var url = "";
            if (obj.type == "add") {
                url = "/auth/org/addOrg";
                obj.info.id = "";
            } else if (obj.type == "edit") {
                url = "/auth/org/updateOrg";
                obj.info.id = obj.id;
                obj.info.seq = obj.seq;
                console.log(obj)
                url = "/auth/org/updateOrg";
                obj.info.fullText = obj.fullText;
                obj.info.status = obj.status; 
                obj.id = null;
                obj.seq = null;
                if (obj.info.status == "启用") {
                    obj.info.status = 1;
                }
                if (obj.info.status == "禁用") {
                    obj.info.status = 0;
                }
            }
            ;
            // 发送保存的数据 
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#dg").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
            });
            } else {
                $('#dlg').html("红色部分数据必须填写").dialog('open');
                return;
            };
        });
    //取消
    $("#winform").off("click", "#cancel").on("click", "#cancel", function () {
        $('#modifyWindow').window('close');
    })
    //加载区域信息表
    var areaInfo = function (data) {
        var html = '<table id="dg" style="min-height:450px;"></table>';
        html += '<a href="javascript:void(0)" id="downLoadExcel" style="margin:20px"  class="easyui-linkbutton btn" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>' + "&nbsp;&nbsp;"
        // '<a href="javascript:void(0)" id="printChart"  class="easyui-linkbutton btn" data-options="iconCls:\'icon-print\',size:\'small\',iconAlign:\'top\'">打印</a>';
        $("#res").append(html);
        $('.btn').linkbutton({});
        $('#dg').datagrid({
            toolbar: '#ft',
            //异步加载数据
            url: "/auth/org/query?limit=10000&page=1&rows=100000",
            checkbox: true,
            columns: [[
                {field: 'check', title: '', width: '5%', align: "center", checkbox: true},
                {field: 'id', title: '区域编号', width: '6%', align: "center"},
                {field: 'text', title: '区域名称', width: '15%', align: "center"},
                {field: 'parFullText', title: '父级区域名称', width: '15%', align: 'center'},
                {field: 'pid', title: '父级区域ID', width: '8%', align: "center"},
                {field: 'longitude', title: '经度', width: '8%', align: "center"},
                {field: 'latitude', title: '纬度', width: '8%', align: "center"},
                {field: 'status', title: '状态', width: '6%', align: "center"},
                {field: 'createDate', title: '创建日期', width: '10%', align: 'center'},
                {field: 'modifyDate', title: '修改日期', width: '10%', align: 'center'},
                {field: 'remark', title: '说明', width: '13%', align: 'center'},
            ]],
            onLoadSuccess: function (data) {
                var tempData = data.originalRows;
                excelData = [];
                for (var i = 0; i < tempData.length; i++) {
                    excelData[i] = {};
                    excelData[i].id = tempData[i].id;
                    excelData[i].text = tempData[i].text;
                    excelData[i].parFullText = tempData[i].parFullText ? tempData[i].parFullText : "NULL";
                    excelData[i].pid = tempData[i].pid;
                    excelData[i].status = tempData[i].status;
                    excelData[i].modifyDate = tempData[i].modifyDate == undefined ? "NULL" : tempData[i].modifyDate;
                    excelData[i].createDate = tempData[i].createDate == undefined ? "NULL" : tempData[i].createDate;
                    excelData[i].remark = tempData[i].remark == undefined ? "NULL" : tempData[i].remark;
                }
                //导出数据
                $("#downLoadExcel").click(function () {
                    var title = "区域信息表";
                    var str = '<th>' +
                        '<caption><h2>' + title + '</h2></caption>' +
                        '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                        '<td>区域编号</td>' +
                        '<td>区域编号</td>' +
                        '<td>父级区域名称</td>' +
                        '<td>父级区域ID</td>' +
                        '<td>状态</td>' +
                        '<td>创建日期</td>' +
                        '<td>修改日期</td>' +
                        '<td>说明</td></tr>' +
                        '</th>'
                    exportToexcel(excelData, "downLoadExcel", str, title);
                });
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            singleSelect: true,
            queryParams: obj,
            pagination: true,
            pagePosition: "bottom",
            pageNumber: 1,
            pageSize: 12,
            pageList: [12, 24, 48, 96],
            loadFilter: pagerFilter,
        });
    };
    areaInfo();
};
//设备管理
var deviceManager = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    //默认向后台传的参数；
    var obj = {type: ""};
    var boxData = [];
    var deviceData = [];
    //加载修改的按钮
    var modifyButtons = function () {
     var html = '<form id="ff" mothod="post" class="ff">' + 
            '<input  class="dt"  name="collectorConNo" label="采集器IP:" labelPosition="left" style="width:250px;">' + '&nbsp;&nbsp;' +
            //'<select id="boxType" name="boxType" class="easyui-combobox"  label="采集器类型:" labelPosition="left" style="width:250px;"></select>' + '&nbsp;&nbsp;' +
            '<input  class="dt merchant" name="merchant" label="客户:" labelPosition="left" style="width:250px">' + '&nbsp;&nbsp;' +
            '<input id="status" name="status" label="状  态:"  labelPosition="left" style="width:200px">' + '&nbsp;&nbsp;' + '&nbsp;&nbsp;' +
            '<a href="javascript:void(0)" id="search" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + '&nbsp;' +
            '<a href="javascript:void(0)" id="clear" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            // '<span class="easyui-linkbutton btn" id="energyType" style="float:right;width:120px">能耗用途设置</span>'+
            '</form>'
        html += '<div id="ft" style="padding:5px 5px">' +
            '<span style="font-size: 18px;padding:0 35%;color:#666">采集器信息表</span>' +
            '<a href="javascript:void(0)" class="easyui-linkbutton" id="boxAdd" iconCls="icon-add">增加</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton" id="boxEdit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            //'<a href="javascript:void(0)" class="easyui-linkbutton" id="delete" iconCls="icon-remove" >删除</a>' +
            '</div>';
        $("#res").html(html);
        $('.easyui-linkbutton').linkbutton();
        $(".merchant").combotree({
            url: "/merchant/query" + Math.random(),
            method: 'GET',
            textFiled: "text",
            valueFiled: "id",
            remode: true,
        })
        $("#status").combobox({
            data: dict["enable"], 
            valueField: 'id',
            textField: 'text',
            remode: true,
        })
        $('.dt').textbox();
        $("#ff").form("clear");
    }
    modifyButtons();
    //封装采集器的ajax
    //button 按钮事件
    //1.采集器查，改，增
    $("#search").click(function () {
        obj.type = this.id;
        obj.info = $("#ff").serialize();
        $('#bg').datagrid({
            url: "/dev/collector/query?limit=10000&page=1&rows=10000&" + obj.info,
        }).datagrid("uncheckAll");
        $('#dg').html("");
    });
    $("#clear").click(function () {
        $("#ff").form("clear");
    });
    $("#boxAdd").click(function () {
        obj.type = this.id;
        $("#modifyWindow").window({top: 100}).window("open")
        boxForms();
        $('#winform').form("clear");
    });
    $("#boxEdit").click(function () {
        obj.type = this.id;
        var row = $("#bg").datagrid("getSelections");
        if (row.length == 1) {
            $('#modifyWindow').window({top: 100}).window("open");
            boxForms();
            $('#winform').form('load', row[0]);
            obj.modifyId = row[0].id;
        } else if (row.length == 0) {
            $('#dlg').html("请选择需要修改的区域").dialog('open');
            return;
        } else if (row.length > 1) {
            $('#dlg').html("一次只能修改一个区域").dialog('open');
            return;
        }
    });
    $('#winform').off("click", "#savebtn").on("click", "#savebtn", function () {
        if (isValid()) {
            obj.info = $('#winform').serializeObject();
            obj.info.lat = "";
            obj.info.lgt = "";
            var url = "";
            if (obj.type == "boxAdd") {
                url = "/dev/collector/addCollector";
                obj.info.id = "";
            } else if (obj.type == "boxEdit") {
                url = "/dev/collector/updateCollector";
                if (obj.info.status == "启用") {
                    obj.info.status = 1;
                }
                ;
                if (obj.info.status == "禁用") {
                    obj.info.status = 0;
                }
                ;
                obj.info.id = obj.modifyId;
            }
            ;
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#bg").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                }
            });
        } else {
            $('#dlg').html("红色部分数据必须填写").dialog('open');
            return;
        }
    });
    $('#winform').off("click", "#cancel").on("click", "#cancel", function () {
        $('#modifyWindow').window('close');
    });
    $("#res").off("click", "#energyType").on("click", "#energyType", function () {
        energyTypeInfo();
    });
    var energyTypeInfo = function () {
        var html = '<div id="nt" style="padding:5px 5px;text-align: right">' +
            '<span style="font-size: 18px;padding:0 28%;color:#666">能耗用途分类设置</span>' +
            '<a href="javascript:void(0)" class="btn" id="typeAdd" iconCls="icon-add">增加</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="typeEdit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            '</div>' +
            '<table id="EnergyType"></table>';
        $('#pvWindow').html(html).window({top: 200}).window("open").children("#EnergyType").datagrid({
            url: "/biz/dict/query?dictType=energytype",
            method: "GET",
            checkbox: true,
            toolbar: '#nt',
            columns: [[
                {field: 'check', title: '', width: '0', align: "center", checkbox: true},
                {field: 'itemName', title: '用途名称', width: '15%', align: "center"},
                {field: 'sort', title: '统计编号', width: '10%', align: 'center'},
                {field: 'status', title: '状态', width: '10%', align: 'center'},
                {field: 'createTime', title: '创建时间', width: '20%', align: 'center'},
                {field: 'remark', title: '备注', width: '44%', align: 'center'},
            ]],
            singleSelect: true,
            loadFilter: pagerFilter,
            onLoadSuccess: function (data) {
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
        });
        $(".btn").linkbutton();
    };
    var energyTypeForm = function () {
        var html = '<div style="margin-bottom:20px">\n' +
            '            <input class="itemName" name="itemName" style="width:100%" data-options="label:\'用途名称:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="sort" name="sort" style="width:100%" data-options="label:\'序号:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="status" name="status" style="width:100%"   data-options="label:\'状态:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="energySbtn" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="energyCbtn" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        energyTypeFormInit();
    };
    var energyTypeFormInit = function () {
        $(".itemName").textbox();
        $(".btn").linkbutton();
        $(".sort").combobox({
            data: dist["sort"],
            valueField: 'text',
            textField: 'text',
        });
        $(".status").combobox({
            data: dict["enable"],
            valueField: 'id', 
            textField: 'text',
        });
        $(".window-shadow").css({height: "auto"})
    };
    $("#pvWindow").off("click", "#nt a").on("click", "#nt a", function () {
        obj.type = this.id;
        if (obj.type == "typeAdd") {
            $("#modifyWindow").window({top: 200, height: "auto",}).window("open");
            energyTypeForm();
        } else if (obj.type == "typeEdit") {
            var row = $("#EnergyType").datagrid("getSelections");
            if (row.length == 1) {
                $("#modifyWindow").window({top: 200, height: "auto",}).window("open");
                energyTypeForm();
                $('#winform').form('load', row[0]);
                obj.itemValue = row[0].itemValue;
            } else if (row.length == 0) {
                $('#dlg').html("请选择需要修改的区域").dialog('open');
                return;
            } else if (row.length > 1) {
                $('#dlg').html("一次只能修改一个区域").dialog('open');
                return;
            }
        }
    });
    $('#winform').off("click", "#energySbtn").on("click", "#energySbtn", function () {
        if (isValid()) {
            obj.info = null;
            obj.info = $('#winform').serializeObject();
            obj.info.dictType = "energytype";
            var url = "";
            if (obj.type == "typeAdd") {
                url = "/biz/dict/add";
            } else if (obj.type == "typeEdit") {
                url = "/biz/dict/update";
                obj.info.itemValue = obj.itemValue;
                if (obj.info.status == "启用") {
                    obj.info.status = 1;
                }
                ;
                if (obj.info.status == "禁用") {
                    obj.info.status = 0;
                }
                ;
            }
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#EnergyType").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
            });
        }
        ;
    });
    $('#winform').off("click", "#energyCbtn").on("click", "#energyCbtn", function () {
        $('#modifyWindow').window('close');
    });
    //验证表单
    var isValid = function () {
        if ($("#winform").form('validate')) {
            return true;
        } else {
            $('#dlg').html("红色的内容框必须填写").dialog('open');
            return false;
        }
    };
    //采集器表单
    var boxForms = function () {
        var html = '<div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="collectorConNo" style="width:100%" data-options="label:\'采集器IP:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft merchant" name="merchant" style="width:100%" data-options="label:\'客户:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="place" style="width:100%" data-options="label:\'场所:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="longitude" style="width:100%" data-options="label:\'经度:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="latitude" style="width:100%" data-options="label:\'纬度:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="address" style="width:100%" data-options="label:\'地址:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="collectType" name="collectType" style="width:100%" data-options="label:\'采集器类型:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="status" name="status" style="width:100%"   data-options="label:\'状态:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' + 
            '            <input class="ft" name="remark" style="width:100%;height:100px"   data-options="label:\'备注:\',multiline:true"">\n' +
            '            <input class="ft" name="remark" style="width:100%;height:100px"   data-options="label:\'备注:\',multiline:true">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="savebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="cancel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        boxFormsInit();
    };
    //初始化采集器表单
    var boxFormsInit = function () {
        $(".ft").textbox();
        $(".merchant").combotree({
            url: "/merchant/query",
            method: "GET",
            valueField: 'text',
            textField: 'text',
        });
        $(".protocol").combobox({
            data: dict["protocol"],
            valueField: 'value',
            textField: 'text',
        });
        $(".collectType").combobox({
            data: dist["collectType"],
            valueField: 'text',
            textField: 'text',
        });
        $(".status").combobox({
            data: dict["enable"],
            valueField: 'id', 
            textField: 'text',
        });
        $(".easyui-linkbutton").linkbutton();
        $(".window-shadow").css({height: "auto"})
    };
    //电表表单
    var deviceForms = function () {
        var html =
            '        <div style="margin-bottom:10px">\n' +
            '            <input class="ft" name="meterConNo" style="width:100%" data-options="label:\'表编号:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:10px">\n' +
            '            <input class="ft" name="meterName" style="width:100%" data-options="label:\'表名称:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:10px">\n' +
            '            <input  class="meterType" name="meterType" style="width:100%" data-options="label:\'表类型:\',required:true">\n' +
            '        </div>\n' +
            // '        <div class="routeNo" style="margin-bottom:10px;">\n' +
            // '            <input  class="fireRoute" name="fireRoute" style="width:100%" data-options="label:\'所属回路:\'">\n' +
            // '        </div>\n' +
            // '        <div class="loops">' +
            // '<div class="group"  style="margin-bottom:10px;"><span class="groupName">请选择温控回路</span>' +
            // '&nbsp;&nbsp; ' +
            // '<input class="chk" name="w1Route" value="1" labelAlign="right" labelWidth="45px" label="回路1:">' +
            // '&nbsp;&nbsp;<input class="abc w1" name="w1Abc"  labelAlign="right" labelWidth="70px" label="检测线路:">' +
            // '&nbsp;&nbsp;' +
            // ' <input class="chk" name="w2Route" value="2" labelAlign="right" labelWidth="45px" label="回路2:">' +
            // '&nbsp;&nbsp;<input class="abc w2" name="w2Abc" labelAlign="right" labelWidth="70px" label="检测线路:"><br><br>' +
            // '&nbsp;&nbsp;' +
            // ' <input class="chk" name="w3Route" value="3" labelAlign="right" labelWidth="45px" label="回路3:">' +
            // '&nbsp;&nbsp;<input class="abc w3" name="w3Abc" labelAlign="right" labelWidth="70px" label="检测线路:">' +
            // '&nbsp;&nbsp; ' +
            // '<input class="chk" name="w4Route" value="4" labelAlign="right" labelWidth="45px" label="回路4:">' +
            // '&nbsp;&nbsp;<input class="abc w4" name="w4Abc" labelAlign="right" labelWidth="70px" label="检测线路:">' +
            // "</div>" +
            '        </div>\n' +
            '        <div class="loops" style="margin-bottom:10px;">' +
            '<div class="group"><span class="groupName">预警值设置</span>' +
            '&nbsp;&nbsp; <input class="ft" style="width:150px" name="alarmWarm" labelAlign="right" labelWidth="80px" label="温度上限:">' +
            '&nbsp;&nbsp; <input class="ft" style="width:150px" name="alarmLeak" labelAlign="right" labelWidth="80px" label="漏电电流:">' +
            "</div>" +
            '        </div>\n' +
            // '        <div style="margin-bottom:10px">\n' +
            // '            <input class="ft" name="place" style="width:100%"   data-options="label:\'所属区域:\',required:true">\n' +
            // '        </div>\n' +
            '        <div style="margin-bottom:10px">\n' +
            '            <input class="ft" name="remark" style="width:100%;"   data-options="label:\'备注:\',multiline:true"">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="text-align:right">\n' +
            '            <a id="dsavebtn" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="dconcel" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        deviceFormsInit();
    };
    //初始化电表表单
    var deviceFormsInit = function () {
        $(".btn").linkbutton();
        $(".ft").textbox();
        $('.chk').checkbox({});
        $(".abc").combobox({
            data: dict["ABCN"],
            valueField: 'text',
            textField: 'text',
        })
        $(".meterType").combobox({
            data: dict["meter_type"],
            valueField: 'text',
            textField: 'text',
            onSelect: function (item) {
                if (item.text == "TJ_FIRE") {
                    $(".loops").show();
                    $(".routeNo").hide();
                } else if (item.text == "E-F") {
                    $(".routeNo").show();
                    $(".loops").hide();
                }
            }
        });
        $(".meterKind").combobox({
            data: dict["meterkind"],
            valueField: 'value',
            textField: 'text',
        });
        $(".fireRoute").combobox({
            data: dist["route"],
            valueField: 'text',
            textField: 'text',
        });
        $(".status").combobox({
            data: dict["enable"],
 
            valueField: 'value',
            textField: 'text',
        });
        $(".window-shadow").css({height: "auto"});
    };
    $("#res").off("click", "#deviceInfo a").on("click", "#deviceInfo a", function () {
        obj.type = this.id;
        if (obj.type == "add") {
            $("#modifyWindow").window({top: 10}).window("open");
            deviceForms();
        } else if (obj.type == "edit") {
            var row = $("#deviceList").datagrid("getSelections");
            if (row.length == 1) {
                $("#modifyWindow").window({top: 10}).window("open");
                deviceForms();
                $('#winform').form('load', row[0]);
                obj.modifyId = row[0].id;
            } else if (row.length == 0) {
                $('#dlg').html("请选择需要修改的区域").dialog('open');
                return;
            } else if (row.length > 1) {
                $('#dlg').html("一次只能修改一个区域").dialog('open');
                return;
            }
        } else if (obj.type == "delete") {
            var row = $("#deviceList").datagrid("getSelections");
            if (row.length > 0) {
                var html = ""
                html += "<div style='margin:5px;color:red;'>" + row[0].place + "</div>"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnok" data-options="iconCls:\'icon-ok\'" >确定</a>' + "&nbsp;&nbsp;"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnno" data-options="iconCls:\'icon-cancel\'">取消</a>'
                $('#dlg').html("以下设备将被删除:" + "<br>" + html).dialog('open')
                $(".btn").linkbutton();
                $("#btnok").click(function () {
                    $.ajax({
                        url: "/dev/meter/deleteMeter?meterIds=" + row[0].id,
                        type: "POST",
                        contentType: "application/json",
                        success: function (data) {
                            if (data.result == true) {
                                $('#dlg').dialog("close");
                                $("#deviceList").datagrid("reload");
                                $('#modifyWindow').window('close');
                            } else if (data.result == false) {
                                $('#dlg').html(data.msg).dialog('open');
                            }
                        },
                    });
                })
                $("#btnno").click(function () {
                    $('#dlg').dialog('close');
                    return;
                })
            } else {
                $('#dlg').html("请选择需要删除的区域").dialog('open');
                return;
            }
        }
    });
    $('#winform').off("click", "#dsavebtn").on("click", "#dsavebtn", function () {
        if (isValid()) {
            obj.info = null;
            obj.info = $('#winform').serializeObject();
            try {
                obj.info.place = $(".place").combotree("tree").tree("getSelected").fullText;
            } catch (e) {
            }
            obj.info.collectorId = obj.boxId;
            var url = "";
            if (obj.type == "add") {
                url = "/dev/meter/addMeter";
                obj.info.id = "";
            } else if (obj.type == "edit") {
                url = "/dev/meter/updateMeter";
                obj.info.id = obj.modifyId;
            }
            ;
            if (obj.info.status == "启用") {
                obj.info.status = 1
            } else if (obj.info.status == "禁用") {
                obj.info.status = 0
            }
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#deviceList").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
            });
        }
        ;
    });
    $('#winform').off("click", "#dconcel").on("click", "#dconcel", function () {
        $('#modifyWindow').window('close');
    });
    var boxInfo = function (data) {
        var html = '<table id="bg" style="min-height:400px;"></table>';
        html += '<div id="dg"></div>';
        $("#res").append(html);
        $('.btn').linkbutton({});
        $('#bg').datagrid({
            toolbar: '#ft',
            //异步加载数据
            url: "/dev/collector/query?limit=10000&page=1&rows=10000",
            checkbox: true,
            columns: [[
                {field: 'check', title: '', width: "0", align: "center", checkbox: true},
                {field: 'collectorConNo', title: '采集器IP', width: "13%", align: "center"},
                {field: 'id', title: '采集器编号', width: "7%", align: "center"},
                {field: 'orgName', title: '所属机构', width: "14%", align: "center"},
                {field: 'place', title: '场所', width: "11%", align: "center"},
                {field: 'collectType', title: '采集器类型', width: "7%", align: "center"},
                {field: 'status', title: '状态', width: "5%", align: 'center'},
                {field: 'address', title: '地址', width: "10%", align: 'center'},
                {field: 'modifyTime', title: '修改时间', width: "14%", align: 'center'},
                {field: 'createTime', title: '创建时间', width: "14%", align: 'center'},
                {field: 'remark', title: '备注', width: "4.5%", align: 'center'}
            ]],
            onLoadSuccess: function (data) {
                tempData = data.originalRows;
                boxData.length = 0;
                for (var i = 0; i < tempData.length; i++) {
                    boxData[i] = {};
                    boxData[i].collectorConNo = tempData[i].collectorConNo !== undefined ? tempData[i].collectorConNo : "NULL";
                    boxData[i].id = tempData[i].id !== undefined ? tempData[i].id : "NULL";
                    boxData[i].orgName = tempData[i].orgName !== undefined ? tempData[i].orgName : "NULL";
                    boxData[i].place = tempData[i].place !== undefined ? tempData[i].place : "NULL";
                    boxData[i].boxType = tempData[i].boxType !== undefined ? tempData[i].boxType : "NULL";
                    boxData[i].protocol = tempData[i].protocol !== undefined ? tempData[i].protocol : "NULL";
                    boxData[i].boxPort = tempData[i].boxPort !== undefined ? tempData[i].boxPort : "NULL";
                    boxData[i].status = tempData[i].status !== undefined ? tempData[i].status : "NULL";
                    boxData[i].address = tempData[i].address !== undefined ? tempData[i].address : "NULL";
                    boxData[i].modifyDate = tempData[i].modifyTime == undefined ? "NULL" : tempData[i].modifyTime;
                    boxData[i].createDate = tempData[i].createTime == undefined ? "NULL" : tempData[i].createTime;
                    boxData[i].remark = tempData[i].remark == undefined ? "NULL" : tempData[i].remark;
                }
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            loadMsg: "加载中....，请稍后",
            //striped: true,
            sortOrder: "desc",
            pagination: true,
            pagePosition: "bottom",
            pageNumber: 1,
            pageSize: 10,
            singleSelect: true,
            pageList: [10, 20, 40, 80],
            loadFilter: pagerFilter,
            onSelect: function (index, row) {
                var html = '<div id="deviceInfo" style="padding:5px 5px">' +
                    '<span style="font-size: 18px;padding:0 30%;color:#666">表设备信息表</span>' +
                    '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="add" iconCls="icon-add" data-options="size:\'small\'">增加</a>' + "&nbsp;" +
                    '<a href="javascript:void(0)" class="easyui-linkbutton" id="edit" iconCls="icon-edit" data-options="size:\'small\'">修改</a>' + "&nbsp;" +
                    '<a href="javascript:void(0)" class="easyui-linkbutton" id="delete" iconCls="icon-remove" data-options="size:\'small\'" >删除</a>' +
                    '</div>' +
                    '<table id="deviceList" style="min-height:100px;"></table>' +
                    '<a href="javascript:void(0)" id="downLoadBox" style="margin:10px"  class="easyui-linkbutton" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出采集器</a>' + "&nbsp;&nbsp;" +
                    '<a href="javascript:void(0)" id="downLoadDevice" style="margin:10px"  class="easyui-linkbutton" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出设备</a>' + "&nbsp;&nbsp;";
                $("#dg").html(html);
                $('.easyui-linkbutton').linkbutton();
                obj.boxId = row.id;
                $('#deviceList').datagrid({
                    toolbar: '#deviceInfo',
                    //异步加载数据
                    url: "/dev/meter/query?collectorId=" + row.id + "&limit=1000&page=1&rows=1000",
                    checkbox: true,
                    columns: [[
                        {field: 'check', title: '', width: "0", align: "center", checkbox: true},
                        {field: 'meterName', title: '表名称', width: "12%", align: "center"},
                        {field: 'place', title: '所属区域', width: "15%", align: "center"},
                        {field: 'meterConNo', title: '表编号', width: "6%", align: "center"},
                        // {field: 'meterKind', title: '能耗类型', width: "8%", align: "center"},
                        {field: 'fireRoute', title: '所属回路', width: "6%", align: "center"},
                        {field: 'meterType', title: '表类型', width: "6%", align: "center"},
                        {field: 'collectorId', title: '所属采集器', width: "6%", align: "center"},
                        //{field: 'districtid', title: '上一级表', width: "10%", align: "center"},
                        // {field: 'coefficient', title: '倍率', width: "5%", align: "center"},
                        // {field: 'waterConversion', title: '转化率', width: "5%", align: "center"},
                        //{field: 'boxPort', title: '采集端口', width: "5%", align: "center"},
                        //{field: 'levelNum', title: '设备级数', width: "5%", align: "center"},
                        {field: 'modifyTime', title: '修改时间', width: "12%", align: 'center'},
                        {field: 'createTime', title: '创建时间', width: "12%", align: 'center'},
                        {field: 'remark', title: '备注', width: "24%", align: 'center'}
                    ]],
                    onLoadSuccess: function (data) {
                        tempData = data.originalRows;
                        deviceData.length = 0;
                        for (var i = 0; i < tempData.length; i++) {
                            deviceData[i] = {};
                            deviceData[i].place = tempData[i].place !== undefined ? tempData[i].place : "NULL";
                            deviceData[i].meterConNo = tempData[i].meterConNo !== undefined ? tempData[i].meterConNo : "NULL";
                            deviceData[i].meterKind = tempData[i].meterKind !== undefined ? tempData[i].meterKind : "NULL";
                            deviceData[i].meterType = tempData[i].meterType !== undefined ? tempData[i].meterType : "NULL";
                            deviceData[i].collectorId = tempData[i].collectorId !== undefined ? tempData[i].collectorId : "NULL";
                            deviceData[i].coefficient = tempData[i].coefficient !== undefined ? tempData[i].coefficient : "NULL";
                            // deviceData[i].waterConversion = tempData[i].waterConversion !== undefined ? tempData[i].waterConversion : "NULL";
                            deviceData[i].modifyDate = tempData[i].modifyTime == undefined ? "NULL" : tempData[i].modifyTime;
                            deviceData[i].createDate = tempData[i].createTime == undefined ? "NULL" : tempData[i].createTime;
                            deviceData[i].remark = tempData[i].remark == undefined ? "NULL" : tempData[i].remark;
                        }
                        $("#res").off("click", "#downLoadBox").on("click", "#downLoadBox", function () {
                            var title = "采集器信息表";
                            var str = '<th>' +
                                '<caption><h2>' + title + '</h2></caption>' +
                                '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                                '<td>采集器IP</td>' +
                                '<td>采集器编号</td>' +
                                '<td>所属机构</td>' +
                                '<td>场所</td>' +
                                '<td>采集器类型</td>' +
                                '<td>通信协议</td>' +
                                '<td>通信端口</td>' +
                                '<td>状态</td>' +
                                '<td>地址</td>' +
                                '<td>修改时间</td>' +
                                '<td>创建时间</td>' +
                                '<td>备注</td></tr>' +
                                '</th>'
                            exportToexcel(boxData, this.id, str, title);
                        });
                        $("#res").off("click", "#downLoadDevice").on("click", "#downLoadDevice", function () {
                            var title = "设备信息表";
                            var str = '<th>' +
                                '<caption><h2>' + title + '</h2></caption>' +
                                '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                                '<td>所属区域</td>' +
                                '<td>设备编号</td>' +
                                '<td>能耗类型</td>' +
                                '<td>设备类型</td>' +
                                '<td>所属采集器</td>' +
                                '<td>倍率</td>' +
                                '<td>转化量比</td>' +
                                '<td>修改时间</td>' +
                                '<td>创建时间</td>' +
                                '<td>备注</td></tr>' +
                                '</th>';
                            exportToexcel(deviceData, this.id, str, title);
                        });
                    },
                    onLoadError: function () {
                        console.log("数据加载失败！")
                    },
                    loadMsg: "加载中...，请稍后",
                    pagination: true,
                    pagePosition: "bottom",
                    singleSelect: true,
                    pageNumber: 1,
                    pageSize: 10,
                    pageList: [10, 20, 40, 80],
                    loadFilter: pagerFilter,
                });
            }
        });
    };
    boxInfo();
};
//用户管理
var userManager = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    //导出的Excel数据
    var excelData = null;
    //默认向后台传的参数
    var obj = {type: "", info: {}};
    //选择的用户
    var userName = "", userId = "";
    //加载修改按钮
    var modifyButtons = function () {
        $("#res").html(""); 
        var html = '<form id="ff" mothod="post" class="ff">' +
            '<select class="dt" name="loginName" label="登录名称:" labelPosition="left" style="width:200px;"></select>' + '&nbsp;&nbsp;' +
            '<input  class="dt"  name="realName" label="真实姓名:" labelPosition="left" style="width:200px">' + '&nbsp;&nbsp;' +
            '<input  id="status"  name="status" label="账号状态:" labelPosition="left" style="width:200px">' + '&nbsp;&nbsp;' +
            //'<input  id="startTime" class="time"  name="startTime" label="开启时间:" labelPosition="left" style="width:250px">' + '&nbsp;&nbsp;' +
            //'<input  id="endTime"   class="time"  name="endTime" labelPosition="left" style="width:180px">' + '&nbsp;&nbsp;' +
            // '<select id="areaName" class="easyui-combobox" name="areaName" label="区域名称:" labelPosition="left" style="width:300px;"></select>' + '&nbsp;&nbsp;' +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + '&nbsp;' +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            '</form>'
        html += '<div id="ft" style="padding:5px 5px">' +
            '<span style="font-size: 18px;padding:0 35%;color:#666">用户信息表</span>' +
            '<a href="javascript:void(0)" class="easyui-linkbutton" id="uadd" iconCls="icon-add">增加</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton" id="uedit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            //'<a href="javascript:void(0)" class="easyui-linkbutton" id="udelete" iconCls="icon-remove" >删除</a>' +
            '</div>';
        $("#res").html(html);
        $('.easyui-linkbutton').linkbutton();
        $("#status").combobox({
            data: dict["enable"], 
            valueField: 'id', 
            textField: 'text',
        })
        $(".time").datetimebox()
        $('.dt').textbox();
        $("#ff").form("clear");
    }
    modifyButtons();
    //加载用户信息表
    var userInfo = function () {
        var html = '<table id="bg" style="min-height:300px;"></table>';
        html += '<div id="dg"></div>';
        $("#res").append(html);
        $('#bg').datagrid({
            toolbar: '#ft',
            //异步加载数据
            url: "/auth/user/query?limit=1000&page=1&rows=1000",
            checkbox: true,
            columns: [[
                {field: 'check', title: '', width: '0', align: "center", checkbox: true},
                {field: 'id', title: '编号', width: '5%', align: "center"},
                {field: 'loginName', title: '登录名称', width: '10%', align: "center"},
                {field: 'realName', title: '真实姓名', width: '10%', align: "center"},
                {field: 'orgName', title: '机构名称', width: '15%', align: "center"},
                {field: 'mobile', title: '联系电话', width: '10%', align: 'center'},
                {field: 'status', title: '用户状态', width: '8%', align: 'center'},
                {field: 'createTime', title: '创建时间', width: '15%', align: 'center'},
                {field: 'remark', title: '备注', width: '26.5%', align: 'center'},
            ]],
            onLoadSuccess: function (data) {
                excelData = data.originalRows;
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            onSelectPage: function () {
                console.log(1111)
            },
            queryParams: obj,
            pagination: true,
            pagePosition: "bottom",
            rownumbers: true,
            pageNumber: 1,
            pageSize: 8,
            singleSelect: true,
            pageList: [8, 16, 32, 64],
            loadFilter: pagerFilter,
            onSelect: function (index, row) {
                userName = row.loginName;
                userId = row.id;
                var html = '<div id="deviceInfo" style="padding:5px 5px">' +
                    '<span style="font-size: 18px;padding:0 33%;color:#666">用户关联信息表</span>' +
                    '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="tadd" iconCls="icon-add" data-options="size:\'small\'">增加</a>' + "&nbsp;" +
                    '<a href="javascript:void(0)" class="easyui-linkbutton" id="tdelete" iconCls="icon-remove" data-options="size:\'small\'" >删除</a>' +
                    '</div>' +
                    '<table id="deviceList" style="min-height:100px;"></table>'
                // '<a href="javascript:void(0)" id="downLoadExcel" style="margin:10px"  class="easyui-linkbutton" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>' + "&nbsp;&nbsp;";
                $("#dg").html(html);
                $('.easyui-linkbutton').linkbutton();
                $('#deviceList').datagrid({
                    toolbar: '#deviceInfo',
                    //异步加载数据
                    url: "/auth/userOrgDev/query?userId=" + userId + "&page=1&rows=1000",
                    method: "GET",
                    checkbox: true,
                    columns: [[
                        {field: 'check', title: '', width: "0", align: "center", checkbox: true},
                        {field: 'id', title: '序号', width: "8%", align: "center"},
                        {field: 'orgName', title: '区域名称', width: "10%", align: "center"},
                        {field: 'orgId', title: '区域ID', width: "8%", align: "center"},
                        {field: 'metersName', title: '设备名称', width: "50%", align: "center"},
                        {field: 'userId', title: '用户编号', width: "8%", align: 'center'},
                        {field: 'createTime', title: '创建时间', width: "15%", align: 'center'},
                    ]],
                    onLoadSuccess: function (data) {
                        // deviceData = data.originalRows;
                    },
                    onLoadError: function () {
                        console.log("数据加载失败！")
                    },
                    loadMsg: "加载中...，请稍后",
                    queryParams: obj,
                    singleSelect: true,
                    pagination: true,
                    pagePosition: "bottom",
                    pageNumber: 1,
                    pageSize: 10,
                    pageList: [10, 20, 40, 80],
                    loadFilter: pagerFilter,
                });
            }
        });
    };
    userInfo();
    var userForms = function () {
        $("#winform").html("");
        var html = '<div style="margin-bottom:20px">\n' +
            '            <input class="easyui-textbox ft" name="loginName" style="width:100%" data-options="label:\'登录名称:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="easyui-textbox ft" name="realName" style="width:100%" data-options="label:\'真实姓名:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="easyui-textbox ft" name="pwd" style="width:100%" data-options="label:\'用户密码:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input  class="easyui-textbox ft" name="mobile" style="width:100%" data-options="label:\'联系电话:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="status" name="status" style="width:100%"  data-options="label:\'用户状态:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="roles" name="roles" style="width:100%"  data-options="label:\'用户权限:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="readFlag" name="readFlag" style="width:100%"  data-options="label:\'只读用户:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="easyui-textbox" name="remark" style="width:100%;height:100px"   data-options="label:\'备注:\',multiline:true"">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="savebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="cancel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        userFormInit();
    };
    //用户信息表单初始化
    var userFormInit = function () {
        $(".easyui-textbox").textbox();
        $(".status").combobox({
            data: dict["enable"], 
            valueField: "id",
            textField: 'text',
        });
        $(".roles").combobox({
            data: dist["userLevel"],
            valueField: "id",
            textField: 'text',
        });
        $(".readFlag").combobox({
            data: dist["readOnly"],
            valueField: "id",
            textField: 'text',
        });
        $(".easyui-linkbutton").linkbutton();
        $(".window-shadow").css({height: "auto"})
    };
    //封装ajax用户
    var postuserData = function (url, obj) {
        $.ajax({
            url: "/auth/user/addUser",
            data: JSON.stringify(obj),
            type: "POST",
            dataType: "json",
            success: function (data) {
                $('#dlg').html("数据处理成功！").dialog('open');
                if (obj.type == "search") {
                } else if (obj.type == "uadd") {
                    $('#bg').datagrid('appendRow', obj.info);
                    $('#modifyWindow').window('close');
                } else if (obj.type == "uedit") {
                    $('#bg').datagrid('updateRow', {
                        index: $("#bg").datagrid("getRowIndex", $("#bg").datagrid("getSelections")[0]),
                        row: obj.info
                    })
                    $('#modifyWindow').window('close');
                }
            },
            error: function () {
                $('#modifyWindow').window('close');
                $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                return;
            }
        })
    }; 
    //用户查询
    $("#search").click(function () {
        obj.type = this.id;
        obj.info = $("#ff").serialize();
        $('#bg').datagrid({
            url: "/auth/user/query?limit=1000&page=1&rows=1000&" + obj.info,
        }).datagrid("uncheckAll");
    });
    //清空表单
    $("#clear").click(function () {
        $("#ff").form("clear");
    });
    //用户增加 
    $("#uadd").click(function () {
        obj.type = this.id;
        $("#modifyWindow").window({
            top: 200,
            height: "auto",
        }).window("open");
        userForms();
        $('#winform').form("clear");
    });
    //用户修改
    $("#uedit").click(function () {
        obj.type = this.id;
        var row = $("#bg").datagrid("getSelections");
        if (row.length == 1) {
            $('#modifyWindow').window({
                top: 200,
                height: "auto",
            }).window('open');
            userForms()
            $('#winform').form('load', row[0]);
            obj.modifyId = row[0].id;
        } else if (row.length == 0) {
            $('#dlg').html("请选择需要修改的区域").dialog('open');
            return;
        } else if (row.length > 1) {
            $('#dlg').html("一次只能修改一个区域").dialog('open');
            return;
        }
    });
    //验证表单
    var isValid = function () {
        if ($("#winform").form('validate')) {
            return true;
        } else {
            $('#dlg').html("红色的内容框必须填写").dialog('open');
            return false;
        }
    };
    //用户信息发送按钮
    $("#winform").off("click", "#savebtn").on("click", "#savebtn", function () {
        if (isValid()) {
            obj.info = $("#winform").serializeObject();
            obj.info.qq = "";
            obj.info.email = "";
            obj.info.telephone = "";
            var url = "";
            if (obj.info.status == "启用") {
                obj.info.status = 1;
            }
            if (obj.info.status == "禁用") {
                obj.info.status = 0;
            }
            if (obj.info.roles == "超级用户") {
                obj.info.roles = 1
            }
            if (obj.info.roles == "普通用户") {
                obj.info.roles = 2
            }
            if (obj.info.readFlag == "是") {
                obj.info.readFlag = true
            }
            if (obj.info.readFlag == "否") {
                obj.info.readFlag = false
            }
            if (obj.type == "uadd") {
                url = "/auth/user/addUser";
            } else if (obj.type == "uedit") {
                url = "/auth/user/updateUser";
                obj.info.id = obj.modifyId;
            }
            ;
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#bg").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html("登录名称不能重复！").dialog('open');
                    }
                }
            })
        }
    });
    $("#winform").off("click", "#cancel").on("click", "#cancel", function () {
        $('#modifyWindow').window('close');
    });
    //关联信息表单
    var targetUserForms = function () {
        var html = "<h3 style='text-align: center'>关联区域一次只能选择<strong style='color:red'>一个区域,</strong><br>关联表只能选择<strong style='color:red'>同一个区域下</strong>的表，不包含区域！</h3>" +
            '<div style="margin-bottom:20px">\n' +
            '            <input class="orgName" name="orgName" style="width:100%" data-options="label:\'关联对象:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="memo" name="memo" style="width:100%;height:100px"   data-options="label:\'备注:\',multiline:true"">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="tsavebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="tcancel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        targetUserFormInit();
    };
    //关联信息表单初始化
    var targetUserFormInit = function () {
        $(".memo").textbox();
        $(".orgName").combotree({
            url: "/auth/org/tree?sub=y&meter=true&_dc=" + Math.random(),
            method: "GET",
            valueField: 'id',
            textField: 'text',
            multiple: true,
            checkBox: true,
            cascadeCheck: false,
            loadFilter: function (data) {
                collapseTree(data);
                return data;
            },
            onLoadSuccess: function (node, data) {
                $('.orgName').unbind('click');
                $('.orgName').unbind('check');
            },
            onClick: function (node) {
                if (node.children.length !== 0) {
                    var cknodes = $(this).tree("getChecked");
                    for (var i = 0; i < cknodes.length; i++) {
                        if (cknodes[i].children.length !== 0) {
                            $(this).tree("uncheck", cknodes[i].target);
                        }
                    }
                    $(this).tree("check", node.target);
                }
            }
        })
        $(".easyui-linkbutton").linkbutton();
        $(".window-shadow").css({height: "auto"});
    };
    //target信息的增 改 删
    $("#res").on("click", "#deviceInfo a", function () {
        obj.type = this.id;
        var row = $("#deviceList").datagrid("getSelections");
        if (obj.type == "tadd") {
            $("#modifyWindow").window({
                top: 200,
            }).window("open")
            targetUserForms();
        } else if (obj.type == "tdelete") {
            if (row.length == 0) {
                $('#dlg').html("请选择需要修改的区域").dialog('open');
                return;
            } else if (row.length > 1) {
                $('#dlg').html("一次只能修改一个区域").dialog('open');
                return;
            }
            ;
            if (row.length == 1) {
                var html = ""
                html += "<div style='margin:5px;color:red;'>" + row[0].orgName + "</div>"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnok" data-options="iconCls:\'icon-ok\'" >确定</a>' + "&nbsp;&nbsp;"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnno" data-options="iconCls:\'icon-cancel\'">取消</a>'
                $('#dlg').html("以下设备将被删除:" + "<br>" + html).dialog('open')
                $(".btn").linkbutton();
                $("#btnok").click(function () {
                    $.ajax({
                        url: "/auth/userOrgDev/delete?userOrgDevId=" + row[0].id,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        success: function (data) {
                            if (data.result == true) {
                                $("#deviceList").datagrid("reload");
                                $('#dlg').html("删除成功！");
                            }
                        },
                        error: function () {
                            $('#modifyWindow').window('close');
                            $('#dlg').html("删除失败，请联系系统管理员！").dialog('open');
                            return;
                        }
                    })
                });
                $("#btnno").click(function () {
                    $('#dlg').dialog('close');
                    return;
                })
            }
            ;
        }
    });
    $("#winform").off("click", "#tsavebtn").on("click", "#tsavebtn", function () {
        if (isValid()) {
            var target = $(".orgName").combotree("tree").tree("getChecked");
            obj.info = {};
            obj.info.userId = userId;
            obj.info.meterIds = [];
            obj.info.orgId = target[0].pid;
            for (var i = 0; i < target.length; i++) {
                if (target[i].meter == false) {
                    if (target.length == 1) {
                        obj.info.orgId = target[i].id;
                        obj.info.userId = userId;
                        obj.info.fullFlag = true;
                    } else {
                        $('#dlg').html("说好了只能选择一个区域的！").dialog('open');
                        return;
                    }
                } else if (target[i].meter == true) {
                    if (obj.info.orgId == target[i].pid) {
                        obj.info.meterIds.push(target[i].meterId);
                        obj.info.fullFlag = false;
                    } else {
                        $('#dlg').html("说好了只能选择一个区域下的同级表的！").dialog('open');
                        return;
                    }
                }
            }
            ;
            if (obj.info.meterIds.length == 0) {
                delete obj.info["meterIds"];
            }
            ;
            $.ajax({
                url: "/auth/userOrgDev/save",
                data: JSON.stringify(obj.info),
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#deviceList").datagrid("reload");
                        $('#modifyWindow').window('close');
                    }
                },
                error: function () {
                    $('#modifyWindow').window('close');
                    $('#dlg').html("数据处理失败，请联系系统管理员！").dialog('open');
                    return;
                }
            })
        }
        ;
    });
    $("#winform").off("click", "#tcancel").on("click", "#tcancel", function () {
        $('#modifyWindow').window('close');
    });
};
//商户管理
var clientManager = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    //导出excel数据
    var excelData = null;
    //默认向后台传的参数
    var obj = {type:"default", info: {}};
    //加载修改按钮
    var modifyButtons = function () {
    	$("#res").html("");
    	var html = '<form id="ff" method="post" class="ff">' +
    	'<input class="dt" name="abbrName" label="简称:" labelPosition="left" style="width:200px;">' + '&nbsp;&nbsp;' +
    	'<input  class="dt"  name="addr" label="地址:" labelPosition="left" style="width:200px">' + '&nbsp;&nbsp;' +
    	'<input  class="dt" name="contact" label="联系人:" labelPosition="left" style="width:200px">' + '&nbsp;&nbsp;' +
    	'<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + '&nbsp;' +
    	'<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
    	'</form>';
    	html += '<div id="ft" style="padding:5px 5px">' +
    	'<span style="font-size: 18px;padding:0 35%;color:#666">商户信息表</span>' +
    	'<a href="javascript:void(0)" class="easyui-linkbutton" id="uadd" iconCls="icon-add">增加</a>' + "&nbsp;" +
    	'<a href="javascript:void(0)" class="easyui-linkbutton" id="uedit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
    	'</div>';
    	$("#res").html(html);
    	$('.easyui-linkbutton').linkbutton();
        $(".time").datetimebox();
        $('.dt').textbox();
        $("#ff").form("clear");
    }
    modifyButtons();
    //加载商户信息表
    var clientInfo = function () {
    	var html = '<table id="bg" style="min-height:300px;"></table>';
        html += '<a href="javascript:void(0)" id="downLoadExcel" style="margin:20px"  class="easyui-linkbutton btn" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>' + "&nbsp;&nbsp;";
    	$("#res").append(html);
    	$('.btn').linkbutton({});
    	$("#bg").datagrid({
    		toolbar: '#ft',
    		//异步加载数据
    		url: "/merchant/query",
    		checkbox: true,
    		columns: [[
    		   {field: 'check', title: '', width: '0%', align: 'center', checkbox: true},
    		   {field: 'abbrName', title: '简称', width: '10%', align: 'center'},
    		   {field: 'addr', title:'地址', width:'10%', align: 'center'},
    		   {field: 'contact', title: '联系人', width: '10%', align: 'center'},
    		   {field: 'createrName', title: '创建人', width: '10%', align: 'center'},
    		   {field: 'fullName', title: '全称', width: '10%', align: 'center'},
    		   {field: 'mobile', title: '手机号', width: '10%', align: 'center'},
    		   {field: 'modifierName', title: '修改人', width: '10%', align: 'center'},
    		   {field: 'orgCode', title: '区域编码', width: '10%', align: 'center'},
               {field: 'orgId', title: '区域ID', width: '10%', align: 'center'},
               {field: 'status', title: '状态', width: '10%', align: 'center'},
    		]],
    		onLoadSuccess: function (data) {
    			var tempData = data.originalRows;
    			excelData = [];
    			for (var i = 0; i < tempData.length; i++) {
    				excelData[i] = {};
    				excelData[i].abbrName = tempData[i].abbrName;
    				excelData[i].addr = tempData[i].addr;
    				excelData[i].contact = tempData[i].contact;
    				excelData[i].createrName = tempData[i].createrName;
    				excelData[i].mobile = tempData[i].mobile;
    				excelData[i].modifierName = tempData[i].modifierName == undefined ? "NULL" : tempData[i].modifierName;
    				excelData[i].orgCode = tempData[i].orgCode;
                    excelData[i].orgId = tempData[i].orgId;
                    excelData[i].status = tempData[i].status;
    			}
    			//导出数据
    			$("#downLoadExcel").click(function () {
    				var title = "商户信息表";
    				var str = '<th>' +
    				'<caption><h2>' + title + '</h2></caption>' +
    				'<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
    				'<td>简称</td>' +
    				'<td>地址</td>' +
    				'<td>联系人</td>' +
    				'<td>创建人</td>' +
    				'<td>全称</td>' +
    				'<td>手机号</td>' +
    				'<td>修改人</td>' +
    				'<td>区域编码</td>' +
                    '<td>区域ID</td>' +
                    '<td>状态</td></tr>' +
    				'</th>'
    				exportToexcel(excelData,"downLoadExcel",str,title);
    			});
    		},
    		onLoadError: function () {
    			$("#dlg").html("数据加载失败！").dialog("open");
    		},
    		onSelectPage: function () {
    			console.log(1111)
            },
            queryParams: obj,
    		pagination: true,
    		pagePosition: "bottom",
    		rownumbers: true,
    		pageNumber: 1,
    		pageSize: 8,
    		singleSelect: true,
    		pageList: [8, 16, 32, 64],
    		loadFilter: pagerFilter,
    		onSelect: function () {}
    	});
    };
    clientInfo();
    
	//创建商户表单
	var clientForms = function () {
		$("#winform").html("");
		var html = '<div style="margin-bottom:20px">\n' +
		'<input class="easyui-textbox ft" name="abbrName" style="width:100%" data-options="label:\'简称:\',required:true">\n' +
		'</div>\n' +
		'<div style="margin-bottom:20px">\n' +
		'<input class="easyui-textbox ft" name="addr" style="width:100%" data-options="label:\'地址:\',required:true">\n' +
		'</div>\n' +
		'<div style="margin-bottom:20px">\n' +
		'<input class="easyui-textbox ft" name="contact" style="width:100%" data-options="label:\'联系人:\',required:true">\n' +
		'</div>\n' +
		'<div style="margin-bottom:20px">\n' +
		'<input class="easyui-textbox ft" name="fullName" style="width:100%" data-options="label:\'全称:\',required:true">\n' +
		'</div>\n' +
		'<div style="margin-bottom:20px">\n' +
		'<input class="easyui-textbox ft" name="mobile" style="width:100%" data-options="label:\'手机号:\',required:true">\n' +
		'</div>\n' +
		'<div style="margin-bottom:20px">\n' +
		'<input class="easyui-textbox ft" name="orgId" style="width:100%" data-options="label:\'区域ID:\',required:true">\n' +
		'</div>\n' +
		'<div style="margin-bottom:20px">\n' +
		'<input class="status" name="status" style="width:100%" data-options="label:\'状态:\',required:true">\n' +
		'</div>\n' +
		'<div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
		'<a id="tsavebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
		'<a id="tcancel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
		'</div>'
		$("#winform").html(html);
		clientFormsInit();
	}
	//商户信息表单初始化
	var clientFormsInit = function () {
		$(".easyui-textbox").textbox();
		$(".status").combobox({
			data: dict["enable"],
			valueField: 'id',
			textField: 'text',
		});
		$(".easyui-linkbutton").linkbutton();
		$(".window-shadow").css({height: "auto"})
	};
	//商户查询
	$("#search").click(function () {
		//判断是否输入查询信息，待开发
		var searchInfo = $("#ff").serialize().split("&");
		searchInfo.map(function (infor) {
			var searchInfo = infor.split("=");
		})
		//开始搜索
		obj.type = this.id;
		obj.info = $("#ff").serialize();
		$("#bg").datagrid({
			url: "/merchant/query" + obj.info,
		}).datagrid("uncheckAll");
	});
	//清空表单
	$("#clear").click(function () {
		$("#ff").form("clear")
	});
	//商户增加
	$("#uadd").click(function () {
		obj.type = this.id;
		$("#modifyWindow").window({
			top:200,
			height:"auto",
		}).window("open");
		clientForms();
		$('#winform').form("clear");
	});
	//商户修改
	$("#uedit").click(function () {
		obj.type = this.id;
        var row = $("#bg").datagrid("getSelections");
		if (row.length == 1) {
			$("#modifyWindow").window({
				top: 200,
				height: "auto",
			}).window("open");
			clientForms();
			$('#winform').form('load', row[0]);
            obj.abbrName = row[0].abbrName;
            obj.addr = row[0].addr == undefined ? "NULL" : row[0].addr;
            obj.contact = row[0].contact;
            obj.fullName = row[0].fullName;
            obj.mobile = row[0].mobile;
            obj.orgId = row[0].orgId;
            obj.status = row[0].status == undefined ? "启用" : row[0].status;
		} else if (row.length == 0) {
			$('#dlg').html('请选择需要修改的区域').dialog('open');
			return;
		} else if (row.length > 1) {
			$("#dlg").html("一次只能修改一个区域").dialog("open");
			return;
		}
	});
	//验证表单
	var isValid = function () {
		if ($("#winform").form("validate")) {
			return true;
		} else {
			$("#dlg").html("红色的内容必须填写").dialog("open");
			return false;
		}
	};
	//商户信息保存按钮
	$("#winform").off("click","#tsavebtn").on("click","#tsavebtn",function () {
        var isValid = $("#winform").form("validate");
		if (isValid) {
			obj.info = $('#winform').serializeObject();
			var url = "";
			if (obj.type == "uadd") {
                url = "/merchant/add" ;
                obj.info.id = "";
			} else if (obj.type == "uedit") {
                url = "/merchant/update";
				obj.info.abbrName = obj.abbrName;
				obj.info.contact = obj.contact;
				obj.info.fullName = obj.fullName;
                obj.info.mobile = obj.mobile;
                obj.info.orgId = obj.orgId;
                obj.info.fullName = obj.fullName;
                obj.info.status = obj.status;
                // 启用和禁用无法实现有待解决
				if (obj.info.status = "启用") {
					obj.info.status = 1;
				}
				if (obj.info.status == "禁用") {
					obj.info.status = 0;
				}
			};
			//发送保存的数据
			$.ajax({
				url: url,
				type: "POST",
				data: JSON.stringify(obj.info),
				contentType: "application/json",
				success: function (data) {
					if (data.result == true) {
						$("#dg").datagrid("reload");
						$("#modifyWindow").window("close");
					} else if (data.result == false) {
						$("#dlg").html("无法发送！请联系管理员。" +"<br>"+"报错："+ data.msg).dialog("open");
					}
				},
			});
		} else {
			$("#dlg").html("红色部分数据必须填写").dialog("open");
			return;
		}
	})
	//取消
	$("#winform").off("click","#tcancel").on("click","#tcancel", function () {
		$("#modifyWindow").window("close");
	})
};
//关于系统
var aboutSystem = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    treeNavRight();
    var html = "<div style='padding:20px'>" +
        "<h3></h3>" +
        "<a class='btn downLoad' href='/page/js/document/UserManul.docx'>下载说明书</a>" +
        "</div>"
    $("#res").html(html);
    $(".btn").linkbutton();
};

//选择导航按钮加载不同的数据；
$('.content').accordion({
    onSelect: function (data, index) {
        if (data == "能耗概览") {
            homePage();
        } else if (data == "项目概况") {
            projectinfo();
        } else if (data == "地图导航") {
            navmap();
        } else if (data == "实时数据") {
            realdata();
        } else if (data == "能耗统计") {
            statisticaldata();
        } else if (data == "使用记录") {
            elecRecording();
        } else if (data == "尖峰谷平") {
            peakValley();
        } else if (data == "预警信息") {
            alarmReport();
        } else if (data == "预警记录") {
            alarmRecord()
        } else if (data == "区域管理") {
            areaManager();
        } else if (data == "设备管理") {
            deviceManager();
        } else if (data == "用户管理") {
            userManager()
        } else if (data == "商户管理") {
            clientManager();
        } else if (data == "关于系统") {
            aboutSystem();
        }  
}
});
$("*").click(function () {
    if (localStorage.username) {
        return;
    } else {
        location.href = "login.html";
    }
});
$.ajaxSetup({
    complete: function (XMLHttpRequest, textStatus) {
        if (textStatus == "error") {
            var sessionStatus = XMLHttpRequest.getResponseHeader("SessionStatus");
            if (sessionStatus == "not_login") {
                $.ajax({
                    type: "GET",
                    url: "/login/ajaxLogout",
                    contentType: "application/json",
                    success: function () {
                        localStorage.removeItem("username");
                        localStorage.removeItem("password");
                        location.href = "login.html";
                    }
                })
            }
        }
    }
});
$("#quit").click(function (e) {
    var html = '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="qconfirm" data-options="iconCls:\'icon-ok\'">确定</a>' + "&nbsp;" +
        '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="qcancel" data-options="iconCls:\'icon-clear\'">取消</a>'
    $("#dlg").html("确定退出当前登录的系统账号吗?" + "<br><br><br><br><br><br>" + html).dialog("open")
    $(".btn").linkbutton();
    $("#qconfirm").click(function (e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: "/login/ajaxLogout",
            contentType: "application/json",
            success: function () {
                localStorage.removeItem("username");
                localStorage.removeItem("password");
                location.href = "login.html";
            }
        })
    })
    $("#qcancel").click(function () {
        $("#dlg").dialog("close");
    });
});



// 请求数据测试
(function () { 
    $.ajax({
        url: "/merchant/query?limit=1000&page=1&rows=1000",
        type: "GET",
        contentType: "application/json",
        success: function (data) {
            console.log(data)
        }
    })
 })();



