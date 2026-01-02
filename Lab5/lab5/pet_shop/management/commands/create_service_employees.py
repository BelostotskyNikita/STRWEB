from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from pet_shop.models import ServiceUser
import django.utils.timezone as timezone


class Command(BaseCommand):
    help = 'Creates 10 employees in the ServiceUser table'

    def handle(self, *args, **options):
        employees_data = [
            {
                'username': 'ivanov',
                'first_name': 'Иван',
                'last_name': 'Иванов',
                'email': 'ivanov@example.com',
                'phone': '+375 (29) 111-22-33',
                'description': 'Менеджер по продажам. Опыт работы с клиентами более 5 лет. Помогает подобрать оптимальные товары для ваших питомцев.'
            },
            {
                'username': 'petrova',
                'first_name': 'Мария',
                'last_name': 'Петрова',
                'email': 'petrova@example.com',
                'phone': '8 (029) 2223344',
                'description': 'Специалист по работе с клиентами. Консультирует по вопросам ухода за животными и подбора кормов.'
            },
            {
                'username': 'sidorov',
                'first_name': 'Алексей',
                'last_name': 'Сидоров',
                'email': 'sidorov@example.com',
                'phone': '+375 (29) 333-44-55',
                'description': 'Консультант по подбору товаров. Эксперт в области аквариумистики и террариумистики.'
            },
            {
                'username': 'kozlova',
                'first_name': 'Елена',
                'last_name': 'Козлова',
                'email': 'kozlova@example.com',
                'phone': '80295556677',
                'description': 'Администратор магазина. Координирует работу магазина и обеспечивает качественное обслуживание клиентов.'
            },
            {
                'username': 'morozov',
                'first_name': 'Дмитрий',
                'last_name': 'Морозов',
                'email': 'morozov@example.com',
                'phone': '+375 (29) 777-88-99',
                'description': 'Ветеринарный консультант. Оказывает профессиональные консультации по здоровью и питанию животных.'
            },
            {
                'username': 'novikova',
                'first_name': 'Анна',
                'last_name': 'Новикова',
                'email': 'novikova@example.com',
                'phone': '8 (029) 8889900',
                'description': 'Маркетолог. Разрабатывает маркетинговые стратегии и продвигает бренд компании.'
            },
            {
                'username': 'volkov',
                'first_name': 'Сергей',
                'last_name': 'Волков',
                'email': 'volkov@example.com',
                'phone': '+375 (29) 999-00-11',
                'description': 'Логист. Отвечает за доставку товаров и управление складскими запасами.'
            },
            {
                'username': 'smirnova',
                'first_name': 'Ольга',
                'last_name': 'Смирнова',
                'email': 'smirnova@example.com',
                'phone': '80291112233',
                'description': 'Финансовый менеджер. Управляет финансовыми потоками и анализирует экономические показатели.'
            },
            {
                'username': 'lebedev',
                'first_name': 'Андрей',
                'last_name': 'Лебедев',
                'email': 'lebedev@example.com',
                'phone': '+375 (29) 123-45-67',
                'description': 'Специалист по закупкам. Отвечает за формирование ассортимента и работу с поставщиками.'
            },
            {
                'username': 'fedorova',
                'first_name': 'Татьяна',
                'last_name': 'Федорова',
                'email': 'fedorova@example.com',
                'phone': '8 (029) 2345678',
                'description': 'HR-менеджер. Занимается подбором персонала и развитием корпоративной культуры.'
            }
        ]

        created_count = 0
        for emp_data in employees_data:
            username = emp_data['username']
            email = emp_data['email']
            
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': emp_data['first_name'],
                    'last_name': emp_data['last_name']
                }
            )
            
            if not user_created:
                user.email = email
                user.first_name = emp_data['first_name']
                user.last_name = emp_data['last_name']
                user.save()
            
            service_user, service_user_created = ServiceUser.objects.get_or_create(
                user=user,
                defaults={
                    'phone': emp_data['phone'],
                    'address': emp_data['description'],
                    'is_employee': True,
                    'birthday_date': timezone.now().date()
                }
            )
            
            if not service_user_created:
                service_user.phone = emp_data['phone']
                service_user.address = emp_data['description']
                service_user.is_employee = True
                service_user.save()
            
            if user_created or service_user_created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Создан сотрудник: {emp_data["first_name"]} {emp_data["last_name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Сотрудник уже существует: {emp_data["first_name"]} {emp_data["last_name"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nСоздано сотрудников: {created_count} из {len(employees_data)}')
        )


