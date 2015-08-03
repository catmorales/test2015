Ext.namespace("GEOR.Addons");

GEOR.Addons.coordinates = function (map, options) {
    this.map = map;
    this.options = options;
    this.control = null;
    this.item = null;
    this.layer = null;
    this.action = null;
    this.toolbar = null;
    this.infos = [];    
};

GEOR.Addons.coordinates.prototype = (function () {

    /*
     * Private     */

    var _self = null;
    var _map = null;    
    var _config = null;    
    var _coordinatesLayer = null;    
    var _mask_loader = null;
    
    var _style = {
                externalGraphic: "app/addons/coordinates/img/target.png",
                graphicWidth: 16,
                graphicHeight: 16
                ,graphicZIndex:745
                };

    var _styleMap= new OpenLayers.StyleMap({'default': _style, 'temporary': _style});   
    
    var _createDrawControl = function () {
            var drawPointCtrl = new OpenLayers.Control.DrawFeature(_coordinatesLayer, OpenLayers.Handler.Point, {
                featureAdded: function (e) {
                    _onClick(e);
                    drawPointCtrl.deactivate();
                }
            });
           drawPointCtrl.deactivate();
           return drawPointCtrl;
        };
        
    var _onxyzClose = function (xyz) {        
        _self.infos.remove(xyz.scope);
    };
        
    var _onClick = function (feature) {
        var xyz = new GEOR.Addons.coordinatesquery(_map,feature,_config.services);
        xyz.events.on("coordinatesclose", _onxyzClose);
        _self.infos.push(xyz);                
    };
    
   
    
    var _activateControl = function () {
        _self.control.activate();
        //_coordinatesLayer.setZIndex( 500 );
        _self.map.setLayerIndex( _coordinatesLayer, _self.map.layers.length-1);
    };
    
    var _showInfos = function (e) {
        console.log("Coordonnées",e.feature.coordinates);
    }
    
       

    return {
        /*
         * Public
         */
        activateTool: function() {
            this.action = new Ext.Action({handler: _activateControl,scope:this,text:"xyz" });
            this.toolbar  = (_config.placement === "bottom") ? Ext.getCmp("mappanel").bottomToolbar : Ext.getCmp("mappanel").topToolbar;         
            this.toolbar.insert(parseInt(this.options.position),'-');
            this.toolbar.insert(parseInt(this.options.position),this.action);
            this.toolbar.doLayout();
        },
         deactivateTool: function() {
            this.toolbar.remove(this.action.items[0]);
            this.toolbar.remove(this.toolbar.items.items[this.options.position]);
         },        
        onCheckchange: function(item, checked) {
            if (checked) {
               this.activateTool();
            } else {
               this.deactivateTool();
            }
        },     
        

        init: function (record) {
            _self = this;
            var lang = OpenLayers.Lang.getCode();
            title = record.get("title")[lang];
            _map = this.map;            
            _coordinatesLayer = new OpenLayers.Layer.Vector("coordinates", {
                rendererOptions: {zIndexing: true},
                displayInLayerSwitcher: false,                
                styleMap: _styleMap
            });
            this.layer = _coordinatesLayer;
            _config = _self.options;
            
            this.map.addLayers([_coordinatesLayer]);            
            this.control = _createDrawControl();           
            //_coordinatesLayer.setZIndex( 500 );   
            this.map.addControl(this.control);    
            
            
            
            var item = new Ext.menu.CheckItem({
                text: title,
                hidden:(this.options.showintoolmenu ===true)? false: true,                
                checked: this.options.autoactivate,
                qtip: record.get("description")[lang],
                listeners: {
                    "checkchange": this.onCheckchange,
                    scope: this
                }
               
            });
            if (this.options.autoactivate === true) { this.activateTool();}            
            this.item = item;
            return item;
        },
        destroy: function () {
            this.map = null;
            this.control.deactivate();
            this.control.destroy();
            this.control = null;
            this.item = null;
            this.layer.destroy();
            Ext.each(this.infos, function(w, i) {w.destroy();});
            this.toolbar.remove(this.action.items[0]);
            this.toolbar.remove(this.toolbar.items.items[this.options.position]);
            this.options = null;
        }
    }
})();Ext.namespace("GEOR.Addons");

GEOR.Addons.coordinates = function (map, options) {
    this.map = map;
    this.options = options;
    this.control = null;
    this.basecsv = "source;lon;lat;z \n";
    this.item = null;
    this.layer = null;
    this.action = null;
    this.toolbar = null;
    this.infos = [];    
};

GEOR.Addons.coordinates.prototype = (function () {

    /*
     * Private     */

    var _self = null;
    var _map = null;    
    var _config = null;    
    var _coordinatesLayer = null;    
    var _mask_loader = null;
    
    var _style = {
                externalGraphic: "app/addons/coordinates/img/target.png",
                graphicWidth: 16,
                graphicHeight: 16
                ,graphicZIndex:745
                };

    var _styleMap= new OpenLayers.StyleMap({'default': _style, 'temporary': _style});   
    
    var _createDrawControl = function () {
            var drawPointCtrl = new OpenLayers.Control.DrawFeature(_coordinatesLayer, OpenLayers.Handler.Point, {
                featureAdded: function (e) {
                    _onClick(e);
                    drawPointCtrl.deactivate();
                }
            });
           drawPointCtrl.deactivate();
           return drawPointCtrl;
        };
        
    var _onxyzClose = function (xyz) {        
        _self.infos.remove(xyz.scope);
    };
        
    var _onClick = function (feature) {
        var xyz = new GEOR.Addons.coordinatesquery(_map,feature,_config.services);
        xyz.events.on("coordinatesclose", _onxyzClose);
        _self.infos.push(xyz);                
    };
    
   
    
    var _activateControl = function () {
        _self.control.activate();
        //_coordinatesLayer.setZIndex( 500 );
        _self.map.setLayerIndex( _coordinatesLayer, _self.map.layers.length-1);
    };
    
    var _showInfos = function (e) {
        console.log("Coordonnées",e.feature.coordinates);
    }
    
       

    return {
        /*
         * Public
         */
        activateTool: function() {
            this.action = new Ext.Action({handler: _activateControl,scope:this,text:"xyz" });
            this.toolbar  = (_config.placement === "bottom") ? Ext.getCmp("mappanel").bottomToolbar : Ext.getCmp("mappanel").topToolbar;         
            this.toolbar.insert(parseInt(this.options.position),'-');
            this.toolbar.insert(parseInt(this.options.position),this.action);
            this.toolbar.doLayout();
        },
         deactivateTool: function() {
            this.toolbar.remove(this.action.items[0]);
            this.toolbar.remove(this.toolbar.items.items[this.options.position]);
         },        
        onCheckchange: function(item, checked) {
            if (checked) {
               this.activateTool();
            } else {
               this.deactivateTool();
            }
        },
        exportCSV: function() {
            var csv = this.basecsv;
            if (this.infos.length > 0) {
                for (var i = 0; i < this.infos.length; i++) {
                    csv += this.infos[i].csv;
                }
                GEOR.util.infoDialog({msg:csv.replace(/\n\r?/g, '<br />'), title:"Outil xyz"}); 
                console.log("Export CSV : \n", csv);
                //csv.replace(/\n/g, "\\n")                
            }
            else {
                GEOR.util.infoDialog({title:"Outil xyz",msg:"vous n'avez pas encore de points à exporter. Cliquez d'abord sur le bouton xyz à côté de la barre des coordonnées en bas à droite, puis créer autant de points que vous le souhaitez."});
                 
            }
        },
        init: function (record) {
            _self = this;
            var lang = OpenLayers.Lang.getCode();
            title = record.get("title")[lang];
            _map = this.map;            
            _coordinatesLayer = new OpenLayers.Layer.Vector("coordinates", {
                rendererOptions: {zIndexing: true},
                displayInLayerSwitcher: false,                
                styleMap: _styleMap
            });
            this.layer = _coordinatesLayer;
            _config = _self.options;
            
            this.map.addLayers([_coordinatesLayer]);            
            this.control = _createDrawControl();           
            //_coordinatesLayer.setZIndex( 500 );   
            this.map.addControl(this.control);
            
            this.item = new Ext.menu.Item({
                text: 'Export des xyz',
                iconCls: 'coordinates-icon',
                qtip: record.get("description")[lang],
                handler:  this.exportCSV,
                scope: this
            });
            if (this.options.autoactivate === true) { this.activateTool();}            
            
            return this.item;
        },
        destroy: function () {
            this.map = null;
            this.control.deactivate();
            this.control.destroy();
            this.control = null;
            this.item = null;
            this.layer.destroy();
            Ext.each(this.infos, function(w, i) {w.destroy();});
            this.toolbar.remove(this.action.items[0]);
            this.toolbar.remove(this.toolbar.items.items[this.options.position]);
            this.options = null;
        }
    }
})();