
    var button071218 = {};
    button071218.showButton = function(params){
        var sym, con, tcolor, bcolor, xheight, xwidth, xborder, xradius,icolor,hcolor;
        sym = DOMElement.div({});
        con = "";
        tcolor = "#000000";
        bcolor: "#ffffff";
        xborder = "var(--button-border)";
        xheight = "var(--button-height)";
        xradius = "var(--button-round-coner)";
        if (params.sym !== undefined) sym = params.sym;
        if (params.text !== undefined) con = params.text;
        if (params.textcolor !== undefined) tcolor = params.textcolor;
        if (params.typebutton !== undefined) {
            if (params.typebutton == 1){
                bcolor = "var(--button-background-color_3)";
                icolor = "var(--button-background-color_4)";
                hcolor = "var(--button-background-color_4)";
            }
            else {
                bcolor = "var(--button-background-color_1)";
                icolor = "var(--button-background-color_2)";
                hcolor = "var(--button-background-color_2)";
            }
        }
        if (params.height !== undefined) xheight = params.height;
        if (params.width !== undefined) xwidth = params.width;
        if (params.border !== undefined) xborder = params.border;
        if (params.borderRadius !== undefined) xradius = params.borderRadius;
        sym.style.fontSize = "16px";
        sym.style.color = "#929292";
        sym.style.width = "var(--button-height)";
        sym.style.textAlign = "center";
        var iconx = DOMElement.td({
            align: "center",
            attrs: {
                style: {
                    width: "30px",
                    height: "calc(var(--button-height) - 2px)",
                    textAlign: "center",
                    borderRight: xborder,
                    backgroundColor: icolor,
                    paddingTop: "3px"
                }
            },
            children: [sym]
        });
        var textx = DOMElement.td({
            attrs: {
                align: "center",
                style: {
                    backgroundColor: bcolor,
                    paddingRight: "10px",
                    height: "calc(var(--button-height) - 2px)",
                    paddingLeft: "5px",
                    whiteSpace: "nowrap",
                    fontSize: "var(--button-title-font-size)",
                    fontWeight: "var(--button-title-font-weight)"
                }
            },
            text: con
        });
        iconx.onmouseover = textx.onmouseover = function (iconx, textx) {
            return function(event, me) {
                textx.style.backgroundColor = hcolor;
            }
        } (iconx, textx);
        iconx.onmouseout = textx.onmouseout = function (iconx, textx) {
            return function(event, me) {
                textx.style.backgroundColor = bcolor;
            }
        } (iconx, textx);
        var cells = [];
        if (params.sym) cells.push(iconx);
        cells.push(textx);
        var st = DOMElement.div({
            attrs: {
                style: {
                    minWidth: "var(--button-min-width)",
                    width: xwidth,
                    height: xheight,
                    border: xborder,
                    borderBottom: xborder,
                    color: tcolor,
                    borderRadius: xradius,
                    display: "inline-block", //thanhyen
                    cursor: "pointer",
                    verticalAlign: "middle"
                },
                onclick: (params.onclick !== undefined)? params.onclick : function(){}
            },
            children: [
                DOMElement.table({
                    attrs: {style: {width: "100%",height: "calc(var(--button-height) - 2px)"}},
                    data: [cells]
                })
            ]
        })
        return st;
    };

    button071218.showCheckbox = function (params) {
        var  textpos = "right", xcursor = "pointer"

        var aObject = { tag: 'checkbox', class: [], attr: {}, props: {}, style: {}, on:{}};
        if (params.textcolor) aObject.style.color = params.textcolor;


        if (params.attrs !== undefined) {
            if (params.attrs.textpos !== undefined) textpos = params.attrs.textpos;
            if (params.attrs.cursor !== undefined) xcursor = params.attrs.cursor;
        }
        if (params.textpos )  textpos = params.textpos;
        if (textpos != 'right') aObject.class.push('right');


        var idcheckbox = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 20; i++) {
            idcheckbox += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        aObject.attr.id = idcheckbox;

        if (params.id !== undefined) aObject.attr.id = params.id;
        if (params.checked !== undefined) aObject.props.checked = params.checked;

        if (params.disabled !== undefined) aObject.props.disabled = params.disabled;
        if (params.style !== undefined) Object.assign(aObject.style, params.style);
        aObject.style.cursor = xcursor;


        var mergeParam = Object.assign(Object.assign({}, params), Object.assign({},params.attrs||{} ));

        var on = Object.keys(mergeParam).filter(function (key) {
            return (/^on.+/.test(key)) && (typeof mergeParam[key] == 'function');
        }).reduce(function (ac, key) {
            var eventName = key.replace(/^on/, '');
            ac[eventName] = mergeParam[key];
            return ac;
        }, {});

        var props  = Object.keys(mergeParam).filter(function (key) {
            return !(/(^on.+)|style|cursor|id|attrs/).test(key);
        }).reduce(function (ac, key) {
            ac[key] = mergeParam[key];
            return ac;
        }, {});

        Object.assign(aObject.on, on);
        Object.assign(aObject.props, props);

        return absol.buildDom(aObject);
    };

    button071218.showRadio = function (params) {
        var  textpos = "right", xcursor = "pointer"

        var aObject = { tag: 'radio', class: [], attr: {}, props: {}, style: {}, on:{}};
        if (params.textcolor) aObject.style.color = params.textcolor;


        if (params.attrs !== undefined) {
            if (params.attrs.textpos !== undefined) textpos = params.attrs.textpos;
            if (params.attrs.cursor !== undefined) xcursor = params.attrs.cursor;
        }
        if (params.textpos )  textpos = params.textpos;
        if (textpos != 'right') aObject.class.push('right');


        var idradio = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 20; i++) {
            idradio += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        aObject.attr.id = idradio;

        if (params.id !== undefined) aObject.attr.id = params.id;
        if (params.checked !== undefined) aObject.props.checked = params.checked;

        if (params.disabled !== undefined) aObject.props.disabled = params.disabled;
        if (params.style !== undefined) Object.assign(aObject.style, params.style);
        aObject.style.cursor = xcursor;


        var mergeParam = Object.assign(Object.assign({}, params), Object.assign({},params.attrs||{} ));

        var on = Object.keys(mergeParam).filter(function (key) {
            return (/^on.+/.test(key)) && (typeof mergeParam[key] == 'function');
        }).reduce(function (ac, key) {
            var eventName = key.replace(/^on/, '');
            ac[eventName] = mergeParam[key];
            return ac;
        }, {});

        var props  = Object.keys(mergeParam).filter(function (key) {
            return !(/(^on.+)|style|cursor|id|attrs/).test(key);
        }).reduce(function (ac, key) {
            ac[key] = mergeParam[key];
            return ac;
        }, {});

        Object.assign(aObject.on, on);
        Object.assign(aObject.props, props);

        return absol.buildDom(aObject);
    }

    button071218.getRadioValue = function (name) {
        return absol.ShareCreator.radio.getValueByName(name);
    };
