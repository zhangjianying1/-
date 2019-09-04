apiready = function () {
  var app = new APP();
  if (app.ST == "ios") {
    $("input").click(function () {
      $(this)
        .focus()
        .select(); //保险起见，还是加上这句。
    });
  }
  var account = app.getAccount();
  var choose = "agentBuy"; //选择代购还是代售 agentBuy 代购 agentSell 代售
  var chooseTyPe;
  var mymoney; //我的余额
  var myBcny;
  var getChoose = "CNY"; //买入下拉框选择
  var getSellCHoose = "CNY"; //卖出下拉框选择
  var exchangeRate; //汇率
  var getChooseMoneyNum; //对应币种的数量;
  var thisCoinExchangeRate = 1;
  var isdataArr; //外币支付方式

  function getCoinPrice() {
    app.getProperties(function (ret) {
      if (ret.code == 1) {
        mymoney = ret.wallet_detail.rmb;
        getChooseMoneyNum = ret.wallet_detail.rmb;
        chooseTyPe = ret.wallet_detail;
        myBcny = ret.wallet_detail.bcny.coin;
        exchangeRate = ret.foreign_currency_price;
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
          var person = isForeign.reduce(function (cur, next) {
            obj[next.id] ? "" : obj[next.id] = true && cur.push(next);
            return cur;
          }, []);
          isdataArr = person;
        }
        $(".myCoin").text(app.outputmoney(ret.wallet_detail.rmb) + " CNY");
        $(".myCoinSell").text(ret.wallet_detail.bcny.coin + " BCNY");
        if (choose == "agentBuy") {
          $(".needMoney").text("0.00 " + getChoose);
          if (getChoose == "CNY") {
            $(".myCoin").text(
              (mymoney == 0 ? "0.00" : app.outputmoney(mymoney)) + " CNY"
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + "1 BCNY");
            thisCoinExchangeRate = 1;
            getChooseMoneyNum = mymoney;
            return
          }
          if (getChoose == "USD") {
            $(".myCoin").text(
              (Number(chooseTyPe.usd.coin) == 0 ? "0.00" : app.outputmoney(chooseTyPe.usd.coin)) + " " + getChoose
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + exchangeRate.usd_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.usd_price;
            getChooseMoneyNum = chooseTyPe.usd.coin;
            return
          }
          if (getChoose == "EUR") {
            $(".myCoin").text(
              (Number(chooseTyPe.eur.coin) == 0 ? "0.00" : app.outputmoney(chooseTyPe.eur.coin)) + " " + getChoose
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + exchangeRate.eur_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.eur_price;
            getChooseMoneyNum = chooseTyPe.eur.coin;
            return
          }
          if (getChoose == "HKD") {
            $(".myCoin").text(
              (Number(chooseTyPe.hkd.coin) == 0 ? "0.00" : app.outputmoney(chooseTyPe.hkd.coin)) + " " + getChoose
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + exchangeRate.hkd_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.hkd_price;
            getChooseMoneyNum = chooseTyPe.hkd.coin;
          }
        } else {
          $(".getBack").text("0.00 " + getSellCHoose);
          if (getSellCHoose == "CNY") {
            $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + "1 BCNY");
            thisCoinExchangeRate = 1;
          }
          if (getSellCHoose == "USD") {
            $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + exchangeRate.buy_usd_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.buy_usd_price;
          }
          if (getSellCHoose == "EUR") {
            $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + exchangeRate.buy_eur_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.buy_eur_price;
          }
          if (getSellCHoose == "HKD") {
            $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + exchangeRate.buy_hkd_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.buy_hkd_price;
          }
        }
      }
    });
  }
  getCoinPrice();

  $("#getBuyNumber").on("input porpertychange", function () {
    var thisVal = $(this).val();
    if (thisVal) {
      var re = /([0-9]+\.[0-9]{2})[0-9]*/;
      var textThisNumSell = $("#getBuyNumber")
        .val()
        .replace(re, "$1");
      var textThisTotal = Number(String(app.accDiv(thisVal, thisCoinExchangeRate)).replace(re, "$1"));
      if (textThisTotal > Number(getChooseMoneyNum)) {
        $(".balanceNum").show();
      } else {
        $(".balanceNum").hide();
      }
      $(this).val(textThisNumSell);
      checkNumber(getChoose, Number(textThisNumSell), thisCoinExchangeRate, choose);
    } else {
      checkNumber(getChoose, 0, thisCoinExchangeRate, choose);
      $(".balanceNum").hide();
    }
  });
  $("#getSellNumber").on("input porpertychange", function () {
    var thisVal = $(this).val();
    if (thisVal) {
      var re = /([0-9]+\.[0-9]{2})[0-9]*/;
      var textThisNumSell = $("#getSellNumber")
        .val()
        .replace(re, "$1");
      if (isNaN(textThisNumSell)) return;
      if (Number(textThisNumSell) > Number(myBcny)) {
        $(".bcnyNum").show();
      } else {
        $(".bcnyNum").hide();
      }
      $(this).val(textThisNumSell);
      checkNumber(getSellCHoose, Number(textThisNumSell), thisCoinExchangeRate, choose)
    } else {
      checkNumber(getSellCHoose, 0, thisCoinExchangeRate, choose)
      $(".bcnyNum").hide();
    }
  });

  function checkNumber(getChoose, getInput, exchangeRate, choose) {
    console.log("getChoose: " + getChoose + " getInput: " + getInput + " exchangeRate: " + exchangeRate + " choose: " + choose)
    var regTwo = /([0-9]+\.[0-9]{2})[0-9]*/;
    if (!getInput && choose == "agentBuy") {
      $(".needMoney").text("0.00 " + getChoose);
      return
    }
    if (getChoose == "CNY" && choose == "agentBuy") {
      $(".needMoney").text(getInput + getChoose);
      return
    }
    if (getChoose == "USD" && choose == "agentBuy") {
      $(".needMoney").text(String(app.accDiv(getInput, exchangeRate)).replace(regTwo, "$1") + getChoose);
      return
    }
    if (getChoose == "EUR" && choose == "agentBuy") {
      $(".needMoney").text(String(app.accDiv(getInput, exchangeRate)).replace(regTwo, "$1") + getChoose);
      return
    }
    if (getChoose == "HKD" && choose == "agentBuy") {
      $(".needMoney").text(String(app.accDiv(getInput, exchangeRate)).replace(regTwo, "$1") + getChoose);
      return
    }
    // if (!getInput && choose == "agentSell") {
    //   $(".getBack").text("0.00 " + getChoose);
    //   return
    // }
    if (getSellCHoose == "CNY" && choose == "agentSell") {
      $(".getBack").text(getInput + getSellCHoose);
      return
    }
    if (getSellCHoose == "USD" && choose == "agentSell") {
      $(".getBack").text(String(app.accDiv(getInput, exchangeRate)).replace(regTwo, "$1") + getSellCHoose);
      return
    }
    if (getSellCHoose == "EUR" && choose == "agentSell") {
      $(".getBack").text(String(app.accDiv(getInput, exchangeRate)).replace(regTwo, "$1") + getSellCHoose);
      return
    }
    if (getSellCHoose == "HKD" && choose == "agentSell") {
      $(".getBack").text(String(app.accDiv(getInput, exchangeRate)).replace(regTwo, "$1") + getSellCHoose);
    }
  }

  $("#goBuyCoin").on("click", function () {
    var getInPutNumber = $("#getBuyNumber").val();
    if (!getInPutNumber) {
      app.toast("买入数量不能为空");
      return;
    }
    if (Number(getInPutNumber) < 1) {
      app.toast("买入数量不能少于1");
      return;
    }
    var param = {
      dtype: "dialog1",
      data: {
        text: "亲,你确定要购买BCNY吗？",
        btns: [{
            name: "再想想",
            event: "YesBack"
          },
          {
            name: "确定购买",
            event: "agentBuyBcny"
          }
        ]
      }
    };
    app.dialog(param);
  });
  $("#goSellCoin").on("click", function (params) {
    var getInPutNumberSell = $("#getSellNumber").val();
    if (!getInPutNumberSell) {
      app.toast("卖出数量不能为空");
      return;
    }
    if (Number(getInPutNumberSell) < 1) {
      app.toast("卖出数量不能少于1");
      return;
    }
    var param = {
      dtype: "dialog1",
      data: {
        text: "亲,你确定要卖出BCNY吗？",
        btns: [{
            name: "再想想",
            event: "YesBack"
          },
          {
            name: "确定卖出",
            event: "agentBuyBcnySell"
          }
        ]
      }
    };
    app.dialog(param);
  });
  //监听代购
  app.listen("agentBuyBcny", function () {
    var getInPutNumberVal = $("#getBuyNumber").val();
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "wallet/userBuyCoins",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            currency_name: "BCNY",
            currency_code: getChoose,
            num: getInPutNumberVal
          }
        },
        callback: function (ret, err) {
          app.log(ret);
          app.log("buycoin", "buycoin返回：" + JSON.stringify(ret));
          if (ret.code == 1) {
            app.toast("兑入成功");
            $("#getSellNumber,#getBuyNumber").val("");
            app.trigger("buyBcnySucceed");
            // app.reload();
            getCoinPrice();
          } else {
            app.toast(ret.desc);
          }
        }
      }
    });
  });
  //监听代售
  // app.listen("agentBuyBcnySell", function (params) {
  //   var getInPutNumberValSell = $("#getSellNumber").val();
  //   console.log("in-----------");
  //   app.ajax({
  //     param: {
  //       method: "post",
  //       url: app.config.url + "trade/platformCoinRepurchase",
  //       data: {
  //         values: {
  //           uid: account.uid,
  //           token: account.token,
  //           coin_type: "BCNY",
  //           currency_code: getSellCHoose,
  //           num: getInPutNumberValSell
  //         }
  //       },
  //       callback: function (ret, err) {
  //         console.log("BCNY发起代售返回：" + JSON.stringify(ret));
  //         app.stopRefresh();
  //         if (ret.code == 1) {
  //           app.toast("卖出成功");
  //           $("#getSellNumber,#getBuyNumber").val("");
  //           $(".needMoney,.getBack").text("0.00 CNY");
  //           getCoinPrice();
  //           // app.reload();
  //         } else {
  //           app.toast(ret.desc);
  //         }
  //       }
  //     },
  //     extra: {
  //       isflower: true,
  //       delay: 200
  //     }
  //   });
  // });

  var acceptClik = 0;
  var showBankDom = document.querySelector('#showBank');
  var bankIdDom = document.querySelector('#bankId');
  showBankDom.addEventListener('click', function () {
    var bankId = showBankDom.dataset['id'];
    acceptClik++;
    if (acceptClik > 1) return;
    var bankSelect = new IosSelect(1,
      [isdataArr], {
        title: '',
        oneLevelId: bankId,
        itemHeight: 1,
        headerHeight: 0.88,
        itemShowCount: 3,
        maskCallback: function () {
          acceptClik = 0;
        },
        fallback: function () {
          acceptClik = 0;
        },
        cssUnit: 'rem',
        callback: function (selectOneObj) {
          acceptClik = 0;
          bankIdDom.value = selectOneObj.id;
          showBankDom.innerHTML = selectOneObj.id;
          getChoose = selectOneObj.id;
          var getInput = 0;
          $("#getBuyNumber").val("");
          $(".balanceNum").hide();
          $(".needMoney").text("0.00" + getChoose);
          if (getChoose == "CNY") {
            $(".myCoin").text(
              (mymoney == 0 ? "0.00" : app.outputmoney(mymoney)) + " CNY"
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + "1 BCNY");
            getChooseMoneyNum = mymoney;
            thisCoinExchangeRate = 1;
          }
          if (getChoose == "USD") {
            $(".myCoin").text(
              (Number(chooseTyPe.usd.coin) == 0 ? "0.00" : app.outputmoney(chooseTyPe.usd.coin)) + " " + getChoose
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + exchangeRate.usd_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.usd_price;
            getChooseMoneyNum = chooseTyPe.usd.coin;
          }
          if (getChoose == "EUR") {
            $(".myCoin").text(
              (Number(chooseTyPe.eur.coin) == 0 ? "0.00" : app.outputmoney(chooseTyPe.eur.coin)) + " " + getChoose
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + exchangeRate.eur_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.eur_price;
            getChooseMoneyNum = chooseTyPe.eur.coin;
          }
          if (getChoose == "HKD") {
            $(".myCoin").text(
              (Number(chooseTyPe.hkd.coin) == 0 ? "0.00" : app.outputmoney(chooseTyPe.hkd.coin)) + " " + getChoose
            );
            $(".showChangeoOtherbuy").text("1.00 " + getChoose + " = " + exchangeRate.hkd_price + " BCNY");
            thisCoinExchangeRate = exchangeRate.hkd_price;
            getChooseMoneyNum = chooseTyPe.hkd.coin;
          }
          checkNumber(getChoose, getInput, thisCoinExchangeRate, choose)
        }
      }
    );
  });
  // var bcnySellClick = 0;
  // var chooseReTypeOut = document.querySelector('#chooseReTypeOut');
  // var bankIdNew = document.querySelector('#bankIdNew');
  // chooseReTypeOut.addEventListener('click', function () {
  //   var bankId = chooseReTypeOut.dataset['id'];
  //   bcnySellClick++;
  //   if (bcnySellClick > 1) return;
  //   var bankSelect = new IosSelect(1,
  //     isForeign == 0 ? [dataOnly] : [dataArrAll], {
  //       title: '',
  //       oneLevelId: bankId,
  //       itemHeight: 1,
  //       headerHeight: 0.88,
  //       itemShowCount: 3,
  //       maskCallback: function () {
  //         bcnySellClick = 0;
  //       },
  //       fallback: function () {
  //         bcnySellClick = 0;
  //       },
  //       cssUnit: 'rem',
  //       callback: function (selectOneObj) {
  //         bcnySellClick = 0;
  //         bankIdNew.value = selectOneObj.id;
  //         chooseReTypeOut.innerHTML = selectOneObj.id;
  //         getSellCHoose = selectOneObj.id;
  //         var getInput = 0;
  //         $(".sellBox input").val("");
  //         $(".bcnyNum").hide();
  //         if (getSellCHoose == "CNY") {
  //           $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + "1 BCNY");
  //           thisCoinExchangeRate = 1;
  //         }
  //         if (getSellCHoose == "USD") {
  //           $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + exchangeRate.buy_usd_price + " BCNY");
  //           thisCoinExchangeRate = exchangeRate.buy_usd_price;
  //         }
  //         if (getSellCHoose == "EUR") {
  //           $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + exchangeRate.buy_eur_price + " BCNY");
  //           thisCoinExchangeRate = exchangeRate.buy_eur_price;
  //         }
  //         if (getSellCHoose == "HKD") {
  //           $(".showChangeoOther").text("1.00 " + getSellCHoose + " = " + exchangeRate.buy_hkd_price + " BCNY");
  //           thisCoinExchangeRate = exchangeRate.buy_hkd_price;
  //         }
  //         checkNumber(getSellCHoose, getInput, thisCoinExchangeRate, choose);
  //       }
  //     }
  //   );
  // });
  $(".shooseBuyorSell span").on("click", function (params) {
    // $(".shooseBuyorSell span").css("borderBottomColor", "#fff");
    // $(this).css("borderBottomColor", "#ffd203");
    choose = $(this).attr("data-choose");
    $(".olay").remove();
    if (choose == "agentBuy") {
      $(".slidebox").animate({
        left: 0
      }, 150);
      $(".buyText").show();
      $(".sellText").hide();
      bcnySellClick = 0;
      getCoinPrice();
    } else {
      choose = "agentBuy";
      var cointypecontract = {
        page: "common/headerwin",
        name: "getcash_headerwin",
        param: {
          subpage: "mine/getcash",
          name: "getcash",
          title: "提现",
          goBcny: "goBcny"
        }
      };
      var recoinNumber = JSON.stringify(cointypecontract);
      app.goPushPage(recoinNumber);
      // $(".slidebox").animate({
      //     left: -parseInt(app.W) + "px"
      //   },
      //   150
      // );
      // $(".buyText").hide();
      // $(".sellText").show();
      // acceptClik = 0;
    }
  });

  $(".balanceNum").click(function() {
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
              var thisGoPage = '{"page":"common/headerwin","name":"littlemoneyrecharge_headerwin","param":{"subpage":"extrapage/littlemoneyrecharge","name":"littlemoneyrecharge","title":"充值"}}';
              app.goPushPage(thisGoPage);
          }
      } else {
          app.toast(ret.desc)
      }
  })
  })
  var evens = ["bhpcCountChange", "littlemoney_recharge_success"];
  app.listen(evens, function () {
    getCoinPrice();
  });
};