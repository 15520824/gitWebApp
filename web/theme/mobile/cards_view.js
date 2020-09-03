'use strict';

theme.formKnowledgeEdit = function(params){
    var cmdButton = [
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.closeButton({
                onclick: params.cmdButton.close
            })]
        }),
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.saveButton({
                onclick: params.cmdButton.save
            })]
        }),
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.saveCloseButton({
                onclick: params.cmdButton.save_close
            })]
        })
    ];
    var buttonPanel = DOMElement.div({
        attrs: {
            className: "button-panel-header"
        },
        children: cmdButton
    });
    var name_inputtext = theme.input({
       style: {
           minWidth: "300px",
           width: "100%"
       },
       value: params.data.name
    });
    var tag_inputtext = theme.input({
       style: {
           minWidth: "300px",
           width: "100%"
       },
       value: params.data.tag
    });
    var textId = ("text_" + Math.random() + Math.random()).replace(/\./g, '');
    var description_inputtext = absol.buildDom({
        tag: 'div',
        class: "container-bot",
        props: {
            id: textId
        }
    });

    var editor;

    var ckedit = absol.buildDom({
        tag: 'attachhook',
        on: {
            error: function () {
                this.selfRemove();
                editor = CKEDITOR.replace(textId);
                editor.setData(params.data.description);
            }
        }
    });
    var inputIdBoxes = [];

    var checkItem = function(id){
        var index = params.knowledge_groups.getIndex(id);
        if (params.knowledge_groups.items[index].parentid == 0) return;
        inputIdBoxes["checkbox_" + params.knowledge_groups.items[index].parentid].checked = false;
        checkItem(params.knowledge_groups.items[index].parentid);
    };
    var checkAll = function(id){
        var index = params.knowledge_groups.getIndex(id);
        var ni;
        for (var i = 0; i < params.knowledge_groups.items[index].childrenIndexList.length; i++){
            ni = params.knowledge_groups.items[index].childrenIndexList[i];
            inputIdBoxes["checkbox_" + params.knowledge_groups.items[ni].id].checked = true;
            checkAll(params.knowledge_groups.items[ni].id);
        }
    };
    var checkboxIsChange = function(id, checked){
        if (checked){
            checkAll(id);
        }
        else {
            checkItem(id);
        }
    };

    function getDataCell(content){
        var child = [];
        for (var i = 0; i < content.child.length; i++){
            child.push(getDataCell(content.child[i]));
        }
        inputIdBoxes["checkbox_" + content.id] = absol.buildDom({
            tag: "checkbox",
            props: {
                checked: content.checked
            },
            on: {
                change: function(event){
                    checkboxIsChange(content.id, this.checked);
                }
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
                            children: [inputIdBoxes["checkbox_" + content.id]]
                        })
                    ]
                })
            }
        ];
        if (child.length > 0) row.child = child;
        return row;
    };
    var data = [];
    for (var i = 0; i < params.data.groupList.length; i++){
        data.push(getDataCell(params.data.groupList[i]));
    }
    var header = [
        {value: LanguageModule.text("txt_name"), sort: true},
        {value: ""}
    ];
    var group_inputselect = pizo.tableView(
        header,
        data,
        false,
        false,
        0
    );
    group_inputselect.style.width = "100%";
    var dataView = [
        [
            {text: LanguageModule.text("txt_name")},
            {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
            name_inputtext
        ],
        [{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}],
        [
            {text: LanguageModule.text("txt_tag")},
            {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
            tag_inputtext
        ],
        [{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}],
        [
            {text: LanguageModule.text("txt_description")},
            {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
            description_inputtext
        ],
        [{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}],
        [
            {text: LanguageModule.text("txt_group")},
            {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
            group_inputselect
        ]
    ];
    if (params.data.createdby !== undefined){
        dataView.push(
            [{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}],
            [
                {text: LanguageModule.text("txt_user_created")},
                {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
                theme.input({
                    style: {
                        minWidth: "300px",
                        width: "100%"
                    },
                    disabled: true,
                    value: params.data.createdby
                })
            ],
            [{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}],
            [
                {text: LanguageModule.text("txt_created_time")},
                {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
                theme.input({
                    style: {
                        minWidth: "300px",
                        width: "100%"
                    },
                    disabled: true,
                    value: params.data.createdtime
                })
            ]
        );
    }
    var singlePage = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            DOMElement.div({
                attrs: {
                    className: "absol-single-page-header"
                },
                children: [buttonPanel]
            }),
            DOMElement.table({
                data: dataView
            })
        ]
    });
    singlePage.getValue = function(){
       if (name_inputtext.value.trim() == ""){
           ModalElement.alert({
               message: LanguageModule.text("war_no_work_name"),
               func: function(){
                   name_inputtext.focus();
               }
           });
           return;
       }
       var groupValue = [];
       var getGroupValue = function(content){
           if (inputIdBoxes["checkbox_" + content.id].checked) groupValue.push(content.id);
           for (var i = 0; i < content.child.length; i++){
               getGroupValue(content.child[i]);
           }
       };
       for (var i = 0; i < params.data.groupList.length; i++){
           getGroupValue(params.data.groupList[i]);
       }
       return {
           name: name_inputtext.value.trim(),
           tag: tag_inputtext.value.trim(),
           description: editor.getData(),
           groupValue: groupValue
       }
    };
    setTimeout(function(){
        name_inputtext.focus();
    },10);
    return singlePage;
};

theme.cardGetMillisecondsWithoutTime = function(date){
    var y, m, d, t;
    y = date.getFullYear();
    m = date.getMonth();
    d = date.getDate();
    t = new Date(y, m, d);
    return t.getTime();
}

theme.cardActivityElt = function(content, cardid, getObjectbyType, users, userid, activities_content, imagesList){
    var location, src;
    var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
    var generateChecklistValueData = function(content, objid){
        var value = [];
        content.forEach(function(elt){
            var subValue = {};
            elt.value.forEach(function(item){
                switch (item.localid) {
                    case "type_check_list_item_name":
                        subValue.name = item.value;
                        break;
                    case "type_check_list_item_index":
                        subValue.index = item.value;
                        break;
                    case "type_check_list_item_success":
                        subValue.status = item.value;
                        break;
                    case "type_check_list_item_due_date":
                        subValue.due_date = item.value;
                        break;
                    case "type_check_list_item_reminder":
                        subValue.reminder = item.value;
                        break;
                    case "type_check_list_item_assigned_to":
                        subValue.assigned_to = item.value;
                        break;
                }
            });
            subValue.id = objid;
            value.push(subValue);
        });
        return value;
    };
    var checklistItemElt = function(content){
        var st = absol._({
            class: 'card-activity-view-checklist-item',
            style: {
                paddingLeft: "30px"
            },
            child: [
                {
                    class: "card-activity-view-checklist-item-checkbox",
                    child: {
                        tag: "checkbox",
                        props: {
                            checked: content.status,
                            disabled: true
                        }
                    }
                },
                {
                    class: "card-activity-view-checklist-item-content",
                    child: {
                        class: "card-activity-view-checklist-item-content-text",
                        tag: "span",
                        child: {text: content.name}
                    }
                }
            ]
        });
        return st;
    };
    var checklistElt = function(content){
        var st = absol._({});
        var c_name = absol._({
            child: {text: content.name}
        });
        c_name.addTo(st);
        var itemValue = generateChecklistValueData(content.items_value, content.id);
        itemValue.forEach(function(elt){
            elt.checklistName = content.name;
            elt.activity = "checklist_item";
            elt.src1 = "icons/check_list.png";
            elt.src2 = "icons/check_list_complete.png";
            elt.src3 = "icons/check_list_delay.png";
            elt.editFunc = content.editFunc;
            if (elt.due_date.getTime() > 0) theme.cardActivityElt(elt, cardid, getObjectbyType, users, userid, activities_content);
            var item = checklistItemElt(elt);
            item.addTo(st);
        });
        return st;
    };
    var fieldElt = function(content){
        var st = absol._({});
        var c_name = absol._({
            child: {text: content.name}
        });
        c_name.addTo(st);
        var field = getObjectbyType(content.typeid, content.valueid);
        field.style.marginLeft = "30px";
        st.addChild(field);
        return st;
    };

    var st = absol._({
        class: "card-activity-view-container"
    });
    var valueElt;
    switch (content.activity) {
        case "task":
            valueElt = absol._({
                class: "card-activity-view-content",
                tag: "span",
                child: {text: content.name + " - Hạn hoàn thành: " + contentModule.formatTimeMinuteDisplay(content.due_date)}
            });
            if (content.status) {
                location = "-1";
                src = content.src2;
            }
            else {
                if (theme.cardGetMillisecondsWithoutTime(content.due_date) < toDay) {
                    location = "-4";
                    src = content.src3;
                }
                else if (theme.cardGetMillisecondsWithoutTime(content.due_date) == toDay) {
                    location = "-3";
                    src = content.src1;
                }
                else {
                    location = "-2";
                    src = content.src1;
                }
            }
            break;
        case "meeting":
            valueElt = absol._({
                class: "card-activity-view-content",
                tag: "span",
                child: {text: content.name + " - Ngày bắt đầu: " + contentModule.formatTimeMinuteDisplay(content.start_date)}
            });
            if (content.status) {
                location = "-1";
                src = content.src2;
            }
            else {
                if (theme.cardGetMillisecondsWithoutTime(content.start_date) < toDay) {
                    location = "-4";
                    src = content.src3;
                }
                else if (theme.cardGetMillisecondsWithoutTime(content.start_date) == toDay) {
                    location = "-3";
                    src = content.src1;
                }
                else {
                    location = "-2";
                    src = content.src1;
                }
            }
            break;
        case "call":
            valueElt = absol._({
                class: "card-activity-view-content",
                tag: "span",
                child: {text: content.name + " - Ngày gọi: " + contentModule.formatTimeMinuteDisplay(content.call_date)}
            });
            if (content.status) {
                location = "-1";
                src = content.src2;
            }
            else {
                if (theme.cardGetMillisecondsWithoutTime(content.call_date) < toDay) {
                    location = "-4";
                    src = content.src3;
                }
                else if (theme.cardGetMillisecondsWithoutTime(content.call_date) == toDay) {
                    location = "-3";
                    src = content.src1;
                }
                else {
                    location = "-2";
                    src = content.src1;
                }
            }
            break;
        case "wait":
            valueElt = absol._({
                class: "card-activity-view-content",
                tag: "span",
                child: {text: "Sau " + content.duration + " ngày tính từ " + contentModule.formatTimeMinuteDisplay(content.created) + " mà không ghi nhân hoạt động nào thì thông báo cho người quản lý card: " + contentModule.getUsernameByhomeid2(users, userid)}
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        case "note":
            valueElt = absol._({
                class: "card-activity-view-content",
                tag: "span",
                child: {text: content.name + " - Note: " + (content.result.length > 200 ? content.result.substr(0, 200) : content.result)}
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        case "checklist":
            valueElt = absol._({
                class: "card-activity-view-content",
                child: checklistElt(content)
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        case "field":
            valueElt = absol._({
                class: "card-activity-view-content",
                child: fieldElt(content)
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        case "checklist_item":
            var x = content.name + " (" + content.checklistName + ")";
            if (content.due_date.getTime() > 0) x += " - Hạn hoàn thành: " + contentModule.formatTimeDisplay(content.due_date);
            valueElt = absol._({
                class: "card-activity-view-content",
                tag: "span",
                child: {text: x}
            });
            valueElt.index = content.index;
            if (content.status) {
                location = "-1";
                src = content.src2;
            }
            else {
                if (theme.cardGetMillisecondsWithoutTime(content.due_date) < toDay) {
                    location = "-4";
                    src = content.src3;
                }
                else if (theme.cardGetMillisecondsWithoutTime(content.due_date) == toDay) {
                    location = "-3";
                    src = content.src1;
                }
                else {
                    location = "-2";
                    src = content.src1;
                }
            }
            break;
        case "file":
            var childFiles = [], suffFile, fileIcon;
            for (var i = 0; i < content.listFile.length; i++){
                if (content.listFile[i].content_type == "file"){
                    suffFile = content.listFile[i].filename.split('.').pop();
                    if (contentModule.listSuffFiles.indexOf(suffFile) >= 0){
                        fileIcon = suffFile + ".svg";
                    }
                    else {
                        fileIcon = "default.svg";
                    }
                    childFiles.push(DOMElement.a({
                        attrs: {
                            href: "./uploads/files/" + content.listFile[i].id + "_" + content.listFile[i].filename + ".upload",
                            download: content.listFile[i].filename,
                            style: {
                                cursor: "pointer",
                                margin: "10px",
                                color: "black",
                                textDecoration: "none"
                            }
                        },
                        children: [DOMElement.table({
                            data: [[
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            height: "80px",
                                            width: "112px",
                                            border: "1px solid #d6d6d6",
                                            backgroundColor: "rgb(255, 255, 255)",
                                            textAlign: "center",
                                            verticalAlign: "middle",
                                            display: "table-cell"
                                        }
                                    },
                                    children: [DOMElement.img({
                                        attrs: {
                                            src: "../../vivid_exticons/" + fileIcon,
                                            style: {
                                                maxHeight: "60px",
                                                maxWidth: "92px"
                                            }
                                        }
                                    })]
                                }),
                                {attrs: {style: {width: "20px"}}},
                                {text: content.listFile[i].title}
                            ]]
                        })]
                    }));
                }
                else {
                    childFiles.push(DOMElement.a({
                        attrs: {
                            style: {
                                cursor: "pointer",
                                margin: "10px",
                                color: "black",
                                textDecoration: "none"
                            },
                            onclick: function(imagesList, id){
                                return function(event, me){
                                    document.body.appendChild(descViewImagePreview(imagesList, id));
                                }
                            }(imagesList, content.listFile[i].id)
                        },
                        children: [DOMElement.table({
                            data: [[
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            height: "80px",
                                            width: "112px",
                                            border: "1px solid #d6d6d6",
                                            backgroundColor: "rgb(255, 255, 255)",
                                            textAlign: "center",
                                            verticalAlign: "middle",
                                            display: "table-cell"
                                        }
                                    },
                                    children: [DOMElement.img({
                                        attrs: {
                                            src: content.listFile[i].src,
                                            style: {
                                                maxHeight: "60px",
                                                maxWidth: "92px"
                                            }
                                        }
                                    })]
                                }),
                                {attrs: {style: {width: "20px"}}},
                                {text: content.listFile[i].title}
                            ]]
                        })]
                    }));
                }
            }
            valueElt = absol._({
                class: "card-activity-view-content",
                child: childFiles
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        default:

    }
    var image = absol._({
        class: "card-activity-view-image",
        child: {
            tag: "img",
            style: {'z-index': '1'},
            props: {
                src: src,
                alt: content.activity
            },
            on: {
                click: function(){
                    if (content.activity == "file"){
                        content.editFunc(cardid, content.listFile);
                    }
                    else {
                        content.editFunc(cardid, content.id);
                    }
                }
            }
        }
    });
    image.addTo(st);
    var value = absol._({
        class: "card-activity-view-content-container",
        child: valueElt
    });
    value.addTo(st);
    st.ident = content.id;
    if (!activities_content[location]) activities_content[location] = [];
    activities_content[location].unshift(st);
};

theme.generateActivitiesData = function(activities_block, activitiesOfCard, objects, values, typelists, users, funcs, cardid, userid, getObjectbyType, activities_data_structure, allFiles, imagesList){
    var content;
    var activities = [];
    for (var i = 0; i < objects.items.length; i++){
        var elt = objects.items[i];
        if (activitiesOfCard.indexOf(elt.id) == -1) continue;
        switch (elt.type) {
            case "task":
                content = theme.generateTaskData(elt.valueid, values);
                activities.push({
                    src1: "icons/task.png",
                    src2: "icons/task_complete.png",
                    src3: "icons/task_delay.png",
                    activity: "task",
                    id: elt.id,
                    name: content.work_value,
                    due_date: content.due_date_value,
                    status: content.status_value,
                    editFunc: funcs.editTaskFunc
                });
                break;
            case "meeting":
                content = theme.generateMeetingData(elt.valueid, values);
                activities.push({
                    src1: "icons/meeting.png",
                    src2: "icons/meeting_complete.png",
                    src3: "icons/meeting_delay.png",
                    activity: "meeting",
                    id: elt.id,
                    name: content.name_value,
                    start_date: content.start_date_value,
                    end_date: content.end_date_value,
                    all_day: content.all_day_value,
                    status: content.status_value,
                    editFunc: funcs.editMeetingFunc
                });
                break;
            case "call":
                content = theme.generateCallData(elt.valueid, values);
                activities.push({
                    src1: "icons/call.png",
                    src2: "icons/call_complete.png",
                    src3: "icons/call_delay.png",
                    activity: "call",
                    id: elt.id,
                    name: content.work_value,
                    call_date: content.due_date_value,
                    status: content.status_value,
                    editFunc: funcs.editCallFunc
                });
                break;
            case "wait":
                content = theme.generateWaitData(elt.valueid, values);
                activities.push({
                    src1: "icons/wait.png",
                    src2: "icons/wait_complete.png",
                    src3: "icons/wait_delay.png",
                    activity: "wait",
                    id: elt.id,
                    name: content.work_value,
                    created: content.created_value,
                    duration: content.duration_value,
                    message: content.message_value,
                    editFunc: funcs.editWaitFunc
                });
                break;
            case "note":
                content = theme.generateNoteData(elt.valueid, values);
                activities.push({
                    src1: "icons/note.png",
                    src2: "icons/note_complete.png",
                    src3: "icons/note_delay.png",
                    activity: "note",
                    id: elt.id,
                    name: content.work_value,
                    created: content.created_value,
                    result: content.note_value,
                    editFunc: funcs.editNoteFunc
                });
                break;
            case "checklist":
                content = theme.generateChecklistData(elt.valueid, values);
                activities.push({
                    src1: "icons/check_list.png",
                    src2: "icons/check_list_complete.png",
                    src3: "icons/check_list_delay.png",
                    activity: "checklist",
                    id: elt.id,
                    name: content.name_value,
                    created: content.created_value,
                    items_value: content.items_value,
                    editFunc: funcs.editCheckListFunc
                });
                break;
            case "field":
                activities.push({
                    src1: "icons/field.png",
                    src2: "icons/field_complete.png",
                    src3: "icons/field_delay.png",
                    activity: "field",
                    id: elt.id,
                    typeid: objects.items[objects.getIndex(elt.id)].typeid,
                    valueid: objects.items[objects.getIndex(elt.id)].valueid,
                    name: typelists.items[typelists.getIndex(objects.items[objects.getIndex(elt.id)].typeid)].name,
                    created: elt.createdtime,
                    editFunc: funcs.editFieldFunc
                });
                break;
            default:
                break;
        }
    }
    for (var i = 0; i < allFiles.length; i++){
        activities.push({
            id: "file_" + theme.cardGetMillisecondsWithoutTime(allFiles[i].time),
            src1: "icons/file.png",
            activity: "file",
            listFile: allFiles[i].listFile,
            created: allFiles[i].time,
            editFunc: funcs.editFileFunc
        });
    }
    var activities_content = {};
    activities.forEach(function(elt){
        var item;
        theme.cardActivityElt(elt, cardid, getObjectbyType, users, userid, activities_content, imagesList);
    });
    var keys = Object.keys(activities_content);
    keys = keys.map(function(elt){return parseInt(elt);});
    keys.sort(function(a, b){
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
    keys.sort(function(a, b){
        if (a < 0 || b < 0) return 0;
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
    });
    keys.forEach(function(elt){
        var title, color;
        switch (elt) {
            case -3:
                title = LanguageModule.text('txt_today');
                color = '#ffa382';
                break;
            case -4:
                title = LanguageModule.text('txt_overdue');
                color = '#ffdad8';
                break;
            case -2:
                title = LanguageModule.text('txt_plan');
                color = '#fefac0';
                break;
            case -1:
                title = LanguageModule.text('txt_complete');
                color = '#bdf2a5';
                break;
            default:
                title = contentModule.formatTimeDisplay(new Date(parseInt(elt)));
                color = '#e4e1f5';
        }
        var activities_container = absol._({
            style: {
                paddingTop: "20px",
                paddingBottom: "20px"
            },
            child: activities_content[elt.toString()]
        });
        var x = absol._({
            class: "card-activities-group-"+elt,
            child: [
                {
                    style: {
                        'font-weight': 'bold',
                        'line-height': '30px',
                        'margin-left': '26px',
                        'text-align': 'center',
                        'border': 'var(--control-border)',
                        backgroundColor: color
                    },
                    child: {text: title}
                },
                activities_container
            ]
        });
        x.ident = elt;
        x.activities_container = activities_container;
        activities_block.addChild(x)
    });
};

theme.cardAddFieldForm = function(params){
    var typeOfData;
    if (params.fieldList.length == 0){
        ModalElement.alert({message: LanguageModule.text("war_board_do_not_have_field")});
        return;
    }
    var vIndex, buttons = [], typeCombobox, created_value;
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

    if (params.id > 0){
        created_value = params.objects.items[params.objects.getIndex(params.id)].createdtime;
    }
    else created_value = new Date();
    var saveFunc = function(promise){
        promise().then(function resolve(value){
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++){
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            if (params.id > 0){
                var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                var parent = absol.$(".card-activities-group-"+ident, activities_block);
                if (parent){
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                        identArray = identArray.filter(function(elt){
                            return elt != parseInt(ident);
                        });
                    }
                }
            }
            var item = {};
            theme.cardActivityElt({
                src1: "icons/field.png",
                src2: "icons/field_complete.png",
                src3: "icons/field_delay.png",
                activity: "field",
                id: value.id,
                typeid: params.objects.items[params.objects.getIndex(value.id)].typeid,
                valueid: params.objects.items[params.objects.getIndex(value.id)].valueid,
                name: params.typelists.items[params.typelists.getIndex(params.objects.items[params.objects.getIndex(value.id)].typeid)].name,
                created: created_value,
                editFunc: params.editFieldFunc
            }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-"+keys[0], activities_block);
            if (!newParent){
                var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
                var color = '#e4e1f5';
                var x = absol._({
                    style: {
                        paddingTop: "20px",
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: "card-activities-group-"+keys[0],
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'margin-left': '26px',
                                'text-align': 'center',
                                'border': 'var(--control-border)',
                                backgroundColor: color
                            },
                            child: {text: title}
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                var maxIdent = Math.max(...identArray);
                identArray.push(parseInt(keys[0]));
                identArray.sort(function(a, b){
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1){
                    var className = ".card-activities-group-"+maxIdent;
                    var afterElt = absol.$(className, activities_block);
                }
                else {
                    var className = ".card-activities-group-"+identArray[index];
                    var afterElt = absol.$(className, activities_block);
                }
                activities_block.insertBefore(newParent, afterElt);
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message){
            if (message) ModalElement.alert({message: message});
        });
    };

    var deleteFunc = function(promise){
        var title = LanguageModule.text("txt_delete_field");
        var message = LanguageModule.text("war_delete_field");
        theme.deleteConfirm(title, message).then(function rs(){
            promise().then(function resolve(value){
                while(params.frameList.getLength() > 2){
                    params.frameList.removeLast();
                }
                params.objects = value.objects;
                var activities_block = absol.$(".card-activities-block", params.frameList);
                var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                var parent = absol.$(".card-activities-group-"+ident, activities_block);
                if (parent){
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                    }
                }
            }, function reject(message){
                if (message) ModalElement.alert({message: message});
            });
        });
    };

    buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveButton({
                onclick: function(){
                    saveFunc(params.cmdButton.save);
                }
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveCloseButton({
                onclick: function(){
                    saveFunc(params.cmdButton.saveClose);
                }
            })
        })
    ];
    if (params.id) {
        buttons.push(absol._({
            class: "single-button-header",
            child: theme.deleteButton({
                onclick: function(){
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
        typeOfData = params.typelists.items[params.typelists.getIndex(typeid)].type;
        var content = contentModule.getObjectbyType(host, typeid, params.valueid);
        if (['string', 'note', 'number', 'email', 'phonenumber', 'website', 'gps'].indexOf(typeOfData) != -1) {
            content.style.width = "300px";
            content = absol._({
                child: [
                    {
                        style: {
                            verticalAlign: "middle"
                        },
                        tag: "span",
                        child: {text: typeCombobox.textContent}
                    },
                    {
                        style: {
                            display: "inline-block",
                            paddingLeft: "10px",
                            verticalAlign: "middle"
                        },
                        child: content
                    }
                ]
            })
        }

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
        var value;
         if (['string', 'note', 'number', 'email', 'phonenumber', 'website', 'gps'].indexOf(typeOfData) != -1) {
             value = content_container.childNodes[0].childNodes[1].childNodes[0].getValue().value;
         }
         else value = content_container.childNodes[0].getValue().value;
        return {
            typeid: typeCombobox.value,
            listValueId: host.listValueId,
            value: value
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
    var elt = absol.buildDom({
        style: {
            whiteSpace: "nowrap"
        },
        child: [
            date,
            time
        ]
    });
    elt.dateElt = date;
    elt.timeElt = time;
    elt.getValue = function(){
        var dateValue = date.value;
        dateValue = new Date(dateValue.setHours(0, 0, 0, 0));
        return new Date(dateValue.getTime() + (time.hour*3600 + time.minute*60)*1000);
    };
    elt.oldValue = elt.getValue();
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
            text: users.items[i].username + " - " + users.items[i].fullname
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
            text: users.items[i].username + " - " + users.items[i].fullname
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

theme.cardAddItemOfCheckListForm = function(typelists, users, userid, value){
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
        if (value) value = value.getTime() == 0 ? null : value;
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
                checked: value != ""
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
        var items, name, due_date, reminder, index, success, icon, assigned_to;
        elt.value.forEach(function(elt2){
            switch (elt2.localid) {
                case "type_check_list_item_assigned_to":
                    assigned_to = theme.cardGenerateUserElt(users, elt2.value);
                    assigned_to.removeStyle("width");
                    assigned_to.localid = elt2.localid;
                    assigned_to.valueid = elt2.valueid;
                    assigned_to.typeid = elt2.typeid;
                    assigned_to.privtype = elt2.privtype;
                    break;
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
        items = [{}, {value: elt.valueid}, {element: success}, {element: name}, {element: due_date}, {element: reminder}, {element: assigned_to}, {element: index}, {style: {textAlign: "center"}, element: icon}];
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
        {value: LanguageModule.text("txt_assigned_to")},
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
        var assigned_to = theme.cardGenerateUserElt(users, userid);
        assigned_to.removeStyle("width");
        assigned_to.localid = "type_check_list_item_assigned_to";
        assigned_to.valueid = 0;
        assigned_to.typeid = -8;
        assigned_to.privtype = "users";
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
        var icon = deleteIcon();
        var data = [{}, {value: 0}, {element: success}, {element: name}, {element: due_date}, {element: reminder}, {element: assigned_to}, {element: index}, {element: deleteIcon()}];
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
            var assigned_to = item[6].element.value;
            if (due_date === null){
                if (reminder != "type_reminder_none"){
                    ModalElement.alert({
                        message: LanguageModule.text("war_no_due_date"),
                        func: function(){
                            item[4].element.focus();
                        }
                    });
                    return false;
                }
            }
            var success = item[2].element.checked;
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
                        value: success
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
                        value: assigned_to
                    },
                    {
                        localid: item[7].element.localid,
                        valueid: item[7].element.valueid,
                        typeid: item[7].element.typeid,
                        privtype: item[7].element.privtype,
                        value: j + 1
                    }
                ]
            });
        }
        return content;
    }
    return returnData;
}

theme.generateChecklistData = function(valueid, values){
    var name_value, items_value, created_value, user_created_value;
    var getItemList = function(valueid){
        var value = [];
        valueid.forEach(function(elt){
            var subvalue = [], tIndex;
            var content2 = EncodingClass.string.toVariable(values.items[values.getIndex(elt)].content);
            content2.forEach(function(elt2){
                var itemValue;
                switch (elt2.localid) {
                    case "type_check_list_item_name":
                        itemValue = values.items[values.getIndex(elt2.valueid)].content;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -1,
                            privtype: "string"
                        });
                        break;
                    case "type_check_list_item_index":
                        itemValue = values.items[values.getIndex(elt2.valueid)].numbercontent;
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
                        itemValue = values.items[values.getIndex(elt2.valueid)].content;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -6,
                            privtype: "boolean"
                        });
                        break;
                    case "type_check_list_item_due_date":
                        itemValue = new Date(values.items[values.getIndex(elt2.valueid)].timecontent);
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -5,
                            privtype: "datetime"
                        });
                        break;
                    case "type_check_list_item_reminder":
                        itemValue = values.items[values.getIndex(elt2.valueid)].content;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -17,
                            privtype: "enum"
                        });
                        break;
                    case "type_check_list_item_assigned_to":
                        itemValue = values.items[values.getIndex(elt2.valueid)].content;
                        subvalue.push({
                            localid: elt2.localid,
                            valueid: elt2.valueid,
                            value: itemValue,
                            typeid: -8,
                            privtype: "users"
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
    var checkListValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function(elt){
        var tIndex = values.getIndex(elt.valueid);
        switch (elt.localid) {
            case "type_check_list_name":
                name_value = values.items[tIndex].content;
                checkListValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: name_value,
                    privtype: "string"
                });
                break;
            case "type_check_list_items":
                items_value = getItemList(EncodingClass.string.toVariable(values.items[tIndex].content));
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
                created_value = new Date(EncodingClass.string.toVariable(values.items[tIndex].content));
                checkListValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -4,
                    value: created_value,
                    privtype: "date"
                });
                break;
            case "type_check_list_user_created":
                user_created_value = values.items[tIndex].content;
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
    return {
        checkListValue: checkListValue,
        name_value: name_value,
        items_value: items_value,
        created_value: created_value,
        user_created_value: user_created_value
    };
};

theme.cardAddCheckListForm = function(params){
    var buttons = [], checklist_content, titles, vIndex, oIndex;
    var board, card, name, items, created, user_created;
    var name_value, items_value, created_value, user_created_value;
    var checkListValue = [];
    var index = params.typelists.getIndex(-25);
    var details = params.typelists.items[index].content.details;
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        checklist_content = theme.generateChecklistData(params.objects.items[oIndex].valueid, params.values);
        checkListValue = checklist_content.checkListValue;
        name_value = checklist_content.name_value;
        items_value = checklist_content.items_value;
        created_value = checklist_content.created_value;
        user_created_value = checklist_content.user_created_value;
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
                    user_created_value = systemconfig.userid;
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

    var saveFunc = function(promise){
        promise().then(function resolve(value){
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateChecklistData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++){
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            if (params.id > 0){
                var generateChecklistValueData = function(content, objid){
                    var value = [];
                    content.forEach(function(elt){
                        var subValue = {};
                        elt.value.forEach(function(item){
                            switch (item.localid) {
                                case "type_check_list_item_name":
                                    subValue.name = item.value;
                                    break;
                                case "type_check_list_item_index":
                                    subValue.index = item.value;
                                    break;
                                case "type_check_list_item_success":
                                    subValue.status = item.value;
                                    break;
                                case "type_check_list_item_due_date":
                                    subValue.due_date = item.value;
                                    break;
                                case "type_check_list_item_reminder":
                                    subValue.reminder = item.value;
                                    break;
                                case "type_check_list_item_assigned_to":
                                    subValue.assigned_to = item.value;
                                    break;
                            }
                        });
                        subValue.id = objid;
                        value.push(subValue);
                    });
                    return value;
                };
                var temp_content = generateChecklistValueData(checklist_content.items_value, checklist_content.id);
                var removeOldElt = function(ident, index){
                    var parent = absol.$(".card-activities-group-"+ident, activities_block);
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            if (index){
                                var tempElt = absol.$(".card-activity-view-content", elt);
                                if (tempElt.index == index) parent.activities_container.removeChild(elt);
                            }
                            else parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                        identArray = identArray.filter(function(elt){
                            return elt != parseInt(ident);
                        });
                    }
                }
                for (var i = 0; i < temp_content.length; i++){
                    if (temp_content[i].due_date.getTime() == 0) continue;
                    var ident;
                    if (temp_content[i].status) {
                        ident = "-1";
                    }
                    else {
                        if (theme.cardGetMillisecondsWithoutTime(temp_content[i].due_date) < toDay) {
                            ident = "-4";
                        }
                        else if (theme.cardGetMillisecondsWithoutTime(temp_content[i].due_date) == toDay) {
                            ident = "-3";
                        }
                        else {
                            ident = "-2";
                        }
                    }
                    removeOldElt(ident, temp_content[i].index);
                }
                removeOldElt(theme.cardGetMillisecondsWithoutTime(created_value));
            }
            var item = {};
            theme.cardActivityElt({
                src1: "icons/check_list.png",
                src2: "icons/check_list_complete.png",
                src3: "icons/check_list_delay.png",
                activity: "checklist",
                id: value.id,
                name: content.name_value,
                created: content.created_value,
                items_value: content.items_value,
                editFunc: params.editCheckListFunc
            }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
            var keys = Object.keys(item);
            for (var i = 0; i < keys.length; i++){
                var newParent = absol.$(".card-activities-group-"+keys[i], activities_block);
                if (!newParent){
                    var title, color;
                    switch (parseInt(keys[i])) {
                        case -3:
                            title = LanguageModule.text('txt_today');
                            color = '#ffa382';
                            break;
                        case -4:
                            title = LanguageModule.text('txt_overdue');
                            color = '#ffdad8';
                            break;
                        case -2:
                            title = LanguageModule.text('txt_plan');
                            color = '#fefac0';
                            break;
                        case -1:
                            title = LanguageModule.text('txt_complete');
                            color = '#bdf2a5';
                            break;
                        default:
                            title = contentModule.formatTimeDisplay(new Date(parseInt(keys[i])));
                            color = '#e4e1f5';
                    }
                    var x = absol._({
                        style: {
                            paddingTop: "20px",
                            paddingBottom: "20px"
                        }
                    });
                    var newParent = absol._({
                        class: "card-activities-group-"+keys[i],
                        child: [
                            {
                                style: {
                                    'font-weight': 'bold',
                                    'line-height': '30px',
                                    'margin-left': '26px',
                                    'text-align': 'center',
                                    'border': 'var(--control-border)',
                                    backgroundColor: color
                                },
                                child: {text: title}
                            },
                            x
                        ]
                    });
                    newParent.activities_container = x;
                    var maxIdent = Math.max(...identArray);
                    identArray.push(parseInt(keys[i]));
                    identArray.sort(function(a, b){
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    });
                    var index = identArray.indexOf(parseInt(keys[i]));
                    if (index == identArray.length - 1){
                        var className = ".card-activities-group-"+maxIdent;
                        var afterElt = absol.$(className, activities_block);
                    }
                    else {
                        var className = ".card-activities-group-"+identArray[index+1];
                        var afterElt = absol.$(className, activities_block);
                    }
                    activities_block.insertBefore(newParent, afterElt);
                    item[keys[i]].forEach(function(elt){
                        newParent.activities_container.addChild(elt);
                    });
                }
                else {
                    item[keys[i]].forEach(function(elt){
                        newParent.activities_container.insertBefore(elt, newParent.activities_container.childNodes[0]);
                    });
                }
            }
        }, function reject(message){
            if (message) ModalElement.alert({message: message});
        });
    };

    var deleteFunc = function(promise){
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_checklist");
        var message = LanguageModule.text("war_delete_checklist");
        theme.deleteConfirm(title, message).then(function rs(){
            promise().then(function resolve(value){
                var generateChecklistValueData = function(content, objid){
                    var value = [];
                    content.forEach(function(elt){
                        var subValue = {};
                        elt.value.forEach(function(item){
                            switch (item.localid) {
                                case "type_check_list_item_name":
                                    subValue.name = item.value;
                                    break;
                                case "type_check_list_item_index":
                                    subValue.index = item.value;
                                    break;
                                case "type_check_list_item_success":
                                    subValue.status = item.value;
                                    break;
                                case "type_check_list_item_due_date":
                                    subValue.due_date = item.value;
                                    break;
                                case "type_check_list_item_reminder":
                                    subValue.reminder = item.value;
                                    break;
                                case "type_check_list_item_assigned_to":
                                    subValue.assigned_to = item.value;
                                    break;
                            }
                        });
                        subValue.id = objid;
                        value.push(subValue);
                    });
                    return value;
                };
                var removeOldElt = function(ident){
                    var parent = absol.$(".card-activities-group-"+ident, activities_block);
                    if (!parent) return;
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                    }
                }
                while(params.frameList.getLength() > 2){
                    params.frameList.removeLast();
                }
                params.objects = value.objects;
                var activities_block = absol.$(".card-activities-block", params.frameList);
                var temp_content = generateChecklistValueData(checklist_content.items_value, checklist_content.id);
                for (var i = 0; i < temp_content.length; i++){
                    if (temp_content[i].due_date.getTime() == 0) continue;
                    var ident;
                    if (temp_content[i].status) {
                        ident = "-1";
                    }
                    else {
                        if (theme.cardGetMillisecondsWithoutTime(temp_content[i].due_date) < toDay) {
                            ident = "-4";
                        }
                        else if (theme.cardGetMillisecondsWithoutTime(temp_content[i].due_date) == toDay) {
                            ident = "-3";
                        }
                        else {
                            ident = "-2";
                        }
                    }
                    removeOldElt(ident);
                }
                removeOldElt(theme.cardGetMillisecondsWithoutTime(created_value));
            }, function reject(message){
                if (message) ModalElement.alert({message: message});
            });
        });
    };

    var company = absol._({});

    for (var i = 0; i < data_module.cardList[params.cardid].content.companies_card.length; i++){
        var index = data_module.companies.getIndex(data_module.cardList[params.cardid].content.companies_card[i].companyid);
        var company_classIndex = data_module.company_class.getIndex(data_module.companies.items[index].company_classid);
        var company_className = data_module.company_class.items[company_classIndex].name;
        company.addChild(absol._({
            style: {
                marginTop: i > 0 ? "20px" : "0px"
            },
            child: theme.input({
                type: 'text',
                style: {
                    width: "400px"
                },
                disabled: true,
                value: data_module.companies.items[index].name + " - " + company_className
            })
        }));
    }

    buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveButton({
                onclick: function(){
                    saveFunc(params.cmdButton.save);
                }
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveCloseButton({
                onclick: function(){
                    saveFunc(params.cmdButton.saveClose);
                }
            })
        })
    ];

    if (params.id) {
        buttons.push(absol._({
            class: "single-button-header",
            child: theme.deleteButton({
                onclick: function(){
                    deleteFunc(params.cmdButton.delete);
                }
            })
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

    items = theme.cardAddItemOfCheckListForm(params.typelists, params.users, systemconfig.userid, items_value);

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
                text: LanguageModule.text("txt_company")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [company]
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
                message: LanguageModule.text("war_no_work_name"),
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

theme.generateWaitData = function(valueid, values){
    var duration_value, message_value, created_value, user_created_value;
    var waitValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function(elt){
        var tIndex = values.getIndex(elt.valueid);
        switch (elt.localid) {
            case "type_wait_duration":
                duration_value = values.items[tIndex].numbercontent;
                waitValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -3,
                    value: duration_value,
                    privtype: "number"
                });
                break;
            case "type_wait_message":
                message_value = values.items[tIndex].content;
                waitValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -2,
                    value: message_value,
                    privtype: "note"
                });
                break;
            case "type_wait_created":
                created_value = new Date(values.items[tIndex].timecontent);
                waitValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -4,
                    value: created_value,
                    privtype: "date"
                });
                break;
            case "type_wait_user_created":
                user_created_value = values.items[tIndex].content;
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
    return {
        waitValue: waitValue,
        duration_value: duration_value,
        message_value: message_value,
        created_value: created_value,
        user_created_value: user_created_value
    };
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
        content = theme.generateWaitData(params.objects.items[oIndex].valueid, params.values);
        waitValue = content.waitValue;
        duration_value = content.duration_value;
        message_value = content.message_value;
        created_value = content.created_value;
        user_created_value = content.user_created_value;
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
                    user_created_value = systemconfig.userid;
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

    var saveFunc = function(promise){
        promise().then(function resolve(value){
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateWaitData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++){
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            var ident = theme.cardGetMillisecondsWithoutTime(created_value);
            var parent = absol.$(".card-activities-group-"+ident, activities_block);
            if (parent){
                absol.$('.card-activity-view-container', parent, function(elt){
                    if (elt.ident == value.id){
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0){
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function(elt){
                        return elt != parseInt(ident);
                    });
                }
            }
            var item = {};
            theme.cardActivityElt({
                src1: "icons/wait.png",
                src2: "icons/wait_complete.png",
                src3: "icons/wait_delay.png",
                activity: "wait",
                id: value.id,
                name: content.work_value,
                created: content.created_value,
                duration: content.duration_value,
                message: content.message_value,
                editFunc: params.editWaitFunc
            }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-"+keys[0], activities_block);
            if (!newParent){
                var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
                var color = '#e4e1f5';
                var x = absol._({
                    style: {
                        paddingTop: "20px",
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: "card-activities-group-"+keys[0],
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'margin-left': '26px',
                                'text-align': 'center',
                                'border': 'var(--control-border)',
                                backgroundColor: color
                            },
                            child: {text: title}
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                var maxIdent = Math.max(...identArray);
                identArray.push(parseInt(keys[0]));
                identArray.sort(function(a, b){
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1){
                    var className = ".card-activities-group-"+maxIdent;
                    var afterElt = absol.$(className, activities_block);
                }
                else {
                    var className = ".card-activities-group-"+identArray[index+1];
                    var afterElt = absol.$(className, activities_block);
                }
                activities_block.insertBefore(newParent, afterElt);
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container);
        }, function reject(message){
            if (message) ModalElement.alert({message: message});
        });
    };

    var deleteFunc = function(promise){
        var title = LanguageModule.text("txt_delete_wait");
        var message = LanguageModule.text("war_delete_wait");
        theme.deleteConfirm(title, message).then(function rs(){
            promise().then(function resolve(value){
                while(params.frameList.getLength() > 2){
                    params.frameList.removeLast();
                }
                params.objects = value.objects;
                var activities_block = absol.$(".card-activities-block", params.frameList);
                var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                var parent = absol.$(".card-activities-group-"+ident, activities_block);
                if (parent){
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                    }
                }
            }, function reject(message){
                if (message) ModalElement.alert({message: message});
            });
        });
    };

    buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveButton({
                onclick: function(){
                    saveFunc(params.cmdButton.save);
                }
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveCloseButton({
                onclick: function(){
                    saveFunc(params.cmdButton.saveClose);
                }
            })
        })
    ];

    if (params.id) {
        buttons.push(absol._({
            class: "single-button-header",
            child: theme.deleteButton({
                onclick: function(){
                    deleteFunc(params.cmdButton.delete);
                }
            })
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

    var company = absol._({});

    for (var i = 0; i < data_module.cardList[params.cardid].content.companies_card.length; i++){
        var index = data_module.companies.getIndex(data_module.cardList[params.cardid].content.companies_card[i].companyid);
        var company_classIndex = data_module.company_class.getIndex(data_module.companies.items[index].company_classid);
        var company_className = data_module.company_class.items[company_classIndex].name;
        company.addChild(absol._({
            style: {
                marginTop: i > 0 ? "20px" : "0px"
            },
            child: theme.input({
                type: 'text',
                style: {
                    width: "400px"
                },
                disabled: true,
                value: data_module.companies.items[index].name + " - " + company_className
            })
        }));
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
                text: LanguageModule.text("txt_company")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [company]
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

theme.generateCallData = function(valueid, values){
    var call_to_value, result_value, status_value, due_date_value, reminder_value, created_value, assigned_to_value, participant_value, work_value, user_created_value;
    var callValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function(elt){
        var tIndex = values.getIndex(elt.valueid);
        switch (elt.localid) {
            case "type_call_due_date":
                due_date_value = new Date(values.items[tIndex].timecontent);
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -5,
                    value: due_date_value,
                    privtype: "datetime"
                });
                break;
            case "type_call_reminder":
                reminder_value = values.items[tIndex].content;
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -17,
                    value: reminder_value,
                    privtype: "enum"
                });
                break;
            case "type_call_created":
                created_value = new Date(values.items[tIndex].timecontent);
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -4,
                    value: created_value,
                    privtype: "date"
                });
                break;
            case "type_call_call_to":
                call_to_value = values.items[tIndex].content;
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: call_to_value,
                    privtype: "string"
                });
                break;
            case "type_call_result":
                result_value = values.items[tIndex].content;
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -2,
                    value: result_value,
                    privtype: "note"
                });
                break;
            case "type_call_status":
                status_value = values.items[tIndex].content;
                status_value = status_value != "";
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -6,
                    value: status_value,
                    privtype: "boolean"
                });
                break;
            case "type_call_work":
                work_value = values.items[tIndex].content;
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: work_value,
                    privtype: "string"
                });
                break;
            case "type_call_assigned_to":
                assigned_to_value = values.items[tIndex].content;
                callValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -8,
                    value: assigned_to_value,
                    privtype: "user"
                });
                break;
            case "type_call_user_created":
                user_created_value = values.items[tIndex].content;
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
    return {
        callValue: callValue,
        due_date_value: due_date_value,
        reminder_value: reminder_value,
        created_value: created_value,
        call_to_value: call_to_value,
        result_value: result_value,
        status_value: status_value,
        work_value: work_value,
        assigned_to_value: assigned_to_value,
        user_created_value: user_created_value
    };
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
        content = theme.generateCallData(params.objects.items[oIndex].valueid, params.values);
        callValue = content.callValue;
        due_date_value = content.due_date_value;
        reminder_value = content.reminder_value;
        created_value = content.created_value;
        call_to_value = content.call_to_value;
        result_value = content.result_value;
        status_value = content.status_value;
        work_value = content.work_value;
        assigned_to_value = content.assigned_to_value;
        user_created_value = content.user_created_value;
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
                        privtype: "boolean"
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
                    assigned_to_value = systemconfig.userid;
                    callValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: assigned_to_value,
                        privtype: "user"
                    });
                    break;
                case "type_call_user_created":
                    user_created_value = systemconfig.userid;
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

    var saveFunc = function(promise){
        promise().then(function resolve(value){
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateCallData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++){
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            var ident;
            if (status_value) {
                ident = "-1";
            }
            else {
                if (theme.cardGetMillisecondsWithoutTime(due_date_value) < toDay) {
                    ident = "-4";
                }
                else if (theme.cardGetMillisecondsWithoutTime(due_date_value) == toDay) {
                    ident = "-3";
                }
                else {
                    ident = "-2";
                }
            }
            var parent = absol.$(".card-activities-group-"+ident, activities_block);
            if (parent){
                absol.$('.card-activity-view-container', parent, function(elt){
                    if (elt.ident == value.id){
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0){
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function(elt){
                        return elt != parseInt(ident);
                    });
                }
            }
            var item = {};
            theme.cardActivityElt({
                src1: "icons/call.png",
                src2: "icons/call_complete.png",
                src3: "icons/call_delay.png",
                activity: "call",
                id: value.id,
                name: content.work_value,
                call_date: content.due_date_value,
                status: content.status_value,
                editFunc: params.editCallFunc
            }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-"+keys[0], activities_block);
            if (!newParent){
                var title, color;
                switch (parseInt(keys[0])) {
                    case -3:
                        title = LanguageModule.text('txt_today');
                        color = '#ffa382';
                        break;
                    case -4:
                        title = LanguageModule.text('txt_overdue');
                        color = '#ffdad8';
                        break;
                    case -2:
                        title = LanguageModule.text('txt_plan');
                        color = '#fefac0';
                        break;
                    case -1:
                        title = LanguageModule.text('txt_complete');
                        color = '#bdf2a5';
                        break;
                    default:
                }
                var x = absol._({
                    style: {
                        paddingTop: "20px",
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: "card-activities-group-"+keys[0],
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'margin-left': '26px',
                                'text-align': 'center',
                                'border': 'var(--control-border)',
                                backgroundColor: color
                            },
                            child: {text: title}
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                identArray.push(parseInt(keys[0]));
                identArray.sort(function(a, b){
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1){
                    newParent.addTo(activities_block);
                }
                else {
                    var className = ".card-activities-group-"+identArray[index+1];
                    var afterElt = absol.$(className, activities_block);
                    activities_block.insertBefore(newParent, afterElt);
                }
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message){
            if (message) ModalElement.alert({message: message});
        });
    };

    var deleteFunc = function(promise){
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_call");
        var message = LanguageModule.text("war_delete_call");
        theme.deleteConfirm(title, message).then(function rs(){
            promise().then(function resolve(value){
                while(params.frameList.getLength() > 2){
                    params.frameList.removeLast();
                }
                params.objects = value.objects;
                var activities_block = absol.$(".card-activities-block", params.frameList);
                var ident;
                if (status_value) {
                    ident = "-1";
                }
                else {
                    if (theme.cardGetMillisecondsWithoutTime(due_date_value) < toDay) {
                        ident = "-4";
                    }
                    else if (theme.cardGetMillisecondsWithoutTime(due_date_value) == toDay) {
                        ident = "-3";
                    }
                    else {
                        ident = "-2";
                    }
                }
                var parent = absol.$(".card-activities-group-"+ident, activities_block);
                if (parent){
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                    }
                }
            }, function reject(message){
                if (message) ModalElement.alert({message: message});
            });
        });
    };

    buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveButton({
                onclick: function(){
                    saveFunc(params.cmdButton.save);
                }
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveCloseButton({
                onclick: function(){
                    saveFunc(params.cmdButton.saveClose);
                }
            })
        })
    ];

    if (params.id) {
        buttons.push(absol._({
            class: "single-button-header",
            child: theme.deleteButton({
                onclick: function(){
                    deleteFunc(params.cmdButton.delete);
                }
            })
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

    var company = absol._({});

    for (var i = 0; i < data_module.cardList[params.cardid].content.companies_card.length; i++){
        var index = data_module.companies.getIndex(data_module.cardList[params.cardid].content.companies_card[i].companyid);
        var company_classIndex = data_module.company_class.getIndex(data_module.companies.items[index].company_classid);
        var company_className = data_module.company_class.items[company_classIndex].name;
        company.addChild(absol._({
            style: {
                marginTop: i > 0 ? "20px" : "0px"
            },
            child: theme.input({
                type: 'text',
                style: {
                    width: "400px"
                },
                disabled: true,
                value: data_module.companies.items[index].name + " - " + company_className
            })
        }));
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
                text: LanguageModule.text("txt_company")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [company]
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
                text: LanguageModule.text("txt_complete")
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

theme.generateTaskData = function(valueid, values){
    var work_value, result_value, status_value, due_date_value, reminder_value, created_value, assigned_to_value, participant_value, user_created_value;
    var taskValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function(elt){
        var tIndex = values.getIndex(elt.valueid);
        switch (elt.localid) {
            case "type_task_due_date":
                due_date_value = new Date(values.items[tIndex].timecontent);
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -5,
                    value: due_date_value,
                    privtype: "datetime"
                });
                break;
            case "type_task_reminder":
                reminder_value = values.items[tIndex].content;
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -17,
                    value: reminder_value,
                    privtype: "enum"
                });
                break;
            case "type_task_created":
                created_value = new Date(values.items[tIndex].timecontent);
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -4,
                    value: created_value,
                    privtype: "date"
                });
                break;
            case "type_task_work":
                work_value = values.items[tIndex].content;
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: work_value,
                    privtype: "string"
                });
                break;
            case "type_task_result":
                result_value = values.items[tIndex].content;
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -2,
                    value: result_value,
                    privtype: "note"
                });
                break;
            case "type_task_status":
                status_value = values.items[tIndex].content;
                status_value = status_value != "";
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -6,
                    value: status_value,
                    privtype: "boolean"
                });
                break;
            case "type_task_assigned_to":
                assigned_to_value = values.items[tIndex].content;
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -8,
                    value: assigned_to_value,
                    privtype: "user"
                });
                break;
            case "type_task_participant":
                participant_value = EncodingClass.string.toVariable(values.items[tIndex].content);
                taskValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -9,
                    value: participant_value,
                    privtype: "userlist"
                });
                break;
            case "type_task_user_created":
                user_created_value = values.items[tIndex].content;
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
    return {
        taskValue: taskValue,
        due_date_value: due_date_value,
        reminder_value: reminder_value,
        created_value: created_value,
        work_value: work_value,
        result_value: result_value,
        status_value: status_value,
        assigned_to_value: assigned_to_value,
        participant_value: participant_value,
        user_created_value: user_created_value
    };
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
        content = theme.generateTaskData(params.objects.items[oIndex].valueid, params.values);
        taskValue = content.taskValue;
        due_date_value = content.due_date_value;
        reminder_value = content.reminder_value;
        created_value = content.created_value;
        work_value = content.work_value;
        result_value = content.result_value;
        status_value = content.status_value;
        assigned_to_value = content.assigned_to_value;
        participant_value = content.participant_value;
        user_created_value = content.user_created_value;
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
                        privtype: "boolean"
                    });
                    break;
                case "type_task_assigned_to":
                    assigned_to_value = systemconfig.userid;
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
                    user_created_value = systemconfig.userid;
                    console.log(user_created_value);
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

    var saveFunc = function(promise){
        promise().then(function resolve(value){
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateTaskData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++){
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            var ident;
            if (status_value) {
                ident = "-1";
            }
            else {
                if (theme.cardGetMillisecondsWithoutTime(due_date_value) < toDay) {
                    ident = "-4";
                }
                else if (theme.cardGetMillisecondsWithoutTime(due_date_value) == toDay) {
                    ident = "-3";
                }
                else {
                    ident = "-2";
                }
            }
            var parent = absol.$(".card-activities-group-"+ident, activities_block);
            if (parent){
                absol.$('.card-activity-view-container', parent, function(elt){
                    if (elt.ident == value.id){
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0){
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function(elt){
                        return elt != parseInt(ident);
                    });
                }
            }
            var item = {};
            theme.cardActivityElt({
                src1: "icons/task.png",
                src2: "icons/task_complete.png",
                src3: "icons/task_delay.png",
                activity: "task",
                id: value.id,
                name: content.work_value,
                due_date: content.due_date_value,
                status: content.status_value,
                editFunc: params.editTaskFunc
            }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-"+keys[0], activities_block);
            if (!newParent){
                var title, color;
                switch (parseInt(keys[0])) {
                    case -3:
                        title = LanguageModule.text('txt_today');
                        color = '#ffa382';
                        break;
                    case -4:
                        title = LanguageModule.text('txt_overdue');
                        color = '#ffdad8';
                        break;
                    case -2:
                        title = LanguageModule.text('txt_plan');
                        color = '#fefac0';
                        break;
                    case -1:
                        title = LanguageModule.text('txt_complete');
                        color = '#bdf2a5';
                        break;
                    default:
                }
                var x = absol._({
                    style: {
                        paddingTop: "20px",
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: "card-activities-group-"+keys[0],
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'margin-left': '26px',
                                'text-align': 'center',
                                'border': 'var(--control-border)',
                                backgroundColor: color
                            },
                            child: {text: title}
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                identArray.push(parseInt(keys[0]));
                identArray.sort(function(a, b){
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1){
                    newParent.addTo(activities_block);
                }
                else {
                    var className = ".card-activities-group-"+identArray[index+1];
                    var afterElt = absol.$(className, activities_block);
                    activities_block.insertBefore(newParent, afterElt);
                }
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message){
            if (message) ModalElement.alert({message: message});
        });
    };

    var deleteFunc = function(promise){
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_task");
        var message = LanguageModule.text("war_delete_task");
        theme.deleteConfirm(title, message).then(function rs(){
            promise().then(function resolve(value){
                while(params.frameList.getLength() > 2){
                    params.frameList.removeLast();
                }
                params.objects = value.objects;
                var activities_block = absol.$(".card-activities-block", params.frameList);
                var ident;
                if (status_value) {
                    ident = "-1";
                }
                else {
                    if (theme.cardGetMillisecondsWithoutTime(due_date_value) < toDay) {
                        ident = "-4";
                    }
                    else if (theme.cardGetMillisecondsWithoutTime(due_date_value) == toDay) {
                        ident = "-3";
                    }
                    else {
                        ident = "-2";
                    }
                }
                var parent = absol.$(".card-activities-group-"+ident, activities_block);
                if (parent){
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                    }
                }
            }, function reject(message){
                if (message) ModalElement.alert({message: message});
            });
        });
    };

    buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveButton({
                onclick: function(){
                    saveFunc(params.cmdButton.save);
                }
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveCloseButton({
                onclick: function(){
                    saveFunc(params.cmdButton.saveClose);
                }
            })
        })
    ];

    if (params.id) {
        buttons.push(absol._({
            class: "single-button-header",
            child: theme.deleteButton({
                onclick: function(){
                    deleteFunc(params.cmdButton.delete);
                }
            })
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

    var company = absol._({});

    for (var i = 0; i < data_module.cardList[params.cardid].content.companies_card.length; i++){
        var index = data_module.companies.getIndex(data_module.cardList[params.cardid].content.companies_card[i].companyid);
        var company_classIndex = data_module.company_class.getIndex(data_module.companies.items[index].company_classid);
        var company_className = data_module.company_class.items[company_classIndex].name;
        company.addChild(absol._({
            style: {
                marginTop: i > 0 ? "20px" : "0px"
            },
            child: theme.input({
                type: 'text',
                style: {
                    width: "400px"
                },
                disabled: true,
                value: data_module.companies.items[index].name + " - " + company_className
            })
        }));
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

    status = absol._({
        tag: "checkbox",
        props: {
            checked: status_value
        }
    });

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
                text: LanguageModule.text("txt_company")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [company]
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
                text: LanguageModule.text("txt_complete")
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

theme.generateMeetingData = function(valueid, values){
    var location_value, result_value, status_value, type_value, start_date_value, reminder_value, created_value, assigned_to_value, participant_value, user_created_value, end_date_value, all_day_value, name_value;
    var meetingValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function(elt){
        var tIndex = values.getIndex(elt.valueid);
        switch (elt.localid) {
            case "type_meeting_name":
                name_value = values.items[tIndex].content;
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: name_value,
                    privtype: "string"
                });
                break;
            case "type_meeting_start_date":
                start_date_value = new Date(values.items[tIndex].timecontent);
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -5,
                    value: start_date_value,
                    privtype: "datetime"
                });
                break;
            case "type_meeting_reminder":
                reminder_value = values.items[tIndex].content;
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -17,
                    value: reminder_value,
                    privtype: "enum"
                });
                break;
            case "type_meeting_created":
                created_value = new Date(values.items[tIndex].timecontent);
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -4,
                    value: created_value,
                    privtype: "date"
                });
                break;
            case "type_meeting_location":
                location_value = values.items[tIndex].content;
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: location_value,
                    privtype: "string"
                });
                break;
            case "type_meeting_result":
                result_value = values.items[tIndex].content;
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -2,
                    value: result_value,
                    privtype: "note"
                });
                break;
            case "type_meeting_status":
                status_value = values.items[tIndex].content;
                status_value = status_value != "";
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -6,
                    value: status_value,
                    privtype: "boolean"
                });
                break;
            case "type_meeting_type":
                type_value = values.items[tIndex].content;
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -19,
                    value: type_value,
                    privtype: "enum"
                });
                break;
            case "type_meeting_assigned_to":
                assigned_to_value = values.items[tIndex].content;
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -8,
                    value: assigned_to_value,
                    privtype: "user"
                });
                break;
            case "type_meeting_participant":
                participant_value = EncodingClass.string.toVariable(values.items[tIndex].content);
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -9,
                    value: participant_value,
                    privtype: "userlist"
                });
                break;
            case "type_meeting_user_created":
                user_created_value = values.items[tIndex].content;
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -8,
                    value: user_created_value,
                    privtype: "user"
                });
                break;
            case "type_meeting_end_date":
                end_date_value = new Date(values.items[tIndex].timecontent);
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -5,
                    value: end_date_value,
                    privtype: "datetime"
                });
                break;
            case "type_meeting_all_day":
                all_day_value = values.items[tIndex].content;
                all_day_value = all_day_value != "";
                meetingValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -6,
                    value: all_day_value,
                    privtype: "boolean"
                });
                break;
        }
    });
    return {
        meetingValue: meetingValue,
        name_value: name_value,
        start_date_value: start_date_value,
        reminder_value: reminder_value,
        location_value: location_value,
        result_value: result_value,
        status_value: status_value,
        type_value: type_value,
        created_value: created_value,
        assigned_to_value: assigned_to_value,
        participant_value: participant_value,
        user_created_value: user_created_value,
        end_date_value: end_date_value,
        all_day_value: all_day_value
    };
};

theme.cardAddMeetingForm = function(params){
    var buttons = [], content, titles, vIndex, oIndex;
    var board, card, location, result, status, type, start_date, reminder, assigned_to, participant, created, user_created, end_date, all_day, name;
    var location_value, result_value, status_value, type_value, start_date_value, reminder_value, created_value, assigned_to_value, participant_value, user_created_value, end_date_value, all_day_value, name_value;
    var meetingValue = [];
    var index = params.typelists.getIndex(-20);
    var details = params.typelists.items[index].content.details;
    if (params.id > 0) {
        oIndex = params.objects.getIndex(params.id);
        content = theme.generateMeetingData(params.objects.items[oIndex].valueid, params.values);
        meetingValue = content.meetingValue;
        name_value = content.name_value;
        start_date_value = content.start_date_value;
        reminder_value = content.reminder_value;
        location_value = content.location_value;
        result_value = content.result_value;
        status_value = content.status_value;
        type_value = content.type_value;
        created_value = content.created_value;
        assigned_to_value = content.assigned_to_value;
        participant_value = content.participant_value;
        user_created_value = content.user_created_value;
        end_date_value = content.end_date_value;
        all_day_value = content.all_day_value;
    }
    else {
        vIndex = -1;
        details.forEach(function(elt){
            switch (elt.localid) {
                case "type_meeting_name":
                    name_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -1,
                        value: name_value,
                        privtype: "string"
                    });
                    break;
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
                        privtype: "boolean"
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
                    assigned_to_value = systemconfig.userid;
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
                    user_created_value = systemconfig.userid;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -8,
                        value: user_created_value,
                        privtype: "user"
                    });
                    break;
                case "type_meeting_end_date":
                    end_date_value = new Date();
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -5,
                        value: end_date_value,
                        privtype: "datetime"
                    });
                    break;
                case "type_meeting_all_day":
                    all_day_value = elt.default;
                    meetingValue.push({
                        localid: elt.localid,
                        valueid: 0,
                        typeid: -6,
                        value: all_day_value,
                        privtype: "boolean"
                    });
                    break;
            }
        });
    }

    var saveFunc = function(promise){
        promise().then(function resolve(value){
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateMeetingData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++){
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            var ident;
            if (status_value) {
                ident = "-1";
            }
            else {
                if (theme.cardGetMillisecondsWithoutTime(start_date_value) < toDay) {
                    ident = "-4";
                }
                else if (theme.cardGetMillisecondsWithoutTime(start_date_value) == toDay) {
                    ident = "-3";
                }
                else {
                    ident = "-2";
                }
            }
            var parent = absol.$(".card-activities-group-"+ident, activities_block);
            if (parent){
                absol.$('.card-activity-view-container', parent, function(elt){
                    if (elt.ident == value.id){
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0){
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function(elt){
                        return elt != parseInt(ident);
                    });
                }
            }
            var item = {};
            theme.cardActivityElt({
                src1: "icons/meeting.png",
                src2: "icons/meeting_complete.png",
                src3: "icons/meeting_delay.png",
                activity: "meeting",
                id: value.id,
                name: content.name_value,
                start_date: content.start_date_value,
                end_date: content.end_date_value,
                all_day: content.all_day_value,
                status: content.status_value,
                editFunc: params.editMeetingFunc
            }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-"+keys[0], activities_block);
            if (!newParent){
                var title, color;
                switch (parseInt(keys[0])) {
                    case -3:
                        title = LanguageModule.text('txt_today');
                        color = '#ffa382';
                        break;
                    case -4:
                        title = LanguageModule.text('txt_overdue');
                        color = '#ffdad8';
                        break;
                    case -2:
                        title = LanguageModule.text('txt_plan');
                        color = '#fefac0';
                        break;
                    case -1:
                        title = LanguageModule.text('txt_complete');
                        color = '#bdf2a5';
                        break;
                    default:
                }
                var x = absol._({
                    style: {
                        paddingTop: "20px",
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: "card-activities-group-"+keys[0],
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'margin-left': '26px',
                                'text-align': 'center',
                                'border': 'var(--control-border)',
                                backgroundColor: color
                            },
                            child: {text: title}
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                identArray.push(parseInt(keys[0]));
                identArray.sort(function(a, b){
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1){
                    newParent.addTo(activities_block);
                }
                else {
                    var className = ".card-activities-group-"+identArray[index+1];
                    var afterElt = absol.$(className, activities_block);
                    activities_block.insertBefore(newParent, afterElt);
                }
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message){
            if (message) ModalElement.alert({message: message});
        });
    };

    var deleteFunc = function(promise){
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_meeting");
        var message = LanguageModule.text("war_delete_meeting");
        theme.deleteConfirm(title, message).then(function rs(){
            promise().then(function resolve(value){
                while(params.frameList.getLength() > 2){
                    params.frameList.removeLast();
                }
                params.objects = value.objects;
                var activities_block = absol.$(".card-activities-block", params.frameList);
                var ident;
                if (status_value) {
                    ident = "-1";
                }
                else {
                    if (theme.cardGetMillisecondsWithoutTime(start_date_value) < toDay) {
                        ident = "-4";
                    }
                    else if (theme.cardGetMillisecondsWithoutTime(start_date_value) == toDay) {
                        ident = "-3";
                    }
                    else {
                        ident = "-2";
                    }
                }
                var parent = absol.$(".card-activities-group-"+ident, activities_block);
                if (parent){
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                    }
                }
            }, function reject(message){
                if (message) ModalElement.alert({message: message});
            });
        });
    };

    var company = absol._({});

    for (var i = 0; i < data_module.cardList[params.cardid].content.companies_card.length; i++){
        var index = data_module.companies.getIndex(data_module.cardList[params.cardid].content.companies_card[i].companyid);
        var company_classIndex = data_module.company_class.getIndex(data_module.companies.items[index].company_classid);
        var company_className = data_module.company_class.items[company_classIndex].name;
        company.addChild(absol._({
            style: {
                marginTop: i > 0 ? "20px" : "0px"
            },
            child: theme.input({
                type: 'text',
                style: {
                    width: "400px"
                },
                disabled: true,
                value: data_module.companies.items[index].name + " - " + company_className
            })
        }));
    }

    buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveButton({
                onclick: function(){
                    saveFunc(params.cmdButton.save);
                }
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveCloseButton({
                onclick: function(){
                    saveFunc(params.cmdButton.saveClose);
                }
            })
        })
    ];

    if (params.id) {
        buttons.push(absol._({
            class: "single-button-header",
            child: theme.deleteButton({
                onclick: function(){
                    deleteFunc(params.cmdButton.delete);
                }
            })
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

    status = absol._({
        tag: "checkbox",
        props: {
            checked: status_value
        }
    });

    var st = absol._({});
    all_day = absol._({
        style: {
            display: "inline-block",
            paddingLeft: "var(--control-horizontal-distance-2)"
        },
        tag: "checkbox",
        props: {
            checked: all_day_value,
            text: LanguageModule.text("txt_all_day")
        },
        on: {
            change: function(){
                var self = this;
                absol.$(".card-meeting-time-elt", st, function(elt){
                    elt.disabled = self.checked;
                });
            }
        }
    });

    type = theme.cardGenerateEnumElt(-19, params.typelists, type_value);

    assigned_to = theme.cardGenerateUserElt(params.users, assigned_to_value);

    participant = theme.cardGenerateUserListElt(params.users, participant_value);
    var start_date_change = function(){
        var startValue = start_date.getValue();
        if (startValue.getTime() > start_date.oldValue.getTime()){
            var endValue = end_date.getValue();
            end_date.dateElt.value = new Date((startValue.getTime() - start_date.oldValue.getTime()) + endValue.getTime());
            end_date.timeElt.dayOffset = new Date((startValue.getTime() - start_date.oldValue.getTime()) + endValue.getTime());
        }
        start_date.oldValue = startValue;
    };

    var end_date_change = function(){
        var endValue = end_date.getValue();
        if (endValue.getTime() < end_date.oldValue.getTime()){
            var startValue = start_date.getValue();
            start_date.dateElt.value = new Date(startValue.getTime() - (end_date.oldValue.getTime() - endValue.getTime()));
            start_date.timeElt.dayOffset = new Date(startValue.getTime() - (end_date.oldValue.getTime() - endValue.getTime()));
        }
        end_date.oldValue = endValue;
    };

    start_date = theme.cardGenerateDateTimeElt(start_date_value);
    start_date.dateElt.on("change", start_date_change);
    start_date.timeElt.on("change", start_date_change);
    start_date.childNodes[1].addClass("card-meeting-time-elt");
    start_date.style.display = "inline-block";

    end_date = theme.cardGenerateDateTimeElt(end_date_value);
    end_date.timeElt.on("change", end_date_change);
    end_date.dateElt.on("change", end_date_change);
    end_date.childNodes[1].addClass("card-meeting-time-elt");

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
                text: LanguageModule.text("txt_company")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [company]
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
                text: LanguageModule.text("txt_meeting_name")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
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
                text: LanguageModule.text("txt_complete")
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
                children: [start_date, all_day]
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
                text: LanguageModule.text("txt_end_date")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [end_date]
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
    st.addChild(absol._({
        style: {
            display: "inline-block",
            verticalAlign: "top",
            marginRight: "20px",
            marginBottom: "20px"
        },
        child: DOMElement.table({data: leftData})
    }));
    st.addChild(absol._({
        style: {
            display: "inline-block",
            verticalAlign: "top"
        },
        child: DOMElement.table({data: rightData})
    }));
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
        var name_value, location_value, result_value, status_value, type_value, start_date_value, reminder_value, assigned_to_value, participant_value;
        name_value = name.value.trim();
        if (name_value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function(){
                    name.focus();
                }
            });
            return false;
        }
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
        end_date_value = end_date.getValue();
        reminder_value = reminder.value;
        assigned_to_value = assigned_to.value;
        participant_value = participant.values;
        meetingValue.forEach(function(elt){
            switch (elt.localid) {
                case "type_meeting_name":
                    elt.value = name_value;
                    break;
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
                case "type_meeting_end_date":
                    elt.value = end_date_value;
                    break;
                case "type_meeting_all_day":
                    elt.value = all_day_value;
                    break;
                default:
            }
        });
        return meetingValue;
    };
    return returnData;
};

theme.generateNoteData = function(valueid, values){
    var work_value, note_value, created_value, user_created_value;
    var noteValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function(elt){
        var tIndex = values.getIndex(elt.valueid);
        switch (elt.localid) {
            case "type_note_work":
                work_value = values.items[tIndex].content;
                noteValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: work_value,
                    privtype: "string"
                });
                break;
            case "type_note_note":
                note_value = values.items[tIndex].content;
                noteValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -2,
                    value: note_value,
                    privtype: "note"
                });
                break;
            case "type_note_created":
                created_value = new Date(values.items[tIndex].timecontent);
                noteValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: created_value,
                    privtype: "date"
                });
                break;
            case "type_note_user_created":
                user_created_value = values.items[tIndex].content;
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
    return {
        noteValue: noteValue,
        work_value: work_value,
        note_value: note_value,
        created_value: created_value,
        user_created_value: user_created_value,
    };
};

theme.cardAddFileForm = function(params){
    params.inputIdBoxes = {};
    var redrawFileObject = function(){
        var activities_block = absol.$(".card-activities-block", params.frameList);
        var identArray = [];
        for (var i = 0; i < activities_block.childNodes.length; i++){
            if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
        }
        if (params.type = "new"){
            params.created_value = new Date();
        }
        else {
            params.created_value = params.fileList[0].time;
        }
        var ident = theme.cardGetMillisecondsWithoutTime(params.created_value);
        var parent = absol.$(".card-activities-group-"+ident, activities_block);
        if (parent){
            absol.$('.card-activity-view-container', parent, function(elt){
                if (elt.ident == "file_" + ident){
                    parent.activities_container.removeChild(elt);
                }
            });
            if (parent.activities_container.childNodes.length == 0){
                activities_block.removeChild(parent);
                identArray = identArray.filter(function(elt){
                    return elt != parseInt(ident);
                });
            }
        }
        if (params.fileList.length == 0) return;
        var item = {};
        theme.cardActivityElt({
            id: "file_" + theme.cardGetMillisecondsWithoutTime(params.created_value),
            src1: "icons/file.png",
            activity: "file",
            listFile: params.listFileToday.concat(params.fileList),
            created: params.created_value,
            editFunc: params.editFileFunc
        }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
        var keys = Object.keys(item);
        var newParent = absol.$(".card-activities-group-"+keys[0], activities_block);
        if (!newParent){
            var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
            var color = '#e4e1f5';
            var x = absol._({
                style: {
                    paddingTop: "20px",
                    paddingBottom: "20px"
                }
            });
            var newParent = absol._({
                class: "card-activities-group-"+keys[0],
                child: [
                    {
                        style: {
                            'font-weight': 'bold',
                            'line-height': '30px',
                            'margin-left': '26px',
                            'text-align': 'center',
                            'border': 'var(--control-border)',
                            backgroundColor: color
                        },
                        child: {text: title}
                    },
                    x
                ]
            });
            newParent.activities_container = x;
            var maxIdent = Math.max(...identArray);
            identArray.push(parseInt(keys[0]));
            identArray.sort(function(a, b){
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            });
            var index = identArray.indexOf(parseInt(keys[0]));
            if (index == identArray.length - 1){
                var className = ".card-activities-group-"+maxIdent;
                var afterElt = absol.$(className, activities_block);
            }
            else {
                var className = ".card-activities-group-"+identArray[index+1];
                var afterElt = absol.$(className, activities_block);
            }
            activities_block.insertBefore(newParent, afterElt);
            newParent.activities_container.addChild(item[keys[0]][0]);
        }
        else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
    };
    var deleteTitleConfirm = function(fileData){
        ModalElement.question({
            title: LanguageModule.text("war_tit_delete_file"),
            message: LanguageModule.text2("war_txt_delete_file", [fileData.title]),
            onclick: function(sel){
                if (sel == 0){
                    deleteTitle(fileData);
                }
            }
        });
    };
    var deleteTitle = function(fileData){
        params.deleteFunc(fileData).then(function(values){
            for (var i = 0; i < params.fileList.length; i++){
                if (params.fileList[i].id == fileData.id) {
                    params.fileList.splice(i, 1);
                    break;
                }
            }
            redrawFileObject();
            params.inputIdBoxes["file_elt_"+fileData.id].style.display = "none";
        });
    };
    var saveTitle = function(title_inputtext, titleElt, fileData){
        var title = title_inputtext.value.trim();
        if (title == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function(){
                    title_inputtext.focus();
                }
            });
            return;
        }
        params.saveFunc(fileData, title).then(function(values){
            ModalElement.close(1);
            DOMElement.removeAllChildren(titleElt);
            titleElt.appendChild(DOMElement.span({text: title}));
            fileData.title = title;
            redrawFileObject();
        });
    };
    var editTitle = function(titleElt, fileData){
        var title_inputtext = theme.input({
            style: {
                width: "300px"
            },
            onkeydown: function(event){
                if (event.keyCode == 13) saveTitle(this, titleElt, fileData);
            },
            value: fileData.title
        });
        ModalElement.showWindow({
            index: 1,
            title: LanguageModule.text("txt_edit_file_title"),
            bodycontent: DOMElement.div({
                children: [
                    DOMElement.div({
                        text: LanguageModule.text("txt_file_title")
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                paddingTop: "20px",
                                paddingBottom: "10px"
                            }
                        },
                        children: [title_inputtext]
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                textAlign: "center",
                                whiteSpace: "nowrap"
                            }
                        },
                        children: [
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        verticalAlign: "middle",
                                        display: "inline-block",
                                        padding: "10px"
                                    }
                                },
                                children: [theme.noneIconButton({
                                    text: LanguageModule.text("txt_save"),
                                    onclick: function(){
                                        saveTitle(title_inputtext, titleElt, fileData);
                                    }
                                })]
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        verticalAlign: "middle",
                                        display: "inline-block",
                                        padding: "5px"
                                    }
                                },
                                children: [theme.noneIconButton({
                                    text: LanguageModule.text("txt_cancel"),
                                    onclick: function(){
                                        ModalElement.close(1);
                                    }
                                })]
                            })
                        ]
                    })
                ]
            })
        });
        title_inputtext.focus();
    };
    var redrawFileList = function(){
        var elt, typeFile;
        var isDelete;
        var childFiles = [], suffFile, fileIcon, titleElt;
        for (var i = 0; i < params.fileList.length; i++){
            titleElt = DOMElement.td({children: [DOMElement.span({text: params.fileList[i].title})]});
            isDelete = false;
            if (params.userid == params.fileList[i].userid) isDelete = true;
            else if (params.fileList[i].type == "card"){
                if (params.privAdmin) isDelete = true;
            }
            if (params.fileList[i].content_type == "file"){
                suffFile = params.fileList[i].filename.split('.').pop();
                if (contentModule.listSuffFiles.indexOf(suffFile) >= 0){
                    fileIcon = suffFile + ".svg";
                }
                else {
                    fileIcon = "default.svg";
                }
                params.inputIdBoxes["file_elt_" + params.fileList[i].id] = DOMElement.tr({
                    children: [
                        DOMElement.a({
                            attrs: {
                                href: "./uploads/files/" + params.fileList[i].id + "_" + params.fileList[i].filename + ".upload",
                                download: params.fileList[i].filename,
                                style: {
                                    cursor: "pointer",
                                    margin: "10px",
                                    color: "black",
                                    textDecoration: "none"
                                }
                            },
                            children: [DOMElement.table({
                                data: [[
                                    DOMElement.div({
                                        attrs: {
                                            style: {
                                                height: "80px",
                                                width: "112px",
                                                border: "1px solid #d6d6d6",
                                                backgroundColor: "rgb(255, 255, 255)",
                                                textAlign: "center",
                                                verticalAlign: "middle",
                                                display: "table-cell"
                                            }
                                        },
                                        children: [DOMElement.img({
                                            attrs: {
                                                src: "../../vivid_exticons/" + fileIcon,
                                                style: {
                                                    maxHeight: "60px",
                                                    maxWidth: "92px"
                                                }
                                            }
                                        })]
                                    }),
                                    {attrs: {style: {width: "20px"}}},
                                    titleElt
                                ]]
                            })]
                        }),
                        {attrs: {style: {width: "10px"}}},
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-cover",
                                style: {
                                    marginRight: "var(--control-horizontal-distance-1)"
                                },
                                onclick: function(titleElt, fileData){
                                    return function(){
                                        editTitle(titleElt, fileData);
                                    }
                                }(titleElt, params.fileList[i])
                            },
                            children: [DOMElement.i({
                                attrs: {
                                    className: "material-icons bsc-icon-hover-black"
                                },
                                text: "create"
                            })]
                        }),
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-remove-cover",
                                style: {
                                    display: (isDelete)? "" : "none"
                                },
                                onclick: function(fileData){
                                    return function(){
                                        deleteTitleConfirm(fileData);
                                    }
                                }(params.fileList[i])
                            },
                            children: [DOMElement.i({
                                attrs: {
                                    className: "material-icons card-icon-remove"
                                },
                                text: "remove_circle"
                            })]
                        })
                    ]
                })
                childFiles.push(params.inputIdBoxes["file_elt_" + params.fileList[i].id]);
            }
            else {
                params.inputIdBoxes["file_elt_" + params.fileList[i].id] = DOMElement.tr({
                    children: [
                        DOMElement.a({
                            attrs: {
                                style: {
                                    cursor: "pointer",
                                    margin: "10px",
                                    color: "black",
                                    textDecoration: "none"
                                },
                                onclick: function(imagesList, id){
                                    return function(event, me){
                                        document.body.appendChild(descViewImagePreview(imagesList, id));
                                    }
                                }(params.imagesList, params.fileList[i].id)
                            },
                            children: [DOMElement.table({
                                data: [[
                                    DOMElement.div({
                                        attrs: {
                                            style: {
                                                height: "80px",
                                                width: "112px",
                                                border: "1px solid #d6d6d6",
                                                backgroundColor: "rgb(255, 255, 255)",
                                                textAlign: "center",
                                                verticalAlign: "middle",
                                                display: "table-cell"
                                            }
                                        },
                                        children: [DOMElement.img({
                                            attrs: {
                                                src: params.fileList[i].src,
                                                style: {
                                                    maxHeight: "60px",
                                                    maxWidth: "92px"
                                                }
                                            }
                                        })]
                                    }),
                                    {attrs: {style: {width: "20px"}}},
                                    titleElt
                                ]]
                            })]
                        }),
                        {attrs: {style: {width: "10px"}}},
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-cover",
                                style: {
                                    marginRight: "var(--control-horizontal-distance-1)"
                                },
                                onclick: function(titleElt, fileData){
                                    return function(){
                                        editTitle(titleElt, fileData);
                                    }
                                }(titleElt, params.fileList[i])
                            },
                            children: [DOMElement.i({
                                attrs: {
                                    className: "material-icons bsc-icon-hover-black"
                                },
                                text: "create"
                            })]
                        }),
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-remove-cover",
                                style: {
                                    display: (isDelete)? "" : "none"
                                },
                                onclick: function(fileData){
                                    return function(){
                                        deleteTitleConfirm(fileData);
                                    }
                                }(params.fileList[i])
                            },
                            children: [DOMElement.i({
                                attrs: {
                                    className: "material-icons card-icon-remove"
                                },
                                text: "remove_circle"
                            })]
                        })
                    ]
                });
                childFiles.push(params.inputIdBoxes["file_elt_" + params.fileList[i].id]);
            }
        }
        DOMElement.removeAllChildren(listFileElt);
        listFileElt.appendChild(DOMElement.table({
            data: childFiles
        }));
    };
    var buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        })
    ];
    var contentChild = [
        {
            class: ["absol-single-page-header", "button-panel-header"],
            child: buttons
        }
    ];
    if (params.type == "new"){
        var uploadCtn = DOMElement.div({
            attrs: {
                style: {
                    width: "70vw",
                    height: "50vh",
                    margin: "auto"
                }
            }
        });
        var x = pizo.xmlModalDragManyFiles;
        x.iconSrc = "../../../../vivid_exticons/";
        uploadCtn.appendChild(x.containGetImage());
        setTimeout(function(){
            x.functionClickDone = function(){
                var files = x.getFile();
                if (files.length == 0) return;
                params.saveNewFunc(files).then(function(values){
                    for (var i = 0; i < values.length; i++){
                        params.fileList.unshift(values[i]);
                    }
                    redrawFileList();
                    x.resetFile();
                    redrawFileObject();
                });
            };
            x.functionClickCancel = function(){

            };
            x.createEvent();
        }, 100);
        contentChild.push(DOMElement.div({
            attrs: {className: "card-upload-file-cards"},
            children: [uploadCtn]
        }));
    }
    var listFileElt = DOMElement.div({});
    redrawFileList();
    contentChild.push(listFileElt);
    var returnData = absol.buildDom({
        tag: "singlepagenfooter",
        child: contentChild
    });
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
        content = theme.generateNoteData(params.objects.items[oIndex].valueid, params.values);
        noteValue = content.noteValue;
        work_value = content.work_value;
        note_value = content.note_value;
        created_value = content.created_value;
        user_created_value = content.user_created_value;
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
                    user_created_value = systemconfig.userid;
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

    var saveFunc = function(promise){
        promise().then(function resolve(value){
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateNoteData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++){
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            var ident = theme.cardGetMillisecondsWithoutTime(created_value);
            var parent = absol.$(".card-activities-group-"+ident, activities_block);
            if (parent){
                absol.$('.card-activity-view-container', parent, function(elt){
                    if (elt.ident == value.id){
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0){
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function(elt){
                        return elt != parseInt(ident);
                    });
                }
            }
            var item = {};
            theme.cardActivityElt({
                src1: "icons/note.png",
                src2: "icons/note_complete.png",
                src3: "icons/note_delay.png",
                activity: "note",
                id: value.id,
                name: content.work_value,
                created: content.created_value,
                result: content.note_value,
                editFunc: params.editNoteFunc
            }, params.cardid, params.getObjectbyType, params.users, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-"+keys[0], activities_block);
            if (!newParent){
                var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
                var color = '#e4e1f5';
                var x = absol._({
                    style: {
                        paddingTop: "20px",
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: "card-activities-group-"+keys[0],
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'margin-left': '26px',
                                'text-align': 'center',
                                'border': 'var(--control-border)',
                                backgroundColor: color
                            },
                            child: {text: title}
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                var maxIdent = Math.max(...identArray);
                identArray.push(parseInt(keys[0]));
                identArray.sort(function(a, b){
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1){
                    var className = ".card-activities-group-"+maxIdent;
                    var afterElt = absol.$(className, activities_block);
                }
                else {
                    var className = ".card-activities-group-"+identArray[index+1];
                    var afterElt = absol.$(className, activities_block);
                }
                activities_block.insertBefore(newParent, afterElt);
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message){
            if (message) ModalElement.alert({message: message});
        });
    };

    var deleteFunc = function(promise){
        var title = LanguageModule.text("txt_delete_note");
        var message = LanguageModule.text("war_delete_note");
        theme.deleteConfirm(title, message).then(function rs(){
            promise().then(function resolve(value){
                while(params.frameList.getLength() > 2){
                    params.frameList.removeLast();
                }
                params.objects = value.objects;
                var activities_block = absol.$(".card-activities-block", params.frameList);
                var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                var parent = absol.$(".card-activities-group-"+ident, activities_block);
                if (parent){
                    absol.$('.card-activity-view-container', parent, function(elt){
                        if (elt.ident == value.id){
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0){
                        activities_block.removeChild(parent);
                    }
                }
            }, function reject(message){
                if (message) ModalElement.alert({message: message});
            });
        });
    };

    var company = absol._({});

    for (var i = 0; i < data_module.cardList[params.cardid].content.companies_card.length; i++){
        var index = data_module.companies.getIndex(data_module.cardList[params.cardid].content.companies_card[i].companyid);
        var company_classIndex = data_module.company_class.getIndex(data_module.companies.items[index].company_classid);
        var company_className = data_module.company_class.items[company_classIndex].name;
        company.addChild(absol._({
            style: {
                marginTop: i > 0 ? "20px" : "0px"
            },
            child: theme.input({
                type: 'text',
                style: {
                    width: "400px"
                },
                disabled: true,
                value: data_module.companies.items[index].name + " - " + company_className
            })
        }));
    }

    buttons = [
        absol._({
            class: "single-button-header",
            child: theme.closeButton({
                onclick: params.cmdButton.close
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveButton({
                onclick: function(){
                    saveFunc(params.cmdButton.save);
                }
            })
        }),
        absol._({
            class: "single-button-header",
            child: theme.saveCloseButton({
                onclick: function(){
                    saveFunc(params.cmdButton.saveClose);
                }
            })
        })
    ];

    if (params.id) {
        buttons.push(absol._({
            class: "single-button-header",
            child: theme.deleteButton({
                onclick: function(){
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
                text: LanguageModule.text("txt_company")
            },
            {attrs: {style: {width: 'var(--control-horizontal-distance-1)'}}},
            {
                children: [company]
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
        var work_value, note_value;
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
        var name, phoneNumber, email, icon, company, comment;
        var index = data_module.companies.getIndex(elt.companyid);
        name = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.firstname + " " + elt.lastname}
        });
        phoneNumber = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.phone}
        });
        company = absol._({
            class: "sortTable-cell-view",
            child: {text: index == -1 ? "" : data_module.companies.items[index].name}
        });
        comment = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.comment}
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
        data.push([
            {style: {textAlign: "center"}, element: icon},
            {value: elt.id},
            {value: elt.firstname + " " + elt.lastname, element: name},
            {value: elt.phone, element: phoneNumber},
            {value: elt.email, element: email},
            {value: index == -1 ? "empty" : data_module.companies.items[index].name, element: company},
            {value: elt.comment, element: comment}
        ]);
    });
    var header = [
        {},
        {hidden: true},
        {value: LanguageModule.text("txt_name")},
        {value: LanguageModule.text("txt_phone")},
        {value: LanguageModule.text("txt_email")},
        {value: LanguageModule.text("txt_company")},
        {value: LanguageModule.text("txt_comment")}
    ];
    return pizo.tableView(header, data, false, false);
};

theme.cardCompanyTable = function(contactDB, contactOfCard, changeFunc){
    var data = [];
    contactDB.forEach(function(elt){
        var city, district;
        var name, classElt, icon, classIndex, addressElt, cityElt, districtElt;
        classIndex = data_module.company_class.getIndex(elt.company_classid);
        name = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.name}
        });
        classElt = absol._({
            class: "sortTable-cell-view",
            style: {
                whiteSpace: "nowrap"
            },
            child: {text: classIndex != -1 ? data_module.company_class.items[classIndex].name : ""}
        });
        addressElt = absol._({
            class: "sortTable-cell-view",
            child: {text: elt.address}
        });
        city = elt.cityid > 0 ? data_module.cities.items[data_module.cities.getIndex(elt.cityid)].name : "";
        cityElt = absol._({
            class: "sortTable-cell-view",
            style: {
                whiteSpace: "nowrap"
            },
            child: {text: city}
        });
        district = elt.districtid > 0 ? data_module.districts.items[data_module.districts.getIndex(elt.districtid)].name : "";
        districtElt = absol._({
            class: "sortTable-cell-view",
            style: {
                whiteSpace: "nowrap"
            },
            child: {text: district}
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
        data.push([
            {style: {textAlign: "center"}, element: icon},
            {value: elt.id},
            {value: elt.name, element: name},
            {value: classIndex != -1 ? data_module.company_class.items[classIndex].name : "empty", element: classElt},
            {value: elt.address, element: addressElt},
            {value: city != "" ? city : "empty", element: cityElt},
            {value: district != "" ? district : "empty", element: districtElt}
        ]);
    });
    var header = [
        {},
        {hidden: true},
        {value: LanguageModule.text("txt_name")},
        {value: LanguageModule.text("txt_class")},
        {value: LanguageModule.text("txt_address")},
        {value: LanguageModule.text("txt_city")},
        {value: LanguageModule.text("txt_district")}
    ];
    return pizo.tableView(header, data, false, false);
}

theme.cardSelectContactForm = function(contactOfCard, task, callbackFunc){
    var contactDB;
    if (task == "contact") contactDB = data_module.contact;
    else contactDB = data_module.companies;
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
            rawData.childNodes[1].style.maxHeight = "calc(90vh - " + (250 + contactSelect.offsetHeight) + "px)";
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
                if (contactTable.data[i][1].value == id){
                    if (task == "contact") contactTable.data[i][0].element.checked = false;
                    else contactTable.data[i][0].element.checked = false;
                }
            }
            rawData.childNodes[1].style.maxHeight = "calc(90vh - " + (250 + contactSelect.offsetHeight) + "px)";
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
    var rawData = absol._({});
    var inputsearchbox = absol.buildDom({
        tag:'searchcrosstextinput',
        style: {
            width: "var(--searchbox-width)",
            verticalAlign: "middle",
            display: "inline-block"
        },
        props:{
            placeholder: LanguageModule.text("txt_search")
        }
    });
    var filter_container = absol._({
        style: {
            paddingBottom: "10px"
        }
    });
    if (task == "company"){
        var contactList = data_module.company_class.items.map(function(elt){
            return {value: elt.name + "_" + elt.id, text: elt.name};
        });
        contactList.sort(function(a, b){
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        contactList.unshift({value: "empty", text: LanguageModule.text("txt_empty")});
        contactList.unshift({value: 0, text: LanguageModule.text("txt_all")});
        var class_combobox = absol._({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: contactList
            }
        });
        var cityList = data_module.cities.items.map(function(elt){
            return {
                value: elt.name + "_" + elt.id,
                text: elt.name
            };
        });
        cityList.sort(function(a, b){
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        cityList.unshift({value: "empty", text: LanguageModule.text("txt_empty")});
        cityList.unshift({value: 0, text: LanguageModule.text("txt_all")});
        var city_combobox = absol._({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: cityList,
                enableSearch: true
            },
            on: {
                change: function(){
                    var list = [];
                    data_module.districts.items.forEach(function(elt){
                        if (city_combobox.value == 0) {
                            list.push({
                                value: elt.name,
                                text: elt.name
                            });
                        }
                        else if (city_combobox.value != "empty"){
                            if (data_module.cities.items[data_module.cities.getIndex(elt.cityid)].name == city_combobox.value){
                                list.push({
                                    value: elt.name,
                                    text: elt.name
                                });
                            }
                        }
                    });
                    list.sort(function(a, b){
                        if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
                        if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
                        return 0;
                    });
                    if (city_combobox.value != "empty"){
                        list.unshift({value: "empty", text: LanguageModule.text("txt_empty")});
                        list.unshift({value: 0, text: LanguageModule.text("txt_all")});
                    }
                    district_combobox.items = list;
                }
            }
        });
        var districtList = data_module.districts.items.map(function(elt){
            return {
                value: elt.name + "_" + elt.id,
                text: elt.name
            };
        });
        districtList.sort(function(a, b){
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        districtList.unshift({value: "empty", text: LanguageModule.text("txt_empty")});
        districtList.unshift({value: 0, text: LanguageModule.text("txt_all")});
        var district_combobox = absol._({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: districtList,
                enableSearch: true
            }
        });
        filter_container.addChild(absol._({
            style: {
                display: "inline-block",
                verticalAlign: "middle",
                paddingRight: "10px"
            },
            child: [
                {
                    tag: "span",
                    child: {text: LanguageModule.text('txt_type')},
                    style: {
                        paddingRight: "10px"
                    }
                },
                class_combobox
            ]
        }));
        filter_container.addChild(absol._({
            style: {
                display: "inline-block",
                verticalAlign: "middle",
                paddingRight: "10px"
            },
            child: [
                {
                    tag: "span",
                    child: {text: LanguageModule.text('txt_city')},
                    style: {
                        paddingRight: "10px"
                    }
                },
                city_combobox
            ]
        }));
        filter_container.addChild(absol._({
            style: {
                display: "inline-block",
                verticalAlign: "middle",
                paddingRight: "10px"
            },
            child: [
                {
                    tag: "span",
                    child: {text: LanguageModule.text('txt_district')},
                    style: {
                        paddingRight: "10px"
                    }
                },
                district_combobox
            ]
        }));
        contactTable.addFilter(class_combobox, 3);
        contactTable.addFilter(city_combobox, 5);
        contactTable.addFilter(district_combobox, 6);
    }
    else {
        var companyList = data_module.companies.items.map(function(elt){
            return {
                value: elt.name,
                text: elt.name
            };
        });
        companyList.sort(function(a, b){
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        companyList.unshift({value: "empty", text: LanguageModule.text("txt_empty")});
        companyList.unshift({value: 0, text: LanguageModule.text("txt_all")});
        var company_combobox = absol._({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: companyList,
                enableSearch: true
            }
        });
        filter_container.addChild(absol._({
            style: {
                display: "inline-block",
                verticalAlign: "middle",
                paddingRight: "10px"
            },
            child: [
                {
                    tag: "span",
                    child: {text: LanguageModule.text('txt_company')},
                    style: {
                        paddingRight: "10px"
                    }
                },
                company_combobox
            ]
        }));
        contactTable.addFilter(company_combobox, 5);
    }
    var rows = absol._({
        tag: "selectmenu",
        style: {
            verticalAlign: "middle"
        },
        props: {
            items: [1,2,3,4,5,6,7,8,9,10].map(function(elt){
                return {value: elt*10, text: elt*10};
            }),
            value: 50
        },
        on: {
            change: function(){
                contactTable.updatePagination(this.value);
            }
        }
    });
    var pageInput = absol._({
        tag: "input",
        class: "cardsimpleInput",
        style: {
            verticalAlign: "middle",
            display: "inline-block",
            width: "60px"
        },
        props: {
            type: "number",
            value: 1
        },
        on: {
            change: function(){
                contactTable.goto(parseInt(this.value, 10));
            }
        }
    });
    filter_container.addChild(absol._({
        style: {
            display: "inline-block",
            verticalAlign: "middle",
            paddingRight: "10px"
        },
        child: [
            inputsearchbox
        ]
    }));
    rawData.addChild(filter_container);
    contactTable.addInputSearch(inputsearchbox);
    contactTable.style.width = "100%";
    contactTable.changePageIndex = function(index){
        pageInput.value = index + 1;
    }
    rawData.addChild(absol._({
        class: "absol-single-page-scroller",
        style: {
            overflowY: "auto",
            maxHeight: "calc(90vh - 250px)"
        },
        child: contactTable
    }));
    var st = absol._({
        child: [
            {
                child: [
                    contactSelect,
                    {
                        child: rawData
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
        title: task == "contact" ? LanguageModule.text("txt_select_contact") : LanguageModule.text("txt_select_company"),
        overflow: 'hidden',
        bodycontent: st
    });
    contactSelect.style.width = rawData.parentNode.offsetWidth+ "px";
    rawData.childNodes[1].style.maxHeight = "calc(90vh - " + (250 + contactSelect.offsetHeight) + "px)";
    ModalElement.close(-1);
}

theme.cardContactInfor = function(parentElt, task){
    var content, contactDB;
    if (task == "contact") {
        contactDB = data_module.contact;
        content = parentElt.contactData;
    }
    else {
        contactDB = data_module.companies;
        content = parentElt.companyData;
    }
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
        else {
            var company_className;
            if (contactDB.items[index].company_classid == 0){
                company_className = "";
            }
            else {
                var company_classIndex = data_module.company_class.getIndex(contactDB.items[index].company_classid);
                company_className = data_module.company_class.items[company_classIndex].name;
            }
            data = contactDB.items[index].name + " - " + company_className;
        }
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
            marginTop: "20px"
        }
    });
    contact_container = absol._({});
    contact_container.addTo(st);
    company_container = absol._({});
    company_container.addTo(st);
    st.contactData = EncodingClass.string.duplicate(content.contactOfCard);
    st.companyData = EncodingClass.string.duplicate(content.companyOfCard);
    contact_container.addChild(theme.cardContactInfor(st, 'contact'));
    company_container.addChild(theme.cardContactInfor(st, 'company'));
    if (content.editMode == "edit") st.addChild(absol._({
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
                        ModalElement.show_loading();
                        setTimeout(function(){
                            theme.cardSelectContactForm(st.contactData, 'contact', function(data){
                                st.contactData = st.contactData.concat(data);
                                contact_container.clearChild();
                                contact_container.addChild(theme.cardContactInfor(st, 'contact'));
                            });
                        }, 100);
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
                        ModalElement.show_loading();
                        setTimeout(function(){
                            theme.cardSelectContactForm(st.companyData, 'company', function(data){
                                st.companyData = st.companyData.concat(data);
                                company_container.clearChild();
                                company_container.addChild(theme.cardContactInfor(st, 'company'));
                            });
                        }, 100);
                    }
                }
            }
        ]
    }));
    return st;
}

theme.cardActivityIconButton = function(src, text, maxWidth, click, disabled){
    var st = absol._({
        style: {
            width: maxWidth + "px"
        },
        class: disabled ? "card-activities-icon-button-disabled-cover" : "card-activities-icon-button-cover",
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
    var left_block, right_block, name_block, container, filter_block, activities_block, stage_block, checkup_block, task_manager_block, contact_block;
    var database = {
        cities: params.cities,
        nations: params.nations,
        users: params.users,
        values: params.valuesList,
        typelists: params.typelists
    };
    var props = {
        actionIcon: DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "arrow_back_ios"
        }),
        title: params.cardName,
        commands: [
            {
                icon:  DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "save"
                })
            }
        ]
    };
    var removeCardElt = function(value){
        if (value >= 0){
            absol.$(".cd-list-board", params.frameList, function(elt){
                if (elt.ident == params.stage){
                    elt.title = elt.listName + " (" + value + ")"
                    var cards = elt.$body.getAllBoards();
                    for (var i = 0; i < cards.length; i++){
                        if (cards[i].ident == params.cardid){
                            cards[i].selfRemove();
                            break;
                        }
                    }
                }
            });
            params.frameList.removeLast();
        }
    }
    if (params.editMode == 'edit'){
        props.quickmenu = {
            getMenuProps: function(){
                return {
                    items: [
                        {
                            icon:DOMElement.i({
                                attrs: {
                                    className: "material-icons "
                                },
                                text: "trending_flat",
                            }),
                            text: LanguageModule.text("txt_move"),
                            cmd: params.cmdButton.move
                        },
                        {
                            icon: DOMElement.i({
                                attrs: {
                                    className: "mdi mdi-delete-variant"
                                }
                            }),
                            text: LanguageModule.text("txt_archive"),
                            cmd: params.cmdButton.archive
                        },
                        {
                            icon: DOMElement.i({
                                attrs: {
                                    className: "mdi mdi-delete-variant"
                                }
                            }),
                            text: LanguageModule.text("txt_delete"),
                            cmd: params.cmdButton.delete
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
        value: params.name,
        disabled: params.editMode == 'view'
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
            }),
            disabled: params.editMode == 'view'
        };
        if (params.objectId && params.objectId > 0) props.value = params.objectId;
        object = absol._({
            tag: "selectmenu",
            style: {
                width: "100%"
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
            display: "block"
        },
        props: {
            items: params.lists,
            value: params.stage,
            disabled: params.editMode == 'view'
        }
    });

    stage_block = absol._({
        style: {
            marginTop: "20px"
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
    var t_disabled = (params.editMode == 'view' || params.cardid == 0);
    for (var i = 0; i < buttonInfo.length; i++){
        iconArray.push(theme.cardActivityIconButton(t_disabled ? buttonInfo[i].src2 : buttonInfo[i].src1, buttonInfo[i].text, maxWidth, buttonInfo[i].click, t_disabled));
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
            display: "block"
        },
        props: {
            items: [
                {value: 0, text: "-----------"},
                {value: 1, text: LanguageModule.text("txt_very_important")},
                {value: 2, text: LanguageModule.text("txt_low_important")}
            ],
            value: params.important.value,
            disabled: params.editMode == 'view'
        }
    });

    var knowledge = absol.buildDom({
        tag: "checkbox",
        props: {
            checked: params.knowledge.value,
            disabled: t_disabled
        },
        on: {
            change: function(event){
                var self = this;
                if (this.checked){
                    if (params.knowledge.id == 0){
                        params.knowledge.cmd().then(function(value){
                            self.checked = value;
                            params.knowledge.id = value;
                        });
                    }
                }
            }
        }
    });

    createdtime = params.createdtime.value ? contentModule.formatTimeDisplay(params.createdtime.value) : "xx/xx/xx";

    username = params.username.value;

    checkup_block = absol._({
        style: {
            marginTop: "20px"
        },
        child: DOMElement.table({
            attrs: {style: {
                width: "100%"
            }},
            data: [
                [
                    {
                        text: LanguageModule.text("txt_stage")
                    },
                    {attrs: {style: {width: "20px"}}},
                    {
                        children: [stage]
                    }
                ],
                [{attrs: {style: {height: "20px"}}}],
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
                        text: params.knowledge.title
                    },
                    {attrs: {style: {width: "20px"}}},
                    {
                        children: [
                            knowledge,
                            DOMElement.div({
                                attrs: {
                                    className: (t_disabled)? "card-icon-cover-disabled" : "card-icon-cover",
                                    style: {
                                        marginLeft: "var(--control-horizontal-distance-1)",
                                        verticalAlign: "middle"
                                    },
                                    onclick: function(){
                                        if (t_disabled) return;
                                        params.knowledge.cmd();
                                    }
                                },
                                children: [DOMElement.i({
                                    attrs: {
                                        className: "material-icons bsc-icon-hover-black"
                                    },
                                    text: "create"
                                })]
                            })
                        ]
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

    contact_block = theme.cardContactView({contact: params.contact, companies: params.companies, company_class: params.company_class, contactOfCard: params.contactOfCard, companyOfCard: params.companyOfCard, company_class: params.company_class, editMode: params.editMode});

    contact_block.addTo(name_block);

    checkup_block.addTo(name_block);

    left_block = absol._({
        style: {
            width: "30%",
            display: "inline-block",
            verticalAlign: "top"
        },
        child: [
            name_block,
            task_manager_block
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
                // alert("Activity")
            }
        },
        {
            text: LanguageModule.text("txt_task"),
            func: function(){
                // alert("Task")
            }
        },
        {
            text: LanguageModule.text("txt_call"),
            func: function(){
                // alert("Call")
            }
        },
        {
            text: LanguageModule.text("txt_file"),
            func: function(){
                // alert("Files")
            }
        },
        {
            text: LanguageModule.text("txt_wait"),
            func: function(){
                // alert("Wait")
            }
        },
        {
            text: LanguageModule.text("txt_field"),
            func: function(){
                // alert("Fields")
            }
        },
        {
            text: LanguageModule.text("txt_check_list"),
            func: function(){
                // alert("Check list")
            }
        },
        {
            text: LanguageModule.text("txt_meeting"),
            func: function(){
                // alert("Meeting")
            }
        },
        {
            text: LanguageModule.text("txt_note"),
            func: function(){
                // alert("Notes")
            }
        }
    ];

    filter_block = theme.cardActivityFilterButton(filterInfo);

    filter_block.addTo(right_block);

    activities_block = absol._({
        class: "card-activities-block",
        style: {
            marginTop: "20px",
            border: "1px solid #d6d6d6",
            backgroundColor: "#f5f8fa",
            height: "100%",
            padding: "20px 20px 20px 14px",
            position: "relative"
        },
        child: [
            {
                style: {
                    'position': 'absolute',
                    'width': '2px',
                    'top': '20px',
                    'bottom': '20px',
                    'left': '39px',
                    'background-color': '#aaaaaa'
                }
            },
            {
                style: {
                    'position': 'absolute',
                    'height': '2px',
                    'bottom': '19px',
                    'right': '20px',
                    'left': '39px',
                    'background-color': '#aaaaaa'
                }
            }
        ]
    });

    var activities_data_structure = {};

    activities_block.addTo(right_block);

    if (params.cardid != 0) theme.generateActivitiesData(activities_block, params.activitiesOfCard, params.objects, params.values, params.typelists, params.users, params.editActivitiesFunc, params.cardid, systemconfig.userid, params.getObjectbyType, activities_data_structure, params.allFiles, params.imagesList);

    container = absol._({
        child: [
            left_block,
            right_block
        ]
    });
    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: container
            }
        ]
    });
    returnData.getValue = function(){
        var nameValue = name.value.trim();
        if (nameValue == ""){
            ModalElement.alert({message: LanguageModule.text("war_no_name")});
            return false;
        }
        return {
            name: nameValue,
            objectid: object ? object.value : 0,
            stage: stage.value,
            important: important.value,
            contact: contact_block.contactData,
            companies: contact_block.companyData,
            knowledge: knowledge.checked? 1 : 0
        };
    }
    return returnData;
};

theme.moveCard = function(content){
    return new Promise(function(rs){
        var boards, lists, listItems;
        boards = absol._({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: content
            },
            on: {
                change: function(){
                    for (var i = 0; i < content.length; i++){
                        if (content[i].value == boards.value) listItems = content[i].lists;
                    }
                    lists.items = listItems;
                    lists.value = listItems[0].value;
                }
            }
        });
        for (var i = 0; i < content.length; i++){
            if (content[i].value == boards.value) listItems = content[i].lists;
        }
        lists = absol._({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: listItems
            }
        });
        var maxWidth, tempText;
        tempText = DOMElement.span({text: LanguageModule.text("txt_board")});
        DOMElement.hiddendiv.appendChild(tempText);
        maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
        tempText = DOMElement.span({text: LanguageModule.text("txt_list")});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
        maxWidth+=5;
        ModalElement.showWindow({
            index: 1,
            title: LanguageModule.text("txt_choose_destination"),
            bodycontent: absol._({
                child: [
                    {
                        child: [
                            {
                                child: [
                                    {
                                        style: {
                                            display: "inline-block",
                                            verticalAlign: "middle",
                                            marginRight: "10px",
                                            width: maxWidth + "px"
                                        },
                                        child: {
                                            tag: "span",
                                            child: {text: LanguageModule.text("txt_board")}
                                        }
                                    },
                                    boards
                                ]
                            },
                            {
                                style: {
                                    paddingTop: "20px"
                                },
                                child: [
                                    {
                                        style: {
                                            display: "inline-block",
                                            verticalAlign: "middle",
                                            marginRight: "10px",
                                            width: maxWidth + "px"
                                        },
                                        child: {
                                            tag: "span",
                                            child: {text: LanguageModule.text("txt_list")}
                                        }
                                    },
                                    lists
                                ]
                            }
                        ]
                    },
                    {
                        style: {
                            paddingTop: "20px",
                            textAlign:"center"
                        },
                        child: [
                            {
                                style: {
                                    display: "inline-block"
                                },
                                child: theme.okButton2({
                                    onclick: function(){
                                        rs({
                                            boardid: parseInt(boards.value, 10),
                                            listid: parseInt(lists.value, 10)
                                        });
                                        ModalElement.close(1);
                                    }
                                })
                            },
                            {
                                style: {
                                    paddingLeft: "20px",
                                    display: "inline-block"
                                },
                                child: theme.cancelButton2({
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
}

theme.drawCardContent = function (card, content, cardid, userid) {
    var username = data_module.users.items[data_module.users.getByhomeid(userid)].username;
    content.clearChild();
    var str = "";
    data_module.cardList[cardid].content.contact_card.forEach(function(elt){
        var index = data_module.contact.getIndex(elt.contactid);
        if (index != -1){
            if (str != "") str += ", ";
            str += data_module.contact.items[index].firstname + " " + data_module.contact.items[index].lastname;
        }
    });
    data_module.cardList[cardid].content.companies_card.forEach(function(elt){
        var index = data_module.companies.getIndex(elt.companyid);
        if (index != -1){
            if (str != "") str += ", ";
            str += data_module.companies.items[index].name;
        }
    });
    if (str.length > 150) str = str.substr(0, 150);
    content.addChild(absol._({child: {text: str}}));
    content.addChild(absol._({style: {textAlign: "right"}, child: {text: username}}));
};

theme.cardInitForm = function(params){
    var cmdButton = [], userCombobox, mBoardTable;
    userCombobox = absol._({
        tag: "mselectmenu",
        props: {
            items: params.memberList,
            value: params.userid
        },
        on: {
            change: function(){
                for(var i = 0; i < mBoardTable.childNodes.length; i++){
                    mBoardTable.childNodes[i].generateCardView(parseInt(this.value, 10));
                }
            }
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
        userCombobox.style.display = "block";
        userCombobox.style.width = "100%";
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
                            text: LanguageModule.text("txt_createdby")
                        }),
                        userCombobox,
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
                text: "filter_alt"
            }),
            cmd: filterFunc
        }
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
            title: params.boardName,
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });

    mBoardTable = absol._({
        tag:'boardtable',
        style: {
            width: "max-content"
        },
        class:['table-of-list-board']
    });
    var listArray = [];
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
                cardenter: item.cardenter,
                orderchange: item.orderchange
            }
        });
        listElt._quickmenu = {
            props: {
                extendClasses: 'cd-context-menu',
                items: [
                    {
                        text: LanguageModule.text("txt_archive_all_card_in_this_list"),
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "turned_in_not" }
                        },
                        cmd: item.archiveAllCardInListFunc
                    }
                ]
            },
            onSelect: function (item) {
                var title, message;
                var command = function(){
                    item.cmd().then(function(value){
                        if (value) {
                            var cards = listElt.$body.getAllBoards();
                            cards.forEach(function(elt){
                                elt.selfRemove();
                            });
                            listElt.title = listElt.listName + " (0)";
                        }
                    });
                }
                title = LanguageModule.text("txt_archive_all_cards_in_this_list");
                message = LanguageModule.text("war_archive_all_cards_in_this_list");
                theme.deleteConfirm(title, message).then(command);
            }
        };
        listElt.ident = item.id;
        listElt.cards = item.cards;
        listElt.listName = item.name;
        listElt.generateCardView = function(userid){
            var removeCard = this.$body.getAllBoards();
            removeCard.forEach(function(elt){
                elt.selfRemove();
            });
            var count = 0;
            this.cards.forEach(function(elt){
                if (userid == 0 || userid == elt.userid){
                    count++;
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
                    card.ident = elt.id;
                    var content;
                    if (!data_module.cardList[elt.id].content) {
                        content = absol._({
                            style: {
                                fontSize: "12px"
                            },
                            child: {
                                style: {
                                    textAlign: "center"
                                },
                                child: {
                                    tag: 'img',
                                    style: {
                                        width: "20px",
                                        height: "20px"
                                    },
                                    props: {
                                        src: "loading.gif"
                                    }
                                }
                            }
                        });
                        data_module.pendingData[data_module.cardList[elt.id].heapIndex].onLoad.push(function(card, content, cardid, userid){
                            return function(){
                                theme.drawCardContent(card, content, cardid, userid);
                            }
                        }(card, content, elt.id, elt.userid));
                    }
                    else {
                        content = absol._({
                            style: {
                                fontSize: "12px"
                            }
                        });
                        theme.drawCardContent(card, content, elt.id, elt.userid);
                    }
                    card.addChild(content);
                    var items = [];
                    if (elt.editMode == "edit") items = [
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
                            text: LanguageModule.text("txt_move"),
                            extendClasses: "bsc-quickmenu",
                            icon: {
                                tag: "i",
                                class: "material-icons",
                                child: { text: "open_with" }
                            },
                            task: "move",
                            cmd: elt.moveFunc
                        },
                        {
                            text: LanguageModule.text("txt_archive"),
                            extendClasses: "bsc-quickmenu",
                            icon: {
                                tag: "i",
                                class: "material-icons",
                                child: { text: "turned_in_not" }
                            },
                            cmd: elt.archiveFunc,
                            task: "archive"
                        },
                        {
                            text: LanguageModule.text("txt_delete"),
                            extendClasses: "bsc-quickmenu red",
                            icon: {
                                tag: "i",
                                class: "material-icons",
                                child: { text: "delete" }
                            },
                            cmd: elt.deleteFunc,
                            task: "delete"
                        }
                    ];
                    card._quickmenu = {
                            props: {
                                extendClasses: 'cd-context-menu',
                                items: items
                            },
                            onSelect: function (item) {
                                var command = function(){
                                    item.cmd().then(function(value){
                                        if (value >= 0) {
                                            var list = card.parentNode.parentNode;
                                            card.selfRemove();
                                            list.title = list.listName + " (" + value + ")";
                                        }
                                    });
                                }
                                if (item.task) {
                                    var title, message;
                                    if (item.task == "move") command();
                                    else if (item.task == "delete") {
                                        title = LanguageModule.text("txt_delete_card");
                                        message = LanguageModule.text("war_delete_card");
                                        theme.deleteConfirm(title, message).then(command);
                                    }
                                    else {
                                        title = LanguageModule.text("txt_archive_card");
                                        message = LanguageModule.text("war_archive_card");
                                        theme.deleteConfirm(title, message).then(command);
                                    }
                                }
                                else item.cmd();
                            }
                        };

                    this.addCard(card);
                }
            }.bind(this));
            this.title = this.listName + " (" + count + ")";
        };
        listElt.generateCardView(params.userid);
        mBoardTable.addChild(listElt);
    });

    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: mBoardTable
            }
        ]
    });

    returnData.userCombobox = userCombobox;

    return returnData;

};

ModuleManagerClass.register({
    name: "Cards_view",
    prerequisites: ["ModalElement"]
});
