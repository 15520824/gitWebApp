'use strict';

theme.getContentPreviewMailActivity = function (params) {
    var getStatusName = function(status){
        if (status){
            return LanguageModule.text("txt_yes");
        }
        else {
            return LanguageModule.text("txt_no");
        }
    }
    var attrsCell = {
        style: {
            marginTop: "10px",
            marginBottom: "10px",
            minHeight: "30px",
            lineHeight: "30px",
            paddingLeft: "5px",
            paddingRight: "5px",
            borderRadius: "3px",
            border: "1px solid #d6d6d6"
        }
    };
    var generalElt = DOMElement.div({
        children: [
            DOMElement.p({
                attrs: {
                    style: {
                        minHeight: "30px",
                        lineHeight: "30px"
                    }
                },
                children: [
                    DOMElement.span({
                        attrs: {style: {fontWeight: "bold"}},
                        text: LanguageModule.text("txt_assigned_to") + ": "
                    }),
                    DOMElement.span({text: params.ownerName})
                ]
            }),
            DOMElement.p({
                attrs: {
                    style: {
                        minHeight: "30px",
                        lineHeight: "30px"
                    }
                },
                children: [
                    DOMElement.span({
                        attrs: {style: {fontWeight: "bold"}},
                        text: LanguageModule.text("txt_board") + ": "
                    }),
                    DOMElement.span({text: params.boardName})
                ]
            }),
            DOMElement.p({
                attrs: {
                    style: {
                        minHeight: "30px",
                        lineHeight: "30px"
                    }
                },
                children: [
                    DOMElement.span({
                        attrs: {style: {fontWeight: "bold"}},
                        text: LanguageModule.text("txt_card") + ": "
                    }),
                    DOMElement.span({text: params.cardName})
                ]
            })
        ]
    });
    if (params.companyData.length > 0 || params.contactData.length > 0){
        generalElt.appendChild(DOMElement.div({
            attrs: {
                style: {
                    minHeight: "30px",
                    lineHeight: "30px",
                    fontWeight: "bold"
                }
            },
            children: [DOMElement.span({text: LanguageModule.text("txt_company") + "/ " + LanguageModule.text("txt_contact")})]
        }));
    }
    for (var i = 0; i < params.companyData.length; i++){
        generalElt.appendChild(DOMElement.div({
            attrs: {
                style: {
                    minHeight: "30px",
                    lineHeight: "30px",
                    paddingLeft: "20px"
                }
            },
            children: [DOMElement.span({text: params.companyData[i]})]
        }));
    }
    for (var i = 0; i < params.contactData.length; i++){
        generalElt.appendChild(DOMElement.div({
            attrs: {
                style: {
                    minHeight: "30px",
                    lineHeight: "30px",
                    paddingLeft: "20px"
                }
            },
            children: [DOMElement.span({text: params.contactData[i]})]
        }));
    }
    generalElt.appendChild(DOMElement.p({
        attrs: {
            style: {
                minHeight: "30px",
                lineHeight: "30px"
            }
        },
        children: [
            DOMElement.span({
                attrs: {style: {fontWeight: "bold"}},
                text: LanguageModule.text("txt_period") + ": "
            }),
            DOMElement.span({text: params.listName})
        ]
    }));
    generalElt.appendChild(DOMElement.p({
        attrs: {
            style: {
                minHeight: "30px",
                lineHeight: "30px"
            }
        },
        children: [
            DOMElement.span({
                attrs: {style: {fontWeight: "bold"}},
                text: LanguageModule.text("txt_important") + ": "
            }),
            DOMElement.span({text: carddone.activities.getImportantName(params.favorite)})
        ]
    }));
    var activityListElt = DOMElement.div({ attrs: { style: { paddingTop: "10px", paddingBottom: "10px" } } });
    var lastDate = 0;
    var aDate, activityItemElt;
    var attrsText = {
        style: {
            minHeight: "30px",
            lineHeight: "30px"
        }
    };
    var attrsTitle = { style: { fontWeight: "bold", minHeight: "30px", lineHeight: "30px" } };
    var attrsTHfirst = {
        style: {
            fontWeight: "bold",
            height: "40px",
            lineHeight: "40px",
            textAlign: " center",
            backgroundColor: "#ebebeb",
            border: "1px solid #ddd"
        }
    };
    var attrsTH = {
        style: {
            fontWeight: "bold",
            height: "40px",
            lineHeight: "40px",
            textAlign: " center",
            backgroundColor: "#ebebeb",
            borderRight: "1px solid #ddd",
            borderTop: "1px solid #ddd",
            borderBottom: "1px solid #ddd"
        }
    };
    var attrsTDfirst = {
        style: {
            height: "40px",
            lineHeight: "40px",
            padding: "5px",
            border: "1px solid #ddd"
        }
    };
    var attrsTD = {
        style: {
            height: "40px",
            lineHeight: "40px",
            padding: "5px",
            borderRight: "1px solid #ddd",
            borderTop: "1px solid #ddd",
            borderBottom: "1px solid #ddd"
        }
    };
    params.activityList.forEach(function (item) {
        aDate = parseInt((item.timeSort.getTime()) / 86400000, 10);
        if (aDate != lastDate) {
            activityListElt.appendChild(DOMElement.div({
                attrs: {
                    style: {
                        marginTop: "10px",
                        marginBottom: "10px",
                        height: "30px",
                        lineHeight: "30px",
                        backgroundColor: "#e4e1f5",
                        textAlign: "center",
                        border: "1px solid #d6d6d6"
                    }
                },
                text: contentModule.formatTimeDisplay(item.timeSort)
            }));
            lastDate = aDate;
        }
        activityItemElt = [DOMElement.div({})];
        switch (item.type_activity) {
            case 'task':
                var participantName = "";
                item.participant.forEach(function (x, index) {
                    if (index > 0) participantName += ", ";
                    participantName += contentModule.getUsernameFullnameByhomeid(data_module.users, x);
                });
                activityItemElt = [
                    DOMElement.div({
                        attrs: attrsTitle,
                        children: [DOMElement.span({ text: LanguageModule.text("txt_task") })]
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                paddingLeft: "30px"
                            }
                        },
                        children: [
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_work") + ": " + item.work
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_due_date") + ": " + contentModule.formatTimeMinuteDisplay(item.due_date)
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_assigned_to") + ": " + contentModule.getUsernameFullnameByhomeid(data_module.users, item.assigned_to)
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_participant") + ": " + participantName
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_complete") + ": " + getStatusName(item.status)
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        minHeight: "30px"
                                    }
                                },
                                text: LanguageModule.text("txt_result") + ": " + item.result
                            })
                        ]
                    })
                ];
                break;
            case 'call':
                activityItemElt = [
                    DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_call")
                    }),
                    DOMElement.div({
                        attrs: { style: { paddingLeft: "30px" } },
                        children: [
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_call_to") + ": " + item.call_to
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_work") + ": " + item.work
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_due_date") + ": " + contentModule.formatTimeMinuteDisplay(item.due_date)
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_assigned_to") + ": " + contentModule.getUsernameFullnameByhomeid(data_module.users, item.assigned_to)
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_complete") + ": " + getStatusName(item.status)
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        minHeight: "30px"
                                    }
                                },
                                text: LanguageModule.text("txt_result") + ": " + item.result
                            })
                        ]
                    })
                ];
                break;
            case 'meeting':
                var participantName = "";
                item.participant.forEach(function (x, index) {
                    if (index > 0) participantName += ", ";
                    participantName += contentModule.getUsernameFullnameByhomeid(data_module.users, x);
                });
                activityItemElt = [
                    DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_meeting")
                    }),
                    DOMElement.div({
                        attrs: { style: { paddingLeft: "30px" } },
                        children: [
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_meeting_name") + ": " + item.name
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_location") + ": " + item.location
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_type") + ": " + item.type
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_start_date") + ": " + contentModule.formatTimeMinuteDisplay(item.timestart)
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_assigned_to") + ": " + contentModule.getUsernameFullnameByhomeid(data_module.users, item.assigned_to)
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_complete") + ": " + getStatusName(item.status)
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        minHeight: "30px"
                                    }
                                },
                                text: LanguageModule.text("txt_result") + ": " + item.result
                            })
                        ]
                    })
                ];
                break;
            case 'field':
                activityItemElt = [];
                item.details.forEach(function (x, index) {
                    activityItemElt.push(DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_field") + ": " + x.name
                    }));
                    activityItemElt.push(DOMElement.div({
                        attrs: {
                            style: { paddingLeft: "30px" }
                        },
                        children: [params.getObjectbyType(x.typeid, x.valueid)]
                    }));
                });
                break;
            case 'chat':
                var createMessage = function (data) {
                    var styleText, styleImg;
                    if (data.type == "me") {
                        styleText = {
                            border: "1px solid #ddd",
                            padding: "10px",
                            marginRight: "5px",
                            marginTop: "2px",
                            maxWidth: "70%",
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                            display: "inline-block",
                            backgroundColor: "#DBF4FD",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                            textAlign: "left",
                            verticalAlign: "middle"
                        };
                        styleImg = {
                            border: "1px solid #ddd",
                            marginRight: "5px",
                            padding: "1px",
                            marginTop: "2px",
                            maxWidth: "50%",
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                            display: "inline-block",
                            backgroundColor: "#DBF4FD",
                            verticalAlign: "middle"
                        };
                    }
                    else {
                        styleText = {
                            padding: "10px",
                            marginTop: "1px",
                            marginleft: "5px",
                            border: "1px solid #ddd",
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                            display: "inline-block",
                            backgroundColor: "rgb(241, 240, 240)",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            verticalAlign: "middle"
                        };
                        styleImg = {
                            maxWidth: "50%",
                            marginTop: "2px",
                            padding: "1px",
                            marginLeft: "5px",
                            border: "1px solid #ddd",
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                            display: "inline-block",
                            backgroundColor: "rgb(241, 240, 240)",
                            verticalAlign: "middle"
                        };
                    }
                    var styleMessLine = {
                        display: "block",
                        whiteSpace: "nowrap"
                    };
                    var styleLineSeen = {
                        margin: "10px",
                        color: "red",
                        textAlign: "center"
                    };
                    var res, messelt;
                    switch (data.content_type) {
                        case "text":
                            var texts;
                            var aobjs = absol.parseMessage(data.content);// trả về một array theo cú pháp absol
                            // thêm vài thuộc tính cho thẻ a
                            aobjs.forEach(function (aobj) {
                                if (aobj.tag == 'a') {
                                    aobj.attr = aobj.attr || {};
                                    aobj.attr.target = '_blank';// mở tab mới
                                    aobj.style = aobj.style || {};
                                    aobj.style.cursor = "pointer";
                                    aobj.style.textDecoration = "underline";
                                }
                            });

                            texts = aobjs.map(function (aobj) {
                                return absol._(aobj);// chuyển qua dom object cho giống code cũ
                            });


                            res = DOMElement.div({
                                attrs: {
                                    styleMessLine: styleMessLine
                                }
                            });
                            messelt = DOMElement.div({
                                attrs: {
                                    style: styleText
                                },
                                children: texts
                            });
                            res.appendChild(messelt);
                            break;
                        case "img":
                            var srcimg = window.domain + "./uploads/images/" + data.localid + "_" + data.content + ".upload";
                            messelt = DOMElement.div({
                                attrs: {
                                    style: styleImg
                                },
                                children: [DOMElement.img({
                                    attrs: {
                                        style: {
                                            maxHeight: "100%",
                                            maxWidth: "100%"
                                        },
                                        src: srcimg,
                                        download: data.content
                                    }
                                })]
                            });
                            res = DOMElement.div({
                                attrs: {
                                    styleMessLine: styleMessLine
                                }
                            });
                            res.appendChild(messelt);
                            break;
                        case "file":
                            messelt = DOMElement.div({
                                attrs: {
                                    style: styleText
                                },
                                children: [
                                    DOMElement.a({
                                        attrs: {
                                            href: window.domain + "./uploads/files/" + data.localid + "_" + data.content + ".upload",
                                            download: data.content,
                                            style: {
                                                color: "black",
                                                cursor: "pointer"
                                            }
                                        },
                                        text: data.content
                                    })
                                ]
                            });
                            res = DOMElement.div({
                                attrs: {
                                    styleMessLine: styleMessLine
                                }
                            });
                            res.appendChild(messelt);
                            break;
                        case "add_member":
                            var listMemberText = "";
                            var userIndex;
                            for (var i = 0; i < data.content.length; i++) {
                                userIndex = data_module.users.getByhomeid(data.content[i]);
                                if (i > 0) listMemberText += ", ";
                                listMemberText += data_module.users[userIndex].fullname;
                            }
                            res = absol.buildDom({
                                style: styleLineSeen,
                                child: [absol.buildDom({
                                    tag: "unreadmessageline",
                                    props: {
                                        text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã thêm " + listMemberText
                                    }
                                })]
                            });
                            break;
                        case "create":
                            res = absol.buildDom({
                                style: styleLineSeen,
                                child: [absol.buildDom({
                                    tag: "unreadmessageline",
                                    props: {
                                        text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tạo nhóm."
                                    }
                                })]
                            });
                            break;
                        case "join":
                            res = absol.buildDom({
                                style: styleLineSeen,
                                child: [absol.buildDom({
                                    tag: "unreadmessageline",
                                    props: {
                                        text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tham gia nhóm."
                                    }
                                })]
                            });
                            break;
                        default:
                            res = DOMElement.div({});
                            break;
                    }
                    return res;
                };
                var lastUserChatid = 0, lastVMessageGroup;
                var addMessage = function (content) {
                    if (content.content_type != "file" && content.content_type != "img" && content.content_type != "text") {
                        var singleMessage = createMessage(content);
                        vBoxMessage.appendChild(singleMessage);
                        lastUserChatid = 0;
                    }
                    else {
                        if (lastUserChatid !== content.userid) {
                            if (content.type == "me") {
                                lastVMessageGroup = DOMElement.div({
                                    attrs: {
                                        style: {
                                            textAlign: "right",
                                            paddingTop: "10px",
                                            paddingBottom: "10px"
                                        }
                                    },
                                    children: [
                                        DOMElement.div({
                                            attrs: {
                                                style: {
                                                    fontSize: "12px",
                                                    paddingRight: "5px"
                                                }
                                            },
                                            text: contentModule.getTimeMessage(content.m_time)
                                        })
                                    ]
                                });
                                vBoxMessage.appendChild(lastVMessageGroup);
                            }
                            else {
                                var srcImgAvatar = window.domain + content.avatarSrc;
                                lastVMessageGroup = DOMElement.div({
                                    attrs: {
                                        style: {
                                            textAlign: "left"
                                        }
                                    },
                                    children: [
                                        DOMElement.div({
                                            attrs: {
                                                style: {
                                                    fontSize: "12px",
                                                    paddingLeft: "5px"
                                                }
                                            },
                                            text: content.fullname + ", " + contentModule.getTimeMessage(content.m_time)
                                        })
                                    ]
                                });
                                vBoxMessage.appendChild(DOMElement.div({
                                    attrs: {
                                        style: {
                                            maxWidth: "70%",
                                            paddingTop: "10px",
                                            whiteSpace: "nowrap",
                                            paddingBottom: "10px"
                                        }
                                    },
                                    children: [
                                        DOMElement.div({
                                            attrs: {
                                                style: {
                                                    marginLeft: "10px",
                                                    display: "inline-block",
                                                    verticalAlign: "top"
                                                }
                                            },
                                            children: [
                                                DOMElement.div({
                                                    attrs: {
                                                        style: {
                                                            backgroundImage: "url(" + srcImgAvatar + ")",
                                                            borderRadius: "50%",
                                                            backgroundSize: "cover",
                                                            cursor: "pointer",
                                                            width: "30px",
                                                            height: "30px"
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        DOMElement.div({
                                            attrs: {
                                                style: {
                                                    display: "inline-block"
                                                }
                                            },
                                            children: [lastVMessageGroup]
                                        })
                                    ]
                                }));
                            }
                            lastUserChatid = content.userid;
                        }
                        var singleMessage = createMessage(content);
                        lastVMessageGroup.appendChild(singleMessage);
                    }
                };
                activityItemElt.push(DOMElement.div({
                    attrs: attrsTitle,
                    text: LanguageModule.text("txt_chat")
                }));
                var vBoxMessage = DOMElement.div({});
                activityItemElt.push(vBoxMessage);
                item.details.forEach(function (x) {
                    addMessage(x);
                });
                break;
            case 'file':
                activityItemElt = [
                    DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_file")
                    })
                ];
                item.details.forEach(function (x, index) {
                    if (x.content_type == "file") {
                        activityItemElt.push(DOMElement.div({
                            attrs: {
                                style: { paddingLeft: "30px" }
                            },
                            children: [DOMElement.div({
                                attrs: attrsText,
                                children: [DOMElement.a({
                                    attrs: {
                                        href: (x.id > 0)? window.domain + "/uploads/files/" + x.id + "_" + x.filename + ".upload" : x.file_blob_url,
                                        download: x.filename,
                                        style: {
                                            color: "#1464f6"
                                        }
                                    },
                                    text: x.filename
                                })]
                            })]
                        }));
                    }
                    else {
                        activityItemElt.push(DOMElement.div({
                            attrs: {
                                style: { paddingLeft: "30px" }
                            },
                            children: [DOMElement.div({
                                attrs: {
                                    style: {
                                        width: "200px",
                                        height: "200px",
                                        borderRadius: "3px",
                                        overflow: "hidden",
                                        border: "1px solid #ddd"
                                    }
                                },
                                children: [DOMElement.img({
                                    attrs: {
                                        src: (x.id > 0)? window.domain + "/uploads/images/" + x.id + "_" + x.filename + ".upload" : x.file_blob_url,
                                        style: {
                                            maxWidth: "200px",
                                            maxHeight: "200px"
                                        }
                                    }
                                })]
                            })]
                        }));
                    }

                });
                break;
            case 'wait':
                activityItemElt = [
                    DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_wait")
                    }),
                    DOMElement.div({
                        attrs: { style: { paddingLeft: "30px" } },
                        children: [DOMElement.div({
                            attrs: attrsText,
                            text: item.name
                        })]
                    })
                ];
                break;
            case 'note':
                activityItemElt = [
                    DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_note")
                    }),
                    DOMElement.div({
                        attrs: { style: { paddingLeft: "30px" } },
                        children: [
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_work") + ": " + item.work
                            }),
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_note") + ": " + item.note
                            })
                        ]
                    })
                ];
                break;
            case 'checklist':
                var dataCheckListItems = [];
                item.details.forEach(function (x) {
                    dataCheckListItems.push([
                        {
                            attrs: attrsTDfirst,
                            text: x.name
                        },
                        {
                            attrs: attrsTD,
                            text: (x.due_date) ? contentModule.formatTimeMinuteDisplay(x.due_date) : ""
                        },
                        {
                            attrs: attrsTD,
                            text: contentModule.getUsernameFullnameByhomeid(data_module.users, x.assigned_to)
                        },
                        {
                            attrs: attrsTD,
                            text: getStatusName(x.status)
                        }
                    ]);
                });
                activityItemElt = [
                    DOMElement.div({
                        attrs: attrsTitle,
                        text: LanguageModule.text("txt_check_list")
                    }),
                    DOMElement.div({
                        attrs: { style: { paddingLeft: "30px" } },
                        children: [
                            DOMElement.div({
                                attrs: attrsText,
                                text: LanguageModule.text("txt_name") + ": " + item.name
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        paddingTop: "10px"
                                    }
                                },
                                children: [DOMElement.table({
                                    attrs: { style: { width: "100%" } },
                                    header: [
                                        {
                                            attrs: attrsTHfirst,
                                            text: LanguageModule.text("txt_check_list")
                                        },
                                        {
                                            attrs: attrsTH,
                                            text: LanguageModule.text("txt_due_date")
                                        },
                                        {
                                            attrs: attrsTH,
                                            text: LanguageModule.text("txt_assigned_to")
                                        },
                                        {
                                            attrs: attrsTH,
                                            text: LanguageModule.text("txt_complete")
                                        }
                                    ],
                                    data: dataCheckListItems
                                })]
                            })
                        ]
                    })
                ];
                break;
        }
        activityListElt.appendChild(DOMElement.div({
            attrs: {
                style: {
                    marginTop: "10px",
                    marginBottom: "10px",
                    border: "1px solid #d6d6d6",
                    padding: "10px"
                }
            },
            children: activityItemElt
        }));
    });
    var previewElt = DOMElement.div({
        children: [
            DOMElement.div({
                innerHTML: params.content_mail
            }),
            DOMElement.p({
                attrs: {
                    style: {
                        borderTop: "1px solid black",
                        borderBottom: "1px solid black",
                        paddingTop: "20px",
                        paddingBottom: "20px"
                    }
                },
                text: "Đây là email tự động từ hệ thống, vui lòng không phản hồi (reply) lại email này"
            }),
            generalElt,
            activityListElt
        ]
    });
    return previewElt;
};

theme.previewMailActivity = function (params) {
    var previewElt = params.previewElt;
    previewElt.style.padding = 0;
    var dataView = [];
    if (params.toList.length > 0) {
        var toName = "";
        for (var i = 0; i < params.toList.length; i++) {
            if (i > 0) toName += ", ";
            toName += params.toList[i];
        }
        dataView.push(DOMElement.div({
            attrs: {
                style: {
                    minHeight: "30px",
                    lineHeight: "30px"
                }
            },
            text: LanguageModule.text("txt_email_to") + ": " + toName
        }));
    }
    if (params.ccList.length > 0) {
        var ccName = "";
        for (var i = 0; i < params.ccList.length; i++) {
            if (i > 0) ccName += ", ";
            ccName += params.ccList[i];
        }
        dataView.push(DOMElement.div({
            attrs: {
                style: {
                    minHeight: "30px",
                    lineHeight: "30px"
                }
            },
            text: LanguageModule.text("txt_cc") + ": " + ccName
        }));
    }
    if (params.bccList.length > 0) {
        var bccName = "";
        for (var i = 0; i < params.bccList.length; i++) {
            if (i > 0) bccName += ", ";
            bccName += params.bccList[i];
        }
        dataView.push(DOMElement.div({
            attrs: {
                style: {
                    minHeight: "30px",
                    lineHeight: "30px"
                }
            },
            text: LanguageModule.text("txt_bcc") + ": " + bccName
        }));
    }
    dataView.push(previewElt);
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_preview"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "send"
                    }),
                    cmd: function () {
                        params.cmdbutton.send().then(function (objects) {
                            params.frameList.removeLast();
                            var dataFile;
                            for (var i = 0; i < objects.length; i++){
                                if (objects[i].type == "sendmail"){
                                    theme.drawSendMailItem(params, {
                                        id: objects[i].id,
                                        valueid: objects[i].valueid,
                                        userid: systemconfig.userid
                                    });
                                }
                                else {
                                    dataFile = {
                                        id: objects[i].id,
                                        filename: objects[i].filename,
                                        title: objects[i].filename,
                                        userid: systemconfig.userid,
                                        time: new Date(),
                                        type: "card",
                                        content_type: objects[i].content_type
                                    };
                                    if (objects[i].content_type == "img"){
                                        var userIndex = data_module.users.getByhomeid(systemconfig.userid);
                                        dataFile.avatar = data_module.users.items[userIndex].avatarSrc;
                                        dataFile.userName = data_module.users.items[userIndex].fullname;
                                        dataFile.date = new Date();
                                        dataFile.src = window.domain + "./uploads/images/" + objects[i].id + "_" + objects[i].filename + ".upload";
                                        dataFile.note = objects[i].filename;
                                        params.imagesList.unshift(dataFile);
                                    }
                                    params.fileList.unshift(dataFile);
                                }
                            }
                            params.type = "new";
                            theme.redrawFileObject(params);
                        });
                    }
                }
            ]
        },
        on: {
            action: function(){
                params.frameList.removeLast();
            },
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    var singlePage = absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: dataView
            })
        ]
    });
    params.frameList.addChild(singlePage);
    singlePage.requestActive();
};

theme.viewSendMailFunc = function (params) {
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_send_mail")
        },
        on: {
            action: params.cmdbutton.close
        }
    });
    var data = [
        [
            {
                attrs: {
                    style: {
                        width: "30px",
                        height: "30px",
                        lineHeight: "30px",
                        whiteSpace: "nowrap"
                    }
                },
                text: LanguageModule.text("txt_email_to")
            },
            { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
            absol.buildDom({
                tag: "mselectbox",
                style: {
                    width: "100%"
                },
                props: {
                    values: params.to,

                    items: params.userItems,
                    disabled: true
                }
            })
        ]
    ];
    if (params.cc.length > 0) {
        data = data.concat([
            [{ attrs: { style: { height: "var(--control-verticle-distance-2)" } } }],
            [
                {
                    attrs: {
                        style: {
                            height: "30px",
                            lineHeight: "30px",
                            whiteSpace: "nowrap"
                        }
                    },
                    text: LanguageModule.text("txt_cc")
                },
                { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
                absol.buildDom({
                    tag: "tagnameinput",
                    style: {
                        width: "100%"
                    },
                    props: {
                        valuesList: params.cc,
                        items: params.userItemsCc,
                        disabled: true
                    }
                })
            ]
        ]);
    }
    if (params.bcc.length > 0) {
        data = data.concat([
            [{ attrs: { style: { height: "var(--control-verticle-distance-2)" } } }],
            [
                {
                    attrs: {
                        style: {
                            height: "30px",
                            lineHeight: "30px",
                            whiteSpace: "nowrap"
                        }
                    },
                    text: LanguageModule.text("txt_bcc")
                },
                { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
                absol.buildDom({
                    tag: "tagnameinput",
                    style: {
                        width: "100%"
                    },
                    props: {
                        valuesList: params.bcc,
                        items: params.userItemsCc,
                        disabled: true
                    }
                })
            ]
        ]);
    }
    data = data.concat([
        [{ attrs: { style: { height: "var(--control-verticle-distance-2)" } } }],
        [
            {
                attrs: {
                    style: {
                        minHeight: "30px",
                        lineHeight: "30px",
                        whiteSpace: "nowrap"
                    }
                },
                text: LanguageModule.text("txt_subject")
            },
            { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
            DOMElement.div({
                attrs: {
                    style: {
                        minHeight: "30px",
                        lineHeight: "30px",
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        borderRadius: "3px",
                        border: "1px solid #d6d6d6"
                    }
                },
                text: params.subject
            })
        ]
    ]);
    params.previewElt.style.paddingLeft = 0;
    params.previewElt.style.paddingRight = 0;
    return absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: [
                    DOMElement.table({
                        attrs: {
                            style: {
                                width: "100%"
                            }
                        },
                        data: data
                    }),
                    params.previewElt
                ]
            })
        ]
    });
};

theme.drawSendMailItem = function (params, value) {
    var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
    var activities_block = absol.$(".card-activities-block", params.frameList);
    var identArray = [];
    for (var i = 0; i < activities_block.childNodes.length; i++) {
        if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
    }
    var item = {};
    var content = theme.generateMailData(value.valueid, params.values);
    console.log(content);
    theme.cardActivityElt({
        src1: "icons/email.png",
        activity: "sendmail",
        id: value.id,
        to: content.to_value,
        subject: content.subject_value,
        content: content.content_value,
        created: new Date(),
        editFunc: params.editMailFunc,
        email_from: value.userid
    }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
    var keys = Object.keys(item);
    var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
    if (!newParent) {
        var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
        var color = '#e4e1f5';
        var x = absol._({
            style: {
                paddingBottom: "20px"
            }
        });
        var newParent = absol._({
            class: ["cag-div", "card-activities-group-" + keys[0]],
            style: {
                'border-top': "1px solid"
            },
            child: [
                {
                    style: {
                        'font-weight': 'bold',
                        'line-height': '30px',
                        'text-align': 'center'
                    },
                    child: { text: title }
                },
                x
            ]
        });
        newParent.activities_container = x;
        // var maxIdent = Math.max.apply(Math, identArray);
        var maxIdent = Math.max.apply(Math, identArray);
        identArray.push(parseInt(keys[0]));
        identArray.sort(function (a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
        var index = identArray.indexOf(parseInt(keys[0]));
        if (index != identArray.length - 1) {
            maxIdent = identArray[index];
        }
        var className = ".card-activities-group-" + maxIdent;
        var afterElt = absol.$(className, activities_block);
        if (maxIdent > 0) activities_block.insertBefore(newParent, afterElt);
        else activities_block.addChild(newParent);
        newParent.activities_container.addChild(item[keys[0]][0]);
    }
    else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
};

theme.attachActivityForm = function(params){
    var dataView = [];
    var inputIdBoxes = [], activityName;
    var timeView, listTimeNotMinus = ["chat", "file", "field"];
    for (var i = 0; i < params.listActivity.length; i++) {
        inputIdBoxes["checked_" + i] = absol.buildDom({
            tag: "checkbox"
        });
        switch (params.listActivity[i].type_activity) {
            case 'field':
                activityName = LanguageModule.text("txt_field");
                break;
            case 'chat':
                activityName = LanguageModule.text("txt_chat");
                break;
            case 'file':
                activityName = LanguageModule.text("txt_file");
                break;
            case 'task':
                activityName = params.listActivity[i].work;
                break;
            case 'call':
                activityName = params.listActivity[i].work;
                break;
            case 'meeting':
                activityName = params.listActivity[i].name;
                break;
            case 'checklist':
                activityName = params.listActivity[i].name;
                break;
            case 'note':
                activityName = params.listActivity[i].work;
                break;
            case 'wait':
                activityName = params.listActivity[i].name;
                break;
        }
        if (listTimeNotMinus.indexOf(params.listActivity[i].type_activity) >= 0){
            timeView = contentModule.formatTimeDisplay(params.listActivity[i].timeSort);
        }
        else {
            timeView = contentModule.formatTimeMinuteDisplay(params.listActivity[i].timeSort);
        }
        dataView.push([
            inputIdBoxes["checked_" + i],
            {
                text: activityName
            },
            {
                text: timeView
            }
        ]);
    }
    ModalElement.showWindow({
        index: 1,
        title: LanguageModule.text("txt_attach_activity"),
        bodycontent: DOMElement.div({
            children: [
                DOMElement.div({
                    attrs: {
                        className: "cardsimpletableclass",
                        style: {marginTop: "var(--control-verticle-distance-2)"}
                    },
                    children: [
                        DOMElement.table({
                            header: [
                                absol.buildDom({
                                    tag: "checkbox",
                                    on: {
                                        change: function () {
                                            for (var i = 0; i < params.listActivity.length; i++) {
                                                inputIdBoxes["checked_" + i].checked = this.checked;
                                            }
                                        }
                                    }
                                }),
                                {text: LanguageModule.text("txt_name")},
                                {text: LanguageModule.text("txt_time")}
                            ],
                            data: dataView
                        })
                    ]
                }),
                DOMElement.div({
                    attrs: {
                        align: "center",
                        style: {marginTop: "var(--control-verticle-distance-2)"}
                    },
                    children: [DOMElement.table({
                        data: [[
                            {
                                children: [theme.noneIconButton({
                                    onclick: function(){
                                        var activityList = [];
                                        for (var i = 0; i < params.listActivity.length; i++) {
                                            if (inputIdBoxes["checked_" + i].checked) {
                                                activityList.push(params.listActivity[i]);
                                            }
                                        }
                                        params.cmdbutton.save(activityList);
                                        ModalElement.close(1);
                                    },
                                    text: LanguageModule.text("txt_save")
                                })]
                            },
                            {
                                attrs: {style: {width: carddone.menu.distanceButtonForm}}
                            },
                            {
                                children: [theme.noneIconButton({
                                    onclick: function (event, me) {
                                        ModalElement.close(1);
                                    },
                                    text: LanguageModule.text("txt_cancel")
                                })]
                            }
                        ]]
                    })]
                })
            ]
        })
    });
};

theme.chooseActivitySendMail = function (params) {
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_send_mail"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "visibility"
                    }),
                    cmd: function () {
                        params.cmdbutton.preview();
                    }
                },
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "send"
                    }),
                    cmd: function () {
                        params.cmdbutton.send().then(function (objects) {
                            var dataFile;
                            for (var i = 0; i < objects.length; i++){
                                if (objects[i].type == "sendmail"){
                                    theme.drawSendMailItem(params, {
                                        id: objects[i].id,
                                        valueid: objects[i].valueid,
                                        userid: systemconfig.userid
                                    });
                                }
                                else {
                                    dataFile = {
                                        id: objects[i].id,
                                        filename: objects[i].filename,
                                        title: objects[i].filename,
                                        userid: systemconfig.userid,
                                        time: new Date(),
                                        type: "card",
                                        content_type: objects[i].content_type
                                    };
                                    if (objects[i].content_type == "img"){
                                        var userIndex = data_module.users.getByhomeid(systemconfig.userid);
                                        dataFile.avatar = data_module.users.items[userIndex].avatarSrc;
                                        dataFile.userName = data_module.users.items[userIndex].fullname;
                                        dataFile.date = new Date();
                                        dataFile.src = window.domain + "./uploads/images/" + objects[i].id + "_" + objects[i].filename + ".upload";
                                        dataFile.note = objects[i].filename;
                                        params.imagesList.unshift(dataFile);
                                    }
                                    params.fileList.unshift(dataFile);
                                }
                            }
                            params.type = "new";
                            theme.redrawFileObject(params);
                        });
                    }
                }
            ]
        },
        on: {
            action: params.cmdbutton.close,
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    var dataView = [];
    var inputIdBoxes = [], activityName;
    var timeView, listTimeNotMinus = ["chat", "file", "field"];
    for (var i = 0; i < params.listActivity.length; i++) {
        inputIdBoxes["checked_" + i] = absol.buildDom({
            tag: "checkboxinput"
        });
        switch (params.listActivity[i].type_activity) {
            case 'field':
                activityName = LanguageModule.text("txt_field");
                break;
            case 'chat':
                activityName = LanguageModule.text("txt_chat");
                break;
            case 'file':
                activityName = LanguageModule.text("txt_file");
                break;
            case 'task':
                activityName = params.listActivity[i].work;
                break;
            case 'call':
                activityName = params.listActivity[i].work;
                break;
            case 'meeting':
                activityName = params.listActivity[i].name;
                break;
            case 'checklist':
                activityName = params.listActivity[i].name;
                break;
            case 'note':
                activityName = params.listActivity[i].work;
                break;
            case 'wait':
                activityName = params.listActivity[i].name;
                break;
        }
        if (listTimeNotMinus.indexOf(params.listActivity[i].type_activity) >= 0){
            timeView = contentModule.formatTimeDisplay(params.listActivity[i].timeSort);
        }
        else {
            timeView = contentModule.formatTimeMinuteDisplay(params.listActivity[i].timeSort);
        }
        dataView.push([
            inputIdBoxes["checked_" + i],
            {
                text: activityName
            },
            {
                text: timeView
            }
        ]);
    }
    var cc_before_elt = DOMElement.div({
        attrs: {
            className: "card-mobile-label-form-edit",
            style: {
                display: "none"
            }
        },
        text: LanguageModule.text("txt_cc")
    });
    var cc_elt = DOMElement.div({
        attrs: {style: {display: "none"}},
        children: [params.cc_sendmail_input]
    });
    var bcc_before_elt = DOMElement.div({
        attrs: {
            className: "card-mobile-label-form-edit",
            style: {
                display: "none"
            }
        },
        text: LanguageModule.text("txt_bcc")
    });
    var bcc_elt = DOMElement.div({
        attrs: {style: {display: "none"}},
        children: [params.bcc_sendmail_input]
    });
    return absol.buildDom({
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
                        text: LanguageModule.text("txt_email_to")
                    }),
                    params.users_sendmail_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit-first"
                        },
                        children: [
                            params.email_group_select,
                            DOMElement.a({
                                attrs: {
                                    style: {
                                        color: "var(--a-color)",
                                        marginLeft: "var(--control-horizontal-distance-2)",
                                        cursor: "pointer",
                                        verticalAlign: " middle",
                                        userSelect: "none"
                                    },
                                    onclick: function () {
                                        if (cc_before_elt.style.display == "none") {
                                            cc_before_elt.style.display = "";
                                            cc_elt.style.display = "";
                                        } else {
                                            cc_before_elt.style.display = "none";
                                            cc_elt.style.display = "none";
                                        }
                                    }
                                },
                                text: LanguageModule.text("txt_cc")
                            }),
                            DOMElement.a({
                                attrs: {
                                    style: {
                                        color: "var(--a-color)",
                                        marginLeft: "var(--control-horizontal-distance-2)",
                                        cursor: "pointer",
                                        verticalAlign: " middle",
                                        lineHeight: "30px",
                                        userSelect: "none"
                                    },
                                    onclick: function () {
                                        if (bcc_before_elt.style.display == "none") {
                                            bcc_before_elt.style.display = "";
                                            bcc_elt.style.display = "";
                                        } else {
                                            bcc_before_elt.style.display = "none";
                                            bcc_elt.style.display = "none";
                                        }
                                    }
                                },
                                text: LanguageModule.text("txt_bcc")
                            })
                        ]
                    }),
                    cc_before_elt,
                    cc_elt,
                    bcc_before_elt,
                    bcc_elt,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_subject")
                    }),
                    params.subject_sendmail_input,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_content")
                    }),
                    params.content_sendmail_input,
                    params.activity_container
                ]
            })
        ]
    });
};

theme.formKnowledgeEdit = function (params) {
    var headerForm = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_knowledge"),
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
            action: params.cmdButton.close,
            command: params.cmdButton.save
        }
    });
    var name_inputtext = theme.input({
        style: {
            width: "100%"
        },
        value: params.data.name
    });
    var tag_inputtext = absol.buildDom({
        tag: "tagnameinput",
        style: {
            width: "100%"
        },
        props: {
            value: params.data.tag,
            items: params.listTagKnowledge
        }
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

    var checkItem = function (id) {
        var index = params.knowledge_groups.getIndex(id);
        if (params.knowledge_groups.items[index].parentid == 0) return;
        inputIdBoxes["checkbox_" + params.knowledge_groups.items[index].parentid].checked = false;
        checkItem(params.knowledge_groups.items[index].parentid);
    };
    var checkAll = function (id) {
        var index = params.knowledge_groups.getIndex(id);
        var ni;
        for (var i = 0; i < params.knowledge_groups.items[index].childrenIndexList.length; i++) {
            ni = params.knowledge_groups.items[index].childrenIndexList[i];
            inputIdBoxes["checkbox_" + params.knowledge_groups.items[ni].id].checked = true;
            checkAll(params.knowledge_groups.items[ni].id);
        }
    };
    var checkboxIsChange = function (id, checked) {
        if (checked) {
            checkAll(id);
        }
        else {
            checkItem(id);
        }
    };

    function getDataCell(content) {
        var child = [];
        for (var i = 0; i < content.child.length; i++) {
            child.push(getDataCell(content.child[i]));
        }
        inputIdBoxes["checkbox_" + content.id] = absol.buildDom({
            tag: "checkbox",
            props: {
                checked: content.checked
            },
            on: {
                change: function (event) {
                    checkboxIsChange(content.id, this.checked);
                }
            }
        });
        var row = [
            {
                style: { whiteSpace: "nowrap" },
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
    for (var i = 0; i < params.data.groupList.length; i++) {
        data.push(getDataCell(params.data.groupList[i]));
    }
    var group_inputselect = pizo.tableView(
        [
            { value: LanguageModule.text("txt_name"), sort: true },
            { value: "" }
        ],
        data,
        false,
        false,
        0
    );
    group_inputselect.style.width = "100%";
    var dataView = [
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
            text: LanguageModule.text("txt_tag")
        }),
        tag_inputtext,
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit"
            },
            text: LanguageModule.text("txt_description")
        }),
        description_inputtext,
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit"
            },
            text: LanguageModule.text("txt_group")
        }),
        group_inputselect
    ];
    if (params.data.createdby !== undefined) {
        dataView = dataView.concat([
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: LanguageModule.text("txt_created_time")
            }),
            DOMElement.div({
                text: params.data.createdtime
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: LanguageModule.text("txt_createdby")
            }),
            DOMElement.div({
                text: params.data.createdby
            })
        ]);
    }
    var singlePage = absol.buildDom({
        tag: "tabframe",
        child: [
            headerForm,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: dataView
            })
        ]
    });
    console.log(singlePage);
    singlePage.getValue = function () {
        if (name_inputtext.value.trim() == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function () {
                    name_inputtext.focus();
                }
            });
            return;
        }
        var groupValue = [];
        var getGroupValue = function (content) {
            if (inputIdBoxes["checkbox_" + content.id].checked) groupValue.push(content.id);
            for (var i = 0; i < content.child.length; i++) {
                getGroupValue(content.child[i]);
            }
        };
        for (var i = 0; i < params.data.groupList.length; i++) {
            getGroupValue(params.data.groupList[i]);
        }
        return {
            name: name_inputtext.value.trim(),
            tag: tag_inputtext.value.trim(),
            description: editor.getData(),
            groupValue: groupValue
        }
    };
    setTimeout(function () {
        name_inputtext.focus();
    }, 10);
    return singlePage;
};

theme.cardGetMillisecondsWithoutTime = function (date) {
    var y, m, d, t;
    y = date.getFullYear();
    m = date.getMonth();
    d = date.getDate();
    t = new Date(y, m, d);
    return t.getTime();
}

theme.cardActivityElt = function (content, cardid, getObjectbyType, userid, activities_content, imagesList) {
    var location, src;
    var createMessage = function (data) {
        var className, classNameImg;
        if (data.type == "me") {
            className = "card-chatbox-message-me";
            classNameImg = "card-chatbox-message-me-img";
        }
        else {
            className = "card-chatbox-message-other";
            classNameImg = "card-chatbox-message-other-img";
        }
        var res, messelt;
        switch (data.content_type) {
            case "text":
                var texts;
                var aobjs = absol.parseMessage(data.content);// trả về một array theo cú pháp absol
                // thêm vài thuộc tính cho thẻ a
                aobjs.forEach(function (aobj) {
                    if (aobj.tag == 'a') {
                        aobj.attr = aobj.attr || {};
                        aobj.attr.target = '_blank';// mở tab mới
                        aobj.style = aobj.style || {};
                        aobj.style.cursor = "pointer";
                        aobj.style.textDecoration = "underline";
                    }
                });

                texts = aobjs.map(function (aobj) {
                    return absol._(aobj);// chuyển qua dom object cho giống code cũ
                });


                res = DOMElement.div({
                    attrs: {
                        className: "card-chatbox-message-line"
                    }
                });
                messelt = DOMElement.div({
                    attrs: {
                        className: className
                    },
                    children: texts
                });
                res.appendChild(messelt);
                break;
            case "img":
                var srcimg = "./uploads/images/" + data.localid + "_" + data.content + ".upload";
                messelt = DOMElement.div({
                    attrs: {
                        className: classNameImg
                    },
                    children: [DOMElement.img({
                        attrs: {
                            style: {
                                maxHeight: "100%",
                                maxWidth: "100%"
                            },
                            src: srcimg,
                            download: data.content,
                            onclick: function (id) {
                                return function (event, me) {
                                    document.body.appendChild(descViewImagePreview(imagesList, id));
                                }
                            }(data.localid)
                        }
                    })]
                });
                res = DOMElement.div({
                    attrs: {
                        className: "card-chatbox-message-line"
                    }
                });
                res.appendChild(messelt);
                break;
            case "file":
                messelt = DOMElement.div({
                    attrs: {
                        className: className
                    },
                    children: [
                        DOMElement.a({
                            attrs: {
                                href: "./uploads/files/" + data.localid + "_" + data.content + ".upload",
                                download: data.content,
                                style: {
                                    color: "black",
                                    cursor: "pointer"
                                }
                            },
                            text: data.content
                        })
                    ]
                });
                res = DOMElement.div({
                    attrs: {
                        className: "card-chatbox-message-line"
                    }
                });
                res.appendChild(messelt);
                break;
            case "add_member":
                var listMemberText = "";
                var userIndex;
                for (var i = 0; i < data.content.length; i++) {
                    userIndex = data_module.users.getByhomeid(data.content[i]);
                    if (i > 0) listMemberText += ", ";
                    listMemberText += data_module.users[userIndex].fullname;
                }
                res = absol.buildDom({
                    class: "card-chatbox-line-seen",
                    child: [absol.buildDom({
                        tag: "unreadmessageline",
                        props: {
                            text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã thêm " + listMemberText
                        }
                    })]
                });
                break;
            case "create":
                res = absol.buildDom({
                    class: "card-chatbox-line-seen",
                    child: [absol.buildDom({
                        tag: "unreadmessageline",
                        props: {
                            text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tạo nhóm."
                        }
                    })]
                });
                break;
            case "join":
                res = absol.buildDom({
                    class: "card-chatbox-line-seen",
                    child: [absol.buildDom({
                        tag: "unreadmessageline",
                        props: {
                            text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tham gia nhóm."
                        }
                    })]
                });
                break;
            default:
                res = DOMElement.div({});
                break;
        }
        return res;
    };
    var lastUserChatid = 0, lastVMessageGroup;
    var addMessage = function (content) {
        if (content.content_type != "file" && content.content_type != "img" && content.content_type != "text") {
            var singleMessage = createMessage(content);
            vBoxMessage.appendChild(singleMessage);
            lastUserChatid = 0;
        }
        else {
            if (lastUserChatid !== content.userid) {
                var className;
                if (content.type == "me") {
                    className = "card-chatbox-groupmess-me";
                    lastVMessageGroup = DOMElement.div({
                        attrs: {
                            className: className
                        },
                        children: [
                            DOMElement.div({
                                attrs: {
                                    className: "card-chatbox-groupmess-me-note"
                                },
                                text: contentModule.getTimeMessage(content.m_time)
                            })
                        ]
                    });
                    vBoxMessage.appendChild(lastVMessageGroup);
                }
                else {
                    className = "card-chatbox-groupmess-other";
                    var srcImgAvatar = content.avatarSrc;
                    lastVMessageGroup = DOMElement.div({
                        attrs: {
                            className: className
                        },
                        children: [
                            DOMElement.div({
                                attrs: {
                                    className: "card-chatbox-groupmess-other-note"
                                },
                                text: content.fullname + ", " + contentModule.getTimeMessage(content.m_time)
                            })
                        ]
                    });
                    vBoxMessage.appendChild(DOMElement.div({
                        attrs: {
                            className: "card-chatbox-message-cover"
                        },
                        children: [
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        marginLeft: "10px",
                                        display: "inline-block",
                                        verticalAlign: "top"
                                    }
                                },
                                children: [
                                    DOMElement.div({
                                        attrs: {
                                            className: "message-avatar-user",
                                            style: {
                                                backgroundImage: "url(" + srcImgAvatar + ")"
                                            }
                                        }
                                    })
                                ]
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        display: "inline-block"
                                    }
                                },
                                children: [lastVMessageGroup]
                            })
                        ]
                    }));
                }
                lastUserChatid = content.userid;
            }
            var singleMessage = createMessage(content);
            lastVMessageGroup.appendChild(singleMessage);
        }
    };
    var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
    var generateChecklistValueData = function (content, objid) {
        var value = [];
        content.forEach(function (elt) {
            var subValue = {};
            elt.value.forEach(function (item) {
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
    var checklistItemElt = function (content) {
        var st = absol._({
            class: 'card-activity-view-checklist-item',
            style: {
                paddingLeft: "30px"
            },
            child: [
                {
                    class: "card-activity-view-checklist-item-checkbox",
                    child: {
                        tag: "checkboxinput",
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
                        child: { text: content.name }
                    }
                }
            ]
        });
        return st;
    };
    var checklistElt = function (content) {
        var st = absol._({});
        var c_name = absol._({
            child: { text: content.name }
        });
        c_name.addTo(st);
        var itemValue = generateChecklistValueData(content.items_value, content.id);
        itemValue.forEach(function (elt) {
            elt.checklistName = content.name;
            elt.activity = "checklist_item";
            elt.src1 = "icons/check_list.png";
            elt.src2 = "icons/check_list_complete.png";
            elt.src3 = "icons/check_list_delay.png";
            elt.editFunc = content.editFunc;
            if (elt.due_date.getTime() > 0) theme.cardActivityElt(elt, cardid, getObjectbyType, userid, activities_content);
            var item = checklistItemElt(elt);
            item.addTo(st);
        });
        return st;
    };
    var fieldElt = function (content) {
        var st = absol._({});
        var c_name = absol._({
            child: { text: content.name }
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
                child: { text: content.name + " - Hạn hoàn thành: " + contentModule.formatTimeMinuteDisplay(content.due_date) }
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
                child: { text: content.name + " - Ngày bắt đầu: " + contentModule.formatTimeMinuteDisplay(content.start_date) }
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
                child: { text: content.name + " - Ngày gọi: " + contentModule.formatTimeMinuteDisplay(content.call_date) }
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
                child: { text: "Sau " + content.duration + " ngày tính từ " + contentModule.formatTimeMinuteDisplay(content.created) + " mà không ghi nhân hoạt động nào thì thông báo cho người quản lý card: " + contentModule.getUsernameByhomeid2(data_module.users, userid) }
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        case "note":
            valueElt = absol._({
                class: "card-activity-view-content",
                tag: "span",
                child: { text: content.name + " - Note: " + (content.result.length > 200 ? content.result.substr(0, 200) : content.result) }
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
                child: { text: x }
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
            for (var i = 0; i < content.listFile.length; i++) {
                if (content.listFile[i].content_type == "file") {
                    suffFile = content.listFile[i].filename.split('.').pop();
                    if (contentModule.listSuffFiles.indexOf(suffFile) >= 0) {
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
                                            height: "50px",
                                            width: "50px",
                                            // border: "1px solid #d6d6d6",
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
                                                maxHeight: "50px",
                                                maxWidth: "50px"
                                            }
                                        }
                                    })]
                                }),
                                { attrs: { style: { width: "20px" } } },
                                { text: content.listFile[i].title }
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
                            onclick: function (imagesList, id) {
                                return function (event, me) {
                                    document.body.appendChild(descViewImagePreview(imagesList, id));
                                }
                            }(imagesList, content.listFile[i].id)
                        },
                        children: [DOMElement.table({
                            data: [[
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            height: "50px",
                                            width: "50px",
                                            // border: "1px solid #d6d6d6",
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
                                                maxHeight: "50px",
                                                maxWidth: "50px"
                                            }
                                        }
                                    })]
                                }),
                                { attrs: { style: { width: "20px" } } },
                                { text: content.listFile[i].title }
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
        case "chat":
            var vBoxMessage = DOMElement.div({});
            for (var i = 0; i < content.listChat.length; i++) {
                addMessage(content.listChat[i]);
            }
            valueElt = absol._({
                class: "card-activity-view-content",
                style: {
                    width: "100%"
                },
                child: vBoxMessage
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        case "sendmail":
            var from_name = "";
            var x = data_module.users.getByhomeid(content.email_from);
            if (x >= 0){
                from_name += data_module.users.items[x].fullname + " (" + data_module.users.items[x].email + ")";
            }
            var to_name = "";
            for (var i = 0; i < content.to.length; i++) {
                if (i > 0) to_name += ", ";
                to_name += content.to[i];
            }
            valueElt = absol._({
                class: "card-activity-view-content",
                child: [
                    DOMElement.div({
                        attrs: {
                            style: {
                                minHeight: "30px",
                                lineHeight: "30px"
                            }
                        },
                        children: [
                            DOMElement.span({text: LanguageModule.text("txt_email_from") + ": "}),
                            DOMElement.span({text: from_name})
                        ]
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                minHeight: "30px",
                                lineHeight: "30px"
                            }
                        },
                        children: [
                            DOMElement.span({ text: LanguageModule.text("txt_email_to") + ": " }),
                            DOMElement.span({ text: to_name })
                        ]
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                minHeight: "30px",
                                lineHeight: "30px"
                            }
                        },
                        children: [
                            DOMElement.span({ text: LanguageModule.text("txt_subject") + ": " }),
                            DOMElement.span({ text: content.subject })
                        ]
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                minHeight: "30px"
                            }
                        },
                        children: [
                            DOMElement.span({ text: LanguageModule.text("txt_content") + ": " }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        verticalAlign: "middle",
                                        display: "inline-block"
                                    }
                                },
                                innerHTML: content.content
                            })
                        ]
                    })
                ]
            });
            location = theme.cardGetMillisecondsWithoutTime(content.created).toString();
            src = content.src1;
            break;
        default:

    }
    var image = absol._({
        child: {
            tag: "img",
            class: "card-activity-view-image-mobile",
            style: { 'z-index': '1' },
            props: {
                src: src,
                alt: content.activity
            },
            on: {
                click: function () {
                    if (content.activity == "file") {
                        content.editFunc(cardid, content.listFile);
                    }
                    else {
                        content.editFunc(cardid, content.id);
                    }
                }
            }
        }
    });
    var value = absol._({
        class: "card-activity-view-content-container-mobile",
        child: valueElt
    });
    value.addTo(st);
    image.addTo(st);
    st.ident = content.id;
    if (!activities_content[location]) activities_content[location] = [];
    activities_content[location].unshift(st);
};

theme.generateActivitiesData = function (activities_block, activitiesOfCard, database, funcs, cardid, userid, getObjectbyType, activities_data_structure, allFiles, imagesList, content_chat, menuValue) {
    var content;
    var activities = [];
    for (var i = 0; i < database.objects.items.length; i++) {
        var elt = database.objects.items[i];
        if (menuValue != "activities" && menuValue != elt.type) continue;
        if (activitiesOfCard.indexOf(elt.id) == -1) continue;
        switch (elt.type) {
            case "task":
                content = theme.generateTaskData(elt.valueid, database.values);
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
                content = theme.generateMeetingData(elt.valueid, database.values);
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
                content = theme.generateCallData(elt.valueid, database.values);
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
                content = theme.generateWaitData(elt.valueid, database.values);
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
                content = theme.generateNoteData(elt.valueid, database.values);
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
                content = theme.generateChecklistData(elt.valueid, database.values);
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
                    typeid: database.objects.items[database.objects.getIndex(elt.id)].typeid,
                    valueid: database.objects.items[database.objects.getIndex(elt.id)].valueid,
                    name: database.typelists.items[database.typelists.getIndex(database.objects.items[database.objects.getIndex(elt.id)].typeid)].name,
                    created: elt.createdtime,
                    editFunc: funcs.editFieldFunc
                });
                break;
            case "sendmail":
                content = theme.generateMailData(elt.valueid, database.values);
                activities.push({
                    src1: "icons/email.png",
                    activity: "sendmail",
                    id: elt.id,
                    to: content.to_value,
                    subject: content.subject_value,
                    content: content.content_value,
                    created: elt.createdtime,
                    editFunc: funcs.editMailFunc,
                    email_from: elt.userid
                });
                break;
            default:
                break;
        }
    }
    if (menuValue == "activities" || menuValue == "file") {
        for (var i = 0; i < allFiles.length; i++) {
            activities.push({
                id: "file_" + theme.cardGetMillisecondsWithoutTime(allFiles[i].time),
                src1: "icons/file.png",
                activity: "file",
                listFile: allFiles[i].listFile,
                created: allFiles[i].time,
                editFunc: funcs.editFileFunc
            });
        }
    }
    if (menuValue == "activities" || menuValue == "chat") {
        for (var i = 0; i < content_chat.length; i++) {
            activities.push({
                id: "chat_" + theme.cardGetMillisecondsWithoutTime(content_chat[i].time),
                src1: "icons/chat.png",
                activity: "chat",
                listChat: content_chat[i].listChat,
                created: content_chat[i].time,
                editFunc: funcs.editChatFunc
            });
        }
    }
    var activities_content = {};
    activities.forEach(function (elt) {
        var item;
        theme.cardActivityElt(elt, cardid, getObjectbyType, userid, activities_content, imagesList);
    });
    var keys = Object.keys(activities_content);
    keys = keys.map(function (elt) { return parseInt(elt); });
    keys.sort(function (a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
    keys.sort(function (a, b) {
        if (a < 0 || b < 0) return 0;
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
    });
    absol.$(".cag-div", activities_block, function (elt) {
        elt.selfRemove();
    });
    keys.forEach(function (elt) {
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
                paddingBottom: "20px"
            },
            child: activities_content[elt.toString()]
        });
        var x = absol._({
            style: {
                borderTop: "1px solid"
            },
            class: ["cag-div", "card-activities-group-" + elt],
            child: [
                {
                    style: {
                        'font-weight': 'bold',
                        'line-height': '30px',
                        'text-align': 'center'
                    },
                    child: { text: title }
                },
                activities_container
            ]
        });
        x.ident = elt;
        x.activities_container = activities_container;
        activities_block.addChild(x);
    });
};

theme.cardAddFieldForm = function (params) {
    var typeOfData;
    if (params.fieldList.length == 0) {
        ModalElement.alert({ message: LanguageModule.text("war_board_do_not_have_field") });
        return;
    }
    var vIndex, buttons = [], typeCombobox, created_value;
    var content_container = absol._({});
    var database = {
        typelists: params.typelists,
        values: params.values,
        nations: params.nations,
        cities: params.cities,
        users: data_module.users
    };

    if (params.id > 0) {
        created_value = params.objects.items[params.objects.getIndex(params.id)].createdtime;
    }
    else created_value = new Date();
    var saveFunc = function (promise) {
        promise().then(function resolve(value) {
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++) {
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            if (params.id > 0) {
                var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                var parent = absol.$(".card-activities-group-" + ident, activities_block);
                if (parent) {
                    absol.$('.card-activity-view-container', parent, function (elt) {
                        if (elt.ident == value.id) {
                            parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0) {
                        activities_block.removeChild(parent);
                        identArray = identArray.filter(function (elt) {
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
            }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
            if (!newParent) {
                var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
                var color = '#e4e1f5';
                var x = absol._({
                    style: {
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: ["cag-div", "card-activities-group-" + keys[0]],
                    style: {
                        'border-top': "1px solid"
                    },
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'text-align': 'center'
                            },
                            child: { text: title }
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                var maxIdent = Math.max.apply(Math, identArray);
                identArray.push(parseInt(keys[0]));
                identArray.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index != identArray.length - 1) {
                    maxIdent = identArray[index];
                }
                var className = ".card-activities-group-" + maxIdent;
                var afterElt = absol.$(className, activities_block);
                if (maxIdent > 0) activities_block.insertBefore(newParent, afterElt);
                else activities_block.addChild(newParent);
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message) {
            if (message) ModalElement.alert({ message: message });
        });
    };

    var deleteFunc = function (promise) {
        var title = LanguageModule.text("txt_delete_field");
        var message = LanguageModule.text("war_delete_field");
        ModalElement.question({
            title: title,
            message: message,
            onclick: function (index) {
                if (index == 0) {
                    promise().then(function resolve(value) {
                        var x = 2;
                        if (params.isMobile) x = 3;
                        while (params.frameList.getLength() > x){
                            params.frameList.removeLast();
                        }
                        params.objects = value.objects;
                        var activities_block = absol.$(".card-activities-block", params.frameList);
                        var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                        var parent = absol.$(".card-activities-group-" + ident, activities_block);
                        if (parent) {
                            absol.$('.card-activity-view-container', parent, function (elt) {
                                if (elt.ident == value.id) {
                                    parent.activities_container.removeChild(elt);
                                }
                            });
                            if (parent.activities_container.childNodes.length == 0) {
                                activities_block.removeChild(parent);
                            }
                        }
                    }, function reject(message) {
                        if (message) ModalElement.alert({ message: message });
                    });
                }
            }
        });
    };

    var commands = [];

    if ((params.cardArchived == 0) && (params.editMode == "edit")) {
        commands.push({
            icon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: function () {
                saveFunc(params.cmdButton.save);
            }
        });
        if (params.id) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
            title: LanguageModule.text("txt_field"),
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var props = {
        items: params.fieldList
    };
    if (params.valueid > 0) {
        vIndex = params.values.getIndex(params.valueid);
        props.value = params.values.items[vIndex].typeid;
    }
    else {
        vIndex = -1;
    }

    if (params.id > 0) props.disabled = true;

    var host = { database: database, funcs: params.funcs, listValueId: [] };

    var data = [];

    var typeChange = function () {
        var typeid = typeCombobox.value;
        typeOfData = params.typelists.items[params.typelists.getIndex(typeid)].type;
        var content = contentModule.getObjectbyType(host, typeid, params.valueid);
        if (['string', 'note', 'number', 'email', 'phonenumber', 'website', 'gps'].indexOf(typeOfData) != -1) {
            content.style.width = "300px";
            content = absol._({
                child: [
                    {
                        class: "card-mobile-label-form-edit",
                        child: { text: typeCombobox.textContent }
                    },
                    content
                ]
            })
        }

        content_container.clearChild();

        content_container.addChild(content);
    };

    typeCombobox = absol._({
        style: {
            width: "100%"
        },
        tag: 'mselectmenu',
        props: props,
        on: {
            change: function () {
                typeChange();
            }
        }
    });


    data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: { text: LanguageModule.text("txt_field") }
        },
        typeCombobox,
        content_container
    ];

    typeChange();

    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });
    returnData.getValue = function () {
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

theme.cardGenerateDateElt = function (defaultValue) {
    var elt = absol.buildDom({
        tag: 'calendar-input',
        style: {
            backgroundColor: "white"
        },
        data: {
            value: defaultValue
        }
    });
    return elt;
}

theme.cardGenerateDateTimeElt = function (defaultValue) {
    var date = absol.buildDom({
        tag: 'calendar-input',
        style: {
            marginRight: "var(--control-horizontal-distance-1)",
            backgroundColor: "white"
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
    elt.getValue = function () {
        var dateValue = date.value;
        dateValue = new Date(dateValue.setHours(0, 0, 0, 0));
        return new Date(dateValue.getTime() + (time.hour * 3600 + time.minute * 60) * 1000);
    };
    elt.oldValue = elt.getValue();
    return elt;
}

theme.cardGenerateEnumElt = function (typeid, status_value, typelists) {
    var list = [];
    var typeIndex = typelists.getIndex(typeid);
    for (var i = 0; i < typelists.items[typeIndex].content.details.length; i++) {
        list.push({
            value: typelists.items[typeIndex].content.details[i].localid,
            text: typelists.items[typeIndex].content.details[i].text
        });
    }

    var status = absol._({
        tag: "mselectmenu",
        style: {
            width: "100%"
        },
        props: {
            items: list,
            value: status_value
        }
    });
    return status;
}

theme.cardGenerateUserListElt = function (participant_value) {
    var list = [];
    for (var i = 0; i < data_module.users.items.length; i++) {
        list.push({
            value: data_module.users.items[i].homeid,
            text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname
        });
    }
    var elt = absol.buildDom({
        tag: 'mselectbox',
        style: {
            textAlign: "left",
            display: "block",
            width: "100%",
            backgroundColor: "white"
        },
        props: {
            items: list,
            values: participant_value,
            enableSearch: true
        }
    });
    return elt;
};

theme.cardGenerateUserElt = function (assigned_to_value) {
    var list = [];
    for (var i = 0; i < data_module.users.items.length; i++) {
        list.push({
            value: data_module.users.items[i].homeid,
            text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname
        });
    }
    var props = {
        items: list,
        enableSearch: true
    };
    if (assigned_to_value) props.value = assigned_to_value;
    var elt = absol.buildDom({
        tag: 'mselectmenu',
        style: {
            width: "100%"
        },
        props: props
    });
    return elt;
};

theme.cardAddItemForm = function (frameList, itemid, content, typelists) {
    return new Promise(function (rs) {
        var nameElt = function (value) {
            var st = theme.input({
                type: 'text',
                style: {
                    width: "100%"
                },
                value: value
            });
            return st;
        };
        var dueDateElt = function (value) {
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
        var successElt = function (value) {
            var st;
            st = absol._({
                tag: "checkboxinput",
                props: {
                    checked: value != ""
                }
            });
            return st;
        };
        var reminder = theme.cardGenerateEnumElt(-17, content.reminder, typelists);
        reminder.style.width = "100%";
        reminder.localid = "type_check_list_item_reminder";
        reminder.valueid = 0;
        reminder.typeid = -17;
        reminder.privtype = "enum";
        var assigned_to = theme.cardGenerateUserElt(content.userid);
        assigned_to.style.width = "100%";
        assigned_to.localid = "type_check_list_item_assigned_to";
        assigned_to.valueid = 0;
        assigned_to.typeid = -8;
        assigned_to.privtype = "users";
        var name = nameElt(content.name);
        name.localid = "type_check_list_item_name";
        name.valueid = 0;
        name.typeid = -1;
        name.privtype = "string";
        var due_date = dueDateElt(content.due_date);
        due_date.localid = "type_check_list_item_due_date";
        due_date.valueid = 0;
        due_date.typeid = -5;
        due_date.privtype = "datetime";
        var success = successElt(content.success);
        success.localid = "type_check_list_item_success";
        success.valueid = 0;
        success.typeid = -6;
        success.privtype = "boolean";
        var data = [
            {
                class: "card-mobile-label-form-edit-first",
                child: { text: LanguageModule.text("txt_name") }
            },
            name,
            {
                class: "card-mobile-label-form-edit",
                style: {
                    position: "relative",
                    textAlign: "right"
                },
                child: [
                    {
                        style: {
                            position: "absolute",
                            left: "0px",
                            top: "0px",
                            height: "100%"
                        },
                        child: [
                            {
                                style: {
                                    height: "100%",
                                    display: 'inline-block',
                                    'vertical-align': 'middle'
                                }
                            },
                            {
                                style: {
                                    display: 'inline-block',
                                    'vertical-align': 'middle'
                                },
                                child: { text: LanguageModule.text("txt_due_date") }
                            }
                        ]
                    },
                    {
                        child: due_date
                    }
                ]
            },
            {
                class: "card-mobile-label-form-edit",
                child: { text: LanguageModule.text("txt_reminder") }
            },
            reminder,
            {
                class: "card-mobile-label-form-edit",
                child: { text: LanguageModule.text("txt_assigned_to") }
            },
            assigned_to,
            {
                class: "card-mobile-label-form-edit",
                style: {
                    position: "relative",
                    textAlign: "right"
                },
                child: [
                    {
                        style: {
                            position: "absolute",
                            left: "0px",
                            top: "0px",
                            height: "100%"
                        },
                        child: [
                            {
                                style: {
                                    height: "100%",
                                    display: 'inline-block',
                                    'vertical-align': 'middle'
                                }
                            },
                            {
                                style: {
                                    display: 'inline-block',
                                    'vertical-align': 'middle'
                                },
                                child: { text: LanguageModule.text("txt_success") }
                            }
                        ]
                    },
                    {
                        child: success
                    }
                ]
            }
        ];
        var commands = [
            {
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "save"
                }),
                cmd: function () {
                    var name_value, due_date_value, reminder_value, assigned_to_value, success_value;
                    name_value = name.value.trim();
                    if (name_value == "") {
                        ModalElement.alert({
                            message: LanguageModule.text("war_no_name"),
                            func: function () {
                                name.focus();
                            }
                        });
                        return;
                    }
                    due_date_value = due_date.value;
                    reminder_value = reminder.value;
                    assigned_to_value = assigned_to.value;
                    success_value = success.checked;
                    if (due_date_value === null) {
                        if (reminder != "type_reminder_none") {
                            ModalElement.alert({
                                message: LanguageModule.text("war_no_due_date"),
                                func: function () {
                                    due_date.focus();
                                }
                            });
                            return;
                        }
                    }
                    rs({
                        name: name_value,
                        due_date: due_date_value,
                        reminder: reminder_value,
                        assigned_to: assigned_to_value,
                        success: success_value
                    });
                    frameList.removeLast();
                }
            }
        ];
        if (itemid != 0) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    // deleteFunc(params.cmdButton.delete);
                }
            })
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
                title: LanguageModule.text("txt_check_list_item"),
                commands: commands
            },
            on: {
                action: function () {
                    frameList.removeLast();
                },
                command: function (event) {
                    event.commandItem.cmd();
                }
            }
        });
        var returnData = absol.buildDom({
            tag: "tabframe",
            child: [
                header,
                {
                    class: "card-mobile-content",
                    child: data
                }
            ]
        });
        frameList.addChild(returnData);
        returnData.requestActive();
    })
}

theme.cardAddItemOfCheckListForm = function (userid, value, frameList, typelists) {
    var data = [], itemsTable;
    var successElt = function (value, text) {
        var st;
        st = absol._({
            tag: "checkbox",
            class: 'sortTable-cell-view',
            style: {
                display: "block",
                top: "0px"
            },
            props: {
                checked: value != "",
                text: text
            }
        });
        return st;
    };
    var nameElt = function (value) {
        return absol._({
            class: "sortTable-cell-view",
            child: { text: value }
        });
    };
    value.forEach(function (elt) {
        var items, success;
        var itemContent = {};
        elt.value.forEach(function (elt2) {
            itemContent[elt2.localid] = {
                localid: elt2.localid,
                valueid: elt2.valueid,
                typeid: elt2.typeid,
                privtype: elt2.privtype,
                value: elt2.value
            };
        });
        success = successElt(itemContent["type_check_list_item_success"].value, itemContent["type_check_list_item_name"].value);
        success.valueid = elt.valueid;
        success.itemContent = itemContent;
        items = [{ element: success }];
        data.push(items);
    });

    var header = [{}];

    itemsTable = pizo.tableView(header, data, false, true);

    itemsTable.style.width = "100%";

    itemsTable.addClass("stageTable");

    var deleteFunc = function (e, me, index, data, row, parent) {
        itemsTable.exactlyDeleteRow(index);
    };
    itemsTable.setUpSwipe(
        undefined,
        [
            {
                icon: "edit",
                iconStyle: { color: "white" },
                text: LanguageModule.text("txt_edit"),
                background: "grey",
                event: function (e, me, index, data, row, parent) {
                    theme.cardAddItemForm(frameList, 0, {
                        name: data[0].element.itemContent['type_check_list_item_name'].value,
                        due_date: data[0].element.itemContent['type_check_list_item_due_date'].value,
                        reminder: data[0].element.itemContent['type_check_list_item_reminder'].value,
                        success: data[0].element.itemContent['type_check_list_item_success'].value,
                        userid: data[0].element.itemContent['type_check_list_item_assigned_to'].value
                    }, typelists).then(function (value) {
                        data[0].element.checked = value.success;
                        data[0].element.text = value.name;
                        data[0].element.itemContent['type_check_list_item_reminder'].value = value.reminder;
                        data[0].element.itemContent['type_check_list_item_assigned_to'].value = value.assigned_to;
                        data[0].element.itemContent['type_check_list_item_name'].value = value.name;
                        data[0].element.itemContent['type_check_list_item_due_date'].value = value.due_date;
                        data[0].element.itemContent['type_check_list_item_success'].value = value.success;
                    });
                }
            },
            {
                icon: "close",
                iconStyle: { color: "white" },
                text: LanguageModule.text("txt_delete"),
                background: "red",
                event: deleteFunc
            }
        ]
    );
    itemsTable.swipeCompleteLeft = deleteFunc;

    var addNewItem = {};
    addNewItem["type_check_list_item_reminder"] = {
        localid: "type_check_list_item_reminder",
        valueid: 0,
        typeid: -17,
        privtype: "enum",
        value: "type_reminder_none"
    };
    addNewItem["type_check_list_item_assigned_to"] = {
        localid: "type_check_list_item_assigned_to",
        valueid: 0,
        typeid: -8,
        privtype: "users",
        value: userid
    };
    addNewItem["type_check_list_item_name"] = {
        localid: "type_check_list_item_name",
        valueid: 0,
        typeid: -1,
        privtype: "string",
        value: ""
    };
    addNewItem["type_check_list_item_due_date"] = {
        localid: "type_check_list_item_due_date",
        valueid: 0,
        typeid: -5,
        privtype: "datetime",
        value: new Date()
    };
    addNewItem["type_check_list_item_index"] = {
        localid: "type_check_list_item_index",
        valueid: 0,
        typeid: -3,
        privtype: "number",
        value: 1
    };
    addNewItem["type_check_list_item_success"] = {
        localid: "type_check_list_item_success",
        valueid: 0,
        typeid: -6,
        privtype: "boolean",
        value: false
    };

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
                    child: { text: "+ " + LanguageModule.text("txt_add") },
                    on: {
                        click: function () {
                            theme.cardAddItemForm(frameList, 0, {
                                name: "",
                                due_date: new Date(),
                                reminder: "type_reminder_none",
                                success: false,
                                userid: userid
                            }, typelists).then(function (value) {
                                var success = successElt(value.success, value.name);
                                success.valueid = 0;
                                var itemContent = EncodingClass.string.duplicate(addNewItem);
                                itemContent['type_check_list_item_reminder'].value = value.reminder;
                                itemContent['type_check_list_item_assigned_to'].value = value.assigned_to;
                                itemContent['type_check_list_item_name'].value = value.name;
                                itemContent['type_check_list_item_due_date'].value = value.due_date;
                                itemContent['type_check_list_item_success'].value = value.success;
                                success.itemContent = itemContent;
                                var item = [{ element: success }];
                                itemsTable.insertRow(item);
                            });
                        }
                    }
                }
            }
        ]
    });

    returnData.getValue = function () {
        var data = itemsTable.data;
        var content = [];
        for (var j = 0; j < data.length; j++) {
            var item = data[j];
            var success = item[0].element;
            var itemContent = success.itemContent;
            itemContent["type_check_list_item_success"].value = success.checked;
            itemContent["type_check_list_item_index"].value = (j + 1);
            content.push({
                valueid: success.valueid,
                typeid: -16,
                privtype: "structure",
                value: [
                    itemContent["type_check_list_item_reminder"],
                    itemContent["type_check_list_item_assigned_to"],
                    itemContent["type_check_list_item_name"],
                    itemContent["type_check_list_item_due_date"],
                    itemContent["type_check_list_item_index"],
                    itemContent["type_check_list_item_success"]
                ]
            });
        }
        return content;
    }
    return returnData;
}

theme.generateChecklistData = function (valueid, values) {
    var name_value, items_value, created_value, user_created_value;
    var getItemList = function (valueid) {
        var value = [];
        valueid.forEach(function (elt) {
            var subvalue = [], tIndex;
            var content2 = EncodingClass.string.toVariable(values.items[values.getIndex(elt)].content);
            content2.forEach(function (elt2) {
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
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function (elt) {
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
                items_value.sort(function (a, b) {
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

theme.cardAddCheckListForm = function (params) {
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
        details.forEach(function (elt) {
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

    var saveFunc = function (promise) {
        promise().then(function resolve(value) {
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateChecklistData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++) {
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            if (params.id > 0) {
                var generateChecklistValueData = function (content, objid) {
                    var value = [];
                    content.forEach(function (elt) {
                        var subValue = {};
                        elt.value.forEach(function (item) {
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
                var removeOldElt = function (ident, index) {
                    var parent = absol.$(".card-activities-group-" + ident, activities_block);
                    absol.$('.card-activity-view-container', parent, function (elt) {
                        if (elt.ident == value.id) {
                            if (index) {
                                var tempElt = absol.$(".card-activity-view-content", elt);
                                if (tempElt.index == index) parent.activities_container.removeChild(elt);
                            }
                            else parent.activities_container.removeChild(elt);
                        }
                    });
                    if (parent.activities_container.childNodes.length == 0) {
                        activities_block.removeChild(parent);
                        identArray = identArray.filter(function (elt) {
                            return elt != parseInt(ident);
                        });
                    }
                }
                for (var i = 0; i < temp_content.length; i++) {
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
            ////////////////////////////////////////////////////////////////
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
            }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
            var keys = Object.keys(item);
            for (var i = 0; i < keys.length; i++) {
                var newParent = absol.$(".card-activities-group-" + keys[i], activities_block);
                if (!newParent) {
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
                            paddingBottom: "20px"
                        }
                    });
                    var newParent = absol._({
                        class: ["cag-div", "card-activities-group-" + keys[i]],
                        style: {
                            'border-top': "1px solid"
                        },
                        child: [
                            {
                                style: {
                                    'font-weight': 'bold',
                                    'line-height': '30px',
                                    'text-align': 'center'
                                },
                                child: { text: title }
                            },
                            x
                        ]
                    });
                    newParent.activities_container = x;
                    var maxIdent = Math.max.apply(Math, identArray);
                    identArray.push(parseInt(keys[i]));
                    identArray.sort(function (a, b) {
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    });
                    var index = identArray.indexOf(parseInt(keys[i]));
                    if (index != identArray.length - 1) {
                        maxIdent = identArray[index + 1];
                    }
                    var className = ".card-activities-group-" + maxIdent;
                    var afterElt = absol.$(className, activities_block);
                    if (maxIdent > 0) activities_block.insertBefore(newParent, afterElt);
                    else activities_block.addChild(newParent);
                    item[keys[i]].forEach(function (elt) {
                        newParent.activities_container.addChild(elt);
                    });
                }
                else {
                    item[keys[i]].forEach(function (elt) {
                        newParent.activities_container.insertBefore(elt, newParent.activities_container.childNodes[0]);
                    });
                }
            }
        }, function reject(message) {
            if (message) ModalElement.alert({ message: message });
        });
    };

    var deleteFunc = function (promise) {
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_checklist");
        var message = LanguageModule.text("war_delete_checklist");
        ModalElement.question({
            title: title,
            message: message,
            onclick: function (index) {
                if (index == 0) {
                    promise().then(function resolve(value) {
                        var generateChecklistValueData = function (content, objid) {
                            var value = [];
                            content.forEach(function (elt) {
                                var subValue = {};
                                elt.value.forEach(function (item) {
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
                        var removeOldElt = function (ident) {
                            var parent = absol.$(".card-activities-group-" + ident, activities_block);
                            if (!parent) return;
                            absol.$('.card-activity-view-container', parent, function (elt) {
                                if (elt.ident == value.id) {
                                    parent.activities_container.removeChild(elt);
                                }
                            });
                            if (parent.activities_container.childNodes.length == 0) {
                                activities_block.removeChild(parent);
                            }
                        }
                        var x = 2;
                        if (params.isMobile) x = 3;
                        while (params.frameList.getLength() > x){
                            params.frameList.removeLast();
                        }
                        params.objects = value.objects;
                        var activities_block = absol.$(".card-activities-block", params.frameList);
                        var temp_content = generateChecklistValueData(checklist_content.items_value, checklist_content.id);
                        for (var i = 0; i < temp_content.length; i++) {
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
                    }, function reject(message) {
                        if (message) ModalElement.alert({ message: message });
                    });
                }
            }
        });
    };

    var commands = [];

    if ((params.cardArchived == 0) && (params.editMode == "edit")) {
        commands.push({
            icon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: function () {
                saveFunc(params.cmdButton.save);
            }
        });
        if (params.id) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
            title: LanguageModule.text("txt_check_list"),
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var companyData = [];

    for (var i = 0; i < params.cardContent.companyList.length; i++){
        var index = params.companies.getIndex(params.cardContent.companyList[i]);
        if (index < 0) continue; //thanhyen
        var company_classIndex = params.company_class.getIndex(params.companies.items[index].company_classid);
        if (company_classIndex < 0) continue;
        var company_className = params.company_class.items[company_classIndex].name;
        companyData.push([{element: absol._({
            class: "sortTable-cell-view",
            child: { text: params.companies.items[index].name + " - " + company_className }
        })}]);
    }

    var company = pizo.tableView([{}], companyData, false, false);
    company.headerTable.style.display = "none";
    company.style.width = "100%";
    company.addClass("stageTable");

    var is_disabled = (params.cardArchived == 1) || (params.editMode == "view");

    var activity_type = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: LanguageModule.text("txt_check_list")
    });

    board = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.cardName
    });

    name = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        value: name_value,
        disabled: is_disabled
    });

    created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(data_module.users, user_created_value)
    });

    items = theme.cardAddItemOfCheckListForm(systemconfig.userid, items_value, params.frameList, params.typelists);

    var data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: { text: LanguageModule.text("txt_activity_type") }
        },
        activity_type,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_board") }
        },
        board,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_card") }
        },
        card,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_company") }
        },
        company,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_created") }
        },
        created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_user_created") }
        },
        user_created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_name") }
        },
        name,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_check_list_item") }
        },
        items
    ];

    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });

    returnData.getValue = function () {
        var name_value, items_value;
        name_value = name.value.trim();
        if (name_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function () {
                    name.focus();
                }
            });
            return false;
        }
        items_value = items.getValue();
        if (!items_value) return false;
        if (items_value.length == 0) {
            ModalElement.alert({
                message: LanguageModule.text("war_no_items_of_checklist")
            });
            return false;
        }
        checkListValue.forEach(function (elt) {
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

theme.generateWaitData = function (valueid, values) {
    var duration_value, message_value, created_value, user_created_value;
    var waitValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function (elt) {
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

theme.cardAddWaitForm = function (params) {
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
        details.forEach(function (elt) {
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

    var saveFunc = function (promise) {
        promise().then(function resolve(value) {
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateWaitData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++) {
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            var ident = theme.cardGetMillisecondsWithoutTime(created_value);
            var parent = absol.$(".card-activities-group-" + ident, activities_block);
            if (parent) {
                absol.$('.card-activity-view-container', parent, function (elt) {
                    if (elt.ident == value.id) {
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0) {
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function (elt) {
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
            }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
            if (!newParent) {
                var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
                var color = '#e4e1f5';
                var x = absol._({
                    style: {
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: ["cag-div", "card-activities-group-" + keys[0]],
                    style: {
                        'border-top': "1px solid"
                    },
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'text-align': 'center'
                            },
                            child: { text: title }
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                var maxIdent = Math.max.apply(Math, identArray);
                identArray.push(parseInt(keys[0]));
                identArray.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index != identArray.length - 1) {
                    maxIdent = identArray[index + 1];
                }
                var className = ".card-activities-group-" + maxIdent;
                var afterElt = absol.$(className, activities_block);
                if (maxIdent > 0) activities_block.insertBefore(newParent, afterElt);
                else activities_block.addChild(newParent);
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message) {
            if (message) ModalElement.alert({ message: message });
        });
    };

    var deleteFunc = function (promise) {
        var title = LanguageModule.text("txt_delete_wait");
        var message = LanguageModule.text("war_delete_wait");
        ModalElement.question({
            title: title,
            message: message,
            onclick: function (index) {
                if (index == 0) {
                    promise().then(function resolve(value) {
                        var x = 2;
                        if (params.isMobile) x = 3;
                        while (params.frameList.getLength() > x){
                            params.frameList.removeLast();
                        }
                        params.objects = value.objects;
                        var activities_block = absol.$(".card-activities-block", params.frameList);
                        var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                        var parent = absol.$(".card-activities-group-" + ident, activities_block);
                        if (parent) {
                            absol.$('.card-activity-view-container', parent, function (elt) {
                                if (elt.ident == value.id) {
                                    parent.activities_container.removeChild(elt);
                                }
                            });
                            if (parent.activities_container.childNodes.length == 0) {
                                activities_block.removeChild(parent);
                            }
                        }
                    }, function reject(message) {
                        if (message) ModalElement.alert({ message: message });
                    });
                }
            }
        });
    };

    var commands = [];

    if ((params.cardArchived == 0) && (params.editMode == "edit")) {
        commands.push({
            icon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: function () {
                saveFunc(params.cmdButton.save);
            }
        });
        if (params.id) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
            title: LanguageModule.text("txt_wait"),
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var companyData = [];

    for (var i = 0; i < params.cardContent.companyList.length; i++){
        var index = params.companies.getIndex(params.cardContent.companyList[i]);
        if (index < 0) continue; //thanhyen
        var company_classIndex = params.company_class.getIndex(params.companies.items[index].company_classid);
        if (company_classIndex < 0) continue;
        var company_className = params.company_class.items[company_classIndex].name;
        companyData.push([{element: absol._({
            class: "sortTable-cell-view",
            child: { text: params.companies.items[index].name + " - " + company_className }
        })}]);
    }

    var company = pizo.tableView([{}], companyData, false, false);
    company.headerTable.style.display = "none";
    company.style.width = "100%";
    company.addClass("stageTable");

    var is_disabled = (params.cardArchived == 1) || (params.editMode == "view");

    var activity_type = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: LanguageModule.text("txt_wait")
    });

    board = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.cardName
    });

    duration = theme.input({
        type: 'number',
        style: {
            width: "50px"
        },
        value: duration_value,
        disabled: is_disabled
    });

    message = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "100%",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: message_value,
            disabled: is_disabled
        }
    });

    created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(data_module.users, user_created_value)
    });

    var data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: { text: LanguageModule.text("txt_activity_type") }
        },
        activity_type,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_board") }
        },
        board,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_card") }
        },
        card,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_company") }
        },
        company,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_duration") }
        },
        absol._({
            tag: "span",
            child: { text: "Sau " }
        }),
        duration,
        absol._({
            tag: "span",
            child: { text: " ngày mà không ghi nhận được hoạt động nào thì thông báo cho người quản lý card." }
        }),
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_message") }
        },
        message,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_created") }
        },
        created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_user_created") }
        },
        user_created
    ];

    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });

    returnData.getValue = function () {
        var duration_value, message_value;
        duration_value = duration.value.trim();
        if (duration_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_duration"),
                func: function () {
                    duration.focus();
                }
            });
            return false;
        }
        message_value = message.value.trim();
        if (message_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_message_value"),
                func: function () {
                    message.focus();
                }
            });
            return false;
        }
        waitValue.forEach(function (elt) {
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

theme.generateCallData = function (valueid, values) {
    var call_to_value, result_value, status_value, due_date_value, reminder_value, created_value, assigned_to_value, participant_value, work_value, user_created_value;
    var callValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function (elt) {
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

theme.cardAddCallForm = function (params) {
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
        details.forEach(function (elt) {
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

    var saveFunc = function (promise) {
        promise().then(function resolve(value) {
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateCallData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++) {
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
            var parent = absol.$(".card-activities-group-" + ident, activities_block);
            if (parent) {
                absol.$('.card-activity-view-container', parent, function (elt) {
                    if (elt.ident == value.id) {
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0) {
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function (elt) {
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
            }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
            if (!newParent) {
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
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: ["cag-div", "card-activities-group-" + keys[0]],
                    style: {
                        'border-top': "1px solid"
                    },
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'text-align': 'center'
                            },
                            child: { text: title }
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                identArray.push(parseInt(keys[0]));
                identArray.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1) {
                    newParent.addTo(activities_block);
                }
                else {
                    var className = ".card-activities-group-" + identArray[index + 1];
                    var afterElt = absol.$(className, activities_block);
                    if (identArray[index + 1] > 0) activities_block.insertBefore(newParent, afterElt);
                    else activities_block.addChild(newParent);
                }
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message) {
            if (message) ModalElement.alert({ message: message });
        });
    };

    var deleteFunc = function (promise) {
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_call");
        var message = LanguageModule.text("war_delete_call");
        ModalElement.question({
            title: title,
            message: message,
            onclick: function (index) {
                if (index == 0) {
                    promise().then(function resolve(value) {
                        var x = 2;
                        if (params.isMobile) x = 3;
                        while (params.frameList.getLength() > x){
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
                        var parent = absol.$(".card-activities-group-" + ident, activities_block);
                        if (parent) {
                            absol.$('.card-activity-view-container', parent, function (elt) {
                                if (elt.ident == value.id) {
                                    parent.activities_container.removeChild(elt);
                                }
                            });
                            if (parent.activities_container.childNodes.length == 0) {
                                activities_block.removeChild(parent);
                            }
                        }
                    }, function reject(message) {
                        if (message) ModalElement.alert({ message: message });
                    });
                }
            }
        });
    };

    var commands = [];

    if ((params.cardArchived == 0) && (params.editMode == "edit")) {
        commands.push({
            icon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: function () {
                saveFunc(params.cmdButton.save);
            }
        });
        if (params.id) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
            title: LanguageModule.text("txt_call"),
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var companyData = [];

    for (var i = 0; i < params.cardContent.companyList.length; i++){
        var index = params.companies.getIndex(params.cardContent.companyList[i]);
        if (index < 0) continue; //thanhyen
        var company_classIndex = params.company_class.getIndex(params.companies.items[index].company_classid);
        if (company_classIndex < 0) continue;
        var company_className = params.company_class.items[company_classIndex].name;
        companyData.push([{element: absol._({
            class: "sortTable-cell-view",
            child: { text: params.companies.items[index].name + " - " + company_className }
        })}]);
    }

    var company = pizo.tableView([{}], companyData, false, false);
    company.headerTable.style.display = "none";
    company.style.width = "100%";
    company.addClass("stageTable");

    var is_disabled = (params.cardArchived == 1) || (params.editMode == "view");

    var activity_type = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: LanguageModule.text("txt_call")
    });

    board = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.cardName
    });

    call_to = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        value: call_to_value,
        disabled: is_disabled
    });

    work = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        value: work_value,
        disabled: is_disabled
    });

    result = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "100%",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: result_value,
            disabled: is_disabled
        }
    });

    status = absol._({
        tag: "checkboxinput",
        props: {
            checked: status_value,
            disabled: is_disabled
        }
    });

    assigned_to = theme.cardGenerateUserElt(assigned_to_value);

    if (is_disabled) assigned_to.disabled = true;

    due_date = theme.cardGenerateDateTimeElt(due_date_value);

    if (is_disabled) {
        due_date.dateElt.disabled = true;
        due_date.timeElt.disabled = true;
    }

    reminder = theme.cardGenerateEnumElt(-17, reminder_value, params.typelists);

    if (is_disabled) reminder.disabled = true;

    created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(data_module.users, user_created_value)
    });

    var data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: { text: LanguageModule.text("txt_activity_type") }
        },
        activity_type,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_board") }
        },
        board,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_card") }
        },
        card,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_company") }
        },
        company,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_call_to") }
        },
        call_to,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_work") }
        },
        work,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_result") }
        },
        result,
        {
            class: "card-mobile-label-form-edit",
            style: {
                position: "relative",
                textAlign: "right"
            },
            child: [
                {
                    style: {
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        height: "100%"
                    },
                    child: [
                        {
                            style: {
                                height: "100%",
                                display: 'inline-block',
                                'vertical-align': 'middle'
                            }
                        },
                        {
                            style: {
                                display: 'inline-block',
                                'vertical-align': 'middle'
                            },
                            child: { text: LanguageModule.text("txt_complete") }
                        }
                    ]
                },
                {
                    child: status
                }
            ]
        },
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_due_date") }
        },
        due_date,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_reminder") }
        },
        reminder,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_assigned_to") }
        },
        assigned_to,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_created") }
        },
        created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_user_created") }
        },
        user_created
    ];

    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });

    returnData.getValue = function () {
        var call_to_value, result_value, status_value, type_value, due_date_value, reminder_value, assigned_to_value, participant_value, work_value;
        call_to_value = call_to.value.trim();
        if (call_to_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_call_to_name"),
                func: function () {
                    call_to.focus();
                }
            });
            return false;
        }
        work_value = work.value.trim();
        if (work_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function () {
                    work.focus();
                }
            });
            return false;
        }
        status_value = status.checked;
        result_value = result.value.trim();
        if (status_value == "txt_success" && result_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_result_value"),
                func: function () {
                    result.focus();
                }
            });
            return false;
        }
        due_date_value = due_date.getValue();
        reminder_value = reminder.value;
        assigned_to_value = assigned_to.value;
        callValue.forEach(function (elt) {
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

theme.generateTaskData = function (valueid, values) {
    var work_value, result_value, status_value, due_date_value, reminder_value, created_value, assigned_to_value, participant_value, user_created_value;
    var taskValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function (elt) {
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

theme.cardAddTaskForm = function (params) {
    var content, vIndex, oIndex;
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
        details.forEach(function (elt) {
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

    var saveFunc = function (promise) {
        promise().then(function resolve(value) {
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateTaskData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++) {
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
            var parent = absol.$(".card-activities-group-" + ident, activities_block);
            if (parent) {
                absol.$('.card-activity-view-container', parent, function (elt) {
                    if (elt.ident == value.id) {
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0) {
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function (elt) {
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
            }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
            if (!newParent) {
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
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: ["cag-div", "card-activities-group-" + keys[0]],
                    style: {
                        'border-top': "1px solid"
                    },
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'text-align': 'center'
                            },
                            child: { text: title }
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                identArray.push(parseInt(keys[0]));
                identArray.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1) {
                    newParent.addTo(activities_block);
                }
                else {
                    var className = ".card-activities-group-" + identArray[index + 1];
                    var afterElt = absol.$(className, activities_block);
                    if (identArray[index + 1] > 0) activities_block.insertBefore(newParent, afterElt);
                    else activities_block.addChild(newParent);
                }
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message) {
            if (message) ModalElement.alert({ message: message });
        });
    };

    var deleteFunc = function (promise) {
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_task");
        var message = LanguageModule.text("war_delete_task");
        ModalElement.question({
            title: title,
            message: message,
            onclick: function (index) {
                if (index == 0) {
                    promise().then(function resolve(value) {
                        var x = 2;
                        if (params.isMobile) x = 3;
                        while (params.frameList.getLength() > x){
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
                        var parent = absol.$(".card-activities-group-" + ident, activities_block);
                        if (parent) {
                            absol.$('.card-activity-view-container', parent, function (elt) {
                                if (elt.ident == value.id) {
                                    parent.activities_container.removeChild(elt);
                                }
                            });
                            if (parent.activities_container.childNodes.length == 0) {
                                activities_block.removeChild(parent);
                            }
                        }
                    }, function reject(message) {
                        if (message) ModalElement.alert({ message: message });
                    });
                }
            }
        });
    };

    var commands = [];

    if ((params.cardArchived == 0) && (params.editMode == "edit")) {
        commands.push({
            icon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: function () {
                saveFunc(params.cmdButton.save);
            }
        });
        if (params.id) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
            title: LanguageModule.text("txt_task"),
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var companyData = [];

    for (var i = 0; i < params.cardContent.companyList.length; i++){
        var index = params.companies.getIndex(params.cardContent.companyList[i]);
        if (index < 0) continue; //thanhyen
        var company_classIndex = params.company_class.getIndex(params.companies.items[index].company_classid);
        if (company_classIndex < 0) continue;
        var company_className = params.company_class.items[company_classIndex].name;
        companyData.push([{element: absol._({
            class: "sortTable-cell-view",
            child: { text: params.companies.items[index].name + " - " + company_className }
        })}]);
    }

    var company = pizo.tableView([{}], companyData, false, false);
    company.headerTable.style.display = "none";
    company.style.width = "100%";
    company.addClass("stageTable");

    var is_disabled = (params.cardArchived == 1) || (params.editMode == "view");

    var activity_type = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: LanguageModule.text("txt_task")
    });

    board = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.cardName
    });

    work = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        value: work_value,
        disabled: is_disabled
    });

    result = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "100%",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: result_value,
            disabled: is_disabled
        }
    });

    status = absol._({
        tag: "checkboxinput",
        props: {
            checked: status_value,
            disabled: is_disabled
        }
    });

    assigned_to = theme.cardGenerateUserElt(assigned_to_value);

    if (is_disabled) assigned_to.disabled = true;

    participant = theme.cardGenerateUserListElt(participant_value);

    if (is_disabled) participant.disabled = true;

    due_date = theme.cardGenerateDateTimeElt(due_date_value);

    if (is_disabled) {
        due_date.dateElt.disabled = true;
        due_date.timeElt.disabled = true;
    }

    reminder = theme.cardGenerateEnumElt(-17, reminder_value, params.typelists);

    if (is_disabled) reminder.disabled = true;

    created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(data_module.users, user_created_value)
    });
    var data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: { text: LanguageModule.text("txt_activity_type") }
        },
        activity_type,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_board") }
        },
        board,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_card") }
        },
        card,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_company") }
        },
        company,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_work") }
        },
        work,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_result") }
        },
        result,
        {
            class: "card-mobile-label-form-edit",
            style: {
                position: "relative",
                textAlign: "right"
            },
            child: [
                {
                    style: {
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        height: "100%"
                    },
                    child: [
                        {
                            style: {
                                height: "100%",
                                display: 'inline-block',
                                'vertical-align': 'middle'
                            }
                        },
                        {
                            style: {
                                display: 'inline-block',
                                'vertical-align': 'middle'
                            },
                            child: { text: LanguageModule.text("txt_complete") }
                        }
                    ]
                },
                {
                    child: status
                }
            ]
        },
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_due_date") }
        },
        due_date,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_reminder") }
        },
        reminder,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_assigned_to") }
        },
        assigned_to,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_participant") }
        },
        participant,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_created") }
        },
        created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_user_created") }
        },
        user_created
    ];
    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });
    returnData.getValue = function () {
        var work_value, result_value, status_value, type_value, due_date_value, reminder_value, assigned_to_value, participant_value;
        work_value = work.value.trim();
        if (work_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function () {
                    work.focus();
                }
            });
            return false;
        }
        status_value = status.checked;
        result_value = result.value.trim();
        if (status_value == "txt_success" && result_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_result_value"),
                func: function () {
                    result.focus();
                }
            });
            return false;
        }
        due_date_value = due_date.getValue();
        reminder_value = reminder.value;
        assigned_to_value = assigned_to.value;
        participant_value = participant.values;
        taskValue.forEach(function (elt) {
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

theme.generateMeetingData = function (valueid, values) {
    var location_value, result_value, status_value, type_value, start_date_value, reminder_value, created_value, assigned_to_value, participant_value, user_created_value, end_date_value, all_day_value, name_value;
    var meetingValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function (elt) {
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

theme.cardAddMeetingForm = function (params) {
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
        details.forEach(function (elt) {
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

    var saveFunc = function (promise) {
        promise().then(function resolve(value) {
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateMeetingData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++) {
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
            var parent = absol.$(".card-activities-group-" + ident, activities_block);
            if (parent) {
                absol.$('.card-activity-view-container', parent, function (elt) {
                    if (elt.ident == value.id) {
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0) {
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function (elt) {
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
            }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
            if (!newParent) {
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
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: ["cag-div", "card-activities-group-" + keys[0]],
                    style: {
                        'border-top': "1px solid"
                    },
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'text-align': 'center'
                            },
                            child: { text: title }
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                identArray.push(parseInt(keys[0]));
                identArray.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index == identArray.length - 1) {
                    newParent.addTo(activities_block);
                }
                else {
                    var className = ".card-activities-group-" + identArray[index + 1];
                    var afterElt = absol.$(className, activities_block);
                    if (identArray[index + 1] > 0) activities_block.insertBefore(newParent, afterElt);
                    else activities_block.addChild(newParent);
                }
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message) {
            if (message) ModalElement.alert({ message: message });
        });
    };

    var deleteFunc = function (promise) {
        var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
        var title = LanguageModule.text("txt_delete_meeting");
        var message = LanguageModule.text("war_delete_meeting");
        ModalElement.question({
            title: title,
            message: message,
            onclick: function (index) {
                if (index == 0) {
                    promise().then(function resolve(value) {
                        var x = 2;
                        if (params.isMobile) x = 3;
                        while (params.frameList.getLength() > x){
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
                        var parent = absol.$(".card-activities-group-" + ident, activities_block);
                        if (parent) {
                            absol.$('.card-activity-view-container', parent, function (elt) {
                                if (elt.ident == value.id) {
                                    parent.activities_container.removeChild(elt);
                                }
                            });
                            if (parent.activities_container.childNodes.length == 0) {
                                activities_block.removeChild(parent);
                            }
                        }
                    }, function reject(message) {
                        if (message) ModalElement.alert({ message: message });
                    });
                }
            }
        });
    };

    var companyData = [];

    for (var i = 0; i < params.cardContent.companyList.length; i++){
        var index = params.companies.getIndex(params.cardContent.companyList[i]);
        if (index < 0) continue; //thanhyen
        var company_classIndex = params.company_class.getIndex(params.companies.items[index].company_classid);
        if (company_classIndex < 0) continue;
        var company_className = params.company_class.items[company_classIndex].name;
        companyData.push([{element: absol._({
            class: "sortTable-cell-view",
            child: { text: params.companies.items[index].name + " - " + company_className }
        })}]);
    }

    var company = pizo.tableView([{}], companyData, false, false);
    company.headerTable.style.display = "none";
    company.style.width = "100%";
    company.addClass("stageTable");

    var commands = [];

    if ((params.cardArchived == 0) && (params.editMode == "edit")) {
        commands.push({
            icon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: function () {
                saveFunc(params.cmdButton.save);
            }
        });

        if (params.id) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
            title: LanguageModule.text("txt_meeting"),
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var is_disabled = (params.cardArchived == 1) || (params.editMode == "view");

    var activity_type = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: LanguageModule.text("txt_meeting")
    });

    board = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.cardName
    });

    name = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        value: name_value,
        disabled: is_disabled
    });

    location = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        value: location_value,
        disabled: is_disabled
    });

    result = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "100%",
            verticalAlign: "top"
        },
        props: {
            rows: 15,
            value: result_value,
            disabled: is_disabled
        }
    });

    status = absol._({
        tag: "checkboxinput",
        props: {
            checked: status_value,
            disabled: is_disabled
        }
    });

    all_day = absol._({
        style: {
            display: "inline-block",
            paddingLeft: "var(--control-horizontal-distance-2)"
        },
        tag: "checkbox",
        props: {
            checked: all_day_value,
            text: LanguageModule.text("txt_all_day"),
            disabled: is_disabled
        },
        on: {
            change: function () {
                var self = this;
                absol.$(".card-meeting-time-elt", st, function (elt) {
                    elt.disabled = self.checked;
                });
            }
        }
    });

    type = theme.cardGenerateEnumElt(-19, type_value, params.typelists);

    if (is_disabled) type.disabled = true;

    assigned_to = theme.cardGenerateUserElt(assigned_to_value);

    if (is_disabled) assigned_to.disabled = true;

    participant = theme.cardGenerateUserListElt(participant_value);

    if (is_disabled) participant.disabled = true;
    var start_date_change = function () {
        var startValue = start_date.getValue();
        if (startValue.getTime() > start_date.oldValue.getTime()) {
            var endValue = end_date.getValue();
            end_date.dateElt.value = new Date((startValue.getTime() - start_date.oldValue.getTime()) + endValue.getTime());
            end_date.timeElt.dayOffset = new Date((startValue.getTime() - start_date.oldValue.getTime()) + endValue.getTime());
        }
        start_date.oldValue = startValue;
    };

    var end_date_change = function () {
        var endValue = end_date.getValue();
        if (endValue.getTime() < end_date.oldValue.getTime()) {
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

    if (is_disabled) {
        start_date.dateElt.disabled = true;
        start_date.timeElt.disabled = true;
    }

    end_date = theme.cardGenerateDateTimeElt(end_date_value);
    end_date.timeElt.on("change", end_date_change);
    end_date.dateElt.on("change", end_date_change);
    end_date.childNodes[1].addClass("card-meeting-time-elt");

    if (is_disabled) {
        end_date.dateElt.disabled = true;
        end_date.timeElt.disabled = true;
    }

    reminder = theme.cardGenerateEnumElt(-17, reminder_value, params.typelists);

    if (is_disabled) reminder.disabled = true;

    created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(data_module.users, user_created_value)
    });

    var data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: { text: LanguageModule.text("txt_activity_type") }
        },
        activity_type,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_board") }
        },
        board,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_card") }
        },
        card,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_company") }
        },
        company,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_meeting_name") }
        },
        name,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_location") }
        },
        location,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_result") }
        },
        result,
        {
            class: "card-mobile-label-form-edit",
            style: {
                position: "relative",
                textAlign: "right"
            },
            child: [
                {
                    style: {
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        height: "100%"
                    },
                    child: [
                        {
                            style: {
                                height: "100%",
                                display: 'inline-block',
                                'vertical-align': 'middle'
                            }
                        },
                        {
                            style: {
                                display: 'inline-block',
                                'vertical-align': 'middle'
                            },
                            child: { text: LanguageModule.text("txt_complete") }
                        }
                    ]
                },
                {
                    child: status
                }
            ]
        },
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_type") }
        },
        type,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_start_date") }
        },
        start_date, all_day,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_end_date") }
        },
        end_date,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_reminder") }
        },
        reminder,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_assigned_to") }
        },
        assigned_to,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_participant") }
        },
        participant,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_created") }
        },
        created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_user_created") }
        },
        user_created
    ];

    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });

    returnData.getValue = function () {
        var name_value, location_value, result_value, status_value, type_value, start_date_value, reminder_value, assigned_to_value, participant_value;
        name_value = name.value.trim();
        if (name_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function () {
                    name.focus();
                }
            });
            return false;
        }
        location_value = location.value.trim();
        if (location_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_location"),
                func: function () {
                    location.focus();
                }
            });
            return false;
        }
        status_value = status.checked;
        result_value = result.value.trim();
        if (status_value == "txt_success" && result_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_result_value"),
                func: function () {
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
        meetingValue.forEach(function (elt) {
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

theme.generateNoteData = function (valueid, values) {
    var work_value, note_value, created_value, user_created_value;
    var noteValue = [];
    var vIndex = values.getIndex(valueid);
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function (elt) {
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
theme.generateMailData = function (valueid, values) {
    var mailValue = [];
    var vIndex = values.getIndex(valueid);
    var content_value, to_value, subject_value;
    EncodingClass.string.toVariable(values.items[vIndex].content).forEach(function (elt) {
        var tIndex = values.getIndex(elt.valueid);
        switch (elt.localid) {
            case "type_sendmail_content":
                content_value = values.items[tIndex].content;
                mailValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -27,
                    value: content_value,
                    privtype: "html"
                });
                break;
            case "type_sendmail_to":
                to_value = EncodingClass.string.toVariable(values.items[tIndex].content);
                mailValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -28,
                    value: to_value,
                    privtype: "email_list"
                });
                break;
            case "type_sendmail_subject":
                subject_value = values.items[tIndex].content;
                mailValue.push({
                    localid: elt.localid,
                    valueid: elt.valueid,
                    typeid: -1,
                    value: subject_value,
                    privtype: "string"
                });
                break;
        }
    });
    return {
        to_value: to_value,
        subject_value: subject_value,
        content_value: content_value,
        mailValue: mailValue
    };
};

theme.redrawFileObject = function (params) {
    var activities_block = absol.$(".card-activities-block", params.frameList);
    var identArray = [];
    for (var i = 0; i < activities_block.childNodes.length; i++) {
        if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
    }
    if (params.type = "new") {
        params.created_value = new Date();
    }
    else {
        params.created_value = params.fileList[0].time;
    }
    var ident = theme.cardGetMillisecondsWithoutTime(params.created_value);
    var parent = absol.$(".card-activities-group-" + ident, activities_block);
    if (parent) {
        absol.$('.card-activity-view-container', parent, function (elt) {
            if (elt.ident == "file_" + ident) {
                parent.activities_container.removeChild(elt);
            }
        });
        if (parent.activities_container.childNodes.length == 0) {
            activities_block.removeChild(parent);
            identArray = identArray.filter(function (elt) {
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
        listFile: params.fileList.concat(params.listFileToday),
        created: params.created_value,
        editFunc: params.editFileFunc
    }, params.cardid, params.getObjectbyType, systemconfig.userid, item, params.imagesList);
    var keys = Object.keys(item);
    var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
    if (!newParent) {
        var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
        var color = '#e4e1f5';
        var x = absol._({
            style: {
                paddingBottom: "20px"
            }
        });
        var newParent = absol._({
            class: ["cag-div", "card-activities-group-" + keys[0]],
            style: {
                'border-top': "1px solid"
            },
            child: [
                {
                    style: {
                        'font-weight': 'bold',
                        'line-height': '30px',
                        'text-align': 'center'
                    },
                    child: { text: title }
                },
                x
            ]
        });
        newParent.activities_container = x;
        var maxIdent = Math.max.apply(Math, identArray);
        identArray.push(parseInt(keys[0]));
        identArray.sort(function (a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
        var index = identArray.indexOf(parseInt(keys[0]));
        if (index != identArray.length - 1) {
            maxIdent = identArray[index + 1];
        }
        var className = ".card-activities-group-" + maxIdent;
        var afterElt = absol.$(className, activities_block);
        if (maxIdent > 0) activities_block.insertBefore(newParent, afterElt);
        else activities_block.addChild(newParent);
        newParent.activities_container.addChild(item[keys[0]][0]);
    }
    else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
};

theme.cardAddFileForm = function (params) {
    params.inputIdBoxes = {};
    var deleteTitleConfirm = function (fileData) {
        ModalElement.question({
            title: LanguageModule.text("war_tit_delete_file"),
            message: LanguageModule.text2("war_txt_delete_file", [fileData.title]),
            onclick: function (sel) {
                if (sel == 0) {
                    deleteTitle(fileData);
                }
            }
        });
    };
    var deleteTitle = function (fileData) {
        params.deleteFunc(fileData).then(function (values) {
            for (var i = 0; i < params.fileList.length; i++) {
                if (params.fileList[i].id == fileData.id) {
                    params.fileList.splice(i, 1);
                    break;
                }
            }
            theme.redrawFileObject(params);
            params.inputIdBoxes["file_elt_" + fileData.id].style.display = "none";
        });
    };
    var saveTitle = function (title_inputtext, titleElt, fileData) {
        var title = title_inputtext.value.trim();
        if (title == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function () {
                    title_inputtext.focus();
                }
            });
            return;
        }
        params.saveFunc(fileData, title).then(function (values) {
            ModalElement.close(1);
            DOMElement.removeAllChildren(titleElt);
            titleElt.appendChild(DOMElement.span({ text: title }));
            fileData.title = title;
            theme.redrawFileObject(params);
        });
    };
    var editTitle = function (titleElt, fileData) {
        var title_inputtext = theme.input({
            style: {
                width: "100%"
            },
            onkeydown: function (event) {
                if (event.keyCode == 13) saveTitle(this, titleElt, fileData);
            },
            value: fileData.title
        });
        theme.modalFormMobile({
            title: LanguageModule.text("txt_edit_file_title"),
            bodycontent: absol._({
                child: [
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
                    })
                ]
            }),
            buttonList: [
                {
                    typeColor: "light",
                    text: LanguageModule.text("txt_save")
                },
                {
                    text: LanguageModule.text("txt_cancel")
                }
            ],
            func: function(index){
                if (index == 0) {
                    saveTitle(title_inputtext, titleElt, fileData);
                }
            }
        });
        title_inputtext.focus();
    };
    var redrawFileList = function () {
        var elt, typeFile;
        var isDelete;
        var childFiles = [], suffFile, fileIcon, titleElt;
        for (var i = 0; i < params.fileList.length; i++) {
            titleElt = DOMElement.td({ children: [DOMElement.span({ text: params.fileList[i].title })] });
            isDelete = false;
            if (params.userid == params.fileList[i].userid) isDelete = true;
            else if (params.fileList[i].type == "card") {
                if (params.privAdmin) isDelete = true;
            }
            if (params.fileList[i].content_type == "file") {
                suffFile = params.fileList[i].filename.split('.').pop();
                if (contentModule.listSuffFiles.indexOf(suffFile) >= 0) {
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
                                                height: "50px",
                                                width: "40px",
                                                // border: "1px solid #d6d6d6",
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
                                                    maxHeight: "50px",
                                                    maxWidth: "50px"
                                                }
                                            }
                                        })]
                                    }),
                                    { attrs: { style: { width: "20px" } } },
                                    titleElt
                                ]]
                            })]
                        }),
                        { attrs: { style: { width: "10px" } } },
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-cover",
                                style: {
                                    marginRight: "var(--control-horizontal-distance-1)"
                                },
                                onclick: function (titleElt, fileData) {
                                    return function () {
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
                                    display: (isDelete) ? "" : "none"
                                },
                                onclick: function (fileData) {
                                    return function () {
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
                                onclick: function (imagesList, id) {
                                    return function (event, me) {
                                        document.body.appendChild(descViewImagePreview(imagesList, id));
                                    }
                                }(params.imagesList, params.fileList[i].id)
                            },
                            children: [DOMElement.table({
                                data: [[
                                    DOMElement.div({
                                        attrs: {
                                            style: {
                                                height: "50px",
                                                width: "50px",
                                                // border: "1px solid #d6d6d6",
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
                                                    maxHeight: "50px",
                                                    maxWidth: "50px"
                                                }
                                            }
                                        })]
                                    }),
                                    { attrs: { style: { width: "20px" } } },
                                    titleElt
                                ]]
                            })]
                        }),
                        { attrs: { style: { width: "10px" } } },
                        DOMElement.div({
                            attrs: {
                                className: "card-icon-cover",
                                style: {
                                    marginRight: "var(--control-horizontal-distance-1)"
                                },
                                onclick: function (titleElt, fileData) {
                                    return function () {
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
                                    display: (isDelete) ? "" : "none"
                                },
                                onclick: function (fileData) {
                                    return function () {
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
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_file")
        },
        on: {
            action: params.cmdButton.close
        }
    });
    // var buttons = [
    //     absol._({
    //         class: "single-button-header",
    //         child: theme.closeButton({
    //             onclick: params.cmdButton.close
    //         })
    //     })
    // ];
    // var contentChild = [
    //     {
    //         class: ["absol-single-page-header", "button-panel-header", "header-of-board"],
    //         child: buttons
    //     }
    // ];
    var contentChild = [];
    if (params.type == "new") {
        var uploadCtn = DOMElement.div({
            attrs: {
                style: {
                    width: "70vw",
                    height: "50vh",
                    margin: "auto"
                }
            }
        });
        var x = {...pizo.xmlModalDragManyFiles};
        x.iconSrc = "../../../../vivid_exticons/";
        uploadCtn.appendChild(x.containGetImage());
        setTimeout(function () {
            x.functionClickDone = function () {
                var files = x.getFile();
                if (files.length == 0) return;
                params.saveNewFunc(files).then(function (values) {
                    for (var i = 0; i < values.length; i++) {
                        params.fileList.unshift(values[i]);
                    }
                    redrawFileList();
                    x.resetFile();
                    theme.redrawFileObject(params);
                });
            };
            x.functionClickCancel = function () {

            };
            x.createEvent();
        }, 100);
        contentChild.push(DOMElement.div({
            attrs: { className: "card-upload-file-cards" },
            children: [uploadCtn]
        }));
    }
    var listFileElt = DOMElement.div({});
    redrawFileList();
    contentChild.push(listFileElt);
    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: contentChild
            }
        ]
    });
    // var returnData = absol.buildDom({
    //     tag: "singlepagenfooter",
    //     child: contentChild
    // });
    return returnData;
};

theme.cardAddNoteForm = function (params) {
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
        details.forEach(function (elt) {
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

    var saveFunc = function (promise) {
        promise().then(function resolve(value) {
            var toDay = theme.cardGetMillisecondsWithoutTime(new Date());
            var content = theme.generateNoteData(value.data.valueid, params.values);
            var activities_block = absol.$(".card-activities-block", params.frameList);
            var identArray = [];
            for (var i = 0; i < activities_block.childNodes.length; i++) {
                if (activities_block.childNodes[i].ident) identArray.push(activities_block.childNodes[i].ident);
            }
            var ident = theme.cardGetMillisecondsWithoutTime(created_value);
            var parent = absol.$(".card-activities-group-" + ident, activities_block);
            if (parent) {
                absol.$('.card-activity-view-container', parent, function (elt) {
                    if (elt.ident == value.id) {
                        parent.activities_container.removeChild(elt);
                    }
                });
                if (parent.activities_container.childNodes.length == 0) {
                    activities_block.removeChild(parent);
                    identArray = identArray.filter(function (elt) {
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
            }, params.cardid, params.getObjectbyType, systemconfig.userid, item);
            var keys = Object.keys(item);
            var newParent = absol.$(".card-activities-group-" + keys[0], activities_block);
            if (!newParent) {
                var title = contentModule.formatTimeDisplay(new Date(parseInt(keys[0])));
                var color = '#e4e1f5';
                var x = absol._({
                    style: {
                        paddingBottom: "20px"
                    }
                });
                var newParent = absol._({
                    class: ["cag-div", "card-activities-group-" + keys[0]],
                    style: {
                        'border-top': "1px solid"
                    },
                    child: [
                        {
                            style: {
                                'font-weight': 'bold',
                                'line-height': '30px',
                                'text-align': 'center'
                            },
                            child: { text: title }
                        },
                        x
                    ]
                });
                newParent.activities_container = x;
                // var maxIdent = Math.max.apply(Math, identArray);
                var maxIdent = Math.max.apply(Math, identArray) ;
                identArray.push(parseInt(keys[0]));
                identArray.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                var index = identArray.indexOf(parseInt(keys[0]));
                if (index != identArray.length - 1) {
                    maxIdent = identArray[index + 1];
                }
                var className = ".card-activities-group-" + maxIdent;
                var afterElt = absol.$(className, activities_block);
                if (maxIdent > 0) activities_block.insertBefore(newParent, afterElt);
                else activities_block.addChild(newParent);
                newParent.activities_container.addChild(item[keys[0]][0]);
            }
            else newParent.activities_container.insertBefore(item[keys[0]][0], newParent.activities_container.childNodes[0]);
        }, function reject(message) {
            if (message) ModalElement.alert({ message: message });
        });
    };

    var deleteFunc = function (promise) {
        var title = LanguageModule.text("txt_delete_note");
        var message = LanguageModule.text("war_delete_note");
        ModalElement.question({
            title: title,
            message: message,
            onclick: function (index) {
                if (index == 0) {
                    promise().then(function resolve(value) {
                        var x = 2;
                        if (params.isMobile) x = 3;
                        while (params.frameList.getLength() > x){
                            params.frameList.removeLast();
                        }
                        params.objects = value.objects;
                        var activities_block = absol.$(".card-activities-block", params.frameList);
                        var ident = theme.cardGetMillisecondsWithoutTime(created_value);
                        var parent = absol.$(".card-activities-group-" + ident, activities_block);
                        if (parent) {
                            absol.$('.card-activity-view-container', parent, function (elt) {
                                if (elt.ident == value.id) {
                                    parent.activities_container.removeChild(elt);
                                }
                            });
                            if (parent.activities_container.childNodes.length == 0) {
                                activities_block.removeChild(parent);
                            }
                        }
                    }, function reject(message) {
                        if (message) ModalElement.alert({ message: message });
                    });
                }
            }
        });
    };

    var commands = [];

    if ((params.cardArchived == 0) && (params.editMode == "edit")) {
        commands.push({
            icon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            }),
            cmd: function () {
                saveFunc(params.cmdButton.save);
            }
        });
        if (params.id) {
            commands.push({
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "delete"
                }),
                cmd: function () {
                    deleteFunc(params.cmdButton.delete);
                }
            })
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
            title: LanguageModule.text("txt_note"),
            commands: commands
        },
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var companyData = [];

    for (var i = 0; i < params.cardContent.companyList.length; i++){
        var index = params.companies.getIndex(params.cardContent.companyList[i]);
        if (index < 0) continue; //thanhyen
        var company_classIndex = params.company_class.getIndex(params.companies.items[index].company_classid);
        if (company_classIndex < 0) continue;
        var company_className = params.company_class.items[company_classIndex].name;
        companyData.push([{element: absol._({
            class: "sortTable-cell-view",
            child: { text: params.companies.items[index].name + " - " + company_className }
        })}]);
    }

    var company = pizo.tableView([{}], companyData, false, false);
    company.headerTable.style.display = "none";
    company.style.width = "100%";
    company.addClass("stageTable");

    var is_disabled = (params.cardArchived == 1) || (params.editMode == "view");

    var activity_type = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: LanguageModule.text("txt_note")
    });

    board = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.boardName
    });

    card = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: params.cardName
    });

    work = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        value: work_value,
        disabled: is_disabled
    });

    note = absol.buildDom({
        tag: "textarea",
        class: "cardSimpleTextarea",
        style: {
            width: "100%",
            height: "100%",
            verticalAlign: "top"
        },
        props: {
            value: note_value,
            disabled: is_disabled
        }
    });

    created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.formatTimeDisplay(created_value)
    });

    user_created = theme.input({
        type: 'text',
        style: {
            width: "100%"
        },
        disabled: true,
        value: contentModule.getUsernameByhomeid2(data_module.users, user_created_value)
    });

    var data = [
        {
            class: "card-mobile-label-form-edit-first",
            child: { text: LanguageModule.text("txt_activity_type") }
        },
        activity_type,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_board") }
        },
        board,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_card") }
        },
        card,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_company") }
        },
        company,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_work") }
        },
        work,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_created") }
        },
        created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_user_created") }
        },
        user_created,
        {
            class: "card-mobile-label-form-edit",
            child: { text: LanguageModule.text("txt_note") }
        },
        note
    ];

    var returnData = absol.buildDom({
        tag: "tabframe",
        child: [
            header,
            {
                class: "card-mobile-content",
                child: data
            }
        ]
    });

    returnData.getValue = function () {
        var work_value, note_value;
        work_value = work.value.trim();
        if (work_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("war_no_work_name"),
                func: function () {
                    work.focus();
                }
            });
            return false;
        }
        note_value = note.value.trim();
        if (note_value == "") {
            ModalElement.alert({
                message: LanguageModule.text("txt_no_note_value"),
                func: function () {
                    note.focus();
                }
            });
            return false;
        }
        noteValue.forEach(function (elt) {
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

theme.cardContactTable = function (contact, contactOfCard, changeFunc, database) {
    var data = [];
    var makeDict = function (list) {
        var dict = {};
        list.forEach(function (elt) {
            dict[elt.id] = elt.name;
        });
        return dict;
    }
    var companyDict = makeDict(database.companies.items);
    contact.forEach(function (item) {
        if (contactOfCard.indexOf(item.id) != -1) return;
        var extraData = [];
        if (item.phone != "") {
            extraData.push({
                tag: "span",
                child: { text: item.phone }
            });
        }
        if (item.email != "") {
            extraData.push({
                tag: "span",
                child: { text: (extraData.length > 0) ? (" - " + item.email) : item.email }
            });
        }
        var extraDataElt = absol._({
            class: "card-table-list-extra-data",
            child: extraData
        });
        var st = absol._({
            class: "sortTable-cell-view",
            child: [
                {
                    class: 'card-table-list-title',
                    child: { text: item.firstname + " " + item.lastname }
                },
                extraDataElt
            ]
        });
        st.id = item.id;
        var adapterFunc = function (id) {
            return function () {
                var icon = absol._({
                    tag: 'checkboxinput',
                    props: {
                        checked: false
                    },
                    on: {
                        change: function () {
                            changeFunc(id, this.checked);
                        }
                    }
                });
                return icon;
            }
        }(item.id);
        data.push([
            {
                value: item.firstname + " " + item.lastname,
                element: st
            },
            {
                value: item.phone
            },
            {
                value: item.email
            },
            {
                value: companyDict[item.companyid] ? (companyDict[item.companyid] + "_" + item.companyid) : "empty"
            },
            {
                value: item.comment
            },
            {
                // element: icon,
                adapter: adapterFunc
            }
        ]);
    });
    var header = [
        {},
        { hidden: true },
        { hidden: true },
        { hidden: true },
        { hidden: true },
        {}
    ];
    return pizo.tableView(header, data, false, false);
};

theme.cardCompanyTable = function (contactDB, contactOfCard, changeFunc) {
    var data = [];
    var makeDict = function (list) {
        var dict = {};
        list.forEach(function (elt) {
            dict[elt.id] = elt.name;
        });
        return dict;
    }
    var company_class_dict = makeDict(database.company_class.items);
    var nationDict = makeDict(database.nations.items);
    var cityDict = makeDict(database.cities.items);
    var districtDict = makeDict(database.districts.items);
    var data = [];
    contactDB.forEach(function (item) {
        if (contactOfCard.indexOf(item.id) != -1) return;
        var extraData = [];
        if (item.company_classid != 0) {
            extraData.push({
                tag: "span",
                child: { text: company_class_dict[item.company_classid] }
            });
        }
        if (item.address != "") {
            extraData.push({
                tag: "span",
                child: { text: (extraData.length > 0) ? (" - " + item.address) : item.address }
            });
        }
        var extraDataElt = absol._({
            class: "card-table-list-extra-data",
            child: extraData
        });
        var st = absol._({
            class: "sortTable-cell-view",
            child: [
                {
                    class: 'card-table-list-title',
                    child: { text: item.name }
                },
                extraDataElt
            ]
        });
        st.id = item.id;
        var adapterFunc = function (id) {
            return function () {
                var icon = absol._({
                    tag: 'checkboxinput',
                    props: {
                        checked: false
                    },
                    on: {
                        change: function () {
                            changeFunc(id, this.checked);
                        }
                    }
                });
                return icon;
            }
        }(item.id);
        data.push([
            {
                value: item.name,
                element: st
            },
            {
                value: company_class_dict[item.company_classid]
            },
            {
                value: districtDict[item.districtid] ? (districtDict[item.districtid] + "_" + item.districtid) : "empty"
            },
            {
                value: cityDict[item.cityid] ? (cityDict[item.cityid] + "_" + item.cityid) : "empty"
            },
            {
                value: nationDict[item.nationid] ? (nationDict[item.nationid] + "_" + item.nationid) : "empty"
            },
            {
                adapter: adapterFunc
            }
        ]);
    });
    var header = [
        {},
        { hidden: true },
        { hidden: true },
        { hidden: true },
        { hidden: true },
        {}
    ];
    return pizo.tableView(header, data, false, false);
}

theme.cardSelectContactForm = function (contactOfCard, task, callbackFunc, frameList, database) {
    var contactDB;
    if (task == "contact") contactDB = database.contacts;
    else contactDB = database.companies;
    var contact = contactDB.items.filter(function (elt) {
        return contactOfCard.indexOf(elt.id) == -1;
    });
    var selectList = [], contactTable, contactSelect;
    var changeFunc = function (id, checked) {
        if (checked) {
            selectList.push(id);
            contactSelect.addItem(id);
        }
        else {
            selectList = selectList.filter(function (elt) {
                return elt != id;
            });
            contactSelect.saferemoveItem(id);
        }
    };
    var selectContactFunc = function (task) {
        var rs = absol._({ style: { width: "max-content" } });
        rs.data = [];
        rs.addItem = function (id) {
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
                            child: { text: (task == "contact") ? (item.firstname + " " + item.lastname) : item.name }
                        }
                    },
                    {
                        class: "absol-selectbox-item-close",
                        child: {
                            tag: 'span',
                            class: ["mdi", "mdi-close"]
                        },
                        on: {
                            click: function (id) {
                                return function () {
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
            contactTable.parentNode.style.height = "calc(100% - " + (20 + contactSelect.offsetHeight) + "px)";
        }
        rs.saferemoveItem = function (id) {
            selectList = selectList.filter(function (elt) {
                return elt != id;
            });
            for (var i = 0; i < rs.data.length; i++) {
                if (rs.data[i].id == id) {
                    rs.removeChild(rs.data[i]);
                    rs.data.splice(i, 1);
                    break;
                }
            }
            for (var i = 0; i < contactTable.data.length; i++) {
                if (contactTable.data[i][0].element.id == id) {
                    if (task == "contact") contactTable.data[i][5].element.checked = false;
                    else contactTable.data[i][5].element.checked = false;
                }
            }
            contactTable.parentNode.style.height = "calc(100% - 20px)";
        }
        selectList.forEach(function (elt) {
            rs.addItem(elt);
        });
        rs.getValue = function () {
            return rs.data.map(function (elt) {
                return parseInt(elt.id, 10);
            });
        };
        return rs;
    }
    var functionClickMore = function (event, me, index, data, row) {
        contactTable.dropRow(index);
        selectList.push(row[0].value);
        contactSelect.addItem(row[0].value);
    };
    if (task == 'contact') {
        contactSelect = selectContactFunc('contact');
        contactTable = theme.cardContactTable(contact, contactOfCard, changeFunc, database);
    }
    else {
        contactSelect = selectContactFunc('company');
        contactTable = theme.cardCompanyTable(contact, contactOfCard, changeFunc, database);
    }
    var inputsearchbox = absol.buildDom({
        tag: 'searchcrosstextinput',
        style: {
            width: "var(--searchbox-width)",
            verticalAlign: "middle",
            display: "inline-block"
        },
        props: {
            placeholder: LanguageModule.text("txt_search")
        }
    });
    var filter_container = absol._({
        style: {
            paddingBottom: "10px"
        }
    });
    if (task == "company") {
        var contactList = database.company_class.items.map(function (elt) {
            return { value: elt.name + "_" + elt.id, text: elt.name };
        });
        contactList.sort(function (a, b) {
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        contactList.unshift({ value: "empty", text: LanguageModule.text("txt_empty") });
        contactList.unshift({ value: 0, text: LanguageModule.text("txt_all") });
        var class_combobox = absol._({
            tag: "mselectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: contactList
            }
        });
        var cityList = database.cities.items.map(function (elt) {
            return {
                value: elt.name + "_" + elt.id,
                text: elt.name
            };
        });
        cityList.sort(function (a, b) {
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        cityList.unshift({ value: "empty", text: LanguageModule.text("txt_empty") });
        cityList.unshift({ value: 0, text: LanguageModule.text("txt_all") });
        var city_combobox = absol._({
            tag: "mselectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: cityList,
                enableSearch: true
            },
            on: {
                change: function () {
                    var list = [];
                    database.districts.items.forEach(function (elt) {
                        if (city_combobox.value == 0) {
                            list.push({
                                value: elt.name + "_" + elt.id,
                                text: elt.name
                            });
                        }
                        else if (city_combobox.value != "empty") {
                            if ((database.cities.items[database.cities.getIndex(elt.cityid)].name + "_" + elt.cityid) == city_combobox.value) {
                                list.push({
                                    value: elt.name + "_" + elt.id,
                                    text: elt.name
                                });
                            }
                        }
                    });
                    list.sort(function (a, b) {
                        if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
                        if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
                        return 0;
                    });
                    if (city_combobox.value != "empty") {
                        list.unshift({ value: "empty", text: LanguageModule.text("txt_empty") });
                        list.unshift({ value: 0, text: LanguageModule.text("txt_all") });
                    }
                    district_combobox.items = list;
                }
            }
        });
        var districtList = database.districts.items.map(function (elt) {
            return {
                value: elt.name + "_" + elt.id,
                text: elt.name
            };
        });
        districtList.sort(function (a, b) {
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        districtList.unshift({ value: "empty", text: LanguageModule.text("txt_empty") });
        districtList.unshift({ value: 0, text: LanguageModule.text("txt_all") });
        var district_combobox = absol._({
            tag: "mselectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: districtList,
                enableSearch: true
            }
        });
        contactTable.addFilter(class_combobox, 1);
        contactTable.addFilter(city_combobox, 3);
        contactTable.addFilter(district_combobox, 2);
        var filterFunc = function () {
            class_combobox.style.display = "block";
            class_combobox.style.width = "100%";
            city_combobox.style.display = "block";
            city_combobox.style.width = "100%";
            district_combobox.style.display = "block";
            district_combobox.style.width = "100%";
            theme.modalFormMobile({
                bodycontent: absol._({
                    child: [
                        {
                            class: "card-mobile-label-form-edit-first",
                            child: { text: LanguageModule.text("txt_company_class") }
                        },
                        class_combobox,
                        {
                            class: "card-mobile-label-form-edit",
                            child: { text: LanguageModule.text("txt_city") }
                        },
                        city_combobox,
                        {
                            class: "card-mobile-label-form-edit",
                            child: { text: LanguageModule.text("txt_district") }
                        },
                        district_combobox
                    ]
                })
            });
        };
    }
    else {
        var companyList = database.companies.items.map(function (elt) {
            return {
                value: elt.name + "_" + elt.id,
                text: elt.name
            };
        });
        companyList.sort(function (a, b) {
            if (absol.string.nonAccentVietnamese(a.text) > absol.string.nonAccentVietnamese(b.text)) return 1;
            if (absol.string.nonAccentVietnamese(a.text) < absol.string.nonAccentVietnamese(b.text)) return -1;
            return 0;
        });
        companyList.unshift({ value: "empty", text: LanguageModule.text("txt_empty") });
        companyList.unshift({ value: 0, text: LanguageModule.text("txt_all") });
        var company_combobox = absol._({
            tag: "mselectmenu",
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
                    child: { text: LanguageModule.text('txt_company') },
                    style: {
                        paddingRight: "10px"
                    }
                },
                company_combobox
            ]
        }));
        contactTable.addFilter(company_combobox, 3);
        var filterFunc = function () {
            company_combobox.style.display = "block";
            company_combobox.style.width = "100%";
            theme.modalFormMobile({
                bodycontent: absol._({
                    child: [
                        {
                            class: "card-mobile-label-form-edit-first",
                            child: { text: LanguageModule.text("txt_company") }
                        },
                        company_combobox
                    ]
                })
            });
        };
    }
    contactTable.addInputSearch(inputsearchbox);
    contactTable.style.width = "100%";
    contactTable.style.height = "100%";
    contactTable.headerTable.style.display = "none";
    var header = absol.buildDom({
        tag: 'headerbarwithsearch',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: (task == "company") ? LanguageModule.text("txt_select_company") : LanguageModule.text("txt_select_contact"),
            commands: [
                {
                    icon: DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "filter_alt"
                    }),
                    cmd: function () {
                        filterFunc();
                    }
                },
                {
                    icon: DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "search"
                    }),
                    cmd: function () {
                        header.searchMode(true);
                    }
                }
            ]
        },
        data: {
            searchInput: inputsearchbox
        },
        on: {
            action: function () {
                callbackFunc(contactSelect.getValue());
                frameList.removeLast();
            },
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });
    contactTable.style.paddingRight = "20px";
    var tabFrame = absol.buildDom({
        tag: 'tabframe',
        child: [
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
                            margin: "20px 20px 0",
                            overflowX: "auto"
                        },
                        child: contactSelect
                    },
                    {
                        style: {
                            overflowY: "auto",
                            height: "calc(100% - 20px)",
                            paddingLeft: "20px"
                        },
                        child: contactTable
                    }
                ]
            })
        ]
    });
    frameList.addChild(tabFrame);
    tabFrame.requestActive();
    ModalElement.close(-1);
};

theme.cardSwipeSetup = function (table, deleteFunc) {
    table.setUpSwipe(
        undefined,
        [
            {
                icon: "close",
                iconStyle: { color: "white" },
                text: LanguageModule.text("txt_delete"),
                background: "red",
                event: deleteFunc
            }
        ]
    );
    table.swipeCompleteLeft = deleteFunc;
};

theme.cardCompanyView = function (content, editMode, frameList, database) {
    var contactDB;
    contactDB = database.companies;
    var st = absol._({
        class: "card-contact-company-container"
    });
    var returnData = absol._({
        child: [
            {
                class: "card-mobile-label-form-edit",
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: { text: LanguageModule.text("txt_company") }
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: (!editMode) ? "" : "none"
                            },
                            child: {
                                tag: "a",
                                style: {
                                    paddingLeft: "20px",
                                    color: "var(--a-color)",
                                    cursor: "pointer",
                                    textDecoration: "underline"
                                },
                                child: { text: "+ " + LanguageModule.text("txt_add") },
                                on: {
                                    click: function () {
                                        ModalElement.show_loading();
                                        setTimeout(function () {
                                            theme.cardSelectContactForm(returnData.companyData, 'company', function (data) {
                                                returnData.companyData = returnData.companyData.concat(data);
                                                st.generateData(returnData.companyData);
                                            }, frameList, database);
                                        }, 100);
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            st
        ]
    });
    returnData.companyData = content;
    var deleteFunc = function (table) {
        return function (e, me, index, data, row, parent) {
            if (editMode) {
                ModalElement.alert({
                    message: LanguageModule.text("war_can_not_delete_this_company"),
                    func: function () {
                        table.slip.animateToZeroHidden();
                    }
                });
                return;
            }
            for (var i = 0; i < returnData.companyData.length; i++) {
                if (returnData.companyData[i] == data[0].value) {
                    returnData.companyData.splice(i, 1);
                    break;
                }
            }
            table.exactlyDeleteRow(index);
        };
    }
    st.generateData = function (content) {
        st.clearChild();
        var data = [], items;
        content.forEach(function (elt) {
            var index = contactDB.getIndex(elt);
            if (index < 0) return;
            var name;
            var company_className;
            if (contactDB.items[index].company_classid == 0) {
                company_className = "";
            }
            else {
                var company_classIndex = database.company_class.getIndex(contactDB.items[index].company_classid);
                company_className = database.company_class.items[company_classIndex].name;
            }
            name = contactDB.items[index].name + " - " + company_className;
            items = [{ value: elt }, {
                element: absol._({
                    class: "sortTable-cell-view",
                    child: { text: name }
                })
            }];
            data.push(items);
        });
        var companyTable = pizo.tableView([{ hidden: true }, {}], data, true, true);
        companyTable.addClass("stageTable");
        companyTable.headerTable.style.display = "none";
        companyTable.style.width = "100%";
        if (!editMode) theme.cardSwipeSetup(companyTable, deleteFunc(companyTable));
        st.addChild(companyTable);
    }
    st.generateData(returnData.companyData);
    return returnData;
}

theme.cardContactView = function (content, editMode, frameList, database) {
    var contactDB;
    contactDB = database.contacts;
    var st = absol._({
        class: "card-contact-company-container"
    });
    var returnData = absol._({
        child: [
            {
                class: "card-mobile-label-form-edit",
                child: [
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            tag: "span",
                            child: { text: LanguageModule.text("txt_contact") }
                        }
                    },
                    {
                        style: {
                            display: "inline-block"
                        },
                        child: {
                            style: {
                                paddingLeft: '10px',
                                display: !editMode ? "" : "none"
                            },
                            child: {
                                tag: "a",
                                style: {
                                    paddingLeft: "20px",
                                    color: "var(--a-color)",
                                    cursor: "pointer",
                                    textDecoration: "underline"
                                },
                                child: { text: "+ " + LanguageModule.text("txt_add") },
                                on: {
                                    click: function () {
                                        ModalElement.show_loading();
                                        setTimeout(function () {
                                            theme.cardSelectContactForm(returnData.contactData, 'contact', function (data) {
                                                returnData.contactData = returnData.contactData.concat(data);
                                                st.generateData(returnData.contactData);
                                            }, frameList, database);
                                        }, 100);
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            st
        ]
    });
    returnData.contactData = content;
    var deleteFunc = function (table) {
        return function (e, me, index, data, row, parent) {
            if (editMode) {
                ModalElement.alert({
                    message: LanguageModule.text("war_can_not_delete_this_company"),
                    func: function () {
                        table.slip.animateToZeroHidden();
                    }
                });
                return;
            }
            for (var i = 0; i < returnData.contactData.length; i++) {
                if (returnData.contactData[i] == data[0].value) {
                    returnData.contactData.splice(i, 1);
                    break;
                }
            }
            table.exactlyDeleteRow(index);
        };
    }
    st.generateData = function (content) {
        st.clearChild();
        var data = [], items;
        content.forEach(function (elt) {
            var index = contactDB.getIndex(elt);
            if (index < 0) return;
            var name;
            name = contactDB.items[index].firstname + " " + contactDB.items[index].lastname + " - " + contactDB.items[index].phone + " - " + contactDB.items[index].email;
            items = [{ value: elt }, {
                element: absol._({
                    class: "sortTable-cell-view",
                    child: { text: name }
                })
            }];
            data.push(items)
        });
        var contactTable = pizo.tableView([{ hidden: true }, {}], data, true, true);
        contactTable.addClass("stageTable");
        contactTable.headerTable.style.display = "none";
        contactTable.style.width = "100%";
        if (!editMode) theme.cardSwipeSetup(contactTable, deleteFunc(contactTable));
        st.addChild(contactTable);
    };
    st.generateData(returnData.contactData);
    return returnData;
}

theme.cardActivityIconButton = function (src, text, maxWidth, click, disabled) {
    var picture = absol._({
        tag: "img",
        style: {
            width: "52px",
            height: "40px"
        },
        props: {
            src: src,
            alt: text
        }
    });
    var st = absol._({
        style: {
            width: maxWidth + "px"
        },
        class: disabled ? "card-activities-icon-button-disabled-cover" : "card-activities-icon-button-cover",
        child: [
            {
                child: picture
            },
            {
                style: {
                    paddingTop: "10px"
                },
                child: { text: "+ " + text }
            }
        ],
        on: { click: click }
    });
    st.picture = picture;
    return st;
};

theme.cardActivityFilterButton = function (filterInfo) {
    var st = absol._({});
    filterInfo.forEach(function (elt, index) {
        var tempText = DOMElement.span({ text: elt.text });
        DOMElement.hiddendiv.appendChild(tempText);
        var maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
        var filterElt = absol._({
            class: "card-activities-filter-button-cover",
            child: [
                {
                    class: ['card-activities-filter-button-text'],
                    child: { text: elt.text },
                    on: {
                        click: function () {
                            absol.$('.choice', st, function (elt) {
                                elt.removeClass("choice");
                            });
                            absol.$('.card-activities-filter-button-text', filterElt).addClass('choice');
                            absol.$('.card-activities-filter-button-sidebar', filterElt).addClass('choice');
                            elt.func();
                        },
                        mouseover: function () {
                            absol.$('.card-activities-filter-button-sidebar', filterElt).addStyle('background-color', '#06df95');
                        },
                        mouseout: function () {
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
        if (index == 0) {
            absol.$('.card-activities-filter-button-text', filterElt).addClass('choice');
            absol.$('.card-activities-filter-button-sidebar', filterElt).addClass('choice');
        }
        filterElt.addTo(st);
    });

    return st;
};

theme.cardEditForm = function (params) {
    var name, object, objectContent, oIndex, value, stage, important, createdtime, username, contactList, companyList, displayActivities, owner;
    var buttons, name_block, container, filter_block, activities_block, task_manager_block, contact_block;
    var iconArray = [];
    var data = [];
    buttons = [];
    var removeCardElt = function (value) {
        if (value) {
            absol.$(".cd-list-board", params.frameList, function (elt) {
                if (elt.ident == params.stage) {
                    var cards = elt.$body.getAllBoards();
                    for (var i = 0; i < cards.length; i++) {
                        if (cards[i].ident == params.cardid) {
                            cards[i].selfRemove();
                            break;
                        }
                    }
                    elt.title = elt.listName + " (" + elt.$body.getAllBoards().length + ")";
                }
            });
            params.frameList.removeLast();
        }
    }
    var props = {
        actionIcon: DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "arrow_back_ios"
        }),
        title: params.boardName,
        commands: commands
    };
    var commands;
    if (params.editMode == "edit" && params.viewMode == "current") {
        commands = [
            {
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "save"
                }),
                cmd: function(){
                    params.cmdButton.save().then(function(value){
                        absol.$(".cd-list-board", params.frameList, function (elt) {
                            if (value.task == "edit"){
                                if (value.oldParentid == value.listid){
                                    if (elt.ident == value.oldParentid) {
                                        var cards = elt.$body.getAllBoards();
                                        for (var i = 0; i < cards.length; i++) {
                                            cards[i].selfRemove();
                                        }
                                        for (var i = 0; i < elt.cards.length; i++){
                                            if (elt.cards[i].id == value.cardid){
                                                elt.cards[i] = value.content;
                                                break;
                                            }
                                        }
                                        var count = 0;
                                        elt.cards.forEach(function (item) {
                                            var card = elt.makeCardElt(item, elt);
                                            if (card) {
                                                elt.addCard(card);
                                                count++;
                                            }
                                        });
                                        elt.title = elt.listName + " (" + count + ")";
                                    }
                                }
                                else {
                                    if (elt.ident == value.oldParentid) {
                                        var cards = elt.$body.getAllBoards();
                                        for (var i = 0; i < cards.length; i++) {
                                            if (cards[i].ident == value.cardid) {
                                                cards[i].selfRemove();
                                                break;
                                            }
                                        }
                                        for (var i = 0; i < elt.cards.length; i++){
                                            if (elt.cards[i].id == value.cardid){
                                                elt.cards.splice(i, 1);
                                                break;
                                            }
                                        }
                                        elt.title = elt.listName + " (" + elt.$body.getAllBoards().length + ")";
                                    }
                                    if (elt.ident == value.content.parentid) {
                                        var cards = elt.$body.getAllBoards();
                                        for (var i = 0; i < cards.length; i++) {
                                            cards[i].selfRemove();
                                        }
                                        elt.cards.push(value.content);
                                        elt.cards.sort(function(a, b){
                                            if (a.lindex > b.lindex) return -1;
                                            if (a.lindex < b.lindex) return 1;
                                            return 0;
                                        });
                                        var count = 0;
                                        elt.cards.forEach(function (item) {
                                            var card = elt.makeCardElt(item, elt);
                                            if (card) {
                                                elt.addCard(card);
                                                count++;
                                            }
                                        });
                                        elt.title = elt.listName + " (" + count + ")";
                                    }
                                }
                            }
                            else {
                                if (elt.ident == value.content.parentid) {
                                    var cards = elt.$body.getAllBoards();
                                    for (var i = 0; i < cards.length; i++) {
                                        cards[i].selfRemove();
                                    }
                                    elt.cards.push(value.content);
                                    elt.cards.sort(function(a, b){
                                        if (a.lindex > b.lindex) return -1;
                                        if (a.lindex < b.lindex) return 1;
                                        return 0;
                                    });
                                    var count = 0;
                                    elt.cards.forEach(function (item) {
                                        var card = elt.makeCardElt(item, elt);
                                        if (card) {
                                            elt.addCard(card);
                                            count++;
                                        }
                                    });
                                    elt.title = elt.listName + " (" + count + ")";
                                }
                            }
                        });
                    });
                }
            }
        ];
        props.commands = commands;
        if (params.cardid > 0) {
            props.quickmenu = {
                getMenuProps: function () {
                    return {
                        items: [
                            {
                                text: LanguageModule.text("txt_task"),
                                cmd: function () {
                                    params.editActivitiesFunc.editTaskFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_meeting"),
                                cmd: function () {
                                    params.editActivitiesFunc.editMeetingFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_call"),
                                cmd: function () {
                                    params.editActivitiesFunc.editCallFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_check_list"),
                                cmd: function () {
                                    params.editActivitiesFunc.editCheckListFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_file"),
                                cmd: function () {
                                    params.editActivitiesFunc.editFileFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_chat"),
                                cmd: function () {
                                    params.editActivitiesFunc.editChatFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_wait"),
                                cmd: function () {
                                    params.editActivitiesFunc.editWaitFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_field"),
                                cmd: function () {
                                    params.editActivitiesFunc.editFieldFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_note"),
                                cmd: function () {
                                    params.editActivitiesFunc.editNoteFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_send_mail"),
                                cmd: function () {
                                    params.editActivitiesFunc.editMailFunc(params.cardid, 0);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_move"),
                                cmd: function () {
                                    params.cmdButton.move().then(removeCardElt);
                                }
                            },
                            {
                                text: LanguageModule.text("txt_archive_card"),
                                cmd: function () {
                                    var title = LanguageModule.text("txt_archive_card");
                                    var message = LanguageModule.text("war_archive_card");
                                    ModalElement.question({
                                        title: title,
                                        message: message,
                                        onclick: function(sel){
                                            if (sel == 0){
                                                params.cmdButton.archive().then(removeCardElt);
                                            }
                                        }
                                    });
                                }
                            },
                            {
                                text: LanguageModule.text("txt_delete_card"),
                                cmd: function () {
                                    var title = LanguageModule.text("txt_delete_card");
                                    var message = LanguageModule.text("war_delete_card");
                                    ModalElement.question({
                                        title: title,
                                        message: message,
                                        onclick: function(sel){
                                            if (sel == 0){
                                                params.cmdButton.delete().then(removeCardElt);
                                            }
                                        }
                                    });
                                }
                            }
                        ]
                    }
                },
                onSelect: function (item) {
                    item.cmd();
                }
            };
        }
    }
    else {
        if (params.viewMode == "archived" && params.archived == 0 && params.editMode == "edit") {
            commands = [
                {
                    icon: DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "restore"
                    }),
                    cmd: function(){
                        var title = LanguageModule.text("txt_restore_card");
                        var message = LanguageModule.text("war_restore_card");
                        ModalElement.question({
                            title: title,
                            message: message,
                            onclick: function(sel){
                                if (sel == 0){
                                    params.cmdButton.restore().then(removeCardElt);
                                }
                            }
                        });
                    }
                },
                {
                    icon: DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "delete"
                    }),
                    cmd: function(){
                        var title = LanguageModule.text("txt_delete_card");
                        var message = LanguageModule.text("war_delete_card");
                        ModalElement.question({
                            title: title,
                            message: message,
                            onclick: function(sel){
                                if (sel == 0){
                                    params.cmdButton.delete().then(removeCardElt);
                                }
                            }
                        });
                    }
                }
            ];
            props.commands = commands;
        }
    }

    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: props,
        on: {
            action: params.cmdButton.close,
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });

    var v_disabled = params.viewMode == "archived" || params.editMode == "view";

    name = absol._({
        tag: "input",
        class: "cardsimpleInput",
        style: { width: "100%" },
        props: {
            type: "text",
            value: params.name,
            disabled: v_disabled
        }
    });

    stage = absol._({
        tag: "mselectmenu",
        style: {
            display: "block"
        },
        props: {
            items: params.lists,
            value: params.stage,
            disabled: v_disabled
        }
    });

    owner = absol._({
        tag: "mselectmenu",
        style: {
            display: "block"
        },
        props: {
            items: params.list_member,
            value: params.owner,
            enableSearch: true,
            disabled: v_disabled
        }
    });

    var buttonInfo = params.activities;

    var maxWidth = 0;

    for (var i = 0; i < buttonInfo.length; i++) {
        var tempText = DOMElement.span({ text: buttonInfo[i].text });
        DOMElement.hiddendiv.appendChild(tempText);
        if (maxWidth < tempText.offsetWidth) maxWidth = tempText.offsetWidth;
        DOMElement.hiddendiv.removeChild(tempText);
    }
    maxWidth += 20;

    important = absol._({
        tag: "mselectmenu",
        style: {
            width: "100%",
            display: "block"
        },
        props: {
            items: [
                { value: 0, text: "-----------" },
                { value: 1, text: LanguageModule.text("txt_very_important") },
                { value: 2, text: LanguageModule.text("txt_low_important") }
            ],
            value: params.important.value,
            disabled: v_disabled
        }
    });

    var email_groups = absol._({
        tag: "mselectbox",
        style: {
            display: "block"
        },
        props: {
            enableSearch: true,
            items: params.board_email_groups,
            values: params.email_groups.value,
            disabled: v_disabled
        }
    });
    var t_disabled = (params.editMode == 'view' || params.cardid == 0 || params.viewMode == "archived");
    var attention = absol._({
        tag: "switch",
        style: {
            'font-size': 'var(--switch-fontsize)'
        },
        props: {
            checked: params.attention.value,
            disabled: v_disabled
        }
    });

    var knowledge = absol.buildDom({
        tag: "checkboxinput",
        props: {
            checked: params.knowledge.value,
            disabled: t_disabled
        },
        on: {
            change: function (event) {
                var self = this;
                if (this.checked) {
                    if (params.knowledge.id == 0) {
                        params.knowledge.cmd().then(function (value) {
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

    var company_block = theme.cardCompanyView(params.companyOfCard, v_disabled, params.frameList, {companies: params.companies, contacts: params.contacts, company_class: params.company_class, cities: params.cities, districts: params.districts, nations: params.nations});

    contact_block = theme.cardContactView(params.contactOfCard, v_disabled, params.frameList, {companies: params.companies, contacts: params.contacts, company_class: params.company_class, cities: params.cities, districts: params.districts});

    activities_block = absol._({
        class: "card-activities-block",
        style: {
            marginTop: "20px",
            height: "100%",
            position: "relative"
        }
    });

    var activities_data_structure = {};

    displayActivities = function (value) {
        theme.generateActivitiesData(
            activities_block,
            params.activitiesOfCard,
            {
                objects: params.objects,
                typelists: params.typelists,
                values: params.values
            },
            params.editActivitiesFunc,
            params.cardid,
            systemconfig.userid,
            params.getObjectbyType,
            activities_data_structure,
            params.allFiles,
            params.imagesList,
            params.chat_content,
            value
        );
    };

    if (params.cardid != 0) displayActivities("activities");

    container = absol._({
        child: [
            name,
            company_block,
            contact_block,
            {
                class: "card-mobile-label-form-edit",
                child: { text: LanguageModule.text("txt_stage") }
            },
            stage,
            {
                class: "card-mobile-label-form-edit",
                child: { text: params.important.title }
            },
            important,
            {
                class: "card-mobile-label-form-edit",
                child: { text: LanguageModule.text("txt_assigned_to") }
            },
            owner,
            {
                class: "card-mobile-label-form-edit",
                child: { text: params.email_groups.title }
            },
            email_groups,
            {
                class: "card-mobile-label-form-edit",
                style: {
                    position: "relative",
                    textAlign: "right"
                },
                child: [
                    {
                        style: {
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: '100%'
                        },
                        child: [
                            {
                                style: {
                                    height: "100%",
                                    display: 'inline-block',
                                    'vertical-align': 'middle'
                                }
                            },
                            {
                                style: {
                                    display: 'inline-block',
                                    'vertical-align': 'middle'
                                },
                                child: { text: params.knowledge.title }
                            }
                        ]
                    },
                    {
                        child: [
                            knowledge,
                            {
                                class: (t_disabled) ? "card-icon-cover-disabled" : "card-icon-cover",
                                style: {
                                    marginLeft: "var(--control-horizontal-distance-1)",
                                    verticalAlign: "middle"
                                },
                                child: {
                                    tag: "i",
                                    class: ["material-icons", "bsc-icon-hover-black"],
                                    child: { text: "create" }

                                },
                                on: {
                                    click: function () {
                                        if (t_disabled) return;
                                        params.knowledge.cmd();
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                class: "card-mobile-label-form-edit",
                style: {
                    position: "relative",
                    textAlign: "right"
                },
                child: [
                    {
                        style: {
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: '100%'
                        },
                        child: [
                            {
                                style: {
                                    display: 'inline-block',
                                    'vertical-align': 'middle'
                                },
                                child: { text: params.attention.title }
                            }
                        ]
                    },
                    {
                        child: [
                            attention
                        ]
                    }
                ]
            },
            {
                class: "card-mobile-label-form-edit",
                style: {
                    position: "relative"
                },
                child: [
                    {
                        style: {
                            left: 0
                        },
                        child: { text: params.createdtime.title }
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
            },
            {
                style: {
                    position: "relative"
                },
                class: "card-mobile-label-form-edit",
                child: [
                    {
                        style: {
                            left: 0
                        },
                        child: { text: params.username.title }
                    },
                    {
                        style: {
                            position: "absolute",
                            right: 0,
                            top: 0
                        },
                        child: { text: username }
                    }
                ]
            },
            activities_block
        ]
    });
    var returnData = absol.buildDom({
        tag: 'tabframe',
        child: [
            header,
            {
                class: "card-mobile-content",
                child: container
            }
        ]
    });
    returnData.getValue = function () {
        var nameValue = name.value.trim();
        if (nameValue == "") {
            ModalElement.alert({ message: LanguageModule.text("war_no_name") });
            return false;
        }
        return {
            name: nameValue,
            stage: stage.value,
            important: important.value,
            owner: owner.value,
            contact: contact_block.contactData,
            companies: company_block.companyData,
            knowledge: knowledge.checked ? 1 : 0,
            email_groups: email_groups.values,
            attention: attention.checked? 1: 0
        };
    }
    return returnData;
};

theme.moveCard = function (content, frameList) {
    return new Promise(function (rs) {
        var boards, lists, listItems;
        boards = absol._({
            tag: "mselectmenu",
            style: {
                width: "100%"
            },
            props: {
                items: content,
                enableSearch: true
            },
            on: {
                change: function () {
                    for (var i = 0; i < content.length; i++) {
                        if (content[i].value == boards.value) listItems = content[i].lists;
                    }
                    lists.items = listItems;
                    lists.value = listItems[0].value;
                }
            }
        });
        for (var i = 0; i < content.length; i++) {
            if (content[i].value == boards.value) listItems = content[i].lists;
        }
        lists = absol._({
            tag: "mselectmenu",
            style: {
                width: "100%"
            },
            props: {
                items: listItems
            }
        });
        var data = [
            {
                class: "card-mobile-label-form-edit-first",
                child: { text: LanguageModule.text("txt_board") }
            },
            boards,
            {
                class: "card-mobile-label-form-edit",
                child: { text: LanguageModule.text("txt_list") }
            },
            lists
        ];
        var commands = [
            {
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "save"
                }),
                cmd: function () {
                    rs({
                        boardid: parseInt(boards.value, 10),
                        listid: parseInt(lists.value, 10)
                    });
                }
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
                title: LanguageModule.text("txt_choose_destination"),
                commands: commands
            },
            on: {
                action: function () {
                    frameList.removeLast();
                },
                command: function (event) {
                    event.commandItem.cmd();
                }
            }
        });
        var returnData = absol.buildDom({
            tag: "tabframe",
            child: [
                header,
                {
                    class: "card-mobile-content",
                    child: data
                }
            ]
        });
        frameList.addChild(returnData);
        returnData.requestActive();
    });
}

theme.drawCardContent = function (content, cardid, userid, companies, contacts, companyDict, contactDict) {
    var username = data_module.users.items[data_module.users.getByhomeid(userid)].username;
    content.clearChild();
    var str = "";
    contacts.forEach(function(elt){
        if (!contactDict[elt]) return;
        if (str != "") str += ", ";
        str += contactDict[elt].firstname + " " + contactDict[elt].lastname;
    });
    companies.forEach(function(elt){
        if (!companyDict[elt]) return;
        if (str != "") str += ", ";
        str += companyDict[elt].name;
    });
    if (str.length > 150) str = str.substr(0, 150);
    content.addChild(absol._({child: {text: str}}));
    content.addChild(absol._({style: {textAlign: "right"}, child: {text: username}}));
};

theme.cardContentDataForm = function(params){
    var boardStyle = {
        width: "100%",
        height: "100%"
    };
    // if (params.decoration.selection == "color"){
    //     boardStyle.backgroundColor = "#" + params.decoration.color;
    // }
    // else {
    //     boardStyle.backgroundImage = window.domain + params.decoration.picture;
    // }
    var boarTableId = absol.string.randomIdent(20);
    var mBoardTable = absol._({
        tag: 'tlboardtable',
        style: boardStyle,
        id: boarTableId
    });
    var companyDict = {};
    params.companies.items.forEach(function (elt) {
        companyDict[elt.id] = elt;
    });
    var contactDict = {};
    params.contacts.items.forEach(function (elt) {
        contactDict[elt.id] = elt;
    });
    var listArray = [];
    var makeCardElt = function (elt, listElt) {
        if (params.userid == 0 || params.userid == elt.userid || params.userid == elt.owner) {
            // count++;
            var card = absol._({
                tag: 'taskcard',
                props: {
                    title: elt.name,
                    ident: elt.id
                },
                on: {
                    click: function (event) {
                        if (absol.EventEmitter.hitElement(this.$contextBtn, event)) return;
                        elt.editFunc();
                    }
                }
            });
            card.ident = elt.id;
            var content;
            content = absol._({
                style: {
                    fontSize: "12px"
                }
            });
            theme.drawCardContent(content, elt.id, elt.owner, elt.companies, elt.contacts, companyDict, contactDict);
            card.addChild(content);
            var items = [];
            if (elt.editMode == "edit") {
                if (elt.archived == 1) {
                    items = [
                        {
                            text: LanguageModule.text("txt_open"),
                            extendClasses: "bsc-quickmenu",
                            icon: {
                                tag: "i",
                                class: "material-icons",
                                child: {text: "mode_edit"}
                            },
                            cmd: elt.editFunc
                        }
                    ];
                    if (!params.isArchivedBoard) items.push({
                        text: LanguageModule.text("txt_restore"),
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: {text: "restore"}
                        },
                        task: "restore",
                        cmd: elt.restoreFunc
                    });
                    items.push({
                        text: LanguageModule.text("txt_delete"),
                        extendClasses: "bsc-quickmenu red",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: {text: "delete"}
                        },
                        cmd: elt.deleteFunc,
                        task: "delete"
                    });
                } else {
                    items = [
                        {
                            text: LanguageModule.text("txt_edit"),
                            extendClasses: "bsc-quickmenu",
                            icon: {
                                tag: "i",
                                class: "material-icons",
                                child: {text: "mode_edit"}
                            },
                            cmd: elt.editFunc
                        },
                        {
                            text: LanguageModule.text("txt_move"),
                            extendClasses: "bsc-quickmenu",
                            icon: {
                                tag: "i",
                                class: "material-icons",
                                child: {text: "open_with"}
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
                                child: {text: "turned_in_not"}
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
                                child: {text: "delete"}
                            },
                            cmd: elt.deleteFunc,
                            task: "delete"
                        }
                    ];
                }
            } else {
                if (params.isArchivedBoard) {
                    items = [
                        {
                            text: LanguageModule.text("txt_open"),
                            extendClasses: "bsc-quickmenu",
                            icon: {
                                tag: "i",
                                class: "material-icons",
                                child: {text: "mode_edit"}
                            },
                            cmd: elt.editFunc
                        }
                    ];
                    items.push({
                        text: LanguageModule.text("txt_delete"),
                        extendClasses: "bsc-quickmenu red",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: {text: "delete"}
                        },
                        cmd: elt.deleteFunc,
                        task: "delete"
                    });
                }
            }
            card._quickmenu = {
                props: {
                    extendClasses: 'cd-context-menu',
                    items: items
                },
                onSelect: function (item) {
                    var command = function () {
                        return new Promise(function (rs) {
                            item.cmd().then(function (card) {
                                return function (value) {
                                    if (value) {
                                        card.selfRemove();
                                        var x = listElt.$body.getAllBoards().length;
                                        listElt.title = listElt.listName + " (" + x + ")";
                                        rs(value);
                                    }
                                }
                            }(card));
                        })
                    }
                    if (item.task) {
                        var title, message;
                        switch (item.task) {
                            case "move":
                                command().then(function(value){
                                    if (listElt) {
                                        listElt.cards = listElt.cards.filter(function (item) {
                                            return item.id != value.cardid;
                                        });
                                        var dict = {};
                                        listElt.cards.forEach(function(elt){
                                            dict[elt.id] = elt;
                                        });
                                        value.cardDecreaseIndex.forEach(function(elt){
                                            if(dict[elt]) dict[elt].lindex--;
                                        });
                                    }
                                });
                                break;
                            case "delete":
                                title = LanguageModule.text("txt_delete_card");
                                message = LanguageModule.text("war_delete_card");
                                ModalElement.question({
                                    title: title,
                                    message: message,
                                    onclick: function(id){
                                        return function(sel){
                                            if (sel == 0){
                                                command().then(function(value){
                                                    if (listElt) {
                                                        listElt.cards = listElt.cards.filter(function (item) {
                                                            return item.id != id;
                                                        });
                                                        var dict = {};
                                                        listElt.cards.forEach(function(elt){
                                                            dict[elt.id] = elt;
                                                        });
                                                        value.cardDecreaseIndex.forEach(function(elt){
                                                            if(dict[elt]) dict[elt].lindex--;
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    }(elt.id)
                                });
                                break;
                            case "archive":
                                title = LanguageModule.text("txt_archive_card");
                                message = LanguageModule.text("war_archive_card");
                                ModalElement.question({
                                    title: title,
                                    message: message,
                                    onclick: function(id){
                                        return function(sel){
                                            if (sel == 0){
                                                command().then(function(value){
                                                    if (listElt) {
                                                        listElt.cards = listElt.cards.filter(function (item) {
                                                            return item.id != id;
                                                        });
                                                        var dict = {};
                                                        listElt.cards.forEach(function(elt){
                                                            dict[elt.id] = elt;
                                                        });
                                                        value.cardDecreaseIndex.forEach(function(elt){
                                                            if(dict[elt]) dict[elt].lindex--;
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    }(elt.id)
                                });
                                break;
                            case "restore":
                                title = LanguageModule.text("txt_restore_card");
                                message = LanguageModule.text("war_restore_card");
                                ModalElement.question({
                                    title: title,
                                    message: message,
                                    onclick: function(sel){
                                        if (sel == 0){
                                            command().then(function (content) {
                                                if (listElt) {
                                                    listElt.cards.unshift(content);
                                                }
                                            });
                                        }
                                    }
                                });
                                break;
                            default:

                        }
                    } else item.cmd();
                }
            };
            return card;
        }
        return false;
    };
    var list_container = {};
    params.content.forEach(function (item) {
        var listElt = absol._({
            tag: 'listboard',
            style: {
                'background-color': '#' + item.decoration.color
            },
            props: {
                title: item.name,
                ident: item.id
            },
            on: {
                presspluscard: function () {
                    item.addNewCardFunc()
                },
                cardenter: function(event){
                    item.cardenter(event).then(function(content){
                        var cards = content.from.table.parentNode.cards;
                        var dict = {};
                        if (cards){
                            for (var i = 0; i < cards.length; i++){
                                if (cards[i].id == content.cardid){
                                    cards.splice(i, 1);
                                }
                                else {
                                    dict[cards[i].id] = cards[i];
                                }
                            }
                        }
                        content.cardDecreaseIndex.forEach(function(elt){
                            if (dict[elt]) dict[elt].lindex--;
                        });
                        cards = content.to.table.parentNode.cards;
                        dict = {};
                        if (cards){
                            for (var i = 0; i < cards.length; i++){
                                dict[cards[i].id] = cards[i];
                            }
                        }
                        content.cardIncreaseIndex.forEach(function(elt){
                            if (dict[elt]) dict[elt].lindex++;
                        });
                        cards.splice((cards.length - content.lindex), 0, content.cardContent);
                    });
                },
                orderchange: function(event){
                    item.orderchange(event).then(function(content){
                        var cards = content.body.parentNode.cards;
                        var dict = {};
                        var x;
                        if (cards){
                            for (var i = 0; i < cards.length; i++){
                                if (cards[i].id == content.cardid){
                                    x = cards[i];
                                    cards.splice(i, 1);
                                    i--;
                                }
                                else {
                                    dict[cards[i].id] = cards[i];
                                }
                            }
                        }
                        x.lindex = content.lindex;
                        cards.splice((cards.length - content.lindex), 0, x);
                        content.cardDecreaseIndex.forEach(function(elt){
                            if (dict[elt]) dict[elt].lindex--;
                        });
                        content.cardIncreaseIndex.forEach(function(elt){
                            if (dict[elt]) dict[elt].lindex++;
                        });
                    });
                }
            }
        });
        listElt.makeCardElt = makeCardElt;
        listElt.$body.friends = '#' + boarTableId + " boardtable.cd-list-board-body";
        listElt.hiddenPlusBtn = function () {
            // var btn = absol.$(".cd-list-board-plus-card-ctn", listElt);
            var btn = listElt.$addItemBtn.parentNode;
            btn.style.display = "none";
        };
        if (params.isArchivedBoard || !params.addCardPriv) {
            listElt.hiddenPlusBtn();
        }
        listElt._quickmenu = {
            props: {
                extendClasses: 'cd-context-menu',
                items: params.isArchivedBoard ? [] : [
                    {
                        text: LanguageModule.text("txt_archive_all_card_in_this_list"),
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: {text: "turned_in_not"}
                        },
                        cmd: item.archiveAllCardInListFunc
                    }
                ]
            },
            onSelect: function (item) {
                var title, message;
                var command = function () {
                    item.cmd().then(function (value) {
                        if (value) {
                            var cards = listElt.$body.getAllBoards();
                            cards.forEach(function (elt) {
                                elt.selfRemove();
                            });
                            listElt.title = listElt.listName + " (0)";
                        }
                    });
                }
                title = LanguageModule.text("txt_archive_all_cards_in_this_list");
                message = LanguageModule.text("war_archive_all_cards_in_this_list");
                ModalElement.question({
                    title: title,
                    message: message,
                    onclick: function(sel){
                        if (sel == 0){
                            command();
                        }
                    }
                });
            }
        };
        listElt.ident = item.id;
        listElt.cards = item.cards;
        listElt.listName = item.name;
        listElt.addItemText = LanguageModule.text("txt_add_card");
        listElt.generateCardView = function () {
            var removeCard = this.$body.getAllBoards();
            removeCard.forEach(function (elt) {
                elt.selfRemove();
            });
            var count = 0;
            this.cards.forEach(function (elt) {
                var card = makeCardElt(elt, this);
                if (card) {
                    this.addCard(card);
                    count++;
                }
            }.bind(this));
            this.title = this.listName + " (" + count + ")";
        };
        listElt.generateCardView(params.userid);
        list_container[item.id] = listElt;
        if (params.isArchivedBoard || params.isArchivedCard == "archived") listElt.hiddenPlusBtn();
        mBoardTable.addItem(listElt);
    });

    var returnData = mBoardTable

    absol._('attachhook').addTo(returnData).on('attached', function(){
        absol.Dom.updateResizeSystem();
        this.remove();
    });/* update lại kích thước 1 lần sau khởi tạo  */

    return returnData;
};

theme.cardInitForm = function (params) {
    var userCombobox, commands;
    var viewArchived = false;
    userCombobox = absol._({
        tag: "selectmenu",
        props: {
            items: params.memberList,
            enableSearch: true,
            value: params.userid
        }
    });
    userCombobox.style.verticalAlign = "bottom";
    var filterFunc = function(){
        theme.modalFormMobile({
            bodycontent: absol._({
                child: [
                    {
                        class: "card-mobile-label-form-edit-first",
                        child: { text: LanguageModule.text("txt_assigned_to") }
                    },
                    userCombobox,
                    {
                        class: "card-mobile-label-form-edit",
                        style: {
                            display: params.isArchivedBoard ? "none" : ""
                        },
                        child: {
                            tag: "checkbox",
                            props: {
                                checked: viewArchived,
                                text: LanguageModule.text("txt_view_archived_cards")
                            },
                            on: {
                                change: function(){
                                    viewArchived = this.checked;
                                    if (viewArchived){
                                        params.cmdButton.viewArchived()
                                    }
                                    else {
                                        params.cmdButton.viewCurrent()
                                    }
                                }
                            }
                        }
                    }
                ]
            })
        });
    };
    commands = [
        {
            icon: DOMElement.i({
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
            action: function () {
                params.cmdButton.close();
            },
            command: function (event) {
                event.commandItem.cmd();
            }
        }
    });
    params.card_container.style.width = "100%";
    params.card_container.style.height = "100%";
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
                children: [params.card_container]
            })
        ]
    });
    returnData.viewArchived = function(){
        return new Promise(function(rs){
            ModalElement.show_loading();
            params.cmdButton.viewArchived().then(function(value){
                viewArchived = true;
            });
        });
    }

    returnData.userCombobox = userCombobox;

    return returnData;


};

ModuleManagerClass.register({
    name: "Cards_view",
    prerequisites: ["ModalElement"]
});
