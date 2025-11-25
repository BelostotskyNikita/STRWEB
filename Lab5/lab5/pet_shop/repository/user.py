from pet_shop.models import ServiceUser
from django.contrib.auth.models import User


def create_user(data):
    birthday = data.pop('birthday_date', None)
    phone = data.pop('phone', None)
    user = User.objects.create(**data)
    new_data = {"user": user, "birthday_date": birthday, "phone": phone}
    return ServiceUser.objects.create(**new_data)


def get_user_by_username(username):
    try:
        return ServiceUser.objects.get(username=username)
    except ServiceUser.DoesNotExist:
        return None


def get_user_by_email(eml):
    try:
        return ServiceUser.objects.get(user__email=eml)
    except ServiceUser.DoesNotExist:
        return None


def get_employees():
    try:
        return ServiceUser.objects.filter(is_employee=True)
    except Exception:
        return []
