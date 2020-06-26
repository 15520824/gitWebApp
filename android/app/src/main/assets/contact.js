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
                        var index = data_module.contact.getIndex(id);
                        data_module.contact.items.splice(index, 1);
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

carddone.contact.deleteContactConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.contact.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [data_module.contact.items[index].firstname]),
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
            var index = data_module.contact.getIndex(id);
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
                        data.companyIndex = data_module.companies.getIndex(data.companyid);
                        if (id > 0){
                            data.userid = host.dataContactEdit.userid;
                            data.ver = host.dataContactEdit.ver + 1;
                            data.createdtime = host.dataContactEdit.createdtime;
                            var index = data_module.contact.getIndex(id);
                            data_module.contact.items[index] = data;
                            host.dataContactEdit = data_module.contact.items[index];
                            if (isView){
                                console.log(companyid);
                                if (companyid === undefined){
                                    resolve(carddone.contact.getCellContact(host, id));
                                }
                                else {
                                    resolve(carddone.company.getCellContact(host, id, companyid));
                                }
                            }
                            else {
                                resolve(false);
                                data_module.contact.items.splice(index, 1);

                            }
                        }
                        else {
                            id = parseInt(message.substr(2), 10);
                            data.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            host.dataContactEdit = data;
                            if (isView){
                                data_module.contact.items.push(data);
                                if (companyid === undefined){
                                    host.dataViewContact.insertRow(host.funcs.formContactGetRow(carddone.contact.getCellContact(host, id)));
                                }
                                else {
                                    host.dataViewContact.insertRow(host.funcs.formContactGetRow(carddone.company.getCellContact(host, id, companyid)));
                                }
                            }
                        }
                        if (typesubmit == 1){
                            host.frameList.removeLast();
                        }
                        else {
                            if (isView){
                                carddone.contact.redrawDetails(host, id, companyid);
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

carddone.contact.addContactSubmit = function(host, id, typesubmit, companyid){
    return new Promise(function(resolve,reject){
        var data = host.contactEdit.getValue();
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

carddone.contact.redrawDetails = function(host, id, companyid){
    return new Promise(function(resolve,reject){
        var cmdbutton = {
            close: function () {
                host.frameList.removeLast();
            },
            save: function () {
                carddone.contact.addContactSubmit(host, id, 0, companyid).then(function(x){
                    resolve(x);
                });
            },
            save_close: function () {
                carddone.contact.addContactSubmit(host, id, 1, companyid).then(function(x){
                    resolve(x);
                });
            }
        };
        var data;
        var listCompany = [{value: 0, text: LanguageModule.text("txt_no_select")}];
        for (var i = 0; i < data_module.companies.items.length; i++){
            listCompany.push({value: data_module.companies.items[i].id, text: data_module.companies.items[i].name});
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
                listOwnerAll: listOwnerAll
            };
        }
        else {
            for (var i = 0; i < data_module.users.items.length; i++){
                listOwnerAll.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
            }
            data = {
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
    });
};

carddone.contact.addContact = function(host, id, companyid){
    return new Promise(function(resolve,reject){
        if (id == 0){
            carddone.contact.redrawDetails(host, id, companyid);
        }
        else {
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "contact_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            host.dataContactEdit = st.contact_details;
                            carddone.contact.redrawDetails(host, id, companyid).then(function(x){
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

carddone.contact.getCellContact = function(host, id){
    var index = data_module.contact.getIndex(id);
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.contact.addContact(host, id).then(function(value){
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
        position: data_module.contact.items[index].position,
        company: (data_module.contact.items[index].companyid == 0)? "" : data_module.companies.items[data_module.contact.items[index].companyIndex].name,
        department: data_module.contact.items[index].department,
        comment: data_module.contact.items[index].comment,
        createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.contact.items[index].userid),
        available: contentModule.availableName(data_module.contact.items[index].available),
        createdtime: contentModule.getTimeSend(data_module.contact.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(data_module.contact.items[index].lastmodifiedtime),
        companyid: data_module.contact.items[index].companyid,
        func: func
    };
};

carddone.contact.redraw = function(host){
    console.log("redraw__" + (new Date()).getTime());
    var data = [];
    for (var i = 0; i < data_module.contact.items.length; i++){
        data.push(carddone.contact.getCellContact(host, data_module.contact.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataViewContact = host.funcs.formContactContentData({
        data: data,
        inputsearchbox: host.inputsearchbox,
        company_select: host.company_select
    });
    host.data_container.appendChild(host.dataViewContact);
};

carddone.contact.init2 = function(host){
    contentModule.makeContactIndex();
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
            carddone.contact.addContact(host, 0);
        }
    };
    var listCompany = [
        {value: 0, text: LanguageModule.text("txt_all")},
        {value: "...", text: LanguageModule.text("txt_null")}
    ];
    for (var i = 0; i < data_module.companies.items.length; i++){
        listCompany.push({value: data_module.companies.items[i].name + "_" + data_module.companies.items[i].id , text: data_module.companies.items[i].name});
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
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover"
        }
    });
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
    if (!data_module.users || !data_module.contact || !data_module.companies || !data_module.owner_company_contact){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.contact.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    console.log("start__"+ (new Date()).getTime());
    setTimeout(function(){
        carddone.contact.init2(host);
    }, 100);
};
ModuleManagerClass.register({
    name: "Contact",
    prerequisites: ["ModalElement", "FormClass"]
});
