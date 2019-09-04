apiready = function() {
    var app = new APP();
    $(".footer-nav img").each(function() {
        var img = $(this);
        img.error(function() {
            var newImg = new Image();
            newImg.src = $(this).attr("src");
            newImg.onload = function() {
                $(img).attr("src", newImg.src);
            };
        });
    });
    // app.flower();
    // return;
    if (app.isiPhone10) {
        $("footer").css("padding-bottom", "25px");
    }
    app.log("welcome", "开撸吧，程序猿！");
    // 标识是否是客服页面
    app.isService = false;
    app.winName = "index";
    app.frameName = "";
    // 保存当前窗口是root
    app.setStorage("curWin", "root");
    // 是否有更新
    var hasUpdate = false;
    // 标记是否第一次点击
    var isFirst = true;
    var curPageIndex = 0;
    var curPageName = "index";
    // tab索引表
    var tabIds = {
        index: 0,
        orin: 1,
        news: 2,
        mine: 3
    };

    // 主要页面管理（默认已创建租用）
    var mainPages = ["index"];

    app.toFront("tab");
    app.toFront("flower");
    // tab图标索引
    var urlPre = "../image/first/";
    var urlFix = ".png";
    var icons = [
        ["homepagex", "homepage_inx"],
        ["wakuangx", "wakuang_inx"],
        ["kuaixunx", "kuaixun_inx"],
        ["minex", "mine_in"]
    ];
    // tab切换
    function handleSwitch(index, flag) {
        if (!flag || flag == undefined) {
            return false;
        }
        $(".footer-nav").find("span").css({
            color: "#b3b3b3"
        });
        $(".footer-nav li").eq(index).find("span").css({
            color: "#fabf38"
        });
        curPageIndex = index;
        curPageName = flag;
        if (flag == "index") {
            curPageIndex = 0;
        } else if (flag == "orin") {
            curPageIndex = 1;
        } else if (flag == "news") {
            curPageIndex = 2;
        } else if (flag == "mine") {
            curPageIndex = 3;
        }
        $(".footer-nav li").each(function() {
            var index2 = $(this).index();
            var newImg = new Image();
            if (index != index2) {
                newImg.src = urlPre + icons[index2][0] + urlFix;
                $(this).find("img").attr("src", newImg.src);
            } else {
                newImg.src = urlPre + icons[index2][1] + urlFix;
                $(this).find("img").attr("src", urlPre + icons[index2][1] + urlFix);
            }
        });
        // 隐藏其他页面
        for (var i = 0; i < mainPages.length; i++) {
            if (flag == mainPages[i]) {
                app.showFrame(flag);
            } else {
                app.hideFrame(mainPages[i]);
            }
        }
        app.setStorage("pageMainIndex", curPageIndex);
        // 把tab放到最前
    }
    app.handlePage();
    // 处理点击tab
    $(".footer-nav li").click(function() {
        // 把tab放到最前
        app.log("调用click+++++++++++++++++++++++++++");
        app.log("mainpage", mainPages);
        var flag = $(this).data("flag");
        if (flag == "mine" || flag == "orin") {
            // 判断用户是否已登录
            if (!app.isLogin()) {
                // 跳转登录页面
                app.toastDefi("该操作需要登录");
                app.goLogin();
                return;
            }
        }
        $(".footer-nav li").children("span").css({
            color: "#b3b3b3"
        });
        $(this).children("span").css({
            color: "#fabf38"
        });
        curPageName = flag;
        // 处理选中样式
        if (!$(this).hasClass("aui-active")) {
            var index = $(this).index();
            if (index == 0) {
                app.trigger("toPageIndex");
            } else if (index == 3) {
                app.trigger("toPageMine");
            }
            curPageIndex = index;
            $(".footer-nav li").each(function() {
                var index2 = $(this).index();
                if (index != index2) {
                    $(this).find("img").attr("src", urlPre + icons[index2][0] + urlFix);
                } else {
                    $(this).find("img").attr("src", urlPre + icons[index2][1] + urlFix);
                }
            });
        }
        app.setStorage("curp");
        // 判断是否已经创建了页面
        if (mainPages.indexOf(flag) < 0) {
            app.createMain(flag);
            mainPages.push(flag);
        }
        // 隐藏其他页面
        for (var i = 0; i < mainPages.length; i++) {
            if (flag == mainPages[i]) {
                app.showFrame(flag);
                app.setStorage("pageMainIndex", i);
            } else {
                app.hideFrame(mainPages[i]);
            }
        }

        if (flag == 'orin') {
            var chooseItem = {
                transStatus: "",
                payMethod: "",
                worktype: ""
            }
            app.setStorage("orinDialogChoose", chooseItem);
            app.openFrame({
                name: "rhead",
                url: app.hd + "main/reader.html",
                bgColor: "rgba(0,0,0,0)",
                rect: {
                    x: 0,
                    y: app.hH,
                    w: app.W,
                    h: 50
                }
            });
            app.flower();
            setTimeout(function() {
                app.trigger("reloadOrin");
            }, 300)
        } else {
            app.closeF("rhead");
            app.closeF("orin_dialog");
            app.closeF("orintime");
        }
        if (flag == 'news_flash') {
            app.openFrame({
                name: "newsheader",
                url: app.hd + "main/newsheader.html",
                bgColor: "rgba(0,0,0,0)",
                rect: {
                    x: 0,
                    y: app.hH,
                    w: app.W,
                    h: 52
                }
            });
        } else {
            app.closeF("newsheader");
        }
        if (flag == "mine") {
            app.openFrame({
                name: "mine_header",
                url: app.hd + "main/mine_header.html",
                bgColor: "rgba(0,0,0,0)",
                rect: {
                    x: 0,
                    y: app.hH,
                    w: app.W,
                    h: 50
                }
            });
        } else {
            app.closeF("mine_header");
        }
        app.toFront("tab");
        app.toFront("flower");
    });
    // 监听登录成功
    app.listen("login_success", function() {
        app.log("index_login_success", "index监听到登录成功");
        app.setStorage("curWin", "");
    });
    //监听在首页的时候，后台回到app刷新
    app.resume(function() {
        app.setStorage("curWin", "");
        if (curPageIndex == 1) {
            app.trigger("orinPageReload");
        }
        if (curPageIndex == 3) {
            app.trigger("toPageMine");
        }
        if (curPageIndex == 0) {
            app.trigger("toPageIndex");
        }
        app.trigger("openhandLine");
        app.trigger("openTouchID");
        app.trigger("hideBackButton");
    });

    // 监听reset_tabs事件
    app.listen("reset_tabs", function() {
        // 切换到默认的租用页面
        curPageName = "index";
        $(".footer-nav li").eq(0).click();
    });

    // 监听窗口关闭事件（解决android兼容性问题）
    app.listen(["win_appear"], function(ret) {
        if (ret.value.rentList) {
            app.toWin("root");
            $(".footer-nav li").eq(1).click();
            if (app.ST == 'ios') {
                setTimeout(function() {
                    $(".footer-nav li").eq(1).click();
                }, 200)
            }
            return;
        }
        if (ret.value == "index") {
            // 复位选
            // handleSwitch(tabIds[curPageName], curPageName);
        }
    });
    app.listen("cancelUpdate", function() {
        hasUpdate = false;
    });
    // 监听重启事件
    app.listen("retart", function() {
        app.log("监听到app重启消息！");
        // 立即重启
        app.tout(500, function() {
            app.restart();
        });
    });
    // 创建主界面（先创建租用）
    if (app.ST == "ios") {
        app.createMain("index");
    }

    // 监听退出应用
    app.back(function() {
        app.setStorage("curWin", "");
        api.toLauncher();
    });


    // app启动调用
    // app.start();

    /*如果是第一次进入默认显示提示“点击快讯”蒙版*/
     // app.rmStorage('isfirst');
     app.listen('showNewsDilog',function () {
            app.openFrame({
                name: "news_dilog",
                url: app.hd + "main/news_dilog.html",
                bgColor: "rgba(0,0,0,0)",
                rect: {
                    x: 0,
                    y: app.hH,
                    w: app.W,
                    h: app.H
                }
            });
            app.toFront("news_dilog");
     });
    //判断app是否已启动过
    if (app.isFirst()) {
        app.showBroads();
    }

    // 如果已登录，那么启动消息处理器
    var handler = null;
    var account = app.getAccount();
    app.log("account", account);

    // 监听退出登录
    app.listen("quit_login", function() {
        app.setStorage("closeShow", "");
        var matrixLock = api.require("matrixLock");
        matrixLock.clearGesture();
        app.log("index_quit_login", "index监听到退出登录");
        if (handler) {
            handler.stop();
        }
        handleSwitch(0, "index");
        $(".footer-nav li").eq(0).click()
        app.toMainWin();
    });

    app.listen("goTranfer", function() {
        if (handler) {
            handler.stop();
        }
        handleSwitch(1, "orin");
        app.toMainWin();
    });


    app.listen("quithandLine", function() {
        var matrixLock = api.require("matrixLock");
        matrixLock.clearGesture();
    });
    // 监听登录页面点击关闭
    app.listen("backFirst", function() {
        if (handler) {
            handler.stop();
        }
        handler = null;
        handleSwitch(0, "index");
    });

    //监听跳转到矿机列表
    app.listen("go_machineList", function(ret) {
        app.trigger("win_appear", {
            value: 'index',
            rentList: true
        });
    });
    app.listen("goMain", function() {
        app.toMainWin();
        setTimeout(function() {
            $(".footer-nav li")
                .eq(3)
                .click();
            app.toWin("root");
        }, 500);
    });
    api.addEventListener({
        name: 'appintent'
    }, function() {
        app.toMainWin();
        setTimeout(function() {
            $(".footer-nav li")
                .eq(3)
                .click();
            app.toWin("root");
        }, 500);
    });
    // 监听系统静默更新完成，然后强制重启app
    // app.listen("smartupdatefinish", function() {
    //   app.tout(500, function() {
    //     app.restart();
    //   });
    // });

    // 监听重启事件
    // app.listen("retart", function () {
    //   app.log("监听到app重启消息！");
    //   // 立即重启
    //   app.tout(500, function () {
    //     app.restart();
    //   });
    // });


    // initPush();

};