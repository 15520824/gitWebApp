'use strict';
function TagNameInput() {
    this.$input = absol.$(".card-tag-name-input", this);
    this.$listValues = [];
    this.on('click', this.eventHandler.click);
    this._inputLastValue = "";
    this.$input.on('keydown', this.eventHandler.inputkeydown);
    // this.$input.on('blur', this.eventHandler.inputblur);
    this.$followerContent = absol.buildDom({
        class: "card-tag-name-items-ctn"
    });
    this.$follower = absol._({
        tag: 'follower',
        style: {
            display: "none"
        },
        props: {
            followTarget: this.$input,
            anchor: [1, 2, 5, 6]
        },
        child: this.$followerContent
    }).addTo(this);
};


TagNameInput.render = function(){
    var res = absol.buildDom({
        class: "card-tag-name-ctn",
        child: [
            {
                tag: "preinput",
                class: "card-tag-name-input"
            }
        ]
    });
    return res;
};

TagNameInput.prototype.pushValue = function(value){
    var valueElt = absol._({
        tag:'selectboxitem',
        class: "tag-name-input-value",
        props:{
            data : value
        }
    });
    var self = this;
    valueElt.on('close', function(){
        this.remove();
        var index = self.$listValues.indexOf(this);
        self.$listValues.splice(index, 1);
    });
    this.$listValues.push(valueElt);
    this.addChildBefore(valueElt, this.$input);
};

TagNameInput.prototype.removeLastItem = function(){
    if (this.$listValues.length == 0) return;
    var valueElt = this.$listValues[this.$listValues.length -1];
    console.log(valueElt);
    valueElt.remove();
    this.$listValues.pop();
};

TagNameInput.prototype.clearValueList = function(){
    for (var i = 0; i < this.$listValues.length; i++){
        this.$listValues[i].remove();
    }
    this.$listValues = [];
};

TagNameInput.prototype.showItems = function(value){
    if (this.isShowItems == value) return;
    this.isShowItems = value;
    this.indexChoose = -1;
    if (value){
        this.$follower.removeStyle('display').updatePosition();
        this.$follower.refollow();
        absol.$(document.body).on('click', this.eventHandler.clickBody);
    }
    else {
        this.$follower.addStyle('display', 'none');
        absol.$(document.body).off('click', this.eventHandler.clickBody);
    }
};

TagNameInput.property = {};

TagNameInput.property.value = {
    set: function(value){
        this.clearValueList();
        var lists = value.split(";");
        for (var i = 0; i < lists.length; i++){
            if (lists[i] == "") continue;
            this.pushValue(lists[i]);
        }
    },
    get: function(){
        var value = ";";
        for (var i = 0; i < this.$listValues.length; i++){
            value += this.$listValues[i].value + ";";
        }
        return value;
    }
};

TagNameInput.property.valuesList = {
    set: function(value){
        this.clearValueList();
        for (var i = 0; i < value.length; i++){
            this.pushValue(value[i]);
        }
    },
    get: function(){
        var valuesList = [];
        for (var i = 0; i < this.$listValues.length; i++){
            valuesList.push(this.$listValues[i].value);
        }
        return valuesList;
    }
};

TagNameInput.property.items = {
    set: function(value){
        this._items = value;
        absol.search.prepareSearchForList(this._items);
    },
    get: function(){
        return this._items;
    }
};

TagNameInput.property.disabled = {
    set: function(value){
        if (value){
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function(){
        return this.containsClass('as-disabled');
    }
};

TagNameInput.eventHandler = {};

TagNameInput.eventHandler.click = function(event){
    if (this == event.target) this.$input.focus();
};

TagNameInput.prototype.chooseItem = function(){
    var value = this.$input.value.trim();
    if (value.length == 0) return;
    this.pushValue(value);
    this.$input.value = "";
    this.showItems(false);
    this._inputLastValue = "";
};

TagNameInput.eventHandler.inputkeydown = function(event){
    if (event.key === "Enter" || event.key === ";" || event.key === " "){
        event.preventDefault();
        this.chooseItem();
    }
    else if (event.key == "Backspace" && this.$input.value == ""){
        event.preventDefault();
        this.removeLastItem();
    }
    else if (event.key == "ArrowUp"){
        event.preventDefault();
        if (!this.isShowItems) return;
        if (this.indexChoose <= 0) return;
        this.indexChoose --;
        this.$input.value = this._itemsHint[this.indexChoose].text;
        this._inputLastValue = this._itemsHint[this.indexChoose].text;
        if (this.$followerContent.childNodes[this.indexChoose + 1]) this.$followerContent.childNodes[this.indexChoose + 1].classList.remove("as-hover");
        this.$followerContent.childNodes[this.indexChoose].classList.add("as-hover");
    }
    else if (event.key == "ArrowDown"){
        event.preventDefault();
        if (!this.isShowItems) return;
        if (this.indexChoose >= this._itemsHint.length - 1) return;
        this.indexChoose ++;
        this.$input.value = this._itemsHint[this.indexChoose].text;
        this._inputLastValue = this._itemsHint[this.indexChoose].text;
        if (this.$followerContent.childNodes[this.indexChoose - 1]) this.$followerContent.childNodes[this.indexChoose - 1].classList.remove("as-hover");
        this.$followerContent.childNodes[this.indexChoose].classList.add("as-hover");
    }
    else {
        if (this.keydowntimeout > 0){
            clearTimeout(this.keydowntimeout);
        }
        var self = this;
        this.keydowntimeout = setTimeout(function(){
            var value = self.$input.value.trim();
            if (self._inputLastValue == value) return;
            self._inputLastValue = value;
            if (value == ""){
                self.showItems(false);
                return;
            }
            self.keydowntimeout = -1;
            var items = absol.search.searchListByText(value, self._items);
            var ex;
            for (var i = 0; i < self.$listValues.length; i++){
                ex = -1;
                for (var j = 0; j < items.length; j++){
                    if (self.$listValues[i].data == items[j].text){
                        ex = j;
                        break;
                    }
                }
                if (ex >= 0) items.splice(ex, 1);
            }
            if (items.length == 0){
                self.showItems(false);
                return;
            }
            self._itemsHint = items;
            self.$followerContent.clearChild();
            for (var i = 0; i < items.length; i++){
                self.$followerContent.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-tag-name-item",
                        onclick: function(item){
                            return function(){
                                self.$input.value = item.text;
                                self._inputLastValue = item.text;
                                self.chooseItem();
                            }
                        }(items[i])
                    },
                    text: items[i].text
                }));
            }
            self.showItems(true);
        }, 200);
    }
};

TagNameInput.eventHandler.blur = function(event){
    this.showItems(false);
};

TagNameInput.eventHandler.clickBody = function(){
    this.showItems(false);
    if (this.$input.value != ""){
        this.chooseItem();
    }
};

TagNameInput.tag = 'tagnameinput';
absol.coreDom.install(TagNameInput);

//

function SelectMailInput() {
    var thisSMI = this;
    this.$input = absol.$(".card-tag-name-input", this);
    this.$listValues = [];
    this.on('click', this.eventHandler.click);
    this._inputLastValue = "";
    this._waitForClickOut = false;
    this.$input.on('keydown', this.eventHandler.inputkeydown);
    this.$input.on('focus', function(){
        if (thisSMI._waitForClickOut) return;
        thisSMI._waitForClickOut = true;
        document.body.addEventListener('click', thisSMI.eventHandler.clickOut);
    });


    this.$followerContent = absol.buildDom({
        class: "card-tag-name-items-ctn"
    });
    this.$follower = absol._({
        tag: 'follower',
        style: {
            display: "none"
        },
        props: {
            followTarget: this.$input,
            anchor: [1, 2, 5, 6]
        },
        child: this.$followerContent
    }).addTo(this);
};


SelectMailInput.render = function(){
    var res = absol.buildDom({
        class: "card-tag-name-ctn",
        child: [
            {
                tag: "preinput",
                class: "card-tag-name-input"
            }
        ]
    });
    return res;
};

SelectMailInput.prototype.pushValue = function(value, valueView){
    if (valueView === undefined) valueView = value;
    if (!contentModule.filterEmail.test(value)){
        var valueElt = absol._({
            tag:'selectboxitem',
            class: "tag-name-input-value",
            style: {
                backgroundColor: "#d93025"
            },
            props:{
                data : valueView,
                realValue: value
            }
        });
    }
    else {
        var valueElt = absol._({
            tag:'selectboxitem',
            class: "tag-name-input-value",
            props:{
                data : valueView,
                realValue: value
            }
        });
    }
    var self = this;
    valueElt.on('close', function(){
        this.remove();
        var index = self.$listValues.indexOf(this);
        self.$listValues.splice(index, 1);
    });
    this.$listValues.push(valueElt);
    this.addChildBefore(valueElt, this.$input);
};

SelectMailInput.prototype.removeLastItem = function(){
    if (this.$listValues.length == 0) return;
    var valueElt = this.$listValues[this.$listValues.length -1];
    valueElt.remove();
    this.$listValues.pop();
};

SelectMailInput.prototype.clearValueList = function(){
    for (var i = 0; i < this.$listValues.length; i++){
        this.$listValues[i].remove();
    }
    this.$listValues = [];
};

SelectMailInput.prototype.showItems = function(value){
    if (this.isShowItems == value) return;
    this.isShowItems = value;
    this.indexChoose = -1;
    if (value){
        this.$follower.removeStyle('display').updatePosition();
        this.$follower.refollow();
        absol.$(document.body).on('click', this.eventHandler.clickBody);
    }
    else {
        this.$follower.addStyle('display', 'none');
        absol.$(document.body).off('click', this.eventHandler.clickBody);
    }
};

SelectMailInput.property = {};

SelectMailInput.property.value = {
    set: function(value){
        this.clearValueList();
        var lists = value.split(";");
        for (var i = 0; i < lists.length; i++){
            if (lists[i] == "") continue;
            this.pushValue(lists[i]);
        }
    },
    get: function(){
        var value = ";";
        for (var i = 0; i < this.$listValues.length; i++){
            value += this.$listValues[i].realValue + ";";
        }
        return value;
    }
};

SelectMailInput.property.valuesList = {
    set: function(value){
        this.clearValueList();
        for (var i = 0; i < value.length; i++){
            this.pushValue(value[i]);
        }
    },
    get: function(){
        var valuesList = [];
        for (var i = 0; i < this.$listValues.length; i++){
            valuesList.push(this.$listValues[i].realValue);
        }
        return valuesList;
    }
};

SelectMailInput.property.items = {
    set: function(value){
        this._items = value;
        absol.search.prepareSearchForList(this._items);
    },
    get: function(){
        return this._items;
    }
};

SelectMailInput.property.disabled = {
    set: function(value){
        if (value){
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function(){
        return this.containsClass('as-disabled');
    }
};

SelectMailInput.eventHandler = {};

SelectMailInput.eventHandler.click = function(event){
    if (this == event.target) this.$input.focus();
};

SelectMailInput.eventHandler.clickOut = function(event){
    if (absol.EventEmitter.hitElement(this, event)) return;
    if (absol.EventEmitter.hitElement(this.$followerContent, event)) return;
    this._waitForClickOut = false;
    document.body.removeEventListener('click', this.eventHandler.clickOut);
    this.chooseItem();
};

SelectMailInput.prototype.chooseItem = function(){
    var value = this.$input.value.trim();
    if (value.length == 0) return;
    this.pushValue(value);
    this.$input.value = "";
    this.showItems(false);
    this._inputLastValue = "";
};

SelectMailInput.prototype.chooseItemHint = function(){
    var value = this._itemsHint[this.indexChoose].value;
    var valueView;
    if (this._itemsHint[this.indexChoose].name != ""){
        valueView = this._itemsHint[this.indexChoose].name;
    }
    else {
        valueView = this._itemsHint[this.indexChoose].value;
    }
    this.pushValue(value, valueView);
    this.$input.value = "";
    this.showItems(false);
    this._inputLastValue = "";
};

SelectMailInput.eventHandler.inputkeydown = function(event){
    if (event.key === "Enter"){
        event.preventDefault();
        if (this.indexChoose >= 0){
            this.chooseItemHint();
        }
        else {
            this.chooseItem();
        }
    }
    else if (event.key === ";" || event.key === " "){
        event.preventDefault();
        this.chooseItem();
    }
    else if (event.key == "Backspace" && this.$input.value == ""){
        event.preventDefault();
        this.removeLastItem();
    }
    else if (event.key == "ArrowUp"){
        event.preventDefault();
        if (!this.isShowItems) return;
        if (this.indexChoose <= 0) return;
        this.indexChoose --;
        if (this.$followerContent.childNodes[this.indexChoose + 1]) this.$followerContent.childNodes[this.indexChoose + 1].classList.remove("as-hover");
        this.$followerContent.childNodes[this.indexChoose].classList.add("as-hover");
    }
    else if (event.key == "ArrowDown"){
        event.preventDefault();
        if (!this.isShowItems) return;
        if (this.indexChoose >= this._itemsHint.length - 1) return;
        this.indexChoose ++;
        if (this.$followerContent.childNodes[this.indexChoose - 1]) this.$followerContent.childNodes[this.indexChoose - 1].classList.remove("as-hover");
        this.$followerContent.childNodes[this.indexChoose].classList.add("as-hover");
    }
    else {
        if (this.keydowntimeout > 0){
            clearTimeout(this.keydowntimeout);
        }
        var self = this;
        this.keydowntimeout = setTimeout(function(){
            var value = self.$input.value.trim();
            if (self._inputLastValue == value) return;
            self._inputLastValue = value;
            if (value == ""){
                self.showItems(false);
                return;
            }
            self.keydowntimeout = -1;
            var items = absol.search.searchListByText(value, self._items);
            var ex;
            for (var i = 0; i < self.$listValues.length; i++){
                ex = -1;
                for (var j = 0; j < items.length; j++){
                    if (self.$listValues[i].data == items[j].text){
                        ex = j;
                        break;
                    }
                }
                if (ex >= 0) items.splice(ex, 1);
            }
            if (items.length == 0){
                self.showItems(false);
                return;
            }
            self._itemsHint = items;
            self.$followerContent.clearChild();
            for (var i = 0; i < items.length; i++){
                self.$followerContent.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-tag-name-item",
                        onclick: function(item){
                            return function(){
                                var value = item.value;
                                var valueView;
                                if (item.name != ""){
                                    valueView = item.name;
                                }
                                else {
                                    valueView = item.value;
                                }
                                self.pushValue(value, valueView);
                                self.$input.value = "";
                                self.showItems(false);
                                self._inputLastValue = "";
                            }
                        }(items[i])
                    },
                    text: items[i].text
                }));
            }
            self.showItems(true);
        }, 200);
    }
};

SelectMailInput.eventHandler.blur = function(event){
    this.showItems(false);
};

SelectMailInput.eventHandler.clickBody = function(){
    this.showItems(false);
    if (this.$input.value != ""){
        this.chooseItem();
    }
};

SelectMailInput.tag = 'selectmailinput';
absol.coreDom.install(SelectMailInput);
