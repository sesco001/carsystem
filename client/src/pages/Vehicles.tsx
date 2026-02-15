import { Navigation } from "@/components/Navigation";
import { VehicleCard } from "@/components/VehicleCard";
import { useVehicles } from "@/hooks/use-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Vehicles() {
  const [search, setSearch] = useState("");
  const { data: vehicles, isLoading } = useVehicles({ search });

  return (
    <div className="min-h-screen bg-muted/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Our Fleet</h1>
            <p className="text-muted-foreground mt-1">Find the perfect vehicle for your trip</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by make, model, or location..." 
              className="pl-10 h-12 bg-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold">No vehicles found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
