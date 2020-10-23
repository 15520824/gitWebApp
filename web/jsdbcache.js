window.DBCacheClass = {
    opened: {}
};

DBCacheClass.open = function (params) {
    var content = {
        readtasks: [],
        tablequeue: [],
        dbs: {},
        ftloaded: false,
        etloaded: false
    };
    var retval = {};
    var accesskey, url;
    if (EncodingClass.type.isString(params)) {
        accesskey = params;
        url = "dbcache_load.php";
    }
    else {
        accesskey = params.accesskey;
        url = params.url;
    }
    if (DBCacheClass.opened[accesskey] !== undefined) return DBCacheClass.opened[accesskey].instance;
    content.accesskey = accesskey;
    content.idb = IDBClass.open("dbcache_" + accesskey);
    retval.add = function (content) {
        return function (name) {
            if (content.dbs[name] === undefined) {
                content.tablequeue.push(name);
                content.dbs[name] = {
                    fetched: false,
                    records: [],
                    refreshRequest: false
                };
                if (!content.ftloaded) {
                    content.ftloaded = true;
                    setTimeout(function () {
                        content.fetchingThread();
                    }, 2);
                }
            }
        }
    } (content);
    content.removeObsoletedCache = function (content) {
        return function (name, records) {
            var xkeys, tkeys, tmarked;
            var i, n, m, s;
            xkeys = Object.keys(content.idb.content);
            n = xkeys.length;
            s = name + "_";
            m = s.length;
            tkeys = [];
            tmarked = {};
            for (i = 0; i < n; i++) {
                if (xkeys[i].length >= m) {
                    if (xkeys[i].substr(0, m) == s) {
                        tmarked[xkeys[i]] = tkeys.length;
                        tkeys.push({
                            name: xkeys[i],
                            inused: false
                        });
                    }
                }
            }
            n = records.length;
            for (i = 0; i < n; i++) {
                s = name + "_" + records[i].etime + "_" + records[i].from + "_" + records[i].to;
                if (tmarked[s] !== undefined)
                tkeys[tmarked[s]].inused = true;
            }
            n = tkeys.length;
            for (i = 0; i < n; i++) {
                if (!tkeys[i].inused) {
                    //console.log("removeObsoletedCache " + "[" + tkeys[i].name + "]");
                    content.idb.remove(tkeys[i].name);
                }
            }
        }
    } (content);

    content.fetchTable = function (content, accesskey, url) {
        return function (name) {
            content.dbs[name].refreshRequest = false;
            FormClass.api_call({
                url: url,
                params: [
                    {
                        name: "params",
                        value: EncodingClass.string.fromVariable({
                            tablename: name,
                            accesskey: accesskey
                        })
                    }
                ],
                func: function(success, message) {
                    var i, h, n, m, v, t, dtable;
                    if (success) {
                        if (message.substr(0, 2) == "ok") {
                            v = EncodingClass.string.toVariable(message.substr(2));
                            if (v.result) {
                                v = v.content;
                                n = v.length;
                                dtable = content.dbs[name];
                                if (dtable.refreshRequest) {
                                    content.tablequeue.shift();
                                    setTimeout(function () {
                                        content.fetchingThread();
                                    }, 2);
                                    return;
                                }
                                h = [];
                                m = 0;
                                for (i = 0; i < n; i++) {
                                    t = {
                                        from: v[i].from,
                                        to: v[i].to,
                                        etime: v[i].etime
                                    }
                                    while (m < dtable.records.length) {
                                        if (dtable.records[m].from < v[i].from) {
                                            m++;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    if (m < dtable.records.length) {
                                        if ((dtable.records[m].from == v[i].from) && (dtable.records[m].to == v[i].to) && (dtable.records[m].etime == v[i].etime)) {
                                            h.push(dtable.records[m]);
                                            continue;
                                        }
                                    }
                                    s = content.idb.read(name + "_" + v[i].etime + "_" + v[i].from + "_" + v[i].to);
                                    if (s === undefined) {
                                        t.status = "n/a";
                                    }
                                    else {
                                        t.status = "raw";
                                        t.rawcontent = s;
                                    }
                                    h.push(t);
                                }
                                content.removeObsoletedCache(name, h);
                                dtable.records = h;
                                dtable.fetched = true;
                                if (!content.etloaded) {
                                    content.etloaded = true;
                                    setTimeout(function () {
                                        content.extractingThread();
                                    }, 2);
                                }
                                content.tablequeue.shift();
                                setTimeout(function () {
                                    content.fetchingThread();
                                }, 2);
                                return;
                            }
                            else {
                                console.log(v);
                            }
                        }
                        else {
                            console.log(message);
                        }
                    }
                    else {
                        console.log(message);
                        setTimeout(function () {
                            content.fetchingThread();
                        }, 5000);
                        return;
                    }
                }
            });
        }
    } (content, accesskey, url);
    content.extractingThread = function (content) {
        return function () {
            var i, j, k, l, c, m, dtable, rt, loaded, ids, nq, rv, tablelist;
            if (content.readtasks.length > 0) {
                nq = [];
                for (i = 0; i < content.readtasks.length; i++) {
                    rt = content.readtasks[i];
                    dtable = content.dbs[rt.tablename];
                    if (dtable === undefined) {
                        nq.push(rt);
                        continue;
                    }
                    if (dtable.fetched !== true) {
                        nq.push(rt);
                        continue;
                    }
                    if (dtable.refreshRequest) {
                        nq.push(rt);
                        continue;
                    }
                    ids = rt.ids;
                    if (rt.ids == "all") {
                        c = dtable.records.length;
                        for (j = loaded = 0; j < c; j++) {
                            if (dtable.records[j].status == "raw") {
                                content.etloaded = false;
                                ZipClass.execCode(dtable.records[j].rawcontent, function (xrecord, content) {
                                    return function (rv) {
                                        xrecord.value = rv[0].value;
                                        xrecord.status = "ready";
                                        delete xrecord.rawcontent;
                                        if (!content.etloaded) {
                                            content.etloaded = true;
                                            setTimeout(function () {
                                                content.extractingThread();
                                            }, 2);
                                        }
                                    }
                                } (dtable.records[j], content));
                                for (l = i; l < content.readtasks.length; l++) nq.push(content.readtasks[l]);
                                content.readtasks = nq;
                                return;
                            }
                            else if (dtable.records[j].status == "ready") {
                                loaded++;
                            }
                        }
                        if (loaded == c) {
                            rv = [];
                            for (j = 0; j < c; j++) {
                                for (k = 0; k < dtable.records[j].value.length; k++) {
                                    if (rt.cond === true) {
                                        rv.push(dtable.records[j].value[k]);
                                    }
                                    else if (rt.cond(dtable.records[j].value[k])) rv.push(dtable.records[j].value[k]);
                                }
                            }
                            rt.callback(content.removeDuplicated(rv));
                            rv = [];
                        }
                        else {
                            nq.push(rt);
                        }
                        continue;
                    }
                    c = ids.length;
                    loaded = 0;
                    m = dtable.records.length - 1;
                    if (m >= 0) {
                        for (j = 0; j < c; j++) {
                            if ((!ids[j].loaded) && ((dtable.records[m].to < ids[j].id) || (dtable.records[0].to > ids[j].id)))  {
                                ids[j].loaded = true;
                                ids[j].value = undefined;
                            }
                        }
                    }
                    for (j = m = 0; j < c; j++) {
                        if (!ids[j].loaded) {
                            while (m < dtable.records.length) {
                                if (dtable.records[m].to < ids[j].id) {
                                    m++;
                                }
                                else {
                                    break;
                                }
                            }
                            if (m < dtable.records.length) {
                                if ((dtable.records[m].from <= ids[j].id) && (dtable.records[m].to >= ids[j].id)) {
                                    switch (dtable.records[m].status) {
                                        case "ready":
                                            ids[j].loaded = true;
                                            ids[j].value = content.getRecordById(dtable.records[m].value, ids[j].id);
                                            loaded++;
                                            break;
                                        case "raw":
                                        case "n/a":
                                        default:
                                            break;
                                    }
                                }
                                else {
                                    loaded++;
                                }
                            }
                        }
                        else {
                            loaded++;
                        }
                    }
                    if (loaded == c) {
                        rv = [];
                        for (j = 0; j < c; j++) {
                            if (ids[j].value !== undefined) rv.push(ids[j].value);
                        }
                        rt.callback(content.removeDuplicated(rv));
                    }
                    else {
                        nq.push(rt);
                    }
                }
                content.readtasks = nq;
            }
            if (content.readtasks.length > 0) {
                for (i = 0; i < content.readtasks.length; i++) {
                    rt = content.readtasks[i];
                    dtable = content.dbs[rt.tablename];
                    ids = rt.ids;
                    if (rt.ids == "all") continue;
                    c = ids.length;
                    for (j = m = 0; j < c; j++) {
                        if (!ids[j].loaded) {
                            while (m < dtable.records.length) {
                                if (dtable.records[m].to < ids[j].id) {
                                    m++;
                                }
                                else {
                                    break;
                                }
                            }
                            if (m < dtable.records.length) {
                                if ((dtable.records[m].from <= ids[j].id) && (dtable.records[m].to >= ids[j].id)) {
                                    if (dtable.records[m].status == "raw") {
                                        content.etloaded = false;
                                        ZipClass.execCode(dtable.records[m].rawcontent, function (xrecord, content) {
                                            return function (rv) {
                                                xrecord.value = rv[0].value;
                                                xrecord.status = "ready";
                                                delete xrecord.rawcontent;
                                                if (!content.etloaded) {
                                                    content.etloaded = true;
                                                    setTimeout(function () {
                                                        content.extractingThread();
                                                    }, 2);
                                                }
                                            }
                                        } (dtable.records[m], content));
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            tablelist = Object.keys(content.dbs);
            for (i = 0; i < tablelist.length; i++) {
                dtable = content.dbs[tablelist[i]];
                c = dtable.records.length;
                for (j = 0; j < c; j++) {
                    if (dtable.records[j].status == "raw") {
                        //console.log("extracting: " + dtable.records[j].from + "_" + dtable.records[j].to + "_" + dtable.records[j].etime);
                        content.etloaded = false;
                        ZipClass.execCode(dtable.records[j].rawcontent, function (xrecord, content) {
                            return function (rv) {
                                xrecord.value = rv[0].value;
                                xrecord.status = "ready";
                                delete xrecord.rawcontent;
                                if (!content.etloaded) {
                                    content.etloaded = true;
                                    setTimeout(function () {
                                        content.extractingThread();
                                    }, 2);
                                }
                            }
                        } (dtable.records[j], content));
                        return;
                    }
                }
            }
            content.etloaded = false;
        }
    } (content);
    content.fetchRecords = function (content, accesskey) {
        return function (tablename, record) {
            var fname = "dbcache/" + accesskey + "_" + tablename + "_" + record.from + "_" + record.to + "_" + record.etime + ".zip";
            FormClass.api_call({
                url: fname,
                params: [],
                rawcontent: true,
                func: function (record, fname, tablename) {
                    return function (success, message) {
                        if (success) {
                            if (message.substr(0, 2) == "PK") {
                                record.status = "raw";
                                record.rawcontent = message;
                                content.idb.write(tablename + "_" + record.etime + "_" + record.from + "_" + record.to, message);
                                if (!content.etloaded) {
                                    content.etloaded = true;
                                    setTimeout(function () {
                                        content.extractingThread();
                                    }, 2);
                                }
                            }
                            else {
                                record.rawcontent = message;
                                record.status = "error";
                                console.log("cache error: " + fname);
                            }
                            setTimeout(function () {
                                content.fetchingThread();
                            }, 2);
                        }
                        else {
                            console.log(message);
                            setTimeout(function () {
                                content.fetchingThread();
                            }, 5000);
                        }
                        return;
                    }
                } (record, fname, tablename)
            });
        }
    } (content, accesskey);

    content.fetchingThread = function (content, accesskey) {
        return function () {
            var i, j, n, m, rt, dbkeys;
            var tablename;
            if (!content.idb.ready) {
                setTimeout(function () {
                    content.fetchingThread();
                }, 2);
                return;
            }
            if (content.readtasks.length > 0) {
                for (i = 0; i < content.readtasks.length; i++) {
                    rt = content.readtasks[i];
                    if (content.dbs[rt.tablename] === undefined) {
                        content.dbs[rt.tablename] = {
                            fetched: false,
                            records: []
                        };
                        content.fetchTable(rt.tablename);
                        return;
                    }
                }
            }
            while (content.tablequeue.length > 0) {
                tablename = content.tablequeue[0];
                if (content.dbs[tablename] === undefined) {
                    content.dbs[tablename] = {
                        fetched: false,
                        records: [],
                        refreshRequest: false
                    };
                }
                if (!content.dbs[tablename].fetched) {
                    content.fetchTable(tablename);
                    return;
                }
                content.tablequeue.shift();
            }
            dbkeys = Object.keys(content.dbs);
            m = dbkeys.length;
            for (i = 0; i < m; i++) {
                tablename = dbkeys[i];
                rt = content.dbs[tablename];
                if (rt.refreshRequest) {
                    rt.fetched = false;
                    content.fetchTable(tablename);
                    return;
                }
            }
            for (i = 0; i < m; i++) {
                tablename = dbkeys[i];
                rt = content.dbs[tablename];
                n = rt.records.length;
                for (j = 0; j < n; j++) {
                    if (rt.records[j].status == "n/a") {
                        content.fetchRecords(tablename, rt.records[j]);
                        return;
                    }
                }
            }
            content.ftloaded = false;
        }
    } (content, accesskey);

    content.getRecordById = function (marr, id) {
        var l, r, m;
        l = 0;
        r = marr.length - 1;
        while (l <= r) {
            m = (l + r) >> 1;
            if (marr[m].id == id) return marr[m];
            if (marr[m].id < id) {
                l = m + 1;
            }
            else {
                r = m - 1;
            }
        }
        return undefined;
    }

    content.removeDuplicated = function (marr) {
        var r = [], r2 = [], i, n;
        n = marr.length;
        if (n > 1) {
            for (i = 0; i < n; i++) r2.push(marr[i]);
            r2.sort(function (a, b) {
                return a.id - b.id;
            });
            r = [r2[0]];
            for (i = 1; i < n; i++) {
                if (r2[i].id != r2[i - 1].id) r.push(r2[i]);
            }
            return r;
        }
        else {
            return marr;
        }
    }

    retval.refresh = function (content) {
        return function (name) {
            var i;
            if (content.dbs[name] !== undefined) {
                content.dbs[name].refreshRequest = true;
                for (i = 1; i < content.tablequeue.length; i++) {
                    if (content.tablequeue[i] == name) return;
                }
                content.tablequeue.push(name);
                if (!content.ftloaded) {
                    content.ftloaded = true;
                    setTimeout(function () {
                        content.fetchingThread();
                    }, 2);
                }
            }
        }
    } (content);

    retval.loadById = function (retval) {
        return function (params) {
            if (params.name === undefined) {
                console.error("name not found");
                return null;
            }
            retval.loadByIds({
                name: params.name,
                ids: [params.id],
                callback: function (callbackfunc) {
                    return function (records) {
                        if (EncodingClass.type.isFunction(callbackfunc)) {
                            if (records !== undefined) {
                                if (records.length > 0) {
                                    callbackfunc(records[0]);
                                }
                                else {
                                    callbackfunc(undefined);
                                }
                            }
                            else {
                                callbackfunc(undefined);
                            }
                        }
                    }
                } (params.callback)
            });
        }
    } (retval);
    retval.loadByIds = function (content) {
        return function (params) {
            var i, m, c, v, t, ids = [], rv, loaded, dtable;
            if (!EncodingClass.type.isArray(params.ids)) {
                params.callback([]);
                return;
            }
            c = params.ids.length;
            if (c == 0) {
                params.callback([]);
                return;
            }
            for (i = 0; i < c; i++) {
                v = params.ids[i];
                if (!EncodingClass.type.isNumber(v)) v = parseInt(v.toString());
                ids.push({
                    id: v,
                    loaded: false
                });
            }
            ids.sort(function (a, b) {
                return a.id - b.id;
            });
            dtable = content.dbs[params.name];
            if (dtable === undefined) {
                content.readtasks.push({
                    tablename: params.name,
                    ids: ids,
                    callback: params.callback
                });
                return;
            }
            for (i = m = loaded = 0; i < c; i++) {
                while (m < dtable.records.length) {
                    if (dtable.records[m].to < ids[i].id) {
                        m++;
                    }
                    else {
                        break;
                    }
                }
                if (m < dtable.records.length) {
                    if ((dtable.records[m].from <= ids[i].id) && (dtable.records[m].to >= ids[i].id) && (dtable.records[m].status == "ready")) {
                        ids[i].loaded = true;
                        ids[i].value = content.getRecordById(dtable.records[m].value, ids[i].id); //dtable.records[m].value[ids[i].id];
                        loaded++;
                    }
                }
            }
            if (loaded == c) {
                rv = [];
                for (i = 0; i < c; i++) {
                    rv.push(ids[i].value);
                }
                params.callback(rv);
                return;
            }
            content.readtasks.push({
                tablename: params.name,
                ids: ids,
                callback: params.callback
            });
            if (!content.etloaded) {
                content.etloaded = true;
                setTimeout(function () {
                    content.extractingThread();
                }, 2);
            }
        }
    } (content);
    retval.loadByCondition = function (content) {
        return function (params) {
            var i, j, n, m, v, ok, rv;
            if (content.dbs[params.name] !== undefined) {
                if (content.dbs[params.name].fetched && !content.dbs[params.name].refreshRequest) {
                    n = content.dbs[params.name].records.length;
                    ok = true;
                    for (i = 0; i < n; i++) {
                        if (content.dbs[params.name].records[i].status != "ready") {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) {
                        rv = [];
                        for (i = 0; i < n; i++) {
                            v = content.dbs[params.name].records[i].value;
                            m = v.length;
                            for (j = 0; j < m; j++) {
                                if (params.cond === true) {
                                    rv.push(v[j]);
                                }
                                else if (params.cond(v[j])) rv.push(v[j]);
                            }
                        }
                        params.callback(content.removeDuplicated(rv));
                        return;
                    }
                }
            }
            content.readtasks.push({
                tablename: params.name,
                ids: "all",
                cond: params.cond,
                callback: params.callback
            });
        }
    } (content);
    DBCacheClass.opened[accesskey] = {
        temp: [],
        instance: retval
    }
    console.log(content);
    return retval;
};

if (window.ModuleManagerClass !== undefined) {
    ModuleManagerClass.register({
        name: "DBCacheClass",
        prerequisites: ["ZIPClass", "IDBClass"]
    });
}
else {
}

//# sourceURL=module:///src/jsdbcache.php.js?
