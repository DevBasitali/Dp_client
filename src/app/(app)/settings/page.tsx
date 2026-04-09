"use client";

import { useState } from "react";
import { useUsers, useCreateUser } from "@/hooks/useUsers";
import { useBranches } from "@/hooks/useBranches";
import { useVendors } from "@/hooks/useVendors";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Users, Key, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

export default function SettingsHubPage() {
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { data: branches } = useBranches();
  const { data: vendors } = useVendors();
  const createUser = useCreateUser();

  const [activeTab, setActiveTab] = useState("users");
  
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: { name: "", email: "", password: "", role: "branch_manager", branch_id: "", vendor_id: "" }
  });
  const selectedRole = watch("role");

  const onUserSubmit = (data: any) => {
    if (data.role === 'branch_manager' && !data.branch_id) return alert("Select a branch for the manager");
    if (data.role === 'vendor' && !data.vendor_id) return alert("Select a vendor for this user");
    
    createUser.mutate(data, {
      onSuccess: () => {
        reset();
        alert("User created successfully");
      },
      onError: (err: any) => alert(err.response?.data?.message || "Failed to create user")
    });
  };

  return (
    <div className="space-y-8 lg:p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
          <Settings className="mr-2 text-[#F0A500]" />
          System Settings
        </h1>
        <p className="text-gray-500 text-sm">Manage users, access controls, and environment configurations.</p>
      </div>

      {/* Internal Tab Navigation purely built in React State */}
      <div className="flex space-x-2 border-b">
        <button 
          className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-[#1B2A4A] text-[#1B2A4A]' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab("users")}
        >
          <Users className="w-4 h-4 inline-block mr-2 text-current" />
          Access Management
        </button>
        <button 
          className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'whatsapp' ? 'border-b-2 border-[#1B2A4A] text-[#1B2A4A]' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab("whatsapp")}
        >
          <MessageCircle className="w-4 h-4 inline-block mr-2 text-current" />
          WhatsApp API
        </button>
      </div>

      {/* Users Tab Panel */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-0 bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">Create User</CardTitle>
                <CardDescription>Grant access to a Manager or Vendor.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onUserSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...register("name")} required placeholder="e.g. Ali Ahmed" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Strategy</Label>
                    <Input type="email" {...register("email")} required placeholder="branch1@dp.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Temporary Password</Label>
                    <Input type="password" {...register("password")} required placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select onValueChange={(val: string | null) => val && setValue("role", val)} defaultValue="branch_manager">
                      <SelectTrigger><SelectValue placeholder="System Role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="branch_manager">Branch Manager</SelectItem>
                        <SelectItem value="vendor">Vendor Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRole === 'branch_manager' && (
                    <div className="space-y-2">
                      <Label>Assign to Branch</Label>
                      <Select onValueChange={(val: string | null) => val && setValue("branch_id", val)}>
                        <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                        <SelectContent>
                          {branches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedRole === 'vendor' && (
                    <div className="space-y-2">
                      <Label>Bind to Vendor Record</Label>
                      <Select onValueChange={(val: string | null) => val && setValue("vendor_id", val)}>
                        <SelectTrigger><SelectValue placeholder="Select Vendor Profile" /></SelectTrigger>
                        <SelectContent>
                          {vendors?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-[#1B2A4A] mt-4" disabled={createUser.isPending}>
                    {createUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                    Provision Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Binding</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-gray-500">{u.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase bg-slate-100 text-slate-800">
                              {u.role.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 font-medium">
                            {u.role === 'branch_manager' ? u.branch?.name : u.role === 'vendor' ? u.vendor?.name : "System"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* WhatsApp Configuration Tab Panel */}
      {activeTab === 'whatsapp' && (
        <Card className="shadow-sm border-0 max-w-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">WhatsApp API Integration</CardTitle>
            <CardDescription>
              Backend system relies on environment variables (`MAYTAPI_PRODUCT_ID`) to fire automated alerts. 
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">
                WhatsApp API properties are currently heavily injected into your Render deployment environment. 
                Contact the server admin to update the Maytapi session tokens natively in the cloud dashboard.
              </p>
            </div>
            
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <Label>Maytapi Product ID</Label>
              <Input disabled value="cfg_env_injected_*****" />
            </div>
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <Label>Maytapi Token</Label>
              <Input disabled value="token_injected_*****" type="password" />
            </div>
            <Button disabled className="w-full">Variables Managed by Render Cloud</Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
