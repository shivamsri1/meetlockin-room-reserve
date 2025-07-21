import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { useBookings, useRooms } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bookingsResponse, loading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const { data: roomsResponse } = useRooms();
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  console.log('Bookings response:', bookingsResponse);
  console.log('Rooms response:', roomsResponse);

  // Extract arrays from API responses and map room names to bookings
  const bookings = React.useMemo(() => {
    if (!bookingsResponse || !roomsResponse) return [];
    
    const bookingsArray = bookingsResponse.bookings_all || [];
    const roomsArray = roomsResponse.rooms_all || [];
    
    return bookingsArray.map((booking: any) => {
      const room = roomsArray.find((r: any) => r.id === booking.room_id);
      return {
        ...booking,
        room_name: room?.room_name || 'Unknown Room'
      };
    });
  }, [bookingsResponse, roomsResponse]);

  useEffect(() => {
    let filtered = bookings;

    // Filter by user if not admin
    if (!isAdmin) {
      filtered = filtered.filter(booking => booking.booked_by === user?.email);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.manager_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.approval_status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, isAdmin, user?.email]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'pending':
        return 'pending';
      default:
        return 'default';
    }
  };

  const handleApprove = async (bookingId: number) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await apiService.updateBooking(bookingId, {
          ...booking,
          approval_status: 'approved'
        });
        await refetchBookings();
        toast({
          title: "Booking approved",
          description: "The booking has been approved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (bookingId: number) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await apiService.updateBooking(bookingId, {
          ...booking,
          approval_status: 'rejected'
        });
        await refetchBookings();
        toast({
          title: "Booking rejected",
          description: "The booking has been rejected.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (bookingId: number) => {
    navigate(`/edit-booking/${bookingId}`);
  };

  const handleDelete = async (bookingId: number) => {
    try {
      await apiService.deleteBooking(bookingId);
      await refetchBookings();
      toast({
        title: "Booking deleted",
        description: "The booking has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pendingCount = bookings.filter(b => b.approval_status === 'pending').length;
  const approvedCount = bookings.filter(b => b.approval_status === 'approved').length;
  const totalRooms = roomsResponse?.rooms_all?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all bookings and rooms' : 'View and manage your bookings'}
          </p>
        </div>
        <Button onClick={() => navigate('/book-room')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Book Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Pending Bookings' : 'My Pending Bookings'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Approved Bookings' : 'My Approved Bookings'}
            </CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              Conference rooms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isAdmin ? 'All Bookings' : 'My Bookings'}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Manage all conference room bookings across the organization'
              : 'View and manage your conference room reservations'
            }
          </CardDescription>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Date & Time</TableHead>
                  {isAdmin && <TableHead>Booked By</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.project_name}</TableCell>
                    <TableCell>{booking.room_name}</TableCell>
                    <TableCell>{booking.manager_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{booking.booking_date}</div>
                        <div className="text-muted-foreground">
                          {booking.start_time} - {booking.end_time}
                        </div>
                      </div>
                    </TableCell>
                    {isAdmin && <TableCell>{booking.booked_by}</TableCell>}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.approval_status)}>
                        {booking.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isAdmin && booking.approval_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(booking.id)}
                              className="text-success hover:text-success"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(booking.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!isAdmin && booking.approval_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(booking.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {((isAdmin) || (!isAdmin && booking.approval_status === 'pending')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(booking.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Start by booking your first conference room'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => navigate('/book-room')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Room
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
