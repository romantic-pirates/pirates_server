document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const recommendationContainer = document.getElementById('recommendation-container');
    const errorContainer = document.getElementById('error');
    const trailerPopup = document.getElementById('trailerPopup');
    const trailerIframe = document.getElementById('trailerVideo');

    const state = {
        mediaType: '',
        genres: [],
        director: '',
        actor: '',
        minRuntime: '',
        maxRuntime: '',
        network: '',
        releaseYear: '',
        status: '', 
        recommendation: [],
        sortBy: 'rating' // Default sorting
    };

    const populateFormFields = () => {
        document.getElementById('mediaType').value = state.mediaType;
        document.getElementById('genres').value = state.genres.join(', ');
        document.getElementById('director').value = state.director;
        document.getElementById('actor').value = state.actor;
        document.getElementById('minRuntime').value = state.minRuntime;
        document.getElementById('maxRuntime').value = state.maxRuntime;
        document.getElementById('network').value = state.network;
        document.getElementById('releaseYear').value = state.releaseYear;
        document.getElementById('status').value = state.status;
    };

    const renderForm = () => {
        const html = `
            <form id="searchForm">
                <label>
                    영화/TV:
                    <select id="mediaType">
                        <option value="">Select</option>
                        <option value="movie">영화</option>
                        <option value="tv">TV</option>
                    </select>
                </label>
                <br/>
                <div id="tvOptions" style="display: none;">
                    <label>
                        방송사:
                        <select id="network">
                            <option value="">Select</option>
                            <option value="tvN">tvN</option>
                            <option value="jtbc">JTBC</option>
                            <option value="kbs1">KBS1</option>
                            <option value="kbs2">KBS2</option>
                            <option value="mbc">MBC</option>
                            <option value="sbs">SBS</option>
                        </select>
                    </label>
                    <br/>
                    <label>
                        완결/방영중:
                        <select id="status">
                            <option value="">Select</option>
                            <option value="Ended">완결</option>
                            <option value="Returning Series">방영중</option>
                        </select>
                    </label>
                    <br/>
                </div>
                <label>
                    장르 (comma separated):
                    <input id="genres" type="text" placeholder="장르명">
                </label>
                <br/>
                <div id="movieOptions">
                    <label>
                        감독:
                        <input id="director" type="text" placeholder="감독명">
                    </label>
                    <br/>
                    <label>
                        최소 런타임:
                        <input id="minRuntime" type="number" placeholder="최소 런타임">
                    </label>
                    <br/>
                    <label>
                        최대 런타임:
                        <input id="maxRuntime" type="number" placeholder="최대 런타임">
                    </label>
                    <br/>
                    <label>
                        개봉년도:
                        <input id="releaseYear" type="number" placeholder="개봉년도">
                    </label>
                </div>
                <br/>
                <label>
                    출연진:
                    <input id="actor" type="text" placeholder="출연진명">
                </label>
                <br/>
                <button type="button" id="submitButton">추천</button>
                <button type="button" id="resetButton">리셋</button>
            </form>
        `;
        formContainer.innerHTML = html;

        // Populate form fields with current state values
        populateFormFields();

        document.getElementById('mediaType').addEventListener('change', (e) => {
            const mediaType = e.target.value;
            state.mediaType = mediaType;
            document.getElementById('tvOptions').style.display = mediaType === 'tv' ? 'block' : 'none';
            document.getElementById('movieOptions').style.display = mediaType === 'movie' ? 'block' : 'none';
        });

        document.getElementById('status').addEventListener('change', (e) => {
            state.status = e.target.value;
        });

        document.getElementById('submitButton').addEventListener('click', handleSubmit);
        document.getElementById('resetButton').addEventListener('click', handleReset);
        document.getElementById('sortRating').addEventListener('click', () => {
            state.sortBy = 'rating';
            handleSubmit();
        });
        document.getElementById('sortRandom').addEventListener('click', () => {
            state.sortBy = 'random';
            handleSubmit();
        });
    };

    const handleSubmit = async () => {
        state.genres = document.getElementById('genres').value.split(',').map(genre => genre.trim()).filter(genre => genre);
        state.mediaType = document.getElementById('mediaType').value;
        state.network = document.getElementById('network').value;
        state.director = document.getElementById('director').value;
        state.actor = document.getElementById('actor').value;
        state.minRuntime = document.getElementById('minRuntime').value;
        state.maxRuntime = document.getElementById('maxRuntime').value;
        state.releaseYear = document.getElementById('releaseYear').value;
        state.status = document.getElementById('status').value;

        const queryParams = new URLSearchParams();
        if (state.mediaType) queryParams.append('media_type', state.mediaType);
        if (state.genres.length > 0) state.genres.forEach(genre => queryParams.append('genres', genre));
        if (state.mediaType === 'movie' && state.director) queryParams.append('director', state.director);
        if (state.actor) queryParams.append('actor', state.actor);
        if (state.mediaType === 'movie' && state.minRuntime) queryParams.append('min_runtime', state.minRuntime);
        if (state.mediaType === 'movie' && state.maxRuntime) queryParams.append('max_runtime', state.maxRuntime);
        if (state.mediaType === 'movie' && state.releaseYear) queryParams.append('release_year', state.releaseYear);
        if (state.network) queryParams.append('network', state.network);
        if (state.mediaType === 'tv' && state.status) queryParams.append('status', state.status);
        queryParams.append('sort_by', state.sortBy);

        console.log(`Query params: ${queryParams.toString()}`);

        try {
            const response = await fetch(`http://localhost:5000/recommend?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok) {
                state.recommendation = data;
                renderRecommendations();
            } else {
                errorContainer.innerText = data.message || 'An error occurred.';
            }
        } catch (error) {
            console.error(error);
            errorContainer.innerText = 'Failed to fetch recommendations.';
        }
    };

    const handleReset = () => {
        state.mediaType = '';
        state.genres = [];
        state.director = '';
        state.actor = '';
        state.minRuntime = '';
        state.maxRuntime = '';
        state.network = '';
        state.releaseYear = '';
        state.status = ''; // Status 초기화
        state.recommendation = [];
        state.sortBy = 'rating'; // Reset sort by to default
        renderForm();
        recommendationContainer.innerHTML = '';
        errorContainer.innerText = '';
    };

    const renderRecommendations = () => {
        recommendationContainer.innerHTML = '';
    
        if (state.recommendation.length === 0) {
            recommendationContainer.innerHTML = '<p>No recommendations available.</p>';
            return;
        }
    
        if (state.sortBy === 'random') {
            // Shuffle recommendations for random display
            state.recommendation = shuffleArray(state.recommendation);
        }
    
        state.recommendation.forEach((rec, index) => {
            const title = rec.fields?.title || rec.fields?.name || rec.name;
            const posterPath = rec.fields?.poster_path || rec.poster_path;
            const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';
            const releaseDate = rec.fields?.release_date || rec.fields?.first_air_date || rec.first_air_date;
            const status = rec.fields?.status || rec.status || 'N/A'; // 상태 표시
    
            if (index === 0) {
                // Main recommendation
                const overview = rec.fields?.overview || rec.overview || 'N/A';
                const genres = rec.fields?.genres?.join(', ') || rec.genres?.join(', ') || 'N/A';
                const directorOrNetwork = rec.fields?.directors?.join(', ') || (rec.networks?.join(', ') || 'N/A');
                const cast = rec.fields?.cast?.map(c => c.name).join(', ') || (rec.cast?.map(c => c.name).join(', ') || 'N/A');
                const popularity = rec.fields?.popularity || rec.popularity || 'N/A';
                const averageVote = rec.fields?.vote_avg || rec.vote_avg || 'N/A';
    
                recommendationContainer.innerHTML += `
                    <div class="main-recommendation">
                        <h2>Recommended ${state.mediaType === 'movie' ? 'Movie' : 'TV Show'}:</h2>
                        <img src="${posterUrl}" alt="${title}" class="poster" data-trailers='${JSON.stringify(rec.trailers || [])}' />
                        <h3>${title}</h3>
                        <p><strong>개봉일:</strong> ${releaseDate || 'N/A'}</p>
                        <p><strong>줄거리:</strong> ${overview}</p>
                        <p><strong>장르:</strong> ${genres}</p>
                        <p><strong>${state.mediaType === 'movie' ? '감독' : '방송사'}:</strong> ${directorOrNetwork}</p>
                        <p><strong>출연진:</strong> ${cast}</p>
                        <p><strong>인기도:</strong> ${popularity}</p>
                        <p><strong>평점:</strong> ${averageVote}</p>
                        ${state.mediaType === 'tv' ? `<p><strong>Status:</strong> ${status}</p>` : ''}
                    </div>
                `;
            } else {
                // Secondary recommendations
                recommendationContainer.innerHTML += `
                    <div class="secondary-item">
                        <img src="${posterUrl}" alt="${title}" class="poster"  data-trailers='${JSON.stringify(rec.trailers || [])}' />
                        <h3>${title}</h3>
                        <p><strong>Release Date:</strong> ${releaseDate || 'N/A'}</p>
                        ${state.mediaType === 'tv' ? `<p><strong>Status:</strong> ${status}</p>` : ''}
                    </div>
                `;
            }
        });
    
        // Add event listeners for trailer click
        document.querySelectorAll('.poster').forEach(poster => {
            poster.addEventListener('click', (event) => {
                const trailers = JSON.parse(event.target.getAttribute('data-trailers'));
                if (trailers.length > 0) {
                    showTrailer(trailers[0]);
                }
            });
        });
    };
    
    

    const showTrailer = (videoKey) => {
        trailerIframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
        trailerPopup.style.display = 'block';
    };

    const closeTrailerButton = document.getElementById('closeTrailer');
    closeTrailerButton.addEventListener('click', () => {
        trailerIframe.src = ''; // Stop the video playback
        trailerPopup.style.display = 'none';
    });

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderForm();
});