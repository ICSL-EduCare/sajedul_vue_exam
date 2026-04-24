<template>
  <q-page class="page-bg">
    <div class="page-inner">
      <div class="order-layout">
        <!-- LEFT: Item Selection -->
        <div class="order-left">
          <div class="page-title">Place Order</div>

          <q-input v-model="search" outlined dense clearable class="q-mb-md">
            <template #prepend><q-icon name="search" size="18px" color="grey-5" /></template>
          </q-input>

          <!-- Category tabs -->
          <div class="cat-tabs q-mb-lg">
            <button
              class="cat-tab"
              :class="{ 'cat-tab--active': selectedCat === null }"
              @click="selectedCat = null"
            >
              All
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              class="cat-tab"
              :class="{ 'cat-tab--active': selectedCat === cat }"
              @click="selectedCat = cat"
            >
              {{ cat }}
            </button>
          </div>

          <div v-if="!filteredMenuItems.length" class="empty-state">
            <q-icon name="restaurant_menu" size="48px" color="grey-4" />
            <div class="empty-title">No items found</div>
          </div>

          <div v-else class="menu-grid">
            <div
              v-for="item in filteredMenuItems"
              :key="item.id"
              class="menu-card"
              :class="{ 'menu-card--selected': isSelected(item.id) }"
              @click="toggleItem(item)"
            >
              <div class="menu-card-icon">
                <q-icon :name="getCategoryIcon(item.category)" size="22px" color="white" />
              </div>
              <div class="menu-card-name">{{ item.name }}</div>
              <div class="menu-card-cat">{{ item.category }}</div>
              <div class="menu-card-price">৳ {{ Number(item.price).toLocaleString() }}</div>

              <div v-if="isSelected(item.id)" class="menu-card-qty">
                <q-btn
                  flat
                  round
                  dense
                  icon="remove"
                  size="xs"
                  color="white"
                  @click.stop="decreaseQty(item.id)"
                />
                <span>{{ getQty(item.id) }}</span>
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  size="xs"
                  color="white"
                  @click.stop="increaseQty(item.id)"
                />
              </div>
              <div v-if="isSelected(item.id)" class="menu-card-check">
                <q-icon name="check_circle" size="18px" color="white" />
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Order Panel -->
        <div class="order-right">
          <div class="order-panel">
            <!-- Customer Info -->
            <div class="panel-section">
              <div class="panel-title">
                <q-icon name="person" size="16px" color="grey-5" /> Customer Info
              </div>
              <q-form ref="orderForm" greedy>
                <div class="field-label">Customer Name</div>
                <q-input
                  v-model="customer.name"
                  outlined
                  dense
                  class="pos-input q-mb-sm"
                  :rules="[(v) => !!v || 'Required']"
                />

                <div class="field-label">Phone Number</div>
                <q-input
                  v-model="customer.phone"
                  outlined
                  dense
                  class="pos-input q-mb-sm"
                  :rules="[(v) => !!v || 'Required']"
                />

                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="field-label">Table No.</div>
                    <q-input
                      v-model="customer.table"
                      outlined
                      dense
                      class="pos-input"
                      :rules="[(v) => !!v || 'Required']"
                    />
                  </div>
                  <div class="col-6">
                    <div class="field-label">Seat No.</div>
                    <q-input
                      v-model="customer.seat"
                      outlined
                      dense
                      class="pos-input"
                      :rules="[(v) => !!v || 'Required']"
                    />
                  </div>
                </div>
              </q-form>
            </div>

            <!-- Order Summary -->
            <div class="panel-section">
              <div class="panel-title">
                <q-icon name="shopping_cart" size="16px" color="grey-5" /> Order Summary
                <q-badge
                  v-if="selectedItems.length"
                  color="orange-8"
                  :label="totalQty"
                  class="q-ml-xs"
                />
              </div>

              <div v-if="!selectedItems.length" style="text-align: center; padding: 16px 0">
                <q-icon name="shopping_cart" size="32px" color="grey-4" />
                <div style="font-size: 13px; color: #94a3b8; margin-top: 8px">
                  No items selected
                </div>
              </div>

              <div v-else class="order-items-list">
                <div v-for="sel in selectedItems" :key="sel.id" class="order-item-row">
                  <div>
                    <div class="order-item-name">{{ sel.name }}</div>
                    <div class="order-item-unit">
                      ৳ {{ Number(sel.price).toLocaleString() }} × {{ sel.qty }}
                    </div>
                  </div>
                  <div class="order-item-total">৳ {{ (sel.price * sel.qty).toLocaleString() }}</div>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="order-totals">
              <div class="total-row">
                <span>Subtotal</span><span>৳ {{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="total-row total-row--grand">
                <span>Total</span><span>৳ {{ subtotal.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Submit -->
            <div style="padding: 14px 16px">
              <q-btn
                unelevated
                icon="check_circle"
                label="Submit Order"
                class="pos-btn full-width"
                :disable="!selectedItems.length"
                style="height: 46px; font-size: 15px"
                @click="submitOrder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default { name: 'OrderPage' }
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const menuItems = ref([])
const search = ref('')
const selectedCat = ref(null)
const selectedItems = ref([])
const orderForm = ref(null)
const customer = ref({ name: '', phone: '', table: '', seat: '' })

const categories = computed(() => [...new Set(menuItems.value.map((i) => i.category))])

const filteredMenuItems = computed(() =>
  menuItems.value.filter((item) => {
    const matchSearch =
      !search.value || item.name.toLowerCase().includes(search.value.toLowerCase())
    const matchCat = !selectedCat.value || item.category === selectedCat.value
    return matchSearch && matchCat
  }),
)

const totalQty = computed(() => selectedItems.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => selectedItems.value.reduce((s, i) => s + i.price * i.qty, 0))

function isSelected(id) {
  return selectedItems.value.some((i) => i.id === id)
}
function getQty(id) {
  return selectedItems.value.find((i) => i.id === id)?.qty || 0
}

function toggleItem(item) {
  if (isSelected(item.id)) {
    selectedItems.value = selectedItems.value.filter((i) => i.id !== item.id)
  } else {
    selectedItems.value.push({ ...item, qty: 1 })
  }
}

function increaseQty(id) {
  const item = selectedItems.value.find((i) => i.id === id)
  if (item) item.qty++
}

function decreaseQty(id) {
  const item = selectedItems.value.find((i) => i.id === id)
  if (!item) return
  if (item.qty <= 1) selectedItems.value = selectedItems.value.filter((i) => i.id !== id)
  else item.qty--
}

function getCategoryIcon(cat) {
  const map = {
    Burger: 'lunch_dining',
    Pizza: 'local_pizza',
    Pasta: 'ramen_dining',
    Drinks: 'local_bar',
    Desserts: 'cake',
    Appetizers: 'tapas',
    'Main Course': 'set_meal',
    Salad: 'eco',
    Sandwich: 'lunch_dining',
    Soup: 'soup_kitchen',
    Snacks: 'fastfood',
  }
  return map[cat] || 'restaurant'
}

async function submitOrder() {
  const valid = await orderForm.value.validate()
  if (!valid) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all customer details.',
      position: 'top',
    })
    return
  }

  const order = {
    id: Date.now(),
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    customer: { ...customer.value },
    items: selectedItems.value.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      category: i.category,
    })),
    subtotal: subtotal.value,
    total: subtotal.value,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  }

  const orders = JSON.parse(localStorage.getItem('pos_orders') || '[]')
  orders.unshift(order)
  localStorage.setItem('pos_orders', JSON.stringify(orders))

  $q.notify({ type: 'positive', message: `Order ${order.orderNumber} placed!`, position: 'top' })
  router.push('/invoices')
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('pos_current_user') || 'null')
  if (!user) {
    router.push('/')
    return
  }
  menuItems.value = JSON.parse(localStorage.getItem('pos_items') || '[]')
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px;
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
}

/* Layout */
.order-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.order-left {
  flex: 1;
  min-width: 0;
}
.order-right {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

/* Category tabs */
.cat-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cat-tab {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
body.body--dark .cat-tab {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}
.cat-tab:hover {
  border-color: #e05a2b;
  color: #e05a2b;
}
.cat-tab--active {
  background: #e05a2b !important;
  border-color: #e05a2b !important;
  color: #fff !important;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.menu-card {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.18s;
}
body.body--dark .menu-card {
  background: #1e293b;
  border-color: #334155;
}
.menu-card:hover {
  border-color: #e05a2b;
  box-shadow: 0 4px 14px rgba(224, 90, 43, 0.12);
}
.menu-card--selected {
  border-color: #e05a2b !important;
  background: #fff8f5 !important;
}
body.body--dark .menu-card--selected {
  background: #2d1a12 !important;
}

.menu-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e05a2b, #f07d52);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.menu-card-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
body.body--dark .menu-card-name {
  color: #f8fafc;
}
.menu-card-cat {
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 6px;
}
.menu-card-price {
  font-size: 14px;
  font-weight: 800;
  color: #e05a2b;
}
.menu-card-qty {
  position: absolute;
  bottom: 10px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e05a2b;
  border-radius: 20px;
  padding: 2px 6px;
  color: white;
  font-size: 13px;
  font-weight: 700;
}
.menu-card-check {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e05a2b;
  border-radius: 50%;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 40px 20px;
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

/* Order Panel */
.order-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}
body.body--dark .order-panel {
  background: #1e293b;
  border-color: #334155;
}

.panel-section {
  padding: 16px 16px 8px;
  border-bottom: 1px solid #f1f5f9;
}
body.body--dark .panel-section {
  border-bottom-color: #334155;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}
body.body--dark .panel-title {
  color: #f8fafc;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.pos-input :deep(.q-field__control) {
  border-radius: 8px;
  background: #f8fafc;
}
body.body--dark .pos-input :deep(.q-field__control) {
  background: #0f172a;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}
.order-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.order-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}
body.body--dark .order-item-name {
  color: #f8fafc;
}
.order-item-unit {
  font-size: 11px;
  color: #94a3b8;
}
.order-item-total {
  font-size: 13px;
  font-weight: 700;
  color: #e05a2b;
}

.order-totals {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}
body.body--dark .order-totals {
  border-bottom-color: #334155;
}
.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}
.total-row--grand {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 8px;
  margin-bottom: 0;
}
body.body--dark .total-row--grand {
  color: #f8fafc;
}

.pos-btn {
  background: #e05a2b !important;
  color: #fff !important;
  border-radius: 10px !important;
  font-weight: 700 !important;
}
.pos-btn:hover {
  background: #c94d22 !important;
}

@media (max-width: 900px) {
  .order-layout {
    flex-direction: column;
  }
  .order-right {
    width: 100%;
    position: static;
  }
}
@media (max-width: 600px) {
  .page-inner {
    padding: 16px;
  }
}
</style>
