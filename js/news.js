apiready = function() {
    var app = new APP();

    function bindClick() {
        $(".n-body").on("click", function() {
            var moreNode = $(this).attr("data-flag");
            if (moreNode == "true") {
                $(this).css({
                    display: "block",
                    height: "auto"
                });
                $(this).attr("data-flag", "false");
            } else {
                $(this).css({
                    display: "-webkit-box"
                });
                $(this).attr("data-flag", "true");
            }
        });
    }

    /*--------------------加载快讯-------------------*/
    var list1Data = [];
    var curPage = 1;
    var totalPage = 0;
    var showListName = "fastNews";
    // 当前加载页面
    function drawList1(page, isdown) {
        $(".DataList1").show();
        $(".DataList2").hide();
        $(".DataList3").hide();
        if (isdown) {
            $(".DataList1 .toastInfo").text("加载中...");
        }
        var account = app.getAccount();
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "site/newsletterList",
                data: {
                    values: {
                        page: page
                    }
                },
                callback: function(ret, err) {
                    app.log(
                        "newsletterList",
                        "newsletterList返回：" + JSON.stringify(ret)
                    );
                    app.stopRefresh();
                    if (ret.code == 1) {
                        totalPage = ret.total_page;
                        // 处理数据
                        app.for(ret.latest_newsletter, function(r) {
                            var item = r.item;
                            // 处理换行符
                            // var newContent = item.content.replace(new RegExp());
                            // 计算星期
                            var createTime = item.create_time;
                            var first = createTime.split(" ")[0];
                            var second = createTime.split(" ")[1];
                            var splits1 = first.split("-");
                            var splits2 = second.split(":");
                            var result = new Date(
                                parseInt(splits1[0]),
                                parseInt(splits1[1]) - 1,
                                parseInt(splits1[2]),
                                parseInt(splits2[0]),
                                parseInt(splits2[1]),
                                parseInt(splits2[2])
                            );
                            var weekday = new Array(7);
                            weekday[0] = "星期天";
                            weekday[1] = "星期一";
                            weekday[2] = "星期二";
                            weekday[3] = "星期三";
                            weekday[4] = "星期四";
                            weekday[5] = "星期五";
                            weekday[6] = "星期六";
                            ret.latest_newsletter[r.index].weekday = weekday[result.getDay()];
                            // var wapUrl = "http://wap.wiminer.com/";  //测试
                            // var wapUrl = "https://wap.renrenmine.com/";
                            var qrUrl = "https://i.hulatu.cn/";
                            //正式
                            ret.latest_newsletter[r.index].qrtxt = qrUrl + (account ? account.uid : "");
                        });
                        // 渲染模板
                        var temp = doT.template($("#list").text());
                        list1Data = ret.latest_newsletter;
                        if (isdown) {
                            $(".DataList1 > ul > #wrapper").html("");
                            $(".DataList1 > ul > #wrapper").html(temp(list1Data));
                        } else {
                            $(".DataList1 > ul > #wrapper").append(temp(list1Data));
                        }
                        if (list1Data.length == 0 && curPage == 1) {
                            $(".DataList1 .toastInfo").text("暂时没有相关数据");
                        }

                        $(".share-txt").unbind();
                        $(".share-txt").on("click", function(e, t) {
                            e.stopPropagation();
                            var shareTxt = $(this)
                                .data("txt")
                                .toString();
                            // 处理换行
                            shareTxt = shareTxt.replace(/\n/g, "<br>");
                            var shareQrTxt = $(this).data("qrtxt");
                            var shareTitle = $(this).data("title");
                            var shareDate = $(this).data("date");
                            var weekday = $(this).data("weekday");
                            var param = {
                                dtype: "dialog191",
                                data: {
                                    title: "",
                                    text: "",
                                    btns: [{
                                        name: "取消",
                                        event: "cancel_img_share"
                                    }],
                                    lis: [{
                                            name: "微信",
                                            event: "img_share",
                                            index: 0
                                        },
                                        {
                                            name: "朋友圈",
                                            event: "img_share",
                                            index: 1
                                        },
                                        {
                                            name: "QQ",
                                            event: "img_share",
                                            index: 2
                                        },
                                        {
                                            name: "新浪微博",
                                            event: "img_share",
                                            index: 3
                                        }
                                    ],
                                    extra: {
                                        shareTxt: shareTxt,
                                        shareQrTxt: shareQrTxt,
                                        shareDate: shareDate,
                                        shareTitle: shareTitle,
                                        weekday: weekday,
                                        showBottom: true
                                    }
                                }
                            };
                            app.dialog(param);
                            // 监听分享时间
                            var wxMd, qqMd, sinaMd;
                            app.listen("img_share", function(ret, err) {
                                var index = ret.value.index;
                                var img_url = ret.value.imgPath;
                                app.log("--------要分享的图片地址是--------", img_url);
                                app.log("click_index", index);
                                // 压缩图片，解决ios无法分享的问题
                                app.compImg({
                                        img: img_url,
                                        save: {
                                            imgPath: "fs://compImage",
                                            imgName: "thumb.png"
                                        },
                                        quality: 0.5,
                                        size: {
                                            w: 200,
                                            h: 200
                                        }
                                    },
                                    function(r, e) {
                                        if (r && r.status) {
                                            app.log("--------thumb压缩陈功--------", r);
                                            switch (index) {
                                                case 0:
                                                    if (!wxMd) {
                                                        wxMd = api.require("wx");
                                                    }
                                                    //检测是否装有微信
                                                    wxMd.isInstalled(function(r, e) {
                                                        if (r.installed) {
                                                            wxMd.shareImage({
                                                                    scene: 'session',
                                                                    // title:userConfig.recommendTitle,
                                                                    // description:userConfig.recommendText,
                                                                    // thumb: "fs://shareImg/sharefrend.png",
                                                                    // thumb: "widget://res/web/images/shareicon.png",
                                                                    contentUrl: img_url
                                                                },
                                                                function(r, e) {
                                                                    if (r.status) {
                                                                        app.toast("分享成功");
                                                                    } else {
                                                                        app.log("分享失败回错误码", e.code);
                                                                        if (err.code == 2) {
                                                                            app.toast("取消分享");
                                                                        } else {
                                                                            app.toast("分享失败");
                                                                        }
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            app.toast("当前设备未安装微信客户端");
                                                        }
                                                    });
                                                    break;
                                                case 1:
                                                    if (!wxMd) {
                                                        wxMd = api.require("wx");
                                                    }
                                                    //检测是否装有微信
                                                    wxMd.isInstalled(function(r, e) {
                                                        if (r.installed) {
                                                            wxMd.shareImage({
                                                                    scene: "timeline",
                                                                    thumb: "widget://res/web/images/shareicon.png",
                                                                    contentUrl: img_url
                                                                },
                                                                function(r, e) {
                                                                    if (r.status) {
                                                                        app.toast("分享成功");
                                                                    } else {
                                                                        if (err.code == 2) {
                                                                            app.toast("取消分享");
                                                                        } else {
                                                                            app.toast("分享失败");
                                                                        }
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            app.toast("当前设备未安装微信客户端");
                                                        }
                                                    });
                                                    break;
                                            }
                                        } else {
                                            app.log("--------thumb压缩失败--------");
                                        }
                                    }
                                );
                            });
                        });
                        $(".n-body").unbind("click");
                        bindClick();
                    }
                }
            },
            extra: {
                container: "#recordslist > ul",
                isflower: true,
                delay: 1000
            }
        });
    }
    drawList1(curPage, true);
    /*------------------------------------*/

    /*------------------加载公告------------------*/
    var list2Data = [];
    var list2CurPage = 1;
    var list2TotalPage = 0;

    function drawList2(page, isdown) {
        $(".DataList1").hide();
        $(".DataList3").hide();
        $(".DataList2").show();
        app.stopRefresh();
    }
    /*---------------------------------------------*/

    /*-------------------------加载消息--------------------*/
    var list3Data = [];
    var list3CurPage = 1;
    var list3TotalPage = 0;

    function drawList3(page, isdown) {
        $(".DataList1").hide();
        $(".DataList2").hide();
        $(".DataList3").show();
        app.stopRefresh();
    }
    /*---------------------------------------------*/

    /*-------------------------上拉加载 和 下拉刷新--------------------*/
    //监听滚动到底部
    app.toBottom(function() {
        if (showListName == "fastNews") {
            if (curPage < totalPage) {
                curPage++;
                drawList1(curPage, false);
            }
        } else if (showListName == "notices") {
            if (list2CurPage < list2TotalPage) {
                list2CurPage++;
                drawList2(list2CurPage, false);
            }
        } else if (showListName == "news") {
            if (list3CurPage < list3TotalPage) {
                list3CurPage++;
                drawList3(list3CurPage, false);
            }
        }
    });
    // 设置可以下拉加载
    app.downRefresh(function() {
        if (showListName == "fastNews") {
            curPage = 1;
            drawList1(curPage, true);
        } else if (showListName == "notices") {
            list2CurPage = 1;
            drawList2(list2CurPage, true);
        } else if (showListName == "news") {
            list3CurPage = 1;
            drawList3(list3CurPage, true);
        }
    });
    /*---------------------------------------------*/

    $(".head li").on("click", function() {
        var isActive = $(this)
            .find("p")
            .hasClass("pagination-first");
        var thisIndex = $(this).index();
        if (!isActive) {
            $(this)
                .siblings("li")
                .find("p")
                .removeClass("pagination-first");
            $(this)
                .find("p")
                .addClass("pagination-first");
            showListName = $(this).attr("data-listname");
            if (thisIndex == 0) {
                curPage = 1;
                totalPage = 0;
                list1Data = [];
                drawList1(curPage, true);
            } else if (thisIndex == 1) {
                list2CurPage = 1;
                list2TotalPage = 0;
                list2Data = [];
                drawList2(list2CurPage, true);
            } else if (thisIndex == 2) {
                list3CurPage = 1;
                list3TotalPage = 0;
                list3Data = [];
                drawList3(list3CurPage, true);
            }
        }
    });

};