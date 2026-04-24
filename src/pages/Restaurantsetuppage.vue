<template>
  <q-page class="page-bg">
    <div class="page-inner">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="page-title">Restaurant Setup</div>
        </div>
        <q-btn
          v-if="!editing"
          unelevated
          icon="edit"
          label="Edit Info"
          class="pos-btn"
          @click="startEdit"
        />
        <div v-else class="row q-gutter-sm">
          <q-btn flat label="Cancel" class="ghost-btn" @click="cancelEdit" />
          <q-btn unelevated icon="save" label="Save" class="pos-btn" @click="saveRestaurant" />
        </div>
      </div>

      <!-- Restaurant Info Card -->
      <div class="info-card">
        <div class="info-card-body">
          <!-- Logo -->
          <div class="logo-section">
            <div class="logo-preview" @click="editing && triggerLogoUpload()">
              <img v-if="form.logo" :src="form.logo" class="logo-img" alt="Logo" />
              <div v-else class="logo-placeholder">
                <q-icon name="storefront" size="36px" color="grey-4" />
              </div>
              <div v-if="editing" class="logo-overlay">
                <q-icon name="photo_camera" size="20px" color="white" />
                <span>Change</span>
              </div>
            </div>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onLogoChange"
            />
            <div v-if="editing" class="logo-hint">Click to upload</div>
          </div>

          <!-- Fields -->
          <div class="fields-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="field-label">Restaurant Name</div>
                <q-input
                  v-if="editing"
                  v-model="form.name"
                  outlined
                  dense
                  class="pos-input"
                  :rules="[(v) => !!v || 'Required']"
                />
                <div v-else class="field-value">{{ restaurant.name || '—' }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="field-label">Phone Number</div>
                <q-input
                  v-if="editing"
                  v-model="form.phone"
                  outlined
                  dense
                  class="pos-input"
                  :rules="[(v) => !!v || 'Required']"
                />
                <div v-else class="field-value">{{ restaurant.phone || '—' }}</div>
              </div>

              <div class="col-12">
                <div class="field-label">Address</div>
                <q-input
                  v-if="editing"
                  v-model="form.address"
                  outlined
                  dense
                  class="pos-input"
                  :rules="[(v) => !!v || 'Required']"
                />
                <div v-else class="field-value">{{ restaurant.address || '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Branches Section -->
      <div class="section-header">
        <div>
          <div class="section-title">Branches</div>
          <div class="section-sub">{{ restaurant.branches?.length || 0 }} branches added</div>
        </div>
        <q-btn unelevated icon="add" label="Add Branch" class="pos-btn" @click="openBranchDialog" />
      </div>

      <div v-if="!restaurant.branches?.length" class="empty-state">
        <q-icon name="location_city" size="48px" color="grey-4" />
        <div class="empty-title">No branches added yet</div>
      </div>

      <div v-else class="branches-grid">
        <div v-for="(branch, i) in restaurant.branches" :key="i" class="branch-card">
          <div class="branch-card-top">
            <div class="branch-icon"><q-icon name="store" size="20px" color="white" /></div>
            <div>
              <q-btn flat round dense icon="edit" size="sm" color="grey-6" @click="editBranch(i)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                size="sm"
                color="negative"
                @click="deleteBranch(i)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="branch-name">{{ branch.name }}</div>
          <div class="branch-address">{{ branch.address }}</div>
          <div class="branch-phone">
            <q-icon name="phone" size="13px" color="grey-5" /> {{ branch.phone }}
          </div>
        </div>
      </div>
    </div>

    <!-- Branch Dialog -->
    <q-dialog v-model="branchDialog" persistent>
      <q-card style="width: 420px; max-width: 95vw; border-radius: 16px">
        <q-card-section
          class="row items-center justify-between q-pb-sm"
          style="border-bottom: 1px solid #f1f5f9"
        >
          <div style="font-size: 16px; font-weight: 700">
            {{ editingBranchIndex !== null ? 'Edit Branch' : 'Add New Branch' }}
          </div>
          <q-btn flat round dense icon="close" size="sm" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveBranch" greedy>
            <div class="field-label">Branch Name</div>
            <q-input
              v-model="branchForm.name"
              outlined
              dense
              class="pos-input q-mb-md"
              :rules="[(v) => !!v || 'Required']"
            />

            <div class="field-label">Address</div>
            <q-input
              v-model="branchForm.address"
              outlined
              dense
              class="pos-input q-mb-md"
              :rules="[(v) => !!v || 'Required']"
            />

            <div class="field-label">Phone</div>
            <q-input v-model="branchForm.phone" outlined dense class="pos-input q-mb-lg" />

            <div class="row q-gutter-sm justify-end">
              <q-btn flat label="Cancel" class="ghost-btn" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                class="pos-btn"
                :label="editingBranchIndex !== null ? 'Update' : 'Add Branch'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default { name: 'RestaurantSetup' }
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const restaurant = ref({ name: '', phone: '', address: '', logo: '', branches: [] })
const form = ref({ name: '', phone: '', address: '', logo: '' })
const editing = ref(false)
const logoInput = ref(null)

const branchDialog = ref(false)
const editingBranchIndex = ref(null)
const branchForm = ref({ name: '', address: '', phone: '' })

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('pos_current_user') || 'null')
  if (!user) {
    router.push('/')
    return
  }
  const saved = JSON.parse(localStorage.getItem('pos_restaurant') || 'null')
  if (saved) restaurant.value = saved
})

function startEdit() {
  form.value = { ...restaurant.value }
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function saveRestaurant() {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields.', position: 'top' })
    return
  }
  restaurant.value = { ...restaurant.value, ...form.value }
  localStorage.setItem('pos_restaurant', JSON.stringify(restaurant.value))
  editing.value = false
  $q.notify({ type: 'positive', message: 'Restaurant info saved!', position: 'top' })
}

function triggerLogoUpload() {
  logoInput.value?.click()
}

function onLogoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.logo = reader.result
  }
  reader.readAsDataURL(file)
}

function openBranchDialog() {
  editingBranchIndex.value = null
  branchForm.value = { name: '', address: '', phone: '' }
  branchDialog.value = true
}

function editBranch(index) {
  editingBranchIndex.value = index
  branchForm.value = { ...restaurant.value.branches[index] }
  branchDialog.value = true
}

function saveBranch() {
  const branches = [...(restaurant.value.branches || [])]
  if (editingBranchIndex.value !== null) {
    branches[editingBranchIndex.value] = { ...branchForm.value }
  } else {
    branches.push({ ...branchForm.value })
  }
  restaurant.value.branches = branches
  localStorage.setItem('pos_restaurant', JSON.stringify(restaurant.value))
  branchDialog.value = false
  $q.notify({
    type: 'positive',
    message: editingBranchIndex.value !== null ? 'Branch updated!' : 'Branch added!',
    position: 'top',
  })
}

function deleteBranch(index) {
  $q.dialog({
    title: 'Delete Branch',
    message: 'Are you sure?',
    ok: { label: 'Delete', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(() => {
    restaurant.value.branches.splice(index, 1)
    localStorage.setItem('pos_restaurant', JSON.stringify(restaurant.value))
    $q.notify({ type: 'warning', message: 'Branch deleted.', position: 'top' })
  })
}
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
.ghost-btn {
  color: #64748b !important;
  border-radius: 10px !important;
}

/* Info Card */
.info-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}
body.body--dark .info-card {
  background: #1e293b;
  border-color: #334155;
}
.info-card-body {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* Logo */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.logo-preview {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #f8fafc;
  cursor: pointer;
}
body.body--dark .logo-preview {
  border-color: #334155;
  background: #0f172a;
}
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  font-size: 11px;
}
.logo-preview:hover .logo-overlay {
  opacity: 1;
}
.logo-hint {
  font-size: 11px;
  color: #94a3b8;
}

/* Fields */
.fields-section {
  flex: 1;
}
.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.field-value {
  font-size: 15px;
  color: #0f172a;
  font-weight: 500;
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
  min-height: 36px;
}
body.body--dark .field-value {
  color: #f8fafc;
  border-bottom-color: #334155;
}
.pos-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #f8fafc;
}
body.body--dark .pos-input :deep(.q-field__control) {
  background: #0f172a;
}

/* Section */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
body.body--dark .section-title {
  color: #f8fafc;
}
.section-sub {
  font-size: 12px;
  color: #94a3b8;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 48px 20px;
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

/* Branches */
.branches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.branch-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  transition: box-shadow 0.2s;
}
body.body--dark .branch-card {
  background: #1e293b;
  border-color: #334155;
}
.branch-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.branch-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.branch-icon {
  width: 36px;
  height: 36px;
  background: #e05a2b;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.branch-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}
body.body--dark .branch-name {
  color: #f8fafc;
}
.branch-address {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.5;
}
.branch-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .info-card-body {
    flex-direction: column;
  }
  .page-inner {
    padding: 16px;
  }
}
</style>
