'use strict';

data_module.cardList = {};
var condition = "";
var time = new Date();
var month = time.getMonth();
var year = time.getFullYear();
condition += "(month = " + month + " AND year = " + year + ") OR ";
if (month == 11){
    condition += "(month = 0 AND year = " + (year + 1) + ")";
}
else {
    condition += "(month = " + (month + 1) + " AND year = " + year + ")";
}
// data_module.pendingData = [
//     {
//         type: "data_module",
//         dbname: "formats",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "typelists",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "users",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "nations",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "cities",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "districts",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "board_groups",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "board_group_link",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "report_groups",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "report_group_link",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "company_class",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "companies",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "contact",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "owner_company_contact",
//         onLoad: [],
//         isLoaded: false
//     },
//     {
//         type: "data_module",
//         dbname: "user_calendar",
//         condition: condition,
//         onLoad: [],
//         isLoaded: false
//     }
// ];
data_module.pendingData = [
    {
        type: "data_module",
        dbname: ["formats", "typelists", "users", "board_groups", "board_group_link", "report_groups", "report_group_link", "company_class", "user_calendar"],
        onLoad: [],
        condition: condition,
        isLoaded: false
    },
    {
        type: "data_module",
        dbname: ["nations", "cities", "districts"],
        onLoad: [],
        isLoaded: false
    },
    {
        type: "data_module",
        dbname: ["companies"],
        onLoad: [],
        isLoaded: false
    },
    {
        type: "data_module",
        dbname: ["contact"],
        onLoad: [],
        isLoaded: false
    },
    {
        type: "data_module",
        dbname: ["owner_company_contact"],
        onLoad: [],
        isLoaded: false
    }
];
data_module.dataManager = {};
data_module.dataManager[-1] = {
    startIndex: 0,
    endIndex: data_module.pendingData.length
};
data_module.boardArray = [-1];
data_module.boardActive = -1;
data_module.cardActive = -1;
data_module.priorityCount = 0;


data_module.penddingHeap = function(){
    var loadingIndex;
    if (data_module.boardArray.length == 0) {
        setTimeout('data_module.penddingHeap()', 10);
    }
    else {
        var index = data_module.boardArray.indexOf(data_module.boardActive);
        if (index > 0){
            var t = data_module.boardArray[index];
            data_module.boardArray.splice(index, 1);
            data_module.boardArray.unshift(t);
        }
        if (data_module.dataManager[data_module.boardArray[0]].startIndex == data_module.dataManager[data_module.boardArray[0]].endIndex) {
            delete(data_module.dataManager[data_module.boardArray[0]]);
            data_module.boardArray.splice(0, 1);
            setTimeout('data_module.penddingHeap()', 10);
        }
        else {
            loadingIndex = data_module.dataManager[data_module.boardArray[0]].startIndex;
            if (data_module.cardActive != -1){
                if (!data_module.cardList[data_module.cardActive].content){
                    var idx = data_module.cardList[data_module.cardActive].heapIndex + data_module.priorityCount;
                    var temp = data_module.pendingData[idx];
                    data_module.pendingData.splice(idx, 1);
                    data_module.pendingData.splice(loadingIndex, 0, temp);
                    data_module.priorityCount++;
                }
                data_module.cardActive = -1;
            }
            if (!data_module.pendingData[loadingIndex].isLoaded) {
                switch (data_module.pendingData[loadingIndex].type) {
                    case 'card':
                        data_module.loadCardData(data_module.pendingData[loadingIndex]);
                        break;
                    case 'data_module':
                        data_module.loadData(data_module.pendingData[loadingIndex]);
                        break;
                    default:

                }
            }
            else {
                data_module.dataManager[data_module.boardArray[0]].startIndex++;
                setTimeout('data_module.penddingHeap()', 10);
            }
        }
    }
}

data_module.loadCardData = function(content){
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: 'task', value: "card_load_content"},
            {name: 'cardid', value: content.id}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var cardContent = EncodingClass.string.toVariable(message.substr(2));
                    data_module.cardList[content.id].content = cardContent;
                    content.isLoaded = true;
                    content.onLoad.forEach(function(elt){
                        elt();
                    });
                    data_module.dataManager[data_module.boardArray[0]].startIndex++;
                    setTimeout('data_module.penddingHeap()', 10);
                }
                else {
                    console.log("Failed: " + content.id);
                    setTimeout('data_module.penddingHeap()', 10);
                }
            }
            else {
                console.log("Failed: " + content.id);
                setTimeout('data_module.penddingHeap()', 10);
            }
        }
    });
}

data_module.loadData = function(content){
    var params = [
        {name: 'task', value: "data_module_load"},
        {name: 'dbnameList', value: EncodingClass.string.fromVariable(content.dbname)}
    ];
    if (content.condition !== undefined){
        params.push({name: "condition", value: content.condition});
    }
    FormClass.api_call({
        url: "database_load.php",
        params: params,
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var data = EncodingClass.string.toVariable(message.substr(2));
                    for (var idx = 0; idx < content.dbname.length; idx++){
                        data_module[content.dbname[idx]] = {
                            items: data[content.dbname[idx]],
                            getIndex: function(dbname){
                                return function(id){
                                    for (var i = 0; i < data_module[dbname].items.length; i++){
                                        if (data_module[dbname].items[i].id == id) return i;
                                    }
                                    return -1;
                                }
                            }(content.dbname[idx])
                        }
                        if (content.dbname[idx] == 'formats'){
                            data_module[content.dbname[idx]].items.forEach(function(elt){
                                elt.content = EncodingClass.string.toVariable(elt.content);
                            });
                        }
                        if (content.dbname[idx] == "typelists"){
                            contentModule.makeTypesListContent();
                        }
                        if (content.dbname[idx] == "users"){
                            data_module[content.dbname[idx]].getByhomeid = function(dbname){
                                return function(homeid){
                                    for (var i = 0; i < data_module[dbname].items.length; i++){
                                        if (data_module[dbname].items[i].homeid == homeid) return i;
                                    }
                                    return -1;
                                };
                            }(content.dbname[idx])
                            data_module.users.items.sort(function (a, b) {
                                var k;
                                if (a.privilege < b.privilege) return 1;
                                if (a.privilege > b.privilege) return -1;
                                if (absol.string.nonAccentVietnamese(b.username.toLowerCase()) > absol.string.nonAccentVietnamese(a.username.toLowerCase())) return -1;
                                if (absol.string.nonAccentVietnamese(b.username.toLowerCase()) < absol.string.nonAccentVietnamese(a.username.toLowerCase())) return 1;
                                return 0;
                            });
                        }
                        if (content.dbname[idx] == "owner_company_contact"){
                            contentModule.makeOwnerCompanyContact();
                        }
                        if (content.dbname[idx] == "user_calendar"){
                            contentModule.showReminder();
                        }
                    }
                    content.isLoaded = true;
                    content.onLoad.forEach(function(elt){
                        elt();
                    });
                    data_module.dataManager[data_module.boardArray[0]].startIndex++;
                    setTimeout('data_module.penddingHeap()', 10);
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    });
}
