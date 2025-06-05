// Sample movie database
/*const movies = [
    { title: "The Shawshank Redemption", genres: ["Drama"], rating: 9.3 },
    { title: "The Godfather", genres: ["Crime", "Drama"], rating: 9.2 },
    { title: "The Dark Knight", genres: ["Action", "Crime", "Drama", "Thriller"], rating: 9.0 },
    { title: "Pulp Fiction", genres: ["Crime", "Drama"], rating: 8.9 },
    { title: "Inception", genres: ["Action", "Adventure", "Sci-Fi", "Thriller"], rating: 8.8 },
    { title: "The Matrix", genres: ["Action", "Sci-Fi"], rating: 8.7 },
    { title: "Forrest Gump", genres: ["Drama", "Romance"], rating: 8.8 },
    { title: "The Silence of the Lambs", genres: ["Crime", "Drama", "Thriller", "Horror"], rating: 8.6 },
    { title: "Interstellar", genres: ["Adventure", "Drama", "Sci-Fi"], rating: 8.6 },
    { title: "The Lord of the Rings", genres: ["Action", "Adventure", "Drama", "Fantasy"], rating: 8.8 }
];*/

const TMDB_API_KEY = '1e6c49b4cc57e66a33167920ed6ce4cb';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Cache for genre data
let genreCache = null;
let currentPage = 1;
let currentSearchType = null;
let currentSearchParams = null;

async function getGenres() {
    if (genreCache) return genreCache;
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        genreCache = data.genres;
        return genreCache;
    } catch (error) {
        console.error('Error fetching genres:', error);
        throw error;
    }
}

async function searchSimilarMovies() {
    const searchInput = document.getElementById('movieSearch');
    const movieTitle = searchInput.value.trim();
    
    if (!movieTitle) {
        alert('Please enter a movie title');
        return;
    }

    currentPage = 1;
    currentSearchType = 'similar';
    
    try {
        // First, search for the movie to get its ID
        const searchResponse = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}&page=1`
        );
        const searchData = await searchResponse.json();
        
        if (searchData.results.length === 0) {
            document.getElementById('results').innerHTML = '<p>No movies found matching your search. Please try a different title.</p>';
            return;
        }

        // Get the first movie's ID
        const movieId = searchData.results[0].id;
        currentSearchParams = { movieId };
        
        // Get similar movies
        const similarResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&page=${currentPage}`
        );
        const similarData = await similarResponse.json();
        
        displayMovies(similarData.results);
        updateLoadMoreButton(similarData);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
    }
}

async function findMovies() {
    const selectedGenres = Array.from(document.querySelectorAll('.genre-btn.selected'))
        .map(button => button.textContent);
    
    if (selectedGenres.length === 0) {
        document.getElementById('results').innerHTML = '<p>Please select at least one genre!</p>';
        return;
    }

    currentPage = 1;
    currentSearchType = 'genres';
    
    try {
        const genres = await getGenres();
        
        const selectedGenreIds = selectedGenres.map(genre => {
            const foundGenre = genres.find(g => g.name.toLowerCase() === genre.toLowerCase());
            if (!foundGenre) {
                console.warn(`Genre not found: ${genre}`);
            }
            return foundGenre ? foundGenre.id : null;
        }).filter(id => id !== null);

        if (selectedGenreIds.length === 0) {
            document.getElementById('results').innerHTML = '<p>No matching genres found in the database. Please try different genres.</p>';
            return;
        }

        currentSearchParams = { genreIds: selectedGenreIds };
        
        const moviesResponse = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&page=${currentPage}`
        );
        
        if (!moviesResponse.ok) {
            throw new Error(`HTTP error! status: ${moviesResponse.status}`);
        }
        
        const moviesData = await moviesResponse.json();
        displayMovies(moviesData.results);
        updateLoadMoreButton(moviesData);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
    }
}

async function loadMoreMovies() {
    if (!currentSearchType || !currentSearchParams) return;
    
    currentPage++;
    const resultsDiv = document.getElementById('results');
    
    try {
        let response;
        if (currentSearchType === 'similar') {
            response = await fetch(
                `${TMDB_BASE_URL}/movie/${currentSearchParams.movieId}/similar?api_key=${TMDB_API_KEY}&page=${currentPage}`
            );
        } else {
            response = await fetch(
                `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${currentSearchParams.genreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&page=${currentPage}`
            );
        }
        
        const data = await response.json();
        displayMovies(data.results, true);
        updateLoadMoreButton(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading more movies. Please try again.');
    }
}

function displayMovies(movies, append = false) {
    const resultsDiv = document.getElementById('results');
    if (!append) {
        resultsDiv.innerHTML = '';
    }

    if (movies.length === 0) {
        if (!append) {
            resultsDiv.innerHTML = '<p>No movies found. Try different criteria!</p>';
        }
        return;
    }

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'result-item';
        movieElement.innerHTML = `
            <div class="movie-content">
                <h3>${movie.title}</h3>
                <p>Release Date: ${movie.release_date || 'Unknown'}</p>
                <p>Rating: ${(movie.vote_average / 2).toFixed(1)}/5</p>
                <p>Overview: ${movie.overview || 'No overview available.'}</p>
            </div>
            ${movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title} poster">` : ''}
        `;
        resultsDiv.appendChild(movieElement);
    });
}

function updateLoadMoreButton(data) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.style.display = data.page < data.total_pages ? 'block' : 'none';
}

function toggleGenre(button) {
    button.classList.toggle('selected');
} 