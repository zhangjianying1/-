apiready = function () {
    var app = new APP();
    var account = app.getAccount();
    function getMyCalc(account) {
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "member/userData",
                data: {
                    values: {
                        uid: account.uid,
                        token: account.token
                    }
                },
                callback: function (ret, err) {
                    app.stopRefresh();
                    if (ret.code == 1) {
                        app.log("算力进阶指南++++++++++++++++++++++", ret);
                        var forceNumber = Number(ret.data.my_td) == 0 ? "0.00" : ret.data.my_td;
                        $(".presentCalculate").text(forceNumber);
                        var meanNumber = Number(ret.data.people_add); //平均增长速度
                        var myaddNumber = Number(ret.data.my_add); //我的增长
                        var boundary = ret.data.percent_td;
                        $(".firstTop").text("(大于" + ret.data.percent_td.td_p99 + ")");
                        $(".secrendTop").text('(' + ret.data.percent_td.td_p94 + "—" + ret.data.percent_td.td_p99 + ")");
                        $(".threeTop").text('(' + ret.data.percent_td.td_p80 + "—" + ret.data.percent_td.td_p94 + ")");
                        $(".frouthTop").text("(1000—" + ret.data.percent_td.td_p80 + ")");
                        checKQualified(Number(ret.data.my_td), meanNumber, myaddNumber, boundary)
                    }
                }
            },
            extra: {
                isflower: true,
                delay: 200,
            }
        });
    }
    getMyCalc(account);

    function checKQualified(calcuNumber, meanNuber, myaddNumber, boundary) {
        var caluPercentage = 0; //我的算龄于目标算龄的百分比
        var statusLevel = 4; //所在等级
        var levelText = ""; //所在等级文字
        var checkReg = /([0-9]+\.[0-9]{2})[0-9]*/
        if (calcuNumber < 1000) {
            $(".notQualified").show();
            $(".growthRate>p:first-of-type").hide();
            $(".calculateAverage").text("入门算龄");
            caluPercentage = String(app.accDiv(calcuNumber, 1000)).replace(checkReg, "$1");
            $(".yesPassing").hide();
            $(".noPassing").show();
            $(".mycalaNumber").text("1000TD");
            $(".mycalaNumber").css({
                left: "91%",
                "width": "12%"
            });
            var addNumberMin = 0;
            var timeOutMin = app.accMul(caluPercentage, 100);
            var timer = setInterval(function () {
                if (timeOutMin > 0) {
                    addNumberMin++;
                    $(".showRang p").css("width", addNumberMin + "%");
                    if (addNumberMin == timeOutMin) {
                        clearInterval(timer);
                    }
                }
            }, 5);
        } else {
            $(".notQualified").hide();
            $(".myStatusNum").text(meanNuber);
            $(".meanStausNum").text(myaddNumber)
            $(".growthRate>p:first-of-type").show();
            $(".yesPassing").show();
            $(".noPassing").hide();
            $(".calculateAverage").text(meanNuber + "TD");
            caluPercentage = String(app.accDiv(myaddNumber, meanNuber)).replace(checkReg, "$1");
            if (calcuNumber < boundary.td_p80) {
                $(".imgBg span:last-of-type").html("<img src=" + account.avatar + ">");
                $(".imgBg>b").css("top", "69%");
                statusLevel = 4;
                levelText = "低于第80%位数"
            } else if (calcuNumber < boundary.td_p94) {
                $(".imgBg span:nth-of-type(3)").html("<img src=" + account.avatar + ">");
                $(".imgBg>b").css("top", "53%");
                statusLevel = 3;
                levelText = "高于第80%位数,小于第94%位数"
            } else if (calcuNumber < boundary.td_p99) {
                $(".imgBg span:nth-of-type(2)").html("<img src=" + account.avatar + ">");
                $(".imgBg>b").css("top", "36%");
                statusLevel = 2;
                levelText = "高于第94%位数,小于第99%位数"
            } else {
                $(".imgBg span:first-of-type").html("<img src=" + account.avatar + ">");
                $(".imgBg>b").css("top", "19%");
                statusLevel = 1;
                levelText = "高于第99位数"
            };
            $(".imgBg>b").show();
            if (myaddNumber - meanNuber >= 0) {
                $(".yesPassing span").text('P' + statusLevel + '区间(算龄' + levelText + ')，日增长速度比人均增长速度高' + (parseInt(myaddNumber - meanNuber) == 0 ? 1 : parseInt(myaddNumber - meanNuber)) + 'TD。坚持成长，等级越高，收益越大');
            } else {
                $(".yesPassing span").text('P' + statusLevel + '区间(算龄' + levelText + ')，日增长速度比人均增长速度少' + parseInt(meanNuber - myaddNumber) + 'TD。快去下单加速成长，成长越快，等级越高，权益更大。');
            }
            var addNumber = 0;
            var timeOut = app.accMul(caluPercentage, 100);
            if (timeOut > 100) {
                timeOut = 80;
                $(".calculateAverage").css("right", "40%");
            } else {
                $(".calculateAverage").css("right", 0);
            }
            var timer = setInterval(function () {
                addNumber++;
                $(".showRang p").css("width", addNumber + "%");
                $(".mycalaNumber").css("left", addNumber - 8 + "%");
                $(".mycalaNumber").text(addNumber * 5 + "TD");
                if (addNumber == timeOut) {
                    $(".mycalaNumber").text(myaddNumber + "TD");
                    clearInterval(timer);
                }
            }, 5);
        }
    }
    $("#goRent").click(function () {
        app.trigger("go_machineList");
    });

}