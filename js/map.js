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
    map2d.getControls().item(0).setMap(null)
    
    /* -------------------------------------------------- 
     * Map Fires 
     * ------------------------------------------------ */
    map2d.on('singleclick', function(e) {
        console.log(e) 
        map2d.forEachFeatureAtPixel(e.pixel, function(feature) {
            console.log(feature.getGeometry());
        });
    });
    
    
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
    updateSize();
    $(window).resize(function() { updateSize(); });
});

var updateSize = function() {
//    var w = $(window).width();
    var h = $(window).height();
    $('#map').css('width', '100%');
    $('#map').height(h);
    map2d.updateSize();
}

var handleFiles = function(files, type) {
    parseFile(files[0], type)
} 

var parseFile = function(file, type) {
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
            var geoJSONLayer = new ol.layer.Vector({
                source : new ol.source.Vector({
                    features : (new ol.format.GeoJSON()).readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
                })
            });    
            
            map2d.getView().fit(geoJSONLayer.getSource().getExtent(), map2d.getSize())
            geoJSONLayer.setMap(map2d);
        }
    };
    reader.readAsText(file);
} 