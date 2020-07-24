window.LanguageModule_load = function() {
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "languagemodule_load.php",
            params: [],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        resolve(EncodingClass.string.toVariable(message.substr(2)));
                    }
                    else {
                        ModalElement.alert({message: message});
                    }
                }
                else {
                    ModalElement.alert({message: message});
                }
            }
        });
    });
}

window.LanguageModule = {};

window.printf = function(st, values) {
    var sx, sc, i, j, k;
    sx = "";
    k = st.length;
    for (i = 0; i < k; i++) {
        sc = st.substr(i, 1);
        if (sc == "\\") {
            sx += st.substr(++i, 1);
        }
        else if (sc == "%") {
            j = 0;
            while (true) {
                if ((i+1) == k) break;
                sc = st.charCodeAt(i+1);
                if ((48 <= sc) && (sc <= 57)) {
                    j = j * 10 + sc - 48;
                    i++;
                }
                else {
                    break;
                }
            }
            sx += "" + values[j];
        }
        else
            sx += sc;
    }
    return sx;
};

window.LanguageModule_writeJavascript = function(code) {
    var codes = [];
    for (i = 0; i < LanguageModule_v_languageCode.length; i++) {
        codes.push({id: LanguageModule_v_languageCode[i][2], name: LanguageModule_v_languageCode[i][0], value: LanguageModule_v_languageCode[i][1]});
    }
    LanguageModule = {
        code: codes,
        data: [],
        defaultcode: code,
        setDefaultprofile: function (profile) {
            LanguageModule.defaultprofile = profile;
        },
        setDefaultCode: function (code) {
            LanguageModule.defaultcode = code;
        },
        getCodeIndex: function (codename) {
            var l, r, m, k;
            l = 0;
            r = LanguageModule.code.length - 1;
            for (k = 0; k <= r; k++) {
                if (codename.toUpperCase() == LanguageModule.code[k].name.toUpperCase()) return k;
            }
            return -1;
        },
        text: function (key, code) {
            var i, j, cIndex;
            if (code === undefined) {
                code = LanguageModule_v_defaultcode;
            }
            cIndex = LanguageModule.getCodeIndex(code);
            if (cIndex == -1) return "[key: " + key + "]";
            for (i = 0; i < LanguageModule.data.length; i++) {
                if (LanguageModule.data[i].key == key) return LanguageModule.data[i].value[cIndex];
            }
            return "[key: " + key + "]";
        },
        text2: function (key, value, code) {
            return printf(LanguageModule.text(key, code), value);
        },
        insert: function (key, code, value) {
            var i, t, cIndex, pIndex = -1;
            if (code === undefined) {
                value = key;
                code = LanguageModule.defaultcode;
            }
            if (value === undefined) {
                value = code;
                code = key;
            }
            cIndex = LanguageModule.getCodeIndex(code);
            if (cIndex == -1) return;
            for (i = 0; i < LanguageModule.data.length; i++) {
                if (LanguageModule.data[i].key == key) {
                    LanguageModule.data[i].value[cIndex] = value;
                    return;
                }
            }
            t = [];
            for (i = 0; i < LanguageModule.code.length; i++) {
                t.push("[key: " + key + "]");
            }
            t[cIndex] = value;
            LanguageModule.data.push({
                key: key,
                value: t
            });
        }
    }
    for (param in LanguageModule_v_languagesData){
        for (codename in LanguageModule_v_languagesData[param]){
            LanguageModule.insert(param, codename, LanguageModule_v_languagesData[param][codename]);
        }
    }
};
