import requests
from pymongo import MongoClient

# MongoDB 설정
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['tmdb_database']
movies_collection = db['movies']

# TMDB API 설정
TMDB_API_KEY = 'a16b7ecdeb28463bc207c810433078d8'
TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie/'

def get_movie_details_from_tmdb(movie_id):
    url = f"{TMDB_BASE_URL}{movie_id}?api_key={TMDB_API_KEY}&language=ko"  # 한국어로 요청
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch details for movie_id={movie_id}")
        return None

def is_korean_movie(movie_details):
    countries = movie_details.get('production_countries', [])
    for country in countries:
        if country.get('iso_3166_1') == 'KR':
            return True
    return False

def get_movie_credits_from_tmdb(movie_id):
    url = f"{TMDB_BASE_URL}{movie_id}/credits?api_key={TMDB_API_KEY}&language=ko"  # 한국어로 요청
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch credits for movie_id={movie_id}")
        return None

def update_movie_credits(movie_id, credits_data):
    directors = [director['name'] for director in credits_data.get('crew', []) if director['job'] == 'Director']
    actors = [actor['name'] for actor in credits_data.get('cast', [])]

    result = movies_collection.update_one(
        {'fields.movie_id': movie_id},
        {'$set': {'fields.directors': directors, 'fields.cast': actors}}
    )
    return result.modified_count

def update_credits_for_korean_movies():
    movie_ids = movies_collection.distinct('fields.movie_id')
    
    for movie_id in movie_ids:
        details_data = get_movie_details_from_tmdb(movie_id)
        if details_data and is_korean_movie(details_data):
            credits_data = get_movie_credits_from_tmdb(movie_id)
            if credits_data:
                updated_count = update_movie_credits(movie_id, credits_data)
                if updated_count > 0:
                    print(f"Updated credits for Korean movie_id={movie_id}")
                else:
                    print(f"No document found for movie_id={movie_id}")
            else:
                print(f"Credits data not found for movie_id={movie_id}")
        else:
            print(f"Movie_id={movie_id} is not a Korean movie or details not found")

update_credits_for_korean_movies()
