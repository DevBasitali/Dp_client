"use client";

import { useState } from "react";
import { useUsers, SystemUser } from "@/hooks/useUsers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, UserCog, Loader2, Plus } from "lucide-react";
import UserForm from "@/components/users/UserForm";

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState("All");
  const { data: users, isLoading, isError } = useUsers(roleFilter);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<SystemUser | null>(null);

  const handleEdit = (user: SystemUser) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 lg:p-4 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
            <UserCog className="mr-2 text-[#F0A500]" />
            Users
          </h1>
          <p className="text-gray-500 text-sm">Manage system access for your staff and vendors.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="w-full md:w-[180px]">
            <Select value={roleFilter} onValueChange={(val: string | null) => val && setRoleFilter(val)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="branch_manager">Branch Manager</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleAdd} className="bg-[#1B2A4A] hover:bg-slate-800 text-white shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              Failed to load system users.
            </div>
          ) : users?.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-500">
              <UserCog className="w-12 h-12 text-gray-200 mb-2" />
              <p>No users found matching this filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700">Role</TableHead>
                      <TableHead className="font-semibold text-gray-700">Binding (Branch/Vendor)</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-[#1A1A2E]">{u.name}</TableCell>
                        <TableCell className="text-gray-600">{u.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase bg-slate-100 text-slate-800 border">
                            {u.role.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {u.role === 'branch_manager' ? (u.branch?.name || "Unassigned") :
                           u.role === 'vendor' ? (u.vendor?.name || "Unassigned") :
                           "—"}
                        </TableCell>
                        <TableCell>
                          {u.is_active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(u)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3 p-4">
                {users?.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">
                    No users yet. Add your first user above.
                  </p>
                ) : (
                  users?.map((u) => (
                    <div key={u.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#1B2A4A] text-sm">{u.name}</h3>
                            <p className="text-gray-500 text-xs mt-0.5">{u.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "owner" ? "bg-purple-100 text-purple-700" : u.role === "branch_manager" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {u.role === "branch_manager" ? "Manager" : u.role === "vendor" ? "Vendor" : "Owner"}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {u.branch?.name || u.vendor?.name || "—"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#1B2A4A] text-[#1B2A4A] font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <UserForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        userToEdit={userToEdit}
      />
    </div>
  );
}
