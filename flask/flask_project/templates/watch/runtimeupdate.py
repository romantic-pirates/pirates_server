import requests
from pymongo import MongoClient

# MongoDB 설정
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['tmdb_database']
movies_collection = db['movies']

# TMDB API 설정
TMDB_API_KEY = 'a16b7ecdeb28463bc207c810433078d8'
TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/'

def get_movie_runtime_from_tmdb(movie_id):
    url = f"{TMDB_BASE_URL}{movie_id}?api_key={TMDB_API_KEY}&language=ko"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data.get('runtime')
    else:
        print(f"Failed to fetch data for movie_id={movie_id}")
        return None

def update_movie_runtime(movie_id, runtime):
    result = movies_collection.update_one(
        {'fields.movie_id': movie_id},
        {'$set': {'fields.runtime': runtime}}
    )
    return result.modified_count

def update_runtime_for_all_movies():
    # 모든 영화의 movie_id를 가져옵니다.
    movie_ids = movies_collection.distinct('fields.movie_id')
    
    for movie_id in movie_ids:
        runtime = get_movie_runtime_from_tmdb(movie_id)
        if runtime is not None:
            updated_count = update_movie_runtime(movie_id, runtime)
            if updated_count > 0:
                print(f"Updated runtime for movie_id={movie_id} to {runtime} minutes")
            else:
                print(f"No document found for movie_id={movie_id}")
        else:
            print(f"Runtime data not found for movie_id={movie_id}")

update_runtime_for_all_movies()
