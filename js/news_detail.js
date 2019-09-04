apiready = function() {
    var app = new APP();
    app.handlePage();
    var account = app.getAccount();
    var newsId = api.pageParam.id;
    var goodimg = new Image();
    var qrUrl = "https://i.hulatu.cn/";
    goodimg.src = api.wgtRootDir + '/image/isgoodicon.png';

    function share(shareTxt, shareTitle, shareDate) {
        shareTxt = shareTxt.replace(/\n/g, "<br>");
        shareQrTxt = qrUrl + (account ? account.uid : "");
        var d = new Date(shareDate.replace(/-/g, '/'));
        var weekday = new Array(7)
        weekday[0] = "星期天";
        weekday[1] = "星期一";
        weekday[2] = "星期二";
        weekday[3] = "星期三";
        weekday[4] = "星期四";
        weekday[5] = "星期五";
        weekday[6] = "星期六";
        var wk = weekday[d.getDay()];
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
                    weekday: wk,
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
    }
    var ajaxValue = { id: newsId };
    if (account) {
        ajaxValue = {
            id: newsId,
            uid: account.uid
        }
    }
    app.ajax({
        //获取内容
        param: {
            method: "post",
            url: app.config.url + "article/get",
            data: { values: ajaxValue },
            callback: function(ret, err) {
                app.log('获取内容接口获取内容接口获取内容接口获取内容接口+++++++++++++++++++', ret)
                if (ret.code == 1) {
                    if (ret.author_avator) {
                        $(".author_header").attr("src", ret.author_avator)
                    } else {
                        $(".author_header").attr("src", "../../image/user_img.png")
                    }
                    $(".textHead").text(ret.title);
                    $(".agreeNum").text(ret.reading);
                    $(".author_name").text(ret.author_name);
                    $(".showMain").html(ret.content);
                    $(".create_at").text(ret.create_at);
                    $(".shareWx").click(function() {
                        app.flower();
                        share(ret.content + '\n', ret.title, ret.product_at)
                    })
                }
            }
        },
        extra: {
            isflower: true
        }
    })
};