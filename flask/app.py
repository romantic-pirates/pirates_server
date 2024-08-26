from pymongo import MongoClient
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import logging
from bson import ObjectId
from datetime import datetime
import random
import requests

app = Flask(__name__, template_folder='flask_project/templates/', static_folder='flask_project/static')
CORS(app)

client = MongoClient('mongodb://192.168.0.66:27017/')
db = client['tmdb_database']

collections = {
    'movie': {
        'SF': db['genre_SF'],
        'TV 영화': db['genre_TV 영화'],
        '가족': db['genre_가족'],
        '공포': db['genre_공포'],
        '다큐멘터리': db['genre_다큐멘터리'],
        '드라마': db['genre_드라마'],
        '로맨스': db['genre_로맨스'],
        '모험': db['genre_모험'],
        '미스터리': db['genre_미스터리'],
        '범죄': db['genre_범죄'],
        '서부': db['genre_서부'],
        '스릴러': db['genre_스릴러'],
        '애니메이션': db['genre_애니메이션'],
        '액션': db['genre_액션'],
        '역사': db['genre_역사'],
        '음악': db['genre_음악'],
        '전쟁': db['genre_전쟁'],
        '코미디': db['genre_코미디'],
        '판타지': db['genre_판타지'],
    },
    'tv': {
        'MBC': db['tvshow_mbcs'],
        'tvN': db['tvshow_tvns'],
        'JTBC': db['tvshow_jtbcs'],
        'KBS1': db['tvshow_kbs1'],
        'KBS2': db['tvshow_kbs2'],
        'SBS': db['tvshow_sbs']
    }
}

TMDB_API_KEY = 'a16b7ecdeb28463bc207c810433078d8'

def fetch_trailers_for_movies(movie_ids):
    """Fetch trailers for a list of movie IDs."""
    trailers = {}
    for movie_id in movie_ids:
        url = f'https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key={TMDB_API_KEY}'
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for HTTP errors
            data = response.json()
            trailers[movie_id] = [video['key'] for video in data.get('results', []) if video['type'] == 'Trailer']
        except requests.RequestException as e:
            logging.error(f"Failed to fetch trailers for movie ID {movie_id}: {e}")
            trailers[movie_id] = []
    return trailers

logging.basicConfig(level=logging.DEBUG)

def serialize_document(doc):
    """Convert MongoDB document to serializable format."""
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, dict):
                doc[key] = serialize_document(value)
            elif isinstance(value, list):
                doc[key] = [serialize_document(v) for v in value]
    return doc

def get_recommendations(media_type=None, genres=None, director=None, actor=None, min_runtime=None, max_runtime=None, network=None, release_year=None, status=None):
    query = {}

    if media_type == 'tv':
        if network:
            network = network.upper()
        collection = collections['tv'].get(network)
        if collection is None:
            logging.debug(f"No collection found for network={network}")
            return []

        if network:
            query['networks'] = {'$in': [network]}
        if genres:
            query['genres'] = {'$in': genres}
        if actor:
            query['cast'] = {'$in': [actor]}  
        if status:
            query['status'] = status
    elif media_type == 'movie':
        if genres and genres[0] in collections['movie']:
            collection = collections['movie'].get(genres[0])
        else:
            collection = db['movies']

        if genres:
            query['fields.genres'] = {'$in': genres}
        if director:
            query['fields.directors'] = {'$in': [director]}
        
        actor_query = {
            '$or': [
                {'fields.cast': {'$in': [actor]}},
                {'fields.cast.name': {'$in': [actor]}}
            ]
        }
        if actor:
            query.update(actor_query)
        
        if min_runtime is not None or max_runtime is not None:
            runtime_query = {}
            if min_runtime is not None:
                runtime_query['$gte'] = min_runtime
            if max_runtime is not None:
                runtime_query['$lte'] = max_runtime
            query['fields.runtime'] = runtime_query
        if release_year:
            start_date = f'{release_year}-01-01'
            end_date = f'{release_year + 1}-01-01'
            query['fields.release_date'] = {'$gte': start_date, '$lt': end_date}

    logging.debug(f"Constructed query: {query}")

    try:
        results = list(collection.find(query))
    except Exception as e:
        logging.error(f"Error executing query: {e}")
        return []

    logging.debug(f"Query results: {results}")

    if not results:
        return []

    # Sort the results based on media_type
    if media_type == 'movie':
        results.sort(key=lambda x: (
            -x.get('fields', {}).get('vote_avg', 0),
            -x.get('fields', {}).get('popularity', 0)
        ))
    elif media_type == 'tv':
        results.sort(key=lambda x: -x.get('popularity', 0))

    # Select the top result and the next random results
    top_result = results[0] if results else None
    random_results = random.sample(results[1:], min(7, len(results) - 1)) if len(results) > 1 else []

    final_results = [top_result] + random_results if top_result else random_results

    return [serialize_document(result) for result in final_results]

@app.route('/watchhome')
def home():
    return render_template('watch/watchhome.html')

@app.route('/test')
def test():
    return render_template('watch/test.html')

@app.route('/watch')
def index():
    """Serve the watch.html file."""
    return render_template('watch/watch.html')

@app.route('/recommend', methods=['GET'])
def recommend():
    """Handle recommendation requests."""
    media_type = request.args.get('media_type')
    genres = request.args.getlist('genres')
    director = request.args.get('director')
    actor = request.args.get('actor')
    min_runtime = request.args.get('min_runtime', type=int)
    max_runtime = request.args.get('max_runtime', type=int)
    network = request.args.get('network')
    release_year_str = request.args.get('release_year')
    status = request.args.get('status')
    sort_by = request.args.get('sort_by', 'rating')

    release_year = None

    try:
        if release_year_str:
            release_year = int(release_year_str)
    except ValueError:
        return jsonify({"message": "Invalid release year format."}), 400

    if release_year and (release_year < 1900 or release_year > datetime.now().year):
        return jsonify({"message": "Invalid release year."}), 400

    logging.debug(f"Received request with media_type={media_type}, genres={genres}, director={director}, actor={actor}, min_runtime={min_runtime}, max_runtime={max_runtime}, network={network}, release_year={release_year}, sort_by={sort_by}")

    recommendations = get_recommendations(media_type, genres, director, actor, min_runtime, max_runtime, network, release_year, status)

    if not recommendations:
        logging.debug("No recommendation found.")
        return jsonify({"message": "No recommendations found based on the provided criteria."}), 404

    logging.debug(f"Initial recommendation list: {recommendations}")

    if sort_by == 'random':
        if len(recommendations) > 1:
            top_result = recommendations[0]
            random_results = random.sample(recommendations[1:], min(7, len(recommendations) - 1))
            random.shuffle(random_results)
            final_results = [top_result] + random_results
        else:
            final_results = recommendations
    else:
        final_results = recommendations

    # Fetch trailers only for the final set of recommendations
    movie_ids = [result.get('fields', {}).get('movie_id') for result in final_results if media_type == 'movie']
    if movie_ids:
        trailers = fetch_trailers_for_movies(movie_ids)
        for result in final_results:
            movie_id = result.get('fields', {}).get('movie_id')
            if movie_id:
                result['trailers'] = trailers.get(movie_id, [])

    logging.debug(f"Final recommendation response: {final_results}")

    return jsonify(final_results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
