//TODO: need to figure out how to get the specific article add comment that 
//was clicked on and display comments for that artcile


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("AddComment");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    console.log("Add comment clicked")
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

  
// When you click the savenote button
$(document).on("click", "#savenote", function() {
// Grab the id associated with the article from the submit button
var thisId = $(this).attr("data-id");

// Run a POST request to change the note, using what's entered in the inputs
$.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
    // Value taken from title input
    title: $("#titleinput").val(),
    // Value taken from note textarea
    body: $("#bodyinput").val()
    }
})
    // With that done
    .then(function(data) {
    // Log the response
    console.log(data);
    // Empty the notes section
    $("#notes").empty();
    });

// Also, remove the values entered in the input and textarea for note entry
$("#titleinput").val("");
$("#bodyinput").val("");
});
