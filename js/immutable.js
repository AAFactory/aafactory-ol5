/* -------------------------------------------------- 
 * define packages
 * ------------------------------------------------ */
var aaf = {}
aaf.ol5 = {}
aaf.ol5.immutable = { VWORLD_KEY: '1074A244-16DE-3761-B6BC-B8E884F91409' }
aaf.ol5.interaction = {}

/* -------------------------------------------------- 
 * define immutable value
 * ------------------------------------------------ */
var map2d;

var projection3857 = new ol.proj.Projection({
    code: 'EPSG:3857',
    units: 'm',
    axisOrientation: 'neu',
    global:true,
    extent:[-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244]    
});

var layerManager = {
    key: '',
    base: new ol.layer.Tile({
        visible: true,
        source: new ol.source.XYZ({
            url: 'http://api.vworld.kr/req/wmts/1.0.0/' + aaf.ol5.immutable.VWORLD_KEY + '/Base/{z}/{y}/{x}.png',
        }),
        name: 'vworld-base'
    }),
    gray: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://api.vworld.kr/req/wmts/1.0.0/' + aaf.ol5.immutable.VWORLD_KEY + '/gray/{z}/{y}/{x}.png',
        })
    }),  
    midnight: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://api.vworld.kr/req/wmts/1.0.0/' + aaf.ol5.immutable.VWORLD_KEY + '/midnight/{z}/{y}/{x}.png',
        })
    }),
    satellite: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://api.vworld.kr/req/wmts/1.0.0/' + aaf.ol5.immutable.VWORLD_KEY + '/Satellite/{z}/{y}/{x}.jpeg',
        })
    }),
    hybrid: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://api.vworld.kr/req/wmts/1.0.0/' + aaf.ol5.immutable.VWORLD_KEY + '/Hybrid/{z}/{y}/{x}.png',
        })
    }),
    osm: new ol.layer.Tile({
        visible: false,
        source: new ol.source.OSM()
    }),
}

var styleFunction = function(feature) {
    var circle = new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({color: 'white', width: 2})
    });
    var marker = new ol.style.Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        offset: [0,0],
        src: 'img/map-marker-2-24.png'
    });
    var styles = {
        'Point': [new ol.style.Style({ image: circle }), new ol.style.Style({ image: marker })],
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiPoint': new ol.style.Style({
            image: circle
        }),
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.1)'
            })
        }),
        'Polygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'magenta',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'magenta'
            }),
            image: new ol.style.Circle({
                radius: 10,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'magenta'
                })
            })
        }),
        'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        })
    };
    
    return styles[feature.getGeometry().getType()];
};

var drawStyleFunction = function(feature) {
    var styles = {
        'Point': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 3,
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.7)'
                }),
                stroke: new ol.style.Stroke({color: 'blue', width: 1})
            })
        }),
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                width: 2
            })
        }),
        'Polygon': new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        })
    };
    return styles[feature.getGeometry().getType()];
};
