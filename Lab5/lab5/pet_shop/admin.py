from django.contrib import admin
from . import models


@admin.register(models.ServiceUser)
class ServiceUserAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Contact)
class ContactAdmin(admin.ModelAdmin):
    pass


@admin.register(models.CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    pass


@admin.register(models.News)
class NewsAdmin(admin.ModelAdmin):
    pass


@admin.register(models.FAQ)
class FAQAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Review)
class ReviewAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Coupon)
class CouponAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Product)
class ProductAdmin(admin.ModelAdmin):
    pass


@admin.register(models.VacancyInfo)
class VacancyInfoAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Partner)
class PartnerAdmin(admin.ModelAdmin):
    pass
