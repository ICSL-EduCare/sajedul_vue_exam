<template>
  <q-page class="page-bg">
    <div class="page-inner">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-title">Invoices</div>
          <div class="page-sub">{{ orders.length }} orders in total</div>
        </div>
        <q-btn
          unelevated
          icon="add"
          label="New Order"
          class="pos-btn"
          @click="$router.push('/orders')"
        />
      </div>

      <!-- Empty -->
      <div v-if="!orders.length" class="empty-state">
        <q-icon name="description" size="56px" color="grey-4" />
        <div class="empty-title">No orders yet</div>
        <div class="empty-sub">Place an order to see invoices here</div>
      </div>

      <template v-else>
        <!-- Upcoming Orders -->
        <div class="section-header">
          <div class="section-dot section-dot--upcoming"></div>
          <div class="section-title">Upcoming Orders</div>
          <q-badge color="orange-7" :label="upcomingOrders.length" />
        </div>

        <div v-if="!upcomingOrders.length" class="empty-section">No upcoming orders</div>
        <div v-else class="inv-list">
          <div v-for="order in upcomingOrders" :key="order.id" class="inv-card">
            <div class="inv-card-left">
              <div class="inv-order-num">{{ order.orderNumber }}</div>
              <div class="inv-customer">
                <q-icon name="person" size="13px" color="grey-5" /> {{ order.customer.name }}
              </div>
              <div class="inv-meta">
                <span
                  ><q-icon name="table_restaurant" size="12px" /> Table
                  {{ order.customer.table }}</span
                >
                <span><q-icon name="event_seat" size="12px" /> Seat {{ order.customer.seat }}</span>
                <span
                  ><q-icon name="schedule" size="12px" /> {{ formatDate(order.createdAt) }}</span
                >
              </div>
              <div class="inv-items-preview">
                {{ order.items.map((i) => `${i.name} ×${i.qty}`).join(' · ') }}
              </div>
            </div>
            <div class="inv-card-right">
              <div class="inv-total">৳ {{ order.total.toLocaleString() }}</div>
              <div class="inv-badge inv-badge--upcoming">Upcoming</div>
              <div class="inv-actions">
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  size="sm"
                  color="grey-7"
                  label="View"
                  @click="viewInvoice(order)"
                />
                <q-btn
                  flat
                  dense
                  icon="download"
                  size="sm"
                  color="grey-7"
                  label="Download"
                  @click="downloadInvoice(order)"
                />
                <q-btn
                  flat
                  dense
                  icon="print"
                  size="sm"
                  color="grey-7"
                  label="Print"
                  @click="printInvoice(order)"
                />
              </div>
              <!-- Complete button -->
              <q-btn
                unelevated
                icon="check_circle"
                label="Mark Complete"
                size="sm"
                class="complete-btn"
                @click="markComplete(order.id)"
              />
            </div>
          </div>
        </div>

        <!-- Previous Orders -->
        <div class="section-header" style="margin-top: 32px">
          <div class="section-dot section-dot--previous"></div>
          <div class="section-title">Previous Orders</div>
          <q-badge color="grey-6" :label="previousOrders.length" />
        </div>

        <div v-if="!previousOrders.length" class="empty-section">No previous orders</div>
        <div v-else class="inv-list">
          <div v-for="order in previousOrders" :key="order.id" class="inv-card inv-card--previous">
            <div class="inv-card-left">
              <div class="inv-order-num">{{ order.orderNumber }}</div>
              <div class="inv-customer">
                <q-icon name="person" size="13px" color="grey-5" /> {{ order.customer.name }}
              </div>
              <div class="inv-meta">
                <span
                  ><q-icon name="table_restaurant" size="12px" /> Table
                  {{ order.customer.table }}</span
                >
                <span><q-icon name="event_seat" size="12px" /> Seat {{ order.customer.seat }}</span>
                <span
                  ><q-icon name="schedule" size="12px" /> {{ formatDate(order.createdAt) }}</span
                >
              </div>
              <div class="inv-items-preview">
                {{ order.items.map((i) => `${i.name} ×${i.qty}`).join(' · ') }}
              </div>
            </div>
            <div class="inv-card-right">
              <div class="inv-total">৳ {{ order.total.toLocaleString() }}</div>
              <div class="inv-badge inv-badge--previous">Completed</div>
              <div class="inv-actions">
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  size="sm"
                  color="grey-7"
                  label="View"
                  @click="viewInvoice(order)"
                />
                <q-btn
                  flat
                  dense
                  icon="download"
                  size="sm"
                  color="grey-7"
                  label="Download"
                  @click="downloadInvoice(order)"
                />
                <q-btn
                  flat
                  dense
                  icon="print"
                  size="sm"
                  color="grey-7"
                  label="Print"
                  @click="printInvoice(order)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- View Invoice Dialog -->
    <q-dialog
      v-model="invoiceDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="invoice-dialog-card">
        <div class="invoice-toolbar">
          <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
          <div class="invoice-toolbar-title">Invoice — {{ viewingOrder?.orderNumber }}</div>
          <div class="row q-gutter-sm">
            <q-btn
              unelevated
              icon="download"
              label="Download"
              class="pos-btn"
              size="sm"
              @click="downloadInvoice(viewingOrder)"
            />
            <q-btn
              unelevated
              icon="print"
              label="Print"
              class="pos-btn"
              size="sm"
              @click="printInvoice(viewingOrder)"
            />
          </div>
        </div>

        <div class="invoice-preview-wrap">
          <div class="invoice-sheet" v-if="viewingOrder">
            <div class="sheet-header">
              <div class="sheet-brand">
                <div class="sheet-logo">
                  <q-icon name="restaurant" size="24px" color="white" />
                </div>
                <div>
                  <div class="sheet-rest-name">{{ restaurant.name || 'SA Cafe' }}</div>
                  <div class="sheet-rest-addr">{{ restaurant.address || '' }}</div>
                </div>
              </div>
              <div class="sheet-meta">
                <div class="sheet-label">INVOICE</div>
                <div class="sheet-order-num">{{ viewingOrder.orderNumber }}</div>
                <div class="sheet-date">{{ formatDateFull(viewingOrder.createdAt) }}</div>
              </div>
            </div>

            <div class="sheet-divider"></div>

            <div class="sheet-customer">
              <div class="sheet-section-label">Bill To</div>
              <div class="sheet-cust-name">{{ viewingOrder.customer.name }}</div>
              <div class="sheet-cust-detail">Phone: {{ viewingOrder.customer.phone }}</div>
              <div class="sheet-cust-detail">
                Table: {{ viewingOrder.customer.table }} &nbsp;|&nbsp; Seat:
                {{ viewingOrder.customer.seat }}
              </div>
            </div>

            <table class="sheet-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in viewingOrder.items" :key="item.id">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.category }}</td>
                  <td>৳ {{ Number(item.price).toLocaleString() }}</td>
                  <td>{{ item.qty }}</td>
                  <td>৳ {{ (item.price * item.qty).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>

            <div class="sheet-totals">
              <div class="sheet-total-row">
                <span>Subtotal</span><span>৳ {{ viewingOrder.subtotal.toLocaleString() }}</span>
              </div>
              <div class="sheet-total-row sheet-total-row--grand">
                <span>Grand Total</span><span>৳ {{ viewingOrder.total.toLocaleString() }}</span>
              </div>
            </div>

            <div class="sheet-footer">
              <div>Thank you for dining with us!</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px">
                {{ restaurant.phone || '' }}
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default { name: 'InvoicePage' }
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'

const router = useRouter()

const orders = ref([])
const restaurant = ref({})
const invoiceDialog = ref(false)
const viewingOrder = ref(null)

// upcoming = status 'upcoming', previous = status 'completed'
const upcomingOrders = computed(() => orders.value.filter((o) => o.status === 'upcoming'))
const previousOrders = computed(() => orders.value.filter((o) => o.status === 'completed'))

function saveOrders() {
  localStorage.setItem('pos_orders', JSON.stringify(orders.value))
}

function markComplete(id) {
  if (!confirm('Mark this order as completed?')) return
  const idx = orders.value.findIndex((o) => o.id === id)
  if (idx !== -1) {
    orders.value.splice(idx, 1, { ...orders.value[idx], status: 'completed' })
    saveOrders()
    Notify.create({ type: 'positive', message: 'Order moved to Previous Orders!', position: 'top' })
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateFull(iso) {
  return new Date(iso).toLocaleDateString('en-BD', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function viewInvoice(order) {
  viewingOrder.value = order
  invoiceDialog.value = true
}

function getInvoiceText(order) {
  const r = restaurant.value
  return [
    '========================================',
    `         ${r.name || 'SA Cafe'}`,
    r.address ? `         ${r.address}` : '',
    '========================================',
    `Invoice No : ${order.orderNumber}`,
    `Date       : ${formatDateFull(order.createdAt)}`,
    '----------------------------------------',
    `Customer   : ${order.customer.name}`,
    `Phone      : ${order.customer.phone}`,
    `Table      : ${order.customer.table}  |  Seat: ${order.customer.seat}`,
    '----------------------------------------',
    'ITEMS:',
    ...order.items.map(
      (i, idx) =>
        `${idx + 1}. ${i.name} (${i.category})\n   ৳${i.price} x ${i.qty} = ৳${i.price * i.qty}`,
    ),
    '----------------------------------------',
    `Subtotal   : ৳${order.subtotal.toLocaleString()}`,
    `Grand Total: ৳${order.total.toLocaleString()}`,
    '========================================',
    '     Thank you for dining with us!',
    '========================================',
  ]
    .filter((l) => l !== '')
    .join('\n')
}

function downloadInvoice(order) {
  const blob = new Blob([getInvoiceText(order)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${order.orderNumber}.txt`
  a.click()
  URL.revokeObjectURL(url)
  Notify.create({ type: 'positive', message: 'Invoice downloaded!', position: 'top' })
}

function printInvoice(order) {
  viewingOrder.value = order
  invoiceDialog.value = true
  setTimeout(() => window.print(), 400)
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('pos_current_user') || 'null')
  if (!user) {
    router.push('/')
    return
  }

  // পুরনো orders-এ status না থাকলে 'upcoming' দিয়ে দাও
  const raw = JSON.parse(localStorage.getItem('pos_orders') || '[]')
  orders.value = raw.map((o) => ({ ...o, status: o.status || 'upcoming' }))
  restaurant.value = JSON.parse(localStorage.getItem('pos_restaurant') || '{}')
})
</script>

<style scoped>
.page-bg {
  background: #f8fafc;
  min-height: 100vh;
}
body.body--dark .page-bg {
  background: #0f172a;
}

.page-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.4px;
}
body.body--dark .page-title {
  color: #f8fafc;
}
.page-sub {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 2px;
}

.pos-btn {
  background: #e05a2b !important;
  color: #fff !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  height: 38px !important;
  padding: 0 18px !important;
}
.pos-btn:hover {
  background: #c94d22 !important;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border: 1px dashed #e2e8f0;
  border-radius: 16px;
}
body.body--dark .empty-state {
  background: #1e293b;
  border-color: #334155;
}
.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin-top: 12px;
}
.empty-sub {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.section-dot--upcoming {
  background: #f59e0b;
}
.section-dot--previous {
  background: #94a3b8;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
body.body--dark .section-title {
  color: #f8fafc;
}
.empty-section {
  font-size: 13px;
  color: #94a3b8;
  padding: 16px 20px;
  background: #fff;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
}
body.body--dark .empty-section {
  background: #1e293b;
  border-color: #334155;
}

/* Invoice list */
.inv-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inv-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-left: 4px solid #f59e0b;
  transition: box-shadow 0.2s;
}
body.body--dark .inv-card {
  background: #1e293b;
  border-color: #334155;
  border-left-color: #f59e0b;
}
.inv-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.inv-card--previous {
  border-left-color: #94a3b8 !important;
}

.inv-card-left {
  flex: 1;
  min-width: 0;
}
.inv-order-num {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}
body.body--dark .inv-order-num {
  color: #f8fafc;
}
.inv-customer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  margin-bottom: 6px;
}
body.body--dark .inv-customer {
  color: #94a3b8;
}
.inv-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.inv-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
}
.inv-items-preview {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inv-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}
.inv-total {
  font-size: 20px;
  font-weight: 800;
  color: #e05a2b;
}

.inv-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.inv-badge--upcoming {
  background: #fef3c7;
  color: #92400e;
}
.inv-badge--previous {
  background: #f1f5f9;
  color: #64748b;
}
body.body--dark .inv-badge--previous {
  background: #334155;
  color: #94a3b8;
}

.inv-actions {
  display: flex;
  gap: 2px;
}

/* Complete button */
.complete-btn {
  background: #16a34a !important;
  color: #fff !important;
  border-radius: 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  height: 32px !important;
  padding: 0 12px !important;
}
.complete-btn:hover {
  background: #15803d !important;
}

/* Invoice Dialog */
.invoice-dialog-card {
  background: #f8fafc !important;
  display: flex;
  flex-direction: column;
  height: 100%;
}
body.body--dark .invoice-dialog-card {
  background: #0f172a !important;
}

.invoice-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
body.body--dark .invoice-toolbar {
  background: #1e293b;
  border-bottom-color: #334155;
}
.invoice-toolbar-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
body.body--dark .invoice-toolbar-title {
  color: #f8fafc;
}

.invoice-preview-wrap {
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 32px 16px;
}

.invoice-sheet {
  width: 600px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  padding: 40px;
}
body.body--dark .invoice-sheet {
  background: #1e293b;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.sheet-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sheet-logo {
  width: 44px;
  height: 44px;
  background: #e05a2b;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sheet-rest-name {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}
body.body--dark .sheet-rest-name {
  color: #f8fafc;
}
.sheet-rest-addr {
  font-size: 12px;
  color: #94a3b8;
}
.sheet-meta {
  text-align: right;
}
.sheet-label {
  font-size: 10px;
  font-weight: 700;
  color: #e05a2b;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.sheet-order-num {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}
body.body--dark .sheet-order-num {
  color: #f8fafc;
}
.sheet-date {
  font-size: 12px;
  color: #94a3b8;
}

.sheet-divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 20px;
}
body.body--dark .sheet-divider {
  background: #334155;
}

.sheet-customer {
  margin-bottom: 24px;
}
.sheet-section-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.sheet-cust-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
body.body--dark .sheet-cust-name {
  color: #f8fafc;
}
.sheet-cust-detail {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.sheet-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.sheet-table th {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 10px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
}
body.body--dark .sheet-table th {
  border-bottom-color: #334155;
}
.sheet-table td {
  font-size: 13px;
  color: #0f172a;
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
}
body.body--dark .sheet-table td {
  color: #f8fafc;
  border-bottom-color: #334155;
}
.sheet-table tr:last-child td {
  border-bottom: none;
}

.sheet-totals {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}
body.body--dark .sheet-totals {
  background: #0f172a;
}
.sheet-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}
.sheet-total-row--grand {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0;
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  margin-top: 6px;
}
body.body--dark .sheet-total-row--grand {
  color: #f8fafc;
  border-top-color: #334155;
}

.sheet-footer {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  padding-top: 20px;
  border-top: 1px dashed #e2e8f0;
}
body.body--dark .sheet-footer {
  border-top-color: #334155;
}

@media print {
  .invoice-toolbar {
    display: none !important;
  }
  .invoice-preview-wrap {
    padding: 0 !important;
  }
  .invoice-sheet {
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
  }
}

@media (max-width: 600px) {
  .page-inner {
    padding: 16px;
  }
  .inv-card {
    flex-direction: column;
  }
  .inv-card-right {
    align-items: flex-start;
  }
}
</style>
