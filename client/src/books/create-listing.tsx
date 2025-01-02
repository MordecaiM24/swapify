import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import axios from "axios";
import { Listing } from "@/types";

export function CreateListingDialog() {
  const [open, setOpen] = useState(false);
  const [listing, setListing] = useState<Listing>({
    id: "",
    isbn: "",
    title: "",
    author: "",
    edition: "",
    courseCodes: [],
    condition: "NEW",
    hasNotes: false,
    hasHighlights: false,
    price: 0,
    description: "",
    images: [],
    status: "AVAILABLE",
    createdAt: new Date().toISOString(),
    sellerId: "",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setListing((prev) => ({ ...prev, sellerId: user.id }));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/api/listings`,
        listing
      );
      console.log(res);
      setOpen(false);
    } catch (error) {
      console.error("Error creating listing:", error);
    }
    console.log(listing);

    setLoading(false);
  }

  async function autocreate() {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${listing.isbn}+isbn&maxResults=1`
      );

      const bookData = res.data.items[0];
      if (bookData) {
        const volumeInfo = bookData.volumeInfo;
        setListing((prev) => ({
          ...prev,
          title: volumeInfo.title || prev.title,
          author: volumeInfo.authors
            ? volumeInfo.authors.join(", ")
            : prev.author,
          description: volumeInfo.description || prev.description,
          // We could potentially parse edition from the title or description,
          // but it's not directly available in the API response
          images: volumeInfo.imageLinks
            ? [volumeInfo.imageLinks.thumbnail].filter(Boolean)
            : prev.images,
        }));
      }
    } catch (error) {
      console.error("Error fetching book data:", error);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          List Book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                required
                value={listing.isbn}
                onChange={(e) =>
                  setListing({ ...listing, isbn: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={listing.title}
                onChange={(e) =>
                  setListing({ ...listing, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                required
                value={listing.author}
                onChange={(e) =>
                  setListing({ ...listing, author: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edition">Edition</Label>
              <Input
                id="edition"
                required
                value={listing.edition}
                onChange={(e) =>
                  setListing({ ...listing, edition: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="courseCodes">
                Course Codes (comma-separated)
              </Label>
              <Input
                id="courseCodes"
                value={listing.courseCodes.join(", ")}
                onChange={(e) =>
                  setListing({
                    ...listing,
                    courseCodes: e.target.value
                      .split(",")
                      .map((code) => code.trim().toLocaleUpperCase()),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                required
                value={listing.condition}
                onChange={(e) =>
                  setListing({
                    ...listing,
                    condition: e.target.value as Listing["condition"],
                  })
                }
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
            <div className="flex gap-4 py-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasNotes"
                  checked={listing.hasNotes}
                  onChange={(e) =>
                    setListing({ ...listing, hasNotes: e.target.checked })
                  }
                  className="mr-2"
                />
                <Label htmlFor="hasNotes">Notes</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasHighlights"
                  checked={listing.hasHighlights}
                  onChange={(e) =>
                    setListing({ ...listing, hasHighlights: e.target.checked })
                  }
                  className="mr-2"
                />
                <Label htmlFor="hasHighlights">Highlights</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={listing.price}
                onChange={(e) =>
                  setListing({ ...listing, price: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={listing.description}
                onChange={(e) =>
                  setListing({ ...listing, description: e.target.value })
                }
                className="w-full rounded-md border border-input px-3 py-2 h-24"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              disabled={loading || localStorage.getItem("user") == null}
              type="submit"
            >
              Create Listing
            </Button>
            <Button
              variant="outline"
              disabled={listing.isbn === "" || loading}
              onClick={autocreate}
              type="button"
            >
              (Experimental) Autocreate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
