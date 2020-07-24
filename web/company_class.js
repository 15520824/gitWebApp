carddone.company_class.deleteCompany_class = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "company_class_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = data_module.company_class.getIndex(id);
                        data_module.company_class.items.splice(index, 1);
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

carddone.company_class.deleteCompany_classConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.company_class.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [data_module.company_class.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.company_class.deleteCompany_class(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.company_class.addCompany_classSubmit = function(host, id, typesubmit){
    return new Promise(function(resolve,reject){
        var data = host.company_classEdit.getValue();
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = data_module.company_class.getIndex(id);
            data.ver = host.dataCompany_classEdit.ver;
        }
        else {
            data.ver = 1;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "company_class_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        data.lastmodifiedtime = new Date();
                        if (id > 0){
                            var index = data_module.company_class.getIndex(id);
                            data.userid = host.dataCompany_classEdit.userid;
                            data.ver = host.dataCompany_classEdit.ver + 1;
                            data.createdtime = host.dataCompany_classEdit.createdtime;
                            data_module.company_class.items[index] = data;
                            host.dataCompany_classEdit = data_module.company_class.items[index];
                            resolve(carddone.company_class.getCellCompany_class(host, id));
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data_module.company_class.items.push(data);
                            host.dataCompany_classEdit = data;
                            host.dataView.insertRow(host.funcs.formCompany_classGetRow(carddone.company_class.getCellCompany_class(host, id)));
                        }
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        else {
                            carddone.company_class.redrawDetails(host, id);
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

carddone.company_class.redrawDetails = function(host, id){
    return new Promise(function(resolve,reject){
        var cmdbutton = {
            close: function () {
                while (host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
            },
            save: function () {
                carddone.company_class.addCompany_classSubmit(host, id, 0).then(function(x){
                    resolve(x);
                });
            },
            save_close: function () {
                carddone.company_class.addCompany_classSubmit(host, id, 1).then(function(x){
                    resolve(x);
                });
            }
        };
        var data;
        if (id > 0){
            var index = data_module.company_class.getIndex(id);
            data = {
                name: host.dataCompany_classEdit.name,
                activemode: host.dataCompany_classEdit.available
            };
        }
        else {
            data = {
                name: "",
                activemode: true
            };
        }
        host.company_classEdit = host.funcs.formCompany_classEdit({
            cmdbutton: cmdbutton,
            data: data
        });
        host.frameList.addChild(host.company_classEdit);
        host.company_classEdit.requestActive();
    });
};

carddone.company_class.addCompany_class = function(host, id){
    return new Promise(function(resolve,reject){
        if (id == 0){
            carddone.company_class.redrawDetails(host, id);
        }
        else {
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "company_class_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            host.dataCompany_classEdit = st.company_class_details;
                            carddone.company_class.redrawDetails(host, id).then(function(x){
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

carddone.company_class.getCellCompany_class = function(host, id){
    var index = data_module.company_class.getIndex(id);
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.company_class.addCompany_class(host, id).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.company_class.deleteCompany_classConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: data_module.company_class.items[index].name,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.company_class.items[index].userid),
        available: contentModule.availableName(data_module.company_class.items[index].available),
        createdtime: contentModule.getTimeSend(data_module.company_class.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(data_module.company_class.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.company_class.redraw = function(host){
    var data = [];
    for (var i = 0; i < data_module.company_class.items.length; i++){
        data.push(carddone.company_class.getCellCompany_class(host, data_module.company_class.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formCompany_classContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.company_class.init = function(host){
    if (!data_module.users || !data_module.company_class){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.company_class.init(host);
        }, 50);
        return;
    }
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
        },
        add: function () {
            carddone.company_class.addCompany_class(host, 0);
        }
    };
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover"
        }
    });
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formCompany_classInit({
        cmdbutton: cmdbutton,
        data_container: host.data_container,
        inputsearchbox: host.inputsearchbox
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.company_class.redraw(host);
};
ModuleManagerClass.register({
    name: "Company_class",
    prerequisites: ["ModalElement", "FormClass"]
});
