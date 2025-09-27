import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBannedDevices, useDeviceSessions, useBanDevice, useUnbanDevice } from '@/hooks/useDeviceManagement';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, Monitor, Users, Ban, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DeviceManagement() {
  const { data: bannedDevices = [], isLoading: loadingBanned } = useBannedDevices();
  const { data: deviceSessions = [], isLoading: loadingSessions } = useDeviceSessions();
  const banDeviceMutation = useBanDevice();
  const unbanDeviceMutation = useUnbanDevice();
  const { toast } = useToast();

  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deviceToBan, setDeviceToBan] = useState('');
  const [banReason, setBanReason] = useState('');

  const handleBanDevice = async () => {
    if (!deviceToBan.trim()) {
      toast({
        title: "Error",
        description: "Please enter a device fingerprint",
        variant: "destructive",
      });
      return;
    }

    try {
      await banDeviceMutation.mutateAsync({
        fingerprint: deviceToBan.trim(),
        reason: banReason.trim() || undefined,
      });
      
      toast({
        title: "Device Banned",
        description: "The device has been successfully banned",
      });
      
      setBanDialogOpen(false);
      setDeviceToBan('');
      setBanReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban device",
        variant: "destructive",
      });
    }
  };

  const handleUnbanDevice = async (deviceId: string) => {
    try {
      await unbanDeviceMutation.mutateAsync(deviceId);
      toast({
        title: "Device Unbanned",
        description: "The device has been successfully unbanned",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unban device",
        variant: "destructive",
      });
    }
  };

  const activeBannedDevices = bannedDevices.filter(device => device.is_active);
  const uniqueActiveSessions = deviceSessions.filter(session => 
    !activeBannedDevices.some(banned => banned.device_fingerprint === session.device_fingerprint)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Device Management</h1>
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Ban className="mr-2 h-4 w-4" />
              Ban Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="device-fingerprint">Device Fingerprint</Label>
                <Input
                  id="device-fingerprint"
                  value={deviceToBan}
                  onChange={(e) => setDeviceToBan(e.target.value)}
                  placeholder="Enter device fingerprint to ban"
                />
              </div>
              <div>
                <Label htmlFor="ban-reason">Reason (optional)</Label>
                <Textarea
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for banning this device"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBanDevice}
                  disabled={banDeviceMutation.isPending}
                >
                  Ban Device
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueActiveSessions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Devices</CardTitle>
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBannedDevices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceSessions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Banned Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldOff className="mr-2 h-5 w-5" />
            Banned Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBanned ? (
            <div>Loading banned devices...</div>
          ) : activeBannedDevices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No banned devices found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Fingerprint</TableHead>
                  <TableHead>Banned Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBannedDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-mono text-sm">
                      {device.device_fingerprint.substring(0, 16)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(device.banned_at), 'PPp')}
                    </TableCell>
                    <TableCell>{device.reason || 'No reason provided'}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Banned</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanDevice(device.id)}
                        disabled={unbanDeviceMutation.isPending}
                      >
                        Unban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Active Device Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            Active Device Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div>Loading device sessions...</div>
          ) : uniqueActiveSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active device sessions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Fingerprint</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueActiveSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-sm">
                      {session.device_fingerprint.substring(0, 16)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {session.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{session.ip_address || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(new Date(session.last_seen_at), 'PPp')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeviceToBan(session.device_fingerprint);
                          setBanDialogOpen(true);
                        }}
                      >
                        Ban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}