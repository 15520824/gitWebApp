'use strict';

theme.editReportForm = function(params){
    var report_name, report_group, owner, share_status, description, summary;
    var object_board, object_type, object_group, report_type, report_filter;
    var keys, maxWidth, general_info_container, filter_info, object_selector_container, filter_table, filter_info_container;
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
            className: "absol-single-page-header button-panel-header"
        },
        children: buttonlist
    });
    maxWidth = 0;
    keys = Object.keys(params.general_info);
    keys.forEach(function(item){
        var tempText = DOMElement.span({text: params.general_info[item].title});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    });
    keys = Object.keys(params.filter_info);
    keys.forEach(function(item){
        var tempText = DOMElement.span({text: params.filter_info[item].title});
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    });
    maxWidth += 10;
    report_name = theme.input({
        type: "text",
        style: {width: "400px"},
        value: params.general_info.report_name.value
    });
    report_group = absol._({
        tag: "selectmenu",
        class: "card-selectmenu",
        style: {
            width: "400px"
        },
        props: {
            items: [],
            value: params.general_info.report_group.value
        }
    });
    description = absol._({
        tag: "textarea",
        style: {
            width: "400px",
        },
        props: {
            rows: 5,
            value: params.general_info.description.value
        }
    });
    owner = absol._({
        tag: "selectmenu",
        class: "card-selectmenu",
        style: {width: "400px"},
        props: {
            items: [],
            value: params.general_info.owner.value
        }
    });
    share_status = absol._({
        tag: "selectmenu",
        class: "card-selectmenu",
        style: {width: "400px"},
        props: {
            items: [],
            value: params.general_info.share_status.value
        }
    });
    summary = absol._({
        tag: "textarea",
        style: {
            width: "400px",
        },
        props: {
            rows: 5,
            value: params.general_info.summary.value
        }
    });
    general_info_container = absol._({
        child: [
            {
                style: {
                    paddingRight: "40px",
                    display: "inline-block"
                },
                child: DOMElement.table({
                    data: [
                        [
                            {
                                attrs: {
                                    style: {
                                        width: maxWidth + "px"
                                    }
                                },
                                text: params.general_info.report_name.title
                            },
                            {attrs: {style: {width: "10px"}}},
                            {
                                children: [report_name]
                            }
                        ],
                        [{attrs: {style: {height: "20px"}}}],
                        [
                            {
                                attrs: {
                                    style: {
                                        width: maxWidth + "px"
                                    }
                                },
                                text: params.general_info.report_group.title
                            },
                            {attrs: {style: {width: "10px"}}},
                            {
                                children: [report_group]
                            }
                        ],
                        [{attrs: {style: {height: "20px"}}}],
                        [
                            {
                                attrs: {
                                    style: {
                                        width: maxWidth + "px"
                                    }
                                },
                                text: params.general_info.description.title
                            },
                            {attrs: {style: {width: "10px"}}},
                            {
                                children: [description]
                            }
                        ]
                    ]
                })
            },
            {
                style: {
                    paddingRight: "40px",
                    display: "inline-block"
                },
                child: DOMElement.table({
                    data: [
                        [
                            {
                                attrs: {
                                    style: {
                                        width: maxWidth + "px"
                                    }
                                },
                                text: params.general_info.owner.title
                            },
                            {attrs: {style: {width: "10px"}}},
                            {
                                children: [owner]
                            }
                        ],
                        [{attrs: {style: {height: "20px"}}}],
                        [
                            {
                                attrs: {
                                    style: {
                                        width: maxWidth + "px"
                                    }
                                },
                                text: params.general_info.share_status.title
                            },
                            {attrs: {style: {width: "10px"}}},
                            {
                                children: [share_status]
                            }
                        ],
                        [{attrs: {style: {height: "20px"}}}],
                        [
                            {
                                attrs: {
                                    style: {
                                        width: maxWidth + "px"
                                    }
                                },
                                text: params.general_info.summary.title
                            },
                            {attrs: {style: {width: "10px"}}},
                            {
                                children: [summary]
                            }
                        ]
                    ]
                })
            }
        ]
    });
    object_board = absol._({
        tag: "checkbox",
        props: params.filter_info.object_board.value,
        on: {
            change: function(){
                if (!this.checked) object_selector_container.addStyle("display", "none");
                else object_selector_container.removeStyle("display");
            }
        }
    });
    object_type = absol._({
        tag: "selectmenu",
        style: {
            width: "500px"
        },
        props: {
            items: [],
            value: params.filter_info.object_type.value
        }
    });
    object_group = absol._({
        tag: "selectmenu",
        style: {
            width: "500px"
        },
        props: {
            items: [],
            value: params.filter_info.object_group.value
        }
    });
    report_type = [];
    var rd_name = "report_type_radio";
    params.filter_info.report_type.items.forEach(function(elt){
        var item = absol.buildDom({
            child: {
                tag: 'radio',
                class: 'left',
                props: {
                    text: elt.text,
                    checked: elt.value == params.filter_info.report_type.value,
                    name: rd_name,
                    value: elt.value
                }
            }
        });
        if (report_type.length > 0) item.addStyle("paddingTop", "20px");
        report_type.push(item);
    });
    var tempWidth;
    var tempText = DOMElement.span({text: params.filter_info.title.toUpperCase()});
    DOMElement.hiddendiv.appendChild(tempText);
    tempWidth = tempText.offsetWidth + 60;
    DOMElement.hiddendiv.removeChild(tempText);
    var arrow = absol._({
        style: {
            width: "0px",
            height: "0px",
            borderLeft: "6px solid transparent",
            borderRight: '6px solid transparent',
            borderTop: '10px solid black',
            cursor: "pointer"
        },
        on: {
            click: function(){
                if (this.status == "open"){
                    this.removeStyle("borderTop");
                    this.addStyle("borderBottom", "10px solid black");
                    this.status = "close";
                    filter_info.addStyle("display", "none");
                }
                else {
                    this.removeStyle("borderBottom");
                    this.addStyle("borderTop", "10px solid black");
                    this.status = "open";
                    filter_info.removeStyle("display");
                }
            }
        }
    });
    arrow.status = 'open';
    object_selector_container = absol._({
        child: DOMElement.table({
            data: [
                [{attrs: {style: {height: "20px"}}}],
                [
                    {
                        attrs: {
                            style: {
                                width: maxWidth + "px"
                            }
                        },
                        text: params.filter_info.object_type.title
                    },
                    {attrs: {style: {width: "10px"}}},
                    {
                        children: [object_type]
                    }
                ],
                [{attrs: {style: {height: "20px"}}}],
                [
                    {
                        attrs: {
                            style: {
                                width: maxWidth + "px"
                            }
                        },
                        text: params.filter_info.object_group.title
                    },
                    {attrs: {style: {width: "10px"}}},
                    {
                        children: [object_group]
                    }
                ]
            ]
        })
    });
    if (!object_board.checked) object_selector_container.addStyle("display", "none");
    var header = [
        {type: "dragzone", sort: false},
        {value: params.filter_table.header.collumn, sort: false},
        {value: params.filter_table.header.display, sort: false},
        {value: params.filter_table.header.collumn_title, sort: false},
        {value: params.filter_table.header.value, sort: false},
        {sort: false},
        {value: params.filter_table.header.data_filter, sort: false},
        {value: params.filter_table.header.last_row, sort: false},
        {sort: false}
    ];
    var data = [];
    params.filter_table.data.forEach(function(elt){

    });
    filter_info = absol._({
        child: DOMElement.table({
            data: [
                [
                    {
                        attrs: {
                            style: {
                                width: maxWidth + "px"
                            }
                        },
                        text: params.filter_info.object_board.title
                    },
                    {attrs: {style: {width: "10px"}}},
                    {
                        children: [object_board]
                    }
                ],
                [{
                    attrs: {
                        colSpan: 3
                    },
                    children: object_selector_container
                }],
                [{attrs: {style: {height: "20px"}}}],
                [
                    {
                        attrs: {
                            style: {
                                width: maxWidth + "px",
                                verticalAlign: "top"
                            }
                        },
                        text: params.filter_info.report_type.title
                    },
                    {attrs: {style: {width: "10px"}}},
                    {
                        children: report_type
                    }
                ]
            ]
        })
    });
    filter_info_container = absol._({
        style: {
            paddingTop: "40px"
        },
        child: [
            {
                style: {
                    paddingBottom: "20px"
                },
                child: [
                    {
                        style: {
                            display: "inline-block",
                            height: "30px",
                            backgroundColor: "#c9f1fd",
                            padding: "10px",
                            verticalAlign: "top"
                        },
                        child: arrow
                    },
                    {
                        style: {
                            display: "inline-block",
                            backgroundColor: "#c9f1fd",
                            height: "30px",
                            width: tempWidth + "px",
                            paddingLeft: "10px",
                            verticalAlign: "top",
                            lineHeight: "30px"
                        },
                        child: {text: params.filter_info.title.toUpperCase()}
                    }
                ]
            },
            filter_info
        ]
    });

    var x = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            buttonPanel,
            {
                child: [
                    general_info_container,
                    filter_info_container
                ]
            }
        ]
    });
    x.getValue = function(){
        return 123456789;
    };
    return x;
};


theme.formReportListLayout = function(params){
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
            className: "absol-single-page-header button-panel-header"
        },
        children: buttonlist
    });
    return absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            buttonPanel,
            DOMElement.table({
                data: [
                    [params.data_container]
                ]
            })
        ]
    });
};

ModuleManagerClass.register({
    name: "My_report_view",
    prerequisites: ["ModalElement"]
});
