/**
 * @license
 *
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Map Label.
 *
 * @author Luke Mahe (lukem@google.com),
 *         Chris Broadfoot (cbro@google.com)
 */

/**
 * Creates a new Map Label
 * @constructor
 * @extends google.maps.OverlayView
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 */
function MapLabel (opt_options) {
  this.set("fontFamily", "sans-serif");
  this.set("fontSize", 12);
  this.set("fontColor", "#000000");
  this.set("strokeWeight", 4);
  this.set("strokeColor", "#ffffff");
  this.set("align", "center");

  this.set("zIndex", 1e3);

  this.setValues(opt_options);
}

let MapLabelRetryDelay = 100;
let MapLabelMaxRetryDelay = 10000;

let MapLabelInit = function () {
  if (window.google === undefined) {
    let retryId = window.setTimeout(MapLabelInit, MapLabelRetryDelay);

    MapLabelRetryDelay += MapLabelRetryDelay;

    if (MapLabelRetryDelay > MapLabelMaxRetryDelay) {
      window.clearTimeout(retryId);
    }

    return;
  }

  MapLabel.prototype = new google.maps.OverlayView();

  window.MapLabel = MapLabel;

  /** @inheritDoc */
  MapLabel.prototype.changed = function (prop) {
    switch (prop) {
      case "fontFamily":
      case "fontSize":
      case "fontColor":
      case "strokeWeight":
      case "strokeColor":
      case "align":
      case "text":
        return this.drawCanvas_();
      case "maxZoom":
      case "minZoom":
      case "position":
        return this.draw();
    }
  };

  /**
     * Draws the label to the canvas 2d context.
     * @private
     */
  MapLabel.prototype.drawCanvas_ = function () {
    let canvas = this.canvas_;
    if (!canvas) return;

    let style = canvas.style;
    style.zIndex = /** @type number */(this.get("zIndex"));

    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = this.get("strokeColor");
    ctx.fillStyle = this.get("fontColor");
    ctx.font = this.get("fontSize") + "px " + this.get("fontFamily");

    let strokeWeight = Number(this.get("strokeWeight"));

    let text = this.get("text");
    if (text) {
      if (strokeWeight) {
        ctx.lineWidth = strokeWeight;
        ctx.strokeText(text, strokeWeight, strokeWeight);
      }

      ctx.fillText(text, strokeWeight, strokeWeight);

      let textMeasure = ctx.measureText(text);
      let textWidth = textMeasure.width + strokeWeight;
      style.marginLeft = this.getMarginLeft_(textWidth) + "px";
      // Bring actual text top in line with desired latitude.
      // Cheaper than calculating height of text.
      style.marginTop = "-0.4em";
    }
  };

  /**
     * @inheritDoc
     */
  MapLabel.prototype.onAdd = function () {
    let canvas = this.canvas_ = document.createElement("canvas");
    let style = canvas.style;
    style.position = "absolute";

    let ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.textBaseline = "top";

    this.drawCanvas_();

    let panes = this.getPanes();
    if (panes) {
      panes.mapPane.appendChild(canvas);
    }
  };
  MapLabel.prototype.onAdd = MapLabel.prototype.onAdd;

  /**
     * Gets the appropriate margin-left for the canvas.
     * @private
     * @param {number} textWidth  the width of the text, in pixels.
     * @return {number} the margin-left, in pixels.
     */
  MapLabel.prototype.getMarginLeft_ = function (textWidth) {
    switch (this.get("align")) {
      case "left":
        return 0;
      case "right":
        return -textWidth;
    }
    return textWidth / -2;
  };

  /**
     * @inheritDoc
     */
  MapLabel.prototype.draw = function () {
    let projection = this.getProjection();

    if (!projection) {
      // The map projection is not ready yet so do nothing
      return;
    }

    if (!this.canvas_) {
      // onAdd has not been called yet.
      return;
    }

    let latLng = /** @type {google.maps.LatLng} */ (this.get("position"));
    if (!latLng) {
      return;
    }
    let pos = projection.fromLatLngToDivPixel(latLng);

    let style = this.canvas_.style;

    style.top = pos.y + "px";
    style.left = pos.x + "px";

    style.visibility = this.getVisible_();
  };
  MapLabel.prototype.draw = MapLabel.prototype.draw;

  /**
     * Get the visibility of the label.
     * @private
     * @return {string} blank string if visible, 'hidden' if invisible.
     */
  MapLabel.prototype.getVisible_ = function () {
    let minZoom = /** @type number */(this.get("minZoom"));
    let maxZoom = /** @type number */(this.get("maxZoom"));

    if (minZoom === undefined && maxZoom === undefined) {
      return "";
    }

    let map = this.getMap();
    if (!map) {
      return "";
    }

    let mapZoom = map.getZoom();
    if (mapZoom < minZoom || mapZoom > maxZoom) {
      return "hidden";
    }
    return "";
  };

  /**
     * @inheritDoc
     */
  MapLabel.prototype.onRemove = function () {
    let canvas = this.canvas_;
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
  MapLabel.prototype.onRemove = MapLabel.prototype.onRemove;
};
