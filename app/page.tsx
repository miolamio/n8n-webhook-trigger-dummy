'use client'

import { useState, useEffect, FormEvent } from 'react'

interface FormData {
  name: string
  email: string
  message: string
  company: string
  phone: string
}

interface ApiResponse {
  success: boolean
  timestamp?: string
  error?: string
}

export default function Home() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [isWebhookSaved, setIsWebhookSaved] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    company: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Load webhook URL from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('webhookUrl')
    if (saved) {
      setWebhookUrl(saved)
      setIsWebhookSaved(true)
    }
  }, [])

  const saveWebhookUrl = () => {
    if (!webhookUrl.trim()) {
      setStatus({ type: 'error', message: 'Введите URL вебхука' })
      return
    }
    try {
      new URL(webhookUrl)
      localStorage.setItem('webhookUrl', webhookUrl)
      setIsWebhookSaved(true)
      setStatus({ type: 'success', message: 'URL вебхука сохранён' })
      setTimeout(() => setStatus(null), 3000)
    } catch {
      setStatus({ type: 'error', message: 'Некорректный URL' })
    }
  }

  const clearWebhookUrl = () => {
    localStorage.removeItem('webhookUrl')
    setWebhookUrl('')
    setIsWebhookSaved(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!webhookUrl) {
      setStatus({ type: 'error', message: 'Сначала сохраните URL вебхука' })
      return
    }

    setIsLoading(true)
    setStatus(null)

    try {
      const response = await fetch('/api/send-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl,
          data: {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            ...(formData.company && { company: formData.company }),
            ...(formData.phone && { phone: formData.phone }),
          },
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setStatus({
          type: 'success',
          message: `Заявка отправлена! Время: ${new Date(result.timestamp!).toLocaleString('ru-RU')}`,
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: '',
          company: '',
          phone: '',
        })
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Ошибка при отправке',
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Ошибка сети. Проверьте подключение.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-n8n-dark mb-2">
          Тренировочный триггер заявок
        </h1>
        <p className="text-gray-600">
          Отправьте тестовую заявку на свой n8n вебхук
        </p>
      </div>

      {/* Webhook URL Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL вашего вебхука n8n
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => {
              setWebhookUrl(e.target.value)
              setIsWebhookSaved(false)
            }}
            placeholder="https://your-n8n.app/webhook/..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-n8n-pink"
            disabled={isWebhookSaved}
          />
          {isWebhookSaved ? (
            <button
              type="button"
              onClick={clearWebhookUrl}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Изменить
            </button>
          ) : (
            <button
              type="button"
              onClick={saveWebhookUrl}
              className="px-4 py-2 bg-n8n-pink text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Сохранить
            </button>
          )}
        </div>
        {isWebhookSaved && (
          <p className="mt-2 text-sm text-green-600">
            ✓ URL сохранён в браузере
          </p>
        )}
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-n8n-dark mb-4">Данные заявки</h2>

        {/* Required Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Иван Петров"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-n8n-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ivan@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-n8n-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сообщение <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Текст вашего сообщения..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-n8n-pink resize-none"
            />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <p className="text-sm text-gray-500 mb-4">Дополнительные поля (необязательные)</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Компания
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="ООО Рога и Копыта"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-n8n-pink"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 999 123-45-67"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-n8n-pink"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isWebhookSaved}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
            isLoading || !isWebhookSaved
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-n8n-pink hover:opacity-90'
          }`}
        >
          {isLoading ? 'Отправка...' : 'Отправить заявку'}
        </button>

        {!isWebhookSaved && (
          <p className="mt-2 text-sm text-amber-600 text-center">
            Сначала сохраните URL вебхука
          </p>
        )}
      </form>

      {/* Status Message */}
      {status && (
        <div
          className={`mt-4 p-4 rounded-lg text-center ${
            status.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Курс «n8n 2.0» — Занятие 2</p>
      </footer>
    </main>
  )
}
