apiready = function() {
    var app = new APP();
    var sT = app.ST;
    if (app.showPhoneHead == false) {
        if (sT == "android") {
            $(".head").css({
                paddingTop: "0.25rem",
                height: "0.7rem"
            });
        } else {
            $(".head").css({
                paddingTop: "0.24rem",
                height: "0.67rem"
            });
        }
        $("#goodslist").css({
            "margin-top": "0.66rem"
        });
    }
    var page = 1;
    var dataArr = [];
    var countDownIds = [];
    var loadedNum = 0;
    var totalPage = 1;
    var numberNowInterval = null;
    var numberNow = Number(new Date());
    var account = app.getAccount();
    var headerChoose = "goBuy" //头部选择 默认为直购;
    var transferPage = 1; //转让页面当前页数
    var transferToatalPage = 0; //转让页面总页数
    var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    var getDataNeed = {
        uid: account.uid,
        token: account.token,
        page: transferPage,
        state: "",
        pay_currency: "",
        is_bhp_pos: "",
        price: 0,
        total_power: 0
    }

    function goodslistBindClcik() {
        $(".itemCanRent")
            .unbind("click")
            .on("click", function() {
                var itemUrl = $(this).attr("data-url");
                var itemId = $(this).attr("data-id");
                var machineType = $(this).attr("data-machineType");
                console.log("公共绑定点击事件++++++++++++" + itemUrl + "+" + itemId + "机器种类" + machineType);
                if (itemUrl && itemId) {
                    app.openWin({
                        name: "itemdetial",
                        url: app.hd + itemUrl + ".html",
                        pageParam: {
                            itemId: itemId,
                            machineType: machineType
                        }
                    });
                }
            });
    }

    function loadPage(page, isdown) {
        console.log("page,isdown,type++++" + page + "-" + isdown + "-");
        app.getProperties(function(ret) {});
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "machine/list",
                data: {
                    values: {
                        uid: account && account.uid ? account.uid : "",
                        token: account && account.token ? account.token : "",
                        page: page,
                        coin_type: "BTC"
                    }
                },
                callback: function(ret, err) {
                    console.log("机器列表" + JSON.stringify(ret));
                    app.closeFlower();
                    app.stopRefresh();
                    if (ret.code == 1) {
                        totalPage = ret.total_page;
                        if (isdown) {
                            for (var i = 0; i < ret.machine_list.length; i++) {
                                ret.machine_list[i].loadedNum = loadedNum;
                            }
                            dataArr = ret.machine_list;
                        } else {
                            for (var i = 0; i < ret.machine_list.length; i++) {
                                ret.machine_list[i].loadedNum = loadedNum;
                                dataArr.push(ret.machine_list[i]);
                            }
                        }
                        dataArr.forEach(function(current) {
                            current.leastPower = app.accMul(
                                current.base_power,
                                current.num_left
                            );
                            if (current.num_left <= 0) {
                                //售罄
                                current.orinStaus = "sellOut";
                            } else {
                                var openTime = numberDate(current.time_buy.replace(/-/g, "/"));
                                current.now = numberNow;
                                current.openTime = openTime;
                                var isWait = openTime - numberNow;
                                current.isWait = isWait;
                                if (current.time_left > 0) {
                                    //待开放
                                    current.orinStaus = "waitOpen";
                                } else {
                                    current.orinStaus = "itemCanRent";
                                }
                            }
                        });
                        numberNowInterval = setInterval(function() {
                            numberNow = Number(new Date());
                        }, 1000);
                        if (dataArr.length > 0) {
                            dataArr.some(function(item) {
                                if (item.num_left <= 0) {
                                    totalPage = page;
                                    $("#listState").text("没有更多数据");
                                }
                            })
                        }
                        addType(dataArr);
                        // 如果是第一页，并且没有数据
                        if (ret.current_page == 1 && dataArr.length == 0) {
                            $("#listState").text("").css("height", 0);
                            $("body").css("padding-top", 0)
                            $(".mill-list").show().css("display", "flex");
                            $("#listState").hide();
                        } else {
                            $("#listState").css("height", "auto").text("没有更多了");
                            $("body").css("padding-top", "0.4rem")
                            $(".mill-list").hide();
                            $("#listState").show();
                        }
                        if (!isdown) {
                            loadedNum += dataArr.length;
                        } else {
                            loadedNum = dataArr.length;
                        }
                        app.handlePage();
                    }
                }
            },
            extra: {
                container: "#goodslist > ul",
                isflower: true
            }
        });
    }
    loadPage(page, true);

    //获取转让列表
    function getTransferData(isdown, getDataNeed) {
        $(".mill-list").hide();
        app.ajaxNew("transfer/transferList",
            getDataNeed, true,
            function(ret) {
                if (ret.code == 1) {
                    transferToatalPage = Math.ceil(Number(ret.total_count) / 10);
                    var myTdPower = ret.user_td;
                    ret.lists.map(function(item) {
                        item.username = item.username.length > 10 ? (item.username.slice(0, 6) + "…") : item.username;
                        item.myTdPower = myTdPower;
                        if (item.pay_currency != "USDT") {
                            item.total_deposit = item.total_deposit.replace(re, "$1");
                            item.goods_deposit = String(item.goods_deposit).replace(re, "$1");
                        } else {
                            item.goods_deposit = String(item.goods_deposit).replace(refour, "$1");
                        }
                    })
                    // 渲染模板
                    var temp = doT.template($("#tranferListData").text());
                    if (isdown) {
                        $(".showmakeOverPower").html(temp(ret.lists));
                    } else {
                        $(".showmakeOverPower").append(temp(ret.lists));
                    }
                    if (transferPage == 1 && ret.lists.length == 0) {
                        $(".listState").text("暂时没有相关数据");
                    }
                    if (transferPage < transferToatalPage) {
                        $(".listState").text("加载更多");
                    }
                    if (transferPage >= transferToatalPage) {
                        $(".listState").text("没有更多数据了");
                    }
                } else {
                    app.toast(ret.desc)
                }
            })
    }

    function numberDate(d) {
        return Number(new Date(d));
    }

    function setStatus() {
        for (var i = 0; i < dataArr.length; i++) {
            if (dataArr[i].orinStaus == "waitOpen") {
                var timeLast = dataArr[i].time_left;
                var ii = i + loadedNum;
                (function(id, timeLast) {
                    // app.log("--------id--------", id);
                    var timer = new app.COUNTDOWN(timeLast);
                    if (timeLast && timeLast > 0) {
                        // app.log("--------timeLast---------", timeLast);
                        $("#button" + id)
                            .removeClass("next")
                            .addClass("inputNull")
                            .attr("data-url", "");
                        timer.start(
                            function(ret, err) {
                                if (ret > 0) {
                                    var timeArr = app.getDuration(ret).split(":");
                                    $("#button" + id)
                                        .find(".leastHour")
                                        .text(timeArr[0]);
                                    $("#button" + id)
                                        .find(".leastMin")
                                        .text(timeArr[1]);
                                    $("#button" + id)
                                        .find(".leastSes")
                                        .text(timeArr[2]);
                                } else {
                                    $("#listItem" + id)
                                        .removeClass("waitOpen")
                                        .addClass("itemCanRent")
                                        .attr("data-url", "fisrt/itemdetial");
                                    goodslistBindClcik();
                                    app.handlePage();
                                }
                            },
                            function(index) {
                                countDownIds.push(index);
                            }
                        );
                    }
                })(ii, timeLast);
            }
        }
    }

    function addType(addItem) {
        var temp = doT.template($("#listTpl").text());
        $("#goodslist > ul").html(temp(addItem));
        setStatus();
        goodslistBindClcik();
    }
    $("#showmakeOverPower").on("click", "li>.showPrice b", function() {
        var thisStstus = $(this).attr("data-status");
        var mypower = Number($(this).attr("data-power"));
        var isBhp = $(this).attr("data-isPos");
        console.log("+----------------------"+mypower+"---------------"+isBhp);
        if (mypower < 1000 && isBhp == "1") {
            app.toast("算龄未达标,不能承接双挖");
            return
        }
        if (thisStstus == 1) return
        if (account.uid == $(this).attr("data-uid")) {
            app.toast("自己转让的订单,无法承接");
            return
        }
        var thisID = $(this).attr("data-machineID");
        var cointypecontract = {
            page: "common/headerwin",
            name: "undertaking_details_headerwin",
            param: {
                subpage: "transactionpower/undertaking_details",
                name: "undertaking_details",
                title: "合约包详情",
                machineID: thisID,
                rightIcon: {
                    icon: "../../image/chenjiex.png"
                },
                eventTrigger: "overTakingDialog"
            }
        };
        var recoinNumber = JSON.stringify(cointypecontract);
        app.goPushPage(recoinNumber);
    })
    // 监听滚动到底部
    app.toBottom(function() {
        app.log("rent", "监听到了滚动到底部");
        app.log("rent", "curPage：" + page + " totalPage：" + totalPage + "转让页面" + transferPage + "-----" + transferToatalPage);
        if (headerChoose == "overTake") {
            if (transferPage < transferToatalPage) {
                transferPage++;
                getDataNeed.page = transferPage;
                getTransferData(false, getDataNeed);
            }
        } else {
            if (page < totalPage) {
                page++;
                loadPage(page, false);
            }
        }
    });
    app.downRefresh(function() {
        $("body").scrollTop(0);
        if (headerChoose == "overTake") {
            transferPage = 1;
            transferToatalPage = 0;
            getDataNeed.page = transferPage;
            $(".showmakeOverPower").empty();
            getTransferData(true, getDataNeed);
        } else {
            loadedNum = 0;
            page = 1;
            $("#goodslist > ul").html("");
            $("#listState").css("height", "auto");
            loadPage(page, true);
            // 清除所有定时器
            for (var i = 0; i < countDownIds.length; i++) {
                window.clearInterval(countDownIds[i]);
            }
        }
    });
    var lisenEveent = ["rent_success", "reloadOrin"];
    app.listen(lisenEveent, function() {
        app.reload();
    });

    //监听转让专区的算力和价格的选择
    app.listen("transferChoose", function(ret) {
        transferPage = 1;
        transferToatalPage = 0;
        getDataNeed.page = transferPage;
        getDataNeed.total_power = ret.value.transferpower;
        getDataNeed.price = ret.value.transferprice;
        $("body").scrollTop(0);
        $(".showmakeOverPower").empty();
        getTransferData(true, getDataNeed);
    });

    //监听转让专区的筛选
    app.listen("chooseOrinItem", function(ret) {
        $("body").scrollTop(0);
        $(".showmakeOverPower").empty();
        transferPage = 1;
        transferToatalPage = 0;
        getDataNeed.page = transferPage;
        getDataNeed.is_bhp_pos = ret.value.worktype;
        getDataNeed.state = ret.value.transStatus;
        getDataNeed.pay_currency = ret.value.payMethod;
        getTransferData(true, getDataNeed);
    })
    app.listen("orinChoose", function(ret) {
        headerChoose = ret.value;
        if (ret.value == "overTake") {
            $(".showmakeOverPower").empty();
            $("#showmakeOverPower").show();
            $("#goodslist").hide();
            getTransferData(true, getDataNeed);
        } else {
            loadedNum = 0;
            page = 1;
            $("#goodslist").show();
            $("#showmakeOverPower").hide();
            $("#goodslist > ul").empty();
            $("#listState").css("height", "auto");
            loadPage(page, true);
            // 清除所有定时器
            for (var i = 0; i < countDownIds.length; i++) {
                window.clearInterval(countDownIds[i]);
            }
        }
    });
    //监听从后台回到前台
    app.listen("orinPageReload", function() {
        $("body").scrollTop(0);
        if (headerChoose == "overTake") {
            transferPage = 1;
            transferToatalPage = 0;
            getDataNeed.page = transferPage;
            $("#goodslist").hide();
            $("#showmakeOverPower").show();
            $(".showmakeOverPower").empty();
            getTransferData(true, getDataNeed);
        } else {
            // 清除所有定时器
            for (var i = 0; i < countDownIds.length; i++) {
                window.clearInterval(countDownIds[i]);
            }
            loadedNum = 0;
            page = 1;
            $("#goodslist > ul").empty();
            $("#listState").css("height", "auto");
            loadPage(page, true);
            $("#goodslist").show();
            $("#showmakeOverPower").hide();
        }
    });
    //监听从承接成功页面回到本页
    app.listen("goTranfer", function() {
        transferPage = 1;
        transferToatalPage = 0;
        getDataNeed.page = transferPage;
        $("#goodslist").hide();
        $("#showmakeOverPower").show();
        $(".showmakeOverPower").empty();
        getTransferData(true, getDataNeed);
    })
};