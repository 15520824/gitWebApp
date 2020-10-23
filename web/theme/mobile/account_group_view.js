theme.formAccountGroupEdit = function(params){
    var isPriv = params.isPriv;
    var is_system = params.data.is_system;
    var getPriviledge_of_ListElt = function(content, type){
        var listChildren = [];
        for (var key in content){
            if (type == "board" && key == 5){
                var cb = absol.buildDom({
                    class: "card-checkbox-privilegde",
                    tag: "checkbox",
                    props: {
                        text: content[key].text,
                        checked: content[key].checked,
                        disabled: !isPriv || is_system
                    },
                    on: {
                        change: function(){
                            if (this.checked){
                                sel.style.display = "inline-block";
                            }
                            else {
                                sel.style.display = "none";
                            }
                        }
                    }
                });
                var sel = absol.buildDom({
                    tag: "mselectbox",
                    class: "card-checkbox-privilegde",
                    style: {
                        display: (content[key].checked)? "" : "none"
                    },
                    props: {
                        items: params.data.listGroups,
                        values: content[key].details,
                        disabled: !isPriv || is_system
                    }
                });
                listChildren.push(absol.buildDom({
                    style: {
                        display: "inline-block"
                    },
                    props: {
                        key: key
                    },
                    child: [
                        cb, sel
                    ]
                }))
            }
            else {
                listChildren.push(absol.buildDom({
                    class: "card-checkbox-privilegde",
                    tag: "checkbox",
                    props: {
                        key: key,
                        text: content[key].text,
                        checked: content[key].checked,
                        disabled: !isPriv || is_system
                    }
                }));
            }
        }
        var res = DOMElement.div({
            children: listChildren
        });
        res.getValue = function(){
            var data = {};
            for (var i = 0; i < listChildren.length; i++){
                if (type == "board" && listChildren[i].key == 5){
                    var cb = absol.$("checkbox", listChildren[i]);
                    if (cb.checked){
                        var sel = absol.$("mselectbox", listChildren[i]);
                        data[listChildren[i].key] = sel.values;
                    }
                    else {
                        data[listChildren[i].key] = false;
                    }
                }
                else {
                    data[listChildren[i].key] = listChildren[i].checked;
                }
            }
            return data;
        };
        return res;
    };
    var commands = [];
    if (isPriv){
        commands = [
            {
                icon:  DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "save"
                }),
                cmd: params.cmdbutton.save
            }
        ];
        if (params.data.id > 0){
            commands.push({
                icon:  DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: params.cmdbutton.delete
            });
        }
    }
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_user_groups"),
            commands: commands
        },
        on: {
            action: params.cmdbutton.close,
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    var name_inputtext = theme.input({
        style: {width: "100%"},
        value: params.data.name,
        disabled: !isPriv
    });
    var comment_inputtext = DOMElement.textarea({
        attrs: {
            className: "cardSimpleTextarea",
            style: {
                width :"100%",
                height: "100px"
            },
            value: params.data.comment,
            disabled: !isPriv || is_system
        }
    });
    var activated_inputselect = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': "var(--switch-fontsize)"
        },
        props:{
            checked: params.data.available,
            disabled: !isPriv || is_system
        }
    });
    var priviledge_of_board = getPriviledge_of_ListElt(params.data.priviledge_of_board, "board");
    var priviledge_of_company_class = getPriviledge_of_ListElt(params.data.priviledge_of_company_class, "company_class");
    var data = [
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit-first"
            },
            text: LanguageModule.text("txt_name")
        }),
        name_inputtext,
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit"
            },
            text: LanguageModule.text("txt_note")
        }),
        comment_inputtext,
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit",
                style: {
                    position: "relative"
                }
            },
            children: [
                DOMElement.span({
                    text: LanguageModule.text("txt_active")
                }),
                DOMElement.div({
                    attrs: {
                        style: {
                            position: "absolute",
                            right: 0,
                            top: 0
                        }
                    },
                    children: [activated_inputselect]
                })
            ]
        }),
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit"
            },
            text: LanguageModule.text("txt_priviledge_of_board")
        }),
        priviledge_of_board,
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit"
            },
            text: LanguageModule.text("txt_priviledge_of_company_class")
        }),
        priviledge_of_company_class
    ];
    var singlePage = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: data
            })
        ]
    });
    singlePage.getValue = function(){
        if (name_inputtext.value.trim() == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_no_name"),
                func: function(){
                   name_inputtext.focus();
                }
            });
            return false;
        }
        var data = {
            name: name_inputtext.value.trim(),
            comment: comment_inputtext.value,
            available: activated_inputselect.checked? 1 : 0,
            priviledge_of_board: priviledge_of_board.getValue(),
            priviledge_of_company_class: priviledge_of_company_class.getValue()
        };
        return data;
    };
    return singlePage;
};

theme.formAccountGroupInit = function(params){
    var commands = [];
    if (params.cmdbutton.add !== undefined){
        commands.push({
            icon:  DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "add"
            }),
            cmd: params.cmdbutton.add
        });
    }
    commands.push({
        icon:  DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "search"
        }),
        cmd: function(){
            header.searchMode(true);
        }
    });
    var header = absol.buildDom({
        tag: 'headerbarwithsearch',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_user_groups"),
            commands: commands
        },
        data:{
            searchInput: params.inputsearchbox
        },
        on: {
            action: params.cmdbutton.close,
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    params.inputsearchbox.style.width = "calc(100vw - var(--tab-padding-left) - var(--tab-padding-right) - 20px)";
    return absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: [params.data_container]
            })
        ]
    });
};

theme.formAccountGroupGetRow = function(content){
    var extraDataElt = DOMElement.div({});
    if (content.comment != ""){
        extraDataElt.appendChild(DOMElement.span({
            text: content.comment
        }));
    }
    var row = [
        {
            functionClick: function(event,me,index,parent,data,row){
                content.func.edit(function(value){
                    if (!value){
                        parent.dropRow(index);
                    }
                    else {
                        parent.updateRow(theme.formAccountGroupGetRow(value), index);
                    }
                });
            },
            value: content.firstname,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "card-table-list-title"
                        },
                        text: content.name
                    }),
                    extraDataElt
                ]
            })
        }
    ];
    row.func = content.func;
    row.isPriv = content.isPriv;
    row.is_system = content.is_system;
    return row;
};

theme.formAccountGroupContentData = function(params){
    var data = [];
    for (var i = 0; i < params.content.length; i++){
        data.push(theme.formAccountGroupGetRow(params.content[i]));
    }
    var x = pizo.tableView(
        [
            {value: LanguageModule.text("txt_name")}
        ],
        data,
        undefined,
        [],
        1
    );
    x.style.width = "100%";
    x.addClass("am-gray-table");
    x.addInputSearch(params.inputsearchbox);
    x.setUpSwipe(true, true);
    x.swipeCompleteRight = function(event, me, index, data, row, parent){
        data.func.edit(function(value){
            if (!value){
                parent.dropRow(index);
            }
            else {
                parent.updateRow(theme.formAccountGroupGetRow(value), index);
            }
        });
    };
    x.swipeCompleteLeft = function(event, me, index, data, row, parent){
        if (data.isPriv && !data.is_system){
            data.func.delete().then(function(value){
                parent.exactlyDeleteRow(index);
            });
        }
    };
    return x;
};

ModuleManagerClass.register({
   name: "AccountGroup_view",
   prerequisites: ["ModalElement"]
});
