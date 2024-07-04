document.addEventListener('DOMContentLoaded', () => {
    const nameForm = document.getElementById('name-form');
    const nameInput = document.getElementById('name-input');
    const movieForm = document.getElementById('movie-form');
    const suggestionInput = document.getElementById('suggestion-input');
    const suggestions = document.getElementById('suggestions');
    const movieList = document.getElementById('movie-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const suggestBtn = document.getElementById('suggest-btn');

    // API Key for TMDb (replace with your own)
    const apiKey = 'b239c0483d45a615d5ce3ddf6b998bec';
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    let allMovies = [];

    // Check if name is stored in local storage
    if (localStorage.getItem('userName')) {
        nameInput.value = localStorage.getItem('userName');
    }

    // Handle name form submission
    nameForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userName = nameInput.value.trim();
        if (userName) {
            localStorage.setItem('userName', userName);
            nameForm.style.display = 'none';
            movieForm.style.display = 'flex';
        }
    });

    // Fetch movie suggestions
    suggestionInput.addEventListener('input', () => {
        const query = suggestionInput.value;
        if (query.length > 2) {
            fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`)
                .then(response => response.json())
                .then(data => {
                    suggestions.innerHTML = '';
                    data.results.forEach(movie => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.textContent = movie.title;
                        suggestionItem.addEventListener('click', () => {
                            suggestionInput.value = movie.title;
                            suggestions.innerHTML = '';
                        });
                        suggestions.appendChild(suggestionItem);
                    });
                });
        } else {
            suggestions.innerHTML = '';
        }
    });

    // Handle movie form submission
    movieForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userName = localStorage.getItem('userName');
        const movieName = suggestionInput.value.trim();
        if (userName && movieName) {
            fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movieName}`)
                .then(response => response.json())
                .then(data => {
                    const movie = data.results[0];
                    const movieDetails = {
                        name: movie.title,
                        poster_path: movie.poster_path,
                        nation: 'USA', // Placeholder nation, you might need to fetch this data separately
                        category: 'Action', // Placeholder category, you might need to fetch this data separately
                    };
                    addMovieToList(movieDetails);
                    saveMovieToLocalStorage(movieDetails);
                    suggestionInput.value = '';
                });
        }
    });

    // Add movie to list
    const addMovieToList = (movie) => {
        allMovies.push(movie);
        displayMovies('all');
    };

    // Save movie to local storage
    const saveMovieToLocalStorage = (movie) => {
        const movies = JSON.parse(localStorage.getItem('movies')) || [];
        movies.push(movie);
        localStorage.setItem('movies', JSON.stringify(movies));
    };

    // Display movies based on filter
    const displayMovies = (filter) => {
        movieList.innerHTML = '';
        let filteredMovies = allMovies;

        if (filter === 'nation') {
            filteredMovies = allMovies.filter(movie => movie.nation === 'USA');
        } else if (filter === 'category') {
            filteredMovies = allMovies.filter(movie => movie.category === 'Action');
        }

        filteredMovies.forEach(movie => {
            const movieItem = document.createElement('div');
            const posterImg = document.createElement('img');
            const movieTitle = document.createElement('span');
            const removeBtn = document.createElement('button');

            posterImg.src = `${imageBaseUrl}${movie.poster_path}`;
            movieTitle.textContent = movie.name;
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('remove-btn');
            removeBtn.addEventListener('click', () => {
                removeMovieFromList(movie.name);
                removeMovieFromLocalStorage(movie.name);
            });

            movieItem.appendChild(posterImg);
            movieItem.appendChild(movieTitle);
            movieItem.appendChild(removeBtn);
            movieList.appendChild(movieItem);
        });
    };

    // Remove movie from list
    const removeMovieFromList = (movieName) => {
        allMovies = allMovies.filter(movie => movie.name !== movieName);
        displayMovies('all');
    };

    // Remove movie from local storage
    const removeMovieFromLocalStorage = (movieName) => {
        let movies = JSON.parse(localStorage.getItem('movies')) || [];
        movies = movies.filter(movie => movie.name !== movieName);
        localStorage.setItem('movies', JSON.stringify(movies));
    };

    // Load movies from local storage
    const loadMoviesFromLocalStorage = () => {
        const movies = JSON.parse(localStorage.getItem('movies')) || [];
        movies.forEach(movie => addMovieToList(movie));
    };

    // Filter movies based on button click
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const filter = event.target.getAttribute('data-filter');
            displayMovies(filter);
        });
    });

    // Initial load of movies
    loadMoviesFromLocalStorage();

    // Check if name is already saved
    if (localStorage.getItem('userName')) {
        nameForm.style.display = 'none';
        movieForm.style.display = 'flex';
    }
});
