carddone.cities.deleteCities = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "cities_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.cities.getIndex(id);
                        host.database.cities.items.splice(index, 1);
                        resolve();
                        dbcache.refresh("cities");
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

carddone.cities.deleteCitiesConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.cities.getIndex(id);
        ModalElement.question({
            title: LanguageModule.text("war_title_delete_city"),
            message: LanguageModule.text2("war_txt_detele", [host.database.cities.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.cities.deleteCities(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.cities.addCitiesSubmit = function(host, id, typesubmit){
    return new Promise(function(resolve,reject){
        var data = host.cityEdit.getValue();
        if (!data) return;
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = host.database.cities.getIndex(id);
            data.ver = host.dataCityEdit.ver;
        }
        else {
            data.ver = 1;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "city_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        data.lastmodifiedtime = new Date();
                        if (id > 0){
                            var index = host.database.cities.getIndex(id);
                            host.database.cities.items[index].available = data.available;
                            host.database.cities.items[index].name = data.name;
                            host.database.cities.items[index].postalcode = data.postalcode;
                            host.database.cities.items[index].phonecode = data.phonecode;
                            host.database.cities.items[index].ver = data.ver + 1;
                            host.database.cities.items[index].nationid = data.nationid;
                            host.database.cities.items[index].nationIndex = host.database.nations.getIndex(data.nationid);
                            host.dataCityEdit = host.database.cities.items[index];
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            host.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data.districtIndexList = [];
                            data.nationIndex = host.database.nations.getIndex(data.nationid);
                            host.database.nations.items[data.nationIndex].cityIndexList.push(host.database.cities.items.length);
                            host.database.cities.items.push(data);
                            host.dataCityEdit = data;
                        }
                        resolve(carddone.cities.getCellCities(host, id));
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        dbcache.refresh("cities");
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

carddone.cities.redrawDetails = function(host, id, resolve, resolveAdd){
    host.id = id;
    var cmdbutton = {
        close: function (event, me) {
            while (host.frameList.getLength() > 1){
                host.frameList.removeLast();
            }
        },
        save: function (event, me) {
            if (host.id == 0){
                carddone.cities.addCitiesSubmit(host, host.id, 0).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.cities.addCitiesSubmit(host, host.id, 0).then(function(x){
                    resolve(x);
                });
            }
        },
        save_close: function (event, me) {
            if (host.id == 0){
                carddone.cities.addCitiesSubmit(host, host.id, 1).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.cities.addCitiesSubmit(host, host.id, 1).then(function(x){
                    resolve(x);
                });
            }
        }
    };
    var name, postalcode, phonecode, activemode, nationid, createdby, createdtime, lastmodifiedtime;
    if (id > 0){
        name = host.dataCityEdit.name;
        postalcode = host.dataCityEdit.postalcode;
        phonecode = host.dataCityEdit.phonecode;
        activemode = host.dataCityEdit.available;
        createdby = host.dataCityEdit.userid;
        createdtime = host.dataCityEdit.createdtime;
        lastmodifiedtime = host.dataCityEdit.lastmodifiedtime;
        nationid = host.dataCityEdit.nationid;
    }
    else {
        name = "";
        postalcode = "";
        phonecode = "";
        activemode = true;
        nationid = host.database.nations.items[0].id;
        createdby = systemconfig.userid;
        createdtime = new Date();
        lastmodifiedtime = new Date();
    }
    var listNation = [];
    for (var i = 0; i < host.database.nations.items.length; i++){
        listNation.push({value: host.database.nations.items[i].id, text: host.database.nations.items[i].name});
    }
    host.cityEdit = host.funcs.formCitiesEdit({
        id: id,
        cmdbutton: cmdbutton,
        name: name,
        postalcode: postalcode,
        phonecode: phonecode,
        nationid: nationid,
        listNation:listNation,
        activemode: activemode,
        createdby: contentModule.getUsernameByhomeidFromDataModule(createdby),
        createdtime: contentModule.getTimeSend(createdtime),
        lastmodifiedtime: contentModule.getTimeSend(lastmodifiedtime)
    });
    host.frameList.addChild(host.cityEdit);
    host.cityEdit.requestActive();
};

carddone.cities.addCities = function(host, id, resolve, resolveAdd){
    if (id == 0){
        carddone.cities.redrawDetails(host, id, resolve, resolveAdd);
    }
    else {
        ModalElement.show_loading();
        dbcache.loadById({
            name: "cities",
            id: id,
            callback: function (retval) {
                ModalElement.close(-1);
                if (retval !== undefined){
                    host.dataCityEdit = retval;
                    carddone.cities.redrawDetails(host, id, resolve, resolveAdd);
                }
                else {
                    ModalElement.alert({message: LanguageModule.text("war_text_data_is_null")});
                }
            }
        });
    }
};

carddone.cities.getCellCities = function(host, id){
    var index = host.database.cities.getIndex(id);
    var func = {
        edit: function(resolve){
            carddone.cities.addCities(host, id, resolve);
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.cities.deleteCitiesConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: host.database.cities.items[index].name,
        postalcode: host.database.cities.items[index].postalcode,
        phonecode: host.database.cities.items[index].phonecode,
        nation: host.database.nations.items[host.database.cities.items[index].nationIndex].name,
        nationid: host.database.cities.items[index].nationid,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.cities.items[index].userid),
        available: contentModule.availableName(host.database.cities.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.cities.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.cities.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.cities.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.cities.items.length; i++){
        data.push(carddone.cities.getCellCities(host, host.database.cities.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formCitiesContentData({
        data: data,
        inputsearchbox: host.inputsearchbox,
        nations_select: host.nations_select
    });
    host.data_container.appendChild(host.dataView);
};

carddone.cities.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.cities.init(host);
        }, 50);
        return;
    }
    var st = {
        nations: [],
        cities: []
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
    host.database.cities.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "cities",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.cities.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    Promise.all([
        host.database.nations.sync,
        host.database.cities.sync
    ]).then(function(){
        delete host.database.nations.sync;
        delete host.database.cities.sync;
        contentModule.makeCitiesIndexThanhYen(host);
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
            close: function (event, me) {
                if (carddone.isMobile){
                    host.holder.selfRemove();
                    carddone.menu.loadPage(100);
                }
                else {
                    carddone.menu.tabPanel.removeTab(host.holder.id);
                }
            }
        };
        if (host.database.nations.items.length > 0){
            cmdbutton.add = function (event, me) {
                carddone.cities.addCities(host, 0, function onSave(value){
                    host.newRecord = host.newRecord.updateCurrentRow(host.funcs.formCitiesGetRow(value));
                }, function onAdd(value){
                    host.newRecord = host.dataView.insertRow(host.funcs.formCitiesGetRow(value));
                });
            };
        }
        var listNations = [{value: 0, text: LanguageModule.text("txt_all")}];
        for (var i = 0; i < host.database.nations.items.length; i++){
            listNations.push({value: host.database.nations.items[i].name + "_" + host.database.nations.items[i].id, text: host.database.nations.items[i].name});
        }
        host.nations_select = absol.buildDom({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: listNations,
                enableSearch: true
            }
        });
        host.data_container = DOMElement.div({attrs: {style: {marginBottom: "200px"}}});
        host.holder.addChild(host.frameList);
        var singlePage = host.funcs.formCitiesInit({
            cmdbutton: cmdbutton,
            data_container: host.data_container,
            nations_select: host.nations_select,
            inputsearchbox: host.inputsearchbox
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        carddone.cities.redraw(host);
    });
};
ModuleManagerClass.register({
    name: "Cities",
    prerequisites: ["ModalElement", "FormClass"]
});
