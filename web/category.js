carddone.category.deleteCategory = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "category_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.category.getIndex(id);
                        host.database.category.items.splice(index, 1);
                        contentModule.makeCategoryIndex(host);
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

carddone.category.deleteCategoryConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.category.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [host.database.category.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.category.deleteCategory(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.category.addCategorySubmit = function(host, parentid, id, typesubmit){
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
            data.ver = host.dataCategoryDetails.ver;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "category_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var dataUpdate = {
                            name: name,
                            available: contentModule.availableName(available),
                            lastmodifiedtime: contentModule.getTimeSend(new Date()),
                            child: []
                        };
                        var oldid = id;
                        if (id == 0){
                            id = parseInt(message.substr(2));
                            host.database.category.items.push({
                                id: id,
                                name: name,
                                parentid: parentid,
                                available: available,
                                ver: 1,
                                userid: systemconfig.userid,
                                createdtime: new Date(),

                            });
                            contentModule.makeCategoryIndex(host);
                            dataUpdate.createdby = contentModule.getUsernameByhomeid(host, systemconfig.userid);
                            dataUpdate.createdtime = contentModule.getTimeSend(new Date());
                        }
                        else {
                            host.dataCategoryDetails.name = name;
                            host.dataCategoryDetails.available = available;
                            var index = host.database.category.getIndex(id);
                            host.database.category.items[index] = host.dataCategoryDetails;
                            dataUpdate.createdby = contentModule.getUsernameByhomeid(host, host.dataCategoryDetails.userid);
                            dataUpdate.createdtime = contentModule.getTimeSend(host.dataCategoryDetails.createdtime);
                        }
                        var func = {
                            edit: function(){
                                return new Promise(function(resolve,reject){
                                    carddone.category.addCategory(host, parentid, id).then(function(value){
                                        resolve(value);
                                    });
                                });
                            },
                            add: function(){
                                return new Promise(function(resolve,reject){
                                    carddone.category.addCategory(host, id, 0).then(function(value){
                                        resolve(value);
                                    });
                                });
                            },
                            delete: function(){
                                return new Promise(function(resolve,reject){
                                    carddone.category.deleteCategoryConfirm(host, id).then(function(value){
                                        resolve(value);
                                    });
                                });
                            }
                        };
                        dataUpdate.func = func;
                        if (parentid == 0 && oldid == 0){
                            host.dataView.insertRow(host.funcs.formCategoryGetRow(dataUpdate));
                        }
                        resolve(dataUpdate);
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        console.log(host.database.category.items);
                    }
                    else if (message == "failed_id"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.category.init(host);
                            }
                        });
                    }
                    else if (message == "failed_ver"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.category.addCategory(host, parentid, );
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

carddone.category.redrawAddCategory = function(host, parentid, id){
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
                        carddone.category.addCategorySubmit(host, parentid, id, 0).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            }),
            host.funcs.saveCloseButton({
                onclick: function(host, parentid, id){
                    return function (event, me) {
                        carddone.category.addCategorySubmit(host, parentid, id, 1).then(function(x){
                            resolve(x);
                        });
                    }
                } (host, parentid, id)
            })
        ];
        var parentName;
        if (parentid > 0){
            var pIndex = host.database.category.getIndex(parentid);
            parentName = host.database.category.items[pIndex].name;
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
            host.name_inputtext.value = host.dataCategoryDetails.name;
            host.activated_inputselect.checked = host.dataCategoryDetails.available;
        }
        else {
            host.activated_inputselect.checked = true;
        }
        var singlePage = host.funcs.formCategoryEdit({
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

carddone.category.addCategory = function(host, parentid, id){
    return new Promise(function(resolve,reject){
        if (id > 0){
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "category_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0,2) == "ok"){
                            host.dataCategoryDetails = EncodingClass.string.toVariable(message.substr(2));
                            console.log(host.dataCategoryDetails);
                            carddone.category.redrawAddCategory(host, parentid, id).then(function(value){
                                resolve(value);
                            });
                        }
                        else if (message == "fail_id"){
                            ModalElement.alert({
                                message: LanguageModule.text("war_text_evaluation_reload_data"),
                                func: function(){
                                    carddone.category.init(host);
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
            carddone.category.redrawAddCategory(host, parentid, id).then(function(value){
                resolve(value);
            });
        }
    })

};

carddone.category.getDataCell = function(host, id){
    var index = host.database.category.getIndex(id);
    var child = [];
    for (var i = 0; i < host.database.category.items[index].childrenIndexList.length; i++){
        child.push(carddone.category.getDataCell(host, host.database.category.items[host.database.category.items[index].childrenIndexList[i]].id));
    }
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.category.addCategory(host, host.database.category.items[index].parentid, id).then(function(value){
                    resolve(value);
                });
            });
        },
        add: function(){
            return new Promise(function(resolve,reject){
                carddone.category.addCategory(host, id, 0).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.category.deleteCategoryConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: host.database.category.items[index].name,
        createdby: contentModule.getUsernameByhomeid(host, host.database.category.items[i].userid),
        available: contentModule.availableName(host.database.category.items[i].available),
        createdtime: contentModule.getTimeSend(host.database.category.items[i].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.category.items[i].lastmodifiedtime),
        func: func,
        child: child
    };
};

carddone.category.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.category.items.length; i++){
        if (host.database.category.items[i].parentid > 0) continue;
        data.push(carddone.category.getDataCell(host, host.database.category.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formCategoryContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.category.init = function(host){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "category_load_list"}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    host.database = {};
                    contentModule.makeDatabaseContent(host.database, st);
                    contentModule.makeCategoryIndex(host);
                    host.inputsearchbox = absol.buildDom({
                        tag:'searchcrosstextinput',
                        style: {
                            width: "var(--searchbox-width)"
                        },
                        props:{
                            placeholder: LanguageModule.text("txt_search")
                        }
                    });
                    var buttonlist = [
                        host.funcs.closeButton({
                            onclick: function(host){
                                return function (event, me) {
                                    carddone.menu.tabPanel.removeTab(host.holder.id);
                                }
                            } (host)
                        }),
                        host.funcs.addButton({
                            onclick: function (host){
                                return function(event, me){
                                    carddone.category.addCategory(host, 0, 0);
                                }
                            }(host)
                        })
                    ];
                    host.data_container = DOMElement.div({
                        attrs: {className: "cardsimpletableclass row2colors cardtablehover"}
                    });
                    host.holder.addChild(host.frameList);
                    var singlePage = host.funcs.formCategoryInit({
                        buttonlist: buttonlist,
                        data_container: host.data_container,
                        inputsearchbox: host.inputsearchbox
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.category.redraw(host);
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
