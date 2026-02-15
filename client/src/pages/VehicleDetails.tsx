import { Navigation } from "@/components/Navigation";
import { BookingForm } from "@/components/BookingForm";
import { useVehicle } from "@/hooks/use-data";
import { useRoute } from "wouter";
import { MapPin, User, CheckCircle2, Navigation as NavigationIcon, Fuel, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function VehicleDetails() {
  const [_, params] = useRoute("/vehicles/:id");
  const id = Number(params?.id);
  const { data: vehicle, isLoading } = useVehicle(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-96 bg-muted rounded-2xl mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-10 bg-muted w-3/4 rounded" />
              <div className="h-40 bg-muted rounded" />
            </div>
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  const features = Array.isArray(vehicle.features) ? vehicle.features : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      {/* Hero Image */}
      <div className="relative h-[60vh] min-h-[400px]">
        <img
          src={vehicle.imageUrl || `https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1600&q=80`}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <Badge className="mb-4 text-lg py-1 px-4">
            {vehicle.year} Model
          </Badge>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground text-shadow">
            {vehicle.make} {vehicle.model}
          </h1>
          <div className="flex items-center text-muted-foreground mt-2 text-lg">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            {vehicle.location}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Vehicle Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Make</p>
                  <p className="font-semibold">{vehicle.make}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Model</p>
                  <p className="font-semibold">{vehicle.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Year</p>
                  <p className="font-semibold">{vehicle.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">License</p>
                  <p className="font-semibold font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                    {vehicle.licensePlate}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="font-semibold text-lg mb-4">Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
                {vehicle.gpsEnabled && (
                  <div className="flex items-center">
                    <NavigationIcon className="h-5 w-5 text-primary mr-2" />
                    <span>GPS Tracking Enabled</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owned by</p>
                  <p className="font-semibold text-lg">
                    {vehicle.owner?.firstName} {vehicle.owner?.lastName}
                  </p>
                </div>
              </div>
              <Button variant="outline">Contact Owner</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BookingForm vehicle={vehicle} />
            
            <div className="bg-muted/30 p-6 rounded-xl border text-sm text-muted-foreground space-y-2">
              <p><strong>Free Cancellation</strong> up to 24 hours before pickup.</p>
              <p><strong>Insurance Included</strong> basic coverage included in price.</p>
              <p><strong>Security Deposit</strong> required at pickup.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
