import pymongo
from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from bson import ObjectId

app = Flask(__name__)
CORS(app)  # CORS 설정 추가

# MongoDB 클라이언트 설정
client = MongoClient('mongodb://localhost:27017/')
db = client['tmdb_database']  # 데이터베이스 이름

# 컬렉션 매핑
collections = {
    'movie': db['movies'],
    'tv': {
        'MBC': db['tvshow_mbcs'],
        'tvN': db['tvshow_tvns'],
        'JTBC': db['tvshow_jtbcs'],
        'KBS1': db['tvshow_kbs1'],
        'KBS2': db['tvshow_kbs2'],
        'SBS': db['tvshow_sbs']
    }
}


logging.basicConfig(level=logging.DEBUG)

def serialize_document(doc):
    print("doc >>> : ", doc)
    """Serialize MongoDB document to JSON-compatible format."""
    if isinstance(doc, dict):
        # Convert ObjectId to string
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, dict):
                doc[key] = serialize_document(value)
            elif isinstance(value, list):
                doc[key] = [serialize_document(v) for v in value]
    return doc

def get_recommendations(media_type=None, genres=None, director=None, actor=None, min_runtime=None, max_runtime=None, network=None):
    query = {}

    # 컬렉션 선택
    if media_type == 'tv':
        # 네트워크를 대문자로 변환하여 매칭
        if network:
            network = network.upper()
        collection = collections['tv'].get(network)
        if collection is None:
            logging.debug(f"No collection found for network={network}")
            return []
    else:
        collection = collections.get(media_type)
        if collection is None:
            logging.debug(f"No collection found for media_type={media_type}")
            return []

    logging.debug(f"Collection: {collection}")

    # 쿼리 구성
    if media_type == 'tv':
        if network:
            query['networks'] = {'$in': [network]}
        if genres:
            query['genres'] = {'$in': genres}
        if actor:
            query['cast.name'] = {'$in': [actor]}
    else:
        if genres:
            query['fields.genres'] = {'$in': genres}
        if director:
            query['fields.directors'] = {'$in': [director]}
        if actor:
            query['fields.cast.name'] = {'$in': [actor]}
        if min_runtime or max_runtime:
            runtime_query = {}
            if min_runtime is not None:
                runtime_query['$gte'] = min_runtime
            if max_runtime is not None:
                runtime_query['$lte'] = max_runtime
            query['fields.runtime'] = runtime_query

    logging.debug(f"Constructed query: {query}")

    try:
        results = list(collection.find(query))
    except Exception as e:
        logging.error(f"Error executing query: {e}")
        return []

    logging.debug(f"Query results: {results}")

    if not results:
        return []

    if media_type == 'movie':
        results.sort(key=lambda x: (-x['fields']['vote_avg'], -x['fields']['popularity']))
    elif media_type == 'tv':
        results.sort(key=lambda x: -x['popularity'])

    return [serialize_document(result) for result in results[:5]]





@app.route('/recommend', methods=['GET'])
def recommend():
    media_type = request.args.get('media_type')
    genres = request.args.getlist('genre')
    director = request.args.get('director')
    actor = request.args.get('actor')
    min_runtime = request.args.get('min_runtime', type=int)
    max_runtime = request.args.get('max_runtime', type=int)
    network = request.args.get('network')

    logging.debug(f"Received request with media_type={media_type}, genres={genres}, director={director}, actor={actor}, min_runtime={min_runtime}, max_runtime={max_runtime}, network={network}")

    recommendation = get_recommendations(media_type, genres, director, actor, min_runtime, max_runtime, network)

    if not recommendation:
        logging.debug("No recommendation found.")
        return jsonify({"message": "No recommendations found based on the provided criteria."})

    logging.debug(f"Recommendation response: {recommendation}")

    return jsonify(recommendation)


if __name__ == '__main__':
    app.run(debug=True)

