import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { useBookings, useProfile } from "@/hooks/use-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Car } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: bookings, isLoading: isBookingsLoading } = useBookings();
  const { data: profile } = useProfile();

  if (isAuthLoading || isBookingsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Welcome back, {user.firstName}</h1>
          <p className="text-muted-foreground">Manage your bookings and account settings</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8">
          <TabsList>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {profile?.role === "owner" && <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>}
          </TabsList>

          <TabsContent value="bookings">
            <div className="grid gap-6">
              {bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-32 md:h-auto bg-muted">
                        <img 
                          src={booking.vehicle?.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d"} 
                          alt="Vehicle"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{booking.vehicle?.make} {booking.vehicle?.model}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(booking.startDate), "MMM dd")} - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              booking.status === "active" ? "default" :
                              booking.status === "completed" ? "secondary" : 
                              "outline"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                          <div>
                             <p className="text-sm font-medium">Total Paid</p>
                             <p className="text-lg font-bold text-primary">KES {Number(booking.totalPrice).toLocaleString()}</p>
                          </div>
                          
                          {booking.status === "active" && (
                            <Link href={`/track/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                <MapPin className="mr-2 h-4 w-4" /> Track Vehicle
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-card rounded-xl border">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold text-lg">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">Start your journey today</p>
                  <Link href="/vehicles">
                    <Button>Browse Vehicles</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{user.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile?.phoneNumber || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
