carddone.company.deleteCompany = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "company_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = data_module.companies.getIndex(id);
                        data_module.companies.items.splice(index, 1);
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

carddone.company.deleteCompanyConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.companies.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [data_module.companies.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.company.deleteCompany(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.company.addCompanySubmit2 = function(host, id, data, isView, typesubmit){
    return new Promise(function(resolve,reject){
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = data_module.companies.getIndex(id);
            data.ver = host.dataCompanyEdit.ver;
        }
        else {
            data.ver = 1;
        }
        data.listOwnerAdd = [];
        data.listOwnerDel = [];
        if (id > 0){
            for (var i = 0; i < host.dataCompanyEdit.ownerList.length; i++){
                if (data.ownerList.indexOf(host.dataCompanyEdit.ownerList[i]) < 0) data.listOwnerDel.push(host.dataCompanyEdit.ownerList[i]);
            }
            for (var i = 0; i < data.ownerList.length; i++){
                if (host.dataCompanyEdit.ownerList.indexOf(data.ownerList[i]) < 0) data.listOwnerAdd.push(data.ownerList[i]);
            }
        }
        else {
            data.listOwnerAdd = data.ownerList;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "company_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        data.lastmodifiedtime = new Date();
                        data.cityIndex = data_module.cities.getIndex(data.cityid);
                        data.nationIndex = data_module.nations.getIndex(data.nationid);
                        data.districtIndex = data_module.districts.getIndex(data.districtid);
                        data.company_classIndex = data_module.company_class.getIndex(data.company_classid);
                        if (id > 0){
                            data.userid = host.dataCompanyEdit.userid;
                            data.ver = host.dataCompanyEdit.ver + 1;
                            data.createdtime = host.dataCompanyEdit.createdtime;
                            var index = data_module.companies.getIndex(id);
                            data_module.companies.items[index] = data;
                            host.dataCompanyEdit = data;
                            if (isView){
                                resolve(carddone.company.getCellCompany(host, id));
                            }
                            else {
                                data_module.companies.items.splice(index, 1);
                                resolve(false);
                            }
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            if (isView){
                                data_module.companies.items.push(data);
                                var x = carddone.company.getCellCompany(host, id);
                                var y = host.funcs.formCompanyGetRow(x);
                                host.dataViewCompany.insertRow(y);
                            }
                            host.dataCompanyEdit = data;
                        }
                        if (typesubmit == 1){
                            host.frameList.removeLast();
                        }
                        else {
                            if (isView){
                                carddone.company.redrawDetails(host, id);
                            }
                            else {
                                host.frameList.removeLast();
                            }
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

carddone.company.addCompanySubmit = function(host, id, typesubmit){
    return new Promise(function(resolve,reject){
        var data = host.companyEdit.getValue();
        if (data.ownerList.length == 0){
            ModalElement.alert({message: LanguageModule.text("war_txt_owner_is_null")});
            return;
        }
        var isView = false;
        if (data.ownerList.indexOf(systemconfig.userid) >= 0) isView = true;
        if (!isView){
            var uIndex = data_module.users.getByhomeid(systemconfig.userid);
            for (var i = 0; i < data_module.users.items[uIndex].descendanIdList.length; i++){
                if (data.ownerList.indexOf(data_module.users.items[uIndex].descendanIdList[i]) >= 0){
                    isView = true;
                    break;
                }
            }
        }
        if (!isView){
            ModalElement.question2({
                message: LanguageModule.text("war_user_lost_privilege_company"),
                onclick: function(sel){
                    if (sel == 0){
                        carddone.company.addCompanySubmit2(host, id, data, isView, typesubmit).then(function(value){
                            resolve(value);
                        });
                    }
                }
            });
            return;
        }
        carddone.company.addCompanySubmit2(host, id, data, isView, typesubmit).then(function(value){
            resolve(value);
        });
    });
};

carddone.company.getCellContact = function(host, id, companyid){
    var index = data_module.contact.getIndex(id);
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.contact.addContact(host, id, companyid).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.contact.deleteContactConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        firstname: data_module.contact.items[index].firstname,
        lastname: data_module.contact.items[index].lastname,
        phone: data_module.contact.items[index].phone,
        email: data_module.contact.items[index].email,
        phone2: data_module.contact.items[index].phone2,
        email2: data_module.contact.items[index].email2,
        comment: data_module.contact.items[index].comment,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.contact.items[index].userid),
        available: contentModule.availableName(data_module.contact.items[index].available),
        createdtime: contentModule.getTimeSend(data_module.contact.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(data_module.contact.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.company.redrawDetails = function(host, id){
    return new Promise(function(resolve,reject){
        var cmdbutton = {
            close: function () {
                host.frameList.removeLast();
            },
            save: function () {
                carddone.company.addCompanySubmit(host, id, 0).then(function(x){
                    resolve(x);
                });
            },
            save_close: function () {
                carddone.company.addCompanySubmit(host, id, 1).then(function(x){
                    resolve(x);
                });
            }
        };
        if (id > 0){
            cmdbutton.add_contact = function(){
                carddone.contact.addContact(host, 0, id).then(function(x){
                    resolve(x);
                });
            };
        }
        var listNation = [{
            value: 0,
            text: LanguageModule.text("txt_no_select"),
            cityList: [
                {
                    value: 0,
                    text: LanguageModule.text("txt_no_select"),
                    districtList: [
                        {
                            value: 0,
                            text: LanguageModule.text("txt_no_select"),
                        }
                    ]
                }
            ]
        }];
        var data, cIndex, dIndex;
        var cityList, districtList;
        for (var i = 0; i < data_module.nations.items.length; i++){
            cityList = [
                {
                    value: 0,
                    text: LanguageModule.text("txt_no_select"),
                    districtList: [
                        {
                            value: 0,
                            text: LanguageModule.text("txt_no_select"),
                        }
                    ]
                }
            ];
            for (var j = 0; j < data_module.nations.items[i].cityIndexList.length; j++){
                cIndex = data_module.nations.items[i].cityIndexList[j];
                districtList = [{value: 0, text: LanguageModule.text("txt_no_select")}];
                for (var k = 0; k < data_module.cities.items[cIndex].districtIndexList.length; k++){
                    kIndex = data_module.cities.items[cIndex].districtIndexList[k];
                    districtList.push({value: data_module.districts.items[kIndex].id, text: data_module.districts.items[kIndex].name})
                }
                cityList.push({value: data_module.cities.items[cIndex].id, text: data_module.cities.items[cIndex].name, districtList: districtList});
            }
            listNation.push({value: data_module.nations.items[i].id, text:data_module.nations.items[i].name, cityList: cityList});
        }
        var listCompany_class = [{value: 0, text: LanguageModule.text("txt_no_select")}];
        for (var i = 0; i < data_module.company_class.items.length; i++){
            listCompany_class.push({value: data_module.company_class.items[i].id, text: data_module.company_class.items[i].name});
        }
        var listOwnerAll = [];
        if (id > 0){
            for (var i = 0; i < data_module.users.items.length; i++){
                listOwnerAll.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
            }
            var ownerList = [];
            for (var i = 0; i < host.dataCompanyEdit.ownerList.length; i++){
                ownerList.push(host.dataCompanyEdit.ownerList[i]);
            }
            var dataContact = [];
            for (var i = 0; i < data_module.contact.items.length; i++){
                if (data_module.contact.items[i].companyid != id) continue;
                dataContact.push(carddone.company.getCellContact(host, data_module.contact.items[i].id, id));
            }
            host.dataViewContact = host.funcs.formContactContentData({
                data: dataContact,
                fromCompany: true
            });
            data = {
                name: host.dataCompanyEdit.name,
                fullname: host.dataCompanyEdit.fullname,
                address: host.dataCompanyEdit.address,
                company_classid: host.dataCompanyEdit.company_classid,
                cityid: host.dataCompanyEdit.cityid,
                nationid: host.dataCompanyEdit.nationid,
                districtid: host.dataCompanyEdit.districtid,
                gps: host.dataCompanyEdit.gps,
                phone: host.dataCompanyEdit.phone,
                email: host.dataCompanyEdit.email,
                fax: host.dataCompanyEdit.fax,
                website: host.dataCompanyEdit.website,
                taxcode: host.dataCompanyEdit.taxcode,
                comment: host.dataCompanyEdit.comment,
                createdby: contentModule.getUsernameByhomeidFromDataModule(host.dataCompanyEdit.userid),
                createdtime: contentModule.getTimeSend(host.dataCompanyEdit.createdtime),
                activemode: host.dataCompanyEdit.available,
                ownerList: ownerList,
                listNation: listNation,
                listOwnerAll: listOwnerAll,
                dataViewContact: host.dataViewContact
            };
        }
        else {
            for (var i = 0; i < data_module.users.items.length; i++){
                listOwnerAll.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
            }
            data = {
                name: "",
                fullname: "",
                address: "",
                cityid: 0,
                nationid: 0,
                districtid: 0,
                gps: "",
                phone: "",
                email: "",
                fax: "",
                website: "",
                taxcode: "",
                comment: "",
                activemode: true,
                ownerList: [systemconfig.userid],
                listNation: listNation,
                listOwnerAll: listOwnerAll,
                dataViewContact: DOMElement.div({})
            }
        }
        data.listCompany_class = listCompany_class;
        host.companyEdit = host.funcs.formCompanyEdit({
            cmdbutton: cmdbutton,
            data: data
        });
        if (host.frameList.getLength() > 1){
            host.frameList.removeLast();
        }
        host.frameList.addChild(host.companyEdit);
        host.companyEdit.requestActive();
    });
};

carddone.company.addCompany = function(host, id){
    return new Promise(function(resolve,reject){
        if (id == 0){
            carddone.company.redrawDetails(host, id);
        }
        else {
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "company_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            host.dataCompanyEdit = st.company_details;
                            carddone.company.redrawDetails(host, id).then(function(x){
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

carddone.company.viewCompanySubmit = function(host, id, typesubmit){

};

carddone.company.redrawViewCompany = function(host, id){
    return new Promise(function(resolve,reject){
        var cmdbutton = {
            close: function () {
                while (host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
            },
            save: function () {
                carddone.company.viewCompanySubmit(host, id, 0);
            },
            save_close: function () {
                carddone.company.viewCompanySubmit(host, id, 1);
            }
        };
        var data;
        host.companyView = host.funcs.formCompanyView({
            cmdbutton: cmdbutton,
            data: data
        });
        host.frameList.addChild(host.companyView);
        host.companyView.requestActive();
    });
};

carddone.company.viewCompany = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "company_details_view"},
                {name: "id", value: id}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        //console.log(st);
                    }
                    else {
                        ModalElement.alert({message: message});
                    }
                }
                else {
                    ModalElement.alert({
                        message: message
                    });
                }
            }
        });
    });
};

carddone.company.getCellCompany = function(host, id){
    var index = data_module.companies.getIndex(id);
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.company.addCompany(host, id).then(function(value){
                    resolve(value);
                });
            });
        },
        view: function(){
            carddone.company.viewCompany(host, id);
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.company.deleteCompanyConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: data_module.companies.items[index].name,
        fullname: data_module.companies.items[index].fullname,
        address: data_module.companies.items[index].address,
        company_classid: data_module.companies.items[index].company_classid,
        districtid: data_module.companies.items[index].districtid,
        cityid: data_module.companies.items[index].cityid,
        nationid: data_module.companies.items[index].nationid,
        company_class: (data_module.companies.items[index].company_classid == 0)? "" : data_module.company_class.items[data_module.companies.items[index].company_classIndex].name,
        district: (data_module.companies.items[index].districtid == 0)? "" : data_module.districts.items[data_module.companies.items[index].districtIndex].name,
        city: (data_module.companies.items[index].cityid == 0)? "" : data_module.cities.items[data_module.companies.items[index].cityIndex].name,
        nation: (data_module.companies.items[index].nationid == 0)? "" : data_module.nations.items[data_module.companies.items[index].nationIndex].name,
        gps: data_module.companies.items[index].gps,
        phone: data_module.companies.items[index].phone,
        email: data_module.companies.items[index].email,
        fax: data_module.companies.items[index].fax,
        website: data_module.companies.items[index].website,
        taxcode: data_module.companies.items[index].taxcode,
        comment: data_module.companies.items[index].comment,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.companies.items[index].userid),
        createdtime: contentModule.getTimeSend(data_module.companies.items[index].createdtime),
        available: contentModule.availableName(data_module.companies.items[index].available),
        lastmodifiedtime: contentModule.getTimeSend(data_module.companies.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.company.redraw = function(host){
    //console.log("redrawa__" + (new Date()).getTime());
    var data = [];
    for (var i = 0; i < data_module.companies.items.length; i++){
        data.push(carddone.company.getCellCompany(host, data_module.companies.items[i].id));
    }
    //console.log("redrawb__" + (new Date()).getTime());
    DOMElement.removeAllChildren(host.data_container);
    host.dataViewCompany = host.funcs.formCompanyContentData({
        data: data,
        inputsearchbox: host.inputsearchbox,
        company_class_select: host.company_class_select,
        nations_select: host.nations_select,
        city_select: host.city_select,
        district_select: host.district_select
    });
    host.data_container.appendChild(host.dataViewCompany);
    //console.log("done__" + (new Date()).getTime());
};

carddone.company.init2 = function(host){
    contentModule.makeCitiesIndex();
    contentModule.makeDistrictsIndex();
    contentModule.makeCompanyIndex();
    contentModule.makeContactIndex();
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
        carddone.company.addCompany(host, 0);
    };
    var getListDistrictByCity = function(nationid, id){
        var districtList;
        switch (id) {
            case 0:
                districtList = [
                    {value: 0, text: LanguageModule.text("txt_all")},
                    {value: "...", text: LanguageModule.text("txt_null")}
                ];
                for (var i = 0; i < data_module.districts.items.length; i++){
                    if (nationid != 0) if (data_module.districts.items[i].nationid != nationid) continue;
                    districtList.push({value: data_module.districts.items[i].name + "_" + data_module.districts.items[i].id, text: data_module.districts.items[i].name});
                }
                break;
            case -1:
                districtList = [{value: "...", text: LanguageModule.text("txt_null")}];
                break;
            default:
                districtList = [
                    {value: 0, text: LanguageModule.text("txt_all")},
                    {value: "...", text: LanguageModule.text("txt_null")}
                ];
                var index = data_module.cities.getIndex(id);
                var ni;
                for (var i = 0; i < data_module.cities.items[index].districtIndexList.length; i++){
                    ni = data_module.cities.items[index].districtIndexList[i];
                    districtList.push({value: data_module.districts.items[ni].name + "_" + data_module.districts.items[ni].id, text: data_module.districts.items[ni].name});
                }
                break;
        }
        return districtList;
    };
    var getListCityByNation = function(id){
        var cityList;
        switch (id) {
            case 0:
                cityList = [
                    {value: 0, text: LanguageModule.text("txt_all"), districtList: getListDistrictByCity(id, 0)},
                    {value: "...", text: LanguageModule.text("txt_null"), districtList: getListDistrictByCity(id, -1)}
                ];
                for (var i = 0; i < data_module.cities.items.length; i++){
                    cityList.push({
                        value: data_module.cities.items[i].name + "_" + data_module.cities.items[i].id,
                        text: data_module.cities.items[i].name,
                        districtList: getListDistrictByCity(id, data_module.cities.items[i].id)
                    });
                }
                break;
            case -1:
                cityList = [{value: "...", text: LanguageModule.text("txt_null"), districtList: getListDistrictByCity(id, -1)}];
                break;
            default:
                cityList = [
                    {value: 0, text: LanguageModule.text("txt_all"), districtList: getListDistrictByCity(id, 0)},
                    {value: "...", text: LanguageModule.text("txt_null"), districtList: getListDistrictByCity(id, -1)}
                ];
                var index = data_module.nations.getIndex(id);
                var ni;
                for (var i = 0; i < data_module.nations.items[index].cityIndexList.length; i++){
                    ni = data_module.nations.items[index].cityIndexList[i];
                    cityList.push({
                        value: data_module.cities.items[ni].name + "_" + data_module.cities.items[ni].id,
                        text: data_module.cities.items[ni].name,
                        districtList: getListDistrictByCity(id, data_module.cities.items[ni].id)
                    });
                }
                break;
        }
        return cityList;
    };
    var listNation = [
        {value: 0, text: LanguageModule.text("txt_all"), cityList: getListCityByNation(0)},
        {value: "...", text: LanguageModule.text("txt_null"), cityList: getListCityByNation(-1)}
    ];
    for (var i = 0; i < data_module.nations.items.length; i++){
        listNation.push({
            value: data_module.nations.items[i].name + "_" + data_module.nations.items[i].id,
            text: data_module.nations.items[i].name,
            cityList: getListCityByNation(data_module.nations.items[i].id)
        });
    }
    var listDistrict = [];
    host.district_select = absol.buildDom({
        tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
        style: {
            verticalAlign: "middle"
        },
        props: {
            items: listNation[0].cityList[0].districtList,
            value: listNation[0].cityList[0].districtList[0].value,
            enableSearch: true
        }
    });
    host.city_select = absol.buildDom({
        tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
        style: {
            verticalAlign: "middle"
        },
        props: {
            items: listNation[0].cityList,
            value: listNation[0].cityList[0].value,
            enableSearch: true
        },
        on: {
            change: function(){
                var listCity = this.items;
                for (var i = 0; i < listCity.length; i++){
                    if (listCity[i].value == this.value){
                        host.district_select.items = listCity[i].districtList;
                        host.district_select.value = listCity[i].districtList[0].value;
                        break;
                    }
                }
                host.district_select.emit("change");
            }
        }
    });
    host.nations_select = absol.buildDom({
       tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
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
                       host.city_select.value = listNation[i].cityList[0].value;
                       break;
                   }
               }
               host.city_select.emit("change");
           }
       }
    });
    var listClass = [
        {value: 0, text: LanguageModule.text("txt_all")},
        {value: "...", text: LanguageModule.text("txt_null")}
    ];
    for (var i = 0; i < data_module.company_class.items.length; i++){
        listClass.push({value: data_module.company_class.items[i].name + "_" + data_module.company_class.items[i].id, text: data_module.company_class.items[i].name});
    }
    host.company_class_select = absol.buildDom({
        tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
        style: {
            verticalAlign: "middle"
        },
        props: {
            items: listClass,
            enableSearch: true
        }
    });
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover"
        }
    });
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formCompanyInit({
        cmdbutton: cmdbutton,
        nations_select: host.nations_select,
        city_select: host.city_select,
        district_select: host.district_select,
        company_class_select: host.company_class_select,
        data_container: host.data_container,
        inputsearchbox: host.inputsearchbox,
        frameList: host.frameList
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.company.redraw(host);
    ModalElement.close(-1);
};

carddone.company.init = function(host){
    if (!data_module.users || !data_module.nations || !data_module.cities || !data_module.contact || !data_module.companies || !data_module.company_class || !data_module.owner_company_contact){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.company.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    //console.log("start__" + (new Date()).getTime());
    setTimeout(function(){
        carddone.company.init2(host);
    }, 100);

};
ModuleManagerClass.register({
    name: "Company",
    prerequisites: ["ModalElement", "FormClass"]
});
