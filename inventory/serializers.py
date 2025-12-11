from rest_framework import serializers
from .models import Category, Supplier, Product, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'cname']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'phone', 'email', 'address']


class ProductSerializer(serializers.ModelSerializer):
    
    category_name = serializers.CharField(source='category.cname', read_only= True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'price', 'current_stock', 'category', 'category_name', 'supplier', 'supplier_name']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make current_stock writable when creating, read-only when updating
        if self.instance is not None:
            # Updating an existing product - make stock read-only
            self.fields['current_stock'].read_only = True
        else:
            # Creating a new product - allow stock to be set
            self.fields['current_stock'].read_only = False


class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_purchase', 'order']
        read_only_fields = ['price_at_purchase']

    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value

    def validate(self, data):
        """Validate stock availability and order status"""
        product = data.get('product')
        quantity = data.get('quantity', 1)
        order = data.get('order')

        # Check stock availability
        if product and quantity > product.current_stock:
            raise serializers.ValidationError(
                f"Insufficient stock. Available: {product.current_stock}, Requested: {quantity}"
            )

        # Prevent adding items to completed or cancelled orders
        if order and order.status != 'P':
            raise serializers.ValidationError(
                f"Cannot add items to {order.get_status_display().lower()} orders."
            )

        return data

    def create(self, validated_data):
        product = validated_data['product']
        validated_data['price_at_purchase'] = product.price
        return super().create(validated_data)


class OrderSerializer(serializers.ModelSerializer):
    # Allow write on items for order creation; optional to support two-step create
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = ['id', 'created_at', 'status', 'items']
