import React, { useEffect, useState } from 'react';
import {  Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Loader2, Search, ArrowUpDown } from 'lucide-react';
import { collection, onSnapshot} from 'firebase/firestore';
import { db } from '@/config/firebase';


interface Transaction {
  id: string;
  transactionType: string;
  transactionStatus: string;
  transactionAmount: number;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  quizId: {
    id: string;
    _path: {
      segments: string[];
    };
  };
  userId: {
    id: string;
    _path: {
      segments: string[];
    };
  };
}
// type TransactionType = {
//   id: string;
//   transactionType: string;
//   transactionStatus: string;
//   transactionAmount: number;
//   quizId: DocumentReference<DocumentData>;
//   userId: DocumentReference<DocumentData>;
// };

// const transactions: TransactionType[] = []; // Ensure this matches Firestore data

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortField, setSortField] = useState<keyof Transaction>('updatedAt');

  useEffect(() => {
    const transactionsRef = collection(db, 'transactions');

    // Try without ordering first
    const unsubscribe = onSnapshot(
      transactionsRef,
      (snapshot) => {
        // console.log('Raw collection snapshot:', {
        //   empty: snapshot.empty,
        //   size: snapshot.size,
        //   docs: snapshot.docs.map(doc => ({
        //     id: doc.id,
        //     path: doc.ref.path,
        //     data: doc.data()
        //   }))
        // });

        const fetchedTransactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];

        console.log('Total transactions fetched:', fetchedTransactions.length);
        console.log('Transactions:', fetchedTransactions);

        setTransactions(fetchedTransactions);
        setFilteredTransactions(fetchedTransactions);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        setError('Failed to load transactions');
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe when component unmounts or user logs out
    return () => {
      console.log('Cleaning up transactions listener');
      unsubscribe();
    };
  }, []);

  // Add cleanup for other state
  useEffect(() => {
    return () => {
      setTransactions([]);
      setFilteredTransactions([]);
      setLoading(false);
      setError(null);
      setSearchTerm('');
      setSortOrder('desc');
      setSortField('updatedAt');
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      // console.log('Setting filtered transactions to all transactions:', transactions.length);
      setFilteredTransactions(transactions);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = transactions.filter((transaction) =>
        transaction.id.toLowerCase().includes(lowercasedTerm) ||
        transaction.transactionType.toLowerCase().includes(lowercasedTerm) ||
        transaction.transactionStatus.toLowerCase().includes(lowercasedTerm) ||
        transaction.transactionAmount.toString().includes(searchTerm) ||
        transaction.quizId._path.segments.at(-1)?.toLowerCase().includes(lowercasedTerm) ||
        transaction.userId._path.segments.at(-1)?.toLowerCase().includes(lowercasedTerm)
      );
      
      console.log('Filtered transactions:', filtered.length);
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, transactions]);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortTransactions = () => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      if (sortField === 'updatedAt') {
        return sortOrder === 'asc'
          ? a.updatedAt._seconds - b.updatedAt._seconds
          : b.updatedAt._seconds - a.updatedAt._seconds;
      }
      if (sortField === 'transactionAmount') {
        return sortOrder === 'asc'
          ? a.transactionAmount - b.transactionAmount
          : b.transactionAmount - a.transactionAmount;
      }
      return sortOrder === 'asc'
        ? String(a[sortField]).localeCompare(String(b[sortField]))
        : String(b[sortField]).localeCompare(String(a[sortField]));
    });
    setFilteredTransactions(sorted);
  };

  useEffect(() => {
    sortTransactions();
  }, [sortField, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
          <p className="text-orange-700 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-orange-800">Transaction History</h1>
          <p className="text-orange-600 mt-1">View and manage all transactions</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-orange-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-orange-800">No transactions found</h3>
              <p className="text-orange-600 mt-1">There are no transactions to display at the moment</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-orange-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border-2 border-orange-200">
                <table className="min-w-full divide-y divide-orange-200">
                  <thead className="bg-orange-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center gap-1">
                          Transaction ID
                          {sortField === 'id' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => handleSort('transactionType')}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          {sortField === 'transactionType' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => handleSort('transactionStatus')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortField === 'transactionStatus' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => handleSort('transactionAmount')}
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          {sortField === 'transactionAmount' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                        Quiz ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                        User ID
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => handleSort('updatedAt')}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          {sortField === 'updatedAt' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-orange-200">
                    {filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-orange-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-orange-900">{transaction.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-orange-700">{transaction.transactionType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip
                            label={transaction.transactionStatus}
                            color={transaction.transactionStatus === 'Pending' ? 'default' : 'success'}
                            size="small"
                            sx={{
                              backgroundColor: transaction.transactionStatus === 'Pending' ? '#e5e7eb' : '#22c55e',
                              color: transaction.transactionStatus === 'Pending' ? '#374151' : 'white',
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-orange-700">₹{transaction.transactionAmount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-orange-700">
                            {transaction.quizId.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-orange-700">
                            {transaction.userId.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-orange-700">
                            {new Date(transaction.updatedAt?._seconds * 1000).toLocaleString()}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-3 bg-orange-50 text-orange-700 text-sm">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;
