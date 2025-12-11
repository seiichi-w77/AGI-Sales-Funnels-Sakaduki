'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Trash2, Play, Mail, MessageSquare, Clock, GitBranch, Zap } from 'lucide-react';
import { ScenarioNode } from './scenario-flow-editor';

interface NodeConfigPanelProps {
  node: ScenarioNode;
  onUpdate: (data: Record<string, unknown>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(node.data);

  useEffect(() => {
    setFormData(node.data);
  }, [node]);

  const handleChange = (key: string, value: unknown) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger':
        return <Play className="h-5 w-5 text-green-600" />;
      case 'email':
        return <Mail className="h-5 w-5 text-blue-600" />;
      case 'line':
        return <MessageSquare className="h-5 w-5 text-cyan-600" />;
      case 'delay':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'condition':
        return <GitBranch className="h-5 w-5 text-purple-600" />;
      case 'action':
        return <Zap className="h-5 w-5 text-pink-600" />;
      default:
        return null;
    }
  };

  const getNodeTitle = () => {
    switch (node.type) {
      case 'trigger':
        return 'Trigger Settings';
      case 'email':
        return 'Email Settings';
      case 'line':
        return 'LINE Settings';
      case 'delay':
        return 'Delay Settings';
      case 'condition':
        return 'Condition Settings';
      case 'action':
        return 'Action Settings';
      default:
        return 'Node Settings';
    }
  };

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={(formData.name as string) || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div className="space-y-2">
        <Label>Trigger Type</Label>
        <Select
          value={(formData.triggerType as string) || 'manual'}
          onValueChange={(value) => handleChange('triggerType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Start</SelectItem>
            <SelectItem value="form_submit">Form Submit</SelectItem>
            <SelectItem value="tag_added">Tag Added</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderEmailConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Step Name</Label>
        <Input
          value={(formData.name as string) || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter step name"
        />
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          value={(formData.subject as string) || ''}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="Email subject"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>From Name</Label>
          <Input
            value={(formData.fromName as string) || ''}
            onChange={(e) => handleChange('fromName', e.target.value)}
            placeholder="Sender name"
          />
        </div>
        <div className="space-y-2">
          <Label>From Email</Label>
          <Input
            type="email"
            value={(formData.fromEmail as string) || ''}
            onChange={(e) => handleChange('fromEmail', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Content (HTML)</Label>
        <Textarea
          value={(formData.htmlContent as string) || ''}
          onChange={(e) => handleChange('htmlContent', e.target.value)}
          placeholder="Email content..."
          rows={8}
        />
      </div>
    </div>
  );

  const renderLineConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Step Name</Label>
        <Input
          value={(formData.name as string) || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter step name"
        />
      </div>
      <div className="space-y-2">
        <Label>Message Type</Label>
        <Select
          value={(formData.messageType as string) || 'text'}
          onValueChange={(value) => handleChange('messageType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text Message</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="flex">Flex Message</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="rich">Rich Message</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Content</Label>
        <Textarea
          value={(formData.content as string) || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Message content..."
          rows={6}
        />
      </div>
    </div>
  );

  const renderDelayConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={(formData.name as string) || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div className="space-y-2">
        <Label>Delay Type</Label>
        <Select
          value={(formData.delayType as string) || 'relative'}
          onValueChange={(value) => handleChange('delayType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relative">Relative (after X time)</SelectItem>
            <SelectItem value="absolute">Absolute (specific date)</SelectItem>
            <SelectItem value="day_of_week">Day of Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.delayType === 'relative' && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label>Days</Label>
            <Input
              type="number"
              min={0}
              value={(formData.days as number) || 0}
              onChange={(e) => handleChange('days', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Hours</Label>
            <Input
              type="number"
              min={0}
              max={23}
              value={(formData.hours as number) || 0}
              onChange={(e) => handleChange('hours', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Minutes</Label>
            <Input
              type="number"
              min={0}
              max={59}
              value={(formData.minutes as number) || 0}
              onChange={(e) => handleChange('minutes', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {formData.delayType === 'absolute' && (
        <div className="space-y-2">
          <Label>Date & Time</Label>
          <Input
            type="datetime-local"
            value={(formData.absoluteDate as string) || ''}
            onChange={(e) => handleChange('absoluteDate', e.target.value)}
          />
        </div>
      )}

      {formData.delayType === 'day_of_week' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select
              value={String((formData.dayOfWeek as number) ?? 1)}
              onValueChange={(value) => handleChange('dayOfWeek', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={(formData.timeOfDay as string) || '09:00'}
              onChange={(e) => handleChange('timeOfDay', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={(formData.name as string) || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div className="space-y-2">
        <Label>Condition Type</Label>
        <Select
          value={(formData.conditionType as string) || 'tag'}
          onValueChange={(value) => handleChange('conditionType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tag">Has Tag</SelectItem>
            <SelectItem value="email_opened">Email Opened</SelectItem>
            <SelectItem value="email_clicked">Link Clicked</SelectItem>
            <SelectItem value="purchased">Purchased Product</SelectItem>
            <SelectItem value="custom">Custom Field</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Operator</Label>
        <Select
          value={(formData.operator as string) || 'equals'}
          onValueChange={(value) => handleChange('operator', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="not_contains">Not Contains</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Value</Label>
        <Input
          value={(formData.value as string) || ''}
          onChange={(e) => handleChange('value', e.target.value)}
          placeholder="Enter value"
        />
      </div>
    </div>
  );

  const renderActionConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={(formData.name as string) || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div className="space-y-2">
        <Label>Action Type</Label>
        <Select
          value={(formData.actionType as string) || 'addTag'}
          onValueChange={(value) => handleChange('actionType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="addTag">Add Tag</SelectItem>
            <SelectItem value="removeTag">Remove Tag</SelectItem>
            <SelectItem value="addToScenario">Add to Scenario</SelectItem>
            <SelectItem value="removeFromScenario">Remove from Scenario</SelectItem>
            <SelectItem value="notify">Send Notification</SelectItem>
            <SelectItem value="webhook">Call Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Value</Label>
        <Input
          value={(formData.value as string) || ''}
          onChange={(e) => handleChange('value', e.target.value)}
          placeholder="Enter value"
        />
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (node.type) {
      case 'trigger':
        return renderTriggerConfig();
      case 'email':
        return renderEmailConfig();
      case 'line':
        return renderLineConfig();
      case 'delay':
        return renderDelayConfig();
      case 'condition':
        return renderConditionConfig();
      case 'action':
        return renderActionConfig();
      default:
        return <div>Unknown node type</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getNodeIcon()}
          <h3 className="font-semibold">{getNodeTitle()}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Config Form */}
      <ScrollArea className="flex-1">
        <div className="p-4">{renderConfig()}</div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button variant="destructive" className="w-full" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
