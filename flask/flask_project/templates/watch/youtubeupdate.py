import requests
from pymongo import MongoClient

# TMDb API 키
TMDB_API_KEY = 'a16b7ecdeb28463bc207c810433078d8'
BASE_URL = 'https://api.themoviedb.org/3/'

# MongoDB 클라이언트 연결
client = MongoClient('mongodb://localhost:27017/')
db = client['tmdb_database']
movies_collection = db['movies']

def get_movie_list(page=1):
    url = f"{BASE_URL}movie/popular?api_key={TMDB_API_KEY}&language=en-US&page={page}"
    response = requests.get(url).json()
    return response.get('results', []), response.get('total_pages', 1)

def get_trailers(movie_id):
    url = f"{BASE_URL}movie/{movie_id}/videos?api_key={TMDB_API_KEY}&language=en-US"
    response = requests.get(url).json()
    results = response.get('results', [])
    trailers = [video['key'] for video in results if video['type'] == 'Trailer']
    return trailers

def upsert_movie_with_trailers(movie):
    movie_id = movie['id']
    trailers = get_trailers(movie_id)
    if trailers:
        movie_data = {
            'movie_id': movie_id,
            'title': movie.get('title'),
            'release_date': movie.get('release_date'),
            'poster_path': movie.get('poster_path'),
            'overview': movie.get('overview'),
            'popularity': movie.get('popularity'),
            'vote_avg': movie.get('vote_average'),
            'trailers': trailers
        }
        movies_collection.update_one(
            {'movie_id': movie_id},
            {'$set': movie_data},
            upsert=True  # If the document doesn't exist, insert it
        )
        print(f"Updated or inserted movie {movie_id} with trailers: {trailers}")

def main():
    page = 1
    while True:
        movies, total_pages = get_movie_list(page)
        if not movies:
            break
        for movie in movies:
            upsert_movie_with_trailers(movie)
        if page >= total_pages:
            break
        page += 1

if __name__ == '__main__':
    main()
