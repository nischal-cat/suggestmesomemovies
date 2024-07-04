document.addEventListener("DOMContentLoaded", function() {
    const API_KEY = 'b239c0483d45a615d5ce3ddf6b998bec';
    const API_URL = 'https://api.themoviedb.org/3/search/movie';
    const IMAGE_URL = 'https://image.tmdb.org/t/p/w92';
    const EMAILJS_SERVICE_ID = 'service_igtd8xy';
    const EMAILJS_TEMPLATE_ID = 'template_5hjzjfl';  // Replace with your actual template ID
    const EMAILJS_PUBLIC_KEY = 'zKm-qn2VvBxWu3vfG'; // Replace with your actual public key

    const nameForm = document.getElementById("name-form");
    const movieForm = document.getElementById("movie-form");
    const nameInput = document.getElementById("name-input");
    const suggestionInput = document.getElementById("suggestion-input");
    const suggestionsDiv = document.getElementById("suggestions");
    const movieListDiv = document.getElementById("movie-list");
    const clearBtn = document.getElementById("clear-btn");
    const suggestBtn = document.getElementById("suggest-btn");

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
    });

    // Handle the suggest button click event
    suggestBtn.addEventListener("click", function() {
        if (hasSuggested) {
            alert("You have already suggested movies. You can only suggest once.");
            return;
        }
        if (movieList.length === 0) {
            alert("No movies to suggest.");
            return;
        }
        sendEmailJS(userName, movieList);
    });
// Fetch movies from the TMDb API
function fetchMovies(query) {
    fetch(`${API_URL}?api_key=${API_KEY}&query=${query}`)
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
        fetch(`${API_URL}?api_key=${API_KEY}&query=${movieTitle}`)
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    const movie = data.results[0];
                    const movieDiv = document.createElement('div');
                    movieDiv.innerHTML = `
                        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
                        <span>${movie.title}</span>
                        <button class="remove-btn">remove</button>
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

    // Send the movie suggestions via EmailJS
    function sendEmailJS(userName, movieList) {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name: userName,
            to_email: 'surrealnischal@gmail.com',
            subject: 'Movie Suggestions',
            message: `User: ${userName}\nSuggested Movies:\n${movieList.map(movie => movie.title).join("\n")}`
        }, EMAILJS_PUBLIC_KEY)
        .then(response => {
            console.log('Email sent!', response);
            alert('Your movie suggestions have been sent!');
            movieListDiv.innerHTML = "";
            movieList = [];
            suggestBtn.style.display = "none";
            clearBtn.style.display = "none";
            hasSuggested = true;  // Mark as suggested
        })
        .catch(error => {
            console.error('Error sending email:', error);
            alert('Failed to send your suggestions. Please try again.');
        });
    }
});
