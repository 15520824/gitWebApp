'use strict';
carddone.cards.receivedList = [];

carddone.cards.onReceivedMessage = function(content){
    if (carddone.cards.receivedList.indexOf(content.randomId) != -1) return;
    switch (content.type) {
        case 'archivecard':

            break;
        case 'deletecard':

            break;
        case 'movecard':

            break;
        case 'changelist':

            break;
        case 'changeorder':

            break;
        case 'editactivities':
            dbcache.refresh("objects");
            dbcache.refresh("obj_list");
            break;
        default:

    }
};

carddone.cards.restoreCard = function(host, id, parentid){
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_restore_save.php",
            params: [
                {name: "cardid", value: id},
                {name: "parentid", value: parentid},
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.cards.getIndex(id);
                        var temp = host.database.cards.items[index];
                        host.database.cards.items.splice(index, 1);
                        temp.lindex = host.currentCardData.length;
                        var editMode = 'view';
                        if (temp.userid == systemconfig.userid || temp.owner == systemconfig.userid) editMode = "edit";
                        else if (host.priv[3]) editMode = "edit";
                        else if (host.priv[2]) editMode = "view";
                        // else return;
                        // for (var i = 0; i < host.database.list_member.items.length; i++){
                        //     if (host.database.list_member.items[i].userid == systemconfig.userid) {
                        //         if (host.database.list_member.items[i].type > 0) editMode = 'edit';
                        //         else {
                        //             if (host.boardContent.permission == 1) {
                        //                 if (temp.userid == systemconfig.userid || temp.owner == systemconfig.userid) editMode = "edit";
                        //                 else editMode = "view";
                        //             }
                        //             else editMode = "edit";
                        //         }
                        //         break;
                        //     }
                        // }
                        var content = {
                            id: temp.id,
                            name: temp.name,
                            userid: temp.userid,
                            owner: temp.owner > 0 ? temp.owner : temp.userid,
                            parentid: temp.parentid,
                            companies: temp.companyList,
                            contacts: temp.contactList,
                            archived: host.viewArchived ? 1 : 0,
                            lindex: temp.lindex,
                            editMode: editMode,
                            editFunc: function(parentid, id, editMode){
                                return function(){
                                    carddone.cards.prevEditCard(host, parentid, id, editMode);
                                }
                            }(temp.parentid, temp.id, editMode),
                            deleteFunc: host.viewArchived ? function(id){
                                return function(){
                                    return carddone.cards.deleteCardFromArchived(host, id);
                                }
                            }(temp.id) : function(id){
                                return function(){
                                    return carddone.cards.deleteCard(host, id);
                                }
                            }(temp.id),
                            moveFunc: function(id){
                                return function(){
                                    return carddone.cards.moveCard(host, id);
                                }
                            }(temp.id),
                            archiveFunc: function(id){
                                return function(){
                                    return carddone.cards.archiveCard(host, id);
                                }
                            }(temp.id),
                            restoreFunc: function(id, parentid){
                                return function(){
                                    return carddone.cards.restoreCard(host, id, parentid);
                                }
                            }(temp.id, temp.parentid)
                        }
                        host.currentCardData.push(temp);
                        for (var i = 0; i < host.database.company_card.items.length; i++){
                            if (host.database.company_card.items[i].hostid == temp.id){
                                host.currentCompanyCard.push(host.database.company_card.items[i]);
                            }
                        }
                        for (var i = 0; i < host.database.contact_card.items.length; i++){
                            if (host.database.contact_card.items[i].hostid == temp.id){
                                host.currentContactCard.push(host.database.contact_card.items[i]);
                            }
                        }
                        host.originList.items[host.originList.getIndex(host.currentCardData[host.currentCardData.length - 1].parentid)].childrenIdList.push(temp.id);
                        dbcache.refresh("lists");
                        dbcache.refresh("archived_lists");
                        rs(content);
                    }
                    else {
                        console.log(message);
                        rs(false);
                    }
                }
                else {
                    console.log(message);
                    rs(false);
                }
            }
        });
    })
};

carddone.cards.deleteCardFromArchived = function(host, id){
    var parentid;
    var params = [
        {name: "cardid", value: id}
    ];
    parentid = host.database.cards.items[host.database.cards.getIndex(id)].parentid;
    if (host.viewArchived){
        var index = host.database.lists.getIndex(parentid);
        var cardDecreaseIndex = [];
        var cIndex, lindex, max = 0;
        lindex = host.database.cards.items[host.database.cards.getIndex(id)].lindex;
        for (var i = 0; i < host.database.lists.items[index].childrenIdList.length; i++){
            cIndex = host.database.cards.getIndex(host.database.lists.items[index].childrenIdList[i]);
            if (host.database.cards.items[cIndex].lindex > lindex) {
                if (max < host.database.cards.items[cIndex].lindex) max = host.database.cards.items[cIndex].lindex;
                cardDecreaseIndex.push(host.database.lists.items[index].childrenIdList[i]);
            }
        }
        cardDecreaseIndex.sort(function(a, b){
            var aIndex, bIndex;
            aIndex = host.database.cards.getIndex(a);
            bIndex = host.database.cards.getIndex(b);
            if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return -1;
            if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return 1;
            return 0;
        });
        params.push(
            {value: max, name: "max"},
            {value: EncodingClass.string.fromVariable(cardDecreaseIndex), name: "cardDecreaseIndex"}
        );
    }
    else {
        params.push(
            {value: 0, name: "max"},
            {value: EncodingClass.string.fromVariable([]), name: "cardDecreaseIndex"}
        );
    }
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_delete_from_archived_save.php",
            params: params,
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.cards.getIndex(id);
                        host.database.cards.items.splice(index, 1);
                        var pIndex = host.database.lists.getIndex(parentid);
                        if (host.viewArchived){
                            host.database.lists.items[pIndex].childrenIdList = host.database.lists.items[pIndex].childrenIdList.filter(function(elt){
                                return elt != id;
                            });
                            cardDecreaseIndex.forEach(function(elt){
                                var cIndex = host.database.cards.getIndex(elt);
                                host.database.cards.items[cIndex].lindex--;
                            });
                        }
                        dbcache.refresh("lists");
                        dbcache.refresh("obj_list");
                        dbcache.refresh("objects");
                        dbcache.refresh("company_card");
                        dbcache.refresh("contact_card");
                        rs(true);
                    }
                    else {
                        console.log(message);
                        rs(false);
                    }
                }
                else {
                    console.log(message);
                    rs(false);
                }
            }
        });
    })
};

carddone.cards.loadArchivedCards = function(host){
    return new Promise(function(rs){
        ModalElement.show_loading();
        var list = {};
        host.database.lists.items.forEach(function(elt){
            list[elt.id] = 1;
        });
        dbcache.loadByCondition({
            name: "archived_lists",
            cond: function (record) {
                return (record.type == "card" && list[record.parentid] == 1);
            },
            callback: function (retval) {
                host.database.cards = data_module.makeDatabase(retval);
                for (var i = 0; i < host.database.lists.items.length; i++){
                    if (host.database.lists.items[i].parentid == host.boardContent.id) continue;
                    host.database.lists.items[i].childrenIdList = [];
                }
                var dict = {};
                host.database.cards.items.forEach(function(elt){
                    dict[elt.id] = 1;
                });
                var contact_card = data_module.loadByConditionAsync({
                    name: "contact_card",
                    cond: function (record) {
                        return dict[record.hostid] == 1;
                    },
                    callback: function (retval) {
                        host.database.contact_card = data_module.makeDatabase(retval);
                    }
                });
                var company_card = data_module.loadByConditionAsync({
                    name: "company_card",
                    cond: function (record) {
                        return dict[record.hostid] == 1;
                    },
                    callback: function (retval) {
                        host.database.company_card = data_module.makeDatabase(retval);
                    }
                });
                Promise.all([contact_card, company_card]).then(function(){
                    ModalElement.close(-1);
                    contentModule.makeListsIndex(host);
                    contentModule.makeListsIndex2(host);
                    contentModule.makeCardIndex(host);
                    contentModule.makeCompanyCardIndex(host);
                    contentModule.makeContactCardIndex(host);
                    contentModule.makeField_list(host);
                    contentModule.makeKnowledgeGroupIndex(host);
                    carddone.cards.redraw(host, parseInt(host.userCombobox.value, 10)).then(function(singlePage){
                        host.card_container.clearChild();
                        host.card_container.appendChild(singlePage);
                        rs();
                    });
                });
            }
        });
    });
}

carddone.cards.archiveAllCardInListFunc = function(host, listid){
    return new Promise(function(rs){
        var index = host.database.lists.getIndex(listid);
        var cards = host.database.lists.items[index].childrenIdList;
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_archive_save2.php",
            params: [{value: EncodingClass.string.fromVariable(cards), name: "cards"}],
            func: function(success, message){
                ModalElement.close(-1);
                if(success){
                    if (message.substr(0, 2) == "ok"){
                        var dict = {};
                        cards.forEach(function(elt){
                            dict[elt] = 1;
                        })
                        host.database.cards.items = host.database.cards.items.filter(function(elt){
                            return dict[elt.id] != 1;
                        });
                        host.database.lists.items[index].childrenIdList = [];
                        dbcache.refresh("lists");
                        dbcache.refresh("archived_lists");
                        rs(true);
                    }
                    else {
                        console.log(message);
                        rs(false);
                    }
                }
                else {
                    console.log(message);
                    rs(false);
                }
            }
        });
    });
};

carddone.cards.deleteCard = function(host, id){
    var parentid = host.database.cards.items[host.database.cards.getIndex(id)].parentid;
    var index = host.database.lists.getIndex(parentid);
    var cardDecreaseIndex = [];
    var cIndex, lindex, max = 0;
    lindex = host.database.cards.items[host.database.cards.getIndex(id)].lindex;
    for (var i = 0; i < host.database.lists.items[index].childrenIdList.length; i++){
        cIndex = host.database.cards.getIndex(host.database.lists.items[index].childrenIdList[i]);
        if (host.database.cards.items[cIndex].lindex > lindex) {
            if (max < host.database.cards.items[cIndex].lindex) max = host.database.cards.items[cIndex].lindex;
            cardDecreaseIndex.push(host.database.lists.items[index].childrenIdList[i]);
        }
    }
    cardDecreaseIndex.sort(function(a, b){
        var aIndex, bIndex;
        aIndex = host.database.cards.getIndex(a);
        bIndex = host.database.cards.getIndex(b);
        if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return -1;
        if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return 1;
        return 0;
    });
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_delete_save.php",
            params: [
                {value: id, name: "cardid"},
                {value: max - 1, name: "max"},
                {value: EncodingClass.string.fromVariable(cardDecreaseIndex), name: "cardDecreaseIndex"}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.cards.getIndex(id);
                        var pIndex = host.database.lists.getIndex(parentid);
                        host.database.lists.items[pIndex].childrenIdList = host.database.lists.items[pIndex].childrenIdList.filter(function(elt){
                            return elt != id;
                        });
                        host.database.cards.items.splice(index, 1);
                        cardDecreaseIndex.forEach(function(elt){
                            var cIndex = host.database.cards.getIndex(elt);
                            host.database.cards.items[cIndex].lindex--;
                        });
                        dbcache.refresh("lists");
                        dbcache.refresh("obj_list");
                        dbcache.refresh("objects");
                        dbcache.refresh("contact_card");
                        dbcache.refresh("company_card");
                        rs({
                            cardDecreaseIndex: cardDecreaseIndex,
                            max: max
                        });
                    }
                    else if (message == "knowledge") {
                        ModalElement.alert({message: LanguageModule.text("war_can_not_delete_card_because_knowledge_of_card")});
                        rs(false);
                    }
                    else {
                        ModalElement.alert({message: message});
                        rs(false);
                    }
                }
                else {
                    ModalElement.alert({message: message});
                    rs(false);
                }
            }
        });
    });
};

carddone.cards.archiveCard = function(host, id){
    var parentid = host.database.cards.items[host.database.cards.getIndex(id)].parentid;
    var index = host.database.lists.getIndex(parentid);
    var cardDecreaseIndex = [];
    var cIndex, lindex, max = 0;
    lindex = host.database.cards.items[host.database.cards.getIndex(id)].lindex;
    for (var i = 0; i < host.database.lists.items[index].childrenIdList.length; i++){
        cIndex = host.database.cards.getIndex(host.database.lists.items[index].childrenIdList[i]);
        if (host.database.cards.items[cIndex].lindex > lindex) {
            if (max < host.database.cards.items[cIndex].lindex) max = host.database.cards.items[cIndex].lindex;
            cardDecreaseIndex.push(host.database.lists.items[index].childrenIdList[i]);
        }
    }
    cardDecreaseIndex.sort(function(a, b){
        var aIndex, bIndex;
        aIndex = host.database.cards.getIndex(a);
        bIndex = host.database.cards.getIndex(b);
        if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return -1;
        if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return 1;
        return 0;
    });
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_archive_save.php",
            params: [
                {value: id, name: "cardid"},
                {value: max - 1, name: "max"},
                {value: EncodingClass.string.fromVariable(cardDecreaseIndex), name: "cardDecreaseIndex"}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.cards.getIndex(id);
                        var pIndex = host.database.lists.getIndex(parentid);
                        host.database.lists.items[pIndex].childrenIdList = host.database.lists.items[pIndex].childrenIdList.filter(function(elt){
                            return elt != id;
                        });
                        host.database.cards.items.splice(index, 1);
                        cardDecreaseIndex.forEach(function(elt){
                            var cIndex = host.database.cards.getIndex(elt);
                            host.database.cards.items[cIndex].lindex--;
                        });
                        dbcache.refresh("lists");
                        dbcache.refresh("archived_lists");
                        rs({
                            cardDecreaseIndex: cardDecreaseIndex,
                            max: max
                        });
                    }
                    else {
                        console.log(message);
                        rs(false);
                    }
                }
                else {
                    console.log(message);
                    rs(false);
                }
            }
        });
    });
};

carddone.cards.moveCard = function(host, id){
    var parentid = host.database.cards.items[host.database.cards.getIndex(id)].parentid;
    var index = host.database.lists.getIndex(parentid);
    var cardDecreaseIndex = [];
    var cIndex, lindex, max = 0;
    lindex = host.database.cards.items[host.database.cards.getIndex(id)].lindex;
    for (var i = 0; i < host.database.lists.items[index].childrenIdList.length; i++){
        cIndex = host.database.cards.getIndex(host.database.lists.items[index].childrenIdList[i]);
        if (host.database.cards.items[cIndex].lindex > lindex) {
            if (max < host.database.cards.items[cIndex].lindex) max = host.database.cards.items[cIndex].lindex;
            cardDecreaseIndex.push(host.database.lists.items[index].childrenIdList[i]);
        }
    }
    cardDecreaseIndex.sort(function(a, b){
        var aIndex, bIndex;
        aIndex = host.database.cards.getIndex(a);
        bIndex = host.database.cards.getIndex(b);
        if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return -1;
        if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return 1;
        return 0;
    });
    return new Promise(function(rs){
        ModalElement.show_loading();
        var loadListMember = data_module.loadByConditionAsync({
            name: "list_member",
            cond: function(record){
                return (record.userid == systemconfig.userid);
            },
            callback: function(retval){
                var list_member = retval;
                var dict = {};
                for (var i = 0; i < list_member.length; i++){
                    dict[list_member[i].listid] = 1;
                }
                return dict;
            }
        });
        var loadBoards = loadListMember.then(function(dict){
            return data_module.loadByConditionAsync({
                name: "lists",
                cond: function(record){
                    return (dict[record.id] && (record.type == "board"));
                },
                callback: function(retval){
                    var boards = retval;
                    var dict = {};
                    for (var i = 0; i < boards.length; i++){
                        boards[i].lists = [];
                        dict[boards[i].id] = 1;
                    }
                    boards.getIndex = function(id){
                        for (var i = 0; i < boards.length; i++){
                            if (boards[i].id == id) return i;
                        }
                        return -1;
                    }
                    return {
                        boards: boards,
                        dict: dict
                    };
                }
            });
        });
        loadBoards.then(function(content){
            return data_module.loadByConditionAsync({
                name: "lists",
                cond: function (record) {
                    return record.type == "list";
                },
                callback: function (retval) {
                    ModalElement.close(-1);
                    var lists = [];
                    var t_dict = {};
                    retval.forEach(function(elt){
                        if (content.dict[elt.parentid] == 1) {
                            lists.push(elt);
                            t_dict[elt.id] = 1;
                        }
                    });
                    retval.forEach(function(elt){
                        if (t_dict[elt.parentid] == 1) {
                            t_dict[elt.id] = 1;
                            lists.push(elt);
                        }
                    });
                    lists.getIndex = function(id){
                        for (var i = 0; i < lists.length; i++){
                            if (lists[i].id == id) return i;
                        }
                        return -1;
                    }
                    for (var i = 0; i < lists.length; i++){
                        var index = content.boards.getIndex(lists[i].parentid);
                        if (index != -1) lists[i].boardid = content.boards[index].id;
                    }
                    for (var i = 0; i < lists.length; i++){
                        var index = lists.getIndex(lists[i].parentid);
                        if (index != -1) {
                            content.boards[content.boards.getIndex(lists[index].boardid)].lists.push({value: lists[i].id, text: lists[i].name});
                        }
                    }
                    var list = content.boards.map(function(elt){
                        return {
                            value: elt.id,
                            text: elt.name,
                            lists: elt.lists
                        };
                    });
                    list = list.filter(function(elt){
                        return elt.value != host.boardContent.id;
                    });

                    list.sort(function(a, b){
                        if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
                        if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
                        return 0;
                    });
                    host.funcs.moveCard(list, host.frameList).then(function(value){
                        ModalElement.show_loading();
                        FormClass.api_call({
                            url: "card_move_save2.php",
                            params: [
                                {value: id, name: "cardid"},
                                {value: host.boardContent.id, name: "oldBoardid"},
                                {value: value.boardid, name: "boardid"},
                                {value: parentid, name: "oldId"},
                                {value: value.listid, name: "listid"},
                                {value: max - 1, name: "max"},
                                {value: EncodingClass.string.fromVariable(cardDecreaseIndex), name: "cardDecreaseIndex"}
                            ],
                            func: function(success, message){
                                ModalElement.close(-1);
                                if (success){
                                    if (message.substr(0, 2) == "ok"){
                                        var index = host.database.cards.getIndex(id);
                                        var pIndex = host.database.lists.getIndex(parentid);
                                        host.database.lists.items[pIndex].childrenIdList = host.database.lists.items[pIndex].childrenIdList.filter(function(elt){
                                            return elt != id;
                                        });
                                        host.database.cards.items.splice(index, 1);
                                        cardDecreaseIndex.forEach(function(elt){
                                            var cIndex = host.database.cards.getIndex(elt);
                                            host.database.cards.items[cIndex].lindex--;
                                        });
                                        dbcache.refresh("lists");
                                        rs({
                                            cardid: id,
                                            cardDecreaseIndex: cardDecreaseIndex,
                                            max: max
                                        });
                                    }
                                    else {
                                        console.log(message);
                                        rs(false);
                                    }
                                }
                                else {
                                    console.log(message);
                                    rs(false);
                                }
                            }
                        });
                    });
                }
            });
        });
    });
};

carddone.cards.prepareDataDeleteActivity = function(host, cardid, id, type_activity){
    var data = {};
    var valueid = host.database.objects.items[host.database.objects.getIndex(id)].valueid;
    var assigned_toOld;
    var participantOldList = [];
    var due_dateOld;
    var valueIndex = host.database.values.getIndex(valueid);
    var content = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
    switch (type_activity) {
        case "task":
        case "call":
        case "meeting":
            data.listTimeCalOld = [];
            data.listUserCalOld = [];
            for (var i = 0; i < content.length; i++){
                switch (content[i].localid) {
                    case "type_"+type_activity+"_assigned_to":
                        valueIndex = host.database.values.getIndex(content[i].valueid);
                        assigned_toOld = parseInt(host.database.values.items[valueIndex].content, 10);
                        break;
                    case "type_"+type_activity+"_participant":
                        valueIndex = host.database.values.getIndex(content[i].valueid);
                        participantOldList = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                        break;
                    case "type_"+type_activity+"_due_date":
                        valueIndex = host.database.values.getIndex(content[i].valueid);
                        due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                        data.listTimeCalOld.push({
                            "year": due_dateOld.getFullYear(),
                            "month": due_dateOld.getMonth()
                        });
                        break;
                    case "type_meeting_start_date":
                        valueIndex = host.database.values.getIndex(content[i].valueid);
                        due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                        data.listTimeCalOld.push({
                            "year": due_dateOld.getFullYear(),
                            "month": due_dateOld.getMonth()
                        });
                        break;
                    case "type_meeting_end_date":
                        valueIndex = host.database.values.getIndex(content[i].valueid);
                        due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                        data.listTimeCalOld.push({
                            "year": due_dateOld.getFullYear(),
                            "month": due_dateOld.getMonth()
                        });
                        break;
                    default:
                    break;
                }
            }
            if (data.listTimeCalOld.length == 2){
                if (data.listTimeCalOld[0].year == data.listTimeCalOld[1].year && data.listTimeCalOld[0].month == data.listTimeCalOld[1].month){
                    data.listTimeCalOld.splice(1, 1);
                }
            }
            if (participantOldList.indexOf(assigned_toOld) < 0) participantOldList.push(assigned_toOld);
            data.listUserCalOld = participantOldList;
            break;
        case "checklist":
            data.dataCalOld = [];
            var vIndex, content2, vIndex3, content3;
            for (var i = 0; i < content.length; i++){
                if (content[i].localid == "type_check_list_items"){
                    vIndex = host.database.values.getIndex(content[i].valueid);
                    content2 = EncodingClass.string.toVariable(host.database.values.items[vIndex].content);
                    for (var j = 0; j < content2.length; j++){
                        vIndex3 = host.database.values.getIndex(content2[j]);
                        content3 = EncodingClass.string.toVariable(host.database.values.items[vIndex3].content);
                        for (var k = 0; k < content3.length; k++){
                            switch (content3[k].localid) {
                                case "type_check_list_item_due_date":
                                valueIndex = host.database.values.getIndex(content3[k].valueid);
                                due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                                break;
                                case "type_check_list_item_assigned_to":
                                valueIndex = host.database.values.getIndex(content3[k].valueid);
                                assigned_toOld = parseInt(host.database.values.items[valueIndex].content, 10);
                                break;
                                default:
                                break;
                            }
                        }
                        if (due_dateOld == null) continue;
                        data.dataCalOld.push({
                            userid: assigned_toOld,
                            month: due_dateOld.getMonth(),
                            year: due_dateOld.getFullYear()
                        });
                    }
                    break;
                }
            }
            break;
        default:
            break;
    }
    return data;
};

carddone.cards.deleteActivity = function(host, cardid, id, activity){
    return new Promise(function(rs, rj){
        var x = activity.indexOf("List");
        var type_activity = activity.substr(0, x);
        if (type_activity == "check_list") type_activity = "checklist";
        var data = carddone.cards.prepareDataDeleteActivity(host, cardid, id, type_activity);
        FormClass.api_call({
            url: "card_activities_delete.php",
            params: [
                {value: cardid, name: "cardid"},
                {value: id, name: "id"},
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "type_activity", value: type_activity}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var oIndex = host.database.objects.getIndex(id);
                        var cIndex = host.database.cards.getIndex(cardid);
                        host.database.objects.items.splice(oIndex, 1);
                        var temp = host.database.cards.items[cIndex].activitiesList.filter(function(elt){
                            return elt != id;
                        });
                        host.database.cards.items[cIndex].activitiesList = temp;
                        temp = host.database.cards.items[cIndex][activity].filter(function(elt){
                            return elt != id;
                        });
                        host.database.cards.items[cIndex][activity] = temp;
                        var randomId = absol.string.randomIdent(20);
                        carddone.cards.receivedList.push(randomId);
                        host.funcs.sendMessage({
                            messageType: "card",
                            type: "deleteactivities",
                            randomId: randomId,
                            boardId: host.boardContent.id,
                            archived: host.viewArchived ? 1 : 0,
                            cardId: [cardid]
                        });
                        dbcache.refresh("obj_list");
                        dbcache.refresh("objects");
                        rs({objects: host.database.objects, cards: host.database.cards, id: id});
                    }
                    else {
                        rj(message);
                    }
                }
                else {
                    rj(message);
                }
            }
        })
    });
};

carddone.cards.prepareDataEditActivitiesSave = function(host, boardid, cardid, id, typeid, value, activity, mode){
    var data = {
        value: activity.name == "field" ? value.value : value,
        id: id,
        typeid: typeid,
        parentid: 0,
        name: "",
        type: activity.name,
        available: 1,
        privtype: host.database.typelists.items[host.database.typelists.getIndex(typeid)].type
    };
    if (id == 0) {
        data.ver = 1;
        data.valueid = 0;
        data.listvalueiddel = [];
    }
    else {
        data.valueid = host.database.objects.items[host.database.objects.getIndex(id)].valueid;
        data.ver = host.database.objects.items[host.database.objects.getIndex(id)].ver;
        var listvalueiddel = [];
        data.listvalueiddel = listvalueiddel;
        var assigned_toOld;
        var due_dateOld;
        var participantOldList = [];
        var valueIndex = host.database.values.getIndex(data.valueid);
        var content = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
        switch (activity.name) {
            case "task":
            case "call":
            case "meeting":
                data.listTimeCalOld = [];
                for (var i = 0; i < content.length; i++){
                    switch (content[i].localid) {
                        case "type_"+activity.name+"_assigned_to":
                            valueIndex = host.database.values.getIndex(content[i].valueid);
                            assigned_toOld = parseInt(host.database.values.items[valueIndex].content, 10);
                            break;
                        case "type_"+activity.name+"_participant":
                            valueIndex = host.database.values.getIndex(content[i].valueid);
                            participantOldList = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                            break;
                        case "type_"+activity.name+"_due_date":
                            valueIndex = host.database.values.getIndex(content[i].valueid);
                            due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                            data.listTimeCalOld.push({
                                "year": due_dateOld.getFullYear(),
                                "month": due_dateOld.getMonth()
                            });
                            break;
                        case "type_meeting_start_date":
                            valueIndex = host.database.values.getIndex(content[i].valueid);
                            due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                            data.listTimeCalOld.push({
                                "year": due_dateOld.getFullYear(),
                                "month": due_dateOld.getMonth()
                            });
                            break;
                        case "type_meeting_end_date":
                            valueIndex = host.database.values.getIndex(content[i].valueid);
                            due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                            data.listTimeCalOld.push({
                                "year": due_dateOld.getFullYear(),
                                "month": due_dateOld.getMonth()
                            });
                            break;
                        default:
                            break;
                    }
                }
                if (data.listTimeCalOld.length == 2){
                    if (data.listTimeCalOld[0].year == data.listTimeCalOld[1].year && data.listTimeCalOld[0].month == data.listTimeCalOld[1].month){
                        data.listTimeCalOld.splice(1, 1);
                    }
                }
                break;
            case "checklist":
                data.dataCalOld = [];
                var vIndex, content2, vIndex3, content3;
                for (var i = 0; i < content.length; i++){
                    if (content[i].localid == "type_check_list_items"){
                        vIndex = host.database.values.getIndex(content[i].valueid);
                        content2 = EncodingClass.string.toVariable(host.database.values.items[vIndex].content);
                        for (var j = 0; j < content2.length; j++){
                            vIndex3 = host.database.values.getIndex(content2[j]);
                            content3 = EncodingClass.string.toVariable(host.database.values.items[vIndex3].content);
                            for (var k = 0; k < content3.length; k++){
                                switch (content3[k].localid) {
                                    case "type_check_list_item_due_date":
                                        valueIndex = host.database.values.getIndex(content3[k].valueid);
                                        due_dateOld = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
                                        break;
                                    case "type_check_list_item_assigned_to":
                                        valueIndex = host.database.values.getIndex(content3[k].valueid);
                                        assigned_toOld = parseInt(host.database.values.items[valueIndex].content, 10);
                                        break;
                                    default:
                                    break;
                                }
                            }
                            if (due_dateOld == null) continue;
                            data.dataCalOld.push({
                                userid: assigned_toOld,
                                month: due_dateOld.getMonth(),
                                year: due_dateOld.getFullYear()
                            });
                        }
                        break;
                    }
                }
                break;
            default:
                break;
        }
    }
    var assigned_toNew, participantNewList = [], due_dateNew, timestartNew, timeendNew, nameActivity, status;
    data.dataCal = [];
    switch (activity.name) {
        case "task":
        case "call":
        case "meeting":
            for (var i = 0; i < data.value.length; i++){
                switch (data.value[i].localid) {
                    case "type_meeting_name":
                        nameActivity = data.value[i].value;
                        break;
                    case "type_call_work":
                        nameActivity = data.value[i].value;
                        break;
                    case "type_task_work":
                        nameActivity = data.value[i].value;
                        break;
                    case "type_"+activity.name+"_status":
                        status = data.value[i].value;
                        break;
                    case "type_"+activity.name+"_assigned_to":
                        assigned_toNew = parseInt(data.value[i].value, 10);
                        break;
                    case "type_"+activity.name+"_participant":
                        participantNewList = EncodingClass.string.duplicate(data.value[i].value);
                        break;
                    case "type_"+activity.name+"_due_date":
                        due_dateNew = data.value[i].value;
                        data.dataCal.push({
                            "year": due_dateNew.getFullYear(),
                            "month": due_dateNew.getMonth()
                        });
                        break;
                    case "type_meeting_start_date":
                        timestartNew = data.value[i].value;
                        data.dataCal.push({
                            "year": timestartNew.getFullYear(),
                            "month": timestartNew.getMonth()
                        });
                        break;
                    case "type_meeting_end_date":
                        timeendNew = data.value[i].value;
                        data.dataCal.push({
                            "year": timeendNew.getFullYear(),
                            "month": timeendNew.getMonth()
                        });
                        break;
                    default:
                        break;
                }
            }
            if (data.dataCal.length == 2){
                if (data.dataCal[0].year == data.dataCal[1].year && data.dataCal[0].month == data.dataCal[1].month){
                    data.dataCal.splice(1, 1);
                }
            }
            for (var i = 0; i < data.dataCal.length; i++){
                if (data.type == "meeting"){
                    data.dataCal[i].content = {
                        status: status,
                        cardid: cardid,
                        boardid: boardid,
                        timestart: timestartNew,
                        timeend: timeendNew,
                        objid: data.id,
                        type: data.type,
                        nameActivity: nameActivity,
                        assigned_to: assigned_toNew
                    };
                }
                else {
                    data.dataCal[i].content = {
                        status: status,
                        cardid: cardid,
                        boardid: boardid,
                        time: due_dateNew,
                        objid: data.id,
                        type: data.type,
                        nameActivity: nameActivity,
                        assigned_to: assigned_toNew
                    };
                }
            }
            break;
        case "checklist":
            data.dataCalNew = [];
            for (var i = 0; i < data.value.length; i++){
                if (data.value[i].localid == "type_check_list_name"){
                    nameActivity = data.value[i].value;
                    break;
                }
            }
            var itemName;
            for (var i = 0; i < data.value.length; i++){
                if (data.value[i].localid == "type_check_list_items"){
                    for (var j = 0; j < data.value[i].value.length; j++){
                        for (var k = 0; k < data.value[i].value[j].value.length; k++){
                            switch (data.value[i].value[j].value[k].localid) {
                                case "type_check_list_item_name":
                                    itemName = data.value[i].value[j].value[k].value;
                                    break;
                                case "type_check_list_item_success":
                                    status = data.value[i].value[j].value[k].value;
                                    break;
                                case "type_check_list_item_due_date":
                                    due_dateNew = data.value[i].value[j].value[k].value;
                                    break;
                                case "type_check_list_item_assigned_to":
                                    assigned_toNew = parseInt(data.value[i].value[j].value[k].value, 10);
                                    break;
                                default:
                                break;
                            }
                        }
                        if (due_dateNew == null) continue;
                        data.dataCalNew.push({
                            userid: assigned_toNew,
                            month: due_dateNew.getMonth(),
                            year: due_dateNew.getFullYear(),
                            content: {
                                status: status,
                                nameActivity: itemName + " ("+nameActivity+")",
                                cardid: cardid,
                                boardid: boardid,
                                time: due_dateNew,
                                objid: data.id,
                                type: data.type,
                                assigned_to: assigned_toNew
                            }
                        });
                    }
                    break;
                }
            }
            break;
        default:
            break;
    }
    if (id == 0){
        switch (activity.name) {
            case "task":
            case "call":
            case "meeting":
                if (participantNewList.indexOf(assigned_toNew) < 0) participantNewList.push(assigned_toNew);
                data.listUserCalNew = participantNewList;
                break;
            default:
                break;

        }
    }
    else {
        switch (activity.name) {
            case "task":
            case "call":
            case "meeting":
                if (participantOldList.indexOf(assigned_toOld) < 0) participantOldList.push(assigned_toOld);
                data.listUserCalOld = participantOldList;
                if (participantNewList.indexOf(assigned_toNew) < 0) participantNewList.push(assigned_toNew);
                data.listUserCalNew = participantNewList;
                break;
            default:
                break;

        }
    }
    return data;
};

carddone.cards.editActivitiesSave = function(host, cardid, id, typeid, value, activity, mode){
    return new Promise(function(rs, rj){
        var data = carddone.cards.prepareDataEditActivitiesSave(host, host.boardContent.id, cardid, id, typeid, value, activity, mode);
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_activities_edit_save.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: 'cardid', value: cardid}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0){
                            id = content.id;
                            host.database.objects.items.push(content.object);
                            host.database.cards.items[host.database.cards.getIndex(cardid)].activitiesList.push(content.object.id);
                            host.database.cards.items[host.database.cards.getIndex(cardid)][activity.list].push(content.object.id);
                        }
                        else {
                            var index = host.database.objects.getIndex(id);
                            content.object.createdtime = host.database.objects.items[index].createdtime;
                            content.object.userid = host.database.objects.items[index].userid;
                            host.database.objects.items[index] = content.object;
                        }
                        host.database.values.items = host.database.values.items.filter(function(elt){
                            return content.listvalueiddel.indexOf(elt.id) == -1;
                        });
                        if (content.obj_list){
                            host.database.obj_list.items.push(content.obj_list);
                        }
                        content.values.forEach(function(elt){
                            var index = host.database.values.getIndex(elt.id);
                            if (index == -1) host.database.values.items.push(elt);
                            else host.database.values.items[index] = elt;
                        });
                        var randomId = absol.string.randomIdent(20);
                        carddone.cards.receivedList.push(randomId);
                        host.funcs.sendMessage({
                            messageType: "card",
                            type: "editactivities",
                            randomId: randomId,
                            boardId: host.boardContent.id,
                            archived: host.viewArchived ? 1 : 0,
                            cardId: [cardid]
                        });
                        dbcache.refresh("obj_list");
                        dbcache.refresh("objects");
                        dbcache.refresh("values");
                        dbcache.refresh("user_calendar");
                        rs({id: id, objects: host.database.objects, values: host.database.values, data: content.object});
                    }
                    else {
                        rj(message);
                    }
                }
                else {
                    rj(message);
                }
            }
        });
    });
};

carddone.cards.moveCardSave = function(host, cardElt, body, listid, from, to){
    return new Promise(function(rs){
        var cardid, max, min, cardIncreaseIndex, cardDecreaseIndex, index, mode;
        var cardList = body.getAllBoards();
        cardid = cardElt.ident;
        cardIncreaseIndex = [];
        cardDecreaseIndex = [];
        if (from > to){
            max = host.database.cards.items[host.database.cards.getIndex(cardList[to + 1].ident)].lindex;
            min = host.database.cards.items[host.database.cards.getIndex(cardList[from].ident)].lindex;
            index = max;
            host.database.lists.items[host.database.lists.getIndex(listid)].childrenIdList.forEach(function(elt){
                var lindex = host.database.cards.items[host.database.cards.getIndex(elt)].lindex;
                if (lindex >= min && lindex <= max){
                    cardDecreaseIndex.push(elt);
                }
            });
            cardDecreaseIndex.sort(function(a, b){
                var aIndex, bIndex;
                aIndex = host.database.cards.getIndex(a);
                bIndex = host.database.cards.getIndex(b);
                if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return 1;
                if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return -1;
                return 0;
            });
        }
        else{
            max = host.database.cards.items[host.database.cards.getIndex(cardList[from].ident)].lindex;
            min = host.database.cards.items[host.database.cards.getIndex(cardList[to - 1].ident)].lindex;
            index = min;
            host.database.lists.items[host.database.lists.getIndex(listid)].childrenIdList.forEach(function(elt){
                var lindex = host.database.cards.items[host.database.cards.getIndex(elt)].lindex;
                if (lindex >= min && lindex <= max){
                    cardIncreaseIndex.push(elt);
                }
            });
            cardIncreaseIndex.sort(function(a, b){
                var aIndex, bIndex;
                aIndex = host.database.cards.getIndex(a);
                bIndex = host.database.cards.getIndex(b);
                if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return 1;
                if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return -1;
                return 0;
            });
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: 'card_move_save.php',
            params: [
                {name: "oldParentid", value: listid},
                {name: "parentid", value: listid},
                {name: "cardid", value: cardid},
                {name: "index", value: index},
                {name: "min", value: min + 1},
                {name: "max", value: max - 1},
                {name: "cardIncreaseIndex", value: EncodingClass.string.fromVariable(cardIncreaseIndex)},
                {name: "cardDecreaseIndex", value: EncodingClass.string.fromVariable(cardDecreaseIndex)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        host.database.cards.items[host.database.cards.getIndex(cardid)].lindex = index;
                        cardIncreaseIndex.forEach(function(elt){
                            host.database.cards.items[host.database.cards.getIndex(elt)].lindex++;
                        });
                        cardDecreaseIndex.forEach(function(elt){
                            host.database.cards.items[host.database.cards.getIndex(elt)].lindex--;
                        });
                        dbcache.refresh("lists");
                        rs({
                            cardid: cardid,
                            lindex: index,
                            cardIncreaseIndex: cardIncreaseIndex,
                            cardDecreaseIndex: cardDecreaseIndex,
                            body: body,
                            min: min + 1,
                            max: max -1
                        });
                    }
                }
            }
        });
    });
};

carddone.cards.moveCardToOtherListSave = function(host, cardid, target, from, to, body){
    return new Promise(function(rs){
        var parentid, oldIndex, newIndex, fromElt;
        var oldListId, lindex, lindex2, cardDecreaseIndex, cardIncreaseIndex;
        var cardList = body.getAllBoards();
        var cIndex = host.database.cards.getIndex(cardid);
        var oldParentid = host.database.cards.items[cIndex].parentid;
        parentid = target.ident;
        oldIndex = from.index;
        newIndex = to.index;
        fromElt = from.table.parentNode;
        cardDecreaseIndex = [];
        cardIncreaseIndex = [];
        lindex2 = host.database.cards.items[cIndex].lindex;
        oldListId = host.database.cards.items[cIndex].parentid;
        host.database.lists.items[host.database.lists.getIndex(oldListId)].childrenIdList.forEach(function(elt){
            if (host.database.cards.items[host.database.cards.getIndex(elt)].lindex > lindex2) cardDecreaseIndex.push(elt);
        });
        cardDecreaseIndex.sort(function(a, b){
            var aIndex, bIndex;
            aIndex = host.database.cards.getIndex(a);
            bIndex = host.database.cards.getIndex(b);
            if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return 1;
            if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return -1;
            return 0;
        });
        if (newIndex > 0) lindex = host.database.cards.items[host.database.cards.getIndex(cardList[newIndex - 1].ident)].lindex;
        else lindex = host.database.lists.items[host.database.lists.getIndex(parentid)].childrenIdList.length;
        host.database.lists.items[host.database.lists.getIndex(parentid)].childrenIdList.forEach(function(elt){
            if (host.database.cards.items[host.database.cards.getIndex(elt)].lindex >= lindex) cardIncreaseIndex.push(elt);
        });
        cardIncreaseIndex.sort(function(a, b){
            var aIndex, bIndex;
            aIndex = host.database.cards.getIndex(a);
            bIndex = host.database.cards.getIndex(b);
            if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return 1;
            if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return -1;
            return 0;
        });
        ModalElement.show_loading();
        FormClass.api_call({
            url: 'card_move_save.php',
            params: [
                {name: "oldParentid", value: oldParentid},
                {name: "parentid", value: parentid},
                {name: "cardid", value: cardid},
                {name: "index", value: lindex},
                {name: "min", value: lindex + 1},
                {name: "max", value: host.database.lists.items[host.database.lists.getIndex(oldListId)].childrenIdList.length - 2},
                {name: "cardIncreaseIndex", value: EncodingClass.string.fromVariable(cardIncreaseIndex)},
                {name: "cardDecreaseIndex", value: EncodingClass.string.fromVariable(cardDecreaseIndex)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        host.database.cards.items[cIndex].parentid = parentid;
                        var temp = host.database.lists.items[host.database.lists.getIndex(oldParentid)].childrenIdList.filter(function(elt){
                            return elt != cardid;
                        });
                        host.database.lists.items[host.database.lists.getIndex(oldParentid)].childrenIdList = temp;
                        fromElt.title = fromElt.listName + " (" + temp.length + ")";
                        host.database.lists.items[host.database.lists.getIndex(parentid)].childrenIdList.push(cardid);
                        target.title = target.listName + " (" + host.database.lists.items[host.database.lists.getIndex(parentid)].childrenIdList.length + ")";
                        host.database.cards.items[host.database.cards.getIndex(cardid)].lindex = lindex;
                        cardIncreaseIndex.forEach(function(elt){
                            host.database.cards.items[host.database.cards.getIndex(elt)].lindex++;
                        });
                        cardDecreaseIndex.forEach(function(elt){
                            host.database.cards.items[host.database.cards.getIndex(elt)].lindex--;
                        });
                        dbcache.refresh("lists");
                        var editMode = 'view';
                        if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
                        else if (host.priv[3]) editMode = "edit";
                        else if (host.priv[2]) editMode = "view";
                        // for (var i = 0; i < host.database.list_member.items.length; i++){
                        //     if (host.database.list_member.items[i].userid == systemconfig.userid) {
                        //         if (host.database.list_member.items[i].type > 0) editMode = 'edit';
                        //         else {
                        //             if (host.boardContent.permission == 1) {
                        //                 if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
                        //                 else editMode = "view";
                        //             }
                        //             else editMode = "edit";
                        //         }
                        //         break;
                        //     }
                        // }
                        var cardContent = {
                            id: host.database.cards.items[cIndex].id,
                            name: host.database.cards.items[cIndex].name,
                            userid: host.database.cards.items[cIndex].userid,
                            owner: host.database.cards.items[cIndex].owner > 0 ? host.database.cards.items[cIndex].owner : host.database.cards.items[cIndex].userid,
                            parentid: host.database.cards.items[cIndex].parentid,
                            companies: host.database.cards.items[cIndex].companyList,
                            contacts: host.database.cards.items[cIndex].contactList,
                            archived: host.viewArchived ? 1 : 0,
                            lindex: host.database.cards.items[cIndex].lindex,
                            editMode: editMode,
                            editFunc: function(parentid, id, editMode){
                                return function(){
                                    carddone.cards.prevEditCard(host, parentid, id, editMode);
                                }
                            }(host.database.cards.items[cIndex].parentid, host.database.cards.items[cIndex].id, editMode),
                            deleteFunc: host.viewArchived ? function(id){
                                return function(){
                                    return carddone.cards.deleteCardFromArchived(host, id);
                                }
                            }(host.database.cards.items[cIndex].id) : function(id){
                                return function(){
                                    return carddone.cards.deleteCard(host, id);
                                }
                            }(host.database.cards.items[cIndex].id),
                            moveFunc: function(id){
                                return function(){
                                    return carddone.cards.moveCard(host, id);
                                }
                            }(host.database.cards.items[cIndex].id),
                            archiveFunc: function(id){
                                return function(){
                                    return carddone.cards.archiveCard(host, id);
                                }
                            }(host.database.cards.items[cIndex].id),
                            restoreFunc: function(id, parentid){
                                return function(){
                                    return carddone.cards.restoreCard(host, id, parentid);
                                }
                            }(host.database.cards.items[cIndex].id, host.database.cards.items[cIndex].parentid)
                        }
                        rs({
                            cardid: cardid,
                            lindex: lindex,
                            min: lindex + 1,
                            max: host.database.lists.items[host.database.lists.getIndex(oldListId)].childrenIdList.length - 1,
                            cardIncreaseIndex: cardIncreaseIndex,
                            cardDecreaseIndex: cardDecreaseIndex,
                            from: from,
                            to: to,
                            cardContent: cardContent
                        });
                    }
                }
            }
        });
    });
};

carddone.boards.editCardSave = function(host, id, value, listid, editMode){
    return new Promise(function(rs){
        var contactInsert, contactDelete, companiesInsert, companiesDelete, contact_to_del, company_to_del, lindex, cardToUpdateIndex, oindex;
        cardToUpdateIndex = [];
        oindex = 0;
        var attention = "none", email_group_add = [], email_group_del = [];
        if (host.boardContent.email_group_required && value.email_groups.length == 0){
            ModalElement.alert({message: LanguageModule.text("war_txt_email_group_is_null")});
            return;
        }
        if (id == 0){
            companiesDelete = [];
            contactDelete = [];
            contactInsert = value.contact;
            companiesInsert = value.companies;
            lindex = host.database.lists.items[host.database.lists.getIndex(value.stage)].childrenIdList.length;
            attention = value.attention? "add" : "none";
            email_group_add = value.email_groups;
        }
        else {
            var attentionold = 0;
            for (var i = 0; i < host.database.attention_lists.items.length; i++){
                if (host.database.attention_lists.items[i].listid == id){
                    attentionold = 1;
                    break;
                }
            }
            if (attentionold != value.attention){
                if (attentionold) attention = "del";
                else attention = "add";
            }
            for (var i = 0; i < host.database.card_email_groups.items.length; i++){
                if (value.email_groups.indexOf(host.database.card_email_groups.items[i].groupid) < 0) email_group_del.push(host.database.card_email_groups.items[i].id);
            }
            var getIndexFromcard_email_groupsByGroupid = function(groupid){
                for (var i = 0; i < host.database.card_email_groups.items.length; i++){
                    if (host.database.card_email_groups.items[i].groupid == groupid) return i;
                }
                return -1;
            };
            for (var i = 0; i < value.email_groups.length; i++){
                if (getIndexFromcard_email_groupsByGroupid(value.email_groups[i]) < 0) email_group_add.push(value.email_groups[i]);
            }
            var index = host.database.cards.getIndex(id);
            contact_to_del = host.database.cards.items[index].contactList.filter(function(elt){
                return value.contact.indexOf(elt) == -1;
            });
            contactDelete = contact_to_del.map(function(elt){
                for (var i = 0; i < host.database.contact.items.length; i++){
                    if (host.database.contact_card.items[i].hostid == id && host.database.contact_card.items[i].contactid == elt) return host.database.contact_card.items[i].id;
                }
                return -1;
            });
            contactInsert = value.contact.filter(function(elt){
                return host.database.cards.items[index].contactList.indexOf(elt) == -1;
            });
            company_to_del = host.database.cards.items[index].companyList.filter(function(elt){
                return value.companies.indexOf(elt) == -1;
            });
            companiesDelete = company_to_del.map(function(elt){
                for (var i = 0; i < host.database.companies.items.length; i++){
                    if (host.database.company_card.items[i].hostid == id && host.database.company_card.items[i].companyid == elt) return host.database.company_card.items[i].id;
                }
                return -1;
            });
            companiesInsert = value.companies.filter(function(elt){
                return host.database.cards.items[index].companyList.indexOf(elt) == -1;
            });
            if (listid != value.stage){
                oindex = host.database.cards.items[index].lindex;
                lindex = host.database.lists.items[host.database.lists.getIndex(value.stage)].childrenIdList.length;
                host.database.lists.items[host.database.lists.getIndex(listid)].childrenIdList.forEach(function(elt){
                    var idx = host.database.cards.getIndex(elt);
                    if (host.database.cards.items[idx].lindex > oindex) {
                        cardToUpdateIndex.push(elt);
                        host.database.cards.items[idx].lindex--;
                    }
                });
                cardToUpdateIndex.sort(function(a, b){
                    var aIndex, bIndex;
                    aIndex = host.database.cards.getIndex(a);
                    bIndex = host.database.cards.getIndex(b);
                    if (host.database.cards.items[aIndex].lindex > host.database.cards.items[bIndex].lindex) return 1;
                    if (host.database.cards.items[aIndex].lindex < host.database.cards.items[bIndex].lindex) return -1;
                    return 0;
                });
            }
            else lindex = host.database.cards.items[index].lindex;
        }
        var params = [
            {name: "id", value: id},
            {name: "name", value: value.name},
            {name: "objectid", value: 0},
            // {name: "objectid", value: value.objectid},
            {name: "lindex", value: lindex},
            {name: "oindex", value: oindex},
            {name: "stage", value: value.stage},
            {name: "important", value: value.important},
            {name: "owner", value: value.owner},
            {name: "knowledge", value: value.knowledge},
            {name: "attention", value: attention},
            {name: "email_group_add", value: EncodingClass.string.fromVariable(email_group_add)},
            {name: "email_group_del", value: EncodingClass.string.fromVariable(email_group_del)},
            {name: "cardToUpdateIndex", value: EncodingClass.string.fromVariable(cardToUpdateIndex)},
            {name: "contactInsert", value: EncodingClass.string.fromVariable(contactInsert)},
            {name: "contactDelete", value: EncodingClass.string.fromVariable(contactDelete)},
            {name: "companiesDelete", value: EncodingClass.string.fromVariable(companiesDelete)},
            {name: "companiesInsert", value: EncodingClass.string.fromVariable(companiesInsert)},
        ];
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_edit_save.php",
            params: params,
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0) {
                            id = content.data.id;
                            content.data.boardid = host.boardContent.boardid;
                            host.database.cards.items.push(content.data);
                            host.database.lists.items[host.database.lists.getIndex(content.data.parentid)].childrenIdList.push(content.data.id);
                            var activitiesArray = ['activitiesList', 'callList', 'chatList', 'check_listList', 'fieldList', 'fileList', 'meetingList', 'noteList', 'taskList', 'waitList', 'contactList', 'companyList', 'sendmailList'];
                            activitiesArray.forEach(function(elt){
                                host.database.cards.items[host.database.cards.items.length - 1][elt] = [];
                            });
                            host.database.cards.items[host.database.cards.items.length - 1]["contactList"] = content.contact.map(function(elt){
                                return elt.contactid;
                            });
                            host.database.cards.items[host.database.cards.items.length - 1]["companyList"] = content.companies.map(function(elt){
                                return elt.companyid;
                            });
                            host.database.contact_card.items = host.database.contact_card.items.concat(content.contact);
                            host.database.company_card.items = host.database.company_card.items.concat(content.companies);
                            rs({
                                task: "add",
                                cardid: id,
                                listid: listid,
                                content: {
                                    id: content.data.id,
                                    name: content.data.name,
                                    userid: content.data.userid,
                                    owner: content.data.owner == 0 ? content.data.userid : content.data.owner,
                                    parentid: content.data.parentid,
                                    companies: content.data.companyList,
                                    contacts: content.data.contactList,
                                    archived: host.viewArchived ? 1 : 0,
                                    lindex: content.data.lindex,
                                    editMode: editMode,
                                    editFunc: function(parentid, id, editMode){
                                        return function(){
                                            carddone.cards.prevEditCard(host, parentid, id, editMode);
                                        }
                                    }(content.data.parentid, content.data.id, editMode),
                                    deleteFunc: host.viewArchived ? function(id){
                                        return function(){
                                            return carddone.cards.deleteCardFromArchived(host, id);
                                        }
                                    }(content.data.id) : function(id){
                                        return function(){
                                            return carddone.cards.deleteCard(host, id);
                                        }
                                    }(content.data.id),
                                    moveFunc: function(id){
                                        return function(){
                                            return carddone.cards.moveCard(host, id);
                                        }
                                    }(content.data.id),
                                    archiveFunc: function(id){
                                        return function(){
                                            return carddone.cards.archiveCard(host, id);
                                        }
                                    }(content.data.id),
                                    restoreFunc: function(id, parentid){
                                        return function(){
                                            return carddone.cards.restoreCard(host, id, parentid);
                                        }
                                    }(content.data.id, content.data.parentid)
                                }
                            });
                        }
                        else {
                            var index = host.database.cards.getIndex(id);
                            host.database.cards.items[index].name = content.data.name;
                            host.database.cards.items[index].parentid = content.data.parentid;
                            host.database.cards.items[index].important = content.data.important;
                            host.database.cards.items[index].owner = content.data.owner;
                            if (listid != value.stage){
                                var temp = host.database.lists.items[host.database.lists.getIndex(listid)].childrenIdList.filter(function(elt){
                                    return elt != id;
                                });
                                host.database.lists.items[host.database.lists.getIndex(listid)].childrenIdList = temp;
                                host.database.lists.items[host.database.lists.getIndex(value.stage)].childrenIdList.push(id);
                                host.database.cards.items[index].lindex = content.data.lindex;
                            }
                            host.database.cards.items[index].companyList = host.database.cards.items[index].companyList.filter(function(elt){
                                return company_to_del.indexOf(elt) == -1;
                            });
                            host.database.cards.items[index].contactList = host.database.cards.items[index].contactList.filter(function(elt){
                                return contact_to_del.indexOf(elt) == -1;
                            });
                            host.database.cards.items[index].contactList = host.database.cards.items[index].contactList.concat(content.contact.map(function(elt){
                                return elt.contactid;
                            }));
                            host.database.cards.items[index].companyList = host.database.cards.items[index].companyList.concat(content.companies.map(function(elt){
                                return elt.companyid;
                            }));
                            host.database.contact_card.items = host.database.contact_card.items.filter(function(elt){
                                return contactDelete.indexOf(elt.id) == -1;
                            });
                            host.database.company_card.items = host.database.company_card.items.filter(function(elt){
                                return companiesDelete.indexOf(elt.id) == -1;
                            });
                            host.database.contact_card.items = host.database.contact_card.items.concat(content.contact);
                            host.database.company_card.items = host.database.company_card.items.concat(content.companies);
                            for (var i = 0; i < host.database.knowledge.items.length; i++){
                                if (host.database.knowledge.items[i].cardid == id){
                                    host.database.knowledge.items[i].available = value.knowledge;
                                    break;
                                }
                            }
                            rs({
                                task: "edit",
                                cardid: content.data.id,
                                listid: value.stage,
                                oldParentid: listid,
                                content: {
                                    id: host.database.cards.items[index].id,
                                    name: host.database.cards.items[index].name,
                                    userid: host.database.cards.items[index].userid,
                                    owner: host.database.cards.items[index].owner != 0 ? host.database.cards.items[index].owner : host.database.cards.items[index].userid,
                                    parentid: host.database.cards.items[index].parentid,
                                    companies: host.database.cards.items[index].companyList,
                                    contacts: host.database.cards.items[index].contactList,
                                    archived: host.viewArchived ? 1 : 0,
                                    lindex: host.database.cards.items[index].lindex,
                                    editMode: editMode,
                                    editFunc: function(parentid, id, editMode){
                                        return function(){
                                            carddone.cards.prevEditCard(host, parentid, id, editMode);
                                        }
                                    }(host.database.cards.items[index].parentid, host.database.cards.items[index].id, editMode),
                                    deleteFunc: host.viewArchived ? function(id){
                                        return function(){
                                            return carddone.cards.deleteCardFromArchived(host, id);
                                        }
                                    }(host.database.cards.items[index].id) : function(id){
                                        return function(){
                                            return carddone.cards.deleteCard(host, id);
                                        }
                                    }(host.database.cards.items[index].id),
                                    moveFunc: function(id){
                                        return function(){
                                            return carddone.cards.moveCard(host, id);
                                        }
                                    }(host.database.cards.items[index].id),
                                    archiveFunc: function(id){
                                        return function(){
                                            return carddone.cards.archiveCard(host, id);
                                        }
                                    }(host.database.cards.items[index].id),
                                    restoreFunc: function(id, parentid){
                                        return function(){
                                            return carddone.cards.restoreCard(host, id, parentid);
                                        }
                                    }(host.database.cards.items[index].id, host.database.cards.items[index].parentid)
                                }
                            });
                        }
                        if (attention == "add"){
                            host.database.attention_lists.items.push(content.attentionData);
                        }
                        else if (attention == "del"){
                            for (var i = 0; i < host.database.attention_lists.items.length; i++){
                                if (host.database.attention_lists.items[i].listid == id){
                                    host.database.attention_lists.items.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        host.database.card_email_groups.items = content.card_email_groups;
                        dbcache.refresh("lists");
                        dbcache.refresh("contact_card");
                        dbcache.refresh("company_card");
                        dbcache.refresh("attention_lists");
                        dbcache.refresh("card_email_groups");
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

carddone.cards.addCheckListForm = function(host, cardid, id){
    if (cardid == 0) return;
    var index, valueIndex, singlePage;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -25, value, {name: 'checklist', list: 'check_listList'}, 0).then(function rs(value){
                    id = value.id;
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -25, value, {name: 'checklist', list: 'check_listList'}, 1).then(function rs(value){
                    host.frameList.removeLast();
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        delete: function () {
            return new Promise(function(resolve, reject){
                return carddone.cards.deleteActivity(host, cardid, id, 'check_listList').then(function rs(value){
                    resolve(value);
                }, function rj(message){
                    console.log(message);
                    reject(message);
                });
            });
        }
    };
    var cIndex = host.database.cards.getIndex(cardid);
    var editMode;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
    else if (host.priv[3]) editMode = "edit";
    else if (host.priv[2]) editMode = "view";
    else return;
    singlePage = host.funcs.cardAddCheckListForm({
        id: id,
        isMobile: host.isMobile,
        cardid: cardid,
        boardArchived: host.viewArchived ? 1 : 0,
        cardArchived: host.viewMode == "archived" ? 1 : 0,
        editMode: editMode,
        cardContent: host.database.cards.items[host.database.cards.getIndex(cardid)],
        typelists: host.database.typelists,
        companies: host.database.companies,
        company_class: host.database.company_class,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: cardid > 0 ? host.database.cards.items[host.database.cards.getIndex(cardid)].name : "",
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editCheckListFunc: function(cardid, id){
            carddone.cards.addCheckListForm(host, cardid, id);
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while (host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.addWaitForm = function(host, cardid, id){
    if (cardid == 0) return;
    var index, valueIndex, singlePage;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -23, value, {name: 'wait', list: 'waitList'}, 0).then(function rs(value){
                    id = value.id;
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -23, value, {name: 'wait', list: 'waitList'}, 1).then(function rs(value){
                    host.frameList.removeLast();
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        delete: function () {
            return new Promise(function(resolve, reject){
                return carddone.cards.deleteActivity(host, cardid, id, 'waitList').then(function rs(value){
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        }
    };
    var cIndex = host.database.cards.getIndex(cardid);
    var editMode;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
    else if (host.priv[3]) editMode = "edit";
    else if (host.priv[2]) editMode = "view";
    else return;
    singlePage = host.funcs.cardAddWaitForm({
        id: id,
        isMobile: host.isMobile,
        cardid: cardid,
        boardArchived: host.viewArchived ? 1 : 0,
        cardArchived: host.viewMode == "archived" ? 1 : 0,
        editMode: editMode,
        cardContent: host.database.cards.items[host.database.cards.getIndex(cardid)],
        typelists: host.database.typelists,
        companies: host.database.companies,
        company_class: host.database.company_class,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: cardid > 0 ? host.database.cards.items[host.database.cards.getIndex(cardid)].name : "",
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editWaitFunc: function(cardid, id){
            carddone.cards.addWaitForm(host, cardid, id);
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.addCallForm = function(host, cardid, id){
    if (cardid == 0) return;
    var index, valueIndex, singlePage;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -22, value, {name: 'call', list: 'callList'}, 0).then(function rs(value){
                    id = value.id;
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -22, value, {name: 'call', list: 'callList'}, 1).then(function rs(value){
                    host.frameList.removeLast();
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        delete: function () {
            return new Promise(function(resolve, reject){
                return carddone.cards.deleteActivity(host, cardid, id, 'callList').then(function rs(value){
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        }
    };
    var cIndex = host.database.cards.getIndex(cardid);
    var editMode;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
    else if (host.priv[3]) editMode = "edit";
    else if (host.priv[2]) editMode = "view";
    else return;
    singlePage = host.funcs.cardAddCallForm({
        id: id,
        isMobile: host.isMobile,
        cardid: cardid,
        boardArchived: host.viewArchived ? 1 : 0,
        cardArchived: host.viewMode == "archived" ? 1 : 0,
        editMode: editMode,
        cardContent: host.database.cards.items[cIndex],
        typelists: host.database.typelists,
        companies: host.database.companies,
        company_class: host.database.company_class,
        values: host.database.values,
        objects: host.database.objects,
        cmdButton: cmdButton,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: host.database.cards.items[cIndex].name,
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editCallFunc: function(cardid, id){
            carddone.cards.addCallForm(host, cardid, id);
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.addTaskForm = function(host, cardid, id){
    if (cardid == 0) return;
    var index, valueIndex, singlePage;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -18, value, {name: 'task', list: 'taskList'}, 0).then(function rs(value){
                    id = value.id;
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -18, value, {name: 'task', list: 'taskList'}, 1).then(function rs(value){
                    host.frameList.removeLast();
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        delete: function () {
            return new Promise(function(resolve, reject){
                return carddone.cards.deleteActivity(host, cardid, id, 'taskList').then(function rs(value){
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        }
    };
    var cIndex = host.database.cards.getIndex(cardid);
    var editMode;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
    else if (host.priv[3]) editMode = "edit";
    else if (host.priv[2]) editMode = "view";
    else return;
    singlePage = host.funcs.cardAddTaskForm({
        id: id,
        isMobile: host.isMobile,
        cardid: cardid,
        boardArchived: host.viewArchived ? 1 : 0,
        cardArchived: host.viewMode == "archived" ? 1 : 0,
        editMode: editMode,
        cardContent: host.database.cards.items[cIndex],
        typelists: host.database.typelists,
        companies: host.database.companies,
        company_class: host.database.company_class,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: host.database.cards.items[cIndex].name,
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editTaskFunc: function(cardid, id){
            carddone.cards.addTaskForm(host, cardid, id);
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.addMeetingForm = function(host, cardid, id){
    if (cardid == 0) return;
    var index, valueIndex, singlePage;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -20, value, {name: 'meeting', list: 'meetingList'}, 0).then(function rs(value){
                    id = value.id;
                    resolve(value);
                }, function rj(message){
                    console.log(message);
                    reject(message);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -20, value, {name: 'meeting', list: 'meetingList'}, 1).then(function rs(value){
                    host.frameList.removeLast();
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        delete: function () {
            return new Promise(function(resolve, reject){
                return carddone.cards.deleteActivity(host, cardid, id, 'meetingList').then(function rs(value){
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        }
    };
    var cIndex = host.database.cards.getIndex(cardid);
    var editMode;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
    else if (host.priv[3]) editMode = "edit";
    else if (host.priv[2]) editMode = "view";
    else return;
    singlePage = host.funcs.cardAddMeetingForm({
        id: id,
        isMobile: host.isMobile,
        cardid: cardid,
        boardArchived: host.viewArchived ? 1 : 0,
        cardArchived: host.viewMode == "archived" ? 1 : 0,
        editMode: editMode,
        cardContent: host.database.cards.items[cIndex],
        typelists: host.database.typelists,
        companies: host.database.companies,
        company_class: host.database.company_class,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: host.database.cards.items[cIndex].name,
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editMeetingFunc: function(cardid, id){
            carddone.cards.addMeetingForm(host, cardid, id);
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.addNoteForm = function(host, cardid, id){
    if (cardid == 0) return;
    var index, valueIndex, singlePage;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -21, value, {name: 'note', list: 'noteList'}, 0).then(function rs(value){
                    id = value.id;
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, -21, value, {name: 'note', list: 'noteList'}, 1).then(function rs(value){
                    host.frameList.removeLast();
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        delete: function () {
            return new Promise(function(resolve, reject){
                return carddone.cards.deleteActivity(host, cardid, id, 'noteList').then(function rs(value){
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        }
    };
    var cIndex = host.database.cards.getIndex(cardid);
    var editMode;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
    else if (host.priv[3]) editMode = "edit";
    else if (host.priv[2]) editMode = "view";
    else return;
    singlePage = host.funcs.cardAddNoteForm({
        id: id,
        isMobile: host.isMobile,
        cardid: cardid,
        boardArchived: host.viewArchived ? 1 : 0,
        cardArchived: host.viewMode == "archived" ? 1 : 0,
        editMode: editMode,
        cardContent: host.database.cards.items[host.database.cards.getIndex(cardid)],
        typelists: host.database.typelists,
        companies: host.database.companies,
        company_class: host.database.company_class,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: cardid > 0 ? host.database.cards.items[host.database.cards.getIndex(cardid)].name : "",
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editNoteFunc: function(cardid, id){
            carddone.cards.addNoteForm(host, cardid, id);
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.knowledgeEditSubmit = function(host, cardid, knowledgeid, typesubmit){
    return new Promise(function(resolve, reject){
        var groupValueOld = [];
        for (var i = 0; i < host.database.knowledge_group_link.items.length; i++){
            if (host.database.knowledge_group_link.items[i].knowledgeid == knowledgeid) groupValueOld.push(host.database.knowledge_group_link.items[i].knowledge_groupid);
        }
        var data = host.knowledgeEdit.getValue();
        if (data.groupValue.length == 0){
            ModalElement.alert({message: LanguageModule.text("txt_no_select_group")});
            return;
        }
        data.listAdd = [];
        data.listDel = [];
        for (var i = 0; i < groupValueOld.length; i++){
            if (data.groupValue.indexOf(groupValueOld[i]) < 0) data.listDel.push(groupValueOld[i]);
        }
        for (var i = 0; i < data.groupValue.length; i++){
            if (groupValueOld.indexOf(data.groupValue[i]) < 0) data.listAdd.push(data.groupValue[i]);
        }
        data.id = knowledgeid;
        data.cardid = cardid;
        if (knowledgeid > 0){
            var knowledgeIndex = host.database.knowledge.getIndex(knowledgeid);
            data.ver = host.database.knowledge.items[knowledgeIndex].ver;
        }
        else {
            data.ver = 1;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_save_knowledge.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        if (knowledgeid == 0){
                            knowledgeid = content.knowledge.id;
                        }
                        else {
                            content.knowledge.createdtime = host.database.knowledge.items[knowledgeIndex].createdtime;
                            content.knowledge.userid = host.database.knowledge.items[knowledgeIndex].userid;
                        }
                        host.database.knowledge.items = [content.knowledge];
                        host.database.knowledge_group_link.items = content.knowledge_group_link;
                        dbcache.refresh("knowledge");
                        dbcache.refresh("knowledge_group_link");
                        resolve(knowledgeid);
                        if (typesubmit == 0){
                            carddone.cards.knowledgeEdit(host, cardid);
                        }
                        else {
                            var x = 2;
                            if (host.isMobile) x = 3;
                            while (host.frameList.getLength() > x){
                                host.frameList.removeLast();
                            }
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

carddone.cards.knowledgeEdit = function(host, cardid){
    return new Promise(function(resolve, reject){
        if (cardid == 0) return;
        var cardIndex = host.database.cards.getIndex(cardid);
        var knowledgeid = 0;
        for (var i = 0; i < host.database.knowledge.items.length; i++){
            if (host.database.knowledge.items[i].cardid == cardid){
                knowledgeid = host.database.knowledge.items[i].id;
                break;
            }
        }
        var cmdButton = {
            close: function (event, me) {
                var x = 2;
                if (host.isMobile) x = 3;
                while (host.frameList.getLength() > x){
                    host.frameList.removeLast();
                }
                resolve(knowledgeid);
            },
            save: function (event, me) {
                carddone.cards.knowledgeEditSubmit(host, cardid, knowledgeid, 0).then(function(value){
                    resolve(value);
                });
            },
            save_close: function (event, me) {
                carddone.cards.knowledgeEditSubmit(host, cardid, knowledgeid, 1).then(function(value){
                    resolve(value);
                });
            }
        };
        var data;
        if (knowledgeid == 0){
            data = {
                name: host.database.cards.items[cardIndex].name,
                description: "",
                tag: "",
                groupValue: []
            };
        }
        else {
            var knowledgeIndex = host.database.knowledge.getIndex(knowledgeid);
            data = {
                name: host.database.knowledge.items[knowledgeIndex].name,
                description: host.database.knowledge.items[knowledgeIndex].description,
                tag: host.database.knowledge.items[knowledgeIndex].tag,
                createdby: contentModule.getUsernameByhomeid(host, host.database.knowledge.items[knowledgeIndex].userid),
                createdtime: contentModule.getTimeSend(host.database.knowledge.items[knowledgeIndex].createdtime),
                groupValue: []
            };
            for (var i = 0; i < host.database.knowledge_group_link.items.length; i++){
                if (host.database.knowledge_group_link.items[i].knowledgeid == knowledgeid) data.groupValue.push(host.database.knowledge_group_link.items[i].knowledge_groupid);
            }
        }
        var getGroupItem = function(id){
            var index = host.database.knowledge_groups.getIndex(id);
            var child = [];
            var ni;
            for (var i = 0; i < host.database.knowledge_groups.items[index].childrenIndexList.length; i++){
                ni = host.database.knowledge_groups.items[index].childrenIndexList[i];
                child.push(getGroupItem(host.database.knowledge_groups.items[ni].id));
            }
            var checked = false;
            if (data.groupValue.indexOf(id) >= 0) checked = true;
            return {
                id: host.database.knowledge_groups.items[index].id,
                name: host.database.knowledge_groups.items[index].name,
                checked: checked,
                child: child
            };
        };
        data.groupList = [];
        for (var i = 0; i < host.database.knowledge_groups.items.length; i++){
            if (host.database.knowledge_groups.items[i].parentid > 0) continue;
            data.groupList.push(getGroupItem(host.database.knowledge_groups.items[i].id));
        }
        host.knowledgeEdit = host.funcs.formKnowledgeEdit({
            cmdButton: cmdButton,
            data: data,
            knowledge_groups: host.database.knowledge_groups,
            listTagKnowledge: host.listTagKnowledge
        });
        host.frameList.addChild(host.knowledgeEdit);
        host.knowledgeEdit.requestActive();
    });
};

carddone.cards.addFileSave = function(host, cardid, fileData, title){
    var cardIndex = host.database.cards.getIndex(cardid);
    var chatIndex = host.database.cards.items[cardIndex].chatIndex;
    return new Promise(function(resolve, reject){
        if (fileData.type == "chat"){
            var data = {
                localid: fileData.id,
                sessionid: host.database.chat_sessions.items[chatIndex].id,
                title: title
            };
            ModalElement.show_loading();
            FormClass.api_call({
                url: "cards_change_title_file_chat.php",
                params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var k = false;
                            for (var i = 0; i < host.allFiles.length; i++){
                                for (var j = 0; j < host.allFiles[i].listFile.length; j++){
                                    if (host.allFiles[i].listFile[j].id == fileData.id) {
                                        host.allFiles[i].listFile[j].title = title;
                                        k = true;
                                        break;
                                    }
                                }
                                if (k) break;
                            }
                            if (fileData.content_type == "img"){
                                for (var i = 0; i < host.imagesList.length; i++){
                                    if (host.imagesList[i].id == fileData.id) {
                                        host.imagesList[i].title = title;
                                        break;
                                    }
                                }
                            }
                            for (var i = 0; i < host.database.chat_sessions.items[chatIndex].content.length; i++){
                                if (host.database.chat_sessions.items[chatIndex].content[i].localid == fileData.id){
                                    host.database.chat_sessions.items[chatIndex].content[i].title = title;
                                    break;
                                }
                            }
                            dbcache.refresh("chat_sessions");
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
        }
        else {
            var value = [
                {
                    localid: "type_file_title",
                    valueid: 0,
                    typeid: -1,
                    privtype: "string",
                    value: title
                },
                {
                    localid: "type_file_name",
                    valueid: 0,
                    typeid: -1,
                    privtype: "string",
                    value: fileData.filename
                }
            ];
            carddone.cards.editActivitiesSave(host, cardid, fileData.id, -26, value, {name: 'file', list: 'fileList'}, 0).then(function(value){
                resolve(value);
                var k = false;
                for (var i = 0; i < host.allFiles.length; i++){
                    for (var j = 0; j < host.allFiles[i].listFile.length; j++){
                        if (host.allFiles[i].listFile[j].id == fileData.id) {
                            host.allFiles[i].listFile[j].title = title;
                            k = true;
                            break;
                        }
                    }
                    if (k) break;
                }
                if (fileData.content_type == "img"){
                    for (var i = 0; i < host.imagesList.length; i++){
                        if (host.imagesList[i].id == fileData.id) {
                            host.imagesList[i].title = title;
                            break;
                        }
                    }
                }
            });
        }
    });
};

carddone.cards.deleteFile = function(host, cardid, fileData){
    return new Promise(function(resolve, reject){
        if (fileData.type == "chat"){
            var cardIndex = host.database.cards.getIndex(cardid);
            var chatIndex = host.database.cards.items[cardIndex].chatIndex;
            var data = {
                localid: fileData.id,
                sessionid: host.database.chat_sessions.items[chatIndex].id
            };
            ModalElement.show_loading();
            FormClass.api_call({
                url: "chats_delete_message.php",
                params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var k = false;
                            for (var i = 0; i < host.allFiles.length; i++){
                                for (var j = 0; j < host.allFiles[i].listFile.length; j++){
                                    if (host.allFiles[i].listFile[j].id == fileData.id) {
                                        host.allFiles[i].listFile.splice(j, 1);
                                        k = true;
                                        break;
                                    }
                                }
                                if (k) {
                                    if (host.allFiles[i].listFile.length == 0) host.allFiles.splice(i);
                                    break;
                                }
                            }
                            if (fileData.type == "img"){
                                for (var i = 0; i < host.imagesList.length; i++){
                                    if (host.imagesList[i].id == fileData.id) {
                                        host.imagesList.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            for (var i = 0; i < host.database.chat_sessions.items[chatIndex].content.length; i++){
                                if (host.database.chat_sessions.items[chatIndex].content[i].localid == fileData.id){
                                    host.database.chat_sessions.items[chatIndex].content.splice(i, 1);
                                    break;
                                }
                            }
                            dbcache.refresh("chat_sessions");
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
        }
        else {
            return new Promise(function(rs, rj){
                ModalElement.show_loading();
                var filename;
                if (fileData.content_type == "img"){
                    filename = "uploads/images/" + fileData.id + "_" + fileData.filename + ".upload";
                }
                else {
                    filename = "uploads/files/" + fileData.id + "_" + fileData.filename + ".upload";
                }
                FormClass.api_call({
                    url: "card_activities_delete.php",
                    params: [
                        {value: cardid, name: "cardid"},
                        {value: fileData.id, name: "id"},
                        {value: filename, name: "filename"},
                        {name: "data", value: EncodingClass.string.fromVariable({})},
                        {name: "type_activity", value: "file"}
                    ],
                    func: function(success, message){
                        ModalElement.close(-1);
                        if (success){
                            if (message.substr(0, 2) == "ok"){
                                var k = false;
                                for (var i = 0; i < host.allFiles.length; i++){
                                    for (var j = 0; j < host.allFiles[i].listFile.length; j++){
                                        if (host.allFiles[i].listFile[j].id == fileData.id) {
                                            host.allFiles[i].listFile.splice(j, 1);
                                            k = true;
                                            break;
                                        }
                                    }
                                    if (k) {
                                        if (host.allFiles[i].listFile.length == 0) host.allFiles.splice(i);
                                        break;
                                    }
                                }
                                if (fileData.type == "img"){
                                    for (var i = 0; i < host.imagesList.length; i++){
                                        if (host.imagesList[i].id == fileData.id) {
                                            host.imagesList.splice(i, 1);
                                            break;
                                        }
                                    }
                                }

                                var oIndex = host.database.objects.getIndex(fileData.id);
                                host.database.objects.items.splice(oIndex, 1);
                                var cIndex = host.database.cards.getIndex(cardid);
                                var temp = host.database.cards.items[cIndex].activitiesList.filter(function(elt){
                                    return elt != fileData.id;
                                });
                                host.database.cards.items[cIndex].activitiesList = temp;
                                temp = host.database.cards.items[cIndex]["fileList"].filter(function(elt){
                                    return elt != fileData.id;
                                });
                                host.database.cards.items[cIndex]["fileList"] = temp;
                                dbcache.refresh("obj_list");
                                dbcache.refresh("objects");

                                resolve();
                            }
                            else {
                                ModalElement.alert({
                                    message: message
                                });
                                rj(message);
                            }
                        }
                        else {
                            ModalElement.alert({
                                message: message
                            });
                            rj(message);
                        }
                    }
                })
            });
        }
    });
};

carddone.cards.addFileNewSave = function(host, cardid, allFiles){
    return new Promise(function(resolve, reject){
        var files = [], images = [];
        for (var i = 0; i < allFiles.length; i++){
            if (typeof allFiles[i] === "string"){
                images.push(allFiles[i]);
            }
            else {
                files.push(allFiles[i]);
            }
        }
        var allFilesReadAsync = files.map(function (file) {
            return FormClass.readFileAsync(file);
        });
        Promise.all(allFilesReadAsync).then(function (files) {
            return files.map(function (file, i) {// chuyển dữ liệu có thể upload bằng api calll được
                var res = {
                    filename: file.name,
                    content: file.content,
                    type: "file",
                    name: "fileSlot" + i
                };
                return res;
            });
        }).then(function (filesToUpload) {
            ModalElement.show_loading();
            FormClass.api_call({
                url: "cards_save_new_file.php",
                params: [
                    {
                        name: "cardid",
                        value: cardid
                    },
                    {
                        name: "n",
                        value: filesToUpload.length
                    },
                    {
                        name: "images",
                        value: EncodingClass.string.fromVariable(images)
                    }
                ],
                fileuploads: filesToUpload,
                func: function (success, message) {
                    ModalElement.close(-1);
                    if (success) {
                        if (message.substr(0, 2) == "ok") {
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            var objects = st.objects;
                            var listFile = [], dataFile, userIndex;
                            for (var i = 0; i < objects.length; i++){
                                dataFile = {
                                    id: objects[i].id,
                                    filename: objects[i].filename,
                                    title: objects[i].filename,
                                    userid: systemconfig.userid,
                                    time: new Date(),
                                    type: "card",
                                    content_type: objects[i].content_type
                                };
                                listFile.push(dataFile);
                                var k = false;
                                for (var j = 0; j < host.allFiles.length; j++){
                                    if (contentModule.compareDate(host.allFiles[j].time, new Date())){
                                        host.allFiles[j].listFile.push(dataFile);
                                        k = true;
                                        break;
                                    }
                                }
                                if (!k){
                                    host.allFiles.push({
                                        index: host.allFiles.length,
                                        time: dataFile.time,
                                        listFile: [dataFile]
                                    });
                                }
                                if (objects[i].content_type == "img"){
                                    userIndex = data_module.users.getByhomeid(systemconfig.userid);
                                    dataFile.avatar = data_module.users.items[userIndex].avatarSrc;
                                    dataFile.userName = data_module.users.items[userIndex].fullname;
                                    dataFile.date = new Date();
                                    dataFile.src = window.domain + "./uploads/images/" + objects[i].id + "_" + objects[i].filename + ".upload";
                                    dataFile.note = objects[i].filename;
                                    host.imagesList.unshift(dataFile);
                                }
                            }
                            host.database.objects.items = host.database.objects.items.concat(objects);
                            host.database.obj_list.items = host.database.obj_list.items.concat(st.obj_lists);
                            st.values.forEach(function(elt){
                                var index = host.database.values.getIndex(elt.id);
                                if (index == -1) host.database.values.items.push(elt);
                                else host.database.values.items[index] = elt;
                            });
                            var cardIndex = host.database.cards.getIndex(cardid);
                            dbcache.refresh("obj_list");
                            dbcache.refresh("objects");
                            dbcache.refresh("values");
                            resolve(listFile);
                        }
                        else {
                            ModalElement.alert({message: message});
                        }
                    }
                    else {
                        ModalElement.alert({message: message});
                    }
                }.bind(this)
            });

        }.bind(this));
    });
};

carddone.cards.addFileForm = function(host, cardid, fileList, type){
    var cIndex = host.database.cards.getIndex(cardid);
    var privAdmin;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) privAdmin = true;
    else if (host.priv[3]) privAdmin = true;
    else if (host.priv[2]) privAdmin = false;
    else return;
    host.listFileToday = [];
    if (type == "new"){
        for (var i = 0; i < host.allFiles.length; i++){
            if (contentModule.compareDate(host.allFiles[i].time, new Date())){
                host.listFileToday = EncodingClass.string.duplicate(host.allFiles[i].listFile);
                break;
            }
        }
    }
    if (cardid == 0) return;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        }
    };
    var singlePage = host.funcs.cardAddFileForm({
        privAdmin: privAdmin,
        userid: systemconfig.userid,
        imagesList: host.imagesList,
        fileList: fileList,
        cmdButton: cmdButton,
        type: type,
        cardid: cardid,
        users: data_module.users,
        listFileToday: host.listFileToday,
        frameList: host.frameList,
        saveNewFunc: function(files){
            return new Promise(function(resolve, reject){
                carddone.cards.addFileNewSave(host, cardid, files).then(function(value){
                    resolve(value);
                });
            });
        },
        saveFunc: function(fileData, title){
            return new Promise(function(resolve, reject){
                carddone.cards.addFileSave(host, cardid, fileData, title).then(function(value){
                    resolve(value);
                });
            });
        },
        deleteFunc: function(fileData){
            return new Promise(function(resolve, reject){
                carddone.cards.deleteFile(host, cardid, fileData).then(function(value){
                    resolve(value);
                });
            });
        },
        editFileFunc: function(cardid, fileList){
            carddone.cards.addFileForm(host, cardid, fileList, "edit");
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.addFieldForm = function(host, cardid, id){
    if (cardid == 0) return;
    var index, valueIndex, singlePage;
    var cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, value.typeid, value, {name: 'field', list: 'fieldList'}, 0).then(function rs(value){
                    id = value.id;
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(resolve, reject){
                var value = singlePage.getValue();
                if (!value) {
                    reject(false);
                    return;
                }
                return carddone.cards.editActivitiesSave(host, cardid, id, value.typeid, value, {name: 'field', list: 'fieldList'}, 1).then(function rs(value){
                    host.frameList.removeLast();
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        },
        delete: function () {
            return new Promise(function(resolve, reject){
                return carddone.cards.deleteActivity(host, cardid, id, 'fieldList').then(function rs(value){
                    resolve(value);
                }, function rj(message){
                    reject(message);
                });
            });
        }
    };
    var fieldList = host.boardContent.fieldIdList.map(function(elt){
        var tIndex;
        tIndex = host.database.typelists.getIndex(elt);
        return {
            value: elt,
            text: host.database.typelists.items[tIndex].name
        }
    });
    var cIndex = host.database.cards.getIndex(cardid);
    var editMode;
    if (cIndex == -1) return;
    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
    else if (host.priv[3]) editMode = "edit";
    else if (host.priv[2]) editMode = "view";
    else return;
    singlePage = host.funcs.cardAddFieldForm({
        id: id,
        isMobile: host.isMobile,
        fieldList: fieldList,
        boardArchived: host.viewArchived ? 1 : 0,
        cardArchived: host.viewMode == "archived" ? 1 : 0,
        editMode: editMode,
        valueid: id > 0 ? host.database.objects.items[host.database.objects.getIndex(id)].valueid : 0,
        cardid: cardid,
        typelists: host.database.typelists,
        nations: host.database.nations,
        cities: host.database.cities,
        companies: host.database.companies,
        company_class: host.database.company_class,
        funcs: host.funcs,
        objects: host.database.objects,
        values: host.database.values,
        cmdButton: cmdButton,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: cardid > 0 ? host.database.cards.items[host.database.cards.getIndex(cardid)].name : "",
        username: systemconfig.username,
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editFieldFunc: function(cardid, id){
            carddone.cards.addFieldForm(host, cardid, id);
        }
    });
    var x = 2;
    if (host.isMobile) x = 3;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.prevEditCard = function(host, listId, id, editMode){
    return new Promise(function(rs){
        if (id == 0) {
            host.database.chat_sessions = {};
            host.database.chat_sessions.items = [];
            host.database.card_email_groups = data_module.makeDatabase([]);
            host.database.objects = data_module.makeDatabase([]);
            host.database.values = data_module.makeDatabase([]);
            host.database.obj_list = data_module.makeDatabase([]);
            carddone.cards.editCard(host, listId, id, editMode);
        }
        else {
            for (var i = 0; i < ModalElement.layerstatus.length; i++){
                if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
            }
            var index = host.database.cards.getIndex(id);
            var parentid = host.database.cards.items[index].parentid;
            var propmiseList = {};
            propmiseList.obj_list = data_module.loadByConditionAsync({
                name: "obj_list",
                cond: function(record){
                    return record.listid == id;
                },
                callback: function(retval){
                    host.database.obj_list = data_module.makeDatabase(retval);
                    var objectIdList = {};
                    retval.forEach(function(elt){
                        objectIdList[elt.objid] = 1;
                    });
                    return objectIdList;
                }
            });

            propmiseList.objects = propmiseList.obj_list.then(function(objectIdList){
                return data_module.loadByConditionAsync({
                    name: "objects",
                    cond: function(record){
                        return objectIdList[record.id] == 1;
                    },
                    callback: function(retval){
                        host.database.objects = data_module.makeDatabase(retval);
                        var dict = {};
                        retval.forEach(function(elt){
                            dict[elt.valueid] = 1;
                        });
                        return dict;
                    }
                });
            });

            propmiseList.values = propmiseList.objects.then(function(dict){
                return data_module.loadByConditionAsync({
                    name: "values",
                    cond: function(record){
                        return dict[record.id] == 1;
                    },
                    callback: function(retval){
                        var list = [];
                        retval.forEach(function(elt){
                            list = list.concat(data_module.parseValueId(elt.descendantid));
                        });
                        list.forEach(function(elt){
                            dict[elt] = 1;
                        });
                        dbcache.loadByCondition({
                            name: "values",
                            cond: function(record){
                                return dict[record.id] == 1;
                            },
                            callback: function(retval){
                                host.database.values = data_module.makeDatabase(retval);
                            }
                        })
                    }
                });
            });

            propmiseList.knowledge = data_module.loadByConditionAsync({
                name: "knowledge",
                cond: function(record){
                    return record.cardid == id;
                },
                callback: function(retval){
                    host.database.knowledge = data_module.makeDatabase(retval);
                    var dict = {};
                    retval.forEach(function(elt){
                        dict[elt.id] = 1;
                    });
                    return dict;
                }
            });

            propmiseList.knowledge_group_link = propmiseList.knowledge.then(function(dict){
                return data_module.loadByConditionAsync({
                    name: "objects",
                    cond: function(record){
                        return dict[record.knowledgeid] == 1;
                    },
                    callback: function(retval){
                        host.database.knowledge_group_link = data_module.makeDatabase(retval);
                        host.database.knowledge_group_link.items.sort(function(a, b){
                            if (a.id > b.id) return -1;
                            if (a.id < b.id) return 1;
                            return 0;
                        });
                    }
                });
            });

            propmiseList.chat_sessions = new Promise(function(rs){
                FormClass.api_call({
                    url: "database_load.php",
                    params: [
                        {name: "task", value: "card_load_session_chat"},
                        {name: "cardid", value: id}
                    ],
                    func: function(success, message){
                        if (success){
                            if (message.substr(0, 2) == "ok"){
                                var content = EncodingClass.string.toVariable(message.substr(2))
                                contentModule.makeDatabaseContent(host.database, content);
                                rs();
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
            propmiseList.card_email_groups = data_module.loadByConditionAsync({
                name: "card_email_groups",
                cond: function(record){
                    return record.cardid == id;
                },
                callback: function(retval){
                    host.database.card_email_groups = data_module.makeDatabase(retval);
                }
            });

            Promise.all([propmiseList.chat_sessions, propmiseList.knowledge_group_link, propmiseList.values, propmiseList.card_email_groups]).then(function(value){
                ModalElement.close(-1);
                var temp = ["activitiesList", "callList", "chatList", "check_listList", "fieldList", "fileList", "meetingList", "noteList", "taskList", "waitList", "sendmailList"];
                for (var i = 0; i < temp.length; i++){
                    host.database.cards.items[index][temp[i]] = [];
                }
                contentModule.makeChatData(host);
                contentModule.makeCardActivitiesData(host);
                contentModule.makeAvatarUser(host);
                contentModule.makeChatCardIndex(host);
                carddone.cards.editCard(host, parentid, id, editMode);
                rs();
            });
        }
    });
};

carddone.cards.sendMailActivity = function(host, id, activityList, innerHTMLElt){
    return new Promise(function(resolve, reject){
        var message = "<html><head>";
        message += "</head><body>";
        message += innerHTMLElt;
        message += "</body><html>";
        var listFile = [], filesNew = [], blobFilesNew = [], newfileLocation = [];
        for (var i = 0; i < activityList.length; i++){
            if (activityList[i].type_activity == "file"){
                for (var j = 0; j < activityList[i].details.length; j++){
                    if (activityList[i].details[j].content_type == "file"){
                        if (activityList[i].details[j].id > 0){
                            listFile.push({
                                url: "uploads/files/" + activityList[i].details[j].id + "_" + activityList[i].details[j].filename + ".upload",
                                filename: activityList[i].details[j].filename
                            });
                        }
                        else {
                            filesNew.push(activityList[i].details[j].file_content);
                            blobFilesNew.push(activityList[i].details[j].file_blob_url);
                            newfileLocation.push({
                                i: i,
                                j: j
                            });
                        }
                    }
                    else {
                        if (activityList[i].details[j].id > 0){
                            listFile.push({
                                url: "uploads/images/" + activityList[i].details[j].id + "_" + activityList[i].details[j].filename + ".upload",
                                filename: activityList[i].details[j].filename
                            });
                        }
                        else {
                            filesNew.push(activityList[i].details[j].file_content);
                            blobFilesNew.push(activityList[i].details[j].file_blob_url);
                            newfileLocation.push({
                                i: i,
                                j: j
                            });
                        }
                    }
                }
            }
        }
        var addressList = host.users_sendmail_select.valuesList;
        var bccList = host.bcc_sendmail_input.valuesList;
        var ccList = host.cc_sendmail_input.valuesList;
        var dataSave = {
            value: [
                {localid: 'type_sendmail_content', valueid: 0, typeid: -27, privtype: "html", value: host.editorSendMail.getData()},
                {localid: 'type_sendmail_to', valueid: 0, typeid: -28, privtype: "email_list", value: addressList},
                {localid: 'type_sendmail_cc', valueid: 0, typeid: -28, privtype: "email_list", value: ccList},
                {localid: 'type_sendmail_bcc', valueid: 0, typeid: -28, privtype: "email_list", value: bccList},
                {localid: 'type_sendmail_subject', valueid: 0, typeid: -1, privtype: "string", value: host.subject_sendmail_input.value.trim()},
                {localid: 'type_sendmail_activity_list', valueid: 0, typeid: -29, privtype: "activity_list", value: activityList}
            ],
            typeid: -30,
            parentid: 0,
            name: "",
            type: "sendmail",
            available: 1,
            privtype: "structure",
            ver: 1,
            valueid: 0,
            userid: systemconfig.userid,
            createdtime: new Date(),
            lastmodifiedtime: new Date()
        };
        var allFilesReadAsync = filesNew.map(function (file) {
            return FormClass.readFileAsync(file);
        });
        ModalElement.show_loading();
        Promise.all(allFilesReadAsync).then(function (files) {
            return files.map(function (file, i) {// chuyển dữ liệu có thể upload bằng api calll được
                var res = {
                    filename: file.name,
                    content: file.content
                };
                if (file.type.startsWith('image/')) {
                    res.type = "img";
                    res.name = "imageSlot" + i;
                }
                else {
                    res.type = "file";
                    res.name = "fileSlot" + i;
                }
                return res;
            });
        }).then(function (filesToUpload) {
            FormClass.api_call({
                url: "card_send_mail_activity.php",
                params: [
                    {name: "message", value: EncodingClass.string.fromVariable(message)},
                    {name: "cardid", value: id},
                    {name: "addressList", value: EncodingClass.string.fromVariable(addressList)},
                    {name: "subject", value: host.subject_sendmail_input.value.trim()},
                    {name: "bcc", value: EncodingClass.string.fromVariable(bccList)},
                    {name: "cc", value: EncodingClass.string.fromVariable(ccList)},
                    {name: "listFile", value: EncodingClass.string.fromVariable(listFile)},
                    {name: "dataSave", value: EncodingClass.string.fromVariable(dataSave)},
                    {name: "blobFilesNew", value: EncodingClass.string.fromVariable(blobFilesNew)},
                    {name: "newfileLocation", value: EncodingClass.string.fromVariable(newfileLocation)},
                    {name: "domain", value: window.domain}
                ],
                fileuploads: filesToUpload,
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            host.database.objects.items = host.database.objects.items.concat(st.objects);
                            host.database.obj_list.items = host.database.obj_list.items.concat(st.obj_lists);
                            st.values.forEach(function(elt){
                                var index = host.database.values.getIndex(elt.id);
                                if (index == -1) host.database.values.items.push(elt);
                                else host.database.values.items[index] = elt;
                            });
                            var cardIndex = host.database.cards.getIndex(id);
                            dbcache.refresh("obj_list");
                            dbcache.refresh("objects");
                            dbcache.refresh("values");
                            console.log(st);
                            resolve(st.objects);
                            host.frameList.removeLast();
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
    });
};

carddone.cards.preSendMail = function(host, id, activityList){
    return new Promise(function(resolve, reject){
        var previewElt = carddone.cards.prepareDataSend(host, id, activityList);
        if (!previewElt) return false;
        var c = DOMElement.div({
            attrs: {
                style: {display: "none"}
            },
            children: [previewElt]
        });
        document.body.appendChild(c);
        var x = previewElt.innerHTML;
        carddone.cards.sendMailActivity(host, id, activityList, x).then(function(value){
            resolve(value);
        });
        c.remove();
    });
};

carddone.cards.prepareDataSend = function(host, id, activityList){
    var addressList = host.users_sendmail_select.valuesList;
    if (addressList.length == 0){
        ModalElement.alert({
            message: LanguageModule.text("txt_no_email_to")
        });
        return false;
    }
    for (var i = 0; i < addressList.length; i++){
        if (!contentModule.filterEmail.test(addressList[i])) {
            ModalElement.alert({
                message: LanguageModule.text("war_txt_email_invalid")
            });
            return false;
        }
    }
    var ccList = host.cc_sendmail_input.valuesList;
    for (var i = 0; i < ccList.length; i++){
        if (!contentModule.filterEmail.test(ccList[i])) {
            ModalElement.alert({
                message: LanguageModule.text("war_txt_email_invalid")
            });
            return false;
        }
    }
    var bccList = host.bcc_sendmail_input.valuesList;
    for (var i = 0; i < bccList.length; i++){
        if (!contentModule.filterEmail.test(bccList[i])) {
            ModalElement.alert({
                message: LanguageModule.text("war_txt_email_invalid")
            });
            return false;
        }
    }
    // if (activityList.length == 0) {
    //     ModalElement.alert({message: LanguageModule.text("war_txt_no_activity_list")});
    //     return false;
    // }
    var index = host.database.cards.getIndex(id);
    var listIndex = host.database.lists.getIndex(host.database.cards.items[index].parentid);
    if (listIndex < 0) {
        ModalElement.alert({message: "failed_listid"});
        return;
    }
    var companyData = [];
    var cIndex, cName, company_classIndex;
    for (var i = 0; i < host.database.cards.items[index].companyList.length; i++){
        cIndex = host.database.companies.getIndex(host.database.cards.items[index].companyList[i]);
        if (cIndex < 0) continue;
        cName = host.database.companies.items[cIndex].name;
        if (host.database.companies.items[cIndex].company_classid > 0){
            company_classIndex = host.database.company_class.getIndex(host.database.companies.items[cIndex].company_classid);
            if (company_classIndex < 0) continue;
            cName += " - " + host.database.company_class.items[company_classIndex].name;
        }
        companyData.push(cName);
    }
    var contactData = [];
    for (var i = 0; i < host.database.cards.items[index].contactList.length; i++){
        cIndex = host.database.contact.getIndex(host.database.cards.items[index].contactList[i]);
        if (cIndex < 0) continue;
        cName = host.database.contact.items[cIndex].firstname + " " + host.database.contact.items[cIndex].lastname;
        if (host.database.contact.items[cIndex].phone.length > 0){
            cName += " - " + host.database.contact.items[cIndex].phone;
        }
        if (host.database.contact.items[cIndex].email.length > 0){
            cName += " - " + host.database.contact.items[cIndex].email;
        }
        contactData.push(cName);
    }
    var modal, res;
    var previewElt = host.funcs.getContentPreviewMailActivity({
        cardName: host.database.cards.items[index].name,
        boardName: host.boardContent.name,
        favorite: host.database.cards.items[index].favorite,
        listName: host.database.lists.items[listIndex].name,
        companyData: companyData,
        contactData: contactData,
        activityList: activityList,
        content_mail: host.editorSendMail.getData(),
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
            funcs: host.funcs,
            listValueId: []
        })
    });
    return previewElt;
};

carddone.cards.previewMail = function(host, id, activityList){
    var previewElt = carddone.cards.prepareDataSend(host, id, activityList);
    if (!previewElt) return;
    var cmdbutton = {
        send: function(){
            return carddone.cards.sendMailActivity(host, id, activityList, previewElt.innerHTML);
        }
    };
    host.funcs.previewMailActivity({
        cmdbutton: cmdbutton,
        previewElt: previewElt,
        cardid: id,
        funcs: host.funcs,
        objects: host.database.objects,
        values: host.database.values,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: id > 0 ? host.database.cards.items[host.database.cards.getIndex(id)].name : "",
        username: systemconfig.username,
        ccList: host.cc_sendmail_input.valuesList,
        bccList: host.bcc_sendmail_input.valuesList,
        toList: host.users_sendmail_select.valuesList,
        imagesList: host.imagesList,
        fileList: [],
        listFileToday: host.listFileToday,
        frameList: host.frameList,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editMailFunc: function(cardid, id){
            carddone.cards.viewMailFunc(host, cardid, id);
        }
    });
};

carddone.cards.viewMailFunc = function(host, cardid, id){
    var oIndex = host.database.objects.getIndex(id);
    var vIndex = host.database.values.getIndex(host.database.objects.items[oIndex].valueid);
    var content_mail, activityList, cc, bcc, subject, to;
    var content = EncodingClass.string.toVariable(host.database.values.items[vIndex].content);
    for (var i = 0; i < content.length; i++){
        vIndex = host.database.values.getIndex(content[i].valueid);
        switch (content[i].localid) {
            case "type_sendmail_content":
                content_mail = host.database.values.items[vIndex].content;
                break;
            case "type_sendmail_to":
                to = EncodingClass.string.toVariable(host.database.values.items[vIndex].content);
                break;
            case "type_sendmail_cc":
                cc = EncodingClass.string.toVariable(host.database.values.items[vIndex].content);
                break;
            case "type_sendmail_bcc":
                bcc = EncodingClass.string.toVariable(host.database.values.items[vIndex].content);
                break;
            case "type_sendmail_subject":
                subject = host.database.values.items[vIndex].content;
                break;
            case "type_sendmail_activity_list":
                activityList = EncodingClass.string.toVariable(host.database.values.items[vIndex].content);
                break;
        }
    }
    var index = host.database.cards.getIndex(cardid);
    var listIndex = host.database.lists.getIndex(host.database.cards.items[index].parentid);
    if (listIndex < 0) {
        ModalElement.alert({message: "failed_listid"});
        return;
    }
    var companyData = [];
    var cIndex, cName, company_classIndex;
    for (var i = 0; i < host.database.cards.items[index].companyList.length; i++){
        cIndex = host.database.companies.getIndex(host.database.cards.items[index].companyList[i]);
        if (cIndex < 0) continue;
        cName = host.database.companies.items[cIndex].name;
        if (host.database.companies.items[cIndex].company_classid > 0){
            company_classIndex = host.database.company_class.getIndex(host.database.companies.items[cIndex].company_classid);
            if (company_classIndex < 0) continue;
            cName += " - " + host.database.company_class.items[company_classIndex].name;
        }
        companyData.push(cName);
    }
    var contactData = [];
    for (var i = 0; i < host.database.cards.items[index].contactList.length; i++){
        cIndex = host.database.contact.getIndex(host.database.cards.items[index].contactList[i]);
        if (cIndex < 0) continue;
        cName = host.database.contact.items[cIndex].firstname + " " + host.database.contact.items[cIndex].lastname;
        if (host.database.contact.items[cIndex].phone.length > 0){
            cName += " - " + host.database.contact.items[cIndex].phone;
        }
        if (host.database.contact.items[cIndex].email.length > 0){
            cName += " - " + host.database.contact.items[cIndex].email;
        }
        contactData.push(cName);
    }
    var modal, res;
    var previewElt = host.funcs.getContentPreviewMailActivity({
        cardName: host.database.cards.items[index].name,
        boardName: host.boardContent.name,
        favorite: host.database.cards.items[index].favorite,
        listName: host.database.lists.items[listIndex].name,
        companyData: companyData,
        contactData: contactData,
        activityList: activityList,
        content_mail: content_mail,
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
            funcs: host.funcs,
            listValueId: []
        })
    });
    var userItems = [], userItemsCc = [];
    for (var i = 0; i < data_module.users.items.length; i++){
        if (data_module.users.items[i].available == 0) continue;
        userItems.push({value: data_module.users.items[i].email, text: data_module.users.items[i].username + " - " + data_module.users.items[i].email});
        userItemsCc.push({value: data_module.users.items[i].email, text: data_module.users.items[i].email});
    }
    var singlePage = host.funcs.viewSendMailFunc({
        cmdbutton: {
            close: function(){
                host.frameList.removeLast();
            }
        },
        subject: subject,
        cc: cc,
        bcc: bcc,
        to: to,
        previewElt: previewElt,
        userItems: userItems,
        userItemsCc: userItemsCc
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.sendMailFunc = function(host, id){
    var getContentByValueId = function(valueid){
        var vIndex = host.database.values.getIndex(valueid);
        if (vIndex < 0) return "";
        return host.database.values.items[vIndex].content;
    };
    var index = host.database.cards.getIndex(id);
    var userItemsCc = [];
    for (var i = 0; i < data_module.users.items.length; i++){
        if (data_module.users.items[i].available == 0) continue;
        userItemsCc.push({value: data_module.users.items[i].email, text: data_module.users.items[i].email + " - " + data_module.users.items[i].fullname, name: data_module.users.items[i].fullname});
    }
    var groupEmailIndex, uIndex, email, emailList = [];
    for (var i = 0; i < host.database.card_email_groups.items.length; i++){
        groupEmailIndex = host.database.board_email_groups.getIndex(host.database.card_email_groups.items[i].groupid);
        if (groupEmailIndex < 0) continue;
        for (var j = 0; j < host.database.board_email_groups.items[groupEmailIndex].userList.length; j++){
            uIndex = data_module.users.getByhomeid(host.database.board_email_groups.items[groupEmailIndex].userList[j]);
            if (uIndex < 0) continue;
            email = data_module.users.items[uIndex].email;
            if (emailList.indexOf(email) < 0){
                emailList.push(email);
            }
        }
    }
    host.users_sendmail_select = absol.buildDom({
        tag: "selectmailinput",
        props: {
            items: userItemsCc,
            valuesList: emailList
        }
    });
    host.email_group_select = DOMElement.a({
        attrs: {
            style: {
                color: "var(--a-color)",
                cursor: "pointer",
                verticalAlign: " middle",
                lineHeight: "30px",
                userSelect: "none",
                display: (host.database.card_email_groups.items.length > 0)? "" : "none"
            }
        },
        text: LanguageModule.text("txt_choose_email_group")
    });
    var quickMenuItems = [];
    var copyEmailTo = function(groupid){
        var index = host.database.board_email_groups.getIndex(groupid);
        if (index < 0) {
            console.log(groupid);
            return;
        }
        var uIndex, email, emailList;
        emailList = host.users_sendmail_select.valuesList;
        for (var i = 0; i < host.database.board_email_groups.items[index].userList.length; i++){
            uIndex = data_module.users.getByhomeid(host.database.board_email_groups.items[index].userList[i]);
            if (uIndex < 0) continue;
            email = data_module.users.items[uIndex].email;
            if (emailList.indexOf(email) < 0){
                emailList.push(email);
            }
        }
        host.users_sendmail_select.valuesList = emailList;
    };
    for (var i = 0; i < host.database.card_email_groups.items.length; i++){
        groupEmailIndex = host.database.board_email_groups.getIndex(host.database.card_email_groups.items[i].groupid);
        if (groupEmailIndex < 0) continue;
        quickMenuItems.push({
            text: host.database.board_email_groups.items[groupEmailIndex].name,
            extendClasses: "bsc-quickmenu",
            cmd: function(groupid){
                return function(event, me) {
                    copyEmailTo(groupid);
                }
            } (host.database.card_email_groups.items[i].groupid)
        });
    }
    absol.QuickMenu.showWhenClick(host.email_group_select, {items: quickMenuItems}, [9, 3, 4], function (menuItem) {
        if (menuItem.cmd) menuItem.cmd();
    });
    var activityListChoose = [];
    var cmdbutton = {
        close: function () {
            host.frameList.removeLast();
        },
        preview: function () {
            carddone.cards.previewMail(host, id, activityListChoose);
        },
        send: function(){
            return carddone.cards.preSendMail(host, id, activityListChoose);
        }
    };
    host.subject_sendmail_input = theme.input({
        style: {
            width: "100%"
        },
        value: id + "_" +host.database.cards.items[index].name
    });
    host.cc_sendmail_input = absol.buildDom({
        tag: "selectmailinput",
        props: {
            items: userItemsCc
        }
    });
    var userIndex = data_module.users.getByhomeid(systemconfig.userid);
    host.bcc_sendmail_input = absol.buildDom({
        tag: "selectmailinput",
        props: {
            items: userItemsCc,
            valuesList: [data_module.users.items[userIndex].email]
        }
    });
    var textId = ("text_" + Math.random() + Math.random()).replace(/\./g, '');
    host.content_sendmail_input  = absol.buildDom({
        tag: 'div',
        class: "container-bot",
        props: {
            id: textId
        }
    });
    var drawActivity = function(){
        DOMElement.removeAllChildren(activity_container);
        var aDate, activityItemElt;
        var attrsText = {
            style: {
                minHeight: "30px",
                lineHeight: "30px"
            }
        };
        var attrsTitle = {style: {fontWeight: "bold", minHeight: "30px", lineHeight: "30px"}};
        var attrsTHfirst = {
            style: {
                fontWeight: "bold",
                height: "40px",
                lineHeight: "40px",
                textAlign: " center",
                backgroundColor: "#ebebeb",
                border: "1px solid #ddd"
            }
        };
        var attrsTH = {
            style: {
                fontWeight: "bold",
                height: "40px",
                lineHeight: "40px",
                textAlign: " center",
                backgroundColor: "#ebebeb",
                borderRight: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                borderBottom: "1px solid #ddd"
            }
        };
        var attrsTDfirst = {
            style: {
                height: "40px",
                lineHeight: "40px",
                padding: "5px",
                border: "1px solid #ddd"
            }
        };
        var attrsTD = {
            style: {
                height: "40px",
                lineHeight: "40px",
                padding: "5px",
                borderRight: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                borderBottom: "1px solid #ddd"
            }
        };

        var lastDate = 0;
        var blockList = [];
        activityListChoose.forEach(function(item){
            aDate = parseInt((item.timeSort.getTime()) / 86400000, 10);
            if (aDate != lastDate){
                blockList.push({
                    timeSort: item.timeSort,
                    data: []
                });
            }
            blockList[blockList.length - 1].data.push(item);
            lastDate = aDate;
        });
        console.log(blockList);
        blockList.forEach(function (elt) {
            var timeElt = DOMElement.div({
                attrs: {
                    style: {
                        marginTop: "10px",
                        marginBottom: "10px",
                        height: "30px",
                        lineHeight: "30px",
                        backgroundColor: "#e4e1f5",
                        textAlign: "center",
                        border: "1px solid #d6d6d6"
                    }
                },
                text: contentModule.formatTimeDisplay(elt.timeSort)
            });
            activity_container.appendChild(timeElt);
            elt.data.forEach(function(item, _unused, data){
                function remove(){
                    var indexInData = data.indexOf(item);
                    data.splice(indexInData, 1);
                    res.remove();
                    if (data.length == 0) timeElt.remove();
                    indexInData = activityListChoose.indexOf(item);
                    activityListChoose.splice(indexInData, 1);
                };
                function drawTask(item){
                    var participantName = "";
                    item.participant.forEach(function (x, index) {
                        if (index > 0) participantName += ", ";
                        participantName += contentModule.getUsernameFullnameByhomeid(data_module.users, x);
                    });
                    activityItemElt = [
                        DOMElement.div({
                            attrs: attrsTitle,
                            children: [DOMElement.span({text: LanguageModule.text("txt_task")})]
                        }),
                        DOMElement.div({
                            attrs: {
                                style: {
                                    paddingLeft: "30px"
                                }
                            },
                            children: [
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_work") + ": " + item.work
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_due_date") + ": " + contentModule.formatTimeMinuteDisplay(item.due_date)
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_assigned_to") + ": " + contentModule.getUsernameFullnameByhomeid(data_module.users, item.assigned_to)
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_participant") + ": " + participantName
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_complete") + ": " + getStatusName(item.status)
                                }),
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            minHeight: "30px"
                                        }
                                    },
                                    text: LanguageModule.text("txt_result") + ": " + item.result
                                })
                            ]
                        })
                    ];
                };
                function drawCall(item){
                    activityItemElt = [
                        DOMElement.div({
                            attrs: attrsTitle,
                            text: LanguageModule.text("txt_call")
                        }),
                        DOMElement.div({
                            attrs: {style: {paddingLeft: "30px"}},
                            children: [
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_call_to") + ": " + item.call_to
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_work") + ": " + item.work
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_due_date") + ": " + contentModule.formatTimeMinuteDisplay(item.due_date)
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_assigned_to") + ": " + contentModule.getUsernameFullnameByhomeid(data_module.users, item.assigned_to)
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_complete") + ": " + getStatusName(item.status)
                                }),
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            minHeight: "30px"
                                        }
                                    },
                                    text: LanguageModule.text("txt_result") + ": " + item.result
                                })
                            ]
                        })
                    ];
                };
                function drawMeeting(item){
                    var participantName = "";
                    item.participant.forEach(function (x, index) {
                        if (index > 0) participantName += ", ";
                        participantName += contentModule.getUsernameFullnameByhomeid(data_module.users, x);
                    });
                    activityItemElt = [
                        DOMElement.div({
                            attrs: attrsTitle,
                            text: LanguageModule.text("txt_meeting")
                        }),
                        DOMElement.div({
                            attrs: {style: {paddingLeft: "30px"}},
                            children: [
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_meeting_name") + ": " + item.name
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_location") + ": " + item.location
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_type") + ": " + item.type
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_start_date") + ": " + contentModule.formatTimeMinuteDisplay(item.timestart)
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_assigned_to") + ": " + contentModule.getUsernameFullnameByhomeid(data_module.users, item.assigned_to)
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_complete") + ": " + getStatusName(item.status)
                                }),
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            minHeight: "30px"
                                        }
                                    },
                                    text: LanguageModule.text("txt_result") + ": " + item.result
                                })
                            ]
                        })
                    ];
                };
                function drawField(item){
                    activityItemElt = [];
                    item.details.forEach(function (x, index) {
                        activityItemElt.push(DOMElement.div({
                            attrs: attrsTitle,
                            text: LanguageModule.text("txt_field") + ": " + x.name
                        }));
                        host.listValueId = [];
                        activityItemElt.push(DOMElement.div({
                            attrs: {
                                style: {paddingLeft: "30px"}
                            },
                            children: [contentModule.getObjectbyTypeView(host, x.typeid, x.valueid)]
                        }));
                    });
                };
                function drawChat(item){
                    var createMessage = function (data) {
                        var styleText, styleImg;
                        if (data.type == "me") {
                            styleText = {
                                border: "1px solid #ddd",
                                padding: "10px",
                                marginRight: "5px",
                                marginTop: "2px",
                                maxWidth: "70%",
                                borderTopLeftRadius: "12px",
                                borderBottomLeftRadius: "12px",
                                display: "inline-block",
                                backgroundColor: "#DBF4FD",
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                textAlign: "left",
                                verticalAlign: "middle"
                            };
                            styleImg = {
                                border: "1px solid #ddd",
                                marginRight: "5px",
                                padding: "1px",
                                marginTop: "2px",
                                maxWidth: "50%",
                                borderTopLeftRadius: "12px",
                                borderBottomLeftRadius: "12px",
                                display: "inline-block",
                                backgroundColor: "#DBF4FD",
                                verticalAlign: "middle"
                            };
                        } else {
                            styleText = {
                                padding: "10px",
                                marginTop: "1px",
                                marginleft: "5px",
                                border: "1px solid #ddd",
                                borderTopRightRadius: "12px",
                                borderBottomRightRadius: "12px",
                                display: "inline-block",
                                backgroundColor: "rgb(241, 240, 240)",
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                verticalAlign: "middle"
                            };
                            styleImg = {
                                maxWidth: "50%",
                                marginTop: "2px",
                                padding: "1px",
                                marginLeft: "5px",
                                border: "1px solid #ddd",
                                borderTopRightRadius: "12px",
                                borderBottomRightRadius: "12px",
                                display: "inline-block",
                                backgroundColor: "rgb(241, 240, 240)",
                                verticalAlign: "middle"
                            };
                        }
                        var styleMessLine = {
                            display: "block",
                            whiteSpace: "nowrap"
                        };
                        var styleLineSeen = {
                            margin: "10px",
                            color: "red",
                            textAlign: "center"
                        };
                        var res, messelt;
                        switch (data.content_type) {
                            case "text":
                                var texts;
                                var aobjs = absol.parseMessage(data.content);// trả về một array theo cú pháp absol
                                // thêm vài thuộc tính cho thẻ a
                                aobjs.forEach(function (aobj) {
                                    if (aobj.tag == 'a') {
                                        aobj.attr = aobj.attr || {};
                                        aobj.attr.target = '_blank';// mở tab mới
                                        aobj.style = aobj.style || {};
                                        aobj.style.cursor = "pointer";
                                        aobj.style.textDecoration = "underline";
                                    }
                                });

                                texts = aobjs.map(function (aobj) {
                                    return absol._(aobj);// chuyển qua dom object cho giống code cũ
                                });


                                res = DOMElement.div({
                                    attrs: {
                                        styleMessLine: styleMessLine
                                    }
                                });
                                messelt = DOMElement.div({
                                    attrs: {
                                        style: styleText
                                    },
                                    children: texts
                                });
                                res.appendChild(messelt);
                                break;
                            case "img":
                                var srcimg = window.domain + "./uploads/images/" + data.localid + "_" + data.content + ".upload";
                                messelt = DOMElement.div({
                                    attrs: {
                                        style: styleImg
                                    },
                                    children: [DOMElement.img({
                                        attrs: {
                                            style: {
                                                maxHeight: "100%",
                                                maxWidth: "100%"
                                            },
                                            src: srcimg,
                                            download: data.content
                                        }
                                    })]
                                });
                                res = DOMElement.div({
                                    attrs: {
                                        styleMessLine: styleMessLine
                                    }
                                });
                                res.appendChild(messelt);
                                break;
                            case "file":
                                messelt = DOMElement.div({
                                    attrs: {
                                        style: styleText
                                    },
                                    children: [
                                        DOMElement.a({
                                            attrs: {
                                                href: window.domain + "./uploads/files/" + data.localid + "_" + data.content + ".upload",
                                                download: data.content,
                                                style: {
                                                    color: "black",
                                                    cursor: "pointer"
                                                }
                                            },
                                            text: data.content
                                        })
                                    ]
                                });
                                res = DOMElement.div({
                                    attrs: {
                                        styleMessLine: styleMessLine
                                    }
                                });
                                res.appendChild(messelt);
                                break;
                            case "add_member":
                                var listMemberText = "";
                                var userIndex;
                                for (var i = 0; i < data.content.length; i++) {
                                    userIndex = data_module.users.getByhomeid(data.content[i]);
                                    if (i > 0) listMemberText += ", ";
                                    listMemberText += data_module.users[userIndex].fullname;
                                }
                                res = absol.buildDom({
                                    style: styleLineSeen,
                                    child: [absol.buildDom({
                                        tag: "unreadmessageline",
                                        props: {
                                            text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã thêm " + listMemberText
                                        }
                                    })]
                                });
                                break;
                            case "create":
                                res = absol.buildDom({
                                    style: styleLineSeen,
                                    child: [absol.buildDom({
                                        tag: "unreadmessageline",
                                        props: {
                                            text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tạo nhóm."
                                        }
                                    })]
                                });
                                break;
                            case "join":
                                res = absol.buildDom({
                                    style: styleLineSeen,
                                    child: [absol.buildDom({
                                        tag: "unreadmessageline",
                                        props: {
                                            text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tham gia nhóm."
                                        }
                                    })]
                                });
                                break;
                            default:
                                res = DOMElement.div({});
                                break;
                        }
                        return res;
                    };
                    var lastUserChatid = 0, lastVMessageGroup;
                    var addMessage = function (content) {
                        if (content.content_type != "file" && content.content_type != "img" && content.content_type != "text") {
                            var singleMessage = createMessage(content);
                            vBoxMessage.appendChild(singleMessage);
                            lastUserChatid = 0;
                        } else {
                            if (lastUserChatid !== content.userid) {
                                if (content.type == "me") {
                                    lastVMessageGroup = DOMElement.div({
                                        attrs: {
                                            style: {
                                                textAlign: "right",
                                                paddingTop: "10px",
                                                paddingBottom: "10px"
                                            }
                                        },
                                        children: [
                                            DOMElement.div({
                                                attrs: {
                                                    style: {
                                                        fontSize: "12px",
                                                        paddingRight: "5px"
                                                    }
                                                },
                                                text: contentModule.getTimeMessage(content.m_time)
                                            })
                                        ]
                                    });
                                    vBoxMessage.appendChild(lastVMessageGroup);
                                } else {
                                    var srcImgAvatar = window.domain + content.avatarSrc;
                                    lastVMessageGroup = DOMElement.div({
                                        attrs: {
                                            style: {
                                                textAlign: "left"
                                            }
                                        },
                                        children: [
                                            DOMElement.div({
                                                attrs: {
                                                    style: {
                                                        fontSize: "12px",
                                                        paddingLeft: "5px"
                                                    }
                                                },
                                                text: content.fullname + ", " + contentModule.getTimeMessage(content.m_time)
                                            })
                                        ]
                                    });
                                    vBoxMessage.appendChild(DOMElement.div({
                                        attrs: {
                                            style: {
                                                maxWidth: "70%",
                                                paddingTop: "10px",
                                                whiteSpace: "nowrap",
                                                paddingBottom: "10px"
                                            }
                                        },
                                        children: [
                                            DOMElement.div({
                                                attrs: {
                                                    style: {
                                                        marginLeft: "10px",
                                                        display: "inline-block",
                                                        verticalAlign: "top"
                                                    }
                                                },
                                                children: [
                                                    DOMElement.div({
                                                        attrs: {
                                                            style: {
                                                                backgroundImage: "url(" + srcImgAvatar + ")",
                                                                borderRadius: "50%",
                                                                backgroundSize: "cover",
                                                                cursor: "pointer",
                                                                width: "30px",
                                                                height: "30px"
                                                            }
                                                        }
                                                    })
                                                ]
                                            }),
                                            DOMElement.div({
                                                attrs: {
                                                    style: {
                                                        display: "inline-block"
                                                    }
                                                },
                                                children: [lastVMessageGroup]
                                            })
                                        ]
                                    }));
                                }
                                lastUserChatid = content.userid;
                            }
                            var singleMessage = createMessage(content);
                            lastVMessageGroup.appendChild(singleMessage);
                        }
                    };
                    activityItemElt.push(DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_chat")
                    }));
                    var vBoxMessage = DOMElement.div({});
                    activityItemElt.push(vBoxMessage);
                    item.details.forEach(function (x) {
                        addMessage(x);
                    });
                };
                function drawFile(item){
                    activityItemElt = [
                        DOMElement.div({
                            attrs: attrsTitle,
                            text: LanguageModule.text("txt_file")
                        })
                    ];
                    item.details.forEach(function (x, index, details) {
                        function removeDetail(){
                            var indexInDetails = details.indexOf(x);
                            details.splice(indexInDetails, 1);
                            fileElt.remove();
                            if (details.length == 0) remove();
                        }
                        if (x.content_type == "file") {
                            var fileElt = DOMElement.div({
                                attrs: {
                                    style: {
                                        marginLeft: "30px",
                                        marginTop: "10px",
                                        marginBottom: "10px",
                                        border: "1px solid #d6d6d6",
                                        padding: "5px",
                                        position: "relative"
                                    }
                                },
                                children: [
                                    DOMElement.div({
                                        attrs: {
                                            style: {
                                                position: "absolute",
                                                top: "5px",
                                                right: "5px"
                                            }
                                        },
                                        children: [
                                            DOMElement.i({
                                                attrs: {
                                                    className: "material-icons card-icon-remove",
                                                    style: {
                                                        fontSize: "14px"
                                                    },
                                                    onclick: function(){
                                                        removeDetail();
                                                    }
                                                },
                                                text: "clear"
                                            })
                                        ]
                                    }),
                                    DOMElement.div({
                                        children: [DOMElement.a({
                                            attrs: {
                                                href: (x.id > 0)? window.domain + "/uploads/files/" + x.id + "_" + x.filename + ".upload" : x.file_blob_url,
                                                download: x.filename,
                                                style: {
                                                    color: "#1464f6"
                                                }
                                            },
                                            text: x.filename
                                        })
                                    ]
                                })]
                            });
                            activityItemElt.push(fileElt);
                        }
                        else {
                            var fileElt = DOMElement.div({
                                attrs: {
                                    style: {
                                        marginLeft: "30px",
                                        marginTop: "10px",
                                        marginBottom: "10px",
                                        border: "1px solid #d6d6d6",
                                        padding: "5px",
                                        position: "relative"
                                    }
                                },
                                children: [
                                    DOMElement.div({
                                        attrs: {
                                            style: {
                                                position: "absolute",
                                                top: "5px",
                                                right: "5px"
                                            }
                                        },
                                        children: [
                                            DOMElement.i({
                                                attrs: {
                                                    className: "material-icons card-icon-remove",
                                                    style: {
                                                        fontSize: "14px"
                                                    },
                                                    onclick: function(){
                                                        removeDetail();
                                                    }
                                                },
                                                text: "clear"
                                            })
                                        ]
                                    }),
                                    DOMElement.div({
                                        attrs: {
                                            style: {
                                                // width: "200px",
                                                // height: "200px",
                                                // overflow: "hidden"
                                            }
                                        },
                                        children: [DOMElement.img({
                                            attrs: {
                                                src: (x.id > 0)? window.domain + "/uploads/images/" + x.id + "_" + x.filename + ".upload" : x.file_blob_url,
                                                style: {
                                                    maxWidth: "200px",
                                                    maxHeight: "200px"
                                                }
                                            }
                                        })]
                                    })
                                ]
                            });
                            activityItemElt.push(fileElt);
                        }

                    });
                };
                function drawWait(item){
                    activityItemElt = [
                        DOMElement.div({
                            attrs: attrsTitle,
                            text: LanguageModule.text("txt_wait")
                        }),
                        DOMElement.div({
                            attrs: {style: {paddingLeft: "30px"}},
                            children: [DOMElement.div({
                                attrs: attrsText,
                                text: item.name
                            })]
                        })
                    ];
                };
                function drawNote(item){
                    activityItemElt = [
                        DOMElement.div({
                            attrs: attrsTitle,
                            text: LanguageModule.text("txt_note")
                        }),
                        DOMElement.div({
                            attrs: {style: {paddingLeft: "30px"}},
                            children: [
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_work") + ": " + item.work
                                }),
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_note") + ": " + item.note
                                })
                            ]
                        })
                    ];
                };
                function drawCheckList(item){
                    var dataCheckListItems = [];
                    item.details.forEach(function (x) {
                        dataCheckListItems.push([
                            {
                                attrs: attrsTDfirst,
                                text: x.name
                            },
                            {
                                attrs: attrsTD,
                                text: (x.due_date) ? contentModule.formatTimeMinuteDisplay(x.due_date) : ""
                            },
                            {
                                attrs: attrsTD,
                                text: contentModule.getUsernameFullnameByhomeid(data_module.users, x.assigned_to)
                            },
                            {
                                attrs: attrsTD,
                                text: getStatusName(x.status)
                            }
                        ]);
                    });
                    activityItemElt = [
                        DOMElement.div({
                            attrs: attrsTitle,
                            text: LanguageModule.text("txt_check_list")
                        }),
                        DOMElement.div({
                            attrs: {style: {paddingLeft: "30px"}},
                            children: [
                                DOMElement.div({
                                    attrs: attrsText,
                                    text: LanguageModule.text("txt_name") + ": " + item.name
                                }),
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            paddingTop: "10px"
                                        }
                                    },
                                    children: [DOMElement.table({
                                        attrs: {style: {width: "100%"}},
                                        header: [
                                            {
                                                attrs: attrsTHfirst,
                                                text: LanguageModule.text("txt_check_list")
                                            },
                                            {
                                                attrs: attrsTH,
                                                text: LanguageModule.text("txt_due_date")
                                            },
                                            {
                                                attrs: attrsTH,
                                                text: LanguageModule.text("txt_assigned_to")
                                            },
                                            {
                                                attrs: attrsTH,
                                                text: LanguageModule.text("txt_complete")
                                            }
                                        ],
                                        data: dataCheckListItems
                                    })]
                                })
                            ]
                        })
                    ];
                };
                activityItemElt = [DOMElement.div({})];
                switch (item.type_activity) {
                    case 'task':
                        drawTask(item);
                        break;
                    case 'call':
                        drawCall(item);
                        break;
                    case 'meeting':
                        drawMeeting(item);
                        break;
                    case 'field':
                        drawField(item);
                        break;
                    case 'chat':
                        drawChat(item);
                        break;
                    case 'file':
                        drawFile(item);
                        break;
                    case 'wait':
                        drawWait(item);
                        break;
                    case 'note':
                        drawNote(item);
                        break;
                    case 'checklist':
                        drawCheckList(item);
                        break;
                }
                var res = DOMElement.div({
                    attrs: {
                        style: {
                            marginTop: "10px",
                            marginBottom: "10px",
                            border: "1px solid #d6d6d6",
                            padding: "10px",
                            position: "relative"
                        }
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-activity-chart-quickmenu-ctn"
                            },
                            children: [
                                DOMElement.div({
                                    attrs: {
                                        className: "card-icon-remove-cover",
                                        onclick: function(){
                                            remove();
                                        }
                                    },
                                    children: [DOMElement.i({
                                        attrs: {
                                            className: "material-icons card-icon-remove"
                                        },
                                        text: "clear"
                                    })]
                                })
                            ]
                        }),
                        DOMElement.div({
                            children: activityItemElt
                        })
                    ]
                });
                activity_container.appendChild(res);
            });
        });
    };
    var getStatusName = function (status) {
        if (status) {
            return LanguageModule.text("txt_yes");
        } else {
            return LanguageModule.text("txt_no");
        }
    }
    var attachActivityFunc = function(){
        theme.attachActivityForm({
            listActivity: listActivity,
            cmdbutton: {
                save: function(activityList){
                    console.log(activityList);
                    activityListChoose = activityListChoose.concat(activityList);
                    activityListChoose.sort(function(a, b){
                        return b.timeSort.getTime() - a.timeSort.getTime();
                    });
                    drawActivity();
                }
            }
        });
    };

    var attachFilesFunc = function(files){
        if (files.length == 0) return;
        console.log(activityListChoose);
        console.log(files);
        var now = new Date();
        var dateNow = now.getDate();
        var monthNow = now.getMonth();
        var yearNow = now.getFullYear();
        var imageSuffixes = ["jpg", "png", "gif", "jpeg"];
        var ex = -1;
        for (var i = 0; i < activityListChoose.length; i++){
            if (activityListChoose[i].type_activity != "file") continue;
            if (activityListChoose[i].timeSort.getDate() != dateNow) continue;
            if (activityListChoose[i].timeSort.getMonth() != monthNow) continue;
            if (activityListChoose[i].timeSort.getFullYear() != yearNow) continue;
            ex = i;
            files.forEach(function(item){
                var content_type;
                if (imageSuffixes.indexOf(item.name.split('.').pop()) < 0){
                    content_type = "file";
                }
                else {
                    content_type = "img";
                }
                activityListChoose[i].details.unshift({
                    id: 0,
                    title: item.name,
                    filename: item.name,
                    content_type: content_type,
                    type: "card",
                    time: new Date(),
                    userid: systemconfig.userid,
                    file_blob_url: URL.createObjectURL(item),
                    file_content: item
                });
            });
        }
        if (ex < 0){
            activityListChoose.unshift({
                details: [],
                timeSort: new Date(),
                type_activity: "file"
            });
            files.forEach(function(item){
                var content_type;
                if (imageSuffixes.indexOf(item.name.split('.').pop()) < 0){
                    content_type = "file";
                }
                else {
                    content_type = "img";
                }
                activityListChoose[0].details.unshift({
                    id: 0,
                    title: item.name,
                    filename: item.name,
                    content_type: content_type,
                    type: "card",
                    time: new Date(),
                    userid: systemconfig.userid,
                    file_blob_url: URL.createObjectURL(item),
                    file_content: item
                });
            });
        }
        drawActivity();
    };
    host.editorSendMail;
    var ckedit = absol.buildDom({
        tag: 'attachhook',
        on: {
            error: function () {
                this.selfRemove();
                host.editorSendMail = CKEDITOR.replace(textId, {
                    toolbar: [
                		['Bold', 'Italic','Underline', 'Strike', 'NumberedList', 'BulletedList', 'Image','Font','FontSize','TextColor','BGColor', 'Attach_Activity', 'Attach'],
                	]
                });
                var signature = "";
                var uIndex = data_module.users.getByhomeid(systemconfig.userid);
                if (uIndex >= 0){
                    var config = data_module.users.items[uIndex].config;
                    if (config != ""){
                        config = EncodingClass.string.toVariable(config);
                        if (config.signature !== undefined){
                            signature = config.signature;
                        }
                    }
                }
                host.editorSendMail.setData(signature);
                host.editorSendMail.addCommand("comand_attach_activity", {
                    exec: function(edt) {
                        attachActivityFunc();
                    }
                });
                host.editorSendMail.addCommand("comand_attach_files", {
                    exec: function(edt) {
                        absol.openFileDialog({multiple:true}).then(function(files){
                            attachFilesFunc(files);
                        });
                    }
                });
            }
        }
    });
    var oIndex, content, data, listActivity = [], listField = [];
    for (var i = 0; i < host.database.cards.items[index].activitiesList.length; i++){
        oIndex = host.database.objects.getIndex(host.database.cards.items[index].activitiesList[i]);
        if (oIndex < 0) continue;
        if (host.database.objects.items[oIndex].type == 'file') continue;
        if (host.database.objects.items[oIndex].type == 'sendmail') continue;
        content = getContentByValueId(host.database.objects.items[oIndex].valueid);
        if (content == "") continue;
        content = EncodingClass.string.toVariable(content);
        data = {
            type_activity: host.database.objects.items[oIndex].type,
            timeSort: host.database.objects.items[oIndex].createdtime
        };
        switch (host.database.objects.items[oIndex].type) {
            case 'meeting':
                var getTypeName = function(type){
                    switch (type) {
                        case "type_visit":
                            return LanguageModule.text("txt_visit");
                        case "type_online":
                            return LanguageModule.text("txt_online");

                    }
                };
                for (var j = 0; j < content.length; j++){
                    switch (content[j].localid) {
                        case "type_meeting_name":
                            data.name = getContentByValueId(content[j].valueid);
                            break;
                        case "type_meeting_location":
                            data.location = getContentByValueId(content[j].valueid);
                            break;
                        case "type_meeting_type":
                            data.type = getTypeName(getContentByValueId(content[j].valueid));
                            break;
                        case "type_meeting_start_date":
                            data.timestart = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            data.timeSort = data.timestart;
                            break;
                        case "type_meeting_assigned_to":
                            data.assigned_to = getContentByValueId(content[j].valueid);
                            break;
                        case "type_meeting_participant":
                            data.participant = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            break;
                        case "type_meeting_status":
                            data.status = getContentByValueId(content[j].valueid);
                            break;
                        case "type_meeting_result":
                            data.result = getContentByValueId(content[j].valueid);
                            break;
                    }
                }
                break;
            case 'task':
                for (var j = 0; j < content.length; j++){
                    switch (content[j].localid) {
                        case "type_task_work":
                            data.work = getContentByValueId(content[j].valueid);
                            break;
                        case "type_task_due_date":
                            data.due_date = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            data.timeSort = data.due_date;
                            break;
                        case "type_task_assigned_to":
                            data.assigned_to = getContentByValueId(content[j].valueid);
                            break;
                        case "type_task_participant":
                            data.participant = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            break;
                        case "type_task_status":
                            data.status = getContentByValueId(content[j].valueid);
                            break;
                        case "type_task_result":
                            data.result = getContentByValueId(content[j].valueid);
                            break;
                    }
                }
                break;
            case 'call':
                for (var j = 0; j < content.length; j++){
                    switch (content[j].localid) {
                        case "type_call_call_to":
                            data.call_to = getContentByValueId(content[j].valueid);
                            break;
                        case "type_call_due_date":
                            data.due_date = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            data.timeSort = data.due_date;
                            break;
                        case "type_call_work":
                            data.work = getContentByValueId(content[j].valueid);
                            break;
                        case "type_call_status":
                            data.status = getContentByValueId(content[j].valueid);
                            break;
                        case "type_call_result":
                            data.result = getContentByValueId(content[j].valueid);
                            break;
                        case "type_call_assigned_to":
                            data.assigned_to = getContentByValueId(content[j].valueid);
                            break;
                    }
                }
                break;
            case 'checklist':
                for (var j = 0; j < content.length; j++){
                    switch (content[j].localid) {
                        case "type_check_list_name":
                            data.name = getContentByValueId(content[j].valueid);
                            break;
                        case "type_check_list_items":
                            var items = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            var content_temp, details;
                            data.details = [];
                            items.forEach(function(elt){
                                details = {};
                                content_temp = EncodingClass.string.toVariable(getContentByValueId(elt));
                                content_temp.forEach(function(elt1){
                                    switch (elt1.localid) {
                                        case 'type_check_list_item_success':
                                            details.success = getContentByValueId(elt1.valueid);
                                            break;
                                        case 'type_check_list_item_name':
                                            details.name = getContentByValueId(elt1.valueid);
                                            break;
                                        case 'type_check_list_item_due_date':
                                            details.due_date = EncodingClass.string.toVariable(getContentByValueId(elt1.valueid));
                                            if (details.due_date !== null){
                                                if (details.due_date.getTime() > data.timeSort.getTime()) data.timeSort = details.due_date;
                                            }
                                            break;
                                        case 'type_check_list_item_assigned_to':
                                            details.assigned_to = getContentByValueId(elt1.valueid);
                                            break;
                                    }
                                });
                                data.details.push(details);
                            });
                            break;
                        case "type_check_list_created":
                            var timeSort = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            if (timeSort.getTime() > data.timeSort.getTime()) data.timeSort = timeSort;
                            break;
                    }
                }
                break;
            case 'wait':
                for (var j = 0; j < content.length; j++){
                    switch (content[j].localid) {
                        case "type_wait_duration":
                            data.duration = getContentByValueId(content[j].valueid);
                            break;
                        case "type_wait_message":
                            data.message = getContentByValueId(content[j].valueid);
                            break;
                    }
                }
                data.name = "Sau " + data.duration + " ngày tính từ " + contentModule.formatTimeMinuteDisplay(data.timeSort) + " mà không ghi nhân hoạt động nào thì thông báo cho người quản lý card";
                break;
            case 'field':
                var tIndex = host.database.typelists.getIndex(host.database.objects.items[oIndex].typeid);
                data.name = host.database.typelists.items[tIndex].name;
                data.valueid = host.database.objects.items[oIndex].valueid;
                data.typeid = host.database.objects.items[oIndex].typeid;
                break;
            case 'note':
                for (var j = 0; j < content.length; j++){
                    switch (content[j].localid) {
                        case "type_note_work":
                            data.work = getContentByValueId(content[j].valueid);
                            break;
                        case "type_note_note":
                            data.note = getContentByValueId(content[j].valueid);
                            break;
                        case "type_note_created":
                            data.timeSort = EncodingClass.string.toVariable(getContentByValueId(content[j].valueid));
                            break;
                    }
                }
                break;
            default:
                break;
        }
        if (host.database.objects.items[oIndex].type == "field"){
            listField.push(data);
        }
        else {
            listActivity.push(data);
        }
    }
    listField.sort(function(a, b){
        return b.timeSort.getTime() - a.timeSort.getTime();
    });
    var lastMonth = 0, lastDate = 0, lastYear = 0;
    var fDate, fMonth, fYear, fieldGroup;
    for (var i = 0; i < listField.length; i++){
        var fDate = listField[i].timeSort.getDate()
        var fMonth = listField[i].timeSort.getMonth() + 1;
        var fYear = listField[i].timeSort.getFullYear();
        if (fDate != lastDate || fMonth != lastMonth || fYear != lastYear){
            lastMonth = fMonth;
            lastDate = fDate;
            lastYear = fYear;
            fieldGroup = {
                type_activity: "field",
                timeSort: listField[i].timeSort,
                details: []
            };
            listActivity.push(fieldGroup);
        }
        fieldGroup.details.push(listField[i]);
    }
    for (var i = 0; i < host.allFiles.length; i++){
        listActivity.push({
            type_activity: "file",
            timeSort: host.allFiles[i].time,
            details: EncodingClass.string.duplicate(host.allFiles[i].listFile)
        });
    }
    for (var i = 0; i < host.chat_content.length; i++){
        listActivity.push({
            type_activity: "chat",
            timeSort: host.chat_content[i].time,
            details: host.chat_content[i].listChat
        });
    }
    listActivity.sort(function(a, b){
        return b.timeSort.getTime() - a.timeSort.getTime();
    });
    var activity_container = DOMElement.div({});
    host.listFileToday = [];
    for (var i = 0; i < host.allFiles.length; i++){
        if (contentModule.compareDate(host.allFiles[i].time, new Date())){
            host.listFileToday = EncodingClass.string.duplicate(host.allFiles[i].listFile);
            break;
        }
    }
    var singlePage = host.funcs.chooseActivitySendMail({
        cmdbutton: cmdbutton,
        name: host.database.cards.items[index].name,
        listActivity: listActivity,
        users_sendmail_select: host.users_sendmail_select,
        email_group_select: host.email_group_select, //thanhyen
        subject_sendmail_input: host.subject_sendmail_input,
        cc_sendmail_input: host.cc_sendmail_input,
        bcc_sendmail_input: host.bcc_sendmail_input,
        content_sendmail_input: host.content_sendmail_input,
        cardid: id,
        funcs: host.funcs,
        objects: host.database.objects,
        values: host.database.values,
        boardName: host.database.boards.items[host.database.boards.getIndex(host.boardId)].name,
        cardName: id > 0 ? host.database.cards.items[host.database.cards.getIndex(id)].name : "",
        username: systemconfig.username,
        frameList: host.frameList,
        activity_container: activity_container,
        imagesList: host.imagesList,
        fileList: [],
        listFileToday: host.listFileToday,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editMailFunc: function(cardid, id){
            carddone.cards.viewMailFunc(host, cardid, id);
        }
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();

    var fileOverlayDiv = absol._({
        tag:'div',
        style:{
            position: 'absolute',
            left: "10px",
            right: "10px",
            top: "10px",
            bottom: "10px",
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'none',
            zIndex: '1000000000',
            textAlign: "center",
            border: "4px dashed grey"
        },
        child: [
            {
                style:{
                    display: 'inline-block',
                    verticalAlign:'middle',
                    height: '100%'
                }
            },
            {
            tag: "div",
            style: {
                display: 'inline-block',
                verticalAlign:'middle',
                fontSize: "36px",
                color: "grey"
            },
            child: {
                text: LanguageModule.text("txt_drop_file_here")
            }
        }]
    });
    singlePage.appendChild(fileOverlayDiv);

    absol._({
        tag:'dropzone',
        elt: singlePage,
        on:{
            fileenter: function(event){
                fileOverlayDiv.removeStyle('display');
            },
            filedrop: function(event){
                fileOverlayDiv.addStyle('display', 'none');
                var files = Array.prototype.slice.call(event.dataTransfer.files);
                attachFilesFunc(files);
            },
            fileleave: function(event){
                fileOverlayDiv.addStyle('display', 'none');
            }
        }
    });


};

carddone.cards.editCard = function(host, listId, id, editMode){
    var index, name, objectId, objectList, important, createdtime, username, contactList, companyList, activitiesList;
    var params, cmdButton, valuesList, object_type, lists, singlePage, users, activities, owner;
    var knowledgeActive;
    users = host.database.list_member.items.map(function(elt){
        return {
            value: elt.userid,
            text: contentModule.getUsernameFullnameByhomeid(data_module.users, elt.userid)
        }
    });
    cmdButton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            return new Promise(function(rs){
                var value = singlePage.getValue();
                if (!value) {
                    rs(false);
                    return;
                }
                carddone.boards.editCardSave(host, id, value, listId, editMode).then(function(value){
                    carddone.cards.prevEditCard(host, value.listid, value.cardid, editMode)
                    rs(value);
                });
            });
        },
        saveClose: function () {
            return new Promise(function(rs){
                var value = singlePage.getValue();
                if (!value) {
                    rs(false);
                    return;
                }
                carddone.boards.editCardSave(host, id, value, listId, editMode).then(function(value){
                    ModalElement.close(-1);
                    host.frameList.removeLast();
                    rs(value);
                });
            });
        }
    };
    host.imagesList = [];
    host.filesList = [];
    var knowledgeid = 0;
    var board_email_groups = [];
    for (var i = 0; i < host.database.board_email_groups.items.length; i++){
        board_email_groups.push({
            value: host.database.board_email_groups.items[i].id,
            text: host.database.board_email_groups.items[i].name
        });
    }
    var attention, email_groups;
    if (id == 0){
        name = "";
        objectId = 0;
        important = 0;
        username = "";
        contactList = [];
        companyList = [];
        activitiesList = [];
        knowledgeActive = false;
        owner = systemconfig.userid;
        email_groups = [];
        attention = false;
    }
    else {
        cmdButton.move = function () {
            return carddone.cards.moveCard(host, id);
        };
        cmdButton.archive = function () {
            return carddone.cards.archiveCard(host, id);
        };
        cmdButton.delete = function () {
            return carddone.cards.deleteCard(host, id);
        };
        index = host.database.cards.getIndex(id);
        cmdButton.restore = function () {
            return carddone.cards.restoreCard(host, id, host.database.cards.items[index].parentid);
        };
        attention = false;
        for (var i = 0; i < host.database.attention_lists.items.length; i++){
            if (host.database.attention_lists.items[i].listid == id) {
                attention = true;
                break;
            }
        }
        email_groups = [];
        for (var i = 0; i < host.database.card_email_groups.items.length; i++){
            email_groups.push(host.database.card_email_groups.items[i].groupid);
        }
        name = host.database.cards.items[index].name;
        objectId = host.database.cards.items[index].typeid;
        important = host.database.cards.items[index].favorite;
        knowledgeActive = false;
        for (var i = 0; i < host.database.knowledge.items.length; i++){
            if (host.database.knowledge.items[i].cardid == id){
                knowledgeid = host.database.knowledge.items[i].id;
                break;
            }
        }
        if (knowledgeid > 0){
            var knowledgeIndex = host.database.knowledge.getIndex(knowledgeid);
            knowledgeActive = host.database.knowledge.items[knowledgeIndex].available;
        }
        for (var i = 0; i < data_module.users.items.length; i++){
            if (host.database.cards.items[index].userid == data_module.users.items[i].homeid) {
                username = data_module.users.items[i].username;
                break;
            }
        }
        owner = host.database.cards.items[index].owner != 0 ? host.database.cards.items[index].owner : host.database.cards.items[index].userid;
        createdtime = host.database.cards.items[index].createdtime;
        contactList = host.database.cards.items[index].contactList;
        companyList = host.database.cards.items[index].companyList;
        activitiesList = host.database.cards.items[index].activitiesList;
        var chatIndex = host.database.cards.items[index].chatIndex;
        var fileTitle;
        if (chatIndex >= 0){
            for (var i = 0; i < host.database.chat_sessions.items[chatIndex].content.length; i++){
                fileTitle = host.database.chat_sessions.items[chatIndex].content[i].title;
                if (fileTitle === undefined) fileTitle = host.database.chat_sessions.items[chatIndex].content[i].content;
                if (host.database.chat_sessions.items[chatIndex].content[i].content_type == "img"){
                    host.imagesList.push({
                        id: host.database.chat_sessions.items[chatIndex].content[i].localid,
                        filename: host.database.chat_sessions.items[chatIndex].content[i].content,
                        title: fileTitle,
                        userid: host.database.chat_sessions.items[chatIndex].content[i].userid,
                        time: host.database.chat_sessions.items[chatIndex].content[i].m_time,
                        type: "chat",
                        content_type: "img"
                    });
                }
                else if (host.database.chat_sessions.items[chatIndex].content[i].content_type == "file"){
                    host.filesList.push({
                        id: host.database.chat_sessions.items[chatIndex].content[i].localid,
                        filename: host.database.chat_sessions.items[chatIndex].content[i].content,
                        title: fileTitle,
                        userid: host.database.chat_sessions.items[chatIndex].content[i].userid,
                        time: host.database.chat_sessions.items[chatIndex].content[i].m_time,
                        type: "chat",
                        content_type: "file"
                    });
                }
            }
        }
        var imageSuffixes = ["jpg", "png", "gif", "jpeg"];
        var oIndex, valueIndex, dataFile, contentvalue;
        for (var i = 0; i < host.database.cards.items[index].fileList.length; i++){
            oIndex = host.database.objects.getIndex(host.database.cards.items[index].fileList[i]);
            dataFile = {
                id: host.database.objects.items[oIndex].id,
                userid: host.database.objects.items[oIndex].userid,
                time: host.database.objects.items[oIndex].createdtime,
                type: "card"
            };
            valueIndex = host.database.values.getIndex(host.database.objects.items[oIndex].valueid);
            contentvalue = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
            for (var j = 0; j < contentvalue.length; j++){
                if (contentvalue[j].localid == "type_file_title") dataFile.title = host.database.values.items[host.database.values.getIndex(contentvalue[j].valueid)].content;
                if (contentvalue[j].localid == "type_file_name") dataFile.filename = host.database.values.items[host.database.values.getIndex(contentvalue[j].valueid)].content;
            }
            if (imageSuffixes.indexOf(dataFile.filename.split('.').pop()) < 0){
                dataFile.content_type = "file";
                host.filesList.push(dataFile);
            }
            else {
                host.imagesList.push(dataFile);
                dataFile.content_type =  "img";
            }
        }
    }
    var userIndex;
    for (var i = 0; i < host.imagesList.length; i++){
        userIndex = data_module.users.getByhomeid(host.imagesList[i].userid);
        host.imagesList[i].avatar = data_module.users.items[userIndex].avatarSrc;
        host.imagesList[i].userName = data_module.users.items[userIndex].fullname;
        host.imagesList[i].date = host.imagesList[i].time;
        host.imagesList[i].src = window.domain + "./uploads/images/" + host.imagesList[i].id + "_" + host.imagesList[i].filename + ".upload";
        host.imagesList[i].note = host.imagesList[i].filename;
    }
    host.imagesList.sort(function(a, b){
        return b.time.getTime() - a.time.getTime();
    });
    var allFiles = host.filesList.concat(host.imagesList);
    allFiles.sort(function(a, b){
        return a.time.getTime() - b.time.getTime();
    });
    host.allFiles = [];
    var lastMonth = 0, lastDate = 0, lastYear = 0;
    var fDate, fMonth, fYear, fileGroup;
    for (var i = 0; i < allFiles.length; i++){
        var fDate = allFiles[i].time.getDate()
        var fMonth = allFiles[i].time.getMonth() + 1;
        var fYear = allFiles[i].time.getFullYear();
        if (fDate != lastDate || fMonth != lastMonth || fYear != lastYear){
            lastMonth = fMonth;
            lastDate = fDate;
            lastYear = fYear;
            fileGroup = {
                index: host.allFiles.length,
                time: allFiles[i].time,
                listFile: []
            };
            host.allFiles.push(fileGroup);
        }
        fileGroup.listFile.push(allFiles[i]);
    }
    host.chat_content = [];
    if (host.database.chat_sessions.items.length > 0){
        var lastMonth = 0, lastDate = 0, lastYear = 0;
        var fDate, fMonth, fYear, chatGroup;
        carddone.chats.generateDataChatContent(host, host.database.chat_sessions.items[0].content);
        for (var i = 0; i < host.database.chat_sessions.items[0].content.length; i++){
            var fDate = host.database.chat_sessions.items[0].content[i].m_time.getDate()
            var fMonth = host.database.chat_sessions.items[0].content[i].m_time.getMonth() + 1;
            var fYear = host.database.chat_sessions.items[0].content[i].m_time.getFullYear();
            if (fDate != lastDate || fMonth != lastMonth || fYear != lastYear){
                lastMonth = fMonth;
                lastDate = fDate;
                lastYear = fYear;
                chatGroup = {
                    index: host.chat_content.length,
                    time: host.database.chat_sessions.items[0].content[i].m_time,
                    listChat: []
                };
                host.chat_content.push(chatGroup);
            }
            chatGroup.listChat.push(host.database.chat_sessions.items[0].content[i]);
        }
    }
    lists = [];
    for (var i = 0; i < host.database.lists.items.length; i++){
        if (host.database.lists.items[i].type2 == "group") continue;
        lists.push({
            value: host.database.lists.items[i].id,
            text: host.database.lists.items[i].name
        });
    }
    activities = [
        {
            src1: 'icons/task.png',
            src2: 'icons/task_disabled.png',
            text: LanguageModule.text("txt_task"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.addTaskForm(host, id, 0);
            }
        },
        {
            src1: 'icons/meeting.png',
            src2: 'icons/meeting_disabled.png',
            text: LanguageModule.text("txt_meeting"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.addMeetingForm(host, id, 0);
            }
        },
        {
            src1: 'icons/call.png',
            src2: 'icons/call_disabled.png',
            text: LanguageModule.text("txt_call"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.addCallForm(host, id, 0);
            }
        },
        {
            src1: 'icons/check_list.png',
            src2: 'icons/check_list_disabled.png',
            text: LanguageModule.text("txt_check_list"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.addCheckListForm(host, id, 0);
            }
        },
        {
            src1: 'icons/file.png',
            src2: 'icons/file_disabled.png',
            text: LanguageModule.text("txt_file"),
            click: function(){
                if (editMode == 'view') return;
                if (host.viewMode == 'archived') return;
                carddone.cards.addFileForm(host, id, [], "new");
            }
        },
        {
            src1: 'icons/chat.png',
            src2: 'icons/chat_disabled.png',
            text: LanguageModule.text("txt_chat"),
            click: function(){
                if (host.viewMode == 'archived') return;
                if (editMode == 'view') return;
                carddone.menu.loadPage(7, id);
            }
        },
        {
            src1: 'icons/wait.png',
            src2: 'icons/wait_disabled.png',
            text: LanguageModule.text("txt_wait"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.addWaitForm(host, id, 0);
            }
        },
        {
            src1: 'icons/field.png',
            src2: 'icons/field_disabled.png',
            text: LanguageModule.text("txt_field"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.addFieldForm(host, id, 0);
            }
        },
        {
            src1: 'icons/note.png',
            src2: 'icons/note_disabled.png',
            text: LanguageModule.text("txt_note"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.addNoteForm(host, id, 0);
            }
        },
        {
            src1: 'icons/email.png',
            src2: 'icons/email_disabled.png',
            text: LanguageModule.text("txt_send_mail"),
            click: function(){
                if (editMode == 'view') return;
                carddone.cards.sendMailFunc(host, id);
            }
        }
    ];
    params = {
        cardid: id,
        list_member: users,
        owner: owner,
        archived: host.viewArchived ? 1 : 0,
        viewMode: host.viewMode,
        frameList: host.frameList,
        editMode: editMode,
        activitiesOfCard: activitiesList,
        activities: activities,
        contactOfCard: contactList,
        companyOfCard: companyList,
        stage: listId,
        attention: {
            title: LanguageModule.text("txt_pin_to_dashboard"),
            value: attention
        },
        objectId: objectId,
        lists: lists,
        typelists: host.database.typelists,
        companies: host.database.companies,
        company_class: host.database.company_class,
        contacts: host.database.contact,
        districts: host.database.districts,
        cities: host.database.cities,
        nations: host.database.nations,
        objects: host.database.objects,
        values: host.database.values,
        boardName: host.boardContent.name,
        // object_of_board: host.object_of_board,
        // object_type: object_type,
        allFiles: host.allFiles,
        imagesList: host.imagesList,
        chat_content: host.chat_content,
        cmdButton: cmdButton,
        name: name,
        email_groups: {
            title: LanguageModule.text("txt_email_group"),
            value: email_groups
        },
        board_email_groups: board_email_groups,
        important: {
            title: LanguageModule.text('txt_important'),
            value: important
        },
        knowledge: {
            title: LanguageModule.text("txt_knowledge"),
            value: knowledgeActive,
            id: knowledgeid,
            cmd: function(){
                return new Promise(function(resolve, reject){
                    carddone.cards.knowledgeEdit(host, id).then(function(value){
                        resolve(value)
                    });
                });
            }
        },
        createdtime: {
            title: LanguageModule.text("txt_date_created"),
            value: createdtime
        },
        username: {
            title: LanguageModule.text("txt_user_created"),
            value: username
        },
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
            funcs: host.funcs,
            listValueId: []
        }),
        editActivitiesFunc: {
            editTaskFunc: function(cardid, id){
                // if (editMode == 'view') return;
                carddone.cards.addTaskForm(host, cardid, id);
            },
            editMeetingFunc: function(cardid, id){
                // if (editMode == 'view') return;
                carddone.cards.addMeetingForm(host, cardid, id);
            },
            editCallFunc: function(cardid, id){
                // if (editMode == 'view') return;
                carddone.cards.addCallForm(host, cardid, id);
            },
            editWaitFunc: function(cardid, id){
                // if (editMode == 'view') return;
                carddone.cards.addWaitForm(host, cardid, id);
            },
            editNoteFunc: function(cardid, id){
                // if (editMode == 'view') return;
                carddone.cards.addNoteForm(host, cardid, id);
            },
            editCheckListFunc: function(cardid, id){
                // if (editMode == 'view') return;
                carddone.cards.addCheckListForm(host, cardid, id);
            },
            editFieldFunc: function(cardid, id){
                // if (editMode == 'view') return;
                carddone.cards.addFieldForm(host, cardid, id);
            },
            editFileFunc: function(cardid, fileList){
                if (editMode == 'view') return;
                if (host.viewMode == 'archived') return;
                if (fileList == 0){
                    carddone.cards.addFileForm(host, cardid, [], "new");
                }
                else {
                    carddone.cards.addFileForm(host, cardid, fileList, "edit");
                }
            },
            editChatFunc: function(){
                if (editMode == 'view') return;
                if (host.viewMode == 'archived') return;
                carddone.menu.loadPage(7, id);
            },
            editMailFunc: function(cardid, id){
                if (cardid == 0) return;
                // if (editMode == 'view') return;
                if (id == 0){
                    carddone.cards.sendMailFunc(host, cardid);
                }
                else {
                    carddone.cards.viewMailFunc(host, cardid, id);
                }
            }
        }
    };
    singlePage = host.funcs.cardEditForm(params);
    var x = 1;
    if (host.isMobile) x = 2;
    while(host.frameList.getLength() > x){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.redraw = function(host, userid){
    return new Promise(function(rs){
        var list = [], cardIdList, memberList, memberDict;
        userid = isNaN(userid) ? 0 : userid;
        var dict = {};
        for (var i = 0; i < host.database.lists.items.length; i++){
            dict[host.database.lists.items[i].id] = i;
        }
        memberDict = {};
        host.database.list_member.items.forEach(function(elt){
            memberDict[elt.userid] = 1;
        });
        var content = host.boardContent.childrenIdList;
        content.sort(function(a, b){
            if (host.database.lists.items[dict[a]].lindex > host.database.lists.items[dict[b]].lindex) return 1;
            if (host.database.lists.items[dict[a]].lindex < host.database.lists.items[dict[b]].lindex) return -1;
            return 0;
        });
        content.forEach(function(elt){
            var arrayOfListId = host.database.lists.items[dict[elt]].childrenIdList;
            if (arrayOfListId.length == 0) return;
            arrayOfListId.sort(function(a, b){
                if (host.database.lists.items[dict[a]].lindex > host.database.lists.items[dict[b]].lindex) return 1;
                if (host.database.lists.items[dict[a]].lindex < host.database.lists.items[dict[b]].lindex) return -1;
                return 0;
            });
            arrayOfListId.forEach(function(item){
                var i = dict[item];
                var decoration = EncodingClass.string.toVariable(host.database.lists.items[i].decoration);
                if ((host.boardContent.userid != systemconfig.userid) && (host.boardContent.permission == 0)){
                    var list_member_index;
                    for (var j = 0; j < host.database.list_member.items.length; j++){
                        if (host.database.list_member.items[j].userid == systemconfig.userid) list_member_index = j;
                    }
                    if (host.database.list_member.items[list_member_index].type == 0) {
                        cardIdList = host.database.lists.items[i].childrenIdList.filter(function(elt){
                            var cIndex = host.database.cards.getIndex(elt);
                            return (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid);
                        });
                    }
                    else cardIdList = EncodingClass.string.duplicate(host.database.lists.items[i].childrenIdList);
                }
                else cardIdList = EncodingClass.string.duplicate(host.database.lists.items[i].childrenIdList);
                var cards = [];
                cardIdList.forEach(function(elt){
                    var editMode = 'view';
                    var cIndex = host.database.cards.getIndex(elt);
                    if (cIndex == -1) return;
                    if (host.database.cards.items[cIndex].userid == systemconfig.userid || host.database.cards.items[cIndex].owner == systemconfig.userid) editMode = "edit";
                    else if (host.priv[3]) editMode = "edit";
                    else if (host.priv[2]) editMode = "view";
                    else return;
                    var owner = host.database.cards.items[cIndex].owner > 0 ? host.database.cards.items[cIndex].owner : host.database.cards.items[cIndex].userid;
                    memberDict[owner] = 1;
                    if (userid != 0 && owner != userid) return;
                    cards.push({
                        id: host.database.cards.items[cIndex].id,
                        name: host.database.cards.items[cIndex].name,
                        userid: host.database.cards.items[cIndex].userid,
                        owner: owner,
                        parentid: host.database.cards.items[cIndex].parentid,
                        companies: host.database.cards.items[cIndex].companyList,
                        contacts: host.database.cards.items[cIndex].contactList,
                        archived: host.viewArchived ? 1 : 0,
                        lindex: host.database.cards.items[cIndex].lindex,
                        editMode: editMode,
                        editFunc: function(parentid, id, editMode){
                            return function(){
                                carddone.cards.prevEditCard(host, parentid, id, editMode);
                            }
                        }(host.database.cards.items[cIndex].parentid, host.database.cards.items[cIndex].id, editMode),
                        deleteFunc: host.viewArchived ? function(id){
                            return function(){
                                return carddone.cards.deleteCardFromArchived(host, id);
                            }
                        }(host.database.cards.items[cIndex].id) : function(id){
                            return function(){
                                return carddone.cards.deleteCard(host, id);
                            }
                        }(host.database.cards.items[cIndex].id),
                        moveFunc: function(id){
                            return function(){
                                return carddone.cards.moveCard(host, id);
                            }
                        }(host.database.cards.items[cIndex].id),
                        archiveFunc: function(id){
                            return function(){
                                return carddone.cards.archiveCard(host, id);
                            }
                        }(host.database.cards.items[cIndex].id),
                        restoreFunc: function(id, parentid){
                            return function(){
                                return carddone.cards.restoreCard(host, id, parentid);
                            }
                        }(host.database.cards.items[cIndex].id, host.database.cards.items[cIndex].parentid)
                    });
                });
                cards.sort(function(a, b){
                    if (a.lindex > b.lindex) return -1;
                    if (a.lindex < b.lindex) return 1;
                    return 0;
                });
                list.push({
                    id: host.database.lists.items[i].id,
                    name: host.database.lists.items[i].name,
                    lindex: host.database.lists.items[i].lindex,
                    description: "",
                    decoration: decoration,
                    cards: cards,
                    addNewCardFunc: function(id){
                        return function(){
                            carddone.cards.prevEditCard(host, id, 0, "edit");
                        }
                    }(host.database.lists.items[i].id),
                    cardenter: function(host){
                        return function(event){
                            return carddone.cards.moveCardToOtherListSave(host, event.item.ident, event.target, event.from, event.to, event.to.table);
                        }
                    }(host),
                    orderchange: function(host){
                        return function(event){
                            return carddone.cards.moveCardSave(host, event.boardElt, event.$body, event.target.ident, event.from, event.to);
                        }
                    }(host),
                    archiveAllCardInListFunc: function(host, id){
                        return function(){
                            return carddone.cards.archiveAllCardInListFunc(host, id);
                        }
                    }(host, host.database.lists.items[i].id)
                });
            });
        });
        var memberIdList = Object.keys(memberDict);
        memberList = [];
        memberIdList.forEach(function(elt){
            elt = parseInt(elt, 10);
            var index = data_module.users.getByhomeid(elt);
            if (index == -1) return;
            memberList.push({
                value: elt,
                text: data_module.users.items[index].username + " - " + data_module.users.items[index].fullname,
                text2: absol.string.nonAccentVietnamese(data_module.users.items[index].username + " - " + data_module.users.items[index].fullname).toLowerCase()
            });
        });
        memberList.sort(function(a, b){
            if (a.text2 > b.text2) return 1;
            if (a.text2 < b.text2) return -1;
            return 0;
        });
        memberList.unshift({value: 0, text: LanguageModule.text("txt_all")});
        host.userCombobox.items = memberList;
        var singlePage = host.funcs.cardContentDataForm({
            content: list,
            typelists: host.database.typelists,
            companies: host.database.companies,
            contacts: host.database.contact,
            userid: userid,
            frameList: host.frameList,
            isArchivedBoard: host.viewArchived,
            isArchivedCard: host.viewMode,
            addCardPriv: host.priv[1]
        });
        rs(singlePage);
    });
};

carddone.cards.loadCurrentCards = function(host){
    return new Promise(function(rs){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        var propmiseList = {};
        if (!host.viewArchived){
            propmiseList.lists = data_module.loadByConditionAsync({
                name: "lists",
                cond: function (record) {
                    return record.type == "list";
                },
                callback: function (retval) {
                    var list = [];
                    var t_dict = {};
                    retval.forEach(function(elt){
                        if (elt.parentid == host.boardId) {
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
                    host.database.lists = data_module.makeDatabase(list);
                    dbcache.loadByCondition({
                        name: "lists",
                        cond: function(record){
                            return (record.type == "card" && t_dict[record.parentid] == 1);
                        },
                        callback: function (retval) {
                            host.database.cards = data_module.makeDatabase(retval);
                        }
                    });
                }
            });
        }
        else {
            propmiseList.lists = data_module.loadByConditionAsync({
                name: "archived_lists",
                cond: function (record) {
                    return record.type == "list";
                },
                callback: function (retval) {
                    var list = [];
                    var t_dict = {};
                    retval.forEach(function(elt){
                        if (elt.parentid == host.boardId) {
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
                    host.database.lists = data_module.makeDatabase(list);
                    dbcache.loadByCondition({
                        name: "archived_lists",
                        cond: function(record){
                            return (record.type == "card" && t_dict[record.parentid] == 1);
                        },
                        callback: function (retval) {
                            host.database.cards = data_module.makeDatabase(retval);
                        }
                    });
                }
            });
        }
        propmiseList.lists.then(function(){
            var dict = {};
            host.database.cards.items.forEach(function(elt){
                dict[elt.id] = 1;
            });
            propmiseList.contact_card = data_module.loadByConditionAsync({
                name: "contact_card",
                cond: function (record) {
                    return dict[record.hostid] == 1;
                },
                callback: function (retval) {
                    host.database.contact_card = data_module.makeDatabase(retval);
                }
            });
            propmiseList.company_card = data_module.loadByConditionAsync({
                name: "company_card",
                cond: function (record) {
                    return dict[record.hostid] == 1;
                },
                callback: function (retval) {
                    host.database.company_card = data_module.makeDatabase(retval);
                }
            });
            Promise.all([propmiseList.contact_card, propmiseList.company_card]).then(function(){
                ModalElement.close(-1);
                contentModule.makeListsIndex(host);
                contentModule.makeListsIndex2(host);
                contentModule.makeCardIndex(host);
                contentModule.makeCompanyCardIndex(host);
                contentModule.makeContactCardIndex(host);
                contentModule.makeField_list(host);
                contentModule.makeKnowledgeGroupIndex(host);
                carddone.cards.redraw(host, parseInt(host.userCombobox.value, 10)).then(function(singlePage){
                    host.card_container.clearChild();
                    host.card_container.appendChild(singlePage);
                    rs();
                });
            });
        });
    });
};

carddone.cards.init = function(host, boardId, archivedCard){
    return new Promise(function(rs){
        if (!data_module.users) {
            setTimeout(function(){
                carddone.cards.init(host, boardId, archivedCard);
            }, 50);
            for (var i = 0; i < ModalElement.layerstatus.length; i++){
                if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
            }
            return;
        }
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }

        host.database = {};

        var knowledge_tag;

        var propmiseList = {};
        propmiseList.typelists = data_module.loadByConditionAsync({
            name: "typelists",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.typelists = data_module.makeDatabase(retval);
                contentModule.makeTypesListContentThanhYen(host);
            }
        });
        propmiseList.companies = data_module.loadByConditionAsync({
            name: "company",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.companies = data_module.makeDatabase(retval);
            }
        });
        propmiseList.contact = data_module.loadByConditionAsync({
            name: "contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.contact = data_module.makeDatabase(retval);
            }
        });
        propmiseList.company_class_member = data_module.loadByConditionAsync({
            name: "company_class_member",
            cond: function (record) {
                return record.userid == systemconfig.userid;
            },
            callback: function (retval) {
                host.database.company_class_member = data_module.makeDatabase(retval);
            }
        });
        propmiseList.owner_company_contact = data_module.loadByConditionAsync({
            name: "owner_company_contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.owner_company_contact = data_module.makeDatabase(retval);
            }
        });
        propmiseList.company_class = data_module.loadByConditionAsync({
            name: "company_class",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.company_class = data_module.makeDatabase(retval);
            }
        });
        propmiseList.nations = data_module.loadByConditionAsync({
            name: "nations",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.nations = data_module.makeDatabase(retval);
            }
        });
        propmiseList.cities = data_module.loadByConditionAsync({
            name: "cities",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.cities = data_module.makeDatabase(retval);
            }
        });
        propmiseList.districts = data_module.loadByConditionAsync({
            name: "districts",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.districts = data_module.makeDatabase(retval);
            }
        });

        propmiseList.list_member = data_module.loadByConditionAsync({
            name: "list_member",
            cond: function (record) {
                return record.listid == boardId;
            },
            callback: function (retval) {
                host.database.list_member = data_module.makeDatabase(retval);
            }
        });
        propmiseList.field_list = data_module.loadByConditionAsync({
            name: "field_list",
            cond: function (record) {
                return record.hostid == boardId;
            },
            callback: function (retval) {
                host.database.field_list = data_module.makeDatabase(retval);
            }
        });
        propmiseList.knowledge_groups = data_module.loadByConditionAsync({
            name: "knowledge_group",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.knowledge_groups = data_module.makeDatabase(retval);
            }
        });
        propmiseList.knowledge_tag = data_module.loadByConditionAsync({
            name: "knowledge",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                knowledge_tag = retval.map(function(elt){
                    return elt.tag;
                });
            }
        });

        //////////////////////////

        propmiseList.account_groups = data_module.loadByConditionAsync({
            name: "account_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.account_groups = data_module.makeDatabase(retval);
            }
        });

        propmiseList.privilege_groups = data_module.loadByConditionAsync({
            name: "privilege_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_groups = data_module.makeDatabase(retval);
            }
        });

        propmiseList.privilege_group_details = data_module.loadByConditionAsync({
            name: "privilege_group_details",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_group_details = data_module.makeDatabase(retval);
            }
        });

        ////////////////////////////

        propmiseList.boards = data_module.loadByIdAsync({
            name: "lists",
            id: boardId,
            callback: function (retval) {
                if (retval) {
                    host.database.boards = data_module.makeDatabase([retval]);
                    host.viewArchived = false;
                }
                else {
                    host.viewArchived = true;
                    dbcache.loadById({
                        name: "archived_lists",
                        id: boardId,
                        callback: function (retval) {
                            host.database.boards = data_module.makeDatabase([retval]);
                        }
                    });
                }
            }
        });

        propmiseList.board_email_groups = data_module.loadByConditionAsync({
            name: "board_email_groups",
            cond: function (record) {
                return record.boardid == boardId;
            },
            callback: function (retval) {
                host.database.board_email_groups = data_module.makeDatabase(retval);
            }
        });

        propmiseList.board_email_group_link = propmiseList.board_email_groups.then(function(){
            return new Promise(function(resolve, reject){
                var board_email_groupsDic = {};
                host.database.board_email_groups.items.forEach(function(elt){
                    board_email_groupsDic[elt.id] = 1;
                });
                dbcache.loadByCondition({
                    name: "board_email_group_link",
                    cond: function(record){
                        return board_email_groupsDic[record.groupid];
                    },
                    callback: function (retval) {
                        host.database.board_email_group_link = data_module.makeDatabase(retval);
                        resolve();
                    }
                });
            });
        });

        propmiseList.attention_lists = data_module.loadByConditionAsync({
            name: "attention_lists",
            cond: function(record){
                return record.userid == systemconfig.userid;
            },
            callback: function(retval){
                host.database.attention_lists = data_module.makeDatabase(retval);
            }
        });

        Promise.all([
            propmiseList.knowledge_tag,
            propmiseList.knowledge_groups,
            propmiseList.list_member,
            propmiseList.field_list,
            propmiseList.typelists,
            propmiseList.owner_company_contact,
            propmiseList.companies,
            propmiseList.contact,
            propmiseList.company_class,
            propmiseList.company_class_member,
            propmiseList.nations,
            propmiseList.cities,
            propmiseList.districts,
            propmiseList.boards,
            propmiseList.board_email_group_link,
            propmiseList.attention_lists,
            propmiseList.account_groups,
            propmiseList.privilege_groups,
            propmiseList.privilege_group_details
        ]).then(function(){
            contentModule.makeBoardEmailGroupLinkIndex(host);
            contentModule.makeAccountGroupPrivilegeSystem(host);
            contentModule.makeTypesListContentThanhYen(host);
            contentModule.makeCitiesIndexThanhYen(host);
            contentModule.makeDistrictsIndexThanhYen(host);
            contentModule.makeOwnerCompanyContactThanhYen(host);
            contentModule.makeCompanyIndexThanhYen(host);
            contentModule.makeContactIndexThanhYen(host); //thanhyen
            host.boardId = boardId;
            if (!host.isMobile) host.holder.addChild(host.frameList);
            host.viewMode = host.viewArchived ? "archived" : "current"
            host.listTagKnowledge = [];
            var lists;
            for (var j = 0; j < knowledge_tag.length; j++){
                lists = knowledge_tag[j].split(";");
                for (var i = 0; i < lists.length; i++){
                    if (lists[i] == "") continue;
                    if (host.listTagKnowledge.indexOf(lists[i]) < 0) host.listTagKnowledge.push(lists[i]);
                }
            }
            for (var i = 0; i < host.database.list_member.items.length; i++){
                if (host.database.list_member.items[i].userid == systemconfig.userid){
                    var tIndex = host.database.account_groups.getIndex(host.database.list_member.items[i].type);
                    if (tIndex != -1) {
                        host.priv = host.database.account_groups.items[tIndex].privOfBoard;
                    }
                    else host.priv = {};
                    break;
                }
            }
            host.boardContent = host.database.boards.items[0];
            host.holder.name = host.boardContent.name;
            host.typeid = host.boardContent.typeid;
            host.holder.boardid = host.boardContent.id;
            host.boardContent.decoration = EncodingClass.string.toVariable(host.boardContent.decoration);
            host.card_container = absol._({
                class: "card-view-container"
            });
            var singlePage = host.funcs.cardInitForm({
                cmdButton: {
                    close: function () {
                        if (host.isMobile){
                            host.frameList.removeLast();
                        }
                        else {
                            if (carddone.isMobile){
                                host.holder.selfRemove();
                                carddone.menu.loadPage(4);
                            }
                            else {
                                carddone.menu.tabPanel.removeTab(host.holder.id);
                            }
                        }
                    },
                    viewArchived: function(){
                        host.viewMode = "archived";
                        return carddone.cards.loadArchivedCards(host);
                    },
                    viewCurrent: function(){
                        host.viewMode = "current";
                        return carddone.cards.loadCurrentCards(host);
                    }
                },
                card_container: host.card_container,
                isArchivedBoard: host.viewArchived,
                boardName: host.boardContent.name,
                frameList: host.frameList
            });
            host.userCombobox = singlePage.userCombobox;
            host.userCombobox.on("change", function(){
                carddone.cards.redraw(host, parseInt(host.userCombobox.value, 10)).then(function(singlePage){
                    host.card_container.clearChild();
                    host.card_container.appendChild(singlePage);
                });
            });
            host.frameList.addChild(singlePage);
            singlePage.requestActive();
            carddone.cards.loadCurrentCards(host).then(function(){
                if (archivedCard && !host.viewArchived){
                    singlePage.viewArchived().then(function(){
                        rs();
                    });
                }
                else rs();
            });
        });
    });
};

ModuleManagerClass.register({
    name: "Cards",
    prerequisites: ["ModalElement", "FormClass"]
});
