from django import forms
from .models import Product


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['article', 'name', 'price', 'supplier', 'quantity', 'description', 'pic']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
