var StorageClass = {
    tempvars: [],

    isSupported: function () {
        if(typeof(Storage) !== "undefined") return true;
        return false;
    },

    setLocal: function (name, value) {
        localStorage.setItem(name + "", value);
    },

    getLocal: function (name) {
        return localStorage.getItem(name + "");
    },

    removeLocal: function (name) {
        window.localStorage.removeItem(name + "");
    },

    setSession: function (name, value) {
        sessionStorage.setItem(name + "", value);
    },

    getSession: function (name) {
        return sessionStorage.getItem(name + "");
    },

    removeSession: function (name) {
        window.sessionStorage.removeItem(name + "");
    },

    getTempVarIndex : function () {
        var i;
        for (i = 0; i < StorageClass.tempvars.length; i++) {
            if (StorageClass.tempvars[i].ready) {
                StorageClass.tempvars[i].ready = false;
                return i;
            }
        }
        i = StorageClass.tempvars.length;
        StorageClass.tempvars.push({
            ready: false,
            value: null
        });
        return i;
    },

    getTempVarValue : function (index) {
        var v = StorageClass.tempvars[index].value;
        StorageClass.tempvars[index].ready = true;
        return v;
    },

    setTempVarValue : function (index, value) {
        if (value === undefined) {
            value = index;
            index = StorageClass.getTempVarIndex();
        }
        StorageClass.tempvars[index].value = value;
        return index;
    }
};
if (ModuleManagerClass !== undefined) {
    ModuleManagerClass.register("StorageClass");
}
