import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateBooking } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, differenceInDays, addDays } from "date-fns";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  vehicle: Vehicle;
}

export function BookingForm({ vehicle }: BookingFormProps) {
  const { user, isAuthenticated } = useAuth();
  const { mutate: createBooking, isPending } = useCreateBooking();
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"phone" | "processing" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const numberOfDays = dateRange.from && dateRange.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1 
    : 0;
  
  const totalPrice = numberOfDays * Number(vehicle.pricePerDay);

  const handleBookClick = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Select dates",
        description: "Please select a start and end date for your booking.",
        variant: "destructive"
      });
      return;
    }

    setIsPaymentOpen(true);
  };

  const handlePayment = async () => {
    if (!phoneNumber) return;

    setPaymentStep("processing");
    
    // Simulate M-Pesa STK Push delay
    setTimeout(() => {
      createBooking({
        vehicleId: vehicle.id,
        startDate: dateRange.from,
        endDate: dateRange.to,
      }, {
        onSuccess: () => {
          setPaymentStep("success");
        },
        onError: () => {
          setPaymentStep("phone"); // Reset on error
        }
      });
    }, 2000);
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-xl font-display font-bold mb-1">Book this Car</h3>
        <p className="text-sm text-muted-foreground">Select your travel dates to continue</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Dates</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={new Date()}
                selected={dateRange}
                onSelect={(range: any) => setDateRange(range)}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {numberOfDays > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Duration</span>
              <span className="font-medium">{numberOfDays} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Rate</span>
              <span className="font-medium">KES {Number(vehicle.pricePerDay).toLocaleString()}/day</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">KES {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full"
          size="lg"
          onClick={handleBookClick}
          disabled={!dateRange.from || !dateRange.to}
          data-testid="button-book-vehicle"
        >
          {isAuthenticated ? "Proceed to Payment" : "Log in to Book"}
        </Button>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Secure Payment</DialogTitle>
            <DialogDescription>
              Pay via M-Pesa to confirm your booking.
            </DialogDescription>
          </DialogHeader>
          
          {paymentStep === "phone" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="0712 345 678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-phone-mpesa"
                />
              </div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                A request will be sent to your phone. Please enter your PIN to authorize the payment of <strong>KES {totalPrice.toLocaleString()}</strong>.
              </div>
              <Button onClick={handlePayment} className="w-full" disabled={!phoneNumber} data-testid="button-pay-now">
                Pay Now
              </Button>
            </div>
          )}

          {paymentStep === "processing" && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div>
                <h3 className="font-semibold text-lg">Processing Payment...</h3>
                <p className="text-muted-foreground">Please check your phone for the STK push.</p>
              </div>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-bold text-2xl">Booking Confirmed!</h3>
                <p className="text-muted-foreground mt-2">Your vehicle has been reserved successfully.</p>
              </div>
              <Button onClick={() => setIsPaymentOpen(false)} className="w-full mt-4">
                View My Bookings
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
