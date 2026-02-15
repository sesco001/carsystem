import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VehicleCard } from "@/components/VehicleCard";
import { useVehicles } from "@/hooks/use-data";
import { Search, MapPin, Calendar, ArrowRight, Shield, Clock, Award } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: vehicles, isLoading } = useVehicles({ search: search || undefined });

  // Filter only available vehicles for homepage display
  const featuredVehicles = vehicles?.filter(v => v.available).slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* North Eastern Kenya Landscape - placeholder */}
          <img 
            src="https://images.unsplash.com/photo-1519003300449-424ad640516d?q=80&w=2072&auto=format&fit=crop" 
            alt="Scenic road landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-black/50" />
        </div>

        <div className="container relative z-10 px-4 text-center md:text-left">
          <div className="max-w-3xl space-y-6">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-white leading-tight animate-slide-up">
              Explore North Eastern Kenya with <span className="text-secondary">Comfort</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl animate-slide-up" style={{ animationDelay: "100ms" }}>
              Reliable 4x4s and luxury vehicles for your journey across Garissa, Wajir, and Mandera. 
              Book instantly with M-Pesa.
            </p>
            
            <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mt-8 flex flex-col md:flex-row gap-2 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Where do you want to go?" 
                  className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search-location"
                />
              </div>
              <div className="w-px bg-border hidden md:block" />
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="date"
                  className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0 text-muted-foreground"
                />
              </div>
              <Button size="lg" variant="secondary" data-testid="button-search">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="bg-primary/10 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Secure & Insured</h3>
              <p className="text-muted-foreground">Every rental includes comprehensive insurance for peace of mind.</p>
            </Card>
            <Card className="p-8">
              <div className="bg-primary/10 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Instant Booking</h3>
              <p className="text-muted-foreground">Book instantly and pay securely via M-Pesa in seconds.</p>
            </Card>
            <Card className="p-8">
              <div className="bg-primary/10 w-12 h-12 rounded-md flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Top Rated Fleet</h3>
              <p className="text-muted-foreground">Well-maintained 4x4 Land Cruisers perfect for the terrain.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">Featured Vehicles</h2>
            <p className="text-muted-foreground mt-2">Top picks for your next adventure</p>
          </div>
          <Link href="/vehicles" className="hidden md:flex items-center text-primary font-semibold hover:underline">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredVehicles?.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/vehicles">
            <Button variant="outline" className="w-full">View All Vehicles</Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-6">Ready to start your journey?</h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied travelers exploring the beauty of North Eastern Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vehicles">
              <Button size="lg" variant="secondary" data-testid="button-browse-vehicles">
                Browse Vehicles
              </Button>
            </Link>
            <Link href="/api/login">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/50 text-white" data-testid="button-signup">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">NorthEast Rides</h4>
            <p className="text-sm">Reliable car rental service connecting you to the best vehicles in the region.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/vehicles">Browse Cars</Link></li>
              <li><Link href="/dashboard">My Dashboard</Link></li>
              <li><Link href="/api/login">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>info@northeastrides.co.ke</li>
              <li>+254 700 000 000</li>
              <li>Garissa, Kenya</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
