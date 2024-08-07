import requests
from pymongo import MongoClient

# MongoDB 설정
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['tmdb_database']
collections = {
    'MBC': db['tvshow_mbcs'],
    'tvN': db['tvshow_tvns'],
    'JTBC': db['tvshow_jtbcs'],
    'KBS1': db['tvshow_kbs1'],
    'KBS2': db['tvshow_kbs2'],
    'SBS': db['tvshow_sbs']
}

# TMDB API 설정
TMDB_API_KEY = 'a16b7ecdeb28463bc207c810433078d8'
TMDB_BASE_URL = 'https://api.themoviedb.org/3/tv/'

def get_tv_show_credits_from_tmdb(tv_id):
    url = f"{TMDB_BASE_URL}{tv_id}/credits?api_key={TMDB_API_KEY}&language=ko"  # 한국어로 요청
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Failed to fetch credits for tv_id={tv_id}")
        return None

def update_tv_show_credits(collection, tv_id, credits_data):
    cast = [cast_member['name'] for cast_member in credits_data.get('cast', [])]
    
    result = collection.update_one(
        {'tv_id': tv_id},
        {'$set': {'cast': cast}}
    )
    return result.modified_count

def update_credits_for_all_tv_shows(collection_name):
    collection = collections[collection_name]
    
    # 모든 TV 쇼의 tv_id를 가져옵니다.
    tv_ids = collection.distinct('tv_id')
    
    for tv_id in tv_ids:
        credits_data = get_tv_show_credits_from_tmdb(tv_id)
        if credits_data:
            updated_count = update_tv_show_credits(collection, tv_id, credits_data)
            if updated_count > 0:
                print(f"Updated credits for tv_id={tv_id} in collection {collection_name}")
            else:
                print(f"No document found for tv_id={tv_id} in collection {collection_name}")
        else:
            print(f"Credits data not found for tv_id={tv_id} in collection {collection_name}")

# 모든 컬렉션에 대해 업데이트를 수행합니다.
for collection_name in collections.keys():
    update_credits_for_all_tv_shows(collection_name)
