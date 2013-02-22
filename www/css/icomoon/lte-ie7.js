/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-folder' : '&#xe000;',
			'icon-finder' : '&#xe001;',
			'icon-windows8' : '&#xe002;',
			'icon-tux' : '&#xe003;',
			'icon-cog' : '&#xe004;',
			'icon-star' : '&#xe005;',
			'icon-clock' : '&#xe006;',
			'icon-cloud-upload' : '&#xe007;',
			'icon-menu' : '&#xe008;',
			'icon-folder-open' : '&#xe009;',
			'icon-file' : '&#xe00a;',
			'icon-file-pdf' : '&#xe00b;',
			'icon-file-excel' : '&#xe00c;',
			'icon-file-zip' : '&#xe00d;',
			'icon-file-xml' : '&#xe00e;',
			'icon-file-css' : '&#xe00f;',
			'icon-file-word' : '&#xe010;',
			'icon-image' : '&#xe011;',
			'icon-heart' : '&#xe012;',
			'icon-info' : '&#xe013;',
			'icon-close' : '&#xe014;',
			'icon-checkmark' : '&#xe015;',
			'icon-enter' : '&#xe016;',
			'icon-exit' : '&#xe017;',
			'icon-checkbox-checked' : '&#xe018;',
			'icon-checkbox-unchecked' : '&#xe019;',
			'icon-share' : '&#xe01a;',
			'icon-file-powerpoint' : '&#xe01b;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};