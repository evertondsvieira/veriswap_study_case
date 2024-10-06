'use client'

import useCartStore from '@/store/useCartStore';
import Image from 'next/image';
import React, { useState } from 'react';

interface CheckoutProps {
  userId: number;
}

const processPurchase = async (userId: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // Simulates success 90% of the time
      if (success) {
        resolve(`Purchase completed successfully for user ${userId}!`);
      } else {
        reject(`Error completing purchase for user ${userId}.`);
      }
    }, 2000); // Time for purchase attempts to be executed
  });
};

const defaultUsersState = { isSold: false, buyerId: null, processing: false };

const messages: Record<string, string> = {
  sold: "This item has already been sold!",
  processing: "A purchase is already in process. Please try again later.",
  outOfStock: "Product out of stock!",
  success: "Purchase completed successfully!",
  unknownError: "An unknown error occurred.",
};

const Checkout = (props: CheckoutProps) => {
  const { userId } = props;

  const {
    users,
    setProcessing,
    completePurchase,
    isAnyUserProcessing,
    available,
  } = useCartStore();

  const userState = users[userId] || defaultUsersState;

  const [message, setMessage] = useState<string | null>(null); // Local state for messages

  const finalizePurchase = async () => {
    // Check for user state
    if (userState.isSold) {
      setMessage(messages.sold);
      return;
    }

    if (isAnyUserProcessing()) {
      setMessage(messages.processing);
      return;
    }

    if (available <= 0) {
      setMessage(messages.outOfStock);
      return;
    }

    setProcessing(userId, true); // Marks the start of processing
    setMessage(null); // Clears the previous message

    try {
      const result = await processPurchase(userId);
      completePurchase(userId); // Completes the purchase
      setMessage(result); // Sets the success message
    } catch (error) {
      if (typeof error === 'string') {
        setMessage(error); // Sets the error message
      } else {
        setMessage(messages.unknownError); // Fallback message
      }
    } finally {
      setProcessing(userId, false); // Marks the end of processing
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg m-2 shadow-md">
      <h2 className="text-lg font-bold">User {userId}</h2>
      <p className="mb-4">Product: Pokémon Card - $20.00</p>
      <Image src="/dark-raichu.jpg" alt="Dark Raichu" width={200} height={300} />
      <button
        className={`py-2 px-4 mt-2 text-white font-semibold rounded-lg transition duration-200 ${userState.processing || userState.isSold ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        onClick={finalizePurchase}
        disabled={userState.processing || userState.isSold}
      >
        {userState.processing ? 'Processing...' : (userState.isSold ? `Purchased by User ${userState.buyerId}` : 'Finalize Purchase')}
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
      {userState.isSold && <p className="text-green-500">Item sold to user {userState.buyerId}.</p>}
    </div>
  );
};

export default function Page() {
  return (
    <div className="flex justify-around p-4">
      <Checkout userId={1} />
      <Checkout userId={2} />
      <Checkout userId={3} />
    </div>
  );
};
