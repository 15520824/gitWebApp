
carddone.activities.deleteActivity = function(host, content, activity){
    return new Promise(function(resolve, reject){
        var x = activity.indexOf("List");
        var type_activity = activity.substr(0, x);
        if (type_activity == "check_list") type_activity = "checklist";
        host.database.typelists = data_module.typelists;
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
                        if (data_module.cardList[content.cardid]){
                            if (data_module.cardList[content.cardid].content){
                                data_module.cardList[content.cardid].generateData.activitiesList = data_module.cardList[content.cardid].generateData.activitiesList.filter(function(elt){
                                    return elt != content.objid;
                                });
                                data_module.cardList[content.cardid].generateData[activity] = data_module.cardList[content.cardid].generateData[activity].filter(function(elt){
                                    return elt != content.objid;
                                });
                            }
                        }
                        host.frameList.removeLast();
                        carddone.activities.redrawDetails(host);
                        resolve();
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
        host.database.typelists = data_module.typelists;
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
                        var updateCalendarUser = function(year, month, dataLog, objid){
                            var k = false;
                            for (var i = 0; i < host.database.user_calendar.items.length; i++){
                                if (host.database.user_calendar.items[i].month == month && host.database.user_calendar.items[i].year == year){
                                    k = true;
                                    dataLog.objid = objid;
                                    host.database.user_calendar.items[i].content.push(dataLog);
                                    break;
                                }
                            }
                            if (!k){
                                host.database.user_calendar.items.push({
                                    userid: host.userid,
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
                                    if (data.dataCalNew[i].userid != host.userid) continue;
                                    updateCalendarUser(data.dataCalNew[i].year, data.dataCalNew[i].month, data.dataCalNew[i].content, data.id);
                                }
                            }
                            else {
                                for (var j = 0; j < data.dataCal.length; j++){
                                    for (var i = 0; i < data.listUserCalNew.length; i++){
                                        if (data.listUserCalNew[i] != host.userid) continue;
                                        updateCalendarUser(data.dataCal[j].year, data.dataCal[j].month, data.dataCal[j].content, data.id);
                                    }
                                }
                            }
                        };
                        preUpdateCalendarUser(data);
                        console.log(contentData);
                        if (data_module.cardList[content.cardid]){
                            if (data_module.cardList[content.cardid].content){
                                data_module.cardList[content.cardid].content.values = data_module.cardList[content.cardid].content.values.filter(function(elt){
                                    return contentData.listvalueiddel.indexOf(elt.id) == -1;
                                });
                                contentData.values.forEach(function(elt){
                                    var index = host.database.values.getIndex(elt.id);
                                    if (index == -1) data_module.cardList[content.cardid].content.values.push(elt);
                                });
                                for (var i = 0; i < data_module.cardList[content.cardid].content.objects.length; i++){
                                    if (data_module.cardList[content.cardid].content.objects[i].id == content.objid){
                                        data_module.cardList[content.cardid].content.objects[i] = contentData.object;
                                        break;
                                    }
                                }
                            }
                        }
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
    var singlePage = theme.cardAddTaskForm({
        id: content.objid,
        cardid: content.cardid,
        users: data_module.users,
        typelists: data_module.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: data_module.typelists,
                values: host.database.values,
                nations: data_module.nations,
                cities: data_module.cities,
                users: data_module.users
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
    var singlePage = theme.cardAddCallForm({
        id: content.objid,
        cardid: content.cardid,
        users: data_module.users,
        typelists: data_module.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: data_module.typelists,
                values: host.database.values,
                nations: data_module.nations,
                cities: data_module.cities,
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
    var singlePage = theme.cardAddMeetingForm({
        id: content.objid,
        cardid: content.cardid,
        users: data_module.users,
        typelists: data_module.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: data_module.typelists,
                values: host.database.values,
                nations: data_module.nations,
                cities: data_module.cities,
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
        typelists: data_module.typelists,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: content.boardName,
        cardName: content.cardName,
        userid: systemconfig.userid,
        frameList: host.frameList,
        getObjectbyType: function(host){
            return function(typeid, valueid){
                return contentModule.getObjectbyTypeView(host, typeid, valueid);
            }
        }({
            database: {
                typelists: data_module.typelists,
                values: host.database.values,
                nations: data_module.nations,
                cities: data_module.cities,
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
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "activities_load_object_edit"},
                {name: "objid", value: content.objid}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        contentModule.makeDatabaseContent(host.database, st);
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
                        ModalElement.alert({message: message});
                    }
                }
                else {
                    ModalElement.alert({message: message});
                }
            }
        })
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
    var cardIndex = host.database.cards.getIndex(content.cardid);
    var boardIndex = host.database.boards.getIndex(content.boardid);
    if (cardIndex < 0 || boardIndex < 0) return null;
    var listIndex = host.database.cards.items[cardIndex].listIndex;
    content.listid = host.database.cards.items[cardIndex].parentid;
    content.cardName = host.database.cards.items[cardIndex].name;
    content.boardName = host.database.boards.items[boardIndex].name;
    var res = {
        status: content.status,
        activityName: content.nameActivity,
        company_contactName: host.database.cards.items[cardIndex].company_contactName,
        cardName: host.database.cards.items[cardIndex].name,
        important: carddone.activities.getImportantName(host.database.cards.items[cardIndex].favorite),
        boardName: host.database.boards.items[boardIndex].name,
        listName: host.database.lists.items[listIndex].name,
        type: content.type,
        assigned_to: contentModule.getUsernameByhomeidFromDataModule(content.assigned_to),
        permission: content.permission,
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

carddone.activities.redrawDetails = function(host){
    console.log(host.database);
    ModalElement.close(-1);
    console.log(host.database.user_calendar.items);
    console.log("done__" +(new Date().getTime()));
    var isFinish = host.finish_checkbox.checked;
    var timestart = host.timestart_input.value;
    timestart.setHours(0,0,0,0);
    var timeend = host.timeend_input.value;
    timeend.setHours(23, 59, 59, 999);
    if (timestart.getTime() > timeend.getTime()){
        DOMElement.removeAllChildren(host.data_container);
        return;
    }
    var boardid = host.boards_select.value;
    var listCalendarContent = [];
    for (var i = 0; i < host.database.user_calendar.items.length; i++){
        if (host.database.user_calendar.items[i].timeend.getTime() < timestart.getTime()) continue;
        if (host.database.user_calendar.items[i].timestart.getTime() > timeend.getTime()) continue;
        listCalendarContent = listCalendarContent.concat(host.database.user_calendar.items[i].content);
    }
    var dataDraw = [], cardIndex;
    for (var i = 0; i < listCalendarContent.length; i++){
        if (!isFinish) if (listCalendarContent[i].status) continue;
        if (boardid > 0) if (listCalendarContent[i].boardid != boardid) continue;
        if (listCalendarContent[i].type == "meeting"){
            if (
                (listCalendarContent[i].timestart.getTime() > timeend.getTime() || listCalendarContent[i].timestart.getTime() < timestart.getTime()) &&
                (listCalendarContent[i].timeend.getTime() > timeend.getTime() || listCalendarContent[i].timeend.getTime() < timestart.getTime())
            ) continue;
        }
        else {
            if (listCalendarContent[i].time.getTime() > timeend.getTime() || listCalendarContent[i].time.getTime() < timestart.getTime()) continue;
        }
        cardIndex = host.database.cards.getIndex(listCalendarContent[i].cardid);
        if (cardIndex < 0){
            console.log(listCalendarContent[i]);
            continue;
        }
        if (host.database.cards.items[cardIndex].permission != "no") {
            listCalendarContent[i].permission = host.database.cards.items[cardIndex].permission;
            dataDraw.push(listCalendarContent[i]);
        }
    }
    console.log(dataDraw);
    dataDraw.sort(function(a, b){
        var t1, t2;
        if (a.type == "meeting") t1 = a.timeend;
        else t1 = a.time;
        if (b.type == "meeting") t2 = b.timeend;
        else t2 = b.time;
        return t1.getTime() - t2.getTime();
    });
    var data = [], cell;
    for (var i = 0; i < dataDraw.length; i++){
        cell = carddone.activities.getRowData(host, dataDraw[i]);
        if (cell == null) continue;
        data.push(cell);
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formActivitiesContentData({
        data: data
    });
    host.data_container.appendChild(host.dataView);
};

carddone.activities.preRedrawDetails = function(host){
    if (!host.database.cards) {
        setTimeout(function(){
            carddone.activities.preRedrawDetails(host);
        },50);
        return;
    }
    carddone.activities.redrawDetails(host);
};

carddone.activities.redraw = function(host){
    host.userid = host.users_select.value;
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "load_calendar_by_user"},
            {name: "userid", value: host.userid}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    contentModule.makeDatabaseContent(host.database, content);
                    contentModule.makeUserCalendarContent(host);
                    carddone.activities.preRedrawDetails(host);
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

carddone.activities.loadCards = function(host){
    console.log("loadCards__" +(new Date().getTime()));
    var boards = [];
    for (var i = 0; i < host.database.boards.items.length; i++){
        boards.push(host.database.boards.items[i].id);
    }
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "activities_load_init2"},
            {name: "boards", value: EncodingClass.string.fromVariable(boards)}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    contentModule.makeDatabaseContent(host.database, content);
                    contentModule.makeActivitiesCardIndex(host);
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
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "activities_load_init"}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    host.database = {};
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    contentModule.makeDatabaseContent(host.database, content);
                    carddone.activities.loadCards(host);
                    if (host.database.boards.items.length == 0) {
                        ModalElement.alert({
                            message: LanguageModule.text("war_txt_nothing_board_privilege")
                        });
                        return;
                    }
                    var cmdbutton = {
                        close: function () {
                            if (carddone.isMobile){
                                host.holder.selfRemove();
                                carddone.menu.loadPage(100);
                            }
                            else {
                                carddone.menu.tabPanel.removeTab(host.holder.id);
                            }
                        }
                    };
                    var userItems = [];
                    for (var i = 0; i < data_module.users.items.length; i++){
                        if (data_module.users.items[i].available == 0) continue;
                        userItems.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
                    }
                    host.users_select = absol.buildDom({
                        tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
                        style: {
                            verticalAlign: "middle"
                        },
                        props: {
                            items: userItems,
                            value: systemconfig.userid,
                            enableSearch: true
                        },
                        on: {
                            change: function(){
                                carddone.activities.redraw(host);
                            }
                        }
                    });
                    var boardItems = [{value: 0, text: LanguageModule.text("txt_all")}];
                    for (var i = 0; i < host.database.boards.items.length; i++){
                        boardItems.push({value: host.database.boards.items[i].id, text: host.database.boards.items[i].name});
                    }
                    host.boards_select = absol.buildDom({
                        tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
                        style: {
                            verticalAlign: "middle"
                        },
                        props: {
                            items: boardItems,
                            enableSearch: true
                        },
                        on: {
                            change: function(){
                                carddone.activities.redrawDetails(host);
                            }
                        }
                    });

                    var timestartChangeFunc = function(){
                        if (host.timestart_input.value.getTime() >= host.timeend_input.value.getTime()){
                            host.timeend_input.value = new Date(host.timestart_input.value.getTime() + 24*60*60*1000);
                        }
                        carddone.activities.redrawDetails(host);
                    };
                    var timeendChangeFunc = function(){
                        if (host.timestart_input.value.getTime() >= host.timeend_input.value.getTime()){
                            host.timestart_input.value = new Date(host.timeend_input.value.getTime() - 24*60*60*1000);
                        }
                        carddone.activities.redrawDetails(host);
                    };
                    host.timestart_input = absol.buildDom({
                        tag: 'calendar-input',
                        style: {
                            marginRight: "var(--control-horizontal-distance-1)"
                        },
                        data: {
                            value: new Date((new Date()).setHours(0,0,0,0))
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
                            value: new Date((new Date()).setHours(0,0,0,0))
                        },
                        on: {
                            change: function(){
                                timeendChangeFunc();
                            }
                        }
                    });
                    host.finish_checkbox = absol.buildDom({
                        tag: "checkbox",
                        props: {
                            checked: true,
                            text: LanguageModule.text("txt_show_activities_finish")
                        },
                        on: {
                            change: function(){
                                carddone.activities.redrawDetails(host);
                            }
                        }
                    });
                    host.data_container = DOMElement.div({attrs: {className: "cardsimpletableclass"}});
                    host.holder.addChild(host.frameList);
                    var singlePage = host.funcs.formActivitiesInit({
                        cmdbutton: cmdbutton,
                        data_container: host.data_container,
                        boards_select: host.boards_select,
                        users_select: host.users_select,
                        timestart_input: host.timestart_input,
                        timeend_input: host.timeend_input,
                        finish_checkbox: host.finish_checkbox,
                        frameList: host.frameList
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.activities.redraw(host);
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
ModuleManagerClass.register({
    name: "Activities",
    prerequisites: ["ModalElement", "FormClass"]
});
