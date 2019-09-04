apiready = function() {
    var app = new APP();
    var thisItem = "showNews"; //头部选择 默认选中第一个
    var account = app.getAccount();
    var thisPage = 0,
        totalPage = 1; //快讯当前页 总页数
    var hotPage = 0,
        hotTotalpage = 1; //深度当前页，总页数
    var ajaxAccount = 0; //深度请求ajax成功数
    var newsList = []; //快讯
    //动态资讯
    function showNewsList(page, isdown) {
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
                    app.stopRefresh();
                    if (ret.code == 1) {
                        totalPage = ret.total_page;
                        var thisData = new Date(); //获取当前时间
                        var thisMonth = thisData.getMonth() + 1;
                        thisMonth = Number(thisMonth) < 10 ? ("0" + thisMonth) : thisMonth;
                        var thisDay = thisData.getDate();
                        thisDay = Number(thisDay) < 10 ? ("0" + thisDay) : thisDay;
                        var weekDay = "";
                        var weekday = new Array(7);
                        weekday[0] = "星期天";
                        weekday[1] = "星期一";
                        weekday[2] = "星期二";
                        weekday[3] = "星期三";
                        weekday[4] = "星期四";
                        weekday[5] = "星期五";
                        weekday[6] = "星期六";
                        weekDay = thisMonth + "月" + thisDay + "日" + " " + weekday[thisData.getDay()];
                        $("#todayTime").text(weekDay);
                        app.for(ret.latest_newsletter, function(r) {
                            var item = r.item;
                            // 处理换行符
                            // var newContent = item.content.replace(new RegExp());
                            // 计算星期
                            var createTime = item.create_time;
                            item.content =  item.content.replace(/(\n)/g, "");
                            item.content =  item.content.replace(/(\t)/g, "");
                            item.content =  item.content.replace(/(\r)/g, "");
                            item.content =  item.content.replace(/<\/?[^>]*>/g, "");
                            item.content =  item.content.replace(/\s*/g, "");
                            item.content = item.content.replace(/\n/g, "<br>");
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
                            var wapUrl = "https://wap.renrenmine.com/";
                            var qrUrl = "https://i.hulatu.cn/";
                            //正式
                            ret.latest_newsletter[r.index].qrtxt = qrUrl + (account ? account.uid : "");
                        });
                        // 渲染模板
                        var temp = doT.template($("#listNews").text());
                        if (isdown) {
                            newsList = ret.latest_newsletter;
                            $("#newsList").html(temp(ret.latest_newsletter));
                        } else {
                            $("#newsList").append(temp(ret.latest_newsletter));
                            for (var i = 0; i < ret.latest_newsletter.length; i++) {
                                newsList.push(ret.latest_newsletter[i])
                            }
                        }
                        if (thisPage == 1 && ret.latest_newsletter.length == 0) {
                            $("#listState").text("暂时没有相关数据");
                        }
                    }
                }
            },
            extra: {
                container: "#newsList",
                isflower: true
            }
        });
    }
    showNewsList(thisPage, true);
    //深度资讯点击
    function bindDeep() {
        function goPage(id, kind) {
            var cointypecontract = {
                page: "common/headerwin",
                name: "news_detail_headerwin",
                param: {
                    subpage: "mine/news_detail",
                    name: "news_detail",
                    title: "资讯详情",
                    id: id,
                    kind: kind
                }
            };
            var recoinNumber = JSON.stringify(cointypecontract);
            app.goPushPage(recoinNumber);
        }
        $("#showDeepsList").on("click", "li", function() {
            goPage($(this).data("id"), $(this).data("kind"))
        });
        $(".hotNews").on("click", "div", function() {
            goPage($(this).data("id"), $(this).data("kind"))
        });
    }
    //深度资讯
    var deepListarr = []; //深度列表
    function deepnewsList(page, isdown) {
        app.flower();

        function hideFlower() {
            ajaxAccount++;
            if (ajaxAccount >= 2) {
                ajaxAccount = 2;
                app.flower.close();
                bindDeep();
            }
        }
        if (page == 0) {
            app.ajax({
                param: {
                    method: "post",
                    url: app.config.url + "article/getList",
                    data: {
                        values: {
                            kind: 2,
                            page: 1,
                            size: 3
                        }
                    },
                    callback: function(ret, err) {
                        app.stopRefresh();
                        if (ret.lists) {
                            var temp = doT.template($("#hotMb").text());
                            var appList = ret.lists.splice(0, 3);
                            $(".hotNews").html(temp(appList));
                        }
                        hideFlower();
                    }
                }
            });
        }
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "article/getList",
                data: {
                    values: {
                        page: page < hotTotalpage ? hotPage + 1 : hotPage,
                        kind: 1
                    }
                },
                callback: function(ret, err) {
                    app.stopRefresh();
                    console.log("-----------------------1215" + JSON.stringify(ret));
                    if (ret) {
                        if (page < hotTotalpage) {
                            $(".tobottom").text("加载更多");
                            hotPage++
                        }
                        hotTotalpage = ret.totalpage;
                        var temp2 = doT.template($("#deepMb2").text());
                        if (isdown) {
                            deepListarr = [];
                            deepListarr = ret.lists;
                        } else {
                            for (var i = 0; i < ret.lists.length; i++) {
                                deepListarr.push(ret.lists[i]);
                            }
                        }
                        deepListarr.map(function(item) {
                            if (item.kind == 1) {
                                item.istopfive = true;
                            }
                        })
                        app.log('deepListarr++++++++++++++++++++++++', deepListarr)
                        $("#showDeepsList").html(temp2(deepListarr));
                        if (hotPage == 1 && hotTotalpage == 0) {
                            $(".tobottom").text("暂时没有相关数据");
                        }
                        if (hotPage >= hotTotalpage && hotTotalpage > 0) {
                            $(".tobottom").text("已经到底了");
                        }

                    }
                    hideFlower();
                }
            }
        });
    }
    //资讯点击事件
    $("#newsList").on("click", "li>div", function(params) {
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
    })
    $("#newsList").on("click", "li>span", function(e) {
        e.stopPropagation();
        var thizIndex = $(this).index();
        var shareTxt = $(this).data("txt");
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
    //监听头部选择
    var choseValue = 'showNews';
    app.listen("newsChooseItem", function(ret, err) {
        thisItem = ret.value;
        thisPage = 0;
        totalPage = 1;
        $("body>div").hide();
        $("#" + ret.value).show();
        if (ret.value == "showNews") {
            if (choseValue == ret.value) return;
            $("#newsList").empty();
            showNewsList(thisPage, true);
            return
        }
        if (ret.value == "deepnews") {
            $("#showDeepsList,.hotNews").empty(); //没有接口临时屏蔽
            hotPage = 0;
            hotTotalpage = 1;
            ajaxAccount = 0;
            deepnewsList(thisPage, true);
            return
        }
    });
    //加载更多
    app.toBottom(function() {
        if (thisPage < totalPage && thisItem == "showNews") {
            thisPage++;
            showNewsList(thisPage, false);
            return
        }
        if (hotPage < hotTotalpage && thisItem == "deepnews") {
            deepnewsList(hotPage, false);
            return
        }
    });
    //下拉刷新
    app.downRefresh(function() {
        thisPage = 0;
        totalPage = 1;
        hotPage = 0;
        hotTotalpage = 1;
        ajaxAccount = 0;
        if (thisItem == "showNews") {
            $("#newsList").empty();
            showNewsList(thisPage, true);
            return
        }
        if (thisItem == "deepnews") {
            $("#showDeepsList,.hotNews").empty();
            deepnewsList(hotPage, true);
            return
        }
    })

};