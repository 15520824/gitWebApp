
carddone.my_calendar.deleteActivity = function(host, content, activity){
    return new Promise(function(resolve, reject){
        var x = activity.indexOf("List");
        var type_activity = activity.substr(0, x);
        if (type_activity == "check_list") type_activity = "checklist";
        host.database.typelists = host.database.typelists;
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
                        carddone.my_calendar.redrawDetails(host);
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

carddone.my_calendar.editActivitiesSave = function(host, content, typeid, value, activity, mode){
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
                            carddone.my_calendar.redrawDetails(host);
                            switch (content.type) {
                                case "task":
                                    carddone.my_calendar.editTaskFunc(host, content);
                                    break;
                                case "call":
                                    carddone.my_calendar.editCallFunc(host, content);
                                    break;
                                case "meeting":
                                    carddone.my_calendar.editMeetingFunc(host, content);
                                    break;
                                case "checklist":
                                    carddone.my_calendar.editCheckListFunc(host, content);
                                    break;
                                default:

                            }
                        }
                        else {
                            host.frameList.removeLast();
                            carddone.my_calendar.redrawDetails(host);
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

carddone.my_calendar.editTaskFunc = function(host, content){
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
                carddone.my_calendar.editActivitiesSave(host, content, -18, value, {name: 'task', list: 'taskList'}, 0).then(function(value){
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
                carddone.my_calendar.editActivitiesSave(host, content, -18, value, {name: 'task', list: 'taskList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.my_calendar.deleteActivity(host, content, 'taskList').then(function(value){
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
        users: data_module.users,
        typelists: host.database.typelists,
        objects: host.database.objects,
        values: host.database.values,
        companies: host.database.companies,
        contact: host.database.contact,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
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
        editTaskFunc: function(cardid, id){
            carddone.my_calendar.editTaskFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.my_calendar.editCallFunc = function(host, content){
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
                carddone.my_calendar.editActivitiesSave(host, content, -22, value, {name: 'call', list: 'callList'}, 0).then(function(value){
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
                carddone.my_calendar.editActivitiesSave(host, content, -22, value, {name: 'call', list: 'callList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.my_calendar.deleteActivity(host, content, 'callList').then(function(value){
                resolve(value);
            });
        }
    };
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
        companies: host.database.companies,
        contact: host.database.contact,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
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
            carddone.my_calendar.editCallFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.my_calendar.editMeetingFunc = function(host, content){
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
                carddone.my_calendar.editActivitiesSave(host, content, -20, value, {name: 'meeting', list: 'meetingList'}, 0).then(function(value){
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
                carddone.my_calendar.editActivitiesSave(host, content, -20, value, {name: 'meeting', list: 'meetingList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.my_calendar.deleteActivity(host, content, 'meetingList').then(function(value){
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
        companies: host.database.companies,
        contact: host.database.contact,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
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
            carddone.my_calendar.editMeetingFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.my_calendar.editCheckListFunc = function(host, content){
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
                carddone.my_calendar.editActivitiesSave(host, content, -22, value, {name: 'checklist', list: 'check_listList'}, 0).then(function(value){
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
                carddone.my_calendar.editActivitiesSave(host, content, -22, value, {name: 'checklist', list: 'check_listList'}, 1).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function () {
            carddone.my_calendar.deleteActivity(host, content, 'check_listList').then(function(value){
                resolve(value);
            });
        }
    };
    var bIndex = host.database.boards.getIndex(content.boardid);
    if (bIndex < 0) {
        ModalElement.alert({message: LanguageModule.text("failed_boardid")});
        return;
    }
    var singlePage = theme.cardAddCheckListForm({
        id: content.objid,
        cardid: content.cardid,
        users: data_module.users,
        typelists: host.database.typelists,
        objects: host.database.objects,
        values: host.database.values,
        companies: host.database.companies,
        contact: host.database.contact,
        cardContent: host.database.cards.items[host.database.cards.getIndex(content.cardid)],
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
            carddone.my_calendar.editCheckListFunc(host, content);
        }
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.my_calendar.editActivities = function(host, content){
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
                                    carddone.my_calendar.editTaskFunc(host, content);
                                    break;
                                case "call":
                                    carddone.my_calendar.editCallFunc(host, content);
                                    break;
                                case "meeting":
                                    carddone.my_calendar.editMeetingFunc(host, content);
                                    break;
                                case "checklist":
                                    carddone.my_calendar.editCheckListFunc(host, content);
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

carddone.my_calendar.openCard = function(host, content){
    carddone.menu.loadPage(11, content);
};

carddone.my_calendar.getImportantName = function(important){
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

carddone.my_calendar.getRowData = function(host, content){
    var cardIndex = host.database.cards.getIndex(content.cardid);
    var boardIndex = host.database.boards.getIndex(content.boardid);
    if (cardIndex < 0 || boardIndex < 0) return null;
    var listIndex = host.database.cards.items[cardIndex].listIndex;
    if (listIndex < 0) return null;
    content.listid = host.database.cards.items[cardIndex].parentid;
    content.cardName = host.database.cards.items[cardIndex].name;
    content.boardName = host.database.boards.items[boardIndex].name;
    content.archivedCard = host.database.cards.items[cardIndex].archived;
    var res = {
        status: content.status,
        activityName: content.nameActivity,
        company_contactName: host.database.cards.items[cardIndex].company_contactName,
        cardName: host.database.cards.items[cardIndex].name,
        important: carddone.my_calendar.getImportantName(host.database.cards.items[cardIndex].favorite),
        boardName: host.database.boards.items[boardIndex].name,
        listName: host.database.lists.items[listIndex].name,
        type: content.type,
        assigned_to: contentModule.getUsernameByhomeidFromDataModule(content.assigned_to),
        permission: content.permission,
        func: {
            edit: function(){
                return new Promise(function(resolve, reject){
                    carddone.my_calendar.editActivities(host, content).then(function(value){
                        resolve(value);
                    });
                });
            },
            openCard: function(){
                return carddone.my_calendar.openCard(host, content);
            }
        }
    };
    if (content.type == "meeting"){
        res.timeend = content.timeend;
        res.timestart = content.timestart;
    }
    else {
        res.time = content.time;
    }
    return res;
};

carddone.my_calendar.redrawTypeCalendar = function(host){
    var quickmenu, items;
    if (host.type_select.value == 0){
        host.month_calendar.removeAllActivity();
        for (var i = 0; i < host.data.length; i++){
            items = [];
            items.push({
                text: (host.data[i].permission == "edit")? LanguageModule.text("txt_edit") : LanguageModule.text("txt_view_activity"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child:{text: (host.data[i].permission == "edit")? "mode_edit" : "visibility"}
                },
                value: "edit"
            });
            if (host.data[i].permission == "edit"){
                items.push({
                    text: LanguageModule.text("txt_open_card"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: ["mdi", "mdi-file-edit-outline"]
                    },
                    value: "open"
                });
            }
            else {
                items.push({
                    text: LanguageModule.text("txt_view_card"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: "material-icons",
                        child:{text: "visibility"}
                    },
                    value: "open"
                });
            }
            quickmenu = {
                menuProps: {
                    items: items
                },
                onSelect: function(host, i){
                    return function (item, activity) {
                        switch (item.value) {
                            case "edit":
                                host.data[i].func.edit();
                                break;
                            case "open":
                                host.data[i].func.openCard();
                                break;

                        }
                    }
                }(host, i)
            };
            if (host.data[i].type == "meeting"){
                host.month_calendar.addActivity({
                    name: host.data[i].activityName,
                    desc: host.data[i].company_contactName,
                    boardName: host.data[i].boardName,
                    listName: host.data[i].listName,
                    cardName: host.data[i].cardName,
                    startTime: host.data[i].timestart,
                    endTime: host.data[i].timeend,
                    quickmenu: quickmenu
                });
            }
            else {
                host.month_calendar.addActivity({
                    name: host.data[i].activityName,
                    desc: host.data[i].company_contactName,
                    boardName: host.data[i].boardName,
                    listName: host.data[i].listName,
                    cardName: host.data[i].cardName,
                    startTime: host.data[i].time,
                    endTime: host.data[i].time,
                    quickmenu: quickmenu
                });
            }
        }
    }
    else {
        host.week_calendar.removeAllActivity();
        for (var i = 0; i < host.data.length; i++){
            items = [];
            if (host.data[i].permission == "edit") {
                items.push({
                    text: LanguageModule.text("txt_edit"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: "material-icons",
                        child:{text: "mode_edit"}
                    },
                    value: "edit"
                });
            }
            items.push({
                text: LanguageModule.text("txt_open_card"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: ["mdi", "mdi-file-edit-outline"]
                },
                value: "open"
            });
            quickmenu = {
                menuProps: {
                    items: items
                },
                onSelect: function(host, i){
                    return function (item, activity) {
                        switch (item.value) {
                            case "edit":
                                host.data[i].func.edit();
                                break;
                            case "open":
                                host.data[i].func.openCard();
                                break;

                        }
                    }
                }(host, i)
            };
            if (host.data[i].type == "meeting"){
                host.week_calendar.addActivity({
                    name: host.data[i].activityName,
                    desc: host.data[i].company_contactName,
                    boardName: host.data[i].boardName,
                    listName: host.data[i].listName,
                    cardName: host.data[i].cardName,
                    startTime: host.data[i].timestart,
                    endTime: host.data[i].timeend,
                    quickmenu: quickmenu
                });
            }
            else {
                host.week_calendar.addActivity({
                    name: host.data[i].activityName,
                    desc: host.data[i].company_contactName,
                    boardName: host.data[i].boardName,
                    listName: host.data[i].listName,
                    cardName: host.data[i].cardName,
                    startTime: host.data[i].time,
                    endTime: host.data[i].time,
                    quickmenu: quickmenu
                });
            }
        }
    }
};

carddone.my_calendar.redrawDetails = function(host){
    console.log(host.database);
    ModalElement.close(-1);
    console.log("done__" +(new Date().getTime()));
    var isFinish = host.finish_checkbox.checked;
    var boardid = host.boards_select.value;
    var listCalendarContent = [];
    for (var i = 0; i < host.database.user_calendar.items.length; i++){
        listCalendarContent = listCalendarContent.concat(host.database.user_calendar.items[i].content);
    }
    var dataDraw = [], cardIndex, objIndex;
    for (var i = 0; i < listCalendarContent.length; i++){
        if (!isFinish) if (listCalendarContent[i].status) continue;
        if (boardid > 0) if (listCalendarContent[i].boardid != boardid) continue;
        cardIndex = host.database.cards.getIndex(listCalendarContent[i].cardid);
        if (cardIndex < 0){
            console.log(listCalendarContent[i]);
            continue;
        }
        objIndex = host.database.objects.getIndex(listCalendarContent[i].objid);
        if (objIndex < 0){
            console.log(listCalendarContent[i]);
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
        cell = carddone.my_calendar.getRowData(host, dataDraw[i]);
        if (cell == null) continue;
        host.data.push(cell);
    }
    carddone.my_calendar.redrawTypeCalendar(host);
};

carddone.my_calendar.preRedrawDetails = function(host){
    if (!host.database.cards) {
        setTimeout(function(){
            carddone.my_calendar.preRedrawDetails(host);
        },50);
        return;
    }
    carddone.my_calendar.redrawDetails(host);
};

carddone.my_calendar.redraw = function(host){
    host.userid = host.users_select.value;
    ModalElement.show_loading();
    dbcache.loadByCondition({
        name: "user_calendar",
        cond: function (record) {
            return record.userid == host.userid;
        },
        callback: function (retval) {
            host.database.user_calendar.items = EncodingClass.string.duplicate(retval);
            contentModule.makeUserCalendarContent(host);
            var cardids = [], cardid, objids = [], objid;
            for (var i = 0; i < host.database.user_calendar.items.length; i++){
                for (var j = 0; j < host.database.user_calendar.items[i].content.length; j++){
                    cardid = host.database.user_calendar.items[i].content[j].cardid;
                    if (cardids.indexOf(cardid) < 0){
                        cardids.push(cardid);
                    }
                    objid = host.database.user_calendar.items[i].content[j].objid;
                    if (objids.indexOf(objid) < 0){
                        objids.push(objid);
                    }
                }
            }
            if (cardids.length > 0){
                carddone.my_calendar.loadCards(host, cardids, objids);
            }
            else {
                ModalElement.close(-1);
                carddone.my_calendar.redrawDetails(host);
            }
        }
    });
};

carddone.my_calendar.loadCards = function(host, cardids, objids){
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
                console.log(listsArchived[i]);
                host.database.lists.items.push(listsArchived[i]);
            }
        }
        contentModule.makeActivitiesCardIndexThanhYen(host);
        contentModule.makeCompanyCardIndex(host);
        ModalElement.close(-1);
        carddone.my_calendar.redrawDetails(host);
    });
};


carddone.my_calendar.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.my_calendar.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    var st = {
        nations: [],
        cities: [],
        districts: [],
        company_class: [],
        typelists: [],
        companies: [],
        contact: [],
        owner_company_contact: [],
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
        delete host.database.owner_company_contact.sync;
        delete host.database.typelists.sync;
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
            var focusIntoDate = function (date) {
                var calendarType = host.type_select.value;
                switch (calendarType) {
                    case 0:
                        host.month_calendar.focusInto(date);
                        break;
                    case 1:
                        host.week_calendar.focusInto(date);
                        break;
                }
            };

            var prevPageFunc = function(){
                var calendarType = host.type_select.value;
                switch (calendarType) {
                    case 0:
                        host.month_calendar.prevPeriod();
                        break;
                    case 1:
                        host.week_calendar.prevPeriod();
                        break;
                }
            };

            var nextPageFunc = function(){
                var calendarType = host.type_select.value;
                switch (calendarType) {
                    case 0:
                        host.month_calendar.nextPeriod();
                        break;
                    case 1:
                        host.week_calendar.nextPeriod();
                        break;
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
                        carddone.my_calendar.redraw(host);
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
                        carddone.my_calendar.redrawDetails(host);
                    }
                }
            });

            var titleCalendar = DOMElement.div({
                attrs: {
                    style: {
                        display: "inline-block",
                        verticalAlign: "middle",
                        paddingLeft: "var(--control-horizontal-distance-1)",
                        color: "blue",
                        fontSize: "16px",
                        width: "204px"
                    }
                }
            });
            var listMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var titleWeekCalendar = function(startTime, endTime){
                var textContent = "";
                endTime = new Date(endTime.getTime() - 1);
                if (startTime.getFullYear() == endTime.getFullYear()){
                    if (startTime.getMonth() == endTime.getMonth()){
                        textContent = listMonth[startTime.getMonth()] + " " + startTime.getDate() + " - "  + endTime.getDate() + ", " + endTime.getFullYear();
                    }
                    else {
                        textContent = listMonth[startTime.getMonth()] + " " + startTime.getDate() + " - " +
                                      listMonth[endTime.getMonth()] + " " + endTime.getDate() + ", " + endTime.getFullYear();
                    }
                }
                else {
                    textContent = listMonth[startTime.getMonth()] + " " + startTime.getDate() + ", " + startTime.getFullYear() + " - " +
                                  listMonth[endTime.getMonth()] + " " + endTime.getDate() + ", " + endTime.getFullYear();
                }
                titleCalendar.textContent = textContent;
            };

            var titleMonthCalendar = function(startTime, endTime){
                var textContent = "";
                endTime = new Date(endTime.getTime() - 1);
                if (startTime.getFullYear() == endTime.getFullYear()){
                    if (startTime.getMonth() == endTime.getMonth()){
                        textContent = listMonth[startTime.getMonth()] + " " + endTime.getFullYear();
                    }
                    else {
                        textContent = listMonth[startTime.getMonth()] + " - " +
                                      listMonth[endTime.getMonth()] + " " + endTime.getFullYear();
                    }
                }
                else {
                    textContent = listMonth[startTime.getMonth()] + " " + startTime.getFullYear() + " - " +
                                  listMonth[endTime.getMonth()] + " " + endTime.getFullYear();
                }
                titleCalendar.textContent = textContent;
            };
            host.type_select = absol.buildDom({
                tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
                style: {
                    verticalAlign: "middle"
                },
                props: {
                    items: [
                        {value: 0, text: LanguageModule.text("txt_month_calendar")},
                        {value: 1, text: LanguageModule.text("txt_week_calendar")}
                    ]
                },
                on: {
                    change: function(){
                        if (this.value == 0){
                            host.month_calendar_ctn.requestActive();
                            host.month_calendar.notifyPeriodChange();
                        }
                        else {
                            host.week_calendar_ctn.requestActive();
                            host.week_calendar.notifyPeriodChange();
                        }
                        carddone.my_calendar.redrawTypeCalendar(host);
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
                        carddone.my_calendar.redrawDetails(host);
                    }
                }
            });
            host.date_input = absol.buildDom({
                tag: 'dateinput',
                props: {
                    value: new Date()
                },
                on: {
                    change: function () {
                        focusIntoDate(this.value || new Date());
                    }
                }
            });
            host.date_filter = absol.buildDom({
                class: 'cd-work-calendar-date',
                child: [
                    DOMElement.i({
                        attrs: {
                            className: "material-icons bsc-icon-hover-black",
                            style: {
                                verticalAlign: "middle"
                            },
                            onclick: function(){
                                prevPageFunc();
                            }
                        },
                        text: "arrow_back_ios"
                    }),
                    DOMElement.i({
                        attrs: {
                            className: "material-icons bsc-icon-hover-black",
                            style: {
                                verticalAlign: "middle"
                            },
                            onclick: function(){
                                nextPageFunc();
                            }
                        },
                        text: "arrow_forward_ios"
                    }),
                    titleCalendar,
                    {
                        tag: 'button',
                        class: 'cd-today',
                        child: { text: 'Today' },
                        on: {
                            click: function(){
                                host.date_input.value = new Date();
                                host.date_input.emit("change");
                            }
                        }
                    },
                    host.date_input
                ]
            });
            host.month_calendar = absol.buildDom({
                tag: "monthtable",
                style:{
                    width: '100%',
                    height:'calc(100% - 5px)'
                },
                on: {
                    visibleperiodchange: function(event){
                        titleMonthCalendar(event.visiblePeriod.startTime, event.visiblePeriod.endTime);
                    }
                }
            });
            host.month_calendar_ctn = absol.buildDom({
                tag: "tabframe",
                child: [host.month_calendar]
            });
            host.week_calendar = absol.buildDom({
                tag: "weektable",
                style:{
                    width: '100%',
                    height:'calc(100% - 5px)'
                },
                on: {
                    visibleperiodchange: function(event){
                        titleWeekCalendar(event.visiblePeriod.startTime, event.visiblePeriod.endTime);
                    }
                }
            });
            host.week_calendar_ctn = absol.buildDom({
                tag: "tabframe",
                child: [host.week_calendar]
            });
            var data_container = absol.buildDom({
                tag: "frameview",
                style:{
                    width: 'calc(100% - 17px)' // cho  thanh scrollbar bên phải
                },
                child: [
                    host.month_calendar_ctn,
                    host.week_calendar_ctn
                ]
            });
            console.log(host.month_calendar);
            host.holder.addChild(host.frameList);
            host.month_calendar_ctn.requestActive();
            var calendarPage = host.funcs.formMy_calendarInit({
                cmdbutton: cmdbutton,
                boards_select: host.boards_select,
                users_select: host.users_select,
                finish_checkbox: host.finish_checkbox,
                frameList: host.frameList,
                data_container: data_container,
                type_select: host.type_select,
                date_filter: host.date_filter
            });
            host.frameList.addChild(calendarPage);
            calendarPage.requestActive();
            carddone.my_calendar.redraw(host);
        });
    });
};
ModuleManagerClass.register({
    name: "My_calendar",
    prerequisites: ["ModalElement", "FormClass"]
});
