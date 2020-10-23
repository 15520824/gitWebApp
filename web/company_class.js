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
                        var index = host.database.company_class.getIndex(id);
                        host.database.company_class.items.splice(index, 1);
                        resolve();
                        dbcache.refresh("company_class");
                        dbcache.refresh("field_company_class");
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
        var index = host.database.company_class.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [host.database.company_class.items[index].name]),
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
        if (!data) return;
        data.id = id;
        data.available = data.available? 1 : 0;
        if (id > 0){
            var index = host.database.company_class.getIndex(id);
            data.ver = host.dataCompany_classEdit.ver;
        }
        else {
            data.ver = 1;
        }
        var getIndexByTypeid = function(typeid){
            for (var i = 0; i < host.dataField.length; i++){
                if (host.dataField[i].typeid == typeid) return i;
            }
            return -1;
        };
        var index;
        for (var i = 0; i < data.fieldList.length; i++){
            index = getIndexByTypeid(data.fieldList[i].typeid);
            if (index >= 0){
                if (host.dataField[index].findex == data.fieldList[i].findex){
                    host.dataField[index].sel = "no_change";
                }
                else {
                    host.dataField[index].sel = "update";
                    host.dataField[index].findex = data.fieldList[i].findex;
                }
            }
            else {
                host.dataField.push({
                    typeid: data.fieldList[i].typeid,
                    findex: data.fieldList[i].findex,
                    sel: "insert"
                })
            }
        }
        for (var i = 0; i < host.dataField.length; i++){
            if (host.dataField[i].sel === undefined) host.dataField[i].sel = "delete";
        }
        var getIndexByUserid = function(userid){
            for (var i = 0; i < host.dataCompany_classEdit.memberList.length; i++){
                if (host.dataCompany_classEdit.memberList[i].userid == userid) return i;
            }
            return -1;
        };
        for (var i = 0; i < data.memberList.length; i++){
            var x = getIndexByUserid(data.memberList[i].userid);
            if (x >= 0){
                if (data.memberList[i].type == host.dataCompany_classEdit.memberList[x].type){
                    host.dataCompany_classEdit.memberList[x].sel = "no_change";
                }
                else {
                    host.dataCompany_classEdit.memberList[x].sel = "update";
                    host.dataCompany_classEdit.memberList[x].type = data.memberList[i].type;
                }
            }
            else {
                host.dataCompany_classEdit.memberList.push({
                    sel: "insert",
                    userid: data.memberList[i].userid,
                    type: data.memberList[i].type
                });
            }
        }
        for (var i = 0; i < host.dataCompany_classEdit.memberList.length; i++){
            if (host.dataCompany_classEdit.memberList[i].sel === undefined) host.dataCompany_classEdit.memberList[i].sel = "delete";
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "company_class_save.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "dataField", value: EncodingClass.string.fromVariable(host.dataField)},
                {name: "memberList", value: EncodingClass.string.fromVariable(host.dataCompany_classEdit.memberList)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        data.lastmodifiedtime = new Date();
                        if (id > 0){
                            var index = host.database.company_class.getIndex(id);
                            data.userid = host.dataCompany_classEdit.userid;
                            data.ver = host.dataCompany_classEdit.ver + 1;
                            data.createdtime = host.dataCompany_classEdit.createdtime;
                            data.memberList = st.memberList;
                            host.database.company_class.items[index] = data;
                            host.dataCompany_classEdit = host.database.company_class.items[index];
                        }
                        else {
                            id = st.id;
                            data.id = id;
                            host.id = id;
                            data.userid = systemconfig.userid;
                            data.createdtime = new Date();
                            data.memberList = st.memberList;
                            host.database.company_class.items.push(data);
                            host.dataCompany_classEdit = data;
                        }
                        resolve(carddone.company_class.getCellCompany_class(host, id));
                        host.dataField = st.dataField;
                        if (typesubmit == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        dbcache.refresh("company_class");
                        dbcache.refresh("field_company_class");
                        dbcache.refresh("company_class_member");
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

carddone.company_class.redrawDetails = function(host, id, resolve, resolveAdd){
    host.id = id;
    var cmdbutton = {
        close: function () {
            while (host.frameList.getLength() > 1){
                host.frameList.removeLast();
            }
        },
        save: function () {
            console.log(host.id);
            if (host.id == 0){
                carddone.company_class.addCompany_classSubmit(host, host.id, 0).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.company_class.addCompany_classSubmit(host, host.id, 0).then(function(x){
                    resolve(x);
                });
            }
        },
        save_close: function () {
            if (host.id == 0){
                carddone.company_class.addCompany_classSubmit(host, host.id, 1).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.company_class.addCompany_classSubmit(host, host.id, 1).then(function(x){
                    resolve(x);
                });
            }
        }
    };
    var data;
    if (id > 0){
        data = {
            id: host.id,
            name: host.dataCompany_classEdit.name,
            color: (host.dataCompany_classEdit.color == "")? "white" : host.dataCompany_classEdit.color,
            createdby: contentModule.getUsernameByhomeidFromDataModule(host.dataCompany_classEdit.userid),
            createdtime: contentModule.getTimeSend(host.dataCompany_classEdit.createdtime),
            lastmodifiedtime: contentModule.getTimeSend(host.dataCompany_classEdit.lastmodifiedtime),
            activemode: host.dataCompany_classEdit.available,
            memberList: host.dataCompany_classEdit.memberList
        };
    }
    else {
        data = {
            id: 0,
            name: "",
            color: "white",
            activemode: true,
            memberList: []
        };
    }
    var memberListAll = [];
    for (var i = 0; i < host.database.company_class.items.length; i++){
        if (host.database.company_class.items[i].id == id) continue;
        if (host.database.company_class.items[i].memberList.length > 0){
            memberListAll.push({
                value: host.database.company_class.items[i].id,
                text: host.database.company_class.items[i].name,
                memberList: host.database.company_class.items[i].memberList
            });
        }
    }
    var typeListItems = [];
    for (var i = 0; i < host.database.typelists.items.length; i++){
        if (!host.database.typelists.items[i].available) continue;
        if (host.database.typelists.items[i].object_selection !== "contact") continue;
        typeListItems.push({value: host.database.typelists.items[i].id, text: host.database.typelists.items[i].name});
    }
    host.company_classEdit = host.funcs.formCompany_classEdit({
        cmdbutton: cmdbutton,
        data: data,
        typeListHas: host.dataField,
        typeListItems: typeListItems,
        users: data_module.users,
        memberListAll: memberListAll,
        listPriviledgeItems: host.listPriviledgeItems
    });
    host.frameList.addChild(host.company_classEdit);
    host.company_classEdit.requestActive();
};

carddone.company_class.addCompany_class = function(host, id, resolve, resolveAdd){
    if (id == 0){
        host.dataField = [];
        carddone.company_class.redrawDetails(host, id, resolve, resolveAdd);
        host.dataCompany_classEdit = {
            memberList: []
        };
    }
    else {
        ModalElement.show_loading();
        var index = host.database.company_class.getIndex(id);
        if (index < 0){
            ModalElement.alert({message: LanguageModule.text("war_text_data_is_null")});
            return;
        }
        host.dataCompany_classEdit = host.database.company_class.items[index];
        var b = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "field_company_class",
                cond: function (record) {
                    return record.company_classid == id;
                },
                callback: function (retval) {
                    host.dataField = retval;
                    rs();
                }
            });
        });
        Promise.all([
            b
        ]).then(function(){
            ModalElement.close(-1);
            carddone.company_class.redrawDetails(host, id, resolve, resolveAdd);
        });
    }
};

carddone.company_class.getCellCompany_class = function(host, id){
    var index = host.database.company_class.getIndex(id);
    var func = {
        edit: function(resolve){
            carddone.company_class.addCompany_class(host, id, resolve);
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
        name: host.database.company_class.items[index].name,
        color: (host.database.company_class.items[index].color == "")? "white" : host.database.company_class.items[index].color,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.company_class.items[index].userid),
        available: contentModule.availableName(host.database.company_class.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.company_class.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.company_class.items[index].lastmodifiedtime),
        func: func
    };
};

carddone.company_class.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.company_class.items.length; i++){
        data.push(carddone.company_class.getCellCompany_class(host, host.database.company_class.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formCompany_classContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.company_class.init = function(host){
    ModalElement.show_loading();
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.company_class.init(host);
        }, 50);
        return;
    }
    var st = {
        company_class: [],
        typelists: [],
        company_class_member: [],
        account_groups: [],
        privilege_groups: [],
        privilege_group_details: []
    };
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
    host.database.company_class.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.company_class.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.company_class_member.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class_member",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.company_class_member.items = EncodingClass.string.duplicate(retval);
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
        host.database.company_class.sync,
        host.database.company_class_member.sync,
        host.database.typelists.sync,
        host.database.privilege_groups.sync,
        host.database.privilege_group_details.sync,
        host.database.account_groups.sync
    ]).then(function(){
        delete host.database.company_class.sync;
        delete host.database.typelists.sync;
        delete host.database.company_class_member.sync;
        delete host.database.privilege_groups.sync;
        delete host.database.privilege_group_details.sync;
        delete host.database.account_groups.sync;
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makeCompany_class_memberIndex(host);
        var x = contentModule.makeAccountGroupsItems(host);
        host.listPriviledgeItems = x.listPriviledgeOfCompany_Class;
        if (host.listPriviledgeItems.length > 0){
            host.listPriviledgeItems.unshift({value: 0, text: LanguageModule.text("txt_no_select")});
        }
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
                carddone.company_class.addCompany_class(host, 0, function onSave(value){
                    host.newRecord = host.newRecord.updateCurrentRow(host.funcs.formCompany_classGetRow(value));
                }, function onAdd(value){
                    host.newRecord = host.dataView.insertRow(host.funcs.formCompany_classGetRow(value));
                });
            }
        };
        host.data_container = DOMElement.div({attrs: {style: {marginBottom: "200px"}}});
        host.holder.addChild(host.frameList);
        var singlePage = host.funcs.formCompany_classInit({
            cmdbutton: cmdbutton,
            data_container: host.data_container,
            inputsearchbox: host.inputsearchbox
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        carddone.company_class.redraw(host);
    });
};
ModuleManagerClass.register({
    name: "Company_class",
    prerequisites: ["ModalElement", "FormClass"]
});
