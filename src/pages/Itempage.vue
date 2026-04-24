<template>
  <q-page class="page-bg">
    <div class="page-inner">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-title">All Items</div>
          <div class="page-sub">{{ filteredItems.length }} items in menu</div>
        </div>
        <q-btn unelevated icon="add" label="Add Item" class="pos-btn" @click="openAddDialog" />
      </div>

      <!-- Search & Filter -->
      <div class="items-toolbar">
        <q-input v-model="search" outlined dense clearable class="items-search">
          <template #prepend><q-icon name="search" size="18px" color="grey-5" /></template>
        </q-input>
        <q-select
          v-model="selectedCategory"
          :options="categoryOptions"
          outlined
          dense
          class="items-filter"
          clearable
        />
      </div>

      <!-- Empty State -->
      <div v-if="!filteredItems.length" class="empty-state">
        <q-icon name="restaurant_menu" size="56px" color="grey-4" />
        <div class="empty-title">
          {{ search || selectedCategory ? 'No items found' : 'No items yet' }}
        </div>
        <div class="empty-sub">
          {{
            search || selectedCategory
              ? 'Try a different search or filter'
              : 'Click "Add Item" to add your first menu item'
          }}
        </div>
      </div>

      <!-- Items Grid -->
      <div v-else class="items-grid">
        <div v-for="item in filteredItems" :key="item.id" class="item-card">
          <div class="item-card-top">
            <div class="item-badge">{{ item.category }}</div>
            <div>
              <q-btn
                flat
                round
                dense
                icon="edit"
                size="sm"
                color="grey-6"
                @click="openEditDialog(item)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                size="sm"
                color="negative"
                @click="deleteItem(item.id)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="item-icon-wrap">
            <q-icon :name="getCategoryIcon(item.category)" size="28px" color="white" />
          </div>
          <div class="item-name">{{ item.name }}</div>
          <div class="item-price">৳ {{ Number(item.price).toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <q-dialog v-model="itemDialog" persistent>
      <q-card style="width: 400px; max-width: 95vw; border-radius: 16px">
        <q-card-section
          class="row items-center justify-between q-pb-sm"
          style="border-bottom: 1px solid #f1f5f9"
        >
          <div style="font-size: 16px; font-weight: 700">
            {{ editingItem ? 'Edit Item' : 'Add New Item' }}
          </div>
          <q-btn flat round dense icon="close" size="sm" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm q-px-lg q-pb-lg">
          <q-form @submit.prevent="saveItem" greedy>
            <div class="field-label">Item Name</div>
            <q-input
              v-model="itemForm.name"
              outlined
              dense
              class="pos-input q-mb-md"
              :rules="[(v) => !!v || 'Required']"
            />

            <div class="field-label">Category</div>
            <q-select
              v-model="itemForm.category"
              :options="predefinedCategories"
              outlined
              dense
              use-input
              input-debounce="0"
              class="pos-input q-mb-md"
              :rules="[(v) => !!v || 'Required']"
              @new-value="(val, done) => done(val)"
            />

            <div class="field-label">Price (৳)</div>
            <q-input
              v-model.number="itemForm.price"
              outlined
              dense
              type="number"
              class="pos-input q-mb-lg"
              :rules="[(v) => !!v || 'Required', (v) => v > 0 || 'Must be greater than 0']"
            />

            <div class="row q-gutter-sm justify-end">
              <q-btn flat label="Cancel" class="ghost-btn" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                class="pos-btn"
                :label="editingItem ? 'Update Item' : 'Add Item'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default { name: 'ItemsPage' }
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const items = ref([])
const search = ref('')
const selectedCategory = ref(null)
const itemDialog = ref(false)
const editingItem = ref(null)
const itemForm = ref({ name: '', category: '', price: null })

const predefinedCategories = [
  'Burger',
  'Pizza',
  'Pasta',
  'Drinks',
  'Desserts',
  'Appetizers',
  'Main Course',
  'Salad',
  'Sandwich',
  'Soup',
  'Snacks',
]

const categoryOptions = computed(() => [...new Set(items.value.map((i) => i.category))])

const filteredItems = computed(() =>
  items.value.filter((item) => {
    const matchSearch =
      !search.value || item.name.toLowerCase().includes(search.value.toLowerCase())
    const matchCat = !selectedCategory.value || item.category === selectedCategory.value
    return matchSearch && matchCat
  }),
)

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

function loadItems() {
  items.value = JSON.parse(localStorage.getItem('pos_items') || '[]')
}
function saveItems() {
  localStorage.setItem('pos_items', JSON.stringify(items.value))
}

function openAddDialog() {
  editingItem.value = null
  itemForm.value = { name: '', category: '', price: null }
  itemDialog.value = true
}

function openEditDialog(item) {
  editingItem.value = item
  itemForm.value = { name: item.name, category: item.category, price: item.price }
  itemDialog.value = true
}

function saveItem() {
  if (editingItem.value) {
    const idx = items.value.findIndex((i) => i.id === editingItem.value.id)
    if (idx !== -1) items.value[idx] = { ...editingItem.value, ...itemForm.value }
    $q.notify({ type: 'positive', message: 'Item updated!', position: 'top' })
  } else {
    items.value.push({ id: Date.now(), ...itemForm.value, createdAt: new Date().toISOString() })
    $q.notify({ type: 'positive', message: 'Item added!', position: 'top' })
  }
  saveItems()
  itemDialog.value = false
}

function deleteItem(id) {
  $q.dialog({
    title: 'Delete Item',
    message: 'Are you sure?',
    ok: { label: 'Delete', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(() => {
    items.value = items.value.filter((i) => i.id !== id)
    saveItems()
    $q.notify({ type: 'warning', message: 'Item deleted.', position: 'top' })
  })
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('pos_current_user') || 'null')
  if (!user) {
    router.push('/')
    return
  }
  loadItems()
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
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
.ghost-btn {
  color: #64748b !important;
  border-radius: 10px !important;
  font-weight: 500 !important;
}

.items-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.items-search {
  flex: 1;
  min-width: 200px;
}
.items-filter {
  width: 200px;
}

.pos-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #f8fafc;
}
body.body--dark .pos-input :deep(.q-field__control) {
  background: #0f172a;
}

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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.item-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  transition:
    box-shadow 0.2s,
    transform 0.15s;
}
body.body--dark .item-card {
  background: #1e293b;
  border-color: #334155;
}
.item-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09);
  transform: translateY(-2px);
}

.item-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.item-badge {
  font-size: 10px;
  font-weight: 700;
  color: #e05a2b;
  background: #fff4f0;
  border-radius: 20px;
  padding: 3px 10px;
  text-transform: uppercase;
}
body.body--dark .item-badge {
  background: #2d1a12;
}

.item-icon-wrap {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #e05a2b, #f07d52);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
body.body--dark .item-name {
  color: #f8fafc;
}
.item-price {
  font-size: 18px;
  font-weight: 800;
  color: #e05a2b;
  letter-spacing: -0.5px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

@media (max-width: 600px) {
  .page-inner {
    padding: 16px;
  }
  .items-filter {
    width: 100%;
  }
}
</style>
