var layerTopomapper = new L.tileLayer('http://144.76.234.107/cgi-bin/ta/tilecache.py/1.0.0/topomapper_v2/{z}/{x}/{y}.jpg', {
    maxNativeZoom: 13,
    attribution: 'Tiles: &copy; <a href="http://nakarte.tk/" target="_blank">nakarte.tk</a>'
});

var layerOpenTopoMap = new L.TileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    minZoom: 1,
    maxZoom: 17,
    detectRetina: true,
    attribution: 'Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="http://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var layerOpenCycleMap = new L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>, under ODbL | Tiles: &copy; ' + '<a href="http://www.opencyclemap.org/" target="_blank">OpenCycleMap</a>'
});

var layerMapboxImagery = new L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGFzdCIsImEiOiJjaXU5dWY2ZmowMDAwMnltZGpudHljYWg2In0.9ZcYfFSe65DvQq6qkYcmWg', {
    maxZoom: 17,
    attribution: 'Tiles &copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
});

var BingLayer = L.TileLayer.extend({
    getTileUrl: function (tilePoint) {
        this._adjustTilePoint(tilePoint);
        return L.Util.template(this._url, {
            s: this._getSubdomain(tilePoint),
            q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
        });
    },
    _quadKey: function (x, y, z) {
        var quadKey = [];
        for (var i = z; i > 0; i--) {
            var digit = '0';
            var mask = 1 << (i - 1);
            if ((x & mask) != 0) {
                digit++;
            }
            if ((y & mask) != 0) {
                digit++;
                digit++;
            }
            quadKey.push(digit);
        }
        return quadKey.join('');
    }
});

var layerBingAerial = new BingLayer('http://t{s}.tiles.virtualearth.net/tiles/a{q}.jpeg?g=2732', {
    subdomains: ['0', '1', '2', '3', '4'],
    attribution: '&copy; <a href="http://bing.com/maps">Bing Maps</a>'
});

var layerTopo1000 = new L.tileLayer('http://{s}.tiles.nakarte.tk/topo1000/{z}/{x}/{y}', {
    tms: true,
    maxNativeZoom: 13,
    attribution: 'Tiles: &copy; <a href="http://nakarte.tk/" target="_blank">nakarte.tk</a>'
});

var map = new L.Map('map', {
    layers: [layerTopomapper],
    center: [54.710,159.740],
    zoom: 8
});

map.attributionControl.addAttribution('Icons &copy; <a href="https://mapicons.mapsmarker.com/">Map Icons Collection</a>');
new L.Hash(map);
L.control.scale().addTo(map);

var layerPoi = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: "img/information.png",
                iconSize: [32, 37],
                iconAnchor: [16, 36],
                popupAnchor: [0, -36]
            }),
            title: feature.properties.name,
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var name = '<b>' + feature.properties.name + '</b>' ? '<b>' + feature.properties.name + '</b>' + '</br>' : '';
            var comment = feature.properties.cmnt ? feature.properties.cmnt : '';
            var content = name + comment;
            layer.bindPopup(content);
        };
    }
});
$.getJSON("data/poi.geojson", function (data) {
    layerPoi.addData(data);
});

var campsPoints = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: "img/temple.png",
                iconSize: [32, 37],
                iconAnchor: [16, 36],
                popupAnchor: [0, -36]
            }),
            title: feature.properties.name,
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var name = '<b>' + feature.properties.name + '</b>' ? '<b>' + feature.properties.name + '</b>' + '</br>' : '';
            var nights = feature.properties.nights ? 'Ночевка: ' + feature.properties.nights + '</br>' : '';
            var comment = feature.properties.cmnt ? feature.properties.cmnt : '';
            var content = name + nights + comment;
            layer.bindPopup(content);
        };
    }
});
$.getJSON("data/camps.geojson", function (data) {
    campsPoints.addData(data);
});

var dashArrayType = { "пунктир": "8,6", "": null };

var layerGPSTrack = L.geoJson(null, {
    style: function (feature) {
        return {
            color: feature.properties.id,
            weight: 4,
            opacity: 1,
            dashArray: dashArrayType[feature.properties.line]
        };
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var part = feature.properties.name ? 'Часть: ' + feature.properties.name + '</br>' : '';
            var date = feature.properties.date ? 'Дата: ' + feature.properties.date + '</br>' : '';
            var length = feature.properties.lengh ? 'Путь: ' + feature.properties.lengh + ' км' : '';
            var content = part + date + length;
            layer.bindPopup(content);
        };
        layer.on({
            mouseover: function (e) {
                var layer = e.target;
                layer.setStyle({
                    weight: 4,
                    color: "#00FFFF",
                    opacity: 1
                });
                if (!L.Browser.ie && !L.Browser.opera) {
                    layer.bringToFront();
                }
            },
            mouseout: function (e) {
                layerGPSTrack.resetStyle(e.target);
            }
        });
    }
});
$.getJSON("data/track.geojson", function (data) {
    layerGPSTrack.addData(data);
    //map.fitBounds(layerGPSTrack.getBounds());
});

var dashArrayTypeRadial = { "пунктир": "4,6", "": null };

var layerGPSTrackRadial = L.geoJson(null, {
    style: function (feature) {
        return {
            color: feature.properties.id,
            weight: 4,
            opacity: 1,
            dashArray: dashArrayTypeRadial[feature.properties.line]
        };
    },
    onEachFeature: function (feature, layer) {
        if (feature.properties) {
            var part = feature.properties.name ? 'Часть: ' + feature.properties.name + '</br>' : '';
            var date = feature.properties.date ? 'Дата: ' + feature.properties.date + '</br>' : '';
            var length = feature.properties.lengh ? 'Путь: ' + feature.properties.lengh + ' км' : '';
            var content = part + date + length;
            layer.bindPopup(content);
        };
        layer.on({
            mouseover: function (e) {
                var layer = e.target;
                layer.setStyle({
                    weight: 4,
                    color: "#00FFFF",
                    opacity: 1
                });
                if (!L.Browser.ie && !L.Browser.opera) {
                    layer.bringToFront();
                }
            },
            mouseout: function (e) {
                layerGPSTrackRadial.resetStyle(e.target);
            }
        });
    }
});
$.getJSON("data/track_radial.geojson", function (data) {
    layerGPSTrackRadial.addData(data);
});

layerPoi.addTo(map);
campsPoints.addTo(map);
layerGPSTrack.addTo(map);
layerGPSTrackRadial.addTo(map);

var baseLayer = {
    "Topomapper 1km": layerTopomapper,
    "OpenTopoMap": layerOpenTopoMap,
    "OpenCycleMap": layerOpenCycleMap,
    "Mapbox Imagery": layerMapboxImagery,
    "Bing Aerial": layerBingAerial
};

var overlayLayer = {
    "<img src='img/information.png' width='24' height='28';>&nbsp;POI": layerPoi,
    "<img src='img/temple.png' width='24' height='28';>&nbsp;Camps": campsPoints,
    "GPS track": layerGPSTrack,
    "Radial GPS track": layerGPSTrackRadial,
    "Topo 1km": layerTopo1000
};

L.control.layers(baseLayer, overlayLayer, {
    collapsed: false
}).addTo(map);