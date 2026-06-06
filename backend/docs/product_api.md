# NatureSip Product Catalog API Documentation

This document describes the Product Catalog API endpoints, including sample payloads and a copy-pasteable Postman Collection schema.

---

## 1. Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Public | List all active products. |
| **GET** | `/api/products?all=true` | Admin | List all products (active + inactive). |
| **GET** | `/api/products/:id` | Public | Get single product detail by ID. |
| **POST** | `/api/products` | Admin (JWT) | Create a new product and inventory. |
| **PUT** | `/api/products/:id` | Admin (JWT) | Update product details and inventory. |
| **DELETE** | `/api/products/:id` | Admin (JWT) | Delete a product and its inventory. |

---

## 2. Sample Payloads

### 2.1 GET /api/products
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "count": 1,
      "products": [
        {
          "id": "a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c",
          "sku": "NS-MANGO",
          "name": "Alphonso Mango Royale",
          "description": "A luxury blend of cold-pressed organic Alphonso mangoes.",
          "price": "24.99",
          "image_url": "/images/mango_bottle.png",
          "category": "Standard",
          "flavor": "mango",
          "is_active": true,
          "created_at": "2026-06-06T12:00:00.000Z",
          "updated_at": "2026-06-06T12:00:00.000Z",
          "stock": 100
        }
      ]
    }
    ```

### 2.2 GET /api/products/:id
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "product": {
        "id": "a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c",
        "sku": "NS-MANGO",
        "name": "Alphonso Mango Royale",
        "description": "A luxury blend of cold-pressed organic Alphonso mangoes.",
        "price": "24.99",
        "image_url": "/images/mango_bottle.png",
        "category": "Standard",
        "flavor": "mango",
        "is_active": true,
        "created_at": "2026-06-06T12:00:00.000Z",
        "updated_at": "2026-06-06T12:00:00.000Z",
        "stock": 100
      }
    }
    ```
*   **Response (404 Not Found)**:
    ```json
    {
      "status": "error",
      "message": "Product not found."
    }
    ```

### 2.3 POST /api/products (Admin Only)
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Request Body**:
    ```json
    {
      "sku": "NS-GINGER",
      "name": "Ginger Apple Zest",
      "description": "A warm digestive aid made of cold-pressed ginger roots and sweet apples.",
      "price": 23.50,
      "stock": 50,
      "image_url": "/images/ginger_apple.png",
      "category": "Premium",
      "flavor": "ginger",
      "is_active": true
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "status": "success",
      "message": "Product successfully created.",
      "product": {
        "id": "e9b8c7d6-f5e4-3d2c-1b0a-9f8e7d6c5b4a",
        "sku": "NS-GINGER",
        "name": "Ginger Apple Zest",
        "description": "A warm digestive aid made of cold-pressed ginger roots and sweet apples.",
        "price": 23.5,
        "image_url": "/images/ginger_apple.png",
        "category": "Premium",
        "flavor": "ginger",
        "is_active": true,
        "created_at": "2026-06-06T17:50:00.000Z",
        "updated_at": "2026-06-06T17:50:00.000Z",
        "stock": 50
      }
    }
    ```
*   **Response (400 Validation Error - Negative Stock)**:
    ```json
    {
      "status": "error",
      "message": "Inventory stock quantity cannot be negative."
    }
    ```
*   **Response (409 Duplicate SKU Error)**:
    ```json
    {
      "status": "error",
      "message": "Product SKU 'NS-MANGO' already exists."
    }
    ```
*   **Response (403 Forbidden - Access Denied)**:
    ```json
    {
      "status": "error",
      "message": "Access denied. Administrator privileges required."
    }
    ```

### 2.4 PUT /api/products/:id (Admin Only)
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Request Body**:
    ```json
    {
      "sku": "NS-GINGER-V2",
      "name": "Ginger Apple Zest Premium",
      "description": "Upgraded formula with organic lemon juice added.",
      "price": 24.99,
      "stock": 120,
      "image_url": "/images/ginger_apple_v2.png",
      "category": "Premium",
      "flavor": "ginger",
      "is_active": true
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Product successfully updated.",
      "product": {
        "id": "e9b8c7d6-f5e4-3d2c-1b0a-9f8e7d6c5b4a",
        "sku": "NS-GINGER-V2",
        "name": "Ginger Apple Zest Premium",
        "description": "Upgraded formula with organic lemon juice added.",
        "price": 24.99,
        "image_url": "/images/ginger_apple_v2.png",
        "category": "Premium",
        "flavor": "ginger",
        "is_active": true,
        "created_at": "2026-06-06T17:50:00.000Z",
        "updated_at": "2026-06-06T17:55:00.000Z",
        "stock": 120
      }
    }
    ```

### 2.5 DELETE /api/products/:id (Admin Only)
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Product SKU 'NS-GINGER-V2' has been successfully deleted."
    }
    ```

---

## 3. Postman Collection

Copy and save the JSON below into a file named `naturesip_products.postman_collection.json` and import it directly into Postman to perform manual endpoint queries:

```json
{
  "info": {
    "_postman_id": "8b51d2ef-5f12-42da-91ca-ee0840b12bc1",
    "name": "NatureSip Product Catalog API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Public Products",
      "item": [
        {
          "name": "Get All Active Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/products",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "products"]
            }
          },
          "response": []
        },
        {
          "name": "Get Product By ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/products/a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "products", "a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Admin Products",
      "item": [
        {
          "name": "Create Product",
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
              "raw": "{\n  \"sku\": \"NS-GINGER\",\n  \"name\": \"Ginger Apple Zest\",\n  \"description\": \"A warm digestive cold-pressed blend.\",\n  \"price\": 23.50,\n  \"stock\": 50,\n  \"image_url\": \"/images/ginger_apple.png\",\n  \"category\": \"Premium\",\n  \"flavor\": \"ginger\",\n  \"is_active\": true\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/products",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "products"]
            }
          },
          "response": []
        },
        {
          "name": "Update Product",
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
              "raw": "{\n  \"sku\": \"NS-GINGER-V2\",\n  \"name\": \"Ginger Apple Zest Premium\",\n  \"description\": \"Upgraded formula with lemon extract.\",\n  \"price\": 24.99,\n  \"stock\": 120,\n  \"image_url\": \"/images/ginger_apple_v2.png\",\n  \"category\": \"Premium\",\n  \"flavor\": \"ginger\",\n  \"is_active\": true\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/products/replace-with-your-product-id",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "products", "replace-with-your-product-id"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Product",
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
              "raw": "http://localhost:5000/api/products/replace-with-your-product-id",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "products", "replace-with-your-product-id"]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
```
