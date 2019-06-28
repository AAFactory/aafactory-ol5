var map2d;
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

$(function() {
    var projection = new ol.proj.Projection({
        code: 'EPSG:3857',
        units: 'm',
        axisOrientation: 'neu',
        global:true,
        extent:[-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244]    
    });
    
    map2d = new ol.Map({
        target : 'map',
        layers : [ layerManager.base, layerManager.midnight, layerManager.gray, layerManager.satellite, layerManager.hybrid ],
        view : new ol.View({
            projection : projection,
            zoom: 17,
            maxZoom: 19,
            center: [14151634.386853758, 4501822.588975821]
        })
    });
    
    updateSize();
    
    $('input[name=baseMap]').on('change', function(e) {
        layerManager.base.setVisible(false);
        layerManager.gray.setVisible(false);
        layerManager.midnight.setVisible(false);
        layerManager.satellite.setVisible(false);
        
        var layer = layerManager[$(this).attr('id')];
        layer.setVisible(true);
    });
    $('.aaf-ol5-layer').on('change', function(e) {
        layerManager[$(this).attr('id')].setVisible($(this).prop('checked'))
    });
});

var updateSize = function() {
//    var w = $(window).width();
    var h = $(window).height();
    $('#map').css('width', '100%');
    $('#map').height(h);
    map2d.updateSize();
}

$(window).resize(function() { updateSize(); });   