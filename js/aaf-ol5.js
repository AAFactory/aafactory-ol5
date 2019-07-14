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

aaf.ol5.interaction.Measure = function(map) {
    
    /**
     * Currently drawn feature.
     * @type {module:ol/Feature~Feature}
     */
    var sketch;


    /**
     * The help tooltip element.
     * @type {Element}
     */
    var helpTooltipElement;


    /**
     * Overlay to show the help messages.
     * @type {module:ol/Overlay}
     */
    var helpTooltip;


    /**
     * The measure tooltip element.
     * @type {Element}
     */
    var measureTooltipElement;


    /**
     * Overlay to show the measurement.
     * @type {module:ol/Overlay}
     */
    var measureTooltip;


    /**
     * Message to show when the user is drawing a polygon.
     * @type {string}
     */
    var continuePolygonMsg = 'Click to continue drawing the polygon';


    /**
     * Message to show when the user is drawing a line.
     * @type {string}
     */
    var continueLineMsg = 'Click to continue drawing the line';
    
    var _map = map;
    var _draw; 
    var _source = new ol.source.Vector();
    var _vector = new ol.layer.Vector({
        source: _source,
        name: 'aaf-ol5-measure'
    });
    _map.addLayer(_vector);
    
    /**
     * Format length output.
     * @param {module:ol/geom/LineString~LineString} line The line.
     * @return {string} The formatted length.
     */
    var formatLength = function(line) {
        var length = ol.sphere.getLength(line);
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
            ' ' + 'm';
        }
        return output;
    };
    
    /**
     * Format area output.
     * @param {module:ol/geom/Polygon~Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
    var formatArea = function(polygon) {
        var area = ol.sphere.getArea(polygon);
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
        }
        return output;
    };
    
    /**
     * Creates a new measure tooltip
     */
    function createMeasureTooltip() {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'tooltip tooltip-measure';
        measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        _map.addOverlay(measureTooltip);
    }

    /**
     * Creates a new help tooltip
     */
    function createHelpTooltip() {
        if (helpTooltipElement) {
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'tooltip hidden';
        helpTooltip = new ol.Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        _map.addOverlay(helpTooltip);
    }
    
    this.addInteraction = function(value) {
        var type;
        if (value == 'area') {
            type = 'Polygon'
        } else if (value == 'distance') {
            type = 'LineString'
        } 
        if (type) {
            _draw = new ol.interaction.Draw({
                source: _source,
                type: type,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        lineDash: [10, 10],
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.7)'
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        })
                    })
                })
            });
            _map.addInteraction(_draw);
            createMeasureTooltip();
            createHelpTooltip();
            
            var listener;
            _draw.on('drawstart', function(evt) {
                // set sketch
                sketch = evt.feature;
                
                /** @type {module:ol/coordinate~Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;
                
                listener = sketch.getGeometry().on('change', function(evt) {
                    var geom = evt.target;
                    var output;
                    if (geom instanceof ol.geom.Polygon) {
                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof ol.geom.LineString) {
                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            }, this);
            
            _draw.on('drawend', function() {
                measureTooltipElement.className = 'tooltip tooltip-static';
                measureTooltip.setOffset([0, -7]);
                // unset sketch
                sketch = null;
                // unset tooltip so that a new one can be created
                measureTooltipElement = null;
                createMeasureTooltip();
                ol.Observable.unByKey(listener);
            }, this);
        }
    }
    
    this.removeInteraction = function() {
        if (_draw) _map.removeInteraction(_draw)
    }
    
    this.clearAll = function() {
        _source.clear();
        _map.getOverlays().forEach(function(overlay) {
            overlay.setMap(null)
        });
        $('#none').trigger('click')
    }
}