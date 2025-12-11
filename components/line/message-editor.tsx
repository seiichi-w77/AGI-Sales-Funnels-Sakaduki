'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Image,
  Video,
  Music,
  Smile,
  LayoutGrid,
  MousePointer,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// メッセージタイプ
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'STICKER' | 'BUTTON' | 'CAROUSEL';

// メッセージ内容の型
export interface TextContent {
  text: string;
  variables?: string[];
}

export interface ImageContent {
  originalContentUrl: string;
  previewImageUrl: string;
  notificationText?: string;
  clickableAreas?: {
    area: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    action: { type: 'url' | 'message' | 'none'; url?: string; message?: string };
  }[];
}

export interface ButtonContent {
  title: string;
  text: string;
  imageUrl?: string;
  buttons: {
    label: string;
    action: { type: 'url' | 'message' | 'postback'; value: string };
  }[];
  tapLimit?: 'once_total' | 'once_per_button' | 'unlimited';
  notificationText?: string;
}

export interface VideoContent {
  originalContentUrl: string;
  previewImageUrl?: string;
  notificationText?: string;
}

export interface AudioContent {
  originalContentUrl: string;
  duration: number;
}

export interface StickerContent {
  packageId: string;
  stickerId: string;
}

export interface CarouselContent {
  panels: {
    title: string;
    text: string;
    imageUrl: string;
    buttons: {
      label: string;
      action: { type: 'url' | 'message' | 'postback'; value: string };
    }[];
  }[];
  notificationText?: string;
}

export interface LineMessage {
  id: string;
  type: MessageType;
  content: TextContent | ImageContent | ButtonContent | VideoContent | AudioContent | StickerContent | CarouselContent;
}

// 変数プレースホルダー
const VARIABLES = [
  { key: '%line_name%', label: 'LINE登録名' },
  { key: '%name%', label: 'ユーザー名' },
  { key: '%line_id%', label: 'LINE友達ID' },
  { key: '%master_id%', label: 'シナリオ読者ID' },
];

interface MessageEditorProps {
  messages: LineMessage[];
  onChange: (messages: LineMessage[]) => void;
  maxMessages?: number;
}

export function MessageEditor({ messages, onChange, maxMessages = 5 }: MessageEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    messages.length > 0 ? 0 : null
  );

  // メッセージ追加
  const addMessage = useCallback((type: MessageType) => {
    if (messages.length >= maxMessages) return;

    const id = `msg_${Date.now()}`;
    let content: LineMessage['content'];

    switch (type) {
      case 'TEXT':
        content = { text: '' };
        break;
      case 'IMAGE':
        content = { originalContentUrl: '', previewImageUrl: '' };
        break;
      case 'BUTTON':
        content = { title: '', text: '', buttons: [] };
        break;
      case 'VIDEO':
        content = { originalContentUrl: '' };
        break;
      case 'AUDIO':
        content = { originalContentUrl: '', duration: 0 };
        break;
      case 'STICKER':
        content = { packageId: '', stickerId: '' };
        break;
      case 'CAROUSEL':
        content = { panels: [] };
        break;
      default:
        content = { text: '' };
    }

    const newMessages = [...messages, { id, type, content }];
    onChange(newMessages);
    setSelectedIndex(newMessages.length - 1);
  }, [messages, maxMessages, onChange]);

  // メッセージ削除
  const removeMessage = useCallback((index: number) => {
    const newMessages = messages.filter((_, i) => i !== index);
    onChange(newMessages);
    if (selectedIndex === index) {
      setSelectedIndex(newMessages.length > 0 ? Math.max(0, index - 1) : null);
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [messages, selectedIndex, onChange]);

  // メッセージ移動
  const moveMessage = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= messages.length) return;

    const newMessages = [...messages];
    [newMessages[index], newMessages[newIndex]] = [newMessages[newIndex], newMessages[index]];
    onChange(newMessages);
    setSelectedIndex(newIndex);
  }, [messages, onChange]);

  // メッセージ更新
  const updateMessage = useCallback((index: number, content: LineMessage['content']) => {
    const newMessages = messages.map((msg, i) =>
      i === index ? { ...msg, content } : msg
    );
    onChange(newMessages);
  }, [messages, onChange]);

  const selectedMessage = selectedIndex !== null ? messages[selectedIndex] : null;

  return (
    <div className="grid grid-cols-3 gap-4 min-h-[400px]">
      {/* メッセージリスト */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">メッセージ ({messages.length}/{maxMessages})</h4>
        </div>

        <div className="space-y-2">
          {messages.map((msg, index) => (
            <Card
              key={msg.id}
              className={`cursor-pointer transition-colors ${
                selectedIndex === index ? 'border-primary bg-accent/50' : 'hover:bg-accent/30'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <MessageTypeIcon type={msg.type} />
                <span className="flex-1 text-sm truncate">
                  {getMessagePreview(msg)}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveMessage(index, 'up'); }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveMessage(index, 'down'); }}
                    disabled={index === messages.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => { e.stopPropagation(); removeMessage(index); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {messages.length < maxMessages && (
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-16 flex-col gap-1"
              onClick={() => addMessage('TEXT')}
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs">テキスト</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-16 flex-col gap-1"
              onClick={() => addMessage('IMAGE')}
            >
              <Image className="h-4 w-4" />
              <span className="text-xs">画像</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-16 flex-col gap-1"
              onClick={() => addMessage('BUTTON')}
            >
              <MousePointer className="h-4 w-4" />
              <span className="text-xs">ボタン</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-16 flex-col gap-1"
              onClick={() => addMessage('CAROUSEL')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs">カルーセル</span>
            </Button>
          </div>
        )}
      </div>

      {/* エディタ */}
      <div className="col-span-2">
        {selectedMessage ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageTypeIcon type={selectedMessage.type} />
                {getMessageTypeLabel(selectedMessage.type)}メッセージ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMessage.type === 'TEXT' && (
                <TextMessageEditor
                  content={selectedMessage.content as TextContent}
                  onChange={(content) => updateMessage(selectedIndex!, content)}
                />
              )}
              {selectedMessage.type === 'IMAGE' && (
                <ImageMessageEditor
                  content={selectedMessage.content as ImageContent}
                  onChange={(content) => updateMessage(selectedIndex!, content)}
                />
              )}
              {selectedMessage.type === 'BUTTON' && (
                <ButtonMessageEditor
                  content={selectedMessage.content as ButtonContent}
                  onChange={(content) => updateMessage(selectedIndex!, content)}
                />
              )}
              {selectedMessage.type === 'VIDEO' && (
                <VideoMessageEditor
                  content={selectedMessage.content as VideoContent}
                  onChange={(content) => updateMessage(selectedIndex!, content)}
                />
              )}
              {selectedMessage.type === 'AUDIO' && (
                <AudioMessageEditor
                  content={selectedMessage.content as AudioContent}
                  onChange={(content) => updateMessage(selectedIndex!, content)}
                />
              )}
              {selectedMessage.type === 'STICKER' && (
                <StickerMessageEditor
                  content={selectedMessage.content as StickerContent}
                  onChange={(content) => updateMessage(selectedIndex!, content)}
                />
              )}
              {selectedMessage.type === 'CAROUSEL' && (
                <CarouselMessageEditor
                  content={selectedMessage.content as CarouselContent}
                  onChange={(content) => updateMessage(selectedIndex!, content)}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>メッセージを追加してください</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// テキストメッセージエディタ
function TextMessageEditor({
  content,
  onChange,
}: {
  content: TextContent;
  onChange: (content: TextContent) => void;
}) {
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('text-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = content.text.substring(0, start) + variable + content.text.substring(end);
      onChange({ ...content, text: newText });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="text-content">メッセージ本文</Label>
        <Textarea
          id="text-content"
          placeholder="メッセージを入力してください"
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          rows={6}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">変数を挿入</Label>
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map((v) => (
            <Button
              key={v.key}
              variant="outline"
              size="sm"
              onClick={() => insertVariable(v.key)}
            >
              {v.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 画像メッセージエディタ
function ImageMessageEditor({
  content,
  onChange,
}: {
  content: ImageContent;
  onChange: (content: ImageContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="image-url">画像URL</Label>
        <Input
          id="image-url"
          placeholder="https://example.com/image.jpg"
          value={content.originalContentUrl}
          onChange={(e) => onChange({
            ...content,
            originalContentUrl: e.target.value,
            previewImageUrl: e.target.value,
          })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notification-text">通知テキスト</Label>
        <Input
          id="notification-text"
          placeholder="画像を送信しました"
          value={content.notificationText || ''}
          onChange={(e) => onChange({ ...content, notificationText: e.target.value })}
        />
      </div>
      {content.originalContentUrl && (
        <div className="border rounded-lg p-4">
          <img
            src={content.originalContentUrl}
            alt="プレビュー"
            className="max-w-full max-h-48 mx-auto rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect fill="%23eee" width="200" height="150"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">画像読込エラー</text></svg>';
            }}
          />
        </div>
      )}
    </div>
  );
}

// ボタンメッセージエディタ
function ButtonMessageEditor({
  content,
  onChange,
}: {
  content: ButtonContent;
  onChange: (content: ButtonContent) => void;
}) {
  const addButton = () => {
    if (content.buttons.length >= 4) return;
    onChange({
      ...content,
      buttons: [...content.buttons, { label: '', action: { type: 'url', value: '' } }],
    });
  };

  const removeButton = (index: number) => {
    onChange({
      ...content,
      buttons: content.buttons.filter((_, i) => i !== index),
    });
  };

  const updateButton = (index: number, updates: Partial<ButtonContent['buttons'][0]>) => {
    onChange({
      ...content,
      buttons: content.buttons.map((btn, i) =>
        i === index ? { ...btn, ...updates } : btn
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="button-title">タイトル</Label>
        <Input
          id="button-title"
          placeholder="タイトルを入力"
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="button-text">本文</Label>
        <Textarea
          id="button-text"
          placeholder="本文を入力"
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="button-image">画像URL（任意）</Label>
        <Input
          id="button-image"
          placeholder="https://example.com/image.jpg"
          value={content.imageUrl || ''}
          onChange={(e) => onChange({ ...content, imageUrl: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>ボタン（最大4つ）</Label>
          {content.buttons.length < 4 && (
            <Button variant="outline" size="sm" onClick={addButton}>
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          )}
        </div>
        {content.buttons.map((btn, index) => (
          <Card key={index}>
            <CardContent className="p-3 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="ボタンラベル"
                  value={btn.label}
                  onChange={(e) => updateButton(index, { label: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeButton(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Select
                  value={btn.action.type}
                  onValueChange={(value: 'url' | 'message' | 'postback') =>
                    updateButton(index, { action: { ...btn.action, type: value } })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="message">メッセージ</SelectItem>
                    <SelectItem value="postback">ポストバック</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={btn.action.type === 'url' ? 'https://...' : 'アクション値'}
                  value={btn.action.value}
                  onChange={(e) => updateButton(index, { action: { ...btn.action, value: e.target.value } })}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-2">
        <Label>タップ制限</Label>
        <Select
          value={content.tapLimit || 'unlimited'}
          onValueChange={(value: 'once_total' | 'once_per_button' | 'unlimited') =>
            onChange({ ...content, tapLimit: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unlimited">無制限</SelectItem>
            <SelectItem value="once_total">合計1回のみ</SelectItem>
            <SelectItem value="once_per_button">ボタンごとに1回</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// 動画メッセージエディタ
function VideoMessageEditor({
  content,
  onChange,
}: {
  content: VideoContent;
  onChange: (content: VideoContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="video-url">動画URL</Label>
        <Input
          id="video-url"
          placeholder="https://example.com/video.mp4"
          value={content.originalContentUrl}
          onChange={(e) => onChange({ ...content, originalContentUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">MP4形式、最大200MB</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-preview">サムネイルURL（任意）</Label>
        <Input
          id="video-preview"
          placeholder="https://example.com/thumbnail.jpg"
          value={content.previewImageUrl || ''}
          onChange={(e) => onChange({ ...content, previewImageUrl: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-notification">通知テキスト</Label>
        <Input
          id="video-notification"
          placeholder="動画を送信しました"
          value={content.notificationText || ''}
          onChange={(e) => onChange({ ...content, notificationText: e.target.value })}
        />
      </div>
    </div>
  );
}

// 音声メッセージエディタ
function AudioMessageEditor({
  content,
  onChange,
}: {
  content: AudioContent;
  onChange: (content: AudioContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="audio-url">音声URL</Label>
        <Input
          id="audio-url"
          placeholder="https://example.com/audio.m4a"
          value={content.originalContentUrl}
          onChange={(e) => onChange({ ...content, originalContentUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">M4A/MP3形式、最大200MB</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="audio-duration">再生時間（ミリ秒）</Label>
        <Input
          id="audio-duration"
          type="number"
          placeholder="60000"
          value={content.duration || ''}
          onChange={(e) => onChange({ ...content, duration: parseInt(e.target.value) || 0 })}
        />
      </div>
    </div>
  );
}

// スタンプメッセージエディタ
function StickerMessageEditor({
  content,
  onChange,
}: {
  content: StickerContent;
  onChange: (content: StickerContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="sticker-package">パッケージID</Label>
        <Input
          id="sticker-package"
          placeholder="446"
          value={content.packageId}
          onChange={(e) => onChange({ ...content, packageId: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sticker-id">スタンプID</Label>
        <Input
          id="sticker-id"
          placeholder="1988"
          value={content.stickerId}
          onChange={(e) => onChange({ ...content, stickerId: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        <a href="https://developers.line.biz/ja/docs/messaging-api/sticker-list/" target="_blank" rel="noopener noreferrer" className="underline">
          利用可能なスタンプ一覧
        </a>
      </p>
    </div>
  );
}

// カルーセルメッセージエディタ
function CarouselMessageEditor({
  content,
  onChange,
}: {
  content: CarouselContent;
  onChange: (content: CarouselContent) => void;
}) {
  const addPanel = () => {
    if (content.panels.length >= 10) return;
    onChange({
      ...content,
      panels: [...content.panels, { title: '', text: '', imageUrl: '', buttons: [] }],
    });
  };

  const removePanel = (index: number) => {
    onChange({
      ...content,
      panels: content.panels.filter((_, i) => i !== index),
    });
  };

  const updatePanel = (index: number, updates: Partial<CarouselContent['panels'][0]>) => {
    onChange({
      ...content,
      panels: content.panels.map((panel, i) =>
        i === index ? { ...panel, ...updates } : panel
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>パネル（2〜10枚）</Label>
        {content.panels.length < 10 && (
          <Button variant="outline" size="sm" onClick={addPanel}>
            <Plus className="h-4 w-4 mr-1" />
            追加
          </Button>
        )}
      </div>

      {content.panels.length < 2 && (
        <p className="text-sm text-muted-foreground">
          カルーセルには最低2枚のパネルが必要です
        </p>
      )}

      <div className="space-y-4">
        {content.panels.map((panel, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">パネル {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removePanel(index)}
                  disabled={content.panels.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="タイトル"
                value={panel.title}
                onChange={(e) => updatePanel(index, { title: e.target.value })}
              />
              <Textarea
                placeholder="説明文"
                value={panel.text}
                onChange={(e) => updatePanel(index, { text: e.target.value })}
                rows={2}
              />
              <Input
                placeholder="画像URL"
                value={panel.imageUrl}
                onChange={(e) => updatePanel(index, { imageUrl: e.target.value })}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="carousel-notification">通知テキスト</Label>
        <Input
          id="carousel-notification"
          placeholder="カルーセルを送信しました"
          value={content.notificationText || ''}
          onChange={(e) => onChange({ ...content, notificationText: e.target.value })}
        />
      </div>
    </div>
  );
}

// ヘルパーコンポーネント
function MessageTypeIcon({ type }: { type: MessageType }) {
  const icons = {
    TEXT: <FileText className="h-4 w-4" />,
    IMAGE: <Image className="h-4 w-4" />,
    VIDEO: <Video className="h-4 w-4" />,
    AUDIO: <Music className="h-4 w-4" />,
    STICKER: <Smile className="h-4 w-4" />,
    BUTTON: <MousePointer className="h-4 w-4" />,
    CAROUSEL: <LayoutGrid className="h-4 w-4" />,
  };
  return icons[type] || <FileText className="h-4 w-4" />;
}

function getMessageTypeLabel(type: MessageType): string {
  const labels = {
    TEXT: 'テキスト',
    IMAGE: '画像',
    VIDEO: '動画',
    AUDIO: '音声',
    STICKER: 'スタンプ',
    BUTTON: 'ボタン',
    CAROUSEL: 'カルーセル',
  };
  return labels[type] || type;
}

function getMessagePreview(message: LineMessage): string {
  switch (message.type) {
    case 'TEXT':
      return (message.content as TextContent).text || '(空のテキスト)';
    case 'IMAGE':
      return '画像メッセージ';
    case 'VIDEO':
      return '動画メッセージ';
    case 'AUDIO':
      return '音声メッセージ';
    case 'STICKER':
      return 'スタンプ';
    case 'BUTTON':
      return (message.content as ButtonContent).title || 'ボタンメッセージ';
    case 'CAROUSEL': {
      const panels = (message.content as CarouselContent).panels;
      return `カルーセル (${panels.length}枚)`;
    }
    default:
      return 'メッセージ';
  }
}

export default MessageEditor;
