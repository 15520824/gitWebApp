carddone.datatypes.deleteType = function(host, id){
    for (var i = 0; i < data_module.typelists.items.length; i++){
        switch (data_module.typelists.items[i].type) {
            case "enum":
            case "array":
                if (data_module.typelists.items[i].content.typeof == id){
                    ModalElement.alert({
                        message: LanguageModule.text("war_txt_can_not_delete")
                    });
                    return;
                }
                break;
            case "structure":
                for (var j = 0; j < data_module.typelists.items[i].content.details.length; j++){
                    if (data_module.typelists.items[i].content.details[j].type == id){
                        ModalElement.alert({
                            message: LanguageModule.text("war_txt_can_not_delete")
                        });
                        return;
                    }
                }
                break;
        }
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "datatypes_delete.php",
        params: [{name: "id", value: id}],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var index = data_module.typelists.getIndex(id);
                    data_module.typelists.items.splice(index, 1);
                    carddone.datatypes.redraw(host);
                }
                else if (message == "failed_used"){
                    ModalElement.alert({
                        message: LanguageModule.text("war_txt_can_not_delete"),
                        func: function(){
                            carddone.datatypes.init(host);
                        }
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
};

carddone.datatypes.deleteTypeConfirm = function(host, id){
    var index = data_module.typelists.getIndex(id);
    ModalElement.question({
        message: LanguageModule.text2("war_txt_detele", [data_module.typelists.items[index].name]),
        onclick: function(sel){
            if (sel == 0){
                carddone.datatypes.deleteType(host, id);
            }
        }
    });
};

carddone.datatypes.addTypeSubmit = function(host, id, typesubmit){
    var name = host.name_inputtext.value.trim();
    if (name === "") {
        ModalElement.alert({
            message: LanguageModule.text("war_txt_no_name"),
            func: function(){
                host.name_inputtext.focus();
            }
        });
        return;
    }
    var type = host.type_select.value;
    var content, contentredraw;
    switch (type) {
        case "array":
            content = EncodingClass.string.fromVariable({
                typeof: host.select_type_of_array.value
            });
            contentredraw = {
                typeof: host.select_type_of_array.value
            };
        break;
        case "enum":
            content = EncodingClass.string.fromVariable({
                typeof: host.select_type_of_enum.value,
                details: host.detailEnum
            });
            contentredraw = {
                typeof: host.select_type_of_enum.value,
                details: host.detailEnum
            };
        break;
        case "structure":
            content = [];
            for (var i = 0; i < host.dataTypeDetailStructure.data.length; i++){
                content.push({
                    localid: host.dataTypeDetailStructure.data[i][1].localid,
                    name: absol.$("div.sortTable-cell-edit",host.dataTypeDetailStructure.data[i][1].element).getValue(),
                    type: absol.$("div.sortTable-cell-edit",host.dataTypeDetailStructure.data[i][2].element).getValue(),
                    default: absol.$("div.sortTable-cell-edit",host.dataTypeDetailStructure.data[i][3].element).getValue(),
                    require: absol.$("div.sortTable-cell-edit-middle",host.dataTypeDetailStructure.data[i][4].element).getValue(),
                    decpre: absol.$("div.sortTable-cell-edit",host.dataTypeDetailStructure.data[i][5].element).getValue()
                });
            }
            content = EncodingClass.string.fromVariable({
                details: content
            });
            contentredraw = {
                details: content
            };
        break;
        default:
            content = "";
            contentredraw = "";
        break;

    }
    var data = {
        id: id,
        name:  name,
        type: type,
        decpre: host.decpre_select.value,
        comment: host.comment_inputtext.value.trim(),
        available: host.available_checkbox.checked? 1 : 0,
        object_selection: host.object_selection_select.value,
        content: content
    };
    if (id == 0) data.ver = 1;
    else {
        data.ver = host.dataTypeDetail.ver;
        if (type == "enum") data.listEnumDetailsDelete = host.listEnumDetailsDelete;
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "datatypes_save.php",
        params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    if (id == 0){
                        id = parseInt(message.substr(2), 10);
                        data_module.typelists.items.push({
                            id: id,
                            name: name,
                            type: type,
                            decpre: host.decpre_select.value,
                            comment: host.comment_inputtext.value.trim(),
                            available: host.available_checkbox.checked? 1 : 0,
                            object_selection: host.object_selection_select.value,
                            createdtime: new Date(),
                            lastmodifiedtime: new Date(),
                            userid: systemconfig.userid,
                            content: contentredraw,
                            ver: 1
                        });
                    }
                    else {
                        var index = data_module.typelists.getIndex(id);
                        data_module.typelists.items[index].name = name;
                        data_module.typelists.items[index].type = type;
                        data_module.typelists.items[index].decpre = host.decpre_select.value;
                        data_module.typelists.items[index].content = contentredraw;
                        data_module.typelists.items[index].comment = host.comment_inputtext.value.trim();
                        data_module.typelists.items[index].available = host.available_checkbox.checked? 1 : 0;
                        data_module.typelists.items[index].object_selection = host.object_selection_select.value;
                        data_module.typelists.items[index].lastmodifiedtime = new Date();
                        data_module.typelists.items[index].userid = systemconfig.userid;
                        data_module.typelists.items[index].ver = host.dataTypeDetail.ver + 1;
                    }
                    if (typesubmit == 0){
                        carddone.datatypes.addType(host, id);
                    }
                    else {
                        while (host.frameList.getLength() > 1){
                            host.frameList.removeLast();
                        }
                        carddone.datatypes.redraw(host);
                    }
                }
                else if (message.startsWith("failed_localid")){
                    ModalElement.alert({
                        message: "Giá trị "+  host.listEnumDetailsDelete[parseInt(message.substr(14), 10)].text + " đã được sử dụng, không được xóa."
                    });
                    return;
                }
                else if (message == "failed_id"){
                    ModalElement.alert({
                        message: LanguageModule.text("war_text_evaluation_reload_data"),
                        func: function(){
                            carddone.datatypes.init(host);
                        }
                    });
                }
                else if (message == "failed_ver"){
                    ModalElement.alert({
                        message: LanguageModule.text("war_text_evaluation_reload_data"),
                        func: function(){
                            carddone.datatypes.addType(host, id);
                        }
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
};

carddone.datatypes.changeType = function(host, id){
    var type = host.type_select.value;
    switch (type) {
        case "number":
            host.name_decpre_select.style.display = "inline-block";
            host.decpre_select.style.display = "inline-block";
            host.name_type_of_array.style.display = "none";
            host.select_type_of_array.style.display = "none";
            host.name_type_of_enum.style.display = "none";
            host.select_type_of_enum.style.display = "none";
            host.detail_of_structure_container.style.display = "none";
            host.detail_of_enum_container.style.display = "none";
            break;
        case "string":
        case "note":
        case "date":
        case "datetime":
        case "boolean":
        case "file":
        case "user":
        case "phonenumber":
        case "website":
        case "gps":
        case "email":
        case "userlist":
        case "nation":
        case "city":
            host.name_type_of_array.style.display = "none";
            host.select_type_of_array.style.display = "none";
            host.name_type_of_enum.style.display = "none";
            host.select_type_of_enum.style.display = "none";
            host.detail_of_structure_container.style.display = "none";
            host.detail_of_enum_container.style.display = "none";
            host.name_decpre_select.style.display = "none";
            host.decpre_select.style.display = "none";
            break;
        case "enum":
            host.name_type_of_enum.style.display = "inline-block";
            host.select_type_of_enum.style.display = "inline-block";
            host.name_type_of_array.style.display = "none";
            host.select_type_of_array.style.display = "none";
            host.detail_of_structure_container.style.display = "none";
            host.detail_of_enum_container.style.display = "block";
            carddone.datatypes.drawDetailEnum(host, id, host.detail_of_enum_container, host.detailEnum, host.select_type_of_enum.value);
            host.name_decpre_select.style.display = "none";
            host.decpre_select.style.display = "none";
            break;
        case "array":
            host.name_type_of_array.style.display = "inline-block";
            host.select_type_of_array.style.display = "inline-block";
            host.name_type_of_enum.style.display = "none";
            host.select_type_of_enum.style.display = "none";
            host.detail_of_structure_container.style.display = "none";
            host.detail_of_enum_container.style.display = "none";
            host.name_decpre_select.style.display = "none";
            host.decpre_select.style.display = "none";
            break;
        case "structure":
            host.name_type_of_array.style.display = "none";
            host.select_type_of_array.style.display = "none";
            host.name_type_of_enum.style.display = "none";
            host.select_type_of_enum.style.display = "none";
            host.detail_of_structure_container.style.display = "block";
            host.detail_of_enum_container.style.display = "none";
            host.name_decpre_select.style.display = "none";
            host.decpre_select.style.display = "none";
            break;
    }
};

carddone.datatypes.addDetailEnumDelete = function(host, id, container, data, typeofEnum, index){
    host.listEnumDetailsDelete.push(data[index]);
    data.splice(index, 1);
    carddone.datatypes.drawDetailEnum(host, id, container, data, typeofEnum);
};

carddone.datatypes.checkUsedEnum = function(host, localid){
    return false;
};

carddone.datatypes.addDetailEnumDeleteConfirm = function(host, id, container, data, typeofEnum, index){
    if (carddone.datatypes.checkUsedEnum(host, data[index].localid)) {
        ModalElement.alert({
            message: LanguageModule.text("war_txt_can_not_delete")
        });
        return;
    }
    ModalElement.question({
        message: LanguageModule.text2("war_txt_detele", [data[index].text]),
        onclick: function(sel){
            if (sel == 0){
                carddone.datatypes.addDetailEnumDelete(host, id, container, data, typeofEnum, index);
            }
        }
    });
};

carddone.datatypes.addDetailEnumSubmit = function(host, id, container, data, typeofEnum, index){
    var text = host.text_enum_detail.value.trim();
    if (text === "") {
        ModalElement.alert({
            message: LanguageModule.text("war_txt_no_name"),
            func: function(){
                host.text_enum_detail.focus();
            }
        });
        return;
    }
    var value = host.value_enum_detail.getValue();
    console.log(value);
    if (value === "") {
        ModalElement.alert({
            message: LanguageModule.text("war_txt_no_value"),
            func: function(){
                host.value_enum_detail.focus();
            }
        });
        return;
    }
    if (index >= 0){
        data[index].text = text;
        data[index].value = value;
    }
    else {
        data.push({
            localid: systemconfig.userid + "_type_" +(new Date()).getTime(),
            text: text,
            value: value
        });
    }
    carddone.datatypes.drawDetailEnum(host, id, container, data, typeofEnum);
};

carddone.datatypes.getTypeValueEnumView = function(host, type, value, index){
    var index = data_module.typelists.getIndex(type, 10);
    type = data_module.typelists.items[index].type;
    switch (type) {
        case "string":
        case "note":
        case "email":
        case "phonenumber":
        case "gps":
        case "website":
            return DOMElement.td({
                text: value
            });
            break;
        case "number":
            return DOMElement.td({
                attrs: {
                    align: "right"
                },
                text: value
            });
        case "date":
            return DOMElement.td({
                attrs: {
                    align: "center"
                },
                text: contentModule.formatTimeDisplay(new Date(value))
            });
            break;
        case "datetime":
            return DOMElement.td({
                attrs: {
                    align: "center"
                },
                text: contentModule.formatTimeMinuteDisplay(new Date(value))
            });
            break;
        case "boolean":
            return DOMElement.td({
                attrs: {
                    align: "center"
                },
                children: [absol.buildDom({
                    tag: "checkbox",
                    props: {
                        disabled: true,
                        checked: value
                    }
                })]
            });
            break;
        case "enum":
            if (index !== undefined){
                var list = [{
                    value: "no_select",
                    text: LanguageModule.text("txt_no_select")
                }];
                for (var i = 0; i < data_module.typelists.items[index].content.details.length; i++){
                    list.push({
                        value: data_module.typelists.items[index].content.details[i].localid,
                        text: data_module.typelists.items[index].content.details[i].text
                    });
                }
                return DOMElement.td({
                    attrs: {
                        align: "center"
                    },
                    children: [absol.buildDom({
                        tag: 'selectmenu',
                        style: {
                            textAlign: "left",
                            display: "block",
                            width: "100%"
                        },
                        props: {
                            disabled: true,
                            items: list,
                            value: value
                        }
                    })]
                });
            }
            break;
        case "structure":
            var data = [];
            var detailValue;
            for (var i = 0; i < data_module.typelists.items[index].content.details.length; i++){
                detailValue = undefined;
                for (var j = 0; j < value.length; j++){
                    if (value[j].localid == data_module.typelists.items[index].content.details[i].localid){
                        detailValue = value[j].value;
                        break;
                    }
                }
                data.push([
                    {text: data_module.typelists.items[index].content.details[i].name},
                    carddone.datatypes.getTypeValueEnumView(host, data_module.typelists.items[index].content.details[i].type, detailValue)
                ]);
            }
            return DOMElement.div({
                attrs: {
                    className: "cardsimpletableclass"
                },
                children: [DOMElement.table({
                    attrs: {style: {width: "100%"}},
                    header: [
                        {text: LanguageModule.text("txt_name")},
                        {text: LanguageModule.text("txt_value")}
                    ],
                    data: data
                })]
            });
            break;
        default:
            return DOMElement.td({
                text: value
            });
            break;

    }
};

carddone.datatypes.getTypeValueEnumEdit = function(host, type, value, index){
    var index = data_module.typelists.getIndex(type);
    type = data_module.typelists.items[index].type;
    switch (type) {
        case "string":
        case "note":
        case "email":
        case "website":
            if (value === undefined) value = "";
            var elt = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                return elt.value.trim();
            };
            return elt;
        case "gps":
            if (value === undefined) value = "";
            var elt = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                return elt.value.trim();
            };
            return elt;
        case "phonenumber":
            if (value === undefined) value = "";
            var elt = contentModule.preventNotPhoneNumberInput(host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: value
            }));
            elt.getValue = function(){
                return elt.value.trim();
            };
            return elt;
        case "number":
            if (value === undefined) value = "";
            var elt = contentModule.preventNotNumberInput(host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%",
                    textAlign: "right"
                },
                value: value
            }));
            elt.getValue = function(){
                return elt.value.trim();
            };
            return elt;
        case "date":
            if (value === undefined) value = new Date();
            else value = new Date(value)
            var elt = absol.buildDom({
                tag: 'calendar-input',
                data: {
                    value: value
                }
            });
            elt.getValue = function(){
                return elt.value;
            };
            return elt;
        case "datetime":
            var valuetime, valuedate;
            if (value === undefined) {
                valuetime = new Date();
                valuedate = new Date();
            }
            else {
                valuetime = new Date(value);
                valuedate = new Date(value);
            }
            valuedate = new Date(valuedate.setHours(0,0,0,0));
            var date = absol.buildDom({
                tag: 'calendar-input',
                style: {
                    marginRight: "var(--control-horizontal-distance-1)"
                },
                data: {
                    value: valuedate
                }
            });
            var time = absol.buildDom({
                tag: 'timeinput',
                props: {
                    dayOffset: valuetime
                }
            });
            var elt = DOMElement.div({
                attrs: {
                    style: {
                        whiteSpace: "nowrap"
                    }
                },
                children: [
                    date,
                    time
                ]
            });
            elt.getValue = function(){
                return new Date(date.value.getTime() + (time.hour*3600 + time.minute*60)*1000);
            };
            return elt;
        case "boolean":
            if (value === undefined) value = false;
            var elt = absol.buildDom({
                tag: 'checkbox',
                props: {
                    value: value
                }
            });
            elt.getValue = function(){
                return elt.checked;
            };
            return elt;
        case "enum":
            if (index !== undefined){
                var list = [{
                    value: "no_select",
                    text: LanguageModule.text("txt_no_select")
                }];
                for (var i = 0; i < data_module.typelists.items[index].content.details.length; i++){
                    list.push({
                        value: data_module.typelists.items[index].content.details[i].localid,
                        text: data_module.typelists.items[index].content.details[i].text
                    });
                }
                var elt = absol.buildDom({
                    tag: 'selectmenu',
                    style: {
                        textAlign: "left",
                        display: "block",
                        minWidth: "200px",
                        width: "100%"
                    },
                    props: {
                        items: list
                    }
                });
                elt.getValue = function(){
                    return elt.value;
                };
                if (value !== undefined) elt.value = value;
                return elt;
            }
            break;
        case "structure":
            var data = [];
            var listobj = [];
            var detailValue;
            for (var i = 0; i < data_module.typelists.items[index].content.details.length; i++){
                detailValue = undefined;
                if (value !== undefined){
                    for (var j = 0; j < value.length; j++){
                        if (value[j].localid == data_module.typelists.items[index].content.details[i].localid){
                            detailValue = value[j].value;
                            break;
                        }
                    }
                };
                var elt = carddone.datatypes.getTypeValueEnumEdit(host, data_module.typelists.items[index].content.details[i].type, detailValue);
                data.push([
                    {text: data_module.typelists.items[index].content.details[i].name},
                    elt
                ]);
                listobj.push({
                    localid: data_module.typelists.items[index].content.details[i].localid,
                    elt: elt
                });
            }
            var elt = DOMElement.div({
                attrs: {
                    className: "cardsimpletableclass"
                },
                children: [DOMElement.table({
                    attrs: {style: {width: "100%"}},
                    header: [
                        {text: LanguageModule.text("txt_name")},
                        {text: LanguageModule.text("txt_value")}
                    ],
                    data: data
                })]
            });
            elt.getValue = function(){
                var value = [];
                for (var i = 0; i < listobj.length; i++){
                    value.push({
                        localid: listobj[i].localid,
                        value: listobj[i].elt.getValue()
                    });
                }
                return value;
            };
            return elt;
            break;
        default:
            var elt = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                return elt.value.trim();
            };
            return elt;
            break;

    }
};

carddone.datatypes.addDetailEnum = function(host, id, container, data, typeofEnum, index){
    carddone.datatypes.drawDetailEnum(host, id, container, data, typeofEnum);
    if (index < 0){
        DOMElement.removeAllChildren(host.new_row_detail_enum);
    }
    var text = "", value;
    if (index >= 0){
        text = data[index].text;
        value = data[index].value;
    }
    host.text_enum_detail = host.funcs.input({
        style: {
            width: "200px"
        },
        value: text
    });

    host.value_enum_detail = carddone.datatypes.getTypeValueEnumEdit(host, typeofEnum, value);
    host.cmd_enum_detail = DOMElement.div({
        attrs: {
            style: {
                whiteSpace: "nowrap"
            }
        }
    });
    host.cmd_enum_detail.appendChild(DOMElement.div({
        attrs: {
            style: {
                display: "inline-block",
                verticalAlign: "middle"
            }
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons bsc-icon-hover-black",
                onclick: function () {
                    carddone.datatypes.addDetailEnumSubmit(host, id, container, data, typeofEnum, index);
                }
            },
            text: "save"
        })]
    }));
    if (index >= 0){
        host.cmd_enum_detail.appendChild(DOMElement.div({
            attrs: {
                style: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    paddingLeft: "5px"
                }
            },
            children: [DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-red",
                    onclick: function () {
                        carddone.datatypes.addDetailEnumDeleteConfirm(host, id, container, data, typeofEnum, index);
                    }
                },
                text: "delete"
            })]
        }));
    }
    host.cmd_enum_detail.appendChild(DOMElement.div({
        attrs: {
            style: {
                display: "inline-block",
                verticalAlign: "middle",
                paddingLeft: "5px"
            }
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons bsc-icon-hover-black",
                onclick: function () {
                    carddone.datatypes.drawDetailEnum(host, id, container, data, typeofEnum);
                }
            },
            text: "clear"
        })]
    }));
    if (index < 0){
        host.new_row_detail_enum.appendChild(DOMElement.td({
            attrs: {align: "center"},
            text: data.length + 1
        }));
        host.new_row_detail_enum.appendChild(DOMElement.td({
            children: [host.text_enum_detail]
        }));
        host.new_row_detail_enum.appendChild(DOMElement.td({
            attrs: {align: "center"},
            children: [host.value_enum_detail]
        }));
        host.new_row_detail_enum.appendChild(DOMElement.td({
            children: [host.cmd_enum_detail]
        }));
    }
    else {
        DOMElement.removeAllChildren(host.inputidboxes["text_enum_detail_" + index]);
        host.inputidboxes["text_enum_detail_" + index].appendChild(host.text_enum_detail);
        DOMElement.removeAllChildren(host.inputidboxes["value_enum_detail_" + index]);
        host.inputidboxes["value_enum_detail_" + index].appendChild(host.value_enum_detail);
        DOMElement.removeAllChildren(host.inputidboxes["cmd_enum_detail_" + index]);
        host.inputidboxes["cmd_enum_detail_" + index].appendChild(host.cmd_enum_detail);
    }
    host.text_enum_detail.focus();
};

carddone.datatypes.getType = function(host, type, cond){
    if (type == cond){
        return true;
    }
    else if (!isNaN(type)){
        var index = data_module.typelists.getIndex(type);
        return carddone.datatypes.getType(host, data_module.typelists.items[index].type, cond)
    }
    return false;
};

carddone.datatypes.drawDetailEnum = function(host, id, container, data, typeofEnum){
    DOMElement.removeAllChildren(container);
    if (carddone.datatypes.getType(host, typeofEnum, "user") || carddone.datatypes.getType(host, typeofEnum, "userlist")
            || carddone.datatypes.getType(host, typeofEnum, "nation") || carddone.datatypes.getType(host, typeofEnum, "city")
        ){
        host.detailEnum = [];
        return;
    }
    var dataRedraw = [];
    for (var i = 0; i < data.length; i++){
        host.inputidboxes["text_enum_detail_" + i] = DOMElement.td({
            text: data[i].text
        });
        host.inputidboxes["value_enum_detail_" + i] = carddone.datatypes.getTypeValueEnumView(host, typeofEnum, data[i].value);
        host.inputidboxes["cmd_enum_detail_" + i] = DOMElement.td({
            attrs: {align: "center"},
            children: [DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-black",
                    onclick: function (host, id, container, data, typeofEnum, index) {
                        return function(){
                            carddone.datatypes.addDetailEnum(host, id, container, data, typeofEnum, index);
                        }
                    }(host, id, container, data, typeofEnum, i)
                },
                text: "create"
            })]
        });
        dataRedraw.push([
            {
                attrs: {align: "center"},
                text: i + 1
            },
            host.inputidboxes["text_enum_detail_" + i],
            host.inputidboxes["value_enum_detail_" + i],
            host.inputidboxes["cmd_enum_detail_" + i]
        ]);
    }
    host.new_row_detail_enum = DOMElement.tr({
        children: [DOMElement.td({
            attrs: {
                colSpan: 4
            },
            children: [DOMElement.a({
                attrs: {
                    style: {
                        cursor: "pointer",
                        color: "var(--a-color)"
                    },
                    onclick: function(){
                        carddone.datatypes.addDetailEnum(host, id, container, data, typeofEnum, -1);
                    }
                },
                text: "+ " + LanguageModule.text("txt_add_constant")
            })]
        })]
    });
    dataRedraw.push(host.new_row_detail_enum);
    container.appendChild(DOMElement.table({
        header: [
            LanguageModule.text("txt_index"),
            LanguageModule.text("txt_name"),
            LanguageModule.text("txt_value"),
            {}
        ],
        data: dataRedraw
    }));
};

carddone.datatypes.getLinkData = function(host, id, type){
    var typeIndex = data_module.typelists.getIndex(type);
    switch (data_module.typelists.items[typeIndex].type) {
        case "array":
        case "enum":
            if (data_module.typelists.items[typeIndex].content.typeof == id) return true;
            if (carddone.datatypes.getLinkData(host, id, data_module.typelists.items[typeIndex].content.typeof)) return true;
            break;
        case "structure":
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                if (host.typeHasContent.indexOf(data_module.typelists.items[typeIndex].content.details[i].type) >= 0){
                    if (carddone.datatypes.getLinkData(host, id, data_module.typelists.items[typeIndex].content.details[i].type)) return true;
                }
            }
            break;
    }
    return false;
};

carddone.datatypes.drawDetailStructureByTypeDateCustom = function(defaultValue, default_detailsObj){
    if (defaultValue == "custom"){
        default_detailsObj.style.display = "inline-block";
    }
    else {
        default_detailsObj.style.display = "none";
    }
};

carddone.datatypes.drawDetailStructureByTypeDateTimeCustom = function(defaultValue, default_detailsObj, timeObj){
    if (defaultValue == "custom"){
        default_detailsObj.style.display = "inline-block";
        timeObj.style.display = "inline-block";
    }
    else {
        default_detailsObj.style.display = "none";
        timeObj.style.display = "none";
    }
};

carddone.datatypes.drawDetailStructureByType = function(host, data, type, index, ischange){
    var typeIndex;
    var type_pri = type;
    if (!isNaN(type)){
        typeIndex = data_module.typelists.getIndex(type);
        type_pri = data_module.typelists.items[typeIndex].type;
    }
    DOMElement.removeAllChildren(host.inputidboxes["decpre_structure_detail_"+ index]);
    if (type_pri == "number"){
        var decpre = 0;
        if (!isNaN(type)) decpre = data_module.typelists.items[typeIndex].decpre;
        if (data[index].decpre !== undefined) decpre = data[index].decpre; //thanhyen
        console.log(decpre);
        var decpreObj = absol.buildDom({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle",
                width: "100%"
            },
            props: {
                value: decpre,
                items: [
                    {value: 0, text: LanguageModule.text("txt_number_of_decimal_0")},
                    {value: 1, text: LanguageModule.text("txt_number_of_decimal_1")},
                    {value: 2, text: LanguageModule.text("txt_number_of_decimal_2")},
                    {value: 3, text: LanguageModule.text("txt_number_of_decimal_3")},
                    {value: 4, text: LanguageModule.text("txt_number_of_decimal_4")},
                    {value: 5, text: LanguageModule.text("txt_number_of_decimal_5")}
                ]
            }
        });
        host.inputidboxes["decpre_structure_detail_"+ index].appendChild(decpreObj);
        host.inputidboxes["decpre_structure_detail_"+ index].getValue = function(){
            return decpreObj.value;
        };
    }
    else {
        host.inputidboxes["decpre_structure_detail_"+ index].getValue = function(){
            return 0;
        };
    }
    DOMElement.removeAllChildren(host.inputidboxes["require_structure_detail_"+ index]);
    //if (type_pri == "string" || type_pri == "note" || type_pri == "number" || type_pri == "email"){
    if (true){
        if (data[index].require === undefined) data[index].require = false;
        var requireObj = absol.buildDom({
            tag: "checkbox",
            props: {
                checked: data[index].require
            }
        });
        host.inputidboxes["require_structure_detail_"+ index].appendChild(requireObj);
        host.inputidboxes["require_structure_detail_"+ index].getValue = function(){
            return requireObj.checked;
        };
    }
    var defaultObj, defaultValue;
    host.inputidboxes["default_structure_detail_"+ index].style.paddingTop = 0;
    switch (type_pri) {
        case "string":
            defaultValue = "";
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: defaultValue
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            }
            break;
        case "note":
            defaultValue = "";
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = DOMElement.textarea({
                attrs: {
                    className: "cardSimpleTextarea",
                    style: {
                        minWidth: "200px",
                        width: "100%",
                        verticalAlign: "middle",
                        height: "50px"
                    },
                    value: defaultValue
                }
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            };
            break;
        case "number":
            defaultValue = "";
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = contentModule.preventNotNumberInput(host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: defaultValue
            }));
            defaultObj.getValue = function(){
                return defaultObj.value;
            };
            break;
        case "boolean":
            host.inputidboxes["default_structure_detail_"+ index].style.paddingTop = "5px";
            host.inputidboxes["default_structure_detail_"+ index].style.textAlign = "center";
            defaultValue = false;
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = absol.buildDom({
                tag: "checkbox",
                props: {
                    checked: defaultValue
                }
            });
            defaultObj.getValue = function(){
                return defaultObj.checked;
            };
            break;
        case "email":
            defaultValue = "";
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: defaultValue
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            }
            break;
        case "phonenumber":
            defaultValue = "";
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: defaultValue
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            }
            break;
        case "website":
            defaultValue = "";
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: defaultValue
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            }
            break;
        case "user":
            defaultValue = 0;
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            var list = [{
                value: 0,
                text: LanguageModule.text("txt_no_select")
            }];
            for (var i = 0; i < data_module.users.items.length; i++){
                list.push({
                    value: data_module.users.items[i].homeid,
                    text: data_module.users.items[i].username
                });
            }
            defaultObj = absol.buildDom({
                tag: "selectmenu",
                style: {
                    verticalAlign: "middle",
                    width: "100%"
                },
                props: {
                    items: list,
                    value: defaultValue
                }
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            };
            break;
        case "userlist":
            defaultValue = "";
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            defaultObj = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                disabled: true
            });
            defaultObj.getValue = function(){
                return [];
            }
            break;
        case "nation":
            defaultValue = 0;
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            var list = [{
                value: 0,
                text: LanguageModule.text("txt_no_select")
            }];
            for (var i = 0; i < data_module.nations.items.length; i++){
                list.push({
                    value: data_module.nations.items[i].id,
                    text: data_module.nations.items[i].name
                });
            }
            defaultObj = absol.buildDom({
                tag: "selectmenu",
                style: {
                    verticalAlign: "middle",
                    width: "100%"
                },
                props: {
                    items: list,
                    value: defaultValue,
                    enableSearch: true
                }
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            };
            break;
        case "city":
            defaultValue = 0;
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            var list = [{
                value: 0,
                text: LanguageModule.text("txt_no_select")
            }];
            for (var i = 0; i < data_module.cities.items.length; i++){
                list.push({
                    value: data_module.cities.items[i].id,
                    text: data_module.cities.items[i].name
                });
            }
            defaultObj = absol.buildDom({
                tag: "selectmenu",
                style: {
                    verticalAlign: "middle",
                    width: "100%"
                },
                props: {
                    items: list,
                    value: defaultValue,
                    enableSearch: true
                }
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            };
            break;
        case "date":
            defaultValue = "today";
            var default_detailsValue = new Date();
            if (!ischange) if (data[index].default !== undefined) {
                defaultValue = data[index].default[0];
                default_detailsValue = new Date(data[index].default[1]);
            }
            var default_detailsObj = absol.buildDom({
                tag: 'calendar-input',
                style: {
                    marginLeft: "var(--control-horizontal-distance-1)",
                    verticalAlign: "middle"
                },
                data: {
                    value: default_detailsValue
                }
            });
            var typeDateObj = absol.buildDom({
                tag: "selectmenu",
                style: {
                    verticalAlign: "middle"
                },
                props: {
                    items: [
                        {value: "today", text: LanguageModule.text("txt_today")},
                        {value: "first_day_of_month", text: LanguageModule.text("txt_first_day_of_month")},
                        {value: "custom", text: LanguageModule.text("txt_custom")}
                    ],
                    value: defaultValue
                },
                on: {
                    change: function(){
                        carddone.datatypes.drawDetailStructureByTypeDateCustom(this.value, default_detailsObj);
                    }
                }
            });
            defaultObj = DOMElement.div({
                attrs: {style: {whiteSpace: "nowrap"}},
                children: [
                    typeDateObj,
                    default_detailsObj
                ]
            });
            carddone.datatypes.drawDetailStructureByTypeDateCustom(defaultValue, default_detailsObj);
            defaultObj.getValue = function(){
                return [
                    typeDateObj.value,
                    default_detailsObj.value
                ];
            };
            break;
        case "datetime":
            defaultValue = "today";
            var valuedate = new Date();
            var valuetime = new Date();
            if (!ischange) if (data[index].default !== undefined) {
                defaultValue = data[index].default[0];
                valuedate = new Date(data[index].default[1]);
                valuetime = new Date(data[index].default[1]);
            }
            valuedate = new Date(valuedate.setHours(0,0,0,0));
            var default_detailsObj = absol.buildDom({
                tag: 'calendar-input',
                style: {
                    marginLeft: "var(--control-horizontal-distance-1)",
                    verticalAlign: "middle"
                },
                data: {
                    value: valuedate
                }
            });
            var timeObj = absol.buildDom({
                tag: 'timeinput',
                style: {
                    marginLeft: "var(--control-horizontal-distance-1)",
                    verticalAlign: "middle"
                },
                props: {
                    dayOffset: valuetime
                }
            });
            var typeDateObj = absol.buildDom({
                tag: "selectmenu",
                style: {
                    verticalAlign: "middle"
                },
                props: {
                    items: [
                        {value: "today", text: LanguageModule.text("txt_today")},
                        {value: "first_day_of_month", text: LanguageModule.text("txt_first_day_of_month")},
                        {value: "custom", text: LanguageModule.text("txt_custom")}
                    ],
                    value: defaultValue
                },
                on: {
                    change: function(){
                        carddone.datatypes.drawDetailStructureByTypeDateTimeCustom(this.value, default_detailsObj, timeObj);
                    }
                }
            });
            defaultObj = DOMElement.div({
                attrs: {style: {whiteSpace: "nowrap"}},
                children: [
                    typeDateObj,
                    default_detailsObj,
                    timeObj
                ]
            });
            carddone.datatypes.drawDetailStructureByTypeDateTimeCustom(defaultValue, default_detailsObj, timeObj);
            defaultObj.getValue = function(){
                return [
                    typeDateObj.value,
                    new Date(default_detailsObj.value.getTime() + (timeObj.hour*3600 + timeObj.minute*60)*1000)
                ];
            };
            break;
        case "enum":
            var typeIndex = data_module.typelists.getIndex(type);
            if (data_module.typelists.items[typeIndex].content.details.length > 0){
                defaultValue = data_module.typelists.items[typeIndex].content.details[0].localid;
            }
            if (!ischange) if (data[index].default !== undefined) defaultValue = data[index].default;
            var list = [{
                value: "no_select",
                text: LanguageModule.text("txt_no_select")
            }];
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                list.push({
                    value: data_module.typelists.items[typeIndex].content.details[i].localid,
                    text: data_module.typelists.items[typeIndex].content.details[i].text
                });
            }
            defaultObj = absol.buildDom({
                tag: "selectmenu",
                style: {
                    verticalAlign: "middle",
                    width: "100%"
                },
                props: {
                    items: list,
                    value: defaultValue
                }
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            };
            break;
        default:
            if (data[index].default === undefined) data[index].default = "";
            defaultObj = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                disabled: true,
                value: data[index].default
            });
            defaultObj.getValue = function(){
                return defaultObj.value;
            }
            break;

    }
    DOMElement.removeAllChildren(host.inputidboxes["default_structure_detail_"+ index]);
    host.inputidboxes["default_structure_detail_"+ index].appendChild(defaultObj);
    host.inputidboxes["default_structure_detail_"+ index].getValue = function(){
        return defaultObj.getValue();
    };
};

carddone.datatypes.drawDetailStructure = function(host, data){
    var dataRedraw = [];
    var typedetail;
    for (var i = 0; i < data.length; i++){
        host.inputidboxes["require_structure_detail_"+ i] = DOMElement.div({
            attrs: {
                align: "center",
                className: "sortTable-cell-edit-middle"
            }
        });
        host.inputidboxes["default_structure_detail_"+ i] = DOMElement.div({
            attrs: {
                className: "sortTable-cell-edit"
            }
        });
        host.inputidboxes["decpre_structure_detail_"+ i] = DOMElement.div({
            attrs: {
                className: "sortTable-cell-edit"
            }
        });
        var nameObj = host.funcs.input({
            style: {
                width: "100%",
                minWidth: "200px"
            },
            value: data[i].name
        });
        nameObj.getValue = function(){
            return this.value.trim();
        };
        var typeObj = absol.buildDom({
            tag: "selectmenu",
            style: {
                width: "100%",
                verticalAlign: "middle"
            },
            props: {
                items: host.listType,
                value: data[i].type,
                enableSearch: true
            },
            on: {
                change: function(host, data, index){
                    return function(){
                        carddone.datatypes.drawDetailStructureByType(host, data, this.value, index, true);
                    }
                }(host, data, i)
            }
        });
        typeObj.getValue = function(){
            return this.value;
        };
        var nameContainer = DOMElement.div({
            attrs: {
                className: "sortTable-cell-edit"
            },
            children: [nameObj]
        });
        nameContainer.getValue = function(nameObj){
            return function(){
                return nameObj.getValue();
            }
        }(nameObj);
        var typeContainer = DOMElement.div({
            attrs: {
                className: "sortTable-cell-edit"
            },
            children: [typeObj]
        });
        typeContainer.getValue = function(typeObj){
            return function(){
                return typeObj.getValue();
            }
        }(typeObj);
        dataRedraw.push({
            localid: data[i].localid,
            name: nameContainer,
            type: typeContainer,
            require: host.inputidboxes["require_structure_detail_"+ i],
            default: host.inputidboxes["default_structure_detail_"+ i],
            decpre: host.inputidboxes["decpre_structure_detail_"+ i]
        });
        carddone.datatypes.drawDetailStructureByType(host, data, data[i].type, i, false);
    }
    host.dataTypeDetailStructure = host.funcs.formDataTypesDataStructure({
        data: dataRedraw
    });
    return DOMElement.div({
        attrs: {
            style: {
                marginBottom: "100px"
            }
        },
        children: [
            DOMElement.div({
                attrs: {className: "cardsimpletableclass"},
                children: [host.dataTypeDetailStructure]
            }),
            DOMElement.div({
                attrs: {className: "card-table-add-row"},
                children: [DOMElement.a({
                    attrs: {
                        onclick: function(){
                            data.push({
                                name: "",
                                type: "string",
                                require: false,
                                default: "",
                                decpre: 0
                            });
                            host.inputidboxes["require_structure_detail_" + (data.length -1)] = DOMElement.div({
                                attrs: {
                                    align: "center",
                                    className: "sortTable-cell-edit-middle"
                                }
                            });
                            host.inputidboxes["default_structure_detail_" + (data.length -1)] = DOMElement.div({
                                attrs: {
                                    className: "sortTable-cell-edit"
                                }
                            });
                            host.inputidboxes["decpre_structure_detail_" + (data.length -1)] = DOMElement.div({
                                attrs: {
                                    className: "sortTable-cell-edit"
                                }
                            });
                            var nameObj = host.funcs.input({
                                style: {
                                    width: "100%",
                                    minWidth: "200px"
                                }
                            });
                            nameObj.getValue = function(){
                                return this.value;
                            };
                            var typeObj = absol.buildDom({
                                tag: "selectmenu",
                                style: {
                                    width: "100%",
                                    verticalAlign: "middle"
                                },
                                props: {
                                    items: host.listType
                                },
                                on: {
                                    change: function(host, data){
                                        return function(){
                                            carddone.datatypes.drawDetailStructureByType(host, data, this.value, data.length -1, true);
                                        }
                                    }(host, data)
                                }
                            });
                            typeObj.getValue = function(){
                                return this.value;
                            };
                            var nameContainer = DOMElement.div({
                                attrs: {
                                    className: "sortTable-cell-edit"
                                },
                                children: [nameObj]
                            });
                            nameContainer.getValue = function(nameObj){
                                return function(){
                                    return nameObj.getValue();
                                }
                            }(nameObj);
                            var typeContainer = DOMElement.div({
                                attrs: {
                                    className: "sortTable-cell-edit"
                                },
                                children: [typeObj]
                            });
                            typeContainer.getValue = function(typeObj){
                                return function(){
                                    return typeObj.getValue();
                                }
                            }(typeObj);
                            carddone.datatypes.drawDetailStructureByType(host, data, "string", data.length - 1, false);
                            var newData = host.funcs.formDataTypesDataStructureGetRow({
                                localid: systemconfig.userid + "_type_" +(new Date()).getTime(),
                                name: nameContainer,
                                type: typeContainer,
                                require: host.inputidboxes["require_structure_detail_" + (data.length -1)],
                                default: host.inputidboxes["default_structure_detail_" + (data.length -1)],
                                decpre: host.inputidboxes["decpre_structure_detail_" + (data.length -1)]
                            });
                            host.dataTypeDetailStructure.insertRow(newData);
                            nameObj.focus();
                        }
                    },
                    text: "+ " + LanguageModule.text("txt_add")
                })]
            })
        ]
    });
};

carddone.datatypes.redrawAddType = function(host, id){
    host.listEnumDetailsDelete = [];
    host.inputidboxes = [];
    host.detailEnum = [];
    host.detailStructure = [];
    if (host.typeHasContent.indexOf(host.dataTypeDetail.type) >= 0){
        host.dataTypeDetail.content = EncodingClass.string.toVariable(host.dataTypeDetail.content);
        if (host.dataTypeDetail.type == "enum") {
            host.detailEnum = host.dataTypeDetail.content.details;
            var typeofEnum = host.dataTypeDetail.content.typeof;
        }
        else if (host.dataTypeDetail.type == "structure") host.detailStructure = host.dataTypeDetail.content.details;
        else {
            var typeOfArray = host.dataTypeDetail.content.typeof;
        }
    }
    var buttonlist = [
        host.funcs.closeButton({
            onclick: function(host){
                return function (event, me) {
                    while (host.frameList.getLength() > 1){
                        host.frameList.removeLast();
                    }
                    carddone.datatypes.redraw(host);
                }
            } (host)
        }),
        host.funcs.saveButton({
            onclick: function(host,id){
                return function (event, me) {
                    carddone.datatypes.addTypeSubmit(host, id, 0);
                }
            } (host,id)
        }),
        host.funcs.saveCloseButton({
            onclick: function(host,id){
                return function (event, me) {
                    carddone.datatypes.addTypeSubmit(host, id, 1);
                }
            } (host,id)
        })
    ];
    host.name_inputtext = host.funcs.input({
        style: {minWidth: "400px"},
        value: host.dataTypeDetail.name
    });
    host.type_select = absol.buildDom({
        tag: "selectmenu",
        style: {
            verticalAlign: "middle",
            width: "400px"
        },
        props: {
            items: [
                {value: "string", text: LanguageModule.text("txt_string")},
                {value: "note", text: LanguageModule.text("txt_textarea")},
                {value: "number", text: LanguageModule.text("txt_number")},
                {value: "date", text: LanguageModule.text("txt_date")},
                {value: "datetime", text: LanguageModule.text("txt_date_time")},
                {value: "boolean", text: LanguageModule.text("txt_checkbox")},
                {value: "email", text: LanguageModule.text("txt_email")},
                {value: "user", text: LanguageModule.text("txt_user")},
                {value: "userlist", text: LanguageModule.text("txt_userlist")},
                {value: "phonenumber", text: LanguageModule.text("txt_phone_number")},
                {value: "website", text: LanguageModule.text("txt_website")},
                {value: "nation", text: LanguageModule.text("txt_nations")},
                {value: "city", text: LanguageModule.text("txt_city")},
                {value: "array", text: LanguageModule.text("txt_array")},
                {value: "enum", text: LanguageModule.text("txt_enum")},
                {value: "structure", text: LanguageModule.text("txt_structure")}
            ],
            value: host.dataTypeDetail.type,
            enableSearch: true
        },
        on: {
            change: function(){
                carddone.datatypes.changeType(host, id);
            }
        }
    });
    host.name_decpre_select = DOMElement.span({
        attrs: {
            style: {
                whiteSpace: "nowrap",
                marginRight: "var(--control-horizontal-distance-2)",
                display: "inline-block",
                paddingTop: "var(--control-verticle-distance-2)"
            }
        },
        text: LanguageModule.text("txt_number_of_decimal")
    });
    host.decpre_select = absol.buildDom({
        tag: "selectmenu",
        style: {
            verticalAlign: "middle",
            width: "400px"
        },
        props: {
            value: host.dataTypeDetail.decpre,
            items: [
                {value: 0, text: LanguageModule.text("txt_number_of_decimal_0")},
                {value: 1, text: LanguageModule.text("txt_number_of_decimal_1")},
                {value: 2, text: LanguageModule.text("txt_number_of_decimal_2")},
                {value: 3, text: LanguageModule.text("txt_number_of_decimal_3")},
                {value: 4, text: LanguageModule.text("txt_number_of_decimal_4")},
                {value: 5, text: LanguageModule.text("txt_number_of_decimal_5")}
            ]
        }
    });
    host.name_type_of_array = DOMElement.span({
        attrs: {
            style: {
                whiteSpace: "nowrap",
                marginRight: "var(--control-horizontal-distance-2)",
                display: "inline-block",
                paddingTop: "var(--control-verticle-distance-2)"
            }
        },
        text: LanguageModule.text("txt_type_of_array")
    });
    host.listType = [];
    for (var i = 0; i < data_module.typelists.items.length; i++){
        if (data_module.typelists.items[i].available == 0) continue;
        if (data_module.typelists.items[i].id == id) continue;
        if (data_module.typelists.items[i].object_selection == "activity") continue;
        host.listType.push({value: data_module.typelists.items[i].id, text: data_module.typelists.items[i].name});
    }
    host.select_type_of_array = absol.buildDom({
        tag: "selectmenu",
        style: {
            verticalAlign: "middle",
            width: "400px",
            paddingTop: "var(--control-verticle-distance-2)"
        },
        props: {
            items: host.listType,
            enableSearch: true
        }
    });
    if (typeOfArray !== undefined) host.select_type_of_array.value = typeOfArray;
    host.listTypeEnum = [];
    for (var i = 0; i < data_module.typelists.items.length; i++){
        if (data_module.typelists.items[i].available == 0) continue;
        if (data_module.typelists.items[i].id == id) continue;
        if (data_module.typelists.items[i].object_selection == "activity") continue;
        host.listTypeEnum.push({value: data_module.typelists.items[i].id, text: data_module.typelists.items[i].name});
    }
    host.name_type_of_enum = DOMElement.span({
        attrs: {
            style: {
                whiteSpace: "nowrap",
                marginRight: "var(--control-horizontal-distance-2)",
                display: "inline-block",
                paddingTop: "var(--control-verticle-distance-2)"
            }
        },
        text: LanguageModule.text("txt_type_of_enum")
    });
    host.select_type_of_enum = absol.buildDom({
        tag: "selectmenu",
        style: {
            verticalAlign: "middle",
            width: "400px",
            paddingTop: "var(--control-verticle-distance-2)"
        },
        props: {
            items: host.listTypeEnum,
            enableSearch: true
        },
        on: {
            change: function(event){
                host.detailEnum = [];
                carddone.datatypes.drawDetailEnum(host, id, host.detail_of_enum_container, host.detailEnum, this.value);
            }
        }
    });
    if (typeofEnum !== undefined) host.select_type_of_enum.value = typeofEnum;
    host.detail_of_structure_container = carddone.datatypes.drawDetailStructure(host, host.detailStructure);
    host.detail_of_enum_container = DOMElement.div({attrs: {className: "cardsimpletableclass"}});
    host.comment_inputtext = DOMElement.textarea({
        attrs: {
            className: "cardSimpleTextarea",
            style: {
                width: "400px",
                height: "70px"
            }
        },
        text: host.dataTypeDetail.comment
    });
    host.object_selection_select = absol.buildDom({
        tag: "selectmenu",
        style: {
            verticalAlign: "middle"
        },
        props: {
            value: host.dataTypeDetail.object_selection,
            items: [
                // {value: "object", text: LanguageModule.text("txt_object")},
                {value: "field", text: LanguageModule.text("txt_activity")},
                {value: "other", text: LanguageModule.text("txt_other")}
            ]
        }
    });
    host.available_checkbox = absol.buildDom({
        tag: "checkbox",
        props: {
            checked: host.dataTypeDetail.available
        }
    });
    var singlePage = host.funcs.formDataTypesEdit({
        buttonlist: buttonlist,
        name_inputtext: host.name_inputtext,
        type_select: host.type_select,
        decpre_select: host.decpre_select,
        name_decpre_select: host.name_decpre_select,
        name_type_of_array: host.name_type_of_array,
        select_type_of_array: host.select_type_of_array,
        name_type_of_enum: host.name_type_of_enum,
        select_type_of_enum: host.select_type_of_enum,
        detail_of_structure_container: host.detail_of_structure_container,
        detail_of_enum_container: host.detail_of_enum_container,
        comment_inputtext: host.comment_inputtext,
        available_checkbox: host.available_checkbox,
        object_selection_select: host.object_selection_select
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.datatypes.changeType(host, id);
    host.name_inputtext.focus();
};

carddone.datatypes.addType = function(host, id){
    if (id == 0){
        host.dataTypeDetail = {
            id: 0,
            name: "",
            type: "string",
            content: "",
            userid: 0,
            available: 1,
            object_selection: "other"
        };
        carddone.datatypes.redrawAddType(host, id);
    }
    else {
        ModalElement.show_loading();
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "datatypes_load_details"},
                {name: "id", value: id}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        host.dataTypeDetail = EncodingClass.string.toVariable(message.substr(2));
                        carddone.datatypes.redrawAddType(host, id);
                    }
                    else if (message == "fail id"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                carddone.datatypes.init(host);
                            }
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
};

carddone.datatypes.redraw = function(host){
    var quickMenuItems, celldata;
    var nameDebug, data = [];
    data_module.typelists.items.sort(function(a, b){
        if (a.id < 0 && b.id < 0) return b.id - a.id;
        if (a.id < 0) return 1;
        if (b.id < 0) return 1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
        return 0;
    });
    for (var i = 0; i < data_module.typelists.items.length; i++) {
        if (data_module.typelists.items[i].id < 0) continue;
        if (data_module.typelists.items[i].object_selection == "activity") continue;
        nameDebug = data_module.typelists.items[i].name;
        if (systemconfig.debugMode){
            nameDebug += "\n id: " + data_module.typelists.items[i].id + " (index: " + i + ")";
        }
        celldata = {
            name: nameDebug,
            type: data_module.typelists.items[i].type,
            createdby: contentModule.getUsernameByhomeidFromDataModule(data_module.typelists.items[i].userid),
            available: contentModule.availableName(data_module.typelists.items[i].available),
            object_selection: contentModule.object_selectionName(data_module.typelists.items[i].object_selection),
            createdtime: contentModule.getTimeSend(data_module.typelists.items[i].createdtime),
            lastmodifiedtime: contentModule.getTimeSend(data_module.typelists.items[i].lastmodifiedtime)
        };
        quickMenuItems = [];
        quickMenuItems.push({
            text: LanguageModule.text("txt_edit"),
            extendClasses: "bsc-quickmenu",
            icon: {
                tag: "i",
                class: "material-icons",
                child:{text: "mode_edit"}
            },
            cmd: function(host, id){
                return function(event, me) {
                    carddone.datatypes.addType(host, id);
                }
            } (host, data_module.typelists.items[i].id)
        });
        quickMenuItems.push({
            text: LanguageModule.text("txt_delete"),
            extendClasses: "bsc-quickmenu red",
            icon: {
                tag: "i",
                class: "material-icons",
                child:{text: "delete"}
            },
            cmd: function(host, id){
                return function(event, me) {
                    carddone.datatypes.deleteTypeConfirm(host, id);
                }
            } (host, data_module.typelists.items[i].id)
        });
        celldata.quickMenuItems = quickMenuItems;
        data.push(celldata);
    }
    DOMElement.removeAllChildren(host.data_container);
    host.data_container.appendChild(host.funcs.formTypeContentData({
        content: data,
        inputsearchbox: host.inputsearchbox
    }));
    host.inputsearchbox.onchange();
};

carddone.datatypes.init = function(host){
    if (!data_module.users || !data_module.typelists || !data_module.nations || !data_module.cities){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.datatypes.init(host);
        }, 50);
        return;
    }
    host.typeHasContent = ["array", "enum", "structure"];
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
        }),
        host.funcs.addButton({
            onclick: function (host){
                return function(event, me){
                    carddone.datatypes.addType(host, 0);
                }
            }(host)
        })
    ];
    host.data_container = DOMElement.div({
        attrs: {
            className: "cardsimpletableclass row2colors cardtablehover",
            style: {
                marginBottom: "100px"
            }
        }
    });
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formDatatypesInit({
        buttonlist: buttonlist,
        data_container: host.data_container,
        inputsearchbox: host.inputsearchbox
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.datatypes.redraw(host);
};
ModuleManagerClass.register({
    name: "Datatypes",
    prerequisites: ["ModalElement", "FormClass"]
});
