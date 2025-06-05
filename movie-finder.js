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

async function findMovies() {
    console.log('findMovies function called');
    const selectedGenres = Array.from(document.querySelectorAll('.genre-btn.selected'))
        .map(button => button.textContent);
    
    console.log('Selected genres:', selectedGenres);
    
    if (selectedGenres.length === 0) {
        alert('Please select at least one genre!');
        return;
    }

    try {
        console.log('Fetching genre list from TMDB...');
        // First, get the genre IDs for the selected genres
        const genreResponse = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
        const genreData = await genreResponse.json();
        console.log('Genre data received:', genreData);
        
        const selectedGenreIds = selectedGenres.map(genre => {
            const foundGenre = genreData.genres.find(g => g.name.toLowerCase() === genre.toLowerCase());
            return foundGenre ? foundGenre.id : null;
        }).filter(id => id !== null);

        console.log('Selected genre IDs:', selectedGenreIds);

        if (selectedGenreIds.length === 0) {
            alert('No matching genres found in the database.');
            return;
        }

        console.log('Fetching movies from TMDB...');
        // Get movies with the selected genres
        const moviesResponse = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=1000`
        );
        const moviesData = await moviesResponse.json();
        console.log('Movies data received:', moviesData);

        // Display results
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (moviesData.results.length === 0) {
            resultsDiv.innerHTML = '<p>No movies found matching your selected genres. Try different combinations!</p>';
            return;
        }

        moviesData.results.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.className = 'result-item';
            movieElement.innerHTML = `
                <h3>${movie.title}</h3>
                <p>Release Date: ${movie.release_date}</p>
                <p>Rating: ${(movie.vote_average / 2).toFixed(1)}/5</p>
                <p>Overview: ${movie.overview}</p>
                ${movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title} poster">` : ''}
            `;
            resultsDiv.appendChild(movieElement);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again later.');
    }
}

function toggleGenre(button) {
    console.log('Toggle genre clicked:', button.textContent);
    button.classList.toggle('selected');
    console.log('Button selected state:', button.classList.contains('selected'));
}

function findMovies() {
    const selectedGenres = Array.from(document.querySelectorAll('.genre-btn.selected'))
        .map(button => button.textContent);
    
    if (selectedGenres.length === 0) {
        alert('Please select at least one genre!');
        return;
    }

    // Filter movies based on selected genres
    const matchingMovies = movies.filter(movie => 
        selectedGenres.some(genre => movie.genres.includes(genre))
    );

    // Sort by rating
    matchingMovies.sort((a, b) => b.rating - a.rating);

    // Display results
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (matchingMovies.length === 0) {
        resultsDiv.innerHTML = '<p>No movies found matching your selected genres. Try different combinations!</p>';
        return;
    }

    matchingMovies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'result-item';
        movieElement.innerHTML = `
            <h3>${movie.title}</h3>
            <p>Genres: ${movie.genres.join(', ')}</p>
            <p>Rating: ${movie.rating}/10</p>
        `;
        resultsDiv.appendChild(movieElement);
    });
} 