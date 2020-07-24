theme.formObjectGetRow = function(content){
    var child = [];
    for (var i = 0; i < content.child.length; i++){
        child.push(theme.formObjectGetRow(content.child[i]));
    }
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
            value: content.typeName,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.typeName
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
                       parent.updateRow(theme.formObjectGetRow(value), index);
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
    if (child.length > 0) row.child = child;
    return row;
};

theme.formObjectContentData = function(params){
    var data = [];
    for (var i = 0; i < params.data.length; i++){
        data.push(theme.formObjectGetRow(params.data[i]));
    }
    var x = pizo.tableView(
        [
            {type: "dragzone", style: {paddingLeft: "var(--control-verticle-distance-1)", paddingRight: "var(--control-verticle-distance-1)", width: "40px"}},
            {value: LanguageModule.text("txt_name"), sort: true},
            {value: LanguageModule.text("txt_datatype"), sort: true},
            {value: LanguageModule.text("txt_createdby"), sort: true},
            {value: LanguageModule.text("txt_created_time"), sort: true},
            {value: LanguageModule.text("txt_last_modified_time"), sort: true},
            {value: LanguageModule.text("txt_active"), sort: true},
            {value: ""}
        ],
        data,
        false,
        false,
        1
    );
    x.addInputSearch(params.inputsearchbox);
    return x;
};

theme.formObjectsGetCategoryGetRow = function(content, level){
    var child = [];
    for (var i = 0; i < content.child.length; i++){
        child.push(theme.formObjectsGetCategoryGetRow(content.child[i], level + 1));
    }
    var row = [
        {
            style: {whiteSpace: "nowrap"},
            value: content.name,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view",
                    style: {
                        color: (level == 1)? "red" : "black"
                    }
                },
                text: content.name
            })
        },
        {
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view-cmd",
                    style: {
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        paddingTop: "5px",
                        display: (level == 1)? "none" : ""
                    }
                },
                children: [content.check_category]
            })
        }
    ];
    if (child.length > 0) row.child = child;
    return row;
};

theme.formObjectsGetCategory = function(params){
    var data = [];
    for (var i = 0; i < params.data.length; i++){
        data.push(theme.formObjectsGetCategoryGetRow(params.data[i], 1));
    }
    var inputsearchbox = absol.buildDom({
        tag:'searchcrosstextinput',
        style: {
            width: "100%"
        },
        props:{
            placeholder: LanguageModule.text("txt_search")
        }
    });
    var x = pizo.tableView(
        [
            {value: LanguageModule.text("txt_name"), sort: true},
            {value: ""}
        ],
        data,
        false,
        false,
        0
    );
    x.style.width = "100%";
    x.addInputSearch(inputsearchbox);
    return DOMElement.table({
        data: [
            [inputsearchbox],
            [{attrs: {style: {height: "var(--control-verticle-distance-1)", backgroundColor: "var(--table-background-color)"}}}],
            [DOMElement.div({
                attrs: {className: "cardsimpletableclass"},
                children: [x]
            })]
        ]
    });
};

theme.formObjectsEdit = function(params){
    var buttonlist = [];
    for (var i = 0; i < params.buttonlist.length; i++){
        buttonlist.push(DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [params.buttonlist[i]]
        }));
    }
    var buttonPanel = DOMElement.div({
        attrs: {
            className: "button-panel-header absol-single-page-header"
        },
        children: buttonlist
    });
    return absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            buttonPanel,
           DOMElement.div({
               children: [
                    params.typedata_select,
                    DOMElement.div({
                        attrs: {
                            style: {
                                marginRight: "var(--control-horizontal-distance-2)",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                                verticalAlign: "middle"
                            }
                        },
                        children: [
                            DOMElement.span({
                                attrs: {
                                    style: {
                                        marginRight: "var(--control-horizontal-distance-2)",
                                        lineHeight: "var(--control-height)"
                                    }
                                },
                                text: LanguageModule.text("txt_representative_name")
                            }),
                            DOMElement.div({
                                attrs: {style: {verticalAlign: "middle", display: "inline-block"}},
                                children: [params.name_inputtext]
                            })
                        ]
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                whiteSpace: "nowrap",
                                display: "inline-block",
                                verticalAlign: "middle"
                            }
                        },
                        children: [
                            DOMElement.span({
                                attrs: {
                                    style: {
                                        marginRight: "var(--control-horizontal-distance-2)",
                                        lineHeight: "var(--control-height)"
                                    }
                                },
                                text: LanguageModule.text("txt_active")
                            }),
                            DOMElement.div({
                                attrs: {style: {verticalAlign: "middle", display: "inline-block"}},
                                children: [params.active_checkbox]
                            })
                        ]
                    })
               ]
           }),
            DOMElement.div({
                attrs: {style: {paddingTop: "var(--control-verticle-distance-2)"}},
                children: [
                    DOMElement.div({
                        attrs: {
                            style: {
                                display: "inline-block",
                                verticalAlign: "top"
                            }
                        },
                        children: [params.details_container]
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                display: "inline-block",
                                paddingLeft: "var(--control-horizontal-distance-2)",
                                verticalAlign: "top"
                            }
                        },
                        children: [params.category_container]
                    })
                ]
            })
        ]
    });
};

theme.formObjectsInit = function(params){
    var buttonlist = [];
    for (var i = 0; i < params.buttonlist.length; i++){
        buttonlist.push(DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [params.buttonlist[i]]
        }));
    }
    buttonlist.push(DOMElement.div({
        attrs: {
            className: "single-button-header"
        },
        children: [params.inputsearchbox]
    }));
    var buttonPanel = DOMElement.div({
        attrs: {
            className: "button-panel-header"
        },
        children: buttonlist
    });
    return absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            DOMElement.div({
                attrs: {
                    className: "absol-single-page-header"
                },
                children: [buttonPanel]
            }),
            params.data_container
        ]
    });
};
