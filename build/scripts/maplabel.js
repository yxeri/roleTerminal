MapLabel=function(t){if(!MapLabel.prototype.setValues)for(var e in google.maps.OverlayView.prototype)MapLabel.prototype.hasOwnProperty(e)||(MapLabel.prototype[e]=google.maps.OverlayView.prototype[e]);this.set("align","center"),this.set("fontColor","#000000"),this.set("fontFamily","Roboto,Arial,sans-serif"),this.set("fontSize",12),this.set("strokeColor","#ffffff"),this.set("strokeWeight",4),this.set("zIndex",1e3),this.setValues(t)},window.MapLabel=MapLabel,MapLabel.prototype.changed=function(t){switch(t){case"fontFamily":case"fontSize":case"fontColor":case"strokeWeight":case"strokeColor":case"text":this.drawCanvas_();case"align":case"maxZoom":case"minZoom":case"position":return this.draw()}},MapLabel.prototype.drawCanvas_=function(){var t=this.canvas_;if(t){var e=t.style;e.position="absolute",e.zIndex=this.get("zIndex");var i=t.getContext("2d");i.font=this.get("fontSize")+"px "+this.get("fontFamily");var o=Number(this.get("strokeWeight")),a=this.get("text"),s=i.measureText(a);t.width=Math.ceil(s.width+2*o),t.height=Math.ceil(parseInt(this.get("fontSize"),10)+2*o),window.devicePixelRatio>1&&(e.width=t.width+"px",e.height=t.height+"px",t.width=t.width*window.devicePixelRatio,t.height=t.height*window.devicePixelRatio,i.scale(window.devicePixelRatio,window.devicePixelRatio)),i.lineJoin="round",i.textBaseline="top",i.textAlign="left",i.strokeStyle=this.get("strokeColor"),i.fillStyle=this.get("fontColor"),i.font=this.get("fontSize")+"px "+this.get("fontFamily"),i.clearRect(0,0,t.width,t.height),a&&(o&&(i.lineWidth=o,i.strokeText(a,o,o)),i.fillText(a,o,o))}},MapLabel.prototype.onAdd=function(){var t=this.canvas_=document.createElement("canvas");this.drawCanvas_();var e=this.getPanes();e&&e.floatPane.appendChild(t)},MapLabel.prototype.onAdd=MapLabel.prototype.onAdd,MapLabel.prototype.draw=function(){var t=this.getProjection();if(t&&this.canvas_){var e=this.get("position");if(e){var i=t.fromLatLngToDivPixel(e),o=this.canvas_.style;switch(o.top=i.y+"px",this.get("align")){case"left":o.left=i.x-this.canvas_.width/(window.devicePixelRatio?window.devicePixelRatio:1)+"px",o["margin-left"]="-0.9em",o["margin-top"]="-0.9em";break;case"right":o.left=i.x+"px",o["margin-left"]="0.4em",o["margin-top"]="-0.9em";break;default:o.left=i.x-this.canvas_.width/(window.devicePixelRatio?window.devicePixelRatio:1)/2+"px",o["margin-left"]=0,o["margin-top"]="0.5em"}o.visibility=this.getVisible_()}}},MapLabel.prototype.draw=MapLabel.prototype.draw,MapLabel.prototype.getVisible_=function(){var t=this.get("minZoom"),e=this.get("maxZoom");if(void 0===t&&void 0===e)return"";var i=this.getMap();if(!i)return"";var o=i.getZoom();return t>o||o>e?"hidden":""},MapLabel.prototype.onRemove=function(){var t=this.canvas_;t&&t.parentNode&&t.parentNode.removeChild(t)},MapLabel.prototype.onRemove=MapLabel.prototype.onRemove;