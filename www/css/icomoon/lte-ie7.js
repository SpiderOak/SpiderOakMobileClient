/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'SpiderOakIcons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-history' : '&#xe000;',
			'icon-file-pdf' : '&#xe001;',
			'icon-file-word' : '&#xe002;',
			'icon-file-excel' : '&#xe003;',
			'icon-file-zip' : '&#xe004;',
			'icon-file-powerpoint' : '&#xe005;',
			'icon-file-xml' : '&#xe006;',
			'icon-file-css' : '&#xe007;',
			'icon-film' : '&#xe008;',
			'icon-music' : '&#xe009;',
			'icon-star' : '&#xe00a;',
			'icon-star-2' : '&#xe00b;',
			'icon-clock' : '&#xe00d;',
			'icon-switch' : '&#xe00e;',
			'icon-tux' : '&#xe00f;',
			'icon-finder' : '&#xe010;',
			'icon-windows' : '&#xe012;',
			'icon-image' : '&#xe011;',
			'icon-menu' : '&#xe013;',
			'icon-arrow-left' : '&#xe014;',
			'icon-exit' : '&#xe015;',
			'icon-folder-open' : '&#xe016;',
			'icon-folder' : '&#xe017;',
			'icon-cloud-upload' : '&#xe018;',
			'icon-remove' : '&#xe019;',
			'icon-close' : '&#xe01a;',
			'icon-checkmark' : '&#xe01b;',
			'icon-loop' : '&#xe01c;',
			'icon-plus' : '&#xe01d;',
			'icon-minus' : '&#xe01e;',
			'icon-warning' : '&#xe01f;',
			'icon-eye' : '&#xe021;',
			'icon-link' : '&#xe022;',
			'icon-share' : '&#xe023;',
			'icon-download' : '&#xe024;',
			'icon-redo' : '&#xe025;',
			'icon-cog' : '&#xe00c;',
			'icon-settings' : '&#xe026;',
			'icon-file' : '&#xe027;',
			'icon-info' : '&#xe020;',
			'icon-checkbox-checked' : '&#xe028;',
			'icon-checkbox-unchecked' : '&#xe029;',
			'icon-file-openoffice' : '&#xe02a;',
			'icon-libreoffice' : '&#xe02b;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
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