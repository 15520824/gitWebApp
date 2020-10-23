
carddone.activities.deleteActivity = function(host, content, activity){
    return new Promise(function(resolve, reject){
        var x = activity.indexOf("List");
        var type_activity = activity.substr(0, x);
        if (type_activity == "check_list") type_activity = "checklist";
        var data = carddone.cards.prepareDataDeleteActivity(host, content.cardid, content.objid, type_activity);
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_activities_delete.php",
            params: [
                {value: content.cardid, name: "cardid"},
                {value: content.objid, name: "id"},
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "type_activity", value: type_activity}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        for (var i = 0; i < host.database.user_calendar.items.length; i++){
                            for (var j = host.database.user_calendar.items[i].content.length - 1; j >= 0; j--){
                                if (host.database.user_calendar.items[i].content[j].objid == content.objid) host.database.user_calendar.items[i].content.splice(j, 1);
                            }
                        }
                        host.frameList.removeLast();
                        carddone.activities.redrawDetails(host);
                        resolve();
                        dbcache.refresh("values");
                        dbcache.refresh("objects");
                        dbcache.refresh("user_calendar");
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

carddone.activities.editActivitiesSave = function(host, content, typeid, value, activity, mode){
    return new Promise(function(resolve, reject){
        var data = carddone.cards.prepareDataEditActivitiesSave(host, content.boardid, content.cardid, content.objid, typeid, value, activity, mode);
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_activities_edit_save.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: 'cardid', value: content.cardid}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var contentData = EncodingClass.string.toVariable(message.substr(2));
                        for (var i = 0; i < host.database.user_calendar.items.length; i++){
                            for (var j = host.database.user_calendar.items[i].content.length - 1; j >= 0; j--){
                                if (host.database.user_calendar.items[i].content[j].objid == content.objid) host.database.user_calendar.items[i].content.splice(j, 1);
                            }
                        }
                        var updateCalendarUser = function(year, month, dataLog, objid, userid){
                            var k = false;
                            for (var i = 0; i < host.database.user_calendar.items.length; i++){
                                if (host.database.user_calendar.items[i].userid != userid) continue;
                                if (host.database.user_calendar.items[i].month == month && host.database.user_calendar.items[i].year == year){
                                    k = true;
                                    dataLog.objid = objid;
                                    host.database.user_calendar.items[i].content.push(dataLog);
                                    break;
                                }
                            }
                            if (!k){
                                host.database.user_calendar.items.push({
                                    userid: userid,
                                    month: month,
                                    year: year,
                                    content: [dataLog],
                                    ver: 1
                                });
                            }
                        };

                        function preUpdateCalendarUser(data){
                            if (data.type == "checklist"){
                                for (var i = 0; i < data.dataCalNew.length; i++){
                                    if (host.userIds.indexOf(data.dataCalNew[i].userid) < 0) continue;
                                    updateCalendarUser(data.dataCalNew[i].year, data.dataCalNew[i].month, data.dataCalNew[i].content, data.id, data.dataCalNew[i].userid);
                                }
                            }
                            else {
                                for (var j = 0; j < data.dataCal.length; j++){
                                    for (var i = 0; i < data.listUserCalNew.length; i++){
                                        if (host.userIds.indexOf(data.listUserCalNew[i]) < 0) continue;
                                        updateCalendarUser(data.dataCal[j].year, data.dataCal[j].month, data.dataCal[j].content, data.id, data.listUserCalNew[i]);
                                    }
                                }
                            }
                        };
                        preUpdateCalendarUser(data);
                        if (mode == 0){
                            var index = host.database.objects.getIndex(content.objid);
                            contentData.object.createdtime = host.database.objects.items[index].createdtime;
                            contentData.object.userid = host.database.objects.items[index].userid;
                            host.database.objects.items[index] = contentData.object;
                            host.database.values.items = host.database.values.items.filter(function(elt){
                                return contentData.listvalueiddel.indexOf(elt.id) == -1;
                            });
                            contentData.values.forEach(function(elt){
                                var index = host.database.values.getIndex(elt.id);
                                if (index == -1) host.database.values.items.push(elt);
                                else host.database.values.items[index] = elt;
                            });
                            carddone.activities.redrawDetails(host);
                            switch (content.type) {
                                case "task":
                                    carddone.activities.editTaskFunc(host, content);
                                    break;
                                case "call":
                                    carddone.activities.editCallFunc(host, content);
                                    break;
                                case "meeting":
                                    carddone.activities.editMeetingFunc(host, content);
                                    break;
                                case "checklist":
                                    carddone.activities.editCheckListFunc(host, content);
                                    break;
                                default:

                            }
                        }
                        else {
                            host.frameList.removeLast();
                            carddone.activities.redrawDetails(host);
                        }
                        dbcache.refresh("values");
                        dbcache.refresh("objects");
                        dbcache.refresh("user_calendar");
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

carddone.activities.editTaskFunc = function(host, content){
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -18, value, {name: 'task', list: 'taskList'}, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -18, value, {name: 'task', list: 'taskList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.activities.deleteActivity(host, content, 'taskList').then(function(value){
                resolve(value);
            });
        }
    };
    var bIndex = host.database.boards.getIndex(content.boardid);
    if (bIndex < 0) {
        ModalElement.alert({message: LanguageModule.text("failed_boardid")});
        return;
    }
    var singlePage = theme.cardAddTaskForm({
        id: content.objid,
        cardid: content.cardid,
        users: host.database.users,
        typelists: host.database.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
        companies: host.database.companies,
        company_class: host.database.company_class,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        editMode: content.permission,
        boardArchived: host.database.boards.items[bIndex].archived? 1 : 0,
        cardArchived: content.archivedCard,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: host.database.typelists,
                values: host.database.values,
                nations: host.database.nations,
                cities: host.database.cities,
                users: host.database.users
            },
            funcs: theme,
            listValueId: []
        }),
        editTaskFunc: function(cardid, id){
            carddone.activities.editTaskFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.activities.editCallFunc = function(host, content){
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -22, value, {name: 'call', list: 'callList'}, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -22, value, {name: 'call', list: 'callList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.activities.deleteActivity(host, content, 'callList').then(function(value){
                resolve(value);
            });
        }
    };
    var bIndex = host.database.boards.getIndex(content.boardid);
    if (bIndex < 0) {
        ModalElement.alert({message: LanguageModule.text("failed_boardid")});
        return;
    }
    var bIndex = host.database.boards.getIndex(content.boardid);
    if (bIndex < 0) {
        ModalElement.alert({message: LanguageModule.text("failed_boardid")});
        return;
    }
    var singlePage = theme.cardAddCallForm({
        id: content.objid,
        cardid: content.cardid,
        users: data_module.users,
        typelists: host.database.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
        companies: host.database.companies,
        company_class: host.database.company_class,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        editMode: content.permission,
        boardArchived: host.database.boards.items[bIndex].archived? 1 : 0,
        cardArchived: content.archivedCard,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: host.database.typelists,
                values: host.database.values,
                nations: host.database.nations,
                cities: host.database.cities,
                users: data_module.users
            },
            funcs: theme,
            listValueId: []
        }),
        editCallFunc: function(cardid, id){
            carddone.activities.editCallFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.activities.editMeetingFunc = function(host, content){
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -20, value, {name: 'meeting', list: 'meetingList'}, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -20, value, {name: 'meeting', list: 'meetingList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.activities.deleteActivity(host, content, 'meetingList').then(function(value){
                resolve(value);
            });
        }
    };
    var bIndex = host.database.boards.getIndex(content.boardid);
    if (bIndex < 0) {
        ModalElement.alert({message: LanguageModule.text("failed_boardid")});
        return;
    }
    var singlePage = theme.cardAddMeetingForm({
        id: content.objid,
        cardid: content.cardid,
        users: data_module.users,
        typelists: host.database.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
        companies: host.database.companies,
        company_class: host.database.company_class,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        editMode: content.permission,
        boardArchived: host.database.boards.items[bIndex].archived? 1 : 0,
        cardArchived: content.archivedCard,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: host.database.typelists,
                values: host.database.values,
                nations: host.database.nations,
                cities: host.database.cities,
                users: data_module.users
            },
            funcs: theme,
            listValueId: []
        }),
        editMeetingFunc: function(cardid, id){
            carddone.activities.editMeetingFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.activities.editCheckListFunc = function(host, content){
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -22, value, {name: 'checklist', list: 'check_listList'}, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    ModalElement.alert({message: "failed"});
                    return;
                }
                carddone.activities.editActivitiesSave(host, content, -22, value, {name: 'checklist', list: 'check_listList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.activities.deleteActivity(host, content, 'check_listList').then(function(value){
                resolve(value);
            });
        }
    };
    var singlePage = theme.cardAddCheckListForm({
        id: content.objid,
        cardid: content.cardid,
        users: data_module.users,
        typelists: host.database.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
        companies: host.database.companies,
        company_class: host.database.company_class,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        editMode: content.permission,
        boardArchived: host.database.boards.items[bIndex].archived? 1 : 0,
        cardArchived: content.archivedCard,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: host.database.typelists,
                values: host.database.values,
                nations: host.database.nations,
                cities: host.database.cities,
                users: data_module.users
            },
            funcs: theme,
            listValueId: []
        }),
        editCheckListFunc: function(cardid, id){
            carddone.activities.editCheckListFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.activities.editActivities = function(host, content){
    return new Promise(function(resolve, reject){
        ModalElement.show_loading();
        dbcache.loadById({
            name: "objects",
            id: content.objid,
            callback: function (retval) {
                if (retval !== undefined){
                    var oIndex = host.database.objects.getIndex(retval.id);
                    if (oIndex < 0){
                        host.database.objects.items.push(retval);
                    }
                    else {
                        host.database.objects.items[oIndex] = retval;
                    }
                    dbcache.loadByCondition({
                        name: "values",
                        cond: function (record) {
                            return true;
                        },
                        callback: function (retval) {
                            ModalElement.close(-1);
                            host.database.values.items = retval;
                            var values = [];
                            var oIndex = host.database.objects.getIndex(content.objid);
                            if (oIndex < 0){
                                console.log("failed");
                                ModalElement.alert({message: "failed_1"});
                                return;
                            }
                            var valueid = host.database.objects.items[oIndex].valueid;
                            var valueIndex = host.database.values.getIndex(valueid);
                            if (valueIndex < 0){
                                console.log("failed");
                                ModalElement.alert({message: "failed_2"});
                                return;
                            }
                            values.push(host.database.values.items[valueIndex]);
                            var x = host.database.values.items[valueIndex].descendantid.split("_");
                            var descendantids = [];
                            for (var i = 0; i < x.length; i++){
                                if (x[i] == "") continue;
                                descendantids.push(parseInt(x[i], 10));
                            }
                            for (var i = 0; i < host.database.values.items.length; i++){
                                if (descendantids.indexOf(host.database.values.items[i].id) >= 0){
                                    values.push(host.database.values.items[i]);
                                }
                            }
                            host.database.values.items = values;
                            switch (content.type) {
                                case "task":
                                    carddone.activities.editTaskFunc(host, content);
                                    break;
                                case "call":
                                    carddone.activities.editCallFunc(host, content);
                                    break;
                                case "meeting":
                                    carddone.activities.editMeetingFunc(host, content);
                                    break;
                                case "checklist":
                                    carddone.activities.editCheckListFunc(host, content);
                                    break;
                                default:

                            }
                        }
                    });
                }
                else {
                    ModalElement.alert({
                        message: "Tác vụ đã bị xóa."
                    });
                }
            }
        });
    });
};

carddone.activities.openCard = function(host, content){
    console.log(content);
    carddone.menu.loadPage(11, content);
};

carddone.activities.getImportantName = function(important){
    switch (important) {
        case 0:
            return LanguageModule.text("txt_normal");
            break;
        case 1:
            return LanguageModule.text("txt_low");
            break;
        case 2:
            return LanguageModule.text("txt_high");
            break;

    }
};

carddone.activities.getRowData = function(host, content){
    var cardIndex = host.cardsDic[content.cardid];
    if (cardIndex === undefined) return null;
    content.listid = host.database.cards.items[cardIndex].parentid;
    var listIndex = host.listsDic[content.listid];
    if (listIndex === undefined || listIndex < 0) return null;
    var listid2 = host.database.lists.items[listIndex].parentid;
    var listIndex2 = host.listsDic[listid2];
    if (listIndex2 === undefined || listIndex2 < 0) return null;
    content.boardid = host.database.lists.items[listIndex2].parentid;
    if (host.boardIds.indexOf(0) < 0) if (host.boardIds.indexOf(content.boardid) < 0) return null;
    var boardIndex = host.boardsDic[content.boardid];
    if (boardIndex === undefined) return null;
    content.cardName = host.database.cards.items[cardIndex].name;
    content.boardName = host.database.boards.items[boardIndex].name;
    content.archivedCard = host.database.cards.items[cardIndex].archived;
    var res = {
        exp: content.exp,
        status: content.status,
        activityName: content.nameActivity,
        company_contactName: host.database.cards.items[cardIndex].company_contactName,
        cardName: host.database.cards.items[cardIndex].name,
        important: carddone.activities.getImportantName(host.database.cards.items[cardIndex].favorite),
        boardName: host.database.boards.items[boardIndex].name,
        listName: host.database.lists.items[listIndex].name,
        type: content.type,
        assigned_to: contentModule.getFullnameByhomeid2(data_module.users, content.assigned_to),
        userFullName: contentModule.getFullnameByhomeid2(data_module.users, content.userid),
        permission: content.permission,
        archived: host.database.cards.items[cardIndex].archived,
        func: {
            edit: function(){
                return new Promise(function(resolve, reject){
                    carddone.activities.editActivities(host, content).then(function(value){
                        resolve(value);
                    });
                });
            },
            openCard: function(){
                return carddone.activities.openCard(host, content);
            }
        }
    };
    if (content.type == "meeting"){
        res.time = content.timeend;
    }
    else {
        res.time = content.time;
    }
    return res;
};

carddone.activities.getDataByStatus = function(host, status){
    var data = [];
    switch (status) {
        case "all":
            data = host.data;
            break;
        case "plan":
            for (var i = 0; i < host.data.length; i++){
                if (host.data[i].status) continue;
                if (host.data[i].exp) continue;
                data.push(host.data[i]);
            }
            break;
        case "overdue":
            for (var i = 0; i < host.data.length; i++){
                if (host.data[i].status) continue;
                if (host.data[i].exp) data.push(host.data[i]);
            }
            break;
        case "finish":
            for (var i = 0; i < host.data.length; i++){
                if (host.data[i].status) data.push(host.data[i]);
            }
            break;
    }
    return data;
};

carddone.activities.changeStatus = function(host){
    var status = host.status_select.value;
    var data = carddone.activities.getDataByStatus(host, status);
    ModalElement.close(-1);
    // console.log(7, new Date().getTime());
    DOMElement.removeAllChildren(host.data_table_container);
    host.dataView = host.funcs.formActivitiesContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_table_container.appendChild(host.dataView);
    // console.log(8, new Date().getTime());
};

carddone.activities.saveChart = function(host, data){
    return new Promise(function(resolve, reject){
        data.id = (new Date()).getTime();
        var typeSave = "new";
        ModalElement.show_loading();
        FormClass.api_call({
            url: "dashboard_save.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "typeSave", value: typeSave}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        if (carddone.dashBoardTab !== undefined){
                            carddone.dashboard.drawChart(carddone.dashBoardTab, data).then(function(chart){
                                carddone.dashBoardTab.dataDashboard.push(data);
                                carddone.dashBoardTab.data_container.appendChild(chart);
                            });
                        }
                        resolve(data);
                        ModalElement.alert({message: LanguageModule.text("war_txt_pinned_to_dashboard")});
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
        });
    });
};

carddone.activities.pinToDashboard = function(host, typeChart, timestart, timeend){
    var data = {id: 0};
    data.userValue = host.userIds;
    data.boardValue = host.boardIds;
    data.periodValue = 0;
    data.chartValue = typeChart;
    data.time_option_start = timestart;
    data.time_option_end = timeend;
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
            return carddone.activities.saveChart(host, data);
        }
    };
    theme.formDashboardEdit({
        frameList: host.frameList,
        cmdbutton: cmdbutton,
        data: data
    });
};

carddone.activities.getDataActivityView = function(host, timestart, timeend){
    var listCalendarContent = [];
    for (var i = 0; i < host.database.user_calendar.items.length; i++){
        if (host.database.user_calendar.items[i].timeend.getTime() < timestart.getTime()) continue;
        if (host.database.user_calendar.items[i].timestart.getTime() > timeend.getTime()) continue;
        host.database.user_calendar.items[i].content.forEach(function(elt, index){
            host.database.user_calendar.items[i].content[index].userid = host.database.user_calendar.items[i].userid;
        });
        listCalendarContent = listCalendarContent.concat(host.database.user_calendar.items[i].content);
    }
    var dataDraw = [], cardIndex, objIndex, nowTime = (new Date()).getTime();
    host.cardsDic = contentModule.makeDictionaryIndex(host.database.cards.items);
    host.boardsDic = contentModule.makeDictionaryIndex(host.database.boards.items);
    host.listsDic = contentModule.makeDictionaryIndex(host.database.lists.items);
    host.objectsDic = contentModule.makeDictionaryIndex(host.database.objects.items);
    for (var i = 0; i < listCalendarContent.length; i++){
        if (listCalendarContent[i].type == "meeting"){
            if (
                (listCalendarContent[i].timestart.getTime() > timeend.getTime() || listCalendarContent[i].timestart.getTime() < timestart.getTime()) &&
                (listCalendarContent[i].timeend.getTime() > timeend.getTime() || listCalendarContent[i].timeend.getTime() < timestart.getTime())
            ) continue;
            listCalendarContent[i].exp = listCalendarContent[i].timeend.getTime() < nowTime;
        }
        else {
            if (listCalendarContent[i].time.getTime() > timeend.getTime() || listCalendarContent[i].time.getTime() < timestart.getTime()) continue;
            listCalendarContent[i].exp = listCalendarContent[i].time.getTime() < nowTime;
        }
        cardIndex = host.cardsDic[listCalendarContent[i].cardid];
        if (cardIndex === undefined){
            // console.log(listCalendarContent[i]);
            continue;
        }
        objIndex = host.objectsDic[listCalendarContent[i].objid];
        if (objIndex === undefined){
            // console.log(listCalendarContent[i]);
            continue;
        }
        if (host.database.cards.items[cardIndex].permission != "no") {
            listCalendarContent[i].permission = host.database.cards.items[cardIndex].permission;
            dataDraw.push(listCalendarContent[i]);
        }
    }
    dataDraw.sort(function(a, b){
        var t1, t2;
        if (a.type == "meeting") t1 = a.timeend;
        else t1 = a.time;
        if (b.type == "meeting") t2 = b.timeend;
        else t2 = b.time;
        return t1.getTime() - t2.getTime();
    });
    host.data = [];
    var cell;
    for (var i = 0; i < dataDraw.length; i++){
        cell = carddone.activities.getRowData(host, dataDraw[i]);
        if (cell == null) continue;
        host.data.push(cell);
    }
    var dataExp = [], dataFinish = [], dataAvailable = [];
    for (var i = 0; i < host.data.length; i++){
        if (host.data[i].status) dataFinish.push(host.data[i]);
        else if (host.data[i].exp) dataExp.push(host.data[i]);
        else dataAvailable.push(host.data[i]);
    }
    var chart_container;
    if (host.data.length > 0){
        var piechart = absol._({
            tag: 'piechart',
            style: {
                width: "300px",
                height: "300px",
                maxWidth: "80vw"
            },
            props: {
                title: LanguageModule.text("txt_activity_status"),
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
        var columnchart = vchart._({
            tag: 'columnchart',
            props: {
                title: LanguageModule.text("txt_count_activity_overdue"),
                integerOnly: true,
                valueName: '',
                keyName: LanguageModule.text("txt_date"),
                canvasWidth: 300,
                canvasHeight: 300,
                zeroOY: true,
                rotateText: false,
                columnWidth: 30,
                keys: ["≥5", "4", "3", "2", "1"],
                columnColors: ["#ff0000", "#c50805", "#920a07", "#670908", "440808"],
                values: listValuesExp,
                colName: '',
                showInlineValue: true
            }
        });
        var qmenuButtonPie = DOMElement.div({
            attrs: {
                className: "card-icon-cover"
            },
            children: [DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-black"
                },
                text: "more_vert"
            })]
        });
        var quickMenuItemsPie = [
            {
                text: LanguageModule.text("txt_pin_to_dashboard"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: ["mdi", "mdi-pin", "mdi-rotate-45"]
                },
                cmd: function(){
                    carddone.activities.pinToDashboard(host, "activity_status", timestart, timeend);
                }
            }
        ];

        absol.QuickMenu.showWhenClick(qmenuButtonPie, {items: quickMenuItemsPie}, [3, 4], function (menuItem) {
            if (menuItem.cmd) menuItem.cmd();
        });
        var qmenuButtonCol = DOMElement.div({
            attrs: {
                className: "card-icon-cover"
            },
            children: [DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-black"
                },
                text: "more_vert"
            })]
        });
        var quickMenuItemsCol = [
            {
                text: LanguageModule.text("txt_pin_to_dashboard"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: ["mdi", "mdi-pin", "mdi-rotate-45"]
                },
                cmd: function(){
                    carddone.activities.pinToDashboard(host, "count_activity_overdue", timestart, timeend);
                }
            }
        ];

        absol.QuickMenu.showWhenClick(qmenuButtonCol, {items: quickMenuItemsCol}, [3, 4], function (menuItem) {
            if (menuItem.cmd) menuItem.cmd();
        });
        chart_container = DOMElement.div({
            attrs: {
                style: {
                    paddingBottom: "var(--control-verticle-distance-2)"
                }
            },
            children: [
                DOMElement.div({
                    attrs: {
                        className: "card-activity-chart-ctn",
                        style: {
                            paddingTop: "var(--control-verticle-distance-1)"
                        }
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-activity-chart-quickmenu-ctn",
                                style: {
                                    display: (carddone.isMobile)? "none" : ""
                                }
                            },
                            children: [
                                qmenuButtonPie
                            ]
                        }),
                        piechart
                    ]
                }),
                DOMElement.div({
                    attrs: {
                        className: "card-activity-chart-ctn",
                        style: {
                            paddingTop: "var(--control-verticle-distance-1)"
                        }
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-activity-chart-quickmenu-ctn",
                                style: {
                                    display: (carddone.isMobile)? "none" : ""
                                }
                            },
                            children: [
                                qmenuButtonCol
                            ]
                        }),
                        columnchart
                    ]
                })
            ]
        });
    }
    return {
        chart_container: chart_container
    };
};

carddone.activities.redrawDetails = function(host){
    var timestart = host.timestart_input.value;
    timestart = new Date(timestart.setHours(0,0,0,0));
    var timeend = host.timeend_input.value;
    timeend = new Date(timeend.setHours(23, 59, 59, 999));
    if (timestart.getTime() > timeend.getTime()){
        DOMElement.removeAllChildren(host.data_container);
        return;
    }
    host.boardIds = host.boards_select.values;
    DOMElement.removeAllChildren(host.data_container);
    var res = carddone.activities.getDataActivityView(host, timestart, timeend);
    if (res.chart_container !== undefined) host.data_container.appendChild(res.chart_container);
    host.data_table_container = DOMElement.div({});
    host.data_container.appendChild(host.data_table_container);
    // console.log(6, new Date().getTime());
    carddone.activities.changeStatus(host);
};

carddone.activities.redraw = function(host){
    // console.log(1, new Date().getTime());
    host.userIds = host.users_select.values;
    var userIds = host.userIds;
    if (host.userIds.indexOf(0) >= 0){
        userIds = [];
        for (var i = 0; i < data_module.users.items.length; i++){
            userIds.push(data_module.users.items[i].homeid);
        }
    }
    dbcache.loadByCondition({
        name: "user_calendar",
        cond: function (record) {
            return userIds.indexOf(record.userid) >= 0;
        },
        callback: function (retval) {
            host.cardsIds = [];
            host.objectsIds = [];
            host.database.user_calendar.items = EncodingClass.string.duplicate(retval);
            contentModule.makeUserCalendarContent(host);
            var cardids = [], cardid, objids = [], objid;
            for (var i = 0; i < host.database.user_calendar.items.length; i++){
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
            if (cardids.length > 0){
                carddone.activities.loadCards(host, cardids, objids).then(function(){
                    carddone.activities.redrawDetails(host);
                });
            }
            else {
                carddone.activities.redrawDetails(host);
            }
        }
    });
};

carddone.activities.loadCards = function(host, cardids, objids){
    return new Promise(function(rs, rj){
        // console.log(2, new Date().getTime());
        host.database.cards.sync = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "lists",
                cond: function (record) {
                    return cardids.indexOf(record.id) >= 0 && record.type == 'card';
                },
                callback: function (retval) {
                    host.database.cards.items = EncodingClass.string.duplicate(retval);
                    for (var i = 0; i < host.database.cards.items.length; i++){
                        host.database.cards.items[i].archived = 0;
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
        host.database.objects.sync = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "objects",
                cond: function (record) {
                    return objids.indexOf(record.id) >= 0;
                },
                callback: function (retval) {
                    host.database.objects.items = EncodingClass.string.duplicate(retval);
                    resolve();
                }
            });
        });
        var lists;
        host.database.lists.sync = new Promise(function(resolve, reject){
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
        host.database.company_card.sync = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "company_card",
                cond: function (record) {
                    return cardids.indexOf(record.hostid) >= 0;
                },
                callback: function (retval) {
                    host.database.company_card.items = EncodingClass.string.duplicate(retval);
                    resolve();
                }
            });
        });
        host.database.contact_card.sync = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "contact_card",
                cond: function (record) {
                    return cardids.indexOf(record.hostid) >= 0;
                },
                callback: function (retval) {
                    host.database.contact_card.items = EncodingClass.string.duplicate(retval);
                    resolve();
                }
            });
        });
        Promise.all([
            host.database.cards.sync,
            host.database.objects.sync,
            host.database.lists.sync,
            host.database.company_card.sync,
            host.database.contact_card.sync,
            listsArchivedPromise,
            cardsArchivedPromise
        ]).then(function(){
            console.log(3, new Date().getTime());
            host.database.cards.items = host.database.cards.items.concat(cardsArchived);
            host.database.lists.items = [];
            var listids = [];
            for (var i = 0; i < host.database.cards.items.length; i++){
                listids.push(host.database.cards.items[i].parentid);
            }
            for (var i = 0; i < lists.length; i++){
                if (listids.indexOf(lists[i].id) >= 0) host.database.lists.items.push(lists[i]);
            }
            for (var i = 0; i < listsArchived.length; i++){
                if (listids.indexOf(listsArchived[i].id) >= 0) {
                    host.database.lists.items.push(listsArchived[i]);
                }
            }
            listids = [];
            for (var i = 0; i < host.database.lists.items.length; i++){
                listids.push(host.database.lists.items[i].parentid);
            }
            for (var i = 0; i < lists.length; i++){
                if (listids.indexOf(lists[i].id) >= 0) host.database.lists.items.push(lists[i]);
            }
            for (var i = 0; i < listsArchived.length; i++){
                if (listids.indexOf(listsArchived[i].id) >= 0) {
                    // console.log(listsArchived[i]);
                    host.database.lists.items.push(listsArchived[i]);
                }
            }
            // console.log(4, new Date().getTime());
            contentModule.makeActivitiesCardIndexThanhYen(host);
            contentModule.makeCompanyCardIndex(host);
            // console.log(5, new Date().getTime());
            rs();
        });
    });
};

carddone.activities.init2 = function(host){
    var st = {
        nations: [],
        cities: [],
        districts: [],
        company_class: [],
        companies: [],
        contact: [],
        owner_company_contact: [],
        typelists: [],
        list_member: [],
        boards: [],
        lists: [],
        cards: [],
        objects: [],
        values: [],
        company_card: [],
        contact_card: [],
        user_calendar: [],
        company_class_member: [],
        account_groups: [],
        privilege_groups: [],
        privilege_group_details: []
    }
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
    host.database.owner_company_contact.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "owner_company_contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.owner_company_contact.items = retval;
                resolve();
            }
        });
    });
    host.database.list_member.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "list_member",
            cond: function (record) {
                return record.userid == systemconfig.userid;
            },
            callback: function (retval) {
                host.database.list_member.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.nations.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "nations",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.nations.items = retval;
                resolve();
            }
        });
    });
    host.database.cities.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "cities",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.cities.items = retval;
                resolve();
            }
        });
    });
    host.database.districts.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "districts",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.districts.items = retval;
                resolve();
            }
        });
    });
    host.database.companies.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.companies.items = retval;
                resolve();
            }
        });
    });
    host.database.company_class.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.company_class.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.contact.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.contact.items = retval;
                resolve();
            }
        });
    });
    host.database.typelists.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "typelists",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.typelists.items = EncodingClass.string.duplicate(retval);
                contentModule.makeTypesListContentThanhYen(host);
                resolve();
            }
        });
    });
    host.database.company_class_member.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class_member",
            cond: function (record) {
                return record.userid == systemconfig.userid;
            },
            callback: function (retval) {
                host.database.company_class_member.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.account_groups.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "account_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.account_groups.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.privilege_groups.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "privilege_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_groups.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.privilege_group_details.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "privilege_group_details",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_group_details.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    Promise.all([
        host.database.nations.sync,
        host.database.cities.sync,
        host.database.districts.sync,
        host.database.companies.sync,
        host.database.company_class.sync,
        host.database.contact.sync,
        host.database.owner_company_contact.sync,
        host.database.typelists.sync,
        host.database.list_member.sync,
        host.database.company_class_member.sync,
        host.database.privilege_groups.sync,
        host.database.privilege_group_details.sync,
        host.database.account_groups.sync
    ]).then(function(){
        delete host.database.nations.sync;
        delete host.database.cities.sync;
        delete host.database.districts.sync;
        delete host.database.companies.sync;
        delete host.database.company_class.sync;
        delete host.database.contact.sync;
        delete host.database.typelists.sync;
        delete host.database.owner_company_contact.sync;
        delete host.database.list_member.sync;
        delete host.database.company_class_member.sync;
        delete host.database.privilege_groups.sync;
        delete host.database.privilege_group_details.sync;
        delete host.database.account_groups.sync;
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makeCitiesIndexThanhYen(host);
        contentModule.makeDistrictsIndexThanhYen(host);
        contentModule.makeOwnerCompanyContactThanhYen(host);
        contentModule.makeCompanyIndexThanhYen(host);
        contentModule.makeContactIndexThanhYen(host);
        var boardIDs = [];
        for (var i = 0; i < host.database.list_member.items.length; i++){
            boardIDs.push(host.database.list_member.items[i].listid);
        }
        var boardsPromise = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "lists",
                cond: function (record) {
                    return (record.type == 'board' && boardIDs.indexOf(record.id) >= 0);
                },
                callback: function (retval) {
                    host.database.boards.items = EncodingClass.string.duplicate(retval);
                    for (var i = 0; i < host.database.boards.items.length; i++){
                        host.database.boards.items[i].archived = 0;
                    }
                    resolve();
                }
            });
        });
        var boardsArchive;
        var boardsArchivePromise = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "archived_lists",
                cond: function (record) {
                    return (record.type == 'board' && boardIDs.indexOf(record.id) >= 0);
                },
                callback: function (retval) {
                    boardsArchive = EncodingClass.string.duplicate(retval);
                    for (var i = 0; i < boardsArchive.length; i++){
                        boardsArchive[i].archived = 1;
                    }
                    resolve();
                }
            });
        });
        Promise.all([boardsPromise, boardsArchivePromise]).then(function(){
            host.database.boards.items = host.database.boards.items.concat(boardsArchive);
            ModalElement.close(-1);
            if (host.database.boards.items.length == 0) {
                ModalElement.alert({
                    message: LanguageModule.text("war_txt_nothing_board_privilege")
                });
                return;
            }
            host.inputsearchbox = absol.buildDom({
                tag:'searchcrosstextinput',
                style: {
                    width: "var(--searchbox-width)"
                },
                props:{
                    placeholder: LanguageModule.text("txt_search")
                }
            });
            var cmdbutton = {
                close: function () {
                    if (carddone.isMobile){
                        host.holder.selfRemove();
                        carddone.menu.loadPage(100);
                    }
                    else {
                        carddone.menu.tabPanel.removeTab(host.holder.id);
                    }
                },
                viewReport: function(){
                    ModalElement.show_loading();
                    setTimeout(function(){
                        carddone.activities.redraw(host);
                    }, 50);
                }
            };
            var userItems = [{value: 0, text: LanguageModule.text("txt_all")}];
            for (var i = 0; i < data_module.users.items.length; i++){
                if (data_module.users.items[i].available == 0) continue;
                userItems.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
            }
            host.users_select = absol.buildDom({
                tag: (carddone.isMobile)? "mselectbox" : "selectbox",
                style: {
                    verticalAlign: "middle"
                },
                props: {
                    items: userItems,
                    values: [systemconfig.userid],
                    enableSearch: true
                }
            });
            var boardItems = [{value: 0, text: LanguageModule.text("txt_all")}];
            for (var i = 0; i < host.database.boards.items.length; i++){
                boardItems.push({value: host.database.boards.items[i].id, text: host.database.boards.items[i].name});
            }
            host.boards_select = absol.buildDom({
                tag: (carddone.isMobile)? "mselectbox" : "selectbox",
                style: {
                    verticalAlign: "middle"
                },
                props: {
                    items: boardItems,
                    values: [0],
                    enableSearch: true
                }
            });

            var timestartChangeFunc = function(){
                if (host.timestart_input.value.getTime() > host.timeend_input.value.getTime()){
                    host.timeend_input.value = new Date(host.timestart_input.value.getTime());
                }
            };
            var timeendChangeFunc = function(){
                if (host.timestart_input.value.getTime() > host.timeend_input.value.getTime()){
                    host.timestart_input.value = new Date(host.timeend_input.value.getTime());
                }
            };
            host.timestart_input = absol.buildDom({
                tag: 'calendar-input',
                style: {
                    marginRight: "var(--control-horizontal-distance-1)"
                },
                data: {
                    value: new Date((new Date((new Date()).getTime() - 6 *86400000)).setHours(0,0,0,0))
                },
                on: {
                    change: function(){
                        timestartChangeFunc();
                    }
                }
            });
            host.timeend_input = absol.buildDom({
                tag: 'calendar-input',
                data: {
                    value: new Date((new Date((new Date()).getTime() + 6 *86400000)).setHours(0,0,0,0))
                },
                on: {
                    change: function(){
                        timeendChangeFunc();
                    }
                }
            });
            host.status_select = absol.buildDom({
                tag: "selectmenu",
                props: {
                    value: "all",
                    items: [
                        {value: "all", text: LanguageModule.text("txt_all")},
                        {value: "overdue", text: LanguageModule.text("txt_overdue")},
                        {value: "finish", text: LanguageModule.text("txt_finish")},
                        {value: "plan", text: LanguageModule.text("txt_plan")}
                    ]
                }
            });
            host.data_container = DOMElement.div({attrs: {className: "card-table-init"}});
            host.holder.addChild(host.frameList);
            var singlePage = host.funcs.formActivitiesInit({
                cmdbutton: cmdbutton,
                data_container: host.data_container,
                boards_select: host.boards_select,
                users_select: host.users_select,
                timestart_input: host.timestart_input,
                timeend_input: host.timeend_input,
                status_select: host.status_select,
                frameList: host.frameList,
                inputsearchbox: host.inputsearchbox
            });
            host.frameList.addChild(singlePage);
            singlePage.requestActive();
        });
    });
};

carddone.activities.init = function(host){
    console.log("start__" +(new Date().getTime()));
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.activities.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    carddone.activities.init2(host);
};
ModuleManagerClass.register({
    name: "Activities",
    prerequisites: ["ModalElement", "FormClass"]
});
