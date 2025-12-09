# inventory/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Supplier, Product, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model"""
    list_display = ('cname', 'product_count')
    search_fields = ('cname',)
    ordering = ('cname',)
    
    def product_count(self, obj):
        """Display number of products in this category"""
        count = obj.products.count()
        return count
    product_count.short_description = 'Products'


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    """Admin configuration for Supplier model"""
    list_display = ('name', 'phone', 'email', 'product_count')
    search_fields = ('name', 'email', 'phone')
    list_filter = ('name',)
    ordering = ('name',)
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'phone', 'email')
        }),
        ('Address', {
            'fields': ('address',),
            'classes': ('collapse',)
        }),
    )
    
    def product_count(self, obj):
        """Display number of products from this supplier"""
        count = obj.products.count()
        return count
    product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model"""
    list_display = ('name', 'sku', 'price', 'current_stock', 'stock_status', 'category', 'supplier')
    list_filter = ('category', 'supplier', 'current_stock')
    search_fields = ('name', 'sku')
    ordering = ('name',)
    autocomplete_fields = ('category', 'supplier')
    
    fieldsets = (
        ('Product Information', {
            'fields': ('name', 'sku', 'price', 'category', 'supplier')
        }),
        ('Inventory', {
            'fields': ('current_stock',),
            'description': 'Set initial stock when creating a new product. '
                        'For existing products, stock is readonly and automatically updated when orders are created.'
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make current_stock editable when creating, readonly when editing"""
        readonly = []
        # If editing an existing product, make stock readonly
        if obj:  # obj is not None when editing an existing product
            readonly.append('current_stock')
        # If creating a new product (obj is None), current_stock is editable
        return readonly
    
    actions = ['adjust_stock']
    
    @admin.action(description='Adjust stock for selected products')
    def adjust_stock(self, request, queryset):
        """Admin action to manually adjust stock (for inventory corrections)"""
        # This is a placeholder - in a real scenario, you might want a custom form
        # For now, we'll just show a message
        count = queryset.count()
        self.message_user(
            request,
            f'Stock adjustment selected for {count} product(s). '
            'Use the individual product edit page to adjust stock if needed.',
            level='info'
        )
    
    def stock_status(self, obj):
        """Display stock status with color coding"""
        if obj.current_stock < 5:
            color = 'red'
            status = 'Low Stock'
        elif obj.current_stock < 20:
            color = 'orange'
            status = 'Medium'
        else:
            color = 'green'
            status = 'Good'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            status
        )
    stock_status.short_description = 'Stock Status'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('category', 'supplier')


class OrderItemInline(admin.TabularInline):
    """Inline admin for OrderItem in Order admin"""
    model = OrderItem
    extra = 1
    readonly_fields = ('price_at_purchase',)
    autocomplete_fields = ('product',)
    
    def get_readonly_fields(self, request, obj=None):
        """Make price_at_purchase readonly"""
        return self.readonly_fields


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin configuration for Order model"""
    list_display = ('id', 'status', 'created_at', 'item_count', 'total_amount', 'status_colored')
    list_filter = ('status', 'created_at')
    search_fields = ('id',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('status', 'created_at')
        }),
    )
    
    readonly_fields = ('created_at',)
    
    def item_count(self, obj):
        """Display number of items in order"""
        return obj.items.count()
    item_count.short_description = 'Items'
    
    def total_amount(self, obj):
        """Calculate and display total order amount"""
        total = sum(item.quantity * item.price_at_purchase for item in obj.items.all())
        return f'₹{total:.2f}'
    total_amount.short_description = 'Total'
    
    def status_colored(self, obj):
        """Display status with color coding"""
        colors = {
            'P': 'orange',
            'C': 'green',
            'X': 'red'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colored.short_description = 'Status'
    
    def get_queryset(self, request):
        """Optimize queryset with prefetch_related"""
        qs = super().get_queryset(request)
        return qs.prefetch_related('items', 'items__product')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin configuration for OrderItem model"""
    list_display = ('order', 'product', 'quantity', 'price_at_purchase', 'subtotal')
    list_filter = ('order__status', 'order__created_at')
    search_fields = ('order__id', 'product__name', 'product__sku')
    autocomplete_fields = ('order', 'product')
    readonly_fields = ('price_at_purchase',)
    
    def subtotal(self, obj):
        """Calculate and display line item subtotal"""
        if obj.price_at_purchase and obj.quantity:
            return f'₹{(obj.quantity * obj.price_at_purchase):.2f}'
        return '-'
    subtotal.short_description = 'Subtotal'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('order', 'product')