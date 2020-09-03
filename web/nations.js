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
                        var index = data_module.nations.getIndex(id);
                        data_module.nations.items.splice(index, 1);
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

carddone.nations.deleteNationConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.nations.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [data_module.nations.items[index].name]),
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
            var index = data_module.nations.getIndex(id);
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
                            var index = data_module.nations.getIndex(id);
                            data_module.nations.items[index].available = data.available;
                            data_module.nations.items[index].name = data.name;
                            data_module.nations.items[index].shortname = data.shortname;
                            data_module.nations.items[index].phonecode = data.phonecode;
                            data_module.nations.items[index].ver = data.ver + 1;
                            host.dataNationEdit = data_module.nations.items[index];
                            resolve(carddone.nations.getCellNation(host, id));
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data.cityIndexList = [];
                            data_module.nations.items.push(data);
                            host.dataNationEdit = data;
                            host.dataView.insertRow(host.funcs.formNationGetRow(carddone.nations.getCellNation(host, id)));
                        }
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        else {
                            carddone.nations.redrawDetails(host, id);
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

carddone.nations.redrawDetails = function(host, id){
    return new Promise(function(resolve,reject){
        var cmdbutton = {
            close: function (event, me) {
                while (host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
            },
            save: function (event, me) {
                carddone.nations.addNationSubmit(host, id, 0).then(function(x){
                    resolve(x);
                });
            },
            save_close: function (event, me) {
                carddone.nations.addNationSubmit(host, id, 1).then(function(x){
                    resolve(x);
                });
            }
        };
        var name, shortname, phonecode, activemode;
        if (id > 0){
            name = host.dataNationEdit.name;
            shortname = host.dataNationEdit.shortname;
            phonecode = host.dataNationEdit.phonecode;
            activemode = host.dataNationEdit.available;
        }
        else {
            name = "";
            shortname = "";
            phonecode = "";
            activemode = true;
        }
        host.nationEdit = host.funcs.formNationEdit({
            cmdbutton: cmdbutton,
            name: name,
            shortname: shortname,
            phonecode: phonecode,
            activemode: activemode
        });
        host.frameList.addChild(host.nationEdit);
        host.nationEdit.requestActive();
    });
};

carddone.nations.addNation = function(host, id){
    return new Promise(function(resolve,reject){
        if (id == 0){
            carddone.nations.redrawDetails(host, id);
        }
        else {
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "nations_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            host.dataNationEdit = st.nation_details;
                            carddone.nations.redrawDetails(host, id).then(function(x){
                                resolve(x);
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
    });
};

carddone.nations.getCellNation = function(host, id){
    var index = data_module.nations.getIndex(id);
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.nations.addNation(host, id).then(function(value){
                    resolve(value);
                });
            });
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
        name: data_module.nations.items[index].name,
        shortname: data_module.nations.items[index].shortname,
        phonecode: data_module.nations.items[index].phonecode,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.nations.items[index].userid),
        available: contentModule.availableName(data_module.nations.items[index].available),
        createdtime: contentModule.getTimeSend(data_module.nations.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(data_module.nations.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.nations.redraw = function(host){
    data_module.nations.items.sort(function (a, b) {
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
        return 0;
    });
    var data = [];
    for (var i = 0; i < data_module.nations.items.length; i++){
        data.push(carddone.nations.getCellNation(host, data_module.nations.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formNationsContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.nations.init = function(host){
    if (!data_module.nations || !data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.nations.init(host);
        }, 50);
        return;
    }
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
                carddone.nations.addNation(host, 0);
            }
        } (host)
    };
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover"
        }
    });
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formNationsInit({
        cmdbutton: cmdbutton,
        data_container: host.data_container,
        inputsearchbox: host.inputsearchbox
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.nations.redraw(host);
};
ModuleManagerClass.register({
    name: "Nations",
    prerequisites: ["ModalElement", "FormClass"]
});
