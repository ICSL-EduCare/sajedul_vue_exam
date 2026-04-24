const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'restaurant', component: () => import('pages/Restaurantsetuppage.vue') },
      { path: 'items', component: () => import('pages/Itempage.vue') },
      { path: 'orders', component: () => import('pages/Orderpage.vue') },
      { path: 'invoices', component: () => import('pages/Invoicepage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
