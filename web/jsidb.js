window.IDBClass = {
    open: function (params) {
        var r = {
            request: null,
            onerror: null,
            onsuccess: null,
            onupgradeneeded: null,
            ready: false
        };
        var i;
        if (EncodingClass.type.isString(params)) params = {name: params};
        if (params.keypath === undefined) params.keypath = "id";
        r.request = window.indexedDB.open(params.name);
        r.request.onerror = function (me) {
            return function (event) {
                if (me.onerror !== null) {
                    if (EncodingClass.type.isFunction(me.onerror)) {
                        return me.onerror(event, me);
                    }
                }
            }
        } (r);
        r.request.onsuccess = function (me) {
            return function (event) {
                var db = event.target.result;
                var transaction = db.transaction([me.name], 'readwrite');
                var objectStore = transaction.objectStore(me.name);
                //console.log(event);
                if (me.db === undefined) {
                    Object.defineProperty(me, "db", {
                        get: function (db) {
                            return function () {
                                return db;
                            }
                        } (db)
                    });
                }
                var f = function (me) {
                    return function (cursor) {
                        me.content[cursor.value.key] = {
                            key: cursor.key,
                            value: cursor.value.value
                        };
                    }
                } (me);
                var objectStore = db.transaction(me.name).objectStore(me.name);
                objectStore.openCursor().onsuccess = function (callback, me, tevent) {
                    return function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            callback(cursor);
                            cursor.continue();
                        }
                        else {
                            me.ready = true;
                            if (me.onsuccess !== null) {
                                if (EncodingClass.type.isFunction(me.onsuccess)) {
                                    return me.onsuccess(tevent, me);
                                }
                            }
                            //console.log("No more entries!");
                        }
                    };
                } (f, me, event);
            }
        } (r);
        r.request.onupgradeneeded = function (me) {
            return function (event) {
                if (me.db === undefined) {
                    var db = event.target.result;
                    Object.defineProperty(me, "db", {
                        get: function (db) {
                            return function () {
                                return db;
                            }
                        } (db)
                    });
                }
                else {
                    db = me.db;
                }
                var objectStore = db.createObjectStore(me.name, { keyPath: me.keypath, autoIncrement: true });
                if (me.onupgradeneeded !== null) {
                    if (EncodingClass.type.isFunction(me.onupgradeneeded)) {
                        return me.onupgradeneeded(event, me);
                    }
                }
            }
        } (r);
        Object.defineProperty(r, "content", {
            get: function (content) {
                return function () {
                    return content;
                }
            } ({})
        });
        Object.defineProperty(r, "name", {
            get: function (name) {
                return function () {
                    return name;
                }
            } (params.name)
        });
        Object.defineProperty(r, "keypath", {
            get: function (keypath) {
                return function () {
                    return keypath;
                }
            } (params.keypath)
        });
        Object.defineProperty(r, "keys", {
            get: function (me) {
                return function () {
                    return Object.keys(me.content);
                }
            } (r)
        });
        r.remove = function (me) {
            return function (key) {
                var transaction = me.db.transaction([me.name], 'readwrite');
                var objectStore = transaction.objectStore(me.name);
                if (me.content[key] !== undefined) {
                    var request = objectStore.delete(me.content[key].key);
                    request.onsuccess = function (me, key) {
                        return function (event) {
                            delete me.content[key];
                        }
                    } (me, key);
                }
            }
        } (r);
        r.write = function (me) {
            return function (key, value) {
                var v;
                if (me.content[key] !== undefined) {
                    if (me.content[key].key === undefined) {
                        setTimeout(function (me, key, value) {
                            return function () {
                                me.write(key, value);
                            }
                        } (me, key, value), 10);
                        return;
                    }
                    var transaction = me.db.transaction([me.name], 'readwrite');
                    var objectStore = transaction.objectStore(me.name);
                    var request = objectStore.delete(me.content[key].key);
                    request.onsuccess = function (me, key, value) {
                        return function (event) {
                            delete me.content[key];
                            me.write(key, value);
                        }
                    } (me, key, value);
                }
                else {
                    v = {
                        key: key,
                        value: value
                    };
                    me.content[key] = {
                        value: value
                    };
                    var transaction = me.db.transaction([me.name], 'readwrite');
                    var objectStore = transaction.objectStore(me.name);
                    var request = objectStore.add(v);
                    request.onsuccess = function (me, key) {
                        return function(event) {
                            me.content[key].key = event.target.result;
                        }
                    } (me, key);
                }
            }
        } (r);
        r.read = function (me) {
            return function (key) {
                if (me.content[key] === undefined) return undefined;
                return me.content[key].value;
            }
        } (r);
        return r;
    }
};
window.indexedDB = window.indexedDB
    || window.mozIndexedDB
    || window.webkitIndexedDB
    || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction
    || window.webkitIDBTransaction
    || window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange
    || window.webkitIDBKeyRange
    || window.msIDBKeyRange;

if (!window.indexedDB) {
    Object.defineProperty(IDBClass, "isSupported", {
        get: function () {
            return false;
        }
    });
}
else {
    Object.defineProperty(IDBClass, "isSupported", {
        set: function (value) {
        },
        get: function () {
            return true;
        }
    });
}
if (window.ModuleManagerClass !== undefined) {
    ModuleManagerClass.register("IDBClass");
}

//# sourceURL=bsc:///src/jsidb.php.js?
