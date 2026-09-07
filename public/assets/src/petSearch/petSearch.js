/* global $ */
$(function() {
  var $results = $("#search-results");

  $("#search-btn").on("click", function(event) {
    event.preventDefault();
    var values = $("#pet-search-form").form("get values");

    if (!values.petType || !values.breed || !values.gender || !values.zipCode || !values.petAge) {
      $("#pet-search-form").form("validate form");
      return;
    }

    $results.empty().append($("<p>").text("Searching for pets..."));
    $.getJSON("/api/pet-search", {
      type: values.petType,
      breed: values.breed,
      gender: values.gender,
      age: values.petAge,
      location: values.zipCode
    }).done(function(data) {
      $results.empty();
      if (!data.animals || data.animals.length === 0) {
        $results.append($("<p>").text("No pets matched that search. Try broadening your criteria."));
        return;
      }
      data.animals.forEach(renderPet);
    }).fail(function(request) {
      var message = request.responseJSON && request.responseJSON.error;
      $results.empty().append($("<p>").text(message || "Unable to search for pets right now."));
    });
  });

  function renderPet(pet) {
    var email = pet.contact && pet.contact.email ? pet.contact.email : "Not available";
    var shelter = [pet.contact && pet.contact.city, pet.contact && pet.contact.state].filter(Boolean).join(", ") || "Location not available";
    var photo = pet.photos && pet.photos.length ? pet.photos[0].medium : "";
    var $card = $("<article>").addClass("ui fluid card search-card");
    var $content = $("<div>").addClass("content");
    var $like = $("<button>", { type: "button" }).addClass("ui button likeBtn").html("<i class='heart outline icon'></i>Like");

    $content.append($("<h3>").text(pet.name));
    $content.append($("<p>").text("Age: " + (pet.age || "Not available")));
    $content.append($("<p>").text("Shelter: " + shelter));
    $content.append($("<p>").text("Contact: " + email));
    $content.append($("<p>").text(pet.description || "No description available."));
    if (photo) {
      $content.append($("<img>", { src: photo, alt: pet.name + " the " + (pet.type || "pet") }));
    }
    $like.on("click", function() { savePet(pet.name, shelter, email, photo); });
    $card.append($("<div>").addClass("extra content").append($like), $content);
    $results.append($card);
  }

  function savePet(name, shelter, email, photo) {
    $.ajax("/api/pets", {
      type: "POST",
      data: { pet_name: name, pet_shelter: shelter, pet_email: email, pet_photo: photo }
    }).done(function() {
      $.uiAlert({ textHead: "Saved " + name + ".", text: "View this pet from My saved pets.", bgcolor: "#C9434A", textcolor: "#fff", position: "bottom-center", icon: "heart", time: 3 });
    }).fail(function() {
      $.uiAlert({ textHead: "Unable to save this pet.", text: "Please try again.", bgcolor: "#C9434A", textcolor: "#fff", position: "bottom-center", icon: "warning", time: 3 });
    });
  }
});
