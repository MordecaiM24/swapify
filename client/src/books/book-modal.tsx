import { useNavigate } from "react-router-dom";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, Heart } from "lucide-react";
import { Listing } from "types";
import toOrdinal from "@/utils/ordinal";
import React from "react";
import axios from "axios";

interface BookModalProps {
  listing: Listing;
  onThreadCreated?: (threadId: string) => void;
}

export function BookModal({ listing, onThreadCreated }: BookModalProps) {
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const startChat = async () => {
    try {
      setIsCreatingChat(true);

      // First check if a chat already exists
      try {
        const { data: existingThread } = await axios.get(
          `${import.meta.env.VITE_API_ENDPOINT}/api/chat/find/${user.id}/${
            listing.id
          }`
        );

        if (existingThread) {
          navigate(`/chat?thread=${existingThread.id}`);
          return;
        }
      } catch (e) {
        // If no existing chat, create a new one
        const { data: newThread } = await axios.post(
          `${import.meta.env.VITE_API_ENDPOINT}/api/chat/create/${user.id}`,
          {
            listingId: listing.id,
          }
        );
        navigate(`/chat?thread=${newThread.id}`);
        onThreadCreated?.(newThread.id);
      }
    } catch (e) {
      console.error("Error with chat:", e);
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {listing.title}
        </DialogTitle>
        <DialogDescription>
          by {listing.author} • {toOrdinal(listing.edition)} Edition
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {listing.courseCodes.map((code) => (
            <Badge key={code} variant="secondary">
              {code}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Badge>{listing.condition}</Badge>
          {listing.hasNotes && <Badge variant="outline">has notes</Badge>}
          {listing.hasHighlights && (
            <Badge variant="outline">highlighted</Badge>
          )}
        </div>

        <p className="text-2xl font-bold">${listing.price}</p>

        {listing.description && (
          <p className="text-muted-foreground max-h-64 overflow-scroll">
            {listing.description}
          </p>
        )}

        {listing.images && listing.images.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {listing.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${listing.title} - image ${index + 1}`}
                className="rounded-lg object-cover h-48"
              />
            ))}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            className="flex-1"
            onClick={startChat}
            disabled={
              isCreatingChat ||
              !localStorage.getItem("user") ||
              user.id === listing.sellerId
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {isCreatingChat ? "Starting chat..." : "Contact Seller"}
          </Button>
          <SaveListing listingId={listing.id} />
        </div>
      </div>
    </DialogContent>
  );
}

function SaveListing({ listingId }: { listingId: string }) {
  const [isSaved, setIsSaved] = React.useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.watchlist?.includes(listingId) || false;
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = React.useState(false);

  if (!localStorage.getItem("user")) {
    return (
      <Button variant="outline" disabled>
        <Heart className="mr-2 h-4 w-4" />
        Save
      </Button>
    );
  }

  async function handleSave() {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user) return;

      const action = isSaved ? "remove" : "add";

      const { data: updatedUser } = await axios.patch(
        `${import.meta.env.VITE_API_ENDPOINT}/api/auth/user/${
          user.id
        }/watchlist`,
        {
          listingId,
          action,
        }
      );

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsSaved(!isSaved);
    } catch (e) {
      console.error("Error updating watchlist:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleSave} disabled={isLoading}>
      <Heart className="h-4 w-4" fill={isSaved ? "#000" : "none"} />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
