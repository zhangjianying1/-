apiready = function() {
    var app = new APP();
    var account = app.getAccount();
    var getcheckedObj = JSON.parse(app.getSyncStorage("closeShow"));
    var dataCheck = api.pageParam.isgoProper; //获取用户实名认证状态
    var checkMyProperty = {
        isMyblance: "false",
        isMyCoin: "false",
        isMyEchem: "false"
    } //资产统计初始化数据
    var isForeign = [{
        id: "CNY",
        value: "人民币—CNY"
    }]; //0 不支持添加外币卡  1 支持外币卡
    var storeWalletDetail; //储存请求到的我的资产相关数据 
    var re = /([0-9]+\.[0-9]{8})[0-9]*/;
    var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
    var retextTwo = /([0-9]+\.[0-9]{2})[0-9]*/;
    //请求页面数据
    function loadPage(ischoose) {
        // 获取用户余额
        if (account && account.token) {
            app.getProperties(function(ret, err) {
                if (ret.code == 1) {
                    // 设置界面数据
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
                    var newTotalAll = app.moreAccAdd(
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
                        ret.wallet_detail.bcny_deposit,
                        ret.wallet_detail.freeze_usdt.total_price
                    );
                    var allRentMoney = app.moreAccAdd(ret.wallet_detail.usdt_deposit.total_price, ret.wallet_detail.bcny_deposit, ret.wallet_detail.deposit);
                    $(".allRentMoney").text(app.outputmoney(allRentMoney));
                    $(".newtotalProperty").text(app.outputmoney(newTotalAll));
                    $(".rentcoin").text(ret.wallet_detail.deposit);
                    $(".usdtCoin").text(ret.wallet_detail.usdt_deposit.coin);
                    $(".usdtPrice").text(ret.wallet_detail.usdt_deposit.total_price);
                    $(".bcnyCoin").text(ret.wallet_detail.bcny_deposit);
                    $(".bcnyPrice").text(ret.wallet_detail.bcny_deposit);
                    storeWalletDetail = ret.wallet_detail;
                    if (ischoose) {
                        hideZeroCoin(storeWalletDetail)
                    } else {
                        showAllCoin(storeWalletDetail);
                    }
                    // console.log("********************"+JSON.stringify(storeWalletDetail));
                }
            })
        }
    }
    if ($.isPlainObject(getcheckedObj) == true && typeof getcheckedObj == "object") {
        if (getcheckedObj.isMyCoin == "false") {
            loadPage(false);
        }
        if (getcheckedObj.isMyCoin == "true") {
            $("#chooselist").attr("checked", "checked");
            loadPage(true);
        }
    } else {
        loadPage(false);
        app.setStorage("closeShow", checkMyProperty);
        getcheckedObj = JSON.parse(app.getSyncStorage("closeShow"));
    };
    // 格式化数据
    function formatNumber(getNumber) {
        var thisNumber = Number(getNumber) == 0 ? "0.00" : (getNumber.replace(retextTwo, "$1"));
        console.log("-----------------------" + thisNumber)
        return thisNumber
    }
    //显示所有余额
    function showAllBalance(storeWalletDetail) {
        $(".showblanceLi li").show();
        $(".balancetotal").text(storeWalletDetail.rmb);
        $(".balancetotalUsd").text(formatNumber(storeWalletDetail.usd.coin));
        $(".balancetotalEur").text(formatNumber(storeWalletDetail.eur.coin));
        $(".balancetotalHdk").text(formatNumber(storeWalletDetail.hkd.coin));
        var totalCny = app.accAdd(storeWalletDetail.rmb, 0);
        var totalUsd = app.accAdd(storeWalletDetail.usd.total_price, 0);
        var totalEur = app.accAdd(storeWalletDetail.eur.total_price, 0);
        var totalHkd = app.accAdd(storeWalletDetail.hkd.total_price, 0);
        $(".balanceAllCny").text(formatNumber(totalCny));
        $(".balanceAllUsd").text(formatNumber(totalUsd));
        $(".balanceAllEur").text(formatNumber(totalEur));
        $(".balanceAllHkd").text(formatNumber(totalHkd));
    }

    //隐藏0余额
    function hideZeroBalance(storeWalletDetail) {
        var totalCny = app.accAdd(storeWalletDetail.rmb, 0);
        var totalUsd = app.accAdd(storeWalletDetail.usd.total_price, 0);
        var totalEur = app.accAdd(storeWalletDetail.eur.total_price, 0);
        var totalHkd = app.accAdd(storeWalletDetail.hkd.total_price, 0);
        if (Number(totalCny) == 0) {
            $(".liCny").hide();
        } else {
            $(".balancetotal").text(storeWalletDetail.rmb);
            $(".balanceAllCny").text(formatNumber(totalCny));
            $(".freeCny").text(formatNumber(storeWalletDetail.freeze_rmb));
        }
        if (Number(totalUsd) == 0) {
            $(".liUsd").hide();
        } else {
            $(".balancetotalUsd").text(formatNumber(storeWalletDetail.usd.coin));
            $(".balanceAllUsd").text(formatNumber(totalUsd));
            $(".freeUsd").text(formatNumber(storeWalletDetail.freeze_usd.coin));
        }
        if (Number(totalEur) == 0) {
            $(".liEur").hide();
        } else {
            $(".balancetotalEur").text(formatNumber(storeWalletDetail.eur.coin));
            $(".balanceAllEur").text(formatNumber(totalEur));
            $(".freeEur").text(formatNumber(storeWalletDetail.freeze_eur.coin));
        }
        if (Number(totalHkd) == 0) {
            $(".liHkd").hide();
        } else {
            $(".balanceAllHkd").text(formatNumber(totalHkd));
            $(".balancetotalHdk").text(formatNumber(storeWalletDetail.hkd.coin));
            $(".freeHkd").text(formatNumber(storeWalletDetail.freeze_hkd.coin));
        }
    };

    function formatCoin(coinNumber, repalceNumber) {
        var formaNumber = String(coinNumber).replace(repalceNumber, "$1");
        return formaNumber
    }
    //显示所有币种
    function showAllCoin(storeWalletDetail) {
        $(".showCoinLi li").show();
        $(".btccoin").text(formatCoin(storeWalletDetail.btc.coin, re));
        $(".ethcoin").text(formatCoin(storeWalletDetail.eth.coin, re));
        $(".ltccoin").text(formatCoin(storeWalletDetail.ltc.coin, re));
        $(".bhpcoin").text(formatCoin(storeWalletDetail.bhp.coin, refour));
        $(".bhpSeparatecoin").text(formatCoin(storeWalletDetail.bhp_fh.coin, refour));
        $(".bcnycoin").text(formatCoin(storeWalletDetail.bcny.coin, re));
        $(".usdtcoin").text(formatCoin(storeWalletDetail.usdt.coin, refour));
        // var caluBtc = formatCoin(app.accDiv(storeWalletDetail.slb.coin, 3000), retextTwo);
        // $(".slbcoin").text(caluBtc + " T");
        $(".paxcoin").text(formatCoin(storeWalletDetail.pax.coin, retextTwo));
        $(".bhpSweetCoin").text(storeWalletDetail.bhpc_sweet.coin);
        $(".freebtc").text(formatCoin(storeWalletDetail.freeze_btc.coin, re));
        $(".freeeth").text(formatCoin(storeWalletDetail.freeze_eth.coin, re));
        $(".freeltc").text(formatCoin(storeWalletDetail.freeze_ltc.coin, re));
        $(".freebhp").text(formatCoin(storeWalletDetail.freeze_bhp.coin, refour));
        $(".freeusdt").text(formatCoin(storeWalletDetail.freeze_usdt.coin, refour));
        $(".freebcny").text(formatCoin(storeWalletDetail.freeze_bcny.coin, retextTwo));
        $(".freepax").text(formatCoin(storeWalletDetail.freeze_pax.coin, retextTwo));
        $(".freebhpSweet").text(storeWalletDetail.freeze_bhpc_sweet.coin);

        var btcTotal = app.accAdd(
            storeWalletDetail.btc.total_price,
            storeWalletDetail.freeze_btc.total_price
        );

        var ethTotal = app.accAdd(
            storeWalletDetail.eth.total_price,
            storeWalletDetail.freeze_eth.total_price
        );

        var ltcTotal = app.accAdd(
            storeWalletDetail.ltc.total_price,
            storeWalletDetail.freeze_ltc.total_price
        );

        var bhpTotal = app.accAdd(
            storeWalletDetail.bhp.total_price,
            storeWalletDetail.freeze_bhp.total_price
        );
        var usdtTotal = app.accAdd(
            storeWalletDetail.usdt.total_price,
            storeWalletDetail.freeze_usdt.total_price
        );
        var bcnyTotal = app.accAdd(
            storeWalletDetail.bcny.total_price,
            storeWalletDetail.freeze_bcny.total_price
        );

        var paxTotalNew = app.accAdd(
            storeWalletDetail.pax.total_price,
            storeWalletDetail.freeze_pax.total_price
        );
        // var slbTotal = Number(storeWalletDetail.slb.coin);
        var bhpSeparateTotalNew = Number(storeWalletDetail.bhp_fh.total_price)
        $(".totalbtc").text(formatCoin(btcTotal, retextTwo));
        $(".totaletth").text(formatCoin(ethTotal, retextTwo));
        $(".totalltc").text(formatCoin(ltcTotal, retextTwo));
        $(".totalbhp").text(formatCoin(bhpTotal, retextTwo));
        $(".totalbcny").text(formatCoin(bcnyTotal, retextTwo));
        $(".totalpax").text(formatCoin(paxTotalNew, retextTwo));
        $(".totalbhpSeparate").text(formatCoin(bhpSeparateTotalNew, retextTwo));
        // $(".slbcointotal").text(formatCoin(slbTotal, retextTwo));
        $(".totalusdt").text(usdtTotal);
    }
    //隐藏估值0币种
    function hideZeroCoin(storeWalletDetail) {
        var btcTotal = app.accAdd(
            storeWalletDetail.btc.total_price,
            storeWalletDetail.freeze_btc.total_price
        );

        var ethTotal = app.accAdd(
            storeWalletDetail.eth.total_price,
            storeWalletDetail.freeze_eth.total_price
        );

        var ltcTotal = app.accAdd(
            storeWalletDetail.ltc.total_price,
            storeWalletDetail.freeze_ltc.total_price
        );

        var bhpTotal = app.accAdd(
            storeWalletDetail.bhp.total_price,
            storeWalletDetail.freeze_bhp.total_price
        );

        var bcnyTotal = app.accAdd(
            storeWalletDetail.bcny.total_price,
            storeWalletDetail.freeze_bcny.total_price
        );

        var paxTotalNew = app.accAdd(
            storeWalletDetail.pax.total_price,
            storeWalletDetail.freeze_pax.total_price
        );
        var bhpSweetNew = Number(app.accAdd(
            storeWalletDetail.bhpc_sweet.coin,
            storeWalletDetail.freeze_bhpc_sweet.total_price
        ));
        var usdtTotal = app.accAdd(
            storeWalletDetail.usdt.total_price,
            storeWalletDetail.freeze_usdt.total_price
        );
        // var slbTotal = Number(storeWalletDetail.slb.coin);
        var bhpSeparateTotalNew = Number(storeWalletDetail.bhp_fh.total_price);

        if (Number(btcTotal) == 0) {
            $(".btcli").hide();
        } else {
            $(".btccoin").text(formatCoin(storeWalletDetail.btc.coin, re));
            $(".freebtc").text(formatCoin(storeWalletDetail.freeze_btc.coin, re));
            $(".totalbtc").text(formatCoin(btcTotal, retextTwo));
        }
        if (Number(ethTotal) == 0) {
            $(".ethli").hide();
        } else {
            $(".ethcoin").text(formatCoin(storeWalletDetail.eth.coin, re));
            $(".freeeth").text(formatCoin(storeWalletDetail.freeze_eth.coin, re));
            $(".totaletth").text(formatCoin(ethTotal, retextTwo));
        }
        if (Number(ltcTotal) == 0) {
            $(".ltcli").hide();
        } else {
            $(".ltccoin").text(formatCoin(storeWalletDetail.ltc.coin, re));
            $(".freeltc").text(formatCoin(storeWalletDetail.freeze_ltc.coin, re));
            $(".totalltc").text(formatCoin(ltcTotal, retextTwo));
        }
        if (Number(bhpTotal) == 0) {
            $(".bhpli").hide();
        } else {
            $(".bhpcoin").text(formatCoin(storeWalletDetail.bhp.coin, refour));
            $(".freebhp").text(formatCoin(storeWalletDetail.freeze_bhp.coin, refour));
            $(".totalbhp").text(formatCoin(bhpTotal, retextTwo));
        }
        if (Number(bcnyTotal) == 0) {
            $(".bcnyli").hide();
        } else {
            $(".bcnycoin").text(formatCoin(storeWalletDetail.bcny.coin, re));
            $(".freebcny").text(formatCoin(storeWalletDetail.freeze_bcny.coin, retextTwo));
            $(".totalbcny").text(formatCoin(bcnyTotal, retextTwo));
        }
        // if (Number(slbTotal) == 0) {
        //   $(".slbli").hide();
        // } else {
        //   var caluBtc = formatCoin(app.accDiv(storeWalletDetail.slb.coin, 3000), retextTwo);
        //   $(".slbcoin").text(caluBtc + " T");
        //   $(".slbcointotal").text(formatCoin(slbTotal, retextTwo));
        // }
        if (Number(paxTotalNew) == 0) {
            $(".paxli").hide();
        } else {
            $(".paxcoin").text(formatCoin(storeWalletDetail.pax.coin, retextTwo));
            $(".freepax").text(formatCoin(storeWalletDetail.freeze_pax.coin, retextTwo));
            $(".totalpax").text(formatCoin(paxTotalNew, retextTwo));
        }
        if (Number(bhpSweetNew) == 0) {
            $(".bhpSweetli").hide();
        } else {
            $(".bhpSweetCoin").text(storeWalletDetail.bhpc_sweet.coin);
            $(".freebhpSweet").text(storeWalletDetail.freeze_bhpc_sweet.coin);
        }
        if (Number(bhpSeparateTotalNew) == 0) {
            $(".bhpSeparateli").hide();
        } else {
            $(".bhpSeparatecoin").text(formatCoin(storeWalletDetail.bhp_fh.coin, refour));
            $(".totalbhpSeparate").text(formatCoin(bhpSeparateTotalNew, retextTwo));
        }
        if (Number(usdtTotal) == 0) {
            $(".usdtli").hide();
        } else {
            $(".usdtcoin").text(formatCoin(storeWalletDetail.usdt.coin, refour));
            $(".freeusdt").text(formatCoin(storeWalletDetail.freeze_usdt.total_price, refour));
            $(".totalusdt").text(usdtTotal);
        }
    }

    //显示所有证券
    function showAllEchem(storeWalletDetail) {
        $(".showEchemLi").show();
        $(".echemcoin").text(Number(storeWalletDetail.echem.coin) == 0 ? "0" : parseInt(storeWalletDetail.echem.coin));
        $(".totalechem").text(Number(storeWalletDetail.echem.total_price) == 0 ? "0" : parseInt(storeWalletDetail.echem.total_price));
        $(".freeechem").text(storeWalletDetail.freeze_echem.coin == 0 ? 0 : parseInt(storeWalletDetail.freeze_echem.coin));
    }
    //隐藏估值0证券
    function hideZeroEchem(storeWalletDetail) {
        var allEchem = Number(app.moreAccAdd(
            storeWalletDetail.echem.coin,
            storeWalletDetail.echem.total_price,
            storeWalletDetail.freeze_echem.coin
        ))
        if (allEchem == 0) {
            $(".showEchemLi").hide();
        } else {
            $(".echemcoin").text(Number(storeWalletDetail.echem.coin) == 0 ? "0" : parseInt(storeWalletDetail.echem.coin));
            $(".totalechem").text(Number(storeWalletDetail.echem.total_price) == 0 ? "0" : parseInt(storeWalletDetail.echem.total_price));
            $(".freeechem").text(storeWalletDetail.freeze_echem.coin == 0 ? 0 : parseInt(storeWalletDetail.freeze_echem.coin));
        };
    }


    var getChoose = "coinTypeNumber";
    $(".showChooseList li").on("click", function() {
        getChoose = $(this).attr("data-type");
        var getcheckedObj = JSON.parse(app.getSyncStorage("closeShow"));
        $(".showChooseList li span").css({
            color: "#626262",
            borderBottomColor: "#fff",
            fontSize: "0.26rem"
        });
        $(this).find("span").css({
            color: "#181818",
            borderBottomColor: "#ffd203",
            fontSize: "0.3rem"
        });
        $(".showButton>div").hide();
        $(".myBtc").hide();
        $("#allChoosetype > div").hide();
        $("." + getChoose).show();
        $("#" + getChoose).show();
        if (getChoose == "bondNumber") {
            $(".showButton").hide();
        } else {
            $(".showButton").show();
        }
        if (getChoose == "blanceNumber" && getcheckedObj.isMyblance == "false") {
            showAllBalance(storeWalletDetail);
            return
        }
        if (getChoose == "blanceNumber" && getcheckedObj.isMyblance == "true") {
            hideZeroBalance(storeWalletDetail);
            $("#coinTypeInput").attr("checked", "checked");
            return
        }
        if (getChoose == "coinTypeNumber" && getcheckedObj.isMyCoin == "false") {
            showAllCoin(storeWalletDetail);
            return
        }
        if (getChoose == "coinTypeNumber" && getcheckedObj.isMyCoin == "true") {
            hideZeroCoin(storeWalletDetail);
            $("#coinTypeInput").attr("checked", "checked");
            return
        }
        if (getChoose == "bondNumber" && getcheckedObj.isMyEchem == "false") {
            showAllEchem(storeWalletDetail);
            return
        }
        if (getChoose == "bondNumber" && getcheckedObj.isMyEchem == "true") {
            hideZeroEchem(storeWalletDetail);
            $("#bondInput").attr("checked", "checked");
        }
    })


    $("#chooselist").bind("change tap", function() {
        var isChecked = $(this).is(":checked");
        if (isChecked == true) {
            hideZeroBalance(storeWalletDetail);
            getcheckedObj.isMyblance = "true";
        } else {
            showAllBalance(storeWalletDetail);
            getcheckedObj.isMyblance = "false";
        }
        app.setStorage("closeShow", getcheckedObj);
    });
    $("#coinTypeInput").bind("change tap", function() {
        var isChecked = $(this).is(":checked");
        if (isChecked == true) {
            hideZeroCoin(storeWalletDetail);
            getcheckedObj.isMyCoin = "true";
        } else {
            showAllCoin(storeWalletDetail);
            getcheckedObj.isMyCoin = "false";
        }
        app.setStorage("closeShow", getcheckedObj);
    });
    $("#bondInput").bind("change tap", function() {
        var isChecked = $(this).is(":checked");
        if (isChecked == true) {
            hideZeroEchem(storeWalletDetail);
            getcheckedObj.isMyEchem = "true";
        } else {
            showAllEchem(storeWalletDetail);
            getcheckedObj.isMyEchem = "false";
        }
        app.setStorage("closeShow", getcheckedObj);
    });

    $(".goOutCoin").on("click", function() {
        if (dataCheck.statusCode == -2 || dataCheck.statusCode == -1) {
            // 未提交审核
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
                name: "mentionmoney_headerwin",
                param: {
                    subpage: "my/mentionmoney",
                    name: "mentionmoney",
                    title: "提币"
                }
            };
            var recoinNumber = JSON.stringify(cointypecontract);
            app.goPushPage(recoinNumber);
        }
    });
    $(".headAboutLeft").on("click", function() {
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
                    name: "getcash",
                    title: "提现",
                    allowEdit: true
                }
            };
            var recoinNumber = JSON.stringify(cointypecontract);
            app.goPushPage(recoinNumber);
        }
    });
    $(".headAboutRight").on("click", function() {
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
                            allowEdit: true
                        }
                    });
                }
            } else {
                app.toast(ret.desc)
            }
        })
    })
    $(".chargecointype").on("click", function() {
        var cointypecontract = {
            page: "common/headerwin",
            name: "chargecointype_headerwin",
            param: {
                subpage: "my/chargecointype",
                name: "chargecointype",
                title: "充币"
            }
        };
        var recoinNumber = JSON.stringify(cointypecontract);
        app.goPushPage(recoinNumber);
    })
    $(".showCoinLi li").on("click", function() {
        var dataType = $(this).attr("data-type");
        if (dataType == "SLB") return
        if (dataType == "BHPSweet") {
            var goBhpSweetEx = {
                page: "common/headerwin",
                name: "bhpcsweet_headerwin",
                param: {
                    subpage: "my/bhpcsweet",
                    name: "bhpcsweet",
                    title: "BHP糖果兑换",
                    rightIcon: {
                        icon: "../../image/jiedongx.png"
                    },
                    eventTrigger: "bhpcsweetDialog"
                    // right: "权益说明",
                    // listenevent: "bhpcsweetDialog"
                }
            };
            var recoinBhpSweet = JSON.stringify(goBhpSweetEx);
            app.goPushPage(recoinBhpSweet);
            return
        }
        var goCerfition = {
            page: "common/headerwin",
            name: "hedge_headerwin",
            param: {
                subpage: "my/hedge",
                name: "hedge",
                title: "资产明细",
                chooseType: dataType
            }
        };
        var recoinNumber = JSON.stringify(goCerfition);
        app.goPushPage(recoinNumber);
    });
    $(".showEchemLi li").on("click", function() {
        var goCerfition = {
            page: "common/headerwin",
            name: "hedge_headerwin",
            param: {
                subpage: "my/hedge",
                name: "hedge",
                title: "资产明细",
                chooseType: 'EChem'
            }
        };
        var recoinNumber = JSON.stringify(goCerfition);
        app.goPushPage(recoinNumber);
    })
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
    var event = [
        "recharge_commit_success",
        "get_coin_success",
        "entrust_back_success",
        "exchange_success"
    ];
    app.listen(event, function() {
        app.reload();
    });
    app.downRefresh(function() {
        var getcheckedObj = JSON.parse(app.getSyncStorage("closeShow"));
        // app.reload();
        app.getProperties(function(ret, err) {
            if (ret.code == 1) {
                // 设置界面数据
                var newTotalAll = app.moreAccAdd(
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
                    ret.wallet_detail.bcny_deposit,
                    ret.wallet_detail.freeze_usdt.total_price
                );
                var allRentMoney = app.moreAccAdd(ret.wallet_detail.usdt_deposit.total_price, ret.wallet_detail.bcny_deposit, ret.wallet_detail.deposit);
                $(".allRentMoney").text(app.outputmoney(allRentMoney));
                $(".newtotalProperty").text(app.outputmoney(newTotalAll));
                $(".rentcoin").text(ret.wallet_detail.deposit);
                $(".usdtCoin").text(ret.wallet_detail.usdt_deposit.coin);
                $(".usdtPrice").text(ret.wallet_detail.usdt_deposit.total_price);
                $(".bcnyCoin").text(ret.wallet_detail.bcny_deposit);
                $(".bcnyPrice").text(ret.wallet_detail.bcny_deposit);
                storeWalletDetail = ret.wallet_detail;
                if (getChoose == "blanceNumber" && getcheckedObj.isMyblance == "false") {
                    showAllBalance(ret.wallet_detail);
                    return
                }
                if (getChoose == "blanceNumber" && getcheckedObj.isMyblance == "true") {
                    hideZeroBalance(ret.wallet_detail);
                    $("#blanceNumber").attr("checked", "checked");
                    return
                }
                if (getChoose == "coinTypeNumber" && getcheckedObj.isMyCoin == "false") {
                    showAllCoin(ret.wallet_detail);
                    return
                }
                if (getChoose == "coinTypeNumber" && getcheckedObj.isMyCoin == "true") {
                    hideZeroCoin(ret.wallet_detail);
                    $("#coinTypeInput").attr("checked", "checked");
                    return
                }
                if (getChoose == "bondNumber" && getcheckedObj.isMyEchem == "false") {
                    showAllEchem(ret.wallet_detail);
                    return
                }
                if (getChoose == "bondNumber" && getcheckedObj.isMyEchem == "true") {
                    hideZeroEchem(ret.wallet_detail);
                    $("#bondInput").attr("checked", "checked");
                }
            }
        })
    })
};