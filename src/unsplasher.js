const UI = require('sketch/ui'),
      DOM = require('sketch/dom'),
      Settings = require('sketch/settings'),
      SymbolMaster = DOM.SymbolMaster;

var options = initOptions();

function initOptions() {
  const defaults = {
    scaleFactor: 2,
    searchTerms: 'landscape',
    collectionID: 1111575
  };
  for (let option in defaults) {
    let value = evaluateString(Settings.settingForKey(option));
    if (value === undefined) {
      Settings.setSettingForKey(option, defaults[option]);
    } else {
      defaults[option] = value;
    }
  }
  return defaults
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

export function onUnsplash(context) {

  var document = DOM.getSelectedDocument(),
      selection = document.selectedLayers,
      selectedLayers = document.selectedLayers.layers;

  let imageLayers = selectedLayers.filter(layer => layer.type === 'Shape' || layer.type === 'SymbolInstance');

  if (imageLayers.length === 0) {
    UI.message('Select some shapes or symbols');
  } else {

    let foreignSymbolMasters = getForeignSymbolMasters(document);

    imageLayers.forEach(layer => {

      if (layer.type === 'Shape') {

        let size = {
          width: layer.frame.width,
          height: layer.frame.height
        };

        let imageURL = randomUnsplashURL(size);

        try {
          let response = requestWithURL(imageURL);
          if (response) {
            let nsimage = NSImage.alloc().initWithData(response);
            let imageData = MSImageData.alloc().initWithImage(nsimage);
            let fill = layer.sketchObject.style().fills().firstObject();
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

        let imageOverrides = layer.overrides.filter(override => override.property === 'image');
        let scale = getInstanceScale(layer.sketchObject); // Approx. scale depending on constraints
        let largestOverride, largestSize, largestArea = 0;

        imageOverrides.forEach((override) => {

          let affectedLayer = override.sketchObject.affectedLayer();

          let size = {
            width: affectedLayer.frame().width() * scale.x,
            height: affectedLayer.frame().height() * scale.y
          };

          // Calculate scale factor for nested overrides
          let IDs = override.path.split('/');

          for (let i = 0; i < IDs.length - 1; i++) {
            let sketchObject;

            let layerInPath = document.getLayerWithID(IDs[i]);
            if (layerInPath === undefined) {
              sketchObject = getForeignLayerWithID(IDs[i], foreignSymbolMasters);
            } else {
              sketchObject = layerInPath.sketchObject;
            }

            let scale = getInstanceScale(sketchObject);
            size.width = size.width * scale.x;
            size.height = size.height * scale.y;
          }

          let area = size.width * size.height;
          if (area > largestArea) {
            largestArea = area;
            largestSize = size;
            largestOverride = override;
          }

        });

        let imageURL = randomUnsplashURL(largestSize);

        try {
          let response = requestWithURL(imageURL);
          if (response) {
            let nsimage = NSImage.alloc().initWithData(response);
            // layer.setOverrideValue(largestOverride, nsimage); // A bug in the API is preventing this from working
            let imageData = MSImageData.alloc().initWithImage(nsimage);
            let overridePoint = largestOverride.sketchObject.overridePoint();
            layer.sketchObject.setValue_forOverridePoint_(imageData, overridePoint);
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

export function onSettings(context) {
  let items = ['1', '2', '3', '4'];
  let selectedIndex = items.findIndex(item => item === String(options.scaleFactor));

  let selection = UI.getSelectionFromUser(
    'Select the factor for scaling images',
    items,
    selectedIndex
  );

  let ok = selection[2];
  if (ok) {
    let value = parseInt(items[selection[1]]);
    options.scaleFactor = value;
    Settings.setSettingForKey('scaleFactor', value);
  }
}

function getForeignSymbolMasters(document) {
  let foreignSymbolList = document.sketchObject.documentData().foreignSymbols();
  let symbolMasters = [];
  foreignSymbolList.forEach(foreignSymbol => {
    symbolMasters.push(SymbolMaster.fromNative(foreignSymbol.localObject()));
  });
  return symbolMasters;
}

function getForeignLayerWithID(layerID, masters) {
  let match;
  for (let master of masters) {
    match = master.sketchObject.layers().find(layer => layer.objectID() == layerID);
    if (match) {break;}
  }
  return match;
}

function getInstanceScale(instance) { // Expects sketchObject
  let master = instance.symbolMaster();
  let xScale = instance.frame().width() / master.frame().width();
  let yScale = instance.frame().height() / master.frame().height();
  return {x: xScale, y: yScale};
}

function randomUnsplashURL(size) {
  let width = Math.round(size.width * options.scaleFactor);
  let height = Math.round(size.height * options.scaleFactor);
  let randomImageIndex = Math.floor(Math.random() * 1000);
  return 'https://source.unsplash.com/random/' + width + 'x' + height + '/?sig=' + randomImageIndex;
}

function requestWithURL(url) {
  let request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
  return NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
}
