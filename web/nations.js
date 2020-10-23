carddone.nations.deleteNation = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "nations_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.nations.getIndex(id);
                        host.database.nations.items.splice(index, 1);
                        resolve();
                        dbcache.refresh("nations");
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

carddone.nations.deleteNationConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.nations.getIndex(id);
        ModalElement.question({
            title: LanguageModule.text("war_title_delete_nation"),
            message: LanguageModule.text2("war_txt_detele", [host.database.nations.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.nations.deleteNation(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.nations.addNationSubmit = function(host, id, typesubmit){
    return new Promise(function(resolve,reject){
        var data = host.nationEdit.getValue();
        if (!data) return;
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = host.database.nations.getIndex(id);
            data.ver = host.dataNationEdit.ver;
        }
        else {
            data.ver = 1;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "nation_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        data.lastmodifiedtime = new Date();
                        if (id > 0){
                            var index = host.database.nations.getIndex(id);
                            host.database.nations.items[index].available = data.available;
                            host.database.nations.items[index].name = data.name;
                            host.database.nations.items[index].shortname = data.shortname;
                            host.database.nations.items[index].phonecode = data.phonecode;
                            host.database.nations.items[index].ver = data.ver + 1;
                            host.dataNationEdit = host.database.nations.items[index];
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            host.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data.cityIndexList = [];
                            host.database.nations.items.push(data);
                            host.dataNationEdit = data;
                        }
                        resolve(carddone.nations.getCellNation(host, id));
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        dbcache.refresh("nations");
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

carddone.nations.redrawDetails = function(host, id, resolve, resolveAdd){
    host.id = id;
    var cmdbutton = {
        close: function (event, me) {
            while (host.frameList.getLength() > 1){
                host.frameList.removeLast();
            }
        },
        save: function (event, me) {
            if (host.id == 0){
                carddone.nations.addNationSubmit(host, host.id, 0).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.nations.addNationSubmit(host, host.id, 0).then(function(x){
                    resolve(x);
                });
            }
        },
        save_close: function (event, me) {
            if (host.id == 0){
                carddone.nations.addNationSubmit(host, host.id, 1).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.nations.addNationSubmit(host, host.id, 1).then(function(x){
                    resolve(x);
                });
            }
        }
    };
    var name, shortname, phonecode, activemode, createdby, createdtime, lastmodifiedtime;
    if (id > 0){
        name = host.dataNationEdit.name;
        shortname = host.dataNationEdit.shortname;
        phonecode = host.dataNationEdit.phonecode;
        activemode = host.dataNationEdit.available;
        createdby = host.dataNationEdit.userid;
        createdtime = host.dataNationEdit.createdtime;
        lastmodifiedtime = host.dataNationEdit.lastmodifiedtime;
    }
    else {
        name = "";
        shortname = "";
        phonecode = "";
        activemode = true;
        createdby = systemconfig.userid;
        createdtime = new Date();
        lastmodifiedtime = new Date();
    }
    host.nationEdit = host.funcs.formNationEdit({
        cmdbutton: cmdbutton,
        id: id,
        name: name,
        shortname: shortname,
        phonecode: phonecode,
        activemode: activemode,
        createdby: contentModule.getUsernameByhomeidFromDataModule(createdby),
        createdtime: contentModule.getTimeSend(createdtime),
        lastmodifiedtime: contentModule.getTimeSend(lastmodifiedtime)
    });
    host.frameList.addChild(host.nationEdit);
    host.nationEdit.requestActive();
};

carddone.nations.addNation = function(host, id, resolve, resolveAdd){
    if (id == 0){
        carddone.nations.redrawDetails(host, id, resolve, resolveAdd);
    }
    else {
        ModalElement.show_loading();
        dbcache.loadById({
            name: "nations",
            id: id,
            callback: function (retval) {
                ModalElement.close(-1);
                if (retval !== undefined){
                    host.dataNationEdit = retval;
                    carddone.nations.redrawDetails(host, id, resolve, resolveAdd);
                }
                else {
                    ModalElement.alert({message: LanguageModule.text("war_text_data_is_null")});
                }
            }
        });
    }
};

carddone.nations.getCellNation = function(host, id){
    var index = host.database.nations.getIndex(id);
    var func = {
        edit: function(resolve){
            carddone.nations.addNation(host, id, resolve);
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.nations.deleteNationConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: host.database.nations.items[index].name,
        shortname: host.database.nations.items[index].shortname,
        phonecode: host.database.nations.items[index].phonecode,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.nations.items[index].userid),
        available: contentModule.availableName(host.database.nations.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.nations.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.nations.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.nations.redraw = function(host){
    host.database.nations.items.sort(function (a, b) {
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
        return 0;
    });
    var data = [];
    for (var i = 0; i < host.database.nations.items.length; i++){
        data.push(carddone.nations.getCellNation(host, host.database.nations.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formNationsContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.nations.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.nations.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    var st = {
        nations: []
    }
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
    host.database.nations.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "nations",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.nations.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    Promise.all([host.database.nations.sync]).then(function(){
        delete host.database.nations.sync;
        ModalElement.close(-1);
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
            close: function(host){
                return function (event, me) {
                    if (carddone.isMobile){
                        host.holder.selfRemove();
                        carddone.menu.loadPage(100);
                    }
                    else {
                        carddone.menu.tabPanel.removeTab(host.holder.id);
                    }
                }
            } (host),
            add: function(host){
                return function (event, me) {
                    carddone.nations.addNation(host, 0, function onSave(value){
                        host.newRecord = host.newRecord.updateCurrentRow(host.funcs.formNationGetRow(value));
                    }, function onAdd(value){
                        host.newRecord = host.dataView.insertRow(host.funcs.formNationGetRow(value));
                    });
                }
            } (host)
        };
        host.data_container = DOMElement.div({attrs: {style: {marginBottom: "200px"}}});
        host.holder.addChild(host.frameList);
        var singlePage = host.funcs.formNationsInit({
            cmdbutton: cmdbutton,
            data_container: host.data_container,
            inputsearchbox: host.inputsearchbox
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        carddone.nations.redraw(host);
    });
};
ModuleManagerClass.register({
    name: "Nations",
    prerequisites: ["ModalElement", "FormClass"]
});
