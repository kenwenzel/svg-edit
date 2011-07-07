/**
 * Package: svgedit.sanitize
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) browser.js
// 2) svgutils.js

var svgedit = svgedit || {};

(function() {

if (!svgedit.sanitize) {
	svgedit.sanitize = {};
}

// Namespace constants
var svgns = "http://www.w3.org/2000/svg",
	xlinkns = "http://www.w3.org/1999/xlink",
	xmlns = "http://www.w3.org/XML/1998/namespace",
	xmlnsns = "http://www.w3.org/2000/xmlns/", // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
	se_ns = "http://svg-edit.googlecode.com",
	htmlns = "http://www.w3.org/1999/xhtml",
	mathns = "http://www.w3.org/1998/Math/MathML";

// map namespace URIs to prefixes
var nsMap_ = {};
nsMap_[xlinkns] = 'xlink';
nsMap_[xmlns] = 'xml';
nsMap_[xmlnsns] = 'xmlns';
nsMap_[se_ns] = 'se';
nsMap_[htmlns] = 'xhtml';
nsMap_[mathns] = 'mathml';

// temporarily expose these
svgedit.sanitize.getNSMap = function() { return nsMap_; }

// Function: svgedit.sanitize.sanitizeSvg
// Sanitizes the input node and its children
// It only keeps what is allowed from our whitelist defined above
//
// Parameters:
// node - The DOM element to be checked, will also check its children
svgedit.sanitize.sanitizeSvg = function(node) {
	if (node.nodeType != 1) return;
	var doc = node.ownerDocument;
	var parent = node.parentNode;
	// can parent ever be null here?  I think the root node's parent is the document...
	if (!doc || !parent) return;
	
	var i = node.attributes.length;
	while (i--) {
		// if the attribute is not in our whitelist, then remove it
		// could use jQuery's inArray(), but I don't know if that's any better
		var attr = node.attributes.item(i);
		var attrName = attr.nodeName;
		var attrLocalName = attr.localName;
		var attrNsURI = attr.namespaceURI;
		
		// Add spaces before negative signs where necessary
		if(svgedit.browser.isGecko()) {
			switch ( attrName ) {
			case "transform":
			case "gradientTransform":
			case "patternTransform":
				var val = attr.nodeValue.replace(/(\d)-/g, "$1 -");
				node.setAttribute(attrName, val);
			}
		}
		
		/*
		// for the style attribute, rewrite it in terms of XML presentational attributes
		if (attrName == "style") {
			var props = attr.nodeValue.split(";"),
				p = props.length;
			while(p--) {
				var nv = props[p].split(":");
				// now check that this attribute is supported
				if (allowedAttrs.indexOf(nv[0]) >= 0) {
					node.setAttribute(nv[0],nv[1]);
				}
			}
			node.removeAttribute('style');
		}*/
	}
	
	// Safari crashes on a <use> without a xlink:href, so we just remove the node here
	if (node.nodeName == "use" && !svgedit.utilities.getHref(node)) {
		parent.removeChild(node);
		return;
	}
	
	// recurse to children
	i = node.childNodes.length;
	while (i--) { svgedit.sanitize.sanitizeSvg(node.childNodes.item(i)); }
};

})();

