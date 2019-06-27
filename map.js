var map2d;
var vworldTile = {
    base: new ol.layer.Tile({
        visible : true,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png',
        })
    }),
    midnight: new ol.layer.Tile({
        visible : false,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/midnight/service/{z}/{x}/{y}.png'
        })
    }),
    gray: new ol.layer.Tile({
        visible : false,
        source : new ol.source.XYZ({
            url : 'http://xdworld.vworld.kr:8080/2d/gray/service/{z}/{x}/{y}.png'
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
        layers : [ vworldTile.base, vworldTile.midnight, vworldTile.gray ],
        view : new ol.View({
            projection : projection,
            zoom: 17,
            maxZoom: 19,
            center: [14151634.386853758, 4501822.588975821]
        })
    });
    
    updateSize();
});

var updateSize = function() {
    var w = $(window).width();
    var h = $(window).height();
    $('#map').width(w);
    $('#map').height(h);
    map2d.updateSize();
}

$(window).resize(function() { updateSize(); });
    
    