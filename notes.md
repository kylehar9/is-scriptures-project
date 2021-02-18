# Using Fetch API instead of XMLHttpRequest

- fetch returns a response

fetch("https://scriptures.byu.edu/mapscrip/model/volumes.php").then(function(response) {
    if (response.ok) {
        return response.json();
    }

    throw new Error("Network response was not okay.");
})
.catch(function(error) {
    console.log("Fetch error: ", error.message);
});