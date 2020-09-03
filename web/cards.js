'use strict';

carddone.cards.restoreCard = function(host, id){
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_restore_save.php",
            params: [
                {name: "cardid", value: id}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.cards.getIndex(id);
                        var temp = host.database.cards.items[index];
                        host.database.cards.items.splice(index, 1);
                        host.currentCardData.push(temp);
                        rs(true);
                    }
                    else {
                        rs(false);
                    }
                }
                else {
                    rs(false);
                }
            }
        });
    })
};

carddone.cards.deleteCardFromArchived = function(host, id){
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "card_delete_from_archived_save.php",
            params: [
                {name: "cardid", value: id}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.cards.getIndex(id);
                        host.database.cards.items.splice(index, 1);
                        rs(true);
                    }
                    else {
                        rs(false);
                    }
                }
                else {
                    rs(false);
                }
            }
        });
    })
};

carddone.cards.loadArchivedCards = function(host){
    return new Promise(function(rs){
        var lists = host.database.lists.items.map(function(elt){
            return elt.id;
        });
        ModalElement.show_loading();
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "card_load_archived_data"},
                {name: "lists", value: EncodingClass.string.fromVariable(lists)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        var count = 0;
                        host.currentCardData = host.database.cards.items;
                        host.database.cards.items = content;
                        contentModule.makeCardIndex(host);
                        if (content.length > 0){
                            content.forEach(function(elt){
                                if (!data_module.cardList[elt.id]){
                                    data_module.cardList[elt.id] = {
                                        heapIndex: data_module.pendingData.length,
                                        archived: 1
                                    };
                                    data_module.pendingData.push({
                                        type: "card",
                                        archived: 1,
                                        id: elt.id,
                                        boardid: host.boardContent.id,
                                        onLoad: [],
                                        isLoaded: false
                                    });
                                    count++;
                                }
                            });
                            var t = new Date();
                            t = t.getTime();
                            data_module.dataManager[t] = {
                                startIndex: data_module.pendingData.length - count,
                                endIndex: data_module.pendingData.length
                            };
                            data_module.boardArray.push(t);
                            data_module.boardActive = t;
                        }
                        var cards = content.map(function(elt){
                            return {
                                archived: 1,
                                id: elt.id,
                                name: elt.name,
                                userid: elt.userid,
                                parentid: elt.parentid,
                                lindex: elt.lindex,
                                editMode: 'edit',
                                editFunc: function(parentid, id){
                                    return function(){
                                        if (data_module.cardList[id].content){
                                            carddone.cards.prevEditCard(host, parentid, id, "view");
                                        }
                                        else {
                                            data_module.pendingData[data_module.cardList[id].heapIndex].onLoad.push(function(){
                                                carddone.cards.prevEditCard(host, parentid, id, "view");
                                            });
                                            data_module.dataManager[-100] = {
                                                startIndex: data_module.cardList[id].heapIndex,
                                                endIndex: data_module.cardList[id].heapIndex + 1
                                            };
                                            data_module.boardArray.push(-100);
                                            data_module.boardActive = -100;
                                        }
                                    }
                                }(elt.parentid, elt.id),
                                deleteFunc: function(id){
                                    return function(){
                                        return carddone.cards.deleteCardFromArchived(host, id);
                                    }
                                }(elt.id),
                                restoreFunc: function(id){
                                    return function(){
                                        return carddone.cards.restoreCard(host, id);
                                    }
                                }(elt.id)
                            }
                        });
                        rs(cards);
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
                        host.database.cards.items = host.database.cards.items.filter(function(elt){
                            return cards.indexOf(elt.id) == -1;
                        });
                        host.database.lists.items[index].childrenIdList = [];
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
                {value: max, name: "max"},
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
                        rs(host.database.lists.items[pIndex].childrenIdList.length);
                    }
                    else if (message == "knowledge") {
                        ModalElement.alert({message: LanguageModule.text("war_can_not_delete_card_because_knowledge_of_card")});
                        rs(-1);
                    }
                    else {
                        ModalElement.alert({message: message});
                        rs(-1);
                    }
                }
                else {
                    ModalElement.alert({message: message});
                    rs(-1);
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
                {value: max, name: "max"},
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
                        rs(host.database.lists.items[pIndex].childrenIdList.length);
                    }
                    else {
                        console.log(message);
                        rs(-1);
                    }
                }
                else {
                    console.log(message);
                    rs(-1);
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
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "card_move_load_data"}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        for (var i = 0; i < content.boards.length; i++){
                            content.boards[i].lists = [];
                        }
                        content.boards.getIndex = function(id){
                            for (var i = 0; i < content.boards.length; i++){
                                if (content.boards[i].id == id) return i;
                            }
                            return -1;
                        }
                        content.lists.getIndex = function(id){
                            for (var i = 0; i < content.lists.length; i++){
                                if (content.lists[i].id == id) return i;
                            }
                            return -1;
                        }
                        for (var i = 0; i < content.lists.length; i++){
                            var index = content.boards.getIndex(content.lists[i].parentid);
                            if (index != -1) content.lists[i].boardid = content.boards[index].id;
                        }
                        for (var i = 0; i < content.lists.length; i++){
                            var index = content.lists.getIndex(content.lists[i].parentid);
                            if (index != -1) {
                                content.boards[content.boards.getIndex(content.lists[index].boardid)].lists.push({value: content.lists[i].id, text: content.lists[i].name});
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

                        host.funcs.moveCard(list).then(function(value){
                            ModalElement.show_loading();
                            FormClass.api_call({
                                url: "card_move_save2.php",
                                params: [
                                    {value: id, name: "cardid"},
                                    {value: value.listid, name: "listid"},
                                    {value: max, name: "max"},
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
                                            rs(host.database.lists.items[pIndex].childrenIdList.length);
                                        }
                                        else {
                                            console.log(message);
                                            rs(-1);
                                        }
                                    }
                                    else {
                                        console.log(message);
                                        rs(-1);
                                    }
                                }
                            });
                        });

                    }
                    else {
                        ModalElement.alert({message: message});
                        rs(-1);
                    }
                }
                else {
                    ModalElement.alert({message: message});
                    rs(-1);
                }
            }
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
                        data_module.cardList[cardid].generateData.activitiesList = temp;
                        temp = host.database.cards.items[cIndex][activity].filter(function(elt){
                            return elt != id;
                        });
                        host.database.cards.items[cIndex][activity] = temp;
                        data_module.cardList[cardid].generateData[activity] = temp;
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
                            data_module.cardList[cardid].generateData.activitiesList.push(content.object.id);
                            host.database.cards.items[host.database.cards.getIndex(cardid)][activity.list].push(content.object.id);
                            data_module.cardList[cardid].generateData[activity.list].push(content.object.id);
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
                        data_module.cardList[cardid].content.values = host.database.values.items;
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
    FormClass.api_call({
        url: 'card_move_save.php',
        params: [
            {name: "parentid", value: listid},
            {name: "cardid", value: cardid},
            {name: "index", value: index},
            {name: "min", value: min + 1},
            {name: "max", value: max - 1},
            {name: "cardIncreaseIndex", value: EncodingClass.string.fromVariable(cardIncreaseIndex)},
            {name: "cardDecreaseIndex", value: EncodingClass.string.fromVariable(cardDecreaseIndex)}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    host.database.cards.items[host.database.cards.getIndex(cardid)].lindex = index;
                    cardIncreaseIndex.forEach(function(elt){
                        host.database.cards.items[host.database.cards.getIndex(elt)].lindex++;
                    });
                    cardDecreaseIndex.forEach(function(elt){
                        host.database.cards.items[host.database.cards.getIndex(elt)].lindex--;
                    });
                }
            }
        }
    });
};

carddone.cards.moveCardToOtherListSave = function(host, cardid, target, from, to, body){
    var parentid, oldIndex, newIndex, fromElt;
    var oldListId, cIndex, lindex, lindex2, cardDecreaseIndex, cardIncreaseIndex;
    var cardList = body.getAllBoards();
    parentid = target.ident;
    oldIndex = from.index;
    newIndex = to.index;
    fromElt = from.table.parentNode;
    cardDecreaseIndex = [];
    cardIncreaseIndex = [];
    cIndex = host.database.cards.getIndex(cardid);
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
    FormClass.api_call({
        url: 'card_move_save.php',
        params: [
            {name: "parentid", value: parentid},
            {name: "cardid", value: cardid},
            {name: "index", value: lindex},
            {name: "min", value: lindex + 1},
            {name: "max", value: host.database.lists.items[host.database.lists.getIndex(oldListId)].childrenIdList.length - 2},
            {name: "cardIncreaseIndex", value: EncodingClass.string.fromVariable(cardIncreaseIndex)},
            {name: "cardDecreaseIndex", value: EncodingClass.string.fromVariable(cardDecreaseIndex)}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var index = host.database.cards.getIndex(cardid);
                    var oldParentid = host.database.cards.items[index].parentid;
                    host.database.cards.items[index].parentid = parentid;
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
                }
            }
        }
    })
};

carddone.boards.editCardSave = function(host, id, value, listid, mode){
    return new Promise(function(rs){
        var contactInsert, contactDelete, companiesInsert, companiesDelete, contact_to_del, company_to_del, lindex, cardToUpdateIndex, oindex;
        cardToUpdateIndex = [];
        oindex = 0;
        if (id == 0){
            companiesDelete = [];
            contactDelete = [];
            contactInsert = value.contact;
            companiesInsert = value.companies;
            lindex = host.database.lists.items[host.database.lists.getIndex(value.stage)].childrenIdList.length;
        }
        else {
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
                    if (host.database.companies_card.items[i].hostid == id && host.database.companies_card.items[i].companyid == elt) return host.database.companies_card.items[i].id;
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
            {name: "objectid", value: value.objectid},
            {name: "lindex", value: lindex},
            {name: "oindex", value: oindex},
            {name: "stage", value: value.stage},
            {name: "important", value: value.important},
            {name: "knowledge", value: value.knowledge},
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
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0) {
                            content.data.boardid = host.boardContent.boardid;
                            host.database.cards.items.push(content.data);
                            host.database.lists.items[host.database.lists.getIndex(content.data.parentid)].childrenIdList.push(content.data.id);
                            var activitiesArray = ['activitiesList', 'callList', 'chatList', 'check_listList', 'fieldList', 'fileList', 'meetingList', 'noteList', 'taskList', 'waitList', 'contactList', 'companyList'];
                            activitiesArray.forEach(function(elt){
                                host.database.cards.items[host.database.cards.items.length - 1][elt] = [];
                            });
                            data_module.cardList[content.data.id] = {
                                heapIndex: data_module.pendingData.length
                            };
                            var onLoad = [
                                function(host, rs, content){
                                    return function(){
                                        carddone.cards.redraw(host, parseInt(host.userCombobox.value, 10)).then(function(singlePage){
                                            host.userCombobox = singlePage.userCombobox;
                                            host.frameList.removeChild(host.frameList.getAllChild()[0]);
                                            host.frameList.addChildBefore(singlePage, host.frameList.getAllChild()[0]);
											var cardid = content.data.id;
											var index = host.database.cards.getIndex(cardid);
											var parentid = content.data.parentid;
											var content1 = data_module.cardList[cardid].content;
											contentModule.makeDatabaseContent(host.database, content1);
											contentModule.makeChatData(host);
											contentModule.makeContactCardData(host);
											contentModule.makeCompaniesCardData(host);
											contentModule.makeCardActivitiesData(host);
											contentModule.makeAvatarUser(host);
											contentModule.makeChatCardIndex(host);
											data_module.cardList[cardid].generateData = {
												activitiesList: host.database.cards.items[index].activitiesList,
												callList: host.database.cards.items[index].callList,
												chatList: host.database.cards.items[index].chatList,
												check_listList: host.database.cards.items[index].check_listList,
												companyList: host.database.cards.items[index].companyList,
												contactList: host.database.cards.items[index].contactList,
												fieldList: host.database.cards.items[index].fieldList,
												fileList: host.database.cards.items[index].fileList,
												meetingList: host.database.cards.items[index].meetingList,
												noteList: host.database.cards.items[index].noteList,
												taskList: host.database.cards.items[index].taskList,
												waitList: host.database.cards.items[index].waitList
											};
                                            rs({
                                                cardid: cardid,
                                                listid: parentid
                                            });
                                        });
                                    }
                                }(host, rs, content)
                            ];
                            data_module.pendingData.push({
                                type: "card",
                                archived: 0,
                                id: content.data.id,
                                boardid: host.boardContent.id,
                                onLoad: onLoad,
                                isLoaded: false
                            });
                            data_module.dataManager[-1000] = {
                                startIndex: data_module.cardList[content.data.id].heapIndex,
                                endIndex: data_module.cardList[content.data.id].heapIndex + 1
                            };
                            data_module.boardArray.push(-1000);
                            data_module.boardActive = -1000;
                        }
                        else {
                            var index = host.database.cards.getIndex(id);
                            host.database.cards.items[index].name = content.data.name;
                            host.database.cards.items[index].parentid = content.data.parentid;
                            host.database.cards.items[index].important = content.data.important;
                            if (listid != value.stage){
                                var temp = host.database.lists.items[host.database.lists.getIndex(listid)].childrenIdList.filter(function(elt){
                                    return elt != id;
                                });
                                host.database.lists.items[host.database.lists.getIndex(listid)].childrenIdList = temp;
                                host.database.lists.items[host.database.lists.getIndex(value.stage)].childrenIdList.push(id);
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
                            host.database.companies_card.items = host.database.companies_card.items.filter(function(elt){
                                return companiesDelete.indexOf(elt.id) == -1;
                            });
                            host.database.contact_card.items = host.database.contact_card.items.concat(content.contact);
                            host.database.companies_card.items = host.database.companies_card.items.concat(content.companies);
                            data_module.cardList[id].generateData.contactList = host.database.cards.items[index].contactList;
                            data_module.cardList[id].generateData.companyList = host.database.cards.items[index].companyList;
                            data_module.cardList[id].content.contact_card = host.database.contact_card.items;
                            data_module.cardList[id].content.companies_card = host.database.companies_card.items;
                            for (var i = 0; i < host.database.knowledge.items.length; i++){
                                if (host.database.knowledge.items[i].cardid == id){
                                    host.database.knowledge.items[i].available = value.knowledge;
                                    break;
                                }
                            }
                            carddone.cards.redraw(host, parseInt(host.userCombobox.value, 10)).then(function(singlePage){
                                host.userCombobox = singlePage.userCombobox;
                                host.frameList.removeChild(host.frameList.getAllChild()[0]);
                                host.frameList.addChildBefore(singlePage, host.frameList.getAllChild()[0]);
                                rs({
                                    cardid: content.data.id,
                                    listid: value.stage
                                });
                            });
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
    singlePage = host.funcs.cardAddCheckListForm({
        id: id,
        cardid: cardid,
        users: host.database.users,
        typelists: host.database.typelists,
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
                users: host.database.users
            },
            funcs: host.funcs,
            listValueId: []
        }),
        editCheckListFunc: function(cardid, id){
            carddone.cards.addCheckListForm(host, cardid, id);
        }
    });
    while (host.frameList.getLength() > 2){
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
    singlePage = host.funcs.cardAddWaitForm({
        id: id,
        cardid: cardid,
        users: host.database.users,
        typelists: host.database.typelists,
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
                users: host.database.users
            },
            funcs: host.funcs,
            listValueId: []
        }),
        editWaitFunc: function(cardid, id){
            carddone.cards.addWaitForm(host, cardid, id);
        }
    });
    while(host.frameList.getLength() > 2){
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
    singlePage = host.funcs.cardAddCallForm({
        id: id,
        cardid: cardid,
        users: host.database.users,
        typelists: host.database.typelists,
        values: host.database.values,
        objects: host.database.objects,
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
                users: host.database.users
            },
            funcs: host.funcs,
            listValueId: []
        }),
        editCallFunc: function(cardid, id){
            carddone.cards.addCallForm(host, cardid, id);
        }
    });
    while(host.frameList.getLength() > 2){
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
    singlePage = host.funcs.cardAddTaskForm({
        id: id,
        cardid: cardid,
        users: host.database.users,
        typelists: host.database.typelists,
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
                users: host.database.users
            },
            funcs: host.funcs,
            listValueId: []
        }),
        editTaskFunc: function(cardid, id){
            carddone.cards.addTaskForm(host, cardid, id);
        }
    });
    while(host.frameList.getLength() > 2){
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
    singlePage = host.funcs.cardAddMeetingForm({
        id: id,
        cardid: cardid,
        users: host.database.users,
        typelists: host.database.typelists,
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
                users: host.database.users
            },
            funcs: host.funcs,
            listValueId: []
        }),
        editMeetingFunc: function(cardid, id){
            carddone.cards.addMeetingForm(host, cardid, id);
        }
    });
    while(host.frameList.getLength() > 2){
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
    singlePage = host.funcs.cardAddNoteForm({
        id: id,
        cardid: cardid,
        users: host.database.users,
        typelists: host.database.typelists,
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
                users: host.database.users
            },
            funcs: host.funcs,
            listValueId: []
        }),
        editNoteFunc: function(cardid, id){
            carddone.cards.addNoteForm(host, cardid, id);
        }
    });
    while(host.frameList.getLength() > 2){
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
                        data_module.cardList[cardid].content.knowledge = host.database.knowledge.items;
                        data_module.cardList[cardid].content.knowledge_group_link = host.database.knowledge_group_link.items;
                        resolve(knowledgeid);
                        if (typesubmit == 0){
                            carddone.cards.knowledgeEdit(host, cardid);
                        }
                        else {
                            while (host.frameList.getLength() > 2){
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
                while (host.frameList.getLength() > 2){
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
            knowledge_groups: host.database.knowledge_groups
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
                                data_module.cardList[cardid].generateData.activitiesList = temp;
                                temp = host.database.cards.items[cIndex]["fileList"].filter(function(elt){
                                    return elt != fileData.id;
                                });
                                host.database.cards.items[cIndex]["fileList"] = temp;
                                data_module.cardList[cardid].generateData["fileList"] = temp;
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
                                    userIndex = host.database.users.getByhomeid(systemconfig.userid);
                                    dataFile.avatar = host.database.users.items[userIndex].avatarSrc;
                                    dataFile.userName = host.database.users.items[userIndex].fullname;
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
                            for (var j = 0; j < objects.length; j++){
                                data_module.cardList[cardid].generateData.fileList.push(objects[j].id);
                                data_module.cardList[cardid].content.objects.push(objects[j]);
                                data_module.cardList[cardid].generateData.activitiesList.push(objects[j].id);
                            }
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
    var privAdmin = false;
    for (var i = 0; i < host.database.list_member.items.length; i++){
        if (host.database.list_member.items[i].userid == systemconfig.userid){
            if (host.database.list_member.items[i].permission == 1) privAdmin = true;
            break;
        }
    }
    var singlePage = host.funcs.cardAddFileForm({
        privAdmin: privAdmin,
        userid: systemconfig.userid,
        imagesList: host.imagesList,
        cmdButton: cmdButton,
        type: type,
        cardid: cardid,
        users: host.database.users,
        fileList: fileList,
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
    while(host.frameList.getLength() > 2){
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
    singlePage = host.funcs.cardAddFieldForm({
        id: id,
        fieldList: fieldList,
        valueid: id > 0 ? host.database.objects.items[host.database.objects.getIndex(id)].valueid : 0,
        cardid: cardid,
        funcs: host.funcs,
        users: host.database.users,
        nations: host.database.nations,
        cities: host.database.cities,
        typelists: host.database.typelists,
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
                users: host.database.users
            },
            funcs: host.funcs,
            listValueId: []
        }),
        editFieldFunc: function(cardid, id){
            carddone.cards.addFieldForm(host, cardid, id);
        }
    });
    while(host.frameList.getLength() > 2){
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
            carddone.cards.editCard(host, listId, id, editMode);
        }
        else {
            var index = host.database.cards.getIndex(id);
            var parentid = host.database.cards.items[index].parentid;
            if (!data_module.cardList[id].content) return;
            var content = data_module.cardList[id].content;
            contentModule.makeDatabaseContent(host.database, content);
            if (!data_module.cardList[id].generateData){
                contentModule.makeChatData(host);
                contentModule.makeContactCardData(host);
                contentModule.makeCompaniesCardData(host);
                contentModule.makeCardActivitiesData(host);
                contentModule.makeAvatarUser(host);
                contentModule.makeChatCardIndex(host);
                data_module.cardList[id].generateData = {
                    activitiesList: host.database.cards.items[index].activitiesList,
                    callList: host.database.cards.items[index].callList,
                    chatList: host.database.cards.items[index].chatList,
                    check_listList: host.database.cards.items[index].check_listList,
                    companyList: host.database.cards.items[index].companyList,
                    contactList: host.database.cards.items[index].contactList,
                    fieldList: host.database.cards.items[index].fieldList,
                    fileList: host.database.cards.items[index].fileList,
                    meetingList: host.database.cards.items[index].meetingList,
                    noteList: host.database.cards.items[index].noteList,
                    taskList: host.database.cards.items[index].taskList,
                    waitList: host.database.cards.items[index].waitList
                };
            }
            else {
                var keys = Object.keys(data_module.cardList[id].generateData);
                keys.forEach(function(elt){
                    host.database.cards.items[index][elt] = data_module.cardList[id].generateData[elt];
                });
            }
            carddone.cards.editCard(host, parentid, id, editMode);
            rs();
        }
    });
};

carddone.cards.editCard = function(host, listId, id, editMode){
    var index, name, objectId, objectList, important, createdtime, username, contactList, companyList, activitiesList, editMode;
    var params, cmdButton, valuesList, typelists, object_type, lists, singlePage, contact, companies, company_class, cities, nations, users, activities;
    var knowledgeActive;
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
                carddone.boards.editCardSave(host, id, value, listId, 0).then(function(value){
                    id = value.cardid;
                    listId = value.listid;
                    rs(true);
                });
            });
        },
        saveClose: function () {
            var value = singlePage.getValue();
            if (!value) return;
            carddone.boards.editCardSave(host, id, value, listId, 1).then(function(value){
                host.frameList.removeLast();
            });
        }
    };
    host.imagesList = [];
    host.filesList = [];
    var knowledgeid = 0;
    if (id == 0){
        name = "";
        objectId = 0;
        important = 0;
        username = "";
        contactList = [];
        companyList = [];
        activitiesList = [];
        knowledgeActive = false;
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
        for (var i = 0; i < host.database.users.items.length; i++){
            if (host.database.cards.items[index].userid == host.database.users.items[i].homeid) {
                username = host.database.users.items[i].username;
                break;
            }
        }
        createdtime = host.database.cards.items[index].createdtime;
        contactList = host.database.cards.items[index].contactList;
        companyList = host.database.cards.items[index].companyList;
        activitiesList = host.database.cards.items[index].activitiesList;
        // for (var i = 0; i < host.database.list_member.items.length; i++){
        //     if (host.database.list_member.items[i].userid == systemconfig.userid) {
        //         if (host.database.list_member.items[i].type > 0) editMode = 'edit';
        //         else {
        //             if (host.database.boards.items[0].permission == 1) {
        //                 if (host.database.cards.items[index].userid == systemconfig.userid) editMode = 'edit';
        //                 else editMode = "view";
        //             }
        //             else editMode = "edit";
        //         }
        //         break;
        //     }
        // }
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
    editMode = editMode;
    for (var i = 0; i < host.imagesList.length; i++){
        userIndex = host.database.users.getByhomeid(host.imagesList[i].userid);
        host.imagesList[i].avatar = host.database.users.items[userIndex].avatarSrc;
        host.imagesList[i].userName = host.database.users.items[userIndex].fullname;
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
    objectList = host.database.objects;
    valuesList = host.database.values;
    typelists = host.database.typelists;
    contact = host.database.contact;
    companies = host.database.companies;
    cities = host.database.cities;
    nations = host.database.nations;
    users = host.database.users;
    company_class = host.database.company_class;
    var chat_content = [];
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
                    index: chat_content.length,
                    time: host.database.chat_sessions.items[0].content[i].m_time,
                    listChat: []
                };
                chat_content.push(chatGroup);
            }
            chatGroup.listChat.push(host.database.chat_sessions.items[0].content[i]);
        }
    }
    console.log(chat_content);
    lists = [];
    for (var i = 0; i < host.database.lists.items.length; i++){
        if (host.database.lists.items[i].type2 == "group") continue;
        lists.push({
            value: host.database.lists.items[i].id,
            text: host.database.lists.items[i].name
        });
    }
    if (host.object_of_board) object_type = host.database.typelists.items[host.database.typelists.getIndex(host.typeid)].content.details;
    else object_type = [];
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
                carddone.cards.addFileForm(host, id, [], "new");
            }
        },
        {
            src1: 'icons/chat.png',
            src2: 'icons/chat_disabled.png',
            text: LanguageModule.text("txt_chat"),
            click: function(){
                if (editMode == 'view') return;
                if (id == 0) return;
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
        }
    ];
    params = {
        cardid: id,
        frameList: host.frameList,
        editMode: editMode,
        activitiesOfCard: activitiesList,
        activities: activities,
        contact: contact,
        companies: companies,
        company_class: company_class,
        contactOfCard: contactList,
        companyOfCard: companyList,
        stage: listId,
        cmdButton: cmdButton,
        name: name,
        objectId: objectId,
        objectList: objectList,
        valuesList: valuesList,
        typelists: typelists,
        lists: lists,
        objects: host.database.objects,
        values: host.database.values,
        object_of_board: host.object_of_board,
        object_type: object_type,
        allFiles: host.allFiles,
        imagesList: host.imagesList,
        chat_content: chat_content,
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
        cities: cities,
        nations: nations,
        users: users,
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
            funcs: host.funcs,
            listValueId: []
        }),
        editActivitiesFunc: {
            editTaskFunc: function(cardid, id){
                if (editMode == 'view') return;
                carddone.cards.addTaskForm(host, cardid, id);
            },
            editMeetingFunc: function(cardid, id){
                if (editMode == 'view') return;
                carddone.cards.addMeetingForm(host, cardid, id);
            },
            editCallFunc: function(cardid, id){
                if (editMode == 'view') return;
                carddone.cards.addCallForm(host, cardid, id);
            },
            editWaitFunc: function(cardid, id){
                if (editMode == 'view') return;
                carddone.cards.addWaitForm(host, cardid, id);
            },
            editNoteFunc: function(cardid, id){
                if (editMode == 'view') return;
                carddone.cards.addNoteForm(host, cardid, id);
            },
            editCheckListFunc: function(cardid, id){
                if (editMode == 'view') return;
                carddone.cards.addCheckListForm(host, cardid, id);
            },
            editFieldFunc: function(cardid, id){
                if (editMode == 'view') return;
                carddone.cards.addFieldForm(host, cardid, id);
            },
            editFileFunc: function(cardid, fileList){
                if (editMode == 'view') return;
                carddone.cards.addFileForm(host, cardid, fileList, "edit");
            },
            editChatFunc: function(){
                if (editMode == 'view') return;
                carddone.menu.loadPage(7, id);
            }
        }
    };
    singlePage = host.funcs.cardEditForm(params);
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.cards.redraw = function(host, userid){
    return new Promise(function(rs){
        var list = [], cardIdList, memberList;
        memberList = host.database.list_member.items.map(function(elt){
            return elt.userid;
        });
        for (var i = 0; i < host.database.lists.items.length; i++){
            if (host.database.lists.items[i].type2 == "group") continue;
            var decoration = EncodingClass.string.toVariable(host.database.lists.items[i].decoration);
            if ((host.database.boards.items[0].userid != systemconfig.userid) && (host.database.boards.items[0].permission == 0)){
                var list_member_index;
                for (var j = 0; j < host.database.list_member.items.length; j++){
                    if (host.database.list_member.items[j].userid == systemconfig.userid) list_member_index = j;
                }
                if (host.database.list_member.items[list_member_index].type == 0) {
                    cardIdList = host.database.lists.items[i].childrenIdList.filter(function(elt){
                        var cIndex = host.database.cards.getIndex(elt);
                        return host.database.cards.items[cIndex].userid == systemconfig.userid;
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
                if (memberList.indexOf(host.database.cards.items[cIndex].userid) == -1) memberList.push(host.database.cards.items[cIndex].userid);
                for (var i = 0; i < host.database.list_member.items.length; i++){
                    if (host.database.list_member.items[i].userid == systemconfig.userid) {
                        if (host.database.list_member.items[i].type > 0) editMode = 'edit';
                        else {
                            if (host.database.boards.items[0].permission == 1) {
                                if (host.database.cards.items[cIndex].userid == systemconfig.userid) editMode = 'edit';
                                else editMode = "view";
                            }
                            else editMode = "edit";
                        }
                        break;
                    }
                }
                cards.push({
                    id: host.database.cards.items[cIndex].id,
                    name: host.database.cards.items[cIndex].name,
                    userid: host.database.cards.items[cIndex].userid,
                    parentid: host.database.cards.items[cIndex].parentid,
                    lindex: host.database.cards.items[cIndex].lindex,
                    editMode: editMode,
                    editFunc: function(parentid, id, editMode){
                        return function(){
                            if (data_module.cardList[id].content){
                                carddone.cards.prevEditCard(host, parentid, id, editMode);
                            }
                            else {
                                data_module.pendingData[data_module.cardList[id].heapIndex].onLoad.push(function(){
                                    carddone.cards.prevEditCard(host, parentid, id, editMode);
                                });
                                data_module.dataManager[-100] = {
                                    startIndex: data_module.cardList[id].heapIndex,
                                    endIndex: data_module.cardList[id].heapIndex + 1
                                };
                                data_module.boardArray.push(-100);
                                data_module.boardActive = -100;
                            }
                        }
                    }(host.database.cards.items[cIndex].parentid, host.database.cards.items[cIndex].id, editMode),
                    deleteFunc: function(id){
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
                    }(host.database.cards.items[cIndex].id)
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
                        carddone.cards.moveCardToOtherListSave(host, event.item.ident, event.target, event.from, event.to, event.to.table);
                    }
                }(host),
                orderchange: function(host){
                    return function(event){
                        carddone.cards.moveCardSave(host, event.boardElt, event.$body, event.target.ident, event.from, event.to);
                    }
                }(host),
                archiveAllCardInListFunc: function(host, id){
                    return function(){
                        return carddone.cards.archiveAllCardInListFunc(host, id);
                    }
                }(host, host.database.lists.items[i].id)
            });
        }
        var count = 0, index = 0;
        while (list.some(function(elt){
            return (elt.cards[index]);
        })){
            list.forEach(function(elt){
                if (elt.cards[index]) {
                    if (!data_module.cardList[elt.cards[index].id]){
                        data_module.cardList[elt.cards[index].id] = {
                            heapIndex: data_module.pendingData.length,
                            archived: 0
                        };
                        data_module.pendingData.push({
                            type: "card",
                            archived: 0,
                            id: elt.cards[index].id,
                            boardid: host.boardContent.id,
                            onLoad: [],
                            isLoaded: false
                        });
                        count++;
                    }
                }
            });
            index++;
        }
        if (count > 0){
            data_module.dataManager[host.boardContent.id] = {
                startIndex: data_module.pendingData.length - count,
                endIndex: data_module.pendingData.length
            };
            data_module.boardArray.push(host.boardContent.id);
            data_module.boardActive = host.boardContent.id;
        }
        memberList = memberList.map(function(elt){
            var index = data_module.users.getByhomeid(elt);
            return {
                value: elt,
                text: data_module.users.items[index].username + " - " + data_module.users.items[index].fullname
            };
        });
        memberList.sort(function(a, b){
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return 1;
            return 0;
        });
        memberList.unshift({value: 0, text: LanguageModule.text("txt_all")});
        var singlePage = host.funcs.cardInitForm({
            cmdButton: {
                close: function () {
                    if (carddone.isMobile){
                        host.holder.selfRemove();
                        carddone.menu.loadPage(100);
                    }
                    else {
                        carddone.menu.tabPanel.removeTab(host.holder.id);
                    }
                },
                viewArchived: function(){
                    return carddone.cards.loadArchivedCards(host);
                },
                viewCurrent: function(){
                    host.database.cards.items = host.currentCardData;
                    carddone.cards.redraw(host, 0).then(function(singlePage){
                        host.userCombobox = singlePage.userCombobox;
                        host.frameList.removeLast();
                        host.frameList.addChild(singlePage);
                        singlePage.requestActive();
                    });
                }
            },
            content: list,
            memberList: memberList,
            userid: userid,
            boardName: host.boardContent.name,
            frameList: host.frameList

        });
        rs(singlePage);
    });
};

carddone.cards.init = function(host, boardId){
    return new Promise(function(rs){
        if (!data_module.typelists
            || !data_module.companies
            || !data_module.contact
            || !data_module.company_class
            || !data_module.nations
            || !data_module.cities
            || !data_module.users
        ) {
            setTimeout(function(){
                carddone.cards.init(host, boardId);
            }, 50);
            for (var i = 0; i < ModalElement.layerstatus.length; i++){
                if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
            }
            return;
        }
        contentModule.makeCitiesIndex();
        contentModule.makeDistrictsIndex();
        contentModule.makeCompanyIndex();
        contentModule.makeContactIndex(); //thanhyen
        host.boardId = boardId;
        host.database = {};
        host.holder.addChild(host.frameList);
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "board_load_board_content"},
                {name: "boardid", value: boardId}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        contentModule.makeDatabaseContent(host.database, content);
                        host.database.users.getByhomeid = function(homeid){
                            for (var i = 0; i < host.database.users.items.length; i++){
                                if (host.database.users.items[i].homeid == homeid) return i;
                            }
                            return -1;
                        };
                        contentModule.makeListsIndex(host);
                        contentModule.makeListsIndex2(host);
                        contentModule.makeCardIndex(host);
                        host.boardContent = host.database.boards.items[0];
                        host.holder.name = host.boardContent.name;
                        host.object_of_board = host.database.boards.items[0].typeid != 0;
                        host.typeid = host.database.boards.items[0].typeid;
                        host.database.typelists = data_module.typelists;
                        host.database.companies = data_module.companies;
                        host.database.contact = data_module.contact;
                        host.database.company_class = data_module.company_class;
                        host.database.nations = data_module.nations;
                        host.database.cities = data_module.cities;
                        contentModule.makeField_list(host);
                        contentModule.makeCitiesIndex(host);
                        contentModule.makeKnowledgeGroupIndex(host);
                        host.holder.boardid = host.boardContent.id;
                        host.boardContent.decoration = EncodingClass.string.toVariable(host.boardContent.decoration);
                        // if (host.boardContent.decoration.selection == "color"){
                        //     host.holder.addStyle("backgroundColor", "#" + host.boardContent.decoration.color);
                        // }
                        // else {
                        //     host.holder.addStyle("backgroundImage", "url('" + window.domain + host.boardContent.decoration.picture + "')");
                        //     host.holder.addStyle("backgroundSize", "cover");
                        //     host.holder.addStyle("backgroundRepeat", "no-repeat");
                        //     host.holder.addStyle("backgroundPosition", "center");
                        //     host.holder.addStyle("backgroundAttachment", "fixed");
                        // }
                        carddone.cards.redraw(host, 0).then(function(singlePage){
                            host.userCombobox = singlePage.userCombobox;
                            host.frameList.addChild(singlePage);
                            singlePage.requestActive();
                            rs();
                        });
                    }
                    else {
                        console.log(message);
                        ModalElement.alert({message: message});
                        return;
                    }
                }
                else {
                    console.log(message);
                    ModalElement.alert({message: message});
                    return;
                }
            }
        });
    });
};

ModuleManagerClass.register({
    name: "Cards",
    prerequisites: ["ModalElement", "FormClass"]
});
