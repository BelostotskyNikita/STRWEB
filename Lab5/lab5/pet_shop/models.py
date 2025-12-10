from django.db import models
from django.contrib.auth.models import User
import django.utils.timezone as timezone


class ServiceUser(models.Model):
    user: User = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_employee = models.BooleanField(default=False)
    birthday_date = models.DateField(default=timezone.now)
    balance = models.IntegerField(default=0)
    pic = models.ImageField(upload_to='pet_shop/images/avatar/', null=True)

    def get_full_name(self):
        return self.user.get_full_name()

    def __str__(self):
        return self.user.username


class VacancyInfo(models.Model):
    info = models.TextField()

    def __str__(self):
        return f"Информация о вакансии: {self.info[:50]}..." if len(self.info) > 50 else self.info


class Vacancy(models.Model):
    name = models.TextField()
    salary = models.FloatField()
    info = models.OneToOneField(VacancyInfo, primary_key=True, on_delete=models.CASCADE)

    def __str__(self):
        return f"Вакансия: {self.name} ({self.salary} $.)"


class Contact(models.Model):
    full_name = models.CharField(max_length=255, verbose_name='Full Name', default='')
    email = models.EmailField(verbose_name='Email', default='')
    phone = models.CharField(max_length=50, verbose_name='Phone', default='')
    description = models.TextField(verbose_name='Job Description', default='')
    pic = models.ImageField(upload_to='pet_shop/images/contacts/', blank=True, null=True, verbose_name='Photo')
    url = models.URLField(blank=True, null=True, verbose_name='URL')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    
    class Meta:
        ordering = ['full_name']
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'
    
    def __str__(self):
        return self.full_name or 'Contact'


class CompanyInfo(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название компании")
    description = models.TextField(verbose_name="Информация о компании", blank=True, null=True)
    logo = models.ImageField(upload_to='pet_shop/images/logo/', blank=True, null=True, verbose_name="Логотип")
    video = models.FileField(upload_to='pet_shop/videos/', blank=True, null=True, verbose_name="Видео компании")
    history = models.TextField(blank=True, null=True, verbose_name="История по годам")
    requisites = models.TextField(blank=True, null=True, verbose_name="Реквизиты")
    certificate = models.TextField(blank=True, null=True, verbose_name="Сертификат")

    def __str__(self):
        return self.name


class News(models.Model):
    title = models.TextField()
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    pic = models.ImageField(upload_to='pet_shop/images/news/', null=True)

    def __str__(self):
        return f"Новость: {self.title} ({self.date.strftime('%d.%m.%Y')})"


class FAQ(models.Model):
    text = models.TextField()
    answer = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Вопрос: {self.text[:50]}..." if len(self.text) > 50 else self.text


class Review(models.Model):
    customer = models.ForeignKey(ServiceUser, on_delete=models.CASCADE)
    rate = models.IntegerField()
    text = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Отзыв от {self.customer.user.username}: {self.rate}★ ({self.date.strftime('%d.%m.%Y')})"


class Coupon(models.Model):
    number = models.IntegerField()
    deadline = models.DateTimeField(auto_now_add=True)
    discount = models.IntegerField()

    def __str__(self):
        return f"Купон #{self.number}: скидка {self.discount}% (до {self.deadline.strftime('%d.%m.%Y')})"


class Product(models.Model):
    article = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=100)
    quantity = models.IntegerField()
    description = models.TextField()
    pic = models.ImageField(upload_to='pet_shop/images/products/', null=True)

    def __str__(self):
        return self.name


class ShoppingCart(models.Model):
    user = models.ForeignKey(ServiceUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def get_total_price(self):
        return self.product.price * self.quantity


class Order(models.Model):
    user = models.ForeignKey('ServiceUser', on_delete=models.CASCADE)
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        return f"Заказ #{self.id} - {self.product.name}"


class Partner(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название компании")
    logo = models.ImageField(upload_to='pet_shop/images/partners/', verbose_name="Логотип")
    website = models.URLField(verbose_name="Ссылка на сайт")
    is_active = models.BooleanField(default=True, verbose_name="Активный")
    order = models.IntegerField(default=0, verbose_name="Порядок отображения")

    class Meta:
        verbose_name = "Партнер"
        verbose_name_plural = "Партнеры"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Slide(models.Model):
    image = models.ImageField(upload_to='pet_shop/images/banner/', verbose_name="Изображение")
    caption = models.CharField(max_length=255, blank=True, null=True, verbose_name="Подпись")
    link = models.URLField(blank=True, null=True, verbose_name="Ссылка")
    order = models.IntegerField(default=0, verbose_name="Порядок отображения")
    is_active = models.BooleanField(default=True, verbose_name="Активный")

    class Meta:
        verbose_name = "Слайд"
        verbose_name_plural = "Слайды"
        ordering = ['order']

    def __str__(self):
        return f"Слайд {self.order + 1}: {self.caption or 'Без подписи'}"


class SliderSettings(models.Model):
    loop = models.BooleanField(default=True, verbose_name="Зацикливание (loop)")
    navs = models.BooleanField(default=True, verbose_name="Стрелки навигации (navs)")
    pags = models.BooleanField(default=True, verbose_name="Пагинация (pags)")
    auto = models.BooleanField(default=True, verbose_name="Автопереключение (auto)")
    stop_mouse_hover = models.BooleanField(default=True, verbose_name="Остановка при наведении (stopMouseHover)")
    delay = models.IntegerField(default=5, verbose_name="Задержка в секундах (delay)")

    class Meta:
        verbose_name = "Настройки слайдера"
        verbose_name_plural = "Настройки слайдера"

    def __str__(self):
        return "Настройки слайдера"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj