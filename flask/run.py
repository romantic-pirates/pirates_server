import pandas as pd
import requests
import random
import logging
import mysql.connector
import re

from flask import Flask, request, url_for, jsonify, render_template
from flask_project.routes import main_bp
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__, template_folder='flask_project/templates/', static_folder='flask_project/static')
CORS(app)
app.register_blueprint(main_bp)

# MySQL 연결 설정
mysql_config = {
    'user': 'root',
    'password': 'admin1234',
    'host': 'localhost',  # 또는 '127.0.0.1'
    'port': 3306,
    'database': 'pirates',
}

mysql_connection = mysql.connector.connect(**mysql_config)
mysql_cursor = mysql_connection.cursor()

# csv 읽어오기
df_menu = pd.read_csv('./flask_project/static/data/food_menus.csv', encoding='utf-8')
df_wear = pd.read_csv('./flask_project/static/data/wear_categories.csv', encoding='utf-8')

# eat
# 메뉴 카테고리 선택
@app.route('/eat')
def eat():
    return render_template('eat/eat.html')

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
    # 현재 메뉴 current_menu에 저장
    current_menu = request.args.get('current_menu')
    # current_menu 제외하고 새로운 메뉴 생성
    filtered_menus = df_menu[(df_menu['분류'] == category) & (df_menu['메뉴'] != current_menu)]

    if filtered_menus.empty:
        return jsonify({'error': '더 이상 추천 가능한 메뉴가 없습니다.'}), 404

    random = filtered_menus.sample(1).iloc[0]
    random_menu = random['메뉴']
    #random_img_url = url_for('static', filename=f'images/{random_menu}.jpg')
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
        # 크롤링 요청 및 정보 추출
        response = requests.get(place_url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        meta_tags = {meta.get('property') or meta.get('name'): meta.get('content') for meta in soup.find_all('meta')}
        
        place_name = meta_tags.get('og:title', 'N/A')
        place_address = meta_tags.get('og:description', 'N/A')
        place_url = meta_tags.get('og:url', place_url)  # 사용자가 제공한 URL을 기본값으로 설정
        
        # MySQL 연결 및 커서 생성
        mysql_connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='admin1234',
            database='pirates'
        )
        
        mysql_cursor = mysql_connection.cursor()
        
        # db와 비교
        mysql_query = "SELECT * FROM eat WHERE place_url = %s"
        mysql_cursor.execute(mysql_query, (place_url,))
        result = mysql_cursor.fetchone()
        
        if result:
            # 레코드가 존재하면 좋아요 수 증가
            mysql_query = "UPDATE eat SET likes = likes + 1 WHERE place_url = %s"
            mysql_cursor.execute(mysql_query, (place_url,))
            mysql_connection.commit()
            likes = result[4] + 1  # Assuming 'likes' is the 5th column
            
        else:
            # 레코드가 존재하지 않으면 새로 추가
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


# wear
@app.route('/wear')
def wear():
    return render_template('wear/wear.html')

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
    # 카테고리와 서브카테고리에 해당하는 URL 추출
    row = df_wear[(df_wear['Category'] == category) & (df_wear['Subcategory'] == subcategory)]
    
    if row.empty:
        print(f"No data found for category: {category} and subcategory: {subcategory}")
        return []
    
    url = row.iloc[0]['URL']
    xpath = row.iloc[0]['XPath']
    
    # 웹 드라이버 설정
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 브라우저 창을 열지 않음
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--log-level=3')

    # 드라이버 생성
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(url)
        WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.XPATH, xpath)))

        # XPath를 사용하여 요소가 클릭 가능할 때까지 대기
        category_element = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.XPATH, xpath)))
        
        # 클릭
        category_element.click()

        # 크롤링된 데이터 추출 (예: 텍스트 추출)
        i = random.randint(1, 100)
        print(f"Selecting item: {i}")
    
        # CSS 선택자에서 {i}를 포맷하여 사용
        try:
            element = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, f'#__next > div.css-1k28ov0.ezz7e2c0 > div.css-1rr4qq7.ezz7e2c2 > ul > li:nth-child({i})'))
            )
        except Exception as e:
            print(f"Error finding element with CSS selector: {e}")
            return []
        
        # 텍스트 및 이미지 URL 추출
        lines = element.text.split('\n')
        
        brand = lines[0]
        product_name = lines[1]
        price = lines[2]
        image_url = element.find_element(By.CSS_SELECTOR, 'div > a > div > img').get_attribute('src')
        buy_url = element.find_element(By.CSS_SELECTOR, 'div > a').get_attribute('href')
        
        # 결과를 딕셔너리 형태로 저장
        data = {
            "brand": brand,
            "product_name": product_name,
            "price": price,
            "image_url": image_url,
            "buy_url": buy_url,
            "likes": 0  # 초기 좋아요 수
        }
        print(f"Fetched item {i}: {brand}, {product_name}, {price}, {image_url}, {buy_url}")
        print(f"Crawled Data: {data}")
        
        return data

    except Exception as e:
        print(f"An error occurred: {e}")
        return []
    
    finally:
        driver.quit()  # 웹 드라이버 종료

@app.route('/categories/<prefix>')
def categories(prefix):
    categories = get_category_groups(prefix)
    return jsonify(categories)

@app.route('/subcategories/<category>')
def subcategories(category):
    subcategories = get_subcategories(category)
    return jsonify(subcategories)

@app.route('/recommend/<category>/<subcategory>')
def recommend(category, subcategory):
    data = get_crawl_data(category, subcategory)
    if not data:
        return render_template('wear/result.html', data=None)
    
    # 단일 데이터 딕셔너리의 리스트로 변환
    data_list = [data]
    
    return render_template('wear/result.html', data=data_list)

# 금액 형식
def extract_price(price_str):
    # 정규식을 사용하여 숫자와 ','를 추출
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
        # MySQL 연결 설정
        mysql_connection = mysql.connector.connect(**mysql_config)
        mysql_cursor = mysql_connection.cursor()
        
        # 상품이 이미 존재하는지 확인
        mysql_query = "SELECT likes FROM wear WHERE product_name = %s"
        mysql_cursor.execute(mysql_query, (product_name,))
        result = mysql_cursor.fetchone()

        if result:
            # 상품이 존재하면 좋아요 수 증가
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
        # 커서와 연결 종료
        mysql_cursor.close()
        mysql_connection.close()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)