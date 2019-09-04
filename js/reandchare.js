apiready = function () {
  var app = new APP();
  app.log("get_cash_detail", "提现详情页面");
  var account = app.getAccount();
  var getforePageData = api.pageParam.isShowOtcProperty;
  if (getforePageData == "true") {
    $("#showAboutRecharege").css("display", "flex");
    $("#showAboutRecharege").css("display", "-webkit-flex");
    $(".showListAll").css({
      marginTop: "1rem"
    })
  }
  var choose = "rechage";
  var showfirst = "myReceiveRed"; //选择红包的记录
  var rechageType = "myRechareBlance"; //选择充值的记录
  var getCashList = "myGetCashBlance"; //默认提现记录
  var lastGetReTime = ""; //接收红包最后一条数据的时间
  var lastGetSeTime = ""; //发送红包最后一条数据的时间
  // 当前加载页面
  var curPage = 1;
  var totalPage = 0;
  //请求提现数据
  function loadPage(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "finance/withdrawalsList",
        data: {
          values: {
            // 最好不要下面的两个参数
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log("rent", "rentList返回：" + JSON.stringify(ret));

          app.stopRefresh();

          if (ret.code == 1) {
            totalPage = ret.total_page;
            ret.enchashment.map(function (item) {
              item.currency_code = item.currency_code.toUpperCase();
            })
            // 渲染模板
            var temp = doT.template($("#listT").text());
            if (isdown) {
              $("#ul_list").html(temp(ret.enchashment));
            } else {
              $("#ul_list").append(temp(ret.enchashment));
            }

            if (curPage == 1 && ret.enchashment.length == 0) {
              $("#listState").text("暂时没有相关数据");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  //请求BCNY提现数据
  function loadPageBcny(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "otc/list",
        data: {
          values: {
            // 最好不要下面的两个参数
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log("BCNY", "BCNY提现返回：" + JSON.stringify(ret));
          app.stopRefresh();
          if (ret.code == 1) {
            totalPage = Math.ceil(Number(ret.data.totalCount) / 20);
            // 渲染模板
            var temp = doT.template($("#listgetCashBcny").text());
            if (isdown) {
              $("#ul_list").html(temp(ret.data.list));
            } else {
              $("#ul_list").append(temp(ret.data.list));
            }
            if (curPage == 1 && ret.data.list.length == 0) {
              $("#listState").text("暂时没有相关数据");
            }
            if (curPage < totalPage) {
              $("#listState").text("加载更多");
            }
            if (curPage >= totalPage) {
              $("#listState").text("没有更多数据了");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  //请求充值记录
  function loadPageT(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "wallet/predepositRechargeList",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log(
            "recharge_detail",
            "recharge_detail返回：" + JSON.stringify(ret)
          );

          app.stopRefresh();
          if (ret.code == 1) {
            totalPage = ret.total_page;

            // 处理数据
            for (var i = 0; i < ret.predeposit_recharge_list.length; i++) {
              var item = JSON.stringify(ret.predeposit_recharge_list[i]);
              ret.predeposit_recharge_list[i].item = item;
            }

            // 渲染模板
            var temp = doT.template($("#list").text());
            app.log("list", temp(ret.predeposit_recharge_list));
            if (isdown) {
              $("#ul_list").html(temp(ret.predeposit_recharge_list));
            } else {
              $("#ul_list").append(temp(ret.predeposit_recharge_list));
            }
            // 判断是不是第一页且没有数据的特殊情况
            if (ret.predeposit_recharge_list.length == 0 && curPage == 1) {
              $("#listState").text("暂时没有相关数据");
            }
            if (curPage == totalPage && totalPage != 0) {
              $("#listState").text("已经到底了");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  loadPageT(curPage, true);
  //请求OTC充值记录
  function getOtcRechageList(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "otc/log",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            page: page,
            pageSzie: "20"
          }
        },
        callback: function (ret, err) {
          app.log(
            "请求OTC充值记录",
            "otc充值返回：" + JSON.stringify(ret)
          );
          app.stopRefresh();
          if (ret.code == 1) {
            totalPage = Math.ceil(Number(ret.data.totalCount) / 20);
            // 渲染模板
            var temp = doT.template($("#rechageOtclist").text());
            app.log("list", temp(ret.data.list));
            if (isdown) {
              $("#ul_list").html(temp(ret.data.list));
            } else {
              $("#ul_list").append(temp(ret.data.list));
            }
            // 判断是不是第一页且没有数据的特殊情况
            if (ret.data.list.length == 0 && curPage == 1) {
              $("#listState").text("暂时没有相关数据");
            }
            if (curPage == totalPage && totalPage != 0) {
              $("#listState").text("已经到底了");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  // 提币记录
  function loadPageOther(page, isdown) {
    var p = {
      // 最好不要下面的两个参数
      uid: account.uid,
      token: account.token,
      page: page
    };
    app.log("param", p);
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "finance/withdrawCoinList",
        data: {
          values: {
            // 最好不要下面的两个参数
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log("rent", "rentList返回：" + JSON.stringify(ret));
          app.stopRefresh();

          if (ret.code == 1) {
            totalPage = ret.total_page;
            var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
            ret.withdrawcoin.map(function (item) {
              if (item.coin_type == "BHP" || item.coin_type == "USDT") {
                item.coin_num = String(item.coin_num).replace(refour, "$1");
              } else {
                item.coin_num = String(item.coin_num).replace(/([0-9]+\.[0-9]{8})[0-9]*/, "$1");
              }
            })
            // 渲染模板
            var temp = doT.template($("#outcoinlist").text());
            app.log("list", temp(ret.withdrawcoin));
            if (isdown) {
              $("#ul_list").html(temp(ret.withdrawcoin));
            } else {
              $("#ul_list").append(temp(ret.withdrawcoin));
            }
            // 渲染模板

            if (curPage == 1 && ret.withdrawcoin.length == 0) {
              $("#listState").text("暂时没有相关数据");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  //糖果兑换记录
  function exchangeBhpcSweet(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "wallet/bhpcSweetExchangeList",
        data: {
          values: {
            // 最好不要下面的两个参数
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log("bhpcsweet", "bhpcsweet返回：" + JSON.stringify(ret));

          app.stopRefresh();

          if (ret.code == 1) {
            totalPage = ret.total_page;

            // 渲染模板
            var temp = doT.template($("#bhpcsweet").text());
            if (isdown) {
              $("#ul_list").html(temp(ret.list));
            } else {
              $("#ul_list").append(temp(ret.list));
            }
            if (curPage == 1 && ret.list.length == 0) {
              $("#listState").text("暂时没有相关数据");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  //充币
  function rechageCoin(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "finance/userRechargeCoinList",
        data: {
          values: {
            // 最好不要下面的两个参数
            uid: account.uid,
            token: account.token,
            page: page,
            // currency_name: "BHPC"
          }
        },
        callback: function (ret, err) {
          app.log("bhpcrecharge", "bhpcrecharge返回：" + JSON.stringify(ret));

          app.stopRefresh();

          if (ret.code == 1) {
            totalPage = ret.total_page;
            // 渲染模板
            var temp = doT.template($("#rechageCoin").text());
            if (isdown) {
              $("#ul_list").html(temp(ret.list));
            } else {
              $("#ul_list").append(temp(ret.list));
            }
            if (curPage == 1 && ret.list.length == 0) {
              $("#listState").text("暂时没有相关数据");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  //收红包记录
  function redBagList(GetReTime, isdown) {
    var data = {
      uid: account.uid,
      token: account.token,
      since: GetReTime,
      type: "receive",
      limit: "20"
    }
    app.log("请求参数", JSON.stringify(data))
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "hongbao/history",
        closeTips: true,
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            since: GetReTime,
            type: "receive",
            limit: "20"
          }
        },
        callback: function (ret, err) {
          app.log("收红包记录", "收红包返回：" + JSON.stringify(ret));
          app.stopRefresh();

          if (ret.code == 1) {
            totalPage = ret.total_page;
            var reTwo = /([0-9]+\.[0-9]{2})[0-9]*/;
            var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
            var reEight = /([0-9]+\.[0-9]{8})[0-9]*/;
            ret.data.map(function (item) {
              if (item.currency == "BTC" || item.currency == "LTC" || item.currency == "ETH") {
                item.amount = String(item.amount).replace(reEight, '$1');
              } else if (item.currency == "BHP" || item.currency == "BHPC") {
                item.amount = String(item.amount).replace(refour, '$1');
              } else {
                item.amount = String(item.amount).replace(reTwo, '$1');
              }
            });
            var dataLength = ret.data.length
            var textthis = ret.data[dataLength - 1];
            lastGetReTime = Date.parse(textthis.opened_at);
            // console.log(lastGetReTime)
            // lastGetReTime = new Date(timeThis);
            // 渲染模板
            var temp = doT.template($("#redBagListRe").text());
            if (isdown) {
              $("#ul_list").html(temp(ret.data));
            } else {
              $("#ul_list").append(temp(ret.data));
            }
            if (ret.data.length == 0) {
              $("#listState").text("暂时没有相关数据");
            }
            if (ret.data.length < 20) {
              $("#listState").text("暂时没有相关数据");
            }
          }
          if (ret.code == -1) {
            $("#listState").text("已经到底了");
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  //发红包记录
  function sendRedBagList(pagetime, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "hongbao/history",
        closeTips: true,
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            since: pagetime,
            type: "send",
            limit: "20"
          }
        },
        callback: function (ret, err) {
          app.log("红包记录", "limit返回：" + JSON.stringify(ret));

          app.stopRefresh();
          if (ret.code == 1) {
            var reTwo = /([0-9]+\.[0-9]{2})[0-9]*/;
            var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
            var reEight = /([0-9]+\.[0-9]{8})[0-9]*/;
            ret.data.map(function (item) {
              if (item.currency == "BTC" || item.currency == "LTC" || item.currency == "ETH") {
                item.amount = String(item.amount).replace(reEight, '$1');
              } else if (item.currency == "BHP" || item.currency == "BHPC") {
                item.amount = String(item.amount).replace(refour, '$1');
              } else {
                item.amount = String(item.amount).replace(reTwo, '$1');
              }
            })
            var dataSetime = ret.data.length
            var textthisSetime = ret.data[dataSetime - 1];
            lastGetSeTime = Date.parse(textthisSetime.opened_at);
            // 渲染模板
            var temp = doT.template($("#sendRedBagList").text());
            if (isdown) {
              $("#ul_list").html(temp(ret.data));
            } else {
              $("#ul_list").append(temp(ret.data));
            }
            if (ret.data.length == 0) {
              $("#listState").text("暂时没有相关数据");
            }
            if (ret.data.length < 20) {
              $("#listState").text("暂时没有相关数据");
            }
            if (ret.data) {
              $("#listState").text("暂时没有相关数据");
            }
          }
          if (ret.code == -1) {
            $("#listState").text("已经到底了");
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  //个人转账记录
  function transferCoin(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "finance/ctocTransferCoinList",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log(
            "个人转账新",
            "个人转账新返回：" + JSON.stringify(ret)
          );

          app.stopRefresh();
          if (ret.code == 1) {
            totalPage = ret.total_page;
            var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
            var reTwo = /([0-9]+\.[0-9]{2})[0-9]*/;
            ret.list.map(function (item) {
              item.addtime = app.getDate(item.create_time, false);
              item.name = item.type.toUpperCase();
              if (item.type == "bhp") {
                item.num = String(item.num).replace(refour, "$1");
              } else if (item.type == "money") {
                item.num = String(item.num).replace(reTwo, "$1");
                item.name = "CNY";
              } else if (item.type == "bcny") {
                item.num = String(item.num).replace(reTwo, "$1");
              } else {
                item.num = String(item.num).replace(/([0-9]+\.[0-9]{8})[0-9]*/, "$1");
              }
            })
            // 渲染模板
            var temp = doT.template($("#transferCoin").text());
            // app.log("list", temp(ret.list));
            if (isdown) {
              $("#ul_list").html(temp(ret.list));
            } else {
              $("#ul_list").append(temp(ret.list));
            }
            // 判断是不是第一页且没有数据的特殊情况
            if (ret.list.length == 0 && curPage == 1) {
              $("#listState").text("暂时没有相关数据");
            }
            if (curPage == totalPage && totalPage != 0) {
              $("#listState").text("已经到底了");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }

  function serviceTransferCoin(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "finance/serviceTransferCoinList",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log(
            "个人转账新",
            "个人转账新返回：" + JSON.stringify(ret)
          );

          app.stopRefresh();
          if (ret.code == 1) {
            totalPage = ret.total_page;
            var refour = /([0-9]+\.[0-9]{4})[0-9]*/;
            var reTwo = /([0-9]+\.[0-9]{2})[0-9]*/;
            ret.list.map(function (item) {
              if (item.currency_name == "BHP") {
                item.num = String(item.num).replace(refour, "$1");
              } else if (item.currency_name == "BCNY") {
                item.num = String(item.num).replace(reTwo, "$1");
              } else {
                item.num = String(item.num).replace(/([0-9]+\.[0-9]{8})[0-9]*/, "$1");
              }
            })
            // 渲染模板
            var temp = doT.template($("#serviceTransferCoin").text());
            // app.log("list", temp(ret.list));
            if (isdown) {
              $("#ul_list").html(temp(ret.list));
            } else {
              $("#ul_list").append(temp(ret.list));
            }
            // 判断是不是第一页且没有数据的特殊情况
            if (ret.list.length == 0 && curPage == 1) {
              $("#listState").text("暂时没有相关数据");
            }
            if (curPage == totalPage && totalPage != 0) {
              $("#listState").text("已经到底了");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }

  function serviceTransferMoney(page, isdown) {
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "finance/serviceTransferMoneyList",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            page: page
          }
        },
        callback: function (ret, err) {
          app.log(
            "个人转账新",
            "个人转账新返回：" + JSON.stringify(ret)
          );

          app.stopRefresh();
          if (ret.code == 1) {
            totalPage = ret.total_page;
            var reTwo = /([0-9]+\.[0-9]{2})[0-9]*/;
            // 渲染模板
            var temp = doT.template($("#serviceTransferMoney").text());
            // app.log("list", temp(ret.list));
            if (isdown) {
              $("#ul_list").html(temp(ret.list));
            } else {
              $("#ul_list").append(temp(ret.list));
            }
            // 判断是不是第一页且没有数据的特殊情况
            if (ret.list.length == 0 && curPage == 1) {
              $("#listState").text("暂时没有相关数据");
            }
            if (curPage == totalPage && totalPage != 0) {
              $("#listState").text("已经到底了");
            }
          }
        }
      },
      extra: {
        container: "#ul_list",
        isflower: false
      }
    });
  }
  api.addEventListener({
      name: "chooseType"
    },
    function (ret) {
      if (ret && ret.value) {
        console.log("--------------------" + JSON.stringify(ret));
        choose = ret.value.chooseType;
        $("body").scrollTop(0);
        $("#ul_list").empty();
        curPage = 1;
        totalPage = 0;
        if (ret.value.chooseType != "redBagrecord") {
          $("#showAboutMe").hide();
          $(".showListAll").css({
            marginTop: "0"
          })
        }
        if (ret.value.chooseType != "rechage") {
          $("#showAboutRecharege").hide();
          $(".showListAll").css({
            marginTop: "0"
          })
        }
        if (ret.value.chooseType != "outmoney") {
          $("#showAboutGetCash").hide();
          $(".showListAll").css({
            marginTop: "0"
          })
        }
        if (ret.value.chooseType == "rechage" && getforePageData == "true") {
          rechageType = "myRechareBlance";
          $("#showAboutRecharege > span").css("color", "#333333");
          $("#showAboutRecharege > span:first-of-type").css("color", "#ffd203")
          $("#showAboutRecharege").css("display", "flex");
          $("#showAboutRecharege").css("display", "-webkit-flex");
          $("#showAboutRecharege").css("z-index", "300");
          $(".showListAll").css({
            marginTop: "1rem"
          })
          loadPageT(curPage, true);
          return
        }
        if (ret.value.chooseType == "rechage" && getforePageData == "false") {
          rechageType = "myRechareBlance";
          loadPageT(curPage, true);
          return
        }
        if (ret.value.chooseType == "outmoney") {
          $("#showAboutGetCash").show();
          $("#showAboutGetCash > span").css("color", "#333333");
          $("#showAboutGetCash > span:first-of-type").css("color", "#ffd203")
          $("#showAboutGetCash").css("display", "flex");
          $("#showAboutGetCash").css("display", "-webkit-flex");
          $("#showAboutGetCash").css("z-index", "300");
          $(".showListAll").css({
            marginTop: "1rem"
          })
          loadPage(curPage, true);
          return
        }
        if (ret.value.chooseType == "outcoin") {
          loadPageOther(curPage, true);
          return
        }
        if (ret.value.chooseType == "enstru") {
          loadPageEstr(curPage, true);
          return
        }
        if (ret.value.chooseType == "buycoin") {
          getBuyCoinList(curPage, true);
          return
        }
        if (ret.value.chooseType == "exchangesweet") {
          exchangeBhpcSweet(curPage, true);
          return
        }
        if (ret.value.chooseType == "rechagecoin") {
          rechageCoin(curPage, true);
          return
        }
        if (ret.value.chooseType == "ctocTransferCoin") {
          transferCoin(curPage, true);
          return
        }
        if (ret.value.chooseType == "serviceTransferCoin") {
          serviceTransferCoin(curPage, true);
          return
        }
        if (ret.value.chooseType == "serviceTransferMoney") {
          serviceTransferMoney(curPage, true);
          return
        }
        if (ret.value.chooseType == "redBagrecord") {
          showfirst = "myReceiveRed";
          $("#showAboutMe > span").css("color", "#333333");
          $("#showAboutMe>span:first-of-type").css("color", "#ffd203")
          redBagList("", true);
          $("#showAboutMe").css("display", "flex");
          $("#showAboutMe").css("display", "-webkit-flex");
          $("#showAboutMe").css("z-index", "300");
          $(".showListAll").css({
            marginTop: "1rem"
          })
        }
      }
    }
  );

  //充值记录选择记录
  $("#showAboutRecharege > span").click(function () {
    $("#showAboutRecharege > span").css("color", "#333333");
    $(this).css("color", "#ffd203");
    $("body").scrollTop(0);
    $("#ul_list").empty();
    rechageType = $(this).attr("data-choose");
    if (rechageType == "myRechareBlance") {
      loadPageT(curPage, true);
    } else {
      getOtcRechageList(curPage, true);
    }
  });
  //提现记录
  $("#showAboutGetCash > span").click(function () {
    $("#showAboutGetCash > span").css("color", "#333333");
    $(this).css("color", "#ffd203");
    $("body").scrollTop(0);
    $("#ul_list").empty();
    getCashList = $(this).attr("data-choose");
    if (getCashList == "myGetCashBlance") {
      loadPage(curPage, true);
    } else {
      loadPageBcny(curPage, true);
    }
  });
  //红包记录选择记录
  $("#showAboutMe > span").click(function () {
    $("#showAboutMe > span").css("color", "#333333");
    $(this).css("color", "#ffd203");
    $("body").scrollTop(0);
    $("#ul_list").empty();
    showfirst = $(this).attr("data-choose");
    if (showfirst == "myReceiveRed") {
      redBagList("", true);
    } else {
      sendRedBagList("", true);
    }
  });

  // 设置可以下拉加载
  app.downRefresh(function () {
    app.log("rent监听下拉刷新", "curPage：" + curPage + " totalPage：" + totalPage + "当前选择" + choose);
    $("#ul_list").empty();
    curPage = 1;
    totalPage = 0;
    if (choose == "rechage" && rechageType == "myRechareBlance") {
      loadPageT(curPage, true);
      return
    }
    if (choose == "rechage" && rechageType == "myRechareOtc") {
      getOtcRechageList(curPage, true);
      return
    }
    if (choose == "outmoney" && getCashList == "myGetCashBlance") {
      loadPage(curPage, true);
      return
    }
    if (choose == "outmoney" && getCashList == "myGetCashBcny") {
      loadPageBcny(curPage, true);
      return
    }
    if (choose == "outcoin") {
      loadPageOther(curPage, true);
      return
    }
    if (choose == "enstru") {
      loadPageEstr(curPage, true);
      return
    }
    if (choose == "buycoin") {
      getBuyCoinList(curPage, true);
      return
    }
    if (choose == "exchangesweet") {
      exchangeBhpcSweet(curPage, true);
      return
    }
    if (choose == "rechagecoin") {
      rechageCoin(curPage, true);
      return
    }
    if (choose == "ctocTransferCoin") {
      transferCoin(curPage, true);
      return
    }
    if (choose == "serviceTransferCoin") {
      serviceTransferCoin(curPage, true);
      return
    }
    if (choose == "serviceTransferMoney") {
      serviceTransferMoney(curPage, true);
      return
    }
    if (choose == "redBagrecord" && showfirst == "myReceiveRed") {
      redBagList("", true);
      return
    }
    if (choose == "redBagrecord" && showfirst == "mySendRed") {
      sendRedBagList("", true);
    }
  });
  // 监听滚动到底部
  app.toBottom(function () {
    app.log("rent监听到了滚动到底部", "curPage：" + curPage + " totalPage：" + totalPage + "当前选择" + choose);
    if (choose == "rechage" && rechageType == "myRechareBlance") {
      if (curPage < totalPage) {
        curPage++;
        loadPageT(curPage, false);
      }
      return
    }
    if (choose == "rechage" && rechageType == "myRechareOtc") {
      if (curPage < totalPage) {
        curPage++;
        getOtcRechageList(curPage, false);
      }
      return
    }
    if (choose == "outmoney" && getCashList == "myGetCashBlance") {
      if (curPage < totalPage) {
        curPage++;
        loadPage(curPage, false);
      }
      return
    }
    if (choose == "outmoney" && getCashList == "myGetCashBcny") {
      if (curPage < totalPage) {
        curPage++;
        loadPageBcny(curPage, false)
      }
      return
    }
    if (choose == "outcoin") {
      if (curPage < totalPage) {
        curPage++;
        loadPageOther(curPage, false);
      }
      return
    }
    if (choose == "enstru") {
      if (curPage < totalPage) {
        curPage++;
        loadPageEstr(curPage, false);
      }
      return
    }
    if (choose == "buycoin") {
      if (curPage < totalPage) {
        curPage++;
        getBuyCoinList(curPage, false);
      }
      return
    }
    if (choose == "exchangesweet") {
      if (curPage < totalPage) {
        curPage++;
        exchangeBhpcSweet(curPage, false);
      }
      return
    }
    if (choose == "rechagecoin") {
      if (curPage < totalPage) {
        curPage++;
        rechageCoin(curPage, false);
      }
      return
    }
    if (choose == "ctocTransferCoin") {
      if (curPage < totalPage) {
        curPage++;
        transferCoin(curPage, false);
      }
      return
    }
    if (choose == "serviceTransferCoin") {
      if (curPage < totalPage) {
        curPage++;
        serviceTransferCoin(curPage, false);
      }
      return
    }
    if (choose == "serviceTransferMoney") {
      if (curPage < totalPage) {
        curPage++;
        serviceTransferMoney(curPage, false);
      }
      return
    }
    if (choose == "redBagrecord" && showfirst == "myReceiveRed") {
      redBagList(lastGetReTime, false);
      return
    }
    if (choose == "redBagrecord" && showfirst == "mySendRed") {
      sendRedBagList(lastGetSeTime, false);
    }
  });
};