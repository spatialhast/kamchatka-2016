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



var index = 0;
var layerPanoramio = new L.PanoramioLayer({
	photoSet: 'full',
	onEachPhoto: function (layer, photo) {
		var uploaded = photo['upload_date'];
		var url = photo['photo_file_url'];
		var startMoment = moment(uploaded, 'DD MMM YYYY');
		var start = startMoment.toDate();
		var photoItem = {
			start: start,
			content: '<img class="photo" title="' + photo['photo_title'] + '" onload="this.style.opacity=1" src="' + url + '" height="64" data-id="' + index + '"/>',
			className: 'photo-item'
		};
		clickToCenter = function (record) {
			map.setView([record.latitude, record.longitude], map.getZoom());
		};
		index++;
	},
	refreshEvents: 'viewreset'
});



var map = new L.Map('map', {
	layers: [layerTopomapper]
});

map.setView([54.620, 159.571], 8);


new L.Hash(map);

L.control.scale().addTo(map);



var layerGPSTrack = L.geoJson(null, {
  style: function (feature) {
    return {
      color: '#009b2e',
      weight: 3,
      opacity: 1,
      clickable: false
    };
  },
  onEachFeature: function (feature, layer) {
 
  }
});
$.getJSON("data/track.geojson", function (data) {
  layerGPSTrack.addData(data);
  map.fitBounds(layerGPSTrack.getBounds());
});
layerGPSTrack.addTo(map);




var baseLayer = {
	"Topomapper 1km": layerTopomapper,
	"OpenTopoMap": layerOpenTopoMap,
	"OpenCycleMap": layerOpenCycleMap,
	"Mapbox Imagery": layerMapboxImagery,
	"Bing Aerial": layerBingAerial
};

var overlayLayer = {
	"Topo 1km": layerTopo1000,
	"<img src='img/panoramio.png' width='17' height='17'>&nbsp;Panoramio": layerPanoramio,
  "GPS track": layerGPSTrack
};

L.control.layers(baseLayer, overlayLayer, {
	collapsed: false
}).addTo(map);