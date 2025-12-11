'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Check,
  Sparkles,
  Users,
  Mail,
  Layers,
  Download,
  ExternalLink,
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For individuals getting started',
    features: [
      '1 Funnel',
      '1,000 Contacts',
      '1,000 Email sends/month',
      'Basic analytics',
      'Community support',
    ],
    limits: { funnels: 1, contacts: 1000, emails: 1000 },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 4980,
    description: 'For growing businesses',
    features: [
      '5 Funnels',
      '5,000 Contacts',
      '10,000 Email sends/month',
      'Advanced analytics',
      'Email support',
      'Custom domain',
    ],
    limits: { funnels: 5, contacts: 5000, emails: 10000 },
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 14980,
    description: 'For established businesses',
    features: [
      'Unlimited Funnels',
      '25,000 Contacts',
      '50,000 Email sends/month',
      'Priority support',
      'LINE integration',
      'Affiliate program',
      'Team members (5)',
    ],
    limits: { funnels: -1, contacts: 25000, emails: 50000 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49980,
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Unlimited Contacts',
      'Unlimited Email sends',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Unlimited team members',
    ],
    limits: { funnels: -1, contacts: -1, emails: -1 },
  },
];

const mockInvoices = [
  { id: 'INV-001', date: '2024-01-01', amount: 4980, status: 'PAID' },
  { id: 'INV-002', date: '2024-02-01', amount: 4980, status: 'PAID' },
  { id: 'INV-003', date: '2024-03-01', amount: 4980, status: 'PENDING' },
];

const currentUsage = {
  funnels: { used: 3, limit: 5 },
  contacts: { used: 2345, limit: 5000 },
  emails: { used: 4567, limit: 10000 },
};

export default function BillingPage() {
  const t = useTranslations('billing');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const currentPlan = plans[1]; // Starter

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{t('currentPlan')}</CardTitle>
                    <CardDescription>Your current subscription</CardDescription>
                  </div>
                  <Badge className="text-lg px-3 py-1">{currentPlan.name}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly Price</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(currentPlan.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span>April 1, 2024</span>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowUpgrade(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('upgrade')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage This Month</CardTitle>
                <CardDescription>Your resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Funnels
                    </span>
                    <span>
                      {currentUsage.funnels.used} / {currentUsage.funnels.limit}
                    </span>
                  </div>
                  <Progress
                    value={(currentUsage.funnels.used / currentUsage.funnels.limit) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contacts
                    </span>
                    <span>
                      {currentUsage.contacts.used.toLocaleString()} /{' '}
                      {currentUsage.contacts.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(currentUsage.contacts.used / currentUsage.contacts.limit) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Emails Sent
                    </span>
                    <span>
                      {currentUsage.emails.used.toLocaleString()} /{' '}
                      {currentUsage.emails.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(currentUsage.emails.used / currentUsage.emails.limit) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={plan.popular ? 'border-primary shadow-lg' : ''}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center text-sm py-1 rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={
                      plan.id === currentPlan.id
                        ? 'outline'
                        : plan.popular
                        ? 'default'
                        : 'outline'
                    }
                    disabled={plan.id === currentPlan.id}
                  >
                    {plan.id === currentPlan.id ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('invoices')}</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        {new Date(invoice.date).toLocaleDateString('ja-JP')}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={invoice.status === 'PAID' ? 'success' : 'warning'}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentMethod')}</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                </div>
                <Badge>Default</Badge>
              </div>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Portal</CardTitle>
              <CardDescription>
                Manage your subscription through Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Billing Portal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that fits your needs
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2 py-4">
            {plans.slice(2).map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <Button className="w-full">Select {plan.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgrade(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
