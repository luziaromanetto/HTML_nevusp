var MYAPP = {
    graph : {},
    filename : '/static/data/NEVUSP/time/NEV_R10Opt.json',
    pointsfile : 'public/data/NEVUSP/time/points.tsv',
    size : {    width : $(window).width(),
                guideWidth : $(window).width()*0.9,
                guideHeight :$(window).width()*0.2,
                spmapWidth : $(window).width()*0.5,
                spmapHeight : $(window).width()*0.5},
    svg: {},
    selection: [],
    visualizationStyle: 'heat'
}

var color = d3.scale.category10();

function initmap(){    
    buildMenu()
    
    //
    var dirGuide = d3.select('#guide'), 
        dirMap = d3.select('#map');
    var size = MYAPP.size;

    // Create svg for guide
    MYAPP.svg.guide = dirGuide.append("svg")
            .attr("id", "svg-guide")
            .attr("height", size.guideHeight)
            .attr("width", size.guideWidth)
            .attr("align", "center");

    // Create svg for map
    d3.json(MYAPP.filename,function(json)
    {
        var tensor = json.tensor;

        buildGuide(tensor);
        buildMap();
    })
}

function buildMenu(){
    // Build Dataset selection
    var select = document.getElementById("select-dataset");
    select.onchange = function(){
        var adress = select.value
        MYAPP.filename = '/static'+adress
        MYAPP.pointsfile = 'public'+adress.substring(0,adress.length-15)+'points.tsv'
        
        var divGuide = d3.select('#guide'),
            divMap = document.getElementById('map'),
            divspMap = document.getElementById('spmap');
            
        divGuide.selectAll("*").remove();
        
        divspMap.remove();
        divspMap = document.createElement('div');
        divspMap.id = 'spmap';
        divspMap.className = 'spmap';
        divMap.appendChild(divspMap);
      
        initmap()
    }
    
    // Build Visualization selection style
    var select = document.getElementById("select-vis");
    select.onchange = function(){
        var vis = select.value;
        MYAPP.visualizationStyle = vis;
        printPoints()
    }
}

function buildGuide(t){
    buildGraph(t);
    drawGuide();
// ------------------------------------------------------------------ //
//                    FUNCTIONS FOR DRAW GUIDE
// ------------------------------------------------------------------ //
    function drawGuide(){
        drawColumns();
        drawConections();
    }

    function buildGraph(tensor){
        var modes = tensor.modesName.map(
            function(d, i){
                var mode = {};
                mode.name = d;
                mode.dimNames = tensor.modesDimensionName[i];
                mode.size = tensor.decomposition.R[i];
                
                var B = d3.range(mode.size).map( 
                    function(j){
                        var p = tensor.decomposition.B[i].map(
                            function(c){
                                return c[j];
                            })
                        return p;
                    });
                    
                mode.pattern = B.map( function(b, j){
                    var pattern = {};
                    var ids = Object.keys(b).sort( function(x,y){return b[x]-b[y]} ).reverse(),
                        vals = ids.map( function(d){ return b[parseInt(d)]; } ),
                        pos = [], sumVals = 0;
                        
                    for ( var k=0;(k==0)||(((sumVals+vals[k] < 0.70))||(vals[k]>0.15)) ; k++){
                        sumVals+=vals[k];
                        pos.push(k)
                    }
                    
                    if ( true ){
                        var ftrs = pos.map( function(d){
                            var el = {};
                            el.val = vals[d]/sumVals*0.95;
                            el.text = mode.dimNames[ids[d]];
                            return el;
                        })
                        pattern.features = ftrs;
                    }else{
                        pattern.features = mode.dimNames;
                    }
                    
                    pattern.ids = ids.slice(0,pos.length).map(function(d){return parseInt(d)}); // Allways needed for points selection
                    pattern.b = b;
                    pattern.mode = i;
                    pattern.factor = j;
                    pattern.value = 0;
                    return pattern;
                })
                return mode;
            });
        
        var coreSum = 0;
        var edges = tensor.decomposition.C.map(
            function(d){
                var edge = {};
                edge.value = d[1];
                edge.id = d[0];
                
                edge.id.forEach( function(p,i){
                    modes[i].pattern[p].value += d[1];
                });
                coreSum += d[1];
                return edge;
            })
        
        MYAPP.graph.coreSum = coreSum;
        MYAPP.graph.modes = modes;
        MYAPP.graph.edges = edges;
    }

    function drawColumns(){
        // Build node patterns
        // get svg
        var guideSvg = MYAPP.svg.guide;
        var size = MYAPP.size;
        
        // Make a link copy !!not a deep copy!!
        var modesData = MYAPP.graph.modes;
        
        // Associa os dados de modos às colunas
        var modes = guideSvg.selectAll(".modes")
                                .data(modesData).enter();
            
        var N = MYAPP.graph.modes.length,
            colSize = size.guideWidth/(3.0*N-1.0),
            h = size.guideHeight*0.85;
            
        MYAPP.selection = d3.range(N).map( function(d){ return -1;} );
        
        var gs = modes.append('g')
            .attr("class",  "modes")
            .attr("id", function(d,i){ return "mode-"+i; })
            .attr("transform", function(d,i){ return "translate(" + 3*(colSize)*i + ",0)";} );
        
        gs.append("text")
            .attr("y", 0.10*h)
            .attr("x", colSize)
            .attr("font-size", 0.10*h)
            .style("text-anchor", "middle")
            .style("font-weight","bold")
            .text(function(d){return d.name;});
            
        var patterns = gs.selectAll('.gpattern')
                            .data(
                                function(d){ return d.pattern; })
                                .enter()
                                    .append("g");
        
        var coreSum = MYAPP.graph.coreSum;
        var pos = d3.range(N).map( function(){ return 0.12*h; })
        var y = function(v,i){
                    var p = pos[i];
                    pos[i] += hy(v)+0.01*h;
                    return p;
                }

        var hy = function(v){
                    return v/coreSum*h;
                }

        patterns
                .attr("class", "gpattern")
                .attr("id", function(d, i, j){ return 'pattern-'+j+'-'+i;})
                .attr("transform",  function(d,i,j){ return "translate(0,"+y(d.value,j)+")";} );

        gpatterns = d3.selectAll(".gpattern")
        gpatterns.on("click", function(d){
            var s = MYAPP.selection, m=d.mode, f=d.factor;
            if( s[m]==f ){ 
                s[m] = -1; 
                var node = d3.select(this).select("rect");
                node.style("stroke", "DarkSlateGrey")
                    .style("stroke-width", 1.5)
                    .style("stroke-opacity", 0.5)
            }else{ 
                s[m] = f;         
                var col = d3.select("#mode-"+m),
                    rect = d3.select(this).select("rect"),
                    nodes = col.selectAll("rect");
                nodes.style("stroke", "DarkSlateGrey")
                    .style("stroke-width", 1.5)
                    .style("stroke-opacity", 0.5)
                
                rect.style("stroke", "black")
                    .style("stroke-width", 2.5)
                    .style("stroke-opacity", 1)
            }
            
            highlightEdges();
            printPoints();
        })
        
        gpatterns.append("rect")
            .attr("x", 0)
            .attr("width", colSize*2)
            .attr("y", 0 )
            .attr("height", function(d){return hy(d.value); } )
            .style("stroke", "DarkSlateGrey")
            .style("stroke-width", 1.5)
            .style("stroke-opacity", 0.5)
            .style("fill-opacity", 0);
        
        gpatterns.append("g")
            .datum(function(d){ return d; })
            .attr("class", "gtext")
        // Build text for feature modes
        var gtext = d3.selectAll(".gtext");    
        var pos = d3.range(gtext[0].length).map( function(){ return 0; })

        gtext.selectAll(".ptext").data(function(d){return d.features.slice(0,Math.min(d.features.length,5))}).enter()
                    .append("text")
                        .attr("class", "ptext")
                        .attr("y", function(d,i,j){
                            pos[j] += d.val*h;
                            return pos[j];
                        })
                        .attr("font-size", function(d, i, j){ return d.val*h } )
                        .style("text-anchor", "middle")
                        .text(function(d){ return d.text });

        gtext.attr("transform", function(d){
                        var scale = hy(d.value)/h*0.9,
                            BBox = d3.select(this).node().getBBox();
                        var perm = { dx : colSize, dy : hy(d.value)/2-BBox.height*scale/(2*0.9) }
                        return "translate("+perm.dx+","+perm.dy+") scale("+scale+")";
                    });
        
        // Build charts for time mode
        //var gtime = d3.selectAll(".gtime");
        //gtime.call(areaChart)
    }

    function drawConections(){
        // get svg
        var guideSvg = MYAPP.svg.guide;

        // Make a link copy !!not a deep copy!!
        var edgesData = MYAPP.graph.edges;
        
        // Associa os dados de modos às colunas
        var edges = guideSvg.selectAll(".gconection")
                .data(edgesData)
                .enter()
                    .append("g")
                    .attr("class", "gconection")
                    .attr("id", function(d){ return "conection-"+d.id.join("-"); })
            
        var size = MYAPP.size,
            N = MYAPP.graph.modes.length,
            colSize = size.guideWidth/(3.0*N-1.0),
            coreSum = MYAPP.graph.coreSum,
            h = size.guideHeight*0.85,
            hy = function(v){ return v/coreSum*h; };
            
        var nodes = d3.selectAll(".gpattern");
        
        var modesData = MYAPP.graph.modes;    
        var pos = modesData.map( function(mode, i){
            var patterns = mode.pattern;
            var colPos = patterns.map( function(pattern, j){
                var nodePos = {},
                    nodeId = 'pattern-'+i+'-'+j,
                    node = d3.select("#"+nodeId),
                    dy = d3.transform(node.attr("transform")).translate[1];
                nodePos.left = dy;
                nodePos.right = dy;
                return nodePos;
            })
            return colPos;
        })
        
        for( var i=0; i<(N-1); i++){ // Itera sobre os modos/colunas
            var ids=MYAPP.graph.edges.map(function(d){
                    return parseInt(""+d.id[i]+""+d.id[i+1]+d.id.join(""));
                }),
            // Define a ordem de impressão das arestas para minimizar
            // cruzamentos
            order = Object.keys(ids).sort( function(a,b){return ids[a]-ids[b]} );
            
            order.forEach( function(d){
                var edge = MYAPP.graph.edges[d];
                var ge = d3.select("#conection-"+edge.id.join("-"));
                var id0 = edge.id[i], 
                    id1 = edge.id[i+1];
                var x = [], y =[];
                var propH = hy(edge.value);
                
                y[0] = pos[i][id0].right;
                y[1] = pos[i+1][id1].left;
                y[2] = y[1]+propH;
                y[3] = y[0]+propH;
                x[0] = (i*3+2)*colSize;
                x[1] = (i+1)*3*colSize;
                x[2] = x[1];
                x[3] = x[0];
                
                pos[i][id0].right += propH;            
                pos[i+1][id1].left += propH;

                var poly = d3.range(4).map( function(d){ return {"x":x[d],"y":y[d]};} )
                
                ge.append("polygon")
                                .data([poly])
                                .attr("class", "polygon")
                                .attr("id", "ep-"+edge.id.join("-")+"-"+i )
                                .attr("points",function(p){
                                    return p.map(function(p){ return p.x+","+p.y;}).join(" ");
                                })
                                .style("fill-opacity", .2)
                                .style("fill", "black" ) // color(edge.id[0])
            })
        }
    }
    
    function highlightEdges(){
        var edges = MYAPP.graph.edges.filter( edgeSelected );

        d3.selectAll(".polygon").style("fill-opacity", .2)
        if( edges.length != MYAPP.graph.edges.length ){
            edges.forEach( function(edge){
                var ge = d3.select("#conection-"+edge.id.join("-")),
                    p = ge.selectAll(".polygon");
                p.style("fill-opacity", 1)
            })
        }
        
        function edgeSelected(d){
            var s = MYAPP.selection;
            
            if( (s[0]==-1 || d.id[0]==s[0] ) && 
                (s[1]==-1 || d.id[1]==s[1] ) &&  
                (s[2]==-1 || d.id[2]==s[2] ) && 
                (s[3]==-1 || d.id[3]==s[3] ) )
            {
                return true
            }
            
            return false
        }
    }

}

function buildMap(){    
    // Build pickup map    
    var  size = MYAPP.size,
         mapDiv = document.querySelector('#spmap');
    mapDiv.style.height = size.spmapHeight + 'px';
    
    var map = L.map('spmap');
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib});

    var spmap = map.setView(new L.LatLng(-23.58573535186282,-46.6516633922166),11);
    spmap.addLayer(osm);
    MYAPP.spmap = spmap;
    
    $.post("/query", {"filename" : MYAPP.pointsfile }, function(result){
        if( result == 'true' )
            printPoints(true)
    })
}

function printPoints(isInicial = false){
    var spmap = MYAPP.spmap;
    var s = MYAPP.selection;
    
    var idsSet = s.map( function(d, i){
        if( d!= -1) return MYAPP.graph.modes[i].pattern[d].ids
        else        return [-1];
    })
    
    $.get("/query", {"setId": JSON.stringify(idsSet) })
     .done(function(data) {
        selected = jQuery.parseJSON(data);
        var points = selected.map( function(d){ return [parseFloat(d.Latitude), parseFloat(d.Longitude)]} );
        
        if(MYAPP.pointOn) spmap.removeLayer(MYAPP.spheat)
        
        if( MYAPP.visualizationStyle == 'heat' ){
            options = { minOpacity:0.1, radius:10}
            MYAPP.spheat = L.heatLayer(points, options).addTo(spmap);
            spmap.addLayer(MYAPP.spheat);
        }else if( MYAPP.visualizationStyle == 'ctype' ){
            points.forEach( function(d){
                p = L.point(spmap.latLngToLayerPoint(d[0], d[1]))
            })
        }
        
        MYAPP.pointOn=true;
    });
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
