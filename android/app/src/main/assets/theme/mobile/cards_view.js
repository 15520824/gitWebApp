'use strict';

theme.cardAddFieldForm = function(params){
    var vIndex, buttons = [], typeCombobox;
    var content_container = absol._({
        style: {paddingTop: "20px"}
    });
    var database = {
        typelists: params.typelists,
        values: params.values,
        nations: params.nations,
        cities: params.cities,
        users: params.users
    };
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }
    var props = {
        items: params.fieldList
    };
    if (params.valueid > 0){
        vIndex = params.values.getIndex(params.valueid);
        props.value = params.values.items[vIndex].typeid;
    }
    else {
        vIndex = -1;
    }

    if (params.id > 0) props.disabled = true;

    var host = {database: database, funcs: params.funcs, listValueId: []};

    var typeChange = function(){
        var typeid = typeCombobox.value;

        var content = contentModule.getObjectbyType(host, typeid, params.valueid);

        content_container.clearChild();

        content_container.addChild(content);
    };

    typeCombobox = absol._({
        style: {
            verticalAlign: "top",
            marginLeft: "10px"
        },
        tag: 'selectmenu',
        props: props,
        on: {
            change: function(){
                typeChange();
            }
        }
    });

    typeChange();

    var st = absol._({
        child: [
            {
                child: [
                    {
                        style: {
                            display: "inline-block",
                            lineHeight: "30px",
                            verticalAlign: "top"
                        },
                        child: {text: LanguageModule.text("txt_field")}
                    },
                    typeCombobox
                ]
            },
            content_container
        ]
    });
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: st
            }
        ]
    });
    returnData.getValue = function(){
        return {
            typeid: typeCombobox.value,
            listValueId: host.listValueId,
            value: content_container.childNodes[0].getValue()
        };
    };
    return returnData;
};

theme.cardGenerateDateElt = function(defaultValue){
    var elt = absol.buildDom({
        tag: 'calendar-input',
        data: {
            value: defaultValue
        }
    });
    return elt;
}

theme.cardGenerateDateTimeElt = function(defaultValue){
    var date = absol.buildDom({
        tag: 'calendar-input',
        style: {
            marginRight: "var(--control-horizontal-distance-1)"
        },
        data: {
            value: defaultValue
        }
    });
    var time = absol.buildDom({
        tag: 'timeinput',
        props: {
            dayOffset: defaultValue
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
}

theme.cardGenerateEnumElt = function(typeid, typelists, status_value){
    var list = [];
    var typeIndex = typelists.getIndex(typeid);
    for (var i = 0; i < typelists.items[typeIndex].content.details.length; i++){
        list.push({
            value: typelists.items[typeIndex].content.details[i].localid,
            text: typelists.items[typeIndex].content.details[i].text
        });
    }

    var status = absol._({
        tag: "selectmenu",
        style: {
            width: "400px"
        },
        props: {
            items: list,
            value: status_value
        }
    });
    return status;
}

theme.cardGenerateUserListElt = function(users, participant_value){
    var list = [];
    for (var i = 0; i < users.items.length; i++){
        list.push({
            value: users.items[i].homeid,
            text: users.items[i].username
        });
    }
    var elt = absol.buildDom({
        tag: 'selectbox',
        style: {
            textAlign: "left",
            display: "block",
            width: "400px"
        },
        props: {
            items: list,
            values: participant_value,
            enableSearch: true
        }
    });
    return elt;
};

theme.cardGenerateUserElt = function(users, assigned_to_value){
    var list = [];
    for (var i = 0; i < users.items.length; i++){
        list.push({
            value: users.items[i].homeid,
            text: users.items[i].username
        });
    }
    var props = {
        items: list,
        enableSearch: true
    };
    if (assigned_to_value) props.value = assigned_to_value;
    var elt = absol.buildDom({
        tag: 'selectmenu',
        style: {
            width: "400px"
        },
        props: props
    });
    return elt;
};

theme.cardAddItemOfCheckListForm = function(typelists, value){
    var data = [], itemsTable;
    var nameElt = function(value){
        var st = theme.input({
            type: 'text',
            style: {
                width: "200px"
            },
            value: value
        });
        return st;
    };
    var dueDateElt = function(value){
        var st = absol._({
            tag: 'dateinput',
            props: {
                value: value,
                format: 'dd/mm/yyyy'
            }
        });
        return st;
    };
    var deleteIcon = function(){
        var st;
        st = absol._({
            class: "card-icon-remove-cover",
            child: {
                tag: "i",
                style: {
                    verticalAlign: 'middle'
                },
                class: ["material-icons", "card-icon-remove"],
                child:{text: "remove_circle"}
            }
        });
        return st;
    };
    var successElt = function(value){
        var st;
        st = absol._({
            tag: "checkbox",
            props: {
                checkbox: value
            }
        });
        return st;
    };
    var indexElt = function(value){
        var st = theme.input({
            type: 'text',
            style: {
                width: "200px"
            },
            value: value
        });
        return st;
    };
    value.forEach(function(elt){
        var items, name, due_date, reminder, index, success, icon;
        elt.value.forEach(function(elt2){
            switch (elt2.localid) {
                case "type_check_list_item_name":
                    name = nameElt(elt2.value);
                    name.localid = elt2.localid;
                    name.valueid = elt2.valueid;
                    name.typeid = elt2.typeid;
                    name.privtype = elt2.privtype;
                    break;
                case "type_check_list_item_due_date":
                    due_date = dueDateElt(elt2.value);
                    due_date.localid = elt2.localid;
                    due_date.valueid = elt2.valueid;
                    due_date.typeid = elt2.typeid;
                    due_date.privtype = elt2.privtype;
                    break;
                case "type_check_list_item_reminder":
                    reminder = theme.cardGenerateEnumElt(-17, typelists, elt2.value);
                    reminder.removeStyle("width");
                    reminder.localid = elt2.localid;
                    reminder.valueid = elt2.valueid;
                    reminder.typeid = elt2.typeid;
                    reminder.privtype = elt2.privtype;
                    break;
                case "type_check_list_item_success":
                    success = successElt(elt2.value);
                    success.localid = elt2.localid;
                    success.valueid = elt2.valueid;
                    success.typeid = elt2.typeid;
                    success.privtype = elt2.privtype;
                    break;
                case "type_check_list_item_index":
                    index = indexElt(elt2.value);
                    index.localid = elt2.localid;
                    index.valueid = elt2.valueid;
                    index.typeid = elt2.typeid;
                    index.privtype = elt2.privtype;
                    break;
            }
        });
        icon = deleteIcon();
        items = [{}, {value: elt.valueid}, {element: success}, {element: name}, {element: due_date}, {element: reminder}, {element: index}, {style: {textAlign: "center"}, element: icon}];
        data.push(items);
    });

    var functionClickMore = function(event,me,index,data,row){
        itemsTable.dropRow(index);
    };

    var header = [
        {type: 'dragzone'},
        {hidden: true},
        {value: ""},
        {value: LanguageModule.text('txt_check_list')},
        {value: LanguageModule.text("txt_due_date")},
        {value: LanguageModule.text("txt_reminder")},
        {hidden: true},
        {functionClickAll: functionClickMore,icon: ""}
    ];
    itemsTable = pizo.tableView(header, data, false, true);

    itemsTable.style.width = "100%";

    var addNewItem = function(){
        var reminder = theme.cardGenerateEnumElt(-17, typelists, 'type_reminder_none');
        reminder.removeStyle("width");
        reminder.localid = "type_check_list_item_reminder";
        reminder.valueid = 0;
        reminder.typeid = -17;
        reminder.privtype = "enum";
        var name = nameElt("");
        name.localid = "type_check_list_item_name";
        name.valueid = 0;
        name.typeid = -1;
        name.privtype = "string";
        var due_date = dueDateElt();
        due_date.localid = "type_check_list_item_due_date";
        due_date.valueid = 0;
        due_date.typeid = -5;
        due_date.privtype = "datetime";
        var success = successElt(false);
        success.localid = "type_check_list_item_success";
        success.valueid = 0;
        success.typeid = -6;
        success.privtype = "boolean";
        var index = indexElt(1);
        index.localid = "type_check_list_item_index";
        index.valueid = 0;
        index.typeid = -3;
        index.privtype = "number";
        icon = deleteIcon();
        var data = [{}, {value: 0}, {element: success}, {element: name}, {element: due_date}, {element: reminder}, {element: index}, {element: deleteIcon()}];
        itemsTable.insertRow(data);
    }

    var returnData = absol._({
        style: {
            overflowY: "hidden"
        },
        child: [
            itemsTable,
            {
                style: {
                    backgroundColor: '#f7f6f6',
                    paddingTop: "10px",
                    paddingBottom: '10px',
                    paddingLeft: '10px'
                },
                child: {
                    tag: "a",
                    style: {
                        paddingTop: "10px",
                        paddingLeft: "20px",
                        color: "#147af6",
                        cursor: "pointer",
                        textDecoration: "underline"
                    },
                    child: {text: "+ " + LanguageModule.text("txt_add")},
                    on: {
                        click: function(){
                            addNewItem();
                        }
                    }
                }
            }
        ]
    });

    returnData.getValue = function(){
        var data = itemsTable.data;
        var content = [];
        for (var j = 0; j < data.length; j++){
            var item = data[j];
            var name = item[3].element.value.trim();
            if (name == ""){
                ModalElement.alert({
                    message: LanguageModule.text("war_checklist_name_is_empty"),
                    func: function(){
                        item[3].element.focus();
                    }
                });
                return false;
            }
            var due_date = item[4].element.value;
            var reminder = item[5].element.value;
            var success = item[2].element.value;
            content.push({
                valueid: item[1].value,
                typeid: -16,
                privtype: "structure",
                value: [
                    {
                        localid: item[2].element.localid,
                        valueid: item[2].element.valueid,
                        typeid: item[2].element.typeid,
                        privtype: item[2].element.privtype,
                        value: reminder
                    },
                    {
                        localid: item[3].element.localid,
                        valueid: item[3].element.valueid,
                        typeid: item[3].element.typeid,
                        privtype: item[3].element.privtype,
                        value: name
                    },
                    {
                        localid: item[4].element.localid,
                        valueid: item[4].element.valueid,
                        typeid: item[4].element.typeid,
                        privtype: item[4].element.privtype,
                        value: due_date
                    },
                    {
                        localid: item[5].element.localid,
                        valueid: item[5].element.valueid,
                        typeid: item[5].element.typeid,
                        privtype: item[5].element.privtype,
                        value: reminder
                    },
                    {
                        localid: item[6].element.localid,
                        valueid: item[6].element.valueid,
                        typeid: item[6].element.typeid,
                        privtype: item[6].element.privtype,
                        value: j + 1
                    }
                ]
            });
        }
        return content;
    }
    return returnData;
}

theme.cardAddCheckListForm = function(params){
    var buttons = [], content, titles, vIndex, oIndex;
    var board, card, name, items, created, user_created;
    var name_value, items_value, created_value, user_created_value;
    var checkListValue = [];
    var index = params.typelists.getIndex(-25);
    var details = params.typelists.items[index].content.details;
    var getItemList = function(valueid){
        // var content = EncodingClass.string.toVariable(params.values.items[params.values.getIndex(valueid)].content);
        var value = [];
        valueid.forEach(function(elt){
            var subvalue = [], tIndex;
            var content2 = EncodingClass.string.toVariable(params.values.items[params.values.getIndex(elt)].content);
            content2.forEach(function(elt2){
                var itemValue;
                switch (elt2.localid) {
                    case "type_check_list_item_name":
                        itemValue = params.values.items[params.values.getIndex(elt2.valueid)].content;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -1,
                            privtype: "string"
                        });
                        break;
                    case "type_check_list_item_index":
                        itemValue = params.values.items[params.values.getIndex(elt2.valueid)].numbercontent;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -3,
                            privtype: "number"
                        });
                        tIndex = itemValue;
                        break;
                    case "type_check_list_item_success":
                        itemValue = params.values.items[params.values.getIndex(elt2.valueid)].content;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -6,
                            privtype: "boolean"
                        });
                        break;
                    case "type_check_list_item_due_date":
                        itemValue = new Date(params.values.items[params.values.getIndex(elt2.valueid)].timecontent);
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -5,
                            privtype: "datetime"
                        });
                        break;
                    case "type_check_list_item_reminder":
                        itemValue = params.values.items[params.values.getIndex(elt2.valueid)].content;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -17,
                            privtype: "enum"
                        });
                        break;
                }
            });
            value.push({
                valueid: elt,
                value: subvalue,
                index: tIndex,
                typeid: -16,
                privtype: "structure"
            });
        });
        return value;
    };
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        vIndex = params.values.getIndex(params.objects.items[oIndex].valueid);
        EncodingClass.string.toVariable(params.values.items[vIndex].content).forEach(function(elt){
            var tIndex = params.values.getIndex(elt.valueid);
            switch (elt.localid) {
                case "type_check_list_name":
                    name_value = params.values.items[tIndex].content;
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -1,
                        value: name_value,
                        privtype: "string"
                    });
                    break;
                case "type_check_list_items":
                    items_value = getItemList(EncodingClass.string.toVariable(params.values.items[tIndex].content));
                    items_value.sort(function(a, b){
                        if (a.index > b.index) return 1;
                        if (a.index < b.index) return -1;
                        return 0;
                    });
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -24,
                        value: items_value,
                        privtype: "array"
                    });
                    break;
                case "type_check_list_created":
                    created_value = new Date(EncodingClass.string.toVariable(params.values.items[tIndex].content));
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_check_list_user_created":
                    user_created_value = params.values.items[tIndex].content;
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    else {
        vIndex = -1;
        details.forEach(function(elt){
            switch (elt.localid) {
                case "type_check_list_name":
                    name_value = elt.default;
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: name_value,
                        privtype: "string"
                    });
                    break;
                case "type_check_list_items":
                    items_value = elt.default;
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -24,
                        value: items_value,
                        privtype: "array"
                    });
                    break;
                case "type_check_list_created":
                    created_value = new Date();
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_check_list_user_created":
                    user_created_value = params.userid;
                    checkListValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }

    titles = [
        LanguageModule.text("txt_board"),
        LanguageModule.text("txt_card")
    ];

    details.forEach(function(elt){
        titles.push(elt.name);
    });

    var maxWidth = 0;

    for (var i = 0; i < titles.length; i++){
        var tempText = DOMElement.span({text: titles[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }

    board = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.cardName
    });

    name = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        value: name_value
    });

    created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(params.users, user_created_value)
    });

    items = theme.cardAddItemOfCheckListForm(params.typelists, items_value);

    var leftData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_board")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [board]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_card")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [card]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_name")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                attrs: {style: {width: "400px"}},
                children: [name]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [created]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_user_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [user_created]
            }
        ]
    ];

    var rightData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                }
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [items]
            }
        ]
    ];
    var st = absol._({
        child: [
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "20px",
                    marginBottom: "20px"
                },
                child: DOMElement.table({data: leftData})
            },
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top"
                },
                child: DOMElement.table({data: rightData})
            }
        ]
    })
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: st
            }
        ]
    });
    returnData.getValue = function(){
        var name_value, items_value;
        name_value = name.value.trim();
        if (name_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_name"),
                func: function(){
                    name.focus();
                }
            });
            return false;
        }
        items_value = items.getValue();
        if (!items_value) return false;
        if (items_value.length == 0){
            ModalElement.alert({
                message: LanguageModule.text("war_no_items_of_checklist")
            });
            return false;
        }
        checkListValue.forEach(function(elt){
            switch (elt.localid) {
                case "type_check_list_name":
                    elt.value = name_value;
                    break;
                case "type_check_list_items":
                    elt.value = items_value;
                    break;
                case "type_check_list_created":
                    elt.value = created_value;
                    break;
                case "type_check_list_user_created":
                    elt.value = user_created_value;
                    break;
            }
        });
        return checkListValue;
    };
    return returnData;
};

theme.cardAddWaitForm = function(params){
    var buttons = [], content, titles, vIndex, oIndex;
    var board, card, duration, message, created, user_created;
    var duration_value, message_value, created_value, user_created_value;
    var index = params.typelists.getIndex(-23);
    var details = params.typelists.items[index].content.details;
    var waitValue = [];
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        vIndex = params.values.getIndex(params.objects.items[oIndex].valueid);
        EncodingClass.string.toVariable(params.values.items[vIndex].content).forEach(function(elt){
            var tIndex = params.values.getIndex(elt.valueid);
            switch (elt.localid) {
                case "type_wait_duration":
                    duration_value = params.values.items[tIndex].numbercontent;
                    waitValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -3,
                        value: duration_value,
                        privtype: "number"
                    });
                    break;
                case "type_wait_message":
                    message_value = params.values.items[tIndex].content;
                    waitValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -2,
                        value: message_value,
                        privtype: "note"
                    });
                    break;
                case "type_wait_created":
                    created_value = new Date(params.values.items[tIndex].timecontent);
                    waitValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_wait_user_created":
                    user_created_value = params.values.items[tIndex].content;
                    waitValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    else {
        vIndex = -1;
        details.forEach(function(elt){
            switch (elt.localid) {
                case "type_wait_duration":
                    duration_value = elt.default;
                    waitValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -3,
                        value: duration_value,
                        privtype: "number"
                    });
                    break;
                case "type_wait_message":
                    message_value = elt.default;
                    waitValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -2,
                        value: message_value,
                        privtype: "note"
                    });
                    break;
                case "type_wait_created":
                    created_value = new Date();
                    waitValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_wait_user_created":
                    user_created_value = params.userid;
                    waitValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }

    titles = [
        LanguageModule.text("txt_board"),
        LanguageModule.text("txt_card")
    ];

    details.forEach(function(elt){
        titles.push(elt.name);
    });

    var maxWidth = 0;

    for (var i = 0; i < titles.length; i++){
        var tempText = DOMElement.span({text: titles[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }

    board = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.cardName
    });

    duration = theme.input({
        type: 'number',
        style: {
            width: "50px"
        },
        value: duration_value
    });

    message = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "400px",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: message_value
        }
    });

    created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(params.users, user_created_value)
    });

    var leftData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_board")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [board]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_card")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [card]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_duration")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                attrs: {style: {width: "400px"}},
                children: [
                    absol._({
                        tag: "span",
                        child: {text: "Sau "}
                    }),
                    duration,
                    absol._({
                        tag: "span",
                        child: {text: " ngày mà không ghi nhận được hoạt động nào thì thông báo cho người quản lý card."}
                    })
                ]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_message")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [message]
            }
        ]
    ];

    var rightData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [created]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_user_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [user_created]
            }
        ]
    ];
    var st = absol._({
        child: [
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "20px",
                    marginBottom: "20px"
                },
                child: DOMElement.table({data: leftData})
            },
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top"
                },
                child: DOMElement.table({data: rightData})
            }
        ]
    })
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: st
            }
        ]
    });
    returnData.getValue = function(){
        var duration_value, message_value;
        duration_value = duration.value.trim();
        if (duration_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_duration"),
                func: function(){
                    duration.focus();
                }
            });
            return false;
        }
        message_value = message.value.trim();
        if (message_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_message_value"),
                func: function(){
                    message.focus();
                }
            });
            return false;
        }
        waitValue.forEach(function(elt){
            switch (elt.localid) {
                case "type_wait_duration":
                    elt.value = duration_value;
                    break;
                case "type_wait_message":
                    elt.value = message_value;
                    break;
                case "type_wait_created":
                    elt.value = created_value;
                    break;
                case "type_wait_user_created":
                    elt.value = user_created_value;
                    break;

            }
        })
        return waitValue;
    };
    return returnData;
};

theme.cardAddCallForm = function(params){
    var buttons = [], content, titles, vIndex, oIndex;
    var board, card, call_to, result, status, due_date, reminder, assigned_to, participant, created, user_created, work;
    var call_to_value, result_value, status_value, due_date_value, reminder_value, created_value, assigned_to_value, participant_value, work_value, user_created_value;
    var callValue = [];
    var index = params.typelists.getIndex(-22);
    var details = params.typelists.items[index].content.details;
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        vIndex = params.values.getIndex(params.objects.items[oIndex].valueid);
        EncodingClass.string.toVariable(params.values.items[vIndex].content).forEach(function(elt){
            var tIndex = params.values.getIndex(elt.valueid);
            switch (elt.localid) {
                case "type_call_due_date":
                    due_date_value = new Date(params.values.items[tIndex].timecontent);
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -5,
                        value: due_date_value,
                        privtype: "datetime"
                    });
                    break;
                case "type_call_reminder":
                    reminder_value = params.values.items[tIndex].content;
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -17,
                        value: reminder_value,
                        privtype: "enum"
                    });
                    break;
                case "type_call_created":
                    created_value = new Date(params.values.items[tIndex].timecontent);
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_call_call_to":
                    call_to_value = params.values.items[tIndex].content;
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -1,
                        value: call_to_value,
                        privtype: "string"
                    });
                    break;
                case "type_call_result":
                    result_value = params.values.items[tIndex].content;
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -2,
                        value: result_value,
                        privtype: "note"
                    });
                    break;
                case "type_call_status":
                    status_value = params.values.items[tIndex].content;
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -6,
                        value: status_value,
                        privtype: "enum"
                    });
                    break;
                case "type_call_work":
                    work_value = params.values.items[tIndex].content;
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -1,
                        value: work_value,
                        privtype: "string"
                    });
                    break;
                case "type_call_assigned_to":
                    assigned_to_value = params.values.items[tIndex].content;
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: assigned_to_value,
                        privtype: "user"
                    });
                    break;
                case "type_call_user_created":
                    user_created_value = params.values.items[tIndex].content;
                    callValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    else {
        vIndex = -1;
        details.forEach(function(elt){
            switch (elt.localid) {
                case "type_call_due_date":
                    due_date_value = new Date();
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -5,
                        value: due_date_value,
                        privtype: "datetime"
                    });
                    break;
                case "type_call_reminder":
                    reminder_value = elt.default;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -17,
                        value: reminder_value,
                        privtype: "enum"
                    });
                    break;
                case "type_call_created":
                    created_value = new Date();
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_call_call_to":
                    call_to_value = elt.default;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: call_to_value,
                        privtype: "string"
                    });
                    break;
                case "type_call_result":
                    result_value = elt.default;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -2,
                        value: result_value,
                        privtype: "note"
                    });
                    break;
                case "type_call_status":
                    status_value = elt.default;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -6,
                        value: status_value,
                        privtype: "enum"
                    });
                    break;
                case "type_call_work":
                    work_value = elt.default;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: work_value,
                        privtype: "string"
                    });
                    break;
                case "type_call_assigned_to":
                    assigned_to_value = undefined;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: assigned_to_value,
                        privtype: "user"
                    });
                    break;
                case "type_call_user_created":
                    user_created_value = params.userid;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
                default:
            }
        });
    }
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }

    titles = [
        LanguageModule.text("txt_board"),
        LanguageModule.text("txt_card")
    ];

    details.forEach(function(elt){
        titles.push(elt.name);
    });

    var maxWidth = 0;

    for (var i = 0; i < titles.length; i++){
        var tempText = DOMElement.span({text: titles[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }

    board = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.cardName
    });

    call_to = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        value: call_to_value
    });

    work = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        value: work_value
    });

    result = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "400px",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: result_value
        }
    });

    // status = theme.cardGenerateEnumElt(-13, params.typelists, status_value);
    status = absol._({
        tag: "checkbox",
        props: {
            checked: status_value
        }
    });

    assigned_to = theme.cardGenerateUserElt(params.users, assigned_to_value);

    due_date = theme.cardGenerateDateTimeElt(due_date_value);

    reminder = theme.cardGenerateEnumElt(-17, params.typelists, reminder_value);

    created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(params.users, user_created_value)
    });

    var leftData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_board")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [board]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_card")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [card]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_call_to")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [call_to]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_work")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [work]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_result")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [result]
            }
        ]
    ];

    var rightData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_status")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [status]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_due_date")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [due_date]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_reminder")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [reminder]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_assigned_to")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [assigned_to]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [created]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_user_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [user_created]
            }
        ]
    ];
    var st = absol._({
        child: [
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "20px",
                    marginBottom: "20px"
                },
                child: DOMElement.table({data: leftData})
            },
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top"
                },
                child: DOMElement.table({data: rightData})
            }
        ]
    })
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: st
            }
        ]
    });
    returnData.getValue = function(){
        var call_to_value, result_value, status_value, type_value, due_date_value, reminder_value, assigned_to_value, participant_value, work_value;
        call_to_value = call_to.value.trim();
        if (call_to_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_call_to_name"),
                func: function(){
                    call_to.focus();
                }
            });
            return false;
        }
        work_value = work.value.trim();
        if (work_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function(){
                    work.focus();
                }
            });
            return false;
        }
        status_value = status.checked;
        result_value = result.value.trim();
        if (status_value == "txt_success" && result_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_result_value"),
                func: function(){
                    result.focus();
                }
            });
            return false;
        }
        due_date_value = due_date.getValue();
        reminder_value = reminder.value;
        assigned_to_value = assigned_to.value;
        callValue.forEach(function(elt){
            switch (elt.localid) {
                case "type_call_due_date":
                    elt.value = due_date_value;
                    break;
                case "type_call_reminder":
                    elt.value = reminder_value;
                    break;
                case "type_call_created":
                    elt.value = created_value;
                    break;
                case "type_call_call_to":
                    elt.value = call_to_value;
                    break;
                case "type_call_result":
                    elt.value = result_value;
                    break;
                case "type_call_status":
                    elt.value = status_value;
                    break;
                case "type_call_work":
                    elt.value = work_value;
                    break;
                case "type_call_assigned_to":
                    elt.value = assigned_to_value;
                    break;
                case "type_call_user_created":
                    elt.value = user_created_value;
                    break;
            }
        });
        return callValue;
    };
    return returnData;
};

theme.cardAddTaskForm = function(params){
    var buttons = [], content, titles, vIndex, oIndex;
    var board, card, work, result, status, due_date, reminder, assigned_to, participant, created, user_created;
    var work_value, result_value, status_value, due_date_value, reminder_value, created_value, assigned_to_value, participant_value, user_created_value;
    var taskValue = [];
    var index = params.typelists.getIndex(-18);
    var details = params.typelists.items[index].content.details;
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        vIndex = params.values.getIndex(params.objects.items[oIndex].valueid);
        EncodingClass.string.toVariable(params.values.items[vIndex].content).forEach(function(elt){
            var tIndex = params.values.getIndex(elt.valueid);
            switch (elt.localid) {
                case "type_task_due_date":
                    due_date_value = new Date(params.values.items[tIndex].timecontent);
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -5,
                        value: due_date_value,
                        privtype: "datetime"
                    });
                    break;
                case "type_task_reminder":
                    reminder_value = params.values.items[tIndex].content;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -17,
                        value: reminder_value,
                        privtype: "enum"
                    });
                    break;
                case "type_task_created":
                    created_value = new Date(params.values.items[tIndex].timecontent);
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_task_work":
                    work_value = params.values.items[tIndex].content;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -1,
                        value: work_value,
                        privtype: "string"
                    });
                    break;
                case "type_task_result":
                    result_value = params.values.items[tIndex].content;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -2,
                        value: result_value,
                        privtype: "note"
                    });
                    break;
                case "type_task_status":
                    status_value = params.values.items[tIndex].content;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -6,
                        value: status_value,
                        privtype: "enum"
                    });
                    break;
                case "type_task_assigned_to":
                    assigned_to_value = params.values.items[tIndex].content;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: assigned_to_value,
                        privtype: "user"
                    });
                    break;
                case "type_task_participant":
                    participant_value = EncodingClass.string.toVariable(params.values.items[tIndex].content);
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -9,
                        value: participant_value,
                        privtype: "userlist"
                    });
                    break;
                case "type_task_user_created":
                    user_created_value = params.values.items[tIndex].content;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    else {
        vIndex = -1;
        details.forEach(function(elt){
            switch (elt.localid) {
                case "type_task_due_date":
                    due_date_value = new Date();
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -5,
                        value: due_date_value,
                        privtype: "datetime"
                    });
                    break;
                case "type_task_reminder":
                    reminder_value = elt.default;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -17,
                        value: reminder_value,
                        privtype: "enum"
                    });
                    break;
                case "type_task_created":
                    created_value = new Date();
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_task_work":
                    work_value = elt.default;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: work_value,
                        privtype: "string"
                    });
                    break;
                case "type_task_result":
                    result_value = elt.default;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -2,
                        value: result_value,
                        privtype: "note"
                    });
                    break;
                case "type_task_status":
                    status_value = elt.default;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -6,
                        value: status_value,
                        privtype: "enum"
                    });
                    break;
                case "type_task_assigned_to":
                    assigned_to_value = undefined;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: assigned_to_value,
                        privtype: "user"
                    });
                    break;
                case "type_task_participant":
                    participant_value = elt.default;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -9,
                        value: participant_value,
                        privtype: "userlist"
                    });
                    break;
                case "type_task_user_created":
                    user_created_value = params.userid;
                    taskValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }

    titles = [
        LanguageModule.text("txt_board"),
        LanguageModule.text("txt_card")
    ];

    details.forEach(function(elt){
        titles.push(elt.name);
    });

    var maxWidth = 0;

    for (var i = 0; i < titles.length; i++){
        var tempText = DOMElement.span({text: titles[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }

    board = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.cardName
    });

    work = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        value: work_value
    });

    result = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "400px",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: result_value
        }
    });

    // status = theme.cardGenerateEnumElt(-13, params.typelists, status_value);
    status = absol._({
        tag: "checkbox",
        props: {
            checked: status_value
        }
    });

    // assigned_to = theme.cardGenerateEnumElt(-16, params.typelists, assigned_to_value);
    assigned_to = theme.cardGenerateUserElt(params.users, assigned_to_value);

    participant = theme.cardGenerateUserListElt(params.users, participant_value);

    due_date = theme.cardGenerateDateTimeElt(due_date_value);

    reminder = theme.cardGenerateEnumElt(-17, params.typelists, reminder_value);

    created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(params.users, user_created_value)
    });

    var leftData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_board")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [board]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_card")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [card]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_work")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [work]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_result")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [result]
            }
        ]
    ];

    var rightData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_status")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [status]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_due_date")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [due_date]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_reminder")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [reminder]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_assigned_to")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [assigned_to]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_participant")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [participant]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [created]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_user_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [user_created]
            }
        ]
    ];
    var st = absol._({
        child: [
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "20px",
                    marginBottom: "20px"
                },
                child: DOMElement.table({data: leftData})
            },
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top"
                },
                child: DOMElement.table({data: rightData})
            }
        ]
    })
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: st
            }
        ]
    });
    returnData.getValue = function(){
        var work_value, result_value, status_value, type_value, due_date_value, reminder_value, assigned_to_value, participant_value;
        work_value = work.value.trim();
        if (work_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function(){
                    work.focus();
                }
            });
            return false;
        }
        status_value = status.checked;
        result_value = result.value.trim();
        if (status_value == "txt_success" && result_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_result_value"),
                func: function(){
                    result.focus();
                }
            });
            return false;
        }
        due_date_value = due_date.getValue();
        reminder_value = reminder.value;
        assigned_to_value = assigned_to.value;
        participant_value = participant.values;
        taskValue.forEach(function(elt){
            switch (elt.localid) {
                case "type_task_due_date":
                    elt.value = due_date_value;
                    break;
                case "type_task_reminder":
                    elt.value = reminder_value;
                    break;
                case "type_task_created":
                    elt.value = created_value;
                    break;
                case "type_task_work":
                    elt.value = work_value;
                    break;
                case "type_task_result":
                    elt.value = result_value;
                    break;
                case "type_task_status":
                    elt.value = status_value;
                    break;
                case "type_task_assigned_to":
                    elt.value = assigned_to_value;
                    break;
                case "type_task_participant":
                    elt.value = participant_value;
                    break;
                case "type_task_user_created":
                    elt.value = user_created_value;
                    break;
            }
        });

        return taskValue;
    };
    return returnData;
};

theme.cardAddMeetingForm = function(params){
    var buttons = [], content, titles, vIndex, oIndex;
    var board, card, location, result, status, type, start_date, reminder, assigned_to, participant, created, user_created;
    var location_value, result_value, status_value, type_value, start_date_value, reminder_value, created_value, assigned_to_value, participant_value, user_created_value;
    var meetingValue = [];
    var index = params.typelists.getIndex(-20);
    var details = params.typelists.items[index].content.details;
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        vIndex = params.values.getIndex(params.objects.items[oIndex].valueid);
        EncodingClass.string.toVariable(params.values.items[vIndex].content).forEach(function(elt){
            var tIndex = params.values.getIndex(elt.valueid);
            switch (elt.localid) {
                case "type_meeting_start_date":
                    start_date_value = new Date(params.values.items[tIndex].timecontent);
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -5,
                        value: start_date_value,
                        privtype: "datetime"
                    });
                    break;
                case "type_meeting_reminder":
                    reminder_value = params.values.items[tIndex].content;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -17,
                        value: reminder_value,
                        privtype: "enum"
                    });
                    break;
                case "type_meeting_created":
                    created_value = new Date(params.values.items[tIndex].timecontent);
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_meeting_location":
                    location_value = params.values.items[tIndex].content;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -1,
                        value: location_value,
                        privtype: "string"
                    });
                    break;
                case "type_meeting_result":
                    result_value = params.values.items[tIndex].content;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -2,
                        value: result_value,
                        privtype: "note"
                    });
                    break;
                case "type_meeting_status":
                    status_value = params.values.items[tIndex].content;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -6,
                        value: status_value,
                        privtype: "enum"
                    });
                    break;
                case "type_meeting_type":
                    type_value = params.values.items[tIndex].content;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -19,
                        value: type_value,
                        privtype: "enum"
                    });
                    break;
                case "type_meeting_assigned_to":
                    assigned_to_value = params.values.items[tIndex].content;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: assigned_to_value,
                        privtype: "user"
                    });
                    break;
                case "type_meeting_participant":
                    participant_value = EncodingClass.string.toVariable(params.values.items[tIndex].content);
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -9,
                        value: participant_value,
                        privtype: "userlist"
                    });
                    break;
                case "type_meeting_user_created":
                    user_created_value = params.values.items[tIndex].content;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    else {
        vIndex = -1;
        details.forEach(function(elt){
            switch (elt.localid) {
                case "type_meeting_start_date":
                    start_date_value = new Date();
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -5,
                        value: start_date_value,
                        privtype: "datetime"
                    });
                    break;
                case "type_meeting_reminder":
                    reminder_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -17,
                        value: reminder_value,
                        privtype: "enum"
                    });
                    break;
                case "type_meeting_created":
                    created_value = new Date();
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -4,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_meeting_location":
                    location_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: location_value,
                        privtype: "string"
                    });
                    break;
                case "type_meeting_result":
                    result_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -2,
                        value: result_value,
                        privtype: "note"
                    });
                    break;
                case "type_meeting_status":
                    status_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -6,
                        value: status_value,
                        privtype: "enum"
                    });
                    break;
                case "type_meeting_type":
                    type_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -19,
                        value: type_value,
                        privtype: "enum"
                    });
                    break;
                case "type_meeting_assigned_to":
                    assigned_to_value = undefined;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: assigned_to_value,
                        privtype: "user"
                    });
                    break;
                case "type_meeting_participant":
                    participant_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -9,
                        value: participant_value,
                        privtype: "userlist"
                    });
                    break;
                case "type_meeting_user_created":
                    user_created_value = params.userid;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }

    titles = [
        LanguageModule.text("txt_board"),
        LanguageModule.text("txt_card")
    ];

    details.forEach(function(elt){
        titles.push(elt.name);
    });

    var maxWidth = 0;

    for (var i = 0; i < titles.length; i++){
        var tempText = DOMElement.span({text: titles[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }

    board = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.cardName
    });

    location = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        value: location_value
    });

    result = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "400px",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: result_value
        }
    });

    // status = theme.cardGenerateEnumElt(-13, params.typelists, status_value);
    status = absol._({
        tag: "checkbox",
        props: {
            checked: status_value
        }
    });

    type = theme.cardGenerateEnumElt(-19, params.typelists, type_value);

    // assigned_to = theme.cardGenerateEnumElt(-16, params.typelists, assigned_to_value);
    assigned_to = theme.cardGenerateUserElt(params.users, assigned_to_value);

    participant = theme.cardGenerateUserListElt(params.users, participant_value);

    start_date = theme.cardGenerateDateTimeElt(start_date_value);

    reminder = theme.cardGenerateEnumElt(-17, params.typelists, reminder_value);

    created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(params.users, user_created_value)
    });

    var leftData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_board")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [board]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_card")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [card]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_location")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [location]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_result")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [result]
            }
        ]
    ];

    var rightData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_status")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [status]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_type")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [type]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_start_date")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [start_date]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_reminder")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [reminder]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_assigned_to")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [assigned_to]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_participant")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [participant]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [created]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_user_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [user_created]
            }
        ]
    ];
    var st = absol._({
        child: [
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "20px",
                    marginBottom: "20px"
                },
                child: DOMElement.table({data: leftData})
            },
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top"
                },
                child: DOMElement.table({data: rightData})
            }
        ]
    })
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: st
            }
        ]
    });
    returnData.getValue = function(){
        var location_value, result_value, status_value, type_value, start_date_value, reminder_value, assigned_to_value, participant_value;
        location_value = location.value.trim();
        if (location_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_location"),
                func: function(){
                    location.focus();
                }
            });
            return false;
        }
        status_value = status.checked;
        result_value = result.value.trim();
        if (status_value == "txt_success" && result_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_result_value"),
                func: function(){
                    result.focus();
                }
            });
            return false;
        }
        type_value = type.value;
        start_date_value = start_date.getValue();
        reminder_value = reminder.value;
        assigned_to_value = assigned_to.value;
        participant_value = participant.values;
        meetingValue.forEach(function(elt){
            switch (elt.localid) {
                case "type_meeting_start_date":
                    elt.value = start_date_value;
                    break;
                case "type_meeting_reminder":
                    elt.value = reminder_value;
                    break;
                case "type_meeting_created":
                    elt.value = created_value;
                    break;
                case "type_meeting_location":
                    elt.value = location_value;
                    break;
                case "type_meeting_result":
                    elt.value = result_value;
                    break;
                case "type_meeting_status":
                    elt.value = status_value;
                    break;
                case "type_meeting_type":
                    elt.value = type_value;
                    break;
                case "type_meeting_assigned_to":
                    elt.value = assigned_to_value;
                    break;
                case "type_meeting_participant":
                    elt.value = participant_value;
                    break;
                case "type_meeting_user_created":
                    elt.value = user_created_value;
                    break;
                default:
            }
        });
        return meetingValue;
    };
    return returnData;
};

theme.cardAddNoteForm = function(params){
    var buttons = [], content, titles, vIndex, oIndex;
    var board, card, work, note, created, user_created;
    var work_value, note_value, created_value, user_created_value;
    var noteValue = [];
    var index = params.typelists.getIndex(-21);
    var details = params.typelists.items[index].content.details;
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        vIndex = params.values.getIndex(params.objects.items[oIndex].valueid);
        EncodingClass.string.toVariable(params.values.items[vIndex].content).forEach(function(elt){
            var tIndex = params.values.getIndex(elt.valueid);
            switch (elt.localid) {
                case "type_note_work":
                    work_value = params.values.items[tIndex].content;
                    noteValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -1,
                        value: work_value,
                        privtype: "string"
                    });
                    break;
                case "type_note_note":
                    note_value = params.values.items[tIndex].content;
                    noteValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -2,
                        value: note_value,
                        privtype: "note"
                    });
                    break;
                case "type_note_created":
                    created_value = new Date(params.values.items[tIndex].timecontent);
                    noteValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -1,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_note_user_created":
                    created_value = params.values.items[tIndex].content;
                    noteValue.push({
                        localid: elt.localid,
                        valueid: elt.valueid,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    else {
        vIndex = -1;
        details.forEach(function(elt){
            switch (elt.localid) {
                case "type_note_work":
                    work_value = elt.default;
                    noteValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: work_value,
                        privtype: "string"
                    });
                    break;
                case "type_note_note":
                    note_value = elt.default;
                    noteValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -2,
                        value: note_value,
                        privtype: "note"
                    });
                    break;
                case "type_note_created":
                    created_value = new Date();
                    noteValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: created_value,
                        privtype: "date"
                    });
                    break;
                case "type_note_user_created":
                    user_created_value = params.userid;
                    noteValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
            }
        });
    }
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }

    titles = [
        LanguageModule.text("txt_board"),
        LanguageModule.text("txt_card")
    ];

    details.forEach(function(elt){
        titles.push(elt.name);
    });

    var maxWidth = 0;

    for (var i = 0; i < titles.length; i++){
        var tempText = DOMElement.span({text: titles[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }

    board = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: params.cardName
    });

    work = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        value: work_value
    });

    note = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "100%",
            height: "400px",
            verticalAlign: "top"
        },
        props: {
            value: note_value
        }
    });

    created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "400px"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(params.users, user_created_value)
    });

    var leftData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_board")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [board]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_card")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [card]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_work")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [work]
            }
        ]
    ];

    var rightData = [
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [created]
            }
        ],
        [{attrs: {style: {height: 'var(--control-verticle-distance-2)'}}}],
        [
            {
                attrs: {
                    style: {
                        width: maxWidth + "px"
                    }
                },
                text: LanguageModule.text("txt_user_created")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [user_created]
            }
        ]
    ];
    var st = absol._({
        child: [
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "20px",
                    marginBottom: "20px"
                },
                child: DOMElement.table({data: leftData})
            },
            {
                style: {
                    display: "inline-block",
                    verticalAlign: "top"
                },
                child: DOMElement.table({data: rightData})
            }
        ]
    })
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: [
                    st,
                    {
                        child: [note]
                    }
                ]
            }
        ]
    });
    returnData.getValue = function(){
        var work_value, created_value, note_value;
        work_value = work.value.trim();
        if (work_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("txt_no_work_name"),
                func: function(){
                    work.focus();
                }
            });
            return false;
        }
        note_value = note.value.trim();
        if (note_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("txt_no_note_value"),
                func: function(){
                    note.focus();
                }
            });
            return false;
        }
        created_value = created.value;
        noteValue.forEach(function(elt){
            switch (elt.localid) {
                case "type_note_work":
                    elt.value = work_value;
                    break;
                case "type_note_note":
                    elt.value = note_value;
                    break;
                case "type_note_created":
                    elt.value = created_value;
                    break;
                case "type_note_user_created":
                    elt.value = user_created_value;
                    break;
            }
        });
        return noteValue;
    };
    return returnData;
};

theme.cardContactTable = function(contact, contactOfCard, changeFunc){
    var data = [];
    contact.forEach(function(elt){
        var name, phoneNumber, email, icon;
        name = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.firstname + " " + elt.lastname}
        });
        phoneNumber = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.phone}
        });
        email = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.email}
        });
        icon = absol._({
            tag: 'checkbox',
            props: {
                checked: contactOfCard.indexOf(elt.id) != -1
            },
            on: {
                change: function(id){
                    return function(){
                        changeFunc(id, this.checked);
                    }
                }(elt.id)
            }
        });
        data.push([{value: elt.id}, {element: name}, {element: phoneNumber}, {element: email}, {style: {textAlign: "center"}, element: icon}]);
    });
    var header = [
        {hidden: true},
        {value: LanguageModule.text("txt_name")},
        {value: LanguageModule.text("txt_phone")},
        {value: LanguageModule.text("txt_email")},
        {}
    ];
    return pizo.tableView(header, data, false, false);
};

theme.cardCompanyTable = function(contactDB, contactOfCard, changeFunc){
    var data = [];
    contactDB.forEach(function(elt){
        var name, classElt, icon;
        name = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.name}
        });
        classElt = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.class}
        });
        icon = absol._({
            tag: 'checkbox',
            props: {
                checked: contactOfCard.indexOf(elt.id) != -1
            },
            on: {
                change: function(id){
                    return function(){
                        changeFunc(id, this.checked);
                    }
                }(elt.id)
            }
        });
        data.push([{value: elt.id}, {element: name}, {element: classElt}, {style: {textAlign: "center"}, element: icon}]);
    });
    var header = [
        {hidden: true},
        {value: LanguageModule.text("txt_name")},
        {value: LanguageModule.text("txt_class")},
        {}
    ];
    return pizo.tableView(header, data, false, false);
}

theme.cardSelectContactForm = function(contactDB, contactOfCard, task, callbackFunc){
    var contact = contactDB.items.filter(function(elt){
        return contactOfCard.indexOf(elt.id) == -1;
    });
    var selectList = [], contactTable, contactSelect;
    var changeFunc = function(id, checked){
        if (checked){
            selectList.push(id);
            contactSelect.addItem(id);
        }
        else {
            selectList = selectList.filter(function(elt){
                return elt != id;
            });
            contactSelect.saferemoveItem(id);
        }
    };
    var selectContactFunc = function(task){
        var rs = absol._({});
        rs.data = [];
        rs.addItem = function(id){
            var item = contactDB.items[contactDB.getIndex(id)];
            var st = absol._({
                class: ["absol-selectbox-item", "card_contact_selected"],
                style: {
                    display: "inline-block"
                },
                child: [
                    {
                        class: "absol-selectbox-item-text",
                        child: {
                            tag: 'span',
                            child: {text: (task == "contact") ? (item.firstname + " " + item.lastname) : item.name}
                        }
                    },
                    {
                        class: "absol-selectbox-item-close",
                        child: {
                            tag: 'span',
                            class: ["mdi", "mdi-close"]
                        },
                        on: {
                            click: function(id){
                                return function(){
                                    rs.saferemoveItem(id);
                                }
                            }(id)
                        }
                    }
                ]
            });
            st.id = id;
            rs.data.push(st);
            st.addTo(rs);
            contactTable.parentNode.style.maxHeight = "calc(90vh - " + (210 + contactSelect.offsetHeight) + "px)";
        }
        rs.saferemoveItem = function(id){
            selectList = selectList.filter(function(elt){
                return elt != id;
            });
            for (var i = 0; i < rs.data.length; i++){
                if (rs.data[i].id == id) {
                    rs.removeChild(rs.data[i]);
                    rs.data.splice(i, 1);
                    break;
                }
            }
            for (var i = 0; i < contactTable.data.length; i++){
                if (contactTable.data[i][0].value == id){
                    if (task == "contact") contactTable.data[i][4].element.checked = false;
                    else contactTable.data[i][3].element.checked = false;
                }
            }
            contactTable.style.maxHeight = "calc(90vh - " + (210 + contactSelect.offsetHeight) + "px)";
        }
        selectList.forEach(function(elt){
            rs.addItem(elt);
        });
        rs.getValue = function(){
            return rs.data.map(function(elt){
                return parseInt(elt.id, 10);
            });
        };
        return rs;
    }
    var functionClickMore = function(event,me,index,data,row){
        contactTable.dropRow(index);
        selectList.push(row[0].value);
        contactSelect.addItem(row[0].value);
    };
    if (task == 'contact') {
        contactSelect = selectContactFunc('contact');
        contactTable = theme.cardContactTable(contact, contactOfCard, changeFunc);
    }
    else {
        contactSelect = selectContactFunc('company');
        contactTable = theme.cardCompanyTable(contact, contactOfCard, changeFunc);
    }
    var st = absol._({
        child: [
            {
                child: [
                    contactSelect,
                    {
                        style: {
                            overflow: "auto"
                        },
                        child: contactTable
                    }
                ]
            },
            {
                style: {
                    paddingTop: "20px"
                },
                props: {
                    align: "center"
                },
                child: DOMElement.table({
                    data: [[
                        {
                            children: [theme.okButton2({
                                onclick: function(){
                                    callbackFunc(contactSelect.getValue());
                                    ModalElement.close(1);
                                }
                            })]
                        },
                        {attrs: {style: {
                            width: "10px"
                        }}},
                        {
                            children: [theme.cancelButton2({
                                onclick: function(){
                                    ModalElement.close(1);
                                }
                            })]
                        }
                    ]]
                })
            }
        ]
    });
    ModalElement.showWindow({
        index: 1,
        title: LanguageModule.text("txt_select_contact"),
        overflow: 'hidden',
        bodycontent: st
    });
    contactSelect.style.width = contactTable.parentNode.offsetWidth+ "px";
    contactTable.parentNode.style.maxHeight = "calc(90vh - " + (210 + contactSelect.offsetHeight) + "px)";
}

theme.cardContactInfor = function(contactDB, parentElt, task, company_class){
    var content;
    if (task == "contact") content = parentElt.contactData;
    else content = parentElt.companyData;
    var st = absol._({
        class: "card-contact-company-container"
    });
    st.removeItem = function(item){
        for (var i = 0; i < content.length; i++){
            if (content[i] == item.ident){
                content.splice(i, 1);
                break;
            }
        }
        if (task == 'contact') parentElt.contactData = content;
        else parentElt.companyData = content;
        st.removeChild(item);
    }
    content.forEach(function(elt){
        var index = contactDB.getIndex(elt);
        var data;
        if (task == "contact") data = contactDB.items[index].firstname + " " + contactDB.items[index].lastname + " - " + contactDB.items[index].phone + " - " + contactDB.items[index].email;
        else data = contactDB.items[index].name + " - " + company_class.items[company_class.getIndex(contactDB.items[index].company_classid)].name;
        var contactItem = absol._({
            child: [
                {
                    class: "card-contact-company-view-text",
                    child: {text: data}
                },
                {
                    class: ["card-icon-remove-cover", "card-contact-company-view-icon"],
                    child: {
                        tag: "i",
                        style: {
                            verticalAlign: 'middle'
                        },
                        class: ["material-icons", "card-icon-remove"],
                        child:{text: "remove_circle"}
                    },
                    on: {
                        click: function(){
                            st.removeItem(contactItem);
                        }
                    }
                }
            ]
        });
        contactItem.ident = elt;
        contactItem.addTo(st);
    });
    return st;
}

theme.cardContactView = function(content){
    var st, contact_container, company_container;
    st = absol._({
        style: {
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#f5f8fa",
            border: "1px solid #d6d6d6"
        }
    });
    contact_container = absol._({});
    contact_container.addTo(st);
    company_container = absol._({});
    company_container.addTo(st);
    st.contactData = EncodingClass.string.duplicate(content.contactOfCard);
    st.companyData = EncodingClass.string.duplicate(content.companyOfCard);
    contact_container.addChild(theme.cardContactInfor(content.contact, st, 'contact'));
    company_container.addChild(theme.cardContactInfor(content.companies, st, 'company', content.company_class));
    st.addChild(absol._({
        child: [
            {
                tag: "a",
                style: {
                    paddingTop: "10px",
                    color: "#147af6",
                    cursor: "pointer",
                    textDecoration: "underline"
                },
                child: {text: "+ " + LanguageModule.text("txt_add_contact")},
                on: {
                    click: function(){
                        theme.cardSelectContactForm(content.contact, st.contactData, 'contact', function(data){
                            st.contactData = st.contactData.concat(data);
                            contact_container.clearChild();
                            contact_container.addChild(theme.cardContactInfor(content.contact, st, 'contact'));
                        });
                    }
                }
            },
            {
                tag: "a",
                style: {
                    paddingTop: "10px",
                    paddingLeft: "20px",
                    color: "#147af6",
                    cursor: "pointer",
                    textDecoration: "underline"
                },
                child: {text: "+ " + LanguageModule.text("txt_add_company")},
                on: {
                    click: function(){
                        content.companies.items.forEach(function(elt){
                            var index = content.company_class.getIndex(elt.company_classid);
                            elt.class = content.company_class.items[index].name;
                        });
                        theme.cardSelectContactForm(content.companies, st.companyData, 'company', function(data){
                            st.companyData = st.companyData.concat(data);
                            company_container.clearChild();
                            company_container.addChild(theme.cardContactInfor(content.companies, st, 'company', content.company_class));
                        });
                    }
                }
            }
        ]
    }));
    return st;
}

theme.cardActivityIconButton = function(src, text, maxWidth, click){
    var st = absol._({
        style: {
            width: maxWidth + "px"
        },
        class: "card-activities-icon-button-cover",
        child: [
            {
                child: {
                    tag: "img",
                    style: {
                        width: "52px",
                        height: "40px"
                    },
                    props: {
                        src: src,
                        alt: text
                    }
                }
            },
            {
                style: {
                    paddingTop: "10px"
                },
                child: {text: "+ " + text}
            }
        ],
        on: {click: click}
    });
    return st;
};

theme.cardActivityFilterButton = function(filterInfo){
    var st = absol._({});
    filterInfo.forEach(function(elt, index){
        var tempText = DOMElement.span({text: elt.text});
        DOMElement.hiddendiv.appendChild(tempText);
        var maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
        var filterElt = absol._({
            class: "card-activities-filter-button-cover",
            child: [
                {
                    class: ['card-activities-filter-button-text'],
                    child: {text: elt.text},
                    on: {
                        click: function(){
                            absol.$('.choice', st, function(elt){
                                elt.removeClass("choice");
                            });
                            absol.$('.card-activities-filter-button-text', filterElt).addClass('choice');
                            absol.$('.card-activities-filter-button-sidebar', filterElt).addClass('choice');
                            elt.func();
                        },
                        mouseover: function(){
                            absol.$('.card-activities-filter-button-sidebar', filterElt).addStyle('background-color', '#06df95');
                        },
                        mouseout: function(){
                            absol.$('.card-activities-filter-button-sidebar', filterElt).removeStyle('background-color');
                        }
                    }
                },
                {
                    style: {
                        width: (maxWidth + 20) + "px"
                    },
                    class: ["card-activities-filter-button-sidebar"]
                }
            ]
        });
        if (index == 0){
            absol.$('.card-activities-filter-button-text', filterElt).addClass('choice');
            absol.$('.card-activities-filter-button-sidebar', filterElt).addClass('choice');
        }
        filterElt.addTo(st);
    });

    return st;
};

theme.cardEditForm = function(params){
    var name, object, objectContent, oIndex, value, stage, important, createdtime, username, contactList, companyList;
    var buttons, left_block, right_block, name_block, container, filter_block, activities_block, stage_block, checkup_block, task_manager_block, contact_block;
    buttons = [];
    var database = {
        cities: params.cities,
        nations: params.nations,
        users: params.users,
        values: params.valuesList,
        typelists: params.typelists
    };
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }

    name_block = absol._({
        style: {
            padding: "20px",
            backgroundColor: "#f5f8fa",
            border: "1px solid #d6d6d6"
        }
    });

    name = theme.input({
        type: "text",
        style: {width: "100%"},
        value: params.name
    });

    absol._({
        child: name
    }).addTo(name_block);

    var getIndexByLocalId = function(localid){
        for (var i = 0; i < params.object_type.length; i++){
            if (params.object_type[i].localid == localid) return i;
        }
        return -1;
    }

    var makeObjectContent = function(objId){
        var oIndex = params.objectList.getIndex(objId);
        var content = EncodingClass.string.toVariable(params.valuesList.items[params.valuesList.getIndex(params.objectList.items[oIndex].valueid)].content);
        var index, index2, vIndex;
        var data = [], value;
        var count = 0, c = 0;
        for (count; count < content.length; count++){
            index = getIndexByLocalId(content[count].localid);
            if (params.object_type[index].type > 0) continue;
            vIndex = params.valuesList.getIndex(content[count].valueid);
            index2 = getIndexByLocalId(params.object_type[index].type);
            if (params.object_type[index].type == "date" || params.object_type[index].type == "datetime") value = EncodingClass.string.toVariable(params.valuesList.items[vIndex].content);
            else value = params.valuesList.items[vIndex].content;
            if (data.length > 0) data.push(absol._({tag: "br"}));
            data.push(absol._({
                tag: "span",
                child: {text: params.object_type[index].name + ": " + value}
            }))
            if (++c == 5) break;
        }
        if (objectContent) name_block.removeChild(objectContent);
        objectContent = absol._({
            style: {
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#ebebeb",
                border: "1px solid #d6d6d6"
            },
            child: data
        });
        objectContent.addTo(name_block)
    }


    if (params.object_of_board){
        var props = {
            items: params.objectList.items.map(function(elt){
                return {
                    value: elt.id,
                    text: elt.name
                }
            })
        };
        if (params.objectId && params.objectId > 0) props.value = params.objectId;
        object = absol._({
            tag: "selectmenu",
            style: {
                width: "100%",
                backgroundColor: "white"
            },
            props: props,
            on: {
                change: function(){
                    makeObjectContent(this.value);
                }
            }
        });
        absol._({
            style: {
                paddingTop: "20px"
            },
            child: object
        }).addTo(name_block);
        makeObjectContent(object.value);
    }

    stage = absol._({
        tag: "selectmenu",
        style: {
            backgroundColor: "white"
        },
        props: {
            items: params.lists,
            value: params.stage
        }
    });

    stage_block = absol._({
        style: {
            textAlign: "center",
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#f5f8fa",
            border: "1px solid #d6d6d6"
        },
        child: stage
    });

    var buttonInfo = params.activities;

    var maxWidth = 0;

    for (var i = 0; i < buttonInfo.length; i++){
        var tempText = DOMElement.span({text: buttonInfo[i].text});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }
    maxWidth += 20;
    var iconArray = [];
    for (var i = 0; i < buttonInfo.length; i++){
        iconArray.push(theme.cardActivityIconButton(buttonInfo[i].src, buttonInfo[i].text, maxWidth, buttonInfo[i].click));
    }

    task_manager_block = absol._({
        style: {
            textAlign: "center",
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#f5f8fa",
            border: "1px solid #d6d6d6"
        },
        child: iconArray
    });

    important = absol._({
        tag: "selectmenu",
        style: {
            width: "100%",
            backgroundColor: "white"
        },
        props: {
            items: [
                {value: 0, text: "-----------"},
                {value: 1, text: LanguageModule.text("txt_very_important")},
                {value: 2, text: LanguageModule.text("txt_low_important")}
            ],
            value: params.important.value
        }
    });

    createdtime = params.createdtime.value ? contentModule.formatTimeDisplay(params.createdtime.value) : "xx/xx/xx";

    username = params.username.value;

    checkup_block = absol._({
        style: {
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#f5f8fa",
            border: "1px solid #d6d6d6"
        },
        child: DOMElement.table({
            attrs: {style: {
                width: "100%"
            }},
            data: [
                [
                    {
                        text: params.important.title
                    },
                    {attrs: {style: {width: "20px"}}},
                    {
                        children: [important]
                    }
                ],
                [{attrs: {style: {height: "20px"}}}],
                [
                    {
                        text: params.createdtime.title
                    },
                    {attrs: {style: {width: "20px"}}},
                    {
                        text: createdtime
                    }
                ],
                [{attrs: {style: {height: "20px"}}}],
                [
                    {
                        text: params.username.title
                    },
                    {attrs: {style: {width: "20px"}}},
                    {
                        text: username
                    }
                ]
            ]
        })
    });

    contact_block = theme.cardContactView({contact: params.contact, companies: params.companies, company_class: params.company_class, contactOfCard: params.contactOfCard, companyOfCard: params.companyOfCard, company_class: params.company_class});

    left_block = absol._({
        style: {
            width: "30%",
            display: "inline-block",
            verticalAlign: "top"
        },
        child: [
            name_block,
            contact_block,
            stage_block,
            task_manager_block,
            checkup_block
        ]
    });

    right_block = absol._({
        style: {
            display: "inline-block",
            width: "calc(70% - 20px)",
            marginLeft: "20px",
            verticalAlign: "top"
        },
    });

    var filterInfo = [
        {
            text: LanguageModule.text("txt_activity"),
            func: function(){
                alert("Activity")
            }
        },
        {
            text: LanguageModule.text("txt_task"),
            func: function(){
                alert("Task")
            }
        },
        {
            text: LanguageModule.text("txt_call"),
            func: function(){
                alert("Call")
            }
        },
        {
            text: LanguageModule.text("txt_file"),
            func: function(){
                alert("Files")
            }
        },
        {
            text: LanguageModule.text("txt_wait"),
            func: function(){
                alert("Wait")
            }
        },
        {
            text: LanguageModule.text("txt_field"),
            func: function(){
                alert("Fields")
            }
        },
        {
            text: LanguageModule.text("txt_check_list"),
            func: function(){
                alert("Check list")
            }
        },
        {
            text: LanguageModule.text("txt_meeting"),
            func: function(){
                alert("Meeting")
            }
        },
        {
            text: LanguageModule.text("txt_note"),
            func: function(){
                alert("Notes")
            }
        }
    ];

    filter_block = theme.cardActivityFilterButton(filterInfo);

    // var filterArray = filterInfo.map(function(elt){
    //     return theme.activityFilterButton(elt.text, elt.func);
    // });

    // filter_block = absol._({
    //     child: filterArray
    // });

    filter_block.addTo(right_block);

    activities_block = absol._({
        style: {
            marginTop: "20px",
            border: "1px solid #d6d6d6",
            backgroundColor: "#ebebeb",
            height: "100%"
        }
    });

    activities_block.addTo(right_block);

    container = absol._({
        child: [
            left_block,
            right_block
        ]
    });
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: container
            }
        ]
    });
    returnData.getValue = function(){
        var nameValue = name.value.trim();
        if (nameValue == ""){
            ModalElement.alert({message: LanguageModule.text("war_txt_no_name")});
            return false;
        }
        return {
            name: nameValue,
            objectid: object ? object.value : 0,
            stage: stage.value,
            important: important.value,
            contact: contact_block.contactData,
            companies: contact_block.companyData
        };
    }
    return returnData;
};

theme.cardInitForm = function(params){
    var buttonlist = [];
    for (var i = 0; i < params.buttonlist.length; i++){
        buttonlist.push(DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [params.buttonlist[i]]
        }));
    }
    var mBoardTable = absol._({
        tag:'boardtable',
        class:['table-of-list-board']
    });
    params.content.forEach(function(item){
        var listElt = absol._({
            tag:'listboard',
            style:{
                'background-color':'#'+ item.decoration.color
            },
            props:{
                title: item.name,
                ident: item.id
            },
            on:{
                presspluscard: function(){
                    item.addNewCardFunc()
                },
                cardenter: item.cardenter
            }
        });
        item.cards.forEach(function(elt){
            var card = absol._({
                tag:'taskcard',
                props:{
                    title: elt.name,
                    ident: elt.id
                },
                on: {
                    dblclick: elt.editFunc
                }
            });
            listElt.addCard(card);
        });
        mBoardTable.addChild(listElt);
    });
    return absol.buildDom({
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttonlist
            },
            {
                style: {
                    paddingTop: "70px"
                },
                child: mBoardTable
            }
        ]
    });
};

ModuleManagerClass.register({
    name: "Cards_view",
    prerequisites: ["ModalElement"]
});
