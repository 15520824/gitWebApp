'use strict';

carddone.knowledge_groups.deleteKnowledgeGroup = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "knowledge_groups_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.knowledge_groups.getIndex(id);
                        host.database.knowledge_groups.items.splice(index, 1);
                        contentModule.makeKnowledgeGroupIndex(host);
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

carddone.knowledge_groups.deleteKnowledgeGroupConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.knowledge_groups.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [host.database.knowledge_groups.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.knowledge_groups.deleteKnowledgeGroup(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.knowledge_groups.addKnowledgeGroupSubmit = function(host, parentid, id, typesubmit){
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
            data.ver = host.dataKnowledgeGroupDetails.ver;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "knowledge_groups_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var oldid = id;
                        if (id == 0){
                            id = parseInt(message.substr(2));
                            host.database.knowledge_groups.items.push({
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
                            contentModule.makeKnowledgeGroupIndex(host);
                            var index = host.database.knowledge_groups.getIndex(id);
                            host.dataKnowledgeGroupDetails = host.database.knowledge_groups.items[index];
                        }
                        else {
                            var index = host.database.knowledge_groups.getIndex(id);
                            host.dataKnowledgeGroupDetails.childrenIndexList = host.database.knowledge_groups.items[index].childrenIndexList;
                            host.dataKnowledgeGroupDetails.name = name;
                            host.dataKnowledgeGroupDetails.available = available;
                            host.dataKnowledgeGroupDetails.lastmodifiedtime = new Date();
                            host.dataKnowledgeGroupDetails.ver = host.dataKnowledgeGroupDetails.ver + 1;
                            var index = host.database.knowledge_groups.getIndex(id);
                            host.database.knowledge_groups.items[index] = host.dataKnowledgeGroupDetails;
                        }
                        var dataUpdate = carddone.knowledge_groups.getDataCell(host, id);
                        if (parentid == 0 && oldid == 0){
                            host.dataView.insertRow(host.funcs.formKnowledgeGroupsGetRow(dataUpdate));
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
                            carddone.knowledge_groups.redrawAddKnowledgeGroup(host, parentid, id);
                        }
                        console.log(host.database.knowledge_groups.items);
                    }
                    else if (message == "failed_id"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.knowledge_groups.init(host);
                            }
                        });
                    }
                    else if (message == "failed_ver"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.knowledge_groups.addKnowledgeGroup(host, parentid, );
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

carddone.knowledge_groups.redrawAddKnowledgeGroup = function(host, parentid, id){
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
                        carddone.knowledge_groups.addKnowledgeGroupSubmit(host, parentid, id, 0).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            }),
            host.funcs.saveCloseButton({
                onclick: function(host, parentid, id){
                    return function (event, me) {
                        carddone.knowledge_groups.addKnowledgeGroupSubmit(host, parentid, id, 1).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            })
        ];
        var parentName;
        if (parentid > 0){
            var pIndex = host.database.knowledge_groups.getIndex(parentid);
            parentName = host.database.knowledge_groups.items[pIndex].name;
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
            host.name_inputtext.value = host.dataKnowledgeGroupDetails.name;
            host.activated_inputselect.checked = host.dataKnowledgeGroupDetails.available;
        }
        else {
            host.activated_inputselect.checked = true;
        }
        var singlePage = host.funcs.formKnowledgeGroupsEdit({
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

carddone.knowledge_groups.addKnowledgeGroup = function(host, parentid, id){
    return new Promise(function(resolve,reject){
        if (id > 0){
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "knowledge_groups_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0,2) == "ok"){
                            host.dataKnowledgeGroupDetails = EncodingClass.string.toVariable(message.substr(2));
                            console.log(host.dataKnowledgeGroupDetails);
                            carddone.knowledge_groups.redrawAddKnowledgeGroup(host, parentid, id).then(function(value){
                                resolve(value);
                            });
                        }
                        else if (message == "fail_id"){
                            ModalElement.alert({
                                message: LanguageModule.text("war_text_evaluation_reload_data"),
                                func: function(){
                                    carddone.knowledge_groups.init(host);
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
            carddone.knowledge_groups.redrawAddKnowledgeGroup(host, parentid, id).then(function(value){
                resolve(value);
            });
        }
    });
};

carddone.knowledge_groups.getDataCell = function(host, id){
    var index = host.database.knowledge_groups.getIndex(id);
    var child = [];
    var ni;
    for (var i = 0; i < host.database.knowledge_groups.items[index].childrenIndexList.length; i++){
        ni = host.database.knowledge_groups.items[index].childrenIndexList[i];
        child.push(carddone.knowledge_groups.getDataCell(host, host.database.knowledge_groups.items[ni].id));
    }
    var parentid = host.database.knowledge_groups.items[index].parentid;
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.knowledge_groups.addKnowledgeGroup(host, parentid, id).then(function(value){
                    resolve(value);
                });
            });
        },
        add: function(){
            return new Promise(function(resolve,reject){
                carddone.knowledge_groups.addKnowledgeGroup(host, id, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.knowledge_groups.deleteKnowledgeGroupConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: host.database.knowledge_groups.items[index].name,
        createdby: contentModule.getUsernameByhomeid(host, host.database.knowledge_groups.items[index].userid),
        available: contentModule.availableName(host.database.knowledge_groups.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.knowledge_groups.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.knowledge_groups.items[index].lastmodifiedtime),
        func: func,
        child: child
    };
};

carddone.knowledge_groups.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.knowledge_groups.items.length; i++){
        if (host.database.knowledge_groups.items[i].parentid > 0) continue;
        data.push(carddone.knowledge_groups.getDataCell(host, host.database.knowledge_groups.items[i].id));
    }
    host.dataView = host.funcs.formKnowledgeGroupsContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.knowledge_groups.init = function(host){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "knowledge_groups_load_list"}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    host.database = {};
                    contentModule.makeDatabaseContent(host.database, st);
                    contentModule.makeKnowledgeGroupIndex(host);
                    console.log(host.database);
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
                        carddone.knowledge_groups.addKnowledgeGroup(host, 0, 0);
                    };
                    host.data_container = DOMElement.div({
                        attrs: {
                            className: "cardsimpletableclass row2colors cardtablehover"
                        }
                    });
                    host.holder.addChild(host.frameList);
                    var singlePage = host.funcs.formKnowledgeGroupsInit({
                        cmdbutton: cmdbutton,
                        data_container: host.data_container,
                        inputsearchbox: host.inputsearchbox
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.knowledge_groups.redraw(host);
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
    name: "Knowledge_groups",
    prerequisites: ["ModalElement", "FormClass"]
});
