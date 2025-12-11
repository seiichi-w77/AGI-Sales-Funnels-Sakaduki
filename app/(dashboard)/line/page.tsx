'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';


interface LineAccount {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  statusMessage: string | null;
  isBlocked: boolean;
  followedAt: string | null;
  tags: string[];
  createdAt: string;
  contact: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count: {
    messages: number;
    chatSessions: number;
  };
}

interface LineChat {
  id: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  lastMessageAt: string | null;
  lineAccount: {
    id: string;
    displayName: string | null;
    pictureUrl: string | null;
    contact: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
}

interface LineMessage {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content: unknown;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

export default function LinePage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId') || 'default';

  const [activeTab, setActiveTab] = useState<'friends' | 'chats' | 'broadcast'>('friends');
  const [accounts, setAccounts] = useState<LineAccount[]>([]);
  const [chats, setChats] = useState<LineChat[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<LineAccount | null>(null);
  const [messages, setMessages] = useState<LineMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/line/accounts?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, [workspaceId]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`/api/line/chats?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (data.chats) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [workspaceId]);

  const fetchMessages = useCallback(async (lineAccountId: string) => {
    try {
      const res = await fetch(`/api/line/messages?lineAccountId=${lineAccountId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.reverse());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchChats()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchAccounts, fetchChats]);

  useEffect(() => {
    if (selectedAccount) {
      fetchMessages(selectedAccount.id);
    }
  }, [selectedAccount, fetchMessages]);

  const handleSendMessage = async () => {
    if (!selectedAccount || !messageText.trim()) return;

    try {
      await fetch('/api/line/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineAccountId: selectedAccount.id,
          type: 'TEXT',
          content: { text: messageText },
        }),
      });
      setMessageText('');
      fetchMessages(selectedAccount.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBroadcast = async (formData: FormData) => {
    try {
      await fetch('/api/line/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          type: 'TEXT',
          content: { text: formData.get('message') },
          tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map((t) => t.trim()) : [],
        }),
      });
      setShowBroadcastModal(false);
    } catch (error) {
      console.error('Error broadcasting:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-blue-100 text-blue-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">LINE連携</h1>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          一斉配信
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'friends'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            友だち一覧 ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'chats'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            チャット ({chats.length})
          </button>
        </nav>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Account List */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">友だち一覧</h3>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {accounts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">友だちがいません</div>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedAccount?.id === account.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {account.pictureUrl ? (
                        <img
                          src={account.pictureUrl}
                          alt={account.displayName || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600">?</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {account.displayName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {account.contact.email}
                        </div>
                      </div>
                      {account.isBlocked && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          BAN
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white rounded-lg border shadow-sm flex flex-col h-[600px]">
            {selectedAccount ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  {selectedAccount.pictureUrl ? (
                    <img
                      src={selectedAccount.pictureUrl}
                      alt={selectedAccount.displayName || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">?</span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">
                      {selectedAccount.displayName || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedAccount.contact.email}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.direction === 'OUTBOUND'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div>{(msg.content as { text?: string })?.text || '[メッセージ]'}</div>
                        <div
                          className={`text-xs mt-1 ${
                            msg.direction === 'OUTBOUND' ? 'text-green-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="メッセージを入力..."
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      送信
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                左のリストから友だちを選択してください
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ユーザー</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終メッセージ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    チャットがありません
                  </td>
                </tr>
              ) : (
                chats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {chat.lineAccount.pictureUrl ? (
                          <img
                            src={chat.lineAccount.pictureUrl}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                        )}
                        <div>
                          <div className="font-medium">
                            {chat.lineAccount.displayName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {chat.lineAccount.contact.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(chat.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {chat.lastMessageAt
                        ? new Date(chat.lastMessageAt).toLocaleString('ja-JP')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          const account = accounts.find(
                            (a) => a.id === chat.lineAccount.id
                          );
                          if (account) {
                            setSelectedAccount(account);
                            setActiveTab('friends');
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        チャットを開く
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">LINE一斉配信</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBroadcast(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メッセージ *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="配信するメッセージを入力..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タグでフィルター（カンマ区切り）
                </label>
                <input
                  type="text"
                  name="tags"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="例: vip, customer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  空欄の場合、全ての友だちに配信されます
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  配信
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
