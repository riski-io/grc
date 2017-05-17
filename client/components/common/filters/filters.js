'use strict';
/* global angular */

angular.module('grcApp')

.filter('hideSuspended', function() {
	return function(arr, hide) {
		if ( !hide ) { return arr; }
		var narr = [];
		angular.forEach(arr, function(item) {
		    if ( item.status !== 'Suspended' ) {
		        this.push(item);
		    }
		}, narr);
		return narr;
	};
})

.filter('hideOutdated', function() {
	return function(arr, hide) {
		if ( !hide ) { return arr; }
		var narr = [],
			now = new Date(),
			effectEndDate;
		angular.forEach(arr, function(item) {
			effectEndDate = new Date(item.effectiveTo);
		    if ( now < effectEndDate ) { this.push(item); }
		}, narr);
		console.log(narr);
		return narr;
	};
})

.filter('stripTags', function() {
	return function(str, allowedTags) {
			var key = '', allowed = false;
			var matches = [];
			var allowedArray = [];
			var allowedTag = '';
			var i = 0;
			var k = '';
			var html = '';

			var replacer = function(search, replace, str) {
				return str.split(search).join(replace);
			};

			// Build allowes tags associative array
			if (allowedTags) {
				allowedArray = allowedTags.match(/([a-zA-Z]+)/gi);
			}

			str += '';

			// Match tags
			matches = str.match(/(<\/?[\S][^>]*>)/gi);

			// Go through all HTML tags
			for (key in matches) {
				if (isNaN(key)) {
					// IE7 Hack
					continue;
				}

				// Save HTML tag
				html = matches[key].toString();

				// Is tag not in allowed list? Remove from str!
				allowed = false;

				// Go through all allowed tags
				for (k in allowedArray) {
					// Init
					allowedTag = allowedArray[k];
					i = -1;

					if (i !== 0) { i = html.toLowerCase().indexOf('<'+allowedTag+'>');}
					if (i !== 0) { i = html.toLowerCase().indexOf('<'+allowedTag+' ');}
					if (i !== 0) { i = html.toLowerCase().indexOf('</'+allowedTag)   ;}

					// Determine
					if (i === 0) {
						allowed = true;
						break;
					}
				}

				if (!allowed) {
					str = replacer(html, '', str); // Custom replace. No regexing
				}
			}

			return str;
	};
})

.filter('reverse', function () {
    return function (items) {
        if (!angular.isArray(items)) {
            return false;
        }

        return items.slice().reverse();
    };
})


.filter('to_trusted', ['$sce', function($sce) {
  return function(text) {
    var result = '';
    try {
      result = $sce.trustAsHtml(text);
    } catch (e) {
      result = text;
    }
    return result;
  };
}])

.filter('capitalizeFirst', function() {
    return function(input) {
      return input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
    };
});