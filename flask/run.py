import pandas as pd
from flask import Flask, request, url_for, jsonify, render_template
from flask_project.routes import main_bp
from pyngrok import conf, ngrok

app = Flask(__name__, template_folder='flask_project/templates/', static_folder='flask_project/static')
app.register_blueprint(main_bp)

conf.get_default().auth_token = "2jxbjtHJxUYjGJuHlk8r4zQXce1_6sLAdhq7W1HVtTEkWcKGr" # 추가된 부분
http_tunnel = ngrok.connect(5000)
tunnels = ngrok.get_tunnels()

# csv 읽어오기
df = pd.read_csv('./flask_project/static/data/food_menus.csv', encoding='utf-8')

# 메뉴 카테고리 선택
@app.route('/eat')
def eat():
   return render_template('eat/eat.html')

# 랜덤으로 메뉴 추천
@app.route('/get_random_menu', methods=['GET'])
def get_random_menu():  
   # request로 부터 category
   category = request.args.get('category')
   filtered_menus = df[df['분류'] == category]
    
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
   filtered_menus = df[(df['분류'] == category) & (df['메뉴'] != current_menu)]

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


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)

