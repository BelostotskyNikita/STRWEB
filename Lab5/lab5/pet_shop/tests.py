from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from django.contrib.sessions.middleware import SessionMiddleware
from .models import ServiceUser, Product, ShoppingCart, Order, Review
from .views import (
    index, about, news, glossary, contacts, privacy, vacancies, reviews,
    add_review, promocodes, login, signup, logout, client_dashboard,
    catalog, delete_from_cart, buy_product, statistics_view, add_product
)
from unittest.mock import patch


class ViewTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.service_user = ServiceUser.objects.create(
            user=self.user,
            is_employee=False,
            balance=100.00
        )

        self.employee_user = User.objects.create_user(
            username='employee',
            password='employeepass'
        )
        self.employee_service_user = ServiceUser.objects.create(
            user=self.employee_user,
            is_employee=True
        )

        self.product = Product.objects.create(
            name='Test Product',
            price=10.00,
            quantity=5
        )

        self.cart_item = ShoppingCart.objects.create(
            user=self.service_user,
            product=self.product,
            quantity=1
        )

    def add_session_to_request(self, request, user=None):
        middleware = SessionMiddleware(lambda req: None)
        middleware.process_request(request)
        request.session.save()

        if user:
            request.user = user
            request.session['role'] = 'employee' if user.serviceuser.is_employee else 'user'
            request.session['id'] = user.serviceuser.id

    def test_index_view(self):
        request = self.factory.get('/')
        response = index(request)
        self.assertEqual(response.status_code, 200)

    def test_about_view(self):
        request = self.factory.get('/about/')
        response = about(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('about', response.context_data)

    def test_news_view(self):
        request = self.factory.get('/news/')
        response = news(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('news', response.context_data)

    def test_glossary_view(self):
        request = self.factory.get('/glossary/')
        response = glossary(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('glossaries', response.context_data)

    @patch('requests.get')
    def test_contacts_view(self, mock_get):
        mock_response = mock_get.return_value
        mock_response.status_code = 200
        mock_response.json.return_value = {'message': 'http://test.dog.image'}

        request = self.factory.get('/contacts/')
        response = contacts(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn('contacts', response.context_data)
        self.assertIn('random_dog_url', response.context_data)

    def test_privacy_view(self):
        request = self.factory.get('/privacy/')
        response = privacy(request)
        self.assertEqual(response.status_code, 200)

    def test_vacancies_view(self):
        request = self.factory.get('/vacancies/')
        response = vacancies(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('vacancies', response.context_data)

    def test_reviews_view(self):
        request = self.factory.get('/reviews/')
        response = reviews(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('reviews', response.context_data)

    def test_add_review_view(self):
        request = self.factory.post('/add_review/', {
            'rate': 5,
            'text': 'Great service!'
        })
        self.add_session_to_request(request, self.user)

        response = add_review(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Review.objects.count(), 1)

    def test_promocodes_view(self):
        request = self.factory.get('/promocodes/')
        response = promocodes(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('promocodes', response.context_data)

    def test_login_view_get(self):
        request = self.factory.get('/login/')
        response = login(request)
        self.assertEqual(response.status_code, 200)

    def test_login_view_post_success(self):
        request = self.factory.post('/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.add_session_to_request(request)

        with patch('pet_shop.usecase.user.sign_in') as mock_sign_in:
            mock_sign_in.return_value = (self.service_user, None)
            response = login(request)
            self.assertEqual(response.status_code, 302)  # redirect

    def test_signup_view_get(self):
        request = self.factory.get('/signup/')
        response = signup(request)
        self.assertEqual(response.status_code, 200)

    def test_logout_view(self):
        request = self.factory.get('/logout/')
        self.add_session_to_request(request, self.user)

        response = logout(request)
        self.assertEqual(response.status_code, 302)
        self.assertNotIn('role', request.session)

    def test_client_dashboard_view(self):
        request = self.factory.get('/dashboard/')
        self.add_session_to_request(request, self.user)

        response = client_dashboard(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('user', response.context_data)
        self.assertIn('products', response.context_data)

    def test_catalog_view_get(self):
        request = self.factory.get('/catalog/')
        self.add_session_to_request(request, self.user)

        response = catalog(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('products', response.context_data)

    def test_catalog_view_post_add_to_cart(self):
        request = self.factory.post('/catalog/', {
            'product_id': self.product.id
        })
        self.add_session_to_request(request, self.user)

        response = catalog(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ShoppingCart.objects.count(), 1)

    def test_delete_from_cart_view(self):
        request = self.factory.post('/delete_from_cart/', {
            'cart_item_id': self.cart_item.id
        })
        self.add_session_to_request(request, self.user)

        response = delete_from_cart(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(ShoppingCart.objects.count(), 0)

    def test_buy_product_view_success(self):
        request = self.factory.post('/buy_product/', {
            'cart_item_id': self.cart_item.id
        })
        self.add_session_to_request(request, self.user)

        response = buy_product(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(ShoppingCart.objects.count(), 0)

    def test_statistics_view_employee_access(self):
        request = self.factory.get('/statistics/')
        self.add_session_to_request(request, self.employee_user)

        response = statistics_view(request)
        self.assertEqual(response.status_code, 200)

    def test_statistics_view_non_employee_access(self):
        request = self.factory.get('/statistics/')
        self.add_session_to_request(request, self.user)

        response = statistics_view(request)
        self.assertEqual(response.status_code, 403)  # Forbidden

    def test_add_product_view_get(self):
        request = self.factory.get('/add_product/')
        self.add_session_to_request(request, self.employee_user)

        response = add_product(request)
        self.assertEqual(response.status_code, 200)

    @patch('pet_shop.forms.ProductForm.is_valid', return_value=True)
    @patch('pet_shop.forms.ProductForm.save')
    def test_add_product_view_post(self, mock_save, mock_valid):
        request = self.factory.post('/add_product/', {})
        self.add_session_to_request(request, self.employee_user)

        response = add_product(request)
        self.assertEqual(response.status_code, 302)  # redirect