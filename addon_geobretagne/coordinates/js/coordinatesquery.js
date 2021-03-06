Ext.namespace("GEOR.Addons");

GEOR.Addons.coordinatesquery = function (map, feature, services) {
    GEOR.waiter.show();
    this.map = map;
    this.decimalseparator = ((1.33).toLocaleString() === "1.33") ? ".":",";
    this.feature = feature;
    this.services = services;
    this.csv = "source;x;y;z\n";
    this.events = new Ext.util.Observable();
    this.events.addEvents("coordinatesclose");    
    this.pixel = this.map.getPixelFromLonLat(new OpenLayers.LonLat(this.feature.geometry.x,this.feature.geometry.y));             
    //this.feature.coordinates = {lon:feature.geometry.x, lat:feature.geometry.y, alt : []};
    this.projfeature = new OpenLayers.Geometry.Point(this.feature.geometry.x,this.feature.geometry.y).transform(new OpenLayers.Projection("EPSG:2154"), new OpenLayers.Projection("EPSG:4326"));
    this.feature.coordinates = {lon:this.formatNumber(Ext.util.Format.number(this.projfeature.x,"0.000000")), lat:this.formatNumber(Ext.util.Format.number(this.projfeature.y,"0.000000")), alt : []};
    
    
    this.popup = new GeoExt.Popup({
        map: this.map,
        //baseCls: "gx-popup",
        title: "Coordonnées",
        feature: this.feature,
        bodyStyle: "padding:5px;",
        unpinnable: false,
        resizable:false,
        closeAction: 'close',
        location: this.feature,                
        anchored:true,
        //anchorPosition:"bottom-left",      
        tpl: new Ext.XTemplate( 
          '<tpl for=".">', 
          '<div class="lonlat" ><p>lon : {lon}</p>',
          '<p>lat : {lat}</p></div>', 
          '<tpl for="alt">',          
          '<div class="metadata"><p class="alignleft">z : {z} - {label}</p><p class="alignright"><a href="{metadata}" target="_blank"><img src="app/addons/coordinates/img/notes.png" /></a></p></div>',
          '</tpl>', 
          '</tpl>' 
        ), 
        listeners: {
            "close": this.onPopupClose /*function() {                
                this.destroy();
                this.events.fireEvent("coordinatesclose", this);
                this.feature.destroy();
            }  */              
        }
        ,scope:this
    });           
    this.popup.show();
    this.popup.update({
            lon:this.feature.coordinates.lon,
            lat:this.feature.coordinates.lat,
            alt:this.feature.coordinates.alt
    });
    this.popup.position();
    this.popup.setPosition([this.popup.getPosition()[0],this.popup.getPosition()[1] -10]);  
    
    for (var i = 0; i < this.services.length; i++) {
        var service = this.services[i];
        var infoslayers = [];
        Ext.each(service.layers, function(l, i) {infoslayers.push(l.name);});
        infoslayers.join(",");
        var params = {
            SERVICE: "WMS",
            VERSION: "1.1.1",
            REQUEST: "GetFeatureInfo",
            LAYERS: infoslayers,
            QUERY_LAYERS: infoslayers,
            FEATURE_COUNT: "10",
            STYLES:"",
            BBOX:this.map.getExtent().toBBOX(),
            HEIGHT: this.map.getCurrentSize().h,
            WIDTH: this.map.getCurrentSize().w,
            FORMAT: "image/png",
            INFO_FORMAT: "application/vnd.ogc.gml",
            SRS: this.map.getProjection(),
            X: this.pixel.x,
            Y: this.pixel.y        
        };          
        
        OpenLayers.Request.GET({
            url: service.url,
            params: params,
            success: this.onSuccess,
            failure: OpenLayers.Function.bind(this.onFailure, null, service, this),
            scope:this
        });   
    }
};

GEOR.Addons.coordinatesquery.prototype = (function () {  
    

    return {
        /*
         * Public
         */
        onPopupClose: function (evt) {
            this.feature.destroy();
            this.scope.events.fireEvent("coordinatesclose", this);
        },
        
        getMetadata: function (name) {             
             for (var i = 0; i < this.services.length; i++) {
                for (var j = 0; j < this.services[i].layers.length; j++) {
                    if (this.services[i].layers[j].name === name) {
                        return this.services[i].layers[j];
                        break
                    }
                }
             }
        },
        
        formatNumber: function (value) {
            var formatnumber = value;
            if (OpenLayers.Lang.code === 'fr') {
                formatnumber = value.replace(".", this.decimalseparator);                
            }
            return formatnumber;
        },
      
      onFailure: function (service, self, response) {       
        GEOR.util.errorDialog({
            title: "Service innacessible",
            msg: "Le service : " + service.url +" ne semble pas fonctionner. Il sera désactivé lors du prochain appel de la fonction"
        });
        self.services.remove(service);        
      },
               
        onSuccess: function (response) {            
            var features = new OpenLayers.Format.GML().read(response.responseText);
            if (features.length > 0) {
              for (var i = 0; i < features.length; i++) {
                var metadata = this.getMetadata(features[i].gml.featureType);                
                if (parseInt(features[i].attributes.GRAY_INDEX) != parseInt(metadata.nodatavalue)) {
                    this.feature.coordinates.alt.push({label:metadata.label, metadata:metadata.metadata,z: this.formatNumber(Ext.util.Format.number(features[i].attributes.GRAY_INDEX,"0.00"))});
                    this.csv +=  metadata.label + ";" + this.feature.coordinates.lon + ";" + this.feature.coordinates.lat + ";" + this.formatNumber(Ext.util.Format.number(features[i].attributes.GRAY_INDEX,"0.00")) + "\n";
                    console.log("Export CSV",this.csv);
                }
              }
              
              this.popup.update({
                lon:this.feature.coordinates.lon,
                lat:this.feature.coordinates.lat,
                alt:this.feature.coordinates.alt
              });
              this.popup.position();
              this.popup.setPosition([this.popup.getPosition()[0],this.popup.getPosition()[1] -10]);
            }
          else
          {
            console.log("no feature found", response.responseText);
          }
            GEOR.waiter.hide();            
        },
       
        destroy: function () {
            this.map = null;
            this.feature.destroy();
            this.popup.destroy();
            this.feature = null;
           
        }
    }
})();Ext.namespace("GEOR.Addons");

GEOR.Addons.coordinatesquery = function (map, feature, services) {
    GEOR.waiter.show();
    this.map = map;
    this.decimalseparator = ((1.33).toLocaleString() === "1.33") ? ".":",";
    this.feature = feature;
    this.services = services;
    this.csv = "";
    this.events = new Ext.util.Observable();
    this.events.addEvents("coordinatesclose");    
    this.pixel = this.map.getPixelFromLonLat(new OpenLayers.LonLat(this.feature.geometry.x,this.feature.geometry.y));             
    //this.feature.coordinates = {lon:feature.geometry.x, lat:feature.geometry.y, alt : []};
    this.projfeature = new OpenLayers.Geometry.Point(this.feature.geometry.x,this.feature.geometry.y).transform(new OpenLayers.Projection("EPSG:2154"), new OpenLayers.Projection("EPSG:4326"));
    this.feature.coordinates = {lon:this.formatNumber(Ext.util.Format.number(this.projfeature.x,"0.000000")), lat:this.formatNumber(Ext.util.Format.number(this.projfeature.y,"0.000000")), alt : []};
    
    
    this.popup = new GeoExt.Popup({
        map: this.map,
        //baseCls: "gx-popup",
        title: "Coordonnées",
        feature: this.feature,
        bodyStyle: "padding:5px;",
        unpinnable: false,
        resizable:false,
        closeAction: 'close',
        location: this.feature,                
        anchored:true,
        //anchorPosition:"bottom-left",      
        tpl: new Ext.XTemplate( 
          '<tpl for=".">', 
          '<div class="lonlat" ><p>lon : {lon}</p>',
          '<p>lat : {lat}</p></div>', 
          '<tpl for="alt">',          
          '<div class="metadata"><p class="alignleft">z : {z} - {label}</p><p class="alignright"><a href="{metadata}" target="_blank"><img src="app/addons/coordinates/img/notes.png" /></a></p></div>',
          '</tpl>', 
          '</tpl>' 
        ), 
        listeners: {
            "close": this.onPopupClose /*function() {                
                this.destroy();
                this.events.fireEvent("coordinatesclose", this);
                this.feature.destroy();
            }  */              
        }
        ,scope:this
    });           
    this.popup.show();
    this.popup.update({
            lon:this.feature.coordinates.lon,
            lat:this.feature.coordinates.lat,
            alt:this.feature.coordinates.alt
    });
    this.popup.position();
    this.popup.setPosition([this.popup.getPosition()[0],this.popup.getPosition()[1] -10]);  
    
    for (var i = 0; i < this.services.length; i++) {
        var service = this.services[i];
        var infoslayers = [];
        Ext.each(service.layers, function(l, i) {infoslayers.push(l.name);});
        infoslayers.join(",");
        var params = {
            SERVICE: "WMS",
            VERSION: "1.1.1",
            REQUEST: "GetFeatureInfo",
            LAYERS: infoslayers,
            QUERY_LAYERS: infoslayers,
            FEATURE_COUNT: "10",
            STYLES:"",
            BBOX:this.map.getExtent().toBBOX(),
            HEIGHT: this.map.getCurrentSize().h,
            WIDTH: this.map.getCurrentSize().w,
            FORMAT: "image/png",
            INFO_FORMAT: "application/vnd.ogc.gml",
            SRS: this.map.getProjection(),
            X: this.pixel.x,
            Y: this.pixel.y        
        };          
        
        OpenLayers.Request.GET({
            url: service.url,
            params: params,
            success: this.onSuccess,
            failure: OpenLayers.Function.bind(this.onFailure, null, service, this),
            scope:this
        });   
    }
};

GEOR.Addons.coordinatesquery.prototype = (function () {  
    

    return {
        /*
         * Public
         */
        onPopupClose: function (evt) {
            this.feature.destroy();
            this.scope.events.fireEvent("coordinatesclose", this);
        },
        
        getMetadata: function (name) {             
             for (var i = 0; i < this.services.length; i++) {
                for (var j = 0; j < this.services[i].layers.length; j++) {
                    if (this.services[i].layers[j].name === name) {
                        return this.services[i].layers[j];
                        break
                    }
                }
             }
        },
        
        formatNumber: function (value) {
            var formatnumber = value;
            if (OpenLayers.Lang.code === 'fr') {
                formatnumber = value.replace(".", this.decimalseparator);                
            }
            return formatnumber;
        },
      
      onFailure: function (service, self, response) {       
        GEOR.util.errorDialog({
            title: "Service innacessible",
            msg: "Le service : " + service.url +" ne semble pas fonctionner. Il sera désactivé lors du prochain appel de la fonction"
        });
        self.services.remove(service);        
      },
               
        onSuccess: function (response) {            
            var features = new OpenLayers.Format.GML().read(response.responseText);
            if (features.length > 0) {
              for (var i = 0; i < features.length; i++) {
                var metadata = this.getMetadata(features[i].gml.featureType);                
                if (parseInt(features[i].attributes.GRAY_INDEX) != parseInt(metadata.nodatavalue)) {
                    this.feature.coordinates.alt.push({label:metadata.label, metadata:metadata.metadata,z: this.formatNumber(Ext.util.Format.number(features[i].attributes.GRAY_INDEX,"0.00"))});
                    this.csv +=  metadata.label + ";" + this.feature.coordinates.lon + ";" + this.feature.coordinates.lat + /*";" + this.feature.geometry.x + ";" + this.feature.geometry.y +*/ ";" + this.formatNumber(Ext.util.Format.number(features[i].attributes.GRAY_INDEX,"0.00")) + " \n";
                                        
                }
              }
              
              this.popup.update({
                lon:this.feature.coordinates.lon,
                lat:this.feature.coordinates.lat,
                alt:this.feature.coordinates.alt
              });
              this.popup.position();
              this.popup.setPosition([this.popup.getPosition()[0],this.popup.getPosition()[1] -10]);
            }
          else
          {
            console.log("no feature found", response.responseText);
          }
            GEOR.waiter.hide();            
        },
       
        destroy: function () {
            this.map = null;
            this.feature.destroy();
            this.popup.destroy();
            this.feature = null;
           
        }
    }
})();