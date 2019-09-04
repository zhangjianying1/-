apiready = function () {
  var app = new APP();
  if (app.ST == "ios") {
    $("input").click(function () {
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
  var myTotalMoney; //可用余额
  var bcnyTotalMoney; //可用BCNY余额
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
        callback: function (ret, err) {
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

  function getthistext(minBuyCoin) {
    //监听导航栏选择
    api.addEventListener({
        name: "buyAndSell"
      },
      function (ret) {
        app.log(JSON.stringify(ret));
        if (ret && ret.value) {
          typeCoin = ret.value.buyAndSellType.toUpperCase();
          choose = ret.value.showChoose;
          $("#getSellNumber,#getSellPrice,#getBuyNumber,#getBuyPrice").val("");
          $(".balanceNum").hide();
          $(".balanceBcnyNum").hide();
          getMyPrice();
          if (choose == "agentBuy") {
            $(".slidebox").animate({
              left: 0
            }, 150);
          } else {
            $(".slidebox").animate({
                left: -parseInt(app.W) + "px"
              },
              150
            );
          }
          $("#ul_list").empty();
          curPage = 1;
          totalPage = 0;
          if (typeCoin == "BTC") {
            $(".minSellNumber").text(minBuyCoin.btc_min.replace(replaceEight, "$1") + typeCoin);
            return
          }
          if (typeCoin == "ETH") {
            $(".minSellNumber").text(minBuyCoin.eth_min.replace(replaceEight, "$1") + typeCoin);
            return
          }
          if (typeCoin == "LTC") {
            $(".minSellNumber").text(minBuyCoin.ltc_min.replace(replaceEight, "$1") + typeCoin);
            return
          }
          if (typeCoin == "BHP") {
            $(".minSellNumber").text(minBuyCoin.bhp_min.replace(refour, "$1") + typeCoin);
            return
          }
        }
      }
    );
  }

  function getSellCoinPrice(params) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "trade/getTradeBaseInfo",
        data: {
          values: {
            uid: account.uid,
            token: account.token
          }
        },
        callback: function (ret, err) {
          console.log("最小代购或代售返回：" + JSON.stringify(ret));
          app.stopRefresh();
          if (ret.code == 1) {
            todaySellUnit = ret.trade_base_info.repurchase_price;
            minBuyCoin = ret.trade_base_info.repurchase_num_limit;
            getthistext(ret.trade_base_info.repurchase_num_limit);
            $(".advicePrecie").text(todaySellUnit.btc);
            if (typeCoin == "BTC") {
              $(".minSellNumber").text(minBuyCoin.btc_min.replace(replaceEight, "$1") + typeCoin);
              return
            }
            if (typeCoin == "ETH") {
              $(".minSellNumber").text(minBuyCoin.eth_min.replace(replaceEight, "$1") + typeCoin);
              return
            }
            if (typeCoin == "LTC") {
              $(".minSellNumber").text(minBuyCoin.ltc_min.replace(replaceEight, "$1") + typeCoin);
              return
            }
            if (typeCoin == "BHP") {
              $(".minSellNumber").text(minBuyCoin.bhp_min.replace(refour, "$1") + typeCoin);
              return
            }
          }
        }
      }
    });
  }

  function getCoinPrice() {
    app.getProperties(function (ret) {
      if (ret.code == 1) {
        coinPrices = ret.wallet_detail;
        bcnyTotalMoney = ret.wallet_detail.bcny.total_price;
        $(".myCoin").text(coinPrices.bcny.coin + "   " + "BCNY");
        $(".myCoinNew").text(
          coinPrices.btc.coin.replace(replaceEight, "$1") + "   " + typeCoin
        );
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
            callback: function (ret, err) {
              console.log("获取代购币价返回：" + JSON.stringify(ret));
              app.stopRefresh();
              if (ret.code == 1) {
                $(".adviceBuy").text(ret.data.BHP);
                todayCoinUnit = ret.data;
              }
            }
          }
        });
      }
    });
  }
  getCoinPrice();
  getSellCoinPrice();
  //填充切换时列表数据
  function addText() {
    var replaceEight = /([0-9]+\.[0-9]{8})[0-9]*/;
    var replace = /([0-9]+\.[0-9]{4})[0-9]*/;
    if (typeCoin == "BTC") {
      if (choose == "agentBuy") {
        $(".myCoin").text(coinPrices.bcny.coin + "   " + "BCNY");
        $(".adviceBuy").text(todayCoinUnit.BTC);
      } else {
        $(".myCoinNew").text(
          coinPrices.btc.coin.replace(replaceEight, "$1") + "   " + typeCoin
        );
        $(".advicePrecie").text(todaySellUnit.btc);
      }
    }
    if (typeCoin == "ETH") {
      if (choose == "agentBuy") {
        $(".myCoin").text(coinPrices.bcny.coin + "   " + "BCNY");
        $(".adviceBuy").text(todayCoinUnit.ETH);
      } else {
        $(".myCoinNew").text(
          coinPrices.eth.coin.replace(replaceEight, "$1") + "   " + typeCoin
        );
        $(".advicePrecie").text(todaySellUnit.eth);
      }
    }
    if (typeCoin == "LTC") {
      if (choose == "agentBuy") {
        $(".myCoin").text(coinPrices.bcny.coin + "   " + "BCNY");
        $(".adviceBuy").text(todayCoinUnit.LTC);
      } else {
        $(".myCoinNew").text(
          coinPrices.ltc.coin.replace(replaceEight, "$1") + "   " + typeCoin
        );
        $(".advicePrecie").text(todaySellUnit.ltc);
      }
    }
    if (typeCoin == "BHP") {
      if (choose == "agentBuy") {
        $(".myCoin").text(coinPrices.bcny.coin + "   " + "BCNY");
        $(".adviceBuy").text(todayCoinUnit.BHP);
      } else {
        $(".myCoinNew").text(
          coinPrices.bhp.coin.replace(replace, "$1") + "   " + typeCoin
        );
        $(".advicePrecie").text(todaySellUnit.bhp);
      }
    }
    if (typeCoin == "BCNY" && choose == "agentBuy") {
      $(".showBuyRmb").text("代购汇率:");
      $(".myCoin").text(coinPrices.rmb + "   " + "CNY");
      $(".adviceBuy").text("1.00 CNY = 1.00 BCNY");
      $(".unitTag").text("");
      $(".buychoose").text("CNY");
      $(".showText").text("可用余额");
      $(".checkSHow").hide();
      $(".needMoney").text("0.00" + "   CNY");
      $(".showChange").hide();
    }
    if (typeCoin != "BCNY" && choose == "agentBuy") {
      $(".showBuyRmb").text("建议购买价:");
      $(".showText").text("可用资产");
      $(".buychoose").text("BCNY");
      $(".unitTag").text("CNY/个");
      $(".needMoney").text("0.00" + "   BCNY");
      $(".checkSHow").show();
      $(".showChange").show();
    }

    if (typeCoin == "BCNY" && choose == "agentSell") {
      $(".myCoin").text(coinPrices.bcny.coin + "   " + "BCNY");
      $(".addSellPri").text("代售汇率:");
      $(".priceMyBlance").text("资产余额");
      $(".getBack").text("0.00" + "   CNY");
      $(".advicePrecie").text("1.00 CNY = 1.00 BCNY");
      $(".sellTextUnit").text("");
      $(".sellInput").hide();
      $(".sellChange").hide();
    }
    if (typeCoin != "BCNY" && choose == "agentSell") {
      $(".addSellPri").text("建议售出价:");
      $(".priceMyBlance").text("币种资产");
      $(".getBack").text("0.00" + "   BCNY");
      $(".sellTextUnit").text("CNY/个");
      $(".sellInput").show();
      $(".sellChange").show();
    }
    $(".chooseType").text(typeCoin);
    if (choose == "agentBuy") {
      getRecodeList(curPage, true, "buy", nowEsture);
    } else {
      getRecodeList(curPage, true, "sell", nowEsture);
    }
  }

  function getMyPrice() {
    app.getProperties(function (ret) {
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
            callback: function (ret, err) {
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

  $("#getBuyPrice").on("input porpertychange", function () {
    var thisVal = $(this).val();
    var checkNumber = /^\d+(?:\.\d{0,2})?$/;
    if (checkNumber.test(thisVal)) {
      $(this).val(thisVal);
    } else {
      var re = /([0-9]+\.[0-9]{2})[0-9]*/;
      var textThisNum = $("#getBuyPrice")
        .val()
        .replace(re, "$1");
      $("#getBuyPrice").val(textThisNum);
    }
  });

  $("#getBuyNumber").on("input porpertychange", function () {
    var thisVal = $(this).val();
    var checkNumber = /^\d+(?:\.\d{0,8})?$/;
    var checkNumberFour = /^\d+(?:\.\d{0,4})?$/;
    if (typeCoin == "BHP") {
      if (checkNumberFour.test(thisVal)) {
        $(this).val(thisVal);
      } else {
        var re = /([0-9]+\.[0-9]{4})[0-9]*/;
        var textThisNum = $("#getBuyNumber")
          .val()
          .replace(re, "$1");
        $("#getBuyNumber").val(textThisNum);
      }
      return
    }
    if (checkNumber.test(thisVal)) {
      $(this).val(thisVal);
    } else {
      var re = /([0-9]+\.[0-9]{8})[0-9]*/;
      var textThisNum = $("#getBuyNumber")
        .val()
        .replace(re, "$1");
      $("#getBuyNumber").val(textThisNum);
    }
  });
  $(".buyBox input").on("input porpertychange", function () {
    var inputTotal = 0;
    var thisBuyInputNumber = $("#getBuyNumber").val();
    var thisBuyInputPrice = $("#getBuyPrice").val();
    if (typeCoin == "BCNY") {
      if (thisBuyInputNumber) {
        var re = /([0-9]+\.[0-9]{2})[0-9]*/;
        inputTotal = app.accMul(thisBuyInputNumber.replace(re, "$1"), 1);
        var textThisNumBcny = String(inputTotal).replace(re, "$1");
        $("#getBuyNumber").val(thisBuyInputNumber.replace(re, "$1"));
        if (inputTotal > coinPrices.rmb) {
          $(".balanceNum").show();
          $(".balanceBcnyNum").hide();
        } else {
          $(".balanceNum").hide();
          $(".balanceBcnyNum").hide();
        }
        $(".needMoney").text(textThisNumBcny + "   CNY");
      } else {
        $(".needMoney").text("0.00" + "   CNY");
        $(".balanceNum").hide();
        $(".balanceBcnyNum").hide();
      }
    } else {
      if (thisBuyInputNumber && thisBuyInputPrice) {
        inputTotal = app.accMul(thisBuyInputNumber, thisBuyInputPrice);
        var re = /([0-9]+\.[0-9]{2})[0-9]*/;
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
    }
  });

  //委托代售
  $("#getSellPrice").on("input porpertychange", function () {
    var thisVal = $(this).val();
    var checkNumber = /^\d+(?:\.\d{0,2})?$/;
    if (checkNumber.test(thisVal)) {
      $(this).val(thisVal);
    } else {
      var re = /([0-9]+\.[0-9]{2})[0-9]*/;
      var textThisNumSell = $("#getSellPrice")
        .val()
        .replace(re, "$1");
      $("#getSellPrice").val(textThisNumSell);
    }
  });

  $("#getSellNumber").on("input porpertychange", function () {
    var thisVal = $(this).val();
    var checkNumber = /^\d+(?:\.\d{0,8})?$/;
    var checkNumberFour = /^\d+(?:\.\d{0,4})?$/;
    if (typeCoin == "BHP") {
      if (checkNumberFour.test(thisVal)) {
        $(this).val(thisVal);
      } else {
        var re = /([0-9]+\.[0-9]{4})[0-9]*/;
        var textThisNumSell = $("#getSellNumber")
          .val()
          .replace(re, "$1");
        $("#getSellNumber").val(textThisNumSell);
      }
      return
    }
    if (checkNumber.test(thisVal)) {
      $(this).val(thisVal);
    } else {
      var re = /([0-9]+\.[0-9]{8})[0-9]*/;
      var textThisNumSell = $("#getSellNumber")
        .val()
        .replace(re, "$1");
      $("#getSellNumber").val(textThisNumSell);
    }
  });

  $(".sellBox input").on("input porpertychange", function () {
    var inputTotal = 0;
    var thisSellInputNumber = $("#getSellNumber").val();
    var thisSellInputPrice = $("#getSellPrice").val();
    var replaceEight = /([0-9]+\.[0-9]{8})[0-9]*/;
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    if (typeCoin == "BCNY") {
      if (thisSellInputNumber) {
        if (Number(thisSellInputNumber) > coinPrices.bcny.coin) {
          $("#getSellNumber").val(coinPrices.bcny.coin);
          thisSellInputNumber = coinPrices.bcny.coin;
        }
        inputTotal = app.accMul(thisSellInputNumber.replace(re, "$1"), 1);
        var textThisNumBcny = String(inputTotal).replace(re, "$1");
        $("#getSellNumber").val(thisSellInputNumber.replace(re, "$1"));
        $(".getBack").text(textThisNumBcny + "   CNY");
      } else {
        $(".getBack").text("0.00" + "   CNY");
      }
    } else {
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
      } else {
        $(".getBack").text("0.00" + "   BCNY");
      }
    }
  });
  //请求列表数据
  function getRecodeList(page, isdown, agentType, nowEsture) {
    console.log("in---------------" + page + agentType);
    if (nowEsture == false) {
      console.log(
        "当前委托" + "trade_type" + agentType + "currency_name" + typeCoin
      );
      app.ajax({
        param: {
          method: "post",
          url: app.config.url + "wallet/entrustTradingList",
          data: {
            values: {
              // 最好不要下面的两个参数
              uid: account.uid,
              token: account.token,
              page: page,
              sort: "desc",
              currency_name: typeCoin,
              trade_type: agentType,
              trade_status: "10,20"
            }
          },
          callback: function (ret, err) {
            app.log("获取委托列表", "rentList返回：" + JSON.stringify(ret));

            app.stopRefresh();
            if (ret.code == 1) {
              totalPage = ret.total_page;
              var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
              ret.list.map(function (item) {
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
              $("#ul_list li b").on("click", function (params) {
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
              if (curPage == 1 && ret.list.length == 0) {
                $("#listState").text("暂时没有相关数据");
              }
            }
          }
        },
        extra: {
          container: "#ul_list",
          isflower: true
        }
      });
    } else {
      console.log(
        "我的成交" + "trade_type" + agentType + "currency_name" + typeCoin
      );
      //我的成交
      app.ajax({
        param: {
          method: "post",
          url: app.config.url + "wallet/entrustTradingList",
          data: {
            values: {
              // 最好不要下面的两个参数
              uid: account.uid,
              token: account.token,
              page: page,
              sort: "desc",
              currency_name: typeCoin,
              trade_type: agentType,
              trade_status: "30,0"
            }
          },
          callback: function (ret, err) {
            app.log("获取我的成交列表", "rentList返回：" + JSON.stringify(ret));
            app.stopRefresh();
            if (ret.code == 1) {
              totalPage = ret.total_page;
              var myExchaneg = [];
              if (ret.list.length > 5) {
                myExchaneg = ret.list.slice(0, 5);
              } else {
                myExchaneg = ret.list;
              }
              var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
              ret.list.map(function (item) {
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
            }
          }
        },
        extra: {
          container: "#ul_list",
          isflower: true
        }
      });
    }
  }
  $("#goBuyCoin").on("click", function (params) {
    var getInputPrice = $("#getBuyPrice").val();
    var getInPutNumber = $("#getBuyNumber").val();
    if (typeCoin == "BCNY") {
      if (!getInPutNumber) {
        return;
      } else {
        getInputPrice = 1;
      }
    } else {
      if (!getInputPrice && !getInPutNumber) {
        return;
      }
    }
    console.log(
      getInputPrice + "*******" + getInPutNumber + JSON.stringify(minBuyCoin)
    );
    if (
      typeCoin == "BTC" &&
      Number(getInPutNumber) < Number(minBuyCoin.btc_min)
    ) {
      app.toast("BTC最低代购" + minBuyCoin.btc_min);
      return;
    }
    if (
      typeCoin == "BTC" &&
      Number(getInPutNumber) >= Number(minBuyCoin.btc_min)
    ) {
      checkPrice(getInputPrice, todayCoinUnit.BTC);
    }
    if (
      typeCoin == "ETH" &&
      Number(getInPutNumber) < Number(minBuyCoin.eth_min)
    ) {
      app.toast("ETH最低代购" + minBuyCoin.eth_min);
      return;
    }
    if (
      typeCoin == "ETH" &&
      Number(getInPutNumber) >= Number(minBuyCoin.eth_min)
    ) {
      checkPrice(getInputPrice, todayCoinUnit.ETH);
    }
    if (
      typeCoin == "LTC" &&
      Number(getInPutNumber) < Number(minBuyCoin.ltc_min)
    ) {
      app.toast("LTC最低代购" + minBuyCoin.ltc_min);
      return;
    }
    if (
      typeCoin == "LTC" &&
      Number(getInPutNumber) >= Number(minBuyCoin.ltc_min)
    ) {
      checkPrice(getInputPrice, todayCoinUnit.LTC);
    }
    if (
      typeCoin == "BHP" &&
      Number(getInPutNumber) < Number(minBuyCoin.bhp_min)
    ) {
      app.toast("BHP最低代购" + minBuyCoin.bhp_min);
      return;
    }
    if (
      typeCoin == "BHP" &&
      Number(getInPutNumber) >= Number(minBuyCoin.bhp_min)
    ) {
      checkPrice(getInputPrice, todayCoinUnit.BHP);
    }
    if (typeCoin == "BCNY") {
      checkPrice(1, 1);
    }
    var totalMoneyBuy = app.accMul(getInputPrice, getInPutNumber);
    // console.log("totalMoney-----------" + totalMoneyBuy);
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    var allMoneyThis = String(totalMoneyBuy).replace(re, "$1");
    console.log("ischeck" + ischeck);
    var param = {
      dtype: "dialog26",
      data: {
        todayPrice: getInputPrice,
        entNum: getInPutNumber,
        fetureTotal: allMoneyThis,
        coinType: typeCoin,
        ischeck: ischeck
      }
    };
    app.dialog(param);
  });
  $("#goSellCoin").on("click", function (params) {
    var getInputPriceSell = $("#getSellPrice").val();
    var getInPutNumberSell = $("#getSellNumber").val();
    console.log(
      "getsedfdsfd" +
      getInputPriceSell +
      "" +
      getInPutNumberSell +
      JSON.stringify(minBuyCoin)
    );
    if (typeCoin == "BCNY") {
      if (!getInPutNumberSell) {
        return;
      } else {
        getInputPriceSell = 1;
      }
    } else {
      if (!getInputPriceSell && !getInPutNumberSell) {
        return;
      }
    }
    if (
      typeCoin == "BTC" &&
      Number(getInPutNumberSell) < Number(minBuyCoin.btc_min)
    ) {
      app.toast("BTC最低代售" + minBuyCoin.btc_min);
      return;
    }
    if (
      typeCoin == "BTC" &&
      Number(getInPutNumberSell) >= Number(minBuyCoin.btc_min)
    ) {
      checkPrice(getInputPriceSell, todaySellUnit.btc);
    }
    if (
      typeCoin == "ETH" &&
      Number(getInPutNumberSell) < Number(minBuyCoin.eth_min)
    ) {
      app.toast("ETH最低代售" + minBuyCoin.eth_min);
      return;
    }
    if (
      typeCoin == "ETH" &&
      Number(getInPutNumberSell) >= Number(minBuyCoin.eth_min)
    ) {
      checkPrice(getInputPriceSell, todaySellUnit.eth);
    }
    if (
      typeCoin == "LTC" &&
      Number(getInPutNumberSell) < Number(minBuyCoin.ltc_min)
    ) {
      app.toast("LTC最低代售" + minBuyCoin.ltc_min);
      return;
    }
    if (
      typeCoin == "LTC" &&
      Number(getInPutNumberSell) >= Number(minBuyCoin.ltc_min)
    ) {
      checkPrice(getInputPriceSell, todaySellUnit.ltc);
    }
    if (
      typeCoin == "BHP" &&
      Number(getInPutNumberSell) < Number(minBuyCoin.bhp_min)
    ) {
      app.toast("BHP最低代售" + minBuyCoin.bhp_min);
      return;
    }
    if (
      typeCoin == "BHP" &&
      Number(getInPutNumberSell) >= Number(minBuyCoin.bhp_min)
    ) {
      checkPrice(getInputPriceSell, todaySellUnit.bhp);
    }
    if (typeCoin == "BCNY") {
      checkPrice(1, 1);
    }
    var re = /([0-9]+\.[0-9]{2})[0-9]*/;
    var sellTotalMoney = app.accMul(getInputPriceSell, getInPutNumberSell);
    var allMoneySell = String(sellTotalMoney).replace(re, "$1");
    console.log("ischeck" + ischeck);
    var param = {
      dtype: "dialog261",
      data: {
        todayPrice: getInputPriceSell,
        entNum: getInPutNumberSell,
        fetureTotal: allMoneySell,
        coinType: typeCoin,
        ischeckSell: ischeck
      }
    };
    app.dialog(param);
  });
  //判断是否在5%范围内
  function checkPrice(wantBuyPrice, dataCoin) {
    var minNumber = app.accMul(dataCoin, 0.95);
    var maxNumber = app.accMul(dataCoin, 1.05);
    console.log(
      minNumber +
      "----------" +
      maxNumber +
      "************" +
      wantBuyPrice +
      "/////" +
      dataCoin
    );
    if (wantBuyPrice >= minNumber && wantBuyPrice <= maxNumber) {
      console.log("in++++++++++++++++++++++++++++++++++++++");
      ischeck = 0;
    }
    if (wantBuyPrice < minNumber) {
      ischeck = 1;
    }
    if (wantBuyPrice > maxNumber) {
      ischeck = 2;
    }
    console.log("----------------------" + ischeck);
  }
  $("#showcoinList li").click(function (params) {
    $("#showcoinList li").css("borderColor", "#fff");
    $(this).css("borderColor", "#ffd203");
    var checkChoose = $(this).attr("data-flag");
    if (checkChoose == "now") {
      nowEsture = false;
    } else {
      nowEsture = true;
    }
    if (choose == "agentBuy") {
      getRecodeList(curPage, true, "buy", nowEsture);
    } else {
      getRecodeList(curPage, true, "sell", nowEsture);
    }
  });
  $(".showPrice").on("click", function (params) {
    if (typeCoin == "BTC") {
      $("#getBuyPrice").val(todayCoinUnit.BTC);
      $("#getSellPrice").val(todaySellUnit.btc);
    }
    if (typeCoin == "ETH") {
      $("#getBuyPrice").val(todayCoinUnit.ETH);
      $("#getSellPrice").val(todaySellUnit.eth);
    }
    if (typeCoin == "LTC") {
      $("#getBuyPrice").val(todayCoinUnit.LTC);
      $("#getSellPrice").val(todaySellUnit.ltc);
    }
    if (typeCoin == "BHP") {
      $("#getBuyPrice").val(todayCoinUnit.BHP);
      $("#getSellPrice").val(todaySellUnit.bhp);
    }
  });

  app.listen("agreeAgrement", function (params) {
    app.openAgreement("true");
  });
  app.listen("notAgreeAgrement", function (params) {
    app.openAgreement("false");
    app.closeW();
  });
  app.listen("littlemoney_recharge_success", function () {
    getMyPrice();
  });
  //监听代购
  app.listen("agentBuy", function (params) {
    var getInputPriceVal = $("#getBuyPrice").val();
    var getInPutNumberVal = $("#getBuyNumber").val();
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "wallet/entrustTrading",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            currency_name: typeCoin,
            unit_price: getInputPriceVal,
            num: getInPutNumberVal,
            trade_type: "buy"
          }
        },
        callback: function (ret, err) {
          console.log("发起代购返回：" + JSON.stringify(ret));
          app.stopRefresh();
          if (ret.code == 1) {
            app.toast(ret.desc);
            $("#getSellNumber,#getSellPrice,#getBuyNumber,#getBuyPrice").val(
              ""
            );
            $("#ul_list").empty();
            if (choose == "agentBuy") {
              getRecodeList(curPage, true, "buy", nowEsture);
            } else {
              getRecodeList(curPage, true, "sell", nowEsture);
            }
            getMyPrice();
          } else {
            app.toast(ret.desc);
          }
        }
      },
      extra: {
        isflower: true,
        delay: 200
      }
    });
  });
  //监听代售
  app.listen("agentSell", function (params) {
    var getInputPriceValSell = $("#getSellPrice").val();
    var getInPutNumberValSell = $("#getSellNumber").val();
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "wallet/entrustTrading",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            currency_name: typeCoin,
            unit_price: getInputPriceValSell,
            num: getInPutNumberValSell,
            trade_type: "sell"
          }
        },
        callback: function (ret, err) {
          console.log("发起代售返回：" + JSON.stringify(ret));
          app.stopRefresh();
          if (ret.code == 1) {
            app.toast(ret.desc);
            $("#getSellNumber,#getSellPrice,#getBuyNumber,#getBuyPrice").val("");
            app.trigger("bhpcCountChange");
            if (choose == "agentBuy") {
              getRecodeList(curPage, true, "buy", nowEsture);
            } else {
              getRecodeList(curPage, true, "sell", nowEsture);
            }
            getMyPrice();
          } else {
            app.toast(ret.desc);
          }
        }
      },
      extra: {
        isflower: true,
        delay: 200
      }
    });
  });
  app.listen("NoBack", function (params) {
    console.log("订单ID" + backId);
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "wallet/cancleEntrustTrading",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            trade_sn: backId
          }
        },
        callback: function (ret, err) {
          console.log("撤销订单返回：" + JSON.stringify(ret));
          app.stopRefresh();
          if (ret.code == 1) {
            $("#ul_list").empty();
            if (choose == "agentBuy") {
              getRecodeList(curPage, true, "buy", nowEsture);
            } else {
              getRecodeList(curPage, true, "sell", nowEsture);
            }
            getMyPrice();
          } else {
            app.toast(ret.desc);
          }
        }
      },
      extra: {
        isflower: true,
        delay: 200
      }
    });
  });
  if (isHaveBuyBhp == 1) {
    typeCoin = "BHP";
    $(".chooseType").text("BHP");
    getRecodeList(curPage, true, "buy", nowEsture);
  } else {
    api.sendEvent({
      name: "buyAndSell",
      extra: {
        buyAndSellType: "BTC",
        showChoose: "agentSell"
      }
    });
    $(".slidebox").animate({
        left: -parseInt(app.W) + "px"
      },
      150
    );
    getRecodeList(curPage, true, "sell", nowEsture);
  }
  app.downRefresh(function () {
    getMyPrice();
    $("#ul_list").empty();
    curPage = 1;
    totalPage = 0;
    if (choose == "agentBuy") {
      getRecodeList(curPage, true, "buy", nowEsture);
    } else {
      getRecodeList(curPage, true, "sell", nowEsture);
    }
  });
  app.toBottom(function () {
    if (curPage < totalPage) {
      curPage++;
      if (choose == "agentBuy") {
        getRecodeList(curPage, false, "buy", nowEsture);
      } else {
        getRecodeList(curPage, false, "sell", nowEsture);
      }
    }
  });
};