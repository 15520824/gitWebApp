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
                        var index = data_module.cities.getIndex(id);
                        data_module.cities.items.splice(index, 1);
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

carddone.cities.deleteCitiesConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.cities.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [data_module.cities.items[index].name]),
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
            var index = data_module.cities.getIndex(id);
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
                            var index = data_module.cities.getIndex(id);
                            data_module.cities.items[index].available = data.available;
                            data_module.cities.items[index].name = data.name;
                            data_module.cities.items[index].postalcode = data.postalcode;
                            data_module.cities.items[index].phonecode = data.phonecode;
                            data_module.cities.items[index].ver = data.ver + 1;
                            data_module.cities.items[index].nationid = data.nationid;
                            data_module.cities.items[index].nationIndex = data_module.nations.getIndex(data.nationid);
                            host.dataCityEdit = data_module.cities.items[index];
                            resolve(carddone.cities.getCellCities(host, id));
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data.districtIndexList = [];
                            data.nationIndex = data_module.nations.getIndex(data.nationid);
                            data_module.nations.items[data.nationIndex].cityIndexList.push(data_module.cities.items.length);
                            data_module.cities.items.push(data);
                            host.dataCityEdit = data;
                            host.dataView.insertRow(host.funcs.formCitiesGetRow(carddone.cities.getCellCities(host, id)));
                        }
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        else {
                            carddone.cities.redrawDetails(host, id);
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

carddone.cities.redrawDetails = function(host, id){
    return new Promise(function(resolve,reject){
        var cmdbutton = {
            close: function (event, me) {
                while (host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
            },
            save: function (event, me) {
                carddone.cities.addCitiesSubmit(host, id, 0).then(function(x){
                    resolve(x);
                });
            },
            save_close: function (event, me) {
                carddone.cities.addCitiesSubmit(host, id, 1).then(function(x){
                    resolve(x);
                });
            }
        };
        var name, postalcode, phonecode, activemode, nationid;
        if (id > 0){
            name = host.dataCityEdit.name;
            postalcode = host.dataCityEdit.postalcode;
            phonecode = host.dataCityEdit.phonecode;
            activemode = host.dataCityEdit.available;
            nationid = host.dataCityEdit.nationid;
        }
        else {
            name = "";
            postalcode = "";
            phonecode = "";
            activemode = true;
            nationid = data_module.nations.items[0].id;
        }
        var listNation = [];
        for (var i = 0; i < data_module.nations.items.length; i++){
            listNation.push({value: data_module.nations.items[i].id, text: data_module.nations.items[i].name});
        }
        host.cityEdit = host.funcs.formCitiesEdit({
            cmdbutton: cmdbutton,
            name: name,
            postalcode: postalcode,
            phonecode: phonecode,
            nationid: nationid,
            listNation:listNation,
            activemode: activemode
        });
        host.frameList.addChild(host.cityEdit);
        host.cityEdit.requestActive();
    });
};

carddone.cities.addCities = function(host, id){
    return new Promise(function(resolve,reject){
        if (id == 0){
            carddone.cities.redrawDetails(host, id);
        }
        else {
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "cities_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            var index = data_module.cities.getIndex(id);
                            host.dataCityEdit = st.city_details;
                            carddone.cities.redrawDetails(host, id).then(function(x){
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

carddone.cities.getCellCities = function(host, id){
    var index = data_module.cities.getIndex(id);
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.cities.addCities(host, id).then(function(value){
                    resolve(value);
                });
            });
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
        name: data_module.cities.items[index].name,
        postalcode: data_module.cities.items[index].postalcode,
        phonecode: data_module.cities.items[index].phonecode,
        nation: data_module.nations.items[data_module.cities.items[index].nationIndex].name,
        nationid: data_module.cities.items[index].nationid,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.cities.items[index].userid),
        available: contentModule.availableName(data_module.cities.items[index].available),
        createdtime: contentModule.getTimeSend(data_module.cities.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(data_module.cities.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.cities.redraw = function(host){
    var data = [];
    for (var i = 0; i < data_module.cities.items.length; i++){
        data.push(carddone.cities.getCellCities(host, data_module.cities.items[i].id));
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
    if (!data_module.users || !data_module.nations || !data_module.cities){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.cities.init(host);
        }, 50);
        return;
    }
    ModalElement.close(-1);
    contentModule.makeCitiesIndex();
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
    if (data_module.nations.items.length > 0){
        cmdbutton.add = function (event, me) {
            carddone.cities.addCities(host, 0);
        };
    }
    var listNations = [{value: 0, text: LanguageModule.text("txt_all")}];
    for (var i = 0; i < data_module.nations.items.length; i++){
        listNations.push({value: data_module.nations.items[i].name + "_" + data_module.nations.items[i].id, text: data_module.nations.items[i].name});
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
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover"
        }
    });
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
};
ModuleManagerClass.register({
    name: "Cities",
    prerequisites: ["ModalElement", "FormClass"]
});
