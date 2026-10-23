import { create } from 'zustand';

type PrivacyState = {
  amountsHidden: boolean;
  toggleAmountsHidden: () => void;
};

// A shared in-memory setting keeps amount visibility consistent across both screens.
export const usePrivacyStore = create<PrivacyState>(set => ({
  amountsHidden: false,
  toggleAmountsHidden: () =>
    set(state => ({ amountsHidden: !state.amountsHidden })),
}));
