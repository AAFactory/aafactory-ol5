$(function() {
    map2d = new ol.Map({
        target : 'map',
        layers : [ layerManager.base, layerManager.midnight, layerManager.gray, layerManager.satellite, layerManager.osm, layerManager.hybrid ],
        view : new ol.View({
            projection : ol.proj.get('EPSG:3857'),
            zoom: 10,
            /*minZoom: 9,*/
            /*maxZoom: 19,*/
            center: [14151634.386853758, 4501822.588975821],
            resolutions: [4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395, 0.29858214173896974, 0.14929107086948487]
        })
    });
//    map2d.getControls().item(0).setMap(null)
    map2d.addControl(new ol.control.ZoomSlider());
    $('#slider-container').append("<div class='gauge'><div class='scale'><div class='vertical'></div></div><div class='highlight'></div></div>");
    $('.ol-zoomslider.ol-unselectable.ol-control').appendTo($('#slider-container'));
    $('#slider-container').append("<div class='zoom-in'><img src='img/plus-8-12.png'></div><div class='zoom-out'><img src='img/minus-2-12.png'></div>");
    // 0 ~ 15 = 16step
    for (var i = 0; i < 16; i++) {
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
        var height = 10*(map2d.getView().getZoom());
//        var topSize = 155 - height - 4;
        $('#slider-container .gauge .highlight').css('height', height)
//        $('#slider-container button').css('top', topSize)
    });
     
    var line = turf.lineString([
                                [-77.031669, 38.878605],
                                [-77.029609, 38.881946],
                                [-77.020339, 38.884084],
                                [-77.025661, 38.885821],
                                [-77.021884, 38.889563],
                                [-77.019824, 38.892368]
                            ]);
    
    
    /* -------------------------------------------------- 
     * turf.js example 
     * ------------------------------------------------ */
    var line = turf.lineString([
                                [127.12520062923431, 37.468620863311514],
                                [127.12506115436551, 37.469446846111424],
                                [127.1251684427261, 37.470426092245745],
                                [127.12541520595549, 37.4713457204128],
                                [127.12573707103728, 37.47207800882428],
                                [127.12665975093842, 37.473227516860334]
                            ]);
    var pointArray = [];
    pointArray.push(turf.point([127.1255761384964, 37.46912752394621]));  
    pointArray.push(turf.point([127.12463200092313, 37.468748593207025]));  
    pointArray.push(turf.point([127.12497532367703, 37.47138829551686]));  
    pointArray.push(turf.point([127.1261769533157, 37.47205246400047]));  
    pointArray.forEach(function(point) {
        var nearestPoint = turf.nearestPointOnLine(line, point, {units: 'miles'}); 
//        overlayGeoJSON(nearestPoint, {});
        var bearing = turf.bearing(point, nearestPoint);
        var rotate = (180 + bearing) * (Math.PI/180)
        overlayGeoJSON(point, {style: [ new ol.style.Style({
            image : new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: 'img/arrow-down-4-24.png',
                rotation: rotate
            })
        })]});
    });
    
    setTimeout(function() { overlayGeoJSON(line, {fitExtent: true}) }, 1000)
    
    
    /* -------------------------------------------------- 
     * Event Listeners 
     * ------------------------------------------------ */
    $('input[name=baseMap]').on('change', function(e) {
        layerManager.osm.setVisible(false);
        layerManager.base.setVisible(false);
        layerManager.gray.setVisible(false);
        layerManager.midnight.setVisible(false);
        layerManager.satellite.setVisible(false);
        
        var layer = layerManager[$(this).attr('id')];
        layer.setVisible(true);
        
        if ($(this).attr('id') === 'osm') {
            $('.aaf-ol5-vworld-logo').css('display', 'none')
        } else {
            $('.aaf-ol5-vworld-logo').css('display', 'block')
        }
    });
    
    $('.aaf-ol5-layer').on('change', function(e) {
        layerManager[$(this).attr('id')].setVisible($(this).prop('checked'))
    });
    
    var _draw; 
    var _source = new ol.source.Vector({wrapX: false});
    var _vector = new ol.layer.Vector({
        source: _source,
        style: styleFunction
    });
    map2d.addLayer(_vector);
    
    var addInteraction = function(value) {
        if (value !== 'None') {
            _draw = new ol.interaction.Draw({
                source: _source,
                type: value,
                style: drawerStyleFunction
            });
            map2d.addInteraction(_draw);
        }
    }
    $('#type').on('change', function(e) {
        map2d.removeInteraction(_draw);
        addInteraction($(this).val());
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
            overlayGeoJSON(data, {});
        }
    };
    reader.readAsText(file);
} 

var overlayGeoJSON = function(data, option) {
    var style = option.style ? option.style : [ new ol.style.Style({
        stroke : new ol.style.Stroke({
            color : 'green',
            width : 5
        }),
        image : new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: 'img/arrow-down-4-16.png',
            rotation: 180 * (Math.PI/180)
        })
    })]
    var geoJSONLayer = new ol.layer.Vector({
        source : new ol.source.Vector({
            features : (new ol.format.GeoJSON()).readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
        }),
        style: style
    });    
    
    if (option.fitExtent) {
        console.log(data)
        map2d.getView().fit(geoJSONLayer.getSource().getExtent(), map2d.getSize())
    }
    geoJSONLayer.setMap(map2d);
}