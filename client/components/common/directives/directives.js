'use strict';
/* jshint ignore:start */

angular.module('grcApp')
.directive('printTable', function () {
	return {
		restrict: 'A',
		link: function(scope, el) {
			el.on('click', function () {
				 window.print();
			});
		}
	};
})

.directive('ratingStyle', function () {
	return {
		restrict: 'A',
		link: function(scope, el, attrs) {
            scope.$watch(attrs.ratingStyle, function(val) {
				el.removeClass('rating-green').removeClass('rating-yellow').removeClass('rating-orange').removeClass('rating-red');
				if (val >= 0 ) {
                    if ( +val > 8 ) {
                        el.addClass('rating-red');
                    }else if ( +val > 6) {
                        el.addClass('rating-orange');
                    }else if ( +val > 4) {
                        el.addClass('rating-yellow');
                    }else {
                        el.addClass('rating-green');
                    }
                }
            });
		}
	};
})

.directive('saveToCsv', function (FileSaveService) {
	return {
		restrict: 'A',
		scope: {
			cfg: '=tableConfig',
			arr: '=saveToCsv'
		},
		link: function(scope, el) {
			el.on('click', function () { FileSaveService.csv(scope.arr, scope.cfg); });
		}
	};
})

.directive('downloadPdf', function (FileSaveService, SvgConvertService, spinner) {
  return {
    restrict: 'A',
    scope: {
      orgUnit: '=orgUnit',
      arr: '=downloadPdf',
      img: '=matrix',
      type : '@type'
    },
    link: function(scope, el) {
      var imgData = null;
      el.on('click', function () {
        if ( scope.img ) { 
          SvgConvertService.convert(scope.img, function (imgData) {
            imgData = imgData;
            FileSaveService.pdfDownload(scope.arr, scope.orgUnit, imgData, scope.type, spinner);
          }); 
        }else{
          FileSaveService.pdfDownload(scope.arr, scope.orgUnit, imgData, scope.type, spinner);
        }
      });
    }
  };
})

.directive('savePdf', function (FileSaveService, SvgConvertService) {
	return {
		restrict: 'A',
		scope: {
			cfg: '=tableConfig',
			arr: '=savePdf',
			img: '=matrix'
		},
		link: function(scope, el) {
			var imgData = null;
			el.on('click', function () {
				if ( scope.img ) { imgData = SvgConvertService.convert(scope.img); }
				FileSaveService.pdf(scope.arr, scope.cfg, imgData);
			});
		}
	};
})

.directive('saveImage', function ($filter, FileSaveService, SvgConvertService) {
	return {
		restrict: 'A',
		scope: {
			img: '=saveImage',
			cfg: '=tableConfig'
		},
		link: function(scope, el) {
			el.on('click', function () {
				var d, formatted, link, name;
				if ( scope.img ) {
					SvgConvertService.convert(scope.img, function (imgData) {
                        d = new Date();
                        formatted = $filter('date')(d, 'yyyy_MM_dd');
                        link = document.createElement('a');
                        name = scope.cfg.header.replace(/\s/g , '_') + '_' + formatted;
                        link.setAttribute('href', imgData.data);
                        link.setAttribute('download', name + '.jpeg');
                        link.click();
                    });
		 		}
			});
		}
	};
})

.directive('printPage', function () {
	return {
		restrict: 'A',
		link: function(scope, el) {
			el.on('click', function () {
				if ($('.print_friendly_tabs').length === 0) {
					$('.ui-tab.panel').each( function() {       
				        var tabshtml = '';         
				        $(this).find('.nav-tabs li').each( function(index) {
                  var tabClass = $(this).attr('heading').replace(/\s+/g, '_').toLowerCase();
				            tabshtml += '<div class="' + tabClass + '">';
				            tabshtml += '<h2>' + $(this).text() + '</h2><br />';
				            tabshtml += $('.tab-content .tab-pane').eq(index).html() + '<br /><br />';
                    tabshtml += '</div>';
				        });
				        $(this).after('<div class=\'print_friendly_tabs\'>' + tabshtml + '</div>');
				    });
				}
				window.print();
			});
		}
	};
})

.directive('itemComments', function () {
    return {
        restrict: 'E',
        templateUrl: 'app/comments/comments.html',
        controller: 'CommentsController',
        scope: {
            editable: '=?',
            allowed: '=?'
        }
    };
})

.directive('itemAttachments', function () {
    return {
        restrict: 'E',
        templateUrl: 'app/attachments/attachments.html',
        controller: 'AttachmentsController',
        scope: {
            editable: '=?'
        }
    };
})

.directive('relatedActionsItems', function () {
    return {
        restrict: 'E',
        templateUrl: 'app/action-item/related-action-item-list.html',
        controller: 'RelatedActionItemListCtrl'
    };
})
.directive('multipleEmails', function () {
    var EMAIL_REGEXP = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    function validateAll(ctrl, validatorName, value) {
        var validity = ctrl.$isEmpty(value) || value.every(
            function (email) {
                return EMAIL_REGEXP.test(email.trim());
            }
        );
        ctrl.$setValidity(validatorName, validity);
        return validity ? value : undefined;
    }

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function postLink(scope, elem, attrs, modelCtrl) {
            function multipleEmailsValidator(value) {
                return validateAll(modelCtrl, 'multipleEmails', value);
            }

            modelCtrl.$formatters.push(multipleEmailsValidator);
            modelCtrl.$parsers.push(multipleEmailsValidator);
        } 
    };
})

/**
 * iboxTools - Directive for iBox tools elements in right corner of ibox
 */
.directive('iboxCollapse', function ($timeout) {
    return {
        restrict: 'E',
        scope: true,
        template: '<a ng-click="showhide()"> <i class="fa fa-chevron-up"></i></a>',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                console.log(ibox);
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            };
            // Function for close ibox
            $scope.closebox = function () {
                var ibox = $element.closest('div.ibox');
                ibox.remove();
            };
        }
    };
});

angular.module('grcApp').directive('ngMin', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      scope.$watch(attr.ngMin, function() {
        ctrl.$setViewValue(ctrl.$viewValue);
      });
      var minValidator = function(value) {
        var min = scope.$eval(attr.ngMin) || 0;
        if (!_.isEmpty(value) && value < min) {
          ctrl.$setValidity('min', false);
          return undefined;
        } else {
          ctrl.$setValidity('min', true);
          return value;
        }
      };

      ctrl.$parsers.push(minValidator);
      ctrl.$formatters.push(minValidator);
    }
  };
});

angular.module('grcApp').directive('ngMax', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      scope.$watch(attr.ngMax, function() {
        ctrl.$setViewValue(ctrl.$viewValue);
      });
      var maxValidator = function(value) {
        var max = scope.$eval(attr.ngMax) || Infinity;
        if (!_.isEmpty(value) && value > max) {
          ctrl.$setValidity('max', false);
          return undefined;
        } else {
          ctrl.$setValidity('max', true);
          return value;
        }
      };

      ctrl.$parsers.push(maxValidator);
      ctrl.$formatters.push(maxValidator);
    }
  };
});

angular.module('grcApp').directive('pageTitle', function ($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'INSPINIA | Responsive Admin Theme';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'INSPINIA | ' + toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
});

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
angular.module('grcApp').directive('sideNavigation', function () {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            element.metisMenu();
        }
    };
});

/**
 * minimalizaSidebar - Directive for minimalize sidebar
*/
angular.module('grcApp').directive('minimalizaSidebar',  function ($timeout) {
    return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
        controller: ['$scope', '$element', function ($scope, $element) {
            $scope.minimalize = function () {
                $("body").toggleClass("mini-navbar");
                if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu').hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 100);
                } else if ($('body').hasClass('fixed-sidebar')){
                    $('#side-menu').hide();
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 300);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu').removeAttr('style');
                }
            }
        }]
    };
});

/**
 * vectorMap - Directive for Vector map plugin
 */
angular.module('grcApp').directive('vectorMap',  function () {
    return {
        restrict: 'A',
        scope: {
            myMapData: '=',
        },
        link: function (scope, element, attrs) {
            element.vectorMap({
                map: 'world_mill_en',
                backgroundColor: "transparent",
                regionStyle: {
                    initial: {
                        fill: '#e4e4e4',
                        "fill-opacity": 0.9,
                        stroke: 'none',
                        "stroke-width": 0,
                        "stroke-opacity": 0
                    }
                },
                series: {
                    regions: [
                        {
                            values: scope.myMapData,
                            scale: ["#1ab394", "#22d6b1"],
                            normalizeFunction: 'polynomial'
                        }
                    ]
                },
            });
        }
    }
});