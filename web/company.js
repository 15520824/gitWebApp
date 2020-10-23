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
                        var index = host.database.companies.getIndex(id);
                        host.database.companies.items.splice(index, 1);
                        index = host.listMerge.indexOf(id);
                        if (index >= 0) host.listMerge.splice(index, 1);
                        resolve();
                        dbcache.refresh("company");
                        dbcache.refresh("owner_company_contact");
                        dbcache.refresh("obj_company_contact");
                        host.companiesDic = contentModule.makeDictionaryIndex(host.database.companies.items);
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
        var index = host.database.companies.getIndex(id);
        ModalElement.question({
            title: LanguageModule.text("war_title_delete_company"),
            message: LanguageModule.text2("war_txt_detele", [host.database.companies.items[index].name]),
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
            var index = host.database.companies.getIndex(id);
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
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        host.database.objects.items = st.objects;
                        host.database.values.items = st.values;
                        data.lastmodifiedtime = new Date();
                        data.cityIndex = host.database.cities.getIndex(data.cityid);
                        data.nationIndex = host.database.nations.getIndex(data.nationid);
                        data.districtIndex = host.database.districts.getIndex(data.districtid);
                        data.company_classIndex = host.database.company_class.getIndex(data.company_classid);
                        data.permission = isView;
                        if (id > 0){
                            data.userid = host.dataCompanyEdit.userid;
                            data.ver = host.dataCompanyEdit.ver + 1;
                            data.createdtime = host.dataCompanyEdit.createdtime;
                            var index = host.database.companies.getIndex(id);
                            host.database.companies.items[index] = data;
                            host.companiesDic = contentModule.makeDictionaryIndex(host.database.companies.items);
                            host.dataCompanyEdit = data;
                            if (isView){
                                resolve(carddone.company.getCellCompany(host, id));
                            }
                            else {
                                host.database.companies.items.splice(index, 1);
                                resolve(false);
                            }
                        }
                        else {
                            id = st.id;
                            host.id = id;
                            data.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            if (isView){
                                host.database.companies.items.push(data);
                                host.companiesDic = contentModule.makeDictionaryIndex(host.database.companies.items);
                                resolve(carddone.company.getCellCompany(host, id));
                            }
                            host.dataCompanyEdit = data;
                        }

                        dbcache.refresh("company_card");
                        dbcache.refresh("company");
                        dbcache.refresh("contact_card");
                        dbcache.refresh("owner_company_contact");
                        dbcache.refresh("obj_company_contact");
                        dbcache.refresh("objects");
                        dbcache.refresh("values");
                        if (typesubmit == 1){
                            host.frameList.removeLast();
                        }
                        else {
                            if (!isView){
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
        if (!data) return;
        var listField = [];
        var dataObj, oIndex;
        host.database.objects.getIndexByTypeid = function(typeid){
            for (var i = 0; i < host.database.objects.items.length; i++){
                if (host.database.objects.items[i].typeid == typeid) return i;
            }
            return -1;
        };
        for (var i = 0; i < data.listField.length; i++){
            dataObj = {
                parentid: 0,
                name: "",
                type: "field",
                available: 1,
                privtype: host.database.typelists.items[host.database.typelists.getIndex(data.listField[i].typeid)].type,
                typeid: data.listField[i].typeid,
                value: data.listField[i].elt.getValue().value,
                listvalueiddel: []
            };
            oIndex = host.database.objects.getIndexByTypeid(dataObj.typeid);
            if (oIndex >= 0){
                host.database.objects.items[oIndex].remain = true;
                dataObj.ver = host.database.objects.items[oIndex].ver;
                dataObj.valueid = host.database.objects.items[oIndex].valueid;
                dataObj.id = host.database.objects.items[oIndex].id;
            }
            else {
                dataObj.ver = 1;
                dataObj.valueid = 0;
                dataObj.id = 0;
            }
            listField.push(dataObj);
        }
        var listObjDel = [];
        for (var i = 0; i < host.database.objects.items.length; i++){
            if (host.database.objects.items[i].remain === undefined) listObjDel.push(host.database.objects.items[i].id);
        }
        data.listField = listField;
        data.listObjDel = listObjDel;
        var isView = 0;
        if (systemconfig.privSystem >= 2) isView = 2;
        else if (data.ownerList.length == 0){
            isView = 2;
        }
        else if (data.ownerList.indexOf(systemconfig.userid) >= 0) isView = 2;
        else {
            for (var i = 0; i < host.database.company_class_member.items.length; i++){
                if (host.database.company_class_member.items[i].company_classid == data.company_classid){
                    isView = host.database.company_class_member.items[i].type;
                }
            }
        }
        if (isView < 2){
            var uIndex = data_module.users.getByhomeid(systemconfig.userid);
            for (var i = 0; i < data_module.users.items[uIndex].descendanIdList.length; i++){
                if (data.ownerList.indexOf(data_module.users.items[uIndex].descendanIdList[i]) >= 0){
                    isView = 2;
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
    var index = host.database.contact.getIndex(id);
    var func = {
        edit: function(resolve){
            carddone.contact.addContact(host, id, companyid, resolve);
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.contact.deleteContactConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        },
        view_card: function(){
            carddone.contact.viewlistCardPre(host, id);
        }
    };
    return {
        firstname: host.database.contact.items[index].firstname,
        lastname: host.database.contact.items[index].lastname,
        phone: host.database.contact.items[index].phone,
        email: host.database.contact.items[index].email,
        phone2: host.database.contact.items[index].phone2,
        email2: host.database.contact.items[index].email2,
        comment: host.database.contact.items[index].comment,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.contact.items[index].userid),
        available: contentModule.availableName(host.database.contact.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.contact.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.contact.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.company.redrawDetails = function(host, id, resolve, resolveAdd){
    host.id = id;
    var cmdbutton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            if (host.id == 0){
                carddone.company.addCompanySubmit(host, host.id, 0).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.company.addCompanySubmit(host, host.id, 0).then(function(x){
                    resolve(x);
                });
            }
        },
        save_close: function () {
            if (host.id == 0){
                carddone.company.addCompanySubmit(host, host.id, 1).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.company.addCompanySubmit(host, host.id, 1).then(function(x){
                    resolve(x);
                });
            }
        }
    };
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
    for (var i = 0; i < host.database.nations.items.length; i++){
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
        for (var j = 0; j < host.database.nations.items[i].cityIndexList.length; j++){
            cIndex = host.database.nations.items[i].cityIndexList[j];
            districtList = [{value: 0, text: LanguageModule.text("txt_no_select")}];
            for (var k = 0; k < host.database.cities.items[cIndex].districtIndexList.length; k++){
                kIndex = host.database.cities.items[cIndex].districtIndexList[k];
                districtList.push({value: host.database.districts.items[kIndex].id, text: host.database.districts.items[kIndex].name})
            }
            cityList.push({value: host.database.cities.items[cIndex].id, text: host.database.cities.items[cIndex].name, districtList: districtList});
        }
        listNation.push({value: host.database.nations.items[i].id, text:host.database.nations.items[i].name, cityList: cityList});
    }
    var listCompany_class = [{value: 0, text: LanguageModule.text("txt_no_select")}];
    for (var i = 0; i < host.database.company_class.items.length; i++){
        listCompany_class.push({value: host.database.company_class.items[i].id, text: host.database.company_class.items[i].name});
    }
    var listOwnerAll = [];
    if (id > 0){
        if (host.dataCompanyEdit.permission >= 2){
            cmdbutton.add_contact = function(){
                carddone.contact.addContact(host, 0, host.id, function onSave(value){
                    host.newRecordContact = host.newRecordContact.updateCurrentRow(host.funcs.formContactGetRow(value));
                }, function onAdd(value){
                    host.newRecordContact = host.dataViewContact.insertRow(host.funcs.formContactGetRow(value));
                });
            };
        }
        for (var i = 0; i < data_module.users.items.length; i++){
            listOwnerAll.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
        }
        var ownerList = [];
        for (var i = 0; i < host.dataCompanyEdit.ownerList.length; i++){
            ownerList.push(host.dataCompanyEdit.ownerList[i]);
        }
        var dataContact = [];
        for (var i = 0; i < host.database.contact.items.length; i++){
            if (host.database.contact.items[i].companyid != id) continue;
            dataContact.push(carddone.company.getCellContact(host, host.database.contact.items[i].id, id));
        }
        host.dataViewContact = host.funcs.formContactContentData({
            data: dataContact,
            fromCompany: true
        });
        data = {
            id: host.dataCompanyEdit.id,
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
            permission: host.dataCompanyEdit.permission,
            createdby: contentModule.getUsernameByhomeidFromDataModule(host.dataCompanyEdit.userid),
            createdtime: contentModule.getTimeSend(host.dataCompanyEdit.createdtime),
            lastmodifiedtime: contentModule.getTimeSend(host.dataCompanyEdit.lastmodifiedtime),
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
            id: 0,
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
            dataViewContact: DOMElement.div({}),
            permission: 2
        };
    }
    data.listCompany_class = listCompany_class;
    data.id = host.id;
    host.companyEdit = host.funcs.formCompanyEdit({
        cmdbutton: cmdbutton,
        data: data,
        database: host.database,
        listValueId: []
    });
    if (host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(host.companyEdit);
    host.companyEdit.requestActive();
};

carddone.company.addCompany = function(host, id, resolve, resolveAdd){
    if (id == 0){
        var st = {
            objects: [],
            values: [],
            contact: []
        };
        contentModule.makeDatabaseContent(host.database, st);
        carddone.company.redrawDetails(host, id, resolve, resolveAdd);
    }
    else {
        var index = host.database.companies.getIndex(id);
        if (index < 0){
            ModalElement.alert({
                message: LanguageModule.text("war_text_data_is_null"),
                func: function(){
                    carddone.company.init(host);
                }
            });
            return;
        }
        host.dataCompanyEdit = host.database.companies.items[index];
        ModalElement.show_loading();
        var b = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "contact",
                cond: function(record){
                    return record.companyid == id;
                },
                callback: function (retval) {
                    var st = {
                        contact: EncodingClass.string.duplicate(retval)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    rs();
                }
            });
        });
        var c = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "obj_company_contact",
                cond: function(record){
                    return record.cid == id && record.type == 'company';
                },
                callback: function (retval) {
                    var st = {
                        obj_company_contact: EncodingClass.string.duplicate(retval)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    rs();
                }
            });
        });
        var values;
        var d = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "values",
                cond: function(record){
                    return true;
                },
                callback: function (retval) {
                    var st = {
                        values: EncodingClass.string.duplicate(retval)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    rs();
                }
            });
        });
        Promise.all([b, c, d]).then(function(){
            var objids = [];
            for (var i = 0; i < host.database.obj_company_contact.items.length; i++){
                objids.push(host.database.obj_company_contact.items[i].objid);
            }
            dbcache.loadByCondition({
                name: "objects",
                cond: function(record){
                    return objids.indexOf(record.id) >= 0;
                },
                callback: function (retval) {
                    var st = {
                        objects: EncodingClass.string.duplicate(retval)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    var values = [], valueid, valueIndex, descendantids = [], x;
                    for (var i = 0; i < host.database.objects.items.length; i++){
                        valueid = host.database.objects.items[i].valueid;
                        valueIndex = host.database.values.getIndex(valueid);
                        if (valueIndex < 0) continue;
                        values.push(host.database.values.items[valueIndex]);
                        x = host.database.values.items[valueIndex].descendantid.split("_");
                        for (var j = 0; j < x.length; j++){
                            if (x[j] == "") continue;
                            descendantids.push(parseInt(x[j], 10));
                        }
                    }
                    for (var i = 0; i < host.database.values.items.length; i++){
                        if (descendantids.indexOf(host.database.values.items[i].id) >= 0){
                            values.push(host.database.values.items[i]);
                        }
                    }
                    host.database.values.items = values;
                    ModalElement.close(-1);
                    carddone.company.redrawDetails(host, id, resolve, resolveAdd);
                }
            });
        });
    }
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
        resolve();
    });
};

carddone.company.mergeCompanySave = function(host){
    var data = host.companyMerge.getValue();
    var index = host.database.companies.getIndex(host.listMerge[0]);
    data.ver = host.database.companies.items[index].ver;
    data.lastmodifiedtime = new Date();
    data.userid = systemconfig.userid;
    console.log(data);
    var listObjDel = [];
    for (var i = 0; i < host.database.objects.items.length; i++){
        if (data.listObj.indexOf(host.database.objects.items[i].id) < 0) listObjDel.push(host.database.objects.items[i].id);
    }
    var getIndexFromObjCompanyContact = function(objid){
        for (var i = 0; i < host.database.obj_company_contact.items.length; i++){
            if (host.database.obj_company_contact.items[i].objid == objid) return i;
        }
        return -1;
    };
    var listObjUpdate = [], tempIndex;
    for (var i = 0; i < data.listObj.length; i++){
        tempIndex = getIndexFromObjCompanyContact(data.listObj[i]);
        if (tempIndex < 0) continue;
        if (host.database.obj_company_contact.items[tempIndex].cid == host.listMerge[0]) continue;
        listObjUpdate.push({
            id: host.database.obj_company_contact.items[tempIndex].id,
            cid: host.listMerge[0]
        });
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "company_merge_save.php",
        params: [
            {name: "data", value: EncodingClass.string.fromVariable(data)},
            {name: "listObjDel", value: EncodingClass.string.fromVariable(listObjDel)},
            {name: "listObjUpdate", value: EncodingClass.string.fromVariable(listObjUpdate)},
            {name: "listMerge", value: EncodingClass.string.fromVariable(host.listMerge)}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            console.log(message);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var index, indexTable;
                    var listMerge = EncodingClass.string.duplicate(host.listMerge);
                    host.listMerge = [];
                    for (var i = 0; i < listMerge.length; i++){
                        index = host.database.companies.getIndex(listMerge[i]);
                        indexTable = -1;
                        for (var j = 0; j < host.data.length; j++){
                            if (host.data[j].id == listMerge[i]){
                                indexTable = j;
                                break;
                            }
                        }
                        if (i == 0){
                            data.id = listMerge[0];
                            data.company_classid = host.database.companies.items[index].company_classid;
                            data.company_classIndex = host.database.companies.items[index].company_classIndex;
                            data.createdtime = host.database.companies.items[index].createdtime;
                            data.cityIndex = host.database.cities.getIndex(data.cityid);
                            data.nationIndex = host.database.nations.getIndex(data.nationid);
                            data.districtIndex = host.database.districts.getIndex(data.districtid);
                            host.database.companies.items[index] = data;
                            if (indexTable < 0) continue;
                            host.data[indexTable] = host.funcs.formCompanyGetRow(carddone.company.getCellCompany(host, listMerge[0]));
                        }
                        else {
                            host.database.companies.items.splice(index, 1);
                            if (indexTable < 0) continue;
                            host.data.splice(indexTable, 1);
                        }
                        if (host.inputidboxes["merge_checkbox_" + listMerge[i]] !== undefined){
                            host.inputidboxes["merge_checkbox_" + listMerge[i]].style.visibility = "hidden";
                        }
                    }
                    host.dataViewCompany.updateTable(undefined, host.data);
                    host.dataViewCompany.resetHash();
                    host.district_select.emit("change");
                    host.company_class_select.emit("change");
                    host.companiesDic = contentModule.makeDictionaryIndex(host.database.companies.items);
                    host.frameList.removeLast();
                    dbcache.refresh("company_card");
                    dbcache.refresh("company");
                    dbcache.refresh("owner_company_contact");
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

carddone.company.mergeCompany = function(host){
    var cmdbutton = {
        close: function () {
            while (host.frameList.getLength() > 1){
                host.frameList.removeLast();
            }
        },
        merge: function () {
            carddone.company.mergeCompanySave(host);
        }
    };
    var data = {
        shortNameItems: [],
        fullNameItems: [],
        addressItems: [],
        nationItems: [],
        cityItems: [],
        districtItems: [],
        gpsItems: [],
        phoneItems: [],
        emailItems: [],
        faxItems: [],
        websiteItems: [],
        taxcodeItems: [],
        commentItems: [],
        activeItems: []
    };
    var getIndexFromItems = function(items, value){
        for (var i = 0; i < items.length; i++){
            if (items[i].value === value) return i;
        }
        return -1;
    };
    var getNationName = function(nationid){
        var index = host.database.nations.getIndex(nationid);
        if (index < 0)  return LanguageModule.text("txt_no_select");
        return host.database.nations.items[index].name;
    };
    var getCityName = function(cityid){
        var index = host.database.cities.getIndex(cityid);
        if (index < 0)  return LanguageModule.text("txt_no_select");
        return host.database.cities.items[index].name;
    };
    var getDistrictName = function(districtid){
        var index = host.database.districts.getIndex(districtid);
        if (index < 0)  return LanguageModule.text("txt_no_select");
        return host.database.districts.items[index].name;
    };
    var getActiveName = function(value){
        switch (value) {
            case 1:
                return LanguageModule.text("txt_yes");
            case 0:
            default:
                return LanguageModule.text("txt_no");
        }
    };
    for (var i = 0; i < host.database.company_details.items.length; i++){
        if (getIndexFromItems(data.shortNameItems, host.database.company_details.items[i].name) < 0){
            data.shortNameItems.push({value: host.database.company_details.items[i].name, text: host.database.company_details.items[i].name});
        }

        if (getIndexFromItems(data.fullNameItems, host.database.company_details.items[i].fullname) < 0)
        data.fullNameItems.push({value: host.database.company_details.items[i].fullname, text: host.database.company_details.items[i].fullname});

        if (getIndexFromItems(data.addressItems, host.database.company_details.items[i].address) < 0)
        data.addressItems.push({value: host.database.company_details.items[i].address, text: host.database.company_details.items[i].address});

        if (getIndexFromItems(data.nationItems, host.database.company_details.items[i].nationid) < 0)
        data.nationItems.push({value: host.database.company_details.items[i].nationid, text: getNationName(host.database.company_details.items[i].nationid)});

        if (getIndexFromItems(data.cityItems, host.database.company_details.items[i].cityid) < 0)
        data.cityItems.push({value: host.database.company_details.items[i].cityid, text: getCityName(host.database.company_details.items[i].cityid)});

        if (getIndexFromItems(data.districtItems, host.database.company_details.items[i].districtid) < 0)
        data.districtItems.push({value: host.database.company_details.items[i].districtid, text: getDistrictName(host.database.company_details.items[i].districtid)});

        if (getIndexFromItems(data.gpsItems, host.database.company_details.items[i].gps) < 0)
        data.gpsItems.push({value: host.database.company_details.items[i].gps, text: host.database.company_details.items[i].gps});

        if (getIndexFromItems(data.phoneItems, host.database.company_details.items[i].phone) < 0)
        data.phoneItems.push({value: host.database.company_details.items[i].phone, text: host.database.company_details.items[i].phone});

        if (getIndexFromItems(data.emailItems, host.database.company_details.items[i].email) < 0)
        data.emailItems.push({value: host.database.company_details.items[i].email, text: host.database.company_details.items[i].email});

        if (getIndexFromItems(data.shortNameItems, host.database.company_details.items[i].name) < 0)
        data.shortNameItems.push({value: host.database.company_details.items[i].name, text: host.database.company_details.items[i].name});

        if (getIndexFromItems(data.faxItems, host.database.company_details.items[i].fax) < 0)
        data.faxItems.push({value: host.database.company_details.items[i].fax, text: host.database.company_details.items[i].fax});

        if (getIndexFromItems(data.websiteItems, host.database.company_details.items[i].website) < 0)
        data.websiteItems.push({value: host.database.company_details.items[i].website, text: host.database.company_details.items[i].website});

        if (getIndexFromItems(data.taxcodeItems, host.database.company_details.items[i].taxcode) < 0)
        data.taxcodeItems.push({value: host.database.company_details.items[i].taxcode, text: host.database.company_details.items[i].taxcode});

        if (data.activeItems.indexOf(host.database.company_details.items[i].available) < 0)
        data.activeItems.push(host.database.company_details.items[i].available);

        data.commentItems.push(host.database.company_details.items[i].comment);
    }
    var company_classid = host.database.company_details.items[0].company_classid;
    var company_classIndex = host.database.company_class.getIndex(company_classid);
    if (company_classIndex < 0){
        data.markerColor = systemconfig.markerColor;
    }
    else {
        if (host.database.company_class.items[company_classIndex].color == "") data.markerColor = systemconfig.markerColor;
        else data.markerColor = host.database.company_class.items[company_classIndex].color;

    }
    var listTypeClass = {};
    for (var i = 0; i < host.database.field_company_class.items.length; i++){
        if (host.database.field_company_class.items[i].company_classid != company_classid) continue;
        listTypeClass[host.database.field_company_class.items[i].typeid] = [];
    }
    var typeid;
    for (var i = 0; i < host.database.objects.items.length; i++){
        typeid = host.database.objects.items[i].typeid;
        if (listTypeClass[typeid] === undefined) continue;
        listTypeClass[typeid].push(host.database.objects.items[i].id);
    }
    host.companyMerge = host.funcs.formCompanyMerge({
        cmdbutton: cmdbutton,
        data: data,
        database: host.database,
        listTypeClass: listTypeClass,
        listValueId: []
    });
    if (host.frameList.getLength() > 1){
        host.frameList.removeLast();
    }
    host.frameList.addChild(host.companyMerge);
    host.companyMerge.requestActive();
};

carddone.company.mergeCompanyLoad = function(host){
    if (host.listMerge.length < 2){
        ModalElement.alert({message: "chưa chọn đủ item để merge"});
        return;
    }
    ModalElement.show_loading();
    var a = new Promise(function(resolve, reject){
        dbcache.loadByIds({
            name: "company",
            ids: host.listMerge,
            callback: function (retval) {
                var st = {
                    company_details: EncodingClass.string.duplicate(retval)
                };
                contentModule.makeDatabaseContent(host.database, st);
                resolve();
            }
        });
    });
    var b = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "obj_company_contact",
            cond: function(record){
                return host.listMerge.indexOf(record.cid) >= 0 && record.type == 'company';
            },
            callback: function (retval) {
                var st = {
                    obj_company_contact: EncodingClass.string.duplicate(retval)
                };
                contentModule.makeDatabaseContent(host.database, st);
                resolve();
            }
        });
    });
    var values;
    var c = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "values",
            cond: function(record){
                return true;
            },
            callback: function (retval) {
                var st = {
                    values: EncodingClass.string.duplicate(retval)
                };
                contentModule.makeDatabaseContent(host.database, st);
                resolve();
            }
        });
    });
    Promise.all([a, b, c]).then(function(){
        var objids = [];
        for (var i = 0; i < host.database.obj_company_contact.items.length; i++){
            objids.push(host.database.obj_company_contact.items[i].objid);
        }
        dbcache.loadByCondition({
            name: "objects",
            cond: function(record){
                return objids.indexOf(record.id) >= 0;
            },
            callback: function (retval) {
                var st = {
                    objects: EncodingClass.string.duplicate(retval)
                };
                contentModule.makeDatabaseContent(host.database, st);
                var values = [], valueid, valueIndex, descendantids = [], x;
                for (var i = 0; i < host.database.objects.items.length; i++){
                    valueid = host.database.objects.items[i].valueid;
                    valueIndex = host.database.values.getIndex(valueid);
                    if (valueIndex < 0) continue;
                    values.push(host.database.values.items[valueIndex]);
                    x = host.database.values.items[valueIndex].descendantid.split("_");
                    for (var j = 0; j < x.length; j++){
                        if (x[j] == "") continue;
                        descendantids.push(parseInt(x[j], 10));
                    }
                }
                for (var i = 0; i < host.database.values.items.length; i++){
                    if (descendantids.indexOf(host.database.values.items[i].id) >= 0){
                        values.push(host.database.values.items[i]);
                    }
                }
                host.database.values.items = values;
                ModalElement.close(-1);
                carddone.company.mergeCompany(host);
            }
        });
    });
};

carddone.company.viewlistCardDraw = function(host, params){
    var dataView = [], row, tIndex;
    for (var i = 0; i < host.database.cards.items.length; i++){
        if (host.database.cards.items[i].permission == "no") continue;
        row = {
            cardid: host.database.cards.items[i].id,
            cardName: host.database.cards.items[i].name,
            permission: host.database.cards.items[i].permission,
            listid: host.database.cards.items[i].parentid,
            listName: host.database.lists.items[host.database.cards.items[i].listIndex].name,
            createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.cards.items[i].userid),
            createdtime: host.database.cards.items[i].createdtime
        };
        if (host.database.cards.items[i].listIndex < 0) continue;
        tIndex = host.database.lists.items[host.database.cards.items[i].listIndex].parentIndex;
        if (tIndex < 0) continue;
        tIndex = host.database.lists.items[tIndex].boardIndex;
        if (tIndex < 0) continue;
        row.boardName = host.database.boards.items[tIndex].name;
        row.boardid = host.database.boards.items[tIndex].id;
        row.func = {
            openCard: function(row){
                return function(){
                    carddone.menu.loadPage(11, row);
                }
            }(row)
        };
        dataView.push(row);
    }
    var index, cName;
    switch (params.type) {
        case "company":
            index = host.database.companies.getIndex(params.id);
            if (index >= 0) cName = host.database.companies.items[index].name;
            break;
        case "contact":
            index = host.database.contact.getIndex(params.id);
            if (index >= 0) cName = host.database.contact.items[index].firstname;
            break;
    };
    var singlePage = theme.formCardListLink({
        cmdbutton: params.cmdbutton,
        data: dataView,
        cName: cName,
        database: host.database
    });
    return singlePage;
};

carddone.company.viewlistCard = function(params){
    return new Promise(function(resolve, reject){
        var host = {
            database: {}
        };
        ModalElement.show_loading();
        switch (params.type) {
            case 'company':
                var a = new Promise(function(rs, rj){
                    dbcache.loadByCondition({
                        name: "company_card",
                        cond: function (record) {
                            return record.companyid == params.id;
                        },
                        callback: function (retval) {
                            var st = {
                                company_card: EncodingClass.string.duplicate(retval),
                                contact_card: []
                            };
                            contentModule.makeDatabaseContent(host.database, st);
                            rs();
                        }
                    });
                });
                break;
            case 'contact':
                var a = new Promise(function(rs, rj){
                    dbcache.loadByCondition({
                        name: "contact_card",
                        cond: function (record) {
                            return record.contactid == params.id;
                        },
                        callback: function (retval) {
                            var st = {
                                company_card: [],
                                contact_card: EncodingClass.string.duplicate(retval)
                            };
                            contentModule.makeDatabaseContent(host.database, st);
                            rs();
                        }
                    });
                });
                break;
        }
        var lists;
        var b = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "lists",
                cond: function (record) {
                    return true;
                },
                callback: function (retval) {
                    lists = retval;
                    var st = {
                        lists: [],
                        cards: [],
                        boards: []
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    rs();
                }
            });
        });
        var c = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "list_member",
                cond: function (record) {
                    return record.userid == systemconfig.userid;
                },
                callback: function (retval) {
                    var st = {
                        list_member: EncodingClass.string.duplicate(retval)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    rs();
                }
            });
        });
        var d = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "company",
                cond: function (record) {
                    return true;
                },
                callback: function (retval) {
                    var st = {
                        companies: EncodingClass.string.duplicate(retval)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    rs();
                }
            });
        });
        var e = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "contact",
                cond: function (record) {
                    return true;
                },
                callback: function (retval) {
                    var st = {
                        contact: EncodingClass.string.duplicate(retval)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    rs();
                }
            });
        });
        var f = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "account_groups",
                cond: function (record) {
                    return true;
                },
                callback: function (retval) {
                    host.database.account_groups = data_module.makeDatabase(retval);
                    resolve();
                }
            });
        });
        var g = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "privilege_groups",
                cond: function (record) {
                    return true;
                },
                callback: function (retval) {
                    host.database.privilege_groups = data_module.makeDatabase(retval);
                    resolve();
                }
            });
        });
        var h = new Promise(function(resolve, reject){
            dbcache.loadByCondition({
                name: "privilege_group_details",
                cond: function (record) {
                    return true;
                },
                callback: function (retval) {
                    host.database.privilege_group_details = data_module.makeDatabase(retval);
                    resolve();
                }
            });
        });
        Promise.all([a, b, c, d, e, f, g, h]).then(function(){
            var cardidsList = [];
            if (params.type == "company"){
                for (var i = 0; i < host.database.company_card.items.length; i++){
                    cardidsList.push(host.database.company_card.items[i].hostid);
                }
            }
            else {
                for (var i = 0; i < host.database.contact_card.items.length; i++){
                    cardidsList.push(host.database.contact_card.items[i].hostid);
                }
            }
            var index;
            var listids = [];
            for (var i = 0 ; i < lists.length; i++){
                if (lists[i].type != "card") continue;
                index = cardidsList.indexOf(lists[i].id);
                if (index >= 0) {
                    host.database.cards.items.push(lists[i]);
                    listids.push(lists[i].parentid);
                    cardidsList.splice(index, 1);
                    if (cardidsList.length == 0) break;
                }
            }
            var listids2 = [];
            for (var i = 0; i < lists.length; i++){
                if (lists[i].type != "list") continue;
                index = listids.indexOf(lists[i].id);
                if (index >= 0) {
                    host.database.lists.items.push(lists[i]);
                    listids2.push(lists[i].parentid);
                    listids.splice(index, 1);
                    if (listids.length == 0) break;
                }
            }
            listids = [];
            for (var i = 0; i < lists.length; i++){
                if (lists[i].type != "list") continue;
                index = listids2.indexOf(lists[i].id);
                if (index >= 0) {
                    host.database.lists.items.push(lists[i]);
                    listids.push(lists[i].parentid);
                    listids2.splice(index, 1);
                    if (listids2.length == 0) break;
                }
            }
            for (var i = 0; i < lists.length; i++){
                if (lists[i].type != "board") continue;
                index = listids.indexOf(lists[i].id);
                if (index >= 0) {
                    host.database.boards.items.push(lists[i]);
                    listids.splice(index, 1);
                    if (listids.length == 0) break;
                }
            }
            contentModule.makeAccountGroupPrivilegeSystem(host);
            contentModule.makePriviledgeOfUserGroups(host);
            contentModule.makeActivitiesCardIndexThanhYen(host);
            ModalElement.close(-1);
            resolve(carddone.company.viewlistCardDraw(host, params));
        });
    });
};


carddone.company.viewlistCardPre = function(host, id){
    carddone.company.viewlistCard({
        id: id,
        type: "company",
        cmdbutton: {
            close: function(){
                host.frameList.removeLast();
            }
        }
    }).then(function(singlePage){
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
    });
};

carddone.company.convertToContactSubmit = function(host, id){
    return new Promise(function(resolve, reject){

    });
};

carddone.company.convertToContact = function(host, id){
    return new Promise(function(resolve, reject){
        var index = host.database.companies.getIndex(id);
        if (index < 0){
            ModalElement.alert({
                message: LanguageModule.text("war_text_data_is_null"),
                func: function(){
                    carddone.company.init(host);
                }
            });
            return;
        }
        var listOwnerAll = [];
        for (var i = 0; i < data_module.users.items.length; i++){
            listOwnerAll.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
        }
        var data = {
            id: host.database.companies.items[index].id,
            name: host.database.companies.items[index].name,
            fullname: host.database.companies.items[index].fullname,
            address: host.database.companies.items[index].address,
            company_classid: host.database.companies.items[index].company_classid,
            cityid: host.database.companies.items[index].cityid,
            nationid: host.database.companies.items[index].nationid,
            districtid: host.database.companies.items[index].districtid,
            gps: host.database.companies.items[index].gps,
            phone: host.database.companies.items[index].phone,
            email: host.database.companies.items[index].email,
            fax: host.database.companies.items[index].fax,
            website: host.database.companies.items[index].website,
            taxcode: host.database.companies.items[index].taxcode,
            comment: host.database.companies.items[index].comment,
            permission: host.database.companies.items[index].permission,
            createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.companies.items[index].userid),
            createdtime: contentModule.getTimeSend(host.database.companies.items[index].createdtime),
            lastmodifiedtime: contentModule.getTimeSend(host.database.companies.items[index].lastmodifiedtime),
            activemode: host.database.companies.items[index].available,
            ownerList: host.database.companies.items[index].ownerList,
            listOwnerAll: listOwnerAll
        };
        var cmdbutton = {
            close: function(){
                host.frameList.removeLast();
            },
            convert: function(){
                return carddone.company.convertToContactSubmit(host, id);
            }
        };
        host.companyConvert = host.funcs.formCompanyConvert({
            cmdbutton: cmdbutton,
            data: data
        });
        if (host.frameList.getLength() > 1){
            host.frameList.removeLast();
        }
        host.frameList.addChild(host.companyConvert);
        host.companyConvert.requestActive();
    });
};

carddone.company.getCellCompany = function(host, id){
    var index = host.companiesDic[id];
    var func = {
        edit: function(resolve){
            carddone.company.addCompany(host, id, resolve);
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
        },
        view_card: function(){
            carddone.company.viewlistCardPre(host, id);
        },
        convertToContact: function(){
            return carddone.company.convertToContact(host, id);
        }
    };
    var merge_checkbox;
    if (host.database.companies.items[index].company_classid != 0 && host.database.companies.items[index].permission >= 2){
        merge_checkbox = function(id){
            host.inputidboxes["merge_checkbox_" + id] = absol.buildDom({
                tag: "checkboxinput",
                on: {
                    change: function(){
                        if (this.checked) {
                            host.listMerge.push(id);
                            if (host.listMerge.length == 1){
                                var index = host.database.companies.getIndex(id);
                                var company_classid = host.database.companies.items[index].company_classid;
                                for (var i = 0; i < host.database.companies.items.length; i++){
                                    if (host.database.companies.items[i].company_classid == company_classid) continue;
                                    if (host.inputidboxes["merge_checkbox_" + host.database.companies.items[i].id] !== undefined){
                                        host.inputidboxes["merge_checkbox_" + host.database.companies.items[i].id].style.visibility = "hidden";
                                    }
                                }
                            }
                        }
                        else {
                            var i = host.listMerge.indexOf(id);
                            host.listMerge.splice(i, 1);
                            if (host.listMerge.length == 0){
                                for (var i = 0; i < host.database.companies.items.length; i++){
                                    if (host.inputidboxes["merge_checkbox_" + host.database.companies.items[i].id] !== undefined){
                                        host.inputidboxes["merge_checkbox_" + host.database.companies.items[i].id].style.visibility = "visible";
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (host.listMerge.length > 0){
                var index = host.database.companies.getIndex(id);
                var tIndex = host.database.companies.getIndex(host.listMerge[0]);
                if (index >= 0 && tIndex >= 0){
                    if (host.database.companies.items[index].company_classid != host.database.companies.items[tIndex].company_classid){
                        host.inputidboxes["merge_checkbox_" + id].style.visibility = "hidden";
                    }
                }
                if (host.listMerge.indexOf(id) >= 0){
                    host.inputidboxes["merge_checkbox_" + id].checked = true;
                }
            }
            return host.inputidboxes["merge_checkbox_" + id];
        }.bind(null, id);
    }
    else {
        merge_checkbox = function(){
            return DOMElement.span({});
        };
    }
    return {
        id: id,
        merge_checkbox: merge_checkbox,
        name: host.database.companies.items[index].name,
        fullname: host.database.companies.items[index].fullname,
        address: host.database.companies.items[index].address,
        company_classid: host.database.companies.items[index].company_classid,
        districtid: host.database.companies.items[index].districtid,
        cityid: host.database.companies.items[index].cityid,
        nationid: host.database.companies.items[index].nationid,
        company_class: (host.database.companies.items[index].company_classid == 0)? "" : host.database.company_class.items[host.database.companies.items[index].company_classIndex].name,
        district: (host.database.companies.items[index].districtid == 0)? "" : host.database.districts.items[host.database.companies.items[index].districtIndex].name,
        city: (host.database.companies.items[index].cityid == 0)? "" : host.database.cities.items[host.database.companies.items[index].cityIndex].name,
        nation: (host.database.companies.items[index].nationid == 0)? "" : host.database.nations.items[host.database.companies.items[index].nationIndex].name,
        gps: host.database.companies.items[index].gps,
        phone: host.database.companies.items[index].phone,
        email: host.database.companies.items[index].email,
        fax: host.database.companies.items[index].fax,
        website: host.database.companies.items[index].website,
        taxcode: host.database.companies.items[index].taxcode,
        comment: host.database.companies.items[index].comment,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.companies.items[index].userid),
        createdtime: host.database.companies.items[index].createdtime,
        available: contentModule.availableName(host.database.companies.items[index].available),
        lastmodifiedtime: host.database.companies.items[index].lastmodifiedtime,
        permission: host.database.companies.items[index].permission,
        func: func
    };
    return {};
};

carddone.company.redraw = function(host){
    var data = [];
    console.log("redrawa_", (new Date()).getTime());
    host.companiesDic = contentModule.makeDictionaryIndex(host.database.companies.items);
    for (var i = 0; i < host.database.companies.items.length; i++){
        if (host.database.companies.items[i].permission < 1) continue;
        data.push(carddone.company.getCellCompany(host, host.database.companies.items[i].id));
    }
    console.log("redrawb_", (new Date()).getTime());
    DOMElement.removeAllChildren(host.data_container);
    host.dataViewCompany = host.funcs.formCompanyContentData({
        data: data,
        inputsearchbox: host.inputsearchbox,
        company_class_select: host.company_class_select,
        nations_select: host.nations_select,
        city_select: host.city_select,
        district_select: host.district_select
    });
    host.data = host.dataViewCompany.data;
    host.data_container.appendChild(host.dataViewCompany);
    console.log("done__" + (new Date()).getTime());
};

carddone.company.init2 = function(host){
    console.log("init2_" + (new Date()).getTime());
    host.listMerge = [];
    host.inputidboxes = {};
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
        carddone.company.addCompany(host, 0, function onSave(value){
            host.newRecord = host.newRecord.updateCurrentRow(host.funcs.formCompanyGetRow(value));
        }, function onAdd(value){
            host.newRecord = host.dataViewCompany.insertRow(host.funcs.formCompanyGetRow(value));
        });
    };
    cmdbutton.merge = function () {
        carddone.company.mergeCompanyLoad(host);
    };
    var getListDistrictByCity = function(nationid, id){
        var districtList;
        switch (id) {
            case 0:
                districtList = [
                    {value: 0, text: LanguageModule.text("txt_all")},
                    {value: "...", text: LanguageModule.text("txt_null")}
                ];
                for (var i = 0; i < host.database.districts.items.length; i++){
                    if (nationid != 0) if (host.database.districts.items[i].nationid != nationid) continue;
                    districtList.push({value: host.database.districts.items[i].name + "_" + host.database.districts.items[i].id, text: host.database.districts.items[i].name});
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
                var index = host.database.cities.getIndex(id);
                var ni;
                for (var i = 0; i < host.database.cities.items[index].districtIndexList.length; i++){
                    ni = host.database.cities.items[index].districtIndexList[i];
                    districtList.push({value: host.database.districts.items[ni].name + "_" + host.database.districts.items[ni].id, text: host.database.districts.items[ni].name});
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
                for (var i = 0; i < host.database.cities.items.length; i++){
                    cityList.push({
                        value: host.database.cities.items[i].name + "_" + host.database.cities.items[i].id,
                        text: host.database.cities.items[i].name,
                        districtList: getListDistrictByCity(id, host.database.cities.items[i].id)
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
                var index = host.database.nations.getIndex(id);
                var ni;
                for (var i = 0; i < host.database.nations.items[index].cityIndexList.length; i++){
                    ni = host.database.nations.items[index].cityIndexList[i];
                    cityList.push({
                        value: host.database.cities.items[ni].name + "_" + host.database.cities.items[ni].id,
                        text: host.database.cities.items[ni].name,
                        districtList: getListDistrictByCity(id, host.database.cities.items[ni].id)
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
    for (var i = 0; i < host.database.nations.items.length; i++){
        listNation.push({
            value: host.database.nations.items[i].name + "_" + host.database.nations.items[i].id,
            text: host.database.nations.items[i].name,
            cityList: getListCityByNation(host.database.nations.items[i].id)
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
    for (var i = 0; i < host.database.company_class.items.length; i++){
        listClass.push({value: host.database.company_class.items[i].name + "_" + host.database.company_class.items[i].id, text: host.database.company_class.items[i].name});
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
    host.data_container = DOMElement.div({attrs: {className: "card-table-init", style: {marginBottom: "200px"}}});
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
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.company.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    var st = {
        nations: [],
        cities: [],
        districts: [],
        company_class: [],
        companies: [],
        field_company_class: [],
        typelists: [],
        contact: [],
        owner_company_contact: [],
        company_class_member: [],
        account_groups: [],
        privilege_groups: [],
        privilege_group_details: []
    };
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
    host.database.owner_company_contact.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "owner_company_contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.owner_company_contact.items = retval;
                resolve();
            }
        });
    });
    host.database.company_class_member.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class_member",
            cond: function (record) {
                return record.userid == systemconfig.userid;
            },
            callback: function (retval) {
                host.database.company_class_member.items = retval;
                resolve();
            }
        });
    });
    host.database.nations.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "nations",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.nations.items = retval;
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
                host.database.cities.items = retval;
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
                host.database.districts.items = retval;
                resolve();
            }
        });
    });
    host.database.companies.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.companies.items = retval;
                resolve();
            }
        });
    });
    host.database.company_class.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.company_class.items = retval;
                resolve();
            }
        });
    });
    host.database.field_company_class.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "field_company_class",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.field_company_class.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.typelists.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "typelists",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.typelists.items = EncodingClass.string.duplicate(retval);
                contentModule.makeTypesListContentThanhYen(host);
                resolve();
            }
        });
    });
    host.database.contact.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.contact.items = retval;
                resolve();
            }
        });
    });
    host.database.account_groups.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "account_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.account_groups.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.privilege_groups.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "privilege_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_groups.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.privilege_group_details.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "privilege_group_details",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_group_details.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    Promise.all([
        host.database.nations.sync,
        host.database.cities.sync,
        host.database.districts.sync,
        host.database.companies.sync,
        host.database.company_class.sync,
        host.database.field_company_class.sync,
        host.database.typelists.sync,
        host.database.contact.sync,
        host.database.owner_company_contact.sync,
        host.database.company_class_member.sync,
        host.database.privilege_groups.sync,
        host.database.privilege_group_details.sync,
        host.database.account_groups.sync
    ]).then(function(){
        delete host.database.nations.sync;
        delete host.database.cities.sync;
        delete host.database.districts.sync;
        delete host.database.companies.sync;
        delete host.database.company_class.sync;
        delete host.database.field_company_class.sync;
        delete host.database.typelists.sync;
        delete host.database.contact.sync;
        delete host.database.owner_company_contact.sync;
        delete host.database.company_class_member.sync;
        delete host.database.privilege_groups.sync;
        delete host.database.privilege_group_details.sync;
        delete host.database.account_groups.sync;
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makeCitiesIndexThanhYen(host);
        contentModule.makeDistrictsIndexThanhYen(host);
        contentModule.makeOwnerCompanyContactThanhYen(host);
        contentModule.makeCompanyIndexThanhYen(host);
        contentModule.makeContactIndexThanhYen(host);
        setTimeout(function(){
            carddone.company.init2(host);
        }, 100);
    });
    ////console.log("start__" + (new Date()).getTime());

};
ModuleManagerClass.register({
    name: "Company",
    prerequisites: ["ModalElement", "FormClass"]
});
