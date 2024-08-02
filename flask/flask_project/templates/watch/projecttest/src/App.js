document.addEventListener('DOMContentLoaded', () => {
    let step = 1;
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
        recommendation: [],
    };

    const renderForm = () => {
        let html = '';
        switch (step) {
            case 1:
                html = `
                    <label>
                        Media Type:
                        <select id="mediaType">
                            <option value="">Select</option>
                            <option value="movie">Movie</option>
                            <option value="tv">TV Show</option>
                        </select>
                    </label>
                    <button id="nextButton">Next</button>
                `;
                break;
            case 2:
                if (state.mediaType === 'tv') {
                    html = `
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
                        <button id="prevButton">Back</button>
                        <button id="nextButton">Next</button>
                    `;
                } else {
                    html = `
                        <label>
                            Genres (comma separated):
                            <input id="genres" type="text" placeholder="Enter genres">
                        </label>
                        <button id="prevButton">Back</button>
                        <button id="nextButton">Next</button>
                    `;
                }
                break;
            case 3:
                html = `
                    <label>
                        Director:
                        <input id="director" type="text" placeholder="Enter director">
                    </label>
                    <button id="prevButton">Back</button>
                    <button id="nextButton">Next</button>
                `;
                break;
            case 4:
                html = `
                    <label>
                        Actor:
                        <input id="actor" type="text" placeholder="Enter actor">
                    </label>
                    <button id="prevButton">Back</button>
                    <button id="nextButton">Next</button>
                `;
                break;
            case 5:
                html = `
                    <label>
                        Min Runtime:
                        <input id="minRuntime" type="number" placeholder="Enter min runtime">
                    </label>
                    <button id="prevButton">Back</button>
                    <button id="nextButton">Next</button>
                `;
                break;
            case 6:
                html = `
                    <label>
                        Max Runtime:
                        <input id="maxRuntime" type="number" placeholder="Enter max runtime">
                    </label>
                    <button id="prevButton">Back</button>
                    <button id="recommendButton">Get Recommendation</button>
                `;
                break;
            case 7:
                if (state.recommendation.length > 0) {
                    html = formatRecommendation(state.recommendation[0]);
                    html += `
                        <div class="small-recommendations">
                            ${state.recommendation.slice(1).map(formatSmallRecommendation).join('')}
                        </div>
                    `;
                } else {
                    html = `<div>No recommendation available.</div>`;
                }
                break;
            default:
                break;
        }
        formContainer.innerHTML = html;

        // 버튼 이벤트 리스너 설정
        if (document.getElementById('nextButton')) {
            document.getElementById('nextButton').addEventListener('click', nextStep);
        }
        if (document.getElementById('prevButton')) {
            document.getElementById('prevButton').addEventListener('click', prevStep);
        }
        if (document.getElementById('recommendButton')) {
            document.getElementById('recommendButton').addEventListener('click', getRecommendation);
        }
    };

    const nextStep = () => {
        switch (step) {
            case 1:
                state.mediaType = document.getElementById('mediaType').value;
                break;
            case 2:
                if (state.mediaType === 'tv') {
                    state.network = document.getElementById('network').value;
                } else {
                    state.genres = document.getElementById('genres').value.split(',').map(genre => genre.trim());
                }
                break;
            case 3:
                state.director = document.getElementById('director').value;
                break;
            case 4:
                state.actor = document.getElementById('actor').value;
                break;
            case 5:
                state.minRuntime = document.getElementById('minRuntime').value;
                break;
            case 6:
                state.maxRuntime = document.getElementById('maxRuntime').value;
                break;
            default:
                break;
        }
        step++;
        renderForm();
    };

    const prevStep = () => {
        step--;
        renderForm();
    };

    const getRecommendation = async () => {
        try {
            const response = await fetch('http://localhost:5000/recommend?' + new URLSearchParams({
                media_type: state.mediaType,
                genres: state.genres,
                director: state.director,
                actor: state.actor,
                min_runtime: state.minRuntime ? parseInt(state.minRuntime) : undefined,
                max_runtime: state.maxRuntime ? parseInt(state.maxRuntime) : undefined,
                network: state.network
            }));
            const data = await response.json();
            if (response.ok) {
                state.recommendation = data;
                step++;
                renderForm();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching recommendation:', error);
            errorContainer.textContent = 'Error fetching recommendation.';
        }
    };

    const formatRecommendation = (rec) => {
        if (!rec) return '';

        const title = rec.title || rec.name || 'N/A';
        const releaseDate = rec.release_date || rec.first_air_date || 'N/A';
        const directorOrNetwork = rec.directors ? rec.directors.join(', ') : (rec.networks ? rec.networks.join(', ') : 'N/A');
        const genres = rec.genres ? rec.genres.join(', ') : 'N/A';
        const cast = rec.cast ? rec.cast.map(c => c.name).join(', ') : 'N/A';

        return `
            <div class="main-recommendation">
                <h2>Recommended ${state.mediaType === 'movie' ? 'Movie' : 'TV Show'}:</h2>
                <div>
                    ${rec.poster_path ? `<img src="https://image.tmdb.org/t/p/w500${rec.poster_path}" alt="${title}">` : ''}
                    <h3>${title}</h3>
                    <p><strong>Release Date:</strong> ${releaseDate}</p>
                    <p><strong>Overview:</strong> ${rec.overview}</p>
                    <p><strong>Genres:</strong> ${genres}</p>
                    <p><strong>${state.mediaType === 'movie' ? 'Director' : 'Network'}:</strong> ${directorOrNetwork}</p>
                    <p><strong>Cast:</strong> ${cast}</p>
                    <p><strong>Popularity:</strong> ${rec.popularity}</p>
                    <p><strong>Average Vote:</strong> ${rec.vote_avg}</p>
                </div>
            </div>
        `;
    };

    const formatSmallRecommendation = (rec) => {
        if (!rec) return '';

        const title = rec.title || rec.name || 'N/A';
        return `
            <div class="small-recommendation">
                ${rec.poster_path ? `<img src="https://image.tmdb.org/t/p/w92${rec.poster_path}" alt="${title}" class="small-poster">` : ''}
                <p>${title}</p>
            </div>
        `;
    };

    renderForm();
});
