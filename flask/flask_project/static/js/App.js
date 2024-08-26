document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const recommendationContainer = document.getElementById('recommendation-container');
    const errorContainer = document.getElementById('error');
    const trailerPopup = document.getElementById('trailerPopup');
    const trailerIframe = document.getElementById('trailerVideo');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalButton = document.getElementById('closeModal');
    const closeTrailerButton = document.getElementById('closeTrailer');

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
        sortBy: 'rating', // 기본 정렬
    };

    // URL 매개변수 가져오기 함수
    const getQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            mediaType: params.get('mediaType') || '',
        };
    };

    // URL 매개변수를 기반으로 상태 설정
    const setStateFromQueryParams = () => {
        const queryParams = getQueryParams();
        state.mediaType = queryParams.mediaType;
    };

    const populateFormFields = () => {
        document.getElementById('mediaType').value = state.mediaType;
        document.getElementById('director').value = state.director;
        document.getElementById('actor').value = state.actor;
        document.getElementById('minRuntime').value = state.minRuntime;
        document.getElementById('maxRuntime').value = state.maxRuntime;
        document.getElementById('network').value = state.network;
        document.getElementById('releaseYear').value = state.releaseYear;
        document.getElementById('status').value = state.status;
        updateGenreCheckboxes();
    };

    const updateGenreCheckboxes = () => {
        const genreCheckboxes = document.querySelectorAll('input[name="genres"]');
        genreCheckboxes.forEach(checkbox => {
            checkbox.checked = state.genres.includes(checkbox.value);
        });
    };

    const renderForm = () => {
        const html = `
            <form id="searchForm">
    <label>
        영화/TV:
        <select id="mediaType">
            <option value="">선택</option>
            <option value="movie">영화</option>
            <option value="tv">TV</option>
        </select>
    </label>
    <br/>
    <div id="tvOptions" style="display: none;">
        <label>
            방송사:
            <select id="network">
                <option value="">선택</option>
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
            완결/방영:
            <select id="status">
                <option value="">선택</option>
                <option value="Ended">완결</option>
                <option value="Returning Series">방영중</option>
            </select>
        </label>
        <br/>
    </div>
    <div id="movieOptions" style="display: none;">
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
            개봉 연도:
            <input id="releaseYear" type="number" min="2000" max="2027" value="2024" placeholder="개봉 연도">
        </label>
    </div>
    <br/>
    <div id="tvGenres" style="display: none;">
        <label>장르:</label>
        <div class="genre-container">
            <label><input type="checkbox" name="genres" value="Action & Adventure"> 액션/모험</label>
            <label><input type="checkbox" name="genres" value="Kids"> 아동</label>
            <label><input type="checkbox" name="genres" value="News"> 뉴스</label>
            <label><input type="checkbox" name="genres" value="Reality"> 리얼리티</label>
            <label><input type="checkbox" name="genres" value="Sci-Fi & Fantasy"> SF/판타지</label>
            <label><input type="checkbox" name="genres" value="Soap"> 연속극</label>
            <label><input type="checkbox" name="genres" value="Talk"> 토크쇼</label>
            <label><input type="checkbox" name="genres" value="War & Politics"> 전쟁/정치</label>
            <label><input type="checkbox" name="genres" value="가족"> 가족</label>
            <label><input type="checkbox" name="genres" value="다큐멘터리"> 다큐멘터리</label>
            <label><input type="checkbox" name="genres" value="드라마"> 드라마</label>
            <label><input type="checkbox" name="genres" value="로맨스"> 로맨스</label>
            <label><input type="checkbox" name="genres" value="미스터리"> 미스터리</label>
            <label><input type="checkbox" name="genres" value="범죄"> 범죄</label>
            <label><input type="checkbox" name="genres" value="애니메이션"> 애니메이션</label>
            <label><input type="checkbox" name="genres" value="역사"> 역사</label>
            <label><input type="checkbox" name="genres" value="코미디"> 코미디</label>
        </div>
    </div>
    <div id="movieGenres" style="display: none;">
        <label>장르:</label>
        <div class="genre-container">
           <label><input type="checkbox" name="genres" value="SF"> SF</label>
            <label><input type="checkbox" name="genres" value="TV 영화"> TV 영화</label>
            <label><input type="checkbox" name="genres" value="가족"> 가족</label>
            <label><input type="checkbox" name="genres" value="공포"> 공포</label>
            <label><input type="checkbox" name="genres" value="다큐멘터리"> 다큐멘터리</label>
            <label><input type="checkbox" name="genres" value="드라마"> 드라마</label>
            <label><input type="checkbox" name="genres" value="로맨스"> 로맨스</label>
            <label><input type="checkbox" name="genres" value="모험"> 모험</label>
            <label><input type="checkbox" name="genres" value="미스터리"> 미스터리</label>
            <label><input type="checkbox" name="genres" value="범죄"> 범죄</label>
            <label><input type="checkbox" name="genres" value="서부"> 서부</label>
            <label><input type="checkbox" name="genres" value="스릴러"> 스릴러</label>
            <label><input type="checkbox" name="genres" value="애니메이션"> 애니메이션</label>
            <label><input type="checkbox" name="genres" value="액션"> 액션</label>
            <label><input type="checkbox" name="genres" value="역사"> 역사</label>
            <label><input type="checkbox" name="genres" value="음악"> 음악</label>
            <label><input type="checkbox" name="genres" value="전쟁"> 전쟁</label>
            <label><input type="checkbox" name="genres" value="코미디"> 코미디</label>
            <label><input type="checkbox" name="genres" value="판타지"> 판타지</label>
        </div>
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
    
        // 현재 상태 값으로 폼 필드 채우기
        populateFormFields();
        toggleFormOptions();
    
        document.getElementById('mediaType').addEventListener('change', (e) => {
            state.mediaType = e.target.value;
            toggleFormOptions();
        });
    
        document.getElementById('submitButton').addEventListener('click', handleSubmit);
        document.getElementById('resetButton').addEventListener('click', handleReset);
    
        // 장르 체크박스 이벤트 리스너 추가
        document.querySelectorAll('input[name="genres"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    state.genres.push(e.target.value);
                } else {
                    state.genres = state.genres.filter(genre => genre !== e.target.value);
                }
            });
        });
    };
    

    const toggleFormOptions = () => {
        const mediaType = state.mediaType;
        const tvOptions = document.getElementById('tvOptions');
        const movieOptions = document.getElementById('movieOptions');
        
        tvOptions.style.display = mediaType === 'tv' ? 'block' : 'none';
        movieOptions.style.display = mediaType === 'movie' ? 'block' : 'none';

        document.getElementById('tvGenres').style.display = mediaType === 'tv' ? 'block' : 'none';
        document.getElementById('movieGenres').style.display = mediaType === 'movie' ? 'block' : 'none';
    };

    const handleSubmit = async () => {
        // 폼 데이터 가져오기
        state.mediaType = document.getElementById('mediaType').value;
        state.network = document.getElementById('network').value;
        state.director = document.getElementById('director').value;
        state.actor = document.getElementById('actor').value;
        state.minRuntime = document.getElementById('minRuntime').value;
        state.maxRuntime = document.getElementById('maxRuntime').value;
        state.releaseYear = document.getElementById('releaseYear').value;
        state.status = document.getElementById('status').value;
    
        // 유효성 검사
        if (state.mediaType === 'movie' && state.genres.length === 0) {
            Swal.fire({
                title: '장르 선택 오류',
                text: '영화를 선택하셨다면, 적어도 하나의 장르를 선택해야 합니다.',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: '확인'
            });
            return;
        }
        if (state.mediaType === 'tv' && !state.network) {
            Swal.fire({
                title: '방송사 선택 오류',
                text: 'TV를 선택하셨다면, 방송사를 선택해야 합니다.',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: '확인'
            });
            return;
        }
    
        // 쿼리 매개변수 설정
        const queryParams = new URLSearchParams();
        if (state.mediaType) queryParams.append('media_type', state.mediaType);
        if (state.genres.length > 0) state.genres.forEach(genre => queryParams.append('genres', genre));
        if (state.mediaType === 'movie' && state.director) queryParams.append('director', state.director);
        if (state.actor) queryParams.append('actor', state.actor);
        if (state.mediaType === 'movie' && state.minRuntime) queryParams.append('min_runtime', state.minRuntime);
        if (state.mediaType === 'movie' && state.maxRuntime) queryParams.append('max_runtime', state.maxRuntime);
        if (state.mediaType === 'movie' && state.releaseYear) queryParams.append('release_year', state.releaseYear);
        if (state.mediaType === 'tv' && state.network) queryParams.append('network', state.network);
        if (state.mediaType === 'tv' && state.status) queryParams.append('status', state.status);
        queryParams.append('sort_by', state.sortBy);
    
        console.log(`Query params: ${queryParams.toString()}`);
    
        try {
            const response = await fetch(`http://localhost:5000/recommend?${queryParams.toString()}`);
            const data = await response.json();
    
            if (response.ok) {
                state.recommendation = data;
                renderRecommendations();
                
                // 추천 결과 렌더링 후 페이지 상단으로 스크롤
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // 부드러운 스크롤
                });
            } else {
                Swal.fire({
                    title: '조건에 맞는 데이터가 없음',
                    text: data.message || '오류가 발생했습니다.',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '확인'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
            title: '네트워크 오류',
            text: '추천 목록을 가져오는 데 실패했습니다.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '확인'
        });
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
        state.status = '';
        state.recommendation = [];
        state.sortBy = 'rating'; // 정렬을 기본값으로 재설정
        renderForm();
        recommendationContainer.innerHTML = '';
        errorContainer.innerText = '';
    };

    const renderRecommendations = () => {
        recommendationContainer.innerHTML = '';
    
        if (state.recommendation.length === 0) {
            recommendationContainer.innerHTML = '<p>추천 항목이 없습니다.</p>';
            return;
        }

        state.recommendation.forEach((rec, index) => {
            const title = rec.fields?.title || rec.fields?.name || rec.name;
            const posterPath = rec.fields?.poster_path || rec.poster_path;
            const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';
            const releaseDate = rec.fields?.release_date || rec.fields?.first_air_date || rec.first_air_date;
            const trailers = rec.trailers || []; // 트레일러가 추천 항목에 포함된 경우

            recommendationContainer.innerHTML += `
                <div class="recommendation-item" data-index="${index}">
                    <img src="${posterUrl}" alt="${title}" class="poster" />
                    <div class="overlay">
                        <h3>${title}</h3>
                        <p>${releaseDate || 'N/A'}</p>
                    </div>
                </div>
            `;
        });

        // 포스터 클릭 시 이벤트 리스너 추가
        document.querySelectorAll('.poster').forEach(poster => {
            poster.addEventListener('click', (event) => {
                const index = event.target.closest('.recommendation-item').dataset.index;
                const rec = state.recommendation[index];
                showDetailModal(rec);
            });
        });
    };

    const showDetailModal = (rec) => {
        const title = rec.fields?.title || rec.fields?.name || rec.name;
        const posterPath = rec.fields?.poster_path || rec.poster_path;
        const posterUrl = posterPath ? `https://image.tmdb.org/t/p/original${posterPath}` : '';
        const overview = rec.fields?.overview || rec.overview || 'N/A';
        const releaseDate = rec.fields?.release_date || rec.fields?.first_air_date || rec.first_air_date;
        const genres = rec.fields?.genres?.join(', ') || rec.genres?.join(', ') || 'N/A';
        const directorOrNetwork = rec.fields?.directors?.join(', ') || (rec.networks?.join(', ') || 'N/A');
        const cast = rec.fields?.cast?.map(c => c.name).join(', ') || (rec.cast?.map(c => c.name).join(', ') || 'N/A');
        const popularity = rec.fields?.popularity || rec.popularity || 'N/A';
        const averageVote = rec.fields?.vote_avg || rec.vote_avg || 'N/A';
        const trailers = rec.trailers || []; // 트레일러가 추천 항목에 포함된 경우
    
        modalBody.innerHTML = `
            <div class="modal-image" style="background-image: url('${posterUrl}');">
                <div class="overlay-content" style="max-height: 400px; overflow-y: auto;">
                    <h2>${title}</h2>
                    <div class="info-container">
                        <p><strong>개봉일:</strong> ${releaseDate || 'N/A'}</p>
                        ${trailers.length > 0 ? `<button id="playTrailer" data-trailer="${trailers[0]}" class="trailer-button">트레일러 재생</button>` : ''}
                    </div>
                    <p><strong>개요:</strong> ${overview}</p>
                    <p><strong>장르:</strong> ${genres}</p>
                    <p><strong>${state.mediaType === 'movie' ? '감독' : '방송사'}:</strong> ${directorOrNetwork}</p>
                    <p><strong>출연진:</strong> ${cast}</p>
                    <p><strong>인기도:</strong> ${popularity}</p>
                    <p><strong>평균 평점:</strong> ${averageVote}</p>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    
        // 트레일러 버튼 클릭 시 이벤트 리스너 추가
        const playTrailerButton = document.getElementById('playTrailer');
        if (playTrailerButton) {
            playTrailerButton.addEventListener('click', () => {
                const trailerKey = playTrailerButton.getAttribute('data-trailer');
                showTrailer(trailerKey);
            });
        }
    };
    
    // CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        .info-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
    
        .trailer-button {
            background-color: #ff0000;
            color: #ffffff;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 14px;
            border-radius: 3px;
            transition: background-color 0.3s;
        }
    
        .trailer-button:hover {
            background-color: #cc0000;
        }
        .genre-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
}

.genre-container label {
    display: flex; /* label과 input을 수평 정렬 */
    align-items: center; /* input과 텍스트를 수직 가운데 정렬 */
}

.genre-container input[type="checkbox"] {
        margin-right: -160px;
    margin-bottom: 0;
    margin-top: 0;
    margin-left: 40px;
}


    `;
    document.head.appendChild(style);
    

    const showTrailer = (videoKey) => {
        trailerIframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
        trailerPopup.style.display = 'block';
    };

    const closeTrailer = () => {
        trailerIframe.src = ''; // 비디오 재생 중지
        trailerPopup.style.display = 'none';
    };

    closeTrailerButton.addEventListener('click', closeTrailer);

    // 트레일러 팝업 외부를 클릭하면 팝업을 닫는 이벤트 리스너 추가
    window.addEventListener('click', (event) => {
        if (event.target === trailerPopup) {
            closeTrailer();
        }
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 배열을 무작위로 섞는 함수
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 상태 초기화 및 폼 렌더링
    setStateFromQueryParams();
    renderForm();
});
