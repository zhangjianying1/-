apiready = function() {
    var app = new APP();
    var param = api.pageParam;
    app.log("弹窗数据", JSON.stringify(param));
    var temp = doT.template($("#" + param.dtype).text());
    $("body").html(temp(param));
    $("." + param.dtype).fadeIn(300);
    if (param.dtype == "dialog34") {
        var index = 1;
        var thisSetID = setInterval(function() {
            $("#id" + index).fadeIn().css({
                display: "flex",
                display: "-webkit-flex"
            });
            index++;
            if (index > 5) {
                $("#transEvent").attr("data-flag", "true").css("color", "#181818");
                clearInterval(thisSetID);
            }
        }, 800);
        $("#transEvent").on("click", function() {
            var thisflag = $(this).attr("data-flag");
            if (thisflag == "false") return
            var thisGo = $(this).attr("data-event")
            app.trigger(thisGo);
        })
    }
    if (param.dtype == "dialog341") {
        var index = 1;
        var thisSetID = setInterval(function() {
            $("#id" + index).fadeIn().css({
                display: "flex",
                display: "-webkit-flex"
            });
            index++;
            if (index > 4) {
                $("#transEventNew").attr("data-flag", "true").css("color", "#181818");
                clearInterval(thisSetID);
            }
        }, 800);
        $("#transEventNew").on("click", function() {
            var thisflag = $(this).attr("data-flag");
            if (thisflag == "false") return
            var thisGo = $(this).attr("data-event");
            app.trigger(thisGo);
        })
    }
    $(".btns button").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    $(".btns p").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    // 监听进度条进度更新
    app.listen("update_progress", function(ret, err) {
        app.log("--------收到update_progress--------", ret);
        if (ret.value.state == 0) {
            $("#progress").css("width", ret.value.percent + "%");
            return;
        }
        if (ret.value.state == 1) {
            $("#progress").css("width", ret.value.percent + "%");
            $(".dialog4 .text").text("下载完成！");
            return;
        }
        if (ret.value.state != 0 && ret.value.state != 1) {
            $("#progress").css("width", ret.value.percent + "%");
            $(".dialog4 .text").text("下载失败！");
        }
    });
    $(".dialog8 .getMoney").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    $(".dialog8 .btns i").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    $(".dialog9 li").click(function() {
        // alert("dialog.html--------click dialog9 li");
        var event = $(this).data("event");
        var index = $(this).data("index");
        if (event) {
            app.trigger(event, {
                index: index
            });
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    $(".dialog10 i").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    $(".btns i.reloads").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    if (param.dtype == "dialog13") {
        $(".dialog13 btns button").click(function() {
            var event = $(this).data("event");
            if (event) {
                app.trigger(event);
            }
            app.closeF();
        });
    }

    $(".btns2 button").click(function() {
        console.log("--------点击了对话框按钮-------");
        var event = $(this).data("event");
        param.data.extra.text = $(".dialog16 input:checked").data("text");
        param.data.extra.value = $(".dialog16 input:checked").data("value");
        param.data.extra.subtype = $(".dialog16 input:checked").data("subtype");
        param.data.extra.id = $(".dialog16 input:checked").data("id");
        param.data.extra.couponid = $(".dialog16 input:checked").data(
            "couponid"
        );
        // 获取
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    $(".dialog18 li").click(function() {
        var event = $(this).data("event");
        var index = $(this).data("index");
        if (event) {
            // 生成canvas图片
            if (canvas) {
                window.getImgFromCanvas(canvas, "share.png", function(ret) {
                    app.trigger(event, {
                        index: index,
                        imgPath: ret
                    });
                });
            }
        }
        app.tout(1500, function() {
            app.closeF();
        });
    });
    if (param.dtype == "dialog19") {
        var backW = $("#shareTotal").width();
        var backH = (backW * 88) / 52;
        var paddingTop = (backH * 34) / 100;
        var bottomH = $("#shareBottom").height();
        var scrollHeight = $("#shareTotal")[0].scrollHeight;
        if (param.data.extra.showBottom) {
            $("#shareTotal").css({
                height: backH + "px",
                top: (app.H - bottomH - backH) / 2
            });

            $(".share-main").css({
                paddingTop: paddingTop + "px"
            });
            if (app.ST == "android") {
                $("#fuck").css({
                    width: "90%"
                });
                $("#coinIcon").css({
                    right: "0px"
                });
            }
            // 生成二维码
            $("#qrCode").qrcode({
                render: "canvas", //也可以替换为table
                width: 60,
                height: 60,
                text: param.data.extra.shareQrTxt
            });

            // 从canvas获取图片并保存到本地，返回url
            function getImgFromCanvas(canvas, fileName, callback) {
                if (canvas) {
                    var base64 = canvas.toDataURL("image/png", 0.6);
                    app.log("--------final_base64--------", base64);
                    var trans = api.require("trans");
                    trans.saveImage({
                            base64Str: base64.split(";base64,")[1],
                            imgPath: "fs://shareImg/",
                            imgName: fileName,
                            album: false
                        },
                        function(ret, err) {
                            if (ret.status) {
                                app.log(
                                    "--------本地图片地址--------",
                                    app.sd + "/shareImg/" + fileName
                                );
                                callback("fs://shareImg/" + fileName);
                            } else {
                                callback(null);
                            }
                        }
                    );
                }
            }
            window.getImgFromCanvas = getImgFromCanvas;
            window.copy = $("#shareW").clone();
            // 缩放比计算
            var rate = backH / scrollHeight;
            app.log("--------rate---------", rate);
            if (rate > 1) {
                rate = 1;
            }
            if (app.ST == "ios") {
                rate -= 0.07;
            }
            // 写入样式
            $("head").append(
                "<style>.scale{transform:scale(" +
                rate +
                "," +
                rate +
                ");-webkit-trasform:scale(" +
                rate +
                "," +
                rate +
                ");}</style>"
            );
            $("#shareW")
                .addClass("scale")
                .css({
                    top: "-" + (scrollHeight - backH) / 2 + "px"
                });
            $("#shareW").prop("id", "");
            $("#shareTotal").css({
                backgroundColor: "transparent",
                overflowY: "hidden"
            });
        }
    } else {
        $("#shareTotal").css({
            height: backH + "px",
            top: (app.H - backH) / 2 + "px"
        });
        $("#cancelBtn").css({
            bottom: (app.H - backH) / 2 + "px",
            width: backW + "px",
            left: (app.W - backW) / 2 + "px"
        });
        $("#shareTotal").click(function(e, t) {
            e.stopPropagation();
        });
        // 处理点击空白推出
        $("body").click(function(e, t) {
            //e.stopPropagation();
            app.closeF();
        });
        // 隐藏背景图
        $("#shareBack").hide();
        $(".share-info").hide();
        $(".share-main")
            .find(".share-time")
            .hide();
        $(".share-main").css({
            paddingBottom: "10px",
            paddingTop: "10px"
        });
    }
    $(".dialog19 li").click(function() {
        var event = $(this).data("event");
        var index = $(this).data("index");
        if (event) {
            // 把之前保存的视图填回
            $("#shareTotal")
                .html(window.copy)
                .css({
                    opacity: 0
                });
            $("#shareBottom").css({
                opacity: 0
            });
            html2canvas(document.getElementById("shareW"), {
                height: $("#shareTotal")[0].scrollHeight
            }).then(function(canvas) {
                app.log("--------html2canvas--------", "html2canvas");
                console.log("------------------------" + canvas);
                window.getImgFromCanvas(canvas, "share.png", function(ret) {
                    app.trigger(event, {
                        index: index,
                        imgPath: ret
                    });
                    app.tout(100, function() {
                        app.closeF();
                    });
                });
            });
        }
    });
    var fsImgurl; //获取canvas地址
    if (param.dtype == "dialog191") {
        // 生成二维码
        $("#newsImgText").qrcode({
            render: "canvas", //也可以替换为table
            width: 70,
            height: 70,
            text: param.data.extra.shareQrTxt
        });
        var opts = {
            scale: 1.2, // 添加的scale 参数 //ios默认
            height: 1000,
            logging: true, //日志开关，便于查看html2canvas的内部执行流程
            useCORS: true // 【重要】开启跨域配置
        };

        function afterOnload() {
            var getBoxheight = $("#showAboutNews").height();
            opts.height = getBoxheight + 10;
            opts.width = $("#showAboutNews").width();
            var heightBox = getBoxheight * 0.02 + "rem"; //ios默认
            if (app.ST != "ios") {
                heightBox = getBoxheight * 0.021 + "rem";
                opts.scale = 1.6;
            }
            if (getBoxheight > 400) {
                $("#testUmg").css({
                    height: "100%",
                    paddingBottom: "4.24rem"
                });
            } else {
                $("#testUmg").css({
                    height: heightBox,
                    paddingBottom: "0.2rem"
                });
            }
            $("#showAboutNews").scrollTop(0);
            $("#testUmg").scrollTop(0);
            // 从canvas获取图片并保存到本地，返回url
            function getImgFromCanvas(canvas, fileName, callback) {
                if (canvas) {
                    var base64 = canvas.toDataURL("image/png", 0.6);
                    app.log("--------final_base64--------", base64);
                    var trans = api.require("trans");
                    trans.saveImage({
                            base64Str: base64.split(";base64,")[1],
                            imgPath: "fs://shareImg/",
                            imgName: fileName,
                            album: false
                        },
                        function(ret, err) {
                            app.log("canvas ret ", ret);
                            if (ret.status) {
                                app.log(
                                    "--------本地图片地址--------",
                                    app.sd + "/shareImg/" + fileName
                                );
                                callback("fs://shareImg/" + fileName);
                            } else {
                                callback(null);
                            }
                        }
                    );
                }
            }
            window.getImgFromCanvas = getImgFromCanvas;
            html2canvas(document.getElementById('showAboutNews'), opts).then(function(canvas) {
                window.getImgFromCanvas(canvas, "sharefrend.png", function(ret) {
                    fsImgurl = ret;
                });
            })
            app.closeFlower();
        }
        var lens = $('.dialog191 img').length;
        var begin = 0;
        var srcArr = [];
        $(".dialog191 img").each(function() {
            srcArr.push($(this).attr('src'));
        })
        for (var i = 0; i < srcArr.length; i++) {
            var newImg = new Image();
            newImg.src = srcArr[i];
            newImg.onload = function() {
                begin++;
                if (begin == lens) {
                    afterOnload();
                }
            }
        }
    }
    $(".dialog191 .dialogBottom li").click(function(e) {
        e.stopPropagation(); //  阻止事件冒泡
        var event = $(this).data("event");
        var index = $(this).data("index");
        if (event) {
            // 把之前保存的视图填回
            app.trigger(event, {
                index: index,
                imgPath: fsImgurl
            });
            app.tout(100, function() {
                app.closeF();
            });
        }
    });
    if (param.dtype == "dialog21") {
        $("#chenckRechcge button").click(function() {
            var event = $(this).data("event");
            if (event) {
                app.trigger(event);
            }
            app.closeF();
        });
    }
    if (param.dtype == "dialog24") {
        $(".button p").click(function() {
            var event = $(this).data("event");
            if (event) {
                app.trigger(event);
                $(this).unbind();
            }
            app.closeF();
        });
    }
    if (param.dtype == "dialog29") {
        $(".goCertifiton button").click(function() {
            var event = $(this).data("event");
            if (event) {
                app.trigger(event);
                $(this).unbind();
            }
            app.closeF();
        });
    }
    if (param.dtype == "dialog29copy") {
        $('body').unbind('click');
        app.listen('add_relnameSuccess', function() {
            app.closeF();
        })
        $(".goCertifiton .relname_sure").click(function(e) {
            var goCerfition = {
                page: "common/headerwin",
                name: "choosecerfertion_headerwin",
                param: {
                    subpage: "my/choosecerfertiontwo",
                    name: "choosecerfertiontwo",
                    title: "实名校验",
                    goAddMoney: true
                }
            };
            var recoinNumber = JSON.stringify(goCerfition);
            app.goPushPage(recoinNumber);
            app.closeF();
            e.stopPropagation();
        });
        $(".goCertifiton .cancelRelname").click(function(e) {
            app.closeF();
            e.stopPropagation();
        })
    }
    if (param.dtype == "dialog25") {
        $(".button p").click(function() {
            var event = $(this).data("event");
            if (event) {
                app.trigger(event);
                $(this).unbind();
            }
            app.closeF();
        });
    }
    if (param.dtype == "dialog26") {
        $(".dialog26 .button p").click(function() {
            var event = $(this).data("event");
            if (event) {
                app.trigger(event);
            }
            app.closeF();
        });
    }
    if (param.dtype == "dialog261") {
        $(".dialog261 .button p").click(function() {
            var event = $(this).data("event");
            if (event) {
                app.trigger(event);
            }
            app.closeF();
        });
    }

    if (param.dtype == "dialog27") {
        $("#checkAgree span").click(function() {
            var event = $(this).attr("data-event");
            if (event) {
                app.trigger(event);
            }
            app.closeF();
        });
    }


    // 处理特殊弹窗
    if (param.dtype == "dialog12") {
        app.log("----dialog12----", "特殊对话框");
        $("." + param.dtype).css("left", "0rem");
    }

    // 特殊处理
    if (param.dtype == "dialog16") {
        app.log("-------dialog16-------", param.data.extra);
        $(".dialog16 input").prop("checked", false);
        $(".dialog16 input[data-id=" + param.data.extra.cur_id + "]").prop(
            "checked",
            true
        );
    }

    // 处理特殊弹窗
    if (param.dtype == "dialog16") {
        app.log("----dialog16----", "特殊对话框");
        $("." + param.dtype).css("left", "0rem");
    }

    $("." + param.dtype).fadeIn(300);
    $(".dialog16 .btns button").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });


    $(".dialog19 #cancelBtn").click(function() {
        app.closeF();
    });
    $(".d-btns img").click(function() {
        var event = $(this).data("event");
        if (event) {
            app.trigger(event, param.data.extra);
        }
        app.tout(300, function() {
            app.closeF();
        });
    });
    $("#holder_16,.dialog12>.d-del,.close,.closeCover,.delete").click(function() {
        app.tout(300, function() {
            app.closeF();
        });
    })
    $(".useRight").click(function() {
        if (app.clipboard) {
            var text = $(this).data("clipboard-text");
            app.clipboard.set({
                value: text
            }, function(ret, err) {
                app.log("copy", ret);
                if (ret.status) {
                    app.toast("收款帐号已复制到剪贴板");
                } else {
                    app.toast("复制失败！");
                }
            });
        }
    });
    $(".dialog16 input").click(function(e) {
        e.stopPropagation();
        $(".dialog16 input").prop("checked", false);
        $(this).prop("checked", true);
    });

    $(".select-item").click(function() {
        $(".dialog16 input").prop("checked", false);
        $(this)
            .find("input")
            .prop("checked", true);
    });
    $("#closeCoverNew").on("click", function(params) {
        var thisData = $(this).attr("data-avent");
        app.trigger(thisData);
    })
    app.handlePage();
    // 把窗口设置为最上层
    if (app.isiPhone10) {
        var div = "<div style='height: 0.4rem;background:#fff'></div>";
        $(".cancal_tou").after(div);
    }
};