/**
 * 1. Using the code from http://yys.163.com/m/fengyin/ to analyse user input and retrieve information related to the input
 * 2. Creating a data set based on the retrieved information and computing the optimal path (?) to complete the task (graph maybe??)
 * 2.1 How to build the graph??
 *
 * keywords: TODO, DONE, NOTE
 *
 * CONVENTION: 1-index for simplicity because the data in JSON is 1-index (level info, ID, ...)
 *
 */

//DONE: add a layer of indirection between search result and input (user have to click on the target to show detail)
//TODO: implement optimal solution (simple one first)
// Thoughts: When user enter an input, the application will analyze the json by simply fetching the JSON file (implemented).
//           So the program can generate a map to the appearence of objects during the analysis
// step 1: when analyzing, parse the JSON input into a 2-dim array (1st-dim: stage, 2nd-dim: appearence point) that contains
//         the amount of the target
// step 2: pass the result to result manager
// step 3: result manager sums those results out and provides n suggestions (n: the number of user inputs), each suggestion
//         shows the optimal result that contains the according target

var globalMapManager = {
    info: null,
    list: null,
    
    setup: function(list){
        globalMapManager._initGlobalInfo(list.length);
        globalMapManager._fillGlobalInfo(list);
        console.log(globalMapManager.info);
        console.log(globalMapManager.list);
    },

    _initGlobalInfo: function(listLength){
        globalMapManager.info = new Object();
        globalMapManager.list = [];

        var chFront = "第";
        var chBack = "章（困难）";
        var yh = "御魂";
        var yq = "yqfy";
    
        // initialize each chapter
        for(var i = 1; i <= 18; i++){
            globalMapManager.info[chFront+i+chBack] = [];
        
            //padding and boss info (TODO: find possible usage)
            globalMapManager.info[chFront+i+chBack].push(new Object());
        
            var maximumSpot = 6;
            if(i == 1)
                maximumSpot = 4;
            else if(i == 2)
                maximumSpot = 5;
            else if(i == 7)
                maximumSpot = 7;
        
            for(var j = 1; j <= maximumSpot; j++){
                globalMapManager.info[chFront+i+chBack].push(new Object());
            }
        }
    
        // special case
        globalMapManager.info["第5章（普通）"] = [];
        globalMapManager.info["第5章（普通）"].push(new Object());
        globalMapManager.info["第5章（普通）"].push(new Object());
    
        // initialize each dungeon
        for(var i = 1; i <= 10; i++){
            globalMapManager.info[yh+i] = new Object();
        }
    
        // initialize each special boss (TODO: initialize without fixed inputs)
        globalMapManager.info["跳跳哥哥"] = new Object();
        globalMapManager.info["椒图"] = new Object();
        globalMapManager.info["骨女"] = new Object();
        globalMapManager.info["海坊主"] = new Object();
        globalMapManager.info["鬼使黑"] = new Object();
        globalMapManager.info["二口女"] = new Object();
        globalMapManager.info["饿鬼"] = new Object();
        globalMapManager.info["金币怪物"] = new Object();
        //console.log(globalMapInfo);
    },

    _fillGlobalInfo: function(list){
        // make the list 1-indexed
        globalMapManager.list.push(null);
        
        // iterate each element in the list
        for(var i = 0; i < list.length; i++){
            var target = list[i];
            var apparentList = [];
            globalMapManager._chapterParser(target, apparentList);
            globalMapManager._yuhunParser(target, apparentList);
            globalMapManager._yqfyParser(target, apparentList);
            globalMapManager.list.push(apparentList);
        }
    },

    _chapterParser: function(target, apparentList){
        var ch = "chapter";
        for(var i = 1; i <= 10; i++){
            if(target[ch+i] != null){
                // 1st element: chapter number, 2nd element: chapter name, ...: apparent spot
                var chapterInfo = target[ch+i].split("——");
                var chapterEntry = globalMapManager.info[chapterInfo[0]];
                apparentList.push(chapterEntry);
                for(var j = 2; j < chapterInfo.length; j++){
                    var spotIndex = parseInt(chapterInfo[j][2]);
                    if(!Number.isNaN(spotIndex)){
                        var amountOfTarget = parseInt((chapterInfo[j].split("*"))[1]);
                        chapterEntry[spotIndex][target.name] = amountOfTarget;
                    }
                }
            }
        }
    },
     
    _yuhunParser: function(target, apparentList){
        var ch = "yuhun";
        for(var i = 1; i <= 4; i++){
            if(target[ch+i] != null){
                // 1st element: chapter number, 2nd element: level of the chapter, 3nd element: apparent spot ...
                var chapterInfo = target[ch+i].split("，");
                var chapterEntry = globalMapManager.info[chapterInfo[0]];
                apparentList.push(chapterEntry);
                for(var j = 2; j < chapterInfo.length; j+=2){
                    var amountOfTarget = parseInt((chapterInfo[j].split("*"))[1]);
                    chapterEntry[target.name] = amountOfTarget;
                }
            }
        }
    },
    
    _yqfyParser: function(target, apparentList){
        var ch = "yqfy";
        for(var i = 1; i <= 5; i++){
            if(target[ch+i] != null){
                // 1st element: chapter number, 2nd element: level of the chapter, 3nd element: apparent spot ...
                var chapterInfo = target[ch+i].split("——");
                
                // NOTE: special case (this is also where two-digit amount of target appears)
                if(chapterInfo.length == 1){
                    var amountOfTarget = parseInt((chapterInfo[0].split("*"))[1]);
                    globalMapManager.info["金币怪物"][target.name] = amountOfTarget;
                }
                else{
                    var chapterEntry = globalMapManager.info[chapterInfo[0]];
                    apparentList.push(chapterEntry);
                    for(var j = 2; j < chapterInfo.length; j+=2){
                        var amountOfTarget = parseInt((chapterInfo[j].split("*"))[1]);
                        chapterEntry[target.name] = amountOfTarget;
                    }
                }
            }
        }
    }
}

var resultManager = {
    resultList: [],
    ifFull: function(){
        if(resultManager.resultList.length >= 4){
            i.dealingRelation($(".OAR-resultError"));
            $(".OAR-resultError").html("\u6700\u591A\u53EA\u63A5\u53D7\u56DB\u4E2A\u8F93\u5165!");
            return true;
        }
        else
            return false;
    },
    addList: function(nameInput, informationInput){
        for(var iterator = 0; iterator < resultManager.resultList.length; iterator++){
            if(nameInput == resultManager.resultList[iterator].name){
                i.dealingRelation($(".OAR-resultError"));
                $(".OAR-resultError").html("\u8F93\u5165\u5DF2\u67E5\u8BE2\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165!");
                return;
            }
        }
        var informationPair = {name:nameInput, info:informationInput};
        resultManager.resultList.push(informationPair);
        resultManager.updateDocumentation();
    },
    clearList: function(){
        resultManager.resultList = [];  
        resultManager.updateDocumentation();
    },
    updateDocumentation: function(){
        for(var i = 0; i < 4; i++){
            var targetSection = "#list" + i;
            if(i < resultManager.resultList.length){
                $(targetSection).text(resultManager.resultList[i].name);
                $(targetSection).next().html(resultManager.resultList[i].info);
                $(targetSection).show();
                
                $(targetSection).next().find("a").click(function() {
                    var idInString = $(this).parent().parent().parent().attr("id");
                    var id = parseInt(idInString.charAt(idInString.length - 1));
                    resultManager.resultList.splice(id,1);
                    resultManager.updateDocumentation();
                })
            }
            else{
                $(targetSection).next().hide();
                $(targetSection).hide();
            }
        }
    },
    bindClick: function(){
        if($(this).next().is(':visible'))
            $(this).next().slideUp();
        else{
            $(this).siblings("div").slideUp();
            $(this).next().slideDown();
        }
    }
};

var i = {
        dealingRelation: function(i) {
            i.show().siblings("div").hide()
        },
        seek: function() {
            if(resultManager.ifFull())
                return -1;
            var t = $("#input-box").val().trim();
            return "" == t || 1 == /^\s*$/gi.test(t) ? (i.dealingRelation($(".OAR-resultError")),
            void $(".OAR-resultError").html("\u8f93\u5165\u7684\u5185\u5bb9\u4e0d\u80fd\u7a7a\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165!")) : void $.ajax({
                //url: "http://yys.163.com/m/fengyin/json/yys_1027.json",
                url: "data.json",
                type: "get",
                dataType: "json",
                success: function(s) {
                    if(globalMapManager.info == null)
                        globalMapManager.setup(s); // will be the parser
                    for (var e = 0; e < s.length; e++)
                        if (t == s[e].name)
                            return void i.showDetails(s[e]);
                    for (var n = new Array, d = new Array, l = 0; l < s.length; l++) {
                        var r = s[l].name;
                        if (r.indexOf(t) >= 0) {
                            if (n.indexOf(s[l].ID) >= 0)
                                continue;
                            n.push(s[l].ID)
                        }
                    }
                    for (var l = 0; l < s.length; l++)
                        if (s[l].clue) {
                            var a = s[l].clue.replace(/\u3001/gi, "");
                            if (a.indexOf(t) >= 0) {
                                if (n.indexOf(s[l].ID) >= 0)
                                    continue;
                                n.push(s[l].ID)
                            }
                        }
                    for (var e = 0; e < s.length; e++)
                        if (s[e].othername) {
                            var u = s[e].othername.replace(/\uff0c/gi, "");
                            if (u.indexOf(t) >= 0) {
                                if (n.indexOf(s[e].ID) >= 0)
                                    continue;
                                n.push(s[e].ID)
                            }
                        }
                    for (var e = 0; e < n.length; e++)
                        for (var l = 0; l < s.length; l++)
                            if (n[e] == s[l].ID) {
                                d.push(s[l]);
                                break
                            }
                    i.showList(d)
                },
                error: function() {
                    alert("\u7f51\u7edc\u4fe1\u53f7\u4e0d\u597d\uff0c\u8bf7\u5237\u65b0\u518d\u8bd5")
                }
            })
        },
        showList: function(t) {
            if (0 == t.length)
                i.dealingRelation($(".OAR-resultError")),
                $(".OAR-resultError").html("\u6ca1\u6709\u7b26\u5408\u6761\u4ef6\u7684\u5996\u602a\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165~!");
            else if (1 == t.length)
                i.showDetails(t[0]);
            else {
                $(".OAR-resultList > ul").html("");
                for (var s = 0; s < t.length; s++)
                    $("<li data-id=" + t[s].ID + ">" + t[s].name + "</li>").appendTo($(".OAR-resultList > ul"));
                i.dealingRelation($(".OAR-resultList")),
                i.addBind(t)
            }
        },
        addBind: function(t) {
            $(".OAR-resultList > ul").find("li").each(function() {
                $(this).click(function() {
                    for (var s = $(this).data("id"), e = 0; e < t.length; e++)
                        t[e].ID == s && i.showDetails(t[e])
                })
            })
        },
        showDetails: function(t) {
            var appearenceList = [];
            var s = "";
            s += '<p class="OAR-resultDetails-title"><span>' + t.name +  '|<a href="javascript:void(0)" id="deleteSelection" style="color:red"> [撤销]</a>' + "</span></p>",
            s += "<dl><dt>\u7ae0\u8282\uff1a</dt><dd>" + i.isEXist(t.chapter1) + i.isEXist(t.chapter2),
            s += i.isEXist(t.chapter3) + i.isEXist(t.chapter4) + i.isEXist(t.chapter5),
            s += i.isEXist(t.chapter6) + i.isEXist(t.chapter7) + i.isEXist(t.chapter8) + i.isEXist(t.chapter9) + i.isEXist(t.chapter10) + "</dd></dl>",
            s += "<dl><dt>\u7ebf\u7d22\uff1a</dt><dd>" + i.isEXist(t.clue) + "</dd></dl>",
            s += "<dl><dt>\u5fa1\u9b42\uff1a</dt><dd>" + i.isEXist(t.yuhun1) + i.isEXist(t.yuhun2),
            s += i.isEXist(t.yuhun3) + i.isEXist(t.yuhun4) + "</dd></dl>",
            s += "<dl><dt>\u5996\u6c14\u5c01\u5370\uff1a</dt><dd>" + i.isEXist(t.yqfy1) + i.isEXist(t.yqfy2),
            s += i.isEXist(t.yqfy3) + i.isEXist(t.yqfy4) + i.isEXist(t.yqfy5),
            s += "</dd></dl>",
            s += "<dl><dt>\u9b3c\u738b\u5c01\u5370\uff1a</dt><dd>" + i.isEXist(t.gwfy1) + i.isEXist(t.gwfy2),
            s += i.isEXist(t.gwfy3) + i.isEXist(t.gwfy4) + i.isEXist(t.gwfy5),
            s += i.isEXist(t.gwfy6) + "</dd></dl>",
            s += "<dl><dt>\u63a8\u8350\u526f\u672c\uff1a</dt><dd>" + i.isEXist(t.advice) + "</dd></dl>",
            s += "<dl><dt>\u4f53\u529b\u6d88\u8017\uff1a</dt><dd>" + i.isEXist(t.sushi) + "</dd></dl>";
            var e = i.markKey(s);
            $("#testID").html(e),
            
            //#testID should never be shown
            //i.dealingRelation($("#testID")),
            $(".OAR-resultList").hide(),
            $(".OAR-column-wrap").show(),
            i.isNull($("#testID")),
            resultManager.addList(t.name, $("#testID").html());
        },
        isEXist: function(i) {
            if (i && null != i) {
                var t = "<p>" + i + "</p>";
                return t
            }
            return ""
        },
        isNull: function(i) {
            i.find("dd").each(function() {
                "" == $(this).html() && $(this).html("<p>\u65e0</p>")
            })
        },
        markKey: function(i) {
            var t = /\uff08(.*?)\uff09/g
              , s = i.replace(t, '<font color="#ca1545">($1)</font>');
            return s
        },
        bindEvent: function() {
            $("#seek-btn").click(function() {
                i.seek();
            })
            $("#reset-btn").click(function(){
                resultManager.clearList();
            })
            $("#list0").click(resultManager.bindClick);
            $("#list1").click(resultManager.bindClick);
            $("#list2").click(resultManager.bindClick);
            $("#list3").click(resultManager.bindClick);

        },
        init: function() {
            var i = this;
            i.bindEvent();
        }
    };

function startup(){
    GlobalInit();
    i.init();
    resultManager.updateDocumentation();
}