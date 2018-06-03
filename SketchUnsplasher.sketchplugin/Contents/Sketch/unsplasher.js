var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/unsplasher.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/unsplasher.js":
/*!***************************!*\
  !*** ./src/unsplasher.js ***!
  \***************************/
/*! exports provided: onRandom, onSearch, onCollection, onSettings */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onRandom", function() { return onRandom; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onSearch", function() { return onSearch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onCollection", function() { return onCollection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onSettings", function() { return onSettings; });
var UI = __webpack_require__(/*! sketch/ui */ "sketch/ui"),
    DOM = __webpack_require__(/*! sketch/dom */ "sketch/dom"),
    Settings = __webpack_require__(/*! sketch/settings */ "sketch/settings"),
    SymbolMaster = DOM.SymbolMaster;

var options = initOptions();

function initOptions() {
  var defaults = {
    scaleFactor: 2,
    searchTerms: 'landscape',
    collectionID: '1111575'
  };

  for (var option in defaults) {
    var value = evaluateString(Settings.settingForKey(option));

    if (value === undefined) {
      Settings.setSettingForKey(option, defaults[option]);
    } else {
      defaults[option] = value;
    }
  }

  return defaults;
}

function evaluateString(string) {
  if (string === 'true') {
    return true;
  } else if (string === 'false') {
    return false;
  } else if (string === String(parseInt(string))) {
    return parseInt(string);
  } else if (string === String(parseFloat(string))) {
    return parseFloat(string);
  } else {
    return string;
  }
}

function onRandom(context) {
  unsplash();
}
function onSearch(context) {
  var inputString = UI.getStringFromUser('Enter a search term', options.searchTerms);
  var cleanValue = inputString.replace(/[\s,]+/g, ' ').trim().replace(/\s+/g, ',').toLowerCase();

  if (inputString != 'null') {
    if (cleanValue === '') {
      UI.message('⚠️ You need to enter a keyword to search for.');
    } else {
      options.searchTerms = cleanValue;
      Settings.setSettingForKey('searchTerms', cleanValue);
      unsplash('search');
    }
  }
}
function onCollection(context) {
  var inputString = UI.getStringFromUser('Enter a Collection ID', options.collectionID).trim();

  if (inputString != 'null') {
    if (inputString === '') {
      UI.message('⚠️ You need to enter a valid Collection ID.');
    } else {
      options.collectionID = inputString;
      Settings.setSettingForKey('collectionID', inputString);
      unsplash('collection');
    }
  }
}
function onSettings(context) {
  var items = ['1', '2', '3', '4'];
  var selectedIndex = items.findIndex(function (item) {
    return item === String(options.scaleFactor);
  });
  var selection = UI.getSelectionFromUser('Select the factor for scaling images', items, selectedIndex);
  var ok = selection[2];

  if (ok) {
    var value = parseInt(items[selection[1]]);
    options.scaleFactor = value;
    Settings.setSettingForKey('scaleFactor', value);
  }
}

function unsplash() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'random';
  var document = DOM.getSelectedDocument(),
      selection = document.selectedLayers,
      selectedLayers = document.selectedLayers.layers;
  var imageLayers = selectedLayers.filter(function (layer) {
    return layer.type === 'Shape' || layer.type === 'SymbolInstance';
  });

  if (imageLayers.length === 0) {
    UI.message('Select some shapes or symbols');
  } else {
    var foreignSymbolMasters = getForeignSymbolMasters(document);
    var imageIndex = 1;
    imageLayers.forEach(function (layer) {
      if (layer.type === 'Shape') {
        var size = {
          width: layer.frame.width,
          height: layer.frame.height
        };
        var imageURL = getUnsplashURL(size, type, imageIndex++);

        try {
          var response = requestWithURL(imageURL);

          if (response) {
            var nsimage = NSImage.alloc().initWithData(response);
            var imageData = MSImageData.alloc().initWithImage(nsimage);
            var fill = layer.sketchObject.style().fills().firstObject();
            fill.setFillType(4);
            fill.setImage(imageData);
            fill.setPatternFillType(1);
          } else {
            throw '⚠️ Unsplash says no. Check your internet...';
          }
        } catch (e) {
          log(e);
          UI.message(e);
          return;
        }
      } else {
        var imageOverrides = layer.overrides.filter(function (override) {
          return override.property === 'image';
        });
        var scale = getInstanceScale(layer.sketchObject); // Approx. scale depending on constraints

        var largestOverride,
            largestSize,
            largestArea = 0;
        imageOverrides.forEach(function (override) {
          var affectedLayer = override.sketchObject.affectedLayer();
          var size = {
            width: affectedLayer.frame().width() * scale.x,
            height: affectedLayer.frame().height() * scale.y
          }; // Calculate scale factor for nested overrides

          var IDs = override.path.split('/');

          for (var i = 0; i < IDs.length - 1; i++) {
            var sketchObject = void 0;
            var layerInPath = document.getLayerWithID(IDs[i]);

            if (layerInPath === undefined) {
              sketchObject = getForeignLayerWithID(IDs[i], foreignSymbolMasters);
            } else {
              sketchObject = layerInPath.sketchObject;
            }

            var _scale = getInstanceScale(sketchObject);

            size.width = size.width * _scale.x;
            size.height = size.height * _scale.y;
          }

          var area = size.width * size.height;

          if (area > largestArea) {
            largestArea = area;
            largestSize = size;
            largestOverride = override;
          }
        });

        var _imageURL = getUnsplashURL(largestSize, type, imageIndex++);

        try {
          var _response = requestWithURL(_imageURL);

          if (_response) {
            var _nsimage = NSImage.alloc().initWithData(_response); // layer.setOverrideValue(largestOverride, nsimage); // A bug in the API is preventing this from working


            var _imageData = MSImageData.alloc().initWithImage(_nsimage);

            var overridePoint = largestOverride.sketchObject.overridePoint();
            layer.sketchObject.setValue_forOverridePoint_(_imageData, overridePoint);
          } else {
            throw '⚠️ Unsplash says no. Check your internet...';
          }
        } catch (e) {
          log(e);
          UI.message(e);
          return;
        }
      }
    });
  }
}

function getForeignSymbolMasters(document) {
  var foreignSymbolList = document.sketchObject.documentData().foreignSymbols();
  var symbolMasters = [];
  foreignSymbolList.forEach(function (foreignSymbol) {
    symbolMasters.push(SymbolMaster.fromNative(foreignSymbol.localObject()));
  });
  return symbolMasters;
}

function getForeignLayerWithID(layerID, masters) {
  var match;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = masters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var master = _step.value;
      match = master.sketchObject.layers().find(function (layer) {
        return layer.objectID() == layerID;
      });

      if (match) {
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return match;
}

function getInstanceScale(instance) {
  // Expects sketchObject
  var master = instance.symbolMaster();
  var xScale = instance.frame().width() / master.frame().width();
  var yScale = instance.frame().height() / master.frame().height();
  return {
    x: xScale,
    y: yScale
  };
}

function getUnsplashURL(size, type, index) {
  var width = Math.round(size.width * options.scaleFactor);
  var height = Math.round(size.height * options.scaleFactor);

  if (type === 'search') {
    return 'https://source.unsplash.com/' + width + 'x' + height + '/?' + options.searchTerms + '&sig=' + index;
  } else if (type === 'collection') {
    return 'https://source.unsplash.com/collection/' + options.collectionID + '/' + width + 'x' + height + '/?sig=' + index;
  } else {
    return 'https://source.unsplash.com/random/' + width + 'x' + height + '/?sig=' + index;
  }
}

function requestWithURL(url) {
  var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
  return NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
}

/***/ }),

/***/ "sketch/dom":
/*!*****************************!*\
  !*** external "sketch/dom" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch/dom");

/***/ }),

/***/ "sketch/settings":
/*!**********************************!*\
  !*** external "sketch/settings" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch/settings");

/***/ }),

/***/ "sketch/ui":
/*!****************************!*\
  !*** external "sketch/ui" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch/ui");

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRandom'] = __skpm_run.bind(this, 'onRandom');
that['onRun'] = __skpm_run.bind(this, 'default');
that['onSearch'] = __skpm_run.bind(this, 'onSearch');
that['onCollection'] = __skpm_run.bind(this, 'onCollection');
that['onSettings'] = __skpm_run.bind(this, 'onSettings')

//# sourceMappingURL=unsplasher.js.map