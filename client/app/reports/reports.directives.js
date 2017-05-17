'use strict';
/* jshint ignore:start */
angular.module('grcApp')

.directive('riskMatrix', function () {
	function Matrix (container, svgid, side, dashboard, gotorec) {
		var self = this,
			size = Math.floor(side/5.5),
			smallRadius = Math.floor((size*3)/12),
			smallFont = Math.round(size/12),
			smallTextMargin = Math.round(smallRadius/4),
			mediumRadius = Math.floor((size*3)/10),
			mediumFont = Math.round(size/10),
			mediumTextMargin = Math.round(mediumRadius/4),
			largeRadius = Math.floor((size*3)/8),
			largeFont = Math.round(size/8),
			largeTextMargin = Math.round(largeRadius/4),
		    matrix = getMatrix(size),
		    axis = getAxis(size),
		    initialized = false,
		    canvasId = 'riskMatrix',
		    cells, dataGroups, dgCircles,
			dgNumberText, dgSumText,
			xAxisGroup, yAxisGroup,

		canvas = d3.select(container)
			.append('svg:svg')
        	.attr('id', canvasId)
        	.attr('xmlns', 'http://www.w3.org/2000/svg')
        	.style('fill', '#EEE')
            .attr('width', side)
            .attr('height', side);

		if ( dashboard ) {
			smallFont = Math.round(size/5);
			mediumFont = Math.round(size/4);
			largeFont = Math.round(size/3);
		}

		canvas.append('rect')
		    .attr('width', '100%')
		    .attr('height', '100%')
		    .attr('fill', '#FFF');

		xAxisGroup = canvas.append('g');
		yAxisGroup = canvas.append('g');

			xAxisGroup.selectAll('text')
			    .data(axis.cs.ticks)
			    .enter()
			    .append('text')
			    .call(tick);

			xAxisGroup.append('text')
			    .attr('x', axis.cs.title.x)
			    .attr('y', axis.cs.title.y)
			    .attr('text-anchor', 'middle')
			    .text(axis.cs.title.text)
			    .style('font', axis.cs.title.font)
			    .style('fill', '#333');

			yAxisGroup.selectAll('text')
			    .data(axis.lh.ticks)
			    .enter()
			    .append('text')
			    .call(tick);

			yAxisGroup.append('text')
			    .attr('x', axis.lh.title.x)
			    .attr('y', axis.lh.title.y)
			    .attr('transform', 'rotate(-90 ' + axis.lh.title.x + ',' + axis.lh.title.y +')')
			    .attr('text-anchor', 'middle')
			    .text(axis.lh.title.text)
			    .style('font', axis.lh.title.font)
			    .style('fill', '#333');

		self.update = function (data, type) {
			matrix = modifyMatrix(matrix, data, type);
			if ( initialized ) {
				foldCells(initCells);
			}else {
				initialized = true;
				initCells();
			}
	    };

		function modifyMatrix(matrix, data, type) {
		    angular.forEach(matrix, function(sq) {
		    	var total = 0;
		    	sq.risks = [];
			    angular.forEach(data, function(risk) {
			    	var spRisk = risk[type];
			    	if (spRisk) {
				    	spRisk.fromRecord = risk.fromRecord;
				    	spRisk.description = getRiskDescription(risk.risk, risk.fromRecord);
				    	if ( sq.lh === +spRisk.likelihood && sq.cs === +spRisk.consequence ) {
				    		sq.risks.push(spRisk);
				    		total += (+spRisk.cost);
				    	}
			    	}
			    });
			    sq.totalCost = (total).toFixed(1);
		    });
		    return matrix;
		}

		function getRiskDescription(desc, recid) {
			desc = (desc || '').replace(/<(?:.|\n)*?>/gm, '');
		    return ( desc.length > 30 ) ? recid + ': ' + desc.substr(0, 27) + '...' : recid + ': ' + desc;
		}

		function initCells() {
			cells = canvas.selectAll('rect.cell').data(matrix)
				.enter().append('svg:rect')
				.classed('cell', true)
			    .attr('transform', 'translate('+ (size / 2) + ',' + (size / 2) + ')')
			    .attr('x', 0)
			    .attr('y', 0)
			    .attr('width', 0)
			    .attr('height', 0)
			    .style('fill', function(d) { return d.color; });

			dataGroups = canvas.selectAll('g').data(matrix)
				.enter().append('g')
			    .attr('transform', 'translate('+ (size / 2) + ',' + (size / 2) + ')');

		    dataGroups.filter(function(d) { return !d.risks.length; }).remove();

			dgCircles = dataGroups.append('svg:circle')
			    .attr('cy', 0)
			    .attr('cx', 0)
			    .attr('r', 1)
			    .style('fill', '#333');


		    if ( dashboard  ) {
				dgNumberText = dataGroups.append('text')
					.classed('dg-number-text', true)
				    .attr('x', 0)
				    .attr('y', 0)
				    .attr('dy', '.3em')
				    .text(function(d) { return d.risks.length; })
				    .attr('text-anchor', 'middle')
				    .style('font', 'bold 1px sans-serif')
				    .style('pointer-events', 'none')
				    .style('fill', function(d) { return d.color; });
		    }else {
		    	dataGroups.on('mouseover', onMouseOver);

				dgNumberText = dataGroups.append('text')
					.classed('dg-number-text', true)
				    .attr('x', 0)
				    .attr('y', 0)
				    .attr('dy', '.3em')
				    .text(function(d) { return d.risks.length + ' Risks'; })
				    .attr('text-anchor', 'middle')
				    .style('font', 'bold 1px sans-serif')
				    .style('pointer-events', 'none')
				    .style('fill', '#DDD');

			    dgNumberText.filter(function(d) { return d.risks.length === 1; }).remove();

				dgSumText = dataGroups.append('text')
					.classed('dg-sum-text', true)
				    .attr('x', 0)
				    .attr('y', 0)
				    .attr('dy', '.3em')
				    .text(function(d) { return d.totalCost + 'M'; })
				    .attr('text-anchor', 'middle')
				    .style('font', 'bold 1px sans-serif')
				    .style('pointer-events', 'none')
				    .style('fill', '#DDD');
		    }

		    unfoldCells();
		}


		function onMouseRecClick(datum) {
			gotorec(datum.fromRecord);
		}

		function onMouseOver(d) {
			var orig = d3.select(this),
				origRadius = orig.select('circle').attr('r'),
				origNode = orig.node(),
				dupe = d3.select(origNode.parentNode.appendChild(origNode.cloneNode(true))),
				toRight = +d.cs < 4,
				geom = getGeom(d, origRadius, toRight),
				lineFunc = d3.svg.line().x(function(d) { return d.x; })
								.y(function(d) { return d.y; })
								.interpolate('linear');

			dupe.append('path')
				.attr('d', lineFunc(geom.lineData))
				.attr('stroke', 'none')
				.attr('fill', 'rgba(255,255,255,0.5)');


	    	dupe.selectAll('rect')
				.data(d.risks)
				.enter().append('rect')
				.attr('width', geom.width)
				.attr('height', geom.rowH)
			    .attr('x', function(d) {
			    	return ( toRight ) ? geom.initX  : geom.initX - geom.width - geom.gap;
			    })
			    .attr('y', function (ts, i) {
			    	return geom.topY + i * geom.fullRowH;
			    })
	    		.attr('opacity', 1e-6)
	    		.style('font', geom.font)
			    .style('fill', '#333')
					.transition()
					.duration(400)
					.attr('opacity', 1);

	    	dupe.selectAll('text.rec-title-text')
				.data(d.risks)
				.enter().append('text')
				.attr('class', 'rec-title-text')
			    .attr('x', geom.initX + geom.gap)
			    .attr('x', function(d) {
			    	return ( toRight ) ? geom.initX + geom.gap  : geom.initX + geom.gap - geom.width;
			    })
			    .attr('y', function (ts, i) { return geom.textTopY + i * geom.fullRowH; })
	    		.attr('opacity', 1e-6)
	    		.style('font', geom.font)
			    .style('cursor', 'pointer')
			    .style('fill', '#DDD')
			    .text(function(ts) { 
			    	return ts.description;
			    })
			    .on('click', onMouseRecClick)
					.transition()
					.duration(400)
					.attr('opacity', 1);

			dupe.select('circle')
				.transition()
				.duration(400)
				.attr('r', geom.radius);

			dupe.on('mouseleave', onMouseOut);

		}

		function getGeom(d, r, toright) {
			var obj = {},
				len = d.risks.length,
				baseY = d.y + d.dy/2,
				fullheight = Math.round(d.dy/3),
				fs = Math.round(fullheight/2.85),
				topY = baseY - (fullheight * (len/2)),
				rect;

			obj.fullRowH = fullheight;
			obj.radius = Math.round(r * 1.1);
			obj.gap = Math.round(fullheight/10);
			obj.rowH = fullheight - obj.gap;
			obj.width = d.dx*2;
			obj.font = fs + 'px sans-serif';

			obj.topY = ( topY <= 0 ) ? 0 : topY;

			// TODO - handle long list
			// if ( obj.topY + fullheight * len > size * 5 - obj.topY ) {
			// 	obj.topY = size * 5 - fullheight * len;

			// }
			obj.textTopY = obj.topY + fullheight/2 + obj.gap;

			if ( toright ) {
				obj.initX = d.x + d.dx/2 + obj.radius;
				rect = {
					x: obj.initX,
					y: obj.topY - obj.gap,
					w: obj.width + obj.gap*2,
					h: obj.fullRowH * len + obj.gap*2
				};
				obj.lineData = [
					{ x: rect.x - obj.gap*3, y: rect.y + rect.h/2 },
					{ x: rect.x,             y: rect.y },
					{ x: rect.x + rect.w,    y: rect.y },
					{ x: rect.x + rect.w,    y: rect.y + rect.h },
					{ x: rect.x,             y: rect.y + rect.h },
					{ x: rect.x - obj.gap*3, y: rect.y + rect.h/2 }
				];
			}else {
				obj.initX = d.x + d.dx/2 - obj.radius;
				rect = {
					x: obj.initX,
					y: obj.topY - obj.gap,
					w: obj.width + obj.gap*2,
					h: obj.fullRowH * len + obj.gap*2
				};
				obj.lineData = [
					{ x: rect.x + obj.gap*3, y: rect.y + rect.h/2 },
					{ x: rect.x,             y: rect.y },
					{ x: rect.x - rect.w,    y: rect.y },
					{ x: rect.x - rect.w,    y: rect.y + rect.h },
					{ x: rect.x,             y: rect.y + rect.h },
					{ x: rect.x + obj.gap*3, y: rect.y + rect.h/2 }
				];
			}

			return obj;
		}

		function onMouseOut() { 
			d3.select(this).remove(); 
		}

		function foldCells(cb) {

			dgCircles.transition()
				.delay(function(d, i) { return i * 15; })
				.duration(400)
				.attr('cy', 0)
				.attr('cx', 0)
				.attr('r', 0);

			dgNumberText.transition()
				.delay(function(d, i) { return i * 15; })
				.duration(400)
				.attr('x', 0)
				.attr('y', 0)
				.style('font', 'bold 1px sans-serif');

			if ( !dashboard ) {
				dgSumText.transition()
					.delay(function(d, i) { return i * 15; })
					.duration(400)
					.attr('x', 0)
					.attr('y', 0)
					.style('font', 'bold 1px sans-serif')
					.each('end', function(d, i) {
						if ( i === 24 ) { dataGroups.remove(); }
					});
			}

			cells.transition()
				.delay(function(d, i) { return i * 15; })
				.duration(400)
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', 0)
				.attr('height', 0)
				.each('end', function(d, i) {
					d3.select(this).remove();
					if ( i === 24 ) { cb(); }
				});
		}
		function tick() {
		    this.attr('x', function(d) { return d.x; })
		        .attr('y', function(d) { return d.y; })
		        .attr('text-anchor', 'middle')
		        .text(function(d) { return d.text; })
		        .style('font', function(d) { return d.font; })
		        .style('fill', '#333');
		}

		function unfoldCells() {
			cells.transition()
			    .delay(function(d, i) { return i * 15; })
			    .duration(400)
			    .call(cell);

			dgNumberText.transition()
			    .delay(function(d, i) { return i * 15; })
			    .duration(400)
			    .call(ntext);

			if ( !dashboard ) {
				dgSumText.transition()
				    .delay(function(d, i) { return i * 15; })
				    .duration(400)
				    .call(stext);
			}

			dgCircles.transition()
			    .delay(function(d, i) { return i * 15; })
			    .duration(400)
			    .call(circle);
		}

		function circle() {
		    this.attr('cy', function(d) { return d.y + d.dy/2 - 3; })
			    .attr('cx', function(d) { return d.x + d.dx/2 - 3; })
			    .attr('r', function(d) {
			    	if ( +d.totalCost > 10 ) { return largeRadius; }
			    	if ( +d.totalCost >= 1 ) { return mediumRadius; }
			    	return smallRadius;
			    });
		}

		function ntext() {
		    this.attr('y', function(d) {
		    		if ( dashboard ) { return d.y + d.dy/2; }
			    	if ( +d.totalCost > 10 ) { return d.y + d.dy/2 + largeTextMargin; }
			    	if ( +d.totalCost >= 1 ) { return d.y + d.dy/2 + mediumTextMargin; }
			    	return d.y + d.dy/2 + smallTextMargin;
			    })
			    .attr('x', function(d) { return d.x + d.dx/2 - 3; })
			    .style('font', function(d) {
			    	if ( +d.totalCost > 10 ) { return 'bold ' + largeFont + 'px sans-serif'; }
			    	if ( +d.totalCost >= 1 ) { return 'bold ' + mediumFont + 'px sans-serif'; }
			    	return 'bold ' + smallFont + 'px sans-serif';
			    });
		}

		function stext() {
		    this.attr('y', function(d) {
			    	if ( d.risks.length === 1 ) { return d.y + d.dy/2; }
			    	if ( +d.totalCost > 10 ) { return d.y + d.dy/2 - largeTextMargin; }
			    	if ( +d.totalCost >= 1 ) { return d.y + d.dy/2 - mediumTextMargin; }
			    	return d.y + d.dy/2 - smallTextMargin;
			    })
			    .attr('x', function(d) { return d.x + d.dx/2 - 3; })
			    .style('font', function(d) {
			    	if ( +d.totalCost > 10 ) { return 'bold ' + largeFont + 'px sans-serif'; }
			    	if ( +d.totalCost >= 1 ) { return 'bold ' + mediumFont + 'px sans-serif'; }
			    	return 'bold ' + smallFont + 'px sans-serif';
			    });
		}

		function cell() {
		    this.attr('x', function(d) { return d.x; })
		        .attr('y', function(d) { return d.y; })
		        .attr('width', function(d) { return d.dx - 6; })
		        .attr('height', function(d) { return d.dy - 6; });
		}

		function getAxis(s) {
		    var fs = Math.round(s/6),
		        tfs = Math.round(s/5),
		        tfont = tfs + 'px sans-serif',
		        font = fs + 'px sans-serif',
		        hf = Math.round(s/2);

		    var axes = {
		        cs: {
		            title: {
		                text: 'Consequence',
		                y: hf - tfs * 1.4,
		                x: hf + Math.round((s * 5)/2),
		                font: tfont
		            },
		            x0: s,
		            y0: hf - fs/3,
		            ticks: [ {}, {}, {}, {}, {} ]
		        },
		        lh: {
		            title: {
		                text: 'Likelihood',
		                x: hf - tfs * 1.2,
		                y: hf + Math.round((s * 5)/2),
		                font: tfont
		            },
		            y0: s,
		            x0: hf - fs/2,
		            ticks: [ {}, {}, {}, {}, {} ]
		        }
		    };

		    axes.cs.ticks.forEach(function(d, i) {
		        d.text = i + 1;
		        d.x = axes.cs.x0 + i * s;
		        d.y = axes.cs.y0;
		        d.font = font;
		    });
		    axes.lh.ticks.forEach(function(d, i) {
		        d.text = 5 - i;
		        d.y = axes.lh.y0 + i * s;
		        d.x = axes.lh.x0;
		        d.font = font;
		    });
		    return axes;
		}

		function getMatrix(s) {
			var arr = [],
				color, sum,
				a = 5,
				b = 1;
			while ( a ) {
				for ( b = 1; 6 > b; b++ ) {
					sum = a + b;
					if ( sum > 8 ) {
						color = 'red';
					}else if ( sum > 6 ) {
						color = 'orange';
					}else if ( sum > 4 ) {
						color = 'yellow';
					}else {
						color = 'green';
					}
					arr.push({
						lh: a,
						cs: b,
						color: color
					});
				}
				a--;
			}
			arr.forEach(function(d, i) {
				d.x = parseInt((i % 5)*s, 10);
				d.y = Math.floor(i / 5)*s;
				d.dx = s;
				d.dy = s;
			});
			return arr;
		}
	}
	return {
		scope: {
			risks: '=',
			riskType: '@',
			goToRecord:'=onRiskClick'
		},
		restrict: 'E',
		template: '<div></div>',
		replace: true,
		transclude: true,
		link: function(scope, el, attrs) {

			var dashboard = scope.$eval(attrs.dashboard),
				side = el.width(),
				matrix;
			el.height(side);
			matrix = new Matrix(
				el[0],
				attrs.canvas,
				side,
				dashboard,
				scope.goToRecord
			);

            scope.$watch('risks', function(val, ov) {
            	if ( val !== ov ) { matrix.update(val, scope.riskType); }
            });
		}
	};
});