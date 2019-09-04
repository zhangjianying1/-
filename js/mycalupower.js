apiready = function() {
    var app = new APP();
    var account = app.getAccount();
    var cointype = "BTC" //矿机种类
    var WorkNewType = "ALL"; //选择矿机挖矿类型
    var workStatusNew = "ALL"; //矿机的状态
    var durationDay = ""; //矿机的期限
    var orderTypes = ""; //订单类型
    var allTypeComputing = ""; //保存请求到的数据
    var inviterPower = {}; //邀请总算力
    var total_page = 0;
    var currentPage = 1;
    var refour = /([0-9]+\.[0-9]{8})[0-9]*/;
    var powerUnit = "T" //单位

    var drawPage = function(targetArr) {
        var temp = doT.template($("#md").text());
        $("#box").html(temp(targetArr));
    };

    function loadPage(page, coinType, type, workType, durationDay, orderTypes, isdown) {
        // $(".fixedText").hide();
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "machine/rentedList",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        page: page,
                        size: 2,
                        currency_name: coinType,
                        type: type,
                        work_type: workType,
                        date_type: durationDay,
                        pay_type: orderTypes

                    }
                },
                callback: function(ret, err) {
                    app.log(
                        "页面加载数据+++++++++++++++++++++++++",
                        JSON.stringify(ret)
                    );
                    app.stopRefresh();
                    if (ret.code == 1) {
                        var addlist = ret.rented_list;
                        total_page = ret.total_page;
                        if (ret.regular_will_end == 1) {
                            $(".fixedText").show();
                        } else {
                            $(".fixedText").hide();
                        }
                        ret.rented_list.map(function(item) {
                            if (item.pay_currency == 'USDT') {
                                item.total_deposit = item.total_deposit_coin
                            }
                            if (cointype == "BTC") {
                                item.rentpowerUnit = "T";
                            } else {
                                item.rentpowerUnit = "M";
                            }
                            if (item.is_regular == 0) {
                                item.regularText = "活期";
                            } else {
                                item.regularText = "定期";
                            }
                            if (item.regular_end_date) {
                                //指定时间的时间戳(s)
                                var operTime = app.toSecond(item.regular_end_date);
                                //返回当前时间的时间戳(s)
                                var nowThisTime = app.getCurStamp();
                                var isShowEnd = operTime - nowThisTime;
                                if (item.is_regular != 0 && isShowEnd < 604800) {
                                    item.showEnd = true;
                                }
                                if (nowThisTime > operTime) {
                                    item.showEnd = false;
                                }
                            }
                            var showBhpcPay =
                                item.total_deposit_coin.split(".")[0] +
                                "." +
                                item.total_deposit_coin.split(".")[1].slice(0, 2);
                            item.base_power = Number(item.base_power);
                            item.total_deposit = Number(item.total_deposit);
                            item.total_deposit_coin = showBhpcPay;
                            item.total_power =
                                Number(item.base_power) * Number(item.num);
                            item.regular_power = Number(item.regular_power);
                            item.computing_power = Number(item.computing_power);
                            item.pe_power = Number(item.pe_power);
                            item.num = Number(item.num);
                            item.total_regular_power = app.accMul(
                                app.moreAccAdd(
                                    item.float_power,
                                    item.futures_power,
                                    item.regular_power,
                                    item.coupon_power,
                                    item.pe_power,
                                    item.td_power
                                ),
                                item.num
                            );
                            item.total_power = app.accMul(
                                item.computing_power,
                                item.num
                            );
                            item.total_base_power = app.accMul(
                                item.base_power,
                                item.num
                            );
                            if (item.dragStatus == 1) {
                                item.textColor = "#42aa79"; //挖矿中
                            } else if (item.dragStatus == 0) {
                                item.textColor = "#f3933a"; //待挖
                            } else {
                                item.textColor = "#B8B8B6";
                            }
                        })
                        var temp = doT.template($("#ul_list").text());
                        if (isdown) {
                            $("#outcoinlist").html(temp(ret.rented_list));
                        } else {
                            $("#outcoinlist").append(temp(ret.rented_list));
                        }
                        if (currentPage == 1 && ret.rented_list.length == 0) {
                            $("#listState").text("暂时没有相关数据");
                        }
                        if (currentPage == total_page && total_page != 0) {
                            $("#listState").text("没有更多了");
                        }
                    }
                },
                extra: {
                    isflower: true
                }
            }
        });
    };

    function addAllPower(chooseItem, data, inviterPower) {
        if (chooseItem != "BTC") {
            powerUnit = "M"
        } else {
            powerUnit = "T"
        }
        loadPage(currentPage, chooseItem, WorkNewType, workStatusNew, durationDay, orderTypes, true);
        if (chooseItem == "BTC") {
            var btcSendPower = app.moreAccAdd(data.BTC.coupon_power, data.BTC.float_power, data.BTC.pe_power, data.BTC.regular_power, data.BTC.td_power, data.BTC.futures_power);
            var btcTotolPower = app.moreAccAdd(btcSendPower, data.BTC.base_power, inviterPower.btc);
            $(".totalPower").text(btcTotolPower + " " + powerUnit);
            $(".basePowerAll").text(Number(data.BTC.base_power) + powerUnit);
            $(".sendPowerAll").text(Number(btcSendPower) + powerUnit);
            $(".incomeNum").text(data.BTC.income_num.replace(refour, "$1"));
            $(".invitationPower").text(inviterPower.btc + powerUnit);
            return
        }
        if (chooseItem == "ETH") {
            var ethSendPower = app.moreAccAdd(data.ETH.coupon_power, data.ETH.float_power, data.ETH.pe_power, data.ETH.regular_power, data.ETH.td_power, data.ETH.futures_power);
            var ethTotolPower = app.moreAccAdd(ethSendPower, data.ETH.base_power, inviterPower.eth);
            $(".totalPower").text(ethTotolPower + " " + powerUnit);
            $(".basePowerAll").text(Number(data.ETH.base_power) + powerUnit);
            $(".sendPowerAll").text(Number(ethSendPower) + powerUnit);
            $(".incomeNum").text(data.ETH.income_num.replace(refour, "$1"));
            $(".invitationPower").text(inviterPower.eth + powerUnit);
            return
        }
        if (chooseItem == "LTC") {
            var ltcSendPower = app.moreAccAdd(data.LTC.coupon_power, data.LTC.float_power, data.LTC.pe_power, data.LTC.regular_power, data.LTC.td_power, data.LTC.futures_power);
            var ltcTotolPower = app.moreAccAdd(ltcSendPower, data.LTC.base_power, inviterPower.ltc);
            $(".totalPower").text(ltcTotolPower + " " + powerUnit);
            $(".basePowerAll").text(Number(data.LTC.base_power) + powerUnit);
            $(".sendPowerAll").text(Number(ltcSendPower) + powerUnit);
            $(".incomeNum").text(data.LTC.income_num.replace(refour, "$1"));
            $(".invitationPower").text(inviterPower.ltc + powerUnit);
            return
        }
    };

    function getData() {
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "wallet/contactPower",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token
                    }
                },
                callback: function(ret, err) {
                    app.log("我的算力", JSON.stringify(ret));
                    app.stopRefresh();
                    if (ret.code == 1) {
                        forceNumber = ret.total_power == 0 ? "0.00" : ret.total_power;
                        $(".numPower").text(
                            ret.total_power == 0 ? "0.00 T*天" : ret.total_power + " T*天"
                        );
                        allTypeComputing = ret.data;
                        inviterPower = ret.inviter_power;
                        addAllPower("BTC", ret.data, ret.inviter_power);
                    }
                }
            },
            extra: {
                isflower: true
            }
        });
    }
    getData();
    $("#showSendPower").on("click", function() {
        if (cointype == "BTC") {
            var param = {
                dtype: "dialog281",
                data: {
                    floatpower: allTypeComputing.BTC.float_power + powerUnit,
                    pepower: allTypeComputing.BTC.pe_power + powerUnit,
                    hopepower: allTypeComputing.BTC.futures_power + powerUnit,
                    setdatepower: allTypeComputing.BTC.regular_power + powerUnit,
                    couponpower: allTypeComputing.BTC.coupon_power + powerUnit,
                    totalpower: app.moreAccAdd(allTypeComputing.BTC.coupon_power, allTypeComputing.BTC.float_power, allTypeComputing.BTC.pe_power, allTypeComputing.BTC.regular_power, allTypeComputing.BTC.td_power, allTypeComputing.BTC.futures_power) + powerUnit,
                    tdatepower: allTypeComputing.BTC.td_power + powerUnit
                }
            };
            app.dialog(param);
            return
        }
        if (cointype == "ETH") {
            var param = {
                dtype: "dialog281",
                data: {
                    floatpower: allTypeComputing.ETH.float_power + powerUnit,
                    pepower: allTypeComputing.ETH.pe_power + powerUnit,
                    hopepower: allTypeComputing.ETH.futures_power + powerUnit,
                    setdatepower: allTypeComputing.ETH.regular_power + powerUnit,
                    couponpower: allTypeComputing.ETH.coupon_power + powerUnit,
                    totalpower: app.moreAccAdd(allTypeComputing.ETH.coupon_power, allTypeComputing.ETH.float_power, allTypeComputing.ETH.pe_power, allTypeComputing.ETH.regular_power, allTypeComputing.ETH.td_power, allTypeComputing.ETH.futures_power) + powerUnit,
                    tdatepower: allTypeComputing.ETH.td_power + powerUnit
                }
            };
            app.dialog(param);
            return
        }
        if (cointype == "LTC") {
            var param = {
                dtype: "dialog281",
                data: {
                    floatpower: allTypeComputing.LTC.float_power + powerUnit,
                    pepower: allTypeComputing.LTC.pe_power + powerUnit,
                    hopepower: allTypeComputing.LTC.futures_power + powerUnit,
                    setdatepower: allTypeComputing.LTC.regular_power + powerUnit,
                    couponpower: allTypeComputing.LTC.coupon_power + powerUnit,
                    totalpower: app.moreAccAdd(allTypeComputing.LTC.coupon_power, allTypeComputing.LTC.float_power, allTypeComputing.LTC.pe_power, allTypeComputing.LTC.regular_power, allTypeComputing.LTC.td_power, allTypeComputing.LTC.futures_power) + powerUnit,
                    tdatepower: allTypeComputing.LTC.td_power + powerUnit
                }
            };
            app.dialog(param);
            return
        }
    });
    $(".showCoinKind li").on("click", function() {
        cointype = $(this).attr("data-value").trim();
        $(".showCoinKind li").css("backgroundColor", "#fff");
        $(this).css("backgroundColor", "#ffd203");
        $("#outcoinlist").empty();
        currentPage = 1;
        total_page = 0;
        $("body").scrollTop(0);
        addAllPower(cointype, allTypeComputing, inviterPower);
    });

    $("#outcoinlist").on("click", "li>b>.contractText", function(event) {
        event.stopPropagation();
        var oriderID = $(this).attr("data-orderId");
        app.ajaxNew("machine/contract", {
                uid: account.uid,
                token: account.token,
                order_id: oriderID
            }, true,
            function(ret) {
                if (ret.code == 1) {
                    var param = {
                        dtype: "dialog39",
                        data: {
                            oriderID: oriderID,
                            title: ret.name,
                            orderText: ret.content,
                            btns: [{
                                name: "关闭",
                                event: "closeText"
                            }],
                            extra: {}
                        }
                    };
                    app.dialog(param);
                } else {
                    app.toast(ret.desc)
                }
            })
    });

    $("#helpdetail").click(function(e) {
        var param = {
            dtype: "dialog20",
            forceNumber: forceNumber
        };
        app.dialog(param);
    });
    var distanceTop = Number($(".machineListChoose").prop("offsetTop"));
    $(function() {
        var win = $(window); //得到窗口对象
        var sc = $(document); //得到document文档对象。
        win.scroll(function() {
            if (sc.scrollTop() >= distanceTop) {
                $(".machineListChoose").addClass("fix");
            } else {
                $(".machineListChoose").removeClass("fix");
            }

        });
    });
    $("#showBank").click(function(params) {
        app.uiActionSelector.open({
            datas: [{
                id: 'ALL',
                name: '全部类型'
            }, {
                id: 'PT',
                name: '单币'
            }, {
                id: 'SW',
                name: '双挖'
            }],
            layout: {
                row: 5,
                col: 1,
                height: 30,
                size: 16,
                sizeActive: 20,
                rowSpacing: 5,
                colSpacing: 10,
                maskBg: 'rgba(0,0,0,0.2)',
                bg: '#fff',
                color: '#888',
                colorActive: '#000',
                colorSelected: '#000'
            },
            animation: true,
            cancel: {
                text: '取消',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            ok: {
                text: '确定',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            title: {
                text: '',
                size: 12,
                h: 44,
                bg: '#eee',
                color: '#888'
            },
            fixedOn: "mycalupower"
        }, function(ret, err) {
            if (ret && ret.eventType == "ok") {
                WorkNewType = ret.selectedInfo[0].id
                $("#showBank").text(ret.level1);
                currentPage = 1;
                total_page = 0;
                $("#outcoinlist").empty();
                $("#listState").text("");
                loadPage(currentPage, cointype, ret.selectedInfo[0].id, workStatusNew, durationDay, orderTypes, true);
            }
        });
    });
    $("#chooseReTypeOut").click(function(params) {
        app.uiActionSelector.open({
            datas: [{
                id: 'ALL',
                name: '全部状态'
            }, {
                id: 'KW',
                name: '在挖'
            }, {
                id: 'DW',
                name: '待挖'
            }, {
                id: 'TZ',
                name: '退单'
            }],
            layout: {
                row: 5,
                col: 1,
                height: 30,
                size: 16,
                sizeActive: 20,
                rowSpacing: 5,
                colSpacing: 10,
                maskBg: 'rgba(0,0,0,0.2)',
                bg: '#fff',
                color: '#888',
                colorActive: '#000',
                colorSelected: '#000'
            },
            animation: true,
            cancel: {
                text: '取消',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            ok: {
                text: '确定',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            title: {
                text: '',
                size: 12,
                h: 44,
                bg: '#eee',
                color: '#888'
            },
            fixedOn: "mycalupower"
        }, function(ret, err) {
            if (ret && ret.eventType == "ok") {
                workStatusNew = ret.selectedInfo[0].id;
                currentPage = 1;
                total_page = 0;
                $("#outcoinlist").empty();
                $("#listState").text("");
                $("#chooseReTypeOut").text(ret.level1);
                loadPage(currentPage, cointype, WorkNewType, ret.selectedInfo[0].id, durationDay, orderTypes, true);
            }
        });
    });


    $("#durationDays").click(function(params) {
        app.uiActionSelector.open({
            datas: [{
                id: '',
                name: '全部'
            }, {
                id: 'H',
                name: '30天'
            }, {
                id: 'T',
                name: '90天'
            }, {
                id: 'S',
                name: '180天'
            }],
            layout: {
                row: 5,
                col: 1,
                height: 30,
                size: 16,
                sizeActive: 20,
                rowSpacing: 5,
                colSpacing: 10,
                maskBg: 'rgba(0,0,0,0.2)',
                bg: '#fff',
                color: '#888',
                colorActive: '#000',
                colorSelected: '#000'
            },
            animation: true,
            cancel: {
                text: '取消',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            ok: {
                text: '确定',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            title: {
                text: '',
                size: 12,
                h: 44,
                bg: '#eee',
                color: '#888'
            },
            fixedOn: "mycalupower"
        }, function(ret, err) {
            if (ret && ret.eventType == "ok") {
                durationDay = ret.selectedInfo[0].id;
                currentPage = 1;
                total_page = 0;
                $("#outcoinlist").empty();
                $("#listState").text("");
                $("#durationDays").text(ret.level1);
                loadPage(currentPage, cointype, WorkNewType, workStatusNew, ret.selectedInfo[0].id, orderTypes, true);
            }
        });
    });
    $("#orderTypes").click(function(params) {
        app.uiActionSelector.open({
            datas: [{
                id: '',
                name: '全部'
            }, {
                id: 'P',
                name: '购买'
            }, {
                id: 'S',
                name: '承接'
            }],
            layout: {
                row: 5,
                col: 1,
                height: 30,
                size: 16,
                sizeActive: 20,
                rowSpacing: 5,
                colSpacing: 10,
                maskBg: 'rgba(0,0,0,0.2)',
                bg: '#fff',
                color: '#888',
                colorActive: '#000',
                colorSelected: '#000'
            },
            animation: true,
            cancel: {
                text: '取消',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            ok: {
                text: '确定',
                size: 15,
                w: 90,
                h: 35,
                bg: '#eee',
                color: '#000',
                colorActive: '#000'
            },
            title: {
                text: '',
                size: 12,
                h: 44,
                bg: '#eee',
                color: '#888'
            },
            fixedOn: "mycalupower"
        }, function(ret, err) {
            if (ret && ret.eventType == "ok") {
                orderTypes = ret.selectedInfo[0].id;
                currentPage = 1;
                total_page = 0;
                $("#outcoinlist").empty();
                $("#listState").text("");
                $("#orderTypes").text(ret.level1);
                loadPage(currentPage, cointype, WorkNewType, workStatusNew, durationDay, ret.selectedInfo[0].id, true);
            }
        });
    });
    $("#outcoinlist").on("click", "li", function() {
        var cointypecontract = {
            page: "common/headerwin",
            name: "forcedetail_headerwin",
            param: {
                subpage: "my/forcedetail",
                name: "forcedetail",
                title: "合约包详情",
                id: $(this).data("machineid"),
                status: $(this).data("machinestatus"),
                isShow: $(this).data("show"),
                isshowText: $(this).data("showtext"),
                ischeckVoucher: $(this).data("checkVoucher"),
                orderId: $(this).attr("data-orderId"),
                textColor: $(this).attr("data-textColor"),
                machineState: $(this).attr("data-dragStatus"),
                cointype: cointype
            }
        };
        var recoinNumber = JSON.stringify(cointypecontract);
        app.goPushPage(recoinNumber);
    });

    function relaodData(cointype) {
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "wallet/contactPower",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token
                    }
                },
                callback: function(ret, err) {
                    app.log("我的算力", JSON.stringify(ret));
                    app.stopRefresh();
                    if (ret.code == 1) {
                        forceNumber = ret.total_power == 0 ? "0.00" : ret.total_power;
                        $(".numPower").text(
                            ret.total_power == 0 ? "0.00 T*天" : ret.total_power + " T*天"
                        );
                        allTypeComputing = ret.data;
                        if (cointype != "BTC") {
                            powerUnit = "M"
                        } else {
                            powerUnit = "T"
                        }
                        if (cointype == "BTC") {
                            var btcSendPower = app.moreAccAdd(ret.data.BTC.coupon_power, ret.data.BTC.float_power, ret.data.BTC.pe_power, ret.data.BTC.regular_power, ret.data.BTC.td_power, ret.data.BTC.futures_power);
                            $(".basePowerAll").text(Number(ret.data.BTC.base_power) + powerUnit);
                            $(".sendPowerAll").text(Number(btcSendPower) + powerUnit);
                            $(".incomeNum").text(ret.data.BTC.income_num.replace(refour, "$1"));
                            return
                        }
                        if (cointype == "ETH") {
                            var ethSendPower = app.moreAccAdd(ret.data.ETH.coupon_power, ret.data.ETH.float_power, ret.data.ETH.pe_power, ret.data.ETH.regular_power, ret.data.ETH.td_power, ret.data.ETH.futures_power);
                            $(".basePowerAll").text(Number(ret.data.ETH.base_power) + powerUnit);
                            $(".sendPowerAll").text(Number(ethSendPower) + powerUnit);
                            $(".incomeNum").text(ret.data.ETH.income_num.replace(refour, "$1"))
                            return
                        }
                        if (cointype == "LTC") {
                            var ltcSendPower = app.moreAccAdd(ret.data.LTC.coupon_power, ret.data.LTC.float_power, ret.data.LTC.pe_power, ret.data.LTC.regular_power, ret.data.LTC.td_power, ret.data.LTC.futures_power);
                            $(".basePowerAll").text(Number(ret.data.LTC.base_power) + powerUnit);
                            $(".sendPowerAll").text(Number(ltcSendPower) + powerUnit);
                            $(".incomeNum").text(ret.data.LTC.income_num.replace(refour, "$1"));
                            return
                        }
                    }
                }
            },
            extra: {
                isflower: false
            }
        });
    }
    app.downRefresh(function() {
        $("#outcoinlist").empty();
        $("body").scrollTop(0);
        currentPage = 1;
        relaodData(cointype);
        loadPage(currentPage, cointype, WorkNewType, workStatusNew, durationDay, orderTypes, true);
    });
    app.toBottom(function() {
        if (currentPage < total_page) {
            currentPage++;
            loadPage(currentPage, cointype, WorkNewType, workStatusNew, durationDay, orderTypes, false);
        }
    });
    var event = ["renew_success", "relet_success", "stop_rent_success", "transferSe"];
    app.listen(event, function() {
        app.reload();
    });
}