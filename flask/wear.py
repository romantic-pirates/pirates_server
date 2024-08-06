import pandas as pd
import random
import mysql.connector
import re

from flask import Flask, render_template, jsonify, request
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

app = Flask(__name__, template_folder='flask_project/templates/', static_folder='flask_project/static')

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

# CSV 파일 읽기
df_wear = pd.read_csv('./flask_project/static/data/wear_categories.csv', encoding='utf-8')

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
    brand  = data.get('brand')
    product_name  = data.get('product_name')
    price_str  = data.get('price')
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
        mysql_query = "SELECT likes FROM wear WHERE product_name  = %s"
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
            likes = 1
            return jsonify({"success": True, "likes": 1})
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"success": False, "message": "Database error"}), 500
    finally:
        # 커서와 연결 종료
        mysql_cursor.close()
        mysql_connection.close()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)