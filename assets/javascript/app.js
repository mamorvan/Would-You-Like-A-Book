//----------------------------------------------------------------------------------------
// GLOBAL VARIABLES

var moviePickedPosterPath;
var genreToSearch; //hold movie genre to match to book subject - random from movie picked genre array

//movie DB api not reliable so making a static object with id - name matches 
//keep in mind that these values may change at api and need to be updated
//this will hold the id to genre name matches with id as key and name as value
var genreIdsObject = {
  28 : "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
}; 

// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBWFWAg2YMXu1TO-RUD2APOpX_Knds8m4o",
    authDomain: "movies-to-books-c3182.firebaseapp.com",
    databaseURL: "https://movies-to-books-c3182.firebaseio.com",
    projectId: "movies-to-books-c3182",
    storageBucket: "movies-to-books-c3182.appspot.com",
    messagingSenderId: "28649429385"
  };
  
  firebase.initializeApp(config);
  
  var database = firebase.database();


//------------------------------------------------------------------------------------------------------------------------------
// FUNCTIONS

  // Sets what to show on page load
function onPageLoad() {
  $("#movieChosenDiv").hide();
  $("#bookResults").hide();
  $("#movieResults").hide();
  movieCall();
  $("#most-recent-posters").empty();
}

// Firebase call to populate recent searches div with last (3) posters for movies searched/selected
database.ref().orderByKey().limitToLast(3).
  on("child_added", function(snapshot) {
    //make sure that there's something in the database if you're going to read it 
    var exists = snapshot.exists();
      if (exists) {
        $("#most-recent-posters").append('<img class="img-fluid img-thumbnail recentPosters" src="' + snapshot.val().movieChosenPoster + '" alt="Recent Movies">');
      }
  });


// Handles movie searches/requests and displays possible movie posters
function movieCall() {

  var movieSearchInput = "";
 

  $("#submitMovie").on("click", function(event) {

  // Prevents default submit button action/prevents page load
    event.preventDefault();

    // Set variable term equal to search input
    movieSearchInput = $("#movieTitle").val().trim();

    // Clears search box input
    $("#movieTitle").val("");

    // Shows movieResults div (hidden on page load)
    $("#movieResults").show();

    // Changes text of movieChosenDiv to tell user what to do next
    $("#movieChosenDiv").html("<h2>Click the movie you want!</h2>");

    // Shows movieChosenDiv (hidden on page load)
    $("#movieChosenDiv").show();

    // Hides bookResults div when movies populate (imperative to do this after
    // first search, otherwise bookResults div will stay visible beneath movieResults div)
    $("#bookResults").hide();

    // ajax call info
    var base = "https://api.themoviedb.org/3/";
    var search = "search/movie?query='" + movieSearchInput + "'&";
    var genre = "genre/movie/list?";
    var key = "api_key=b287a269fa3356a822e8c1b358a6f0fc";




//     // first movie DB call to make genre id to genre name object //settings per movie DB docs
//     var settings = {
//       "async": true,
//       "crossDomain": true,
//       "url": base + genre + key,
//       "method": "GET",
//       "headers": {},
//       "data": "{}"
//     }

//     $.ajax(settings).done(function (response) {
//       console.log(response);
//       console.log(response.genres.length);
 
//       //make genreIdsObject with genre ids as keys and corresponding genre strings as values
//       for (i = 0 ; i < response.genres.length ; i++) {
//         genreIdsObject[response.genres[i].id] = response.genres[i].name; 
//       };

// console.log("genreIdsObject:" + genreIdsObject);

//     }); //end of genre call


    // make 2nd call to movie DB to search for movies with title input by user
    $.ajax({
      url: base + search + key,
      method: "GET" 
    }).done(function(response){

      // Clear movieResults div before generating new movie results
      $("#movieResults").empty();

      // If a movie selected doesn't return any results
      if (response.results.length === 0) {
      // Let user know to search for something else
      $("#movieChosenDiv").html("We're sorry. Your search did not return any results.<br>Check your spelling or try another movie title.");
      } 
    
      // display all movie posters found unless there is no poster path
      for (i = 0; i < response.results.length; i++){
          if (!(response.results[i].poster_path == null)) {
          var foundMovieDiv = $("<div>").addClass("col-md-2 hovereffect");
          var foundMoviePoster = $("<img>").attr({
            "class":"img-thumbnail", 
            "src": "https://image.tmdb.org/t/p/w500" + response.results[i].poster_path,
            "alt":"movie poster",
            "id": response.results[i].title,
            "dataGenre": response.results[i].genre_ids
          })
          .on("click", moviePicked);
          var foundMovieTitle = $("<p>").text(response.results[i].title);
          // Pulls only year from release date info (removes month and day)
          var yearOnly = response.results[i].release_date.slice(0,4);
          var foundMovieYear = $("<p>").text(yearOnly);

          $("#movieResults").append(foundMovieDiv);
          foundMovieDiv.append(foundMoviePoster);
          foundMovieDiv.append(foundMovieTitle);
          foundMovieDiv.append(foundMovieYear);

          } //close the if movie poster is available
    
        }; //close the movie-poster display for loop
     
    }); //end of movie data call

  }); // end of submit on click

} // end of movieCall function


// handles storing and passing information from movie picked to firebase and bookCall function
function moviePicked() {
  var moviePickedTitle = $(this).attr("id");
  //store in global variable to be stored in firebase
  moviePickedPosterPath = $(this).attr("src");
  var moviePickedGenreIds = $(this).attr("dataGenre");
  //convert from string to an array
  moviePickedGenreIds = moviePickedGenreIds.split(",");
  //
  var random = Math.floor((Math.random() * moviePickedGenreIds.length));
  var moviePickedRandomGenreId = moviePickedGenreIds[random];
  genreToSearch = genreIdsObject[moviePickedRandomGenreId];

console.log("genreToSearch: " + genreToSearch);  
console.log("moviePickedTitle: " + moviePickedTitle);
console.log("moviePickedPosterPath: " + moviePickedPosterPath);

  //DISPLAY NAME OF CLICKED MOVIE ON DISPLAY
  $("#movieChosenDiv").hide();
  $("#movieChosenDiv").html("<h2>Your movie is: <br><span id='movieChosen'>chosen movie title here</span></h2>");
  $("#movieChosenDiv").show();
  $("#movieChosen").html(moviePickedTitle);

  //EMPTY MOVIE RESULTS IN ORDER TO DISPLAY bookResults div
   $("#movieResults").empty();

   bookCall();

}


// Handles book searches/requests
function bookCall() {

  var bookSubject;

  // If movie genre is undefined   
  if (genreToSearch === undefined) {

    // Let user know to search for something else
    $("#movieChosenDiv").html("We're Sorry. The Movie Database does not have enough information on this movie.<br>Try to search for a similar movie title.");
    $("#bookResults").hide();
  } //end of if undefined movie genre

  //if movie genre is defined
  else {

    // match genreToSearch (movie) TO bookSubject 
    switch (genreToSearch) {
      case "Action":
        bookSubject = "action";
          break;
      case "Adventure":
        bookSubject = "adventure";
          break;
      case "Animation":
        bookSubject = "graphic novel";
          break;
      case "Comedy":
        bookSubject = "humor";
          break;
      case "Crime":
        bookSubject = "crime";
          break;
      case "Documentary":
        bookSubject = "history||biography";
          break;
      case "Drama":
        bookSubject = "death";
          break;
      case "Family":
        bookSubject = "animals";
          break;
      case "Fantasy":
        bookSubject = "fantasy";
          break;
      case "History":
        bookSubject = "history";
          break;
      case "Horror":
        bookSubject = "horror";
          break;
      case "Music":
        bookSubject = "music";
          break;
      case "Mystery":
        bookSubject = "mystery";
          break;
      case "Romance":
        bookSubject = "romance";
          break;
      case "Science Fiction":
        bookSubject = "science fiction";
          break;
      case "TV Movie":
        bookSubject = "emotions";
          break;
      case "Thriller":
        bookSubject = "thriller";
          break;
      case "War":
        bookSubject = "war||fiction";
          break;
      case "Western":
        bookSubject = "western";
          break;
      default:
        bookSubject.toLowerCase() = genreChosen;
    } //end of movie to book switch statements

  // Sets search URL for Google Books AJAX call
    var queryURL = "https://www.googleapis.com/books/v1/volumes?q=subject:" + bookSubject + "&printType=books&langRestrict=en&maxResults=40&key=AIzaSyDLWrPgW350LzRa-B-z83xg5uKzAjROB1I";

    // Creates an AJAX call for the specific movie clicked
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {

  //create array to store random indexes (of book results) already used to avoid repeats
  //start with an empty array each time an ajax call is made
      var indexUsed = [];

      for (var i =1; i <= 10; i++) {

        var randomIndex = Math.floor(Math.random() * response.items.length);

        //if randomIndex has not already been used do this
        if (indexUsed.indexOf(randomIndex) === -1 && response.items[randomIndex] !== undefined) {
          indexUsed.push(randomIndex);
        } // end of if new random index

        //else - if randomIndex has been used, get a new random index
        else {
          // keep getting randomIndex until it is not a match
          while (indexUsed.indexOf(randomIndex) !== -1){
            randomIndex = Math.floor(Math.random() * response.items.length);
          } // end of while randomIndex has already been used

        } // end of else randomIndex has been used  
        
        // Display each book returned by for loop (10 total) in the HTML
        var bookDisplayed = $("<img>")
          .attr("data-toggle" , "modal")
          .attr("data-target" , "#moreInfo" + (i))
          .attr("src", response.items[randomIndex].volumeInfo.imageLinks.thumbnail)
          .attr("alt:" ,response.items[randomIndex].volumeInfo.title)
          .addClass("img-thumbnail");
        var bookDisplayedTitle = $("<h5>")
          .html(response.items[randomIndex].volumeInfo.title);
       
        // Get year out of published date
        var pubDateString = response.items[randomIndex].volumeInfo.publishedDate;
        var yearOnly = pubDateString.slice(0,4);
        var bookDisplayedYear = $("<p>")
          .html(yearOnly);
        
        $("#book" + (i)).append(bookDisplayed);
        $("#book" + (i)).append(bookDisplayedTitle);
        $("#book" + (i)).append(bookDisplayedYear);

        $("#modal" + (i) + "Title").html(response.items[randomIndex].volumeInfo.title);
        $("#book" + (i) + "Year").html(yearOnly);
        $("#book" + (i) + "Author").html(response.items[randomIndex].volumeInfo.authors);
        $("#book" + (i) + "Info").html(response.items[randomIndex].volumeInfo.description);
        $("#book" + (i) + "PageCount").html(response.items[randomIndex].volumeInfo.pageCount);
        $("#book" + (i) + "PreviewLink").attr("href", response.items[randomIndex].volumeInfo.previewLink);

        };// close for loop which populates books

    }); // close ajax call to google books

    // Clear book result book divs (x10)
    for (var i = 1; i <= 10; i++) {
      $("#book" + (i)).empty(); 
    }; // close for loop which clears book results book divs
    
    // Show bookResults div
    $("#bookResults").show();

    // Change recent search text for only most recent result
    $("#recent-search-text").text("Most Recent Movie Searched");
    // Empty most recent posters div to show only most recent result
    $("#most-recent-posters").empty();

    // Push movie-chosen information to Firebase
    database.ref().push({
      movieChosenPoster: moviePickedPosterPath,
      // This is likely superfluous due to orderByKey option in Firebase that does the same thing.
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

  } // end of else - if genre of movie is defined + this also keep undefined genres from being pushed to firebase

} // close bookCall function

//---------------------------------------------------------------------------
// FUNCTION CALLS!

// Start everything with onPageLoad function
onPageLoad();


