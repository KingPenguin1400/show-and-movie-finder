const TMDB_API_KEY = '1e6c49b4cc57e66a33167920ed6ce4cb'; // Replace with your API key

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Cache for genre data
let genreCache = null;
let currentPage = 1;
let currentSearchType = null;
let currentSearchParams = null;

async function getGenres() {
    if (genreCache) return genreCache;
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        genreCache = data.genres;
        return genreCache;
    } catch (error) {
        console.error('Error fetching genres:', error);
        throw error;
    }
}

async function searchSimilarShows() {
    const searchInput = document.getElementById('showSearch');
    const showTitle = searchInput.value.trim();
    if (!showTitle) {
        alert('Please enter a show title');
        return;
    }
    currentPage = 1;
    currentSearchType = 'similar';
    try {
        // First, search for the show to get its ID
        const searchResponse = await fetch(
            `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(showTitle)}&page=1`
        );
        const searchData = await searchResponse.json();
        if (searchData.results.length === 0) {
            document.getElementById('results').innerHTML = '<p>No shows found matching your search. Please try a different title.</p>';
            updateLoadMoreButton({ page: 1, total_pages: 1 });
            return;
        }
        // Get the first show's ID
        const showId = searchData.results[0].id;
        currentSearchParams = { showId };
        // Get similar shows
        const similarResponse = await fetch(
            `${TMDB_BASE_URL}/tv/${showId}/similar?api_key=${TMDB_API_KEY}&page=${currentPage}`
        );
        const similarData = await similarResponse.json();
        displayShows(similarData.results);
        updateLoadMoreButton(similarData);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
        updateLoadMoreButton({ page: 1, total_pages: 1 });
    }
}

async function findShows() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Loading...</p>';

    const selectedGenres = Array.from(document.querySelectorAll('.genre-btn.selected'))
        .map(button => button.textContent);
    
    if (selectedGenres.length === 0) {
        resultsDiv.innerHTML = '<p>Please select at least one genre!</p>';
        updateLoadMoreButton({ page: 1, total_pages: 1 });
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
            resultsDiv.innerHTML = '<p>No matching genres found in the database. Please try different genres.</p>';
            updateLoadMoreButton({ page: 1, total_pages: 1 });
            return;
        }

        currentSearchParams = { genreIds: selectedGenreIds };
        const showsResponse = await fetch(
            `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${selectedGenreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&page=${currentPage}`
        );
        
        if (!showsResponse.ok) {
            throw new Error(`HTTP error! status: ${showsResponse.status}`);
        }
        
        const showsData = await showsResponse.json();

        displayShows(showsData.results);
        updateLoadMoreButton(showsData);
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
        updateLoadMoreButton({ page: 1, total_pages: 1 });
    }
}

async function loadMoreShows() {
    if (!currentSearchType || !currentSearchParams) return;
    currentPage++;
    try {
        let response;
        if (currentSearchType === 'similar') {
            response = await fetch(
                `${TMDB_BASE_URL}/tv/${currentSearchParams.showId}/similar?api_key=${TMDB_API_KEY}&page=${currentPage}`
            );
        } else {
            response = await fetch(
                `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${currentSearchParams.genreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&page=${currentPage}`
            );
        }
        const data = await response.json();
        displayShows(data.results, true);
        updateLoadMoreButton(data);
    } catch (error) {
        console.error('Error loading more shows:', error);
        alert('Error loading more shows. Please try again.');
    }
}

async function displayShows(shows, append = false) {
    const resultsDiv = document.getElementById('results');
    if (!append) {
        resultsDiv.innerHTML = '';
    }
    if (!shows || shows.length === 0) {
        if (!append) {
            resultsDiv.innerHTML = '<p>No shows found. Try different criteria!</p>';
        }
        return;
    }
    for (const show of shows) {
        let ageRating = 'Unknown';
        try {
            const detailsResponse = await fetch(`${TMDB_BASE_URL}/tv/${show.id}/content_ratings?api_key=${TMDB_API_KEY}`);
            const detailsData = await detailsResponse.json();
            const usRating = detailsData.results.find(r => r.iso_3166_1 === 'US');
            if (usRating) {
                ageRating = usRating.rating;
            }
        } catch (error) {
            console.error('Error fetching show details:', error);
        }
        const showElement = document.createElement('div');
        showElement.className = 'result-item';
        showElement.innerHTML = `
            <div class="show-content">
                <h3>${show.name}</h3>
                <p>First Air Date: ${show.first_air_date || 'Unknown'}</p>
                <p>Rating: ${(show.vote_average / 2).toFixed(1)}/5</p>
                <p>Age Rating: ${ageRating}</p>
                <p>Overview: ${show.overview || 'No overview available.'}</p>
            </div>
            ${show.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name} poster">` : ''}
        `;
        resultsDiv.appendChild(showElement);
    }
}

function updateLoadMoreButton(data) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.style.display = data.page < data.total_pages ? 'block' : 'none';
}

function toggleGenre(button) {
    button.classList.toggle('selected');
} 