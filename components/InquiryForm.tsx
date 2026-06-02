'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { MessageCircle, Phone, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface LandlordContact {
  line?: string
  whatsapp?: string
  wechat?: string
}

interface InquiryFormProps {
  propertyId: string
  propertyTitle: string
  landlordContact?: LandlordContact
}

const CONTACT_TYPES = ['line', 'wechat', 'whatsapp', 'email', 'phone'] as const
type ContactType = (typeof CONTACT_TYPES)[number]

const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactType: z.enum(CONTACT_TYPES),
  contactValue: z.string().min(2, 'Contact value is required'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  message: z.string().optional(),
})

type InquiryFormValues = z.infer<typeof inquirySchema>

const CONTACT_PLACEHOLDERS: Record<ContactType, string> = {
  line: 'LINE ID',
  wechat: 'WeChat ID',
  whatsapp: 'WhatsApp number (with country code)',
  email: 'your@email.com',
  phone: 'Phone number',
}

interface DirectChatButtonProps {
  platform: 'line' | 'whatsapp' | 'wechat'
  value: string
  label: string
  className?: string
}

function buildDirectLink(platform: 'line' | 'whatsapp' | 'wechat', value: string): string {
  switch (platform) {
    case 'line':
      return `https://line.me/ti/p/~${encodeURIComponent(value)}`
    case 'whatsapp':
      // Strip non-digits
      return `https://wa.me/${value.replace(/\D/g, '')}`
    case 'wechat':
      // WeChat doesn't have a universal deep link; open web for instructions
      return `weixin://dl/chat?${encodeURIComponent(value)}`
    default:
      return '#'
  }
}

function DirectChatButton({ platform, value, label, className }: DirectChatButtonProps) {
  const PLATFORM_STYLES = {
    line: 'bg-[#06C755] hover:bg-[#05a847] text-white',
    whatsapp: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white',
    wechat: 'bg-[#07C160] hover:bg-[#06a853] text-white',
  }

  const PLATFORM_ICONS = {
    line: (
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125zM11.5 13.868c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.348 0 .63.285.63.63v3.997l2.162-4.273a.63.63 0 0 1 .563-.354c.348 0 .63.285.63.63v5.131c0 .344-.282.629-.63.629-.346 0-.627-.285-.627-.629V9.24l-2.163 4.274a.631.631 0 0 1-.565.354zm-4.5 0c-.347 0-.63-.285-.63-.629V8.108c0-.345.283-.63.63-.63.346 0 .629.285.629.63v5.131c0 .344-.283.629-.629.629zm-2.386-5.76H2.858c-.344 0-.627.285-.627.63v5.131c0 .344.283.629.627.629.347 0 .63-.285.63-.629v-1.757h1.126c.345 0 .628-.283.628-.629 0-.345-.283-.63-.628-.63H3.488V9.863H4.614c.345 0 .627-.281.627-.63 0-.345-.282-.63-.627-.63zM24 10.314C24 4.943 18.615.414 12 .414S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314z" />
      </svg>
    ),
    whatsapp: (
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
    wechat: (
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c-.268-.688-.405-1.42-.405-2.187C8.286 10.37 11.61 7.5 15.68 7.5c.306 0 .606.019.9.057C15.993 4.394 12.707 2.188 8.69 2.188zM5.5 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM24 14.302c0-3.374-3.234-6.11-7.223-6.11-4 0-7.222 2.736-7.222 6.11 0 3.376 3.222 6.11 7.222 6.11.844 0 1.652-.128 2.407-.358a.65.65 0 0 1 .547.074l1.504.88a.25.25 0 0 0 .127.042.225.225 0 0 0 .222-.225c0-.055-.023-.11-.037-.164l-.299-1.134a.45.45 0 0 1 .164-.508C23.122 17.929 24 16.21 24 14.302zm-9.5 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4.5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
      </svg>
    ),
  }

  return (
    <a
      href={buildDirectLink(platform, value)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm',
        PLATFORM_STYLES[platform],
        className,
      )}
    >
      {PLATFORM_ICONS[platform]}
      {label}
    </a>
  )
}

export default function InquiryForm({
  propertyId,
  propertyTitle,
  landlordContact,
}: InquiryFormProps) {
  const t = useTranslations('property')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      contactType: 'line',
    },
  })

  const contactType = watch('contactType')

  const onSubmit = async (data: InquiryFormValues) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          propertyId,
          propertyTitle,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.message ?? 'Failed to send inquiry')
      }

      toast.success(t('inquirySent'), {
        description: t('inquirySentDesc'),
      })
      reset()
    } catch (error) {
      toast.error(t('inquiryError'), {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const hasDirectContacts =
    landlordContact &&
    (landlordContact.line || landlordContact.whatsapp || landlordContact.wechat)

  return (
    <div id="inquiry" className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{t('contactLandlord')}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{propertyTitle}</p>
      </div>

      {/* Direct chat buttons */}
      {hasDirectContacts && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t('chatDirectly')}
          </p>
          {landlordContact?.line && (
            <DirectChatButton
              platform="line"
              value={landlordContact.line}
              label={`Chat on LINE`}
            />
          )}
          {landlordContact?.whatsapp && (
            <DirectChatButton
              platform="whatsapp"
              value={landlordContact.whatsapp}
              label={`Message on WhatsApp`}
            />
          )}
          {landlordContact?.wechat && (
            <DirectChatButton
              platform="wechat"
              value={landlordContact.wechat}
              label={`Message on WeChat`}
            />
          )}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or send an inquiry</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>
      )}

      {/* Inquiry form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inq-name" className="text-sm font-medium text-gray-700">
            {t('yourName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="inq-name"
            placeholder={t('yourNamePlaceholder')}
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Contact type + value */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-gray-700">
            {t('contactMethod')} <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Select
              defaultValue="line"
              onValueChange={(val) => setValue('contactType', val as ContactType)}
            >
              <SelectTrigger className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    <span className="flex items-center gap-1.5">
                      {ct === 'line' && <MessageCircle className="size-3.5 text-[#06C755]" />}
                      {ct === 'whatsapp' && <MessageCircle className="size-3.5 text-[#25D366]" />}
                      {ct === 'wechat' && <MessageCircle className="size-3.5 text-[#07C160]" />}
                      {ct === 'email' && <Send className="size-3.5 text-blue-500" />}
                      {ct === 'phone' && <Phone className="size-3.5 text-gray-500" />}
                      {ct.charAt(0).toUpperCase() + ct.slice(1)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 flex flex-col gap-1">
              <Input
                placeholder={CONTACT_PLACEHOLDERS[contactType] ?? 'Your contact'}
                aria-invalid={!!errors.contactValue}
                {...register('contactValue')}
              />
              {errors.contactValue && (
                <p className="text-xs text-red-600">{errors.contactValue.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferred date */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inq-date" className="text-sm font-medium text-gray-700">
            {t('preferredDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="inq-date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            aria-invalid={!!errors.preferredDate}
            {...register('preferredDate')}
            className="w-full"
          />
          {errors.preferredDate && (
            <p className="text-xs text-red-600">{errors.preferredDate.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inq-message" className="text-sm font-medium text-gray-700">
            {t('message')}{' '}
            <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>
          </Label>
          <Textarea
            id="inq-message"
            rows={3}
            placeholder={t('messagePlaceholder')}
            className="resize-none"
            {...register('message')}
          />
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('sending')}
            </>
          ) : (
            <>
              <Send className="size-4" />
              {t('sendInquiry')}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
