(function() {
    // 参数conf是额外的配置
    var APP = function(conf) {
        // 全局公用的this
        var thiz = this;

        // 是否需要调试打印（默认需要）
        this.openLog = false;

        // 打印调试
        this.log = function(mark, msg) {
            if (thiz.openLog) {
                var mk = "";
                if (mark) {
                    mk = mark;
                }
                var date = this.getDate();
                if (msg instanceof Array || msg instanceof Object) {
                    msg = JSON.stringify(msg);
                }
                console.log("[" + date + "]  @" + mk + "  " + msg);
            }
        };

        // 检测某个应用是否已安装
        this.checkApp = function(pkName) {
            var installed = api.appInstalled({
                sync: true,
                appBundle: pkName
            });
            return installed;
        };

        // 重启app
        this.restart = function() {
            api.rebootApp();
        };

        // 打开某个应用
        this.openApp = function(config, callback) {
            if (config) {
                var conf = {};
                if (thiz.ST == "android") {
                    conf.appParam = config.appParam;
                    conf.androidPkg = config.androidPkg;
                } else {
                    conf.appParam = config.appParam;
                    conf.iosUrl = config.iosUrl;
                }
                api.openApp(conf, function(ret, err) {
                    if (callback) {
                        callback(ret, err);
                    }
                });
            } else {
                thiz.toast("打开" + config.name + "失败！");
            }
        };

        // 打开系统自带浏览器
        this.openSysNavi = function(url, callback) {
            if (url) {
                if (thiz.ST == "android") {
                    api.openApp({
                        androidPkg: "android.intent.action.VIEW",
                        mimeType: "text/html",
                        uri: url
                    }, function(ret, err) {
                        if (callback) {
                            callback(ret, err);
                        }
                    });
                } else {
                    api.openApp({
                        iosUrl: url
                    }, function(ret, err) {
                        if (callback) {
                            callback(ret, err);
                        }
                    });
                }
            }
        };

        // 安装应用
        this.install = function(path) {
            if (path) {
                api.installApp({
                    appUri: path
                });
            }
        };

        // 关闭组件（静默关闭）
        this.closeWidget = function() {
            api.closeWidget({
                id: thiz.ID,
                silent: true
            });
        };

        // 把app版本转换为整数，便于比较大小
        this.getVerNum = function(version) {
            var result = "";
            if (version) {
                var splits = version.split(".");
                for (var i = 0; i < splits.length; i++) {
                    result += splits[i];
                }
                result = parseInt(result);
            }
            return result;
        };

        // for循环（循环对象或者数组）
        this.for = function(target, callback) {
            if (target instanceof Array) {
                for (var i = 0; i < target.length; i++) {
                    var index2 = i;
                    thiz.log("index2", index2);
                    var ret = {};
                    ret.target = target;
                    ret.item = target[index2];
                    ret.index = index2;
                    callback(ret);
                }
                return;
            }
            if (target instanceof Object) {
                for (var key in target) {
                    var key2 = key;
                    var ret = {};
                    ret.target = target;
                    ret.item = target[key2];
                    ret.key = key2;
                    callback(ret);
                }
            }
        };

        // 数组删除所有指定值的元素（暂时只支持字符串）
        this.deleteArrStr = function(arr, value) {
            var result = arr;
            if (result instanceof Array) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i] == value) {
                        result.splice(i, 1);
                    }
                }
            }
            return result;
        };

        // 解析json
        this.parse = function(json) {
            this.log("parse", json);
            var result = null;
            if (json && typeof json == "string") {
                result = JSON.parse(json);
            } else {
                result = json;
            }
            return result;
        };

        // 把json转为字符串
        this.jsonStr = function(jsonObj) {
            var result;
            if (jsonObj instanceof Array || jsonObj instanceof Object) {
                result = JSON.stringify(jsonObj);
            }
            return result;
        };

        // 小数保留小数位数
        this.toFixed = function(num, dec) {
            function toDecimal(number, FixNumber) {
                number = Number(number).toFixed(FixNumber + 3);
                number = number.substring(0, number.lastIndexOf(".") + FixNumber + 1);
                return number;
            }
            return toDecimal(num, dec);
        };

        // 把字符串转为数字（整数和浮点数）
        this.toNum = function(num) {
            var result;
            if (num) {
                if (typeof num == "string") {
                    result = Number(num);
                }
                if (typeof num == "number") {
                    result = num;
                }
            }
            return result;
        };

        // 截取小数的后四位
        this.deciFour = function(decimal) {
            var result;
            if (typeof decimal == "string") {
                result = parseFloat(decimal).toFixed(8);
            }
            if (typeof decimal == "number") {
                result = parseFloat(decimal).toFixed(8);
            }
            result = result + "";
            var splits = result.split(".");
            result = splits[0] + "." + splits[1].slice(0, 4);
            return result;
        };

        // 解析整数
        this.toInt = function(num) {
            var result;
            if (num) {
                if (typeof num == "string") {
                    result = Number(num);
                }
                if (typeof num == "number") {
                    result = num;
                }
                result = parseInt(result);
            }
            return result;
        };

        // 倒计时
        this.countDown = function(second, callback) {
            thiz.log("countDown", "调用了countDown");
            var time = second;
            var id = null;
            this.countDown.stopCount = function() {
                if (id) {
                    window.clearInterval(id);
                    thiz.log("countDown", "已停止倒计时！");
                }
            };
            if (time > 0 && !id) {
                id = setInterval(function() {
                    time--;
                    if (callback) {
                        callback({
                            time: time,
                            id: id,
                        });
                    }
                    if (time == 0) {
                        window.clearInterval(id);
                    }
                }, 1000);
            }
        };

        // 转换秒为00：00：00显示格式
        this.tranSecond = function(second) {
            var sec = second;
            var hour = parseInt(sec / 3600);
            if (hour < 10) {
                hour = "0" + hour;
            }
            var min = parseInt((sec % 3600) / 60);
            if (min < 10) {
                min = "0" + min;
            }
            var secLast = parseInt((sec % 3600) % 60);
            if (secLast < 10) {
                secLast = "0" + secLast;
            }
            return hour + ":" + min + ":" + secLast;
        };

        // 转换秒为 0天 00:00:00 显示格式
        this.tranSecond2 = function(second) {
            var sec = second;
            // 天
            var day = parseInt(sec / (3600 * 24));
            var hour = parseInt(sec / 3600);
            if (hour < 10) {
                hour = "0" + hour;
            }
            var min = parseInt((sec % 3600) / 60);
            if (min < 10) {
                min = "0" + min;
            }
            var secLast = parseInt((sec % 3600) % 60);
            if (secLast < 10) {
                secLast = "0" + secLast;
            }
            return (day > 0 ? day + "天 " : "") + hour + ":" + min + ":" + secLast;
        };

        //转化时间为天 时分秒
        this.getDuration = function(my_time) {
            var my_time = my_time;
            var days = my_time / 60 / 60 / 24;
            var daysRound = Math.floor(days) < 10 ? ("0" + Math.floor(days)) : Math.floor(days);
            var hours = my_time / 60 / 60 - (24 * daysRound);
            var hoursRound = Math.floor(hours) < 10 ? ("0" + Math.floor(hours)) : Math.floor(hours);
            var minutes = my_time / 60 - (24 * 60 * daysRound) - (60 * hoursRound);
            var minutesRound = Math.floor(minutes) < 10 ? ("0" + Math.floor(minutes)) : Math.floor(minutes);
            var seconds = my_time - (24 * 60 * 60 * daysRound) - (60 * 60 * hoursRound) - (60 * minutesRound);
            if (seconds < 10) {
                seconds = "0" + seconds
            }
            // console.log('转换时间:', daysRound + '天', hoursRound + '时', minutesRound + '分', seconds + '秒');
            if (Number(daysRound) > 10) {
                time = daysRound + "天" + ':' + hoursRound + "时";
                if (hoursRound == 0) {
                    time = daysRound - 1 + "天" + ":" + 23 + "时";
                }
            }
            if (1 <= Number(daysRound) <= 10) {
                time = daysRound + "天" + ':' + hoursRound + "时" + ':' + minutesRound + "分";
                if (Number(minutesRound) == 0) {
                    time = daysRound + "天" + ':' + hoursRound + "时" + ':' + "01" + "分";
                }
                if (Number(hoursRound) == 0 && Number(minutesRound) == 0 && Number(daysRound) > 2) {
                    time = daysRound - 1 + "天" + ":" + 23 + "时" + ":" + 59 + "分";
                    if (Number(daysRound) == 1) {
                        time = 0 + "天" + ":" + 23 + "时" + ":" + 59 + "分";
                    }
                }
            }
            if (Number(daysRound) < 1) {
                time = hoursRound + "时" + ':' + minutesRound + "分" + ":" + seconds + "秒";
            }
            return time;
        }
        // 初始化常见操作
        this.initCommon = function() {
            // 解决iOS点击响应慢的问题
            try {
                if (FastClick) {
                    FastClick.attach(document.body);
                }
            } catch (e) {
                thiz.log("err", "找不到FastClick变量");
            }

            // 设置状态栏颜色
            api.setStatusBarStyle({
                style: "dark",
                color: "rgba(0,0,0,0)"
            });

            // 初始化点击返回
            if ($(".aui-pull-left")) {
                $(".aui-pull-left").unbind("click").on("click", function() {
                    var type = $(".aui-pull-left").data("type");
                    var gobackPage = $(this).attr("data-chooseBack");
                    thiz.log("界面类型type界面类型type界面类型type界面类型type+++++++++", type);
                    if (type == "frame") {
                        api.closeFrame();
                    }
                    if (type == "win" && gobackPage) {
                        thiz.trigger("goMain");
                        return
                    }
                    if (type == "win") {
                        api.closeWin();
                        thiz.setStorage("curWin", "");
                    }

                });
            }

            // 初始化第三方模块
            this.wx = api.require("wx");
            this.wxPay = api.require("wxPay");
            this.mQia = api.require('meiQia');
            // 图片浏览
            this.photoBrowser = api.require("photoBrowser");
            // 浏览器
            this.browser = api.require("webBrowser");
            // 图片裁剪
            this.clipper = api.require("FNImageClip");
            // 图片压缩
            this.filter = api.require("imageFilter");
            // 复制模块
            this.clipboard = api.require("clipBoard");
            // 文件系统木块
            this.fs = api.require("fs");
            // 轮播模块
            this.slider = api.require('UIScrollPicture');
            //指纹解锁
            // this.touchID = api.require('touchID');
            //下拉框
            this.uiActionSelector = api.require('UIActionSelector');

            // this.SERVICE_ID = "KEFU151014142758694"; // 测试客服ID
            this.SERVICE_ID = "KEFU151271731977533"; // 正式客服ID

            //查看是否链接网络
            this.connectionType = api.connectionType;


            // 监听回到当前视图
            this.appear(function() {
                thiz.setStorage("curWin", thiz.winName);
                thiz.setStorage("serviceFlag", thiz.winName);
                thiz.trigger("win_appear", thiz.winName);
            });
            //监听当前视图消失
            this.disappear(function() {
                thiz.setStorage('disapperWin', thiz.winName);
                thiz.trigger("win_disappear", thiz.winName);
                thiz.setStorage("serviceFlag", "");
            });
        };

        // 数据初始化
        this.init = function() {
            // 系统类型
            this.ST = api.systemType;
            // app版本
            this.AV = api.appVersion;
            // 组件ID
            this.ID = "A6004740046353";
            // app名称标志
            this.FG = "wkrrm";
            // 当前显示窗口名称
            this.winName = api.pageParam.winName ? api.pageParam.winName : "index";
            this.log("init_winName", this.winName);
            // 当前frame名称
            this.frameName = api.pageParam.frameName ? api.pageParam.frameName : "";
            this.log("init_frameName", this.frameName);

            // APICloud的文件存储路径
            this.sd = api.fsDir;
            // 项目目录路径
            this.rd = api.wgtRootDir;
            this.deviceModel = api.deviceModel; //手机型号
            this.log("手机型号", this.deviceModel);
            // 页面根路径
            this.hd = api.wgtRootDir + "/html/";
            // 界面常量
            this.W = api.winWidth; // 窗口宽度
            this.H = api.winHeight; // 窗口高度
            this.FW = api.frameWidth; // frame宽度
            this.FH = api.frameHeight; // frame高度

            this.btH = 54; // 底部tab高度
            this.sH = 0;
            this.hH = 24; // 如果主界面有顶部header，那么获取其高度
            this.isHuaweip = false;
            if (this.deviceModel.indexOf("EML-AL00") != -1) {
                this.isHuaweip = true;
                this.hH = 28;
            }
            this.isHuaweip = false;
            if (this.deviceModel.indexOf("EML-AL00") != -1) {
                this.isHuaweip = true;
                this.hH = 28;
            }
            this.isiPhone10 = false; // 判断手机是不是iPhoneX/max
            if (this.deviceModel.search("iPhone") != -1 && typeof window !== 'undefined' && window) {
                var getisihone = /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
                if (getisihone == true) {
                    this.hH = 30; //苹果x状态栏高度为30
                    this.isiPhone10 = true;
                    this.btH = 80;
                }
            }
            this.showPhoneHead = true; //是否需要显示手机头部默认通知栏目
            if (this.showPhoneHead == false) {
                this.hH = 0;
            }

            this.mH = this.H - this.btH; // 主界面高度

            this.ohH = 0; // 如果其他界面有顶部header，那么获取其高度
            // 其他界面header高度
            var otherMHH = this.getSyncStorage("OMHH");
            if (otherMHH) {
                this.ohH = parseInt(otherMHH);
            }
            // 其他配置
            this.config = {};
            if (conf && conf instanceof Object) {
                this.config = $.extend(this.config, conf);
            }
            this.orinDailogHH = this.ST == "ios" ? 51 : 45; // 挖矿页面时间弹窗的高度
            this.orinDailogFH = this.ST == "ios" ? this.orinDailogHH - 1 : this.orinDailogHH - 1; //挖矿页面弹窗定位高度
            this.orinChooseHH = this.ST == "ios" ? 100 : 96; // 挖矿页面筛选弹窗的高度
            this.orinChooseFH = this.ST == "ios" ? this.orinChooseHH + 2 : this.orinChooseHH - 8; //挖矿页面筛选弹窗定位高度
            // // 服务器请求地址
            // this.config.url = "http://appapi.wiminer.com/"; // 测试  
            // this.config.url = "https://preappapiv1.renrenmine.com/" //预上线域名
            this.config.url = "https://rrmappapiv1.hulatu.cn/"; // 正式
            // this.config.wapUrl = "http://wap.wiminer.com"; //warp测试
            this.config.wapUrl = "https://wap.renrenmine.com"; //warp正式
            // 列表ajax请求状态1
            this.listAjaxing = false; // 默认未发送请求
            this.initCommon();
        };

        //判断空对象
        thiz.isNullObj = function(obj) {
            if (obj instanceof Array || obj instanceof Object) {
                result = JSON.stringify(obj);
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            }
        };
        // 判断文件是否存在
        this.exist = function(file, callback) {
            if (this.fs) {
                this.fs.exist({
                        path: file
                    },
                    callback);
            } else {
                callback(null, false);
            }
        };
        // 删除文件
        this.remove = function(file, callback) {
            if (this.fs) {
                this.fs.remove({
                        path: file
                    },
                    callback);
            } else {
                callback(null, false);
            }
        };

        //金额格式化
        this.outputmoney = function(value) {
            var result = "";
            //将整数部分和小数部分分开
            var valueParts = String(value).split(".");
            var mostSignificationDigit = valueParts[0].length - 1; // 最高有效数字位，默认为个位
            var intervalOfDigit = 0; // 逗号之间的位数（从零累计）
            var digit, countOfSignificationDigit;

            //按位取出整数部分的值
            //如果不加下面这句话，低版本浏览器可能无法处理整数部分
            var roundNum = valueParts[0].split("");
            for (var i = valueParts[0].length - 1; i >= 0; i--) {
                digit = roundNum[i];
                result = digit + result;
                if (digit != "0") {
                    mostSignificationDigit = i;
                }
                //每三位添加逗号
                if (3 == ++intervalOfDigit) {
                    result = "," + result;
                    intervalOfDigit = 0;
                }
            }
            if (mostSignificationDigit == -1) {
                result = "0";
            } else {
                countOfSignificationDigit =
                    valueParts[0].length - mostSignificationDigit;
                if (countOfSignificationDigit > 3) {
                    result = result.substring(
                        result.length -
                        (countOfSignificationDigit % 3 == 0 ?
                            countOfSignificationDigit / 3 - 1 :
                            countOfSignificationDigit / 3) -
                        countOfSignificationDigit);
                } else {
                    result = result.substring(result.length - countOfSignificationDigit);
                }
            }
            if (valueParts.length == 2) {
                result += ".";
                var temp = 2 - valueParts[1].length; // 是否需要补0
                for (var i = 0; i < temp; i++) {
                    valueParts[1] += "0";
                }
                result += valueParts[1].substring(0, 2);
            } else {
                result += ".00";
            }
            return result;
        };
        //金额后保留两位小数
        this.changeTwoDecimal_f = function(x) {
            var f_x = parseFloat(x);
            if (isNaN(f_x)) {
                alert('function:changeTwoDecimal->parameter error');
                return false;
            }
            var f_x = Math.round(x * 100) / 100;
            var s_x = f_x.toString();
            var pos_decimal = s_x.indexOf('.');
            if (pos_decimal < 0) {
                pos_decimal = s_x.length;
                s_x += '.';
            }
            while (s_x.length <= pos_decimal + 2) {
                s_x += '0';
            }
            return s_x;
        }
        // 乘法高精度算法
        this.accMul = function(arg1, arg2) {
            var m = 0,
                s1 = arg1.toString(),
                s2 = arg2.toString();
            try {
                m += s1.split(".")[1].length;
            } catch (e) {}
            try {
                m += s2.split(".")[1].length;
            } catch (e) {}
            return (
                (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
                Math.pow(10, m));
        };
        // 加法高精度算法
        this.accAdd = function(arg1, arg2) {
            var r1, r2, m, n;
            try {
                r1 = arg1.toString().split(".")[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            } catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2));
            n = r1 >= r2 ? r1 : r2;
            return ((arg1 * m + arg2 * m) / m).toFixed(n);
        };
        //多个数字高精度加法算法
        this.moreAccAdd = function() {
            var arg1 = 0,
                arg2,
                args = arguments,
                r1,
                r2,
                m,
                n;
            while (args.length) {
                arg2 = args[0];
                try {
                    r1 = arg1.toString().split(".")[1].length;
                } catch (error) {
                    r1 = 0;
                }
                try {
                    r2 = arg2.toString().split(".")[1].length;
                } catch (error) {
                    r2 = 0;
                }
                m = Math.pow(10, Math.max(r1, r2));
                n = r1 >= r2 ? r1 : r2;
                [].shift.call(args, 1);
                arg1 = ((arg1 * m + arg2 * m) / m).toFixed(n);
            }
            return arg1;
        };
        //减法
        this.numSub = function(num1, num2) {
            var baseNum, baseNum1, baseNum2;
            var precision; // 精度
            try {
                baseNum1 = num1.toString().split(".")[1].length;
            } catch (e) {
                baseNum1 = 0;
            }
            try {
                baseNum2 = num2.toString().split(".")[1].length;
            } catch (e) {
                baseNum2 = 0;
            }
            baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
            precision = baseNum1 >= baseNum2 ? baseNum1 : baseNum2;
            return ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision);
        };
        //高精度除法
        this.accDiv = function(num1, num2) {
            var t1, t2, r1, r2;
            try {
                t1 = num1.toString().split(".")[1].length;
            } catch (e) {
                t1 = 0;
            }
            try {
                t2 = num2.toString().split(".")[1].length;
            } catch (e) {
                t2 = 0;
            }
            r1 = Number(num1.toString().replace(".", ""));
            r2 = Number(num2.toString().replace(".", ""));
            return (r1 / r2) * Math.pow(10, t2 - t1);
        };
        //时间函数 返回现在日期加上指定天数后的日期
        this.showdate = function(n) {
            var uom = new Date(new Date() - 0 + n * 86400000);
            var month = uom.getMonth() + 1 < 10 ? "0" + (uom.getMonth() + 1) : uom.getMonth() + 1;
            var days = uom.getDate() < 10 ? "0" + uom.getDate() : uom.getDate();
            var time = " 00:00:00";
            uom = uom.getFullYear() + "-" + month + "-" + days + time;
            return uom;
        };
        this.showdateArr = function(m, n) {
            var uom = new Date(m - 0 + n * 86400000);
            var month = uom.getMonth() + 1 < 10 ? "0" + (uom.getMonth() + 1) : uom.getMonth() + 1;
            var days = uom.getDate() < 10 ? "0" + uom.getDate() : uom.getDate();
            var hh = uom.getHours() < 10 ? "0" + uom.getHours() : uom.getHours();
            var mm = uom.getMinutes() < 10 ? "0" + uom.getMinutes() : uom.getMinutes();
            var ss = uom.getSeconds() < 10 ? "0" + uom.getSeconds() : uom.getSeconds();
            uom = uom.getFullYear() + "-" + month + "-" + days + " " + hh + ":" + mm + ":" + ss;
            return uom;
        };
        // 校验手机号码
        this.checkPhone = function(phone) {
            // 判断输入号码是否有效
            if (!phone || !phone.trim()) {
                this.toast("请输入手机号码！");
                return false;
            }
            if (phone.length < 11 || isNaN(Number(phone))) {
                this.toast("请输入正确手机号码！");
                return false;
            }
            return true;
        };

        // 检测身份证号码
        this.checkIdnum = function(idnum) {
            if (!idnum) {
                this.toast("请输入身份证号码！");
                return false;
            }
            var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if (!reg.test(idnum)) {
                this.toast("请输入正确身份证号码！");
                return false;
            }
            return true;
        };

        // 监听输入框输入变化，移动端onchange事件不好用，最好用onkeyup
        this.keyup = function(input, callback) {
            if ($ && typeof input == "string") {
                $(input).on("keyup", function(e, t) {
                    callback($(this).val());
                });
                return;
            }
            if ($ && input instanceof Array) {
                for (var i = 0; i < input.length; i++) {
                    if (input[i].type) {
                        var curInput = input[i];
                        $(input[i].ele).on("keyup", function(e, t) {
                            callback({
                                type: curInput.type,
                                ele: curInput.ele,
                                val: $(this).val()
                            });
                        });
                    } else {
                        $(input[i]).on("keyup", function(e, t) {
                            callback($(this).val());
                        });
                    }
                }
                return;
            }
        };

        // 限制只能输入规定条件的内容（condition可以为number,num-letter）
        this.limit = function(ele, limit, callback) {
            var limits = {
                number: /^[0-9]*$/,
                letter: /^[a-zA-Z]*$/,
                "num-letter": /^[0-9a-zA-Z]*$/,
                decimal: /^[-,\+]{0,1}[0-9]*\.{0,1}[0-9]{0,4}$/,
                decimal6: /^[-,\+]{0,1}[0-9]*\.{0,1}[0-9]{0,6}$/
            };
            if (limits[limit]) {
                thiz.keyup(ele, function(ret) {
                    thiz.log("输入变化", ret);
                    if (limits[limit].test(ret)) {
                        thiz.log("fuck", "fuck");
                        callback({
                            value: ret,
                            status: true
                        });
                    } else {
                        callback({
                            value: ret,
                            status: false
                        });
                    }
                });
            }
        };

        // 统一APP入口创建frame
        this.openFrame = function(config) {
            if (config instanceof Object) {
                api.openFrame(config);
            }
        };

        // 设置frame相关参数
        this.setFrame = function(attr) {
            if (attr instanceof Object) {
                api.setFrameAttr(attr);
            }
        };

        // 设置frameGroup
        this.setFG = function(attr) {
            if (attr instanceof Object) {
                api.setFrameGroupAttr(attr);
                api.setFrameGroupIndex(attr);
            }
        };

        // 把frame设置到前台显示
        this.toFront = function(from, to, time) {
            var conf = {
                from: from
            };
            if (to) {
                conf.to = to;
            }
            var waitTime2 = 100;
            if (time) {
                waitTime2 = time;
            }
            setTimeout(function() {
                api.bringFrameToFront(conf);
            }, waitTime2);
        };
        this.toBack = function(from, to, time) {
            var conf2 = {
                from: from
            };
            if (to) {
                conf2.to = to;
            }
            var waitTime = 100;
            if (time) {
                waitTime = time;
            }
            setTimeout(function() {
                api.sendFrameToBack(conf2);
            }, waitTime);
        };

        // 统一创建frameGroup
        this.openFG = function(config, callback) {
            if (config instanceof Object) {
                api.openFrameGroup(config, callback);
            }
        };

        // 切换frameGroup的frame
        this.switchF = function(name, index) {
            api.setFrameGroupIndex({
                name: name,
                index: index
            });
        };

        // 统一APP入口创建win
        this.openWin = function(config) {
            if (config instanceof Object) {
                // 保存当前窗口名称到本地数据库
                thiz.setStorage("curWin", config.name);
                api.openWin(config);
            }
        };

        // 检测窗口是否已经存在窗口栈中
        this.checkWin = function(name, callback) {
            var isWinExist = false;
            this.trigger("check_win", {
                name: name
            });
            this.listen("check_win_feedback", function(ret, err) {
                thiz.log("check_win_feedback", ret);
                isWinExist = true;
                callback(ret, err);
            });

            // 100毫秒无响应就表示没有该窗口了
            var tout = new thiz.TOUT(100);
            tout.start(function() {
                if (!isWinExist) {
                    thiz.log("checkWin", "没有得到指定窗口响应！" + name);
                    callback(null, null);
                }
            });
        };

        // 显示启动轮播广告
        this.showBroads = function() {
            this.openWin({
                name: "broads_win",
                url: this.hd + "common/broadcasting.html",
                slidBackEnabled: false,
                animation: {
                    type: "fade"
                }
            });
        };
        // 打开下载
        this.openloadframe = function(param) {
            this.log("弹窗数据+++++++++++++++", param)
            this.openFrame({
                name: "downloadApk",
                url: thiz.hd + "common/download.html",
                bgColor: "rgba(0,0,0,0.4)",
                rect: {
                    x: 0,
                    y: 0,
                    w: thiz.W,
                    h: "auto"
                },
                pageParam: param
            });
            this.toFront("downloadApk");
        };
        // 打开弹窗frame
        this.dialog = function(param) {
            this.log("弹窗数据+++++++++++++++", param)
            this.openFrame({
                name: "dialog",
                url: thiz.hd + "common/dialog.html",
                bgColor: "rgba(0,0,0,0.4)",
                rect: {
                    x: 0,
                    y: 0,
                    w: thiz.W,
                    h: "auto"
                },
                pageParam: param
            });
        };

        // 打开弹窗win
        this.dialogWin = function(param) {
            this.openWin({
                name: "dialog",
                url: thiz.hd + "common/dialog.html",
                pageParam: param,
                animation: {
                    type: "fade"
                }
            });
        };

        // apicloud自带confirm
        this.confirm = function(param, callback) {
            api.confirm(param, function(ret, err) {
                callback(ret, err);
            });
        };

        // 关闭对话框frame
        this.closeDialog = function() {
            api.closeFrame({
                name: "dialog"
            });
        };

        // 打开图片浏览页面
        this.openImgViewer = function(urls) {
            if (typeof urls == "string" || urls instanceof Array) {
                this.openWin({
                    name: "imageviewer",
                    url: thiz.hd + "common/imageviewer.html",
                    pageParam: {
                        urls: urls
                    }
                });
            }
        };

        // 打开图片浏览组件
        this.showImgBrowser = function(urls, callback) {
            if (urls && this.photoBrowser) {
                var images = [];
                if (typeof urls == "string") {
                    images.push(urls);
                }
                if (urls instanceof Array) {
                    images = urls;
                }
                this.photoBrowser.open({
                    images: images
                }, function(ret, err) {
                    if (callback) {
                        callback(ret, err);
                    }
                });
            }
        };

        // 获取当前图片的url
        this.getCurImgUrl = function(callback) {
            if (this.photoBrowser) {
                this.photoBrowser.getIndex(function(ret, err) {
                    if (ret) {
                        thiz.photoBrowser.getImage({
                            index: ret.index
                        }, function(ret2, err2) {
                            if (ret2) {
                                callback(ret2.path);
                            } else {
                                callback("");
                            }
                        });
                    } else {
                        callback("");
                    }
                });
            } else {
                callback("");
            }
        };

        // 获取当前窗口名称
        this.getCurWinName = function() {
            var curWin = this.getSyncStorage("curWin");
            this.log("getCurWinName", curWin);
            return curWin;
        };
        // 关闭当前frame
        this.closeF = function(name) {
            if (!name) {
                api.closeFrame();
            } else {
                api.closeFrame({
                    name: name
                });
            }
        };
        // 关闭当前窗口
        this.closeW = function(name) {
            if (!name) {
                api.closeWin();
            } else {
                api.closeWin({
                    name: name
                });
            }
            this.setStorage("curWin", "");
            this.setStorage("leftW", name);
        };
        this.leftW = function(name) {
            //缓存上一个页面，设置为token
            this.setStorage("leftW", name);
        };
        // 关闭到主窗口
        this.toMainWin = function() {
            api.closeToWin({
                name: "root"
            });
            this.setStorage("curWin", "root");
            this.setStorage("leftW", "login");
        };

        // 关闭到指定窗口
        this.toWin = function(name) {
            api.closeToWin({
                name: name
            });
            this.setStorage("curWin", name);
        };

        // 隐藏页面
        this.hideFrame = function(name) {
            api.setFrameAttr({
                name: name,
                hidden: true
            });
        };

        this.toMainIndex = function() {
            this.showFrame("index");
            this.closeW();
            this.closeF();
        };

        // 显示页面
        this.showFrame = function(name) {
            thiz.log("调用showFrame+++++++++++++++++++++++++++++++" + name);
            api.setFrameAttr({
                name: name,
                hidden: false
            });
        };

        // // 创建底部tab栏
        this.createBottomTab = function() {
            // 创建底部tab
            api.openFrame({
                name: "tab",
                url: thiz.hd + "tab.html",
                bgColor: "#ffffff",
                rect: {
                    x: 0,
                    //y: this.H - thiz.btH,
                    w: thiz.W,
                    h: thiz.btH,
                    marginBottom: 0
                }
            });
        };

        // 创建主要界面（index、properties、sell、pocket、mine）
        this.createMain = function(name, reload) {
            var url = thiz.hd + "main/" + name + ".html";
            var mainMarginBt = thiz.btH; // 54
            if (thiz.isiPhone10) {
                mainMarginBt = 80;
            }
            var frameRect = {
                x: 0,
                y: thiz.hH,
                w: thiz.W,
                h: "auto",
                marginBottom: mainMarginBt
            };
            if (this.deviceModel.toLowerCase().indexOf("OPPO") != -1) {
                frameRect = {
                    x: 0,
                    y: thiz.hH,
                    w: thiz.W,
                    h: thiz.H - thiz.hH - mainMarginBt
                };
            }
            api.openFrame({
                name: name,
                url: url,
                rect: frameRect,
                reload: reload,
                bgColor: "#f5f5f5"
            });
            thiz.toFront("tab");
            thiz.toFront("downloadApk");
        };

        // 打开浏览器
        this.browse = function(url, callback) {
            if (url && thiz.browser) {
                var omhh = 70; /*thiz.getSyncStorage("OMHH");*/
                thiz.browser.openView({
                    url: url,
                    rect: {
                        x: 0,
                        y: omhh,
                        w: thiz.W,
                        h: thiz.H - omhh
                    }
                }, function(ret, err) {
                    if (callback) {
                        callback(ret, err);
                    }
                });
            }
        };

        this.browse2 = function(url, callback) {
            if (url && thiz.browser) {
                var omhh = 24;
                thiz.browser.openView({
                    url: url,
                    rect: {
                        x: 0,
                        y: omhh,
                        w: thiz.W,
                        h: thiz.H - omhh
                    }
                }, function(ret, err) {
                    if (callback) {
                        callback(ret, err);
                    }
                });
            }
        };

        // 检查登录
        this.isLogin = function() {
            var accountStr = api.getPrefs({
                sync: true,
                key: "account"
            });
            console.log("检查是否登录查看" + accountStr);
            if (!accountStr) {
                return false;
            }

            var account = JSON.parse(accountStr);
            if (account.token) {
                return true;
            } else {
                return false;
            }
        };

        // 跳转到登录页
        this.goLogin = function() {
            this.tout(200, function() {
                api.openWin({
                    name: "login",
                    url: api.wgtRootDir + "/html/login/login.html",
                    allowEdit: true
                });
            });
            this.setStorage("curWin", "login");
        };

        // 设置偏好设置
        this.setStorage = function(key, value) {
            var val = value;
            if (key) {
                if (val instanceof Object || val instanceof Array) {
                    val = JSON.stringify(val);
                }
                api.setPrefs({
                    key: key,
                    value: val
                });
            }
        };

        // 判断是否是第一次启动app
        this.isFirst = function() {
            var isfirst = true;
            var val = this.getSyncStorage("isfirst");
            this.log("isfirst", val);
            if (val) {
                isfirst = false;
            }
            return isfirst;
        };

        // 同步读取偏好设置
        this.getSyncStorage = function(key) {
            if (key) {
                var value = api.getPrefs({
                    sync: true,
                    key: key
                });
                return value;
            } else {
                return null;
            }
        };

        // 异步读取偏好设置
        this.getAsyncStorage = function(key, callback) {
            if (key) {
                api.getPrefs({
                    key: key
                }, function(ret, err) {
                    if (callback) {
                        callback(ret.value);
                    }
                });
            } else {
                if (callback) {
                    callback(null);
                }
            }
        };

        // 删除偏好设置
        this.rmStorage = function(key) {
            if (key) {
                api.removePrefs({
                    key: key
                });
            }
        };

        // 保存账号
        this.setAccount = function(account) {
            this.setStorage("account", account);
        };
        // 获取账号
        this.getAccount = function() {
            var accountStr = this.getSyncStorage("account");
            var account = null;
            try {
                account = JSON.parse(accountStr);
            } catch (e) {
                this.log("app", "获取账号失败！");
            }
            return account;
        };

        // 删除账号
        this.delAccount = function() {
            this.rmStorage("account");
        };

        this.setShowmoney = function(moneyStatus) {
            this.setStorage("dataStaus", moneyStatus);
        };
        this.getShowmoney = function() {
            return this.getSyncStorage("dataStaus");
        };
        this.getAutoTest = function() {
            return this.getSyncStorage("calculate");
        };
        this.openAgreement = function(data) {
            this.setStorage("agreeAgreement", data);
        };
        this.getopenAgreement = function() {
            return this.getSyncStorage("agreeAgreement");
        };
        // 下拉刷新
        this.downRefresh = function(callback, conf) {
            var opts = {
                visible: true,
                bgColor: "#F6F6F6",
                textColor: "#959595",
                textDown: "下拉刷新...",
                textUp: "松开刷新...",
                textLoading: "刷新中...",
                showTime: false
            };
            // if (conf instanceof Object) {
            //     $.extend(opts, conf);
            //     this.log("downRefresh_opts", opts);
            // }
            // 设置下拉刷新
            api.setRefreshHeaderInfo(opts, function(ret, err) {
                if (callback) {
                    callback();
                }
            });
        };

        // toggle class
        this.togClass = function(clickEle, claz, targetEle, callback) {
            if (clickEle && claz) {
                if ($) {
                    $(clickEle).click(function() {
                        var ftarget = clickEle;
                        if (targetEle) {
                            ftarget = clickEle + " " + targetEle;
                            $(ftarget).removeClass(claz);
                            $(this)
                                .find(targetEle)
                                .addClass(claz);
                        } else {
                            $(ftarget).removeClass(claz);
                            $(this).addClass(claz);
                        }

                        if (callback) {
                            callback();
                        }
                    });
                } else {
                    thiz.log("togClass", "依赖jquery");
                }
            }
        };

        // 结束下拉
        this.stopRefresh = function() {
            api.refreshHeaderLoadDone();
        };

        // 没有数据显示
        this.noData = function(container, msg) {
            var template =
                "<div style='width:100%;height:100%;' class='nodata center'>" +
                "<label style='font-size:16px;color:#999999'>" +
                msg +
                "</label>" +
                "</div>";
            container.find(".nodata").remove();
            $(template).appendTo(container);
        };

        // 转菊花
        this.flower = function(param) {
            thiz.toFront("flower");
            api.openFrame({
                name: "flower",
                url: thiz.hd + "tools/flower.html",
                pageParam: param,
                bgColor: ""
            });
            this.flower.close = function() {
                api.closeFrame({
                    name: "flower"
                });
            };
        };

        // 提示
        this.toast = function(msg) {
            api.toast({
                msg: msg,
                location: "middle",
                duration: 4000,
                global: true
            });
        };

        // 提示（延时）
        this.toastDefi = function(msg, time) {
            var minTime = 2000;
            if (minTime <= time) {
                minTime = time;
            }
            api.toast({
                msg: msg,
                location: "middle",
                duration: minTime,
                global: true
            });
        };

        // 获取文件名
        this.getFileName = function(filePath) {
            var result = null;
            if (filePath) {
                var pathArr = filePath.split("/");
                result = pathArr[pathArr.length - 1];
            }
            return result;
        };

        // 拍照
        this.shootPic = function(callback) {
            api.getPicture({
                    sourceType: "camera",
                    mediaValue: "pic",
                    encodingType: "jpg",
                    destinationType: "url",
                    allowEdit: false,
                    quality: 100,
                    saveToPhotoAlbum: false
                },
                callback);
        };

        // 相册选择
        this.getPic = function(callback) {
            api.getPicture({
                    sourceType: "library",
                    mediaValue: "pic",
                    encodingType: "jpg",
                    destinationType: "url",
                    allowEdit: false,
                    quality: 100,
                    saveToPhotoAlbum: false
                },
                callback);
        };

        // 封装actionSheet
        this.sheet = function(config, callback) {
            api.actionSheet(config, function(ret, err) {
                callback(ret, err);
            });
        };

        // 打开图片处理界面
        this.openImgHandle = function(param) {
            this.openWin({
                name: "imagehandle",
                url: this.hd + "common/imagehandle.html",
                pageParam: param
            });
        };

        // 初始化裁剪模块
        this.initClipper = function(param, callback) {
            if (this.clipper && param && param.srcPath) {
                this.clipper.open(param, function(ret, err) {
                    if (err) {
                        thiz.log("initClipper", "初始化clipper失败");
                        callback(null, err);
                        return;
                    }
                    if (ret) {
                        thiz.log("initClipper", ret);
                        callback(ret, null);
                    }
                });
            }
        };
        this.mdCopy = function(text, call, showState) {
            if (text) {
                if (!thiz.mdCopy.module) {
                    thiz.mdCopy.module = api.require("clipBoard");
                }
                var cb = this.mdCopy.module;
                cb.set({
                    value: String(text)
                }, function(r, e) {
                    if (r.status) {
                        showState && thiz.toast("复制成功！");
                        typeof call === "function" && call(true, "复制成功");
                    } else {
                        showState && thiz.toast("复制失败！");
                        typeof call === "function" && call(false, "复制失败");
                    }
                });
            }
        };
        // 图片压缩
        this.compImg = function(param, callback) {
            if (this.filter && param && param.img) {
                this.filter.compress(param, function(ret, err) {
                    if (err) {
                        thiz.log("compImg_err", err);
                        if (callback) {
                            callback(null, err);
                        }
                    }
                    if (ret) {
                        thiz.log("compImg", ret);
                        if (callback) {
                            callback(ret, null);
                        }
                    }
                });
            }
        };

        // 图片裁剪函数
        this.cutImg = function(param, callback) {
            if (this.clipper && param.destPath) {
                thiz.log("param++++++++++++++++++++++++++++", param)
                this.clipper.save(param, function(ret, err) {
                    if (err) {
                        thiz.log("cutImg_err", err);
                        if (callback) {
                            callback(null, err);
                        }
                        return;
                    }
                    if (ret) {
                        thiz.log("cutImg", ret);
                        if (callback) {
                            callback(ret, null);
                        }
                    }
                });
            }
        };

        // 执行动画
        this.animate = function(param, callback) {
            if (param) {
                api.animation(param, callback);
            }
        };

        // 保存图片到系统相册
        this.savePic = function(url) {
            this.log("savePic", url);
            api.saveMediaToAlbum({
                path: url,
                groupName: "renrenmine"
            }, function(ret, err) {
                thiz.log("保存至相册", ret);
                if (ret && ret.status) {
                    thiz.toast("保存成功！");
                } else {
                    thiz.toast("保存失败！");
                }
            });
        };

        // 拨打电话号码
        this.call = function(phone) {
            if (phone) {
                api.call({
                    type: "tel_prompt",
                    number: phone
                });
            } else {
                this.toast("电话号码为空！");
            }
        };

        // 触发事件
        this.trigger = function(event, data) {
            if (event) {
                api.sendEvent({
                    name: event,
                    extra: data
                });
            }
        };

        // 监听事件
        this.listen = function(event, callback) {
            if (event && typeof event == "string") {
                api.addEventListener({
                    name: event
                }, callback);
            }

            if (event instanceof Array) {
                for (var i = 0; i < event.length; i++) {
                    var e = event[i];
                    api.addEventListener({
                            name: e
                        },
                        callback);
                }
            }
        };

        // 监听页面滚动到底部
        this.toBottom = function(callback) {
            api.addEventListener({
                name: "scrolltobottom",
                extra: {
                    threshold: 20 //设置距离底部多少距离时触发，默认值为0，数字类型
                }
            }, function(ret, err) {
                callback(ret, err);
            });
        };

        // Android监听返回事件（目前只有android有效）
        this.back = function(callback) {
            api.addEventListener({
                name: "keyback"
            }, function(ret, err) {
                thiz.log("back", "监听到android返回键事件" + JSON.stringify(ret) + JSON.stringify(err));
                if (callback) {
                    callback(ret, err);
                }
            });
        };

        // android和ios监听app退到后台
        this.pause = function(callback) {
            api.addEventListener({
                name: "pause"
            }, function(ret, err) {
                thiz.log("pause", ret);
                callback(ret, err);
            });
        };

        // android和ios监听app进入前台
        this.resume = function(callback) {
            api.addEventListener({
                name: "resume"
            }, function(ret, err) {
                //thiz.trigger("reset_tabs");
                //thiz.log("resume", ret);
                callback(ret, err);
            });
        };

        // 视图消失事件（对单一win）
        this.disappear = function(callback) {
            api.addEventListener({
                name: "viewdisappear"
            }, function(ret, err) {
                thiz.log("disappear", thiz.winName);
                callback(ret, err);
            });
        };

        // 视图显示事件（对单一win）
        this.appear = function(callback) {
            api.addEventListener({
                name: "viewappear"
            }, function(ret, err) {
                callback(ret, err);
            });
        };

        // 定时任务
        this.tout = function(milli, callback) {
            if (milli) {
                setTimeout(callback, milli);
            }
        };

        // 心跳任务
        this.theart = function(milli, callback) {
            if (milli) {
                var index = setInterval(callback, milli);
                this.theart.stop = function() {
                    window.clearInterval(index);
                };
            }
        };

        // 获取日期（返回格式：yy-mm-dd hh:mm:ss）
        this.getDate = function(stamp, ismili) {
            var date = new Date();
            if (stamp) {
                if (ismili) {
                    date = new Date(stamp);
                } else {
                    date = new Date(stamp * 1000);
                }
            }
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var day = date.getDate();
            if (day < 10) {
                day = "0" + day;
            }
            var hour = date.getHours();
            if (hour < 10) {
                hour = "0" + hour;
            }
            var minute = date.getMinutes();
            if (minute < 10) {
                minute = "0" + minute;
            }
            var second = date.getSeconds();
            if (second < 10) {
                second = "0" + second;
            }

            var final =
                year +
                "-" +
                month +
                "-" +
                day +
                " " +
                hour +
                ":" +
                minute +
                ":" +
                second;
            return final;
        };

        // 获取当前日期的时间戳（单位是s）
        this.getCurStamp = function() {
            var mili = new Date().getTime();
            return mili / 1000;
        };

        // 转换yyyy-mm-dd hh:mm:ss格式为秒
        this.toSecond = function(date) {
            var first = date.split(" ")[0];
            var second = date.split(" ")[1];
            var splits1 = first.split("-");
            var splits2 = second.split(":");
            var result = new Date(
                parseInt(splits1[0]),
                parseInt(splits1[1]) - 1,
                parseInt(splits1[2]),
                parseInt(splits2[0]),
                parseInt(splits2[1]),
                parseInt(splits2[2])).getTime();
            return result / 1000;
        };
        // 统一处理点击跳转页面
        this.handlePage = function() {
            var account = thiz.getAccount();
            this.log("handlePage", "调用了handlePage");
            // if( $ && $.fn ){
            //     $.fn.extend({
            //         data:function ( key ,value ) {
            //             if( key && !value ){
            //                 return $(this).attr( 'data-' + key );
            //             }
            //             if( key && value ){
            //                 $(this).attr( 'data-' + key , value );
            //                 return true;
            //             }
            //         }
            //     });
            // }
            $(".go-page").unbind("click");
            $(".go-page").click(function() {
                // 判断是否终止跳转
                if ($(this).data("defeat")) {
                    var msg = thiz.parse($(this).data("defeat")).msg;
                    thiz.toast(msg);
                    return;
                }

                var p = thiz.parse($(this).data("param"));
                // thiz.log("获取传入阐述+++++++++++++");
                var sp = p.param;
                if (p.name) {
                    if (sp) {
                        sp.winName = p.name;
                    }
                } else {
                    if (sp) {
                        sp.winName == "";
                    }
                }
                if (sp && sp.name) {
                    sp.frameName = sp.name;
                }
                if (sp && !sp.name) {
                    sp.frameName = "";
                }
                // 是否要判断账号里的字段
                if (p.checkAccount) {
                    var ispass = true;
                    for (var key in p.checkAccount) {
                        if (p.checkAccount[key] != account[key]) {
                            ispass = false;
                        }
                    }
                    if (!ispass) {
                        sp = p.param2;
                    }
                }
                var conf = {
                    name: p.name,
                    url: thiz.hd + p.page + ".html",
                    pageParam: sp
                };

                // 判断是否允许编辑
                if (p.allowEdit && p.allowEdit == "true") {
                    conf.allowEdit = true;
                }

                // 判断是否可以滑动返回（iOS有效）
                if (p.slideBack && p.slideBack == "false") {
                    conf.slidBackEnabled = false;
                }
                thiz.log("config参数参数+++++++++++", conf);
                if (p.needLogin && !thiz.isLogin()) {
                    thiz.goLogin();
                    return;
                } else {
                    thiz.openWin(conf);
                }
            });
        };
        this.goPushPage = function(recoinNumber) {
            // 判断是否终止跳转
            var p = thiz.parse(recoinNumber);
            // thiz.log("获取传入阐述+++++++++++++");
            var sp = p.param;
            if (p.name) {
                if (sp) {
                    sp.winName = p.name;
                }
            } else {
                if (sp) {
                    sp.winName == "";
                }
            }
            if (sp && sp.name) {
                sp.frameName = sp.name;
            }
            if (sp && !sp.name) {
                sp.frameName = "";
            }
            // 是否要判断账号里的字段
            if (p.checkAccount) {
                var ispass = true;
                for (var key in p.checkAccount) {
                    if (p.checkAccount[key] != account[key]) {
                        ispass = false;
                    }
                }
                if (!ispass) {
                    sp = p.param2;
                }
            }
            var conf = {
                name: p.name,
                url: thiz.hd + p.page + ".html",
                pageParam: sp
            };

            // 判断是否允许编辑
            if (p.allowEdit && p.allowEdit == "true") {
                conf.allowEdit = true;
            }

            // 判断是否可以滑动返回（iOS有效）
            if (p.slideBack && p.slideBack == "false") {
                conf.slidBackEnabled = false;
            }
            thiz.log("config参数参数+++++++++++", conf);
            if (p.needLogin && !thiz.isLogin()) {
                thiz.goLogin();
                return;
            } else {
                thiz.openWin(conf);
            }
        };

        // 关闭菊花
        this.closeFlower = function(time) {
            // 延时关闭
            setTimeout(function() {
                    api.closeFrame({
                        name: "flower"
                    });
                },
                time ? time : 1000);
        };

        // es6语法的ajax请求
        this.request = function(conf) {
            // 请求状态码
            var needLogin = -100;
            var ok = 1;
            var fail = 0;
            var accountErr = -1;

            // 列表状态文本
            var NODATA = "暂时没有相关数据";
            var NOMORE = "没有更多数据了";
            var LOADMORE = "上拉加载更多";
            var LOADING = "加载中...";
            var NETERR = "加载中...";

            // 判断是否需要转菊花
            if (conf.extra && conf.extra.isflower && conf.extra.isflower === true) {
                var msg = conf.extra.msg ? conf.extra.msg : "";
                this.flower({
                    msg: msg
                });
            }

            var reqPromise = new Promise(function(resolve, reject) {
                api.ajax(conf.param, function(ret, err) {
                    // 关闭转菊花
                    thiz.closeFlower();
                    // 执行回调
                    if (ret) {
                        resolve(ret);
                    } else {
                        reject(err);
                    }
                });
            });

            // 处理返回数据
            reqPromise.then(function(ret) {
                // 判断是否需要登录
                if (ret.code == needLogin) {
                    thiz.log("needLogin12", needLogin);
                    // 如果在下拉刷新，停止
                    thiz.stopRefresh();
                    // 跳转到登录界面
                    thiz.goLogin();
                }

                if (conf.param.callback) {
                    conf.param.callback(ret);

                    // 为页面跳转添加点击(最好是在模板渲染完后)
                    thiz.handlePage();
                }
            }, function(err) {
                thiz.toast("网络连接失败！");
                thiz.log("--------err--------", err);
            });

            // 返回promise，可以链式操作
            return reqPromise;
        };

        //异步ajax
        this.asynchronousAjax = function(url, parameter, callback) {
            function getData(url, parameter) {
                return new Promise(function(resolve, reject) {
                    api.ajax({
                        url: thiz.config.url + url,
                        method: 'post',
                        data: {
                            values: parameter
                        }
                    }, function(ret, err) {
                        thiz.log("异步接口请求返回---------------" + thiz.config.url + url + "  " + JSON.stringify(ret));
                        if (ret) {
                            resolve(ret);
                        } else {
                            var errArr = ["连接错误", "网络超时", "授权错误", "数据类型错误", "不安全的数据"];
                            thiz.log(errArr[err.code]);
                            reject(ret);
                        }
                    });
                })
            }
            getData(url, parameter).then(function(ret) {
                callback(ret);
            }).catch(function(ret) {
                callback(ret);
            })
        }

        // 公用ajax，主要是统一解决用户未登录，跳转登录页（主要用于非文件请求）
        this.ajax = function(conf) {
            // 请求状态码
            var needLogin = -100;
            var ok = 1;
            var fail = 0;
            var accountErr = -1;
            thiz.log("查看请求数据", JSON.stringify(conf))
            // 列表状态文本
            var NODATA = "暂时没有相关数据";
            var NOMORE = "没有更多数据了";
            var LOADMORE = "上拉加载更多";
            var LOADING = "加载中...";
            var NETERR = "加载中...";
            var errArr = ["连接错误", "网络超时", "授权错误", "数据类型错误", "不安全的数据"];
            if (conf && conf instanceof Object) {
                // 如果是列表加载，并且列表正处于加载状态，退出
                if (conf.extra && conf.extra.container && thiz.listAjaxing) {
                    return;
                }

                // 如果是普通加载
                if (!conf.extra || !conf.extra.container) {
                    thiz.listAjaxing = false;
                }
                // 如果是列表加载，并且列表没有处于加载状态，执行加载
                if (conf.extra && conf.extra.container && !thiz.listAjaxing) {
                    thiz.listAjaxing = true;
                    // 判断通过，显示正在加载中...
                    $("#listState").text(LOADING);
                }
                // 开始转菊花
                if (conf.extra && conf.extra.isflower) {
                    if (conf.extra.flowerParam) {
                        thiz.flower(conf.extra.flowerParam);
                    } else {
                        thiz.flower();
                    }
                }
                if (thiz.connectionType == "none") {
                    thiz.toast("请打开网络链接");
                    thiz.closeFlower();
                    return
                }
                var ajaxParam = conf.param;
                var ajaxId = 'id' + Math.ceil(Math.random() * 10) * 10; //ajaxId;
                ajaxParam.tag = ajaxId;
                conf.param.timeout = 15;
                api.ajax(conf.param, function(ret, err) {
                    // 不管是普通还是列表加载，加载完成后，都重置listAjaxing为false
                    thiz.listAjaxing = false;
                    // 关闭菊花
                    if (conf.extra && conf.extra.isflower) {
                        if (thiz.flower.close) {
                            if (conf.extra.delay) {
                                thiz.tout(conf.extra.delay, function() {
                                    thiz.flower.close();
                                });
                            } else {
                                thiz.flower.close();
                            }
                        }
                        if (conf.extra.flowerParam && conf.extra.flowerParam.delay) {
                            thiz.tout(conf.extra.flowerParam.delay + 800, function() {
                                thiz.flower.close();
                            });
                        }
                    }
                    if (ret) {
                        // 只有后端报错才提示错误
                        if (ret.code == 1) {
                            thiz.log(conf.param.url, JSON.stringify(ret));
                        } else {
                            thiz.log("conf.extra", conf.extra);
                            if (conf.extra && conf.extra.istoast != undefined && !conf.istoast) {

                            } else {
                                if (ret.code == -1 && ret.desc != "success") {
                                    if (conf.param.closeTips != true) {
                                        thiz.toast(ret.desc);
                                    }
                                }
                            }
                        }

                        if (ret.code == needLogin) {
                            thiz.log("needLogin13", needLogin);
                            // 如果在下拉刷新，停止
                            thiz.stopRefresh();
                            thiz.closeF("rhead");
                            var matrixLock = api.require("matrixLock");
                            thiz.setStorage("openHandPassword", "false");
                            matrixLock.clearGesture();
                            // 跳转到登录界面
                            thiz.goLogin();
                            thiz.trigger("quit_login");
                            thiz.delAccount();
                            return;
                        } else {
                            // 判断是否是列表请求
                            if (ret.current_page && ret.total_page) {
                                // 判断是否还有下一页
                                if (
                                    parseInt("" + ret.current_page) == parseInt("" + ret.total_page)) {
                                    // 显示没有更多数据了
                                    if (conf.extra && conf.extra.container) {
                                        $("#listState").text(NOMORE);
                                    }
                                } else {
                                    // 显示上拉加载下一页
                                    if (conf.extra && conf.extra.container) {
                                        $("#listState").text(LOADMORE);
                                    }
                                }
                            }

                            // 先调回调，比如渲染模板之类的......
                            if (conf.param.callback) {
                                conf.param.callback(ret, err);
                            }

                            // 为页面跳转添加点击
                            thiz.handlePage();
                        }
                    } else {
                        thiz.stopRefresh();
                        if (conf.extra && conf.extra.container) {
                            $("#listState").text(NETERR);
                        }
                        thiz.toast("网络链接失败!");
                        api.closeFrame({
                            name: "flower"
                        });
                        if (conf.param.failed) {
                            conf.param.failed();
                        }
                    }
                    if (err) {
                        thiz.stopRefresh();
                        if (conf.extra && conf.extra.container) {
                            $("#listState").text(NETERR);
                        }
                        thiz.log("ajax错误" + errArr[err.code]);
                        thiz.toast("网络链接失败!");
                        api.cancelAjax({
                            tag: ajaxId
                        });
                        thiz.log("网络链接失败++++" + conf.param.url, err);
                        thiz.closeFlower();
                        if (conf.param.failed) {
                            conf.param.failed();
                        }
                    }
                });
            }
        };

        //新封装ajax
        this.ajaxNew = function(url, parameter, openFlower, callback) {
            thiz.log("请求参数==========", "url:" + thiz.config.url + url + "----------parameter:" + JSON.stringify(parameter) + "-------openFlower:" + openFlower);
            var errArr = ["连接错误", "网络超时", "授权错误", "数据类型错误", "不安全的数据"];
            if (openFlower && openFlower) {
                thiz.flower();
            }
            api.ajax({
                url: thiz.config.url + url,
                method: 'post',
                timeout: 30,
                data: {
                    values: parameter
                },
            }, function(ret, err) {
                thiz.stopRefresh();
                if (openFlower && openFlower) {
                    thiz.closeFlower();
                }
                thiz.log("接口请求返回---------------", thiz.config.url + url + JSON.stringify(ret));
                if (ret) {
                    if (ret.code == 1) {
                        callback(ret)
                    } else {
                        callback(ret)
                    }
                } else {
                    thiz.log("ajax错误" + errArr[err.code]);
                }
            })
        };

        // 文件上传接口（支持多文件）
        this.upload = function(conf) {
            // 请求状态码
            var needLogin = -100;
            var ok = 1;
            var fail = 0;
            var accountErr = -1;
            var errArr = ["连接错误", "网络超时", "授权错误", "数据类型错误", "不安全的数据"];
            if (conf && conf instanceof Object) {
                // 开始转菊花
                if (conf.extra.isflower) {
                    if (conf.extra.flowerParam) {
                        if (conf.extra.flowerParam.delay) {
                            thiz.tout(conf.extra.flowerParam.delay, function() {
                                thiz.flower(conf.extra.flowerParam);
                            });
                        }
                    } else {
                        thiz.flower();
                    }
                }
                conf.param.timeout = 15;
                api.ajax(conf.param, function(ret, err) {
                    thiz.log("--------------返回------------------", JSON.stringify(conf.param))
                    // 关闭菊花
                    if (conf.extra && conf.extra.isflower) {
                        if (thiz.flower.close) {
                            thiz.flower.close();
                        }
                        if (conf.extra.flowerParam && conf.extra.flowerParam.delay) {
                            thiz.tout(conf.extra.flowerParam.delay + 800, function() {
                                thiz.flower.close();
                            });
                        }
                    }
                    if (ret) {
                        thiz.log("upload", ret);
                        if (ret.desc) {
                            thiz.toast(ret.desc);
                        }
                        if (ret.code == needLogin) {
                            // 跳转到登录界面
                            thiz.goLogin();
                            return;
                        }
                        if (conf.param.callback) {
                            conf.param.callback(ret, err);
                        }
                    } else {

                        thiz.log(errArr[err.code]);
                        api.closeFrame({
                            name: "flower"
                        });
                    }
                });
            }
        };

        // 下载文件
        this.download = function(url, callback) {
            if (url) {
                var arr = url.split("/");
                var fileName = arr[arr.length - 1];
                api.download({
                    url: url,
                    savePath: "fs://renDown/" + fileName,
                    report: true,
                    cache: true,
                    allowResume: true
                }, function(ret, err) {
                    if (ret.state != 1) {
                        if (ret.state == 2) {
                            thiz.log("download", "下载文件失败：" + url);
                        } else {
                            thiz.log("download", "文件下载中");
                        }
                    }
                    if (callback) {
                        callback(ret, err);
                    }
                });
            }
        };

        this.download2 = function(url, name, callback) {
            if (url) {
                var arr = url.split("/");
                var fileName = arr[arr.length - 1];
                var fileFix = fileName.split(".")[1];
                if (name) {
                    fileName = name;
                }
                api.download({
                    url: url,
                    savePath: "fs://renDown/" + fileName + ".jpg",
                    report: true,
                    cache: true,
                    allowResume: true
                }, function(ret, err) {
                    if (ret.state != 1) {
                        if (ret.state == 2) {
                            thiz.log("download", "下载文件失败：" + url);
                        } else {
                            thiz.log("download", "文件下载中");
                        }
                    }
                    if (callback) {
                        callback(ret, err);
                    }
                });
            }
        };

        // 获取服务器上app的最新版本，用于强制升级（只对android有效）
        this.checkAppVer = function(callback) {
            var values = {};
            var account = thiz.getAccount();
            if (account) {
                values.uid = account.uid;
                values.token = account.token;
            }
            values.system = thiz.ST;
            values.deviceModel = thiz.deviceModel
            values.app_code = thiz.FG + "_" + thiz.ST;
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "site/appOpen",
                    data: {
                        values: values
                    },
                    callback: function(ret, err) {
                        thiz.log("checkAppVer", "返回：" + JSON.stringify(ret));
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: false
                }
            });
        };

        // 快捷动态获取用户账户信息（可能不是当前用户信息）
        this.userInfo = function(callback2, otherUid) {
            var account = this.getAccount();
            if (account && account.token) {
                this.ajax({
                    param: {
                        method: "post",
                        url: thiz.config.url + "member/getinfo",
                        data: {
                            values: {
                                uid: account.uid,
                                token: account.token,
                                search_uid: otherUid
                            }
                        },
                        callback: function(ret, err) {
                            thiz.log("userInfo", "getinfo返回：" + JSON.stringify(ret));
                            callback2(ret, err);
                        }
                    },
                    extra: {
                        isflower: false
                    }
                });
            }
        };

        // 验证码统一获取接口
        this.getCode = function(callback) {
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "smscaptcha/get",
                    data: {
                        values: {
                            mobile: thiz.getAccount().mobile,
                            area_code: thiz.getAccount().area_code
                        }
                    },
                    callback: function(ret, err) {
                        thiz.log("getCode", "获取验证码：" + JSON.stringify(ret));
                        thiz.toast("验证码获取成功！");
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: true
                }
            });
        };

        // 获取实名认证检验状态接口
        this.checkStaus = function(callback) {
            var account = this.getAccount();
            if (!account) return
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "member/getSumitRealnameVerifyStatus",
                    data: {
                        values: {
                            uid: account.uid,
                            token: account.token
                        }
                    },
                    callback: function(ret, err) {
                        thiz.log("checkStaus", "获取实名认证检验状态接口:" + JSON.stringify(ret));
                        thiz.stopRefresh();
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: true,
                    delay: 300
                }
            });
        };
        // 获取资产通用接口
        this.getProperties = function(callback) {
            var account = this.getAccount();
            if (!account) return
            this.log("getProperties_param", {
                uid: account.uid,
                token: account.token
            });
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "wallet/detail",
                    data: {
                        values: {
                            uid: account.uid,
                            token: account.token
                        }
                    },
                    callback: function(ret, err) {
                        thiz.log("getProperties", "获取资产返回：" + JSON.stringify(ret));
                        thiz.stopRefresh();
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: true,
                    delay: 300
                }
            });
        };

        // 获取市场币种行情的接口
        this.getCoinMarket = function(callback) {
            var account = thiz.getAccount();
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "finance/home",
                    data: {
                        values: {
                            uid: account.uid,
                            token: account.token
                        }
                    },
                    callback: function(ret, err) {
                        thiz.log("getCoinMarket", "返回：" + JSON.stringify(ret));
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: true
                }
            });
        };

        // 获取平台币种行情
        this.getCoinPlatform = function(callback) {
            var account = this.getAccount();
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "trade/platformCoinQuotes",
                    data: {
                        values: {
                            uid: account.uid,
                            token: account.token
                        }
                    },
                    callback: function(ret, err) {
                        thiz.log("getCoinPlatform", "返回：" + JSON.stringify(ret));
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: true
                }
            });
        };

        // 获取平台交易行情
        this.getTradePlatform = function(callback) {
            var account = this.getAccount();
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "trade/platformTradeCurrentInfo",
                    data: {
                        values: {
                            uid: account.uid,
                            token: account.token
                        }
                    },
                    callback: function(ret, err) {
                        thiz.log("getTradePlatform", "返回：" + JSON.stringify(ret));
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: true
                }
            });
        };

        // 获取区域码
        this.getAreaCode = function(callback) {
            this.ajax({
                param: {
                    method: "post",
                    url: thiz.config.url + "site/getAllowCountry",
                    data: {
                        values: ""
                    },
                    callback: function(ret, err) {
                        thiz.log("getAreaCode", "返回：" + JSON.stringify(ret));
                        callback(ret, err);
                    }
                },
                extra: {
                    isflower: true
                }
            });
        };
        // 启动app调用
        this.start = function() {
            var account = this.getAccount();
            if (account && account.uid) {
                this.ajax({
                    param: {
                        method: "post",
                        url: thiz.config.url + "site/appOpen",
                        data: {
                            values: {
                                uid: account.uid,
                                token: account.token,
                            }
                        },
                        callback: function(ret, err) {
                            thiz.log("start", "app启动返回：" + JSON.stringify(ret));
                        }
                    },
                    extra: {
                        isflower: false
                    }
                });
            }
        };

        // 支付（type=WX/ALI）
        this.pay = function(type, p, callback) {
            var opts = {};
            if (type == "WX") {
                thiz.log("支付方式++++++++++++++++++++", type);
                if (thiz.wx) {
                    opts = {
                        // secret:"7152afc2cfeb1690c68590f16f15f5b2",
                        // key:p["wxResponse"]["key"],

                        //secret: "5def730a1f86f7b1be7f7c80a1caeb34",
                        apikey: "wxdcfae64fc4c200b1",
                        orderId: p["wxResponse"]["prepayId"],
                        //partnerId: p["wxResponse"]["partnerId"],
                        mchId: p["wxResponse"]["partnerId"],
                        nonceStr: p["wxResponse"]["nonceStr"],
                        timeStamp: p["wxResponse"]["timestamp"],
                        package: p["wxResponse"]["packageValue"],
                        sign: p["wxResponse"]["sign"]
                    };

                    // alert("配置："+JSON.stringify(opts));
                    thiz.wxPay.payOrder(opts, function(ret, err) {
                        thiz.log('支付调用+++++++++++++++++++++++')
                        if (ret.status) {
                            thiz.toast("支付成功！");
                        } else {
                            thiz.toast("支付失败！");
                        }
                        if (callback) {
                            callback(ret, err);
                        }
                    });
                }
            } else if (type == "ALI") {
                thiz.log("ali", p);
                if (thiz.ali) {
                    opts = {
                        orderInfo: p["aliResponse"]["payParams"]
                    };

                    thiz.ali.payOrder(opts, function(ret, err) {
                        thiz.log("支付宝支付报错", err);
                        if (ret.code == "9000") {
                            thiz.toast("支付成功！");
                        } else {
                            thiz.toast("支付失败！");
                        }

                        if (callback) {
                            callback(ret, err);
                        }
                    });
                }
            }
        };
        // 可复用的定时
        this.THEART = function(milli) {
            this.index = null;
            this.start = function(callback, callback2) {
                var index2 = window.setInterval(callback, milli);
                if (!this.hasInited) {
                    this.index = index2;
                    this.hasInited = true;
                    callback2(index2);
                }
            };
            this.stop = function(callback) {
                window.clearInterval(this.index);
            };
        };

        // 可复用的延时
        this.TOUT = function(milli) {
            this.start = function(callback) {
                var index2 = window.setTimeout(callback, milli);
                this.index = index2;
                this.hasCreated = false;
                if (callback && !this.hasCreated) {
                    callback(index2);
                    this.hasCreated = true;
                }
            };
            this.stop = function(callback) {
                window.clearTimeout(this.index);
            };
        };

        // 可复用的倒计时
        this.COUNTDOWN = function(sec) {
            var time = sec;
            this.start = function(callback, callback2) {
                if (time > 0) {
                    var index = window.setInterval(function() {
                        time--;
                        if (callback) {
                            callback(time);
                        }
                        if (time == 0) {
                            window.clearInterval(index);
                        }
                    }, 1000);
                    this.index = index;
                    if (!this.created) {
                        this.created = true;
                        callback2(index);
                    }
                }
            };
        };
        // 打开消息发送工具
        this.openChat = function(callback) {
            if (this.chatbox) {
                this.chatbox.open({
                    placeholder: "输入新消息",
                    maxRows: 4,
                    autoFocus: false,
                    emotionPath: "widget://res/chatbox/emotion",
                    styles: {
                        inputBar: {
                            borderColor: "#ececec",
                            bgColor: "#fbfbfb"
                        },
                        inputBox: {
                            borderColor: "#B3B3B3",
                            bgColor: "#FFFFFF"
                        },
                        emotionBtn: {
                            normalImg: "widget://res/chatbox/face_one.png"
                        },
                        extrasBtn: {
                            normalImg: "widget://res/chatbox/add_one.png"
                        },
                        keyboardBtn: {
                            normalImg: "widget://res/chatbox/key_one.png"
                        },
                        recordBtn: {
                            normalBg: "#ffffff",
                            activeBg: "#F4F4F4",
                            color: "#5D5D5D",
                            size: 14
                        },
                        indicator: {
                            target: "both",
                            color: "#c4c4c4",
                            activeColor: "#9e9e9e"
                        },
                        sendBtn: {
                            titleColor: "#ffffff",
                            bg: "#12b7f5",
                            activeBg: "#1ba1d4",
                            titleSize: 14
                        }
                    },
                    extras: {
                        titleSize: 13,
                        titleColor: "#a3a3a3",
                        btns: [{
                                title: "相册图片",
                                normalImg: "widget://res/chatbox/img_one.png",
                                activeImg: "widget://res/chatbox/img_two.png"
                            },
                            {
                                title: "相机拍照",
                                normalImg: "widget://res/chatbox/cam_one.png",
                                activeImg: "widget://res/chatbox/cam_two.png"
                            }
                        ]
                    }
                }, function(ret, err) {
                    thiz.log("openChat", ret);
                    callback(ret, err);
                    if (ret) {
                        var iosMoveCount = 0;
                        var timeOutId = null;
                        var moveRet = null;
                        var moveErr = null;
                        // 监听输入框所在区域弹动事件
                        thiz.chatbox.addEventListener({
                            target: "inputBar",
                            name: "move"
                        }, function(ret, err) {
                            thiz.log("inputBar_move", ret);
                            moveRet = ret;
                            moveErr = err;
                            // 处理iOS会在短时间内触发很多次的问题
                            iosMoveCount++;
                            if (thiz.ST == "ios") {
                                if (!timeOutId) {
                                    timeOutId = setTimeout(function() {
                                        thiz.log("openChat", "计时回调！");
                                        if (iosMoveCount >= 3) {
                                            thiz.log("openChat", "计时回调 >=3");
                                            callback(moveRet, moveErr);
                                        } else if (iosMoveCount <= 2) {
                                            thiz.log("openChat", "计时回调 <=2");
                                            callback(moveRet, moveErr);
                                        } else {}
                                        iosMoveCount = 0;
                                        window.clearTimeout(timeOutId);
                                        timeOutId = null;
                                        moveRet = null;
                                        moveErr = null;
                                    }, 100); // 100毫秒内侦测
                                }
                            }
                            if (thiz.ST == "android") {
                                callback(ret, err);
                                iosMoveCount = 0;
                            }
                        });
                        // 监听输入框所在区域高度改变
                        thiz.chatbox.addEventListener({
                            target: "inputBar",
                            name: "change"
                        }, function(ret, err) {
                            thiz.log("inputBar_change", ret);
                            callback(ret, err);
                        });
                    }
                });
            }
        };

        // 关闭消息发送pannel
        this.closePannel = function() {
            if (this.chatbox) {
                this.chatbox.closeBoard(); // 关闭表情等
                this.chatbox.closeKeyboard(); // 关闭键盘
            }
        };

        // 刷新页面
        this.reload = function() {
            window.location.reload();
        };

        // 跳转到锚点
        this.toMark = function(name) {
            if (name != null && name != undefined) {
                window.location.hash = name;
            }
        };

        // 获取协议
        this.getProtocol = function(url) {
            var result = null;
            if (url) {
                var splits = url.split(":");
                result = splits[0];
            }
            return result;
        };

        // 获取参数
        this.getWebParams = function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        };

        // 垂直轮播插件
        /**
         * conf = {
         *      ele:".v-slider",
         *      interval:2000,
         *      animateInter:500
         * }
         */
        this.VSLIDER = function(conf, callback) {
            // 公用this
            var THIS = this;
            // 容器高度
            this.itemH = $(conf.ele + " .slider-item").height();
            // relative定位的当前top值
            this.curTop;
            // 轮播项数
            this.count;
            // 当前轮播项索引，从0开始计数
            this.curIndex;

            // 定时器的id
            THIS.vindex;

            // 初始化数据
            this.init = function(count) {
                this.curTop = 0;
                this.curIndex = 0;
                this.count = $(conf.ele + " .slider-item").length;
                callback({
                    curTop: THIS.curTop,
                    curIndex: THIS.curIndex,
                    count: THIS.count
                });
            };
            // 心跳任务
            this.theart = function(milli, callback) {
                if (milli) {
                    // console.log("milli" + milli + "callback" + callback);
                    THIS.vindex = window.setInterval(callback, milli);
                    this.theart.stop = function() {
                        window.clearInterval(index);
                    };
                }
            };
            // 初始化数据
            this.init();
            // 开始定时轮播
            this.theart(conf.interval + conf.animateInter, function() {
                // thiz.log("vslider_timer","定时轮播");
                // ("定时轮播");
                THIS.curTop -= THIS.itemH;
                $(".v-slider > .slider-w").animate({
                        top: THIS.curTop + "px"
                    },
                    conf.animateInter,
                    "linear",
                    function() {
                        var pastItemCopy = $("#" + THIS.curIndex).clone(true);
                        $("#" + THIS.curIndex).remove();
                        THIS.curTop += THIS.itemH;
                        $(".slider-w")
                            .css({
                                top: THIS.curTop + "px"
                            })
                            .append(pastItemCopy);
                        THIS.curIndex++;
                        if (THIS.curIndex >= THIS.count) {
                            THIS.curIndex = 0;
                        }
                        callback({
                            curTop: THIS.curTop,
                            curIndex: THIS.curIndex,
                            count: THIS.count
                        });
                    });
            });
        };
        // 初始化
        this.init();
    };
    window.APP = APP;
})();