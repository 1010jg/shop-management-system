import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Auth Views
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'

// Main Views
import DashboardView from '../views/dashboard/DashboardView.vue'

// Products
import ProductListView from '../views/products/ProductListView.vue'
import ProductFormView from '../views/products/ProductFormView.vue'
import ProductDetailView from '../views/products/ProductDetailView.vue'

// Inventory
import InventoryView from '../views/inventory/InventoryView.vue'
import ImportStockView from '../views/inventory/ImportStockView.vue'
import RestockRequestView from '../views/inventory/RestockRequestView.vue'

// Sales & Transactions
import SaleView from '../views/sales/SaleView.vue'
import TransactionListView from '../views/transactions/TransactionListView.vue'

// Admin (Users)
import UserListView from '../views/users/UserListView.vue'
import UserFormView from '../views/users/UserFormView.vue'

// 404
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  // === Public / Guest Only ===
  { path: '/login', name: 'Login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { guestOnly: true } },

  // === Authenticated ===
  { path: '/', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },

  // Products (CRUD)
  { path: '/products', name: 'ProductList', component: ProductListView, meta: { requiresAuth: true } },
  { path: '/products/add', name: 'ProductAdd', component: ProductFormView, meta: { requiresAuth: true, roles: ['super_admin', 'warehouse'] } },
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetailView, meta: { requiresAuth: true } },
  { path: '/products/:id/edit', name: 'ProductEdit', component: ProductFormView, meta: { requiresAuth: true, roles: ['super_admin', 'warehouse'] } },

  // === Inventory (🔧 เพิ่ม 2 routes ที่หายไปตรงนี้) ===
  { path: '/inventory', name: 'Inventory', component: InventoryView, meta: { requiresAuth: true } },
  { path: '/inventory/import', name: 'ImportStock', component: ImportStockView, meta: { requiresAuth: true, roles: ['super_admin', 'warehouse'] } },
  { path: '/inventory/restock-request', name: 'RestockRequest', component: RestockRequestView, meta: { requiresAuth: true, roles: ['super_admin','warehouse', 'shop'] } },
  
  // Sales & Transactions
  { path: '/sales', name: 'Sales', component: SaleView, meta: { requiresAuth: true, roles: ['super_admin', 'shop'] } },
  { path: '/transactions', name: 'Transactions', component: TransactionListView, meta: { requiresAuth: true } },

  // === Admin Only ===
  { path: '/admin/users', name: 'UserList', component: UserListView, meta: { requiresAuth: true, roles: ['super_admin'], isAdminPage: true } },
  { path: '/admin/users/add', name: 'UserAdd', component: UserFormView, meta: { requiresAuth: true, roles: ['super_admin'], isAdminPage: true } },
  { path: '/admin/users/:id/edit', name: 'UserEdit', component: UserFormView, meta: { requiresAuth: true, roles: ['super_admin'], isAdminPage: true } },
  { path: '/products/add', name: 'ProductAdd', component: ProductFormView, meta: { requiresAuth: true, roles: ['super_admin'] } },
  
  // 404 Catch-all
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// ==========================================
// NAVIGATION GUARD (ป้องกันหน้าตาม Role)
// ==========================================
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. ต้อง Login ก่อน
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // 2. Login แล้วห้ามเข้าหน้า Login/Register ซ้ำ
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return next({ name: 'Dashboard' })
  }

  // 3. ตรวจสอบ Role (User เข้าหน้า Admin ไม่ได้)
  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRole = authStore.user?.role
    if (!userRole || !to.meta.roles.includes(userRole)) {
      alert('⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
      return next({ name: 'Dashboard' })
    }
  }

  next()
})

export default router