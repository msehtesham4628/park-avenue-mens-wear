export const API_DOCUMENTATION = {
  title: 'Park Avenue Menswear REST API Specification',
  version: '1.0.0',
  description: 'Production-ready backend architecture for Park Avenue Menswear luxury suiting and bespoke tailoring.',
  baseUrl: '/api',
  modules: {
    authentication: {
      description: 'Customer registration, secure login with bcrypt password hashing, session tokens via JWT.',
      endpoints: [
        { method: 'POST', path: '/auth/register', description: 'Register a new customer account', auth: false },
        { method: 'POST', path: '/auth/login', description: 'Authenticate customer or staff with email and password', auth: false },
        { method: 'POST', path: '/auth/logout', description: 'Invalidate current session', auth: false },
        { method: 'GET', path: '/auth/me', description: 'Retrieve authenticated patron profile', auth: true }
      ]
    },
    products: {
      description: 'Garment catalog queries with multi-attribute filtering, search, pagination, and inventory availability.',
      endpoints: [
        { method: 'GET', path: '/products', description: 'List products (filters: category, search, minPrice, maxPrice, size, color, availability, sortBy, page, limit)', auth: false },
        { method: 'GET', path: '/products/:slug', description: 'Retrieve single product by slug, productId, or SKU', auth: false },
        { method: 'POST', path: '/admin/products', description: 'Create new product with variants and initial stock', auth: 'admin/staff' },
        { method: 'PUT', path: '/admin/products/:id', description: 'Update product details, fabrics, or variant stock', auth: 'admin/staff' },
        { method: 'DELETE', path: '/admin/products/:id', description: 'Deactivate or permanently remove product', auth: 'admin' }
      ]
    },
    inventory: {
      description: 'Comprehensive inventory ledger tracking variant-level quantities, transaction audit trails, and preventing negative stock.',
      endpoints: [
        { method: 'GET', path: '/admin/inventory/overview', description: 'Full inventory ledger by SKU, category, and stock level', auth: 'admin/staff' },
        { method: 'POST', path: '/admin/inventory/adjust', description: 'Adjust stock (add/remove/set) with reason and admin user tracking', auth: 'admin/staff' },
        { method: 'GET', path: '/admin/inventory/low-stock', description: 'List products at or below low-stock threshold', auth: 'admin/staff' },
        { method: 'GET', path: '/admin/inventory/out-of-stock', description: 'List products completely depleted', auth: 'admin/staff' },
        { method: 'GET', path: '/admin/inventory/history', description: 'Immutable transaction history for all stock changes', auth: 'admin/staff' }
      ]
    },
    cart: {
      description: 'Server-authoritative cart calculation, strictly validating prices and live inventory.',
      endpoints: [
        { method: 'GET', path: '/cart', description: 'Retrieve active cart by session ID header (x-session-id)', auth: false },
        { method: 'POST', path: '/cart/items', description: 'Add item with size/color with server-side inventory verification', auth: false },
        { method: 'PUT', path: '/cart/items/:productId', description: 'Update quantity with live stock validation', auth: false },
        { method: 'DELETE', path: '/cart/items/:productId', description: 'Remove item from cart', auth: false },
        { method: 'POST', path: '/cart/validate', description: 'Audit entire cart against live inventory before checkout', auth: false }
      ]
    },
    orders: {
      description: 'Order lifecycle from placement with atomic inventory reserve to delivery tracking and status history.',
      endpoints: [
        { method: 'POST', path: '/orders', description: 'Submit order, deduct stock, generate PA-YYYY-XXXXXX ID, dispatch notification', auth: false },
        { method: 'GET', path: '/orders/:id', description: 'Get order details by order ID', auth: false },
        { method: 'POST', path: '/orders/lookup', description: 'Secure customer order tracking by Order ID + Email or Phone', auth: false },
        { method: 'GET', path: '/admin/orders/list', description: 'Admin query all orders with search and status filters', auth: 'admin/staff' },
        { method: 'PUT', path: '/admin/orders/:id/status', description: 'Transition order status, record history, and dispatch notification', auth: 'admin/staff' }
      ]
    },
    alterations: {
      description: 'Bespoke tailoring and alterations commission management system.',
      endpoints: [
        { method: 'POST', path: '/alterations', description: 'Create alteration ticket with hemming/sleeve measurements', auth: false },
        { method: 'GET', path: '/alterations/:id', description: 'Get alteration details by alteration ID', auth: false },
        { method: 'POST', path: '/alterations/lookup', description: 'Customer alteration lookup by Alteration ID + Email or Phone', auth: false },
        { method: 'GET', path: '/admin/alterations/list', description: 'Admin overview of active alterations', auth: 'admin/staff' },
        { method: 'PUT', path: '/admin/alterations/:id/status', description: 'Update status (Received, Review, In Progress, Quality Check, Ready for Pickup, Completed)', auth: 'admin/staff' }
      ]
    },
    customers: {
      description: 'Customer record management searchable by email, phone, or order ID.',
      endpoints: [
        { method: 'GET', path: '/admin/customers/list', description: 'List customer accounts with pagination', auth: 'admin/staff' },
        { method: 'GET', path: '/admin/customers/search', description: 'Search customers by name, email, phone, or PA- order ID', auth: 'admin/staff' },
        { method: 'GET', path: '/admin/customers/:id', description: 'Retrieve customer profile with complete order & alteration history', auth: 'admin/staff' },
        { method: 'PUT', path: '/admin/customers/:id', description: 'Update customer details and preferences', auth: 'admin/staff' }
      ]
    },
    notifications: {
      description: 'Multi-channel notification service abstraction supporting Email, SMS, and WhatsApp adapters.',
      endpoints: [
        { method: 'GET', path: '/admin/notifications/history', description: 'Audit log of all dispatched messages and delivery status', auth: 'admin/staff' },
        { method: 'POST', path: '/admin/notifications/send', description: 'Dispatch customized notification to client across any channel', auth: 'admin/staff' }
      ]
    },
    payments: {
      description: 'Secure payment intent creation and webhook verification.',
      endpoints: [
        { method: 'POST', path: '/payments/create-intent', description: 'Initialize payment intent verified against order total', auth: false },
        { method: 'POST', path: '/payments/webhook', description: 'Receive signed gateway webhook events to update payment status', auth: false }
      ]
    },
    dashboard: {
      description: 'High-level atelier business metrics for administration portal.',
      endpoints: [
        { method: 'GET', path: '/admin/dashboard/stats', description: 'Real-time stats: products, inventory count, low stock, out of stock, orders, alterations, revenue', auth: 'admin/staff' }
      ]
    }
  }
};
