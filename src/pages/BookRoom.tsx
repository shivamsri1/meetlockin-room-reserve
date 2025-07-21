import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Mock room data
const mockRooms = [
  { id: 1, room_name: 'Conference Room A', capacity: 10 },
  { id: 2, room_name: 'Meeting Room B', capacity: 6 },
  { id: 3, room_name: 'Board Room', capacity: 15 },
  { id: 4, room_name: 'Training Room', capacity: 20 },
  { id: 5, room_name: 'Small Meeting Room', capacity: 4 },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

const BookRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    project_name: '',
    manager_name: '',
    room_id: '',
    booking_date: undefined as Date | undefined,
    start_time: '',
    end_time: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.booking_date) {
      toast({
        title: "Missing date",
        description: "Please select a booking date.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Booking submitted",
        description: "Your booking request has been submitted for approval.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoom = mockRooms.find(room => room.id.toString() === formData.room_id);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Book Conference Room</h1>
        <p className="text-muted-foreground">
          Reserve a meeting space for your team or project
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Booking Details
              </CardTitle>
              <CardDescription>
                Fill in the details for your conference room booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_name" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Project Name *
                    </Label>
                    <Input
                      id="project_name"
                      placeholder="Enter project name"
                      value={formData.project_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manager_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Manager Name *
                    </Label>
                    <Input
                      id="manager_name"
                      placeholder="Enter manager name"
                      value={formData.manager_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, manager_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Conference Room *
                  </Label>
                  <Select 
                    value={formData.room_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, room_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a conference room" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{room.room_name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              Capacity: {room.capacity}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Booking Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.booking_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.booking_date ? (
                          format(formData.booking_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.booking_date}
                        onSelect={(date) => setFormData(prev => ({ ...prev, booking_date: date }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Time *
                    </Label>
                    <Select 
                      value={formData.start_time} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, start_time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      End Time *
                    </Label>
                    <Select 
                      value={formData.end_time} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, end_time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Submitting..." : "Submit Booking Request"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>Review your booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Booked by:</span>
                  <span className="text-sm font-medium">{user?.full_name}</span>
                </div>
                
                {formData.project_name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Project:</span>
                    <span className="text-sm font-medium">{formData.project_name}</span>
                  </div>
                )}
                
                {formData.manager_name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Manager:</span>
                    <span className="text-sm font-medium">{formData.manager_name}</span>
                  </div>
                )}
                
                {selectedRoom && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Room:</span>
                    <span className="text-sm font-medium">{selectedRoom.room_name}</span>
                  </div>
                )}
                
                {formData.booking_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">
                      {format(formData.booking_date, "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
                
                {formData.start_time && formData.end_time && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <span className="text-sm font-medium">
                      {formData.start_time} - {formData.end_time}
                    </span>
                  </div>
                )}
              </div>
              
              {selectedRoom && (
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Room Details</h4>
                    <div className="text-sm text-muted-foreground">
                      Capacity: {selectedRoom.capacity} people
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                • All bookings require admin approval
              </p>
              <p className="text-xs text-muted-foreground">
                • You'll be notified once your booking is reviewed
              </p>
              <p className="text-xs text-muted-foreground">
                • Pending bookings can be edited or cancelled
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookRoom;