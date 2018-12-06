// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
$(document).on("click", ".add-comment", function() {
    console.log("Add comment clicked")

    var articleID = $(this).attr("articleid")
    console.log(articleID)

    // Get the modal
    var modalID = "myModal" + articleID
    var modal = document.getElementById(modalID);

    modal.style.display = "block";
})

// When the user clicks on <span> (x), close the modal
$(document).on("click", ".close", function() {

    var articleID = $(this).attr("articleid")
    console.log(articleID)

    // Get the modal
    var modalID = "myModal" + articleID
    var modal = document.getElementById(modalID);

    modal.style.display = "none";
})
