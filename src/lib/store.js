import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Authentication & Multi-tenant State
  currentCompany: {
    id: "co_sankhla_01",
    name: "Sankhla Enterprises",
    logo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&auto=format&fit=crop&q=80",
    gstNumber: "08AAAAA1111A1Z1",
    panNumber: "AAAAA1111A",
    bankName: "State Bank of India",
    bankAccountNo: "330011223344",
    bankIfsc: "SBIN0001234",
    bankBranch: "Jodhpur Main Branch",
    address: "12, Industrial Area, Phase II",
    city: "Jodhpur",
    state: "Rajasthan",
    pincode: "342001",
    termsAndConditions: "1. 50% Advance with Purchase Order.\n2. 40% On material delivery at site.\n3. 10% Post successful commissioning.\n4. Net metering approvals depend on state utility rules.",
  },
  currentUser: {
    id: "usr_owner",
    email: "owner@sankhla.com",
    role: "COMPANY_OWNER", // SUPER_ADMIN, COMPANY_OWNER, SALES_MANAGER, SALES_EXECUTIVE, ACCOUNTANT, PROJECT_MANAGER, ENGINEER, TECHNICIAN
    firstName: "Harshit",
    lastName: "Sankhla",
    phone: "9988776655"
  },

  // Available Companies for switcher
  availableCompanies: [
    {
      id: "co_sankhla_01",
      name: "Sankhla Enterprises",
      logo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&auto=format&fit=crop&q=80",
      gstNumber: "08AAAAA1111A1Z1",
      panNumber: "AAAAA1111A",
      bankName: "State Bank of India",
      bankAccountNo: "330011223344",
      bankIfsc: "SBIN0001234",
      bankBranch: "Jodhpur Main Branch",
      address: "12, Industrial Area, Phase II",
      city: "Jodhpur",
      state: "Rajasthan",
      pincode: "342001",
      termsAndConditions: "1. 50% Advance with Purchase Order.\n2. 40% On material delivery at site.\n3. 10% Post successful commissioning."
    },
    {
      id: "co_apex_02",
      name: "Apex Renewable Energy",
      logo: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=200&auto=format&fit=crop&q=80",
      gstNumber: "27BBBBB2222B2Z2",
      panNumber: "BBBBB2222B",
      bankName: "HDFC Bank",
      bankAccountNo: "50100200300400",
      bankIfsc: "HDFC0000987",
      bankBranch: "Mumbai Andheri",
      address: "405, Signature Towers, Link Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053",
      termsAndConditions: "Standard 60-30-10 Payment Policy."
    }
  ],

  // Global Actions
  setCurrentCompany: (company) => set({ currentCompany: company }),
  setCurrentUser: (user) => set({ currentUser: user }),

  // Toast notifications state
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),

  // Global search string
  globalSearchQuery: '',
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query })
}));
