'use strict';

carddone.board_groups.deleteBoardGroup = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "board_groups_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = data_module.board_groups.getIndex(id);
                        data_module.board_groups.items.splice(index, 1);
                        contentModule.makeBoardGroupIndex(host);
                        resolve();
                    }
                    else if (message == "failed_used"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_txt_can_not_delete")
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

carddone.board_groups.deleteBoardGroupConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.board_groups.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [data_module.board_groups.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.board_groups.deleteBoardGroup(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.board_groups.addBoardGroupSubmit = function(host, parentid, id, typesubmit){
    return new Promise(function(resolve, reject){
        var name = host.name_inputtext.value.trim();
        if (name === ""){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_no_name"),
                func: function(){
                    host.name_inputtext.focus();
                }
            });
        }
        var available = host.activated_inputselect.checked? 1: 0;
        var data = {
            id: id,
            parentid: parentid,
            name: name,
            available: available
        };
        if (id > 0){
            data.ver = host.dataBoardGroupDetails.ver;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "board_groups_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var oldid = id;
                        if (id == 0){
                            id = parseInt(message.substr(2));
                            data_module.board_groups.items.push({
                                id: id,
                                name: name,
                                parentid: parentid,
                                available: available,
                                ver: 1,
                                userid: systemconfig.userid,
                                createdtime: new Date(),
                                lastmodifiedtime: new Date(),
                                childrenIndexList: []
                            });
                            contentModule.makeBoardGroupIndex(host);
                            var index = data_module.board_groups.getIndex(id);
                            host.dataBoardGroupDetails = data_module.board_groups.items[index];
                        }
                        else {
                            var index = data_module.board_groups.getIndex(id);
                            host.dataBoardGroupDetails.childrenIndexList = data_module.board_groups.items[index].childrenIndexList;
                            host.dataBoardGroupDetails.name = name;
                            host.dataBoardGroupDetails.available = available;
                            host.dataBoardGroupDetails.lastmodifiedtime = new Date();
                            host.dataBoardGroupDetails.ver = host.dataBoardGroupDetails.ver + 1;
                            var index = data_module.board_groups.getIndex(id);
                            data_module.board_groups.items[index] = host.dataBoardGroupDetails;
                        }
                        var dataUpdate = carddone.board_groups.getDataCell(host, id);
                        if (parentid == 0 && oldid == 0){
                            host.dataView.insertRow(host.funcs.formBoardGroupsGetRow(dataUpdate));
                        }
                        else {
                            resolve(dataUpdate);
                        }
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        else {
                            carddone.board_groups.redrawAddBoardGroup(host, parentid, id);
                        }
                    }
                    else if (message == "failed_id"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.board_groups.init(host);
                            }
                        });
                    }
                    else if (message == "failed_ver"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.board_groups.addBoardGroup(host, parentid, );
                            }
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

carddone.board_groups.redrawAddBoardGroup = function(host, parentid, id){
    return new Promise(function(resolve,reject){
        var buttonlist = [
            host.funcs.closeButton({
                onclick: function(host){
                    return function (event, me) {
                        while (host.frameList.getLength() > 1){
                            host.frameList.removeLast();
                        }
                    }
                } (host)
            }),
            host.funcs.saveButton({
                onclick: function(host, parentid, id){
                    return function (event, me) {
                        carddone.board_groups.addBoardGroupSubmit(host, parentid, id, 0).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            }),
            host.funcs.saveCloseButton({
                onclick: function(host, parentid, id){
                    return function (event, me) {
                        carddone.board_groups.addBoardGroupSubmit(host, parentid, id, 1).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            })
        ];
        var parentName;
        if (parentid > 0){
            var pIndex = data_module.board_groups.getIndex(parentid);
            parentName = data_module.board_groups.items[pIndex].name;
        }
        host.name_inputtext = host.funcs.input({
            style: {minWidth: "400px", width: "100%"}
        });
        host.activated_inputselect = absol.buildDom({
            tag: 'switch',
            style: {
                'font-size': "var(--switch-fontsize)"
            }
        });
        if (id > 0) {
            host.name_inputtext.value = host.dataBoardGroupDetails.name;
            host.activated_inputselect.checked = host.dataBoardGroupDetails.available;
        }
        else {
            host.activated_inputselect.checked = true;
        }
        var singlePage = host.funcs.formBoardGroupsEdit({
            buttonlist: buttonlist,
            parentName: parentName,
            name_inputtext: host.name_inputtext,
            activated_inputselect: host.activated_inputselect,
            isparent: (parentid > 0)
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        host.name_inputtext.focus();
    });

};

carddone.board_groups.addBoardGroup = function(host, parentid, id){
    return new Promise(function(resolve,reject){
        if (id > 0){
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "board_groups_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0,2) == "ok"){
                            host.dataBoardGroupDetails = EncodingClass.string.toVariable(message.substr(2));
                            console.log(host.dataBoardGroupDetails);
                            carddone.board_groups.redrawAddBoardGroup(host, parentid, id).then(function(value){
                                resolve(value);
                            });
                        }
                        else if (message == "fail_id"){
                            ModalElement.alert({
                                message: LanguageModule.text("war_text_evaluation_reload_data"),
                                func: function(){
                                    carddone.board_groups.init(host);
                                }
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
        }
        else {
            carddone.board_groups.redrawAddBoardGroup(host, parentid, id).then(function(value){
                resolve(value);
            });
        }
    });
};

carddone.board_groups.getDataCell = function(host, id){
    var index = data_module.board_groups.getIndex(id);
    var child = [];
    var ni;
    for (var i = 0; i < data_module.board_groups.items[index].childrenIndexList.length; i++){
        ni = data_module.board_groups.items[index].childrenIndexList[i];
        child.push(carddone.board_groups.getDataCell(host, data_module.board_groups.items[ni].id));
    }
    var parentid = data_module.board_groups.items[index].parentid;
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.board_groups.addBoardGroup(host, parentid, id).then(function(value){
                    resolve(value);
                });
            });
        },
        add: function(){
            return new Promise(function(resolve,reject){
                carddone.board_groups.addBoardGroup(host, id, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.board_groups.deleteBoardGroupConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: data_module.board_groups.items[index].name,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.board_groups.items[index].userid),
        available: contentModule.availableName(data_module.board_groups.items[index].available),
        createdtime: contentModule.getTimeSend(data_module.board_groups.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(data_module.board_groups.items[index].lastmodifiedtime),
        func: func,
        child: child
    };
};

carddone.board_groups.redraw = function(host){
    var data = [];
    for (var i = 0; i < data_module.board_groups.items.length; i++){
        if (data_module.board_groups.items[i].parentid > 0) continue;
        data.push(carddone.board_groups.getDataCell(host, data_module.board_groups.items[i].id));
    }
    host.dataView = host.funcs.formBoardGroupsContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.board_groups.init = function(host){
    if (!data_module.users && !data_module.board_groups){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.board_groups.init(host);
        }, 50);
        return;
    }
    ModalElement.close(-1);
    contentModule.makeBoardGroupIndex(host);
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
        }
    };
    cmdbutton.add = function () {
        carddone.board_groups.addBoardGroup(host, 0, 0);
    };
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover"
        }
    });
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formBoardGroupsInit({
        cmdbutton: cmdbutton,
        data_container: host.data_container,
        inputsearchbox: host.inputsearchbox
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.board_groups.redraw(host);
};

ModuleManagerClass.register({
    name: "Board_groups",
    prerequisites: ["ModalElement", "FormClass"]
});
