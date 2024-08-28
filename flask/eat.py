import pandas as pd
import requests
import logging
import mysql.connector

from bs4 import BeautifulSoup
from flask import Flask, request, url_for, jsonify, render_template
from flask_project.routes import main_bp

app = Flask(__name__, template_folder='flask_project/templates/', static_folder='flask_project/static')
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

@app.route('/eat')
def eat():
    return render_template('eat/eat.html')

@app.route('/get_random_menu', methods=['GET'])
def get_random_menu():
    category = request.args.get('category')
    filtered_menus = df_menu[df_menu['분류'] == category]
    
    if filtered_menus.empty:
        message = "더 이상 추천 가능한 메뉴가 없습니다."
        return render_template('eat/eat.html', message=message)

    random = filtered_menus.sample(1).iloc[0]
    random_menu = random['메뉴']
    random_img_url = url_for('static', filename=f'images/food_images/{random_menu}.jpg')
    
    return jsonify({'menu': random_menu, 'url': random_img_url})

@app.route('/get_another_menu', methods=['GET'])
def get_another_menu():
    category = request.args.get('category')
    current_menu = request.args.get('current_menu')
    filtered_menus = df_menu[(df_menu['분류'] == category) & (df_menu['메뉴'] != current_menu)]

    if filtered_menus.empty:
        return jsonify({'error': '더 이상 추천 가능한 메뉴가 없습니다.'}), 404

    random = filtered_menus.sample(1).iloc[0]
    random_menu = random['메뉴']
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


        
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)