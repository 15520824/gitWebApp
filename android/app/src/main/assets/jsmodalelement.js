var ModalElement = {
    alert_func : null,
    question_callback_func : null,
    singleInput_callback_func : null,
    multipleInput_n : 0,
    multipleInput_callback_func : null,
    fullInput_callback_func : null,
    attach_status: 0,
    align : {
            left: 0,
            right: 1,
            center: 2
    },

    isReady : function () {
        if (document.getElementById("myModal") != null) return true;
        return false;
    },

    update : function (params) {
        var i, s, x, lIndex = -1;;
        if (params.localData !== undefined) {
            params = {bodycontent: params};
        }
        if (params.index === undefined) {
            s = -2;
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].visible && (ModalElement.layerstatus[i].index > s)) {
                    lIndex = i;
                    s = ModalElement.layerstatus[i].index;
                }
            }
        }
        else {
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].index == params.index) {
                    lIndex = i;
                    break;
                }
            }
        }
        if (lIndex == -1) return;
        if (params.index >= 0) {
            s = document.getElementById('modal-body-content' + params.index);
        }
        else {
            s = document.getElementById('modal-body-content');
        }
        DOMElement.removeAllChildren(s);
        if (EncodingClass.type.isString(params.bodycontent)) {
            s.appendChild(DOMElement.div({
                attrs: {
                    className: ModalElement.css.modalbody
                },
                innerHTML: params.bodycontent
            }));
        }
        else {
            s.appendChild(DOMElement.div({
                attrs: {
                    className: ModalElement.css.modalbody
                },
                children: [params.bodycontent]
            }));
        }
    },

    showWindow : function (params) {
        var i, lIndex = -1, index, content, title, tdiv, closebutton, f, data, type, button, text, overflow;
        var hasclosebutton;
        if (params.closebutton !== undefined) {
            hasclosebutton = params.closebutton;
        }
        else {
            hasclosebutton = true;
        }
        if (params.localData !== undefined) {
            index = ModalElement.newlayer();
            title = "";
            content = params;
        }
        else {
            if (params.index === undefined) {
                index = ModalElement.newlayer();
            }
            else {
                index = params.index;
            }
            if (params.bodycontent === undefined) {
                content = DOMElement.div();
            }
            else {
                content = params.bodycontent;
            }
            if (params.title === undefined) {
                title = "";
            }
            else {
                title = params.title;
            }
        }
        for (i = 0; i < ModalElement.layerstatus.length; i++) {
            if (ModalElement.layerstatus[i].index == index) {
                lIndex = i;
                break;
            }
        }
        if (lIndex == -1) return;
        if (title == "") title = " ";
        if (params.overflow === undefined) {
            overflow = "auto";
        }
        else {
            overflow = params.overflow;
        }
        if (EncodingClass.type.isString(content)) {
            tdiv = DOMElement.div({
                attrs: {style: {
                    maxWidth: "90vw",
                    maxHeight: "calc(90vh - 160px)",
                    overflow: overflow
                }},
                innerHTML: content
            });
        }
        else {
            tdiv = DOMElement.div({
                attrs: {style: {
                    maxWidth: "90vw",
                    maxHeight: "calc(90vh - 160px)",
                    overflow: overflow
                }},
                children: [content]
            });
        }
        if (hasclosebutton) {
            closebutton = DOMElement.fabutton({
                class: "fa fa-times",
                size: 16,
                color: "black",
                color2: "red",
                attrs: {
                    style: {
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        border: "0"
                    },
                },
                onclick : function (index) {
                    return function (event) {
                        ModalElement.close(index);
                        DOMElement.cancelEvent(event);
                        return false;
                    }
                } (index),
            });
            f = closebutton.onmouseover;
            closebutton.onmouseover = function (me, func) {
                return function (event) {
                    me.style.backgroundColor = "rgba(0, 0, 0, 0.0625)";
                    func(event);
                }
            } (closebutton, f);
            f = closebutton.onmouseout;
            closebutton.onmouseout = function (me, func) {
                return function (event) {
                    me.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    func(event);
                }
            } (closebutton, f);
        }
        else {
            closebutton = DOMElement.div();
        }
        data = [
            [DOMElement.table({
                attrs: {
                    width: "100%"
                },
                data: [[
                    {
                        attrs: {
                            align: "left",
                            style: {
                                minWidth: "200px",
                                height: "34px",
                                color: "black",
                                font: "16px Helvetica, Arial, sans-serif",
                                fontWeight: "bold"
                            },
                        },
                        text: title
                    },
                    {
                        attrs: {align: "right"},
                        children: [closebutton]
                    }
                ]]
            })],
            [{attrs: {style: {height: "12px"}}}],
            [tdiv]
        ];
        if (params.buttonslist !== undefined) {
            data.push([{attrs: {style: {height: "20px"}}}]);
            tdiv = [];
            for (i = 0; i < params.buttonslist.length; i++) {
                if (i > 0) tdiv.push({attrs: {style: {width: "20px"}}});
                if (params.buttonslist[i].type === undefined) {
                    type = "default";
                }
                else {
                    type = params.buttonslist[i].type;
                }
                if (params.buttonslist[i].text !== undefined) {
                    text = params.buttonslist[i].text;
                }
                else {
                    text = "";
                }
                switch (type) {
                    case "link":
                        button = DOMElement.div({
                            attrs: {
                                className: DOMElement.treetableclass.noselect,
                                style: {
                                    paddingLeft: "15px",
                                    paddingRight: "15px",
                                    paddingTop: "5px",
                                    paddingBottom: "5px",
                                    whiteSpace: "nowrap",
                                    color: "#3f3fff",
                                    backgroundColor: "#ffffff",
                                    textAlign: "center",
                                    display: "block",
                                    minWidth: "128px",
                                    minHeight: "24px",
                                    cursor: "pointer",
                                }
                            },
                            text: text
                        });
                        button.onmouseover = function (me) {
                            return function (event) {
                                me.style.backgroundColor = "#efefef";
                                me.style.color = "#7f7fff";
                            }
                        } (button);
                        button.onmouseout = function (me) {
                            return function (event) {
                                me.style.backgroundColor = "#ffffff";
                                me.style.color = "#3f3fff";
                            }
                        } (button);
                        if (params.buttonslist[i].onclick !== undefined) {
                            button.onclick = params.buttonslist[i].onclick;
                        }
                        break;
                    case "button":
                        button = DOMElement.button({
                            attrs: {
                                type: "button",
                                style: {
                                    whiteSpace: "nowrap",
                                    minWidth: "128px",
                                    minHeight: "24px",
                                    cursor: "pointer",
                                }
                            },
                            text: text
                        });
                        if (params.buttonslist[i].class !== undefined) {
                            if (EncodingClass.type.isString(params.buttonslist[i].class)) {
                                button.className = DOMElement.treetableclass.noselect + " " + params.buttonslist[i].class;
                            }
                            else {
                                for (j = 0; j < params.buttonslist[i].class.length; j++) {
                                    button.classList.add(params.buttonslist[i].class[i]);
                                }
                                button.classList.add(DOMElement.treetableclass.noselect);
                            }
                        }
                        else {
                            button.className = DOMElement.treetableclass.noselect;
                        }
                        if (params.buttonslist[i].onclick !== undefined) {
                            button.onclick = function (f) {
                                return function (event) {
                                    f(event);
                                    DOMElement.cancelEvent(event);
                                    return false;
                                }
                            } (params.buttonslist[i].onclick);
                        }
                        else {
                            button.onclick = function (event) {
                                DOMElement.cancelEvent(event);
                                return false;
                            };
                        }
                        break;
                    case "class":
                    default:
                        button = DOMElement.input({
                            attrs: {
                                type: "submit",
                                value: text,
                                style: {
                                    whiteSpace: "nowrap",
                                    minWidth: "128px",
                                    minHeight: "24px",
                                    cursor: "pointer",
                                }
                            }
                        });
                        if (params.buttonslist[i].class !== undefined) {
                            if (EncodingClass.type.isString(params.buttonslist[i].class)) {
                                button.className = DOMElement.treetableclass.noselect + " " + params.buttonslist[i].class;
                            }
                            else {
                                for (j = 0; j < params.buttonslist[i].class.length; j++) {
                                    button.classList.add(params.buttonslist[i].class[i]);
                                }
                                button.classList.add(DOMElement.treetableclass.noselect);
                            }
                        }
                        else {
                            button.className = DOMElement.treetableclass.noselect;
                        }
                        if (params.buttonslist[i].onclick !== undefined) {
                            button.onclick = function (f) {
                                return function (event) {
                                    f(event);
                                    DOMElement.cancelEvent(event);
                                    return false;
                                }
                            } (params.buttonslist[i].onclick);
                        }
                        else {
                            button.onclick = function (event) {
                                DOMElement.cancelEvent(event);
                                return false;
                            };
                        }
                        break;
                }
                tdiv.push(button);
            }
            data.push([{
                attrs: {
                    align: "center",
                    style: {
                        height: "34px"
                    },
                },
                children: [DOMElement.table({
                    data: [tdiv]
                })]
            }]);
        }
        data.push([{attrs: {style: {height: "20px"}}}]);
        ModalElement.show({
            index: index,
            bodycontent: DOMElement.table({
                data: data
            }),
            overflow: overflow
        })
    },

    show : function (params) {
        var i, lIndex = -1;
        if (params.localData !== undefined) {
            params = {
                index : ModalElement.newlayer(),
                bodycontent: params
            }
        }
        if (params.index === undefined) params.index = ModalElement.newlayer();
        for (i = 0; i < ModalElement.layerstatus.length; i++) {
            if (ModalElement.layerstatus[i].index == params.index) {
                lIndex = i;
                break;
            }
        }
        if (lIndex == -1) return;
        ModalElement.layerstatus[lIndex].available = false;
        ModalElement.layerstatus[lIndex].visible = true;
        ModalElement.update({
            index: params.index,
            bodycontent: params.bodycontent
        });
        if (params.index >= 0) {
            document.getElementById('myModal' + params.index).style.display = "block";
            document.getElementById('myModal').style.display = "none";
        }
        else {
            document.getElementById('myModal').style.display = "block";
        }
        if (params.index >= 0) {
            if (params.overflow !== undefined) {
                document.getElementById("modal-body-content" + params.index).parentElement.style.overflow = params.overflow;
            }
            else {
                document.getElementById("modal-body-content" + params.index).parentElement.style.overflow = "auto";
            }
            setTimeout("document.getElementById('modal-body-content" + params.index + "').scrollTop = 0;", 50);
        }
        else {
            if (params.overflow !== undefined) {
                document.getElementById("modal-body-content").parentElement.style.overflow = params.overflow;
            }
            else {
                document.getElementById("modal-body-content").parentElement.style.overflow = "auto";
            }
            setTimeout("document.getElementById('modal-body-content').scrollTop = 0;", 50);
        }
    },

    currentContent : function (index) {
        var i;
        if (index === undefined) {
            index = -2;
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].visible && (ModalElement.layerstatus[i].index > index)) {
                    index = ModalElement.layerstatus[i].index;
                }
            }
            if (index == -2) return null;
        }
        if (index >= 0) {
            return document.getElementById('modal-body-content' + index);
        }
        else {
            return document.getElementById('modal-body-content');
        }
    },

    currentContentString : function (index) {
        var i;
        if (index === undefined) {
            index = -2;
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].visible && (ModalElement.layerstatus[i].index > index)) {
                    index = ModalElement.layerstatus[i].index;
                }
            }
            if (index == -2) return "";
        }
        return ModalElement.currentContent(index).innerHTML;
    },

    lockInput : function () {
        document.getElementById('myLockModal').style.display = "block";
    },

    unlockInput : function () {
        document.getElementById('myLockModal').style.display = "none";
    },
    show_loading : function () {
        ModalElement.show({
            index: -1,
            bodycontent: DOMElement.spinner.beads(),
            overflow: "visible"
        });
    },

    checkResult : function (callbackfunc) {
        return function (success, message) {
            var r;
            if (success) {
                if (message.substr(0, 2) == "ok") {
                    r = EncodingClass.string.toVariable(message.substr(2));
                    if (r.result) {
                        callbackfunc(r);
                    }
                    else {
                        ModalElement.alert(r.message);
                    }
                }
                else {
                    ModalElement.alert(message);
                }
            }
            else {
                ModalElement.alert(message);
            }
        }
    },

    alert : function (params) {
        var xa = {
            type: "submit",
            value: "Ok",
            style: {minWidth: "128px", minHeight: "24px"},
        };
        if (EncodingClass.type.isString(params)) params = {message: params};
        if (params.class !== undefined) xa.className = params.class;
        if (params.func === undefined) params.func = null;
        xa.onclick = function (func) {
            return function (event) {
                ModalElement.close(-1);
                if (func != null) func();
                DOMElement.cancelEvent(event);
                return false;
            }
        } (params.func);
        ModalElement.show({
            index: -1,
            bodycontent: DOMElement.table({
                data: [
                    [{
                        attrs: {
                            align: "center",
                            style: {height: "34px"}
                        },
                        text: params.message
                    }],
                    [{attrs: {style: {height: "20px"}}}],
                    [{
                        attrs: {
                            align: "center",
                            style: {height: "34px"}
                        },
                        children: [DOMElement.input({attrs: xa})]
                    }],
                ]
            })
        });
        return 0;
    },

    question : function (params) {
        var st;
        var i;
        var classname, text, title, message;

        if (params.message !== undefined) {
            message = params.message;
        }
        else {
            message = "";
        }
        if (params.title !== undefined) {
            title = params.title;
        }
        else {
            title = "Question";
        }
        if (params.choicelist.length > 0) {
            st = [];
            for (i = 0; i < params.choicelist.length; i++) {
                if (i > 0) st.push({attrs: {style: {width: "20px"}}});
                if (params.choicelist[i].class !== undefined) {
                    classname = params.choicelist[i].class;
                }
                else if (params.class !== undefined) {
                    classname = params.class;
                }
                else {
                    classname = undefined;
                }
                if (EncodingClass.type.isString(params.choicelist[i])) {
                    text = params.choicelist[i];
                }
                else if (params.choicelist[i].text !== undefined) {
                    text = params.choicelist[i].text;
                }
                else if (params.choicelist[i].caption !== undefined) {
                    text = params.choicelist[i].caption;
                }
                st.push({
                    attrs: {
                        className: DOMElement.treetableclass.noselect
                    },
                    children: [DOMElement.input({
                        attrs: {
                            type: "submit",
                            value: text,
                            className: classname,
                            style: {
                                minWidth: "128px",
                                minHeight: "24px"
                            },
                            onclick: function (func, index) {
                                return function (event) {
                                    ModalElement.close();
                                    DOMElement.cancelEvent(event);
                                    func(index);
                                    return false;
                                }
                            } (params.onclick, i)
                        }
                    })]
                });
            }
            st = DOMElement.table({data: [st]});
        }
        else {
            st = {
                attrs: {
                    className: DOMElement.treetableclass.noselect,
                    align: "center"
                },
                children: [DOMElement.input({
                    attrs: {
                        type: "submit",
                        value: "Close",
                        style: {
                            minWidth: "128px",
                            minHeight: "24px"
                        },
                        onclick: function (event) {
                            DOMElement.cancelEvent(event);
                            ModalElement.close();
                            return false;
                        }
                    }
                })]
            };
        }
        ModalElement.showWindow({
            title: title,
            bodycontent: DOMElement.table({data: [[{
                attrs: {
                    align: "center"
                },
                text: message
            }],
            [{attrs: {style: {height: "20px"}}}],
            [{attrs: {align: "center"}, children: [st]}]]})
        });
    },

    singleInput_submit : function () {
        ModalElement.singleInput_callback_func(document.getElementById('modal_singleInput_input').value);
        ModalElement.close(-1);
    },

    singleInput : function (params) {

        var st;
        var message, inputsize, defaultvalue, input;
        var qtable, okButton, cancelButton;
        if (params.message !== undefined) message = params.message; else message = "";
        if (params.inputsize !== undefined) inputsize = params.inputsize; else inputsize = 10;
        if (params.defaultvalue !== undefined) defaultvalue = params.defaultvalue; else defaultvalue = "";
        input = DOMElement.input({
            attrs: {
                size: inputsize,
                value: defaultvalue,
                align: "center"
            }
        });
        okButton = DOMElement.button({
            attrs: {
                type: "button",
                onclick: function (callbackfunc, input) {
                    return function (event, me) {
                        if (EncodingClass.type.isFunction(callbackfunc)) {
                            callbackfunc(input.value);
                        }
                        ModalElement.close();
                    }
                } (params.func, input)
            },
            text: "Ok"
        });
        if (params.class1 !== undefined) {
            okButton.className = params.class1;
        }
        else if (params.class !== undefined) {
            okButton.className = params.class;
        }
        cancelButton = DOMElement.button({
            attrs: {
                type: "button",
                onclick: function () {
                    return function (event, me) {
                        ModalElement.close();
                    }
                } ()
            },
            text: "Cancel"
        });
        if (params.class2 !== undefined) {
            cancelButton.className = params.class2;
        }
        else if (params.class1 !== undefined) {
            cancelButton.className = params.class1;
        }
        else if (params.class !== undefined) {
            cancelButton.className = params.class;
        }
        qtable = DOMElement.table({data: [
            [{attrs: {align: "center", style: {height: "34px"}}, text: message}],
            [{attrs: {align: "center", style: {height: "34px"}}, children: [input]}],
            [{attrs: {style: {height: "20px"}}}],
            [{attrs: {align: "center"}, children: [DOMElement.table({data: [[
                okButton, {attrs: {style: {width: "10px"}}}, cancelButton
            ]]})]}]
        ]});
        ModalElement.show(qtable);
    },

    prompt : function (params) {
        return ModalElement.singleInput(params);
    },

    modal_prompt : function (params) {
        return ModalElement.singleInput(params);
    },

    multipleInput_submit : function () {
        var retval = [];
        var i;
        for (i = 0; i < ModalElement.multipleInput_n; i++) {
            retval.push("" + document.getElementById('modal_multipleInput_' + i).value);
        }
        ModalElement.multipleInput_callback_func(retval);
        ModalElement.close(-1);
    },

    multipleInput : function (params) {
        var st, sx;
        var i;
        // message, params.inputlist, inputsize, func
        if (params.inputsize === undefined) params.inputsize = 30;
        ModalElement.multipleInput_callback_func = params.func;
        ModalElement.multipleInput_n = params.inputlist.length;
        if (params.buttontype === undefined) params.buttontype = "white-gray";
        st = [
            {cells: [{style: "height: 34px;", align: "center", colspan: 2, text: params.message}]},
            {cells: [{style: "height: 20px;", colspan: 2}]}
        ]
        for (i = 0; i < ModalElement.multipleInput_n; i++) {
            switch (params.inputlist[i].align) {
                case 1:
                    sx = "right";
                    break;
                case 2:
                    sx = "center";
                    break;
                case 0:
                    sx = "left";
                    break;
                default:
                    sx = params.inputlist[i].align;
                    break;
            }
            if (params.inputlist[i].defaultvalue === undefined) params.inputlist[i].defaultvalue = "";
            st.push({
                cells: [
                    {
                        style: "height: 34px;",
                        text: inputvalue(params.inputlist[i].name)
                    },
                    {
                        innerHTML: DOMClass.inputTextString({
                            elementid: "modal_multipleInput_" + i,
                            size: params.inputsize,
                            value: params.inputlist[i].defaultvalue,
                            align: sx
                        })
                    }
                ]
            })
        }
        st.push({cells: [{style: "height: 20px;", colspan: 2}]});
        st.push({cells: [{
            align: "center",
            colspan: 2,
            innerHTML: DOMClass.table.generate({
                data: [{
                    cells: [
                        {
                            align: "center",
                            innerHTML: buttonClass.generate({
                                type: params.buttontype,
                                caption: "Ok",
                                command: "ModalElement.multipleInput_submit();",
                                width: 128,
                                height: 24,
                            })
                        },
                        {style: "width: 20px;"},
                        {
                            align: "center",
                            innerHTML: buttonClass.generate({
                                type: params.buttontype,
                                caption: "Ok",
                                command: "ModalElement.close();",
                                width: 128,
                                height: 24,
                            })
                        },
                    ]
                }]
            })
        }]});

        ModalElement.show({
            index: -1,
            bodycontent: DOMClass.table.generate({
                data: st
            })
        });
    },

    fullInput_submit : function (buttonid) {
        var retval = [];
        var i;
        for (i = 0; i < ModalElement.multipleInput_n; i++) {
            retval.push("" + document.getElementById('modal_multipleInput_' + i).value);
        }
        ModalElement.fullInput_callback_func(buttonid, retval);
        ModalElement.close(-1);
    },

    fullInput : function (params) {
        var st;
        var i;

        ModalElement.fullInput_callback_func = params.func;
        ModalElement.multipleInput_n = params.inputlist.length;
        if (params.inputsize === undefined) params.inputsize = 30;
        st = "<table border=\"0\">";
        st += "<tr><td colspan=\"2\" align=\"center\">" + inputvalue(params.message) + "</td></tr>";
        for (i = 0; i < ModalElement.multipleInput_n; i++) {
            st += "<tr><td>" + inputvalue(params.inputlist[i].name) + "</td>";
            st += "<td><input id=\"modal_multipleInput_" + i + "\" type=\"";
            if (params.inputlist[i].type !== undefined) {
                st += inputvalue(params.inputlist[i].type);
            }
            else {
                st += "text";
            }
            st += "\" size=\"" + params.inputsize + "\" value=\"";
            if (params.inputlist[i].defaultvalue !== undefined) st += params.inputlist[i].defaultvalue;
            st += "\" style=\"text-align:";
            switch (params.inputlist[i][3]) {
                case 1:
                    st += "right";
                    break;
                case 2:
                    st += "center";
                    break;
                default:
                    st += "left";
                    break;
            }
            st += ";\"></input></td></tr>";
        }
        st += "<tr><td colspan=\"2\" align=\"center\">";
            if (params.buttonList.length > 0) {
                st += "<table border=\"0\"><tr>";
                st += "<td align=\"center\">" + buttonClass.generate({
                    type: "white-gray",
                    caption: params.buttonList[0],
                    command: "ModalElement.fullInput_submit(0);",
                    width: 128,
                    height: 24,
                }) + "</td>";
                for (i = 1; i < params.buttonList.length; i++) {
                    st += "<td width=\"20\">&nbsp;</td>";
                    st += "<td align=\"center\">" + buttonClass.generate({
                        type: "white-gray",
                        caption: params.buttonList[i],
                        command: "ModalElement.fullInput_submit(" + i + ");",
                        width: 128,
                        height: 24,
                    }) + "</td>";
                }
                st += "</tr></table>";
            }
        st += "</td></tr></table>";
        ModalElement.show({
            index: -1,
            bodycontent: st
        });
    },

    hide : function (index) {
        var i, lIndex = -1;
        if (index === undefined) {
            index = -2;
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].visible && (ModalElement.layerstatus[i].index > index)) {
                    index = ModalElement.layerstatus[i].index;
                    lIndex = i;
                }
            }
        }
        else {
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].index == index) {
                    lIndex = i;
                    break;
                }
            }
        }
        if (lIndex == -1) return;
        if (index >= 0) {
            document.getElementById('myModal' + index).style.display = "none";
            if (index == 0) {
                document.getElementById('myModal').style.display = "none";
            }
        }
        else {
            document.getElementById('myModal').style.display = "none";
        }
        ModalElement.layerstatus[lIndex].visible = false;
    },

    repaint : function (index) {
        var i, lIndex = -1;
        for (i = 0; i < ModalElement.layerstatus.length; i++) {
            if (ModalElement.layerstatus[i].index == index) {
                lIndex = i;
                break;
            }
        }
        if (lIndex == -1) return;
        if (index >= 0) {
            document.getElementById('myModal' + index).style.display = "block";
            document.getElementById('myModal').style.display = "none";
        }
        else {
            document.getElementById('myModal').style.display = "block";
        }
        ModalElement.layerstatus[lIndex].visible = true;
    },

    close : function (index) {
        var i, k, lIndex;
        if (index === undefined) {
            index = -2;
            lIndex = -1;
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].visible && (index < ModalElement.layerstatus[i].index)) {
                    index = ModalElement.layerstatus[i].index;
                    lIndex = i;
                }
            }
        }
        else {
            for (i = 0; i < ModalElement.layerstatus.length; i++) {
                if (ModalElement.layerstatus[i].index == index) {
                    lIndex = i;
                    break;
                }
            }
        }
        if (lIndex == -1) return;
        if (index >= 0) {
            document.getElementById('myModal' + index).style.display = "none";
            document.getElementById('modal-title' + index).innerHTML = "";
            document.getElementById('modal-body-content' + index).innerHTML = "";
            if (index == 0) {
                document.getElementById('myModal').style.display = "none";
                document.getElementById('modal-title').innerHTML = "";
                document.getElementById('modal-body-content').innerHTML = "";
            }
        }
        else {
            document.getElementById('myModal').style.display = "none";
            document.getElementById('modal-title').innerHTML = "";
            document.getElementById('modal-body-content').innerHTML = "";
        }
        ModalElement.layerstatus[lIndex].visible = false;
        ModalElement.layerstatus[lIndex].available = true;
    },

    closeAll : function () {
        var i;
        for (i = 63; i >= 0; i--) {
          ModalElement.close(i);
        }
    },

    newlayer : function () {
        var i, k = 100000, hv = 0;
        for (i = 0; i < ModalElement.layerstatus.length; i++) {
            if (ModalElement.layerstatus[i].visible && (ModalElement.layerstatus[i].index > hv)) {
                hv = ModalElement.layerstatus[i].index;
            }
        }
        for (i = 0; i < ModalElement.layerstatus.length; i++) {
            if ((ModalElement.layerstatus[i].index > hv) && (ModalElement.layerstatus[i].index < k) && ModalElement.layerstatus[i].available) {
                k = ModalElement.layerstatus[i].index;
            }
        }
        return k;
    },

    init : function () {
        var triggerFunc = function () {
            var x, i, w, st, zindex, xa, modalid, modalcontentid;
            if (ModalElement.attach_status == 1) return;
            x = DOMElement.body();
            if (x == null) DOMElement.attach();
            ModalElement.css = {};
            ModalElement.css.modal = DOMElement.genClassName();
            ModalElement.css.lockmodal = DOMElement.genClassName();
            ModalElement.css.modalcontent = DOMElement.genClassName();
            ModalElement.css.animatetop = DOMElement.genClassName();
            ModalElement.css.modalbody = DOMElement.genClassName();
            ModalElement.layerstatus = [];
            DOMElement.loadCSS([
                DOMElement.cssText([ModalElement.css.modal], "", [
                    ["display", "none"],
                    ["position", "fixed"],
                    ["padding-top", "8vh"],
                    ["left", "0"],
                    ["top", "0"],
                    ["width", "100vw"],
                    ["height", "100vh"],
                    ["max-height", "100vh"],
                    ["overflow", "auto"],
                    ["background-color", "rgb(0,0,0)"],
                    ["background-color", "rgba(0,0,0,0)"],
                ]),
                DOMElement.cssText([ModalElement.css.lockmodal], "", [
                    ["display", "none"],
                    ["position", "fixed"],
                    ["padding-top", "8vh"],
                    ["left", "0"],
                    ["top", "0"],
                    ["width", "1000%"],
                    ["height", "1000%"],
                    ["overflow", "hidden"],
                    ["background-color", "rgb(0,0,0)"],
                    ["background-color", "rgba(0,0,0,0)"],
                ]),
                DOMElement.cssText([ModalElement.css.modalcontent], "", [
                    ["display", "inline-block"],
                    ["position", "relative"],
                    ["padding", "10px"],
                    ["border", "1px solid #888"],
                    ["border-radius", "4px"],
                    ["max-height", "90vh"],
                    ["overflow", "auto"],
                    ["background-color", "#fefefe"],
                    ["box-shadow", "4px 4px 10px 0px black"],
                ]),
                DOMElement.cssText([], "@-webkit-keyframes" + ModalElement.css.animatetop, [
                    "from {top:-300px; opacity:0}",
                    "to {top:0; opacity:1}"
                ]),
                DOMElement.cssText([], "@keyframes" + ModalElement.css.animatetop, [
                    "from {top:-300px; opacity:0}",
                    "to {top:0; opacity:1}"
                ]),
                DOMElement.cssText([ModalElement.css.modalbody], "", [
                    ["padding", "2px 10px"],
                ]),
            ]);
            for (i = 63; i >= -1; i--) {
                ModalElement.layerstatus.push({
                    index: i,
                    available: true,
                    visible: false
                })
                st = "myModal";
                switch (i) {
                    case -1:
                        zindex = 101001;
                        break;
                    case 0:
                        st += "0";
                        zindex = 101000;
                        break;
                    default:
                        st += i;
                        zindex = 100000 + i;
                        break;
                }
                if (i >= 0) {
                    xa = {
                        bgcolor: "#FFFFFF"
                    };
                }
                else {
                    xa = {};
                }
                modalid = "modal-title";
                if (i >= 0) modalid += i;
                modalcontentid = "modal-body-content";
                if (i >= 0) modalcontentid += i;
                w = DOMElement.div({
                    attrs: {
                        id: st,
                        className: ModalElement.css.modal,
                        style: {
                            zIndex: zindex
                        }
                    },
                    children: [DOMElement.table({
                        attrs: {
                            border: "0",
                            align: "center",
                            style: {
                                margin: "0 auto",
                            }
                        },
                        data: [
                            DOMElement.tr({
                                attr: xa,
                                children: [DOMElement.td({
                                    attrs: {
                                        style: {
                                            //height: "100vh"
                                        }
                                    },
                                    children: [DOMElement.table({
                                        attrs: {
                                            border: "0",
                                            cellpadding: "0",
                                            cellspacing: "0",
                                        },
                                        data: [
                                            [DOMElement.div({attrs: {id: modalid}})],
                                            [DOMElement.div({
                                                attrs: {className: ModalElement.css.modalcontent},
                                                children: [DOMElement.div({
                                                    attrs: {id: modalcontentid}
                                                })]
                                            })]
                                        ]
                                    })]
                                })]
                            })
                        ]
                    })]

                });
                if (x.childNodes.length > 0) {
                    x.insertBefore(w, x.childNodes[0]);
                }
                else {
                    x.appendChild(w);
                }
            }
            x.insertBefore(DOMElement.div({
                attrs: {
                    id: "myLockModal",
                    className: ModalElement.css.lockmodal,
                    style: {
                        zIndex: 101002,
                        display: "none"
                    }
                }
            }), x.childNodes[0]);
        };
        if (ModuleManagerClass !== undefined) {
            ModuleManagerClass.register({
                name: "ModalElement",
                prerequisites: ["DOMElement"],
                trigger: triggerFunc
            });
        }
        else {
            triggerFunc();
        }
    }
};
if (document.getElementsByTagName("BODY") == null) {
    if (window.addEventListener) {
        window.addEventListener('load', ModalElement.init);
    }
    else {
        window.attachEvent('onload', ModalElement.init);
    }
}
else {
    ModalElement.init();
}

//# sourceURL=module:///src/jsmodalelement.php.js?
