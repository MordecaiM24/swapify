import { useEffect, useState } from "react";
import { SearchFilters } from "./search-filters";
import { BookCard } from "./book-card";
import { CreateListingDialog } from "./create-listing";
import axios from "axios";
import { Listing } from "@/types";

interface Filters {
  search: string;
  condition: string[];
  hasNotes: boolean;
  hasHighlights: boolean;
  minPrice: number;
  maxPrice: number;
}

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    condition: [],
    hasNotes: false,
    hasHighlights: false,
    minPrice: 0,
    maxPrice: 250,
  });

  useEffect(() => {
    getListings();
  }, []);

  async function getListings() {
    const res = await axios.get("http://localhost:3001/api/listings");
    setListings(res.data);
  }

  const filteredListings = listings.filter((listing) => {
    // Search filter
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      listing.title.toLowerCase().includes(searchTerm) ||
      listing.author.toLowerCase().includes(searchTerm) ||
      listing.isbn.toLowerCase().includes(searchTerm) ||
      listing.courseCodes.some((code) =>
        code.toLowerCase().includes(searchTerm)
      );

    // Condition filter
    const matchesCondition =
      filters.condition.length === 0 ||
      filters.condition.includes(listing.condition);

    // Notes and highlights filter
    const matchesNotes = !filters.hasNotes || listing.hasNotes;
    const matchesHighlights = !filters.hasHighlights || listing.hasHighlights;

    // Price filter
    const matchesPrice =
      listing.price >= filters.minPrice && listing.price <= filters.maxPrice;

    return (
      matchesSearch &&
      matchesCondition &&
      matchesNotes &&
      matchesHighlights &&
      matchesPrice
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Browse Listings</h1>
        <CreateListingDialog />
      </div>

      <SearchFilters filters={filters} setFilters={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <BookCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
