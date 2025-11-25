from django.shortcuts import get_object_or_404
from pet_shop.models import Product, ServiceUser
from django.db import transaction


def create(data):
    if Product.objects.filter(number=data["number"]).exists():
        return None

    with transaction.atomic():
        user_id = data.pop('user_id')
        product = Product.objects.create(**data)
        service_user = get_object_or_404(ServiceUser, id=user_id)
        product.owners.add(service_user)
        return product
    return None


def update(product_id, data):
    product = get_object_or_404(Product, id=product_id)
    for field, value in data.items():
        setattr(product, field, value)
    product.save()
    return product


def read(product_id):
    return get_object_or_404(Product, id=product_id)


def delete(product_id):
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return True
