import { useCallback, useEffect, useMemo, useState } from 'react'
import { ImageIcon, PlusCircle, Pencil, Search, ToggleLeft, ToggleRight, Upload } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Pagination, Table, THead, TRow, TCell } from '../../components/ui/Table'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../lib/api'

const emptyProduct = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  hsnCode: '',
  size: '',
  color: '',
  material: '',
  description: '',
  highlights: '',
  careInstructions: '',
  price: '',
  offerPrice: '',
  discountPercent: '',
  pv: '',
  bv: '',
  gstPercent: '0',
  stock: '0',
  imageUrl: '',
  imageName: '',
  imageMime: '',
  imageData: '',
  active: true,
}

const numberFields = ['price', 'offerPrice', 'discountPercent', 'pv', 'bv', 'gstPercent', 'stock']

export default function AdminProducts() {
  usePageTitle('Products', 'Manage e-commerce products, pricing and stock')
  const { token } = useAuth()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0 })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    adminApi.products(token, { active: 'all', page: meta.page, limit: meta.limit, q: query || undefined })
      .then((data) => {
        setProducts(data.items || [])
        setMeta(data.meta || { page: 1, limit: meta.limit, total: 0 })
      })
      .catch((error) => toast.push(error.message, 'error'))
  }, [meta.page, meta.limit, query, toast, token])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((product) => product.active).length,
    inStock: products.filter((product) => Number(product.stock || 0) > 0).length,
    outStock: products.filter((product) => Number(product.stock || 0) <= 0).length,
  }), [products])

  const openCreate = () => setEditing(emptyProduct)
  const openEdit = (product) => setEditing(toForm(product))
  const updateField = (key) => (event) => {
    const value = key === 'active' ? event.target.checked : event.target.value
    setEditing((current) => ({ ...current, [key]: value }))
  }
  const updateImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.push('Please select an image file.', 'error')
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    setEditing((current) => ({
      ...current,
      imageName: file.name,
      imageMime: file.type,
      imageData: dataUrl.split(',')[1],
      imageUrl: '',
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = toPayload(editing)
      if (editing.id) {
        await adminApi.updateProduct(token, editing.id, payload)
      } else {
        await adminApi.createProduct(token, payload)
      }
      toast.push('Product saved successfully.', 'success')
      setEditing(null)
      load()
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const quickUpdate = async (product, patch, message) => {
    try {
      await adminApi.updateProduct(token, product.id, patch)
      toast.push(message, 'success')
      load()
    } catch (error) {
      toast.push(error.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <ProductStat label="Total Products" value={stats.total} />
        <ProductStat label="Active" value={stats.active} tone="success" />
        <ProductStat label="In Stock" value={stats.inStock} tone="success" />
        <ProductStat label="Out Of Stock" value={stats.outStock} tone="danger" />
      </div>

      <Card className="p-5" animate={false}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-950">Product Management</h2>
            <p className="mt-1 text-sm text-ink-400">Products added here appear in member Continue Shopping.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setMeta((current) => ({ ...current, page: 1 }))
                }}
                placeholder="Search product or SKU"
                className="h-10 w-full rounded-lg border border-ink-900/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60 sm:w-64"
              />
            </div>
            <Button variant="gold" icon={PlusCircle} onClick={openCreate}>
              Add Product
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4" animate={false}>
        <Table>
          <THead columns={['Product', 'SKU', 'Price', 'PV/BV', 'GST', 'Stock', 'Status', 'Action']} />
          <tbody>
            {products.map((product) => (
              <TRow key={product.id}>
                <TCell>
                  <div className="flex items-center gap-3">
                    {productImage(product) ? (
                      <img src={productImage(product)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-lg bg-gold-100 text-gold-700">
                        <ImageIcon size={18} />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-ink-950">{product.name}</p>
                      <p className="max-w-xs truncate text-xs text-ink-400">{product.category || product.brand || product.description || 'No description'}</p>
                    </div>
                  </div>
                </TCell>
                <TCell>{product.sku || '-'}</TCell>
                <TCell>
                  <div className="font-mono font-semibold">Rs {money(sellPrice(product))}</div>
                  {Number(product.price || 0) > sellPrice(product) && <div className="text-xs text-ink-400 line-through">Rs {money(product.price)}</div>}
                  {Number(product.discountPercent || 0) > 0 && <div className="text-xs font-semibold text-emerald-mlm">{Number(product.discountPercent)}% off</div>}
                </TCell>
                <TCell>{money(product.pv)} / {money(product.bv)}</TCell>
                <TCell>{Number(product.gstPercent || 0)}%</TCell>
                <TCell>
                  <Badge tone={Number(product.stock || 0) > 0 ? 'success' : 'danger'}>
                    {Number(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </Badge>
                </TCell>
                <TCell>
                  <Badge tone={product.active ? 'success' : 'neutral'}>{product.active ? 'Active' : 'Inactive'}</Badge>
                </TCell>
                <TCell>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="rounded-lg border border-ink-900/10 p-2 text-ink-500 transition hover:border-gold-400 hover:text-gold-700"
                      aria-label="Edit product"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => quickUpdate(product, { active: !product.active }, product.active ? 'Product hidden from members.' : 'Product visible to members.')}
                      className="rounded-lg border border-ink-900/10 p-2 text-ink-500 transition hover:border-gold-400 hover:text-gold-700"
                      aria-label="Toggle product"
                    >
                      {product.active ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                    </button>
                    {Number(product.stock || 0) > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => quickUpdate(product, { stock: 0 }, 'Product marked out of stock.')}
                      >
                        Out
                      </Button>
                    )}
                  </div>
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
        {!products.length && (
          <div className="py-10 text-center text-sm text-ink-400">No products found.</div>
        )}
        <Pagination
          meta={meta}
          page={meta.page}
          limit={meta.limit}
          onPageChange={(page) => setMeta((current) => ({ ...current, page }))}
          onLimitChange={(limit) => setMeta({ page: 1, limit, total: meta.total })}
        />
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? 'Edit Product' : 'Add Product'}
        maxWidth="max-w-4xl"
        footer={
          <>
            <Button variant="outline" disabled={saving} onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="gold" loading={saving} onClick={save}>
              Save Product
            </Button>
          </>
        }
      >
        {editing && (
          <form className="space-y-5" onSubmit={save}>
            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <section className="space-y-3 rounded-xl border border-ink-900/8 bg-ivory-100/50 p-4">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-ink-900/10 bg-gold-100 text-gold-700">
                  {productImage(editing) ? <img src={productImage(editing)} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={42} />}
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gold-400 bg-white px-4 py-4 text-sm font-semibold text-gold-800 transition hover:bg-gold-100">
                  <Upload size={17} />
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={updateImage} />
                </label>
                <Input label="Image URL" value={editing.imageUrl} onChange={updateField('imageUrl')} placeholder="https://..." />
                {editing.imageName && <p className="truncate text-xs font-medium text-ink-500">{editing.imageName}</p>}
              </section>

              <div className="space-y-5">
                <FormSection title="Basic Info">
                  <Input label="Product Name" value={editing.name} onChange={updateField('name')} placeholder="Product name" />
                  <Input label="SKU / Code" value={editing.sku} onChange={updateField('sku')} placeholder="SKU001" />
                  <Input label="Category" value={editing.category} onChange={updateField('category')} placeholder="Saree, Kurti, Combo" />
                  <Input label="Brand" value={editing.brand} onChange={updateField('brand')} placeholder="Rahuovelia" />
                  <Input label="HSN Code" value={editing.hsnCode} onChange={updateField('hsnCode')} placeholder="6204" />
                  <Input label="Stock Quantity" type="number" value={editing.stock} onChange={updateField('stock')} placeholder="10" />
                </FormSection>

                <FormSection title="Pricing & Business">
                  <Input label="Price" type="number" value={editing.price} onChange={updateField('price')} placeholder="3000" />
                  <Input label="Offer Price" type="number" value={editing.offerPrice} onChange={updateField('offerPrice')} placeholder="2500" />
                  <Input label="Discount %" type="number" value={editing.discountPercent} onChange={updateField('discountPercent')} placeholder="10" />
                  <Input label="GST %" type="number" value={editing.gstPercent} onChange={updateField('gstPercent')} placeholder="5" />
                  <Input label="PV" type="number" value={editing.pv} onChange={updateField('pv')} placeholder="30" />
                  <Input label="BV" type="number" value={editing.bv} onChange={updateField('bv')} placeholder="2500" />
                </FormSection>
              </div>
            </div>

            <FormSection title="Variant Details">
              <Input label="Size / Variant" value={editing.size} onChange={updateField('size')} placeholder="M, L, XL or Free Size" />
              <Input label="Color" value={editing.color} onChange={updateField('color')} placeholder="Maroon, Gold" />
              <Input label="Material" value={editing.material} onChange={updateField('material')} placeholder="Cotton silk" />
            </FormSection>

            <div className="grid gap-4 lg:grid-cols-3">
              <TextAreaField label="Description" value={editing.description} onChange={updateField('description')} placeholder="Product details shown to members" />
              <TextAreaField label="Highlights" value={editing.highlights} onChange={updateField('highlights')} placeholder="One detail per line" />
              <TextAreaField label="Care Instructions" value={editing.careInstructions} onChange={updateField('careInstructions')} placeholder="Wash care, warranty, return note" />
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-ink-900/10 bg-ivory-100/60 px-4 py-3">
              <input type="checkbox" checked={editing.active} onChange={updateField('active')} className="accent-gold-500" />
              <span>
                <span className="block text-sm font-semibold text-ink-900">Visible to members</span>
                <span className="text-xs text-ink-400">Inactive products stay in admin but disappear from Continue Shopping.</span>
              </span>
            </label>
          </form>
        )}
      </Modal>
    </div>
  )
}

function ProductStat({ label, value, tone = 'neutral' }) {
  return (
    <Card className="p-5" animate={false}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-semibold ${tone === 'danger' ? 'text-rose-mlm' : tone === 'success' ? 'text-emerald-mlm' : 'text-ink-950'}`}>
        {Number(value || 0).toLocaleString('en-IN')}
      </p>
    </Card>
  )
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-xl border border-ink-900/8 bg-white p-4">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{title}</h4>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-28 w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
      />
    </label>
  )
}

function toForm(product) {
  return {
    ...emptyProduct,
    ...product,
    price: String(product.price ?? ''),
    offerPrice: product.offerPrice === null || product.offerPrice === undefined ? '' : String(product.offerPrice),
    discountPercent: product.discountPercent === null || product.discountPercent === undefined ? '' : String(product.discountPercent),
    pv: product.pv === null || product.pv === undefined ? '' : String(product.pv),
    bv: product.bv === null || product.bv === undefined ? '' : String(product.bv),
    gstPercent: String(product.gstPercent ?? 0),
    stock: String(product.stock ?? 0),
  }
}

function toPayload(form) {
  const allowed = [
    'name',
    'sku',
    'category',
    'brand',
    'hsnCode',
    'size',
    'color',
    'material',
    'description',
    'highlights',
    'careInstructions',
    'price',
    'offerPrice',
    'discountPercent',
    'pv',
    'bv',
    'gstPercent',
    'stock',
    'imageUrl',
    'imageName',
    'imageMime',
    'imageData',
    'active',
  ]
  return Object.fromEntries(
    Object.entries(form)
      .filter(([key]) => allowed.includes(key))
      .map(([key, value]) => [
        key,
        numberFields.includes(key) && value !== '' ? Number(value) : value === '' ? null : value,
      ])
  )
}

function money(value) {
  return Number(value || 0).toLocaleString('en-IN')
}

function sellPrice(product) {
  const price = Number(product.price || 0)
  if (product.offerPrice) return Number(product.offerPrice)
  if (product.discountPercent) return Math.max(0, price - (price * Number(product.discountPercent)) / 100)
  return price
}

function productImage(product) {
  if (product.imageData && product.imageMime) return `data:${product.imageMime};base64,${product.imageData}`
  return product.imageUrl || ''
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
