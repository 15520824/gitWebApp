theme.formAccountEdit = function(params){
    var buttonlist = [
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.closeButton({
                onclick: params.cmdbutton.close
            })]
        }),
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.saveButton({
                onclick: params.cmdbutton.save
            })]
        }),
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.saveCloseButton({
                onclick: params.cmdbutton.save_close
            })]
        })
    ];
    var buttonPanel = DOMElement.div({
        attrs: {
            className: "button-panel-header"
        },
        children: buttonlist
    });
    var username_inputtext = theme.input({
        style: {width: "100%"},
        value: params.data.username
    });
    if (params.type == "edit") username_inputtext.disabled = true;
    var email_inputtext = theme.input({
        type :"email",
        style: {width: "100%"},
        value: params.data.emailadd
    });
    var fullname_inputtext = theme.input({
        value: params.data.fullname,
        style: {width: "100%"}
    });

    var priv_inputselect = absol.buildDom({
        tag: 'selectmenu',
        style: {width: "100%"},
        props:{
            value: params.data.privmode,
            items: params.data.privmodeList
        }
    });
    var language_inputselect = absol.buildDom({
        tag: 'selectmenu',
        style: {width: "100%"},
        props:{
            value: params.data.language,
            items: params.data.languageList
        }
    });
    var comment_inputtext = DOMElement.textarea({
        attrs: {
            className: "cardSimpleTextarea",
            style: {
                width :"100%",
                height: "100px"
            },
            value: params.data.comment
        }
    });
    var activated_inputselect = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': "var(--switch-fontsize)"
        },
        props:{
            checked: params.data.activemode
        }
    });
    var password_inputtext = theme.input({
        type: "password",
        style: {width: "100%"},
        autocomplete: 'new-password'
    });

    var password2_inputtext = theme.input({
        type: "password",
        style: {width: "100%"},
        autocomplete: 'new-password'
    });
    var cellrepasswordlabel = DOMElement.div({
        attrs: {
            className: "card-mobile-label-form-edit"
        },
        text: LanguageModule.text("txt_reinput_password_new")
    });
    var cellrepasswordinput =  password2_inputtext;
    var cellnewpasswordlabel = DOMElement.div({
        attrs: {
            className: "card-mobile-label-form-edit"
        },
        text: LanguageModule.text("txt_new_password")
    });
    var cellnewpasswordinput =  password_inputtext;
    if (params.type == "edit"){
        cellrepasswordlabel.style.display = "none";
        cellnewpasswordlabel.style.display = "none";
        cellrepasswordinput.style.display = "none";
        cellnewpasswordinput.style.display = "none";
    }
    var change = 0;
    var change_pass_text_cell = DOMElement.div({
        attrs: {style: {paddingTop: "var(--control-verticle-distance-2)"}},
        children: [DOMElement.a({
            attrs:{
                style: {
                    cursor: "pointer",
                    color: "var(--a-color)"
                },
                onclick:  function(event,me){
                    if (change == 0){
                        change = 1;
                        me.text = LanguageModule.text("txt_hide_change_password");
                        cellrepasswordlabel.style.display = "";
                        cellrepasswordinput.style.display = "";
                        cellnewpasswordlabel.style.display = "";
                        cellnewpasswordinput.style.display = "";
                        password_inputtext.setAttribute('type', "password");
                        password2_inputtext.setAttribute('type', "password");
                    }
                    else {
                        change = 0;
                        me.text = LanguageModule.text("txt_change_password");
                        cellrepasswordlabel.style.display = "none";
                        cellrepasswordinput.style.display = "none";
                        cellnewpasswordlabel.style.display = "none";
                        cellnewpasswordinput.style.display = "none";
                        password_inputtext.setAttribute('type', "text");
                        password2_inputtext.setAttribute('type', "text");
                    }
                }
            },
            text: LanguageModule.text("txt_change_password")
        })]
    });
    if (params.type == "add") change_pass_text_cell.style.display = "none";
    var singlePage = absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            DOMElement.div({
                attrs: {
                    className: "absol-single-page-header"
                },
                children: [buttonPanel]
            }),
            DOMElement.div({
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit-first"
                        },
                        text: LanguageModule.text("txt_account")
                    }),
                    username_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_fullname")
                    }),
                    fullname_inputtext,
                    change_pass_text_cell,
                    cellnewpasswordlabel,
                    cellnewpasswordinput,
                    cellrepasswordlabel,
                    cellrepasswordinput,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_email")
                    }),
                    email_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_language")
                    }),
                    language_inputselect,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_comment")
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
                    })
                ]
            })
        ]
    });
    singlePage.getValue = function(){
        var emailadd = email_inputtext.value;
        if (!contentModule.filterEmail.test(emailadd)){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_email_invalid"),
                func: function(){
                    email_inputtext.focus();
                }
            });
            return;
        }
        if (fullname_inputtext.value == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_fullname"),
                func: function(){
                   fullname_inputtext.focus();
                }
            });
            return;
        }
        var data = {
            priv: priv_inputselect.value,
            fullname: fullname_inputtext.value,
            comment: comment_inputtext.value,
            available: activated_inputselect.checked,
            language: language_inputselect.value
        };
        if (params.type == "add") {
            if (username_inputtext.value == ""){
                ModalElement.alert({
                    message: LanguageModule.text("war_no_username"),
                    func: function(){
                        username_inputtext.focus();
                    }
                });
                return;
            }
            if (password_inputtext.value == ""){
                ModalElement.alert({
                    message: LanguageModule.text("war_no_password"),
                    func: function(){
                        password_inputtext.focus();
                    }
                });
                return;
            }
            data.username = username_inputtext.value;
            data.password = password_inputtext.value;
            data.email = email_inputtext.value;
            if (password_inputtext.value != password2_inputtext.value) {
                ModalElement.alert({
                    message: LanguageModule.text("war_password_nomatch"),
                    func: function(){
                        password_inputtext.focus();
                    }
                });
                return;
            }
        }
        else {
            if (change == 1) {
                if (password_inputtext.value == ""){
                    ModalElement.alert({
                        message: LanguageModule.text("war_no_password"),
                        func: function(){
                            password_inputtext.focus();
                        }
                    });
                    return;
                }
                if (password_inputtext.value != password2_inputtext.value) {
                    ModalElement.alert({
                        message: LanguageModule.text("war_password_nomatch"),
                        func: function(){
                            password_inputtext.focus();
                        }
                    });
                    return;
                }
                data.password = password_inputtext.value.trim();
            }
            data.email = email_inputtext.value;
        }
        return data;
    };
    return singlePage;
};

theme.formAccountInit = function(params){
    var buttonlist = [
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.closeButton({
                onclick: params.cmdbutton.close
            })]
        }),
        DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [theme.addButton({
                onclick: params.cmdbutton.add
            })]
        })
    ];
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

theme.formAccountContentData = function(params){
    var data = [], celldata;
    for (var i = 0; i < params.content.length; i++){
        celldata = [
            "",
            {
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view",
                        style: {
                            textAlign: "center"
                        }
                    },
                    text: i + 1
                }),
                value: i + 1
            },
            {
                style: {whiteSpace: "nowrap"},
                value: params.content[i].username,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: params.content[i].username
                })
            },
            {
                value: params.content[i].fullname,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: params.content[i].fullname
                })
            },
            {
                style: {whiteSpace: "nowrap"},
                value: params.content[i].email,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: params.content[i].email
                })
            },
            {
                value: params.content[i].time,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: params.content[i].time
                })
            },
            {
                value: params.content[i].privilege,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: params.content[i].privilege
                })
            },
            {
                value: (params.content[i].available == 1)? LanguageModule.text("txt_yes") : LanguageModule.text("txt_no"),
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: (params.content[i].available == 1)? LanguageModule.text("txt_yes") : LanguageModule.text("txt_no")
                })
            },
            {
                value: params.content[i].language,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: params.content[i].language
                })
            },
            {
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view",
                        title: params.content[i].comment
                    },
                    children: [DOMElement.div({
                        attrs: {
                            style: {
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                height: "14px"
                            }
                        },
                        text: params.content[i].comment
                    })]
                }),
                value: params.content[i].comment
            }
        ];
        if (params.content[i].quickMenuItems.length > 0){
            var qmenuButton = DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-black"
                },
                text: "more_vert"
            });

            absol.QuickMenu.showWhenClick(qmenuButton, {items: params.content[i].quickMenuItems}, [3, 4], function (menuItem) {
                if (menuItem.cmd) menuItem.cmd();
            });
            celldata.push({
                style: {align: "center"},
                element: qmenuButton
            });
        }
        else {
            celldata.push({});
        }
        data.push(celldata);
    }
    var x = pizo.tableView(
        [
            {type: "dragzone", style: {paddingLeft: "var(--control-verticle-distance-1)", paddingRight: "var(--control-verticle-distance-1)", width: "40px"}},
            {value: LanguageModule.text("txt_index"), style: {width: "40px"}},
            {value: LanguageModule.text("txt_account"), sort: true},
            {value: LanguageModule.text("txt_fullname"), sort: true},
            {value: LanguageModule.text("txt_email"), sort: true},
            {value: LanguageModule.text("txt_last_access"), sort: true},
            {value: LanguageModule.text("txt_admin"), sort: true},
            {value: LanguageModule.text("txt_active"), sort: true},
            {value: LanguageModule.text("txt_language"), sort: true},
            {value: LanguageModule.text("txt_note"), sort: true},
            {value: "", style: {width: "40px"}}
        ],
        data,
        false,
        true
    );
    x.addInputSearch(params.inputsearchbox);
    return x;
};
ModuleManagerClass.register({
    name: "Account_view",
    prerequisites: ["ModalElement"]
});
