from flask import render_template
from flask import Blueprint

main_bp = Blueprint('main', __name__)

@main_bp.route('/eat')
def what_to_eat():
    return render_template('eat/eat.html', choices=['Pizza', 'Burger', 'Sushi'])

@main_bp.route('/wear')
def what_to_wear():
    return render_template('wear/wear.html', choices=['Jeans', 'T-Shirt', 'Jacket'])

@main_bp.route('/watch')
def what_to_watch():
    return render_template('watch/watch.html', choices=['Movie', 'Series', 'Documentary'])
