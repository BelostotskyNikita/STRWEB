from django.core.management.base import BaseCommand
from pet_shop.models import Contact


class Command(BaseCommand):
    help = 'Creates 10 employees in the Contact table'

    def handle(self, *args, **options):
        employees_data = [
            {
                'full_name': 'Иванов Иван Иванович',
                'email': 'ivanov@example.com',
                'phone': '+375 (29) 111-22-33',
                'description': 'Менеджер по продажам. Опыт работы с клиентами более 5 лет. Помогает подобрать оптимальные товары для ваших питомцев.',
                'url': 'http://example.com/profile.php'
            },
            {
                'full_name': 'Петрова Мария Сергеевна',
                'email': 'petrova@example.com',
                'phone': '8 (029) 2223344',
                'description': 'Специалист по работе с клиентами. Консультирует по вопросам ухода за животными и подбора кормов.',
                'url': 'http://example.com/employee.html'
            },
            {
                'full_name': 'Сидоров Алексей Петрович',
                'email': 'sidorov@example.com',
                'phone': '+375 (29) 333-44-55',
                'description': 'Консультант по подбору товаров. Эксперт в области аквариумистики и террариумистики.',
                'url': 'http://example.com/consultant.php'
            },
            {
                'full_name': 'Козлова Елена Владимировна',
                'email': 'kozlova@example.com',
                'phone': '80295556677',
                'description': 'Администратор магазина. Координирует работу магазина и обеспечивает качественное обслуживание клиентов.',
                'url': 'http://example.com/admin.html'
            },
            {
                'full_name': 'Морозов Дмитрий Александрович',
                'email': 'morozov@example.com',
                'phone': '+375 (29) 777-88-99',
                'description': 'Ветеринарный консультант. Оказывает профессиональные консультации по здоровью и питанию животных.',
                'url': 'http://example.com/vet.php'
            },
            {
                'full_name': 'Новикова Анна Игоревна',
                'email': 'novikova@example.com',
                'phone': '8 (029) 8889900',
                'description': 'Маркетолог. Разрабатывает маркетинговые стратегии и продвигает бренд компании.',
                'url': 'http://example.com/marketing.html'
            },
            {
                'full_name': 'Волков Сергей Николаевич',
                'email': 'volkov@example.com',
                'phone': '+375 (29) 999-00-11',
                'description': 'Логист. Отвечает за доставку товаров и управление складскими запасами.',
                'url': 'http://example.com/logistics.php'
            },
            {
                'full_name': 'Смирнова Ольга Викторовна',
                'email': 'smirnova@example.com',
                'phone': '80291112233',
                'description': 'Финансовый менеджер. Управляет финансовыми потоками и анализирует экономические показатели.',
                'url': 'http://example.com/finance.html'
            },
            {
                'full_name': 'Лебедев Андрей Олегович',
                'email': 'lebedev@example.com',
                'phone': '+375 (29) 123-45-67',
                'description': 'Специалист по закупкам. Отвечает за формирование ассортимента и работу с поставщиками.',
                'url': 'http://example.com/purchases.php'
            },
            {
                'full_name': 'Федорова Татьяна Михайловна',
                'email': 'fedorova@example.com',
                'phone': '8 (029) 2345678',
                'description': 'HR-менеджер. Занимается подбором персонала и развитием корпоративной культуры.',
                'url': 'http://example.com/hr.html'
            }
        ]

        created_count = 0
        for emp_data in employees_data:
            contact, created = Contact.objects.get_or_create(
                email=emp_data['email'],
                defaults=emp_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Создан сотрудник: {emp_data["full_name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Сотрудник уже существует: {emp_data["full_name"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nСоздано сотрудников: {created_count} из {len(employees_data)}')
        )

