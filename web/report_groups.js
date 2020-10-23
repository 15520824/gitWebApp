'use strict';

carddone.report_groups.deleteReportGroup = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "report_groups_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.report_groups.getIndex(id);
                        host.database.report_groups.items.splice(index, 1);
                        contentModule.makeReportGroupIndex(host);
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

carddone.report_groups.deleteReportGroupConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.report_groups.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [host.database.report_groups.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.report_groups.deleteReportGroup(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.report_groups.addReportGroupSubmit = function(host, parentid, id, typesubmit){
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
            data.ver = host.dataReportGroupDetails.ver;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "report_groups_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var oldid = id;
                        if (id == 0){
                            id = parseInt(message.substr(2));
                            host.database.report_groups.items.push({
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
                            contentModule.makeReportGroupIndex(host);
                            var index = host.database.report_groups.getIndex(id);
                            host.dataReportGroupDetails = host.database.report_groups.items[index];
                        }
                        else {
                            var index = host.database.report_groups.getIndex(id);
                            host.dataReportGroupDetails.childrenIndexList = host.database.report_groups.items[index].childrenIndexList;
                            host.dataReportGroupDetails.name = name;
                            host.dataReportGroupDetails.available = available;
                            host.dataReportGroupDetails.lastmodifiedtime = new Date();
                            host.dataReportGroupDetails.ver = host.dataReportGroupDetails.ver + 1;
                            var index = host.database.report_groups.getIndex(id);
                            host.database.report_groups.items[index] = host.dataReportGroupDetails;
                        }
                        var dataUpdate = carddone.report_groups.getDataCell(host, id);
                        if (parentid == 0 && oldid == 0){
                            host.dataView.insertRow(host.funcs.formReportGroupsGetRow(dataUpdate));
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
                            carddone.report_groups.redrawAddReportGroup(host, parentid, id);
                        }
                    }
                    else if (message == "failed_id"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.report_groups.init(host);
                            }
                        });
                    }
                    else if (message == "failed_ver"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.report_groups.addReportGroup(host, parentid, );
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

carddone.report_groups.redrawAddReportGroup = function(host, parentid, id){
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
                        carddone.report_groups.addReportGroupSubmit(host, parentid, id, 0).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            }),
            host.funcs.saveCloseButton({
                onclick: function(host, parentid, id){
                    return function (event, me) {
                        carddone.report_groups.addReportGroupSubmit(host, parentid, id, 1).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            })
        ];
        var parentName;
        if (parentid > 0){
            var pIndex = host.database.report_groups.getIndex(parentid);
            parentName = host.database.report_groups.items[pIndex].name;
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
            host.name_inputtext.value = host.dataReportGroupDetails.name;
            host.activated_inputselect.checked = host.dataReportGroupDetails.available;
        }
        else {
            host.activated_inputselect.checked = true;
        }
        var singlePage = host.funcs.formReportGroupsEdit({
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

carddone.report_groups.addReportGroup = function(host, parentid, id){
    return new Promise(function(resolve,reject){
        if (id > 0){
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "report_groups_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0,2) == "ok"){
                            host.dataReportGroupDetails = EncodingClass.string.toVariable(message.substr(2));
                            console.log(host.dataReportGroupDetails);
                            carddone.report_groups.redrawAddReportGroup(host, parentid, id).then(function(value){
                                resolve(value);
                            });
                        }
                        else if (message == "fail_id"){
                            ModalElement.alert({
                                message: LanguageModule.text("war_text_evaluation_reload_data"),
                                func: function(){
                                    carddone.report_groups.init(host);
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
            carddone.report_groups.redrawAddReportGroup(host, parentid, id).then(function(value){
                resolve(value);
            });
        }
    });
};

carddone.report_groups.getDataCell = function(host, id){
    var index = host.database.report_groups.getIndex(id);
    var child = [];
    var ni;
    for (var i = 0; i < host.database.report_groups.items[index].childrenIndexList.length; i++){
        ni = host.database.report_groups.items[index].childrenIndexList[i];
        child.push(carddone.report_groups.getDataCell(host, host.database.report_groups.items[ni].id));
    }
    var parentid = host.database.report_groups.items[index].parentid;
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.report_groups.addReportGroup(host, parentid, id).then(function(value){
                    resolve(value);
                });
            });
        },
        add: function(){
            return new Promise(function(resolve,reject){
                carddone.report_groups.addReportGroup(host, id, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.report_groups.deleteReportGroupConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: host.database.report_groups.items[index].name,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.report_groups.items[index].userid),
        available: contentModule.availableName(host.database.report_groups.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.report_groups.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.report_groups.items[index].lastmodifiedtime),
        func: func,
        child: child
    };
};

carddone.report_groups.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.report_groups.items.length; i++){
        if (host.database.report_groups.items[i].parentid > 0) continue;
        data.push(carddone.report_groups.getDataCell(host, host.database.report_groups.items[i].id));
    }
    host.dataView = host.funcs.formReportGroupsContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.report_groups.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.report_groups.init(host);
        }, 50);
        return;
    }
    host.database = {};
    dbcache.loadByCondition({
        name: "report_groups",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            ModalElement.close(-1);
            host.database.report_groups = data_module.makeDatabase(retval);
            contentModule.makeReportGroupIndex(host);
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
                carddone.report_groups.addReportGroup(host, 0, 0);
            };
            host.data_container = DOMElement.div({
                attrs: {
                    className: "cardsimpletableclass row2colors cardtablehover"
                }
            });
            host.holder.addChild(host.frameList);
            var singlePage = host.funcs.formReportGroupsInit({
                cmdbutton: cmdbutton,
                data_container: host.data_container,
                inputsearchbox: host.inputsearchbox
            });
            host.frameList.addChild(singlePage);
            singlePage.requestActive();
            carddone.report_groups.redraw(host);
        }
    });
};

ModuleManagerClass.register({
    name: "Report_groups",
    prerequisites: ["ModalElement", "FormClass"]
});
