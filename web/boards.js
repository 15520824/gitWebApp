'use strict';

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
    }
    else {
        bIndex = host.database.boards.getIndex(id);
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
    params.groupAdd = EncodingClass.string.fromVariable(value.groupAdd);
    params.groupDel = EncodingClass.string.fromVariable(value.groupDel);
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
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var index, temp;
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    if (id == 0) {
                        content.board.groupIdList = [];
                        host.database.boards.items.push(content.board);
                        index = host.database.boards.items.length - 1;
                        id = content.board.id;
                    }
                    else {
                        index = host.database.boards.getIndex(id);
                        content.board.userid = host.database.boards.items[index].userid;
                        content.board.groupIdList = host.database.boards.items[index].groupIdList;
                        host.database.boards.items[index] = content.board;
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
                    for (var i = 0; i < value.groupDel.length; i++){
                        for (var j = 0; j < data_module.board_group_link.items.length; j++){
                            if (data_module.board_group_link.items[j].boardid == id && data_module.board_group_link.items[j].board_groupid == value.groupDel[i]){
                                data_module.board_group_link.items.splice(j, 1);
                                break;
                            }
                        }
                        for (var j = 0; j < host.database.boards.items[index].groupIdList.length; j++){
                            if (host.database.boards.items[index].groupIdList[j] == value.groupDel[i]){
                                host.database.boards.items[index].groupIdList.splice(j, 1);
                                break;
                            }
                        }
                    }
                    data_module.board_group_link.items = data_module.board_group_link.items.concat(content.groupAdd);
                    for (var i = 0; i < content.groupAdd.length; i++){
                        host.database.boards.items[index].groupIdList.push(content.groupAdd[i].board_groupid);
                    }
                    if (value.formatid){
                        var kt = false;
                        for (var i = 0; i < host.database.formats_list.items.length; i++){
                            if (host.database.formats_list.items[i].formatid == value.formatid && host.database.formats_list.items[i].boardid == id){
                                kt = true;
                                break;
                            }
                        }
                        if (!kt) host.database.formats_list.items.push({
                            id: -1,
                            formatid: value.formatid,
                            listid: id
                        });
                        host.database.boards.items[index].formatid = value.formatid;
                    }
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
                            var index;
                            if (elt.mode == "add") {
                                host.database.lists.items.push(elt);
                                index = host.database.lists.items.length - 1;
                            }
                            else {
                                index = host.database.lists.getIndex(elt.id);
                                host.database.lists.items[index] = elt;
                            }
                            parentData.childrenIdList.push(elt.id);
                            host.database.lists.items[index].childrenIdList = [];
                            if (elt.child && elt.child.length > 0) generateListData(elt.child, host.database.lists.items[index]);
                        });
                    }
                    generateListData(content.list, host.database.boards.items[index]);
                    carddone.boards.redraw(host);
                    if (mode == 0) carddone.boards.editBoard(host, id, host.isPriv);
                    else while(host.frameList.getLength() > 1){
                        host.frameList.removeLast();
                    }
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
    })
};

carddone.boards.listsData = function(host, content, master){
    var i, data, index, decoration, childrenData, st;
    data = [];
    for (var i = 0; i < content.length; i++){
        index = host.database.lists.getIndex(content[i]);
        if (!host.database.lists.items[index].decoration) {
            host.database.lists.items[index].decoration = EncodingClass.string.fromVariable({color: host.database.lists.items[index].color});
        }
        decoration = EncodingClass.string.toVariable(host.database.lists.items[index].decoration);
        st = host.database.lists.items[index].childrenIdList;
        if (st.length > 0) childrenData = carddone.boards.listsData(host, st, master);
        else childrenData = [];
        data.push({
            id: master ? [host.database.lists.items[index].id] : host.database.lists.items[index].id,
            name: host.database.lists.items[index].name,
            type: host.database.lists.items[index].type2,
            color: decoration.color,
            child: childrenData
        });
    }
    return data;
}

carddone.boards.editBoard = function(host, id, isPriv){
    host.isPriv = isPriv;
    var name, color, picture, favorite, available, board_type, object_of_board, object_type, list, fields, permission, memberList, owner;
    var bIndex, decoration, l_index, l_decoration, cIndex, fIndex, fieldList, objectTypeList, singlePage, formatid, permissionList;
    var buttons, content;
    if (id == 0){
        bIndex = -1;
        decoration = {
            color: "91e4fb",
            picture: "#",
            selection: "color"
        };
        name = "";
        favorite = 0;
        available = 1;
        board_type = "general";
        object_of_board = false;
        object_type = undefined;
        list = [
            {
                id: -2000,
                name: "additional_status",
                color: "aedd94",
                type: "group",
                child: []
            },
            {
                id: -2001,
                name: "finish_status",
                color: "aedd94",
                type: "group",
                child: [
                    {
                        id: -1000,
                        name: LanguageModule.text("txt_finish"),
                        color: "dacafb",
                        type: "system"
                    }
                ]
            }
        ];
        fields = [];
        permission = 0;
        memberList = [];
        owner = systemconfig.userid;
    }
    else {
        bIndex = host.database.boards.getIndex(id);
        name = host.database.boards.items[bIndex].name;
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
            fIndex = data_module.typelists.getIndex(host.database.boards.items[bIndex].fieldIdList[i]);
            fields.push({
                id: data_module.typelists.items[fIndex].id,
                name: data_module.typelists.items[fIndex].name
            });
        }
    }
    var getDataBoard_groupsCell = function(groupid){
        board_groupsIdList.push(groupid);
        var groupIndex = data_module.board_groups.getIndex(groupid);
        var child = [];
        var ni;
        for (var i = 0; i < data_module.board_groups.items[groupIndex].childrenIndexList.length; i++){
            ni = data_module.board_groups.items[groupIndex].childrenIndexList[i];
            if (data_module.board_groups.items[ni].available == 0) continue;
            child.push(getDataBoard_groupsCell(data_module.board_groups.items[ni].id));
        }
        var checked = false;
        if (id > 0){
            for (var i = 0; i < data_module.board_group_link.items.length; i++){
                if (data_module.board_group_link.items[i].boardid == id){
                    if (data_module.board_group_link.items[i].board_groupid == groupid){
                        checked = true;
                        break;
                    }
                }
            }
        }
        if (checked) board_groupsIdCheckedList.push(groupid);
        return {
            id: groupid,
            name: data_module.board_groups.items[groupIndex].name,
            checked: checked,
            child: child
        };
    };
    var board_groupsList = [], board_groupsIdList = [], board_groupsIdCheckedList = [];
    for (var i = 0; i < data_module.board_groups.items.length; i++){
        if (data_module.board_groups.items[i].parentid > 0) continue;
        if (data_module.board_groups.items[i].available == 0) continue;
        board_groupsList.push(getDataBoard_groupsCell(data_module.board_groups.items[i].id));
    }
    fieldList = [];
    objectTypeList = []
    for (var i = 0; i < data_module.typelists.items.length; i++){
        if (data_module.typelists.items[i].object_selection == "object") objectTypeList.push({
            value: data_module.typelists.items[i].id,
            text: data_module.typelists.items[i].name
        });
        else if (data_module.typelists.items[i].object_selection == "field") fieldList.push({
            value: data_module.typelists.items[i].id,
            text: data_module.typelists.items[i].name
        });
    }
    permissionList = [
        {text: LanguageModule.text("txt_can_not_see_card_of_other_member"), value: 0},
        {text: LanguageModule.text("txt_can_see_card_of_other_member"), value: 1},
        {text: LanguageModule.text("txt_can_edit_card_of_other_member"), value: 2}
    ];
    content = {
        name: {
            title: LanguageModule.text("txt_name"),
            value: name
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

    buttons = [
        host.funcs.closeButton({
            onclick: function () {
                host.frameList.removeLast();
            }
        }),
        host.funcs.saveButton({
            onclick: function () {
                var value = singlePage.getValue();
                if (!value) return;
                carddone.boards.editBoardSave(host, id, value, 0);
            }
        }),
        host.funcs.saveCloseButton({
            onclick: function () {
                var value = singlePage.getValue();
                if (!value) return;
                carddone.boards.editBoardSave(host, id, value, 1);
            }
        })
    ];

    var formatList = host.database.formats.items.map(function(elt){
        return {
            value: elt.id,
            text: elt.name
        };
    });

    singlePage = host.funcs.boardEditForm({
        id: id,
        isPriv: isPriv,
        buttons: buttons,
        content: content,
        fieldList: fieldList,
        objectTypeList: objectTypeList,
        formatid: formatid,
        typelists: data_module.typelists,
        users: host.database.users,
        owner: owner,
        permissionList: permissionList,
        board_groupsList: board_groupsList,
        board_groupsIdList: board_groupsIdList,
        board_groupsIdCheckedList: board_groupsIdCheckedList
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.boards.makeMasterBoard = function(host, id){
    var bIndex = host.database.boards.getIndex(id);
    if (host.database.boards.items[bIndex].formatid) return;
    var name = host.database.boards.items[bIndex].name;
    var board_type = host.database.boards.items[bIndex].type2;
    var list = [];
    list = carddone.boards.listsData(host, host.database.boards.items[bIndex].childrenIdList, true);
    var fields = [];
    for (var i = 0; i < host.database.boards.items[bIndex].fieldIdList.length; i++){
        var fIndex = data_module.typelists.getIndex(host.database.boards.items[bIndex].fieldIdList[i]);
        fields.push({
            id: data_module.typelists.items[fIndex].id,
            name: data_module.typelists.items[fIndex].name
        });
    }
    var template = {
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

carddone.boards.redraw = function(host){
    var data = [], isPriv;
    var groupid = host.groups_select.value;
    for (var i = 0; i < host.database.boards.items.length; i++){
        if (groupid == -1){
            if (host.database.boards.items[i].groupIdList.length > 0) continue;
        }
        else if (groupid > 0){
            if (host.database.boards.items[i].groupIdList.indexOf(groupid) < 0) continue;
        }
        isPriv = function(userid, memberList){
            if (userid == systemconfig.userid) return true;
            else {
                for (var i = 0; i < memberList.length; i++){
                    if (memberList[i].userid == systemconfig.userid && memberList[i].type == 1){
                        return true;
                    }
                }
            }
            return false;
        }(host.database.boards.items[i].userid, host.database.boards.items[i].memberList);
        data.push({
            id: host.database.boards.items[i].id,
            name: host.database.boards.items[i].name,
            lindex: host.database.boards.items[i].lindex,
            formatid: host.database.boards.items[i].formatid,
            description: "",
            isPriv: isPriv,
            editFunc: function(id, isPriv){
                return function(){
                    carddone.boards.editBoard(host, id, isPriv);
                }
            }(host.database.boards.items[i].id, isPriv),
            openCardManager: function(id){
                return function(){
                    carddone.menu.loadPage(11, {boardid: id});
                }
            }(host.database.boards.items[i].id),
            makeMasterBoard: function(id){
                return function(){
                    carddone.boards.makeMasterBoard(host, id);
                }
            }(host.database.boards.items[i].id)
        });
    }
    var singlePage = host.funcs.boardContentDataForm({
        content: data,
        addNew: function(){
            return carddone.boards.editBoard(host, 0, true);
        }
    });
    host.board_container.clearChild();
    host.board_container.addChild(singlePage);
};

carddone.boards.init = function(host){
    if (!data_module.formats
        || !data_module.typelists
        || !data_module.users
        || !data_module.board_groups
        || !data_module.board_group_link
    ){
        setTimeout(function(){
            carddone.boards.init(host);
        }, 50);
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        return;
    }
    contentModule.makeBoardGroupIndex(host);
    host.database = {};
    host.holder.addChild(host.frameList);
    for (var i = 0; i < ModalElement.layerstatus.length; i++){
        if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
    }
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "board_load_list"}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    contentModule.makeDatabaseContent(host.database, content);
                    host.database.formats = data_module.formats;
                    host.database.users = data_module.users;
                    contentModule.makeListsIndex(host);
                    contentModule.makeListsIndex2(host);
                    contentModule.makeField_list(host);
                    contentModule.makeFormats_list(host);
                    contentModule.makeBoardMember(host);
                    contentModule.makeBoardGroupLinkIndex(host);
                    console.log(host.database);
                    host.board_container = absol._({});
                    var getItemGroup = function(id){
                        var index = data_module.board_groups.getIndex(id);
                        var items = [];
                        var ni;
                        for (var i = 0; i < data_module.board_groups.items[index].childrenIndexList.length; i++){
                            ni = data_module.board_groups.items[index].childrenIndexList[i];
                            if (data_module.board_groups.items[ni].available == 0) continue;
                            items.push(getItemGroup(data_module.board_groups.items[ni].id));
                        }
                        return {value: id, text: data_module.board_groups.items[index].name, items: items};
                    };
                    var listGroups = [
                        {value: 0, text: LanguageModule.text("txt_all")},
                        {value: -1, text: LanguageModule.text("txt_no_select_group")}
                    ];
                    for (var i = 0; i < data_module.board_groups.items.length; i++){
                        if (data_module.board_groups.items[i].available == 0) continue;
                        if (data_module.board_groups.items[i].parentid > 0) continue;
                        listGroups.push(getItemGroup(data_module.board_groups.items[i].id));
                    }
                    console.log(listGroups);
                    host.groups_select = absol.buildDom({
                        tag: "selecttreemenu",
                        style: {
                            verticalAlign: "middle"
                        },
                        props: {
                            items: listGroups
                        },
                        on: {
                            change: function(){
                                carddone.boards.redraw(host);
                            }
                        }
                    });
                    var singlePage = host.funcs.boardInitForm({
                        buttonlist: [
                            host.funcs.closeButton({
                                onclick: function () {
                                    carddone.menu.tabPanel.removeTab(host.holder.id);
                                }
                            })
                        ],
                        groups_select: host.groups_select,
                        board_container: host.board_container
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.boards.redraw(host);
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
};

ModuleManagerClass.register({
    name: "Boards",
    prerequisites: ["ModalElement", "FormClass"]
});
