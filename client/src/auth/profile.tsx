import { useEffect, useState } from "react";
import { Listing, User as UserType } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, AtSign } from "lucide-react";
import { BookCard } from "@/books/book-card";

export default function Profile() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: user?.phone,
    venmoHandle: user?.venmoHandle,
  });
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setLoading(false);
      return;
    }
    console.log(user);
    const userId = JSON.parse(user).id;
    console.log(userId);

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_ENDPOINT}/api/auth/user/${userId}`
        );
        const data = await response.json();

        // Fetch full listing objects for watchlist
        const watchlistListings = await Promise.all(
          data.watchlist.map(async (listingId: string) => {
            const res = await fetch(
              `${import.meta.env.VITE_API_ENDPOINT}/api/listings/${listingId}`
            );
            return res.json();
          })
        );

        setListings(watchlistListings);

        console.log(data);
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  function logOut() {
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error loading profile</div>;

  const activeListings = user.listings.filter((l) => l.status === "AVAILABLE");
  const soldListings = user.listings.filter((l) => l.status === "SOLD");

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {user.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AtSign className="h-4 w-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {user.phone}
              </div>
              <p className="text-muted-foreground">Venmo: {user.venmoHandle}</p>
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venmo">Venmo Handle</Label>
                    <Input
                      id="venmo"
                      value={editForm.venmoHandle}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          venmoHandle: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setIsEditing(false)}
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="default" className="w-full" onClick={logOut}>
              Log Out
            </Button>
          </CardContent>
        </Card>

        {/* Listings Section */}
        <div className="md:col-span-2">
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">
                Active Listings ({activeListings.length})
              </TabsTrigger>
              <TabsTrigger value="sold">
                Sold ({soldListings.length})
              </TabsTrigger>
              <TabsTrigger value="watchlist">
                Watchlist ({user.watchlist.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeListings.map((listing) => (
                  <BookCard key={listing.id} listing={listing} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sold" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {soldListings.map((listing) => (
                  <BookCard key={listing.id} listing={listing} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="watchlist" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((listing) => (
                  <BookCard key={listing.id} listing={listing} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
