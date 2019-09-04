apiready = function () {
  var app = new APP();
  var account = app.getAccount();
  var imgWidth = app.W * 0.85;
  var imgHeight = imgWidth;
  var typeChooseNew = "idcard";
  var userName = api.pageParam.userName;
  var userCardNumber = api.pageParam.userCardNumber;
  var goMyPage = api.pageParam.goMyPage;
  var goAddMoney = api.pageParam.goAddMoney ? true : 'false';
  var typeChoose = 1; //1身份证 2护照 3台胞证
  if (api.pageParam.type == "idCard") {
    typeChoose = 1;
  }
  if (api.pageParam.type == "passport") {
    typeChoose = 2;
    $(".reverse").hide();
    $("#idCardfront").attr("src", "../../image/userotherx.png");
    $(".tips").text("请上传证件图片")
  }
  if (api.pageParam.type == "otherport") {
    typeChoose = 3;
    $(".reverse").hide();
    $("#idCardfront").attr("src", "../../image/userotherx.png");
    $(".tips").text("请上传证件图片")
  }

  function openPirtrue(thiz) {
    app.sheet({
        buttons: ["拍照", "相册"],
        cancelTitle: "取消"
      },
      function (ret, err) {
        var index = ret.buttonIndex;
        app.log("index", index);
        if (index == 1) {
          //拍照
          app.shootPic(function (ret, err) {
            app.log("shoot", ret);
            // 图片裁剪
            if (ret && ret.data) {
              app.openImgHandle({
                type: typeChooseNew,
                flag: $(thiz).data("flag"),
                srcPath: ret.data,
                dimension: [imgWidth, imgHeight]
              });
            }
          });
          return;
        }
        if (index == 2) {
          //相册
          app.getPic(function (ret, err) {
            // 图片裁剪
            if (ret && ret.data) {
              app.log("get", ret);
              app.openImgHandle({
                type: typeChooseNew,
                flag: $(thiz).data("flag"),
                srcPath: ret.data,
                dimension: [imgWidth, imgHeight]
              });
            }
          });
        }
      }
    );
  }
  //更换头像
  $(".force").click(function () {
    var thiz = this;
    openPirtrue(thiz);
  });
  $(".reverse").click(function () {
    var thiz = this;
    openPirtrue(thiz);
  });
  app.listen("compress_image_success", function (ret, err) {
    app.log("压缩事件chankan", JSON.stringify(ret));
    // app.log("压缩事件", ret.value.imgUrl);
    if (ret.value.flag && ret.value.imgUrl) {
      var retCopy = ret;
      // 上传图片

      // 开始转菊花
      app.upload({
        param: {
          method: "post",
          url: app.config.url + "upload/img",
          data: {
            values: {
              uid: account.uid,
              token: account.token
            },
            files: {
              "DynamicModel[file]": ret.value.imgUrl
            }
          },
          callback: function (ret, err) {
            console.log("图片查看地址" + JSON.stringify(ret));
            if (ret.files && ret.files.length > 0) {
              $("#" + retCopy.value.flag)
                .data("path", ret.files[0].path)
                .attr("src", ret.files[0].url);
            }
          }
        },
        extra: {
          isflower: true,
          flowerParam: {
            msg: "正在上传...",
            delay: 500
          }
        }
      });
    }
  });
  $(".nextbutton").on("click", function () {

    if (typeChoose == 0 && $("#idCardfront").data("path") == "") {
      app.toast("请上传身份证正面图片");
      return;
    }
    if (typeChoose == 0 && $("#idCardreverse").data("path") == "") {
      if ($("#idCardfront").data("path") == "") {
        app.toast("请上传身份证反面图片");
        return;
      }
    }
    if (typeChoose == 1 && $("#idCardfront").data("path") == "") {
      if ($("#idCardfront").data("path") == "") {
        app.toast("请上传证件图片");
        return;
      }
    }
    if (typeChoose == 2 && $("#idCardfront").data("path") == "") {
      if ($("#idCardfront").data("path") == "") {
        app.toast("请上传证件图片");
        return;
      }
    }
    if (goAddMoney == true) {
        app.ajax({
            param: {
              method: "post",
              url: app.config.url + "member/sumitRealnameVerify",
              data: {
                    values: {
                        uid: account.uid,
                        token: account.token,
                        name: userName,
                        id_num: userCardNumber,
                        id_photo_1: $("#idCardfront").data("path"),
                        id_photo_2: $("#idCardreverse").data("path"),
                        type: typeChoose
                    }
                },
                callback: function (ret, err) {
                    if( ret.code == 1 ){
                        app.toast('提交成功');
                        app.trigger('add_relnameSuccess')
                        app.theart(500,function () {
                            app.toMainWin()
                        })
                    } else {
                      app.toast(ret.desc);
                   }
                }
            }
        });
      return;
    }
    app.ajax({
      param: {
        method: "post",
        url: app.config.url + "member/sumitRealnameVerify",
        data: {
          values: {
            uid: account.uid,
            token: account.token,
            name: userName,
            id_num: userCardNumber,
            id_photo_1: $("#idCardfront").data("path"),
            id_photo_2: $("#idCardreverse").data("path"),
            type: typeChoose
          }
        },
        callback: function (ret, err) {
          app.log("auth", "提交返回：" + JSON.stringify(ret));
          if (ret.code == 1) {
            // 发送认证成功提交成功消息
              if( goAddMoney == true ){
                app.toast('提交成功');
                app.theart(500,function () {
                  app.toWin('littlemoneyrecharge_headerwin');
                })
                  return;
              }
            app.trigger("auth_commit_success");
            app.toast("上传成功");
            app.toWin("safetyset");
              if (goMyPage == true) {
                  app.openWin({
                      name: "safetyset",
                      url: app.hd + "my/safetyset.html",
                      pageParam: {
                          goMyPage: true
                      },
                      slidBackEnabled: false
                  })
              }

          }
          if (ret.code == 0 && ret.statusCode == 500) {
            app.toast("网络链接失败")
          }
          if (ret.code == -1 && ret.desc) {
            app.toast(ret.desc)
          }
        }
      },
      extra: {
        isflower: true
      }
    });
  });
  app.listen("commit_successful", function () {
    app.closeW();
  });
};