/**
 * Adapting the code from http://yys.163.com/m/fengyin/ to analyse user input and retrieve information related to the input
 * Images are also obtained from url in the orginal code
 * It is strictly adapted for personal use (better query for the game information), it will be taken down if necessary
 * 
 * ===================================================================
 *
 * The program will take user input and match the target with the input (what the original code does)
 * and it can hold up to 4 targets in one query (due to the nature of the quest system in the game).
 * After each target update, it will suggest the optimal locations (for each target) to finish the task
 * simply by suggesting the location that can encounter the most amount of targets
 *
 * NOTE: The query can perform better if each target is weighted different (different amounts are required for different quests)
 *       and it can be done by requesting user to enter the amount of target needed besides entering information to identify the target.
 *       However, it makes the user operations more complicated. Therefore, the functionality is not implemented as a development choice.
 *
 *       Although weighted targets may be able to transform the query into a graph 
 *       and further solve it (multiple quests with multiple possible locations) by solving shortest path.
 *       The fact that I could not think of a way to transform the query into a graph is another reason 
 *       why the weighted target functionality is not implemented.
 *
 *       The functionality may be considered if a proper transfromation is presented.
 *
 * ===================================================================
 *
 * keywords: TODO, DONE, NOTE
 *
 * CONVENTION: 1-index for simplicity because the data in JSON is 1-index (level info, ID, ...)
 *
 */

// global variables as configuration for the program
var MAX_NUMBER_OF_TARGETS = 4;

/**
 * An object to manage the map information (the appearance of targets and amount)
 * It holds two associated arrays (as the map) and functions to manipulate the map
 */
var globalMapManager = {
    // info: an associated array to hold location-to-targets information
    // list: an associated array to hold target-to-locations information
    info: null,
    list: null,
    
    // functin to initialize the map given information in a string (inforamtion obtained from data.json)
    setup: function(list){
        globalMapManager._initGlobalInfo(list.length);
        globalMapManager._fillGlobalInfo(list);
    },
    
    // function to find the optimal locations given a list of targets
    findSolution: function(list){
        // the final solution to be returned
        // an element: total amount of targets, level, spot (or null), target A and amount [, target B and amount, ...]
        var solutions = [];
        
        // temporary variables live inside the function
        // an element: total amount of targets, level, spot (or null)
        var temporarySolutions = [];
        var targetName = [];
        // setup
        for(var i = 0; i < list.length; i++){
            var emptyElement = [0, "", null];
            temporarySolutions.push(emptyElement);
            targetName.push(list[i].name);
        }
        
        // start searching the optimal result (having larger total amount of targets) for each target
        for(var i = 0; i < list.length; i++){
            var target = list[i];
            var apparentSpot = globalMapManager.list[target.id];
        //console.log(apparentSpot);
            for(var j = 0; j < apparentSpot.length; j++){
                var chapterEntry = apparentSpot[j];
                if(Array.isArray(chapterEntry) == false){
                    globalMapManager._findTotalAmountOfTargets(chapterEntry, null, targetName, temporarySolutions, chapterEntry.name);
                }
                else{
                    for(var k = 1; k < chapterEntry.length; k++){
                        globalMapManager._findTotalAmountOfTargets(chapterEntry, k, targetName, temporarySolutions, chapterEntry[0]);
                    }
                }
            }
        }
        
        //console.log(temporarySolutions);
        var noOptimalSolution = false;
        for(var i = 0; i < temporarySolutions.length; i++){
            var addedFlag = false;
            if(temporarySolutions[i][0] == 0)
                noOptimalSolution = true;
            else{
                for(var j = 0; j < solutions.length; j++){
                    if(solutions[j][0] == temporarySolutions[i][1] && solutions[j][1] == temporarySolutions[i][2])
                        addedFlag = true;
                }
                if(addedFlag == false){
                    var chapterName = temporarySolutions[i][1];
                    var spot = temporarySolutions[i][2];
                    var newSolution = [chapterName, spot];
                
                    var entry = globalMapManager.info[chapterName];
                    if(spot != null)
                        entry = entry[spot];
                    for(var j = 0; j < targetName.length; j++){
                        if(typeof entry[targetName[j]] != 'undefined'){
                            newSolution.push(targetName[j] + "*" + entry[targetName[j]]);
                        }
                    }
                
                    solutions.push(newSolution);
                }
            }
        }
        solutions.push(noOptimalSolution);
        return solutions;
    },
    
    _findTotalAmountOfTargets: function(chapter, spot, list, solution, chapterName){
        var involvedFlag = [];
        var totalAmount = 0;
        var entry = chapter;
        if(spot != null)
            entry = chapter[spot];
        
        for(var i = 0; i < list.length; i++){
            involvedFlag.push(false);
        }
        
        for(var i = 0; i < list.length; i++){
            //console.log(list[i]);
            //console.log(entry);
            if(typeof entry[list[i]] != 'undefined'){
                //console.log("1");
                totalAmount += entry[list[i]];
                involvedFlag[i] = true;
            }
        }
        
        for(var i = 0; i < involvedFlag.length; i++){
            if(involvedFlag[i] && solution[i][0] < totalAmount)
               solution[i] = [totalAmount, chapterName, spot];
        }
        //console.log(solution);
    },

    // helper function to initialize info
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
            globalMapManager.info[chFront+i+chBack].push(chFront+i+chBack);
        
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
        globalMapManager.info["第5章（普通）"].push("第5章（普通）");
        globalMapManager.info["第5章（普通）"].push(new Object());
    
        // initialize each dungeon
        for(var i = 1; i <= 10; i++){
            globalMapManager.info[yh+i] = {name:yh+i};
        }
    
        // initialize each special boss (TODO: initialize without fixed inputs)
        globalMapManager.info["跳跳哥哥"] = {name:"跳跳哥哥"};
        globalMapManager.info["椒图"] = {name:"椒图"};
        globalMapManager.info["骨女"] = {name:"骨女"};
        globalMapManager.info["海坊主"] = {name:"海坊主"};
        globalMapManager.info["鬼使黑"] = {name:"鬼使黑"};
        globalMapManager.info["二口女"] = {name:"二口女"};
        globalMapManager.info["饿鬼"] = {name:"饿鬼"};
        globalMapManager.info["金币怪物"] = {name:"金币怪物"};
        //console.log(globalMapInfo);
    },
    
    // helper function to initialize list and fill up info and list
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
                    apparentList.push(globalMapManager.info["金币怪物"]);
                }
                else{
                    var chapterEntry = globalMapManager.info[chapterInfo[0]];
                    apparentList.push(chapterEntry);
                    for(var j = 1; j < chapterInfo.length; j++){
                        var amountOfTarget = parseInt((chapterInfo[j].split("*"))[1]);
                        if(typeof chapterEntry[target.name] != 'undefined')
                            chapterEntry[target.name] += amountOfTarget;
                        else
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
        if(resultManager.resultList.length >= MAX_NUMBER_OF_TARGETS){
            i.dealingRelation($(".OAR-resultError"));
            $(".OAR-resultError").html("\u6700\u591A\u53EA\u63A5\u53D7\u56DB\u4E2A\u8F93\u5165!");
            return true;
        }
        else
            return false;
    },
    addList: function(idInput, nameInput, informationInput){
        for(var iterator = 0; iterator < resultManager.resultList.length; iterator++){
            if(nameInput == resultManager.resultList[iterator].name){
                i.dealingRelation($(".OAR-resultError"));
                $(".OAR-resultError").html("\u8F93\u5165\u5DF2\u67E5\u8BE2\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165!");
                return;
            }
        }
        var informationPair = {id:idInput, name:nameInput, info:informationInput};
        resultManager.resultList.push(informationPair);
        resultManager.updateDocumentation();
    },
    clearList: function(){
        resultManager.resultList = [];  
        resultManager.updateDocumentation();
    },
    updateDocumentation: function(){
        for(var iterator = 0; iterator < MAX_NUMBER_OF_TARGETS; iterator++){
            var targetSection = "#list" + iterator;
            if(iterator < resultManager.resultList.length){
                $(targetSection).text(resultManager.resultList[iterator].name);
                $(targetSection).next().html(resultManager.resultList[iterator].info);
                $(targetSection).show();
                
                $(targetSection).next().find("a").click(function() {
                    var idInString = $(this).parent().parent().parent().attr("id");
                    var id = parseInt(idInString.charAt(idInString.length - 1));
                    resultManager.resultList.splice(id,1);
                    resultManager.updateDocumentation();
                });
            }
            else{
                $(targetSection).next().hide();
                $(targetSection).hide();
            }
        }
        //solution: an array that each element contains optimal spot for specific target(s), indicating level info, target name and amount
        var solution = globalMapManager.findSolution(resultManager.resultList);
        //console.log(solution);
        //parse result for HTML display
        var htmlText = "";
        htmlText += '<p class="OAR-resultDetails-title"><span>' + "\u63a8\u8350\u51FA\u5904" + "</span></p>";
        for(var iterator = 0; iterator < solution.length-1; iterator++){
            var appearance = solution[iterator][0];
            if(solution[iterator][1] != null)
                appearance += "妖怪" + solution[iterator][1];
            appearance += "\uff1a";
            htmlText += "<dl><dt>" + appearance + "</dt><dd><p>";
            for(var j = 2; j < solution[iterator].length; j++)
                htmlText += '<font color="#ca1545">' + solution[iterator][j] + '</font>' + ", ";
            htmlText += "</p></dd></dl>";
        }
        if(solution[solution.length-1]){
            htmlText += "<dl><dt>" + "某些妖怪只存在于关卡首领或鬼王封印" + "</dt></dl>";
        }
        $("#solution").html(htmlText);
        if(resultManager.resultList.length!=0)
            $("#solution").show();
        else
            $("#solution").hide();
        //testID
    },
    bindClick: function(){
        $(".OAR-resultError").hide();
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
            resultManager.addList(t.ID, t.name, $("#testID").html());
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
                $(".OAR-resultError").hide();
                i.seek();
            })
            $("#reset-btn").click(function(){
                $(".OAR-resultError").hide();
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