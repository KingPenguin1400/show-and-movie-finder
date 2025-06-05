const TMDB_API_KEY = '1e6c49b4cc57e66a33167920ed6ce4cb'; // Replace with your API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function findShows() {
    const selectedGenres = Array.from(document.querySelectorAll('.genre-btn.selected'))
        .map(button => button.textContent);
    
    if (selectedGenres.length === 0) {
        alert('Please select at least one genre!');
        return;
    }

    try {
        // First, get the genre IDs for the selected genres
        const genreResponse = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`);
        const genreData = await genreResponse.json();
        
        const selectedGenreIds = selectedGenres.map(genre => {
            const foundGenre = genreData.genres.find(g => g.name.toLowerCase() === genre.toLowerCase());
            return foundGenre ? foundGenre.id : null;
        }).filter(id => id !== null);

        if (selectedGenreIds.length === 0) {
            alert('No matching genres found in the database.');
            return;
        }

        // Get TV shows with the selected genres
        const showsResponse = await fetch(
            `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${selectedGenreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=1000`
        );
        const showsData = await showsResponse.json();

        // Display results
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (showsData.results.length === 0) {
            resultsDiv.innerHTML = '<p>No shows found matching your selected genres. Try different combinations!</p>';
            return;
        }

        showsData.results.forEach(show => {
            const showElement = document.createElement('div');
            showElement.className = 'result-item';
            showElement.innerHTML = `
                <h3>${show.name}</h3>
                <p>First Air Date: ${show.first_air_date}</p>
                <p>Rating: ${(show.vote_average / 2).toFixed(1)}/5</p>
                <p>Overview: ${show.overview}</p>
                ${show.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name} poster">` : ''}
            `;
            resultsDiv.appendChild(showElement);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again later.');
    }
}

function toggleGenre(button) {
    button.classList.toggle('selected');
} 