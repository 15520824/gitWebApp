'use strict';

FormClass.readFileAsync = function(file){
    return new Promise(function(resolve, reject){
        FormClass.readFile(file, function (result) {
            resolve(result[0])});//tại sao lại trả về mảng nhỉ, kì lạ thật
    });
};



window.contentModule = {};

contentModule.copyToClipboard = function(str){
    var el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

contentModule.fromDouble = function (number, decpre) {
    var d, f, k, s;
    if (!EncodingClass.type.isNumber(number)) return "-";
    if (isNaN(number)) return "-";
    if (number < 0) return "-" + contentModule.fromDouble(-number, decpre);
    s = number.toFixed(decpre);
    k = s.indexOf(".");
    if (k != -1) {
        f = s.substr(k);
        s = s.substr(0, k);
    }
    else {
        f = "";
    }
    d = "";
    while (s.length > 3) {
        d = "," + s.substr(s.length - 3, 3) + d;
        s = s.substr(0, s.length - 3);
    }
    return s + d + f;
}

contentModule.listSuffFiles = ["3g2","3ga","3gp","7z","aa","aac","ac","accdb","accdt","ace","adn","ai","aif","aifc","aiff","ait","amr","ani",
    "apk","app","applescript","asax","asc","ascx","asf","ash","ashx","asm","asmx","asp","aspx","asx","au","aup","avi","axd","aze","bak","bash",
    "bat","bin","blank","bmp","bowerrc","bpg","browser","bz2","bzempty","c","cab","cad","caf","cal","cd","cdda","cer","cfg","cfm","cfml","cgi",
    "chm","class","cmd","codeworkspace","codekit","coffee","coffeelintignore","com","compile","conf","config","cpp","cptx","cr2","crdownload",
    "crt","crypt","cs","csh","cson","csproj","css","csv","cue","cur","dart","dat","data","db","dbf","deb","default","dgn","dist","diz","dll",
    "dmg","dng","doc","docb","docm","docx","dot","dotm","dotx","download","dpj","ds_store","dsn","dtd","dwg","dxf","editorconfig","el","elf",
    "eml","enc","eot","eps","epub","eslintignore","exe","f4v","fax","fb2","fla","flac","flv","fnt","folder","fon","gadget","gdp","gem","gif",
    "gitattributes","gitignore","go","gpg","gpl","gradle","gz","h","handlebars","hbs","heic","hlp","hs","hsl","htm","html","ibooks","icns","ico",
    "ics","idx","iff","ifo","image","img","iml","in","inc","indd","inf","info","ini","inv","iso","j2","jar","java","jpe","jpeg","jpg","js",
    "json","jsp","jsx","key","kf8","kmk","ksh","kt","kts","kup","less","lex","licx","lisp","lit","lnk","lock","log","lua","m","m2v","m3u","m3u8",
    "m4","m4a","m4r","m4v","map","master","mc","md","mdb","mdf","me","mi","mid","midi","mk","mkv","mm","mng","mo","mobi","mod","mov","mp2","mp3",
    "mp4","mpa","mpd","mpe","mpeg","mpg","mpga","mpp","mpt","msg","msi","msu","nef","nes","nfo","nix","npmignore","ocx","odb","ods","odt","ogg",
    "ogv","ost","otf","ott","ova","ovf","p12","p7b","pages","part","pcd","pdb","pdf","pem","pfx","pgp","ph","phar","php","pid","pkg","pl","plist",
    "pm","png","po","pom","pot","potx","pps","ppsx","ppt","pptm","pptx","prop","ps","ps1","psd","psp","pst","pub","py","pyc","qt","ra","ram",
    "rar","raw","rb","rdf","rdl","reg","resx","retry","rm","rom","rpm","rpt","rsa","rss","rst","rtf","ru","rub","sass","scss","sdf","sed","sh",
    "sit","sitemap","skin","sldm","sldx","sln","sol","sphinx","sql","sqlite","step","stl","svg","swd","swf","swift","swp","sys","tar","tax",
    "tcsh","tex","tfignore","tga","tgz","tif","tiff","tmp","tmx","torrent","tpl","ts","tsv","ttf","twig","txt","udf","vb","vbproj","vbs","vcd",
    "vcf","vcs","vdi","vdx","vmdk","vob","vox","vscodeignore","vsd","vss","vst","vsx","vtx","war","wav","wbk","webinfo","webm","webp","wma",
    "wmf","wmv","woff","woff2","wps","wsf","xaml","xcf","xfl","xlm","xls","xlsm","xlsx","xlt","xltm","xltx","xml","xpi","xps","xrb","xsd","xsl",
    "xspf","xz","yaml","yml","z","zip","zsh"];

contentModule.compareDate = function(time1, time2){
    var date1 = time1.getDate()
    var date2 = time2.getDate();
    var month1 = time1.getMonth() + 1;
    var month2 = time2.getMonth() + 1;
    var year1 = time1.getFullYear();
    var year2 = time2.getFullYear();
    if (date1 == date2 && month1 == month2 && year1 == year2) return true;
    return false;
};

contentModule.getTimeMessage = function(timeview){
    var now = new Date();
    var res = "";
    var seenHours = timeview.getHours();
    if (seenHours < 10){
        seenHours = "0" + seenHours;
    }
    var seenMinutes = timeview.getMinutes();
    if (seenMinutes < 10){
        seenMinutes = "0" + seenMinutes;
    }
    return seenHours + ":" + seenMinutes;
};

contentModule.getTimeMessageList = function(timeview){
    var now = new Date();
    var res = "";
    var seenHours = timeview.getHours();
    if (seenHours < 10){
        seenHours = "0" + seenHours;
    }
    var seenMinutes = timeview.getMinutes();
    if (seenMinutes < 10){
        seenMinutes = "0" + seenMinutes;
    }
    var nowTime = now.getTime()/86400000;
    var seenTime = timeview.getTime()/86400000;
    var nowDate = now.getDate()
    var seenDate = timeview.getDate();
    var nowMonth = now.getMonth() + 1;
    var seenMonth = timeview.getMonth() + 1;
    var nowYear = now.getFullYear();
    var seenYear = timeview.getFullYear();
    if (nowYear == seenYear){
        if (nowMonth == seenMonth && nowDate == seenDate){
            res = seenHours + ":" + seenMinutes;
        }
        else if (nowTime - seenTime < 7){
            var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            res = weekday[timeview.getDay()];
        }
        else {
            res = contentModule.formatTimeDisplay(timeview);
        }
    }
    else {
        res = contentModule.formatTimeDisplay(timeview);
    }
    return res;
};

contentModule.getTimeMessageLine = function(timeview){
    var now = new Date();
    var res = "";
    var nowTime = now.getTime()/86400000;
    var seenTime = timeview.getTime()/86400000;
    var nowDate = now.getDate()
    var seenDate = timeview.getDate();
    var nowMonth = now.getMonth() + 1;
    var seenMonth = timeview.getMonth() + 1;
    var nowYear = now.getFullYear();
    var seenYear = timeview.getFullYear();
    if (nowYear == seenYear){
        if (nowMonth == seenMonth && nowDate == seenDate){
            res = "Today";
        }
        else if (nowTime - seenTime < 7){
            var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            res = weekday[timeview.getDay()];
        }
        else {
            res = contentModule.formatTimeDisplay(timeview);
        }
    }
    else {
        res = contentModule.formatTimeDisplay(timeview);
    }
    return res;
};

contentModule.makeAvatarUser = function(){
    var src;
    for (var i = 0; i < data_module.users.items.length; i++){
        if (data_module.users.items[i].avatar == ""){
            src = "avatar-default.png";
        }
        else {
            src = data_module.users.items[i].avatar;
        }
        data_module.users.items[i].avatarSrc = window.domainUser_avatars + src;
    }
};

contentModule.getAvatarUser = function(host, homeid){
    var userIndex = host.database.users.getByhomeid(homeid);
    var src;
    if (host.database.users.items[userIndex].avatar == ""){
        src = "avatar-default.png";
    }
    else {
        src = host.database.users.items[userIndex].avatar;
    }
    return window.domainUser_avatars + src;
};

contentModule.makeUserCalendarContent = function(host){
    for (var i = 0; i < host.database.user_calendar.items.length; i++){
        host.database.user_calendar.items[i].timestart = new Date(host.database.user_calendar.items[i].year, host.database.user_calendar.items[i].month, 0, 0, 0, 0, 0);
        host.database.user_calendar.items[i].timeend = new Date(host.database.user_calendar.items[i].year, host.database.user_calendar.items[i].month, 31, 0, 0, 0, 0);
        host.database.user_calendar.items[i].content = EncodingClass.string.toVariable(host.database.user_calendar.items[i].content);
    }
};

contentModule.makeKnowledgeGroupIndex = function(host){
    for (var i = 0; i < host.database.knowledge_groups.items.length; i++){
        host.database.knowledge_groups.items[i].childrenIndexList = [];
    }
    var k, t = [];
    for (var i = 0; i < host.database.knowledge_groups.items.length; i++){
        if (host.database.knowledge_groups.items[i].parentid == 0){
            host.database.knowledge_groups.items[i].parentIndex = -1;
            t.push(host.database.knowledge_groups.items[i]);
        }
        else {
            k = -1;
            for (var j = 0; j < t.length; j++){
                if (t[j].id == host.database.knowledge_groups.items[i].parentid){
                    k = j;
                    break;
                }
            }
            if (k >= 0){
                host.database.knowledge_groups.items[i].parentIndex = k;
                host.database.knowledge_groups.items[k].childrenIndexList.push(t.length);
                t.push(host.database.knowledge_groups.items[i]);
            }
        }
    }
    host.database.knowledge_groups.items = t;
};

contentModule.makeKnowledgeContentData = function(host, content){
    content.knowledge.getIndex = function(id){
        for (var i = 0; i < content.knowledge.length; i++){
            if (content.knowledge[i].id == id){
                return i;
            }
        }
        return -1;
    };
    for (var i = 0; i < content.knowledge.length; i++){
        content.knowledge[i].groupIndexList = [];
    }
    var k1, k2;
    for (var i = 0; i < content.knowledge_group_link.length; i++){
        content.knowledge_group_link[i].knowledgeIndex = k1 = content.knowledge.getIndex(content.knowledge_group_link[i].knowledgeid);
        content.knowledge_group_link[i].groupIndex = k2 = host.database.knowledge_groups.getIndex(content.knowledge_group_link[i].knowledge_groupid);
        if (k1 >= 0){
            while (k2 >= 0) {
                if (content.knowledge[k1].groupIndexList.indexOf(k2) < 0){
                    content.knowledge[k1].groupIndexList.push(k2);
                    k2 = host.database.knowledge_groups.items[k2].parentIndex;
                }
                else {
                    k2 = -1;
                }
            }
        }
    }
};

contentModule.makeBoardGroupIndex = function(host){
    for (var i = 0; i < data_module.board_groups.items.length; i++){
        data_module.board_groups.items[i].childrenIndexList = [];
    }
    var k, t = [];
    for (var i = 0; i < data_module.board_groups.items.length; i++){
        if (data_module.board_groups.items[i].parentid == 0){
            t.push(data_module.board_groups.items[i]);
        }
        else {
            k = -1;
            for (var j = 0; j < t.length; j++){
                if (t[j].id == data_module.board_groups.items[i].parentid){
                    k = j;
                    break;
                }
            }
            if (k >= 0){
                data_module.board_groups.items[i].parentIndex = k;
                data_module.board_groups.items[k].childrenIndexList.push(t.length);
                t.push(data_module.board_groups.items[i]);
            }
        }
    }
    data_module.board_groups.items = t;
};

contentModule.makeReportGroupIndex = function(host){
    for (var i = 0; i < data_module.report_groups.items.length; i++){
        data_module.report_groups.items[i].childrenIndexList = [];
    }
    var k, t = [];
    for (var i = 0; i < data_module.report_groups.items.length; i++){
        if (data_module.report_groups.items[i].parentid == 0){
            t.push(data_module.report_groups.items[i]);
        }
        else {
            k = -1;
            for (var j = 0; j < t.length; j++){
                if (t[j].id == data_module.report_groups.items[i].parentid){
                    k = j;
                    break;
                }
            }
            if (k >= 0){
                data_module.report_groups.items[i].parentIndex = k;
                data_module.report_groups.items[k].childrenIndexList.push(t.length);
                t.push(data_module.report_groups.items[i]);
            }
        }
    }
    data_module.report_groups.items = t;
};

contentModule.makeChat_session_membersIndex = function(host){
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        host.database.chat_sessions.items[i].chat_session_membersIndexList = [];
        host.database.chat_sessions.items[i].membersIdList = [];
        host.database.chat_sessions.items[i].mess_seen_id = 0;
    }
    var k;
    for (var i = 0; i < host.database.chat_session_members.items.length; i++){
        host.database.chat_session_members.items[i].sessionIndex = k = host.database.chat_sessions.getIndex(host.database.chat_session_members.items[i].sessionid);
        if (k >= 0){
            if (host.database.chat_session_members.items[i].userid == systemconfig.userid){
                host.database.chat_sessions.items[k].mess_seen_id = parseInt(host.database.chat_session_members.items[i].mess_seen_id, 10);
            }
            host.database.chat_sessions.items[k].chat_session_membersIndexList.push(i);
            host.database.chat_sessions.items[k].membersIdList.push(host.database.chat_session_members.items[i].userid);
        }
    }
};

contentModule.makeChatData = function(host){
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        host.database.chat_sessions.items[i].content = EncodingClass.string.toVariable(host.database.chat_sessions.items[i].content);
    }
    var k, archcontent, sesscontent;
    for (var i = 0; i < host.database.archived_chats.items.length; i++){
        host.database.archived_chats.items[i].sessionIndex = k = host.database.chat_sessions.getIndex(host.database.archived_chats.items[i].sessionid);
        host.database.archived_chats.items[i].content = EncodingClass.string.toVariable(host.database.archived_chats.items[i].content);
        host.database.chat_sessions.items[k].content = host.database.archived_chats.items[i].content.concat(host.database.chat_sessions.items[k].content);
    }
};

contentModule.makeChat_sessionsContent = function(host){
    host.database.chat_sessions.getByCardid = function(cardid){
        for (var i = 0; i < host.database.chat_sessions.items.length; i++){
            if (host.database.chat_sessions.items[i].cardid == cardid) return i;
        }
        return -1;
    };
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        host.database.chat_sessions.items[i].content = EncodingClass.string.toVariable(host.database.chat_sessions.items[i].content);
        host.database.chat_sessions.items[i].archivedIdList = [];
        host.database.chat_sessions.items[i].company_contactName = "";
    }
    var k1, k2;
    for (var i = 0; i < host.database.company_card.items.length; i++){
        k1 = host.database.chat_sessions.getByCardid(host.database.company_card.items[i].hostid);
        k2 = data_module.companies.getIndex(host.database.company_card.items[i].companyid);
        if (k1 >= 0 && k2 >= 0){
            host.database.chat_sessions.items[k1].company_contactName += " -- " + data_module.companies.items[k2].name;
        }
    }
    for (var i = 0; i < host.database.contact_card.items.length; i++){
        k1 = host.database.chat_sessions.getByCardid(host.database.contact_card.items[i].hostid);
        k2 = data_module.contact.getIndex(host.database.contact_card.items[i].contactid);
        if (k1 >= 0 && k2 >= 0){
            host.database.chat_sessions.items[k1].company_contactName += " -- " + data_module.contact.items[k2].firstname + " " + data_module.contact.items[k2].lastname;
        }
    }
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        host.database.chat_sessions.items[i].company_contactName = host.database.chat_sessions.items[i].company_contactName.substr(4);
    }
    var k, archcontent, sesscontent;
    for (var i = 0; i < host.database.archived_chats.items.length; i++){
        host.database.archived_chats.items[i].sessionIndex = k = host.database.chat_sessions.getIndex(host.database.archived_chats.items[i].sessionid);
        if (host.database.archived_chats.items[i].content !== undefined){
            host.database.archived_chats.items[i].content = EncodingClass.string.toVariable(host.database.archived_chats.items[i].content);
            host.database.chat_sessions.items[k].content = host.database.archived_chats.items[i].content.concat(host.database.chat_sessions.items[k].content);
        }
        else {
            host.database.chat_sessions.items[k].archivedIdList.push(host.database.archived_chats.items[i].id);
        }
    }
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        k = host.database.chat_sessions.items[i].content.length;
        if (k > 0){
            host.database.chat_sessions.items[i].lasttime = host.database.chat_sessions.items[i].content[k - 1].m_time;
        }
    }
};

contentModule.makeActivitiesCardIndex = function(host){
    var k;
    for (var i = 0; i < host.database.boards.items.length; i++){
        if (host.database.boards.items[i].userid == systemconfig.userid) host.database.boards.items[i].userPermistion = 1;
        else host.database.boards.items[i].userPermistion = 0;
    }
    for (var i = 0; i < host.database.list_member.items.length; i++){
        host.database.list_member.items[i].boardIndex = k = host.database.boards.getIndex(host.database.list_member.items[i].listid);
        if (k >= 0) host.database.boards.items[k].userPermistion = host.database.list_member.items[i].type;
    }
    for (var i = 0; i < host.database.boards.items.length; i++){
        host.database.boards.items[i].listIndexList = [];
    }
    for (var i = 0; i < host.database.lists.items.length; i++){
        host.database.lists.items[i].cardIndexList = [];
        host.database.lists.items[i].childIndexList = [];
    }
    for (var i = 0; i < host.database.cards.items.length; i++){
        host.database.cards.items[i].listIndex = k = host.database.lists.getIndex(host.database.cards.items[i].parentid);
        if (k >= 0){
            host.database.lists.items[k].cardIndexList.push(i);
        }
    }
    for (var i = 0; i < host.database.lists.items.length; i++){
        k = host.database.boards.getIndex(host.database.lists.items[i].parentid);
        if (k >= 0) {
            host.database.lists.items[i].boardIndex = k;
            host.database.boards.items[k].listIndexList.push(i);
        }
        else {
            k = host.database.lists.getIndex(host.database.lists.items[i].parentid);
            if (k >= 0) {
                host.database.lists.items[i].parentIndex = k;
                host.database.lists.items[k].childIndexList.push(i);
            }
        }
    }
    var ni, nj, nk;
    for (var i = 0; i < host.database.boards.items.length; i++){
        for (var j = 0; j < host.database.boards.items[i].listIndexList.length; j++){
            ni = host.database.boards.items[i].listIndexList[j];
            for (var k = 0; k < host.database.lists.items[ni].cardIndexList.length; k++){
                nj = host.database.lists.items[ni].cardIndexList[k];
                if (host.database.boards.items[i].userPermistion == 0){
                    if (host.database.cards.items[nj].userid != systemconfig.userid){
                        switch (host.database.boards.items[i].permission) {
                            case 0:
                                host.database.cards.items[nj].permission = "no";
                                break;
                            case 1:
                                host.database.cards.items[nj].permission = "view";
                                break;
                            case 2:
                                host.database.cards.items[nj].permission = "edit";
                                break;
                        }
                    }
                    else {
                        host.database.cards.items[nj].permission = "edit";
                    }
                }
                else {
                    host.database.cards.items[nj].permission = "edit";
                }
            }
            for (var k = 0; k < host.database.lists.items[ni].childIndexList.length; k++){
                nj = host.database.lists.items[ni].childIndexList[k];
                for (var l = 0; l < host.database.lists.items[nj].cardIndexList.length; l++){
                    nk = host.database.lists.items[nj].cardIndexList[l];
                    if (host.database.boards.items[i].userPermistion == 0){
                        if (host.database.cards.items[nk].userid != systemconfig.userid){
                            switch (host.database.boards.items[i].permission) {
                                case 0:
                                    host.database.cards.items[nk].permission = "no";
                                    break;
                                case 1:
                                    host.database.cards.items[nk].permission = "view";
                                    break;
                                case 2:
                                    host.database.cards.items[nk].permission = "edit";
                                    break;
                            }
                        }
                        else {
                            host.database.cards.items[nk].permission = "edit";
                        }
                    }
                    else {
                        host.database.cards.items[nk].permission = "edit";
                    }
                }
            }
        }
    }
    for (var i = 0; i < host.database.cards.items.length; i++){
        host.database.cards.items[i].company_contactName = "";
    }
    var k1, k2;
    for (var i = 0; i < host.database.company_card.items.length; i++){
        host.database.company_card.items[i].cardIndex = k1 = host.database.cards.getIndex(host.database.company_card.items[i].hostid);
        host.database.company_card.items[i].companyIndex = k2 = data_module.companies.getIndex(host.database.company_card.items[i].companyid);
        if (k1 >= 0 && k2 >= 0){
            host.database.cards.items[k1].company_contactName += " -- " + data_module.companies.items[k2].name;
        }
    }
    for (var i = 0; i < host.database.contact_card.items.length; i++){
        host.database.contact_card.items[i].cardIndex = k1 = host.database.cards.getIndex(host.database.contact_card.items[i].hostid);
        host.database.contact_card.items[i].contactIndex = k2 = data_module.contact.getIndex(host.database.contact_card.items[i].contactid);
        if (k1 >= 0 && k2 >= 0){
            host.database.cards.items[k1].company_contactName += " -- " + data_module.contact.items[k2].firstname + " " + data_module.contact.items[k2].lastname;
        }
    }
    for (var i = 0; i < host.database.cards.items.length; i++){
        host.database.cards.items[i].company_contactName = host.database.cards.items[i].company_contactName.substr(4);
        if (host.database.cards.items[i].company_contactName.length > 100) host.database.cards.items[i].company_contactName = host.database.cards.items[i].company_contactName.substr(0, 100) + "..."
    }
};

contentModule.makeCardActivitiesData = function(host){
    var index1, index2;
    for (var i = 0; i < host.database.obj_list.items.length; i++){
        index1 = host.database.cards.getIndex(host.database.obj_list.items[i].listid);
        index2 = host.database.objects.getIndex(host.database.obj_list.items[i].objid);
        if(index1 != -1 && index2 != -1){
            host.database.cards.items[index1].activitiesList.push(host.database.obj_list.items[i].objid);
            switch (host.database.objects.items[index2].type) {
                case 'task':
                    host.database.cards.items[index1].taskList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'meeting':
                    host.database.cards.items[index1].meetingList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'call':
                    host.database.cards.items[index1].callList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'file':
                    host.database.cards.items[index1].fileList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'field':
                    host.database.cards.items[index1].fieldList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'wait':
                    host.database.cards.items[index1].waitList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'checklist':
                    host.database.cards.items[index1].check_listList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'chat':
                    host.database.cards.items[index1].chatList.push(host.database.obj_list.items[i].objid);
                    break;
                case 'note':
                    host.database.cards.items[index1].noteList.push(host.database.obj_list.items[i].objid);
                    break;
                default:

            }
        }
    }
};

contentModule.makeContactCardData = function(host){
    var index1, index2;
    for (var i = 0; i < host.database.contact_card.items.length; i++){
        index1 = host.database.cards.getIndex(host.database.contact_card.items[i].hostid);
        index2 = host.database.contact.getIndex(host.database.contact_card.items[i].contactid);
        if(index1 != -1 && index2 != -1){
            host.database.cards.items[index1].contactList.push(host.database.contact_card.items[i].contactid);
        }
    }
};

contentModule.makeCompaniesCardData = function(host){
    var index1, index2;
    for (var i = 0; i < host.database.companies_card.items.length; i++){
        index1 = host.database.cards.getIndex(host.database.companies_card.items[i].hostid);
        index2 = host.database.companies.getIndex(host.database.companies_card.items[i].companyid);
        if(index1 != -1 && index2 != -1){
            host.database.cards.items[index1].companyList.push(host.database.companies_card.items[i].companyid);
        }
    }
};

contentModule.filterEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

contentModule.object_selectionName = function(object_selection){
    switch (object_selection) {
        case "object":
            return LanguageModule.text("txt_object");
        case "field":
            return LanguageModule.text("txt_activity");
        case "other":
            return LanguageModule.text("txt_other");
    }
};
contentModule.typelists = function(){
    var typelists = [
        {id: -1, name: LanguageModule.text("txt_string"), type: "string"},
        {id: -2, name: LanguageModule.text("txt_textarea"), type: "note"},
        {id: -3, name: LanguageModule.text("txt_number"), type: "number"},
        {id: -4, name: LanguageModule.text("txt_date"), type: "date"},
        {id: -5, name: LanguageModule.text("txt_date_time"), type: "datetime"},
        {id: -6, name: LanguageModule.text("txt_checkbox"), type: "boolean"},
        {id: -7, name: LanguageModule.text("txt_email"), type: "email"},
        {id: -8, name: LanguageModule.text("txt_user"), type: "user"},
        {id: -9, name: LanguageModule.text("txt_userlist"), type: "userlist"},
        {id: -10, name: LanguageModule.text("txt_phone_number"), type: "phonenumber"},
        {id: -11, name: LanguageModule.text("txt_website"), type: "website"},
        {id: -12, name: LanguageModule.text("txt_gps"), type: "gps"},
        {id: -14, name: LanguageModule.text("txt_nations"), type: 'nation'},
        {id: -15, name: LanguageModule.text("txt_city"), type: 'city'},
        {id: -13, name: LanguageModule.text("txt_status"), type: 'enum', object_selection: "activity", content: {
            typeof: -1,
            details: [
                {localid: "type_status_plan", text: LanguageModule.text("txt_plan"), value: 1},
                {localid: "type_status_success", text: LanguageModule.text("txt_success"), value: 2},
                {localid: "type_status_cancel", text: LanguageModule.text("txt_cancel"), value: 3}
            ]
        }},
        {id: -17, name: LanguageModule.text("txt_reminder"), type: 'enum', object_selection: "activity", content: {
            typeof: -1,
            details: [
                {localid: "type_reminder_none", text: LanguageModule.text("txt_no_reminder"), value: 0},
                {localid: "type_reminder_15_minutes", text: LanguageModule.text("txt_15_minutes"), value: 1},
                {localid: "type_reminder_30_minutes", text: LanguageModule.text("txt_30_minutes"), value: 2},
                {localid: "type_reminder_1_hour", text: LanguageModule.text("txt_1_hour"), value: 3},
                {localid: "type_reminder_2_hours", text: LanguageModule.text("txt_2_hours"), value: 4},
                {localid: "type_reminder_4_hours", text: LanguageModule.text("txt_4_hours"), value: 5},
                {localid: "type_reminder_8_hours", text: LanguageModule.text("txt_8_hours"), value: 6},
                {localid: "type_reminder_1_day", text: LanguageModule.text("txt_1_day"), value: 7},
                {localid: "type_reminder_2_days", text: LanguageModule.text("txt_2_days"), value: 8},
                {localid: "type_reminder_4_days", text: LanguageModule.text("txt_4_days"), value: 9},
                {localid: "type_reminder_8_days", text: LanguageModule.text("txt_8_days"), value: 10}
            ]
        }},
        {id: -18, name: LanguageModule.text("txt_task"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_work"), localid: 'type_task_work', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_result"), localid: 'type_task_result', type: -2, default: "", require: false, decpre: 0},
                // {name: LanguageModule.text("txt_status"), localid: 'type_task_status', type: -13, default: 'type_status_plan', require: false, decpre: 0},
                {name: LanguageModule.text("txt_success"), localid: 'type_task_status', type: -6, default: false, require: false, decpre: 0},
                {name: LanguageModule.text("txt_due_date"), localid: 'type_task_due_date', type: -5, default: ["custom", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_reminder"), localid: 'type_task_reminder', type: -17, default: 'type_reminder_none', require: false, decpre: 0},
                {name: LanguageModule.text("txt_assigned_to"), localid: 'type_task_assigned_to', type: -8, default: 1, require: false, decpre: 0},
                {name: LanguageModule.text("txt_participant"), localid: 'type_task_participant', type: -9, default: [], require: false, decpre: 0},
                {name: LanguageModule.text("txt_created"), localid: 'type_task_created', type: -4, default: ["today", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_user_created"), localid: 'type_task_user_created', type: -8, default: 1, require: false, decpre: 0}
            ]
        }},
        {id: -19, name: LanguageModule.text("txt_type"), type: 'enum', object_selection: "activity", content: {
            typeof: -1,
            details: [
                {localid: "type_visit", text: LanguageModule.text("txt_visit"), value: 1},
                {localid: "type_online", text: LanguageModule.text("txt_online"), value: 2}
            ]
        }},
        {id: -20, name: LanguageModule.text("txt_meeting"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_meeting_name"), localid: 'type_meeting_name', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_location"), localid: 'type_meeting_location', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_result"), localid: 'type_meeting_result', type: -2, default: "", require: false, decpre: 0},
                // {name: LanguageModule.text("txt_status"), localid: 'type_meeting_status', type: -13, default: 'type_status_plan', require: false, decpre: 0},
                {name: LanguageModule.text("txt_success"), localid: 'type_meeting_status', type: -6, default: false, require: false, decpre: 0},
                {name: LanguageModule.text("txt_type"), localid: 'type_meeting_type', type: -19, default: 'type_visit', require: false, decpre: 0},
                {name: LanguageModule.text("txt_start_date"), localid: 'type_meeting_start_date', type: -5, default: ["custom", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_due_date"), localid: 'type_meeting_end_date', type: -5, default: ["custom", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_all_day"), localid: 'type_meeting_all_day', type: -6, default: false, require: false, decpre: 0},
                {name: LanguageModule.text("txt_reminder"), localid: 'type_meeting_reminder', type: -17, default: 'type_reminder_none', require: false, decpre: 0},
                {name: LanguageModule.text("txt_assigned_to"), localid: 'type_meeting_assigned_to', type: -8, default: 1, require: false, decpre: 0},
                {name: LanguageModule.text("txt_participant"), localid: 'type_meeting_participant', type: -9, default: [], require: false, decpre: 0},
                {name: LanguageModule.text("txt_created"), localid: 'type_meeting_created', type: -4, default: ["today", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_user_created"), localid: 'type_meeting_user_created', type: -8, default: 1, require: false, decpre: 0}
            ]
        }},
        {id: -21, name: LanguageModule.text("txt_note"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_work"), localid: 'type_note_work', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_note"), localid: 'type_note_note', type: -2, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_created"), localid: 'type_note_created', type: -4, default: ["today", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_user_created"), localid: 'type_note_user_created', type: -8, default: 1, require: false, decpre: 0}
            ]
        }},
        {id: -22, name: LanguageModule.text("txt_call"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_call_to"), localid: 'type_call_call_to', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_work"), localid: 'type_call_work', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_result"), localid: 'type_call_result', type: -2, default: "", require: false, decpre: 0},
                // {name: LanguageModule.text("txt_status"), localid: 'type_call_status', type: -13, default: 'type_status_plan', require: false, decpre: 0},
                {name: LanguageModule.text("txt_success"), localid: 'type_call_status', type: -6, default: false, require: false, decpre: 0},
                {name: LanguageModule.text("txt_call_date"), localid: 'type_call_due_date', type: -5, default: ["custom", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_reminder"), localid: 'type_call_reminder', type: -17, default: 'type_reminder_none', require: false, decpre: 0},
                {name: LanguageModule.text("txt_assigned_to"), localid: 'type_call_assigned_to', type: -8, default: 1, require: false, decpre: 0},
                {name: LanguageModule.text("txt_created"), localid: 'type_call_created', type: -4, default: ["today", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_user_created"), localid: 'type_call_user_created', type: -8, default: 1, require: false, decpre: 0}
            ]
        }},
        {id: -23, name: LanguageModule.text("txt_wait"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_duration"), localid: 'type_wait_duration', type: -3, default: 1, require: false, decpre: 0},
                {name: LanguageModule.text("txt_message"), localid: 'type_wait_message', type: -2, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_created"), localid: 'type_wait_created', type: -4, default: ["today", new Date()], require: true, decpre: 0},
                {name: LanguageModule.text("txt_user_created"), localid: 'type_wait_user_created', type: -8, default: 1, require: false, decpre: 0}
            ]
        }},
        {id: -16, name: LanguageModule.text("txt_check_list_item"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_name"), localid: 'type_check_list_item_name', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_index"), localid: 'type_check_list_item_index', type: -3, default: 1, require: false, decpre: 0},
                {name: LanguageModule.text("txt_success"), localid: 'type_check_list_item_success', type: -6, default: false, require: false, decpre: 0},
                {name: LanguageModule.text("txt_due_date"), localid: 'type_check_list_item_due_date', type: -5, default: ["custom", new Date()], require: false, decpre: 0},
                {name: LanguageModule.text("txt_reminder"), localid: 'type_check_list_item_reminder', type: -17, default: 'type_reminder_none', require: false, decpre: 0},
                {name: LanguageModule.text("txt_assigned_to"), localid: 'type_check_list_item_assigned_to', type: -8, default: 1, require: false, decpre: 0}
            ]
        }},
        {id: -24, name: LanguageModule.text("txt_check_list_item_array"), type: 'array', object_selection: "activity", content: {typeof: -16}},
        {id: -25, name: LanguageModule.text("txt_check_list"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_name"), localid: 'type_check_list_name', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_items"), localid: 'type_check_list_items', type: -24, default: [], require: false, decpre: 0},
                {name: LanguageModule.text("txt_created"), localid: 'type_check_list_created', type: -4, default: ["today", new Date()], require: true, decpre: 0},
                {name: LanguageModule.text("txt_user_created"), localid: 'type_check_list_user_created', type: -8, default: 1, require: false, decpre: 0}
            ]
        }},
        {id: -26, name: LanguageModule.text("txt_file"), type: 'structure', object_selection: "activity", content: {
            details: [
                {name: LanguageModule.text("txt_title"), localid: 'type_file_title', type: -1, default: "", require: false, decpre: 0},
                {name: LanguageModule.text("txt_filename"), localid: 'type_file_name', type: -1, default: [], require: false, decpre: 0}
            ]
        }}
    ];
    for (var i = 0; i < typelists.length; i++){
        typelists[i].userid = systemconfig.userid;
        if (!typelists[i].object_selection) typelists[i].object_selection = "other";
        typelists[i].available = 1;
        typelists[i].comment = "";
    }
    return typelists;
};

contentModule.getUsernameByhomeid2 = function(users, homeid){
    for (var i = 0; i < users.items.length; i++){
        if (users.items[i].homeid == homeid) return users.items[i].username;
    }
    return "";
};

contentModule.getUsernameFullnameByhomeid = function(users, homeid){
    for (var i = 0; i < users.items.length; i++){
        if (users.items[i].homeid == homeid) return users.items[i].username + " - " + users.items[i].fullname;
    }
    return "";
};

contentModule.getFullnameByhomeid2 = function(users, homeid){
    for (var i = 0; i < users.items.length; i++){
        if (users.items[i].homeid == homeid) return users.items[i].fullname;
    }
    return "";
};

contentModule.makeCitiesIndex = function(){
    if (data_module.cities.isMakeIndex) return;
    var k, t = [];
    data_module.nations.items.sort(function (a, b) {
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
        return 0;
    });
    data_module.cities.items.sort(function (a, b) {
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
        return 0;
    });
    for (var i = 0; i < data_module.nations.items.length; i++){
        data_module.nations.items[i].cityIndexList = [];
    }
    for (var i = 0; i < data_module.cities.items.length; i++){
        data_module.cities.items[i].nationIndex = k = data_module.nations.getIndex(data_module.cities.items[i].nationid);
        if (k >= 0){
            data_module.nations.items[k].cityIndexList.push(t.length);
            t.push(data_module.cities.items[i]);
        }
    }
    data_module.cities.items = t;
    data_module.cities.isMakeIndex = true;
};

contentModule.makeDistrictsIndex = function(){
    if (data_module.districts.isMakeIndex) return;
    data_module.districts.items.sort(function (a, b) {
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
        return 0;
    });
    for (var i = 0; i < data_module.cities.items.length; i++){
        data_module.cities.items[i].districtIndexList = [];
    }
    var k, k2, t = [];
    for (var i = 0; i < data_module.districts.items.length; i++){
        data_module.districts.items[i].cityIndex = k = data_module.cities.getIndex(data_module.districts.items[i].cityid);
        data_module.districts.items[i].nationIndex = k2 = data_module.nations.getIndex(data_module.districts.items[i].nationid);
        if (k >= 0 && k2 >= 0){
            data_module.cities.items[k].districtIndexList.push(t.length);
            t.push(data_module.districts.items[i]);
        }
    }
    data_module.districts.items = t;
    data_module.districts.isMakeIndex = true;
};

contentModule.makeFormats_list = function(host){
    var index1, index2;
    for (var i = 0; i < host.database.formats_list.items.length; i++){
        index1 = host.database.formats.getIndex(host.database.formats_list.items[i].formatid);
        index2 = host.database.boards.getIndex(host.database.formats_list.items[i].listid);
        if (index1 != -1 && index2 != -1){
            host.database.boards.items[index2].formatid = host.database.formats_list.items[i].formatid;
        }
    }
};

contentModule.makeTypesListContent = function(){
    if (!LanguageModule || !LanguageModule.text){
        setTimeout(function(){
            contentModule.makeTypesListContent();
        }, 30);
        return;
    }
    var typeHasContent = ["array", "enum", "structure"];
    for (var i = 0; i < data_module.typelists.items.length; i++){
        if (typeHasContent.indexOf(data_module.typelists.items[i].type) >= 0){
            if (data_module.typelists.items[i].content instanceof Object) continue;
            data_module.typelists.items[i].content = EncodingClass.string.toVariable(data_module.typelists.items[i].content);
        }
    }
    var typelists = contentModule.typelists();
    for (var i = 0; i < typelists.length; i++){
        data_module.typelists.items.unshift(typelists[i]);
    }
};

contentModule.makeCompanyIndex = function(){
    if (data_module.companies.isMakeIndex) return;
    data_module.companies.items.sort(function (a, b) {
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
        return 0;
    });
    var k1, k2, t = [], k3, k4;
    for (var i = 0; i < data_module.companies.items.length; i++){
        data_module.companies.items[i].nationIndex = k1 = data_module.nations.getIndex(data_module.companies.items[i].nationid);
        data_module.companies.items[i].cityIndex = k2 = data_module.cities.getIndex(data_module.companies.items[i].cityid);
        data_module.companies.items[i].districtIndex = k4 = data_module.districts.getIndex(data_module.companies.items[i].districtid);
        data_module.companies.items[i].company_classIndex = k3 = data_module.company_class.getIndex(data_module.companies.items[i].company_classid);
        if ((k4 >= 0 || data_module.companies.items[i].districtid == 0) && (k1 >= 0 || data_module.companies.items[i].nationid == 0) && (k2 >= 0 || data_module.companies.items[i].cityid == 0) && (k3 >= 0 || data_module.companies.items[i].company_classid == 0)){
            t.push(data_module.companies.items[i]);
        }
    }
    data_module.companies.items = t;
    data_module.companies.isMakeIndex = true;
};

contentModule.makeReportToUser = function(){
    for (var i = 0; i < data_module.users.items.length; i++){
        data_module.users.items[i].childIndexList = [];
        data_module.users.items[i].descendanIdList = [];
    }
    var k;
    for (var i = 0; i < data_module.users.items.length; i++){
        if (data_module.users.items[i].report_to == 0) continue;
        k = data_module.users.getByhomeid(data_module.users.items[i].report_to);
        if (k >= 0) data_module.users.items[k].childIndexList.push(i);
    }
    var getChildFunc = function(index){
        for (var i = 0; i < data_module.users.items[index].childIndexList.length; i++){
            data_module.users.items[index].descendanIdList.push(data_module.users.items[data_module.users.items[index].childIndexList[i]].homeid);
            data_module.users.items[index].descendanIdList = data_module.users.items[index].descendanIdList.concat(getChildFunc(data_module.users.items[index].childIndexList[i]));
        }
        return data_module.users.items[index].descendanIdList;
    };
    var buf = [];
    for (var i = 0; i < data_module.users.items.length; i++){
        if (data_module.users.items[i].report_to == 0) buf.push(i);
    }
    for (var i = 0; i < buf.length; i++){
        getChildFunc(buf[i]);
    }
    data_module.users.isMakeIndex = true;
};

contentModule.makeOwnerCompanyContact = function(){
    if (!data_module.contact || !data_module.companies || !data_module.users || !data_module.owner_company_contact){
        setTimeout(function(){
            contentModule.makeOwnerCompanyContact();
        }, 50);
        return;
    }
    for (var i = 0; i < data_module.companies.items.length; i++){
        data_module.companies.items[i].ownerList = [];
    }
    for (var i = 0; i < data_module.contact.items.length; i++){
        data_module.contact.items[i].ownerList = [];
    }
    var k;
    for (var i = 0; i < data_module.owner_company_contact.items.length; i++){
        if (data_module.owner_company_contact.items[i].type == "contact"){
            k = data_module.contact.getIndex(data_module.owner_company_contact.items[i].objid);
            if (k >= 0) data_module.contact.items[k].ownerList.push(data_module.owner_company_contact.items[i].userid);
        }
        else {
            k = data_module.companies.getIndex(data_module.owner_company_contact.items[i].objid);
            if (k >= 0) data_module.companies.items[k].ownerList.push(data_module.owner_company_contact.items[i].userid);
        }
    }
    contentModule.makeReportToUser();
    var userIndex = data_module.users.getByhomeid(systemconfig.userid);
    if (userIndex < 0){
        ModalElement.alert({message: "faild_userid"});
        return;
    }
    var descendanIdList = data_module.users.items[userIndex].descendanIdList;
    var isViewCompany = function(cIndex){
        for (var i = 0; i < data_module.companies.items[cIndex].ownerList.length; i++){
            if (data_module.companies.items[cIndex].ownerList[i] == systemconfig.userid) return true;
            for (var j = 0; j < descendanIdList.length; j++){
                if (data_module.companies.items[cIndex].ownerList[i] == descendanIdList[j]) return true;
            }
        }
        return false;
    };
    var t = [];
    for (var i = 0; i < data_module.companies.items.length; i++){
        if (isViewCompany(i)){
            t.push(data_module.companies.items[i]);
        }
    }
    data_module.companies.items = t;
    var isViewContact = function(cIndex){
        for (var i = 0; i < data_module.contact.items[cIndex].ownerList.length; i++){
            if (data_module.contact.items[cIndex].ownerList[i] == systemconfig.userid) return true;
            for (var j = 0; j < descendanIdList.length; j++){
                if (data_module.contact.items[cIndex].ownerList[i] == descendanIdList[j]) return true;
            }
        }
        return false;
    };
    t = [];
    for (var i = 0; i < data_module.contact.items.length; i++){
        if (isViewContact(i)){
            t.push(data_module.contact.items[i]);
        }
    }
    data_module.contact.items = t;
};

contentModule.makeContactIndex = function(){
    if (data_module.contact.isMakeIndex) return;
    if (data_module.companies.isMakeIndex === undefined){
        data_module.companies.items.sort(function (a, b) {
            if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) > absol.string.nonAccentVietnamese(a.name.toLowerCase())) return -1;
            if (absol.string.nonAccentVietnamese(b.name.toLowerCase()) < absol.string.nonAccentVietnamese(a.name.toLowerCase())) return 1;
            return 0;
        });
    }
    data_module.contact.items.sort(function (a, b) {
        if (absol.string.nonAccentVietnamese(b.firstname.toLowerCase()) > absol.string.nonAccentVietnamese(a.firstname.toLowerCase())) return -1;
        if (absol.string.nonAccentVietnamese(b.firstname.toLowerCase()) < absol.string.nonAccentVietnamese(a.firstname.toLowerCase())) return 1;
        return 0;
    });
    var k, t = [];
    for (var i = 0; i < data_module.contact.items.length; i++){
        data_module.contact.items[i].companyIndex = k = data_module.companies.getIndex(data_module.contact.items[i].companyid);
        if (k >= 0 || data_module.contact.items[i].companyid == 0){
            t.push(data_module.contact.items[i]);
        }
    }
    data_module.contact.items = t;
    data_module.contact.isMakeIndex = true;
};

contentModule.makeObjectIndex = function(host){
    for (var i = 0; i < host.database.objects.items.length; i++){
        host.database.objects.items[i].childrenIndexList = [];
        host.database.objects.items[i].categoryIndexList = [];
    }
    var k, t = [];
    for (var i = 0; i < host.database.objects.items.length; i++){
        host.database.objects.items[i].typeIndex = k = data_module.typelists.getIndex(host.database.objects.items[i].typeid);
        if (k < 0) continue;
        if (host.database.objects.items[i].parentid == 0){
            t.push(host.database.objects.items[i]);
        }
        else {
            k = -1;
            for (var j = 0; j < t.length; j++){
                if (t[j].id == host.database.objects.items[i].parentid){
                    k = j;
                    break;
                }
            }
            if (k >= 0){
                host.database.objects.items[i].parentIndex = k;
                host.database.objects.items[k].childrenIndexList.push(t.length);
                t.push(host.database.objects.items[i]);
            }
        }
    }
    host.database.objects.items = t;
    var oIndex, cIndex;
    for (var i = 0; i < host.database.category_objects.items.length; i++){
        oIndex = host.database.objects.getIndex(host.database.category_objects.items[i].objid);
        cIndex = host.database.category.getIndex(host.database.category_objects.items[i].categoryid);
        if (oIndex >= 0 && cIndex >= 0){
            host.database.objects.items[oIndex].categoryIndexList.push({
                categoryIndex: cIndex,
                category_objectsIndex: i
            });
        }
    }
};

contentModule.makeCategoryIndex = function(host){
    for (var i = 0; i < host.database.category.items.length; i++){
        host.database.category.items[i].childrenIndexList = [];
    }
    var k, t = [];
    for (var i = 0; i < host.database.category.items.length; i++){
        if (host.database.category.items[i].parentid == 0){
            t.push(host.database.category.items[i]);
        }
        else {
            k = -1;
            for (var j = 0; j < t.length; j++){
                if (t[j].id == host.database.category.items[i].parentid){
                    k = j;
                    break;
                }
            }
            if (k >= 0){
                host.database.category.items[i].parentIndex = k;
                host.database.category.items[k].childrenIndexList.push(t.length);
                t.push(host.database.category.items[i]);
            }
        }
    }
    host.database.category.items = t;
};

contentModule.makeField_list = function(host){
    var index;
    for (var i = 0; i < host.database.field_list.items.length; i++){
        index = host.database.boards.getIndex(host.database.field_list.items[i].hostid);
        if (index != -1){
            host.database.boards.items[index].fieldIdList.push(host.database.field_list.items[i].typeid);
        }
    }
};

contentModule.makeCategory_board = function(host){
    var index;
    for (var i = 0; i < host.database.category_board.items.length; i++){
        index = host.database.boards.getIndex(host.database.category_board.items[i].hostid);
        if (index != -1){
            host.database.boards.items[index].categoryIdList.push(host.database.category_board.items[i].categoryid);
        }
    }
};

contentModule.makeCategoryData = function(host){
    var index, t, parentid;
    t = [];
    for (var i = 0; i < host.database.category.items.length; i++){
        host.database.category.items[i].childrenIdList = [];
        parentid = host.database.category.items[i].parentid;
        if (parentid != 0){
            index = host.database.category.getIndex(parentid);
            if (index != -1){
                host.database.category.items[index].childrenIdList.push(host.database.category.items[i].id);
                t.push(host.database.category.items[i]);
            }
        }
        else t.push(host.database.category.items[i]);
    }
    host.database.category.items = t;
};

contentModule.makeListsIndex = function(host){
    var index, t;
    for (var i = 0; i < host.database.boards.items.length; i++){
        host.database.boards.items[i].childrenIdList = [];
        host.database.boards.items[i].categoryIdList = [];
        host.database.boards.items[i].fieldIdList = [];
        host.database.boards.items[i].memberList = [];
        host.database.boards.items[i].cardIdList = [];
    }
    // t = [];
    for (var i = 0; i < host.database.lists.items.length; i++){
        index = host.database.boards.getIndex(host.database.lists.items[i].parentid);
        if (index != -1){
            host.database.lists.items[i].boardid = host.database.lists.items[i].parentid;
            host.database.boards.items[index].childrenIdList.push(host.database.lists.items[i].id);
            // t.push(host.database.lists.items[i]);
        }
    }
    // host.database.lists.items = t;
};

contentModule.makeListsIndex2 = function(host){
    var index, t;
    for (var i = 0; i < host.database.lists.items.length; i++){
        host.database.lists.items[i].childrenIdList = [];
    }
    for (var i = 0; i < host.database.lists.items.length; i++){
        index = host.database.lists.getIndex(host.database.lists.items[i].parentid);
        if (index != -1){
            host.database.lists.items[i].boardid = host.database.lists.items[index].boardid;
            host.database.lists.items[index].childrenIdList.push(host.database.lists.items[i].id);
        }
    }
};

contentModule.makeListsIndex3 = function(host){
    var index, t, index2;
    for (var i = 0; i < host.database.cards.items.length; i++){
        host.database.cards.items[i].contactList = [];
        host.database.cards.items[i].companyList = [];
        index = host.database.lists.getIndex(host.database.cards.items[i].parentid);
        if (index != -1){
            index2 = host.database.boards.getIndex(host.database.lists.items[index].boardid);
            if (index2 != -1){
                host.database.boards.items[index2].cardIdList.push(host.database.cards.items[i].id);
            }
            host.database.cards.items[i].boardid = host.database.lists.items[index].boardid;
        }
    }
};

contentModule.makeChatCardIndex = function(host){
    for (var i = 0; i < host.database.cards.items.length; i++){
        host.database.cards.items[i].chatIndex = -1;
    }
    var k;
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        host.database.chat_sessions.items[i].cardIndex = k = host.database.cards.getIndex(host.database.chat_sessions.items[i].cardid);
        if (k >= 0) host.database.cards.items[k].chatIndex = i;
    }
};

contentModule.makeCardIndex = function(host){
    var index, t;
    for (var i = 0; i < host.database.cards.items.length; i++){
        host.database.cards.items[i].contactList = [];
        host.database.cards.items[i].companyList = [];
        host.database.cards.items[i].activitiesList = [];
        host.database.cards.items[i].taskList = [];
        host.database.cards.items[i].callList = [];
        host.database.cards.items[i].meetingList = [];
        host.database.cards.items[i].chatList = [];
        host.database.cards.items[i].fileList = [];
        host.database.cards.items[i].waitList = [];
        host.database.cards.items[i].fieldList = [];
        host.database.cards.items[i].check_listList = [];
        host.database.cards.items[i].noteList = [];
        index = host.database.lists.getIndex(host.database.cards.items[i].parentid);
        if (index != -1){
            host.database.lists.items[index].childrenIdList.push(host.database.cards.items[i].id);
        }
    }
};

contentModule.makeBoardStatusIndex = function(host){
    var index;
    for (var i = 0; i < host.database.statusgroups.items.length; i++){
        host.database.statusgroups.items[i].boardIdList = [];
    }
    for (var i = 0; i < host.database.boards.items.length; i++){
        index = host.database.statusgroups.getIndex(host.database.boards.items[i].statusid);
        if (index != -1){
            host.database.statusgroups.items[index].boardIdList.push(host.database.boards.items[i].id);
        }
    }
}

contentModule.makeStatusIndex = function(host){
    var index, t;
    for (var i = 0; i < host.database.statusgroups.items.length; i++){
        host.database.statusgroups.items[i].statusIdList = [];
    }
    t = [];
    host.database.status.items.sort(function(a, b){
        if (a.statusgroupid > b.statusgroupid) return 1;
        if (a.statusgroupid < b.statusgroupid) return -1;
        if (a.index > b.index) return 1;
        if (a.index < b.index) return -1;
        return 0;
    });
    for (var i = 0; i < host.database.status.items.length; i++){
        index = host.database.statusgroups.getIndex(host.database.status.items[i].statusgroupid);
        if (index != -1){
            host.database.statusgroups.items[index].statusIdList.push(host.database.status.items[i].id);
            t.push(host.database.status.items[i]);
        }
    }
    host.database.status.items = t;
}

contentModule.getUsernameByhomeid = function(host, homeid){
    for (var i = 0; i < host.database.users.items.length; i++){
        if (host.database.users.items[i].homeid == homeid) return host.database.users.items[i].username;
    }
    return "";
};

contentModule.getUsernameByhomeidFromDataModule = function(homeid){
    for (var i = 0; i < data_module.users.items.length; i++){
        if (data_module.users.items[i].homeid == homeid) return data_module.users.items[i].username;
    }
    return "";
};

contentModule.availableName = function(available){
    var a = [LanguageModule.text("txt_no"), LanguageModule.text("txt_yes")];
    return a[available];
};

contentModule.makeDatabaseContent = function(database, content){
    var key = Object.keys(content);
    key.forEach(function(elt){
        database[elt] = {};
        database[elt].items = content[elt];
        database[elt].getIndex = function(id){
            for (var i = 0; i < database[elt].items.length; i++){
                if (database[elt].items[i].id == id){
                    return i;
                }
            }
            return - 1;
        };
    });
};

contentModule.generateLanguageList = function () {
    var i, list = [];
    for (i = 0; i < LanguageModule.code.length; i++) {
        list.push({
            value: LanguageModule.code[i].name,
            text: LanguageModule.code[i].value
        });
    }
    return list;
};

contentModule.preventNotNumberInput = function(elt) {
    function getCaretPosition(oField) {
        var iCaretPos = 0;
        if (document.selection) {
            oField.focus();
            var oSel = document.selection.createRange();
            oSel.moveStart('character', -oField.value.length);
            iCaretPos = oSel.text.length;
        }
        else if (oField.selectionStart || oField.selectionStart == '0')
            iCaretPos = oField.selectionDirection == 'backward' ? oField.selectionStart : oField.selectionEnd;
        return iCaretPos;
    }

    elt.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = "";
        if (e.clipboardData && e.clipboardData.getData) {
            text = e.clipboardData.getData("text/plain");

        } else if (window.clipboardData && window.clipboardData.getData) {
            text = window.clipboardData.getData("Text");
        }
        var matched = text.match(/[+-]?([0-9,]*[.])?[0-9,]+/);
        if (matched) {
            this.value = matched[0];
        }
    });
    elt.addEventListener('keydown', function (event) {
        var key = event.key;
        if (key && key.length == 1 && !event.ctrlKey && !event.altKey) {
            if (key.match(/[0-9,.\-\+]/)) {
                if (key == '.' && this.value.indexOf('.') >= 0) event.preventDefault();
                if ((key == '+' || key == '-') && (this.value.indexOf('+') >= 0 || this.value.indexOf('-') >= 0 || getCaretPosition(this) > 0)) event.preventDefault();
            }
            else event.preventDefault();
        }
    });
    return elt;
};

contentModule.preventNotWebsiteInput = function(elt){
    elt.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = "";
        if (e.clipboardData && e.clipboardData.getData) {
            text = e.clipboardData.getData("text/plain");

        } else if (window.clipboardData && window.clipboardData.getData) {
            text = window.clipboardData.getData("Text");
        }
        var slstart = elt.selectionStart;
        var slend = elt.selectionEnd;
        var value = this.value;
        text = text.replace(/[^0-9\-+\s\.]/g, '');
        value = value.substr(0, slstart)+ value+ value.substr(slend);
        this.value = value;
        elt.setSelectionRange(slend+ text.length, slend+ text.length);
    });
    elt.addEventListener('keydown', function (event) {
        var key = event.key;
        if (key && key.length == 1 && !event.ctrlKey && !event.altKey) {
            if (key.match(/[^0-9\-+\s\.]/)) {
               event.preventDefault();
            }
        }
    });
    return elt;
};

contentModule.preventNotPhoneNumberInput = function(elt) {
    elt.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = "";
        if (e.clipboardData && e.clipboardData.getData) {
            text = e.clipboardData.getData("text/plain");

        } else if (window.clipboardData && window.clipboardData.getData) {
            text = window.clipboardData.getData("Text");
        }
        text = text.replace(/[^0-9\-+\s\.]/g, '');
        var slstart = elt.selectionStart;
        var slend = elt.selectionEnd;
        var value = this.value +'';
        value = value.substr(0, slstart)+ text+ value.substr(slend);
        this.value = value;
        elt.setSelectionRange(slstart + text.length, slstart+ text.length);
    });
    elt.addEventListener('keydown', function (event) {
        var key = event.key;
        if (key && key.length == 1 && !event.ctrlKey && !event.altKey) {
            if (key.match(/[^0-9\-+\s\.]/)) {
               event.preventDefault();
            }
        }
    });
    return elt;
};

contentModule.getTimeSend = function (timesend) {
    var res = "";
    var month, day, year, hour, minute;
    month = timesend.getMonth() + 1;
    day = timesend.getDate();
    year = timesend.getFullYear();
    hour = timesend.getHours();
    minute = timesend.getMinutes();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    res += day + "/";
    res += month + "/";
    res += year;
    res += " " + hour + ":";
    res += minute;
    return res;
};

contentModule.formatTimeDisplay = function (timesend) {
    var res = "";
    var month, day, year, hour, minute;
    month = timesend.getMonth() + 1;
    day = timesend.getDate();
    year = timesend.getFullYear();
    hour = timesend.getHours();
    minute = timesend.getMinutes();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    res += day + "/";
    res += month + "/";
    res += year;
    return res;
};

contentModule.formatTimeMinuteDisplay = function (timesend) {
    var res = "";
    var month, day, year, hour, minute;
    month = timesend.getMonth() + 1;
    day = timesend.getDate();
    year = timesend.getFullYear();
    hour = timesend.getHours();
    minute = timesend.getMinutes();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    res += day + "/";
    res += month + "/";
    res += year;
    res += " " + hour + ":" + minute;
    return res;
};

contentModule.getDateSend = function (timesend) {
    var month, day, year, hour, minute;
    month = timesend.getMonth() + 1;
    day = timesend.getDate();
    year = timesend.getFullYear();
    hour = timesend.getHours();
    minute = timesend.getMinutes();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    return "_" + year + month + day + "_" + hour + minute;
};

contentModule.generateRandom = function () {
    var res = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++) {
        res += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return res;
};

contentModule.getObjectbyType = function(host, typeid, valueid, require, defaultValue){
    var formatNumber = function(elt){
        elt.value = elt.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    };
    var reFormatNumber = function(elt){
        elt.value =  parseFloat(elt.value.split(",").join(""));
    };

    var typeIndex = data_module.typelists.getIndex(typeid);
    var type = data_module.typelists.items[typeIndex].type;
    var value;
    if (valueid > 0) host.listValueId.push(valueid);
    switch (type) {
        case "string":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = host.funcs.input({
                style: {
                    minWidth: "300px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() === ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                }
            };
            return elt;
        case "note":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = DOMElement.textarea({
                attrs: {
                    className: "cardSimpleTextarea",
                    style: {
                        minWidth: "300px",
                        width: "100%",
                        height: "70px"
                    },
                    value: value
                }
            });
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() === ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                }
            };
            return elt;
        case "number":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = contentModule.preventNotNumberInput(host.funcs.input({
                style: {
                    minWidth: "300px",
                    width: "100%",
                    textAlign: "right"
                },
                onfocus: function(){
                    if (this.value.trim() !== "") reFormatNumber(this);
                },
                onblur: function(){
                    formatNumber(this);
                },
                value: value
            }));
            formatNumber(elt);
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() === ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: parseFloat(elt.value.split(",").join("")),
                    isNull: isNull
                }
            };
            return elt;
        case "email":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = host.funcs.input({
                style: {
                    minWidth: "300px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                var isNull = false;
                if (require || elt.value.trim() != ""){
                    if (!contentModule.filterEmail.test(elt.value.trim())){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("war_txt_email_invalid"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                }
            };
            return elt;
        case "phonenumber":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = contentModule.preventNotPhoneNumberInput(host.funcs.input({
                style: {
                    minWidth: "300px",
                    width: "100%"
                },
                value: value
            }));
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() === ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                }
            };
            return elt;
        case "website":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = host.funcs.input({
                style: {
                    minWidth: "300px",
                    width: "100%"
                },
                value: value
            });
            // var elt = contentModule.preventNotWebsiteInput();
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() == ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                }
            };
            return elt;
        case "gps":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = host.funcs.input({
                style: {
                    minWidth: "200px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() == ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                }
            };
            return elt;
        case "date":
            if (valueid == 0 || !valueid){
              switch (defaultValue[0]) {
                case "today":
                    value = new Date();
                    value = new Date(value.setHours(0, 0, 0, 0));
                    break;
                case "first_day_of_month":
                    value = new Date();
                    value = new Date(value.setDate(1));
                    break;
                case "custom":
                    value = new Date(defaultValue[1]);
                    break;

              }
            }
            else {
                value = new Date(host.database.values.items[host.database.values.getIndex(valueid)].timecontent);
            }
            var elt = absol.buildDom({
                tag: 'calendar-input',
                data: {
                    value: value
                }
            });
            elt.getValue = function(){
                return {
                    value: elt.value,
                    isNull: false
                }
            };
            return elt;
        case "datetime":
            var valuetime, valuedate;
            if (valueid == 0 || !valueid){
              switch (defaultValue[0]) {
                case "today":
                    valuedate = new Date();
                    valuedate = new Date(valuedate.setHours(0, 0, 0, 0));
                    valuedate = new Date(valuedate.setHours(0, 0, 0, 0));
                    valuetime = new Date();
                    break;
                case "first_day_of_month":
                    valuedate = new Date();
                    valuedate = new Date(valuedate.setDate(1));
                    valuedate = new Date(valuedate.setHours(0, 0, 0, 0));
                    valuetime = new Date();
                    break;
                case "custom":
                    valuedate = new Date(defaultValue[1]);
                    valuedate = new Date(valuedate.setHours(0, 0, 0, 0));
                    valuetime = new Date(defaultValue[1]);
                    break;

              }
            }
            else {
                valuedate = new Date(host.database.values.items[host.database.values.getIndex(valueid)].timecontent);
                valuedate = new Date(valuedate.setHours(0, 0, 0, 0));
                valuetime = new Date(host.database.values.items[host.database.values.getIndex(valueid)].timecontent);
            }
            var date = absol.buildDom({
                tag: 'calendar-input',
                style: {
                    marginRight: "var(--control-horizontal-distance-1)"
                },
                data: {
                    value: valuedate
                }
            });
            var time = absol.buildDom({
                tag: 'timeinput',
                props: {
                    dayOffset: valuetime
                }
            });
            var elt = DOMElement.div({
                attrs: {
                    style: {
                        whiteSpace: "nowrap"
                    }
                },
                children: [
                    date,
                    time
                ]
            });
            elt.getValue = function(){
                return {
                    value: new Date(date.value.getTime() + (time.hour*3600 + time.minute*60)*1000),
                    isNull: false
                }
            };
            return elt;
        case "boolean":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol.buildDom({
                tag: 'checkbox',
                props: {
                    checked: value
                }
            });
            elt.getValue = function(){
                return {
                    value: elt.checked,
                    isNull: false
                };
            };
            return elt;
        case "user":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var list = [{value: 0, text: LanguageModule.text("txt_no_select")}];
            for (var i = 0; i < host.database.users.items.length; i++){
                if (host.database.users.items[i].available == 0) continue;
                list.push({
                    value: host.database.users.items[i].homeid,
                    text: host.database.users.items[i].username + " - " + host.database.users.items[i].fullname
                });
            }
            var elt = absol.buildDom({
                tag: 'selectmenu',
                style: {
                    textAlign: "left",
                    display: "block",
                    width: "100%",
                    enableSearch: true
                },
                props: {
                    items: list,
                    value: value
                }
            });
            elt.getValue = function(){
                return {
                    value: elt.value,
                    isNull: false
                };
            };
            return elt;
        case "userlist":
            if (valueid == 0) value = defaultValue;
            else {
                value = EncodingClass.string.toVariable(host.database.values.items[host.database.values.getIndex(valueid)].content);
            }
            var list = [];
            for (var i = 0; i < host.database.users.items.length; i++){
                if (host.database.users.items[i].available == 0) continue;
                list.push({
                    value: host.database.users.items[i].homeid,
                    text: host.database.users.items[i].username + " - " + host.database.users.items[i].fullname
                });
            }
            var elt = absol.buildDom({
                tag: 'selectbox',
                style: {
                    textAlign: "left",
                    display: "block",
                    width: "100%",
                    maxWidth: "600px"
                },
                props: {
                    items: list,
                    values: value,
                    enableSearch: true
                }
            });
            elt.getValue = function(){
                return {
                    value: elt.values,
                    isNull: false
                };
            };
            return elt;
        case "nation":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var list = [{value: 0, text: LanguageModule.text("txt_no_select")}];
            for (var i = 0; i < host.database.nations.items.length; i++){
                if (host.database.nations.items[i].available == 0) continue;
                list.push({
                    value: host.database.nations.items[i].id,
                    text: host.database.nations.items[i].name
                });
            }
            var elt = absol.buildDom({
                tag: 'selectmenu',
                style: {
                    textAlign: "left",
                    display: "block",
                    width: "100%"
                },
                props: {
                    items: list,
                    value: value,
                    enableSearch: true
                }
            });
            elt.getValue = function(){
                return {
                    value: elt.value,
                    isNull: false
                };
            };
            return elt;
        case "city":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var list = [{value: 0, text: LanguageModule.text("txt_no_select")}];
            for (var i = 0; i < host.database.cities.items.length; i++){
                if (host.database.cities.items[i].available == 0) continue;
                list.push({
                    value: host.database.cities.items[i].id,
                    text: host.database.cities.items[i].name
                });
            }
            var elt = absol.buildDom({
                tag: 'selectmenu',
                style: {
                    textAlign: "left",
                    display: "block",
                    width: "100%"
                },
                props: {
                    items: list,
                    value: value,
                    enableSearch: true
                }
            });
            elt.getValue = function(){
                return {
                    value: elt.value,
                    isNull: false
                };
            };
            return elt;
        case "enum":
            var list = [{
                value: "no_select",
                text: LanguageModule.text("txt_no_select")
            }];
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                list.push({
                    value: data_module.typelists.items[typeIndex].content.details[i].localid,
                    text: data_module.typelists.items[typeIndex].content.details[i].text
                });
            }
            var elt = absol.buildDom({
                tag: 'selectmenu',
                style: {
                    textAlign: "left",
                    display: "block",
                    minWidth: "300px",
                    width: "100%"
                },
                props: {
                    items: list
                },
                on: {
                    change: function(){
                        if (this.value != "no_select"){
                            if (this.style.border == "var(--control-border-alert)"){
                                this.style.border = "var(--control-border)";
                            }
                        }
                    }
                }
            });
            if (valueid > 0) {
                elt.value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            else elt.value = defaultValue;
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value == "no_select"){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.style.border = "var(--control-border-alert)";
                            }
                        });
                    }
                }
                return {
                    value: elt.value,
                    isNull: isNull
                };
            };
            return elt;
        case "array":
            if (value === undefined) value = [];
            var typetemp = data_module.typelists.getIndex(data_module.typelists.items[typeIndex].content.typeof);
            if (data_module.typelists.items[typetemp].type == "structure"){
                var header = [{type: "dragzone", style: {width: "40px"}}];
                for (var x = 0; x < data_module.typelists.items[typetemp].content.details.length; x++){
                    header.push({value: data_module.typelists.items[typetemp].content.details[x].name});
                }
                header.push({value: ""});
                var data = [];
                for (var x = 0; x < value.length; x++){
                    // TODO:
                }
                var tableView = pizo.tableView(
                    header,
                    data,
                    false,
                    true
                );
                tableView.style.width = "100%";
                var elt = DOMElement.div({
                    children: [
                        DOMElement.div({
                            attrs: {className: "cardsimpletableclass"},
                            children: [tableView]
                        }),
                        DOMElement.div({
                            attrs: {className: "card-table-add-row"},
                            children: [DOMElement.a({
                                attrs: {
                                    onclick: function(){
                                        var dataRow = [{value: ""}];
                                        var elt;
                                        var typeTemp, requireTemp, defaultTemp;
                                        for (var x = 0; x < data_module.typelists.items[typetemp].content.details.length; x++){
                                            typeTemp = data_module.typelists.items[typetemp].content.details[x].type;
                                            requireTemp = data_module.typelists.items[typetemp].content.details[x].require;
                                            defaultTemp = data_module.typelists.items[typetemp].content.details[x].default;
                                            elt = contentModule.getObjectbyType(host, typeTemp, undefined, requireTemp, defaultTemp);
                                            dataRow.push({
                                                element: DOMElement.div({
                                                    attrs: {
                                                        className: "sortTable-cell-edit"
                                                    },
                                                    children: [elt]
                                                })
                                            });
                                        }
                                        var deleteIcon = DOMElement.div({
                                            attrs: {
                                                className: "card-icon-cover"
                                            },
                                            children: [DOMElement.i({
                                                attrs: {
                                                    className: "material-icons card-icon-remove"
                                                },
                                                text: "remove_circle"
                                            })]
                                        });
                                        dataRow.push({
                                            functionClick: function(event,me,index,parent,data,row){
                                                var me = event.target;
                                                while (me.parentNode.classList !== undefined && !me.parentNode.classList.contains("sortTable-cell-view-cmd")) {
                                                    me = me.parentNode;
                                                }
                                                if (me === deleteIcon){
                                                   parent.dropRow(index);
                                                }
                                            },
                                            element: DOMElement.div({
                                                attrs: {
                                                    className: "sortTable-cell-view-cmd"
                                                },
                                                children: [
                                                    deleteIcon
                                                ]
                                            })
                                        });
                                        tableView.insertRow(dataRow);
                                    }
                                },
                                text: "+ " + LanguageModule.text("txt_add")
                            })]
                        })
                    ]
                });
                elt.getValue = function(){
                    console.log(tableView.data);
                };
                return elt;
            }
            else {
                // TODO:
            }
            break;
        case "structure":
            var data = [];
            var listobj = [];
            var elt, detailValueId;
            var typeTemp, requireTemp, defaultTemp;
            if (valueid > 0){
                var valueIndex = host.database.values.getIndex(valueid);
                var contentvalue = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
            };
            var objNation, objCity, valueCity;
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                detailValueId = 0;
                if (valueid > 0){
                    for (var j = 0; j < contentvalue.length; j++){
                        if (contentvalue[j].localid == data_module.typelists.items[typeIndex].content.details[i].localid){
                            detailValueId = contentvalue[j].valueid;
                        }
                    }
                }
                typeTemp = data_module.typelists.items[typeIndex].content.details[i].type;
                requireTemp = data_module.typelists.items[typeIndex].content.details[i].require;
                defaultTemp = data_module.typelists.items[typeIndex].content.details[i].default;
                elt = contentModule.getObjectbyType(host, typeTemp, detailValueId, requireTemp, defaultTemp);
                if (i > 0) data.push([{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}]);
                data.push([
                    {
                        attrs: {style: {whiteSpace: "nowrap"}},
                        children: [
                            DOMElement.span({
                                text: data_module.typelists.items[typeIndex].content.details[i].name
                            }),
                            DOMElement.span({
                                attrs: {
                                    style: {
                                        color: "red",
                                        display: requireTemp? "" : "none"
                                    }
                                },
                                text: "*"
                            })
                        ]
                    },
                    {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
                    elt
                ]);
                listobj.push({
                    localid: data_module.typelists.items[typeIndex].content.details[i].localid,
                    typeid: data_module.typelists.items[typeIndex].content.details[i].type,
                    valueid: detailValueId,
                    elt: elt
                });
                var m = data_module.typelists.getIndex(data_module.typelists.items[typeIndex].content.details[i].type);
                if (data_module.typelists.items[m].type == "nation") {
                    objNation = elt;
                }
                if (data_module.typelists.items[m].type == "city") {
                    objCity = elt;
                    if (detailValueId == 0) valueCity = defaultTemp;
                    else {
                        valueCity = host.database.values.items[host.database.values.getIndex(detailValueId)].content;
                    }
                }
            }
            if (objNation !== undefined && objCity !== undefined){
                var listNation = [{
                    value: 0,
                    text: LanguageModule.text("txt_no_select"),
                    cityList: [{value: 0, text: LanguageModule.text("txt_no_select")}]
                }];
                var cIndex;
                var cityList;
                for (var i = 0; i < host.database.nations.items.length; i++){
                    cityList = [{value: 0, text: LanguageModule.text("txt_no_select")}];
                    for (var j = 0; j < host.database.nations.items[i].cityIndexList.length; j++){
                        cIndex = host.database.nations.items[i].cityIndexList[j];
                        cityList.push({value: host.database.cities.items[cIndex].id, text: host.database.cities.items[cIndex].name})
                    }
                    listNation.push({value: host.database.nations.items[i].id, text:host.database.nations.items[i].name, cityList: cityList});
                }
                for (var i = 0; i < listNation.length; i++){
                    if (listNation[i].value == objNation.value){
                        objCity.items = listNation[i].cityList;
                        break;
                    }
                }
                objNation.on('change', function(){
                    for (var i = 0; i < listNation.length; i++){
                        if (listNation[i].value == this.value){
                            objCity.items = listNation[i].cityList;
                            objCity.value = 0;
                            break;
                        }
                    }
                });
            }
            elt = DOMElement.table({
                data: data
            });
            elt.getValue = function(){
                var value = [];
                var isNull = false;
                for (var i = 0; i < listobj.length; i++){
                    if (listobj[i].elt.getValue().isNull){
                        isNull = true;
                        break;
                    }
                    else {
                        var m = data_module.typelists.getIndex(listobj[i].typeid);
                        value.push({
                            localid: listobj[i].localid,
                            typeid: listobj[i].typeid,
                            value: listobj[i].elt.getValue().value,
                            valueid: listobj[i].valueid,
                            privtype: data_module.typelists.items[m].type
                        });
                    }
                }
                return {
                    value: value,
                    isNull: isNull
                };
            };
            return elt;
        default:
            if (value === undefined) value = defaultValue;
            var elt = host.funcs.input({
                style: {
                    minWidth: "300px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() === ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                };
            };
            return elt;
    }
};

contentModule.getObjectbyTypeView = function(host, typeid, valueid, require, defaultValue, decpre){
    var typeIndex = data_module.typelists.getIndex(typeid);
    var type = data_module.typelists.items[typeIndex].type;
    var value;
    if (valueid > 0) host.listValueId.push(valueid);
    switch (type) {
        case "string":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "note":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "number":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            if (decpre) value = contentModule.fromDouble(parseFloat(value), decpre);
            else value = contentModule.fromDouble(parseFloat(value), data_module.typelists.items[typeIndex].decpre);
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "email":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "phonenumber":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "website":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "gps":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "date":
            if (valueid == 0 || !valueid){
              switch (defaultValue[0]) {
                case "today":
                    value = new Date();
                    value = new Date(value.setHours(0, 0, 0, 0));
                    break;
                case "first_day_of_month":
                    value = new Date();
                    value = new Date(value.setDate(1));
                    break;
                case "custom":
                    value = new Date(defaultValue[1]);
                    break;

              }
            }
            else {
                value = new Date(host.database.values.items[host.database.values.getIndex(valueid)].timecontent);
            }
            var elt = absol._({
                tag: "span",
                child: {text: contentModule.formatTimeDisplay(value)}
            });
            return elt;
        case "datetime":
            var valuetime, valuedate;
            if (valueid == 0 || !valueid){
              switch (defaultValue[0]) {
                case "today":
                    valuedate = new Date();
                    break;
                case "first_day_of_month":
                    valuedate = new Date(valuedate.setDate(1));
                    break;
                case "custom":
                    valuedate = new Date(defaultValue[1]);
                    break;

              }
            }
            else {
                valuedate = new Date(host.database.values.items[host.database.values.getIndex(valueid)].timecontent);
            }
            var elt = absol._({
                tag: "span",
                child: {text: formatTimeMinuteDisplay(valuedate)}
            });
            return elt;
        case "boolean":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol.buildDom({
                tag: 'checkbox',
                props: {
                    checked: value
                }
            });
            return elt;
        case "user":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value == 0 ? LanguageModule.text("txt_no_select") : contentModule.getUsernameFullnameByhomeid(host.database.users, value)}
            });
            return elt;
        case "userlist":
            if (valueid == 0) value = defaultValue;
            else {
                value = EncodingClass.string.toVariable(host.database.values.items[host.database.values.getIndex(valueid)].content);
            }
            var list = "";
            value.forEach(function(elt){
                if (list != "") list += ", ";
                list += contentModule.getUsernameFullnameByhomeid(host.database.users, elt);
            });
            var elt = absol._({
                tag: "span",
                child: {text: list}
            });
            return elt;
        case "nation":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value == 0 ? LanguageModule.text("txt_no_select") : host.database.nations.items[host.database.nations.getIndex(value)].name}
            });
            return elt;
        case "city":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            var elt = absol._({
                tag: "span",
                child: {text: value == 0 ? LanguageModule.text("txt_no_select") : host.database.cities.items[host.database.cities.getIndex(value)].name}
            });
            return elt;
        case "enum":
            var localid, value;
            if (valueid > 0) {
                localid = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            else localid = defaultValue;
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                if (data_module.typelists.items[typeIndex].content.details[i].localid == localid){
                    value = data_module.typelists.items[typeIndex].content.details[i].text;
                    break;
                }
            }
            if (localid == 'no_select') value = LanguageModule.text("txt_no_select");
            var elt = absol._({
                tag: "span",
                child: {text: value}
            });
            return elt;
        case "array":
            if (value === undefined) value = [];
            var typetemp = data_module.typelists.getIndex(data_module.typelists.items[typeIndex].content.typeof);
            if (data_module.typelists.items[typetemp].type == "structure"){
                var header = [{type: "dragzone", style: {width: "40px"}}];
                for (var x = 0; x < data_module.typelists.items[typetemp].content.details.length; x++){
                    header.push({value: data_module.typelists.items[typetemp].content.details[x].name});
                }
                header.push({value: ""});
                var data = [];
                for (var x = 0; x < value.length; x++){
                    // TODO:
                }
                var tableView = pizo.tableView(
                    header,
                    data,
                    false,
                    true
                );
                tableView.style.width = "100%";
                var elt = DOMElement.div({
                    children: [
                        DOMElement.div({
                            attrs: {className: "cardsimpletableclass"},
                            children: [tableView]
                        }),
                        DOMElement.div({
                            attrs: {className: "card-table-add-row"},
                            children: [DOMElement.a({
                                attrs: {
                                    onclick: function(){
                                        var dataRow = [{value: ""}];
                                        var elt;
                                        var typeTemp, requireTemp, defaultTemp, decpre;
                                        for (var x = 0; x < data_module.typelists.items[typetemp].content.details.length; x++){
                                            typeTemp = data_module.typelists.items[typetemp].content.details[x].type;
                                            requireTemp = data_module.typelists.items[typetemp].content.details[x].require;
                                            defaultTemp = data_module.typelists.items[typetemp].content.details[x].default;
                                            decpre = data_module.typelists.items[typetemp].content.details[x].decpre;
                                            elt = contentModule.getObjectbyTypeView(host, typeTemp, undefined, requireTemp, defaultTemp, decpre);
                                            dataRow.push({
                                                element: DOMElement.div({
                                                    attrs: {
                                                        className: "sortTable-cell-edit"
                                                    },
                                                    children: [elt]
                                                })
                                            });
                                        }
                                        var deleteIcon = DOMElement.div({
                                            attrs: {
                                                className: "card-icon-cover"
                                            },
                                            children: [DOMElement.i({
                                                attrs: {
                                                    className: "material-icons card-icon-remove"
                                                },
                                                text: "remove_circle"
                                            })]
                                        });
                                        dataRow.push({
                                            functionClick: function(event,me,index,parent,data,row){
                                                var me = event.target;
                                                while (me.parentNode.classList !== undefined && !me.parentNode.classList.contains("sortTable-cell-view-cmd")) {
                                                    me = me.parentNode;
                                                }
                                                if (me === deleteIcon){
                                                   parent.dropRow(index);
                                                }
                                            },
                                            element: DOMElement.div({
                                                attrs: {
                                                    className: "sortTable-cell-view-cmd"
                                                },
                                                children: [
                                                    deleteIcon
                                                ]
                                            })
                                        });
                                        tableView.insertRow(dataRow);
                                    }
                                },
                                text: "+ " + LanguageModule.text("txt_add")
                            })]
                        })
                    ]
                });
                return elt;
            }
            else {
                // TODO:
            }
            break;
        case "structure":
            var data = [];
            var listobj = [];
            var elt, detailValueId;
            var typeTemp, requireTemp, defaultTemp, decpre;
            if (valueid > 0){
                var valueIndex = host.database.values.getIndex(valueid);
                var contentvalue = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
            };
            var objNation, objCity, valueCity;
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                detailValueId = 0;
                if (valueid > 0){
                    for (var j = 0; j < contentvalue.length; j++){
                        if (contentvalue[j].localid == data_module.typelists.items[typeIndex].content.details[i].localid){
                            detailValueId = contentvalue[j].valueid;
                        }
                    }
                }
                typeTemp = data_module.typelists.items[typeIndex].content.details[i].type;
                requireTemp = data_module.typelists.items[typeIndex].content.details[i].require;
                defaultTemp = data_module.typelists.items[typeIndex].content.details[i].default;
                decpre = data_module.typelists.items[typeIndex].content.details[i].decpre;
                elt = contentModule.getObjectbyTypeView(host, typeTemp, detailValueId, requireTemp, defaultTemp, decpre);
                data.push([
                    {
                        attrs: {style: {whiteSpace: "nowrap"}},
                        children: [
                            DOMElement.span({
                                text: data_module.typelists.items[typeIndex].content.details[i].name + ": "
                            })
                        ]
                    },
                    {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
                    elt
                ]);
                listobj.push({
                    localid: data_module.typelists.items[typeIndex].content.details[i].localid,
                    typeid: data_module.typelists.items[typeIndex].content.details[i].type,
                    valueid: detailValueId,
                    elt: elt
                });
                var m = data_module.typelists.getIndex(data_module.typelists.items[typeIndex].content.details[i].type);
                if (data_module.typelists.items[m].type == "nation") {
                    objNation = elt;
                }
                if (data_module.typelists.items[m].type == "city") {
                    objCity = elt;
                    if (detailValueId == 0) valueCity = defaultTemp;
                    else {
                        valueCity = host.database.values.items[host.database.values.getIndex(detailValueId)].content;
                    }
                }
            }
            if (objNation !== undefined && objCity !== undefined){
                var listNation = [{
                    value: 0,
                    text: LanguageModule.text("txt_no_select"),
                    cityList: [{value: 0, text: LanguageModule.text("txt_no_select")}]
                }];
                var cIndex;
                var cityList;
                for (var i = 0; i < host.database.nations.items.length; i++){
                    cityList = [{value: 0, text: LanguageModule.text("txt_no_select")}];
                    for (var j = 0; j < host.database.nations.items[i].cityIndexList.length; j++){
                        cIndex = host.database.nations.items[i].cityIndexList[j];
                        cityList.push({value: host.database.cities.items[cIndex].id, text: host.database.cities.items[cIndex].name})
                    }
                    listNation.push({value: host.database.nations.items[i].id, text:host.database.nations.items[i].name, cityList: cityList});
                }
                for (var i = 0; i < listNation.length; i++){
                    if (listNation[i].value == objNation.value){
                        objCity.items = listNation[i].cityList;
                        break;
                    }
                }
                objNation.on('change', function(){
                    for (var i = 0; i < listNation.length; i++){
                        if (listNation[i].value == this.value){
                            objCity.items = listNation[i].cityList;
                            objCity.value = 0;
                            break;
                        }
                    }
                });
            }
            elt = DOMElement.table({
                data: data
            });
            return elt;
        default:
            if (value === undefined) value = defaultValue;
            var elt = host.funcs.input({
                style: {
                    minWidth: "300px",
                    width: "100%"
                },
                value: value
            });
            elt.getValue = function(){
                var isNull = false;
                if (require){
                    if (elt.value.trim() === ""){
                        isNull = true;
                        ModalElement.alert({
                            message: LanguageModule.text("txt_data_is_null"),
                            func: function(){
                                elt.focus();
                            }
                        });
                    }
                }
                return {
                    value: elt.value.trim(),
                    isNull: isNull
                };
            };
            return elt;

    }
};

contentModule.makeAccountGroupData = function(host){
    var index;
    for (var i = 0; i < host.database.account_groups.items.length; i++) {
        host.database.account_groups.items[i].userIdList = [];
        host.database.account_groups.items[i].childrenIdList = [];
    }
    for (var i = 0; i < host.database.account_groups.items.length; i++){
        index = host.database.account_groups.getIndex(host.database.account_groups.items[i].parentid);
        if (index != -1){
            host.database.account_groups.items[index].childrenIdList.push(host.database.account_groups.items[i].id);
        }
    }
}

contentModule.makeAccountGroupUserData = function(host){
    var index1, index2;
    for (var i = 0; i < host.database.account_group_users.items.length; i++){
        index1 = host.database.account_groups.getIndex(host.database.account_group_users.items[i].groupid);
        index2 = host.database.users.getIndex(host.database.account_group_users.items[i].userid);
        if (index1 != -1 && index2  != -1){
            host.database.account_groups.items[index1].userIdList.push(host.database.account_group_users.items[i].userid);
        }
    }
}

contentModule.makeBoardMember = function(host){
    var index1, index2;
    for (var i = 0; i < host.database.list_member.items.length; i++){
        index1 = host.database.boards.getIndex(host.database.list_member.items[i].listid);
        index2 = host.database.users.getByhomeid(host.database.list_member.items[i].userid);
        if (index1 != -1 && index2 != -1){
            host.database.boards.items[index1].memberList.push({
                id: host.database.list_member.items[i].id,
                userid: host.database.list_member.items[i].userid,
                type: host.database.list_member.items[i].type,
            });
        }
    }
};

contentModule.makeBoardGroupLinkIndex = function(host){
    for (var i = 0; i < host.database.boards.items.length; i++){
        host.database.boards.items[i].groupIdList = [];
    }
    var k;
    for (var i = 0; i < data_module.board_group_link.items.length; i++){
        data_module.board_group_link.items[i].boardIndex = k = host.database.boards.getIndex(data_module.board_group_link.items[i].boardid);
        if (k >= 0) {
            host.database.boards.items[k].groupIdList.push(data_module.board_group_link.items[i].board_groupid);
        }
    }
};

contentModule.getFieldDataToReport = function(host, typeid, valueid, require, defaultValue, decpre){
    var typeIndex = data_module.typelists.getIndex(typeid);
    var type = data_module.typelists.items[typeIndex].type;
    var value;
    switch (type) {
        case "string":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "note":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "number":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            if (decpre) value = contentModule.fromDouble(parseFloat(value), decpre);
            else value = contentModule.fromDouble(parseFloat(value), data_module.typelists.items[typeIndex].decpre);
            return {
                type: type,
                value: value
            };
        case "email":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "phonenumber":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "website":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "gps":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "date":
            if (valueid == 0 || !valueid){
              switch (defaultValue[0]) {
                case "today":
                    value = new Date();
                    value = new Date(value.setHours(0, 0, 0, 0));
                    break;
                case "first_day_of_month":
                    value = new Date();
                    value = new Date(value.setDate(1));
                    break;
                case "custom":
                    value = new Date(defaultValue[1]);
                    break;

              }
            }
            else {
                value = new Date(host.database.values.items[host.database.values.getIndex(valueid)].timecontent);
            }
            return {
                type: type,
                value: value
            };
        case "datetime":
            var valuetime, valuedate;
            if (valueid == 0 || !valueid){
              switch (defaultValue[0]) {
                case "today":
                    valuedate = new Date();
                    break;
                case "first_day_of_month":
                    valuedate = new Date(valuedate.setDate(1));
                    break;
                case "custom":
                    valuedate = new Date(defaultValue[1]);
                    break;

              }
            }
            else {
                valuedate = new Date(host.database.values.items[host.database.values.getIndex(valueid)].timecontent);
            }
            return {
                type: type,
                value: valuedate
            };
        case "boolean":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "user":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "userlist":
            if (valueid == 0) value = defaultValue;
            else {
                value = EncodingClass.string.toVariable(host.database.values.items[host.database.values.getIndex(valueid)].content);
            }
            var list = "";
            value.forEach(function(elt){
                if (list != "") list += ", ";
                list += contentModule.getUsernameFullnameByhomeid(host.database.users, elt);
            });
            return {
                type: type,
                value: value
            };
        case "nation":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "city":
            if (valueid == 0) value = defaultValue;
            else {
                value = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            return {
                type: type,
                value: value
            };
        case "enum":
            var localid, value;
            if (valueid > 0) {
                localid = host.database.values.items[host.database.values.getIndex(valueid)].content;
            }
            else localid = defaultValue;
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                if (data_module.typelists.items[typeIndex].content.details[i].localid == localid){
                    value = data_module.typelists.items[typeIndex].content.details[i].text;
                    break;
                }
            }
            if (localid == 'no_select') value = LanguageModule.text("txt_no_select");
            return {
                type: type,
                value: value
            };
        case "array":
            return undefined;
            break;
        case "structure":
            var data = {};
            var elt, detailValueId;
            var typeTemp, requireTemp, defaultTemp, decpre;
            if (valueid > 0){
                var valueIndex = host.database.values.getIndex(valueid);
                var contentvalue = EncodingClass.string.toVariable(host.database.values.items[valueIndex].content);
            };
            for (var i = 0; i < data_module.typelists.items[typeIndex].content.details.length; i++){
                detailValueId = 0;
                if (valueid > 0){
                    for (var j = 0; j < contentvalue.length; j++){
                        if (contentvalue[j].localid == data_module.typelists.items[typeIndex].content.details[i].localid){
                            detailValueId = contentvalue[j].valueid;
                        }
                    }
                }
                typeTemp = data_module.typelists.items[typeIndex].content.details[i].type;
                requireTemp = data_module.typelists.items[typeIndex].content.details[i].require;
                defaultTemp = data_module.typelists.items[typeIndex].content.details[i].default;
                decpre = data_module.typelists.items[typeIndex].content.details[i].decpre;
                elt = contentModule.getFieldDataToReport(host, typeTemp, detailValueId, requireTemp, defaultTemp, decpre);
                data[data_module.typelists.items[typeIndex].content.details[i].localid] = {
                    name: data_module.typelists.items[typeIndex].content.details[i].name,
                    value: elt
                }
            }
            return data;
        default:
            return undefined;

    }
};

contentModule.reminderActivity = function(listActivity){
    var notifyMe = function(content){
        var noticontent = content.nameActivity + " " + content.timeView ;
        if (!("Notification" in window)) {
            alert("This browser does not support system notifications");
        }
        else if (Notification.permission === "granted") {
            var notification = new Notification("Carddone", {
                body: noticontent,
                data: {
                    content: content
                },
                icon: "../images2/carddone_favicon.ico"
            });
        }
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission === "granted") {
                    var notification = new Notification("Carddone", {
                        body: noticontent,
                        data: {
                            content: content
                        },
                        icon: "../images2/carddone_favicon.ico"
                    });
                }
            });
        }
        notification.onclick = function(){
            if (window.focus) window.focus();
            carddone.menu.loadPage(11, notification.data.content);
        };
    };
    setTimeout(function(){
        var dataReminder = contentModule.makeUser_calendarReminder();
        contentModule.reminderActivity(dataReminder.listNotification);
    }, 10000);
    if (listActivity.length == 0) return;
    console.log(listActivity);
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "reminder_load_boardcard"},
            {name: "listReminderLost", value: EncodingClass.string.fromVariable(listActivity)}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0,2) == "ok"){
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    var host = {
                        database: {}
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    host.database.user_calendar = data_module.user_calendar;
                    var cIndex, lIndex, bIndex, time;
                    contentModule.makeActivitiesCardIndex(host);
                    for (var i = 0; i < listActivity.length; i++){
                        cIndex = host.database.cards.getIndex(listActivity[i].cardid);
                        if (cIndex < 0) continue;
                        if (host.database.cards.items[cIndex].permission == "no") continue;
                        lIndex = host.database.lists.getIndex(host.database.cards.items[cIndex].parentid);
                        if (lIndex < 0) continue;
                        bIndex = host.database.boards.getIndex(listActivity[i].boardid);
                        if (bIndex < 0) continue;
                        if (listActivity[i].type == "meeting"){
                            listActivity[i].timeView = contentModule.getTimeSend(listActivity[i].timestart) + " - " + contentModule.getTimeSend(listActivity[i].timeend);
                        }
                        else {
                            listActivity[i].timeView = contentModule.getTimeSend(listActivity[i].time);
                        }
                        listActivity[i].cardName = host.database.cards.items[cIndex].name;
                        listActivity[i].permission = host.database.cards.items[cIndex].permission;
                        listActivity[i].boardName = host.database.boards.items[bIndex].name;
                        listActivity[i].listName = host.database.lists.items[lIndex].name;
                        notifyMe(listActivity[i]);
                    }
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

};

contentModule.reminderActivityLost = function(listReminderLost){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "reminder_load_boardcard"},
                {name: "listReminderLost", value: EncodingClass.string.fromVariable(listReminderLost)}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var host = {
                            database: {}
                        };
                        contentModule.makeDatabaseContent(host.database, st);
                        host.database.user_calendar = data_module.user_calendar;
                        contentModule.makeActivitiesCardIndex(host);
                        var data = [], celldata, cIndex, lIndex, bIndex, time;
                        for (var i = 0; i < listReminderLost.length; i++){
                            cIndex = host.database.cards.getIndex(listReminderLost[i].cardid);
                            if (cIndex < 0) continue;
                            if (host.database.cards.items[cIndex].permission == "no") continue;
                            lIndex = host.database.lists.getIndex(host.database.cards.items[cIndex].parentid);
                            if (lIndex < 0) continue;
                            bIndex = host.database.boards.getIndex(listReminderLost[i].boardid);
                            if (bIndex < 0) continue;
                            celldata = listReminderLost[i];
                            if (listReminderLost[i].type == "meeting"){
                                time = contentModule.getTimeSend(listReminderLost[i].timestart) + " - " + contentModule.getTimeSend(listReminderLost[i].timeend);
                                celldata.timeSort = listReminderLost[i].timestart.getTime();
                            }
                            else {
                                time = contentModule.getTimeSend(listReminderLost[i].time);
                                celldata.timeSort = listReminderLost[i].time.getTime();
                            }
                            celldata.cardName = host.database.cards.items[cIndex].name;
                            celldata.listName = host.database.lists.items[lIndex].name;
                            celldata.boardName = host.database.boards.items[bIndex].name;
                            celldata.timeView = time;
                            celldata.important = carddone.activities.getImportantName(host.database.cards.items[cIndex].favorite);
                            celldata.permission = host.database.cards.items[cIndex].permission;
                            celldata.company_contactName = host.database.cards.items[cIndex].company_contactName;
                            data.push(celldata);
                        }
                        if (data.length == 0) return;
                        var dataDraw = [], row;
                        for (var i = 0; i < data.length; i++){
                            row = [
                                {},
                                {
                                    style: {whiteSpace: "nowrap"},
                                    value: data[i].nameActivity,
                                    element: DOMElement.div({
                                        attrs: {
                                            className: "sortTable-cell-view"
                                        },
                                        children: [
                                            DOMElement.div({
                                                text: data[i].nameActivity
                                            }),
                                            DOMElement.div({
                                                attrs: {
                                                    style: {
                                                        fontSize: "12px"
                                                    }
                                                },
                                                text: data[i].company_contactName
                                            })
                                        ]
                                    })
                                },
                                {
                                    value: data[i].cardName,
                                    element: DOMElement.div({
                                        attrs: {
                                            className: "sortTable-cell-view"
                                        },
                                        text: data[i].cardName
                                    })
                                },
                                {
                                    value: data[i].boardName,
                                    element: DOMElement.div({
                                        attrs: {
                                            className: "sortTable-cell-view"
                                        },
                                        text: data[i].boardName
                                    })
                                },
                                {
                                    value: data[i].listName,
                                    element: DOMElement.div({
                                        attrs: {
                                            className: "sortTable-cell-view"
                                        },
                                        text: data[i].listName
                                    })
                                },
                                {
                                    style: {whiteSpace: "nowrap"},
                                    value: data[i].timeSort,
                                    element: DOMElement.div({
                                        attrs: {
                                            className: "sortTable-cell-view"
                                        },
                                        text: data[i].timeView
                                    })
                                },
                                {
                                    value: data[i].important,
                                    element: DOMElement.div({
                                        attrs: {
                                            className: "sortTable-cell-view"
                                        },
                                        text: data[i].important
                                    })
                                }
                            ];
                            var quickMenuItems = [{
                                text: LanguageModule.text("txt_open_card"),
                                extendClasses: "bsc-quickmenu",
                                icon: {
                                    tag: "i",
                                    class: ["mdi", "mdi-file-edit-outline"]
                                },
                                cmd: function(content){
                                    return function(event, me) {
                                        ModalElement.close();
                                        carddone.menu.loadPage(11, content);
                                    }
                                } (data[i])
                            }];
                            var qmenuButton = DOMElement.div({
                                attrs: {
                                    className: "card-icon-cover"
                                },
                                children: [DOMElement.i({
                                    attrs: {
                                        className: "material-icons bsc-icon-hover-black"
                                    },
                                    text: "more_vert"
                                })]
                            });
                            absol.QuickMenu.showWhenClick(qmenuButton, {items: quickMenuItems}, [3, 4], function (menuItem) {
                                if (menuItem.cmd) menuItem.cmd();
                            });
                            row.push({
                                element: DOMElement.div({
                                    attrs: {
                                        className: "sortTable-cell-view-cmd"
                                    },
                                    children: [
                                        qmenuButton
                                    ]
                                })
                            });
                            dataDraw.push(row);
                        }
                        var x = pizo.tableView(
                            [
                                {value: LanguageModule.text("txt_index"), type: "increase"},
                                {
                                    value: LanguageModule.text("txt_title"),
                                    style: {minWidth: "100px"},
                                    sort: true
                                },
                                {
                                    value: LanguageModule.text("txt_card"),
                                    style: {minWidth: "100px"},
                                    sort: true
                                },
                                {value: LanguageModule.text("txt_board"), sort: true},
                                {value: LanguageModule.text("txt_period"), sort: true},
                                {value: LanguageModule.text("txt_due_date"), sort: true},
                                {value: LanguageModule.text("txt_important"), sort: true},
                                {value: ""}
                            ],
                            dataDraw,
                            false,
                            true
                        );
                        resolve(x);
                    }
                    else {
                        console.log("Failed reminder: " + message);
                    }
                }
                else {
                    console.log("Failed reminder: " + message);
                }
            }
        });
    });
};

contentModule.reminderForm = function(listReminderLost){
    if (listReminderLost.length == 0) return;
    contentModule.reminderActivityLost(listReminderLost).then(function(value){
        ModalElement.showWindow({
            title: LanguageModule.text("txt_reminder"),
            bodycontent: DOMElement.div({
                attrs: {
                    className: "cardsimpletableclass absol-single-page-scroller",
                    style: {
                        height: "calc(90vh - 160px)"
                    }
                },
                children: [value]
            })
        });
    });
};

contentModule.showReminder = function(){
    if (!data_module.companies || !data_module.users || !data_module.contact || !data_module.owner_company_contact){
        setTimeout(function(){
            contentModule.showReminder();
        }, 50);
        return;
    }
    var dataReminder = contentModule.makeUser_calendarReminder();
    contentModule.reminderForm(dataReminder.listReminderLost);
    contentModule.reminderActivity(dataReminder.listNotification);
};

contentModule.makeUser_calendarReminder = function(){
    var listuserCalendarReminder = [];
    for (var i = 0; i < data_module.user_calendar.items.length; i++){
        if (typeof data_module.user_calendar.items[i].content == "string") data_module.user_calendar.items[i].content = EncodingClass.string.toVariable(data_module.user_calendar.items[i].content);
        listuserCalendarReminder = listuserCalendarReminder.concat(data_module.user_calendar.items[i].content);
    }
    listuserCalendarReminder.sort(function(a, b){
        if (a.type > b.type) return -1;
        if (a.type < b.type) return 1;
        return a.objid - b.objid;
    });
    for (var i = listuserCalendarReminder.length -1; i > 0; i--){
        if (listuserCalendarReminder[i].type == "meeting" && listuserCalendarReminder[i - 1].type == "meeting"){
            if (listuserCalendarReminder[i].objid == listuserCalendarReminder[i - 1].objid) listuserCalendarReminder.splice(i, 1);
        }
    }
    var nowTime = new Date();
    var time, elt, timeReminder;
    var listReminderLost = [], timeout, listNotification = [];
    for (var i = 0; i < listuserCalendarReminder.length; i++){
        timeReminder = 0;
        elt = listuserCalendarReminder[i];
        if (elt.reminder === undefined) continue;
        if (elt.reminder == "type_reminder_none") continue;
        if (elt.status == 1) continue;
        if (elt.type == "meeting"){
            time = elt.timestart;
        }
        else {
            time = elt.time;
        }
        if (time.getTime() <= nowTime.getTime()) continue;
        switch (elt.reminder) {
            case "type_reminder_15_minutes":
                timeReminder = time.getTime() - 15*60*1000;
                break;
            case "type_reminder_30_minutes":
                timeReminder = time.getTime() - 30*60*1000;
                break;
            case "type_reminder_1_hour":
                timeReminder = time.getTime() - 60*60*1000;
                break;
            case "type_reminder_2_hours":
                timeReminder = time.getTime() - 2*60*60*1000;
                break;
            case "type_reminder_4_hours":
                timeReminder = time.getTime() - 4*60*60*1000;
                break;
            case "type_reminder_8_hours":
                timeReminder = time.getTime() - 8*60*60*1000;
                break;
            case "type_reminder_1_day":
                timeReminder = time.getTime() - 24*60*60*1000;
                break;
            case "type_reminder_2_days":
                timeReminder = time.getTime() - 2*24*60*60*1000;
                break;
            case "type_reminder_4_days":
                timeReminder = time.getTime() - 4*24*60*60*1000;
                break;
            case "type_reminder_8_days":
                timeReminder = time.getTime() - 8*24*60*60*1000;
                break;
        }
        if (timeReminder <= nowTime.getTime()){
            listReminderLost.push(elt);
        }
        if (parseInt(timeReminder/10000, 10) == parseInt(nowTime.getTime()/10000, 10)){
            listNotification.push(elt);
        }
    }
    return {
        listReminderLost: listReminderLost,
        listNotification: listNotification
    };
};
