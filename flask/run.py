from flask import Flask
from flask_project.routes import main_bp

app = Flask(__name__, template_folder='flask_project/templates')
app.register_blueprint(main_bp)

if __name__ == "__main__":
    app.run(debug=True)
