window.ModuleManagerClass = {};
if (function () {
    var regContent = {}
    ModuleManagerClass.register = function (regContent) {
        return function (params) {
            var name, prerequisites, trigger, mqueue, node, tnode;
            var isReady;
            var i, k, t;
            if ((typeof params === "string") || (params instanceof String)) params = {
                name: params
            }
            name = params.name;
            prerequisites = params.prerequisites;
            trigger = params.trigger;
            if (name === undefined) return;
            if ((prerequisites === undefined) || (prerequisites === null)) prerequisites = [];
            if ((trigger === undefined) || (trigger === null)) trigger = function () {};
            isReady = true;
            for (i = 0; i < prerequisites.length; i++) {
                if (regContent[prerequisites[i]] === undefined) {
                    regContent[prerequisites[i]] = {
                        name: prerequisites[i],
                        loaded: false,
                        prerequisites: [],
                        queue: [name]
                    }
                    isReady = false;
                }
                else if (!regContent[prerequisites[i]].loaded) {
                    regContent[prerequisites[i]].queue.push(name);
                    isReady = false;
                }
            }
            if (regContent[name] === undefined) {
                regContent[name] = {
                    name: name,
                    loaded: false,
                    queue: [],
                    prerequisites: prerequisites,
                    trigger: trigger
                }
            }
            else {
                regContent[name].trigger = trigger;
                regContent[name].prerequisites = prerequisites;
            }
            if (!isReady) return;
            mqueue = [name];
            while (mqueue.length > 0) {
                node = regContent[mqueue.shift()];
                if (node.loaded) continue;
                node.trigger();
                node.loaded = true;
                delete node.prerequisites;
                for (i = 0; i < node.queue.length; i++) {
                    tnode = regContent[node.queue[i]];
                    isReady = true;
                    for (k = 0; k < tnode.prerequisites.length; k++) {
                        if (!regContent[tnode.prerequisites[k]].loaded) {
                            isReady = false;
                            break;
                        }
                    }
                    if (isReady) mqueue.push(tnode.name);
                }
                delete node.queue;
            }
        }
    } (regContent);
    ModuleManagerClass.isReady = function (regContent) {
        return function (modulename) {
            var i;
            if (modulename === undefined) return ModuleManagerClass.isReady(Object.keys(regContent));
            if ((typeof modulename === "string") || (modulename instanceof String)) modulename = [modulename];
            for (i = 0; i < modulename.length; i++) {
                if (regContent[modulename[i]] === undefined) return false;
                if (!regContent[modulename[i]].loaded) return false;
            }
            return true;
        }
    } (regContent);
    return false;
} ()) ModuleManagerClass = null;
