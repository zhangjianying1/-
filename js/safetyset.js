apiready = function () {
  var app = new APP();
  app.handlePage();
  var cointypecontract = {};
  var goMyPage = api.pageParam.goMyPage;
  var getUserStatus = -2; //用户实名状态;
  var getUserPassStus = 0; //用户交易密码状态;

  function getIdStatu() {
    var account = app.getAccount();
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "member/getSumitRealnameVerifyStatus",
        data: {
          values: {
            uid: account.uid,
            token: account.token
          }
        },
        callback: function (ret, err) {
          app.log("auth", "获取认证状态返回：" + JSON.stringify(ret));
          if (ret.code == 1) {
            getUserStatus = ret.status_code;
            getUserPassStus = ret.is_trade_pwd;
            if (ret.is_trade_pwd == 1) {
              $(".statuspassText").text("已设置交易密码");
            } else if (ret.is_trade_pwd == 2) {
              $(".statuspassText").text("审核中");
            } else if (ret.is_trade_pwd == -2) {
              $(".tipsRepass").text("交易密码找回失败原因：" + ret.remark);
              $(".statuspassText").text("审核未通过, 重新找回");
            } else {
              $(".statuspassText").text("未设置");
            }

            if (ret.status_code == -2) {
              // 未提交审核
              $(".statusText").text("未认证");
              cointypecontract = {
                page: "common/headerwin",
                name: "choosecerfertion_headerwin",
                param: {
                  subpage: "my/choosecerfertion",
                  name: "choosecerfertion",
                  title: "实名认证"
                }
              };
              return
            }

            if (ret.status_code == -1) {
              // 未通过审核
              $(".statusText").text(ret.desc);
              cointypecontract = {
                page: "common/headerwin",
                name: "choosecerfertion_headerwin",
                param: {
                  subpage: "my/choosecerfertion",
                  name: "choosecerfertion",
                  title: "实名认证"
                }
              };
              return;
            }
            if (ret.status_code == 0) {
              // 审核中
              $(".statusText").text("审核中");
              cointypecontract = {
                page: "common/headerwin",
                name: "checkpass_headerwin",
                param: {
                  subpage: "my/checkpass",
                  name: "checkpass",
                  title: "实名认证",
                }
              };
              return;
            }
            if (ret.status_code == 1) {
              // 审核通过
              cointypecontract = {
                page: "common/headerwin",
                name: "checkpass_headerwin",
                param: {
                  subpage: "my/checkpass",
                  name: "checkpass",
                  title: "实名认证",
                }
              };
              $(".statusText").text("已通过");
            }
          }
        }
      },
      extra: {
        isflower: true
      }
    });
  }
  getIdStatu();
  var lineColor = "#ffcf07";
  var errLineColor = "#ff3c07";
  app.getAsyncStorage("openHandPassLine", function (ret) {
    if (ret == "true") {
      lineColor = "#ffcf07";
      errLineColor = "#ff3c07";
    } else {
      lineColor = "rgba(255,255,255,0)";
      errLineColor = "rgba(255,255,255,0)";
    }
  });
  $("input").click(function () {
    $(this)
      .focus()
      .select(); //保险起见，还是加上这句。
  });
  app.getAsyncStorage("openHandPassword", function (ret) {
    if (ret == "true") {
      $("input[type='checkbox']").attr("checked", "checked");
      $(".showliblance").show();
    } else {
      $("input[type='checkbox']").removeAttr("checked");
      $(".showliblance").hide();
    }
  });
  $("#chooseNewRuler")
    .unbind("click")
    .click(function (e) {
      var data = $(this).prop("checked");
      if (data == true) {
        app.trigger("showBackButton");
        app.setStorage("openHandPassword", "true");
        $(".showliblance").show();
        app.trigger("openhandLine");
      } else {
        $(".showliblance").hide();
        app.setStorage("openHandPassword", "false");
        api.openWin({
          name: "checkhand",
          url: app.hd + "extrapage/checkhand.html",
          slidBackEnabled: false,
          animation: {
            type: "none"
          },
          pageParam: {
            closeHandLine: "true",
            lineColor: lineColor,
            errLineColor: errLineColor
          }
        });
      }
    });
  $(".checkname").click(function () {
    var recoinNumber = JSON.stringify(cointypecontract);
    app.goPushPage(recoinNumber);
  });
  $(".checkpassword").on("click", function () {
    if (getUserStatus == -2) {
      app.toast("请先实名认证");
      return
    }
    if (getUserStatus == -1) {
      app.toast("实名未通过审核");
      return
    }
    if (getUserStatus == 0) {
      app.toast("实名审核中");
      return
    }

    if (getUserPassStus == 1) {
      var checkpassword = {
        page: "common/headerwin",
        name: "business_set_headerwin",
        param: {
          subpage: "mine/business_set",
          name: "business_set",
          title: "设置交易密码",
        }
      };
      var recoinNumber = JSON.stringify(checkpassword);
      app.goPushPage(recoinNumber);
    } else if (getUserPassStus == 2) {
      app.toast("交易密码审核中");
    } else if (getUserPassStus == -2) {
      var checkpassword = {
        page: "common/headerwin",
        name: "business_set_headerwin",
        param: {
          subpage: "mine/business_set",
          name: "business_set",
          title: "设置交易密码",
        }
      };
      var recoinNumber = JSON.stringify(checkpassword);
      app.goPushPage(recoinNumber);
    } else {
      var checkpassword = {
        page: "common/headerwin",
        name: "deal_password_headerwin",
        param: {
          subpage: "mine/deal_password",
          name: "deal_password",
          title: "设置交易密码",
        }
      };
      var recoinNumber = JSON.stringify(checkpassword);
      app.goPushPage(recoinNumber);
    }
  })
  $("#goback").click(function () {
    if (goMyPage != undefined && goMyPage == true) {
      // app.createMain("mine");
      app.trigger("goMain");
    } else {
      app.closeW();
    }
  })
  app.back(function () {
    if (goMyPage != undefined && goMyPage == true) {
      app.trigger("goMain");
    } else {
      app.closeW();
    }
  });
  var events = ["openHandSet", "backF", "auth_commit_success", "setdealPassOk", "forgetPass"];
  app.listen(events, function () {
    app.reload();
  });
};