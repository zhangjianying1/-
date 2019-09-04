apiready = function() {
    var app = new APP();
    if (app.ST == "ios") {
        $("input").click(function() {
            $(this)
                .focus()
                .select(); //保险起见，还是加上这句。
        });
    }
    var getAgree = app.getopenAgreement();
    var account = app.getAccount();
    var choose = "agentBuy"; //选择代购还是代售 agentBuy 代购 agentSell 代售
    var typeCoin = "BTC"; //选择币种
    var nowEsture = false; //判断当前选择的是 false 委托   true成交
    var todayCoinUnit; //所有代购币种今日单价
    var todaySellUnit; //所有代售币种今日价格
    var coinPrices; //所有币种资产
    var minBuyCoin; //最小限至币量
    var ischeck = 1; //0 在区间内 1 小于最小值 2大于最大值
    var backId; //撤销订单ID
    var curPage = 1;
    var totalPage = 0;
    var replaceEight = /([0-9]+\.[0-9]{8})[0-9]*/;
    var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    var isHaveBuyBhp = api.pageParam.isHaveBuyBhp; //是否具有购买BHP的资格   1有 0没有
    if (isHaveBuyBhp != 1) {
        choose = "agentSell";
    }
    //判断用户是否同意协议
    if (getAgree == "false") {
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "trade/contract",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token
                    }
                },
                callback: function(ret, err) {
                    app.stopRefresh();
                    if (ret.code == 1) {
                        var param = {
                            dtype: "dialog27",
                            data: {
                                html: ret.content
                            }
                        };
                        app.dialog(param);
                    }
                }
            }
        });
    }
    //填充切换时列表数据
    function addText() {
        $(".chooseType").text(typeCoin);
        if (choose == "agentBuy") {
            $(".myCoin").text(coinPrices.bcny.coin + "   " + "BCNY");
            getRecodeList(curPage, true, "buy", nowEsture);
        } else {
            getRecodeList(curPage, true, "sell", nowEsture);
        }
        if (typeCoin == "BTC" && choose == "agentBuy") {
            $(".adviceBuy").text(todayCoinUnit.BTC);
            return false
        }
        if (typeCoin == "BTC" && choose == "agentSell") {
            $(".myCoinNew").text(
                coinPrices.btc.coin.replace(replaceEight, "$1") + "   " + typeCoin
            );
            $(".advicePrecie").text(todaySellUnit.btc);
            return false
        }
        if (typeCoin == "ETH" && choose == "agentBuy") {
            $(".adviceBuy").text(todayCoinUnit.ETH);
            return false
        }
        if (typeCoin == "ETH" && choose == "agentSell") {
            $(".myCoinNew").text(
                coinPrices.eth.coin.replace(replaceEight, "$1") + "   " + typeCoin
            );
            $(".advicePrecie").text(todaySellUnit.eth);
            return false
        }
        if (typeCoin == "LTC" && choose == "agentBuy") {
            $(".adviceBuy").text(todayCoinUnit.LTC);
            return false
        }
        if (typeCoin == "LTC" && choose == "agentSell") {
            $(".myCoinNew").text(
                coinPrices.ltc.coin.replace(replaceEight, "$1") + "   " + typeCoin
            );
            $(".advicePrecie").text(todaySellUnit.ltc);
            return false
        }
        if (typeCoin == "BHP" && choose == "agentBuy") {
            $(".adviceBuy").text(todayCoinUnit.BHP);
            return false
        }
        if (typeCoin == "BHP" && choose == "agentSell") {
            $(".myCoinNew").text(
                coinPrices.bhp.coin.replace(refour, "$1") + "   " + typeCoin
            );
            $(".advicePrecie").text(todaySellUnit.bhp);
        }
    }

    function getMyPrice() {
        app.getProperties(function(ret) {
            if (ret.code == 1) {
                console.log("----------------------1")
                coinPrices = ret.wallet_detail;
                todayCoinUnit = ret.data;
                app.ajax({
                    param: {
                        method: "post",
                        url: app.config.url + "wallet/userBuyCoinPrice",
                        data: {
                            values: {
                                uid: account.uid,
                                token: account.token
                            }
                        },
                        callback: function(ret, err) {
                            console.log("获取代购币价返回：" + JSON.stringify(ret));
                            app.stopRefresh();
                            if (ret.code == 1) {
                                $(".adviceBuy").text(ret.data.BHP);
                                todayCoinUnit = ret.data;
                                addText();
                            }
                        }
                    }
                });
            }
        });
    }
    //   请求我的委托列表
    function getCurrentlist(account, page, typeCoin, agentType) {
        app.asynchronousAjax("wallet/entrustTradingList", {
            uid: account.uid,
            token: account.token,
            page: page,
            sort: "desc",
            currency_name: typeCoin,
            trade_type: agentType,
            trade_status: "10,20"
        }, function(ret) {
            app.stopRefresh();
            if (ret.code == 1) {
                totalPage = ret.total_page;
                var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
                ret.list.map(function(item) {
                        if (item.currency_name == "BHP") {
                            item.num = String(item.num).replace(refour, "$1");
                            item.ex_num = String(item.ex_num).replace(refour, "$1");
                        }
                    })
                    // 渲染模板
                var temp = doT.template($("#indent").text());
                if (isdown) {
                    $("#ul_list").html(temp(ret.list));
                } else {
                    $("#ul_list").append(temp(ret.list));
                }
                if (curPage == 1 && ret.list.length == 0) {
                    $("#listState").text("暂时没有相关数据");
                }
            }
        })
    }
    //请求我的成交列表
    function getSuccesslist(account, page, typeCoin, agentType) {
        app.asynchronousAjax("wallet/entrustTradingList", {
            uid: account.uid,
            token: account.token,
            page: page,
            sort: "desc",
            currency_name: typeCoin,
            trade_type: agentType,
            trade_status: "30,0"
        }, function(ret) {
            app.stopRefresh();
            if (ret.code == 1) totalPage = ret.total_page;
            var myExchaneg = [];
            if (ret.list.length > 5) {
                myExchaneg = ret.list.slice(0, 5);
            } else {
                myExchaneg = ret.list;
            }
            ret.list.map(function(item) {
                    if (item.currency_name == "BHP") {
                        item.num = String(item.num).replace(refour, "$1");
                        item.ex_num = String(item.ex_num).replace(refour, "$1");
                    }
                })
                // 渲染模板
            var temp = doT.template($("#indentScuess").text());
            if (isdown) {
                $("#ul_list").html(temp(myExchaneg));
            } else {
                return;
            }
            if (curPage == 1 && ret.list.length == 0) {
                $("#listState").text("暂时没有相关数据");
            }
        })
    }

    $("#ul_list").on("click", "li b", function(params) {
        backId = $(this).attr("data-id");
        var param = {
            dtype: "dialog1",
            data: {
                text: "亲,你确定要撤销该订单吗？",
                btns: [{
                        name: "再想想",
                        event: "YesBack"
                    },
                    {
                        name: "确定撤销",
                        event: "NoBack"
                    }
                ]
            }
        };
        app.dialog(param);
    });
    $("#getBuyPrice").on("input porpertychange", function() {
        var thisVal = $(this).val();
        var checkNumber = /^\d+(?:\.\d{0,2})?$/;
        if (checkNumber.test(thisVal)) {
            $(this).val(thisVal);
        } else {
            var textThisNum = $("#getBuyPrice")
                .val()
                .replace(re, "$1");
            $("#getBuyPrice").val(textThisNum);
        }
    });

    $("#getBuyNumber").on("input porpertychange", function() {
        var thisVal = $(this).val();
        var checkNumber = /^\d+(?:\.\d{0,8})?$/;
        var checkNumberFour = /^\d+(?:\.\d{0,4})?$/;
        if (typeCoin == "BHP") {
            if (checkNumberFour.test(thisVal)) {
                $(this).val(thisVal);
            } else {
                var textThisNum = $("#getBuyNumber")
                    .val()
                    .replace(refour, "$1");
                $("#getBuyNumber").val(textThisNum);
            }
            return
        }
        if (checkNumber.test(thisVal)) {
            $(this).val(thisVal);
        } else {
            var textThisNum = $("#getBuyNumber")
                .val()
                .replace(replaceEight, "$1");
            $("#getBuyNumber").val(textThisNum);
        }
    });
    $(".buyBox input").on("input porpertychange", function() {
        var inputTotal = 0;
        var thisBuyInputNumber = $("#getBuyNumber").val();
        var thisBuyInputPrice = $("#getBuyPrice").val();
        if (thisBuyInputNumber && thisBuyInputPrice) {
            inputTotal = app.accMul(thisBuyInputNumber, thisBuyInputPrice);
            var textThisNumSell = String(inputTotal).replace(re, "$1");
            if (inputTotal > coinPrices.bcny.total_price) {
                $(".balanceNum").hide();
                $(".balanceBcnyNum").show();
            } else {
                $(".balanceBcnyNum").hide();
                $(".balanceNum").hide();
            }
            $(".needMoney").text(textThisNumSell + "   BCNY");
        } else {
            $(".needMoney").text("0.00" + "   BCNY");
            $(".balanceNum").hide();
            $(".balanceBcnyNum").hide();
        }
    });

    //委托代售
    $("#getSellPrice").on("input porpertychange", function() {
        var thisVal = $(this).val();
        var checkNumber = /^\d+(?:\.\d{0,2})?$/;
        if (checkNumber.test(thisVal)) {
            $(this).val(thisVal);
        } else {
            var textThisNumSell = $("#getSellPrice")
                .val()
                .replace(re, "$1");
            $("#getSellPrice").val(textThisNumSell);
        }
    });

    $("#getSellNumber").on("input porpertychange", function() {
        var thisVal = $(this).val();
        var checkNumber = /^\d+(?:\.\d{0,8})?$/;
        var checkNumberFour = /^\d+(?:\.\d{0,4})?$/;
        if (typeCoin == "BHP") {
            if (checkNumberFour.test(thisVal)) {
                $(this).val(thisVal);
            } else {
                var textThisNumSell = $("#getSellNumber")
                    .val()
                    .replace(refour, "$1");
                $("#getSellNumber").val(textThisNumSell);
            }
            return
        }
        if (checkNumber.test(thisVal)) {
            $(this).val(thisVal);
        } else {
            var textThisNumSell = $("#getSellNumber")
                .val()
                .replace(replaceEight, "$1");
            $("#getSellNumber").val(textThisNumSell);
        }
    });

    $(".sellBox input").on("input porpertychange", function() {
        var inputTotal = 0;
        var thisSellInputNumber = $("#getSellNumber").val();
        var thisSellInputPrice = $("#getSellPrice").val();
        if (thisSellInputNumber && thisSellInputPrice) {
            if (
                typeCoin == "BTC" &&
                Number(thisSellInputNumber) >
                Number(coinPrices.btc.coin.replace(replaceEight, "$1"))
            ) {
                $("#getSellNumber").val(
                    coinPrices.btc.coin.replace(replaceEight, "$1")
                );
                thisSellInputNumber = coinPrices.btc.coin.replace(replaceEight, "$1");
            }
            if (
                typeCoin == "ETH" &&
                Number(thisSellInputNumber) >
                coinPrices.eth.coin.replace(replaceEight, "$1")
            ) {
                $("#getSellNumber").val(
                    coinPrices.eth.coin.replace(replaceEight, "$1")
                );
                thisSellInputNumber = coinPrices.eth.coin.replace(replaceEight, "$1");
            }
            if (
                typeCoin == "LTC" &&
                Number(thisSellInputNumber) >
                coinPrices.ltc.coin.replace(replaceEight, "$1")
            ) {
                $("#getSellNumber").val(
                    coinPrices.ltc.coin.replace(replaceEight, "$1")
                );
                thisSellInputNumber = coinPrices.ltc.coin.replace(replaceEight, "$1");
            }
            if (
                typeCoin == "BHP" &&
                Number(thisSellInputNumber) >
                coinPrices.bhp.coin.replace(replaceEight, "$1")
            ) {
                $("#getSellNumber").val(
                    coinPrices.bhp.coin.replace(replaceEight, "$1")
                );
                thisSellInputNumber = coinPrices.bhp.coin.replace(replaceEight, "$1");
            }
            inputTotal = app.accMul(thisSellInputNumber, thisSellInputPrice);
            var textThisNumSell = String(inputTotal).replace(re, "$1");
            $(".getBack").text(textThisNumSell + "   BCNY");

        }
    });






}