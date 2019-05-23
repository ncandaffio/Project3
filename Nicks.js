var items = [];
$.getJSON( "http://localhost:5000/2008", function( data ) {
    $.each( data, function(result) {
      items.push(result);
    });
});
console.log(items)