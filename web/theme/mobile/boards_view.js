'use strict';

theme.decorationElt = function(content, selection, isPriv){
    var colorRadio, colorPicker, pictureRadio, picturePicker, st, radio_name;
    radio_name = "decoration_radio";
    st = {
        mode: 'RGBA',
        disabled: !(isPriv > 0)
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
            align: "center",
            disabled: !(isPriv > 0)
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
                src: window.domain + content.picture.value
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
            checked: (selection == 'color'),
            disabled: !(isPriv > 0)
        }
    });
    pictureRadio = absol._({
        tag: "radio",
        props: {
            name: radio_name,
            text: content.picture.title,
            value: "picture",
            checked: (selection == 'picture'),
            disabled: !(isPriv > 0)
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

theme.stageDataForm = function(list, formatid, isPriv){
    var tempId = -1;
    var additionalStatus = [], finishStatus = [];
    var additionalTable, finishTable;
    var nameElt = function(value, type){
        var st = theme.input({
            type: "text",
            style: {width: "250px"},
            value: value,
            disabled: formatid ? true : !(isPriv > 0)
        });
        return st;
    };
    var colorElt = function(value){
        var st = {
            mode: 'RGBA',
            disabled: formatid ? true : !(isPriv > 0)
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
            {type: 'dragzone', sort: false, hidden: formatid ? true : !(isPriv > 0)},
            {hidden: true},
            {value: title, sort: false},
            {value: LanguageModule.text("txt_color"), sort: false},
            {value: LanguageModule.text("txt_type"), sort: false},
            {sort: false, functionClickAll: functionClickMore,icon: "", hidden: formatid ? true : !(isPriv > 0)}
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
                    paddingLeft: '10px',
                    display: formatid ? "none" : !(isPriv > 0) ? "none" : ""
                },
                child: {
                    tag: "a",
                    style: {
                        paddingTop: "10px",
                        paddingLeft: "20px",
                        color: "var(--a-color)",
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
                    paddingLeft: '10px',
                    display: formatid ? "none" : !(isPriv > 0) ? "none" : ""
                },
                child: {
                    tag: "a",
                    style: {
                        paddingTop: "10px",
                        paddingLeft: "20px",
                        color: "var(--a-color)",
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

theme.stageDataForm2 = function(list, formatid, isPriv){
    var tempId = -1;
    var initialStatus = [], additionalStatus = [], successStatus = [], unsuccessStatus = [];
    var initialTable, additionalTable, successTable, unsuccessTable;
    var nameElt = function(value, type){
        var st = theme.input({
            type: "text",
            style: {width: "250px"},
            value: value,
            disabled: formatid ? true : !(isPriv > 0)
        });
        return st;
    };
    var colorElt = function(value){
        var st = {
            mode: 'RGBA',
            disabled: formatid ? true : !(isPriv > 0)
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
            {type: 'dragzone', sort: false, hidden: formatid ? true : !(isPriv > 0)},
            {hidden: true},
            {value: title, sort: false},
            {value: LanguageModule.text("txt_color"), sort: false},
            {value: LanguageModule.text("txt_type"), sort: false},
            {sort: false, functionClickAll: functionClickMore,icon: "", hidden: formatid ? true : !(isPriv > 0)}
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
                    paddingLeft: '10px',
                    display: formatid ? "none" : !(isPriv > 0) ? "none" : ""
                },
                child: {
                    tag: "a",
                    style: {
                        paddingTop: "10px",
                        paddingLeft: "20px",
                        color: "var(--a-color)",
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
                    paddingLeft: '10px',
                    display: formatid ? "none" : !(isPriv > 0) ? "none" : ""
                },
                child: {
                    tag: "a",
                    style: {
                        paddingTop: "10px",
                        paddingLeft: "20px",
                        color: "var(--a-color)",
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

theme.boardFieldData = function(content, fieldList, formatid, isPriv){
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
            items: fieldList,
            enableSearch: true,
            disabled: formatid ? true : !(isPriv > 0)
        };
        if (value) st.value = value;
        return absol._({
            tag: "mselectmenu",
            style: {
                width: "100%"
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
        {type: 'dragzone', sort: false, hidden: formatid ? true : !(isPriv > 0)},
        {value: LanguageModule.text("txt_field"), sort: false},
        {sort: false, functionClickAll: functionClickMore,icon: "", style: {width: "40px"}, hidden: formatid ? true : !(isPriv > 0)}
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
                    paddingLeft: '10px',
                    display: formatid ? "none" : !(isPriv > 0) ? "none" : ""
                },
                child: {
                    tag: "a",
                    style: {
                        paddingTop: "10px",
                        paddingLeft: "20px",
                        color: "var(--a-color)",
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

theme.boardSelectMemberForm = function(users, content, owner, callbackFunc){
    var selectList = [], userTable, userSelect;
    var changeFunc = function(id, checked){
        if (checked){
            selectList.push(id);
            userSelect.addItem(id);
        }
        else {
            selectList = selectList.filter(function(elt){
                return elt != id;
            });
            userSelect.saferemoveItem(id);
        }
    };
    var selectMemberFunc = function(){
        var rs = absol._({});
        rs.data = [];
        rs.addItem = function(id){
            var item = contentModule.getUsernameByhomeid2(users, id);
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
                            child: {text: item}
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
            userTable.parentNode.style.maxHeight = "calc(90vh - " + (250 + userSelect.offsetHeight) + "px)";
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
            for (var i = 0; i < userTable.data.length; i++){
                if (userTable.data[i][1].value == id){
                    userTable.data[i][0].element.checked = false;
                }
            }
            userTable.parentNode.style.maxHeight = "calc(90vh - " + (250 + userSelect.offsetHeight) + "px)";
        }
        selectList.forEach(function(elt){
            rs.addItem(elt);
        });
        rs.getValue = function(){
            return rs.data.map(function(elt){
                return {
                    id: -1,
                    userid: parseInt(elt.id, 10),
                    type: 0
                };
            });
        };
        return rs;
    }
    userSelect = selectMemberFunc();
    var generateUserTable = function(){
        var data = [];
        users.items.forEach(function(elt){
            if (!content.some(function(elt2){
                return elt2.userid == elt.homeid
            })){
                var username, fullname, email, comment, icon;
                username = absol._({
                    class: "sortTable-cell-view",
                    child: {text: elt.username}
                });
                fullname = absol._({
                    class: "sortTable-cell-view",
                    child: {text: elt.fullname}
                });
                email = absol._({
                    class: "sortTable-cell-view",
                    child: {text: elt.email}
                });
                comment = absol._({
                    class: "sortTable-cell-view",
                    child: {text: elt.comment}
                });
                icon = absol._({
                    tag: 'checkbox',
                    props: {
                        checked: false
                    },
                    on: {
                        change: function(id){
                            return function(){
                                changeFunc(id, this.checked);
                            }
                        }(elt.homeid)
                    }
                });
                data.push([
                    {style: {textAlign: "center"}, element: icon},
                    {value: elt.homeid},
                    {value: elt.username, element: username},
                    {element: fullname, value: elt.fullname},
                    {element: email, value: elt.email},
                    {element: comment, value: elt.comment}
                ]);
            }
        });
        var header = [
            {},
            {hidden: true},
            {value: LanguageModule.text("txt_username")},
            {value: LanguageModule.text("txt_fullname")},
            {value: LanguageModule.text("txt_email")},
            {value: LanguageModule.text("txt_comment")}
        ];
        return pizo.tableView(header, data, false, false);
    }
    var inputsearchbox = absol.buildDom({
        tag:'searchcrosstextinput',
        style: {
            width: "100%",
            marginBottom: "10px"
        },
        props:{
            placeholder: LanguageModule.text("txt_search")
        }
    });
    userTable = generateUserTable();
    userTable.addInputSearch(inputsearchbox);
    userTable.style.width = "100%";
    var st = absol._({
        child: [
            {
                child: [
                    userSelect,
                    {
                        style: {
                            overflow: "auto"
                        },
                        child: [
                            inputsearchbox,
                            userTable
                        ]
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
                            children: [theme.okButton({
                                onclick: function(){
                                    callbackFunc(userSelect.getValue());
                                    ModalElement.close(1);
                                }
                            })]
                        },
                        {attrs: {style: {
                            width: "10px"
                        }}},
                        {
                            children: [theme.cancelButton({
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
        title: LanguageModule.text("txt_select_member"),
        overflow: 'hidden',
        bodycontent: st
    });
    userSelect.style.width = userTable.parentNode.offsetWidth+ "px";
    userTable.parentNode.style.maxHeight = "calc(90vh - " + (250 + userSelect.offsetHeight) + "px)";
}

theme.boardMemberData = function(content, users, owner, isPriv){
    var data, i, originData, superElt = {}, superIndex = [];
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
        var username = contentModule.getUsernameByhomeid2(users, value);
        var fullname = contentModule.getFullnameByhomeid2(users, value);
        var st = absol._({
            class: "sortTable-cell-view",
            child: {text: username + " - " + fullname}
        });
        st.value = value;
        return st;
    }

    var typeElt = function(value, index){
        var items = [
            {value: 0, text: LanguageModule.text("txt_employee")},
            {value: 1, text: LanguageModule.text("txt_administrator")}
        ];
        if (value == 2 || isPriv == 2) items.push({value: 2, text: LanguageModule.text("txt_super_administrator")});
        var st = absol._({
            tag: "mselectmenu",
            style: {
                width: "100%"
            },
            props: {
                items: items,
                value: value,
                disabled: (isPriv == 0) || (isPriv == 1 && value == 2)
            },
            on: {
                change: function(){
                    content[this.rowIndex].type = this.value;
                    if ((this.oldValue == 2) || ((this.oldValue != 2) && (this.value == 2))){
                        superElt = {};
                        superIndex = [];
                        var data = generateData(content);
                        if (superIndex.length == 1){
                            data[superIndex[0]][2].element.disabled = true;
                            data[superIndex[0]][3] = {style: {textAlign: "center"}, functionClick: function(){}};
                        }
                        tableView.updateTable(tableView.header, data, false, false);
                    }
                    this.oldValue = this.value;
                }
            }
        });
        st.oldValue = value;
        st.rowIndex = index;
        return st;
    }

    var functionClickMore = function(event,me,index,data,row){
        tableView.dropRow(index).then(function(){
            content.splice(index, 1);
            if (row[2].element.value == 2){
                superElt = {};
                superIndex = [];
                var data = generateData(content);
                if (superIndex.length == 1){
                    data[superIndex[0]][2].element.disabled = true;
                    data[superIndex[0]][3] = {style: {textAlign: "center"}, functionClick: function(){}};
                }
                tableView.updateTable(tableView.header, data, false, false);
            }
        });
    }
    var generateData = function(content){
        var data = [], icon, items, type;
        for (i = 0; i < content.length; i++){
            if ((isPriv == 0) || (isPriv == 1 && content[i].type == 2)) icon = {style: {textAlign: "center"}, functionClick: function(){}};
            else icon = {style: {textAlign: "center"}, element: deleteIcon()};
            type = typeElt(content[i].type, i);
            items = [{value: content[i].id}, {element: nameElt(content[i].userid)}, {element: type}, icon];
            if (isPriv == 2){
                if (content[i].type == 2) {
                    superElt[i] = items;
                    superIndex.push(i);
                }
            }
            data.push(items);
        }
        return data;
    }
    data = generateData(content);
    if (superIndex.length == 1){
        data[superIndex[0]][2].element.disabled = true;
        data[superIndex[0]][3] = {style: {textAlign: "center"}, functionClick: function(){}};
    }
    var header = [
        {hidden: true},
        {value: LanguageModule.text("txt_username")},
        {value: LanguageModule.text("txt_type")},
        {sort: false, functionClickAll: functionClickMore,icon: "", style: {width: "40px"}, hidden: !(isPriv > 0)}
    ];
    var tableView = pizo.tableView(header, data, false, true);
    tableView.style.width = "100%";
    DOMElement.hiddendiv.appendChild(tableView);
    DOMElement.hiddendiv.removeChild(tableView);
    var container = absol._({
        style: {
            overflowY: "hidden"
        }
    });
    tableView.addTo(container);
    var addNewField = function(){
        var callbackFunc = function(value){
            if (value.length == 0) return;
            content = content.concat(value);
            superElt = {};
            superIndex = [];
            var data = generateData(value);
            data.forEach(function(elt){
                tableView.insertRow(elt);
            });
        }
        theme.boardSelectMemberForm(users, content, owner, callbackFunc);
    }
    var add_link = absol._({
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
                color: "var(--a-color)",
                cursor: "pointer",
                textDecoration: "underline"
            },
            child: {text: "+ " + LanguageModule.text("txt_add")},
            on: {
                click: function(){
                    originData = tableView.data;
                    addNewField();
                }
            }
        }
    });
    if (isPriv > 0) add_link.addTo(container);

    container.getValue = function(){
        var data = tableView.data;
        var tempData = data.map(function(elt){
            return {
                id: parseInt(elt[0].value, 10),
                userid: parseInt(elt[1].element.value, 10),
                type: parseInt(elt[2].element.value, 10)
            };
        });
        return tempData;
    };
    return container;
};

theme.settingMasterButton = function(params){
    return button071218.showButton({
        sym: DOMElement.i({
            attrs: {
                className: "mdi mdi-cog"
            }
        }),
        typebutton: 0,
        text: LanguageModule.text("txt_link_to_master_board"),
        onclick: params.onclick
    });
};

theme.settingMasterBoard = function(list, value){
    return new Promise(function(rs){
        var props = {
            items: list,
            enableSearch: true,
        };
        if (value) props.value = value;
        var selector = absol._({
            tag: "mselectmenu",
            props: props
        });
        ModalElement.showWindow({
            index: 1,
            title: LanguageModule.text("txt_link_to_master_board"),
            bodycontent: absol._({
                child: [
                    {
                        tag: "span",
                        child: selector
                    },
                    {
                        style: {
                            paddingTop: "20px"
                        },
                        child: [
                            {
                                style: {
                                    display: "inline-block"
                                },
                                child: theme.okButton({
                                    onclick: function(){
                                        rs(parseInt(selector.value));
                                        ModalElement.close(1);
                                    }
                                })
                            },
                            {
                                style: {
                                    paddingLeft: "20px",
                                    display: "inline-block"
                                },
                                child: theme.cancelButton({
                                    onclick: function(){
                                        ModalElement.close(1);
                                    }
                                })
                            }
                        ]
                    }
                ]
            })
        });
    });
};

theme.boardEditForm = function(params){
    var name, color, picture, favorite, available, board_type, list, fields, members, permission;
    var buttons, data, keys;
    var stageData, stageHeader, stage, returnData;
    var stageContainer, fieldsContainer;
    var originalList = params.content.list.value;
    var originalFields = params.content.fields.value;
    var originalBoardType = params.content.board_type.value;
    stageContainer = absol._({});
    fieldsContainer = absol._({});
    var commands = [
        {
            icon:  DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            })
        }
    ];
    var props = {
        actionIcon: DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "arrow_back_ios"
        }),
        title: LanguageModule.text("txt_board"),
        commands: commands
    };
    if (!params.formatid) {
        props.quickmenu = {
            getMenuProps: function(){
                return {
                    items: [
                        {
                            icon: DOMElement.i({
                                attrs: {
                                    className: "mdi mdi-cog"
                                }
                            }),
                            text: LanguageModule.text("txt_link_to_master_board"),
                            cmd: function(){
                                var formatList;
                                formatList = data_module.formats.items.map(function(elt){
                                    return {
                                        value: elt.id,
                                        text: elt.name
                                    };
                                });
                                formatList.unshift({value: -1, text: LanguageModule.text("txt_no_select_master_board")});
                                theme.settingMasterBoard(formatList, params.formatid).then(function rs(value){
                                    params.formatid = value;
                                    if (params.formatid == -1) params.formatid = undefined;
                                    if (params.formatid){
                                        var template = data_module.formats.items[data_module.formats.getIndex(value)].content;
                                        params.content.list.value = template.list;
                                        params.content.fields.value = template.fields.map(function(elt){
                                            return {
                                                id: elt,
                                                name: params.typelists.items[params.typelists.getIndex(elt)].name
                                            }
                                        });
                                        board_type.value = template.board_type;
                                        board_type.disabled = true;
                                    }
                                    else {
                                        params.content.list.value = originalList;
                                        params.content.fields.value = originalFields;
                                        board_type.value = originalBoardType;
                                        if (params.id == 0) board_type.disabled = false;
                                    }
                                    if (board_type.value == 'general') stage = theme.stageDataForm(params.content.list.value, params.formatid, params.isPriv);
                                    else stage = theme.stageDataForm2(params.content.list.value, params.formatid, params.isPriv);
                                    stageContainer.clearChild();
                                    stage.addTo(stageContainer);
                                    fields = theme.boardFieldData(params.content.fields.value, params.fieldList, params.formatid, params.isPriv);
                                    fieldsContainer.clearChild();
                                    fields.addTo(fieldsContainer);
                                });
                            }
                        }
                    ]
                }
            },
            onSelect: function(item){
                item.cmd();
            }
        };
    }
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: props,
        on: {
            action: params.cmdButton.close,
            command: params.cmdButton.save
        }
    });
    keys = Object.keys(params.content);
    data = [];
    name = theme.input({
        type: "text",
        style: {width: "100%"},
        value: params.content.name.value,
        disabled: !(params.isPriv > 0)
    });
    var decoration = theme.decorationElt(params.content.decoration.content, params.content.decoration.value, params.isPriv);
    decoration.align = "center";
    favorite = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': 'var(--switch-fontsize)',
            position: "absolute",
            right: "0px"
        },
        props:{
            checked: params.content.favorite.value == 1,
            disabled: !(params.isPriv > 0)
        }
    });
    permission = absol.buildDom({
        tag: 'mselectmenu',
        style: {
            width: '100%'
        },
        props:{
            items: params.permissionList,
            value: params.content.permission.value,
            disabled: !(params.isPriv > 0)
        }
    });
    available = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': 'var(--switch-fontsize)',
            position: "absolute",
            right: "0px"
        },
        props:{
            checked: params.content.available.value == 1,
            disabled: !(params.isPriv > 0)
        }
    });
    board_type = absol._({
        tag: "mselectmenu",
        style: {
            width: "100%"
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
                        stage = theme.stageDataForm(newData, params.formatid, params.isPriv);
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
                        stage = theme.stageDataForm2(newData, params.formatid, params.isPriv);
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
                        stage = theme.stageDataForm2(newData, params.formatid, params.isPriv);
                        break;
                    default:
                }
                var st = absol.$(".card-edit-board-stage-container", returnData);
                DOMElement.removeAllChildren(st);
                st.appendChild(stage);
            }
        }
    });
    if (board_type.value == 'general') stage = theme.stageDataForm(params.content.list.value, params.formatid, params.isPriv);
    else stage = theme.stageDataForm2(params.content.list.value, params.formatid, params.isPriv);
    stage.addTo(stageContainer);
    fields = theme.boardFieldData(params.content.fields.value, params.fieldList, params.formatid, params.isPriv);
    members = theme.boardMemberData(EncodingClass.string.duplicate(params.content.members.value), params.users, params.owner, params.isPriv);
    fields.addTo(fieldsContainer);
    data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: {text: params.content.name.title}
        },
        name,
        {
            class: "card-mobile-label-form-edit",
            child: {text: params.content.decoration.title}
        },
        decoration,
        {
            class: "card-mobile-label-form-edit",
            style: {
                position: "relative",
                height: "22px"
            },
            child: [
                {
                    style: {
                        display: "inline-block",
                        verticalAlign: "middle"
                    },
                    child: {
                        tag: "span",
                        child: {text: params.content.favorite.title}
                    }
                },
                favorite
            ]
        },
        {
            class: "card-mobile-label-form-edit",
            style: {
                position: "relative",
                height: "22px"
            },
            child: [
                {
                    style: {
                        display: "inline-block",
                        verticalAlign: "middle"
                    },
                    child: {
                        tag: "span",
                        child: {text: params.content.available.title}
                    }
                },
                available
            ]
        },
        {
            class: "card-mobile-label-form-edit",
            child: {text: params.content.permission.title}
        },
        permission,
        {
            class: "card-mobile-label-form-edit",
            child: {text: params.content.board_type.title}
        },
        board_type,
        {
            class: "card-mobile-label-form-edit",
            child: {text: params.content.list.title}
        },
        stageContainer,
        {
            class: "card-mobile-label-form-edit",
            child: {text: params.content.fields.title}
        },
        fieldsContainer,
        {
            class: "card-mobile-label-form-edit",
            child: {text: params.content.members.title}
        },
        members
    ];
    var formBoardGroupsGetRowFunc = function(content){
        var child = [];
        for (var i = 0; i < content.child.length; i++){
            child.push(formBoardGroupsGetRowFunc(content.child[i]));
        }
        inputidBoxes["checked_" + content.id] = absol.buildDom({
            tag: "checkbox",
            props: {
                checked: content.checked
            }
        });
        var row = [
            {
                style: {whiteSpace: "nowrap"},
                value: content.name,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.name
                })
            },
            {
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view-cmd"
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-cover-disabled"
                            },
                            children: [inputidBoxes["checked_" + content.id]]
                        })
                    ]
                })
            }
        ];
        if (child.length > 0) row.child = child;
        return row;
    };
    var dataGroups = [], inputidBoxes = [];
    for (var i = 0; i < params.board_groupsList.length; i++){
        dataGroups.push(formBoardGroupsGetRowFunc(params.board_groupsList[i]));
    }
    var tableGroup = pizo.tableView(
        [
            {value: LanguageModule.text("txt_name"), sort: true},
            {value: ""}
        ],
        dataGroups,
        false,
        false,
        0
    );
    tableGroup.style.width = "100%";
    var groups = DOMElement.div({
        attrs: {
            style: {overflowY: "hidden"}
        },
        children: [tableGroup]
    });
    data.push(
        {
            class: "card-mobile-label-form-edit",
            child: {text: LanguageModule.text("txt_group")}
        },
        groups
    );
    returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });
    absol.$('.card-edit-board-object-type', returnData, function(elt){
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
        var groupAdd = [], groupDel = [];
        for (var i = 0; i < params.board_groupsIdList.length; i++){
            if (inputidBoxes["checked_" + params.board_groupsIdList[i]].checked){
                if (params.board_groupsIdCheckedList.indexOf(params.board_groupsIdList[i]) < 0) groupAdd.push(params.board_groupsIdList[i]);
            }
            else {
                if (params.board_groupsIdCheckedList.indexOf(params.board_groupsIdList[i]) >= 0) groupDel.push(params.board_groupsIdList[i]);
            }
        }
        return {
            name: nameValue,
            decoration: decoration.getValue(),
            favorite: favorite.checked ? 1: 0,
            available: available.checked ? 1 : 0,
            permission: permission.value,
            board_type: board_type.value,
            list: stageValue,
            fields: fields.getValue(),
            formatid: params.formatid,
            members: members.getValue(),
            groupAdd: groupAdd,
            groupDel: groupDel
        };
    }
    return returnData;
};

theme.boardContentDataForm = function(params){
    var data;
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
        var iconButton = [
            {
                text: LanguageModule.text("txt_open"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "launch" }
                },
                cmd: elt.openCardManager
            }
        ];
        iconButton.push({
            text: LanguageModule.text("txt_edit"),
            extendClasses: "bsc-quickmenu",
            icon: {
                tag: "i",
                class: "material-icons",
                child: { text: "mode_edit" }
            },
            cmd: elt.editFunc
        });
        if (elt.isPriv == 2) {
            iconButton.push({
                text: LanguageModule.text("txt_delete"),
                extendClasses: "bsc-quickmenu red",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "delete" }
                },
                cmd: function(){
                    var title = LanguageModule.text("txt_delete_board");
                    var message = LanguageModule.text("war_delete_board");
                    theme.deleteConfirm(title, message).then(function(){
                        elt.deleteBoard().then(function(value){
                            if (value) board.selfRemove();
                        });
                    })
                }
            });
            if (!elt.formatid) iconButton.push({
                text: LanguageModule.text("txt_make_master_board"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: ["mdi", "mdi-tablet-dashboard"],
                },
                cmd: elt.makeMasterBoard
            });
        }
        var board = absol._({
            tag:'representativeboard',
            props:{
                name: elt.name,
                desc: absol.string.randomParagraph(150),
                // có thể thêm một trường nào đó để biết nó nằm đâu trong database, ví dụ
                boardIdent:'board_'+ (index + 1),
                quickmenu: {
                    props: {
                        items: iconButton
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
        child: [mBoardMng]
    });
};

theme.boardInitForm = function(params){
    var groups = absol.buildDom({
        tag: "mselecttreemenu",
        style: {
            verticalAlign: "middle"
        },
        props: {
            items: params.groups_select.items
        },
        on: {
            change: params.groups_select.cmd
        }
    });
    var filterFunc = function(){
        var header = absol.buildDom({
            tag: 'mheaderbar',
            props: {
                actionIcon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "arrow_back_ios"
                }),
                title: LanguageModule.text("txt_filter")
            },
            on: {
                action: function(){
                    params.frameList.removeLast();
                }
            }
        });
        groups.style.display = "block";
        groups.style.width = "100%";
        var filter_container = absol.buildDom({
            tag: 'tabframe',
            child:[
                header,
                DOMElement.div({
                    attrs: {
                        className: "card-mobile-content"
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-mobile-label-form-edit-first"
                            },
                            text: LanguageModule.text("txt_group")
                        }),
                        groups,
                    ]
                })
            ]
        });
        params.frameList.addChild(filter_container);
        filter_container.requestActive();
    };
    var commands = [
        {
            icon:  DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "add"
            }),
            cmd: params.addNew
        },
        {
            icon:  DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "filter_alt"
            }),
            cmd: filterFunc
        }
    ];
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            title: LanguageModule.text("txt_board"),
            commands: commands
        },
        on: {
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    var returnData = absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: [params.board_container]
            })
        ]
    });
    returnData.groupElt = groups;
    return returnData
};

ModuleManagerClass.register({
    name: "Boards_view",
    prerequisites: ["ModalElement"]
});
