apiready = function() {
    var app = new APP();
    var account = app.getAccount();
    var showBhpc = api.pageParam.bhpcisshow;
    var macchineId = api.pageParam.machineID;
    var coinType = api.pageParam.coinType;
    var limitRentUnit = " T";
    var orderID; //机器ID
    var person; //保存数据
    var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
    var reTwo = /([0-9]+\.[0-9]{0,2})[0-9]*/;

    function loadPage() {
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "machine/rentedDetail",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        currency_name: coinType,
                        id: macchineId
                    }
                },
                callback: function(ret, err) {
                    app.log("续单页面数据+++++++++++++++++++++", ret);
                    if (ret.code == 1) {
                        var machdata = ret.data;
                        person = ret.renewal_info;
                        var dataDays = person.new_90;
                        orderID = machdata.id;
                        if (Number(ret.data.is_switch) == 1) {
                            $(".unitPrice").text(
                                ret.data.pay_currency == "USDT" ? ret.data.continue_total_deposit_coin
                                .replace(refour, "$1") : ret.data.continue_total_deposit_coin.replace(
                                    reTwo, "$1")
                            );
                        } else {
                            $(".unitPrice").text(
                                ret.data.pay_currency == "USDT" ? ret.data.total_deposit_coin.replace(
                                    refour, "$1") : Number(ret.data.total_deposit)
                            );
                        }
                        var myMoney;
                        var needMonney;
                        var arriveTimeSeco = app.toSecond(machdata.regular_end_date) * 1000;
                        if (machdata.currency_name != "BTC") {
                            limitRentUnit = " M";
                        }
                        $(".payMethod").text(machdata.pay_currency);
                        var getChooseData = "90天";
                        if (account && account.token) {
                            app.getProperties(function(ret) {
                                myMoney = Number(ret.wallet_detail.rmb);
                                myBcny = Number(ret.wallet_detail.bcny.total_price);
                                needMonney = Number(person.need_add_money);
                                $("#chooseRentType").on("click", function(params) {
                                    app.sheet({
                                            cancelTitle: "取消",
                                            buttons: ["90天", "180天"]
                                        },
                                        function(ret, err) {
                                            var buttons = ["90天", "180天"];
                                            var chooseMonth = buttons[ret.buttonIndex - 1];
                                            getChooseData = buttons[ret.buttonIndex - 1];
                                            var index = ret.buttonIndex;
                                            var checkInput = $("input[type='checkbox']").is(
                                                ":checked"
                                            );
                                            var checkRuler = $("#shownewRuler").attr("data-show");
                                            if (index == 1) {
                                                $("#chooseRentType").attr("data-choose", "90");
                                                $(".contanDays").text("90 天");
                                                $(".arriveTime").text(
                                                    app.showdateArr(arriveTimeSeco, 90)
                                                );
                                                dataDays = person.new_90;
                                                $(".chooseText").text(
                                                    dataDays.computing_power + limitRentUnit
                                                );
                                                if (checkRuler == "true") {
                                                    if (checkInput == false) {
                                                        dataDays = person.old_90;
                                                        $(".chooseText").text(
                                                            dataDays.computing_power + limitRentUnit
                                                        );
                                                    } else {
                                                        dataDays = person.new_90;
                                                        $(".chooseText").text(
                                                            dataDays.computing_power + limitRentUnit
                                                        );
                                                    }
                                                }
                                            }
                                            if (index == 2) {
                                                $("#chooseRentType").attr("data-choose", "180");
                                                $(".contanDays").text("180 天");
                                                $(".arriveTime").text(
                                                    app.showdateArr(arriveTimeSeco, 180)
                                                );
                                                dataDays = person.new_180;
                                                $(".chooseText").text(
                                                    dataDays.computing_power + limitRentUnit
                                                );
                                                if (checkRuler == "true") {
                                                    if (checkInput == false) {
                                                        dataDays = person.old_180;
                                                        $(".chooseText").text(
                                                            dataDays.computing_power + limitRentUnit
                                                        );
                                                    } else {
                                                        dataDays = person.new_180;
                                                        $(".chooseText").text(
                                                            dataDays.computing_power + limitRentUnit
                                                        );
                                                    }
                                                }
                                            }
                                            $("#chooseText").text(chooseMonth);
                                            subMonth = $("#chooseRentType").attr("data-choose");
                                        }
                                    );
                                });
                                if (myMoney < needMonney && machdata.pay_currency == "CNY") {
                                    $("#shownewRuler").show();
                                    $(".showTips").show();
                                    $("#shownewRuler").attr("data-show", "true");
                                    $("input[type='checkbox']").attr("checked", "checked");
                                    dataDays = person.new_90;
                                    return
                                }
                                if (myBcny < needMonney && machdata.pay_currency == "BCNY") {
                                    console.log("BCNY");
                                    $(".showTips").show();
                                    $("#shownewRuler").show();
                                    $("#shownewRuler").attr("data-show", "true");
                                    $("input[type='checkbox']").attr("checked", "checked");
                                    dataDays = person.new_90;
                                    return
                                }
                                if ((myMoney >= needMonney && machdata.pay_currency == "CNY") || (myBcny >= needMonney && machdata.pay_currency == "BCNY")) {
                                    dataDays = person.new_90;
                                    $("#shownewRuler").hide();
                                    $(".showTips").hide();
                                }
                            });
                        }
                        if (person.need_add_money == 0) {
                            $("#shownewRuler").hide();
                            $(".showImg").hide();
                            $("#spread").unbind("click");
                        } else {
                            $("#spread").bind("click");
                        }
                        $("#spread").on("click", function(params) {
                            var showImg = Number($(".needMoney").text());
                            if (showImg != 0) {
                                var newpresen =
                                    app
                                    .accMul(
                                        app.accDiv(
                                            dataDays.base_power,
                                            dataDays.computing_power
                                        ),
                                        100
                                    )
                                    .toFixed(2) + " %";
                                var nowPower = app.accAdd(
                                    person.need_add_money,
                                    machdata.total_deposit
                                );
                                var param = {
                                    dtype: "dialog23",
                                    data: {
                                        spread: person.need_add_money + "  " + machdata.pay_currency,
                                        nowPrice: nowPower + "  " + machdata.pay_currency,
                                        originalPrice: machdata.total_deposit + "  " + machdata.pay_currency,
                                        nowPower: newpresen
                                    }
                                };
                                app.dialog(param);
                            }
                        });

                        $("#hashrate").on("click", function(params) {
                            var param = {
                                dtype: "dialog22",
                                data: {
                                    newAllPower: dataDays.computing_power + limitRentUnit,
                                    powerList: [{
                                            name: "基础算力",
                                            Power: dataDays.base_power + limitRentUnit
                                        },
                                        {
                                            name: "浮动算力",
                                            Power: dataDays.float_power + limitRentUnit
                                        },
                                        {
                                            name: "达标算力",
                                            Power: (Number(dataDays.pe_power) == 0 ? "0.00" : dataDays.pe_power) + limitRentUnit
                                        },
                                        {
                                            name: "期货算力",
                                            Power: dataDays.futures_power + limitRentUnit
                                        },
                                        {
                                            name: "定期算力",
                                            Power: dataDays.regular_power + limitRentUnit
                                        }
                                    ]
                                }
                            };
                            app.dialog(param);
                        });
                        $(".contanDays").text("90 天");
                        $("#chooseNewRuler").on("click", function() {
                            var checkInput = $("input[type='checkbox']").is(":checked");
                            var dataMonth = $("#chooseRentType").attr("data-choose");
                            if (checkInput == true && dataMonth == 90) {
                                dataDays = person.new_90;
                                $(".chooseText").text(
                                    person.new_90.computing_power + limitRentUnit
                                );
                                $(".needMoney").text(
                                    person.need_add_money == 0 ? "0.00" : person.need_add_money
                                );
                                $(".showImg").show();
                                $(".showTips").show();
                                return
                            }
                            if (checkInput == false && dataMonth == 90) {
                                dataDays = person.old_90;
                                $(".chooseText").text(
                                    person.old_90.computing_power + limitRentUnit
                                );
                                $(".needMoney").text("0.00");
                                $(".showImg").hide();
                                $(".showTips").hide();
                                return
                            }
                            if (checkInput == true && dataMonth == 180) {
                                dataDays = person.new_180;
                                $(".chooseText").text(
                                    person.new_180.computing_power + limitRentUnit
                                );
                                $(".needMoney").text(
                                    person.need_add_money == 0 ? "0.00" : person.need_add_money
                                );
                                $(".showImg").show();
                                $(".showTips").show();
                                return
                            }
                            if (checkInput == false && dataMonth == 180) {
                                dataDays = person.old_180;
                                $(".chooseText").text(
                                    person.old_180.computing_power + limitRentUnit
                                );
                                $(".needMoney").text("0.00");
                                $(".showImg").hide();
                                $(".showTips").hide();
                            }
                        });
                        $(".chooseText").text(dataDays.computing_power + limitRentUnit);
                        $(".arriveTime").text(app.showdateArr(arriveTimeSeco, 90));
                        $(".machineName").text(machdata.name);
                        $(".needMoney").text(
                            person.need_add_money == 0 ? "0.00" : person.need_add_money
                        );
                        if (showBhpc == "BHPC" || showBhpc == "BHP") {
                            $(".renMoney").text(person.need_add_money);
                        } else if (showBhpc == "USDT") {
                            $(".renMoney").text(ret.data.total_deposit_coin.replace(refour, "$1"));
                        } else {
                            $(".renMoney").text(
                                app.accAdd(person.need_add_money, machdata.total_deposit)
                            );
                        }
                        $(".paowersuan").text(machdata.computing_power + limitRentUnit);
                        $("#checkRent").on("click", function() {
                            var moneytext = Number($(".needMoney").text());
                            if (moneytext > myMoney && machdata.pay_currency == "CNY") {
                                var param = {
                                    dtype: "dialog21",
                                    data: {
                                        text: "你当前余额不足,",
                                        text1: "新政策用户算力最高80%",
                                        text2: "请充值后补齐差价后再续单",
                                        btns: [{
                                                name: "取消",
                                                event: "cancel_recharge"
                                            },
                                            {
                                                name: "去充值",
                                                event: "sure_recharge"
                                            }
                                        ]
                                    }
                                };
                                app.dialog(param);
                                return
                            }
                            if (moneytext > myBcny && machdata.pay_currency == "BCNY") {
                                var param = {
                                    dtype: "dialog21",
                                    data: {
                                        text: "你当前BCNY余额不足,",
                                        text1: "新政策用户算力最高80%",
                                        text2: "请充值后补齐差价后再续单",
                                        btns: [{
                                                name: "取消",
                                                event: "cancel_recharge"
                                            },
                                            {
                                                name: "去兑换",
                                                event: "sure_rechargeBcny"
                                            }
                                        ]
                                    }
                                };
                                app.dialog(param);
                                return
                            }
                            if (moneytext <= myBcny && machdata.pay_currency == "BCNY") {
                                var param = {
                                    dtype: "dialog1",
                                    data: {
                                        text: "亲,你确定要续单" + getChooseData + "吗？",
                                        btns: [{
                                                name: "我要续单",
                                                event: "ok_renew"
                                            },
                                            {
                                                name: "残忍拒绝",
                                                event: "stop_renew"
                                            }
                                        ]
                                    }
                                };
                                app.dialog(param);
                                return
                            }
                            if (moneytext <= myMoney && machdata.pay_currency == "CNY") {
                                var param = {
                                    dtype: "dialog1",
                                    data: {
                                        text: "亲,你确定要续单" + getChooseData + "吗？",
                                        btns: [{
                                                name: "我要续单",
                                                event: "ok_renew"
                                            },
                                            {
                                                name: "残忍拒绝",
                                                event: "stop_renew"
                                            }
                                        ]
                                    }
                                };
                                app.dialog(param);
                                return
                            }
                            if (moneytext <= myMoney && machdata.pay_currency == "USDT") {
                                var param = {
                                    dtype: "dialog1",
                                    data: {
                                        text: "亲,你确定要续单" + getChooseData + "吗？",
                                        btns: [{
                                                name: "我要续单",
                                                event: "ok_renew"
                                            },
                                            {
                                                name: "残忍拒绝",
                                                event: "stop_renew"
                                            }
                                        ]
                                    }
                                };
                                app.dialog(param);
                            }
                        });
                    }
                }
            },
            extra: {
                isflower: true,
                delay: 200
            }
        });
    }
    loadPage();
    app.listen("ok_renew", function() {
        var checkOld;
        var moneytext = Number($(".needMoney").text());
        if (moneytext != 0 && person.need_add_money != "0") {
            checkOld = 0;
        }
        if (moneytext == 0 && person.need_add_money != "0") {
            checkOld = 1;
        }
        if (moneytext == 0 && person.need_add_money == "0") {
            checkOld = 0;
        }
        var choosedays = $("#chooseRentType").attr("data-choose");
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "machine/renewalOrderRegular",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        order_id: orderID,
                        regular_date_num: choosedays,
                        is_old_policy: checkOld
                    }
                },
                callback: function(ret, err) {
                    console.log("续单返回" + JSON.stringify(ret));
                    if (ret.code == 1) {
                        app.trigger("renew_success");
                        app.toast("续单成功");
                        $(this).unbind("click");
                        setTimeout(function(params) {
                            app.closeW();
                        }, 2000);
                    } else {
                        app.toast(ret.desc);
                    }
                }
            },
            extra: {
                isflower: true,
                delay: 200
            }
        });
    });
    app.listen("sure_rechargeBcny", function() {
        var thisGoPage =
            '{"page":"common/headerwin","name":"buyandsellbcny_headerwin","param":{"subpage":"my/buyandsellbcny","name":"buyandsellbcny","title":"BCNY兑换","right":"记录","rightParam":{"page": "common/headerwin","name": "sellandbuybcnylist_headerwin","param": {"subpage": "my/sellandbuybcnylist","name": "sellandbuybcnylist","showBcny": "true"}}}}';
        app.goPushPage(thisGoPage);
    })
    app.listen("sure_recharge", function() {
        app.checkStaus(function(ret) {
            if (ret.code == 1) {
                if (ret.is_recharge_verify == 0) {
                    var param = {
                        dtype: "dialog29copy",
                        data: {
                            status: '',
                            tips: '',
                            event: "relNameRead"
                        }
                    };
                    app.dialog(param);
                } else {
                    var thisGoPage = '{"page":"common/headerwin","name":"littlemoneyrecharge_headerwin","param":{"subpage":"extrapage/littlemoneyrecharge","name":"littlemoneyrecharge","title":"充值"}}';
                    app.goPushPage(thisGoPage);
                }
            } else {
                app.toast(ret.desc)
            }
        })
    })
    var events = ["littlemoney_recharge_success", "buyBcnySucceed"];
    app.listen(events, function() {
        app.reload();
    });

};