from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout, login as auth_login
from pet_shop.usecase import user as user_usecase, company as company_usecases
from . import models
import requests
from .forms import ProductForm
from datetime import datetime, timedelta
import calendar
from django.db.models import Count, Sum
from django.http import JsonResponse
import json


def add_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('pet_shop:add_product')
    else:
        form = ProductForm()

    return render(request, 'pet_shop/add_products.html', {'form': form})


def index(request):
    last = company_usecases.get_last_news()
    partners = models.Partner.objects.filter(is_active=True)
    products = models.Product.objects.all()
    slides = models.Slide.objects.filter(is_active=True)
    slider_settings = models.SliderSettings.load()

    return render(request, 'pet_shop/index.html', {
        'last': last,
        'partners': partners,
        'products': products,
        'slides': slides,
        'slider_settings': slider_settings,
    })


def about(request):
    company = models.CompanyInfo.objects.first()
    return render(request, 'pet_shop/company/about.html', {'company': company})


def news(request):
    return render(request, 'pet_shop/company/news.html', {'news': models.News.objects.all()})


def demo(request):
    return render(request, 'pet_shop/company/demonstration.html')


def glossary(request):
    return render(request, 'pet_shop/company/glossary.html', {'glossaries': company_usecases.get_glossaries()})


def contacts(request):
    random_dog_url = None
    try:
        response = requests.get('https://dog.ceo/api/breeds/image/random')
        if response.status_code == 200:
            data = response.json()
            random_dog_url = data.get('message')
    except Exception:
        pass
    
    employees = models.ServiceUser.objects.filter(is_employee=True).select_related('user')
    
    job_descriptions = [
        "Менеджер по продажам. Опыт работы с клиентами более 5 лет. Помогает подобрать оптимальные товары для ваших питомцев.",
        "Специалист по работе с клиентами. Консультирует по вопросам ухода за животными и подбора кормов.",
        "Консультант по подбору товаров. Эксперт в области аквариумистики и террариумистики.",
        "Администратор магазина. Координирует работу магазина и обеспечивает качественное обслуживание клиентов.",
        "Ветеринарный консультант. Оказывает профессиональные консультации по здоровью и питанию животных.",
        "Маркетолог. Разрабатывает маркетинговые стратегии и продвигает бренд компании.",
        "Логист. Отвечает за доставку товаров и управление складскими запасами.",
        "Финансовый менеджер. Управляет финансовыми потоками и анализирует экономические показатели."
    ]
    
    employees_list = list(employees)
    for idx, employee in enumerate(employees_list):
        if not employee.address:
            employee.job_description = job_descriptions[idx % len(job_descriptions)]
        else:
            employee.job_description = employee.address
    
    context = {
        'employees': employees_list,
        'random_dog_url': random_dog_url
    }
    return render(request, 'pet_shop/company/contacts.html', context)


def privacy(request):
    return render(request, 'pet_shop/company/privacy.html')


def vacancies(request):
    return render(request, 'pet_shop/company/vacancies.html', {'vacancies': company_usecases.get_vacancies()})


def reviews(request):
    return render(request, 'pet_shop/company/reviews.html', {'reviews': company_usecases.get_reviews()})


def add_review(request):
    data = {
        "rate": request.POST.get("rate", ""),
        "text": request.POST.get("text", ""),
        "customer": models.ServiceUser.objects.filter(id=request.session['id']).first()
    }
    company_usecases.create_review(data)
    return render(request, 'pet_shop/company/reviews.html', {'reviews': company_usecases.get_reviews()})


def promocodes(request):
    from django.utils import timezone
    now = timezone.now()
    all_coupons = models.Coupon.objects.all()
    active_coupons = all_coupons.filter(deadline__gte=now)
    archived_coupons = all_coupons.filter(deadline__lt=now)
    return render(request, 'pet_shop/company/promocodes.html', {
        'active_coupons': active_coupons,
        'archived_coupons': archived_coupons
    })


def login(request):
    if request.method == 'POST':
        data = {
            "email": request.POST.get("email", ""),
            "password": request.POST.get("password", "")
        }
        user, err = user_usecase.sign_in(data)

        if err is None:
            auth_login(request, user.user)
            request.session["role"] = "user"
            request.session["id"] = user.id
            return redirect('/')
        else:
            return render(request, "pet_shop/auth/login.html", {"error": err})

    return render(request, 'pet_shop/auth/login.html')


def signup(request):
    if request.method == 'POST':
        data = {
            "email": request.POST.get("email", ""),
            "password": request.POST.get("password", ""),
            "username": request.POST.get("username", ""),
            "phone": request.POST.get("phone", ""),
            "birthday_date": request.POST.get("birthday", "")
        }

        user, err = user_usecase.sign_up(data)

        if err:
            return render(request, "pet_shop/auth/signup.html", {
                "error": err,
                "form_data": data
            })

        auth_login(request, user.user)
        if user.is_employee:
            request.session["role"] = "employee"
        else:
            request.session["role"] = "user"
        request.session["id"] = user.id
        return redirect('/')

    return render(request, "pet_shop/auth/signup.html", {"error": ""})


@login_required
def logout(request):
    auth_logout(request)

    if 'role' in request.session:
        del request.session['role']
    if 'id' in request.session:
        del request.session['id']

    request.session.flush()

    return redirect('/')


@login_required
def client_dashboard(request):
    user = request.user
    shopping_cart_items = models.ShoppingCart.objects.filter(user__user=user)
    context = {
        'user': user,
        'products': shopping_cart_items
    }
    return render(request, 'pet_shop/client_dashboard.html', context)


def catalog(request):
    if request.method == 'POST' and request.user.is_authenticated:
        try:
            product_id = request.POST.get('product_id')
            product = models.Product.objects.get(pk=product_id)

            if product.quantity > 0:
                user = request.user.serviceuser
                cart_item, created = models.ShoppingCart.objects.get_or_create(
                    user=user,
                    product=product
                )

                if created:
                    cart_item.quantity = 1
                else:
                    if cart_item.quantity < product.quantity + cart_item.quantity:
                        cart_item.quantity += 1
                cart_item.save()

                product.quantity -= 1
                product.save()

        except Exception as e:
            pass

    products = models.Product.objects.all()
    return render(request, 'pet_shop/catalog.html', {'products': products})


@login_required
def update_cart_item_quantity(request):
    cart_item_id = request.POST.get('cart_item_id')
    action = request.POST.get('action')

    try:
        cart_item = models.ShoppingCart.objects.get(id=cart_item_id, user__user=request.user)
        product = cart_item.product

        if action == 'increase' and product.quantity > 0:
            cart_item.quantity += 1
            product.quantity -= 1
        elif action == 'decrease' and cart_item.quantity > 1:
            cart_item.quantity -= 1
            product.quantity += 1

        cart_item.save()
        product.save()
    except models.ShoppingCart.DoesNotExist:
        pass

    return redirect('pet_shop:client_dashboard')


@login_required
def delete_from_cart(request):
    if request.method == 'POST':
        cart_item_id = request.POST.get('cart_item_id')
        try:
            cart_item = models.ShoppingCart.objects.get(id=cart_item_id, user__user=request.user)
            product = cart_item.product
            product.quantity += cart_item.quantity - 1
            product.save()
            cart_item.delete()
        except models.ShoppingCart.DoesNotExist:
            pass
    return redirect('pet_shop:client_dashboard')


@login_required
def buy_product(request):
    if request.method == 'POST':
        cart_item_id = request.POST.get('cart_item_id')
        try:
            cart_item = models.ShoppingCart.objects.get(id=cart_item_id, user__user=request.user)
            user = request.user.serviceuser

            total_price = cart_item.get_total_price()

            if user.balance >= total_price:
                user.balance -= total_price
                user.save()

                models.Order.objects.create(
                    user=user,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    total_price=total_price
                )

                cart_item.delete()
                return redirect('pet_shop:client_dashboard')
            else:
                shopping_cart_items = models.ShoppingCart.objects.filter(user__user=request.user)
                return render(request, 'pet_shop/client_dashboard.html', {
                    'user': request.user,
                    'products': shopping_cart_items,
                    'error': 'Недостаточно средств на счете'
                })
        except models.ShoppingCart.DoesNotExist:
            pass
    return redirect('pet_shop:client_dashboard')


@login_required
def statistics_view(request):
    if request.user.serviceuser.is_employee:
        today = datetime.now()
        current_year = today.year
        current_month = today.month
        current_day = today.day

        cal = calendar.Calendar(firstweekday=0)
        month_days = cal.monthdayscalendar(current_year, current_month)

        calendar_weeks = []
        for week in month_days:
            calendar_week = []
            for day in week:
                if day == 0:
                    calendar_week.append({
                        'day': '',
                        'month': 'other'
                    })
                else:
                    calendar_week.append({
                        'day': day,
                        'month': current_month
                    })
            calendar_weeks.append(calendar_week)

        month_names = [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ]
        current_month_name = month_names[current_month - 1]

        current_month_start = datetime(current_year, current_month, 1)
        next_month_start = datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime(
            current_year + 1, 1, 1)

        top_products = models.Order.objects.filter(
            created_at__gte=current_month_start,
            created_at__lt=next_month_start
        ).values('product__name').annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]

        one_year_ago = today - timedelta(days=365)

        last_year_orders = models.Order.objects.filter(
            created_at__gte=one_year_ago
        )

        monthly_sales_data = []
        for i in range(12):
            month = current_month - i
            year = current_year
            if month <= 0:
                month += 12
                year -= 1

            if month == 12:
                month_start = datetime(year, month, 1)
                month_end = datetime(year + 1, 1, 1)
            else:
                month_start = datetime(year, month, 1)
                month_end = datetime(year, month + 1, 1)

            month_orders = last_year_orders.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            )

            total_orders = month_orders.count()
            total_quantity = month_orders.aggregate(total=Sum('quantity'))['total'] or 0

            monthly_sales_data.append({
                'month': month_names[month - 1],
                'year': year,
                'total_orders': total_orders,
                'total_quantity': total_quantity
            })

        monthly_sales_data.reverse()

        monthly_sales_max = max([ms['total_orders'] for ms in monthly_sales_data]) if monthly_sales_data else 1

        context = {
            'users_count': models.ServiceUser.objects.count(),
            'products_count': models.Product.objects.count(),
            'orders_count': models.Order.objects.count(),
            'total_revenue': sum(float(order.total_price) for order in models.Order.objects.all()),
            'service_users': models.ServiceUser.objects.select_related('user').all(),
            'products': models.Product.objects.all(),
            'orders': models.Order.objects.select_related('user__user', 'product').all(),
            'reviews': models.Review.objects.select_related('customer__user').all(),
            'coupons': models.Coupon.objects.all(),
            'vacancies': models.Vacancy.objects.select_related('info').all(),
            'calendar_weeks': calendar_weeks,
            'current_month_name': current_month_name,
            'current_year': current_year,
            'current_month': current_month,
            'current_day': current_day,
            'top_products': top_products,
            'monthly_sales': monthly_sales_data,
            'monthly_sales_max': monthly_sales_max,
        }

        return render(request, 'pet_shop/statistics.html', context)
    else:
        return redirect('pet_shop:client_dashboard')


@login_required
def form_generator(request):
    if not request.user.serviceuser.is_employee:
        return redirect('pet_shop:client_dashboard')
    return render(request, 'pet_shop/form_generator.html')


def contacts_table(request):
    return render(request, 'pet_shop/company/contacts_table.html')


def get_employees_api(request):
    employees = models.ServiceUser.objects.filter(is_employee=True).select_related('user')
    
    job_descriptions = [
        "Менеджер по продажам. Опыт работы с клиентами более 5 лет. Помогает подобрать оптимальные товары для ваших питомцев.",
        "Специалист по работе с клиентами. Консультирует по вопросам ухода за животными и подбора кормов.",
        "Консультант по подбору товаров. Эксперт в области аквариумистики и террариумистики.",
        "Администратор магазина. Координирует работу магазина и обеспечивает качественное обслуживание клиентов.",
        "Ветеринарный консультант. Оказывает профессиональные консультации по здоровью и питанию животных.",
        "Маркетолог. Разрабатывает маркетинговые стратегии и продвигает бренд компании.",
        "Логист. Отвечает за доставку товаров и управление складскими запасами.",
        "Финансовый менеджер. Управляет финансовыми потоками и анализирует экономические показатели."
    ]
    
    employees_data = []
    for idx, employee in enumerate(employees):
        full_name = employee.user.get_full_name() or employee.user.username
        employees_data.append({
            'id': employee.id,
            'full_name': full_name,
            'username': employee.user.username,
            'email': employee.user.email or '',
            'phone': employee.phone or '',
            'description': employee.address if employee.address else job_descriptions[idx % len(job_descriptions)],
            'pic_url': employee.pic.url if employee.pic else None,
            'pic_name': employee.pic.name if employee.pic else None,
        })
    
    return JsonResponse({'employees': employees_data}, safe=False)
