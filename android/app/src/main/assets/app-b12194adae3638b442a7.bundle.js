/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = window["webpackHotUpdate"];
/******/ 	window["webpackHotUpdate"] = // eslint-disable-next-line no-unused-vars
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) {
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var script = document.createElement("script");
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		if (null) script.crossOrigin = null;
/******/ 		document.head.appendChild(script);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest(requestTimeout) {
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if (typeof XMLHttpRequest === "undefined") {
/******/ 				return reject(new Error("No browser support"));
/******/ 			}
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch (err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if (request.readyState !== 4) return;
/******/ 				if (request.status === 0) {
/******/ 					// timeout
/******/ 					reject(
/******/ 						new Error("Manifest request to " + requestPath + " timed out.")
/******/ 					);
/******/ 				} else if (request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if (request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch (e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentHash = "b12194adae3638b442a7";
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParents = [];
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = [];
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1) {
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					}
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) {
/******/ 					me.children.push(request);
/******/ 				}
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e" &&
/******/ 				name !== "t"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		fn.t = function(value, mode) {
/******/ 			if (mode & 1) value = fn(value);
/******/ 			return __webpack_require__.t(value, mode & ~1);
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (dep === undefined) hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (dep === undefined) hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle") {
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		}
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = "app";
/******/ 			// eslint-disable-next-line no-lone-blocks
/******/ 			{
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {TODO} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted &&
/******/ 				// removed self-accepted modules should not be required
/******/ 				appliedUpdate[moduleId] !== warnUnexpectedRequire
/******/ 			) {
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire("./index.web.ts")(__webpack_require__.s = "./index.web.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.web.ts":
/*!**********************!*\
  !*** ./index.web.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// import {AppRegistry} from 'react-native';
// import {name as appName} from './app.json';
// import App from './App';
Object.defineProperty(exports, "__esModule", { value: true });
// AppRegistry.registerComponent(appName, () => App);
// AppRegistry.runApplication(appName, {
//   initialProps: {},
//   rootTag: document.getElementById('app-root'),
// });
__webpack_require__(/*! ./web/code */ "./web/code.js");


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./web/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./web/style.css ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, "H1 { \r\n    background:black;\r\n    color:white;\r\n    margin:0px 0px 2px 0px;\r\n    font-size:20px;\r\n    padding:2px 1px 5px 1px;\r\n    text-align:center;    \r\n}\r\n\r\nbody {\r\n    font-family:verdana,helvetica,arial,sans-serif;\r\n    border:0px; margin:0px; padding:0px;\r\n        \r\n    background:url(\r\n        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIUlEQVQYV2N89urtfwYiACNIoZSYMCMhtaMK8YYQ0cEDAG5yJ8eLRhTfAAAAAElFTkSuQmCC\r\n    ) repeat;\r\n}\r\n\r\n/* board */\r\n.sudoku_board {\r\n    margin:6px auto;\r\n  \r\n    overflow: hidden;\r\n    \r\n    -webkit-user-select: none;  \r\n    -moz-user-select: none;    \r\n    -ms-user-select: none;      \r\n    user-select: none;\r\n    \r\n    box-shadow: 0px 0px 5px 5px #bdc3c7;\r\n}\r\n\r\n.sudoku_board .cell {    \r\n    width: 11.11%;    \r\n    display: inline-block;    \r\n    float:left;\r\n    cursor:pointer;    \r\n    text-align: center;\r\n    overflow: hidden;  \r\n    \r\n    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */\r\n\t    -moz-box-sizing: border-box;    /* Firefox, other Gecko */\r\n\t    box-sizing: border-box;\r\n    \r\n    box-shadow: 0px 0px 0px 1px #bdc3c7;\r\n  \r\n    background:white;\r\n}\r\n\r\n.sudoku_board .cell.border_h {\r\n    box-shadow: 0px 0px 0px 1px #bdc3c7, inset 0px -2px 0 0 #34495e;    \r\n}\r\n\r\n.sudoku_board .cell.border_v {\r\n    box-shadow: 0px 0px 0px 1px #bdc3c7, inset -2px 0 0 #34495e;\r\n}\r\n\r\n.sudoku_board .cell.border_h.border_v {\r\n    box-shadow: 0px 0px 0px 1px #bdc3c7, inset -2px 0 0 black, inset 0px -2px 0 black;\r\n}\r\n\r\n.sudoku_board .cell span {\r\n    color:#2c3e50;\r\n    font-size:14px;\r\n    text-align:middle;    \r\n}\r\n\r\n.sudoku_board .cell.selected, .sudoku_board .cell.selected.fix {\r\n    background:#6666CC;    \r\n}\r\n\r\n.sudoku_board .cell.selected.current {\r\n    position:relative;\r\n    background: #3498db;\r\n    font-weight:bold;\r\n    box-shadow: 0px 0px 3px 3px #bdc3c7;\r\n}\r\n\r\n.sudoku_board .cell.selected.current span {\r\n    color:white;\r\n}\r\n\r\n.sudoku_board .cell.selected.group {\r\n    color:blue;    \r\n}\r\n\r\n.sudoku_board .cell span.samevalue, .sudoku_board .cell.fix span.samevalue {\r\n    font-weight:bold;  \r\n    color:#3498db;\r\n}\r\n\r\n.sudoku_board .cell.notvalid, .sudoku_board .cell.selected.notvalid{\r\n    font-weight:bold;\r\n    color:white;;\r\n    background:#e74c3c;\r\n}\r\n\r\n.sudoku_board .cell.fix {\r\n    background:#ecf0f1;\r\n    cursor:not-allowed;\r\n}\r\n\r\n.sudoku_board .cell.fix span {\r\n  color:#7f8c8d;\r\n}\r\n\r\n.sudoku_board .cell .solution {\r\n  font-size:10px;\r\n  color:#d35400;\r\n}\r\n\r\n.sudoku_board .cell .note {\r\n    color:#bdc3c7;    \r\n    width:50%;    \r\n    height:50%;\r\n    display: inline-block;    \r\n    float:left;\r\n    text-align:center;\r\n    font-size:14px;\r\n  \r\n    -webkit-box-sizing: border-box;\r\n\t    -moz-box-sizing: border-box;\r\n\t    box-sizing: border-box;\r\n}\r\n\r\n.gameover_container .gameover {\r\n    color:white;\r\n    font-weight:bold;\r\n\t    text-align:center; \r\n    \r\n    display:block;\r\n    position:absolute;       \r\n    width:90%;    \r\n    padding:10px;\r\n    \r\n    box-shadow: 0px 0px 5px 5px #bdc3c7;\r\n}\r\n\r\n\r\n.restart {\r\n  background:#7F8C8D;\r\n  color:#ecf0f1;\r\n}\r\n\r\n/* console */\r\n.board_console_container, .gameover_container {\r\n    background-color: rgba(127, 140, 141, 0.7);\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    width: 100%;\r\n    height: 100%;\r\n    \r\n     -webkit-user-select: none;  \r\n     -moz-user-select: none;    \r\n     -ms-user-select: none;      \r\n     user-select: none;\r\n}\r\n\r\n.board_console {\r\n    display:block;\r\n    position:absolute;        \r\n    width:50%;        \r\n    color:white;\r\n    background-color: rgba(127, 140, 141, 0.7);\r\n    box-shadow: 0px 0px 5px 5px #bdc3c7;\r\n}\r\n\r\n.board_console .num {\r\n    width:33.33%;    \r\n    color:#2c3e50;    \r\n    padding: 1px;\r\n    display: inline-block;    \r\n    font-weight:bold;\r\n    font-size:24px;\r\n    text-align: center;    \r\n    cursor:pointer;\r\n    \r\n    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */\r\n\t    -moz-box-sizing: border-box;    /* Firefox, other Gecko */\r\n\t    box-sizing: border-box;\r\n    \r\n    box-shadow: 0px 0px 0px 1px #bdc3c7;\r\n}\r\n\r\n\r\n.board_console .num:hover {\r\n    color:white;\r\n    background:#f1c40f;\r\n}\r\n\r\n.board_console .num.remove {\r\n    width:66.66%;    \r\n}\r\n\r\n.board_console .num.note {\r\n    background:#95a5a6;\r\n    color:#ecf0f1;\r\n}\r\n\r\n.board_console .num.note:hover {\r\n    background:#95a5a6;\r\n    color:#f1c40f;\r\n}\r\n\r\n.board_console .num.selected {\r\n    background:#f1c40f;\r\n    box-shadow: 0px 0px 3px 3px #bdc3c7;\r\n}\r\n\r\n.board_console .num.note.selected {\r\n    background:#f1c40f;  \r\n    box-shadow: 0px 0px 3px 3px #bdc3c7;\r\n}\r\n\r\n.board_console .num.note.selected:hover {\r\n  color:white;\r\n}\r\n\r\n.board_console .num.no:hover {\r\n    color:white;\r\n    cursor:not-allowed;\r\n}\r\n\r\n.board_console .num.remove:hover {\r\n    color:white;\r\n    background:#c0392b;\r\n}\r\n\r\n.statistics {\r\n    text-align:center;    \r\n}\r\n\r\n#sudoku_menu {\r\n    background-color: black;\r\n    position: absolute;\r\n    z-index:2;\r\n    width: 100%;\r\n    height: 100%;\r\n    left: -100%;\r\n    box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n}\r\n\r\n#sudoku_menu ul {\r\n   margin: 0;\r\n   padding: 100px 0px 0px 0px;\r\n   list-style: none;\r\n}\r\n\r\n#sudoku_menu ul li{\r\n  margin: 0px 50px;\r\n}\r\n\r\n#sudoku_menu ul li a {\r\n  text-align:center;\r\n  padding: 15px 20px;\r\n  font-size: 28px;\r\n  font-weight: bold;\r\n  color: white;\r\n  text-decoration: none;\r\n  display: block;\r\n  border-bottom: 1px solid #2c3e50;\r\n}\r\n\r\n#sudoku_menu.open-sidebar {\r\n  left:0px;\r\n}\r\n\r\n#sidebar-toggle {\r\n    z-index:3;\r\n    background: #bdc3c7;\r\n    border-radius: 3px;\r\n    display: block;\r\n    position: relative;\r\n    padding: 22px 18px;\r\n    float: left;\r\n}\r\n\r\n#sidebar-toggle .bar{\r\n    display: block;\r\n    width: 28px;\r\n    margin-bottom: 4px;\r\n    height: 4px;\r\n    background-color: #f0f0f0;\r\n    border-radius: 1px;   \r\n}\r\n\r\n#sidebar-toggle .bar:last-child{\r\n     margin-bottom: 0;   \r\n}\r\n\r\n/*Responsive Stuff*/\r\n\r\n@media all and (orientation:portrait) and (min-width: 640px){\r\n    h1 { font-size:50px; }\r\n    .statistics { font-size:30px; }    \r\n    .sudoku_board .cell span { font-size:60px; }    \r\n    .board_console .num { font-size:60px; }\r\n}\r\n\r\n@media all and (orientation:landscape) and (min-height: 640px){\r\n    h1 { font-size:50px; }\r\n    .statistics { font-size:30px; }\r\n    .sudoku_board .cell span { font-size:50px; }\r\n    .board_console .num { font-size:50px; }\r\n}\r\n\r\n@media all and (orientation:portrait) and (max-width: 1000px){\r\n    .sudoku_board .cell span { font-size:30px; }   \r\n}\r\n\r\n@media all and (orientation:portrait) and (max-width: 640px){\r\n\t.sudoku_board .cell span { font-size:24px; }\r\n  .sudoku_board .cell .note { font-size:10px; }\r\n}\r\n\r\n@media all and (orientation:portrait) and (max-width: 470px){\r\n\t.sudoku_board .cell span { font-size:16px; }\r\n.sudoku_board .cell .note { font-size:8px; }\r\n}\r\n\r\n@media all and (orientation:portrait) and (max-width: 320px){\r\n\t.sudoku_board .cell span { font-size:12px; }\r\n.sudoku_board .cell .note { font-size:8px; }\r\n}\r\n\r\n@media all and (orientation:portrait) and  (max-width: 240px){\r\n\t.sudoku_board .cell span { font-size:10px; }   \r\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    for (var i = 0; i < modules.length; i++) {
      var item = [].concat(modules[i]);

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = {};

function modulesToDom(moduleId, list, options) {
  for (var i = 0; i < list.length; i++) {
    var part = {
      css: list[i][1],
      media: list[i][2],
      sourceMap: list[i][3]
    };

    if (stylesInDom[moduleId][i]) {
      stylesInDom[moduleId][i](part);
    } else {
      stylesInDom[moduleId].push(addStyle(part, options));
    }
  }
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (moduleId, list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  moduleId = options.base ? moduleId + options.base : moduleId;
  list = list || [];

  if (!stylesInDom[moduleId]) {
    stylesInDom[moduleId] = [];
  }

  modulesToDom(moduleId, list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    if (!stylesInDom[moduleId]) {
      stylesInDom[moduleId] = [];
    }

    modulesToDom(moduleId, newList, options);

    for (var j = newList.length; j < stylesInDom[moduleId].length; j++) {
      stylesInDom[moduleId][j]();
    }

    stylesInDom[moduleId].length = newList.length;

    if (stylesInDom[moduleId].length === 0) {
      delete stylesInDom[moduleId];
    }
  };
};

/***/ }),

/***/ "./web/code.js":
/*!*********************!*\
  !*** ./web/code.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./style.css */ "./web/style.css");function Sudoku(params){var t=this;this.INIT=0;this.RUNNING=1;this.END=2;this.id=params.id||'sudoku_container';this.displaySolution=params.displaySolution||0;this.displaySolutionOnly=params.displaySolutionOnly||0;this.displayTitle=params.displayTitle||0;this.highlight=params.highlight||0;this.fixCellsNr=params.fixCellsNr||32;this.n=3;this.nn=this.n*this.n;this.cellsNr=this.nn*this.nn;if(this.fixCellsNr<10){this.fixCellsNr=10;}if(this.fixCellsNr>70){this.fixCellsNr=70;}this.init();setInterval(function(){t.timer();},1000);return this;}Sudoku.prototype.init=function(){this.status=this.INIT;this.cellsComplete=0;this.board=[];this.boardSolution=[];this.cell=null;this.markNotes=0;this.secondsElapsed=0;if(this.displayTitle==0){$('#sudoku_title').hide();}this.board=this.boardGenerator(this.n,this.fixCellsNr);return this;};Sudoku.prototype.timer=function(){if(this.status===this.RUNNING){this.secondsElapsed++;$('.time').text(''+this.secondsElapsed);}};Sudoku.prototype.shuffle=function(array){var currentIndex=array.length,temporaryValue=0,randomIndex=0;while(currentIndex!==0){randomIndex=Math.floor(Math.random()*currentIndex);currentIndex-=1;temporaryValue=array[currentIndex];array[currentIndex]=array[randomIndex];array[randomIndex]=temporaryValue;}return array;};Sudoku.prototype.boardGenerator=function(n,fixCellsNr){this.boardSolution=[];this.board_init=[];for(var i=0;i<this.nn;i++){this.boardSolution[i]=[];for(var j=0;j<this.nn;j++){this.boardSolution[i][j]=0;}}return this.board_init;};Sudoku.prototype.drawBoard=function(){var index=0,position={x:0,y:0},group_position={x:0,y:0};var sudoku_board=$('<div></div>').addClass('sudoku_board');var sudoku_statistics=$('<div></div>').addClass('statistics').html('<b>Cells:</b> <span class="cells_complete">'+this.cellsComplete+'/'+this.cellsNr+'</span> <b>Time:</b> <span class="time">'+this.secondsElapsed+'</span>');$('#'+this.id).empty();for(i=0;i<this.nn;i++){for(j=0;j<this.nn;j++){position={x:i+1,y:j+1};group_position={x:Math.floor((position.x-1)/this.n),y:Math.floor((position.y-1)/this.n)};var value=this.board[index]>0?this.board[index]:'',value_solution=this.board_init[index]>0?this.board_init[index]:'',cell=$('<div></div>').attr('id',index).addClass('cell').attr('x',position.x).attr('y',position.y).attr('gr',group_position.x+''+group_position.y).html('<span>'+value+'</span>');if(this.displaySolution){$('<span class="solution">('+value_solution+')</span>').appendTo(cell);}if(value>0){cell.addClass('fix');}if(position.x%this.n===0&&position.x!=this.nn){cell.addClass('border_h');}if(position.y%this.n===0&&position.y!=this.nn){cell.addClass('border_v');}cell.appendTo(sudoku_board);index++;}}sudoku_board.appendTo('#'+this.id);var sudoku_console_cotainer=$('<div></div>').addClass('board_console_container');var sudoku_console=$('<div></div>').addClass('board_console');for(i=1;i<=this.nn;i++){$('<div></div>').addClass('num').text(i).appendTo(sudoku_console);}$('<div></div>').addClass('num remove').text('X').appendTo(sudoku_console);$('<div></div>').addClass('num note').text('?').appendTo(sudoku_console);var sudoku_gameover=$('<div class="gameover_container"><div class="gameover">Congratulation! <button class="restart" id="agian">Play Again</button></div></div>');sudoku_console_cotainer.appendTo('#'+this.id).hide();sudoku_console.appendTo(sudoku_console_cotainer);sudoku_statistics.appendTo('#'+this.id);sudoku_gameover.appendTo('#'+this.id).hide();this.resizeWindow();};Sudoku.prototype.ShowResult=function(){console.log('show');var index=0;var r=solve_sudoku(this.boardSolution);if(r>0){for(var i=0;i<this.nn;i++){for(var j=0;j<this.nn;j++){this.cell=document.getElementById(index);this.addValueResult(this.boardSolution[i][j]);index++;}}}else{alert('No Solution');}};Sudoku.prototype.resizeWindow=function(){console.time('resizeWindow');var screen={w:$(window).width(),h:$(window).height()};var b_pos=$('#'+this.id+' .sudoku_board').offset(),b_dim={w:$('#'+this.id+' .sudoku_board').width(),h:$('#'+this.id+' .sudoku_board').height()},s_dim={w:$('#'+this.id+' .statistics').width(),h:$('#'+this.id+' .statistics').height()};var screen_wr=screen.w+s_dim.h+b_pos.top+10;if(screen_wr>screen.h){$('#'+this.id+' .sudoku_board').css('width',screen.h-b_pos.top-s_dim.h-14);$('#'+this.id+' .board_console').css('width',b_dim.h/2);}else{$('#'+this.id+' .sudoku_board').css('width','98%');$('#'+this.id+' .board_console').css('width','50%');}var cell_width=$('#'+this.id+' .sudoku_board .cell:first').width(),note_with=Math.floor(cell_width/2)-1;$('#'+this.id+' .sudoku_board .cell').height(cell_width);$('#'+this.id+' .sudoku_board .cell span').css('line-height',cell_width+'px');$('#'+this.id+' .sudoku_board .cell .note').css({'line-height':note_with+'px',width:note_with,height:note_with});var console_cell_width=$('#'+this.id+' .board_console .num:first').width();$('#'+this.id+' .board_console .num').css('height',console_cell_width);$('#'+this.id+' .board_console .num').css('line-height',console_cell_width+'px');b_dim={w:$('#'+this.id+' .sudoku_board').width(),h:$('#'+this.id+' .sudoku_board').width()};b_pos=$('#'+this.id+' .sudoku_board').offset();c_dim={w:$('#'+this.id+' .board_console').width(),h:$('#'+this.id+' .board_console').height()};var c_pos_new={left:b_dim.w/2-c_dim.w/2+b_pos.left,top:b_dim.h/2-c_dim.h/2+b_pos.top};$('#'+this.id+' .board_console').css({left:c_pos_new.left,top:c_pos_new.top});var gameover_pos_new={left:screen.w/20,top:screen.w/20+b_pos.top};$('#'+this.id+' .gameover').css({left:gameover_pos_new.left,top:gameover_pos_new.top});console.log('screen',screen);console.timeEnd('resizeWindow');};Sudoku.prototype.showConsole=function(cell){$('#'+this.id+' .board_console_container').show();var t=this,oldNotes=$(this.cell).find('.note');$('#'+t.id+' .board_console .num').removeClass('selected');if(t.markNotes){$('#'+t.id+' .board_console .num.note').addClass('selected');$.each(oldNotes,function(){var noteNum=$(this).text();$('#'+t.id+' .board_console .num:contains('+noteNum+')').addClass('selected');});}return this;};Sudoku.prototype.hideConsole=function(cell){$('#'+this.id+' .board_console_container').hide();return this;};Sudoku.prototype.cellSelect=function(cell){this.cell=cell;var value=$(cell).text()|0,position={x:$(cell).attr('x'),y:$(cell).attr('y')},group_position={x:Math.floor((position.x-1)/3),y:Math.floor((position.y-1)/3)},horizontal_cells=$('#'+this.id+' .sudoku_board .cell[x="'+position.x+'"]'),vertical_cells=$('#'+this.id+' .sudoku_board .cell[y="'+position.y+'"]'),group_cells=$('#'+this.id+' .sudoku_board .cell[gr="'+group_position.x+''+group_position.y+'"]'),same_value_cells=$('#'+this.id+' .sudoku_board .cell span:contains('+value+')');$('#'+this.id+' .sudoku_board .cell').removeClass('selected current group');$('#'+this.id+' .sudoku_board .cell span').removeClass('samevalue');$(cell).addClass('selected current');if($(this.cell).hasClass('fix')){$('#'+this.id+' .board_console .num').addClass('no');}else{$('#'+this.id+' .board_console .num').removeClass('no');this.showConsole();this.resizeWindow();}};Sudoku.prototype.addValueResult=function(value){console.log('prepare for addValue',value);var position={x:$(this.cell).attr('x'),y:$(this.cell).attr('y')},group_position={x:Math.floor((position.x-1)/3),y:Math.floor((position.y-1)/3)},horizontal_cells='#'+this.id+' .sudoku_board .cell[x="'+position.x+'"]',vertical_cells='#'+this.id+' .sudoku_board .cell[y="'+position.y+'"]',group_cells='#'+this.id+' .sudoku_board .cell[gr="'+group_position.x+''+group_position.y+'"]',horizontal_cells_exists=$(horizontal_cells+' span:contains('+value+')'),vertical_cells_exists=$(vertical_cells+' span:contains('+value+')'),group_cells_exists=$(group_cells+' span:contains('+value+')'),horizontal_notes=horizontal_cells+' .note:contains('+value+')',vertical_notes=vertical_cells+' .note:contains('+value+')',group_notes=group_cells+' .note:contains('+value+')',old_value=parseInt($(this.cell).not('.notvalid').text())||0;$(this.cell).find('span').text(value);$(this.cell).removeClass('notvalid');console.log('Value added ',value);$(horizontal_notes).remove();$(vertical_notes).remove();$(group_notes).remove();$('#'+this.id+' .statistics .cells_complete').text(''+this.cellsComplete+'/'+this.cellsNr);return this;};Sudoku.prototype.addValue=function(value){console.log('prepare for addValue',value);console.log(this.cell);var position={x:$(this.cell).attr('x'),y:$(this.cell).attr('y')},group_position={x:Math.floor((position.x-1)/3),y:Math.floor((position.y-1)/3)},horizontal_cells='#'+this.id+' .sudoku_board .cell[x="'+position.x+'"]',vertical_cells='#'+this.id+' .sudoku_board .cell[y="'+position.y+'"]',group_cells='#'+this.id+' .sudoku_board .cell[gr="'+group_position.x+''+group_position.y+'"]',horizontal_cells_exists=$(horizontal_cells+' span:contains('+value+')'),vertical_cells_exists=$(vertical_cells+' span:contains('+value+')'),group_cells_exists=$(group_cells+' span:contains('+value+')'),horizontal_notes=horizontal_cells+' .note:contains('+value+')',vertical_notes=vertical_cells+' .note:contains('+value+')',group_notes=group_cells+' .note:contains('+value+')',old_value=parseInt($(this.cell).not('.notvalid').text())||0;if($(this.cell).hasClass('fix')){return;}$(this.cell).find('span').text(value===0?'':value);if(this.cell!==null&&(horizontal_cells_exists.length||vertical_cells_exists.length||group_cells_exists.length)){if(old_value!==value){$(this.cell).addClass('notvalid');}else{$(this.cell).find('span').text('');}}else{$(this.cell).removeClass('notvalid');console.log('Value added ',value);this.boardSolution[position.x-1][position.y-1]=value;$(horizontal_notes).remove();$(vertical_notes).remove();$(group_notes).remove();}console.log(this.boardSolution);this.cellsComplete=$('#'+this.id+' .sudoku_board .cell:not(.notvalid) span:not(:empty)').length;console.log('is game over? ',this.cellsComplete,this.cellsNr,this.cellsComplete===this.cellsNr);if(this.cellsComplete===this.cellsNr){this.gameOver();}$('#'+this.id+' .statistics .cells_complete').text(''+this.cellsComplete+'/'+this.cellsNr);return this;};function dlx_cover(c){c.right.left=c.left;c.left.right=c.right;for(var i=c.down;i!=c;i=i.down){for(var j=i.right;j!=i;j=j.right){j.down.up=j.up;j.up.down=j.down;j.column.size--;}}}function dlx_uncover(c){for(var i=c.up;i!=c;i=i.up){for(var j=i.left;j!=i;j=j.left){j.column.size++;j.down.up=j;j.up.down=j;}}c.right.left=c;c.left.right=c;}function dlx_search(head,solution,k,solutions,maxsolutions){if(head.right==head){solutions.push(solution.slice(0));console.log(solution);if(solutions.length>=maxsolutions){return solutions;}return null;}var c=null;var s=99999;for(var j=head.right;j!=head;j=j.right){if(j.size==0){return null;}if(j.size<s){s=j.size;c=j;}}dlx_cover(c);for(var r=c.down;r!=c;r=r.down){solution[k]=r.row;for(var j=r.right;j!=r;j=j.right){dlx_cover(j.column);}var s=dlx_search(head,solution,k+1,solutions,maxsolutions);if(s!=null){return s;}for(var j=r.left;j!=r;j=j.left){dlx_uncover(j.column);}}dlx_uncover(c);return null;}function dlx_solve(matrix,skip,maxsolutions){var columns=new Array(matrix[0].length);for(var i=0;i<columns.length;i++){columns[i]=new Object();}for(var i=0;i<columns.length;i++){columns[i].index=i;columns[i].up=columns[i];columns[i].down=columns[i];if(i>=skip){if(i-1>=skip){columns[i].left=columns[i-1];}if(i+1<columns.length){columns[i].right=columns[i+1];}}else{columns[i].left=columns[i];columns[i].right=columns[i];}columns[i].size=0;}for(var i=0;i<matrix.length;i++){var last=null;for(var j=0;j<matrix[i].length;j++){if(matrix[i][j]){var node=new Object();node.row=i;node.column=columns[j];node.up=columns[j].up;node.down=columns[j];if(last){node.left=last;node.right=last.right;last.right.left=node;last.right=node;}else{node.left=node;node.right=node;}columns[j].up.down=node;columns[j].up=node;columns[j].size++;last=node;}}}var head=new Object();head.right=columns[skip];head.left=columns[columns.length-1];columns[skip].left=head;columns[columns.length-1].right=head;solutions=[];dlx_search(head,[],0,solutions,maxsolutions);return solutions;}function solve_sudoku(grid){var mat=[];var rinfo=[];for(var i=0;i<9;i++){for(var j=0;j<9;j++){var g=grid[i][j]-1;if(g>=0){var row=new Array(324);row[i*9+j]=1;row[9*9+i*9+g]=1;row[9*9*2+j*9+g]=1;row[9*9*3+(Math.floor(i/3)*3+Math.floor(j/3))*9+g]=1;mat.push(row);rinfo.push({row:i,col:j,n:g+1});}else{for(var n=0;n<9;n++){var row=new Array(324);row[i*9+j]=1;row[9*9+i*9+n]=1;row[9*9*2+j*9+n]=1;row[9*9*3+(Math.floor(i/3)*3+Math.floor(j/3))*9+n]=1;mat.push(row);rinfo.push({row:i,col:j,n:n+1});}}}}var solutions=dlx_solve(mat,0,1);if(solutions.length>0){var r=solutions[0];for(var i=0;i<r.length;i++){grid[rinfo[r[i]].row][rinfo[r[i]].col]=rinfo[r[i]].n;}return solutions.length;}return 0;}Sudoku.prototype.addNote=function(value){console.log('addNote',value);var t=this,oldNotes=$(t.cell).find('.note'),note_width=Math.floor($(t.cell).width()/2);if(oldNotes.length<4){$('<div></div>').addClass('note').css({'line-height':note_width+'px',height:note_width-1,width:note_width-1}).text(value).appendTo(this.cell);}return this;};Sudoku.prototype.removeNote=function(value){if(value===0){$(this.cell).find('.note').remove();}else{$(this.cell).find('.note:contains('+value+')').remove();}return this;};Sudoku.prototype.gameOver=function(){console.log('GAME OVER!');this.status=this.END;$('#'+this.id+' .gameover_container').show();};Sudoku.prototype.run=function(){this.status=this.RUNNING;var t=this;this.drawBoard();$('#'+this.id+' .sudoku_board .cell').on('click',function(e){t.cellSelect(this);});$('#'+this.id+' .board_console .num').on('click',function(e){var value=$.isNumeric($(this).text())?parseInt($(this).text()):0,clickMarkNotes=$(this).hasClass('note'),clickRemove=$(this).hasClass('remove'),numSelected=$(this).hasClass('selected');if(clickMarkNotes){console.log('clickMarkNotes');t.markNotes=!t.markNotes;if(t.markNotes){$(this).addClass('selected');}else{$(this).removeClass('selected');t.removeNote(0).showConsole();}}else{if(t.markNotes){if(!numSelected){if(!value){t.removeNote(0).hideConsole();}else{t.addValue(0).addNote(value).hideConsole();}}else{t.removeNote(value).hideConsole();}}else{t.removeNote(0).addValue(value).hideConsole();}}});$('#'+this.id+' .board_console_container').on('click',function(e){if($(e.target).is('.board_console_container')){$(this).hide();}});$(window).resize(function(){t.resizeWindow();});};$(function(){console.time('loading time');$('head').append('<meta name="viewport" content="initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,width=device-width,height=device-height,target-densitydpi=device-dpi,user-scalable=yes" />');var game=new Sudoku({id:'sudoku_container',fixCellsNr:30,highlight:1,displayTitle:1});game.run();$('#sidebar-toggle').on('click',function(e){$('#sudoku_menu').toggleClass('open-sidebar');});$('#sudoku_menu #restart').on('click',function(){game.init().run();$('#sudoku_menu').removeClass('open-sidebar');});$('.gameover #agian').on('click',function(){game.init().run();$('#sudoku_menu').removeClass('open-sidebar');});$('#sudoku_menu #show').on('click',function(){game.ShowResult();$('#sudoku_menu').toggleClass('open-sidebar');});console.timeEnd('loading time');});

/***/ }),

/***/ "./web/style.css":
/*!***********************!*\
  !*** ./web/style.css ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./web/style.css");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(module.i, content, options);

var exported = content.locals ? content.locals : {};


if (true) {
  if (!content.locals) {
    module.hot.accept(
      /*! !../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./web/style.css",
      function () {
        var newContent = __webpack_require__(/*! !../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./web/style.css");

              newContent = newContent.__esModule ? newContent.default : newContent;

              if (typeof newContent === 'string') {
                newContent = [[module.i, newContent, '']];
              }

              update(newContent);
      }
    )
  }

  module.hot.dispose(function() { 
    update();
  });
}

module.exports = exported;

/***/ })

/******/ });
//# sourceMappingURL=app-b12194adae3638b442a7.bundle.js.map