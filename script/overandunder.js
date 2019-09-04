apiready = function() {
    var app = new APP();
    var sT = app.ST;
    var account = app.getAccount();
    var headerchoose = "myOverTaking"; //默认选择我承接的
    var thisPage = 1; //当前页
    var totalPage = 0; //总共页数
    var canleItemId; //撤销订单ID
    var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    //获取我承接的
    function getMyUnderTake(account, page, isdown) {
        app.ajaxNew("transfer/myUndertake", {
                uid: account.uid,
                token: account.token,
                page: page
            }, true,
            function(ret) {
                if (ret.code == 1) {
                    totalPage = Math.ceil(Number(ret.data.total_count) / 10);
                    ret.data.lists.map(function(item) {
                        item.from_username = item.from_username.length > 10 ? (item.from_username.slice(0, 6) + "…") : item.from_username;
                        item.totalPower = parseInt(app.accMul(item.num, item.base_power));
                        item.name = item.name.length > 10 ? (item.name.slice(0, 10) + "…") : item.name;
                    })
                    // 渲染模板
                    var temp = doT.template($("#ul_list").text());
                    if (isdown) {
                        $("#outcoinlist").html(temp(ret.data.lists));
                    } else {
                        $("#outcoinlist").append(temp(ret.data.lists));
                    }
                    if (thisPage == 1 && ret.data.lists.length == 0) {
                        $("#listState").text("暂时没有相关数据");
                    }
                    if (thisPage < totalPage) {
                        $("#listState").text("加载更多");
                    }
                    if (thisPage >= totalPage) {
                        $("#listState").text("没有更多数据了");
                    }
                } else {
                    app.toast(ret.desc)
                }
            })
    }
    getMyUnderTake(account, thisPage, true);
    //获取我转让的
    function getMytansfer(account, page, isdown) {
        app.ajaxNew("transfer/myTransfer", {
                uid: account.uid,
                token: account.token,
                page: page
            }, true,
            function(ret) {
                if (ret.code == 1) {
                    totalPage = Math.ceil(Number(ret.data.total_count) / 10);
                    ret.data.lists.map(function(item) {
                        item.total_deposit = item.pay_currency == "USDT" ? String(item.total_deposit).replace(refour, "$1") : String(item.total_deposit).replace(re, "$1");
                        item.goods_deposit = item.pay_currency == "USDT" ? String(item.goods_deposit).replace(refour, "$1") : String(item.goods_deposit).replace(re, "$1");
                    })
                    // 渲染模板
                    var temp = doT.template($("#miTransferList").text());
                    if (isdown) {
                        $("#overTakinglist").html(temp(ret.data.lists));
                    } else {
                        $("#overTakinglist").append(temp(ret.data.lists));
                    }
                    if (thisPage == 1 && ret.data.lists.length == 0) {
                        $("#listState").text("暂时没有相关数据");
                    }
                    if (thisPage < totalPage) {
                        $("#listState").text("加载更多");
                    }
                    if (thisPage >= totalPage) {
                        $("#listState").text("没有更多数据了");
                    }
                } else {
                    app.toast(ret.desc)
                }
            }
        )
    }
    $("#outcoinlist").on("click", "li", function() {
        var cointypecontract = {
            page: "common/headerwin",
            name: "my_overtaking_headerwin",
            param: {
                subpage: "transactionpower/my_overtaking",
                name: "my_overtaking",
                title: "合约包详情",
                orderID: $(this).attr("data-orderID"),
                machineId: $(this).attr("data-machineID"),
                machineState: $(this).attr("data-dragStatus")

            }
        };
        var recoinNumber = JSON.stringify(cointypecontract);
        app.goPushPage(recoinNumber);
    });

    $("#overTakinglist").on("click", ".canaleButton", function() {
        var thisSatus = $(this).attr("data-state");
        var thisUndo = $(this).attr("data-isundo");
        if (thisSatus != 0) return
        if (thisSatus == 0 && thisUndo != 1) {
            app.toast("转让十分钟内不可撤销");
            return
        }
        canleItemId = $(this).attr("data-canleId");
        var param = {
            dtype: "dialog5",
            data: {
                title: "温馨提示",
                text: "是否确定撤销此订单",
                btns: [{
                        name: "再想想",
                        event: "NoIthink"
                    },
                    {
                        name: "我要撤销",
                        event: "YesSureBack"
                    }
                ]
            }
        };
        app.dialog(param);
    });
    app.listen("YesSureBack", function() {
        app.ajaxNew("transfer/undo", {
                uid: account.uid,
                token: account.token,
                transfer_id: canleItemId
            }, true,
            function(ret) {
                if (ret.code == 1) {
                    app.trigger("transferBack");
                    app.toast(ret.desc);
                } else {
                    app.toast(ret.desc)
                }
            }
        )
    });
    app.toBottom(function() {
        console.log("------" + thisPage + "-----" + totalPage);
        if (headerchoose == "myOverTaking" && thisPage < totalPage) {
            thisPage++;
            getMyUnderTake(account, thisPage, false);
            return
        }
        if (headerchoose == "myUnderTaking" && thisPage < totalPage) {
            thisPage++;
            getMytansfer(account, thisPage, false);
        }
    });
    app.downRefresh(function() {
        thisPage = 1;
        totalPage = 0;
        if (headerchoose == "myOverTaking") {
            $("#outcoinlist").empty();
            getMyUnderTake(account, thisPage, true);
            return
        }
        if (headerchoose == "myUnderTaking") {
            $("#overTakinglist").empty();
            getMytansfer(account, thisPage, true);
        }
    })
    app.listen("powerChangeList", function(ret) {
        app.log("ret------------------", ret);
        thisPage = 1;
        totalPage = 0;
        headerchoose = ret.value.chooseList;
        if (ret.value.chooseList == "myOverTaking") {
            $("#overTakinglist").empty();
            $(".showList").show();
            getMyUnderTake(account, thisPage, false);
        } else {
            $("#outcoinlist").empty();
            $(".showOverTaking").show();
            getMytansfer(account, thisPage, true);
        }
    });
    app.listen("transferBack", function(params) {
        thisPage = 1;
        totalPage = 0;
        if (headerchoose == "myOverTaking") {
            $("#outcoinlist").empty();
            getMyUnderTake(account, thisPage, true);
            return
        }
        if (headerchoose == "myUnderTaking") {
            $("#overTakinglist").empty();
            getMytansfer(account, thisPage, true);
        }
    });
    var event = ["renew_success", "relet_success", "transferSe"];
    app.listen(event, function() {
        thisPage = 1;
        totalPage = 0;
        if (headerchoose == "myOverTaking") {
            $("#outcoinlist").empty();
            getMyUnderTake(account, thisPage, true);
            return
        }
        if (headerchoose == "myUnderTaking") {
            $("#overTakinglist").empty();
            getMytansfer(account, thisPage, true);
        }
    });
};