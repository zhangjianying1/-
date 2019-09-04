apiready = function () {
    var app = new APP();
    var account = app.getAccount();
    var machineId = api.pageParam.machineID; //订单ID
    var machineDetail = {}; //机器信息
    var is_captcha = 0;//是否支持验证 0 不支持 
    var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    var myUseMoney = {
        myBcny: "",
        myUsdt: ""
    } //我的余额
    app.getProperties(function (ret, err) {
        app.log('ret++++++++++++++++', ret);
        if (ret.code == 1) {
            myUseMoney.myBcny = ret.wallet_detail.bcny;
            myUseMoney.myUsdt = ret.wallet_detail.usdt;
        }
    });

    app.ajax({
        param: {
            method: "post",
            url: app.config.url + "transfer/transferDetail",
            data: {
                values: {
                    uid: account.uid,
                    token: account.token,
                    transfer_id: machineId
                }
            },
            callback: function (ret) {
                if (ret.code == 1) {
                    machineDetail = ret.data;
                    is_captcha = ret.is_captcha;
                    $(".calculateSource").text(ret.data.power_node_name);
                    $(".disnum").text(ret.data.from_username.length > 10 ? (ret.data.from_username.slice(0, 6) + "…") : ret.data.from_username);
                    $(".tranferTime").text(ret.data.time_creat.split(" ")[0]);
                    $(".transsPower").text(ret.data.num + "T");
                    $(".unit").text(ret.data.pay_currency)
                    $(".name-th").text(ret.data.name);
                    if (ret.data.pay_currency == "USDT") {
                        $(".deposit").text(ret.data.total_deposit);
                        $(".goodsDeposit").text(ret.data.goods_deposit + " USDT/T");
                    } else {
                        $(".deposit").text(ret.data.total_deposit.replace(re, "$1"));
                        $(".goodsDeposit").text(ret.data.goods_deposit.replace(re, "$1") + " " + ret.data.pay_currency + "/T");
                    }
                    if (ret.data.is_bhp_pos == 1) {
                        $(".machine-type").css({
                            width: "auto",
                            borderColor: "#dee3ff"
                        });
                        $(".machine-type span").css({
                            width: "auto",
                            borderColor: "#dee3ff",
                            padding: "0 0.1rem"
                        });
                        $(".machine-type span:last-of-type").css({
                            backgroundColor: "#dee3ff"
                        });
                    }
                    $(".machine-type span:first-of-type").text(ret.data.is_bhp_pos == 0 ? "BTC" : "BTC+BHP");
                } else {
                    app.toast(ret.desc)
                }
            }
        },
        extra: {
            isflower: true
        }
    })
    $("#relet").on("click", function () {
        var cointypecontract = {
            page: "common/headerwin",
            name: "paymethod_headerwin",
            param: {
                subpage: "fisrt/paymethod",
                name: "paymethod",
                title: "支付方式",
                machineId: machineId,
                machineDetail: machineDetail,
                myUseMoney: myUseMoney,
                is_captcha: is_captcha
            }
        };
        var recoinNumber = JSON.stringify(cointypecontract);
        app.goPushPage(recoinNumber);
    })
    app.listen("overTakingDialog", function () {
        var param = {
            dtype: "dialog37"
        };
        app.dialog(param);
    })
};