'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Upload, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'

const PROPERTY_TYPES = ['Condo', 'House', 'Townhouse', 'Apartment', 'Villa', 'Studio']
const THAI_CITIES = ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Hua Hin', 'Koh Samui', 'Krabi', 'Ayutthaya']
const AMENITY_OPTIONS = ['Pool', 'Parking', 'WiFi', 'EVCharger', 'Furnished', 'PetFriendly', 'Gym', 'Security', 'Elevator', 'Balcony', 'Garden', 'AirCon']

interface FormData {
  // Step 1
  propertyType: string
  address: string
  city: string
  price: string
  bedrooms: string
  bathrooms: string
  size: string
  amenities: string[]
  description_en: string
  // Step 2
  images: string[]
  virtualTourUrl: string
  // Step 3
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  ownerLine: string
  ownerWhatsapp: string
}

const INITIAL: FormData = {
  propertyType: '', address: '', city: '', price: '', bedrooms: '', bathrooms: '', size: '',
  amenities: [], description_en: '',
  images: [], virtualTourUrl: '',
  ownerName: '', ownerEmail: '', ownerPhone: '', ownerLine: '', ownerWhatsapp: '',
}

export default function SubmitPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const t = useTranslations('submit')

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [aiLoading, setAiLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const totalSteps = 3

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  async function generateDescription() {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType: form.propertyType,
          city: form.city,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          size: form.size,
          amenities: form.amenities,
          locale,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        update('description_en', data.description ?? '')
      }
    } catch {
      // silently ignore
    } finally {
      setAiLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingImages(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'doublen_realty')
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        if (res.ok) {
          const data = await res.json()
          uploaded.push(data.secure_url)
        }
      }
      update('images', [...form.images, ...uploaded])
    } finally {
      setUploadingImages(false)
    }
  }

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (s === 1) {
      if (!form.propertyType) errs.propertyType = 'Property type is required'
      if (!form.address.trim()) errs.address = 'Address is required'
      if (!form.city) errs.city = 'City is required'
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Valid price is required'
    }
    if (s === 3) {
      if (!form.ownerName.trim()) errs.ownerName = 'Your name is required'
      if (!form.ownerEmail.trim()) errs.ownerEmail = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) errs.ownerEmail = 'Enter a valid email address'
      if (!form.ownerPhone.trim()) errs.ownerPhone = 'Phone number is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validateStep(3)) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { ownerEmail, ownerPhone, ownerName, ownerLine, ownerWhatsapp, images, ...propertyData } = form
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail,
          ownerPhone,
          dataJson: JSON.stringify({ ...propertyData, ownerName, ownerLine, ownerWhatsapp, locale }),
          imagesJson: JSON.stringify(images),
        }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const d = await res.json().catch(() => ({}))
        setSubmitError(d.error ?? 'Submission failed. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">{t('success')}</h1>
        <p className="text-gray-500 text-center max-w-sm">
          We&apos;ll review your listing and get back to you within 1-2 business days.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-blue-600' : 'text-gray-400'}`}>
                {s === 1 ? t('step1') : s === 2 ? t('step2') : t('step3')}
              </span>
              {s < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Property Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label>Property Type</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update('propertyType', type)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors
                        ${form.propertyType === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>City</Label>
                <select
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                >
                  <option value="">Select a city</option>
                  {THAI_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <Label>Full Address</Label>
                <Input
                  className="mt-1.5"
                  placeholder="Street address, building, floor..."
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Rent (THB)</Label>
                  <Input className="mt-1.5" type="number" placeholder="e.g. 25000" value={form.price} onChange={(e) => update('price', e.target.value)} />
                </div>
                <div>
                  <Label>Size (sqm)</Label>
                  <Input className="mt-1.5" type="number" placeholder="e.g. 65" value={form.size} onChange={(e) => update('size', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bedrooms</Label>
                  <Input className="mt-1.5" type="number" placeholder="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} />
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Input className="mt-1.5" type="number" placeholder="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors
                        ${form.amenities.includes(a) ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDescription}
                    disabled={aiLoading}
                    className="text-xs h-7 gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiLoading ? t('ai_generating') : t('ai_generate')}
                  </Button>
                </div>
                <Textarea
                  rows={4}
                  placeholder="Describe your property..."
                  value={form.description_en}
                  onChange={(e) => update('description_en', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Photos</Label>
                <div className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">Upload photos of your property</p>
                  <label className="cursor-pointer">
                    <span className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
                      {uploadingImages ? 'Uploading...' : 'Choose Files'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                  </label>
                  {form.images.length > 0 && (
                    <p className="text-xs text-green-600 mt-3">{form.images.length} photo(s) uploaded</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Virtual Tour URL (optional)</Label>
                <Input
                  className="mt-1.5"
                  type="url"
                  placeholder="https://..."
                  value={form.virtualTourUrl}
                  onChange={(e) => update('virtualTourUrl', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label>Your Name <span className="text-red-500">*</span></Label>
                <Input className={`mt-1.5 ${errors.ownerName ? 'border-red-400' : ''}`} placeholder="Full name" value={form.ownerName} onChange={(e) => { update('ownerName', e.target.value); setErrors(p => ({ ...p, ownerName: undefined })) }} />
                {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>}
              </div>
              <div>
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input className={`mt-1.5 ${errors.ownerEmail ? 'border-red-400' : ''}`} type="email" placeholder="you@example.com" value={form.ownerEmail} onChange={(e) => { update('ownerEmail', e.target.value); setErrors(p => ({ ...p, ownerEmail: undefined })) }} />
                {errors.ownerEmail && <p className="text-xs text-red-500 mt-1">{errors.ownerEmail}</p>}
              </div>
              <div>
                <Label>Phone <span className="text-red-500">*</span></Label>
                <Input className={`mt-1.5 ${errors.ownerPhone ? 'border-red-400' : ''}`} type="tel" placeholder="+66..." value={form.ownerPhone} onChange={(e) => { update('ownerPhone', e.target.value); setErrors(p => ({ ...p, ownerPhone: undefined })) }} />
                {errors.ownerPhone && <p className="text-xs text-red-500 mt-1">{errors.ownerPhone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>LINE ID (optional)</Label>
                  <Input className="mt-1.5" placeholder="@lineid" value={form.ownerLine} onChange={(e) => update('ownerLine', e.target.value)} />
                </div>
                <div>
                  <Label>WhatsApp (optional)</Label>
                  <Input className="mt-1.5" placeholder="+66..." value={form.ownerWhatsapp} onChange={(e) => update('ownerWhatsapp', e.target.value)} />
                </div>
              </div>
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}

            {step < totalSteps ? (
              <Button type="button" onClick={() => { if (validateStep(step)) setStep((s) => s + 1) }} className="bg-blue-600 hover:bg-blue-700 text-white">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? 'Submitting...' : t('submit')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
