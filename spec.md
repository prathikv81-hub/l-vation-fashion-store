# Élévation - Premium Fashion Store

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Public storefront: hero section, product catalog with category filters (Dresses, Shoes, Accessories), product cards with image/name/price, featured category tiles
- Product detail view (name, description, price, image)
- Admin content manager: login-protected area to add/edit/delete products (title, description, price, category, image upload)
- Products stored in backend with blob-storage for images
- Authorization for admin access

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: product CRUD (create, read, update, delete), categories enum (Dress, Shoes, Accessories), product fields (id, title, description, price, category, imageId, createdAt)
2. Authorization component for admin login
3. Blob-storage for product image uploads
4. Frontend: public storefront with hero, catalog, filters, product cards
5. Frontend: admin panel for managing products (add/edit/delete, image upload)
