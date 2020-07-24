'use strict';

theme.decorationElt = function(content, selection){
    var colorRadio, colorPicker, pictureRadio, picturePicker, st, radio_name;
    radio_name = "decoration_radio";
    st = {
        mode: 'RGBA'
    };
    if (content.color.value) st.value = "#" + content.color.value;
    colorPicker = absol._({
        tag: 'colorpickerbutton',
        style: {
            width: "30px"
        },
        props: st
    });
    picturePicker = absol._({
        class:'cd-image-holder',
        style: {
            backgroundColor: "#ffffff",
            textAlign: "center",
            cursor: "pointer",
            verticalAlign: "middle",
            display: "table-cell",
            border: 'var(--control-border)'
        },
        props: {
            align: "center"
        },
        on: {
            click: function(){
                var st;
                var self = this;
                st = pizo.xmlModalDragImage.createModal(document.body,function(){
                    var src = pizo.xmlModalDragImage.imgUrl.src;
                    var st = absol.$("img", picturePicker);
                    st.src = src;
                    self.value = src;
                });
            }
        },
        child: [{
            tag: 'img',
            class:'',
            style: {
                maxHeight: "110px",
                maxWidth: "110px",
                cursor: "pointer",
                display: "inline-block"
            },
            props: {
                src: content.picture.value
            }
        },
        '.cd-image-holder-icon'
        ]
    });
    picturePicker.value = content.picture.value;
    colorRadio = absol._({
        tag: "radio",
        props: {
            name: radio_name,
            text: content.color.title,
            value: "color",
            checked: (selection == 'color')
        }
    });
    pictureRadio = absol._({
        tag: "radio",
        props: {
            name: radio_name,
            text: content.picture.title,
            value: "picture",
            checked: (selection == 'picture')
        }
    });
    var x = absol._({
        child: DOMElement.table({
            data: [
                [
                    {
                        children: [colorRadio]
                    },
                    {attrs: {style: {width: "10px"}}},
                    {
                        children: [colorPicker]
                    }
                ],
                [{attrs: {style: {height: "20px"}}}],
                [
                    {
                        children: [pictureRadio]
                    },
                    {attrs: {style: {width: "10px"}}},
                    {
                        children: [picturePicker]
                    }
                ]
            ]
        })
    });
    x.getValue = function(){
        var color = colorPicker.value;
        if (typeof(color) == "string") color = color.substr(1);
        else color = color.toHex8();
        return {
            color: color,
            picture: picturePicker.value,
            selection: absol.Radio.getValueByName(radio_name)
        };
    };
    return x;
};

theme.stageDataForm = function(list){
    var tempId = -1;
    var additionalStatus = [], finishStatus = [];
    var additionalTable, finishTable;
    var nameElt = function(value, type){
        var st = theme.input({
            type: "text",
            style: {width: "250px"},
            value: value
        });
        return st;
    };
    var colorElt = function(value){
        var st = {
            mode: 'RGBA'
        };
        if (value) st.value = '#' + value;
        return absol._({
            tag: 'colorpickerbutton',
            style: {
                width: "30px"
            },
            props: st
        });
    };
    var titleArray = [LanguageModule.text("txt_system"), LanguageModule.text("txt_user_defined")];
    var maxWidth = 0;
    for (var i = 0; i < titleArray.length; i++){
        var tempText = DOMElement.span({text: titleArray[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }
    var typeElt = function(value){
        var st = absol._({
            class: "sortTable-cell-view",
            style: {
                width: (maxWidth + 30) + 'px'
            },
            child: {text: (value == 'system') ? LanguageModule.text("txt_system") : LanguageModule.text("txt_user_defined")}
        });
        st.value = value;
        return st;
    };
    var deleteIcon = function(type){
        var st;
        if (type == 'system') st = absol._({
            class: "card-icon-cover",
            child: {
                tag: "i",
                style: {
                    fontSize: "var(--icon-fontsize)"
                },
                class: ["mdi", "mdi-backup-restore"]
            }
        });
        else st = absol._({
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
    }
    list.forEach(function(elt){
        var content = elt.child;
        var tempData = content.map(function(item){
            var name = nameElt(item.name, item.type);
            var color = colorElt(item.color);
            var type = typeElt(item.type);
            var icon = deleteIcon(item.type);
            var functionClick = function(){
                name.value = item.name;
            };
            var iconCell = {style: {textAlign: "center"}, element: icon};
            if (item.type == "system") iconCell.functionClick = functionClick;
            return [{style: {width: "40px"}}, {value: item.id}, {element: name}, {element: color}, {element: type}, iconCell];
        });
        switch (elt.name) {
            case "additional_status":
                additionalStatus = tempData;
                break;
            case "finish_status":
                finishStatus = tempData;
                break;
            default:

        }
    });
    var additionalFunctionClickMore = function(event,me,index,data,row){
        additionalTable.dropRow(index);
    };
    var finishFunctionClickMore = function(event,me,index,data,row){
        finishTable.dropRow(index);
    };
    var generateHeader = function(functionClickMore, title){
        var stageHeader = [
            {type: 'dragzone', sort: false},
            {hidden: true},
            {value: title, sort: false},
            {value: LanguageModule.text("txt_color"), sort: false},
            {value: LanguageModule.text("txt_type"), sort: false},
            {sort: false, functionClickAll: functionClickMore,icon: ""}
        ];
        return stageHeader;
    };
    var stageHeader;
    stageHeader = generateHeader(additionalFunctionClickMore, LanguageModule.text("txt_additional_status"));
    additionalTable = pizo.tableView(stageHeader, additionalStatus, false, true);
    additionalTable.style.width = "100%";

    stageHeader = generateHeader(finishFunctionClickMore, LanguageModule.text("txt_finish_status"));
    finishTable = pizo.tableView(stageHeader, finishStatus, false, true);
    finishTable.style.width = "100%";
    var addNewAdditionalStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ff8251")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        additionalTable.insertRow(data);
    }
    var addNewfinishStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ff8251")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        finishTable.insertRow(data);
    }
    var finish_container = absol._({
        style: {
            overflowY: "hidden",
            marginTop: "20px"
        },
        child: [
            finishTable,
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
                            addNewfinishStatus();
                        }
                    }
                }
            }
        ]
    });
    var additional_container = absol._({
        style: {
            overflowY: "hidden"
        },
        child: [
            additionalTable,
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
                            addNewAdditionalStatus();
                        }
                    }
                }
            }
        ]
    });
    var container = absol._({
        class: "cardsimpletableclass",
        child: [
            additional_container,
            finish_container
        ]
    });
    container.getValue = function(){
        var result = [];
        for (var i = 0; i < list.length; i++){
            var elt = list[i];
            var data;
            switch (elt.name) {
                case "additional_status":
                    data = additionalTable.data;
                    break;
                case "finish_status":
                    data = finishTable.data;
                    break;
                default:
                    data = []
            }
            var content = [];
            for (var j = 0; j < data.length; j++){
                var item = data[j];
                var value = item[2].element.value.trim();
                if (value == ""){
                    ModalElement.alert({
                        message: LanguageModule.text("war_stage_name_is_empty"),
                        func: function(){
                            item[2].element.focus();
                        }
                    });
                    return false;
                }
                var color = item[3].element.value;
                if (typeof(color) == "string") color = color.substr(1);
                else color = color.toHex8();
                content.push({
                    id: item[1].value,
                    name: value,
                    color: color,
                    type: item[4].element.value
                });
            }
            elt.child = content;
            result.push(elt);
        }
        return result;
    };
    return container;
};

theme.stageDataForm2 = function(list){
    var tempId = -1;
    var initialStatus = [], additionalStatus = [], successStatus = [], unsuccessStatus = [];
    var initialTable, additionalTable, successTable, unsuccessTable;
    var nameElt = function(value, type){
        var st = theme.input({
            type: "text",
            style: {width: "250px"},
            value: value
        });
        return st;
    };
    var colorElt = function(value){
        var st = {
            mode: 'RGBA'
        };
        if (value) st.value = '#' + value;
        return absol._({
            tag: 'colorpickerbutton',
            style: {
                width: "30px"
            },
            props: st
        });
    };
    var titleArray = [LanguageModule.text("txt_system"), LanguageModule.text("txt_user_defined")];
    var maxWidth = 0;
    for (var i = 0; i < titleArray.length; i++){
        var tempText = DOMElement.span({text: titleArray[i]});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }
    var typeElt = function(value){
        var st = absol._({
            class: "sortTable-cell-view",
            style: {
                width: (maxWidth + 30) + 'px'
            },
            child: {text: (value == 'system') ? LanguageModule.text("txt_system") : LanguageModule.text("txt_user_defined")}
        });
        st.value = value;
        return st;
    };
    var deleteIcon = function(type){
        var st;
        if (type == 'system') st = absol._({
            class: "card-icon-cover",
            child: {
                tag: "i",
                style: {
                    fontSize: "var(--icon-fontsize)"
                },
                class: ["mdi", "mdi-backup-restore"]
            }
        });
        else st = absol._({
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
    }
    list.forEach(function(elt){
        var content = elt.child;
        var tempData = content.map(function(item){
            var name = nameElt(item.name, item.type);
            var color = colorElt(item.color);
            var type = typeElt(item.type);
            var icon = deleteIcon(item.type);
            var functionClick = function(){
                name.value = item.name;
            };
            var iconCell = {style: {textAlign: "center"}, element: icon};
            if (item.type == "system") iconCell.functionClick = functionClick;
            return [{style: {width: "40px"}}, {value: item.id}, {element: name}, {element: color}, {element: type}, iconCell];
        });
        switch (elt.name) {
            case "initial_status":
                initialStatus = tempData;
                break;
            case "additional_status":
                additionalStatus = tempData;
                break;
            case "success_status":
                successStatus = tempData;
                break;
            case "unsuccess_status":
                unsuccessStatus = tempData;
                break;
            default:

        }
    });
    var initialFunctionClickMore = function(event,me,index,data,row){
        initialTable.dropRow(index);
    };
    var additionalFunctionClickMore = function(event,me,index,data,row){
        additionalTable.dropRow(index);
    };
    var successFunctionClickMore = function(event,me,index,data,row){
        successTable.dropRow(index);
    };
    var unsuccessFunctionClickMore = function(event,me,index,data,row){
        unsuccessTable.dropRow(index);
    };
    var generateHeader = function(functionClickMore, title){
        var stageHeader = [
            {type: 'dragzone', sort: false},
            {hidden: true},
            {value: title, sort: false},
            {value: LanguageModule.text("txt_color"), sort: false},
            {value: LanguageModule.text("txt_type"), sort: false},
            {sort: false, functionClickAll: functionClickMore,icon: ""}
        ];
        return stageHeader;
    };
    var stageHeader;
    stageHeader = generateHeader(initialFunctionClickMore, LanguageModule.text("txt_initial_status"));
    initialTable = pizo.tableView(stageHeader, initialStatus, false, true);
    initialTable.style.width = "100%";
    stageHeader = generateHeader(additionalFunctionClickMore, LanguageModule.text("txt_additional_status"));
    additionalTable = pizo.tableView(stageHeader, additionalStatus, false, true);
    additionalTable.style.width = "100%";
    stageHeader = generateHeader(successFunctionClickMore, LanguageModule.text("txt_success_status"));
    successTable = pizo.tableView(stageHeader, successStatus, false, true);
    successTable.style.width = "100%";

    stageHeader = generateHeader(unsuccessFunctionClickMore, LanguageModule.text("txt_unsuccess_status"));
    unsuccessTable = pizo.tableView(stageHeader, unsuccessStatus, false, true);
    unsuccessTable.style.width = "100%";
    var addNewAdditionalStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ff8251")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        additionalTable.insertRow(data);
    }
    var addNewUnsuccessStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ff8251")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        unsuccessTable.insertRow(data);
    }
    var success_container = absol._({
        style: {
            overflowY: "hidden",
            marginTop: "20px"
        },
        child: successTable
    });
    var unsuccess_container = absol._({
        style: {
            overflowY: "hidden",
            marginTop: "20px"
        },
        child: [
            unsuccessTable,
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
                            addNewUnsuccessStatus();
                        }
                    }
                }
            }
        ]
    });
    var inital_container = absol._({
        style: {
            overflowY: "hidden"
        },
        child: initialTable
    });
    var additional_container = absol._({
        style: {
            overflowY: "hidden",
            marginTop: "20px"
        },
        child: [
            additionalTable,
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
                            addNewAdditionalStatus();
                        }
                    }
                }
            }
        ]
    });
    var container = absol._({
        class: "cardsimpletableclass",
        child: [
            inital_container,
            additional_container,
            success_container,
            unsuccess_container
        ]
    });
    container.getValue = function(){
        var result = [];
        for (var i = 0; i < list.length; i++){
            var elt = list[i];
            var data;
            switch (elt.name) {
                case "initial_status":
                    data = initialTable.data;
                    break;
                case "additional_status":
                    data = additionalTable.data;
                    break;
                case "success_status":
                    data = successTable.data;
                    break;
                case "unsuccess_status":
                    data = unsuccessTable.data;
                    break;
                default:
                    data = []
            }
            var content = [];
            for (var j = 0; j < data.length; j++){
                var item = data[j];
                var value = item[2].element.value.trim();
                if (value == ""){
                    ModalElement.alert({
                        message: LanguageModule.text("war_stage_name_is_empty"),
                        func: function(){
                            item[2].element.focus();
                        }
                    });
                    return false;
                }
                var color = item[3].element.value;
                if (typeof(color) == "string") color = color.substr(1);
                else color = color.toHex8();
                content.push({
                    id: item[1].value,
                    name: value,
                    color: color,
                    type: item[4].element.value
                });
            }
            elt.child = content;
            result.push(elt);
        }
        return result;
    };
    return container;
};

theme.boardCategoryData = function(content){
    var data, i, childrenData, cells;
    data = [];
    for (i = 0; i < content.length; i++){
        var name = absol._({
            class: "sortTable-cell-view",
            child: {text: content[i].data.name}
        });
        name.value = content[i].data.name;
        var selector = absol._({
            tag: "checkbox",
            props: {
                checked: content[i].data.select
            }
        });
        cells = [{value: content[i].data.id}, {element: name}, {style: {textAlign: "center"}, element: selector}];
        if (content[i].child.length > 0){
            childrenData = theme.boardCategoryData(content[i].child);
            cells.child = childrenData;
        }
        data.push(cells);
    }
    return data;
};

theme.boardGetObjectGroupData = function(content){
    var data, i, childrenData, cells;
    data = [];
    for (i = 0; i < content.length; i++){
        cells = {
            id: content[i][0].value,
            name: content[i][1].element.value,
            select: content[i][2].element.checked
        };
        if (content[i].child) childrenData = theme.boardGetObjectGroupData(content[i].child);
        else childrenData = [];
        data.push({
            data: cells,
            child: childrenData
        });
    }
    return data;
};

theme.boardFieldData = function(content, fieldList){
    var data, i;
    var tempId = -1;
    var deleteIcon = function(){
        return absol._({
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
    }
    var nameElt = function(value){
        var st = {
            items: fieldList
        }
        if (value) st.value = value;
        return absol._({
            tag: "selectmenu",
            style: {
                width: "100%",
                backgroundColor: "white"
            },
            props: st
        });
    }
    var functionClickMore = function(event,me,index,data,row){
        tableView.dropRow(index);
    }
    data = [];
    for (i = 0; i < content.length; i++){
        data.push([{}, {element: nameElt(content[i].id)}, {style: {textAlign: "center"}, element: deleteIcon()}]);
    }
    var tableView = pizo.tableView([
        {type: 'dragzone', sort: false},
        {value: LanguageModule.text("txt_field"), sort: false},
        {sort: false, functionClickAll: functionClickMore,icon: "", style: {width: "40px"}}
    ], data, false, true);
    tableView.style.width = "100%";
    var addNewField = function(){
        var data = [{}, {element: nameElt()}, {element: deleteIcon()}];
        tableView.insertRow(data);
    }
    var container = absol._({

        style: {
            overflowY: "hidden"
        },
        child: [
            tableView,
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
                        color: "#147af6",
                        cursor: "pointer",
                        textDecoration: "underline"
                    },
                    child: {text: "+ " + LanguageModule.text("txt_add")},
                    on: {
                        click: function(){
                            addNewField();
                        }
                    }
                }
            }
        ]
    });
    container.getValue = function(){
        var data = tableView.data;
        var tempData = data.map(function(elt){
            return parseInt(elt[1].element.value, 10);
        });
        var rs = tempData.filter(function(elt, index){
            return tempData.indexOf(elt) == index;
        });
        return rs;
    };
    return container;
};

theme.editBoardForm = function(params){
    var name, color, picture, favorite, available, board_type, object_of_board, object_type, list, object_group, fields;
    var buttons, data, keys, maxWidth;
    var stageData, stageHeader, stage, returnData;
    buttons = [];
    for (var i = 0; i < params.buttons.length; i++){
        buttons.push(absol._({
            class: "single-button-header",
            child: params.buttons[i]
        }));
    }
    keys = Object.keys(params.content);
    for (var i = 0; i < keys.length; i++){
        var tempText = DOMElement.span({text: params.content[keys[i]].title});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }
    maxWidth += 20;
    data = [];
    name = theme.input({
        type: "text",
        style: {width: "400px"},
        value: params.content.name.value
    });
    var decoration = theme.decorationElt(params.content.decoration.content, params.content.decoration.value);
    favorite = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': 'var(--switch-fontsize)'
        },
        props:{
            checked: params.content.favorite.value == 1
        }
    });
    available = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': 'var(--switch-fontsize)'
        },
        props:{
            checked: params.content.available.value == 1
        }
    });
    object_of_board = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': 'var(--switch-fontsize)'
        },
        props:{
            checked: params.content.object_of_board.value,
            disabled: params.id > 0
        },
        on: {
            change: function(){
                var displayText;
                if (this.checked) displayText = "";
                else displayText = "none";
                var elt = document.getElementsByClassName("card-edit-board-object-type");
                for (var i = 0; i < elt.length; i++){
                    elt[i].parentNode.style.display = displayText;
                }
            }
        }
    });
    object_type = absol._({
        tag: "selectmenu",
        style: {
            width: "400px"
        },
        props: {
            items: params.objectTypeList,
            value: params.content.object_type.value,
            disabled: params.id > 0
        }
    });
    board_type = absol._({
        tag: "selectmenu",
        style: {
            width: "400px"
        },
        props: {
            items: [
                {value: "general", text: "General"},
                {value: "lead", text: "Lead"},
                {value: "deal", text: "Deal"}
            ],
            value: params.content.board_type.value,
            disabled: params.id > 0
        },
        on: {
            change: function(){
                var data, newData, systemData;
                newData = [];
                // data = stage.getValue();
                // newData = data.filter(function(elt){
                //     return elt.type == 'user_defined'
                // });
                switch (this.value) {
                    case 'general':
                        systemData = [
                            {
                                id: -2000,
                                name: "additional_status",
                                color: "aedd94",
                                type: "group",
                                child: []
                            },
                            {
                                id: -2001,
                                name: "finish_status",
                                color: "aedd94",
                                type: "group",
                                child: [
                                    {
                                        id: -1000,
                                        name: LanguageModule.text("txt_finish"),
                                        color: "dacafb",
                                        type: "system"
                                    }
                                ]
                            }
                        ];
                        newData = systemData.concat(newData);
                        stage = theme.stageDataForm(newData);
                        break;
                    case 'lead':
                        newData = [
                            {
                                id: -2000,
                                name: 'initial_status',
                                color: "aedd94",
                                type: "group",
                                child: [{
                                    id: -1000,
                                    name: LanguageModule.text("txt_new"),
                                    color: "aedd94",
                                    type: "system"
                                }]
                            },
                            {
                                id: -2001,
                                name: "additional_status",
                                color: "aedd94",
                                type: "group",
                                child: newData
                            },
                            {
                                id: -2002,
                                name: "success_status",
                                color: "aedd94",
                                type: "group",
                                child: [
                                    {
                                        id: -1001,
                                        name: LanguageModule.text("txt_good_lead"),
                                        color: "dacafb",
                                        type: "system"
                                    }
                                ]
                            },
                            {
                                id: -2003,
                                name: "unsuccess_status",
                                color: "aedd94",
                                type: "group",
                                child: [
                                    {
                                        id: -1002,
                                        name: LanguageModule.text("txt_junk_lead"),
                                        color: "dacafb",
                                        type: "system"
                                    }
                                ]
                            }
                        ];
                        stage = theme.stageDataForm2(newData);
                        break;
                    case 'deal':
                        newData = [
                            {
                                id: -2000,
                                name: 'initial_status',
                                color: "aedd94",
                                type: "group",
                                child: [{
                                    id: -1000,
                                    name: LanguageModule.text("txt_new"),
                                    color: "aedd94",
                                    type: "system"
                                }]
                            },
                            {
                                id: -2001,
                                name: "additional_status",
                                color: "aedd94",
                                type: "group",
                                child: newData
                            },
                            {
                                id: -2002,
                                name: "success_status",
                                color: "aedd94",
                                type: "group",
                                child: [
                                    {
                                        id: -1001,
                                        name: LanguageModule.text("txt_success"),
                                        color: "dacafb",
                                        type: "system"
                                    }
                                ]
                            },
                            {
                                id: -2003,
                                name: "unsuccess_status",
                                color: "aedd94",
                                type: "group",
                                child: [
                                    {
                                        id: -1002,
                                        name: LanguageModule.text("txt_failed"),
                                        color: "dacafb",
                                        type: "system"
                                    }
                                ]
                            }
                        ];
                        stage = theme.stageDataForm2(newData);
                        break;
                    default:
                }
                var st = absol.$(".card-edit-board-stage-container", returnData);
                DOMElement.removeAllChildren(st);
                st.appendChild(stage);
            }
        }
    });
    if (board_type.value == 'general') stage = theme.stageDataForm(params.content.list.value);
    else stage = theme.stageDataForm2(params.content.list.value);
    object_group = pizo.tableView([
        {hidden: true},
        {value: LanguageModule.text("txt_object_group"), sort: false},
        {sort: false}
    ], theme.boardCategoryData(params.content.object_group.value), false, false, 0);
    object_group.style.width = "100%";
    fields = theme.boardFieldData(params.content.fields.value, params.fieldList);
    data = [
        [
            {
                text: params.content.name.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                children: [name]
            }
        ],
        [{attrs: {style: {height: "20px"}}}],
        [
            {
                text: params.content.decoration.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                children: [decoration]
            }
        ],
        [{attrs: {style: {height: "20px"}}}],
        [
            {
                text: params.content.favorite.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                children: [favorite]
            }
        ],
        [{attrs: {style: {height: "20px"}}}],
        [
            {
                text: params.content.available.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                children: [available]
            }
        ],
        [{attrs: {style: {height: "20px", display: "none"}}}],
        [
            {
                attrs: {style: {display: "none"}},
                text: params.content.object_of_board.title
            },
            {attrs: {style: {width: "10px", display: "none"}}},
            {
                attrs: {style: {display: "none"}},
                children: [object_of_board]
            }
        ],
        [{attrs: {
            className: "card-edit-board-object-type",
            style: {
                height: "20px"
            }
        }}],
        [
            {
                attrs: {
                    className: "card-edit-board-object-type"
                },
                text: params.content.object_type.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                children: [object_type]
            }
        ],
        [{attrs: {style: {height: "20px"}}}],
        [
            {
                text: params.content.board_type.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                children: [board_type]
            }
        ],
        [{attrs: {style: {height: "20px"}}}],
        [
            {
                attrs: {
                    style: {
                        verticalAlign: "top"
                    }
                },
                text: params.content.list.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                attrs: {
                    className: "card-edit-board-stage-container"
                },
                children: [stage]
            }
        ],
        [{attrs: {style: {height: "20px"}}}],
        [
            {
                attrs: {
                    style: {
                        verticalAlign: "top"
                    }
                },
                text: params.content.fields.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                children: [fields]
            }
        ],
        [{attrs: {
            className: "card-edit-board-object-type",
            style: {
                height: "20px"
            }
        }}],
        [
            {
                attrs: {
                    className: "card-edit-board-object-type",
                    style: {
                        verticalAlign: "top"
                    }
                },
                text: params.content.object_group.title
            },
            {attrs: {style: {width: "10px"}}},
            {
                attrs: {
                    className: "cardsimpletableclass",
                    style: {
                        overflowY: "hidden"
                    }
                },
                children: [object_group]
            }
        ]
    ];
    returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            {
                class: ["absol-single-page-header", "button-panel-header"],
                child: buttons
            },
            {
                child: DOMElement.table({
                    data: data
                })
            }
        ]
    });
    absol.$('.card-edit-board-object-type', returnData, function(elt){
        // elt.parentNode.style.display = params.content.object_of_board.value ? "" : "none";
        elt.parentNode.style.display = "none";
    });
    returnData.getValue = function(){
        var nameValue = name.value.trim();
        if (nameValue == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_txt_no_name"),
                func: function(){
                    name.focus();
                }
            });
            return false;
        }
        var stageValue = stage.getValue();
        if (!stageValue) return false;
        if (stageValue.length == 0){
            ModalElement.alert({message: LanguageModule.text("war_txt_no_list_of_board")});
            return false;
        }
        return {
            name: nameValue,
            decoration: decoration.getValue(),
            favorite: favorite.checked ? 1: 0,
            available: available.checked ? 1 : 0,
            object_of_board: object_of_board.checked,
            object_type: object_type.value,
            board_type: board_type.value,
            list: stageValue,
            object_group: theme.boardGetObjectGroupData(object_group.data),
            fields: fields.getValue()
        };
    }
    return returnData;
};

theme.boardInitForm = function(params){
    var buttonlist, data;
    buttonlist = [];
    for (var i = 0; i < params.buttonlist.length; i++){
        buttonlist.push(DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [params.buttonlist[i]]
        }));
    }
    var mBoardMng = absol._({
        tag:'boardmanager',
        props:{
            title:'BOARD LIST',
            hasPlusBoard: true// có nút cộng để thêm
        },
        on:{
            change:function(event){
                console.log(event,this.getAllBoards().map(board=> board.boardIdent));// lấy ra xem thứ tự mới đổi thế nào
                //ngoài ra có thể tham khảo 2 trường from và to trong event để biết vị trí nào thay đổi
            },
            pressplusboard:function(){
                var board = params.addNew();
                // mBoardMng.addBoard(absol._({
                //     tag:'representativeboard',
                //     props:{
                //         name: board.name,
                //         desc: absol.string.randomParagraph(150),
                //         // có thể thêm một trường nào đó để biết nó nằm đâu trong database, ví dụ
                //         boardIdent:'board_'+ (this.getAllBoards().length + 1)
                //     },
                //     on: board.on
                // }));
            }
        }
    });
    params.content.forEach(function(elt, index){
        var board = absol._({
            tag:'representativeboard',
            props:{
                name: elt.name,
                desc: absol.string.randomParagraph(150),
                // có thể thêm một trường nào đó để biết nó nằm đâu trong database, ví dụ
                boardIdent:'board_'+ (index + 1),
                quickmenu: {
                    props: {
                        items: [
                            {
                                text: LanguageModule.text("txt_edit"),
                                extendClasses: "bsc-quickmenu",
                                icon: {
                                    tag: "i",
                                    class: "material-icons",
                                    child: { text: "mode_edit" }
                                },
                                cmd: elt.editFunc
                            },
                            {
                                text: LanguageModule.text("txt_delete"),
                                extendClasses: "bsc-quickmenu red",
                                icon: {
                                    tag: "i",
                                    class: "material-icons",
                                    child: { text: "delete" }
                                },
                                cmd: function(){
                                    alert("TODO: delete");
                                }
                            }
                        ]
                    },
                    onSelect: function(item){
                        if (typeof item.cmd =='function')
                            item.cmd();
                    }
                }
            },
            on: {
                dblclick: elt.openCardManager
            }
        });
        mBoardMng.addBoard(board);
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
                child: mBoardMng
            }
        ]
    });
};

ModuleManagerClass.register({
    name: "Boards_view",
    prerequisites: ["ModalElement"]
});
