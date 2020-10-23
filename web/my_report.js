'use strict';

carddone.my_report.cardContent = {};
carddone.my_report.timeFilter = {};
carddone.my_report.valueObjectData = {};
carddone.my_report.loadedBoard = [];
carddone.my_report.maxRangeRecord = 5000;

carddone.my_report.changeGroup = function(host, reportid, from, to){
    var cIndex, cId, max;
    var oldGroup, newGroup, oldIndex, newIndex, count;
    var increaseIdList = [];
    var decreaseIdList = [];
    var increaseIndexList = [];
    var decreaseIndexList = [];
    oldGroup = from.table.parentNode.ident;
    oldIndex = from.index;
    newGroup = to.table.parentNode.ident;
    newIndex = to.index;
    if (oldGroup != 0){
        count = host.database.report_groups.items[host.database.report_groups.getIndex(oldGroup)].reportIdList.length;
        oldIndex = count - oldIndex - 1;
    }
    if (newGroup != 0){
        count = host.database.report_groups.items[host.database.report_groups.getIndex(newGroup)].reportIdList.length;
        newIndex = count - newIndex;
    }
    host.database.report_group_link.items.sort(function(a, b){
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
    });
    max = 0;
    cId = -1;
    cIndex = -1;
    for (var i = 0; i < host.database.report_group_link.items.length; i++){
        if (host.database.report_group_link.items[i].groupid == oldGroup && host.database.report_group_link.items[i].reportid == reportid){
            cIndex = i;
            cId = host.database.report_group_link.items[i].id;
        }
        if (oldGroup != 0){
            if (host.database.report_group_link.items[i].groupid == oldGroup) {
                if (host.database.report_group_link.items[i].index > oldIndex) {
                    if (host.database.report_group_link.items[i].index > max) max = host.database.report_group_link.items[i].index;
                    decreaseIdList.push(host.database.report_group_link.items[i].id);
                    decreaseIndexList.push(i);
                }
            };
        }
        if (newGroup != 0) {
            if (host.database.report_group_link.items[i].groupid == newGroup) {
                if (host.database.report_group_link.items[i].index >= newIndex) {
                    increaseIdList.push(host.database.report_group_link.items[i].id);
                    increaseIndexList.push(i);
                }
            };
        }
    }
    decreaseIdList.reverse();
    decreaseIndexList.reverse();
    ModalElement.show_loading();
    FormClass.api_call({
        url: "report_change_group_save.php",
        params: [
            {name: "cId", value: cId},
            {name: "groupid", value: newGroup},
            {name: "reportid", value: reportid},
            {name: "min", value: newIndex},
            {name: "max", value: max},
            {name: "increaseIdList", value: EncodingClass.string.fromVariable(increaseIdList)},
            {name: "decreaseIdList", value: EncodingClass.string.fromVariable(decreaseIdList)}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    increaseIndexList.forEach(function(elt){
                        host.database.report_group_link.items[elt].index++;
                    });
                    decreaseIndexList.forEach(function(elt){
                        host.database.report_group_link.items[elt].index--;
                    });
                    if (cIndex != -1){
                        if (newGroup != 0) {
                            host.database.report_group_link.items[cIndex].index = newIndex;
                            host.database.report_group_link.items[cIndex].groupid = newGroup;
                        }
                        else host.database.report_group_link.items.splice(cIndex, 1);
                    }
                    else {
                        if (newGroup != 0) {
                            host.database.report_group_link.items.push(content);
                        }
                    }
                    if (newGroup != 0){
                        host.database.report.items[host.database.report.getIndex(reportid)].index = newIndex;
                        host.database.report.items[host.database.report.getIndex(reportid)].groupid = newGroup;
                        host.database.report.items[host.database.report.getIndex(reportid)].groupIndex = host.database.report_groups.getIndex(newGroup);
                        var gIndex = host.database.report_groups.getIndex(newGroup);
                        host.database.report_groups.items[gIndex].reportIdList.push(reportid);
                        host.database.report_groups.items[gIndex].reportIndexList.push(host.database.report.getIndex(reportid));
                    }
                    else {
                        host.database.report.items[host.database.report.getIndex(reportid)].index = undefined;
                        host.database.report.items[host.database.report.getIndex(reportid)].groupid = undefined;
                        host.database.report.items[host.database.report.getIndex(reportid)].groupIndex = undefined;
                    }
                    if (oldGroup != 0){
                        var gIndex = host.database.report_groups.getIndex(oldGroup);
                        host.database.report_groups.items[gIndex].reportIdList = host.database.report_groups.items[gIndex].reportIdList.filter(function(elt){
                            return elt != reportid;
                        });
                        host.database.report_groups.items[gIndex].reportIndexList = host.database.report_groups.items[gIndex].reportIndexList.filter(function(elt){
                            return elt != host.database.report.getIndex(reportid);
                        });
                    }
                    dbcache.refresh("report_group_link");
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    });
};

carddone.my_report.changeOrder = function(host, groupid, reportid, from, to){
    var cIndex, cId;
    var count = host.database.report_groups.items[host.database.report_groups.getIndex(groupid)].reportIdList.length;
    from = count - from - 1;
    to = count - to - 1;
    var increaseIdList = [];
    var decreaseIdList = [];
    var increaseIndexList = [];
    var decreaseIndexList = [];
    host.database.report_group_link.items.sort(function(a, b){
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
    });
    for (var i = 0; i < host.database.report_group_link.items.length; i++){
        if (host.database.report_group_link.items[i].groupid != groupid) continue;
        if (host.database.report_group_link.items[i].groupid == groupid && host.database.report_group_link.items[i].reportid == reportid) {
            cIndex = i;
            cId = host.database.report_group_link.items[i].id;
        }
        if (from > to){
            if (host.database.report_group_link.items[i].index >= to && host.database.report_group_link.items[i].index < from) {
                increaseIdList.push(host.database.report_group_link.items[i].id);
                increaseIndexList.push(i);
            }
        }
        else {
            if (host.database.report_group_link.items[i].index > from && host.database.report_group_link.items[i].index <= to) {
                decreaseIdList.push(host.database.report_group_link.items[i].id);
                decreaseIndexList.push(i);
            }
        }
    }
    decreaseIdList.reverse();
    decreaseIndexList.reverse();
    ModalElement.show_loading();
    FormClass.api_call({
        url: "report_change_order_save.php",
        params: [
            {name: "cId", value: cId},
            {name: "to", value: to},
            {name: "increaseIdList", value: EncodingClass.string.fromVariable(increaseIdList)},
            {name: "decreaseIdList", value: EncodingClass.string.fromVariable(decreaseIdList)}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    host.database.report.items[host.database.report.getIndex(reportid)].index = to;
                    host.database.report_group_link.items[cIndex].index = to;
                    if (from > to){
                        increaseIndexList.forEach(function(elt){
                            host.database.report_group_link.items[elt].index++;
                        });
                    }
                    else {
                        decreaseIndexList.forEach(function(elt){
                            host.database.report_group_link.items[elt].index--;
                        });
                    }
                    dbcache.refresh("report_group_link");
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    });
};

carddone.my_report.groupChangeOrder = function(host, groupid, from, to){
    var cIndex;
    var increaseIdList = [];
    var decreaseIdList = [];
    var increaseIndexList = [];
    var decreaseIndexList = [];
    host.database.report_groups.items.sort(function(a, b){
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
    });
    for (var i = 0; i < host.database.report_groups.items.length; i++){
        if (host.database.report_groups.items[i].id == groupid) {
            cIndex = i;
        }
        if (from > to){
            if (host.database.report_groups.items[i].gindex >= to && host.database.report_groups.items[i].gindex < from) {
                increaseIdList.push(host.database.report_groups.items[i].id);
                increaseIndexList.push(i);
            }
        }
        else {
            if (host.database.report_groups.items[i].gindex > from && host.database.report_groups.items[i].gindex <= to) {
                decreaseIdList.push(host.database.report_groups.items[i].id);
                decreaseIndexList.push(i);
            }
        }
    }
    decreaseIdList.reverse();
    decreaseIndexList.reverse();
    ModalElement.show_loading();
    FormClass.api_call({
        url: "report_group_change_order_save.php",
        params: [
            {name: "groupid", value: groupid},
            {name: "to", value: to},
            {name: "increaseIdList", value: EncodingClass.string.fromVariable(increaseIdList)},
            {name: "decreaseIdList", value: EncodingClass.string.fromVariable(decreaseIdList)}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    host.database.report_groups.items[cIndex].gindex = to;
                    if (from > to){
                        increaseIndexList.forEach(function(elt){
                            host.database.report_groups.items[elt].gindex++;
                        });
                    }
                    else {
                        decreaseIndexList.forEach(function(elt){
                            host.database.report_groups.items[elt].gindex--;
                        });
                    }
                    dbcache.refresh("report_groups");
                    contentModule.makeReportGroupLinkIndex(host);
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    });
};

carddone.my_report.deleteGroup = function(host, id, index){
    var decreaseIdList = [];
    var decreaseIndexList = [];
    var max = 0;
    host.database.report_groups.items.sort(function(a, b){
        if (a.gindex > b.gindex) return -1;
        if (a.gindex < b.gindex) return 1;
        return 0;
    })
    for (var i = 0; i < host.database.report_groups.items.length; i++){
        if (host.database.report_groups.items[i].gindex > index) {
            if (max < host.database.report_groups.items[i].gindex) max = host.database.report_groups.items[i].gindex;
            decreaseIdList.push(host.database.report_groups.items[i].id);
            decreaseIndexList.push(i);
        }
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "report_delete_group_save.php",
        params: [
            {name: "id", value: id},
            {name: "max", value: max},
            {name: "decreaseIdList", value: EncodingClass.string.fromVariable(decreaseIdList)}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == 'ok'){
                    decreaseIndexList.forEach(function(elt){
                        host.database.report_groups.items[elt].gindex = --max;
                    });
                    var index = host.database.report_groups.getIndex(id);
                    host.database.report_groups.items.splice(index, 1);
                    host.database.report_group_link.items = host.database.report_group_link.items.filter(function(elt){
                        if (elt.groupid == id){
                            var bIndex = host.database.report.getIndex(elt.reportid);
                            if (bIndex < 0) return false;
                            host.database.report.items[bIndex].groupid = undefined;
                            host.database.report.items[bIndex].groupIndex = undefined;
                            host.database.report.items[bIndex].index = undefined;
                            return false;
                        }
                        return true;
                    });
                    contentModule.makeReportGroupLinkIndex(host);
                    dbcache.refresh("report_groups");
                    dbcache.refresh("report_group_link");
                    carddone.my_report.redraw(host).then(function(singlePage){
                        host.report_container.clearChild();
                        host.report_container.addChild(singlePage);
                    });
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    })
};

carddone.my_report.addNewGroupSave = function(host, id, gindex, value){
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "report_groups_add_save.php",
            params: [
                {name: "name", value: value.name},
                {name: "color", value: value.color},
                {name: "gindex", value: gindex},
                {name: "id", value: id}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0) {
                            content.reportIdList = [];
                            content.reportIndexList = [];
                            host.database.report_groups.items.push(content);
                        }
                        else {
                            var index = host.database.report_groups.getIndex(id);
                            host.database.report_groups.items[index].name = content.name;
                            host.database.report_groups.items[index].color = content.color;
                            host.database.report_groups.items[index].gindex = content.gindex;
                        }
                        dbcache.refresh("report_groups");
                        rs(content.id);
                    }
                    else {
                        console.log(message);
                    }
                }
                else {
                    console.log(message);
                }
            }
        });
    });
};

carddone.my_report.exportData = function(host){
    if (!host.reportData) {
        ModalElement.alert({message: LanguageModule.text("txt_no_data_to_export")});
        return;
    }
    var rows, data, rowIndex = 1;
    var makeDic = function(list){
        var dic = {};
        list.forEach(function(elt, idx){
            dic[elt.id] = idx;
        });
        return dic;
    };
    var companiesDic = makeDic(host.database.companies.items);
    data = [];
    for (var i = 0; i < 2; i++){
        data.push({
            row: 0, col: i,
            value: host.reportData.header[i].value,
            bold: true,
            backgroundcolor: "FFE2EFDA",
            horizontal: "center"
        });
    }
    data.push(
        {
            row: 0, col: 2,
            value: LanguageModule.text("txt_no_type") + ": id",
            bold: true,
            backgroundcolor: "FFE2EFDA",
            horizontal: "center"
        },
        {
            row: 0, col: 3,
            value: LanguageModule.text("txt_no_type") + ": " + LanguageModule.text("txt_name"),
            bold: true,
            backgroundcolor: "FFE2EFDA",
            horizontal: "center"
        }
    );
    for (i = 0; i < host.database.company_class.items.length; i++){
        data.push(
            {
                row: 0, col: 4 + (i * 2),
                value: host.database.company_class.items[i].name + ": id",
                bold: true,
                backgroundcolor: "FFE2EFDA",
                horizontal: "center"
            },
            {
                row: 0, col: 4 + (i * 2) + 1,
                value: host.database.company_class.items[i].name + ": " + LanguageModule.text("txt_name"),
                bold: true,
                backgroundcolor: "FFE2EFDA",
                horizontal: "center"
            }
        );
    }
    for (var i = 3; i < host.reportData.header.length - 1; i++){
        data.push({
            row: 0, col: (i + 1) + host.database.company_class.items.length * 2,
            value: host.reportData.header[i].value,
            bold: true,
            backgroundcolor: "FFE2EFDA",
            horizontal: "center"
        });
    }
    for (var i = 0; i < host.reportData.data.length - 1; i++){
        for (var j = 0; j < 2; j++){
            var hrz;
            switch (host.reportData.data[i][j].type) {
                case 'number':
                    hrz = "right";
                    break;
                case 'date':
                    hrz = "center";
                    break;
                default:
                    hrz = "left";
            };
            data.push({
                row: rowIndex, col: j,
                value: host.reportData.data[i][j].value,
                horizontal: hrz
            });
        }
        var companies = host.reportData.data[i][2].companiesDetail;
        var makeCompanyData = function(content){
            var keys = Object.keys(content);
            keys = keys.map(function(elt){ return parseInt(elt, 10);});
            keys.sort(function(a, b){
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });
            var str = "";
            var number = "";
            keys.forEach(function(elt){
                var index = companiesDic[elt];
                if (index) {
                    if (str != "") str += " ;; ";
                    if (number != "") number += " ;; ";
                    str += host.database.companies.items[companiesDic[elt]].name;
                    number += elt;
                }
            });
            return {
                str: str,
                number: number
            };
        }
        var value;
        if (companies[0]) value = makeCompanyData(companies[0]);
        else value = {};
        data.push(
            {
                row: rowIndex, col: 2,
                value: value.number,
                horizontal: "left"
            },
            {
                row: rowIndex, col: 3,
                value: value.str,
                horizontal: "left"
            }
        );
        for (j = 0; j < host.database.company_class.items.length; j++){
            if (companies[host.database.company_class.items[j].id]) value = makeCompanyData(companies[host.database.company_class.items[j].id]);
            else value = {};
            data.push(
                {
                    row: rowIndex, col: 4 + (j * 2),
                    value: value.number,
                    horizontal: "left"
                },{
                    row: rowIndex, col: 4 + (j * 2) + 1,
                    value: value.str,
                    horizontal: "left"
                }
            );
        }
        for (var j = 3; j < host.reportData.data[i].length - 1; j++){
            var hrz;
            switch (host.reportData.data[i][j].type) {
                case 'number':
                    hrz = "right";
                    break;
                case 'date':
                    hrz = "center";
                    break;
                default:
                    hrz = "left";
            };
            data.push({
                row: rowIndex, col: (j + 1) + host.database.company_class.items.length * 2,
                value: host.reportData.data[i][j].value,
                horizontal: hrz
            });
        }
        rowIndex++;
    }
    var x = contentModule.formatTimeMinuteDisplay(new Date());
    var excelData = {
        sheets: [{
            name: "report",
            data: data
        }]
    };
    carddone.excel_module.writerWorkbook(excelData, "report"+x+".xlsx");
};

carddone.my_report.activityReportData = function(host, inputInfo){
    return new Promise(function(resolve, reject){
        var time = carddone.my_report.generateRelativeTime(inputInfo.timeFilter);
        var from = new Date(time.start);
        var to = new Date(time.end - 1);
        var boardIds = inputInfo.boardValue;
        var userIdss = inputInfo.activity_report.users;
        var userIds = userIdss;
        if (userIdss.indexOf(0) >= 0){
            userIds = [];
            for (var i = 0; i < data_module.users.items.length; i++){
                userIds.push(data_module.users.items[i].homeid);
            }
        }
        var status = inputInfo.activity_report.status;
        var hostTemp = {
            boardIds: boardIds,
            userIds: userIds,
            database: {
                boards: EncodingClass.string.duplicate(host.database.boards),
                list_member: EncodingClass.string.duplicate(host.database.list_member),
                account_groups: EncodingClass.string.duplicate(host.database.account_groups),
                companies: host.database.companies,
                contact: host.database.contact
            }
        };
        hostTemp.database.cards = data_module.makeDatabase([]);
        hostTemp.database.lists = data_module.makeDatabase([]);
        hostTemp.database.company_card = data_module.makeDatabase([]);
        hostTemp.database.contact_card = data_module.makeDatabase([]);
        hostTemp.database.objects = data_module.makeDatabase([]);
        var user_calendar = data_module.loadByConditionAsync({
            name: "user_calendar",
            cond: function(record){
                return userIds.indexOf(record.userid) >= 0;
            },
            callback: function(retval){
                hostTemp.database.user_calendar = data_module.makeDatabase(retval);
                contentModule.makeUserCalendarContent(hostTemp);
            }
        });
        user_calendar.then(function(){
            var cardids = [], cardid, objids = [], objid;
            for (var i = 0; i < hostTemp.database.user_calendar.items.length; i++){
                for (var j = 0; j < hostTemp.database.user_calendar.items[i].content.length; j++){
                    cardid = hostTemp.database.user_calendar.items[i].content[j].cardid;
                    if (cardids.indexOf(cardid) < 0){
                        cardids.push(cardid);
                    }
                    objid = hostTemp.database.user_calendar.items[i].content[j].objid;
                    if (cardids.indexOf(objid) < 0){
                        objids.push(objid);
                    }
                }
            }
            if (cardids.length > 0){
                carddone.activities.loadCards(hostTemp, cardids, objids).then(function(){
                    var inputsearchbox = absol.buildDom({
                        tag:'searchcrosstextinput',
                        style: {
                            width: "var(--searchbox-width)"
                        },
                        props:{
                            placeholder: LanguageModule.text("txt_search")
                        }
                    });
                    var ctn = DOMElement.div({});
                    var res = carddone.activities.getDataActivityView(hostTemp, from, to);
                    if (res.chart_container !== undefined) ctn.appendChild(res.chart_container);
                    var data = carddone.activities.getDataByStatus(hostTemp, status);
                    ctn.appendChild(DOMElement.div({
                        attrs: {
                            style: {
                                paddingBottom: "var(--control-verticle-distance-2)"
                            }
                        },
                        children: [inputsearchbox]
                    }));
                    host.dataView = theme.formActivitiesContentData({
                        data: data,
                        inputsearchbox: inputsearchbox
                    });
                    ctn.appendChild(host.dataView);
                    resolve({
                        type: "activity",
                        elt: ctn
                    });
                });
            }
            else {
                resolve({
                    type: "activity",
                    elt: DOMElement.div({})
                });
            }
        });
    });
};

carddone.my_report.stageReportData = function(host, inputInfo){
    return new Promise(function(rs){
        dbcache.refresh("stage_log");
        var index, listDict, boardDict, cardDict, cardList;
        boardDict = {};
        for (var i = 0; i < inputInfo.boardValue.length; i++){
            boardDict[inputInfo.boardValue[i]] = 1;
        }
        listDict = {};
        for (var i = 0; i < host.database.lists.items.length; i++){
            if (host.database.lists.items[i].type2 == "group") continue;
            if (!boardDict[host.database.lists.items[i].boardid]) continue;
            listDict[host.database.lists.items[i].id] = {
                index: i,
                boardid: host.database.lists.items[i].boardid,
                name: host.database.lists.items[i].name,
                ident: absol.string.nonAccentVietnamese(host.database.lists.items[i].name).toLowerCase().replace(/" "/gi, "")
            }
            host.database.lists.items[i].childrenIdList = [];
        }
        cardDict = {};
        cardList = [];
        for (var i = 0; i < host.database.cards.items.length; i++){
            if (!listDict[host.database.cards.items[i].parentid]) continue;
            var editMode;
            if (host.database.cards.items[i].userid == systemconfig.userid || host.database.cards.items[i].owner == systemconfig.userid) editMode = "edit";
            else if (host.account_groupsDict[host.privDict[host.database.cards.items[i].boardid]][3]) editMode = "edit";
            else if (host.account_groupsDict[host.privDict[host.database.cards.items[i].boardid]][2]) editMode = "view";
            cardDict[host.database.cards.items[i].id] = {
                name: host.database.cards.items[i].name,
                boardid: listDict[host.database.cards.items[i].parentid].boardid,
                editMode: editMode,
                parentid: host.database.cards.items[i].parentid
            };
            cardList.push(host.database.cards.items[i].id);
        }
        contentModule.makeListsIndex3(host);
        cardList.sort(function(a, b){
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
        var time = carddone.my_report.generateRelativeTime(inputInfo.timeFilter);
        var from = new Date(time.start);
        var to = new Date(time.end);
        dbcache.loadByCondition({
            name: "stage_log",
            cond: function(record){
                return ((record.time >= from) && (record.time < to));
            },
            callback: function(retval){
                var i = 0;
                var j = 0;
                var content = [];
                while ((i < retval.length) && (j < cardList.length)) {
                    if (cardList[j] == retval[i].cardid) content.push(retval[i]);
                    else if (cardList[j] < retval[i].cardid) j++;
                    else i++;
                }
                var cardNew = {};
                for (var i = 0; i < content.length; i++){
                    if (content[i].task == 0) cardNew[content[i].cardid] = content[i];
                }
                for (var i = 0; i < content.length; i++){
                    if (content[i].task == 1) {
                        if (!cardNew[content[i].cardid]) continue;
                        if (content[i].time > cardNew[content[i].cardid].time) cardNew[content[i].cardid] = content[i];
                    }
                }
                var keys = Object.keys(cardNew);
                keys.forEach(function(elt){
                    var index = listDict[cardDict[elt].parentid].index;
                    if (index){
                        host.database.lists.items[index].childrenIdList.push(host.database.cards.items[i].id);
                    }
                });
                var keys = Object.keys(listDict);
                var returnData = {};
                var count = 0;
                keys.forEach(function(elt){
                    if (!returnData[listDict[elt].ident]) returnData[listDict[elt].ident] = {
                        name: listDict[elt].name,
                        boardid: listDict[elt].boardid,
                        cards: []
                    };
                    count += host.database.lists.items[listDict[elt].index].childrenIdList.length;
                    returnData[listDict[elt].ident].cards = returnData[listDict[elt].ident].cards.concat(host.database.lists.items[listDict[elt].index].childrenIdList);
                });
                boardDict = {};
                for (var i = 0; i < host.database.boards.items.length; i++){
                    boardDict[host.database.boards.items[i].id] = host.database.boards.items[i].name;
                }
                rs({
                    type: "stage",
                    reportData: returnData,
                    cardDict: cardDict,
                    boardDict: boardDict,
                    count: count
                });
            }
        });
    });
};

carddone.my_report.deleteReport = function(host, id){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "my_report_delete_save.php",
        params: [{name: "id", value: id}],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    host.database.report.items = host.database.report.items.filter(function(elt){
                        return elt.id != id;
                    });
                    dbcache.refresh("report");
                    dbcache.refresh("report_group_link");
                    carddone.my_report.redraw(host).then(function(singlePage){
                        host.report_container.clearChild();
                        host.report_container.addChild(singlePage);
                    });
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    });
};

carddone.my_report.editReportSave = function(host, id, value, mode){
    return new Promise(function(rs){
        var content = {
            type: value.typeValue,
            filter: value.filterContent,
            boards: value.boardValue,
            timefilter: value.timeFilter,
            address: value.locationFilter,
            advanced_filter: value.advanced_filter,
            company_report: value.company_report,
            activity_report: value.activity_report
        };
        var data = {
            name: value.nameValue,
            sharing: value.sharingValue,
            description: value.descriptionValue,
            summary: value.summaryValue,
            owner: value.ownerValue
        };
        var ver, index, gInsert, gDelete;
        if (id == 0) {
            ver = 1;
            gInsert = value.groupValue;
            gDelete = [];
        }
        else {
            index = host.database.report.getIndex(id);
            ver = host.database.report.items[index].ver;
            gInsert = value.groupValue.filter(function(elt){
                return host.database.report.items[index].groupIdList.indexOf(elt) == -1;
            });
            gDelete = host.database.report.items[index].groupIdList.filter(function(elt){
                return value.groupValue.indexOf(elt) == -1;
            });
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "my_report_edit_save.php",
            params: [
                {name: "id", value: id},
                {name: "ver", value: ver},
                {name: "content", value: EncodingClass.string.fromVariable(content)},
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "gInsert", value: EncodingClass.string.fromVariable(gInsert)},
                {name: "gDelete", value: EncodingClass.string.fromVariable(gDelete)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0) {
                            host.database.report.items.push(content.report);
                            host.database.report.items[host.database.report.items.length - 1].groupIdList = value.groupValue;
                        }
                        else {
                            var index = host.database.report.getIndex(id);
                            host.database.report.items[index] = content.report;
                            host.database.report.items[index].groupIdList = value.groupValue;
                        }
                        host.database.report_group_link.items = host.database.report_group_link.items.filter(function(elt){
                            return (elt.reportid == content.report.id && gDelete.indexOf(elt.report_groupid) != -1);
                        });
                        for (var i = 0; i < content.link.length; i++){
                            host.database.report_group_link.items.push(content.link[i]);
                        }
                        for (var i = 0; i < gDelete.length; i++){
                            var gIndex = host.database.report_groups.getIndex(gDelete[i]);
                            host.database.report_groups.items[gIndex].reportIdList = host.database.report_groups.items[gIndex].reportIdList.filter(function(elt){
                                return elt != content.report.id;
                            });
                        }
                        for (var i = 0; i < gInsert.length; i++){
                            var gIndex = host.database.report_groups.getIndex(gInsert[i]);
                            host.database.report_groups.items[gIndex].reportIdList.push(content.report.id);
                        }
                        carddone.my_report.redraw(host).then(function(singlePage){
                            host.report_container.clearChild();
                            host.report_container.addChild(singlePage);
                            rs(content.report.id);
                        });
                        host.holder.name = value.nameValue;
                        dbcache.refresh("report");
                        dbcache.refresh("report_group_link");
                    }
                    else {
                        ModalElement.alert({message: message});
                        return;
                    }
                }
                else {
                    ModalElement.alert({message: message});
                    return;
                }
            }
        });
    });
};

carddone.my_report.getMillisecondsWithoutTime = function(date){
    var y, m, d, t;
    y = date.getFullYear();
    m = date.getMonth();
    d = date.getDate();
    t = new Date(y, m, d);
    return t.getTime();
};

carddone.my_report.getMillisecondsWithoutSecond = function(date){
    var y, m, d, h, mt, t;
    y = date.getFullYear();
    m = date.getMonth();
    d = date.getDate();
    h = date.getHours();
    mt = date.getMinutes();
    t = new Date(y, m, d, h, mt);
    return t.getTime();
};

carddone.my_report.getTime = function(date){
    var start, end;
    start = carddone.my_report.getMillisecondsWithoutTime(date);
    date.setDate(date.getDate() + 1);
    end = carddone.my_report.getMillisecondsWithoutTime(date);
    return {
        start: start,
        end: end
    };
};

carddone.my_report.getWeekTime = function(firstDayOfWeek){
    var start, end;
    start = carddone.my_report.getMillisecondsWithoutTime(firstDayOfWeek);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);
    end = carddone.my_report.getMillisecondsWithoutTime(firstDayOfWeek);
    return {
        start: start,
        end: end
    };
};

carddone.my_report.getMonthTime = function(firstDayOfMonth){
    var start, end;
    start = carddone.my_report.getMillisecondsWithoutTime(firstDayOfMonth);
    firstDayOfMonth.setMonth(firstDayOfMonth.getMonth() + 1);
    end = carddone.my_report.getMillisecondsWithoutTime(firstDayOfMonth);
    return {
        start: start,
        end: end
    };
};

carddone.my_report.getQuaterTime = function(firstDayOfQuater){
    var start, end;
    start = carddone.my_report.getMillisecondsWithoutTime(firstDayOfQuater);
    firstDayOfQuater.setMonth(firstDayOfQuater.getMonth() + 3);
    end = carddone.my_report.getMillisecondsWithoutTime(firstDayOfQuater);
    return {
        start: start,
        end: end
    };
};

carddone.my_report.getYearTime = function(firstDayOfYear){
    var start, end;
    start = carddone.my_report.getMillisecondsWithoutTime(firstDayOfYear);
    firstDayOfYear.setFullYear(firstDayOfYear.getFullYear() + 1);
    end = carddone.my_report.getMillisecondsWithoutTime(firstDayOfYear);
    return {
        start: start,
        end: end
    };
};

carddone.my_report.getLastXDayTime = function(firstDay){
    var start, end;
    start = carddone.my_report.getMillisecondsWithoutTime(firstDay);
    end = carddone.my_report.getMillisecondsWithoutTime(new Date());
    return {
        start: start,
        end: end
    };
};

carddone.my_report.analyzeData = function(host, content, nationsDic, citiesDic, usersDic){
    switch (content.type) {
        case 'string':
        case 'note':
        case 'number':
        case 'email':
        case 'phonenumber':
        case 'website':
        case 'gps':
            return content.value;
        case 'datetime':
            return contentModule.formatTimeMinuteDisplay(content.value);
        case 'date':
            return contentModule.formatTimeDisplay(content.value);
        case 'userlist':
            var str = "";
            content.value.forEach(function(elt){
                if (str != "") str += "; ";
                str += data_module.users.items[usersDic[elt]].name;
            });
            return str;
        case 'user':
            return data_module.users.items[usersDic[content.value]].name;
        case 'nation':
            var index = nationsDic[content.value];
            return !index ? "" : host.database.nations.items[index].name;
        case 'city':
            var index = citiesDic[content.value];
            return !index ? "" : host.database.cities.items[index].name;
        case 'enum':
            return content.value;
        default:
            var str = "";
            var keys = Object.keys(content);
            keys.forEach(function(elt){
                if (content[elt].value.type == 'boolean'){
                    if (content[elt].value.value){
                        if (str != "") str += ", ";
                        str += content[elt].name;
                    }
                }
            });
            return str;

    }
}

carddone.my_report.filterData = function(value, condition){
    var validateData = function(comparisonValue, comparison){
        var val = false;
        switch (comparison) {
            case 1:
                if (!comparisonValue) val = true;
                break;
            case 2:
                if (comparisonValue) val = true;
                break;
            case 3:
                if (value.type == "date"){
                    val = carddone.my_report.getMillisecondsWithoutTime(comparisonValue) == carddone.my_report.getMillisecondsWithoutTime(value.value);
                }
                else if (value.type == "datetime"){
                    val = carddone.my_report.getMillisecondsWithoutSecond(comparisonValue) == carddone.my_report.getMillisecondsWithoutSecond(value.value);
                }
                else if (value.type == "number"){
                    val = parseFloat(comparisonValue) == parseFloat(value.value.replace(/,/g,""));
                }
                else {
                    val = comparisonValue == value.value;
                }
                break;
            case 4:
                if (value.type == "date"){
                    val = carddone.my_report.getMillisecondsWithoutTime(comparisonValue) != carddone.my_report.getMillisecondsWithoutTime(value.value);
                }
                else if (value.type == "datetime"){
                    val = carddone.my_report.getMillisecondsWithoutSecond(comparisonValue) != carddone.my_report.getMillisecondsWithoutSecond(value.value);
                }
                else if (value.type == "number"){
                    val = parseFloat(comparisonValue) != parseFloat(value.value.replace(/,/g,""));
                }
                else val = comparisonValue != value.value;
                break;
            case 5:
                if (value.type == "date"){
                    val = carddone.my_report.getMillisecondsWithoutTime(comparisonValue) < carddone.my_report.getMillisecondsWithoutTime(value.value);
                }
                else if (value.type == "datetime"){
                    val = carddone.my_report.getMillisecondsWithoutSecond(comparisonValue) < carddone.my_report.getMillisecondsWithoutSecond(value.value);
                }
                else if (value.type == "number"){
                    val = parseFloat(comparisonValue) < parseFloat(value.value.replace(/,/g,""));
                }
                else val = comparisonValue < value.value;
                break;
            case 6:
                if (value.type == "date"){
                    val = carddone.my_report.getMillisecondsWithoutTime(comparisonValue) <= carddone.my_report.getMillisecondsWithoutTime(value.value);
                }
                else if (value.type == "datetime"){
                    val = carddone.my_report.getMillisecondsWithoutSecond(comparisonValue) <= carddone.my_report.getMillisecondsWithoutSecond(value.value);
                }
                else if (value.type == "number"){
                    val = parseFloat(comparisonValue) <= parseFloat(value.value.replace(/,/g,""));
                }
                else val = comparisonValue <= value.value;
                break;
            case 7:
                if (value.type == "date"){
                    val = carddone.my_report.getMillisecondsWithoutTime(comparisonValue) > carddone.my_report.getMillisecondsWithoutTime(value.value);
                }
                else if (value.type == "datetime"){
                    val = carddone.my_report.getMillisecondsWithoutSecond(comparisonValue) > carddone.my_report.getMillisecondsWithoutSecond(value.value);
                }
                else if (value.type == "number"){
                    val = parseFloat(comparisonValue) > parseFloat(value.value.replace(/,/g,""));
                }
                else val = comparisonValue > value.value;
                break;
            case 8:
                if (value.type == "date"){
                    val = carddone.my_report.getMillisecondsWithoutTime(comparisonValue) >= carddone.my_report.getMillisecondsWithoutTime(value.value);
                }
                else if (value.type == "datetime"){
                    val = carddone.my_report.getMillisecondsWithoutSecond(comparisonValue) >= carddone.my_report.getMillisecondsWithoutSecond(value.value);
                }
                else if (value.type == "number"){
                    val = parseFloat(comparisonValue) >= parseFloat(value.value.replace(/,/g,""));
                }
                else val = comparisonValue >= value.value;
                break;
            case 9:
                val = value.value.toString().indexOf(comparisonValue) == 0;
                break;
            case 10:
                val = value.value.toString().indexOf(comparisonValue) != 0;
                break;
            case 11:
                val = value.value.toString().indexOf(comparisonValue) == value.value.length - comparisonValue.length;
                break;
            case 12:
                val = value.value.toString().indexOf(comparisonValue) != value.value.length - comparisonValue.length;
                break;
            case 13:
                if (['string', 'note', 'number', 'email', 'phonenumber', 'website', 'gps'].indexOf(value.type) != -1){
                    val = value.value.toString().indexOf(comparisonValue) != -1;
                }
                else if (value.type == "userlist") val = value.value.indexOf(comparisonValue) != -1;
                else {
                    var keys = Object.keys(value);
                    val = keys.indexOf(comparisonValue) != -1;
                }
                break;
            case 14:
                if (['string', 'note', 'number', 'email', 'phonenumber', 'website', 'gps'].indexOf(value.type) != -1){
                    val = value.value.toString().indexOf(comparisonValue) == -1;
                }
                else if (value.type == "userlist") val = value.value.indexOf(comparisonValue) == -1;
                else {
                    var keys = Object.keys(value);
                    val = keys.indexOf(comparisonValue) == -1;
                }
                break;
        }
        return val;
    }
    if (condition.filterType == 'time'){
        var time, temp;
        var date = new Date();
        switch (condition.value) {
            case 1:
                date.setDate(date.getDate() - 1);
                time = carddone.my_report.getTime(date);
                break;
            case 2:
                time = carddone.my_report.getTime(date);
                break;
            case 3:
                temp = date.getDay() - 1;
                date.setDate(date.getDate() - temp - 7);
                time = carddone.my_report.getWeekTime(date);
                break;
            case 4:
                temp = date.getDay() - 1;
                date.setDate(date.getDate() - temp);
                time = carddone.my_report.getWeekTime(date);
                break;
            case 5:
                date.setDate(date.getDate() - 7);
                time = carddone.my_report.getTime(date);
                break;
            case 6:
                date.setMonth(date.getMonth() - 1);
                date.setDate(1);
                time = carddone.my_report.getMonthTime(date);
                break;
            case 7:
                date.setDate(1);
                time = carddone.my_report.getMonthTime(date);
                break;
            case 8:
                date.setDate(date.getDate() - 30);
                time = carddone.my_report.getTime(date);
                break;
            case 9:
                temp = Math.floor(date.getMonth() / 3) * 3;
                date.setMonth(temp - 3);
                date.setDate(1);
                time = carddone.my_report.getQuaterTime(date);
                break;
            case 10:
                temp = Math.floor(date.getMonth() / 3) * 3;
                date.setMonth(temp);
                date.setDate(1);
                time = carddone.my_report.getQuaterTime(date);
                break;
            case 11:
                date.setDate(date.getDate() - 90);
                time = carddone.my_report.getTime(date);
                break;
            case 12:
                date.setDate(1);
                date.setMonth(0);
                date.setFullYear(date.getFullYear() - 1);
                time = carddone.my_report.getYearTime(date);
        }
        var x = value.value.getTime();
        if (x >= time.start && x < time.end) return true;
        return false;
    }
    else if (condition.filterType == 'simple'){
        if (condition.value == 1){
            for (var i = 0; i < condition.content.length; i++){
                if (!validateData(condition.content[i].value, condition.content[i].comparison)) return false;
            }
            return true;
        }
        else {
            for (var i = 0; i < condition.content.length; i++){
                if (validateData(condition.content[i].value, condition.content[i].comparison)) return true;
            }
            return false;
        }
    }
    else if (condition.filterType == 'advanced'){
        return (validateData(condition.value, condition.comparison));
    }
    else return true;
};

carddone.my_report.reportAdvancedFilter = function(host, reportCardContent, advanced_filter){
    var data = {};
    var makeDic = function(list){
        var dic = {};
        list.forEach(function(elt, idx){
            dic[elt.id] = idx;
        });
        return dic;
    };
    var typelistsDic = makeDic(host.database.typelists.items);
    var valueDic = makeDic(host.database.values.items);
    var keys = Object.keys(reportCardContent);
    if (advanced_filter.filter.length > 0){
        if (advanced_filter.filter[0].comparison == 3){
            var companyCardDic = {};
            keys.forEach(function(elt){
                var fieldData, isDisplay;
                if (reportCardContent[elt].fields[advanced_filter.typeid]){
                    var t = {
                        everyElt: [],
                        someElt: []
                    };
                    for (var j = 0; j < advanced_filter.filter.length; j++){
                        t.everyElt[j] = [];
                        t.someElt[j] = [];
                        for (var i = 0; i < reportCardContent[elt].fields[advanced_filter.typeid].length; i++){
                            fieldData = contentModule.getFieldDataToReport(host, reportCardContent[elt].fields[advanced_filter.typeid][i].typeid, reportCardContent[elt].fields[advanced_filter.typeid][i].valueid, typelistsDic, valueDic);
                            if (advanced_filter.filter[j].comparison == 3 && advanced_filter.filter[j].value == 0){
                                isDisplay = true;
                                for (var ni = 0; ni < advanced_filter.filter[j].child.length; ni++){
                                    advanced_filter.filter[j].child[ni].filterType = "advanced";
                                    isDisplay = carddone.my_report.filterData(fieldData[advanced_filter.filter[j].child[ni].typeid].value, advanced_filter.filter[j].child[ni]);
                                    if (!isDisplay) break;
                                }
                                t.everyElt[j].push(!isDisplay);
                            }
                            else {
                                isDisplay = true;
                                for (var ni = 0; ni < advanced_filter.filter[j].child.length; ni++){
                                    advanced_filter.filter[j].child[ni].filterType = "advanced";
                                    isDisplay = carddone.my_report.filterData(fieldData[advanced_filter.filter[j].child[ni].typeid].value, advanced_filter.filter[j].child[ni]);
                                    if (!isDisplay) break;
                                }
                                t.someElt[j].push(isDisplay);
                            }
                        }
                    }
                    var kt = true;
                    for (var i = 0; i < t.everyElt.length; i++){
                        if (t.everyElt[i].length > 0){
                            if (!t.everyElt[i].every(function(e){ return e; })) kt = false;
                        }
                    }
                    for (var i = 0; i < t.someElt.length; i++){
                        if (t.someElt[i].length > 0){
                            if (!t.someElt[i].some(function(s){ return s; })) kt = false;
                        }
                    }
                    reportCardContent[elt].companyIdList.forEach(function(item){
                        if (!companyCardDic[item]) companyCardDic[item] = {
                            passed: [],
                            notPassed: []
                        };
                        if (kt) {
                            companyCardDic[item].passed.push(elt);
                        }
                        else companyCardDic[item].notPassed.push(elt);
                    });
                }
            });
            var companies = Object.keys(companyCardDic);
            var cards = [];
            companies.forEach(function(elt){
                if (companyCardDic[elt].notPassed.length == 0){
                    companyCardDic[elt].passed.forEach(function(item){cards.push(item);});
                }
            });
            cards.forEach(function(elt){
                data[elt] = reportCardContent[elt];
            });
        }
        else {
            var companyCardDic = {};
            keys.forEach(function(elt){
                var fieldData, isDisplay;
                if (reportCardContent[elt].fields[advanced_filter.typeid]){
                    var kt = true;
                    var passCondition = [false, false];
                    for (var j = 0; j < advanced_filter.filter.length; j++){
                        for (var i = 0; i < reportCardContent[elt].fields[advanced_filter.typeid].length; i++){
                            fieldData = contentModule.getFieldDataToReport(host, reportCardContent[elt].fields[advanced_filter.typeid][i].typeid, reportCardContent[elt].fields[advanced_filter.typeid][i].valueid, typelistsDic, valueDic);
                            isDisplay = true;
                            for (var ni = 0; ni < advanced_filter.filter[j].child.length; ni++){
                                advanced_filter.filter[j].child[ni].filterType = "advanced";
                                isDisplay = carddone.my_report.filterData(fieldData[advanced_filter.filter[j].child[ni].typeid].value, advanced_filter.filter[j].child[ni]);
                                if (!isDisplay) break;
                            }
                            if (isDisplay){
                                break;
                            }
                        }
                        passCondition[j] = isDisplay;
                    }
                    reportCardContent[elt].companyIdList.forEach(function(item){
                        if (!companyCardDic[item]) companyCardDic[item] = {};
                        companyCardDic[item][elt] = passCondition;
                    });
                }
            });
            var companies = Object.keys(companyCardDic);
            var cards = [];
            companies.forEach(function(elt){
                var passCondition = [false, false];
                var tempCard = Object.keys(companyCardDic[elt]);
                var array = [];
                tempCard.forEach(function(item){
                    var x = false;
                    var k = -1;
                    companyCardDic[elt][item].forEach(function(current, idx){
                        if (current) {
                            x = true;
                            k = idx;
                        }
                        if (!passCondition[idx]) passCondition[idx] = current;
                    });
                    if (x && k == 1) array.push(item);
                });
                if (passCondition.every(function(s){ return s; })) cards = cards.concat(array);
            });
            cards.forEach(function(elt){
                data[elt] = reportCardContent[elt];
            });
        }
    }
    else data = reportCardContent;
    return data;
};

carddone.my_report.generateCompanyReport = function(host, reportCardContent, company_report, cardDic) {
    var item, boards, cards;
    var data = [];
    var lastRowData = [];
    var makeDic = function(list){
        var dic = {};
        list.forEach(function(elt, idx){
            dic[elt.id] = idx;
        });
        return dic;
    };
    var typelistsDic = makeDic(host.database.typelists.items);
    var valueDic = makeDic(host.database.values.items);
    var companiesDic = makeDic(host.database.companies.items);
    var contactsDic = makeDic(host.database.contact.items);
    var company_classDic = makeDic(host.database.company_class.items);
    var usersDic = makeDic(data_module.users.items);
    var nationsDic = makeDic(host.database.nations.items);
    var citiesDic = makeDic(host.database.cities.items);
    var districtsDic = makeDic(host.database.districts.items);
    var keys = Object.keys(reportCardContent);
    var companies = {};
    var name;
    keys.forEach(function(elt, ni){
        if (!reportCardContent[elt].fields[company_report.fieldID]) return;
        var fieldData, cIndex, t_index, count, subItem, isDisplay, notEmptyIndexArray;
        var contactStr = "";
        var companyStr = "";
        var temp_companies = EncodingClass.string.duplicate(companies);
        var temp_data_length = data.length;
        cIndex = cardDic[elt];
        for (var i = 0; i < reportCardContent[elt].fields[company_report.fieldID].length; i++){
            fieldData = contentModule.getFieldDataToReport(host, reportCardContent[elt].fields[company_report.fieldID][i].typeid, reportCardContent[elt].fields[company_report.fieldID][i].valueid, typelistsDic, valueDic);
            var reportValue = fieldData[company_report.itemID].value.value;
            if (!name) name = fieldData[company_report.itemID].name;
            if (host.database.cards.items[cIndex].companyList) host.database.cards.items[cIndex].companyList.forEach(function(elt2){
                var index = companiesDic[elt2];
                if (index){
                    if (!companies[elt2]) companies[elt2] = {
                        classid: host.database.companies.items[index].company_classid,
                        sum: parseFloat(reportValue.replace(/,/g,""))
                    }
                    else companies[elt2].sum += parseFloat(reportValue.replace(/,/g,""));
                }
            });
        }
    });
    var header = [
        {value: LanguageModule.text("txt_index")},
        {value: LanguageModule.text("txt_company")},
        {value: LanguageModule.text("txt_class")},
        {value: LanguageModule.text("txt_address")},
        {value: LanguageModule.text("txt_district")},
        {value: LanguageModule.text("txt_city")},
        {value: LanguageModule.text("txt_gps")},
        {value: name}
    ]
    var data = [];
    keys = Object.keys(companies);
    var count = 1;
    host.listGPS = [];
    keys.forEach(function(elt){
        if (companies[elt].sum == 0) return;
        var mainValue = contentModule.fromDouble(parseFloat(companies[elt].sum), host.database.typelists.items[host.database.typelists.getIndex(company_report.fieldID)].decpre);
        data.push([
            {value: count++},
            {value: host.database.companies.items[companiesDic[elt]].name},
            {value: company_classDic[companies[elt].classid] ? host.database.company_class.items[company_classDic[companies[elt].classid]].name : ""},
            {value: host.database.companies.items[companiesDic[elt]].address},
            {value: districtsDic[host.database.companies.items[companiesDic[elt]].districtid] ? host.database.districts.items[districtsDic[host.database.companies.items[companiesDic[elt]].districtid]].name : ""},
            {value: citiesDic[host.database.companies.items[companiesDic[elt]].cityid] ? host.database.cities.items[citiesDic[host.database.companies.items[companiesDic[elt]].cityid]].name : ""},
            {value: host.database.companies.items[companiesDic[elt]].gps == "" ? LanguageModule.text("txt_no") : LanguageModule.text("txt_yes")},
            {value: mainValue, style: {textAlign: "right"}}
        ]);
        var note = "";
        if (company_classDic[companies[elt].classid]) note += (host.database.company_class.items[company_classDic[companies[elt].classid]].name + ": ");
        note += host.database.companies.items[companiesDic[elt]].name;
        if (host.database.companies.items[companiesDic[elt]].address != "") note += (", " + host.database.companies.items[companiesDic[elt]].address);
        if (districtsDic[host.database.companies.items[companiesDic[elt]].districtid]) note += (", " + host.database.districts.items[districtsDic[host.database.companies.items[companiesDic[elt]].districtid]].name);
        if (citiesDic[host.database.companies.items[companiesDic[elt]].cityid]) note += (", " + host.database.cities.items[citiesDic[host.database.companies.items[companiesDic[elt]].cityid]].name);
        note += (". " + name + ": " + mainValue);
        if (host.database.companies.items[companiesDic[elt]].gps != ""){
            var x = host.database.companies.items[companiesDic[elt]].gps.indexOf(",");
            if (x > 0){
                var lat = parseFloat(host.database.companies.items[companiesDic[elt]].gps.substr(0, x));
                var lng = parseFloat(host.database.companies.items[companiesDic[elt]].gps.substr(x + 1));
                if (!isNaN(lat) && !isNaN(lng)){
                    host.listGPS.push({
                        lat: lat,
                        lng:lng,
                        color: "red",
                        tooltip: {element: absol._({child: {text:note}})},
                        data: parseFloat(companies[elt].sum),
                    });
                };
            }
        }
    });
    host.listGPS.caculateSum = function(decpre){
        return function(array){
            var sum = 0;
            array.forEach(function(elt){ sum += elt.data.data });
            var rs = contentModule.fromDouble(parseFloat(sum), decpre);
            return {element: absol._({child: {text:rs}})}
        };
    }(host.database.typelists.items[host.database.typelists.getIndex(company_report.fieldID)].decpre);
    return {
        header: header,
        data: data
    };
};

carddone.my_report.viewMaps = function(host){
    if (!host.listGPS || host.listGPS.length == 0){
        ModalElement.alert({message: LanguageModule.text("war_no_data_to_view_map")});
        return;
    }
    var singlePage = host.funcs.viewMaps({
        cmdButton: {
            close: function(){
                host.frameList.removeLast();
            }
        },
        listGPS: host.listGPS
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.my_report.generateReportData = function(host, reportCardContent, filterContent, boardArray, cardDic){
    var item, boards, cards;
    var typeIdList = [];
    var typeContentList = {};
    var header = [{value: LanguageModule.text("txt_board")}, {value: LanguageModule.text("txt_card")}, {value: LanguageModule.text("txt_company")}, {value: LanguageModule.text("txt_contact")}];
    var data = [];
    var lastRowData = [];
    var makeDic = function(list){
        var dic = {};
        list.forEach(function(elt, idx){
            dic[elt.id] = idx;
        });
        return dic;
    };
    var typelistsDic = makeDic(host.database.typelists.items);
    var valueDic = makeDic(host.database.values.items);
    var companiesDic = makeDic(host.database.companies.items);
    var contactsDic = makeDic(host.database.contact.items);
    var company_classDic = makeDic(host.database.company_class.items);
    var usersDic = makeDic(data_module.users.items);
    var nationsDic = makeDic(host.database.nations.items);
    var citiesDic = makeDic(host.database.cities.items);
    boards = {};
    cards = {};
    filterContent.forEach(function(elt, idx){
        header.push({value: elt.title});
        var str = elt.value.substr(2);
        var index = str.indexOf(":");
        if (index != -1){
            elt.typeid = parseInt(str.substr(0, index));
            elt.localid = str.substr(index + 1);
        }
        else elt.typeid = parseInt(str);
        if (typeIdList.indexOf(elt.typeid) == -1) typeIdList.push(elt.typeid);
        if (!typeContentList[elt.typeid]) typeContentList[elt.typeid] = [];
        typeContentList[elt.typeid].push({localid: elt.localid, index: idx});
        lastRowData.push({sum: 0, count: 0});
    });
    header.push({});
    var keys = Object.keys(reportCardContent);
    boards = [];
    cards = [];
    if (filterContent.length > 0){
        var companies = {};
        keys.forEach(function(elt, ni){
            var fieldData, cIndex, t_index, count, subItem, isDisplay, notEmptyIndexArray;
            var contactStr = "";
            var companyStr = "";
            var companiesDetail = {};
            var temp_companies = EncodingClass.string.duplicate(companies);
            var temp_data_length = data.length;
            cIndex = cardDic[reportCardContent[elt].cardid];
            if (host.database.cards.items[cIndex].companyList) host.database.cards.items[cIndex].companyList.forEach(function(elt){
                var index = companiesDic[elt];
                if (index){
                    var classid = host.database.companies.items[index].company_classid;
                    if (!companies[classid]) companies[classid] = {};
                    companies[classid][elt] = 1;
                    if (!companiesDetail[classid]) companiesDetail[classid] = {};
                    companiesDetail[classid][elt] = 1;
                    if (companyStr != "") companyStr += ", ";
                    companyStr += host.database.companies.items[index].name;
                }
            });
            if (host.database.cards.items[cIndex].contactList) host.database.cards.items[cIndex].contactList.forEach(function(elt){
                var index = contactsDic[elt];
                if (index){
                    if (contactStr != "") contactStr += ", ";
                    contactStr += host.database.contact.items[index].firstname + " " + host.database.contact.items[index].lastname;
                }
            });
            for (var j = 0; j < typeIdList.length; j++){
                if (!reportCardContent[elt].fields[typeIdList[j]]) continue;
                for (var i = 0; i < reportCardContent[elt].fields[typeIdList[j]].length; i++){
                    notEmptyIndexArray = [];
                    item = [{value: reportCardContent[elt].boardName, textAlign: "left"}, {value: reportCardContent[elt].name, textAlign: "left"}, {value: companyStr, textAlign: "left", companiesDetail: companiesDetail}, {value: contactStr, textAlign: "left"}];
                    for (var ni = 0; ni < filterContent.length; ni++){
                        item.push({});
                    }
                    fieldData = contentModule.getFieldDataToReport(host, reportCardContent[elt].fields[typeIdList[j]][i].typeid, reportCardContent[elt].fields[typeIdList[j]][i].valueid, typelistsDic, valueDic);
                    if (host.database.typelists.items[typelistsDic[typeIdList[j]]].type == 'structure'){
                        for (var ni = 0; ni < typeContentList[typeIdList[j]].length; ni++){
                            var elt2 = typeContentList[typeIdList[j]][ni];
                            isDisplay = carddone.my_report.filterData(fieldData[elt2.localid].value, filterContent[elt2.index].filter);
                            if (!isDisplay) break;
                            notEmptyIndexArray.push({index: elt2.index, value: fieldData[elt2.localid].value});
                            var textAlign;
                            if (fieldData[elt2.localid].value.type == "number") textAlign = "right";
                            else if (fieldData[elt2.localid].value.type == "date" || fieldData[elt2.localid].value.type == "datetime") textAlign = "center";
                            else textAlign = "left";
                            item[elt2.index + 4] = {value: carddone.my_report.analyzeData(host, fieldData[elt2.localid].value, nationsDic, citiesDic, usersDic), textAlign: textAlign, type: fieldData[elt2.localid].value.type};
                        }
                    }
                    else {
                        isDisplay = carddone.my_report.filterData(fieldData, filterContent[typeContentList[typeIdList[j]][0].index].filter);
                        item[typeContentList[typeIdList[j]][0].index + 4] = {value: carddone.my_report.analyzeData(host, fieldData, nationsDic, citiesDic, usersDic)};
                        notEmptyIndexArray.push({index: typeContentList[typeIdList[j]][0].index, value: fieldData});
                    }
                    if (!isDisplay) continue;
                    notEmptyIndexArray.forEach(function(elt2){
                        lastRowData[elt2.index].count++;
                        if (elt2.value.type == "number"){
                            lastRowData[elt2.index].sum += parseFloat(elt2.value.value.replace(/,/g,""));
                        }
                    });
                    item.push({
                        element: absol._({
                            tag: "i",
                            class: ['mdi', 'mdi-file-edit-outline', 'card-button-icons'],
                            props: {
                                title: LanguageModule.text("txt_open_card")
                            },
                            on: {
                                click: function(){
                                    var editMode;
                                    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
                                    else if (host.account_groupsDict[host.privDict[host.database.cards.items[cIndex].boardid]][3]) editMode = "edit";
                                    else if (host.account_groupsDict[host.privDict[host.database.cards.items[cIndex].boardid]][2]) editMode = "view";
                                    var content = {
                                        archiveCard: host.database.cards.items[cIndex].archiveCard,
                                        boardid: host.database.cards.items[cIndex].boardid,
                                        cardid: reportCardContent[elt].cardid,
                                        listid: host.database.cards.items[cIndex].parentid,
                                        permission: editMode
                                    };
                                    carddone.menu.loadPage(11, content);
                                }
                            }
                        })
                    });
                    data.push(item);
                    boards[reportCardContent[elt].boardid] = 1;
                    cards[reportCardContent[elt].cardid] = 1;
                }
            }
            if (temp_data_length == data.length) companies = temp_companies;
        });
        item = [{value: LanguageModule.text("txt_count") + ": " + (Object.keys(boards)).length, textAlign: "left"}, {value: LanguageModule.text("txt_count") + ": " + (Object.keys(cards)).length, textAlign: "left"}];
        var classArray = Object.keys(companies);
        var str = "";
        for (var i = 0; i < classArray.length; i++){
            var classIndex = company_classDic[classArray[i]];
            if (str != "") str += ";";
            if (classIndex >= 0) str += host.database.company_class.items[classIndex].name + ": " + Object.keys(companies[classArray[i]]).length;
            else str += LanguageModule.text("txt_no_type") + ": " + Object.keys(companies[classArray[i]]).length;
        }
        item.push({value: str, textAlign: "left"});
        item.push({value: ""});
    }
    else {
        keys.forEach(function(elt){
            item = [{value: reportCardContent[elt].boardName}, {value: reportCardContent[elt].name}];
            data.push(item);
        });
        item = [{value: LanguageModule.text("txt_count") + ": " + boardArray.length, textAlign: "left"}, {value: LanguageModule.text("txt_count") + ": " + keys.length, textAlign: "left"}, {value: ""}, {value: ""}];
    }

    for (var ni = 0; ni < filterContent.length; ni++){
        item.push({});
    }

    lastRowData.forEach(function(elt, index){
        var str = "";
        filterContent[index].last_row.forEach(function(elt2){
            if (str != "") str += ";";
            switch (elt2) {
                case 'count':
                    str += (LanguageModule.text("txt_count") + ": " + elt.count);
                    break;
                case 'sum':
                    str += (LanguageModule.text("txt_sum") + ": " + contentModule.fromDouble(elt.sum, 2));
                    break;
                case 'average':
                    str += (LanguageModule.text("txt_average") + ": " + contentModule.fromDouble((elt.sum / elt.count), 2));
                    break;
            }
        });
        item[index + 4] = {value: str, textAlign: "left"};
    });

    item.push({});

    data.push(item);

    header.forEach(function(elt){
        elt.style = {minWidth: "unset"}
    });

    return {
        header: header,
        data: data
    };
}

carddone.my_report.mergeArray = function(array1, array2){
    var n = array1.length;
    var m = array2.length;
    var x = 0;
    var y = 0;
    var temp = [];
    while (1) {
        if ((x >= n) && (y >= m)) break;
        if (x >= n) {
            temp.push(array2[y++]);
        }
        else if (y >= m) {
            temp.push(array1[x++]);
        }
        else if (array1[x].id == array2[y].id) {
            temp.push(array1[x++]);
            y++;
        }
        else if (array1[x].id < array2[y].id) {
            temp.push(array1[x++]);
        }
        else {
            temp.push(array2[y++]);
        }
    }
    return temp;
}

carddone.my_report.generateRelativeTime = function(condition){
    var time, temp;
    var date = new Date();
    switch (condition.value) {
        case 0:
            var from = carddone.my_report.getMillisecondsWithoutTime(condition.from);
            from = new Date(from);
            var to = carddone.my_report.getMillisecondsWithoutTime(condition.to);
            to = new Date(to);
            to.setDate(to.getDate() + 1);
            time = {
                start: from.getTime(),
                end: to.getTime()
            };
            break;
        case 1:
            date.setDate(date.getDate() - 1);
            time = carddone.my_report.getTime(date);
            break;
        case 2:
            time = carddone.my_report.getTime(date);
            break;
        case 3:
            temp = date.getDay() - 1;
            date.setDate(date.getDate() - temp - 7);
            time = carddone.my_report.getWeekTime(date);
            break;
        case 4:
            temp = date.getDay() - 1;
            date.setDate(date.getDate() - temp);
            time = carddone.my_report.getWeekTime(date);
            break;
        case 5:
            date.setDate(date.getDate() - 7);
            time = carddone.my_report.getLastXDayTime(date);
            break;
        case 6:
            date.setMonth(date.getMonth() - 1);
            date.setDate(1);
            time = carddone.my_report.getMonthTime(date);
            break;
        case 7:
            date.setDate(1);
            time = carddone.my_report.getMonthTime(date);
            break;
        case 8:
            date.setDate(date.getDate() - 30);
            time = carddone.my_report.getLastXDayTime(date);
            break;
        case 9:
            temp = Math.floor(date.getMonth() / 3) * 3;
            date.setMonth(temp - 3);
            date.setDate(1);
            time = carddone.my_report.getQuaterTime(date);
            break;
        case 10:
            temp = Math.floor(date.getMonth() / 3) * 3;
            date.setMonth(temp);
            date.setDate(1);
            time = carddone.my_report.getQuaterTime(date);
            break;
        case 11:
            date.setDate(date.getDate() - 90);
            time = carddone.my_report.getLastXDayTime(date);
            break;
        case 12:
            date.setDate(1);
            date.setMonth(0);
            date.setFullYear(date.getFullYear() - 1);
            time = carddone.my_report.getYearTime(date);
    }
    return time;
};

carddone.my_report.filterCompany = function(host, filterContent){
    var compareFunc = function(value1, comparison, value2){
        var val = false;
        switch (comparison) {
            case 1:
                val = (value1 == "" || value1 == 0);
                break;
            case 2:
                val = (value1 != "" || value1 != 0);
                break;
            case 3:
                val = value1 == value2;
                break;
            case 4:
                val = value1 != value2;
                break;
            case 5:
                val = value1 < value2;
                break;
            case 6:
                val = value1 <= value2;
                break;
            case 7:
                val = value1 > value2;
                break;
            case 8:
                val = value1 >= value2;
                break;
            case 9:
                val = value1.indexOf(value2) == 0;
                break;
            case 10:
                val = value1.indexOf(value2) != 0;
                break;
            case 11:
                val = value1.indexOf(value2) == value1.length - value2.length;
                break;
            case 12:
                val = value1.indexOf(value2) != value1.length - value2.length;
                break;
            case 13:
                val = value1.indexOf(value2) != -1;
                break;
            case 14:
                val = value1.indexOf(value2) == -1;
                break;
            default:

        }
        return val;
    }
    var validateData = function(companyContent, type, comparison, value){
        switch (type) {
            case "shortname":
                return compareFunc(companyContent.name, comparison, value);
                break;
            case "entirename":
                return compareFunc(companyContent.fullname, comparison, value);
                break;
            case "address":
                return compareFunc(companyContent.address, comparison, value);
                break;
            case "email":
                return compareFunc(companyContent.email, comparison, value);
                break;
            case "phonenumber":
                return compareFunc(companyContent.phone, comparison, value);
                break;
            case "website":
                return compareFunc(companyContent.website, comparison, value);
                break;
            case "gps":
                return compareFunc(companyContent.gps, comparison, value);
                break;
            case "fax":
                return compareFunc(companyContent.fax, comparison, value);
                break;
            case "taxcode":
                return compareFunc(companyContent.taxcode, comparison, value);
                break;
            case "companyclass":
                return compareFunc(companyContent.company_classid, comparison, value);
                break;
            case "nation":
                return compareFunc(companyContent.nationid, comparison, value);
                break;
            case "city":
                return compareFunc(companyContent.cityid, comparison, value);
                break;
            case "district":
                return compareFunc(companyContent.districtid, comparison, value);
                break;
            default:
                return compareFunc(companyContent.email, comparison, value);
                break;

        }
    }
    var companies = {};
    var k;
    host.database.companies.items.forEach(function(elt){
        k = true;
        for (var i = 0; i < filterContent.length; i++){
            var item = filterContent[i];
            var val = [];
            if (item.filter.filterType == "simple"){
                for (var j = 0; j < item.filter.content.length; i++){
                    // if ()
                }
            }
        }
    });
};

carddone.my_report.loadReportData = function(host, inputInfo){
    return new Promise(function(rs){
        ModalElement.show_loading();
        dbcache.refresh("values");
        dbcache.refresh("objects");
        dbcache.refresh("obj_list");
        var index, valueArray, objIndex, from, to, companies;
        var companyCardDic = {};
        carddone.my_report.cardContent = {};
        var time = carddone.my_report.generateRelativeTime(inputInfo.timeFilter);
        from = new Date(time.start);
        to = new Date(time.end);
        companies = {};
        if (inputInfo.locationFilter.value == "company") {
            inputInfo.locationFilter.company.forEach(function(elt){
                companies[elt] = 1;
            })
        }
        else if (inputInfo.locationFilter.value == "address"){
            host.database.companies.items.forEach(function(elt){
                var kt1 = false, kt2 = false, kt3 = false;
                if (inputInfo.locationFilter.nation != 0) {
                    if (inputInfo.locationFilter.nation == elt.nationid) kt1 = true;
                }
                else kt1 = true;
                if (inputInfo.locationFilter.city != 0) {
                    if (inputInfo.locationFilter.city == elt.cityid) kt2 = true;
                }
                else kt2 = true;
                if (inputInfo.locationFilter.district != 0) {
                    if (inputInfo.locationFilter.district == elt.districtid) kt3 = true;
                }
                else kt3 = true;
                if (kt1 && kt2 && kt3) companies[elt.id] = 1;
            });
        }
        else host.database.companies.items.forEach(function(elt){
            companies[elt.id] = 1;
        });
        var makeReportDatabase = function(){
            var cardDic = {};
            var cards = {};
            host.database.cards.items.forEach(function(elt, idx){
                cardDic[elt.id] = idx;
            });
            for (var i = 0; i < inputInfo.boardValue.length; i++){
                index = host.database.boards.getIndex(inputInfo.boardValue[i]);
                host.database.boards.items[index].cardIdList.forEach(function(elt){
                    cards[elt] = 1;
                    carddone.my_report.cardContent[elt] = {
                        boardid: inputInfo.boardValue[i],
                        cardid: elt,
                        boardName: host.database.boards.items[index].name,
                        name: host.database.cards.items[cardDic[elt]].name,
                        fields: {},
                        companyIdList: host.database.cards.items[cardDic[elt]].companyList
                    };
                });
            }
            var objDic = {};
            for (var i = 0; i < host.database.objects.items.length; i++){
                objDic[host.database.objects.items[i].id] = i;
            }
            var cardIndex, objIndex;
            for (var i = 0; i < host.database.obj_list.items.length; i++){
                if (!cards[host.database.obj_list.items[i].listid]) continue;
                objIndex = objDic[host.database.obj_list.items[i].objid];
                if (objIndex >= 0) {
                    if (host.database.objects.items[objIndex].type != "field") continue;
                    if (!carddone.my_report.cardContent[host.database.obj_list.items[i].listid].fields[host.database.objects.items[objIndex].typeid]) {
                        carddone.my_report.cardContent[host.database.obj_list.items[i].listid].fields[host.database.objects.items[objIndex].typeid] = [];
                    }
                    carddone.my_report.cardContent[host.database.obj_list.items[i].listid].fields[host.database.objects.items[objIndex].typeid].push(host.database.objects.items[objIndex]);
                }
            }
            var cardContent;
            if (inputInfo.typeValue == "advanced") cardContent = carddone.my_report.reportAdvancedFilter(host, carddone.my_report.cardContent, inputInfo.advanced_filter);
            else cardContent = carddone.my_report.cardContent;
            var reportData;
            if (inputInfo.typeValue == "company") reportData = carddone.my_report.generateCompanyReport(host, cardContent, inputInfo.company_report, cardDic);
            else reportData = carddone.my_report.generateReportData(host, cardContent, inputInfo.filterContent, inputInfo.boardValue, cardDic);
            reportData.type = inputInfo.typeValue;
            host.reportData = reportData;
            ModalElement.close(-1);
            rs(reportData);
        }
        carddone.my_report.valueObjectData = {};
        carddone.my_report.timeFilter.from = from;
        carddone.my_report.timeFilter.to = to;
        var loadByTime = data_module.loadByConditionAsync({
            name: "values",
            cond: function(record){
                return ((record.timecontent >= from) && (record.timecontent < to));
            },
            callback: function(retval){
                var descendantid = {};
                retval.forEach(function(elt){
                    descendantid[elt.id] = 1;
                });
                return descendantid;
            }
        });
        var loadByDescendanId = loadByTime.then(function(descendantid){
            return data_module.loadByConditionAsync({
                name: "values",
                cond: function(record){
                    return record.typeid > 0;
                },
                callback: function(retval){
                    var dict = {};
                    retval.forEach(function(elt){
                        var t = data_module.parseValueId(elt.descendantid);
                        if (t.some(function(item){
                            return descendantid[item];
                        })) {
                            dict[elt.id] = 1;
                            t.forEach(function(item){
                                dict[item] = 1;
                            });
                        }
                    });
                    return dict;
                }
            });
        });
        loadByDescendanId.then(function(dict){
            var loadValues = data_module.loadByConditionAsync({
                name: "values",
                cond: function(record){
                    return dict[record.id] == 1;
                },
                callback: function(retval){
                    host.database.values = data_module.makeDatabase(retval);
                }
            });
            var loadObjects = data_module.loadByConditionAsync({
                name: "objects",
                cond: function(record){
                    return dict[record.valueid] == 1;
                },
                callback: function(retval){
                    host.database.objects = data_module.makeDatabase(retval);
                    var dict = {};
                    host.database.objects.items.forEach(function(elt){
                        dict[elt.id] = 1;
                    });
                    return dict;
                }
            });
            var loadObj_list = loadObjects.then(function(objDict){
                return data_module.loadByConditionAsync({
                    name: "obj_list",
                    cond: function(record){
                        return objDict[record.objid] == 1;
                    },
                    callback: function(retval){
                        host.database.obj_list = data_module.makeDatabase(retval);
                    }
                });
            });
            Promise.all([loadObj_list, loadValues]).then(function(){
                makeReportDatabase();
            })
        });
    });
};

carddone.my_report.editReport = function(host, groupid, id){
    var report_name, report_group, owner, share_status, description, index, content, summary, timefilter, address;
    var report_type, report_filter, singlePage, boardList, advanced_filter, fieldID, itemID;
    var statusActivity, usersActivityValues;
    carddone.my_report.loadedBoard = [];
    host.reportData = undefined;
    if (id  == 0){
        report_name = "";
        report_group = [],
        share_status = 0;
        description = "";
        summary = "";
        report_type = "simple";
        report_filter = [];
        boardList = [];
        advanced_filter = {};
        timefilter = {
            value: 1,
            from: new Date(),
            to: new Date()
        };
        address = {
            value: "none",
            company: [],
            nation: 0,
            city: 0,
            district: 0
        };
        owner = systemconfig.userid;
        statusActivity = "all";
        usersActivityValues = [systemconfig.userid];
    }
    else {
        index  = host.database.report.getIndex(id);
        report_name = host.database.report.items[index].name;
        report_group = host.database.report.items[index].groupIdList;
        share_status = host.database.report.items[index].sharing;
        description = host.database.report.items[index].description;
        summary = host.database.report.items[index].summary;
        content = EncodingClass.string.toVariable(host.database.report.items[index].content);
        report_type = content.type;
        report_filter = content.filter;
        boardList = content.boards;
        timefilter = content.timefilter;
        address = content.address;
        fieldID = content.company_report ? content.company_report.fieldID : undefined;
        itemID = content.company_report ? content.company_report.itemID : undefined;
        advanced_filter = content.advanced_filter ? content.advanced_filter : {};
        owner = host.database.report.items[index].owner;
        host.holder.name = report_name;
        if (content.activity_report === undefined){
            statusActivity = "all";
            usersActivityValues = [systemconfig.userid];
        }
        else {
            statusActivity = content.activity_report.status;
            usersActivityValues = content.activity_report.users;
        }
    }

    boardList = boardList.filter(function(elt){
        if (elt == 0) return true;
        return host.database.boards.getIndex(elt) != -1;
    });

    var makeFieldData = function(fieldList){
        var fieldItems = [];
        for (var i = 0; i < fieldList.length; i++){
            var index  = host.database.typelists.getIndex(fieldList[i]);
            switch (host.database.typelists.items[index].type) {
                case 'structure':
                    host.database.typelists.items[index].content.details.forEach(function(elt, idx){
                        fieldItems.push({
                            text: host.database.typelists.items[index].name + ": " + elt.name,
                            value: "s:" + host.database.typelists.items[index].id + ":" + elt.localid,
                            type: host.database.typelists.items[host.database.typelists.getIndex(elt.type)].type,
                            typeid: elt.type,
                            typeName: host.database.typelists.items[index].name,
                            group: fieldList[i],
                            localid: elt.localid
                        });
                    });
                    break;
                default:
                    fieldItems.push({
                        text: host.database.typelists.items[index].name,
                        value: "o:" + host.database.typelists.items[index].id,
                        type: host.database.typelists.items[index].type,
                        typeid: host.database.typelists.items[index].id,
                        typeName: host.database.typelists.items[index].name,
                        group: fieldList[i]
                    });
            }
        }

        fieldItems.sort(function(a, b){
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        return fieldItems;
    }

    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
            host.holder.name = host.mainName;
        },
        save: function () {
            var inputInfo = singlePage.getValue();
            if (inputInfo == -1) return;
            carddone.my_report.editReportSave(host, id, inputInfo, 0).then(function(value){
                id = value;
            });
        },
        saveAs: function () {
            var inputInfo = singlePage.getValue();
            if (inputInfo == -1) return;
            inputInfo.sharingValue = 0;
            inputInfo.ownerValue = systemconfig.userid;
            carddone.my_report.editReportSave(host, 0, inputInfo, 1);
        },
        export: function (){
            carddone.my_report.exportData(host);
        },
        viewMaps: function (){
            carddone.my_report.viewMaps(host);
        },
        viewReport: function (){
            return new Promise(function(rs){
                var inputInfo = singlePage.getValue();
                if (inputInfo == -1) return Promise.resolve(-1);

                var t_func = function(){
                    if (inputInfo.typeValue == "activity"){
                        carddone.my_report.activityReportData(host, inputInfo).then(function(value){
                            rs(value);
                        });
                    }
                    else if (inputInfo.typeValue == "stage"){
                        carddone.my_report.stageReportData(host, inputInfo).then(function(value){
                            rs(value);
                        });
                    }
                    else {
                        carddone.my_report.loadReportData(host, inputInfo).then(function(value){
                            rs(value);
                        });
                    }
                }
                t_func();
            })
        }
    };
    var userItems = data_module.users.items.map(function(elt){
        return {
            value: elt.homeid,
            text: elt.username + " - "+ elt.fullname
        };
    });
    var boardItems = host.database.boards.items.map(function(elt){
        return {
            value: elt.id,
            text: elt.name
        };
    });
    var holderForSort = boardItems.map(function(item){
        return {
            item: item,
            val: absol.string.nonAccentVietnamese(item.text.toLowerCase())
        }
    });
    holderForSort.sort(function(a, b){
        if (a.val < b.val) return -1;
        if (a.val > b.val) return 1;
        return 0;
    });
    boardItems = holderForSort.map(function(holder){
        return holder.item;
    });
    boardItems.unshift({value: 0, text: LanguageModule.text("txt_all")});
    var userActivityItems = EncodingClass.string.duplicate(userItems);
    userActivityItems.unshift({value: 0, text: LanguageModule.text("txt_all")});
    singlePage = host.funcs.editReportForm({
        cmdButton: cmdButton,
        database: {
            report_groups: host.database.report_groups,
            companies: host.database.companies,
            nations: host.database.nations,
            cities: host.database.cities,
            districts: host.database.districts,
            typelists: host.database.typelists,
            company_class: host.database.company_class,
        },
        userItems: userItems,
        general_info: {
            report_name: {
                title: LanguageModule.text("txt_report_name"),
                value: report_name
            },
            report_group: {
                title: LanguageModule.text("txt_report_group"),
                value: groupid
            },
            owner: {
                title: LanguageModule.text("txt_owner"),
                value: owner
            },
            share_status: {
                title: LanguageModule.text("txt_share"),
                value: share_status
            },
            description: {
                title: LanguageModule.text("txt_description"),
                value: description
            },
            summary: {
                title: LanguageModule.text("txt_summary"),
                value: summary
            }
        },
        filter_info: {
            title: LanguageModule.text("txt_data_condition_configuration"),
            report_type: {
                title: LanguageModule.text("txt_report_type"),
                items: [
                    {
                        text: LanguageModule.text("txt_field_report"),
                        value: "simple"
                    },
                    {
                        text: LanguageModule.text("txt_stage_report"),
                        value: "stage"
                    },
                    {
                        text: LanguageModule.text("txt_new_store_report"),
                        value: "advanced"
                    },
                    {
                        text: LanguageModule.text("txt_company_report"),
                        value: "company"
                    },
                    {
                        text: LanguageModule.text("txt_activity"),
                        value: "activity"
                    }
                ],
                value: report_type
            },
            boards: {
                title: LanguageModule.text("txt_board"),
                items: boardItems,
                value: boardList,
                change: function(){

                }
            },
            timefilter: {
                title: LanguageModule.text("txt_time_filter"),
                items: [
                    {value: 1, text: LanguageModule.text("txt_yesterday")},
                    {value: 2, text: LanguageModule.text("txt_today")},
                    {value: 3, text: LanguageModule.text("txt_last_week")},
                    {value: 4, text: LanguageModule.text("txt_this_week")},
                    {value: 5, text: LanguageModule.text("txt_last_7_days")},
                    {value: 6, text: LanguageModule.text("txt_last_month")},
                    {value: 7, text: LanguageModule.text("txt_this_month")},
                    {value: 8, text: LanguageModule.text("txt_last_30_days")},
                    {value: 9, text: LanguageModule.text("txt_last_quarter")},
                    {value: 10, text: LanguageModule.text("txt_this_quarter")},
                    {value: 11, text: LanguageModule.text("txt_last_90_days")},
                    {value: 12, text: LanguageModule.text("txt_last_year")},
                    {value: 0, text: LanguageModule.text("txt_option")}
                ],
                value: timefilter
            },
            address: {
                title: LanguageModule.text("txt_company_or_location_filter"),
                value: (address instanceof Array) ? address : []
            }
        },
        filter_table: {
            header: {
                collumn: LanguageModule.text("txt_collumn"),
                display: LanguageModule.text("txt_display"),
                collumn_title: LanguageModule.text("txt_collumn_title"),
                value: LanguageModule.text("txt_value"),
                data_filter: LanguageModule.text("txt_data_filter"),
                last_row: LanguageModule.text("txt_last_row")
            },
            data: report_filter
        },
        advanced_table: {
            header: {
                datatype: LanguageModule.text("txt_datatype"),
                comparison: LanguageModule.text("txt_comparison"),
                value: LanguageModule.text("txt_value"),
                operation: LanguageModule.text("txt_operation")
            },
            data: advanced_filter
        },
        activity_report: {
            users: {
                title: LanguageModule.text("txt_user"),
                items: userActivityItems,
                value: usersActivityValues
            },
            status: {
                title: LanguageModule.text("txt_status"),
                items: [
                    {value: "all", text: LanguageModule.text("txt_all")},
                    {value: "overdue", text: LanguageModule.text("txt_overdue")},
                    {value: "finish", text: LanguageModule.text("txt_finish")},
                    {value: "plan", text: LanguageModule.text("txt_plan")}
                ],
                value: statusActivity
            }
        },
        company_report: {
            fieldID: fieldID,
            itemID: itemID
        },
        boardChange: function(boards){
            var fields = [];
            for (var i = 0; i < boards.length; i++){
                var index = host.database.boards.getIndex(boards[i]);
                fields = fields.concat(host.database.boards.items[index].fieldIdList);
            }
            fields = fields.filter(function(elt, index){
                return fields.indexOf(elt) == index;
            });
            return makeFieldData(fields);
        }
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    singlePage.typeChangeFunc();
    ModalElement.close(-1);
};

carddone.my_report.showPublicReport = function(host, value){
    console.log(value);
    host.publicReport = value;
    carddone.my_report.redraw(host).then(function(singlePage){
        host.report_container.clearChild();
        host.report_container.addChild(singlePage);
    });
};

carddone.my_report.addNewGroup = function(host, id, callbackFunc, gindex){
    var index, name, color;
    if (id == 0){
        name = "";
        color = "ebebeb";
    }
    else {
        index = host.database.report_groups.getIndex(id);
        name = host.database.report_groups.items[index].name;
        color = host.database.report_groups.items[index].color;
    }
    var singlePage = host.funcs.reportEditGroupForm({
        frameList: host.frameList,
        content: {
            name: name, color: color
        },
        cmdButton: {
            close: function(){
                host.frameList.removeLast();
            },
            save: function(){
                var value = singlePage.getValue();
                if (!value) return;
                carddone.my_report.addNewGroupSave(host, id, gindex, value).then(function(groupid){
                    if (id == 0) {
                        value.task = "add";
                        value.on = {
                            boardorderchange: function (groupid, reportid, from, to){
                                carddone.my_report.changeOrder(host, groupid, reportid, from, to);
                            },
                            boardenter: function (reportid, from, to){
                                carddone.my_report.changeGroup(host, reportid, from, to);
                            },
                            boardleave: function (){
                            },
                            dragboardstart: function (){
                            },
                            dragboardend: function (){
                            },
                            editFunc: function(id, callbackFunc, index){
                                carddone.my_report.addNewGroup(host, id, callbackFunc, index);
                            },
                            sortAscending: function(groupid, callbackFunc){
                                return carddone.my_report.sortAscending(host, groupid, callbackFunc);
                            },
                            deleteFunc: function(id, index){
                                carddone.my_report.deleteGroup(host, id, index);
                            }
                        }
                    }
                    else value.task = "edit";
                    value.id = groupid;
                    value.child = [];
                    callbackFunc(value);
                    id = groupid;
                });
            },
            saveClose: function(){
                var value = singlePage.getValue();
                if (!value) return;
                carddone.my_report.addNewGroupSave(host, id, gindex, value).then(function(groupid){
                    if (id == 0) {
                        value.task = "add";
                        value.on = {
                            boardorderchange: function (groupid, reportid, from, to){
                                carddone.my_report.changeOrder(host, groupid, reportid, from, to);
                            },
                            boardenter: function (reportid, from, to){
                                carddone.my_report.changeGroup(host, reportid, from, to);
                            },
                            boardleave: function (){
                            },
                            dragboardstart: function (){
                            },
                            dragboardend: function (){
                            },
                            editFunc: function(id, callbackFunc, index){
                                carddone.my_report.addNewGroup(host, id, callbackFunc, index);
                            },
                            sortAscending: function(groupid, callbackFunc){
                                return carddone.my_report.sortAscending(host, groupid, callbackFunc);
                            },
                            deleteFunc: function(id, index){
                                carddone.my_report.deleteGroup(host, id, index);
                            }
                        }
                    }
                    else value.task = "edit";
                    value.id = groupid;
                    value.child = [];
                    callbackFunc(value);
                    host.frameList.removeLast();
                });
            }
        }
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.my_report.redraw = function(host){
    return new Promise(function(rs){
        var group_data = {};
        group_data[-1] = {
            id: 0,
            name: LanguageModule.text("txt_general_group"),
            color: "ebebeb",
            child: [],
            on: {
                boardorderchange: function (groupid, reportid, from, to){
                },
                boardenter: function (reportid, from, to){
                    carddone.my_report.changeGroup(host, reportid, from, to);
                },
                boardleave: function (){
                },
                dragboardstart: function (){
                },
                dragboardend: function (){
                }
            }
        };
        for (var i = 0; i < host.database.report_groups.items.length; i++){
            group_data[host.database.report_groups.items[i].gindex] = {
                id: host.database.report_groups.items[i].id,
                name: host.database.report_groups.items[i].name,
                color: host.database.report_groups.items[i].color,
                child: [],
                on: {
                    boardorderchange: function (groupid, reportid, from, to){
                        carddone.my_report.changeOrder(host, groupid, reportid, from, to);
                    },
                    boardenter: function (reportid, from, to){
                        carddone.my_report.changeGroup(host, reportid, from, to);
                    },
                    boardleave: function (){
                    },
                    dragboardstart: function (){
                    },
                    dragboardend: function (){
                    },
                    editFunc: function(id, callbackFunc, index){
                        carddone.my_report.addNewGroup(host, id, callbackFunc, index);
                    },
                    sortAscending: function(groupid, callbackFunc){
                        return carddone.my_report.sortAscending(host, groupid, callbackFunc);
                    },
                    deleteFunc: function(id, index){
                        carddone.my_report.deleteGroup(host, id, index);
                    }
                }
            }
        }
        var gIndex;
        for (var i = 0; i < host.database.report.items.length; i++){
            if ((host.publicReport == "private") && (host.database.report.items[i].owner != systemconfig.userid)) continue;
            if (host.publicReport == "public") {
                if (host.database.report.items[i].sharing != 1) continue;
                if (host.database.report.items[i].owner == systemconfig.userid) continue;
            }
            if (!host.database.report.items[i].groupid) gIndex = -1;
            else gIndex = host.database.report_groups.items[host.database.report.items[i].groupIndex].gindex;
            group_data[gIndex].child.push({
                id: host.database.report.items[i].id,
                name: host.database.report.items[i].name,
                owner: host.database.report.items[i].owner,
                sharing: host.database.report.items[i].sharing,
                comment: host.database.report.items[i].comment,
                index: host.database.report.items[i].index,
                groupid: host.database.report.items[i].groupid,
                editFunc: function(id, groupid){
                    return function() {
                        return carddone.my_report.editReport(host, groupid, id);
                    }
                } (host.database.report.items[i].id, host.database.report.items[i].groupid),
                deleteFunc: function(id){
                    return function() {
                        carddone.my_report.deleteReport(host, id);
                    }
                } (host.database.report.items[i].id)
            });
        }
        var params = {
            content: group_data,
            addNew: function(groupid){
                console.log(groupid);
                return carddone.my_report.editReport(host, groupid, 0);
            },
            pressaddgroup: function(index, callbackFunc){
                carddone.my_report.addNewGroup(host, 0, callbackFunc, index);
            },
            groupChangeOrder: function(groupid, from, to){
                carddone.my_report.groupChangeOrder(host, groupid, from, to);
            }
        };
        var singlePage = host.funcs.formReportListLayout(params);
        rs(singlePage);
    });
};

carddone.my_report.init = function(host){
    ModalElement.show_loading();
    var promiseList = {};
    host.database = {};
    promiseList.report_groups = data_module.loadByConditionAsync({
        name: "report_groups",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.report_groups = data_module.makeDatabase(retval);
        }
    });
    promiseList.report_group_link = data_module.loadByConditionAsync({
        name: "report_group_link",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.report_group_link = data_module.makeDatabase(retval);
        }
    });
    promiseList.report = data_module.loadByConditionAsync({
        name: "report",
        cond: function(record){
            return ((record.owner == systemconfig.userid) || (record.userid == systemconfig.userid) || (record.sharing == 1));
        },
        callback: function(retval){
            host.database.report = data_module.makeDatabase(retval);
        }
    });
    promiseList.companies = data_module.loadByConditionAsync({
        name: "company",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.companies = data_module.makeDatabase(retval);
        }
    });
    promiseList.obj_company_contact = data_module.loadByConditionAsync({
        name: "obj_company_contact",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.obj_company_contact = data_module.makeDatabase(retval);
            var dict = {};
            host.database.obj_company_contact.items.forEach(function(elt){
                dict[elt.objid] = 1;
            });
            return dict;
        }
    });
    promiseList.objects = promiseList.obj_company_contact.then(function(dict){
        return data_module.loadByConditionAsync({
            name: "objects",
            cond: function(record){
                return dict[record.id] == 1;
            },
            callback: function(retval){
                host.database.objects = data_module.makeDatabase(retval);
                var o_dict = {};
                host.database.objects.items.forEach(function(elt){
                    o_dict[elt.valueid] = 1;
                });
                return o_dict
            }
        });
    });
    promiseList.values = promiseList.objects.then(function(dict){
        return data_module.loadByConditionAsync({
            name: "values",
            cond: function(record){
                return dict[record.id] == 1;
            },
            callback: function(retval){
                host.database.o_values = data_module.makeDatabase(retval);
            }
        });
    });
    promiseList.cities = data_module.loadByConditionAsync({
        name: "cities",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.cities = data_module.makeDatabase(retval);
        }
    });
    promiseList.districts = data_module.loadByConditionAsync({
        name: "districts",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.districts = data_module.makeDatabase(retval);
        }
    });
    promiseList.nations = data_module.loadByConditionAsync({
        name: "nations",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.nations = data_module.makeDatabase(retval);
        }
    });
    promiseList.company_class = data_module.loadByConditionAsync({
        name: "company_class",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.company_class = data_module.makeDatabase(retval);
        }
    });
    promiseList.contact = data_module.loadByConditionAsync({
        name: "contact",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.contact = data_module.makeDatabase(retval);
        }
    });
    promiseList.typelists = data_module.loadByConditionAsync({
        name: "typelists",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.typelists = data_module.makeDatabase(retval);
            contentModule.makeTypesListContentThanhYen(host);
        }
    });
    promiseList.owner_company_contact = data_module.loadByConditionAsync({
        name: "owner_company_contact",
        cond: function (record) {
            return true;
        },
        callback: function (retval) {
            host.database.owner_company_contact = data_module.makeDatabase(retval);
        }
    });
    promiseList.company_class_member = data_module.loadByConditionAsync({
        name: "company_class_member",
        cond: function (record) {
            return record.userid == systemconfig.userid;
        },
        callback: function (retval) {
            host.database.company_class_member = data_module.makeDatabase(retval);
        }
    });
    promiseList.list_member = data_module.loadByConditionAsync({
        name: "list_member",
        cond: function(record){
            return record.userid == systemconfig.userid;
        },
        callback: function(retval){
            host.database.list_member = data_module.makeDatabase(retval);
            var dict = {};
            retval.forEach(function(elt){
                dict[elt.listid] = 1;
            });
            return dict;
        }
    });
    promiseList.boards = promiseList.list_member.then(function(dict){
        return new Promise(function(rs){
            promiseList.board1 = data_module.loadByConditionAsync({
                name: "lists",
                cond: function(record){
                    return dict[record.id] == 1;
                },
                callback: function(retval){
                    return retval;
                }
            });
            promiseList.board2 = data_module.loadByConditionAsync({
                name: "archived_lists",
                cond: function(record){
                    return dict[record.id] == 1;
                },
                callback: function(retval){
                    return retval;
                }
            });
            Promise.all([promiseList.board1, promiseList.board2]).then(function(content){
                var dict = {};
                var boards = [];
                content[0].forEach(function(elt){
                    dict[elt.id] = 1;
                    elt.archived = 0;
                    boards.push(elt);
                });
                var dict2 = {};
                content[1].forEach(function(elt){
                    dict2[elt.id] = 1;
                    elt.archived = 1;
                    boards.push(elt);
                });
                host.database.boards = data_module.makeDatabase(boards);
                // var field_list = [];
                // content[1].forEach(function(elt){
                //     var links = EncodingClass.string.toVariable(elt.links);
                //     field_list = field_list.concat(links.field_list);
                // });
                promiseList.field_list = data_module.loadByConditionAsync({
                    name: "field_list",
                    cond: function(record){
                        return dict[record.hostid] == 1;
                    },
                    callback: function(retval){
                        host.database.field_list = data_module.makeDatabase(retval);
                        // host.database.field_list = data_module.makeDatabase(field_list.concat(retval));
                    }
                });
                promiseList.lists = data_module.loadByConditionAsync({
                    name: "lists",
                    cond: function (record) {
                        return record.type == "list";
                    },
                    callback: function (retval) {
                        var list = [];
                        var t_dict = {};
                        retval.forEach(function(elt){
                            if (dict[elt.parentid] == 1) {
                                list.push(elt);
                                t_dict[elt.id] = 1;
                            }
                        });
                        retval.forEach(function(elt){
                            if (t_dict[elt.parentid] == 1) {
                                t_dict[elt.id] = 1;
                                list.push(elt);
                            }
                        });
                        return list;
                    }
                });
                promiseList.lists2 = data_module.loadByConditionAsync({
                    name: "archived_lists",
                    cond: function (record) {
                        return record.type == "list";
                    },
                    callback: function (retval) {
                        var list = [];
                        var t_dict = {};
                        retval.forEach(function(elt){
                            if (dict2[elt.parentid] == 1) {
                                list.push(elt);
                                t_dict[elt.id] = 1;
                            }
                        });
                        retval.forEach(function(elt){
                            if (t_dict[elt.parentid] == 1) {
                                t_dict[elt.id] = 1;
                                list.push(elt);
                            }
                        });
                        return list;
                    }
                });
                Promise.all([promiseList.lists, promiseList.lists2, promiseList.field_list]).then(function(content){
                    host.database.lists = data_module.makeDatabase(content[0].concat(content[1]));
                    var dict = {};
                    host.database.lists.items.forEach(function(elt){
                        dict[elt.id] = 1;
                    });
                    promiseList.card1 = data_module.loadByConditionAsync({
                        name: "lists",
                        cond: function(record){
                            return (record.type == "card" && dict[record.parentid] == 1);
                        },
                        callback: function (retval) {
                            return retval;
                        }
                    });
                    promiseList.card2 = data_module.loadByConditionAsync({
                        name: "archived_lists",
                        cond: function(record){
                            return (record.type == "card" && dict[record.parentid] == 1);
                        },
                        callback: function (retval) {
                            return retval;
                        }
                    });
                    Promise.all([promiseList.card1, promiseList.card2]).then(function(content){
                        var cards = [];
                        var t = EncodingClass.string.duplicate(content[0]);
                        t.forEach(function(elt){
                            elt.archiveCard = 0;
                            cards.push(elt);
                        });
                        t = EncodingClass.string.duplicate(content[1]);
                        t.forEach(function(elt){
                            elt.archiveCard = 1;
                            cards.push(elt);
                        });
                        host.database.cards = data_module.makeDatabase(cards);
                        var dict = {};
                        host.database.cards.items.forEach(function(elt){
                            dict[elt.id] = 1;
                        });
                        promiseList.contact_card = data_module.loadByConditionAsync({
                            name: "contact_card",
                            cond: function(record){
                                return dict[record.hostid] == 1;
                            },
                            callback: function(retval){
                                host.database.contact_card = data_module.makeDatabase(retval);
                            }
                        });
                        promiseList.company_card = data_module.loadByConditionAsync({
                            name: "company_card",
                            cond: function(record){
                                return dict[record.hostid] == 1;
                            },
                            callback: function(retval){
                                host.database.company_card = data_module.makeDatabase(retval);
                            }
                        });
                        Promise.all([promiseList.contact_card, promiseList.company_card]).then(function(){
                            rs();
                        });
                    });
                });
            });
        });
    });

    //////////////////////////

    promiseList.account_groups = data_module.loadByConditionAsync({
        name: "account_groups",
        cond: function (record) {
            return true;
        },
        callback: function (retval) {
            host.database.account_groups = data_module.makeDatabase(retval);
        }
    });

    promiseList.privilege_groups = data_module.loadByConditionAsync({
        name: "privilege_groups",
        cond: function (record) {
            return true;
        },
        callback: function (retval) {
            host.database.privilege_groups = data_module.makeDatabase(retval);
        }
    });

    promiseList.privilege_group_details = data_module.loadByConditionAsync({
        name: "privilege_group_details",
        cond: function (record) {
            return true;
        },
        callback: function (retval) {
            host.database.privilege_group_details = data_module.makeDatabase(retval);
        }
    });

    ////////////////////////////


    Promise.all([
        promiseList.report_groups,
        promiseList.report_group_link,
        promiseList.report,
        promiseList.companies,
        promiseList.owner_company_contact,
        promiseList.company_class_member,
        promiseList.cities,
        promiseList.districts,
        promiseList.nations,
        promiseList.boards,
        promiseList.company_class,
        promiseList.typelists,
        promiseList.contact,
        promiseList.account_groups,
        promiseList.privilege_groups,
        promiseList.privilege_group_details,
        promiseList.values
    ]).then(function(){
        ModalElement.close(-1);
        host.holder.addChild(host.frameList);
        contentModule.makeListsIndex(host);
        contentModule.makeListsIndex2(host);
        contentModule.makeListsIndex3(host);
        contentModule.makeField_list(host);
        contentModule.makeOwnerCompanyContactThanhYen(host);
        contentModule.makeCompanyIndexThanhYen(host);
        contentModule.makeContactIndexThanhYen(host);
        contentModule.makeCompanyCardIndex(host);
        contentModule.makeContactCardIndex(host);
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makePriviledgeOfUserGroups(host);
        contentModule.makeReportGroupLinkIndex(host);
        host.privDict = {};
        for (var i = 0; i < host.database.list_member.items.length; i++){
            if (host.database.list_member.items[i].userid == systemconfig.userid){
                host.privDict[host.database.list_member.items[i].listid] = host.database.list_member.items[i].type;
            }
        }
        host.account_groupsDict = {};
        for (var i = 0; i < host.database.account_groups.items.length; i++){
            host.account_groupsDict[host.database.account_groups.items[i].id] = host.database.account_groups.items[i].privOfBoard;
        }
        var boardDict = {};
        for (var i = 0; i < host.database.boards.items.length; i++){
            host.database.boards.items[i].cardIdList = [];
            boardDict[host.database.boards.items[i].id] = i;
        }
        for (var i = 0; i < host.database.cards.items.length; i++){
            host.database.boards.items[boardDict[host.database.cards.items[i].boardid]].cardIdList.push(host.database.cards.items[i].id);
        }

        var v_dict = {};
        host.database.o_values.items.forEach(function(elt){
            v_dict[elt.id] = elt.localid;
        });
        var o_dict = {};
        host.database.objects.items.forEach(function(elt, index){
            if (v_dict[elt.valueid]) o_dict[elt.id] = v_dict[elt.valueid];
        });
        var c_dict = {};
        host.database.companies.items.forEach(function(elt, index){
            c_dict[elt.id] = index;
        });
        host.database.obj_company_contact.items.forEach(function(elt){
            if (c_dict[elt.cid] && o_dict[elt.objid]){
                host.database.companies.items[c_dict[elt.cid]].typevalue = o_dict[elt.objid];
            }
        });
        host.mainName = host.holder.name;
        host.publicReport = "private";
        host.report_container = absol._({
            class: "report-view-container",
            style: {
                width: "100%",
                height: "100%"
            }
        });
        var cmdButton = {
            close: function () {
                carddone.menu.tabPanel.removeTab(host.holder.id);
            },
            publicReport: function(value){
                carddone.my_report.showPublicReport(host, value);
            }
        };
        var params = {
            cmdButton: cmdButton,
            publicReport: host.publicReport,
            report_container: host.report_container
        };
        var singlePage = host.funcs.reportInitForm(params);
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        carddone.my_report.redraw(host).then(function(singlePage){
            host.report_container.clearChild();
            host.report_container.addChild(singlePage);
        });
    });
};

ModuleManagerClass.register({
    name: "My_report",
    prerequisites: ["ModalElement", "FormClass"]
});
