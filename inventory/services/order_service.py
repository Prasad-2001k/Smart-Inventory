from typing import Iterable, List, Mapping

from django.core.exceptions import ValidationError
from django.db import transaction

from inventory.models import Order, OrderItem, Product


def _ensure_pending(order: Order) -> None:
    if order.status != "P":
        raise ValidationError("Only pending orders can be modified.")


def add_order_items(order: Order, items: Iterable[Mapping]) -> List[OrderItem]:
    """
    Add items to an order while validating and deducting stock.

    Each item mapping must include:
      - product: Product instance
      - quantity: int
    """
    items = list(items or [])
    if not items:
        return []

    with transaction.atomic():
        _ensure_pending(order)

        product_ids = [itm["product"].id for itm in items]
        products = Product.objects.select_for_update().filter(id__in=product_ids)
        locked_products = {prod.id: prod for prod in products}

        seen_products = set()
        for itm in items:
            product = itm.get("product")
            quantity = int(itm.get("quantity", 0))

            if not product:
                raise ValidationError("Product is required for each item.")
            if product.id in seen_products:
                raise ValidationError(
                    f"Duplicate product {product.id} in payload; combine quantities."
                )
            seen_products.add(product.id)

            locked_product = locked_products.get(product.id)
            if locked_product is None:
                raise ValidationError(f"Product {product.id} not found.")
            if quantity <= 0:
                raise ValidationError("Quantity must be greater than zero.")
            if locked_product.current_stock < quantity:
                raise ValidationError(
                    f"Insufficient stock for {locked_product.name} "
                    f"(available: {locked_product.current_stock}, requested: {quantity})."
                )

        created_items: List[OrderItem] = []
        for itm in items:
            product = itm["product"]
            quantity = int(itm["quantity"])
            locked_product = locked_products[product.id]

            locked_product.current_stock -= quantity
            locked_product.save(update_fields=["current_stock"])

            created_items.append(
                OrderItem.objects.create(
                    order=order,
                    product=locked_product,
                    quantity=quantity,
                    price_at_purchase=locked_product.price,
                )
            )

        return created_items


def restore_stock(order: Order, set_status: bool = False) -> None:
    """
    Restore stock for all items in the order.
    Optionally set status to cancelled (X) when requested.
    """
    with transaction.atomic():
        if order.status == "X":
            raise ValidationError("Order is already cancelled.")

        items = list(order.items.select_related("product"))
        if not items:
            if set_status:
                order.status = "X"
                order.save(update_fields=["status"])
            return

        product_ids = [item.product_id for item in items]
        products = Product.objects.select_for_update().filter(id__in=product_ids)
        locked_products = {prod.id: prod for prod in products}

        for item in items:
            product = locked_products.get(item.product_id)
            if not product:
                raise ValidationError(f"Product {item.product_id} not found for restore.")
            product.current_stock += item.quantity
            product.save(update_fields=["current_stock"])

        if set_status:
            order.status = "X"
            order.save(update_fields=["status"])
