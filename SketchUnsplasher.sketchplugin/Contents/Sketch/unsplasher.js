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
/*! exports provided: onUnsplash */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onUnsplash", function() { return onUnsplash; });
var UI = __webpack_require__(/*! sketch/ui */ "sketch/ui"),
    DOM = __webpack_require__(/*! sketch/dom */ "sketch/dom"),
    SymbolMaster = DOM.SymbolMaster;

function onUnsplash(context) {
  var document = DOM.getSelectedDocument(),
      selection = document.selectedLayers,
      selectedLayers = document.selectedLayers.layers;
  var imageLayers = selectedLayers.filter(function (layer) {
    return layer.type === 'Shape' || layer.type === 'SymbolInstance';
  });

  if (imageLayers.length === 0) {
    UI.message('Select one or more shapes or symbols');
  } else {
    var foreignSymbolMasters = getForeignSymbolMasters(document);

    try {
      imageLayers.forEach(function (layer) {
        if (layer.type === 'Shape') {
          var size = {
            width: layer.frame.width,
            height: layer.frame.height
          };
          var imageURL = randomUnsplashURL(size);
          var response = requestWithURL(imageURL);

          if (response) {
            var nsimage = NSImage.alloc().initWithData(response);
            var imageData = MSImageData.alloc().initWithImage(nsimage);
            var fill = layer.sketchObject.style().fills().firstObject();
            fill.setFillType(4);
            fill.setImage(imageData);
            fill.setPatternFillType(1);
          } else {
            throw 'Unsplash says no. Check your internet...';
          }
        } else {
          var imageOverrides = layer.overrides.filter(function (override) {
            return override.property === 'image';
          });
          var largestOverride,
              largestSize,
              largestArea = 0;
          imageOverrides.forEach(function (override) {
            var affectedLayer = override.sketchObject.affectedLayer();
            var size = {
              width: affectedLayer.frame().width(),
              height: affectedLayer.frame().height()
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

              var scale = getInstanceScale(sketchObject);
              size.width = size.width * scale.x;
              size.height = size.height * scale.y;
            }

            var area = size.width * size.height;

            if (area > largestArea) {
              largestArea = area;
              largestSize = size;
              largestOverride = override;
            }
          });

          var _imageURL = randomUnsplashURL(largestSize);

          var _response = requestWithURL(_imageURL);

          if (_response) {
            var _nsimage = NSImage.alloc().initWithData(_response); // layer.setOverrideValue(largestOverride, nsimage); // A bug in the API is preventing this from working


            var _imageData = MSImageData.alloc().initWithImage(_nsimage);

            var overridePoint = largestOverride.sketchObject.overridePoint();
            layer.sketchObject.setValue_forOverridePoint_(_imageData, overridePoint);
          } else {
            throw 'Unsplash says no. Check your internet...';
          }
        }
      });
    } catch (e) {
      UI.message(e);
    }
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
  xScale = instance.frame().width() / master.frame().width();
  yScale = instance.frame().height() / master.frame().height();
  return {
    x: xScale,
    y: yScale
  };
}

function randomUnsplashURL(size) {
  var width = Math.round(size.width * 2);
  var height = Math.round(size.height * 2);
  return 'https://source.unsplash.com/random/' + width + 'x' + height;
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
that['onUnsplash'] = __skpm_run.bind(this, 'onUnsplash');
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=unsplasher.js.map