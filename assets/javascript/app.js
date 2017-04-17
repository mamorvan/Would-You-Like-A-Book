//---------------------------------------------------------------------------
// VARIABLE DECLARATIONS!

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

  var data;
  var name;
  var genres;
  var name;
  var term;
  var posterPath;
  var bookSubject;
  var genreObj =[];
  var genreChosen;
  var genreToSearch;
  var releaseDate;
  var movies={}; 
  var finalGenre = [];
  var random;

//---------------------------------------------------------------------------
// FUNCTION DECLARATIONS!

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

// Handles movie searches/requests
function movieCall() {

  //CLEARS THE MOVIE OBJECT FOR NEW USE  
  movies={};

  //On search button click
  $("#submitMovie").on("click", function(event) {

		// Prevents default submit button action/prevents page load
		event.preventDefault();

		// Set variable term equal to search input
		term = $("#movieTitle").val().trim();

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

//Set AJAX variables
	var base = "https://api.themoviedb.org/3/";
	var search = "search/movie?query='" + term + "'&";
	var genre = "genre/movie/list?";
	var key = "api_key=b287a269fa3356a822e8c1b358a6f0fc";

	var searchURL = base + search + key;
	var genreURL = base + genre + key;

// CREATE AJAX CALL for genre map
	$.ajax({
		url: genreURL,
		method: "GET"
	}).done(function(response) {
		data = response;

// Creates an array from genre information
	for (i = 0; i < data.genres.length; i++) {
		var genreKey = data.genres[i].id
		var genreValue = data.genres[i].name
			genreObj[genreKey] = genreValue;
		}

// CREATE AJAX call for movie data
	$.ajax({
		url: searchURL,
		method: "GET"
	}).done(function(response) {
		data = response;

  // Clear movieResults div before generating new movie results
  $("#movieResults").empty();

  // If a movie selected doesn't return any results
  if (data.results.length === 0) {

    // Let user know to search for something else
    $("#movieChosenDiv").html("We're sorry. Your search did not return any results.<br>Check your spelling or try another movie title.")
    .css({"display": "block", "color": "white", "font-size": "120%", "border": "2px #FFFD8D solid"});
  } 

  // For all movie results from search
	for (i = 0; i < data.results.length; i++) {

    // Set name variable to movie title
		name = data.results[i].title;

		// Pulls only year from release date info (removes month and day)
		var yearOnly = data.results[i].release_date.slice(0,4);

    // Creates movie object from current results
		movies[name] ={
			"title": name, 
			"posterPath": "https://image.tmdb.org/t/p/w500" + data.results[i].poster_path, 
			"releaseDate": yearOnly
		};

    // Set genres variable to genre IDs
		genres = data.results[i].genre_ids; 
            
    //TRANSLATE GENRE ID'S
    for (var j = 0; j < genres.length; j++) { 
      genres[j] = genres[j].toString();
      finalGenre.push(genreObj[genres[j]]);             
    }
             
  //ADD GENRE NAMES TO MOVIE OBJECT  
  movies[name].genre = finalGenre;
            
  //clear the finalGenre, which is used in genre translation process
  finalGenre = [];

  // display all movies except those without a poster path
  if (!(movies[name].posterPath=="https://image.tmdb.org/t/p/w500null")) {
        var element2 = $("<div>").addClass("col-md-2 hovereffect");
        var element3 = $("<img>").attr({
          "class":"img-thumbnail", 
          "src": movies[name].posterPath,
          "alt":"book cover",
          "id": name
        }).css({"width":"90%"}).on("click", bookCall);
        var element4 = $("<p>").text(movies[name].title)
        .css("text-align", "center");
        var element5 = $("<p>").text(movies[name].releaseDate)
        .css("text-align", "center");
  
        $("#movieResults").append(element2);
        element2.append(element3);
        element2.append(element4);
        element2.append(element5);

      } //close the if-no-movie-poster display section

  } //close the for-i loop, which creates movie object and displays it.

}); //closes ajax movie call 

}); //closes ajax genre call
  
}); //closes submit button function event

}; //closes moviecall()

// Handles book searches/requests
function bookCall() {

  //GRAB THE MOVIE OBJECT CLICKED
  name = $(this).attr("id");

  //GRAB THE GENRES FROM THE MOVIE OBJECT
	genreChosen = movies[name].genre;

  //GRAB random GENRE from those listed
  random = Math.floor((Math.random() * genreChosen.length));
  genreToSearch = genreChosen[random];

  //DISPLAY NAME OF CLICKED MOVIE ON DISPLAY
	$("#movieChosenDiv").hide();
	$("#movieChosenDiv").html("<h2>Your movie is: <br><span id='movieChosen'>chosen movie title here</span></h2>");
	$("#movieChosenDiv").show();
  $("#movieChosen").html(movies[name].title)
  .css({"display": "block", "color": "white", "font-size": "150%"});

  //EMPTY MOVIE RESULTS IN ORDER TO DISPLAY bookResults div
   $("#movieResults").empty();

  // If movie genre is undefined   
  if (genreToSearch === undefined) {

    // Let user know to search for something else
    $("#movieChosenDiv").html("We're Sorry. The Movie Database does not have enough information on this movie.<br>Try to search for a similar movie title.")
    .css({"display": "block", "color": "white", "font-size": "120%", "border": "2px #FFFD8D solid"});
    $("#bookResults").hide();
    }

  //if movie genre is defined
   else {

    // TRANSLATE genreToSearch (movie) TO bookSubject 
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
  } // close for loop which clears book results book divs
  
  // Show bookResults div
  $("#bookResults").show();

  // Change recent search text for only most recent result
  $("#recent-search-text").text("Most Recent Movie Searched");
  // Empty most recent posters div to show only most recent result
  $("#most-recent-posters").empty();

  // Push movie-chosen information to Firebase
  database.ref().push({
    searchTerm: term,
    movieChosenTitle: movies[name].title,
    movieChosenYear: movies[name].releaseDate,
    movieChosenPoster: movies[name].posterPath,
    // This is likely superfluous due to orderByKey option in Firebase that does the same thing.
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });

} // end of else - if genre of movie is defined // this also keep undefined genres from being pushed to firebase

} // close bookCall()

//---------------------------------------------------------------------------
// FUNCTION CALLS!

// Start everything with onPageLoad function
onPageLoad();
