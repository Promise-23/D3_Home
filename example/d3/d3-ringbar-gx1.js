!function(){
	var RingBar={};
	
	RingBar.draw = function(id,cx,cy,rx,ry,tp,offsetAngle){

	var ret = [];
	var offsetAngle = offsetAngle|| Math.PI/2;

	// var svg = d3.select("body").append("svg").attr("width",960).attr("height",560);
	var svg = d3.select("#"+id).append("svg").attr("width","100%").attr("height","100%");

	var _data = d3.pie().sort(null).value(function(d) {return d.value;})(salesData);
	// _data.sort(function(a,b){return a.data.highValue>b.data.highValue;});

	//draw from inner to outer
	var a = [];
	var b =[];
	var l = _data.length;
	for(var j=parseInt(l/2);j<l;j++){
		a.push(l-j-1);
		b.push(j);
	}
	for(var i=0;i<a.length;i++){
		var av = a[i];
		var bv = b[i];
		if(av == bv){
			var d= _data[av];
			drawSliceGroup(d);
		}else{
			var d1= _data[av];
			drawSliceGroup(d1);
			var d2= _data[bv];
			drawSliceGroup(d2);
		}
	}


		function drawSliceGroup(data,i){
			data.startAngle+=offsetAngle;
			data.endAngle+=offsetAngle;
			var id = data.data.label;
			var data = [data];
			svg.append("g").attr("id",id);
			var slices = d3.select("#"+id).attr("class", "st0");

			slices.selectAll(".innerSlice").data(data).enter().append("path").attr("class", "innerSlice")
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
			.attr("d",function(d){
					return pieInner(d, rx,ry, (d.data.highValue), tp);
			})
			.each(function(d){this._current=d;});

			slices.selectAll(".leftSlice").data(data).enter().append("polygon").attr("class", "leftSlice")
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.5); })
			.attr("points",function(d){
					return pieLeftSide(d, rx,ry, (d.data.highValue), tp);
			})
			.each(function(d){this._current=d;});

			slices.selectAll(".rightSlice").data(data).enter().append("polygon").attr("class", "rightSlice")
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.5); })
			.attr("points",function(d){
					return pieRightSide(d, rx,ry, (d.data.highValue), tp);
			})
			.each(function(d){this._current=d;});

			slices.selectAll(".outerSlice").data(data).enter().append("path").attr("class", "outerSlice")
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
			.attr("d",function(d){ return pieOuter(d, rx,ry, (d.data.highValue) );})
			.each(function(d){this._current=d;});


			slices.selectAll(".topSlice").data(data).enter().append("path").attr("class", "topSlice")
			.style("fill", function(d) { return d.data.color; })
			.style("stroke", function(d) { return d.data.color; })
			.attr("d",function(d){ return pieTop(d, rx, ry, tp);})
			.attr("transform", function(d){
					return "translate(" + 0 + "," + -(d.data.highValue) + ")"
			})
			.each(function(d){this._current=d;});
		}

		function pieTop(d, rx, ry, tp){
				var od = centeredToSVG(cx, cy, rx, ry, d.startAngle, d.endAngle, 0);
				var ind = centeredToSVG(cx, cy, (1-tp)*rx, (1-tp)*ry, d.startAngle, d.endAngle, 0);
				var ret = [];
				ret.push("M",ind.x0,ind.y0,
					"A",ind.rx,ind.ry,"0 0 1",ind.x1,ind.y1,
					"L",od.x1,od.y1,
					"A",od.rx,od.ry,"0 0 0",od.x0,od.y0,
					"z"
					);
					//console.log(ret.join(" "))
				return ret.join(" ");
		}

		function pieOuter(d, rx, ry, h ){
			var startAngle = (d.startAngle>2*Math.PI) ? (d.startAngle-2*Math.PI) : d.startAngle;
			var endAngle = (d.endAngle>2*Math.PI) ? (d.endAngle-2*Math.PI) : d.endAngle;
			// startAngle = (d.startAngle>Math.PI) ? Math.PI : d.startAngle;
			if(Math.PI < startAngle  && Math.PI < endAngle){
				return " ";
			}
			if(Math.PI*3/2 < startAngle){
				startAngle = 0;
			}
			endAngle = (endAngle>Math.PI) ? Math.PI: endAngle;
			
			console.log(startAngle,endAngle);
			var od = centeredToSVG(cx, cy, rx, ry, startAngle, endAngle, 0);
			var ret = [];
			ret.push("M",od.x0,od.y0,
			// ret.push("M",cx+rx,cy,
						"A",od.rx,od.ry,"0 0 1",od.x1,od.y1,
						"L",od.x1,od.y1-h,
						"A",od.rx,od.ry,"0 0 0",od.x0,od.y0-h,
						"z");
				return ret.join(" ");		
		}

		function pieInner(d, rx, ry, h, tp ){
			var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
			var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);
			
			var ind = centeredToSVG(cx, cy, (1-tp)*rx, (1-tp)*ry, startAngle, endAngle, 0);
			ret = [];
			//return [x0, y0, rx, ry, phi, largeArc, sweep, x1, y1];
			ret.push("M",ind.x0,ind.y0,
					"A",ind.rx,ind.ry,"0 0 1",ind.x1,ind.y1,
					"L",ind.x1,ind.y1-h,
					"A",ind.rx,ind.ry,"0 0 0",ind.x0,ind.y0-h,
					"z");

			return ret.join(" ");
		}

		function pieLeftSide(d, rx, ry, h, tp ){
			var od = centeredToSVG(cx, cy, rx, ry, d.startAngle, d.endAngle, 0);
			var ind = centeredToSVG(cx, cy, (1-tp)*rx, (1-tp)*ry, d.startAngle, d.endAngle, 0);
			var bsPoints = [];

			//第1，4象限，绘制leftSide
			if( (0 < d.endAngle && d.endAngle < Math.PI/2 ) || 3*Math.PI/2 < d.endAngle){
				bsPoints.push(od.x1+","+od.y1);
				bsPoints.push(od.x1+","+(od.y1-h));
				bsPoints.push(ind.x1+","+(ind.y1-h));
				bsPoints.push(ind.x1+","+ind.y1);
			}
			return bsPoints.join(" ");
		}

		function pieRightSide(d, rx, ry, h, tp ){
			var od = centeredToSVG(cx, cy, rx, ry, d.startAngle, d.endAngle, 0);
			var ind = centeredToSVG(cx, cy, (1-tp)*rx, (1-tp)*ry, d.startAngle, d.endAngle, 0);
			var bsPoints = [];
			// console.log(d.startAngle,d.endAngle);
			//第3，4象限，绘制rightSide
			if(Math.PI/2 < d.startAngle &&  d.startAngle < 3*Math.PI/2 ){
					bsPoints.push(ind.x0+","+(ind.y0-h));
					bsPoints.push(ind.x0+","+ind.y0);
					bsPoints.push(od.x0+","+od.y0);
					bsPoints.push(od.x0+","+(od.y0-h));
			}
			return bsPoints.join(" ");
		}

}

	this.RingBar = RingBar;
}();



/*
Convert an elliptical arc based around a central point
to an elliptical arc parameterized for SVG.
Parameters are:
		center x coordinate
		center y coordinate
		x-radius of ellipse
		y-radius of ellipse
		beginning angle of arc in degrees
		arc extent in degrees
		x-axis rotation angle in degrees
Return value is an array containing:
		x-coordinate of beginning of arc
		y-coordinate of beginning of arc
		x-radius of ellipse
		y-radius of ellipse
		x-axis rotation angle in degrees
		large-arc-flag as defined in SVG specification
		sweep-flag as defined in SVG specification
		x-coordinate of endpoint of arc
		y-coordinate of endpoint of arc
*/
function centeredToSVG(cx, cy, rx, ry, theta, delta, phi)
{
	var endTheta, phiRad;
	var x0, y0, x1, y1, largeArc, sweep;
	/*
	Convert angles to radians. I need a separate variable for phi as
	radians, because I must preserve phi in degrees for the
	return value.

	theta = theta * Math.PI / 180.0;
	//endTheta = (theta + delta) * Math.PI / 180.0;
	endTheta = (delta) * Math.PI / 180.0;
		*/
		endTheta = (delta) ;
	/*
	phiRad = phi * Math.PI / 180.0;
	Figure out the coordinates of the beginning and ending points

	x0 = cx + Math.cos(phiRad) * rx * Math.cos(theta) + Math.sin(-phiRad) * ry * Math.sin(theta);
	y0 = cy + Math.sin(phiRad) * rx * Math.cos(theta) + Math.cos(phiRad) * ry * Math.sin(theta);
	x1 = cx + Math.cos(phiRad) * rx * Math.cos(endTheta) + Math.sin(-phiRad) * ry * Math.sin(endTheta);
	y1 = cy + Math.sin(phiRad) * rx * Math.cos(endTheta) + Math.cos(phiRad) * ry * Math.sin(endTheta);
	*/
	//phi = 0; 等价于
	x0 = cx + rx * Math.cos(theta);
	y0 = cy + ry * Math.sin(theta);
	x1 = cx + rx * Math.cos(endTheta);
	y1 = cy + ry * Math.sin(endTheta);

	largeArc = (delta > 180) ? 1 : 0;
	sweep = (delta > 0) ? 1 : 0;
	//return [x0, y0, rx, ry, phi, largeArc, sweep, x1, y1];
	return {x0:x0,y0:y0,
					rx:rx,ry:ry,
					xAxisRotation:phi,largeArc:largeArc,sweep:sweep,
					x1:x1,y1:y1};
}
