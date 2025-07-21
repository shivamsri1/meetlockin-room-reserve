
import React, { useState } from 'react';
import { apiService } from '@/lib/api';
import { useRooms } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const RoomManagement = () => {
  const { data: roomsResponse, loading, refetch } = useRooms();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [newRoom, setNewRoom] = useState({ room_name: '', capacity: '' });
  const { toast } = useToast();

  const rooms = roomsResponse?.rooms_all || [];

  const handleAddRoom = async () => {
    if (!newRoom.room_name.trim()) {
      toast({
        title: "Missing room name",
        description: "Please enter a room name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const id = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
      await apiService.createRoom({
        id,
        room_name: newRoom.room_name,
      });
      
      await refetch();
      setNewRoom({ room_name: '', capacity: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Room added",
        description: `${newRoom.room_name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditRoom = async () => {
    if (!editingRoom?.room_name.trim()) {
      toast({
        title: "Missing room name",
        description: "Please enter a room name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.updateRoom(editingRoom.id, {
        room_name: editingRoom.room_name,
      });
      
      await refetch();
      setIsEditDialogOpen(false);
      setEditingRoom(null);
      
      toast({
        title: "Room updated",
        description: `${editingRoom.room_name} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      await apiService.deleteRoom(roomId);
      await refetch();
      
      toast({
        title: "Room deleted",
        description: `${room?.room_name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (room: any) => {
    setEditingRoom({ ...room, capacity: (room.capacity || 0).toString() });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Management</h1>
          <p className="text-muted-foreground">
            Manage conference rooms and their configurations
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>
                Create a new conference room for booking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room_name">Room Name</Label>
                <Input
                  id="room_name"
                  placeholder="Enter room name"
                  value={newRoom.room_name}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, room_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Enter room capacity"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRoom}>Add Room</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Conference rooms available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((sum, room) => sum + (room.capacity || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              People across all rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + (room.capacity || 0), 0) / rooms.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              People per room
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Conference Rooms
          </CardTitle>
          <CardDescription>
            Manage your organization's conference rooms and meeting spaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.room_name}</TableCell>
                    <TableCell>{room.capacity || 0} people</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {rooms.length === 0 && !loading && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No rooms found</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first conference room
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update the room details.
            </DialogDescription>
          </DialogHeader>
          {editingRoom && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_room_name">Room Name</Label>
                <Input
                  id="edit_room_name"
                  placeholder="Enter room name"
                  value={editingRoom.room_name}
                  onChange={(e) => setEditingRoom(prev => ({ ...prev, room_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_capacity">Capacity</Label>
                <Input
                  id="edit_capacity"
                  type="number"
                  placeholder="Enter room capacity"
                  value={editingRoom.capacity}
                  onChange={(e) => setEditingRoom(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRoom}>Update Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
