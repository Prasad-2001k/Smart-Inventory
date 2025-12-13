from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import OrderItem, Product

@receiver(post_save, sender=OrderItem)
def send_low_stock_on_order_item(sender, instance, created, **kwargs):
    """
    Send low stock alerts when an item is added to a pending order.
    Stock updates are handled in the service layer.
    """
    if created and instance.order.status == 'P':
        product = instance.product
        if product.current_stock < 5:
            send_low_stock_email(product)


@receiver(post_save, sender=Product)
def send_low_stock_on_product_update(sender, instance, **kwargs):
    """Send low stock alerts when a product is saved with low inventory."""
    if instance.current_stock < 5:
        send_low_stock_email(instance)

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