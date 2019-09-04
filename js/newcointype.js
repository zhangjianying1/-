apiready = function() {
    var app = new APP();
    var account = app.getAccount();
    var cointype = api.pageParam.coinname ? api.pageParam.coinname : "BTC"; //矿机种类
    var WorkNewType = "ALL"; //选择矿机挖矿类型
    var workStatusNew = "ALL"; //矿机的状态
    var allTypeComputing = ""; //保存请求到的数据
    var total_page = 0;
    var currentPage = 1;
    var refour = /([0-9]+\.[0-9]{8})[0-9]*/;
    var powerUnit = "T" //单位

    var drawPage = function(targetArr) {
        var temp = doT.template($("#md").text());
        $("#box").html(temp(targetArr));
    };

    function loadPage(page, cointype, type, workType, isdown) {
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
                        currency_name: cointype,
                        type: type,
                        work_type: workType

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
    loadPage(currentPage, cointype, WorkNewType, workStatusNew, true);
    $("#helpdetail").click(function(e) {
        var param = {
            dtype: "dialog20",
            forceNumber: forceNumber
        };
        app.dialog(param);
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
                            $(".incomeNum").text(ret.data.LTC.income_num.replace(refour, "$1"))
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
        loadPage(currentPage, cointype, WorkNewType, workStatusNew, true);
    });
    app.toBottom(function() {
        if (currentPage < total_page) {
            currentPage++;
            loadPage(currentPage, cointype, WorkNewType, workStatusNew, false);
        }
    });

    var event = ["renew_success", "relet_success", "stop_rent_success"];
    app.listen(event, function() {
        app.reload();
    });

}