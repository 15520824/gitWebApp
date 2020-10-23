carddone.districts.deleteDistricts = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "districts_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.districts.getIndex(id);
                        host.database.districts.items.splice(index, 1);
                        resolve();
                        dbcache.refresh("districts");
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

carddone.districts.deleteDistrictsConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.districts.getIndex(id);
        ModalElement.question({
            title: LanguageModule.text("war_title_delete_district"),
            message: LanguageModule.text2("war_txt_detele", [host.database.districts.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.districts.deleteDistricts(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.districts.addDistrictsSubmit = function(host, id, typesubmit){
    return new Promise(function(resolve,reject){
        var data = host.districtsEdit.getValue();
        if (!data) return;
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = host.database.districts.getIndex(id);
            data.ver = host.database.districts.items[index].ver;
        }
        else {
            data.ver = 1;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "districts_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        data.lastmodifiedtime = new Date();
                        if (id > 0){
                            var index = host.database.districts.getIndex(id);
                            host.database.districts.items[index].lastmodifiedtime = data.lastmodifiedtime;
                            host.database.districts.items[index].available = data.available;
                            host.database.districts.items[index].name = data.name;
                            host.database.districts.items[index].type = data.type;
                            host.database.districts.items[index].postalcode = data.postalcode;
                            host.database.districts.items[index].ver = data.ver + 1;
                            host.database.districts.items[index].nationid = data.nationid;
                            host.database.districts.items[index].cityid = data.cityid;
                            host.database.districts.items[index].nationIndex = host.database.nations.getIndex(data.nationid);
                            host.database.districts.items[index].cityIndex = host.database.cities.getIndex(data.cityid);
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            host.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data.nationIndex = host.database.nations.getIndex(data.nationid);
                            data.cityIndex = host.database.cities.getIndex(data.cityid);
                            host.database.cities.items[data.cityIndex].districtIndexList.push(host.database.districts.items.length);
                            host.database.districts.items.push(data);
                        }
                        resolve(carddone.districts.getCellDistricts(host, id));
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        dbcache.refresh("districts");
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

carddone.districts.redrawDetails = function(host, id, resolve, resolveAdd){
    host.id = id;
    var cmdbutton = {
        close: function (event, me) {
            while (host.frameList.getLength() > 1){
                host.frameList.removeLast();
            }
        },
        save: function (event, me) {
            if (host.id == 0){
                carddone.districts.addDistrictsSubmit(host, host.id, 0).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.districts.addDistrictsSubmit(host, host.id, 0).then(function(x){
                    resolve(x);
                });
            }
        },
        save_close: function (event, me) {
            if (host.id == 0){
                carddone.districts.addDistrictsSubmit(host, host.id, 1).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.districts.addDistrictsSubmit(host, host.id, 1).then(function(x){
                    resolve(x);
                });
            }
        }
    };
    var name, type, postalcode, activemode, nationid, cityid;
    if (id > 0){
        var index = host.database.districts.getIndex(id);
        name = host.database.districts.items[index].name;
        type = host.database.districts.items[index].type;
        postalcode = host.database.districts.items[index].postalcode;
        activemode = host.database.districts.items[index].available;
        nationid = host.database.districts.items[index].nationid;
        cityid = host.database.districts.items[index].cityid;
    }
    else {
        name = "";
        type = "";
        postalcode = "";
        activemode = true;
        nationid = 0;
        cityid = 0;
    }
    var listNation = [{
        value: 0,
        text: LanguageModule.text("txt_no_select"),
        cityList: [{value: 0, text: LanguageModule.text("txt_no_select")}]
    }];
    var data, cIndex;
    var cityList;
    for (var i = 0; i < host.database.nations.items.length; i++){
        cityList = [{value: 0, text: LanguageModule.text("txt_no_select")}];
        for (var j = 0; j < host.database.nations.items[i].cityIndexList.length; j++){
            cIndex = host.database.nations.items[i].cityIndexList[j];
            cityList.push({value: host.database.cities.items[cIndex].id, text: host.database.cities.items[cIndex].name})
        }
        listNation.push({value: host.database.nations.items[i].id, text:host.database.nations.items[i].name, cityList: cityList});
    }
    var params = {
        id: id,
        cmdbutton: cmdbutton,
        name: name,
        type: type,
        postalcode: postalcode,
        nationid: nationid,
        cityid: cityid,
        listNation: listNation,
        activemode: activemode
    };
    if (id > 0){
        params.createdby = contentModule.getUsernameByhomeidFromDataModule(host.database.districts.items[index].userid);
        params.createdtime = contentModule.getTimeSend(host.database.districts.items[index].createdtime);
        params.lastmodifiedtime = contentModule.getTimeSend(host.database.districts.items[index].lastmodifiedtime);
    }
    host.districtsEdit = host.funcs.formDistrictsEdit(params);
    host.frameList.addChild(host.districtsEdit);
    host.districtsEdit.requestActive();
};

carddone.districts.addDistricts = function(host, id, resolve, resolveAdd){
    if (id == 0){
        carddone.districts.redrawDetails(host, id, resolve, resolveAdd);
    }
    else {
        ModalElement.show_loading();
        dbcache.loadById({
            name: "districts",
            id: id,
            callback: function (retval) {
                ModalElement.close(-1);
                if (retval !== undefined){
                    var index = host.database.districts.getIndex(id);
                    if (index < 0){
                        host.database.districts.items.push(retval);
                    }
                    else {
                        host.database.districts.items[index] = retval;
                    }
                    carddone.districts.redrawDetails(host, id, resolve, resolveAdd);
                }
                else {
                    ModalElement.alert({message: LanguageModule.text("war_text_data_is_null")});
                }
            }
        });
    }
};

carddone.districts.getCellDistricts = function(host, id){
    var index = host.database.districts.getIndex(id);
    var func = {
        edit: function(resolve){
            carddone.districts.addDistricts(host, id, resolve);
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.districts.deleteDistrictsConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: host.database.districts.items[index].name,
        type: host.database.districts.items[index].type,
        postalcode: host.database.districts.items[index].postalcode,
        city: host.database.cities.items[host.database.districts.items[index].cityIndex].name,
        cityid: host.database.districts.items[index].cityid,
        nation: host.database.nations.items[host.database.districts.items[index].nationIndex].name,
        nationid: host.database.districts.items[index].nationid,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.districts.items[index].userid),
        available: contentModule.availableName(host.database.districts.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.districts.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.districts.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.districts.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.districts.items.length; i++){
        data.push(carddone.districts.getCellDistricts(host, host.database.districts.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formDistrictsContentData({
        data: data,
        inputsearchbox: host.inputsearchbox,
        nations_select: host.nations_select,
        city_select: host.city_select
    });
    host.data_container.appendChild(host.dataView);
};

carddone.districts.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.districts.init(host);
        }, 50);
        return;
    }
    var st = {
        nations: [],
        cities: [],
        districts: []
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
    host.database.districts.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "districts",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.districts.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    Promise.all([
        host.database.nations.sync,
        host.database.cities.sync,
        host.database.districts.sync
    ]).then(function(){
        delete host.database.nations.sync;
        delete host.database.cities.sync;
        delete host.database.districts.sync;
        ModalElement.close(-1);
        contentModule.makeCitiesIndexThanhYen(host);
        contentModule.makeDistrictsIndexThanhYen(host);
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
                carddone.districts.addDistricts(host, 0, function onSave(value){
                    host.newRecord = host.newRecord.updateCurrentRow(host.funcs.formDistrictsGetRow(value));
                }, function onAdd(value){
                    host.newRecord = host.dataView.insertRow(host.funcs.formDistrictsGetRow(value));
                });
            };
        }
        var cityList;
        cityList = [{value: 0, text: LanguageModule.text("txt_all")}];
        for (var i = 0; i < host.database.cities.items.length; i++){
            cityList.push({value: host.database.cities.items[i].name + "_" + host.database.cities.items[i].id, text: host.database.cities.items[i].name});
        }
        var listNation = [{
            value: 0,
            text: LanguageModule.text("txt_all"),
            cityList: cityList
        }];
        var data, cIndex;
        for (var i = 0; i < host.database.nations.items.length; i++){
            cityList = [{value: 0, text: LanguageModule.text("txt_all")}];
            for (var j = 0; j < host.database.nations.items[i].cityIndexList.length; j++){
                cIndex = host.database.nations.items[i].cityIndexList[j];
                cityList.push({value: host.database.cities.items[cIndex].name + "_" + host.database.cities.items[cIndex].id, text: host.database.cities.items[cIndex].name})
            }
            listNation.push({value: host.database.nations.items[i].name + "_" + host.database.nations.items[i].id, text:host.database.nations.items[i].name, cityList: cityList});
        }
        host.city_select = absol.buildDom({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: listNation[0].cityList,
                enableSearch: true
            }
        });
        host.nations_select = absol.buildDom({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: listNation,
                enableSearch: true
            },
            on: {
                change: function(){
                    for (var i = 0; i < listNation.length; i++){
                        if (listNation[i].value == this.value){
                            host.city_select.items = listNation[i].cityList;
                            host.city_select.value = 0;
                            break;
                        }
                    }
                    host.city_select.emit("change");
                }
            }
        });
        host.data_container = DOMElement.div({attrs: {style: {marginBottom: "200px"}}});
        host.holder.addChild(host.frameList);
        var singlePage = host.funcs.formDistrictsInit({
            cmdbutton: cmdbutton,
            data_container: host.data_container,
            nations_select: host.nations_select,
            city_select: host.city_select,
            inputsearchbox: host.inputsearchbox
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        carddone.districts.redraw(host);
    });
};
ModuleManagerClass.register({
    name: "Districts",
    prerequisites: ["ModalElement", "FormClass"]
});
