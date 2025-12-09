from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.

class Category(models.Model):
    """Categorizes Products in specific groups such as Electronics, Garment etc"""
    cname = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['cname']

    def __str__(self):
        return self.cname
    
class Supplier(models.Model):
    """Stores Contact Info of the Suppliers"""
    name = models.CharField(max_length=100, unique=True)
    phone = PhoneNumberField(region='IN', unique=True)
    email = models.EmailField(unique=True)
    address = models.TextField(max_length=250, blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Suppliers'
        ordering = ['name']

    def __str__(self):
        return self.name
    
class Product(models.Model):
    """The main inventory Item with current stock"""
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    current_stock = models.PositiveIntegerField(default=0)

    # Each product must have one category Hence related to category.
    # ForeignKey to Category: One Category --> many Products   
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)

    # Assuming each product has One Supplier
    # ForeignKey to Supplier: One Supplier --> many Products
    supplier = models.ForeignKey(Supplier, related_name='products', on_delete=models.CASCADE, null=True)
    
    class Meta:
        verbose_name_plural = 'Products'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}({self.sku})'
    
class Order(models.Model):
    """Represents Sales Transaction"""
    STATUS_CHOICES = [
        ('P','Pending'),
        ('C','Completed'),
        ('X','Cancelled')
    ]
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f'Order #{self.id} - {self.get_status_display()}'

class OrderItem(models.Model):
    """The Model connecting 'Order' and 'Product'"""

    #RELATIONSHIP: ForeignKey to Order (One Order -> Many Items)
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)

    # RELATIONSHIP: ForeignKey to Product (One Product -> Many Items)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    class Meta:
        unique_together = ('order', 'product')
        verbose_name_plural = 'Order Items'
        ordering = ['order', 'product']

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order #{self.order.id}"