from pet_shop.repository import user as user_db
import datetime
from django.core.exceptions import ValidationError
from django.core.validators import validate_email


def sign_up(data):
    birth_date = datetime.datetime.strptime(data["birthday_date"], "%Y-%m-%d")
    today = datetime.datetime.now()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    if age < 18:
        return None, "You must be at least 18 years old"
    if len(data["username"]) < 4:
        return None, "Name must be longer than 4 characters"
    if len(data["phone"]) != 13:
        return None, "Invalid phone number format"
    if not data["phone"].startswith("+37529"):
        return None, "Phone number must start with +37529"
    if len(data["email"]) < 7:
        return None, "Email must be longer than 7 characters"
    if len(data["password"]) < 8:
        return None, "Password must be at least 8 characters long"
    user = user_db.get_user_by_email(data["email"])
    if user is None:
        user = user_db.create_user(data)  
        return user, None
    return None, "User already exists"


def sign_in(data):
    email = data["email"]
    password = data["password"]
    try:
        validate_email(email)
    except ValidationError:
        return None, "Wrong email"
    if len(data["password"]) < 8:
        return None, "Password must be at least 8 characters long"    
    user = user_db.get_user_by_email(email)
    if user is None:
        return None, "User not found"
    if user.user.password != password:
        return None, "Wrong password"
    return user, None


def get_user(email):
    return user_db.get_user_by_email(email)
