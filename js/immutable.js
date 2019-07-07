var map2d;

var projection3857 = new ol.proj.Projection({
    code: 'EPSG:3857',
    units: 'm',
    axisOrientation: 'neu',
    global:true,
    extent:[-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244]    
});

var layerManager = {
    base: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png',
        })
    }),
    gray: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://xdworld.vworld.kr:8080/2d/gray/service/{z}/{x}/{y}.png'
        })
    }),  
    midnight: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://xdworld.vworld.kr:8080/2d/midnight/service/{z}/{x}/{y}.png'
        })
    }),
    satellite: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg'
        })
    }),
    hybrid: new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://xdworld.vworld.kr:8080/2d/Hybrid/service/{z}/{x}/{y}.png'
        })
    }),
    osm: new ol.layer.Tile({
        visible: true,
        source: new ol.source.OSM()
    }),
}

var styleFunction = function(feature) {
    var image = new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.6)'
        }),
        stroke: new ol.style.Stroke({color: 'red', width: 2})
    });

    var styles = {
        'Point': new ol.style.Style({
            image: image
        }),
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
            image: image
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

var drawerStyleFunction = function(feature) {
    var styles = {
        'Point': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 3,
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.7)'
                }),
                stroke: new ol.style.Stroke({color: 'blue', width: 2})
            })
        }),
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
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
