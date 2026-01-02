from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

app_name = 'pet_shop'

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('signup/', views.signup, name='signup'),
    path('client_dashboard/', views.client_dashboard, name='client_dashboard'),
    path('about/', views.about, name='about'),
    path('news/', views.news, name='news'),
    path('demonstration/', views.demo, name='demo'),
    path('glossary/', views.glossary, name='glossary'),
    path('contacts/', views.contacts, name='contacts'),
    path('privacy/', views.privacy, name='privacy'),
    path('vacancies/', views.vacancies, name='vacancies'),
    path('reviews/', views.reviews, name='reviews'),
    path('add_review/', views.add_review, name='add_review'),
    path('promocodes/', views.promocodes, name='promocodes'),
    path('catalog/', views.catalog, name='catalog'),
    path('delete_from_cart/', views.delete_from_cart, name='delete_from_cart'),
    path('buy_product/', views.buy_product, name='buy_product'),
    path('statistics/', views.statistics_view, name='statistics'),
    path('add_product/', views.add_product, name='add_product'),
    path('update_cart_item_quantity/', views.update_cart_item_quantity, name='update_cart_item_quantity'),
    path('form_generator/', views.form_generator, name='form_generator'),
    path('contacts_table/', views.contacts_table, name='contacts_table'),
    path('api/employees/', views.get_employees_api, name='get_employees_api'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
