carddone.contact.deleteContact = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "contact_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.contact.getIndex(id);
                        host.database.contact.items.splice(index, 1);
                        resolve();
                        host.contactDic = contentModule.makeDictionaryIndex(host.database.contact.items);
                        dbcache.refresh("contact");
                        dbcache.refresh("owner_company_contact");
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

carddone.contact.deleteContactConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.contact.getIndex(id);
        ModalElement.question({
            title: LanguageModule.text("war_title_delete_contact"),
            message: LanguageModule.text2("war_txt_detele", [host.database.contact.items[index].firstname]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.contact.deleteContact(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.contact.addContactSubmit2 = function(host, id, data, isView, typesubmit, companyid){
    return new Promise(function(resolve,reject){
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = host.database.contact.getIndex(id);
            data.ver = host.dataContactEdit.ver;
        }
        else {
            data.ver = 1;
        }
        data.listOwnerAdd = [];
        data.listOwnerDel = [];
        if (id > 0){
            for (var i = 0; i < host.dataContactEdit.ownerList.length; i++){
                if (data.ownerList.indexOf(host.dataContactEdit.ownerList[i]) < 0) data.listOwnerDel.push(host.dataContactEdit.ownerList[i]);
            }
            for (var i = 0; i < data.ownerList.length; i++){
                if (host.dataContactEdit.ownerList.indexOf(data.ownerList[i]) < 0) data.listOwnerAdd.push(data.ownerList[i]);
            }
        }
        else {
            data.listOwnerAdd = data.ownerList;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "contact_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        data.lastmodifiedtime = new Date();
                        data.companyIndex = host.database.companies.getIndex(data.companyid);
                        if (id > 0){
                            data.userid = host.dataContactEdit.userid;
                            data.ver = host.dataContactEdit.ver + 1;
                            data.createdtime = host.dataContactEdit.createdtime;
                            var index = host.database.contact.getIndex(id);
                            host.database.contact.items[index] = data;
                            host.dataContactEdit = host.database.contact.items[index];
                            host.contactDic = contentModule.makeDictionaryIndex(host.database.contact.items);
                            if (isView){
                                if (companyid === undefined){
                                    resolve(carddone.contact.getCellContact(host, id));
                                }
                                else {
                                    resolve(carddone.company.getCellContact(host, id, companyid));
                                }
                            }
                            else {
                                resolve(false);
                                host.database.contact.items.splice(index, 1);
                            }
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            host.contactid = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            host.dataContactEdit = data;
                            if (isView){
                                host.database.contact.items.push(data);
                                host.contactDic = contentModule.makeDictionaryIndex(host.database.contact.items);
                                if (companyid === undefined){
                                    resolve(carddone.contact.getCellContact(host, id));
                                }
                                else {
                                    resolve(carddone.company.getCellContact(host, id, companyid));
                                }
                            }
                        }
                        if (typesubmit == 1){
                            host.frameList.removeLast();
                        }
                        else {
                            if (!isView){
                                host.frameList.removeLast();
                            }
                        }
                        dbcache.refresh("contact");
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
    });
};

carddone.contact.addContactSubmit = function(host, id, typesubmit, companyid){
    return new Promise(function(resolve,reject){
        var data = host.contactEdit.getValue();
        if (!data) return;
        var isView = false;
        if (data.ownerList.length == 0){
            isView = true;
        }
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
                message: LanguageModule.text("war_user_lost_privilege_contact"),
                onclick: function(sel){
                    if (sel == 0){
                        carddone.contact.addContactSubmit2(host, id, data, isView, typesubmit, companyid).then(function(value){
                            resolve(value);
                        });
                    }
                }
            });
            return;
        }
        carddone.contact.addContactSubmit2(host, id, data, isView, typesubmit, companyid).then(function(value){
            resolve(value);
        });
    });
};

carddone.contact.redrawDetails = function(host, id, companyid, resolve, resolveAdd){
    host.contactid = id;
    var cmdbutton = {
        close: function () {
            host.frameList.removeLast();
        },
        save: function () {
            if (host.contactid == 0){
                carddone.contact.addContactSubmit(host, host.contactid, 0, companyid).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.contact.addContactSubmit(host, host.contactid, 0, companyid).then(function(x){
                    console.log(x);
                    resolve(x);
                });
            }
        },
        save_close: function () {
            if (host.contactid == 0){
                carddone.contact.addContactSubmit(host, host.contactid, 1, companyid).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.contact.addContactSubmit(host, host.contactid, 1, companyid).then(function(x){
                    resolve(x);
                });
            }
        }
    };
    var data;
    var listCompany = [{value: 0, text: LanguageModule.text("txt_no_select")}];
    for (var i = 0; i < host.database.companies.items.length; i++){
        listCompany.push({value: host.database.companies.items[i].id, text: host.database.companies.items[i].name});
    }
    var listOwnerAll = [];
    if (id > 0){
        for (var i = 0; i < data_module.users.items.length; i++){
            listOwnerAll.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
        }
        var ownerList = [];
        for (var i = 0; i < host.dataContactEdit.ownerList.length; i++){
            ownerList.push(host.dataContactEdit.ownerList[i]);
        }
        console.log(host.dataContactEdit);
        console.log(ownerList);
        data = {
            id: host.contactid,
            editCompany: (companyid === undefined),
            firstname: host.dataContactEdit.firstname,
            lastname: host.dataContactEdit.lastname,
            phone: host.dataContactEdit.phone,
            email: host.dataContactEdit.email,
            phone2: host.dataContactEdit.phone2,
            email2: host.dataContactEdit.email2,
            position: host.dataContactEdit.position,
            companyid: host.dataContactEdit.companyid,
            department: host.dataContactEdit.department,
            ownerList: ownerList,
            comment: host.dataContactEdit.comment,
            activemode: host.dataContactEdit.available,
            createdby: contentModule.getUsernameByhomeidFromDataModule(host.dataContactEdit.userid),
            createdtime: contentModule.getTimeSend(host.dataContactEdit.createdtime),
            lastmodifiedtime: contentModule.getTimeSend(host.dataContactEdit.lastmodifiedtime),
            listOwnerAll: listOwnerAll
        };
    }
    else {
        for (var i = 0; i < data_module.users.items.length; i++){
            listOwnerAll.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
        }
        data = {
            id: 0,
            editCompany: (companyid === undefined),
            firstname: "",
            lastname: "",
            phone: "",
            email: "",
            phone2: "",
            email2: "",
            position: "",
            companyid: 0,
            department: "",
            comment: "",
            activemode: true,
            ownerList: [systemconfig.userid],
            listOwnerAll: listOwnerAll
        };
        if (companyid !== undefined) data.companyid = companyid;
    }
    data.listCompany = listCompany;
    host.contactEdit = host.funcs.formContactEdit({
        cmdbutton: cmdbutton,
        data: data
    });
    if (companyid === undefined){
        if (host.frameList.getLength() > 1){
            host.frameList.removeLast();
        }
    }
    else {
        if (host.frameList.getLength() > 2){
            host.frameList.removeLast();
        }
    }
    host.frameList.addChild(host.contactEdit);
    host.contactEdit.requestActive();
};

carddone.contact.addContact = function(host, id, companyid, resolve, resolveAdd){
    if (id == 0){
        carddone.contact.redrawDetails(host, id, companyid, resolve, resolveAdd);
    }
    else {
        var index = host.database.contact.getIndex(id);
        if (index < 0){
            ModalElement.alert({message: LanguageModule.text("war_text_data_is_null")});
            return;
        }
        host.dataContactEdit = host.database.contact.items[index];
        carddone.contact.redrawDetails(host, id, companyid, resolve, resolveAdd);
    }
};

carddone.contact.viewlistCardPre = function(host, id){
    carddone.company.viewlistCard({
        id: id,
        type: "contact",
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

carddone.contact.getCellContact = function(host, id){
    var index = host.contactDic[id];
    var func = {
        edit: function(resolve){
            carddone.contact.addContact(host, id, undefined, resolve);
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
        position: host.database.contact.items[index].position,
        company: (host.database.contact.items[index].companyid == 0)? "" : host.database.companies.items[host.database.contact.items[index].companyIndex].name,
        department: host.database.contact.items[index].department,
        comment: host.database.contact.items[index].comment,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.contact.items[index].userid),
        available: contentModule.availableName(host.database.contact.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.contact.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.contact.items[index].lastmodifiedtime),
        companyid: host.database.contact.items[index].companyid,
        func: func
    };
};

carddone.contact.redraw = function(host){
    console.log("redrawa__" + (new Date()).getTime());
    var data = [];
    host.contactDic = contentModule.makeDictionaryIndex(host.database.contact.items);
    for (var i = 0; i < host.database.contact.items.length; i++){
        if (!host.database.contact.items[i].permission) continue;
        data.push(carddone.contact.getCellContact(host, host.database.contact.items[i].id));
    }
    console.log("redrawb__" + (new Date()).getTime());
    DOMElement.removeAllChildren(host.data_container);
    host.dataViewContact = host.funcs.formContactContentData({
        data: data,
        inputsearchbox: host.inputsearchbox,
        company_select: host.company_select
    });
    host.data_container.appendChild(host.dataViewContact);
};

carddone.contact.init2 = function(host){
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
            carddone.contact.addContact(host, 0, undefined, function onSave(value){
                host.newRecordContact = host.newRecordContact.updateCurrentRow(host.funcs.formContactGetRow(value));
                console.log(host.newRecordContact);
            }, function onAdd(value){
                host.newRecordContact = host.dataViewContact.insertRow(host.funcs.formContactGetRow(value));
                console.log(host.newRecordContact);
            });
        }
    };
    var listCompany = [
        {value: 0, text: LanguageModule.text("txt_all")},
        {value: "...", text: LanguageModule.text("txt_null")}
    ];
    for (var i = 0; i < host.database.companies.items.length; i++){
        listCompany.push({value: host.database.companies.items[i].name + "_" + host.database.companies.items[i].id , text: host.database.companies.items[i].name});
    }
    var company_selectTag;
    if (carddone.isMobile){
        company_selectTag = "mselectmenu";
    }
    else {
        company_selectTag = "selectmenu";
    }
    host.company_select = absol.buildDom({
        tag: company_selectTag,
        style: {
            verticalAlign: "middle"
        },
        props: {
            items: listCompany,
            enableSearch: true
        }
    });
    host.data_container = DOMElement.div({attrs: {className: "card-table-init", style: {marginBottom: "200px"}}});
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formContactInit({
        cmdbutton: cmdbutton,
        company_select: host.company_select,
        data_container: host.data_container,
        inputsearchbox: host.inputsearchbox,
        frameList: host.frameList
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.contact.redraw(host);
    ModalElement.close(-1);
    console.log( "done__"+ (new Date()).getTime());
};

carddone.contact.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.contact.init(host);
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
        contact: [],
        owner_company_contact: [],
        company_class_member: [],
        account_groups: [],
        privilege_groups: [],
        privilege_group_details: []
    }
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
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
    host.database.company_class_member.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class_member",
            cond: function (record) {
                return record.userid == systemconfig.userid;
            },
            callback: function (retval) {
                host.database.company_class_member.items = EncodingClass.string.duplicate(retval);
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
        ModalElement.show_loading();
        console.log("start__"+ (new Date()).getTime());
        setTimeout(function(){
            carddone.contact.init2(host);
        }, 100);
    });
};
ModuleManagerClass.register({
    name: "Contact",
    prerequisites: ["ModalElement", "FormClass"]
});
