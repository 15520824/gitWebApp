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
                        var index = data_module.districts.getIndex(id);
                        data_module.districts.items.splice(index, 1);
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

carddone.districts.deleteDistrictsConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.districts.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [data_module.districts.items[index].name]),
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
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = data_module.districts.getIndex(id);
            data.ver = data_module.districts.items[index].ver;
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
                            var index = data_module.districts.getIndex(id);
                            data_module.districts.items[index].lastmodifiedtime = data.lastmodifiedtime;
                            data_module.districts.items[index].available = data.available;
                            data_module.districts.items[index].name = data.name;
                            data_module.districts.items[index].type = data.type;
                            data_module.districts.items[index].postalcode = data.postalcode;
                            data_module.districts.items[index].ver = data.ver + 1;
                            data_module.districts.items[index].nationid = data.nationid;
                            data_module.districts.items[index].cityid = data.cityid;
                            data_module.districts.items[index].nationIndex = data_module.nations.getIndex(data.nationid);
                            data_module.districts.items[index].cityIndex = data_module.cities.getIndex(data.cityid);
                            resolve(carddone.districts.getCellDistricts(host, id));
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data.nationIndex = data_module.nations.getIndex(data.nationid);
                            data.cityIndex = data_module.cities.getIndex(data.cityid);
                            data_module.cities.items[data.cityIndex].districtIndexList.push(data_module.districts.items.length);
                            data_module.districts.items.push(data);
                            host.dataView.insertRow(host.funcs.formDistrictsGetRow(carddone.districts.getCellDistricts(host, id)));
                        }
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        else {
                            carddone.districts.redrawDetails(host, id);
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

carddone.districts.redrawDetails = function(host, id){
    return new Promise(function(resolve,reject){
        var cmdbutton = {
            close: function (event, me) {
                while (host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
            },
            save: function (event, me) {
                carddone.districts.addDistrictsSubmit(host, id, 0).then(function(x){
                    resolve(x);
                });
            },
            save_close: function (event, me) {
                carddone.districts.addDistrictsSubmit(host, id, 1).then(function(x){
                    resolve(x);
                });
            }
        };
        var name, type, postalcode, activemode, nationid, cityid;
        if (id > 0){
            var index = data_module.districts.getIndex(id);
            name = data_module.districts.items[index].name;
            type = data_module.districts.items[index].type;
            postalcode = data_module.districts.items[index].postalcode;
            activemode = data_module.districts.items[index].available;
            nationid = data_module.districts.items[index].nationid;
            cityid = data_module.districts.items[index].cityid;
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
        for (var i = 0; i < data_module.nations.items.length; i++){
            cityList = [{value: 0, text: LanguageModule.text("txt_no_select")}];
            for (var j = 0; j < data_module.nations.items[i].cityIndexList.length; j++){
                cIndex = data_module.nations.items[i].cityIndexList[j];
                cityList.push({value: data_module.cities.items[cIndex].id, text: data_module.cities.items[cIndex].name})
            }
            listNation.push({value: data_module.nations.items[i].id, text:data_module.nations.items[i].name, cityList: cityList});
        }
        host.districtsEdit = host.funcs.formDistrictsEdit({
            cmdbutton: cmdbutton,
            name: name,
            type: type,
            postalcode: postalcode,
            nationid: nationid,
            cityid: cityid,
            listNation: listNation,
            activemode: activemode
        });
        host.frameList.addChild(host.districtsEdit);
        host.districtsEdit.requestActive();
    });
};

carddone.districts.addDistricts = function(host, id){
    return new Promise(function(resolve,reject){
        if (id == 0){
            carddone.districts.redrawDetails(host, id);
        }
        else {
            console.log(id);
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "districts_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            var index = data_module.districts.getIndex(id);
                            data_module.districts.items[index] = st.districts_details;
                            carddone.districts.redrawDetails(host, id).then(function(x){
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

carddone.districts.getCellDistricts = function(host, id){
    var index = data_module.districts.getIndex(id);
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.districts.addDistricts(host, id).then(function(value){
                    resolve(value);
                });
            });
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
        name: data_module.districts.items[index].name,
        type: data_module.districts.items[index].type,
        postalcode: data_module.districts.items[index].postalcode,
        city: data_module.cities.items[data_module.districts.items[index].cityIndex].name,
        cityid: data_module.districts.items[index].cityid,
        nation: data_module.nations.items[data_module.districts.items[index].nationIndex].name,
        nationid: data_module.districts.items[index].nationid,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.districts.items[index].userid),
        available: contentModule.availableName(data_module.districts.items[index].available),
        createdtime: contentModule.getTimeSend(data_module.districts.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(data_module.districts.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.districts.redraw = function(host){
    var data = [];
    for (var i = 0; i < data_module.districts.items.length; i++){
        data.push(carddone.districts.getCellDistricts(host, data_module.districts.items[i].id));
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
    if (!data_module.users || !data_module.nations || !data_module.cities || !data_module.districts){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.districts.init(host);
        }, 50);
        return;
    }
    ModalElement.close(-1);
    contentModule.makeCitiesIndex(host);
    contentModule.makeDistrictsIndex(host);
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
            carddone.districts.addDistricts(host, 0);
        };
    }
    var cityList;
    cityList = [{value: 0, text: LanguageModule.text("txt_all")}];
    for (var i = 0; i < data_module.cities.items.length; i++){
        cityList.push({value: data_module.cities.items[i].name + "_" + data_module.cities.items[i].id, text: data_module.cities.items[i].name});
    }
    var listNation = [{
        value: 0,
        text: LanguageModule.text("txt_all"),
        cityList: cityList
    }];
    var data, cIndex;
    for (var i = 0; i < data_module.nations.items.length; i++){
        cityList = [{value: 0, text: LanguageModule.text("txt_all")}];
        for (var j = 0; j < data_module.nations.items[i].cityIndexList.length; j++){
            cIndex = data_module.nations.items[i].cityIndexList[j];
            cityList.push({value: data_module.cities.items[cIndex].name + "_" + data_module.cities.items[cIndex].id, text: data_module.cities.items[cIndex].name})
        }
        listNation.push({value: data_module.nations.items[i].name + "_" + data_module.nations.items[i].id, text:data_module.nations.items[i].name, cityList: cityList});
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
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover"
        }
    });
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
};
ModuleManagerClass.register({
    name: "Districts",
    prerequisites: ["ModalElement", "FormClass"]
});
