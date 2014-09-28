// Send all AJAX request to a predifined domain
// Source: bit.ly/GzVwdr
$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
	options.url = 'http://example.com/api' + options.url;
});

// Form variables to JSON
// Source: bit.ly/ZPHU2C
$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};