$(function() {
    map2d = new ol.Map({
        target : 'map',
        layers : [ layerManager.base, layerManager.midnight, layerManager.gray, layerManager.satellite, layerManager.hybrid ],
        view : new ol.View({
            projection : ol.proj.get('EPSG:3857'),
            zoom: 17,
            minZoom: 9,
            maxZoom: 19,
            center: [14151634.386853758, 4501822.588975821]
        })
    });
//    map2d.getControls().item(0).setMap(null)
    map2d.addControl(new ol.control.ZoomSlider());
    $('#slider-container').append("<div class='gauge'><div class='scale'><div class='vertical'></div></div><div class='highlight'></div></div>");
    $('.ol-zoomslider.ol-unselectable.ol-control').appendTo($('#slider-container'));
    $('#slider-container').append("<div class='zoom-in'>+</div><div class='zoom-out'>-</div>");
    for (var i = 0; i < 11; i++) {
        $('#slider-container .gauge .scale').append("<div class='horizontal'></div>");
    }
    
    
    /* -------------------------------------------------- 
     * Map Fires 
     * ------------------------------------------------ */
    map2d.on('singleclick', function(e) {
        console.log(e) 
        map2d.forEachFeatureAtPixel(e.pixel, function(feature) {
            console.log(feature.getGeometry());
        });
    });
    
    map2d.on('moveend', function(e) {
        var height = 14*(map2d.getView().getZoom() - 9);
        var topSize = 142 - height - 4;
        $('#slider-container .gauge .highlight').css('height', height)
        $('#slider-container button').css('top', topSize)
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