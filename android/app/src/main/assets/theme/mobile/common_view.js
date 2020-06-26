theme.quickmenu = function(menuItems){
    var trigger = DOMElement.i({
        attrs: {
            className: "material-icons " +  DOMElement.dropdownclass.button,
            style: {
                fontSize: "20px",
                cursor: "pointer",
                color: "#929292"
            },
            onmouseout: function(event, me){
                me.style.color = "#929292";
            },
            onmouseover: function(event, me){
                me.style.color = "black";
            }
        },
        text: "more_vert"
    });
    absol.QuickMenu.showWhenClick(trigger, {items: menuItems}, 'auto', function (menuItem) {
        if (menuItem.cmd) menuItem.cmd();
    });
    return trigger;
};

theme.layoutInit = function(params){
    return absol.buildDom({
        class: 'am-application',
        child: [
            params.tabPanel,
            params.tabBar
        ]
    });
};

theme.menuHeader = function(params){
    var listmenuhorizontal = [
        {
            text: LanguageModule.text("txt_works"),
            icon: {
               class: 'am-mdi-rect',
               style: {
                   backgroundColor: 'rgb(136, 136, 136)'
               },
                child: {
                    class: 'material-icons',
                    style: {
                        color: "white"
                    },
                    child:{text:'work_outline'}
                }
            },
            items: [
                {
                    text: LanguageModule.text("txt_boards"),
                    icon: 'span.mdi.mdi-file-table-outline',
                    cmd: params.cmd.boards
                },
                {
                    text: LanguageModule.text("txt_chat"),
                    icon: 'span.mdi.mdi-chat-outline',
                    cmd: params.cmd.chat
                },
                {
                    text: LanguageModule.text("txt_calendar"),
                    icon: 'span.mdi.mdi-calendar',
                    cmd: params.cmd.my_calendar
                },
                {
                    text: LanguageModule.text("txt_activity"),
                    icon: 'span.mdi.mdi-clock',
                    cmd: params.cmd.activities
                },
                {
                    text: LanguageModule.text("txt_reminder"),
                    icon: 'span.mdi.mdi-clock-alert',
                    cmd: params.cmd.reminder
                }
            ]
        },
        {
            text: LanguageModule.text("txt_menu_lists"),
            icon: {
                tag: 'mmdirect',
                style: {
                    backgroundColor: 'rgb(62, 153, 194)'
                },
                props: {
                    iconName: 'view-list'
                }
            },
            items: [
                {
                    text: LanguageModule.text("txt_company"),
                    icon: 'span.mdi.mdi-warehouse',
                    cmd: params.cmd.company
                },
                {
                    text: LanguageModule.text("txt_contact"),
                    icon: 'span.mdi.mdi-contact-mail',
                    cmd: params.cmd.contact
                }
            ]
        },
        {
            text: LanguageModule.text("txt_system"),
            icon: {
                tag: 'mmdirect',
                style: {
                    backgroundColor: 'rgb(136, 136, 136)'
                },
                props: {
                    iconName: 'settings-outline'
                }
            },
            items: [
                {
                    text: LanguageModule.text("txt_personal_profile"),
                    icon: 'span.mdi.mdi-file-account',
                    cmd: params.cmd.personal_profile
                },
                {
                    text: LanguageModule.text("txt_log_out"),
                    icon: 'span.mdi.mdi-logout',
                    cmd: params.cmd.logout
                }
            ]
        }
    ];
    var horizontalMenu = absol.buildDom({
        tag:'mmatmenu',
        props:{
            items: listmenuhorizontal
        },
        on:{
            press:function(event){
                var item = event.menuItem;
                if (item.cmd) item.cmd();
                this.activeTab = -1;
            }
        }
    });
    return horizontalMenu;
};

theme.formPersonalProfile = function(params){
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className:"material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_personal_profile"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className:"material-icons"
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
    console.log(header);
    var fullname = theme.input({
        style: {
            width: "100%"
        },
        value: params.data.fullname
    });
    var username = theme.input({
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.data.username
    });

    var language = absol.buildDom({
        tag: 'selectmenu',
        style: {
            display: "block",
            width: "100%"
        },
        props:{
            value: params.data.language,
            items: params.data.languageList
        }
    });
    var email = theme.input({
        style: {
            width: "100%"
        },
        value: params.data.email
    });
    var comment = DOMElement.textarea({
        attrs: {
            className: "cardSimpleTextarea",
            style: {
                width: "100%",
                height: "100px"
            },
            value: params.data.comment
        }
    });
    var celloldpasswordlabel = DOMElement.div({
        attrs: {
            className: "card-mobile-label-form-edit",
            style: {
                display: "none"
            }
        },
        text: LanguageModule.text("txt_old_password")
    });
    var oldpassword = theme.input({
        style: {
            width: "100%",
            display: "none"
        }
    });
    var celloldpasswordinput = oldpassword;
    var cellnewpasswordlabel = DOMElement.div({
        attrs: {
            className: "card-mobile-label-form-edit",
            style: {
                display: "none"
            }
        },
        text: LanguageModule.text("txt_new_password")
    });
    var newpassword = theme.input({
        style: {
            width: "100%",
            display: "none"
        }
    });
    var cellnewpasswordinput = newpassword;
    var cellrepasswordlabel = DOMElement.div({
        attrs: {
            className: "card-mobile-label-form-edit",
            style: {
                display: "none"
            }
        },
        text: LanguageModule.text("txt_reinput_password_new")
    });
    var repassword = theme.input({
        style: {
            width: "100%",
            display: "none"
        }
    });
    var cellrepasswordinput = repassword;
    var logo_img = DOMElement.img({
        attrs: {
            style: {
                maxHeight: "110px",
                maxWidth: "110px",
                cursor: "pointer",
                display: "inline-block"
            },
            src: params.data.user_avatars
        }
    });
    var logo_cell = DOMElement.div({
        attrs: {
            align: "center",
            style: {
                height: "130px",
                backgroundColor: "#ffffff",
                textAlign: "center",
                cursor: "pointer",
                verticalAlign: "middle",
                display: "table-cell"
            },
            onclick: function(event, me){
                pizo.xmlModalDragImage.createModal(document.body,function(){
                   var src = pizo.xmlModalDragImage.imgUrl.src;
                   params.user_avatars = src;
                   logo_img.src = src;
               });
            }
        },
        children: [logo_img]
    });
    var change = 0;
    var singlePage = DOMElement.div({
        attrs: {style: {height: "100%"}},
        children: [
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
                        text: LanguageModule.text("txt_account")
                    }),
                    username,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_fullname")
                    }),
                    fullname,
                    DOMElement.div({
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
                                        celloldpasswordlabel.style.display = "";
                                        celloldpasswordinput.style.display = "";
                                        cellnewpasswordlabel.style.display = "";
                                        cellnewpasswordinput.style.display = "";
                                        cellrepasswordlabel.style.display = "";
                                        cellrepasswordinput.style.display = "";
                                        oldpassword.setAttribute('type', "password");
                                        oldpassword.focus();
                                        newpassword.setAttribute('type', "password");
                                        repassword.setAttribute('type', "password");
                                    }
                                    else {
                                        change = 0;
                                        me.text = LanguageModule.text("txt_change_password");
                                        celloldpasswordlabel.style.display = "none";
                                        celloldpasswordinput.style.display = "none";
                                        cellnewpasswordlabel.style.display = "none";
                                        cellnewpasswordinput.style.display = "none";
                                        cellrepasswordlabel.style.display = "none";
                                        cellrepasswordinput.style.display = "none";
                                        oldpassword.setAttribute('type', "text");
                                        newpassword.setAttribute('type', "text");
                                        repassword.setAttribute('type', "text");
                                        oldpassword.value = "";
                                        newpassword.value = "";
                                        repassword.value = "";
                                    }
                                }
                            },
                            text: LanguageModule.text("txt_change_password")
                        })]
                    }),
                    celloldpasswordlabel,
                    celloldpasswordinput,
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
                    email,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_language")
                    }),
                    language,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_avatar")
                    }),
                    DOMElement.div({
                        attrs: {
                            align: "center",
                            style: {
                                border: "1px solid #d6d6d6",
                                width: "130px",
                                borderRadius: "3px"
                            }
                        },
                        children: [
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        display: "table-cell"
                                    }
                                },
                                children: [logo_cell]
                            })
                        ]
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_comment")
                    }),
                    comment
                ]
            })
        ]
    });
    singlePage.getValue = function(){
        var emailadd = email.value.trim();
        if (!contentModule.filterEmail.test(emailadd)){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_email_invalid"),
                func: function(){
                    email.focus();
                }
            });
            return;
        }
        if (fullname.value.trim() == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_no_fullname"),
                func: function(){
                   fullname.focus();
                }
            });
            return;
        }
        var data = {
            fullname: fullname.value.trim(),
            email: emailadd,
            comment: comment.value.trim(),
            language: language.value,
            user_avatars: params.user_avatars
        };
        if (change == 1) {
            if (oldpassword.value.trim() == ""){
                ModalElement.alert({
                    message: LanguageModule.text("txt_old_password_is_null"),
                    func: function(){
                        oldpassword.focus();
                    }
                });
                return;
            }
            if (newpassword.value.trim() == ""){
                ModalElement.alert({
                    message: LanguageModule.text("txt_password_is_null"),
                    func: function(){
                        newpassword.focus();
                    }
                });
                return;
            }
            if (newpassword.value != repassword.value) {
                ModalElement.alert({
                    message: LanguageModule.text("war_password_nomatch"),
                    func: function(){
                        repassword.focus();
                    }
                });
                return;
            }
            data.newpassword = newpassword.value.trim();
            data.oldpassword = oldpassword.value.trim();
        }
        return data;
    };
    return singlePage;
};

theme.formConfirmPassword = function(params){
    ModalElement.showWindow({
        index: 1,
        closebutton: false,
        title: LanguageModule.text("txt_confirm_password"),
        bodycontent: DOMElement.table({
            data: [
                [
                    {},{},params.notification
                ],
                [
                    {
                        attrs: {style: {whiteSpace: "nowrap"}},
                        text: LanguageModule.text("txt_password")
                    },
                    {attrs: {style: {width: "10px"}}},
                    params.password_confirm
                ],
                [{attrs: {style: {height: "20px"}}}],
                [{
                    attrs :{
                        colSpan: 3,
                        align: "center"
                    },
                    children: [DOMElement.table({
                        data: [[
                            {
                                children: [theme.noneIconButton({
                                    onclick: params.func.ok,
                                    text: LanguageModule.text("txt_ok")
                                })]
                            },
                            {
                                attrs: {style: {width: carddone.menu.distanceButtonForm}}
                            },
                            {
                                children: [theme.noneIconButton({
                                    onclick: params.func.close,
                                    text: LanguageModule.text("txt_close")
                                })]
                            }
                        ]]
                    })]
                }]
            ]
        })
    });
};

theme.checkbox = function(params){
   var res = {
       tag: "checkbox",
       props: {},
       on: {}
   };
   if (params.class !== undefined) res.class = params.class;
   if (params.checked !== undefined) res.props.checked = params.checked;
   if (params.disabled !== undefined) res.props.disabled = params.disabled;
   if (params.text !== undefined) res.props.text = params.text;
   if (params.cursor !== undefined) res.props.cursor = params.cursor;
   if (params.onchange !== undefined) res.on.change = params.onchange;
   return absol.buildDom(res);
};

theme.input = function(params){
    var res = {
        attrs: {
            className: "cardsimpleInput",
            type: "text"
        }
    };
    if (params.style !== undefined) res.attrs.style = params.style;
    if (params.value !== undefined) res.attrs.value = params.value;
    if (params.disabled !== undefined) res.attrs.disabled = params.disabled;
    if (params.onkeyup !== undefined) res.attrs.onkeyup = params.onkeyup;
    if (params.onkeydown !== undefined) res.attrs.onkeydown = params.onkeydown;
    if (params.align !== undefined) res.attrs.align = params.align;
    if (params.placeholder !== undefined) res.attrs.placeholder = params.placeholder;
    if (params.type !== undefined) res.attrs.type = params.type;
    if (params.autocomplete !== undefined) res.attrs.autocomplete = params.autocomplete;
    return DOMElement.input(res);
};
ModuleManagerClass.register({
    name: "Common_view",
    prerequisites: ["ModalElement"]
});
