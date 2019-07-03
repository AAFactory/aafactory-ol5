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
        visible : true,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png',
        })
    }),
    gray: new ol.layer.Tile({
        visible : false,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/gray/service/{z}/{x}/{y}.png'
        })
    }),  
    midnight: new ol.layer.Tile({
        visible : false,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/midnight/service/{z}/{x}/{y}.png'
        })
    }),
    satellite: new ol.layer.Tile({
        visible : false,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg'
        })
    }),
    hybrid: new ol.layer.Tile({
        visible : false,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/Hybrid/service/{z}/{x}/{y}.png'
        })
    }) 
}
 