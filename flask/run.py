import pandas as pd
import requests
import random
import logging
import mysql.connector
import re
from bs4 import BeautifulSoup
from bson import ObjectId
from datetime import datetime
from flask import Flask, abort, request, session, url_for, jsonify, render_template
from flask_cors import CORS
from pymongo import MongoClient
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

app = Flask(__name__, template_folder='flask_project/templates/', static_folder='flask_project/static')

CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Authorization", "Content-Type", "X-Mnick", "X-Requested-With"],
        "supports_credentials": True
    }
})

app.config['SECRET_KEY'] = 'EasyPick'

# MySQL 연결 설정
mysql_config = {
    'user': 'root',
    'password': 'admin1234',
    'host': 'localhost',  # 또는 '127.0.0.1'
    'port': 3306,
    'database': 'easypick',
}

mysql_connection = mysql.connector.connect(**mysql_config)
mysql_cursor = mysql_connection.cursor()

# csv 읽어오기
df_menu = pd.read_csv('./flask_project/static/data/food_menus.csv', encoding='utf-8')
df_wear = pd.read_csv('./flask_project/static/data/wear_categories.csv', encoding='utf-8')

@app.before_request
def before_request():
    # 정적 파일 요청은 처리하지 않음
    if request.path.startswith('/static/'):
        return None

    if request.method == 'OPTIONS':
        return '', 200

    jsessionid = request.cookies.get('JSESSIONID')
    mnick = request.args.get('mnick')

    # mnick이 None인 경우, 세션스토리지에서 값을 가져오도록 시도
    if not mnick:
        mnick = request.form.get('mnick')

    print(f"Received JSESSIONID: {jsessionid}")
    print(f"Received mnick: {mnick}")

    if mnick:
        session['mnick'] = mnick
    elif 'mnick' not in session:
        abort(401, description="Unauthorized: mnick not found")

    
# eat
@app.route('/eat', methods=['GET'])
def eat():
    mnick = session.get('mnick')
    if mnick:
        print(f"Rendering template with mnick: {mnick}")
        return render_template('eat/eat.html', mnick=mnick)
    else:
        abort(401, description="Unauthorized: mnick not found")


@app.route('/update_session', methods=['POST'])
def update_session():
    data = request.json
    mnick = data.get('mnick')

    if mnick:
        session['mnick'] = mnick
        return jsonify({'success': True}), 200
    else:
        return jsonify({'error': 'mnick not provided'}), 400

# 랜덤으로 메뉴 추천
@app.route('/get_random_menu', methods=['GET'])
def get_random_menu():
    # request로 부터 category
    category = request.args.get('category')
    filtered_menus = df_menu[df_menu['분류'] == category]
    
    if filtered_menus.empty:
        # 필터링된 메뉴가 비어 있을 경우
        message = "더 이상 추천 가능한 메뉴가 없습니다."
        return render_template('eat/eat.html', message=message)

    # 필터링된 메뉴가 있을 경우 다른 로직을 처리합니다.
    # 여기에 추천 메뉴를 처리하는 로직을 추가합니다.
    # return render_template('recommend.html', menus=filtered_menus)
    random = filtered_menus.sample(1).iloc[0]
    random_menu = random['메뉴']
    #random_img_url = url_for('static', filename=f'images/{random_menu}.jpg')
    random_img_url = url_for('static', filename=f'images/food_images/{random_menu}.jpg')

    return jsonify({'menu': random_menu, 'url': random_img_url})

# 기존 추천 메뉴 제외하고 다시 추천
@app.route('/get_another_menu', methods=['GET'])
def get_another_menu():
    category = request.args.get('category')
    current_menu = request.args.get('current_menu')

    # current_menu 제외하고 새로운 메뉴 필터링
    filtered_menus = df_menu[(df_menu['분류'] == category) & (df_menu['메뉴'] != current_menu)]

    if filtered_menus.empty:
        return jsonify({'error': '더 이상 추천 가능한 메뉴가 없습니다.'}), 404

    random_choice = filtered_menus.sample(1).iloc[0]
    random_menu = random_choice['메뉴']
    random_img_url = url_for('static', filename=f'images/food_images/{random_menu}.jpg')

    return jsonify({'menu': random_menu, 'url': random_img_url})

@app.route('/menus')
def menus():
    menu = request.args.get('menu')
    category = request.args.get('category')
    url = request.args.get('url')
    return render_template('eat/menus.html', menu=menu, category=category, url=url)

@app.route('/restaurant')
def restaurant():
    address = request.args.get('address')
    menu = request.args.get('menu')
    return render_template('eat/restaurant.html', address=address, menu=menu)

@app.route('/likePlace', methods=['POST'])
def likePlace():
    data = request.json
    place_url = data.get('place_url')
    
    if not place_url:
        return jsonify({'error': 'No place URL provided'}), 400

    mysql_connection = None
    mysql_cursor = None

    try:
        response = requests.get(place_url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        meta_tags = {meta.get('property') or meta.get('name'): meta.get('content') for meta in soup.find_all('meta')}
        
        place_name = meta_tags.get('og:title', 'N/A')
        place_address = meta_tags.get('og:description', 'N/A')
        place_url = meta_tags.get('og:url', place_url)
        
        mysql_connection = mysql.connector.connect(**mysql_config)
        mysql_cursor = mysql_connection.cursor()
        
        mysql_query = "SELECT * FROM eat WHERE place_url = %s"
        mysql_cursor.execute(mysql_query, (place_url,))
        result = mysql_cursor.fetchone()
        
        if result:
            mysql_query = "UPDATE eat SET likes = likes + 1 WHERE place_url = %s"
            mysql_cursor.execute(mysql_query, (place_url,))
            mysql_connection.commit()
            likes = result[4] + 1
        else:
            mysql_query = """
            INSERT INTO eat (place_name, place_address, place_url, likes)
            VALUES (%s, %s, %s, 1)
            """
            mysql_cursor.execute(mysql_query, (place_name, place_address, place_url))
            mysql_connection.commit()
            likes = 1
        
        return jsonify({'success': True, 'likes': likes, 'place_name': place_name, 'place_address': place_address})

    except requests.RequestException as e:
        logging.error(f"Request error: {e}")
        return jsonify({'error': f'Failed to fetch the page: {str(e)}'}), 500

    except mysql.connector.Error as e:
        logging.error(f"MySQL error: {e}")
        return jsonify({'error': 'Failed to insert or update data in MySQL'}), 500
    
    finally:
        if mysql_cursor:
            mysql_cursor.close()
        if mysql_connection:
            mysql_connection.close()

@app.route('/wear', methods=['GET'])
def wear():
    mnick = session.get('mnick')
    if mnick:
        print(f"Rendering template with mnick: {mnick}")
        return render_template('wear/wear.html', mnick=mnick)
    else:
        abort(401, description="Unauthorized: mnick not found")

# 카테고리와 서브카테고리 데이터 가공
def get_main_categories():
    return df_wear['Category'].str.startswith(('남성', '여성')).unique()

def get_category_groups(prefix):
    categories = df_wear[df_wear['Category'].str.startswith(prefix)]['Category'].unique()
    return sorted(categories)

def get_subcategories(category):
    subcategories = df_wear[df_wear['Category'] == category][['Subcategory', 'Order']]
    sorted_subcategories = subcategories.sort_values(by='Order')
    return sorted_subcategories['Subcategory'].tolist()

def get_crawl_data(category, subcategory):
    row = df_wear[(df_wear['Category'] == category) & (df_wear['Subcategory'] == subcategory)]
    
    if row.empty:
        print(f"No data found for category: {category} and subcategory: {subcategory}")
        return []
    
    url = row.iloc[0]['URL']
    xpath = row.iloc[0]['XPath']
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--log-level=3')

    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(url)
        WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.XPATH, xpath)))

        category_element = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, xpath)))
        
        category_element.click()

        i = random.randint(1, 100)
        print(f"Selecting item: {i}")
    
        try:
            element = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, f'#__next > div.css-1k28ov0.ezz7e2c0 > div.css-1rr4qq7.ezz7e2c2 > ul > li:nth-child({i})'))
            )
        except Exception as e:
            print(f"Error finding element with CSS selector: {e}")
            return []
        
        lines = element.text.split('\n')
        
        brand = lines[0]

        product_name = lines[1]
        price = lines[2]
        image_url = element.find_element(By.CSS_SELECTOR, 'div > a > div > img').get_attribute('src')
        buy_url = element.find_element(By.CSS_SELECTOR, 'div > a').get_attribute('href')

        
        data = {
            "brand": brand,
            "product_name": product_name,
            "price": price,
            "image_url": image_url,
            "buy_url": buy_url,
            "likes": 0
        }
        print(f"Fetched item {i}: {brand}, {product_name}, {price}, {image_url}, {buy_url}")
        print(f"Crawled Data: {data}")
        
        return data

    except Exception as e:
        print(f"An error occurred: {e}")
        return []
    
    finally:
        driver.quit()

@app.route('/categories/<prefix>')
def categories(prefix):
    categories = get_category_groups(prefix)
    return jsonify(categories)

@app.route('/subcategories/<category>')
def subcategories(category):
    subcategories = get_subcategories(category)
    return jsonify(subcategories)

@app.route('/recommend/<category>/<subcategory>')
def recommend_wear(category, subcategory):
    data = get_crawl_data(category, subcategory)
    if not data:
        return render_template('wear/result.html', data=None)
    
    data_list = [data]
    
    return render_template('wear/result.html', data=data_list)


# 금액 형식

def extract_price(price_str):
    match = re.search(r'\d+(?:,\d+)*', price_str)
    if match:
        return match.group(0)
    return None

@app.route('/like', methods=['POST'])
def like_product():
    data = request.json
    brand = data.get('brand')
    product_name = data.get('product_name')
    price_str = data.get('price')
    image_url = data.get('image_url')
    buy_url = data.get('buy_url')
    
    price = extract_price(price_str)
    
    if not all([brand, product_name, price, image_url, buy_url]):
        return jsonify({"success": False, "message": "Invalid input"}), 400
    
    try:
        mysql_connection = mysql.connector.connect(**mysql_config)
        mysql_cursor = mysql_connection.cursor()
        

        # 상품이 이미 존재하는지 확인
        mysql_query = "SELECT likes FROM wear WHERE product_name = %s"

        mysql_cursor.execute(mysql_query, (product_name,))
        result = mysql_cursor.fetchone()

        if result:
            likes = result[0] + 1
            mysql_query = "UPDATE wear SET likes = %s WHERE product_name = %s"
            mysql_cursor.execute(mysql_query, (likes, product_name))
            mysql_connection.commit()
            return jsonify({"success": True, "likes": likes})

        else:
            mysql_query = """
            INSERT INTO wear (brand, product_name, price, image_url, buy_url, likes)
            VALUES(%s, %s, %s, %s, %s, 1)
            """ 
            mysql_cursor.execute(mysql_query, (brand, product_name, price, image_url, buy_url))
            mysql_connection.commit()
            return jsonify({"success": True, "likes": 1})
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"success": False, "message": "Database error"}), 500
    finally:
        mysql_cursor.close()
        mysql_connection.close()
        
## watch
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
        'TVN': db['tvshow_tvns'],
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
        # TV Show 쿼리
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

@app.route('/watchhome', methods=['GET'])
def home():
    mnick = session.get('mnick')
    if mnick:
        print(f"Rendering template with mnick: {mnick}")
        return render_template('watch/watchhome.html', mnick=mnick)
    else:
        abort(401, description="Unauthorized: mnick not found")


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
        return jsonify({"message": "조건에 맞는 결과가 없습니다!"}), 404

    logging.debug(f"Initial recommendation list: {recommendations}")

    # Sort or randomize the results based on the sort_by parameter
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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)
