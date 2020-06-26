
'use strict';

carddone.master_board.template = function(){
    return {
        boardid: 0,
        template: {
            name: "",
            board_type: "general",
            list: [
                {
                    id: [],
                    name: "additional_status",
                    color: "aedd94",
                    type: "group",
                    child: []
                },
                {
                    id: [],
                    name: "finish_status",
                    color: "aedd94",
                    type: "group",
                    child: [
                        {
                            id: [],
                            name: LanguageModule.text("txt_finish"),
                            color: "dacafb",
                            type: "system"
                        }
                    ]
                }
            ],
            fields: []
        }
    };
}

carddone.master_board.editBoardSave = function(host, id, boardid, value, mode){
    var content = {
        board_type: value.board_type,
        list: value.list,
        fields: value.fields
    };
    console.log(value.list);
    console.log(value.fields);
    // return;
    ModalElement.show_loading();
    FormClass.api_call({
        url: "master_board_edit_save.php",
        params: [
            {name: "id", value: id},
            {name: "boardid", value: boardid},
            {name: "pindex", value: id == 0 ? host.database.master_board.items.length : host.database.master_board.items[host.database.master_board.getIndex(id)].pindex},
            {name: "name", value: value.name},
            {name: "content", value: EncodingClass.string.fromVariable(content)}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    content.content = EncodingClass.string.toVariable(content.content);
                    if (id == 0){
                        host.database.master_board.items.push(content);
                        id = content.id;
                    }
                    else {
                        var index = host.database.master_board.getIndex(id);
                        host.database.master_board.items[index] = content;
                    }
                    carddone.master_board.redraw(host);
                    if (mode == 0) carddone.master_board.editBoard(host, id);
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
    });
};

carddone.master_board.editBoard = function(host, id, params){
    var name, color, picture, favorite, available, board_type, object_of_board, object_type, list, object_group, fields;
    var bIndex, decoration, l_index, l_decoration, cIndex, fIndex, fieldList, objectTypeList, categoryContent, singlePage, boardid;
    var buttons, content;
    if (id == 0){
        bIndex = -1;
        boardid = params.boardid;
        name = params.template.name;
        board_type = params.template.board_type;
        list = params.template.list;
        fields = params.template.fields;
    }
    else {
        bIndex = host.database.master_board.getIndex(id);
        boardid = 0;
        name = host.database.master_board.items[bIndex].name;
        board_type = host.database.master_board.items[bIndex].content.board_type;
        list = host.database.master_board.items[bIndex].content.list;
        fields = host.database.master_board.items[bIndex].content.fields.map(function(elt) {
            return {
                id: elt,
                name: host.database.typelists.items[host.database.typelists.getIndex(elt)].name
            };
        });
    }
    fieldList = [];
    for (var i = 0; i < host.database.typelists.items.length; i++){
        if (host.database.typelists.items[i].object_selection == "field") fieldList.push({
            value: host.database.typelists.items[i].id,
            text: host.database.typelists.items[i].name
        });
    }
    content = {
        name: {
            title: LanguageModule.text("txt_name"),
            value: name
        },
        board_type: {
            title: LanguageModule.text("txt_board_type"),
            value: board_type
        },
        list: {
            title: LanguageModule.text("txt_phase"),
            value: list
        },
        fields: {
            title: LanguageModule.text("txt_field"),
            value: fields
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
                carddone.master_board.editBoardSave(host, id, boardid, value, 0);
            }
        }),
        host.funcs.saveCloseButton({
            onclick: function () {
                var value = singlePage.getValue();
                if (!value) return;
                carddone.master_board.editBoardSave(host, id, boardid, value, 1);
            }
        })
    ];

    singlePage = host.funcs.masterBoardEditForm({
        id: id,
        buttons: buttons,
        content: content,
        fieldList: fieldList
    });
    while(host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.master_board.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.master_board.items.length; i++){
        data.push({
            id: host.database.master_board.items[i].id,
            name: host.database.master_board.items[i].name,
            lindex: host.database.master_board.items[i].lindex,
            description: "",
            editFunc: function(id){
                return function(){
                    carddone.master_board.editBoard(host, id);
                }
            }(host.database.master_board.items[i].id)
        });
    }
    var singlePage = host.funcs.masterBoardInitForm({
        buttonlist: [
            host.funcs.closeButton({
                onclick: function () {
                    carddone.menu.tabPanel.removeTab(host.holder.id);
                }
            })
        ],
        content: data,
        addNew: function(){
            return carddone.master_board.editBoard(host, 0, carddone.master_board.template());
        }
    });
    host.board_container.clearChild();
    host.board_container.addChild(singlePage);
};

carddone.master_board.init = function(host, template){
    host.database = {};
    host.holder.addChild(host.frameList);
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "master_board_load_list"}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    contentModule.makeDatabaseContent(host.database, content);
                    host.database.master_board.items.forEach(function(elt){
                        elt.content = EncodingClass.string.toVariable(elt.content);
                    });
                    host.board_container = absol._({});
                    var singlePage = absol.buildDom({
                        tag: "singlepagenfooter",
                        child: host.board_container
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.master_board.redraw(host);
                    if (template) {
                        carddone.master_board.editBoard(host, 0, template);
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
    });
};

ModuleManagerClass.register({
    name: "Master_board",
    prerequisites: ["ModalElement", "FormClass"]
});
