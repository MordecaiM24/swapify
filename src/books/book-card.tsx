import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { Listing } from "types";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { BookModal } from "./book-modal";
import toOrdinal from "@/utils/ordinal";

interface BookCardProps {
  listing: Listing;
}

export function BookCard({ listing }: BookCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-all h-80 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              {listing.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {listing.courseCodes.map((code) => (
                <Badge key={code} variant="secondary">
                  {code}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-full">
            <div className="flex flex-col h-full space-y-2">
              <p className="text-sm text-muted-foreground">
                by {listing.author} • {toOrdinal(listing.edition)} Edition
              </p>
              <div className="flex items-center gap-2">
                <Badge>{listing.condition}</Badge>
                {listing.hasNotes && <Badge variant="outline">has notes</Badge>}
                {listing.hasHighlights && (
                  <Badge variant="outline">highlighted</Badge>
                )}
              </div>
              <p className="text-xl font-light">${listing.price}</p>
              {listing.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {listing.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <BookModal listing={listing} />
    </Dialog>
  );
}
