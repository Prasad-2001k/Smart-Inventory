from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import OrderItem, Product, Order

@receiver(post_save, sender=OrderItem)
def update_stock_and_alert(sender, instance, created, **kwargs):
    """
    Updates product stock when a new OrderItem is created, and checks for low stock.
    Only processes items for Pending orders to avoid double-processing.
    """
    if created and instance.order.status == 'P':
        product = instance.product
        quantity_sold = instance.quantity

        # Prevent negative stock
        if quantity_sold > product.current_stock:
            raise ValueError(
                f"Insufficient stock for {product.name}. "
                f"Available: {product.current_stock}, Requested: {quantity_sold}"
            )

        product.current_stock -= quantity_sold
        product.save(update_fields=['current_stock'])

        # Check for low stock alert
        if product.current_stock < 5:
            send_low_stock_email(product)


@receiver(post_save, sender=Order)
def handle_order_status_change(sender, instance, created, **kwargs):
    """
    Handles stock restoration when an order is cancelled.
    """
    if not created and instance.status == 'X':
        # Restore stock for all items in cancelled order
        for item in instance.items.all():
            product = item.product
            product.current_stock += item.quantity
            product.save(update_fields=['current_stock'])

def send_low_stock_email(product):
    """Handles the actual email sending."""
    # Use settings for email configuration (should be moved to settings.py)
    recipient_list = getattr(settings, 'LOW_STOCK_ALERT_EMAILS', ['trialone12l@gmail.com'])
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'pkkandalkar2001@gmail.com')
    
    subject = f'LOW STOCK ALERT: {product.name}'
    message = (
        f'The stock for {product.name} (SKU: {product.sku}) has dropped to {product.current_stock}. '
        f'Please place a new order with the supplier immediately.'
    )

    try:
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    except Exception as e:
        # Log error instead of failing silently in production
        # In production, consider using Celery for async email sending
        print(f"Failed to send low stock email: {e}")