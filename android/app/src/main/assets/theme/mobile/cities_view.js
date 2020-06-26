theme.formCitiesEdit = function(params){
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_city"),
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
        },
        on: {
            action: params.cmdbutton.close,
            command: params.cmdbutton.save
        }
    });
    var name_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.name
    });
    var postalcode_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.postalcode
    });
    var phonecode_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.phonecode
    });
    var nation_select = absol.buildDom({
       tag: "selectmenu",
       style: {
           width: "100%"
       },
       props: {
           items: params.listNation,
           value: params.nationid
       }
    });
    var activated_inputselect = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': "var(--switch-fontsize)"
        },
        props:{
            checked: params.activemode
        }
    });
    var singlePage = absol.buildDom({
        tag: "tabframe",
        child: [
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
                        text: LanguageModule.text("txt_name")
                    }),
                    name_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_phonecode")
                    }),
                    phonecode_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_postalcode")
                    }),
                    postalcode_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_nations")
                    }),
                    nation_select,
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
                    })
                ]
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
           return;
       }
       return {
           name: name_inputtext.value.trim(),
           postalcode: postalcode_inputtext.value.trim(),
           phonecode: phonecode_inputtext.value.trim(),
           nationid: nation_select.value,
           available: activated_inputselect.checked
       }
    };
    setTimeout(function(){
        name_inputtext.focus()
    },10);
    return singlePage;
};

theme.formCitiesGetRow = function(content){
    var editIcon = DOMElement.div({
        attrs: {
            className: "card-icon-cover",
            style: {
                marginRight: "var(--control-horizontal-distance-1)"
            }
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons bsc-icon-hover-black"
            },
            text: "create"
        })]
    });
    var deleteIcon = DOMElement.div({
        attrs: {
            className: "card-icon-remove-cover"
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons card-icon-remove"
            },
            text: "remove_circle"
        })]
    });
    var row = [
        "",
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
            style: {whiteSpace: "nowrap"},
            value: content.phonecode,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.phonecode
            })
        },
        {
            style: {whiteSpace: "nowrap"},
            value: content.postalcode,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.postalcode
            })
        },
        {
            style: {whiteSpace: "nowrap"},
            value: content.nation + "_" + content.nationid,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.nation
            })
        },
        {
            value: content.createdby,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.createdby
            })
        },
        {
            value: content.createdtime,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.createdtime
            })
        },
        {
            value: content.lastmodifiedtime,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.lastmodifiedtime
            })
        },
        {
            value: content.available,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.available
            })
        },
        {
            functionClick: function(event,me,index,parent,data,row){
                var me = event.target;
                while (me.parentNode.classList !== undefined && !me.parentNode.classList.contains("sortTable-cell-view-cmd")) {
                    me = me.parentNode;
                }
                if (me === editIcon){
                   content.func.edit().then(function(value){
                       parent.updateRow(theme.formCitiesGetRow(value), index);
                   });
                }
                if (me === deleteIcon){
                   content.func.delete().then(function(value){
                       parent.dropRow(index);
                   });
                }
            },
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view-cmd"
                },
                children: [
                    editIcon,
                    deleteIcon
                ]
            })
        }
    ];
    return row;
};

theme.formCitiesContentData = function(params){
    var data = [];
    for (var i = 0; i < params.data.length; i++){
        data.push(theme.formCitiesGetRow(params.data[i]));
    }
    var x = pizo.tableView(
        [
            {type: "dragzone", style: {paddingLeft: "var(--control-verticle-distance-1)", paddingRight: "var(--control-verticle-distance-1)", width: "40px"}},
            {value: LanguageModule.text("txt_name"), sort: true},
            {value: LanguageModule.text("txt_phonecode"), sort: true},
            {value: LanguageModule.text("txt_postalcode"), sort: true},
            {value: LanguageModule.text("txt_nations"), sort: true},
            {value: LanguageModule.text("txt_createdby"), sort: true},
            {value: LanguageModule.text("txt_created_time"), sort: true},
            {value: LanguageModule.text("txt_last_modified_time"), sort: true},
            {value: LanguageModule.text("txt_active"), sort: true},
            {value: ""}
        ],
        data,
        false,
        true,
        1
    );
    x.addInputSearch(params.inputsearchbox);
    return x;
};

theme.formCitiesInit = function(params){
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_city"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "add"
                    })
                }
            ]
        },
        on: {
            action: params.cmdbutton.close,
            command: params.cmdbutton.add
        }
    });
    params.nations_select.style.marginLeft = "var(--tab-padding-left)";
    params.nations_select.style.marginTop = "var(--control-verticle-distance-2)";
    params.nations_select.style.display = "block";
    params.nations_select.style.width = "calc(100vw - var(--tab-padding-left) - var(--tab-padding-right))";
    params.inputsearchbox.style.marginLeft = "var(--tab-padding-left)";
    params.inputsearchbox.style.marginTop = "var(--control-verticle-distance-2)";
    return absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            params.nations_select,
            params.inputsearchbox,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content-has-search"
                },
                children: [params.data_container]
            })
        ]
    });
};
ModuleManagerClass.register({
    name: "Cities_view",
    prerequisites: ["ModalElement"]
});
