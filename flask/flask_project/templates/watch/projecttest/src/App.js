document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const recommendationContainer = document.getElementById('recommendation-container');
    const errorContainer = document.getElementById('error');

    const state = {
        mediaType: '',
        genres: [],
        director: '',
        actor: '',
        minRuntime: '',
        maxRuntime: '',
        network: '',
        releaseYear: '',
        recommendation: [],
    };

    const renderForm = () => {
        const html = `
            <form id="searchForm">
                <label>
                    Media Type:
                    <select id="mediaType">
                        <option value="">Select</option>
                        <option value="movie">Movie</option>
                        <option value="tv">TV Show</option>
                    </select>
                </label>
                <br/>
                <div id="tvOptions" style="display: none;">
                    <label>
                        Network:
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
                </div>
                <label>
                    Genres (comma separated):
                    <input id="genres" type="text" placeholder="Enter genres">
                </label>
                <br/>
                <div id="movieOptions">
                    <label>
                        Director:
                        <input id="director" type="text" placeholder="Enter director">
                    </label>
                    <br/>
                    <label>
                        Min Runtime:
                        <input id="minRuntime" type="number" placeholder="Enter min runtime">
                    </label>
                    <br/>
                    <label>
                        Max Runtime:
                        <input id="maxRuntime" type="number" placeholder="Enter max runtime">
                    </label>
                    <br/>
                    <label>
                        Release Year:
                        <input id="releaseYear" type="number" placeholder="Enter release year">
                    </label>
                </div>
                <br/>
                <label>
                    Actor:
                    <input id="actor" type="text" placeholder="Enter actor">
                </label>
                <br/>
                <button type="button" id="submitButton">Submit</button>
                <button type="button" id="resetButton">Reset</button>
            </form>
        `;
        formContainer.innerHTML = html;

        document.getElementById('mediaType').addEventListener('change', (e) => {
            const mediaType = e.target.value;
            state.mediaType = mediaType;
            document.getElementById('tvOptions').style.display = mediaType === 'tv' ? 'block' : 'none';
            document.getElementById('movieOptions').style.display = mediaType === 'movie' ? 'block' : 'none';
        });

        document.getElementById('submitButton').addEventListener('click', handleSubmit);
        document.getElementById('resetButton').addEventListener('click', handleReset);
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

        const queryParams = new URLSearchParams();
        if (state.mediaType) queryParams.append('media_type', state.mediaType);
        if (state.genres.length > 0) state.genres.forEach(genre => queryParams.append('genres', genre));
        if (state.mediaType === 'movie' && state.director) queryParams.append('director', state.director);
        if (state.actor) queryParams.append('actor', state.actor);
        if (state.mediaType === 'movie' && state.minRuntime) queryParams.append('min_runtime', state.minRuntime);
        if (state.mediaType === 'movie' && state.maxRuntime) queryParams.append('max_runtime', state.maxRuntime);
        if (state.mediaType === 'movie' && state.releaseYear) queryParams.append('release_year', state.releaseYear);
        if (state.network) queryParams.append('network', state.network);

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
        state.recommendation = [];
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
    
        const topRecommendation = state.recommendation[0];
        const topTitle = topRecommendation.fields?.title || topRecommendation.fields?.name || topRecommendation.name;
        const topReleaseDate = topRecommendation.fields?.release_date || topRecommendation.fields?.first_air_date || topRecommendation.first_air_date;
        const topPosterPath = topRecommendation.fields?.poster_path || topRecommendation.poster_path;
        const topPosterUrl = topPosterPath ? `https://image.tmdb.org/t/p/w500${topPosterPath}` : '';
        const topTrailerKey = topRecommendation.trailers?.length > 0 ? topRecommendation.trailers[0] : '';
    
        recommendationContainer.innerHTML += `
            <div class="main-recommendation">
                <h2>Recommended ${state.mediaType === 'movie' ? 'Movie' : 'TV Show'}:</h2>
                <img src="${topPosterUrl}" alt="${topTitle}" class="poster" data-trailers='${JSON.stringify(topRecommendation.trailers || [])}' />
                <h3>${topTitle}</h3>
                <p><strong>Release Date:</strong> ${topReleaseDate || 'N/A'}</p>
                <p><strong>Overview:</strong> ${topRecommendation.fields?.overview || topRecommendation.overview || 'N/A'}</p>
                <p><strong>Genres:</strong> ${topRecommendation.fields?.genres?.join(', ') || topRecommendation.genres?.join(', ') || 'N/A'}</p>
                <p><strong>${state.mediaType === 'movie' ? 'Director' : 'Network'}:</strong> ${topRecommendation.fields?.directors?.join(', ') || (topRecommendation.networks?.join(', ') || 'N/A')}</p>
                <p><strong>Cast:</strong> ${topRecommendation.fields?.cast?.map(c => c.name).join(', ') || (topRecommendation.cast?.map(c => c.name).join(', ') || 'N/A')}</p>
                <p><strong>Popularity:</strong> ${topRecommendation.fields?.popularity || topRecommendation.popularity || 'N/A'}</p>
                <p><strong>Average Vote:</strong> ${topRecommendation.fields?.vote_avg || topRecommendation.vote_avg || 'N/A'}</p>
            </div>
        `;
    
        const secondaryRecommendations = state.recommendation.slice(1);
        secondaryRecommendations.forEach(rec => {
            const title = rec.fields?.title || rec.fields?.name || rec.name;
            const posterPath = rec.fields?.poster_path || rec.poster_path;
            const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';
            const trailerKey = rec.trailers?.length > 0 ? rec.trailers[0] : '';
    
            recommendationContainer.innerHTML += `
                <div class="secondary-item">
                    <img src="${posterUrl}" alt="${title}" class="poster" data-trailers='${JSON.stringify(rec.trailers || [])}' />
                    <h4>${title}</h4>
                </div>
            `;
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
        const trailerPopup = document.getElementById('trailerPopup');
        const trailerVideo = document.getElementById('trailerVideo');
        trailerVideo.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
        trailerPopup.style.display = 'block';
    };

    const closeTrailerButton = document.getElementById('closeTrailer');
    closeTrailerButton.addEventListener('click', () => {
        const trailerPopup = document.getElementById('trailerPopup');
        const trailerVideo = document.getElementById('trailerVideo');
        trailerVideo.src = ''; // Stop the video playback
        trailerPopup.style.display = 'none';
    });
    

    renderForm();
});
