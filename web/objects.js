carddone.objects.deleteObject = function(host, id){
    return new Promise(function(resolve,reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "objects_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.objects.getIndex(id);
                        host.database.objects.items.splice(index, 1);
                        contentModule.makeObjectIndex(host);
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

carddone.objects.deleteObjectConfirm = function(host, id){
    return new Promise(function(resolve,reject){
        var index = host.database.objects.getIndex(id);
        ModalElement.question({
            message: LanguageModule.text2("war_txt_detele", [host.database.objects.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.objects.deleteObject(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.objects.addObjectSubmit = function(host, id, typesubmit){
    return new Promise(function(resolve, reject){
        var name = host.name_inputtext.value.trim();
        if (name === ""){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_no_name"),
                func: function(){
                    host.name_inputtext.focus();
                }
            });
            return;
        }
        var listCategory = [];
        var listCategoryAdd = [], listCategoryDel = [], ex;
        if (id > 0) var index = host.database.objects.getIndex(id);
        for (var i = 0; i < host.database.category.items.length; i++){
            if (host.inputidboxes["check_category_" + i].checked) {
                listCategory.push(host.database.category.items[i].id);
                if (id > 0){
                    ex = -1;
                    for (var j = 0; j < host.database.objects.items[index].categoryIndexList.length; j++){
                        if (host.database.category.items[i].id == host.database.category.items[host.database.objects.items[index].categoryIndexList[j].categoryIndex].id){
                            ex = 1;
                        }
                    }
                    if (ex < 0) listCategoryAdd.push(host.database.category.items[i].id);
                }
            }
        }
        if (id > 0){
            var cId, coId;
            for (var i = 0; i < host.database.objects.items[index].categoryIndexList.length; i++){
                cId = host.database.category.items[host.database.objects.items[index].categoryIndexList[i].categoryIndex].id;
                if (listCategory.indexOf(cId) < 0){
                    coId = host.database.category_objects.items[host.database.objects.items[index].categoryIndexList[i].category_objectsIndex].id;
                    listCategoryDel.push(coId);
                }
            }
        }
        else {
            listCategoryAdd = listCategory;
        }
        if (host.object_details.getValue().isNull) return;
        var content = host.object_details.getValue().value;
        var typeid = host.typedata_select.value;
        var typeIndex = host.database.typelists.getIndex(typeid);
        var data = {
            privtype: host.database.typelists.items[typeIndex].type,
            value: content,
            id: id,
            typeid: typeid,
            parentid: 0,
            name: name,
            type: "object",
            available: host.active_checkbox.checked? 1 : 0,
            listCategoryAdd: listCategoryAdd,
            listCategoryDel: listCategoryDel
        };
        if (id == 0) {
            data.ver = 1;
            data.valueid = 0;
        }
        else {
            data.valueid = host.dataObjectDetails.valueid;
            data.ver = host.dataObjectDetails.ver;
        }
        var listvalueiddel = [];
        if (id > 0){
            for (var i = 0; i < host.database.values.items.length; i++){
                if (host.listValueId.indexOf(host.database.values.items[i].id) < 0) listvalueiddel.push(host.database.values.items[i].id);
            }
        }
        data.listvalueiddel = listvalueiddel;
        ModalElement.show_loading();
        FormClass.api_call({
            url: "objects_save.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var ids = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0){
                            id = ids.id;
                            host.database.objects.items.push({
                                id: ids.id,
                                name: name,
                                type: "object",
                                parentid: 0,
                                typeid: host.typedata_select.value,
                                ver: 1,
                                available: host.active_checkbox.checked? 1 : 0,
                                userid: systemconfig.userid,
                                createdtime: new Date(),
                                lastmodifiedtime: new Date()
                            });
                            for (var i = 0; i < listCategoryAdd.length; i++){
                                host.database.category_objects.items.push({
                                    id: ids.categoryObj[i],
                                    categoryid: listCategoryAdd[i],
                                    objid: ids.id
                                });
                            }
                            contentModule.makeCategoryIndex(host);
                            contentModule.makeObjectIndex(host);
                            host.dataView.insertRow(host.funcs.formObjectGetRow(carddone.objects.getDataCell(host, ids.id)));
                        }
                        else {
                            var index = host.database.objects.getIndex(id);
                            host.database.objects.items[index].name = name;
                            host.database.objects.items[index].type = host.typedata_select.value;
                            host.database.objects.items[index].available = host.active_checkbox.checked? 1 : 0;
                            host.database.objects.items[index].lastmodifiedtime = new Date();
                            for (var i = 0; i < listCategoryDel.length; i++){
                                var indexc = host.database.category_objects.getIndex(listCategoryDel[i]);
                                host.database.category_objects.items.splice(indexc, 1);
                            }
                            for (var i = 0; i < listCategoryAdd.length; i++){
                                host.database.category_objects.items.push({
                                    id: ids.categoryObj[i],
                                    categoryid: listCategoryAdd[i],
                                    objid: id
                                });
                            }
                            contentModule.makeCategoryIndex(host);
                            contentModule.makeObjectIndex(host);
                            resolve(carddone.objects.getDataCell(host, id));
                        }
                        if (typesubmit == 1) {
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        else {
                            carddone.objects.addObject(host, id).then(function(value){
                                resolve(value);
                            });
                        }
                    }
                    else {
                        ModalElement.alert({
                            message: message
                        });
                    }
                }
                else {
                    ModalElement.alert({message: message});
                }
            }
        });
    });
};


carddone.objects.getCategoryDataCell = function(host, id, index){
    var child = [];
    for (var i = 0; i < host.database.category.items[index].childrenIndexList.length; i++){
        child.push(carddone.objects.getCategoryDataCell(host, id, host.database.category.items[index].childrenIndexList[i]));
    }
    var checked = false;
    if (id > 0){
        var oIndex = host.database.objects.getIndex(id);
        for (var i = 0; i < host.database.objects.items[oIndex].categoryIndexList.length; i++){
            if (host.database.objects.items[oIndex].categoryIndexList[i].categoryIndex == index) {
                checked = true;
                break;
            }
        }
    }
    host.inputidboxes["check_category_" + index] = absol.buildDom({
        tag: "checkbox",
        props: {
            checked: checked
        }
    });
    return {
        name: host.database.category.items[index].name,
        check_category: host.inputidboxes["check_category_" + index],
        child: child
    };
};

carddone.objects.getCategory = function(host, id){
    var data = [];
    host.inputidboxes = [];
    for (var i = 0; i < host.database.category.items.length; i++){
        if (host.database.category.items[i].parentid > 0) continue;
        data.push(carddone.objects.getCategoryDataCell(host, id, i));
    }
    return host.funcs.formObjectsGetCategory({
        data: data
    });
};

carddone.objects.redrawDetails = function(host, id){
    var valueid = 0;
    host.listValueId = [];
    if (id > 0) {
        valueid = host.dataObjectDetails.valueid;
    }
    DOMElement.removeAllChildren(host.details_container);
    host.object_details = contentModule.getObjectbyType(host, host.typedata_select.value, valueid);
    host.details_container.appendChild(host.object_details);
    DOMElement.removeAllChildren(host.category_container);
    host.category_details = carddone.objects.getCategory(host, id);
    host.category_container.appendChild(host.category_details);
    host.name_inputtext.focus();
};

carddone.objects.redrawAddObject = function(host, id){
    return new Promise(function(resolve,reject){
        if (id == 0){
            carddone.objects.redrawDetails(host, id);
        }
        else {
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "objects_load_details"},
                    {name: "id", value: id}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            console.log(st.object_details);
                            host.dataObjectDetails = st.object_details;
                            host.database.values = {};
                            host.database.values.items = st.values;
                            host.database.values.getIndex = function(id){
                                for (var i = 0; i < host.database.values.items.length; i++){
                                    if (host.database.values.items[i].id == id) return i;
                                }
                                return -1;
                            }
                            host.typedata_select.value = host.dataObjectDetails.typeid;
                            host.typedata_select.disabled = true;
                            host.name_inputtext.value = host.dataObjectDetails.name;
                            host.active_checkbox.checked = host.dataObjectDetails.available;
                            carddone.objects.redrawDetails(host, id);
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

carddone.objects.addObject = function(host, id){
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
                onclick: function(host,id){
                    return function (event, me) {
                        carddone.objects.addObjectSubmit(host, id, 0).then(function(x){
                            resolve(x);
                        });
                    }
                } (host,id)
            }),
            host.funcs.saveCloseButton({
                onclick: function(host,id){
                    return function (event, me) {
                        carddone.objects.addObjectSubmit(host, id, 1).then(function(x){
                            resolve(x);
                        });
                    }
                } (host,id)
            })
        ];
        var listType = [];
        for (var i = 0; i < host.database.typelists.items.length; i++){
            if (host.database.typelists.items[i].object_selection != "object") continue;
            listType.push({value: host.database.typelists.items[i].id, text: host.database.typelists.items[i].name});
        }
        listType.sort(function(a, b){
            return stricmp(a.text, b.text);
        });
        host.typedata_select = absol.buildDom({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle",
                marginRight: "var(--control-horizontal-distance-2)"
            },
            props: {
                items: listType,
                enableSearch: true
            },
            on: {
                change: function(){
                    carddone.objects.redrawDetails(host, id);
                }
            }
        });
        host.name_inputtext = host.funcs.input({
            style: {
                width: "100%",
                minWidth: "300px"
            }
        });
        host.active_checkbox = absol.buildDom({
            tag: 'switch',
            style: {
                'font-size': "var(--switch-fontsize)"
            },
            props:{
                checked: true
            }
        });
        host.details_container = DOMElement.div({});
        host.category_container = DOMElement.div({});
        var singlePage = host.funcs.formObjectsEdit({
            buttonlist: buttonlist,
            typedata_select: host.typedata_select,
            name_inputtext: host.name_inputtext,
            active_checkbox: host.active_checkbox,
            details_container: host.details_container,
            category_container: host.category_container
        });
        carddone.objects.redrawAddObject(host, id).then(function(value){
            resolve(value);
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        host.name_inputtext.focus();
    });
};

carddone.objects.getDataCell = function(host, id){
    var index = host.database.objects.getIndex(id);
    var child = [];
    for (var i = 0; i < host.database.objects.items[index].childrenIndexList.length; i++){
        child.push(carddone.objects.getDataCell(host, host.database.objects.items[host.database.objects.items[index].childrenIndexList[i]].id));
    }
    var func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.objects.addObject(host, id).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.objects.deleteObjectConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return {
        name: host.database.objects.items[index].name,
        typeName: host.database.typelists.items[host.database.objects.items[index].typeIndex].name,
        createdby: contentModule.getUsernameByhomeid(host, host.database.objects.items[index].userid),
        available: contentModule.availableName(host.database.objects.items[index].available),
        createdtime: contentModule.getTimeSend(host.database.objects.items[index].createdtime),
        lastmodifiedtime: contentModule.getTimeSend(host.database.objects.items[index].lastmodifiedtime),
        func: func,
        child: child
    };
};

carddone.objects.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.objects.items.length; i++){
        if (host.database.objects.items[i].parentid > 0) continue;
        data.push(carddone.objects.getDataCell(host, host.database.objects.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formObjectContentData({
        data: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
    host.inputsearchbox.onchange();
};

carddone.objects.init = function(host){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "objects_load_list"}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    host.database = {};
                    contentModule.makeDatabaseContent(host.database, st);
                    contentModule.makeTypesListContent(host);
                    contentModule.makeCitiesIndex(host);
                    contentModule.makeCategoryIndex(host);
                    contentModule.makeObjectIndex(host);
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
                        })
                    ];
                    var isAdd = 0;
                    for (var i = 0; i < host.database.typelists.items.length; i++){
                        if (host.database.typelists.items[i].object_selection == "object"){
                            isAdd = 1;
                            break;
                        }
                    }
                    if (isAdd == 1){
                        buttonlist.push(host.funcs.addButton({
                            onclick: function (host){
                                return function(event, me){
                                    carddone.objects.addObject(host, 0);
                                }
                            }(host)
                        }));
                    }
                    host.data_container = DOMElement.div({
                        attrs: {className: "cardsimpletableclass row2colors cardtablehover"}
                    });
                    host.holder.addChild(host.frameList);
                    var singlePage = host.funcs.formObjectsInit({
                        buttonlist: buttonlist,
                        data_container: host.data_container,
                        inputsearchbox: host.inputsearchbox
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.objects.redraw(host);
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
