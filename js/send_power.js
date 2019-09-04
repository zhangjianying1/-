apiready = function () {
    var app = new APP();
    var account = app.getAccount();
    var machineId = api.pageParam.machineId; //机器ID
    var machineDetail = api.pageParam.Matchine //机器详情
    var totalpower = machineDetail.total_power; //最大算力
    var maxInputPower = parseInt(app.accMul(machineDetail.num, machineDetail.base_power)); //inpput输入最大值
    var maxInputPowerOld = parseInt(app.accMul(machineDetail.num, machineDetail.base_power)) //outInpput
    var maxTanfer = parseInt(machineDetail.num); //最大转让份数
    var rentMoney = 0; //单份租用金额
    var agreementinput = false; //是否同意协议
    var userTransferData = {}; //确认转让提交数据
    var usdtPrice = api.pageParam.usdtPrice; //usdt价格
    var constract_id = ""; //协议ID
    var reTwo = /([0-9]+\.[0-9]{0,2})[0-9]*/;
    var refour = /([0-9]+\.[0-9]{0,4})[0-9]*/;
    if (app.ST == "ios") {
        $("input").click(function () {
            $(this).focus().select(); //保险起见，还是加上这句。
        });
    }
    app.ajax({
        param: {
            method: "post",
            url: app.config.url + "transfer/contract",
            data: {
                values: {
                    uid: account.uid,
                    token: account.token
                }
            },
            callback: function (ret) {
                app.log('transfer/contract', ret);
                if (ret.code == 1) {
                    constract_id = ret.id;
                    $(".rementLink").text(ret.name);
                    $(".rementLink").click(function (e) {
                        var param = {
                            dtype: "dialog39",
                            data: {
                                oriderID: machineDetail.order_id,
                                title: ret.name,
                                orderText: ret.content,
                                btns: [{
                                    name: "我已阅读并同意",
                                    event: "okRentMachine"
                                }],
                                extra: {}
                            }
                        };
                        app.dialog(param);
                        e.stopPropagation();
                        return false;
                    });
                }

            }
        },
        extra: {
            isflower: true
        }
    })
    $(".machineName").text(machineDetail.name);
    if (machineDetail.pay_currency == "USDT") {
        $(".usdtText").text("初始订单价格");
        $(".priceText").text("初始订单价格");
        $(".changeUsdt").text("1 USDT = " + usdtPrice.replace(reTwo, "$1") + " BCNY");
    } else {
        $(".usdtText").text("公允价格");
        $(".priceText").text("公允价格");
        $(".changeUsdt").text("1 CNY = 1 BCNY");
    }
    if (machineDetail.is_switch == 1) {
        $(".takePrice").show();
        var getDev = String(app.accDiv(machineDetail.total_deposit_coin, maxInputPowerOld));
        var getDevNew = String(app.accDiv(machineDetail.continue_total_deposit_coin, maxInputPower));
        if (machineDetail.pay_currency == "USDT") {
            $(".uesePhone").text(getDev.replace(refour, "$1") + " " + machineDetail.pay_currency + "/T");
            rentMoney = Number(getDev.replace(refour, "$1"));
            $(".oldPrice").text(getDevNew.replace(refour, "$1") + " " + machineDetail.pay_currency + "/T");
        } else {
            $(".uesePhone").text(getDev.replace(reTwo, "$1") + " " + machineDetail.pay_currency + "/T");
            rentMoney = Number(getDev.replace(reTwo, "$1"));
            $(".oldPrice").text(getDevNew.replace(reTwo, "$1") + " " + machineDetail.pay_currency + "/T");
        }
    } else {
        if (machineDetail.pay_currency == "USDT") {
            var getDevposti = String(app.accDiv(machineDetail.total_deposit_coin, maxInputPowerOld));
            $(".uesePhone").text(getDevposti.replace(refour, "$1") + " " + machineDetail.pay_currency + "/T");
            rentMoney = Number(getDevposti.replace(refour, "$1"));
        } else {
            var getNumber = String(app.accDiv(machineDetail.total_deposit, maxInputPowerOld))
            $(".uesePhone").text(getNumber.replace(reTwo, "$1") + " " + machineDetail.pay_currency + "/T");
            rentMoney = Number(getNumber.replace(reTwo, "$1"));
        }
    }
    $(".dw,.chooseOther").text(machineDetail.pay_currency);
    $(".payUnit").text(machineDetail.pay_currency + "/T")
    if (machineDetail.pay_currency == "CNY" || machineDetail.pay_currency == "BCNY") {
        $("#btcchoose").val("BCNY");
    } else {
        $("#btcchoose").val(machineDetail.pay_currency);
    }
    $("#inputNumber").on("input porpertychange", function () {
        var thisVal = Number($(this).val());
        if (thisVal > maxTanfer) {
            $(this).val(maxTanfer);
        }
    });
    //当输入框输入数字时
    var inputStartTime = 0; //开始输入第一个数字的时间
    $("#sendPrice").on("input porpertychange", function (event) {
        inputStartTime = event.timeStamp;
        setTimeout(function () {
            if (inputStartTime - event.timeStamp == 0) {
                var thisVal = $("#sendPrice").val();
                if (thisVal <= rentMoney) {
                    $("#showtextTips").hide();
                } else {
                    $("#showtextTips").show();
                }
                if (machineDetail.pay_currency == "USDT") {
                    $("#sendPrice").val(thisVal.replace(refour, "$1"));
                } else {
                    $("#sendPrice").val(thisVal.replace(reTwo, "$1"));
                }
            }
        }, 200)
    });
    $("input[name='gotransfer']").on("input porpertychange", function () {
        var priceInput = $("#sendPrice").val();
        var powerInput = $("#inputNumber").val();
        var totalMoney = String(app.accMul(app.accMul(powerInput, priceInput),machineDetail.base_power));
        if (machineDetail.pay_currency == "USDT") {
            $(".payMoney").text(totalMoney.replace(refour, "$1"));
        } else {
            $(".payMoney").text(totalMoney.replace(reTwo, "$1"));
        }
    });
    $(".rementLabel").click(function () {
        if (agreementinput == false) {
            agreementinput = true;
            $(".ag_checkedstyle").removeClass('agreement_style').addClass(
                'agreement_style_checked');
            $(".rentBtn").removeClass('notAgree')
        } else {
            agreementinput = false;
            $(".ag_checkedstyle").removeClass('agreement_style_checked').addClass(
                'agreement_style');
            $(".rentBtn").addClass('notAgree')
        }
    });
    //点击租用
    $(".rentBtn").bind('tap click', function () {
        var thisPrice = Number($("#sendPrice").val());
        var thisNumber = Number($("#inputNumber").val());
        var payChoose = $("input[name='moeney']:checked").val();
        if(!constract_id) return
        if (!thisNumber) {
            app.toast("请输入转让算力");
            return
        }
        if (!thisPrice) {
            app.toast("请输入价格");
            return
        }
        if (agreementinput == true) {
            userTransferData = {
                uid: account.uid,
                token: account.token,
                trade_password: "",
                poundage_type: payChoose,
                order_id: machineId,
                amount: thisPrice,
                num: thisNumber,
                constract_id: constract_id
            }
            app.ajax({
                param: {
                    method: "post",
                    url: app.config.url + "transfer/proundage",
                    data: {
                        values: {
                            uid: account.uid,
                            token: account.token,
                            poundage_type: payChoose,
                            order_id: machineId,
                            amount: thisPrice,
                            num: thisNumber
                        }
                    },
                    callback: function (ret) {
                        app.log('transfer/proundage', ret);
                        if (ret.code == 1) {
                            if (ret.is_have_poundage == 0) {
                                var param = {
                                    dtype: "dialog341",
                                    data: {
                                        tansferPower: app.accMul(thisNumber, machineDetail.base_power) + " T",
                                        transferPrice: thisPrice + " " + machineDetail.pay_currency + "/T",
                                        getMoney:app.accMul(app.accMul(thisPrice, thisNumber), machineDetail.base_power) + machineDetail.pay_currency,
                                        transferTotal: app.accMul(app.accMul(thisPrice, thisNumber), machineDetail.base_power) + " " + machineDetail.pay_currency
                                    }
                                };
                            } else {
                                var param = {
                                    dtype: "dialog34",
                                    data: {
                                        tansferPower: app.accMul(thisNumber, machineDetail.base_power) + " T",
                                        transferPrice: thisPrice + " " + machineDetail.pay_currency + "/T",
                                        transferDrokerage: +ret.data.cny_num + "CNY" + " = " + ret.data.coin_num + ret.data.type,
                                        getMoney: app.accMul(app.accMul(thisPrice, thisNumber), machineDetail.base_power) + machineDetail.pay_currency + " - " + ret.data.coin_num + ret.data.type,
                                        transferTotal: app.accMul(app.accMul(thisPrice, thisNumber), machineDetail.base_power) + " " + machineDetail.pay_currency
                                    }
                                };
                            }
                            app.dialog(param);
                        } else {
                            app.toast(ret.desc);
                        }

                    }
                },
                extra: {
                    isflower: true
                }
            })
        }
    });

    app.listen("okRentMachine", function () {
        if (agreementinput == false) {
            $(".rementLabel").click();
        }
    });
    app.listen("YesGoTransfer", function () {
        app.openFrame({
            name: "keybord",
            url: app.hd + "fisrt/keybord.html",
            bgColor: "rgba(0,0,0,0.4)",
            rect: {
                x: 0,
                y: 0,
                w: app.W,
                h: app.H
            },
            pageParam: {
                userTransferData: userTransferData
            }

        });
    })
    app.listen("transferDialog", function () {
        var param = {
            dtype: "dialog38"
        };
        app.dialog(param);
    })
    app.listen("transferSe", function () {
        setTimeout(function () {
            api.closeWin();
        }, 1000);
    })
};