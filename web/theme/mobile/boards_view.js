'use strict';

theme.boardEditStage = function(row, frameList){
    var name, color;
    name = absol._({
        tag: "input",
        class: "cardsimpleInput",
        style: {
            width: "calc(100% - 10px)",
            height: "30px"
        },
        props: {
            type: "text",
            value: row[2].element.value.trim(),
        },
        on: {change: function(){
            row[2].element.value = this.value.trim();
        }}
    });
    color = absol._({
        tag: 'colorpickerbutton',
        style: {
            width: "30px"
        },
        props: {
            mode: "RGBA",
            value: row[3].element.value
        },
        on: {change: function(){
            row[3].element.value = this.value;
        }}
    });
    var data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: {text: LanguageModule.text("txt_name")}
        },
        name,
        {
            class: "card-mobile-label-form-edit",
            child: {text: LanguageModule.text("txt_color")}
        },
        color
    ];
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_edit_stage")
        },
        on: {
            action: function(){
                frameList.removeLast();
            }
        }
    });
    var tabFrame = absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            absol._({
                class: "card-mobile-content",
                child: data
            })
        ]
    });
    frameList.addChild(tabFrame);
    tabFrame.requestActive();
};

theme.decorationElt = function(content, selection, isPriv){
    var colorRadio, colorPicker, pictureRadio, picturePicker, st, radio_name;
    radio_name = "decoration_radio";
    st = {
        mode: 'RGBA',
        disabled: !isPriv
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
            disabled: !isPriv
        },
        on: {
            click: function(){
                if (!isPriv) return;
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
            disabled: !isPriv
        }
    });
    pictureRadio = absol._({
        tag: "radio",
        props: {
            name: radio_name,
            text: content.picture.title,
            value: "picture",
            checked: (selection == 'picture'),
            disabled: !isPriv
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

theme.boardSwipeSetup = function(table, frameList){
    var deleteFunc = function(e,me,index,data,row,parent){
        if (data[4].element.value == 'system') {
            ModalElement.alert({
                message: LanguageModule.text("war_can_not_delete_this_stage"),
                func: function(){
                    table.slip.animateToZeroHidden();
                }
            });
            return;
        }
        table.exactlyDeleteRow(index);
    };
    table.setUpSwipe(
        undefined,
        [
            // {
            //     icon: "edit",
            //     iconStyle: {color: "white"},
            //     text: LanguageModule.text("txt_edit"),
            //     background: "grey",
            //     event: function(e,me,index,data,row,parent){
            //         theme.boardEditStage(data, frameList);
            //         table.slip.animateToZeroHidden();
            //     }
            // },
            {
                icon: "close",
                iconStyle: {color: "white"},
                text:LanguageModule.text("txt_delete"),
                background: "red",
                event: deleteFunc
            }
        ]
    );
    table.swipeCompleteLeft = deleteFunc;
};

theme.stageDataForm = function(list, formatid, isPriv, frameList){
    var tempId = -1;
    var additionalStatus = [], finishStatus = [];
    var additionalTable, finishTable;
    var nameElt = function(value, type){
        var st  = absol._({
            tag: "input",
            class: "cardsimpleInput",
            style: {
                width: "calc(100% - 10px)",
                height: "30px"
            },
            props: {
                type: "text",
                value: value,
                disabled: formatid ? true : !isPriv
            }
        });
        return st;
    };
    var colorElt = function(value){
        var st = {
            mode: 'RGBA',
            disabled: formatid ? true : !isPriv
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
            {type: 'dragzone', hidden: true},
            // {type: 'dragzone', hidden: formatid ? true : !isPriv},
            {hidden: true},
            {value: title},
            {value: LanguageModule.text("txt_color")},
            {value: LanguageModule.text("txt_type"), hidden: true},
            // {functionClickAll: functionClickMore,icon: "", hidden: formatid ? true : !isPriv}
            {functionClickAll: functionClickMore, icon: "", hidden: true}
        ];
        return stageHeader;
    };
    var stageHeader;
    stageHeader = generateHeader(additionalFunctionClickMore, LanguageModule.text("txt_additional_status"));
    additionalTable = pizo.tableView(stageHeader, additionalStatus, false, true);
    additionalTable.addClass("stageTable");
    additionalTable.headerTable.style.display = "none";
    additionalTable.style.width = "100%";

    if (!formatid && isPriv > 0){
        theme.boardSwipeSetup(additionalTable, frameList, isPriv);
    }


    stageHeader = generateHeader(finishFunctionClickMore, LanguageModule.text("txt_finish_status"));
    finishTable = pizo.tableView(stageHeader, finishStatus, false, true);
    finishTable.addClass("stageTable");
    finishTable.headerTable.style.display = "none";
    finishTable.style.width = "100%";

    if (!formatid && isPriv > 0){
        theme.boardSwipeSetup(finishTable, frameList);
    }


    var addNewAdditionalStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ebebeb")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        additionalTable.insertRow(data);
    }
    var addNewfinishStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ebebeb")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        finishTable.insertRow(data);
    }
    var finish_container = absol._({
        child: [
            {
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: LanguageModule.text("txt_finish_status")}
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: formatid ? "none" : !isPriv ? "none" : ""
                            },
                            child: {
                                tag: "a",
                                style: {
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
                    }
                ]
            },
            finishTable
        ]
    });
    var additional_container = absol._({
        child: [
            {
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: LanguageModule.text("txt_additional_status")}
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: formatid ? "none" : !isPriv ? "none" : ""
                            },
                            child: {
                                tag: "a",
                                style: {
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
                    }
                ]
            },
            additionalTable
        ]
    });
    var container = absol._({
        class: "cardsimpletableclass",
        style: {
            paddingLeft: "20px"
        },
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

theme.stageDataForm2 = function(list, formatid, isPriv, frameList){
    var tempId = -1;
    var initialStatus = [], additionalStatus = [], successStatus = [], unsuccessStatus = [];
    var initialTable, additionalTable, successTable, unsuccessTable;
    var nameElt = function(value, type){
        var st  = absol._({
            tag: "input",
            class: "cardsimpleInput",
            style: {
                width: "calc(100% - 10px)",
                height: "30px"
            },
            props: {
                type: "text",
                value: value,
                disabled: formatid ? true : !isPriv
            }
        });
        return st;
    };
    var colorElt = function(value){
        var st = {
            mode: 'RGBA',
            disabled: formatid ? true : !isPriv
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
            // {type: 'dragzone', sort: false, hidden: formatid ? true : !isPriv},
            {type: 'dragzone', sort: false, hidden: true},
            {hidden: true},
            {value: title},
            {value: LanguageModule.text("txt_color")},
            {value: LanguageModule.text("txt_type"), hidden: true},
            {sort: false, functionClickAll: functionClickMore,icon: "", hidden: true}
            // {sort: false, functionClickAll: functionClickMore,icon: "", hidden: formatid ? true : !isPriv}
        ];
        return stageHeader;
    };
    var stageHeader;
    stageHeader = generateHeader(initialFunctionClickMore, LanguageModule.text("txt_initial_status"));
    initialTable = pizo.tableView(stageHeader, initialStatus, false, true);
    initialTable.style.width = "100%";
    initialTable.addClass("stageTable");
    initialTable.headerTable.style.display = "none";
    stageHeader = generateHeader(additionalFunctionClickMore, LanguageModule.text("txt_additional_status"));
    additionalTable = pizo.tableView(stageHeader, additionalStatus, false, true);
    additionalTable.style.width = "100%";
    additionalTable.addClass("stageTable");
    additionalTable.headerTable.style.display = "none";
    stageHeader = generateHeader(successFunctionClickMore, LanguageModule.text("txt_success_status"));
    successTable = pizo.tableView(stageHeader, successStatus, false, true);
    successTable.style.width = "100%";
    successTable.addClass("stageTable");
    successTable.headerTable.style.display = "none";
    stageHeader = generateHeader(unsuccessFunctionClickMore, LanguageModule.text("txt_unsuccess_status"));
    unsuccessTable = pizo.tableView(stageHeader, unsuccessStatus, false, true);
    unsuccessTable.style.width = "100%";
    unsuccessTable.addClass("stageTable");
    unsuccessTable.headerTable.style.display = "none";
    if (!formatid && isPriv > 0){
        theme.boardSwipeSetup(unsuccessTable, frameList);
        theme.boardSwipeSetup(additionalTable, frameList);
        theme.boardSwipeSetup(initialTable, frameList);
        theme.boardSwipeSetup(successTable, frameList);
    }
    var addNewAdditionalStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ebebeb")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        additionalTable.insertRow(data);
    }
    var addNewUnsuccessStatus = function(){
        var data = [{}, {value: tempId--}, {element: nameElt("", "user_defined")}, {element: colorElt("ebebeb")}, {element: typeElt("user_defined")}, {element: deleteIcon()}];
        unsuccessTable.insertRow(data);
    }
    var success_container = absol._({
        child: [
            {
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: LanguageModule.text("txt_success_status")}
                        }
                    }
                ]
            },
            successTable
        ]
    });
    var unsuccess_container = absol._({
        child: [
            {
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: LanguageModule.text("txt_unsuccess_status")}
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: formatid ? "none" : !isPriv ? "none" : ""
                            },
                            child: {
                                tag: "a",
                                style: {
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
                    }
                ]
            },
            unsuccessTable
        ]
    });
    var inital_container = absol._({
        child: [
            {
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: LanguageModule.text("txt_initial_status")}
                        }
                    }
                ]
            },
            initialTable
        ]
    });
    var additional_container = absol._({
        child: [
            {
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: LanguageModule.text("txt_additional_status")}
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: formatid ? "none" : !isPriv ? "none" : ""
                            },
                            child: {
                                tag: "a",
                                style: {
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
                    }
                ]
            },
            additionalTable
        ]
    });
    var container = absol._({
        class: "cardsimpletableclass",
        style: {
            paddingLeft: "20px"
        },
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

theme.boardFieldData = function(content, fieldList, formatid, isPriv, title, frameList){
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
            disabled: formatid ? true : !isPriv
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
        // {type: 'dragzone', sort: false, hidden: formatid ? true : !isPriv},
        {type: 'dragzone', hidden: true},
        {value: LanguageModule.text("txt_field"), sort: false},
        {sort: false, functionClickAll: functionClickMore,icon: "", style: {width: "40px"}, hidden: true}
        // {sort: false, functionClickAll: functionClickMore,icon: "", style: {width: "40px"}, hidden: formatid ? true : !isPriv}
    ], data, false, true);
    tableView.style.width = "100%";
    tableView.addClass("stageTable");
    tableView.headerTable.style.display = "none";
    if (!formatid && isPriv > 0){
        tableView.setUpSwipe(
            undefined,
            [
                // {
                //     icon: "edit",
                //     iconStyle: {color: "white"},
                //     text: LanguageModule.text("txt_edit"),
                //     background: "grey",
                //     event: function(e,me,index,data,row,parent){
                //         theme.boardEditStage(data, frameList);
                //         tableView.slip.animateToZeroHidden();
                //     }
                // },
                {
                    icon: "close",
                    iconStyle: {color: "white"},
                    text:LanguageModule.text("txt_delete"),
                    background: "red",
                    event: function(e,me,index,data,row,parent){
                        tableView.exactlyDeleteRow(index);
                    }
                }
            ]
        );
        tableView.swipeCompleteLeft = function(e,me,index,data,row,parent){
            tableView.exactlyDeleteRow(index);
        }
    }
    var addNewField = function(){
        var data = [{}, {element: nameElt()}, {element: deleteIcon()}];
        tableView.insertRow(data);
    }
    var container = absol._({
        child: [
            {
                child: [
                    {
                        class: "card-mobile-label-form-edit",
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: title}
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: formatid ? "none" : !isPriv ? "none" : ""
                            },
                            child: {
                                tag: "a",
                                style: {
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
                    }
                ]
            },
            tableView
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

theme.boardSelectMemberForm = function(content, owner, callbackFunc, addValue, frameList){
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
            var idx = data_module.users.getByhomeid(id);
            var st = absol._({
                style: {
                    display: "inline-block",
                    position: "relative",
                    width: "4em",
                    height: "5em",
                    marginRight: "10px"
                },
                child: [
                    {
                        class: "am-tiny-profile-block-avatar",
                        style: {
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            left: 0,
                            display: "block",
                            backgroundImage: "url(" + window.domain + data_module.users.items[idx].avatarSrc + ")"
                        }
                    },
                    {
                        style: {
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            height: "1em",
                            textAlign: "center"
                        },
                        child: {
                            tag: "span",
                            child: {text: data_module.users.items[idx].username}
                        }
                    },
                    {
                        style: {
                            position: 'absolute',
                            width: "1.5em",
                            height: "1.5em",
                            top: "-0.3em",
                            right: "-0.3em",
                            borderRadius: "0.75em",
                            backgroundColor: "#3376cd",
                            textAlign: "center"
                        },
                        child: {
                            tag: "i",
                            style: {
                                fontSize: "1em",
                                color: "white",
                                lineHeight: "1.5em"
                            },
                            class: "material-icons",
                            child: {text: "close"}
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
            userTable.parentNode.style.height = "calc(100% - 90px)";
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
                if (userTable.data[i][2].value == id){
                    userTable.data[i][1].element.checked = false;
                }
            }
            if (rs.data.length == 0) userTable.parentNode.style.height = "calc(100% - 20px)";
        }
        selectList.forEach(function(elt){
            rs.addItem(elt);
        });
        rs.getValue = function(){
            return rs.data.map(function(elt){
                return {
                    id: -1,
                    userid: parseInt(elt.id, 10),
                    type: addValue
                };
            });
        };
        return rs;
    }
    userSelect = selectMemberFunc();
    userSelect.style.width = "max-content";
    var generateUserTable = function(){
        var data = [];
        data_module.users.items.forEach(function(elt){
            if (!content.some(function(elt2){
                return elt2.userid == elt.homeid
            })){
                var icon = absol._({
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
                var x = absol._({
                    class: "sortTable-cell-view",
                    child: [
                        {
                            class: "card-table-list-title",
                            child: {
                                tag: "span",
                                child: {text: elt.username + " - " + elt.fullname}
                            }
                        },
                        {
                            class: "card-table-list-extra-data",
                            child: {
                                tag: "span",
                                child: {text: elt.email}
                            }
                        },
                        {
                            class: "card-table-list-extra-data",
                            child: {
                                tag: "span",
                                child: {text: elt.comment}
                            }
                        }
                    ]
                });
                var st = elt.username + " - " + elt.fullname + " " + elt.email + " " + elt.comment;
                data.push([
                    {element: x, value: st},
                    {element: icon},
                    {value: elt.homeid}
                ]);
            }
        });
        var header = [
            {},
            {},
            {hidden: true}
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
    userTable.style.height = "100%";
    userTable.headerTable.style.display = "none";
    var header = absol.buildDom({
        tag: 'headerbarwithsearch',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_select_member"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "search"
                    }),
                    cmd: function(){
                        header.searchMode(true);
                    }
                }
            ]
        },
        data:{
            searchInput: inputsearchbox
        },
        on: {
            action: function(){
                callbackFunc(userSelect.getValue());
                frameList.removeLast();
            },
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    var tabFrame = absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            absol._({
                style: {
                    overflowY: "unset",
                    padding: "unset"
                },
                class: "card-mobile-content",
                child: [
                    {
                        style: {
                            padding: "20px 20px 0 20px",
                            overflowX: "auto",
                            marginRight: "20px"
                        },
                        child: userSelect
                    },
                    {
                        style: {
                            overflowY: "auto",
                            height: "calc(100% - 20px)",
                            paddingLeft: "20px"
                        },
                        child: userTable
                    }
                ]
            })
        ]
    });
    frameList.addChild(tabFrame);
    tabFrame.requestActive();
};

theme.boardMemberData = function(content, owner, isPriv, privItems, frameList, title){
    var data, i, originData, superElt = {}, superIndex = [], items;
    var tempId = -1;
    var addValue;
    var is_system;
    var dict = {};
    privItems.forEach(function(elt, index){
        elt.index = index;
    });
    if (isPriv){
        if (isPriv.indexOf(0) == -1){
            isPriv.forEach(function(elt){
                dict[elt] = 1;
            });
            privItems.forEach(function(elt, index){
                if (dict[elt.value]) {
                    addValue = elt.value;
                    dict[elt.value] = elt;
                }
                if (elt.is_system == 1) is_system = elt.value;
            });
        }
        else {
            privItems.forEach(function(elt){
                addValue = elt.value;
                dict[elt.value] = elt;
                if (elt.is_system == 1) is_system = elt.value;
            });
        }
    }
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
        var username = contentModule.getUsernameByhomeid2(data_module.users, value);
        var fullname = contentModule.getFullnameByhomeid2(data_module.users, value);
        var st = absol._({
            child: {
                tag: "span",
                child: {text: username + " - " + fullname}
            }
        });
        st.value = value;
        return st;
    }

    var typeElt = function(value, index){
        var privDict = EncodingClass.string.duplicate(dict);
        if (!privDict[value]){
            for (var i = 0; i < privItems.length; i++){
                if (privItems[i].value == value){
                    privDict[value] = privItems[i];
                    break;
                }
            }
        }
        var items = [];
        var keys = Object.keys(privDict);
        keys.forEach(function(elt){
            if (privDict[elt] == 1) return;
            items.push(privDict[elt]);
        });
        items.sort(function(a, b){
            if (a.index > b.index) return 1;
            if (a.index < b.index) return -1;
            return 0;
        });
        var st = absol._({
            tag: "mselectmenu",
            style: {
                width: "100%"
            },
            props: {
                items: items,
                value: value,
                disabled: dict[value] === undefined
            },
            on: {
                change: function(){
                    content[this.rowIndex].type = this.value;
                    var t = this;
                    while (t.tagName != "TD") {
                        t = t.parentNode;
                    }
                    t.click();
                    if ((this.oldValue == is_system) || ((this.oldValue != is_system) && (this.value == is_system))){
                        superElt = {};
                        superIndex = [];
                        var data = generateData(content);
                        if (superIndex.length == 1){
                            data[superIndex[0]][1].element.typeElt.disabled = true;
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
    content.forEach(function(elt){
        var uIndex = data_module.users.getByhomeid(elt.userid);
        if (uIndex == -1){
            elt.userName = "";
        }
        else {
            var fullname = data_module.users.items[uIndex].fullname;
            var username = data_module.users.items[uIndex].username;
            elt.userName = absol.string.nonAccentVietnamese(username + " - " + fullname).toLowerCase().trim();
        }
    });
    content.sort(function(a, b){
        if (a.userName > b.userName) return 1;
        if (a.userName < b.userName) return -1;
        return 0;
    });
    var generateData = function(content){
        var data = [], icon, items, type, name;
        for (i = 0; i < content.length; i++){
            type = typeElt(content[i].type, i);
            name = nameElt(content[i].userid);
            var x = absol._({
                class: "sortTable-cell-view",
                child: [
                    name,
                    {
                        child: type
                    }
                ]
            });
            if (i == content.length - 1) x.style.border = "unset";
            x.typeElt = type;
            x.nameElt = name;
            items = [{value: content[i].id}, {element: x}];
            if (content[i].type == is_system) {
                superElt[i] = items;
                superIndex.push(i);
            }
            data.push(items);
        }
        return data;
    }
    data = generateData(content);
    if (superIndex.length == 1){
        data[superIndex[0]][1].element.typeElt.disabled = true;
    }
    var header = [
        {hidden: true},
        {}
    ];
    var tableView = pizo.tableView(header, data, false, true);
    tableView.style.width = "100%";
    tableView.style.paddingLeft = "20px";
    tableView.addClass("stageTable");
    DOMElement.hiddendiv.appendChild(tableView);
    DOMElement.hiddendiv.removeChild(tableView);
    var deleteFunc = function(e,me,index,data,row,parent){
        // if ((isPriv == 0) || (isPriv == 1 && data[1].element.typeElt.value == 2)){
        if (isPriv.indexOf(data[1].element.typeElt.value) == -1){
            ModalElement.alert({
                message: LanguageModule.text("war_can_not_delete_this_member"),
                func: function(){
                    tableView.slip.animateToZeroHidden();
                }
            });
            return;
        }
        if (data[1].element.typeElt.value == is_system && superIndex.length == 1){
            ModalElement.alert({
                message: LanguageModule.text("war_can_not_delete_this_member"),
                func: function(){
                    tableView.slip.animateToZeroHidden();
                }
            });
            return;
        }
        memberChange({type: "delete", content: [content[index]]});
        if (data[1].element.typeElt.value == is_system) superIndex = superIndex.filter(function(elt){ return elt != index; });
        content.splice(index, 1);
        tableView.exactlyDeleteRow(index);
        if (superIndex.length == 1){
            tableView.data[superIndex[0]][1].element.typeElt.disabled = true;
        }
        for (var i = index; i < tableView.data.length; i++){
            tableView.data[i][1].element.typeElt.rowIndex--;
        }
        tableView.data[tableView.data.length - 1][1].element.style.border = "unset";
    };
    tableView.setUpSwipe(
        undefined,
        [
            {
                icon: "close",
                iconStyle: {color: "white"},
                text:LanguageModule.text("txt_delete"),
                background: "red",
                event: deleteFunc
            }
        ]
    );
    tableView.swipeCompleteLeft = deleteFunc;
    var addNewField = function(){
        var callbackFunc = function(value){
            if (value.length == 0) return;
            memberChange({type: "add", content: value});
            value.forEach(function(elt){
                var uIndex = data_module.users.getByhomeid(elt.userid);
                if (uIndex == -1) {
                    elt.userName = "";
                }
                else {
                    var fullname = data_module.users.items[uIndex].fullname;
                    var username = data_module.users.items[uIndex].username;
                    elt.userName = absol.string.nonAccentVietnamese(username + " - " + fullname).toLowerCase().trim();
                }
            })
            content = content.concat(value);
            content.sort(function(a, b){
                if (a.userName > b.userName) return 1;
                if (a.userName < b.userName) return -1;
                return 0;
            });
            superElt = {};
            superIndex = [];
            var data = generateData(content);
            if (superIndex.length == 1){
                data[superIndex[0]][2].element.disabled = true;
                data[superIndex[0]][3] = {style: {textAlign: "center"}, functionClick: function(){}};
            }
            tableView.updateTable(tableView.header, data, false, false);
        }
        theme.boardSelectMemberForm(content, owner, callbackFunc, addValue, frameList);
    }
    var container = absol._({
        child: [
            {
                child: [
                    {
                        class: "card-mobile-label-form-edit",
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: {text: title}
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: isPriv !== undefined ? "" : "none"
                            },
                            child: {
                                tag: "a",
                                style: {
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
                    }
                ]
            },
            tableView
        ]
    });
    container.getValue = function(){
        var data = tableView.data;
        var tempData = data.map(function(elt){
            return {
                id: parseInt(elt[0].value, 10),
                userid: parseInt(elt[1].element.nameElt.value, 10),
                type: parseInt(elt[1].element.typeElt.value, 10)
            };
        });
        return tempData;
    };
    var memberChange = function(data) {
        event = document.createEvent('Event');
        event.initEvent('memberchange', true, true);
        event.data = data;
        container.dispatchEvent(event);
    }
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
        theme.modalFormMobile({
            title: LanguageModule.text("txt_link_to_master_board"),
            bodycontent: absol._({
                child: [
                    {
                        tag: "span",
                        child: selector
                    }
                ]
            }),
            buttonList: [
                {
                    typeColor: "light",
                    text: LanguageModule.text("txt_ok")
                },
                {
                    text: LanguageModule.text("txt_cancel")
                }
            ],
            func: function(index){
                if (index == 0) {
                    rs(parseInt(selector.value));
                }
            }
        });
    });
};

theme.boardSelectGroup = function(groupsList, frameList){
    return new Promise(function(rs){
        var data = [], items;
        for (var i = 0; i < groupsList.length; i++){
            items = [
                {value: groupsList[i].name, style: {height: "30px"}},
                {
                    style: {
                        width: "30px"
                    },
                    element: absol._({
                        tag: "checkbox",
                        style: {
                            display: "block"
                        },
                        props: {
                            checked: groupsList[i].checked
                        },
                        on: {
                            change: function(index){
                                return function(){
                                    groupsList[index].checked = this.checked;
                                }
                            }(i)
                        }
                    })
                }
            ];
            if (groupsList[i].child.length > 0) {
                items.push({
                    style: {
                        width: "30px"
                    },
                    element: absol._({
                        tag: "i",
                        class: "material-icons",
                        style: {
                            fontSize: "30px",
                            display: "block"
                        },
                        child: {text: "keyboard_arrow_right"},
                        on: {
                            click: function(index){
                                return function(){
                                    theme.boardSelectGroup(groupsList[index].child, frameList);
                                }
                            }(i)
                        }
                    })
                })
            }
            else items.push({});
            data.push(items);
        }
        var tableGroup = pizo.tableView(
            [
                {value: LanguageModule.text("txt_name")},
                {},
                {}
            ],
            data,
            false,
            false
        );
        tableGroup.headerTable.style.display = "none";
        tableGroup.style.width = "100%";
        tableGroup.addStyle("stageTable");
        var header = absol.buildDom({
            tag: 'mheaderbar',
            props: {
                actionIcon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "arrow_back_ios"
                }),
                title: LanguageModule.text("txt_board_group")
            },
            on: {
                action: function(){
                    frameList.removeLast();
                    rs(true);
                }
            }
        });
        var tabFrame = absol.buildDom({
            tag: 'tabframe',
            child:[
                header,
                absol._({
                    class: "card-mobile-content",
                    child: tableGroup
                })
            ]
        });
        frameList.addChild(tabFrame);
        tabFrame.requestActive();
    });
};

theme.boardEditForm = function(params){
    var name, color, picture, available, board_type, list, fields, members;
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
            }),
            cmd: params.cmdButton.save
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
                                formatList = params.formats.items.map(function(elt){
                                    return {
                                        value: elt.id,
                                        text: elt.name
                                    };
                                });
                                formatList.sort(function(a, b){
                                    if (a.text2 > b.text2) return 1;
                                    if (a.text2 < b.text2) return -1;
                                    return 0;
                                });
                                var tid = -1;
                                var generateData = function(list){
                                    for (var i = 0; i < list.length; i++){
                                        list[i].format_listid = list[i].id;
                                        list[i].id = tid--;
                                        if (list[i].child) generateData(list[i].child);
                                    }
                                }
                                formatList.unshift({value: -1, text: LanguageModule.text("txt_no_select_master_board")});
                                theme.settingMasterBoard(formatList, params.formatid).then(function rs(value){
                                    params.formatid = value;
                                    if (params.formatid == -1) params.formatid = undefined;
                                    if (params.formatid){
                                        var template = params.formats.items[params.formats.getIndex(value)].content;
                                        params.content.list.value = template.list;
                                        generateData(params.content.list.value);
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
                                    if (board_type.value == 'general') stage = theme.stageDataForm(params.content.list.value, params.formatid, params.priv[9], params.frameList);
                                    else stage = theme.stageDataForm2(params.content.list.value, params.formatid, params.priv[9], params.frameList);
                                    stageContainer.clearChild();
                                    stage.addTo(stageContainer);
                                    fields = theme.boardFieldData(params.content.fields.value, params.fieldList, params.formatid, params.priv[8], params.content.fields.title, params.frameList);
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
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    keys = Object.keys(params.content);
    data = [];
    var uIndex = data_module.users.getByhomeid(params.creator);
    var creator;
    if (uIndex != -1) creator = data_module.users.items[uIndex].username + " - " + data_module.users.items[uIndex].fullname;
    else creator = "xxxxxx";
    var createdtime = contentModule.formatTimeDisplay(params.createdtime);
    name = absol._({
        tag: "input",
        class: "cardsimpleInput",
        style: {width: "100%"},
        props: {
            type: "text",
            value: params.content.name.value,
            disabled: !params.priv[4]
        }
    });
    var decoration = theme.decorationElt(params.content.decoration.content, params.content.decoration.value, params.priv[4]);
    decoration.align = "center";
    var groupItems = params.groups.items.map(function(elt){
        return {
            value: elt.id,
            text: elt.name
        };
    });
    groupItems.unshift({text: LanguageModule.text("txt_general_group"), value: 0});
    var props = {
        items: groupItems
    };
    if (params.groupid) props.value = params.groupid;
    var group = absol.buildDom({
        tag: 'selectmenu',
        style: {
            width: '100%'
        },
        props: props
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
            disabled: !params.priv[4]
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
                                format_listid: "",
                                name: "additional_status",
                                color: "ebebeb",
                                type: "group",
                                child: []
                            },
                            {
                                id: -2001,
                                format_listid: "",
                                name: "finish_status",
                                color: "ebebeb",
                                type: "group",
                                child: [
                                    {
                                        id: -1000,
                                        format_listid: "",
                                        name: LanguageModule.text("txt_finish"),
                                        color: "ebebeb",
                                        type: "system"
                                    }
                                ]
                            }
                        ];
                        newData = systemData.concat(newData);
                        stage = theme.stageDataForm(newData, params.formatid, params.isPriv, params.frameList);
                        break;
                    case 'lead':
                        newData = [
                            {
                                id: -2000,
                                format_listid: "",
                                name: 'initial_status',
                                color: "ebebeb",
                                type: "group",
                                child: [{
                                    id: -1000,
                                    format_listid: "",
                                    name: LanguageModule.text("txt_new"),
                                    color: "ebebeb",
                                    type: "system"
                                }]
                            },
                            {
                                id: -2001,
                                format_listid: "",
                                name: "additional_status",
                                color: "ebebeb",
                                type: "group",
                                child: newData
                            },
                            {
                                id: -2002,
                                format_listid: "",
                                name: "success_status",
                                color: "ebebeb",
                                type: "group",
                                child: [
                                    {
                                        id: -1001,
                                        format_listid: "",
                                        name: LanguageModule.text("txt_good_lead"),
                                        color: "ebebeb",
                                        type: "system"
                                    }
                                ]
                            },
                            {
                                id: -2003,
                                format_listid: "",
                                name: "unsuccess_status",
                                color: "ebebeb",
                                type: "group",
                                child: [
                                    {
                                        id: -1002,
                                        format_listid: "",
                                        name: LanguageModule.text("txt_junk_lead"),
                                        color: "ebebeb",
                                        type: "system"
                                    }
                                ]
                            }
                        ];
                        stage = theme.stageDataForm2(newData, params.formatid, params.isPriv, params.frameList);
                        break;
                    case 'deal':
                        newData = [
                            {
                                id: -2000,
                                name: 'initial_status',
                                color: "ebebeb",
                                type: "group",
                                child: [{
                                    id: -1000,
                                    name: LanguageModule.text("txt_new"),
                                    color: "ebebeb",
                                    type: "system"
                                }]
                            },
                            {
                                id: -2001,
                                name: "additional_status",
                                color: "ebebeb",
                                type: "group",
                                child: newData
                            },
                            {
                                id: -2002,
                                name: "success_status",
                                color: "ebebeb",
                                type: "group",
                                child: [
                                    {
                                        id: -1001,
                                        name: LanguageModule.text("txt_success"),
                                        color: "ebebeb",
                                        type: "system"
                                    }
                                ]
                            },
                            {
                                id: -2003,
                                name: "unsuccess_status",
                                color: "ebebeb",
                                type: "group",
                                child: [
                                    {
                                        id: -1002,
                                        name: LanguageModule.text("txt_failed"),
                                        color: "ebebeb",
                                        type: "system"
                                    }
                                ]
                            }
                        ];
                        stage = theme.stageDataForm2(newData, params.formatid, params.isPriv, params.frameList);
                        break;
                    default:
                }
                stageContainer.clearChild();
                stageContainer.addChild(stage);
            }
        }
    });
    if (board_type.value == 'general') stage = theme.stageDataForm(params.content.list.value, params.formatid, params.priv[9], params.frameList);
    else stage = theme.stageDataForm2(params.content.list.value, params.formatid, params.priv[9], params.frameList);
    stage.addTo(stageContainer);
    fields = theme.boardFieldData(params.content.fields.value, params.fieldList, params.formatid, params.priv[8], params.content.fields.title, params.frameList);
    members = theme.boardMemberData(EncodingClass.string.duplicate(params.content.members.value), params.owner, params.priv[5], params.listPriviledgeOfBoard, params.frameList, params.content.members.title);
    fields.addTo(fieldsContainer);
    data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: {text: params.content.name.title}
        },
        name,
        {
            class: "card-mobile-label-form-edit",
            child: {text: LanguageModule.text("txt_group")}
        },
        group,
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
                        child: {text: params.content.available.title}
                    }
                },
                available
            ]
        },
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
        fieldsContainer,
        members
    ];

    members.addEventListener("memberchange", function (event) {
        var userIndex;
        if (event.data.type == "add"){
            for (var i = 0; i < event.data.content.length; i++){
                userIndex = data_module.users.getByhomeid(event.data.content[i].userid);
                if (userIndex < 0) continue;
                memberList.push({
                    value: event.data.content[i].userid,
                    text: data_module.users.items[userIndex].fullname
                });
            }
            var selboxList = absol.$$("selectbox", email_group);
            for (var i = 0; i < selboxList.length; i++){
                selboxList[i].items = memberList;
            }
        }
        else {
            var k;
            for (var i = 0; i < event.data.content.length; i++){
                for (var j = memberList.length - 1; j >= 0; j--){
                    if (memberList[j].value == event.data.content[i].userid){
                        memberList.splice(j, 1);
                    }
                }
                var selboxList = absol.$$("selectbox", email_group);
                for (var i = 0; i < selboxList.length; i++){
                    k = selboxList[i].values.indexOf(event.data.content[i].userid);
                    if (k >= 0){
                        selboxList[i].values.splice(k, 1);
                    }
                }
            }
            var selboxList = absol.$$("selectbox", email_group);
            for (var i = 0; i < selboxList.length; i++){
                selboxList[i].items = memberList;
            }
        }
    });
    var dataEmailGroup = [];
    var memberList = [];
    var userIndex;
    for (var i = 0; i < params.content.members.value.length; i++){
        userIndex = data_module.users.getByhomeid(params.content.members.value[i].userid);
        if (userIndex < 0) continue;
        memberList.push({
            value: params.content.members.value[i].userid,
            text: data_module.users.items[userIndex].fullname
        });
    }
    var holderForSort = memberList.map(function(item){
        return {
            item: item,
            val: absol.string.nonAccentVietnamese(item.text.toLowerCase())
        }
    });
    holderForSort.sort(function(a, b){
        if (a.val < b.val) return -1;
        if (a.val > b.val) return 1;
        return 0;
    });

    memberList = holderForSort.map(function(holder){
        return holder.item;
    });
    var createEmailGroupRecord = function(content){
        var res = DOMElement.div({
            attrs: {
                id: content.id,
                style: {
                    paddingTop: "var(--control-verticle-distance-2)",
                    paddingLeft: "var(--control-horizontal-distance-2)"
                }
            },
            children: [
                DOMElement.div({
                    children: [
                        DOMElement.div({
                            attrs: {
                                style: {
                                    lineHeight: "30px",
                                    height: "30px",
                                    fontSize: "var(--fontsize-label-top-control)"
                                }
                            },
                            text: LanguageModule.text("txt_name")
                        }),
                        theme.input({
                            style: {
                                width: "calc(100% - 50px)",
                                verticalAlign: "middle"
                            },
                            value: content.name,
                            disabled: !params.priv[6]
                        }),
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-remove-cover",
                                style: {
                                    verticalAlign: "middle",
                                    marginLeft: "var(--control-horizontal-distance-1)",
                                    display: params.priv[6] ? "" : "none"
                                },
                                onclick: function(){
                                    res.remove();
                                }
                            },
                            children: [DOMElement.i({
                                attrs: {
                                    className: "material-icons card-icon-remove"
                                },
                                text: "remove_circle"
                            })]
                        })
                    ]
                }),
                DOMElement.div({
                    attrs: {
                        style: {
                            lineHeight: "30px",
                            height: "30px",
                            fontSize: "var(--fontsize-label-top-control)"
                        }
                    },
                    text: LanguageModule.text("txt_email")
                }),
                DOMElement.div({
                    children: [absol.buildDom({
                        tag: "selectbox",
                        style: {
                            width: "100%",
                            maxWidth: "600px"
                        },
                        props: {
                            enableSearch: true,
                            values: content.userList,
                            items: memberList,
                            disabled: !params.priv[6]
                        }
                    })]
                })
            ]
        });
        return res;
    };
    for (var i = 0; i < params.content.email_group.value.length; i++){
        dataEmailGroup.push(createEmailGroupRecord(params.content.email_group.value[i]));
    }
    var email_group = DOMElement.div({
        children: dataEmailGroup
    });
    var addEmailGroupFunc = function(){
        var record = createEmailGroupRecord({
            name: "",
            id: 0,
            userList: []
        });
        email_group.appendChild(record);
        absol.$("input", record).focus();
    };
    var addEmailGroupBtn = absol._({
        style: {
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
                    addEmailGroupFunc();
                }
            }
        }
    });
    data = data.concat([
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit",
            },
            text: params.content.email_group.title
        }),
        email_group
    ]);
    if (params.priv[6]){
        data.push(addEmailGroupBtn);
    }
    var email_group_required = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': 'var(--switch-fontsize)',
            position: "absolute",
            right: "0px"
        },
        props:{
            checked: params.content.email_group_required.value == 1,
            disabled: !params.priv[7]
        }
    });
    data = data.concat([
        absol.buildDom({
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
                        child: {text: params.content.email_group_required.title}
                    }
                },
                email_group_required
            ]
        }),
        absol.buildDom({
            class: "card-mobile-label-form-edit",
            style: {
                position: "relative"
            },
            child: [
                {
                    style: {
                        left: 0
                    },
                    child: { text: LanguageModule.text("txt_createdby") }
                },
                {
                    style: {
                        position: "absolute",
                        right: 0,
                        top: 0
                    },
                    child: { text: creator }
                }
            ]
        }),
        absol.buildDom({
            class: "card-mobile-label-form-edit",
            style: {
                position: "relative"
            },
            child: [
                {
                    style: {
                        left: 0
                    },
                    child: { text: LanguageModule.text("txt_created_time") }
                },
                {
                    style: {
                        position: "absolute",
                        right: 0,
                        top: 0
                    },
                    child: { text: createdtime }
                }
            ]
        })
    ]);

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
        var groupid = parseInt(group.value, 10);
        var email_groupValue = [], record, nameInput, userList;
        for (var i = 0; i < email_group.childNodes.length; i++){
            record = email_group.childNodes[i];
            nameInput = absol.$("input", record);
            if (nameInput.value.trim() == ""){
                ModalElement.alert({
                    message: LanguageModule.text("war_txt_email_group_name_is_null"),
                    func: function(){
                        nameInput.focus();
                    }
                });
                return;
            }
            userList = absol.$("selectbox", record).values;
            if (userList.length == 0){
                ModalElement.alert({
                    message: LanguageModule.text2("war_txt_email_group_member_is_null", [nameInput.value.trim()])
                });
                return;
            }
            email_groupValue.push({
                id: record.id,
                name: nameInput.value.trim(),
                userList: userList
            });
        }
        if (email_group_required.checked && email_groupValue.length == 0){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_email_group_is_null")
            });
            return;
        }
        return {
            name: nameValue,
            decoration: decoration.getValue(),
            favorite: 0,
            available: available.checked ? 1 : 0,
            permission: 0,
            board_type: board_type.value,
            list: stageValue,
            fields: fields.getValue(),
            formatid: params.formatid,
            members: members.getValue(),
            groupid: groupid,
            email_group_required: email_group_required.checked,
            email_group: email_groupValue
        };
    }
    return returnData;
};

theme.boardEditGroupForm = function(params){
    var data;
    var commands = [
        {
            icon:  DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: params.cmdButton.save
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
    var name = absol._({
        tag: "input",
        class: "cardsimpleInput",
        style: {
            width: "100%"
        },
        props:{
            type: "text",
            value: params.content.name
        }
    });
    var color = absol._({
        tag: 'colorpickerbutton',
        style: {
            width: "30px"
        },
        props: {
            value: "#" + params.content.color
        }
    });
    data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: {text: LanguageModule.text("txt_name")}
        },
        name,
        {
            class: "card-mobile-label-form-edit",
            child: {text: LanguageModule.text("txt_color")}
        },
        color
    ];
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: props,
        on: {
            action: params.cmdButton.close,
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });
    returnData.getValue = function(){
        var nameValue = name.value.trim();
        if (nameValue == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_name"),
                func: function(){
                    name.focus();
                }
            });
            return;
        }
        var colorValue = color.value;
        if (typeof(colorValue) == "string") colorValue = colorValue.substr(1);
        else colorValue = colorValue.toHex6();
        return {
            name: nameValue,
            color: colorValue
        };
    }
    return returnData;
};

theme.boardContentDataForm = function(params){
    var data;
    var mBoardMng = absol._({
        tag:'boardmanager',
        props:{
            title:null,//không có title
            // hasPlusBoard: false
            hasPlusBoard: (!params.archived)// có nút cộng để thêm
        },
        on:{
            change:function(event){
                params.groupChangeOrder(event.boardElt.ident, event.from, event.to);
            },
            pressaddgroup: function (){
                params.pressaddgroup(mBoardMng.getAllGroups().length, addNewGroup);
            }
        }
    });
    var addNewGroup = function(mBoardMng){
        return function(elt){
            if (elt.task == "add"){
                var boardGroup = absol._({
                    tag: 'boardgroup',
                    style: {
                        backgroundColor: "#" + elt.color
                    },
                    props: {
                        name: elt.name,
                        ident: elt.id
                    },
                    on: {
                        boardorderchange: function (event){
                            elt.on.boardorderchange();
                        },
                        boardenter: function (event){
                            elt.on.boardenter();
                        },
                        boardleave: function (event){
                            elt.on.boardleave();
                        },
                        dragboardstart: function (event){
                            elt.on.dragboardstart();
                        },
                        dragboardend: function (event){
                            elt.on.dragboardend();
                        },
                        pressaddboard: function(){
                            var board = params.addNew();
                        }
                    }
                });
                var items = [
                    {
                        text: LanguageModule.text("txt_edit"),
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: {text: "edit"}
                        },
                        cmd: function(){
                            elt.on.editFunc(elt.id, addNewGroup, mBoardMng.getAllGroups().length);
                        }
                    },
                    {
                        text: LanguageModule.text("txt_sort_ascending"),
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: ["mdi", "mdi-sort-ascending"]
                        },
                        cmd: function(){
                            elt.on.sortAscending(elt.id, function(){}).then(function(value){
                                var boards = boardGroup.$body.getAllBoards();
                                for (var i = 0; i < boards.length; i++){
                                    boards[i].selfRemove();
                                }
                                value.forEach(function(elt){
                                    boardGroup.addBoard(makeBoardElt(elt));
                                });
                            });
                        }
                    },
                    {
                        text: LanguageModule.text("txt_delete"),
                        extendClasses: "bsc-quickmenu red",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: {text: "delete"}
                        },
                        cmd: function(){
                            var title = LanguageModule.text("txt_delete_board_group");
                            var message = LanguageModule.text("war_delete_board_group");
                            theme.deleteConfirm(title, message).then(function(){
                                elt.on.deleteFunc(elt.id, mBoardMng.getAllGroups().length);
                            })
                        }
                    }
                ];
                boardGroup._quickmenu = {
                    props: {
                        extendClasses: 'cd-context-menu',
                        items: items
                    },
                    onSelect: function (item) {
                        item.cmd();
                    }
                };
                // boardGroup.$body.addClass("as-bscroller");
                mBoardMng.addBoardGroup(boardGroup);
            }
            else {
                var st = mBoardMng.getAllGroups();
                for (var i = 0; i < st.length; i++){
                    if (st[i].ident == elt.id){
                        st[i].addStyle("backgroundColor", "#" + elt.color);
                        // st[i].style.backgroundColor = "#" + elt.color;
                        st[i].name = elt.name;
                        break;
                    }
                }
            }
        }
    }(mBoardMng)

    var makeBoardElt = function(elt){
        var board = absol._({
            tag: 'representativeboard',
            props: {
                name: elt.name,
                ident: elt.id
            },
            on: {
                click: function(event){
                    if (absol.EventEmitter.hitElement(this.$contextBtn, event)) return ;
                    elt.openCardManager();
                }
            }
        });
        var items = [
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
        if (params.archived){
            if (elt.priv[11]) items.push({
                text: LanguageModule.text("txt_restore_board"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "restore" }
                },
                cmd: function(){
                    var title = LanguageModule.text("txt_restore_board");
                    var message = LanguageModule.text("war_restore_board");
                    ModalElement.question({
                        title: title,
                        message: message,
                        onclick: function(sel){
                            if (sel == 0){
                                elt.restoreBoard().then(function(value){
                                    if (value) board.selfRemove();
                                });
                            }
                        }
                    });
                }
            });
            if (elt.priv[10]) items.push({
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
                    ModalElement.question({
                        title: title,
                        message: message,
                        onclick: function(sel){
                            if (sel == 0){
                                elt.deleteBoard().then(function(value){
                                    if (value) board.selfRemove();
                                });
                            }
                        }
                    });
                }
            });
        }
        else {
            items.push({
                text: LanguageModule.text("txt_edit"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "mode_edit" }
                },
                cmd: elt.editFunc
            });
            if (elt.priv[12]) items.push({
                text: LanguageModule.text("txt_archive"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "turned_in_not" }
                },
                cmd: function(){
                    var title = LanguageModule.text("txt_archive_board");
                    var message = LanguageModule.text("war_archive_board");
                    ModalElement.question({
                        title: title,
                        message: message,
                        onclick: function(sel){
                            if (sel == 0){
                                elt.archiveBoard().then(function(value){
                                    if (value) board.selfRemove();
                                });
                            }
                        }
                    });
                }
            });
            if (elt.priv[10]) items.push({
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
                    ModalElement.question({
                        title: title,
                        message: message,
                        onclick: function(sel){
                            if (sel == 0){
                                elt.deleteBoard().then(function(value){
                                    if (value) board.selfRemove();
                                });
                            }
                        }
                    });
                }
            });
            if (!elt.formatid && elt.isAdmin) items.push({
                text: LanguageModule.text("txt_make_master_board"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: ["mdi", "mdi-tablet-dashboard"],
                },
                cmd: elt.makeMasterBoard
            });
        }
        board._quickmenu = {
            props: {
                extendClasses: 'cd-context-menu',
                items: items
            },
            onSelect: function (item) {
                item.cmd();
            }
        };
        return board;
    };
    var keys = Object.keys(params.content);
    keys.sort(function(a, b){
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
    keys.forEach(function(cur, index){
        var elt = params.content[cur];
        var boardGroup = absol._({
            tag: 'boardgroup',
            class: params.archived ? "tl-archived" : [],
            style: {
                backgroundColor: "#" + elt.color
            },
            props: {
                name: elt.name,
                ident: elt.id
            },
            on: {
                boardorderchange: function (event){
                    elt.on.boardorderchange(event.target.ident, event.boardElt.ident, event.from, event.to);
                },
                boardenter: function (event){
                    elt.on.boardenter(event.item.ident, event.from, event.to);
                },
                boardleave: function (event){
                    elt.on.boardleave();
                },
                dragboardstart: function (event){
                    elt.on.dragboardstart();
                },
                dragboardend: function (event){
                    elt.on.dragboardend();
                },
                pressaddboard: function(){
                    var board = params.addNew(elt.id);
                }
            }
        });
        var items = [];
        if (cur != -1){
            items = [
                {
                    text: LanguageModule.text("txt_edit"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: "material-icons",
                        child: {text: "edit"}
                    },
                    cmd: function(){
                        elt.on.editFunc(elt.id, addNewGroup, index - 1);
                    }
                },
                {
                    text: LanguageModule.text("txt_sort_ascending"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: ["mdi", "mdi-sort-ascending"]
                    },
                    cmd: function(){
                        elt.on.sortAscending(elt.id, function(){}).then(function(value){
                            var boards = boardGroup.$body.getAllBoards();
                            for (var i = 0; i < boards.length; i++){
                                boards[i].selfRemove();
                            }
                            value.forEach(function(elt){
                                boardGroup.addBoard(makeBoardElt(elt));
                            });
                        });
                    }
                },
                {
                    text: LanguageModule.text("txt_delete"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: "material-icons",
                        child: {text: "delete"}
                    },
                    cmd: function(){
                        var title = LanguageModule.text("txt_delete_board_group");
                        var message = LanguageModule.text("war_delete_board_group");
                        ModalElement.question({
                           title: title,
                           message: message,
                           onclick: function(sel){
                               if (sel == 0){
                                   elt.on.deleteFunc(elt.id, index - 1);
                               }
                           }
                        });
                    }
                }
            ];
        }
        else {
            boardGroup.removeClass('as-board');
        }
        boardGroup._quickmenu = {
            props: {
                extendClasses: 'cd-context-menu',
                items: items
            },
            onSelect: function (item) {
                item.cmd();
            }
        };
        // boardGroup.$body.addClass("as-bscroller");
        // boardGroup.$body.style.maxHeight = 'calc(100vh - 200px)';
        if (cur != -1) elt.child.sort(function(a, b){
            if (a.index > b.index) return -1;
            if (a.index < b.index) return 1;
            return 0;
        });
        elt.child.forEach(function(item){
            boardGroup.addBoard(makeBoardElt(item));
        });
        mBoardMng.addBoardGroup(boardGroup);
    });
    return mBoardMng;
};

theme.boardInitForm = function(params){
    var viewArchived = false;
    var filterFunc = function(){
        theme.modalFormMobile({
            bodycontent: absol._({
                child: [
                    {
                        class: "card-mobile-label-form-edit",
                        child: {
                            tag: "checkbox",
                            props: {
                                checked: viewArchived,
                                text: LanguageModule.text("txt_view_archived_boards")
                            },
                            on: {
                                change: function(){
                                    viewArchived = this.checked;
                                    if (viewArchived){
                                        params.cmdButton.viewArchivedBoard();
                                    }
                                    else {
                                        params.cmdButton.viewCurrentBoard();
                                    }
                                }
                            }
                        }
                    }
                ]
            })
        });
    };
    var commands = [
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
    params.board_container.style.width = "100%";
    params.board_container.style.height = "100%";
    var returnData = absol.buildDom({
        tag: 'tabframe',
        class:['as-viewport-full', 'cd-page-board'],// không scroll trong trang nữa, vừa màn hình
        child:[
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content",
                    style: {
                        padding: "20px 0 0 0"
                    }
                },
                children: [params.board_container]
            })
        ]
    });
    return returnData;
};

ModuleManagerClass.register({
    name: "Boards_view",
    prerequisites: ["ModalElement"]
});
