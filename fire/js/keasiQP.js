//关闭默认的对话框
var userName=""
$(document).ready(function () {
    $("#dlg").dialog("close");
    $("#modifyWindow").window("center").window("close");
    $("#pvWindow").window("center").window("close");
    $.ajax({
        type: "GET",
        url: "/logo/info",
        contentType: "application/json",
        success: function (data) {
            userName=data.tenantName;
            $(".welcome").html("欢迎来到" + data.tenantName + ":" + data.loginName);
            $(".custom-title").html(data.tenantName);
        }
    });
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
                    5: "能耗统计",
                    6: "使用记录",
                    7: "尖峰谷平",
                    8: "设备预警",
                    9: "区域管理",
                    10: "设备管理",
                    11: "用户管理",
                };
                $('#nav').accordion('add', {
                    title: "能耗概览",
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
                                    selected: true,
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
                }
                ;
            }
        }
    })
});
var timer = setInterval(function () {
}, 600000);
//拉出菜单
var treeNavLeft = function (getData, obj) {
    $(".treeMenu").show().animate({left: 150});
    $(".res-bg").animate({left: 200});
    $(".treeMenu").tree({
        url: "/auth/org/tree?meterKind=E&sub=y&meter=true&_dc=" + Math.random(),
        method: "GET",
        animate: true,
        line: false,
        field: "name",
        loadFilter: function (data) {
            collapseTree(data)
            return data;
        },
        onLoadSuccess: function (node, data) {
            obj.name = data[0].children[0].text;
            if (data[0].children[0].meter == false) {
                obj.orgId = data[0].children[0].id;
            } else {
                obj.meterId = data[0].children[0].meterId;
            }
            getData("/wp/query/execute/query_result?meterKind=E", obj);
        },
        onClick: function (node) {
            obj.name = node.text;
            if (node.meter == false) {
                obj.orgId = node.id;
                obj.meterId = "";
            } else if (node.meter == true) {
                obj.meterId = node.meterId;
                obj.orgId = "";
            }
            ;
            getData("/wp/query/execute/query_result?meterKind=E", obj);
        }
    })
};
//收缩菜单
var treeNavRight = function () {
    $(".treeMenu").animate({left: "-50px"});
    $(".res-bg").animate({left: 0});
};
//首页大屏
var homePage = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    treeNavRight();
    $("#res").html("").css({border: "none"});
    var html = "<h1 class='title'>"+userName+"监控平台</h1>";
    html += "<ul class='main'>" +
        "<li class='MainLeft'>" +
            "<div class='totalCount shadow'>" +
                "<div class='smallTitle'>设备接入数量</div>" +
                "<div class='countList' id='countChart'></div>" +
            "</div>" +
            "<ul class='energy shadow'>" +
                "<li class='smallTitle'>用电统计</li>" +
                "<li class='now'>" +
                    "<h6>Kw.h</h6>" +
                    "<h5>今日用电</h5>" +
                "</li>" +
                "<li class='last'>" +
                    "<h6>Kw.h</h6>" +
                    "<h5>昨日用电</h5>" +
                "</li>" +
                "<li class='percentup'>" +
                    "<h6>10%</h6>" +
                    "<h5>环比&nbsp;<span class='up'></span></h5>" +
                "</li>" +
                "<li class='now'>" +
                    "<h6>Kw.h</h6>" +
                    "<h5>本月用电</h5>" +
                "</li>" +
                "<li class='last'>" +
                    "<h6>Kw.h</h6>" +
                    "<h5>上月用电</h5>" +
                "</li>" +
                "<li class='percentup'>" +
                    "<h6>10%</h6>" +
                    "<h5>环比&nbsp;<span class='up'></span></h5>" +
                "</li>" +
                "<li class='now'>" +
                    "<h6>Kw.h</h6>" +
                    "<h5>今年用电</h5>" +
                "</li>" +
                "<li class='last'>" +
                    "<h6>Kw.h</h6>" +
                    "<h5>去年用电</h5>" +
                "</li>" +
                "<li class='percentdown'>" +
                    "<h6>10%</h6>" +
                    "<h5>环比&nbsp;<span class='down'></span></h5>" +
                "</li>" +
            "</ul>" +
            "<div id='energyChart' class='shadow'></div>" +
        "</li>" +
        "<li class='MainMiddle shadow' id='mapChart'></li>" +
        "<li class='MainRight'>" +
            "<div class='shadow'>" +
                "<div class='text-center'>预警信息</div>"+
                "<ul class='msgList'>" +
                    "<li>alarm1</li>"+
                    "<li>alarm1</li>"+
                    "<li>alarm1</li>"+
                    "<li>alarm1</li>"+
                    "<li>alarm1</li>"+
                    "<li>alarm1</li>"+
                    "<li>alarm1</li>"+
                "</ul>" +
            "</div>" +
            "<div class='shadow typeEnerge'>" +
                 "<div id='typeChart'></div>"+
            "</div>"+
        "</li>" +
        "</ul>";
    $("#res").html(html);
    var charts = function () {
        var dom = document.getElementById("countChart");
        var countChart = echarts.init(dom);
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {c} ({d}%)"
            },
            color: ["#F76A40", "#29AAFF", "#ffff"],
            legend: {
                orient: 'vertical',
                x: 'left',
                data: ['电表', '水表', '气表']
            },
            series: [
                {
                    type: 'pie',
                    radius: ['30%', '70%'],
                    center: ['50%', '45%'],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '16',
                                fontWeight: 'bold',
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: true
                        }
                    },
                    data: [
                        {value: 100, name: '电表'},
                        {value: 20, name: '水表'},
                        {value: 5, name: '气表'}
                    ]
                }
            ]
        };
        countChart.setOption(option);
        var elecChart = echarts.init(document.getElementById('energyChart'));
        var elecoption = {
            // toolbox: {
            //     show: true,
            //     x: "85%",
            //     feature: {
            //         magicType: {show: true, type: ['line', 'bar']},
            //         saveAsImage: {show: true}
            //     }
            // },
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: ["水", "电", "气"],
                x: "60%",
                textStyle: {
                    fontSize: 14
                }
            },
            title: {
                text: '最近一月水电气用量走势图',
                x: "20%",
                textStyle: {
                    color: '#003467',
                    fontSize: "16",
                    fontWeight: "normal"
                }
            },
            xAxis: {
                axisTick: {
                    show: false,
                },
                type: 'category',
                boundaryGap: false,
                data: ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00",]
            },
            yAxis: {
                name: "                 单位:KW.H  M³ M³",
                type: 'value',
                axisTick: {
                    show: false,
                },
            },
            series: [
                {
                    name: '电',
                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                    type: 'line',
                    symbolSize: 10,
                    smooth: true,
                    color: "#F08600",
                    lineStyle: {
                        width: 3,
                    }
                },
                {
                    name: '水',
                    data: [800, 952, 911, 854, 1270, 1430, 1310],
                    type: 'line',
                    symbolSize: 10,
                    smooth: true,
                    color: "#2483FF",
                    lineStyle: {
                        width: 3,
                    }
                },
                {
                    name: '气',
                    data: [550, 562, 741, 554, 870, 230, 810],
                    type: 'line',
                    symbolSize: 10,
                    smooth: true,
                    color: "#FFFFFF",
                    lineStyle: {
                        width: 3,
                    }
                }
            ]
        };
        elecChart.setOption(elecoption);
        var mapChart = echarts.init(document.getElementById('mapChart'));
        var mapData = [
            {'latitude':24.5080777697, 'longitude':109.4743093819 , 'name':'青浦', 'value':32358260, 'color':'#0394d9'},
            {'latitude':36.4683698180, 'longitude':115.3094042452 , 'name':'松江', 'value':32358260, 'color':'#d94d02'},
            {'latitude':25.3051048188, 'longitude':109.3974095441 , 'name':'浦东', 'value':32358260, 'color':'#b42fd5'},
            {'latitude':22.9996102015, 'longitude':108.4031798089 , 'name':'嘉定', 'value':32358260, 'color':'#0394d9'},
            {'latitude':29.9996102015, 'longitude':107.4031798089 , 'name':'嘉定', 'value':32358260, 'color':'#0394d9'},
            {'latitude':42.9996102015, 'longitude':121.4031798089 , 'name':'嘉定', 'value':32358260, 'color':'#0394d9'},
            {'latitude':12.9996102015, 'longitude':155.4031798089 , 'name':'嘉定', 'value':32358260, 'color':'#0394d9'},
            {'latitude':52.9996102015, 'longitude':168.4031798089 , 'name':'嘉定', 'value':32358260, 'color':'#0394d9'},
            {'latitude':77.9996102015, 'longitude':88.4031798089 , 'name':'嘉定', 'value':32358260, 'color':'#0394d9'},
            {'latitude':145.9996102015, 'longitude':111.4031798089 , 'name':'嘉定', 'value':32358260, 'color':'#0394d9'},
        ];
        option = {
            tooltip: {
                trigger: 'item'
            },
            title: {
                text: '能耗监控区域地理分布',
                x: "center",
                textStyle: {
                    color: '#003467',
                    fontSize: "18",
                    fontWeight: "normal"
                }
            },
            geo: {
                map: 'china',
                label: {
                    emphasis: {
                        show: true,
                        color: "green",
                    }
                },
                roam: true,
                itemStyle: {
                    normal: {
                        borderColor: '#2C7DE2',
                        borderWidth: 1,
                        areaColor: {
                            type: 'radial',
                            x: 0.5,
                            y: 0.5,
                            r: 1,
                            colorStops: [{
                                offset: 0,
                                color: '#EDEDED'
                            }, {
                                offset: 1,
                                color: '#3382EB'
                            }],
                            globalCoord: false
                        },
                        shadowColor: '#B4B4B4',
                        shadowOffsetX: -2,
                        shadowOffsetY: 2,
                        shadowBlur: 10
                    },
                    emphasis: {
                        areaColor: '#A5FF50',
                        borderWidth: 0
                    }
                }
            },
            series: [{
                type: 'effectScatter',
                coordinateSystem: 'geo',
                rippleEffect: {
                    brushType: 'stroke'
                },
                symbolSize: function (val,params) {
                    return 8;
                },
                data: mapData.map(function (itemOpt) {
                    return {
                        name: itemOpt.name,
                        value: [
                            itemOpt.longitude,
                            itemOpt.latitude,
                            itemOpt.value
                        ],

                        label: {
                            emphasis: {
                                position: 'right',
                                show:false,
                            }
                        },
                        itemStyle: {
                            normal: {
                                color:"#C92C00"
                            }
                        }
                    };
                }),

            }]
        };
        mapChart.setOption(option);
        var typeDom = document.getElementById("typeChart");
        var typeChart = echarts.init(typeDom);
         option = {
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: ["电","水","气"],
                x: "65%",
                textStyle: {
                    fontSize: 14
                }
            },
            title: {
                text: '分类能耗统计图',
                x: "center",
                textStyle: {
                    color: '#003467',
                    fontSize: "16",
                    fontWeight: "normal"
                }
            },
            xAxis: {
                axisTick: {
                    show: false,
                },
                type: 'category',
                boundaryGap: true,
                data: ["照明","空调","动力","消防","热水"]
            },
            yAxis: {
                name: "                 单位:KW.H  M³ M³",
                type: 'value',
                axisTick: {
                    show: false,
                },
            },
            series: [
                {
                    name: '电',
                    data: [820, 932, 901, 934,657],
                    type: 'bar',
                    symbolSize: 10,
                    color: "#FF7446",
                },
                {
                    name: '水',
                    data: [0, 932, 901, 934,657],
                    type: 'bar',
                    symbolSize: 10,
                    color: "#29AAFF",
                },
                {
                    name: '气',
                    data: [0, 0, 120, 514,900],
                    type: 'bar',
                    symbolSize: 10,
                    color: "#FFFFFF",
                },
            ]
        };
        typeChart.setOption(option);
        window.onresize = function () {
            countChart.resize();
            elecChart.resize();
            mapChart.resize();
            typeChart.resize();
        }
    };
    charts();

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
                var myIcon = new BMap.Icon("/page/img/green.png", new BMap.Size(22, 33), {});
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
    var obj = {meterId: "", queryId: 24, startDate: getZeroTime(), endDate: getFormatDate(new Date())};
    var type = {title: "用电量", meterKind: "E"};
    //上方的搜索条件表
    var searchOrder = function () {
        var html =
            '<form id="ff" mothod="post" class="ff" style="padding-right:200px">' +
            '<input id="meterKind" value="E" name="meterKind" label="选择能耗类型:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<input id="startTime"  class="easyui-datetimebox inputbox dt" label="开始时间:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<input id="endTime" class="easyui-datetimebox inputbox  dt" label="结束时间:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            "</form>" +
            "<div class='charts' id='myChart' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='current' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='voltage' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='power' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='totalusepower' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div class='charts' id='totaluselesspower' style='width:100%;padding:10px;padding-right:220px'></div>" +
            "<div style='padding-left:10px;'>" +
            '<a href="javascript:void(0)" id="downLoadExcel"  class="btn" data-options="iconCls:\'icon-large-smartart\',size:\'small\',iconAlign:\'top\'">电量导出</a>' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" id="downLoadElec"  class="btn" data-options="iconCls:\'icon-large-smartart\',size:\'small\',iconAlign:\'top\'">监控导出</a>' + "&nbsp;&nbsp;" +
            "<span id='quantity' class='dage'></span>&nbsp;&nbsp;<span id='openTime' class='dage'></span>" +
            "</div>";
        $("#res").html(html);
        $("#meterKind").combobox({
            data: dist["meterkind"],
            valueField: 'value',
            textField: 'text',
            onSelect: function (record) {
                type.meterKind = record.value;
                if (record.value == "E") {
                    type.title = "用电量";
                    type.unit = "KW.H";
                } else if (record.value == "W") {
                    type.title = "用水量";
                    type.unit = "M³";
                } else if (record.value == "G") {
                    type.title = "用气量";
                    type.unit = "M³";
                } else if (record.value == "F") {
                    type.title = "流量";
                    type.unit = "M³/h";
                } else if (record.value == "T") {
                    type.title = "温度表";
                    type.unit = "℃";
                }
                $(".treeMenu").tree({
                    url: "/auth/org/tree?sub=y&meter=true&meterKind=" + record.value + "&_dc=" + Math.random(),
                    method: "GET",
                    animate: true,
                    line: false,
                    field: "name",
                    loadFilter: function (data) {
                        collapseTree(data)
                        return data;
                    },
                    onLoadSuccess: function (node, data) {
                        obj.name = data[0].children[0].text;
                        if (data[0].children[0].meter == false) {
                            obj.orgId = data[0].children[0].id;
                        } else {
                            obj.meterId = data[0].children[0].meterId;
                        }
                        getData("/wp/query/execute/query_result?meterKind=" + record.value, obj);
                    },
                    onClick: function (node) {
                        obj.name = node.text;
                        if (node.meter == false) {
                            obj.orgId = node.id;
                            obj.meterId = "";
                        } else if (node.meter == true) {
                            obj.meterId = node.meterId;
                            obj.orgId = "";
                        }
                        ;
                        getData("/wp/query/execute/query_result?meterKind=" + record.value, obj);
                    }
                })
            }
        })
        $('.dt').datetimebox({});
        $('.btn').linkbutton({});
        $("#ff").on("click", "a", function () {
            if (this.id == "search") {
                if (validateTime(obj)) {
                    getData("/wp/query/execute/query_result?meterKind=" + type.meterKind, obj);
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
            $(".charts").show().css("height", "250px");
            $("#downLoadElec").show();
            $.ajax({
                url: "/wp/hisread/query?meterId=" + data.meterId + "&startDate=" + data.startDate + "&endDate=" + data.endDate + "&start=0&limit=1000000",
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.result == true) {
                        if (data.rows == "") {
                            $(".charts").hide().eq(0).show();
                            $('#dlg').html("该表这段时间内通信中断！没有监控数据记录！").dialog('open');
                            $("#downLoadElec").hide();
                        } else {
                            if (type.meterKind == "E") {
                                $('#dlg').dialog('close');
                                $(".charts").show();
                                var elec = getElecData(data.rows);
                                currentCharts(elec);
                                voltageCharts(elec);
                                powerCharts(elec);
                                totalusepowerCharts(elec);
                                totaluselesspowerCharts(elec);
                                $("#downLoadElec").click(function () {
                                    var title = obj.name + "电力监控数据信息表";
                                    var str = '<th>' +
                                        '<caption><h2>' + title + '</h2>' +
                                        '<span>时间范围：' + obj.startDate + "～" + obj.endDate + '' +
                                        '</span></caption>' +
                                        '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                                        '<td>A相电流</td>' +
                                        '<td>B相电流</td>' +
                                        '<td>C相电流</td>' +
                                        '<td>A相电压</td>' +
                                        '<td>B相电压</td>' +
                                        '<td>C相电压</td>' +
                                        '<td>A相有功功率</td>' +
                                        '<td>B相有功功率</td>' +
                                        '<td>C相有功功率</td>' +
                                        '<td>总有功功率</td>' +
                                        '<td>A相无功功率</td>' +
                                        '<td>B相无功功率</td>' +
                                        '<td>C相无功功率</td>' +
                                        '<td>总无功功率</td>' +
                                        '<td>A相功率</td>' +
                                        '<td>B相功率</td>' +
                                        '<td>C相功率</td>' +
                                        '<td>总功率</td>' +
                                        '<td>反向电量</td>' +
                                        '<td>功率因数</td>' +
                                        '<td>读表时间</td>' +
                                        '</th>';
                                    var elecData = [];
                                    var o = data.rows;
                                    for (var i = o.length - 1; i >= 0; i--) {
                                        elecData[i] = {};
                                        elecData[i].acurrent = o[i].acurrent;
                                        elecData[i].bcurrent = o[i].bcurrent;
                                        elecData[i].ccurrent = o[i].ccurrent;
                                        elecData[i].avoltage = o[i].avoltage;
                                        elecData[i].bvoltage = o[i].bvoltage;
                                        elecData[i].cvoltage = o[i].cvoltage;
                                        elecData[i].atotalusepower = o[i].atotalusepower;
                                        elecData[i].btotalusepower = o[i].btotalusepower;
                                        elecData[i].ctotalusepower = o[i].ctotalusepower;
                                        elecData[i].totalusepower = o[i].totalusepower;
                                        elecData[i].atotaluselesspower = o[i].atotaluselesspower;
                                        elecData[i].btotaluselesspower = o[i].btotaluselesspower;
                                        elecData[i].ctotaluselesspower = o[i].ctotaluselesspower;
                                        elecData[i].totaluselesspower = o[i].totaluselesspower;
                                        elecData[i].apower = o[i].apower;
                                        elecData[i].bpower = o[i].bpower;
                                        elecData[i].cpower = o[i].cpower;
                                        elecData[i].power = o[i].power;
                                        elecData[i].forwarddegree = o[i].forwarddegree;
                                        elecData[i].powerfactor = o[i].powerfactor;
                                        elecData[i].readTime = (getFormatDate(new Date(o[i].readTime)));
                                    }
                                    ;
                                    exportToexcel(elecData, this.id, str, title);
                                })
                            }
                        }
                    }
                },
                error: function () {
                    console.log("数据请求错误，请联系系统管理员");
                }
            })
        } else {
            $(".charts").hide().eq(0).show().css("height", "250px");
            $("#downLoadElec").hide();
            $('#dlg').dialog('close');
        }
        $.ajax({
            url: url + "&_dc=" + Math.random() + "&limit=100000",
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data.result == true) {
                    var ndata = data.rows;
                    var nobj = {};
                    var excelData = [];
                    var startDay = new Date(obj.startDate.replace(/-/, "/"));
                    var hour = startDay.getHours();
                    var day = startDay.getDate();
                    var year = startDay.getFullYear();
                    var month = startDay.getMonth() + 1;
                    var days = new Date(year, month, 0).getDate();
                    nobj.hour = [];
                    nobj.opentime = [];
                    nobj.quantity = [];
                    var t = parseInt((new Date(obj.endDate.replace(/-/g, "/")) - new Date(obj.startDate.replace(/-/, "/"))) / 3600000);
                    for (var i = 0; i <= t; i++, hour++) {
                        excelData[i] = {};
                        if (hour >= 24) {
                            hour = 0;
                            day += 1;
                        }
                        ;
                        if (day > days) {
                            day = 1;
                            month++;
                            days = new Date(year, month, 0).getDate();
                        }
                        if (month == 12) {
                            month = 1;
                            year++;
                        }
                        var n = null;
                        for (var j = 0; j < ndata.length; j++) {
                            if ((hour + ":" + day + ":" + month) == (ndata[j].hour + ":" + ndata[j].day + ":" + ndata[j].month)) {
                                n = ndata[j].hour;
                                nobj.opentime.push(parseInt(ndata[j].opentime / 3600 * 100) / 100);
                                nobj.quantity.push(ndata[j].quantity);
                                nobj.hour.push(ndata[j].month + "月" + ndata[j].day + "日" + ndata[j].hour + ":00");
                                excelData[i].opentime = parseInt(ndata[j].opentime / 3600 * 100) / 100;
                                excelData[i].quantity = ndata[j].quantity;
                                excelData[i].hour = ndata[j].month + "月" + ndata[j].day + "日" + ndata[j].hour + ":00";
                            }
                        }
                        if (hour !== n) {
                            nobj.opentime.push(0);
                            nobj.quantity.push(0);
                            nobj.hour.push(month + "月" + day + "日" + hour + ":00");
                            excelData[i].opentime = 0;
                            excelData[i].quantity = 0;
                            excelData[i].hour = month + "月" + day + "日" + hour + ":00";
                        }
                    }
                    ;
                    qualityCharts(nobj);
                    var timeStr = data.summary.opentime.split(":");
                    if (timeStr.length == 3) {
                        timeStr = timeStr[0] + "小时" + timeStr[1] + "分" + timeStr[2] + "秒"
                    } else {
                        timeStr = timeStr[0] + "分" + timeStr[1] + "秒"
                    }
                    $("#quantity").html("总" + type.title + ":" + data.summary.quantity + type.unit);
                    $("#openTime").html("总时间:" + timeStr);
                    $("#downLoadExcel").click(function () {
                        var title = obj.name + "实时能耗信息表";
                        var str = '<th>' +
                            '<caption><h2>' + title + '</h2>' +
                            '<span>时间范围：' + obj.startDate + "～" + obj.endDate + '' +
                            '<h5>总用电量：' + data.summary.quantity + type.unit + '&nbsp;&nbsp;总' + type.title + '时间：' + timeStr + '</h5>' +
                            '</span></caption>' +
                            '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                            '<td>用电时间(h)</td>' +
                            '<td>用电量(Kw.h)</td>' +
                            '<td>时间点</td>' +
                            '</th>'
                        exportToexcel(excelData, this.id, str, title);
                    })

                }
            },
            error: function () {
                console.log("数据请求错误，请联系系统管理员");
            }
        });
    };
    //echart 绘制图表
    var qualityCharts = function (data) {
        var dom = document.getElementById("myChart");
        myChart = echarts.init(dom);
        option = {
            title: {
                text: obj.name + "实时" + type.title + "&用量时间走势图",
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
                data: [type.title, '用量时间'],
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
                data: data.hour,
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位：" + type.unit + "   H",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: type.title,
                    type: 'line',
                    data: data.quantity,
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
                    data: data.opentime,
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
    var currentCharts = function (data) {
        var dom = document.getElementById("current");
        myChart = echarts.init(dom);
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
                data: data.readTime,
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
                    data: data.acurrent,
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
                    data: data.bcurrent,
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
                    data: data.ccurrent,
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
    var voltageCharts = function (data) {
        var dom = document.getElementById("voltage");
        myChart = echarts.init(dom);
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
                data: data.readTime,
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
                    data: data.avoltage,
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
                    data: data.bvoltage,
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
                    data: data.cvoltage,
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
    var powerCharts = function (data) {
        var dom = document.getElementById("power");
        myChart = echarts.init(dom);
        option = {
            title: {
                text: obj.name + "三相功率走势图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050", "#27D17C", "#CB1FB2"],
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
                data: ['A相功率', 'B相功率', "C相功率", "总功率"],
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
                data: data.readTime,
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:W",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: 'A相功率',
                    type: 'line',
                    data: data.apower,
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
                    name: 'B相功率',
                    type: 'line',
                    data: data.bpower,
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
                    name: 'C相功率',
                    type: 'line',
                    data: data.cpower,
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
                    name: '总功率',
                    type: 'line',
                    data: data.power,
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
    var totalusepowerCharts = function (data) {
        var dom = document.getElementById("totalusepower");
        myChart = echarts.init(dom);
        option = {
            title: {
                text: obj.name + "三相有功功率走势图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050", "#27D17C", "#CB1FB2"],
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
                data: ['A相有功功率', 'B相有功功率', "C相有功功率", "总有功功率"],
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
                data: data.readTime,
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:W",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: 'A相有功功率',
                    type: 'line',
                    data: data.atotalusepower,
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
                    name: 'B相有功功率',
                    type: 'line',
                    data: data.btotalusepower,
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
                    name: 'C相有功功率',
                    type: 'line',
                    data: data.ctotalusepower,
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
                    name: '总有功功率',
                    type: 'line',
                    data: data.totalusepower,
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
    var totaluselesspowerCharts = function (data) {
        var dom = document.getElementById("totaluselesspower");
        myChart = echarts.init(dom);
        option = {
            title: {
                text: obj.name + "三相无功功率走势图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050", "#27D17C", "#CB1FB2"],
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
                data: ['A相无功功率', 'B相无功功率', "C相无功功率", "总无功功率"],
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
                data: data.readTime,
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {}
            },
            yAxis: {
                name: "                       单位:Var",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: 'A相无功功率',
                    type: 'line',
                    data: data.atotaluselesspower,
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
                    name: 'B相无功功率',
                    type: 'line',
                    data: data.btotaluselesspower,
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
                    name: 'C相无功功率',
                    type: 'line',
                    data: data.ctotaluselesspower,
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
                    name: '总无功功率',
                    type: 'line',
                    data: data.totaluselesspower,
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
//能耗的日月年统计
var statisticaldata = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    var obj = {startDate: lastMonth(), endDate: yesterday(), queryId: 18};
    var type = {title: "E"};
    var searchOrder = function () {
        var html = "<form id='ff' mothod='post' class='ff' style='padding-right:200px'>" +
            '<input id="meterKind" value="E" name="meterKind" label="选择能耗类型:">' + "&nbsp;&nbsp;" +
            '<select id="queryId" class="easyui-combobox" name="queryId" label="统计类型:" labelPosition="right" style="width:200px">' +
            '<option value="18">按日统计</option>' +
            '<option value="19">按月统计</option>' +
            '<option value="20">按年统计</option>' +
            '</select>' + "&nbsp;&nbsp;" +
            '<input id="startTime"  class="easyui-datetimebox inputbox dt" label="开始时间:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<input id="endTime" class="easyui-datetimebox inputbox  dt" label="结束时间:" labelPosition="right">' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            "</form>"
        $("#res").html(html);
        $("#meterKind").combobox({
            data: dist["meterkind"],
            valueField: 'value',
            textField: 'text',
            onSelect: function (record) {
                type.meterKind = record.value;
                if (record.value == "E") {
                    type.title = "用电量";
                    type.unit = "KW.H";
                } else if (record.value == "W") {
                    type.title = "用水量";
                    type.unit = "M³";
                } else if (record.value == "G") {
                    type.title = "用气量";
                    type.unit = "M³";
                } else if (record.value == "F") {
                    type.title = "流量";
                    type.unit = "M³/h";
                } else if (record.value == "T") {
                    type.title = "温度表";
                    type.unit = "℃";
                }
                $(".treeMenu").tree({
                    url: "/auth/org/tree?sub=y&meter=true&meterKind=" + record.value + "&_dc=" + Math.random(),
                    method: "GET",
                    animate: true,
                    line: false,
                    field: "name",
                    loadFilter: function (data) {
                        collapseTree(data)
                        return data;
                    },
                    onLoadSuccess: function (node, data) {
                        obj.name = data[0].children[0].text;
                        if (data[0].children[0].meter == false) {
                            obj.orgId = data[0].children[0].id;
                        } else {
                            obj.meterId = data[0].children[0].meterId;
                        }
                        getData("/wp/query/execute/query_result?meterKind=" + record.value, obj);
                    },
                    onClick: function (node) {
                        obj.name = node.text;
                        if (node.meter == false) {
                            obj.orgId = node.id;
                            obj.meterId = "";
                        } else if (node.meter == true) {
                            obj.meterId = node.meterId;
                            obj.orgId = "";
                        }
                        ;
                        getData("/wp/query/execute/query_result?meterKind=" + record.value, obj);
                    }
                })
            }
        })
        $('.dt').datetimebox({});
        $('.btn').linkbutton({});
        $('#queryId').combobox({
            onSelect: function (dom) {
                obj.queryId = dom.value;
                if (obj.queryId == 18) {
                    obj.startDate = lastMonth();
                } else if (obj.queryId == 19) {
                    obj.startDate = lastYear();
                } else if (obj.queryId == 20) {
                    obj.startDate = last10Year();
                }
            }
        });
        $("#ff").on("click", "a", function () {
            if (this.id == "search") {
                var startTime = $("#startTime").val();
                var endTime = $("#endTime").val();
                if (Date.parse(startTime) > Date.parse(endTime)) {
                    $('#dlg').html("开始时间不能大于结束时间").dialog('open');
                    return;
                } else {
                    if (startTime !== "") {
                        try {
                            startTime = easyUIformater(startTime)
                            if (startTime.split(" ")[0].toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                                console.log(startTime);
                                obj.startDate = startTime.split(" ")[0].toString();
                                $('#dlg').dialog("close")
                            }
                            ;
                        } catch (e) {
                            $('#dlg').html("请输入正确的开始时间").dialog('open');
                        }
                    }
                    ;
                    if (endTime !== "") {
                        try {
                            var endTime = easyUIformater(endTime)
                            if (endTime.split(" ")[0].toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                                obj.endDate = endTime;
                                $('#dlg').dialog("close")
                            }
                        } catch (e) {
                            $('#dlg').html("请输入正确的结束时间").dialog('open');
                        }
                    }
                    ;
                }
                getData("/wp/query/execute/query_result?meterKind=" + type.meterKind, obj);
            } else if (this.id == "clear") {
                $("#ff").form("clear");
                obj.queryId = 18;
                obj.startDate = lastMonth();
                obj.endDate = yesterday();
            }
            ;
        });
    }
    searchOrder();
    //封装ajax
    var getData = function (url, data) {
        $.ajax({
            url: url,
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data.result == true) {
                    var ndata = data.rows;
                    var ostr = "";
                    var nobj = {};
                    excelData = [];
                    nobj.hour = [];
                    nobj.opentime = [];
                    nobj.quantity = [];
                    if (ndata == "") {
                        $("#dlg").html("该段时间通信中断，没有数据！").dialog("open");
                        reportDataChart(nobj);
                    } else {
                        $("#dlg").dialog("close");
                        for (var j = 0; j < ndata.length; j++) {
                            excelData[j] = {}
                            if (obj.queryId == 18) {
                                ostr = ndata[j].year + "年" + ndata[j].month + "月" + ndata[j].day + "日";
                            } else if (obj.queryId == 19) {
                                ostr = ndata[j].year + "年" + ndata[j].month + "月";
                            } else if (obj.queryId == 20) {
                                ostr = ndata[j].year + "年";
                            }
                            ;
                            nobj.hour.push(ostr);
                            nobj.opentime.push(parseInt((ndata[j].opentime / 3600 * 100)) / 100);
                            nobj.quantity.push(ndata[j].quantity);
                            excelData[j].opentime = parseInt((ndata[j].opentime / 3600 * 100)) / 100;
                            excelData[j].quantity = ndata[j].quantity;
                            excelData[j].hour = ostr;
                        }
                        ;
                        var timeStr = data.summary.opentime.split(":");
                        if (timeStr.length == 3) {
                            timeStr = timeStr[0] + "小时" + timeStr[1] + "分" + timeStr[2] + "秒"
                        } else {
                            timeStr = timeStr[0] + "分" + timeStr[1] + "秒"
                        }
                        reportDataChart(nobj);
                        $("#quantity").html("总" + type.title + ":" + data.summary.quantity + type.unit);
                        $("#openTime").html("总用量时间：" + timeStr);
                        $("#downLoadExcel").click(function () {
                            var title = obj.name + "能耗统计信息表";
                            var str = '<th>' +
                                '<caption><h2>' + title + '</h2>' +
                                '<span>查询时间：' + obj.startDate + "～" + obj.endDate + '' +
                                '<h5>总' + type.title + data.summary.quantity + type.unit + '&nbsp;&nbsp;总用量时间：' + timeStr + '</h5>' +
                                '</span></caption>' +
                                '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                                '<td>用量时间(h)</td>' +
                                '<td>' + type.title + ":" + type.unit + '</td>' +
                                '<td>时间点</td>' +
                                '</th>'
                            exportToexcel(excelData, this.id, str, title);
                        });
                    }
                    ;
                }
                ;
            },
            error: function () {
                console.log("数据请求错误，请联系系统管理员");
            }
        });
    }
    //echart 绘制图表
    var reportDataChart = function (data) {
        $("#myChart").remove();
        var elem = "<div id='myChart' style='width:100%;height:80%;padding:20px;padding-right:220px'></div>"
        $("#res").append(elem);
        var drawCharts2 = function () {
            var dom = document.getElementById("myChart");
            myChart = echarts.init(dom)
            option = {
                title: {
                    text: obj.name + type.title + "&用量时间按" + (obj.queryId == 18 ? "日" : obj.queryId == 19 ? "月" : obj.queryId == 20 ? "年" : "") + "统计走势图",
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
                    data: [type.title, '用量时间'],
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
                    data: data.hour,
                    axisPointer: {
                        type: 'shadow'
                    },
                    axisLabel: {}
                },
                yAxis: {
                    name: "                       单位：" + type.unit + "  H",
                    type: 'value',
                    axisLine: {
                        lineStyle: {}
                    },
                },
                series: [
                    {
                        name: type.title,
                        type: 'line',
                        data: data.quantity,
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
                        data: data.opentime,
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
        }
        drawCharts2();
        var html = '<a href="javascript:void(0)" id="downLoadExcel"  class="easyui-linkbutton btn" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>' + "&nbsp;&nbsp;" +
            "<span id='quantity' class='dage'></span>&nbsp;&nbsp;<span id='openTime' class='dage'></span>";
        $("#myChart").append(html);
        $('.btn').linkbutton({});
    };
    treeNavLeft(getData, obj);
};
//峰谷统计
var peakValley = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    var obj = null;
    obj = {startDate: lastMonth(), endDate: getFormatDate(new Date())};
    (function () {
        var html = "<form id='ff' mothod='post' class='ff'>" +
            '<input id="startTime"  class="easyui-datetimebox inputbox dt" label="开始时间:" labelPosition="Left">' + "&nbsp;&nbsp;" +
            '<input id="endTime" class="easyui-datetimebox inputbox  dt" label="结束时间:" labelPosition="Left">' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            '<a href="javascript:void(0)" class="btn" id="setting" style="position:absolute;right:220px;">时段设置</a>' +
            "</form>"
        $("#res").html(html);
        $('.dt').datetimebox({});
        $('.btn').linkbutton({});
        $("#ff").form("clear");
        $("#ff").on("click", "a", function () {
            if (this.id == "search") {
                var startTime = $("#startTime").val();
                var endTime = $("#endTime").val();
                if (Date.parse(startTime) > Date.parse(endTime)) {
                    $('#dlg').html("开始时间不能大于结束时间").dialog('open');
                    return;
                } else {
                    if (startTime !== "") {
                        try {
                            startTime = easyUIformater(startTime)
                            if (startTime.split(" ")[0].toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                                obj.startDate = startTime;
                                $('#dlg').dialog("close")
                            }
                            ;
                        } catch (e) {
                            $('#dlg').html("请输入正确的开始时间").dialog('open');
                        }
                    }
                    ;
                    if (endTime !== "") {
                        try {
                            var endTime = easyUIformater(endTime)
                            if (endTime.split(" ")[0].toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                                obj.endDate = endTime;
                                $('#dlg').dialog("close")
                            }
                        } catch (e) {
                            $('#dlg').html("请输入正确的结束时间").dialog('open');
                        }
                    }
                    ;
                    getpvData();
                }
            } else if (this.id == "clear") {
                $("#ff").form("clear");
                obj.startDate = lastMonth()
                obj.endDate = getFormatDate(new Date());
            }
            ;
        });
        $("#setting").click(function () {
            pvInfo();
        })
    })();
    var getData = function () {
        obj.queryId = 26;
        $.ajax({
            url: "/wp/query/execute/query_result",
            type: "POST",
            data: obj,
            contentType: "application/x-www-form-urlencoded",
            success: function (data) {
                if (data.result == true) {
                    var temp = data.rows;
                    if (data.rows == "") {
                        $("#dlg").html("该段时间通信中断，没有数据！").dialog("open");
                        return;
                    } else {
                        $("#dlg").dialog("close");
                        var pvSum = [
                            {type: "尖", quantity: 0, opentime: 0, fee: 0, times: []},
                            {type: "峰", quantity: 0, opentime: 0, fee: 0, times: []},
                            {type: "平", quantity: 0, opentime: 0, fee: 0, times: []},
                            {type: "谷", quantity: 0, opentime: 0, fee: 0, times: []},
                        ];
                        for (var i = 0; i < temp.length; i++) {
                            if (temp[i].busy_type == "尖") {
                                pvSum[0].quantity += temp[i].quantity
                                pvSum[0].opentime += temp[i].opentime / 3600;
                                pvSum[0].fee += temp[i].fee;
                                pvSum[0].times.push(temp[i].busy_type_id + ":59")
                            } else if (temp[i].busy_type == "峰") {
                                pvSum[1].quantity += temp[i].quantity;
                                pvSum[1].opentime += temp[i].opentime / 3600;
                                pvSum[1].fee += temp[i].fee;
                                pvSum[1].times.push(temp[i].busy_type_id + ":59")
                            } else if (temp[i].busy_type == "平") {
                                pvSum[2].quantity += temp[i].quantity;
                                pvSum[2].opentime += temp[i].opentime / 3600;
                                pvSum[2].fee += temp[i].fee;
                                pvSum[2].times.push(temp[i].busy_type_id + ":59")
                            } else if (temp[i].busy_type == "谷") {
                                pvSum[3].quantity += temp[i].quantity;
                                pvSum[3].opentime += temp[i].opentime / 3600;
                                pvSum[3].fee += temp[i].fee;
                                pvSum[3].times.push(temp[i].busy_type_id + ":59")
                            }
                        }
                        for (var i = 0; i < pvSum.length; i++) {
                            pvSum[i].quantity = (parseInt(pvSum[i].quantity * 1000)) / 1000;
                            pvSum[i].opentime = (parseInt(pvSum[i].opentime * 1000)) / 1000;
                            pvSum[i].fee = (parseInt(pvSum[i].fee * 1000)) / 1000;
                            pvSum[i].times = removeArrrepeat(pvSum[i].times);
                        }
                        drawCharts2(pvSum);
                        $("#downPvExcel").click(function () {
                            var title = obj.name + "尖峰平谷统计信息表";
                            var str = '<th>' +
                                '<caption><h2>' + title + '</h2>' +
                                '<span>查询时间：' + obj.startDate + "～" + obj.endDate + '</span>' +
                                '</caption>' +
                                '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                                '<td>类型</td>' +
                                '<td>用电量(Kw.h)</td>' +
                                '<td>用电时间(h)</td>' +
                                '<td>电费(Rmb)</td>' +
                                '<td>用电时段</td>' +
                                '</th>';
                            exportToexcel(pvSum, this.id, str, title);
                        });
                    }
                } else if (data.result == false) {
                    $('#dlg').html(data.msg).dialog('open');
                }
            },
        });
    }
    var drawCharts2 = function (data) {
        $("#myChart").remove();
        var elem = "<div id='myChart' style='width:88%;height:700px;padding:20px'></div>"
        $("#res").append(elem);
        var dom = document.getElementById("myChart");
        myChart = echarts.init(dom);
        option = {
            title: {
                text: obj.name + "尖峰平谷用电量和用电时间柱形图",
                x: "center",
            },
            color: ["#87CEFA", "#FF8050", "#e4393c"],
            tooltip: {
                trigger: 'axis',
            },
            toolbox: {
                show: true,
                x: "right",
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            legend: {
                data: ['用电量', '用电时间', '电费'],
                x: "65%",
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
                data: [
                    data[0].type + "\n" + data[0].times.join("\n"),
                    data[1].type + "\n" + data[1].times.join("\n"),
                    data[2].type + "\n" + data[2].times.join("\n"),
                    data[3].type + "\n" + data[3].times.join("\n"),
                ],
                axisPointer: {
                    type: 'shadow'
                },
                axisLabel: {
                    fontSize: 16,
                }
            },
            yAxis: {
                name: "                       单位：KW.h   H  Rmb",
                type: 'value',
                axisLine: {
                    lineStyle: {}
                },
            },
            series: [
                {
                    name: '用电量',
                    type: 'bar',
                    data: [data[0].quantity.toFixed(3), data[1].quantity, data[2].quantity, data[3].quantity],
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
                    name: '用电时间',
                    type: 'bar',
                    data: [data[0].opentime, data[1].opentime, data[2].opentime, data[3].opentime],
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
                    name: '电费',
                    type: 'bar',
                    data: [data[0].fee, data[1].fee, data[2].fee, data[3].fee],
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
        var html = '<a href="javascript:void(0)"  id="downPvExcel" style="clear:both"  class="btn" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>' + "&nbsp;&nbsp;&nbsp;&nbsp;"
        $("#myChart").append(html);
        $('.btn').linkbutton({});
    };
    var pvInfo = function () {
        var html = '<div id="ft" style="padding:5px 5px;text-align: right">' +
            '<span style="font-size: 18px;padding:0 32%;color:#666">时间周期明细</span>' +
            '<a href="javascript:void(0)" class="btn" id="add" iconCls="icon-add">增加</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="edit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="delete" iconCls="icon-edit">删除</a>' + "&nbsp;" +
            '</div>' +
            '<table id="pvTime"></table>'
        $('#pvWindow').html(html).window({top: 200}).window("open").children("#pvTime").datagrid({
            url: "/wp/busytype/period/query",
            method: "GET",
            checkbox: true,
            toolbar: '#ft',
            columns: [[
                {field: 'check', title: '', width: '0', align: "center", checkbox: true},
                {field: 'beginDate', title: '开始日期', width: '20%', align: "center"},
                {field: 'endDate', title: '结束日期', width: '20%', align: 'center'},
                {field: 'modifyTime', title: '修改时间', width: '20%', align: 'center'},
                {field: 'createTime', title: '创建时间', width: '20%', align: 'center'},
                {field: 'remark', title: '备注', width: '19%', align: 'center'},
            ]],
            singleSelect: true,
            pagination: false,
            loadFilter: pagerFilter,
            onLoadSuccess: function (data) {
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            onSelect: function (index, row) {
                $("#pvBtn").remove();
                obj.periodId = row.id;
                var html = '<div id="pvBtn" style="padding:5px 5px;text-align: right">' +
                    '<span style="font-size: 18px;padding:0 29.5%;color:#666">时间周期的尖峰平谷明细</span>' +
                    '<a href="javascript:void(0)" class="btn" id="add" iconCls="icon-add">增加</a>' + "&nbsp;" +
                    '<a href="javascript:void(0)" class="btn" id="edit" iconCls="icon-add">修改</a>' + "&nbsp;" +
                    '<a href="javascript:void(0)" class="btn" id="delete" iconCls="icon-remove">删除</a>' +
                    '</div>' +
                    '<table id="pvList" style="height:auto;"></table>'
                $("#pvWindow").append(html);
                $('.btn').linkbutton();
                $('#pvList').datagrid({
                    toolbar: '#pvBtn',
                    url: "/wp/busytype/type/query?periodId=" + row.id,
                    method: "POST",
                    checkbox: true,
                    columns: [[
                        {field: 'check', title: '', width: "0", align: "center", checkbox: true},
                        {field: 'type', title: '时段', width: "9%", align: "center"},
                        {field: 'beginHour', title: '开始时间', width: "20%", align: "center"},
                        {field: 'endHour', title: '结束时间', width: "20%", align: "center"},
                        {field: 'price', title: '电费单价', width: "10%", align: "center"},
                        {field: 'createTime', title: '创建时间', width: "20%", align: 'center'},
                        {field: 'modifyTime', title: '修改时间', width: "20%", align: 'center'},
                    ]],
                    onLoadSuccess: function (data) {
                    },
                    onLoadError: function () {
                        console.log("数据加载失败！")
                    },
                    loadMsg: "加载中...，请稍后",
                    singleSelect: true,
                    loadFilter: pagerFilter,
                });
            },
        });
        $(".btn").linkbutton();
    };
    //时间周期表单
    var ctForms = function () {
        var html =
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="datebox beginDate" name="beginDate" data-options="required:true" label="开始日期:" labelPosition="left" style="width:100%">\n' +
            '        </div>\n' +
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="datebox endDate" name="endDate" data-options="required:true" label="结束日期:" labelPosition="left" style="width:100%">\n' +
            '        </div>\n' +
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="ft" name="remark"  label="备注:" labelPosition="left" style="width:100%">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="savebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="cancel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        ctFormsInit();
    };
    //时间周期表单初始化
    var ctFormsInit = function () {
        $(".ft").textbox();
        $(".datebox").datebox();
        $(".easyui-linkbutton").linkbutton();
        $(".window-shadow").css({height: "auto"})
        $("#winform").form("clear");
    };
    //尖峰平谷表单
    var pvForms = function () {
        var html =
            '<div style="margin-bottom:20px">\n' +
            '    <input class="type" name="type" style="width:100%" data-options="label:\'选择类型:\',required:true">\n' +
            '</div>\n' +
            '<div style="margin-bottom:20px">\n' +
            '    <input  class="hour" name="beginHour" data-options="required:true" label="开始时间:" labelPosition="left" style="width:100%">\n' +
            '</div>\n' +
            '<div style="margin-bottom:20px">\n' +
            '    <input  class="hour1" name="endHour" data-options="required:true" label="结束时间:" labelPosition="left" style="width:100%">\n' +
            '</div>\n' +
            '<div style="margin-bottom:20px">\n' +
            '    <input  class="ft" name="price" data-options="required:true" label="单价:" labelPosition="left" style="width:100%">\n' +
            '</div>\n' +
            '<div  style="margin-bottom:20px;text-align:right">\n' +
            '   <a id="pvSavebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '   <a id="pvcancel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '</div>'
        $("#winform").html(html);
        pvFormsInit();
    };
    //尖峰平谷表单初始化
    var pvFormsInit = function () {
        $(".type").combobox({
            data: dict["busy_type"],
            valueField: 'id',
            textField: 'text',
        });
        $(".hour").combobox({
            data: dist["hour"],
            valueField: 'text',
            textField: 'text',
        });
        $(".hour1").combobox({
            data: dist["hour1"],
            valueField: 'text',
            textField: 'text',
        });
        $(".ft").textbox();
        $(".easyui-linkbutton").linkbutton();
        $(".window-shadow").css({height: "auto"})
        $("#winform").form("clear");
    };
    //表单验证
    var isValid = function () {
        if ($("#winform").form('validate')) {
            return true;
        } else {
            $('#dlg').html("红色的内容框必须填写").dialog('open');
            return false;
        }
    };
    //时间周期的增删改逻辑处理
    $("#pvWindow").off("click", "#ft a").on("click", "#ft a", function () {
        obj.type = this.id;
        if (obj.type == "add") {
            $("#modifyWindow").window({top: 200, height: "auto"}).window("open");
            ctForms();
        } else if (obj.type == "edit") {
            var row = $("#pvTime").datagrid("getSelections");
            if (row.length == 1) {
                $("#modifyWindow").window({top: 200, height: "auto"}).window("open");
                ctForms();
                var begin = row[0].beginDate.split(" ")[0].split("-");
                var end = row[0].endDate.split(" ")[0].split("-");
                begin = begin[1] + "/" + begin[2] + "/" + begin[0];
                end = end[1] + "/" + end[2] + "/" + end[0];
                $('#winform').form('load', row[0]);
                $(".beginDate").datebox("setValue", begin);
                $(".endDate").datebox("setValue", end);
                obj.id = row[0].id;
            } else if (row.length == 0) {
                $('#dlg').html("请选择需要修改的区域").dialog('open');
                return;
            } else if (row.length > 1) {
                $('#dlg').html("一次只能修改一个区域").dialog('open');
                return;
            }
        } else if (obj.type == "delete") {
            var row = $("#pvTime").datagrid("getSelections");
            if (row.length > 0) {
                var html = ""
                html += "<div style='margin:5px;color:red;'>" + row[0].beginDate + "～" + row[0].endDate + "</div>"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnok" data-options="iconCls:\'icon-ok\'" >确定</a>' + "&nbsp;&nbsp;"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnno" data-options="iconCls:\'icon-cancel\'">取消</a>'
                $('#dlg').html("以下时段将被删除:" + "<br>" + html).dialog('open')
                $(".btn").linkbutton();
                $("#btnok").click(function () {
                    $.ajax({
                        url: "/wp/busytype/period/delete?id=" + row[0].id,
                        type: "GET",
                        contentType: "application/json",
                        success: function (data) {
                            if (data.result == true) {
                                $('#dlg').dialog("close");
                                $("#pvTime").datagrid("reload");
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
    //时间周期增改保存数据
    $('#winform').off("click", "#savebtn").on("click", "#savebtn", function () {
        if (isValid()) {
            obj.info = $('#winform').serializeObject();
            obj.info.beginDate = getFormatDateNullTime(new Date(obj.info.beginDate));
            obj.info.endDate = getFormatDateNullTime(new Date(obj.info.endDate));
            obj.info.id = obj.id;
            var url = "";
            if (obj.type == "add") {
                url = "/wp/busytype/period/add";
            } else if (obj.type == "edit") {
                url = "/wp/busytype/period/update";
            }
            ;
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#pvTime").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
            });
        }
        ;
    });
    //取消时间周期的修改
    $('#winform').off("click", "#cancel").on("click", "#cancel", function () {
        $('#modifyWindow').window('close');
    });
    //尖峰平谷的增删改逻辑处理
    $("#pvWindow").off("click", "#pvBtn a").on("click", "#pvBtn a", function () {
        obj.type = this.id;
        if (obj.type == "add") {
            $("#modifyWindow").window({top: 200, height: "auto"}).window("open");
            pvForms();
        } else if (obj.type == "edit") {
            var row = $("#pvList").datagrid("getSelections");
            if (row.length == 1) {
                $("#modifyWindow").window({top: 200, height: "auto"}).window("open");
                pvForms();
                $('#winform').form('load', row[0]);
                obj.id = row[0].id;
            } else if (row.length == 0) {
                $('#dlg').html("请选择需要修改的区域").dialog('open');
                return;
            } else if (row.length > 1) {
                $('#dlg').html("一次只能修改一个区域").dialog('open');
                return;
            }
        } else if (obj.type == "delete") {
            var row = $("#pvList").datagrid("getSelections");
            if (row.length > 0) {
                var html = ""
                html += "<div style='margin:5px;color:red;'>" + row[0].type + "</div>"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnok" data-options="iconCls:\'icon-ok\'" >确定</a>' + "&nbsp;&nbsp;"
                html += '<a href="javascript:void(0)"  style="margin-top:50px;" class="easyui-linkbutton btn" id="btnno" data-options="iconCls:\'icon-cancel\'">取消</a>'
                $('#dlg').html("以下时段将被删除:" + "<br>" + html).dialog('open')
                $(".btn").linkbutton();
                $("#btnok").click(function () {
                    $.ajax({
                        url: "/wp/busytype/type/delete?id=" + row[0].id,
                        type: "GET",
                        contentType: "application/json",
                        success: function (data) {
                            if (data.result == true) {
                                $('#dlg').dialog("close");
                                $("#pvList").datagrid("reload");
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
    //尖峰平谷的增改保存数据
    $('#winform').off("click", "#pvSavebtn").on("click", "#pvSavebtn", function () {
        if (isValid()) {
            obj.info = $('#winform').serializeObject();
            obj.info.periodId = obj.periodId;
            obj.info.endHour = obj.info.endHour.split(":")[0];
            var url = "";
            if (obj.type == "add") {
                url = "/wp/busytype/type/add";
            } else if (obj.type == "edit") {
                obj.info.id = obj.id;
                url = "/wp/busytype/type/update";
            }
            ;
            if (obj.info.type == "未定义") {
                obj.info.type = "0"
            } else if (obj.info.type == "尖") {
                obj.info.type = "1"
            } else if (obj.info.type == "峰") {
                obj.info.type = "2"
            } else if (obj.info.type == "平") {
                obj.info.type = "3"
            } else if (obj.info.type == "谷") {
                obj.info.type = "4"
            }
            ;
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(obj.info),
                contentType: "application/json",
                success: function (data) {
                    if (data.result == true) {
                        $("#pvList").datagrid("reload");
                        $('#modifyWindow').window('close');
                    } else if (data.result == false) {
                        $('#dlg').html(data.msg).dialog('open');
                    }
                },
            });
        }
        ;
    });
    //取消尖峰平谷的修改
    $('#winform').off("click", "#pvcancel").on("click", "#pvcancel", function () {
        $('#modifyWindow').window('close');
    });
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
            '<a href="javascript:void(0)" style="float:right" class="button" id="alarmRecord">预警历史记录</a>' +
            "</div>" +
            "<ul class='colorInfo'>" +
            "<li id='total'>总表数：</li>" +
            "<li>" +
            "<span id='unset'>未设：</span>" +
            "<span class='unset'></span>" +
            "</li>" +
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
                if (data.result == true) {
                    var temp = data.rows;
                    if (data.rows !== []) {
                        var unset = 0, alarm = 0, normal = 0, brek = 0;
                        for (var i = 0; i < temp.length; i++) {
                            var div = document.createElement("div");
                            var img = document.createElement("img");
                            var span = document.createElement("span")
                            if (temp[i].lostFlag == true) {
                                img.src = "../page/img/break.png";
                                div.msg = "通信中断！";
                                div.alarm = "0"
                                brek++;
                            } else {
                                if (temp[i].monitorFlag == true) {
                                    if (temp[i].alarmFlag == 0) {
                                        img.src = "../page/img/running.png";
                                        normal++;
                                        div.msg = "正常监控中！";
                                        div.alarm = "0"
                                    } else {
                                        img.src = "../page/img/alarm.png";
                                        alarm++;
                                        div.msg = "超出监控范围：" + temp[i].alarmConditions;
                                        div.alarm = "1"
                                    }
                                } else if (temp[i].monitorFlag == false) {
                                    img.src = "../page/img/unset.png";
                                    unset++;
                                    div.alarm = "0"
                                    div.msg = "未设置预警！"
                                }
                            }
                            div.id = temp[i].id;
                            div.place = "所属区域：" + temp[i].place;
                            div.title = "设备名称：" + temp[i].meterName + "\n" + "预警信息：" + div.msg + "\n" + div.place + "\n";
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
                        $("#unset").html("未设：" + unset);
                        $("#alarm").html("预警：" + alarm);
                        $("#normal").html("正常：" + normal);
                        $("#break").html("中断：" + brek);
                        $("#res").off("click", "#dtn").on("click", "#dtn", function () {
                            var title = "设备监控信息表";
                            var str = '<th>' +
                                '<caption><h2>' + title + '</h2>' +
                                '<span>总表数:' + temp.length + "未设:" + unset + '预警:' + alarm + '正常:' + normal + '中断:' + brek + '</span>' +
                                '</caption>' +
                                '<tr style="font-weight:bold;background:#385787;color:white;height:30px;text-align:center;border:1px solid #385787">' +
                                '<td>区域地址</td>' +
                                '<td>设备名称</td>' +
                                '<td>监控条件</td>' +
                                '<td>设备通断</td>' +
                                '<td>设备监控</td>' +
                                '<td>预警监控</td>' +
                                '</th>';
                            var devData = [];
                            for (var i = 0; i < temp.length; i++) {
                                devData[i] = {};
                                devData[i].place = temp[i].place;
                                devData[i].meterName = temp[i].meterName;
                                devData[i].alarmConditions = temp[i].alarmConditions == undefined ? "未设置" : temp[i].alarmConditions;
                                devData[i].lostFlag = temp[i].lostFlag == true ? "断" : "通";
                                devData[i].monitorFlag = temp[i].monitorFlag == true ? "已监控" : "未监控";
                                devData[i].alarmFlag = temp[i].alarmFlag == undefined ? "无预警" : temp[i].alarmFlag == 0 ? "正常监控" : "预警中";
                            }
                            exportToexcel(devData, this.id, str, title);
                        })
                        $("#res .alarmBlock").click("#res .alarmBlock", function () {
                            var id = this.id;
                            var name = "";
                            var alarm = $(this).prop("alarm");
                            if (alarm == "1") {
                                name += $(this).attr("title").split("\n").join("<br>");
                            } else {
                                name += $(this).attr("title").split("\n").join("<br>");
                            }
                            $("#dlg").html(name).dialog("open");
                            $.ajax({
                                url: "/dev/meter/query?id=" + id,
                                type: "GET",
                                dataType: "json",
                                success: function (data) {
                                    if (data.result == true) {
                                        var temp = data.rows[0];
                                        if (temp.lostFlag == false) {
                                            var startDate = getFormatDate(new Date(Date.parse(new Date()) - 6000000));
                                            var endDate = getFormatDate(new Date());
                                            $.ajax({
                                                url: "/wp/hisread/query?meterId=" + id + "&startDate=" + startDate + "&endDate=" + endDate,
                                                type: "GET",
                                                dataType: "json",
                                                success: function (data) {
                                                    if (data.result == true) {
                                                        var memp = data.rows[0];
                                                        var html = name + "<br><hr>" + "三相电流：" +
                                                            "A:" + (memp.acurrent == undefined ? "无" : memp.acurrent + "A") + "&nbsp;" +
                                                            "B:" + (memp.bcurrent == undefined ? "无" : memp.bcurrent + "A") + "&nbsp;" +
                                                            "C:" + (memp.ccurrent == undefined ? "无" : memp.ccurrent + "A") + "&nbsp;<br><hr>" +
                                                            "三相电压：" +
                                                            "A:" + (memp.avoltage == undefined ? "无" : memp.avoltage + "V") + "&nbsp;&nbsp;" +
                                                            "B:" + (memp.bvoltage == undefined ? "无" : memp.bvoltage + "V") + "&nbsp;&nbsp;" +
                                                            "C:" + (memp.cvoltage == undefined ? "无" : memp.cvoltage + "V") + "<br><hr>" +
                                                            "三相功率：" +
                                                            "A:" + (memp.apower == undefined ? "无" : memp.apower + "W") + "&nbsp;&nbsp;" +
                                                            "B:" + (memp.bpower == undefined ? "无" : memp.bpower + "W") + "&nbsp;&nbsp;" +
                                                            "C:" + (memp.cpower == undefined ? "无" : memp.cpower + "W") + "<br><hr>" +
                                                            "正向电量：" + (memp.forwarddegree == undefined ? "无" : memp.forwarddegree + "Kw.h") + "&nbsp;&nbsp;";
                                                        $("#dlg").html(html).dialog("open");
                                                    }
                                                }
                                            })
                                        } else {
                                            $("#dlg").html("通信中断，没有数据！").dialog("open");
                                        }
                                    } else {
                                        $("#dlg").html("请求出错，服务器响应失败！").dialog("open");
                                    }
                                }
                            })
                        });
                    }
                } else {
                    $("dlg").html("没有设置预警的设备或区域！").dialog("open");
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
        $("#pvWindow").html("");
        $("#pvWindow").window({top: 200}).window("open");
        var html = "<form id='af' mothod='post' class='ff'>" +
            '<input name="startDate" id="startDate"  class="inputbox timebox" label="开始时间:" labelPosition="Left">' + "&nbsp;&nbsp;" +
            '<input name="endDate" id="endDate" class="inputbox timebox" label="结束时间:" labelPosition="Left">' + "&nbsp;&nbsp;" +
            '<input name="meterId" id="meterId" style="width:300px" class="meterId inputbox" label="电表编号:" labelPosition="Left">' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            "</form>" +
            "<table id='alarmHistory'></table>"
        $("#pvWindow").html(html);
        $(".timebox").datebox();
        $(".btn").linkbutton();
        $(".meterId").textbox();
        $('#alarmHistory').datagrid({
            url: "/wp/alarm/record/query?start=0&limit=20000&startDate=" + getZeroTime() + "&endDate=" + getFormatDate(new Date()) + "&page=1&rows=20000",
            columns: [[
                {field: 'beginTime', title: '开始时间', width: "15%", align: "center"},
                {field: 'endTime', title: '结束时间', width: "15%", align: "center"},
                {field: 'devPlace', title: '电表名称', width: "15%", align: "center"},
                {field: 'displayText', title: '报警信息', width: "30%", align: "center"},
                {field: 'createTime', title: '创建时间', width: "15%", align: "center"},
                {field: 'meterId', title: '电表编号', width: "10%", align: "center"},
            ]],
            onLoadSuccess: function (data) {
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            loadMsg: "加载中....，请稍后",
            sortOrder: "desc",
            pagination: true,
            pagePosition: "bottom",
            pageNumber: 1,
            pageSize: 10,
            singleSelect: true,
            pageList: [10, 20, 40, 80],
            loadFilter: pagerFilter,
            onSelect: function (index, row) {

            }
        });
    });
    $("#pvWindow").off("click", "#search").on("click", "#search", function () {
        obj.info = null;
        obj.info = $("#af").serialize();
        var startDate = $("#af #startDate").val();
        var endDate = $("#af #endDate").val();
        var meterId = $("#af #meterId").val();
        if (startDate == "") {
            startDate = getZeroTime();
        } else {
            startDate = easyUIDateformater(startDate);
        }
        if (endDate == "") {
            endDate = getFormatDate(new Date());
        } else {
            endDate = easyUIDateformater(endDate);
        }
        $('#alarmHistory').datagrid({
            url: "/wp/alarm/record/query?start=0&limit=20000&startDate=" + startDate + "&endDate=" + endDate + "&meterId=" + meterId,
            method: "get",
        });
    });
    $("#pvWindow").off("click", "#clear").on("click", "#clear", function () {
        $("#af").form("clear");
    });
    var alarmSet = function () {
        var html = '<div id="ft" style="padding:5px 5px;text-align: right">' +
            '<span style="font-size: 18px;padding:0 28%;color:#666">预警条件设置</span>' +
            '<a href="javascript:void(0)" class="btn" id="add" iconCls="icon-add">增加</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="edit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="btn" id="delete" iconCls="icon-clear">删除</a>' + "&nbsp;" +
            '</div>' +
            '<table id="alarmDev"></table>'
        $('#pvWindow').html(html).window({top: 200}).window("open").children("#alarmDev").datagrid({
            url: "/wp/alarm/condition/query?start=0&limit=20000",
            method: "GET",
            checkbox: true,
            toolbar: '#ft',
            columns: [[
                {field: 'check', title: '', width: '0', align: "center", checkbox: true},
                {field: 'itemCode', title: '监控参数', width: '8%', align: "center"},
                {field: 'comparator', title: '比较符号', width: '8%', align: 'center'},
                {field: 'alarmValue', title: '监控值', width: '8%', align: 'center'},
                {field: 'msgTemplate', title: '提示信息', width: '34%', align: 'center'},
                {field: 'status', title: '状态', width: '7%', align: 'center'},
                {field: 'modifyTime', title: '修改时间', width: '17%', align: 'center'},
                {field: 'createTime', title: '创建时间', width: '17%', align: 'center'},
            ]],
            singleSelect: true,
            pagination: false,
            loadFilter: pagerFilter,
            onLoadSuccess: function (data) {
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            onSelect: function (index, row) {
                $(".alarmList").remove();
                $("#bind").remove();
                var devList = row.devList;
                var orgList = row.orgList;
                var html = '<a href="javascript:void(0)" style="float:right;margin:5px;"  id="bind">设备或区域绑定</a>' + "&nbsp;" +
                    '<table class="alarmList">' +
                    '<caption>预警设备或区域明细</caption>' +
                    '<thead>' +
                    '<tr style="background:#F5F5F5;text-align: center;">' +
                    '<td style="width:20%">ID编号</td>' +
                    '<td style="width:30%">设备或区域名称</td>' +
                    '<td style="width:25%">修改时间</td>' +
                    '<td style="width:20%">创建时间</td>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody id="allList">' +
                    '</tbody>' +
                    '</table>';
                $("#pvWindow").append(html);
                $("#bind").linkbutton();
                var list = ""
                if (devList !== "") {
                    for (var i = 0; i < devList.length; i++) {
                        list += "<tr>" +
                            "<td>" + devList[i].id + "</td>" +
                            "<td>" + devList[i].meterName + "</td>" +
                            "<td>" + getFormatDate(new Date(devList[i].createTime)) + "</td>" +
                            "<td>" + getFormatDate(new Date(devList[i].modifyTime)) + "</td>" +
                            "</tr>"
                    }
                }
                ;
                if (orgList !== "") {
                    for (var i = 0; i < orgList.length; i++) {
                        list += "<tr>" +
                            "<td>" + orgList[i].id + "</td>" +
                            "<td>" + orgList[i].text + "</td>" +
                            "<td>" + row.modifyTime + "</td>" +
                            "<td>" + row.createTime + "</td>" +
                            "</tr>"
                    }
                }
                ;
                $("#allList").html(list);
            },
        });
        $(".btn").linkbutton();
    };
    var alarmForms = function () {
        $("#winform").html("");
        var html = '<div style="margin-bottom:20px">\n' +
            '            <input class="itemCode" name="itemCode" style="width:100%" data-options="label:\'监控类型:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="comparator" name="comparator" style="width:100%" data-options="label:\'比较符号:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="alarmValue" style="width:100%" data-options="label:\'监控数值:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input  class="ft" name="msgTemplate" style="width:100%" data-options="label:\'预警信息:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="status" name="status" style="width:100%"  data-options="label:\'用户状态:\',required:true">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="alarmSavebtn" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="alarmCancel" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        alarmFormInit();
    };
    var orgBindForms = function () {
        $("#winform").html("");
        var html = '<div style="margin-bottom:20px">\n' +
            '            <input class="orgName" name="orgName" style="width:100%" data-options="label:\'监控类型:\',required:true">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="bindSave" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="bindCancel" href="javascript:void(0)" class="btn" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        orgBindFormsInit();
    };
    var alarmFormInit = function () {
        $(".ft").textbox();
        $(".btn").linkbutton();
        $(".status").combobox({
            data: dict["enable"],
            editable: false,
            valueField: "value",
            textField: 'text',
        });
        $(".itemCode").combobox({
            data: dist["itemCode"],
            editable: false,
            valueField: "text",
            textField: 'text',
        });
        $(".comparator").combobox({
            data: dist["comparator"],
            editable: false,
            valueField: "text",
            textField: 'text',
        });
        $(".window-shadow").css({height: "auto"})
    };
    var orgBindFormsInit = function () {
        $(".btn").linkbutton();
        $(".orgName").combotree({
            url: "/auth/org/tree?sub=y&meter=true&_dc=" + Math.random(),
            method: "GET",
            valueField: 'id',
            textField: 'text',
            multiple: true,
            checkBox: true,
            cascadeCheck: false,
            loadFilter: function (data) {
                loadTree(data, obj);
                return data;
            },
        });
        $(".window-shadow").css({height: "auto"})
    };
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
    $("#pvWindow").off("click", "#bind").on("click", "#bind", function () {
        var row = $("#alarmDev").datagrid("getSelections");
        if (row.length == 1) {
            $("#modifyWindow").window({top: 200}).window("open");
            obj.id = row[0].id;
            obj.devs = row[0].devList;
            obj.orgs = row[0].orgList;
            orgBindForms();
        } else if (row.length == 0) {
            $('#dlg').html("请选择需要绑定的条件").dialog('open');
            return;
        } else if (row.length > 1) {
            $('#dlg').html("一次只能绑定一个条件").dialog('open');
            return;
        }
    });
    $('#winform').off("click", "#alarmSavebtn").on("click", "#alarmSavebtn", function () {
        if (isValid()) {
            obj.info = $('#winform').serializeObject();
            var url = "";
            console.log()
            if (obj.type == "add") {
                url = "/wp/alarm/condition/add";
            } else if (obj.type == "edit") {
                obj.info.id = obj.id;
                url = "/wp/alarm/condition/update";
            }
            ;
            if (obj.info.status == "启用") {
                obj.info.status = 1;
            }
            if (obj.info.status == "禁用") {
                obj.info.status = 0;
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
            ;
            console.log(obj.info)
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
};
//用电记录
var elecRecording = function () {
    clearInterval(timer);
    $(".combo-p").remove();
    $("#modifyWindow").window("close");
    $("#pvWindow").window("close");
    var excelData = [];
    var obj = {startDate: lastWeek(), endDate: getFormatDate(new Date())};
    var getData = function () {
        $("#mbody").remove();
        var html = '<div id="mbody" style="padding-right:200px">' +
            '<div style="font-size: 16px;padding:5px 24%;color:#666;text-align:center;">' + obj.name + '用电记录表</div>' +
            '<table id="dg" style="min-height:400px;width:100%;"></table>' +
            '<a href="javascript:void(0)" id="downLoadExcel" style="margin:5px 10px"  class="easyui-linkbutton" data-options="iconCls:\'icon-large-smartart\',size:\'large\',iconAlign:\'left\'">导出</a>' + "&nbsp;&nbsp;" +
            '</div>'
        $("#res").append(html);
        $('.easyui-linkbutton').linkbutton();
        $('#dg').datagrid({
            url: "/wp/query/opentime/query?limit=10000000&_dc=" + Math.random(),
            columns: [[
                {field: 'meterName', title: '设备名称', width: '13%', align: "center"},
                {field: 'orgName', title: '所属区域', width: '17%', align: "center"},
                {field: 'startTime', title: '通电时间', width: '17%', align: "center"},
                {field: 'endTime', title: '断电时间', width: '17%', align: "center"},
                {field: 'useTimeMin', title: '用时(分)', width: '6%', align: 'center'},
                {field: 'startEnergy', title: '开始抄表(Kw.h)', width: '9%', align: "center"},
                {field: 'endEnergy', title: '结束抄表(Kw.h)', width: '9%', align: "center"},
                {field: 'useEnergy', title: '能耗用量(Kw.h)', width: '8%', align: 'center'},
                {field: 'waterConversion', title: '转化量(M³)', width: '5.3%', align: 'center'},
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
                        '<td>用时(分)</td>' +
                        '<td>开始抄表</td>' +
                        '<td>结束抄表</td>' +
                        '<td>能耗用量(KW.H)</td>' +
                        '<td>转化量(M³)</td>' +
                        '<td>合计</td>' +
                        '</th>';
                    exportToexcel(excelData, this.id, str, title)
                });
            },
            onLoadError: function () {
                console.log("数据加载失败！")
            },
            queryParams: obj,
            pagination: true,
            pagePosition: "bottom",
            pageNumber: 1,
            pageSize: 12,
            singleSelect: true,
            pageList: [12, 24, 48, 96],
            loadFilter: pagerFilter,
        });
    }
    var searchOrder = function () {
        var html = "<form id='ff' mothod='post' class='ff'>" +
            '<input id="startTime"  class="easyui-datebox inputbox dt" label="开始时间:" labelPosition="Left">' + "&nbsp;&nbsp;" +
            '<input id="endTime" class="easyui-datebox inputbox  dt" label="结束时间:" labelPosition="Left">' + "&nbsp;&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            "</form>"
        $("#res").html(html);
        $('.dt').datebox({});
        $('.btn').linkbutton({});
        $("#ff").form("clear");
        $("#ff").on("click", "a", function () {
            if (this.id == "search") {
                var startTime = $("#startTime").val();
                var endTime = $("#endTime").val();
                if (Date.parse(startTime) > Date.parse(endTime)) {
                    $('#dlg').html("开始时间不能大于结束时间").dialog('open');
                    return;
                } else {
                    if (startTime !== "") {
                        startTime = getFormatDateNullTime(new Date(startTime));
                        try {
                            if (startTime.toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                                obj.startDate = startTime;
                                $('#dlg').dialog("close")
                            }
                            ;
                        } catch (e) {
                            $('#dlg').html("请输入正确的开始时间").dialog('open');
                        }
                    }
                    ;
                    if (endTime !== "") {
                        endTime = getFormatDateNullTime(new Date(endTime));
                        try {
                            if (endTime.toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/i)) {
                                obj.endDate = endTime;
                                $('#dlg').dialog("close")
                            }
                        } catch (e) {
                            $('#dlg').html("请输入正确的结束时间").dialog('open');
                        }
                    }
                    ;
                }
                $('#dg').datagrid({
                    url: "/wp/query/opentime/query?limit=1000000&_dc" + Math.random(),
                })
            } else if (this.id == "clear") {
                $("#ff").form("clear");
                obj.startDate = lastWeek();
                obj.endDate = getFormatDate(new Date());
            }
            ;
        });
    }
    searchOrder();
    treeNavLeft(getData, obj);
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
            valueField: 'value',
            textField: 'text',
        })
        $('.dt').textbox();
        $("#ff").form("clear");
    }
    modifyButtons();
    var areaForms = function () {
        var html =
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="text" style="width:100%" data-options="label:\'区域名称:\',required:true">\n' +
            '        </div>\n' +
            '       <div style="margin-bottom:20px">\n' +
            '            <input  class="pid" name="pid" label="父级区域:" labelPosition="left" style="width:100%">\n' +
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
            valueField: 'value',
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
        } else if (row.length == 0) {
            $('#dlg').html("请选择需要修改的区域").dialog('open');
            return;
        } else if (row.length > 1) {
            $('#dlg').html("一次只能修改一个区域").dialog('open');
            return;
        }
    });
    //查
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
        }
    })
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
                {field: 'status', title: '状态', width: '6%', align: "center"},
                {field: 'createDate', title: '创建日期', width: '15%', align: 'center'},
                {field: 'modifyDate', title: '修改日期', width: '15%', align: 'center'},
                {field: 'remark', title: '说明', width: '19%', align: 'center'},
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
            '<input  id="orgId" name="orgId" label="所属区域:" labelPosition="left" style="width:250px">' + '&nbsp;&nbsp;' +
            '<input id="status" name="status" label="状  态:"  labelPosition="left" style="width:200px">' + '&nbsp;&nbsp;' + '&nbsp;&nbsp;' +
            '<a href="javascript:void(0)" id="search" class="easyui-linkbutton btn" id="search" data-options="iconCls:\'icon-search\'">搜索</a>' + '&nbsp;' +
            '<a href="javascript:void(0)" id="clear" class="easyui-linkbutton btn" id="clear" data-options="iconCls:\'icon-clear\'">清空</a>' +
            '</form>'
        html += '<div id="ft" style="padding:5px 5px">' +
            '<span style="font-size: 18px;padding:0 35%;color:#666">采集器信息表</span>' +
            '<a href="javascript:void(0)" class="easyui-linkbutton" id="boxAdd" iconCls="icon-add">增加</a>' + "&nbsp;" +
            '<a href="javascript:void(0)" class="easyui-linkbutton" id="boxEdit" iconCls="icon-edit">修改</a>' + "&nbsp;" +
            //'<a href="javascript:void(0)" class="easyui-linkbutton" id="delete" iconCls="icon-remove" >删除</a>' +
            '</div>';
        $("#res").html(html);
        $('.easyui-linkbutton').linkbutton();
        $("#orgId").combotree({
            url: "/auth/org/tree?sub=y&_dc=" + Math.random(),
            method: 'GET',
            textFiled: "text",
            valueFiled: "id",
            remode: true,
        })
        $("#status").combobox({
            data: dict["enable"],
            valueField: 'value',
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
            '            <input class="ft" name="collectorConNo" style="width:100%" data-options="label:\'采集器编号:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="orgId" name="orgId" style="width:100%" data-options="label:\'所属区域:\',required:true">\n' +
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
        $(".orgId").combotree({
            url: "/auth/org/tree?_dc=" + Math.random(),
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
            valueField: 'value',
            textField: 'text',
        });
        $(".easyui-linkbutton").linkbutton();
        $(".window-shadow").css({height: "auto"})
    };
    //电表表单
    var deviceForms = function () {
        var html =
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="meterConNo" style="width:100%" data-options="label:\'表编号:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="meterName" style="width:100%" data-options="label:\'表名称:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input  class="meterKind" name="meterKind" style="width:100%" data-options="label:\'能耗类型:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input  class="meterType" name="meterType" style="width:100%" data-options="label:\'表类型:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="place" name="place" style="width:100%"   data-options="label:\'所属区域:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="coefficient" style="width:100%"   data-options="label:\'倍率:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="waterConversion" style="width:100%"   data-options="label:\'转化率:\',required:true">\n' +
            '        </div>\n' +
            '        <div style="margin-bottom:20px">\n' +
            '            <input class="ft" name="remark" style="width:100%;height:100px"   data-options="label:\'备注:\',multiline:true"">\n' +
            '        </div>\n' +
            '        <div id="savdata" style="margin-bottom:20px;text-align:right">\n' +
            '            <a id="dsavebtn" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-save\'">保存</a>\n' +
            '            <a id="dconcel" href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'">取消</a>\n' +
            '        </div>'
        $("#winform").html(html);
        deviceFormsInit();
    };
    //初始化电表表单
    var deviceFormsInit = function () {
        $(".easyui-linkbutton").linkbutton();
        $(".ft").textbox();
        $(".meterType").combobox({
            data: dict["metertype"],
            valueField: 'value',
            textField: 'text',
        });
        $(".meterKind").combobox({
            data: dict["meterkind"],
            valueField: 'value',
            textField: 'text',
        });
        $(".place").combotree({
            url: "/auth/org/tree?_dc=" + Math.random(),
            method: 'GET',
            valueField: "text",
            textField: 'text',
        });
        $(".window-shadow").css({height: "auto"})
    };
    $("#res").off("click", "#deviceInfo a").on("click", "#deviceInfo a", function () {
        obj.type = this.id;
        if (obj.type == "add") {
            $("#modifyWindow").window({top: 200}).window("open");
            deviceForms();
        } else if (obj.type == "edit") {
            var row = $("#deviceList").datagrid("getSelections");
            if (row.length == 1) {
                $("#modifyWindow").window({top: 200}).window("open");
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
            if (obj.info.meterKind == "电表") {
                obj.info.meterKind = "E"
            } else if (obj.info.meterKind == "流量表") {
                obj.info.meterKind = "F"
            } else if (obj.info.meterKind == "天然气表") {
                obj.info.meterKind = "G"
            } else if (obj.info.meterKind == "温度表") {
                obj.info.meterKind = "T"
            } else if (obj.info.meterKind == "水表") {
                obj.info.meterKind = "W"
            }
            ;
            if (obj.info.meterType == "三相电表") {
                obj.info.meterType = "E-A"
            } else if (obj.info.meterType == "单相多功能导轨") {
                obj.info.meterType = "E-B"
            } else if (obj.info.meterType == "单相直流多功能") {
                obj.info.meterType = "E-ZB"
            } else if (obj.info.meterType == "直读水表") {
                obj.info.meterType = "W-1"
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
                        {field: 'meterKind', title: '能耗类型', width: "8%", align: "center"},
                        //{field: 'meterName', title: '设备名称', width: "10%", align: "center"},
                        {field: 'meterType', title: '表类型', width: "6%", align: "center"},
                        {field: 'collectorId', title: '所属采集器', width: "6%", align: "center"},
                        //{field: 'districtid', title: '上一级表', width: "10%", align: "center"},
                        {field: 'coefficient', title: '倍率', width: "5%", align: "center"},
                        {field: 'waterConversion', title: '转化率', width: "5%", align: "center"},
                        //{field: 'boxPort', title: '采集端口', width: "5%", align: "center"},
                        //{field: 'levelNum', title: '设备级数', width: "5%", align: "center"},
                        {field: 'modifyTime', title: '修改时间', width: "15%", align: 'center'},
                        {field: 'createTime', title: '创建时间', width: "15%", align: 'center'},
                        {field: 'remark', title: '备注', width: "6%", align: 'center'}
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
                            deviceData[i].waterConversion = tempData[i].waterConversion !== undefined ? tempData[i].waterConversion : "NULL";
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
            valueField: 'value',
            textField: 'text',
        })
        $(".time").datetimebox()
        $('.dt').textbox();
        $("#ff").form("clear");
    }
    modifyButtons();
    //加载区域信息表
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
            valueField: "value",
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
    //用户增
    $("#uadd").click(function () {
        obj.type = this.id;
        $("#modifyWindow").window({
            top: 200,
            height: "auto",
        }).window("open");
        userForms();
        $('#winform').form("clear");
    });
    //用户改
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
}
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
        } else if (data == "设备预警") {
            alarmReport();
        } else if (data == "区域管理") {
            areaManager();
        } else if (data == "设备管理") {
            deviceManager();
        } else if (data == "用户管理") {
            userManager()
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



