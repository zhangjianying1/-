apiready = function() {
    var app = new APP();
    if (app.ST == "ios") {
        $("input").click(function() {
            $(this).focus().select(); //保险起见，还是加上这句。
        });
    }
    var checkGoMyPage = api.pageParam.checkGoMyPage;
    var tagerHeight = $("#testID").offset().top;
    var account = app.getAccount();
    var payWay = 0; //显示的页面级数。默认是：余额充值页面为0；；；
    var usdtPrice = 1; //usdt兑换汇率
    var btcAddress = ""; //btc充值地址
    var usdtAddress = ""; //usdt充值地址
    var usdtAddNum = ''; //usdt充值数量
    var getChoose = "CNY";
    var isOkwxPay = false;
    var isdataArr; //外币支付方式
    var addType = '';
    if (api.pageParam.addType) {
        addType = api.pageParam.addType;
    }
    var allPayChannel = ["WX_APP", "BANK_TRANSFER", "YSF_APP", "CUSTOMER_SERVICE", "MB_WAP"];
    var canPayChannel = [];
    //筛选出不支持充值方式 比价allPayChannel与ret.pay_channel 取不同的部分说明是不支持
    function getArrDifference(arr1, arr2) {
        return arr1.concat(arr2).filter(function(v, i, arr) {
            return arr.indexOf(v) === arr.lastIndexOf(v);
        });
    }
    //获取支付权限
    function getPayjurisdiction(account, isShowOtc) {
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "member/predepoistPayChannel",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token
                    }
                },
                closeTips: true,
                callback: function(ret) {
                    if (ret.code == 1) {
                        $(".showchoose li").removeClass('ishide').addClass('needShow');
                        canPayChannel = ret.pay_channel;
                        //单独判断是否支持OTC第三方充值
                        if (ret.pay_channel.length > 0 && isShowOtc == true) {
                            for (var i = 0; i < ret.pay_channel.length; i++) {
                                if (ret.pay_channel[i] == "OTC") {
                                    $(".showOtcChoose").show();
                                    $(".payWays>li").eq(1).click();
                                }

                            }
                        }
                        var prhitePayChannel = getArrDifference(allPayChannel, canPayChannel);
                        $.each(prhitePayChannel, function(key, val) {
                            if (val == "CUSTOMER_SERVICE") {
                                $(".otherPay").removeClass('needShow').addClass('ishide');
                            }
                        });

                        function isInArray(arr, value) {
                            for (var i = 0; i < arr.length; i++) {
                                if (value === arr[i]) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        app.log("支付方式限制++++++++++++++++++++++++++++++++++", prhitePayChannel)
                        $(".showchoose>li").each(function() {
                            var labelMethod = $(this).find('label').data('method');
                            if (isInArray(prhitePayChannel, labelMethod)) {
                                $(this).removeClass('needShow').addClass('ishide');
                            } else {
                                $(this).addClass('needShow').removeClass('ishide');
                            }
                        })
                        $("ul").find('.needShow').eq(0).find('input').click();
                    }
                }
            },
            extra: {
                isflower: true
            }
        });
    }
    getPayjurisdiction(account, true);
    var myblance;
    var otherMoney;
    app.getProperties(function(ret) {
        if (ret.code == 1) {
            myblance = Number(ret.wallet_detail.rmb);
            otherMoney = ret.wallet_detail;
            $(".myproty").text(
                (myblance == 0 ? "0.00" : app.outputmoney(myblance)) + " " + "CNY"
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
            var acceptClik = 0;
            var showBankDom = document.querySelector('#showBank');
            var bankIdDom = document.querySelector('#bankId');
            showBankDom.addEventListener('click', function() {
                var bankId = showBankDom.dataset['id'];
                $(".showchoose li input").removeAttr('checked');
                $("#inputReNumber").val("");
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
                            if (getChoose != "CNY") {
                                $(".showchoose li").removeClass('needShow').addClass('ishide');
                                $(".moblieMethod").removeClass('needShow').addClass('ishide');
                                $(".otherPay").removeClass('needShow').addClass('ishide');
                                $(".payTextTips").text("提示：只支持海外银行卡支付充值");
                                $(".publicPayMethod").removeClass('ishide').addClass('needShow');
                                $(".needShow input").prop("checked", true);
                            }
                            if (getChoose == "CNY") {
                                $(".showchoose li").addClass('needShow').removeClass('ishide');
                                $(".payTextTips").text("提示：只支持储蓄卡充值，现金钱包可用于直接支付算力租金")
                                $(".myproty").text(
                                    (myblance == 0 ? "0.00" : app.outputmoney(myblance)) + getChoose
                                );
                                $("ul .needShow").click();
                                $(".moneyUnit").text("元");
                                $(".otherPay").addClass('needShow').removeClass('ishide');
                                getPayjurisdiction(account, false);
                                return
                            }
                            if (getChoose == "USD") {
                                $(".moneyUnit").text("美元");
                                $(".myproty").text(
                                    (Number(otherMoney.usd.coin) == 0 ? "0.00" : app.outputmoney(otherMoney.usd.coin)) + " " + getChoose
                                );
                                return
                            }
                            if (getChoose == "EUR") {
                                $(".moneyUnit").text("欧元");
                                $(".myproty").text(
                                    (Number(otherMoney.eur.coin) == 0 ? "0.00" : app.outputmoney(otherMoney.eur.coin)) + " " + getChoose
                                );
                                return
                            }
                            if (getChoose == "HKD") {
                                $(".moneyUnit").text("港币");
                                $(".myproty").text(
                                    (Number(otherMoney.hkd.coin) == 0 ? "0.00" : app.outputmoney(otherMoney.hkd.coin)) + " " + getChoose
                                );
                            }

                        }
                    }
                );

            });
        }
    });

    function showOtherPay() {
        if ($(".publicPayMethod").length == 0) {
            $(".showchoose").append('<li class="publicPayMethod"><label for="public_pay" data-method="BANK_TRANSFER"><img src="../../res/web/images/duigonga.png" alt="" class="labelTImg" srcset=""><span class="payTitle">对公转账(3000以上大额)</span><input id="public_pay" class="chat-button-location-radio-input" value="BANK_TRANSFER"type="radio" name="payWay" /><span class="checkSt"></span></label></li>')
        } else {
            $(".publicPayMethod").show();
        }
    }
    app.asynchronousAjax("finance/home", {
        uid: account.uid,
        token: account.token
    }, function(ret) {
        app.stopRefresh();
        if (ret.code == 1) {
            $(".btcPrice").text(
                app.toFixed(ret.coin_current_price.price.btc, 2)
            );
            $(".usdtPrice").text(
                app.toFixed(ret.coin_current_price.price.usdt, 4)
            );
            if (addType != '') {
                $('.' + addType + 'Li').click();
            }
        }
    })
    /*---------------------------------------------------*/
    var chooseMethod = 'WX_APP';
    $("#rechargeMoney").click(function() {
        chooseMethod = $(".showchoose input[name=payWay]:checked").val();
        var rechageInput = $("#inputReNumber").val();
        var payMethodShort = chooseMethod.split("_")[0];
        if (!rechageInput) {
            app.toast("请输入充值金额");
            return
        };
        if (chooseMethod == "WX_APP" && rechageInput > 3000) {
            app.toast("超过支付限额，为保证安全，建议使用银联。");
            $(".showchoose li input").removeAttr('checked');
            $(".cardPayMethod input").prop("checked", true);
            return
        }
        if (chooseMethod == "YSF_APP" && rechageInput > 20000) {
            app.toast("超过支付单次限额，建议使用对公转账");
            $(".publicPayMethod input").prop("checked", true);
            return
        }
        if (chooseMethod == "MB_WAP" && rechageInput > 50000) {
            app.toast("超过MO宝支付单次限额，建议使用对公转账");
            $(".publicPayMethod input").prop("checked", true);
            return
        }
        if (chooseMethod == "MB_WAP") {
            var cointypecontract = {
                page: "common/headerwin",
                name: "mobao_pay_headerwin",
                param: {
                    subpage: "mine/mobao_pay",
                    name: "mobao_pay",
                    title: "充值支付",
                    rechageNumber: rechageInput
                }
            };
            var recoinNumber = JSON.stringify(cointypecontract);
            app.goPushPage(recoinNumber);
            return
        }
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "wallet/predepositRecharge",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        channel: getChoose == "CNY" ? chooseMethod : getChoose,
                        total_fee: rechageInput
                    }
                },
                callback: function(ret, err) {
                    app.log("littlemoneyrecharge", "充值返回：" + JSON.stringify(ret));
                    if (ret.code == 1) {
                        // 判断是不是第三方支付
                        if (chooseMethod == "BANK_TRANSFER" || chooseMethod == "C2C_TRANSFER") {
                            app.openWin({
                                name: "desc_headerwin",
                                url: app.hd + "common/headerwin.html",
                                pageParam: {
                                    "subpage": "extrapage/desc",
                                    "name": "desc",
                                    "title": "汇款订单",
                                    "data": ret,
                                    "getChoose": getChoose
                                }
                            });
                        } else if (chooseMethod == "YSF_APP") {
                            var unPay = api.require("unionPay");
                            unPay.pay({
                                tn: ret.pay_params.ysfResponse.tn,
                                devMode: false
                            }, function(ret, err) {
                                // api.alert({ msg: JSON.stringify(ret) });
                                if (ret.result == "success") {
                                    app.reload();
                                    app.toast("支付成功");
                                }
                                if (ret.result == "fail") {
                                    app.toast("支付失败");
                                }
                                if (ret.result == "cancel") {
                                    app.toast("取消支付");
                                }
                            });
                        } else {
                            // 跳转到第三方支付
                            app.pay(payMethodShort, ret.pay_params, function(ret, err) {
                                if (payMethodShort == "WX" && ret.status || payMethodShort == "ALI" && ret.code == "9000") {
                                    app.trigger("littlemoney_recharge_success");
                                    app.tout(100, function() {
                                        app.closeW();
                                    });
                                }
                            });
                        }
                    }
                }
            },
            extra: {
                isflower: true
            }
        });
    });
    /*----------------------usdt   input变化-----------------------------*/
    $("#transferred").bind("input porpertychange", function() {
        usdtAddNum = $(this).val();
        $(".aboutCanAdd").text(app.accMul(Number(usdtAddNum), Number(usdtPrice)));
    });
    /*------------------------usdt 点击充值---------------------------*/
    $("#addUsdt").bind('tap click', function() {
        var transferredNumber = $("#transferred").val();
        var getUserName = $("#cardUserName").val();
        if (!transferredNumber) {
            app.toast("请输入充值金额");
            return
        }
        if (!getUserName) {
            app.toast("请输入转账卡主/支付宝认证姓名");
            return
        }
        app.ajax({
            // 获取OTC充值地址
            param: {
                method: "post",
                url: app.config.url + "otc/pay",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        amount: usdtAddNum,
                        username: getUserName
                    }
                },
                callback: function(ret, err) {
                    app.log("施蒂利克俯拾地芥发送到了发送到见风使舵+++++++++++++++++++", ret);
                    if (ret.code == 1) {
                        app.openWin({
                            name: "browser_headerwin",
                            url: app.hd + "common/headerwin.html",
                            pageParam: {
                                subpage: "common/browser",
                                name: "browser",
                                title: "在线支付",
                                url: ret.jump_url,
                                isThreePay: true
                            },
                        });
                        // app.openSysNavi(ret.jump_url)
                    }
                }
            },
            extra: {
                isflower: true
            }
        });
    });
    /*-------------------------复制充币地址--------------------------*/
    $("#copyAddress").click(function() {
        if (app.clipboard) {
            var text = $("#copyAddress").data("clipboard-text");
            if (text) {
                app.clipboard.set({
                    value: text
                }, function(ret, err) {
                    if (ret.status) {
                        app.toast("复制成功");
                    } else {
                        app.toast("复制失败");
                    }
                });
            } else {
                app.toast("复制不能为空");
            }
        }
    });

    /*----------------------点击头部选择------------------------*/
    $(".payWays>li").bind('tap click', function() {
        if (!$(this).hasClass('isSelected')) {
            $(".payWays>li").removeClass('isSelected');
            $(this).addClass('isSelected');
            payWay = $(this).index();
            $(".outBox>.pageClass").fadeOut(20);
            $(".outBox>.pageClass").eq(payWay).fadeIn(30);
            if ($(this).index() != 0) {
                $(".olay").hide();
                acceptClik = 0;
            };
            if ($(this).attr("data-type") == "addressBtc") {
                app.ajax({
                    // 获取btc充值地址
                    param: {
                        method: "post",
                        url: app.config.url + "wallet/userRechargeCoinAddress",
                        data: {
                            values: {
                                uid: account.uid,
                                token: account.token,
                                currency_name: 'BTC'
                            }
                        },
                        callback: function(ret, err) {
                            if (ret.code == 1 && ret.address != null) {
                                btcAddress = ret.address.wallet_address;
                                $("#btcAddress").text(btcAddress);
                                $("#copyAddress").attr('data-clipboard-text', btcAddress);
                            }
                        }
                    },
                    extra: {
                        isflower: true
                    }
                });
                return
            }
            if ($(this).attr("data-type") == "addressUsdt") {
                app.ajax({
                    param: {
                        method: "post",
                        url: app.config.url + "wallet/userRechargeCoinAddress",
                        data: {
                            values: {
                                uid: account.uid,
                                token: account.token,
                                currency_name: 'USDT'
                            }
                        },
                        callback: function(ret, err) {
                            if (ret.code == 1 && ret.address != null) {
                                usdtAddress = ret.address.wallet_address;
                                $("#usdtAddress").text(usdtAddress);
                                $("#copyAddressUsdt").attr('data-clipboard-text', usdtAddress);
                            }
                        }
                    },
                    extra: {
                        isflower: true
                    }
                });
            }
        }
    });
    $("#copyAddressUsdt").click(function() {
        if (app.clipboard) {
            var text = $("#copyAddressUsdt").attr("data-clipboard-text");
            if (text) {
                app.clipboard.set({
                    value: text
                }, function(ret, err) {
                    app.log("copy", ret);
                    if (ret.status) {
                        app.toast("复制成功");
                    } else {
                        app.toast("复制失败");
                    }
                });
            } else {
                app.toast("复制不能为空");
            }
        }
    });
    $("input[name=payWay]").change(function() {
        chooseMethod = $(this).val();
    });
    $("#inputReNumber").bind('input porpertychange change keyup', function() {
        var thisVal = Number($(this).val());
        if (canPayChannel.indexOf('WX_APP') != -1 && getChoose == 'CNY') {
            if (thisVal > 3000) {
                $(".wxPayMethod").removeClass('needShow').addClass('ishide');
                if (chooseMethod == "WX_APP")
                    $("ul>.needShow").eq(0).find('input').click();
            } else {
                $(".wxPayMethod").removeClass('ishide').addClass('needShow');
            }
        }
        app.log('thisVal++++++++++++++++++++++++++++', thisVal)
        if (canPayChannel.indexOf('MB_WAP') != -1 && getChoose == 'CNY') {
            if (thisVal >= 50000) {
                app.log('隐藏')
                $(".moblieMethod").removeClass('needShow').addClass('ishide');
                if (chooseMethod == "MB_WAP")
                    $("ul>.needShow").eq(0).find('input').click();
            } else {
                $(".moblieMethod").removeClass('ishide').addClass('needShow');
            }
        }
    });
    
};