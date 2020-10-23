'use strict';

carddone.boards.sortAscending = function(host, groupid, callbackFunc){
    var index = host.database.board_groups.getIndex(groupid);
    var dict = {};
    for (var i = 0; i < host.database.boards.items.length; i++){
        dict[host.database.boards.items[i].id] = absol.string.nonAccentVietnamese(host.database.boards.items[i].name).toLowerCase();
    }
    var g_dict = {};
    for (var i = 0; i < host.database.board_group_link.items.length; i++){
        if (host.database.board_group_link.items[i].groupid != groupid) continue;
        g_dict[host.database.board_group_link.items[i].boardid] = host.database.board_group_link.items[i].id;
    }
    host.database.board_groups.items[index].boardIdList.sort(function(a, b){
        var aIndex, bIndex;
        if (dict[a] > dict[b]) return -1;
        if (dict[a] < dict[b]) return 1;
        return 0;
    });
    var data = host.database.board_groups.items[index].boardIdList.map(function(elt){
        return g_dict[elt];
    });
    var is_system;
    for (var i = 0; i < host.privItems.listPriviledgeOfBoard.length; i++){
        if (host.privItems.listPriviledgeOfBoard[i].is_system == 1){
            is_system = host.privItems.listPriviledgeOfBoard[i].value;
            break;
        }
    }
    var privDict = {};
    for (var i = 0; i < host.database.list_member.items.length; i++){
        if (host.database.list_member.items[i].userid == systemconfig.userid){
            privDict[host.database.list_member.items[i].listid] = host.database.list_member.items[i].type;
        }
    }
    var account_groupsDict = {};
    for (var i = 0; i < host.database.account_groups.items.length; i++){
        account_groupsDict[host.database.account_groups.items[i].id] = host.database.account_groups.items[i].privOfBoard;
    }
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "board_sort_ascending_save.php",
            params: [
                {name: "idList", value: EncodingClass.string.fromVariable(data)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var dict = {};
                        for (var i = 0; i < host.database.board_group_link.items.length; i++){
                            dict[host.database.board_group_link.items[i].id] = i;
                        }
                        data.forEach(function(elt, index){
                            host.database.board_group_link.items[dict[elt]].index = index;
                        });
                        contentModule.makeBoardGroupLinkIndex(host);
                        dbcache.refresh("board_group_link");
                        var boards = [];
                        for (var i = 0; i < host.database.boards.items.length; i++){
                            if (host.database.boards.items[i].groupid == groupid){
                                boards.push({
                                    id: host.database.boards.items[i].id,
                                    name: host.database.boards.items[i].name,
                                    index: host.database.boards.items[i].index,
                                    formatid: host.database.boards.items[i].formatid,
                                    isAdmin: privDict[host.database.boards.items[i].id] == is_system,
                                    description: "",
                                    priv: account_groupsDict[privDict[host.database.boards.items[i].id]],
                                    editFunc: function(id, groupid){
                                        return function(){
                                            carddone.boards.editBoard(host, groupid, id);
                                        }
                                    }(host.database.boards.items[i].id, host.database.boards.items[i].groupid),
                                    openCardManager: function(id){
                                        return function(){
                                            if (carddone.isMobile) carddone.menu.loadPage(11, {boardid: id, frameList: host.frameList, holder: host.holder, isMobile: true});
                                            else carddone.menu.loadPage(11, {boardid: id});
                                        }
                                    }(host.database.boards.items[i].id),
                                    makeMasterBoard: function(id){
                                        return function(){
                                            carddone.boards.makeMasterBoard(host, id);
                                        }
                                    }(host.database.boards.items[i].id),
                                    deleteBoard: function(id, groupid, index){
                                        return function(){
                                            return carddone.boards.deleteBoard(host, id, groupid, index);
                                        }
                                    }(host.database.boards.items[i].id, host.database.boards.items[i].groupid, host.database.boards.items[i].index),
                                    archiveBoard: function(id, groupid, index){
                                        return function(){
                                            return carddone.boards.archiveBoard(host, id, groupid, index);
                                        }
                                    }(host.database.boards.items[i].id, host.database.boards.items[i].groupid, host.database.boards.items[i].index),
                                    restoreBoard: function(id, groupid, index){
                                        return function(){
                                            return carddone.boards.restoreBoard(host, id, groupid, index);
                                        }
                                    }(host.database.boards.items[i].id, host.database.boards.items[i].groupid, host.database.boards.items[i].index)
                                });
                            }
                        }
                        boards.sort(function(a, b){
                            if (a.index > b.index) return -1;
                            if (a.index < b.index) return 1;
                            return 0;
                        });
                        rs(boards);
                        // carddone.boards.redraw(host).then(function(singlePage){
                        //     host.board_container.clearChild();
                        //     host.board_container.addChild(singlePage);
                        // });
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

carddone.boards.groupChangeOrder = function(host, groupid, from, to){
    var cIndex;
    var increaseIdList = [];
    var decreaseIdList = [];
    var increaseIndexList = [];
    var decreaseIndexList = [];
    host.database.board_groups.items.sort(function(a, b){
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
    });
    for (var i = 0; i < host.database.board_groups.items.length; i++){
        if (host.database.board_groups.items[i].id == groupid) {
            cIndex = i;
        }
        if (from > to){
            if (host.database.board_groups.items[i].gindex >= to && host.database.board_groups.items[i].gindex < from) {
                increaseIdList.push(host.database.board_groups.items[i].id);
                increaseIndexList.push(i);
            }
        }
        else {
            if (host.database.board_groups.items[i].gindex > from && host.database.board_groups.items[i].gindex <= to) {
                decreaseIdList.push(host.database.board_groups.items[i].id);
                decreaseIndexList.push(i);
            }
        }
    }
    decreaseIdList.reverse();
    decreaseIndexList.reverse();
    ModalElement.show_loading();
    FormClass.api_call({
        url: "board_group_change_order_save.php",
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
                    host.database.board_groups.items[cIndex].gindex = to;
                    if (from > to){
                        increaseIndexList.forEach(function(elt){
                            host.database.board_groups.items[elt].gindex++;
                        });
                    }
                    else {
                        decreaseIndexList.forEach(function(elt){
                            host.database.board_groups.items[elt].gindex--;
                        });
                    }
                    dbcache.refresh("board_groups");
                    contentModule.makeBoardGroupLinkIndex(host);
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

carddone.boards.deleteGroup = function(host, id, index){
    var decreaseIdList = [];
    var decreaseIndexList = [];
    var max = 0;
    host.database.board_groups.items.sort(function(a, b){
        if (a.gindex > b.gindex) return -1;
        if (a.gindex < b.gindex) return 1;
        return 0;
    })
    for (var i = 0; i < host.database.board_groups.items.length; i++){
        if (host.database.board_groups.items[i].gindex > index) {
            if (max < host.database.board_groups.items[i].gindex) max = host.database.board_groups.items[i].gindex;
            decreaseIdList.push(host.database.board_groups.items[i].id);
            decreaseIndexList.push(i);
        }
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "board_delete_group_save.php",
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
                        host.database.board_groups.items[elt].gindex = --max;
                    });
                    var index = host.database.board_groups.getIndex(id);
                    host.database.board_groups.items.splice(index, 1);
                    host.database.board_group_link.items = host.database.board_group_link.items.filter(function(elt){
                        if (elt.groupid == id){
                            var bIndex = host.database.boards.getIndex(elt.boardid);
                            if (bIndex < 0) return false;
                            host.database.boards.items[bIndex].groupid = undefined;
                            host.database.boards.items[bIndex].groupIndex = undefined;
                            host.database.boards.items[bIndex].index = undefined;
                            return false;
                        }
                        return true;
                    });
                    contentModule.makeBoardGroupLinkIndex(host);
                    dbcache.refresh("board_groups");
                    dbcache.refresh("board_group_link");
                    carddone.boards.redraw(host).then(function(singlePage){
                        host.board_container.clearChild();
                        host.board_container.addChild(singlePage);
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

carddone.boards.changeOrder = function(host, groupid, boardid, from, to){
    var cIndex, cId;
    var count = host.database.board_groups.items[host.database.board_groups.getIndex(groupid)].boardIdList.length;
    from = count - from - 1;
    to = count - to - 1;
    var increaseIdList = [];
    var decreaseIdList = [];
    var increaseIndexList = [];
    var decreaseIndexList = [];
    host.database.board_group_link.items.sort(function(a, b){
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
    });
    for (var i = 0; i < host.database.board_group_link.items.length; i++){
        if (host.database.board_group_link.items[i].groupid != groupid) continue;
        if (host.database.board_group_link.items[i].groupid == groupid && host.database.board_group_link.items[i].boardid == boardid) {
            cIndex = i;
            cId = host.database.board_group_link.items[i].id;
        }
        if (from > to){
            if (host.database.board_group_link.items[i].index >= to && host.database.board_group_link.items[i].index < from) {
                increaseIdList.push(host.database.board_group_link.items[i].id);
                increaseIndexList.push(i);
            }
        }
        else {
            if (host.database.board_group_link.items[i].index > from && host.database.board_group_link.items[i].index <= to) {
                decreaseIdList.push(host.database.board_group_link.items[i].id);
                decreaseIndexList.push(i);
            }
        }
    }
    decreaseIdList.reverse();
    decreaseIndexList.reverse();
    ModalElement.show_loading();
    FormClass.api_call({
        url: "board_change_order_save.php",
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
                    host.database.boards.items[host.database.boards.getIndex(boardid)].index = to;
                    host.database.board_group_link.items[cIndex].index = to;
                    if (from > to){
                        increaseIndexList.forEach(function(elt){
                            host.database.board_group_link.items[elt].index++;
                        });
                    }
                    else {
                        decreaseIndexList.forEach(function(elt){
                            host.database.board_group_link.items[elt].index--;
                        });
                    }
                    dbcache.refresh("board_group_link");
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

carddone.boards.changeGroup = function(host, boardid, from, to){
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
        count = host.database.board_groups.items[host.database.board_groups.getIndex(oldGroup)].boardIdList.length;
        oldIndex = count - oldIndex - 1;
    }
    if (newGroup != 0){
        count = host.database.board_groups.items[host.database.board_groups.getIndex(newGroup)].boardIdList.length;
        newIndex = count - newIndex;
    }
    host.database.board_group_link.items.sort(function(a, b){
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
    });
    max = 0;
    cId = -1;
    cIndex = -1;
    for (var i = 0; i < host.database.board_group_link.items.length; i++){
        if (host.database.board_group_link.items[i].groupid == oldGroup && host.database.board_group_link.items[i].boardid == boardid){
            cIndex = i;
            cId = host.database.board_group_link.items[i].id;
        }
        if (oldGroup != 0){
            if (host.database.board_group_link.items[i].groupid == oldGroup) {
                if (host.database.board_group_link.items[i].index > oldIndex) {
                    if (host.database.board_group_link.items[i].index > max) max = host.database.board_group_link.items[i].index;
                    decreaseIdList.push(host.database.board_group_link.items[i].id);
                    decreaseIndexList.push(i);
                }
            };
        }
        if (newGroup != 0) {
            if (host.database.board_group_link.items[i].groupid == newGroup) {
                if (host.database.board_group_link.items[i].index >= newIndex) {
                    increaseIdList.push(host.database.board_group_link.items[i].id);
                    increaseIndexList.push(i);
                }
            };
        }
    }
    decreaseIdList.reverse();
    decreaseIndexList.reverse();
    ModalElement.show_loading();
    FormClass.api_call({
        url: "board_change_group_save.php",
        params: [
            {name: "cId", value: cId},
            {name: "groupid", value: newGroup},
            {name: "boardid", value: boardid},
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
                        host.database.board_group_link.items[elt].index++;
                    });
                    decreaseIndexList.forEach(function(elt){
                        host.database.board_group_link.items[elt].index--;
                    });
                    if (cIndex != -1){
                        if (newGroup != 0) {
                            host.database.board_group_link.items[cIndex].index = newIndex;
                            host.database.board_group_link.items[cIndex].groupid = newGroup;
                        }
                        else host.database.board_group_link.items.splice(cIndex, 1);
                    }
                    else {
                        if (newGroup != 0) {
                            host.database.board_group_link.items.push(content);
                        }
                    }
                    if (newGroup != 0){
                        host.database.boards.items[host.database.boards.getIndex(boardid)].index = newIndex;
                        host.database.boards.items[host.database.boards.getIndex(boardid)].groupid = newGroup;
                        host.database.boards.items[host.database.boards.getIndex(boardid)].groupIndex = host.database.board_groups.getIndex(newGroup);
                        var gIndex = host.database.board_groups.getIndex(newGroup);
                        host.database.board_groups.items[gIndex].boardIdList.push(boardid);
                    }
                    else {
                        host.database.boards.items[host.database.boards.getIndex(boardid)].index = undefined;
                        host.database.boards.items[host.database.boards.getIndex(boardid)].groupid = undefined;
                        host.database.boards.items[host.database.boards.getIndex(boardid)].groupIndex = undefined;
                    }
                    if (oldGroup != 0){
                        var gIndex = host.database.board_groups.getIndex(oldGroup);
                        host.database.board_groups.items[gIndex].boardIdList = host.database.board_groups.items[gIndex].boardIdList.filter(function(elt){
                            return elt != boardid;
                        });
                    }
                    dbcache.refresh("board_group_link");
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

carddone.boards.addNewGroupSave = function(host, id, gindex, value){
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "board_groups_add_save.php",
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
                            content.boardIdList = [];
                            host.database.board_groups.items.push(content);
                        }
                        else {
                            var index = host.database.board_groups.getIndex(id);
                            host.database.board_groups.items[index].name = content.name;
                            host.database.board_groups.items[index].color = content.color;
                            host.database.board_groups.items[index].gindex = content.gindex;
                        }
                        dbcache.refresh("board_groups");
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

carddone.boards.loadArchivedBoard = function(host){
    ModalElement.show_loading();

    host.currentBoardData = {
        boards: host.database.boards,
        lists: host.database.lists,
        list_member: host.database.list_member,
        field_list: host.database.field_list,
        board_group_link: host.database.board_group_link
    };

    var propmiseList = {};
    propmiseList.list_member = data_module.loadByConditionAsync({
        name: "list_member",
        cond: function (record) {
            return record.userid == systemconfig.userid;
        },
        callback: function (retval) {
            var dict = {};
            retval.forEach(function(elt){
                dict[elt.listid] = 1;
            });
            return dict;
        }
    });

    propmiseList.boards = propmiseList.list_member.then(function(value){
        return data_module.loadByConditionAsync({
            name: "archived_lists",
            cond: function(record){
                return value[record.id] == 1;
            },
            callback: function (retval) {
                host.database.boards = data_module.makeDatabase(retval);
                var dict = {};
                host.database.boards.items.forEach(function(elt){
                    dict[elt.id] = 1;
                });
                return dict;
            }
        });
    });

    propmiseList.lists = propmiseList.boards.then(function(dict){
        return data_module.loadByConditionAsync({
            name: "archived_lists",
            cond: function (record) {
                return record.type == "list";
            },
            callback: function(dict){
                return function (retval) {
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
                            list.push(elt);
                        }
                    });
                    host.database.lists = data_module.makeDatabase(list);
                    return dict;
                }
            }(dict)
        });
    });

    propmiseList.field_list = propmiseList.boards.then(function(dict){
        return data_module.loadByConditionAsync({
            name: "field_list",
            cond: function(dict){
                return function (record) {
                    return dict[record.hostid];
                }
            }(dict),
            callback: function (retval) {
                host.database.field_list = data_module.makeDatabase(retval);
            }
        });
    });

    propmiseList.list_member2 = propmiseList.boards.then(function(dict){
        return data_module.loadByConditionAsync({
            name: "list_member",
            cond: function(dict){
                return function (record) {
                    return dict[record.listid];
                }
            }(dict),
            callback: function (retval) {
                host.database.list_member = data_module.makeDatabase(retval);
            }
        });
    });

    propmiseList.board_group_link = propmiseList.boards.then(function(dict){
        return data_module.loadByConditionAsync({
            name: "board_group_link",
            cond: function (record) {
                return (record.userid == systemconfig.userid && dict[record.boardid] == 1);
            },
            callback: function (retval) {
                host.database.board_group_link = data_module.makeDatabase(retval);
            }
        });
    });

    Promise.all([propmiseList.lists, propmiseList.field_list, propmiseList.list_member2, propmiseList.board_group_link]).then(function(){
        ModalElement.close(-1);
        contentModule.makeListsIndex(host);
        contentModule.makeListsIndex2(host);
        contentModule.makeField_list(host);
        contentModule.makeBoardMember(host);
        contentModule.makeBoardGroupLinkIndex(host);
        carddone.boards.redraw(host).then(function(singlePage){
            host.board_container.clearChild();
            host.board_container.addChild(singlePage);
        });
    });
};

carddone.boards.archiveBoard = function(host, id, groupid, index){
    var linkIdList, linkIndexList, count, dict, linkId, boardIdList;
    linkIdList = [];
    linkIndexList = [];
    boardIdList = {};
    count = 0;
    dict = {};
    for (var i = 0; i < host.database.board_group_link.items.length; i++){
        dict[host.database.board_group_link.items[i].id] = host.database.board_group_link.items[i].index;
        if (host.database.board_group_link.items[i].groupid == groupid){
            count++;
            if (host.database.board_group_link.items[i].index > index){
                linkIdList.push(host.database.board_group_link.items[i].id);
                linkIndexList.push(i);
                boardIdList[host.database.board_group_link.items[i].boardid] = 1;
            }
            if (host.database.board_group_link.items[i].index == index) linkId = host.database.board_group_link.items[i].id;
        }
    }
    linkIdList.sort(function(a, b){
        if (dict[a] > dict[b]) return 1;
        if (dict[a] < dict[b]) return -1;
        return 0;
    });
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "board_archive_save.php",
            params: [
                {name: "boardid", value: id},
                {name: "min", value: index},
                {name: "increaseIdList", value: EncodingClass.string.fromVariable(linkIdList)},
                {name: "count", value: count},
                {name: "linkId", value: linkId},
                {name: "groupid", value: groupid}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.boards.getIndex(id);
                        host.database.boards.items.splice(index, 1);
                        for (var i = 0; i < host.database.boards.items.length; i++){
                            if (boardIdList[host.database.boards.items[i].id] == 1) host.database.boards.items[i].index--;
                        }
                        for (var i = 0; i < linkIndexList.length; i++){
                            host.database.board_group_link.items[linkIndexList[i]].index--;
                        }
                        host.database.board_group_link.items = host.database.board_group_link.items.filter(function(elt){
                            return elt.boardid != id;
                        });
                        host.database.field_list.items = host.database.field_list.items.filter(function(elt){
                            return elt.hostid != id;
                        });
                        host.database.list_member.items = host.database.list_member.items.filter(function(elt){
                            return elt.listid != id;
                        });
                        dbcache.refresh("lists");
                        dbcache.refresh("archived_lists");
                        dbcache.refresh("board_group_link");
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
        })
    });
};

carddone.boards.restoreBoard = function(host, id, groupid, index){
    var linkIdList, linkIndexList, count, dict, linkId, boardIdList;
    linkIdList = [];
    linkIndexList = [];
    boardIdList = {};
    count = 0;
    dict = {};
    for (var i = 0; i < host.database.board_group_link.items.length; i++){
        dict[host.database.board_group_link.items[i].id] = host.database.board_group_link.items[i].index;
        if (host.database.board_group_link.items[i].groupid == groupid){
            count++;
            if (host.database.board_group_link.items[i].index > index){
                linkIdList.push(host.database.board_group_link.items[i].id);
                linkIndexList.push(i);
                boardIdList[host.database.board_group_link.items[i].boardid] = 1;
            }
            if (host.database.board_group_link.items[i].index == index) linkId = host.database.board_group_link.items[i].id;
        }
    }
    linkIdList.sort(function(a, b){
        if (dict[a] > dict[b]) return 1;
        if (dict[a] < dict[b]) return -1;
        return 0;
    });
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "board_restore_save.php",
            params: [
                {name: "boardid", value: id},
                {name: "min", value: index},
                {name: "increaseIdList", value: EncodingClass.string.fromVariable(linkIdList)},
                {name: "count", value: count},
                {name: "linkId", value: linkId},
                {name: "groupid", value: groupid}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.boards.getIndex(id);
                        host.currentBoardData.boards.items.push(host.database.boards.items[index]);
                        host.database.boards.items.splice(index, 1);
                        for (var i = 0; i < host.database.boards.items.length; i++){
                            if (boardIdList[host.database.boards.items[i].id] == 1) host.database.boards.items[i].index--;
                        }
                        for (var i = 0; i < linkIndexList.length; i++){
                            host.database.board_group_link.items[linkIndexList[i]].index--;
                        }
                        host.database.board_group_link.items = host.database.board_group_link.items.filter(function(elt){
                            return elt.boardid != id;
                        });
                        host.database.field_list.items = host.database.field_list.items.filter(function(elt){
                            return elt.hostid != id;
                        });
                        host.database.list_member.items = host.database.list_member.items.filter(function(elt){
                            return elt.listid != id;
                        });
                        dbcache.refresh("lists");
                        dbcache.refresh("archived_lists");
                        dbcache.refresh("board_group_link");
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
        })
    });
};

carddone.boards.deleteBoard = function(host, id, groupid, index){
    var linkIdList, linkIndexList, dict, boardIdList;
    linkIdList = [];
    linkIndexList = [];
    boardIdList = {};
    dict = {};
    for (var i = 0; i < host.database.board_group_link.items.length; i++){
        dict[host.database.board_group_link.items[i].id] = host.database.board_group_link.items[i].index;
        if (host.database.board_group_link.items[i].groupid == groupid){
            if (host.database.board_group_link.items[i].index > index){
                linkIdList.push(host.database.board_group_link.items[i].id);
                linkIndexList.push(i);
                boardIdList[host.database.board_group_link.items[i].boardid] = 1;
            }
        }
    }
    linkIdList.sort(function(a, b){
        if (dict[a] > dict[b]) return 1;
        if (dict[a] < dict[b]) return -1;
        return 0;
    });
    return new Promise(function(rs){
        ModalElement.show_loading();
        FormClass.api_call({
            url: host.viewArchived ? "board_delete_archive_board_save.php" : "board_delete_save.php",
            params: [
                {name: "boardid", value: id},
                {name: "min", value: index},
                {name: "increaseIdList", value: EncodingClass.string.fromVariable(linkIdList)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.boards.getIndex(id);
                        host.database.boards.items.splice(index, 1);
                        for (var i = 0; i < host.database.boards.items.length; i++){
                            if (boardIdList[host.database.boards.items[i].id] == 1) host.database.boards.items[i].index--;
                        }
                        for (var i = 0; i < linkIndexList.length; i++){
                            host.database.board_group_link.items[linkIndexList[i]].index--;
                        }
                        host.database.board_group_link.items = host.database.board_group_link.items.filter(function(elt){
                            return elt.boardid != id;
                        });
                        host.database.field_list.items = host.database.field_list.items.filter(function(elt){
                            return elt.hostid != id;
                        });
                        host.database.list_member.items = host.database.list_member.items.filter(function(elt){
                            return elt.listid != id;
                        });
                        var gIndex = host.database.board_groups.getIndex(groupid);
                        host.database.board_groups.items[gIndex].boardIdList = host.database.board_groups.items[gIndex].boardIdList.filter(function(elt){
                            return elt != id;
                        });
                        dbcache.refresh("lists");
                        dbcache.refresh("board_group_link");
                        dbcache.refresh("field_list");
                        dbcache.refresh("list_member");
                        rs(true);
                    }
                    else if (message == "knowledge"){
                        ModalElement.alert({message: LanguageModule.text("war_can_not_delete_cards_which_was_made_knowledge")});
                        rs(false);
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
        })
    });
};

carddone.boards.getListDel = function(host, content, parentData, data){
    var idList = content.map(function(elt){
        return elt.id;
    });
    var listdel = parentData.childrenIdList.filter(function(elt){
        return idList.indexOf(elt) == -1;
    });
    listdel.forEach(function(elt){
        data.push(elt);
    });
    for (var i = 0; i < content.length; i++){
        var elt = content[i];
        if (elt.child && elt.child.length > 0 && elt.id > 0) {
            var index = host.database.lists.getIndex(elt.id);
            carddone.boards.getListDel(host, elt.child, host.database.lists.items[index], data);
        }
    }
};

carddone.boards.editBoardSave = function(host, id, value, mode){
    return new Promise(function(rs){
        var params, list, bIndex, listdel, fielddel, membersDel, members, notEditMember;
        notEditMember = [];
        params = {
            id: id
        };
        params.formatid = value.formatid;
        params.name = value.name;
        params.color = value.decoration.color;
        params.picture = value.decoration.picture;
        params.decoration_selection = value.decoration.selection;
        params.favorite = value.favorite;
        params.available = value.available;
        params.permission = value.permission;
        params.board_type = value.board_type;
        params.groupid = value.groupid;
        params.email_group_required = value.email_group_required? 1 : 0;
        var email_group = {
            update: [],
            insert: [],
            delete: []
        };
        var temp, ex;
        for (var i = 0; i < value.email_group.length; i++){
            if (value.email_group[i].id > 0){
                temp = host.database.board_email_groups.getIndex(value.email_group[i].id);
                if (temp < 0) email_group.insert.push(value.email_group[i]);
                else {
                    email_group.update.push({
                        id: value.email_group[i].id,
                        name: value.email_group[i].name,
                        userList: {
                            insert: [],
                            delete: []
                        }
                    });
                    host.database.board_email_groups.items[temp].sel = "update";
                    for (var j = 0; j < value.email_group[i].userList.length; j++){
                        ex = host.database.board_email_groups.items[temp].userList.indexOf(value.email_group[i].userList[j]);
                        if (ex < 0){
                            email_group.update[email_group.update.length - 1].userList.insert.push(value.email_group[i].userList[j]);
                        }
                        else {
                            host.database.board_email_groups.items[temp].userList.splice(ex, 1);
                        }
                    }
                    email_group.update[email_group.update.length - 1].userList.delete = host.database.board_email_groups.items[temp].userList;
                }
            }
            else {
                email_group.insert.push(value.email_group[i]);
            }
        }
        for (var i = 0; i < host.database.board_email_groups.items.length; i++){
            if (!host.database.board_email_groups.items[i].sel) email_group.delete.push(host.database.board_email_groups.items[i].id);
        }
        params.email_group = EncodingClass.string.fromVariable(email_group);
        var count = 0;
        if (params.groupid != 0) {
            for (var i = 0; i < host.database.board_group_link.items.length; i++){
                if (host.database.board_group_link.items[i].groupid == params.groupid) count++;
            }
        }
        params.index = count;
        if (value.object_of_board) params.object_type = value.object_type;
        else params.object_type = 0;
        params.list = EncodingClass.string.fromVariable(value.list);
        params.fields = [];
        for (var j = 0; j < value.fields.length; j++){
            var elt = value.fields[j];
            var k = false;
            for (var i = 0; i < host.database.field_list.items.length; i++){
                if ((host.database.field_list.items[i].hostid == id) && (host.database.field_list.items[i].typeid == elt)) k = true;
            }
            if (!k) params.fields.push({
                id: 0,
                typeid: elt
            });
        }
        params.fields = EncodingClass.string.fromVariable(params.fields);
        if (id == 0){
            listdel = [];
            fielddel = [];
            membersDel = [];
            params.members = value.members.map(function(elt){
                return {
                    userid: elt.userid,
                    type: elt.type
                };
            })
            params.ver = 1;
            params.isFormated = 0;
        }
        else {
            bIndex = host.database.boards.getIndex(id);
            params.isFormated = host.database.boards.items[bIndex].formatid;
            listdel = [];
            carddone.boards.getListDel(host, value.list, host.database.boards.items[bIndex], listdel);
            var fieldList = host.database.boards.items[bIndex].fieldIdList.filter(function(elt){
                return value.fields.indexOf(elt) == -1;
            });
            fielddel = fieldList.map(function(elt){
                for (var i = 0; i < host.database.field_list.items.length; i++){
                    if ((host.database.field_list.items[i].hostid == id) && (host.database.field_list.items[i].typeid == elt)) return host.database.field_list.items[i].id;
                }
                return 0;
            });
            params.members = [];
            value.members.forEach(function(elt){
                var item = {
                    userid: elt.userid,
                    type: elt.type
                };
                for (var i = 0; i < host.database.boards.items[bIndex].memberList.length; i++){
                    if (host.database.boards.items[bIndex].memberList[i].userid == elt.userid){
                        for (var j = 0; j < host.database.list_member.items.length; j++){
                            if (host.database.list_member.items[j].listid == id && host.database.list_member.items[j].userid == elt.userid) {
                                if (host.database.list_member.items[j].type != elt.type){
                                    item.id = host.database.list_member.items[j].id;
                                }
                                else {
                                    item.id = 0;
                                }
                            }
                        }
                    }
                }
                if (item.id != 0) params.members.push(item);
                else notEditMember.push(item);
            });

            membersDel = host.database.boards.items[bIndex].memberList.filter(function(elt){
                var index = value.members.findIndex(function(elt2){
                    return elt2.userid == elt.userid;
                });
                return index < 0;
            });
            membersDel = membersDel.map(function(elt){
                return elt.id;
            });
            params.ver = host.database.boards.items[bIndex].ver;
        }
        params.listdel = EncodingClass.string.fromVariable(listdel);
        params.fielddel = EncodingClass.string.fromVariable(fielddel);
        params.members = EncodingClass.string.fromVariable(params.members);
        params.membersDel = EncodingClass.string.fromVariable(membersDel);
        var keys = Object.keys(params);
        var params2 = keys.map(function(elt){
            return {
                name: elt,
                value: params[elt]
            }
        });
        ModalElement.show_loading();
        FormClass.api_call({
            url: "boards_add_save.php",
            params: params2,
            func: function(success, message){
                // ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index, temp;
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0) {
                            content.board.groupIdList = [];
                            host.database.boards.items.push(content.board);
                            index = host.database.boards.items.length - 1;
                            id = content.board.id;
                            if (value.groupid != 0) host.database.board_group_link.items.push(content.link);
                        }
                        else {
                            index = host.database.boards.getIndex(id);
                            content.board.userid = host.database.boards.items[index].userid;
                            content.board.index = host.database.boards.items[index].index;
                            content.board.groupIdList = host.database.boards.items[index].groupIdList;
                            var oldGroupId = host.database.boards.items[index].groupid;
                            host.database.boards.items[index] = content.board;
                            if (oldGroupId  && oldGroupId != value.groupid) {
                                for (var i = 0; i < host.database.board_group_link.items.length; i++){
                                    if (host.database.board_group_link.items[i].boardid == id){
                                        if (value.groupid != 0) host.database.board_group_link.items[i] = content.link;
                                        else {
                                            host.database.board_group_link.items.splice(i, 1);
                                        }
                                        var n = host.database.board_groups.getIndex(oldGroupId);
                                        host.database.board_groups.items[n].boardIdList = host.database.board_groups.items[n].boardIdList.filter(function(elt){
                                            return elt != id;
                                        });
                                        k = true;
                                        break;
                                    }
                                }
                                if (!k) {
                                    if (value.groupid != 0) host.database.board_group_link.items.push(content.link);
                                }
                            }
                        }
                        if (value.groupid > 0){
                            host.database.boards.items[index].groupid = value.groupid;
                            host.database.boards.items[index].groupIndex = host.database.board_groups.getIndex(value.groupid);
                            var m = host.database.board_groups.getIndex(value.groupid);
                            host.database.board_groups.items[m].boardIdList.push(id);
                        }
                        host.database.boards.items[index].childrenIdList = [];
                        host.database.boards.items[index].memberList = content.members.concat(notEditMember);
                        content.members.forEach(function(elt){
                            var index = host.database.list_member.getIndex(elt.id);
                            if (index == -1){
                                host.database.list_member.items.push(elt);
                            }
                            else host.database.list_member.items[index] = elt;
                        });
                        host.database.boards.items[index].fieldIdList = value.fields;
                        host.database.field_list.items = host.database.field_list.items.concat(content.fields);
                        temp = host.database.lists.items.filter(function(elt){
                            return listdel.indexOf(elt.id) == -1;
                        });
                        host.database.lists.items = temp;
                        temp = host.database.field_list.items.filter(function(elt){
                            return fielddel.indexOf(elt.id) == -1;
                        });
                        host.database.field_list.items = temp;

                        var generateListData = function(content, parentData){
                            content.forEach(function(elt){
                                elt.childrenIdList = [];
                                var index = host.database.lists.getIndex(elt.id);
                                if (index == -1) {
                                    host.database.lists.items.push(elt);
                                }
                                else {
                                    host.database.lists.items[index] = elt;
                                }
                                if (elt.type2 == "group"){
                                    parentData.childrenIdList.push(elt.id);
                                }
                                else {
                                    host.database.lists.items[host.database.lists.getIndex(elt.parentid)].childrenIdList.push(elt.id);
                                }
                            });
                        }
                        generateListData(content.list, host.database.boards.items[index]);
                        dbcache.refresh("board_email_groups");
                        dbcache.refresh("board_email_group_link");
                        dbcache.refresh("lists");
                        dbcache.refresh("board_group_link");
                        dbcache.refresh("field_list");
                        dbcache.refresh("list_member");
                        carddone.boards.redraw(host).then(function(singlePage){
                            host.board_container.clearChild();
                            host.board_container.addChild(singlePage);
                            rs(id);
                        });
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

carddone.boards.listsData = function(host, content, master, str, listUpdate){
    var data, index, decoration, childrenData, st;
    var dict = {};
    for (var i = 0; i < host.database.lists.items.length; i++){
        dict[host.database.lists.items[i].id] = i;
    }
    data = [];
    content.sort(function(a, b){
        if (host.database.lists.items[dict[a]].lindex > host.database.lists.items[dict[b]].lindex) return 1;
        if (host.database.lists.items[dict[a]].lindex < host.database.lists.items[dict[b]].lindex) return -1;
        return 0;
    });
    for (var i = 0; i < content.length; i++){
        index = dict[content[i]];
        if (!host.database.lists.items[index].decoration) {
            host.database.lists.items[index].decoration = EncodingClass.string.fromVariable({color: host.database.lists.items[index].color});
        }
        decoration = EncodingClass.string.toVariable(host.database.lists.items[index].decoration);
        st = host.database.lists.items[index].childrenIdList;
        var t_index = host.database.lists.items[index].name.indexOf("_");
        if (master) listUpdate.push({
            id: host.database.lists.items[index].id,
            format_listid: host.database.lists.items[index].type2 == "group" ? "group" : str + (i + 1)
        });
        if (st.length > 0) childrenData = carddone.boards.listsData(host, st, master, host.database.lists.items[index].name.substr(0, t_index + 1), listUpdate);
        else childrenData = [];
        data.push({
            id: master ? host.database.lists.items[index].type2 == "group" ? "group" : str + (i + 1) : host.database.lists.items[index].id,
            name: host.database.lists.items[index].name,
            type: host.database.lists.items[index].type2,
            color: decoration.color,
            child: childrenData
        });
    }
    return data;
}

carddone.boards.editBoard = function(host, groupid, id){
    var propmiseList = {};
    ModalElement.show_loading();
    propmiseList.board_email_groups = data_module.loadByConditionAsync({
        name: "board_email_groups",
        cond: function (record) {
            return record.boardid == id;
        },
        callback: function (retval) {
            host.database.board_email_groups = data_module.makeDatabase(retval);
            var dict = {};
            retval.forEach(function(elt){
                dict[elt.id] = 1;
            });
            return dict;
        }
    });
    propmiseList.board_email_group_link = propmiseList.board_email_groups.then(function(dict){
        dbcache.loadByCondition({
            name: "board_email_group_link",
            cond: function(record){
                return dict[record.groupid];
            },
            callback: function (retval) {
                host.database.board_email_group_link = data_module.makeDatabase(retval);
                contentModule.makeBoardEmailGroupLinkIndex(host);
                ModalElement.close(-1);
                var name, color, picture, favorite, available, board_type, object_of_board, object_type, list, fields, permission, memberList, owner;
                var bIndex, decoration, l_index, l_decoration, cIndex, fIndex, fieldList, objectTypeList, singlePage, formatid, permissionList, creator, createdtime;
                var cmdButton, content;
                var  email_group_required, priv_type;
                if (id == 0){
                    for (var i = 0; i < host.privItems.listPriviledgeOfBoard.length; i++){
                        if (host.privItems.listPriviledgeOfBoard[i].is_system == 1){
                            priv_type = host.privItems.listPriviledgeOfBoard[i].value;
                            break;
                        }
                    }
                    creator = systemconfig.userid;
                    createdtime = new Date();
                    bIndex = -1;
                    decoration = {
                        color: "91e4fb",
                        picture: "#",
                        selection: "color"
                    };
                    name = "";
                    email_group_required = 0;
                    favorite = 0;
                    available = 1;
                    board_type = "general";
                    object_of_board = false;
                    object_type = undefined;
                    list = [
                        {
                            id: -2000,
                            format_listid: "",
                            name: "additional_status",
                            // color: "aedd94",
                            color: "ebebeb",
                            type: "group",
                            child: []
                        },
                        {
                            id: -2001,
                            format_listid: "",
                            name: "finish_status",
                            // color: "aedd94",
                            color: "ebebeb",
                            type: "group",
                            child: [
                                {
                                    id: -1000,
                                    format_listid: "",
                                    name: LanguageModule.text("txt_finish"),
                                    // color: "dacafb",
                                    color: "ebebeb",
                                    type: "system"
                                }
                            ]
                        }
                    ];
                    fields = [];
                    permission = 0;
                    memberList = [{
                        id: -1,
                        userid: systemconfig.userid,
                        type: priv_type
                    }];
                    owner = systemconfig.userid;
                    host.holder.name = LanguageModule.text("txt_add_board");
                }
                else {
                    bIndex = host.database.boards.getIndex(id);
                    creator = host.database.boards.items[bIndex].userid;
                    createdtime = host.database.boards.items[bIndex].createdtime;
                    name = host.database.boards.items[bIndex].name;
                    email_group_required = host.database.boards.items[bIndex].email_group_required;
                    groupid = host.database.boards.items[bIndex].groupid;
                    formatid = host.database.boards.items[bIndex].formatid;
                    decoration = EncodingClass.string.toVariable(host.database.boards.items[bIndex].decoration);
                    favorite = host.database.boards.items[bIndex].favorite;
                    available = host.database.boards.items[bIndex].available;
                    board_type = host.database.boards.items[bIndex].type2;
                    object_of_board = host.database.boards.items[bIndex].typeid != 0;
                    object_type = host.database.boards.items[bIndex].typeid;
                    permission = host.database.boards.items[bIndex].permission;
                    owner = host.database.boards.items[bIndex].userid;
                    memberList = EncodingClass.string.duplicate(host.database.boards.items[bIndex].memberList);
                    list = [];
                    list = carddone.boards.listsData(host, host.database.boards.items[bIndex].childrenIdList, false);
                    fields = [];
                    for (var i = 0; i < host.database.boards.items[bIndex].fieldIdList.length; i++){
                        fIndex = host.database.typelists.getIndex(host.database.boards.items[bIndex].fieldIdList[i]);
                        fields.push({
                            id: host.database.typelists.items[fIndex].id,
                            name: host.database.typelists.items[fIndex].name
                        });
                    }
                    host.holder.name = name;
                    for (var i = 0; i < host.database.list_member.items.length; i++){
                        if (host.database.list_member.items[i].userid == systemconfig.userid && host.database.list_member.items[i].listid == id){
                            priv_type = host.database.list_member.items[i].type;
                            break;
                        }
                    }
                }
                var privIndex = host.database.account_groups.getIndex(priv_type);
                if (privIndex == -1){
                    ModalElement.alert({message: "error: priv_type"});
                    return;
                }
                var priv = host.database.account_groups.items[privIndex].privOfBoard;
                fieldList = [];
                objectTypeList = []
                for (var i = 0; i < host.database.typelists.items.length; i++){
                    if (host.database.typelists.items[i].object_selection == "object") objectTypeList.push({
                        value: host.database.typelists.items[i].id,
                        text: host.database.typelists.items[i].name
                    });
                    else if (host.database.typelists.items[i].object_selection == "field") fieldList.push({
                        value: host.database.typelists.items[i].id,
                        text: host.database.typelists.items[i].name
                    });
                }
                permissionList = [
                    {text: LanguageModule.text("txt_can_not_see_card_of_other_member"), value: 0},
                    {text: LanguageModule.text("txt_can_see_card_of_other_member"), value: 1},
                    {text: LanguageModule.text("txt_can_edit_card_of_other_member"), value: 2}
                ];
                var emailGroupList = [];
                for (var i = 0; i < host.database.board_email_groups.items.length; i++){
                    emailGroupList.push({
                        id: host.database.board_email_groups.items[i].id,
                        name: host.database.board_email_groups.items[i].name,
                        userList: EncodingClass.string.duplicate(host.database.board_email_groups.items[i].userList)
                    });
                }
                content = {
                    name: {
                        title: LanguageModule.text("txt_name"),
                        value: name
                    },
                    email_group_required: {
                        title: LanguageModule.text("txt_email_groups_required"),
                        value: email_group_required
                    },
                    email_group: {
                        title: LanguageModule.text("txt_email_group"),
                        value: emailGroupList
                    },
                    decoration: {
                        title: LanguageModule.text("txt_decoration"),
                        value: decoration.selection,
                        content: {
                            color: {
                                title: LanguageModule.text("txt_color"),
                                value: decoration.color
                            },
                            picture: {
                                title: LanguageModule.text("txt_background_picture"),
                                value: decoration.picture
                            }
                        }
                    },
                    favorite: {
                        title: LanguageModule.text("txt_favorite"),
                        value: favorite
                    },
                    available: {
                        title: LanguageModule.text("txt_active"),
                        value: available
                    },
                    board_type: {
                        title: LanguageModule.text("txt_board_type"),
                        value: board_type
                    },
                    object_of_board: {
                        title: LanguageModule.text("txt_object_of_board"),
                        value: object_of_board
                    },
                    object_type: {
                        title: LanguageModule.text("txt_object_type"),
                        value: object_type
                    },
                    list: {
                        title: LanguageModule.text("txt_phase"),
                        value: list
                    },
                    fields: {
                        title: LanguageModule.text("txt_field"),
                        value: fields
                    },
                    permission: {
                        title: LanguageModule.text("txt_permission_of_user"),
                        value: permission
                    },
                    members: {
                        title: LanguageModule.text("txt_member"),
                        value: memberList
                    }
                };

                cmdButton = {
                    close: function () {
                        host.frameList.removeLast();
                        host.holder.name = LanguageModule.text("txt_board");
                    },
                    save: function () {
                        var value = singlePage.getValue();
                        if (!value) return;
                        carddone.boards.editBoardSave(host, id, value, 0).then(function(value){
                            id = value;
                            carddone.boards.editBoard(host, groupid, id);
                        });
                        host.holder.name = LanguageModule.text("txt_board");
                    },
                    saveClose: function () {
                        var value = singlePage.getValue();
                        if (!value) return;
                        carddone.boards.editBoardSave(host, id, value, 1).then(function(value){
                            ModalElement.close(-1);
                            host.frameList.removeLast();
                        });
                        host.holder.name = LanguageModule.text("txt_board");
                    }
                };

                var formatList = host.database.formats.items.map(function(elt){
                    return {
                        value: elt.id,
                        text: elt.name
                    };
                });
                singlePage = host.funcs.boardEditForm({
                    id: id,
                    creator: creator,
                    createdtime: createdtime,
                    cmdButton: cmdButton,
                    content: content,
                    fieldList: fieldList,
                    objectTypeList: objectTypeList,
                    formatid: formatid,
                    groups: host.database.board_groups,
                    groupid: groupid,
                    owner: owner,
                    permissionList: permissionList,
                    frameList: host.frameList,
                    typelists: host.database.typelists,
                    formats: host.database.formats,
                    listPriviledgeOfBoard: host.privItems.listPriviledgeOfBoard,
                    priv: priv
                });
                while(host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
                host.frameList.addChild(singlePage);
                singlePage.requestActive();
            }
        });
    });
};

carddone.boards.makeMasterBoard = function(host, id){
    var bIndex = host.database.boards.getIndex(id);
    if (host.database.boards.items[bIndex].formatid) return;
    var name = host.database.boards.items[bIndex].name;
    var board_type = host.database.boards.items[bIndex].type2;
    var list = [];
    var listUpdate = [{
        id: id
    }];
    list = carddone.boards.listsData(host, host.database.boards.items[bIndex].childrenIdList, true, "", listUpdate);
    var fields = [];
    for (var i = 0; i < host.database.boards.items[bIndex].fieldIdList.length; i++){
        var fIndex = host.database.typelists.getIndex(host.database.boards.items[bIndex].fieldIdList[i]);
        fields.push({
            id: host.database.typelists.items[fIndex].id,
            name: host.database.typelists.items[fIndex].name
        });
    }
    var template = {
        listUpdate: listUpdate,
        boardid: id,
        template: {
            name: name,
            list: list,
            board_type: board_type,
            fields: fields
        }
    };
    carddone.menu.loadPage(18, template);
};

carddone.boards.addNewGroup = function(host, id, callbackFunc, gindex){
    var index, name, color;
    if (id == 0){
        name = "";
        color = "ebebeb";
    }
    else {
        index = host.database.board_groups.getIndex(id);
        name = host.database.board_groups.items[index].name;
        color = host.database.board_groups.items[index].color;
    }
    var singlePage = host.funcs.boardEditGroupForm({
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
                carddone.boards.addNewGroupSave(host, id, gindex, value).then(function(groupid){
                    if (id == 0) {
                        value.task = "add";
                        value.on = {
                            boardorderchange: function (groupid, boardid, from, to){
                                carddone.boards.changeOrder(host, groupid, boardid, from, to);
                            },
                            boardenter: function (boardid, from, to){
                                carddone.boards.changeGroup(host, boardid, from, to);
                            },
                            boardleave: function (){
                            },
                            dragboardstart: function (){
                            },
                            dragboardend: function (){
                            },
                            editFunc: function(id, callbackFunc, index){
                                carddone.boards.addNewGroup(host, id, callbackFunc, index);
                            },
                            sortAscending: function(groupid, callbackFunc){
                                return carddone.boards.sortAscending(host, groupid, callbackFunc);
                            },
                            deleteFunc: function(id, index){
                                carddone.boards.deleteGroup(host, id, index);
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
                carddone.boards.addNewGroupSave(host, id, gindex, value).then(function(groupid){
                    if (id == 0) {
                        value.task = "add";
                        value.on = {
                            boardorderchange: function (groupid, boardid, from, to){
                                carddone.boards.changeOrder(host, groupid, boardid, from, to);
                            },
                            boardenter: function (boardid, from, to){
                                carddone.boards.changeGroup(host, boardid, from, to);
                            },
                            boardleave: function (){
                            },
                            dragboardstart: function (){
                            },
                            dragboardend: function (){
                            },
                            editFunc: function(id, callbackFunc, index){
                                carddone.boards.addNewGroup(host, id, callbackFunc, index);
                            },
                            sortAscending: function(groupid, callbackFunc){
                                return carddone.boards.sortAscending(host, groupid, callbackFunc);
                            },
                            deleteFunc: function(id, index){
                                carddone.boards.deleteGroup(host, id, index);
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

carddone.boards.redraw = function(host){
    return new Promise(function(rs){
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makePriviledgeOfUserGroups(host);
        host.privItems = contentModule.makeAccountGroupsItems(host);
        var is_system;
        for (var i = 0; i < host.privItems.listPriviledgeOfBoard.length; i++){
            if (host.privItems.listPriviledgeOfBoard[i].is_system == 1){
                is_system = host.privItems.listPriviledgeOfBoard[i].value;
                break;
            }
        }
        var privDict = {};
        for (var i = 0; i < host.database.list_member.items.length; i++){
            if (host.database.list_member.items[i].userid == systemconfig.userid){
                privDict[host.database.list_member.items[i].listid] = host.database.list_member.items[i].type;
            }
        }
        var account_groupsDict = {};
        for (var i = 0; i < host.database.account_groups.items.length; i++){
            account_groupsDict[host.database.account_groups.items[i].id] = host.database.account_groups.items[i].privOfBoard;
        }
        var group_data = {};
        host.database.boards.items.sort(function(a, b){
            if (a.createdtime > b.createdtime) return -1;
            if (a.createdtime < b.createdtime) return 1;
            return 0;
        });
        group_data[-1] = {
            id: 0,
            name: LanguageModule.text("txt_general_group"),
            color: "ebebeb",
            child: [],
            on: {
                boardorderchange: function (groupid, boardid, from, to){
                },
                boardenter: function (boardid, from, to){
                    carddone.boards.changeGroup(host, boardid, from, to);
                },
                boardleave: function (){
                },
                dragboardstart: function (){
                },
                dragboardend: function (){
                }
            }
        };
        for (var i = 0; i < host.database.board_groups.items.length; i++){
            group_data[host.database.board_groups.items[i].gindex] = {
                id: host.database.board_groups.items[i].id,
                name: host.database.board_groups.items[i].name,
                color: host.database.board_groups.items[i].color,
                child: [],
                on: {
                    boardorderchange: function (groupid, boardid, from, to){
                        carddone.boards.changeOrder(host, groupid, boardid, from, to);
                    },
                    boardenter: function (boardid, from, to){
                        carddone.boards.changeGroup(host, boardid, from, to);
                    },
                    boardleave: function (){
                    },
                    dragboardstart: function (){
                    },
                    dragboardend: function (){
                    },
                    editFunc: function(id, callbackFunc, index){
                        carddone.boards.addNewGroup(host, id, callbackFunc, index);
                    },
                    sortAscending: function(groupid, callbackFunc){
                        return carddone.boards.sortAscending(host, groupid, callbackFunc);
                    },
                    deleteFunc: function(id, index){
                        carddone.boards.deleteGroup(host, id, index);
                    }
                }
            }
        }
        var gIndex;
        for (var i = 0; i < host.database.boards.items.length; i++){
            if (!host.database.boards.items[i].groupid) gIndex = -1;
            else gIndex = host.database.board_groups.items[host.database.boards.items[i].groupIndex].gindex;
            group_data[gIndex].child.push({
                id: host.database.boards.items[i].id,
                name: host.database.boards.items[i].name,
                index: host.database.boards.items[i].index,
                formatid: host.database.boards.items[i].formatid,
                isAdmin: privDict[host.database.boards.items[i].id] == is_system,
                description: "",
                priv: account_groupsDict[privDict[host.database.boards.items[i].id]],
                editFunc: function(id, groupid){
                    return function(){
                        carddone.boards.editBoard(host, groupid, id);
                    }
                }(host.database.boards.items[i].id, host.database.boards.items[i].groupid),
                openCardManager: function(id){
                    return function(){
                        if (carddone.isMobile) carddone.menu.loadPage(11, {boardid: id, frameList: host.frameList, holder: host.holder, isMobile: true});
                        else carddone.menu.loadPage(11, {boardid: id});
                    }
                }(host.database.boards.items[i].id),
                makeMasterBoard: function(id){
                    return function(){
                        carddone.boards.makeMasterBoard(host, id);
                    }
                }(host.database.boards.items[i].id),
                deleteBoard: function(id, groupid, index){
                    return function(){
                        return carddone.boards.deleteBoard(host, id, groupid, index);
                    }
                }(host.database.boards.items[i].id, host.database.boards.items[i].groupid, host.database.boards.items[i].index),
                archiveBoard: function(id, groupid, index){
                    return function(){
                        return carddone.boards.archiveBoard(host, id, groupid, index);
                    }
                }(host.database.boards.items[i].id, host.database.boards.items[i].groupid, host.database.boards.items[i].index),
                restoreBoard: function(id, groupid, index){
                    return function(){
                        return carddone.boards.restoreBoard(host, id, groupid, index);
                    }
                }(host.database.boards.items[i].id, host.database.boards.items[i].groupid, host.database.boards.items[i].index)
            });
        }
        var singlePage = host.funcs.boardContentDataForm({
            content: group_data,
            archived: host.viewArchived,
            addNew: function(groupid){
                return carddone.boards.editBoard(host, groupid, 0);
            },
            pressaddgroup: function(index, callbackFunc){
                carddone.boards.addNewGroup(host, 0, callbackFunc, index);
            },
            groupChangeOrder: function(groupid, from, to){
                carddone.boards.groupChangeOrder(host, groupid, from, to);
            }
        });
        rs(singlePage);
    });
};

carddone.boards.init = function(host){
    if (!data_module.users
    ) {
        setTimeout(function(){
            carddone.boards.init(host);
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

    var propmiseList = {};
    propmiseList.format = data_module.loadByConditionAsync({
        name: "format",
        cond: function (record) {
            return true;
        },
        callback: function (retval) {
            host.database.formats = data_module.makeDatabase(retval);
            host.database.formats.items.forEach(function(elt){
                elt.content = EncodingClass.string.toVariable(elt.content);
            });
        }
    });

    propmiseList.typelists = data_module.loadByConditionAsync({
        name: "typelists",
        cond: function (record) {
            return true;
        },
        callback: function (retval) {
            host.database.typelists = data_module.makeDatabase(retval);
        }
    });

    propmiseList.board_groups = data_module.loadByConditionAsync({
        name: "board_groups",
        cond: function (record) {
            return record.userid == systemconfig.userid;
        },
        callback: function (retval) {
            host.database.board_groups = data_module.makeDatabase(retval);
        }
    });

    propmiseList.list_member = data_module.loadByConditionAsync({
        name: "list_member",
        cond: function (record) {
            return record.userid == systemconfig.userid;
        },
        callback: function (retval) {
            var dict = {};
            retval.forEach(function(elt){
                dict[elt.listid] = 1;
            });
            return dict;
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

    Promise.all([
        propmiseList.format,
        propmiseList.typelists,
        propmiseList.board_groups,
        // propmiseList.board_group_link,
        propmiseList.list_member,
        propmiseList.account_groups,
        propmiseList.privilege_groups,
        propmiseList.privilege_group_details
    ]).then(function(value){
        propmiseList.boards = data_module.loadByConditionAsync({
            name: "lists",
            cond: function(record){
                return value[3][record.id] == 1;
            },
            callback: function (retval) {
                host.database.boards = data_module.makeDatabase(retval);
                var dict = {};
                host.database.boards.items.forEach(function(elt){
                    dict[elt.id] = 1;
                });
                return dict;
            }
        });
        propmiseList.board_group_link = propmiseList.boards.then(function(dict){
            return data_module.loadByConditionAsync({
                name: "board_group_link",
                cond: function (record) {
                    return (record.userid == systemconfig.userid && dict[record.boardid] == 1);
                },
                callback: function (retval) {
                    host.database.board_group_link = data_module.makeDatabase(retval);
                }
            });
        });

        propmiseList.lists = propmiseList.boards.then(function(dict){
            return data_module.loadByConditionAsync({
                name: "lists",
                cond: function (record) {
                    return record.type == "list";
                },
                callback: function(dict){
                    return function (retval) {
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
                                list.push(elt);
                            }
                        });
                        host.database.lists = data_module.makeDatabase(list);
                        return dict;
                    }
                }(dict)
            });
        });

        propmiseList.field_list = propmiseList.boards.then(function(dict){
            return data_module.loadByConditionAsync({
                name: "field_list",
                cond: function(dict){
                    return function (record) {
                        return dict[record.hostid];
                    }
                }(dict),
                callback: function (retval) {
                    host.database.field_list = data_module.makeDatabase(retval);
                }
            });
        });

        propmiseList.list_member2 = propmiseList.boards.then(function(dict){
            return data_module.loadByConditionAsync({
                name: "list_member",
                cond: function(dict){
                    return function (record) {
                        return dict[record.listid];
                    }
                }(dict),
                callback: function (retval) {
                    host.database.list_member = data_module.makeDatabase(retval);
                }
            });
        });

        Promise.all([propmiseList.lists, propmiseList.field_list, propmiseList.list_member2, propmiseList.board_group_link]).then(function(){
            ModalElement.close(-1);
            host.holder.addChild(host.frameList);
            contentModule.makeListsIndex(host);
            contentModule.makeListsIndex2(host);
            contentModule.makeField_list(host);
            contentModule.makeBoardMember(host);
            contentModule.makeBoardGroupLinkIndex(host);
            host.viewArchived = false;
            host.board_container = absol._({
                class: "board-view-container"
            });
            var singlePage = host.funcs.boardInitForm({
                cmdButton: {
                    close: function(){
                        carddone.menu.tabPanel.removeTab(host.holder.id);
                    },
                    viewArchivedBoard: function(){
                        host.viewArchived = true;
                        carddone.boards.loadArchivedBoard(host);
                    },
                    viewCurrentBoard: function(){
                        ModalElement.show_loading();
                        host.viewArchived = false;
                        var list_member = data_module.loadByConditionAsync({
                            name: "list_member",
                            cond: function (record) {
                                return record.userid == systemconfig.userid;
                            },
                            callback: function (retval) {
                                var dict = {};
                                retval.forEach(function(elt){
                                    dict[elt.listid] = 1;
                                });
                                return dict;
                            }
                        });
                        var boards = list_member.then(function(value){
                            return data_module.loadByConditionAsync({
                                name: "lists",
                                cond: function(record){
                                    return value[record.id] == 1;
                                },
                                callback: function (retval) {
                                    host.database.boards = data_module.makeDatabase(retval);
                                    var dict = {};
                                    host.database.boards.items.forEach(function(elt){
                                        dict[elt.id] = 1;
                                    });
                                    return dict;
                                }
                            });
                        });
                        var board_group_link = boards.then(function(dict){
                            return data_module.loadByConditionAsync({
                                name: "board_group_link",
                                cond: function (record) {
                                    return (record.userid == systemconfig.userid && dict[record.boardid] == 1);
                                },
                                callback: function (retval) {
                                    host.database.board_group_link = data_module.makeDatabase(retval);
                                }
                            });
                        });

                        var lists = boards.then(function(dict){
                            return data_module.loadByConditionAsync({
                                name: "lists",
                                cond: function (record) {
                                    return record.type == "list";
                                },
                                callback: function(dict){
                                    return function (retval) {
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
                                                list.push(elt);
                                            }
                                        });
                                        host.database.lists = data_module.makeDatabase(list);
                                        return dict;
                                    }
                                }(dict)
                            });
                        });

                        var field_list = boards.then(function(dict){
                            return data_module.loadByConditionAsync({
                                name: "field_list",
                                cond: function(dict){
                                    return function (record) {
                                        return dict[record.hostid];
                                    }
                                }(dict),
                                callback: function (retval) {
                                    host.database.field_list = data_module.makeDatabase(retval);
                                }
                            });
                        });

                        var list_member2 = boards.then(function(dict){
                            return data_module.loadByConditionAsync({
                                name: "list_member",
                                cond: function(dict){
                                    return function (record) {
                                        return dict[record.listid];
                                    }
                                }(dict),
                                callback: function (retval) {
                                    host.database.list_member = data_module.makeDatabase(retval);
                                }
                            });
                        });
                        Promise.all([lists, field_list, list_member2, board_group_link]).then(function(){
                            ModalElement.close(-1);
                            contentModule.makeListsIndex(host);
                            contentModule.makeListsIndex2(host);
                            contentModule.makeField_list(host);
                            contentModule.makeBoardMember(host);
                            contentModule.makeBoardGroupLinkIndex(host);
                            carddone.boards.redraw(host).then(function(singlePage){
                                host.board_container.clearChild();
                                host.board_container.addChild(singlePage);
                            });
                        });
                    }
                },
                board_container: host.board_container,
                frameList: host.frameList
            });
            host.frameList.addChild(singlePage);
            singlePage.requestActive();
            carddone.boards.redraw(host).then(function(singlePage){
                host.board_container.clearChild();
                host.board_container.addChild(singlePage);
            });
        });
    });
};

ModuleManagerClass.register({
    name: "Boards",
    prerequisites: ["ModalElement", "FormClass"]
});
