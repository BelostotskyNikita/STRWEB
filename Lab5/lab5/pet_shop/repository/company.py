from pet_shop.models import CompanyInfo, News, Review, Contact, Coupon, Vacancy, FAQ


def get_company_info():
    return CompanyInfo.objects.first()


def get_last_news():
    return News.objects.all().last


def get_reviews():
    return Review.objects.all()


def create_review(data):
    return Review.objects.create(**data)


def get_contacts():
    return Contact.objects.all()


def get_promocodes():
    return Coupon.objects.all()


def get_glossaries():
    return FAQ.objects.all()


def get_vacancies():
    return Vacancy.objects.all()
