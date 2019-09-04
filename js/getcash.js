apiready = function() {
    var app = new APP();
    var account = app.getAccount();
    if (app.ST == "ios") {
        $("input").click(function() {
            $(this)
                .focus()
                .select(); //保险起见，还是加上这句。
        });
    }
    var acceptClik = 0;
    var getChoose = "CNY";
    var sliderNormal = null;
    var getBankInfor = null; //获取银行卡列表
    var bandData = {}; //页面跳转数据\
    var isdataArr;
    // var goBcny = api.pageParam.goBcny ? api.pageParam.goBcny : ""; //跳转bcny
    var mingetCashNumber = 100; //最小提现数量
    var isHaveBank = 0; //0没有 1有
    var getUserPwd = 0; //获取用户设置密码状态
    var chooseMoneyMax;
    var bcnyMax;
    var userDeatal;

    function loadpage(params) {
        var checkNumber = /^[0-9]*$/;
        //获取用户资产
        if (account && account.token) {
            app.getProperties(function(ret, err) {
                if (ret.code == 1) {
                    coinMax = Number(ret.wallet_detail.rmb);
                    bcnyMax = parseInt(ret.wallet_detail.bcny.total_price);
                    otherMoney = ret.wallet_detail;
                    $(".myMoneyNum").text(app.outputmoney(coinMax) + getChoose);
                    chooseMoneyMax = parseInt(ret.wallet_detail.rmb);
                    $(".bhpcMoneyBlance").text(
                        app.outputmoney(ret.wallet_detail.bcny.total_price) + "BCNY"
                    );
                    var isForeign = [{
                        id: "CNY",
                        value: "人民币—CNY"
                    }];
                    var obj = {};
                    if (!ret.wallet_detail.is_foreign[0] && ret.wallet_detail.is_foreign.length == 1) {
                        app.log("不用处理数据");
                        isdataArr = isForeign;
                    } else {
                        for (var i = 0; i < ret.wallet_detail.is_foreign.length; i++) {
                            var arrval = {
                                id: ret.wallet_detail.is_foreign[i],
                                value: ""
                            }
                            if (ret.wallet_detail.is_foreign[i] == "CNY") {
                                arrval.value = "人民币—" + ret.wallet_detail.is_foreign[i]
                            }
                            if (ret.wallet_detail.is_foreign[i] == "USD") {
                                arrval.value = "美元—" + ret.wallet_detail.is_foreign[i]
                            }
                            if (ret.wallet_detail.is_foreign[i] == "EUR") {
                                arrval.value = "欧元—" + ret.wallet_detail.is_foreign[i]
                            }
                            if (ret.wallet_detail.is_foreign[i] == "HKD") {
                                arrval.value = "港币—" + ret.wallet_detail.is_foreign[i]
                            }
                            isForeign.push(arrval);
                        }
                        var person = isForeign.reduce(function(cur, next) {
                            obj[next.id] ? "" : obj[next.id] = true && cur.push(next);
                            return cur;
                        }, []);
                        isdataArr = person;
                    }
                    $("#showBank").text(isdataArr[0].id);
                    getChoose = isdataArr[0].id;
                    var showBankDom = document.querySelector('#showBank');
                    var bankIdDom = document.querySelector('#bankId');
                    if (app.ST = 'ios') {
                        $("body").unbind('click map').bind('click map', function(e) {
                            $('.ios-select-widget-box').remove();
                            $("body").removeClass('over');
                        });
                        $(".ios-select-widget-box").unbind('click map').bind('click map', function(e) {
                            e.stopPropagation();
                        });
                    }
                    showBankDom.addEventListener('click', function(e) {
                        if (app.ST = 'ios') {
                            $("body").addClass('over');
                        }
                        e.stopPropagation();
                        var bankId = showBankDom.dataset['id'];
                        acceptClik++;
                        if (acceptClik > 1) return;
                        var bankSelect = new IosSelect(1,
                            [isdataArr], {
                                title: '',
                                oneLevelId: bankId,
                                itemHeight: 1,
                                headerHeight: 0.88,
                                itemShowCount: 3,
                                maskCallback: function() {
                                    acceptClik = 0;
                                },
                                fallback: function() {
                                    acceptClik = 0;
                                },
                                cssUnit: 'rem',
                                callback: function(selectOneObj) {
                                    acceptClik = 0;
                                    bankIdDom.value = selectOneObj.id;
                                    showBankDom.innerHTML = selectOneObj.id;
                                    getChoose = selectOneObj.id;
                                    var getInput = 0;
                                    $("#addShowItem").empty();
                                    $("#code,#inputNum").val("");
                                    if (getChoose != "CNY") {
                                        $(".hideUsdt").hide();
                                    } else {
                                        $(".hideUsdt").show();
                                    }
                                    if (getChoose != "CNY" && $.isEmptyObject(getBankInfor)) {
                                        $("#account").text("请绑定海外银行卡账户").css("color", "ffd203");

                                    }
                                    if (getChoose == "CNY" && $.isEmptyObject(getBankInfor)) {
                                        $("#account").text("未绑定提现银行卡账户");
                                    }
                                    if (getChoose == "CNY" && !$.isEmptyObject(getBankInfor)) {
                                        $("#account").text("请输入海外银行卡账户");
                                    }
                                    getBankInfomation(getChoose);
                                    if (getChoose == "CNY") {
                                        $(".myMoneyNum").text(
                                            (coinMax == 0 ? "0.00" : app.outputmoney(coinMax)) + " CNY"
                                        );
                                        $(".mingetCash").text("100CNY");
                                        $("#bhpcSweet").attr("max", coinMax);
                                        chooseMoneyMax = parseInt(coinMax);
                                        mingetCashNumber = 100;
                                        return
                                    }
                                    if (getChoose == "USD") {
                                        $(".myMoneyNum").text(
                                            (Number(otherMoney.usd.coin) == 0 ? "0.00" : app.outputmoney(otherMoney.usd.coin)) + " " +
                                            getChoose
                                        );
                                        chooseMoneyMax = parseInt(otherMoney.usd.coin);
                                        $(".mingetCash").text("200USD");
                                        mingetCashNumber = 200;
                                        return
                                    }
                                    if (getChoose == "EUR") {
                                        $(".myMoneyNum").text(
                                            (Number(otherMoney.eur.coin) == 0 ? "0.00" : app.outputmoney(otherMoney.eur.coin)) + " " +
                                            getChoose
                                        );
                                        chooseMoneyMax = parseInt(otherMoney.eur.coin);
                                        $(".mingetCash").text("20EUR");
                                        mingetCashNumber = 20;
                                        return
                                    }
                                    if (getChoose == "HKD") {
                                        $(".myMoneyNum").text(
                                            (Number(otherMoney.hkd.coin) == 0 ? "0.00" : app.outputmoney(otherMoney.hkd.coin)) + " " +
                                            getChoose
                                        );
                                        $(".mingetCash").text("100HKD");
                                        chooseMoneyMax = parseInt(otherMoney.hkd.coin);
                                        mingetCashNumber = 100;
                                    }
                                }
                            }
                        );
                        if (app.ST = 'ios') {
                            $(".ios-select-widget-box .iosselect-header>a").unbind('click map').bind('click map', function(e) {
                                e.stopPropagation();
                                $("body").removeClass('over');
                            });
                        }
                    });
                }
            });
        }
    };
    loadpage();

    function getSetPass() {
        app.asynchronousAjax("member/getSumitRealnameVerifyStatus", {
            uid: account.uid,
            token: account.token
        }, function(ret) {
            if (ret.code == 1) {
                getUserPwd = ret.is_trade_pwd;
                if (ret.is_trade_pwd == 0) {
                    $("#showAddPwd,#forgetPass,#addBcnyPwd,#forgetBcnyPass").hide();
                    $(".setCnypass,.setBcnypass").show().css("display", "flex");
                    $(".setCnypass").css({
                        "borderBottom": "0.2rem solid #f7f7f7",
                        "height": "1.3rem"
                    });
                } else {
                    $("#showAddPwd,#forgetPass,#addBcnyPwd,#forgetBcnyPass").show();
                    $(".setCnypass,.setBcnypass").hide();
                }
            }
        });
    }
    getSetPass();
    // 获取银行卡信息
    function getBankInfomation(currencyCode) {
        $("#account").attr("data-param", "");
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "wallet/getWalletInfo",
                data: {
                    values: {
                        uid: app.getAccount().uid,
                        token: app.getAccount().token,
                        currency_code: currencyCode
                    }
                },
                callback: function(ret, err) {
                    app.log("getWalletInfo", "获取钱包信息：" + JSON.stringify(ret));
                    // getBankInfor = ret.wallet.bank_card_info;
                    if (ret.code == 1) {
                        var str = "";
                        var strNum = "";
                        userDeatal = ret.wallet.realname;
                        if (ret.wallet.bank_card_info.length == 0 && getChoose == "CNY") {
                            str = "请绑定银行卡账户";
                            strNum = "";
                            isHaveBank = 0;
                            bandData = {
                                page: "common/headerwin",
                                name: "addcard_headerwin",
                                param: {
                                    subpage: "mine/addcard",
                                    name: "addcard",
                                    title: "编辑银行卡信息",
                                    idname: ret.wallet.realname.name,
                                    allowEdit: true
                                }
                            };
                            $(".addTextTips").text(str);
                            $(".showeItemText").show();
                        }
                        if (ret.wallet.bank_card_info.length == 0 && getChoose != "CNY") {
                            str = "请绑定海外银行卡账户";
                            strNum = "";
                            isHaveBank = 0;
                            bandData = {
                                page: "common/headerwin",
                                name: "overseasBank_headerwin",
                                param: {
                                    subpage: "mine/overseasbank",
                                    name: "overseasbank",
                                    idname: ret.wallet.realname.name,
                                    title: "海外银行卡",
                                    getChoose: getChoose,
                                    isdataArr: isdataArr
                                },
                                allowEdit: true
                            }
                            $(".showeItemText").show();
                            $(".addTextTips").text(str);
                        }
                        if (ret.wallet.bank_card_info.length > 0) {
                            $(".showeItemText").hide();
                            $(".addTextTips").text("");
                            ret.wallet.bank_card_info.map(function(item) {
                                item.hideBankNum = item.bank_card_num.slice(0, 4) + "****" + item.bank_card_num.slice(-4);
                            })
                            var temp = doT.template($("#listT").text());
                            $("#addShowItem").html(temp(ret.wallet.bank_card_info));
                            //$("#addShowItem input").attr("checked", true);
                            $("#addShowItem input").eq(0).prop("checked", true);
                        }

                    }
                }
            },
            extra: {
                isflower: true
            }
        });
    }
    getBankInfomation(getChoose);

    function getBankInfomationBcny(currencyCode) {
        $("#account").attr("data-param", "");
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "wallet/getWalletInfo",
                data: {
                    values: {
                        uid: app.getAccount().uid,
                        token: app.getAccount().token,
                        currency_code: currencyCode
                    }
                },
                callback: function(ret, err) {
                    app.log("getWalletInfo", "获取钱包信息：" + JSON.stringify(ret));
                    // getBankInfor = ret.wallet.bank_card_info;
                    if (ret.code == 1) {
                        var str = "";
                        var strNum = "";
                        userDeatal = ret.wallet.realname;
                        if (ret.wallet.bank_card_info.length == 0) {
                            str = "请绑定银行卡账户";
                            bandData = {
                                page: "common/headerwin",
                                name: "addcard_headerwin",
                                param: {
                                    subpage: "mine/addcard",
                                    name: "addcard",
                                    title: "编辑银行卡信息",
                                    idname: ret.wallet.realname.name,
                                    allowEdit: true
                                }
                            };
                            $(".addTextTipsbcny").text(str);
                            $(".showeItemTextBcny").show();
                        }
                        if (ret.wallet.bank_card_info.length > 0) {
                            $(".addTextTipsbcny").text("");
                            $(".showeItemTextBcny").hide();
                            ret.wallet.bank_card_info.map(function(item) {
                                item.hideBankNum = item.bank_card_num.slice(0, 4) + "****" + item.bank_card_num.slice(-4);
                            })
                            var temp = doT.template($("#listBcny").text());
                            $("#addShowItemBcny").html(temp(ret.wallet.bank_card_info));
                            $("#addShowItemBcny input").eq(0).prop("checked", true);
                        }

                    }
                }

            },
            extra: {
                isflower: true
            }
        });
    }

    var thislist = "";

    function getCodeCallback() {
        // 检测手机号码
        var phone = app.getAccount().mobile;
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "smscaptcha/get",
                data: {
                    values: {
                        mobile: phone,
                        area_code: app.getAccount().area_code
                    }
                },
                callback: function(ret, err) {
                    app.log("register", "获取验证码：" + JSON.stringify(ret));
                    if (ret.code != -1) {
                        $("#getcode").attr('disabled', 'true').unbind('tap click');
                        app.countDown(60, function(value) {
                            thislist = value.id;
                            if (value.time != 0) {
                                $("#getcode").text(value.time + "s");
                            } else {
                                window.clearTimeout(thislist);
                                $("#getcode").text("重新获取").removeAttr('disabled').bind('tap click', function() {
                                    getCodeCallback()
                                });
                            }
                        });
                    }

                }
            },
            extra: {
                isflower: true
            }
        });
    }
    $(".showeItemText").on("click", function() {
        var recoinNumber = JSON.stringify(bandData);
        app.goPushPage(recoinNumber);
    });
    $(".showeItemTextBcny").on("click", function() {
        var recoinNumber = JSON.stringify(bandData);
        app.goPushPage(recoinNumber);
    });
    var idTimes = "";

    function getCodeCallbackBcny() {
        // 检测手机号码
        var phone = app.getAccount().mobile;
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "smscaptcha/get",
                data: {
                    values: {
                        mobile: phone,
                        area_code: app.getAccount().area_code
                    }
                },
                callback: function(ret, err) {
                    app.log("register", "获取验证码：" + JSON.stringify(ret));
                    // 执行倒计时
                    if (ret.code != -1) {
                        $("#getBcnycode").unbind('tap click').attr('disabled', 'true');
                        app.countDown(60, function(value) {
                            idTimes = value.id;
                            if (value.time != 0) {
                                $("#getBcnycode").text(value.time + "s");
                            } else {
                                $("#getBcnycode").text("重新获取").removeAttr('disabled').bind('tap click', function() {
                                    getCodeCallbackBcny()
                                });
                            }
                        });
                    }

                }
            },
            extra: {
                isflower: true
            }
        });
    };
    $("#getcode").bind("click tap", function() {
        getCodeCallback();
    });
    $(":checkbox").click(function() {
        //设置当前选中checkbox的状态为checked
        $(this).attr("checked", true);
        $(this).siblings().attr("checked", false); //设置当前选中的checkbox同级(兄弟级)其他checkbox状态为未选中
    });
    $("#getBcnycode").click(function() {
        getCodeCallbackBcny();
    });


    $("#inputNum").on("input porpertychange", function() {
        var thisval = Number($(this).val());
        if (thisval > chooseMoneyMax) {
            $(this).val(chooseMoneyMax);
        }
    });
    $(".addShowItem").on("click", "span", function() {
        var thisData = $(this).attr("data-type").toUpperCase();
        if (thisData == "CNY") {
            var bandData = {
                page: "common/headerwin",
                name: "addcard_headerwin",
                param: {
                    subpage: "mine/addcard",
                    name: "addcard",
                    title: "编辑银行卡信息",
                    idname: userDeatal.name,
                    bank: $(this).attr("data-bank"),
                    bankard: $(this).attr("data-bankard"),
                    khh: $(this).attr("data-khh"),
                    bankID: $(this).attr("data-bankID"),
                    userBankID: $(this).attr("data-userbankID"),
                    allowEdit: true
                }
            };
        } else {
            var bandData = {
                page: "common/headerwin",
                name: "overseasBank_headerwin",
                param: {
                    subpage: "mine/overseasbank",
                    name: "overseasbank",
                    title: "编辑海外银行卡信息",
                    idname: userDeatal.name,
                    bank: $(this).attr("data-bank"),
                    bankard: $(this).attr("data-bankard"),
                    khh: $(this).attr("data-bank"),
                    bankID: $(this).attr("data-bankID"),
                    swiftCode: $(this).attr("data-swifiCode"),
                    userBankID: $(this).attr("data-userbankID"),
                    getChoose: getChoose,
                    allowEdit: true,
                    isdataArr: isdataArr
                }
            };
        }
        var recoinNumber = JSON.stringify(bandData);
        app.goPushPage(recoinNumber);
    })
    $("#inputBcnyNum").on("input porpertychange", function() {
        var thisval = Number($(this).val());
        if (thisval > bcnyMax) {
            $(this).val(bcnyMax);
        }
    });
    $(".addShowItemBcny").on("click", "span", function() {
        var thisData = $(this).attr("data-type").toUpperCase();
        var bandData = {
            page: "common/headerwin",
            name: "addcard_headerwin",
            param: {
                subpage: "mine/addcard",
                name: "addcard",
                title: "编辑银行卡信息",
                idname: userDeatal.name,
                bank: $(this).attr("data-bank"),
                bankard: $(this).attr("data-bankard"),
                khh: $(this).attr("data-khh"),
                bankID: $(this).attr("data-bankID"),
                userBankID: $(this).attr("data-userbankID"),
                allowEdit: true
            }
        };
        var recoinNumber = JSON.stringify(bandData);
        app.goPushPage(recoinNumber);
    })
    var bankIDThisGet;
    $("#getCashButton").on("click", function() {
        bankIDThisGet = $("input[name='radioBlance']:checked").val();
        if (getUserPwd == 0) {
            app.toast("请先设置交易密码");
            return
        }
        if (getUserPwd != 0 && !$("#dealPassword").val()) {
            app.toast("请输入交易密码");
            return
        }
        if (!bankIDThisGet) {
            app.toast("请选择提现银行卡");
            return
        }
        if (!$("#inputNum").val()) {
            app.toast("提现金额不能为空");
            return
        }
        if (app.toNum($("#inputNum").val()) < mingetCashNumber) {
            app.toast("最少提现" + mingetCashNumber + getChoose);
            return;
        }
        if (
            !$("#code")
            .val()
            .trim()
        ) {
            app.toast("请输入验证码！");
            return;
        }
        app.trigger("yesGetCash");

    })
    $("#getCashBcnyButton").on("click", function(params) {
        var inputBcnyVal = $("#inputBcnyNum").val();
        var smsInputVal = $("#codeBcny").val();
        var bankIDThisGetBcny = $("input[name='radioBcny']:checked").val();
        if (getUserPwd == 0) {
            app.toast("请先设置交易密码");
            return
        }
        if (getUserPwd != 0 && !$("#dealBcnyPassword").val()) {
            app.toast("请输入交易密码");
            return
        }
        if (!bankIDThisGetBcny) {
            app.toast("请选择提现银行卡");
            return
        }
        if (!inputBcnyVal) {
            app.toast("BCNY提现不能为空");
            return;
        }
        if (Number(inputBcnyVal) < 100) {
            app.toast("最低提现100BCNY");
            return;
        }
        if (!smsInputVal) {
            app.toast("短信验证码不能为空");
            return;
        }
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "otc/amount",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        amount: $("#inputBcnyNum").val().trim(),
                        smscaptcha: $("#codeBcny").val().trim(),
                        trade_password: $("#dealBcnyPassword").val().trim(),
                        card_id: bankIDThisGetBcny

                    }
                },
                callback: function(ret, err) {
                    app.log(
                        "get_cash123",
                        "get_cashbcny返回：" + JSON.stringify(ret)
                    );

                    if (ret.code == 1) {
                        var param = {
                            dtype: "dialog32",
                            data: {
                                imgSrc: "../../image/succ_icn.png",
                                button: {
                                    text: "确定",
                                    eventText: "getCashSure"
                                }
                            }
                        };
                        app.dialog(param);
                        return
                    }
                    if (ret.code == -1) {
                        app.toast(ret.desc);
                        return
                    }
                    if (ret.code == -99) {
                        var param = {
                            dtype: "dialog2",
                            data: {
                                title: "提示",
                                text: ret.desc,
                                btns: [{
                                    name: "确认",
                                    event: "noPass",
                                    style: "color:#0095E5;"
                                }]
                            }
                        };
                        app.dialog(param);
                    }
                }
            },
            extra: {
                isflower: true
            }
        });
    });
    app.listen("yesGetCash", function() {
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "finance/withdrawals",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        amount: $("#inputNum").val().trim(),
                        smscaptcha: $("#code").val().trim(),
                        currency_code: getChoose == "CNY" ? "money" : getChoose,
                        trade_password: $("#dealPassword").val().trim(),
                        card_id: bankIDThisGet
                    }
                },
                callback: function(ret, err) {
                    app.log("get_cash", "get_cash返回：" + JSON.stringify(ret));

                    if (ret.code == 1) {
                        var param = {
                            dtype: "dialog32",
                            data: {
                                imgSrc: "../../image/succ_icn.png",
                                button: {
                                    text: "确定",
                                    eventText: "getCashSure"
                                }
                            }
                        };
                        app.dialog(param);
                        return
                    }
                    if (ret.code == -1) {
                        app.toast(ret.desc);
                        return
                    }
                    if (ret.code == -99) {
                        if (ret.code == -99) {
                            var param = {
                                dtype: "dialog2",
                                data: {
                                    title: "提示",
                                    text: ret.desc,
                                    btns: [{
                                        name: "确认",
                                        event: "noPass",
                                        style: "color:#0095E5;"
                                    }]
                                }
                            };
                            app.dialog(param);
                        }
                    }
                }
            },
            extra: {
                isflower: true
            }
        });
    });
    var chooseType = "balance";
    $("header span").on("click", function() {
        $("header span").css({
            color: "rgba(18,18,18,0.68)",
            borderBottomColor: "#fff"
        });
        var clickIndex = $(this).data('index');
        $(this).css({
            color: "#333333",
            borderBottomColor: "#ffd203"
        });
        getSetPass();
        chooseType = $(this).attr("data-choose");
        window.clearInterval(thislist);
        window.clearInterval(idTimes);
        if (chooseType == "balance") {
            $("#getcode").text('获取验证码').removeAttr('disabled').unbind('tap click').bind("tap click", function() {
                getCodeCallback();
            });
        } else {
            $("#getBcnycode").text('获取验证码').removeAttr('disabled').unbind('tap click').bind("tap click", function() {
                getCodeCallbackBcny();
            });
        }
        $("#codeBcny,#inputBcnyNum,#code,#inputNum").val("");
        if (chooseType == "balance") {
            $(".showMoneyBox").show();
            $(".showBcnyBox").hide();
            getBankInfomation(getChoose);
        } else {
            acceptClik = 0;
            $(".olay").remove();
            $(".showMoneyBox").hide();
            $(".showBcnyBox").show();
            getBankInfomationBcny("CNY");
        }
    });
    $("#forgetPass,#forgetBcnyPass").on("click", function() {
        if (getUserPwd == 2) {
            app.toast("审核中");
            return
        }
        var cointypecontract = {
            page: "common/headerwin",
            name: "forget_password_headerwin",
            param: {
                subpage: "mine/forget_password",
                name: "get_cash",
                title: "忘记交易密码"
            }
        };
        var recoinNumber = JSON.stringify(cointypecontract);
        app.goPushPage(recoinNumber);
    })
    app.listen("getCashSure", function(params) {
        app.closeW();
    })
    app.listen("add_card_success", function() {
        if (chooseType == "balance") {
            getBankInfomation(getChoose);
        } else {
            getBankInfomationBcny("CNY");
        }
    });
    app.listen("setdealPassOk", function() {
        getSetPass();
    })

}