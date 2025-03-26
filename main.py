from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import re
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados MySQL (Usando variável de ambiente para Railway)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'mysql+pymysql://root:password@localhost/projetopy')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo do usuário
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # "barber" ou "client"

# Função para validar os dados de cadastro
def validate_registration(data):
    errors = []

    name = data.get('name', '').strip()
    if not name or len(name) < 3 or len(name) > 50 or not re.match(r'^[A-Za-zÀ-ÿ\s]+$', name):
        errors.append("Nome inválido. Deve conter apenas letras e ter entre 3 e 50 caracteres.")

    email = data.get('email', '').strip()
    if not email or len(email) > 100 or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        errors.append("Email inválido.")

    password = data.get('password', '')
    if not password or len(password) < 8 or len(password) > 20 or not re.search(r'[A-Z]', password) or not re.search(r'\d', password):
        errors.append("Senha inválida. Deve ter entre 8 e 20 caracteres, uma letra maiúscula e um número.")

    confirm_password = data.get('confirmPassword', '')
    if password != confirm_password:
        errors.append("As senhas não coincidem.")

    phone = data.get('phone', '').strip()
    if not phone or len(phone) > 15:
        errors.append("Telefone inválido.")

    user_type = data.get('type', '')
    if user_type not in ['barber', 'client']:
        errors.append("Tipo de usuário inválido.")

    return errors

@app.route('/users', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Nenhum dado fornecido"}), 400

    errors = validate_registration(data)
    if errors:
        return jsonify({"errors": errors}), 400

    if User.query.filter_by(email=data['email'].strip()).first():
        return jsonify({"error": "Email já cadastrado."}), 400

    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        name=data['name'].strip(),
        email=data['email'].strip(),
        password=hashed_password,
        phone=data['phone'].strip(),
        type=data['type']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuário cadastrado com sucesso!"}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
