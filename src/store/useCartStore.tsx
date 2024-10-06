import { create, StoreApi, UseBoundStore } from "zustand";

/**
 * This module creates a Zustand store to manage the purchase states of users in veriswap.
 *
 * The store keeps track of the following:
 * - `users`: An object that connects user IDs to their statuses, showing if an item is sold,
 *   the buyer's ID, and if a purchase is being processed.
 * - `available`: A number that shows how many items are available for sale.
 *
 * The store offers these actions:
 * - `setProcessing`: Changes the processing status for a specific user when a purchase starts.
 * - `completePurchase`: Marks an item as sold for the selected user, updates the buyer's ID, and sets
 *   the available quantity to zero.
 * - `isAnyUserProcessing`: Checks if any user is currently processing a purchase and returns true or false.
 *
 * The store starts with no users and a default available quantity of 1 item.
*/

type UserState = {
  isSold: boolean;
  buyerId: number | null;
  processing: boolean;
};

type StoreState = {
  users: { [key: number]: UserState };
  setProcessing: (userId: number, value: boolean) => void;
  completePurchase: (userId: number) => void;
  isAnyUserProcessing: () => boolean;
  available: number;
};

const useCartStore: UseBoundStore<StoreApi<StoreState>> = create<StoreState>((set) => ({
  users: {},
  available: 1,

  setProcessing: (userId, value) => set((state) => ({
    users: {
      ...state.users,
      [userId]: {
        ...state.users[userId],
        processing: value,
      },
    },
  })),

  completePurchase: (userId) => set((state) => {
    const updatedUsers = Object.keys(state.users).reduce((acc, key) => {
      acc[Number(key)] = {
        isSold: Number(key) === userId ? true : state.users[Number(key)].isSold,
        buyerId: Number(key) === userId ? userId : state.users[Number(key)].buyerId,
        processing: false,
      };
      return acc;
    }, {} as { [key: number]: UserState });

    return {
      users: updatedUsers,
      available: 0,
    };
  }),

  isAnyUserProcessing: () => {
    const state = useCartStore.getState();
    return Object.values(state.users).some(user => user.processing);
  }
}));

export default useCartStore;
