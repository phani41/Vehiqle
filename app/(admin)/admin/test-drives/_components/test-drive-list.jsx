"use client";

import { useEffect, useState } from "react";
import { getAdminTestDrives, updateTestDriveStatus } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

const statuses = ["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export function TestDrivesList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const {
    data: bookingsResult,
    loading: loadingBookings,
    error: bookingsError,
    fn: fetchBookings,
  } = useFetch(getAdminTestDrives);
  const {
    data: updateResult,
    error: updateError,
    loading: updatingBooking,
    fn: updateBookingStatus,
  } = useFetch(updateTestDriveStatus);

  useEffect(() => {
    fetchBookings({ search, status });
  }, [fetchBookings, search, status]);

  useEffect(() => {
    if (bookingsError) {
      toast.error(bookingsError.message || "Failed to load test drives");
    }

    if (updateError) {
      toast.error(updateError.message || "Failed to update test drive");
    }
  }, [bookingsError, updateError]);

  useEffect(() => {
    if (updateResult?.success) {
      toast.success(updateResult.message || "Test drive updated");
      fetchBookings({ search, status });
    }
  }, [fetchBookings, search, status, updateResult]);

  const bookings = bookingsResult?.success ? bookingsResult.data : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by car or user"
        />
        <select
          className="h-10 rounded-md border px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {statuses.map((value) => (
            <option key={value || "ALL"} value={value}>
              {value || "All statuses"}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.car.make} {booking.car.model}</TableCell>
                  <TableCell>{booking.user.name || booking.user.email}</TableCell>
                  <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                  <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingBooking || booking.status === "CONFIRMED"}
                        onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingBooking || booking.status === "CANCELLED"}
                        onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loadingBookings && bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No test drives found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}