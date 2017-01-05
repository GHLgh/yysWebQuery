/**
 * Adapting the code from http://yys.163.com/m/fengyin/ to auto-fit the program with the size of devices
 * It is strictly adapted for personal use (better query for the game information), it will be taken down if necessary
 */ 

var isAppInside = /micromessenger/i.test(navigator.userAgent.toLowerCase()) || /yixin/i.test(navigator.userAgent.toLowerCase())
  , isIos = /iphone os/i.test(navigator.userAgent.toLowerCase()) || /ipad/i.test(navigator.userAgent.toLowerCase())
  , isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
var Common = function() {
    var e = function(e) {
        $(".alertbox").length > 0 && $(".alertbox").remove(),
        $(document.body).append('<div class="alertbox" id="alertbox"><div class="alert_text"><a href="javascript:void(0)" class="btn_close"><em></em><i></i></a>' + e + "</div></div>");
        setTimeout(function() {
            $("#alertbox").addClass("show")
        }, 50);
        $("#alertbox .btn_close").unbind().bind("click", function() {
            $("#alertbox").addClass("remove");
            setTimeout(function() {
                $("#alertbox").remove()
            }, 600)
        })
    };
    return {
        alert: e
    }
};
;var _siteConfig = {
    download: {
        ios: !0,
        android: !0
    }
};
var GlobalInit = function() {
    var n = function(n) {
        $("html").css("font-size", document.documentElement.clientHeight / document.documentElement.clientWidth < 1.5 ? document.documentElement.clientHeight / 603 * 312.5 + "%" : document.documentElement.clientWidth / 375 * 312.5 + "%"),
        $("html").css("font-size", document.documentElement.clientWidth / 375 * 312.5 + "%"),
        n && n()
    }
      , i = function() {
        var n = $("nav ul li")
          , t = parseFloat(n.eq(0).css("height").replace("px", "")) * n.length;
        $("nav").attr("data-height", t),
        $("#btn_nav").bind("click", function() {
            $(this).addClass("active"),
            $("nav").show();
            setTimeout(function() {
                $("nav ul").css("height", $("nav").attr("data-height") + "px")
            }, 50)
        }),
        $("nav").bind("click", function() {
            $("#btn_nav").removeClass("active"),
            $("nav ul").css("height", "0px");
            setTimeout(function() {
                $("nav").hide()
            }, 300)
        }),
        $("nav")[0].addEventListener("touchmove", function(n) {
            n.preventDefault()
        }, !1)
    }
      , o = function() {
        window.addEventListener("onorientationchange"in window ? "orientationchange" : "resize", function(n) {
            a(n)
        }, !1),
        $(".btn_toTop")[0].addEventListener("click", function() {
            window.scrollTo(0, 0)
        }, !1)
    }
      , a = function() {
        if (90 == window.orientation || -90 == window.orientation)
            $("#forhorview").css("display", "-webkit-box");
        else {
            {
                setTimeout(n, 300)
            }
            $("#forhorview").css("display", "none")
        }
    }
      , c = function() {
        n(function() {
            var n = isIos ? "ios" : "android";
            _siteConfig.download[n] ? $(".btn_download").addClass("show") : $(".btn_download").removeClass("show"),
            o(),
            $("#btn_nav").length > 0 && i()
        })
    };
    c()
};
