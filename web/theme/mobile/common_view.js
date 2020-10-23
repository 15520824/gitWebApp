theme.HeaderBarWithSearh = (function(){
    var _ = absol._;
    var $ = absol.$;
    function HeaderBarWithSearch(){
        this.$disableSearchBtn = _({
            tag: 'button',
            class: ['am-header-bar-left-btn', 'am-header-bar-disable-search-btn'],
            child:{ tag:'i', class: 'material-icons', child:{text:'keyboard_backspace'}},
            on:{
                click: this.eventHandler.clickDisableSearchBtn
            }
        });
        this.addChildBefore(this.$disableSearchBtn, this.firstChild);
    }

    HeaderBarWithSearch.tag = 'headerbarwithsearch';

    HeaderBarWithSearch.render = function(data){
        var searchInput = data.searchInput;
        var res =  _('mheaderbar');
        searchInput.attr('style', undefined);
        res.$searchInput = searchInput;
        res.addChildBefore(searchInput, res.$right);
        return res;
    };

    HeaderBarWithSearch.prototype.searchMode = function(flag){
        if (this.containsClass('am-search-mode') == flag) return;
        if (flag){
            this.addClass('am-search-mode');
            this.$searchInput.focus();
            this._prevActionIcon = this.actionIcon;
        }
        else {
            this.removeClass('am-search-mode');
            this.$searchInput.blur();
            this.$searchInput.value = "";
        }
    };

    HeaderBarWithSearch.eventHandler = {};

    HeaderBarWithSearch.eventHandler.clickDisableSearchBtn = function(event){
        this.searchMode(false);
    };

    absol.coreDom.install(HeaderBarWithSearch);
    return HeaderBarWithSearch;
})();

theme.modalFormMobile = function(params){
    if (params.title === undefined) params.title = "";
    var formcontent;
    var h = DOMElement.div({
        attrs: {
            className: "card-modal-mobile-body-content-ctn"
        }
    });
    if (params.bodycontent !== undefined) h.appendChild(params.bodycontent);
    var buttonElt = DOMElement.div({
        attrs: {
            align: "right",
            style: {
                paddingTop: "20px"
            }
        }
    });
    if (params.buttonList === undefined) params.buttonList = [];
    var color;
    for (var i = 0; i < params.buttonList.length; i++){
        switch (params.buttonList[i].typeColor) {
            case "light":
                color = "var(--a-color)";
                break;
            case "dark":
            default:
                color = "#aaaaaa";
        }
        buttonElt.appendChild(DOMElement.span({
            attrs: {
                style: {
                    color: color,
                    fontWeight: "bold",
                    marginLeft: "20px"
                },
                onclick: function(i) {
                    return function (event, me) {
                        formcontent.remove();
                        params.func(i);
                    }
                } (i)
            },
            text: params.buttonList[i].text.toUpperCase()
        }));
    }
    if (params.buttonList.length > 0) h.appendChild(buttonElt);
    formcontent = DOMElement.div({
        attrs: {
            style: {
                width: "100vw",
                height: "100vh",
                top: 0,
                position: "fixed",
                background: "#0000001a",
                zIndex: 88888
            }
        },
        children: [DOMElement.div({
            attrs: {
                className: "card-modal-mobile-ctn"
            },
            children: [
                DOMElement.div({
                    attrs: {
                        className: "card-modal-mobile-header-ctn"
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-modal-mobile-header-title"
                            },
                            text: params.title
                        }),
                        DOMElement.div({
                            attrs: {
                                className: "card-modal-mobile-close-btn",
                                onclick: function(){
                                    formcontent.remove();
                                }
                            },
                            children: [DOMElement.i({
                                attrs: {
                                    className: "material-icons card-modal-mobile-close-icon"
                                },
                                text: "clear"
                            })]
                        })
                    ]
                }),
                h
            ]
        })]
    });
    document.body.appendChild(formcontent);
};

theme.showForm = function(params){
    var bodycontent;
    var h = DOMElement.div({});
    if (params.title !== undefined){
        h.appendChild(DOMElement.div({
            attrs: {
                style: {
                    textAlign: "center",
                    fontWeight: "bold",
                    paddingBottom: "20px"
                }
            },
            text: params.title
        }));
    }
    if (params.message !== undefined){
        h.appendChild(DOMElement.div({
            attrs: {
                style: {
                    textAlign: "center"
                }
            },
            text: params.message
        }));
    }
    var buttonElt = DOMElement.div({
        attrs: {
            align: "right",
            style: {
                paddingTop: "20px"
            }
        }
    });
    if (params.buttonList === undefined) params.buttonList = [];
    for (var i = 0; i < params.buttonList.length; i++){
        buttonElt.appendChild(DOMElement.span({
            attrs: {
                style: {
                    color: params.buttonList[i].color,
                    fontWeight: "bold",
                    marginLeft: "20px"
                },
                onclick: function(i) {
                    return function (event, me) {
                        bodycontent.remove();
                        params.func(i);
                    }
                } (i)
            },
            text: params.buttonList[i].text.toUpperCase()
        }));
    }
    if (params.buttonList.length > 0) h.appendChild(buttonElt);
    bodycontent = DOMElement.div({
        attrs: {
            style: {
                width: "100vw",
                height: "100vh",
                top: 0,
                position: "fixed",
                background: "#0000001a",
                zIndex: 888888
            }
        },
        children: [DOMElement.div({
            attrs: {
                style: {
                    width: "calc(100vw - 60px)",
                    maxWidth: "400px",
                    paddingTop: "20px",
                    paddingBottom: "10px",
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "15px",
                    margin: "50% auto",
                    boxShadow: "2px 2px 2px 0px #908787"
                }
            },
            children: [h]
        })]
    });
    document.body.appendChild(bodycontent);
};

ModalElement.alert = function (params) {
    var message, func;
    if (typeof params === 'string'){
        message = params;
    }
    else {
        message = params.message;
        func = params.func;
    }
    if (message === undefined) message = "";
    if (func === undefined) func = function () {};
    theme.showForm({
        message: message,
        buttonList: [
            {
                text: LanguageModule.text("txt_ok"),
                color: "var(--a-color)"
            }
        ],
        func: func
    });
};

ModalElement.question = function (params) {
    var message = params.message,title = params.title, h, func = params.onclick;
    if (message === undefined) message = "";
    if (title === undefined) title = "Question";
    if (func === undefined) func = function(){};
    theme.showForm({
        title: title,
        message: message,
        buttonList: [
            {
                text: LanguageModule.text("txt_yes"),
                color: "var(--a-color)"
            },
            {
                text: LanguageModule.text("txt_no"),
                color: "#aaaaaa"
            }
        ],
        func: func
    });
};

ModalElement.question2 = function (params) {
    var message = params.message,title = params.title, h, func = params.onclick;
    if (message === undefined) message = "";
    if (title === undefined) title = "Question";
    if (func === undefined) func = function(){};
    theme.showForm({
        title: title,
        message: message,
        buttonList: [
            {
                text: LanguageModule.text("txt_ok"),
                color: "var(--a-color)"
            },
            {
                text: LanguageModule.text("txt_cancel"),
                color: "#aaaaaa"
            }
        ],
        func: func
    });
};

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
                    icon: 'span.mdi.mdi-picture-in-picture-bottom-right.mdi-rotate-180',
                    cmd: params.cmd.boards
                },
                {
                    text: LanguageModule.text("txt_chat"),
                    icon: 'span.mdi.mdi-chat-outline',
                    cmd: params.cmd.chat
                },
                // {
                //     text: LanguageModule.text("txt_calendar"),
                //     icon: 'span.mdi.mdi-calendar',
                //     cmd: params.cmd.my_calendar
                // },
                {
                    text: LanguageModule.text("txt_activity"),
                    icon: 'span.mdi.mdi-playlist-check',
                    cmd: params.cmd.activities
                },
                {
                    text: LanguageModule.text("txt_reminder"),
                    icon: 'span.mdi.mdi-clock-alert',
                    cmd: params.cmd.reminder
                },
                {
                    text: LanguageModule.text("txt_maps"),
                    icon: 'span.mdi.mdi-google-maps',
                    cmd: params.cmd.maps
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
                    icon: 'span.mdi.mdi-card-account-mail',
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
                    iconName: 'cog-outline'
                }
            },
            items: [
                {
                    text: LanguageModule.text("txt_user_groups"),
                    icon: 'span.mdi.mdi-account-group',
                    cmd: params.cmd.account_group
                },
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
                maxHeight: "130px",
                maxWidth: "130px",
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
    var textId = ("text_" + Math.random() + Math.random()).replace(/\./g, '');
    var signature_inputtext = absol.buildDom({
        tag: 'div',
        class: "container-bot",
        props: {
            id: textId
        }
    });

    var editorSignature;
    var ckedit = absol.buildDom({
        tag: 'attachhook',
        on: {
            error: function () {
                this.selfRemove();
                editorSignature = CKEDITOR.replace(textId, {
                    toolbar: [
                       ['Bold', 'Italic','Underline', 'Strike', 'NumberedList', 'BulletedList', 'Image','Font','FontSize','TextColor','BGColor'],
                   ]
                });
                editorSignature.setData(params.data.signature);
            }
        }
    });
    var card_assign_to_checkbox = absol.buildDom({
        tag: "switch",
        style: {
            'font-size': 'var(--switch-fontsize)',
            position: "absolute",
            right: 0,
            top: 0
        },
        props: {
            checked: params.data.noti.card_assign_to
        }
    });
    var activity_assign_to_checkbox = absol.buildDom({
        tag: "switch",
        style: {
            'font-size': 'var(--switch-fontsize)',
            position: "absolute",
            right: 0,
            top: 0
        },
        props: {
            checked: params.data.noti.activity_assign_to
        }
    });
    var activity_participant_checkbox = absol.buildDom({
        tag: "switch",
        style: {
            'font-size': 'var(--switch-fontsize)',
            position: "absolute",
            right: 0,
            top: 0
        },
        props: {
            checked: params.data.noti.activity_participant
        }
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
                    comment,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_signature")
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-signature-ctn"
                        },
                        children: [signature_inputtext]
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_send_noti")
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit",
                            style: {
                                position: "relative"
                            }
                        },
                        children: [
                            DOMElement.div({text: LanguageModule.text("txt_noti_card_assign_to")}),
                            card_assign_to_checkbox
                        ]
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit",
                            style: {
                                position: "relative"
                            }
                        },
                        children: [
                            DOMElement.div({text: LanguageModule.text("txt_noti_activity_assign_to")}),
                            activity_assign_to_checkbox
                        ]
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit",
                            style: {
                                position: "relative"
                            }
                        },
                        children: [
                            DOMElement.div({text: LanguageModule.text("txt_activity_participant")}),
                            activity_participant_checkbox
                        ]
                    })
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
            user_avatars: params.user_avatars,
            config: {
                signature: editorSignature.getData(),
                noti: {
                    card_assign_to: card_assign_to_checkbox.checked,
                    activity_assign_to: activity_assign_to_checkbox.checked,
                    activity_participant: activity_participant_checkbox.checked
                }
            }
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
    if (params.onchange !== undefined) res.attrs.onchange = params.onchange;
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
