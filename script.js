document.addEventListener("DOMContentLoaded", function() {
    const API_KEY = '718e3dfc3b3d5c3de1d5244ba50a0016';
    const FORM_ID = '241862001035443';
    const API_URL_JOTFORM = `https://api.jotform.com/form/${FORM_ID}/submissions?apiKey=${API_KEY}`;

    const API_KEY_TMDB = 'b239c0483d45a615d5ce3ddf6b998bec';
    const API_URL_TMDB = 'https://api.themoviedb.org/3/search/movie';
    const IMAGE_URL = 'https://image.tmdb.org/t/p/w92';

    const nameForm = document.getElementById("name-form");
    const movieForm = document.getElementById("movie-form");
    const nameInput = document.getElementById("name-input");
    const suggestionInput = document.getElementById("suggestion-input");
    const suggestionsDiv = document.getElementById("suggestions");
    const movieListDiv = document.getElementById("movie-list");
    const clearBtn = document.getElementById("clear-btn");
    const suggestBtn = document.getElementById("suggest-btn");
    const confirmationMessage = document.getElementById("confirmation-message");

    let userName = "";
    let movieList = [];
    let hasSuggested = false;  // Track whether the user has made a suggestion

    // Handle name submission
    nameForm.addEventListener("submit", function(event) {
        event.preventDefault();
        userName = nameInput.value.trim();
        if (userName === "") {
            alert("Please enter your name.");
            return;
        }
        nameForm.style.display = "none";
    });

    // Fetch movie suggestions based on user input
    suggestionInput.addEventListener("input", function() {
        const query = suggestionInput.value.trim();
        if (query !== "") {
            fetchMovies(query);
        } else {
            suggestionsDiv.innerHTML = "";
        }
    });

    // Handle movie suggestion form submission
    movieForm.addEventListener("submit", function(event) {
        event.preventDefault();
        if (userName === "") {
            alert("Please enter your name first.");
            return;
        }
        const movieTitle = suggestionInput.value.trim();
        if (movieTitle !== "") {
            addMovieToList(userName, movieTitle);
            suggestionInput.value = "";
            suggestionsDiv.innerHTML = "";
            clearBtn.style.display = "inline-block"; // Show the clear button
        }
    });

    // Clear the suggestion input and suggestions list
    clearBtn.addEventListener("click", function() {
        suggestionInput.value = "";
        suggestionsDiv.innerHTML = "";
        movieListDiv.innerHTML = "";  // Clear the movie list
        movieList = [];  // Reset the movie list
        suggestBtn.style.display = "none";  // Hide the suggest button
        clearBtn.style.display = "none";  // Hide the clear button
        hasSuggested = false;  // Reset suggestion status
        confirmationMessage.textContent = "";  // Clear the confirmation message
    });

    // Handle the suggest button click event
    suggestBtn.addEventListener("click", function() {
        if (hasSuggested) {
            alert("You have already suggested movies. You can only suggest once. Please refresh to suggest more movies.");
            return;
        }
        if (movieList.length === 0) {
            alert("No movies to suggest.");
            return;
        }
        addMoviesToJotForm(userName, movieList);
    });

    // Fetch movies from the TMDb API
    function fetchMovies(query) {
        fetch(`${API_URL_TMDB}?api_key=${API_KEY_TMDB}&query=${query}`)
            .then(response => response.json())
            .then(data => {
                suggestionsDiv.innerHTML = "";
                data.results.forEach(movie => {
                    const movieDiv = document.createElement('div');
                    movieDiv.innerHTML = `
                        <span>${movie.title}</span>
                    `;
                    movieDiv.addEventListener('click', () => {
                        suggestionInput.value = movie.title;
                        suggestionsDiv.innerHTML = "";
                    });
                    suggestionsDiv.appendChild(movieDiv);
                });
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    // Add a movie to the movie list
    function addMovieToList(userName, movieTitle) {
        fetch(`${API_URL_TMDB}?api_key=${API_KEY_TMDB}&query=${movieTitle}`)
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    const movie = data.results[0];
                    const movieDiv = document.createElement('div');
                    movieDiv.innerHTML = `
                        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
                        <span>${movie.title}</span>
                        <button class="remove-btn">Remove</button>
                    `;
                    movieDiv.querySelector('.remove-btn').addEventListener('click', () => {
                        movieList = movieList.filter(item => item.title !== movie.title);
                        movieDiv.remove();
                        if (movieList.length === 0) {
                            clearBtn.style.display = "none";
                        }
                    });
                    movieListDiv.appendChild(movieDiv);
                    movieList.push({ title: movie.title, poster: movie.poster_path });

                    // Show the suggest button
                    suggestBtn.style.display = "inline-block";
                } else {
                    alert("Movie not found.");
                }
            })
            .catch(error => console.error('Error fetching movie details:', error));
    }

    // Add the movies and user name to JotForm
    function addMoviesToJotForm(userName, movieList) {
        const movies = movieList.map(movie => movie.title).join(", ");
        const submissionData = {
            "submission[21]": userName,  // Field ID for "Suggested by"
            "submission[22]": movies  // Field ID for "Movies Suggested"
        };

        fetch(API_URL_JOTFORM, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(submissionData).toString()
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Movies added to JotForm:', data);  // Debugging line
            confirmationMessage.className = 'message success-message';
            confirmationMessage.textContent = "Thank you for your suggestion!";
            movieListDiv.innerHTML = "";
            movieList = [];
            suggestBtn.style.display = "none";
            clearBtn.style.display = "none";
            hasSuggested = true;  // Mark as suggested
        })
        .catch(error => {
            console.error('Error adding movies to JotForm:', error);
            confirmationMessage.className = 'message error-message';
            confirmationMessage.textContent = "Failed to save your suggestions. Please try again.";
        });
    }
});
