'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Funnel,
  BookOpen,
  ShoppingCart,
  Video,
  Play,
  Store,
  Wand2,
  Check,
} from 'lucide-react'
import Link from 'next/link'

const funnelTypes = [
  {
    id: 'LEAD_MAGNET',
    name: 'Lead Magnet',
    description: 'Capture leads with a free offer',
    icon: Funnel,
    color: 'blue',
    steps: ['Opt-in Page', 'Thank You Page'],
  },
  {
    id: 'BOOK',
    name: 'Book Funnel',
    description: 'Sell your book or ebook',
    icon: BookOpen,
    color: 'purple',
    steps: ['Sales Page', 'Order Form', 'Upsell', 'Thank You'],
  },
  {
    id: 'CART',
    name: 'Cart Funnel',
    description: 'E-commerce checkout flow',
    icon: ShoppingCart,
    color: 'green',
    steps: ['Product Page', 'Cart', 'Checkout', 'Thank You'],
  },
  {
    id: 'WEBINAR',
    name: 'Webinar',
    description: 'Register attendees for webinar',
    icon: Video,
    color: 'orange',
    steps: ['Registration', 'Confirmation', 'Replay'],
  },
  {
    id: 'VSL',
    name: 'VSL Funnel',
    description: 'Video sales letter funnel',
    icon: Play,
    color: 'pink',
    steps: ['VSL Page', 'Order Form', 'Upsell', 'Downsell', 'Thank You'],
  },
  {
    id: 'STOREFRONT',
    name: 'Storefront',
    description: 'Multi-product store',
    icon: Store,
    color: 'cyan',
    steps: ['Store Page', 'Product Pages', 'Cart', 'Checkout'],
  },
  {
    id: 'CUSTOM',
    name: 'Custom',
    description: 'Build from scratch',
    icon: Wand2,
    color: 'slate',
    steps: ['Start with blank canvas'],
  },
]

const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500', icon: 'text-blue-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', icon: 'text-purple-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500', icon: 'text-green-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500', icon: 'text-orange-500' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500', icon: 'text-pink-500' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500', icon: 'text-cyan-500' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500', icon: 'text-slate-500' },
}

export default function NewFunnelPage() {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [funnelName, setFunnelName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setStep('details')
  }

  const handleCreateFunnel = async () => {
    if (!selectedType || !funnelName.trim()) return

    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/funnels', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     workspaceId: 'current-workspace-id',
      //     name: funnelName,
      //     type: selectedType,
      //   }),
      // })
      // const { funnel } = await response.json()

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Navigate to funnel editor
      router.push('/dashboard/funnels/new-funnel-id')
    } catch (error) {
      console.error('Error creating funnel:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedFunnelType = funnelTypes.find((t) => t.id === selectedType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-slate-400 hover:text-white"
        >
          <Link href="/dashboard/funnels">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Funnel</h1>
          <p className="text-slate-400">
            {step === 'type' ? 'Choose a funnel type to get started' : 'Give your funnel a name'}
          </p>
        </div>
      </div>

      {/* Step 1: Choose Type */}
      {step === 'type' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {funnelTypes.map((type) => {
            const colors = colorClasses[type.color]
            return (
              <Card
                key={type.id}
                className={`cursor-pointer border-slate-800 bg-slate-900 hover:border-slate-600 transition-all ${
                  selectedType === type.id ? `${colors.border} border-2` : ''
                }`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-3 ${colors.bg}`}>
                      <type.icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    {selectedType === type.id && (
                      <div className={`rounded-full p-1 ${colors.bg}`}>
                        <Check className={`h-4 w-4 ${colors.icon}`} />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-white mt-4">{type.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Included Steps
                    </p>
                    <ul className="space-y-1">
                      {type.steps.map((step, index) => (
                        <li
                          key={index}
                          className="text-sm text-slate-400 flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Step 2: Funnel Details */}
      {step === 'details' && selectedFunnelType && (
        <Card className="border-slate-800 bg-slate-900 max-w-xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${colorClasses[selectedFunnelType.color].bg}`}>
                <selectedFunnelType.icon
                  className={`h-6 w-6 ${colorClasses[selectedFunnelType.color].icon}`}
                />
              </div>
              <div>
                <CardTitle className="text-white">{selectedFunnelType.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {selectedFunnelType.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="funnelName" className="text-white">
                Funnel Name
              </Label>
              <Input
                id="funnelName"
                placeholder="e.g., Free Ebook Lead Magnet"
                value={funnelName}
                onChange={(e) => setFunnelName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">
                This is the internal name for your funnel
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400">Pages to be created:</p>
              <ul className="space-y-1">
                {selectedFunnelType.steps.map((step, index) => (
                  <li
                    key={index}
                    className="text-sm text-slate-300 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setStep('type')}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateFunnel}
                disabled={!funnelName.trim() || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Funnel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
