# NatureSip Shopping Cart API Documentation

This document describes the Shopping Cart API endpoints, sample JSON payloads, and includes a copy-pasteable Postman Collection.

---

## 1. Endpoints Summary

All cart endpoints are protected by JWT authentication (`Authorization: Bearer <TOKEN>`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/cart` | Get the logged-in user's cart (with items, subtotal, and item count). |
| **POST** | `/api/cart` | Add a product or custom juice blend to the cart. |
| **PUT** | `/api/cart/:itemId` | Update quantity of a specific cart item. |
| **DELETE** | `/api/cart` | Empty the entire cart. |
| **DELETE** | `/api/cart/:itemId` | Remove a specific item from the cart. |

---

## 2. Sample Payloads

### 2.1 GET /api/cart
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "cart": {
        "id": "c7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c",
        "user_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "items": [
          {
            "id": "e9b8c7d6-f5e4-3d2c-1b0a-9f8e7d6c5b4a",
            "cart_id": "c7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c",
            "product_id": "a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c",
            "custom_juice_id": null,
            "quantity": 2,
            "created_at": "2026-06-06T18:00:00.000Z",
            "name": "Alphonso Mango Royale",
            "price": 24.99,
            "sku": "NS-MANGO",
            "image_url": "/images/mango_bottle.png",
            "blend_name": null
          }
        ],
        "subtotal": 49.98,
        "total_items": 2
      }
    }
    ```

### 2.2 POST /api/cart
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Request Body (Standard Product)**:
    ```json
    {
      "product_id": "a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c",
      "quantity": 2
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "status": "success",
      "message": "Product successfully added to cart.",
      "item": {
        "id": "e9b8c7d6-f5e4-3d2c-1b0a-9f8e7d6c5b4a",
        "cart_id": "c7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c",
        "product_id": "a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c",
        "custom_juice_id": null,
        "quantity": 2,
        "created_at": "2026-06-06T18:00:00.000Z"
      }
    }
    ```
*   **Response (400 Bad Request - Insufficient Stock)**:
    ```json
    {
      "status": "error",
      "message": "Cannot add. Insufficient stock. Only 10 units are available."
    }
    ```

### 2.3 PUT /api/cart/:itemId
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Request Body**:
    ```json
    {
      "quantity": 5
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Cart item quantity updated successfully.",
      "item": {
        "id": "e9b8c7d6-f5e4-3d2c-1b0a-9f8e7d6c5b4a",
        "cart_id": "c7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c",
        "product_id": "a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c",
        "custom_juice_id": null,
        "quantity": 5,
        "created_at": "2026-06-06T18:00:00.000Z"
      }
    }
    ```

### 2.4 DELETE /api/cart/:itemId
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Item removed from cart."
    }
    ```

### 2.5 DELETE /api/cart
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Shopping cart cleared successfully."
    }
    ```

---

## 3. Postman Collection

Copy and save the JSON below into a file named `naturesip_cart.postman_collection.json` and import it directly into Postman to perform manual endpoint queries:

```json
{
  "info": {
    "_postman_id": "6d12d2ef-5f12-42da-91ca-ee0840b12bc2",
    "name": "NatureSip Cart System API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get User Cart",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{JWT_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/cart",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "cart"]
        }
      },
      "response": []
    },
    {
      "name": "Add Product to Cart",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{JWT_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"product_id\": \"a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c\",\n  \"quantity\": 2\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/cart",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "cart"]
        }
      },
      "response": []
    },
    {
      "name": "Update Cart Item Quantity",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{JWT_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"quantity\": 5\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/cart/replace-with-your-item-id",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "cart", "replace-with-your-item-id"]
        }
      },
      "response": []
    },
    {
      "name": "Remove Cart Item",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{JWT_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/cart/replace-with-your-item-id",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "cart", "replace-with-your-item-id"]
        }
      },
      "response": []
    },
    {
      "name": "Empty Cart",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{JWT_TOKEN}}",
              "type": "string"
            }
          ]
        },
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/cart",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "cart"]
        }
      },
      "response": []
    }
  ]
}
```
