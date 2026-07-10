import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Gift,
  Users,
  Loader2,
  AlertCircle,
  X,
  BanknoteIcon,
  Send,
  Plus,
} from 'lucide-react';
import api from '../lib/api';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'COMMISSION' | 'PAYOUT' | 'REWARD';
  amount: number;
  description: string;
  date: string;
  referenceId: string;
}

interface WalletData {
  balance: number;
  rewardCredits: number;
  earnings: {
    thisMonth: number;
    lastMonth: number;
    allTime: number;
  };
}

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT' | 'COMMISSION' | 'PAYOUT'>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/wallet');
      const walletData = response.data.data || response.data;
      setWallet({
        balance: walletData.balance || 0,
        rewardCredits: 0,
        earnings: {
          thisMonth: 0,
          lastMonth: 0,
          allTime: 0,
        },
      });
      // Also fetch earnings if user is a traveler/agent
      try {
        const earningsRes = await api.get('/wallet/earnings');
        const earningsData = earningsRes.data.data || earningsRes.data;
        setWallet((prev) => prev ? {
          ...prev,
          earnings: {
            thisMonth: earningsData.this_month || 0,
            lastMonth: 0,
            allTime: earningsData.total_earnings || 0,
          },
        } : prev);
      } catch {
        // Earnings endpoint may not apply to senders
      }
    } catch {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (pageNum: number) => {
    setTxLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNum, limit: 10 };
      if (filter !== 'ALL') params.type = filter;
      const response = await api.get('/wallet', { params });
      const data = response.data.data || response.data;
      const txList = (data.transactions || []).map((tx: any) => ({
        ...tx,
        date: tx.created_at || tx.date,
        referenceId: tx.id?.slice(0, 8) || '',
      }));
      if (pageNum === 1) {
        setTransactions(txList);
      } else {
        setTransactions((prev) => [...prev, ...txList]);
      }
      const pagination = data.pagination;
      setHasMore(pagination ? pageNum < pagination.pages : false);
    } catch {
      setError('Failed to load transactions');
    } finally {
      setTxLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage);
  };

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      setPayoutError('Please enter a valid amount');
      return;
    }
    if (wallet && amount > wallet.balance) {
      setPayoutError('Amount exceeds available balance');
      return;
    }

    setPayoutLoading(true);
    setPayoutError('');

    try {
      await api.post('/wallet/payout', { amount });
      setPayoutSuccess(true);
      fetchWallet();
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutSuccess(false);
        setPayoutAmount('');
      }, 2000);
    } catch (err: any) {
      setPayoutError(err.response?.data?.message || 'Payout request failed');
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={() => {
              setError('');
              setLoading(true);
              fetchWallet();
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="hero-gradient rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-orange-500/10 rounded-full blur-xl"></div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-6 h-6 text-white/70" />
              <span className="text-white/80 text-sm font-medium">Available Balance</span>
            </div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="w-8 h-8" />
              <span className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-family-heading)]">
                {wallet?.balance.toLocaleString('en-IN') || '0'}
              </span>
            </div>
            <p className="text-white/60 text-sm mt-2">Updated just now</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setShowPayoutModal(true)}
            className="btn-press flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-200/40 card-hover"
          >
            <BanknoteIcon className="w-6 h-6" />
            <span className="text-sm font-medium">Request Payout</span>
          </button>
          <button
            onClick={() => alert('Add Money feature coming soon!')}
            className="btn-press flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl transition-all shadow-md shadow-indigo-200/40 card-hover opacity-75"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Add Money</span>
          </button>
          <button
            onClick={() => alert('Transfer feature coming soon!')}
            className="btn-press flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-md shadow-orange-200/40 card-hover opacity-75"
          >
            <Send className="w-6 h-6" />
            <span className="text-sm font-medium">Transfer</span>
          </button>
        </div>

        {/* Earnings Summary */}
        {wallet?.earnings && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">This Month</p>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-4 h-4 text-gray-700" />
                <span className="text-2xl font-bold text-gray-800">
                  {wallet.earnings.thisMonth.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">Last Month</p>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-4 h-4 text-gray-700" />
                <span className="text-2xl font-bold text-gray-800">
                  {wallet.earnings.lastMonth.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">All Time</p>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-4 h-4 text-gray-700" />
                <span className="text-2xl font-bold text-gray-800">
                  {wallet.earnings.allTime.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reward Credits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Reward Credits</p>
                <p className="text-sm text-gray-500">Use credits on your next delivery</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-amber-600">
              {wallet?.rewardCredits || 0}
            </span>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 flex items-center gap-3 border border-amber-100">
            <Users className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Refer a friend and earn 100 credits</p>
              <p className="text-sm text-gray-500">
                Share your referral code and earn rewards when they complete their first delivery
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
            <div className="flex gap-2 flex-wrap">
              {(['ALL', 'COMMISSION', 'CREDIT', 'PAYOUT', 'DEBIT'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'COMMISSION' ? 'Commissions' : tab === 'CREDIT' ? 'Credits' : tab === 'PAYOUT' ? 'Payouts' : 'Debits'}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-gray-50">
            {transactions.length === 0 && !txLoading && (
              <div className="p-12 text-center">
                <WalletIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}

            {transactions.map((tx) => {
              const isPositive = ['CREDIT', 'COMMISSION', 'REWARD'].includes(tx.type);
              return (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPositive ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        dateStyle: 'medium',
                      })}{' '}
                      &middot; {tx.type === 'COMMISSION' ? 'Commission' : tx.type === 'PAYOUT' ? 'Payout' : tx.type === 'REWARD' ? 'Reward' : tx.type}{' '}
                      &middot; Ref: {tx.referenceId}
                    </p>
                  </div>
                  <span
                    className={`font-semibold whitespace-nowrap ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? '+' : '-'}&#8377;{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}

            {txLoading && (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && transactions.length > 0 && !txLoading && (
            <div className="p-4 border-t border-gray-100 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !payoutLoading && setShowPayoutModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Request Payout</h3>
              <button
                onClick={() => !payoutLoading && setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {payoutSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-800">Payout Requested!</p>
                <p className="text-gray-500 mt-1">
                  Your payout will be processed within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      &#8377;
                    </span>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="0.00"
                      max={wallet?.balance}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Available: &#8377;{wallet?.balance.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-800 font-medium">HDFC Bank ****4521</p>
                    <p className="text-xs text-gray-500">Saved bank account</p>
                  </div>
                </div>

                {payoutError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-red-600">{payoutError}</p>
                  </div>
                )}

                <button
                  onClick={handlePayout}
                  disabled={payoutLoading || !payoutAmount}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {payoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <BanknoteIcon className="w-5 h-5" />
                  )}
                  {payoutLoading ? 'Processing...' : 'Confirm Payout'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
