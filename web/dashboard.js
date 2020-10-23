ModuleManagerClass.register({
    name: "Dashboard",
    prerequisites: ["ModalElement", "FormClass"]
});

carddone.dashboard.deleteChart = function(host, id){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "dashboard_delete.php",
        params: [{name: "id", value: id}],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    for (var i = 0; i < host.dataDashboard.length; i++){
                        if (host.dataDashboard[i].id == id){
                            host.dataDashboard.splice(i, 1);
                            break;
                        }
                    }
                    host.eltChoose.remove();
                    dbcache.refresh("dashboard");
                }
                else {
                    ModalElement.alert({message: message});
                }
            }
            else {
                ModalElement.alert({message: message});
            }
        }
    })
};

carddone.dashboard.deleteChartConfrim = function(host, id){
    ModalElement.question({
        title: LanguageModule.text("war_title_delete_chart"),
        message: LanguageModule.text("war_txt_detele_chart"),
        onclick: function(sel){
            if (sel == 0){
                carddone.dashboard.deleteChart(host, id);
            }
        }
    });
};

carddone.dashboard.addNewSave = function(host, id, data){
    return new Promise(function(resolve, reject){
        var typeSave;
        if (id != ""){
            data.id = id;
            typeSave = "edit";
        }
        else {
            data.id = (new Date()).getTime();
            typeSave = "new";
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "dashboard_save.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "typeSave", value: typeSave}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        carddone.dashboard.drawChart(host, data).then(function(chart){
                            resolve(data);
                            if (id == ""){
                                host.dataDashboard.push(data);
                                host.data_container.addChild(chart);
                            }
                            else {
                                for (var i = 0; i < host.dataDashboard.length; i++){
                                    if (host.dataDashboard[i].id == id){
                                        host.dataDashboard[i] = data;
                                        break;
                                    }
                                }
                                host.eltChoose.parentNode.replaceChild(chart, host.eltChoose);
                            }
                            ModalElement.close(-1);
                            dbcache.refresh("dashboard");
                        });
                    }
                    else {
                        ModalElement.alert({message: message});
                    }
                }
                else {
                    ModalElement.alert({message: message});
                }
            }
        });
    });
};

carddone.dashboard.loadUser_calendar = function(host, userIds){
    return new Promise(function(resolve, reject){
        var ex = [];
        for (var i = 0; i < userIds.length; i++){
            if (host.user_calendarDic[userIds[i]] === undefined){
                ex.push(userIds[i]);
            }
        }
        if (ex.length == 0){
            resolve();
        }
        else {
            dbcache.loadByCondition({
                name: "user_calendar",
                cond: function(record){
                    return ex.indexOf(record.userid) >= 0;
                },
                callback: function(retval){
                    var x = {
                        database: {
                            user_calendar: {
                                items: EncodingClass.string.duplicate(retval)
                            }
                        }
                    };
                    contentModule.makeUserCalendarContent(x);
                    host.database.user_calendar.items = host.database.user_calendar.items.concat(x.database.user_calendar.items);
                    for (var i = 0; i < ex.length; i++){
                        host.user_calendarDic[ex[i]] = 1;
                    }
                    resolve();
                }
            });
        }
    });
};

carddone.dashboard.loadCards = function(host, cardids, objids){
    return new Promise(function(resolve, reject){
        if (cardids.length == 0 && objids.length == 0){
            resolve();
        }
        else {
            var promiseList = {};
            var cards;
            promiseList.cards = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "lists",
                    cond: function (record) {
                        return cardids.indexOf(record.id) >= 0 && record.type == 'card';
                    },
                    callback: function (retval) {
                        cards = EncodingClass.string.duplicate(retval);
                        for (var i = 0; i < cards.length; i++){
                            cards[i].archived = 0;
                        }
                        resolve();
                    }
                });
            });
            var cardsArchived;
            var cardsArchivedPromise = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "archived_lists",
                    cond: function (record) {
                        return cardids.indexOf(record.id) >= 0 && record.type == 'card';
                    },
                    callback: function (retval) {
                        cardsArchived = EncodingClass.string.duplicate(retval);
                        for (var i = 0; i < cardsArchived.length; i++){
                            cardsArchived[i].archived = 1;
                        }
                        resolve();
                    }
                });
            });
            promiseList.objects = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "objects",
                    cond: function (record) {
                        return objids.indexOf(record.id) >= 0;
                    },
                    callback: function (retval) {
                        var objects = EncodingClass.string.duplicate(retval);
                        Array.prototype.push.apply(host.database.objects.items, objects);
                        resolve();
                    }
                });
            });
            var lists;
            promiseList.lists = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "lists",
                    cond: function (record) {
                        return record.type == "list";
                    },
                    callback: function (retval) {
                        lists = retval;
                        resolve();
                    }
                });
            });
            var listsArchived;
            var listsArchivedPromise = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "archived_lists",
                    cond: function (record) {
                        return record.type == "list";
                    },
                    callback: function (retval) {
                        listsArchived = retval;
                        resolve();
                    }
                });
            });
            promiseList.company_card = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "company_card",
                    cond: function (record) {
                        return cardids.indexOf(record.hostid) >= 0;
                    },
                    callback: function (retval) {
                        var company_card = EncodingClass.string.duplicate(retval);
                        Array.prototype.push.apply(host.database.company_card.items, company_card);
                        resolve();
                    }
                });
            });
            promiseList.contact_card = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "contact_card",
                    cond: function (record) {
                        return cardids.indexOf(record.hostid) >= 0;
                    },
                    callback: function (retval) {
                        var contact_card = EncodingClass.string.duplicate(retval);
                        Array.prototype.push.apply(host.database.contact_card.items, contact_card);
                        resolve();
                    }
                });
            });
            Promise.all([
                promiseList.cards,
                promiseList.objects,
                promiseList.lists,
                promiseList.company_card,
                promiseList.contact_card,
                listsArchivedPromise,
                cardsArchivedPromise
            ]).then(function(){
                cards = cards.concat(cardsArchived);
                Array.prototype.push.apply(host.database.cards.items, cards);
                var listsItems = [];
                var listids = [];
                for (var i = 0; i < cards.length; i++){
                    listids.push(cards[i].parentid);
                }
                for (var i = 0; i < lists.length; i++){
                    if (listids.indexOf(lists[i].id) >= 0) listsItems.push(lists[i]);
                }
                for (var i = 0; i < listsArchived.length; i++){
                    if (listids.indexOf(listsArchived[i].id) >= 0) {
                        listsItems.push(listsArchived[i]);
                    }
                }
                listids = [];
                for (var i = 0; i < listsItems.length; i++){
                    listids.push(listsItems[i].parentid);
                }
                for (var i = 0; i < lists.length; i++){
                    if (listids.indexOf(lists[i].id) >= 0) listsItems.push(lists[i]);
                }
                for (var i = 0; i < listsArchived.length; i++){
                    if (listids.indexOf(listsArchived[i].id) >= 0) {
                        // console.log(listsArchived[i]);
                        listsItems.push(listsArchived[i]);
                    }
                }
                Array.prototype.push.apply(host.database.lists.items, listsItems);
                // console.log(4, new Date().getTime());
                contentModule.makeActivitiesCardIndexThanhYen(host);
                contentModule.makeCompanyCardIndex(host);
                // console.log(5, new Date().getTime());
                resolve();
            });
        }
    });
};

carddone.dashboard.getChart = function(host, content){
    var chart = DOMElement.div({attrs: {style: {height: "250px", width: "250px"}}, text: "Không có dữ liệu"});
    var name, board;
    var timestart, timeend;
    switch (content.period) {
        case 0:
            timestart = content.time_option_start;
            timeend = content.time_option_end;
            break;
        case 1:
            timestart = absol.datetime.prevDate(absol.datetime.beginOfDay(new Date()));
            timeend = new Date(absol.datetime.beginOfDay(new Date()).getTime() - 1);
            break;
        case 2:
            timestart = absol.datetime.beginOfDay(new Date());
            timeend = new Date(new Date().setHours(23, 59, 59, 999));
            break;
        case 3:
            timestart = new Date(absol.datetime.beginOfWeek(new Date(), false, 1).getTime() - 7*24*60*60*1000);
            timeend = new Date(absol.datetime.beginOfWeek(new Date(), false, 1).getTime() - 1);
            break;
        case 4:
            timestart = absol.datetime.beginOfWeek(new Date(), false, 1);
            timeend = new Date(absol.datetime.beginOfWeek(new Date(), false, 1).getTime() + 7*24*60*60*1000 - 1);
            break;
        case 5:
            timestart = new Date((new Date((new Date()).getTime() - 6 *86400000)).setHours(0,0,0,0));
            timeend = new Date(new Date().setHours(23, 59, 59, 999));
            break;
        case 5:
            timestart = new Date((new Date((new Date()).getTime() - 6 *86400000)).setHours(0,0,0,0));
            timeend = new Date(new Date().setHours(23, 59, 59, 999));
            break;
        case 6:
            timestart = absol.datetime.prevMonth(new Date());
            timeend = new Date(absol.datetime.beginOfMonth(new Date()).getTime() - 1);
            break;
        case 7:
            timestart = absol.datetime.beginOfMonth(new Date());
            timeend = new Date(absol.datetime.nextMonth(new Date()).getTime() - 1);
            break;
        case 8:
            timestart = new Date(new Date((new Date((new Date()).getTime() - 29 *86400000)).setHours(0,0,0,0)));
            timeend = new Date(new Date().setHours(23, 59, 59, 999));
            break;
        case 9:
            var x = (new Date().getMonth())%3;
            timestart = absol.datetime.beginOfMonth(new Date());
            for (var i = 0; i < x + 3; i++){
                timestart = absol.datetime.beginOfMonth(new Date(timestart.getTime() - 1));
            }
            timeend = new Date(absol.datetime.beginOfMonth(new Date()).getTime() - 1);
            for (var i = 0; i < x; i++){
                timeend = new Date(absol.datetime.beginOfMonth(timeend).getTime() - 1);
            }
            break;
        case 10:
            var x = (new Date().getMonth())%3;
            timestart = absol.datetime.beginOfMonth(new Date());
            for (var i = 0; i < x; i++){
                timestart = absol.datetime.beginOfMonth(new Date(timestart.getTime() - 1));
            }
            timeend = new Date();
            for (var i = 0; i < (3 - x); i++){
                timeend = new Date(absol.datetime.nextMonth(timeend).getTime());
            }
            timeend = new Date(timeend.getTime() - 1);
            break;
        case 11:
            timestart = new Date(new Date((new Date((new Date()).getTime() - 89 *86400000)).setHours(0,0,0,0)));
            timeend = new Date(new Date().setHours(23, 59, 59, 999));
            break;
        case 12:
            var x = new Date().getFullYear();
            timestart = new Date(x - 1, 0, 1, 0, 0, 0, 0);
            timeend = new Date(x - 1, 11, 31, 23, 59, 59, 999);
            break;
        case 13:
            timestart = new Date(new Date((new Date((new Date()).getTime() - 6 *86400000)).setHours(0,0,0,0)));
            timeend = new Date(new Date((new Date((new Date()).getTime() + 6 *86400000)).setHours(23, 59, 59, 999)));
            break;
        default:
        break;
    }
    period = contentModule.formatTimeDisplay(timestart) + " - " + contentModule.formatTimeDisplay(timeend);
    if (content.boardIds.indexOf(0) >= 0){
        board = LanguageModule.text("txt_all");
    }
    else {
        board = "";
        for (var i = 0; i < content.boardIds.length; i++){
            var bIndex = host.database.boards.getIndex(content.boardIds[i]);
            if (bIndex >= 0) {
                if (board.length > 0) board += ", ";
                board += host.database.boards.items[bIndex].name;
            }
        }
    }
    var listCalendarContent = [];
    var userIds;
    if (content.userIds === undefined){
        userIds = [content.userid];
    }
    else {
        userIds = content.userIds;
    }
    if (userIds.indexOf(0) >= 0){
        userIds = [];
        for (var i = 0; i < data_module.users.items.length; i++){
            userIds.push(data_module.users.items[i].homeid);
        }
    }
    for (var i = 0; i < host.database.user_calendar.items.length; i++){
        if (userIds.indexOf(host.database.user_calendar.items[i].userid) < 0) continue;
        if (host.database.user_calendar.items[i].timeend.getTime() < timestart.getTime()) continue;
        if (host.database.user_calendar.items[i].timestart.getTime() > timeend.getTime()) continue;
        listCalendarContent = listCalendarContent.concat(host.database.user_calendar.items[i].content);
    }
    var dataDraw = [], cardIndex, nowTime = (new Date()).getTime(), boardIndex, listIndex, objIndex, listid2, listIndex2;
    host.boardsDic = contentModule.makeDictionaryIndex(host.database.boards.items);
    host.listsDic = contentModule.makeDictionaryIndex(host.database.lists.items);
    host.cardsDic = contentModule.makeDictionaryIndex(host.database.cards.items);
    host.objectsDic = contentModule.makeDictionaryIndex(host.database.objects.items);
    for (var i = 0; i < listCalendarContent.length; i++){
        if (listCalendarContent[i].type == "meeting"){
            if (
                (listCalendarContent[i].timestart.getTime() > timeend.getTime() || listCalendarContent[i].timestart.getTime() < timestart.getTime()) &&
                (listCalendarContent[i].timeend.getTime() > timeend.getTime() || listCalendarContent[i].timeend.getTime() < timestart.getTime())
            ) {
                continue;
            }
            listCalendarContent[i].exp = listCalendarContent[i].timeend.getTime() < nowTime;
        }
        else {
            if (listCalendarContent[i].time.getTime() > timeend.getTime() || listCalendarContent[i].time.getTime() < timestart.getTime()) {
                continue;
            }
            listCalendarContent[i].exp = listCalendarContent[i].time.getTime() < nowTime;
        }
        cardIndex = host.cardsDic[listCalendarContent[i].cardid];
        objIndex = host.objectsDic[listCalendarContent[i].objid];
        if (cardIndex === undefined || objIndex === undefined) {
            continue;
        }
        listIndex = host.listsDic[host.database.cards.items[cardIndex].parentid];
        if (listIndex === undefined) {
            continue;
        }
        listIndex2 = host.listsDic[host.database.lists.items[listIndex].parentid];
        if (listIndex === undefined) {
            continue;
        }
        listCalendarContent[i].boardid = host.database.lists.items[listIndex2].parentid;
        boardIndex = host.boardsDic[listCalendarContent[i].boardid];
        if (content.boardIds.indexOf(0) < 0) if (content.boardIds.indexOf(listCalendarContent[i].boardid) < 0) {
            continue;
        }
        if (listCalendarContent[i].type == "meeting"){
            listCalendarContent[i].time = listCalendarContent[i].timeend;
        }
        if (host.database.cards.items[cardIndex].permission != "no") {
            listCalendarContent[i].permission = host.database.cards.items[cardIndex].permission;
            dataDraw.push(listCalendarContent[i]);
        }
    }
    var dataExp = [], dataFinish = [], dataAvailable = [];
    for (var i = 0; i < dataDraw.length; i++){
        if (dataDraw[i].status) dataFinish.push(dataDraw[i]);
        else if (dataDraw[i].exp) dataExp.push(dataDraw[i]);
        else dataAvailable.push(dataDraw[i]);
    }
    switch (content.typeChart) {
        case "activity_status":
            name = LanguageModule.text("txt_activity_status");
            if (dataDraw.length > 0){
                chart = absol._({
                    tag: 'piechart',
                    style: {
                        width: "calc(100% - 20px)",
                        height: "250px",
                        minWidth: "200px"
                    },
                    props: {
                        title: "",
                        pieces: [
                            {
                                fillColor: '#e44242',
                                name: LanguageModule.text("txt_overdue"),
                                value: dataExp.length
                            },
                            {
                                fillColor: '#80c41c',
                                name: LanguageModule.text("txt_finish"),
                                value: dataFinish.length
                            },
                            {
                                fillColor: '#e9e130',
                                name: LanguageModule.text("txt_plan"),
                                value: dataAvailable.length
                            }
                        ]
                    }
                });
            }
            break;
        case "count_activity_overdue":
            name = LanguageModule.text("txt_count_activity_overdue");
            var listValuesExp = [0, 0, 0, 0, 0], diffTime;
            for (var i = 0; i < dataExp.length; i++){
                if (dataExp[i].type == "meeting") diffTime = nowTime - dataExp[i].time.getTime();
                else diffTime = nowTime - dataExp[i].time.getTime();
                if (diffTime <= 86400000) listValuesExp[4]++;
                else if (diffTime <= 2*86400000) listValuesExp[3]++;
                else if (diffTime <= 3*86400000) listValuesExp[2]++;
                else if (diffTime <= 4*86400000) listValuesExp[1]++;
                else  listValuesExp[0]++;
            }
            chart = vchart._({
                tag: 'columnchart',
                style: {
                    width: "calc(100% - 20px)",
                    minWidth: "200px",
                    height: "250px",
                },
                props: {
                    title: "",
                    integerOnly: true,
                    valueName: '',
                    keyName: LanguageModule.text("txt_date"),
                    zeroOY: true,
                    rotateText: false,
                    columnWidth: 20,
                    keys: ["≥5", "4", "3", "2", "1"],
                    columnColors: ["#ff0000", "#c50805", "#920a07", "#670908", "440808"],
                    values: listValuesExp,
                    colName: '',
                    showInlineValue: true
                }
            });
            break;
    }
    var user = "";
    if (content.userIds === undefined){
        userIds = [content.userid];
    }
    else {
        userIds = content.userIds;
    }
    for (var i = 0; i < userIds.length; i++){
        if (user.length > 0) user +=  ", ";
        if (userIds[i] == 0){
            user += LanguageModule.text("txt_all");
        }
        else user += contentModule.getUsernameFullnameByhomeid(data_module.users, userIds[i]);
    }
    return {
        chart: chart,
        name: name,
        board: board,
        user: user,
        period: period
    }
};

carddone.dashboard.drawChart = function(host, content){
    return new Promise(function(resolve, reject){
        var userIds;
        if (content.userIds === undefined){
            userIds = [content.userid];
        }
        else {
            userIds = content.userIds;
        }
        if (userIds.indexOf(0) >= 0) {
            userIds = [];
            for (var i = 0; i < data_module.users.items.length; i++){
                userIds.push(data_module.users.items[i].homeid);
            }
        }
        carddone.dashboard.loadUser_calendar(host, userIds).then(function(){
            var cardids = [], cardid, objids = [], objid;
            for (var i = 0; i < host.database.user_calendar.items.length; i++){
                if (userIds.indexOf(host.database.user_calendar.items[i].userid) < 0) continue;
                for (var j = 0; j < host.database.user_calendar.items[i].content.length; j++){
                    cardid = host.database.user_calendar.items[i].content[j].cardid;
                    if (host.cardsIds.indexOf(cardid) < 0){
                        cardids.push(cardid);
                        host.cardsIds.push(cardid);
                    }
                    objid = host.database.user_calendar.items[i].content[j].objid;
                    if (host.objectsIds.indexOf(objid) < 0){
                        objids.push(objid);
                        host.objectsIds.push(objid);
                    }
                }
            }
            carddone.dashboard.loadCards(host, cardids, objids).then(function(values){
                var chartCtn;
                var item = carddone.dashboard.getChart(host, content);
                var quickMenuItems = [
                    {
                        text: LanguageModule.text("txt_edit"),
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: ["material-icons"],
                            child: {text: "create"}
                        },
                        cmd: function(){
                            carddone.dashboard.addNew(host, content.id);
                            host.eltChoose = chartCtn;
                        }
                    },
                    {
                        text: LanguageModule.text("txt_delete"),
                        extendClasses: "bsc-quickmenu red",
                        icon: {
                            tag: "i",
                            class: ["material-icons"],
                            child: {text: "delete"}
                        },
                        cmd: function(){
                            carddone.dashboard.deleteChartConfrim(host, content.id);
                            host.eltChoose = chartCtn;
                        }
                    }
                ];
                var position = host.data_container.findAvailableNewRect(15, 20);
                var gridX = position.x, gridY = position.y, gridHeight = 20, gridWidth = 15;
                if (host.positionDashboard["c_" + content.id] !== undefined){
                    gridX = host.positionDashboard["c_" + content.id].x;
                    gridY = host.positionDashboard["c_" + content.id].y;
                    gridHeight = host.positionDashboard["c_" + content.id].height;
                    gridWidth = host.positionDashboard["c_" + content.id].width;
                }
                chartCtn = absol.buildDom({
                    tag: "dbwidget",
                    id: "c_" + content.id,
                    class: "card-widget-chart-ctn",
                    props: {
                        title: item.name,
                        quickmenu: {
                            props: {
                                items: quickMenuItems
                            },
                            onSelect: function(item){
                                item.cmd();
                            }
                        },
                        gridX: gridX,
                        gridY: gridY,
                        gridHeight: gridHeight,
                        gridWidth: gridWidth
                    },
                    child: [
                        DOMElement.p({
                            attrs: {style: {fontSize: "12px"}},
                            text: item.board + ", " + item.user + ", " + item.period
                        }),
                        item.chart
                    ]
                });
                resolve(chartCtn);
            });
        });
    });
};

carddone.dashboard.addNew = function(host, id){
    var data = {id: id};
    if (id > 0){
        var ex = -1;
        for (var i = 0; i < host.dataDashboard.length; i++){
            if (host.dataDashboard[i].id == id){
                ex = i;
                break;
            }
        }
        if (ex < 0){
            ModalElement.alert({message: "Lỗi dữ liệu"});
            return;
        }
        if (host.dataDashboard[ex].userIds === undefined){
            data.userValue = [host.dataDashboard[ex].userid];
        }
        else {
            data.userValue = host.dataDashboard[ex].userIds;
        }
        data.boardValue = host.dataDashboard[ex].boardIds;
        data.periodValue = host.dataDashboard[ex].period;
        data.chartValue = host.dataDashboard[ex].typeChart;
        if (data.periodValue != 0){
            data.time_option_start = new Date((new Date((new Date()).getTime() - 6 *86400000)).setHours(0,0,0,0));
            data.time_option_end = new Date((new Date((new Date()).getTime() + 6 *86400000)).setHours(0,0,0,0));
        }
        else {
            data.time_option_start = host.dataDashboard[ex].time_option_start;
            data.time_option_end = host.dataDashboard[ex].time_option_end;
        }
    }
    else {
        data.userValue = [systemconfig.userid];
        data.boardValue = [0];
        data.periodValue = 1;
        data.chartValue = "activity_status";
        data.time_option_start = new Date((new Date((new Date()).getTime() - 6 *86400000)).setHours(0,0,0,0));
        data.time_option_end = new Date((new Date((new Date()).getTime() + 6 *86400000)).setHours(0,0,0,0));
    }
    data.userItems = [{value: 0, text: LanguageModule.text("txt_all")}];
    for (var i = 0; i < data_module.users.items.length; i++){
        data.userItems.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
    }
    data.boardItems = [{value: 0, text: LanguageModule.text("txt_all")}];
    for (var i = 0; i < host.database.boards.items.length; i++){
        data.boardItems.push({value: host.database.boards.items[i].id, text: host.database.boards.items[i].name});
    }
    data.periodItems = [
        {value: 1, text: LanguageModule.text("txt_yesterday")},
        {value: 2, text: LanguageModule.text("txt_today")},
        {value: 3, text: LanguageModule.text("txt_last_week")},
        {value: 4, text: LanguageModule.text("txt_this_week")},
        {value: 13, text: LanguageModule.text("txt_7_days_before_after")},
        {value: 5, text: LanguageModule.text("txt_last_7_days")},
        {value: 6, text: LanguageModule.text("txt_last_month")},
        {value: 7, text: LanguageModule.text("txt_this_month")},
        {value: 8, text: LanguageModule.text("txt_last_30_days")},
        {value: 9, text: LanguageModule.text("txt_last_quarter")},
        {value: 10, text: LanguageModule.text("txt_this_quarter")},
        {value: 11, text: LanguageModule.text("txt_last_90_days")},
        {value: 12, text: LanguageModule.text("txt_last_year")},
        {value: 0, text: LanguageModule.text("txt_option")}
    ];
    data.chartItems = [
        {value: "activity_status", text: LanguageModule.text("txt_activity_status")},
        {value: "count_activity_overdue", text: LanguageModule.text("txt_count_activity_overdue")}
    ];
    var cmdbutton = {
        save: function (data) {
            return carddone.dashboard.addNewSave(host, id, data);
        }
    };
    theme.formDashboardEdit({
        frameList: host.frameList,
        cmdbutton: cmdbutton,
        data: data
    });
};

carddone.dashboard.predrawChart = function(host){
    var sync = Promise.resolve();
    return host.dataDashboard.reduce(function(sync, item, i){
        return sync.then(function(){
            return carddone.dashboard.drawChart(host, item).then(function(chart){
                host.data_container.addChild(chart);
            })
        });
    }, sync);
};

carddone.cards.openCard = function(host, cardid){
    var cIndex = host.database.cards.getIndex(cardid);
    if (cIndex < 0){
        ModalElement.alert({message: "failed_cardid"});
        return;
    }
    var listIndex = host.database.lists.getIndex(host.database.cards.items[cIndex].parentid);
    if (listIndex < 0){
        ModalElement.alert({message: "failed_listid"});
        return;
    }
    listIndex = host.database.lists.getIndex(host.database.lists.items[listIndex].parentid);
    if (listIndex < 0){
        ModalElement.alert({message: "failed_listid2"});
        return;
    }
    var content = {
        cardid: cardid,
        permission: host.database.cards.items[cIndex].permission,
        archivedCard: host.database.cards.items[cIndex].archive? 1: 0,
        listid: host.database.cards.items[cIndex].parentid,
        boardid: host.database.lists.items[listIndex].parentid
    };
    console.log(content);
    carddone.menu.loadPage(11, content);
};

carddone.dashboard.unpinCard = function(host, cardid){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "dashboard_unpin_card.php",
        params: [{name: "cardid", value: cardid}],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    if (cardid > 0){
                        var elt = absol.$("#card_"+ cardid);
                        if (elt) elt.remove();
                        else console.log("error");
                        if (host.widgetCardAttention.childNodes.length == 0){
                            host.widgetCardAttentionCtn.remove();
                            delete host.widgetCardAttentionCtn;
                        }
                    }
                    else {
                        host.widgetCardAttentionCtn.remove();
                        delete host.widgetCardAttentionCtn;
                    }
                    dbcache.refresh("attention_lists");
                }
                else {
                    ModalElement.alert({message: message});
                }
            }
            else {
                ModalElement.alert({message: message});
            }
        }
    });
};

carddone.dashboard.pinCard = function(host, cardid){
    var addTaskCard = function(){
        var card = carddone.dashboard.getTaskCardElt(host, cardid);
        if (card === null) return;
        carddone.dashboard.createWidgetAttentionList(host, "new");
        host.widgetCardAttention.addChild(card);
    };
    var cIndex = host.database.cards.getIndex(cardid);
    if (cIndex < 0){
        carddone.dashboard.getDataAttentionList(host, [cardid]).then(function(){
            addTaskCard();
        });
    }
    else {
        addTaskCard();
    }
};

carddone.dashboard.sortAttentionList = function(host){
    host.database.attention_lists.items.sort(function(a, b){
        if (a.a_index == 0) return 1;
        if (b.a_index == 0) return -1;
        if (a.a_index > b.a_index) return 1;
        if (a.a_index < b.a_index) return -1;
        if (a.id > b.id) return 1;
        if (a.id < b.id)  return -1;
        return 0;
    });
};

carddone.dashboard.changeOrderCard = function(host, from, to){
    var item = host.database.attention_lists.items[from];
    host.database.attention_lists.items.splice(from, 1);
    host.database.attention_lists.items.splice(to, 0, item);
    var listSort = [];
    for (var i = 0; i < host.database.attention_lists.items.length; i++){
        host.database.attention_lists.items[i].a_index = i + 1;
        listSort.push({
            id: host.database.attention_lists.items[i].id,
            a_index: i + 1
        });
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "dashboard_order_attention_lists.php",
        params: [{name: "listSort", value: EncodingClass.string.fromVariable(listSort)}],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    dbcache.refresh("attention_lists");
                }
                else {
                    ModalElement.alert({message: message});
                }
            }
            else {
                ModalElement.alert({message: message});
            }
        }
    });
};

carddone.dashboard.getTaskCardElt = function(host, cardid){
    var cIndex = host.database.cards.getIndex(cardid);
    if (cIndex < 0) return null;
    var qmenuCard = {
        props: {
            items: [
                {
                    text: LanguageModule.text("txt_open"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: ["mdi", "mdi-file-edit-outline"]
                    },
                    cmd: function(){
                        carddone.cards.openCard(host, cardid);
                    }
                },
                {
                    text: LanguageModule.text("txt_unpin"),
                    extendClasses: "bsc-quickmenu red",
                    icon: {
                        tag: "i",
                        class: ["mdi", "mdi-pin-off", "mdi-rotate-45"]
                    },
                    cmd: function(){
                        carddone.dashboard.unpinCard(host, cardid);
                    }
                }
            ]
        },
        onSelect: function(item){
            item.cmd();
        }
    };
    var card = absol._({
        tag: 'taskcard',
        id: "card_" + host.database.cards.items[cIndex].id,
        style: {
            margin: "5px"
        },
        props: {
            title: host.database.cards.items[cIndex].name,
            quickmenu: qmenuCard
        },
        on: {
            dblclick: function (event) {
                if (absol.EventEmitter.hitElement(this.$contextBtn, event)){
                    return;
                }
                carddone.cards.openCard(host, cardid);
            }
        },
        child: {
            style: {
                fontSize: "12px"
            },
            child: [
                {
                    text: host.database.cards.items[cIndex].company_contactName
                },
                {
                    style: {
                        textAlign: "right"
                    },
                    child:{text: contentModule.getUsernameByhomeidFromDataModule(host.database.cards.items[cIndex].userid)}
                }
            ]
        }
    });
    return card;
};

carddone.dashboard.createWidgetAttentionList = function(host, type){
    if (!host.widgetCardAttentionCtn){
        var quickMenuItems = [
            {
                text: LanguageModule.text("txt_unpin_all_cards"),
                extendClasses: "bsc-quickmenu red",
                icon: {
                    tag: "i",
                    class: ["mdi", "mdi-pin-off", "mdi-rotate-45"]
                },
                cmd: function(){
                    carddone.dashboard.unpinCard(host, 0);
                }
            }
        ];
        var position = host.data_container.findAvailableNewRect(15, 20);
        var position = host.data_container.findAvailableNewRect(15, 20);
        var gridX = position.x, gridY = position.y, gridHeight = 20, gridWidth = 15;
        if (host.positionDashboard["attention_card"] !== undefined){
            gridX = host.positionDashboard["attention_card"].x;
            gridY = host.positionDashboard["attention_card"].y;
            gridHeight = host.positionDashboard["attention_card"].height;
            gridWidth = host.positionDashboard["attention_card"].width;
        }
        host.widgetCardAttention = absol.buildDom({
            tag: "boardtable",
            on:{
                orderchange: function(event){
                    carddone.dashboard.changeOrderCard(host, event.from, event.to);
                }
            }
        });
        host.widgetCardAttentionCtn = absol.buildDom({
            tag: "dbwidget",
            id: "attention_card",
            props: {
                title: LanguageModule.text("txt_attention"),
                quickmenu: {
                    props: {
                        items: quickMenuItems
                    },
                    onSelect: function(item){
                        item.cmd();
                    }
                },
                gridX: gridX,
                gridY: gridY,
                gridHeight: gridHeight,
                gridWidth: gridWidth
            },
            child: host.widgetCardAttention
        });
        host.data_container.appendChild(host.widgetCardAttentionCtn);
        if (type !== undefined){
            carddone.changePositionList(host);
        }
    }
};

carddone.dashboard.drawAttentionLists = function(host){
    carddone.dashboard.createWidgetAttentionList(host);
    carddone.dashboard.sortAttentionList(host);
    var cardsDic = contentModule.makeDictionaryIndex(host.database.cards.items);
    for (var i = 0; i < host.database.attention_lists.items.length; i++){
        var card = carddone.dashboard.getTaskCardElt(host, host.database.attention_lists.items[i].listid);
        if (card !== null){
            host.widgetCardAttention.addChild(card);
        }
    }
};

carddone.dashboard.getDataAttentionList = function(host, cardIds){
    return new Promise(function(rsFunc, rjFunc){
        var cardIdDic = {};
        for (var i = 0; i < cardIds.length; i++){
            cardIdDic[cardIds[i]] = true;
        }
        var promiseList = {};
        var listIdDic = {};
        promiseList.cards = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "lists",
                cond: function(record){
                    return record.type == "card" && cardIdDic[record.id];
                },
                callback: function(retval){
                    var cards = EncodingClass.string.duplicate(retval);
                    for (var i = 0; i < cards.length; i++){
                        if (host.database.cards.getIndex(cards[i].id) < 0){
                            cards[i].archived = false;
                            host.database.cards.items.push(cards[i]);
                            host.cardsIds.push(cards[i].id);
                        }
                        listIdDic[cards[i].parentid] = true;
                    }
                    absol.log("1", host.database.cards.items);
                    resolve();
                }
            });
        });
        promiseList.cards_archived = data_module.loadByConditionAsync({
            name: "archived_lists",
            cond: function(record){
                return record.type == "card" && cardIdDic[record.id];
            },
            callback: function(retval){
                var cards = EncodingClass.string.duplicate(retval);
                // absol.log("2", cards);
                var cIndex, links;

                for (var i = 0; i < cards.length; i++){
                    if (host.database.cards.getIndex(cards[i].id) < 0){
                        cards[i].archived = true;
                        host.database.cards.items.push(cards[i]);
                        host.cardsIds.push(cards[i].id);
                        links = EncodingClass.string.toVariable(cards[i].links);
                        if (links.company_card !== undefined){
                            host.database.company_card.items = host.database.company_card.items.concat(links.company_card);
                        }
                        if (links.contact_card !== undefined){
                            host.database.contact_card.items = host.database.contact_card.items.concat(links.contact_card);
                        }
                    }
                    listIdDic[cards[i].parentid] = true;
                }
            }
        });
        Promise.all([promiseList.cards, promiseList.cards_archived]).then(function(){
            var list2IdDic = {};
            promiseList.list1 = data_module.loadByConditionAsync({
                name: "lists",
                cond: function(record){
                    return record.type == "list" && listIdDic[record.id];
                },
                callback: function(retval){
                    var lists = EncodingClass.string.duplicate(retval);
                    //absol.log("3", lists);
                    for (var i = 0; i < lists.length; i++){
                        if (host.database.lists.getIndex(lists[i].id) < 0){
                            lists[i].archived = false;
                            host.database.lists.items.push(lists[i]);
                        }
                        list2IdDic[lists[i].parentid] = true;
                    }
                }
            });
            promiseList.list1_archived = data_module.loadByConditionAsync({
                name: "archived_lists",
                cond: function(record){
                    return record.type == "list" && listIdDic[record.id];
                },
                callback: function(retval){
                    var lists = EncodingClass.string.duplicate(retval);
                    //absol.log("4", lists);
                    var cIndex;
                    for (var i = 0; i < lists.length; i++){
                        cIndex = host.database.lists.getIndex(lists[i].id);
                        if (cIndex < 0){
                            lists[i].archived = true;
                            host.database.lists.items.push(lists[i]);
                            list2IdDic[lists[i].parentid] = true;
                        }
                    }
                }
            });
            cardIdDic = contentModule.makeDictionaryIndex(host.database.cards.items);
            promiseList.company_card = data_module.loadByConditionAsync({
                name: "company_card",
                cond: function(record){
                    return cardIdDic[record.hostid] >= 0;
                },
                callback: function(retval){
                    //absol.log("5");
                    host.database.company_card.items = host.database.company_card.items.concat(EncodingClass.string.duplicate(retval));
                }
            });
            promiseList.contact_card = data_module.loadByConditionAsync({
                name: "contact_card",
                cond: function(record){
                    return cardIdDic[record.hostid] >= 0;
                },
                callback: function(retval){
                    //absol.log("6");
                    host.database.contact_card.items = host.database.contact_card.items.concat(EncodingClass.string.duplicate(retval));
                }
            });
            Promise.all([promiseList.list1, promiseList.list1_archived, promiseList.company_card, promiseList.contact_card]).then(function(){
                promiseList.list2 = data_module.loadByConditionAsync({
                    name: "lists",
                    cond: function(record){
                        return record.type == "list" && list2IdDic[record.id];
                    },
                    callback: function(retval){
                        var lists = EncodingClass.string.duplicate(retval);
                        //absol.log("7", lists);
                        for (var i = 0; i < lists.length; i++){
                            if (host.database.lists.getIndex(lists[i].id) < 0){
                                lists[i].archived = false;
                                host.database.lists.items.push(lists[i]);
                            }
                        }
                    }
                });
                promiseList.list2_archived = data_module.loadByConditionAsync({
                    name: "archived_lists",
                    cond: function(record){
                        return record.type == "list" && list2IdDic[record.id];
                    },
                    callback: function(retval){
                        var lists = EncodingClass.string.duplicate(retval);
                        //absol.log("8", lists);
                        var cIndex;
                        for (var i = 0; i < lists.length; i++){
                            if (host.database.lists.getIndex(lists[i].id) < 0){
                                lists[i].archived = true;
                                host.database.lists.items.push(lists[i]);
                            }
                        }
                    }
                });
                promiseList.companies = data_module.loadByConditionAsync({
                    name: "company",
                    cond: function(record){
                        return true;
                    },
                    callback: function(retval){
                        //absol.log(9);
                        host.database.companies.items = EncodingClass.string.duplicate(retval);
                    }
                });
                promiseList.contact = data_module.loadByConditionAsync({
                    name: "contact",
                    cond: function(record){
                        return true;
                    },
                    callback: function(retval){
                        //absol.log(10);
                        host.database.contact.items = EncodingClass.string.duplicate(retval);
                    }
                });
                promiseList.owner_company_contact = data_module.loadByConditionAsync({
                    name: "owner_company_contact",
                    cond: function(record){
                        return true;
                    },
                    callback: function(retval){
                        //absol.log(11);
                        host.database.owner_company_contact = data_module.makeDatabase(retval);
                    }
                });
                Promise.all([promiseList.list2, promiseList.list2_archived, promiseList.companies, promiseList.contact, promiseList.owner_company_contact]).then(function(){
                    contentModule.makeOwnerCompanyContactThanhYen(host);
                    contentModule.makeActivitiesCardIndexThanhYen(host);
                    absol.log("12", host.database.cards.items);
                    rsFunc();
                });
            });
        });
    });
};

carddone.dashboard.preDrawAttentionLists = function(host){
    if (host.database.attention_lists.items.length == 0) return;
    var cardIds = [];
    for (var i = 0; i < host.database.attention_lists.items.length; i++){
        cardIds.push(host.database.attention_lists.items[i].listid);
    }
    carddone.dashboard.getDataAttentionList(host, cardIds).then(function(){
        carddone.dashboard.drawAttentionLists(host);
    });
};

carddone.dashboard.waitData = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.dashboard.waitData(host);
        }, 50);
        return;
    }
    carddone.dashboard.predrawChart(host);
    carddone.dashboard.preDrawAttentionLists(host);
};

carddone.dashboard.redraw = function(host){
    var st = {
        objects: [],
        lists: [],
        cards: [],
        user_calendar: [],
        company_card: [],
        contact_card: [],
        companies: [],
        contact: []
    };
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
    var promiseList = {};
    promiseList.list_member = data_module.loadByConditionAsync({
        name: "list_member",
        cond: function(record){
            return record.userid == systemconfig.userid;
        },
        callback: function(retval){
            host.database.list_member = data_module.makeDatabase(retval);
        }
    });
    promiseList.boards = promiseList.list_member.then(function(){
        var dic = {};
        for (var i = 0; i < host.database.list_member.items.length; i++){
            dic[host.database.list_member.items[i].listid] = true;
        }
        return data_module.loadByConditionAsync({
            name: "lists",
            cond: function(record){
                return dic[record.id];
            },
            callback: function(retval){
                host.database.boards = data_module.makeDatabase(retval);
            }
        });
    });
    promiseList.dashboard = data_module.loadByConditionAsync({
        name: "dashboard",
        cond: function(record){
            return record.userid == systemconfig.userid;
        },
        callback: function(retval){
            host.database.dashboard = data_module.makeDatabase(retval);
            host.user_calendarDic = [];
            if (retval.length > 0){
                host.dataDashboard = EncodingClass.string.toVariable(retval[0].content);
                if (retval[0].position == ""){
                    host.positionDashboard = {};
                }
                else {
                    host.positionDashboard = JSON.parse(retval[0].position);
                }
            }
            else {
                host.dataDashboard = [];
            }
        }
    });
    promiseList.attention_lists = data_module.loadByConditionAsync({
        name: "attention_lists",
        cond: function(record){
            return record.userid == systemconfig.userid;
        },
        callback: function(retval){
            host.database.attention_lists = data_module.makeDatabase(retval);
        }
    });
    promiseList.account_groups = data_module.loadByConditionAsync({
        name: "account_groups",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.account_groups = data_module.makeDatabase(retval);
        }
    });
    promiseList.privilege_groups = data_module.loadByConditionAsync({
        name: "privilege_groups",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.privilege_groups = data_module.makeDatabase(retval);
        }
    });
    promiseList.privilege_group_details = data_module.loadByConditionAsync({
        name: "privilege_group_details",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.privilege_group_details = data_module.makeDatabase(retval);
        }
    });
    Promise.all([
        promiseList.boards,
        promiseList.dashboard,
        promiseList.attention_lists,
        promiseList.account_groups,
        promiseList.privilege_groups,
        promiseList.privilege_group_details
    ]).then(function(){
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makePriviledgeOfUserGroups(host);
        host.buttonAdd.style.visibility = "visible";
        carddone.dashboard.waitData(host);
    });
};

carddone.changePositionList = function(host){
    FormClass.api_call({
        url: "dashboard_update_position.php",
        params: [
            {name: "data", value: EncodingClass.string.fromVariable({
                position: JSON.stringify(host.data_container.getPositionList())
            })}
        ],
        func: function(success, message){
            console.log(success, message);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    dbcache.refresh("dashboard");
                }
            }
        }
    });
};

carddone.dashboard.init = function(host){
    var cmdbutton = {
        add: function () {
            carddone.dashboard.addNew(host, "");
        }
    };
    host.data_container = absol.buildDom({
        tag: "dbgridster",
        style: {
            width: "100%",
            height: "100%"
        },
        props: {
            nRow: 35,
            nCol: 60
        },
        on: {
            positionlistchange: function(event){
                carddone.changePositionList(host);
            }
        }
    });
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formDashboardInit({
        cmdbutton: cmdbutton,
        data_container: host.data_container
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    host.buttonAdd = singlePage.buttonAdd;
    host.cardsIds = [];
    host.objectsIds = [];
    carddone.dashboard.redraw(host);
};
