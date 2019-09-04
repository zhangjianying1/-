apiready = function() {
    $("body").scrollTop(0);
    var app = new APP();
    var banner = document.querySelector(".header");
    $api.fixIos7Bar(banner);
    app.log("first", "主页");
    app.handlePage();
    var vindex;
    // 所有轮播图片
    var allImgs = [];
    // banner相关数据
    var banners = [];
    var typeBtc = [];
    var typeEth = [];
    var typeLtc = [];
    var typeBhp = [];
    var coinArr;
    var countDownIds = [];
    var coinText = "BTC";
    var rate = 0.552;
    var topH = app.W * rate;
    //请求币种行情列表
    function asyncData() {
        app.asynchronousAjax("finance/thirdCoinQuotes", {}, function(ret) {
            app.stopRefresh();
            if (ret.code == 1) {
                var allImgArr = [];
                var allCoinNameArr = [];
                for (var currentIndex in ret.coin_quotes) {
                    var currentImgSrc = ret.coin_quotes[currentIndex].icon;
                    var currentCoinName = ret.coin_quotes[currentIndex].name;
                    allImgArr.push(currentImgSrc);
                    allCoinNameArr.push(currentCoinName);
                }
                //滚动到最前边
                $(".website").scrollLeft(0);
                // 获取币种
                for (key in ret.coin_quotes) {
                    ret.coin_quotes[key].namel = ret.coin_quotes[
                        key
                    ].name.toLocaleLowerCase();
                    typeBtc.push(ret.coin_quotes[key].data.btc);
                    typeEth.push(ret.coin_quotes[key].data.eth);
                    typeLtc.push(ret.coin_quotes[key].data.ltc);
                    typeBhp.push(ret.coin_quotes[key].data.bhp);
                }

                function coinArrAddImg(coinArr) {
                    coinArr.map(function(curVal, index) {
                        curVal.icon = allImgArr[index];
                        curVal.name = allCoinNameArr[index];
                    });
                }
                coinArrAddImg(typeBtc);
                coinArrAddImg(typeEth);
                coinArrAddImg(typeLtc);
                coinArrAddImg(typeBhp);
                coinArr = typeBtc;
                addtext(coinArr);
                $(".stockPrice").text("€  " + (Number(ret.stock_quotes.echem.price) == 0 ? " — " : String(app.accMul(ret.stock_quotes.echem.price, 0.13).split(/([0-9]+\.[0-9]{2})[0-9]*/, "$1"))));
                $(".getStockPrice").text("￥" + (Number(ret.stock_quotes.echem.price) == 0 ? " — " : ret.stock_quotes.echem.price));
                $(".upRange").text(ret.stock_quotes.echem.price == 0 ? " — " : ("+" + ret.stock_quotes.echem.float + "%"));
            }
        })
    }

    function addtext(typeArr) {
        var text = doT.template($("#coinTpl").text());
        $(".website").html(text(typeArr));
    }
    asyncData();
    // 直接显示轮播
    function openSlider(paths) {
        if (app.slider) {
            app.slider.open({
                    rect: {
                        x: 0,
                        y: 0,
                        w: app.W,
                        h: topH
                    },
                    data: {
                        paths: paths
                    },
                    styles: {
                        caption: {
                            height: 35,
                            color: "#E0FFFF",
                            size: 13,
                            bgColor: "#696969",
                            position: "bottom"
                        },
                        indicator: {
                            dot: {
                                w: 8,
                                h: 8,
                                r: 4,
                                margin: app.ST == "ios" ? 10 : 5
                            },
                            align: "center",
                            color: "#FFFFFF",
                            activeColor: "#DA70D6"
                        }
                    },
                    placeholderImg: "",
                    contentMode: 'scaleToFill',
                    interval: 5,
                    fixedOn: api.frameName,
                    loop: true,
                    fixed: false
                },
                function(ret, err) {
                    if (ret.eventType == "click") {
                        var index = ret.index;
                        app.log("--------banners--------", banners);
                        if (banners && banners.length > 0) {
                            var url = banners[index].url;
                            app.log("url", url);
                            if (
                                app.getProtocol(url) == "http" ||
                                app.getProtocol(url) == "https"
                            ) {
                                var remoteUrl = url;
                                var account = app.getAccount();
                                if (remoteUrl.indexOf("{login_params}") > 0) {
                                    if (banners[index].title == "邀请注册") {
                                        if (app.isLogin()) {
                                            return;
                                        }
                                    } else {
                                        if (!app.isLogin()) {
                                            app.goLogin();
                                            return;
                                        }
                                    }

                                    if (banners[index].title == "邀请注册") {
                                        remoteUrl = remoteUrl.replace(
                                            new RegExp("{login_params}", "g"),
                                            ""
                                        );
                                        app.log("--------invite_url--------", remoteUrl);
                                    } else {
                                        remoteUrl = remoteUrl.replace(
                                            new RegExp("{login_params}", "g"),
                                            "uid=" +
                                            account.uid +
                                            "&token=" +
                                            account.token +
                                            "&account=" +
                                            account
                                        );
                                        app.log("--------remoteUrl--------", remoteUrl);
                                    }

                                    if (remoteUrl.indexOf("{is_share}") > 0) {
                                        app.openWin({
                                            name: "browser_header_win",
                                            url: app.hd + "common/headerwin.html",
                                            pageParam: {
                                                subpage: remoteUrl,
                                                name: "browser",
                                                type: "remote",
                                                isremote: "true",
                                                rightShare: {
                                                    icon: "../../image/share_two.png"
                                                }
                                            }
                                        });
                                    } else {
                                        app.openWin({
                                            name: "browser_header_win",
                                            url: app.hd + "common/headerwin.html",
                                            pageParam: {
                                                subpage: remoteUrl,
                                                name: "browser",
                                                type: "remote",
                                                isremote: "true"
                                            }
                                        });
                                    }
                                } else {
                                    app.openWin({
                                        name: "browser_header_win",
                                        url: app.hd + "common/headerwin.html",
                                        pageParam: {
                                            subpage: "common/browser",
                                            name: "browser",
                                            title: "",
                                            url: url
                                        }
                                    });
                                }
                                return;
                            }
                            // app内部跳转
                            if (app.getProtocol(url) == "wkrrm") {
                                var pageUrl = "";
                                var pageParam = {};

                                if (url.indexOf("transfer-activity") > 0) {
                                    pageUrl = app.hd + "common/headerwin.html";
                                    pageParam = {
                                        subpage: "extrapage/sports_meeting",
                                        name: "entrust_back",
                                        title: "矿工运动会",
                                        right: "参与明细",
                                        rightParam: {
                                            page: "common/headerwin",
                                            name: "entrust_detail_header_win",
                                            param: {
                                                subpage: "extrapage/sports_content",
                                                name: "sports_content",
                                                title: "参与明细"
                                            }
                                        }
                                    };
                                    pageParam.id = url.split("?")[1].split("=")[1];
                                    app.log("--------pageParam--------", pageParam);
                                    app.log("--------ret.exist--------", "文件存在");
                                }
                            }
                        }
                    }
                }
            );
        }
    }
    // 处理倒计时
    function setStatus(startTime) {
        var timeLast = startTime;
        (function(timeLast) {
            var timer = new app.COUNTDOWN(timeLast);
            if (timeLast && timeLast > 0) {
                $(".rentButton").css({
                    width: "3.3rem"
                });
                $(".rentButton").addClass("retlastTime");
                $(".showRent").css({
                    display: "none"
                });
                $(".openDate").css({
                    display: "block"
                });
                $(".next").css({
                    display: "block"
                });
                $("#showOrin").attr("data-url", "");
                timer.start(
                    function(ret, err) {
                        if (ret > 0) {
                            // var timeArr = app.tranSecond2(ret).split(":");
                            var timeArr = app.getDuration(ret).split(":");
                            $(".rentButton")
                                .find(".leastHour")
                                .text(timeArr[0]);
                            $(".rentButton")
                                .find(".leastMin")
                                .text(timeArr[1]);
                            $(".rentButton")
                                .find(".leastSes")
                                .text(timeArr[2]);
                        } else {
                            $(".rentButton").css({
                                width: "1.8rem",
                                backgroundColor: "#ffd203"
                            });
                            $(".rentButton").removeClass("retlastTime");
                            $(".openDate").css({
                                display: "none"
                            });
                            $(".next").css({
                                display: "none"
                            });
                            $(".showRent").css({
                                display: "inline-block"
                            });
                            $(".rentButton").attr("data-url", "fisrt/itemdetial");
                            $(".rentButton").text("立即下单");
                            $("#showOrin").attr("data-url", "fisrt/itemdetial");
                            app.handlePage();
                        }
                    },
                    function(index) {
                        countDownIds.push(index);
                    }
                );
            }
        })(timeLast);
    }
    //垂直轮播数据
    function getBanner() {
        var account = app.getAccount();
        var transtext;
        if (account == null) {
            transtext = {
                values: {}
            };
        } else {
            transtext = {
                values: {
                    uid: account.uid,
                    token: account.token
                }
            };
        }
        app.ajax({
            param: {
                method: "post",
                url: app.config.url + "site/getMessage",
                data: transtext,
                callback: function(ret, err) {
                    app.stopRefresh();
                    app.log("getMessage", "getMessage返回：" + JSON.stringify(ret));
                    // alert("getMessage--------"+JSON.stringify(ret));
                    if (ret.code == 1) {
                        var retCopy = ret;
                        $(".getBtcNum").text(ret.btc_unit_num.replace(/([0-9]+\.[0-9]{8})[0-9]*/, "$1") + "BTC");
                        // 获取所有图片
                        allImgs = [];
                        for (var i = 0; i < ret.banner_list.length; i++) {
                            allImgs.push(ret.banner_list[i].pic);
                            var item = {};
                            banners = ret.banner_list;
                        }
                        if (ret.broadcast_message.length >= 2) {
                            $("#getMessageList").show();
                        } else {
                            $("#getMessageList").hide();
                        }
                        app.slider.close();
                        openSlider(allImgs);
                        // 下载轮播图
                        var bannerCache = [];
                        var index = 0; // 下载索引
                        // 下载完回调
                        function downCallback(ret, err) {
                            app.log("download_pic", ret);
                            if (ret.state == 2) {
                                var item = {};
                                item.title = "";
                                item.pic = "";
                                item.url = retCopy.banner_list[index].url;
                                bannerCache.push(item);
                                index++;
                                if (index < retCopy.banner_list.length) {
                                    var filePath = "fs://renDown/banner" + index + ".jpg";
                                    app.exist(filePath, function(ret, err) {
                                        if (ret && ret.exist) {
                                            app.log("--------app.exist--------", "文件存在111111");
                                            app.remove(filePath, function(ret, err) {
                                                if (ret && ret.status) {
                                                    app.log("remove", "文件删除成功");
                                                }
                                            });
                                        }
                                        app.download2(
                                            retCopy.banner_list[index].pic,
                                            "banner" + index,
                                            downCallback(ret, err)
                                        );
                                    });
                                } else {
                                    app.setStorage("bannerCache", bannerCache);
                                }
                                return;
                            }
                            if (ret.state == 1) {
                                var item = {};
                                item.title = retCopy.banner_list[index].title;
                                item.pic = "file://" + ret.savePath;
                                item.url = retCopy.banner_list[index].url;
                                bannerCache.push(item);
                                index++;
                                if (index < retCopy.banner_list.length) {
                                    var filePath = "fs://renDown/banner" + index + ".jpg";
                                    app.exist(filePath, function(ret, err) {
                                        if (ret && ret.exist) {
                                            app.log("--------app.exist--------", "文件存在22222");
                                            app.remove(filePath, function(ret, err) {
                                                if (ret && ret.status) {
                                                    app.log("remove", "文件删除成功");
                                                }
                                            });
                                        }
                                        app.download2(
                                            retCopy.banner_list[index].pic,
                                            "banner" + index,
                                            downCallback(ret, err)
                                        );
                                    });
                                } else {
                                    app.setStorage("bannerCache", bannerCache);
                                }
                            }
                        }
                        // 挨个下载
                        if (retCopy.banner_list && retCopy.banner_list[index]) {
                            var filePath = "fs://renDown/banner" + index + ".jpg";
                            app.exist(filePath, function(ret, err) {
                                if (ret && ret.exist) {
                                    app.log("--------app.exist--------", "文件存在333333");
                                    app.remove(filePath, function(ret, err) {
                                        if (ret && ret.status) {
                                            app.log("remove", "文件删除成功");
                                        }
                                    });
                                }
                                app.download2(
                                    retCopy.banner_list[index].pic,
                                    "banner" + index,
                                    downCallback(ret, err)
                                );
                            });
                        }
                        // 清除垂直轮播的定时器
                        window.clearInterval(vindex);
                        // 渲染垂直轮播
                        var tpl = doT.template($("#lunboContent").text());
                        $(".slider-w").html(tpl(ret.broadcast_message));
                        // 初始化垂直轮播
                        var vslider = new app.VSLIDER({
                                ele: ".v-slider",
                                interval: 4000,
                                animateInter: 500
                            },
                            function(ret) {}
                        );
                        vindex = vslider.vindex;
                    
                        var limitRentUnit = "T";
                        if (ret.machine == null) {
                            $("#hideMachine").show();
                            $("#showOrin").hide();
                            return
                        }
                        if (ret.machine.currency_name != "BTC") {
                            limitRentUnit = "M";
                        }
                        $(".machineTitle").text(ret.machine.name);
                        var currentNameType = ret.machine.is_bhp_pos; //判断起租金额类型 1 为BCNY , 0 为CNY;
                        if (currentNameType == 1) {
                            $(".rentMoney").text(Number(ret.machine.goods_deposit_bcny));
                            $(".currentName").text("BCNY");
                        } else {
                            $(".rentMoney").text(Number(ret.machine.goods_deposit));
                            $(".currentName").text("CNY");
                        }
                        $(".balance-num").text(
                            app.accMul(ret.machine.base_power, ret.machine.num_left) +
                            limitRentUnit
                        );
                        $(".showOrin").attr("data-id", ret.machine.id);
                        var newPerson = ret.machine.is_new_special;
                        var intruduction = ret.machine.type;
                        var startTime = ret.machine.time_left;
                        if (newPerson == 1) {
                            // console.log("新人");
                            $(".showOrin")
                                .removeClass("showOrin")
                                .addClass("showOrinXinRen");
                        } else if (intruduction == 2) {
                            // console.log("倒计时");
                            $(".showOrin")
                                .removeClass("showOrin")
                                .addClass("showOrinDaoJi");
                            setStatus(startTime);
                        } else {
                            // console.log("推荐");
                            $(".showOrin")
                                .removeClass("showOrin")
                                .addClass("showOrinTui");
                        }
                        if (ret.broadcast_message.length == 0) {
                            $(".broadcast").css({
                                display: "none"
                            });
                        } else {
                            $(".broadcast").css({
                                display: "flex"
                            });
                        }
                        $(".slider-w").on("click", ".slider-item", function() {
                          var thisindex = $(this).attr("data-id");
                          var getUrlCentant = ret.broadcast_message[thisindex].content;
                          var getTypetitle = ret.broadcast_message[thisindex].type;
                          var getTitle = ret.broadcast_message[thisindex].title;
                          var goCerfition = {};
                          if (getTypetitle == 2) {
                              console.log("浏览器");
                              goCerfition = {
                                  page: "common/headerwin",
                                  name: "browser_headerwin",
                                  param: {
                                      subpage: "common/browser",
                                      name: "browser",
                                      title: getTitle,
                                      url: getUrlCentant
                                  }
                              }
                          } else {
                              console.log("普通页面");
                              goCerfition = {
                                  page: "common/headerwin",
                                  name: "word_cont_one_headerwin",
                                  param: {
                                      subpage: "extrapage/word_cont_one",
                                      name: "browser",
                                      title: getTitle,
                                      content: getUrlCentant,
                                      isJson:"true"
                                  }
                              }
                          }
                          var recoinNumber = JSON.stringify(goCerfition);
                          app.goPushPage(recoinNumber);
                      })
                    }
                },
                failed: function() {
                    app.log("failed", "failed");
                    // 获取本地缓存的banner
                    var bannerCache = JSON.parse(app.getSyncStorage("bannerCache"));
                    banners = bannerCache;
                    app.log("--------bannerCache--------", bannerCache);
                    if (bannerCache.length > 0) {
                        // 获取所有图片
                        allImgs = [];
                        for (var i = 0; i < bannerCache.length; i++) {
                            allImgs.push(bannerCache[i].pic);
                        }
                        app.slider.close();
                        openSlider(allImgs);
                    }
                }
            }
        });
    }
    getBanner();
    $(".showOrin").on("click", function() {
        if (!app.isLogin()) {
            // 跳转登录页面
            app.toast("该操作需要登录");
            app.goLogin();
            return;
        } else {
            var itemUrl = $(this).attr("data-url");
            var itemId = $(this).attr("data-id");
            if (itemUrl && itemId) {
                app.openWin({
                    name: "itemdetial",
                    url: app.hd + itemUrl + ".html",
                    pageParam: {
                        itemId: itemId
                    }
                });
            }
        }
    });
    $(".disableCss").removeAttr("onclick");
    $(".typeCoin li:not(:first-of-type)").on("click", function() {
        coinText = $(this).text();
        coinArr = [];
        $(".typeCoin li").css({
            backgroundColor: "#f5f5f5"
        });
        $(this).css({
            backgroundColor: "#ffd203"
        });
        if (coinText == "BTC") {
            coinArr = typeBtc;
            addtext(coinArr);
            return
        }
        if (coinText == "ETH") {
            coinArr = typeEth;
            addtext(coinArr);
            return
        }
        if (coinText == "LTC") {
            coinArr = typeLtc;
            addtext(coinArr);
            return
        }
        if (coinText == "BHP") {
            coinArr = typeBhp;
            addtext(coinArr);
            return
        }
    });
    app.downRefresh(function() {
        app.reload();
    });
    var events = ["toPageIndex", 'quit_login', "login_success"];
    app.listen(events, function() {
        app.reload();
    });
    $(".textList span").click(function() {
        $(".textList span").css("borderBottomColor", "#fff");
        $(this).css("borderBottomColor", "#ffd203");
        var thisPrice = $(this).attr("data-type");
        if (thisPrice == "coinPrice") {
            $(".typecoin li:nth-of-type(2)").click();
            $(".outBox").animate({
                left: 0
            }, 150);
        } else {
            $(".outBox").animate({
                    left: -parseInt(app.W) + "px"
                },
                150
            );
        }
    });
    $("#getMessageList").on("click", function() {
        var goCerfition = {
            page: "common/headerwin",
            name: "moremessage_headerwin",
            param: {
                title: "消息",
                subpage: "mine/moremessage",
                name: "moremessage"
            }
        }
        var recoinNumber = JSON.stringify(goCerfition);
        app.goPushPage(recoinNumber);
    });
};