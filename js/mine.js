apiready = function() {
    var app = new APP();
    app.handlePage();
    var sT = app.ST;
    var account = app.getAccount();
    var showStatu = app.getShowmoney(); //获取用户是否显示余额
    var dataCheck = {}; //认证状态
    var isForeign = [{
        id: "CNY",
        value: "人民币—CNY"
    }]; //0 不支持添加外币卡  1 支持外币卡
    var isOpenBhpSW = 0; //0 双挖BHP管理未开通 1 已开通
    var isHaveBuyBhp = 0; // 1支持 0 不支持
    var isRelName = true; //是否已经实名校验
    function relNameDialog(isRelName) {
        if (isRelName == false) {
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
            var cointypecontract = {
                page: "common/headerwin",
                name: "littlemoneyrecharge_headerwin",
                param: {
                    subpage: "extrapage/littlemoneyrecharge",
                    name: "littlemoneyrecharge",
                    title: "充值",
                    allowEdit: true
                }
            };
            var recoinNumber = JSON.stringify(cointypecontract);
            app.goPushPage(recoinNumber);
        }
    }
    if (showStatu != "true") {
        hideMoney();
    } else {
        showMoney();
    }

    function getCheckStus(dataCheck) {
        $(".headAboutLeft").unbind().bind("click", function() {
            if (app.isNullObj(dataCheck)) {
                return
            }
            if (dataCheck.statusCode == -2 || dataCheck.statusCode == -1) {
                var param = {
                    dtype: "dialog29",
                    data: {
                        status: dataCheck.statusCode,
                        tips: dataCheck.statusText,
                        event: "gocheckPass"
                    }
                };
                app.dialog(param);
                return
            }
            if (dataCheck.statusCode == 0) {
                app.toast("亲,你的信息正在审核中……");
                return
            }
            if (dataCheck.statusCode == 1) {
                // 审核通过
                var cointypecontract = {
                    page: "common/headerwin",
                    name: "getcash_headerwin",
                    param: {
                        subpage: "mine/getcash",
                        name: "get_cash",
                        title: "提现",
                        allowEdit: true
                    }
                };
                var recoinNumber = JSON.stringify(cointypecontract);
                app.goPushPage(recoinNumber);
            }
        });
        $(".goPageBankList").unbind().bind("click", function() {
            if (dataCheck.statusCode == -2 || dataCheck.statusCode == -1) {
                var param = {
                    dtype: "dialog29",
                    data: {
                        status: dataCheck.statusCode,
                        tips: dataCheck.statusText,
                        event: "gocheckPass"
                    }
                };
                app.dialog(param);
                return
            }
            if (dataCheck.statusCode == 0) {
                app.toast("亲,你的信息正在审核中……");
                return
            }
            if (dataCheck.statusCode == 1) {
                // 审核通过
                var cointypecontract = {
                    page: "common/headerwin",
                    name: "accountmanagement_headerwin",
                    param: {
                        subpage: "mine/accountmanagement",
                        name: "accountmanagement",
                        title: "提现账号管理",
                        allowEdit: true,
                        isForeign: isForeign
                    }
                };
                var recoinNumber = JSON.stringify(cointypecontract);
                app.goPushPage(recoinNumber);
            }
        });
        $(".goPropertyPage").unbind().bind("click", function() {
            var cointypecontract = {
                page: "common/headerwin",
                name: "property_headerwin",
                param: {
                    subpage: "my/property",
                    name: "property",
                    title: "我的资产",
                    isgoProper: dataCheck,
                    right: "今日币价",
                    rightParam: {
                        page: "common/headerwin",
                        name: "record_headerwin",
                        param: {
                            subpage: "my/todayprice",
                            name: "todayprice",
                            title: "今日币价"
                        }
                    }
                }
            };
            var recoinNumber = JSON.stringify(cointypecontract);
            app.goPushPage(recoinNumber);
        });
    }

    function checkTezt(account) {
        if (!account) return
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "member/getSumitRealnameVerifyStatus",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token
                    }
                },
                callback: function(ret, err) {
                    app.log("auth", "获取认证状态返回：" + JSON.stringify(ret));
                    if (ret.code == 1) {
                        if (ret.is_recharge_verify == 0) {
                            isRelName = false;
                        } else {
                            isRelName = true;
                        }
                        dataCheck = {
                            statusCode: ret.status_code,
                            statusText: ret.desc
                        }
                        getCheckStus(dataCheck);
                    }
                }
            },
            extra: {
                isflower: false
            }
        });
    };
    $(".headAboutRight").unbind().bind("click", function() {
        relNameDialog(isRelName);
    });

    function showMoney() {
        var account = app.getAccount();
        checkTezt(account);
        app.getProperties(function(ret) {
            app.log('资产返回数据++++++++++++++++++++++++++++++++++++', ret);
            if (ret.code == 1) {
                isHaveBuyBhp = ret.is_support_buy_bhp;
                if (ret.is_support_buy_bhp == 1) {
                    $("#agrentSellText").text("委托交易");
                } else {
                    $("#agrentSellText").text("委托代售");
                }
                if (ret.wallet_detail.is_show_power_node == 1) {
                    $("#joinNode").show();
                } else {
                    $("#joinNode").hide();
                }
                if (!ret.wallet_detail.is_foreign[0] && ret.wallet_detail.is_foreign.length == 1) {
                    app.log("不用处理数据");
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
                }
                if (ret.regular_will_end == 1) {
                    $("#showEndState").css("display", "inline-block");
                } else {
                    $("#showEndState").css("display", "none");
                }
                // if (ret.is_open_slb == 1) {
                //   $("#checkSlb").show();
                // } else {
                //   $("#checkSlb").hide();
                // }
                var showMypro = app.moreAccAdd(
                    ret.wallet_detail.rmb,
                    ret.wallet_detail.deposit,
                    ret.wallet_detail.eth.total_price,
                    ret.wallet_detail.btc.total_price,
                    ret.wallet_detail.ltc.total_price,
                    ret.wallet_detail.bhpc.total_price,
                    ret.wallet_detail.bcny.total_price,
                    ret.wallet_detail.bhp.total_price,
                    ret.wallet_detail.freeze_btc.total_price,
                    ret.wallet_detail.freeze_eth.total_price,
                    ret.wallet_detail.freeze_ltc.total_price,
                    ret.wallet_detail.freeze_bhpc.total_price,
                    ret.wallet_detail.freeze_bhp.total_price,
                    ret.wallet_detail.freeze_bcny.total_price,
                    ret.wallet_detail.pax.total_price,
                    ret.wallet_detail.freeze_pax.total_price,
                    ret.wallet_detail.echem.total_price,
                    ret.wallet_detail.freeze_echem.total_price,
                    ret.wallet_detail.usd.total_price,
                    ret.wallet_detail.freeze_usd.total_price,
                    ret.wallet_detail.eur.total_price,
                    ret.wallet_detail.freeze_eur.total_price,
                    ret.wallet_detail.hkd.total_price,
                    ret.wallet_detail.freeze_hkd.total_price,
                    ret.wallet_detail.bhp_fh.total_price,
                    ret.wallet_detail.usdt.total_price,
                    ret.wallet_detail.usdt_deposit.total_price,
                    ret.wallet_detail.bcny_deposit
                );
                $(".machineNum").text(ret.wallet_detail.machine_num);
                $("#income_sum_value").text(parseFloat(ret.wallet_detail.rmb).toFixed(2));
                var yesTotal = app.moreAccAdd(
                    ret.machine_income_yesterday.eth.total_price,
                    ret.machine_income_yesterday.btc.total_price,
                    ret.machine_income_yesterday.ltc.total_price,
                    ret.machine_income_yesterday.bhpc.total_price,
                    ret.machine_income_yesterday.bhp.total_price,
                    ret.bhpc_income_yesterday.bcny.total_price,
                    ret.bhp_income_yesterday.bcny.total_price
                );
                var changeBtc = String(app.accDiv(showMypro, ret.wallet_detail.btc_price)).replace(/([0-9]+\.[0-9]{8})[0-9]*/, "$1");
                $(".hideYdy").text("≈ ");
                $("#mymoeny span").text((showMypro == 0 ? "0.00" : app.outputmoney(showMypro)) + " CNY");
                $("#changeBtc").text(showMypro == 0 ? "0.00" : changeBtc);
                $(".myCnyNumber").text(ret.wallet_detail.rmb); //找何李填数据
                $(".myBcnyNumber").text(ret.wallet_detail.bcny.total_price);
                if (ret.is_bhp_fh == 1) {
                    $(".bhpManage").text("已开通自动转入");
                    isOpenBhpSW = 1;
                } else {
                    $(".bhpManage").text("未开通自动转入");
                    isOpenBhpSW = 0;
                }
                $(".midlle-left span").text(
                    "￥ " + (yesTotal == 0 ? "--" : app.outputmoney(yesTotal))
                );
                $("#showImg").attr("src", "../../image/openax.png");
                $("#showImg").css({
                    width: "0.54rem",
                    height: "0.3rem"
                });
                app.mQia.getUnreadMessageCount(function(ret) {
                    if (ret.count > 0) {
                        $("#showService").show();
                    } else {
                        $("#showService").hide();
                    }
                })
            }
        });
    };

    function hideMoney() {
        var account = app.getAccount();
        checkTezt(account);
        $("#mymoeny>span").text("*******");
        $(".hideYdy").text("");
        $("#changeBtc").text("*******");
        $(".midlle-rigth>span").text("*******");
        $(".midlle-left span").text("*******");
        $(".midlle-left").css({
            display: "flex",
            alignItems: "center"
        });
        $("#showImg").attr("src", "../../image/closex.png");
        $("#showImg").css({
            width: "0.4rem",
            height: "0.15rem"
        });
        app.getProperties(function(ret) {
            if (ret.code == 1) {
                isHaveBuyBhp = ret.is_support_buy_bhp;
                if (ret.is_support_buy_bhp == 1) {
                    $("#agrentSellText").text("委托交易");
                } else {
                    $("#agrentSellText").text("委托代售");
                }
                if (ret.wallet_detail.is_show_power_node == 1) {
                    $("#joinNode").show();
                } else {
                    $("#joinNode").hide();
                }
                if (ret.regular_will_end == 1) {
                    $("#showEndState").css("display", "inline-block");
                } else {
                    $("#showEndState").css("display", "none");
                }
                // if (ret.is_open_slb == 1) {
                //   $("#checkSlb").show();
                // } else {
                //   $("#checkSlb").hide();
                // }
                if (ret.is_bhp_fh == 1) {
                    $(".bhpManage").text("已开通自动转入");
                    isOpenBhpSW = 1;
                } else {
                    $(".bhpManage").text("未开通自动转入");
                    isOpenBhpSW = 0;
                }
            }
        });
        app.mQia.getUnreadMessageCount(function(ret) {
            if (ret.count > 0) {
                $("#showService").show();
            } else {
                $("#showService").hide();
            }
        })
    };
    $("#showEyes").click(function() {
        var showState = $("#mymoeny").attr("data-flag");
        if (showState == "true") {
            app.setShowmoney("false");
            $("#mymoeny>span").text("*******");
            $(".midlle-rigth>span").text("*******");
            $(".midlle-left span").text("*******");
            $(".hideYdy").text("");
            $("#changeBtc").text("*******");
            $(".midlle-left").css({
                display: "flex",
                alignItems: "center"
            });
            $(".myCnyNumber").text("*******");
            $(".myBcnyNumber").text("*******");
            $("#showImg").attr("src", "../../image/closex.png");
            $("#showImg").css({
                width: "0.4rem",
                height: "0.15rem"
            });
            $("#mymoeny").attr("data-flag", "false");
        } else {
            app.setShowmoney("true");
            showMoney()
            $("#mymoeny").attr("data-flag", "true");
        }
    });

    $("#gosafetPage").click(function() {
        app.openWin({
            name: "safetyset",
            url: app.hd + "my/safetyset.html",
            slidBackEnabled: false
        })
    });
    app.downRefresh(function() {
        var showStatuNew = app.getShowmoney();
        if (showStatuNew != "true") {
            hideMoney();
        } else {
            showMoney();
        }
    });
    app.listen("gocheckPass", function() {
        var goCerfition = {
            page: "common/headerwin",
            name: "choosecerfertion_headerwin",
            param: {
                subpage: "my/choosecerfertion",
                name: "choosecerfertion",
                title: "实名认证",
                goMyPage: true
            }
        };
        var recoinNumber = JSON.stringify(goCerfition);
        app.goPushPage(recoinNumber);
    });
    $("#reandchare").click(function() {
        var account = app.getAccount();
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "otc/permissions",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token
                    }
                },
                closeTips: true,
                callback: function(ret) {
                    app.log("查看是否有OTC权限", JSON.stringify(ret));
                    var goCerfition = {
                        page: "common/headerwin",
                        name: "reandchare_headerwin",
                        param: {
                            subpage: "my/reandchare",
                            name: "reandchare",
                            isShow: "false",
                            isShowOtcProperty: ""
                        }
                    };
                    if (ret.code == 1) {
                        goCerfition.param.isShowOtcProperty = "true";
                    } else {
                        goCerfition.param.isShowOtcProperty = "false";
                    }
                    var recoinNumber = JSON.stringify(goCerfition);
                    app.goPushPage(recoinNumber);
                }
            },
            extra: {
                isflower: true
            }
        });
    });
    $(".goToBcnyPage").on("click", function() {
        var cointypecontract = {
            page: "common/headerwin",
            name: "buyandsellbcny_headerwin",
            param: {
                subpage: "my/buyandsellbcny",
                name: "buyandsellbcny",
                title: "BCNY兑换",
                allowEdit: true,
                isForeign: isForeign,
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
        };
        var recoinNumber = JSON.stringify(cointypecontract);
        app.goPushPage(recoinNumber);
    });

    $(".goBhpSWpage").on("click", function() {
        var goCerfition = {};
        if (isOpenBhpSW == 0) {
            goCerfition = {
                page: "common/headerwin",
                name: "bhpmanage_headerwin",
                param: {
                    title: "双挖BHP管理",
                    subpage: "my/bhpmanage",
                    name: "bhpmanage"
                    // rightIcon: {
                    //   icon: "../../image/shuomingx.png"
                    // },
                    // eventTrigger: "bhpOpenArgee"
                }
            }
        } else {
            goCerfition = {
                page: "common/headerwin",
                name: "bhpcloseopen_headerwin",
                param: {
                    title: "双挖BHP管理",
                    subpage: "my/bhpcloseopen",
                    name: "bhpcloseopen"
                }
            }
        }
        var recoinNumber = JSON.stringify(goCerfition);
        app.goPushPage(recoinNumber);
    });
    $("#gosafered").click(function() {
        var sfczUrl = "https://hb.renrenmine.com/hongbao/#/hongbao/login?from=app&account=" + account
        app.openWin({
            name: "browser_headerwin",
            url: app.hd + "common/headerwin.html",
            pageParam: {
                subpage: sfczUrl,
                name: "browser",
                type: "remote",
                isremote: "true",
                title: "我的红包"
            }
        });
    });
    $("#goService").click(function() {
        var param = {
            appkey: "42f3b29b3c9e0bb33914788791becc2d"
        };
        app.mQia.setTitleColor({
            color: "#ffd203"
        });
        app.mQia.setClientInfo({
            avatar: account.avatar,
            tel: account.mobile,
            name: account.username
        });
        app.mQia.setLoginCustomizedId({
            id: "renrenmine" + account.uid
        })
        app.mQia.setScheduledAgentOrAgentGroup({
            agentGroup: "3c1ec6a2acfec110648e88850f40de8a",
            scheduleRule: "group"
        });
        //初始化美洽
        app.mQia.initMeiQia(param, function(ret, err) {
            if (ret) {
                app.mQia.show({
                    showAvatar: false
                });
            } else {
                app.toast("初始化失败");
            }
        })
    });
    app.listen('viewappear', function() {
        isForeign = [{
            id: "CNY",
            value: "人民币—CNY"
        }]; //0 不支持添加外币卡  1 支持外币卡
        var showStatuNew = app.getShowmoney();
        if (showStatuNew != "true") {
            hideMoney();
        } else {
            showMoney();
        }
    });
    var events = ["auth_commit_success", 'toPageMine'];
    app.listen(events, function() {
        isForeign = [{
            id: "CNY",
            value: "人民币—CNY"
        }];
        var showStatuNew = app.getShowmoney();
        if (showStatuNew != "true") {
            hideMoney();
        } else {
            showMoney();
        }
    });
    $("#goAgrentSellBuy").click(function() {
        var goCerfition = {
            page: "common/headerwin",
            name: "agentsellandbuy_headerwin",
            param: {
                title: "agentsellandbuy",
                subpage: "my/agentsellandbuy",
                name: "agentsellandbuy",
                showBuyAndSell: "false",
                isHaveBuyBhp: isHaveBuyBhp
            }
        }
        var recoinNumber = JSON.stringify(goCerfition);
        app.goPushPage(recoinNumber);
    })
};