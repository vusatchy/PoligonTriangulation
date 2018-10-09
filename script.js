var markers = [];
var redColour = '#FF0000';
var greenColour = '#1ee804';
var polygon = null;
var pols = [];

$("#buttonDelete").on("click", deleteAllMarkers);
$("#triangulate").on("click", triangulate);


function initMap() {

    var mapCanvas = document.getElementById("map");
    var myCenter = new google.maps.LatLng(24.886, -70.268);
    var mapOptions = {
        center: myCenter,
        zoom: 5
    };

     map = new google.maps.Map(mapCanvas, mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(map, event.latLng);
    });

}

function placeMarker(map, location) {
    var marker = new google.maps.Marker({
        label: "",
        position: location,
        map: map
    });
    marker.label = marker.getPosition().lat() + " " + marker.getPosition().lng()
    markers.push(marker);
    listOfMarkers = convertMarkers(markers);
    if (markers.length > 2) {
        if (polygon != null) {
            polygon.setMap(null);
        }
        var colour = colourChoose(listOfMarkers);
        polygon = new google.maps.Polygon({
            paths: listOfMarkers,
            strokeColor: colour,
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: colour,
            fillOpacity: 0.35
        });
        polygon.setMap(map);
    }
}

function deleteAllMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    for (var i = 0; i < pols.length; i++) {
        pols[i].setMap(null);
    }
    if (polygon != null) {
        polygon.setMap(null);
    }
    markers = [];
    pols = [];
}

function tringulateRecursive(ps){
    if(ps.length > 4){
      var original = Array.from(ps);
      console.log("original")
      console.log(original)
       randomIndex = Math.floor(Math.random() * original.length)
       randomPoint = original[randomIndex];
       //original = original.splice(randomIndex + 1,1);
       //original =  original.splice(randomIndex,1);
      //var index = randomIndex - 1   
      //if(index < 0 ){
       // index = original.length + index;
      //}
      //original.splice(index,1);
      var farest =  findFarest(randomPoint,original); 
      var coord = [randomPoint,farest]
      var farIndex = indexOf(farest,original);
      var pol = new google.maps.Polyline({
          path: coord,
          geodesic: true,
          strokeColor: greenColour,
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        pol.setMap(map);
        pols.push(pol)

    var set1 = ps.slice(Math.min(randomIndex,farIndex),Math.max(randomIndex,farIndex) + 1)
    var set2 = createSet(set1,ps)
    randomIndex > farIndex ? set2.unshift(farest) : set2.push(randomPoint)
    randomIndex < farIndex ? set2.push(randomPoint) : set2.unshift(farest)
    console.log("Set1")
    console.log(set1)
    console.log("Set2")
    console.log(set2)
    console.log("+------------------------------------------+")
    tringulateRecursive(set1);
    tringulateRecursive(set2);
    }
    else if(ps.length == 4){
        console.log(ps)
        var posC = Array.from(ps);
        console.log(posC)
        var posC1 = posC[0]
        console.log(posC1)
        var posC2 = posC[2]
        var p12 = [posC1,posC2]
         var pol = new google.maps.Polyline({
          path: p12,
          geodesic: true,
          strokeColor: greenColour,
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        pol.setMap(map);
        pols.push(pol)
    }
}

function createSet(set1 ,original){
    var arr = []
    for(j = 0; j < original.length ; j++){
       if(indexOf(original[j],set1) == null){
            arr.push(original[j]);
       }
    }
    return arr;
}

function indexOf(p,ps){
  for(i = 0; i < ps.length; i++){
    if(p.lat == ps[i].lat && p.lng == ps[i].lng){
        return i;
    }
  }
  return null;
}

function triangulate(){
   if(polygon != null){
      tringulateRecursive(Array.from(listOfMarkers.reverse()))
   }
}

function dist(p1,p2){
    return Math.sqrt(Math.pow(p1.lat - p2.lat,2) + Math.pow(p1.lng - p2.lng,2))
}

function findFarest(point , points){
    farest = points[0];
    points.forEach(function(p){
       if(dist(point,p) >= dist(farest,point)){
         farest = p
       }
    });
    return farest;
}

function convertMarkers(listOfMarkers) {
    newMarkers = [];
    listOfMarkers.forEach(function(item) {
        newMarkers.unshift({
            lat: item.getPosition().lat(),
            lng: item.getPosition().lng()
        });
    });
    return newMarkers;
}

function colourChoose(arr) {
    return isRegular(arr) ? greenColour : redColour ;
}


function isRegular(arr) {
    var prodPrev = null;
    for (var p = 1; p < arr.length; p++) {
        var p1 = 0;
        var p2 = 0;
        var p3 = 0;
        if (p == arr.length - 1) {
            p1 = arr[p - 1];
            p2 = arr[p];
            p3 = arr[0];
        } else {
            p1 = arr[p - 1];
            p2 = arr[p];
            p3 = arr[p + 1];

        }
        var ab = {
            lat: p2.lat - p1.lat,
            lng: p2.lng - p1.lng
        };

        var bc = {
            lat: p3.lat - p2.lat,
            lng: p3.lng - p2.lng
        };

        var product = ab.lat * bc.lng - ab.lng * bc.lat;
        if (prodPrev == null) {
            prodPrev = product;
        } else {
            if (Math.sign(product) != Math.sign(prodPrev)) {
                return false;
            }
            prodPrev = product;
        }
       
    }
    return true;
}
