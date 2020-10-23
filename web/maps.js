
carddone.maps.redraw = function(host){
    var x, gps, lat, lng, color, cIndex, note;
    var listCompany_class = [];
    var company_classDic = contentModule.makeDictionaryIndex(host.database.company_class.items);
    for (var i = 0; i < host.database.companies.items.length; i++){
        if (host.database.companies.items[i].permission < 1) continue;
        cIndex = company_classDic[host.database.companies.items[i].company_classid];
        color = "blue";
        note = host.database.companies.items[i].name;
        if (cIndex >= 0) {
            if (host.database.company_class.items[cIndex].color != "") color = host.database.company_class.items[cIndex].color;
            note += " - " + host.database.company_class.items[cIndex].name;
        }
        if (host.database.companies.items[i].address != "") note += " - " + host.database.companies.items[i].address;
        if (host.database.companies.items[i].districtid > 0) note += " - " + host.database.districts.items[host.database.companies.items[i].districtIndex].name;
        if (host.database.companies.items[i].cityid > 0) note += " - " + host.database.cities.items[host.database.companies.items[i].cityIndex].name;
        if (host.database.companies.items[i].nationid > 0) note += " - " + host.database.nations.items[host.database.companies.items[i].nationIndex].name;
        gps = host.database.companies.items[i].gps;
        if (gps == "") continue;
        x = gps.indexOf(",");
        if (x > 0){
            lat = parseFloat(gps.substr(0, x));
            lng = parseFloat(gps.substr(x + 1));
            if (isNaN(lat) || isNaN(lng)) continue;
            host.listGps.push({
                lat: lat,
                lng: lng,
                color: color,
                tooltip: {style:{}, element: DOMElement.span({text: note})},
                company_classid: host.database.companies.items[i].company_classid,
                data: [
                    host.database.companies.items[i].company_classid,
                    host.database.companies.items[i].nationid,
                    host.database.companies.items[i].cityid,
                    host.database.companies.items[i].districtid
                ]
            });
            if (listCompany_class[host.database.companies.items[i].company_classid] === undefined) listCompany_class[host.database.companies.items[i].company_classid] = 0;
            listCompany_class[host.database.companies.items[i].company_classid]++;
        }
    }
    var viewTypeCompany_class = function(){
        DOMElement.removeAllChildren(host.company_classDetailsCtn);
        var count;
        for (var i = 0; i < host.database.company_class.items.length; i++){
            if (listCompany_class[host.database.company_class.items[i].id] !== undefined){
                count = listCompany_class[host.database.company_class.items[i].id];
            }
            else {
                count = 0;
            }
            host.company_classDetailsCtn.appendChild(DOMElement.div({
                attrs: {
                    style: {
                        padding: "var(--control-verticle-distance-1)",
                        verticalAlign: "middle",
                        display: "inline-block"
                        // color: (host.database.company_class.items[i].color == "")? "blue" : host.database.company_class.items[i].color
                    }
                },
                text: host.database.company_class.items[i].name + ": " + count
            }));
        }
        if (listCompany_class[0] !== undefined){
            host.company_classDetailsCtn.appendChild(DOMElement.div({
                attrs: {
                    style: {
                        padding: "var(--control-verticle-distance-1)",
                        verticalAlign: "middle",
                        display: "inline-block"
                        // color: "blue"
                    }
                },
                text: LanguageModule.text("txt_null") + ": " + listCompany_class[0]
            }));
        }
    };
    var changeViewTypeCompany_class = function(){
        var cid;
        listCompany_class = [];
        console.log(host.mapView.hashTableFilter.lastIndexFilter);
        for (var i = 0; i < host.mapView.hashTableFilter.lastIndexFilter.length; i++){
            cid = host.mapView.hashTableFilter.lastIndexFilter[i].data.data.company_classid;
            if (listCompany_class[cid] === undefined) listCompany_class[cid] = 0;
            listCompany_class[cid]++;
        }
        viewTypeCompany_class();
    };
    var showLocation = function(position){
        host.mapView.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    };
    console.log(host.listGps);
    host.mapView = MapView();

    host.mapView.addMapDataHouse(host.listGps);
    host.mapView.addMapHouse();
    host.mapView.addFilter(host.company_class_select, 0);
    host.mapView.addFilter(host.nations_select, 1);
    host.mapView.addFilter(host.city_select, 2);
    host.mapView.addFilter(host.district_select, 3);
    DOMElement.removeAllChildren(host.data_container);
    host.nations_select.on("change", function(){
         host.city_select.emit("change");
    });
    host.city_select.on("change", function(){
         host.district_select.emit("change");
    });
    host.company_class_select.on("change",function(event){
        changeViewTypeCompany_class();
    });
    host.district_select.on("change",function(event){
        changeViewTypeCompany_class();
    });
    host.company_classDetailsCtn = DOMElement.div({
        attrs: {
            style: {
                paddingBottom: "var(--control-verticle-distance-1)"
            }
        }
    });
    host.data_container.appendChild(host.company_classDetailsCtn);
    var blockMap = DOMElement.div({
        attrs: {
            style: {
                border: "var(--button-border)",
                width: "100%",
                height: "calc(100% - 80px)"
            }
        },
        children: [host.mapView]
    });
    host.data_container.appendChild(blockMap);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showLocation);
    }
    else {
        console.log("Geolocation is not supported by this browser.");
    }
    viewTypeCompany_class();
};

carddone.maps.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.maps.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    var st = {
        nations: [],
        cities: [],
        districts: [],
        company_class: [],
        companies: [],
        contact: [],
        owner_company_contact: [],
        company_class_member: [],
        account_groups: [],
        privilege_groups: [],
        privilege_group_details: []
    }
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
    host.database.owner_company_contact.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "owner_company_contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.owner_company_contact.items = retval;
                resolve();
            }
        });
    });
    host.database.nations.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "nations",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.nations.items = retval;
                resolve();
            }
        });
    });
    host.database.cities.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "cities",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.cities.items = retval;
                resolve();
            }
        });
    });
    host.database.districts.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "districts",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.districts.items = retval;
                resolve();
            }
        });
    });
    host.database.companies.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.companies.items = retval;
                resolve();
            }
        });
    });
    host.database.company_class.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.company_class.items = retval;
                resolve();
            }
        });
    });
    host.database.contact.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "contact",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.contact.items = retval;
                resolve();
            }
        });
    });
    host.database.company_class_member.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class_member",
            cond: function (record) {
                return record.userid == systemconfig.userid;
            },
            callback: function (retval) {
                host.database.company_class_member.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.account_groups.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "account_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.account_groups.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.privilege_groups.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "privilege_groups",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_groups.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    host.database.privilege_group_details.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "privilege_group_details",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.privilege_group_details.items = EncodingClass.string.duplicate(retval);
                resolve();
            }
        });
    });
    Promise.all([
        host.database.nations.sync,
        host.database.cities.sync,
        host.database.districts.sync,
        host.database.companies.sync,
        host.database.company_class.sync,
        host.database.contact.sync,
        host.database.owner_company_contact.sync,
        host.database.company_class_member.sync,
        host.database.privilege_groups.sync,
        host.database.privilege_group_details.sync,
        host.database.account_groups.sync
    ]).then(function(){
        delete host.database.nations.sync;
        delete host.database.cities.sync;
        delete host.database.districts.sync;
        delete host.database.companies.sync;
        delete host.database.company_class.sync;
        delete host.database.contact.sync;
        delete host.database.owner_company_contact.sync;
        delete host.database.company_class_member.sync;
        delete host.database.privilege_groups.sync;
        delete host.database.privilege_group_details.sync;
        delete host.database.account_groups.sync;
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makeCitiesIndexThanhYen(host);
        contentModule.makeDistrictsIndexThanhYen(host);
        contentModule.makeOwnerCompanyContactThanhYen(host);
        contentModule.makeCompanyIndexThanhYen(host);
        contentModule.makeContactIndexThanhYen(host);
        ModalElement.close(-1);
        host.listGps = [];
        var getListDistrictByCity = function(nationid, id){
            var districtList;
            switch (id) {
                case 0:
                    districtList = [
                        {value: 0, text: LanguageModule.text("txt_all")},
                        {value: "...", text: LanguageModule.text("txt_null")}
                    ];
                    for (var i = 0; i < host.database.districts.items.length; i++){
                        if (nationid != 0) if (host.database.districts.items[i].nationid != nationid) continue;
                        districtList.push({value: host.database.districts.items[i].id, text: host.database.districts.items[i].name});
                    }
                    break;
                case -1:
                    districtList = [{value: "...", text: LanguageModule.text("txt_null")}];
                    break;
                default:
                    districtList = [
                        {value: 0, text: LanguageModule.text("txt_all")},
                        {value: "...", text: LanguageModule.text("txt_null")}
                    ];
                    var index = host.database.cities.getIndex(id);
                    var ni;
                    for (var i = 0; i < host.database.cities.items[index].districtIndexList.length; i++){
                        ni = host.database.cities.items[index].districtIndexList[i];
                        districtList.push({value: host.database.districts.items[ni].id, text: host.database.districts.items[ni].name});
                    }
                    break;
            }
            return districtList;
        };
        var getListCityByNation = function(id){
            var cityList;
            switch (id) {
                case 0:
                    cityList = [
                        {value: 0, text: LanguageModule.text("txt_all"), districtList: getListDistrictByCity(id, 0)},
                        {value: "...", text: LanguageModule.text("txt_null"), districtList: getListDistrictByCity(id, -1)}
                    ];
                    for (var i = 0; i < host.database.cities.items.length; i++){
                        cityList.push({
                            value: host.database.cities.items[i].id,
                            text: host.database.cities.items[i].name,
                            districtList: getListDistrictByCity(id, host.database.cities.items[i].id)
                        });
                    }
                    break;
                case -1:
                    cityList = [{value: "...", text: LanguageModule.text("txt_null"), districtList: getListDistrictByCity(id, -1)}];
                    break;
                default:
                    cityList = [
                        {value: 0, text: LanguageModule.text("txt_all"), districtList: getListDistrictByCity(id, 0)},
                        {value: "...", text: LanguageModule.text("txt_null"), districtList: getListDistrictByCity(id, -1)}
                    ];
                    var index = host.database.nations.getIndex(id);
                    var ni;
                    for (var i = 0; i < host.database.nations.items[index].cityIndexList.length; i++){
                        ni = host.database.nations.items[index].cityIndexList[i];
                        cityList.push({
                            value: host.database.cities.items[ni].id,
                            text: host.database.cities.items[ni].name,
                            districtList: getListDistrictByCity(id, host.database.cities.items[ni].id)
                        });
                    }
                    break;
            }
            return cityList;
        };
        var listNation = [
            {value: 0, text: LanguageModule.text("txt_all"), cityList: getListCityByNation(0)},
            {value: "...", text: LanguageModule.text("txt_null"), cityList: getListCityByNation(-1)}
        ];
        for (var i = 0; i < host.database.nations.items.length; i++){
            listNation.push({
                value: host.database.nations.items[i].id,
                text: host.database.nations.items[i].name,
                cityList: getListCityByNation(host.database.nations.items[i].id)
            });
        }
        var listDistrict = [];
        host.district_select = absol.buildDom({
            tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: listNation[0].cityList[0].districtList,
                value: listNation[0].cityList[0].districtList[0].value,
                enableSearch: true
            }
        });
        host.city_select = absol.buildDom({
            tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: listNation[0].cityList,
                value: listNation[0].cityList[0].value,
                enableSearch: true
            },
            on: {
                change: function(){
                    var listCity = this.items;
                    for (var i = 0; i < listCity.length; i++){
                        if (listCity[i].value == this.value){
                            host.district_select.items = listCity[i].districtList;
                            host.district_select.value = listCity[i].districtList[0].value;
                            break;
                        }
                    }
                }
            }
        });
        host.nations_select = absol.buildDom({
           tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
           style: {
               verticalAlign: "middle"
           },
           props: {
               items: listNation,
               enableSearch: true
           },
           on: {
               change: function(){
                   for (var i = 0; i < listNation.length; i++){
                       if (listNation[i].value == this.value){
                           host.city_select.items = listNation[i].cityList;
                           host.city_select.value = listNation[i].cityList[0].value;
                           break;
                       }
                   }
               }
           }
        });
        var listClass = [
            {value: 0, text: LanguageModule.text("txt_all")},
            {value: "...", text: LanguageModule.text("txt_null")}
        ];
        for (var i = 0; i < host.database.company_class.items.length; i++){
            listClass.push({value: host.database.company_class.items[i].id, text: host.database.company_class.items[i].name});
        }
        host.company_class_select = absol.buildDom({
            tag: (carddone.isMobile)? "mselectmenu" : "selectmenu",
            style: {
                verticalAlign: "middle"
            },
            props: {
                items: listClass,
                enableSearch: true
            }
        });
        var drawRoad = function(){
            alert(host.road_input.value);
        };
        host.road_input = theme.input({
            type: "text",
            onchange: function(){
                drawRoad();
            }
        });
        host.holder.addChild(host.frameList);
        host.data_container = DOMElement.div({attrs: {style: {height: "100%", width: "100%"}}});
        host.singlePage = host.funcs.formMapsInit({
            cmdbutton: {
                close: function(){
                    if (carddone.isMobile){
                        host.holder.selfRemove();
                        carddone.menu.loadPage(100);
                    }
                    else {
                        carddone.menu.tabPanel.removeTab(host.holder.id);
                    }
                }
            },
            road_input: host.road_input,
            data_container: host.data_container,
            nations_select: host.nations_select,
            city_select: host.city_select,
            district_select: host.district_select,
            company_class_select: host.company_class_select,
            road_input: host.road_input
        });
        host.frameList.addChild(host.singlePage);
        host.singlePage.requestActive();
        carddone.maps.redraw(host);
    });
};
ModuleManagerClass.register({
    name: "Maps",
    prerequisites: ["ModalElement", "FormClass"]
});
