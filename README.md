# Starva.shop

<p align="center">
  <img src="https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6du5UdXxlTLMJtliDeN9nXqzs57GUH6RgZbryB" alt="Starva.shop Logo" />
</p>

A modern, multi-tenant e-commerce platform. Starva.shop enables stores across various categories to showcase their products and manage orders while providing customers with a seamless shopping experience.

## Features

### For stores

- **Multi-organization support** - Manage multiple stores from a single account
- **Product management** - Create, update, and organize products with images, descriptions, and pricing
- **Order management** - Track orders through their complete lifecycle (pending → confirmed → preparing → ready → delivered)
- **Analytics dashboard** - Monitor business performance and order metrics
- **Tag system** - Categorize products for better organization and discovery
- **Inventory tracking** - Manage stock status (in stock, out of stock, archived) with automated tracking
- **Multi-category support** - Sell across various categories including health & wellness, food & groceries, clothing, real estate, electronics, and more

### For Customers

- **Browse stores** - Discover and explore different stores and their products
- **Product catalog** - Filter and search through products with tags
- **Shopping cart** - Add multiple items and place orders
- **Product likes** - Save favorite products for later
- **Order tracking** - Monitor order status in real-time
- **Order history** - View past orders and reorder easily

## Database Schema

The application uses a relational database with the following main entities:

- **Organizations**: Stores that list products
- **Products**: Items available for purchase with pricing and metadata
- **Orders**: Customer orders with status tracking
- **Order Items**: Individual products within an order
- **Users**: Customer accounts
- **Members**: Organization team members with roles
- **Tags**: Product categorization
- **Product Likes**: User favorites
- **Categories**: Product categories including health & wellness, food & groceries, clothing, real estate, electronics, appliances, furniture, books & media, automotive, toys & games, and others

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ ACCOUNT : has
    USER ||--o{ MEMBER : has
    USER ||--o{ ORDER : places
    USER ||--o{ PRODUCT_LIKE : creates

    ORGANIZATION ||--o{ MEMBER : has
    ORGANIZATION ||--o{ INVITATION : sends
    ORGANIZATION ||--o{ PRODUCT : owns
    ORGANIZATION ||--o{ TAG : creates
    ORGANIZATION ||--o{ ORDER : receives
    ORGANIZATION ||--o| SESSION : "active in"

    PRODUCT ||--o{ PRODUCT_TAG : has
    PRODUCT ||--o{ ORDER_ITEM : "included in"
    PRODUCT ||--o{ PRODUCT_LIKE : receives

    TAG ||--o{ PRODUCT_TAG : "tagged in"

    ORDER ||--o{ ORDER_ITEM : contains

    USER {
        string id PK
        string name
        string email UK
        boolean emailVerified
        string image
        timestamp createdAt
    }

    ORGANIZATION {
        string id PK
        string name
        string slug UK
        string logo
        timestamp createdAt
    }

    MEMBER {
        string id PK
        string organizationId FK
        string userId FK
        enum role
        timestamp createdAt
    }

    PRODUCT {
        string id PK
        string name
        string slug UK
        decimal price
        enum status
        enum category
        string organizationId FK
        integer likesCount
        timestamp createdAt
    }

    ORDER {
        string id PK
        integer orderNumber
        string userId FK
        string organizationId FK
        enum status
        decimal totalPrice
        timestamp createdAt
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        integer quantity
        decimal priceAtOrder
        decimal subtotal
    }

    TAG {
        string id PK
        string name
        string slug UK
        string organizationId FK
    }

    PRODUCT_TAG {
        string id PK
        string productId FK
        string tagId FK
    }

    PRODUCT_LIKE {
        string id PK
        string productId FK
        string userId FK
        timestamp createdAt
    }
```

## Key Workflows

### Order Lifecycle

1. **Pending** - Order placed by customer
2. **Confirmed** - Store confirms the order
3. **Preparing** - Order is being prepared
4. **Ready** - Order ready for pickup/delivery
5. **Delivered** - Order completed
6. **Cancelled** - Order cancelled (by customer or store)

### Multi-tenant Architecture

Each organization operates independently with:

- Separate product catalogs
- Independent order management
- Team member management with roles (owner, admin, member)
- Organization-scoped analytics
- Category-specific product management

## License

MIT

## TODO

- [ ] Multiple languages, currencies
- [ ] Payment gateways
- [ ] Delivery methods
- [ ] Category-specific features ( real estate listings, service bookings, etc.)
- [ ] Advanced product specifications per category
- [ ] Multi-vendor marketplace features
