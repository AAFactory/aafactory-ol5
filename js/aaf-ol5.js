/* -------------------------------------------------- 
 * Openlayers5 extensions
 * ------------------------------------------------ */
ol.Map.prototype.getLayer = function(name) {
    var targetLayer = null;
    for (var i = 0; i < this.getLayers().getLength(); i++) {
        var layer = this.getLayers().item(i);
        if (layer.get('name') === name) {
            targetLayer = layer;
            break;
        }
    }
    return targetLayer;
}

aaf.ol5.helper = {}
aaf.ol5.helper.overlayGeoJSON = function(data, option) {
    var style = option.style ? option.style : [ new ol.style.Style({
        stroke : new ol.style.Stroke({
            color : 'green',
            width : 5
        }),
        image : new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'img/map-marker-2-24.png'
        })
    })]
    var geoJSONLayer = new ol.layer.Vector({
        source : new ol.source.Vector({
            features : (new ol.format.GeoJSON()).readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
        }),
        style: style
    });    
    
    if (option.fitExtent) {
        map2d.getView().fit(geoJSONLayer.getSource().getExtent(), map2d.getSize())
    }
    geoJSONLayer.setMap(map2d);
}
aaf.ol5.helper.parseFile = function(file, type) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        console.log(data);
        if (type === 'KML') {
            var kmlLayer = new ol.layer.Vector({
                source : new ol.source.Vector({
                    features : (new ol.format.KML({extractStyles: false})).readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
                })
            });    
            
            map2d.getView().fit(kmlLayer.getSource().getExtent(), map2d.getSize())
            kmlLayer.setMap(map2d);
        } else if (type === 'GeoJSON') {
            aaf.ol5.helper.overlayGeoJSON(data, {});
        }
    };
    reader.readAsText(file);
} 
aaf.ol5.helper.searchAddress = function(query) {
    var param = {
        service: 'search'
        ,request: 'search'
        ,version: 2.0
        ,crs: 'EPSG:900913'
        ,size: 10
        ,page: 1
        ,query: query
        ,type: 'address'
        ,category: 'road'
        ,format: 'json'
        ,errorformat: 'json'
        ,key: aaf.ol5.immutable.VWORLD_KEY
    }
    $.ajax({
        crossOrigin: true,
        type: 'GET',
        url: "http://api.vworld.kr/req/search",
        dataType: 'json',
        data: param,
        cache: false,
        success: function(data) {
            console.log(data)
        },
        error : function(request, status, error) {
            console.error(error)
        }
    });
}

aaf.ol5.interaction.DrawFeature = function(map) {
    var _map = map;
    var _draw; 
    var _source = new ol.source.Vector({wrapX: false});
    var _vector = new ol.layer.Vector({
        source: _source,
        style: styleFunction,
        name: 'aaf-ol5-draw-feature'
    });
    _map.addLayer(_vector);
    
    this.clearAll = function() {
        _source.clear();
    }
    
    this.addInteraction = function(value) {
        if (value !== 'None') {
            _draw = new ol.interaction.Draw({
                source: _source,
                type: value,
                style: drawStyleFunction
            });
            _map.addInteraction(_draw);
        }
    }
    
    this.removeInteraction = function() {
        if (_draw) _map.removeInteraction(_draw)
    }
}

aaf.ol5.interaction.DrawShape = function(map) {
    var _map = map;
    var _draw; 
    var _source = new ol.source.Vector({wrapX: false});
    var _vector = new ol.layer.Vector({
        source: _source,
        name: 'aaf-ol5-draw-shape'
    });
    _map.addLayer(_vector);
    
    this.clearAll = function() {
        _source.clear();
    }
    
    this.addInteraction = function(value) {
        if (value !== 'None') {
            var geometryFunction;
            if (value === 'Square') {
                value = 'Circle';
                geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
            } else if (value === 'Box') {
                value = 'Circle';
                geometryFunction = ol.interaction.Draw.createBox();
            } else if (value === 'Star') {
                value = 'Circle';
                geometryFunction = function(coordinates, geometry) {
                    var center = coordinates[0];
                    var last = coordinates[1];
                    var dx = center[0] - last[0];
                    var dy = center[1] - last[1];
                    var radius = Math.sqrt(dx * dx + dy * dy);
                    var rotation = Math.atan2(dy, dx);
                    var newCoordinates = [];
                    var numPoints = 12;
                    for (var i = 0; i < numPoints; ++i) {
                        var angle = rotation + i * 2 * Math.PI / numPoints;
                        var fraction = i % 2 === 0 ? 1 : 0.5;
                        var offsetX = radius * fraction * Math.cos(angle);
                        var offsetY = radius * fraction * Math.sin(angle);
                        newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                    }
                    newCoordinates.push(newCoordinates[0].slice());
                    if (!geometry) {
                        geometry = new ol.geom.Polygon([newCoordinates]);
                    } else {
                        geometry.setCoordinates([newCoordinates]);
                    }
                    return geometry;
                };
            }
            _draw = new ol.interaction.Draw({
                source: _source,
                type: value,
                geometryFunction: geometryFunction
            });
            _map.addInteraction(_draw);
        }
    }
    
    this.removeInteraction = function() {
        if (_draw) _map.removeInteraction(_draw)
    }
}
