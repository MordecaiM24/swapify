export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerified: boolean;
  password: string;
  phone: string;
  venmoHandle: string;
  listings: Listing[];
  buyerDeals: Deal[];
  sellerDeals: Deal[];
  watchlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  meetupDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  isbn: string;
  title: string;
  author: string;
  edition: string;
  courseCodes: string[];
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  hasNotes: boolean;
  hasHighlights: boolean;
  price: number;
  description?: string;
  images: string[];
  status: "AVAILABLE" | "PENDING" | "SOLD" | "DELETED";
  createdAt: string;
  sellerId: string;
  seller?: {
    id: string;
    email: string;
  };
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  createdAt: Date;
}

export interface ChatThread {
  id: string;
  listingId: string;
  listing: {
    title: string;
    price: number;
    condition: string;
  };
  buyerId: string;
  sellerId: string;
  lastMessage?: Message;
  updatedAt: Date;
}
