apiready = function() {
    var validateTokenNew = "";
    var app = new APP();
    var account = app.getAccount();
    var machineId = api.pageParam.machineId; //订单ID
    var machineDetail = api.pageParam.machineDetail; //机器信息
    var is_captcha = api.pageParam.is_captcha; //是否支持验证
    var agreementinput = false; //是否同意协议
    var myUseMoney = api.pageParam.myUseMoney; //我的余额
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    if (is_captcha == 1) {
        _fmOpt = {
            display: 'popup', //popup方式渲染验证码
            container: '#checkButton', //验证码button渲染的目标DOM，自动展现方式下必需，详情见后文
            area: '.customForm', //对于custom模式，弹出窗口的加载容器，详情见后文
            partner: "renrenkj",
            appName: "renrenkj_h5",
            width:"6.9rem",
            height: "0.88rem",
            fmb: true,
            initialTime: new Date().getTime(),
            token: "renrenkj" + "-" + new Date().getTime() + "-" + Math.random().toString(16).substr(2),
            env: 0,
            getinfo: function() {
                return "e3Y6ICIyLjUuMCIsIG9zOiAid2ViIiwgczogMTk5LCBlOiAianMgbm90IGRvd25sb2FkIn0=";
            },
        };
        var fm = document.createElement('script');
        fm.type = 'text/javascript';
        fm.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'static.tongdun.net/captcha/main/tdc.js?ver=1.0&t=' + (new Date().getTime() / 600000).toFixed(0);
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(fm, s);
        _fmOpt.onSuccess = function(validateToken) {
            if (validateToken) {
                validateTokenNew = validateToken;
                $("#hideBox").show();
                $("#checkButton").hide();
            } else {
                _fmOpt.reset();
            }
        };
    } else {
        $("#checkButton").hide();
        $("#hideBox").show();
    }
    $(".userUsdt").text(myUseMoney.myUsdt.coin);
    $(".userBcny").text(myUseMoney.myBcny.coin);
    $(".machineName").text(machineDetail.name);
    $(".powerNum").text(machineDetail.total_power + " T");
    if (machineDetail.pay_currency != "USDT") {
        $(".overtakingPrice").text(machineDetail.total_deposit.replace(re, "$1") + " " + machineDetail.pay_currency);
        $(".payMoney").text(machineDetail.total_deposit.replace(re, "$1"));
    } else {
        $(".payMoney").text(machineDetail.total_deposit);
        $(".overtakingPrice").text(machineDetail.total_deposit + " " + machineDetail.pay_currency);
    }
    $(".dw").text(machineDetail.pay_currency);
    if (machineDetail.pay_currency == "CNY" || machineDetail.pay_currency == "BCNY") {
        $("#bcnyPay").show();
        $("#bcny").attr("checked", true);
    } else {
        $("#usdtPay").show();
        $("#usdt").attr("checked", true);
    }
    app.asynchronousAjax("transfer/contract", {
        uid: account.uid,
        token: account.token,
        order_id: machineId
    }, function(ret) {
        if (ret.code == 1) {
            $(".rementLink").text(ret.name);
            $(".rementLink").click(function(e) {
                var param = {
                    dtype: "dialog39",
                    data: {
                        oriderID: machineId,
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
    });
    //点击租用
    $(".rentBtn").bind('tap click', function() {
        var checkedMethod = $("input[name='payWay']:checked").val();
        if (agreementinput == true) {
            if (Number(machineDetail.total_deposit) > Number(myUseMoney.myUsdt.coin) && checkedMethod == "USDT") {
                var param = {
                    dtype: "dialog1",
                    data: {
                        title: "提示",
                        text: "USDT余额不足，请确认是否前去充值？",
                        btns: [{
                                name: "取消",
                                event: ""
                            },
                            {
                                name: "确定",
                                event: "chargeUsdt"
                            }
                        ]
                    }
                };
                app.dialog(param);
                return
            }
            if (Number(machineDetail.total_deposit) > Number(myUseMoney.myBcny.coin) && checkedMethod == "BCNY") {
                var param = {
                    dtype: "dialog1",
                    data: {
                        title: "提示",
                        text: "BCNY余额不足，请确认是否前去充值？",
                        btns: [{
                                name: "取消",
                                event: ""
                            },
                            {
                                name: "确定",
                                event: "chargeBcny"
                            }
                        ]
                    }
                };
                app.dialog(param);
                return
            }
            app.ajax({
                param: {
                    method: "post",
                    url: app.config.url + "transfer/undertake",
                    data: {
                        values: {
                            uid: account.uid,
                            token: account.token,
                            transfer_id: machineId,
                            blackBox:is_captcha == 1 ? _fmOpt.getinfo() : "",
                            yzm_token: validateTokenNew
                        }
                    },
                    callback: function(ret) {
                        app.log('transfer/undertake', ret);
                        if (ret.code == 1) {
                            app.toast(ret.desc);
                            app.trigger("goTranfer", {
                                goTranfer: true
                            });
                        } else {
                            app.toast(ret.desc);
                            app.reload();
                        }
                    }
                },
                extra: {
                    isflower: true
                }
            })
        }
    });
    $(".rementLabel").click(function() {
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
    app.listen("okRentMachine", function() {
        if (agreementinput == false) {
            $(".rementLabel").click();
        }
    });
    $("#openDialog").click(function() {
        var param = {
            dtype: "dialog220",
            data: {
                newAllPower: machineDetail.total_power + " T",
                powerList: [{
                        name: "基础算力",
                        Power: app.accMul(machineDetail.base_power, machineDetail.num) + " T"
                    },
                    {
                        name: "浮动算力",
                        Power: machineDetail.float_power + " T"
                    },
                    {
                        name: "达标算力",
                        Power: machineDetail.pe_power + " T"
                    },
                    {
                        name: "期货算力",
                        Power: "0.00" + " T"
                    },
                    {
                        name: "定期算力",
                        Power: "0.00" + " T"
                    }
                ]
            }
        };
        app.dialog(param);
    })
    app.listen("chargeBcny", function() {
        app.closeF("dialog");
        // 跳转到现金余额充值页面
        app.openWin({
            name: "buyandsellbcny_headerwin",
            url: app.hd + "common/headerwin.html",
            pageParam: {
                subpage: "my/buyandsellbcny",
                name: "buyandsellbcny",
                title: "BCNY兑换",
                right: "记录",
                rightParam: {
                    page: "common/headerwin",
                    name: "sellandbuybcnylist_headerwin",
                    param: {
                        subpage: "my/sellandbuybcnylist",
                        name: "sellandbuybcnylist",
                        showBcny: "true"
                    }
                }
            }
        })
    });
    app.listen("chargeUsdt", function() {
        app.closeF("dialog");
        // 跳转到现金usdt充值页面
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
                    app.openWin({
                        name: "littlemoneyrecharge_headerwin",
                        url: app.hd + "common/headerwin.html",
                        pageParam: {
                            subpage: "extrapage/littlemoneyrecharge",
                            name: "littlemoneyrecharge",
                            title: "充值",
                            addType: 'usdt'
                        }
                    });
                }

            } else {
                app.toast(ret.desc)
            }
        })
    });
    var events = [
        "bhpcCountChange",
        "littlemoney_recharge_success",
        "buycoin_success",
        "buyBcnySucceed"
    ];
    app.listen(events, function() {
        app.getProperties(function(ret, err) {
            if (ret.code == 1) {
                myUseMoney.myBcny = ret.wallet_detail.bcny;
                myUseMoney.myUsdt = ret.wallet_detail.usdt;
                $(".userUsdt").text(myUseMoney.myUsdt.coin);
                $(".userBcny").text(myUseMoney.myBcny.coin);
            }
        });
    });
};