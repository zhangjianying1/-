apiready = function () {
    var app = new APP();
    if (app.isiPhone10) {
        $(".phoneToast").height("30px");
        $("#fixBtn").css("padding-bottom", "30px");
        var bodyPa = Number($("#fixBtn").height()) + 10 + 30;
        $("body").css("padding-bottom", bodyPa + "px");
    }
    var machineId = api["pageParam"]["itemId"];
    var machineTypeNew = api["pageParam"]["machineType"];
    $("#goback").on("click", function () {
        api.closeWin();
    });

    function loadpage(machineId) {
        var account = app.getAccount();
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "machine/detail",
                data: {
                    values: {
                        machine_id: machineId,
                        uid: account.uid,
                        token: account.token,
                        machine_type: machineTypeNew
                    }
                },
                callback: function (ret, err) {
                    console.log("--------------------" + JSON.stringify(ret));
                    //判断单台算力单位
                    if (ret.machine.currency_name === "BTC") {
                        machineUnit = "TH/s";
                    } else if (
                        ret.machine.currency_name === "ETH" ||
                        ret.machine.currency_name === "LTC"
                    ) {
                        machineUnit = "MH/s";
                    }
                    // $(".todaynum").text(
                    //     (ret.power_time == 0 ? "0.00" : ret.power_time) + "T*天"
                    // );
                    var limitRentUnit = "T";
                    if (ret.machine.currency_name != "BTC") {
                        limitRentUnit = "M";
                    }
                    // $(".base").text(
                    //     Number(ret.machine.base_power) + limitRentUnit + "/份"
                    // );
                    // $(".float").text(Number(ret.machine.float_power) + limitRentUnit);
                    // $(".qihuo").text(Number(ret.machine.futures_power) + limitRentUnit);
                    // $(".stand").text(Number(ret.machine.regular_power) + limitRentUnit);
                    // $(".pepower").text(Number(ret.machine.pe_power) + limitRentUnit);
                    // $(".calculatePower").text(ret.machine.td_power == undefined ? ("0" + limitRentUnit) : (Number(ret.machine.td_power) + limitRentUnit));
                    // var addRewardPower = app.moreAccAdd(ret.machine.float_power, ret.machine.futures_power, ret.machine.regular_power, ret.machine.pe_power, (ret.machine.td_power == undefined ? "0" : Number(ret.machine.td_power)));
                    // $(".numAll").text(addRewardPower + limitRentUnit + "/份");
                    //处理机器是否能租用
                    if (ret.machine.num_left == 0 && ret.machine.num_sum != 0) {
                        $(".next")
                            .addClass("inputNotNull")
                            .removeClass("inputNull");
                        $(".next").text("已售罄").attr("data-status", "norent");
                    } else if (ret.machine.num_left != 0 && ret.machine.num_sum != 0) {
                        $(".next").text("立即下单").attr("data-status", "okrent");
                    } else if (ret.machine.num_sum == 0) {
                        $(".next").text("关注").attr("data-status", "okfous");
                    }
                    //处理机器数据详情
                    //产品名称
                    $(".name-th").text(ret.machine.name);
                    //单台算力
                    // $(".limit-th").text(ret.machine.num_limit);
                    // $(".digtime").text(ret.machine.time_income);
                    // $(".calculateSource").text(ret.node_name);
                    // $(".disnum").text(
                    //     app.accMul(ret.machine.base_power, ret.machine.num_left) +
                    //     limitRentUnit
                    // );
                    // $(".numadd span:first-of-type").text(
                    //     app.accMul(ret.machine.base_power, ret.machine.num_limit) +
                    //     limitRentUnit
                    // );
                    // $(".data-detail li:first-of-type span").text(
                    //   ret.machine.speed + "个/月"
                    // );
                    // if (ret.machine.is_bhp_pos == 1) {
                    //     $(".bhpcshow").show();
                    //     $(".machine-type").css({
                    //         width: "auto"
                    //     });
                    //     $(".machine-type span").css({
                    //         width: "auto",
                    //         borderColor: "#dee3ff",
                    //         padding: "0 0.1rem"
                    //     });
                    //     $(".machine-type span").css({
                    //         backgroundColor: "#dee3ff"
                    //     });
                    // }
                    // $(".machine-type span:first-of-type").text(
                    //     ret.machine.is_bhp_pos == 1 ?
                    //         ret.machine.currency_name + "+" + "BHP" :
                    //         ret.machine.currency_name
                    // );
                    // //产品租金
                    // $(".deposit").text(
                    //     ret.machine.is_bhp_pos == 1 ?
                    //         ret.machine.goods_deposit_bcny :
                    //         ret.machine.goods_deposit
                    // );
                    //产品期限
                    // $(".daylimit span").text(
                    //     ret.machine.is_regular == 0 ?
                    //         "30天" :
                    //         ret.machine.regular_date_num + "天"
                    //     // : "固定期限"+ret.regular_date_num+"天"
                    // );
                    // $(".moneyType").text(
                    //     ret.machine.is_bhp_pos == 1 ? " BCNY" : " CNY"
                    // );
                    // $(".machine-type span:last-of-type").text(
                    //     ret.machine.is_regular == 0 ? "活期" : "定期"
                    // );
                    //开挖时间
                    // $(".data-detail li:last-of-type span").text(
                    //   ret.machine.time_buy.substring(0, 10)
                    // );
                    // 算力简绍
                    // $(".intrduction li:first-of-type div").text(
                    //     ret.machine.des_computingpower
                    // );
                    // // 合约说明
                    // $(".intrduction li:nth-of-type(2) div").text(
                    //     ret.machine.des_contract
                    // );
                    // $(".intrduction li:nth-of-type(3) div").text(ret.machine.des_rish);

                    //处理租用事件
                    $(".next").on("click", function () {
                        var getName = $(this).attr("data-status");
                        if (getName == "norent") {
                            app.toast("没有设备可租");
                        } else if (getName == "okfous") {
                            app.toast("关注官方发布预告");
                        } else {
                            if (account == null) {
                                app.goLogin();
                            } else {
                                var goPage = {
                                    page: "common/headerwin",
                                    name: "machine_rent_headerwin",
                                    param: {
                                        subpage: "rent/machine_newrent",
                                        name: "machine_rent",
                                        title: "详情",
                                        machinename: ret.machine.name,
                                        machineid: machineId,
                                        num_left: ret.machine.num_left,
                                        checkRegular: ret.machine.is_regular,
                                        num_limit: Number(ret.machine.num_limit),
                                        onceNumlimit: Number(ret.machine.once_limit),
                                        goods_deposit: ret.machine.goods_deposit,
                                        is_bhp_pos: ret.machine.is_bhp_pos,
                                        goods_deposit_bhpc: ret.machine.goods_deposit_bcny,
                                        is_big_customer: ret.machine.is_big_customer,
                                        minRent: ret.machine.num_min_limit,
                                        machineType: ret.machine.currency_name,
                                        machineTypeNew: machineTypeNew,
                                        machineData: ret.machine,
                                        bcny_left: ret.user.bcny,
                                        usdt_left: ret.user.usdt,
                                        ret : ret,
                                        is_captcha:ret.is_captcha
                                    }
                                };
                                var addPhone = JSON.stringify(goPage);
                                app.goPushPage(addPhone);
                            }
                        }
                    });


                   
                    //  开挖时间
                    $(".data-detail li:last-of-type span").text(
                      ret.machine.time_buy.substring(0, 10)
                    );
                    //  算力简绍
                    $(".intrduction li:first-of-type div").text(
                        ret.machine.des_computingpower
                    );

                    //自动触发
                    $(".next").click();
                }
            }
        });
    }
    loadpage(machineId);
    $(".allowget").on("click", function () {
        $(".cover").show();
        $(".cover").fadeIn(50, function (param) {
            $(".suanli-list").slideDown(80);
            $(".off-cover").show();
        });
    });
    $(".off-cover").click(function () {
        $(".suanli-list").slideUp(80, function (param) {
            $(".cover").fadeOut(50);
        });
    });
    $(".showlistnew").on("click", function () {
        $(".cover-full").show();
        $(".cover-full").fadeIn(50, function (param) {
            $(".enntueList").slideDown(80);
            $(".off-cover").show();
        });
    });
    $(".off-covernew").click(function () {
        $(".enntueList").slideUp(80, function (param) {
            $(".cover-full").fadeOut(50);
        });
    });
};