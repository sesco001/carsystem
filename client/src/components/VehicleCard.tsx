import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Fuel, Gauge } from "lucide-react";
import { Link } from "wouter";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle & { owner?: { firstName: string | null, lastName: string | null } };
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  // Parsing features carefully as jsonb can be any type
  const features = Array.isArray(vehicle.features) ? vehicle.features : [];

  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {/* Descriptive alt text for accessibility */}
        {/* placeholder image for vehicle */}
        <img
          src={vehicle.imageUrl || `https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80`}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={vehicle.available ? "default" : "secondary"} className="shadow-sm">
            {vehicle.available ? "Available" : "Booked"}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur text-foreground shadow-sm font-semibold">
            KES {Number(vehicle.pricePerDay).toLocaleString()}/day
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-bold text-lg leading-tight">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-muted-foreground text-sm">{vehicle.year}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="truncate">{vehicle.location}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {features.slice(0, 3).map((feature, i) => (
            <Badge key={i} variant="outline" className="bg-muted/50 text-xs font-normal">
              {feature}
            </Badge>
          ))}
          {features.length > 3 && (
            <Badge variant="outline" className="bg-muted/50 text-xs font-normal">
              +{features.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 mt-auto">
        <Link href={`/vehicles/${vehicle.id}`} className="w-full">
          <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
